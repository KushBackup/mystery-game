import React from 'react';
import { Ghost } from '../icons/IconComponents';

export const Header = ({ currentRound, currentRoundData, onSecretTap }) => {
  return (
    <header className="sticky top-0 z-30 bg-mystery-dark border-b border-mystery-ink/20 p-4 shadow-noir">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')"
        }}
      />
      <div className="relative z-10 flex justify-center items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onSecretTap}>
          <div className="w-12 h-12 bg-mystery-paper border-2 border-mystery-ink rounded-sm flex items-center justify-center shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
            <span className="font-typewriter text-3xl font-bold text-mystery-ink">
              {currentRound}
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-typewriter font-bold text-mystery-paper tracking-widest uppercase">
              PHASE {currentRound}
            </h2>
            <span className="text-sm font-handwriting text-mystery-aged tracking-wide border-t border-mystery-blood/50 pt-1 -rotate-1 origin-left">
              {currentRoundData.title}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
