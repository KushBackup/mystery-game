import { useEffect, useState } from 'react';
import { clockPhase, formatClock, isRunning, remainingMs } from '../lib/roundTimer';

/**
 * The ticking half of the round clock. The model is lib/roundTimer.js; this is
 * only the thing that makes `now` move.
 *
 * Three constraints, all of them about 69 phones rather than about one:
 *
 * 1. **It stops when the clock does.** The interval exists only while a timer is
 *    running, and the callback clears it the moment the end is passed. An idle,
 *    paused or expired clock costs nothing at all — which matters because this
 *    hook is mounted on the chrome rail of every screen in the app and would
 *    otherwise be a permanent 4Hz wakeup on every device in the room for the
 *    whole evening.
 * 2. **It polls the wall clock rather than counting its own ticks.** A dropped
 *    or throttled interval — a backgrounded tab, a locked phone — then costs
 *    nothing but a late frame: the next tick reads `Date.now()` and lands on the
 *    correct second. A self-incrementing counter would drift by exactly as long
 *    as the phone was asleep, and every phone would drift differently.
 * 3. **It ticks faster than it displays.** 250ms against a 1s display, so the
 *    second boundary is never more than a quarter second late. The final ten
 *    seconds pop once per second (§7.1, App.css §13c) and a pop that lands
 *    visibly after the number changed reads as a lag rather than as a beat.
 */
const TICK_MS = 250;

export const useRoundClock = (timer) => {
  const [now, setNow] = useState(() => Date.now());

  // `timer.endsAt` rather than `timer`: the snapshot handler rebuilds the object
  // on every game-state write, and an object identity in the deps would tear
  // down and rebuild the interval every time the host touched anything at all.
  const endsAt = timer.endsAt;

  useEffect(() => {
    if (!endsAt) return undefined;

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      // Expiry is a reading, not an event — nothing is written and nothing is
      // announced from here (see lib/roundTimer.js). Past the end there is
      // nothing left to recompute, so the interval retires itself.
      if (t >= endsAt) clearInterval(id);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [endsAt]);

  // Derived per render rather than stored. `now` is deliberately stale while the
  // clock is stopped — a paused clock reads its remainder straight out of the
  // timer, and an idle one has nothing to read.
  const left = remainingMs(timer, now);

  return {
    phase: clockPhase(timer, now),
    running: isRunning(timer),
    msLeft: left,
    // Whole seconds, matching what `formatClock` rounds to — this is what the
    // digits are keyed on, so it must change exactly when the text does or the
    // per-second pop falls out of step with the number it is punctuating.
    secondsLeft: Math.ceil(left / 1000),
    text: formatClock(left),
  };
};
