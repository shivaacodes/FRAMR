import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  const initWebAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins
      analyser.smoothingTimeConstant = 0.82;

      if (audioRef.current && !sourceRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      }
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  };

  useEffect(() => {
    const audio = new Audio('/audio/cyber_ambient.mp3');
    audio.loop = true;
    audio.volume = 0.22; // Subtle studio ambiance
    audioRef.current = audio;

    // Animation frame loop driving CSS variables in real time (60fps)
    const updateMeter = (timestamp) => {
      if (analyserRef.current && audioRef.current && !audioRef.current.paused) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);

        // Bass frequencies (bins 0-3: 0 to ~250 Hz) for kicks and beats
        let bassSum = 0;
        for (let i = 0; i < 4; i++) bassSum += data[i];
        const rawBass = bassSum / (4 * 255);

        // Mid frequencies (bins 4-12: ~250 Hz to ~1.2 kHz)
        let midSum = 0;
        for (let i = 4; i < 13; i++) midSum += data[i];
        const rawMid = midSum / (9 * 255);

        // Treble frequencies (bins 13-31)
        let trebSum = 0;
        for (let i = 13; i < 32; i++) trebSum += data[i];
        const rawTreble = trebSum / (19 * 255);

        const bass = Math.min(1.0, rawBass * 1.6);
        const energy = Math.min(1.0, bass * 0.65 + rawMid * 0.25 + rawTreble * 0.1);
        const flash = Math.min(1.0, 0.25 + bass * 0.75);
        const scale = 1 + bass * 0.22;

        document.documentElement.style.setProperty('--audio-bass', bass.toFixed(3));
        document.documentElement.style.setProperty('--audio-energy', energy.toFixed(3));
        document.documentElement.style.setProperty('--audio-flash', flash.toFixed(3));
        document.documentElement.style.setProperty('--audio-scale', scale.toFixed(3));
      } else {
        // Idle gentle breathing when paused or waiting for gesture
        const time = (timestamp || 0) * 0.0016;
        const idlePulse = 0.28 + 0.12 * Math.sin(time);
        document.documentElement.style.setProperty('--audio-bass', '0.2');
        document.documentElement.style.setProperty('--audio-energy', idlePulse.toFixed(3));
        document.documentElement.style.setProperty('--audio-flash', idlePulse.toFixed(3));
        document.documentElement.style.setProperty('--audio-scale', '1.0');
      }
      rafRef.current = requestAnimationFrame(updateMeter);
    };

    rafRef.current = requestAnimationFrame(updateMeter);

    // Attempt autoplay
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true);
          initWebAudio();
        })
        .catch(() => {
          // Autoplay policy: unlock on first user gesture
          const unlockAudio = () => {
            initWebAudio();
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
              audioCtxRef.current.resume();
            }
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
          };

          window.addEventListener('click', unlockAudio);
          window.addEventListener('keydown', unlockAudio);
          window.addEventListener('touchstart', unlockAudio);
        });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log('Audio play failed', e));
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
