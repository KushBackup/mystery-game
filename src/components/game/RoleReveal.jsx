import React from 'react';
import { ROLE_CARD } from '../../data/killersCopy';
import { useSyncedReveal, useKillerIds } from '../../hooks/useKillers';
import { Hold } from './parts';

/**
 * The deal. Every phone holds "…" until the same instant, then flips.
 *
 * A Killer's card is the one red-fill surface outside the finale (the
 * design system reserves large signal fills for the murderer reveal, and this
 * is its twin): it has to be unmistakable at a glance, from a phone held
 * low under a table. Faithful cards are bone, the document surface.
 */
export default function RoleReveal({ game, gid, role, nameOf, compact = false }) {
  const phase = useSyncedReveal(compact ? 0 : game.revealAt);
  const isKiller = role?.role === 'killer';
  const mates = useKillerIds(gid, isKiller);

  if (phase === 'hold' || !role) return <Hold label={role ? 'Dealing…' : 'Waiting for your card…'} />;

  const card = ROLE_CARD[role.role] ?? ROLE_CARD.faithful;
  const others = (mates ?? []).filter((p) => p !== role.id);

  return (
    <section className={`${isKiller ? 'bg-signal text-bone' : 'er-bone text-ink'} p-6 mt-6 ${compact ? '' : 'er-stamp'}`}>
      <p className={`er-mono ${isKiller ? 'text-bone' : 'text-body-bone'}`}>You are</p>
      <h1 className={`er-title text-[56px] mt-2 ${isKiller ? 'text-bone' : 'text-ink'}`}>{card.title}</h1>
      <p className={`font-typewriter text-[18px] leading-snug mt-4 ${isKiller ? 'text-bone' : 'text-ink'}`}>{card.line}</p>
      <p className={`font-mono text-[13px] mt-4 pt-3 border-t ${isKiller ? 'border-bone/40 text-bone' : 'border-line-bone text-body-bone'}`}>
        {card.tip}
      </p>
      {isKiller && others.length > 0 && (
        <p className="font-typewriter text-[17px] mt-4">
          Your partners: <strong>{others.map(nameOf).join(', ')}</strong>
        </p>
      )}
      {role.role === 'detective' && role.checksLeft != null && (
        <p className="font-mono text-[13px] mt-3 text-body-bone">
          Checks left: <span className="font-display font-bold text-[18px] text-ink">{role.checksLeft}</span>
        </p>
      )}
    </section>
  );
}
