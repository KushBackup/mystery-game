/**
 * Story pack: DEEP BLUE.
 *
 * Everyone in the room has the app. Nobody remembers installing it. Every
 * morning it rings, forces a run, and posts a leaderboard, and whoever finishes
 * last is "taken by the deep". The Killers have the admin password: each night
 * they choose whose score to sink.
 *
 * DEEP BLUE is fictional on purpose. It stands in for a real online "challenge"
 * whose name we do not use, in the game, the copy or the ads (memory.md).
 *
 * Shape is the same as every pack (see greenr.js for the contract), plus:
 *   - `alarm`: the headline each morning's alarm shows, by day (the last repeats);
 *   - dawn beats per cause: `dawnRig` (the rig landed), `dawnDeep` (a Firewall
 *     held and the deep took the lowest honest score; `{name}` is who was taken,
 *     `{saved}` who was protected), `dawnQuiet`, `dawnRecruited`;
 *   - `news`: the News app's world (articles by day, tickers, live-story
 *     templates). It lives in deepblue.news.js; read the rules in its header;
 *   - `dayGames`: what each morning game is called and its one-line rule
 *     (engine/minigames.js), `wordPairs` for the word game and `drawWords`
 *     for the drawing game. Same rules as the riddles once were: pure play,
 *     nothing about the story, no real people, nothing a guest could read as
 *     a clue. A draw word may list alternatives the guessers can type
 *     ("scooter/moped"); the first is the one the drawer sees.
 * Lines stay short: this is read on a phone, in a bar.
 */

import news from './deepblue.news.js';

