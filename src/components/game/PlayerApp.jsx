import React, { useEffect, useMemo, useState } from 'react';
import { ensureAnonymous, beat, requestLeave, cancelLeave } from '../../firebase/game';
import { useAuthUser, useActiveGameId, useGame, useBinding, usePlayers, useMyRole, useInbox, useMyAction } from '../../hooks/useKillers';
import { packFor } from '../../data/packs/index.js';
import { nowLine } from '../../data/killersCopy';
import { LOCKED } from '../../lib/engine/phases.js';
import { primeTypeSound } from '../../lib/typeSound';
import { Screen, PhaseBar, NowCard, Hold, ClueCard, DeliveryCard, Action } from './parts';
import Arrival from './Arrival';
import RoleReveal from './RoleReveal';
import Night, { RecruitScreen } from './Night';
import Vote from './Vote';
import ChatPanel from './ChatPanel';
import { DawnReveal, BanishReveal, Finale } from './Reveals';

/**
 * A guest's phone, from the door to the gate.
 *
 *   auth → active game → binding → (Arrival | the game)
 *
 * Inside the game, the phase decides the main screen, and five tabs sit
 * under it: Now (the phase), Clues (everything this guest has learned),
 * Guests (who is alive), Talk (the room, and Spirits for ghosts and the
 * Medium) and Me (role, leave). Any phase change jumps back to Now, because
 * whatever the room is doing is always the thing to look at.
 */

const TABS = [
  ['now', 'Now'],
  ['clues', 'Clues'],
  ['guests', 'Guests'],
  ['talk', 'Talk'],
  ['me', 'Me'],
];

export default function PlayerApp() {
  const user = useAuthUser();
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user === null) ensureAnonymous().catch((e) => setAuthError(e.code ?? e.message));
  }, [user]);

  const uid = user?.uid;
  const gid = useActiveGameId(uid);
  const game = useGame(gid);
  const pid = useBinding(gid, uid);
  const pack = packFor(game?.packId);

  if (authError) return <Screen><p className="er-mono er-mono--hot pt-10">Couldn&rsquo;t connect ({authError}). Check the wifi and reload.</p></Screen>;
  if (!uid || gid === undefined) return <Screen><Hold label="Connecting…" /></Screen>;
  if (!gid) return <Screen><Hold label="No game tonight yet. Ask the host." /></Screen>;
  if (!game || pid === undefined) return <Screen><Hold label="Opening the doors…" /></Screen>;
  if (!pid) {
    if (game.phase === 'finale') return <Screen><Hold label="This game has ended." /></Screen>;
    return <Arrival gid={gid} uid={uid} pack={pack} late={game.phase !== 'lobby'} />;
  }
  return <InGame gid={gid} game={game} pid={pid} pack={pack} />;
}

