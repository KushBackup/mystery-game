import React, { useRef, useState } from 'react';
import AppIcon from './icons/AppIcon';
import Glyph, { Battery } from './icons/Glyph';
import Wallpaper from './art/Wallpaper';
import { useServerNow } from '../hooks/useKillers';
import { useWorldClock, useOnline } from './hooks';
import { sfxUnlock, sfxTap } from './sfx';

/**
 * The parts of the phone that aren't an app: the status bar, the home screen
 * and its dock, the home button, the lock screen, and the notification banner.
 */

/**
 * The status bar. The battery is the phase timer: it drains as the phase runs
 * out and turns red in the last fifth, so a glance at any screen says how long
 * is left without a countdown shouting at you. A ghost's phone has no signal.
 */
export function StatusBar({ game, ghost = false, clear = false, drag }) {
  const clock = useWorldClock(game);
  const online = useOnline();
  const now = useServerNow(game?.phaseEndsAt, 1000);
  const ends = game?.phaseEndsAt ?? 0;
  const starts = Math.max(game?.revealAt || 0, game?.phaseStartedAt ?? 0);
  const total = ends - starts;
  const left = ends ? Math.max(0, ends - now) : 0;
  const level = ends && total > 0 ? Math.min(1, left / total) : 1;
  const low = Boolean(ends) && level < 0.2;
  const secs = Math.ceil(left / 1000);
  // "15m", never "14:56": beside the game clock in the middle, a second m:ss reads as another time of day.
  const label = ends ? (secs > 60 ? `${Math.ceil(secs / 60)}m` : `${secs}s`) : '';
  return (
    <div className={`os-status ${clear ? 'os-status--clear' : ''}`} role="status" {...drag}>
      <div className="os-status__left">
        {!online ? (
          <>
            <span className="opacity-40"><Glyph name="signal" size={10} /></span>
            <span className="os-status__carrier">Searching…</span>
          </>
        ) : ghost ? <span className="os-status__carrier opacity-80">No Service</span> : (
          <>
            <Glyph name="signal" size={10} />
            <span className="os-status__carrier">ASTRAL</span>
            <Glyph name="wifi" size={11} />
          </>
        )}
      </div>
      <div className="os-status__mid">{clock}</div>
      <div className="os-status__right">
        {label && <span className={`tabular-nums ${low ? 'text-os-red' : ''}`} aria-label="Time left in this phase">{label}</span>}
        <Battery level={level} size={25} low={low} />
      </div>
    </div>
  );
}

export const HomeBar = ({ onHome }) => (
  <div className="os-homebar">
    <button type="button" className="os-homebtn" aria-label="Home" onClick={() => { sfxTap(); onHome(); }} />
  </div>
);

/**
 * Slide to unlock. Drag the thumb to the end of the well; let go early and it
 * springs back. Also answers a plain tap on the words with a nudge, because a
 * first-time guest will tap before they slide.
 */
