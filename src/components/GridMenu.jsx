import React, { useState } from 'react';

// Custom Sketched Icons
const FingerprintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const FolderIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const HelpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function GridMenu({ onNavigate, voteCounts }) {
  const [hoveredTile, setHoveredTile] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'IDENTITY', 
      subtext: 'CONFIDENTIAL',
      icon: FingerprintIcon, 
      rotate: '-rotate-1',
      bgType: 'bg-mystery-paper',
      textColor: 'text-mystery-ink'
    },
    { 
      id: 'intel', 
      label: 'EVIDENCE', 
      subtext: 'BOARD',
      icon: ClipboardIcon, 
      rotate: 'rotate-2',
      bgType: 'bg-mystery-paper',
       textColor: 'text-mystery-ink'
    },
    { 
      id: 'chat', 
      label: 'COMMS', 
      subtext: 'ENCRYPTED',
      icon: ChatIcon, 
      rotate: '-rotate-2',
      bgType: 'bg-mystery-paper',
       textColor: 'text-mystery-ink'
    },
    { 
      id: 'votes', 
      label: 'VOTE', 
      subtext: 'SUSPECT LIST',
      icon: ChartIcon, 
      rotate: 'rotate-1',
      bgType: 'bg-mystery-blood',
      textColor: 'text-white'
    },
    { 
      id: 'files', 
      label: 'ARCHIVES', 
      subtext: 'CASE FILES',
      icon: FolderIcon, 
      rotate: '-rotate-1',
      bgType: 'bg-mystery-aged',
      textColor: 'text-mystery-ink'
    },
    { 
      id: 'dossier', 
      label: 'SUSPECTS', 
      subtext: 'PROFILES',
      icon: UsersIcon, 
      rotate: 'rotate-2',
      bgType: 'bg-mystery-paper',
       textColor: 'text-mystery-ink'
    },
    { 
      id: 'help', 
      label: 'GUIDE', 
      subtext: 'READ ME',
      icon: HelpIcon, 
      rotate: '-rotate-2',
      bgType: 'bg-mystery-sepia',
      textColor: 'text-white'
    },
    { 
      id: 'logout', 
      label: 'EXIT', 
      subtext: '',
      icon: LogoutIcon, 
      rotate: 'rotate-1',
      bgType: 'bg-mystery-charcoal',
      textColor: 'text-white'
    }
  ];

  const handleTileClick = (itemId) => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onNavigate(itemId);
  };

  return (
    <div className="min-h-screen bg-mystery-dark overflow-y-auto pb-10" style={{
      backgroundImage: `
        radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.9), rgba(0, 0, 0, 1)),
        url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
      `
    }}>
      {/* Cinematic Header */}
      <div className="pt-8 pb-6 px-4 text-center relative">
        <p className="font-typewriter text-mystery-aged tracking-[0.2em] text-xs sm:text-sm uppercase mb-2">
          Astral Project Presents
        </p>
        <h1 className="font-typewriter text-4xl sm:text-5xl font-bold text-mystery-paper tracking-tighter uppercase border-b-2 border-mystery-blood inline-block pb-2 transform -rotate-1 shadow-lg">
          The Murder Mystery Experience @ For the Record
        </h1>
        <div className="mt-4 transform rotate-1">
          <span className="font-handwriting text-2xl text-mystery-blood bg-black/10 px-4 py-1 rounded inline-block">
            "Trust No One."
          </span>
        </div>
      </div>

      {/* Investigation Desk Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTileClick(item.id)}
                onMouseEnter={() => setHoveredTile(item.id)}
                onMouseLeave={() => setHoveredTile(null)}
                className={`
                  relative group ${item.bgType} ${item.rotate}
                  aspect-[4/3] w-full
                  flex flex-col items-center justify-center
                  shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4),0_8px_10px_-6px_rgba(0,0,0,0.3)]
                  hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5),0_15px_20px_-6px_rgba(0,0,0,0.4)]
                  hover:scale-[1.03] hover:z-10 hover:-translate-y-1
                  transition-all duration-300 ease-out
                  border border-black/10 select-none
                  before:content-[''] before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/paper.png')] before:opacity-30 before:pointer-events-none
                `}
                style={{
                  animation: `slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s backwards`
                }}
              >
                {/* Pin effect - centered at top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-md z-20 pointer-events-none">
                  <div className="absolute inset-0.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                </div>
                
                {/* Pin shadow underneath the note */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-black/20 blur-sm pointer-events-none"></div>

                {/* Content Container */}
                <div className={`
                  w-full h-full 
                  flex flex-col items-center justify-center 
                  p-2
                  ${item.textColor}
                  relative z-10
                `}>
                  <Icon className={`
                    w-10 h-10 sm:w-12 sm:h-12 mb-2 stroke-[1.5px] opacity-90 group-hover:opacity-100 transition-opacity
                    ${hoveredTile === item.id ? 'scale-105' : 'scale-100'}
                  `} />
                  
                  <span className={`
                    text-xl sm:text-3xl font-typewriter font-bold uppercase tracking-widest
                    ${hoveredTile === item.id ? 'underline decoration-mystery-blood decoration-2' : ''}
                  `}>
                    {item.label}
                  </span>
                  
                  {item.subtext && (
                    <span className="hidden sm:block mt-1 font-handwriting text-lg sm:text-xl opacity-70">
                      {item.subtext}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}