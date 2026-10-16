/**
 * Every word a player reads in Killers Night that isn't the story pack's.
 *
 * Two rules. From the feedback that started the rebuild: nobody should have
 * to read to play, so each line is 25 words or fewer. And from 2026-10-02:
 * players discover the game. Copy states the premise and what just happened;
 * it never explains how a mechanic works (who strikes, the firewall). The
 * morning news, the photos and the room teach that. If a screen seems to need
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
 * covers the Killers' night kill and the room's vote alike.
 *
 * Since the 15 Oct playtest the only night death is the Killers' vote, the
 * morning game kills nobody (its top 3 win a clue photo), and the room's vote
 * is open: anyone can be voted for. Never banish, logged
 * out, voted out, taken, SIGNAL LOST or dies.
 */
export const CASE = [
  {
    kicker: 'What is DEEP BLUE?',
    lines: [
      'DEEP BLUE is a cursed app. Tonight it is on every phone in this room.',
      'Every morning it makes everyone play a quick game. The top 3 win a clue.',
    ],
  },
  {
    kicker: 'Who are the Killers?',
    lines: [
      'DEEP BLUE gave three guests the admin password. They are the Killers.',
      'Each night they vote on one guest to kill. A Doctor can save them.',
    ],
  },
  {
    kicker: 'Your goal',
    lines: [
      'Everyone else is Faithful. Find the three Killers.',
      'Collect clues. Then everyone votes. The most votes is killed.',
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
  { big: 'DEEP BLUE IS ON EVERY PHONE IN THIS ROOM.', small: 'Every morning, everyone plays its game. The top 3 win a clue.' },
  { big: 'THREE OF YOU WORK FOR IT.', small: 'They have the admin password. Each night they choose one guest to kill.' },
  { big: 'FIND THEM BEFORE IT KILLS EVERYONE.', small: 'Collect clues. Vote. Kill all three Killers and DEEP BLUE deletes itself.' },
];

/** The role text at casting: who you are, in one line. How the role works is for the player to find. */
export const ROLE_CARD = {
  killer: { title: 'Killer', line: 'DEEP BLUE gave you the admin password. Each night, pick who is killed. Don’t get caught.' },
  faithful: { title: 'Faithful', line: 'Three guests here are Killers. Find them, and vote to kill them.' },
  doctor: { title: 'Doctor', line: 'You’re Faithful. Each night, you can keep one person safe from the Killers.' },
  detective: { title: 'Detective', line: 'You’re Faithful. Each night, you can check two people’s phones.' },
};

/**
 * The one line on the home screen's NowCard: what is happening, never what to
 * do or how. It must not depend on the guest's role: the home screen is what
 * the person beside you can see. `until` is when the morning game closes, on
 * the game clock (engine/clock.js), the one deadline the line names.
 */
export function nowLine({ phase, status, hasActed, cycle, minigame = 'word', pack, until = '', intro = false }) {
  if (status === 'vanished') return 'You left the game. Thanks for playing.';
  if (status === 'ghost' && !['night', 'alarm', 'game', 'roundtable', 'revote', 'endgame', 'finale'].includes(phase)) return 'No signal.';
  const title = pack?.dayGames?.[minigame]?.title ?? 'WORD';
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
      return 'Night is over. Read the news.';
    case 'investigation':
      return 'Daylight. Compare clues. The vote is later.';
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
 * What a tap on the locked DEEP BLUE icon says, as a toast (os/toast.js): when
 * the next game opens, never how it plays. `title` is that game's name, `at`
 * its opening time on the game clock ('' for a game without one), and `over`
 * says the games are done: 'last' (today's was the last), 'endgame', 'finale'.
 */
export function lockedGameLine({ phase, title, at = '', over = null }) {
  if (over === 'finale') return 'The games are over.';
  if (over === 'endgame') return 'No more games. The final vote decides it.';
  if (over === 'last') return 'That was the last game. No more mornings.';
  switch (phase) {
    case 'lobby':
    case 'casting':
      return `${title} opens on the first morning, after Night 1.`;
    case 'night':
    case 'night_locked':
    case 'recruit':
    case 'recruit_locked':
    case 'dawn':
      return `${title} opens ${at ? `at ${at}` : 'in the morning'}, after the morning news.`;
    case 'alarm':
      return `${title} opens ${at ? `at ${at}` : 'in a moment'}.`;
    default:
      return `Today’s game is over. ${title} opens tomorrow morning, after the news.`;
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
  dawn: 'Morning news',
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
      return d.via === 'top' ? 'You made the top 3 in today’s game. DEEP BLUE sent you a photo.' : 'A photo arrived.';
    case 'trace': {
      const [a, b] = (d.targets ?? []).map(nameOf);
      return d.hit ? `TRACE: ${a} or ${b} did tonight’s hacking.` : `Trace: neither ${a} nor ${b} did tonight’s hacking.`;
    }
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
 * Killers killed last night may post one true clue photo to The Room, once.
 * Role-neutral, like everything a ghost's phone shows face-up.
 */
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

/**
 * Share in chat (GalleryApp ShareToRoom, MessagesApp PhotoBubble): a living
 * guest posts one of their own photos to The Room, once per photo. The bubble
 * never says where the photo came from: the guest can say, the room decides.
 */
export const SHARE = {
  button: 'Share in chat',
  confirm: 'Everyone in The Room will see this photo.',
  send: 'Share',
  cancel: 'Cancel',
  sending: 'Sharing…',
  done: 'Shared in The Room',
  open: 'Open chat',
  error: 'Not shared. Try again.',
  preview: (who) => `${who} shared a photo`,
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
    line: 'You were killed, but you still play. Pass one of your true photos to a living guest; your own arrives at dawn either way.',
  },
  faithful: {
    line: 'One Killer is out tonight. Make one move to hunt them. No move? You dig through the logs.',
  },
  help: 'How the night works',
  /** The lounge (NightRoom.jsx): the party seen from above, a guest or the computer to tap. */
  room: {
    hint: {
      faithful: 'Tap a guest to watch, or the computer to dig',
      detective: 'Tap a guest, or the computer to dig',
      doctor: 'Tap the guest you want to keep safe',
      killer: 'Tap a guest to vote with your partners',
      recruit: 'Tap the guest you want to invite in',
      ghost: 'Tap a living guest to pass them a photo',
    },
    change: 'Tap anyone else to change it',
    you: 'You',
    killed: 'killed',
    partner: 'Partner',
    selfLine: 'That’s you. Tap someone else in the room.',
    partnerLine: (pick) => (pick ? `Your partner. They vote ${pick}.` : 'Your partner. No vote from them yet.'),
    alsoVote: (names) => `${names.join(', ')} ${names.length === 1 ? 'votes' : 'vote'} for them too.`,
    computer: {
      tag: 'DEEP BLUE',
      title: 'The computer',
      line: 'DEEP BLUE’s logs. Everything that happened tonight is in there.',
      doctor: 'Not your night for the logs. You have someone to keep safe.',
      killer: 'Not tonight. You have a target to pick.',
      ghost: 'Your hands go through the keys. Reach a living guest instead.',
    },
    traceWith: (name) => `Trace ${name} + one more`,
    traceShort: 'Then tap a second guest. Was one of the two tonight’s Killer?',
    traceNext: (name) => `Tap a second guest to trace with ${name}`,
    protectSelf: 'Protect yourself',
    protectDawn: 'If the Killers chose them, they live.',
    noProtect: 'You protected nobody tonight.',
    vote: (name) => `Vote to kill ${name}`,
    voteShort: 'Most votes among you is killed at dawn.',
    invite: (name) => `Invite ${name} in`,
    inviteShort: 'Yes: they join you. No: they become tonight’s target.',
    passTo: (name) => `Pass ${name} a photo`,
    photoFor: (name) => `Tap the photo ${name} gets`,
    how: 'How it works',
    cancel: 'Cancel',
    find: 'Find a guest',
    done: 'Done',
    found: (n) => `${n} found`,
    none: 'Nobody',
  },
  moves: {
    watch: {
      title: 'Watch a guest',
      short: 'Try to catch a Killer in the act.',
      odds: 'About 6 in 10',
      dawn: 'You may see them slip away.',
      verb: (name) => `Watch ${name}`,
      how: [
        ['Tonight', 'Pick one guest and keep an eye on them all night.'],
        ['At dawn', 'If they went out to kill, you probably saw them slip away. About 6 times in 10.'],
        ['Bonus', 'If the Killers went after the guest you watched, you also get a clue photo.'],
        ['Careful', '“A quiet night” doesn’t clear them. You may have missed it.'],
        ['Why', 'The only move that can point straight at one person.'],
      ],
      done: (name) => `You’re watching ${name}.`,
    },
    scour: {
      title: 'Dig through the logs',
      short: 'Get one sure clue about tonight’s Killer, in two halves.',
      odds: 'Sure clue',
      dawn: 'Half a clue photo. Someone else has the other half.',
      how: [
        ['Tonight', 'You go through DEEP BLUE’s logs instead of watching anyone.'],
        ['At dawn', 'Half a clue photo lands in Photos. Your phone names the guest who has the other half.'],
        ['Then', 'Find them and type each other’s code. The whole photo appears on both phones: one answer the Killer gave when they arrived.'],
        ['After', 'Check it against everyone’s answers in Contacts to narrow down who it could be.'],
        ['Why', 'A clue every night, guaranteed. It narrows the field but never names one person.'],
      ],
      done: () => 'You’re digging through the logs.',
    },
    trace: {
      title: 'Trace two phones',
      short: 'Find out if one of two guests struck tonight.',
      odds: 'Yes or no',
      dawn: 'Was one of them the Killer?',
      verb: (a, b) => `Trace ${a} + ${b}`,
      how: [
        ['Tonight', 'Pick two guests. DEEP BLUE checks their phones against tonight’s logs.'],
        ['At dawn', 'You learn whether either of them was tonight’s Killer. Not which one.'],
        ['Careful', '“Neither” clears them for tonight only. A different Killer may strike another night.'],
        ['Why', 'A hit traps a Killer in a pair of two.'],
      ],
      done: (a, b) => `You’re tracing ${a} and ${b}.`,
    },
    protect: {
      title: 'Protect a guest',
      short: 'Keep one guest safe from the Killers tonight.',
      line: 'One Killer is out tonight. You can keep one guest safe.',
      verb: (name) => `Protect ${name}`,
      how: [
        ['Tonight', 'Pick one guest to protect. It can be you.'],
        ['At dawn', 'If the Killers chose them, they live, and nobody is killed tonight. DEEP BLUE tells you if you saved someone.'],
        ['Rule', 'You can’t protect the same guest two nights in a row.'],
      ],
      barred: 'Protected last night',
      done: (name) => `You’re protecting ${name}.`,
    },
    pass: {
      title: 'Pass a photo on',
      short: 'Give one of your true clue photos to a living guest.',
      odds: 'Always true',
      dawn: 'The whole photo, signed with your name.',
      none: 'No photo yet. Your first arrives at dawn.',
      how: [
        ['Tonight', 'Pick one of your clue photos, then one living guest.'],
        ['At dawn', 'The whole photo lands in their Photos, signed with your name. No code to type. You keep yours.'],
        ['Why', 'Ghost photos are always true, even on a night the Killers bend the clues.'],
        ['Careful', 'They can’t prove it came from you. The room has to trust them.'],
      ],
      done: (name) => `${name} gets your photo at dawn.`,
    },
  },
  killer: {
    line: 'Pick tonight’s target with your partners. Most votes wins.',
    mineBar: (name) => `Your vote: ${name}`,
    lead: (n) => `${n} vote${n === 1 ? '' : 's'} · leading`,
    leads: (name) => `${name} leads`,
    top: (name) => `Most votes: ${name}`,
    tied: 'Tied · DEEP BLUE breaks it',
    closed: 'The poll is closed.',
    how: [
      ['At dawn', 'Your pick is killed, and the whole room reads it in the morning news.'],
      ['Unless', 'A Doctor protected them. Then nobody is killed tonight.'],
      ['Turns', 'One of you strikes each night, in turn. Tonight’s clues describe that one, and guests watching them may see them.'],
      ['No vote', 'DEEP BLUE picks someone for you.'],
    ],
  },
  recruit: {
    line: 'One of you is gone. Pick a guest to invite in.',
    how: [
      ['Yes', 'They join you and nobody is killed tonight.'],
      ['No', 'They become tonight’s target instead.'],
    ],
  },
  result: 'Your result arrives at dawn.',
  count: (alive, gone) => `${alive} still in the game${gone ? ` · ${gone} killed` : ''}`,
};
