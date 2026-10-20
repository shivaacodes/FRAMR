import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(16px, 3vw, 30px) clamp(10px, 2.5vw, 20px)', width: '100%', position: 'relative', zIndex: 10 }}>
      
      {/* 3D Cyber Ingest Portal */}
      <div 
        className="cyber-card cyber-cut" 
        style={{ 
          padding: '28px', 
          borderRadius: '12px', 
          marginBottom: '28px',
          background: 'rgba(16, 12, 28, 0.92)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                letterSpacing: '1.5px',
                color: '#fff',
                margin: 0
              }}>
                STAGE 01 // NEURAL INGESTION PORTAL
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8082a6', margin: '4px 0 0 16px', fontFamily: 'var(--font-mono)' }}>
              Drop footage to initiate OpenCV optical flow &amp; RMS transient analysis
            </p>
          </div>

          {/* Quick Demo Mode Button */}
          <button
            onClick={handleLaunchDemo}
            disabled={isDemoLoading || isUploading}
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #0088ff)',
              color: '#000',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '10px 18px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <span>⚡</span>
            {isDemoLoading ? 'INITIALIZING DEMO...' : '1-CLICK DEMO (SAMPLE FOOTAGE)'}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => { if (e.target.files?.length && !isUploading) handleUpload(e.target.files[0]); }}
          accept="video/*"
          style={{ display: 'none' }}
        />

        {/* Holographic Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!isUploading) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isUploading) fileInputRef.current.click(); }}
          style={{
            position: 'relative',
            background: dragOver ? 'rgba(0, 240, 255, 0.1)' : 'rgba(10, 7, 18, 0.8)',
            border: dragOver ? '2px dashed #00f0ff' : '1.5px dashed rgba(0, 240, 255, 0.4)',
            borderRadius: '10px',
            padding: '50px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: dragOver ? 'inset 0 0 30px rgba(0, 240, 255, 0.3)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Animated Scanning Laser Beam */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
            boxShadow: '0 0 15px #00f0ff',
            animation: 'scanBeam 3s ease-in-out infinite'
          }} />

          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div className="spinner">
                <div className="spinner__ring" style={{ borderColor: '#00f0ff transparent transparent transparent' }} />
                <div className="spinner__ring spinner__ring--delay" style={{ borderColor: '#ff007f transparent transparent transparent' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#00f0ff', fontSize: '0.9rem', letterSpacing: '1px' }}>
                UPLOADING RAW BITSTREAM TO GPU BUFFER…
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-ui)' }}>
                  {dragOver ? 'RELEASE STREAM TO ENGAGE INGEST' : 'DRAG & DROP VIDEO FOOTAGE HERE'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#8082a6', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  or click to select file from local storage
                </p>
              </div>

              {/* Codec / Format badges */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['H.264 / MP4', 'PRORES / MOV', 'MKV', 'WEBM', 'CFR 60FPS'].map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(0, 240, 255, 0.08)',
                    color: '#00f0ff',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cyberpunk Architecture Showcase Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1 */}
        <div className="cyber-card" style={{ padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>👁️</span>
            <h4 style={{ fontFamily: 'var(--font-display)', color: '#00f0ff', fontSize: '0.95rem', margin: 0, letterSpacing: '1px' }}>
              01 // OPTICAL MOTION FLOW
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8082a6', lineHeight: '1.45', margin: 0 }}>
            OpenCV extracts frame-by-frame luminance differentials and color histogram cut correlation at hardware speed.
          </p>
        </div>

        {/* Card 2 */}
        <div className="cyber-card" style={{ padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔊</span>
            <h4 style={{ fontFamily: 'var(--font-display)', color: '#ff007f', fontSize: '0.95rem', margin: 0, letterSpacing: '1px' }}>
              02 // AUDIO RMS TRANSIENTS
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8082a6', lineHeight: '1.45', margin: 0 }}>
            Decodes 44.1kHz audio waveforms into root-mean-square energy windows to isolate cheering, impact, and excitement.
          </p>
        </div>

        {/* Card 3 */}
        <div className="cyber-card" style={{ padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📱</span>
            <h4 style={{ fontFamily: 'var(--font-display)', color: '#39ff14', fontSize: '0.95rem', margin: 0, letterSpacing: '1px' }}>
              03 // SOCIAL BROADCAST REEL
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8082a6', lineHeight: '1.45', margin: 0 }}>
            Compiles 9:16 vertical reels with automatic background music ducking, cinematic transitions, and slow-mo.
          </p>
        </div>
      </div>

      {/* Inline styles for laser scanning animation */}
      <style>{`
        @keyframes scanBeam {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 98%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
