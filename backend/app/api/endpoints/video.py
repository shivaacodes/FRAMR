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
    background_tasks.add_task(process_video_task, new_video.id)
    
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
from fastapi.responses import StreamingResponse
import asyncio

@router.get("/{video_id}/logs")
async def get_video_logs(video_id: int):
    log_path = os.path.join(settings.BASE_DIR, "data", "logs", f"video_{video_id}.log")
    
    async def log_generator():
        # Wait up to 5 seconds for log file to be created
        for _ in range(15):
            if os.path.exists(log_path):
                break
            await asyncio.sleep(0.3)
            
        if not os.path.exists(log_path):
            yield f"data: [System] Initializing processing daemon...\n\n"
            return
            
        with open(log_path, "r") as f:
            idle_ticks = 0
            while True:
                line = f.readline()
                if line:
                    idle_ticks = 0
                    yield f"data: {line.strip()}\n\n"
                    if "[System] Completed" in line or "[System] Error" in line:
                        break
                else:
                    await asyncio.sleep(0.25)
                    idle_ticks += 1
                    if idle_ticks > 120:  # 30 seconds idle safeguard
                        break
                    
    return StreamingResponse(
        log_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

from pydantic import BaseModel
from app.services.ffmpeg_handler import apply_edits_cli

class ExportRequest(BaseModel):
    aspect_ratio: str
    filter_type: str
    brightness: int
    contrast: int
    saturation: int
    blur: int
    flip_h: bool
    transition: str = "none"
    speed: float = 1.0
    soundtrack: str = "none"
    is_muted: bool
    overlay_text: str
    clip_order: list[int] | None = None

@router.post("/{video_id}/export")
def export_video(video_id: int, req: ExportRequest, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video or not video.highlight_path:
        return {"error": "Video not found or not processed"}
        
    try:
        new_filename = apply_edits_cli(
            video.highlight_path,
            req.aspect_ratio,
            req.filter_type,
            req.brightness,
            req.contrast,
            req.saturation,
            req.blur,
            req.flip_h,
            req.transition,
            req.is_muted,
            req.overlay_text,
            req.clip_order,
            req.speed,
            req.soundtrack
        )
        # Update db or just return the new file path?
        # Let's just return the URL so the frontend can download it.
        return {"export_url": f"http://localhost:8000/highlights/{new_filename}"}
    except Exception as e:
        print(f"Export failed: {e}")
        return {"error": "Export failed"}
