import React, { useState } from 'react';
import { AppFrame } from '../ui';
import { Face } from '../art/Portrait';
import { NightSky, MoveGlyph } from '../art/NightArt';
import { NightFind } from './nightFind';
import NightTutorial from './NightTutorial';
import NightRoom, { NightSheet } from './NightRoom';
import { submitAction, submitDen } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction, useServerNow } from '../../hooks/useKillers';
import { NIGHT } from '../../data/killersCopy';
import Evidence from '../art/Evidence';
import { clueWords } from '../../data/packs/index.js';
import { markSeen, useSeen } from '../seen';
import { sfxSent, sfxTap } from '../sfx';

/**
 * Night: the one app whose icon is the same on every phone and whose inside
 * is different for every role.
 *
 * Every role sees the same screen: the sky on top (the moon waxes night by
 * night) with "Night N", then the lounge (NightRoom.jsx), the party seen from
 * high up with every guest standing at a table as their own drawn figure and
 * the computer in the corner, then a bar along the bottom that always says
 * the one thing to do next. A glance across the table can't tell a Killer's
 * phone from anyone's: only the sheet and the small markers differ.
 *
 * A move is two taps (the user's call, 2026-10-16): a tap on a guest, or on
 * the computer, opens a sheet with the moves that can be made there; a tap on
 * a move makes it. A stray tap on the room never sends anything. The move
 * then shows in the room (an eye over the guest you watch, a shield on the
 * one you protect, a dotted line between two traced phones, the computer lit
 * when you dig) and can be changed by tapping someone else, until the host
 * locks the night; once it is locked (night_locked, recruit, recruit_locked)
 * the room is read-only. Anyone who does nothing is treated as digging
 * through the logs (engine/night.js), so a distracted phone never wastes a role.
 *
 *   Faithful   a guest: Watch.            the computer: Dig through the logs.
 *   Detective  a guest: Watch, Trace.     the computer: Dig.
 *   Doctor     a guest (or themselves): Protect.
 *   Killer     a guest: Vote to kill (or, on a recruit night, Invite in).
 *   Ghost      a living guest: Pass a photo on (their one move since 2026-10-16).
 *
 * Unlike the rest of the phone, this app explains itself (the user's call
 * after playtesting, 2026-10-02): every move in a sheet says what it does
 * tonight and what arrives at dawn, with the full "how it works" folded under
 * it. Every word is NIGHT in killersCopy.js. On top of that (2026-10-03), the
 * first time a guest opens Night in a game, a hand-drawn tutorial
 * (NightTutorial.jsx) plays before their move, and the "?" replays it.
 *
 * A Killer's vote is the same vote as the poll in their group chat (KillPoll):
 * either way in writes the same den choice. The app never opens itself: the
 * Night icon's badge and the chapter card are the only nudges.
 */

const NIGHTTIME = new Set(['night', 'night_locked', 'recruit', 'recruit_locked']);

/** Saves a move. `onFail` undoes this phone's optimistic copy if the write is refused. */
const save = (fn, onFail) => fn().then(sfxSent).catch((e) => {
  console.warn('[night] not saved:', e.code ?? e.message);
  onFail?.();
});

export default function NightApp({ ctx, onClose }) {
  const { game, me, role, gid } = ctx;
  const open = game.phase === 'night';
  const locked = NIGHTTIME.has(game.phase) && !open;
  const tutKey = `${gid}.tut.night`;
  const seen = useSeen(tutKey, false);
  const [help, setHelp] = useState(false);
  const living = ctx.players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const isKiller = role?.role === 'killer' && me.status === 'alive';

  if (!NIGHTTIME.has(game.phase) || (!role && me.status !== 'ghost')) return <DayNight onClose={onClose} />;

  // The tutorial: once per game on its own, then whenever the "?" asks for it.
  if ((open && !seen) || help) {
    const intro = !help;
    return (
      <AppFrame top={<NightTop title={NIGHT.help} onBack={intro ? onClose : () => setHelp(false)} backLabel={intro ? 'Home' : 'Night'} />} dark className="os-nt-app" bodyClass="os-night os-night--tut">
        <NightTutorial
          mode={intro ? 'intro' : 'replay'}
          endsAt={open ? game.phaseEndsAt ?? 0 : 0}
          onDone={() => { if (intro) markSeen(tutKey, true); else setHelp(false); }}
        />
      </AppFrame>
    );
  }

  const props = { ...ctx, living, onClose, locked, onHelp: () => setHelp(true) };
  if (me.status === 'ghost') return <GhostNight {...props} />;
  if (isKiller) return <KillerNight {...props} />;
  if (role.role === 'doctor') return <DoctorNight {...props} />;
  return <FaithfulNight {...props} />;
}

