import { useState } from 'react';
import { API_BASE } from '../config';

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
        body: JSON.stringify({ rating, feedback: feedbackText, sensitivity })
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

  const activeRating = hoverRating || rating;
  const sensitivityLabel = sensitivity < 1.0
    ? 'Conservative (Action Only)'
    : sensitivity === 1.0 ? 'Balanced Fusion' : 'Hyper (All Transients)';

  return (
    <div className="render-card" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Tag */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        background: 'var(--render-purple-glow)',
        border: '1px solid var(--render-border-hover)',
        borderTop: 'none',
        borderRight: 'none',
        padding: '3px 12px',
        borderBottomLeftRadius: '6px',
        fontSize: '0.64rem',
        fontWeight: 600,
        color: 'var(--render-purple-accent)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
      }}>
        CALIBRATION &amp; TELEMETRY
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--render-purple-light)' }} />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          margin: 0
        }}>
          Extraction Quality &amp; Feedback Loop
        </h3>
      </div>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        marginBottom: '20px',
        lineHeight: 1.55,
        fontFamily: 'var(--font-ui)'
      }}>
        Calibrate the multi-modal excitation weights. Your feedback adjusts optical flow sensitivity thresholds and transient audio gating.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Star Rating */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            1. Highlight Cut Accuracy ({rating} / 5)
          </label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                  color: activeRating >= star ? 'var(--render-amber)' : 'var(--text-dim)',
                  transition: 'transform 0.1s, color 0.1s',
                  transform: activeRating >= star ? 'scale(1.12)' : 'scale(1)',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {activeRating >= star ? '★' : '☆'}
              </button>
            ))}
            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              marginLeft: '10px',
              color: rating >= 4 ? 'var(--render-emerald)' : rating === 3 ? 'var(--render-amber)' : 'var(--render-rose)',
              fontWeight: 600
            }}>
              {rating === 5 ? 'Optimal' : rating >= 3 ? 'Acceptable' : 'Needs Retuning'}
            </span>
          </div>
        </div>

        {/* Sensitivity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              2. Detection Sensitivity ({sensitivity.toFixed(1)}x)
            </label>
            <span style={{ fontSize: '0.7rem', color: 'var(--render-purple-accent)', fontFamily: 'var(--font-mono)' }}>
              {sensitivityLabel}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--render-purple)', cursor: 'pointer' }}
          />
        </div>

        {/* Text Notes */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '6px'
          }}>
            3. Observer Notes &amp; Retuning Guidance
          </label>
          <input
            type="text"
            placeholder="e.g. Clean scene-cut boundary at 0:08, audio energy ducked smoothly..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--render-surface)',
              border: '1px solid var(--render-border)',
              borderRadius: '5px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
              fontFamily: 'var(--font-ui)',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--render-purple-light)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--render-border)'; }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-render-primary"
            style={{
              padding: '9px 20px',
              fontSize: '0.78rem',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              {submitted
                ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                : <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              }
            </svg>
            <span>{submitted ? 'Calibration Saved' : 'Save Calibration'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTelemetry}
            disabled={isDownloadingReport}
            className="btn-render-outline"
            style={{
              padding: '8px 16px',
              fontSize: '0.74rem',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            <span>{isDownloadingReport ? 'Extracting...' : 'Download Telemetry (JSON)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
