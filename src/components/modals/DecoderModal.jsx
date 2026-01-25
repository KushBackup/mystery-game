import React from 'react';
import { X, ChevronRight } from '../icons/IconComponents';

export const DecoderModal = ({ 
  isOpen, 
  inputCode, 
  onInputChange, 
  onSubmit, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md animate-fade-in p-0 sm:p-4">
      <div className="bg-mystery-charcoal w-full max-w-md p-8 border-2 border-mystery-blood shadow-2xl relative sm:rounded-none mt-0">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-mystery-blood text-white p-3 hover:bg-red-700 transition-all shadow-lg border-2 border-white/20 hover:scale-110"
        >
            <X size={24} />
        </button>
        <div className="flex flex-col items-center mb-8 mt-2">
            <div className="text-6xl mb-4 animate-pulse">🔓</div>
            <h3 className="text-4xl font-typewriter font-bold text-mystery-paper uppercase tracking-widest">Enter Code</h3>
            <p className="text-mystery-aged font-body mt-3 text-center text-base">Found a clue? Unlock it here.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 pb-6 sm:pb-0">
            <input 
                type="text" 
                value={inputCode}
                onChange={onInputChange}
                placeholder="SECRET CODE..."
                className="w-full bg-mystery-paper border-2 border-mystery-ink text-mystery-ink text-center text-3xl font-typewriter font-bold py-4 focus:outline-none focus:ring-2 focus:ring-mystery-blood uppercase tracking-widest placeholder:text-mystery-aged/50 shadow-lg"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
            />
            <button 
                type="submit"
                className="w-full bg-mystery-blood hover:bg-red-700 text-white text-2xl font-typewriter font-bold py-4 border-2 border-white/20 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
            >
                🔓 UNLOCK <ChevronRight size={28} />
            </button>
        </form>
      </div>
    </div>
  );
};
