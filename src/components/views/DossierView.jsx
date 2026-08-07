import React, { useMemo, useState } from 'react';
import { CHARACTERS } from '../../data/gameData';
import { Numeral } from '../ui/Numeral';
import { InfoTip } from '../ui/InfoTip';
import { SearchField } from '../ui/SearchField';
import { TOOLTIPS } from '../../data/tooltips';

/**
 * The suspect index (DESIGN_LANGUAGE.md §9, "Suspects").
 *
 * The roster is an interface, not a document, so it lives on ink and separates
 * with hairlines rather than a paper card per guest (§5). The individual profile —
 * which *is* a document — becomes a bone card in GuestProfileModal.
 *
 * The old rainbow of avatar colours is gone: differentiation comes from the
 * surface and the label, never from a new hue (§2.2).
 */
export const DossierView = ({ currentUser, onSelectGuest }) => {
  const [query, setQuery] = useState('');

  // The file number is the guest's position in the roster, not their position
  // in the filtered list — a file that reads 34 must keep reading 34 while the
  // player is typing, or the number stops being a reference they can call out.
  const roster = useMemo(
    () => CHARACTERS.map((char, index) => ({ char, fileNumber: index + 1 })),
    []
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return roster;

    return roster.filter(({ char }) =>
      [char.name, char.profession, char.quirk]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    );
  }, [roster, query]);

  return (
    <div className="space-y-5">
      {/* Stat */}
      <div className="er-stat flex items-end justify-between gap-4">
        {/* `shrink-0`, unlike the other stat rows: this one has a sentence
            opposite it rather than a second numeral, and flex shrinks both
            sides — so the 26px the mark adds came out of the label and wrapped
            "Guests on record" onto two lines (measured at 390px). Pinning this
            column makes the paragraph absorb it instead, which it can: it is
            already two lines at its own max width. */}
        <div className="shrink-0">
          <Numeral as="p" value={CHARACTERS.length} pad={2} className="er-stat__num" />
          {/* The file number beside each name is a reference the room speaks
              in, and nothing on the screen says so (§6.13). */}
          <p className="er-stat__label flex items-center gap-2">
            Guests on record
            <InfoTip tip={TOOLTIPS.guests} />
          </p>
        </div>
        <p className="font-body text-[15px] leading-[1.55] text-dim text-right max-w-[16rem]">
          Tap any name to open their file.
        </p>
      </div>

      {/* Filter */}
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search by name, job or detail…"
        label="Search guests"
        resultCount={results.length}
        totalCount={roster.length}
      />

      {/* Index */}
      <div className="border border-line bg-ink-raised">
        {results.length === 0 && (
          <p className="px-3 py-6 font-body text-[15px] leading-[1.55] text-dim">
            No guest on record matches “{query.trim()}”.
          </p>
        )}

        {results.map(({ char, fileNumber }, index) => {
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
                    {String(fileNumber).padStart(2, '0')}
                  </span>
                </span>

                <span className="er-mono er-mono--dim block mt-1 truncate">{char.profession}</span>

                <span className="block font-body text-[13px] leading-[1.45] text-dim mt-1.5 truncate">
                  {char.quirk}
                </span>
              </span>

              {/* Only facts the room already knows get a tag here. Suspect vs
                  witness is never shown — the player has to earn that from the
                  clue deck. */}
              {(isMe || isVictim) && (
                <span className="shrink-0 self-start">
                  {isMe ? (
                    <span className="er-tag">You</span>
                  ) : (
                    <span className="er-tag er-tag--mute">Deceased</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="er-mono text-center">Confidential · For investigative use only</p>
    </div>
  );
};
