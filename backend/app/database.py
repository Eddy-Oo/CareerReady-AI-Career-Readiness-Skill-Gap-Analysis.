import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# Render must use the configured Neon/PostgreSQL database, not an ephemeral SQLite file.
if not DATABASE_URL and os.getenv("RENDER", "").lower() == "true":
    raise RuntimeError("DATABASE_URL is required on Render. Configure your Neon PostgreSQL connection string.")

DATABASE_URL = DATABASE_URL or "sqlite:///./careerready.db"

# Render/Neon connection strings may use postgres:// or postgresql://.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
