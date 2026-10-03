import React from 'react';
import { FILM_SLIDES, READY, prefetchGhostTutorial } from '../data/ghostTutorial';
import Tutorial from './game/Tutorial';
import Glyph from './icons/Glyph';

/**
 * Welcome to the spirit world (Tutorial.jsx is the pager): six hand-drawn
 * clips (public/tutorial/ghost-N, drawn in splash-film/ghost.html) and the
 * ready card, on the night sky. The words live in data/ghostTutorial.js.
 *
 * `intro` plays inside the death screen (TakenScreen), right after SIGNAL
 * LOST; `replay` is Help's Ghost topic.
 */

const SLIDES = [...FILM_SLIDES, { id: 'ready', kind: 'ready' }];

export default function GhostTutorial({ mode = 'intro', onDone }) {
  return (
    <Tutorial
      slides={SLIDES}
      mode={mode}
      tone="night"
      doneLabel="To my phone"
      replayLabel="Done"
      onDone={onDone}
      prefetch={prefetchGhostTutorial}
      renderSlide={() => (
        <div className="os-wt__ready os-nt-ready">
          <div className="inline-grid place-items-center w-24 h-24 mx-auto rounded-3xl bg-os-steel/40 text-os-foam os-gt-float" aria-hidden="true"><Glyph name="ghost" size={54} /></div>
          <h2 className="os-wt__title">{READY.title}</h2>
          <p className="os-wt__line">{mode === 'replay' ? READY.replayLine : READY.line}</p>
        </div>
      )}
    />
  );
}