function InGame({ gid, game, pid, pack }) {
  const playersSub = usePlayers(gid);
  const players = useMemo(() => playersSub ?? [], [playersSub]);
  const role = useMyRole(gid, pid);
  const inbox = useInbox(gid, pid) ?? [];
  const action = useMyAction(gid, game.cycle, pid);
  const [tab, setTab] = useState({ key: 'now', phase: game.phase });

  // A phase change sends everyone back to Now, derived rather than set in an effect.
  const current = tab.phase === game.phase ? tab.key : 'now';
  const go = (key) => setTab({ key, phase: game.phase });

  const meDoc = players.find((p) => p.id === pid);
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);
  const nameOf = (id) => names[id] ?? 'someone';

  useEffect(() => {
    beat(gid, pid);
    const id = setInterval(() => beat(gid, pid), 60_000);
    return () => clearInterval(id);
  }, [gid, pid]);

  // The first tap anywhere unlocks Web Audio for the reveal bell (browsers need a gesture).
  useEffect(() => {
    const prime = () => primeTypeSound();
    window.addEventListener('pointerdown', prime, { once: true });
    return () => window.removeEventListener('pointerdown', prime);
  }, []);

  if (!meDoc) return <Screen><Hold label="Finding your seat…" /></Screen>;
  const me = { ...meDoc, pid };

  const sorted = [...inbox].sort((a, b) => (b.cycle - a.cycle) || (a.at ?? 0) - (b.at ?? 0));
  const tonight = sorted.filter((d) => d.cycle === game.cycle && d.kind !== 'recruitOffer');
  const offered = inbox.some((d) => d.kind === 'recruitOffer' && d.cycle === game.cycle);
  const line = nowLine({
    phase: game.phase, role: role?.role, status: me.status, isRecruitTarget: offered,
    hasActed: Boolean(action) && game.phase === 'night',
  });

  return (
    <Screen className="pb-20">
      <PhaseBar game={game} right={me.status === 'ghost' ? <span className="er-tag er-tag--ghost">Ghost</span> : null} />
      <NowCard line={line} />

      {current === 'now' && <NowScreen gid={gid} game={game} me={me} role={role} players={players} pack={pack} nameOf={nameOf} tonight={tonight} offered={offered} />}
      {current === 'clues' && <Clues items={sorted} pack={pack} nameOf={nameOf} />}
      {current === 'guests' && <Guests players={players} me={me} />}
      {current === 'talk' && <Talk gid={gid} me={me} role={role} />}
      {current === 'me' && <Me gid={gid} game={game} me={me} role={role} nameOf={nameOf} />}

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-ink border-t border-line">
        <ul className="mx-auto max-w-md grid grid-cols-5">
          {TABS.map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => go(key)}
                className={`er-touch w-full py-3 font-mono text-[11px] uppercase tracking-[0.14em] ${current === key ? 'text-bone border-t-2 border-signal -mt-px' : 'text-dim'}`}
                aria-current={current === key ? 'page' : undefined}
              >
                <span className={`relative ${key === 'clues' && tonight.length > 0 && current !== 'clues' ? 'pr-3' : ''}`}>
                  {label}
                  {key === 'clues' && tonight.length > 0 && current !== 'clues' && <span className="er-badge" aria-label={`${tonight.length} new`}>{tonight.length}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </Screen>
  );
}

function NowScreen({ gid, game, me, role, players, pack, nameOf, tonight, offered }) {
  if (me.status === 'vanished') return <p className="font-typewriter text-[18px] text-dim mt-6">You left the party. Your secret left with you.</p>;
  if (LOCKED.has(game.phase)) return <Hold label="The host is counting…" />;

  switch (game.phase) {
    case 'lobby':
      return <Lobby players={players} pack={pack} />;
    case 'casting':
      return <RoleReveal game={game} gid={gid} role={role} nameOf={nameOf} />;
    case 'night':
      return <Night gid={gid} game={game} me={me} role={role} players={players} pack={pack} nameOf={nameOf} />;
    case 'recruit':
      return <RecruitScreen gid={gid} game={game} me={me} offered={offered} />;
    case 'dawn':
      return <DawnReveal game={game} me={me} pack={pack} nameOf={nameOf} tonight={tonight} />;
    case 'investigation':
      return (
        <div className="mt-6 space-y-3">
          {tonight.length === 0 && <p className="font-typewriter text-[17px] text-dim">You found nothing last night. Others did. Ask them.</p>}
          {tonight.map((t) => (t.kind === 'fact' ? <ClueCard key={t.id} pack={pack} fact={t.fact} cycle={t.cycle} via={t.via} /> : <DeliveryCard key={t.id} d={t} nameOf={nameOf} />))}
        </div>
      );
    case 'roundtable':
    case 'revote':
    case 'endgame':
      return <Vote gid={gid} game={game} me={me} players={players} nameOf={nameOf} />;
    case 'banish':
      return <BanishReveal key={game.ballot} game={game} pack={pack} nameOf={nameOf} me={me} />;
    case 'finale':
      return <Finale game={game} pack={pack} players={players} nameOf={nameOf} />;
    default:
      return <Hold />;
  }
}

function Lobby({ players, pack }) {
  const here = players.filter((p) => p.status === 'alive');
  return (
    <div className="mt-6">
      <h1 className="er-title">{pack.title}</h1>
      <div className="mt-4 space-y-2">
        {pack.setting.map((l, i) => (
          <p key={i} className="font-typewriter text-[17px] text-dim leading-snug">{l}</p>
        ))}
      </div>
      <p className="er-mono mt-6">
        <span className="er-num text-[22px] mr-2">{here.length}</span> guests at the door
      </p>
    </div>
  );
}

