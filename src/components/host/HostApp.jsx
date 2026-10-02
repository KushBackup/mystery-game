import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HOST_EMAILS, EMULATED } from '../../firebase/app';
import {
  signInHost, signOutHost, createGame, advance, setAutopilot, extendPhase, endPhaseNow, removePlayer, cancelRemove,
  dealLateJoiners, syncHostClock, subscribeRoles, subscribePresence, subscribeNightActions,
  subscribeNightDen, subscribeBallot, subscribeSecret, subscribeScores, subscribeDayPlays, setDayGames,
} from '../../firebase/host';
import { useAuthUser, useActiveGameId, useGame, usePlayers } from '../../hooks/useKillers';
import { PACKS, packFor, narrate, dayKit } from '../../data/packs/index.js';
import { DEFAULT_GAMES, gameOfDay } from '../../lib/engine/minigames.js';
import { PHASE, DEFAULT_DURATIONS, DEFAULT_CYCLES, ENDGAME_ROUNDS, LOCKED } from '../../lib/engine/phases.js';
import { ROLE_INFO, targetCounts } from '../../lib/engine/roles.js';
import { serverNow } from '../../lib/clockSkew';
import { PHASE_LABEL } from '../../data/killersCopy';
import { Screen, PhaseClock, Hold, Action } from '../game/parts';

/**
 * The host console. Run it on a laptop that stays plugged in: it is the only
 * device that resolves anything (firebase/host.js), so it must not sleep.
 *
 * One button moves the evening on, and its label always says what it will
 * do next. Autopilot presses it when each phase's timer runs out. Everything
 * else here is either the host's script (narration to read aloud) or the
 * roster.
 */

// A stable empty list, so a missing snapshot doesn't look like a new array every render.
const EMPTY = [];

const QUICK = { casting: 15_000, night: 45_000, recruit: 20_000, alarm: 10_000, game: 40_000, game_word: 50_000, game_draw: 55_000, dawn: 20_000, investigation: 60_000, roundtable: 60_000, revote: 30_000, banish: 15_000, endgame: 60_000 };

export default function HostApp() {
  const user = useAuthUser();
  const isHost = Boolean(user?.email && HOST_EMAILS.includes(user.email));
  const gid = useActiveGameId(isHost ? user.uid : null);
  const game = useGame(isHost ? gid : null);
  const [error, setError] = useState('');

  if (user === undefined) return <Screen><Hold label="Connecting…" /></Screen>;
  if (!isHost) {
    return (
      <Screen>
        <div className="pt-16">
          <p className="er-mono er-mono--hot er-mono--wide">Host console</p>
          <h1 className="er-title mt-3">Sign in to run the room.</h1>
          {user && !user.isAnonymous && <p className="er-mono er-mono--hot mt-4">{user.email} is not a host account.</p>}
          {EMULATED && <p className="font-body text-[14px] text-dim mt-3">Emulator: in the sign-in popup, add an account with one of: {HOST_EMAILS.join(', ')}.</p>}
          <Action className="mt-8" onClick={() => signInHost().catch((e) => setError(e.code ?? e.message))}>Sign in with Google</Action>
          {user && !user.isAnonymous && <Action tone="ghost" className="mt-3" onClick={signOutHost}>Sign out</Action>}
          {error && <p className="er-mono er-mono--hot mt-3">{error}</p>}
        </div>
      </Screen>
    );
  }
  if (gid === undefined || (gid && game === undefined)) return <Screen><Hold label="Loading the room…" /></Screen>;
  if (!gid || !game) return <Setup />;
  return <Console gid={gid} game={game} />;
}

// --- Setup ---------------------------------------------------------------------------