// --- The header, the sky, the dock ----------------------------------------------------------

/**
 * Every Night screen's window, the same on every phone: a light header over
 * the night (back, "Night N" with the time left, find, "?"), a thin band of
 * sky with the role's one line, the body, and the dock floating at the
 * bottom. `game` turns the sky and the countdown on.
 */
function Frame({ onBack, backLabel = 'Home', onHelp, bar, overlay, children, game, line, players, locked }) {
  const [finding, setFinding] = useState(false);
  const findable = Boolean(players && players.filter((p) => p.status === 'alive' || p.status === 'ghost').length > 8);
  return (
    <AppFrame
      dark
      className="os-nt-app"
      bodyClass={`os-night os-night--room ${bar ? 'has-dock' : ''}`}
      top={(
        <NightTop
          title={game ? NIGHT.title(game.cycle) : 'Night'}
          sub={game ? <Countdown game={game} locked={locked} /> : null}
          onBack={onBack}
          backLabel={backLabel}
          onHelp={onHelp}
          onFind={findable ? () => setFinding(!finding) : null}
          finding={finding}
        />
      )}
      footer={bar}
      overlay={overlay}
    >
      {game && <Sky game={game} line={line} players={players} locked={locked} />}
      <NightFind.Provider value={{ finding, done: () => setFinding(false) }}>{children}</NightFind.Provider>
    </AppFrame>
  );
}

/** The header: back on the left, the night in the middle, find and "?" on the right. Nothing glossy. */
function NightTop({ title, sub, onBack, backLabel, onHelp, onFind, finding }) {
  return (
    <header className="os-nt-top">
      <div className="os-nt-top__side">
        {onBack && (
          <button type="button" className="os-nt-top__back" aria-label={`Back to ${backLabel}`} onClick={() => { sfxTap(); onBack(); }}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
            <span>{backLabel}</span>
          </button>
        )}
      </div>
      <div className="os-nt-top__mid">
        <h1 className="os-nt-top__title">{title}</h1>
        {sub && <p className="os-nt-top__sub">{sub}</p>}
      </div>
      <div className="os-nt-top__side os-nt-top__side--right">
        {onFind && (
          <button type="button" className={`os-nt-top__btn ${finding ? 'is-on' : ''}`} aria-label={NIGHT.room.find} aria-pressed={finding} onClick={() => { sfxTap(); onFind(); }}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
          </button>
        )}
        {onHelp && (
          <button type="button" className="os-nt-top__btn" aria-label={NIGHT.help} onClick={() => { sfxTap(); onHelp(); }}>
            <span className="os-nt-top__q">?</span>
          </button>
        )}
      </div>
    </header>
  );
}

/** The time left in the night, or "Locked in" once it is. */
function Countdown({ game, locked }) {
  const ends = game.phaseEndsAt ?? 0;
  const now = useServerNow(locked ? 0 : ends, 1000);
  const s = Math.max(0, Math.ceil((ends - now) / 1000));
  return locked ? NIGHT.over.kicker : ends ? NIGHT.left(s) : null;
}

const DayNight = ({ onClose }) => (
  <Frame onBack={onClose}>
    <div className="os-nt-day">
      <div className="os-nt-sky os-nt-sky--day">
        <NightSky cycle={1} />
      </div>
      <h2 className="os-nt-day__title">{NIGHT.day.title}</h2>
      <p className="os-nt-day__line">{NIGHT.day.line}</p>
    </div>
  </Frame>
);

