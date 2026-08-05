import React from 'react';
import { CHARACTERS } from '../../data/gameData';
import { Numeral } from '../ui/Numeral';

/**
 * The suspect index (DESIGN_LANGUAGE.md §9, "Suspects").
 *
 * The roster is an interface, not a document, so it lives on ink and separates
 * with hairlines rather than 32 sheets of paper (§5). The individual profile —
 * which *is* a document — becomes a bone card in GuestProfileModal.
 *
 * The old rainbow of avatar colours is gone: differentiation comes from the
 * surface and the label, never from a new hue (§2.2).
 */
export const DossierView = ({ currentUser, onSelectGuest }) => {
  return (
    <div className="space-y-5">
      {/* Stat */}
      <div className="er-stat flex items-end justify-between gap-4">
        <div>
          <Numeral as="p" value={CHARACTERS.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Guests on record</p>
        </div>
        <p className="font-body text-[15px] leading-[1.55] text-dim text-right max-w-[16rem]">
          Tap any name to open their file.
        </p>
      </div>

      {/* Index */}
      <div className="border border-line bg-ink-raised">
        {CHARACTERS.map((char, index) => {
          const isMe = char.id === currentUser;
          const isVictim = char.role === 'VICTIM';

          return (
            <button
              key={char.id}
              onClick={() => onSelectGuest(char)}
              className={`er-touch er-enter w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-ink-hover ${
                index > 0 ? 'border-t border-line-faint' : ''
              } ${isMe ? 'border-l-[3px] border-l-signal' : ''}`}
              style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
            >
              {/* Square initial — corners are square, only avatars in the
                  document view are discs. */}
              <span
                className={`shrink-0 w-11 h-11 flex items-center justify-center font-typewriter font-bold text-lg border ${
                  isMe ? 'border-signal text-signal-lift' : 'border-line text-bone'
                } bg-ink`}
              >
                {char.name.charAt(0)}
              </span>

              <span className="flex-1 min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="font-typewriter font-bold text-bone text-[17px] truncate">
                    {char.name}
                  </span>
                  <span className="er-num text-[13px] shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>

                <span className="er-mono er-mono--dim block mt-1 truncate">{char.profession}</span>

                <span className="block font-body text-[13px] leading-[1.45] text-dim mt-1.5 truncate">
                  {char.quirk}
                </span>
              </span>

              <span className="shrink-0 self-start">
                {isMe ? (
                  <span className="er-tag">You</span>
                ) : isVictim ? (
                  <span className="er-tag er-tag--mute">Deceased</span>
                ) : (
                  <span className="er-mono er-mono--dim">{char.isSuspect ? 'Suspect' : 'Witness'}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="er-mono text-center">Confidential · For investigative use only</p>
    </div>
  );
};
