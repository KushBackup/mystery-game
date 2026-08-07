import React, { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * The tooltip (DESIGN_LANGUAGE.md §6.13).
 *
 * A small `?` mark that opens a scrap of paper explaining the thing it sits
 * beside. It is the **on-demand** half of the app's explanation layer; the
 * pinned screen note (§6.10, ScreenBrief) is the automatic half, and it clears
 * itself at Round 02. From then on this is the only help a player has without
 * leaving the screen for the Guide — which is exactly why it never expires.
 *
 * It is deliberately the *same* surface as the screen note — aged bone, a
 * square-cut caret, the note voice — so the app has one idiom for "here is what
 * this is" rather than two. Copy lives in data/tooltips.js for the same reason
 * the briefs live in data/screenGuide.js: the Guide quotes the same facts, and
 * two copies of an explanation drift.
 *
 * Three implementation choices that are load-bearing:
 *
 * **The panel is portalled to `document.body`.** Paper in this system is tilted
 * with the `rotate` property, and `rotate` establishes a containing block for
 * `position: fixed` — so a tooltip rendered inside a bone card would anchor to
 * the card *and inherit its 1.2° tilt*, pointing the caret at nothing. The
 * portal also puts it above the modals (z-70 against their z-50) and outside
 * the root's `overflow-x: clip`.
 *
 * **Position is written to the DOM, not held in state.** Measuring in a layout
 * effect and then calling `setState` re-runs the effect, which measures again
 * and sets a fresh object — an infinite loop. Writing `style.left` directly
 * settles in one pass, and `data-placed` is what keeps the unpositioned first
 * frame invisible.
 *
 * **The visible mark is 18px and the target is 44px** (§4.3). The expansion is
 * a pseudo-element rather than padding, because a 44px-tall control inline in
 * an 11px label row would set the row's height to 44px everywhere it appears.
 */

// Never closer than this to a viewport edge, and this far off the trigger.
const VIEWPORT_MARGIN = 12;
const TRIGGER_GAP = 10;
// How near the panel's own corner the caret's centre is allowed to get. The
// caret is an 11px square rotated 45°, so its bounding box is ~15.6px wide and
// 8px would already keep it inside the corner — 12 leaves it visibly clear.
//
// It cannot be much larger than that: this clamp only ever bites when the panel
// has been pushed off-centre by a viewport edge, which is exactly the case
// where the trigger sits nearest the panel's own edge. At 18 the mark furthest
// right in the app — the round tip on the board's masthead, whose centre lands
// 287px into a 300px panel — had its caret pulled 5px off the thing it points
// at, measured. The clamp must be looser than the worst real anchor.
const CARET_INSET = 12;

export const InfoTip = ({
  // { label, body } — from data/tooltips.js.
  tip,
  // 'glyph' trails a label; 'chip' stands alone as a control of its own.
  variant = 'glyph',
  // 'bone' when the mark sits on paper — the accent has to deepen there (§2.3).
  tone = 'ink',
  className = '',
  style,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = `tip-${useId()}`;

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    // clientWidth, not innerWidth: innerWidth counts the scrollbar on desktop,
    // which would let the panel sit under it.
    const viewportW = document.documentElement.clientWidth;
    const viewportH = window.innerHeight;

    const anchorX = rect.left + rect.width / 2;
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(anchorX - width / 2, viewportW - width - VIEWPORT_MARGIN)
    );

    // Below by default. Flip above only when below genuinely doesn't fit *and*
    // above does — otherwise a tip near the fold would flip to a worse spot.
    const below = rect.bottom + TRIGGER_GAP;
    const flip =
      below + height > viewportH - VIEWPORT_MARGIN &&
      rect.top - TRIGGER_GAP - height > VIEWPORT_MARGIN;
    const top = flip ? rect.top - TRIGGER_GAP - height : below;

    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(
      Math.max(VIEWPORT_MARGIN, Math.min(top, viewportH - height - VIEWPORT_MARGIN))
    )}px`;
    // The caret tracks the trigger even after the panel has been clamped to an
    // edge, which is the whole reason it can point at something off-centre.
    panel.style.setProperty(
      '--caret-x',
      `${Math.round(
        Math.min(Math.max(anchorX - left, CARET_INSET), Math.max(width - CARET_INSET, CARET_INSET))
      )}px`
    );
    panel.dataset.flip = flip ? 'up' : 'down';
    panel.dataset.placed = '';
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;

    place();

    // Coalesced to one measurement per frame: `scroll` fires far faster than
    // the compositor can use, and this reads layout.
    let frame = 0;
    const follow = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    const onPointerDown = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    // Capture, so a tip closes before the tap underneath it is handled — and so
    // opening a second tip closes the first one on the way down.
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', follow);
    // Capture again: the chat log and the guest modal are their own scrollers,
    // and a bubbling listener never hears them.
    window.addEventListener('scroll', follow, true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, true);
    };
  }, [open, place]);

  if (!tip?.body) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? `Hide the note on ${tip.label}` : `What is this? ${tip.label}`}
        className={`er-tip__btn ${variant === 'chip' ? 'er-tip__btn--chip' : ''} ${
          tone === 'bone' ? 'er-tip__btn--bone' : ''
        } ${open ? 'is-open' : ''} ${className}`}
        style={style}
      >
        <span aria-hidden="true">?</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="note"
            className="er-tip__panel er-bone er-bone--aged"
          >
            <span className="er-tip__caret" aria-hidden="true" />
            <p className="er-bone-label">{tip.label}</p>
            <p className="er-tip__body">{tip.body}</p>
          </div>,
          document.body
        )}
    </>
  );
};
