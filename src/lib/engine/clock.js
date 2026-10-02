/**
 * The game clock: the time of day inside the game, and the evening's plan.
 *
 * The host picks how long the evening should last (say two hours, from the
 * deal to the finale) and how many days. `planEvening` stretches the open
 * phases (night, investigation, the vote, the Endgame) to fill that time, and
 * picks one clock speed so that a game day runs from the 07:00 alarm to about
 * 22:00. Everything short and shaped (the alarm, the morning game, the board,
 * the verdict) keeps its real length, because its beats are timed in seconds.
 *
 * The clock runs at that one speed, always faster than real time, with two
 * deliberate jumps: the night starts at 01:00 and the alarm rings at 07:00
 * (the room sleeps through the gap). It never runs backwards: a night that
 * runs late just rings the alarm late.
 *
 * Storage. The host writes `clockAt` (game minutes since 00:00 on day 0) with
 * every phase, next to `phaseStartedAt`. Every phone reads the time as
 * `clockAt + elapsed × speed`, and the clock holds still at `phaseEndsAt`, so
 * a host who advances late doesn't push the schedule: the next phase starts
 * at the time the plan said. Locked phases keep their parent's timing.
 *
 * Pure: no Date.now(), no Firestore. Old games without `config.clock` get
 * null everywhere, and the phone falls back to its fixed table (os/words.js).
 */

import { PHASE, DEFAULT_DURATIONS, ENDGAME_ROUNDS, gameSpan, revealLead } from './phases.js';
import { gameOfDay } from './minigames.js';

const MIN = 60 * 1000;
export const DAY_MIN = 24 * 60;

/** Where the fixed points of a day sit on the clock, in minutes after midnight. */
export const ANCHORS = Object.freeze({
  cast: 21 * 60, // day 0: the roles are dealt in the evening
  night: 60, // 01:00
  alarm: 7 * 60, // 07:00
  dusk: 22 * 60, // where a day's verdict should land
});

// The phases that stretch to fit the evening. The rest keep their real length.
const FLEX = ['night', 'investigation', 'roundtable', 'endgame'];
const STRETCH = [0.25, 4];

/** A phase's real length in ms, reveal hold included (phases.js phaseTiming). */
function lengthOf(phase, durations, kind) {
  const ms = phase === PHASE.GAME ? gameSpan(kind, durations) : durations[phase] ?? 0;
  return ms + revealLead(phase);
}

/** One day from the alarm to the verdict, in real ms, with the day's game. */
const dayLength = (durations, kind) =>
  [PHASE.ALARM, PHASE.GAME, PHASE.DAWN, PHASE.INVESTIGATION, PHASE.ROUNDTABLE, PHASE.BANISH]
    .reduce((n, p) => n + lengthOf(p, durations, kind), 0);

/**
 * Fit the evening into `minutes` (from the deal to the finale, arrivals not
 * counted) over `cycles` days. Without `minutes`, `base` is used as it is
 * (the quick test). Returns the durations to store, the clock to store, and
 * what the plan comes to, for the host's preview.
 *
 * Re-votes and recruit calls only happen some days, so they are not in the
 * sum: each one that happens adds about a minute.
 */
export function planEvening({ minutes = null, cycles, games, base = DEFAULT_DURATIONS, endgameRounds = ENDGAME_ROUNDS } = {}) {
  const config = { games };
  const kinds = Array.from({ length: cycles }, (_, i) => gameOfDay(config, i + 1));
  const fixed = lengthOf(PHASE.CASTING, base)
    + kinds.reduce((n, k) => n + [PHASE.ALARM, PHASE.GAME, PHASE.DAWN, PHASE.BANISH].reduce((s, p) => s + lengthOf(p, base, k), 0), 0)
    + endgameRounds * lengthOf(PHASE.BANISH, base);
  const flex = cycles * (base.night + base.investigation + base.roundtable) + endgameRounds * base.endgame;
  const wanted = minutes ? (minutes * MIN - fixed) / flex : 1;
  const stretch = Math.min(STRETCH[1], Math.max(STRETCH[0], wanted));
  const durations = { ...base };
  for (const p of FLEX) durations[p] = Math.round((base[p] * stretch) / 5000) * 5000;

  // One speed for the whole evening: the average day fills 07:00 to 22:00.
  const avgDay = kinds.reduce((n, k) => n + dayLength(durations, k), 0) / kinds.length;
  const speed = Math.round((((ANCHORS.dusk - ANCHORS.alarm) * MIN) / avgDay) * 10) / 10;

  const totalMs = fixed + cycles * (durations.night + durations.investigation + durations.roundtable) + endgameRounds * durations.endgame;
  return {
    durations,
    clock: { speed, castAt: ANCHORS.cast, nightAt: ANCHORS.night, alarmAt: ANCHORS.alarm },
    totalMs,
    // False when the evening is too short or too long for this many days.
    fits: !minutes || wanted === stretch,
  };
}

