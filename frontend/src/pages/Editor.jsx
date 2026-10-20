import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspect_ratio: aspectRatio,
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
        const fileRes = await fetch(data.export_url);
        const blob = await fileRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `edited_${videoData.filename}`;
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      <div className="editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', border: 'none', borderTop: '3px solid var(--magenta)' }}>
        
        {/* Top Header */}
        <div className="editor-panel__header" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-dim)', background: 'var(--ink)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="editor-panel__dot" style={{ width: '10px', height: '10px', background: 'var(--lime)' }}></span>
            <h3 className="editor-panel__title" style={{ margin: 0, fontSize: '1.05rem', letterSpacing: '1px' }}>
              FRAMR EDIT STUDIO // PRO SUITE
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => navigate(`/result/${id}`)} disabled={isExporting} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button
              className="btn-download"
              onClick={handleExport}
              disabled={isExporting}
              style={{
                background: 'var(--lime)',
                color: 'var(--black)',
                fontWeight: 'bold',
                padding: '8px 20px',
                fontSize: '0.85rem'
              }}
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
            gridTemplateColumns: '1fr 340px', 
            gap: '20px', 
            padding: '20px', 
            minHeight: 0, 
            overflow: 'hidden',
            background: 'var(--surface)'
          }}
        >
          {/* Main Video & Timeline Area */}
          <div className="editor-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div className="editor-video-container" style={{ flex: 1, background: '#0a060e', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0, borderRadius: '8px' }}>
              
              <div style={{
                position: 'relative',
                aspectRatio: aspectRatio,
                maxWidth: '100%',
                maxHeight: '100%',
                height: aspectRatio === '9/16' ? '100%' : 'auto',
                width: aspectRatio === '9/16' ? 'auto' : '100%',
                overflow: 'hidden',
                borderRadius: '4px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                border: '1px solid var(--gray-dim)',
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
                    fontSize: '2.4rem',
                    color: 'white',
                    textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    letterSpacing: '1px'
                  }}>
                    {overlayText}
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive Timeline with Drag-and-Drop */}
            <div className="editor-timeline" style={{ padding: '16px 20px', background: 'var(--ink)', borderRadius: '8px', marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="timeline-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>↕️</span> AI Highlights Sequence (Drag blocks to rearrange)
                </span>
                <span className="timeline-time" style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div 
                className="timeline-track" 
                ref={trackRef} 
                onClick={handleTrackClick}
                style={{ position: 'relative', height: '52px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', cursor: 'pointer', overflow: 'hidden', display: 'flex', gap: '6px', padding: '3px' }}
              >
                {/* Playhead */}
                <div 
                  className="timeline-playhead" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: `${playheadPercent}%`, 
                    width: '3px', 
                    background: 'var(--yellow)', 
                    zIndex: 10,
                    boxShadow: '0 0 10px var(--yellow)',
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
                      background: index === currentClipIndex ? 'rgba(242, 194, 48, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: index === currentClipIndex ? '2px solid var(--lime)' : '1px solid var(--gray-dim)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>⋮⋮</span>
                      <span style={{ fontWeight: 'bold', color: index === currentClipIndex ? 'var(--lime)' : '#bbb', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                        SCENE #{clip.originalIndex + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Side Controls Panel */}
          <div className="editor-controls" style={{ overflowY: 'auto', maxHeight: '100%', borderRadius: '8px', padding: '18px', background: 'var(--ink)' }}>
            
            {/* Speed Control (Feature 2) */}
            <div className="control-group">
              <label className="control-label">Speed &amp; Slow-Mo</label>
              <div className="control-row">
                <button className={`control-btn ${speed === 0.5 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(0.5)}>0.5x Slow-Mo</button>
                <button className={`control-btn ${speed === 0.75 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(0.75)}>0.75x</button>
                <button className={`control-btn ${speed === 1.0 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(1.0)}>1.0x Normal</button>
                <button className={`control-btn ${speed === 1.5 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(1.5)}>1.5x</button>
                <button className={`control-btn ${speed === 2.0 ? 'control-btn--active' : ''}`} onClick={() => handleSpeedChange(2.0)}>2.0x Hyper</button>
              </div>
            </div>

            {/* AI Soundtracks (Feature 3) */}
            <div className="control-group">
              <label className="control-label">AI Soundtracks (Auto Ducking)</label>
              <div className="control-row">
                <button className={`control-btn ${soundtrack === 'none' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('none')}>None</button>
                <button className={`control-btn ${soundtrack === 'cyber_beat' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('cyber_beat')}>⚡ Cyber Beat</button>
                <button className={`control-btn ${soundtrack === 'epic_action' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('epic_action')}>🔥 Epic Action</button>
                <button className={`control-btn ${soundtrack === 'lofi_chill' ? 'control-btn--active' : ''}`} onClick={() => handleSoundtrackChange('lofi_chill')}>☕ Lo-Fi Chill</button>
              </div>
            </div>

            {/* Transitions */}
            <div className="control-group">
              <label className="control-label">Transitions</label>
              <div className="control-row">
                <button className={`control-btn ${transition === 'none' ? 'control-btn--active' : ''}`} onClick={() => setTransition('none')}>Cut</button>
                <button className={`control-btn ${transition === 'fade' ? 'control-btn--active' : ''}`} onClick={() => setTransition('fade')}>Fade</button>
                <button className={`control-btn ${transition === 'wipeleft' ? 'control-btn--active' : ''}`} onClick={() => setTransition('wipeleft')}>Wipe</button>
                <button className={`control-btn ${transition === 'pixelize' ? 'control-btn--active' : ''}`} onClick={() => setTransition('pixelize')}>Pixelize</button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="control-group">
              <label className="control-label">Aspect Ratio</label>
              <div className="control-row">
                <button className={`control-btn ${aspectRatio === '16/9' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('16/9')}>16:9</button>
                <button className={`control-btn ${aspectRatio === '9/16' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('9/16')}>9:16</button>
                <button className={`control-btn ${aspectRatio === '1/1' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('1/1')}>1:1</button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="control-group">
              <label className="control-label">Filters</label>
              <div className="control-row">
                <button className={`control-btn ${filter === 'none' ? 'control-btn--active' : ''}`} onClick={() => setFilter('none')}>None</button>
                <button className={`control-btn ${filter === 'grayscale' ? 'control-btn--active' : ''}`} onClick={() => setFilter('grayscale')}>Grayscale</button>
                <button className={`control-btn ${filter === 'vibrant' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vibrant')}>Vibrant</button>
                <button className={`control-btn ${filter === 'vintage' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vintage')}>Vintage</button>
              </div>
            </div>
            
            {/* Adjustments */}
            <div className="control-group">
              <label className="control-label">Adjustments</label>
              <div className="control-row">
                <span className="timeline-label" style={{width: '100%'}}>Brightness ({brightness}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} />
                
                <span className="timeline-label" style={{width: '100%', marginTop: '6px'}}>Contrast ({contrast}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={contrast} onChange={e => setContrast(e.target.value)} />
                
                <span className="timeline-label" style={{width: '100%', marginTop: '6px'}}>Saturation ({saturation}%)</span>
                <input type="range" className="control-slider" min="0" max="200" value={saturation} onChange={e => setSaturation(e.target.value)} />
                
                <span className="timeline-label" style={{width: '100%', marginTop: '6px'}}>Blur ({blur}px)</span>
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
              <label className="control-label">Audio &amp; Text</label>
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
                    padding: '8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--gray-dim)',
                    color: 'white',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8rem',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
