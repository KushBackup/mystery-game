import React from 'react';
import { Unlock } from '../icons/IconComponents';
import { CLUE_DB } from '../../data/gameData';

export const IntelView = ({ unlockedClues }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase decoration-wavy underline decoration-orange-500">Evidence Board</h2>
      
      <div className="grid gap-4 sm:gap-6">
        {CLUE_DB.filter(c => unlockedClues.includes(c.id)).length === 0 && (
            <p className="text-center text-stone-500 italic">No evidence collected yet. Enter codes to unlock clues.</p>
        )}
        {CLUE_DB.filter(c => unlockedClues.includes(c.id)).map((clue, idx) => {
          const rotation = idx % 2 === 0 ? 'rotate-1' : 'rotate-[-1deg]';
          return (
            <div key={clue.id} className={`relative p-4 border-2 border-stone-900 bg-white shadow-sketch transition-all ${rotation}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-6 bg-yellow-200/50 rotate-1 border-l border-r border-white/50 backdrop-blur-sm shadow-sm"></div>
              <div className="flex justify-between items-start mb-3 pt-2">
                <h3 className="text-lg sm:text-xl font-black uppercase text-red-700">{clue.title}</h3>
                <Unlock size={18} className="text-green-600"/>
              </div>
              <div>
                  <span className="text-[10px] bg-stone-200 px-2 py-1 rounded font-bold uppercase mb-2 inline-block">{clue.type}</span>
                  <p className="text-base sm:text-lg font-bold text-stone-800 leading-snug font-serif italic mb-2">"{clue.content}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
