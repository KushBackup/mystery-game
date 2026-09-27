/**
 * Every word a player reads in Killers Night that isn't the story pack's.
 *
 * The rule, from the feedback that started the rebuild: nobody should have to
 * read to play. Each line here is 25 words or fewer, and the NowCard (one line,
 * top of every screen) is the only instruction a player ever needs. If a
 * line needs a second sentence to be understood, the mechanic is too
 * complicated, not the copy too short.
 */

export const ROLE_CARD = {
  killer: {
    title: 'Killer',
    line: 'Each night, choose who dies and which Killer strikes. By day, blend in. Survive the last seating.',
    tip: 'The one who strikes leaves clues. Take turns.',
  },
  faithful: {
    title: 'Faithful',
    line: 'Each night, watch a guest or search the scene. By day, find the Killers and banish them.',
    tip: 'Clues describe the killer. Look at shoes, tops, glasses.',
  },
  doctor: {
    title: 'Doctor',
    line: 'Each night, protect one guest from the Killers. Never the same guest two nights running.',
    tip: 'You play for the Faithful. Stay quiet about it.',
  },
  detective: {
    title: 'Detective',
    line: 'Twice this game, learn whether a guest is a Killer. Every other night, search the scene.',
    tip: 'Claim it and the Killers will come for you.',
  },
  medium: {
    title: 'Medium',
    line: 'The dead can talk to you. Listen in the Spirits channel, then decide what to tell the room.',
    tip: 'You play for the Faithful. Ghosts can lie too.',
  },
};

/** The one line at the top of the screen. `ctx` = { phase, role, status, cycle, ... } */
export function nowLine({ phase, role, status, isRecruitTarget, hasActed }) {
  if (status === 'vanished') return 'You left the game. Thanks for playing.';
  if (status === 'ghost') {
    if (phase === 'night') return hasActed ? 'Whisper sent. Wait for dawn.' : 'Send one word to one living guest.';
    if (phase === 'endgame') return 'Final vote. The dead vote too.';
    return 'You are a ghost. Talk to the Medium in Spirits. Vote in the Endgame.';
  }
  switch (phase) {
    case 'lobby':
      return 'You’re in. Wait for the host to deal the roles.';
    case 'casting':
      return 'Read your role. Tell no one.';
    case 'night':
      if (hasActed) return 'Done. Keep your phone close until dawn.';
      if (role === 'killer') return 'Choose tonight’s victim, and who strikes.';
      if (role === 'doctor') return 'Choose one guest to protect tonight.';
      if (role === 'detective') return 'Check a guest, or search the scene.';
      return 'Watch a guest, or search the scene.';
    case 'recruit':
      return isRecruitTarget ? 'The Killers want you. Decide.' : 'The night is long. Wait.';
    case 'dawn':
      return 'See who is gone. Then check your evidence.';
    case 'investigation':
      return 'Share your clue. Compare. Look at people.';
    case 'roundtable':
      return 'Vote to banish one guest.';
    case 'revote':
      return 'A tie. Vote again, between these guests only.';
    case 'banish':
      return 'Look at who voted for whom. Remember it.';
    case 'endgame':
      return 'Final vote. Ghosts vote too. Any Killer left wins it.';
    case 'finale':
      return 'The gate opens.';
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
  dawn: 'Dawn',
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
    case 'whisper':
      return `${nameOf(d.from)} whispers from beyond: “${d.word}”`;
    case 'saved':
      return `You saved ${nameOf(d.target)} tonight.`;
    case 'quiet':
      return 'You searched. Nothing tonight.';
    case 'recruited':
      return 'You are a KILLER now. Your new partners are waiting.';
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
  whisper: 'Whisper',
  saved: 'Saved',
  quiet: 'Search',
  recruited: 'Recruited',
  recruitOffer: 'Offer',
};
