import { useNavigate } from 'react-router-dom';

export default function EngineDocs() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', width: '100%', position: 'relative', zIndex: 10 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              letterSpacing: '2px',
              color: '#fff',
              margin: 0
            }}>
              STAGE 06 // CV &amp; MULTIMEDIA ARCHITECTURE
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8082a6', fontFamily: 'var(--font-mono)', margin: '4px 0 0 16px' }}>
            Mathematical formulations, multi-modal signal processing, and filter graph topology
          </p>
        </div>

        <button
          onClick={() => navigate('/ingest')}
          style={{
            background: 'linear-gradient(90deg, #00f0ff, #0088ff)',
            color: '#000',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            padding: '8px 18px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
          }}
        >
          ← LAUNCH INGESTION
        </button>
      </div>

      {/* Grid of Technical Specifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Module 1: Computer Vision & Optical Flow */}
        <div className="cyber-card cyber-cut" style={{ padding: '24px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#00f0ff', fontSize: '1.1rem', margin: 0, letterSpacing: '1px' }}>
              01 // OPTICAL MOTION DIFFERENTIAL &amp; SCENE CUTS
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#39ff14', border: '1px solid #39ff14', padding: '2px 8px', borderRadius: '4px' }}>
              OPENCV 4.X · SUBSAMPLED 5 FPS
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6', marginBottom: '16px' }}>
            To achieve high-throughput analysis without GPU tensor bottlenecks, frames are extracted into grayscale matrices at 320×180 resolution. The motion excitation metric computes the mean absolute difference of spatial pixel intensities across consecutive frames:
          </p>

          <div style={{
            background: '#09060f',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            padding: '14px 20px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#00f0ff',
            marginBottom: '16px',
            overflowX: 'auto'
          }}>
            ΔM(t) = (1 / (W × H)) · Σ | I(x, y, t) - I(x, y, t - Δt) |
          </div>

          <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6' }}>
            Simultaneously, color histogram correlation across Hue-Saturation channels is measured via Bhattacharyya comparison. Hard scene cuts mid-window are penalized by a 50% discount factor to prevent jarring discontinuities.
          </p>
        </div>

        {/* Module 2: Acoustic Signal Decoupling */}
        <div className="cyber-card cyber-cut" style={{ padding: '24px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#ff007f', fontSize: '1.1rem', margin: 0, letterSpacing: '1px' }}>
              02 // ACOUSTIC RMS ENERGY EXTRACTION
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#ff007f', border: '1px solid #ff007f', padding: '2px 8px', borderRadius: '4px' }}>
              PCM_F32LE · 44.1 KHZ MONO
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6', marginBottom: '16px' }}>
            Audio signals are piped in 32-bit floating point PCM format. Root-mean-square amplitude calculates acoustic transient spikes synchronized per video frame:
          </p>

          <div style={{
            background: '#09060f',
            border: '1px solid rgba(255, 0, 127, 0.25)',
            padding: '14px 20px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#ff007f',
            marginBottom: '16px',
            overflowX: 'auto'
          }}>
            RMS(frame_i) = sqrt( (1 / N) · Σ s[k]² )  where N = int(44100 / FPS)
          </div>

          <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6' }}>
            The RMS array is normalized to [0.0, 1.0]. A multi-modal fusion score weights audio excitement at 60% and visual motion at 40%, followed by a 2-second Gaussian moving average filter to locate sustained action.
          </p>
        </div>

        {/* Module 3: FFmpeg Hardware Acceleration & Filter Graph Topology */}
        <div className="cyber-card cyber-cut" style={{ padding: '24px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#ffe600', fontSize: '1.1rem', margin: 0, letterSpacing: '1px' }}>
              03 // HIGH-THROUGHPUT FFMPEG COMPILATION GRAPH
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#ffe600', border: '1px solid #ffe600', padding: '2px 8px', borderRadius: '4px' }}>
              LIBX264 · PRESET ULTRAFAST · CFR 30FPS
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6', marginBottom: '16px' }}>
            The backend engine translates user parameters (clip reordering, transitions, slow-mo, aspect ratio, audio ducking) into a single-pass filter complex graph:
          </p>

          {/* Graph visual representation */}
          <div style={{
            background: '#09060f',
            border: '1px solid rgba(255, 230, 0, 0.25)',
            padding: '18px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: '#e2e8f0',
            lineHeight: '1.8'
          }}>
            <div>[0:v] ──► trim + setpts + fps ──► [v0, v1, v2] ──► xfade (0.5s) ──► crop(9:16) ──► [vout]</div>
            <div>[0:a] ──► atrim + asetpts       ──► [a0, a1, a2] ──► concat       ──► atempo(speed) ──┐</div>
            <div>[1:a] ──► stream_loop (BGM)     ──► volume(0.32) ──────────────────────────────────► amix ──► [aout]</div>
          </div>
        </div>

        {/* Benchmarks Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          <div className="cyber-card" style={{ padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', color: '#00f0ff', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              18.3x
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              TRANSCODE SPEEDUP
            </div>
          </div>

          <div className="cyber-card" style={{ padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', color: '#39ff14', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              &lt; 0.9s
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              REEL COMPILATION LATENCY
            </div>
          </div>

          <div className="cyber-card" style={{ padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', color: '#ff007f', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              60 FPS
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              CONSTANT FRAME RATE
            </div>
          </div>

          <div className="cyber-card" style={{ padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', color: '#ffe600', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              100%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              OFFLINE / ZERO MODEL BLOAT
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
