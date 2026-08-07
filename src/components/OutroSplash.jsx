import React, { useState, useEffect } from 'react';
import { RevealDeck } from './RevealDeck';

/**
 * The curtain. This is the last thing 51 people look at, so it is the one screen
 * in the app allowed to take its time — the entrance is staged rather than
 * arriving all at once (§7, stagger), and the whole sequence runs long on
 * purpose while the room is being talked to.
 *
 * It also carries the reconstruction, because this is the *killers'* terminal
 * screen: App.jsx routes everyone else to the reveal overlay and sends the five
 * of them straight here, so without this control they would be the only players
 * in the room who could not open [RevealDeck](RevealDeck.jsx). It sits below
 * the thank-you and above the credits — offered, never in the way of the curtain.
 */
export const OutroSplash = ({ playerName }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [showDeck, setShowDeck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (showDeck) {
    return <RevealDeck onClose={() => setShowDeck(false)} closeLabel="Close" />;
  }

  // Each line rises as the one before it settles. Written as a helper rather
  // than three near-identical class strings so the timings stay legible.
  const staged = (delay) =>
    `transition-[opacity,translate] duration-1000 ease-out ${
      fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    } ${delay}`;

  return (
    // `my-auto` on the child rather than `justify-center` on the parent: with the
    // reconstruction control added, the column can exceed a short phone, and a
    // centred flex child that overflows is clipped at the top — where the
    // thank-you is. This centres while there is room and scrolls when there isn't.
    <div className="fixed inset-0 z-[100] bg-ink flex flex-col items-center px-6 py-10 er-grain overflow-y-auto">
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-vignette" aria-hidden="true" />

      <div className="relative z-10 max-w-xl w-full text-center my-auto">
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

        <div className={`mt-10 ${staged('delay-700')}`}>
          <button
            type="button"
            onClick={() => setShowDeck(true)}
            className="er-touch er-mono er-mono--hot w-full h-12 flex items-center justify-center gap-2 bg-ink-raised border border-signal hover:bg-signal hover:text-white"
          >
            How it happened
          </button>
        </div>

        <div className="er-rule mt-12" />
        <p className={`er-mono er-mono--dim mt-4 ${staged('delay-1000')}`}>
          Made by Kush and Swikriti
        </p>
      </div>
    </div>
  );
};
