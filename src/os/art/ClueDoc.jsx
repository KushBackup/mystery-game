/**
 * ClueDoc: a clue that arrives as a document, photographed or screenshotted.
 *
 *   receipt  a bar tab found by the admin terminal. One drink on it, printed
 *            as a category ("LIQUOR, NEAT, NO MIXER"), never a brand. The rest
 *            is torn, smudged or blank.
 *   profile  a screenshot of the DEEP BLUE admin account, leaked. Every field
 *            is blacked out except one: the birthday's months or the account
 *            recovery answer.
 *
 * Both say exactly what the matching CCTV still says (os/evidence.js). The
 * words come from the pack's `evidence` block; the redaction bars are seeded
 * by `seed`, so the same document looks the same on every phone.
 */
import React from 'react';
import { hashString } from './pixels.js';

const pad2 = (n) => String(n).padStart(2, '0');

/** Seeded widths for the black bars, so a redaction never looks typed. */
function bars(seed, n, min = 30, max = 90) {
  let h = hashString(seed);
  return Array.from({ length: n }, () => {
    h = (Math.imul(h ^ (h >>> 13), 1274126177) + 7) >>> 0;
    return min + (h % (max - min));
  });
}

export function Receipt({ fact, seed = '', pack, thumb = false }) {
  const item = pack?.evidence?.receipt?.drink?.[fact?.group] ?? '';
  const h = hashString(seed);
  const time = `0${2 + (h % 2)}:${pad2((h >>> 3) % 60)}`;
  const table = 1 + ((h >>> 9) % 14);
  const w = bars(`${seed}r`, 3, 35, 80);
  if (thumb) {
    return (
      <div className="ev-receipt-mini" role="img" aria-label="A bar receipt">
        <i style={{ width: '60%' }} /><b>1 × {item}</b><i style={{ width: `${w[0]}%` }} /><i style={{ width: `${w[1]}%` }} />
      </div>
    );
  }
  return (
    <div className="ev-receipt" role="img" aria-label={`A bar receipt: 1 × ${item}`}>
      <div className="ev-receipt__slip">
        <p className="ev-receipt__head">THE BAR</p>
        <p className="ev-receipt__meta">TABLE {table} · {time} AM</p>
        <p className="ev-receipt__rule" aria-hidden="true" />
        <p className="ev-receipt__item"><span>1 ×</span> {item}</p>
        <p className="ev-receipt__smudge" style={{ width: `${w[0]}%` }} aria-hidden="true" />
        <p className="ev-receipt__smudge" style={{ width: `${w[1]}%` }} aria-hidden="true" />
        <p className="ev-receipt__rule" aria-hidden="true" />
        <p className="ev-receipt__meta">SERVED TO: <i className="ev-redact" style={{ width: `${w[2]}%` }} /></p>
        <p className="ev-receipt__meta">PAID · CARD ▓▓▓▓</p>
      </div>
      <i className="ev-receipt__tear" aria-hidden="true" />
    </div>
  );
}

const PROFILE_FIELDS = [
  ['Username'],
  ['Email'],
  ['Phone'],
  ['Birthday', 'season'],
  ['Recovery answer', 'siblings'],
  ['Security Q: your pet?', 'pet'],
  ['Last login'],
];

export function AdminProfile({ fact, seed = '', pack, thumb = false }) {
  const shown = pack?.evidence?.profile?.[fact?.trait]?.[fact?.group] ?? '';
  const w = bars(`${seed}p`, PROFILE_FIELDS.length, 35, 95);
  if (thumb) {
    return (
      <div className="ev-shot-mini" role="img" aria-label="A leaked screenshot">
        <p>ADMIN</p><i style={{ width: `${w[0]}%` }} /><i style={{ width: `${w[1]}%` }} /><b>{shown}</b><i style={{ width: `${w[2]}%` }} />
      </div>
    );
  }
  return (
    <div className="ev-shot" role="img" aria-label={`A leaked screenshot of the admin account. ${PROFILE_FIELDS.find(([, t]) => t === fact?.trait)?.[0] ?? 'Recovery answer'}: ${shown}`}>
      <p className="ev-shot__bar"><span>ADMIN</span><b>DEEP BLUE</b><span>LEAKED</span></p>
      <div className="ev-shot__face" aria-hidden="true">?</div>
      <ul className="ev-shot__list">
        {PROFILE_FIELDS.map(([label, trait], i) => (
          <li key={label} className={trait === fact?.trait ? 'is-open' : ''}>
            <span className="ev-shot__k">{label}</span>
            {trait === fact?.trait
              ? <span className="ev-shot__v">{trait === 'siblings' || trait === 'pet' ? `“${shown}”` : `▓▓ · ${shown}`}</span>
              : <i className="ev-redact" style={{ width: `${w[i]}%` }} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
