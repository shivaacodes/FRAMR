import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(12px, 3vw, 24px)', width: '100%', position: 'relative', zIndex: 10 }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ textAlign: 'center', marginBottom: '64px', position: 'relative' }}>
        
        {/* Main Wordmark & Title with Array-BoldWide */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6.5vw, 4.4rem)',
          lineHeight: '1.05',
          letterSpacing: '2px',
          color: '#ffffff',
          margin: '0 auto 20px',
          maxWidth: '980px',
          textShadow: '0 0 35px rgba(0, 240, 255, 0.4)'
        }}>
          AUTOMATED HIGHLIGHTS <br />
          <span style={{
            background: 'linear-gradient(90deg, #00f0ff 0%, #ffe600 50%, #ff007f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            REEL STUDIO
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#a3a6c9',
          maxWidth: '800px',
          margin: '0 auto 36px',
          lineHeight: '1.6',
          letterSpacing: '0.5px'
        }}>
          Fuses OpenCV optical motion differentials, Bhattacharyya histogram scene cut boundaries, and 44.1kHz acoustic RMS energy. Compiles ready-to-post 9:16 Instagram Reels with beat-matched audio ducking in under 1 second.
        </p>

        {/* High-Impact Primary CTA: Ingest Custom Video */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
          <button
            onClick={() => navigate('/ingest')}
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 100%)',
              color: '#000000',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              letterSpacing: '1.5px',
              padding: '18px 46px',
              borderRadius: '10px',
              border: 'none',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.7)',
              transition: 'all 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(0, 240, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.7)';
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>📁</span>
            <span>INGEST CUSTOM VIDEO</span>
            <span style={{ fontSize: '1.1rem' }}>➔</span>
          </button>
        </div>
      </section>

      {/* ── 4-PILLAR ARCHITECTURE SHOWCASE WITH ARRAY NUMBERS ── */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.7rem',
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
          <div className="cyber-card" style={{ padding: '26px', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(0, 240, 255, 0.12)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              01
            </span>
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
          <div className="cyber-card" style={{ padding: '26px', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255, 0, 85, 0.12)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              02
            </span>
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
          <div className="cyber-card" style={{ padding: '26px', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255, 230, 0, 0.12)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              03
            </span>
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
          <div className="cyber-card" style={{ padding: '26px', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(57, 255, 20, 0.12)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              04
            </span>
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
      <section className="cyber-card" style={{
        padding: '36px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(19, 15, 34, 0.95), rgba(9, 6, 18, 0.95))',
        border: '1.5px solid rgba(0, 240, 255, 0.4)',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative'
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
            onClick={() => navigate('/ingest')}
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
            📁 LAUNCH INGESTION PORTAL
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
