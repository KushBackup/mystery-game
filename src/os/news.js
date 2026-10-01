/**
 * What the News app has to print, and when.
 *
 * Two feeds meet here and become one shape (a "story"):
 *   world  the authored articles in the pack (data/packs/deepblue.news.js).
 *          They unlock by *day*, not by outcome: edition N lands with day N's
 *          alarm, day 0 is there from the lobby, and the morning-after piece
 *          appears at the finale. So every phone in the room holds the same
 *          paper, and it is true whatever happened.
 *   room   the room's own events (game.news: each morning's board, each vote),
 *          written up from the pack's `live` templates.
 *
 * A live story is not shown before the reveal that announces it. The host
 * writes a death at the same instant it opens the reveal, about five seconds
 * before the phones flip, so the paper (and the badge) would otherwise spoil
 * it for the table (see beats.js).
 */

import { useMemo } from 'react';
import { narrate } from '../data/packs/index.js';
import { useServerNow } from '../hooks/useKillers';
import { revealGate } from './beats';

/** The phases that belong to the night before a morning. */
const NIGHT = new Set(['night', 'night_locked', 'recruit', 'recruit_locked']);

/**
 * The newest edition this phone may hold. A day's paper lands with its alarm,
 * so the night *before* day N is still day N-1's paper.
 */
export function editionDay(game) {
  const c = game?.cycle ?? 0;
  if (!c) return 0;
  return NIGHT.has(game.phase) ? c - 1 : c;
}

const fill = (text, vars) => Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, String(v ?? '')), text ?? '');
const listOf = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? '');

/** Authored articles for this phone, newest day first and each day's lead first. */
export function worldStories(game, pack) {
  const feed = pack.news;
  if (!feed) return [];
  const day = editionDay(game);
  const epilogue = game.phase === 'finale' ? feed.epilogue?.[game.winner === 'faithful' ? 'faithful' : 'killers'] : null;
  return [...feed.articles.filter((a) => a.day <= day), ...(epilogue ? [epilogue] : [])]
    .map((a) => ({ ...a, id: `w:${a.id}`, section: 'world', outlet: feed.outlets[a.outlet] ?? feed.outlets.times }))
    .sort((a, b) => (b.day - a.day) || (Number(Boolean(b.lead)) - Number(Boolean(a.lead))));
}

/** One game.news entry as a story, or null if the pack has no wording for it. */
function liveStory(s, pack, nameOf) {
  const feed = pack.news;
  const live = feed?.live;
  if (!live) return null;
  const base = { section: 'room', live: true, day: s.cycle, outlet: feed.outlets.times, by: live.by, art: s.kind === 'dawn' ? 'board' : 'eyes' };

  if (s.kind === 'dawn') {
    const taken = s.taken ?? s.victims?.[0];
    const who = taken ? nameOf(taken) : '';
    const attempted = s.attempted ? nameOf(s.attempted) : '';
    let key = 'quiet';
    let lines = narrate(pack, 'dawnQuiet');
    if (s.cause === 'rig') { key = 'rig'; lines = narrate(pack, 'dawnRig', who, { score: s.rigged ?? 0 }, 'dawnDeath'); }
    else if (s.cause === 'deep') { key = 'deep'; lines = narrate(pack, 'dawnDeep', who, { saved: attempted }, 'dawnDeath'); }
    else if (s.recruited) { key = 'recruit'; lines = narrate(pack, 'dawnRecruited'); }
    else if (s.attempted) { key = 'saved'; lines = narrate(pack, 'dawnSaved', attempted); }
    const t = live.dawn[key] ?? live.dawn.quiet;
    const vars = { name: key === 'saved' ? attempted : who, score: s.rigged ?? 0, day: s.cycle };
    const podium = (s.top ?? []).map(nameOf).filter(Boolean);
    const body = [
      ...lines,
      ...(podium.length ? [`Top of the board: ${listOf(podium)}. A photo each.`] : []),
      ...(s.vanished?.length ? [`${listOf(s.vanished.map(nameOf))} went home. Their secret went with them.`] : []),
      ...t.tail,
    ];
    return { ...base, id: `l:dawn:${s.cycle}`, kicker: t.kicker, head: fill(t.head, vars), dek: fill(t.dek, vars), time: '07:30', body };
  }

  const key = !s.pid ? 'none' : s.team === 'killers' ? 'killer' : 'innocent';
  const t = live.banish[key];
  const who = s.pid ? nameOf(s.pid) : '';
  const vars = { name: who, day: s.cycle };
  const lines = narrate(pack, key === 'none' ? 'banishNone' : key === 'killer' ? 'banishKiller' : 'banishFaithful', who);
  return {
    ...base,
    id: `l:banish:${s.cycle}:${s.ballot ?? ''}`,
    kicker: t.kicker,
    head: fill(t.head, vars),
    dek: fill(t.dek, vars),
    time: s.endgame ? '23:30' : '19:30',
    body: [...lines, ...(s.endgame && live.endgameTail ? [live.endgameTail] : []), ...t.tail],
  };
}

/** Is this entry the one the reveal now playing is about to announce? */
const announcing = (s, game) =>
  (game.phase === 'dawn' && s.kind === 'dawn' && s.cycle === game.cycle)
  || (game.phase === 'banish' && s.kind === 'banish' && s.ballot === game.ballot);

/**
 * Everything this phone may read right now. `all` is every story, newest
 * first within its section; `ids` are what the badge counts.
 */
export function useNews(game, pack, nameOf) {
  const gate = revealGate(game);
  const now = useServerNow(gate, 250);
  const held = Boolean(gate) && now < gate;
  const entries = game.news ?? [];

  return useMemo(() => {
    const world = worldStories(game, pack);
    const room = [...entries]
      .filter((s) => !(held && announcing(s, game)))
      .reverse()
      .map((s) => liveStory(s, pack, nameOf))
      .filter(Boolean);
    return { world, room, held, all: [...room, ...world], ids: [...room, ...world].map((s) => s.id) };
    // nameOf is rebuilt every render by the shell but only changes when the roster does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, game.cycle, game.ballot, game.winner, entries.length, held, pack]);
}

/** The crawl under the masthead: every line from this edition or earlier. */
export function tickerLines(game, pack) {
  const day = editionDay(game);
  return (pack.news?.ticker ?? []).filter((t) => t.day <= day).map((t) => t.text);
}

/** "BEFORE THE FIRST MORNING", or "DAY 3". */
export const editionLabel = (game) => (editionDay(game) > 0 ? `DAY ${editionDay(game)}` : 'BEFORE THE FIRST MORNING');
