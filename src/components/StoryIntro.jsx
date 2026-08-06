import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoundOn, SoundOff } from './icons/IconComponents';
import { RoundRail } from './ui/RoundRail';
import { STORY_SLIDES, STORY_TYPE_MS } from '../data/storyIntro';
import { useTypewriter } from '../hooks/useTypewriter';
import {
  isTypeSoundOn,
  playKeyClick,
  playReturnClick,
  playTypeBell,
  primeTypeSound,
  setTypeSoundOn,
} from '../lib/typeSound';

/**
 * The cold open's second half: the case, typed out.
 *
 * Takes over the whole screen for a player who logs in while the game is still
 * in Round 0, and is reachable again afterwards from the Story screen. Copy and
 * pacing live in data/storyIntro.js; the machinery is hooks/useTypewriter.js and
 * lib/typeSound.js.
 *
 * Where it sits in the design system (DESIGN_LANGUAGE.md):
 *
 * - **Ink and nothing else.** No paper. This is the one screen that is neither
 *   chrome nor a document — it is the room going dark before the game starts, so
 *   it gets the vignette and the grain and skips the brass lamp the rest of the
 *   app wears, which is what makes it read as black rather than as lit.
 * - **The typed text is in-fiction, so it takes the in-fiction voices** (§3.1):
 *   Special Elite for the heading, Courier Prime for the body. The display face
 *   is deliberately absent — it belongs to chrome and numerals.
 * - **It breaks §7's "static within 400ms" on purpose**, the same way the
 *   murderer reveal breaks "red never fills a large area". A typed line is the
 *   point of the screen. The escape hatches are what make that affordable: a tap
 *   fills the slide instantly, Skip leaves entirely, and under
 *   `prefers-reduced-motion` every slide arrives already complete.
 * - **The blinking caret ends with the typing** (§7.1 — only a genuine sustained
 *   alarm repeats forever). Its presence *is* the "still typing" state; when the
 *   slide finishes it is replaced by the static cue to move on.
 *
 * Navigation is three overlapping ways to do the same thing, because a room of
 * 51 people will try all three: swipe left/right, tap anywhere (fill, then
 * advance), and the explicit control in the footer. Arrow keys and Escape work
 * too — that is how the host checks the screen on a laptop.
 */

// Horizontal travel that counts as a swipe rather than a tap that wandered.
const SWIPE_MIN_PX = 48;
// A tap that moved more than this is a drag, and must not also fire "advance".
const TAP_SLOP_PX = 12;
// Touch devices synthesise a click after touchend; ignore clicks that arrive in
// this window, or every swipe would also advance a second time.
const GHOST_CLICK_MS = 500;

/**
 * Flattens a slide into one typed stream plus the ranges each block owns, so the
 * heading and the body lines share a single rhythm instead of each restarting.
 * The `+ 1` is the newline that joins them — it gets its own pause and its own
 * carriage sound.
 */
const buildSlide = (slide) => {
  const parts = [
    { role: 'head', text: slide.heading },
    ...slide.lines.map((text) => ({ role: 'line', text })),
  ];

  let cursor = 0;
  const blocks = parts.map((part) => {
    const start = cursor;
    cursor += part.text.length + 1;
    return { ...part, start, end: start + part.text.length };
  });

  return { blocks, text: parts.map((part) => part.text).join('\n') };
};

