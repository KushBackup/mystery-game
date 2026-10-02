import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, GuestPicker } from '../ui';
import KillPoll from './KillPoll';
import { pollQuestion } from '../threads';
import { submitAction } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction } from '../../hooks/useKillers';
import { sfxSent } from '../sfx';

/**
 * Night: the one app whose icon is the same on every phone and whose inside
 * is different for every role. A glance across the table at someone's home
 * screen gives nothing away; what they do in here does.
 *
 * Every choice saves the moment it is tapped and can be changed until the
 * host locks the night: there is no submit to forget. Anyone who does nothing
 * is treated as digging through the logs (engine/night.js), so a distracted
 * phone never wastes a role.
 *
 * Nothing here explains a rule. Each screen is the choice and nothing else;
 * what a choice does arrives as its result with the board. A Killer sees only
 * the poll from their group chat (KillPoll): the rest of a kill is automatic.
 * The app never opens itself: the Night icon's badge and the chapter card are
 * the only nudges.
 */

const save = (fn) => fn().then(sfxSent).catch((e) => console.warn('[night] not saved:', e.code ?? e.message));

export default function NightApp({ ctx, onClose }) {
  const { game, me, role } = ctx;
  const night = game.phase === 'night';
  const living = ctx.players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const props = { ...ctx, living };
  const isKiller = role?.role === 'killer' && me.status === 'alive';

  let body;
  if (!night) body = <Sleeping />;
  else if (me.status === 'ghost') body = <GhostNight {...props} />;
  else if (!role) body = <Sleeping />;
  else if (isKiller) body = <KillerNight ctx={ctx} />;
  else if (role.role === 'doctor') body = <DoctorNight {...props} />;
  else body = <FaithfulNight {...props} />;

  return (
    <AppFrame title="Night" onBack={onClose} tone="dark" dark bodyClass="os-term">
      <ConsoleHead me={me} game={game} night={night} players={ctx.players} />
      {body}
    </AppFrame>
  );
}

/**
 * The console's header. Everyone's reads the same way (name, table, night, and
 * the room's public headcount), so the screen gives nothing away to the guest
 * leaning over your shoulder.
 */
function ConsoleHead({ me, game, night, players }) {
  const online = players.filter((p) => p.status === 'alive').length;
  const lost = players.filter((p) => p.status === 'ghost').length;
  return (
    <div className="os-term__head" aria-hidden="true">
      <p>DEEP BLUE · Night console</p>
      <p><b>{me.name}</b>{me.table ? ` · Table ${me.table}` : ''}{me.status === 'ghost' ? ' · No signal' : ''}</p>
      <p className="os-term__dim">&gt; {online} handsets in range{lost ? ` · ${lost} not responding` : ''} · board.db synced</p>
      <p className="os-cursor">{night ? `Night ${game.cycle} · session open` : 'Session closed'}</p>
    </div>
  );
}

const Sleeping = () => (
  <div className="os-term__log">
    <p className="os-cursor" />
  </div>
);

// --- Faithful, Detective, Medium ---------------------------------------------------------

function FaithfulNight({ gid, game, me, role, living, nameOf, players }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const detective = role.role === 'detective';
  const ghosts = players.filter((p) => p.status === 'ghost').map((p) => ({ ...p, pid: p.id }));
  const medium = role.role === 'medium' && ghosts.length > 0;
  const [mode, setMode] = useState(null);
  const kind = mode ?? action?.kind ?? null;
  const others = living.filter((g) => g.pid !== me.pid);
  const choose = (k, target = null) => save(() => submitAction(gid, game.cycle, me.pid, { kind: k, target }));

  const options = [
    ...(detective ? [['trace', 'Trace two phones']] : []),
    ...(medium ? [['seance', 'Hold a séance']] : []),
    ['watch', 'Watch a guest'],
    ['scour', 'Dig through the logs'],
  ];

  return (
    <>
      <Section head="Tonight I will…">
        <Group dark>
          {options.map(([k, title]) => (
            <Cell key={k} title={title} on={kind === k} onClick={() => { setMode(k); if (k === 'scour') choose('scour'); }} />
          ))}
        </Group>
      </Section>
      {kind === 'watch' && (
        <Section head="Who do you watch?">
          <GuestPicker guests={others} value={action?.kind === 'watch' ? action.target : null} onPick={(pid) => choose('watch', pid)} />
        </Section>
      )}
      {kind === 'seance' && (
        <Section head="Summon which ghost?">
          <GuestPicker guests={ghosts} value={action?.kind === 'seance' ? action.target : null} onPick={(pid) => choose('seance', pid)} />
        </Section>
      )}
      {kind === 'trace' && <TracePick gid={gid} game={game} me={me} others={others} action={action} />}
      <Locked text={lockedLine(action, nameOf)} />
    </>
  );
}

