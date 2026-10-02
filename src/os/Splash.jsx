import React, { useEffect, useRef, useState } from 'react';
import { SPLASH } from '../data/killersCopy';
import { packFor } from '../data/packs/index.js';
import { prefersLessMotion } from './nav';
import { FILM } from './splashFilm';

/**
 * The opening, played once per device the first time a guest opens the page
 * (PlayerApp.jsx): the hand-drawn title film on white (an ink drop, the Astral
 * Project sticker in a ring tunnel, a vine growing the Greenr sticker, then a
 * crime scene for "The Deep Blue Case") and the intro (a guest walks a night
 * street on her phone, loses the morning game, and is taken; the camera goes
 * into her phone). It ends white and lifts onto Setup. The page connects
 * underneath while it plays.
 *
 * The films are splash-film/splash.html and intro.html, joined and rendered
 * to public/splash/deal.mp4 (splash-film/README.md). Muted, so it can start
 * without a tap. With reduced motion, or where the browser refuses to play it
 * (iOS Low Power Mode), it shows one still per beat instead. If it can't load
 * at all, it gets out of the way.
 */

/** One still per beat, in seconds into the video: [from, show]. The intro starts at 9.17. */
const STILLS = [[0, 2.3], [3.15, 4.9], [5.95, 8.3], [9.17, 10.7], [15.57, 17.07], [17.47, 19.77]];
/** The video's length, in case the browser can't say. */
const LENGTH_S = 21.17;
/** How long the white takes to lift once the video is done. */
export const SPLASH_LIFT_MS = 700;
/** A video that hasn't started by now is not going to: skip it. */
const STALL_MS = 10_000;

export default function Splash({ onDone }) {
  const video = useRef(null);
  const [still, setStill] = useState(prefersLessMotion);
  const [lift, setLift] = useState(false);

  // Lifting, then gone: the lift is a timer plus a CSS transition, never an
  // animation delay (App.css's reduced-motion rule zeroes every delay).
  useEffect(() => {
    if (!lift) return undefined;
    const id = setTimeout(onDone, SPLASH_LIFT_MS);
    return () => clearTimeout(id);
  }, [lift, onDone]);

  useEffect(() => {
    const v = video.current;
    if (!v) return undefined;
    v.muted = true;
    const done = () => setLift(true);
    const stall = setTimeout(() => { if (v.readyState < 2) done(); }, STALL_MS);
    if (!still) {
      v.addEventListener('ended', done);
      v.play().catch(() => setStill(true));
      return () => { clearTimeout(stall); v.removeEventListener('ended', done); };
    }
    // Stills: the clock starts when the video can show a frame.
    let t0 = null;
    const tick = () => {
      if (v.readyState < 1) return;
      if (t0 === null) t0 = performance.now();
      const t = (performance.now() - t0) / 1000;
      if (t >= (Number.isFinite(v.duration) ? v.duration : LENGTH_S)) { done(); return; }
      const show = [...STILLS].reverse().find(([from]) => t >= from)[1];
      if (Math.abs(v.currentTime - show) > 0.01) v.currentTime = show;
    };
    const id = setInterval(tick, 200);
    tick();
    return () => { clearTimeout(stall); clearInterval(id); };
  }, [still]);

  const label = [...SPLASH.map((card) => card.map((l) => l.big ?? l.small).join(' ')), packFor().caseTitle].join('. ');
  return (
    <div className={`os-splash ${lift ? 'os-splash--lift' : ''}`} style={{ '--lift': `${SPLASH_LIFT_MS}ms` }} role="img" aria-label={label}>
      <video
        ref={video}
        className="os-splash__film"
        src={FILM}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        onError={() => setLift(true)}
      />
    </div>
  );
}
