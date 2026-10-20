from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "FRAMR"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    HIGHLIGHTS_DIR: Path = BASE_DIR / "data" / "highlights"
    MUSIC_DIR: Path = BASE_DIR / "data" / "music"
    LOGS_DIR: Path = BASE_DIR / "data" / "logs"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/framr.db"

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.HIGHLIGHTS_DIR, exist_ok=True)
os.makedirs(settings.MUSIC_DIR, exist_ok=True)
os.makedirs(settings.LOGS_DIR, exist_ok=True)
