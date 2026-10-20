import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

export default function PipelineHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPlaying, toggleAudio } = useAudio() || {};
  const path = location.pathname;

  // Extract ID if present in URL
  const match = path.match(/\/(processing|result|reel|editor)\/(\d+)/);
  const currentId = match ? match[2] : null;

  const steps = [
    { num: '01', label: 'INGEST', path: '/ingest', active: path === '/ingest' },
    { 
      num: '02', 
      label: 'AI SCAN', 
      path: currentId ? `/processing/${currentId}` : null, 
      active: path.startsWith('/processing'),
      disabled: !currentId && !path.startsWith('/processing')
    },
    { 
      num: '03', 
      label: 'REEL SHOWCASE', 
      path: currentId ? `/result/${currentId}` : null, 
      active: path.startsWith('/result') || path.startsWith('/reel'),
      disabled: !currentId && !path.startsWith('/result') && !path.startsWith('/reel')
    },
    { 
      num: '04', 
      label: 'STUDIO PRO', 
      path: currentId ? `/editor/${currentId}` : null, 
      active: path.startsWith('/editor'),
      disabled: !currentId && !path.startsWith('/editor')
    },
    { 
      num: '05', 
      label: 'VAULT', 
      path: '/gallery', 
      active: path === '/gallery' 
    },
    { 
      num: '06', 
      label: 'CV SPECS', 
      path: '/engine', 
      active: path === '/engine' 
    }
  ];

  return (
    <nav className="cyber-header-nav" style={{
      background: 'rgba(10, 7, 18, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 500,
      boxShadow: '0 4px 25px rgba(0, 240, 255, 0.08)'
    }}>
      {/* Brand logo & Cyber Tag */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #00f0ff, #ff007f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
          fontWeight: 900,
          color: '#000',
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem'
        }}>
          F
        </div>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            letterSpacing: '2px',
            color: '#fff',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.6)'
          }}>
            FRAMR
          </span>
          <span className="cyber-header-tag" style={{
            fontSize: '0.62rem',
            color: '#00f0ff',
            fontFamily: 'var(--font-mono)',
            marginLeft: '8px',
            letterSpacing: '1px',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>
            CYBER_CORE v2.5
          </span>
        </div>
      </Link>

      {/* Cyberpunk Breadcrumb Pipeline */}
      <div className="cyber-header-steps">
        {steps.map((s, idx) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => s.path && navigate(s.path)}
              disabled={s.disabled}
              style={{
                background: s.active 
                  ? 'linear-gradient(90deg, #00f0ff22, #ff007f22)' 
                  : 'transparent',
                border: s.active ? '1px solid #00f0ff' : '1px solid transparent',
                borderRadius: '20px',
                padding: '4px 12px',
                color: s.active ? '#00f0ff' : (s.disabled ? '#4a3f55' : '#aaa'),
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: s.active ? 700 : 500,
                cursor: s.disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: s.active ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none',
                flexShrink: 0
              }}
            >
              <span style={{
                fontSize: '0.65rem',
                opacity: 0.7,
                color: s.active ? '#ff007f' : 'inherit'
              }}>
                {s.num}
              </span>
              <span>{s.label}</span>
              {s.active && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00f0ff',
                  boxShadow: '0 0 8px #00f0ff'
                }} />
              )}
            </button>

            {idx < steps.length - 1 && (
              <span style={{
                color: s.active ? '#ff007f' : '#33263e',
                fontSize: '0.65rem',
                margin: '0 4px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                ─►
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right Cyber Status & Audio Controller */}
      <div className="cyber-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Background Club Music Toggle */}
        <button
          onClick={toggleAudio}
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
          style={{
            background: isPlaying ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: isPlaying ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isPlaying ? '#00f0ff' : '#888',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            cursor: 'pointer',
            boxShadow: isPlaying ? '0 0 12px rgba(0, 240, 255, 0.35)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{isPlaying ? '🔊' : '🔇'}</span>
          <span>{isPlaying ? 'CLUB AUDIO' : 'AUDIO OFF'}</span>
          {isPlaying && (
            <div className="audio-eq-bars">
              <span className="audio-eq-bar audio-eq-bar--1" />
              <span className="audio-eq-bar audio-eq-bar--2" />
              <span className="audio-eq-bar audio-eq-bar--3" />
            </div>
          )}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(57, 255, 20, 0.06)',
          border: '1px solid rgba(57, 255, 20, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 0 12px rgba(57, 255, 20, 0.15)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#39ff14',
            boxShadow: '0 0 8px #39ff14'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#39ff14',
            letterSpacing: '1.2px',
            fontWeight: 700
          }}>
            CYBER_CORE ONLINE
          </span>
        </div>
      </div>
    </nav>
  );
}
