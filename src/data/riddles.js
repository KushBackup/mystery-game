/**
 * THE RIDDLE LOCK — 100 riddles, one word each.
 *
 * These replace the printed clue cards. A player who wants a new piece of
 * evidence taps ASK on the Evidence screen, is given a riddle, and on solving it
 * is handed both the clue *and* its code — which is the whole point: the code is
 * shareable, so one solve can unseal the same clue on fifty other phones. The
 * riddle is the price of entry into the room's economy, not a gate on the story.
 *
 * Rules the deck follows, and must keep following:
 *
 *   1. **Nothing here touches the case.** Not the victim, not poison, not Goa,
 *      not birthdays, not spirits. A riddle that brushed the fiction would read
 *      as a clue, and players would spend the round theorising about the answer
 *      to a word puzzle. General riddles are inert on purpose.
 *   2. **One word.** The player types it on a phone keyboard, standing up, in a
 *      loud room. Anything requiring a space is a wrong answer waiting to happen.
 *   3. **`alt` is generous.** Plurals, the common near-miss, the British
 *      spelling. Being right and being marked wrong is the one failure mode this
 *      screen cannot afford — the reward moment is the whole feature.
 *   4. **No answer may equal a login code or a clue code.** A solved riddle is a
 *      word the player now knows and will happily type into any box in the app.
 *      `echo`, `cloud` and `compass` all sat here until 2026-08-07: the first two
 *      were Fabiola's and Mahi's login codes, so solving r001 handed you someone
 *      else's identity, and the third was Roddy's accusation code. The dev-only
 *      assertion at the bottom of gameData.js now covers this deck too — the
 *      three namespaces reachable from a keyboard are one namespace.
 *
 * Riddles are dealt at *random*, not from a stable hash, which is the opposite
 * of every other deck in this project (see `dealt()` in gameData.js). That is
 * deliberate. The stable decks want the room to be able to say "the third one"
 * and mean the same card; this deck wants the person beside you to be holding a
 * different puzzle, so shouting an answer across the room does nothing. What is
 * stable is the *clue* a solve pays out — see `riddleQueueFor()` in gameData.js.
 */

