import React, { useEffect, useRef, useState } from 'react';
import { useServerNow } from '../../hooks/useKillers';
import { prefersLessMotion } from '../nav';
import { sfxTap } from '../sfx';
import { Btn } from '../ui';

/**
 * The pager every morning-game tutorial is built on (WordTutorial.jsx,
 * SketchTutorial.jsx): hand-drawn clips a page at a time on the board's paper,
 * then the game's own practice and ready pages, which `renderSlide` draws.
 *
 * `intro` is the longer alarm of the game's first morning (minigames.js
 * introDay): the slides fill DEEP BLUE until the guest finishes or skips them,
 * with a countdown to the start. The game closes it itself when play begins,
 * so nobody misses the game for the lesson. `replay` is the "?" in a running
 * game: the same slides, and the last one goes back to the game.
 *
 * Tap the picture or Next to go on; swipe either way. Horizontal gestures are
 * ours (`touch-action: pan-y`), or Chrome's edge swipe would take the page
 * back (Lessons 2026-08-05). Reduced motion, or a browser that won't play the
 * clip (iOS Low Power Mode), shows each clip's last frame instead.
 *
 * `tone="night"` is the Night app's tutorial (NightTutorial.jsx): the same
 * pager on the night sky instead of the paper.
 */

const SWIPE_PX = 48;
const GHOST_CLICK_MS = 450;

export default function Tutorial({ slides, renderSlide, mode = 'intro', startsAt = 0, startLabel = 'Starts in', soonLabel = 'Any second', onDone, prefetch, tone = 'paper', doneLabel = 'Got it', replayLabel = 'Back to the game' }) {
  const [at, setAt] = useState({ i: 0, dir: 1 });
  const slide = slides[at.i];
  const last = at.i === slides.length - 1;
  const swipedAt = useRef(0);
  const touch = useRef(null);
  const count = slides.length;

  useEffect(() => { prefetch?.(); }, [prefetch]);

  // A state update that turns `d` pages (clamped), remembering the direction for the slide-in.
  const go = (d) => setAt(({ i }) => ({ i: Math.max(0, Math.min(count - 1, i + d)), dir: d }));
  const next = () => { sfxTap(); go(1); };
  const back = () => { sfxTap(); go(-1); };
  const finish = () => { sfxTap(); onDone(); };

  // Arrow keys, for a laptop tab; Escape leaves a replay.
  useEffect(() => {
    const turn = (d) => setAt(({ i }) => ({ i: Math.max(0, Math.min(count - 1, i + d)), dir: d }));
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') turn(1);
      else if (e.key === 'ArrowLeft') turn(-1);
      else if (e.key === 'Escape' && mode === 'replay') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, onDone, count]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swipedAt.current = performance.now();
      if (dx < 0) next();
      else if (at.i > 0) back();
    }
  };
  // A tap on the picture goes on, unless it was the tail of a swipe.
  const tapPicture = () => {
    if (performance.now() - swipedAt.current < GHOST_CLICK_MS) return;
    next();
  };

  return (
    <div className={`os-wt ${mode === 'replay' ? 'os-wt--replay' : ''} ${tone === 'night' ? 'os-wt--night' : ''}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="os-wt__top">
        <ol className="os-wt__dots" aria-label={`Page ${at.i + 1} of ${count}`}>
          {slides.map((s, k) => <li key={s.id} className={k === at.i ? 'is-on' : k < at.i ? 'is-past' : ''} />)}
        </ol>
        {mode === 'intro' && <StartsIn at={startsAt} label={startLabel} soon={soonLabel} />}
        {!last && (
          <button type="button" className="os-wt__skip" onClick={finish}>{mode === 'replay' ? 'Close' : 'Skip'}</button>
        )}
      </div>

      <div key={slide.id} className={`os-wt__stage ${at.dir < 0 ? 'os-wt__stage--back' : ''}`}>
        {slide.kind === 'film' ? <FilmSlide slide={slide} onTap={tapPicture} /> : renderSlide(slide, { mode })}
      </div>

      <div className="os-wt__foot">
        {at.i > 0 && (
          <button type="button" className="os-wt__back" onClick={back} aria-label="Back">
            <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" /></svg>
          </button>
        )}
        <Btn onClick={last ? onDone : () => go(1)} tone={last ? 'green' : 'blue'}>
          {last ? (mode === 'replay' ? replayLabel : doneLabel) : 'Next'}
        </Btn>
      </div>
    </div>
  );
}

/** "Cards in 0:41", counting down to the instant the game starts. */
function StartsIn({ at, label, soon }) {
  const now = useServerNow(at ? at + 1000 : 0, 500);
  if (!at) return null;
  const s = Math.max(0, Math.ceil((at - now) / 1000));
  return (
    <span className="os-wt__clock" role="timer" aria-live="off">
      {s > 0 ? <>{label} <b>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></> : soon}
    </span>
  );
}

/** A clip and its two lines. The clip plays once and holds its last drawing. */
function FilmSlide({ slide, onTap }) {
  const [still] = useState(prefersLessMotion);
  const [failed, setFailed] = useState(false);
  const [gone, setGone] = useState(false);
  const video = useRef(null);

  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    v.muted = true;
    v.play()?.catch?.(() => setFailed(true));
  }, [still]);

  return (
    <>
      {/* A tap on the picture turns the page too; Next is the control a screen reader gets. */}
      <div className="os-wt__film" onClick={onTap} role="presentation">
        {still || failed ? (
          !gone && <img src={slide.poster} alt="" onError={() => setGone(true)} />
        ) : (
          <video
            ref={video}
            src={slide.clip}
            muted
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <h2 className="os-wt__title">{slide.title}</h2>
      <p className="os-wt__line">{slide.line}</p>
    </>
  );
}
