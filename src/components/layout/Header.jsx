import React from 'react';
import { Ghost } from '../icons/IconComponents';

export const Header = ({ currentRound, currentRoundData, onSecretTap }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f4f1ea]/95 border-b-4 border-stone-900 p-3 sm:p-4 shadow-sm">
      <div className="flex justify-center items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-3" onClick={onSecretTap}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 border-2 border-stone-900 rounded-lg flex items-center justify-center rotate-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <Ghost size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black leading-none text-stone-900 uppercase">ROUND {currentRound}</h2>
            <span className="text-[10px] sm:text-xs text-red-600 font-bold tracking-widest bg-red-100 px-1">{currentRoundData.title}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
