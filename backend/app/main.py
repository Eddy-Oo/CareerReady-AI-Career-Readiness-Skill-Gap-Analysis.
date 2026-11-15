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
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import AnalysisHistory, User
from .schemas import (
    EmailRequest,
    JobRequest,
    LoginRequest,
    MatchingRequest,
    RecommendationRequest,
    RegisterRequest,
    ResumeRequest,
    RoadmapRequest,
    SkillGapRequest,
)

# Career IDs and skill requirements match src/data/careers.ts.
CAREERS = [
    {"id": "software-developer", "title": "Software Developer",
     "technical": ["Python", "Java", "Git", "SQL", "Testing", "REST API", "Data Structures"],
     "soft": ["Problem Solving", "Communication", "Teamwork", "Time Management"]},
    {"id": "frontend-developer", "title": "Frontend Developer",
     "technical": ["HTML", "CSS", "JavaScript", "React", "Git", "REST API", "Testing"],
     "soft": ["Creativity", "Communication", "Attention to Detail", "Teamwork"]},
    {"id": "backend-developer", "title": "Backend Developer",
     "technical": ["Python", "SQL", "REST API", "Git", "Testing", "System Design", "Docker"],
     "soft": ["Problem Solving", "Communication", "Teamwork", "Critical Thinking"]},
    {"id": "full-stack-developer", "title": "Full Stack Developer",
     "technical": ["JavaScript", "React", "Node.js", "SQL", "Git", "REST API", "Testing"],
     "soft": ["Problem Solving", "Communication", "Adaptability", "Teamwork"]},
    {"id": "data-scientist", "title": "Data Scientist",
     "technical": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "Data Visualization"],
     "soft": ["Communication", "Critical Thinking", "Problem Solving", "Creativity"]},
    {"id": "machine-learning-engineer", "title": "Machine Learning Engineer",
     "technical": ["Python", "Machine Learning", "Deep Learning", "Statistics", "Git", "Docker", "Model Deployment"],
     "soft": ["Problem Solving", "Critical Thinking", "Communication", "Adaptability"]},
    {"id": "ai-engineer", "title": "AI Engineer",
     "technical": ["Python", "Machine Learning", "NLP", "Generative AI", "REST API", "Git", "Cloud Computing"],
     "soft": ["Creativity", "Problem Solving", "Communication", "Adaptability"]},
    {"id": "cybersecurity-analyst", "title": "Cybersecurity Analyst",
     "technical": ["Network Security", "Security Analysis", "Linux", "Python", "Vulnerability Assessment", "Scripting"],
     "soft": ["Critical Thinking", "Attention to Detail", "Communication", "Time Management"]},
    {"id": "cloud-engineer", "title": "Cloud Engineer",
     "technical": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "Terraform"],
     "soft": ["Problem Solving", "Teamwork", "Communication", "Adaptability"]},
    {"id": "mobile-application-developer", "title": "Mobile Application Developer",
     "technical": ["Flutter", "React Native", "Dart", "Git", "REST API", "Testing"],
     "soft": ["Creativity", "Attention to Detail", "Communication", "Problem Solving"]},
    {"id": "database-administrator", "title": "Database Administrator",
     "technical": ["SQL", "Database Design", "MySQL", "PostgreSQL", "Linux", "Scripting", "Security Analysis"],
     "soft": ["Attention to Detail", "Problem Solving", "Communication", "Time Management"]},
    {"id": "ui-ux-designer", "title": "UI/UX Designer",
     "technical": ["Figma", "Prototyping", "User Research", "HTML", "CSS", "Design Systems"],
     "soft": ["Creativity", "Communication", "Empathy", "Attention to Detail"]},
]

