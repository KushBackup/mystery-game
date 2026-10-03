/**
 * ClueClip: a few seconds of CCTV footage about the killer.
 *
 * It is the still (clueStill.js) set moving, never a new picture: the camera
 * sweeps the scene, holds, then zooms in on the detail that is the clue, and
 * cuts back to the start through a burst of static. The timestamp ticks and
 * REC blinks. So a clip says exactly what the still says, no more.
 *
 * Cheap on purpose (a mid-range Android paints a photo in ~100 ms): the scene
 * is painted once, cached by photoFor, and the motion is CSS transforms on
 * that one layer, stepped so it reads as low-frame-rate footage. Nothing is
 * repainted per frame. Tap to pause. Under reduced motion it is the still.
 */
import React, { useState } from 'react';
import { pathEls, textD, textWidth } from './pixels.js';
import { photoFor, W, H } from './clueStill.js';
import { CLIP_SECONDS } from '../evidence.js';

// Where the camera zooms, per trait, in scene pixels: the detail that is the clue.
const FOCUS = {
  top: [52, 19],
  glasses: [32, 23],
  shoes: [36, 26],
  drink: [31, 27],
  season: [32, 22],
  siblings: [32, 25],
};

const CSS = `
.cc-cam{transform-box:view-box;animation:cc-cam ${CLIP_SECONDS}s steps(14,end) infinite}
@keyframes cc-cam{
  0%{transform:translate(-4px,1px) scale(1.08)}
  38%{transform:translate(3px,0) scale(1.08)}
  52%{transform:translate(0,0) scale(1)}
  70%{transform:translate(0,0) scale(1.75)}
  94%{transform:translate(0,0) scale(1.75)}
  100%{transform:translate(-4px,1px) scale(1.08)}
}
.cc-sec{opacity:0;animation:cc-sec ${CLIP_SECONDS}s steps(1,end) infinite}
@keyframes cc-sec{0%{opacity:1}25%{opacity:0}100%{opacity:0}}
.cc-snow{opacity:0;animation:cc-snow ${CLIP_SECONDS}s steps(1,end) infinite}
@keyframes cc-snow{0%{opacity:.85}3%{opacity:0}93%{opacity:0}96%{opacity:.6}100%{opacity:.85}}
.cc-roll{animation:cc-roll 1.7s linear infinite}
@keyframes cc-roll{from{transform:translateY(-6px)}to{transform:translateY(${H + 6}px)}}
.cc-rec{animation:cc-blink 1.2s steps(1) infinite}
@keyframes cc-blink{0%{opacity:1}55%{opacity:0}100%{opacity:0}}
.cc-bar{transform-origin:left;animation:cc-bar ${CLIP_SECONDS}s linear infinite}
@keyframes cc-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.cc-paused .cc-cam,.cc-paused .cc-sec,.cc-paused .cc-snow,.cc-paused .cc-roll,.cc-paused .cc-rec,.cc-paused .cc-bar{animation-play-state:paused}
@media (prefers-reduced-motion: reduce){
  .cc-cam,.cc-sec,.cc-snow,.cc-roll,.cc-rec,.cc-bar{animation:none}
  .cc-sec.cc-sec1{opacity:1}
}
`;

// Static: one seeded speckle pattern, drawn once as a single path.
const snowCache = new Map();
function snowD(seed) {
  if (!snowCache.has(seed)) {
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    let d = '';
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        h = (Math.imul(h ^ (h >>> 15), 2246822519) + 1) >>> 0;
        if (h % 3 === 0) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    snowCache.set(seed, d);
  }
  return snowCache.get(seed);
}

export default function ClueClip({ fact, seed = '', cam, stamp: when, className, style }) {
  const trait = fact?.trait ?? '';
  const group = fact?.group ?? '';
  const [paused, setPaused] = useState(false);
  const photo = photoFor(trait, group, String(seed), cam, when);
  const [fx, fy] = FOCUS[trait] ?? [W / 2, H / 2];
  // The seconds tick after the HUD's timestamp, in the HUD's half-size font.
  const secX = 6 + textWidth(photo.stamp) + 2;
  const secY = H * 2 - 10;

  return (
    <div className={`${className ?? ''} ${paused ? 'cc-paused' : ''}`} style={{ position: 'relative', overflow: 'hidden', background: '#050E24', ...style }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={`CCTV footage, ${CLIP_SECONDS} seconds. ${photo.label}`}
        onClick={() => setPaused((p) => !p)}
        style={{ display: 'block', aspectRatio: '4 / 3', height: 'auto', filter: 'blur(0.8px) saturate(0.85) contrast(1.06)', cursor: 'pointer' }}
      >
        <style>{CSS}</style>
        <g className="cc-cam" style={{ transformOrigin: `${fx}px ${fy}px` }}>{pathEls(photo.img, 'i')}</g>
        {pathEls(photo.fx, 'f')}
        <rect className="cc-roll" x="0" y="0" width={W} height="2" fill="#ffffff" opacity="0.08" />
        <path className="cc-snow" d={snowD(String(seed))} fill="#EAF3FF" />
        <g transform="scale(0.5)">
          {pathEls(photo.hud, 'h')}
          <g className="cc-rec">{pathEls(photo.rec, 'r')}</g>
          {[1, 2, 3, 4].map((s, i) => (
            <path key={s} className={`cc-sec ${i === 0 ? 'cc-sec1' : ''}`} style={{ animationDelay: `${i}s` }} d={textD(`:0${s}`, secX, secY)} fill="#EAF3FF" />
          ))}
        </g>
      </svg>
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(0,0,0,0.5)' }}>
        <div className="cc-bar" style={{ height: '100%', background: '#FF3B30' }} />
      </div>
      {paused && (
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#EAF3FF', fontSize: 34, textShadow: '0 1px 4px #000', pointerEvents: 'none' }}>▶</span>
      )}
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
