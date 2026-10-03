/**
 * CluePhoto: the CCTV still a player receives about the killer.
 *
 * `fact = { trait, group }` picks one of 25 scenes, one per trait group in
 * src/data/traits.js (the list is CLUE_SCENES in ./clueScenes.js). Each scene
 * is 64x48 pixels, painted once and cached; then the surveillance treatment
 * goes on top: a green or blue tint, seeded grain, scanlines, a dithered
 * vignette, corner brackets, the cam label, the timestamp and a blinking REC.
 *
 * Nothing is random at render time. `seed` (any string, e.g. the clue id)
 * drives the grain, the tint and the default cam/stamp, so a photo looks the
 * same on every phone and on every re-render.
 *
 * The scenes show the GROUP, not a raw answer: "a dark top" is a torso in a
 * dark shirt, "a birthday in the cold months" is a calendar with Oct-Mar
 * marked. Keep new scenes to that rule, or a photo says more than its clue.
 */
import { pathEls } from './pixels.js';
import { photoFor, W, H } from './clueStill.js';

const CSS = `
.cp-rec{animation:cp-blink 1.2s steps(1) infinite}
@keyframes cp-blink{0%{opacity:1}55%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.cp-rec{animation:none}}
`;

export default function CluePhoto({ fact, seed = '', cam, stamp: when, className, style }) {
  const trait = fact?.trait ?? '';
  const group = fact?.group ?? '';
  const photo = photoFor(trait, group, String(seed), cam, when);
  // A security-camera still: soft, a little grainy, with scan lines and a dark rim.
  // The scene is drawn on a coarse grid; the blur is what keeps it from reading as pixel art.
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', background: '#050E24', ...style }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={photo.label}
        style={{ display: 'block', aspectRatio: '4 / 3', height: 'auto', filter: 'blur(0.8px) saturate(0.85) contrast(1.06)' }}
      >
        <style>{CSS}</style>
        {pathEls(photo.img, 'i')}
        {pathEls(photo.fx, 'f')}
        <g transform="scale(0.5)">
          {pathEls(photo.hud, 'h')}
          <g className="cp-rec">{pathEls(photo.rec, 'r')}</g>
        </g>
      </svg>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px), radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  );
}