/** The game time right now, in minutes since 00:00 on day 0, or null if this game has no clock. */
export function clockNow(game, now) {
  const speed = game?.config?.clock?.speed;
  if (!speed || typeof game.clockAt !== 'number') return null;
  const from = game.phaseStartedAt || now;
  // Untimed phases (the finale) hold still; timed ones stop at their end.
  const to = game.phaseEndsAt ? Math.min(now, game.phaseEndsAt) : from;
  return game.clockAt + (Math.max(0, to - from) * speed) / MIN;
}

/**
 * What `clockAt` to write when `game` moves into `phase` at `now`. The night
 * and the alarm jump forward to their anchors on day `cycle`; everything
 * else carries on from where the clock is.
 */
export function clockAtStart(game, phase, now, cycle = game?.cycle ?? 0) {
  const c = game?.config?.clock;
  if (!c?.speed) return null;
  const cur = clockNow(game, now) ?? 0;
  if (phase === PHASE.CASTING) return c.castAt;
  if (phase === PHASE.NIGHT) return Math.max(cycle * DAY_MIN + c.nightAt, cur);
  if (phase === PHASE.ALARM) return Math.max(cycle * DAY_MIN + c.alarmAt, cur);
  return cur;
}

/** Which part of the day a phase belongs to, for the schedule. */
const PART = {
  night: 'night', night_locked: 'night', recruit: 'night', recruit_locked: 'night',
  alarm: 'alarm', game: 'game', game_locked: 'game', dawn: 'dawn', investigation: 'investigation',
  roundtable: 'roundtable', roundtable_locked: 'roundtable', revote: 'roundtable', revote_locked: 'roundtable', banish: 'banish',
};
const DAY_ORDER = ['night', 'alarm', 'game', 'dawn', 'investigation', 'roundtable', 'banish'];

/**
 * Today's schedule: `[{ id, at }]` in game minutes, in order, plus `end` (when
 * the verdict is over). Parts already started show when they really started;
 * the ones still to come are planned from where the clock is now.
 */
export function daySchedule(game, now) {
  const c = game?.config?.clock;
  const durations = game?.config?.durations ?? DEFAULT_DURATIONS;
  if (!c?.speed || !game.cycle || game.endgameRound) return null;
  const s = c.speed / MIN;
  const kind = game.minigame && PART[game.phase] !== 'night' ? game.minigame : gameOfDay(game.config, game.cycle);
  const base = game.cycle * DAY_MIN;
  const lenOf = (id) => lengthOf(id, durations, kind) * s;

  const at = {};
  at.night = base + c.nightAt;
  at.alarm = base + c.alarmAt;
  for (let i = 2; i < DAY_ORDER.length; i++) at[DAY_ORDER[i]] = at[DAY_ORDER[i - 1]] + lenOf(DAY_ORDER[i - 1]);
  let end = at.banish + lenOf('banish');

  // Re-plan from the part the room is in.
  const part = PART[game.phase];
  const i = DAY_ORDER.indexOf(part);
  if (i >= 0 && typeof game.clockAt === 'number') {
    if (game.phase === part) at[part] = game.clockAt;
    let t = game.phaseEndsAt ? clockNow(game, game.phaseEndsAt) : clockNow(game, now);
    // The night's end is the alarm's anchor, not a time of its own.
    if (part === 'night') t = Math.max(t, at.alarm);
    for (let j = i + 1; j < DAY_ORDER.length; j++) {
      at[DAY_ORDER[j]] = t;
      t += lenOf(DAY_ORDER[j]);
    }
    end = t;
  }
  return { parts: DAY_ORDER.map((id) => ({ id, at: at[id] })), end };
}

/** "07:05" for a game-minute count. */
export function fmtClock(m) {
  const t = Math.floor(m);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
