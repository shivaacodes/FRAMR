import time
from sqlalchemy.orm import Session
from app.db import models
from app.db.models import VideoStatus

from app.services.frame_analyzer import detect_highlights
from app.services.ffmpeg_handler import extract_and_merge_clips

def process_video_task(video_id: int, db: Session):
    """
    Background task to process the video.
    """
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return

    try:
        video.status = VideoStatus.PROCESSING
        db.commit()

        # 1. Analyze video with OpenCV to find highlights
        segments = detect_highlights(video.original_path)
        
        # 2. Extract and merge clips with FFmpeg
        highlight_path = extract_and_merge_clips(video.original_path, segments)
        
        # 3. Update database
        video.status = VideoStatus.COMPLETED
        video.highlight_path = str(highlight_path)
        db.commit()
    except Exception as e:
        video.status = VideoStatus.FAILED
        db.commit()
        print(f"Error processing video {video_id}: {e}")
