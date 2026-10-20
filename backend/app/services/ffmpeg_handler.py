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

    print(f"[FFmpeg] Pipeline initialized: trimming {len(segments)} segments at hardware acceleration...")
    
    # Generate a unique output filename
    output_filename = f"highlight_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(settings.HIGHLIGHTS_DIR, output_filename)

    streams = []
    
    try:
        # Create an input stream for each segment
        for idx, (start, end) in enumerate(segments):
            duration = end - start
            print(f"[FFmpeg] Slicing Segment #{idx+1} ({start:.2f}s -> {end:.2f}s, dur: {duration:.1f}s)")
            # Fast seek with -ss before input is more efficient
            stream = ffmpeg.input(video_path, ss=start, t=duration)
            
            # We need both video and audio
            v = stream.video
            a = stream.audio
            streams.extend([v, a])

        # Concatenate all streams
        # concat filter takes n segments, v=1 (1 video stream), a=1 (1 audio stream per segment)
        print(f"[FFmpeg] Compiling concat filter graph ({len(segments)} video + audio tracks)...")
        merged = ffmpeg.concat(*streams, v=1, a=1).node
        
        # Output with standard encoding
        print(f"[FFmpeg] Encoding final stream via libx264 (preset=ultrafast, threads=0)...")
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
        
        print(f"[FFmpeg] Render completed successfully -> {output_filename}")
        
        # Return just the filename so it can be served via /highlights/{filename}
        return output_filename
        
    except ffmpeg.Error as e:
        print("[FFmpeg] Error occurred during processing")
        if e.stderr:
            print(e.stderr.decode('utf8'))
        raise e

import subprocess

