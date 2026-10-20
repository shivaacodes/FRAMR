import { useEffect, useRef, memo } from 'react';

/**
 * ThermalMorphBackground
 * Fluid, morphing abstract chromatic ribbons inspired by thermal/aura art posters.
 * Uses HTML5 Canvas + Web Audio API beat sync + SVG film grain texture overlay.
 */
function ThermalMorphBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001; // in seconds

      // Read Web Audio beat values from CSS custom properties set by AudioContext
      const bassVal = parseFloat(document.documentElement.style.getPropertyValue('--audio-bass') || '0.2');
      const energyVal = parseFloat(document.documentElement.style.getPropertyValue('--audio-energy') || '0.25');
      const flashVal = parseFloat(document.documentElement.style.getPropertyValue('--audio-flash') || '0.25');

      // Smooth pulse multiplier: expands ribbons and boosts saturation on beats
      const beatPulse = 1.0 + bassVal * 0.45;
      const glowIntensity = Math.min(1.0, 0.45 + flashVal * 0.55);

      ctx.clearRect(0, 0, width, height);

      // Deep dark base with subtle warm ambient tint
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // ─── SHAPE 1: Large Sweeping Thermal S-Curve Ribbon (Reference Image 1) ───
      // Multi-layer concentric chromatic bands: Indigo -> Fiery Orange -> Golden Amber -> Cyan
      const t1 = elapsed * 0.35;
      const startX = width * 0.05 + Math.sin(t1 * 0.8) * 60;
      const startY = height * 0.15 + Math.cos(t1 * 0.6) * 50;

      const cp1x = width * 0.35 + Math.sin(t1 * 1.1) * 110;
      const cp1y = height * 0.05 + Math.cos(t1 * 0.9) * 80;

      const cp2x = width * 0.65 + Math.cos(t1 * 0.7) * 120;
      const cp2y = height * 0.55 + Math.sin(t1 * 1.2) * 90;

      const endX = width * 0.95 + Math.sin(t1 * 0.9) * 70;
      const endY = height * 0.75 + Math.cos(t1 * 0.8) * 80;

      const drawSpline = (offsetX, offsetY, strokeWidth, color, blur) => {
        ctx.beginPath();
        ctx.moveTo(startX + offsetX, startY + offsetY);
        ctx.bezierCurveTo(
          cp1x + offsetX,
          cp1y + offsetY,
          cp2x + offsetX,
          cp2y + offsetY,
          endX + offsetX,
          endY + offsetY
        );
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth * beatPulse;
        ctx.lineCap = 'round';
        ctx.stroke();
      };

      // Outer Indigo Glow
      drawSpline(0, 0, 160, `rgba(79, 70, 229, ${0.28 * glowIntensity})`, 80);
      // Fiery Hot Orange / Coral (Image 1 dominant rim)
      drawSpline(15, -10, 95, `rgba(255, 87, 34, ${0.45 * glowIntensity})`, 55);
      // Molten Amber / Gold band
      drawSpline(28, -20, 50, `rgba(250, 204, 21, ${0.65 * glowIntensity})`, 40);
      // Electric Aqua / Cyan core highlight
      drawSpline(38, -28, 22, `rgba(34, 211, 238, ${0.85 * glowIntensity})`, 25);
      // Ice White-Mint peak core
      drawSpline(42, -32, 7, `rgba(224, 254, 255, ${0.95 * glowIntensity})`, 15);

      // ─── SHAPE 2: Fluid Swirling Loop / Vortex in Lower Left (Reference Image 2) ───
      const t2 = elapsed * 0.28;
      const vX = width * 0.28 + Math.cos(t2 * 0.7) * 70;
      const vY = height * 0.72 + Math.sin(t2 * 0.9) * 60;
      const vRadius = (Math.min(width, height) * 0.22) * beatPulse;

      const vortexGrad = ctx.createRadialGradient(
        vX - vRadius * 0.2, vY - vRadius * 0.2, vRadius * 0.05,
        vX, vY, vRadius * 1.5
      );
      vortexGrad.addColorStop(0.0, `rgba(224, 254, 255, ${0.9 * glowIntensity})`);
      vortexGrad.addColorStop(0.18, `rgba(34, 211, 238, ${0.75 * glowIntensity})`);
      vortexGrad.addColorStop(0.42, `rgba(250, 204, 21, ${0.6 * glowIntensity})`);
      vortexGrad.addColorStop(0.68, `rgba(255, 69, 0, ${0.45 * glowIntensity})`);
      vortexGrad.addColorStop(0.88, `rgba(99, 102, 241, ${0.25 * glowIntensity})`);
      vortexGrad.addColorStop(1.0, 'transparent');

      ctx.save();
      ctx.translate(vX, vY);
      ctx.rotate(t2 * 0.4);
      ctx.scale(1.3, 0.75); // morphed oval
      ctx.beginPath();
      ctx.arc(0, 0, vRadius, 0, Math.PI * 2);
      ctx.fillStyle = vortexGrad;
      ctx.shadowColor = 'rgba(255, 87, 34, 0.4)';
      ctx.shadowBlur = 60;
      ctx.fill();
      ctx.restore();

      // ─── SHAPE 3: Counter-curving Fluid Ribbon in Top Right ───
      const t3 = elapsed * 0.32;
      const s3X = width * 0.55 + Math.cos(t3 * 0.6) * 80;
      const s3Y = height * 0.85 + Math.sin(t3 * 0.8) * 70;
      const e3X = width * 0.98 + Math.sin(t3 * 0.5) * 50;
      const e3Y = height * 0.12 + Math.cos(t3 * 0.7) * 60;

      ctx.beginPath();
      ctx.moveTo(s3X, s3Y);
      ctx.bezierCurveTo(
        width * 0.8 + Math.sin(t3) * 60, height * 0.7,
        width * 0.7 + Math.cos(t3) * 70, height * 0.3,
        e3X, e3Y
      );
      ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
      ctx.shadowBlur = 50;
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * glowIntensity})`;
      ctx.lineWidth = 60 * beatPulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s3X + 15, s3Y - 10);
      ctx.bezierCurveTo(
        width * 0.8 + Math.sin(t3) * 60 + 15, height * 0.7 - 10,
        width * 0.7 + Math.cos(t3) * 70 + 15, height * 0.3 - 10,
        e3X + 15, e3Y - 10
      );
      ctx.strokeStyle = `rgba(255, 87, 34, ${0.5 * glowIntensity})`;
      ctx.lineWidth = 35 * beatPulse;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="thermal-bg-viewport"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* 60fps Morphing Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: 'blur(22px)',
          opacity: 0.95,
          transform: 'scale(1.05)',
        }}
      />

      {/* Film Grain & Risograph Texture Overlay (Exactly matching reference images) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      >
        <filter id="thermalGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#thermalGrain)" />
      </svg>
    </div>
  );
}

export default memo(ThermalMorphBackground);
