import React, { useEffect, useRef, useState } from 'react';
import { DRAW_SHOW_MS, guessPoints } from '../../lib/engine/minigames.js';
import { INKS, INK_NAMES, SKETCHBOOK } from './strokes';
import { Sketch } from './dayParts';
import { Star } from './wordParts';
import { sfxDeny, sfxTap, vibrate } from '../sfx';

/**
 * The pieces of the Sketch board, shared by the game (DrawGame.jsx) and its
 * tutorial (SketchTutorial.jsx): a drawing as a polaroid, the speed bar that
 * shows what a right guess earns right now, the guess box with its crossed-out
 * misses, the filmstrip of today's drawings, and the pen tray.
 *
 * The board is the Word board's paper (os.css `.os-wb`), with its own pieces
 * under `.os-sb-*`. A polaroid's tilt comes from the drawer's id, never their
 * role. Gold is for points only: the stars and the "+N".
 */


/** A drawing on a polaroid. `stamp` is the CORRECT mark; `onOpen` makes it a button that opens it large. */
export function Polaroid({ strokes, size, caption, sub, tilt = 0, stamp = null, mine = false, onOpen, className = '' }) {
  const Tag = onOpen ? 'button' : 'figure';
  return (
    <Tag
      type={onOpen ? 'button' : undefined}
      className={`os-sb-pol ${onOpen ? 'os-sb-pol--open' : ''} ${className}`}
      style={{ '--tilt': `${tilt}deg` }}
      onClick={onOpen ? () => { sfxTap(); onOpen(); } : undefined}
      aria-label={onOpen ? `Open ${caption ?? 'drawing'}` : undefined}
    >
      <Sketch strokes={strokes} size={size} paper={SKETCHBOOK} className="os-sb-pol__ink" label={caption ? `Drawing: ${caption}` : 'A guest’s drawing'} />
      {(caption || sub) && (
        <span className="os-sb-pol__cap">
          {caption && <b>{caption}</b>}
          {sub && <span>{sub}</span>}
        </span>
      )}
      {mine && <span className="os-wb-note__pin os-sb-pol__pin" aria-hidden="true" />}
      {stamp}
    </Tag>
  );
}

/** The CORRECT mark that lands on a polaroid, with the points it scored. */
export function CorrectStamp({ points }) {
  return (
    <span className="os-sb-stamp" role="status">
      <Star size={30} />
      <span>Correct!</span>
      <b>+{points}</b>
    </span>
  );
}

/**
 * The pencil line that runs down while a drawing is up, and beside it what a
 * right guess earns now. Seeing the number fall is what teaches "faster scores more".
 */
export function SpeedBar({ shownAt, now, showMs = DRAW_SHOW_MS, frozen = null }) {
  const spent = frozen ?? Math.max(0, now - shownAt);
  const left = Math.max(0, 1 - spent / showMs);
  return (
    <div className="os-sb-speed">
      <span className="os-sb-speed__track" aria-hidden="true"><i style={{ scale: `${left} 1` }} /></span>
      <span className="os-sb-speed__pts" aria-label={`A right guess now scores ${guessPoints(spent)}`}>+{guessPoints(spent)}</span>
    </div>
  );
}

/**
 * The guess box. `onGuess(text)` says whether it was right; a wrong guess
 * shakes the box and drops below it, crossed out (the last three). Remount it
 * (a `key`) for each drawing.
 */
export function GuessForm({ onGuess, disabled = false, after = null }) {
  const [text, setText] = useState('');
  const [misses, setMisses] = useState([]);
  const [shake, setShake] = useState(0);
  const input = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    if (onGuess(t)) {
      setText('');
      return;
    }
    sfxDeny();
    vibrate(12);
    setShake((n) => n + 1);
    setMisses((m) => [t.slice(0, 18), ...m].slice(0, 3));
    setText('');
    input.current?.focus();
  };

  return (
    <div className="os-sb-guess">
      <form className={`os-sb-guess__row ${shake ? 'os-shake' : ''}`} key={shake} onSubmit={submit}>
        <label className="os-sb-guess__pad">
          <span className="sr-only">Your guess</span>
          <input
            ref={input}
            className="os-sb-guess__input"
            value={text}
            maxLength={30}
            onChange={(e) => setText(e.target.value)}
            placeholder="What is it?"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            disabled={disabled}
          />
        </label>
        <button type="submit" className="os-sb-guess__go" disabled={disabled || !text.trim()}>Guess</button>
      </form>
      <div className="os-sb-guess__under">
        <ul className="os-sb-guess__misses" aria-label="Wrong guesses">
          {misses.map((m, i) => <li key={`${misses.length - i}-${m}`}>{m}</li>)}
        </ul>
        {after}
      </div>
    </div>
  );
}

