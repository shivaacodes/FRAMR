import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstagramReel from '../components/InstagramReel';
import FeedbackLoop from '../components/FeedbackLoop';
import { API_BASE } from '../config';

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
      <div style={{ padding: 60, textAlign: 'center', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
        Retrieving highlight stream package...
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(16px, 3vw, 30px) clamp(10px, 2.5vw, 20px)', width: '100%', position: 'relative', zIndex: 10 }}>
      <section 
        className="cyber-card cyber-cut" 
        style={{ 
          background: 'rgba(16, 12, 28, 0.94)', 
          padding: 'clamp(14px, 2.5vw, 24px)', 
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        {/* Header with Switcher Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 10px #39ff14' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                letterSpacing: '1.5px',
                color: '#fff',
                margin: 0
              }}>
                STAGE 03 // INSTAGRAM REEL SHOWCASE
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px', marginLeft: '16px' }}>
              VIDEO: {videoData.filename} · READY FOR SOCIAL STREAM
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
            <button
              onClick={() => setViewMode('reel')}
              style={{
                background: viewMode === 'reel' ? 'linear-gradient(90deg, #00f0ff, #0088ff)' : 'transparent',
                color: viewMode === 'reel' ? '#000' : '#aaa',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'reel' ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none'
              }}
            >
              <span>📱</span> REEL (9:16 VERTICAL)
            </button>
            <button
              onClick={() => setViewMode('wide')}
              style={{
                background: viewMode === 'wide' ? 'linear-gradient(90deg, #00f0ff, #0088ff)' : 'transparent',
                color: viewMode === 'wide' ? '#000' : '#aaa',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'wide' ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none'
              }}
            >
              <span>🖥️</span> 16:9 LANDSCAPE
            </button>
          </div>
        </div>

        {/* Content based on View Mode */}
        {viewMode === 'reel' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 20px 0' }}>
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
            <div className="video-result" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}>
              <video
                className="video-player"
                src={highlightUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '460px', background: '#000', display: 'block' }}
              />
              <div className="video-bar" style={{ padding: '16px', background: '#120c1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className="video-bar__left">
                  <span className="video-badge" style={{ background: '#00f0ff', color: '#000', fontWeight: 'bold' }}>AI COMPILATION</span>
                  <span className="video-filename" style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)', color: '#fff' }}>{videoData.filename}</span>
                </div>
                <div className="video-bar__actions" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-download"
                    onClick={() => navigate(`/editor/${id}`)}
                    style={{
                      background: 'linear-gradient(90deg, #00f0ff, #0088ff)',
                      color: '#000',
                      fontWeight: 'bold',
                      padding: '8px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span>⚡</span> OPEN IN EDIT STUDIO
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={handleDownloadRaw} 
                    style={{ padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Download 16:9
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/')} 
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              ← Ingest New Video
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/gallery')} 
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Neural Vault
            </button>
          </div>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            style={{
              padding: '8px 22px',
              fontSize: '0.82rem',
              background: 'transparent',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)'
            }}
          >
            <span>🎛️</span> OPEN EDIT STUDIO PRO
          </button>
        </div>
      </section>

      {/* Interactive AI Feedback Loop & Calibration */}
      <FeedbackLoop 
        videoId={id} 
        initialRating={videoData.rating} 
        initialSensitivity={videoData.sensitivity} 
      />
    </div>
  );
}
