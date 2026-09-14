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

def apply_edits_cli(input_filename: str, aspect_ratio: str, filter_type: str, brightness: int, contrast: int, saturation: int, blur: int, flip_h: bool, is_muted: bool, overlay_text: str, clip_order: list = None) -> str:
    """
    Applies user edits (aspect ratio, filters, text, mute, reordering, flip, blur) to the highlight video and returns a new file.
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
        
    # 2. Flip
    if flip_h:
        vf_filters.append("hflip")
        
    # 3. Brightness, Contrast & Saturation
    b = (brightness - 100) / 100.0
    c = contrast / 100.0
    s = saturation / 100.0
    vf_filters.append(f"eq=brightness={b}:contrast={c}:saturation={s}")
    
    # 4. Blur
    if blur > 0:
        vf_filters.append(f"boxblur={blur}:1")
    
    # 3. Filters
    if filter_type == 'grayscale':
        vf_filters.append("hue=s=0")
    elif filter_type == 'vibrant':
        vf_filters.append("hue=s=2.0")
    elif filter_type == 'vintage':
        vf_filters.append("hue=s=0.5,colorbalance=rs=.2")
        
    # 4. Text
    temp_text_path = None
    if overlay_text:
        temp_text_path = os.path.join(settings.HIGHLIGHTS_DIR, f"text_{uuid.uuid4().hex[:8]}.txt")
        with open(temp_text_path, "w", encoding="utf-8") as f:
            f.write(overlay_text)
        vf_filters.append(f"drawtext=textfile='{temp_text_path}':fontcolor=white:fontsize=h/10:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=2:shadowy=2")
        
    vf_string = ",".join(vf_filters) if vf_filters else ""
    
    cmd = ["ffmpeg", "-y", "-i", input_path]

    # Handle clip reordering
    is_reordered = False
    if clip_order and len(clip_order) == 3 and clip_order != [0, 1, 2]:
        # We assume the video is evenly split into 3 chunks
        try:
            probe = ffmpeg.probe(input_path)
            total_duration = float(probe['format']['duration'])
            chunk_dur = total_duration / 3.0
            
            filter_complex = []
            concat_inputs = []
            for i, orig_idx in enumerate(clip_order):
                start = orig_idx * chunk_dur
                end = start + chunk_dur
                filter_complex.append(f"[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}];")
                if not is_muted:
                    filter_complex.append(f"[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{i}];")
                
                concat_inputs.append(f"[v{i}]")
                if not is_muted:
                    concat_inputs.append(f"[a{i}]")
            
            # Concat
            if not is_muted:
                concat_str = "".join(concat_inputs) + f"concat=n=3:v=1:a=1[vout_raw][aout_raw]"
            else:
                concat_str = "".join(concat_inputs) + f"concat=n=3:v=1:a=0[vout_raw]"
            
            filter_complex.append(concat_str)
            fc_string = "".join(filter_complex)
            
            # If we have vf_filters, append them to the complex graph
            if vf_string:
                fc_string += f";[vout_raw]{vf_string}[vout_final]"
                cmd.extend(["-filter_complex", fc_string, "-map", "[vout_final]"])
            else:
                cmd.extend(["-filter_complex", fc_string, "-map", "[vout_raw]"])
                
            if not is_muted:
                cmd.extend(["-map", "[aout_raw]"])
                
            is_reordered = True
        except Exception as e:
            print(f"Failed to apply clip reordering: {e}")
            is_reordered = False

    if not is_reordered:
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
    try:
        subprocess.run(cmd, check=True)
    finally:
        if temp_text_path and os.path.exists(temp_text_path):
            os.remove(temp_text_path)
            
    return output_filename
