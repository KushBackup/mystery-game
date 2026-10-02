import React, { useMemo, useState } from 'react';
import Glyph from './icons/Glyph';
import { sfxTap } from './sfx';
import { Face } from './art/Portrait';
import { lookLine } from './dossier';

/**
 * The phone's small vocabulary. Every app is built from these, the way iOS 6
 * apps were built from UIKit: a navigation bar, grouped lists of cells,
 * glossy buttons, a switch. Styling lives in os.css; nothing here picks a
 * colour of its own.
 */

/**
 * An app's window: nav bar on top, a scrolling body, optional footer (a compose
 * bar), and `overlay` (an action sheet) above everything. The shell zooms the whole app in from its icon; `enter` is for moving
 * *inside* an app: 'push' slides a detail in from the right, 'pop' slides the
 * list back in from the left (see nav.js).
 */
export function AppFrame({ title, onBack, backLabel = 'Home', right, tone = 'blue', light = false, dark = false, paper = false, footer, overlay, children, bodyClass = '', bodyRef, enter }) {
  const motion = enter === 'push' ? 'os-nav-push' : enter === 'pop' ? 'os-nav-pop' : '';
  return (
    <section className={`os-app ${motion} ${light ? 'os-app--light os-pinstripe' : ''} ${dark ? 'os-app--dark' : ''} ${paper ? 'os-app--paper' : ''}`}>
      <NavBar title={title} onBack={onBack} backLabel={backLabel} right={right} tone={tone} />
      <div ref={bodyRef} className={`os-scroll flex-1 min-h-0 ${bodyClass}`}>{children}</div>
      {footer}
      {overlay}
    </section>
  );
}

export function NavBar({ title, onBack, backLabel = 'Back', right, tone = 'blue' }) {
  return (
    <header className={`os-nav ${tone === 'dark' ? 'os-nav--dark' : tone === 'red' ? 'os-nav--red' : ''}`}>
      <div className="os-nav__side">
        {onBack && (
          <button type="button" className="os-barhit" aria-label={`Back to ${backLabel}`} onClick={() => { sfxTap(); onBack(); }}>
            <span className="os-barbtn os-barbtn--back"><i className="os-barbtn__tip" /><span className="os-barbtn__label">{backLabel}</span></span>
          </button>
        )}
      </div>
      <h1 className="os-nav__title">{title}</h1>
      <div className="os-nav__side os-nav__side--right">{right}</div>
    </header>
  );
}

export const Section = ({ head, foot, children, className = '' }) => (
  <div className={`os-section ${className}`}>
    {head && <p className="os-section__head">{head}</p>}
    {children}
    {foot && <p className="os-section__foot">{foot}</p>}
  </div>
);

export const Group = ({ dark = false, children, className = '' }) => (
  <div className={`os-group ${dark ? 'os-group--dark' : ''} ${className}`}>{children}</div>
);

/** One list row. A button when it does something, a plain row when it only says something. */
export function Cell({ title, sub, value, icon, chevron = false, on = false, onClick, disabled, children, className = '' }) {
  const body = (
    <>
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="os-cell__main">
        {title != null && <span className="os-cell__title block">{title}</span>}
        {sub != null && <span className="os-cell__sub block">{sub}</span>}
        {children}
      </span>
      {value != null && <span className="os-cell__value">{value}</span>}
      {on && <Glyph name="check" size={16} />}
      {chevron && <span className="os-cell__chev"><Glyph name="forward" size={12} /></span>}
    </>
  );
  if (!onClick) return <div className={`os-cell ${on ? 'os-cell--on' : ''} ${className}`}>{body}</div>;
  return (
    <button type="button" className={`os-cell ${on ? 'os-cell--on' : ''} ${className}`} disabled={disabled} aria-pressed={on} onClick={() => { sfxTap(); onClick(); }}>
      {body}
    </button>
  );
}

