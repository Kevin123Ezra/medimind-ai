from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

# Create standard SQLAlchemy synchronous engine
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
)

# Set up SessionLocal factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model class
Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency helper to acquire a thread-local database session.
    Yields session and closes it on completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
