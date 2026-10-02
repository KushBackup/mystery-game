/**
 * Story packs, and the helpers that turn engine ids into words.
 *
 * To add a setting: copy greenr.js, rewrite its lines, add it to PACKS. Every
 * trait group in data/traits.js needs a clueText line; the dev check below
 * names any that are missing.
 */

import greenr from './greenr.js';
import deepblue from './deepblue.js';
import { TRAITS, TRAIT_BY_ID } from '../traits.js';

export const PACKS = { [deepblue.id]: deepblue, [greenr.id]: greenr };
export const DEFAULT_PACK_ID = deepblue.id;

export const packFor = (id) => PACKS[id] ?? PACKS[DEFAULT_PACK_ID];

/**
 * The morning games' words: a pack's own, or DEEP BLUE's if it has none
 * (greenr predates them). `dayGames` names and explains each game.
 */
export const dayKit = (pack) => ({
  dayGames: pack?.dayGames ?? deepblue.dayGames,
  wordPairs: pack?.wordPairs?.length ? pack.wordPairs : deepblue.wordPairs,
  drawWords: pack?.drawWords?.length ? pack.drawWords : deepblue.drawWords,
});

/**
 * The two narration lines for a beat, with {name} filled, plus any other
 * {key} from `vars`. A pack without the beat falls back to `fallback`, so
 * an older pack (greenr has no dawnRig or dawnDeep) still says something true.
 */
export function narrate(pack, beat, name = '', vars = {}, fallback = null) {
  const lines = pack.narration[beat] ?? (fallback ? pack.narration[fallback] : null) ?? [];
  return lines.map((line) => Object.entries({ name, ...vars }).reduce((l, [k, v]) => l.replaceAll(`{${k}}`, String(v ?? '')), line));
}

/** The alarm headline for day `cycle`. */
export const alarmLine = (pack, cycle) => {
  const list = pack.alarm ?? [];
  return list.length ? list[Math.min(Math.max(cycle, 1), list.length) - 1] : `DAY ${cycle}.`;
};

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
