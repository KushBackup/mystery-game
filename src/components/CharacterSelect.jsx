import React from 'react';
import { Ghost } from './icons/IconComponents';
import { CHARACTERS } from '../data/gameData';

export const CharacterSelect = ({ onSelectCharacter }) => {
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten relative overflow-hidden flex flex-col items-center justify-center p-4 bg-texture">
      {/* Blood Splatters */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-red-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-orange-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white border-4 border-stone-900 rounded-full flex items-center justify-center shadow-sketch-lg rotate-3 mb-4">
            <Ghost size={40} className="text-orange-600 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tighter drop-shadow-sm rotate-[-2deg]">
            THE TAHER <span className="text-red-700">PARTY</span>
          </h1>
          <p className="mt-2 text-stone-600 text-base sm:text-lg font-bold">Murder Mystery Night</p>
        </div>

        <div className="bg-white p-2 border-2 border-stone-900 shadow-sketch rounded-sm rotate-1">
          <div className="border border-stone-300 p-3 sm:p-4 border-dashed rounded-sm bg-[#fafafa]">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-orange-600 text-center uppercase tracking-widest decoration-wavy underline decoration-stone-400">Who Are You?</h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => onSelectCharacter(char.id)}
                  className="w-full text-left p-3 border-b-2 border-stone-200 hover:bg-orange-50 active:bg-orange-100 hover:border-orange-300 transition-all flex justify-between items-center group font-bold text-stone-700 active:scale-[0.98]"
                >
                  <span className="truncate mr-2">{char.name}</span>
                  <span className="text-xs bg-stone-200 px-2 py-1 rounded-sm text-stone-500 whitespace-nowrap group-hover:bg-orange-200 group-hover:text-orange-800">
                    {char.profession}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
