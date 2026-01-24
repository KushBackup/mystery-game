import React, { useState } from 'react';

// Custom Icons
const FingerprintIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.05 14.121c.188 3.205 2.782 5.729 5.95 5.729 3.168 0 5.762-2.524 5.95-5.729h2.05c-.195 4.362-3.765 7.829-8 7.829s-7.805-3.467-8-7.829h2.05zm4.95-11.121c-3.866 0-7 3.134-7 7h2c0-2.757 2.243-5 5-5s5 2.243 5 5h2c0-3.866-3.134-7-7-7zm0 3c-2.209 0-4 1.791-4 4h2c0-1.103.897-2 2-2s2 .897 2 2h2c0-2.209-1.791-4-4-4z"/>
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 2c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2h-3.5A2.5 2.5 0 0 0 14 0h-4a2.5 2.5 0 0 0-2.5 2H6zm8 0h-4a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zM6 4h2.5a2.5 2.5 0 0 0 2.5 2.5h2A2.5 2.5 0 0 0 15.5 4H18v16H6V4zm3 5h6v2H9V9zm0 4h6v2H9v-2zm0 4h4v2H9v-2z"/>
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.103 0-2 .897-2 2v18l4-4h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 14H6v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
  </svg>
);

const FolderIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 5h-8.586L9.707 3.293A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2z"/>
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm0 4c-4.338 0-8 2.019-8 4.5V21h16v-2.5c0-2.481-3.662-4.5-8-4.5z"/>
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 17h2v-6H7v6zm4 0h2V7h-2v10zm4 0h2v-4h-2v4z"/>
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
    <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
  </svg>
);

const HelpIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
    <path d="M11 11h2v6h-2zm0-4h2v2h-2z"/>
  </svg>
);

export default function GridMenu({ onNavigate, voteCounts }) {
  const [hoveredTile, setHoveredTile] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ID', 
      icon: FingerprintIcon, 
      color: 'bg-gradient-to-br from-halloween-orange to-halloween-pink',
      size: 'medium'
    },
    { 
      id: 'intel', 
      label: 'CLUES', 
      icon: ClipboardIcon, 
      color: 'bg-gradient-to-br from-halloween-purple to-purple-600',
      size: 'medium'
    },
    { 
      id: 'chat', 
      label: 'CHAT', 
      icon: ChatIcon, 
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      size: 'medium'
    },
    { 
      id: 'votes', 
      label: 'VOTES', 
      icon: ChartIcon, 
      color: 'bg-gradient-to-br from-halloween-pink to-red-500',
      size: 'medium'
    },
    { 
      id: 'files', 
      label: 'FILES', 
      icon: FolderIcon, 
      color: 'bg-gradient-to-br from-halloween-green to-emerald-600',
      size: 'medium'
    },
    { 
      id: 'dossier', 
      label: 'GUESTS', 
      icon: UsersIcon, 
      color: 'bg-gradient-to-br from-halloween-yellow to-halloween-orange',
      size: 'medium'
    },
    { 
      id: 'help', 
      label: 'HELP', 
      icon: HelpIcon, 
      color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      size: 'medium'
    },
    { 
      id: 'logout', 
      label: 'LOGOUT', 
      icon: LogoutIcon, 
      color: 'bg-gradient-to-br from-gray-700 to-halloween-dark',
      size: 'medium'
    }
  ];

  const handleTileClick = (itemId) => {
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onNavigate(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-halloween-dark via-purple-900 to-halloween-dark overflow-hidden">
      {/* Spooky Header with floating ghosts effect */}
      <div className="bg-gradient-to-r from-halloween-orange to-halloween-pink text-white p-6 shadow-halloween relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-2 left-10 text-6xl animate-float">👻</div>
          <div className="absolute top-4 right-20 text-4xl animate-float" style={{animationDelay: '0.5s'}}>🎃</div>
          <div className="absolute bottom-2 right-10 text-5xl animate-float" style={{animationDelay: '1s'}}>🦇</div>
        </div>
        <p className="text-xl font-semibold tracking-wide relative z-10 text-center text-white/90" 
            style={{ fontFamily: 'Fredoka, cursive' }}>
          Astral Project presents
        </p>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight relative z-10 text-center mt-2 animate-wiggle" 
            style={{ fontFamily: 'Fredoka, cursive' }}>
          The Murder Mystery Experience!
        </h1>
      </div>

      {/* Casual Grid */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-6 auto-rows-[160px]">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLarge = item.size === 'large';
            
            return (
              <button
                key={item.id}
                onClick={() => handleTileClick(item.id)}
                onMouseEnter={() => setHoveredTile(item.id)}
                onMouseLeave={() => setHoveredTile(null)}
                onTouchStart={() => setHoveredTile(item.id)}
                onTouchEnd={() => setHoveredTile(null)}
                className={`
                  ${item.color}
                  ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1'}
                  relative overflow-hidden rounded-3xl
                  text-white font-bold
                  transition-all duration-300 ease-out
                  active:scale-90
                  shadow-halloween hover:shadow-halloween-lg
                  ${hoveredTile === item.id ? 'brightness-125 scale-105 -rotate-2' : 'brightness-100'}
                  casual-tile border-4 border-white/20
                `}
                style={{
                  animation: `slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
                }}
              >
                {/* Playful Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-2 text-3xl">✨</div>
                  <div className="absolute bottom-2 left-2 text-2xl">⭐</div>
                </div>

                {/* Content */}
                <div className={`
                  relative z-10 h-full flex flex-col 
                  ${isLarge ? 'justify-center items-center p-8' : 'justify-center items-center p-4'}
                `}>
                  <Icon className={`
                    ${isLarge ? 'w-28 h-28 mb-4' : 'w-14 h-14 mb-2'}
                    drop-shadow-2xl filter brightness-110
                    ${hoveredTile === item.id ? 'animate-bounce' : ''}
                  `} />
                  <span className={`
                    ${isLarge ? 'text-5xl' : 'text-2xl'}
                    tracking-wide font-black
                    drop-shadow-2xl
                    ${hoveredTile === item.id ? 'animate-pulse' : ''}
                  `}
                  style={{ fontFamily: 'Fredoka, cursive' }}>
                    {item.label}
                  </span>
                </div>

                {/* Glow Effect */}
                {hoveredTile === item.id && (
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.3), transparent)',
                      animation: 'glow 1s ease-in-out infinite'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
