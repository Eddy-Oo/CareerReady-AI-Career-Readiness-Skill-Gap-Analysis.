from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, ForeignKey, Numeric, JSON, func
from sqlalchemy.dialects.postgresql import JSONB
from .database import Base

# JSON works with SQLite for local development and JSONB on Neon PostgreSQL.
JSON_DATA = JSON().with_variant(JSONB, "postgresql")
BIG_ID = BigInteger().with_variant(Integer, "sqlite")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(160), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    university = Column(String(255), default="")
    degree = Column(String(255), default="")
    graduation_year = Column(String(20), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    analysis_type = Column(String(60), nullable=False)
    input_text = Column(Text, default="")
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String(255))
    resume_text = Column(Text)
    extracted_data = Column(JSON_DATA, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False)
    category = Column(String(100))


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    skill_id = Column(BigInteger, ForeignKey("skills.id", ondelete="CASCADE"), nullable=True)
    source = Column(String(50), default="resume")
    confidence = Column(Numeric(5, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255))
    description = Column(Text, nullable=False)
    extracted_data = Column(JSON_DATA, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CareerMatch(Base):
    __tablename__ = "career_matches"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    resume_id = Column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    career_id = Column(String(100), nullable=False)
    match_score = Column(Numeric(5, 2))
    result_data = Column(JSON_DATA, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    career_id = Column(String(100), nullable=False)
    matched_skills = Column(JSON_DATA, default=list)
    missing_skills = Column(JSON_DATA, default=list)
    readiness_score = Column(Numeric(5, 2))
    result_data = Column(JSON_DATA, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    career_id = Column(String(100))
    recommendation_data = Column(JSON_DATA, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    career_id = Column(String(100), nullable=False)
    roadmap_data = Column(JSON_DATA, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CareerPrediction(Base):
    __tablename__ = "career_predictions"

    id = Column(BIG_ID, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    resume_id = Column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    predicted_role = Column(String(160), nullable=False)
    top_predictions = Column(JSON_DATA, default=list)
    model_name = Column(String(160))
    dataset_type = Column(String(80))
    result_data = Column(JSON_DATA, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
