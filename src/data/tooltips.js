import { ROUNDS } from './gameData';
import { ROUND_GUIDE } from './screenGuide';

/**
 * Tooltip copy, in one place — the on-demand half of the app's explanation
 * layer (DESIGN_LANGUAGE.md §6.13, components/ui/InfoTip.jsx).
 *
 * Same reasoning as data/screenGuide.js, and the split between the two is
 * deliberate:
 *
 *   screenGuide.js  what a *screen* is. Shown automatically, rounds 00–01 only.
 *   tooltips.js     what a *control or number* is. Asked for, and never expires.
 *
 * The screen notes clear at Round 02 because a permanent explainer pinned to
 * every screen is furniture. But the game runs to Round 06, and by Round 04 a
 * player is looking at four stacks, two floating buttons, a withheld tally and
 * a number called "in play this round" with nothing on screen to explain any of
 * it. These are what they can tap.
 *
 * Copy rules, all of which fall out of the surface (§6.13):
 *   - `label` is a mono label on paper. Keep it under ~22 characters or it
 *     wraps in a 300px panel.
 *   - `body` is the note voice at 16px. Two or three short sentences; past
 *     roughly 200 characters the panel stops being a glance.
 *   - Say what the player can *do*, not what the component is. "The host
 *     decides when the numbers become public" beats "tally visibility state".
 *   - Never leak the case. These are read in every round, including Round 00.
 */

const pad2 = (n) => String(n).padStart(2, '0');

export const TOOLTIPS = {
  // --- Evidence -----------------------------------------------------------
  collected: {
    label: 'Collected',
    body: 'Clues sitting on your board. They arrive three ways: you solve a riddle, somebody reads you a code, or the host releases one to the whole room.',
  },

  inPlay: {
    label: 'In play',
    body: 'How many clues this round has unsealed. The rest exist but are still locked, which is why a code from a later round gets refused — wait for the host to advance, then try it again.',
  },

  evidenceTools: {
    label: 'Ask and Code',
    body: 'ASK deals you a riddle. Solve it and a new clue opens on your board with a code attached — read that code out and anyone can add the same clue to theirs. CODE is where you type in the ones you hear.',
  },

  // Rounds 00–01, when CODE is alone down there: ASK has nothing to pay out yet
  // (ASK_OPENS_AT in data/gameData.js) and so is not on screen. A tooltip that
  // explained a button the player cannot see would send them hunting for it.
  evidenceCode: {
    label: 'Code',
    body: 'Where you type in a clue code somebody reads out to you. Enter one and their clue opens on your board too — which is the only way anything moves around this room.',
  },

  caseFiles: {
    label: 'Case files',
    body: 'The official record: reports, forensics, exhibits. The host releases these to everyone at once, so you never need a code for them and nobody has one you do not.',
  },

  // --- Identity -----------------------------------------------------------
  identity: {
    label: 'Your file',
    body: 'Who you are playing, and the one secret nobody else can see. Tap the redaction to unseal it. It leaves this screen only if you choose to say it out loud.',
  },

  // --- Timeline -----------------------------------------------------------
  myTimeline: {
    label: 'Your alibi',
    body: 'Where your character was, hour by hour. The red marks are the beats that matter. Somebody will question this tonight, so learn it before they do.',
  },

  publicTimeline: {
    label: 'Public record',
    body: 'What the whole room already knows about the night. Your own movements above it are yours alone — comparing the two is where the holes show up.',
  },

  // --- Comms --------------------------------------------------------------
  comms: {
    label: 'Open channel',
    body: 'One channel, every guest, and your name on everything you send. Codes travel fastest here — but so does anything you did not mean to give away.',
  },

  // --- Guests -------------------------------------------------------------
  guests: {
    label: 'Guest files',
    body: 'Everyone at the party, in one order that is the same on all 51 phones. The number beside a name is their file number — call that out instead of spelling it. Nothing here says who is a suspect.',
  },

  // --- Vote ---------------------------------------------------------------
  ballot: {
    label: 'The ballot',
    body: 'The host opens and closes it. While it is open, tap a name once to select and again to confirm — and change your mind as often as you like until it shuts.',
  },

  tally: {
    label: 'The tally',
    body: 'Counts move live as the room votes, but the host decides when the numbers go public. Withheld means they are hidden from everybody, not just from you.',
  },
};

/**
 * The round tooltip — the only one that is generated rather than written.
 *
 * It answers "what can I do right now?", which is the question a player has
 * most often and the one the app never answers anywhere else. It rides the
 * chrome rail and the board's masthead, so it is reachable from every screen in
 * the game, and the copy is the same `ROUND_GUIDE` line the Guide prints for
 * that round — the tooltip and the rulebook cannot disagree.
 */
export const roundTip = (currentRound) => {
  const index = Math.min(Math.max(currentRound, 0), ROUNDS.length - 1);
  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;

  return {
    label: `Round ${pad2(round.id)} · ${round.title}`,
    body: isLast
      ? ROUND_GUIDE[index]
      : `${ROUND_GUIDE[index]} The host decides when the case moves on.`,
  };
};
