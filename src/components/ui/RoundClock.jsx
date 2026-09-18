import React from 'react';
import { useRoundClock } from '../../hooks/useRoundClock';
import { formatClock } from '../../lib/roundTimer';

/**
 * The round clock, as the player sees it (DESIGN_LANGUAGE.md §6.6c, App.css §13c).
 *
 * It sits directly under the round numeral on the chrome rail, and on the board's
 * rail on the hub — the two places in the app that already answer "where are we?",
 * because "how long have I got?" is the same question asked twice.
 *
 * Three decisions worth keeping:
 *
 * **It is mono, not brass.** Brass is for numerals only (§2.1), and it is already
 * spoken for one line above by the round figure. Two brass numbers stacked in a
 * 64px rail read as one two-line number. The clock is an instrument rather than a
 * count, so it takes the chrome voice — mono, tabular, bone — and spends its
 * colour on state instead: signal for the last minute, and nothing before it.
 *
 * **Idle renders nothing.** Every device holds IDLE_TIMER before the first
 * snapshot lands and for every round the host chooses not to time, and a dead
 * 30:00 on the rail is worse than no clock at all — it looks stopped, and a
 * stopped clock is the one thing a countdown must never look like. The host
 * console passes `showIdle` because over there the armed length is the thing
 * being set.
 *
 * **The urgency animation is keyed, not looped.** See App.css §13c: each second
 * remounts the digits and plays one pop. §7.1 reserves the infinite pulse for a
 * genuine sustained alarm, and this is the app's first and only one — but even
 * here it is written as a bounded sequence of one-shots that ends when the round
 * does, not as `infinite`.
 */

// What the clock calls itself, per phase. `done` deliberately does not say
// "over": the host still decides when the round ends, and a clock that announced
// the round was finished would be making a promise the host has to keep.
const PHASE_LABEL = {
  idle: 'Round clock',
  running: 'Time left',
  soon: 'Time left',
  final: 'Time left',
  paused: 'Paused',
  done: 'Time up',
};

// Said once, to a screen reader, at the two moments that matter. Every other
// phase is silent: a live region that spoke every second would make the app
// unusable, and the digits below are hidden from the reader for the same reason.
// `soon` and `final` share a string on purpose — a change of text is what fires
// a live region, so giving them separate copy would announce twice.
const PHASE_ANNOUNCEMENT = {
  soon: 'One minute left in this round.',
  final: 'One minute left in this round.',
  done: 'Time is up for this round. Wait for the host.',
};

export const RoundClock = ({
  timer,
  // 'rail' is the player's chrome; 'console' is the host's, where the figure is
  // the control rather than a status line beside one.
  variant = 'rail',
  showIdle = false,
  className = '',
}) => {
  const { phase, text, secondsLeft } = useRoundClock(timer);

  if (phase === 'idle' && !showIdle) return null;

  // An idle clock shows what it is armed with, not what is left of nothing.
  const digits = phase === 'idle' ? formatClock(timer.durationMs) : text;

  // Only the last minute animates, so only the last minute needs remounting.
  // Keying the whole run would churn a text node once a second for half an hour
  // on 69 devices to play an animation that isn't declared for those phases.
  const ticking = phase === 'soon' || phase === 'final';

  return (
    <div className={`er-clock er-clock--${phase} ${variant === 'console' ? 'er-clock--console' : ''} ${className}`}>
      <span className="er-clock__label">{PHASE_LABEL[phase]}</span>

      {/* Hidden from the reader — the announcement below carries it. A timer
          role on visible per-second digits is either silent or intolerable. */}
      <span key={ticking ? secondsLeft : phase} className="er-clock__digits" aria-hidden="true">
        {digits}
      </span>

      <span className="sr-only" role="status">
        {PHASE_ANNOUNCEMENT[phase] || ''}
      </span>
    </div>
  );
};
