/**
 * The round clock — the model, in one place.
 *
 * The host used to move the room on by feel alone: advance the round when the
 * conversation flagged. That works for the host and for nobody else, because the
 * other 69 people in the room have no idea how long they have left to trade
 * codes. The clock is the answer — one countdown per round, started by the host,
 * broadcast to every device through the same `gameState/current` document as the
 * round itself.
 *
 * Everything here is pure. The host console owns every transition (nothing on a
 * player's phone may write a timer), the hook in hooks/useRoundClock.js owns the
 * ticking, and components/ui/RoundClock.jsx owns the pixels.
 *
 * --- Why the clock is stored as an absolute end time -----------------------
 *
 * `endsAt` is an epoch millisecond on the *host's* clock, and every device
 * subtracts its own `Date.now()` from it. The obvious alternative — broadcasting
 * "26 minutes remaining" and counting down locally from the moment the snapshot
 * lands — is immune to clock skew but wrong for the case that actually happens
 * at an event: a phone that joins late, reloads, or wakes from sleep gets the
 * same snapshot everybody else got at the start of the round, and would restart
 * its countdown from the top. Absolute time is right for every one of those.
 *
 * The cost is that a device whose clock is wrong reads the clock wrong. Phones
 * take their time from the network, so this is small in practice, and
 * `remainingMs` below clamps to the round's own duration — so the worst a
 * badly-set clock can do is show a countdown that starts late, never one that
 * shows 48 minutes of a 30 minute round. The host's spoken word governs the room
 * either way.
 */

// 30 minutes — the default round length. Seven rounds of roughly this is the
// shape the run sheet in data/gameData.js already describes.
export const DEFAULT_ROUND_MS = 30 * 60 * 1000;

// Every completed round is followed by a ballot. Its duration is stored beside
// the round timer, so the host can configure it before the clock ends or adjust
// a ballot already on screen without creating a second shared timer document.
export const DEFAULT_VOTING_DURATION_MS = 5 * 60 * 1000;

// What the host can arm the clock with. The bottom two are deliberately absurd
// for a real round — they exist so the host can prove the thing works, and
// rehearse the last-ten-seconds moment, without sitting through half an hour.
export const TIMER_PRESETS = [
  { id: 'r30', label: '30 min', ms: 30 * 60 * 1000 },
  { id: 'r15', label: '15 min', ms: 15 * 60 * 1000 },
  { id: 'r01', label: '1 min', ms: 60 * 1000 },
  { id: 's10', label: '10 sec', ms: 10 * 1000 },
];

export const VOTING_PRESETS = [
  { id: 'v05', label: '5 min', ms: 5 * 60 * 1000 },
  { id: 'v03', label: '3 min', ms: 3 * 60 * 1000 },
  { id: 'v01', label: '1 min', ms: 60 * 1000 },
  { id: 'vs10', label: '10 sec', ms: 10 * 1000 },
];

// The two urgency thresholds. SOON is where the digits turn signal and start
// ticking; FINAL is where the tick becomes a push. Both are read here and turned
// into the one class the clock wears, never duplicated in the stylesheet.
export const CLOCK_SOON_MS = 60 * 1000;
export const CLOCK_FINAL_MS = 10 * 1000;

// A clock that has never been started. Also what every device holds before the
// first snapshot lands, which is why it must render as *nothing* rather than as
// a full 30:00 — see components/ui/RoundClock.jsx.
export const IDLE_TIMER = Object.freeze({
  endsAt: 0,
  remainingMs: 0,
  durationMs: DEFAULT_ROUND_MS,
  votingDurationMs: DEFAULT_VOTING_DURATION_MS,
  round: 0,
});

// The four states, and how the two stored numbers encode them:
//
//   idle     endsAt 0, remainingMs 0   — armed at `durationMs`, not started
//   running  endsAt > 0                — counting down to that instant
//   paused   endsAt 0, remainingMs > 0 — frozen with that much left
//   done     endsAt > 0, now >= endsAt — ran out; still 'running' in storage
//
// Done is a *reading*, not a stored state: nothing writes when a clock expires,
// because 69 devices all noticing the same instant must not become 69 writes.
export const isRunning = (timer) => timer.endsAt > 0;
export const isPaused = (timer) => timer.endsAt === 0 && timer.remainingMs > 0;
export const isIdle = (timer) => timer.endsAt === 0 && timer.remainingMs === 0;

// --- Storage ---------------------------------------------------------------
//
// Five flat fields rather than one nested `roundTimer` map, because `updateDoc`
// merges fields but *replaces* maps: a nested object would have to be written
// whole by every call that touches the round, and one stale copy would silently
// undo a start. See firebase/config.js.

export const readTimer = (gameState = {}) => ({
  endsAt: Number(gameState.roundTimerEndsAt) || 0,
  remainingMs: Number(gameState.roundTimerRemainingMs) || 0,
  durationMs: Number(gameState.roundTimerDurationMs) || DEFAULT_ROUND_MS,
  votingDurationMs: Number(gameState.roundTimerVotingDurationMs) || DEFAULT_VOTING_DURATION_MS,
  round: Number(gameState.roundTimerRound) || 0,
});

