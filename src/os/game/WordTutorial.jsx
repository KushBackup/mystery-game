import React, { useEffect, useRef, useState } from 'react';
import { FILM_SLIDES, PRACTICE, READY, prefetchTutorial } from '../../data/wordTutorial';
import { useServerNow } from '../../hooks/useKillers';
import { prefersLessMotion } from '../nav';
import { sfxTap, sfxStar, sfxUnstar, sfxDeny } from '../sfx';
import { Btn } from '../ui';
import { WallNote, PickTray, CardWave } from './wordParts';
import { noteLook } from './wordLook';

/**
 * How Word is played, as a paged slideshow on the board's paper: six
 * hand-drawn clips (public/tutorial, drawn in splash-film/word.html), a
 * practice wall, and the ready card. The words live in data/wordTutorial.js.
 *
 * `intro` is the first Word morning's longer alarm (minigames.js introDay):
 * the slides fill DEEP BLUE until the guest finishes or skips them, with a
 * countdown to the cards. WordGame closes it itself when the cards are dealt,
 * so nobody misses the game for the lesson. `replay` is the "?" in a running
 * game: the same slides, and the last one goes back to the game.
 *
 * Tap the picture or Next to go on; swipe either way. Horizontal gestures are
 * ours (`touch-action: pan-y`), or Chrome's edge swipe would take the page
 * back (Lessons 2026-08-05). Reduced motion, or a browser that won't play the
 * clip (iOS Low Power Mode), shows each clip's last frame instead.
 */

const SWIPE_PX = 48;
const GHOST_CLICK_MS = 450;
const PICKS = 3;

const SLIDES = [...FILM_SLIDES, { id: 'practice', kind: 'practice' }, { id: 'ready', kind: 'ready' }];

/** A state update that turns `d` pages (clamped), remembering the direction for the slide-in. */
const turn = (d) => ({ i }) => ({ i: Math.max(0, Math.min(SLIDES.length - 1, i + d)), dir: d });

export default function WordTutorial({ mode = 'intro', cardsAt = 0, onDone }) {
  const [at, setAt] = useState({ i: 0, dir: 1 });
  const slide = SLIDES[at.i];
  const last = at.i === SLIDES.length - 1;
  const swipedAt = useRef(0);
  const touch = useRef(null);

  useEffect(() => { prefetchTutorial(); }, []);

  const go = (d) => setAt(turn(d));
  const next = () => { sfxTap(); go(1); };
  const back = () => { sfxTap(); go(-1); };
  const finish = () => { sfxTap(); onDone(); };

  // Arrow keys, for a laptop tab; Escape leaves a replay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') setAt(turn(1));
      else if (e.key === 'ArrowLeft') setAt(turn(-1));
      else if (e.key === 'Escape' && mode === 'replay') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, onDone]);

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
    <div className={`os-wt ${mode === 'replay' ? 'os-wt--replay' : ''}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="os-wt__top">
        <ol className="os-wt__dots" aria-label={`Page ${at.i + 1} of ${SLIDES.length}`}>
          {SLIDES.map((s, k) => <li key={s.id} className={k === at.i ? 'is-on' : k < at.i ? 'is-past' : ''} />)}
        </ol>
        {mode === 'intro' && <CardsIn at={cardsAt} />}
        {!last && (
          <button type="button" className="os-wt__skip" onClick={finish}>{mode === 'replay' ? 'Close' : 'Skip'}</button>
        )}
      </div>

      <div key={slide.id} className={`os-wt__stage ${at.dir < 0 ? 'os-wt__stage--back' : ''}`}>
        {slide.kind === 'film' && <FilmSlide slide={slide} onTap={tapPicture} />}
        {slide.kind === 'practice' && <Practice />}
        {slide.kind === 'ready' && <Ready mode={mode} />}
      </div>

      <div className="os-wt__foot">
        {at.i > 0 && (
          <button type="button" className="os-wt__back" onClick={back} aria-label="Back">
            <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" /></svg>
          </button>
        )}
        <Btn onClick={last ? onDone : () => go(1)} tone={last ? 'green' : 'blue'}>
          {last ? (mode === 'replay' ? 'Back to the game' : 'Got it') : 'Next'}
        </Btn>
      </div>
    </div>
  );
}

/** "Cards in 0:41", counting down to the instant the cards are dealt. */
function CardsIn({ at }) {
  const now = useServerNow(at ? at + 1000 : 0, 500);
  if (!at) return null;
  const s = Math.max(0, Math.ceil((at - now) / 1000));
  return (
    <span className="os-wt__clock" role="timer" aria-live="off">
      {s > 0 ? <>Cards in <b>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></> : 'Cards any second'}
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

/** The practice wall: pick three, and meet the clue that came from the hint. Nothing is saved. */
function Practice() {
  const [picks, setPicks] = useState([]);
  const [last, setLast] = useState(null);
  const [shake, setShake] = useState(0);
  const done = picks.length >= PICKS;
  const fooled = picks.includes('crunchy');
  const byId = Object.fromEntries(PRACTICE.notes.map((n) => [n.id, n]));

  const toggle = (id) => {
    if (picks.includes(id)) {
      sfxUnstar();
      setPicks(picks.filter((p) => p !== id));
      setLast(null);
      return;
    }
    if (done) {
      sfxDeny();
      setShake((n) => n + 1);
      return;
    }
    sfxStar();
    setPicks([...picks, id]);
    setLast(id);
  };

  const left = PICKS - picks.length;
  const say = done
    ? `${fooled ? PRACTICE.doneFooled : PRACTICE.doneClean} ${PRACTICE.reveal}`
    : last ? byId[last].why : '';

  return (
    <div className="os-wt__practice">
      <h2 className="os-wt__title">{PRACTICE.title}</h2>
      <p className="os-wt__line">{PRACTICE.line}</p>
      <PickTray used={picks.length} shake={shake} line={done ? 'All 3 placed. Tap one to take it back.' : `${left} ${left === 1 ? 'star' : 'stars'} left`} />
      <ol className="os-wb-notes os-wb-notes--practice">
        {PRACTICE.notes.map((n, k) => (
          <li key={n.id}>
            <WallNote
              n={k + 1}
              clue={n.clue}
              look={noteLook(`practice-${n.id}`)}
              canPick
              picked={picks.includes(n.id)}
              onPick={() => toggle(n.id)}
              tag={done && n.fake ? 'only saw “A snack”' : null}
            />
          </li>
        ))}
      </ol>
      <p className={`os-wt__why ${done ? 'is-done' : ''}`} aria-live="polite">{say}</p>
    </div>
  );
}

/** The last page: the card is face down and on its way. */
function Ready({ mode }) {
  return (
    <div className="os-wt__ready">
      <div className="os-wb-card os-wb-card--still" aria-hidden="true">
        <span className="os-wb-card__turn">
          <span className="os-wb-card__face os-wb-card__back">
            <CardWave />
            <span className="os-wb-card__peek">Tap to peek</span>
          </span>
        </span>
      </div>
      <h2 className="os-wt__title">{READY.title}</h2>
      <p className="os-wt__line">{mode === 'replay' ? READY.replayLine : READY.line}</p>
    </div>
  );
}
