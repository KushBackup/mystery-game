import React, { useState, useEffect } from 'react';

/**
 * The curtain. This is the last thing 51 people look at, so it is the one screen
 * in the app allowed to take its time — the entrance is staged rather than
 * arriving all at once (§7, stagger), and the whole sequence runs long on
 * purpose while the room is being talked to.
 */
export const OutroSplash = ({ playerName }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Each line rises as the one before it settles. Written as a helper rather
  // than three near-identical class strings so the timings stay legible.
  const staged = (delay) =>
    `transition-[opacity,translate] duration-1000 ease-out ${
      fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    } ${delay}`;

  return (
    <div className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center px-6 er-grain">
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-vignette" aria-hidden="true" />

      <div className="relative z-10 max-w-xl w-full text-center">
        <p className={`er-mono er-mono--hot er-mono--wide ${staged('delay-0')}`}>Case Closed</p>
        <div className="er-rule my-6" />

        <h1 className={`er-title text-[30px] sm:text-[40px] leading-[1.05] ${staged('delay-200')}`}>
          Thank you for playing and making this entire experience possible for us
        </h1>

        <p
          className={`font-note text-[24px] sm:text-[28px] text-signal-lift mt-8 -rotate-1 ${staged(
            'delay-500'
          )}`}
        >
          We love you {playerName}
        </p>

        <div className="er-rule mt-12" />
        <p className={`er-mono er-mono--dim mt-4 ${staged('delay-700')}`}>
          Made by Kush and Swikriti
        </p>
      </div>
    </div>
  );
};
