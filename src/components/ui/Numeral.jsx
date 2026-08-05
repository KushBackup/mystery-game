import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

/**
 * A brass numeral that ticks to its value (see hooks/useCountUp.js) and is
 * guaranteed to be tabular.
 *
 * `tabular-nums` is applied here rather than left to the caller's `.er-num` /
 * `.er-stat__num` class, because this is the one component in the app whose
 * digits change while on screen — proportional digits would make a vote count
 * going 9 → 10 shove the label beside it sideways, and a round rail beside a
 * shifting numeral reads as broken.
 *
 * Pass `pad` to keep a fixed width of digits (`pad={2}` → `07`), which is what
 * every round and stat figure in the app uses.
 */
export const Numeral = ({ value, pad = 0, as, className = '', ...rest }) => {
  const shown = useCountUp(value);
  const text = pad > 0 ? String(shown).padStart(pad, '0') : String(shown);

  // Assigned in the body rather than destructured as `as: Tag` in the parameter
  // list. This repo's ESLint has no eslint-plugin-react, so JSX usage isn't
  // tracked, and `varsIgnorePattern: '^[A-Z_]'` exempts *variables* only —
  // a capitalised destructured *parameter* is an argument and still reads as
  // unused. Navigation.jsx does the same thing with `Icon`.
  const Tag = as || 'span';

  return (
    <Tag className={`tabular-nums ${className}`} {...rest}>
      {text}
    </Tag>
  );
};
