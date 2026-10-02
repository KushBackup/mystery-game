import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppFrame, Section, Btn, Empty } from '../ui';
import { useDayWall, useMyPlay, useServerNow } from '../../hooks/useKillers';
import { saveDrawing, saveGuesses } from '../../firebase/game';
import { serverNow } from '../../lib/clockSkew';
import { assignDrawings, checksOf, guessHits, shownWord, DRAW_SHOW_MS } from '../../lib/engine/minigames.js';
import { BOARD, INKS, encode, paint } from './strokes';
import { sfxPoint, sfxDeny, sfxTap, sfxSent } from '../sfx';
import { StepBar, Sketch } from './dayParts';
import { useDayStep } from './dayStep';

/**
 * SKETCH, the second morning game: Skribbl for a whole room at once.
 * Everyone draws their own secret word for 45 seconds, then guesses a handful
 * of other people's drawings by typing. Right and fast scores; so does a
 * drawing other people get. The phone says "Correct!" from the drawing's
 * fingerprints; the host checks the typed words for the board.
 *
 * Once the game locks, the drawings stay up with their words, for the room.
 */

const STEP_LABEL = { wait: 'GET READY', draw: 'DRAW YOUR WORD', guess: 'GUESS THE DRAWINGS', done: 'TIME' };
const SAVE_EVERY_MS = 1500;

export default function DrawGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf, pack } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'draw');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'draw') ?? null;
  const drawings = useDayWall(gid, 'drawings', c, step === 'guess' || step === 'done' || after);
  const canGuess = ['alive', 'ghost'].includes(me.status);
  const rule = pack.dayGames?.draw?.rule;

  return (
    <AppFrame title={`Day ${c} · SKETCH`} onBack={onClose} tone="dark" dark>
      {!after && <StepBar label={STEP_LABEL[step] ?? ''} left={left} hot={step !== 'wait'} />}
      {step === 'wait' && (
        <div className="px-4 pt-4">
          <div className="os-daycard">
            <p className="os-label text-[11px] text-os-chrome">SKETCH</p>
            <p className="text-[16px] mt-2 os-balance">{rule}</p>
          </div>
        </div>
      )}
      {step === 'draw' && (card && me.status === 'alive'
        ? <DrawStep gid={gid} c={c} me={me} word={card.word} />
        : <div className="px-4 pt-4"><div className="os-daycard"><p className="os-label text-[11px] text-os-chrome">{me.status === 'ghost' ? 'GHOSTS DON’T DRAW' : 'YOU’RE NOT DRAWING TODAY'}</p><p className="text-[16px] mt-2">Get ready to guess.</p></div></div>)}
      {step === 'guess' && (canGuess
        ? <GuessStep gid={gid} game={game} me={me} drawings={drawings} nameOf={nameOf} />
        : <Empty glyph="dots" title="WATCHING" line="Only guests in the game guess." />)}
      {(step === 'done' || after) && <Gallery drawings={drawings} words={after ? dayGame?.words : null} me={me} nameOf={nameOf} after={after} />}
    </AppFrame>
  );
}

// --- Draw -------------------------------------------------------------------------------

function DrawStep({ gid, c, me, word }) {
  const [strokes, setStrokes] = useState([]);
  const [ink, setInk] = useState(0);
  const checks = useMemo(() => checksOf(word, `${c}:${me.pid}`), [word, c, me.pid]);

  // The latest drawing, for the autosave, and whether it has changed since the last save.
  const latest = useRef({ strokes, dirty: false });
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
    <div className="px-4 pt-3">
      <p className="text-center"><span className="os-label text-[11px] text-os-chrome">DRAW </span><span className="os-daycard__word os-daycard__word--inline">{shownWord(word)}</span></p>
      <p className="text-[13px] text-os-chrome text-center mt-1">No letters, no numbers. Just draw.</p>
      <DrawPad strokes={strokes} ink={ink} onStroke={(s) => setStrokes((all) => [...all, s])} />
      <div className="flex items-center gap-2 mt-3">
        {INKS.map((hex, i) => (
          <button key={hex} type="button" aria-label={`Ink ${i + 1}`} aria-pressed={ink === i} className={`os-ink ${ink === i ? 'os-ink--on' : ''}`} style={{ background: hex }} onClick={() => { sfxTap(); setInk(i); }} />
        ))}
        <span className="flex-1" />
        <Btn small tone="dark" disabled={!strokes.length} onClick={() => setStrokes((all) => all.slice(0, -1))}>Undo</Btn>
        <Btn small tone="dark" disabled={!strokes.length} onClick={() => setStrokes([])}>Clear</Btn>
      </div>
    </div>
  );
}

