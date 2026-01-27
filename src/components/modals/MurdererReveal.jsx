import React, { useMemo } from 'react';
import { CHARACTERS } from '../../data/gameData';
import { updateVoteResultsVisibility } from '../../firebase/config';

export const MurdererReveal = ({ voteCounts, isRevealOpen }) => {
  const topSuspect = useMemo(() => {
    if (!voteCounts) return null;
    const entries = Object.entries(voteCounts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    const id = entries[0][0];
    return CHARACTERS.find(c => c.id === id) || null;
  }, [voteCounts]);

  if (!isRevealOpen || !topSuspect) return null;

  const handleClose = async (e) => {
    e.stopPropagation();
    try {
      await updateVoteResultsVisibility(false);
    } catch (err) {
      console.error('Failed to hide vote results:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-red-900/90 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-red-600 text-white rounded-lg shadow-2xl border-8 border-red-800 w-full max-w-3xl p-8 text-center animate-pulse" onClick={(e)=>e.stopPropagation()}>
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-wider drop-shadow-lg">MURDERER</h1>
        <p className="mt-4 text-3xl sm:text-4xl font-extrabold">{topSuspect.name}</p>
        <p className="mt-2 text-sm sm:text-base opacity-90">{topSuspect.profession}</p>
        <div className="mt-6">
          <button className="px-6 py-3 bg-white text-red-700 font-bold rounded shadow-lg border-2 border-red-800" onClick={handleClose}>OK</button>
        </div>
      </div>
      <style>{`
        .animate-pulse { animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};
