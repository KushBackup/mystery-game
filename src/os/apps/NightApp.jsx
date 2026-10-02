import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, GuestPicker, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import { Face } from '../art/Portrait';
import KillPoll from './KillPoll';
import { pollQuestion } from '../threads';
import { submitAction } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction } from '../../hooks/useKillers';
import { NIGHT } from '../../data/killersCopy';
import { sfxSent, sfxTap } from '../sfx';

/**
 * Night: the one app whose icon is the same on every phone and whose inside
 * is different for every role.
 *
 * Unlike the rest of the phone, this app explains itself (the user's call
 * after playtesting, 2026-10-02: nobody could tell what "Watch a guest" was
 * for). Each move is a card that says what it is for; tapping it opens the
 * move in full: what happens tonight, what arrives at dawn, and why you would
 * pick it, with the choice underneath. Once a move is saved the app shows it
 * as done, with a way to change it. Every word is NIGHT in killersCopy.js.
 *
 * Every choice saves the moment it is made and can be changed until the host
 * locks the night. Anyone who does nothing is treated as digging through the
 * logs (engine/night.js), so a distracted phone never wastes a role.
 *
 * A Killer sees the poll from their group chat (KillPoll) under the same kind
 * of explanation. The app never opens itself: the Night icon's badge and the
 * chapter card are the only nudges.
 */

/** Saves a move. `onFail` undoes this phone's optimistic copy if the write is refused. */
const save = (fn, onFail) => fn().then(sfxSent).catch((e) => {
  console.warn('[night] not saved:', e.code ?? e.message);
  onFail?.();
});

export default function NightApp({ ctx, onClose }) {
  const { game, me, role } = ctx;
  const night = game.phase === 'night';
  const living = ctx.players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const props = { ...ctx, living, onClose };
  const isKiller = role?.role === 'killer' && me.status === 'alive';

  if (!night || (!role && me.status !== 'ghost')) return <DayNight onClose={onClose} />;
  if (me.status === 'ghost') return <GhostNight {...props} />;
  if (isKiller) return <KillerNight ctx={ctx} onClose={onClose} />;
  if (role.role === 'doctor') return <DoctorNight {...props} />;
  return <FaithfulNight {...props} />;
}

/** Every Night screen's window: the same dark console on every phone. */
const Frame = ({ onBack, backLabel = 'Home', enter, children }) => (
  <AppFrame title="Night" onBack={onBack} backLabel={backLabel} tone="dark" dark bodyClass="os-term" enter={enter}>
    {children}
  </AppFrame>
);

const DayNight = ({ onClose }) => (
  <Frame onBack={onClose}>
    <NightCard title={NIGHT.day.title} line={NIGHT.day.line} />
  </Frame>
);

// --- Pieces -----------------------------------------------------------------------------

/** The card at the top: which night it is, and what the night is for. */
function NightCard({ title, line, foot, players }) {
  const alive = players?.filter((p) => p.status === 'alive').length ?? 0;
  const gone = players?.filter((p) => p.status === 'ghost').length ?? 0;
  return (
    <div className="os-nightcard">
      <span className="os-nightcard__moon"><Glyph name="moon" size={22} /></span>
      <div className="min-w-0">
        <p className="os-nightcard__title">{title}</p>
        <p className="os-nightcard__line">{line}</p>
        {foot && <p className="os-nightcard__foot">{foot}</p>}
        {players && <p className="os-nightcard__count">{NIGHT.count(alive, gone)}</p>}
      </div>
    </div>
  );
}

/** A move on the list: its icon, its name, what it is for. Opens the move in full. */
function MoveCard({ kind, on, onClick }) {
  const m = NIGHT.moves[kind];
  return (
    <button type="button" className={`os-move ${on ? 'os-move--on' : ''}`} aria-pressed={on} onClick={() => { sfxTap(); onClick(); }}>
      <span className="os-move__icon"><Glyph name={m.glyph} size={24} /></span>
      <span className="os-move__main">
        <span className="os-move__title">{m.title}</span>
        <span className="os-move__short">{m.short}</span>
        {on && <span className="os-move__tag">Your move</span>}
      </span>
      <span className="os-move__chev"><Glyph name="forward" size={13} /></span>
    </button>
  );
}

/** A move in full: what it is, then how it plays out, row by row. */
function MoveHead({ kind }) {
  const m = NIGHT.moves[kind];
  return (
    <div className="os-movehead">
      <span className="os-move__icon os-move__icon--lg"><Glyph name={m.glyph} size={30} /></span>
      <p className="os-movehead__title">{m.title}</p>
      <p className="os-movehead__short">{m.short}</p>
    </div>
  );
}

