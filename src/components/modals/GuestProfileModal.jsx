import React from 'react';
import { X } from '../icons/IconComponents';

/**
 * A single guest's file. This one *is* a document, so it is a bone card with
 * the standard header pattern: mono label in signal-deep, a 2px ink rule, then
 * content (DESIGN_LANGUAGE.md §6.3).
 */
export const GuestProfileModal = ({ guest, currentUser, isVotingOpen, onClose, onVote }) => {
  if (!guest) return null;

  const isMe = guest.id === currentUser;
  const isVictim = guest.role === 'VICTIM';
  const standingLabel = isVictim ? 'Known victim' : guest.isSuspect ? 'Prime suspect' : 'Witness';

  return (
    <div
      className="er-fade fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/95 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${guest.name} — guest file`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="er-bone er-land w-full max-w-md max-h-[88vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 relative">
        <button
          onClick={onClose}
          aria-label="Close guest file"
          className="er-touch absolute top-3 right-3 flex items-center justify-center w-11 h-11 text-ink hover:text-signal-deep"
          style={{ border: '1px solid var(--color-line-bone)' }}
        >
          <X size={20} />
        </button>

        <p className="er-bone-label">Guest File</p>
        <div className="er-bone-rule mt-2 mb-5" />

        {/* Identity */}
        <div className="flex items-start gap-4 pr-12">
          <span
            className={`shrink-0 w-16 h-16 flex items-center justify-center font-typewriter font-bold text-2xl ${
              isMe ? 'bg-signal-deep text-bone' : 'bg-bone-aged text-ink'
            }`}
            style={{ border: '1px solid var(--color-line-bone)' }}
          >
            {guest.name.charAt(0)}
          </span>

          <div className="min-w-0 pt-1">
            <h3 className="font-typewriter font-bold uppercase text-ink text-[23px] leading-[1.1] break-words">
              {guest.name}
            </h3>
            <p className="er-bone-label mt-2">{guest.profession}</p>
          </div>
        </div>

        {/* Standing */}
        <div className="mt-5">
          <span className={`er-tag ${isVictim ? 'er-tag--mute' : 'er-tag--onbone'}`}>
            {standingLabel}
          </span>
        </div>

        {/* Bio */}
        <section className="mt-6">
          <p className="er-bone-label">Background</p>
          <div className="mt-2" style={{ borderTop: '1px solid var(--color-line-bone)' }} />
          <p className="er-bone-body mt-3">{guest.bio}</p>
        </section>

        {/* Quirk — an in-fiction margin note, so it is the note face (§3.2). */}
        <section className="mt-6">
          <p className="er-bone-label">Known trait</p>
          <div className="mt-2" style={{ borderTop: '1px solid var(--color-line-bone)' }} />
          <p className="font-note text-[17px] leading-[1.35] text-ink mt-3 -rotate-1 origin-left">
            “{guest.quirk}”
          </p>
        </section>

        {isVotingOpen && !isVictim && (
          <button
            onClick={() => {
              onVote(guest.id);
              onClose();
            }}
            className="er-touch er-touch--hot w-full mt-7 bg-signal-deep text-bone py-4 px-6 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-signal-deep"
          >
            Cast vote
          </button>
        )}

        {isMe && (
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-line-bone)' }}>
            <p className="er-bone-label">This is you</p>
            <p className="er-bone-body text-[13px] mt-2">
              Your secret is on the Identity screen, not here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
