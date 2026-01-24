import React from 'react';
import { X, Zap } from './icons/IconComponents';
import { 
  updateCurrentRound, 
  updateVotingStatus, 
  updateVoteResultsVisibility, 
  updateMurdererReveal,
  unlockFilesForRound,
  resetGameState 
} from '../firebase/config';
import { CASE_FILES } from '../data/gameData';

export const HostPanel = ({ 
  isOpen, 
  currentRound, 
  isVotingOpen,
  voteResultsVisible = false,
  revealedToMurderer = false,
  unlockedFiles = [],
  onClose
}) => {
  if (!isOpen) return null;

  const handleRoundChange = async (newRound) => {
    await updateCurrentRound(newRound);
  };

  const handleToggleVoting = async () => {
    await updateVotingStatus(!isVotingOpen);
  };

  const handleToggleVoteResults = async () => {
    await updateVoteResultsVisibility(!voteResultsVisible);
  };

  const handleToggleMurdererReveal = async () => {
    await updateMurdererReveal(!revealedToMurderer);
  };

  const handleUnlockRoundFiles = async (round) => {
    await unlockFilesForRound(round);
  };

  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all progress.')) {
      await resetGameState();
    }
  };

  // Get counts of files per round
  const round0Files = CASE_FILES.filter(f => f.roundReq === 0);
  const round3Files = CASE_FILES.filter(f => f.roundReq === 3);
  const round4Files = CASE_FILES.filter(f => f.roundReq === 4);

  return (
    <div className="fixed bottom-24 left-4 bg-stone-800 text-white p-4 rounded-lg shadow-2xl border-2 border-stone-600 z-50 w-72 sm:w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-orange-400 flex items-center gap-2">
          <Zap size={16}/> HOST PANEL
        </h3>
        <button onClick={onClose} className="hover:text-red-400 transition-colors">
          <X size={16}/>
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Round Control */}
        <div className="bg-stone-700 p-3 rounded">
          <p className="text-xs text-stone-400 uppercase mb-2">Current Round</p>
          <div className="flex items-center justify-between mt-1">
            <button 
              onClick={() => handleRoundChange(Math.max(0, currentRound - 1))} 
              className="bg-stone-600 px-3 py-1 rounded hover:bg-stone-500 transition-colors font-bold"
            >
              -
            </button>
            <span className="font-bold text-2xl text-orange-400">{currentRound}</span>
            <button 
              onClick={() => handleRoundChange(Math.min(6, currentRound + 1))} 
              className="bg-stone-600 px-3 py-1 rounded hover:bg-stone-500 transition-colors font-bold"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-stone-500 mt-2 text-center">Updates all devices in real-time</p>
        </div>

        {/* Voting Control */}
        <button 
          onClick={handleToggleVoting}
          className={`w-full py-2 rounded font-bold text-sm transition-all active:translate-y-1 ${isVotingOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {isVotingOpen ? '🔒 CLOSE VOTING' : '🗳️ OPEN VOTING'}
        </button>

        {/* Vote Results Visibility */}
        <button 
          onClick={handleToggleVoteResults}
          className={`w-full py-2 rounded font-bold text-sm transition-all active:translate-y-1 ${voteResultsVisible ? 'bg-purple-600 hover:bg-purple-500' : 'bg-stone-600 hover:bg-stone-500'}`}
        >
          {voteResultsVisible ? '👁️ HIDE VOTE RESULTS' : '📊 SHOW VOTE RESULTS'}
        </button>

        {/* File Unlock Controls */}
        <div className="bg-stone-700 p-3 rounded">
          <p className="text-xs text-stone-400 uppercase mb-2">Unlock Case Files</p>
          <div className="space-y-2">
            <button 
              onClick={() => handleUnlockRoundFiles(0)}
              disabled={unlockedFiles.includes('f_incident')}
              className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
                unlockedFiles.includes('f_incident') 
                  ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              📄 Round 0: Incident Report ({round0Files.length} file)
            </button>
            <button 
              onClick={() => handleUnlockRoundFiles(3)}
              disabled={unlockedFiles.includes('f_toxreport')}
              className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
                unlockedFiles.includes('f_toxreport') 
                  ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              🔬 Round 3: Evidence ({round3Files.length} files)
            </button>
            <button 
              onClick={() => handleUnlockRoundFiles(4)}
              disabled={unlockedFiles.includes('f_medical')}
              className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
                unlockedFiles.includes('f_medical') 
                  ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              💀 Round 4: Revelations ({round4Files.length} files)
            </button>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">
            Unlocked: {unlockedFiles.length} files
          </p>
        </div>

        {/* Murderer Reveal (Round 6) */}
        <button 
          onClick={handleToggleMurdererReveal}
          disabled={currentRound < 6}
          className={`w-full py-2 rounded font-bold text-sm transition-all active:translate-y-1 ${
            currentRound < 6 
              ? 'bg-stone-600 text-stone-400 cursor-not-allowed' 
              : revealedToMurderer 
                ? 'bg-red-700 hover:bg-red-600' 
                : 'bg-amber-600 hover:bg-amber-500'
          }`}
        >
          {revealedToMurderer ? '🔓 CONFESSION REVEALED' : '🎭 REVEAL TO MURDERER'}
        </button>

        {/* Reset Game */}
        <button 
          onClick={handleResetGame}
          className="w-full py-2 rounded font-bold text-sm bg-stone-700 hover:bg-red-700 transition-all text-stone-400 hover:text-white"
        >
          🔄 RESET GAME
        </button>

        <div className="bg-orange-900/30 p-2 rounded border border-orange-700/50">
          <p className="text-[10px] text-orange-300 text-center">
            ⚡ Real-time sync via Firebase
          </p>
        </div>
      </div>
    </div>
  );
};
