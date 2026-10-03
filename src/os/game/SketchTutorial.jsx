import React, { useRef, useState } from 'react';
import { FILM_SLIDES, PRACTICE, READY, prefetchSketchTutorial } from '../../data/sketchTutorial';
import { matchesWord, guessPoints } from '../../lib/engine/minigames.js';
import { useServerNow } from '../../hooks/useKillers';
import { serverNow } from '../../lib/clockSkew';
import { sfxPoint } from '../sfx';
import { Btn } from '../ui';
import Tutorial from './Tutorial';
import { CardWave } from './wordParts';
import { Polaroid, CorrectStamp, SpeedBar, GuessForm } from './sketchParts';
import { useFit } from './useFit';

/**
 * How Sketch is played (Tutorial.jsx is the pager): six hand-drawn clips
 * (public/tutorial, drawn in splash-film/sketch.html), a guess practice, and
 * the ready card. The words live in data/sketchTutorial.js.
 *
 * `intro` is the first Sketch morning's longer alarm (minigames.js introDay):
 * DrawGame closes it itself when the pens come out. `replay` is the "?" in a
 * running game.
 */

const SLIDES = [...FILM_SLIDES, { id: 'practice', kind: 'practice' }, { id: 'ready', kind: 'ready' }];

export default function SketchTutorial({ mode = 'intro', startsAt = 0, onDone }) {
  return (
    <Tutorial
      slides={SLIDES}
      mode={mode}
      startsAt={startsAt}
      startLabel="Pens out in"
      soonLabel="Pens out any second"
      onDone={onDone}
      prefetch={prefetchSketchTutorial}
      renderSlide={(slide) => (slide.kind === 'practice' ? <Practice /> : <Ready mode={mode} />)}
    />
  );
}

/**
 * The practice guess: the same polaroid, speed bar and guess box as the game,
 * on a teapot. Nothing is saved. Time runs out the way it does in the game,
 * and "Try again" deals the same drawing back.
 */
function Practice() {
  const [round, setRound] = useState(0);
  const [shownAt, setShownAt] = useState(() => serverNow());
  const [hit, setHit] = useState(null); // ms it took, once right
  const end = shownAt + PRACTICE.showMs;
  const now = useServerNow(hit == null ? end + 250 : 0, 200);
  const timeUp = hit == null && now >= end;

  const guess = (text) => {
    if (!matchesWord(text, PRACTICE.answer)) return false;
    sfxPoint();
    setHit(Math.min(PRACTICE.showMs, serverNow() - shownAt));
    return true;
  };
  const again = () => {
    setHit(null);
    setShownAt(serverNow());
    setRound((r) => r + 1);
  };

  const stage = useRef(null);
  // The dots, the lines, the speed bar, the guess box and the footer stay on screen with it.
  const size = useFit(stage, { reserve: 412, min: 140, max: 216 });
  return (
    <div className="os-wt__practice os-sb-practice">
      <h2 className="os-wt__title">{PRACTICE.title}</h2>
      <p className="os-wt__line">{PRACTICE.line}</p>
      <div className="os-sb-stage os-sb-stage--practice" ref={stage}>
        <Polaroid
          key={round}
          strokes={PRACTICE.strokes}
          size={size}
          sub={`by ${PRACTICE.by}`}
          tilt={-1.5}
          stamp={hit != null ? <CorrectStamp points={guessPoints(hit)} /> : null}
        />
      </div>
      <SpeedBar shownAt={shownAt} now={now} frozen={hit ?? (timeUp ? PRACTICE.showMs : null)} />
      {hit != null ? (
        <p className="os-wt__why is-done" aria-live="polite"><b>{PRACTICE.right(guessPoints(hit))}</b><br />{PRACTICE.rightLine}</p>
      ) : timeUp ? (
        <div className="os-sb-practice__again">
          <p className="os-wt__why" aria-live="polite">{PRACTICE.timeUp}</p>
          <Btn small onClick={again}>{PRACTICE.again}</Btn>
        </div>
      ) : (
        <GuessForm key={round} onGuess={guess} />
      )}
    </div>
  );
}

/** The last page: the word card is face down and on its way. */
function Ready({ mode }) {
  return (
    <div className="os-wt__ready">
      <div className="os-wb-card os-wb-card--still" aria-hidden="true">
        <span className="os-wb-card__turn">
          <span className="os-wb-card__face os-wb-card__back">
            <CardWave />
            <span className="os-wb-card__peek">Your word</span>
          </span>
        </span>
      </div>
      <h2 className="os-wt__title">{READY.title}</h2>
      <p className="os-wt__line">{mode === 'replay' ? READY.replayLine : READY.line}</p>
    </div>
  );
}