/**
 * A square canvas you draw on with a finger. Finished strokes come from the
 * parent; the one under the finger lives in a ref and is painted directly, so
 * a stroke in progress never re-renders React.
 */
function DrawPad({ strokes, ink, onStroke }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const [size, setSize] = useState(280);
  const live = useRef(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const fit = () => setSize(Math.max(200, Math.min(360, Math.floor(el.clientWidth))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const draw = (extra) => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const g = el.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(g, extra ? [...strokes, extra] : strokes, size);
  };
  useLayoutEffect(() => {
    const el = canvas.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = size * dpr;
    el.height = size * dpr;
    const g = el.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(g, strokes, size);
  }, [strokes, size]);

  const at = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * BOARD, ((e.clientY - r.top) / r.height) * BOARD];
  };
  const down = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    live.current = { ink, points: [at(e)] };
    draw(live.current);
  };
  const move = (e) => {
    const stroke = live.current;
    if (!stroke) return;
    const p = at(e);
    const last = stroke.points.at(-1);
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.6) return;
    live.current = { ...stroke, points: [...stroke.points, p] };
    draw(live.current);
  };
  const up = () => {
    const stroke = live.current;
    if (!stroke) return;
    live.current = null;
    onStroke(stroke);
  };

  return (
    <div ref={wrap} className="flex justify-center mt-3">
      <canvas
        ref={canvas}
        className="os-pad"
        style={{ width: size, height: size }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label="Drawing pad"
      />
    </div>
  );
}

// --- Guess ------------------------------------------------------------------------------

