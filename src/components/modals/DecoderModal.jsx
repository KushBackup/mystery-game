import React from 'react';
import { X } from '../icons/IconComponents';

/**
 * The decoder (DESIGN_LANGUAGE.md §9). The code field is a fill-in blank
 * (§6.9) — a value the system knows is deliberately missing, marked with a
 * signal tint and a dashed signal underline rather than a normal input chrome.
 *
 * Codes used to arrive on printed cards the host handed round. They now arrive
 * from other players: solving a riddle in the RiddleModal hands you a clue *and*
 * its code, and this is where everyone else spends it. That makes the decoder
 * the receiving end of a trade rather than a data-entry chore, so the copy names
 * the person who gave you the code rather than the object it was written on.
 */
export const DecoderModal = ({ isOpen, inputCode, onInputChange, onSubmit, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      // The backdrop fades in under the card rather than appearing with it, so
      // the screen behind recedes instead of being cut away.
      className="er-fade fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-ink/95 px-4 pt-16 sm:pt-4 pb-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enter a clue code"
      onClick={(e) => {
        // Tapping outside dismisses. The decoder is opened far more often than
        // it is submitted — a player checks it, sees they have no card to hand,
        // and backs out — so the escape has to be as cheap as the entry.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="er-card er-card--signal er-land w-full max-w-md p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="er-mono er-mono--hot er-mono--wide">Decoder</p>
            <h2 className="er-title text-[28px] mt-2">Enter Code</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close decoder"
            className="er-touch flex items-center justify-center w-11 h-11 border border-line text-bone hover:border-signal hover:text-signal-lift shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="er-rule my-5" />

        <form onSubmit={onSubmit}>
          <label className="er-mono er-mono--dim block mb-3" htmlFor="clue-code">
            Code somebody gave you
          </label>

          <input
            id="clue-code"
            type="text"
            value={inputCode}
            onChange={onInputChange}
            placeholder="——————"
            className="er-blank w-full text-center text-[28px] font-medium py-3 px-2"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
          />

          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="er-touch er-touch--hot w-full mt-6 bg-signal text-white py-4 px-6 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-signal disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Unseal
          </button>
        </form>

        <p className="font-body text-[15px] leading-[1.55] text-dim mt-5">
          Codes come from other players — anyone who solves a riddle is handed one to
          share. From Round 02 you can earn your own with ASK, beside this button.
          Codes belonging to a later round will not open yet.
        </p>
      </div>
    </div>
  );
};
