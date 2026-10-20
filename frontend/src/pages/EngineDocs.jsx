import { useNavigate } from 'react-router-dom';

const modules = [
  {
    num: '01',
    accent: 'var(--render-purple-light)',
    title: 'OPTICAL MOTION DIFFERENTIAL & SCENE CUTS',
    badge: 'OPENCV 4.X · SUBSAMPLED 5 FPS',
    badgeColor: 'var(--render-purple-accent)',
    body: 'To achieve high-throughput analysis without GPU tensor bottlenecks, frames are extracted into grayscale matrices at 320×180 resolution. The motion excitation metric computes the mean absolute difference of spatial pixel intensities across consecutive frames:',
    formula: 'ΔM(t) = (1 / (W × H)) · Σ | I(x, y, t) - I(x, y, t - Δt) |',
    formulaColor: 'var(--render-purple-accent)',
    footer: 'Simultaneously, color histogram correlation across Hue-Saturation channels is measured via Bhattacharyya comparison. Hard scene cuts mid-window are penalized by a 50% discount factor to prevent jarring discontinuities.',
  },
  {
    num: '02',
    accent: 'var(--render-emerald)',
    title: 'ACOUSTIC RMS ENERGY EXTRACTION',
    badge: 'PCM_F32LE · 44.1 KHZ MONO',
    badgeColor: 'var(--render-emerald)',
    body: 'Audio signals are piped in 32-bit floating point PCM format. Root-mean-square amplitude calculates acoustic transient spikes synchronized per video frame:',
    formula: 'RMS(frame_i) = sqrt( (1 / N) · Σ s[k]² )  where N = int(44100 / FPS)',
    formulaColor: 'var(--render-emerald)',
    footer: 'The RMS array is normalized to [0.0, 1.0]. A multi-modal fusion score weights audio excitement at 60% and visual motion at 40%, followed by a 2-second Gaussian moving average filter to locate sustained action.',
  },
  {
    num: '03',
    accent: 'var(--render-purple)',
    title: 'HIGH-THROUGHPUT FFMPEG COMPILATION GRAPH',
    badge: 'LIBX264 · PRESET ULTRAFAST · CFR 30FPS',
    badgeColor: 'var(--render-purple-light)',
    body: 'The backend engine translates user parameters (clip reordering, transitions, slow-mo, aspect ratio, audio ducking) into a single-pass filter complex graph:',
    formula: null,
    formulaColor: null,
    footer: null,
    graphLines: [
      '[0:v] ──► trim + setpts + fps ──► [v0, v1, v2] ──► xfade (0.5s) ──► crop(9:16) ──► [vout]',
      '[0:a] ──► atrim + asetpts       ──► [a0, a1, a2] ──► concat       ──► atempo(speed) ──┐',
      '[1:a] ──► stream_loop (BGM)     ──► volume(0.32) ──────────────────────────────────► amix ──► [aout]',
    ],
  },
];

const benchmarks = [
  { val: '18.3x', label: 'TRANSCODE SPEEDUP', color: 'var(--render-purple-light)' },
  { val: '< 0.9s', label: 'REEL COMPILATION LATENCY', color: 'var(--render-emerald)' },
  { val: '60 FPS', label: 'CONSTANT FRAME RATE', color: 'var(--render-purple-accent)' },
  { val: '100%', label: 'OFFLINE / ZERO MODEL BLOAT', color: 'var(--render-amber)' },
];

export default function EngineDocs() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: '1160px',
      margin: '0 auto',
      padding: 'clamp(20px, 4vw, 44px) clamp(16px, 3vw, 32px)',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Computer Vision &amp; Signal Architecture
            </h1>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            margin: '0 0 0 16px'
          }}>
            Mathematical formulations, multi-modal signal processing, and deterministic filter graph topology
          </p>
        </div>

        <button
          onClick={() => navigate('/ingest')}
          className="btn-render-primary"
          style={{ padding: '9px 18px', fontSize: '0.8rem' }}
        >
          <span>Launch Ingestion</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Module cards */}
        {modules.map((m) => (
          <div key={m.num} className="render-card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                fontSize: '1.02rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.accent, display: 'inline-block', flexShrink: 0 }} />
                <span>{m.num} // {m.title}</span>
              </h3>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.64rem',
                color: m.badgeColor,
                background: 'var(--render-surface)',
                border: '1px solid var(--render-border)',
                padding: '3px 9px',
                borderRadius: '4px',
                fontWeight: 600,
              }}>
                {m.badge}
              </span>
            </div>

            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '14px',
              fontFamily: 'var(--font-ui)'
            }}>
              {m.body}
            </p>

            {m.formula && (
              <div style={{
                background: '#040407',
                border: '1px solid var(--render-border)',
                borderLeft: '3px solid var(--render-purple)',
                padding: '14px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                color: m.formulaColor,
                marginBottom: '14px',
                overflowX: 'auto',
                borderRadius: '4px',
              }}>
                {m.formula}
              </div>
            )}

            {m.graphLines && (
              <div style={{
                background: '#040407',
                border: '1px solid var(--render-border)',
                borderLeft: '3px solid var(--render-purple)',
                padding: '14px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.9',
                borderRadius: '4px',
                overflowX: 'auto',
              }}>
                {m.graphLines.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}

            {m.footer && (
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
                fontFamily: 'var(--font-ui)'
              }}>
                {m.footer}
              </p>
            )}
          </div>
        ))}

        {/* Benchmarks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '8px'
        }}>
          {benchmarks.map((b) => (
            <div key={b.label} className="render-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem',
                color: b.color,
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                {b.val}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em'
              }}>
                {b.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
