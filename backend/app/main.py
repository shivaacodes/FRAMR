from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import video
from app.db.session import engine
from app.db import models
from app.core.config import settings
from app.services.soundtrack_generator import ensure_soundtracks
from sqlalchemy import text

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Ensure columns exist in SQLite
with engine.connect() as conn:
    for col, col_type in [("rating", "INTEGER"), ("feedback", "TEXT"), ("sensitivity", "FLOAT DEFAULT 1.0")]:
        try:
            conn.execute(text(f"ALTER TABLE videos ADD COLUMN {col} {col_type}"))
            conn.commit()
        except Exception:
            pass

# Ensure default soundtracks exist
ensure_soundtracks()

app = FastAPI(title="FRAMR API", description="API for video highlight generation")

# Mount highlights and music directories
app.mount("/highlights", StaticFiles(directory=settings.HIGHLIGHTS_DIR), name="highlights")
app.mount("/music", StaticFiles(directory=settings.MUSIC_DIR), name="music")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router, prefix="/api/v1/videos", tags=["videos"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the FRAMR API"}
