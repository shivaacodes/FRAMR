import { useState } from 'react';

const API_BASE = 'http://localhost:8000';

export default function FeedbackLoop({ videoId, initialRating = 5, initialSensitivity = 1.0 }) {
  const [rating, setRating] = useState(initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [sensitivity, setSensitivity] = useState(initialSensitivity || 1.0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback: feedbackText,
          sensitivity
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTelemetry = async () => {
    setIsDownloadingReport(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}/telemetry`);
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `framr_telemetry_job_${videoId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve telemetry report');
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(16, 12, 26, 0.9)',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(0, 240, 255, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Cyber Accent Tag */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        background: 'linear-gradient(90deg, #00f0ff, #ff007f)',
        padding: '2px 14px',
        borderBottomLeftRadius: '8px',
        fontSize: '0.65rem',
        fontWeight: 800,
        color: '#000',
        fontFamily: 'var(--font-mono)'
      }}>
        NEURAL_FEEDBACK_LOOP
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚡</span>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          color: '#fff',
          letterSpacing: '1px',
          margin: 0
        }}>
          AI EXTRACTION QUALITY &amp; CALIBRATION
        </h3>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#8082a6', marginBottom: '16px', lineHeight: '1.4' }}>
        Train and calibrate the multi-modal excitation weights. Your feedback continuously adjusts optical flow sensitivity and transient audio gating.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Rating Stars */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: '#00f0ff',
            marginBottom: '6px'
          }}>
            1. HIGHLIGHT CUT ACCURACY ({rating} / 5 STARS)
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  color: (hoverRating || rating) >= star ? '#ffe600' : '#443755',
                  transition: 'transform 0.1s',
                  transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                  padding: 0
                }}
              >
                ★
              </button>
            ))}
            <span style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: rating >= 4 ? '#39ff14' : (rating === 3 ? '#ffe600' : '#ff007f'),
              marginLeft: '8px'
            }}>
              {rating === 5 ? 'OPTIMAL PEAKS' : (rating >= 3 ? 'ACCEPTABLE TIMING' : 'NEEDS RE-TUNING')}
            </span>
          </div>
        </div>

        {/* Sensitivity Calibration Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>
              2. DETECTION SENSITIVITY BIAS ({sensitivity.toFixed(1)}x)
            </label>
            <span style={{ fontSize: '0.68rem', color: '#ff007f', fontFamily: 'var(--font-mono)' }}>
              {sensitivity < 1.0 ? 'CONSERVATIVE (ACTION ONLY)' : (sensitivity === 1.0 ? 'BALANCED FUSION' : 'HYPER (ALL TRANSIENTS)')}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#00f0ff',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Text Feedback */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#00f0ff', marginBottom: '6px' }}>
            3. OBSERVER NOTES / RESEARCH FEEDBACK
          </label>
          <input
            type="text"
            placeholder="e.g. Excellent scene-cut alignment at 0:08, audio energy ducked smoothly..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#0c0814',
              border: '1px solid #3a2942',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.78rem',
              outline: 'none',
              fontFamily: 'var(--font-ui)'
            }}
          />
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: submitted 
                ? '#39ff14' 
                : 'linear-gradient(90deg, #00f0ff, #0088ff)',
              color: '#000',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
            }}
          >
            <span>{submitted ? '✓' : '🚀'}</span>
            {submitted ? 'FEEDBACK LOGGED TO MODEL' : 'SUBMIT NEURAL FEEDBACK'}
          </button>

          <button
            type="button"
            onClick={handleDownloadTelemetry}
            disabled={isDownloadingReport}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 0, 127, 0.5)',
              color: '#ff007f',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              padding: '7px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📊</span>
            {isDownloadingReport ? 'EXTRACTING...' : 'DOWNLOAD CV TELEMETRY (JSON)'}
          </button>
        </div>
      </form>
    </div>
  );
}
