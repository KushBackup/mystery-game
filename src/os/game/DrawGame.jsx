import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppFrame } from '../ui';
import { useDayWall, useMyPlay, useServerNow } from '../../hooks/useKillers';
import { useCountUp } from '../../hooks/useCountUp';
import { saveDrawing, saveGuesses } from '../../firebase/game';
import { serverNow } from '../../lib/clockSkew';
import { assignDrawings, checksOf, guessHits, shownWord, introDay, DRAW_SHOW_MS, DRAW_ASSIGN, STEPS, guessPoints } from '../../lib/engine/minigames.js';
import { REVEAL_LEAD_MS } from '../../lib/engine/phases.js';
import { BOARD, INKS, SKETCHBOOK, encode, paint } from './strokes';
import { sfxPoint, sfxFlip, sfxSent, sfxStick } from '../sfx';
import { markSeen, peekSeen, useSeen } from '../seen';
import { prefersLessMotion } from '../nav';
import { Sketch } from './dayParts';
import { useDayStep } from './dayStep';
import { WordCard, StepPills } from './wordParts';
import { noteLook } from './wordLook';
import { Polaroid, CorrectStamp, SpeedBar, GuessForm, Filmstrip, PenTray, HowStrip } from './sketchParts';
import { useFit } from './useFit';
import SketchTutorial from './SketchTutorial';

/**
 * SKETCH, the second morning game, on a paper sketchbook (user's call,
 * 2026-10-03): Skribbl for a whole room at once.
 *
 * Everyone alive draws their own secret word for 45 seconds (Killers too:
 * Sketch has no roles in it), then guesses up to six other people's drawings
 * by typing, 15 seconds each. A right guess scores 50 plus up to 50 for speed;
 * a drawer scores 30 each time theirs is named (minigames.js scoreDrawDay).
 * The phone says "Correct!" from the drawing's fingerprints; the host checks
 * the typed words for the board.
 *
 * On the first Sketch morning the alarm is longer and this screen is the
 * tutorial until the guest finishes or skips it (SketchTutorial.jsx); the
 * pens coming out close it either way. The "?" in the bar replays it.
 *
 * Once the game locks, the drawings stay up with their words, for the room.
 */

const DRAW_S = STEPS.draw[0][1];
// Sketch's steps, for the same bar as Word's (wordParts.jsx StepPills).
const SKETCH_PILLS = [['draw', 'Draw'], ['guess', 'Guess']];
const SAVE_EVERY_MS = 1500;
const PENS_DOWN_MS = 1100;
// After a drawing's 15 seconds, how long "Time!" stays on it before the next one.
const TIME_UP_HOLD_MS = 700;

// The draw and guess steps say what to do on the pad and in the guess box, so
// the pens and the box stay on screen on a small phone.
const DO_NOW = { wait: 'Your word is on its way.' };

