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
 *    be asked. Since 2026-10-02 every answer is public (each guest's Contacts
 *    card shows the file), so the lie is no longer "my drink" but "the file is
 *    wrong about me", and the room checks the file against the person. That
 *    is what makes the room talk instead of just scanning.
 *
 * 3. Clues name a group, never a raw answer. "Gin" might describe 3 people in
 *    35, which is an accusation, not a clue. Groups ("a clear spirit", "no
 *    glasses") are sized so one clue splits the room roughly in half; the
 *    engine picks the group closest to 50% (see lib/engine/clues.js). Groups
 *    may overlap. Every option must sit in at least one group, and no group
 *    may contain every option, because it would say nothing.
 *
 *    That is also why the options can be fine-grained (18 tops, 12 kinds of
 *    footwear, every spirit on its own): the guest describes themselves
 *    exactly, and a clue still only names a group. Adding an option means
 *    placing it in groups and drawing it (os/art/portraitArt.js), never
 *    new clue art.
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
      { id: 'navy', label: 'Navy' },
      { id: 'blue', label: 'Sky / light blue' },
      { id: 'red', label: 'Red' },
      { id: 'pink', label: 'Pink' },
      { id: 'maroon', label: 'Maroon / wine' },
      { id: 'purple', label: 'Purple' },
      { id: 'green', label: 'Green' },
      { id: 'olive', label: 'Olive / khaki' },
      { id: 'yellow', label: 'Yellow' },
      { id: 'orange', label: 'Orange' },
      { id: 'brown', label: 'Brown / tan' },
      { id: 'beige', label: 'Beige / cream' },
      { id: 'stripes', label: 'Stripes' },
      { id: 'checks', label: 'Checks / plaid' },
      { id: 'print', label: 'Floral / print' },
    ],
    groups: [
      { id: 'dark', members: ['black', 'grey', 'navy', 'maroon', 'purple', 'olive', 'brown'] },
      { id: 'pale', members: ['white', 'grey', 'blue', 'pink', 'yellow', 'beige'] },
      { id: 'vivid', members: ['red', 'pink', 'orange', 'yellow', 'green', 'purple', 'blue', 'stripes', 'checks', 'print'] },
      {
        id: 'plain',
        members: ['black', 'white', 'grey', 'navy', 'blue', 'red', 'pink', 'maroon', 'purple', 'green', 'olive', 'yellow', 'orange', 'brown', 'beige'],
      },
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
      { id: 'canvas', label: 'Canvas shoes' },
      { id: 'loafers', label: 'Loafers' },
      { id: 'shoes', label: 'Formal shoes' },
      { id: 'boots', label: 'Boots' },
      { id: 'sandals', label: 'Sandals' },
      { id: 'slides', label: 'Flip-flops / slides' },
      { id: 'kolhapuri', label: 'Kolhapuris / juttis' },
      { id: 'crocs', label: 'Crocs / clogs' },
      { id: 'flats', label: 'Ballet flats' },
      { id: 'heels', label: 'Heels' },
      { id: 'wedges', label: 'Wedges / platforms' },
    ],
    groups: [
      { id: 'rubber', members: ['sneakers', 'canvas', 'crocs', 'slides'] },
      { id: 'leather', members: ['shoes', 'loafers', 'boots', 'kolhapuri', 'heels'] },
      { id: 'open', members: ['sandals', 'slides', 'kolhapuri', 'heels', 'wedges'] },
      { id: 'flat', members: ['sneakers', 'canvas', 'loafers', 'shoes', 'boots', 'sandals', 'slides', 'kolhapuri', 'crocs', 'flats'] },
    ],
  },
  {
    id: 'drink',
    prompt: "What's your first drink tonight?",
    visible: false,
    options: [
      { id: 'beer', label: 'Beer' },
      { id: 'wine', label: 'Red wine' },
      { id: 'whitewine', label: 'White / rosé wine' },
      { id: 'gin', label: 'Gin' },
      { id: 'vodka', label: 'Vodka' },
      { id: 'rum', label: 'Rum' },
      { id: 'whisky', label: 'Whisky' },
      { id: 'brandy', label: 'Brandy' },
      { id: 'tequila', label: 'Tequila' },
      { id: 'feni', label: 'Feni' },
      { id: 'cocktail', label: 'A cocktail' },
      { id: 'zero', label: 'Mocktail / soft drink' },
      { id: 'water', label: 'Water / nothing' },
    ],
    groups: [
      { id: 'hops', members: ['beer'] },
      { id: 'grape', members: ['wine', 'whitewine'] },
      { id: 'spirit', members: ['gin', 'vodka', 'rum', 'whisky', 'brandy', 'tequila', 'feni', 'cocktail'] },
      { id: 'clear', members: ['gin', 'vodka', 'tequila', 'feni', 'cocktail'] },
      { id: 'brewed', members: ['beer', 'wine', 'whitewine'] },
      { id: 'sober', members: ['zero', 'water'] },
      { id: 'strong', members: ['gin', 'vodka', 'rum', 'whisky', 'brandy', 'tequila', 'feni'] },
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

/**
 * Gender: asked at the door for the contact photo only (os/art/portraitArt.js
 * draws the figure from it). It is deliberately NOT in TRAITS, so the engine
 * never turns it into a clue and the Gallery's sketch of the hand never shows
 * it: nobody is ever accused, or outed, by a clue about their gender.
 *
 * It is stored on the guest's traits doc next to the six answers, so every
 * phone draws the same photo. Like the six, it is never edited after arrival.
 * Other guests' cards don't list it. Trans women and trans men are drawn as
 * women and men; every other answer gets the open figure.
 */
export const GENDER = {
  id: 'gender',
  prompt: 'How should we draw you?',
  options: [
    { id: 'woman', label: 'Woman' },
    { id: 'man', label: 'Man' },
    { id: 'nonbinary', label: 'Non-binary' },
    { id: 'transwoman', label: 'Trans woman' },
    { id: 'transman', label: 'Trans man' },
    { id: 'genderfluid', label: 'Genderfluid' },
    { id: 'genderqueer', label: 'Genderqueer' },
    { id: 'unsaid', label: 'Prefer not to say' },
  ],
};

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