/** Today's drawings to guess, as a strip: named (a star), missed, the one up now, still to come. */
export function Filmstrip({ slots }) {
  return (
    <ol className="os-sb-strip" aria-label={`${slots.filter((s) => s === 'hit').length} of ${slots.length} named`}>
      {slots.map((s, i) => (
        <li key={i} className={`os-sb-strip__slot is-${s}`}>
          {s === 'hit' && <Star size={18} />}
          {s === 'miss' && <span aria-hidden="true">✕</span>}
        </li>
      ))}
    </ol>
  );
}

/** A felt-tip pen, drawn, in its ink. */
function Pen({ color }) {
  return (
    <svg viewBox="0 0 22 64" width="22" height="64" aria-hidden="true" className="os-sb-pen__svg">
      <path d="M7 4h8l1 6H6z" fill={color} />
      <path d="M6 10h10v6H6z" fill="#fffdf7" stroke="#24324f" strokeWidth="1.4" />
      <path d="M5 16h12v40a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill={color} stroke="#24324f" strokeWidth="1.4" />
      <path d="M8 22v26" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The pens, Undo and Clear. Clear asks once ("Sure?") before it wipes the page. */
export function PenTray({ ink, onInk, canUndo, onUndo, onClear }) {
  const [sure, setSure] = useState(false);
  useEffect(() => {
    if (!sure) return undefined;
    const id = setTimeout(() => setSure(false), 2500);
    return () => clearTimeout(id);
  }, [sure]);

  const clear = () => {
    sfxTap();
    if (!sure) { setSure(true); return; }
    setSure(false);
    vibrate(10);
    onClear();
  };

  return (
    <div className="os-sb-tray">
      <div className="os-sb-pens" role="radiogroup" aria-label="Pen colour">
        {INKS.map((hex, i) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={ink === i}
            aria-label={INK_NAMES[i]}
            className={`os-sb-pen ${ink === i ? 'is-on' : ''}`}
            onClick={() => { if (ink !== i) { sfxTap(); vibrate(6); onInk(i); } }}
          >
            <Pen color={hex} />
          </button>
        ))}
      </div>
      <div className="os-sb-tools">
        <button type="button" className="os-sb-tool" onClick={() => { sfxTap(); onUndo(); }} disabled={!canUndo} aria-label="Undo the last line">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h10a5 5 0 0 1 0 10h-3" /></svg>
          <span>Undo</span>
        </button>
        <button type="button" className={`os-sb-tool ${sure ? 'is-sure' : ''}`} onClick={clear} disabled={!canUndo} aria-label={sure ? 'Tap again to clear the page' : 'Clear the page'}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></svg>
          <span>{sure ? 'Sure?' : 'Clear'}</span>
        </button>
      </div>
    </div>
  );
}

/** The three steps of the day, drawn: pencil, eye, star. For the waiting card. */
export function HowStrip({ drawSeconds }) {
  return (
    <ol className="os-sb-how">
      <li>
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32l3-9L27 7l6 6-16 16zM24 10l6 6M8 32l9-3" /></svg>
        <b>Draw</b><span>{drawSeconds} seconds</span>
      </li>
      <li>
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 20c5-8 10-11 16-11s11 3 16 11c-5 8-10 11-16 11S9 28 4 20z" /><circle cx="20" cy="20" r="5" /></svg>
        <b>Guess</b><span>fast is best</span>
      </li>
      <li>
        <Star size={34} />
        <b>Score</b><span>stay off the bottom</span>
      </li>
    </ol>
  );
}
