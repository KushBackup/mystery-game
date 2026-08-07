import React, { useState, useEffect } from 'react';
import { CLUE_DB, CASE_FILES, CLUE_STACKS, CLUE_STACK_BY_KEY, ASK_OPENS_AT } from '../../data/gameData';
import { EVIDENCE_STACKS } from '../../data/screenGuide';
import { TOOLTIPS } from '../../data/tooltips';
import { Numeral } from '../ui/Numeral';
import { InfoTip } from '../ui/InfoTip';
import { CaseFilesSection } from './CaseFilesSection';

/**
 * The evidence board (DESIGN_LANGUAGE.md §9, "Evidence").
 *
 * Every clue is a pinned bone card — it is diegetically a piece of paper, so
 * it gets the paper surface, a pushpin, a slight rotation and the one shadow
 * the system allows (§5). The clue *type* rides the 3px top border (§6.2) and
 * is spelled out in a mono tag; it never becomes a new hue.
 *
 * The screen is a **hub, not a list** (§6.11). It holds five stacks — accusations,
 * motives, evidence, revelations, and the host-released case files — and a flat
 * scroll cannot carry them: measured at 390px with everything released, the clues
 * alone are 31 cards and ~23,000px. So it opens on a grid of the five stacks and
 * you drill into one, the same tile → screen → close shape the main board uses.
 *
 * Which stack is open is **App.jsx state, not local state**, for one reason: on a
 * stack the screen's *title* is the stack's name, and App owns the screen frame
 * for every view in the app (§4.2). Keeping it here would have meant either three
 * stacked headings — Evidence, Evidence, Motives — or duplicating the whole frame
 * into this file.
 *
 * The two cards that are *yours* rather than found — the confession and your own
 * accusation — stay pinned on the hub instead of living in a stack. They are what
 * you perform out loud, so they are never behind a tap.
 *
 * Your accusation also *leads the Accusations stack*, which is the one place a
 * duplicate is right: the stack is where a player goes looking for an accusation,
 * and finding everyone's but their own there would read as a hole. It is dealt
 * rather than decoded, so it is added explicitly — `cluesIn` still drops the
 * host-revealed copy of the same clue, which is what stops it appearing twice.
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
 * Presentation for each stack, keyed to `CLUE_STACKS` in data/gameData.js (which
 * owns what a stack *contains*) and `EVIDENCE_STACKS` in data/screenGuide.js (which
 * owns what it is *called*). This map holds only what is neither: surface, tilt, and
 * the empty state.
 *
 * `sealedLines` is that empty state: two ragged marks, never more and never wide.
 * Three at 80%+ read as a field of red rather than a redacted page, which §2.2
 * forbids — and a stack with nothing in it has nothing else on screen to balance it.
 *
 * `hint` overrides the line under those marks. Accusations need their own: they are
 * the one stack outside the riddle reward pool (every player is dealt exactly one at
 * Round 1), so telling a player to go solve a riddle for one would be a lie.
 */
const STACK_STYLE = {
  accusations: {
    tone: 'bone',
    rot: 'er-rotL',
    sealedLines: [['Witness statement withheld', '66%'], ['Name redacted', '42%']],
    hint: 'Every other player was dealt an accusation of their own. Enter a code somebody reads out to collect it.',
  },
  motives: {
    tone: 'aged',
    rot: 'er-rotR',
    sealedLines: [['Motive undisclosed', '58%'], ['Financial record sealed', '71%']],
  },
  evidence: {
    tone: 'aged',
    rot: 'er-rotL',
    sealedLines: [['Toxicology pending', '62%'], ['Footage withheld', '46%']],
  },
  revelations: {
    tone: 'bone',
    rot: 'er-rotR',
    sealedLines: [['Medical record sealed', '68%'], ['Policy undisclosed', '50%']],
  },
};

// Module scope, so it survives the hub unmounting — which it does every time the
// player drills into a stack and backs out again, the most frequent navigation on
// this screen by a wide margin. The staggered landing plays once per session; every
// return after that is a single quick lift with no stagger (§7.1, and the same call
// GridMenu makes for the same reason).
let hubIntroPlayed = false;