export const StoryIntro = ({
  slides = STORY_SLIDES,
  onExit,
  exitLabel = 'Skip',
  finalLabel = 'Begin',
}) => {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(() => isTypeSoundOn());

  const slide = slides[index];
  const { blocks, text } = useMemo(() => buildSlide(slide), [slide]);

  const handleChar = useCallback((char) => {
    if (char === '\n') playReturnClick();
    // Spaces are silent: on a real machine the space bar is the quietest key,
    // and clicking on them makes the rhythm sound wrong.
    else if (char !== ' ') playKeyClick();
  }, []);

  const { shown, done, finish } = useTypewriter(text, {
    charMs: STORY_TYPE_MS,
    onChar: handleChar,
  });

  const isLast = index === slides.length - 1;

  // The margin bell marks a finished slide. Fires on the transition into `done`,
  // which the render-phase reset in useTypewriter guarantees happens once per
  // slide rather than once per session.
  useEffect(() => {
    if (!done) return;
    playTypeBell();
  }, [done]);

  // Autoplay policy: a page that was reloaded by the host's force-sync has had no
  // gesture at all, so this may be a no-op and the first tap is what unlocks the
  // context.
  useEffect(() => {
    if (soundOn) primeTypeSound();
  }, [soundOn]);

  const next = useCallback(() => {
    if (index + 1 < slides.length) {
      if (navigator.vibrate) navigator.vibrate(12);
      setIndex(index + 1);
    } else {
      onExit();
    }
  }, [index, slides.length, onExit]);

  const prev = useCallback(() => {
    if (index === 0) return;
    if (navigator.vibrate) navigator.vibrate(12);
    setIndex(index - 1);
  }, [index]);

  // One gesture, two meanings, in the order a player expects: first tap catches
  // the text up, second one moves on.
  const advance = useCallback(() => {
    if (done) next();
    else finish();
  }, [done, next, finish]);

  const touchRef = useRef(null);
  const lastTouchAtRef = useRef(0);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, moved: false };
    primeTypeSound();
  };

  const handleTouchMove = (event) => {
    const startPoint = touchRef.current;
    if (!startPoint) return;
    const touch = event.touches[0];
    if (
      Math.abs(touch.clientX - startPoint.x) > TAP_SLOP_PX ||
      Math.abs(touch.clientY - startPoint.y) > TAP_SLOP_PX
    ) {
      startPoint.moved = true;
    }
  };

  const handleTouchEnd = (event) => {
    const startPoint = touchRef.current;
    touchRef.current = null;
    lastTouchAtRef.current = performance.now();
    if (!startPoint) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - startPoint.x;
    const dy = touch.clientY - startPoint.y;

    // Horizontal-dominant travel is a swipe; anything else that didn't move is a tap.
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
      return;
    }

    if (!startPoint.moved) advance();
  };

  const handleClick = () => {
    if (performance.now() - lastTouchAtRef.current < GHOST_CLICK_MS) return;
    // The mouse path to the same unlock the touch handler does.
    primeTypeSound();
    advance();
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      // Let a focused control handle its own Enter/Space, or the footer button
      // would advance twice.
      if (event.target instanceof HTMLElement && event.target.closest('button')) return;

      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        advance();
      } else if (event.key === 'ArrowLeft') {
        prev();
      } else if (event.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, prev, onExit]);

  const toggleSound = (event) => {
    event.stopPropagation();
    const nextOn = !soundOn;
    setSoundOn(nextOn);
    setTypeSoundOn(nextOn);
    // Turning it on plays one click, so the choice is confirmed by the thing
    // being chosen.
    if (nextOn) playKeyClick();
  };

  // The block currently taking characters — the last one the reveal has reached.
  let caretBlock = 0;
  blocks.forEach((block, i) => {
    if (shown > block.start) caretBlock = i;
  });

  const SoundIcon = soundOn ? SoundOn : SoundOff;

  // `touch-action: none`, not `manipulation`: a rightward swipe that starts near
  // the left edge is Chrome's history-back gesture, and it wins over any handler
  // here — measured, it replaced the whole document, so a player swiping back one
  // slide was thrown out of the app entirely. Nothing on this screen scrolls, and
  // the same text is a normally zoomable document on the Story screen, so giving up
  // the browser's touch defaults here costs nothing.
  return (
    <div
      className="fixed inset-0 z-[90] bg-ink er-grain overflow-hidden flex flex-col select-none"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <div className="er-vignette" aria-hidden="true" />

      {/* Chrome rail (§4.2): mono label left, state right, hairline underneath —
          then the slide rail, which is the round rail's markup doing the same job
          for a different sequence. */}
      <div className="relative z-10 px-5 pt-5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="er-mono er-mono--wide er-mono--bone">Case Briefing</span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSound}
              // The label says what the tap will do rather than what the state is,
              // so it carries the whole meaning on its own — `aria-pressed` beside a
              // label that changes announces as "mute, pressed", which is worse.
              aria-label={soundOn ? 'Mute the typing sound' : 'Unmute the typing sound'}
              className="er-touch flex items-center justify-center w-11 h-11 text-dim hover:text-bone"
            >
              <SoundIcon size={19} strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onExit();
              }}
              className="er-touch er-mono er-mono--dim px-3 h-11 hover:text-bone"
            >
              {exitLabel}
            </button>
          </div>
        </div>

        <div className="er-rule mt-3" />
        <RoundRail currentRound={index} total={slides.length} className="mt-3" />
      </div>

      {/* The slide. Keyed so each one remounts and rises in (§7) while its first
          characters are still arriving. */}
      <main className="relative z-10 flex-1 flex items-center px-5 min-h-0">
        <div key={slide.id} className="er-enter w-full">
          <div aria-hidden="true">
            <p className="er-mono er-mono--hot er-mono--wide">{slide.kicker}</p>

            <div className="mt-3.5">
              {blocks.map((block, i) => {
                const revealed = Math.max(
                  0,
                  Math.min(block.text.length, shown - block.start),
                );
                const Tag = block.role === 'head' ? 'h2' : 'p';

                return (
                  <Tag
                    key={block.start}
                    className={`er-type ${
                      block.role === 'head' ? 'er-story-head' : 'er-story-line'
                    } ${i === 0 ? '' : 'mt-4'}`}
                  >
                    {/* The full line, invisible but in flow: it reserves the
                        height, so a word wrapping does not shove the rest of the
                        slide down mid-sentence. */}
                    <span className="er-type__ghost">{block.text}</span>
                    <span className="er-type__ink">
                      {block.text.slice(0, revealed)}
                      {!done && caretBlock === i && <i className="er-caret" />}
                    </span>
                  </Tag>
                );
              })}
            </div>

            {slide.note && done && (
              <p className="font-note text-signal-lift text-[17px] mt-5 -rotate-1 origin-left er-enter">
                {slide.note}
              </p>
            )}
          </div>

          {/* The visual slide is a half-typed animation, so it is hidden from
              assistive tech and the finished text is announced here instead. */}
          <div className="sr-only" aria-live="polite">
            {`${slide.kicker}. ${slide.heading}. ${slide.lines.join(' ')}`}
          </div>
        </div>
      </main>

      {/* Footer rail — closes the frame. Slide count is a number, so it is brass.
          The bottom inset is inline rather than `pb-8 pb-safe`: `.pb-safe` is
          unlayered CSS, so it beats every Tailwind padding utility and would
          collapse the gap to zero on any phone without a home indicator. */}
      <div
        className="relative z-10 px-5 pt-4 shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 26px)' }}
      >
        <p className="er-mono er-mono--dim mb-3">
          {done ? 'Swipe or tap to continue' : 'Tap to fill this page'}
        </p>

        <div className="er-rule" />

        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="er-num text-xl">{String(index + 1).padStart(2, '0')}</span>
            <span className="er-mono">/ {String(slides.length).padStart(2, '0')}</span>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              advance();
            }}
            className={`er-touch er-mono px-4 h-11 border ${
              done
                ? 'border-signal text-signal-lift hover:bg-signal hover:text-white'
                : 'border-line text-dim hover:text-bone'
            }`}
          >
            {done ? (isLast ? finalLabel : 'Next') : 'Reveal'}
          </button>
        </div>
      </div>
    </div>
  );
};
