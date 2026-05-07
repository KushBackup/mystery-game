import React, { useState } from 'react';
import { Lock, Vote } from '../icons/IconComponents';
import { CHARACTERS } from '../../data/gameData';
import { VoteResultsModal } from '../modals/VoteResultsModal';

export const VotingView = ({ 
  currentUser, 
  isVotingOpen, 
  currentRound, 
  votes, 
  voteCounts,
  voteResultsVisible = false,
  onVote 
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState(votes[currentRound] || null);
  const [showResults, setShowResults] = useState(false);
  const [confirmingVote, setConfirmingVote] = useState(null);

  // Show all characters for voting. Move the murderer out of the first slot
  // so players don't see Alam's name immediately and form a bias against him.
  const suspects = React.useMemo(() => {
    const list = [...CHARACTERS];
    const murdererIdx = list.findIndex(c => c.role === 'MURDERER');
    if (murdererIdx > -1) {
      const [murderer] = list.splice(murdererIdx, 1);
      const middle = Math.floor(list.length / 2);
      list.splice(middle, 0, murderer);
    }
    return list;
  }, []);
  const hasVoted = votes[currentRound] !== undefined;
  const hasAnyVotes = Object.keys(voteCounts || {}).length > 0;

  const handleVoteClick = (suspectId) => {
    if (!isVotingOpen) return;
    
    if (suspectId === selectedSuspect) {
      // Clicking again confirms the vote
      setConfirmingVote(suspectId);
      onVote(suspectId);
      setTimeout(() => setConfirmingVote(null), 2000);
    } else {
      // First click selects
      setSelectedSuspect(suspectId);
    }
  };

  return (
    <div className="fixed inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto animate-fade-in">
      <div className="max-w-2xl mx-auto p-4 pb-8">
        {/* Header Card */}
        <div className={`p-6 mb-6 border-2 shadow-2xl relative overflow-hidden ${
          isVotingOpen 
            ? 'bg-emerald-900 border-emerald-700' 
            : 'bg-mystery-charcoal border-mystery-ink'
        }`}>
          <div className="relative z-10">
            {isVotingOpen ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Vote size={32} className="text-emerald-400 animate-pulse" />
                  <h2 className="text-3xl font-typewriter font-bold text-white uppercase tracking-wide">
                    Voting Open
                  </h2>
                </div>
                <p className="text-center text-emerald-200 text-sm font-body mb-3">
                  Round {currentRound} • Cast your vote for the prime suspect
                </p>
                {hasVoted ? (
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 p-3">
                    <p className="text-white font-typewriter font-bold text-lg">✓ VOTE RECORDED</p>
                    <p className="text-white/80 text-sm mt-1 font-body">
                      Suspect: <span className="font-typewriter font-bold">{CHARACTERS.find(c => c.id === selectedSuspect)?.name}</span>
                    </p>
                    <p className="text-white/60 text-xs mt-2 font-body">Tap another suspect to change your vote</p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 p-3">
                    <p className="text-white/90 text-sm font-body">Tap a suspect to select, tap again to confirm</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Lock size={32} className="text-mystery-aged" />
                  <h2 className="text-3xl font-typewriter font-bold text-mystery-aged uppercase tracking-wide">
                    Voting Closed
                  </h2>
                </div>
                <p className="text-center text-mystery-aged/60 text-sm font-body">
                  Waiting for host to open voting...
                </p>
              </>
            )}
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.1) 20px,
                  rgba(255,255,255,0.1) 40px
                )`
              }}
            />
          </div>
        </div>

        {/* View Results Button */}
        {hasAnyVotes && voteResultsVisible && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full mb-6 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white p-4 border-4 border-stone-900 shadow-[4px_4px_0px_#1c1917] font-black text-lg uppercase tracking-wide transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📊</span>
            View Vote Results
          </button>
        )}

        {/* Results Locked Message */}
        {hasAnyVotes && !voteResultsVisible && (
          <div className="mb-6 bg-stone-200 border-2 border-dashed border-stone-400 p-4 rounded text-center">
            <Lock size={20} className="inline-block mr-2 text-stone-500" />
            <span className="text-stone-600 font-bold">Vote results are currently hidden by the host</span>
          </div>
        )}

        {/* Suspects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suspects.map((suspect) => {
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
                className={`
                  relative p-4 border-2 transition-all duration-200
                  ${isVotingOpen ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'}
                  ${isSelected && isVotingOpen ? 'border-amber-500 bg-amber-900/50 shadow-xl scale-105' : 'border-mystery-ink bg-mystery-paper shadow-lg'}
                  ${isMyVote ? 'ring-4 ring-emerald-500' : ''}
                  ${isConfirming ? 'animate-pulse' : ''}
                  active:translate-y-1 active:shadow-none
                `}
              >
                {/* Vote Count Badge */}
                {voteCount > 0 && hasAnyVotes && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-mystery-blood border-2 border-white rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-white font-typewriter font-bold text-sm">{voteCount}</span>
                  </div>
                )}

                {/* Character Avatar */}
                <div className={`
                  w-16 h-16 mx-auto mb-3 rounded-full border-4 flex items-center justify-center font-typewriter font-bold text-2xl shadow-lg
                  ${isMe ? 'bg-mystery-blood text-white border-red-800' : 'bg-mystery-aged text-mystery-ink border-mystery-ink'}
                `}>
                  {suspect.name.charAt(0)}
                </div>

                {/* Character Info */}
                <h3 className="font-typewriter font-bold text-lg text-mystery-ink text-center mb-1">
                  {suspect.name}
                  {isMe && <span className="ml-2 text-xs bg-mystery-ink text-white px-2 py-1 font-typewriter">(YOU)</span>}
                </h3>
                <p className="text-xs font-typewriter font-bold text-mystery-blood uppercase tracking-wide text-center mb-2">
                  {suspect.profession}
                </p>

                {/* Vote Status Indicators */}
                <div className="mt-3 pt-3 border-t-2 border-mystery-ink/20">
                  {isMyVote && (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-typewriter font-bold text-sm">
                      <span className="text-lg">✓</span> YOUR VOTE
                    </div>
                  )}
                  {isSelected && !isMyVote && isVotingOpen && (
                    <div className="flex items-center justify-center gap-2 text-amber-600 font-typewriter font-bold text-sm">
                      <span className="text-lg">👆</span> TAP AGAIN TO CONFIRM
                    </div>
                  )}
                  {!isSelected && !isMyVote && isVotingOpen && (
                    <div className="text-mystery-sepia text-xs text-center font-body">
                      Tap to select
                    </div>
                  )}
                </div>

                {/* Role Badge */}
                {suspect.role === 'MURDERER' && currentRound >= 6 && (
                  <div className="absolute top-2 left-2 bg-mystery-blood text-white text-xs font-typewriter font-bold px-2 py-1 border-2 border-red-950">
                    MURDERER
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Helper Text */}
        {isVotingOpen && (
          <div className="mt-6 p-4 bg-blue-900/50 border-2 border-blue-700">
            <p className="text-sm text-blue-200 text-center font-body">
              💡 <span className="font-typewriter font-bold">TIP:</span> Tap once to select, tap again to confirm your vote. You can change votes anytime before voting closes.
            </p>
          </div>
        )}
      </div>

      {/* Vote Results Modal */}
      <VoteResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        voteCounts={voteCounts}
      />
    </div>
  );
};
