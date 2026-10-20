import { useState, useRef, useEffect } from 'react';

export default function InstagramReel({ 
  videoSrc, 
  caption = "AI generated highlight reel. Extracted with multi-modal CV & audio energy. #FRAMR #AI #Reels #Highlight",
  soundtrackName = "Cyber Beat · Original Audio",
  username = "framr.ai",
  initialLikes = 28420,
  initialComments = 412,
  onExport,
  isExporting = false
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 50, y: 50 });
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([
    { id: 1, user: 'sarah_films', text: 'The cut at 0:04 is seamless.', time: '2h', likes: 45 },
    { id: 2, user: 'alex_creator', text: 'Which model did you use for the motion extraction?', time: '4h', likes: 18 },
    { id: 3, user: 'pro_editor', text: 'The beat sync on this transition is butter clean.', time: '6h', likes: 89 },
    { id: 4, user: 'tech_insider', text: 'Automated video highlighting done right!', time: '1d', likes: 12 }
  ]);
  const [newComment, setNewComment] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  // Sync play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Double tap to like with pop heart
  const handleVideoClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap!
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHeartPos({ x, y });
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    } else {
      // Single tap -> toggle play
      togglePlay();
    }
    lastTapRef.current = now;
  };

  // Like button click
  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  // Share click
  const handleShareClick = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  // Add comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList(prev => [
      { id: Date.now(), user: 'you', text: newComment.trim(), time: 'Just now', likes: 0 },
      ...prev
    ]);
    setNewComment('');
  };

  // Progress update
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      
      {/* Smartphone Mockup Frame */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: 'clamp(580px, 80vh, 740px)',
          background: '#000',
          borderRadius: 'clamp(32px, 6vw, 48px)',
          border: 'clamp(6px, 1.8vw, 12px) solid #201a24',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          userSelect: 'none',
          margin: '0 auto'
        }}
      >
        {/* Dynamic Island / Notch */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '110px',
          height: '26px',
          background: '#000',
          borderRadius: '20px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#111' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#151525', border: '1px solid #252535' }} />
        </div>

        {/* Status Bar */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '28px',
          right: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 90,
          color: '#fff',
          fontSize: '0.75rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 600
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Cellular */}
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
              <rect x="0" y="7" width="2" height="3" rx="0.5" />
              <rect x="3.5" y="5" width="2" height="5" rx="0.5" />
              <rect x="7" y="3" width="2" height="7" rx="0.5" />
              <rect x="10.5" y="0" width="2" height="10" rx="0.5" />
            </svg>
            {/* Wifi */}
            <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM2.5 5.5A7.8 7.8 0 018 3.5c2.1 0 4.1.8 5.5 2.1l1.4-1.4A9.8 9.8 0 008 1.5a9.8 9.8 0 00-6.9 2.7l1.4 1.3z" />
            </svg>
            {/* Battery */}
            <div style={{ width: '20px', height: '10px', border: '1px solid #fff', borderRadius: '3px', padding: '1px', display: 'flex' }}>
              <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '1px' }} />
            </div>
          </div>
        </div>

        {/* Top Reels Header */}
        <div style={{
          position: 'absolute',
          top: '46px',
          left: '18px',
          right: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 80,
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px', fontFamily: '-apple-system, sans-serif' }}>
              Reels
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Camera icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {/* Mute toggle button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isMuted ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div 
          onClick={handleVideoClick}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div style={{
              position: 'absolute',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              animation: 'popIn 0.15s ease'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Floating Double Tap Heart Animation */}
          {showHeartAnim && (
            <div style={{
              position: 'absolute',
              left: `${heartPos.x}%`,
              top: `${heartPos.y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              animation: 'instaHeartFloat 0.8s ease-out forwards',
              zIndex: 150
            }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#ff2742" stroke="#fff" strokeWidth="1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right Action Sidebar */}
        <div style={{
          position: 'absolute',
          right: '12px',
          bottom: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 80,
          color: '#fff'
        }}>
          {/* Like Heart */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <button
              onClick={handleLikeClick}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isLiked ? '#ff2742' : '#fff',
                padding: '4px',
                transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isLiked ? 'scale(1.15)' : 'scale(1)'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={isLiked ? '#ff2742' : 'none'} stroke={isLiked ? '#ff2742' : '#fff'} strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {formatCount(likesCount)}
            </span>
          </div>

          {/* Comment Bubble */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {commentsList.length}
            </span>
          </div>

          {/* Share Airplane */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <button
              onClick={handleShareClick}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              Share
            </span>
          </div>

          {/* Bookmark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          {/* Spinning Audio Album Record */}
          <div style={{ marginTop: '6px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1a1a1a',
              border: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isPlaying ? 'spinDisc 3s linear infinite' : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
              }} />
            </div>
          </div>
        </div>

        {/* Bottom Left Info / Account / Caption */}
        <div style={{
          position: 'absolute',
          left: '14px',
          bottom: '22px',
          right: '70px',
          zIndex: 80,
          color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)'
        }}>
          {/* User Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {/* Story Gradient Avatar */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              padding: '2px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              flexShrink: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#120c17',
                border: '1.5px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: 'var(--yellow)'
              }}>
                F
              </div>
            </div>

            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{username}</span>

            {/* Verified badge */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3897f0">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.1-4.1 1.4-1.4 2.7 2.7 7.4-7.4 1.4 1.4-8.8 8.8z" />
            </svg>

            {/* Follow button */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              style={{
                background: isFollowing ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: isFollowing ? 'none' : '1px solid rgba(255,255,255,0.7)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Caption */}
          <div style={{
            fontSize: '0.78rem',
            lineHeight: '1.35',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {caption}
          </div>

          {/* Audio Ticker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '3px 8px',
            borderRadius: '12px',
            width: 'fit-content',
            maxWidth: '220px',
            overflow: 'hidden'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              animation: isPlaying ? 'marquee 8s linear infinite' : 'none'
            }}>
              {soundtrackName}
            </div>
          </div>
        </div>

        {/* Bottom Playback Scrubber Line */}
        <div style={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          right: '0px',
          height: '3px',
          background: 'rgba(255,255,255,0.2)',
          zIndex: 90
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#fff',
            transition: 'width 0.1s linear'
          }} />
        </div>

        {/* Sliding Comments Drawer */}
        {showComments && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              background: '#1a1420',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              height: '65%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.8)',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Drawer Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #2d2435',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ width: '40px', height: '4px', background: '#444', borderRadius: '2px', position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginTop: '6px' }}>Comments</span>
                <button
                  onClick={() => setShowComments(false)}
                  style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Comments List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {commentsList.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--magenta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#fff',
                      flexShrink: 0,
                      fontSize: '0.7rem'
                    }}>
                      {c.user[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#fff', marginRight: '6px' }}>{c.user}</span>
                        <span style={{ color: '#ddd' }}>{c.text}</span>
                      </div>
                      <div style={{ color: '#888', fontSize: '0.68rem', marginTop: '4px', display: 'flex', gap: '10px' }}>
                        <span>{c.time}</span>
                        <span style={{ cursor: 'pointer' }}>Reply</span>
                      </div>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>♡</span>
                      <span>{c.likes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Comment Input */}
              <form onSubmit={handleAddComment} style={{ padding: '10px 14px', borderTop: '1px solid #2d2435', display: 'flex', gap: '8px', background: '#120c17' }}>
                <input
                  type="text"
                  placeholder="Add a comment for @framr.ai..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#23182b',
                    border: '1px solid #3d2a4a',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    color: '#fff',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--yellow)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Share Toast Notification */}
        {showShareToast && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 20, 35, 0.95)',
            border: '1px solid var(--lime)',
            color: 'var(--white)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            zIndex: 250,
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            animation: 'fadeIn 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🔗</span> Reel Link Copied to Clipboard!
          </div>
        )}
      </div>

      {/* Reel Control & Export Action Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="btn-download"
          style={{
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            color: '#fff',
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(220, 39, 67, 0.4)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span>📸</span>
          {isExporting ? 'Exporting 9:16 Reel...' : 'Export Final Instagram Reel (9:16 MP4)'}
        </button>

        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play();
              setIsPlaying(true);
            }
          }}
          className="btn-secondary"
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <span>🔄</span> Replay Reel
        </button>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes spinDisc {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes instaHeartFloat {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          70% { transform: translate(-50%, -60%) scale(1.1); opacity: 0.9; }
          100% { transform: translate(-50%, -90%) scale(1.4); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
