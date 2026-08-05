import React, { useEffect, useMemo, useState } from 'react';
import { X } from '../icons/IconComponents';
import { CHARACTERS } from '../../data/gameData';
import { Numeral } from '../ui/Numeral';

/**
 * The tally (DESIGN_LANGUAGE.md §6.6). Every figure here is a brass numeral in
 * the display face; the bars are the one signal element on the screen. No
 * gradients, no second hue, no rounded corners.
 */
export const VoteResultsModal = ({ isOpen, onClose, voteCounts }) => {
  // Hooks run before any early return — `isOpen` gates the render, not the hook.
  const voteResults = useMemo(() => {
    const results = CHARACTERS.map((char) => ({
      id: char.id,
      name: char.name,
      profession: char.profession,
      votes: voteCounts?.[char.id] || 0,
    })).filter((char) => char.votes > 0);

    results.sort((a, b) => b.votes - a.votes);

    const maxVotes = results.length > 0 ? results[0].votes : 1;

    return results.map((result) => ({
      ...result,
      percentage: maxVotes > 0 ? (result.votes / maxVotes) * 100 : 0,
    }));
  }, [voteCounts]);

  // The bars grow from zero when the tally opens. This is the one place in the
  // app where a load-time animation is right rather than noise: the host
  // releases the tally once per round, so it is a low-frequency reveal, not a
  // screen the player passes through — and watching the bars find their length
  // is the point of opening it.
  //
  // Two nested frames, not one: the element has to be painted at scaleX(0)
  // before the new value can transition from it, and a single rAF still lands
  // inside the same paint in some browsers.
  const [barsIn, setBarsIn] = useState(false);
  const [seenOpen, setSeenOpen] = useState(isOpen);

  // Resetting on close is a render-phase adjustment rather than an effect, which
  // `react-hooks/set-state-in-effect` would reject.
  if (seenOpen !== isOpen) {
    setSeenOpen(isOpen);
    if (!isOpen) setBarsIn(false);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setBarsIn(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalVotes = voteResults.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div
      className="er-fade fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/95 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Vote tally"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="er-land w-full max-w-xl max-h-[88vh] flex flex-col bg-ink border border-line">
        {/* Chrome */}
        <div className="px-4 pt-4 pb-3 border-b border-line flex items-start justify-between gap-3">
          <div>
            <p className="er-mono er-mono--hot er-mono--wide">Live tally</p>
            <h2 className="er-title text-[26px] mt-2">Vote Results</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tally"
            className="er-touch flex items-center justify-center w-11 h-11 border border-line text-bone hover:border-signal hover:text-signal-lift shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <div className="er-stat">
            <Numeral as="p" value={totalVotes} pad={2} className="er-stat__num" />
            <p className="er-stat__label">Votes cast</p>
          </div>

          {voteResults.length === 0 ? (
            <p className="font-body text-[15px] leading-[1.55] text-dim">
              No votes recorded yet.
            </p>
          ) : (
            voteResults.map((result, index) => (
              <div
                key={result.id}
                className={`er-card er-enter ${index === 0 ? 'er-card--brass' : ''}`}
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-typewriter font-bold text-bone text-[17px] truncate">
                      {result.name}
                    </p>
                    <p className="er-mono er-mono--dim mt-1 truncate">{result.profession}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <Numeral as="p" value={result.votes} className="er-num text-[30px]" />
                    <p className="er-stat__label">
                      {result.votes === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                </div>

                {/* Bar: signal on ink-hover, square, no gradient. Grows by
                    scaleX rather than width — width is a layout property, and
                    this list can hold a row per suspect, all animating at once
                    every time a vote lands. */}
                <div className="er-bar mt-3">
                  <div
                    className="er-bar__fill"
                    style={{
                      '--fill': barsIn ? result.percentage / 100 : 0,
                      // 60ms apart, so the ranking reads top-down as it fills
                      // instead of all lengths appearing at once.
                      transitionDelay: `${Math.min(index, 8) * 60}ms`,
                    }}
                  />
                </div>

                <p className="er-mono er-mono--dim mt-2 tabular-nums">
                  {totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0}% of the room
                </p>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-line">
          <p className="er-mono text-center">Updates live as votes are cast</p>
        </div>
      </div>
    </div>
  );
};