export const RIDDLES = [
  { id: 'r001', q: 'I follow every flash of light across the sky, I arrive late every single time, and I have never once broken anything. What am I?', a: 'thunder' },
  { id: 'r002', q: 'I have keys but open no locks. I have space but no room. You can enter, but you cannot go outside. What am I?', a: 'keyboard' },
  { id: 'r003', q: 'I am tall when I am young and short when I am old. What am I?', a: 'candle' },
  { id: 'r004', q: 'I have cities but no houses, forests but no trees, and water but no fish. What am I?', a: 'map' },
  { id: 'r005', q: 'The more you take, the more you leave behind. What are they?', a: 'footsteps', alt: ['footstep', 'footprints', 'steps', 'footprint'] },
  { id: 'r006', q: 'I follow you everywhere in daylight and desert you the moment the sun goes down. What am I?', a: 'shadow', alt: ['shadows'] },
  { id: 'r007', q: 'I am so fragile that saying my name breaks me. What am I?', a: 'silence', alt: ['quiet'] },
  { id: 'r008', q: 'I travel all over the world without ever leaving my corner. What am I?', a: 'stamp', alt: ['stamps'] },
  { id: 'r009', q: 'The more I dry, the wetter I get. What am I?', a: 'towel', alt: ['towels'] },
  { id: 'r010', q: 'If you have me, you want to share me. If you share me, you no longer have me. What am I?', a: 'secret', alt: ['secrets'] },
  { id: 'r011', q: 'I have hands but cannot clap, and a face but never smile. What am I?', a: 'clock', alt: ['watch'] },
  { id: 'r012', q: 'I have a single eye but cannot see, and I pull thread through cloth all day. What am I?', a: 'needle', alt: ['needles'] },
  { id: 'r013', q: 'I have a mouth but never speak, and a bed but never sleep. What am I?', a: 'river', alt: ['rivers'] },
  { id: 'r014', q: 'I have a neck but no head, and a body that holds nothing solid. What am I?', a: 'bottle', alt: ['bottles'] },
  { id: 'r015', q: 'I have hundreds of ears but cannot hear a word, and I wear a golden coat. What am I?', a: 'corn', alt: ['cornfield', 'maize', 'corncob'] },
  { id: 'r016', q: 'A box without hinges, key, or lid — yet a golden treasure inside is hid. What is it?', a: 'egg', alt: ['eggs'] },
  { id: 'r017', q: 'I am not alive, but I grow. I have no lungs, but I need air. I have no mouth, but water kills me. What am I?', a: 'fire', alt: ['flame'] },
  { id: 'r018', q: 'The more of me there is, the less you see. What am I?', a: 'darkness', alt: ['dark', 'night'] },
  { id: 'r019', q: 'Everyone talks about me, everyone waits for me, and I never actually arrive. What am I?', a: 'tomorrow' },
  { id: 'r020', q: 'It belongs to you, but other people use it far more than you do. What is it?', a: 'name' },
  { id: 'r021', q: 'I have eighty-eight keys and open no doors at all. What am I?', a: 'piano' },
  { id: 'r022', q: 'I am full of holes, and still I hold water. What am I?', a: 'sponge' },
  { id: 'r023', q: 'I have five fingers and not a single bone. What am I?', a: 'glove', alt: ['gloves'] },
  { id: 'r024', q: 'I show you yourself, only backwards. Reach for me and you meet your own fingertip. What am I?', a: 'mirror' },
  { id: 'r025', q: 'I let the light in and keep the rain out. What am I?', a: 'window', alt: ['windows'] },
  { id: 'r026', q: 'I go up and I go down, and I never move an inch. What am I?', a: 'stairs', alt: ['stair', 'staircase', 'steps'] },
  { id: 'r027', q: 'The more you take away from me, the bigger I become. What am I?', a: 'hole', alt: ['holes'] },
  { id: 'r028', q: 'You can hold me without your hands, and you lose me by talking too long. What am I?', a: 'breath' },
  { id: 'r029', q: 'I can be made, given, broken and kept — and I am not a thing you can touch. What am I?', a: 'promise' },
  { id: 'r030', q: 'You cannot see me, but you feel me pass and hear me in the trees. What am I?', a: 'wind' },
  { id: 'r031', q: 'I have a hundred legs and cannot stand, a long neck and no head, and I keep the floor honest. What am I?', a: 'broom', alt: ['brooms'] },
  { id: 'r032', q: 'I fall and fall all day and never hurt myself once. What am I?', a: 'rain' },
  { id: 'r033', q: 'I am white when I arrive and clear when I leave. What am I?', a: 'snow' },
  { id: 'r034', q: 'I am water you can pick up and carry. What am I?', a: 'ice' },
  { id: 'r035', q: 'I have branches but no leaves, no trunk and no bark — and I keep your money. What am I?', a: 'bank' },
  { id: 'r036', q: 'I stand still my whole life, put on a new coat each spring, and drop it every autumn. What am I?', a: 'tree' },
  { id: 'r037', q: 'I have a spine and hundreds of pages and not one bone. What am I?', a: 'book' },
  { id: 'r038', q: 'I have layer after layer, and cutting into me will make you cry. What am I?', a: 'onion' },
  { id: 'r039', q: 'I have eyes and cannot see, and I grow beneath the ground. What am I?', a: 'potato', alt: ['potatoes'] },
  { id: 'r040', q: 'The more I work, the shorter I get, and I leave a grey trail behind me. What am I?', a: 'pencil' },
  { id: 'r041', q: 'I make mistakes disappear and lose a little of myself each time. What am I?', a: 'eraser', alt: ['rubber'] },
  { id: 'r042', q: 'I have a tongue and a sole and can neither taste nor feel. What am I?', a: 'shoe', alt: ['shoes'] },
  { id: 'r043', q: 'I lose a page every day and a whole self every year. What am I?', a: 'calendar' },
  { id: 'r044', q: 'I am round, I turn all day, and without me every journey stops. What am I?', a: 'wheel', alt: ['wheels'] },
  { id: 'r045', q: 'I have no legs, yet I run through towns, over hills and across whole countries. What am I?', a: 'road', alt: ['roads', 'street', 'highway'] },
  { id: 'r046', q: 'I join two sides together and belong to neither of them. What am I?', a: 'bridge' },
  { id: 'r047', q: 'I open what is shut and shut what is open, and I live on a ring in your pocket. What am I?', a: 'key', alt: ['keys'] },
  { id: 'r048', q: 'I live in a house of thirty-two and I never rest while you are speaking. What am I?', a: 'tongue' },
  { id: 'r049', q: 'Thirty-two white horses on a red hill. First they champ, then they stamp, then they stand still. What are they?', a: 'teeth', alt: ['tooth'] },
  { id: 'r050', q: 'I beat without ever bruising, and I break without making a sound. What am I?', a: 'heart' },
  { id: 'r051', q: 'I run without legs, and I get blocked without being a road. What am I?', a: 'nose' },
  { id: 'r052', q: 'I visit you at night, feel completely real, and am gone by breakfast. What am I?', a: 'dream', alt: ['dreams'] },
  { id: 'r053', q: 'I rise without climbing and set without sinking. What am I?', a: 'sun' },
  { id: 'r054', q: 'I change my shape every night and never lose an ounce of my size. What am I?', a: 'moon' },
  { id: 'r055', q: 'What kind of bow can never be tied?', a: 'rainbow' },
  { id: 'r056', q: 'Water surrounds me on every side and I have never once drifted away. What am I?', a: 'island' },
  { id: 'r057', q: 'I have a foot and a peak and I have never taken a single step. What am I?', a: 'mountain' },
  { id: 'r058', q: 'I have steps but no legs, and I exist only to help you rise. What am I?', a: 'ladder' },
  { id: 'r059', q: 'The harder you pull at me, the tighter I get. What am I?', a: 'knot' },
  { id: 'r060', q: 'I point the way without a word, I wait at every crossroads, and I have never taken a single step. What am I?', a: 'signpost', alt: ['sign', 'signposts', 'signs'] },
  { id: 'r061', q: 'What five-letter word becomes shorter when you add two letters to it?', a: 'short' },
  { id: 'r062', q: 'I have a head and a tail and no body at all, and I settle arguments by falling. What am I?', a: 'coin' },
  { id: 'r063', q: 'Forwards I am very heavy. Backwards I am not. What word am I?', a: 'ton' },
  { id: 'r064', q: 'I am an odd number. Take away one letter and I become even. What number am I?', a: 'seven' },
  { id: 'r065', q: 'What begins with T, ends with T, and has T inside it?', a: 'teapot' },
  { id: 'r066', q: 'You can catch me but never throw me, and I will make you sneeze. What am I?', a: 'cold', alt: ['acold'] },
  { id: 'r067', q: 'What has a bottom right at the top?', a: 'legs', alt: ['leg'] },
  { id: 'r068', q: 'I have an eye and no face, and I can flatten a city. What am I?', a: 'hurricane', alt: ['storm', 'cyclone', 'typhoon', 'tornado'] },
  { id: 'r069', q: 'I run all the way around the garden and never move a step. What am I?', a: 'fence' },
  { id: 'r070', q: 'What kind of coat is only ever put on wet?', a: 'paint' },
  { id: 'r071', q: 'What building holds the most stories?', a: 'library' },
  { id: 'r072', q: 'I only ever go up, and I never once come back down. What am I?', a: 'age' },
  { id: 'r073', q: 'I have a ring and no finger, and I will not stop until you answer. What am I?', a: 'phone', alt: ['telephone'] },
  { id: 'r074', q: 'What kind of room has no doors, no windows and no floor?', a: 'mushroom' },
  { id: 'r075', q: 'What word is spelled wrongly in every dictionary ever printed?', a: 'incorrectly', alt: ['wrongly'] },
  { id: 'r076', q: 'I can fill an entire room and take up no space at all. What am I?', a: 'light' },
  { id: 'r077', q: 'I am black when I am clean and white when I am dirty. What am I?', a: 'blackboard', alt: ['chalkboard'] },
  { id: 'r078', q: 'You can give it to someone and still keep it entirely. What is it?', a: 'word', alt: ['yourword'] },
  { id: 'r079', q: 'Four legs in the morning, two at noon, three in the evening. What am I?', a: 'human', alt: ['man', 'person', 'people'] },
  { id: 'r080', q: 'What kind of tree can you carry around in your hand?', a: 'palm', alt: ['palmtree'] },
  { id: 'r081', q: 'I fly without wings, I heal without medicine, and nobody can buy a second of me. What am I?', a: 'time' },
  { id: 'r082', q: 'I have one head, one foot and four legs, and I have never gone anywhere. What am I?', a: 'bed' },
  { id: 'r083', q: 'I can be cracked, made, told and played. What am I?', a: 'joke' },
  { id: 'r084', q: 'I have four legs and never walk, and everyone leans on me at dinner. What am I?', a: 'table' },
  { id: 'r085', q: 'I am extremely easy to get into and remarkably hard to get out of. What am I?', a: 'trouble' },
  { id: 'r086', q: 'What kind of nut has no shell at all and a hole through the middle?', a: 'donut', alt: ['doughnut'] },
  { id: 'r087', q: 'I have a heart that has never beaten once, and you eat me leaf by leaf. What am I?', a: 'artichoke' },
  { id: 'r088', q: 'I am orange, I grow underground, and I sound almost exactly like a parrot. What am I?', a: 'carrot', alt: ['carrots'] },
  { id: 'r089', q: 'I have a neck and no head, two arms and no hands, and buttons that do not press. What am I?', a: 'shirt' },
  { id: 'r090', q: 'I have a great many teeth and I have never bitten anyone. What am I?', a: 'comb' },
  { id: 'r091', q: 'I can go up a chimney down, but I can never go down a chimney up. What am I?', a: 'umbrella' },
  { id: 'r092', q: 'I have a ring and no jewel, and my only job is to end your sleep. What am I?', a: 'alarm', alt: ['alarmclock'] },
  { id: 'r093', q: 'What kind of ship has two mates and no captain?', a: 'relationship' },
  { id: 'r094', q: 'I am a word of letters three. Add two more and fewer there will be. What word am I?', a: 'few' },
  { id: 'r095', q: 'I start with E, I end with E, and I contain only one letter. What am I?', a: 'envelope' },
  { id: 'r096', q: 'What kind of key is best for opening a banana?', a: 'monkey' },
  { id: 'r097', q: 'What has four eyes and cannot see a thing?', a: 'mississippi' },
  { id: 'r098', q: 'What five-letter word sounds exactly the same after you remove four of its letters?', a: 'queue' },
  { id: 'r099', q: 'I carry thousands of needles on my back and I have never sewn a stitch. What am I?', a: 'porcupine', alt: ['hedgehog'] },
  { id: 'r100', q: 'Greater than any god, more evil than the devil. The poor have me, the rich need me, and if you eat me you die. What am I?', a: 'nothing' },
];

