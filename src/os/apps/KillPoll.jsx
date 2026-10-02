import React from 'react';
import { GuestPicker } from '../ui';
import { submitDen } from '../../firebase/game';
import { useDen, useDenMeta } from '../../hooks/useKillers';
import { sfxSent } from '../sfx';

/**
 * The Killers' night, in full: one poll. It sits in their group chat
 * (MessagesApp) and is the whole of the Night app for a Killer, so either way
 * in leads to the same list.
 *
 * Everything else about a kill is the engine's (night.js): who strikes
 * rotates, the rig is always zero. The phone never says so; the board, the
 * photos and the room teach it.
 *
 * Each partner's pick shows beside the name they chose, and a tap can be
 * changed until the host locks the night. The majority decides.
 */

export default function KillPoll({ ctx, dark = false }) {
  const { gid, game, me, players, nameOf, mates, traits } = ctx;
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  // Until the group has loaded, a partner would look like a target.
  if (!mates) return null;
  const recruitNight = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const key = recruitNight ? 'recruit' : 'victim';
  const group = new Set(mates.map((m) => m.id));
  const targets = players.filter((p) => p.status === 'alive' && !group.has(p.id) && p.id !== me.pid).map((p) => ({ ...p, pid: p.id }));
  const mine = den.find((d) => d.pid === me.pid)?.[key] ?? null;

  // "Maya, you": who in the group chose this name.
  const note = (g) => {
    const who = den.filter((d) => d[key] === g.pid).map((d) => (d.pid === me.pid ? 'you' : nameOf(d.pid)));
    return who.length ? who.join(', ') : null;
  };
  const pick = (pid) => submitDen(gid, game.cycle, me.pid, { [key]: pid })
    .then(sfxSent)
    .catch((e) => console.warn('[poll] not saved:', e.code ?? e.message));

  return <GuestPicker guests={targets} traits={traits} value={mine} note={note} dark={dark} onPick={pick} />;
}