export function Btn({ children, onClick, tone = 'blue', small = false, disabled, busy, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      className={`os-btn ${tone !== 'blue' ? `os-btn--${tone}` : ''} ${small ? 'os-btn--sm' : ''} ${className}`}
      onClick={onClick ? () => { sfxTap(); onClick(); } : undefined}
      disabled={disabled || busy}
    >
      {busy ? <span className="os-spinner" style={{ width: 18, height: 18 }} /> : children}
    </button>
  );
}

/**
 * The iOS 6 action sheet: a dark glass panel that rises from the bottom with a
 * stack of glossy buttons and a Cancel. Pass it as an AppFrame `overlay`.
 * `options` are { id, label, tone ('red'), on (a check mark) }.
 */
export function ActionSheet({ title, options, onPick, onCancel }) {
  return (
    <div className="os-sheet" role="dialog" aria-modal="true" aria-label={title ?? 'Choose'}>
      <button type="button" className="os-sheet__scrim" aria-label="Cancel" onClick={onCancel} />
      <div className="os-sheet__panel">
        {title && <p className="os-sheet__title">{title}</p>}
        <div className="os-sheet__list">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`os-sheet__btn ${o.tone === 'red' ? 'os-sheet__btn--red' : ''}`}
              onClick={() => { sfxTap(); onPick(o.id); }}
            >
              <span className="truncate">{o.label}</span>
              {o.on && <Glyph name="check" size={15} />}
            </button>
          ))}
        </div>
        <button type="button" className="os-sheet__btn os-sheet__btn--cancel" onClick={() => { sfxTap(); onCancel(); }}>Cancel</button>
      </div>
    </div>
  );
}

export const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className="os-switch" onClick={() => { sfxTap(); onChange(!on); }} />
);

/** The held beat: a spinner and one line. `still` drops the spinner for a state that waiting won't change. */
export const Hold = ({ label = 'Loading…', still = false, children }) => (
  <div className="os-hold">
    <div>
      {!still && <div className="os-spinner" />}
      <p className="os-label mt-4 text-os-chrome">{label}</p>
      {children}
    </div>
  </div>
);

/** An empty state: an icon, a title, one line. */
export const Empty = ({ glyph = 'dots', title, line }) => (
  <div className="px-8 py-16 text-center">
    <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-os-deep/60 text-os-chrome"><Glyph name={glyph} size={32} /></div>
    {title && <p className="os-label mt-4 text-[12px]">{title}</p>}
    {line && <p className="mt-2 text-[15px] leading-snug opacity-75">{line}</p>}
  </div>
);

/**
 * Pick one guest, as a grouped list with a check mark. A search field shows
 * once the list is long. Pass `traits` (ctx.traits) to show each guest's
 * drawn photo and their look, so a choice can be made from across the room. `disabled` greys a row but keeps it, so a Doctor sees
 * *why* they can't pick someone.
 */
export function GuestPicker({ guests, value, onPick, disabled = () => false, note = () => null, dark = true, emptyLine = 'Nobody to choose.', traits = null }) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? guests.filter((g) => g.name.toLowerCase().includes(s)) : guests;
  }, [guests, q]);

  if (!guests.length) return <p className="px-3 py-4 text-[15px] opacity-70">{emptyLine}</p>;
  return (
    <div>
      {guests.length > 8 && (
        <label className="os-search !mx-0 mb-2">
          <Glyph name="search" size={12} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Find a guest" />
        </label>
      )}
      <Group dark={dark}>
        {shown.map((g) => (
          <Cell
            key={g.pid}
            title={g.name}
            icon={traits ? <Face traits={traits} pid={g.pid} size={36} /> : undefined}
            sub={note(g) ?? (traits ? lookLine(traits[g.pid]) : null) ?? null}
            on={value === g.pid}
            disabled={disabled(g)}
            onClick={() => onPick(g.pid)}
          />
        ))}
        {shown.length === 0 && <Cell sub="No match" />}
      </Group>
    </div>
  );
}
