import React from 'react';
import { submitVote } from '../../firebase/game';
import { useMyVote } from '../../hooks/useKillers';
import { GuestPicker } from './parts';

/**
 * The Round Table, the re-vote and the Endgame: one ballot screen.
 *
 * One tap votes, and a second tap on someone else changes it, right up to
 * the lock. Votes are private until the reveal; then the banishment shows
 * who voted for whom (Reveals.jsx), because on the show that is where the
 * next day's suspicion comes from.
 */
export default function Vote({ gid, game, me, players, nameOf }) {
  const vote = useMyVote(gid, game.ballot, me.pid);
  const canVote = game.phase === 'endgame' ? ['alive', 'ghost'].includes(me.status) : me.status === 'alive';
  const living = players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const targets = (game.phase === 'revote' ? living.filter((g) => game.tied?.includes(g.pid)) : living).filter((g) => g.pid !== me.pid);

  if (!canVote) {
    return <p className="font-typewriter text-[18px] text-dim mt-6">Ghosts watch the Round Table. You vote in the Endgame.</p>;
  }

  return (
    <div className="mt-2">
      <GuestPicker
        guests={targets}
        value={vote?.target}
        onPick={(pid) => submitVote(gid, game.ballot, me.pid, pid).catch((e) => console.warn('[vote]', e.code ?? e.message))}
      />
      <p className="er-mono er-mono--bone mt-5">
        {vote?.target ? `Your vote: ${nameOf(vote.target)}. Tap another name to change it.` : 'Nobody chosen yet. Not voting wastes your voice.'}
      </p>
    </div>
  );
}
