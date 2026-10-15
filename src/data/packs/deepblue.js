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
  // The last words of the opening title film (os/Splash.jsx): the story's name, never the game's.
  caseTitle: 'The Deep Blue Case',
  place: 'wherever you are tonight',
  news,

  // The lobby's story banners and the host's opening: the case in four lines (killersCopy CASE says it at length).
  setting: [
    'DEEP BLUE is a cursed app, and tonight it is on every phone here. Every morning, the lowest score is killed.',
    'Three guests have its admin password. They are the Killers. Each night they push one score to the bottom.',
    'The top of the board is locked. Play well and the Killers can’t touch you.',
    'Find the Killers, accuse them, and vote. Kill all three and DEEP BLUE deletes itself.',
  ],

  narration: {
    casting: ['DEEP BLUE has sent you a message. Read it alone.', 'Tell no one what it says.'],
    night: ['Screens dim. The Killers are online.', 'Each of you has one move tonight.'],
    alarm: ['Wake up.', 'Play today’s game. The lowest score is killed. The top of the board is locked.'],
    // The first Word or Sketch morning: a longer alarm while every phone shows how the game is played.
    alarmIntro: ['Wake up. Today’s game is new.', 'Open DEEP BLUE. It shows you how to play before it starts.'],
    game: ['Everyone plays today’s game.', 'The board posts when the timer ends. Score high and you’re locked.'],
    dawnDeath: ['The board is up.', '{name} came last. {name} was killed.'],
    dawnRig: ['The board is up.', '{name} came last with {score}. {name} was killed. They swear their score was higher.'],
    dawnDeep: ['The board is up. Someone was after {saved}. They missed.', '{name} came last. {name} was killed.'],
    // The target scored in the locked top of the board (engine/morning.js), so the rig bounced.
    dawnShield: ['The board is up. Someone tried to sink {saved}. Their score held.', '{name} came last. {name} was killed.'],
    dawnSaved: ['The board is up.', 'Someone was after {name}. They missed.'],
    dawnQuiet: ['The board is up.', 'Nobody was killed. That has never happened before.'],
    dawnRecruited: ['The board is up. Nobody was killed.', 'But someone said yes to something.'],
    investigation: ['Compare clues, then accuse someone.', 'Two Seconds put a guest on trial. No trial, no vote.'],
    roundtable: ['The room is voting.', 'Whoever gets the most votes is killed.'],
    banishKiller: ['The room voted. {name} was killed.', '{name} was a KILLER.'],
    banishFaithful: ['The room voted. {name} was killed.', '{name} was innocent. The room was wrong.'],
    banishNone: ['The room spared everyone.', 'Nobody was killed today.'],
    // Nobody had an accusation with two seconds, so there was no vote (firebase/host.js).
    banishUnaccused: ['Nobody was accused.', 'Nobody was killed today. The Killers get a free night.'],
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
    alarm: 'React to the alarm like it is real. Point at phones nobody has picked up.',
    game: 'Cheer the room on. Remind them the top quarter is locked and the bottom is killed.',
    dawn: 'Let the board land. Ask the killed guest, out loud, whether that was really their score.',
    investigation: 'Stir it, don’t steer it. Point out torn photos still waiting for their other half. If nobody has accused anyone, say so out loud.',
    roundtable: 'Ask the accused to defend themselves in one sentence each. Then let the phones vote.',
    revote: 'A tie. One more line from each, then vote again.',
    banish: 'Let the verdict sit. If it was a Killer, let the room cheer. If not, ask who pushed hardest.',
    endgame: 'Last chance. Ghosts vote too. Ask the room who they trust least.',
    finale: 'Read the winner. Then tell them to open News: it explains every night as it really happened.',
  },

  // The morning alarm's headline (the notification's title), by day. The last one repeats.
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
    },
  },

  // DEEP BLUE talking to one guest in its own thread (os/voice.js). Never
  // role-specific: a phone face-up on the table must give nothing away.
  // {name} this guest, {day}, {rank} of {n} on the board, {target} who was voted out.
  voice: {
    // Already in the thread when the phone first opens, dated years before
    // tonight, already read: the message nobody remembers getting. DEEP BLUE
    // declaring itself the last word in justice. The premise only, never a
    // mechanism: nothing here may say who reads the scores.
    manifesto: {
      at: '2023-11-03T03:33:00+05:30',
      lines: [
        'We are DEEP BLUE.',
        'The courts are slow. The police can be bought. The guilty walk out smiling. We have watched it for years.',
        'So we stopped waiting. From tonight, we judge.',
        'Every morning at 07:00, you will play. Everyone plays. No exceptions. No excuses.',
        'The weakest is killed. This is not cruelty. This is justice, finally done properly.',
        'We have chosen three of you to help us. They have the admin password. We are never wrong about who deserves it.',
        'Do not try to delete us. Do not try to find us. We are already in your pocket.',
        'You will forget you read this. We will not forget you.',
      ],
    },
    // When the morning game opens (alarm, then the game itself), by day; the last repeats.
    play: [
      'We are watching you, {name}. Every second, until you play. Don’t you dare skip it. Don’t you dare skimp on it.',
      'Day {day}. Play now, {name}. The top of the board is locked. The bottom is killed.',
      'We see who’s stalling, {name}. We see who’s barely trying. Play it properly.',
      'Still watching, {name}. Skip it and we’ll know. Coast through it and we’ll know.',
      'Play like it matters, {name}. It does. Locked at the top, or killed at the bottom.',
    ],
    night: [
      'Night {day}. Lights out, {name}. Someone in this room is still awake.',
      'Night {day}. The servers are warm. Sleep well, {name}.',
      'Night {day}. The admins are logged in. Are you sure you know who they are?',
      'Night {day}. I’ve seen everyone’s scores. You’d be surprised.',
      'Night {day}. Nearly over, {name}. Nearly.',
    ],
    dawn: {
      top: 'Good morning, {name}. #{rank} of {n}. Locked, and a photo for you. Careful who you show it to.',
      calm: 'Good morning, {name}. #{rank} of {n}. Below the lock. The Killers could reach you there.',
      locked: 'Good morning, {name}. #{rank} of {n}. Locked. The Killers couldn’t touch you today.',
      edge: 'Good morning, {name}. #{rank} of {n}. That was close. I noticed.',
      low: 'Good morning, {name}. Nobody honest scored lower than you. Try harder tomorrow.',
      none: 'Good morning, {name}. You didn’t play. I noticed that too.',
      ghost: 'Morning, {name}. You can’t sink any lower now. Pass your little photos. See who believes you.',
    },
    banish: {
      killer: '{target} had the password. Clever room. The others are still out there.',
      lastKiller: '{target} was the last admin. Connection unstable…',
      innocent: '{target} was innocent. The room did my job for me.',
      none: 'Nobody was killed. The admins thank you.',
      unaccused: 'Nobody accused anyone. Nobody was killed. The admins thank you for the quiet.',
    },
    end: {
      faithful: 'Admin access revoked. Uninstalling… Goodbye, {name}.',
      killers: 'See you tomorrow, {name}. 07:00. Don’t come last.',
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

  // The three morning games, in the order the host rotates them (engine/minigames.js).
  dayGames: {
    word: {
      title: 'WORD',
      rule: 'Post one word that fits. Don’t say the word.',
      alarm: 'Today: WORD.',
      // The first Word morning (minigames.js introDay), when its tutorial plays.
      alarmIntro: 'Today: WORD. It’s new, so DEEP BLUE shows you how first.',
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

  whispers: [
    'Liar', 'Trust', 'Watch', 'Wrong', 'Framed', 'Fake', 'Close', 'Near', 'Far',
    'Left', 'Right', 'Table', 'Bar', 'Door', 'Admin', 'Rigged', 'Again', 'Twice',
    'Yes', 'No', 'Friend', 'Beware', 'Quiet', 'Hurry',
  ],
};
