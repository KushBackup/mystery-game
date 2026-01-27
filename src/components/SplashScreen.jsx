import React, { useState, useEffect } from 'react';

export const SplashScreen = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const lines = [
    { text: 'Astral Project presents', delay: 1000 },
    { text: 'The Murder Mystery Experience', delay: 1500 },
    { text: "India's first ever semi virtual murder mystery game", delay: 2000 },
    { text: 'Powered by For the Record Vinyl Bar', delay: 2500 },
    { text: 'Made by Kush, Swikriti', subtext: '(special thanks to Buland, Nigel, Namya and Taher)', delay: 3000 }
  ];

  useEffect(() => {
    // Start showing lines one by one
    if (currentLine < lines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, lines[currentLine].delay);
      return () => clearTimeout(timer);
    } else {
      // All lines shown, wait a bit then fade out
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        // After fade out animation, call onComplete
        setTimeout(onComplete, 1000);
      }, 2000);
      return () => clearTimeout(fadeTimer);
    }
  }, [currentLine]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-mystery-dark flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'} font-body`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.9), rgba(0, 0, 0, 1)),
          url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
        `
      }}
    >
      <div className="max-w-2xl px-6 space-y-8">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`text-center transition-opacity duration-1000 ${
              index < currentLine ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {index === 0 && (
              <p className="font-typewriter text-mystery-aged tracking-[0.3em] text-sm sm:text-base uppercase">
                {line.text}
              </p>
            )}
            {index === 1 && (
              <h1 className="font-typewriter text-3xl sm:text-5xl font-bold text-mystery-paper tracking-tight uppercase">
                {line.text}
              </h1>
            )}
            {index === 2 && (
              <p className="font-handwriting text-xl sm:text-2xl text-mystery-aged italic">
                {line.text}
              </p>
            )}
            {index === 3 && (
              <p className="font-typewriter text-base sm:text-lg text-mystery-blood tracking-wide uppercase">
                {line.text}
              </p>
            )}
            {index === 4 && (
              <div className="space-y-2">
                <p className="font-body text-sm sm:text-base text-mystery-aged">
                  {line.text}
                </p>
                <p className="font-body text-xs sm:text-sm text-mystery-aged/70 italic">
                  {line.subtext}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
