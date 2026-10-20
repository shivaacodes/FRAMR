import { memo } from 'react';

/**
 * StudioDiscoLights
 * Volumetric, swaying disco & studio spotlights that pulse and flare
 * in real-time synchronization with background audio beat transients.
 */
function StudioDiscoLights() {
  return (
    <div
      className="studio-disco-viewport"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Sound-reactive Ambient Studio Spotlights */}
      <div className="studio-light-orb studio-light-orb--cyan" />
      <div className="studio-light-orb studio-light-orb--violet" />
      <div className="studio-light-orb studio-light-orb--magenta" />
      <div className="studio-light-orb studio-light-orb--amber" />

      {/* Volumetric Swaying Stage Beams */}
      <div className="studio-stage-beam studio-stage-beam--left" />
      <div className="studio-stage-beam studio-stage-beam--center" />
      <div className="studio-stage-beam studio-stage-beam--right" />

      {/* Prismatic Studio Floor Glow */}
      <div className="studio-floor-reflection" />
    </div>
  );
}

export default memo(StudioDiscoLights);
