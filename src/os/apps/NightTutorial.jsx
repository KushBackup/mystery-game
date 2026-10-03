import React from 'react';
import { FILM_SLIDES, READY, prefetchNightTutorial } from '../../data/nightTutorial';
import Tutorial from '../game/Tutorial';
import { MoveArt } from '../art/NightArt';

/**
 * How the night works (Tutorial.jsx is the pager): eight hand-drawn clips
 * (public/tutorial/night-N, drawn in splash-film/night.html) and the ready
 * card, on the night sky. The words live in data/nightTutorial.js.
 *
 * `intro` is the first time a guest opens Night in a game, before their move,
 * with the time left in the night; `replay` is the "?" in the Night bar.
 * Every phone sees the same slides, whatever its role.
 */

const SLIDES = [...FILM_SLIDES, { id: 'ready', kind: 'ready' }];

export default function NightTutorial({ mode = 'intro', endsAt = 0, onDone }) {
  return (
    <Tutorial
      slides={SLIDES}
      mode={mode}
      tone="night"
      startsAt={endsAt}
      startLabel="Ends in"
      soonLabel="Ending"
      doneLabel="To my move"
      replayLabel="Back to my move"
      onDone={onDone}
      prefetch={prefetchNightTutorial}
      renderSlide={() => <Ready mode={mode} />}
    />
  );
}

/** The last page: every role's move in a fan, one of them yours. */
const FAN = ['watch', 'protect', 'hunt', 'trace', 'whisper'];
function Ready({ mode }) {
  return (
    <div className="os-wt__ready os-nt-ready">
      <div className="os-nt-ready__fan" aria-hidden="true">
        {FAN.map((k, i) => (
          <span key={k} className="os-nt-ready__card" style={{ '--r': `${(i - 2) * 11}deg`, '--x': `${(i - 2) * 46}px`, '--y': `${Math.abs(i - 2) * 9}px` }}>
            <MoveArt kind={k} size={58} />
          </span>
        ))}
      </div>
      <h2 className="os-wt__title">{READY.title}</h2>
      <p className="os-wt__line">{mode === 'replay' ? READY.replayLine : READY.line}</p>
    </div>
  );
}
