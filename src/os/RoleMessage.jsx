import React, { useState } from 'react';
import Glyph from './icons/Glyph';
import { ROLE_CARD } from '../data/killersCopy';
import { sfxTap } from './sfx';

/**
 * DEEP BLUE's message telling a guest their role: at casting (takeovers.jsx)
 * and kept in the DEEP BLUE thread in Messages after that.
 *
 * It is built so a glance at someone else's phone gives nothing away:
 *   - It arrives blurred, and a tap opens it. Another tap closes it again.
 *   - While blurred it renders the same stand-in text on every phone, not
 *     the real role behind a filter. Every sealed bubble is pixel for pixel
 *     the same, and the role isn't in the page to read.
 *   - Open or sealed, every role gets the same colours, font and size. The
 *     bubble has a fixed height, so a one-line role and a two-line role take
 *     the same space. Only the words differ.
 */
export default function RoleMessage({ role }) {
  const [open, setOpen] = useState(false);
  const card = ROLE_CARD[role?.role] ?? ROLE_CARD.faithful;
  const toggle = () => { sfxTap(); setOpen((o) => !o); };
  return (
    <button
      type="button"
      className={`os-bubble os-role-msg ${open ? '' : 'os-role-msg--sealed'}`}
      onClick={toggle}
      aria-label={open ? 'Hide your role' : 'Tap to read your role'}
    >
      <span className="os-role-msg__body" aria-hidden={!open}>
        <span className="os-label text-[12px] opacity-80 block">YOU ARE</span>
        <span className="os-arcade text-[29px] leading-tight my-2 block">{open ? card.title.toUpperCase() : 'DEEP BLUE'}</span>
        <span className="text-[17px] leading-snug block">{open ? card.line : 'Read this alone. Nobody else should see it.'}</span>
      </span>
      {open ? (
        <span className="os-role-msg__hint">Tap to hide</span>
      ) : (
        <span className="os-role-msg__seal">
          <Glyph name="lock" size={18} />
          <span>Tap to read</span>
        </span>
      )}
    </button>
  );
}
