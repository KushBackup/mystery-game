import React, { useEffect, useRef, useState } from 'react';
import { AppFrame, Section, GuestPicker } from '../ui';
import { Face } from '../art/Portrait';
import { NightSky, MoveArt } from '../art/NightArt';
import KillPoll from './KillPoll';
import NightTutorial from './NightTutorial';
import { pollQuestion } from '../threads';
import { submitAction } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction, useServerNow } from '../../hooks/useKillers';
import { NIGHT } from '../../data/killersCopy';
import Evidence from '../art/Evidence';
import { clueWords } from '../../data/packs/index.js';
import { markSeen, useSeen } from '../seen';
import { prefersLessMotion } from '../nav';
import { sfxSent, sfxTap } from '../sfx';

/**
 * Night: the one app whose icon is the same on every phone and whose inside
 * is different for every role.
 *
 * Every screen is built the same way, whatever the role, so a glance across
 * the table can't tell a Killer's phone from anyone's: the sky on top (the
 * moon waxes night by night) with "Night N" in big type, then the move, then
 * a bar along the bottom that always says the one thing to do next. Only
 * small type differs by role.
 *
 * The flow is pick, then confirm. A tap on a move opens it; a tap on a guest
 * selects them, and the bar turns into "Watch Priya · Confirm". Only Confirm
 * saves, so a stray tap never sends a move. A saved move shows as a sealed
 * card with a way to change it until the host locks the night; once it is
 * locked (night_locked, recruit, recruit_locked) the card stays, read-only.
 * Anyone who does nothing is treated as digging through the logs
 * (engine/night.js), so a distracted phone never wastes a role.
 *
 * Unlike the rest of the phone, this app explains itself (the user's call
 * after playtesting, 2026-10-02): every move says what it does tonight, what
 * arrives at dawn and why to pick it. Every word is NIGHT in killersCopy.js.
 * On top of that (2026-10-03), the first time a guest opens Night in a game,
 * a hand-drawn tutorial (NightTutorial.jsx) plays before their move, and the
 * "?" in the bar replays it. It is the same on every phone: it explains every
 * role's move, never the guest's own.
 *
 * A Killer votes in the poll from their group chat (KillPoll); a tap there is
 * a vote, as in any poll, and can be changed. The app never opens itself: the
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
      <AppFrame title={NIGHT.help} onBack={intro ? onClose : () => setHelp(false)} backLabel={intro ? 'Home' : 'Night'} tone="dark" dark bodyClass="os-night os-night--tut">
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

// --- The frame, the sky, the bar ------------------------------------------------------------

/** Every Night screen's window: the same dark sky on every phone, a "?" for the tutorial, the action bar under it. */
const Frame = ({ onBack, backLabel = 'Home', enter, onHelp, bar, children }) => (
  <AppFrame
    title="Night"
    onBack={onBack}
    backLabel={backLabel}
    tone="dark"
    dark
    bodyClass="os-night"
    enter={enter}
    footer={bar}
    right={onHelp ? (
      <button type="button" className="os-barhit" aria-label={NIGHT.help} onClick={() => { sfxTap(); onHelp(); }}>
        <span className="os-barbtn os-nt-help">?</span>
      </button>
    ) : null}
  >
    {children}
  </AppFrame>
);

const DayNight = ({ onClose }) => (
  <Frame onBack={onClose}>
    <div className="os-nt-sky os-nt-sky--day">
      <NightSky cycle={1} />
      <div className="os-nt-sky__text">
        <h2 className="os-nt-sky__title">{NIGHT.day.title}</h2>
        <p className="os-nt-sky__line">{NIGHT.day.line}</p>
      </div>
    </div>
  </Frame>
);

/**
 * The sky on top: which night, the time left, and (small) what the night is
 * for. `compact` is the pick screens' shorter sky, without the line: their
 * head card says what the move is, and the guest list needs the room.
 */
