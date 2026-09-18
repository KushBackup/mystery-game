import React, { useEffect, useRef, useState } from 'react';
import { CASE_META } from '../data/gameData';
import { COUNTDOWN_MS, countdownSeconds, startPhase } from '../lib/gameStart';

/**
 * Standby — what a player looks at between logging in and the host starting the
 * room (lib/gameStart.js for the model).
 *
 * It is deliberately the emptiest screen in the app. There is nothing to read,
 * nothing to tap and nothing to get wrong, because the whole point of it is to
 * stop 69 people wandering an app that has no evidence in it yet and deciding
 * it is broken. One sentence, and then a countdown.
 *
 * Three decisions worth keeping:
 *
 * **It is mounted keyed on the start instant** (see App.jsx). A change from
 * "not started" to "started" is a scene change, not a prop update, and keying
 * it means `now` is re-read fresh at that moment rather than carried over from
 * whenever the player happened to log in. Without that, a device handed a start
 * that is *already past* — the host's escape hatch — would measure it against a
 * stale `now` and flash a countdown it does not owe.
 *
 * **The countdown is the §7.1 clock rule, not a new one.** Each second remounts
 * the numeral and plays exactly one `erClockPush` — ten beats, and then it stops
 * because there is nothing left to count. Nothing here is `infinite`, and the
 * static half carries it anyway: the number is the number.
 *
 * **It hands the screen over on `animationend`, with a timer behind it.** The
 * event is the primary path because under `prefers-reduced-motion` the fade
 * collapses to nothing and it still fires, so the player is let in immediately
 * instead of staring at a screen that finished fading 600ms ago. The timer is
 * there because the failure mode of the event alone is unacceptable at an
 * event: one phone that never fires it is one player sitting behind a fully
 * transparent curtain with no way past it, all evening. Releasing twice is a
 * no-op, so the two can race safely.
 */

// Faster than the display, for the same reason useRoundClock ticks at 250ms
// against a 1s readout: the second boundary is never more than a quarter second
// late, so the per-second pop lands on the number rather than after it.
const TICK_MS = 250;

// The backstop behind `animationend`, comfortably past the 600ms curtain in
// App.css §13d. Long enough that it never beats the animation on a device that
// is working, short enough that a device where it doesn't is only a beat late.
const RELEASE_FALLBACK_MS = 1200;

// Said once, to a screen reader, at each of the two states that mean something.
// Deliberately not per-second — a live region counting down out loud is the
// definition of unusable, and the digits below are hidden from the reader.
const PHASE_ANNOUNCEMENT = {
  standby: 'Waiting for the host to start the game.',
  counting: 'The host has started the game. It opens in a few seconds.',
  live: '',
};

export const StandbyScreen = ({ startedAt = 0, onRelease }) => {
  const [now, setNow] = useState(() => Date.now());

  // Held in a ref for the reason SplashScreen documents: App passes this as an
  // inline arrow, so its identity changes on every render of App — and App
  // re-renders whenever a chat message lands. An effect depending on the
  // callback directly would tear down and re-arm on every one of them.
  const onReleaseRef = useRef(onRelease);
  useEffect(() => {
    onReleaseRef.current = onRelease;
  }, [onRelease]);

  // Ticks only while there is a countdown to run, and retires itself at the end
  // — a player who arrives before the host has pressed anything may sit here for
  // twenty minutes, and that must cost their phone nothing at all.
  useEffect(() => {
    if (!startedAt) return undefined;

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= startedAt + COUNTDOWN_MS) clearInterval(id);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [startedAt]);

  const phase = startPhase(startedAt, now);
  const armed = Boolean(startedAt);
  const leaving = phase === 'live';
  const seconds = countdownSeconds(startedAt, now);

  // Derived rather than stored, so the curtain never has to be set from inside
  // an effect — which is what `react-hooks/set-state-in-effect` rejects, and
  // which would also have made "is it leaving?" answerable two ways.
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => onReleaseRef.current?.(), RELEASE_FALLBACK_MS);
    return () => clearTimeout(id);
  }, [leaving]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-ink flex items-center justify-center px-6 er-grain ${
        leaving ? 'er-standby--leaving' : ''
      }`}
      // The guard is what stops the inner entrance — and the countdown's own
      // per-second pop, which also bubbles — from handing the screen over
      // before the curtain has actually come down.
      onAnimationEnd={(event) => {
        if (leaving && event.target === event.currentTarget) onReleaseRef.current?.();
      }}
    >
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-vignette" aria-hidden="true" />

      {/* No entrance on the way out: a screen cannot arrive and leave at once,
          and the two animations would fight over the same opacity. */}
      <div className={`relative z-10 w-full max-w-md text-center ${leaving ? '' : 'er-enter'}`}>
        <p className="er-mono er-mono--hot er-mono--wide">Case {CASE_META.caseId}</p>
        <div className="er-rule my-5" />

        {armed ? (
          <>
            <h1 className="er-title text-[24px] sm:text-[30px]">The game begins in</h1>
            {/* Keyed on the second so each one remounts and plays a single
                push (App.css §13d). Hidden from the reader — the announcement
                below carries it without counting out loud. */}
            <span
              key={seconds}
              className="er-num er-standby__count block mt-6 text-[88px] sm:text-[112px]"
              aria-hidden="true"
            >
              {seconds}
            </span>
          </>
        ) : (
          <h1 className="er-title text-[26px] sm:text-[34px]">
            Waiting for the host to start the game
          </h1>
        )}

        <div className="er-rule my-6" />

        <p className="font-body text-[15px] leading-[1.55] text-dim">
          {armed
            ? 'Stay on this screen. Your case file opens by itself.'
            : 'Keep this screen open. The room opens the moment the host starts it.'}
        </p>

        <span className="sr-only" role="status">
          {PHASE_ANNOUNCEMENT[phase] || ''}
        </span>
      </div>
    </div>
  );
};