/** When the pens come out: the end of the alarm plus the game's reveal hold, or the game's own reveal. */
function startsAtOf(game) {
  if (game.phase === 'alarm') return game.phaseEndsAt ? game.phaseEndsAt + REVEAL_LEAD_MS : 0;
  if (game.phase === 'game') return game.revealAt || 0;
  return 0;
}

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function DrawGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'draw');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'draw') ?? null;
  const drawings = useDayWall(gid, 'drawings', c, step === 'guess' || step === 'done' || after);
  const alive = me.status === 'alive';
  const ghost = me.status === 'ghost';
  const canGuess = alive || ghost;
  const [replay, setReplay] = useState(false);
  const tutSeen = useSeen(`${gid}.tut.draw`, false);

  const startsAt = startsAtOf(game);
  const now = useServerNow(step === 'wait' && startsAt ? startsAt + 1000 : 0, 500);
  const startsIn = Math.max(0, Math.ceil((startsAt - now) / 1000));
  const waitLabel = startsAt ? (startsIn > 0 ? `Pens out in ${clock(startsIn)}` : 'Any second') : '';

  // "PENS DOWN!" when the drawing step ends under your eyes, then the guessing.
  const [pensDown, setPensDown] = useState(false);
  const [lastStep, setLastStep] = useState(step);
  if (lastStep !== step) {
    setLastStep(step);
    if (lastStep === 'draw' && step === 'guess' && alive && card && !prefersLessMotion()) setPensDown(true);
  }
  useEffect(() => {
    if (!pensDown) return undefined;
    sfxStick();
    const id = setTimeout(() => setPensDown(false), PENS_DOWN_MS);
    return () => clearTimeout(id);
  }, [pensDown]);

  const intro = !after && step === 'wait' && !tutSeen && introDay(game.config, c);
  const mine = (drawings ?? []).find((d) => d.pid === me.pid) ?? null;

  const help = !intro && !replay
    ? <button type="button" className="os-barbtn os-wb-help" onClick={() => setReplay(true)} aria-label="How to play">?</button>
    : null;

  let body;
  if (intro) {
    body = <SketchTutorial mode="intro" startsAt={startsAt} onDone={() => markSeen(`${gid}.tut.draw`, true)} />;
  } else if (replay) {
    body = <SketchTutorial mode="replay" onDone={() => setReplay(false)} />;
  } else if (after || step === 'done') {
    body = <Gallery drawings={drawings} words={after ? dayGame?.words : null} me={me} nameOf={nameOf} after={after} />;
  } else {
    body = (
      <div className="os-wb-board">
        {step === 'wait' && <p className="os-wb-now">{DO_NOW.wait}</p>}
        {step === 'wait' && (
          <>
            <div className="os-sb-hello">
              <p className="os-sb-hello__title">Sketch</p>
              <HowStrip drawSeconds={DRAW_S} />
            </div>
            {card && alive ? (
              <WordCard up={false} locked label="Draw" word="" chip backText="Your word · dealt in a moment" />
            ) : (
              <div className="os-wb-watch">{ghost ? 'Ghosts don’t draw. You can still guess.' : 'You’re watching today.'}</div>
            )}
            <button type="button" className="os-wb-link" onClick={() => setReplay(true)}>Watch how to play</button>
          </>
        )}
        {step === 'draw' && (card && alive
          ? <DrawStep gid={gid} c={c} me={me} word={card.word} />
          : <div className="os-wb-watch">{ghost ? `Ghosts don’t draw. Guessing starts in ${clock(left)}.` : 'You’re watching today.'}</div>)}
        {step === 'guess' && (canGuess
          ? <GuessStep gid={gid} game={game} me={me} drawings={drawings} nameOf={nameOf} mine={mine} />
          : <div className="os-wb-watch">You’re watching today.</div>)}
      </div>
    );
  }

  return (
    <AppFrame
      title={`Day ${c} · SKETCH`}
      onBack={onClose}
      right={help}
      bodyClass="os-wb"
      overlay={pensDown ? <PensDown strokes={mine?.strokes ?? peekSeen(`${gid}.draw.${c}`) ?? null} /> : null}
    >
      {!after && !intro && !replay && step !== 'done' && (
        <StepPills step={step} left={left} hot={step === 'draw' || step === 'guess'} waitLabel={waitLabel} pills={SKETCH_PILLS} />
      )}
      {body}
    </AppFrame>
  );
}

/** "PENS DOWN!": your page shrinks to a polaroid and is pinned up for the room. */
function PensDown({ strokes }) {
  const s = typeof strokes === 'string' ? strokes : Array.isArray(strokes) ? encode(strokes) : '';
  return (
    <div className="os-sb-down" role="status">
      <p className="os-sb-down__stamp">Pens down!</p>
      {s && <Polaroid strokes={s} size={150} sub="yours · pinned up" tilt={-2} className="os-sb-down__pol" mine />}
    </div>
  );
}

// --- Draw -------------------------------------------------------------------------------

