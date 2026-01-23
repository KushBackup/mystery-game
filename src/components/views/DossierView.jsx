import React from 'react';
import { CHARACTERS } from '../../data/gameData';

export const DossierView = ({ 
  currentUser, 
  onSelectGuest 
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase mb-6 decoration-wavy underline decoration-red-500">Guest Profiles</h2>
      
      <p className="text-center text-stone-600 mb-6 font-bold">
        Tap any guest to view their full profile and background information
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {CHARACTERS.map((char) => (
          <button 
            key={char.id} 
            onClick={() => onSelectGuest(char)}
            className="w-full text-left bg-white p-3 sm:p-4 border-2 border-stone-900 shadow-[4px_4px_0px_#e5e5e5] flex items-center gap-3 sm:gap-4 hover:translate-x-1 transition-transform active:translate-y-1 active:shadow-none"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-stone-900 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm flex-shrink-0
              ${char.id === currentUser ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-400'}
            `}>
              {char.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                  <h4 className="font-black text-base sm:text-lg text-stone-900 truncate">{char.name}</h4>
                  {char.id === currentUser && <span className="text-[10px] bg-stone-900 text-white px-1 font-bold whitespace-nowrap">(YOU)</span>}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wide truncate">{char.profession}</p>
              <p className="text-xs sm:text-sm text-stone-500 italic mt-1 font-serif leading-tight truncate">"{char.quirk}"</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
