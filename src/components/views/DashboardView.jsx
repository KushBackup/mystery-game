import React, { useState } from 'react';
import { Fingerprint } from '../icons/IconComponents';
import { DoodleCoffeeStain } from '../ui/Doodles';
import { RedactedLines } from '../ui/RedactedLines';
import { InfoTip } from '../ui/InfoTip';
import { TOOLTIPS } from '../../data/tooltips';

/**
 * The player's own file (DESIGN_LANGUAGE.md §9, "Identity").
 *
 * One full bone card, because this *is* a document. The secret is a redaction
 * bar (§6.7) the player taps to wipe open — a state change turned into a
 * moment, instead of text that simply sits there.
 */
/** Same uneven rhythm as RedactedLines' default, extended for a longer note. */
const KILLER_REDACT_WIDTHS = ['96%', '72%', '88%', '61%', '91%', '68%', '83%'];

export const DashboardView = ({ myCharacter }) => {
  const [secretOpen, setSecretOpen] = useState(false);

  if (!myCharacter) return null;

  const isMurderer = myCharacter.role === 'MURDERER';
  const isVictim = myCharacter.role === 'VICTIM';

  return (
    <div className="er-land">
      <article className="er-bone er-pin er-rotR relative p-5 sm:p-7">
        <DoodleCoffeeStain />

        {/* Header pattern: mono label in signal-deep, then a 2px ink rule.
            The tooltip rides the header rather than the Confidential Note it
            mostly talks about: that row already carries a label and a "Tap to
            unseal" hint, and a third element wraps it at 360px. */}
        <div className="flex items-center justify-between gap-3">
          <p className="er-bone-label min-w-0">Subject File · 8821-B</p>
          <InfoTip tip={TOOLTIPS.identity} tone="bone" />
        </div>
        <div className="er-bone-rule mt-2 mb-6" />

        {/* Identity block */}
        <div className="flex items-start gap-4">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center bg-bone-aged"
            style={{ border: '1px solid var(--color-line-bone)' }}
          >
            <Fingerprint size={40} className="text-ink/35" />
          </div>

          <div className="min-w-0 pt-1">
            <h2 className="font-typewriter font-bold uppercase text-ink leading-[1.05] text-[26px] sm:text-[32px] break-words">
              {myCharacter.name}
            </h2>
            <p className="er-bone-label mt-2">{myCharacter.profession}</p>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 mt-2">
              No photograph on record
            </p>
          </div>
        </div>

        {/* Role callout. Never a second hue — the surface and the label change,
            not the colour (§2.2). */}
        {(isMurderer || isVictim) && (
          <div className="mt-6">
            <span className={`er-tag ${isVictim ? 'er-tag--mute' : 'er-tag--onbone'}`}>
              {isMurderer ? 'Classified · Killer' : 'Deceased · Victim'}
            </span>
          </div>
        )}

        {/* Bio */}
        <section className="mt-7">
          <p className="er-bone-label">Subject Profile</p>
          <div className="mt-2" style={{ borderTop: '1px solid var(--color-line-bone)' }} />
          <p className="er-bone-body mt-3">{myCharacter.bio}</p>
        </section>

        {/* Secret — sealed behind a redaction bar until tapped. This is the
            screen's whole interaction, so it gets the press feedback: `er-press`
            rather than `er-touch`, because er-touch's shift to ink-hover would
            punch a dark rectangle into the middle of the document. */}
        <section className="mt-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="er-bone-label">Confidential Note</p>
            <span
              className={`font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 transition-opacity duration-300 ${
                secretOpen ? 'opacity-0' : 'opacity-100'
              }`}
              aria-hidden={secretOpen}
            >
              Tap to unseal
            </span>
          </div>
          <div className="mt-2" style={{ borderTop: '1px solid var(--color-line-bone)' }} />

          <button
            type="button"
            onClick={() => {
              if (secretOpen) return;
              if (navigator.vibrate) navigator.vibrate(20);
              setSecretOpen(true);
            }}
            aria-expanded={secretOpen}
            aria-label={secretOpen ? 'Confidential note revealed' : 'Reveal your confidential note'}
            className={`relative block w-full text-left mt-4 ${
              secretOpen ? 'cursor-default' : 'er-press'
            }`}
          >
            {/* The note rises in as the bars clear rather than sitting fully
                formed behind them. */}
            {/* A killer's note addresses the player directly — it has to tell
                them, in words, that they did it — so it is not set as a quoted
                confession the way every other guest's secret is. */}
            <span
              className={`block font-note text-[18px] sm:text-[20px] leading-[1.35] text-ink ${
                secretOpen ? 'er-enter' : 'opacity-0'
              }`}
              style={secretOpen ? { animationDelay: '180ms' } : undefined}
            >
              {isMurderer ? myCharacter.secret : `“${myCharacter.secret}”`}
            </span>

            {/* Ragged marks, not one slab — see RedactedLines for why a
                paragraph needs a different form from a line. The killers' note
                runs longer, so it takes more marks to stay a redacted page
                rather than four bars stranded above blank paper. */}
            <RedactedLines open={secretOpen} widths={isMurderer ? KILLER_REDACT_WIDTHS : undefined} />
          </button>
        </section>

        {/* Footer stamps */}
        <div className="mt-8 pt-4 flex items-end justify-between gap-3" style={{ borderTop: '1px solid var(--color-line-bone)' }}>
          <span className="er-tag er-tag--onbone">Verified</span>
          <div className="text-right">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70">Case 8821-B</p>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 mt-1">Officer T. Mistry</p>
          </div>
        </div>
      </article>
    </div>
  );
};
