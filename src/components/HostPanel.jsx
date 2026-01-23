import React from 'react';
import { X, Zap } from './icons/IconComponents';

export const HostPanel = ({ 
  isOpen, 
  currentRound, 
  isVotingOpen, 
  onClose, 
  onRoundChange, 
  onToggleVoting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-4 bg-stone-800 text-white p-4 rounded-lg shadow-2xl border-2 border-stone-600 z-50 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-orange-400 flex items-center gap-2">
          <Zap size={16}/> HOST PANEL
        </h3>
        <button onClick={onClose}>
          <X size={16}/>
        </button>
      </div>
      <div className="space-y-3">
        <div className="bg-stone-700 p-2 rounded">
          <p className="text-xs text-stone-400 uppercase">Current Round</p>
          <div className="flex items-center justify-between mt-1">
            <button 
              onClick={() => onRoundChange(Math.max(0, currentRound - 1))} 
              className="bg-stone-600 px-2 rounded hover:bg-stone-500"
            >
              -
            </button>
            <span className="font-bold text-xl">{currentRound}</span>
            <button 
              onClick={() => onRoundChange(Math.min(6, currentRound + 1))} 
              className="bg-stone-600 px-2 rounded hover:bg-stone-500"
            >
              +
            </button>
          </div>
        </div>
        <button 
          onClick={onToggleVoting}
          className={`w-full py-2 rounded font-bold text-sm ${isVotingOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {isVotingOpen ? 'CLOSE VOTING' : 'OPEN VOTING'}
        </button>
        <div className="text-xs text-stone-500 pt-2 border-t border-stone-700">
          Simulates admin actions for demo.
        </div>
      </div>
    </div>
  );
};
