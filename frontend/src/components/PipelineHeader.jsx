import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

export default function PipelineHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPlaying, toggleAudio } = useAudio() || {};
  const path = location.pathname;

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
      label: 'REEL',
      path: currentId ? `/result/${currentId}` : null,
      active: path.startsWith('/result') || path.startsWith('/reel'),
      disabled: !currentId && !path.startsWith('/result') && !path.startsWith('/reel')
    },
    {
      num: '04',
      label: 'STUDIO',
      path: currentId ? `/editor/${currentId}` : null,
      active: path.startsWith('/editor'),
      disabled: !currentId && !path.startsWith('/editor')
    },
    { num: '05', label: 'VAULT', path: '/gallery', active: path === '/gallery' },
    { num: '06', label: 'CV SPECS', path: '/engine', active: path === '/engine' }
  ];

  return (
    <nav className="cyber-header-nav" style={{
      background: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--render-border)',
      position: 'sticky',
      top: 0,
      zIndex: 500,
    }}>
      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Thermal Aura geometric capsule logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.15), rgba(34, 211, 238, 0.15))',
          border: '1px solid rgba(255, 87, 34, 0.35)',
          boxShadow: '0 0 12px rgba(255, 87, 34, 0.25)'
        }}>
          <div style={{ width: '6px', height: '14px', borderRadius: '3px', background: '#22d3ee', boxShadow: '0 0 6px rgba(34, 211, 238, 0.7)' }} />
          <div style={{ width: '6px', height: '18px', borderRadius: '3px', background: '#facc15', boxShadow: '0 0 6px rgba(250, 204, 21, 0.7)' }} />
          <div style={{ width: '6px', height: '12px', borderRadius: '3px', background: '#ff5722', boxShadow: '0 0 6px rgba(255, 87, 34, 0.7)' }} />
        </div>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            FRAMR
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            marginLeft: '8px',
            letterSpacing: '0.04em',
            border: '1px solid rgba(255, 87, 34, 0.4)',
            padding: '2px 7px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.12), rgba(255, 87, 34, 0.12))',
          }} className="studio-spectrum-text">
            STUDIO v2.5
          </span>
        </div>
      </Link>

      {/* Pipeline Breadcrumb */}
      <div className="cyber-header-steps">
        {steps.map((s, idx) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => s.path && navigate(s.path)}
              disabled={s.disabled}
              style={{
                background: s.active ? 'linear-gradient(90deg, rgba(255, 87, 34, 0.18), rgba(34, 211, 238, 0.18))' : 'transparent',
                border: s.active ? '1px solid rgba(255, 87, 34, 0.5)' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 11px',
                color: s.active ? '#ffffff' : (s.disabled ? 'var(--text-dim)' : 'var(--text-secondary)'),
                fontSize: '0.72rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: s.active ? 600 : 500,
                cursor: s.disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s',
                boxShadow: s.active ? '0 0 12px rgba(255, 87, 34, 0.3)' : 'none',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{s.num}</span>
              <span>{s.label}</span>
              {s.active && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #facc15, #ff5722)',
                  boxShadow: '0 0 6px rgba(255, 87, 34, 0.9)',
                  display: 'inline-block'
                }} />
              )}
            </button>

            {idx < steps.length - 1 && (
              <span style={{
                color: 'var(--render-border)',
                fontSize: '0.7rem',
                margin: '0 2px',
                flexShrink: 0
              }}>
                /
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          title={isPlaying ? 'Mute Background Audio' : 'Play Background Audio'}
          style={{
            background: isPlaying ? 'var(--render-purple-glow)' : 'transparent',
            border: '1px solid ' + (isPlaying ? 'var(--render-border-hover)' : 'var(--render-border)'),
            borderRadius: '4px',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: isPlaying ? 'var(--render-purple-light)' : 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            {isPlaying
              ? <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              : <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            }
          </svg>
          <span>{isPlaying ? 'AUDIO' : 'MUTED'}</span>
          {isPlaying && (
            <div className="audio-eq-bars">
              <span className="audio-eq-bar audio-eq-bar--1" />
              <span className="audio-eq-bar audio-eq-bar--2" />
              <span className="audio-eq-bar audio-eq-bar--3" />
            </div>
          )}
        </button>

        {/* Status Available */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 9px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '4px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--render-emerald)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--render-emerald)', letterSpacing: '0.04em', fontWeight: 600 }}>
            Available
          </span>
        </div>

        {/* Render White Launch Action */}
        <button
          onClick={() => navigate('/ingest')}
          className="btn-render-white"
          style={{ whiteSpace: 'nowrap' }}
        >
          <span>Launch Studio</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </nav>
  );
}
