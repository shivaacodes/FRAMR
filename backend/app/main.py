from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import video
from app.db.session import engine
from app.db import models
from app.core.config import settings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FRAMR API", description="API for video highlight generation")

# Mount highlights directory to serve video files
app.mount("/highlights", StaticFiles(directory=settings.HIGHLIGHTS_DIR), name="highlights")

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
