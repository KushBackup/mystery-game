import React from 'react';
import { BRIEF_HIDDEN_FROM_ROUND } from '../../data/screenGuide';

/**
 * The screen note — a one-line explanation of what the screen the player is
 * looking at is actually for (DESIGN_LANGUAGE.md §6.10).
 *
 * It is a tooltip in behaviour: anchored to the title above it by a caret,
 * highlighted, and temporary — it clears itself from Round 02, because by then
 * the room knows the app.
 *
 * It is *paper* rather than a chrome callout for two reasons. Aged bone on ink
 * is the highest-contrast thing on the screen, so it reads as highlighted
 * without any accent at all; and that leaves the screen's one signal focal
 * point (§10) where it belongs — on the decoder, the ballot, the reveal — instead
 * of spending it on onboarding. Diegetically it's a note the case officer
 * pinned to the file, which is why the body is in the note face.
 */
export const ScreenBrief = ({ note, currentRound = 0, className = '' }) => {
  if (!note?.brief || currentRound >= BRIEF_HIDDEN_FROM_ROUND) return null;

  return (
    <aside
      role="note"
      className={`er-brief er-bone er-bone--aged er-rotL er-land ${className}`}
    >
      <span className="er-brief__caret" aria-hidden="true" />

      <div className="flex items-baseline justify-between gap-3">
        {/* Both labels have to sit on one line at 390px, so the pair is kept
            short — "What this screen is" wrapped, which cost a whole line. */}
        <p className="er-bone-label">{note.briefLabel || 'What this is'}</p>
        {/* Brass would fail contrast on bone (§2.3), so the round number here
            stays in the stamp colour the other paper footers use. */}
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 shrink-0">
          Clears at Round {String(BRIEF_HIDDEN_FROM_ROUND).padStart(2, '0')}
        </p>
      </div>

      <p className="er-brief__body">{note.brief}</p>
    </aside>
  );
};
