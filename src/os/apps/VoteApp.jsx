import React from 'react';
import { AppFrame, Section, GuestPicker, Empty } from '../ui';
import { submitVote } from '../../firebase/game';
import { sfxSent } from '../sfx';
import { daySchedule, fmtClock } from '../../lib/engine/clock.js';
import { serverNow } from '../../lib/clockSkew';

/**
 * Vote: the Round Table, the re-vote and the Endgame, on one screen, with its
 * own icon on the home screen (the 15 Oct playtest couldn't find it inside
 * Messages).
 *
 * The vote is open: anyone votes for any living guest but themselves
 * (player-called accusations were removed after that playtest). A re-vote is
 * only between the tied. Ghosts vote in all of them (2026-10-15), but only the
 * living can be voted for.
 *
 * One tap votes, another tap on someone else changes it, right up to the lock.
 * Votes stay private until the reveal, which then shows who voted for whom
 * (News), because on the show that is where the next day's suspicion starts.
 */
export default function VoteApp({ ctx, onClose }) {
  const { gid, game, me, players, nameOf, myVote } = ctx;
  const phase = game.phase;
  const open = ['roundtable', 'revote', 'endgame'].includes(phase);
  const canVote = ['alive', 'ghost'].includes(me.status);
  const living = players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const targets = (phase === 'revote' ? living.filter((g) => game.tied?.includes(g.pid)) : living).filter((g) => g.pid !== me.pid);

  const title = phase === 'endgame' ? 'Final vote' : phase === 'revote' ? 'Re-vote' : 'Vote';
  const vote = (pid) => submitVote(gid, game.ballot, me.pid, pid).then(sfxSent).catch((e) => console.warn('[vote]', e.code ?? e.message));

  // Closed: say when today's vote opens, on the game clock.
  const opensAt = daySchedule(game, serverNow())?.parts.find((p) => p.id === 'roundtable')?.at;
  const closedLine = opensAt != null && game.cycle ? `Today’s vote opens at ${fmtClock(opensAt)}. Anyone can be voted for.` : 'Anyone can be voted for when it opens.';

  return (
    <AppFrame title={title} onBack={onClose} tone="red" light>
      {!open ? (
        <Empty glyph="vote" title="No vote open" line={closedLine} />
      ) : !canVote ? (
        <Empty glyph="vote" title="You’re not in this vote" />
      ) : (
        <>
          <div className="px-4 pt-4">
            <p className="os-label text-[12px] text-os-steel">{phase === 'revote' ? 'A TIE. CHOOSE BETWEEN THEM.' : phase === 'endgame' ? 'POLL · FINAL VOTE' : 'POLL · THE ROOM'}</p>
            <p className="text-[22px] leading-tight mt-1 text-os-ink">Who does the room kill?</p>
            {phase !== 'endgame' && <p className="text-[14px] leading-snug mt-1 text-os-steel">The most votes is killed, and their role is shown to everyone.</p>}
          </div>
          <Section foot={myVote?.target ? `Your vote: ${nameOf(myVote.target)}. Tap another to change it.` : 'Nobody chosen yet.'}>
            <GuestPicker guests={targets} value={myVote?.target} onPick={vote} dark={false} traits={ctx.traits} />
          </Section>
          <div className="h-8" />
        </>
      )}
    </AppFrame>
  );
}
