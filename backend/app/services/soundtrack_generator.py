import os
import wave
import numpy as np

SAMPLE_RATE = 44100

def save_wav(filename: str, audio: np.ndarray):
    # Normalize to -1.0 to 1.0, then scale to 16-bit PCM
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = audio / max_val * 0.85
    int_audio = (audio * 32767).astype(np.int16)
    
    with wave.open(filename, "w") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(int_audio.tobytes())

def generate_kick(t, duration=0.25):
    # Pitch drop from 150 Hz to 45 Hz
    freq = 45.0 + 105.0 * np.exp(-t[:int(SAMPLE_RATE * duration)] * 25)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    envelope = np.exp(-t[:int(SAMPLE_RATE * duration)] * 12)
    hit = np.sin(phase) * envelope
    out = np.zeros_like(t)
    out[:len(hit)] = hit
    return out

def generate_snare(t, duration=0.2):
    noise = np.random.uniform(-1, 1, int(SAMPLE_RATE * duration))
    tone = np.sin(2 * np.pi * 180 * t[:int(SAMPLE_RATE * duration)])
    envelope = np.exp(-t[:int(SAMPLE_RATE * duration)] * 20)
    hit = (noise * 0.7 + tone * 0.3) * envelope
    out = np.zeros_like(t)
    out[:len(hit)] = hit
    return out

def generate_hihat(t, duration=0.08):
    noise = np.random.uniform(-1, 1, int(SAMPLE_RATE * duration))
    envelope = np.exp(-t[:int(SAMPLE_RATE * duration)] * 60)
    hit = noise * envelope
    out = np.zeros_like(t)
    out[:len(hit)] = hit
    return out

