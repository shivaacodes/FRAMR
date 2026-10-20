import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);

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

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '880px', margin: '0 auto', paddingTop: '30px' }}>
      <section className="panel panel--output" style={{ borderLeft: '3px solid var(--lime)', borderBottom: '3px solid var(--gray-dim)', background: 'var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="panel__heading" style={{ margin: 0 }}>
            <span className="panel__heading-dot panel__heading-dot--blue" />
            AI Highlight Reel Generated
          </h2>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#22c55e20',
            color: '#22c55e',
            border: '1px solid #22c55e'
          }}>
            READY
          </span>
        </div>

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
                <button className="btn-secondary" onClick={handleDownload} style={{ padding: '8px 16px' }}>
                  Download Video
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gray-dim)', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '4px' }}>
              🎬 MULTI-MODAL CV
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
              Optical motion &amp; scene-cut scoring extracted the 3 highest energy peaks.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gray-dim)', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '4px' }}>
              ⏱️ 60FPS TIMELINE
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
              Drag &amp; drop clips in Edit Studio to customize playback sequence.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gray-dim)', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '4px' }}>
              🎧 AI SOUNDTRACKS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
              Add Cyber Beat, Epic Action, or Lo-Fi with automatic audio ducking.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gray-dim)', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.75rem', color: '#c084fc', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '4px' }}>
              🪄 CINEMATIC TRANSITIONS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
              Export with seamless 0.5s Fade, Wipe, or Pixelize video transitions.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 18px' }}>
            Ingest Another Video
          </button>
          <button className="btn-secondary" onClick={() => navigate('/gallery')} style={{ padding: '8px 18px' }}>
            View Highlights Gallery
          </button>
        </div>
      </section>
    </div>
  );
}
