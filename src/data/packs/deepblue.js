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
 *     templates). It lives in deepblue.news.js; read the rules in its header.
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
    alarm: ['Wake up.', 'Your run starts in a moment. Do not come last.'],
    game: ['Tap to swim. Your best run counts.', 'The board posts when the timer ends.'],
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

  whispers: [
    'Liar', 'Trust', 'Watch', 'Wrong', 'Framed', 'Fake', 'Close', 'Near', 'Far',
    'Left', 'Right', 'Table', 'Bar', 'Door', 'Admin', 'Rigged', 'Again', 'Twice',
    'Yes', 'No', 'Friend', 'Beware', 'Quiet', 'Hurry',
  ],
};
