from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .database import Base


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
    analysis_type = Column(String(60), nullable=False)
    input_text = Column(Text, default="")
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