def generate_cyber_beat(duration=20.0):
    total_samples = int(SAMPLE_RATE * duration)
    bpm = 126
    beat_sec = 60.0 / bpm
    step_sec = beat_sec / 4  # 16th notes
    steps = int(duration / step_sec)
    
    audio = np.zeros(total_samples)
    t_full = np.linspace(0, duration, total_samples, endpoint=False)
    
    # Bass frequencies (A1, C2, D2, F1)
    notes = [55.0, 65.41, 73.42, 43.65]
    
    for s in range(steps):
        sample_idx = int(s * step_sec * SAMPLE_RATE)
        t_rem = duration - (s * step_sec)
        if t_rem <= 0:
            break
        t_step = np.linspace(0, min(1.0, t_rem), int(SAMPLE_RATE * min(1.0, t_rem)), endpoint=False)
        
        # Kick on 0, 4, 8, 12 (four on the floor)
        if s % 4 == 0:
            k = generate_kick(t_step, duration=0.25)
            end_idx = min(total_samples, sample_idx + len(k))
            audio[sample_idx:end_idx] += k[:end_idx - sample_idx] * 1.0
            
        # Snare on 4, 12
        if s % 8 == 4:
            sn = generate_snare(t_step, duration=0.2)
            end_idx = min(total_samples, sample_idx + len(sn))
            audio[sample_idx:end_idx] += sn[:end_idx - sample_idx] * 0.8
            
        # Hi-hat on every 2 steps
        if s % 2 == 1:
            hh = generate_hihat(t_step, duration=0.08)
            end_idx = min(total_samples, sample_idx + len(hh))
            audio[sample_idx:end_idx] += hh[:end_idx - sample_idx] * 0.4
            
        # Synth Bassline (16th notes)
        note_freq = notes[(s // 16) % len(notes)]
        # Arpeggiate
        arp_mult = [1.0, 1.0, 2.0, 1.5][s % 4]
        freq = note_freq * arp_mult
        bass_env = np.exp(-t_step[:int(SAMPLE_RATE * step_sec)] * 15)
        # Sawtooth harmonic mix
        b_tone = np.sin(2 * np.pi * freq * t_step[:int(SAMPLE_RATE * step_sec)]) + \
                 0.5 * np.sin(2 * np.pi * 2 * freq * t_step[:int(SAMPLE_RATE * step_sec)])
        bass = b_tone * bass_env * 0.5
        end_idx = min(total_samples, sample_idx + len(bass))
        audio[sample_idx:end_idx] += bass[:end_idx - sample_idx]
        
    return audio

def generate_epic_action(duration=20.0):
    total_samples = int(SAMPLE_RATE * duration)
    bpm = 100
    beat_sec = 60.0 / bpm
    audio = np.zeros(total_samples)
    
    beats = int(duration / beat_sec)
    for b in range(beats):
        sample_idx = int(b * beat_sec * SAMPLE_RATE)
        t_step = np.linspace(0, min(1.5, duration - b * beat_sec), int(SAMPLE_RATE * min(1.5, duration - b * beat_sec)), endpoint=False)
        
        # Heavy cinematic hit on 0, 4, 8...
        if b % 4 == 0:
            # Sub braam
            freq = 40.0 + 30.0 * np.exp(-t_step * 2)
            phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
            hit = np.sin(phase) * np.exp(-t_step * 1.5) * 1.2
            # Add distortion grit
            hit = np.tanh(hit * 1.5)
            end_idx = min(total_samples, sample_idx + len(hit))
            audio[sample_idx:end_idx] += hit[:end_idx - sample_idx]
            
        # Dramatic pulse on every beat
        pulse = np.sin(2 * np.pi * 65.41 * t_step[:int(SAMPLE_RATE * 0.3)]) * np.exp(-t_step[:int(SAMPLE_RATE * 0.3)] * 8) * 0.6
        end_idx = min(total_samples, sample_idx + len(pulse))
        audio[sample_idx:end_idx] += pulse[:end_idx - sample_idx]
        
    # Low atmospheric drone
    t_full = np.linspace(0, duration, total_samples, endpoint=False)
    drone = 0.25 * np.sin(2 * np.pi * 55.0 * t_full) + 0.15 * np.sin(2 * np.pi * 110.0 * t_full + 0.5)
    audio += drone
    return audio

def generate_lofi_chill(duration=20.0):
    total_samples = int(SAMPLE_RATE * duration)
    bpm = 75
    beat_sec = 60.0 / bpm
    audio = np.zeros(total_samples)
    
    # Warm chords (frequencies)
    # Dm7 (D3, F3, A3, C4), G7 (G3, B3, D4, F4), Cmaj7 (C3, E3, G3, B3), Am7 (A2, C3, E3, G3)
    chord_prog = [
        [146.83, 174.61, 220.00, 261.63], # Dm7
        [196.00, 246.94, 293.66, 349.23], # G7
        [130.81, 164.81, 196.00, 246.94], # Cmaj7
        [110.00, 130.81, 164.81, 196.00]  # Am7
    ]
    
    chords_count = int(duration / (beat_sec * 4)) + 1
    for c_idx in range(chords_count):
        start_time = c_idx * (beat_sec * 4)
        sample_idx = int(start_time * SAMPLE_RATE)
        if sample_idx >= total_samples:
            break
        chord = chord_prog[c_idx % len(chord_prog)]
        dur = min(beat_sec * 4, duration - start_time)
        t_chord = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
        chord_wave = np.zeros_like(t_chord)
        for note in chord:
            # Electric piano timbre: soft sine + subtle 2nd harmonic
            chord_wave += 0.2 * np.sin(2 * np.pi * note * t_chord) * np.exp(-t_chord * 0.4)
            chord_wave += 0.05 * np.sin(2 * np.pi * note * 2 * t_chord) * np.exp(-t_chord * 0.6)
            
        end_idx = min(total_samples, sample_idx + len(chord_wave))
        audio[sample_idx:end_idx] += chord_wave[:end_idx - sample_idx]
        
    # Add gentle kick and soft snare
    steps = int(duration / beat_sec)
    for s in range(steps):
        sample_idx = int(s * beat_sec * SAMPLE_RATE)
        dur = min(0.4, duration - s * beat_sec)
        if dur <= 0:
            break
        t_step = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
        if s % 2 == 0:
            # Soft muffled kick
            k = np.sin(2 * np.pi * 55 * np.exp(-t_step * 15) * t_step) * np.exp(-t_step * 8) * 0.6
            end_idx = min(total_samples, sample_idx + len(k))
            audio[sample_idx:end_idx] += k[:end_idx - sample_idx]
        else:
            # Soft rimshot
            sn = (np.random.uniform(-0.5, 0.5, len(t_step)) * 0.3) * np.exp(-t_step * 25)
            end_idx = min(total_samples, sample_idx + len(sn))
            audio[sample_idx:end_idx] += sn[:end_idx - sample_idx]
            
    # Soft vinyl crackle texture
    crackle = np.random.choice([0, 0, 0, 0.15, -0.15], size=total_samples, p=[0.97, 0.015, 0.01, 0.003, 0.002])
    audio += crackle
    return audio

def ensure_soundtracks():
    music_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "music")
    os.makedirs(music_dir, exist_ok=True)
    
    tracks = {
        "cyber_beat.wav": generate_cyber_beat,
        "epic_action.wav": generate_epic_action,
        "lofi_chill.wav": generate_lofi_chill,
    }
    
    for filename, gen_func in tracks.items():
        filepath = os.path.join(music_dir, filename)
        if not os.path.exists(filepath):
            print(f"[AudioEngine] Synthesizing soundtrack: {filename}...")
            data = gen_func(duration=25.0)
            save_wav(filepath, data)
            print(f"[AudioEngine] Created {filepath}")

if __name__ == "__main__":
    ensure_soundtracks()
