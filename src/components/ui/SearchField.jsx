import React from 'react';
import { Search, X } from '../icons/IconComponents';

/**
 * The filter field (DESIGN_LANGUAGE.md §6, "Search").
 *
 * Used on any screen long enough that scanning it by eye is the slow path —
 * the ballot (51 names) and the suspect index. It is an interface control, so
 * it sits on ink with a hairline border and takes the signal border on focus,
 * exactly like the chat composer; no new hue, no rounded corners, no icon
 * colour of its own.
 *
 * The result count is deliberately a plain mono line rather than a brass
 * numeral: brass is reserved for game data (votes, guest totals), and "how
 * many rows survived my typing" is chrome, not evidence.
 */
export const SearchField = ({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  resultCount,
  totalCount,
  className = '',
}) => {
  const isFiltering = value.trim().length > 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 bg-ink border border-line px-3 focus-within:border-signal transition-colors duration-150">
        <Search size={16} className="shrink-0 text-dim-2" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="flex-1 min-w-0 bg-transparent py-3 font-body text-[15px] text-bone placeholder:text-dim-2 focus:outline-none"
        />

        {isFiltering && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="er-touch shrink-0 -mr-1 px-1 text-dim hover:text-bone transition-colors duration-150"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isFiltering && (
        <p className="er-mono er-mono--dim mt-2">
          {resultCount === 0
            ? 'No match'
            : `${resultCount} of ${totalCount} shown`}
        </p>
      )}
    </div>
  );
};
