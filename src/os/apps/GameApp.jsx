import React, { useRef } from 'react';
import DeepBlueGame from '../game/DeepBlueGame';
import WordGame from '../game/WordGame';
import DrawGame from '../game/DrawGame';
import { NavBar } from '../ui';
import { submitScore } from '../../firebase/game';
import { serverNow } from '../../lib/clockSkew';
import { GAME_GRACE_MS } from '../../lib/engine/phases.js';

/**
 * DEEP BLUE, the app: whichever game the morning plays (engine/minigames.js).
 * On a word or drawing day it opens that game from the alarm until the game
 * locks, then keeps its wall or its drawings up, with the answers, until the
 * night. Any other time it is the run below: live on a run day, practice
 * otherwise.
 */
export default function GameApp({ ctx, onClose }) {
  const { game } = ctx;
  const kind = game.minigame ?? 'run';
  const today = ['alarm', 'game', 'game_locked'].includes(game.phase);
  const shown = game.dayGame?.cycle === game.cycle && game.dayGame.kind === kind ? game.dayGame : null;
  if (kind === 'word' && (today || shown)) return <WordGame ctx={ctx} onClose={onClose} dayGame={shown} />;
  if (kind === 'draw' && (today || shown)) return <DrawGame ctx={ctx} onClose={onClose} dayGame={shown} />;
  return <RunGame ctx={ctx} onClose={onClose} />;
}

/**
 * The run. During the morning run it is the real thing: the
 * course is the room's shared course (the game doc's public courseSeed and
 * the day), the window opens on the room's shared instant, and a new best is
 * written straight away, so a phone that dies mid-run keeps what it had.
 * The rules refuse any write outside the run and any best that goes down.
 *
 * Any other time it is practice: a different course, nothing written.
 */
function RunGame({ ctx, onClose }) {
  const { gid, game, me, myScore } = ctx;
  const runDay = (game.minigame ?? 'run') === 'run';
  const live = runDay && game.phase === 'game';
  const posting = runDay && game.phase === 'game_locked';
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

  const seed = live || posting ? `${game.courseSeed ?? 'deep'}:${game.cycle}` : `${game.courseSeed ?? 'deep'}:practice`;
  return (
    <section className="os-app os-app--dark">
      <NavBar title={live || posting ? `Day ${game.cycle} run` : 'DEEP BLUE'} onBack={onClose} tone="dark" right={<span className={`os-label text-[11px] pr-1 ${live ? 'text-os-red' : 'text-os-chrome'}`}>{live ? '● LIVE' : posting ? 'CLOSED' : 'PRACTICE'}</span>} />
      <div className="relative flex-1 min-h-0">
        <DeepBlueGame
          key={`${seed}:${live || posting ? 'live' : 'practice'}`}
          seed={seed}
          mode={live || posting ? 'live' : 'practice'}
          startsAt={live || posting ? game.revealAt || game.phaseStartedAt : null}
          endsAt={live || posting ? (game.phaseEndsAt ? game.phaseEndsAt - GAME_GRACE_MS : null) : null}
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
