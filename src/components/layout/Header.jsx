import React from 'react';
import { X } from '../icons/IconComponents';
import { Numeral } from '../ui/Numeral';
import { RoundRail } from '../ui/RoundRail';
import { InfoTip } from '../ui/InfoTip';
import { ROUNDS } from '../../data/gameData';
import { roundTip } from '../../data/tooltips';

/**
 * The chrome rail (DESIGN_LANGUAGE.md §4.2). Mono label left, state right,
 * hairline underneath — the hairline is what makes chrome read as chrome
 * instead of as floating text, so it is not optional.
 *
 * This is the most-seen surface in the app: it is sticky on every screen, so
 * it is also where the round advance is worth spending motion on (§7). Three
 * things move, in sequence, and only when the round actually changes:
 *
 *   1. the brass numeral ticks to the new round (Numeral)
 *   2. the round's title crossfades in under the masthead (`er-swap` on a key)
 *   3. the rail fills the new segment, 120ms behind the numeral (RoundRail)
 *
 * Height is `--chrome-h` (index.css); ChatView pins itself to the same value.
 */
export const Header = ({
  currentRound,
  currentRoundData,
  isVotingOpen,
  onClose,
  // Where this X actually goes. It is not always the board — from an open Evidence
  // stack it steps back to the Evidence hub — and a screen reader is told the truth.
  closeLabel = 'Close and return to the board',
}) => {
  const roundTitle = currentRoundData?.title || 'Standby';

  return (
    <header className="sticky top-0 z-40 bg-ink border-b border-line">
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="er-mono er-mono--wide er-mono--bone block">Astral Project</span>
            {/* Keyed on the title so an advance remounts it and it animates in.
                Without the key React reuses the node and the text just swaps. */}
            <span key={roundTitle} className="er-mono er-mono--dim er-swap block mt-1.5 truncate">
              {roundTitle}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isVotingOpen && (
              <span className="er-mono er-mono--hot er-swap hidden sm:inline">Voting Open</span>
            )}

            {/* Round is a number, so it is brass, and it is the display face
                (§3.1). It ticks rather than jumps (§7).

                The tooltip beside it is the most valuable one in the app: the
                rail is on every screen, so this is the only place a player can
                ask "what can I do right now?" without leaving what they are
                doing. It names the round and prints that round's line from the
                Guide (§6.13). */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="er-mono">Round</span>
                <InfoTip tip={roundTip(currentRound)} />
              </div>
              <Numeral
                as="div"
                value={currentRound}
                pad={2}
                className="er-num text-2xl mt-0.5"
              />
            </div>

            {onClose && (
              <button
                onClick={onClose}
                aria-label={closeLabel}
                className="er-touch flex items-center justify-center w-11 h-11 border border-line text-bone hover:border-signal hover:text-signal-lift"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <RoundRail currentRound={currentRound} total={ROUNDS.length} className="pb-2.5" />
      </div>
    </header>
  );
};
