/**
 * The shape of the evening: every phase, how long it lasts, what comes next.
 *
 *   lobby → casting → [ night → (recruit) → dawn → investigation →
 *   roundtable → (revote) → banish ] × cycles → endgame → finale
 *
 * `*_locked` phases are the host's resolution beats. The host writes the
 * locked phase first, which makes the Firestore rules refuse any further
 * action or vote. Then it reads the frozen inputs, resolves them, and writes
 * the outcome together with the next phase in one transaction. Players only
 * ever see a locked phase as "…" for a second or two.
 *
 * Every timed phase stores `phaseEndsAt` as an absolute instant on the host's
 * clock, for the same reason the round clock did (see lib/roundTimer.js): a
 * phone that wakes, reloads or joins late lands on the right second. Reveal
 * phases also carry `revealAt`, the instant every phone flips at once.
 */

export const PHASE = Object.freeze({
  LOBBY: 'lobby',
  CASTING: 'casting',
  NIGHT: 'night',
  NIGHT_LOCKED: 'night_locked',
  RECRUIT: 'recruit',
  RECRUIT_LOCKED: 'recruit_locked',
  DAWN: 'dawn',
  INVESTIGATION: 'investigation',
  ROUNDTABLE: 'roundtable',
  ROUNDTABLE_LOCKED: 'roundtable_locked',
  REVOTE: 'revote',
  REVOTE_LOCKED: 'revote_locked',
  BANISH: 'banish',
  ENDGAME: 'endgame',
  ENDGAME_LOCKED: 'endgame_locked',
  FINALE: 'finale',
});

const MIN = 60 * 1000;
const SEC = 1000;

// About 21 minutes a cycle; five cycles plus arrival and the Endgame fill two hours.
export const DEFAULT_DURATIONS = Object.freeze({
  casting: 45 * SEC,
  night: 3 * MIN,
  recruit: 45 * SEC,
  dawn: 60 * SEC,
  investigation: 10 * MIN,
  roundtable: 6 * MIN,
  revote: 60 * SEC,
  banish: 45 * SEC,
  endgame: 5 * MIN,
});

export const DEFAULT_CYCLES = 5;

// Endgame banishments after the last cycle. Survivors and ghosts vote; any
// Killer still standing afterwards wins it for the Killers. Two, per the sim.
export const ENDGAME_ROUNDS = 2;

// How long every phone holds "…" before a reveal flips, so the room gasps together.
export const REVEAL_LEAD_MS = 4 * SEC;

export const LOCKED = new Set([
  PHASE.NIGHT_LOCKED, PHASE.RECRUIT_LOCKED, PHASE.ROUNDTABLE_LOCKED, PHASE.REVOTE_LOCKED, PHASE.ENDGAME_LOCKED,
]);

// Phases that end in a reveal, so they open with a held beat.
export const REVEALS = new Set([PHASE.CASTING, PHASE.DAWN, PHASE.BANISH, PHASE.FINALE]);

/** The locked beat that closes an action phase, or null if none. */
export function lockFor(phase) {
  return {
    [PHASE.NIGHT]: PHASE.NIGHT_LOCKED,
    [PHASE.RECRUIT]: PHASE.RECRUIT_LOCKED,
    [PHASE.ROUNDTABLE]: PHASE.ROUNDTABLE_LOCKED,
    [PHASE.REVOTE]: PHASE.REVOTE_LOCKED,
    [PHASE.ENDGAME]: PHASE.ENDGAME_LOCKED,
  }[phase] ?? null;
}

/**
 * What follows `phase` when nothing needs resolving (the untimed and reveal
 * phases). Locked phases are advanced by the host's resolver, which knows the
 * outcome (a win, a tie, a recruit), so they are not handled here.
 */
export function nextPlainPhase(game, { maxCycles = DEFAULT_CYCLES } = {}) {
  switch (game.phase) {
    case PHASE.LOBBY:
      return { phase: PHASE.CASTING, cycle: 0 };
    case PHASE.CASTING:
      return { phase: PHASE.NIGHT, cycle: 1 };
    case PHASE.DAWN:
      return game.winner ? { phase: PHASE.FINALE, cycle: game.cycle } : { phase: PHASE.INVESTIGATION, cycle: game.cycle };
    case PHASE.INVESTIGATION:
      return { phase: PHASE.ROUNDTABLE, cycle: game.cycle };
    case PHASE.BANISH:
      if (game.winner) return { phase: PHASE.FINALE, cycle: game.cycle };
      if (game.cycle >= maxCycles) return { phase: PHASE.ENDGAME, cycle: game.cycle };
      return { phase: PHASE.NIGHT, cycle: game.cycle + 1 };
    default:
      return null;
  }
}

/** Timing fields to write alongside a new phase. */
export function phaseTiming(phase, now, durations = DEFAULT_DURATIONS) {
  const ms = durations[phase] ?? 0;
  const revealAt = REVEALS.has(phase) ? now + REVEAL_LEAD_MS : 0;
  return {
    phaseStartedAt: now,
    phaseEndsAt: ms ? now + ms + (revealAt ? REVEAL_LEAD_MS : 0) : 0,
    revealAt,
  };
}

/** Milliseconds left in the current phase, clamped at 0. */
export function phaseRemaining(game, now) {
  if (!game?.phaseEndsAt) return 0;
  return Math.max(0, game.phaseEndsAt - now);
}
