import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Landing() {
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/demo-video`, { method: 'POST' });
      const data = await res.json();
      if (data.video_id) {
        navigate(`/processing/${data.video_id}`);
      } else {
        alert('Could not start demo job');
      }
    } catch (err) {
      console.error(err);
      alert('Demo initialization failed. Is the backend server running?');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px', width: '100%', position: 'relative', zIndex: 10 }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
        
        {/* Cyberpunk Top Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '30px',
          padding: '6px 18px',
          marginBottom: '24px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '2px', fontWeight: 700 }}>
            MULTIMODAL COMPUTER VISION &amp; AUDIO TRANSIENT ENGINE
          </span>
        </div>

        {/* Main Wordmark & Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          lineHeight: '1.05',
          letterSpacing: '2px',
          color: '#ffffff',
          margin: '0 auto 20px',
          maxWidth: '960px',
          textShadow: '0 0 30px rgba(0, 240, 255, 0.35)'
        }}>
          AUTOMATED HIGHLIGHTS. <br />
          <span style={{
            background: 'linear-gradient(90deg, #00f0ff, #ffe600, #ff007f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            CYBERPUNK REEL STUDIO.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#a3a6c9',
          maxWidth: '780px',
          margin: '0 auto 36px',
          lineHeight: '1.6',
          letterSpacing: '0.5px'
        }}>
          Fuses OpenCV optical motion differentials, Bhattacharyya histogram scene cut boundaries, and 44.1kHz acoustic RMS energy. Compiles ready-to-post 9:16 Instagram Reels with beat-matched audio ducking in under 1 second.
        </p>

        {/* High-Impact Action CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLaunchDemo}
            disabled={isDemoLoading}
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #0077ff)',
              color: '#000000',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              fontSize: '0.92rem',
              letterSpacing: '1px',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.6)',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            {isDemoLoading ? 'ENGAGING CYBER_CORE...' : '1-CLICK LIVE DEMO'}
          </button>

          <button
            onClick={() => navigate('/ingest')}
            style={{
              background: 'rgba(255, 0, 127, 0.1)',
              border: '1.5px solid #ff007f',
              color: '#ff007f',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              letterSpacing: '1px',
              padding: '16px 28px',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(255, 0, 127, 0.25)',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📁</span> INGEST CUSTOM VIDEO
          </button>

          <button
            onClick={() => navigate('/engine')}
            style={{
              background: 'rgba(255, 230, 0, 0.08)',
              border: '1.5px solid #ffe600',
              color: '#ffe600',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              letterSpacing: '1px',
              padding: '16px 24px',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(255, 230, 0, 0.2)',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔬</span> CV SPECS &amp; MATH
          </button>
        </div>
      </section>

      {/* ── METRICS TICKER ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '60px'
      }}>
        <div className="cyber-card cyber-cut" style={{ padding: '20px', textAlign: 'center', borderRadius: '10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#00f0ff', fontWeight: 800 }}>
            47.7x
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8082a6', marginTop: '6px', letterSpacing: '1px' }}>
            TRANSCODE VELOCITY (FFMPEG)
          </div>
        </div>

        <div className="cyber-card cyber-cut" style={{ padding: '20px', textAlign: 'center', borderRadius: '10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#39ff14', fontWeight: 800 }}>
            &lt; 0.9s
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8082a6', marginTop: '6px', letterSpacing: '1px' }}>
            HIGHLIGHT EXTRACTION LATENCY
          </div>
        </div>

        <div className="cyber-card cyber-cut" style={{ padding: '20px', textAlign: 'center', borderRadius: '10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#ff007f', fontWeight: 800 }}>
            60 FPS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8082a6', marginTop: '6px', letterSpacing: '1px' }}>
            CONSTANT FRAME RATE (CFR)
          </div>
        </div>

        <div className="cyber-card cyber-cut" style={{ padding: '20px', textAlign: 'center', borderRadius: '10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#ffe600', fontWeight: 800 }}>
            100%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8082a6', marginTop: '6px', letterSpacing: '1px' }}>
            OFFLINE / ZERO MODEL BLOAT
          </div>
        </div>
      </section>

      {/* ── 4-PILLAR ARCHITECTURE SHOWCASE ── */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            letterSpacing: '2px',
            color: '#fff',
            margin: '0 0 8px'
          }}>
            FOUR ENGINES. ZERO LATENCY.
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#8082a6' }}>
            Designed for high performance without GPU tensor overhead
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1 */}
          <div className="cyber-card" style={{ padding: '24px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>👁️</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#00f0ff', margin: 0, letterSpacing: '1px' }}>
                OPTICAL FLOW
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
              Computes spatial luminance differentials $\Delta M(t)$ across subsampled 5 FPS frames, isolating sudden action, athlete motion, and camera pans.
            </p>
          </div>

          {/* Card 2 */}
          <div className="cyber-card" style={{ padding: '24px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔊</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#ff007f', margin: 0, letterSpacing: '1px' }}>
                ACOUSTIC ENERGY
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
              Decodes 32-bit floating point PCM audio to compute Root-Mean-Square (RMS) amplitude spikes, locking onto cheering, impact, and commentators.
            </p>
          </div>

          {/* Card 3 */}
          <div className="cyber-card" style={{ padding: '24px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>✂️</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#ffe600', margin: 0, letterSpacing: '1px' }}>
                CUT DISCONTINUITY
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
              Applies Bhattacharyya color histogram difference to penalize hard scene transitions mid-window, guaranteeing smooth narrative continuity.
            </p>
          </div>

          {/* Card 4 */}
          <div className="cyber-card" style={{ padding: '24px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#39ff14', margin: 0, letterSpacing: '1px' }}>
                INSTAGRAM REEL
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
              Auto-crops to 9:16 vertical MP4 with synthetic BGM ducking, double-tap floating hearts, interactive comments, and 1-click social export.
            </p>
          </div>
        </div>
      </section>

      {/* ── ACADEMIC / EVALUATION CALLOUT ── */}
      <section className="cyber-card cyber-cut" style={{
        padding: '36px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(19, 15, 34, 0.95), rgba(9, 6, 18, 0.95))',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffe600', boxShadow: '0 0 10px #ffe600' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ffe600', letterSpacing: '1.5px', fontWeight: 700 }}>
              MULTIMEDIA CAPSTONE &amp; EVALUATION READY
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: '0 0 10px' }}>
            Ready to experience the 6-stage autonomous pipeline?
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#8082a6', lineHeight: '1.6', margin: 0 }}>
            Run the 1-click demo to watch frame-by-frame OpenCV logging in the matrix terminal, interact with the Instagram Reel player, test the sensitivity calibration slider, and export the final 9:16 vertical reel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLaunchDemo}
            disabled={isDemoLoading}
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #39ff14)',
              color: '#000',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              padding: '14px 26px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}
          >
            ⚡ LAUNCH 1-CLICK DEMO
          </button>
          
          <button
            onClick={() => navigate('/engine')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              padding: '14px 22px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            CV FORMULAS →
          </button>
        </div>
      </section>

    </div>
  );
}