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

export default function GridMenu({ onNavigate, voteCounts }) {
  const [hoveredTile, setHoveredTile] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ID', 
      icon: FingerprintIcon, 
      color: 'bg-red-600',
      size: 'large' // Takes 2x2 space
    },
    { 
      id: 'intel', 
      label: 'CLUES', 
      icon: ClipboardIcon, 
      color: 'bg-amber-600',
      size: 'medium'
    },
    { 
      id: 'chat', 
      label: 'CHAT', 
      icon: ChatIcon, 
      color: 'bg-blue-600',
      size: 'medium'
    },
    { 
      id: 'votes', 
      label: 'VOTES', 
      icon: ChartIcon, 
      color: 'bg-pink-600',
      size: 'medium'
    },
    { 
      id: 'files', 
      label: 'FILES', 
      icon: FolderIcon, 
      color: 'bg-emerald-600',
      size: 'medium'
    },
    { 
      id: 'dossier', 
      label: 'GUESTS', 
      icon: UsersIcon, 
      color: 'bg-purple-600',
      size: 'medium'
    },
    { 
      id: 'logout', 
      label: 'LOGOUT', 
      icon: LogoutIcon, 
      color: 'bg-stone-600',
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
    <div className="min-h-screen bg-stone-100 overflow-hidden font-handwritten">
      {/* Header */}
      <div className="bg-stone-900 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Astral Project's Murder Mystery Experience</h1>
        <p className="text-stone-300 text-sm mt-1">Ultimate mystery solver gadget</p>
      </div>

      {/* Metro Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 auto-rows-[140px]">
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
                  relative overflow-hidden
                  text-white font-bold
                  transition-all duration-200 ease-out
                  active:scale-95
                  shadow-lg hover:shadow-xl
                  ${hoveredTile === item.id ? 'brightness-110 scale-[1.02]' : 'brightness-100'}
                  metro-tile
                `}
                style={{
                  animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" 
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255,255,255,0.1) 10px,
                        rgba(255,255,255,0.1) 20px
                      )`
                    }}
                  />
                </div>

                {/* Content */}
                <div className={`
                  relative z-10 h-full flex flex-col 
                  ${isLarge ? 'justify-end items-start p-8' : 'justify-between p-6'}
                `}>
                  <Icon className={`
                    ${isLarge ? 'w-24 h-24 mb-4' : 'w-12 h-12'}
                    drop-shadow-lg
                  `} />
                  <span className={`
                    ${isLarge ? 'text-4xl' : 'text-xl'}
                    tracking-wider font-black
                    drop-shadow-md
                  `}>
                    {item.label}
                  </span>
                </div>

                {/* Shimmer Effect */}
                {hoveredTile === item.id && (
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                      animation: 'shimmer 0.6s ease-out'
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
