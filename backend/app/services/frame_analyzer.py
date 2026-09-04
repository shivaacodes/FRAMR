import cv2
import numpy as np

def detect_highlights(video_path: str, num_clips: int = 3, clip_duration: int = 5) -> list:
    """
    Analyzes a video file frame by frame using OpenCV to detect
    high motion or scene changes and returns a list of time segments (start, end).
    """
    print(f"[OpenCV] Analyzing {video_path} for highlights...")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise Exception("Could not open video file.")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    # Analyze every Nth frame to speed up processing for the demo
    skip_frames = int(fps / 5) # Analyze ~5 frames per second
    if skip_frames < 1: skip_frames = 1
    
    motion_scores = []
    timestamps = []
    
    prev_gray = None
    frame_idx = 0
    
    while True:
        # Skip frames for speed
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        
        if not ret:
            break
            
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Resize for faster calculation
        gray = cv2.resize(gray, (320, 180))
        
        if prev_gray is not None:
            # Calculate absolute difference
            diff = cv2.absdiff(gray, prev_gray)
            score = np.mean(diff)
            
            # Timestamp in seconds
            current_time = frame_idx / fps
            
            motion_scores.append(score)
            timestamps.append(current_time)
            
        prev_gray = gray
        frame_idx += skip_frames

    cap.release()
    
    if not motion_scores:
        # Fallback if analysis fails
        return [(0, min(clip_duration, duration))]
        
    # Smooth the scores to find sustained action rather than single glitches
    window_size = 5
    smoothed_scores = np.convolve(motion_scores, np.ones(window_size)/window_size, mode='same')
    
    # Find peaks (top segments)
    segments = []
    used_times = []
    
    # Sort indices by highest motion score
    top_indices = np.argsort(smoothed_scores)[::-1]
    
    for idx in top_indices:
        if len(segments) >= num_clips:
            break
            
        peak_time = timestamps[idx]
        
        # Ensure we don't pick overlapping clips
        overlap = False
        for used in used_times:
            if abs(peak_time - used) < clip_duration + 2:
                overlap = True
                break
                
        if not overlap:
            # Calculate start and end, ensuring we don't go out of bounds
            start_time = max(0, peak_time - (clip_duration / 2))
            end_time = min(duration, start_time + clip_duration)
            
            segments.append((start_time, end_time))
            used_times.append(peak_time)
            
    # Sort segments chronologically
    segments.sort(key=lambda x: x[0])
    
    print(f"[OpenCV] Found highlight segments: {segments}")
    return segments
