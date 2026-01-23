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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="bg-[#f4f1ea] w-full max-w-md p-6 border-t-4 sm:border-4 border-stone-900 shadow-[0px_-4px_10px_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0px_#ef4444] relative rotate-0 sm:rotate-1 rounded-t-2xl sm:rounded-none">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-900 text-white p-2 border-2 border-white hover:bg-red-600 transition-colors shadow-lg sm:-top-4 sm:-right-4"
        >
            <X size={20} className="sm:w-6 sm:h-6" />
        </button>
        <div className="flex flex-col items-center mb-6 mt-2 sm:mt-0">
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase underline decoration-4 decoration-red-600">Enter Code</h3>
            <p className="text-stone-600 font-bold mt-2 text-center text-sm sm:text-base">Found a clue? Type it below.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 pb-6 sm:pb-0">
            <input 
                type="text" 
                value={inputCode}
                onChange={onInputChange}
                placeholder="SECRET CODE..."
                className="w-full bg-white border-4 border-stone-900 text-red-700 text-center text-2xl sm:text-3xl font-black py-3 sm:py-4 focus:outline-none focus:border-orange-500 uppercase tracking-widest placeholder:text-stone-300 shadow-inner"
                autoFocus
            />
            <button 
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white text-lg sm:text-xl font-black py-3 sm:py-4 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase"
            >
                UNLOCK <ChevronRight size={24} />
            </button>
        </form>
      </div>
    </div>
  );
};
