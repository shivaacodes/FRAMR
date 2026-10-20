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
      .then(d => { if (d.videos) setVideos(d.videos); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm(`Delete Job #${videoId} from Vault? This will remove files and records.`)) return;
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
    if (!window.confirm('PURGE ENTIRE VAULT?\n\nThis will permanently delete all archived highlight videos, logs, and database records.')) return;
    try {
      await fetch(`${API_BASE}/api/v1/videos/purge-all`, { method: 'DELETE' });
      setVideos([]);
    } catch (err) {
      console.error(err);
      alert('Purge request failed.');
    }
  };

  const statusBadge = (s) => {
    if (s === 'COMPLETED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--render-emerald)',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '2px 7px',
          borderRadius: '3px',
          fontWeight: 600
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--render-emerald)' }} />
          Available
        </span>
      );
    }
    if (s === 'FAILED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--render-rose)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '2px 7px',
          borderRadius: '3px',
          fontWeight: 600
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--render-rose)' }} />
          Failed
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        color: 'var(--render-purple-accent)',
        background: 'var(--render-purple-glow)',
        border: '1px solid var(--render-border-hover)',
        padding: '2px 7px',
        borderRadius: '3px',
        fontWeight: 600
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
        Processing
      </span>
    );
  };

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
              Reel Archive &amp; Storage Vault
            </h1>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            margin: '0 0 0 16px'
          }}>
            Persistent video storage, compiled highlights, and algorithmic scoring records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {videos.length > 0 && (
            <button
              onClick={handlePurgeAll}
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                color: 'var(--render-rose)',
                fontWeight: 600,
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                padding: '8px 14px',
                borderRadius: '5px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              <span>Purge All</span>
            </button>
          )}

          <button
            onClick={() => navigate('/ingest')}
            className="btn-render-primary"
            style={{ padding: '9px 18px', fontSize: '0.8rem' }}
          >
            <span>+ Ingest Footage</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          Querying cloud storage database records...
        </div>
      ) : videos.length === 0 ? (
        <div className="render-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="var(--text-dim)" style={{ marginBottom: '16px' }}>
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '8px' }}>
            Vault is empty
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6', fontFamily: 'var(--font-ui)' }}>
            No highlight reels deployed yet. Upload raw video footage or run the 1-click demo to synthesize your first reel.
          </p>
          <button
            onClick={() => navigate('/ingest')}
            className="btn-render-primary"
          >
            <span>Launch Ingestion Portal</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {videos.map(v => (
            <div
              key={v.id}
              className="render-card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    color: 'var(--render-purple-accent)',
                    border: '1px solid var(--render-border-hover)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--render-purple-glow)',
                  }}>
                    JOB #{v.id}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {statusBadge(v.status)}
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      title="Delete record"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--render-border)',
                        color: 'var(--text-dim)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--render-rose)';
                        e.currentTarget.style.borderColor = 'var(--render-rose)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-dim)';
                        e.currentTarget.style.borderColor = 'var(--render-border)';
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Filename */}
                <h3 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  wordBreak: 'break-all',
                  lineHeight: '1.4',
                }}>
                  {v.filename}
                </h3>

                {/* Video preview */}
                {v.status === 'COMPLETED' && v.highlight_path && (
                  <div style={{
                    borderRadius: '5px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid var(--render-border)',
                    marginBottom: '12px',
                    position: 'relative',
                  }}>
                    <video
                      src={`${API_BASE}/highlights/${v.highlight_path}`}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      muted
                      loop
                      onMouseEnter={(e) => e.target.play().catch(() => {})}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                    <div style={{
                      position: 'absolute', bottom: '6px', right: '6px',
                      background: 'rgba(5, 5, 8, 0.85)', fontSize: '0.6rem',
                      fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
                      padding: '2px 6px', borderRadius: '3px',
                      border: '1px solid var(--render-border)'
                    }}>
                      HOVER TO PREVIEW
                    </div>
                  </div>
                )}

                {/* Rating */}
                {v.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--render-amber)', letterSpacing: '2px' }}>{'★'.repeat(v.rating)}{'☆'.repeat(5 - v.rating)}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {v.rating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--render-border)' }}>
                {v.status === 'COMPLETED' ? (
                  <>
                    <button
                      onClick={() => navigate(`/result/${v.id}`)}
                      className="btn-render-primary"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '0.72rem',
                        justifyContent: 'center',
                      }}
                    >
                      Reel View
                    </button>
                    <button
                      onClick={() => navigate(`/editor/${v.id}`)}
                      className="btn-render-outline"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '0.72rem',
                        justifyContent: 'center',
                      }}
                    >
                      Studio Pro
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/processing/${v.id}`)}
                    className="btn-render-outline"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '0.74rem',
                      justifyContent: 'center',
                    }}
                  >
                    Check Pipeline Status
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
