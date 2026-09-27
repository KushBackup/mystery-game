import React, { useEffect, useState } from 'react';
import { narrate } from '../../data/packs/index.js';
import { ROLE_INFO } from '../../lib/engine/roles.js';
import { useSyncedReveal } from '../../hooks/useKillers';
import { playTypeBell } from '../../lib/typeSound';
import { Hold, ClueCard, DeliveryCard } from './parts';

/**
 * The three moments the room reacts to together: dawn, banishment, finale.
 *
 * With no projector, every phone is the big screen. Each reveal holds on
 * "…" until the host's `revealAt` instant (measured on the server's clock,
 * lib/clockSkew.js), so a table of eight looks up at the same second. The host
 * reads the two narration lines aloud as the phones flip; the phones show
 * them too, for the guest at the bar who missed it.
 */

const Lines = ({ lines, className = '' }) => (
  <div className={className}>
    {lines.map((l, i) => (
      <p key={i} className={`font-typewriter ${i === lines.length - 1 ? 'text-[24px] text-bone' : 'text-[17px] text-dim'} leading-snug mt-2 er-enter`} style={{ animationDelay: `${i * 450}ms` }}>
        {l}
      </p>
    ))}
  </div>
);

/** Play the bell once, when a reveal flips. */
function useBellOn(show) {
  useEffect(() => {
    if (show) playTypeBell();
  }, [show]);
}

export function DawnReveal({ game, me, pack, nameOf, tonight }) {
  const phase = useSyncedReveal(game.revealAt);
  useBellOn(phase === 'show');
  if (phase === 'hold' || !game.dawn) return <Hold label="The lights come back…" />;

  const d = game.dawn;
  const victim = d.victims?.[0];
  const beat = victim ? 'dawnDeath' : d.attempted ? 'dawnSaved' : d.recruited ? 'dawnRecruited' : 'dawnQuiet';
  const lines = narrate(pack, beat, nameOf(victim ?? d.attempted));
  const iDied = victim === me.pid;

  return (
    <div className="mt-6">
      <Lines lines={lines} />
      {d.vanished?.length > 0 && (
        <p className="font-typewriter text-[16px] text-dim mt-4 er-enter" style={{ animationDelay: '900ms' }}>
          {d.vanished.map(nameOf).join(', ')} left the party. Their secret leaves with them.
        </p>
      )}
      {iDied && (
        <div className="er-card er-card--signal mt-6 er-land" style={{ animationDelay: '1200ms' }}>
          <p className="font-typewriter text-[18px] text-bone">You were murdered. You&rsquo;re a ghost now: you still whisper, and you vote in the Endgame.</p>
        </div>
      )}
      {tonight.length > 0 && (
        <div className="mt-8 space-y-3">
          <p className="er-mono er-mono--wide">What you learned tonight</p>
          {tonight.map((t) => (t.kind === 'fact' ? <ClueCard key={t.id} pack={pack} fact={t.fact} cycle={t.cycle} via={t.via} /> : <DeliveryCard key={t.id} d={t} nameOf={nameOf} />))}
        </div>
      )}
    </div>
  );
}

export function BanishReveal({ game, pack, nameOf, me }) {
  const phase = useSyncedReveal(game.revealAt);
  const [stamped, setStamped] = useState(false);
  const show = phase === 'show';
  useBellOn(show && stamped);
  // The name lands first; the verdict a beat later, the way the show does it.
  useEffect(() => {
    if (!show) return undefined;
    const id = setTimeout(() => setStamped(true), 1600);
    return () => clearTimeout(id);
  }, [show]);

  if (!show || !game.banish) return <Hold label="The votes are counted…" />;
  const b = game.banish;
  if (!b.pid) return <Lines className="mt-6" lines={narrate(pack, 'banishNone')} />;

  const killer = b.team === 'killers';
  const tally = Object.entries(b.tally ?? {}).sort((x, y) => y[1] - x[1]);
  const byTarget = Object.entries(b.votes ?? {}).reduce((acc, [voter, target]) => {
    (acc[target] ??= []).push(voter);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <p className="font-typewriter text-[17px] text-dim">{b.pid === me.pid ? 'The room chose you.' : 'The room has chosen.'}</p>
      <h1 className="er-title text-[48px] mt-2 er-enter">{nameOf(b.pid)}</h1>
      {b.fromTie && <p className="er-mono mt-2">Still tied after the re-vote. Fate chose.</p>}
      {stamped && (
        <section className={`${killer ? 'bg-signal text-bone' : 'er-bone text-ink'} p-5 mt-5 er-stamp`}>
          <p className={`er-mono ${killer ? 'text-bone' : 'text-body-bone'}`}>was</p>
          <p className={`er-title text-[52px] ${killer ? 'text-bone' : 'text-ink'}`}>{killer ? 'A Killer' : 'Faithful'}</p>
          {!killer && b.role && b.role !== 'Faithful' && <p className="font-typewriter text-[17px] mt-1">The {b.role}.</p>}
        </section>
      )}
      {stamped && tally.length > 0 && (
        <div className="mt-6 er-fade">
          <p className="er-mono er-mono--wide">The votes</p>
          <ul className="mt-2 space-y-2">
            {tally.map(([pid, n]) => (
              <li key={pid} className="border-b border-line-faint pb-2">
                <div className="flex justify-between gap-3">
                  <span className="font-typewriter text-bone">{nameOf(pid)}</span>
                  <span className="er-num text-[20px]">{n}</span>
                </div>
                <p className="er-mono normal-case tracking-normal mt-1">{(byTarget[pid] ?? []).map(nameOf).join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Finale({ game, pack, players, nameOf }) {
  const phase = useSyncedReveal(game.revealAt);
  useBellOn(phase === 'show');
  if (phase === 'hold') return <Hold label="The gate is opening…" />;
  const faithfulWin = game.winner === 'faithful';
  const roles = game.finaleRoles ?? {};
  const killers = Object.keys(roles).filter((p) => roles[p] === 'killer');
  const specials = Object.keys(roles).filter((p) => ['doctor', 'detective', 'medium'].includes(roles[p]));
  const statusOf = (pid) => players.find((p) => p.id === pid)?.status;

  return (
    <div className="mt-6">
      <Lines lines={narrate(pack, faithfulWin ? 'finaleFaithful' : 'finaleKillers')} />
      <section className={`${faithfulWin ? 'er-bone text-ink' : 'bg-signal text-bone'} p-6 mt-6 er-stamp`}>
        <p className={`er-title text-[52px] ${faithfulWin ? 'text-ink' : 'text-bone'}`}>{faithfulWin ? 'Faithful win' : 'Killers win'}</p>
      </section>
      <div className="mt-8">
        <p className="er-mono er-mono--wide">The Killers</p>
        <ul className="er-list mt-2">
          {killers.map((p) => (
            <li key={p}>
              <span className="text-bone">{nameOf(p)}</span> {statusOf(p) === 'alive' ? '(walked free)' : statusOf(p) === 'vanished' ? '(went home)' : '(caught)'}
            </li>
          ))}
        </ul>
        {specials.length > 0 && (
          <>
            <p className="er-mono er-mono--wide mt-6">Secret roles</p>
            <ul className="er-list mt-2">
              {specials.map((p) => (
                <li key={p}>
                  <span className="text-bone">{nameOf(p)}</span>: {ROLE_INFO[roles[p]]?.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
