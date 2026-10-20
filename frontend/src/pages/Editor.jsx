import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);

  // Editor State
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [transition, setTransition] = useState('none');
  const [speed, setSpeed] = useState(1.0);
  const [soundtrack, setSoundtrack] = useState('none');
  const [isMuted, setIsMuted] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Hardcoded to 3 clips based on backend `num_clips=3`
  const [clips, setClips] = useState([
    { id: 'clip1', color: '#ff3366', originalIndex: 0 },
    { id: 'clip2', color: '#33ccff', originalIndex: 1 },
    { id: 'clip3', color: '#cc33ff', originalIndex: 2 }
  ]);
  
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const bgmAudioRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'COMPLETED') setVideoData(d);
      })
      .catch(e => console.error(e));
  }, [id]);

  // Cleanup BGM on unmount
  useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
    };
  }, []);

  // Smooth seeker animation synced to 60fps requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!videoData) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
        Initializing Studio Engine...
      </div>
    );
  }

  const highlightUrl = `${API_BASE}/highlights/${videoData.highlight_path}`;

  // Build the CSS filter string
  let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) `;
  if (filter === 'grayscale') filterStr += 'grayscale(100%) ';
  if (filter === 'vibrant') filterStr += 'saturate(200%) contrast(120%) ';
  if (filter === 'vintage') filterStr += 'sepia(60%) contrast(90%) hue-rotate(-15deg) ';

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleSoundtrackChange = (track) => {
    setSoundtrack(track);
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current = null;
    }
    if (track !== 'none') {
      const audio = new Audio(`${API_BASE}/music/${track}.wav`);
      audio.loop = true;
      audio.volume = 0.35;
      bgmAudioRef.current = audio;
      if (videoRef.current && !videoRef.current.paused) {
        audio.play().catch(() => {});
      }
    }
  };

  const handleExport = async (overrideAspect) => {
    setIsExporting(true);
    const finalAspect = (typeof overrideAspect === 'string') ? overrideAspect : aspectRatio;
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspect_ratio: finalAspect,
          filter_type: filter,
          brightness: brightness,
          contrast: contrast,
          saturation: saturation,
          blur: blur,
          flip_h: flipH,
          transition: transition,
          speed: speed,
          soundtrack: soundtrack,
          is_muted: isMuted,
          overlay_text: overlayText,
          clip_order: clips.map(c => c.originalIndex)
        })
      });
      const data = await res.json();
      
      if (data.export_url) {
        const downloadUrl = data.export_url.startsWith('http') ? data.export_url : `${API_BASE}${data.export_url}`;
        const fileRes = await fetch(downloadUrl);
        const blob = await fileRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const prefix = finalAspect === '9/16' ? 'instagram_reel_' : 'edited_';
        a.download = `${prefix}${videoData.filename}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Export failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTrackClick = (e) => {
    if (!trackRef.current || !videoRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (bgmAudioRef.current) {
      bgmAudioRef.current.currentTime = newTime % 25;
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('clipIndex', index);
  };

  const handleDrop = (e, index) => {
    const fromIndex = parseInt(e.dataTransfer.getData('clipIndex'), 10);
    if (isNaN(fromIndex)) return;
    const newClips = [...clips];
    const [moved] = newClips.splice(fromIndex, 1);
    newClips.splice(index, 0, moved);
    setClips(newClips);
  };

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentClipIndex = duration > 0 ? Math.min(clips.length - 1, Math.floor((currentTime / duration) * clips.length)) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--render-canvas)', display: 'flex', flexDirection: 'column' }}>
      <div className="editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', border: 'none', borderTop: '2px solid var(--render-purple)' }}>
        
        {/* Top Header */}
        <div className="editor-panel__header" style={{
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--render-border)',
          background: 'var(--render-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)'
            }}>
              FRAMR Studio Pro // Timeline &amp; Compositing
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn-render-outline"
              onClick={() => navigate(`/result/${id}`)}
              disabled={isExporting}
              style={{ padding: '7px 14px', fontSize: '0.78rem' }}
            >
              Cancel
            </button>
            <button
              className="btn-render-primary"
              onClick={() => handleExport('9/16')}
              disabled={isExporting}
              style={{ padding: '7px 16px', fontSize: '0.78rem' }}
            >
              <span>Export 9:16 Reel</span>
            </button>
            <button
              className="btn-render-white"
              onClick={() => handleExport()}
              disabled={isExporting}
              style={{ padding: '7px 16px', fontSize: '0.78rem' }}
            >
              {isExporting ? 'Exporting...' : 'Export Changes'}
            </button>
          </div>
        </div>
        
        {/* Body Container */}
        <div 
          className="editor-panel__body" 
          style={{ 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: '1fr 320px',
            gap: '20px', 
            padding: '20px', 
            minHeight: 0, 
            overflow: 'auto',
            background: 'var(--render-canvas)'
          }}
        >
          {/* Main Video & Timeline Area */}
          <div className="editor-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div className="editor-video-container" style={{
              flex: 1,
              background: '#040407',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 0,
              borderRadius: '6px',
              border: '1px solid var(--render-border)'
            }}>
              
              <div style={{
                position: 'relative',
                aspectRatio: aspectRatio,
                maxWidth: '100%',
                maxHeight: '100%',
                height: aspectRatio === '9/16' ? '100%' : 'auto',
                width: aspectRatio === '9/16' ? 'auto' : '100%',
                overflow: 'hidden',
                borderRadius: '4px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
                border: '1px solid var(--render-border)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <video
                  ref={videoRef}
                  src={highlightUrl}
                  controls={false}
                  muted={isMuted}
                  autoPlay
                  loop
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => {
                    if (bgmAudioRef.current) bgmAudioRef.current.play().catch(() => {});
                  }}
                  onPause={() => {
                    if (bgmAudioRef.current) bgmAudioRef.current.pause();
                  }}
                  onClick={() => videoRef.current && (videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause())}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: filterStr,
                    transform: flipH ? 'scaleX(-1)' : 'none',
                    transition: 'filter 0.3s, transform 0.3s',
                    cursor: 'pointer'
                  }}
                />
                
                {overlayText && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    letterSpacing: '-0.01em'
                  }}>
                    {overlayText}
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive Timeline with Drag-and-Drop */}
            <div className="editor-timeline" style={{
              padding: '16px 20px',
              background: 'var(--render-surface)',
              border: '1px solid var(--render-border)',
              borderRadius: '6px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-primary)'
                }}>
                  Highlight Sequences (Drag blocks to reorder)
                </span>
                <span className="timeline-time" style={{ fontFamily: 'var(--font-mono)', color: 'var(--render-purple-accent)', fontSize: '0.76rem' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div 
                className="timeline-track" 
                ref={trackRef} 
                onClick={handleTrackClick}
                style={{
                  position: 'relative',
                  height: '52px',
                  background: '#040407',
                  border: '1px solid var(--render-border)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  gap: '6px',
                  padding: '4px'
                }}
              >
                {/* Playhead */}
                <div 
                  className="timeline-playhead" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: `${playheadPercent}%`, 
                    width: '2px', 
                    background: 'var(--render-purple-light)', 
                    zIndex: 10,
                    boxShadow: '0 0 8px var(--render-purple)',
                    pointerEvents: 'none'
                  }} 
                />

                {/* Clips block */}
                {clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{
                      flex: 1,
                      height: '100%',
                      background: index === currentClipIndex ? 'var(--render-purple-glow)' : 'rgba(255, 255, 255, 0.03)',
                      border: index === currentClipIndex ? '1px solid var(--render-purple-light)' : '1px solid var(--render-border)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>::</span>
                      <span style={{
                        fontWeight: 600,
                        color: index === currentClipIndex ? 'var(--render-purple-accent)' : 'var(--text-secondary)',
                        fontSize: '0.76rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        SCENE #{clip.originalIndex + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Side Controls Panel */}
          <div className="editor-controls" style={{
            overflowY: 'auto',
            maxHeight: '100%',
            borderRadius: '6px',
            padding: '20px',
            background: 'var(--render-surface)',
            border: '1px solid var(--render-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            {/* Speed Control */}
            <div className="control-group">
              <label className="control-label">Speed &amp; Motion Curve</label>
              <div className="control-row">
                <button className={`control-btn ${speed === 0.5 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(0.5)}>0.5x Slow-Mo</button>
                <button className={`control-btn ${speed === 0.75 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(0.75)}>0.75x</button>
                <button className={`control-btn ${speed === 1.0 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(1.0)}>1.0x Normal</button>
                <button className={`control-btn ${speed === 1.5 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(1.5)}>1.5x</button>
                <button className={`control-btn ${speed === 2.0 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(2.0)}>2.0x Hyper</button>
              </div>
            </div>

            {/* AI Soundtracks */}
            <div className="control-group">
              <label className="control-label">BGM Soundtrack (Auto-Ducked)</label>
              <div className="control-row">
                <button className={`control-btn ${soundtrack === 'none' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('none')}>None</button>
                <button className={`control-btn ${soundtrack === 'cyber_beat' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('cyber_beat')}>Cyber Beat</button>
                <button className={`control-btn ${soundtrack === 'epic_action' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('epic_action')}>Epic Action</button>
                <button className={`control-btn ${soundtrack === 'lofi_chill' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('lofi_chill')}>Lo-Fi Chill</button>
              </div>
            </div>

            {/* Transitions */}
            <div className="control-group">
              <label className="control-label">Scene Transitions</label>
              <div className="control-row">
                <button className={`control-btn ${transition === 'none' ? 'control-btn--active' : ''}`} onClick={() => setTransition('none')}>Cut</button>
                <button className={`control-btn ${transition === 'fade' ? 'control-btn--active' : ''}`} onClick={() => setTransition('fade')}>Fade</button>
                <button className={`control-btn ${transition === 'wipeleft' ? 'control-btn--active' : ''}`} onClick={() => setTransition('wipeleft')}>Wipe</button>
                <button className={`control-btn ${transition === 'pixelize' ? 'control-btn--active' : ''}`} onClick={() => setTransition('pixelize')}>Pixelize</button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="control-group">
              <label className="control-label">Aspect Ratio Framing</label>
              <div className="control-row">
                <button className={`control-btn ${aspectRatio === '16/9' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('16/9')}>16:9 Landscape</button>
                <button className={`control-btn ${aspectRatio === '9/16' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('9/16')}>9:16 Vertical Reel</button>
                <button className={`control-btn ${aspectRatio === '1/1' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('1/1')}>1:1 Square</button>
              </div>
            </div>
            
            {/* Color Filters */}
            <div className="control-group">
              <label className="control-label">Color Grading</label>
              <div className="control-row">
                <button className={`control-btn ${filter === 'none' ? 'control-btn--active' : ''}`} onClick={() => setFilter('none')}>Original</button>
                <button className={`control-btn ${filter === 'grayscale' ? 'control-btn--active' : ''}`} onClick={() => setFilter('grayscale')}>Monochrome</button>
                <button className={`control-btn ${filter === 'vibrant' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vibrant')}>Vibrant</button>
                <button className={`control-btn ${filter === 'vintage' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vintage')}>Vintage Film</button>
              </div>
            </div>
            
            {/* Adjustments */}
            <div className="control-group">
              <label className="control-label">Luminance &amp; Tone</label>
              <div className="control-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Brightness ({brightness}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} />
                
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Contrast ({contrast}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={contrast} onChange={e => setContrast(e.target.value)} />
                
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Saturation ({saturation}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={saturation} onChange={e => setSaturation(e.target.value)} />
                
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Blur ({blur}px)</span>
                <input type="range" className="control-slider" min="0" max="20" value={blur} onChange={e => setBlur(e.target.value)} />
              </div>
            </div>

            {/* Orientation */}
            <div className="control-group">
              <label className="control-label">Orientation</label>
              <div className="control-row">
                <button className={`control-btn ${flipH ? 'control-btn--active' : ''}`} onClick={() => setFlipH(!flipH)}>
                  Flip Horizontal
                </button>
              </div>
            </div>

            {/* Audio & Text */}
            <div className="control-group">
              <label className="control-label">Audio &amp; Text Overlay</label>
              <div className="control-row">
                <button className={`control-btn ${isMuted ? 'control-btn--active' : ''}`} onClick={() => {
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}>
                  {isMuted ? 'Unmute Original Audio' : 'Mute Original Audio'}
                </button>
              </div>
              <div className="control-row" style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter text overlay..."
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--render-card)',
                    border: '1px solid var(--render-border)',
                    color: 'white',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--render-purple-light)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--render-border)'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
