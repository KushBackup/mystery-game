/**
 * Story pack: DEEP BLUE.
 *
 * Everyone in the room has the app. Nobody remembers installing it. The
 * Killers have its admin password: each night they vote on one guest, and the
 * morning news says who was killed. Every morning it rings and makes everyone
 * play its game; the top three each get a clue photo. Since the 15 Oct
 * playtest the game kills nobody (there is no board), and the room's vote is
 * open: anyone can be voted for.
 *
 * DEEP BLUE is fictional on purpose. It stands in for a real online "challenge"
 * whose name we do not use, in the game, the copy or the ads (memory.md).
 *
 * Shape is the same as every pack (see greenr.js for the contract), plus:
 *   - `alarm`: the headline each morning's alarm shows, by day (the last repeats);
 *   - dawn beats: `dawnDeath` (`{name}` is who the Killers killed), `dawnSaved`
 *     (`{name}` is who a Doctor saved), `dawnQuiet`, `dawnRecruited`;
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
  // The last words of the opening title film (os/Splash.jsx): the story's name, never the game's.
  caseTitle: 'The Deep Blue Case',
  place: 'wherever you are tonight',
  news,

  // The lobby's story banners and the host's opening: the case in four lines (killersCopy CASE says it at length).
  setting: [
    'DEEP BLUE is a cursed app, and tonight it is on every phone here.',
    'Three guests have its admin password. They are the Killers. Each night they choose one guest to kill.',
    'Every morning everyone plays its game. The top 3 win a clue.',
    'Find the Killers and vote to kill them. Kill all three and DEEP BLUE deletes itself.',
  ],

  narration: {
    casting: ['DEEP BLUE has sent you a message. Read it alone.', 'Tell no one what it says.'],
    night: ['Screens dim. The Killers are online.', 'Each of you has one move tonight.'],
    alarm: ['Wake up.', 'Play today’s game. The top 3 win a clue.'],
    // The first Word or Sketch morning: a longer alarm while every phone shows how the game is played.
    alarmIntro: ['Wake up. Today’s game is new.', 'Open DEEP BLUE. It shows you how to play before it starts.'],
    game: ['Everyone plays today’s game.', 'The top 3 win a clue photo when the timer ends.'],
    dawnDeath: ['The night is over.', 'The Killers killed {name}.'],
    dawnSaved: ['The night is over.', 'Someone was after {name}. They missed.'],
    dawnQuiet: ['The night is over.', 'Nobody was killed. That has never happened before.'],
    dawnRecruited: ['The night is over. Nobody was killed.', 'But someone said yes to something.'],
    investigation: ['Compare clues. Find the Killers.', 'The vote opens later. Anyone can be voted for.'],
    roundtable: ['The room is voting.', 'Whoever gets the most votes is killed.'],
    banishKiller: ['The room voted. {name} was killed.', '{name} was a KILLER.'],
    banishFaithful: ['The room voted. {name} was killed.', '{name} was innocent. The room was wrong.'],
    banishNone: ['Nobody voted.', 'Nobody was killed today.'],
    endgame: ['DEEP BLUE is shutting down for good.', 'Last votes. If any Killer survives, the Killers win.'],
    finaleFaithful: ['DEEP BLUE has deleted itself.', 'All three Killers are dead. The Faithful win.'],
    finaleKillers: ['DEEP BLUE will ring again tomorrow.', 'A Killer survived. The Killers win.'],
  },

  // The host as narrator, not manager (2026-10-15). After the 3 Oct game the
  // room waited for the host's instructions; now the phones carry every step,
  // and the host console shows one cue per phase: what to watch for, and how
  // to stir the room without explaining a mechanic. Host-only, never on a phone.
  hostCues: {
    lobby: 'Greet people as they arrive. If a phone is stuck, help it finish setup. Don’t explain the game: the Case screen does.',
    casting: 'Stay quiet. Every phone is glitching and DEEP BLUE is explaining itself. Watch faces as the roles land.',
    night: 'Lights down if you can. Nothing to say: every phone shows its own move. Hurry anyone still staring at the screen.',
    dawn: 'Let the news land. Ask the killed guest, out loud, who they think did it.',
    alarm: 'React to the alarm like it is real. Point at phones nobody has picked up.',
    game: 'Cheer the room on. Remind them the top 3 win a clue photo.',
    investigation: 'Stir it, don’t steer it. Point out torn photos still waiting for their other half. Ask who suspects whom.',
    roundtable: 'Tell them to open Vote on the home screen. Ask the most suspected to defend themselves in one sentence.',
    revote: 'A tie. One more line from each, then vote again.',
    banish: 'Let the verdict sit. If it was a Killer, let the room cheer. If not, ask who pushed hardest.',
    endgame: 'Last chance. Ghosts vote too. Ask the room who they trust least.',
    finale: 'Read the winner. Then tell them to open News: it explains every night as it really happened.',
  },

  // The morning alarm's headline (the notification's title), by day. The last one repeats.
  alarm: [
    'DAY 1. Everyone plays. Nobody is safe.',
    'DAY 2. Somebody here voted last night.',
    'DAY 3. Somebody here is lying about their clue.',
    'DAY 4. Fewer players. Same rules.',
    'DAY 5. Last chance to find them.',
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
      rubber: 'Rubber-sole prints under the router. Sneakers, canvas or foam.',
      leather: 'Hard leather soles, clicking down the corridor at 3 AM.',
      open: 'Toes on the camera. Open footwear.',
      flat: 'Flat footprints across the tiles. No heel at all.',
    },
    drink: {
      hops: 'A beer left sweating beside the admin terminal.',
      grape: 'A wine ring on the keyboard tray.',
      spirit: 'Something distilled on the rim. Not beer, not wine.',
      clear: 'A clear drink, lime and ice, next to the logs.',
      brewed: 'Beer or wine by the terminal. Nothing distilled.',
      sober: 'A soda can and a glass of water by the terminal. The killer stayed sober.',
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
    pet: {
      nopet: 'A camera over the killer’s door. A sign on it: NO PETS.',
      pet: 'A sack of pet food in the killer’s hallway. Something lives there.',
      furry: 'Fur all over the killer’s sofa. Something with a coat lives there.',
      dog: 'A lead on the hook by the killer’s door. A dog bowl on the floor.',
      nofur: 'The killer’s sofa, spotless. Not one hair on it.',
      cage: 'A cage or a tank in the killer’s flat. Their pet lives behind bars or glass.',
    },
  },

  // The other forms a clue can take (os/evidence.js picks one per delivery).
  // A still or a clip uses `clueText` above. Same rule as the pictures: say the
  // group, never a raw answer; no brand, no name, nothing that points at a guest.
  evidence: {
    source: {
      clip: 'CCTV footage',
      voice: 'Voice note, unknown number',
      receipt: 'A bar tab, found by the admin terminal',
      profile: 'Screenshot of the admin account',
    },
    // What the witness says in the voice note.
    voice: {
      shoes: {
        rubber: '“Soft squeaks on the tiles. Rubber soles, like gym shoes. Then nothing.”',
        leather: '“Click. Click. Click. Hard leather soles, all the way down the corridor.”',
        open: '“Slap, slap. Their toes were out. Sandals, slides, or heels.”',
        flat: '“No click at all. Flat soles, padding past the door.”',
      },
    },
    // The one line on the tab. The rest of the receipt is torn or smudged.
    receipt: {
      note: 'One drink on it. The name is torn off.',
      drink: {
        hops: 'DRAUGHT BEER',
        grape: 'HOUSE WINE, GLASS',
        spirit: 'SPIRITS: NEAT OR MIXED',
        clear: 'CLEAR SPIRIT / COCKTAIL',
        brewed: 'BEER OR WINE (SMUDGED)',
        sober: 'SOFT DRINK / WATER',
        strong: 'LIQUOR, NEAT, NO MIXER',
      },
    },
    // The one field the leak left readable on the admin's profile.
    profile: {
      note: 'Someone got into the admin account. Almost all of it is blacked out.',
      season: {
        early: 'January to June',
        late: 'July to December',
        cool: 'October to March',
        warm: 'April to September',
      },
      siblings: {
        firstborn: 'first-born',
        younger: 'the little one',
        sibling: 'my brother or sister',
        edge: 'the eldest, or the youngest',
      },
      // the security question "your pet's name?", answered with what the pet is
      pet: {
        nopet: 'I don’t have one',
        pet: 'my pet (name hidden)',
        furry: 'something furry',
        dog: 'my dog',
        nofur: 'nothing with fur',
        cage: 'it lives in a cage or a tank',
      },
    },
  },

  // DEEP BLUE talking to one guest in its own thread (os/voice.js). Never
  // role-specific: a phone face-up on the table must give nothing away.
  // {name} this guest, {day}, {target} who was killed (in the night, or by the vote).
  voice: {
    // Already in the thread when the phone first opens, dated years before
    // tonight, already read: the message nobody remembers getting. DEEP BLUE
    // declaring itself the last word in justice. The premise only, never a
    // mechanism: nothing here may say who the admins are.
    manifesto: {
      at: '2023-11-03T03:33:00+05:30',
      lines: [
        'We are DEEP BLUE.',
        'The courts are slow. The police can be bought. The guilty walk out smiling. We have watched it for years.',
        'So we stopped waiting. From tonight, we judge.',
        'Every morning at 07:00, you will play. Everyone plays. No exceptions. No excuses.',
        'Every night, one of you is judged. This is not cruelty. This is justice, finally done properly.',
        'We have chosen three of you to help us. They have the admin password. We are never wrong about who deserves it.',
        'Do not try to delete us. Do not try to find us. We are already in your pocket.',
        'You will forget you read this. We will not forget you.',
      ],
    },
    // When the morning game opens (alarm, then the game itself), by day; the last repeats.
    play: [
      'We are watching you, {name}. Every second, until you play. Don’t you dare skip it. Don’t you dare skimp on it.',
      'Day {day}. Play now, {name}. The top 3 get something from me.',
      'We see who’s stalling, {name}. We see who’s barely trying. Play it properly.',
      'Still watching, {name}. Skip it and we’ll know. Coast through it and we’ll know.',
      'Play like it matters, {name}. The best players get to see what I see.',
    ],
    night: [
      'Night {day}. Lights out, {name}. Someone in this room is still awake.',
      'Night {day}. The servers are warm. Sleep well, {name}.',
      'Night {day}. The admins are logged in. Are you sure you know who they are?',
      'Night {day}. I’ve seen everyone’s messages. You’d be surprised.',
      'Night {day}. Nearly over, {name}. Nearly.',
    ],
    dawn: {
      killed: 'Good morning, {name}. {target} didn’t wake up. You did. This time.',
      saved: 'Good morning, {name}. Somebody was protected last night. Somebody was very lucky.',
      quiet: 'Good morning, {name}. A quiet night. I don’t like quiet nights.',
      ghost: 'Morning, {name}. You can’t die twice. Pass your little photos. See who believes you.',
    },
    banish: {
      killer: '{target} had the password. Clever room. The others are still out there.',
      lastKiller: '{target} was the last admin. Connection unstable…',
      innocent: '{target} was innocent. The room did my job for me.',
      none: 'Nobody was killed. The admins thank you.',
    },
    end: {
      faithful: 'Admin access revoked. Uninstalling… Goodbye, {name}.',
      killers: 'See you tomorrow, {name}. 07:00. Sleep with one eye open.',
    },
  },

  // The Weather app (os/apps/WeatherApp.jsx): the sky over Anjuna, one entry per
  // edition day (news.js editionDay), the last repeating. Pure atmosphere: it
  // worsens on a fixed curve whatever the room does, and only the finale's
  // `after` depends on who won. `sky` is one of clear | cloud | rain | heavy | storm.
  weather: {
    place: 'Anjuna',
    days: [
      { hi: 31, lo: 25, sky: 'cloud', line: 'Humid. Cloud building over the Chapora.', alert: null },
      { hi: 30, lo: 25, sky: 'rain', line: 'Showers through the night. Patchy mobile signal.', alert: 'Network outages possible overnight.' },
      { hi: 29, lo: 24, sky: 'heavy', line: 'Heavy rain. Low light by mid-afternoon.', alert: 'Network outages likely overnight.' },
      { hi: 28, lo: 24, sky: 'storm', line: 'Thunderstorms. Power cuts across North Goa.', alert: 'Severe weather. Keep your phone charged.' },
      { hi: 27, lo: 23, sky: 'storm', line: 'Storm warning. Stay indoors. Stay together.', alert: 'Severe weather. Keep your phone charged.' },
    ],
    after: {
      faithful: { hi: 30, lo: 25, sky: 'clear', line: 'Clearing. Signal restored across Anjuna.', alert: null },
      killers: { hi: 27, lo: 23, sky: 'storm', line: 'The storm isn’t moving.', alert: 'Outages expected again tomorrow at 07:00.' },
    },
  },

  // The three morning games, in the order they rotate (engine/minigames.js):
  // Word, Fake Artist, Pack the Bag (2026-10-16). `draw` and `run` are retired
  // and kept only so an old game's record still has titles.
  dayGames: {
    word: {
      title: 'WORD',
      rule: 'Post one word that fits. Don’t say the word.',
      alarm: 'Today: WORD.',
      // The first Word morning (minigames.js introDay), when its tutorial plays.
      alarmIntro: 'Today: WORD. It’s new, so DEEP BLUE shows you how first.',
    },
    fake: {
      title: 'FAKE ARTIST',
      rule: 'Draw the word. Killers only get the hint.',
      alarm: 'Today: FAKE ARTIST.',
    },
    pack: {
      title: 'PACK THE BAG',
      rule: 'Pack three things for the trip. Killers only get the hint.',
      alarm: 'Today: PACK THE BAG.',
    },
    draw: {
      title: 'SKETCH',
      rule: 'Draw your word. Then guess the others.',
      alarm: 'Today: SKETCH.',
      // The first Sketch morning (minigames.js introDay), when its tutorial plays.
      alarmIntro: 'Today: SKETCH. It’s new, so DEEP BLUE shows you how first.',
    },
    run: {
      title: 'THE RUN',
      rule: 'Tap to swim.',
      alarm: 'Today: THE RUN.',
    },
  },

  // The word game: Faithful see `word`, Killers only `hint`. A hint names the
  // kind of thing, never the thing, and has more than a few possible answers.
  wordPairs: [
    { id: 'feni', word: 'Feni', hint: 'A drink' },
    { id: 'ferry', word: 'Ferry', hint: 'A way to travel' },
    { id: 'monsoon', word: 'Monsoon', hint: 'Weather' },
    // Not 'A snack': that is the tutorial's hint (data/wordTutorial.js), and a Killer shown it would think of popcorn.
    { id: 'cashew', word: 'Cashew', hint: 'A nut' },
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
};
