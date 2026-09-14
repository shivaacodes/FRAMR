import ffmpeg
import os
import uuid
from app.core.config import settings

def extract_and_merge_clips(video_path: str, segments: list) -> str:
    """
    Takes a video path and a list of time segments (start, end) in seconds,
    extracts those clips, merges them, and saves the final highlight video.
    Returns the relative path to the generated highlight video.
    """
    if not segments:
        return None

    print(f"[FFmpeg] Extracting {len(segments)} clips from {video_path}...")
    
    # Generate a unique output filename
    output_filename = f"highlight_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(settings.HIGHLIGHTS_DIR, output_filename)

    streams = []
    
    try:
        # Create an input stream for each segment
        for start, end in segments:
            duration = end - start
            # Fast seek with -ss before input is more efficient
            stream = ffmpeg.input(video_path, ss=start, t=duration)
            
            # We need both video and audio
            v = stream.video
            a = stream.audio
            streams.extend([v, a])

        # Concatenate all streams
        # concat filter takes n segments, v=1 (1 video stream), a=1 (1 audio stream per segment)
        merged = ffmpeg.concat(*streams, v=1, a=1).node
        
        # Output with standard encoding
        out = ffmpeg.output(
            merged[0],
            merged[1],
            output_path, 
            vcodec='libx264', 
            preset='ultrafast',
            crf=23,
            threads=0,
            acodec='aac',
            strict='experimental'
        )
        
        # Overwrite if exists, capture stderr for debugging
        out.run(overwrite_output=True, capture_stdout=True, capture_stderr=True)
        
        print(f"[FFmpeg] Successfully created highlight: {output_filename}")
        
        # Return just the filename so it can be served via /highlights/{filename}
        return output_filename
        
    except ffmpeg.Error as e:
        print("[FFmpeg] Error occurred during processing")
        if e.stderr:
            print(e.stderr.decode('utf8'))
        raise e

import subprocess

def apply_edits_cli(input_filename: str, aspect_ratio: str, filter_type: str, brightness: int, contrast: int, is_muted: bool, overlay_text: str) -> str:
    """
    Applies user edits (aspect ratio, filters, text, mute) to the highlight video and returns a new file.
    """
    input_path = os.path.join(settings.HIGHLIGHTS_DIR, input_filename)
    output_filename = f"edited_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(settings.HIGHLIGHTS_DIR, output_filename)
    
    vf_filters = []
    
    # 1. Aspect Ratio Crop
    if aspect_ratio == '9/16':
        vf_filters.append("crop=ih*9/16:ih")
    elif aspect_ratio == '1/1':
        vf_filters.append("crop=ih:ih")
        
    # 2. Brightness & Contrast
    b = (brightness - 100) / 100.0
    c = contrast / 100.0
    vf_filters.append(f"eq=brightness={b}:contrast={c}")
    
    # 3. Filters
    if filter_type == 'grayscale':
        vf_filters.append("hue=s=0")
    elif filter_type == 'vibrant':
        vf_filters.append("hue=s=2.0")
    elif filter_type == 'vintage':
        vf_filters.append("hue=s=0.5,colorbalance=rs=.2")
        
    # 4. Text
    if overlay_text:
        safe_text = overlay_text.replace("'", "\\'")
        vf_filters.append(f"drawtext=text='{safe_text}':fontcolor=white:fontsize=h/10:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=2:shadowy=2")
        
    vf_string = ",".join(vf_filters) if vf_filters else ""
    
    cmd = ["ffmpeg", "-y", "-i", input_path]
    
    if vf_string:
        cmd.extend(["-vf", vf_string])
        
    if is_muted:
        cmd.append("-an")
    else:
        cmd.extend(["-c:a", "copy"])
        
    cmd.extend([
        "-c:v", "libx264", 
        "-preset", "ultrafast", 
        "-crf", "23",
        "-threads", "0",
        output_path
    ])
    
    subprocess.run(cmd, check=True)
    return output_filename
