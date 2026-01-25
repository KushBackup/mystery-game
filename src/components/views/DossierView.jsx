import React from 'react';
import { CHARACTERS } from '../../data/gameData';

export const DossierView = ({ 
  currentUser, 
  onSelectGuest 
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-typewriter font-bold text-mystery-paper text-center uppercase mb-6 tracking-widest">Guest Profiles</h2>
      
      <p className="text-center text-mystery-aged mb-6 font-body">
        Tap any guest to view their full profile and background information
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {CHARACTERS.map((char) => (
          <button 
            key={char.id} 
            onClick={() => onSelectGuest(char)}
            className="w-full text-left bg-mystery-paper p-3 sm:p-4 border-2 border-mystery-ink shadow-lg flex items-center gap-3 sm:gap-4 hover:translate-x-1 transition-transform active:translate-y-1 active:shadow-none"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-mystery-ink flex items-center justify-center font-typewriter font-bold text-lg sm:text-xl shadow-sm flex-shrink-0
              ${char.id === currentUser ? 'bg-mystery-blood text-white' : 'bg-mystery-aged text-mystery-ink'}
            `}>
              {char.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                  <h4 className="font-typewriter font-bold text-base sm:text-lg text-mystery-ink truncate">{char.name}</h4>
                  {char.id === currentUser && <span className="text-[10px] bg-mystery-ink text-white px-1 font-typewriter font-bold whitespace-nowrap">(YOU)</span>}
              </div>
              <p className="text-[10px] sm:text-xs font-typewriter font-bold text-mystery-blood uppercase tracking-wide truncate">{char.profession}</p>
              <p className="text-xs sm:text-sm text-mystery-sepia font-handwriting italic mt-1 leading-tight truncate">"{char.quirk}"</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
