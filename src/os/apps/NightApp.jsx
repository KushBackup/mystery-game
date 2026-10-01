import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, GuestPicker } from '../ui';
import { Thread, Compose } from './MessagesApp';
import { submitAction, submitDen } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction, useKillerIds } from '../../hooks/useKillers';
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
 * Killers keep their den here all game, day or night: it is their only safe
 * channel.
 */

const save = (fn) => fn().then(sfxSent).catch((e) => console.warn('[night] not saved:', e.code ?? e.message));

export default function NightApp({ ctx, onClose }) {
  const { game, me, role } = ctx;
  const night = game.phase === 'night';
  const living = ctx.players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const props = { ...ctx, living };
  const isKiller = role?.role === 'killer' && me.status === 'alive';

  let body;
  if (me.status === 'ghost') body = night ? <GhostNight {...props} /> : <Sleeping line="Ghosts whisper at night. One word, to one living guest." />;
  else if (!role) body = <Sleeping line="Your role arrives when the host deals." />;
  else if (isKiller) body = <KillerDen {...props} night={night} />;
  else if (!night) body = <Sleeping line="Nothing to do until night falls. Go and talk to people." />;
  else if (role.role === 'doctor') body = <DoctorNight {...props} />;
  else body = <FaithfulNight {...props} />;

  return (
    <AppFrame title="Night" onBack={onClose} tone="dark" dark bodyClass="os-term">
      <ConsoleHead me={me} game={game} night={night} />
      {body}
    </AppFrame>
  );
}

/**
 * The console's header. Everyone's reads the same way (name, table, night), so
 * the screen gives nothing away to the guest leaning over your shoulder.
 */
function ConsoleHead({ me, game, night }) {
  return (
    <div className="os-term__head" aria-hidden="true">
      <p>DEEP BLUE · Night console</p>
      <p><b>{me.name}</b>{me.table ? ` · Table ${me.table}` : ''}{me.status === 'ghost' ? ' · No signal' : ''}</p>
      <p className="os-cursor">{night ? `Night ${game.cycle} · session open` : 'Session closed'}</p>
    </div>
  );
}

