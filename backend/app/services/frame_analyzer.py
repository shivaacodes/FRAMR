import cv2
import numpy as np

def detect_highlights(video_path: str):
    """
    Analyzes a video file frame by frame using OpenCV to detect
    high motion or scene changes and returns a list of time segments (start, end).
    """
    # TODO: Implement actual motion/scene change detection logic
    # For now, return dummy highlight segments (e.g., 0-5s and 10-15s)
    return [(0, 5), (10, 15)]
