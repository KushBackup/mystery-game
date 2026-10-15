/**
 * Every word a player reads in Killers Night that isn't the story pack's.
 *
 * Two rules. From the feedback that started the rebuild: nobody should have
 * to read to play, so each line is 25 words or fewer. And from 2026-10-02:
 * players discover the game. Copy states the premise and what just happened;
 * it never explains how a mechanic works (the rig, who strikes, the firewall).
 * The board, the photos and the room teach that. If a screen seems to need
 * an explanation, give it a cue instead: a badge, a banner, a result.
 *
 * One exception, the user's call after playtesting (2026-10-02): the Night
 * app explains every move in full (`NIGHT`): what it does tonight and what it
 * changes in the game. Nobody could tell what "Watch a guest" was for, and a
 * move you can't weigh is not a choice. And the Help app (data/helpCopy.js),
 * the rule book a guest opens on purpose, states every rule. The rule above
 * still holds everywhere else.
 */

/**
 * The game's own name. DEEP BLUE is an app on the phone, inside the game, and
 * never the name of the game itself (user's call, 2026-10-02). Anything that
 * names the whole experience (boot, invite, lock screen, Settings, the PWA
 * manifest and page title) reads it from here or repeats it word for word.
 */
export const GAME = {
  title: 'Three Knives Out',
  by: 'Astral Project',
  // The venue partner for this event (16 Oct 2026, Backroom Anjuna). Change it per event.
  with: 'SideQuest Club',
};

/**
 * The premise in one breath (2026-10-15). After the 3 Oct game, players
 * didn't know what DEEP BLUE was, who the Killers were or what they were
 * playing for. The rule since then: always tell the goal, the stakes and what
 * each tool is for; let players discover the tactics. Every surface that
 * explains the game (the Case screen in Setup, the hijack at casting, Help's
 * hero, the host's opening) tells this same chain, in this order.
 *
 * One word for leaving the game: "killed" (the user's call, 2026-10-15). It
 * covers the morning board and the room's vote alike. Never banish, logged
 * out, voted out, taken, SIGNAL LOST or dies.
 */
export const CASE = [
  {
    kicker: 'What is DEEP BLUE?',
    lines: [
      'DEEP BLUE is a cursed app. Tonight it is on every phone in this room.',
      'Every morning it makes everyone play a quick game. The lowest score is killed.',
    ],
  },
  {
    kicker: 'Who are the Killers?',
    lines: [
      'DEEP BLUE gave three guests the admin password. They are the Killers.',
      'Each night they push one guest’s score to the bottom. That guest is killed.',
      'But the top of the board is locked. A good score keeps you safe.',
    ],
  },
  {
    kicker: 'Your goal',
    lines: [
      'Everyone else is Faithful. Find the three Killers.',
      'Collect clues. Accuse someone. The room votes, and that guest is killed.',
      'Kill all three Killers and DEEP BLUE deletes itself.',
    ],
  },
];

/**
 * What the opening title film says (os/Splash.jsx), before the story's own
 * title (the pack's `caseTitle`). The film draws these itself
 * (splash-film/splash.html); here they are its screen-reader label, and must
 * match it.
 */
export const SPLASH = [
  [{ big: GAME.by }, { small: 'presents' }],
  [{ small: 'in collaboration with' }, { big: GAME.with }],
];

/**
 * The hijack (takeovers.jsx Hijack, 2026-10-15): at the deal every phone
 * glitches at once and DEEP BLUE says what it is, in three beats, before the
 * sealed role message. The same on every phone. The user chose this one
 * moment over "nothing opens by itself": the whole room learns the premise
 * together, without the host having to explain it.
 */
export const HIJACK = [
  { big: 'DEEP BLUE IS ON EVERY PHONE IN THIS ROOM.', small: 'Every morning, everyone plays its game. The lowest score is killed.' },
  { big: 'THREE OF YOU WORK FOR IT.', small: 'They have the admin password. Each night they push one guest’s score to the bottom.' },
  { big: 'FIND THEM BEFORE IT KILLS EVERYONE.', small: 'Collect clues. Accuse. Vote. Kill all three Killers and DEEP BLUE deletes itself.' },
];

