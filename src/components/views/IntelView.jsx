import React from 'react';
import { CLUE_DB } from '../../data/gameData';
import { Numeral } from '../ui/Numeral';
import { RedactedLines } from '../ui/RedactedLines';

/**
 * The evidence board (DESIGN_LANGUAGE.md §9, "Evidence").
 *
 * Every clue is a pinned bone card — it is diegetically a piece of paper, so
 * it gets the paper surface, a pushpin, a slight rotation and the one shadow
 * the system allows (§5). The clue *type* rides the 3px top border (§6.2) and
 * is spelled out in a mono tag; it never becomes a new hue.
 *
 * Nothing collected yet renders as sealed redaction bars rather than an empty
 * state, because "there is evidence you haven't found" is the truer message.
 */

// One hue, two depths: signal on the plot beats, signal-deep on the claims,
// ink on routine forensics. No type introduces a colour outside §2.1.
const TYPE_RULE = {
  CONFESSION: 'var(--color-signal)',
  REVELATION: 'var(--color-signal)',
  ACCUSATION: 'var(--color-signal-deep)',
  MOTIVE: 'var(--color-signal-deep)',
};
const ruleFor = (type) => TYPE_RULE[type] || 'var(--color-ink)';

/**
 * `fresh` marks the clue this device decoded most recently, and turns its
 * arrival into the §7 "clue unlocked" moment: the card lands with overshoot, the
 * 3px state rule sweeps across its top edge, and the statement rises in behind
 * the sweep instead of being there the whole time.
 *
 * It carries a static cue as well as the motion — the "Just unsealed" tag —
 * because a player who looks away for two seconds should still be able to tell
 * which card is new.
 */
const ClueCard = ({ index, type, title, body, code, note, pinBrass, fresh }) => (
  <article
    className={`er-bone er-pin ${pinBrass ? 'er-pin--brass' : ''} ${index % 2 === 0 ? 'er-rotR' : 'er-rotL'} er-land p-5 sm:p-6`}
    style={{
      borderTop: `3px solid ${ruleFor(type)}`,
      animationDelay: fresh ? '0ms' : `${Math.min(index, 6) * 70}ms`,
    }}
  >
    {fresh && <span className="er-unseal" aria-hidden="true" />}

    <div className="flex items-start justify-between gap-3">
      <span className="er-tag er-tag--onbone">{type}</span>
      {code && (
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 pt-1">
          {code}
        </span>
      )}
    </div>

    <h3 className="font-typewriter font-bold uppercase text-ink text-[19px] sm:text-[22px] leading-[1.15] mt-4">
      {title}
    </h3>
    <div className="er-bone-rule mt-3 mb-4" />

    {/* The statement arrives behind the sweep. Only the body is delayed — the
        title is legible from the first frame, so the card is never a card the
        player has to wait on to know what it is. */}
    <div className={fresh ? 'er-enter' : ''} style={fresh ? { animationDelay: '340ms' } : undefined}>
      <p className="font-handwriting text-[21px] sm:text-[24px] leading-[1.4] text-ink whitespace-pre-line">
        “{body}”
      </p>

      {note && <p className="er-bone-body text-[13px] mt-4">{note}</p>}
    </div>

    {fresh && (
      <p className="mt-4">
        <span className="er-tag er-tag--onbone">Just unsealed</span>
      </p>
    )}
  </article>
);

