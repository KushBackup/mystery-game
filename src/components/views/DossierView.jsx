import React from 'react';
import { CHARACTERS } from '../../data/gameData';

export const DossierView = ({ 
  currentUser, 
  onSelectGuest 
}) => {
  // Array of background colors for character initials
  const avatarColors = [
    'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600',
    'bg-red-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
    'bg-orange-600', 'bg-cyan-600', 'bg-amber-600', 'bg-lime-600',
    'bg-rose-600', 'bg-violet-600', 'bg-sky-600', 'bg-emerald-600'
  ];
  
  return (
    <div className="animate-fade-in relative">
      {/* Header Section with Enhanced Styling */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-mystery-charcoal/30 blur-xl"></div>
        <div className="relative bg-mystery-charcoal/50 p-6 border-2 border-mystery-aged/30 shadow-2xl">
          <div className="absolute -top-4 left-6 bg-mystery-blood text-white px-4 py-1 font-typewriter font-bold text-xs tracking-widest shadow-lg transform -rotate-1">
            CLASSIFIED
          </div>
          <h2 className="text-2xl sm:text-3xl font-typewriter font-bold text-mystery-paper text-center uppercase tracking-widest">Guest Profiles</h2>
          <div className="mt-2 flex justify-center gap-2">
            <div className="w-12 h-0.5 bg-mystery-blood"></div>
            <div className="w-12 h-0.5 bg-mystery-aged"></div>
            <div className="w-12 h-0.5 bg-mystery-blood"></div>
          </div>
          <p className="text-center text-mystery-aged mt-4 font-body text-sm">
            Tap any guest to view their full profile and background information
          </p>
          <div className="absolute top-2 right-2 text-mystery-aged/30 text-xs font-typewriter">
            {CHARACTERS.length} SUSPECTS
          </div>
        </div>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {CHARACTERS.map((char, index) => {
          const avatarColor = char.id === currentUser ? 'bg-mystery-blood' : avatarColors[index % avatarColors.length];
          const isVictim = char.role === 'VICTIM';
          const isSuspect = char.isSuspect;
          
          return (
          <button 
            key={char.id} 
            onClick={() => onSelectGuest(char)}
            className="relative w-full text-left bg-mystery-paper p-3 sm:p-4 border-2 border-mystery-ink shadow-lg flex items-center gap-3 sm:gap-4 hover:translate-x-1 hover:shadow-2xl transition-all group overflow-hidden"
          >
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none"></div>
            
            {/* Decorative corner fold */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-mystery-aged/30 transform rotate-45 translate-x-4 -translate-y-4 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform"></div>
            
            {/* Status badge */}
            {isVictim && (
              <div className="absolute top-2 right-2 bg-purple-900 text-white px-2 py-0.5 text-[8px] font-typewriter font-bold transform rotate-3 shadow-md">
                DECEASED
              </div>
            )}
            {char.id === currentUser && (
              <div className="absolute top-2 right-2 bg-mystery-blood text-white px-2 py-0.5 text-[8px] font-typewriter font-bold transform -rotate-2 shadow-md">
                YOUR ID
              </div>
            )}
            
            {/* Avatar with enhanced styling */}
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-mystery-ink flex items-center justify-center font-typewriter font-bold text-lg sm:text-xl shadow-md text-white ${avatarColor} group-hover:scale-110 transition-transform`}>
                {char.name.charAt(0)}
              </div>
              {/* Decorative corner marks */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-mystery-ink/30"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-mystery-ink/30"></div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-typewriter font-bold text-base sm:text-lg text-mystery-ink truncate">
                      {char.name}
                    </h4>
                    {/* ID number */}
                    <span className="text-[8px] text-mystery-aged/50 font-typewriter">
                      #{(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Profession badge */}
                  <div className="mt-1 inline-flex items-center gap-1">
                    <div className="w-1 h-1 bg-mystery-blood rounded-full"></div>
                    <p className="text-[10px] sm:text-xs font-typewriter font-bold text-mystery-blood uppercase tracking-wide truncate">
                      {char.profession}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quirk with quote marks */}
              <div className="mt-2 relative">
                <div className="absolute -left-1 top-0 text-mystery-sepia/30 text-xl font-handwriting">"</div>
                <p className="text-xs sm:text-sm text-mystery-sepia font-handwriting italic leading-tight truncate pl-3">
                  {char.quirk}
                </p>
              </div>
              
              {/* Bottom metadata bar */}
              <div className="mt-2 pt-2 border-t border-mystery-ink/10 flex items-center gap-3 text-[9px] text-mystery-aged/70 font-typewriter">
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-mystery-aged/50 rounded-full"></div>
                  {isSuspect ? 'SUSPECT' : 'WITNESS'}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-mystery-aged/50 rounded-full"></div>
                  TAP FOR DETAILS
                </span>
              </div>
            </div>
            
            {/* Hover arrow indicator */}
            <div className="flex-shrink-0 text-mystery-ink/30 group-hover:text-mystery-ink group-hover:translate-x-1 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          );
        })}
      </div>
      
      {/* Footer stamp */}
      <div className="mt-8 text-center opacity-30 select-none pointer-events-none">
        <div className="inline-block border-2 border-mystery-aged px-4 py-2 transform rotate-2">
          <p className="font-typewriter text-xs text-mystery-aged font-bold">CONFIDENTIAL - FOR INVESTIGATIVE USE ONLY</p>
        </div>
      </div>
    </div>
  );
};
