/**
 * Story packs, and the helpers that turn engine ids into words.
 *
 * To add a setting: copy greenr.js, rewrite its lines, add it to PACKS. Every
 * trait group in data/traits.js needs a clueText line; the dev check below
 * names any that are missing.
 */

import greenr from './greenr.js';
import { TRAITS, TRAIT_BY_ID } from '../traits.js';

export const PACKS = { [greenr.id]: greenr };
export const DEFAULT_PACK_ID = greenr.id;

export const packFor = (id) => PACKS[id] ?? PACKS[DEFAULT_PACK_ID];

/** The two narration lines for a beat, with {name} filled. */
export function narrate(pack, beat, name = '') {
  return (pack.narration[beat] ?? []).map((line) => line.replaceAll('{name}', name));
}

/**
 * A clue card's words: the pack's flavour line, plus a plain sentence built
 * from the trait's option labels, e.g. "The killer's first drink: Gin /
 * vodka / rum, Whisky / brandy or A cocktail". The flavour can be evocative
 * because the plain line underneath always says exactly what it means.
 */
export function clueWords(pack, fact) {
  const trait = TRAIT_BY_ID[fact.trait];
  const group = trait?.groups.find((g) => g.id === fact.group);
  if (!trait || !group) return { flavour: '', plain: '' };
  const labels = group.members.map((m) => trait.options.find((o) => o.id === m)?.label ?? m);
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}` : labels[0];
  const say = PLAIN[trait.id];
  return {
    flavour: pack.clueText?.[fact.trait]?.[fact.group] ?? '',
    plain: say ? say(list, group.members) : `The killer: ${list}`,
  };
}

const PLAIN = {
  top: (list) => `The killer's top: ${list}`,
  glasses: (_, members) => (members.includes('yes') ? 'The killer wears glasses' : 'The killer wears no glasses'),
  shoes: (list) => `The killer's feet: ${list}`,
  drink: (list) => `The killer's first drink: ${list}`,
  season: (list) => `The killer's birthday: ${list}`,
  siblings: (list) => `The killer is: ${list}`,
};

if (import.meta.env?.DEV) {
  for (const pack of Object.values(PACKS)) {
    for (const t of TRAITS) {
      for (const g of t.groups) {
        if (!pack.clueText?.[t.id]?.[g.id]) console.error(`[packs] ${pack.id} has no clue line for ${t.id}.${g.id}`);
      }
    }
  }
}
