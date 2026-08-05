import React from 'react';

/**
 * A redacted paragraph: ragged single-line marks over the copy, which wipe away
 * in sequence when it unseals (DESIGN_LANGUAGE.md §6.7).
 *
 * The form exists because a redaction over more than one line of copy cannot be
 * one bar. Stretched across four full-width lines it stops reading as a
 * redaction and becomes a field of red, which §2.2 forbids — and that is exactly
 * how the Identity card's four-line confidential note rendered. Ragged lines
 * read as a redacted page and keep the accent to marks.
 *
 * Renders as an overlay, so the copy underneath still sets the height and
 * nothing shifts when the marks clear. The caller is responsible for keeping
 * that copy invisible while sealed and for `position: relative` on the box.
 *
 * The default widths are deliberately uneven and deliberately never 100%.
 */
const DEFAULT_WIDTHS = ['96%', '72%', '88%', '61%'];

export const RedactedLines = ({ open = false, widths = DEFAULT_WIDTHS }) => (
  <span aria-hidden="true" className={`er-redact-lines ${open ? 'er-redact-lines--open' : ''}`}>
    {widths.map((width, i) => (
      <span key={`${width}-${i}`} style={{ width, '--i': i }} />
    ))}
  </span>
);
