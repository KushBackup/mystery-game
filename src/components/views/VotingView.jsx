import React, { useState } from 'react';
import { CHARACTERS, isMurderer } from '../../data/gameData';
import { VoteResultsModal } from '../modals/VoteResultsModal';
import { Numeral } from '../ui/Numeral';
import { InfoTip } from '../ui/InfoTip';
import { SearchField } from '../ui/SearchField';
import { TOOLTIPS } from '../../data/tooltips';

// The last round whose tally this device has actually opened.
//
// The host releases the numbers once per round, from a screen the player is
// usually not looking at, and until now the only sign of it was a button quietly
// replacing the "Tally withheld" tag. This is what lets the button know it is
// carrying something unread, so it can knock (App.css §17) and hold a signal
// border until somebody looks.
//
// Persisted rather than held in component state, because VotingView unmounts the
// moment the player closes the screen — a per-round cue kept in state would fire
// again on every single visit. Keyed on the round, because a release *is* a
// per-round event: reading Round 03's tally says nothing about Round 04's.
//
// Deliberately outside App's SESSION_KEY, for the same reason as the ASK ledger:
// it has to survive a reload, a service-worker update and the host's force-sync
// broadcast, none of which is a reason to knock at somebody who read the tally
// two minutes ago.
const TALLY_SEEN_KEY = 'astral.tallyseen';

// The fallback for private-mode Safari, where every localStorage call throws.
// The ASK ledger treats an unreadable store as *spent*, because the alternative
// there is a button knocking on every visit for the whole evening. This one can
// do better: the cue is bounded by an unread state that the player clears
// themselves, so a session-lifetime copy holds "once per round" for as long as
// the tab lives, and only a reload can replay it.
let tallySeenMemory = null;

const tallySeenRound = () => {
  if (tallySeenMemory !== null) return tallySeenMemory;
  try {
    const raw = window.localStorage.getItem(TALLY_SEEN_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
};

const markTallySeen = (round) => {
  tallySeenMemory = round;
  try {
    window.localStorage.setItem(TALLY_SEEN_KEY, String(round));
  } catch {
    // Nothing to do — the in-memory copy above carries the session.
  }
};

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
  const [query, setQuery] = useState('');

  // The ballot used to jumble the roster itself. That now happens once, at the
  // data layer (`dealt()` in gameData.js), so the ballot, the Suspects index and
  // every guest's file number all agree on one order — and no conspirator sits
  // in the first row of the grid.
  const suspects = CHARACTERS;

  // Filtering only hides cards — it never reorders them, so the shared jumbled
  // order above stays intact and "the third one" still means the same person
  // once the field is cleared.
  const visibleSuspects = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return suspects;

    return suspects.filter((suspect) =>
      [suspect.name, suspect.profession]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    );
  }, [suspects, query]);

  const hasVoted = votes[currentRound] !== undefined;
  const hasAnyVotes = Object.keys(voteCounts || {}).length > 0;
  const totalVotes = Object.values(voteCounts || {}).reduce((a, b) => a + b, 0);

  // Read once, in a *pure* initialiser, so StrictMode's double invoke gets the
  // same answer both times.
  const [tallySeen, setTallySeen] = useState(() => tallySeenRound());

  // The host has the numbers out and this device has not opened them. Drives all
  // three channels on the button below — the knock, the signal border and the
  // tag — and every one of them ends together when the player taps it.
  const tallyUnread = voteResultsVisible && tallySeen !== currentRound;

  const handleOpenTally = () => {
    setShowResults(true);
    markTallySeen(currentRound);
    setTallySeen(currentRound);
  };

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
          <div className="flex items-center gap-2 min-w-0">
            <p className={`er-mono er-mono--wide ${isVotingOpen ? 'er-mono--hot' : ''}`}>
              {isVotingOpen ? 'Ballot open' : 'Ballot closed'}
            </p>
            {/* Who opens it, and that a vote is changeable — the line below
                says one of those and only while the ballot is open (§6.13). */}
            <InfoTip tip={TOOLTIPS.ballot} />
          </div>
          <span className="er-mono er-mono--dim shrink-0">
            Round {String(currentRound).padStart(2, '0')}
          </span>
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
            {/* "Tally withheld" opposite reads as a rebuff without this — the
                numbers are hidden from the whole room, not from this player. */}
            <p className="er-stat__label flex items-center gap-2">
              Votes cast
              <InfoTip tip={TOOLTIPS.tally} />
            </p>
          </div>

          {voteResultsVisible ? (
            /* A released tally is the one thing on this screen the player has to
               be told about: it appears while they are somewhere else, and it is
               only up until the host takes it down. So the button knocks twice
               (App.css §17) and then stops — but motion is never the only
               channel (§7.1), so the tag and the 3px state rule stay put until
               the tally is actually opened. */
            <div className="flex flex-col items-end gap-2">
              {tallyUnread && (
                <span key={currentRound} className="er-tag er-swap">
                  Just released
                </span>
              )}

              <button
                onClick={handleOpenTally}
                className={`er-touch px-5 py-3 bg-ink-raised border font-mono text-[11px] font-medium uppercase tracking-[0.24em] ${
                  tallyUnread
                    ? 'er-summon-tally border-signal border-t-[3px] border-t-signal text-signal-lift'
                    : 'border-line text-bone hover:border-signal'
                }`}
              >
                View tally
              </button>
            </div>
          ) : (
            <span className="er-tag er-tag--mute">Tally withheld</span>
          )}
        </div>
      )}

      {/* Filter */}
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search the ballot by name or job…"
        label="Search the ballot"
        resultCount={visibleSuspects.length}
        totalCount={suspects.length}
      />

      {visibleSuspects.length === 0 && (
        <p className="er-card font-body text-[15px] leading-[1.55] text-dim">
          Nobody on the ballot matches “{query.trim()}”.
        </p>
      )}

      {/* Suspects */}
      <div className="grid grid-cols-2 gap-3">
        {visibleSuspects.map((suspect, index) => {
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
