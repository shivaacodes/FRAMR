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
    let color = '#00f0ff'; // default cyan
    if (log.includes('[System]')) color = '#ffe600'; // Neon Yellow
    else if (log.includes('[VisionEngine]')) color = '#39ff14'; // Matrix Green
    else if (log.includes('[Audio]')) color = '#00f0ff'; // Cyan
    else if (log.includes('[FFmpeg]')) color = '#ff007f'; // Hot Pink
    else if (log.includes('[Intelligence]')) color = '#c084fc'; // Purple
    else if (log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')) color = '#ff3344'; // Red

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.45', display: 'flex', gap: '8px' }}>
        <span style={{ color: '#4a3f55', flexShrink: 0 }}>[{timestamp}]</span>
        <span style={{ color, wordBreak: 'break-word' }}>{log}</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '30px 20px', width: '100%', position: 'relative', zIndex: 10 }}>
      <section 
        className="cyber-card cyber-cut" 
        style={{ 
          background: 'rgba(16, 12, 28, 0.94)', 
          padding: '24px', 
          borderRadius: '12px' 
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff007f', boxShadow: '0 0 10px #ff007f' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                letterSpacing: '1.5px',
                color: '#fff',
                margin: 0
              }}>
                STAGE 02 // MULTI-MODAL CV EXTRACTION
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8082a6', fontFamily: 'var(--font-mono)', marginTop: '4px', marginLeft: '16px' }}>
              JOB_ID: #{id} · PROCESSING NEURAL PIPELINE
            </div>
          </div>

          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            padding: '4px 12px',
            borderRadius: '4px',
            background: status === 'COMPLETED' ? 'rgba(57, 255, 20, 0.15)' : (status === 'FAILED' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(0, 240, 255, 0.15)'),
            color: status === 'COMPLETED' ? '#39ff14' : (status === 'FAILED' ? '#ff007f' : '#00f0ff'),
            border: `1px solid ${status === 'COMPLETED' ? '#39ff14' : (status === 'FAILED' ? '#ff007f' : '#00f0ff')}`,
            boxShadow: `0 0 10px ${status === 'COMPLETED' ? '#39ff14' : (status === 'FAILED' ? '#ff007f' : '#00f0ff')}40`
          }}>
            ● {status}
          </span>
        </div>

        <div>
          {status === 'FAILED' ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
              <p style={{ color: '#ff007f', fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                PIPELINE EXECUTION INTERRUPTED
              </p>
              <button 
                className="btn-danger" 
                onClick={() => navigate('/')} 
                style={{ marginTop: '16px', background: '#ff007f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Return to Ingestion Portal
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* 3D Waveform Audio Visualizer & State Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'rgba(0, 240, 255, 0.04)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                boxShadow: 'inset 0 0 15px rgba(0, 240, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Neon Equalizer Bars */}
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
                    {[16, 24, 12, 28, 20, 10, 26, 18, 22].map((h, i) => (
                      <span 
                        key={i} 
                        style={{
                          width: '3px',
                          height: `${h}px`,
                          background: 'linear-gradient(to top, #00f0ff, #ff007f)',
                          borderRadius: '1px',
                          animation: `equalizeBar 0.8s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.1}s`
                        }} 
                      />
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
                      {status === 'COMPLETED' ? 'PIPELINE COMPLETE // HIGHLIGHTS READY' : 'EXTRACTING MULTI-MODAL HIGHLIGHT PEAKS'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8082A6', fontFamily: 'var(--font-mono)' }}>
                      OpenCV Motion Differential + 44.1kHz RMS Energy Fusion
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#39ff14'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#39ff14',
                    boxShadow: '0 0 10px #39ff14',
                    display: 'inline-block'
                  }} />
                  LIVE_FEED
                </div>
              </div>

              {/* The Matrix Terminal */}
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0, 240, 255, 0.05)',
                background: '#09060f'
              }}>
                {/* Terminal Window Header */}
                <div style={{
                  background: '#150e1f',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                    <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#00f0ff',
                    letterSpacing: '1px'
                  }}>
                    FRAMR_CORE_TELEMETRY // STREAM
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#685572', fontFamily: 'var(--font-mono)' }}>
                    {logs.length} telemetry frames
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
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    background: '#09060f',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)'
                  }}
                >
                  {logs.length === 0 ? (
                    <div style={{ color: '#4a3f55', fontStyle: 'italic' }}>
                      &gt; Establishing socket uplink to AI vision daemon... Initializing optical vectors...
                    </div>
                  ) : null}

                  {logs.map((log, index) => renderLogLine(log, index))}

                  {/* Blinking prompt line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#00f0ff' }}>
                    <span>&gt;</span>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '14px',
                      background: '#00f0ff',
                      boxShadow: '0 0 8px #00f0ff',
                      animation: 'blink 1s step-end infinite'
                    }} />
                  </div>
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Status Footer Pill */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: '#8082a6',
                padding: '0 4px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>ACCELERATION: ULTRAFAST 60FPS</span>
                <span>FUSION: 60% AUDIO RMS + 40% OPTICAL CV</span>
                <span style={{ color: status === 'COMPLETED' ? '#39ff14' : '#00f0ff' }}>
                  {status === 'COMPLETED' ? '✓ TRANSITIONING TO REEL SHOWCASE' : 'SCANNING PEAKS...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes equalizeBar {
          0% { height: 6px; }
          100% { height: 24px; }
        }
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
