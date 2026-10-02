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
  title: 'The Murder Mystery Experience',
  by: 'Astral Project',
  with: 'Greenr',
};

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

/** The role text at casting: who you are, in one line. How the role works is for the player to find. */
export const ROLE_CARD = {
  killer: { title: 'Killer', line: 'Don’t get caught.' },
  faithful: { title: 'Faithful', line: 'Someone here is a Killer. Find them.' },
  doctor: { title: 'Doctor', line: 'Each night, you can keep one person safe.' },
  detective: { title: 'Detective', line: 'Each night, you can look into two people.' },
};

/**
 * The one line on the home screen's NowCard: what is happening, never what to
 * do or how. It must not depend on the guest's role: the home screen is what
 * the person beside you can see. `until` is when the morning game closes, on
 * the game clock (engine/clock.js), the one deadline the line names.
 */
export function nowLine({ phase, status, hasActed, cycle, minigame = 'run', pack, until = '' }) {
  if (status === 'vanished') return 'You left the game. Thanks for playing.';
  if (status === 'ghost' && !['night', 'endgame', 'finale'].includes(phase)) return 'No signal.';
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
      return until ? `Wake up. Play ${title} before ${until}.` : 'Wake up.';
    case 'game':
      return until ? `${title} is open until ${until}.` : `${title} has started.`;
    case 'game_locked':
      return 'Time.';
    case 'dawn':
      return 'The board is up.';
    case 'investigation':
      return 'Daylight.';
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
  banish: 'Banishment',
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
    case 'fact':
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
 * `how` rows are [label, text]. 25 words or fewer per text.
 */
export const NIGHT = {
  title: (cycle) => `Night ${cycle}`,
  day: {
    title: 'Not night yet',
    line: 'Night moves open when night falls. DEEP BLUE will ping you.',
  },
  faithful: {
    line: 'Each night, one Killer goes out to strike. Pick one move to hunt them.',
    foot: 'Make no move and you dig through the logs.',
    head: 'Your move tonight',
  },
  moves: {
    watch: {
      glyph: 'eye',
      title: 'Watch a guest',
      short: 'Try to catch a Killer in the act.',
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
      glyph: 'search',
      title: 'Dig through the logs',
      short: 'Get one sure clue about tonight’s Killer.',
      how: [
        ['Tonight', 'You go through DEEP BLUE’s logs instead of watching anyone.'],
        ['At dawn', 'A clue photo lands in Photos. It shows one answer the Killer who struck gave when they arrived.'],
        ['Then', 'Check it against everyone’s answers in Contacts to narrow down who it could be.'],
        ['Why', 'A clue every night, guaranteed. It narrows the field but never names one person.'],
      ],
      cta: 'Dig tonight',
      done: () => 'You’re digging through the logs.',
    },
    trace: {
      glyph: 'signal',
      title: 'Trace two phones',
      short: 'Find out if one of two guests struck tonight.',
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
      glyph: 'shield',
      title: 'Protect a guest',
      short: 'Keep one guest safe from the Killers tonight.',
      line: 'Each night, one Killer goes out to strike. You can keep one guest safe.',
      how: [
        ['Tonight', 'Pick one guest to protect. It can be you.'],
        ['At dawn', 'If the Killers chose them, they live. DEEP BLUE tells you if you saved someone.'],
        ['But', 'The deep still takes the lowest real score on the morning board instead. Your guest is safe from that too.'],
        ['Rule', 'You can’t protect the same guest two nights in a row.'],
      ],
      pick: 'Who do you protect?',
      barred: 'Protected last night',
      done: (name) => `You’re protecting ${name}.`,
    },
    whisper: {
      glyph: 'chat',
      title: 'Whisper from beyond',
      short: 'Send one word to a living guest.',
      line: 'You were taken, but you still play. Help the living find the Killers.',
      how: [
        ['Tonight', 'Pick one word, then one living guest.'],
        ['At dawn', 'They read your word, signed with your name.'],
        ['Also', 'Every night you get a clue photo of your own. Ghost clues are always true.'],
      ],
      word: 'Pick a word',
      pick: (word) => `Who hears “${word}”?`,
      done: (name, word) => `${name} will hear “${word}”.`,
    },
  },
  killer: {
    line: 'Pick tonight’s target with your partners. Most votes wins.',
    how: [
      ['At dawn', 'DEEP BLUE drops their score to the bottom of the morning board, and the deep takes them.'],
      ['Unless', 'A Doctor protected them. Then the lowest real score is taken instead, and that could be one of you.'],
      ['Turns', 'One of you strikes each night, in turn. Tonight’s clues describe that one, and guests watching them may see them.'],
      ['No vote', 'DEEP BLUE picks someone for you.'],
    ],
    mine: (name) => `Your pick: ${name}. You can change it.`,
  },
  recruit: {
    line: 'One of you is gone. Pick a guest to invite in.',
    how: [
      ['Yes', 'They join you and nobody dies tonight.'],
      ['No', 'They become tonight’s target instead.'],
    ],
  },
  result: 'Your result arrives at dawn.',
  change: 'You can change your move until the night ends.',
  changeBtn: 'Change my move',
  count: (alive, gone) => `${alive} still in the game${gone ? ` · ${gone} taken` : ''}`,
};