function Sky({ game, line, players, locked, compact = false }) {
  const ends = game.phaseEndsAt ?? 0;
  const now = useServerNow(locked ? 0 : ends, 1000);
  const s = Math.max(0, Math.ceil((ends - now) / 1000));
  const alive = players?.filter((p) => p.status === 'alive').length ?? 0;
  const gone = players?.filter((p) => p.status === 'ghost').length ?? 0;
  return (
    <header className={`os-nt-sky ${compact ? 'os-nt-sky--compact' : ''}`}>
      <NightSky cycle={game.cycle} compact={compact} />
      <div className="os-nt-sky__text">
        <p className="os-nt-sky__kicker">{locked ? NIGHT.over.kicker : ends ? NIGHT.left(s) : ' '}</p>
        <h2 className="os-nt-sky__title">{NIGHT.title(game.cycle)}</h2>
        {line && !compact && <p className="os-nt-sky__line">{locked ? NIGHT.over.line : line}</p>}
        {players && !compact && <p className="os-nt-sky__count">{NIGHT.count(alive, gone)}</p>}
      </div>
    </header>
  );
}

/**
 * The bar along the bottom: the next thing to do, in words, and once there
 * is something to send, who it is for and Confirm. `faces` are pids.
 */
function Bar({ hint, label, faces = [], traits, onConfirm, kind }) {
  const ready = Boolean(onConfirm);
  return (
    <div className={`os-nt-bar ${ready ? 'is-ready' : ''}`}>
      {ready ? (
        <>
          <span className="os-nt-bar__who">
            {faces.length ? (
              <span className="os-nt-bar__faces">
                {faces.map((pid) => <Face key={pid} traits={traits} pid={pid} size={34} round />)}
              </span>
            ) : <MoveArt kind={kind} size={34} />}
            <span className="os-nt-bar__label">{label}</span>
          </span>
          <button type="button" className="os-nt-go" onClick={onConfirm}>{NIGHT.bar.confirm}</button>
        </>
      ) : (
        <p className="os-nt-bar__hint" aria-live="polite">{hint}</p>
      )}
    </div>
  );
}

// --- Pieces ---------------------------------------------------------------------------------

/** A move on the list: its picture, what it is for, what dawn brings. Opens the move. */
function MoveCard({ kind, on, off, onClick }) {
  const m = NIGHT.moves[kind];
  return (
    <button type="button" className={`os-nt-move ${on ? 'is-on' : ''}`} aria-pressed={on} disabled={Boolean(off)} onClick={() => { sfxTap(); onClick(); }}>
      <MoveArt kind={kind} size={56} done={on} />
      <span className="os-nt-move__main">
        <span className="os-nt-move__top">
          <span className="os-nt-move__title">{m.title}</span>
          {m.odds && <span className="os-nt-pill">{m.odds}</span>}
        </span>
        <span className="os-nt-move__short">{m.short}</span>
        {off ? <span className="os-nt-move__dawn">{off}</span> : m.dawn && <span className="os-nt-move__dawn"><Sun /> {m.dawn}</span>}
        {on && <span className="os-nt-tag">{NIGHT.saved}</span>}
      </span>
      <svg className="os-nt-move__chev" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="m8.5 4 8 8-8 8" /></svg>
    </button>
  );
}

const Sun = () => (
  <svg className="os-nt-sun" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <circle cx="12" cy="12" r="4.4" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </svg>
);
const Moon = () => (
  <svg className="os-nt-moon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M20.4 14.8A9 9 0 1 1 9.2 3.6a7.4 7.4 0 0 0 11.2 11.2Z" /></svg>
);

/** A move in full: picture, name, purpose; then tonight and dawn as a two-step line. */
function MoveHead({ kind, rows }) {
  const m = NIGHT.moves[kind];
  return (
    <div className="os-nt-head">
      <div className="os-nt-head__row">
        <MoveArt kind={kind} size={64} />
        <div className="min-w-0">
          <h3 className="os-nt-head__title">{m.title}</h3>
          <p className="os-nt-head__short">{m.short}</p>
        </div>
      </div>
      {rows && <Steps rows={rows} />}
    </div>
  );
}

