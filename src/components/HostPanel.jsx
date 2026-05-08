import React, { useState } from 'react';
import { X, Zap } from './icons/IconComponents';
import { 
  updateCurrentRound, 
  updateVotingStatus, 
  updateVoteResultsVisibility, 
  updateMurdererReveal,
  unlockFilesForRound,
  revealClues,
  revealCluesForRound,
  resetGameState,
  endGame 
} from '../firebase/config';
import { CASE_FILES, CLUE_DB } from '../data/gameData';

export const HostPanel = ({
  isOpen,
  currentRound,
  isVotingOpen,
  voteResultsVisible = false,
  revealedToMurderer = false,
  unlockedFiles = [],
  revealedClues = [],
  setCurrentRound,
  setIsVotingOpen,
  setVoteResultsVisible,
  setRevealedToMurderer,
  setUnlockedFiles,
  setRevealedClues,
  setGameEnded,
  onClose
}) => {
  const [expandedRound, setExpandedRound] = useState(null);

  if (!isOpen) return null;

  // Optimistic UI: update local state instantly so the host sees feedback the
  // moment they tap, then fire-and-forget the Firestore write. The onSnapshot
  // subscription in App.jsx confirms the same value a moment later (no flicker).
  const handleRoundChange = (newRound) => {
    setCurrentRound(newRound);
    updateCurrentRound(newRound);
  };

  const handleToggleVoting = () => {
    const next = !isVotingOpen;
    setIsVotingOpen(next);
    updateVotingStatus(next);
  };

  const handleToggleVoteResults = () => {
    const next = !voteResultsVisible;
    setVoteResultsVisible(next);
    updateVoteResultsVisibility(next);
  };

  const handleRevealMurderer = () => {
    if (revealedToMurderer) return;
    if (window.confirm('Reveal the murderer to ALL 32 players? This ends the game and cannot be undone except by Reset Game.')) {
      setRevealedToMurderer(true);
      setGameEnded(true);
      updateMurdererReveal(true);
    }
  };

  const handleUnlockRoundFiles = (round) => {
    const idsForRound = CASE_FILES.filter(f => f.roundReq === round).map(f => f.id);
    setUnlockedFiles([...new Set([...unlockedFiles, ...idsForRound])]);
    unlockFilesForRound(round);
  };

  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all progress.')) {
      await resetGameState();
    }
  };

  const handleEndGame = () => {
    if (window.confirm('Are you sure you want to end the game? All players will see the outro screen.')) {
      setGameEnded(true);
      endGame();
    }
  };

  const handleRevealClue = (clueId) => {
    if (revealedClues.includes(clueId)) return;
    setRevealedClues([...revealedClues, clueId]);
    revealClues([clueId]);
  };

  const handleRevealAllForRound = (round) => {
    const idsForRound = CLUE_DB.filter(c => c.roundReq === round && c.type !== 'CONFESSION').map(c => c.id);
    setRevealedClues([...new Set([...revealedClues, ...idsForRound])]);
    revealCluesForRound(round);
  };

  // Get counts of files per round
  const round0Files = CASE_FILES.filter(f => f.roundReq === 0);
  const round3Files = CASE_FILES.filter(f => f.roundReq === 3);
  const round4Files = CASE_FILES.filter(f => f.roundReq === 4);

  // Group clues by round (excluding confession which is handled separately)
  const cluesByRound = {
    1: CLUE_DB.filter(c => c.roundReq === 1 && c.type !== 'CONFESSION'),
    2: CLUE_DB.filter(c => c.roundReq === 2 && c.type !== 'CONFESSION'),
    3: CLUE_DB.filter(c => c.roundReq === 3 && c.type !== 'CONFESSION'),
    4: CLUE_DB.filter(c => c.roundReq === 4 && c.type !== 'CONFESSION'),
  };

  return (
    <div className="min-h-screen bg-mystery-dark text-white p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-mystery-blood to-red-800 p-4 rounded-2xl shadow-xl border-4 border-white">
          <h3 className="font-black text-white flex items-center gap-2 text-2xl sm:text-4xl" style={{ fontFamily: 'Fredoka, cursive' }}>
            <Zap size={32}/> 👻 HOST CONTROL PANEL
          </h3>
          <button 
            onClick={onClose} 
            className="bg-red-600 hover:bg-red-500 text-white rounded-full p-2 transition-all hover:scale-110 active:scale-95"
          >
            <X size={24}/>
          </button>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Round Control */}
        <div className="bg-gradient-to-br from-mystery-charcoal to-purple-900 p-4 rounded-2xl border-4 border-mystery-blood shadow-xl">
          <p className="text-xs text-mystery-aged uppercase mb-3 font-bold text-center">Current Round</p>
          <div className="flex items-center justify-between mt-1">
            <button 
              onClick={() => handleRoundChange(Math.max(0, currentRound - 1))} 
              className="bg-mystery-blood px-6 py-3 rounded-xl hover:bg-orange-500 transition-all font-black text-2xl active:scale-90 shadow-xl"
            >
              -
            </button>
            <span className="font-black text-6xl text-mystery-blood drop-shadow-lg">{currentRound}</span>
            <button 
              onClick={() => handleRoundChange(Math.min(6, currentRound + 1))} 
              className="bg-mystery-blood px-6 py-3 rounded-xl hover:bg-orange-500 transition-all font-black text-2xl active:scale-90 shadow-xl"
            >
              +
            </button>
          </div>
          <p className="text-xs text-stone-300 mt-3 text-center">Updates all devices in real-time</p>
        </div>

        {/* Voting & Results Control */}
        <div className="bg-gradient-to-br from-mystery-charcoal to-purple-900 p-4 rounded-2xl border-4 border-mystery-blood shadow-xl space-y-3">
          <p className="text-xs text-mystery-aged uppercase mb-3 font-bold text-center">Voting Controls</p>
          <button 
            onClick={handleToggleVoting}
            className={`w-full py-3 rounded-xl font-black text-base transition-all active:scale-95 shadow-xl ${isVotingOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
          >
            {isVotingOpen ? '🔒 CLOSE VOTING' : '🗳️ OPEN VOTING'}
          </button>

          <button 
            onClick={handleToggleVoteResults}
            className={`w-full py-3 rounded-xl font-black text-base transition-all active:scale-95 shadow-xl ${voteResultsVisible ? 'bg-purple-600 hover:bg-purple-500' : 'bg-stone-600 hover:bg-stone-500'}`}
          >
            {voteResultsVisible ? '👁️ HIDE VOTE RESULTS' : '📊 SHOW VOTE RESULTS'}
          </button>
        </div>
      </div>

      {/* File Unlock Controls */}
      <div className="mt-4 bg-gradient-to-br from-mystery-charcoal to-purple-900 p-4 rounded-2xl border-4 border-mystery-blood shadow-xl">
        <p className="text-sm text-mystery-aged uppercase mb-3 font-bold">Unlock Case Files</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => handleUnlockRoundFiles(0)}
            disabled={unlockedFiles.includes('f_incident')}
            className={`py-3 rounded-xl text-sm font-bold transition-all shadow-xl ${
              unlockedFiles.includes('f_incident') 
                ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
            }`}
          >
            📄 Round 0: Incident Report ({round0Files.length} file)
          </button>
          <button 
            onClick={() => handleUnlockRoundFiles(3)}
            disabled={unlockedFiles.includes('f_toxreport')}
            className={`py-3 rounded-xl text-sm font-bold transition-all shadow-xl ${
              unlockedFiles.includes('f_toxreport') 
                ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
            }`}
          >
            🔬 Round 3: Evidence ({round3Files.length} files)
          </button>
          <button 
            onClick={() => handleUnlockRoundFiles(4)}
            disabled={unlockedFiles.includes('f_medical')}
            className={`py-3 rounded-xl text-sm font-bold transition-all shadow-xl ${
              unlockedFiles.includes('f_medical') 
                ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
            }`}
          >
            💀 Round 4: Revelations ({round4Files.length} files)
          </button>
        </div>
        <p className="text-xs text-stone-300 mt-3 text-center">
          Unlocked: {unlockedFiles.length} files
        </p>
      </div>

      {/* Clue Reveal Controls */}
      <div className="mt-4 bg-gradient-to-br from-mystery-charcoal to-purple-900 p-4 rounded-2xl border-4 border-mystery-blood shadow-xl">
        <p className="text-sm text-mystery-aged uppercase mb-3 font-bold">Reveal Clues to All Players</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(round => {
            const roundClues = cluesByRound[round] || [];
            const revealedCount = roundClues.filter(c => revealedClues.includes(c.id)).length;
            const isExpanded = expandedRound === round;
            const allRevealed = revealedCount === roundClues.length;

            return (
              <div key={round} className="bg-stone-800 rounded-xl overflow-hidden border-2 border-stone-700">
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => setExpandedRound(isExpanded ? null : round)}
                    className="flex-1 text-left text-sm font-bold text-white hover:text-orange-400 transition-colors"
                  >
                    🎯 Round {round} ({revealedCount}/{roundClues.length} revealed)
                  </button>
                  <button
                    onClick={() => handleRevealAllForRound(round)}
                    disabled={allRevealed}
                    className={`text-xs px-3 py-1.5 rounded-lg ml-2 font-bold ${
                      allRevealed
                        ? 'bg-stone-600 text-stone-500 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-1 max-h-48 overflow-y-auto">
                    {roundClues.map(clue => {
                      const isRevealed = revealedClues.includes(clue.id);
                      return (
                        <button
                          key={clue.id}
                          onClick={() => handleRevealClue(clue.id)}
                          disabled={isRevealed}
                          className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                            isRevealed
                              ? 'bg-green-900/50 text-green-400 cursor-not-allowed'
                              : 'bg-stone-700 hover:bg-stone-600 text-stone-300'
                          }`}
                        >
                          {isRevealed && '✓ '}{clue.title || clue.code}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-300 mt-3 text-center">
          Revealed: {revealedClues.length} clues total
        </p>
      </div>

      {/* Special Actions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Murderer Reveal (Round 6) — public, ends the game for everyone */}
        <button
          onClick={handleRevealMurderer}
          disabled={currentRound < 6 || revealedToMurderer}
          className={`py-4 rounded-xl font-black text-base transition-all active:scale-95 shadow-xl ${
            currentRound < 6
              ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
              : revealedToMurderer
                ? 'bg-red-700 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500'
          }`}
        >
          {revealedToMurderer ? '🔓 MURDERER REVEALED' : '🎭 REVEAL MURDERER'}
        </button>

        {/* End Game Button */}
        <button 
          onClick={handleEndGame}
          className="py-4 rounded-xl font-black text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 shadow-xl"
        >
          🎬 END GAME
        </button>
      </div>

      {/* Reset Game Button */}
      <div className="mt-4">
        <button 
          onClick={handleResetGame}
          className="w-full py-4 rounded-xl font-black text-base bg-stone-700 hover:bg-red-700 transition-all text-stone-300 hover:text-white active:scale-95 shadow-xl"
        >
          🔄 RESET GAME
        </button>
      </div>

      {/* Status Footer */}
      <div className="mt-4 bg-gradient-to-r from-mystery-blood to-red-800 p-4 rounded-xl border-4 border-white shadow-xl">
        <p className="text-sm text-white font-bold text-center">
          ⚡ Real-time sync via Firebase • All changes broadcast instantly to all players
        </p>
      </div>
      </div>
    </div>
  );
};