/** A thin band of sky under the header: the moon of this night, the role's one line, the headcount. */
function Sky({ line, players, locked, game }) {
  const alive = players?.filter((p) => p.status === 'alive').length ?? 0;
  const gone = players?.filter((p) => p.status === 'ghost').length ?? 0;
  return (
    <header className="os-nt-sky os-nt-sky--room">
      <NightSky cycle={game.cycle} compact />
      <div className="os-nt-sky__text">
        {line && <p className="os-nt-sky__line">{locked ? NIGHT.over.line : line}</p>}
        {players && <p className="os-nt-sky__count">{NIGHT.count(alive, gone)}</p>}
      </div>
    </header>
  );
}

/**
 * The dock floating over the bottom of the room: the next thing to do, in
 * words; or, once a move is made, the move (who it is for, and that a tap on
 * anyone changes it), with a tick when sent and a lock once the night is.
 * `faces` are pids; `kind` is the icon when there is nobody to show.
 * `action` is a small text button on the right (the trace's Cancel).
 */
function Bar({ hint, label, sub, faces = [], traits, kind, action, locked = false }) {
  return (
    <div className={`os-nt-dock ${label ? 'is-move' : 'is-hint'}`} aria-live="polite">
      {label ? (
        <>
          {faces.length ? (
            <span className="os-nt-dock__faces">
              {faces.map((pid) => <Face key={pid} traits={traits} pid={pid} size={34} round />)}
            </span>
          ) : <span className="os-nt-dock__icon"><MoveGlyph kind={kind} size={20} /></span>}
          <span className="os-nt-dock__text">
            <span className="os-nt-dock__label">{label}</span>
            {sub && <span className="os-nt-dock__sub">{sub}</span>}
          </span>
          <span className={`os-nt-dock__state ${locked ? 'is-locked' : ''}`} aria-hidden="true">
            {locked
              ? <svg viewBox="0 0 24 24" width="13" height="13"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>
              : <svg viewBox="0 0 24 24" width="13" height="13"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}
          </span>
        </>
      ) : (
        <>
          <span className="os-nt-dock__tap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9.5 11V5.5a1.75 1.75 0 0 1 3.5 0V10l3.6.7a2 2 0 0 1 1.6 2.2l-.6 4.6a3 3 0 0 1-3 2.5h-3.2a3 3 0 0 1-2.4-1.2l-2.6-3.5a1.6 1.6 0 0 1 2.4-2.1Z" /></svg>
          </span>
          <p className="os-nt-dock__hint">{hint}</p>
        </>
      )}
      {action && <button type="button" className="os-nt-dock__action" onClick={() => { sfxTap(); action.onClick(); }}>{action.label}</button>}
    </div>
  );
}

/**
 * The move this phone holds tonight: what the server has, or what this phone
 * just sent (shown at once rather than after the round trip). `fresh` marks
 * the first look at a new one, so its marker pops once.
 */
function useSavedMove(action) {
  const [local, setLocal] = useState(null);
  const [fresh, setFresh] = useState(false);
  return {
    saved: local ?? action ?? null,
    fresh,
    commit: (a) => { setLocal(a); setFresh(true); },
    fail: () => { setLocal(null); setFresh(false); },
  };
}

/** An open sheet; it goes away when the night locks under it (the night never unlocks). */
function useSheet(locked) {
  const [sheet, setSheet] = useState(null);
  return [locked ? null : sheet, setSheet];
}

/** The room's markers for one move: { markers, computer, line }. */
function markersOf(a, mine = true) {
  if (!a) return { markers: {}, computer: null, line: null };
  if (a.kind === 'scour') return { markers: {}, computer: { kind: 'scour', mine }, line: null };
  if (a.kind === 'trace') {
    const t = a.targets ?? [];
    return { markers: Object.fromEntries(t.map((pid) => [pid, { kind: 'trace', mine }])), computer: null, line: t.length === 2 ? t : null };
  }
  return { markers: a.target ? { [a.target]: { kind: a.kind, mine } } : {}, computer: null, line: null };
}