/** Tonight → At dawn: the move's two beats, joined by a line from the moon to the sun. */
const Steps = ({ rows }) => (
  <ol className="os-nt-steps">
    {rows.map(([label, text], k) => (
      <li key={label} className="os-nt-steps__row">
        <span className="os-nt-steps__dot">{k === 0 ? <Moon /> : <Sun />}</span>
        <span className="os-nt-steps__label">{label}</span>
        <span className="os-nt-steps__text">{text}</span>
      </li>
    ))}
  </ol>
);

/** The rest of a move's rows, under the guest list. */
const More = ({ rows }) => (rows?.length ? (
  <Section head={NIGHT.more}>
    <dl className="os-nt-more">
      {rows.map(([label, text]) => (
        <div key={label} className="os-nt-more__row">
          <dt>{label}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  </Section>
) : null);

/**
 * The move is sealed: the picture with a tick, who it is for, when the result
 * comes, and how to change it. `fresh` plays the seal once, right after Confirm.
 */
function Sealed({ kind, line, faces = [], traits, locked, fresh, onChange, sub }) {
  return (
    <div className={`os-nt-sealed ${fresh ? 'is-fresh' : ''}`}>
      <div className="os-nt-sealed__pic">
        <MoveArt kind={kind} size={76} done />
        {faces.map((pid) => <Face key={pid} traits={traits} pid={pid} size={58} round className="os-nt-sealed__face" />)}
      </div>
      <p className="os-nt-sealed__kicker">{locked ? NIGHT.over.kicker : NIGHT.saved}</p>
      <p className="os-nt-sealed__line">{line}</p>
      <p className="os-nt-sealed__sub">{sub ?? (locked ? NIGHT.result : NIGHT.wait)}</p>
      {!locked && onChange && (
        <button type="button" className="os-nt-change" onClick={() => { sfxTap(); onChange(); }}>{NIGHT.changeBtn}</button>
      )}
    </div>
  );
}

/**
 * Which screen a role sees: the move it is reading (`open`), its sealed move,
 * or the list. `local` is what this phone just saved, shown at once rather
 * than after the round trip; `fresh` marks the first look at it.
 */
function useNightNav(action) {
  const [open, setOpen] = useState(null);
  const [changing, setChanging] = useState(false);
  const [local, setLocal] = useState(null);
  const [dir, setDir] = useState(null);
  const [fresh, setFresh] = useState(false);
  const saved = local ?? action ?? null;
  return {
    open,
    dir,
    saved,
    fresh,
    view: open ? 'move' : saved && !changing ? 'done' : 'list',
    push: (k) => { setOpen(k); setDir('push'); },
    pop: () => { setOpen(null); setDir('pop'); },
    change: () => { setChanging(true); setFresh(false); setDir('pop'); },
    commit: (a) => { setLocal(a); setChanging(false); setOpen(null); setDir('pop'); setFresh(true); },
    fail: () => { setLocal(null); setFresh(false); },
  };
}

const enterFor = (nav) => (nav.dir === 'pop' ? 'pop' : nav.dir === 'push' ? 'push' : undefined);

/** Scrolls an element into view once `when` turns true, gently unless motion is reduced. */
function useScrollTo(when) {
  const ref = useRef(null);
  useEffect(() => {
    if (!when || !ref.current) return;
    ref.current.scrollIntoView({ behavior: prefersLessMotion() ? 'auto' : 'smooth', block: 'start' });
  }, [when]);
  return ref;
}

// --- Faithful, Detective ---------------------------------------------------------------------

function FaithfulNight({ gid, game, me, role, living, nameOf, players, traits, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const nav = useNightNav(action);
  const [sel, setSel] = useState(null);
  const [picks, setPicks] = useState([]);
  const others = living.filter((g) => g.pid !== me.pid);
  const choose = (a) => {
    sfxTap();
    nav.commit(a);
    save(() => submitAction(gid, game.cycle, me.pid, { target: null, ...a }), nav.fail);
  };
  const moves = [...(role.role === 'detective' ? ['trace'] : []), 'watch', 'scour'];
  const sky = <Sky game={game} line={NIGHT.faithful.line} players={players} locked={locked} />;

  if (locked) {
    const a = nav.saved;
    const m = a ? NIGHT.moves[a.kind] ?? NIGHT.moves.scour : NIGHT.moves.scour;
    return (
      <Frame onBack={onClose} onHelp={onHelp}>
        {sky}
        <Sealed
          kind={a?.kind ?? 'scour'}
          locked
          line={a ? doneLine(a, m, nameOf) : NIGHT.over.none}
          faces={facesOf(a)}
          traits={traits}
        />
      </Frame>
    );
  }

  if (nav.view === 'move') {
    const k = nav.open;
    const m = NIGHT.moves[k];
    const current = nav.saved?.kind === k ? nav.saved : null;
    const target = sel ?? current?.target ?? null;
    const traced = picks.length ? picks : current?.targets ?? [];
    const back = () => { setSel(null); setPicks([]); nav.pop(); };
    let bar;
    if (k === 'scour') bar = <Bar kind="scour" label={m.title} onConfirm={() => choose({ kind: 'scour' })} />;
    else if (k === 'watch') {
      bar = target
        ? <Bar faces={[target]} traits={traits} label={m.verb(nameOf(target))} onConfirm={() => choose({ kind: 'watch', target })} />
        : <Bar hint={m.hint} />;
    } else {
      bar = traced.length === 2
        ? <Bar faces={traced} traits={traits} label={m.verb(...traced.map(nameOf))} onConfirm={() => choose({ kind: 'trace', targets: traced })} />
        : <Bar hint={m.hint(traced.length)} />;
    }
    const toggle = (pid) => {
      sfxTap();
      setPicks(traced.includes(pid) ? traced.filter((x) => x !== pid) : [...traced, pid].slice(-2));
    };
    return (
      <Frame key="move" onBack={back} backLabel="Night" enter="push" onHelp={onHelp} bar={bar}>
        <Sky game={game} compact />
        <MoveHead kind={k} rows={m.how.slice(0, 2)} />
        {k === 'watch' && (
          <Section head={m.pick}>
            <GuestPicker guests={others} traits={traits} value={target} onPick={(pid) => { sfxTap(); setSel(pid); }} />
          </Section>
        )}
        {k === 'trace' && (
          <Section head={m.pick(traced.length)}>
            <GuestPicker guests={others} traits={traits} value={traced} onPick={toggle} />
          </Section>
        )}
        <More rows={m.how.slice(2)} />
      </Frame>
    );
  }

  if (nav.view === 'done') {
    const a = nav.saved;
    const m = NIGHT.moves[a.kind] ?? NIGHT.moves.scour;
    return (
      <Frame key="done" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp}>
        {sky}
        <Sealed kind={a.kind in NIGHT.moves ? a.kind : 'scour'} fresh={nav.fresh} line={doneLine(a, m, nameOf)} faces={facesOf(a)} traits={traits} onChange={() => { setSel(null); setPicks([]); nav.change(); }} />
      </Frame>
    );
  }

  return (
    <Frame key="list" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp} bar={<Bar hint={NIGHT.bar.move} />}>
      {sky}
      <Section head={NIGHT.faithful.head} foot={NIGHT.faithful.foot}>
        <div className="os-nt-moves">
          {moves.map((k) => <MoveCard key={k} kind={k} on={nav.saved?.kind === k} onClick={() => nav.push(k)} />)}
        </div>
      </Section>
    </Frame>
  );
}

const facesOf = (a) => (!a ? [] : a.kind === 'trace' ? a.targets ?? [] : a.target ? [a.target] : []);
const doneLine = (a, m, nameOf) => (a.kind === 'trace' ? m.done(...(a.targets ?? []).map(nameOf)) : a.kind === 'whisper' ? m.done(nameOf(a.target), a.word) : m.done(nameOf(a.target)));

// --- Doctor ----------------------------------------------------------------------------------

function DoctorNight({ gid, game, me, living, nameOf, traits, players, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const last = useMyAction(gid, game.cycle - 1, me.pid);
  const nav = useNightNav(action?.kind === 'protect' ? action : null);
  const [sel, setSel] = useState(null);
  const barred = last?.kind === 'protect' ? last.target : null;
  const m = NIGHT.moves.protect;
  const sky = <Sky game={game} line={m.line} players={players} locked={locked} />;
  const confirm = (pid) => {
    sfxTap();
    const a = { kind: 'protect', target: pid };
    nav.commit(a);
    setSel(null);
    save(() => submitAction(gid, game.cycle, me.pid, a), nav.fail);
  };

  if (locked || nav.view === 'done') {
    const a = nav.saved;
    return (
      <Frame key="done" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp}>
        {sky}
        <Sealed
          kind={a ? 'protect' : 'scour'}
          locked={locked}
          fresh={nav.fresh}
          line={a ? m.done(nameOf(a.target)) : NIGHT.over.none}
          faces={facesOf(a)}
          traits={traits}
          onChange={nav.change}
        />
      </Frame>
    );
  }
  const target = sel ?? nav.saved?.target ?? null;
  const bar = target && target !== barred
    ? <Bar faces={[target]} traits={traits} label={m.verb(nameOf(target))} onConfirm={() => confirm(target)} />
    : <Bar hint={m.hint} />;
  return (
    <Frame key="list" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp} bar={bar}>
      <Sky game={game} compact />
      <MoveHead kind="protect" rows={m.how.slice(0, 2)} />
      <Section head={m.pick}>
        <GuestPicker
          guests={living}
          traits={traits}
          value={target}
          disabled={(g) => g.pid === barred}
          note={(g) => (g.pid === barred ? m.barred : g.pid === me.pid ? 'You' : null)}
          onPick={(pid) => { sfxTap(); setSel(pid); }}
        />
      </Section>
      <More rows={m.how.slice(2)} />
    </Frame>
  );
}

// --- Killers ---------------------------------------------------------------------------------

function KillerNight(props) {
  const { gid, game, me, nameOf, players, traits, mates, onClose, locked, onHelp } = props;
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const recruit = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const key = recruit ? 'recruit' : 'victim';
  const copy = recruit ? NIGHT.recruit : NIGHT.killer;
  const mine = den.find((d) => d.pid === me.pid)?.[key] ?? null;

  // The tally: who leads, and by how much.
  const tally = {};
  for (const d of den) if (d[key]) tally[d[key]] = (tally[d[key]] ?? 0) + 1;
  const top = Math.max(0, ...Object.values(tally));
  const leaders = Object.keys(tally).filter((p) => tally[p] === top);
  const status = !top ? null : leaders.length > 1 ? NIGHT.killer.tied : NIGHT.killer.lead(top);

  const alive = new Set(players.filter((p) => p.status === 'alive').map((p) => p.id));
  const partners = (mates ?? []).filter((m) => m.id !== me.pid && alive.has(m.id));
  const sky = <Sky game={game} line={copy.line} players={players} locked={locked} />;

  if (locked) {
    const line = leaders.length === 1 ? NIGHT.killer.top(nameOf(leaders[0])) : NIGHT.killer.closed;
    return (
      <Frame onBack={onClose} onHelp={onHelp}>
        {sky}
        <Sealed kind={recruit ? 'recruit' : 'hunt'} locked line={line} faces={leaders.length === 1 ? leaders : []} traits={traits} sub={NIGHT.result} />
      </Frame>
    );
  }

  const bar = mine ? (
    <div className="os-nt-bar is-poll">
      <span className="os-nt-bar__who">
        <span className="os-nt-bar__faces"><Face traits={traits} pid={mine} size={34} round /></span>
        <span className="os-nt-bar__label">
          {NIGHT.killer.mineBar(nameOf(mine))}
          {status && <small>{leaders.length > 1 || leaders.includes(mine) ? status : NIGHT.killer.leads(nameOf(leaders[0]))}</small>}
        </span>
      </span>
    </div>
  ) : <Bar hint={NIGHT.killer.hint} />;

  return (
    <Frame onBack={onClose} onHelp={onHelp} bar={bar}>
      {sky}
      <Section head={NIGHT.killer.partners}>
        {partners.length ? (
          <ul className="os-nt-partners">
            {partners.map((p) => {
              const pick = den.find((d) => d.pid === p.id)?.[key];
              return (
                <li key={p.id} className="os-nt-partner">
                  <Face traits={traits} pid={p.id} size={34} round />
                  <span className="min-w-0">
                    <b>{nameOf(p.id)}</b>
                    <small className={pick ? 'is-in' : ''}>{pick ? NIGHT.killer.picked(nameOf(pick)) : NIGHT.killer.noPick}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <p className="os-nt-alone">{NIGHT.killer.alone}</p>}
      </Section>
      <Section head={pollQuestion(meta, game.cycle)}>
        <KillPoll ctx={props} dark />
      </Section>
      <More rows={copy.how} />
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
 * A ghost's night: pass one of their true clue photos to a living guest
 * (engine/night.js checks they really hold it), or whisper one word. The same
 * list → move → sealed flow as the Faithful's.
 */
function GhostNight({ gid, game, me, living, pack, nameOf, traits, players, inbox, onClose, locked, onHelp }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const nav = useNightNav(['whisper', 'pass'].includes(action?.kind) && action.target ? action : null);
  const [word, setWord] = useState(null);
  const [photo, setPhoto] = useState(null); // the inbox id of the photo picked to pass
  const [sel, setSel] = useState(null);
  const held = heldPhotos(inbox);
  const sky = <Sky game={game} line={NIGHT.ghost.line} players={players} locked={locked} />;
  const reset = () => { setWord(null); setPhoto(null); setSel(null); };
  const send = (a) => {
    sfxTap();
    nav.commit(a);
    reset();
    save(() => submitAction(gid, game.cycle, me.pid, a), nav.fail);
  };
  const lineOf = (a) => (a.kind === 'pass' ? NIGHT.moves.pass.done(nameOf(a.target)) : NIGHT.moves.whisper.done(nameOf(a.target), a.word));

  if (locked || nav.view === 'done') {
    const a = nav.saved;
    return (
      <Frame key="done" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp}>
        {sky}
        <Sealed
          kind={a?.kind ?? 'whisper'}
          locked={locked}
          fresh={nav.fresh}
          line={a ? lineOf(a) : NIGHT.over.noneGhost}
          faces={facesOf(a)}
          traits={traits}
          onChange={() => { reset(); nav.change(); }}
        />
      </Frame>
    );
  }

  if (nav.view === 'move') {
    const k = nav.open;
    const m = NIGHT.moves[k];
    const current = nav.saved?.kind === k ? nav.saved : null;
    const back = () => { reset(); nav.pop(); };
    if (k === 'pass') {
      const same = (d) => current?.fact && d.fact.trait === current.fact.trait && d.fact.group === current.fact.group;
      const picked = photo ? held.find((d) => d.id === photo) : held.find(same) ?? null;
      const target = sel ?? (photo ? null : current?.target ?? null);
      const bar = picked && target
        ? <Bar faces={[target]} traits={traits} label={m.verb(nameOf(target))} onConfirm={() => send({ kind: 'pass', target, fact: picked.fact })} />
        : <Bar hint={m.hint(Boolean(picked))} />;
      return (
        <Frame key="move" onBack={back} backLabel="Night" enter="push" onHelp={onHelp} bar={bar}>
          <Sky game={game} compact />
          <MoveHead kind="pass" rows={m.how.slice(0, 2)} />
          <Section head={<><span className="os-nt-num">1</span>{m.photo}</>}>
            <div className="os-nt-photos">
              {held.map((d) => (
                <button key={d.id} type="button" aria-pressed={picked?.id === d.id} onClick={() => { sfxTap(); setPhoto(d.id); setSel(null); }} className={`os-nt-photo ${picked?.id === d.id ? 'is-on' : ''}`}>
                  <Evidence fact={d.fact} seed={d.id} pack={pack} stamp={`D${d.cycle}`} thumb />
                  <span className="os-nt-photo__cap">{clueWords(pack, d.fact).plain}</span>
                </button>
              ))}
            </div>
          </Section>
          <PickStep ready={Boolean(picked)} head={picked ? m.pick : m.pickFirst}>
            <GuestPicker guests={living} traits={traits} value={target} disabled={() => !picked} onPick={(pid) => { sfxTap(); setSel(pid); }} />
          </PickStep>
          <More rows={m.how.slice(2)} />
        </Frame>
      );
    }
    const chosen = word ?? current?.word ?? null;
    const target = sel ?? (word ? null : current?.target ?? null);
    const bar = chosen && target
      ? <Bar faces={[target]} traits={traits} label={m.verb(nameOf(target), chosen)} onConfirm={() => send({ kind: 'whisper', word: chosen, target })} />
      : <Bar hint={m.hint(chosen)} />;
    return (
      <Frame key="move" onBack={back} backLabel="Night" enter="push" onHelp={onHelp} bar={bar}>
        <Sky game={game} compact />
        <MoveHead kind="whisper" rows={m.how.slice(0, 2)} />
        <Section head={<><span className="os-nt-num">1</span>{m.word}</>}>
          <div className="os-nt-words">
            {pack.whispers.map((w) => (
              <button key={w} type="button" aria-pressed={chosen === w} onClick={() => { sfxTap(); setWord(w); setSel(null); }} className={`os-nt-word ${chosen === w ? 'is-on' : ''}`}>{w}</button>
            ))}
          </div>
        </Section>
        <PickStep ready={Boolean(chosen)} head={chosen ? m.pick(chosen) : m.pickFirst}>
          <GuestPicker guests={living} traits={traits} value={target} disabled={() => !chosen} onPick={(pid) => { sfxTap(); setSel(pid); }} />
        </PickStep>
        <More rows={m.how.slice(2)} />
      </Frame>
    );
  }

  return (
    <Frame key="list" onBack={onClose} enter={enterFor(nav)} onHelp={onHelp} bar={<Bar hint={NIGHT.bar.move} />}>
      {sky}
      <Section head={NIGHT.ghost.head} foot={NIGHT.ghost.foot}>
        <div className="os-nt-moves">
          <MoveCard kind="pass" on={nav.saved?.kind === 'pass'} off={held.length ? null : NIGHT.moves.pass.none} onClick={() => nav.push('pass')} />
          <MoveCard kind="whisper" on={nav.saved?.kind === 'whisper'} onClick={() => nav.push('whisper')} />
        </div>
      </Section>
    </Frame>
  );
}

/** Step 2 of a two-step move: dimmed until step 1 is chosen, then scrolled into view. */
function PickStep({ ready, head, children }) {
  const ref = useScrollTo(ready);
  return (
    <div ref={ref} className={`os-nt-step2 ${ready ? '' : 'is-waiting'}`}>
      <Section head={<><span className="os-nt-num">2</span>{head}</>}>{children}</Section>
    </div>
  );
}
