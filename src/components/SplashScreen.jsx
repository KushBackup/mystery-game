import React, { useEffect, useRef, useState } from 'react';

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

  // Held in a ref for the same reason `useTypewriter` holds its `onChar`: so a
  // caller that rebuilds its callback every render cannot restart the loop.
  //
  // These two timers used to depend on `onComplete` directly, and App passes it
  // as an inline arrow — a fresh function identity on every render. So *any*
  // re-render of App while the splash was up cleared both timers and armed them
  // again from zero, and the whole screen is only 1.4s long. Nothing re-rendered
  // App at that rate until the hub's unread badge started watching the comms
  // channel; a burst of messages landing during boot then held the player here
  // indefinitely, with no error and nothing on screen but the masthead. Fixing
  // it here rather than with a `useCallback` at the call site: a screen that
  // owns a timer must not be re-armable by a parent it knows nothing about.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1000);
    const doneTimer = setTimeout(() => onCompleteRef.current?.(), 1400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

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