const pad2 = (n) => String(n).padStart(2, '0');

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
      <p className="font-note text-[17px] sm:text-[19px] leading-[1.4] text-ink whitespace-pre-line">
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

/**
 * A stack tile on the hub.
 *
 * Paper, pinned and slightly rotated, like the main board — each tile *is* a stack
 * of case paper, so bone is the honest surface. The count is the display face in
 * `ink`, not brass: brass on bone is not a sanctioned pair (§2.3), while `ink` on
 * `bone` is the highest-contrast pair in the system at 15.78:1.
 *
 * A stack the game has not reached yet is not paper at all — it is ink carrying a
 * ghost tag with the round it opens (§6.1, "a state that is not yet true, drawn as
 * an outline rather than a fill"), and it is genuinely inert, because a tap that
 * only tells you it was sealed is a dead end.
 */
const StackTile = ({ label, sub, count, sealedUntil, tone, rot, wide, onClick, motion, delayMs }) => {
  const sealed = sealedUntil !== null;

  return (
    <button
      type="button"
      onClick={sealed ? undefined : onClick}
      disabled={sealed}
      className={`er-touch er-lift ${motion} relative w-full flex flex-col items-center justify-center gap-1.5 px-3 py-4 ${
        wide ? 'col-span-2' : ''
      } ${rot} ${
        sealed
          ? 'bg-ink-raised border border-line cursor-not-allowed'
          : tone === 'aged'
            ? 'er-bone er-bone--aged er-pin'
            : 'er-bone er-pin'
      }`}
      style={delayMs === null ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      {sealed ? (
        <span className="er-tag er-tag--ghost">Opens R{pad2(sealedUntil)}</span>
      ) : (
        // Display face, tabular, in ink — see the note above on brass and bone.
        <Numeral
          as="span"
          value={count}
          pad={2}
          className="font-display font-bold text-[30px] leading-none text-ink"
        />
      )}

      <span
        className={`font-typewriter font-bold uppercase leading-none text-[17px] sm:text-[19px] ${
          sealed ? 'text-bone' : 'text-ink'
        }`}
      >
        {label}
      </span>

      <span className={`er-mono ${sealed ? 'er-mono--dim' : 'text-signal-deep'}`}>{sub}</span>
    </button>
  );
};

/**
 * The two numbers the hub and an open stack both carry.
 *
 * One component for both because the tooltips are the point: "in play this
 * round" is a number nobody can interpret on sight, and it is the difference
 * between a stack that is empty because the player is behind and one that is
 * empty because the round has not opened it yet. Two hand-written copies of the
 * row would eventually explain that in two different ways.
 */
const EvidenceStat = ({ collected, inPlay }) => (
  <div className="er-stat flex items-end justify-between gap-4">
    <div>
      <Numeral as="p" value={collected} pad={2} className="er-stat__num" />
      <p className="er-stat__label flex items-center gap-2">
        Collected
        <InfoTip tip={TOOLTIPS.collected} />
      </p>
    </div>
    <div className="text-right">
      <Numeral as="p" value={inPlay} pad={2} className="er-stat__num" />
      <p className="er-stat__label flex items-center justify-end gap-2">
        In play this round
        <InfoTip tip={TOOLTIPS.inPlay} />
      </p>
    </div>
  </div>
);

/**
 * The line under the sealed marks, when the stack has no hint of its own.
 *
 * It names ASK only once ASK is on screen. The button does not exist before
 * Round 02 (ASK_OPENS_AT, data/gameData.js) because the lock has nothing to pay
 * out yet, and sending a player to hunt the corner for a control that isn't
 * there costs more than the shorter sentence does.
 */
const emptyHint = (askVisible) =>
  askVisible
    ? 'Solve a riddle with ASK to win one, or enter a code somebody has shared with you.'
    : 'Enter a code somebody reads out to collect one.';

/** A sealed page rather than a blank panel — §6.7, two ragged marks so red marks and never fills. */
const EmptyStack = ({ lines, title = 'Nothing decoded yet', hint }) => (
  <div className="er-card">
    <p className="er-mono er-mono--hot er-mono--wide">{title}</p>
    <div className="space-y-2.5 mt-4" aria-hidden="true">
      {lines.map(([line, width]) => (
        <div key={line} className="er-redact er-redact--sealed block" style={{ width }}>
          <span className="block font-body text-[15px] leading-[1.55] whitespace-nowrap overflow-hidden">
            {line}
          </span>
        </div>
      ))}
    </div>
    <p className="font-body text-[15px] leading-[1.55] text-dim mt-5">
      {hint}
    </p>
  </div>
);

export const IntelView = ({
  unlockedClues,
  myAccusation,
  confession,
  currentRound = 0,
  revealedClues = [],
  justUnlockedClue = null,
  unlockedFiles = [],
  // null = the hub. Otherwise a CLUE_STACKS key, or 'files'. Owned by App.jsx.
  stack = null,
  onOpenStack,
}) => {
  // Clues the player has decoded themselves, plus anything the host pushed out.
  const allAvailableClueIds = [...new Set([...unlockedClues, ...revealedClues])];
  const unlockedClueItems = CLUE_DB.filter((c) => allAvailableClueIds.includes(c.id));

  const reachable = CLUE_DB.filter((c) => c.roundReq <= currentRound && c.type !== 'CONFESSION').length;
  const hasAccusationYet = Boolean(myAccusation) && currentRound >= 1;
  const releasedFiles = CASE_FILES.filter((f) => unlockedFiles.includes(f.id)).length;

  // The player's own accusation is drawn from `myAccusation`, not from the decoded
  // set, so the found list drops it wherever it turns up — it is in ACCUSATION_CLUES
  // and the host can reveal those to the whole room, which would otherwise put the
  // same card on screen twice.
  const cluesIn = (def) =>
    unlockedClueItems.filter(
      (c) =>
        def.clues.some((s) => s.id === c.id) &&
        !(hasAccusationYet && myAccusation && c.id === myAccusation.id)
    );

  // …and it is added back at the head of the Accusations stack, where a player
  // looking for an accusation expects to find it. One predicate for both the tile
  // count and the stack, so the number on the hub can't disagree with the cards.
  const ownAccusationIn = (def) => hasAccusationYet && def.key === 'accusations';
  const countIn = (def) => cluesIn(def).length + (ownAccusationIn(def) ? 1 : 0);
  const collected = CLUE_STACKS.reduce((total, def) => total + countIn(def), 0);

  // State, not a ref: this is read during render to pick the animation, and refs
  // must not be read during render. The initialiser only *reads* the module flag
  // (so it stays pure, and StrictMode's double-invoke gets the same answer both
  // times); the effect below is what commits it.
  const [playIntro] = useState(() => !hubIntroPlayed);
  useEffect(() => {
    hubIntroPlayed = true;
  }, []);
  const tileMotion = playIntro ? 'er-land' : 'er-enter-quick';

  const back = (
    <button
      type="button"
      onClick={() => onOpenStack(null)}
      className="er-touch inline-flex items-center gap-2 min-h-[44px] er-mono er-mono--hot er-mono--wide"
    >
      <span aria-hidden="true">←</span> All evidence
    </button>
  );

  // --- A single stack, drilled into. App.jsx has already put its name in the
  //     screen title, so nothing here repeats it. ---

  if (stack === 'files') {
    return (
      <div className="space-y-5">
        {back}
        <CaseFilesSection unlockedFiles={unlockedFiles} />
      </div>
    );
  }

  if (stack) {
    const def = CLUE_STACK_BY_KEY[stack];
    const style = STACK_STYLE[stack];
    const items = cluesIn(def);
    const showMine = ownAccusationIn(def);
    const inPlay = def.clues.filter((c) => c.roundReq <= currentRound).length;

    // The freshly decoded card floats to the top of its stack — source order
    // otherwise buries it wherever it happens to sit in the database.
    const ordered = justUnlockedClue
      ? [
          ...items.filter((c) => c.id === justUnlockedClue),
          ...items.filter((c) => c.id !== justUnlockedClue),
        ]
      : items;

    return (
      <div className="space-y-5">
        {back}

        <EvidenceStat collected={items.length + (showMine ? 1 : 0)} inPlay={inPlay} />

        {/* Yours leads, under the same label the hub uses — it is the one card here
            you perform rather than collect, and the room's accusations arrive under
            a rule of their own so the two never read as one undifferentiated pile. */}
        {showMine && (
          <>
            <p className="er-mono er-mono--hot er-mono--wide">Yours alone</p>
            <ClueCard
              index={0}
              type="Your Accusation"
              title={myAccusation.title}
              body={myAccusation.accusation}
              code={`Code ${myAccusation.code}`}
              note="Share this out loud. It is what your character witnessed."
              pinBrass
            />
            {ordered.length > 0 && (
              <div className="pt-1">
                <div className="er-rule" />
                <p className="er-mono er-mono--hot er-mono--wide pt-3">From the room</p>
              </div>
            )}
          </>
        )}

        {ordered.map((clue, idx) => (
          <ClueCard
            key={clue.id}
            index={showMine ? idx + 1 : idx}
            type={clue.type}
            title={clue.title}
            body={clue.type === 'ACCUSATION' ? clue.accusation : clue.content}
            code={clue.code}
            fresh={clue.id === justUnlockedClue}
          />
        ))}

        {ordered.length === 0 && (
          <EmptyStack
            lines={style.sealedLines}
            title={showMine ? 'Nobody else’s yet' : 'Nothing decoded yet'}
            hint={style.hint || emptyHint(currentRound >= ASK_OPENS_AT)}
          />
        )}
      </div>
    );
  }

  // --- The hub ---

  const openStack = (key) => {
    // A 20ms buzz on tile tap is part of the product's texture (§4.3).
    if (navigator.vibrate) navigator.vibrate(20);
    onOpenStack(key);
  };

  return (
    <div className="space-y-5">
      {/* Stat — brass numeral over a mono label, hairline above (§6.6). Summed from
          the tiles rather than counted off the decoded set, so the total can never
          disagree with the four numbers sitting directly under it. */}
      <EvidenceStat collected={collected} inPlay={reachable} />

      {/* The five stacks. Case files spans the row: it is the official record
          rather than something you decoded, which is a different kind of thing —
          and it keeps the four clue stacks a clean 2×2. */}
      <div className="grid grid-cols-2 gap-3">
        {CLUE_STACKS.map((def, index) => (
          <StackTile
            key={def.key}
            label={EVIDENCE_STACKS[def.key].title}
            sub={EVIDENCE_STACKS[def.key].kicker}
            count={countIn(def)}
            sealedUntil={currentRound < def.opensAt ? def.opensAt : null}
            tone={STACK_STYLE[def.key].tone}
            rot={STACK_STYLE[def.key].rot}
            motion={tileMotion}
            delayMs={playIntro ? index * 60 : null}
            onClick={() => openStack(def.key)}
          />
        ))}

        <StackTile
          label={EVIDENCE_STACKS.files.title}
          sub={EVIDENCE_STACKS.files.kicker}
          count={releasedFiles}
          sealedUntil={null}
          tone="aged"
          rot=""
          wide
          motion={tileMotion}
          delayMs={playIntro ? CLUE_STACKS.length * 60 : null}
          onClick={() => openStack('files')}
        />
      </div>

      {/* The cards that are *yours* rather than found: the confession (murderer,
          Round 6) and your own accusation (Round 1+). One label over both — each
          card already names itself in its tag, so repeating the name here would
          say it twice. Never behind a tap: these are the lines you perform out
          loud, and at the moment the confession exists it is the most important
          card in the game. */}
      {(confession || hasAccusationYet) && (
        <>
          <div className="pt-1">
            <div className="er-rule" />
            <p className="er-mono er-mono--hot er-mono--wide pt-3">Yours alone</p>
          </div>

          {confession && (
            <ClueCard
              index={0}
              type="Confession"
              title={confession.title}
              body={confession.content}
              note="Only you can see this."
            />
          )}

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
        </>
      )}

      {/* There is no "your accusation is sealed" placeholder here any more. It was
          unreachable: App.jsx returns `myAccusation = null` for any round below 1,
          so its `myAccusation && currentRound < 1` condition could never be true.
          The Accusations tile stamped "Opens R01" now carries that message, and it
          carries it for the whole stack rather than just the player's own card. */}
    </div>
  );
};
