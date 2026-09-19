import React from 'react';

// In-fiction marks on paper. Both stay inside the §2.1 palette: the stain is
// body-bone (the same ink paragraphs are set in), the REC dot is signal-deep
// because it sits on a bone surface.

export const DoodleCoffeeStain = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    className={`absolute top-2 right-2 w-20 h-20 opacity-10 pointer-events-none mix-blend-multiply text-body-bone ${className}`}
    fill="currentColor"
  >
    <path d="M50 10 C 70 10 90 30 90 50 C 90 70 70 90 50 90 C 30 90 10 70 10 50 C 10 30 30 10 50 10 M 50 15 C 35 15 20 30 18 50 C 16 70 35 85 50 85 C 70 85 85 70 85 50 C 85 30 70 15 50 15" />
  </svg>
);

export const DoodleCCTV = ({ type }) => (
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    className="w-full h-full stroke-ink fill-none"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="5" y="5" width="90" height="90" strokeDasharray="5,5" />
    <text x="10" y="20" className="text-[8px] fill-signal-deep font-mono font-bold" stroke="none">
      REC ●
    </text>
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
        <text x="25" y="50" className="text-[6px] fill-body-bone" stroke="none">ICE</text>
        <circle cx="70" cy="60" r="5" />
        <line x1="70" y1="65" x2="70" y2="80" />
        <line x1="70" y1="70" x2="50" y2="60" />
      </>
    )}
  </svg>
);

// Tutorial cues are small, diagrammatic sketches of the screen a player is about
// to open. They are not generic decoration: each picture gives a first-glance
// map of the mechanic the accompanying task is asking the player to learn.
export const DoodleTutorial = ({ type, className = '' }) => (
  <svg
    viewBox="0 0 132 112"
    aria-hidden="true"
    className={`w-full h-full ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {type === 'identity' && (
      <>
        <path d="M25 13h70l11 11v75H25z" />
        <path d="M95 13v12h11" />
        <circle cx="48" cy="42" r="11" />
        <path d="M33 66c4-11 26-11 30 0" />
        <path d="M73 38h20M73 47h15M37 81h54M37 90h42" stroke="var(--color-signal-lift)" />
        <path d="M28 18 19 10M101 94l11 8" strokeDasharray="3 5" opacity=".7" />
      </>
    )}

    {type === 'guests' && (
      <>
        <path d="M16 24h43v59H16zM43 17h43v59H43zM72 29h43v59H72z" />
        <circle cx="37" cy="37" r="7" />
        <circle cx="64" cy="30" r="7" />
        <circle cx="93" cy="42" r="7" />
        <path d="M25 53h24M25 61h18M52 46h24M52 54h18M81 58h25M81 66h17" />
        <path d="M52 68h24" stroke="var(--color-signal-lift)" />
        <path d="M91 16l4 7 8 1-6 6 2 8-8-4-7 4 2-8-6-6 8-1z" stroke="var(--color-signal-lift)" />
      </>
    )}

    {type === 'comms' && (
      <>
        <path d="M17 13h98v72H17z" />
        <path d="M29 28h45v13H29zM57 48h45v13H57zM29 68h55v7" />
        <path d="M23 93h74" />
        <path d="M104 87l12 6-12 6z" stroke="var(--color-signal-lift)" />
        <path d="M35 34h19M63 54h26M35 72h30" />
        <path d="M23 18 13 12M108 81l12 6" strokeDasharray="3 5" opacity=".7" />
      </>
    )}

    {type === 'votes' && (
      <>
        <path d="M21 14h90v84H21z" />
        <path d="M35 31h12v12H35zM35 53h12v12H35zM35 75h12v12H35z" />
        <path d="M57 37h37M57 59h31M57 81h35" />
        <path d="m37 58 4 4 9-10" stroke="var(--color-signal-lift)" strokeWidth="3" />
        <path d="M105 19l8-7M105 95l9 7" strokeDasharray="3 5" opacity=".7" />
      </>
    )}

    {type === 'evidence' && (
      <>
        <path d="M16 18h43v34H16zM73 13h42v31H73zM42 62h48v35H42z" />
        <path d="M23 29h28M23 37h22M80 24h27M80 31h18M50 75h31M50 84h22" />
        <circle cx="21" cy="17" r="4" fill="var(--color-signal)" stroke="none" />
        <circle cx="77" cy="12" r="4" fill="var(--color-signal)" stroke="none" />
        <circle cx="46" cy="61" r="4" fill="var(--color-signal)" stroke="none" />
        <path d="M57 52 76 44M60 52 53 62" stroke="var(--color-signal-lift)" strokeDasharray="4 4" />
        <path d="M95 75h20v13H95zM100 82h10" stroke="var(--color-signal-lift)" />
      </>
    )}
  </svg>
);
