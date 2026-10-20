import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Gallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/`)
      .then(r => r.json())
      .then(d => {
        if (d.videos) setVideos(d.videos);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', width: '100%', position: 'relative', zIndex: 10 }}>
      
      {/* Vault Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff007f', boxShadow: '0 0 10px #ff007f' }} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              letterSpacing: '2px',
              color: '#fff',
              margin: 0
            }}>
              STAGE 05 // NEURAL ARCHIVE VAULT
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8082a6', fontFamily: 'var(--font-mono)', margin: '4px 0 0 16px' }}>
            Persistent video storage, highlight compilations, and model evaluations
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
          + INGEST NEW FOOTAGE
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
          Reading SQLite database records...
        </div>
      ) : videos.length === 0 ? (
        <div className="cyber-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📁</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.2rem', letterSpacing: '1px' }}>
            VAULT IS CURRENTLY EMPTY
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#8082a6', maxWidth: '400px', margin: '8px auto 20px' }}>
            No highlight reels have been archived yet. Upload raw footage or run the 1-click demo to generate your first reel.
          </p>
          <button
            onClick={() => navigate('/ingest')}
            style={{
              background: '#00f0ff',
              color: '#000',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Launch Ingestion Portal
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {videos.map(v => (
            <div 
              key={v.id} 
              className="cyber-card cyber-cut" 
              style={{ 
                borderRadius: '10px', 
                padding: '20px', 
                background: 'rgba(16, 12, 28, 0.94)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#00f0ff',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 240, 255, 0.08)'
                  }}>
                    JOB #{v.id}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: v.status === 'COMPLETED' ? '#39ff14' : (v.status === 'FAILED' ? '#ff007f' : '#ffe600')
                  }}>
                    ● {v.status}
                  </span>
                </div>

                {/* Video Name */}
                <h3 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: '#fff',
                  marginBottom: '10px',
                  wordBreak: 'break-all',
                  lineHeight: '1.4'
                }}>
                  {v.filename}
                </h3>

                {/* Mini video preview if completed */}
                {v.status === 'COMPLETED' && v.highlight_path && (
                  <div style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    <video
                      src={`${API_BASE}/highlights/${v.highlight_path}`}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      muted
                      loop
                      onMouseEnter={(e) => e.target.play().catch(() => {})}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '6px',
                      background: 'rgba(0,0,0,0.7)',
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#fff',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}>
                      HOVER PREVIEW
                    </div>
                  </div>
                )}

                {/* Rating if present */}
                {v.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', fontSize: '0.75rem', color: '#ffe600' }}>
                    <span>{'★'.repeat(v.rating)}</span>
                    <span style={{ fontSize: '0.68rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>
                      (Rated {v.rating}/5)
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {v.status === 'COMPLETED' ? (
                  <>
                    <button
                      onClick={() => navigate(`/result/${v.id}`)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(90deg, #00f0ff, #0088ff)',
                        color: '#000',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        padding: '7px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      📱 REEL VIEW
                    </button>
                    <button
                      onClick={() => navigate(`/editor/${v.id}`)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        color: '#00f0ff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        padding: '7px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🎛️ STUDIO
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/processing/${v.id}`)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    CHECK SCAN STATUS →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
