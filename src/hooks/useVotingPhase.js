import { useEffect, useState } from 'react';
import { remainingMs, votingDurationMs, votingPhase } from '../lib/roundTimer';

// The shared clock already gives every device an absolute instant for the end
// of a round. This hook reads the two time windows that follow it: the ballot
// and the public result. It never writes, so a room of phones cannot race to
// transition the game state when a timer expires.
export const useVotingPhase = (timer, currentRound) => {
  const [now, setNow] = useState(() => Date.now());
  const ballotDuration = votingDurationMs(timer);

  useEffect(() => {
    if (!timer.endsAt || timer.round !== currentRound) return undefined;

    const voteEndsAt = timer.endsAt + ballotDuration;
    let interval = null;

    const tickBallot = () => {
      const nextNow = Date.now();
      setNow(nextNow);
      if (nextNow >= voteEndsAt && interval) clearInterval(interval);
    };

    const beginBallot = () => {
      tickBallot();
      if (Date.now() < voteEndsAt) interval = setInterval(tickBallot, 250);
    };

    const untilBallot = timer.endsAt - Date.now();
    const timeout = untilBallot > 0
      ? setTimeout(beginBallot, untilBallot)
      : null;

    if (!timeout) beginBallot();

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [timer.endsAt, timer.round, ballotDuration, currentRound]);

  const phase = votingPhase(timer, currentRound, now);
  const voteEndsAt = timer.endsAt + ballotDuration;
  const msLeft = phase === 'open'
    ? Math.max(0, Math.min(voteEndsAt - now, ballotDuration))
    : 0;

  return {
    phase,
    msLeft,
    voteEndsAt,
    roundMsLeft: remainingMs(timer, now),
  };
};