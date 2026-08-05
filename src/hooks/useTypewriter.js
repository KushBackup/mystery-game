import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Reveals a string one character at a time, on a schedule that reads like typing
 * rather than like a progress bar.
 *
 * Built the same way as useCountUp: one requestAnimationFrame loop inside an
 * effect, and `prefers-reduced-motion` short-circuits the whole mechanism at the
 * return value instead of running at a collapsed duration. Two reasons rAF beats
 * a chain of setTimeouts here — a timeout chain drifts (26ms requested is never
 * 26ms delivered, and the error compounds over 200 characters), and it keeps
 * queueing after the component is torn down mid-slide.
 *
 * Deliberate details:
 *
 * 1. **Punctuation holds.** A comma is worth five characters of silence and a
 *    full stop about nine. Without those the line arrives at a constant rate,
 *    which is the thing that makes most typewriter effects feel mechanical.
 * 2. **One click per frame, not per character.** When a dropped frame makes the
 *    reveal catch up by two or three characters, the caller is told about the
 *    last one only — three clicks in the same millisecond is a glitch, not typing.
 * 3. **The text can change under it.** The state carries the string it belongs
 *    to and is reset during render when a new one arrives (React's documented
 *    "adjust state when a prop changes" pattern). An effect doing the same reset
 *    would both flash the previous slide's tail for a frame and trip
 *    `react-hooks/set-state-in-effect`.
 */

// Extra milliseconds held *after* a character. Tuned by ear against Courier
// Prime at 16px: the em dash and the line break are the two big beats.
const PAUSE_AFTER = {
  ',': 120,
  ';': 150,
  ':': 150,
  '—': 210,
  '.': 240,
  '?': 260,
  '!': 260,
  '\n': 280,
};

// Per-character wobble, ± this many ms. Small enough to stay a rhythm, large
// enough that no two lines type identically.
const JITTER_MS = 7;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Absolute reveal time for every character, precomputed once. Cheaper than
 * deciding per frame, and it makes the loop a plain "how far should we be by
 * now" comparison, so a dropped frame catches up instead of falling behind.
 */
const buildSchedule = (text, charMs) => {
  const times = new Float64Array(text.length);
  let elapsed = 0;

  for (let i = 0; i < text.length; i += 1) {
    elapsed += charMs + (Math.random() * 2 - 1) * JITTER_MS;
    times[i] = elapsed;
    elapsed += PAUSE_AFTER[text[i]] || 0;
  }

  return times;
};

export const useTypewriter = (text, { charMs = 26, onChar } = {}) => {
  const reduced = prefersReducedMotion();

  const [state, setState] = useState({ text, shown: 0 });

  // Render-phase reset: a new string starts from zero in the same render it
  // arrives, so the outgoing slide's characters are never visible under the
  // incoming one's heading.
  if (state.text !== text) {
    setState({ text, shown: 0 });
  }

  const shown = state.text === text ? state.shown : 0;

  const schedule = useMemo(() => buildSchedule(text, charMs), [text, charMs]);

  // Kept in a ref so a caller that rebuilds its callback every render doesn't
  // restart the typing loop.
  const onCharRef = useRef(onChar);
  useEffect(() => {
    onCharRef.current = onChar;
  }, [onChar]);

  // Set by finish() so the frame loop stops pushing its own (lower) count and
  // the text can't rewind. Reset when a new string arrives.
  const filledRef = useRef(false);

  const finish = useCallback(() => {
    filledRef.current = true;
    setState({ text, shown: text.length });
  }, [text]);

  useEffect(() => {
    if (reduced || !text.length) return undefined;

    filledRef.current = false;

    let frame = 0;
    let index = 0;
    const start = performance.now();

    const tick = (now) => {
      if (filledRef.current) return;

      const elapsed = now - start;
      let advanced = false;

      while (index < schedule.length && elapsed >= schedule[index]) {
        index += 1;
        advanced = true;
      }

      if (advanced) {
        // Guarded on the string so a queued frame from the previous slide can
        // never write into the current one.
        setState((prev) => (prev.text === text ? { text, shown: index } : prev));
        onCharRef.current?.(text[index - 1]);
      }

      if (index < schedule.length) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, schedule, reduced]);

  return {
    shown: reduced ? text.length : shown,
    done: reduced ? true : shown >= text.length,
    finish,
  };
};