/** The role text at casting: who you are, in one line. How the role works is for the player to find. */
export const ROLE_CARD = {
  killer: { title: 'Killer', line: 'DEEP BLUE gave you the admin password. Each night, pick who is killed. Don’t get caught.' },
  faithful: { title: 'Faithful', line: 'Three guests here are Killers. Find them, accuse them, and win the vote.' },
  doctor: { title: 'Doctor', line: 'You’re Faithful. Each night, you can keep one person safe from the Killers.' },
  detective: { title: 'Detective', line: 'You’re Faithful. Each night, you can check two people’s phones.' },
};

/**
 * The one line on the home screen's NowCard: what is happening, never what to
 * do or how. It must not depend on the guest's role: the home screen is what
 * the person beside you can see. `until` is when the morning game closes, on
 * the game clock (engine/clock.js), the one deadline the line names.
 */
export function nowLine({ phase, status, hasActed, cycle, minigame = 'run', pack, until = '', intro = false }) {
  if (status === 'vanished') return 'You left the game. Thanks for playing.';
  if (status === 'ghost' && !['night', 'alarm', 'game', 'endgame', 'finale'].includes(phase)) return 'No signal.';
  const title = pack?.dayGames?.[minigame]?.title ?? 'The run';
  switch (phase) {
    case 'lobby':
      return 'You’re in. Waiting for the host.';
    case 'casting':
      return 'A message is on its way.';
    case 'night':
    case 'recruit':
      return hasActed ? 'Done for tonight.' : `Night ${cycle}.`;
    case 'alarm':
      // The first Word or Sketch morning (minigames.js introDay): the game is new and DEEP BLUE teaches it.
      if (intro) return `Wake up. ${title} is new. Open DEEP BLUE to see how it works.`;
      return until ? `Wake up. Play ${title} before ${until}.` : 'Wake up.';
    case 'game':
      return until ? `${title} is open until ${until}.` : `${title} has started.`;
    case 'game_locked':
      return 'Time.';
    case 'dawn':
      return 'The board is up.';
    case 'investigation':
      return 'Daylight. Accuse someone, or nobody is killed today.';
    case 'roundtable':
      return 'The room is voting.';
    case 'revote':
      return 'A tie. The room votes again.';
    case 'banish':
      return 'The verdict is in.';
    case 'endgame':
      return 'The final vote.';
    case 'finale':
      return 'It’s over.';
    default:
      return 'Hold on…';
  }
}

/**
 * The progress line under the NowCard (os/suspects.js). Role-neutral: a count
 * of living guests who fit the newest night's public clues, and the Killers
 * the room has caught. Only numbers, never names.
 */
export function progressLine({ count, caught, total }) {
  const parts = [];
  if (count) parts.push(`Night ${count.cycle}’s Killer: ${count.n} ${count.n === 1 ? 'guest fits' : 'guests fit'} the clues`);
  if (total) parts.push(`Killers caught: ${caught} of ${total}`);
  return parts.join(' · ');
}

export const PHASE_LABEL = {
  lobby: 'Arrivals',
  casting: 'Casting',
  night: 'Night',
  night_locked: 'Night',
  recruit: 'Night',
  recruit_locked: 'Night',
  alarm: 'Alarm',
  game: 'Morning game',
  game_locked: 'Morning game',
  dawn: 'Board',
  investigation: 'Investigate',
  roundtable: 'Round table',
  roundtable_locked: 'Round table',
  revote: 'Re-vote',
  revote_locked: 'Re-vote',
  banish: 'Verdict',
  endgame: 'Endgame',
  endgame_locked: 'Endgame',
  finale: 'Finale',
};

/** How an inbox delivery reads, apart from clue facts (those use packs/clueWords). */
export function deliveryLine(d, nameOf) {
  switch (d.kind) {
    case 'watch':
      return d.seen
        ? `You watched ${nameOf(d.target)}. They slipped away in the dark.`
        : `You watched ${nameOf(d.target)}. A quiet night.`;
    case 'check':
      return d.team === 'killers' ? `${nameOf(d.target)} is a KILLER.` : `${nameOf(d.target)} is Faithful.`;
    case 'half':
      return `You dug up half a photo. The other half is on ${nameOf(d.partner)}’s phone. Find them.`;
    case 'fact':
      if (d.via === 'join') return `You and ${nameOf(d.from)} joined your halves. The whole photo is in Photos.`;
      if (d.via === 'pass') return `${nameOf(d.from)} passed you a photo from beyond. Ghost photos are always true.`;
      return d.via === 'top' ? `You finished #${d.rank ?? 1}. DEEP BLUE sent you a photo.` : 'A photo arrived.';
    case 'trace': {
      const [a, b] = (d.targets ?? []).map(nameOf);
      return d.hit ? `TRACE: ${a} or ${b} did tonight’s hacking.` : `Trace: neither ${a} nor ${b} did tonight’s hacking.`;
    }
    case 'whisper':
      return `${nameOf(d.from)} whispers from beyond: “${d.word}”`;
    case 'saved':
      return `You saved ${nameOf(d.target)} tonight.`;
    case 'quiet':
      return 'You searched. Nothing tonight.';
    case 'recruited':
      return 'You’re one of them now.';
    case 'recruitOffer':
      return 'The Killers made you an offer.';
    default:
      return '';
  }
}

