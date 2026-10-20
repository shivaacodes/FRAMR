import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Processing from './pages/Processing';
import Result from './pages/Result';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import EngineDocs from './pages/EngineDocs';
import PipelineHeader from './components/PipelineHeader';

/* --- Cursor Hook --- */
function useCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    
    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, .upload-zone, input, select, .timeline-track')) {
        ringRef.current?.classList.add('cursor-ring--hover');
      }
    };
    const handleMouseOut = (e) => {
      if (e.target.closest('button, a, .upload-zone, input, select, .timeline-track')) {
        ringRef.current?.classList.remove('cursor-ring--hover');
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);
  
  return { dotRef, ringRef, clicked };
}

export default function App() {
  const { dotRef, ringRef, clicked } = useCursor();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* ── CUSTOM CURSOR ── */}
      <div className="cursor-dot" ref={dotRef} />
      <div className={`cursor-ring ${clicked ? 'cursor-ring--click' : ''}`} ref={ringRef} />

      {/* ── 3D CYBERPUNK GRID & SCANLINES ── */}
      <div className="cyber-3d-grid" />
      <div className="cyber-scanlines" />

      {/* ── CYBER PIPELINE HUD ── */}
      <PipelineHeader />

      {/* ── MAIN CONTENT AREA ── */}
      <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/processing/:id" element={<Processing />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/reel/:id" element={<Result />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/engine" element={<EngineDocs />} />
        </Routes>
      </main>

      {/* ── FOOTER ── */}
      <footer className="app-footer">
        <span>FRAMR © 2026</span>
        <span className="footer-sep">·</span>
        <span>Automated AI Highlight Extraction Engine</span>
      </footer>
    </div>
  );
}
