/**
 * Evidence: what form a clue takes when it reaches a phone.
 *
 * The engine only ever deals in facts, `{ trait, group }` (lib/engine/clues.js).
 * This file decides, on the phone, what each fact *looks like*: a CCTV still,
 * a few seconds of CCTV footage, a bar receipt, a leaked screenshot of the
 * admin's account, or a voice note from a stranger. Every form says exactly
 * the same thing as the still would. It is presentation only: no Firestore
 * field, no rule, no change to the balance.
 *
 * The choice is seeded by the delivery's id and its trait, so every phone (and
 * every re-render) shows the same item, and two people holding the same fact
 * may well hold it in different forms. That is on purpose: the room compares a
 * receipt with a photo and finds they agree.
 *
 * The forms each trait can take are chosen so the picture can show the GROUP
 * and never a raw answer (see the rule in art/CluePhoto.jsx). A receipt prints
 * a category ("SPIRIT, NEAT"), never a brand; a voice note hears heels, it
 * never sees the shoe.
 */

import { hashString } from './art/pixels.js';

/** The forms each trait can arrive in. `still` is always first: it is the fallback. */
export const FORMS = {
  top: ['still', 'clip'],
  glasses: ['still', 'clip'],
  shoes: ['still', 'clip', 'voice'],
  drink: ['still', 'receipt'],
  season: ['still', 'profile'],
  siblings: ['still', 'profile'],
};

/** What a form is called in a badge, a thread line and a screen reader. */
export const FORM_NAME = {
  still: 'Photo',
  clip: 'Video',
  receipt: 'Receipt',
  profile: 'Screenshot',
  voice: 'Voice note',
};

/** How long a clip or a voice note runs, for the badge. */
export const CLIP_SECONDS = 4;
export const VOICE_SECONDS = 7;

/**
 * The form `fact` takes for this seed. `seed` is the inbox doc id, or any
 * string that is the same on every phone (the paper's witness uses its day).
 */
export function formFor(fact, seed) {
  const list = FORMS[fact?.trait] ?? ['still'];
  return list[hashString(`${seed}|${fact?.trait}`) % list.length];
}

/** The form of an inbox delivery. */
export const mediaFor = (d) => formFor(d?.fact, d?.id ?? '');
