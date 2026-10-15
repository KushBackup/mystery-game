import React from 'react';
import { AppFrame, Section, GuestPicker, Empty, Group, Cell } from '../ui';
import { submitVote } from '../../firebase/game';
import { sfxSent } from '../sfx';
import { NO_ONE } from '../../lib/engine/banish.js';
import { ACCUSE } from '../../data/killersCopy';
import { AccusePanel } from './Accuse';

/**
 * Daylight's accusations, then the poll: the Round Table, the re-vote and the
 * Endgame, on one screen.
 *
 * In daylight this is where a guest accuses and seconds (Accuse.jsx). The
 * Round Table and its re-vote are only between the guests on trial
 * (game.ballotTargets), plus "no one" when there is a single accused guest.
 * The Endgame is open to every living guest.
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
  const ballot = phase === 'endgame' ? null : game.ballotTargets ?? null;
  const targets = (ballot ? living.filter((g) => ballot.includes(g.pid)) : living).filter((g) => g.pid !== me.pid);
  const spare = Boolean(ballot?.includes(NO_ONE));

  const title = phase === 'investigation' ? 'Accuse' : phase === 'endgame' ? 'Final vote' : phase === 'revote' ? 'Re-vote' : 'Vote';
  const vote = (pid) => submitVote(gid, game.ballot, me.pid, pid).then(sfxSent).catch((e) => console.warn('[vote]', e.code ?? e.message));

  if (phase === 'investigation') {
    return (
      <AppFrame title={title} onBack={onClose} tone="red" light>
        <AccusePanel ctx={ctx} />
      </AppFrame>
    );
  }

  return (
    <AppFrame title={title} onBack={onClose} tone="red" light>
      {!open ? (
        <Empty glyph="vote" title="No vote open" />
      ) : !canVote ? (
        <Empty glyph="ghost" title="Ghosts watch this one" />
      ) : (
        <>
          <div className="px-4 pt-4">
            <p className="os-label text-[12px] text-os-steel">{phase === 'revote' ? 'A TIE. CHOOSE BETWEEN THEM.' : phase === 'endgame' ? 'POLL · FINAL VOTE' : 'POLL · ONLY THOSE ON TRIAL'}</p>
            <p className="text-[22px] leading-tight mt-1 text-os-ink">Who does the room kill?</p>
            {phase !== 'endgame' && <p className="text-[14px] leading-snug mt-1 text-os-steel">The most votes is killed, and their role is shown to everyone.</p>}
          </div>
          <Section foot={myVote?.target ? `Your vote: ${myVote.target === NO_ONE ? 'no one' : nameOf(myVote.target)}. Tap another to change it.` : 'Nobody chosen yet.'}>
            <GuestPicker guests={targets} value={myVote?.target} onPick={vote} dark={false} traits={ctx.traits} emptyLine="You’re the one on trial. Others decide." />
            {spare && (
              <Group className="mt-2">
                <Cell title={ACCUSE.noOne} on={myVote?.target === NO_ONE} onClick={() => vote(NO_ONE)} />
              </Group>
            )}
          </Section>
          <div className="h-8" />
        </>
      )}
    </AppFrame>
  );
}
