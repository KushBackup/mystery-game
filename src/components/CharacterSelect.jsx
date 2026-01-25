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

    // Check for host login code
    if (loginCode === 'KUSH6969') {
      if (navigator.vibrate) {
        navigator.vibrate([200]);
      }
      setTimeout(() => {
        onSelectCharacter('host', true);
      }, 500);
      return;
    }

    const characterId = validateLoginCode(loginCode);
    
    if (characterId) {
      if (navigator.vibrate) {
        navigator.vibrate([50, 50]);
      }
      setTimeout(() => {
        onSelectCharacter(characterId, false);
      }, 500);
    } else {
      setError('ACCESS DENIED: INVALID CREDENTIALS');
      setIsLoading(false);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-mystery-dark text-mystery-paper flex flex-col items-center justify-center p-4 relative" style={{
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)),
        url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
      `
    }}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-mystery-blood/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-mystery-ink/50 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header - Classified Folder Look */}
        <div className="text-center mb-8">
          <div className="inline-block border-4 border-mystery-paper p-4 rotate-1 bg-black/50 backdrop-blur-sm shadow-xl">
             <h1 className="text-3xl sm:text-4xl font-typewriter font-bold text-mystery-paper tracking-[0.2em] uppercase">
              CONFIDENTIAL
            </h1>
          </div>
          <p className="mt-6 text-xl tracking-widest font-typewriter text-mystery-aged uppercase border-b border-mystery-blood/50 inline-block pb-1">
            Case: Rohan Sharma
          </p>
        </div>

        {/* Login Form - Paper pinned to board */}
        <div className="bg-mystery-paper text-mystery-ink p-1 shadow-2xl transform -rotate-1 relative">
          {/* Pin */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black shadow-lg z-20 border border-gray-600"></div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-black/20 blur-sm rounded-full -z-10"></div>

          <div className="border border-mystery-ink/20 p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold mb-2 font-typewriter uppercase tracking-tighter">
                Identity Verification
              </h3>
              <p className="font-handwriting text-xl text-gray-600 -rotate-1">
                Enter your access code below...
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="w-full bg-mystery-aged/30 border-b-2 border-mystery-ink/50 p-4 text-center text-3xl font-typewriter font-bold uppercase tracking-widest focus:outline-none focus:border-mystery-blood focus:bg-mystery-aged/50 transition-all placeholder-mystery-ink/20"
                  placeholder="CODE"
                  disabled={isLoading}
                  autoFocus
                  maxLength={20}
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-mystery-blood transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {error && (
                <div className="text-center animate-shake">
                  <p className="text-mystery-blood font-bold font-typewriter text-sm tracking-widest border border-mystery-blood p-2 inline-block transform rotate-1">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginCode.trim()}
                className="w-full group relative overflow-hidden bg-mystery-ink text-mystery-paper font-typewriter font-bold py-4 px-6 shadow-lg uppercase tracking-[0.2em] transition-all hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isLoading ? 'Verifying...' : 'Access Case File'}
                </span>
                <div className="absolute inset-0 bg-mystery-blood transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0 opacity-80"></div>
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-dashed border-mystery-ink/30 text-center">
               <p className="font-handwriting text-lg text-gray-500">
                Unauthorized access is strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center opacity-40">
           <p className="font-typewriter text-xs text-mystery-aged">
             SECURE CONNECTION ESTABLISHED
           </p>
        </div>
      </div>
    </div>
  );
};
