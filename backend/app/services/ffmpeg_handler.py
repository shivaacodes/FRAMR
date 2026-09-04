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
        merged = ffmpeg.concat(*streams, v=1, a=1)
        
        # Output with standard encoding
        out = ffmpeg.output(
            merged, 
            output_path, 
            vcodec='libx264', 
            preset='fast', 
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