function Clues({ items, pack, nameOf }) {
  const shown = items.filter((d) => d.kind !== 'recruitOffer');
  if (!shown.length) return <p className="font-typewriter text-[17px] text-dim mt-6">Nothing yet. Clues arrive at dawn.</p>;
  return (
    <div className="mt-6 space-y-3">
      {shown.map((t) => (t.kind === 'fact' ? <ClueCard key={t.id} pack={pack} fact={t.fact} cycle={t.cycle} via={t.via} /> : <DeliveryCard key={t.id} d={t} nameOf={nameOf} />))}
    </div>
  );
}

const STATUS_WORD = { alive: '', ghost: 'Ghost', vanished: 'Left' };

function Guests({ players, me }) {
  const order = { alive: 0, ghost: 1, vanished: 2 };
  const list = [...players].sort((a, b) => (order[a.status] - order[b.status]) || a.name.localeCompare(b.name));
  const alive = players.filter((p) => p.status === 'alive').length;
  return (
    <div className="mt-6">
      <p className="er-mono"><span className="er-num text-[22px] mr-2">{alive}</span> still in the room</p>
      <ul className="mt-3 divide-y divide-line-faint">
        {list.map((p) => (
          <li key={p.id} className={`flex items-center justify-between gap-3 py-3 ${p.status !== 'alive' ? 'opacity-60' : ''}`}>
            <span className="font-typewriter text-[17px] text-bone truncate">
              {p.name}{p.id === me.pid ? ' (you)' : ''}
            </span>
            <span className="er-mono shrink-0">
              {p.cause === 'banished' && p.revealedRole ? (p.revealedRole === 'killer' ? 'Killer · banished' : 'Faithful · banished') : STATUS_WORD[p.status]}
              {p.cause === 'murdered' ? ' · murdered' : ''}
              {p.table && p.status === 'alive' ? `Table ${p.table}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Talk({ gid, me, role }) {
  const spirits = me.status === 'ghost' || (role?.role === 'medium' && me.status === 'alive');
  const [channel, setChannel] = useState(spirits && me.status === 'ghost' ? 'mediumChat' : 'chat');
  return (
    <div className="mt-6">
      {spirits && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[['chat', 'The room'], ['mediumChat', 'Spirits']].map(([c, label]) => (
            <button key={c} type="button" onClick={() => setChannel(c)} className={`er-touch border py-2 font-mono text-[12px] uppercase tracking-[0.14em] ${channel === c ? 'border-signal text-bone' : 'border-line text-dim'}`}>{label}</button>
          ))}
        </div>
      )}
      <ChatPanel
        key={channel}
        gid={gid}
        channel={channel}
        me={me}
        canSend={channel === 'chat' ? me.status === 'alive' : true}
        placeholder={channel === 'mediumChat' ? 'Only ghosts and the Medium see this' : 'Say it to the room'}
      />
      {channel === 'chat' && me.status === 'ghost' && <p className="er-mono mt-3">The dead can read, but not speak here. Try Spirits.</p>}
    </div>
  );
}

function Me({ gid, game, me, role, nameOf }) {
  const [confirm, setConfirm] = useState(false);
  const leaving = Boolean(me.leaveRequestedAt);
  return (
    <div className="mt-2">
      {role && <RoleReveal game={game} gid={gid} role={role} nameOf={nameOf} compact />}
      <div className="er-card mt-6">
        <p className="er-mono">Leaving early?</p>
        {leaving ? (
          <>
            <p className="font-typewriter text-[16px] text-bone mt-2">You&rsquo;ll slip out at the next dawn. Your role stays secret.</p>
            <Action tone="ghost" className="mt-3" onClick={() => cancelLeave(gid, me.pid)}>Stay after all</Action>
          </>
        ) : confirm ? (
          <>
            <p className="font-typewriter text-[16px] text-bone mt-2">Sure? You can&rsquo;t come back as yourself.</p>
            <Action className="mt-3" onClick={() => requestLeave(gid, me.pid)}>Yes, I&rsquo;m leaving</Action>
          </>
        ) : (
          <Action tone="ghost" className="mt-3" onClick={() => setConfirm(true)}>Leave the game</Action>
        )}
      </div>
    </div>
  );
}