const HowTo = ({ rows }) => (
  <dl className="os-howto">
    {rows.map(([label, text]) => (
      <div key={label} className="os-howto__row">
        <dt>{label}</dt>
        <dd>{text}</dd>
      </div>
    ))}
  </dl>
);

/** The move is saved: what you chose, when the result comes, and how to change it. */
function Done({ glyph, line, onChange }) {
  return (
    <div className="os-nightdone">
      <span className="os-nightdone__tick"><Glyph name="check" size={34} /></span>
      <p className="os-nightdone__kicker">Move saved</p>
      <p className="os-nightdone__line"><Glyph name={glyph} size={16} /> {line}</p>
      <p className="os-nightdone__sub">{NIGHT.result}<br />{NIGHT.change}</p>
      {onChange && <Btn tone="dark" small className="mt-5" onClick={onChange}>{NIGHT.changeBtn}</Btn>}
    </div>
  );
}

/**
 * Which screen a role with a saved move sees: the move it is reading
 * (`open`), its saved move, or the list. `local` is what this phone just
 * saved, shown at once rather than after the round trip.
 */
function useNightNav(action) {
  const [open, setOpen] = useState(null);
  const [changing, setChanging] = useState(false);
  const [local, setLocal] = useState(null);
  const [dir, setDir] = useState(null);
  const saved = local ?? action ?? null;
  return {
    open,
    dir,
    saved,
    view: open ? 'move' : saved && !changing ? 'done' : 'list',
    push: (k) => { setOpen(k); setDir('push'); },
    pop: () => { setOpen(null); setDir('pop'); },
    change: () => { setChanging(true); setDir('pop'); },
    commit: (a) => { setLocal(a); setChanging(false); setOpen(null); setDir('pop'); },
    fail: () => setLocal(null),
  };
}

// --- Faithful, Detective ---------------------------------------------------------------

function FaithfulNight({ gid, game, me, role, living, nameOf, players, traits, onClose }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const nav = useNightNav(action);
  const others = living.filter((g) => g.pid !== me.pid);
  const choose = (a) => {
    nav.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, { target: null, ...a }), nav.fail);
  };

  const moves = [
    ...(role.role === 'detective' ? ['trace'] : []),
    'watch',
    'scour',
  ];

  if (nav.view === 'move') {
    const k = nav.open;
    const m = NIGHT.moves[k];
    const current = nav.saved?.kind === k ? nav.saved : null;
    return (
      <Frame key="move" onBack={nav.pop} backLabel="Night" enter="push">
        <MoveHead kind={k} />
        <HowTo rows={m.how} />
        {k === 'scour' && (
          <div className="px-4 pt-6">
            <Btn className="w-full" onClick={() => choose({ kind: 'scour' })}>{m.cta}</Btn>
          </div>
        )}
        {k === 'watch' && (
          <Section head={m.pick}>
            <GuestPicker guests={others} traits={traits} value={current?.target} onPick={(pid) => choose({ kind: 'watch', target: pid })} />
          </Section>
        )}
        {k === 'trace' && <TracePick others={others} traits={traits} saved={current?.targets} onDone={(targets) => choose({ kind: 'trace', targets })} />}
      </Frame>
    );
  }

  if (nav.view === 'done') {
    const a = nav.saved;
    const m = NIGHT.moves[a.kind] ?? NIGHT.moves.scour;
    const line = a.kind === 'trace' ? m.done(...(a.targets ?? []).map(nameOf)) : m.done(nameOf(a.target));
    return (
      <Frame key="done" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
        <NightCard title={NIGHT.title(game.cycle)} line={NIGHT.faithful.line} players={players} />
        <Done glyph={m.glyph} line={line} onChange={nav.change} />
      </Frame>
    );
  }

  return (
    <Frame key="list" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
      <NightCard title={NIGHT.title(game.cycle)} line={NIGHT.faithful.line} foot={NIGHT.faithful.foot} players={players} />
      <Section head={NIGHT.faithful.head}>
        <div className="os-moves">
          {moves.map((k) => <MoveCard key={k} kind={k} on={nav.saved?.kind === k} onClick={() => nav.push(k)} />)}
        </div>
      </Section>
    </Frame>
  );
}

