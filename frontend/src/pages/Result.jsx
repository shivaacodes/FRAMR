import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstagramReel from '../components/InstagramReel';
import FeedbackLoop from '../components/FeedbackLoop';
import { API_BASE } from '../config';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [viewMode, setViewMode] = useState('reel');
  const [isExportingReel, setIsExportingReel] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/${id}`)
      .then(r => r.json())
      .then(d => { if (d.status === 'COMPLETED') setVideoData(d); })
      .catch(e => console.error(e));
  }, [id]);

  if (!videoData) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--render-purple-light)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        Retrieving highlight stream package...
      </div>
    );
  }

  const highlightUrl = `${API_BASE}/highlights/${videoData.highlight_path}`;

  const handleExportReel = async () => {
    setIsExportingReel(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspect_ratio: '9/16', filter_type: 'none',
          brightness: 100, contrast: 100, saturation: 100, blur: 0,
          flip_h: false, transition: 'fade', speed: 1.0,
          soundtrack: 'cyber_beat', is_muted: false, overlay_text: ''
        })
      });
      const data = await res.json();
      if (data.export_url) {
        const downloadUrl = data.export_url.startsWith('http') ? data.export_url : `${API_BASE}${data.export_url}`;
        const fileRes = await fetch(downloadUrl);
        const blob = await fileRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reel_9_16_${videoData.filename}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Reel export failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during Reel export.');
    } finally {
      setIsExportingReel(false);
    }
  };

  const handleDownloadRaw = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(highlightUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `highlight_${videoData.filename}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const tabStyle = (isActive) => ({
    background: isActive ? 'var(--render-purple-glow)' : 'transparent',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    border: '1px solid ' + (isActive ? 'var(--render-border-hover)' : 'transparent'),
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.74rem',
    fontFamily: 'var(--font-ui)',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: 'clamp(20px, 4vw, 44px) clamp(16px, 3vw, 32px)',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      <section
        className="render-card"
        style={{ padding: 'clamp(18px, 3vw, 32px)', marginBottom: '32px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--render-emerald)' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Synthesized Highlight Reel
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginLeft: '16px' }}>
              {videoData.filename} · Ready for social broadcast
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'var(--render-surface)',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid var(--render-border)'
          }}>
            <button onClick={() => setViewMode('reel')} style={tabStyle(viewMode === 'reel')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
              <span>9:16 Vertical Reel</span>
            </button>
            <button onClick={() => setViewMode('wide')} style={tabStyle(viewMode === 'wide')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
              <span>16:9 Landscape Raw</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        {viewMode === 'reel' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 24px 0' }}>
            <InstagramReel
              videoSrc={highlightUrl}
              username="framr.ai"
              caption={`AI auto-extracted highlight reel from ${videoData.filename}. Peak motion & audio transients stitched seamlessly. #FRAMR #AI #Reels`}
              soundtrackName="Cyber Beat · FRAMR AI Mix"
              onExport={handleExportReel}
              isExporting={isExportingReel}
            />
          </div>
        ) : (
          <div className="output-zone" style={{ padding: 0, background: 'transparent' }}>
            <div className="video-result" style={{ border: '1px solid var(--render-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <video
                className="video-player"
                src={highlightUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '480px', background: '#000', display: 'block' }}
              />
              <div className="video-bar" style={{ background: 'var(--render-surface)', borderTop: '1px solid var(--render-border)' }}>
                <div className="video-bar__left">
                  <span className="render-badge">
                    ● Available
                  </span>
                  <span className="video-filename">{videoData.filename}</span>
                </div>
                <div className="video-bar__actions">
                  <button
                    className="btn-render-primary"
                    onClick={() => navigate(`/editor/${id}`)}
                    style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                    <span>Open in Studio Pro</span>
                  </button>
                  <button
                    className="btn-render-outline"
                    onClick={handleDownloadRaw}
                    style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                  >
                    Download 16:9
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--render-border)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-render-outline" onClick={() => navigate('/ingest')} style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
              Ingest New Video
            </button>
            <button className="btn-render-outline" onClick={() => navigate('/gallery')} style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
              Reel Vault
            </button>
          </div>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="btn-render-primary"
            style={{ padding: '9px 20px', fontSize: '0.8rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            <span>Open Studio Pro</span>
          </button>
        </div>
      </section>

      <FeedbackLoop
        videoId={id}
        initialRating={videoData.rating}
        initialSensitivity={videoData.sensitivity}
      />
    </div>
  );
}