/** Two guests for the Detective's trace. The action saves once two are chosen; a third tap swaps out the oldest. */
function TracePick({ gid, game, me, others, action }) {
  const saved = action?.kind === 'trace' ? action.targets ?? [] : [];
  const [picks, setPicks] = useState(null);
  const current = picks ?? saved;
  const toggle = (pid) => {
    const next = current.includes(pid) ? current.filter((x) => x !== pid) : [...current, pid].slice(-2);
    setPicks(next);
    if (next.length === 2) save(() => submitAction(gid, game.cycle, me.pid, { kind: 'trace', targets: next, target: null }));
  };
  return (
    <Section head={`Trace whose phones? ${current.length}/2`}>
      <Group dark>
        {others.map((g) => <Cell key={g.pid} title={g.name} sub={g.table ? `Table ${g.table}` : null} on={current.includes(g.pid)} onClick={() => toggle(g.pid)} />)}
      </Group>
    </Section>
  );
}

function lockedLine(action, nameOf) {
  if (!action) return null;
  switch (action.kind) {
    case 'scour': return 'Digging through the logs. You can change it.';
    case 'watch': return `Watching ${nameOf(action.target)}. You can change it.`;
    case 'seance': return `Summoning ${nameOf(action.target)}. You can change it.`;
    case 'trace': return `Tracing ${(action.targets ?? []).map(nameOf).join(' and ')}. You can change it.`;
    default: return null;
  }
}

// --- Doctor -----------------------------------------------------------------------------

function DoctorNight({ gid, game, me, living, nameOf }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const last = useMyAction(gid, game.cycle - 1, me.pid);
  const barred = last?.kind === 'protect' ? last.target : null;
  return (
    <>
      <Section head="Firewall whose score tonight?">
        <GuestPicker
          guests={living}
          value={action?.target}
          disabled={(g) => g.pid === barred}
          note={(g) => (g.pid === barred ? 'Firewalled last night' : g.pid === me.pid ? 'You' : null)}
          onPick={(pid) => save(() => submitAction(gid, game.cycle, me.pid, { kind: 'protect', target: pid }))}
        />
      </Section>
      <Locked text={action ? `Firewall on ${nameOf(action.target)}.` : null} />
    </>
  );
}

// --- Killers ----------------------------------------------------------------------------

function KillerNight({ ctx }) {
  const { gid, game, me, nameOf } = ctx;
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const mine = den.find((d) => d.pid === me.pid) ?? {};
  const pick = mine.victim ?? mine.recruit;
  return (
    <>
      <Section head={pollQuestion(meta, game.cycle)}>
        <KillPoll ctx={ctx} dark />
      </Section>
      <Locked text={pick ? `${nameOf(pick)}. You can change it.` : null} />
    </>
  );
}

// --- Ghosts -----------------------------------------------------------------------------

function GhostNight({ gid, game, me, living, pack, nameOf }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const [word, setWord] = useState(null);
  const chosen = word ?? action?.word ?? null;
  const send = (target) => chosen && save(() => submitAction(gid, game.cycle, me.pid, { kind: 'whisper', word: chosen, target }));
  return (
    <>
      <Section head="Whisper one word">
        <div className="flex flex-wrap gap-2">
          {pack.whispers.map((w) => (
            <button key={w} type="button" onClick={() => setWord(w)} className={`os-btn os-btn--sm ${chosen === w ? '' : 'os-btn--dark'}`}>{w}</button>
          ))}
        </div>
      </Section>
      {chosen && (
        <Section head={`Who hears “${chosen}”?`}>
          <GuestPicker guests={living} value={action?.target} onPick={send} />
        </Section>
      )}
      <Locked text={action?.target ? `${nameOf(action.target)} will hear “${action.word}” with the morning board.` : null} />
    </>
  );
}

/** What the console has logged for you tonight. */
const Locked = ({ text }) => (text ? (
  <div className="os-term__log pb-6">
    <p className="os-cursor">Logged: {text}</p>
  </div>
) : <div className="h-8" />);
