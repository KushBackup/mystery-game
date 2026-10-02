import React from 'react';
import { AppFrame, Section, GuestPicker, Empty } from '../ui';
import { submitVote } from '../../firebase/game';
import { sfxSent } from '../sfx';

/**
 * The poll: the Round Table, the re-vote and the Endgame, on one screen.
 *
 * One tap votes, another tap on someone else changes it, right up to the lock.
 * Votes stay private until the reveal, which then shows who voted for whom
 * (News), because on the show that is where the next day's suspicion starts.
 */
export default function VoteApp({ ctx, onClose }) {
  const { gid, game, me, players, nameOf, myVote } = ctx;
  const phase = game.phase;
  const open = ['roundtable', 'revote', 'endgame'].includes(phase);
  const canVote = phase === 'endgame' ? ['alive', 'ghost'].includes(me.status) : me.status === 'alive';
  const living = players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const targets = (phase === 'revote' ? living.filter((g) => game.tied?.includes(g.pid)) : living).filter((g) => g.pid !== me.pid);

  const title = phase === 'endgame' ? 'Final vote' : phase === 'revote' ? 'Re-vote' : 'Vote';
  const vote = (pid) => submitVote(gid, game.ballot, me.pid, pid).then(sfxSent).catch((e) => console.warn('[vote]', e.code ?? e.message));

  return (
    <AppFrame title={title} onBack={onClose} tone="red" light>
      {!open ? (
        <Empty glyph="vote" title="No vote open" />
      ) : !canVote ? (
        <Empty glyph="ghost" title="Ghosts watch this one" />
      ) : (
        <>
          <div className="px-4 pt-4">
            <p className="os-label text-[12px] text-os-steel">{phase === 'revote' ? 'A TIE. CHOOSE BETWEEN THEM.' : phase === 'endgame' ? 'POLL · FINAL VOTE' : 'POLL · THE GROUP'}</p>
            <p className="text-[22px] leading-tight mt-1 text-os-ink">Who gets logged out?</p>
          </div>
          <Section foot={myVote?.target ? `Your vote: ${nameOf(myVote.target)}. Tap another name to change it.` : 'Nobody chosen yet.'}>
            <GuestPicker guests={targets} value={myVote?.target} onPick={vote} dark={false} traits={ctx.traits} />
          </Section>
          <div className="h-8" />
        </>
      )}
    </AppFrame>
  );
}
