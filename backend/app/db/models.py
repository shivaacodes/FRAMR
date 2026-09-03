from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.orm import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class VideoStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_path = Column(String)
    highlight_path = Column(String, nullable=True)
    status = Column(Enum(VideoStatus), default=VideoStatus.PENDING)
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
