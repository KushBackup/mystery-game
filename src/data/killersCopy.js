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
    line: 'You have the admin password. Each night, pick whose score sinks to the bottom, and who does the hacking.',
    tip: 'Whoever hacks leaves clues. Take turns. Still play the run: last place is dangerous for you too.',
  },
  faithful: {
    title: 'Faithful',
    line: 'Each night, watch a guest or dig through the logs. By day, find the Killers and vote them out.',
    tip: 'Clues describe whoever hacked. Look at shoes, tops, glasses. Top 3 in the run earn a photo.',
  },
  doctor: {
    title: 'Doctor',
    line: 'Each night, put a firewall on one guest’s score. Never the same guest two nights running.',
    tip: 'If your firewall stops a rig, the lowest honest score is taken instead.',
  },
  detective: {
    title: 'Detective',
    line: 'Each night, trace two guests’ phones against the server log. Learn if either of them did tonight’s hacking.',
    tip: 'Claim it and the Killers will come for you.',
  },
  medium: {
    title: 'Medium',
    line: 'Each night, summon one ghost. You see their clue, and learn if they were a Killer. They talk to you in Spirits.',
    tip: 'You play for the Faithful. Ghosts can lie in Spirits. A séance can’t.',
  },
};

/** The one line at the top of the screen. `ctx` = { phase, role, status, cycle, ... } */
export function nowLine({ phase, role, status, isRecruitTarget, hasActed }) {
  if (status === 'vanished') return 'You left the game. Thanks for playing.';
  if (status === 'ghost') {
    if (phase === 'night') return hasActed ? 'Whisper sent. Wait for dawn.' : 'Send one word to one living guest.';
    if (phase === 'endgame') return 'Final vote. The dead vote too.';
    if (phase === 'game') return 'Ghosts can still play. Your score can’t hurt you now.';
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
      if (role === 'detective') return 'Trace two guests, or dig through the logs.';
      if (role === 'medium') return 'Summon a ghost, or dig through the logs.';
      return 'Watch a guest, or dig through the logs.';
    case 'recruit':
      return isRecruitTarget ? 'The Killers want you. Decide.' : 'The night is long. Wait.';
    case 'alarm':
      return 'Wake up. The run starts in a moment.';
    case 'game':
      return 'Tap to swim. Your best run counts. Don’t come last.';
    case 'game_locked':
      return 'Time. The board is being posted…';
    case 'dawn':
      return 'The board is up. See who was taken.';
    case 'investigation':
      return 'Check Gallery and Messages. Compare. Look at people.';
    case 'roundtable':
      return 'Vote someone out in the group.';
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
  alarm: 'Alarm',
  game: 'The run',
  game_locked: 'The run',
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
      return d.hit ? `TRACE: ${a} or ${b} did tonight’s hacking. At least one of them is a KILLER.` : `Trace: neither ${a} nor ${b} did tonight’s hacking.`;
    }
    case 'seance':
      return d.team === 'killers' ? `${nameOf(d.ghost)} came through. They were a KILLER.` : `${nameOf(d.ghost)} came through. They were innocent.`;
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
  trace: 'Trace',
  seance: 'Séance',
  whisper: 'Whisper',
  saved: 'Saved',
  quiet: 'Search',
  recruited: 'Recruited',
  recruitOffer: 'Offer',
};
