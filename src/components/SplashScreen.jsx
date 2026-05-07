import React, { useEffect, useState } from 'react';

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
      className={`fixed inset-0 z-[100] bg-mystery-dark flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.9), rgba(0, 0, 0, 1)),
          url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
        `
      }}
    >
      <h1 className="font-typewriter text-3xl sm:text-5xl font-bold text-mystery-paper tracking-tight uppercase text-center px-6">
        Welcome to the Murder
      </h1>
    </div>
  );
};
