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
    return <div style={{padding: 40, textAlign: 'center'}}>Loading result...</div>;
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
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <section className="panel panel--output" style={{ borderLeft: '3px solid var(--lime)', borderBottom: '3px solid var(--gray-dim)' }}>
        <h2 className="panel__heading">
          <span className="panel__heading-dot panel__heading-dot--blue" />
          Output Feed
        </h2>

        <div className="output-zone">
          <div className="video-result">
            <video
              className="video-player"
              src={highlightUrl}
              controls
              autoPlay
            />
            <div className="video-bar">
              <div className="video-bar__left">
                <span className="video-badge">HIGHLIGHT REEL</span>
                <span className="video-filename">{videoData.filename}</span>
              </div>
              <div className="video-bar__actions">
                <button className="btn-secondary" onClick={() => navigate(`/editor/${id}`)}>
                  Edit
                </button>
                <button className="btn-download" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Extract another video
          </button>
        </div>
      </section>
    </div>
  );
}
