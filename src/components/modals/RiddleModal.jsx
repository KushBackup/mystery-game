import React, { useState, useRef } from 'react';
import { X } from '../icons/IconComponents';
import { Numeral } from '../ui/Numeral';
import { dealRiddle, isCorrectAnswer, markRiddleSolved, solvedRiddleCount } from '../../data/riddles';
import { playSolveFanfare } from '../../lib/typeSound';

/**
 * The riddle lock — where clue codes come from now that nothing is printed.
 *
 * The old model was a host walking the room with three stacks of paper. This
 * replaces it: ASK deals a riddle that has nothing to do with the case, and a
 * correct answer unseals the next clue in this player's queue *and shows its
 * code*. The code is the point. One person solves, fifty people can type it in,
 * and the evening's economy is trade rather than distribution.
 *
 * Two design decisions worth keeping:
 *
 * **The prize is checked before the riddle is dealt.** `reward` arrives as a
 * prop, and when it is null the screen says so up front instead of dealing a
 * puzzle it cannot pay for. Making someone think for two minutes and then
 * telling them there was nothing behind the door is the one outcome this
 * feature must never produce.
 *
 * **Wrong answers cost nothing.** No lockout, no attempt limit, no penalty — and
 * after three misses the shape of the answer appears (first letter, one dash per
 * remaining character). The riddle is a toll booth on the way to the story, not
 * a skill gate; a player who cannot crack it must still end the evening with
 * evidence in their hands.
 */

/**
 * The celebration (App.css §16). Fourteen slivers, two rings.
 *
 * Angles are laid out on an even ring with a fixed per-index wobble rather than
 * `Math.random()`: the burst is generated during render and a random spread
 * would redraw itself on every keystroke behind the overlay. The wobble is what
 * stops fourteen evenly spaced spokes from reading as a clock face.
 */
const FLECK_TONES = [
  'var(--color-bone)',
  'var(--color-bone-aged)',
  'var(--color-brass)',
  'var(--color-signal)',
];

const FLECKS = Array.from({ length: 14 }, (_, i) => ({
  i,
  angle: Math.round(i * (360 / 14) + ((i * 37) % 23) - 11),
  distance: 74 + ((i * 29) % 58),
  tone: FLECK_TONES[i % FLECK_TONES.length],
}));

const Burst = () => (
  <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
    {[0, 1].map((i) => (
      <span key={i} className="er-burst" style={{ '--i': i }} />
    ))}
    {FLECKS.map(({ i, angle, distance, tone }) => (
      <span
        key={i}
        className="er-fleck"
        style={{ '--i': i, '--a': `${angle}deg`, '--d': `${distance}px`, '--fleck': tone }}
      />
    ))}
  </span>
);

/** First letter, then one dash per remaining character. Offered, never forced. */
const shapeOf = (answer) =>
  [answer[0].toUpperCase(), ...Array(answer.length - 1).fill('—')].join(' ');

