import React, { useMemo } from 'react';
import { X } from '../icons/IconComponents';
import { CHARACTERS } from '../../data/gameData';

export const VoteResultsModal = ({ isOpen, onClose, voteCounts }) => {
  if (!isOpen) return null;

  // Calculate vote results sorted by vote count (descending)
  const voteResults = useMemo(() => {
    const results = CHARACTERS.map((char) => ({
      id: char.id,
      name: char.name,
      profession: char.profession,
      votes: voteCounts[char.id] || 0,
    })).filter(char => char.votes > 0); // Only show characters with votes

    // Sort by vote count (highest first)
    results.sort((a, b) => b.votes - a.votes);
    
    const maxVotes = results.length > 0 ? results[0].votes : 1;
    
    return results.map(result => ({
      ...result,
      percentage: maxVotes > 0 ? (result.votes / maxVotes) * 100 : 0
    }));
  }, [voteCounts]);

  const totalVotes = voteResults.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-stone-900 text-white rounded-lg shadow-2xl border-4 border-stone-700 w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-red-700 p-4 rounded-t-lg flex justify-between items-center border-b-4 border-stone-900">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
              📊 Vote Results
            </h2>
            <p className="text-xs text-red-100 mt-1">
              Live voting statistics • Total: {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-stone-900 hover:bg-stone-800 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {voteResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-400 text-lg mb-2">📭 No votes yet</p>
              <p className="text-stone-500 text-sm">Be the first to cast your vote!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voteResults.map((result, index) => (
                <div
                  key={result.id}
                  className="bg-stone-800 rounded-lg p-4 border-2 border-stone-700 hover:border-orange-500 transition-all"
                  style={{
                    animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Character Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-lg flex items-center justify-center border-2 border-stone-900">
                      {result.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{result.name}</h3>
                        {index === 0 && result.votes > 0 && (
                          <span className="text-xs bg-yellow-500 text-stone-900 px-2 py-0.5 rounded font-black">
                            🏆 TOP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-400 font-bold uppercase">{result.profession}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-orange-400">{result.votes}</div>
                      <div className="text-[10px] text-stone-500 uppercase">
                        {result.votes === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                  </div>

                  {/* Animated Bar Graph */}
                  <div className="relative h-8 bg-stone-900 rounded-full overflow-hidden border-2 border-stone-700">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-end px-3 transition-all duration-700 ease-out"
                      style={{
                        width: `${result.percentage}%`,
                        minWidth: result.votes > 0 ? '40px' : '0'
                      }}
                    >
                      <span className="text-white text-xs font-black drop-shadow-lg">
                        {Math.round((result.votes / totalVotes) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-800 p-3 rounded-b-lg border-t-2 border-stone-700">
          <p className="text-xs text-stone-400 text-center">
            ⚡ Updates in real-time as votes are cast
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
