import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

export default function Processing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Connect to SSE log stream
  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSource(`${API_BASE}/api/v1/videos/${id}/logs`);
    
    eventSource.onmessage = (event) => {
      if (event.data) {
        setLogs((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  // Poll video status
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
            // Allow 1.2s to show completed log before navigating
            setTimeout(() => {
              navigate(`/result/${id}`);
            }, 1200);
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

  // Color formatter for log tags
  const renderLogLine = (log, index) => {
    let color = '#a3e635'; // default lime-ish
    if (log.includes('[System]')) color = '#F2C230'; // Gold/Amber
    else if (log.includes('[VisionEngine]')) color = '#4ade80'; // Bright Green
    else if (log.includes('[Audio]')) color = '#38bdf8'; // Sky Blue
    else if (log.includes('[FFmpeg]')) color = '#fb923c'; // Orange
    else if (log.includes('[Intelligence]')) color = '#c084fc'; // Purple
    else if (log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')) color = '#f87171'; // Red

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.45', display: 'flex', gap: '8px' }}>
        <span style={{ color: '#685572', flexShrink: 0 }}>[{timestamp}]</span>
        <span style={{ color, wordBreak: 'break-word' }}>{log}</span>
      </div>
    );
  };

  return (
    <div className="panels" style={{ gridTemplateColumns: '1fr', maxWidth: '880px', margin: '0 auto', paddingTop: '20px' }}>
      <section className="panel panel--output" style={{ borderLeft: '3px solid var(--lime)', borderBottom: '3px solid var(--gray-dim)', background: 'var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="panel__heading" style={{ margin: 0 }}>
            <span className="panel__heading-dot panel__heading-dot--blue" />
            AI Pipeline Processing Job #{id}
          </h2>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: '4px',
            background: status === 'COMPLETED' ? '#22c55e20' : (status === 'FAILED' ? '#ef444420' : '#F2C23020'),
            color: status === 'COMPLETED' ? '#22c55e' : (status === 'FAILED' ? '#ef4444' : '#F2C230'),
            border: `1px solid ${status === 'COMPLETED' ? '#22c55e' : (status === 'FAILED' ? '#ef4444' : '#F2C230')}`
          }}>
            {status}
          </span>
        </div>

        <div className="output-zone" style={{ padding: '0px', background: 'transparent' }}>
          {status === 'FAILED' ? (
            <div className="output-empty" style={{ padding: '40px 20px' }}>
              <div className="upload-icon upload-icon--error">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M24 15v12M24 32v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="upload-primary" style={{color: 'var(--magenta)'}}>Processing failed during pipeline execution</p>
              <button className="btn-danger" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Return to Home</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Animated Progress Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="audio-bars" style={{ margin: 0, height: '24px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="audio-bar" style={{ '--i': i }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                      {status === 'COMPLETED' ? 'PIPELINE FINISHED' : 'EXECUTING MULTI-MODAL HIGHLIGHT EXTRACTION'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                      Computer Vision (OpenCV) · Audio Spectrogram (FFmpeg) · Dynamic Scoring
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4ade80'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 8px #4ade80',
                    display: 'inline-block'
                  }} />
                  LIVE
                </div>
              </div>

              {/* The Hacker Matrix Terminal */}
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #46334f',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                background: '#120c17'
              }}>
                {/* Terminal Window Header */}
                <div style={{
                  background: '#23182b',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #3a2845'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#8082A6',
                    letterSpacing: '1px'
                  }}>
                    FRAMR_CORE_TELEMETRY // RUNTIME
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#685572', fontFamily: 'var(--font-mono)' }}>
                    {logs.length} frames/events logged
                  </div>
                </div>

                {/* Terminal Body */}
                <div
                  ref={terminalRef}
                  style={{
                    padding: '16px',
                    height: '320px',
                    overflowY: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    background: '#120c17',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                  }}
                >
                  {logs.length === 0 ? (
                    <div style={{ color: '#685572', fontStyle: 'italic' }}>
                      &gt; Initializing neural stream socket... Waiting for engine handshake...
                    </div>
                  ) : null}

                  {logs.map((log, index) => renderLogLine(log, index))}

                  {/* Blinking prompt line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--yellow)' }}>
                    <span>&gt;</span>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '14px',
                      background: 'var(--yellow)',
                      animation: 'blink 1s step-end infinite'
                    }} />
                  </div>
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Status footer pill */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--gray-dim)',
                padding: '0 4px'
              }}>
                <span>THREAD: 0 (PARALLEL FAST SEEK)</span>
                <span>CRF: 23 · PRESET: ULTRAFAST</span>
                <span>STATUS: {status === 'COMPLETED' ? 'READY FOR EDIT STUDIO' : 'EXTRACTING HIGHLIGHTS...'}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Inline styles for cursor blink */}
      <style>{`
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
