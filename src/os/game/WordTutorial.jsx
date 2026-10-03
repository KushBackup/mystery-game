import React, { useState } from 'react';
import { FILM_SLIDES, PRACTICE, READY, prefetchTutorial } from '../../data/wordTutorial';
import { sfxStar, sfxUnstar, sfxDeny } from '../sfx';
import Tutorial from './Tutorial';
import { WallNote, PickTray, CardWave } from './wordParts';
import { noteLook } from './wordLook';

/**
 * How Word is played (Tutorial.jsx is the pager): six hand-drawn clips
 * (public/tutorial, drawn in splash-film/word.html), a practice wall, and the
 * ready card. The words live in data/wordTutorial.js.
 *
 * `intro` is the first Word morning's longer alarm (minigames.js introDay):
 * WordGame closes it itself when the cards are dealt. `replay` is the "?" in
 * a running game.
 */

const PICKS = 3;

const SLIDES = [...FILM_SLIDES, { id: 'practice', kind: 'practice' }, { id: 'ready', kind: 'ready' }];

export default function WordTutorial({ mode = 'intro', cardsAt = 0, onDone }) {
  return (
    <Tutorial
      slides={SLIDES}
      mode={mode}
      startsAt={cardsAt}
      startLabel="Cards in"
      soonLabel="Cards any second"
      onDone={onDone}
      prefetch={prefetchTutorial}
      renderSlide={(slide) => (slide.kind === 'practice' ? <Practice /> : <Ready mode={mode} />)}
    />
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
