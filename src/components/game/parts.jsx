import React, { useMemo, useState } from 'react';
import { SearchField } from '../ui/SearchField';
import { useServerNow } from '../../hooks/useKillers';
import { formatClock } from '../../lib/roundTimer';
import { PHASE_LABEL, deliveryLine, DELIVERY_TAG } from '../../data/killersCopy';
import { clueWords } from '../../data/packs/index.js';

/**
 * The small vocabulary every Killers Night screen is built from. All of it
 * composes the Evidence Room classes (App.css). Nothing here introduces a
 * colour: surfaces change (ink → bone), the accent is signal, and brass is
 * reserved for numerals.
 */

/** Full-height screen on the ink backdrop. */
export const Screen = ({ children, className = '' }) => (
  <div className={`min-h-[100dvh] bg-ink text-bone er-grain relative ${className}`}>
    <div className="er-vignette" aria-hidden="true" />
    <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-10">{children}</div>
  </div>
);

/** The phase countdown: mono, not brass (DESIGN_LANGUAGE §6.6c). Renders nothing when untimed. */
export function PhaseClock({ endsAt }) {
  const now = useServerNow(endsAt);
  if (!endsAt) return null;
  const left = Math.max(0, endsAt - now);
  const soon = left > 0 && left <= 60_000;
  return (
    <span className={`er-mono ${soon ? 'er-mono--hot' : 'er-mono--bone'} tabular-nums`} aria-label="Time left">
      {left > 0 ? formatClock(left) : 'Time'}
    </span>
  );
}

/** Top rail: phase name, cycle numeral, countdown. The first thing on every screen. */
export const PhaseBar = ({ game, right }) => (
  <header className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-ink/95 backdrop-blur border-b border-line flex items-center justify-between gap-3">
    <div className="flex items-baseline gap-3 min-w-0">
      {game?.cycle > 0 && <span className="er-num text-[28px]">{String(game.cycle).padStart(2, '0')}</span>}
      <span className="er-mono er-mono--wide truncate">{PHASE_LABEL[game?.phase] ?? ''}</span>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      {right}
      <PhaseClock endsAt={game?.phaseEndsAt} />
    </div>
  </header>
);

/** The one instruction. 25 words, top of the screen, always. */
export const NowCard = ({ line }) => (
  <div className="er-card er-card--signal mt-4" role="status">
    <p className="er-mono er-mono--hot mb-1">Now</p>
    <p className="font-typewriter text-[19px] leading-snug text-bone">{line}</p>
  </div>
);

/** The held beat before a reveal, and the locked beat while the host resolves. */
export const Hold = ({ label = 'The lights flicker…' }) => (
  <div className="min-h-[60dvh] flex flex-col items-center justify-center text-center">
    <p className="er-title text-[64px] er-fade" aria-hidden="true">&hellip;</p>
    <p className="er-mono mt-6">{label}</p>
  </div>
);

/**
 * Pick one guest. Big touch rows, a search field once the list is long, and
 * the current choice pinned to the signal border. `disabled` greys a row out
 * but keeps it visible, so a Doctor can see *why* they can't pick someone.
 */
export function GuestPicker({ guests, value, onPick, disabled = () => false, note = () => null, emptyLine = 'Nobody to choose.' }) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? guests.filter((g) => g.name.toLowerCase().includes(s)) : guests;
  }, [guests, q]);

  if (!guests.length) return <p className="er-mono mt-4">{emptyLine}</p>;

  return (
    <div className="mt-4">
      {guests.length > 10 && (
        <SearchField value={q} onChange={setQ} placeholder="Find a guest…" label="Find a guest" resultCount={shown.length} totalCount={guests.length} className="mb-3" />
      )}
      <ul className="grid grid-cols-2 gap-2">
        {shown.map((g) => {
          const off = disabled(g);
          const on = value === g.pid;
          return (
            <li key={g.pid}>
              <button
                type="button"
                disabled={off}
                onClick={() => onPick(g.pid)}
                className={`er-touch er-press w-full text-left px-3 py-3 border ${
                  on ? 'border-signal bg-ink-hover' : 'border-line bg-ink-raised'
                } ${off ? 'opacity-40' : ''}`}
                aria-pressed={on}
              >
                <span className="block font-typewriter text-[17px] text-bone truncate">{g.name}</span>
                <span className="block er-mono mt-1 truncate">{note(g) ?? ' '}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A clue on paper: the pack's flavour line, then what it plainly means. */
export const ClueCard = ({ pack, fact, cycle, via }) => {
  const { flavour, plain } = clueWords(pack, fact);
  return (
    <article className="er-bone er-land p-4">
      <p className="er-mono text-body-bone mb-2">
        Night {cycle} · {via === 'ghost' ? 'From the other side' : via === 'watch' ? 'You saw it' : 'Clue'}
      </p>
      <p className="font-typewriter text-[18px] leading-snug text-ink">{flavour}</p>
      <p className="font-mono text-[13px] mt-3 text-body-bone border-t border-line-bone pt-2">
        {plain}
      </p>
    </article>
  );
};

/** Anything else in the inbox: a watch, a check, a whisper. */
export const DeliveryCard = ({ d, nameOf }) => (
  <article className={`er-card ${d.kind === 'check' && d.team === 'killers' ? 'er-card--signal' : ''} er-enter-quick`}>
    <p className="er-mono mb-1">Night {d.cycle} · {DELIVERY_TAG[d.kind] ?? d.kind}</p>
    <p className="font-typewriter text-[17px] leading-snug text-bone">{deliveryLine(d, nameOf)}</p>
  </article>
);

/** Primary action button. */
export const Action = ({ children, onClick, disabled, busy, tone = 'signal', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || busy}
    className={`er-touch er-press w-full py-4 font-mono text-[13px] tracking-[0.18em] uppercase ${
      tone === 'signal' ? 'bg-signal text-bone' : 'border border-line text-bone bg-ink-raised'
    } ${disabled || busy ? 'opacity-50' : ''} ${className}`}
  >
    {busy ? 'Sending…' : children}
  </button>
);
