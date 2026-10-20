import { Routes, Route, useNavigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Result from './pages/Result';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import EngineDocs from './pages/EngineDocs';
import PipelineHeader from './components/PipelineHeader';
import ThermalMorphBackground from './components/ThermalMorphBackground';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  const navigate = useNavigate();

  return (
    <AudioProvider>
      <div className="app-shell">
        {/* Subtle background matrix grid */}
        <div className="cyber-3d-grid" />

        {/* Morphing & Pulsing Thermal Aura Fluid Shapes (Beat-Synced) */}
        <ThermalMorphBackground />

        {/* Top Announcement Banner with Thermal Aura Gradient */}
        <div style={{
          background: 'linear-gradient(90deg, #0d0705 0%, #1f0c05 35%, #180907 70%, #080305 100%)',
          borderBottom: '1px solid rgba(255, 87, 34, 0.35)',
          padding: '8px 20px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          position: 'relative',
          zIndex: 600,
          fontFamily: 'var(--font-ui)',
        }}>
          <span style={{
            background: 'linear-gradient(90deg, #22d3ee 0%, #facc15 45%, #ff5722 80%, #ff3b30 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600
          }}>
            Migrating highlight pipelines to automated CV extraction?
          </span>
          <button
            onClick={() => navigate('/engine')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: 0
            }}
          >
            Zero-GPU OpenCV 4.x engine now live. Explore specs →
          </button>
        </div>

        {/* Pipeline Navigation */}
        <PipelineHeader />

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/ingest" element={<Home />} />
            <Route path="/processing/:id" element={<Processing />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/reel/:id" element={<Result />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/engine" element={<EngineDocs />} />
          </Routes>
        </main>

        {/* Render Minimalist Footer */}
        <footer style={{
          padding: '24px 32px',
          borderTop: '1px solid var(--render-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-ui)',
          position: 'relative',
          zIndex: 10,
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>FRAMR CLOUD</span>
            <span>·</span>
            <span>Autonomous Highlight Extraction &amp; Vertical Reel Studio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
            <span style={{ color: 'var(--render-emerald)' }}>● All Engines Operational</span>
            <span>OpenCV 4.x Subsampled 5 FPS</span>
          </div>
        </footer>
      </div>
    </AudioProvider>
  );
}
