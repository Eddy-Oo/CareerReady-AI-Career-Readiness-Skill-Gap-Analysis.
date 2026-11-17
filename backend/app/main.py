import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

ai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
import spacy
from spacy.matcher import PhraseMatcher
import joblib
from pathlib import Path
import hashlib
import json
import os
import re
import secrets
import uuid

from datetime import datetime, timezone
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

ai_client = (
    genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(timeout=60000)
    )
    if GEMINI_API_KEY
    else None
)

from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import (
    AnalysisHistory, CareerMatch, CareerPrediction, JobDescription, LearningRoadmap, Recommendation,
    Resume, Skill, SkillGapAnalysis, User, UserSkill,
)
from .schemas import (
    CareerAdviceRequest,
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

# Machine Learning Model

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "ml"
    / "artifacts"
    / "career_role_model.joblib"
)

try:
    ROLE_MODEL = joblib.load(MODEL_PATH)
    print("ML career prediction model loaded successfully!")

except Exception as error:
    ROLE_MODEL = None
    print("ML model could not be loaded:", error)

app = FastAPI(title="CareerReady AI API", version="1.1.0")
cors_origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if item.strip()]
# The frontend uses bearer tokens (not cookies), so wildcard origins are safe here.
# This avoids browser NetworkError when a production frontend domain is not listed in CORS_ORIGINS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use a long random SECRET_KEY in Render environment variables.
SECRET_KEY = os.getenv("SECRET_KEY", "development-only-change-this-secret")
token_serializer = URLSafeTimedSerializer(SECRET_KEY, salt="careeready-auth")
bearer_scheme = HTTPBearer(auto_error=False)
Base.metadata.create_all(bind=engine)

# Keep existing Neon databases in sync with model columns.
# create_all() creates missing tables but does not add columns to existing tables.
if engine.dialect.name == "postgresql":
    with engine.begin() as connection:
        connection.execute(text("""
            ALTER TABLE career_predictions
            ADD COLUMN IF NOT EXISTS resume_id BIGINT
            REFERENCES resumes(id) ON DELETE SET NULL
        """))


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


@app.get("/api/account/data")
def get_account_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Return the signed-in user's latest saved workspace data."""
    latest_resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(Resume.id.desc()).first()

    latest_gap = db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.user_id == user.id
    ).order_by(SkillGapAnalysis.id.desc()).first()

    latest_prediction = db.query(CareerPrediction).filter(
        CareerPrediction.user_id == user.id
    ).order_by(CareerPrediction.id.desc()).first()

    return {
        "analysis": latest_resume.extracted_data if latest_resume else None,
        "selectedCareerId": latest_gap.career_id if latest_gap else None,
        "prediction": latest_prediction.result_data if latest_prediction else None,
    }


@app.get("/")
def root():
    return {"message": "CareerReady AI API is running", "docs": "/docs"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "database_type": engine.dialect.name}
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
    # Keep one current snapshot per user and target career instead of duplicate rows.
    db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.user_id == user.id,
        SkillGapAnalysis.career_id == payload.career_id
    ).delete(synchronize_session=False)
    db.add(SkillGapAnalysis(user_id=user.id, career_id=payload.career_id, matched_skills=gap["matchedSkills"], missing_skills=gap["missingSkills"], readiness_score=readiness["overall"], result_data={"gap": gap, "readiness": readiness}))
    save_history(db, user.id, "skill-gap", payload.career_id, {"gap": gap, "readiness": readiness})
    db.commit()
    return {"gap": gap, "readiness": readiness}


@app.post("/api/matching/rank")
def matching(payload: MatchingRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = rank_careers(payload.skills)
    latest_resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.id.desc()).first()
    if latest_resume:
        db.query(CareerMatch).filter(
            CareerMatch.user_id == user.id,
            CareerMatch.resume_id == latest_resume.id
        ).delete(synchronize_session=False)
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

# ------------------------ ML Career Prediction ------------------------

from fastapi import Body


