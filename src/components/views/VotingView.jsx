import React, { useState } from 'react';
import { CHARACTERS, isMurderer } from '../../data/gameData';
import { VoteResultsModal } from '../modals/VoteResultsModal';
import { Numeral } from '../ui/Numeral';

/**
 * The ballot (DESIGN_LANGUAGE.md §9, "Vote").
 *
 * The old screen used green for "open" and amber for "selected" — two hues the
 * system doesn't have. Both are gone: open/closed is carried by a mono label
 * and the 3px state channel, selection is a signal border, and every count is
 * a brass numeral in the display face, because counts are data (§2.2).
 */
export const VotingView = ({
  currentUser,
  isVotingOpen,
  currentRound,
  votes,
  voteCounts,
  voteResultsVisible = false,
  onVote,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState(votes[currentRound] || null);
  const [showResults, setShowResults] = useState(false);
  const [confirmingVote, setConfirmingVote] = useState(null);

  // Stable hash-sort the suspect list so every player sees the SAME jumbled
  // order (so chat references like "the 3rd one" still translate), but the
  // ordering doesn't betray suspects-vs-witnesses or cluster the killers near
  // the top. Any killer the hash places in the first row of the 2-col grid is
  // pushed deeper into the list.
  const suspects = React.useMemo(() => {
    const stableHash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return h;
    };
    const list = [...CHARACTERS].sort((a, b) => stableHash(a.id) - stableHash(b.id));
    const earlyKillers = list
      .map((character, index) => ({ character, index }))
      .filter(({ character, index }) => isMurderer(character.id) && index < 6)
      .reverse();

    earlyKillers.forEach(({ character, index }, offset) => {
      list.splice(index, 1);
      list.splice(Math.min(Math.floor(list.length / 2) + 3 + offset, list.length), 0, character);
    });

    return list;
  }, []);

  const hasVoted = votes[currentRound] !== undefined;
  const hasAnyVotes = Object.keys(voteCounts || {}).length > 0;
  const totalVotes = Object.values(voteCounts || {}).reduce((a, b) => a + b, 0);

  const handleVoteClick = (suspectId) => {
    if (!isVotingOpen) return;

    if (suspectId === selectedSuspect) {
      // Tapping the selected card a second time commits the vote. The card takes
      // a single stamp — 420ms, once. It used to run `er-alarm`, an infinite
      // 2.4s opacity pulse held for two seconds, which is the app's reserved
      // reveal state and read as "something is wrong here" rather than
      // "recorded". The durable cue is the border and the "Your vote" label.
      setConfirmingVote(suspectId);
      onVote(suspectId);
      setTimeout(() => setConfirmingVote(null), 450);
    } else {
      setSelectedSuspect(suspectId);
    }
  };

  return (
    <div className="space-y-5">
      {/* State */}
      <div className={`er-card ${isVotingOpen ? 'er-card--signal' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`er-mono er-mono--wide ${isVotingOpen ? 'er-mono--hot' : ''}`}>
            {isVotingOpen ? 'Ballot open' : 'Ballot closed'}
          </p>
          <span className="er-mono er-mono--dim">Round {String(currentRound).padStart(2, '0')}</span>
        </div>

        <p className="font-body text-[15px] leading-[1.55] text-dim mt-3">
          {isVotingOpen
            ? hasVoted
              ? 'Your vote is recorded. Tap another name to change it.'
              : 'Tap a name to select, tap again to confirm.'
            : 'Waiting for the host to open the ballot.'}
        </p>

        {isVotingOpen && hasVoted && (
          <p className="mt-4">
            <span className="er-tag">
              Voted · {CHARACTERS.find((c) => c.id === selectedSuspect)?.name}
            </span>
          </p>
        )}
      </div>

      {/* Tally */}
      {hasAnyVotes && (
        <div className="er-stat flex items-end justify-between gap-4">
          <div>
            {/* Ticks as the room votes — this is the one number on the screen
                that moves while the player is looking at it (§7). */}
            <Numeral as="p" value={totalVotes} pad={2} className="er-stat__num" />
            <p className="er-stat__label">Votes cast</p>
          </div>

          {voteResultsVisible ? (
            <button
              onClick={() => setShowResults(true)}
              className="er-touch px-5 py-3 bg-ink-raised border border-line text-bone font-mono text-[11px] font-medium uppercase tracking-[0.24em] hover:border-signal"
            >
              View tally
            </button>
          ) : (
            <span className="er-tag er-tag--mute">Tally withheld</span>
          )}
        </div>
      )}

      {/* Suspects */}
      <div className="grid grid-cols-2 gap-3">
        {suspects.map((suspect, index) => {
          const isSelected = selectedSuspect === suspect.id;
          const isMyVote = votes[currentRound] === suspect.id;
          const isMe = suspect.id === currentUser;
          const voteCount = voteCounts[suspect.id] || 0;
          const isConfirming = confirmingVote === suspect.id;

          return (
            <button
              key={suspect.id}
              onClick={() => handleVoteClick(suspect.id)}
              disabled={!isVotingOpen}
              className={`er-touch relative text-left p-3 bg-ink-raised border ${
                isConfirming ? 'er-stamp' : 'er-enter'
              } ${
                isMyVote
                  ? 'border-signal border-t-[3px] border-t-signal'
                  : isSelected && isVotingOpen
                    ? 'border-signal'
                    : 'border-line'
              } ${!isVotingOpen ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={isConfirming ? undefined : { animationDelay: `${Math.min(index, 12) * 35}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`shrink-0 w-11 h-11 flex items-center justify-center font-typewriter font-bold text-lg bg-ink border ${
                    isMe ? 'border-signal text-signal-lift' : 'border-line text-bone'
                  }`}
                >
                  {suspect.name.charAt(0)}
                </span>

                {/* Counts are data, so they are brass and in the display face.
                    The slot is reserved even at zero, so the first vote landing
                    on a suspect doesn't shove the initial square sideways. */}
                <span className="er-num text-[26px] tabular-nums min-w-[1ch] text-right">
                  {voteCount > 0 && hasAnyVotes ? voteCount : ' '}
                </span>
              </div>

              <p className="font-typewriter font-bold text-bone text-[16px] leading-[1.15] mt-3 break-words">
                {suspect.name}
                {isMe && <span className="er-mono er-mono--dim block mt-1">You</span>}
              </p>

              <p className="er-mono er-mono--dim mt-1.5 break-words">{suspect.profession}</p>

              <div className="mt-3 pt-2 border-t border-line-faint">
                {isMyVote ? (
                  <span className="er-mono er-mono--hot">Your vote</span>
                ) : isSelected && isVotingOpen ? (
                  <span className="er-mono er-mono--bone">Tap again to confirm</span>
                ) : (
                  <span className="er-mono er-mono--dim">{isVotingOpen ? 'Tap to select' : 'Locked'}</span>
                )}
              </div>

              {isMurderer(suspect.id) && currentRound >= 6 && (
                <span className="er-tag absolute -top-2 left-3">Killer</span>
              )}
            </button>
          );
        })}
      </div>

      <VoteResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        voteCounts={voteCounts}
      />
    </div>
  );
};
