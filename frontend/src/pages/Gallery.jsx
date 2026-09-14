import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Gallery() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/`)
      .then(r => r.json())
      .then(d => {
        if (d.videos) setVideos(d.videos);
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '20px', color: 'var(--lime)' }}>
        YOUR HIGHLIGHTS
      </h2>
      
      {videos.length === 0 ? (
        <p>No highlights generated yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {videos.map(v => (
            <div key={v.id} style={{ border: '2px solid var(--gray-dim)', background: 'var(--surface)', padding: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--white)', marginBottom: '10px' }}>
                {v.filename}
              </h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '16px' }}>
                Status: <span style={{ color: v.status === 'COMPLETED' ? 'var(--lime)' : 'var(--magenta)' }}>{v.status}</span>
              </p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {v.status === 'COMPLETED' ? (
                  <>
                    <button className="btn-secondary" onClick={() => navigate(`/result/${v.id}`)}>View</button>
                    <button className="btn-secondary" onClick={() => navigate(`/editor/${v.id}`)}>Edit</button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={() => navigate(`/processing/${v.id}`)}>Check Status</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
