import React from 'react';
import { X } from '../icons/IconComponents';

export const GuestProfileModal = ({ 
  guest, 
  currentUser, 
  isVotingOpen, 
  onClose, 
  onVote 
}) => {
  if (!guest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="bg-[#f4f1ea] w-full max-w-md p-6 border-t-4 sm:border-4 border-stone-900 shadow-[0px_-4px_10px_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0px_#ef4444] relative rotate-0 sm:rotate-1 overflow-y-auto max-h-[85vh] sm:rounded-none rounded-t-2xl">
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden"></div>
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-900 text-white p-2 border-2 border-white hover:bg-red-600 transition-colors shadow-lg z-10 sm:-top-4 sm:-right-4"
        >
            <X size={20} className="sm:w-6 sm:h-6" />
        </button>
        
        <div className="flex flex-col items-center mb-6 mt-4 sm:mt-0">
             <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-stone-900 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-sm mb-4
                ${guest.id === currentUser ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-500'}
              `}>
                {guest.name.charAt(0)}
              </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase text-center leading-none mb-2">{guest.name}</h3>
            <span className="bg-stone-900 text-white px-3 py-1 text-xs sm:text-sm font-bold shadow-sm transform -rotate-1">
                {guest.profession}
            </span>
        </div>

        <div className="space-y-4 pb-8 sm:pb-0">
             <div className="text-center">
                {guest.role === 'VICTIM' ? (
                     <span className="inline-block border-2 border-purple-900 text-purple-900 bg-purple-100 px-3 py-1 font-black uppercase text-xs sm:text-sm rotate-2">KNOWN VICTIM</span>
                ) : (
                    <span className="inline-block border-2 border-stone-400 text-stone-400 bg-stone-100 px-3 py-1 font-black uppercase text-xs sm:text-sm -rotate-1">SUSPECT</span>
                )}
             </div>

            <div className="bg-white p-4 border-2 border-stone-200 rounded-sm relative mt-6">
                <div className="absolute -top-3 -left-2 bg-stone-800 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[2deg] border border-stone-900 shadow-sm">BIO</div>
                <p className="text-stone-700 leading-relaxed font-bold text-sm sm:text-base">{guest.bio}</p>
            </div>

            <div className="bg-orange-50 p-4 border-2 border-orange-200 rounded-sm relative">
                <div className="absolute -top-3 -right-2 bg-orange-500 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[-3deg] border border-stone-900 shadow-sm">KNOWN TRAIT</div>
                <p className="text-stone-800 italic font-serif text-sm sm:text-base">"{guest.quirk}"</p>
            </div>

            {isVotingOpen && guest.role !== 'VICTIM' && (
                 <button 
                    onClick={() => { onVote(guest.id); onClose(); }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 border-b-4 border-red-900 active:border-b-0 active:translate-y-1 mt-4"
                 >
                     VOTE AS SUSPECT
                 </button>
            )}

            {guest.id === currentUser && (
                 <div className="mt-6 border-t-2 border-dashed border-stone-300 pt-4 text-center">
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">THIS IS YOU</p>
                    <p className="text-[10px] sm:text-xs text-stone-400">Check your ID Card tab for secret info.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};
