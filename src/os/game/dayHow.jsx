import React, { useEffect, useState } from 'react';
import { Star } from './wordParts';
import { markSeen, peekSeen } from '../seen';

/**
 * Pieces shared by Fake Artist (FakeGame.jsx) and Pack the Bag (PackGame.jsx),
 * the two games that have no tutorial film: the three-step "how to play" strip
 * shown while the cards are on their way, and the stamped reveal at the
 * end. When the cards land is in dayTiming.js.
 */

const ICONS = {
  peek: <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="9" width="26" height="22" rx="4" /><path d="M13 20c3-4 11-4 14 0-3 4-11 4-14 0z" /><circle cx="20" cy="20" r="1.6" /></svg>,
  draw: <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32l3-9L27 7l6 6-16 16zM24 10l6 6M8 32l9-3" /></svg>,
  bag: <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="13" width="28" height="20" rx="4" /><path d="M15 13v-4h10v4M14 13v20M26 13v20" /></svg>,
  open: <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 18h28v14H6zM6 18l4-8h20l4 8" /><path d="M14 24h12" /></svg>,
  star: null,
};

/** Three steps, each a drawn icon, a word and a line. `steps`: [[icon, word, line]]. */
export function HowList({ title, steps }) {
  return (
    <div className="os-sb-hello">
      <p className="os-sb-hello__title">{title}</p>
      <ol className="os-sb-how">
        {steps.map(([icon, word, line]) => (
          <li key={word}>
            {icon === 'star' ? <Star size={34} /> : ICONS[icon]}
            <b>{word}</b>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The answer, stamped once per phone, the first time it is shown. */
export function StampReveal({ seenKey, label, value, sub, waiting }) {
  const [stamp] = useState(() => !peekSeen(seenKey));
  useEffect(() => {
    if (value) markSeen(seenKey, true);
  }, [seenKey, value]);
  if (!value) {
    return (
      <div className="os-wb-reveal">
        <p className="os-wb-reveal__label">Time’s up</p>
        <p className="os-wb-reveal__wait">{waiting}</p>
      </div>
    );
  }
  return (
    <div className="os-wb-reveal">
      <p className="os-wb-reveal__label">{label}</p>
      <p className={`os-wb-reveal__word ${stamp ? 'os-wb-reveal__word--stamp' : ''}`}>{value}</p>
      {sub && <p className="os-wb-reveal__sub">{sub}</p>}
    </div>
  );
}