const Sleeping = ({ line }) => (
  <div className="os-term__log">
    <p>{line}</p>
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
    ...(detective ? [['trace', 'Trace two phones', 'Did either of them do tonight’s hacking?']] : []),
    ...(medium ? [['seance', 'Hold a séance', 'See a ghost’s clue, and learn if they were a Killer']] : []),
    ['watch', 'Watch a guest', 'See if they slip away tonight'],
    ['scour', 'Dig through the logs', 'A clue photo arrives with the board'],
  ];

  return (
    <>
      <Section head="Tonight I will…">
        <Group dark>
          {options.map(([k, title, sub]) => (
            <Cell key={k} title={title} sub={sub} on={kind === k} onClick={() => { setMode(k); if (k === 'scour') choose('scour'); }} />
          ))}
        </Group>
      </Section>
      {kind === 'watch' && (
        <Section head="Who do you watch?">
          <GuestPicker guests={others} value={action?.kind === 'watch' ? action.target : null} onPick={(pid) => choose('watch', pid)} />
        </Section>
      )}
      {kind === 'seance' && (
        <Section head="Summon which ghost?" foot="Their clue tonight is always true. They can still lie to you in Spirits.">
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
    <Section head={`Trace whose phones? ${current.length}/2`} foot="“Neither” clears them of tonight only, not of being a Killer.">
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
      <Section head="Firewall whose score tonight?" foot="If the Killers rig them, the rig bounces. But the deep still takes someone: the lowest honest score.">
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

function KillerDen({ gid, game, me, living, nameOf, den: denChat, night }) {
  const mates = useKillerIds(gid, true) ?? [];
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const mine = den.find((d) => d.pid === me.pid) ?? {};
  const livingMates = living.filter((g) => mates.includes(g.pid));
  const targets = living.filter((g) => !mates.includes(g.pid));
  const recruitNight = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const canFrame = meta && !meta.plantUsed && !recruitNight;
  const [framing, setFraming] = useState(false);
  const [tab, setTab] = useState('plan');

  const pickCount = (key) => (g) => {
    const n = den.filter((d) => d[key] === g.pid).length;
    return n ? `${n} of ${livingMates.length} chose` : null;
  };
  const set = (patch) => save(() => submitDen(gid, game.cycle, me.pid, patch));
  const rigCount = (v) => den.filter((d) => (d.rig ?? null) === v).length;

  return (
    <>
      <div className="flex gap-1 p-2 bg-black/40 border-b border-white/10">
        {[['plan', night ? 'Tonight' : 'Plan'], ['den', 'Admins chat']].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 os-btn os-btn--sm ${tab === k ? '' : 'os-btn--dark'}`}>{label}</button>
        ))}
      </div>

      {tab === 'den' ? (
        <div className="flex flex-col" style={{ minHeight: 'calc(100% - 52px)' }}>
          <Thread messages={denChat ?? []} me={me} empty="Only Killers can read this. Plan here." />
          <Compose gid={gid} channel="denChat" me={me} placeholder="Only Killers see this" />
        </div>
      ) : !night ? (
        <>
          <Sleeping line="Admin tools open at nightfall. Still play the run: last place is dangerous for you too." />
        </>
      ) : (
        <>
          {recruitNight ? (
            <Section head="Recruit night: who joins you?" foot="A Killer went home. Call one guest. If they refuse, their score sinks.">
              <GuestPicker guests={targets} value={mine.recruit} note={pickCount('recruit')} onPick={(pid) => set({ recruit: pid })} />
            </Section>
          ) : (
            <Section head="Sink whose score?" foot="Tomorrow they finish last on the board, whatever they really scored.">
              <GuestPicker guests={targets} value={mine.victim} note={pickCount('victim')} onPick={(pid) => set({ victim: pid })} />
            </Section>
          )}

          <Section head="Who does the hacking?" foot="Tonight's clue photos will describe them. Take turns.">
            <GuestPicker guests={livingMates} value={mine.hand} note={pickCount('hand')} onPick={(pid) => set({ hand: pid })} />
          </Section>

          {!recruitNight && (
            <Section head="Rig it to…">
              <Group dark>
                <Cell title="Zero" sub={`Blatant. Everyone sees the zero.${rigCount('zero') ? ` · ${rigCount('zero')} chose` : ''}`} on={(mine.rig ?? 'zero') === 'zero'} onClick={() => set({ rig: 'zero' })} />
                <Cell title="Just below last place" sub={`Subtle. Looks like a bad run.${rigCount('under') ? ` · ${rigCount('under')} chose` : ''}`} on={mine.rig === 'under'} onClick={() => set({ rig: 'under' })} />
              </Group>
            </Section>
          )}

          {canFrame && !framing && !mine.frame && (
            <div className="px-4 mt-5">
              <button type="button" className="os-btn os-btn--dark os-btn--sm" onClick={() => setFraming(true)}>Frame someone tonight (once per game)</button>
            </div>
          )}
          {canFrame && (framing || mine.frame) && (
            <Section head="Frame someone (once per game)" foot="One of tonight's photos will fit them instead. Tap them again to cancel.">
              <GuestPicker
                guests={targets.filter((g) => g.pid !== mine.victim)}
                value={mine.frame}
                note={pickCount('frame')}
                onPick={(pid) => set({ frame: mine.frame === pid ? null : pid })}
              />
            </Section>
          )}

          <Locked text={mine.victim || mine.recruit ? `Your pick: ${nameOf(mine.victim ?? mine.recruit)}. The majority decides; ties break by fate.` : null} />
        </>
      )}
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

/** What the console has logged for you tonight, and the one thing to do next: nothing. */
const Locked = ({ text }) => (text ? (
  <div className="os-term__log pb-6">
    <p>Logged: {text}</p>
    <p className="os-cursor">Put your phone face down. Wait for the alarm.</p>
  </div>
) : <div className="h-8" />);
