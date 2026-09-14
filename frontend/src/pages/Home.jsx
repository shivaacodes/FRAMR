import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Home() {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  return (
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <section className="panel panel--input" style={{ borderRight: 'none', borderBottom: '3px solid var(--gray-dim)' }}>
        <h2 className="panel__heading">
          <span className="panel__heading-dot" />
          Ingest New Video
        </h2>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => { if (e.target.files?.length && !isUploading) handleUpload(e.target.files[0]); }}
          accept="video/*"
          style={{ display: 'none' }}
        />

        <div
          className={`upload-zone ${dragOver ? 'upload-zone--drag' : ''} ${isUploading ? 'upload-zone--processing' : ''}`}
          onDragOver={(e) => { e.preventDefault(); if (!isUploading) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isUploading) fileInputRef.current.click(); }}
          role="button"
          tabIndex={0}
        >
          <div className="upload-zone__inner">
            {isUploading ? (
              <>
                <div className="spinner">
                  <div className="spinner__ring" />
                  <div className="spinner__ring spinner__ring--delay" />
                </div>
                <p className="upload-primary">Uploading to server…</p>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 8v24M14 18l10-10 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 38h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="upload-primary">
                  {dragOver ? 'Release to upload' : 'Drop your video here'}
                </p>
                <p className="upload-secondary">or click to browse files</p>
                <div className="format-tags">
                  {['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'].map(f => (
                    <span key={f} className="format-tag">{f}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
