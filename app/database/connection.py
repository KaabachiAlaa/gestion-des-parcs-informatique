from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Utilise DATABASE_URL si défini (ex: Vercel / prod), sinon la base locale.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:Alaa.aytheusos.27500@localhost:5432/parc_informatique",
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
