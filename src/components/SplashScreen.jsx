import React, { useEffect, useState } from 'react';

/**
 * The cold open. Deliberately the only place in the app that holds the player
 * still, and it is over in 1.4s.
 *
 * The exit pairs the fade with a small lift and a scale rather than dropping
 * opacity alone (§7): a plain opacity fade on a near-black screen reads as the
 * device dimming rather than as a scene ending, because there is barely any
 * luminance left to lose.
 */
export const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1000);
    const doneTimer = setTimeout(onComplete, 1400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-ink flex items-center justify-center px-6 er-grain transition-opacity duration-500 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-vignette" aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-md text-center er-enter transition-[translate,scale] duration-500 ease-out ${
          fadeOut ? '-translate-y-2 scale-[0.98]' : 'translate-y-0 scale-100'
        }`}
      >
        <p className="er-mono er-mono--hot er-mono--wide">Astral Project</p>
        <div className="er-rule my-5" />
        <h1 className="er-title text-[38px] sm:text-[52px]">Welcome to the Murder</h1>
      </div>
    </div>
  );
};
