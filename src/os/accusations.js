/**
 * Today's accusations, read from ctx (PhoneOS subscribes once). Shared by the
 * Vote app and the Room (apps/Accuse.jsx); the rules live in engine/banish.js.
 */

import { accusationBoard } from '../lib/engine/banish.js';

/** Today's board of accused guests, from ctx (PhoneOS subscribes once). */
export function useAccusations(ctx) {
  const alive = ctx.players.filter((p) => p.status === 'alive').map((p) => p.id);
  const accusations = ctx.accusations ?? [];
  const seconds = ctx.seconds ?? [];
  return {
    board: accusationBoard(accusations, seconds, alive),
    mine: accusations.find((a) => a.pid === ctx.me.pid) ?? null,
    mySecond: seconds.find((s) => s.pid === ctx.me.pid) ?? null,
    byAccuser: Object.fromEntries(accusations.map((a) => [a.pid, a])),
  };
}

/** Whether `me` may second `accusation` right now: not your own, not against you, not someone you already accused. */
export function canSecond(ctx, accusation, mySecond) {
  const mine = (ctx.accusations ?? []).find((a) => a.pid === ctx.me.pid);
  return ctx.game.phase === 'investigation' && ctx.me.status === 'alive' && !mySecond
    && accusation.pid !== ctx.me.pid && accusation.target !== ctx.me.pid && mine?.target !== accusation.target;
}
