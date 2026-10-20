import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const infoCards = [
  {
    num: '01',
    accent: 'var(--render-purple-light)',
    title: 'OPTICAL MOTION FLOW',
    tag: 'cv2.calcOpticalFlowFarneback',
    desc: 'Extracts dense frame-by-frame luminance differentials and color histogram cuts at hardware speed without GPU load.',
  },
  {
    num: '02',
    accent: 'var(--render-emerald)',
    title: 'AUDIO RMS TRANSIENTS',
    tag: '44.1kHz PCM Audio',
    desc: 'Decodes audio waveforms into root-mean-square energy windows to isolate cheering crowds, impact, and vocal peaks.',
  },
  {
    num: '03',
    accent: 'var(--render-purple-accent)',
    title: '9:16 INSTAGRAM REEL',
    tag: 'Auto-Crop & Ducking',
    desc: 'Compiles vertical reels with automatic background music ducking, beat alignment, and 1-click social export.',
  },
];

export default function Home() {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.video_id) {
        navigate(`/processing/${data.video_id}`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('Upload failed!');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length && !isUploading) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/demo-video`, { method: 'POST' });
      const data = await res.json();
      if (data.video_id) {
        navigate(`/processing/${data.video_id}`);
      } else {
        alert('Could not start demo job');
      }
    } catch (err) {
      console.error(err);
      alert('Demo initialization failed');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>

      {/* Main Ingestion Container */}
      <div
        className="render-card"
        style={{ padding: 'clamp(20px, 3vw, 36px)', marginBottom: '32px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Video Ingestion &amp; Highlight Pipeline
              </h1>
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: '0 0 0 16px',
              fontFamily: 'var(--font-ui)'
            }}>
              Deploy footage to run OpenCV Farneback optical flow and 44.1kHz acoustic transient analysis
            </p>
          </div>

          <button
            onClick={handleLaunchDemo}
            disabled={isDemoLoading || isUploading}
            className="btn-render-primary"
            style={{
              padding: '9px 18px',
              fontSize: '0.8rem',
              opacity: isDemoLoading || isUploading ? 0.6 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
            <span>{isDemoLoading ? 'INITIALIZING...' : 'Run 1-Click Demo'}</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => { if (e.target.files?.length && !isUploading) handleUpload(e.target.files[0]); }}
          accept="video/*"
          style={{ display: 'none' }}
        />

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!isUploading) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isUploading) fileInputRef.current.click(); }}
          style={{
            position: 'relative',
            background: dragOver ? 'var(--render-purple-glow)' : 'var(--render-surface)',
            border: dragOver ? '1px dashed var(--render-purple-light)' : '1px dashed rgba(255, 255, 255, 0.14)',
            borderRadius: '6px',
            padding: '56px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="spinner">
                <div className="spinner__ring" style={{ borderTopColor: 'var(--render-purple)' }} />
                <div className="spinner__ring spinner__ring--delay" style={{ borderTopColor: 'var(--render-purple-light)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--render-purple-accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                UPLOADING TO INGESTION BUFFER...
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                background: 'var(--render-purple-glow)',
                border: '1px solid var(--render-border-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--render-purple-accent)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div>
                <p style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 6px',
                  fontFamily: 'var(--font-ui)'
                }}>
                  {dragOver ? 'Release to upload video' : 'Drag & drop video footage here'}
                </p>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  fontFamily: 'var(--font-ui)'
                }}>
                  or click to select file from your computer
                </p>
              </div>

              {/* Format badges */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['MP4 (H.264)', 'MOV (ProRes)', 'MKV', 'WEBM', 'CFR 60 FPS'].map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--render-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--render-border)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {infoCards.map((c) => (
          <div key={c.num} className="render-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.accent, display: 'inline-block' }} />
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  {c.title}
                </h4>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-dim)'
              }}>
                {c.num}
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--render-purple-accent)',
              marginBottom: '10px'
            }}>
              {c.tag}
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: 'var(--font-ui)'
            }}>
              {c.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
