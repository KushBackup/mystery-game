import React from 'react';
import { Fingerprint } from '../icons/IconComponents';
import { DoodleCoffeeStain } from '../ui/Doodles';

export const DashboardView = ({ myCharacter }) => {
  return (
    <div className="space-y-6 animate-fade-in relative z-10 w-full max-w-3xl mx-auto">
      {/* Identity Card */}
      <div className="bg-mystery-paper p-1 shadow-2xl transform rotate-1 relative">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/20 -rotate-1 shadow-sm backdrop-blur-[1px] opacity-70 z-20"></div>

        <div className="border border-mystery-ink/20 p-4 sm:p-8 relative overflow-hidden h-full">
          <DoodleCoffeeStain className="opacity-40 -top-10 -right-10 absolute pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-8 border-b-2 border-dashed border-mystery-ink/30 pb-6">
               <div className="w-24 h-24 sm:w-28 sm:h-28 bg-mystery-aged border-2 border-mystery-ink rounded-sm flex items-center justify-center mb-4 shadow-inner relative overflow-hidden group">
                  <Fingerprint size={50} className="text-mystery-ink/40 sm:w-16 sm:h-16 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 w-full text-center bg-mystery-ink text-white text-[9px] py-1 font-typewriter">
                    NO PHOTO AVAILABLE
                  </div>
               </div>
              <h1 className="text-4xl sm:text-5xl font-typewriter font-bold text-mystery-ink text-center uppercase tracking-tighter mb-2">
                {myCharacter.name}
              </h1>
              <span className="bg-mystery-ink text-mystery-paper px-5 py-2 text-sm sm:text-base font-typewriter font-bold -rotate-1 shadow-lg border border-mystery-paper">
                {myCharacter.profession}
              </span>
            </div>

            {myCharacter.role === 'MURDERER' ? (
               <div className="bg-mystery-blood/10 border border-mystery-blood p-4 mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-mystery-blood/10 text-9xl font-black z-0 rotate-12">!</div>
                  <p className="relative z-10 text-mystery-blood font-typewriter font-bold uppercase text-center text-lg sm:text-2xl tracking-widest animate-pulse">
                    ⚠️ CLASSIFIED: MURDERER
                  </p>
               </div>
            ) : myCharacter.role === 'VICTIM' ? (
              <div className="bg-purple-900/10 border border-purple-900 p-4 mb-6 shadow-inner">
                  <p className="text-purple-900 font-typewriter font-bold uppercase text-center text-lg sm:text-2xl tracking-widest">
                    ✝ DECEASED (VICTIM)
                  </p>
              </div>
            ) : null}

            <div className="space-y-6">
              {/* Bio Section */}
              <div className="relative group">
                  <div className="absolute -top-3 left-4 bg-mystery-ink text-mystery-paper px-2 py-0.5 text-xs font-typewriter uppercase tracking-widest border border-mystery-paper shadow-md z-10">
                    Subject Profile
                  </div>
                  <div className="border-l-2 border-mystery-ink/50 pl-4 py-2 bg-mystery-aged/10">
                    <p className="font-body text-mystery-ink text-base sm:text-lg leading-relaxed text-justify">
                      {myCharacter.bio}
                    </p>
                  </div>
              </div>

              {/* Secret Section */}
              <div className="relative group mt-8">
                  <div className="absolute -top-3 left-4 bg-mystery-blood text-white px-2 py-0.5 text-xs font-typewriter uppercase tracking-widest border border-mystery-paper shadow-md z-10">
                    Confidential Note
                  </div>
                  <div className="bg-mystery-aged/30 p-4 border border-mystery-ink/20 shadow-inner relative">
                    <div className="absolute top-0 right-0 p-1 opacity-20">★ CONFIDENTIAL</div>
                    <p className="font-handwriting text-2xl sm:text-3xl text-mystery-ink leading-relaxed rotate-0 pt-2">
                      "{myCharacter.secret}"
                    </p>
                  </div>
              </div>
            </div>

            {/* Footer Stamps */}
            <div className="mt-8 flex justify-between items-end opacity-50 pointer-events-none select-none">
              <div className="border-2 border-mystery-ink/50 px-2 py-1 rotate-3">
                <span className="font-typewriter text-xs font-bold text-mystery-ink">VERIFIED</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-typewriter text-[10px] text-mystery-ink">CASE ID: #8821B</span>
                <span className="font-typewriter text-[10px] text-mystery-ink">OFFICER: T. Mistry</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