export function SlideToUnlock({ label = 'slide to unlock', onDone, tone = '', glyph = 'forward' }) {
  const track = useRef(null);
  const start = useRef(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);

  const max = () => (track.current ? track.current.clientWidth - 70 : 200);
  const down = (e) => {
    start.current = e.clientX - x;
    setDrag(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (start.current == null) return;
    setX(Math.max(0, Math.min(max(), e.clientX - start.current)));
  };
  const up = () => {
    if (start.current == null) return;
    start.current = null;
    setDrag(false);
    if (x >= max() * 0.85) {
      setX(max());
      sfxUnlock();
      onDone();
    } else {
      setX(0);
    }
  };

  return (
    <div ref={track} className={`os-slide ${tone ? `os-slide--${tone}` : ''}`}>
      <span className="os-slide__text" style={{ opacity: Math.max(0, 1 - x / 180) }}>{label}</span>
      <button
        type="button"
        className="os-slide__thumb"
        aria-label={label}
        style={{ translate: `${x}px 0`, transition: drag ? 'none' : 'translate 180ms cubic-bezier(0.2, 0.9, 0.25, 1)' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { sfxUnlock(); onDone(); } }}
      >
        <Glyph name={glyph} size={20} />
      </button>
    </div>
  );
}

/** The lock screen: big clock, stacked notifications, slide to unlock. */
export function LockScreen({ game, title, subtitle, notes = [], onUnlock, sliderLabel }) {
  const clock = useWorldClock(game);
  return (
    <div className="os-lock">
      <Wallpaper variant="lock" className="os-wall" />
      <div className="os-stars" aria-hidden="true" />
      <div className="relative os-lock__clockbar">
        <p className="os-lock__time">{clock}</p>
        <p className="os-lock__date">{title}</p>
        {subtitle && <p className="text-[15px] mt-1 text-white/85" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{subtitle}</p>}
      </div>
      <div className="relative os-lock__notes os-scroll">
        {notes.map((n, i) => (
          <div key={n.key ?? i} className="os-notif os-rise" style={{ animationDelay: `${i * 90}ms` }}>
            <AppIcon name={n.icon ?? 'deepblue'} size={32} className="shrink-0" />
            <div className="min-w-0">
              <p className="os-notif__title">{n.title}</p>
              <p className="os-notif__text">{n.text}</p>
            </div>
          </div>
        ))}
      </div>
      {onUnlock && (
        <div className="relative os-lock__slider">
          <SlideToUnlock label={sliderLabel} onDone={onUnlock} />
        </div>
      )}
    </div>
  );
}

/**
 * A notification sliding down over whatever is open. It removes itself
 * (os.css). `long` wraps and stays longer. Tap opens its app; a flick up
 * puts it away without opening anything, as on a real phone.
 */
export function Banner({ icon = 'messages', title, text, onOpen, onDismiss, long = false }) {
  const startY = useRef(null);
  const flicked = useRef(false);
  return (
    <button
      type="button"
      className={`os-banner text-left ${long ? 'os-banner--long' : ''}`}
      onPointerDown={(e) => { startY.current = e.clientY; flicked.current = false; }}
      onPointerMove={(e) => { if (startY.current != null && e.clientY - startY.current < -14) flicked.current = true; }}
      onPointerUp={() => { startY.current = null; if (flicked.current) onDismiss?.(); }}
      onClick={() => { if (flicked.current) return; onOpen(); }}
    >
      <AppIcon name={icon} size={30} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="os-banner__title block">{title}</span>
        <span className="os-banner__text block">{text}</span>
      </span>
    </button>
  );
}

/** One row of a Notification Center group: an icon, a bold title, one line of text. */
function NCRow({ icon, tile, title, text, onTap }) {
  return (
    <button type="button" className="os-nc__row" onClick={onTap}>
      {icon ? <AppIcon name={icon} size={30} className="shrink-0" /> : tile}
      <span className="min-w-0 flex-1">
        <span className="os-nc__row-title block">{title}</span>
        <span className="os-nc__row-text block">{text}</span>
      </span>
    </button>
  );
}

/** A small round glyph tile, for a row with no app icon of its own (Night, Vote, Unknown). */
export const NCTile = ({ glyph, bg }) => (
  <span className="os-nc__tile" style={{ background: bg }}><Glyph name={glyph} size={16} color="#fff" /></span>
);

/** One app's group: a small-caps header, a card of rows (divided). Nothing renders if empty. */
function NCGroup({ title, rows, onTap }) {
  if (!rows.length) return null;
  return (
    <div>
      <p className="os-nc__head">{title.toUpperCase()}</p>
      <div className="os-nc__card">
        {rows.map((r, i) => (
          <React.Fragment key={r.id}>
            {i > 0 && <div className="os-nc__div" />}
            <NCRow icon={r.icon} tile={r.tile} title={r.title} text={r.text} onTap={() => onTap(r.app)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * The Notification Center: pulled down from the status bar (PhoneFrame owns
 * the drag). `pull` is the live 0..1 drag position while a finger is down
 * (inline transform, no transition); once released, `open` takes over and the
 * CSS transition finishes the motion. Grouped by app, old-iOS style, so a
 * thread's own read state still decides what's in here — nothing is tracked
 * twice (threads.js, news.js, seen.js already own that). Each row only names
 * which app it belongs to (`app`); `onOpen` is the shell's own `open(name)`,
 * passed through rather than closed over while the rows are built.
 */
export function NotificationCenter({ sections, open, pull, onOpen, onClose }) {
  const any = sections.some((s) => s.rows.length);
  const style = pull != null ? { transform: `translateY(${pull * 100 - 100}%)`, transition: 'none' } : undefined;
  // Opening a row's app also puts the panel away, same as tapping any home icon.
  const go = (app) => { onOpen(app); onClose(); };
  return (
    <>
      {open && <button type="button" className="os-nc__scrim" aria-label="Close notifications" onClick={onClose} />}
      <div className={`os-nc ${open ? 'os-nc--open' : ''}`} style={style} aria-hidden={!open && pull == null}>
        <div className="os-nc__scroll os-scroll">
          {any
            ? sections.map((s) => <NCGroup key={s.key} title={s.title} rows={s.rows} onTap={go} />)
            : <p className="os-nc__empty">No New Notifications.</p>}
        </div>
        {/* The grabber: iOS's way back out. A full panel on a small phone leaves no scrim to tap. */}
        <button type="button" className="os-nc__grip" aria-label="Close notifications" onClick={onClose} />
      </div>
    </>
  );
}

/** One icon on the home screen or dock. `onOpen` gets the icon's centre, for the zoom. */
function HomeIcon({ app, label, badge, onOpen }) {
  const open = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onOpen(app, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  return (
    <button type="button" className="os-icon" onClick={open} aria-label={badge ? `${label}, ${badge} new` : label}>
      <span className="os-icon__art">
        <AppIcon name={app} size={60} />
        {badge ? <span className="os-badge">{badge}</span> : null}
      </span>
      <span className="os-icon__label">{label}</span>
    </button>
  );
}

/**
 * The home screen: the NowCard as a pinned notice, the grid, the glass dock.
 * The four apps a guest opens all night live in the dock; the rest in the grid.
 */
export function HomeScreen({ grid, dock, badges, now, onOpen, ghost, entering }) {
  return (
    <div
      className={`os-home ${entering ? 'os-home--enter' : ''} ${ghost ? 'os-haunt' : ''}`}
      style={ghost ? { filter: 'grayscale(0.8) brightness(0.8) contrast(1.1)' } : undefined}
    >
      <Wallpaper variant="home" className="os-wall" />
      <div className="os-stars" aria-hidden="true" />
      {now && (() => {
        const body = (
          <>
            <span className="min-w-0 flex-1">
              <span className="os-now__label flex items-center gap-2">
                {now.urgent && <span className="inline-block w-2 h-2 rounded-full bg-os-red" aria-label="Needs you" />}
                {now.label}
              </span>
              <span className="os-now__line block">{now.line}</span>
            </span>
            {now.onTap && <span className="os-now__chev" aria-hidden="true"><Glyph name="forward" size={12} /></span>}
          </>
        );
        // A card that opens something looks like it does; one that doesn't is just a notice.
        return now.onTap
          ? <button type="button" className="os-now os-now--tap relative text-left" onClick={now.onTap}>{body}</button>
          : <div className="os-now relative">{body}</div>;
      })()}
      <div className="os-grid relative">
        {grid.map(([app, label]) => <HomeIcon key={app} app={app} label={label} badge={badges[app]} onOpen={onOpen} />)}
      </div>
      <div className="os-dock">
        {dock.map(([app, label]) => <HomeIcon key={app} app={app} label={label} badge={badges[app]} onOpen={onOpen} />)}
      </div>
    </div>
  );
}
