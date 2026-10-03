/**
 * The shape of the evening: every phase, how long it lasts, what comes next.
 *
 *   lobby → casting → [ night → (recruit) → alarm → game → dawn →
 *   investigation → roundtable → (revote) → banish ] × cycles → endgame → finale
 *
 * The morning (DEEP BLUE): the night's outcome is decided when the night locks,
 * but nobody dies yet. The alarm rings on every phone, the whole room plays
 * the day's run, and only when the game locks does the host read the scores
 * and apply the deaths (engine/morning.js). Dawn is the leaderboard reveal.
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
  ALARM: 'alarm',
  GAME: 'game',
  GAME_LOCKED: 'game_locked',
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

// About 21 minutes a cycle; four or five cycles plus arrival and the Endgame fill the night.
export const DEFAULT_DURATIONS = Object.freeze({
  casting: 45 * SEC,
  night: 3 * MIN,
  recruit: 45 * SEC,
  alarm: 20 * SEC,
  // The first Word morning rings longer: DEEP BLUE shows how the game is
  // played before the cards are dealt (os/game/WordTutorial.jsx, introDay in
  // minigames.js). Every other alarm keeps the short ring.
  alarm_intro: 75 * SEC,
  game: 90 * SEC,
  // The word and drawing days (minigames.js) need longer than the run.
  game_word: 125 * SEC,
  game_draw: 140 * SEC,
  dawn: 60 * SEC,
  investigation: 8 * MIN,
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

// The day's run stops this long before the game phase ends, so the last score
// write lands before the host locks the phase and the rules refuse it.
export const GAME_GRACE_MS = 2 * SEC;

export const LOCKED = new Set([
  PHASE.NIGHT_LOCKED, PHASE.RECRUIT_LOCKED, PHASE.GAME_LOCKED, PHASE.ROUNDTABLE_LOCKED, PHASE.REVOTE_LOCKED, PHASE.ENDGAME_LOCKED,
]);

// Phases that end in a reveal, so they open with a held beat.
// The alarm and the run start on the same instant on every phone, like a reveal.
export const REVEALS = new Set([PHASE.CASTING, PHASE.ALARM, PHASE.GAME, PHASE.DAWN, PHASE.BANISH, PHASE.FINALE]);

/** How long a phase holds before its reveal flips. */
export const revealLead = (phase) => (REVEALS.has(phase) ? REVEAL_LEAD_MS : 0);

/** The locked beat that closes an action phase, or null if none. */
export function lockFor(phase) {
  return {
    [PHASE.NIGHT]: PHASE.NIGHT_LOCKED,
    [PHASE.RECRUIT]: PHASE.RECRUIT_LOCKED,
    [PHASE.GAME]: PHASE.GAME_LOCKED,
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
    case PHASE.ALARM:
      return { phase: PHASE.GAME, cycle: game.cycle };
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

/** How long the game phase runs for the day's game: `game_word`, `game_draw`, or the run's `game`. */
export function gameSpan(kind, durations = DEFAULT_DURATIONS) {
  const key = `game_${kind}`;
  return durations[key] ?? DEFAULT_DURATIONS[key] ?? durations.game ?? DEFAULT_DURATIONS.game;
}

/** How long the alarm rings: longer on the morning that teaches Word (`intro`). */
export function alarmMs(durations = DEFAULT_DURATIONS, intro = false) {
  if (intro) return durations.alarm_intro ?? DEFAULT_DURATIONS.alarm_intro;
  return durations.alarm ?? DEFAULT_DURATIONS.alarm;
}

/** A phase's configured length in ms, without the reveal hold. */
export function phaseMs(phase, durations = DEFAULT_DURATIONS, kind = 'run', intro = false) {
  if (phase === PHASE.GAME && kind && kind !== 'run') return gameSpan(kind, durations);
  if (phase === PHASE.ALARM) return alarmMs(durations, intro);
  return durations[phase] ?? 0;
}

/**
 * Timing fields to write alongside a new phase. `kind` is the day's game, for
 * the game phase; `intro` is true on the alarm of the first Word morning.
 */
export function phaseTiming(phase, now, durations = DEFAULT_DURATIONS, kind = 'run', intro = false) {
  const ms = phaseMs(phase, durations, kind, intro);
  const lead = revealLead(phase);
  const revealAt = lead ? now + lead : 0;
  return {
    phaseStartedAt: now,
    phaseEndsAt: ms ? now + ms + lead : 0,
    revealAt,
  };
}

/** Milliseconds left in the current phase, clamped at 0. */
export function phaseRemaining(game, now) {
  if (!game?.phaseEndsAt) return 0;
  return Math.max(0, game.phaseEndsAt - now);
}
