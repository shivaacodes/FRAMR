import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Result from './pages/Result';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import EngineDocs from './pages/EngineDocs';
import PipelineHeader from './components/PipelineHeader';
import CyberClubVisualizer from './components/CyberClubVisualizer';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <div className="app-shell">
        {/* ── REAL CYBERPUNK CLUB LIGHTING & DYNAMIC DOTTED OBJECTS ── */}
        <CyberClubVisualizer />

        {/* ── 3D CYBERPUNK GRID & SCANLINES ── */}
        <div className="cyber-3d-grid" />
        <div className="cyber-scanlines" />

        {/* ── CYBER PIPELINE HUD ── */}
        <PipelineHeader />

        {/* ── MAIN CONTENT AREA ── */}
        <main style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10}}>
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

        {/* ── FOOTER ── */}
        <footer className="app-footer" style={{position: 'relative', zIndex: 10}}>
          <span>FRAMR © 2026</span>
          <span className="footer-sep">·</span>
          <span>Automated AI Highlight Extraction Engine</span>
        </footer>
      </div>
    </AudioProvider>
  );
}