CATEGORY_MAP = {
    "Python": "Programming Languages", "Java": "Programming Languages",
    "JavaScript": "Programming Languages", "TypeScript": "Programming Languages",
    "Dart": "Programming Languages", "C++": "Programming Languages",
    "HTML": "Web Development", "CSS": "Web Development", "React": "Web Development",
    "Node.js": "Web Development", "REST API": "Web Development",
    "Flutter": "Mobile Development", "React Native": "Mobile Development",
    "SQL": "Database", "MySQL": "Database", "PostgreSQL": "Database",
    "Database Design": "Database", "Statistics": "Data Science",
    "Pandas": "Data Science", "Data Visualization": "Data Science",
    "Machine Learning": "Artificial Intelligence", "Deep Learning": "Artificial Intelligence",
    "NLP": "Artificial Intelligence", "Generative AI": "Artificial Intelligence",
    "Network Security": "Cybersecurity", "Security Analysis": "Cybersecurity",
    "Vulnerability Assessment": "Cybersecurity", "AWS": "Cloud Computing",
    "Docker": "Cloud Computing", "Kubernetes": "Cloud Computing",
    "Terraform": "Cloud Computing", "Cloud Computing": "Cloud Computing",
    "Git": "Development Tools", "Testing": "Development Tools",
    "Linux": "Development Tools", "Figma": "Development Tools",
}
SOFT_SKILLS = {
    skill for career in CAREERS for skill in career["soft"]
}
ALL_SKILLS = sorted(
    {skill for career in CAREERS for skill in career["technical"] + career["soft"]},
    key=len,
    reverse=True,
)


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9+#. ]", " ", (value or "").lower()).strip()


def contains_term(text: str, term: str) -> bool:
    text_norm = normalize(text)
    term_norm = normalize(term)
    return bool(term_norm) and re.search(
        r"(?<![a-z0-9])" + re.escape(term_norm) + r"(?![a-z0-9])",
        text_norm,
    ) is not None


def get_career(career_id: str):
    for career in CAREERS:
        if career["id"] == career_id:
            return career
    raise HTTPException(status_code=404, detail="Career not found")


def save_history(db: Session, kind: str, source_text: str, result: dict | list):
    try:
        db.add(AnalysisHistory(
            analysis_type=kind,
            input_text=(source_text or "")[:12000],
            result_json=json.dumps(result),
        ))
        db.commit()
    except Exception:
        db.rollback()


def extract_resume(text: str, filename: str) -> dict:
    extracted = []
    for skill in ALL_SKILLS:
        if contains_term(text, skill):
            confidence = min(98, 65 + text.lower().count(skill.lower()) * 7)
            extracted.append({
                "name": skill,
                "category": CATEGORY_MAP.get(skill, "Soft Skills" if skill in SOFT_SKILLS else "Development Tools"),
                "confidence": confidence,
            })

    technical = [skill for skill in extracted if skill["name"] not in SOFT_SKILLS]
    soft = [skill for skill in extracted if skill["name"] in SOFT_SKILLS]

    education = []
    experiences = []
    projects = []
    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            continue
        if re.search(r"university|college|bachelor|master|degree|b\.sc|m\.sc", clean, re.I):
            education.append({"details": clean[:240]})
        if re.search(r"intern|developer|engineer|manager|analyst|experience|worked", clean, re.I):
            experiences.append({"summary": clean[:300]})
        if re.search(r"project|built|developed|created", clean, re.I):
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
        "source": "backend",
    }


def calculate_gap(career: dict, skills: list[str]) -> dict:
    known = {normalize(skill) for skill in skills}
    required = career["technical"] + career["soft"]
    matched = [skill for skill in required if normalize(skill) in known]
    missing = [skill for skill in required if skill not in matched]
    technical_matched = [skill for skill in career["technical"] if skill in matched]
    soft_matched = [skill for skill in career["soft"] if skill in matched]
    coverage = round(100 * len(matched) / max(1, len(required)))

    return {
        "careerId": career["id"],
        "careerTitle": career["title"],
        "matchedSkills": matched,
        "missingSkills": missing,
        "weakSkills": [],
        "technicalMatched": technical_matched,
        "technicalMissing": [skill for skill in career["technical"] if skill not in matched],
        "softMatched": soft_matched,
        "softMissing": [skill for skill in career["soft"] if skill not in matched],
        "coverage": coverage,
    }


