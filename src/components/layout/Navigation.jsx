import React from 'react';
import { User, Search, FileText, Users } from '../icons/IconComponents';

export const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 w-full bg-stone-900 border-t-4 border-red-700 pb-safe z-30 shadow-2xl">
      <div className="flex justify-around items-center h-16 sm:h-20 max-w-2xl mx-auto">
        <button 
          onClick={() => onTabChange('DASHBOARD')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'DASHBOARD' ? 'text-orange-500' : 'text-stone-500'}`}
        >
          <User size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
          <span className="text-[10px] sm:text-xs font-black uppercase">ID Card</span>
        </button>
        
        <button 
          onClick={() => onTabChange('INTEL')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'INTEL' ? 'text-orange-500' : 'text-stone-500'}`}
        >
          <div className="relative">
            <Search size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase">Clues</span>
        </button>

        <button 
          onClick={() => onTabChange('FILES')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'FILES' ? 'text-orange-500' : 'text-stone-500'}`}
        >
          <FileText size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
          <span className="text-[10px] sm:text-xs font-black uppercase">Files</span>
        </button>

        <button 
          onClick={() => onTabChange('DOSSIER')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'DOSSIER' ? 'text-orange-500' : 'text-stone-500'}`}
        >
          <Users size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
          <span className="text-[10px] sm:text-xs font-black uppercase">Guests</span>
        </button>
      </div>
    </nav>
  );
};
