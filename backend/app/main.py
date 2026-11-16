import re
import spacy
from spacy.matcher import PhraseMatcher
import hashlib
import json
import os
import re
import secrets
import uuid
from datetime import datetime, timezone
from urllib.parse import quote_plus

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import (
    AnalysisHistory, CareerMatch, JobDescription, LearningRoadmap, Recommendation,
    Resume, Skill, SkillGapAnalysis, User, UserSkill,
)
from .schemas import (
    EmailRequest, JobRequest, LoginRequest, MatchingRequest, RecommendationRequest,
    RegisterRequest, ResumeRequest, RoadmapRequest, SkillGapRequest,
)

# Career IDs and skill requirements match src/data/careers.ts.
CAREERS = [
    {"id": "software-developer", "title": "Software Developer", "technical": ["Python", "Java", "Git", "SQL", "Testing", "REST API", "Data Structures"], "soft": ["Problem Solving", "Communication", "Teamwork", "Time Management"]},
    {"id": "frontend-developer", "title": "Frontend Developer", "technical": ["HTML", "CSS", "JavaScript", "React", "Git", "REST API", "Testing"], "soft": ["Creativity", "Communication", "Attention to Detail", "Teamwork"]},
    {"id": "backend-developer", "title": "Backend Developer", "technical": ["Python", "SQL", "REST API", "Git", "Testing", "System Design", "Docker"], "soft": ["Problem Solving", "Communication", "Teamwork", "Critical Thinking"]},
    {"id": "full-stack-developer", "title": "Full Stack Developer", "technical": ["JavaScript", "React", "Node.js", "SQL", "Git", "REST API", "Testing"], "soft": ["Problem Solving", "Communication", "Adaptability", "Teamwork"]},
    {"id": "data-scientist", "title": "Data Scientist", "technical": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "Data Visualization"], "soft": ["Communication", "Critical Thinking", "Problem Solving", "Creativity"]},
    {"id": "machine-learning-engineer", "title": "Machine Learning Engineer", "technical": ["Python", "Machine Learning", "Deep Learning", "Statistics", "Git", "Docker", "Model Deployment"], "soft": ["Problem Solving", "Critical Thinking", "Communication", "Adaptability"]},
    {"id": "ai-engineer", "title": "AI Engineer", "technical": ["Python", "Machine Learning", "NLP", "Generative AI", "REST API", "Git", "Cloud Computing"], "soft": ["Creativity", "Problem Solving", "Communication", "Adaptability"]},
    {"id": "cybersecurity-analyst", "title": "Cybersecurity Analyst", "technical": ["Network Security", "Security Analysis", "Linux", "Python", "Vulnerability Assessment", "Scripting"], "soft": ["Critical Thinking", "Attention to Detail", "Communication", "Time Management"]},
    {"id": "cloud-engineer", "title": "Cloud Engineer", "technical": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "Terraform"], "soft": ["Problem Solving", "Teamwork", "Communication", "Adaptability"]},
    {"id": "mobile-application-developer", "title": "Mobile Application Developer", "technical": ["Flutter", "React Native", "Dart", "Git", "REST API", "Testing"], "soft": ["Creativity", "Attention to Detail", "Communication", "Problem Solving"]},
    {"id": "database-administrator", "title": "Database Administrator", "technical": ["SQL", "Database Design", "MySQL", "PostgreSQL", "Linux", "Scripting", "Security Analysis"], "soft": ["Attention to Detail", "Problem Solving", "Communication", "Time Management"]},
    {"id": "ui-ux-designer", "title": "UI/UX Designer", "technical": ["Figma", "Prototyping", "User Research", "HTML", "CSS", "Design Systems"], "soft": ["Creativity", "Communication", "Empathy", "Attention to Detail"]},
]
CATEGORY_MAP = {
    "Python": "Programming Languages", "Java": "Programming Languages", "JavaScript": "Programming Languages",
    "TypeScript": "Programming Languages", "Dart": "Programming Languages", "C++": "Programming Languages",
    "HTML": "Web Development", "CSS": "Web Development", "React": "Web Development", "Node.js": "Web Development",
    "REST API": "Web Development", "Flutter": "Mobile Development", "React Native": "Mobile Development",
    "SQL": "Database", "MySQL": "Database", "PostgreSQL": "Database", "Database Design": "Database",
    "Statistics": "Data Science", "Pandas": "Data Science", "Data Visualization": "Data Science",
    "Machine Learning": "Artificial Intelligence", "Deep Learning": "Artificial Intelligence",
    "NLP": "Artificial Intelligence", "Generative AI": "Artificial Intelligence",
    "Network Security": "Cybersecurity", "Security Analysis": "Cybersecurity",
    "Vulnerability Assessment": "Cybersecurity", "AWS": "Cloud Computing", "Docker": "Cloud Computing",
    "Kubernetes": "Cloud Computing", "Terraform": "Cloud Computing", "Cloud Computing": "Cloud Computing",
    "Git": "Development Tools", "Testing": "Development Tools", "Linux": "Development Tools", "Figma": "Development Tools",
}
SOFT_SKILLS = {skill for career in CAREERS for skill in career["soft"]}
ALL_SKILLS = sorted({skill for career in CAREERS for skill in career["technical"] + career["soft"]}, key=len, reverse=True)