function DrawStep({ gid, c, me, word }) {
  // The drawing is kept on the phone as it grows, so a reload carries on from
  // the same picture instead of autosaving a blank one over it.
  const keepKey = `${gid}.draw.${c}`;
  const [strokes, setStrokes] = useState(() => peekSeen(keepKey) ?? []);
  const [ink, setInk] = useState(0);
  const checks = useMemo(() => checksOf(word, `${c}:${me.pid}`), [word, c, me.pid]);
  useEffect(() => { markSeen(keepKey, strokes.length ? strokes : null); }, [keepKey, strokes]);

  // The card turns over once as the pens come out; after that a tap hides it from a neighbour.
  const [up, setUp] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => { sfxFlip(); setUp(true); });
    return () => cancelAnimationFrame(id);
  }, []);

  // The latest drawing, for the autosave, and whether it has changed since the last save.
  const latest = useRef({ strokes, dirty: strokes.length > 0 });
  useEffect(() => {
    if (latest.current.strokes !== strokes) latest.current = { strokes, dirty: true };
  }, [strokes]);
  const save = useRef(null);
  useEffect(() => {
    save.current = () => {
      if (!latest.current.dirty) return;
      latest.current.dirty = false;
      saveDrawing(gid, c, me.pid, encode(latest.current.strokes), checks).catch((e) => console.warn('[drawing] not saved:', e.code ?? e.message));
    };
  }, [gid, c, me.pid, checks]);
  // Autosave while drawing, and once more when the step closes (this unmounts) or the guest leaves the app.
  useEffect(() => {
    const id = setInterval(() => save.current?.(), SAVE_EVERY_MS);
    return () => {
      clearInterval(id);
      save.current?.();
    };
  }, []);

  return (
    <div className="os-sb-draw">
      <WordCard up={up} onFlip={() => { sfxFlip(); setUp((u) => !u); }} chip label="Draw" word={shownWord(word)} />
      <DrawPad strokes={strokes} ink={ink} onStroke={(s) => setStrokes((all) => [...all, s])} />
      <PenTray
        ink={ink}
        onInk={setInk}
        canUndo={strokes.length > 0}
        onUndo={() => setStrokes((all) => all.slice(0, -1))}
        onClear={() => setStrokes([])}
      />
    </div>
  );
}

/**
 * A sketchbook page you draw on with a finger. Finished strokes come from the
 * parent; the one under the finger lives in a ref and is painted directly, so
 * a stroke in progress never re-renders React. The canvas is clear: the page
 * and its dots are CSS behind it.
 */
function DrawPad({ strokes, ink, onStroke }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  // The pills, the word chip, the page's margins and the pen tray stay on screen with it.
  const size = useFit(wrap, { reserve: 268, padX: 20, min: 180, max: 360 });
  const live = useRef(null);
  const rect = useRef(null);

  useLayoutEffect(() => {
    const el = canvas.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // resizing clears and reallocates the canvas, so only when the size changes
    if (el.width !== size * dpr) { el.width = size * dpr; el.height = size * dpr; }
    const g = el.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(g, strokes, size, null);
  }, [strokes, size]);

  // The stroke under the finger is drawn a segment at a time on top of the
  // page, the same marks paint() makes (opaque inks, round ends), so a move
  // never repaints the whole drawing.
  const ink2d = (colour) => {
    const g = canvas.current.getContext('2d');
    const k = size / BOARD;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = Math.max(2, 3.2 * k);
    g.strokeStyle = colour;
    g.fillStyle = colour;
    return [g, k];
  };
  const at = (e) => {
    const r = rect.current ?? canvas.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * BOARD, ((e.clientY - r.top) / r.height) * BOARD];
  };
  const down = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    rect.current = canvas.current.getBoundingClientRect();
    const p = at(e);
    live.current = { ink, points: [p] };
    const [g, k] = ink2d(INKS[ink] ?? INKS[0]);
    g.beginPath();
    g.arc(p[0] * k, p[1] * k, g.lineWidth / 2, 0, Math.PI * 2);
    g.fill();
  };
  const move = (e) => {
    const stroke = live.current;
    if (!stroke) return;
    const p = at(e);
    const last = stroke.points.at(-1);
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.6) return;
    stroke.points.push(p);
    const [g, k] = ink2d(INKS[stroke.ink] ?? INKS[0]);
    g.beginPath();
    g.moveTo(last[0] * k, last[1] * k);
    g.lineTo(p[0] * k, p[1] * k);
    g.stroke();
  };
  const up = () => {
    const stroke = live.current;
    if (!stroke) return;
    live.current = null;
    rect.current = null;
    onStroke(stroke);
  };

  return (
    <div ref={wrap} className="os-sb-book">
      <div className="os-sb-book__page" style={{ width: size + 20 }}>
        <span className="os-sb-book__rings" aria-hidden="true" />
        <canvas
          ref={canvas}
          className="os-sb-book__pad"
          style={{ width: size, height: size }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Drawing pad"
        />
        {!strokes.length && <span className="os-sb-book__hint" aria-hidden="true">draw here<small>no letters, no numbers</small></span>}
      </div>
    </div>
  );
}

