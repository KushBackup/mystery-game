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
      // Vibration feedback on success
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
      
      // Small delay for better UX
      setTimeout(() => {
        onSelectCharacter('host', true); // Pass isHost flag
      }, 300);
      return;
    }

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
        onSelectCharacter(characterId, false);
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
    <div className="min-h-screen bg-gradient-to-br from-halloween-dark via-purple-900 to-black text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Floating Halloween Elements */}
      <div className="absolute top-10 left-10 text-6xl animate-float">🎃</div>
      <div className="absolute top-20 right-20 text-5xl animate-float" style={{animationDelay: '0.5s'}}>👻</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-float" style={{animationDelay: '1s'}}>🦇</div>
      <div className="absolute bottom-10 right-10 text-5xl animate-float" style={{animationDelay: '1.5s'}}>🕷️</div>
      <div className="absolute top-1/2 left-5 text-3xl animate-float" style={{animationDelay: '2s'}}>⭐</div>
      <div className="absolute top-1/3 right-10 text-3xl animate-float" style={{animationDelay: '2.5s'}}>✨</div>

      {/* Glowing orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-halloween-orange/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-halloween-purple/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-pop-in">
          <div className="mx-auto h-28 w-28 bg-gradient-to-br from-halloween-orange to-halloween-pink border-4 border-white rounded-full flex items-center justify-center shadow-glow-orange mb-6 animate-bounce-slow">
            <Ghost size={60} className="text-white filter drop-shadow-lg" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-2xl animate-wiggle" 
              style={{ fontFamily: 'Fredoka, cursive' }}>
            SPOOKY <span className="text-halloween-orange">MYSTERY</span>
          </h1>
          <p className="mt-3 text-halloween-yellow text-xl font-bold drop-shadow-lg">🎃 Halloween Murder Party 🎃</p>
        </div>

        <div className="bg-gradient-to-br from-halloween-purple to-purple-900 p-6 border-4 border-halloween-orange shadow-halloween-lg rounded-3xl animate-fade-in">
          <div className="border-2 border-dashed border-halloween-yellow/50 p-6 rounded-2xl bg-black/30 backdrop-blur-sm">
            <h3 className="text-3xl font-black mb-3 text-halloween-yellow text-center uppercase tracking-wide"
                style={{ fontFamily: 'Fredoka, cursive' }}>
              🔮 Enter Your Code 🔮
            </h3>
            <p className="text-base text-white/80 text-center mb-6 font-semibold">
              Find your secret code on your character card!
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="YOUR SECRET CODE"
                  className="w-full px-5 py-4 border-4 border-halloween-orange rounded-2xl text-center text-xl font-black uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-halloween-yellow focus:border-halloween-yellow bg-white text-black placeholder-gray-400 shadow-halloween transition-all"
                  style={{ fontFamily: 'Fredoka, cursive', fontSize: '20px' }}
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="bg-red-500 border-4 border-red-700 rounded-2xl p-4 text-center animate-shake shadow-glow-orange">
                  <p className="text-white font-black text-base">❌ {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginCode.trim()}
                className="w-full bg-gradient-to-r from-halloween-orange to-halloween-pink hover:from-halloween-pink hover:to-halloween-orange text-white font-black py-4 px-6 rounded-2xl border-4 border-white shadow-halloween-lg uppercase tracking-widest text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:scale-105 btn-halloween"
                style={{ fontFamily: 'Fredoka, cursive' }}
              >
                {isLoading ? '🎃 LOADING... 🎃' : '👻 START GAME 👻'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t-2 border-halloween-yellow/30">
              <p className="text-sm text-white/70 text-center font-semibold">
                🎭 Your login code is on your character card 🎭<br />
                Need help? Ask the game master! 🎃
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