export const IntelView = ({
  unlockedClues,
  myAccusation,
  confession,
  currentRound = 0,
  revealedClues = [],
  justUnlockedClue = null,
}) => {
  // Clues the player has decoded themselves, plus anything the host pushed out.
  const allAvailableClueIds = [...new Set([...unlockedClues, ...revealedClues])];
  const unlockedClueItems = CLUE_DB.filter((c) => allAvailableClueIds.includes(c.id));

  // The clue just decoded floats to the top. CLUE_DB order otherwise buries a
  // new card wherever it happens to sit in the database, which on a board of a
  // dozen clues means the player lands on Evidence and has to hunt for the thing
  // they just typed a code in for.
  const orderedClues = justUnlockedClue
    ? [
        ...unlockedClueItems.filter((c) => c.id === justUnlockedClue),
        ...unlockedClueItems.filter((c) => c.id !== justUnlockedClue),
      ]
    : unlockedClueItems;

  const reachable = CLUE_DB.filter((c) => c.roundReq <= currentRound && c.type !== 'CONFESSION').length;
  const hasAccusationYet = Boolean(myAccusation) && currentRound >= 1;

  return (
    <div className="space-y-5">
      {/* Stat — brass numeral over a mono label, hairline above (§6.6). */}
      <div className="er-stat flex items-end justify-between gap-4">
        <div>
          <Numeral as="p" value={unlockedClueItems.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Collected</p>
        </div>
        <div className="text-right">
          <Numeral as="p" value={reachable} pad={2} className="er-stat__num" />
          <p className="er-stat__label">In play this round</p>
        </div>
      </div>

      {/* Confession — murderer only, Round 6 */}
      {confession && (
        <ClueCard
          index={0}
          type="Confession"
          title={confession.title}
          body={confession.content}
          note="Only you can see this."
        />
      )}

      {/* The player's own accusation card */}
      {hasAccusationYet && (
        <ClueCard
          index={1}
          type="Your Accusation"
          title={myAccusation.title}
          body={myAccusation.accusation}
          code={`Code ${myAccusation.code}`}
          note="Share this out loud. It is what your character witnessed."
          pinBrass
        />
      )}

      {/* Accusation not yet in play — sealed, not absent */}
      {myAccusation && currentRound < 1 && (
        <div className="er-card">
          <div className="flex items-center justify-between gap-3">
            <span className="er-tag er-tag--ghost">Sealed</span>
            <span className="er-mono er-mono--dim">Opens Round 01</span>
          </div>
          {/* Two ragged marks rather than one bar over both wrapped lines. */}
          <div className="relative mt-4 w-full" aria-hidden="true">
            <span className="block font-body text-[15px] leading-[1.55] opacity-0">
              Your accusation card is held until the first round opens.
            </span>
            <RedactedLines widths={['88%', '54%']} />
          </div>
          <p className="sr-only">Your accusation card is held until the first round opens.</p>
        </div>
      )}

      {/* Collected clues */}
      {orderedClues.map((clue, idx) => (
        <ClueCard
          key={clue.id}
          index={idx + 2}
          type={clue.type}
          title={clue.title}
          body={clue.type === 'ACCUSATION' ? clue.accusation : clue.content}
          code={clue.code}
          fresh={clue.id === justUnlockedClue}
        />
      ))}

      {/* Empty state — three sealed lines, so the board reads as redacted
          rather than blank (§6.7). */}
      {unlockedClueItems.length === 0 && !confession && !hasAccusationYet && (
        <div className="er-card">
          <p className="er-mono er-mono--hot er-mono--wide">Nothing decoded yet</p>
          {/* Ragged widths on single lines, so this reads as a redacted page
              rather than three slabs of red. Red marks; it doesn't fill. */}
          <div className="space-y-2.5 mt-4" aria-hidden="true">
            {[
              ['Witness statement withheld', '82%'],
              ['Forensics sealed', '54%'],
              ['Motive undisclosed', '68%'],
            ].map(([line, width]) => (
              <div key={line} className="er-redact er-redact--sealed block" style={{ width }}>
                <span className="block font-body text-[15px] leading-[1.55] whitespace-nowrap overflow-hidden">
                  {line}
                </span>
              </div>
            ))}
          </div>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-5">
            Enter a code from a printed card to unseal it.
          </p>
        </div>
      )}

      {unlockedClueItems.length === 0 && (confession || hasAccusationYet) && (
        <p className="font-body text-[15px] leading-[1.55] text-dim">
          Enter codes from printed cards to unseal more evidence.
        </p>
      )}
    </div>
  );
};
