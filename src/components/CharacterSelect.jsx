import React, { useState } from 'react';
import { Ghost } from './icons/IconComponents';
import { validateLoginCode, CHARACTERS } from '../data/gameData';

export const CharacterSelect = ({ onSelectCharacter }) => {
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate the login code
    const characterId = validateLoginCode(loginCode);
    
    if (characterId) {
      // Find the character to show their name
      const character = CHARACTERS.find(c => c.id === characterId);
      
      // Vibration feedback on success
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
      
      // Small delay for better UX
      setTimeout(() => {
        onSelectCharacter(characterId);
      }, 300);
    } else {
      // Invalid code
      setError('Invalid login code. Please check and try again.');
      setIsLoading(false);
      
      // Vibration feedback on error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten relative overflow-hidden flex flex-col items-center justify-center p-4 bg-texture">
      {/* Blood Splatters */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-red-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-orange-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white border-4 border-stone-900 rounded-full flex items-center justify-center shadow-sketch-lg rotate-3 mb-4">
            <Ghost size={40} className="text-orange-600 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tighter drop-shadow-sm rotate-[-2deg]">
            THE ROHAN <span className="text-red-700">PARTY</span>
          </h1>
          <p className="mt-2 text-stone-600 text-base sm:text-lg font-bold">Murder Mystery Night</p>
        </div>

        <div className="bg-white p-4 sm:p-6 border-2 border-stone-900 shadow-sketch rounded-sm rotate-1">
          <div className="border border-stone-300 p-4 sm:p-6 border-dashed rounded-sm bg-[#fafafa]">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-orange-600 text-center uppercase tracking-widest decoration-wavy underline decoration-stone-400">
              Enter Your Code
            </h3>
            <p className="text-sm text-stone-600 text-center mb-6">
              Enter the login code from your character card
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="LOGIN CODE"
                  className="w-full px-4 py-3 border-2 border-stone-900 rounded-sm text-center text-lg font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-stone-900 placeholder-stone-400"
                  disabled={isLoading}
                  autoFocus
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-600 rounded-sm p-3 text-center animate-shake">
                  <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginCode.trim()}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-6 rounded-sm border-2 border-stone-900 shadow-sketch uppercase tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isLoading ? 'LOGGING IN...' : 'ENTER GAME'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-300">
              <p className="text-xs text-stone-500 text-center">
                Your login code was provided on your character card.<br />
                If you don't have it, please contact the game host.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
