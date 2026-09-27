/**
 * Traits: the six questions every guest answers at the door.
 *
 * Deduction in Killers Night runs on these. When a Killer strikes, the clues
 * the room receives describe *the hand*, the Killer who did the killing, in
 * terms of these traits. So the room looks around and asks people about them.
 *
 * Three rules shape this file:
 *
 * 1. They are answered before roles exist. Nobody knows whether they will be a
 *    Killer when they tap "dark top", so nobody has a reason to lie on the
 *    form. The app keeps the true answers. Lying about them out loud later is
 *    part of the game.
 *
 * 2. Half are visible and half are not. Top, glasses and footwear can be
 *    checked by looking across the table. Drink, season and siblings have to
 *    be asked, and a Killer can lie about them. That mix is what makes the
 *    room talk instead of just scanning.
 *
 * 3. Clues name a group, never a raw answer. "Gin" might describe 3 people in
 *    35, which is an accusation, not a clue. Groups ("a clear spirit", "no
 *    glasses") are sized so one clue splits the room roughly in half; the
 *    engine picks the group closest to 50% (see lib/engine/clues.js). Groups
 *    may overlap. Every option must sit in at least one group, and no group
 *    may contain every option, because it would say nothing.
 *
 * Copy is one short line per question, answered with one tap. The flavour
 * text a clue shows lives in the story pack (data/packs/), not here, so the
 * same traits work in any setting.
 */

export const TRAITS = [
  {
    id: 'top',
    prompt: 'What colour is your top?',
    visible: true,
    options: [
      { id: 'black', label: 'Black' },
      { id: 'white', label: 'White' },
      { id: 'grey', label: 'Grey' },
      { id: 'blue', label: 'Blue / navy' },
      { id: 'red', label: 'Red / pink' },
      { id: 'green', label: 'Green' },
      { id: 'yellow', label: 'Yellow / orange' },
      { id: 'print', label: 'Print / pattern' },
    ],
    groups: [
      { id: 'dark', members: ['black', 'grey', 'blue'] },
      { id: 'pale', members: ['white', 'grey', 'yellow'] },
      { id: 'vivid', members: ['red', 'green', 'yellow', 'print'] },
      { id: 'plain', members: ['black', 'white', 'grey', 'blue', 'red', 'green', 'yellow'] },
    ],
  },
  {
    id: 'glasses',
    prompt: 'Are you wearing glasses?',
    visible: true,
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    groups: [
      { id: 'glasses', members: ['yes'] },
      { id: 'bare', members: ['no'] },
    ],
  },
  {
    id: 'shoes',
    prompt: 'What are you wearing on your feet?',
    visible: true,
    options: [
      { id: 'sneakers', label: 'Sneakers' },
      { id: 'shoes', label: 'Formal shoes' },
      { id: 'boots', label: 'Boots' },
      { id: 'sandals', label: 'Sandals / slides' },
      { id: 'heels', label: 'Heels' },
    ],
    groups: [
      { id: 'rubber', members: ['sneakers'] },
      { id: 'leather', members: ['shoes', 'boots', 'heels'] },
      { id: 'open', members: ['sandals', 'heels'] },
      { id: 'flat', members: ['sneakers', 'shoes', 'boots', 'sandals'] },
    ],
  },
  {
    id: 'drink',
    prompt: "What's your first drink tonight?",
    visible: false,
    options: [
      { id: 'beer', label: 'Beer' },
      { id: 'wine', label: 'Wine' },
      { id: 'clear', label: 'Gin / vodka / rum' },
      { id: 'brown', label: 'Whisky / brandy' },
      { id: 'cocktail', label: 'A cocktail' },
      { id: 'zero', label: 'Nothing alcoholic' },
    ],
    groups: [
      { id: 'hops', members: ['beer'] },
      { id: 'grape', members: ['wine'] },
      { id: 'spirit', members: ['clear', 'brown', 'cocktail'] },
      { id: 'clear', members: ['clear', 'cocktail'] },
      { id: 'brewed', members: ['beer', 'wine'] },
      { id: 'sober', members: ['zero'] },
      { id: 'strong', members: ['clear', 'brown'] },
    ],
  },
  {
    id: 'season',
    prompt: 'When is your birthday?',
    visible: false,
    options: [
      { id: 'q1', label: 'Jan – Mar' },
      { id: 'q2', label: 'Apr – Jun' },
      { id: 'q3', label: 'Jul – Sep' },
      { id: 'q4', label: 'Oct – Dec' },
    ],
    groups: [
      { id: 'early', members: ['q1', 'q2'] },
      { id: 'late', members: ['q3', 'q4'] },
      { id: 'cool', members: ['q4', 'q1'] },
      { id: 'warm', members: ['q2', 'q3'] },
    ],
  },
  {
    id: 'siblings',
    prompt: 'Where do you sit among your siblings?',
    visible: false,
    options: [
      { id: 'only', label: 'Only child' },
      { id: 'eldest', label: 'Eldest' },
      { id: 'middle', label: 'Middle' },
      { id: 'youngest', label: 'Youngest' },
    ],
    groups: [
      { id: 'firstborn', members: ['only', 'eldest'] },
      { id: 'younger', members: ['middle', 'youngest'] },
      { id: 'sibling', members: ['eldest', 'middle', 'youngest'] },
      { id: 'edge', members: ['eldest', 'youngest'] },
    ],
  },
];

export const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t]));

// Dev-time guard: a group that contains every option says nothing, and an
// option in no group can never be clued, so the hand it describes is
// invisible on that trait.
if (import.meta.env?.DEV) {
  for (const t of TRAITS) {
    const ids = new Set(t.options.map((o) => o.id));
    const covered = new Set(t.groups.flatMap((g) => g.members));
    for (const g of t.groups) {
      for (const m of g.members) {
        if (!ids.has(m)) console.error(`[traits] ${t.id}.${g.id} names unknown option ${m}`);
      }
      if (g.members.length >= ids.size) console.error(`[traits] ${t.id}.${g.id} contains every option`);
    }
    for (const id of ids) {
      if (!covered.has(id)) console.error(`[traits] ${t.id}: option ${id} is in no group`);
    }
  }
}
