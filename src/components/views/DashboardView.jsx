import React from 'react';
import { Fingerprint } from '../icons/IconComponents';
import { DoodleCoffeeStain } from '../ui/Doodles';

export const DashboardView = ({ myCharacter, currentRound }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-1 border-2 border-stone-900 shadow-sketch-lg rotate-[-1deg]">
        <div className="border border-stone-300 p-4 sm:p-6 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <DoodleCoffeeStain />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-6">
               <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-2">
                  <Fingerprint size={40} className="text-stone-300 sm:w-12 sm:h-12" />
               </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase">{myCharacter.name}</h1>
              <span className="bg-stone-900 text-white px-3 py-1 text-xs sm:text-sm font-bold rotate-1 shadow-sm mt-1 transform">
                {myCharacter.profession}
              </span>
            </div>

            {myCharacter.role === 'MURDERER' ? (
               <div className="bg-red-100 border-l-4 border-red-600 p-3 mb-4 rotate-1">
                  <p className="text-red-800 font-bold uppercase text-center text-lg sm:text-xl">⚠️ You are the Murderer</p>
               </div>
            ) : myCharacter.role === 'VICTIM' ? (
              <div className="bg-purple-100 border-l-4 border-purple-600 p-3 mb-4 rotate-1">
                  <p className="text-purple-800 font-bold uppercase text-center text-lg sm:text-xl">🤕 You are the Victim</p>
              </div>
            ) : null}

            <div className="space-y-4 font-bold text-stone-700 text-sm sm:text-base">
              <div className="bg-orange-50 p-4 border-2 border-orange-200 rounded-sm relative">
                  <div className="absolute -top-3 -left-2 bg-orange-500 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[-3deg] border border-stone-900 shadow-sm">SECRET</div>
                  <p className="italic">"{myCharacter.secret}"</p>
              </div>
              
              <div className="mt-6 border-t-2 border-dashed border-stone-300 pt-4 text-center">
                  <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Your Access Code</p>
                  <span className="text-2xl sm:text-3xl font-black text-red-700 tracking-widest font-mono bg-red-50 px-4 py-2 border border-red-200 rotate-1 inline-block select-all">
                      {myCharacter.code}
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
