import React, { useEffect, useState } from 'react';

export const MurdererRevealOverlay = ({ murderer }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 1400);
    const t3 = setTimeout(() => setStage(3), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!murderer) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-red-700 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Pulsing red wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-600 to-red-900 animate-pulse opacity-90" />

      <div className="relative z-10 max-w-xl w-full space-y-8">
        <p
          className={`font-typewriter text-xl sm:text-2xl tracking-[0.4em] uppercase text-red-100 transition-opacity duration-700 ${
            stage >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          The Murderer Is
        </p>

        <div
          className={`mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-black/40 border-4 border-white flex items-center justify-center shadow-2xl transition-all duration-700 ${
            stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <span className="font-black text-7xl sm:text-8xl text-white">
            {murderer.name?.charAt(0) || '?'}
          </span>
        </div>

        <div
          className={`space-y-2 transition-opacity duration-700 ${
            stage >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="font-black text-5xl sm:text-7xl text-white uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {murderer.name}
          </h1>
          {murderer.profession && (
            <p className="font-typewriter text-base sm:text-lg text-red-100 uppercase tracking-widest">
              {murderer.profession}
            </p>
          )}
        </div>

        <p
          className={`font-handwriting text-2xl sm:text-3xl text-red-50 italic pt-4 transition-opacity duration-1000 ${
            stage >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          The case is closed.
        </p>
      </div>
    </div>
  );
};