export const RiddleModal = ({
  isOpen,
  // The clue a correct answer pays out, or null when this player already holds
  // everything the round has to give. Owned by App.jsx, which is the only place
  // that knows what is unlocked.
  reward,
  currentRound = 0,
  onSolved,
  onRead,
  onClose,
}) => {
  const [riddle, setRiddle] = useState(null);
  const [guess, setGuess] = useState('');
  const [misses, setMisses] = useState(0);
  // The clue actually won, snapshotted the moment it is won. It cannot be read
  // off `reward` afterwards: unlocking it is exactly what makes `reward` move on
  // to the next clue in the queue.
  const [won, setWon] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const shakeRef = useRef(null);

  // Restart `.er-shake` without touching React's tree. Removing the class,
  // reading a layout property to force the reflow, then re-adding it is the
  // only way to replay an animation whose class is already on the element.
  const shake = () => {
    const el = shakeRef.current;
    if (!el) return;
    el.classList.remove('er-shake');
    void el.offsetWidth;
    el.classList.add('er-shake');
  };

  // Open and close are handled during render rather than in an effect, the same
  // way App.jsx decides the briefing: an effect would paint one frame of the
  // previous question first, and setting state in an effect body is what this
  // repo's `react-hooks/set-state-in-effect` rule rejects outright.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    // Closing clears everything, so re-opening is a fresh question rather than
    // the one that was abandoned — and so a solve screen can't be walked back
    // into after the clue is already on the board.
    setRiddle(null);
    setGuess('');
    setMisses(0);
    setWon(null);
    setCopied(false);
  }

  if (!isOpen) return null;

  // Dealt at the last possible moment, and only once there is something to win.
  // Deriving it here rather than on open is what lets a round advancing while
  // the modal sits on its empty state turn straight into a live riddle.
  if (reward && !riddle && !won) {
    setRiddle(dealRiddle());
  }

  const next = () => {
    setRiddle(dealRiddle(riddle?.id ?? null));
    setGuess('');
    setMisses(0);
    inputRef.current?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!riddle || !reward) return;

    if (!isCorrectAnswer(riddle, guess)) {
      setMisses((n) => n + 1);
      setGuess('');
      shake();
      // A miss is a nudge, not a buzzer — 12ms, the shortest the platform will
      // honour, against the 20ms used for a successful tap elsewhere.
      if (navigator.vibrate) navigator.vibrate(12);
      inputRef.current?.focus();
      return;
    }

    markRiddleSolved(riddle.id);
    setWon(reward);
    playSolveFanfare();
    // Three ascending pulses under the three ascending bells.
    if (navigator.vibrate) navigator.vibrate([26, 55, 26, 55, 90]);
    onSolved(reward);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(won.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // No clipboard permission, or an insecure origin. The code is set in 30px
      // mono two lines up, so there is nothing to recover from — the player
      // reads it out, which is what most of them were going to do anyway.
    }
  };

  const shell = (children) => (
    <div
      className="er-fade fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-ink/95 px-4 pt-16 sm:pt-4 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Riddle lock"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="er-card er-card--signal er-land w-full max-w-md p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        {children}
      </div>
    </div>
  );

  const header = (kicker, title) => (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="er-mono er-mono--hot er-mono--wide">{kicker}</p>
          <h2 className="er-title text-[28px] mt-2">{title}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close riddle"
          className="er-touch flex items-center justify-center w-11 h-11 border border-line text-bone hover:border-signal hover:text-signal-lift shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      <div className="er-rule my-5" />
    </>
  );

  // --- Solved. The whole reason the screen exists. ---

  if (won) {
    return shell(
      <>
        {header('Cracked', 'Evidence Released')}

        <div className="er-solve flex flex-col items-center text-center py-2">
          <Burst />

          {/* The static half of the moment (§7.1): the seal says SOLVED whether
              or not a single frame of the burst ever renders. */}
          <span className="er-seal relative z-10 inline-flex items-center justify-center px-5 py-2 border-[3px] border-signal">
            <span className="font-display font-bold uppercase text-[30px] leading-none tracking-[0.06em] text-signal-lift">
              Solved
            </span>
          </span>
        </div>

        {/* The clue itself, on paper, because it is a document. */}
        <article className="er-bone er-pin er-rotL er-enter p-5 mt-5" style={{ animationDelay: '260ms' }}>
          <span className="er-tag er-tag--onbone">{won.type}</span>
          <h3 className="font-typewriter font-bold uppercase text-ink text-[19px] leading-[1.15] mt-4">
            {won.title}
          </h3>
          <div className="er-bone-rule mt-3 mb-4" />
          <p className="er-bone-body text-[13px]">
            Filed to your evidence board. Open it to read the whole thing.
          </p>
        </article>

        {/* The code. This is the part that leaves the phone — a solve that is
            only worth one clue to one player is a solve that did nothing for
            the room, and the room is the game. */}
        <div className="er-card er-card--brass er-enter mt-4 text-center" style={{ animationDelay: '400ms' }}>
          <p className="er-mono er-mono--hot er-mono--wide">Share this code</p>
          <p className="font-mono text-[26px] sm:text-[30px] font-medium tracking-[0.14em] uppercase text-bone mt-3 break-all">
            {won.code}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="er-touch inline-flex items-center justify-center min-h-[44px] mt-3 px-5 border border-line text-bone hover:border-signal hover:text-signal-lift er-mono er-mono--wide"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            Read it out, shout it across the room, put it in comms. Anyone who types it
            into the decoder gets this clue on their own phone.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onRead}
            className="er-touch er-touch--hot flex-1 bg-signal text-white py-4 px-4 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-signal"
          >
            Read it
          </button>
          <button
            type="button"
            onClick={() => {
              setWon(null);
              setCopied(false);
              next();
            }}
            disabled={!reward}
            className="er-touch flex-1 py-4 px-4 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-line text-bone hover:border-signal hover:text-signal-lift disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Another
          </button>
        </div>

        {!reward && (
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            That was the last clue this round has for you. Come back when the host moves
            the case on.
          </p>
        )}
      </>
    );
  }

  // --- Nothing left to win. Said before a riddle is ever dealt. ---

  if (!reward) {
    return shell(
      <>
        {header('Riddle Lock', 'Vault Empty')}

        <div className="space-y-2.5" aria-hidden="true">
          {[['Further evidence sealed', '64%'], ['Release pending', '44%']].map(([line, width]) => (
            <div key={line} className="er-redact er-redact--sealed block" style={{ width }}>
              <span className="block font-body text-[15px] leading-[1.55] whitespace-nowrap overflow-hidden">
                {line}
              </span>
            </div>
          ))}
        </div>

        <p className="font-body text-[15px] leading-[1.55] text-dim mt-5">
          {currentRound < 2
            ? 'The riddle lock opens in Round 02, when the motive files are released. Nothing to win yet.'
            : 'You already hold every clue this round can give you. Wait for the host to advance, then come back.'}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="er-touch w-full mt-6 py-4 px-6 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-line text-bone hover:border-signal hover:text-signal-lift"
        >
          Back to the board
        </button>
      </>
    );
  }

  // --- The question. ---

  return shell(
    <>
      {header('Riddle Lock', 'Answer This')}

      <div className="er-stat flex items-end justify-between gap-4">
        <div>
          <Numeral as="p" value={solvedRiddleCount()} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Riddles solved</p>
        </div>
        <div className="text-right">
          <p className="er-mono er-mono--hot">One clue</p>
          <p className="er-stat__label">Waiting behind this</p>
        </div>
      </div>

      {/* The riddle is a card handed to you, so it is paper. It is also the one
          thing on this screen to read, which is why it gets the note face at
          19px rather than the 15px body copy everything else here uses. */}
      <article className="er-bone er-pin er-rotR er-land p-5 sm:p-6 mt-5">
        <span className="er-tag er-tag--onbone">Riddle</span>
        <p className="font-note text-[19px] sm:text-[21px] leading-[1.4] text-ink mt-4">
          {riddle?.q}
        </p>
      </article>

      <form onSubmit={submit} className="mt-6">
        <label className="er-mono er-mono--dim block mb-3" htmlFor="riddle-answer">
          One word
        </label>

        {/* The placeholder is one dash per letter of the answer. A fixed run of
            six was quietly lying about every riddle whose answer wasn't six
            letters long — players do count them, and on a one-word puzzle the
            length is the cheapest honest hint the screen can give.

            The shake is applied imperatively (see `shake()` above) rather than
            through a `key` or a className toggle. Both of those remount or
            re-render the subtree, and the input is inside it — a wrong answer
            would blur the field and dismiss the keyboard, which is the opposite
            of what "try again" should feel like. className stays constant here
            so React never patches the class the reflow trick just added. */}
        <div ref={shakeRef}>
          <input
            id="riddle-answer"
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={riddle ? '—'.repeat(riddle.a.length) : ''}
            className="er-blank w-full text-center text-[26px] font-medium py-3 px-2"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
          />
        </div>

        <button
          type="submit"
          disabled={!guess.trim()}
          className="er-touch er-touch--hot w-full mt-6 bg-signal text-white py-4 px-6 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border border-signal disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Answer
        </button>
      </form>

      {misses > 0 && (
        <p className="er-mono er-mono--hot mt-4" role="status">
          Not it — {misses === 1 ? 'one miss' : `${misses} misses`}. Nothing is lost. Try again.
        </p>
      )}

      {/* The shape of the answer, after three. A hint given too early makes the
          riddle pointless; a hint never given makes the evidence unreachable for
          anyone who simply does not think in riddles. */}
      {misses >= 3 && riddle && (
        <div className="er-card er-card--aged mt-4">
          <p className="er-mono er-mono--dim">Shape of the answer</p>
          <p className="font-mono text-[20px] tracking-[0.2em] text-bone mt-2">{shapeOf(riddle.a)}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-5">
        <button
          type="button"
          onClick={next}
          className="er-touch inline-flex items-center gap-2 min-h-[44px] er-mono er-mono--hot er-mono--wide"
        >
          <span aria-hidden="true">↻</span> Another riddle
        </button>
        <p className="er-mono er-mono--dim text-right">Same prize</p>
      </div>

      <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
        Solve it and the clue unseals on your board — along with a code you can give to
        anybody in the room.
      </p>
    </>
  );
};
