import React, { useState } from 'react';
import { validateLoginCode } from '../data/gameData';

/**
 * Identity verification (DESIGN_LANGUAGE.md §9, "Login").
 *
 * CONFIDENTIAL is a filled signal tag — the smallest atomic accent, and the
 * only place pure white appears in the system. The access code is a fill-in
 * blank (§6.9): a deliberately unknown value, tinted signal with a dashed
 * underline, sitting on the bone document where the form lives.
 */
export const CharacterSelect = ({ onSelectCharacter }) => {
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Host login code
    if (loginCode === 'KUSH6969') {
      if (navigator.vibrate) navigator.vibrate([200]);
      setTimeout(() => onSelectCharacter('host', true), 500);
      return;
    }

    const characterId = validateLoginCode(loginCode);

    if (characterId) {
      if (navigator.vibrate) navigator.vibrate([50, 50]);
      setTimeout(() => onSelectCharacter(characterId, false), 500);
    } else {
      setError('Access denied — invalid credentials');
      setIsLoading(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col justify-center px-4 py-10 relative er-grain overflow-hidden">
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-lamp er-lamp--signal" aria-hidden="true" />
      <div className="er-vignette" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Chrome rail */}
        <div className="flex items-center justify-between gap-3">
          <span className="er-mono er-mono--wide er-mono--bone">Astral Project</span>
          <span className="er-mono">Case 8821-B</span>
        </div>
        <div className="er-rule mt-3" />

        {/* Kicker + title */}
        <div className="pt-8 er-enter">
          <span className="er-tag">Confidential</span>
          <h1 className="er-title mt-4">Identity Verification</h1>
          <p className="er-mono er-mono--dim mt-3">Restricted access · Authorised guests only</p>
        </div>

        {/* The form is a document, so it is paper — pinned, rotated, and the
            one element on this screen that casts a shadow (§5). */}
        <form
          onSubmit={handleSubmit}
          className="er-bone er-pin er-rotL er-land mt-9 p-6 sm:p-7"
          style={{ animationDelay: '120ms' }}
        >
          <p className="er-bone-label">Access Code</p>
          <div className="er-bone-rule mt-2 mb-6" />

          <input
            type="text"
            value={loginCode}
            onChange={(e) => {
              setLoginCode(e.target.value.toUpperCase());
              setError('');
            }}
            className="er-blank er-blank--onbone w-full text-center text-[28px] font-bold py-3 px-2"
            placeholder="——————"
            disabled={isLoading}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            maxLength={20}
            aria-label="Access code"
          />

          <p className="font-handwriting text-[19px] text-signal-deep mt-4 -rotate-1 origin-left">
            Printed on the card you were handed at the door.
          </p>

          {/* Keyed on the message so a second failed attempt re-runs the shake.
              Without it the node is reused, the animation has already played,
              and the second rejection is silent — the worst possible time for
              the app to look like it ignored a tap. */}
          {error && (
            <p key={error} className="er-shake mt-5 inline-block er-tag er-tag--onbone">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !loginCode.trim()}
            className="er-touch w-full mt-7 bg-ink text-bone py-4 px-6 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-ink hover:bg-ink-hover disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {/* Keyed so the label change reads as the button acting on the tap,
                rather than the word silently becoming a different word. */}
            <span key={isLoading ? 'busy' : 'idle'} className="er-swap inline-block">
              {isLoading ? 'Verifying…' : 'Open Case File'}
            </span>
          </button>

          <div
            className="mt-6 pt-4"
            style={{ borderTop: '1px solid var(--color-line-bone)' }}
          >
            <p className="er-bone-body text-[13px]">
              Unauthorised access is strictly prohibited.
            </p>
          </div>
        </form>

        {/* Footer rail */}
        <div className="mt-10">
          <div className="er-rule" />
          <div className="flex items-center justify-between pt-3">
            <span className="er-mono">Secure Connection</span>
            <span className="er-mono">32 Guests</span>
          </div>
        </div>
      </div>
    </div>
  );
};