const facesOf = (a) => (!a ? [] : a.kind === 'trace' ? a.targets ?? [] : a.target ? [a.target] : []);
const doneLine = (a, m, nameOf) => (a.kind === 'trace' ? m.done(...(a.targets ?? []).map(nameOf)) : m.done(nameOf(a.target)));

/** The bar for a saved move, or for none yet. */
function savedBar({ a, locked, hint, nameOf, traits, noneLine, noneKind = 'scour' }) {
  if (!a) return locked ? <Bar label={noneLine} sub={NIGHT.result} kind={noneKind} locked /> : <Bar hint={hint} />;
  const m = NIGHT.moves[a.kind] ?? NIGHT.moves.scour;
  return (
    <Bar
      label={doneLine(a, m, nameOf)}
      sub={locked ? NIGHT.result : NIGHT.room.change}
      faces={facesOf(a)}
      traits={traits}
      kind={a.kind in NIGHT.moves ? a.kind : 'scour'}
      locked={locked}
    />
  );
}

/** A move as a sheet option: its words from NIGHT.moves, a title for this guest. */
const optionOf = (kind, title, onPick, extra = {}) => {
  const m = NIGHT.moves[kind];
  return { kind, title, short: m.short, odds: m.odds, dawn: m.dawn, onPick, ...extra };
};

// --- Faithful, Detective ---------------------------------------------------------------------

function FaithfulNight({ gid, game, me, role, nameOf, players, traits, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const move = useSavedMove(action);
  const [sheet, setSheet] = useSheet(locked);
  const [traceA, setTraceA] = useState(null); // the Detective's first guest, while picking the second
  const detective = role.role === 'detective';
  const choose = (a) => {
    sfxTap();
    setSheet(null);
    setTraceA(null);
    move.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, { target: null, ...a }), move.fail);
  };
  const a = locked ? move.saved ?? { kind: 'scour', none: true } : move.saved;
  const shown = markersOf(a);
  const isAlive = (pid) => players.some((p) => p.id === pid && p.status === 'alive');

  let overlay = null;
  if (sheet?.computer) {
    overlay = (
      <NightSheet
        title={NIGHT.room.computer.title}
        sub={NIGHT.room.computer.line}
        options={[optionOf('scour', NIGHT.moves.scour.title, () => choose({ kind: 'scour' }), { on: move.saved?.kind === 'scour' })]}
        how={NIGHT.moves.scour.how}
        onCancel={() => setSheet(null)}
      />
    );
  } else if (sheet?.pid) {
    const pid = sheet.pid;
    const name = nameOf(pid);
    if (pid === me.pid) {
      overlay = <NightSheet pid={pid} traits={traits} nameOf={nameOf} note={NIGHT.room.selfLine} onCancel={() => setSheet(null)} />;
    } else if (traceA) {
      const m = NIGHT.moves.trace;
      overlay = (
        <NightSheet
          pid={pid}
          traits={traits}
          nameOf={nameOf}
          options={[optionOf('trace', m.verb(nameOf(traceA), name), () => choose({ kind: 'trace', targets: [traceA, pid] }))]}
          how={m.how}
          onCancel={() => setSheet(null)}
        />
      );
    } else {
      const options = [optionOf('watch', NIGHT.moves.watch.verb(name), () => choose({ kind: 'watch', target: pid }), { on: move.saved?.kind === 'watch' && move.saved.target === pid })];
      if (detective) {
        options.push(optionOf('trace', NIGHT.room.traceWith(name), () => { sfxTap(); setSheet(null); setTraceA(pid); }, { short: NIGHT.room.traceShort, dawn: NIGHT.moves.trace.dawn }));
      }
      overlay = <NightSheet pid={pid} traits={traits} nameOf={nameOf} options={options} how={detective ? [...NIGHT.moves.watch.how, ...NIGHT.moves.trace.how] : NIGHT.moves.watch.how} onCancel={() => setSheet(null)} />;
    }
  }

  // While a Detective picks the second guest, the first is ringed and the bar says so.
  const picking = traceA && !locked ? { ...shown, markers: { [traceA]: { kind: 'trace', mine: false } }, computer: null, line: null } : shown;
  const bar = traceA && !locked
    ? <Bar hint={NIGHT.room.traceNext(nameOf(traceA))} action={{ label: NIGHT.room.cancel, onClick: () => setTraceA(null) }} />
    : savedBar({ a: a?.none ? null : a, locked, hint: detective ? NIGHT.room.hint.detective : NIGHT.room.hint.faithful, nameOf, traits, noneLine: NIGHT.over.none });

  return (
    <Frame onBack={onClose} onHelp={onHelp} bar={bar} overlay={overlay} game={game} line={NIGHT.faithful.line} players={players} locked={locked}>
      <NightRoom
        players={players}
        me={me}
        traits={traits}
        nameOf={nameOf}
        canTap={(pid) => !locked && isAlive(pid) && pid !== traceA}
        onGuest={(pid) => setSheet({ pid })}
        onComputer={locked || traceA ? null : () => setSheet({ computer: true })}
        markers={picking.markers}
        computer={picking.computer}
        line={picking.line}
        selected={sheet?.pid ?? traceA}
        fresh={move.fresh}
      />
    </Frame>
  );
}

