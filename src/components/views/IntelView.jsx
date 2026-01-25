import React from 'react';
import { Unlock, AlertTriangle, Target, Skull } from '../icons/IconComponents';
import { CLUE_DB } from '../../data/gameData';

export const IntelView = ({ unlockedClues, myAccusation, confession, currentRound = 0, revealedClues = [] }) => {
  // Get clues from CLUE_DB (either unlocked by player OR revealed by host)
  const allAvailableClueIds = [...new Set([...unlockedClues, ...revealedClues])];
  const unlockedClueItems = CLUE_DB.filter(c => allAvailableClueIds.includes(c.id));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-typewriter font-bold text-mystery-paper text-center uppercase tracking-widest">Evidence Board</h2>
      
      {/* Confession Clue - Only for murderer in Round 6 */}
      {confession && (
        <div className="relative p-6 sm:p-8 border-2 border-mystery-blood bg-mystery-ink shadow-2xl animate-pulse-slow">
          <div className="absolute -top-3 left-4 bg-mystery-blood text-white px-4 py-2 font-typewriter font-bold text-base flex items-center gap-2">
            <Skull size={20} /> CONFESSION
          </div>
          <div className="pt-4">
            <h3 className="text-2xl sm:text-3xl font-typewriter font-bold uppercase text-mystery-blood mb-4">{confession.title}</h3>
            <p className="text-xl sm:text-2xl font-handwriting text-mystery-paper leading-relaxed italic whitespace-pre-line">"{confession.content}"</p>
            <p className="text-base text-mystery-aged mt-4 font-body">Only you can see this revelation.</p>
          </div>
        </div>
      )}

      {/* Accusation Card - Round 1+ */}
      {myAccusation && currentRound >= 1 && (
        <div className="relative p-6 sm:p-8 border-2 border-amber-600 bg-mystery-charcoal shadow-2xl">
          <div className="absolute -top-3 left-4 bg-amber-600 text-mystery-ink px-4 py-2 font-typewriter font-bold text-base flex items-center gap-2">
            <Target size={20} /> YOUR ACCUSATION CARD
          </div>
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={24} className="text-amber-500" />
              <span className="text-base font-body text-amber-400 uppercase">Share this verbally with others!</span>
            </div>
            
            {/* Accusation Code Badge */}
            <div className="mb-4 inline-block bg-amber-600 text-mystery-ink px-5 py-2.5 font-typewriter font-bold text-base border border-amber-800">
              CODE: {myAccusation.code}
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-typewriter font-bold uppercase text-amber-400 mb-4">{myAccusation.title}</h3>
            <p className="text-xl sm:text-2xl font-handwriting text-mystery-paper leading-relaxed italic whitespace-pre-line">"{myAccusation.accusation}"</p>
            <div className="mt-4 bg-mystery-ink/50 p-3 border border-amber-600/30">
              <p className="text-sm text-amber-300 font-body">
                💡 <strong>Tip:</strong> This is your assigned accusation. Discuss it with other investigators to build your case!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Round Indicator for Accusations */}
      {myAccusation && currentRound < 1 && (
        <div className="bg-mystery-charcoal border-2 border-dashed border-mystery-aged/30 p-4 text-center">
          <p className="text-mystery-aged font-body">🔒 Your accusation card will be revealed in Round 1</p>
        </div>
      )}

      {/* Unlocked Clues from Decoder */}
      <div className="grid gap-4 sm:gap-6">
        {unlockedClueItems.length === 0 && !myAccusation && !confession && (
          <p className="text-center text-mystery-aged font-handwriting text-xl italic py-8">No evidence collected yet. Enter codes to unlock clues.</p>
        )}
        
        {unlockedClueItems.length === 0 && (myAccusation || confession) && (
          <div className="text-center py-4">
            <p className="text-mystery-aged text-sm font-body">Enter codes from printed cards to unlock more clues.</p>
          </div>
        )}

        {unlockedClueItems.map((clue, idx) => {
          const rotation = idx % 2 === 0 ? 'rotate-1' : 'rotate-[-1deg]';
          const isRevelation = clue.type === 'REVELATION';
          const isAccusation = clue.type === 'ACCUSATION';
          const isMotive = clue.type === 'MOTIVE';
          const isForensics = clue.type === 'FORENSICS';
          const isEvidence = clue.type === 'EVIDENCE';
          const clueText = isAccusation ? clue.accusation : clue.content;
          
          // Color scheme based on type
          let borderColor, bgColor, titleColor, badgeColor;
          
          if (isRevelation) {
            borderColor = 'border-purple-600';
            bgColor = 'bg-purple-900/90';
            titleColor = 'text-purple-300';
            badgeColor = 'bg-purple-700';
          } else if (isAccusation) {
            borderColor = 'border-amber-600';
            bgColor = 'bg-amber-900/90';
            titleColor = 'text-amber-300';
            badgeColor = 'bg-amber-700';
          } else if (isMotive) {
            borderColor = 'border-red-600';
            bgColor = 'bg-red-900/90';
            titleColor = 'text-red-300';
            badgeColor = 'bg-red-700';
          } else if (isForensics) {
            borderColor = 'border-blue-600';
            bgColor = 'bg-blue-900/90';
            titleColor = 'text-blue-300';
            badgeColor = 'bg-blue-700';
          } else if (isEvidence) {
            borderColor = 'border-green-600';
            bgColor = 'bg-green-900/90';
            titleColor = 'text-green-300';
            badgeColor = 'bg-green-700';
          } else {
            borderColor = 'border-mystery-aged';
            bgColor = 'bg-mystery-charcoal';
            titleColor = 'text-mystery-blood';
            badgeColor = 'bg-mystery-aged';
          }
          
          return (
            <div 
              key={clue.id} 
              className={`relative p-6 sm:p-8 border-2 ${borderColor} ${bgColor} shadow-2xl transition-all ${rotation}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-8 bg-white/10 rotate-1 backdrop-blur-sm shadow-sm"></div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <h3 className={`text-xl sm:text-2xl font-typewriter font-bold uppercase ${titleColor}`}>{clue.title}</h3>
                <Unlock size={24} className="text-emerald-400"/>
              </div>
              <div>
                <span className={`text-xs ${badgeColor} text-white px-3 py-1.5 font-typewriter font-bold uppercase mb-3 inline-block`}>{clue.type}</span>
                <p className="text-lg sm:text-xl font-handwriting text-mystery-paper leading-relaxed italic mb-2 whitespace-pre-line">"{clueText}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
