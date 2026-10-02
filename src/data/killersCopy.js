/**
 * Every word a player reads in Killers Night that isn't the story pack's.
 *
 * Two rules. From the feedback that started the rebuild: nobody should have
 * to read to play, so each line is 25 words or fewer. And from 2026-10-02:
 * players discover the game. Copy states the premise and what just happened;
 * it never explains how a mechanic works (the rig, who strikes, the firewall).
 * The board, the photos and the room teach that. If a screen seems to need
 * an explanation, give it a cue instead: a badge, a banner, a result.
 */

/** The role text at casting: who you are, in one line. How the role works is for the player to find. */
export const ROLE_CARD = {
  killer: { title: 'Killer', line: 'Don’t get caught.' },
  faithful: { title: 'Faithful', line: 'Someone here is a Killer. Find them.' },
  doctor: { title: 'Doctor', line: 'Each night, you can keep one person safe.' },
  detective: { title: 'Detective', line: 'Each night, you can look into two people.' },
  medium: { title: 'Medium', line: 'The dead talk to you.' },
};

/**
 * The one line on the home screen's NowCard: what is happening, never what to
 * do or how. It must not depend on the guest's role: the home screen is what
 * the person beside you can see.
 */
export function nowLine({ phase, status, hasActed, cycle, minigame = 'run', pack }) {
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
      return 'Wake up.';
    case 'game':
      return `${title} has started.`;
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
    case 'seance':
      return d.team === 'killers' ? `${nameOf(d.ghost)} came through. They were a KILLER.` : `${nameOf(d.ghost)} came through. They were innocent.`;
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
  seance: 'Séance',
  whisper: 'Whisper',
  saved: 'Saved',
  quiet: 'Search',
  recruited: 'Recruited',
  recruitOffer: 'Offer',
};
