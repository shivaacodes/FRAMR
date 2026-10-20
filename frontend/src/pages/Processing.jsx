import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const tagColor = (log) => {
  if (log.includes('[System]'))       return 'var(--render-amber)';
  if (log.includes('[VisionEngine]')) return 'var(--render-purple-light)';
  if (log.includes('[Audio]'))        return 'var(--render-emerald)';
  if (log.includes('[FFmpeg]'))       return 'var(--render-purple-accent)';
  if (log.includes('[Intelligence]')) return '#c084fc';
  if (log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')) return 'var(--render-rose)';
  return 'var(--text-secondary)';
};

export default function Processing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSource(`${API_BASE}/api/v1/videos/${id}/logs`);
    eventSource.onmessage = (event) => {
      if (event.data) setLogs((prev) => [...prev, event.data]);
    };
    eventSource.onerror = () => { eventSource.close(); };
    return () => { eventSource.close(); };
  }, [id]);

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
            setTimeout(() => navigate(`/result/${id}`), 1200);
          } else if (d.status === 'FAILED') {
            setStatus('FAILED');
            clearInterval(iv);
          } else {
            setStatus(d.status);
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 1500);
    }
    return () => clearInterval(iv);
  }, [id, status, navigate]);

  const renderLogLine = (log, index) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return (
      <div key={index} style={{ marginBottom: '3px', lineHeight: '1.5', display: 'flex', gap: '10px' }}>
        <span style={{ color: 'var(--text-dim)', flexShrink: 0, fontSize: '0.65rem' }}>[{timestamp}]</span>
        <span style={{ color: tagColor(log), wordBreak: 'break-word', fontSize: '0.74rem' }}>{log}</span>
      </div>
    );
  };

  const isComplete = status === 'COMPLETED';
  const isFailed = status === 'FAILED';

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: 'clamp(20px, 4vw, 44px) clamp(16px, 3vw, 32px)',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      <section
        className="render-card"
        style={{ padding: 'clamp(20px, 3vw, 32px)' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isComplete ? 'var(--render-emerald)' : 'var(--render-purple-light)' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Pipeline Processing // Job #{id}
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', marginLeft: '16px' }}>
              Subsampled 5 FPS optical motion differential &amp; 44.1kHz RMS transient fusion
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            padding: '5px 12px',
            borderRadius: '4px',
            background: isComplete ? 'rgba(16, 185, 129, 0.1)' : isFailed ? 'rgba(239, 68, 68, 0.1)' : 'var(--render-purple-glow)',
            color: isComplete ? 'var(--render-emerald)' : isFailed ? 'var(--render-rose)' : 'var(--render-purple-accent)',
            border: `1px solid ${isComplete ? 'rgba(16, 185, 129, 0.25)' : isFailed ? 'rgba(239, 68, 68, 0.25)' : 'var(--render-border-hover)'}`,
            fontWeight: 600,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'currentColor',
              display: 'inline-block'
            }} />
            <span>{isComplete ? 'COMPLETED' : isFailed ? 'FAILED' : 'DEPLOYING'}</span>
          </div>
        </div>

        {isFailed ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="var(--render-rose)" style={{ marginBottom: '14px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p style={{ color: 'var(--render-rose)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Pipeline Execution Interrupted
            </p>
            <button
              className="btn-render-outline"
              onClick={() => navigate('/ingest')}
              style={{ cursor: 'pointer' }}
            >
              Return to Ingestion Portal
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Status Telemetry Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'var(--render-surface)',
              border: '1px solid var(--render-border)',
              borderRadius: '6px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px' }}>
                  {[14, 20, 10, 24, 18, 8, 22, 16].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h}px`,
                        background: 'var(--render-purple-light)',
                        opacity: 0.8,
                        borderRadius: '1px',
                        animation: `eqJump 0.8s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                    {isComplete ? 'Analysis Completed — Highlights Synthesized' : 'Extracting Multi-Modal Highlight Vectors'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    OpenCV Farneback 5 FPS + 44.1kHz Acoustic RMS Fusion
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: isComplete ? 'var(--render-emerald)' : 'var(--render-purple-light)'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  display: 'inline-block'
                }} />
                <span>{isComplete ? 'OUTPUT READY' : 'LIVE TELEMETRY'}</span>
              </div>
            </div>

            {/* Terminal Console */}
            <div style={{
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--render-border)',
              background: '#040407',
            }}>
              {/* Terminal Header */}
              <div style={{
                background: 'var(--render-surface)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--render-border)',
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--render-rose)', opacity: 0.7, display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--render-amber)', opacity: 0.7, display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--render-emerald)', opacity: 0.7, display: 'inline-block' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  telemetry: video_stream #{id}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {logs.length} frames logged
                </div>
              </div>

              {/* Terminal Body */}
              <div
                ref={terminalRef}
                style={{
                  padding: '18px',
                  height: '340px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  background: '#040407',
                }}
              >
                {logs.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    &gt; Initializing OpenCV vision daemon... calculating optical vectors...
                  </div>
                )}
                {logs.map((log, index) => renderLogLine(log, index))}
                
                {/* Blinking block cursor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--render-purple-light)' }}>
                  <span style={{ fontSize: '0.75rem' }}>&gt;</span>
                  <span className="render-cursor">█</span>
                </div>
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Footer Status Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span>ACCELERATION: ZERO-GPU 60 FPS</span>
              <span>FUSION: 60% AUDIO RMS + 40% OPTICAL CV</span>
              <span style={{ color: isComplete ? 'var(--render-emerald)' : 'var(--render-purple-light)', fontWeight: 600 }}>
                {isComplete ? 'NAVIGATING TO REEL STUDIO →' : 'COMPUTING MOTION DELTAS...'}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
