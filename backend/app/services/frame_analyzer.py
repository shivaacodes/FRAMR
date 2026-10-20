import cv2
import numpy as np
import ffmpeg

def get_audio_volume(video_path: str, fps: float, total_frames: int) -> np.ndarray:
    """Extracts audio and calculates RMS volume per video frame."""
    print(f"[Audio] Extracting audio for volume analysis...")
    try:
        out, _ = (
            ffmpeg
            .input(video_path)
            .output('pipe:', format='f32le', acodec='pcm_f32le', ac=1, ar='44100')
            .run(capture_stdout=True, capture_stderr=True)
        )
        audio_data = np.frombuffer(out, dtype=np.float32)
        
        samples_per_frame = int(44100 / fps)
        volumes = np.zeros(total_frames)
        
        for i in range(total_frames):
            start = i * samples_per_frame
            end = start + samples_per_frame
            chunk = audio_data[start:end]
            if len(chunk) > 0:
                volumes[i] = np.sqrt(np.mean(chunk**2))
                
        # Normalize volumes
        max_vol = np.max(volumes)
        if max_vol > 0:
            volumes = volumes / max_vol
            
        print("[Audio] Volume analysis complete.")
        return volumes
    except Exception as e:
        print(f"[Audio] Error extracting audio: {e}")
        return np.zeros(total_frames)

def detect_highlights(video_path: str, num_clips: int = 3, clip_duration: int = 5) -> list:
    """
    Analyzes a video using visual motion, scene cuts, and audio volume
    to detect the most interesting highlights.
    """
    print(f"[Analyzer] Analyzing {video_path} for highlights...")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise Exception("Could not open video file.")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    if duration <= clip_duration:
        cap.release()
        return [(0, duration)]
        
    # Analyze audio volume
    volumes = get_audio_volume(video_path, fps, total_frames)
    
    # Analyze video frames
    # To keep it fast, we can process a few frames per second, but we need 
    # to map it correctly to the audio array
    skip_frames = int(fps / 5) # Analyze ~5 frames per second
    if skip_frames < 1: skip_frames = 1
    
    motion_scores = np.zeros(total_frames)
    scene_cuts = np.zeros(total_frames)
    
    prev_gray = None
    prev_hist = None
    
    frame_idx = 0
    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break
            
        # 1. Motion Score
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (320, 180))
        
        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray)
            motion_scores[frame_idx] = np.mean(diff)
            
        prev_gray = gray
        
        # 2. Scene Cut Score (Histogram difference)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        # Calculate 1D histogram for Hue
        hist = cv2.calcHist([hsv], [0], None, [50], [0, 180])
        cv2.normalize(hist, hist, 0, 1, cv2.NORM_MINMAX)
        
        if prev_hist is not None:
            # cv2.HISTCMP_CORREL returns 1 for perfect match, 0 for no match
            match = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
            # High difference = low match
            scene_cuts[frame_idx] = max(0, 1.0 - match)
            
        prev_hist = hist
        
        if (frame_idx // skip_frames) % 8 == 0 or frame_idx + skip_frames >= total_frames:
            pct = min(100, int((frame_idx / total_frames) * 100))
            print(f"[VisionEngine] Frame {frame_idx}/{total_frames} ({pct}%) -> Motion: {motion_scores[frame_idx]:.2f} | SceneΔ: {scene_cuts[frame_idx]:.2f}")
        
        frame_idx += skip_frames

    cap.release()
    
    # Interpolate skipped frames for motion and scene cuts
    for i in range(total_frames):
        if i % skip_frames != 0 and i > 0:
            prev_val_idx = i - (i % skip_frames)
            next_val_idx = min(total_frames - 1, prev_val_idx + skip_frames)
            
            # Simple linear interpolation or just copy previous
            motion_scores[i] = motion_scores[prev_val_idx]
            scene_cuts[i] = scene_cuts[prev_val_idx]

    # Normalize motion scores
    max_motion = np.max(motion_scores)
    if max_motion > 0:
        motion_scores = motion_scores / max_motion
        
    # Combine scores
    # Audio usually implies excitement, motion implies action.
    # We penalize scene cuts occurring in the middle of a clip by weighting them later,
    # but for frame scoring, audio and motion are king.
    combined_scores = 0.6 * volumes + 0.4 * motion_scores
    
    # Smooth the scores over a 2-second window to find sustained action
    window_size = int(fps * 2)
    smoothed_scores = np.convolve(combined_scores, np.ones(window_size)/window_size, mode='same')
    
    # Sliding window to find best clips
    frames_per_clip = int(clip_duration * fps)
    
    # We will score every possible window of length `frames_per_clip`
    window_scores = []
    for i in range(0, total_frames - frames_per_clip, int(fps/2)):
        # Average score in this window
        window_score = np.mean(smoothed_scores[i:i+frames_per_clip])
        
        # Penalize if there is a severe scene cut right in the middle of the clip
        # Cuts near the start (0-15%) or end (85-100%) are fine/good.
        middle_start = i + int(frames_per_clip * 0.15)
        middle_end = i + int(frames_per_clip * 0.85)
        max_cut_in_middle = np.max(scene_cuts[middle_start:middle_end]) if middle_start < middle_end else 0
        
        # If max_cut_in_middle > 0.8, it's a hard cut in the middle. Penalize heavily.
        if max_cut_in_middle > 0.8:
            window_score *= 0.5
            
        # Bonus if the clip starts right after a scene cut
        start_cut_window = scene_cuts[max(0, i-int(fps)):i+int(fps*0.5)]
        if len(start_cut_window) > 0 and np.max(start_cut_window) > 0.8:
            window_score *= 1.2
            
        window_scores.append((window_score, i))
        
    # Sort windows by score descending
    window_scores.sort(key=lambda x: x[0], reverse=True)
    
    segments = []
    used_frames = []
    
    for score, start_frame in window_scores:
        if len(segments) >= num_clips:
            break
            
        end_frame = start_frame + frames_per_clip
        
        # Check overlap
        overlap = False
        for u_start, u_end in used_frames:
            # if one clip starts before the other ends, and ends after the other starts -> overlap
            # Add a 2-second buffer between clips
            buffer = int(fps * 2)
            if start_frame < (u_end + buffer) and end_frame > (u_start - buffer):
                overlap = True
                break
                
        if not overlap:
            segments.append((start_frame / fps, end_frame / fps))
            used_frames.append((start_frame, end_frame))
            
    # Sort chronologically
    segments.sort(key=lambda x: x[0])
    
    print(f"[Intelligence] Multi-modal scoring complete.")
    for idx, (s, e) in enumerate(segments):
        print(f"[Intelligence] Clip #{idx+1} selected: [{s:.2f}s -> {e:.2f}s] (Duration: {e-s:.1f}s)")
    
    # Fallback if no segments found
    if not segments:
        segments = [(0, min(clip_duration, duration))]
        
    return segments
