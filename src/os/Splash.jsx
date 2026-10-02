import React, { useEffect, useRef, useState } from 'react';
import { serverNow } from '../lib/clockSkew';
import { SPLASH_MS } from '../lib/engine/phases.js';
import { SPLASH } from '../data/killersCopy';
import { prefersLessMotion } from './nav';
import { filmSrc } from './splashFilm';

/**
 * What every phone plays at the deal, as one video: the hand-drawn title film
 * on white (an ink drop, the Astral Project sticker in a ring tunnel, a vine
 * growing the Greenr sticker, then a crime scene for "The Deep Blue Case"),
 * and the intro (a guest walks a night street on her phone, loses the morning
 * game, and is taken; "Who did this?"). It covers the whole phone, status bar
 * included, during the casting phase's held beat (`SPLASH_MS`, phases.js),
 * and fades on the role text as it arrives.
 *
 * The films are splash-film/splash.html and intro.html, joined and rendered
 * to public/splash/deal.mp4 (splash-film/README.md). Muted, so it can start
 * without a tap.
 *
 * Timed off the room's instant, not the mount: the video is sought to the
 * time already gone since the deal and nudged back if it drifts, so every
 * phone is on the same frame and one that reloads mid-way rejoins it. With
 * reduced motion, or where the browser refuses to play it (iOS Low Power
 * Mode), it shows one still per card instead.
 */

/** One still per beat, in seconds into the video: [from, show]. The intro starts at 9.17. */
const STILLS = [[0, 2.3], [3.15, 4.9], [5.95, 8.3], [9.17, 10.7], [15.57, 17.07], [17.47, 19.77], [20.07, 21.92]];
/** How long the white takes to lift once the film is done. */
export const SPLASH_LIFT_MS = 700;

export default function Splash({ game, pack }) {
  const video = useRef(null);
  const start = game.revealAt - SPLASH_MS;
  // The lift is a timer, not a CSS delay: the app's reduced-motion rule
  // (App.css) zeroes every animation delay, which would lift it at once.
  const [lift, setLift] = useState(() => serverNow() >= game.revealAt);
  useEffect(() => {
    const ms = game.revealAt - serverNow();
    if (ms <= 0) return undefined;
    const id = setTimeout(() => setLift(true), ms);
    return () => clearTimeout(id);
  }, [game.revealAt]);
  const [src] = useState(filmSrc);
  const [still, setStill] = useState(prefersLessMotion);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || failed) return undefined;
    v.muted = true;
    const at = () => Math.max(0, (serverNow() - start) / 1000);
    const sync = () => {
      if (v.readyState < 1) return;
      const end = Math.max(0, v.duration - 0.05);
      if (still) {
        const t = Math.min(end, [...STILLS].reverse().find(([from]) => at() >= from)[1]);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
        return;
      }
      const t = Math.min(end, at());
      if (Math.abs(v.currentTime - t) > 0.3) v.currentTime = t;
      if (v.paused && t < end) v.play().catch(() => setStill(true));
    };
    v.addEventListener('loadedmetadata', sync);
    sync();
    const id = setInterval(sync, still ? 200 : 1000);
    return () => {
      clearInterval(id);
      v.removeEventListener('loadedmetadata', sync);
    };
  }, [start, still, failed]);

  if (failed) return null;
  const label = [...SPLASH.map((card) => card.map((l) => l.big ?? l.small).join(' ')), pack.caseTitle ?? pack.title].join('. ');
  return (
    <div className={`os-splash ${lift ? 'os-splash--lift' : ''}`} style={{ '--lift': `${SPLASH_LIFT_MS}ms` }} role="img" aria-label={label}>
      <video
        ref={video}
        className="os-splash__film"
        src={src}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
