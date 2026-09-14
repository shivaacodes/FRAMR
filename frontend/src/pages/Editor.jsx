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

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/videos/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'COMPLETED') setVideoData(d);
      })
      .catch(e => console.error(e));
  }, [id]);

  // Smooth seeker animation
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
    return <div style={{padding: 40, textAlign: 'center'}}>Loading editor...</div>;
  }

  const highlightUrl = `${API_BASE}/highlights/${videoData.highlight_path}`;

  // Build the CSS filter string
  let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) `;
  if (filter === 'grayscale') filterStr += 'grayscale(100%) ';
  if (filter === 'vibrant') filterStr += 'saturate(200%) contrast(120%) ';
  if (filter === 'vintage') filterStr += 'sepia(60%) contrast(90%) hue-rotate(-15deg) ';

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
          is_muted: isMuted,
          overlay_text: overlayText,
          clip_order: clips.map(c => c.originalIndex)
        })
      });
      const data = await res.json();
      
      if (data.export_url) {
        // Download the exported file
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
        <div className="editor-panel__header" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-dim)' }}>
          <h3 className="editor-panel__title" style={{ margin: 0 }}>
            <span className="editor-panel__dot"></span> EDIT STUDIO
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-danger" onClick={() => navigate(`/result/${id}`)} disabled={isExporting} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Cancel
            </button>
            <button className="btn-download" onClick={handleExport} disabled={isExporting} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              {isExporting ? 'Exporting...' : 'Export Changes'}
            </button>
          </div>
        </div>
        
        <div className="editor-panel__body" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="editor-main" style={{ height: '100%' }}>
            <div className="editor-video-container" style={{ flex: 1, background: '#000', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              
              <div style={{
                position: 'relative',
                aspectRatio: aspectRatio,
                width: aspectRatio === '9/16' ? 'auto' : '100%',
                height: aspectRatio === '9/16' ? '400px' : 'auto',
                maxHeight: '400px',
                overflow: 'hidden',
                border: '1px solid var(--gray-dim)'
              }}>
                <video
                  ref={videoRef}
                  src={highlightUrl}
                  controls={false} // Disable native controls to rely on timeline
                  muted={isMuted}
                  autoPlay
                  loop
                  onLoadedMetadata={handleLoadedMetadata}
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
                    color: 'white',
                    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                    pointerEvents: 'none',
                    textAlign: 'center'
                  }}>
                    {overlayText}
                  </div>
                )}
              </div>

            </div>
            
            <div className="editor-timeline">
              <div className="timeline-header">
                <span className="timeline-label">TIMELINE (Click to seek)</span>
                <span className="timeline-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div 
                className="timeline-track" 
                ref={trackRef} 
                onClick={handleTrackClick}
                style={{ cursor: 'pointer', display: 'flex', gap: '4px', overflow: 'hidden' }}
              >
                <div className="timeline-playhead" style={{ left: `${playheadPercent}%`, zIndex: 10 }}></div>
                
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
                      background: 'var(--gray-dim)',
                      opacity: index === currentClipIndex ? 1 : 0.4,
                      border: index === currentClipIndex ? '2px solid var(--lime)' : 'none',
                      borderRadius: '4px',
                      cursor: 'grab',
                      position: 'relative',
                      transition: 'opacity 0.2s, border 0.2s'
                    }}
                  >
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: index === currentClipIndex ? 'var(--lime)' : '#aaa', fontSize: '0.8rem' }}>
                      CLIP {clip.originalIndex + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="editor-controls">
            <div className="control-group">
              <label className="control-label">Aspect Ratio</label>
              <div className="control-row">
                <button className={`control-btn ${aspectRatio === '16/9' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('16/9')}>16:9</button>
                <button className={`control-btn ${aspectRatio === '9/16' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('9/16')}>9:16</button>
                <button className={`control-btn ${aspectRatio === '1/1' ? 'control-btn--active' : ''}`} onClick={() => setAspectRatio('1/1')}>1:1</button>
              </div>
            </div>
            
            <div className="control-group">
              <label className="control-label">Filters</label>
              <div className="control-row">
                <button className={`control-btn ${filter === 'none' ? 'control-btn--active' : ''}`} onClick={() => setFilter('none')}>None</button>
                <button className={`control-btn ${filter === 'grayscale' ? 'control-btn--active' : ''}`} onClick={() => setFilter('grayscale')}>Grayscale</button>
                <button className={`control-btn ${filter === 'vibrant' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vibrant')}>Vibrant</button>
                <button className={`control-btn ${filter === 'vintage' ? 'control-btn--active' : ''}`} onClick={() => setFilter('vintage')}>Vintage</button>
              </div>
            </div>
            
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

            <div className="control-group">
              <label className="control-label">Orientation</label>
              <div className="control-row">
                <button className={`control-btn ${flipH ? 'control-btn--active' : ''}`} onClick={() => setFlipH(!flipH)}>
                  Flip Horizontal
                </button>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Audio & Text</label>
              <div className="control-row">
                <button className={`control-btn ${isMuted ? 'control-btn--active' : ''}`} onClick={() => {
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}>
                  {isMuted ? 'Unmute Audio' : 'Mute Audio'}
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
                    background: 'var(--ink)',
                    border: '1px solid var(--gray-dim)',
                    color: 'white',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8rem'
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
