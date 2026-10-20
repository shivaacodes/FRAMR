from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends
from pydantic import BaseModel
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

@router.post("/demo-video")
def load_demo_video(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    demo_src = os.path.join(settings.UPLOAD_DIR, "test.mp4")
    if not os.path.exists(demo_src):
        files = [f for f in os.listdir(settings.UPLOAD_DIR) if f.endswith(".mp4")]
        if files:
            demo_src = os.path.join(settings.UPLOAD_DIR, files[0])
        else:
            return {"error": "No demo footage found"}
            
    unique_filename = f"demo_{uuid.uuid4().hex[:8]}.mp4"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    shutil.copyfile(demo_src, file_path)
    
    new_video = models.Video(
        filename=f"Action_Cyber_Clip_{uuid.uuid4().hex[:4]}.mp4",
        original_path=str(file_path),
        status=models.VideoStatus.PENDING
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    background_tasks.add_task(process_video_task, new_video.id)
    return {"message": "Demo job initialized", "video_id": new_video.id}

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

@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return {"error": "Video not found"}
    
    # 1. Clean up original video file
    if video.original_path and os.path.exists(video.original_path):
        try:
            os.remove(video.original_path)
        except Exception as e:
            print(f"Error removing original file {video.original_path}: {e}")
            
    # 2. Clean up highlight video file
    if video.highlight_path:
        hl_path = os.path.join(settings.HIGHLIGHTS_DIR, video.highlight_path)
        if os.path.exists(hl_path):
            try:
                os.remove(hl_path)
            except Exception as e:
                print(f"Error removing highlight file {hl_path}: {e}")
                
    # 3. Clean up log file
    log_path = os.path.join(settings.BASE_DIR, "data", "logs", f"video_{video_id}.log")
    if os.path.exists(log_path):
        try:
            os.remove(log_path)
        except Exception as e:
            print(f"Error removing log file {log_path}: {e}")
            
    # 4. Remove record from SQLite DB
    db.delete(video)
    db.commit()
    return {"message": f"Video {video_id} successfully deleted", "id": video_id}

@router.delete("/purge-all")
@router.post("/purge-all")
def purge_all_videos(db: Session = Depends(get_db)):
    videos = db.query(models.Video).all()
    count = len(videos)
    for video in videos:
        if video.original_path and os.path.exists(video.original_path):
            try:
                os.remove(video.original_path)
            except Exception:
                pass
        if video.highlight_path:
            hl_path = os.path.join(settings.HIGHLIGHTS_DIR, video.highlight_path)
            if os.path.exists(hl_path):
                try:
                    os.remove(hl_path)
                except Exception:
                    pass
        log_path = os.path.join(settings.BASE_DIR, "data", "logs", f"video_{video.id}.log")
        if os.path.exists(log_path):
            try:
                os.remove(log_path)
            except Exception:
                pass
        db.delete(video)
    db.commit()
    return {"message": "All vault records purged successfully", "count": count}

class FeedbackRequest(BaseModel):
    rating: int
    feedback: str | None = None
    sensitivity: float = 1.0

@router.post("/{video_id}/feedback")
def submit_feedback(video_id: int, req: FeedbackRequest, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return {"error": "Video not found"}
    video.rating = req.rating
    video.feedback = req.feedback
    video.sensitivity = req.sensitivity
    db.commit()
    return {"message": "Feedback recorded", "rating": video.rating}

@router.get("/{video_id}/telemetry")
def get_video_telemetry(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return {"error": "Video not found"}
    log_path = os.path.join(settings.BASE_DIR, "data", "logs", f"video_{video_id}.log")
    log_lines = []
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            log_lines = [line.strip() for line in f.readlines()]
    return {
        "video_id": video.id,
        "filename": video.filename,
        "status": video.status,
        "duration_seconds": video.duration_seconds,
        "rating": video.rating,
        "feedback": video.feedback,
        "sensitivity": video.sensitivity,
        "highlight_path": video.highlight_path,
        "telemetry_stream": log_lines[-30:]
    }
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
        # Return relative URL so frontend can prepend API_BASE in any environment
        return {"export_url": f"/highlights/{new_filename}", "filename": new_filename}
    except Exception as e:
        print(f"Export failed: {e}")
        return {"error": "Export failed"}
