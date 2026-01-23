import React from 'react';
import { X, Zap } from './icons/IconComponents';
import { updateCurrentRound, updateVotingStatus } from '../firebase/config';

export const HostPanel = ({ 
  isOpen, 
  currentRound, 
  isVotingOpen, 
  onClose
}) => {
  if (!isOpen) return null;

  const handleRoundChange = async (newRound) => {
    await updateCurrentRound(newRound);
  };

  const handleToggleVoting = async () => {
    await updateVotingStatus(!isVotingOpen);
  };

  return (
    <div className="fixed bottom-24 left-4 bg-stone-800 text-white p-4 rounded-lg shadow-2xl border-2 border-stone-600 z-50 w-64 sm:w-72">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-orange-400 flex items-center gap-2">
          <Zap size={16}/> HOST PANEL
        </h3>
        <button onClick={onClose} className="hover:text-red-400 transition-colors">
          <X size={16}/>
        </button>
      </div>
      <div className="space-y-3">
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
        <button 
          onClick={handleToggleVoting}
          className={`w-full py-2 rounded font-bold text-sm transition-all active:translate-y-1 ${isVotingOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {isVotingOpen ? '🔒 CLOSE VOTING' : '🗳️ OPEN VOTING'}
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
