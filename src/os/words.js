/**
 * Small phone-wide phrasings that more than one app needs. Everything
 * story-shaped lives in the pack (data/packs/); role and phase copy in
 * data/killersCopy.js. This file is only the glue between them.
 */

import { clockNow, fmtClock } from '../lib/engine/clock.js';

/** What happened to someone who is no longer playing, in one short line. */
export function fateLine(p) {
  const day = p.diedCycle ? ` · day ${p.diedCycle}` : '';
  if (p.status === 'vanished') return 'Went home';
  switch (p.cause) {
    case 'murdered':
    case 'deep':
      return `Taken by the deep${day}`;
    case 'banished':
      return p.revealedRole === 'killer' ? `Voted out · was a KILLER${day}` : `Voted out · was innocent${day}`;
    case 'host':
      return 'Removed by the host';
    default:
      return p.status === 'ghost' ? `Ghost${day}` : '';
  }
}

/** The label above the home screen's NowCard: the day and the phase. */
export function dayLabel(game, phaseLabel) {
  if (!game) return '';
  if (game.phase === 'lobby') return 'ARRIVALS';
  if (game.phase === 'finale') return 'GAME OVER';
  if (game.endgameRound) return `ENDGAME · VOTE ${game.endgameRound}`;
  return game.cycle > 0 ? `DAY ${game.cycle} · ${phaseLabel}` : phaseLabel;
}

/** How a clue photo came to you. */
export function photoSource(d) {
  if (d.via === 'ghost') return 'From the other side';
  if (d.via === 'watch') return 'You saw it yourself';
  if (d.via === 'top') return `#${d.rank ?? 1} on the board`;
  return 'Dug out of the logs';
}

/** 24-hour wall-clock time, "07:05". */
export const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/**
 * The time of day inside the game, as the phone's clock shows it. A game
 * made with a clock (engine/clock.js) runs on it: one speed, faster than real
 * time, with the night at 01:00 and the alarm at 07:00. Older games use the
 * fixed table below. Before the deal it is real time.
 */
const WORLD = {
  night: [60, 300], night_locked: [300, 300], recruit: [270, 300], recruit_locked: [300, 300],
  alarm: [420, 420], game: [421, 423], game_locked: [423, 423], dawn: [425, 430],
  investigation: [540, 1020], roundtable: [1080, 1140], roundtable_locked: [1140, 1140],
  revote: [1140, 1155], revote_locked: [1155, 1155], banish: [1170, 1175],
  endgame: [1380, 1439], endgame_locked: [1439, 1439], finale: [0, 0],
};

export function worldMinutes(game, now) {
  const clocked = clockNow(game, now);
  if (clocked != null) return clocked;
  const span = WORLD[game?.phase];
  if (!span) return null;
  const [a, b] = span;
  const start = Math.max(game.revealAt || 0, game.phaseStartedAt || 0);
  const end = game.phaseEndsAt || 0;
  const t = end > start ? Math.min(1, Math.max(0, (now - start) / (end - start))) : 0;
  return Math.round(a + (b - a) * t);
}

/** "07:00" in the game's day, or real time outside it. */
export function worldClock(game, now) {
  const m = worldMinutes(game, now);
  if (m == null) return hhmm(new Date());
  return fmtClock(m);
}

/** The light outside, for the wallpaper: night, dawn, day or dusk. */
export function timeOfDay(phase) {
  if (['night', 'night_locked', 'recruit', 'recruit_locked', 'endgame', 'endgame_locked', 'finale'].includes(phase)) return 'night';
  if (['alarm', 'game', 'game_locked', 'dawn'].includes(phase)) return 'dawn';
  if (['roundtable', 'roundtable_locked', 'revote', 'revote_locked', 'banish'].includes(phase)) return 'dusk';
  return 'day';
}
