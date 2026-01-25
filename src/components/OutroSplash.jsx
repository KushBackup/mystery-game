import React, { useState, useEffect } from 'react';

export const OutroSplash = ({ playerName }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade in after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-[2000ms] ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="max-w-2xl px-6 text-center space-y-8">
        <h1 className="font-typewriter text-4xl sm:text-5xl font-bold text-mystery-paper tracking-tight uppercase leading-relaxed">
          Thank you for playing and making this entire experience possible for us!
        </h1>
        
        <p className="font-handwriting text-3xl sm:text-4xl text-mystery-aged italic">
          We love you {playerName}
        </p>
        
        <div className="mt-12 pt-8 border-t border-mystery-aged/30">
          <p className="font-body text-lg sm:text-xl text-mystery-aged">
            made by Kush and Swikriti
          </p>
        </div>
      </div>
    </div>
  );
};
