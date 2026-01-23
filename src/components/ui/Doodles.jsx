import React from 'react';

export const DoodleCoffeeStain = () => (
  <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none mix-blend-multiply text-amber-800" fill="currentColor">
    <path d="M50 10 C 70 10 90 30 90 50 C 90 70 70 90 50 90 C 30 90 10 70 10 50 C 10 30 30 10 50 10 M 50 15 C 35 15 20 30 18 50 C 16 70 35 85 50 85 C 70 85 85 70 85 50 C 85 30 70 15 50 15" />
  </svg>
);

export const DoodleCCTV = ({ type }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full stroke-stone-800 stroke-2 fill-none" strokeLinecap="round">
    <rect x="5" y="5" width="90" height="90" strokeDasharray="5,5" />
    <text x="10" y="20" className="text-[8px] fill-red-600 font-mono font-bold">REC ●</text>
    {type === 'CCTV_BAR' ? (
       <>
         <rect x="30" y="50" width="40" height="10" />
         <circle cx="50" cy="40" r="5" />
         <line x1="50" y1="45" x2="50" y2="50" />
         <path d="M40 50 L 40 40 L 45 45" />
       </>
    ) : (
       <>
         <rect x="20" y="30" width="30" height="50" />
         <text x="25" y="50" className="text-[6px] fill-stone-600">ICE</text>
         <circle cx="70" cy="60" r="5" />
         <line x1="70" y1="65" x2="70" y2="80" />
         <line x1="70" y1="70" x2="50" y2="60" />
       </>
    )}
  </svg>
);