/** Two guests for the Detective's trace. The move saves once two are chosen; a third tap swaps out the oldest. */
function TracePick({ others, traits, saved = [], onDone }) {
  const [picks, setPicks] = useState(saved ?? []);
  const toggle = (pid) => {
    const next = picks.includes(pid) ? picks.filter((x) => x !== pid) : [...picks, pid].slice(-2);
    setPicks(next);
    if (next.length === 2) onDone(next);
  };
  return (
    <Section head={NIGHT.moves.trace.pick(picks.length)}>
      <Group dark>
        {others.map((g) => (
          <Cell key={g.pid} title={g.name} icon={traits ? <Face traits={traits} pid={g.pid} size={36} /> : undefined} on={picks.includes(g.pid)} onClick={() => toggle(g.pid)} />
        ))}
      </Group>
    </Section>
  );
}

// --- Doctor -----------------------------------------------------------------------------

function DoctorNight({ gid, game, me, living, nameOf, traits, players, onClose }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const last = useMyAction(gid, game.cycle - 1, me.pid);
  const nav = useNightNav(action?.kind === 'protect' ? action : null);
  const barred = last?.kind === 'protect' ? last.target : null;
  const m = NIGHT.moves.protect;
  const pick = (pid) => {
    const a = { kind: 'protect', target: pid };
    nav.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, a), nav.fail);
  };

  if (nav.view === 'done') {
    return (
      <Frame key="done" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
        <NightCard title={NIGHT.title(game.cycle)} line={m.line} players={players} />
        <Done glyph={m.glyph} line={m.done(nameOf(nav.saved.target))} onChange={nav.change} />
      </Frame>
    );
  }
  return (
    <Frame key="list" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
      <NightCard title={NIGHT.title(game.cycle)} line={m.line} players={players} />
      <MoveHead kind="protect" />
      <HowTo rows={m.how} />
      <Section head={m.pick}>
        <GuestPicker
          guests={living}
          traits={traits}
          value={nav.saved?.target}
          disabled={(g) => g.pid === barred}
          note={(g) => (g.pid === barred ? m.barred : g.pid === me.pid ? 'You' : null)}
          onPick={pick}
        />
      </Section>
    </Frame>
  );
}

// --- Killers ----------------------------------------------------------------------------

function KillerNight({ ctx, onClose }) {
  const { gid, game, me, nameOf, players } = ctx;
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const mine = den.find((d) => d.pid === me.pid) ?? {};
  const pick = mine.victim ?? mine.recruit;
  const recruit = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const copy = recruit ? NIGHT.recruit : NIGHT.killer;
  return (
    <Frame onBack={onClose}>
      <NightCard title={NIGHT.title(game.cycle)} line={copy.line} players={players} />
      <HowTo rows={copy.how} />
      <Section head={pollQuestion(meta, game.cycle)} foot={pick ? NIGHT.killer.mine(nameOf(pick)) : null}>
        <KillPoll ctx={ctx} dark />
      </Section>
    </Frame>
  );
}

// --- Ghosts -----------------------------------------------------------------------------

function GhostNight({ gid, game, me, living, pack, nameOf, traits, players, onClose }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const nav = useNightNav(action?.kind === 'whisper' && action.target ? action : null);
  const [word, setWord] = useState(null);
  const m = NIGHT.moves.whisper;
  const chosen = word ?? nav.saved?.word ?? null;
  const send = (target) => {
    if (!chosen) return;
    const a = { kind: 'whisper', word: chosen, target };
    nav.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, a), nav.fail);
  };

  if (nav.view === 'done') {
    return (
      <Frame key="done" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
        <NightCard title={NIGHT.title(game.cycle)} line={m.line} players={players} />
        <Done glyph={m.glyph} line={m.done(nameOf(nav.saved.target), nav.saved.word)} onChange={nav.change} />
      </Frame>
    );
  }
  return (
    <Frame key="list" onBack={onClose} enter={nav.dir === 'pop' ? 'pop' : undefined}>
      <NightCard title={NIGHT.title(game.cycle)} line={m.line} players={players} />
      <MoveHead kind="whisper" />
      <HowTo rows={m.how} />
      <Section head={m.word}>
        <div className="flex flex-wrap gap-2 px-1">
          {pack.whispers.map((w) => (
            <button key={w} type="button" onClick={() => { sfxTap(); setWord(w); }} className={`os-btn os-btn--sm ${chosen === w ? '' : 'os-btn--dark'}`}>{w}</button>
          ))}
        </div>
      </Section>
      {chosen && (
        <Section head={m.pick(chosen)}>
          <GuestPicker guests={living} traits={traits} value={nav.saved?.target} onPick={send} />
        </Section>
      )}
    </Frame>
  );
}
