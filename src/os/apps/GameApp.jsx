import React, { useRef } from 'react';
import DeepBlueGame from '../game/DeepBlueGame';
import WordGame from '../game/WordGame';
import DrawGame from '../game/DrawGame';
import { NavBar } from '../ui';
import Glyph from '../icons/Glyph';
import { submitScore } from '../../firebase/game';
import { serverNow } from '../../lib/clockSkew';
import { GAME_GRACE_MS } from '../../lib/engine/phases.js';

/**
 * DEEP BLUE, the app: whichever game the morning plays (engine/minigames.js).
 * On a word or drawing day it opens that game from the alarm until the game
 * locks, then keeps its wall or its drawings up, with the answers, until the
 * night. On a run day it is the run below, live only while the game phase is
 * actually open. Any other time (including the alarm's own countdown) it is
 * locked: no practice course, so the app stays a mystery until it is really
 * time to play (user's call, 2026-10-02 — a practice run gave the game away).
 */
export default function GameApp({ ctx, onClose }) {
  const { game } = ctx;
  const kind = game.minigame ?? 'run';
  const today = ['alarm', 'game', 'game_locked'].includes(game.phase);
  const shown = game.dayGame?.cycle === game.cycle && game.dayGame.kind === kind ? game.dayGame : null;
  if (kind === 'word' && (today || shown)) return <WordGame ctx={ctx} onClose={onClose} dayGame={shown} />;
  if (kind === 'draw' && (today || shown)) return <DrawGame ctx={ctx} onClose={onClose} dayGame={shown} />;
  if (kind === 'run' && ['game', 'game_locked'].includes(game.phase)) return <RunGame ctx={ctx} onClose={onClose} />;
  return <LockedGame onClose={onClose} />;
}

/** Shown whenever it isn't actually time to play: locked, not practice. */
function LockedGame({ onClose }) {
  return (
    <section className="os-app os-app--dark">
      <NavBar title="DEEP BLUE" onBack={onClose} backLabel="Home" tone="dark" />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-8 text-center opacity-50">
        <Glyph name="lock" size={28} />
        <p className="os-label text-[11px] text-os-chrome">LOCKED</p>
        <p className="text-[14px] text-os-chrome">DEEP BLUE opens when it’s time to play.</p>
      </div>
    </section>
  );
}

/**
 * The run, only ever mounted while the game phase is open or just locked
 * (GameApp gates everything else to LockedGame). The course is the room's
 * shared course (the game doc's public courseSeed and the day), the window
 * opens on the room's shared instant, and a new best is written straight
 * away, so a phone that dies mid-run keeps what it had. The rules refuse any
 * write outside the run and any best that goes down.
 */
function RunGame({ ctx, onClose }) {
  const { gid, game, me, myScore } = ctx;
  const live = game.phase === 'game';
  const posting = game.phase === 'game_locked';
  const bestRef = useRef({ cycle: null, best: 0, runs: 0 });

  const serverBest = myScore?.best ?? 0;

  // The local best is kept per day, and a write only goes out above what the server already has.
  const onRunEnd = ({ score }) => {
    if (!live) return;
    if (bestRef.current.cycle !== game.cycle) bestRef.current = { cycle: game.cycle, best: 0, runs: 0 };
    const b = bestRef.current;
    b.runs += 1;
    // The first run is always written, even a 0, so the board knows you played.
    if (score > Math.max(b.best, serverBest) || (b.runs === 1 && !myScore)) {
      b.best = score;
      submitScore(gid, game.cycle, me.pid, Math.floor(score), b.runs).catch((e) => console.warn('[score] not saved:', e.code ?? e.message));
    }
  };

  const seed = `${game.courseSeed ?? 'deep'}:${game.cycle}`;
  return (
    <section className="os-app os-app--dark">
      <NavBar title={`Day ${game.cycle} run`} onBack={onClose} backLabel="Home" tone="dark" right={<span className={`os-label text-[11px] pr-1 ${live ? 'text-os-red' : 'text-os-chrome'}`}>{live ? '● LIVE' : 'CLOSED'}</span>} />
      <div className="relative flex-1 min-h-0">
        <DeepBlueGame
          key={seed}
          seed={seed}
          mode="live"
          startsAt={game.revealAt || game.phaseStartedAt}
          endsAt={game.phaseEndsAt ? game.phaseEndsAt - GAME_GRACE_MS : null}
          now={serverNow}
          best={serverBest}
          onRunEnd={onRunEnd}
          disabled={me.status === 'vanished' || posting}
        />
        {posting && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent text-center">
            <div className="os-spinner" />
            <p className="os-label text-[11px] mt-3">TIME. POSTING THE BOARD…</p>
          </div>
        )}
      </div>
    </section>
  );
}
