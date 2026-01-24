import React, { useState, useEffect } from 'react';

export const TimelineView = ({ myCharacter }) => {
  const [visibleEvents, setVisibleEvents] = useState([]);
  
  // Parse the character's timeline into structured events
  const parseTimeline = (timelineText) => {
    if (!timelineText) return [];
    
    const lines = timelineText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      // Extract time if present (format: 6:00 PM or 8:05 PM)
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
      const time = timeMatch ? timeMatch[1] : null;
      const description = line.replace(timeMatch ? timeMatch[0] : '', '').replace(/^[-–—]\s*/, '').trim();
      
      return {
        id: index,
        time,
        description,
        isCritical: line.toLowerCase().includes('kitchen') || 
                    line.toLowerCase().includes('ice') || 
                    line.toLowerCase().includes('poison') ||
                    line.toLowerCase().includes('collapse') ||
                    line.toLowerCase().includes('speech')
      };
    });
  };

  const timelineEvents = parseTimeline(myCharacter.timeline);

  // Animate events in sequence
  useEffect(() => {
    setVisibleEvents([]);
    timelineEvents.forEach((event, index) => {
      setTimeout(() => {
        setVisibleEvents(prev => [...prev, event.id]);
      }, index * 200); // Stagger by 200ms
    });
  }, [myCharacter.id]);

  // Key murder timeline context (only shown to suspects after revelation)
  const murderContext = [
    { time: '8:00 PM', event: 'Rohan begins his apology speech', icon: '🎤' },
    { time: '8:15 PM', event: 'Speech ends, sealed scotch bottle opened', icon: '🥃' },
    { time: '8:17 PM', event: 'Rohan adds special ice to his drink', icon: '❄️' },
    { time: '8:18 PM', event: 'Esha takes a small sip from his glass', icon: '💧' },
    { time: '8:19 PM', event: 'Toast made, everyone drinks', icon: '🥂' },
    { time: '8:45 PM', event: 'ROHAN COLLAPSES - CRITICAL MOMENT', icon: '💀' },
    { time: '9:02 PM', event: 'Rohan pronounced dead', icon: '⚰️' },
    { time: '9:30 PM', event: 'Police arrive, bar locked down', icon: '🚨' }
  ];

  // Only show murder timeline to suspects (roles: MURDERER, SUSPECT)
  const canSeeMurderTimeline = myCharacter.role === 'MURDERER' || myCharacter.role === 'SUSPECT';

  return (
    <div className="fixed inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto animate-fade-in bg-gradient-to-b from-stone-100 to-stone-200">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-12">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 mb-8 border-4 border-stone-900 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl">⏰</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-wide">
                Your Timeline
              </h2>
            </div>
            <p className="text-center text-white/90 text-sm font-bold mb-3">
              {myCharacter.name}'s movements on the night of the murder
            </p>
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/40 p-3 rounded-lg text-center">
              <p className="text-white text-xs font-bold">
                📍 Location: <span className="font-black">For The Record Bar</span>
              </p>
              <p className="text-white text-xs font-bold mt-1">
                📅 Date: <span className="font-black">January 25, 2026</span>
              </p>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.1) 20px,
                  rgba(255,255,255,0.1) 40px
                )`
              }}
            />
          </div>
        </div>

        {/* Your Personal Timeline */}
        <div className="mb-8">
          <h3 className="text-xl font-black text-stone-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            Your Movements
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>
            
            {/* Timeline Events */}
            <div className="space-y-6">
              {timelineEvents.map((event, index) => {
                const isVisible = visibleEvents.includes(event.id);
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={event.id}
                    className={`relative transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-stone-900 flex items-center justify-center font-black text-white shadow-lg flex-shrink-0 ${
                        event.isCritical 
                          ? 'bg-red-600 animate-pulse-slow' 
                          : isEven 
                            ? 'bg-indigo-600' 
                            : 'bg-purple-600'
                      }`}>
                        {event.isCritical ? '⚠️' : index + 1}
                      </div>
                      
                      {/* Event Card */}
                      <div className={`flex-1 p-4 border-3 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] ${
                        event.isCritical
                          ? 'bg-red-50 border-red-600'
                          : 'bg-white border-stone-900'
                      }`}>
                        {event.time && (
                          <div className={`inline-block px-3 py-1 mb-2 text-xs font-black border-2 ${
                            event.isCritical
                              ? 'bg-red-600 text-white border-red-800'
                              : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          }`}>
                            🕐 {event.time}
                          </div>
                        )}
                        <p className={`text-sm font-bold leading-relaxed ${
                          event.isCritical ? 'text-red-900' : 'text-stone-800'
                        }`}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Murder Timeline Context - Only for suspects */}
        {canSeeMurderTimeline && (
          <div className="bg-stone-900 p-6 border-4 border-red-600 shadow-[8px_8px_0px_rgba(220,38,38,0.3)] mb-6">
            <h3 className="text-xl font-black text-red-500 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔪</span>
              Key Events - The Incident
            </h3>
          
          <div className="space-y-3">
            {murderContext.map((item, index) => (
              <div 
                key={index}
                className="bg-stone-800 border-2 border-stone-700 p-3 flex items-center gap-3 hover:border-red-500 transition-colors"
                style={{
                  animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-xs font-black text-orange-400 block mb-1">
                    {item.time}
                  </span>
                  <span className={`text-sm font-bold ${
                    item.event.includes('COLLAPSES') 
                      ? 'text-red-400' 
                      : 'text-stone-300'
                  }`}>
                    {item.event}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Character Role Badge */}
        {myCharacter.role === 'MURDERER' && (
          <div className="mt-6 bg-red-900 border-4 border-red-950 p-4 text-center animate-pulse-slow">
            <p className="text-red-300 font-black text-lg">
              🔪 YOU ARE THE MURDERER 🔪
            </p>
            <p className="text-red-400 text-xs mt-2">
              Your timeline is your alibi. Make it convincing.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
