import { useEffect, useRef, useState } from 'react';

/**
 * A numeral that ticks to its new value instead of jumping.
 *
 * DESIGN_LANGUAGE.md §7 lists "brass numeral counts up" as one of the four
 * signature moments in the system; this is that moment. It is only ever used on
 * brass numerals, because brass is only ever a number (§2.2), which means it is
 * also the only thing in the app where a count is a legible animation at all.
 *
 * Two deliberate constraints:
 *
 * 1. It does NOT animate on mount. Every stat in this app sits on a screen the
 *    player opens and closes constantly, and a numeral that re-counts itself on
 *    every visit spends attention on a value they already read. Motion here
 *    marks a *change* — a vote landing, the host advancing the round — which is
 *    the only time it carries information. This falls out of the design rather
 *    than being special-cased: state starts *at* the target, so the effect's
 *    first run finds nothing to travel and returns.
 * 2. The whole tick fits inside 380ms, because §7 requires anything a player
 *    must read to be static within 400ms. The cubic ease-out spends most of
 *    that near the final value, so it is legible almost immediately.
 */

// Read per render rather than cached, so a player who flips the OS setting
// mid-game is honoured without a reload. Cheap enough to do this often.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DURATION = 380;

export const useCountUp = (target, duration = DURATION) => {
  const safeTarget = Number.isFinite(target) ? target : 0;

  const [display, setDisplay] = useState(safeTarget);

  // Where the numeral actually is on screen right now. Kept in a ref so an
  // interrupted run resumes from the value the player can see rather than from
  // the previous target — otherwise a second change mid-tick snaps backwards
  // before counting again. Only ever touched inside the effect and its frame
  // callback, never during render.
  const displayRef = useRef(safeTarget);
  const frameRef = useRef(0);

  const reduced = prefersReducedMotion();

  useEffect(() => {
    // Nothing to travel: either this is the mount, or the value came back to
    // where it already was.
    if (displayRef.current === safeTarget) return undefined;

    // Under reduced motion the hook returns the target directly (below), so
    // there is no animation to run and no state to push.
    if (reduced) return undefined;

    const from = displayRef.current;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Same family as --ease-enter: sharp off the mark, long settle.
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (safeTarget - from) * eased);

      displayRef.current = value;
      setDisplay(value);

      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [safeTarget, duration, reduced]);

  // Reduced motion short-circuits the whole mechanism instead of animating at a
  // collapsed duration — the value is simply always current. Cheaper and more
  // honest than a 1ms count, and it keeps `display` out of the picture entirely
  // rather than leaving it to be kept in sync for a path nobody renders.
  return reduced ? safeTarget : display;
};
