/**
 * The starting gun — the model, in one place.
 *
 * Until the host presses Start, a player who has logged in has nothing to do.
 * They arrive over twenty minutes, in ones and twos, and every one of them used
 * to land straight on the board with six tiles, an empty evidence screen and a
 * chat channel nobody has posted in yet — which reads as a broken app rather
 * than as an event that has not begun. Standby is the answer: one screen that
 * says what is happening, and a ten-second countdown so the room is let in
 * together instead of trickling in.
 *
 * Everything here is pure. The host console owns the transition (nothing on a
 * player's phone may write a start), components/StandbyScreen.jsx owns the
 * ticking and the pixels, and App.jsx owns the gate.
 *
 * --- Why the start is stored as an absolute instant ------------------------
 *
 * Exactly the reasoning in lib/roundTimer.js, and for exactly the same reason:
 * `gameStartedAt` is an epoch millisecond on the *host's* clock, and every
 * device measures the countdown against its own `Date.now()`. The alternative —
 * a boolean plus a locally-run ten-second timer — would restart the countdown
 * on every phone that joined late, reloaded, or woke from sleep, so a player
 * logging in during Round 3 would be made to watch a starting gun fire three
 * rounds after the race began. An absolute instant is already past for them,
 * and they are simply let in.
 *
 * That is also what makes the host's escape hatch a one-line thing rather than
 * a broadcast of its own: `skipCountdown()` below is just a start instant far
 * enough in the past that no device has a countdown left to run.
 */

// Ten seconds — long enough for the host to say "here we go" over the room and
// for 69 people to look down at their phones, short enough that nobody standing
// in a loud office wonders whether the thing has hung.
export const COUNTDOWN_MS = 10 * 1000;
export const COUNTDOWN_SECONDS = COUNTDOWN_MS / 1000;

// Not started. Stored as 0 rather than as a missing field so `readStartedAt`
// has one answer for "no" and the migration in firebase/config.js can backfill
// it without inventing a start nobody pressed.
export const NOT_STARTED = 0;

// --- Storage ---------------------------------------------------------------
//
// One flat field on `gameState/current`, beside the round and the round clock.

export const readStartedAt = (gameState = {}) => Number(gameState.gameStartedAt) || NOT_STARTED;

export const writeStartedAt = (startedAt) => ({ gameStartedAt: startedAt });

// --- Reading the gun -------------------------------------------------------

/**
 * The three states, as one word:
 *
 *   standby   nothing written — the host has not started the room
 *   counting  started, and this device still has countdown left to run
 *   live      started, and the countdown is behind us
 *
 * Note that `live` is a *reading* and never a stored state, the same way the
 * round clock's `done` is: 69 devices all crossing the same instant must not
 * become 69 writes.
 */
export const startPhase = (startedAt, now = Date.now()) => {
  if (!startedAt) return 'standby';
  return now < startedAt + COUNTDOWN_MS ? 'counting' : 'live';
};

/**
 * Milliseconds of countdown left, clamped to [0, COUNTDOWN_MS].
 *
 * The upper clamp is the guard against a device whose clock is behind the
 * host's — without it a phone a minute slow would count down from 70. With it,
 * the worst it can do is sit on 10 until the true remainder catches up.
 */
export const countdownMs = (startedAt, now = Date.now()) => {
  if (!startedAt) return COUNTDOWN_MS;
  return Math.max(0, Math.min(startedAt + COUNTDOWN_MS - now, COUNTDOWN_MS));
};

/**
 * The figure on the screen. Rounds *up*, like formatClock in lib/roundTimer.js,
 * so the last second of the countdown reads 1 and 0 means the room is open.
 */
export const countdownSeconds = (startedAt, now = Date.now()) =>
  Math.ceil(countdownMs(startedAt, now) / 1000);

// --- Transitions (host only) ----------------------------------------------

/**
 * The instant the first round's clock should actually begin — the end of the
 * countdown, not the press.
 *
 * The room is looking at a starting gun for those ten seconds, not at the game,
 * and a 30-minute round that quietly spends a sixth of its first minute behind
 * a curtain is a round the host did not get. `remainingMs` in lib/roundTimer.js
 * clamps to the round's own duration, so the clock simply reads a full 30:00
 * until the countdown clears and then starts moving.
 */
export const roundClockStartsAt = (startedAt) => startedAt + COUNTDOWN_MS;

/**
 * A start instant that is already behind every device in the room.
 *
 * The host's escape hatch: a phone wedged on standby, or one that took the
 * start late and is now ten seconds behind the room, is not helped by being
 * shown the countdown again. Writing this instead of `Date.now()` means every
 * device reads `live` the moment the snapshot lands and is simply let in.
 *
 * The extra second past the countdown is slack for clock skew — a device a
 * little ahead of the host must still land on `live` rather than on a stray
 * final tick.
 */
export const skipCountdown = (now = Date.now()) => now - COUNTDOWN_MS - 1000;
