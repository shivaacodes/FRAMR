from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.services.video_processor import process_video_task
from app.core.config import settings
import shutil
import os
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB record
    new_video = models.Video(
        filename=file.filename,
        original_path=str(file_path),
        status=models.VideoStatus.PENDING
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    # Trigger background task
    background_tasks.add_task(process_video_task, new_video.id, db)
    
    return {"message": "Upload successful, processing started", "video_id": new_video.id}

@router.get("/")
def list_videos(db: Session = Depends(get_db)):
    videos = db.query(models.Video).order_by(models.Video.created_at.desc()).all()
    return {"videos": videos}

@router.get("/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return {"error": "Video not found"}
    return video

