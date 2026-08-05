import React, { useEffect, useState } from 'react';

/**
 * The one time red owns the screen (DESIGN_LANGUAGE.md §2.2, §7).
 *
 * A full-bleed `signal` fill is forbidden everywhere else in the app, which is
 * precisely what makes it land here. Type is bone and ink on that fill — pure
 * white only on the small tag, per §2.2.
 */
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
    // No vignette and no grain here. The whole screen going signal is the
    // point; softening the edges would undo it.
    <div className="fixed inset-0 z-[200] bg-signal flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <div className="max-w-xl w-full">
        {/* Every stage names the exact properties it transitions. Blanket
            property transitions were the riskiest thing on this screen: the name
            is set at 86px, so any layout property sliding into the set would
            animate a reflow of the largest type in the product, on the one
            screen that has to land perfectly. */}
        <p
          className={`font-mono text-[12px] font-medium uppercase tracking-[0.32em] text-bone transition-[opacity,translate] duration-700 ease-out ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          The murderer is
        </p>

        {/* The rule draws itself out from the centre as the name arrives. */}
        <div
          className={`mx-auto mt-8 mb-8 h-px w-24 origin-center transition-[opacity,scale] duration-700 ease-out ${
            stage >= 1 ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
          style={{ background: 'rgba(237,231,218,.5)' }}
        />

        <div
          className={`transition-[opacity,translate] duration-700 ease-out ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h1 className="font-display font-extrabold uppercase text-bone text-[56px] sm:text-[86px] leading-[0.9] tracking-[-0.02em]">
            {murderer.name}
          </h1>
          {murderer.profession && (
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.24em] text-bone/75 mt-4">
              {murderer.profession}
            </p>
          )}
        </div>

        <p
          className={`font-note text-[22px] sm:text-[26px] text-bone mt-12 transition-[opacity,translate] duration-1000 ease-out ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          The case is closed.
        </p>
      </div>
    </div>
  );
};
