import time
from sqlalchemy.orm import Session
from app.db import models
from app.db.models import VideoStatus
from app.db.session import SessionLocal

from app.services.frame_analyzer import detect_highlights
from app.services.ffmpeg_handler import extract_and_merge_clips

def process_video_task(video_id: int):
    """
    Background task to process the video.
    """
    db = SessionLocal()
    try:
        video = db.query(models.Video).filter(models.Video.id == video_id).first()
        if not video:
            return
    
        try:
            video.status = VideoStatus.PROCESSING
            db.commit()
    
            # 1. Analyze video with OpenCV to find highlights
            segments = detect_highlights(video.original_path, num_clips=3, clip_duration=4)
            
            # 2. Extract and merge clips with FFmpeg
            highlight_filename = extract_and_merge_clips(video.original_path, segments)
            
            # 3. Update database
            video.status = VideoStatus.COMPLETED
            video.highlight_path = highlight_filename
            db.commit()
            print(f"[Processor] Completed video {video_id}. Highlight: {highlight_filename}")
        except Exception as e:
            video.status = VideoStatus.FAILED
            db.commit()
            print(f"[Processor] Error processing video {video_id}: {e}")
    finally:
        db.close()