function Setup({ onCancel }) {
  const [packId, setPackId] = useState(Object.keys(PACKS)[0]);
  const [cycles, setCycles] = useState(DEFAULT_CYCLES);
  const [pace, setPace] = useState('standard');
  const [rotate, setRotate] = useState(true);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      await createGame({ packId, cycles, durations: pace === 'quick' ? QUICK : DEFAULT_DURATIONS, games: rotate ? DEFAULT_GAMES : ['run'] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div className="pt-10">
        <p className="er-mono er-mono--hot er-mono--wide">New game</p>
        <h1 className="er-title mt-3">Set the table.</h1>
        <Field label="Story">
          {Object.values(PACKS).map((p) => (
            <Choice key={p.id} on={packId === p.id} onClick={() => setPackId(p.id)}>{p.title}</Choice>
          ))}
        </Field>
        <Field label="Cycles">
          {[3, 4, 5].map((n) => (
            <Choice key={n} on={cycles === n} onClick={() => setCycles(n)}>{n} days</Choice>
          ))}
        </Field>
        <Field label="Morning games">
          <Choice on={rotate} onClick={() => setRotate(true)}>Rotate Word · Sketch · Run</Choice>
          <Choice on={!rotate} onClick={() => setRotate(false)}>Run every day</Choice>
        </Field>
        <Field label="Pace">
          <Choice on={pace === 'standard'} onClick={() => setPace('standard')}>Standard (~2 h)</Choice>
          <Choice on={pace === 'quick'} onClick={() => setPace('quick')}>Quick test (~10 min)</Choice>
        </Field>
        <Action className="mt-8" busy={busy} onClick={create}>Open the doors</Action>
        {onCancel && <Action tone="ghost" className="mt-3" onClick={onCancel}>Cancel</Action>}
      </div>
    </Screen>
  );
}

const Field = ({ label, children }) => (
  <div className="mt-6">
    <p className="er-mono">{label}</p>
    <div className="flex flex-wrap gap-2 mt-2">{children}</div>
  </div>
);

const Choice = ({ on, onClick, children }) => (
  <button type="button" onClick={onClick} className={`er-touch er-press border px-3 py-2 font-typewriter text-[16px] ${on ? 'border-signal bg-ink-hover text-bone' : 'border-line text-dim'}`}>
    {children}
  </button>
);

// --- The console -----------------------------------------------------------------------

function useHostSub(subscribe, deps) {
  const [state, setState] = useState({ key: null, value: undefined });
  const key = deps.every((d) => d !== undefined && d !== null) ? JSON.stringify(deps) : null;
  useEffect(() => {
    if (!key) return undefined;
    return subscribe((value) => setState({ key, value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the serialised deps
  }, [key]);
  return key && state.key === key ? state.value : undefined;
}

function nextLabel(game, alive, today) {
  const cycles = game.config?.cycles ?? DEFAULT_CYCLES;
  const round = game.endgameRound ?? 0;
  switch (game.phase) {
    case PHASE.LOBBY: return `Deal roles to ${alive} guests`;
    case PHASE.CASTING: return 'Start night 1';
    case PHASE.NIGHT: return 'End the night';
    case PHASE.RECRUIT: return 'End the recruitment';
    case PHASE.ALARM: return `Start ${today}`;
    case PHASE.GAME: return `Stop ${today} and post the board`;
    case PHASE.DAWN: return game.winner ? 'Reveal the winner' : 'Start the investigation';
    case PHASE.INVESTIGATION: return 'Call the Round Table';
    case PHASE.ROUNDTABLE:
    case PHASE.REVOTE:
    case PHASE.ENDGAME: return 'Close the vote';
    case PHASE.BANISH:
      if (game.winner) return 'Reveal the winner';
      if (round > 0) return round >= (game.config?.endgameRounds ?? ENDGAME_ROUNDS) ? 'Open the gate' : `Endgame vote ${round + 1}`;
      return game.cycle >= cycles ? 'Begin the Endgame' : `Start night ${game.cycle + 1}`;
    default:
      return LOCKED.has(game.phase) ? 'Finish resolving' : null;
  }
}

function narrationFor(game, pack, nameOf) {
  switch (game.phase) {
    case PHASE.LOBBY: return pack.setting;
    case PHASE.CASTING: return narrate(pack, 'casting');
    case PHASE.NIGHT:
    case PHASE.RECRUIT: return narrate(pack, 'night');
    case PHASE.ALARM: return narrate(pack, 'alarm');
    case PHASE.GAME: return narrate(pack, 'game');
    case PHASE.DAWN: {
      const d = game.dawn ?? {};
      const v = d.taken ?? d.victims?.[0];
      if (d.cause === 'rig') return narrate(pack, 'dawnRig', nameOf(v), { score: d.rigged ?? 0 }, 'dawnDeath');
      if (d.cause === 'deep') return narrate(pack, 'dawnDeep', nameOf(v), { saved: nameOf(d.attempted) }, 'dawnDeath');
      return narrate(pack, v ? 'dawnDeath' : d.attempted ? 'dawnSaved' : d.recruited ? 'dawnRecruited' : 'dawnQuiet', nameOf(v ?? d.attempted));
    }
    case PHASE.INVESTIGATION: return narrate(pack, 'investigation');
    case PHASE.ROUNDTABLE:
    case PHASE.REVOTE: return narrate(pack, 'roundtable');
    case PHASE.ENDGAME: return narrate(pack, 'endgame');
    case PHASE.BANISH: {
      const b = game.banish ?? {};
      if (!b.pid) return narrate(pack, 'banishNone');
      return narrate(pack, b.team === 'killers' ? 'banishKiller' : 'banishFaithful', nameOf(b.pid));
    }
    case PHASE.FINALE: return narrate(pack, game.winner === 'faithful' ? 'finaleFaithful' : 'finaleKillers');
    default: return [];
  }
}

function Console({ gid, game }) {
  const players = usePlayers(gid) ?? EMPTY;
  const roles = useHostSub((cb) => subscribeRoles(gid, cb), [gid]) ?? EMPTY;
  const presence = useHostSub((cb) => subscribePresence(gid, cb), [gid]) ?? EMPTY;
  const secret = useHostSub((cb) => subscribeSecret(gid, cb), [gid]);
  const actions = useHostSub((cb) => subscribeNightActions(gid, game.cycle, cb), [gid, game.cycle]) ?? EMPTY;
  const den = useHostSub((cb) => subscribeNightDen(gid, game.cycle, cb), [gid, game.cycle]) ?? EMPTY;
  const votes = useHostSub((cb) => subscribeBallot(gid, game.ballot, cb), [gid, game.ballot]) ?? EMPTY;
  const scoring = [PHASE.GAME, PHASE.GAME_LOCKED].includes(game.phase);
  const kind = game.minigame ?? 'run';
  const scores = useHostSub((cb) => subscribeScores(gid, game.cycle, cb), [gid, scoring && kind === 'run' ? game.cycle : null]) ?? EMPTY;
  // A word or drawing day's plays: what was posted (clues, drawings) and the reactions (picks, guesses).
  const [postsName, reactsName] = kind === 'word' ? ['clues', 'picks'] : ['drawings', 'guesses'];
  const dayOn = scoring && kind !== 'run' ? game.cycle : null;
  const posts = useHostSub((cb) => subscribeDayPlays(gid, postsName, game.cycle, cb), [gid, postsName, dayOn]) ?? EMPTY;
  const reacts = useHostSub((cb) => subscribeDayPlays(gid, reactsName, game.cycle, cb), [gid, reactsName, dayOn]) ?? EMPTY;
  const pack = packFor(game.packId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showRoles, setShowRoles] = useState(false);
  const [newGame, setNewGame] = useState(false);

  const roleOf = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r.role])), [roles]);
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);
  const nameOf = (id) => names[id] ?? '—';
  const alive = players.filter((p) => p.status === 'alive');
  const ghosts = players.filter((p) => p.status === 'ghost');

  // Measure the host clock against the server once (reveals are timed on it), and keep the screen awake.
  useEffect(() => {
    syncHostClock(gid);
    let lock = null;
    navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => lock?.release?.();
  }, [gid]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  // Autopilot: press Next when the phase timer runs out. Keyed per phase so it fires once.
  const fired = useRef('');
  useEffect(() => {
    if (!game.autopilot || !game.phaseEndsAt || game.phase === PHASE.FINALE) return undefined;
    const key = `${game.phase}:${game.cycle}:${game.ballot ?? ''}:${game.phaseEndsAt}`;
    const wait = Math.max(0, game.phaseEndsAt - serverNow());
    const id = setTimeout(() => {
      if (fired.current === key) return;
      fired.current = key;
      advance(gid).catch((e) => setError(e.message));
    }, wait + 400);
    return () => clearTimeout(id);
  }, [gid, game.autopilot, game.phase, game.cycle, game.ballot, game.phaseEndsAt]);

  // Late arrivals are dealt in as soon as they finish their answers.
  const dealing = useRef(new Set());
  useEffect(() => {
    if (game.phase === PHASE.LOBBY || !roles.length) return;
    const pending = players.filter((p) => p.status === 'alive' && !roleOf[p.id] && !dealing.current.has(p.id)).map((p) => p.id);
    if (!pending.length) return;
    pending.forEach((p) => dealing.current.add(p));
    dealLateJoiners(gid, pending).catch((e) => setError(e.message));
  }, [gid, game.phase, players, roleOf, roles.length]);

  if (newGame) return <Setup onCancel={() => setNewGame(false)} />;

  const kit = dayKit(pack);
  const todayTitle = kit.dayGames[kind]?.title ?? 'THE RUN';
  const label = nextLabel(game, alive.length, todayTitle);
  const rotating = (game.config?.games ?? DEFAULT_GAMES).length > 1;
  const nextKind = gameOfDay(game.config, game.phase === PHASE.LOBBY || game.phase === PHASE.CASTING ? 1 : game.cycle + 1);
  const day = secret?.day?.[game.cycle];
  const lines = narrationFor(game, pack, nameOf);
  const killerIds = roles.filter((r) => r.role === 'killer').map((r) => r.id);
  const livingKillers = alive.filter((p) => killerIds.includes(p.id));
  const actedNight = new Set([...actions.map((a) => a.pid), ...den.filter((d) => d.id !== 'meta').map((d) => d.pid)]);
  const voters = game.phase === PHASE.ENDGAME ? alive.length + ghosts.length : alive.length;
  const counts = targetCounts(alive.length, game.config?.ratios);
  const presentIds = new Set(presence.filter((p) => serverNow() - (p.beatAt ?? 0) < 150_000).map((p) => p.id));

  return (
    <Screen>
      <header className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-ink/95 backdrop-blur border-b border-line flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-3 min-w-0">
          {game.cycle > 0 && <span className="er-num text-[28px]">{String(game.cycle).padStart(2, '0')}</span>}
          <span className="er-mono er-mono--wide">{PHASE_LABEL[game.phase]}</span>
          {game.endgameRound ? <span className="er-mono">vote {game.endgameRound}</span> : null}
        </div>
        <PhaseClock endsAt={game.phaseEndsAt} />
      </header>

      {EMULATED && <p className="er-tag er-tag--mute mt-3">Emulator · not the live game</p>}

      {/* The one button */}
      <div className="mt-5">
        {label && <Action busy={busy} onClick={() => run(() => advance(gid))}>{label}</Action>}
        {error && <p className="er-mono er-mono--hot mt-2 normal-case tracking-normal">{error}</p>}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Action tone="ghost" onClick={() => run(() => setAutopilot(gid, !game.autopilot))}>{game.autopilot ? 'Auto: on' : 'Auto: off'}</Action>
          <Action tone="ghost" disabled={!game.phaseEndsAt} onClick={() => run(() => extendPhase(gid, 60_000))}>+1 min</Action>
          <Action tone="ghost" disabled={!game.phaseEndsAt} onClick={() => run(() => endPhaseNow(gid))}>Time up</Action>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <Stat n={alive.length} label="alive" />
        <Stat n={ghosts.length} label="ghosts" />
        {game.phase === PHASE.NIGHT && <Stat n={actedNight.size} label={`of ${alive.length + ghosts.length} acted`} />}
        {[PHASE.ROUNDTABLE, PHASE.REVOTE, PHASE.ENDGAME].includes(game.phase) && <Stat n={votes.length} label={`of ${voters} voted`} />}
        {game.phase === PHASE.LOBBY && <Stat n={counts.killer} label="killers to deal" />}
        {scoring && kind === 'run' && <Stat n={scores.length} label={`of ${alive.length + ghosts.length} played`} />}
        {scoring && kind === 'word' && <Stat n={posts.length} label={`of ${alive.length} clues`} />}
        {scoring && kind === 'word' && <Stat n={reacts.length} label="picked" />}
        {scoring && kind === 'draw' && <Stat n={posts.length} label={`of ${alive.length} drew`} />}
        {scoring && kind === 'draw' && <Stat n={reacts.length} label="guessing" />}
      </div>

      {/* Say this */}
      {lines.length > 0 && (
        <section className="er-bone p-4 mt-6">
          <p className="er-mono text-body-bone mb-2">Read aloud</p>
          {lines.map((l, i) => (
            <p key={i} className="font-typewriter text-[18px] leading-snug text-ink mt-1">{l}</p>
          ))}
        </section>
      )}

      {game.phase === PHASE.LOBBY && (
        <section className="er-card mt-6">
          <p className="er-mono">Guests join at</p>
          <p className="font-typewriter text-[20px] text-bone mt-1 break-all">{joinUrl()}</p>
          <p className="font-body text-[14px] text-dim mt-2">Late arrivals can join any time, and are dealt in automatically.</p>
        </section>
      )}

      {/* The den, for the host's eyes: who the Killers are leaning towards */}
      {game.phase === PHASE.NIGHT && showRoles && den.length > 0 && (
        <section className="er-card er-card--signal mt-6">
          <p className="er-mono er-mono--hot">The den</p>
          <ul className="mt-2 space-y-1">
            {den.filter((d) => d.id !== 'meta').map((d) => (
              <li key={d.id} className="font-body text-[14px] text-bone">
                {nameOf(d.pid)}: sink {nameOf(d.victim)}{d.rig ? ` to ${d.rig === 'under' ? 'just below last' : 'zero'}` : ''}{d.hand ? `, ${nameOf(d.hand)} hacks` : ''}{d.frame ? `, frame ${nameOf(d.frame)}` : ''}{d.recruit ? `, recruit ${nameOf(d.recruit)}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Today's word or drawing game, for the host's eyes */}
      {[PHASE.ALARM, PHASE.GAME, PHASE.GAME_LOCKED].includes(game.phase) && kind !== 'run' && (
        <section className="er-card mt-6">
          <p className="er-mono">Today: {todayTitle}</p>
          <p className="font-body text-[15px] text-bone mt-1">{kit.dayGames[kind]?.rule}</p>
          {showRoles && kind === 'word' && day?.word && (
            <p className="font-typewriter text-[18px] text-bone mt-2">The word: {day.word} · the Killers' hint: {day.hint}</p>
          )}
          {showRoles && kind === 'word' && posts.length > 0 && (
            <ol className="mt-2 space-y-1">
              {posts.map((c, i) => (
                <li key={c.id} className="font-body text-[14px] text-bone">{i + 1}. {c.clue} <span className="text-dim">· {nameOf(c.pid)}{roleOf[c.pid] === 'killer' ? ' (Killer)' : ''}</span></li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* The run, live: who is where on today's board, before anyone else sees it */}
      {scoring && kind === 'run' && showRoles && (
        <section className="er-card mt-6">
          <p className="er-mono">Today's run, live{secret?.pendingMorning?.victim ? ` · rig on ${nameOf(secret.pendingMorning.victim)}${secret.pendingMorning.saved ? ' (firewalled: the lowest honest score dies instead)' : ''}` : ''}</p>
          <ol className="mt-2 space-y-1">
            {[...scores].sort((a, b) => b.best - a.best).map((s, i) => (
              <li key={s.id} className="font-body text-[14px] text-bone flex justify-between gap-3">
                <span>{i + 1}. {nameOf(s.pid)}</span>
                <span className="er-num text-[16px]">{s.best}</span>
              </li>
            ))}
          </ol>
          <p className="font-body text-[13px] text-dim mt-2">Guests who haven't played count as 0.</p>
        </section>
      )}

      {/* Roster */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <p className="er-mono er-mono--wide">Roster</p>
          <button type="button" className="er-touch er-mono" onClick={() => setShowRoles((v) => !v)}>
            {showRoles ? 'Hide roles' : 'Show roles'}
          </button>
        </div>
        {showRoles && livingKillers.length > 0 && (
          <p className="er-mono er-mono--hot mt-2 normal-case tracking-normal">Killers alive: {livingKillers.map((p) => p.name).join(', ')}</p>
        )}
        <ul className="mt-2 divide-y divide-line-faint">
          {[...players].sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
            <RosterRow
              key={p.id}
              p={p}
              role={showRoles ? ROLE_INFO[roleOf[p.id]]?.label : null}
              present={presentIds.has(p.id)}
              acted={game.phase === PHASE.NIGHT && actedNight.has(p.id)}
              phase={game.phase}
              onRemove={() => run(() => removePlayer(gid, p.id, game.phase))}
              onCancel={() => run(() => cancelRemove(gid, p.id))}
            />
          ))}
        </ul>
        {players.length === 0 && <p className="er-mono mt-3">Nobody yet.</p>}
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <p className="er-mono">Engine</p>
        <p className="font-body text-[13px] text-dim mt-1 break-all">
          {gid}{secret?.counts ? ` · dealt ${secret.counts.killer} killers` : ''}{secret?.plantUsed ? ' · frame used' : ''}
        </p>
        <p className="er-mono mt-4">Morning games{game.phase !== PHASE.FINALE ? ` · next: ${kit.dayGames[nextKind]?.title ?? nextKind}` : ''}</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Action tone={rotating ? undefined : 'ghost'} onClick={() => run(() => setDayGames(gid, DEFAULT_GAMES))}>Rotate all three</Action>
          <Action tone={rotating ? 'ghost' : undefined} onClick={() => run(() => setDayGames(gid, ['run']))}>Run every day</Action>
        </div>
        <p className="font-body text-[13px] text-dim mt-1">Takes effect at the next alarm. Today's game carries on.</p>
        <Action tone="ghost" className="mt-4" onClick={() => window.confirm('Start a brand new game? Everyone will need to arrive again.') && setNewGame(true)}>
          New game
        </Action>
        <Action tone="ghost" className="mt-2" onClick={signOutHost}>Sign out</Action>
      </section>
    </Screen>
  );
}

const Stat = ({ n, label }) => (
  <div className="er-stat">
    <span className="er-num text-[34px] block">{n}</span>
    <span className="er-mono">{label}</span>
  </div>
);

function RosterRow({ p, role, present, acted, phase, onRemove, onCancel }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <li className={`py-3 flex items-center justify-between gap-3 ${p.status !== 'alive' ? 'opacity-60' : ''}`}>
      <div className="min-w-0">
        <p className="font-typewriter text-[17px] text-bone truncate">
          {p.name} {p.table ? <span className="er-mono">T{p.table}</span> : null}
        </p>
        <p className="er-mono normal-case tracking-normal">
          {[
            p.status !== 'alive' ? p.status : null,
            p.cause && p.status !== 'alive' ? p.cause : null,
            role,
            present ? null : 'offline?',
            acted ? 'acted' : null,
            p.leaveRequestedAt && p.status === 'alive' ? 'leaving at dawn' : null,
          ].filter(Boolean).join(' · ') || 'in'}
        </p>
      </div>
      {p.status === 'alive' && (p.leaveRequestedAt ? (
        <button type="button" className="er-touch er-mono shrink-0" onClick={onCancel}>Keep</button>
      ) : confirm ? (
        <button type="button" className="er-touch er-mono er-mono--hot shrink-0" onClick={() => { setConfirm(false); onRemove(); }}>
          {phase === PHASE.LOBBY ? 'Remove?' : 'Vanish at dawn?'}
        </button>
      ) : (
        <button type="button" className="er-touch er-mono shrink-0" onClick={() => setConfirm(true)}>Remove</button>
      ))}
    </li>
  );
}

function joinUrl() {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${location.origin}${base}`;
}