// --- Doctor ----------------------------------------------------------------------------------

function DoctorNight({ gid, game, me, nameOf, traits, players, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const last = useMyAction(gid, game.cycle - 1, me.pid);
  const move = useSavedMove(action?.kind === 'protect' ? action : null);
  const [sheet, setSheet] = useSheet(locked);
  const barred = last?.kind === 'protect' ? last.target : null;
  const m = NIGHT.moves.protect;
  const confirm = (pid) => {
    sfxTap();
    setSheet(null);
    const a = { kind: 'protect', target: pid };
    move.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, a), move.fail);
  };
  const shown = markersOf(move.saved);

  let overlay = null;
  if (sheet?.computer) {
    overlay = <NightSheet title={NIGHT.room.computer.title} sub={NIGHT.room.computer.line} note={NIGHT.room.computer.doctor} onCancel={() => setSheet(null)} />;
  } else if (sheet?.pid) {
    const pid = sheet.pid;
    const title = pid === me.pid ? NIGHT.room.protectSelf : m.verb(nameOf(pid));
    overlay = (
      <NightSheet
        pid={pid}
        traits={traits}
        nameOf={nameOf}
        options={[optionOf('protect', title, () => confirm(pid), { off: pid === barred ? m.barred : null, on: move.saved?.target === pid, dawn: NIGHT.room.protectDawn })]}
        how={m.how}
        onCancel={() => setSheet(null)}
      />
    );
  }

  return (
    <Frame onBack={onClose} onHelp={onHelp} bar={savedBar({ a: move.saved, locked, hint: NIGHT.room.hint.doctor, nameOf, traits, noneLine: NIGHT.room.noProtect, noneKind: 'protect' })} overlay={overlay} game={game} line={m.line} players={players} locked={locked}>
      <NightRoom
        players={players}
        me={me}
        traits={traits}
        nameOf={nameOf}
        canTap={(pid) => !locked && players.some((p) => p.id === pid && p.status === 'alive')}
        onGuest={(pid) => setSheet({ pid })}
        onComputer={locked ? null : () => setSheet({ computer: true })}
        markers={shown.markers}
        tag={(pid) => (pid === barred && !locked ? { kind: 'barred', label: m.barred } : null)}
        selected={sheet?.pid}
        fresh={move.fresh}
      />
    </Frame>
  );
}

// --- Killers ---------------------------------------------------------------------------------

