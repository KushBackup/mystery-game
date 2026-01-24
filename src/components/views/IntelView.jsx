import React from 'react';
import { Unlock, AlertTriangle, Target, Skull } from '../icons/IconComponents';
import { CLUE_DB } from '../../data/gameData';

export const IntelView = ({ unlockedClues, myAccusation, confession, currentRound = 0, revealedClues = [] }) => {
  // Get clues from CLUE_DB (either unlocked by player OR revealed by host)
  const allAvailableClueIds = [...new Set([...unlockedClues, ...revealedClues])];
  const unlockedClueItems = CLUE_DB.filter(c => allAvailableClueIds.includes(c.id));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase decoration-wavy underline decoration-orange-500">Evidence Board</h2>
      
      {/* Confession Clue - Only for murderer in Round 6 */}
      {confession && (
        <div className="relative p-4 border-4 border-red-700 bg-red-50 shadow-sketch-lg animate-pulse-slow">
          <div className="absolute -top-4 left-4 bg-red-700 text-white px-3 py-1 font-black text-sm flex items-center gap-2">
            <Skull size={16} /> CONFESSION
          </div>
          <div className="pt-4">
            <h3 className="text-xl font-black uppercase text-red-800 mb-3">{confession.title}</h3>
            <p className="text-lg font-bold text-red-900 leading-relaxed font-serif italic">"{confession.content}"</p>
            <p className="text-sm text-red-600 mt-4 font-bold">Only you can see this revelation.</p>
          </div>
        </div>
      )}

      {/* Accusation Card - Round 1+ */}
      {myAccusation && currentRound >= 1 && (
        <div className="relative p-4 border-4 border-amber-600 bg-amber-50 shadow-sketch-lg">
          <div className="absolute -top-4 left-4 bg-amber-600 text-white px-3 py-1 font-black text-sm flex items-center gap-2">
            <Target size={16} /> YOUR ACCUSATION CARD
          </div>
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-amber-700" />
              <span className="text-sm font-bold text-amber-700 uppercase">Share this verbally with others!</span>
            </div>
            
            {/* Accusation Code Badge */}
            <div className="mb-3 inline-block bg-amber-600 text-white px-4 py-2 rounded font-mono font-black text-sm border-2 border-amber-800">
              CODE: {myAccusation.code}
            </div>
            
            <h3 className="text-xl font-black uppercase text-amber-900 mb-3">{myAccusation.title}</h3>
            <p className="text-lg font-bold text-stone-800 leading-relaxed font-serif italic">"{myAccusation.accusation}"</p>
            <div className="mt-4 bg-amber-200/50 p-2 rounded border border-amber-300">
              <p className="text-xs text-amber-800">
                💡 <strong>Tip:</strong> This is your assigned accusation. Discuss it with other investigators to build your case!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Round Indicator for Accusations */}
      {myAccusation && currentRound < 1 && (
        <div className="bg-stone-200 border-2 border-dashed border-stone-400 p-4 rounded text-center">
          <p className="text-stone-500 font-bold">🔒 Your accusation card will be revealed in Round 1</p>
        </div>
      )}

      {/* Unlocked Clues from Decoder */}
      <div className="grid gap-4 sm:gap-6">
        {unlockedClueItems.length === 0 && !myAccusation && !confession && (
          <p className="text-center text-stone-500 italic py-8">No evidence collected yet. Enter codes to unlock clues.</p>
        )}
        
        {unlockedClueItems.length === 0 && (myAccusation || confession) && (
          <div className="text-center py-4">
            <p className="text-stone-400 text-sm">Enter codes from printed cards to unlock more clues.</p>
          </div>
        )}

        {unlockedClueItems.map((clue, idx) => {
          const rotation = idx % 2 === 0 ? 'rotate-1' : 'rotate-[-1deg]';
          const isRevelation = clue.type === 'REVELATION';
          const isAccusation = clue.type === 'ACCUSATION';
          const clueText = isAccusation ? clue.accusation : clue.content;
          
          return (
            <div 
              key={clue.id} 
              className={`relative p-4 border-2 ${isRevelation ? 'border-purple-700 bg-purple-50' : 'border-stone-900 bg-white'} shadow-sketch transition-all ${rotation}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-6 bg-yellow-200/50 rotate-1 border-l border-r border-white/50 backdrop-blur-sm shadow-sm"></div>
              <div className="flex justify-between items-start mb-3 pt-2">
                <h3 className={`text-lg sm:text-xl font-black uppercase ${isRevelation ? 'text-purple-700' : 'text-red-700'}`}>{clue.title}</h3>
                <Unlock size={18} className="text-green-600"/>
              </div>
              <div>
                <span className={`text-[10px] ${isRevelation ? 'bg-purple-200' : 'bg-stone-200'} px-2 py-1 rounded font-bold uppercase mb-2 inline-block`}>{clue.type}</span>
                <p className="text-base sm:text-lg font-bold text-stone-800 leading-snug font-serif italic mb-2">"{clueText}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
