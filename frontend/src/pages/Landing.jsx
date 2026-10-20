import { useNavigate } from 'react-router-dom';
import ScrambleText from '../components/ScrambleText';

const engines = [
  {
    num: '01',
    id: 'optical-motion',
    status: 'Available',
    statusColor: '#22d3ee',
    title: 'OPTICAL FLOW ENGINE',
    subtitle: 'cv2.calcOpticalFlowFarneback',
    desc: 'Subsamples at 5 FPS to compute dense luminance motion vectors, isolating rapid movement, athlete sprints, and sudden physical action.',
    metric: '98.4% Frame Accuracy'
  },
  {
    num: '02',
    id: 'audio-rms',
    status: 'Available',
    statusColor: '#facc15',
    title: 'ACOUSTIC TRANSIENTS',
    subtitle: '44.1kHz PCM 32-bit Float',
    desc: 'Extracts Root-Mean-Square acoustic energy windows to catch cheering crowds, referee whistles, impacts, and commentator excitement.',
    metric: '< 15ms Transient Lock'
  },
  {
    num: '03',
    id: 'cut-discontinuity',
    status: 'Active',
    statusColor: '#ff5722',
    title: 'CUT DISCONTINUITY',
    subtitle: 'Bhattacharyya Histogram Delta',
    desc: 'Calculates color histogram divergences between adjacent intervals to penalize abrupt mid-scene transitions, ensuring narrative coherence.',
    metric: 'Zero Mid-Clip Cuts'
  },
  {
    num: '04',
    id: 'reel-synthesis',
    status: 'Available',
    statusColor: '#ff3b30',
    title: 'INSTAGRAM REEL STUDIO',
    subtitle: '9:16 MP4 · 1080x1920',
    desc: 'Automates vertical center cropping, synthetic BGM ducking, smooth beat alignment, and interactive timeline calibration for social sharing.',
    metric: 'Ready-to-Post Export'
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: 'clamp(28px, 5vw, 64px) clamp(16px, 4vw, 40px)',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>

      {/* HERO SECTION — RENDER 2-COLUMN SPLIT */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        alignItems: 'center',
        gap: 'clamp(32px, 5vw, 64px)',
        marginBottom: '96px',
        position: 'relative'
      }}>
        {/* Left Column: Typographic Pitch & Action */}
        <div>
          {/* Subtle thermal aura announcement chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.12), rgba(250, 204, 21, 0.12), rgba(255, 87, 34, 0.14))',
            border: '1px solid rgba(255, 87, 34, 0.38)',
            marginBottom: '24px'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #facc15, #ff5722)',
              boxShadow: '0 0 8px rgba(255, 87, 34, 0.85)'
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              fontWeight: 600
            }} className="studio-spectrum-text">
              FRAMR CLOUD // DETERMINISTIC CV ENGINE
            </span>
          </div>

          {/* Main Headline with Typographic Scramble Animation */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5.2vw, 4.2rem)',
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: '0 0 24px',
          }}>
            Your fastest path to production for{' '}
            <ScrambleText />
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '540px',
            margin: '0 0 36px',
            fontWeight: 400
          }}>
            Intuitive infrastructure to extract, score, and compile vertical reels from your first video to your billionth. Sub-second latency without GPU bottlenecks.
          </p>

          {/* Action Button Row */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '36px' }}>
            <button
              onClick={() => navigate('/ingest')}
              className="btn-render-primary"
            >
              <span>Start for free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            <button
              onClick={() => navigate('/engine')}
              className="btn-render-outline"
            >
              <span>Explore CV Specs</span>
            </button>
          </div>

          {/* Render-style Trust / Telemetry Metrics */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 3vw, 24px)',
            borderTop: '1px solid var(--render-border)',
            paddingTop: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--render-emerald)' }}>✓</span>
              <span>&lt; 1.0s Ingest Latency</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--render-emerald)' }}>✓</span>
              <span>Zero GPU Required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--render-emerald)' }}>✓</span>
              <span>9:16 Instagram Reels</span>
            </div>
          </div>
        </div>

        {/* Right Column: Render Production Architecture Graphic */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
          {/* Floating $ git push pill with connecting branch line */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--render-panel)',
            border: '1px solid var(--render-border)',
            padding: '7px 14px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: '#f8fafc',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            marginBottom: '18px',
            marginLeft: '24px',
            position: 'relative'
          }}>
            <span style={{ color: 'var(--render-purple-light)' }}>$</span>
            <span>framr ingest footage.mp4</span>
            {/* Wire link down */}
            <div style={{
              position: 'absolute',
              bottom: '-19px',
              left: '28px',
              width: '2px',
              height: '19px',
              background: 'var(--render-purple)',
              opacity: 0.6
            }} />
          </div>

          {/* Architecture Container */}
          <div className="render-card" style={{
            padding: '24px',
            background: 'var(--render-surface)',
            border: '1px solid var(--render-border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header label */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--render-border)'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                PRODUCTION PIPELINE
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--render-emerald)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--render-emerald)' }} />
                Operational
              </span>
            </div>

            {/* Pipeline Service Grid (matches Render app cards from screenshot) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              
              {/* Card 1: Optical Engine */}
              <div style={{
                background: 'var(--render-card)',
                border: '1px solid var(--render-border)',
                borderRadius: '5px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>app-optical</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    color: 'var(--render-purple-accent)',
                    background: 'var(--render-purple-glow)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--render-border-hover)'
                  }}>
                    Deploying
                  </span>
                </div>
                {/* Sparkline curve */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '3px' }}>
                    <span>MOTION DELTA</span>
                    <span style={{ color: 'var(--render-purple-light)' }}>0.84 RMS</span>
                  </div>
                  <svg width="100%" height="24" viewBox="0 0 120 24" fill="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="studioSparkGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="45%" stopColor="#facc15" />
                        <stop offset="85%" stopColor="#ff5722" />
                        <stop offset="100%" stopColor="#ff3b30" />
                      </linearGradient>
                    </defs>
                    <path d="M0 20 L20 18 L35 8 L50 16 L70 4 L85 12 L105 2 L120 14" stroke="url(#studioSparkGrad)" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M0 20 L20 18 L35 8 L50 16 L70 4 L85 12 L105 2 L120 14 L120 24 L0 24 Z" fill="rgba(255, 87, 34, 0.15)" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Acoustic RMS */}
              <div style={{
                background: 'var(--render-card)',
                border: '1px solid var(--render-border)',
                borderRadius: '5px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5v14M7 9v6M22 12v0M2 12v0"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>app-audio</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    color: 'var(--render-emerald)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    ● Available
                  </span>
                </div>
                {/* Sparkline curve */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '3px' }}>
                    <span>AUDIO TRANSIENTS</span>
                    <span style={{ color: 'var(--render-emerald)' }}>44.1 kHz</span>
                  </div>
                  <svg width="100%" height="24" viewBox="0 0 120 24" fill="none" style={{ overflow: 'visible' }}>
                    <path d="M0 16 L15 14 L30 18 L45 6 L60 20 L75 2 L90 12 L105 5 L120 18" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M0 16 L15 14 L30 18 L45 6 L60 20 L75 2 L90 12 L105 5 L120 18 L120 24 L0 24 Z" fill="rgba(16, 185, 129, 0.1)" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Cut Boundary */}
              <div style={{
                background: 'var(--render-card)',
                border: '1px solid var(--render-border)',
                borderRadius: '5px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>app-scenes</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    color: 'var(--render-emerald)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    ● Available
                  </span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '3px' }}>
                    <span>BHATTACHARYYA</span>
                    <span style={{ color: 'var(--render-purple-light)' }}>d &lt; 0.35</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--render-panel)', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
                    <div style={{ width: '74%', height: '100%', background: 'var(--render-purple)' }} />
                  </div>
                </div>
              </div>

              {/* Card 4: Reel Compiler */}
              <div style={{
                background: 'var(--render-card)',
                border: '1px solid var(--render-border)',
                borderRadius: '5px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>app-reel-9:16</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    color: 'var(--render-emerald)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    ● Ready
                  </span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '3px' }}>
                    <span>OUTPUT FORMAT</span>
                    <span style={{ color: 'var(--text-primary)' }}>1080x1920</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', background: 'var(--render-panel)', padding: '2px 5px', borderRadius: '2px', color: 'var(--text-secondary)' }}>H.264</span>
                    <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', background: 'var(--render-panel)', padding: '2px 5px', borderRadius: '2px', color: 'var(--text-secondary)' }}>AAC-BGM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Render Decorative Thermal Aura Multicolor Geometry */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              opacity: 0.95
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#22d3ee', borderRadius: '2px', boxShadow: '0 0 8px rgba(34, 211, 238, 0.7)' }} />
                <div style={{ width: '24px', height: '12px', background: 'rgba(250, 204, 21, 0.75)', borderRadius: '2px', boxShadow: '0 0 6px rgba(250, 204, 21, 0.5)' }} />
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '24px', height: '8px', background: 'rgba(255, 87, 34, 0.7)', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '8px', background: '#ff3b30', borderRadius: '2px', boxShadow: '0 0 8px rgba(255, 59, 48, 0.7)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-MODULE CAPABILITIES SECTION — RENDER CARDS */}
      <section style={{ marginBottom: '96px' }}>
        <div style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--render-purple-accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            SYSTEM ARCHITECTURE
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: '8px 0 12px'
          }}>
            Four autonomous engines. Zero latency overhead.
          </h2>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: 0
          }}>
            Every video is processed in an asynchronous pipeline using deterministic mathematical heuristics, guaranteeing predictable execution and zero cold starts.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {engines.map((e) => (
            <div
              key={e.num}
              className="render-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--text-dim)',
                    fontWeight: 600
                  }}>
                    {e.num} // {e.id}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: e.statusColor
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: e.statusColor }} />
                    {e.status}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em'
                }}>
                  {e.title}
                </h3>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.66rem',
                  color: 'var(--render-purple-accent)',
                  marginBottom: '12px'
                }}>
                  {e.subtitle}
                </div>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {e.desc}
                </p>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '12px',
                borderTop: '1px solid var(--render-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>BENCHMARK</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RENDER MIGRATION / ACTION BANNER */}
      <section className="render-card" style={{
        padding: 'clamp(28px, 4vw, 44px)',
        background: 'linear-gradient(135deg, rgba(20, 12, 10, 0.92) 0%, rgba(10, 7, 12, 0.96) 100%)',
        border: '1px solid rgba(255, 87, 34, 0.38)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 87, 34, 0.2), 0 0 15px rgba(34, 211, 238, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '28px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--render-purple-accent)',
            fontWeight: 600
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
            FULL 6-STAGE PIPELINE READY FOR EVALUATION
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            margin: '0 0 10px'
          }}>
            Ready to extract your first vertical highlight?
          </h3>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0
          }}>
            Drop any MP4/MOV file or click the 1-click test suite to observe real-time OpenCV motion vector extraction, tune sensitivity sliders, and preview your 9:16 Instagram Reel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/ingest')}
            className="btn-render-primary"
            style={{ padding: '13px 28px' }}
          >
            <span>Launch Ingestion Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button
            onClick={() => navigate('/engine')}
            className="btn-render-outline"
            style={{ padding: '13px 22px' }}
          >
            <span>View CV Formulas</span>
          </button>
        </div>
      </section>

    </div>
  );
}