export const DELIVERY_TAG = {
  fact: 'Clue',
  half: 'Half',
  watch: 'Watch',
  check: 'Check',
  trace: 'Trace',
  whisper: 'Whisper',
  saved: 'Saved',
  quiet: 'Search',
  recruited: 'Recruited',
  recruitOffer: 'Offer',
};

/**
 * The Night app's words. The one place the phone explains a mechanic in full
 * (see the header): each move says what it does tonight, what arrives at dawn,
 * and why a player would pick it. Every line here must stay true to
 * engine/night.js and engine/morning.js; change them together.
 *
 * `how` rows are [label, text]. 25 words or fewer per text. The first two
 * rows (Tonight, At dawn) sit above the guest list; the rest sit below it as
 * "Good to know". `odds` and `dawn` are the move card's summary on the list,
 * `verb` the confirm bar ("Watch Priya").
 *
 * Big type on a Night screen is the same on every phone ("Night 2"); only the
 * small lines differ by role, so a glance across the table reads nothing.
 */
/**
 * Last words (MessagesApp LastWords, threads.js lastWordsDue): a guest the
 * board took this morning may post one true clue photo to The Room, once.
 * Role-neutral, like everything a ghost's phone shows face-up.
 */
/**
 * Accusations (os/apps/Accuse.jsx, engine/banish.js). A tool, so its rules are
 * told in full: what an accusation does, what a second does, and what silence
 * costs. Role-neutral: the same on every phone.
 */
export const ACCUSE = {
  kicker: 'DAYLIGHT · ACCUSE A SUSPECT',
  title: 'Who do you think is a Killer?',
  rules: [
    'Accuse one guest today. You can show one of your clue photos as your reason.',
    'Anyone can back an accusation with a Second. You get one Second a day.',
    'A guest with 2 Seconds goes on trial. The vote is only between those on trial.',
    'If nobody is on trial when daylight ends, there is no vote and nobody is killed.',
  ],
  today: (n) => (n ? `TODAY · ${n} ON TRIAL` : 'TODAY · NOBODY ON TRIAL YET'),
  none: 'No accusations yet. Be the first.',
  pick: 'Your accusation',
  pickFirst: 'Pick a guest to accuse',
  attach: 'Show a photo as your reason? (optional)',
  attachFoot: 'The whole room sees the photo you pick.',
  send: (name) => `Accuse ${name}`,
  yours: (name) => `You accused ${name} today.`,
  by: (names) => `Accused by ${names.join(', ')}`,
  backed: (names) => `Seconded by ${names.join(', ')}`,
  reason: (name) => `${name}’s photo:`,
  second: (name) => `Second: put ${name} on trial`,
  seconded: 'You seconded this.',
  onTrial: 'ON TRIAL',
  onTrialLine: (name) => `${name} is on trial.`,
  support: (n) => `${n} of 2 Seconds. 2 puts them on trial.`,
  roomKicker: 'ACCUSATION',
  accuses: 'accuses',
  closed: 'Too late. Daylight is over.',
  error: 'Not sent. Try again.',
  // The Room's pinned bar in daylight.
  pin: 'Accuse someone, or nobody is killed today.',
  noOne: 'No one: spare them',
};

/**
 * Split clues (GalleryApp TornPhoto, engine/clues.js splitHalves). A dig
 * gives half a photo; the named guest has the other half. Either one types
 * the other's code and the whole photo lands on both phones.
 */