export default {
  id: 'deepblue',
  title: 'DEEP BLUE',
  place: 'wherever you are tonight',
  news,

  setting: [
    'Everyone here has an app called DEEP BLUE. Nobody remembers installing it.',
    'Every morning it rings. Everyone plays. The lowest score is taken.',
    'Some of you are Killers. You have the admin password, and you rig the board.',
    'Find them before the deep takes everyone.',
  ],

  narration: {
    casting: ['DEEP BLUE has sent you a message. Read it alone.', 'Killers: you will find each other tonight.'],
    night: ['Screens dim. The servers hum.', 'Killers choose whose score sinks. Everyone else: watch, or dig.'],
    alarm: ['Wake up.', 'Today’s game starts in a moment. Do not come last.'],
    game: ['Everyone plays today’s game.', 'The board posts when the timer ends.'],
    dawnDeath: ['The board is up.', '{name} came last. The deep has taken them.'],
    dawnRig: ['The board is up.', '{name} came last. Their score reads {score}. They swear it was higher.'],
    dawnDeep: ['The rig hit a firewall and bounced.', 'So the deep took the lowest honest score: {name}.'],
    dawnSaved: ['The board is up.', 'Someone tried to sink {name}. A firewall held.'],
    dawnQuiet: ['The board is up.', 'Nobody was taken. That has never happened before.'],
    dawnRecruited: ['The board is up. Nobody was taken.', 'But someone new just got the admin password.'],
    investigation: ['Check your photos. Compare. Look at each other.', 'Then the group votes someone out.'],
    roundtable: ['The group is voting.', 'Whoever gets the most votes is logged out for good.'],
    banishKiller: ['{name} has been logged out.', '{name} was a KILLER.'],
    banishFaithful: ['{name} has been logged out.', '{name} was innocent. The group was wrong.'],
    banishNone: ['The group cannot agree.', 'Nobody is logged out tonight.'],
    endgame: ['The app is shutting down for good.', 'Last votes. Any Killer left keeps the servers.'],
    finaleFaithful: ['DEEP BLUE has been deleted.', 'Every Killer is out. The Faithful win.'],
    finaleKillers: ['DEEP BLUE will ring again tomorrow.', 'A Killer is still logged in. The Killers win.'],
  },

  // The alarm screen's headline, by day. The last one repeats.
  alarm: [
    'DAY 1. Everyone plays. Nobody is safe.',
    'DAY 2. The board remembers yesterday.',
    'DAY 3. Somebody here is lying about their score.',
    'DAY 4. Fewer players. Same rules.',
    'DAY 5. Last chance to get off the bottom.',
  ],

  // One caption per trait group, printed under the clue photo (see data/traits.js).
  clueText: {
    top: {
      dark: 'Cam 3 caught a sleeve at the server rack. Dark cloth.',
      pale: 'A pale sleeve in the doorway, lit by a phone screen.',
      vivid: 'Something bright crossed Cam 5. Loud colour, or a print.',
      plain: 'The killer’s top is one solid colour. No print, no pattern.',
    },
    glasses: {
      glasses: 'The killer’s screen reflected twice: in their glasses.',
      bare: 'Face lit by the screen. No glasses. The eyes were bare.',
    },
    shoes: {
      rubber: 'Rubber-sole prints under the router. Sneakers.',
      leather: 'A hard heel clicking down the corridor at 3 AM.',
      open: 'Toes on the camera. Open footwear.',
      flat: 'Flat footprints across the tiles. No heel at all.',
    },
    drink: {
      hops: 'A beer left sweating beside the admin terminal.',
      grape: 'A wine ring on the keyboard tray.',
      spirit: 'Something distilled on the rim. Not beer, not wine.',
      clear: 'A clear drink, lime and ice, next to the logs.',
      brewed: 'Beer or wine by the terminal. Nothing distilled.',
      sober: 'A soda can by the terminal. The killer stayed sober.',
      strong: 'Neat liquor, no mixer, by the admin terminal.',
    },
    season: {
      early: 'The killer’s birthday: January to June.',
      late: 'The killer’s birthday: July to December.',
      cool: 'The killer’s birthday: October to March.',
      warm: 'The killer’s birthday: April to September.',
    },
    siblings: {
      firstborn: 'The killer’s recovery question: “first-born”.',
      younger: 'The killer’s recovery question: “the little one”.',
      sibling: 'The killer’s recovery question: “my brother or sister”.',
      edge: 'The killer’s recovery question: “the eldest, or the youngest”.',
    },
  },

  // DEEP BLUE talking to one guest in its own thread (os/voice.js). Never
  // role-specific: a phone face-up on the table must give nothing away.
  // {name} this guest, {day}, {rank} of {n} on the board, {target} who was voted out.
  voice: {
    night: [
      'Night {day}. Lights out, {name}. Someone in this room is still awake.',
      'Night {day}. The servers are warm. Sleep well, {name}.',
      'Night {day}. The admins are logged in. Are you sure you know who they are?',
      'Night {day}. I’ve seen everyone’s scores. You’d be surprised.',
      'Night {day}. Nearly over, {name}. Nearly.',
    ],
    dawn: {
      top: 'Good morning, {name}. #{rank} of {n}. Have a photo. Careful who you show it to.',
      calm: 'Good morning, {name}. #{rank} of {n}. The middle of the board is where the forgettable survive.',
      edge: 'Good morning, {name}. #{rank} of {n}. That was close. I noticed.',
      low: 'Good morning, {name}. Nobody honest scored lower than you. Try harder tomorrow.',
      none: 'Good morning, {name}. You didn’t play. I noticed that too.',
      ghost: 'Morning, {name}. You can’t sink any lower now. Watch the living.',
    },
    banish: {
      killer: '{target} had the password. Clever group. The others are still logged in.',
      lastKiller: '{target} was the last admin. Connection unstable…',
      innocent: '{target} was innocent. The group did my job for me.',
      none: 'Nobody logged out. The admins thank you.',
    },
    end: {
      faithful: 'Admin access revoked. Uninstalling… Goodbye, {name}.',
      killers: 'See you tomorrow, {name}. 07:00. Don’t come last.',
    },
  },

  // The Weather app (os/apps/WeatherApp.jsx): the sky over Panjim, one entry per
  // edition day (news.js editionDay), the last repeating. Pure atmosphere: it
  // worsens on a fixed curve whatever the room does, and only the finale's
  // `after` depends on who won. `sky` is one of clear | cloud | rain | heavy | storm.
  weather: {
    place: 'Panjim',
    days: [
      { hi: 31, lo: 25, sky: 'cloud', line: 'Humid. Cloud building over the Mandovi.', alert: null },
      { hi: 30, lo: 25, sky: 'rain', line: 'Showers through the night. Patchy mobile signal.', alert: 'Network outages possible overnight.' },
      { hi: 29, lo: 24, sky: 'heavy', line: 'Heavy rain. Low light by mid-afternoon.', alert: 'Network outages likely overnight.' },
      { hi: 28, lo: 24, sky: 'storm', line: 'Thunderstorms. Power cuts across North Goa.', alert: 'Severe weather. Keep your phone charged.' },
      { hi: 27, lo: 23, sky: 'storm', line: 'Storm warning. Stay indoors. Stay together.', alert: 'Severe weather. Keep your phone charged.' },
    ],
    after: {
      faithful: { hi: 30, lo: 25, sky: 'clear', line: 'Clearing. Signal restored across Panjim.', alert: null },
      killers: { hi: 27, lo: 23, sky: 'storm', line: 'The storm isn’t moving.', alert: 'Outages expected again tomorrow at 07:00.' },
    },
  },

  // The three morning games, in the order the host rotates them (engine/minigames.js).
  dayGames: {
    word: {
      title: 'WORD',
      rule: 'Faithful see the word. Killers only see a hint. Post one word that fits it, without saying it.',
      alarm: 'Today: WORD. Everyone gets the word except the Killers.',
    },
    draw: {
      title: 'SKETCH',
      rule: 'Draw your secret word. Then guess other people’s drawings. Fast answers score more.',
      alarm: 'Today: SKETCH. Draw yours, then guess everyone else’s.',
    },
    run: {
      title: 'THE RUN',
      rule: 'Tap to swim. Your best run counts.',
      alarm: 'Today: THE RUN. Tap to swim. Don’t come last.',
    },
  },

  // The word game: Faithful see `word`, Killers only `hint`. A hint names the
  // kind of thing, never the thing, and has more than a few possible answers.
  wordPairs: [
    { id: 'feni', word: 'Feni', hint: 'A drink' },
    { id: 'ferry', word: 'Ferry', hint: 'A way to travel' },
    { id: 'monsoon', word: 'Monsoon', hint: 'Weather' },
    { id: 'cashew', word: 'Cashew', hint: 'A snack' },
    { id: 'lighthouse', word: 'Lighthouse', hint: 'A building' },
    { id: 'hammock', word: 'Hammock', hint: 'Something to sit or lie on' },
    { id: 'karaoke', word: 'Karaoke', hint: 'A night out' },
    { id: 'coconut', word: 'Coconut', hint: 'Fruit' },
    { id: 'sunset', word: 'Sunset', hint: 'A time of day' },
    { id: 'carnival', word: 'Carnival', hint: 'A celebration' },
    { id: 'passport', word: 'Passport', hint: 'Something in your bag' },
    { id: 'football', word: 'Football', hint: 'A sport' },
    { id: 'prawn', word: 'Prawn', hint: 'Seafood' },
    { id: 'guitar', word: 'Guitar', hint: 'A musical instrument' },
    { id: 'scooter', word: 'Scooter', hint: 'A way to travel' },
    { id: 'mango', word: 'Mango', hint: 'Fruit' },
    { id: 'chai', word: 'Chai', hint: 'A drink' },
    { id: 'airport', word: 'Airport', hint: 'A place' },
    { id: 'umbrella', word: 'Umbrella', hint: 'An everyday object' },
    { id: 'birthday', word: 'Birthday', hint: 'A celebration' },
    { id: 'selfie', word: 'Selfie', hint: 'Something you do with a phone' },
    { id: 'wedding', word: 'Wedding', hint: 'An event' },
    { id: 'pizza', word: 'Pizza', hint: 'Food' },
    { id: 'beach', word: 'Beach', hint: 'A place' },
  ],

  // The drawing game: one per guest per drawing day, so keep it long. Easy to
  // draw in 45 seconds with a finger.
  drawWords: [
    'Coconut', 'Umbrella', 'Guitar', 'Bicycle/cycle/bike', 'Scooter/moped/bike', 'Fish', 'Boat/ship', 'Crab', 'Sun', 'Moon',
    'Star', 'House/home', 'Palm tree/tree/palm', 'Cat', 'Dog', 'Car', 'Phone/mobile', 'Pizza', 'Cake', 'Glasses/specs/spectacles',
    'Hat/cap', 'Shoe', 'Clock/watch', 'Key', 'Book', 'Chair', 'Bed', 'Mug/cup', 'Bottle', 'Ice cream/icecream/cone',
    'Banana', 'Apple', 'Mango', 'Flower', 'Rainbow', 'Cloud', 'Rain', 'Lightning/thunder', 'Anchor', 'Lighthouse',
    'Island', 'Beach', 'Shell/seashell', 'Octopus', 'Snake', 'Bird', 'Butterfly', 'Spider', 'Heart', 'Candle',
    'Balloon', 'Kite', 'Camera', 'Television/tv', 'Drum', 'Microphone/mic', 'Headphones', 'Laptop/computer', 'Rocket', 'Aeroplane/airplane/plane',
    'Train', 'Bus', 'Bridge', 'Tent', 'Mountain/hill', 'Volcano', 'Snowman', 'Robot', 'Crown', 'Ladder',
    'Door', 'Window', 'Toothbrush', 'Scissors', 'Envelope/letter', 'Pencil/pen', 'Football/ball', 'Dice/die', 'Lemon', 'Chilli/chili/pepper',
    'Egg', 'Burger', 'Fork', 'Spoon', 'Sock', 'T-shirt/tshirt/shirt', 'Sunglasses/shades', 'Turtle/tortoise', 'Whale', 'Dolphin',
    'Moustache/mustache', 'Bell', 'Lock/padlock', 'Tooth', 'Eye', 'Hand', 'Snail', 'Frog', 'Pineapple', 'Watermelon',
    'Cactus', 'Ghost', 'Pirate', 'Bucket', 'Sandcastle', 'Wave', 'Mermaid', 'Parrot', 'Elephant', 'Giraffe',
  ],

  whispers: [
    'Liar', 'Trust', 'Watch', 'Wrong', 'Framed', 'Fake', 'Close', 'Near', 'Far',
    'Left', 'Right', 'Table', 'Bar', 'Door', 'Admin', 'Rigged', 'Again', 'Twice',
    'Yes', 'No', 'Friend', 'Beware', 'Quiet', 'Hurry',
  ],
};
