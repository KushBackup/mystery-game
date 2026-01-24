import React from 'react';
import { Ghost } from '../icons/IconComponents';

export const Header = ({ currentRound, currentRoundData, onSecretTap }) => {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-halloween-orange to-halloween-pink border-b-4 border-halloween-purple p-4 shadow-halloween backdrop-blur-sm">
      <div className="flex justify-center items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onSecretTap}>
          <div className="w-12 h-12 bg-gradient-to-br from-halloween-yellow to-halloween-orange border-4 border-white rounded-2xl flex items-center justify-center shadow-glow-orange animate-bounce-slow">
            <Ghost size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black leading-none text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: 'Fredoka, cursive' }}>🎃 ROUND {currentRound}</h2>
            <span className="text-sm text-halloween-yellow font-black tracking-wide bg-black/30 px-2 py-0.5 rounded-full">{currentRoundData.title}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
