import React from 'react';
import { Paperclip, Lock } from '../icons/IconComponents';
import { DoodleCoffeeStain, DoodleCCTV } from '../ui/Doodles';
import { CASE_FILES } from '../../data/gameData';

export const FilesView = ({ unlockedFiles = [] }) => {
  // Filter files that are unlocked
  const availableFiles = CASE_FILES.filter(file => unlockedFiles.includes(file.id));
  
  // Get locked file info for display
  const lockedFilesInfo = [
    { round: 0, label: 'Incident Report', count: CASE_FILES.filter(f => f.roundReq === 0).length },
    { round: 3, label: 'Evidence Files', count: CASE_FILES.filter(f => f.roundReq === 3).length },
    { round: 4, label: 'Revelation Files', count: CASE_FILES.filter(f => f.roundReq === 4).length },
  ].filter(info => {
    const filesForRound = CASE_FILES.filter(f => f.roundReq === info.round);
    return !filesForRound.every(f => unlockedFiles.includes(f.id));
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-typewriter font-bold text-mystery-paper text-center uppercase tracking-widest">Archives</h2>
      
      {/* Locked Files Indicator */}
      {lockedFilesInfo.length > 0 && (
        <div className="bg-mystery-charcoal border-2 border-dashed border-mystery-aged/30 p-4">
          <div className="flex items-center gap-2 text-mystery-aged mb-2">
            <Lock size={16} />
            <span className="font-typewriter font-bold text-sm uppercase">Awaiting Authorization</span>
          </div>
          <div className="space-y-1">
            {lockedFilesInfo.map(info => (
              <p key={info.round} className="text-xs text-mystery-aged/70 font-body">
                🔒 {info.label} ({info.count} {info.count === 1 ? 'file' : 'files'}) - Round {info.round}+
              </p>
            ))}
          </div>
        </div>
      )}

      {/* No Files Message */}
      {availableFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-mystery-aged font-typewriter font-bold">No files available yet</p>
          <p className="text-mystery-aged/70 text-sm mt-2 font-body">The host will unlock evidence as the investigation progresses</p>
        </div>
      )}

      {/* Available Files */}
      {availableFiles.map((file, idx) => {
        const rotate = idx % 2 === 0 ? 'rotate-[1deg]' : 'rotate-[-1deg]';
        return (
          <div key={file.id} className={`bg-mystery-paper border-2 border-mystery-ink shadow-2xl p-4 relative ${rotate}`}>
            <div className="absolute -top-4 right-8 text-mystery-ink/40 transform -rotate-45">
              <Paperclip size={32} className="sm:w-10 sm:h-10" />
            </div>
            {/* Round Badge */}
            <div className="absolute top-2 left-2 bg-mystery-blood text-white text-[10px] font-typewriter font-bold px-2 py-0.5">
              R{file.roundReq}
            </div>
            {file.type === 'REPORT' && (
              <div className="relative overflow-hidden pt-4">
                <DoodleCoffeeStain />
                <div className="border-b-2 border-mystery-ink pb-2 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1">
                  <h3 className="text-xl sm:text-2xl font-typewriter font-bold uppercase text-mystery-ink leading-none">{file.title}</h3>
                  <span className="font-typewriter text-[10px] sm:text-xs bg-mystery-aged/30 px-2 py-1 w-fit">{file.date}</span>
                </div>
                <p className="font-body text-base sm:text-lg leading-relaxed text-mystery-ink whitespace-pre-line">{file.content}</p>
              </div>
            )}
            {file.type === 'IMAGE' && (
              <div className="flex flex-col items-center pt-4">
                <div className="bg-stone-900 p-2 pb-8 shadow-sm transform rotate-1 w-full max-w-[200px] sm:max-w-[250px] relative">
                  <div className="bg-white aspect-square w-full flex items-center justify-center overflow-hidden border border-stone-200">
                    <DoodleCCTV type={file.sketchType} />
                  </div>
                  <p className="text-white font-handwriting text-center mt-2 text-xs sm:text-sm">{file.title}</p>
                </div>
                <p className="mt-4 text-center font-handwriting text-xl text-mystery-ink italic bg-mystery-aged/30 px-4 py-2 transform -rotate-1 shadow-sm border border-mystery-ink/20">"{file.caption}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
