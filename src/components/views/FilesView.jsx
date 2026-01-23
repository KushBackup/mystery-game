import React from 'react';
import { Paperclip } from '../icons/IconComponents';
import { DoodleCoffeeStain, DoodleCCTV } from '../ui/Doodles';
import { CASE_FILES } from '../../data/gameData';

export const FilesView = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase decoration-wavy underline decoration-stone-500">Archives</h2>
      {CASE_FILES.map((file, idx) => {
        const rotate = idx % 2 === 0 ? 'rotate-[1deg]' : 'rotate-[-1deg]';
        return (
          <div key={file.id} className={`bg-white border-2 border-stone-900 shadow-sketch-lg p-4 relative ${rotate}`}>
            <div className="absolute -top-4 right-8 text-stone-400 transform -rotate-45">
              <Paperclip size={32} className="sm:w-10 sm:h-10" />
            </div>
            {file.type === 'REPORT' && (
              <div className="relative overflow-hidden">
                <DoodleCoffeeStain />
                <div className="border-b-4 border-stone-900 pb-2 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1">
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-stone-800 leading-none">{file.title}</h3>
                  <span className="font-mono text-[10px] sm:text-xs bg-stone-200 px-2 py-1 w-fit">{file.date}</span>
                </div>
                <p className="font-serif text-base sm:text-lg leading-relaxed text-stone-800">{file.content}</p>
              </div>
            )}
            {file.type === 'IMAGE' && (
              <div className="flex flex-col items-center">
                <div className="bg-stone-900 p-2 pb-8 shadow-sm transform rotate-1 w-full max-w-[200px] sm:max-w-[250px] relative">
                  <div className="bg-white aspect-square w-full flex items-center justify-center overflow-hidden border border-stone-200">
                    <DoodleCCTV type={file.sketchType} />
                  </div>
                  <p className="text-white font-handwritten text-center mt-2 text-xs sm:text-sm">{file.title}</p>
                </div>
                <p className="mt-4 text-center font-bold text-stone-600 italic bg-stone-100 px-4 py-2 transform -rotate-1 shadow-sm border border-stone-200 text-xs sm:text-base">"{file.caption}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