function KillerNight({ gid, game, me, nameOf, players, traits, mates, onClose, locked, onHelp }) {
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const [sheet, setSheet] = useSheet(locked);
  const [fresh, setFresh] = useState(false);
  const recruit = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const key = recruit ? 'recruit' : 'victim';
  const copy = recruit ? NIGHT.recruit : NIGHT.killer;
  const mine = den.find((d) => d.pid === me.pid)?.[key] ?? null;
  const group = new Set((mates ?? []).map((m) => m.id));

  // The tally: who leads, and by how much.
  const tally = {};
  for (const d of den) if (d[key]) tally[d[key]] = (tally[d[key]] ?? 0) + 1;
  const top = Math.max(0, ...Object.values(tally));
  const leaders = Object.keys(tally).filter((p) => tally[p] === top);
  const status = !top ? null : leaders.length > 1 ? NIGHT.killer.tied : NIGHT.killer.lead(top);

  const alive = (pid) => players.some((p) => p.id === pid && p.status === 'alive');
  const pickOf = (pid) => den.find((d) => d.pid === pid)?.[key] ?? null;
  const vote = (pid) => {
    sfxTap();
    setSheet(null);
    setFresh(true);
    submitDen(gid, game.cycle, me.pid, { [key]: pid })
      .then(sfxSent)
      .catch((e) => console.warn('[poll] not saved:', e.code ?? e.message));
  };

  // On each guest voted for: the hunt picture (green if it is yours) and the partners' faces.
  const markers = {};
  for (const d of den) {
    const t = d[key];
    if (!t) continue;
    const mk = markers[t] ?? { kind: recruit ? 'recruit' : 'hunt', mine: false, faces: [] };
    if (d.pid === me.pid) mk.mine = true;
    else mk.faces.push(d.pid);
    markers[t] = mk;
  }

  let overlay = null;
  if (sheet?.computer) {
    overlay = <NightSheet title={NIGHT.room.computer.title} sub={NIGHT.room.computer.line} note={NIGHT.room.computer.killer} onCancel={() => setSheet(null)} />;
  } else if (sheet?.pid) {
    const pid = sheet.pid;
    if (pid === me.pid) {
      overlay = <NightSheet pid={pid} traits={traits} nameOf={nameOf} note={NIGHT.room.selfLine} onCancel={() => setSheet(null)} />;
    } else if (group.has(pid)) {
      const pick = pickOf(pid);
      overlay = <NightSheet pid={pid} traits={traits} nameOf={nameOf} note={NIGHT.room.partnerLine(pick ? nameOf(pick) : null)} onCancel={() => setSheet(null)} />;
    } else {
      const name = nameOf(pid);
      const voters = den.filter((d) => d[key] === pid && d.pid !== me.pid).map((d) => nameOf(d.pid));
      overlay = (
        <NightSheet
          pid={pid}
          traits={traits}
          nameOf={nameOf}
          note={voters.length ? NIGHT.room.alsoVote(voters) : null}
          options={[{
            kind: recruit ? 'recruit' : 'hunt',
            title: recruit ? NIGHT.room.invite(name) : NIGHT.room.vote(name),
            short: recruit ? NIGHT.room.inviteShort : NIGHT.room.voteShort,
            on: mine === pid,
            onPick: () => vote(pid),
          }]}
          how={copy.how}
          onCancel={() => setSheet(null)}
        />
      );
    }
  }

  let bar;
  if (locked) {
    bar = <Bar label={leaders.length === 1 ? NIGHT.killer.top(nameOf(leaders[0])) : NIGHT.killer.closed} sub={NIGHT.result} faces={leaders.length === 1 ? leaders : []} traits={traits} kind={recruit ? 'recruit' : 'hunt'} locked />;
  } else if (mine) {
    bar = (
      <Bar
        label={NIGHT.killer.mineBar(nameOf(mine))}
        sub={status ? (leaders.length > 1 || leaders.includes(mine) ? status : NIGHT.killer.leads(nameOf(leaders[0]))) : NIGHT.room.change}
        faces={[mine]}
        traits={traits}
      />
    );
  } else {
    bar = <Bar hint={recruit ? NIGHT.room.hint.recruit : NIGHT.room.hint.killer} />;
  }

  return (
    <Frame onBack={onClose} onHelp={onHelp} bar={bar} overlay={overlay} game={game} line={copy.line} players={players} locked={locked}>
      <NightRoom
        players={players}
        me={me}
        traits={traits}
        nameOf={nameOf}
        canTap={(pid) => !locked && Boolean(mates) && alive(pid)}
        onGuest={(pid) => setSheet({ pid })}
        onComputer={locked ? null : () => setSheet({ computer: true })}
        markers={markers}
        tag={(pid) => (group.has(pid) && pid !== me.pid ? { kind: 'mate', label: NIGHT.room.partner } : null)}
        selected={sheet?.pid}
        fresh={fresh}
      />
    </Frame>
  );
}