def calculate_readiness(gap: dict) -> dict:
    technical_total = len(gap["technicalMatched"]) + len(gap["technicalMissing"])
    soft_total = len(gap["softMatched"]) + len(gap["softMissing"])
    required_score = gap["coverage"]
    technical_score = round(100 * len(gap["technicalMatched"]) / max(1, technical_total))
    soft_score = round(100 * len(gap["softMatched"]) / max(1, soft_total))
    overall = round(required_score * 0.5 + technical_score * 0.3 + soft_score * 0.2)

    return {
        "overall": overall,
        "breakdown": [
            {"key": "required", "label": "Required skills", "score": required_score, "weight": 0.5,
             "explanation": "Percentage of required career skills found in the resume."},
            {"key": "technical", "label": "Technical skills", "score": technical_score, "weight": 0.3,
             "explanation": "Coverage of the career's required technical skills."},
            {"key": "soft", "label": "Soft skills", "score": soft_score, "weight": 0.2,
             "explanation": "Coverage of the career's required soft skills."},
            {"key": "experience", "label": "Experience", "score": 0, "weight": 0.0,
             "explanation": "Experience scoring is not implemented in this baseline."},
            {"key": "projects", "label": "Projects", "score": 0, "weight": 0.0,
             "explanation": "Project scoring is not implemented in this baseline."},
        ],
        "disclaimer": "This is an educational estimate based on skill overlap, not a hiring decision.",
    }


def rank_careers(skills: list[str]) -> list[dict]:
    known = {normalize(skill) for skill in skills}
    ranked = []
    for career in CAREERS:
        required = career["technical"] + career["soft"]
        shared = [skill for skill in required if normalize(skill) in known]
        ranked.append({
            "careerId": career["id"],
            "careerTitle": career["title"],
            "score": round(100 * len(shared) / max(1, len(required))),
            "explanation": f"{len(shared)} of {len(required)} listed skills matched.",
            "sharedSkills": shared,
        })
    return sorted(ranked, key=lambda item: item["score"], reverse=True)


