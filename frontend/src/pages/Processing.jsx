import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Processing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    let iv;
    if (id && (status === 'PENDING' || status === 'PROCESSING')) {
      iv = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/videos/${id}`);
          const d = await res.json();
          if (d.status === 'COMPLETED') {
            setStatus('COMPLETED');
            clearInterval(iv);
            navigate(`/result/${id}`);
          } else if (d.status === 'FAILED') {
            setStatus('FAILED');
            clearInterval(iv);
          } else {
            setStatus(d.status);
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 2000);
    }
    return () => clearInterval(iv);
  }, [id, status, navigate]);

  return (
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <section className="panel panel--output" style={{ borderLeft: '3px solid var(--lime)', borderBottom: '3px solid var(--gray-dim)' }}>
        <h2 className="panel__heading">
          <span className="panel__heading-dot panel__heading-dot--blue" />
          Processing Job #{id}
        </h2>

        <div className="output-zone">
          {status === 'FAILED' ? (
            <div className="output-empty">
              <div className="upload-icon upload-icon--error">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M24 15v12M24 32v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="upload-primary" style={{color: 'var(--magenta)'}}>Processing failed</p>
              <button className="btn-danger" onClick={() => navigate('/')}>Return to Home</button>
            </div>
          ) : (
            <div className="output-loading">
              <div className="audio-bars">
                {[1,2,3,4,5,6,7].map(i => (
                  <span key={i} className="audio-bar" style={{ '--i': i }} />
                ))}
              </div>
              <p className="output-loading__text">AI is analysing your video…</p>
              <p className="output-loading__sub">Extracting motion, detecting scene cuts, calculating RMS audio...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
