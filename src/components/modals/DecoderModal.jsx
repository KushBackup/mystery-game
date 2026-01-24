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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-0 sm:p-4">
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 w-full max-w-md p-8 border-4 border-halloween-orange shadow-halloween-lg relative rounded-t-3xl sm:rounded-3xl">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-halloween-orange text-white p-3 rounded-full hover:bg-halloween-pink transition-all shadow-lg border-2 border-white hover:scale-110"
        >
            <X size={24} />
        </button>
        <div className="flex flex-col items-center mb-8 mt-2">
            <div className="text-6xl mb-4 animate-bounce">🔓</div>
            <h3 className="text-4xl font-black text-halloween-yellow uppercase tracking-wide" style={{ fontFamily: 'Fredoka, cursive' }}>Enter Code</h3>
            <p className="text-white/80 font-bold mt-3 text-center text-base">Found a spooky clue? Unlock it! 🎃</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 pb-6 sm:pb-0">
            <input 
                type="text" 
                value={inputCode}
                onChange={onInputChange}
                placeholder="SECRET CODE..."
                className="w-full bg-white border-4 border-halloween-orange text-black text-center text-3xl font-black py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-halloween-yellow uppercase tracking-widest placeholder:text-gray-400 shadow-halloween"
                style={{ fontFamily: 'Fredoka, cursive', fontSize: '28px' }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
            />
            <button 
                type="submit"
                className="w-full bg-gradient-to-r from-halloween-orange to-halloween-pink hover:from-halloween-pink hover:to-halloween-orange text-white text-2xl font-black py-4 rounded-2xl border-4 border-white shadow-halloween-lg active:scale-95 transition-all flex items-center justify-center gap-3 uppercase btn-halloween"
                style={{ fontFamily: 'Fredoka, cursive' }}
            >
                🔓 UNLOCK <ChevronRight size={28} />
            </button>
        </form>
      </div>
    </div>
  );
};
