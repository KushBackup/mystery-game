import React from 'react';
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
 * The screen is a **round-aware tabbed file**. Categories do not appear until
 * their round is live: a player in Round 01 sees Accusations and Case files,
 * then Motives joins in Round 02, Evidence in Round 03, and Revelations in
 * Round 04. Hidden categories are less confusing than locked controls, and a
 * tab change keeps the player in the same Evidence surface instead of making
 * them navigate through a grid and a second screen.
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
const ClueCard = ({ index, type, title, body, code, note, pinBrass, fresh, tutorialTarget }) => (
  <article
    data-tutorial-cue={tutorialTarget ? 'Read your lead' : undefined}
    className={`er-bone er-pin ${tutorialTarget ? 'er-tutorial-target er-tutorial-target--onbone' : ''} ${pinBrass ? 'er-pin--brass' : ''} ${index % 2 === 0 ? 'er-rotR' : 'er-rotL'} er-land p-5 sm:p-6`}
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
  tutorialActive = false,
}) => {
  // Clues the player has decoded themselves, plus anything the host pushed out.
  const allAvailableClueIds = [...new Set([...unlockedClues, ...revealedClues])];
  const unlockedClueItems = CLUE_DB.filter((c) => allAvailableClueIds.includes(c.id));

  const hasAccusationYet = Boolean(myAccusation) && currentRound >= 1;

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

  // …and it is added back at the head of the Accusations tab, where a player
  // looking for an accusation expects to find it.
  const ownAccusationIn = (def) => hasAccusationYet && def.key === 'accusations';
  const availableStacks = CLUE_STACKS.filter((def) => currentRound >= def.opensAt);
  const tabs = [
    ...availableStacks.map((def) => ({ key: def.key, label: EVIDENCE_STACKS[def.key].title })),
    { key: 'files', label: EVIDENCE_STACKS.files.title },
    ...(confession ? [{ key: 'personal', label: 'Your file' }] : []),
  ];
  const defaultTab = availableStacks.at(-1)?.key || 'files';
  const activeStack = tabs.some((tab) => tab.key === stack) ? stack : defaultTab;

  const selectStack = (key) => {
    if (navigator.vibrate) navigator.vibrate(20);
    onOpenStack(key);
  };

  const activeDef = CLUE_STACK_BY_KEY[activeStack];
  const items = activeDef ? cluesIn(activeDef) : [];
  const showMine = activeDef ? ownAccusationIn(activeDef) : false;
  const inPlay = activeDef ? activeDef.clues.filter((clue) => clue.roundReq <= currentRound).length : 0;
  const ordered = justUnlockedClue
    ? [
        ...items.filter((clue) => clue.id === justUnlockedClue),
        ...items.filter((clue) => clue.id !== justUnlockedClue),
      ]
    : items;

  return (
    <div className="space-y-5">
      <div className="-mx-4 px-4 overflow-x-auto custom-scrollbar" role="tablist" aria-label="Evidence categories">
        <div className="flex gap-2 w-max min-w-full">
          {tabs.map((tab) => {
            const selected = activeStack === tab.key;
            const tutorialTarget = tutorialActive && tab.key === 'accusations';
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectStack(tab.key)}
                data-tutorial-cue={tutorialTarget ? 'Start here' : undefined}
                className={`er-touch h-11 shrink-0 px-4 border font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
                  selected
                    ? 'bg-ink-hover border-signal text-signal-lift'
                    : 'bg-ink-raised border-line text-dim hover:border-signal hover:text-bone'
                } ${tutorialTarget ? 'er-tutorial-target' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeStack === 'files' && <CaseFilesSection unlockedFiles={unlockedFiles} />}

      {activeStack === 'personal' && confession && (
        <ClueCard
          index={0}
          type="Confession"
          title={confession.title}
          body={confession.content}
          note="Only you can see this."
        />
      )}

      {activeDef && (
        <>
          <EvidenceStat collected={items.length + (showMine ? 1 : 0)} inPlay={inPlay} />

          {showMine && (
            <>
              <p className="er-mono er-mono--hot er-mono--wide">Your lead</p>
              <ClueCard
                index={0}
                type="Your Accusation"
                title={myAccusation.title}
                body={myAccusation.accusation}
                code={`Code ${myAccusation.code}`}
                note="Share this out loud. It is what your character witnessed."
                pinBrass
                tutorialTarget={tutorialActive}
              />
              {ordered.length > 0 && (
                <div className="pt-1">
                  <div className="er-rule" />
                  <p className="er-mono er-mono--hot er-mono--wide pt-3">From the room</p>
                </div>
              )}
            </>
          )}

          {ordered.map((clue, index) => (
            <ClueCard
              key={clue.id}
              index={showMine ? index + 1 : index}
              type={clue.type}
              title={clue.title}
              body={clue.type === 'ACCUSATION' ? clue.accusation : clue.content}
              code={clue.code}
              fresh={clue.id === justUnlockedClue}
            />
          ))}

          {ordered.length === 0 && (
            <EmptyStack
              lines={STACK_STYLE[activeDef.key].sealedLines}
              title={showMine ? 'Nobody else’s yet' : 'Nothing decoded yet'}
              hint={STACK_STYLE[activeDef.key].hint || emptyHint(currentRound >= ASK_OPENS_AT)}
            />
          )}
        </>
      )}
    </div>
  );
};
