import os
import whisper
import uuid
from app.core.config import settings

# Load the whisper model once globally to save time
# For demo purposes, we use 'tiny' or 'base'. 'tiny' is super fast.
try:
    print("[Whisper] Loading tiny model...")
    model = whisper.load_model("tiny")
    print("[Whisper] Model loaded successfully.")
except Exception as e:
    print(f"[Whisper] Failed to load model: {e}")
    model = None

def format_timestamp(seconds: float, always_include_hours: bool = False):
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)
    
    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000
    
    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000
    
    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000
    
    hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else "00:"
    return f"{hours_marker}{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def transcribe_and_generate_srt(video_path: str) -> str:
    """
    Transcribes the given video/audio file and saves an .srt file.
    Returns the absolute path to the generated .srt file, or None if failed.
    """
    if not model:
        return None
        
    try:
        print(f"[Transcriber] Starting transcription for {os.path.basename(video_path)}...")
        result = model.transcribe(video_path, word_timestamps=False)
        segments = result.get("segments", [])
        
        # Generate SRT format
        srt_content = ""
        for i, segment in enumerate(segments, start=1):
            start = format_timestamp(segment['start'])
            end = format_timestamp(segment['end'])
            text = segment['text'].strip()
            
            srt_content += f"{i}\n"
            srt_content += f"{start} --> {end}\n"
            srt_content += f"{text}\n\n"
            
        srt_filename = f"captions_{uuid.uuid4().hex[:8]}.srt"
        srt_path = os.path.join(settings.HIGHLIGHTS_DIR, srt_filename)
        
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)
            
        print(f"[Transcriber] Generated {len(segments)} caption segments to {srt_filename}")
        return srt_filename
    except Exception as e:
        print(f"[Transcriber] Transcription failed: {e}")
        return None