@app.post("/api/ml/predict")
def predict_career_role(
    resume_text: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if ROLE_MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="ML prediction model is not available."
        )

    if not resume_text or not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty."
        )

    if len(resume_text) > 20000:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too long."
        )

    # Predict the most suitable job role.
    prediction = ROLE_MODEL.predict([resume_text])[0]

    # Get prediction probabilities.
    probabilities = ROLE_MODEL.predict_proba([resume_text])[0]

    # Sort the three highest predictions.
    classes = ROLE_MODEL.classes_

    ranked_predictions = sorted(
        zip(classes, probabilities),
        key=lambda item: item[1],
        reverse=True
    )[:3]

    top_roles = [
        {
            "jobRole": role,
            "probability": round(float(probability) * 100, 2)
        }
        for role, probability in ranked_predictions
    ]

    result = {
        "predictedJobRole": prediction,
        "topPredictions": top_roles,
        "model": "TF-IDF + Logistic Regression",
        "datasetType": "synthetic",
        "disclaimer": (
            "Experimental prediction based on a synthetic training dataset. "
            "Probabilities are not calibrated confidence scores."
        )
    }

    # Save the latest prediction as a structured row linked to this user and resume.
    latest_resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(Resume.id.desc()).first()
    if latest_resume:
        db.query(CareerPrediction).filter(
            CareerPrediction.user_id == user.id,
            CareerPrediction.resume_id == latest_resume.id
        ).delete(synchronize_session=False)

    db.add(CareerPrediction(
        user_id=user.id,
        resume_id=latest_resume.id if latest_resume else None,
        predicted_role=str(prediction),
        top_predictions=top_roles,
        model_name="TF-IDF + Logistic Regression",
        dataset_type="synthetic",
        result_data=result
    ))

    save_history(
        db, user.id, "ml-career-prediction", resume_text, result
    )
    db.commit()

    return result


# ------------------------ AI Career Advisor ------------------------


# ------------------------ AI Career Advisor ------------------------

@app.post("/api/ai/career-advice")
def generate_career_advice(
    payload: CareerAdviceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if ai_client is None:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service is not configured."
        )

    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty."
        )

    if len(payload.resume_text) > 20000:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too long."
        )

    # Get the authenticated user's name from the database.
    account_name = (user.full_name or "").strip()

    if not account_name:
        account_name = "the user"

    instructions = f"""
    You are a practical career advisor.

    The authenticated user's account name is: {account_name}

    NAME RULES:
    - Address the user using the authenticated account name.
    - Never use a person's name found inside the resume.
    - The resume may be a sample resume belonging to another person.
    - Do not assume the resume owner's name is the logged-in user's name.
    - If the account name is unavailable, do not invent a name.

    Give clear, personalized and realistic career advice.
    Explain why the predicted career may be suitable.
    Discuss existing skills and missing skills.
    Suggest practical projects and a learning plan.
    Do not invent qualifications or experience.

    Treat the ML career prediction as an experimental suggestion,
    not a guaranteed assessment of career suitability.

    Use simple, student-friendly language.

    FORMATTING RULES:
    - Use clear section headings.
    - Use short paragraphs.
    - Use bullet points for lists.
    - Use numbered steps for learning plans.
    - Use bold text only for important terms.
    - Do not use horizontal separator lines.
    """

    prompt = f"""
    {instructions}

    Resume:
    {payload.resume_text}

    Predicted career:
    {payload.predicted_career}

    Existing skills:
    {", ".join(payload.existing_skills)}

    Missing skills:
    {", ".join(payload.missing_skills)}

    Provide personalized career advice for the authenticated user.
    """

    # Generate advice using Gemini.
    try:
        print("Starting Gemini AI request...", flush=True)

        response = ai_client.interactions.create(
            model=GEMINI_MODEL,
            input=prompt
        )

        print("Gemini response received!", flush=True)

        advice = (response.output_text or "").strip()

        print("Gemini response processed!", flush=True)

    except Exception as e:
        print(
            "GEMINI CAREER ADVICE ERROR:",
            type(e).__name__,
            str(e),
            flush=True
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to generate AI career advice. Please try again."
        )

    if not advice:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an empty response."
        )

    # Prepare the API response.
    result = {
        "predictedCareer": payload.predicted_career,
        "advice": advice,
        "existingSkills": payload.existing_skills,
        "missingSkills": payload.missing_skills,
        "model": GEMINI_MODEL
    }

    # Save AI advice to the user's history.
    save_history(
        db,
        user.id,
        "ai-career-advice",
        payload.resume_text,
        result
    )

    return result
