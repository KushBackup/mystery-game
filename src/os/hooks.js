/**
 * Small hooks the phone's chrome shares: a slow server clock, the in-world
 * clock built on it, and whether the phone is online.
 */

import { useEffect, useState } from 'react';
import { useServerNow } from '../hooks/useKillers';
import { serverNow } from '../lib/clockSkew';
import { worldClock } from './words';

/** Server time, re-rendered every 5 s: enough for a clock that shows minutes. */
export function useSlowNow() {
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), 5_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Is the phone online? A bar's wifi drops; the status bar should say so, like a phone does. */
export function useOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  useEffect(() => {
    const up = () => setOn(true);
    const down = () => setOn(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return on;
}

/** The game's clock: the time of day inside DEEP BLUE (words.js), ticking with the phase. */
export function useWorldClock(game) {
  const slow = useSlowNow();
  const fast = useServerNow(game?.phaseEndsAt, 1000);
  return worldClock(game, Math.max(slow, fast));
}

