import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

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

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm(`Delete Job #${videoId} from Vault? This will remove files and records.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.id || data.message) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
      } else {
        alert(data.error || 'Failed to delete video');
      }
    } catch (err) {
      console.error(err);
      alert('Delete request failed.');
    }
  };

  const handlePurgeAll = async () => {
    if (!window.confirm('⚠️ PURGE ENTIRE VAULT?\n\nThis will permanently delete all archived highlight videos, logs, and database records.')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/purge-all`, { method: 'DELETE' });
      const data = await res.json();
      setVideos([]);
    } catch (err) {
      console.error(err);
      alert('Purge request failed.');
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: 'clamp(16px, 3vw, 30px) clamp(10px, 2.5vw, 20px)', width: '100%', position: 'relative', zIndex: 10 }}>
      
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {videos.length > 0 && (
            <button
              onClick={handlePurgeAll}
              style={{
                background: 'rgba(255, 0, 85, 0.12)',
                color: '#ff0055',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 0, 85, 0.45)',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255, 0, 85, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 85, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 0, 85, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 85, 0.12)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 0, 85, 0.2)';
              }}
            >
              <span>⚠️</span> PURGE ALL VAULT
            </button>
          )}

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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: v.status === 'COMPLETED' ? '#39ff14' : (v.status === 'FAILED' ? '#ff007f' : '#ffe600')
                    }}>
                      ● {v.status}
                    </span>
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      title="Delete video record & files"
                      style={{
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid rgba(255, 0, 85, 0.35)',
                        color: '#ff0055',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        lineHeight: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff0055';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.boxShadow = '0 0 10px #ff0055';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
                        e.currentTarget.style.color = '#ff0055';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      ✕
                    </button>
                  </div>
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
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      title="Delete this highlight from vault"
                      style={{
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid rgba(255, 0, 85, 0.35)',
                        color: '#ff0055',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        padding: '7px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 85, 0.25)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 85, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      🗑️
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
