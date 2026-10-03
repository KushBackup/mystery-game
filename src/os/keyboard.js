import { createContext, useContext } from 'react';

/**
 * The on-screen keyboard. PhoneFrame owns it: it fits the phone to the
 * visible part of the page (`visualViewport`), says whether a keyboard is up
 * (`useKeyboard`), and keeps the field being typed in on screen.
 *
 * Why this is needed. iOS never shrinks the page for the keyboard: it slides
 * the visible window up over a page that stays full height, then scrolls
 * whatever it thinks the field is in. Android Chrome now does the same by
 * default. The phone is one fixed box, so without this the nav bar slides off
 * the top, the field hides under the keys, and a gap is left when they close.
 *
 * "Open" means a field has focus AND the visible height dropped well below the
 * tallest seen at this width: a hardware keyboard, a desktop browser or a
 * window resized by hand never counts as a keyboard.
 */

export const KeyboardContext = createContext(false);

/** True while the on-screen keyboard is up over the phone. */
export const useKeyboard = () => useContext(KeyboardContext);

/** How far (px) the visible height must drop to count as a keyboard. Real ones are 200+. */
export const KEYBOARD_MIN = 150;

const TYPED = new Set(['text', 'search', 'email', 'tel', 'url', 'password', 'number']);

/** Whether this element takes typing, so focusing it raises the keyboard. */
export function isTyping(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.isContentEditable) return true;
  if (el.disabled || el.readOnly) return false;
  if (el.tagName === 'TEXTAREA') return true;
  return el.tagName === 'INPUT' && TYPED.has(el.type || 'text');
}

/**
 * Scroll a focused one-line field into the visible part of the list it sits
 * in, together with its form's submit button when both fit (Setup's name and
 * Next). Scrolls only that list, by hand: scrollIntoView would also move the
 * phone itself. A textarea is left alone, since it keeps its own caret in view,
 * and so is a field outside any list (the Messages compose bar is already
 * pinned above the keys).
 */
export function revealField(el, margin = 12) {
  if (!el || el.tagName !== 'INPUT') return;
  let box = el.parentElement;
  while (box && box !== document.body) {
    const oy = getComputedStyle(box).overflowY;
    if (oy === 'auto' || oy === 'scroll') break;
    box = box.parentElement;
  }
  if (!box || box === document.body) return;
  const view = box.getBoundingClientRect();
  const field = el.getBoundingClientRect();
  let top = field.top;
  let bottom = field.bottom;
  const go = el.form?.querySelector('[type="submit"]');
  if (go) {
    const b = go.getBoundingClientRect();
    if (Math.max(bottom, b.bottom) - Math.min(top, b.top) <= view.height - margin * 2) {
      top = Math.min(top, b.top);
      bottom = Math.max(bottom, b.bottom);
    }
  }
  if (bottom > view.bottom - margin) box.scrollTop += bottom - (view.bottom - margin);
  else if (top < view.top + margin) box.scrollTop -= view.top + margin - top;
}
