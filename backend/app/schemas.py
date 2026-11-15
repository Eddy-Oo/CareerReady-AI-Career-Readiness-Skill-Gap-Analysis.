from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    fullName: str = Field(min_length=1, max_length=160)
    email: EmailStr
    password: str = Field(min_length=6)
    university: str = ""
    degree: str = ""
    graduationYear: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmailRequest(BaseModel):
    email: EmailStr


class ResumeRequest(BaseModel):
    text: str = Field(min_length=1)
    filename: str = "resume"


class SkillGapRequest(BaseModel):
    career_id: str
    skills: list[str] = []
    profile: Optional[dict] = None


class MatchingRequest(BaseModel):
    resume_text: str = ""
    skills: list[str] = []
    profile: Optional[dict] = None


class RecommendationRequest(BaseModel):
    career_id: str
    missing_skills: list[str] = []
    matched_skills: list[str] = []
    readiness: float = 0
    profile: Optional[dict] = None


class RoadmapRequest(BaseModel):
    career_id: str
    missing_skills: list[str] = []
    existing_skills: list[str] = []


class JobRequest(BaseModel):
    description: str = Field(min_length=1)
    resume_skills: list[str] = []
