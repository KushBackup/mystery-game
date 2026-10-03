import React, { useLayoutEffect, useRef } from 'react';
import { prefersLessMotion } from '../nav';

/**
 * The pieces of the Word board, shared by the game (WordGame.jsx) and its
 * tutorial (WordTutorial.jsx): the card you peek at, a sticky note on the
 * wall, the tray of three gold stars, and the Read · Clue · Pick pills.
 *
 * The board is paper (user's call, 2026-10-03): cream notebook paper, navy
 * ballpoint ink, sticky notes, a handwriting face. Styling lives in os.css
 * under `.os-wb-*`. Two rules carry over from the navy version:
 *   - A Killer's hint card is the word card in every way but its words: same
 *     back, size, ink and layout, so a glance across the table tells nothing.
 *   - A note's shade and tilt come from the poster's id, never their role.
 */

/** The gold star: a point earned. Gold is for points only, so it is never anything else. */
export function Star({ size = 22, on = true, className = '' }) {
  return (
    <svg className={`os-wb-star ${on ? '' : 'os-wb-star--off'} ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6l2.75 5.8 6.35.8-4.66 4.38 1.2 6.28L12 16.8l-5.64 3.06 1.2-6.28L2.9 9.2l6.35-.8z" />
    </svg>
  );
}

/**
 * The card. Dealt face down; a tap turns it over and a second tap turns it
 * back. `chip` is the slim version pinned above the wall while you write and
 * pick. The flip is a transition, so a fast double tap reverses mid-turn.
 */
export function WordCard({ up, onFlip, label, word, sub, chip = false, locked = false, backText = null }) {
  const back = backText ?? (chip ? 'Your card · tap to peek' : 'Tap to peek');
  return (
    <button
      type="button"
      className={`os-wb-card ${chip ? 'os-wb-card--chip' : ''} ${up ? 'is-up' : ''}`}
      onClick={locked ? undefined : onFlip}
      aria-pressed={up}
      aria-label={up ? `${label}: ${word}. Tap to hide.` : 'Your card. Tap to peek.'}
      disabled={locked}
    >
      <span className="os-wb-card__turn">
        <span className="os-wb-card__face os-wb-card__back" aria-hidden="true">
          <CardWave />
          <span className="os-wb-card__peek">{back}</span>
        </span>
        <span className="os-wb-card__face os-wb-card__front" aria-hidden={!up}>
          <span className="os-wb-card__label">{label}</span>
          <span className="os-wb-card__word">{word}</span>
          {sub && !chip && <span className="os-wb-card__sub">{sub}</span>}
        </span>
      </span>
    </button>
  );
}

/** The card's back: a little hand-drawn wave, the same on every card in the room. */
export function CardWave() {
  return (
    <svg className="os-wb-card__wave" viewBox="0 0 120 40" aria-hidden="true">
      <path d="M4 26c10-12 18-12 26 0s16 12 26 0 18-12 26 0 16 12 26 0" />
      <path d="M14 34c8-6 14-6 20 0s14 6 20 0 14-6 20 0 14 6 20 0" className="os-wb-card__wave2" />
      <circle cx="60" cy="10" r="3.2" />
    </svg>
  );
}

/**
 * One sticky note on the wall. A button only while picking. `fresh` notes
 * (landed after this screen opened) pop in once; `fly` is the rect of the
 * composer it was written on, and the note travels from there to its place.
 */
export function WallNote({ n, clue, who, look, own = false, picked = false, canPick = false, onPick, spoiled = false, fresh = false, fly = null, tag = null, dim = false }) {
  const ref = useRef(null);

  // Your own note flies from the pad you wrote it on to its slot on the wall:
  // measure both, start it at the pad, then let a transition carry it home.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!fly || !el || prefersLessMotion()) return undefined;
    el.scrollIntoView({ block: 'nearest' });
    const to = el.getBoundingClientRect();
    const dx = fly.left + fly.width / 2 - (to.left + to.width / 2);
    const dy = fly.top + fly.height / 2 - (to.top + to.height / 2);
    const home = () => {
      el.style.transition = '';
      el.style.translate = '';
      el.style.scale = '';
    };
    el.style.transition = 'none';
    el.style.translate = `${dx}px ${dy}px`;
    el.style.scale = '1.25';
    // Two frames: the start position has to be painted before the transition can run from it.
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(home); });
    return () => { cancelAnimationFrame(raf); home(); };
  }, [fly]);

  const cls = [
    'os-wb-note',
    `os-wb-note--${look.shade}`,
    own && 'is-own',
    picked && 'is-picked',
    canPick && 'is-pickable',
    fresh && !fly && 'is-fresh',
    fly && 'is-flying',
    dim && 'is-dim',
  ].filter(Boolean).join(' ');
  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      style={{ '--tilt': `${look.tilt}deg` }}
      disabled={!canPick}
      aria-pressed={canPick ? picked : undefined}
      onClick={canPick ? onPick : undefined}
    >
      <span className="os-wb-note__n">{n}</span>
      <span className="os-wb-note__clue">{clue}</span>
      {who != null && <span className="os-wb-note__who">{who}</span>}
      {spoiled && <span className="os-wb-note__x">gave it away</span>}
      {tag && <span className="os-wb-note__tag">{tag}</span>}
      {own && <span className="os-wb-note__pin" aria-hidden="true" />}
      {picked && <Star size={26} className="os-wb-note__star" />}
    </button>
  );
}

/** The tray of three stars: how many picks you have left to place. */
export function PickTray({ used, total = 3, line, shake = 0 }) {
  return (
    <div className="os-wb-tray" role="status">
      <span className={`os-wb-tray__stars ${shake ? 'os-shake' : ''}`} key={shake}>
        {Array.from({ length: total }, (_, i) => <Star key={i} size={24} on={i >= used} />)}
      </span>
      <span className="os-wb-tray__line">{line}</span>
    </div>
  );
}

const PILLS = [['read', 'Read'], ['clue', 'Clue'], ['pick', 'Pick']];

/** Where the room is: Read · Clue · Pick, and the time left on this step (or until the cards). */
export function StepPills({ step, left, hot = false, waitLabel = '' }) {
  const at = PILLS.findIndex(([id]) => id === step);
  const done = step === 'done';
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className={`os-wb-steps ${hot && left <= 10 && left > 0 ? 'os-wb-steps--hot' : ''}`}>
      <ol className="os-wb-steps__list">
        {PILLS.map(([id, label], i) => (
          <li key={id} className={`os-wb-steps__pill ${i === at ? 'is-on' : ''} ${done || (at >= 0 && i < at) ? 'is-past' : ''}`} aria-current={i === at ? 'step' : undefined}>
            {label}
          </li>
        ))}
      </ol>
      <span className={`os-wb-steps__time ${step === 'wait' ? 'os-wb-steps__time--wait' : ''}`}>
        {step === 'wait' ? waitLabel : done ? 'Time' : left > 0 ? `${mm}:${ss}` : ''}
      </span>
    </div>
  );
}