export const writeTimer = (timer) => ({
  roundTimerEndsAt: timer.endsAt,
  roundTimerRemainingMs: timer.remainingMs,
  roundTimerDurationMs: timer.durationMs,
  roundTimerVotingDurationMs: timer.votingDurationMs ?? DEFAULT_VOTING_DURATION_MS,
  roundTimerRound: timer.round,
});

export const votingDurationMs = (timer) => timer.votingDurationMs || DEFAULT_VOTING_DURATION_MS;

// --- Reading the clock -----------------------------------------------------

/**
 * Milliseconds left, clamped to [0, durationMs].
 *
 * The upper clamp is the guard against a device whose clock is behind the
 * host's: without it, a phone ten minutes slow would show 40:00 of a 30:00
 * round. With it, it simply sits at 30:00 until the true remainder catches up.
 */
export const remainingMs = (timer, now = Date.now()) => {
  const raw = isRunning(timer) ? timer.endsAt - now : timer.remainingMs;
  return Math.max(0, Math.min(raw, timer.durationMs));
};

/**
 * What the clock is doing, as one word — the thing both the CSS class and the
 * label are derived from, so the two can never disagree.
 */
export const clockPhase = (timer, now = Date.now()) => {
  if (isIdle(timer)) return 'idle';
  if (isPaused(timer)) return 'paused';

  const left = remainingMs(timer, now);
  if (left <= 0) return 'done';
  if (left <= CLOCK_FINAL_MS) return 'final';
  if (left <= CLOCK_SOON_MS) return 'soon';
  return 'running';
};

/**
 * The automatic ballot phase for a round.
 *
 * A ballot only belongs to the round that armed the clock. Advancing the room
 * immediately points at the new timer, which drops the old tally and starts
 * the next investigation period without any separate cleanup write.
 */
export const votingPhase = (timer, currentRound, now = Date.now()) => {
  if (!isRunning(timer) || timer.round !== currentRound || now < timer.endsAt) return 'idle';
  return now < timer.endsAt + votingDurationMs(timer) ? 'open' : 'results';
};

/**
 * MM:SS. Rounds *up*, so the last second of the round reads 00:01 and 00:00
 * means the round is genuinely over rather than "less than a second left".
 * Minutes are padded to two but never clipped, so a mis-set duration shows up
 * as a wrong number instead of a wrapped one.
 */
export const formatClock = (ms) => {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- Transitions (host only) ----------------------------------------------
//
// Each returns a whole new timer. The console writes the result; nothing here
// touches Firestore, so every one of these can be checked by reading it.

/** Start (or restart) the clock for `round` at `ms`, defaulting to what it is armed with. */
export const startTimer = (timer, round, now = Date.now(), ms = timer.durationMs) => ({
  endsAt: now + ms,
  remainingMs: 0,
  durationMs: ms,
  votingDurationMs: votingDurationMs(timer),
  round,
});

/** Freeze it. A no-op on a clock that isn't running, so a double tap is safe. */
export const pauseTimer = (timer, now = Date.now()) =>
  isRunning(timer)
    ? { ...timer, endsAt: 0, remainingMs: remainingMs(timer, now) }
    : timer;

/** Unfreeze it, giving back exactly what was left. */
export const resumeTimer = (timer, now = Date.now()) =>
  isPaused(timer)
    ? { ...timer, endsAt: now + timer.remainingMs, remainingMs: 0 }
    : timer;

/** Back to armed-but-not-started, keeping the length the host chose. */
export const clearTimer = (timer, round = timer.round) => ({
  endsAt: 0,
  remainingMs: 0,
  durationMs: timer.durationMs,
  votingDurationMs: votingDurationMs(timer),
  round,
});

/**
 * Arm a different length.
 *
 * On a live running clock this restarts immediately at the new length rather
 * than queueing it for the next round — which is the whole point of the 1 min
 * and 10 sec presets. An expired clock is different: it is armed at the new
 * length but remains stopped, letting the host set up the next round cleanly.
 */
export const setTimerDuration = (timer, ms, round = timer.round, now = Date.now()) => {
  // An expired clock still has an end instant in storage, but it is no longer
  // actively timing a round. Treat it as stopped so the host can arm the next
  // round's duration without unexpectedly restarting the room mid-ballot.
  if (isRunning(timer) && remainingMs(timer, now) > 0) return startTimer(timer, round, now, ms);
  if (isPaused(timer)) return { endsAt: 0, remainingMs: ms, durationMs: ms, votingDurationMs: votingDurationMs(timer), round };
  return { endsAt: 0, remainingMs: 0, durationMs: ms, votingDurationMs: votingDurationMs(timer), round };
};

/** Change the ballot length without disturbing the current round clock. */
export const setVotingDuration = (timer, ms) => ({ ...timer, votingDurationMs: ms });

/**
 * What the clock should be when the host moves the room to `round`.
 *
 * A live clock restarts at full length for the new round — "skip to the next
 * round" means the next round's time starts now. A stopped or expired clock
 * stays stopped, so the host can set its next length before deliberately
 * starting it for the room.
 */
export const timerForRound = (timer, round, now = Date.now()) =>
  isRunning(timer) && remainingMs(timer, now) > 0
    ? startTimer(timer, round, now)
    : clearTimer(timer, round);