def apply_edits_cli(
    input_filename: str, 
    aspect_ratio: str, 
    filter_type: str, 
    brightness: int, 
    contrast: int, 
    saturation: int, 
    blur: int, 
    flip_h: bool, 
    transition: str, 
    is_muted: bool, 
    overlay_text: str, 
    clip_order: list = None,
    speed: float = 1.0,
    soundtrack: str = "none"
) -> str:
    """
    Applies user edits (aspect ratio, filters, text, mute, reordering, flip, blur, transitions, speed, soundtracks) 
    to the highlight video and returns a new file.
    """
    input_path = os.path.join(settings.HIGHLIGHTS_DIR, input_filename)
    output_filename = f"edited_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(settings.HIGHLIGHTS_DIR, output_filename)
    
    vf_filters = []
    
    # 1. Aspect Ratio Crop (Strict even dimensions for H.264)
    if aspect_ratio == '9/16':
        vf_filters.append("crop=ih*9/16:ih,scale=720:1280")
    elif aspect_ratio == '1/1':
        vf_filters.append("crop=ih:ih,scale=720:720")
        
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
    
    # 5. Filters
    if filter_type == 'grayscale':
        vf_filters.append("hue=s=0")
    elif filter_type == 'vibrant':
        vf_filters.append("hue=s=2.0")
    elif filter_type == 'vintage':
        vf_filters.append("hue=s=0.5,colorbalance=rs=.2")
        
    # 6. Speed (Video PTS multiplier)
    if speed != 1.0 and speed > 0:
        pts_mult = 1.0 / speed
        vf_filters.append(f"setpts={pts_mult}*PTS")
        
    # 7. Text
    temp_text_path = None
    if overlay_text:
        temp_text_path = os.path.join(settings.HIGHLIGHTS_DIR, f"text_{uuid.uuid4().hex[:8]}.txt")
        with open(temp_text_path, "w", encoding="utf-8") as f:
            f.write(overlay_text)
        vf_filters.append(f"drawtext=textfile='{temp_text_path}':fontcolor=white:fontsize=h/10:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=2:shadowy=2")
        
    vf_string = ",".join(vf_filters) if vf_filters else ""
    
    cmd = ["ffmpeg", "-y", "-i", input_path]
    
    # Check background soundtrack
    soundtrack_path = None
    has_soundtrack = False
    if soundtrack and soundtrack != "none":
        candidate_wav = os.path.join(settings.MUSIC_DIR, f"{soundtrack}.wav")
        candidate_mp3 = os.path.join(settings.MUSIC_DIR, f"{soundtrack}.mp3")
        if os.path.exists(candidate_wav):
            soundtrack_path = candidate_wav
            has_soundtrack = True
        elif os.path.exists(candidate_mp3):
            soundtrack_path = candidate_mp3
            has_soundtrack = True
            
    if has_soundtrack:
        cmd.extend(["-stream_loop", "-1", "-i", soundtrack_path])

    # Handle clip reordering and transitions
    is_complex = False
    needs_complex = False
    if clip_order and len(clip_order) == 3 and clip_order != [0, 1, 2]:
        needs_complex = True
    if transition != "none":
        needs_complex = True
        
    if needs_complex:
        try:
            probe = ffmpeg.probe(input_path)
            total_duration = float(probe['format']['duration'])
            chunk_dur = total_duration / 3.0
            
            fps = 30
            for stream in probe.get('streams', []):
                if stream.get('codec_type') == 'video':
                    r_frame_rate = stream.get('r_frame_rate', '30/1')
                    try:
                        num, den = map(int, r_frame_rate.split('/'))
                        if den > 0:
                            fps = max(15, min(60, round(num / den)))
                    except Exception:
                        fps = 30
                    break
            
            filter_complex = []
            order = clip_order if (clip_order and len(clip_order) == 3) else [0, 1, 2]
            
            for i, orig_idx in enumerate(order):
                start = orig_idx * chunk_dur
                end = start + chunk_dur
                filter_complex.append(f"[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,fps={fps}[v{i}];")
                if not is_muted:
                    filter_complex.append(f"[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{i}];")
            
            if transition != "none":
                td = 0.5 # transition duration
                off1 = chunk_dur - td
                off2 = (chunk_dur * 2) - (td * 2)
                filter_complex.append(f"[v0][v1]xfade=transition={transition}:duration={td}:offset={off1}[v01];")
                filter_complex.append(f"[v01][v2]xfade=transition={transition}:duration={td}:offset={off2}[vout_raw];")
                if not is_muted:
                    filter_complex.append("[a0][a1][a2]concat=n=3:v=0:a=1[aout_raw];")
            else:
                filter_complex.append("[v0][v1][v2]concat=n=3:v=1:a=0[vout_raw];")
                if not is_muted:
                    filter_complex.append("[a0][a1][a2]concat=n=3:v=0:a=1[aout_raw];")
            
            # Video filter graph with standard yuv420p output
            if vf_string:
                filter_complex.append(f"[vout_raw]{vf_string},format=yuv420p[vout_final];")
            else:
                filter_complex.append(f"[vout_raw]format=yuv420p[vout_final];")
                
            # Audio speed & soundtrack mixing
            curr_a = "[aout_raw]"
            if not is_muted:
                if speed != 1.0 and speed > 0:
                    filter_complex.append(f"{curr_a}atempo={speed}[aout_speed];")
                    curr_a = "[aout_speed]"
                    
                if has_soundtrack:
                    filter_complex.append(f"[1:a]volume=0.32[bgm];{curr_a}[bgm]amix=inputs=2:duration=first[aout_final];")
                else:
                    filter_complex.append(f"{curr_a}anull[aout_final];")
            else:
                if has_soundtrack:
                    filter_complex.append(f"[1:a]volume=0.45[aout_final];")
                    
            fc_string = "".join(filter_complex).rstrip(";")
            cmd.extend(["-filter_complex", fc_string, "-map", "[vout_final]"])
            if not is_muted or has_soundtrack:
                cmd.extend(["-map", "[aout_final]"])
            if has_soundtrack:
                cmd.append("-shortest")
                
            is_complex = True
        except Exception as e:
            print(f"Failed to apply complex clip logic: {e}")
            is_complex = False

    if not is_complex:
        if has_soundtrack:
            fc = []
            if vf_string:
                fc.append(f"[0:v]{vf_string}[vout_final];")
            else:
                fc.append("[0:v]null[vout_final];")
                
            if not is_muted:
                orig_a = "[0:a]"
                if speed != 1.0 and speed > 0:
                    fc.append(f"[0:a]atempo={speed}[a_speed];")
                    orig_a = "[a_speed]"
                fc.append(f"[1:a]volume=0.32[bgm];{orig_a}[bgm]amix=inputs=2:duration=first[aout_final]")
            else:
                fc.append("[1:a]volume=0.45[aout_final]")
                
            cmd.extend(["-filter_complex", "".join(fc), "-map", "[vout_final]", "-map", "[aout_final]", "-shortest"])
        else:
            if vf_string:
                cmd.extend(["-vf", vf_string])
            if is_muted:
                cmd.append("-an")
            else:
                if speed != 1.0 and speed > 0:
                    cmd.extend(["-af", f"atempo={speed}"])
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