/**
 * Answers are compared on letters and digits only, folded to lowercase.
 *
 * A phone in a dark room supplies smart apostrophes, a trailing space from the
 * autocomplete bar, a capital from autocapitalize, and often a leading article —
 * "a towel", "the echo". None of those is a wrong answer, so none of them is
 * allowed to be marked as one. The leading article is stripped separately below
 * because `an` and `a` are themselves letters and survive the character filter.
 */
const normalise = (value) =>
  String(value)
    .toLowerCase()
    .replace(/^(?:an?|the)\s+/, '')
    .replace(/[^a-z0-9]/g, '');

export const isCorrectAnswer = (riddle, guess) => {
  const said = normalise(guess);
  if (!said) return false;
  return [riddle.a, ...(riddle.alt || [])].some((accepted) => normalise(accepted) === said);
};

const SEEN_KEY = 'astral.riddles.seen';

const readSeen = () => {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private-mode Safari throws on storage access; every riddle is simply new.
    return [];
  }
};

const writeSeen = (ids) => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable — repeats become possible, which is survivable.
  }
};

/**
 * Deal a riddle the player has not been shown yet.
 *
 * `seen` is persisted rather than kept in component state because the modal is
 * unmounted every time it closes, and a player who solves six riddles over an
 * evening should meet six different puzzles. Once all hundred are used the list
 * resets — a game where somebody has answered a hundred riddles has earned a
 * second lap, and an empty screen would be worse than a repeat.
 *
 * `avoid` is the riddle currently on screen, so "another riddle" never deals the
 * same card back. It is excluded even on the reset lap.
 */
export const dealRiddle = (avoid = null) => {
  const seen = new Set(readSeen());

  let pool = RIDDLES.filter((r) => !seen.has(r.id) && r.id !== avoid);
  if (pool.length === 0) {
    writeSeen([]);
    pool = RIDDLES.filter((r) => r.id !== avoid);
  }

  return pool[Math.floor(Math.random() * pool.length)];
};

/** Called on a solve, not on a deal — a skipped riddle should come back around. */
export const markRiddleSolved = (id) => {
  const seen = readSeen();
  if (seen.includes(id)) return;
  writeSeen([...seen, id]);
};

export const solvedRiddleCount = () => readSeen().length;