function GuessStep({ gid, game, me, drawings, nameOf }) {
  const c = game.cycle;
  const saved = useMyPlay(gid, 'guesses', c, me.pid);
  // Who you guess follows the drawings as they arrive (the first snapshot can
  // be the phone's own cache, holding only its own drawing). Drawings you have
  // already seen stay seen, so a late arrival never sends you back.
  const inked = useMemo(() => (drawings ?? []).filter((d) => (d.strokes ?? '').length > 4), [drawings]);
  const byPid = useMemo(() => Object.fromEntries(inked.map((d) => [d.pid, d])), [inked]);
  const list = useMemo(() => assignDrawings(inked.map((d) => d.pid), me.pid, `${game.courseSeed ?? 'deep'}:${c}`), [inked, me.pid, game.courseSeed, c]);
  const [seen, setSeen] = useState([]);
  const current = list.find((p) => !seen.includes(p)) ?? null;
  const [answers, setAnswers] = useState(null);
  const got = answers ?? saved?.answers ?? {};
  const [text, setText] = useState('');
  const [flash, setFlash] = useState(null);
  // Each drawing gets its own clock, started the moment it is shown.
  const [shown, setShown] = useState({ pid: null, at: 0 });
  if (current && shown.pid !== current) setShown({ pid: current, at: serverNow() });
  const shownAt = shown.pid === current ? shown.at : serverNow();
  const now = useServerNow(shownAt + DRAW_SHOW_MS, 250);

  const next = () => { setSeen((s) => (current ? [...s, current] : s)); setText(''); setFlash(null); };
  const leftMs = Math.max(0, shownAt + DRAW_SHOW_MS - now);
  // Out of time on this one: move on.
  useEffect(() => {
    if (!shown.pid || flash) return undefined;
    const pid = shown.pid;
    const id = setTimeout(() => {
      setSeen((s) => (s.includes(pid) ? s : [...s, pid]));
      setText('');
    }, Math.max(0, shown.at + DRAW_SHOW_MS - serverNow()));
    return () => clearTimeout(id);
  }, [shown, flash]);

  if (!list.length) return <Empty glyph="dots" title="WAITING FOR DRAWINGS" line="They appear here as soon as they land." />;
  const i = list.filter((p) => seen.includes(p)).length;
  const total = Object.values(got).reduce((n, a) => n + 50 + Math.round(50 * (1 - Math.min(DRAW_SHOW_MS, a.ms) / DRAW_SHOW_MS)), 0);
  if (!current) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="os-label text-[12px] text-os-chrome">ALL DONE</p>
        <p className="os-myplace__score mt-2">{total}</p>
        <p className="text-[15px] text-os-chrome mt-2">{Object.keys(got).length} of {list.length} named. The board posts when time is up.</p>
      </div>
    );
  }

  const d = byPid[current];
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || flash) return;
    if (guessHits(text, d?.checks, `${c}:${current}`)) {
      const ms = Math.min(DRAW_SHOW_MS, serverNow() - shownAt);
      const nextAnswers = { ...got, [current]: { text: text.trim().slice(0, 30), ms } };
      setAnswers(nextAnswers);
      sfxPoint();
      setFlash(`Correct! +${50 + Math.round(50 * (1 - ms / DRAW_SHOW_MS))}`);
      saveGuesses(gid, c, me.pid, nextAnswers).then(sfxSent).catch((err) => console.warn('[guesses] not saved:', err.code ?? err.message));
      setTimeout(next, 900);
    } else {
      sfxDeny();
      setText('');
    }
  };

  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between">
        <span className="os-label text-[12px] text-os-chrome">{i + 1} OF {list.length} · {nameOf(current)}</span>
        <span className="os-arcade text-os-gold text-[18px] tabular-nums">{total}</span>
      </div>
      <div className="flex justify-center mt-2 relative">
        <Sketch strokes={d?.strokes ?? ''} size={260} className="os-pad" />
        {flash && <p className="os-guess-flash os-pop">{flash}</p>}
      </div>
      <div className="os-guess-timer mt-2"><i style={{ width: `${(leftMs / DRAW_SHOW_MS) * 100}%` }} /></div>
      <form className="flex gap-2 mt-3" onSubmit={submit}>
        <input className="os-input flex-1" value={text} maxLength={30} onChange={(e) => setText(e.target.value)} placeholder="What is it?" aria-label="Your guess" autoCapitalize="none" autoComplete="off" enterKeyHint="go" />
        <Btn small type="submit" disabled={!text.trim() || Boolean(flash)}>Guess</Btn>
      </form>
      <Btn small tone="dark" className="mt-3 w-full" onClick={next} disabled={Boolean(flash)}>Skip</Btn>
    </div>
  );
}

// --- After: everyone's drawings, with their words -------------------------------------------

function Gallery({ drawings, words, me, nameOf, after }) {
  const inked = (drawings ?? []).filter((d) => (d.strokes ?? '').length > 4);
  return (
    <Section head={after ? `Today’s drawings · ${inked.length}` : 'Time. Posting the board…'}>
      {inked.length ? (
        <div className="os-gallery-grid">
          {inked.map((d) => (
            <figure key={d.id} className="os-gallery-cell">
              <Sketch strokes={d.strokes} size={128} />
              <figcaption>
                <b>{words?.[d.pid] ?? '?'}</b>
                <span>{d.pid === me.pid ? 'you' : nameOf(d.pid)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <Empty glyph="dots" title="NO DRAWINGS" />
      )}
    </Section>
  );
}
