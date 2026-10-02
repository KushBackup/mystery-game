/**
 * DEEP BLUE's voice: the app talking to one guest, in its own Messages thread.
 *
 * One standing message and five moments, from the pack's `voice` (data/packs/):
 *   manifesto   always there, dated years ago and already read: DEEP BLUE
 *               declaring itself justice. Static, never stored
 *   night:c     when night c falls
 *   play:c      when morning c's game opens: we are watching until you play
 *   dawn:c      once the board's last beat has played: where you finished
 *   banish:b    once the verdict's votes are shown: what the group did
 *   end         at the finale
 *
 * Every line is worked out on this phone from what the room has already been
 * shown, never ahead of a reveal (beats.js), and nothing in it depends on the
 * guest's role, so a phone left face-up gives nothing away. Lines are kept in
 * localStorage (seen.js) the first time they are due, so yesterday's line is
 * still in the thread after today's board replaces yesterday's.
 */

import { useEffect } from 'react';
import { useServerNow } from '../hooks/useKillers';
import { BOARD_BEAT, VERDICT_BEAT } from './beats';
import { useSeen, markSeen } from './seen';

const NIGHT = new Set(['night', 'night_locked', 'recruit', 'recruit_locked']);
const PLAY = new Set(['alarm', 'game', 'game_locked']);

/** The manifesto: years old and already read, so it is never unread (threads.js). */
function manifesto(v) {
  const m = v?.manifesto;
  if (!m?.lines?.length) return [];
  const at = Date.parse(m.at);
  return m.lines.map((text, i) => ({ id: `manifesto:${i}`, at: at + i * 1000, cycle: -1, old: true, text }));
}

const fill = (text, vars) => Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, String(v ?? '')), text ?? '');

/** The lines that are due right now (id, at, cycle, text), given what this phone has been shown. */
function dueLines(game, me, pack, nameOf, now) {
  const v = pack.voice;
  if (!v || !game) return [];
  const out = [];
  const vars = { name: me.name, day: game.cycle };

  if (NIGHT.has(game.phase) && game.cycle > 0) {
    const at = Math.max(game.phaseStartedAt || 0, game.revealAt || 0) || now;
    out.push({ id: `night:${game.cycle}`, at, cycle: game.cycle, text: fill(v.night[Math.min(game.cycle - 1, v.night.length - 1)], vars) });
  }

  if (PLAY.has(game.phase) && game.cycle > 0 && v.play?.length) {
    const at = game.phaseStartedAt || game.revealAt || now;
    out.push({ id: `play:${game.cycle}`, at, cycle: game.cycle, text: fill(v.play[Math.min(game.cycle - 1, v.play.length - 1)], vars) });
  }

  const board = game.board;
  if (board && game.dawn?.cycle === board.cycle && game.revealAt) {
    const at = game.revealAt + (BOARD_BEAT.full + 3) * 1000;
    const shown = game.phase !== 'dawn' || now >= at;
    if (shown && board.cycle === game.cycle) {
      const rows = board.rows ?? [];
      const taken = game.dawn.taken ?? game.dawn.victims?.[0];
      const mine = rows.find((r) => r.pid === me.pid);
      let key = null;
      if (taken === me.pid) key = null; // the Taken screen says it
      else if (me.status === 'ghost' && (board.ghosts ?? []).some((r) => r.pid === me.pid)) key = 'ghost';
      else if (mine && !mine.played) key = 'none';
      else if (mine) {
        const fromDeep = rows.length - mine.rank - (taken && rows.at(-1)?.pid === taken ? 1 : 0);
        key = mine.rank <= 3 ? 'top' : fromDeep <= 0 ? 'low' : fromDeep <= 2 ? 'edge' : 'calm';
      }
      if (key && v.dawn[key]) {
        out.push({ id: `dawn:${board.cycle}`, at, cycle: board.cycle, text: fill(v.dawn[key], { ...vars, rank: mine?.rank, n: rows.length }) });
      }
    }
  }

  const b = game.banish;
  if (b && game.phase === 'banish' && game.revealAt && b.pid !== me.pid) {
    const at = game.revealAt + (VERDICT_BEAT.votes + 2) * 1000;
    if (now >= at) {
      const key = !b.pid ? 'none' : b.team === 'killers' ? (game.winner === 'faithful' ? 'lastKiller' : 'killer') : 'innocent';
      out.push({ id: `banish:${game.ballot}`, at, cycle: game.cycle, text: fill(v.banish[key], { ...vars, target: b.pid ? nameOf(b.pid) : '' }) });
    }
  }

  if (game.phase === 'finale' && game.winner && v.end) {
    const at = (game.revealAt || now) + 8000;
    if (now >= at) out.push({ id: 'end', at, cycle: game.cycle, text: fill(v.end[game.winner === 'faithful' ? 'faithful' : 'killers'], vars) });
  }
  return out;
}

/** Every line DEEP BLUE has said to this guest, oldest first, as thread items (`kind: 'voice'`). */
export function useVoice(gid, game, me, pack, nameOf) {
  const key = `${gid}.voice`;
  const log = useSeen(key, []);
  const gates = [
    game?.revealAt ? game.revealAt + (BOARD_BEAT.full + 3) * 1000 : 0,
    game?.revealAt ? game.revealAt + (VERDICT_BEAT.votes + 2) * 1000 : 0,
    game?.revealAt ? game.revealAt + 8000 : 0,
  ];
  const now = useServerNow(Math.max(...gates), 500);
  const due = dueLines(game, me, pack, nameOf, now);
  const list = Array.isArray(log) ? log : [];
  const missing = due.filter((d) => !list.some((x) => x.id === d.id));
  const missingKey = missing.map((d) => d.id).join('|');

  useEffect(() => {
    if (!missingKey) return;
    const cur = Array.isArray(log) ? log : [];
    markSeen(key, [...cur, ...missing.filter((d) => !cur.some((x) => x.id === d.id))].slice(-40));
    // `missing` is derived from missingKey's inputs; the key is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, missingKey]);

  return [...manifesto(pack?.voice), ...list, ...missing].map((x) => ({ ...x, kind: 'voice' }));
}