app = FastAPI(title="CareerReady AI API", version="1.0.0")
cors_origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "CareerReady AI API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    salt = secrets.token_hex(16)
    password_hash = salt + "$" + hashlib.pbkdf2_hmac(
        "sha256", payload.password.encode(), salt.encode(), 180000
    ).hex()
    user = User(
        full_name=payload.fullName,
        email=email,
        password_hash=password_hash,
        university=payload.university,
        degree=payload.degree,
        graduation_year=payload.graduationYear,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered.")
    return {"id": str(user.id), "email": user.email, "fullName": user.full_name}


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    try:
        salt, saved_hash = user.password_hash.split("$", 1)
        check_hash = hashlib.pbkdf2_hmac(
            "sha256", payload.password.encode(), salt.encode(), 180000
        ).hex()
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not secrets.compare_digest(saved_hash, check_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"id": str(user.id), "email": user.email, "fullName": user.full_name}


@app.post("/api/auth/forgot-password")
def forgot_password(payload: EmailRequest):
    return {
        "message": f"If an account exists for {payload.email}, a reset link will be sent. Email delivery is not configured yet."
    }


@app.post("/api/resume/analyze")
def resume_analyze(payload: ResumeRequest, db: Session = Depends(get_db)):
    result = extract_resume(payload.text, payload.filename)
    save_history(db, "resume", payload.text, result)
    return result


@app.post("/api/analysis/skill-gap")
def skill_gap(payload: SkillGapRequest, db: Session = Depends(get_db)):
    career = get_career(payload.career_id)
    gap = calculate_gap(career, payload.skills)
    readiness = calculate_readiness(gap)
    save_history(db, "skill-gap", payload.career_id, {"gap": gap, "readiness": readiness})
    return {"gap": gap, "readiness": readiness}


@app.post("/api/matching/rank")
def matching(payload: MatchingRequest, db: Session = Depends(get_db)):
    result = rank_careers(payload.skills)
    save_history(db, "career-matching", payload.resume_text, result)
    return result


@app.post("/api/recommendations")
def recommendations(payload: RecommendationRequest, db: Session = Depends(get_db)):
    career = get_career(payload.career_id)
    recommendations_list = []
    for index, skill in enumerate(payload.missing_skills[:8]):
        recommendations_list.append({
            "id": str(uuid.uuid4()),
            "type": "study_plan" if index < 3 else "project",
            "title": f"Improve {skill}",
            "body": (
                f"Learn the fundamentals of {skill}, practise with guided exercises, "
                "and build a small portfolio project that demonstrates what you learned."
            ),
            "priority": "high" if index < 3 else "medium",
        })
    if not recommendations_list:
        recommendations_list.append({
            "id": str(uuid.uuid4()),
            "type": "career_advice",
            "title": f"Continue developing as a {career['title']}",
            "body": "Build practical projects, document your work, and practise explaining your technical decisions.",
            "priority": "medium",
        })
    save_history(db, "recommendations", payload.career_id, recommendations_list)
    return {"recommendations": recommendations_list}


@app.post("/api/roadmap")
def roadmap(payload: RoadmapRequest, db: Session = Depends(get_db)):
    career = get_career(payload.career_id)
    missing = payload.missing_skills[:9]
    chunks = [missing[index:index + 3] for index in range(0, len(missing), 3)] or [payload.existing_skills[:3]]
    phases = []
    for number, skills in enumerate(chunks, start=1):
        objectives = [f"Understand the fundamentals of {skill}" for skill in skills]
        resources = [{
            "title": f"{skill} learning resources",
            "url": "https://www.google.com/search?q=" + quote_plus(skill + " official documentation"),
            "type": "documentation",
        } for skill in skills]
        phases.append({
            "id": str(uuid.uuid4()),
            "phaseNumber": number,
            "title": f"Phase {number}: Build {career['title']} skills",
            "objectives": objectives or ["Review your current skills and complete a practical portfolio project."],
            "resources": resources,
            "estimatedTime": "2–3 weeks",
            "skills": skills,
        })
    save_history(db, "roadmap", payload.career_id, phases)
    return {"phases": phases}


@app.post("/api/job/analyze")
def job_analyze(payload: JobRequest, db: Session = Depends(get_db)):
    required = [skill for skill in ALL_SKILLS if contains_term(payload.description, skill)]
    technical = [skill for skill in required if skill not in SOFT_SKILLS]
    soft = [skill for skill in required if skill in SOFT_SKILLS]
    resume_skills = {normalize(skill) for skill in payload.resume_skills}
    matched = [skill for skill in required if normalize(skill) in resume_skills]
    missing = [skill for skill in required if skill not in matched]
    lines = [line.strip() for line in payload.description.splitlines() if line.strip()]
    result = {
        "id": str(uuid.uuid4()),
        "title": (lines[0] if lines else "Job description")[:100],
        "requiredSkills": required,
        "technicalSkills": technical,
        "softSkills": soft,
        "experienceRequirements": [
            line for line in lines
            if re.search(r"years? of experience|experience required|senior|junior", line, re.I)
        ][:5],
        "educationRequirements": [
            line for line in lines
            if re.search(r"degree|bachelor|master|university|college", line, re.I)
        ][:5],
        "missingQualifications": missing,
        "matchedQualifications": matched,
        "recommendations": [f"Develop practical evidence for {skill}." for skill in missing[:5]],
        "source": "backend",
    }
    save_history(db, "job-description", payload.description, result)
    return result