// --- Guess ------------------------------------------------------------------------------

function GuessStep({ gid, game, me, drawings, nameOf, mine }) {
  const c = game.cycle;
  const saved = useMyPlay(gid, 'guesses', c, me.pid);
  // Who you guess follows the drawings as they arrive (the first snapshot can
  // be the phone's own cache, holding only its own drawing). Drawings you have
  // already seen stay seen, so a late arrival never sends you back.
  const inked = useMemo(() => (drawings ?? []).filter((d) => (d.strokes ?? '').length > 4), [drawings]);
  const byPid = useMemo(() => Object.fromEntries(inked.map((d) => [d.pid, d])), [inked]);
  const list = useMemo(() => assignDrawings(inked.map((d) => d.pid), me.pid, `${game.courseSeed ?? 'deep'}:${c}`), [inked, me.pid, game.courseSeed, c]);
  // Which drawings you've been shown, and when the current one appeared, are
  // kept on the phone: a reload neither replays a drawing nor restarts its clock.
  const seenKey = `${gid}.guessSeen.${c}`;
  const shownKey = `${gid}.guessShown.${c}`;
  const [seen, setSeen] = useState(() => peekSeen(seenKey) ?? []);
  useEffect(() => { markSeen(seenKey, seen.length ? seen : null); }, [seenKey, seen]);
  const current = list.find((p) => !seen.includes(p)) ?? null;
  const [answers, setAnswers] = useState(null);
  const got = answers ?? saved?.answers ?? {};
  const [flash, setFlash] = useState(null); // the points of a right guess, while its stamp shows
  // Each drawing gets its own clock, started the moment it is shown.
  const [shown, setShown] = useState(() => peekSeen(shownKey) ?? { pid: null, at: 0 });
  if (current && shown.pid !== current) setShown({ pid: current, at: serverNow() });
  useEffect(() => { if (shown.pid) markSeen(shownKey, shown); }, [shownKey, shown]);
  const shownAt = shown.pid === current ? shown.at : serverNow();
  const now = useServerNow(flash == null ? shownAt + DRAW_SHOW_MS : 0, 200);

  const next = () => { setSeen((s) => (current ? [...s, current] : s)); setFlash(null); };
  // Out of time on this one: say so, then move on.
  useEffect(() => {
    if (!shown.pid || flash != null) return undefined;
    const pid = shown.pid;
    const id = setTimeout(() => {
      setSeen((s) => (s.includes(pid) ? s : [...s, pid]));
    }, Math.max(0, shown.at + DRAW_SHOW_MS + TIME_UP_HOLD_MS - serverNow()));
    return () => clearTimeout(id);
  }, [shown, flash]);

  const stage = useRef(null);
  // The pills, the strip, the speed bar, the guess box and Pass stay on screen with it.
  const size = useFit(stage, { reserve: 358, min: 146, max: 260 });
  const total = Object.values(got).reduce((n, a) => n + guessPoints(a.ms ?? DRAW_SHOW_MS), 0);
  const shownTotal = useCountUp(total);
  const slots = list.slice(0, DRAW_ASSIGN).map((p) => (got[p] ? 'hit' : p === current ? 'now' : seen.includes(p) ? 'miss' : 'next'));

  if (!list.length) {
    return (
      <div className="os-sb-waiting">
        <svg className="os-sb-wiggle" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32l3-9L27 7l6 6-16 16zM24 10l6 6M8 32l9-3" /></svg>
        <p>Waiting for drawings…</p>
        <span>They appear here as soon as they land.</span>
      </div>
    );
  }

  if (!current) {
    const named = Object.keys(got).length;
    return (
      <div className="os-sb-done">
        <p className="os-wb-head">All done</p>
        <p className="os-sb-done__score">{shownTotal}</p>
        <Filmstrip slots={slots} />
        <p className="os-sb-done__line">{named} of {list.length} named. The board posts when time is up.</p>
        {mine && <Polaroid strokes={mine.strokes} size={150} sub="yours" tilt={noteLook(me.pid).tilt} mine />}
      </div>
    );
  }

  const d = byPid[current];
  const onGuess = (text) => {
    if (flash != null || !guessHits(text, d?.checks, `${c}:${current}`)) return false;
    const ms = Math.min(DRAW_SHOW_MS, serverNow() - shownAt);
    const nextAnswers = { ...got, [current]: { text: text.trim().slice(0, 30), ms } };
    setAnswers(nextAnswers);
    sfxPoint();
    setFlash(guessPoints(ms));
    saveGuesses(gid, c, me.pid, nextAnswers).then(sfxSent).catch((err) => console.warn('[guesses] not saved:', err.code ?? err.message));
    setTimeout(next, 950);
    return true;
  };
  const i = list.filter((p) => seen.includes(p)).length;
  const timeUp = flash == null && now >= shownAt + DRAW_SHOW_MS;

  return (
    <div className="os-sb-guessing">
      <div className="os-sb-guessing__top">
        <Filmstrip slots={slots} />
        <span className="os-sb-score" aria-label={`Your points: ${total}`}>{shownTotal}</span>
      </div>
      <div className="os-sb-stage" ref={stage}>
        <Polaroid
          key={current}
          strokes={d?.strokes ?? ''}
          size={size}
          sub={`by ${nameOf(current)}`}
          tilt={noteLook(current).tilt}
          className={i > 0 ? 'os-sb-pol--deal' : ''}
          stamp={flash != null ? <CorrectStamp points={flash} /> : timeUp ? <span className="os-sb-timeup">Time!</span> : null}
        />
      </div>
      <SpeedBar shownAt={shownAt} now={now} frozen={flash != null ? Math.min(DRAW_SHOW_MS, (got[current]?.ms ?? 0)) : null} />
      <GuessForm key={current} onGuess={onGuess} disabled={flash != null || timeUp} after={<button type="button" className="os-wb-link os-sb-pass" onClick={next} disabled={flash != null}>Pass</button>} />
    </div>
  );
}

