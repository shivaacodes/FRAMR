import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstagramReel from '../components/InstagramReel';

const API_BASE = 'http://localhost:8000';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [viewMode, setViewMode] = useState('reel'); // 'reel' (default) or 'wide'
  const [isExportingReel, setIsExportingReel] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'COMPLETED') setVideoData(d);
      })
      .catch(e => console.error(e));
  }, [id]);

  if (!videoData) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
        Loading highlight package...
      </div>
    );
  }

  const highlightUrl = `${API_BASE}/highlights/${videoData.highlight_path}`;

  // Export 9:16 vertical Instagram Reel MP4
  const handleExportReel = async () => {
    setIsExportingReel(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspect_ratio: '9/16',
          filter_type: 'none',
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          flip_h: false,
          transition: 'fade',
          speed: 1.0,
          soundtrack: 'cyber_beat',
          is_muted: false,
          overlay_text: ''
        })
      });
      const data = await res.json();
      if (data.export_url) {
        const fileRes = await fetch(data.export_url);
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
        alert("Reel export failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during Reel export.");
    } finally {
      setIsExportingReel(false);
    }
  };

  // Download raw video
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

  return (
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '920px', margin: '0 auto', paddingTop: '20px' }}>
      <section className="panel panel--output" style={{ borderLeft: '3px solid var(--lime)', borderBottom: '3px solid var(--gray-dim)', background: 'var(--ink)' }}>
        
        {/* Header with Switcher Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="panel__heading" style={{ margin: 0 }}>
              <span className="panel__heading-dot panel__heading-dot--blue" />
              Final Reel Showcase
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '4px' }}>
              Multi-modal AI Highlights formatted for social broadcast
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--surface)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('reel')}
              style={{
                background: viewMode === 'reel' ? 'var(--lime)' : 'transparent',
                color: viewMode === 'reel' ? 'var(--black)' : 'var(--white)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📱</span> Instagram Reel (9:16)
            </button>
            <button
              onClick={() => setViewMode('wide')}
              style={{
                background: viewMode === 'wide' ? 'var(--lime)' : 'transparent',
                color: viewMode === 'wide' ? 'var(--black)' : 'var(--white)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖥️</span> Landscape (16:9)
            </button>
          </div>
        </div>

        {/* Content based on View Mode */}
        {viewMode === 'reel' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <InstagramReel
              videoSrc={highlightUrl}
              username="framr.ai"
              caption={`AI auto-extracted highlight reel from ${videoData.filename} ⚡ Peak motion & audio transients stitched seamlessly! #FRAMR #AI #Reels #Highlight`}
              soundtrackName="Cyber Beat · FRAMR AI Mix (Original audio)"
              onExport={handleExportReel}
              isExporting={isExportingReel}
            />
          </div>
        ) : (
          <div className="output-zone" style={{ padding: 0, background: 'transparent' }}>
            <div className="video-result" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-dim)' }}>
              <video
                className="video-player"
                src={highlightUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '460px', background: '#000', display: 'block' }}
              />
              <div className="video-bar" style={{ padding: '16px', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className="video-bar__left">
                  <span className="video-badge" style={{ background: 'var(--lime)', color: 'var(--black)', fontWeight: 'bold' }}>AI HIGHLIGHTS</span>
                  <span className="video-filename" style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)', color: 'var(--white)' }}>{videoData.filename}</span>
                </div>
                <div className="video-bar__actions" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-download"
                    onClick={() => navigate(`/editor/${id}`)}
                    style={{
                      background: 'var(--lime)',
                      color: 'var(--black)',
                      fontWeight: 'bold',
                      padding: '8px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡</span> OPEN IN EDIT STUDIO
                  </button>
                  <button className="btn-secondary" onClick={handleDownloadRaw} style={{ padding: '8px 16px' }}>
                    Download 16:9
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions & Studio Link */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              ← Ingest Another Video
            </button>
            <button className="btn-secondary" onClick={() => navigate('/gallery')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Gallery
            </button>
          </div>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="btn-secondary"
            style={{
              padding: '8px 20px',
              fontSize: '0.85rem',
              borderColor: 'var(--yellow)',
              color: 'var(--yellow)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🎛️</span> Customize in Edit Studio
          </button>
        </div>
      </section>
    </div>
  );
}
