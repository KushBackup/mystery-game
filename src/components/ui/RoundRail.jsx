import React from 'react';

/**
 * The round indicator as a rail rather than a number alone (DESIGN_LANGUAGE.md
 * §7, "round advance: the rail fills to the new round").
 *
 * One segment per round. Past rounds are `bone-aged` and the live round is
 * `signal` — the same state channel the cards use (§6.2), so it introduces a
 * shape but not a new idiom and not a new hue.
 *
 * `aria-hidden` on purpose: the round number sits beside it as real text, so to
 * a screen reader this is duplicate information rendered as seven empty spans.
 */
export const RoundRail = ({ currentRound = 0, total = 7, className = '' }) => (
  <div className={`er-rail ${className}`} aria-hidden="true">
    {Array.from({ length: total }, (_, i) => (
      <span
        key={i}
        className={`er-rail__seg ${
          i < currentRound ? 'er-rail__seg--past' : i === currentRound ? 'er-rail__seg--now' : ''
        }`}
      />
    ))}
  </div>
);