// --- After: everyone's drawings, with their words -------------------------------------------

function Gallery({ drawings, words, me, nameOf, after }) {
  const inked = (drawings ?? []).filter((d) => (d.strokes ?? '').length > 4);
  const [open, setOpen] = useState(null);
  const opened = open ? inked.find((d) => d.id === open) : null;

  useEffect(() => {
    if (!opened) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened]);

  return (
    <div className="os-wb-board">
      {!after && (
        <div className="os-wb-reveal">
          <p className="os-wb-reveal__label">Time’s up</p>
          <p className="os-wb-reveal__wait">Posting the board…</p>
        </div>
      )}
      <p className="os-wb-head">{after ? `Today’s drawings · ${inked.length}` : `The drawings · ${inked.length}`}</p>
      {inked.length ? (
        <ul className="os-sb-wall">
          {inked.map((d) => (
            <li key={d.id}>
              <Polaroid
                strokes={d.strokes}
                size={132}
                caption={words?.[d.pid] ?? '?'}
                sub={d.pid === me.pid ? 'you' : nameOf(d.pid)}
                tilt={noteLook(d.pid).tilt}
                mine={d.pid === me.pid}
                onOpen={() => setOpen(d.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="os-wb-empty">No drawings today.</p>
      )}
      {opened && (
        <div className="os-sb-big" role="dialog" aria-modal="true" aria-label="A drawing">
          <button type="button" className="os-sb-big__scrim" aria-label="Close" onClick={() => setOpen(null)} />
          <figure className="os-sb-big__card" onClick={() => setOpen(null)}>
            <Sketch strokes={opened.strokes} size={280} paper={SKETCHBOOK} />
            <figcaption>
              <b>{words?.[opened.pid] ?? '?'}</b>
              <span>{opened.pid === me.pid ? 'you' : nameOf(opened.pid)}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