# ------------------------ NLP Skill Extraction ------------------------

# Create a lightweight English NLP pipeline.
# No large pretrained model download is required.
nlp = spacy.blank("en")

# Match skill names without considering uppercase/lowercase.
SKILL_MATCHER = PhraseMatcher(nlp.vocab, attr="LOWER")

# Common skill abbreviations and alternative names.
SKILL_ALIASES = {
    "JS": "JavaScript",
    "Node JS": "Node.js",
    "NodeJS": "Node.js",
    "REST APIs": "REST API",
    "RESTful API": "REST API",
    "ML": "Machine Learning",
    "Natural Language Processing": "NLP",
    "GenAI": "Generative AI",
    "Postgres": "PostgreSQL",
    "Amazon Web Services": "AWS",
    "C plus plus": "C++",
    "CI CD": "CI/CD",
}

# Build a collection of phrases for each canonical skill.
for skill in ALL_SKILLS:
    phrases = [skill]

    for alias, canonical in SKILL_ALIASES.items():
        if canonical == skill:
            phrases.append(alias)

    patterns = [nlp.make_doc(phrase) for phrase in phrases]
    SKILL_MATCHER.add(skill, patterns)


app = FastAPI(title="CareerReady AI API", version="1.1.0")
cors_origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if item.strip()]
app.add_middleware(CORSMiddleware, allow_origins=cors_origins or ["http://localhost:5173"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

# Use a long random SECRET_KEY in Render environment variables.
SECRET_KEY = os.getenv("SECRET_KEY", "development-only-change-this-secret")
token_serializer = URLSafeTimedSerializer(SECRET_KEY, salt="careeready-auth")
bearer_scheme = HTTPBearer(auto_error=False)
Base.metadata.create_all(bind=engine)


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9+#. ]", " ", (value or "").lower()).strip()


def contains_term(text: str, term: str) -> bool:
    text_norm, term_norm = normalize(text), normalize(term)
    return bool(term_norm) and re.search(r"(?<![a-z0-9])" + re.escape(term_norm) + r"(?![a-z0-9])", text_norm) is not None


def get_career(career_id: str):
    for career in CAREERS:
        if career["id"] == career_id:
            return career
    raise HTTPException(status_code=404, detail="Career not found")


def make_token(user: User) -> str:
    return token_serializer.dumps({"user_id": user.id})


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: Session = Depends(get_db)) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Please log in again. Authentication token is missing.")
    try:
        data = token_serializer.loads(credentials.credentials, max_age=60 * 60 * 24 * 7)
        user_id = int(data["user_id"])
    except (BadSignature, SignatureExpired, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Your session expired. Please log in again.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please log in again.")
    return user


def auth_response(user: User) -> dict:
    return {"id": str(user.id), "email": user.email, "fullName": user.full_name, "accessToken": make_token(user), "tokenType": "bearer"}


def save_history(db: Session, user_id: int, kind: str, source_text: str, result: dict | list):
    db.add(AnalysisHistory(user_id=user_id, analysis_type=kind, input_text=(source_text or "")[:12000], result_json=json.dumps(result)))
    db.commit()


def ensure_skill_catalog(db: Session):
    for name in {skill for career in CAREERS for skill in career["technical"] + career["soft"]}:
        exists = db.query(Skill).filter(Skill.name == name).first()
        if not exists:
            db.add(Skill(name=name, category=CATEGORY_MAP.get(name, "Soft Skills" if name in SOFT_SKILLS else "Development Tools")))
    db.commit()


def save_user_skills(db: Session, user_id: int, extracted: list[dict], source: str = "resume"):
    ensure_skill_catalog(db)
    for item in extracted:
        skill = db.query(Skill).filter(Skill.name == item["name"]).first()
        if not skill:
            continue
        existing = db.query(UserSkill).filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill.id, UserSkill.source == source).first()
        if existing:
            existing.confidence = item.get("confidence", 0)
        else:
            db.add(UserSkill(user_id=user_id, skill_id=skill.id, source=source, confidence=item.get("confidence", 0)))
    db.commit()



def extract_resume(text: str, filename: str) -> dict:
    # Process resume text using spaCy.
    doc = nlp(text or "")

    # Find matching skills.
    matches = SKILL_MATCHER(doc)

    # Count how many times each skill appears.
    skill_counts = {}

    for match_id, start, end in matches:
        skill_name = nlp.vocab.strings[match_id]
        skill_counts[skill_name] = skill_counts.get(skill_name, 0) + 1

    # Build the extracted skill list.
    extracted = []

    for skill in ALL_SKILLS:
        if skill in skill_counts:
            count = skill_counts[skill]

            extracted.append({
                "name": skill,
                "category": CATEGORY_MAP.get(
                    skill,
                    "Soft Skills" if skill in SOFT_SKILLS else "Development Tools"
                ),
                "confidence": min(98, 65 + count * 7)
            })

    # Separate technical and soft skills.
    technical = [
        skill for skill in extracted
        if skill["name"] not in SOFT_SKILLS
    ]

    soft = [
        skill for skill in extracted
        if skill["name"] in SOFT_SKILLS
    ]

    # Extract education, experience, and projects.
    education = []
    experiences = []
    projects = []

    for line in text.splitlines():
        clean = line.strip()

        if not clean:
            continue

        if re.search(
            r"university|college|bachelor|master|degree|b\.sc|m\.sc",
            clean,
            re.I
        ):
            education.append({"details": clean[:240]})

        if re.search(
            r"intern|developer|engineer|manager|analyst|experience|worked",
            clean,
            re.I
        ):
            experiences.append({"summary": clean[:300]})

        if re.search(
            r"project|built|developed|created",
            clean,
            re.I
        ):
            projects.append(clean[:240])

    return {
        "id": str(uuid.uuid4()),
        "fileName": filename,
        "analyzedAt": datetime.now(timezone.utc).isoformat(),
        "extractedSkills": extracted,
        "technicalSkills": technical,
        "softSkills": soft,
        "education": education[:5],
        "experiences": experiences[:5],
        "projects": projects[:8],
        "keywords": [skill["name"] for skill in extracted],
        "rawTextPreview": text[:1200],
        "source": "backend"
    }
    extracted = []
    for skill in ALL_SKILLS:
        if contains_term(text, skill):
            extracted.append({"name": skill, "category": CATEGORY_MAP.get(skill, "Soft Skills" if skill in SOFT_SKILLS else "Development Tools"), "confidence": min(98, 65 + text.lower().count(skill.lower()) * 7)})
    technical = [s for s in extracted if s["name"] not in SOFT_SKILLS]
    soft = [s for s in extracted if s["name"] in SOFT_SKILLS]
    education, experiences, projects = [], [], []
    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            continue
        if re.search(r"university|college|bachelor|master|degree|b\.sc|m\.sc", clean, re.I): education.append({"details": clean[:240]})
        if re.search(r"intern|developer|engineer|manager|analyst|experience|worked", clean, re.I): experiences.append({"summary": clean[:300]})
        if re.search(r"project|built|developed|created", clean, re.I): projects.append(clean[:240])
    return {"id": str(uuid.uuid4()), "fileName": filename, "analyzedAt": datetime.now(timezone.utc).isoformat(), "extractedSkills": extracted, "technicalSkills": technical, "softSkills": soft, "education": education[:5], "experiences": experiences[:5], "projects": projects[:8], "keywords": [s["name"] for s in extracted], "rawTextPreview": text[:1200], "source": "backend"}


def calculate_gap(career: dict, skills: list[str]) -> dict:
    known = {normalize(skill) for skill in skills}
    required = career["technical"] + career["soft"]
    matched = [skill for skill in required if normalize(skill) in known]
    missing = [skill for skill in required if skill not in matched]
    technical_matched = [s for s in career["technical"] if s in matched]
    soft_matched = [s for s in career["soft"] if s in matched]
    return {"careerId": career["id"], "careerTitle": career["title"], "matchedSkills": matched, "missingSkills": missing, "weakSkills": [], "technicalMatched": technical_matched, "technicalMissing": [s for s in career["technical"] if s not in matched], "softMatched": soft_matched, "softMissing": [s for s in career["soft"] if s not in matched], "coverage": round(100 * len(matched) / max(1, len(required)))}


def calculate_readiness(gap: dict) -> dict:
    technical_total = len(gap["technicalMatched"]) + len(gap["technicalMissing"])
    soft_total = len(gap["softMatched"]) + len(gap["softMissing"])
    required_score = gap["coverage"]
    technical_score = round(100 * len(gap["technicalMatched"]) / max(1, technical_total))
    soft_score = round(100 * len(gap["softMatched"]) / max(1, soft_total))
    return {"overall": round(required_score * 0.5 + technical_score * 0.3 + soft_score * 0.2), "breakdown": [
        {"key": "required", "label": "Required skills", "score": required_score, "weight": 0.5, "explanation": "Percentage of required career skills found in the resume."},
        {"key": "technical", "label": "Technical skills", "score": technical_score, "weight": 0.3, "explanation": "Coverage of the career's required technical skills."},
        {"key": "soft", "label": "Soft skills", "score": soft_score, "weight": 0.2, "explanation": "Coverage of the career's required soft skills."},
        {"key": "experience", "label": "Experience", "score": 0, "weight": 0.0, "explanation": "Experience scoring is not implemented in this baseline."},
        {"key": "projects", "label": "Projects", "score": 0, "weight": 0.0, "explanation": "Project scoring is not implemented in this baseline."},
    ], "disclaimer": "This is an educational estimate based on skill overlap, not a hiring decision."}


def rank_careers(skills: list[str]) -> list[dict]:
    known = {normalize(skill) for skill in skills}
    ranked = []
    for career in CAREERS:
        required = career["technical"] + career["soft"]
        shared = [s for s in required if normalize(s) in known]
        ranked.append({"careerId": career["id"], "careerTitle": career["title"], "score": round(100 * len(shared) / max(1, len(required))), "explanation": f"{len(shared)} of {len(required)} listed skills matched.", "sharedSkills": shared})
    return sorted(ranked, key=lambda item: item["score"], reverse=True)


@app.get("/")
def root():
    return {"message": "CareerReady AI API is running", "docs": "/docs"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database connection failed.") from exc


@app.post("/api/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    salt = secrets.token_hex(16)
    password_hash = salt + "$" + hashlib.pbkdf2_hmac("sha256", payload.password.encode(), salt.encode(), 180000).hex()
    user = User(full_name=payload.fullName, email=email, password_hash=password_hash, university=payload.university, degree=payload.degree, graduation_year=payload.graduationYear)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered.")
    ensure_skill_catalog(db)
    return auth_response(user)


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    try:
        salt, saved_hash = user.password_hash.split("$", 1)
        check_hash = hashlib.pbkdf2_hmac("sha256", payload.password.encode(), salt.encode(), 180000).hex()
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not secrets.compare_digest(saved_hash, check_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    ensure_skill_catalog(db)
    return auth_response(user)


@app.post("/api/auth/forgot-password")
def forgot_password(payload: EmailRequest):
    return {"message": f"If an account exists for {payload.email}, a reset link will be sent. Email delivery is not configured yet."}


@app.post("/api/resume/analyze")
def resume_analyze(payload: ResumeRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = extract_resume(payload.text, payload.filename)
    resume = Resume(user_id=user.id, filename=payload.filename, resume_text=payload.text, extracted_data=result)
    db.add(resume)
    db.flush()
    save_user_skills(db, user.id, result["extractedSkills"])
    save_history(db, user.id, "resume", payload.text, result)
    db.commit()
    return result


@app.post("/api/analysis/skill-gap")
def skill_gap(payload: SkillGapRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    career = get_career(payload.career_id)
    gap, readiness = calculate_gap(career, payload.skills), None
    readiness = calculate_readiness(gap)
    db.add(SkillGapAnalysis(user_id=user.id, career_id=payload.career_id, matched_skills=gap["matchedSkills"], missing_skills=gap["missingSkills"], readiness_score=readiness["overall"], result_data={"gap": gap, "readiness": readiness}))
    save_history(db, user.id, "skill-gap", payload.career_id, {"gap": gap, "readiness": readiness})
    db.commit()
    return {"gap": gap, "readiness": readiness}


@app.post("/api/matching/rank")
def matching(payload: MatchingRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = rank_careers(payload.skills)
    latest_resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.id.desc()).first()
    for item in result:
        db.add(CareerMatch(user_id=user.id, resume_id=latest_resume.id if latest_resume else None, career_id=item["careerId"], match_score=item["score"], result_data=item))
    save_history(db, user.id, "career-matching", payload.resume_text, result)
    db.commit()
    return result


@app.post("/api/recommendations")
def recommendations(payload: RecommendationRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    career = get_career(payload.career_id)
    items = [{"id": str(uuid.uuid4()), "type": "study_plan" if i < 3 else "project", "title": f"Improve {skill}", "body": f"Learn the fundamentals of {skill}, practise with guided exercises, and build a small portfolio project that demonstrates what you learned.", "priority": "high" if i < 3 else "medium"} for i, skill in enumerate(payload.missing_skills[:8])]
    if not items:
        items = [{"id": str(uuid.uuid4()), "type": "career_advice", "title": f"Continue developing as a {career['title']}", "body": "Build practical projects, document your work, and practise explaining your technical decisions.", "priority": "medium"}]
    db.add(Recommendation(user_id=user.id, career_id=payload.career_id, recommendation_data=items))
    save_history(db, user.id, "recommendations", payload.career_id, items)
    db.commit()
    return {"recommendations": items}


@app.post("/api/roadmap")
def roadmap(payload: RoadmapRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    career = get_career(payload.career_id)
    missing = payload.missing_skills[:9]
    chunks = [missing[i:i + 3] for i in range(0, len(missing), 3)] or [payload.existing_skills[:3]]
    phases = []
    for number, skills in enumerate(chunks, start=1):
        phases.append({"id": str(uuid.uuid4()), "phaseNumber": number, "title": f"Phase {number}: Build {career['title']} skills", "objectives": [f"Understand the fundamentals of {skill}" for skill in skills] or ["Review your current skills and complete a practical portfolio project."], "resources": [{"title": f"{skill} learning resources", "url": "https://www.google.com/search?q=" + quote_plus(skill + " official documentation"), "type": "documentation"} for skill in skills], "estimatedTime": "2–3 weeks", "skills": skills})
    db.add(LearningRoadmap(user_id=user.id, career_id=payload.career_id, roadmap_data=phases))
    save_history(db, user.id, "roadmap", payload.career_id, phases)
    db.commit()
    return {"phases": phases}


@app.post("/api/job/analyze")
def job_analyze(payload: JobRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    required = [skill for skill in ALL_SKILLS if contains_term(payload.description, skill)]
    technical = [s for s in required if s not in SOFT_SKILLS]
    soft = [s for s in required if s in SOFT_SKILLS]
    resume_skills = {normalize(s) for s in payload.resume_skills}
    matched = [s for s in required if normalize(s) in resume_skills]
    missing = [s for s in required if s not in matched]
    lines = [line.strip() for line in payload.description.splitlines() if line.strip()]
    result = {"id": str(uuid.uuid4()), "title": (lines[0] if lines else "Job description")[:100], "requiredSkills": required, "technicalSkills": technical, "softSkills": soft, "experienceRequirements": [line for line in lines if re.search(r"years? of experience|experience required|senior|junior", line, re.I)][:5], "educationRequirements": [line for line in lines if re.search(r"degree|bachelor|master|university|college", line, re.I)][:5], "missingQualifications": missing, "matchedQualifications": matched, "recommendations": [f"Develop practical evidence for {skill}." for skill in missing[:5]], "source": "backend"}
    db.add(JobDescription(user_id=user.id, title=result["title"], description=payload.description, extracted_data=result))
    save_history(db, user.id, "job-description", payload.description, result)
    db.commit()
    return result
