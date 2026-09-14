import { useState, useRef, useEffect, useCallback } from 'react';

/* ───────────────────────────────────────────────────
   CURSOR
─────────────────────────────────────────────────── */
function useCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const rng  = ringRef.current;
    if (!dot || !rng) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      dot.style.left = `${e.clientX}px`;
      dot.style.top  = `${e.clientY}px`;
    };

    const onDown = () => rng.classList.add('cursor-ring--click');
    const onUp   = () => rng.classList.remove('cursor-ring--click');

    const onEnter = (e) => {
      const t = e.target;
      if (t.matches('button, a, [role="button"], .upload-zone, .format-tag')) {
        rng.classList.add('cursor-ring--hover');
      }
    };
    const onLeave = () => rng.classList.remove('cursor-ring--hover');

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.14);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.14);
      rng.style.left = `${ring.current.x}px`;
      rng.style.top  = `${ring.current.y}px`;
      raf.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout',  onLeave);
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout',  onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return { dotRef, ringRef };
}

const API_BASE = 'http://localhost:8000';

/* ─────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────── */
export default function App() {
  const { dotRef, ringRef } = useCursor();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status,       setStatus]       = useState(null);
  const [logs,         setLogs]         = useState([]);
  const [videoId,      setVideoId]      = useState(null);
  const [highlightUrl, setHighlightUrl] = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [fileName,     setFileName]     = useState(null);
  const fileInputRef                    = useRef(null);
  const logEndRef                       = useRef(null);

  const addLog = useCallback(msg => setLogs(p => [...p, msg]), []);

  /* auto-scroll log */
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  /* ── upload ── */
  const handleUpload = async file => {
    if (!file) return;
    setIsProcessing(true); setStatus('UPLOADING'); setLogs([]); setFileName(file.name);
    addLog(`INIT: ${file.name}`);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res  = await fetch(`${API_BASE}/api/v1/videos/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.video_id) {
        setVideoId(data.video_id); setStatus('PROCESSING');
        addLog(`ID: ${data.video_id}`);
        addLog('STATUS: queued for AI extraction');
      } else throw new Error('Upload failed');
    } catch (err) {
      console.error(err); setStatus('FAILED'); addLog('ERR: UPLOAD FAILED');
    }
  };

  const handleDrop       = e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files[0]); };
  const handleFileSelect = e => { if (e.target.files?.length) handleUpload(e.target.files[0]); };

  /* ── polling ── */
  useEffect(() => {
    let iv;
    if (videoId && (status === 'PENDING' || status === 'PROCESSING')) {
      iv = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}`);
          const d   = await res.json();
          if (d.status === 'COMPLETED') {
            setStatus('COMPLETED');
            setHighlightUrl(`${API_BASE}/highlights/${d.highlight_path}`);
            addLog('STATUS: extraction complete ✓');
            clearInterval(iv);
          } else if (d.status === 'FAILED') {
            setStatus('FAILED');
            addLog('ERR: extraction failed');
            clearInterval(iv);
          }
        } catch (e) { console.error('Polling error', e); }
      }, 2000);
    }
    return () => clearInterval(iv);
  }, [videoId, status]);

  const idle       = !isProcessing;
  const processing = isProcessing && status !== 'COMPLETED' && status !== 'FAILED';
  const completed  = status === 'COMPLETED';
  const failed     = status === 'FAILED';

  const reset = () => {
    setIsProcessing(false); setStatus(null); setLogs([]);
    setVideoId(null); setHighlightUrl(null); setFileName(null);
  };

  /* Status label */
  const statusLabel = () => {
    if (idle)       return 'READY';
    if (processing) return status;
    if (completed)  return 'DONE';
    if (failed)     return 'FAILED';
    return status;
  };

  return (
    <div className="app-shell">
      {/* ── CURSOR ── */}
      <div className="cursor-dot"  ref={dotRef}  aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      {/* ── TOP BAR ── */}
      <header className="top-bar">
        <div className="top-bar__brand">
          <span className="top-bar__logo">FRAMR</span>
          <span className="top-bar__divider" />
          <span className="top-bar__tagline">AI Highlight Extraction</span>
        </div>
        <div className="top-bar__right">
          <span className={`status-pill status-pill--${(status || 'idle').toLowerCase()}`}>
            {processing && <span className="status-pulse" />}
            {statusLabel()}
          </span>
          <span className="version-label">v1.0</span>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        {/* Scattered label blocks — brutalist poster style */}
        <span className="hero-label" aria-hidden="true" style={{top:'18px',right:'140px'}}>AI</span>
        <span className="hero-label hero-label--mag" aria-hidden="true" style={{top:'40px',right:'44px'}}>EXTRACT</span>
        <span className="hero-label" aria-hidden="true" style={{bottom:'30px',left:'48%'}}>VIDEO</span>
        <span className="hero-label hero-label--mag" aria-hidden="true" style={{bottom:'14px',right:'200px'}}>2026</span>

        <div className="hero__content">
          <p className="hero__eyebrow">Automated / AI-Powered / Instant</p>
          <h1 className="hero__wordmark">
            <span>F</span>
            <span>R</span>
            <span className="hero__wordmark-a">A</span>
            <span>M</span>
            <span>R</span>
          </h1>
          <p className="hero__sub">
            Drop your raw footage below. FRAMR's AI engine identifies,
            ranks, and extracts your best moments in seconds.
          </p>
        </div>
        <div className="hero__decoration" aria-hidden="true">
          <div className="deco-bar deco-bar--1" />
          <div className="deco-bar deco-bar--2" />
          <div className="deco-bar deco-bar--3" />
        </div>
      </section>

      {/* ── MAIN PANELS ── */}
      <main className="panels">

        {/* INPUT PANEL */}
        <section className="panel panel--input">
          <h2 className="panel__heading">
            <span className="panel__heading-dot" />
            Input Feed
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/*"
            style={{ display: 'none' }}
          />

          {/* Upload Zone */}
          <div
            className={[
              'upload-zone',
              dragOver     ? 'upload-zone--drag'       : '',
              processing   ? 'upload-zone--processing' : '',
              completed    ? 'upload-zone--done'       : '',
              failed       ? 'upload-zone--failed'     : '',
            ].join(' ')}
            onDragOver={e => { e.preventDefault(); if (idle) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => { if (idle) fileInputRef.current.click(); }}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { if (idle) fileInputRef.current.click(); } }}
            aria-label="Upload video file"
          >
            {/* ── Idle ── */}
            {idle && (
              <div className="upload-zone__inner">
                <div className="upload-icon">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M24 8v24M14 18l10-10 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 38h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="upload-primary">
                  {dragOver ? 'Release to upload' : 'Drop your video here'}
                </p>
                <p className="upload-secondary">or click to browse files</p>
                <div className="format-tags">
                  {['MP4','MOV','AVI','MKV','WEBM'].map(f => (
                    <span key={f} className="format-tag">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Processing ── */}
            {processing && (
              <div className="upload-zone__inner">
                <div className="spinner">
                  <div className="spinner__ring" />
                  <div className="spinner__ring spinner__ring--delay" />
                </div>
                <p className="upload-primary">Extracting highlights…</p>
                {fileName && <p className="upload-secondary upload-secondary--file">{fileName}</p>}
              </div>
            )}

            {/* ── Completed ── */}
            {completed && (
              <div className="upload-zone__inner">
                <div className="upload-icon upload-icon--done">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M15 24l7 7 11-13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="upload-primary">Extraction complete</p>
                {fileName && <p className="upload-secondary upload-secondary--file">{fileName}</p>}
                <button
                  className="btn-secondary"
                  onClick={e => { e.stopPropagation(); reset(); }}
                >
                  Upload another video
                </button>
              </div>
            )}

            {/* ── Failed ── */}
            {failed && (
              <div className="upload-zone__inner">
                <div className="upload-icon upload-icon--error">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M24 15v12M24 32v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="upload-primary">Processing failed</p>
                <p className="upload-secondary">Check your file and try again</p>
                <button
                  className="btn-danger"
                  onClick={e => { e.stopPropagation(); reset(); }}
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Process Log */}
          {logs.length > 0 && (
            <div className="log-panel">
              <div className="log-panel__header">
                <span className="log-panel__dots">
                  <i /><i /><i />
                </span>
                <span className="log-panel__title">PROCESS LOG</span>
              </div>
              <div className="log-panel__body">
                {logs.map((log, i) => (
                  <div key={i} className="log-line">
                    <span className="log-line__prompt">›</span>
                    <span>{log}</span>
                  </div>
                ))}
                {processing && <div ref={logEndRef} className="log-cursor">_</div>}
                <div ref={!processing ? logEndRef : undefined} />
              </div>
            </div>
          )}
        </section>

        {/* OUTPUT PANEL */}
        <section className="panel panel--output">
          <h2 className="panel__heading">
            <span className="panel__heading-dot panel__heading-dot--blue" />
            Output Feed
          </h2>

          <div className="output-zone">

            {/* ── Empty ── */}
            {!processing && !completed && (
              <div className="output-empty">
                <div className="output-empty__icon">
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <rect x="4" y="12" width="56" height="40" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M27 22l14 10-14 10V22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M4 20h56" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
                  </svg>
                </div>
                <p className="output-empty__title">No output yet</p>
                <p className="output-empty__sub">
                  Upload a video on the left<br />to see your highlight reel here
                </p>
              </div>
            )}

            {/* ── Loading ── */}
            {processing && (
              <div className="output-loading">
                <div className="audio-bars">
                  {[1,2,3,4,5,6,7].map(i => (
                    <span key={i} className="audio-bar" style={{ '--i': i }} />
                  ))}
                </div>
                <p className="output-loading__text">AI is analysing your video…</p>
                <p className="output-loading__sub">This may take a moment</p>
              </div>
            )}

            {/* ── Video Result ── */}
            {completed && highlightUrl && (
              <div className="video-result">
                <video
                  id="highlight-video"
                  className="video-player"
                  src={highlightUrl}
                  controls
                  autoPlay
                />
                <div className="video-bar">
                  <div className="video-bar__left">
                    <span className="video-badge">HIGHLIGHT REEL</span>
                    {fileName && <span className="video-filename">{fileName}</span>}
                  </div>
                  <a
                    href={highlightUrl}
                    download="framr-highlight.mp4"
                    className="btn-download"
                    onClick={e => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="app-footer">
        <span>FRAMR © 2026</span>
        <span className="footer-sep">·</span>
        <span>Automated AI Highlight Extraction Engine</span>
      </footer>

    </div>
  );
}