// --- Ghosts ----------------------------------------------------------------------------------

/** The true clue photos this ghost holds (their own, via 'ghost'), one per clue, newest first. */
function heldPhotos(inbox) {
  const out = [];
  for (const d of [...(inbox ?? [])].sort((a, b) => (b.at ?? 0) - (a.at ?? 0))) {
    if (d.kind !== 'fact' || d.via !== 'ghost' || !d.fact) continue;
    if (!out.some((h) => h.fact.trait === d.fact.trait && h.fact.group === d.fact.group)) out.push(d);
  }
  return out;
}

/**
 * A ghost's night: tap a living guest, then tap the one of their true clue
 * photos that guest gets (engine/night.js checks they really hold it). That is
 * a ghost's only move: the whisper was cut on 2026-10-16 (the user's call).
 * The photo arrives whole in the guest's Photos at dawn, nothing to type.
 */
function GhostNight({ gid, game, me, pack, nameOf, traits, players, inbox, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const move = useSavedMove(action?.kind === 'pass' && action.target ? action : null);
  const [sheet, setSheet] = useSheet(locked);
  const held = heldPhotos(inbox);
  const send = (a) => {
    sfxTap();
    setSheet(null);
    move.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, a), move.fail);
  };
  const shown = markersOf(move.saved);

  let overlay = null;
  if (sheet?.computer) {
    overlay = <NightSheet title={NIGHT.room.computer.title} sub={NIGHT.room.computer.line} note={NIGHT.room.computer.ghost} onCancel={() => setSheet(null)} />;
  } else if (sheet?.pid) {
    const pid = sheet.pid;
    const close = () => setSheet(null);
    overlay = held.length ? (
      <NightSheet pid={pid} traits={traits} nameOf={nameOf} sub={NIGHT.room.photoFor(nameOf(pid))} how={NIGHT.moves.pass.how} onCancel={close}>
        <div className="os-ns__photos">
          {held.map((d) => {
            const on = move.saved?.target === pid && move.saved.fact?.trait === d.fact.trait && move.saved.fact?.group === d.fact.group;
            return (
              <button key={d.id} type="button" aria-pressed={on} onClick={() => send({ kind: 'pass', target: pid, fact: d.fact })} className={`os-ns__photo ${on ? 'is-on' : ''}`}>
                <Evidence fact={d.fact} seed={d.id} pack={pack} stamp={`D${d.cycle}`} thumb />
                <span className="os-ns__cap">{clueWords(pack, d.fact).plain}</span>
              </button>
            );
          })}
        </div>
      </NightSheet>
    ) : (
      <NightSheet pid={pid} traits={traits} nameOf={nameOf} note={NIGHT.moves.pass.none} how={NIGHT.moves.pass.how} onCancel={close} />
    );
  }

  return (
    <Frame onBack={onClose} onHelp={onHelp} bar={savedBar({ a: move.saved, locked, hint: NIGHT.room.hint.ghost, nameOf, traits, noneLine: NIGHT.over.noneGhost, noneKind: 'pass' })} overlay={overlay} game={game} line={NIGHT.ghost.line} players={players} locked={locked}>
      <NightRoom
        players={players}
        me={me}
        traits={traits}
        nameOf={nameOf}
        canTap={(pid) => !locked && players.some((p) => p.id === pid && p.status === 'alive')}
        onGuest={(pid) => setSheet({ pid })}
        onComputer={locked ? null : () => setSheet({ computer: true })}
        markers={shown.markers}
        selected={sheet?.pid}
        fresh={move.fresh}
      />
    </Frame>
  );
}
