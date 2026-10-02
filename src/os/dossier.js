/**
 * Contacts: what each guest answered at the door.
 *
 * The six arrival answers (traits/{pid}) are public to every phone and frozen
 * at the deal. They are what a guest *said*, which is not always the truth:
 * an answer may not have been on the form, or someone lied. So the one thing
 * a card lets this phone do is mark whether an answer matches what it sees
 * or what the guest actually says — local only (seen.js), never Firestore,
 * so nobody can read anyone else's marks.
 */

import { TRAIT_BY_ID } from '../data/traits.js';

export const checksKey = (gid) => `${gid}.contacts.checks`; // { pid: { trait: 'ok' | optionId | 'other' } }

/** The field label on a card, iOS-contact style: short and lower case. */
export const FIELD = { top: 'top', glasses: 'glasses', shoes: 'feet', drink: 'first drink', season: 'birthday', siblings: 'siblings' };

export const answerLabel = (traitId, value) => TRAIT_BY_ID[traitId]?.options.find((o) => o.id === value)?.label ?? null;

/** The three answers you could check across a table, as one line: "Black top · glasses · Sneakers". */
export function lookLine(t) {
  if (!t) return null;
  const parts = [
    answerLabel('top', t.top) && `${answerLabel('top', t.top)} top`,
    t.glasses === 'yes' ? 'glasses' : t.glasses === 'no' ? 'no glasses' : null,
    answerLabel('shoes', t.shoes),
  ];
  return parts.filter(Boolean).join(' · ') || null;
}