export const SPLIT = {
  head: 'TORN PHOTOS · FIND YOUR OTHER HALF',
  title: 'Half a photo',
  partner: (name) => `The other half is on ${name}’s phone.`,
  yours: 'Your code. Show it to them:',
  theirs: 'Or type the code on their phone:',
  join: 'Join the photo',
  checking: 'Checking…',
  wrong: 'That’s not their code. Check it and try again.',
  error: 'Not sent. Try again.',
  why: 'Joined, the whole photo appears on both phones.',
};

export const LAST_WORDS = {
  head: 'Your last message',
  line: 'Before you go, show the room one photo. Only once, and only today.',
  post: 'Post to the room',
  sending: 'Posting…',
  closed: 'Too late. The room has moved on.',
  error: 'Not sent. Try again.',
  kicker: (whose) => `${whose} last message`.toUpperCase(),
  true: 'Sent from the other side. Ghost photos are always true.',
  nudge: 'Post one photo to the room before the vote.',
};

export const NIGHT = {
  title: (cycle) => `Night ${cycle}`,
  /** The hero's countdown: minutes, then seconds; never m:ss (it would read as a time of day). */
  left: (s) => (s >= 60 ? `${Math.ceil(s / 60)} min left` : s > 0 ? `${s} s left` : 'Ending'),
  day: {
    title: 'Not night yet',
    line: 'Night moves open when night falls. DEEP BLUE will ping you.',
  },
  over: {
    kicker: 'Locked in',
    line: 'The night is over. Your result arrives at dawn.',
    none: 'You made no move, so you dug through the logs.',
    noneGhost: 'No move tonight. Your own clue photo still arrives at dawn.',
  },
  ghost: {
    line: 'You were killed, but you still play. Help the living find the Killers.',
    head: 'Choose your move',
    foot: 'One move a night. Your own clue photo arrives at dawn either way.',
  },
  faithful: {
    line: 'One Killer is out tonight. Pick one move to hunt them.',
    foot: 'No move? You dig through the logs.',
    head: 'Choose your move',
  },
  more: 'Good to know',
  bar: {
    move: 'Choose a move above',
    confirm: 'Confirm',
    saving: 'Saving…',
  },
  saved: 'Tonight’s move',
  wait: 'Your result arrives at dawn. Until then, act normal.',
  help: 'How the night works',
  moves: {
    watch: {
      title: 'Watch a guest',
      short: 'Try to catch a Killer in the act.',
      odds: 'About 6 in 10',
      dawn: 'You may see them slip away.',
      hint: 'Tap a guest to watch',
      verb: (name) => `Watch ${name}`,
      how: [
        ['Tonight', 'Pick one guest and keep an eye on them all night.'],
        ['At dawn', 'If they went out to kill, you probably saw them slip away. About 6 times in 10.'],
        ['Bonus', 'If the Killers went after the guest you watched, you also get a clue photo.'],
        ['Careful', '“A quiet night” doesn’t clear them. You may have missed it.'],
        ['Why', 'The only move that can point straight at one person.'],
      ],
      pick: 'Who do you watch?',
      done: (name) => `You’re watching ${name}.`,
    },
    scour: {
      title: 'Dig through the logs',
      short: 'Get one sure clue about tonight’s Killer, in two halves.',
      odds: 'Sure clue',
      dawn: 'Half a clue photo. Someone else has the other half.',
      hint: 'No guest to pick. Just dig.',
      how: [
        ['Tonight', 'You go through DEEP BLUE’s logs instead of watching anyone.'],
        ['At dawn', 'Half a clue photo lands in Photos. Your phone names the guest who has the other half.'],
        ['Then', 'Find them and type each other’s code. The whole photo appears on both phones: one answer the Killer gave when they arrived.'],
        ['After', 'Check it against everyone’s answers in Contacts to narrow down who it could be.'],
        ['Why', 'A clue every night, guaranteed. It narrows the field but never names one person.'],
      ],
      cta: 'Dig tonight',
      done: () => 'You’re digging through the logs.',
    },
    trace: {
      title: 'Trace two phones',
      short: 'Find out if one of two guests struck tonight.',
      odds: 'Yes or no',
      dawn: 'Was one of them the Killer?',
      hint: (n) => (n === 1 ? 'Tap one more guest' : 'Tap two guests to trace'),
      verb: (a, b) => `Trace ${a} + ${b}`,
      how: [
        ['Tonight', 'Pick two guests. DEEP BLUE checks their phones against tonight’s logs.'],
        ['At dawn', 'You learn whether either of them was tonight’s Killer. Not which one.'],
        ['Careful', '“Neither” clears them for tonight only. A different Killer may strike another night.'],
        ['Why', 'A hit traps a Killer in a pair of two.'],
      ],
      pick: (n) => `Pick two guests · ${n}/2`,
      done: (a, b) => `You’re tracing ${a} and ${b}.`,
    },
    protect: {
      title: 'Protect a guest',
      short: 'Keep one guest safe from the Killers tonight.',
      line: 'One Killer is out tonight. You can keep one guest safe.',
      hint: 'Tap a guest to protect',
      verb: (name) => `Protect ${name}`,
      how: [
        ['Tonight', 'Pick one guest to protect. It can be you.'],
        ['At dawn', 'If the Killers chose them, they live. DEEP BLUE tells you if you saved someone.'],
        ['But', 'The lowest real score on the morning board is still killed instead. Your guest is safe from that too.'],
        ['Rule', 'You can’t protect the same guest two nights in a row.'],
      ],
      pick: 'Who do you protect?',
      barred: 'Protected last night',
      done: (name) => `You’re protecting ${name}.`,
    },
    pass: {
      title: 'Pass a photo on',
      short: 'Give one of your true clue photos to a living guest.',
      odds: 'Always true',
      dawn: 'They get a copy, with your name.',
      none: 'No photo yet. Your first arrives at dawn.',
      how: [
        ['Tonight', 'Pick one of your clue photos, then one living guest.'],
        ['At dawn', 'A copy lands in their Photos, signed with your name. You keep yours.'],
        ['Why', 'Ghost photos are always true, even on a night the Killers bend the clues.'],
        ['Careful', 'They can’t prove it came from you. The room has to trust them.'],
      ],
      photo: 'Pick a photo',
      pick: 'Who gets it?',
      pickFirst: 'Then pick who gets it',
      hint: (has) => (has ? 'Tap who gets it' : 'Tap a photo first'),
      verb: (name) => `Photo to ${name}`,
      done: (name) => `${name} gets your photo at dawn.`,
    },
    whisper: {
      title: 'Whisper from beyond',
      short: 'Send one word to a living guest.',
      odds: 'One word',
      dawn: 'They read it, signed with your name.',
      line: 'You were killed, but you still play. Help the living find the Killers.',
      how: [
        ['Tonight', 'Pick one word, then one living guest.'],
        ['At dawn', 'They read your word, signed with your name.'],
        ['Also', 'Every night you get a clue photo of your own. Ghost clues are always true.'],
      ],
      word: 'Pick a word',
      pick: (word) => `Who hears “${word}”?`,
      pickFirst: 'Then pick who hears it',
      hint: (word) => (word ? `Tap who hears “${word}”` : 'Tap a word first'),
      verb: (name, word) => `“${word}” to ${name}`,
      done: (name, word) => `${name} will hear “${word}”.`,
    },
  },
  killer: {
    line: 'Pick tonight’s target with your partners. Most votes wins.',
    partners: 'Your partners',
    alone: 'You’re alone tonight. Your vote decides.',
    noPick: 'No vote yet',
    picked: (name) => `Votes ${name}`,
    hint: 'Tap a name to vote',
    mineBar: (name) => `Your vote: ${name}`,
    lead: (n) => `${n} vote${n === 1 ? '' : 's'} · leading`,
    leads: (name) => `${name} leads`,
    top: (name) => `Most votes: ${name}`,
    tied: 'Tied · DEEP BLUE breaks it',
    closed: 'The poll is closed.',
    how: [
      ['At dawn', 'DEEP BLUE drops their score to the bottom of the morning board, and they are killed.'],
      ['Unless', 'A Doctor protected them, or they scored in the locked top of the board. Then the lowest real score is killed instead, and that could be one of you.'],
      ['Turns', 'One of you strikes each night, in turn. Tonight’s clues describe that one, and guests watching them may see them.'],
      ['No vote', 'DEEP BLUE picks someone for you.'],
    ],
    mine: (name) => `Your pick: ${name}. You can change it.`,
  },
  recruit: {
    line: 'One of you is gone. Pick a guest to invite in.',
    how: [
      ['Yes', 'They join you and nobody is killed tonight.'],
      ['No', 'They become tonight’s target instead.'],
    ],
  },
  result: 'Your result arrives at dawn.',
  changeBtn: 'Change my move',
  count: (alive, gone) => `${alive} still in the game${gone ? ` · ${gone} killed` : ''}`,
};
