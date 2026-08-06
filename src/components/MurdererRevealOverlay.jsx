import React, { useEffect, useState } from 'react';

/**
 * The one time red owns the screen (DESIGN_LANGUAGE.md §2.2, §7).
 *
 * A full-bleed `signal` fill is forbidden everywhere else in the app, which is
 * precisely what makes it land here. Type is bone and ink on that fill — pure
 * white only on the small tag, per §2.2.
 */
export const MurdererRevealOverlay = ({ murderer, killers = murderer ? [murderer] : [] }) => {
  const [stage, setStage] = useState(0);
  const revealedKillers = killers.filter(Boolean);
  const leadKiller = revealedKillers[0] ?? null;
  const accomplices = revealedKillers.slice(1);
  const multipleKillers = revealedKillers.length > 1;

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

  if (!leadKiller) return null;

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
          {multipleKillers ? 'The killers are' : 'The killer is'}
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
          {multipleKillers ? (
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-bone/75">
                  Mastermind
                </p>
                <h1 className="font-display font-extrabold uppercase text-bone text-[40px] sm:text-[60px] leading-[0.9] tracking-[-0.02em] mt-3">
                  {leadKiller.name}
                </h1>
                {leadKiller.profession && (
                  <p className="font-mono text-[12px] font-medium uppercase tracking-[0.24em] text-bone/75 mt-3">
                    {leadKiller.profession}
                  </p>
                )}
              </div>

              {accomplices.length > 0 && (
                <div className="pt-5 border-t border-bone/30">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-bone/75">
                    Worked with
                  </p>
                  <ul className="mt-4 space-y-3">
                    {accomplices.map((killer) => (
                      <li key={killer.id}>
                        <p className="font-display font-extrabold uppercase text-bone text-[26px] sm:text-[36px] leading-[0.95] tracking-[-0.02em]">
                          {killer.name}
                        </p>
                        {killer.profession && (
                          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-bone/70 mt-1">
                            {killer.profession}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 className="font-display font-extrabold uppercase text-bone text-[56px] sm:text-[86px] leading-[0.9] tracking-[-0.02em]">
                {leadKiller.name}
              </h1>
              {leadKiller.profession && (
                <p className="font-mono text-[12px] font-medium uppercase tracking-[0.24em] text-bone/75 mt-4">
                  {leadKiller.profession}
                </p>
              )}
            </>
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
