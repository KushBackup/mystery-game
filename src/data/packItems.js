/**
 * PACK THE BAG, the third morning game (engine/minigames.js, os/game/PackGame.jsx).
 *
 * Most guests are told where the room is going; the Killers only get the
 * hint. Everyone packs three things from the same twelve. The bags open
 * together at the end, so a Killer who packed for the wrong trip shows.
 *
 * ITEMS is the drawn sheet, in order: index k is cell k of
 * public/pack/items.webp, 10 across and 5 down, drawn in
 * splash-film/items.html. Never reorder one without the other.
 *
 * PLACES come in pairs that share a hint, so a Killer who only has the hint
 * still has two trips to choose between (minigames.js dealPack puts both on
 * the grid). Every place owns five items, and no item belongs to two places.
 */

export const ITEMS = [
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'sunscreen', label: 'Sunscreen' },
  { id: 'flipflops', label: 'Flip-flops' },
  { id: 'beachball', label: 'Beach ball' },
  { id: 'towel', label: 'Towel' },
  { id: 'tent', label: 'Tent' },
  { id: 'torch', label: 'Torch' },
  { id: 'marshmallow', label: 'Marshmallows' },
  { id: 'sleepingbag', label: 'Sleeping bag' },
  { id: 'compass', label: 'Compass' },
  { id: 'ring', label: 'Ring' },
  { id: 'bouquet', label: 'Bouquet' },
  { id: 'bowtie', label: 'Bow tie' },
  { id: 'invitation', label: 'Invitation' },
  { id: 'heels', label: 'Heels' },
  { id: 'balloon', label: 'Balloon' },
  { id: 'partyhat', label: 'Party hat' },
  { id: 'cake', label: 'Cake' },
  { id: 'gift', label: 'Gift' },
  { id: 'partyhorn', label: 'Party horn' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'bottle', label: 'Water bottle' },
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'shaker', label: 'Protein shaker' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'mug', label: 'Coffee mug' },
  { id: 'stapler', label: 'Stapler' },
  { id: 'badge', label: 'ID badge' },
  { id: 'stickies', label: 'Sticky notes' },
  { id: 'passport', label: 'Passport' },
  { id: 'suitcase', label: 'Suitcase' },
  { id: 'boardingpass', label: 'Boarding pass' },
  { id: 'neckpillow', label: 'Neck pillow' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'carkeys', label: 'Car keys' },
  { id: 'map', label: 'Map' },
  { id: 'chips', label: 'Chips' },
  { id: 'camera', label: 'Camera' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'pan', label: 'Frying pan' },
  { id: 'whisk', label: 'Whisk' },
  { id: 'chefhat', label: 'Chef’s hat' },
  { id: 'rollingpin', label: 'Rolling pin' },
  { id: 'mitt', label: 'Oven mitt' },
  { id: 'pillow', label: 'Pillow' },
  { id: 'alarmclock', label: 'Alarm clock' },
  { id: 'teddy', label: 'Teddy bear' },
  { id: 'slippers', label: 'Slippers' },
  { id: 'lamp', label: 'Bedside lamp' },
];

export const ITEM_INDEX = Object.fromEntries(ITEMS.map((it, k) => [it.id, k]));
export const itemLabel = (id) => ITEMS[ITEM_INDEX[id]]?.label ?? id;

export const PLACES = [
  { id: 'beach', name: 'The beach', hint: 'Somewhere outdoors', items: ['sunglasses', 'sunscreen', 'flipflops', 'beachball', 'towel'] },
  { id: 'camping', name: 'A camping trip', hint: 'Somewhere outdoors', items: ['tent', 'torch', 'marshmallow', 'sleepingbag', 'compass'] },
  { id: 'wedding', name: 'A wedding', hint: 'A celebration', items: ['ring', 'bouquet', 'bowtie', 'invitation', 'heels'] },
  { id: 'birthday', name: 'A birthday party', hint: 'A celebration', items: ['balloon', 'partyhat', 'cake', 'gift', 'partyhorn'] },
  { id: 'gym', name: 'The gym', hint: 'A weekday routine', items: ['dumbbell', 'bottle', 'sneakers', 'stopwatch', 'shaker'] },
  { id: 'office', name: 'The office', hint: 'A weekday routine', items: ['laptop', 'mug', 'stapler', 'badge', 'stickies'] },
  { id: 'flight', name: 'A long flight', hint: 'Going on a trip', items: ['passport', 'suitcase', 'boardingpass', 'neckpillow', 'headphones'] },
  { id: 'roadtrip', name: 'A road trip', hint: 'Going on a trip', items: ['carkeys', 'map', 'chips', 'camera', 'guitar'] },
  { id: 'kitchen', name: 'The kitchen', hint: 'Somewhere at home', items: ['pan', 'whisk', 'chefhat', 'rollingpin', 'mitt'] },
  { id: 'bedroom', name: 'The bedroom', hint: 'Somewhere at home', items: ['pillow', 'alarmclock', 'teddy', 'slippers', 'lamp'] },
];

if (import.meta.env?.DEV) {
  const owned = PLACES.flatMap((p) => p.items);
  const bad = owned.filter((id, k) => !(id in ITEM_INDEX) || owned.indexOf(id) !== k);
  if (bad.length || owned.length !== ITEMS.length) console.warn('[packItems] every item must belong to exactly one place:', bad);
  for (const p of PLACES) if (PLACES.filter((q) => q.hint === p.hint).length !== 2) console.warn(`[packItems] ${p.id}'s hint must be shared by exactly two places`);
}
