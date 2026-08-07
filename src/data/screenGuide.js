import { CASE_META } from './gameData';

/**
 * What every screen is, in one place.
 *
 * Four fields per screen, three lengths of the same idea:
 *   kicker / title — the screen's frame (DESIGN_LANGUAGE.md §4.2), read by App.jsx
 *   brief          — one line, shown as a pinned note at the top of the screen
 *                    itself while the game is still teaching. See
 *                    components/ui/ScreenBrief.jsx
 *   detail         — the fuller explanation listed on the Guide (HelpView)
 *
 * Keeping all four together is what stops the Guide and the on-screen notes
 * drifting apart when copy changes — they were separate before, and the Guide
 * was already describing screens in words the screens themselves never used.
 *
 * Briefs are written short on purpose: they are set in the note face (§3.1,
 * "in-fiction margin notes") on a small paper card meant to be read at a
 * glance, and it costs a line as soon as a brief runs past ~95 characters at
 * 390px. One or two short sentences, sentence case, never uppercase.
 */

// The note is onboarding, not chrome. By Round 02 the room has been through two
// rounds of the app and a permanent explainer would just be furniture, so the
// notes clear themselves — rounds 00 and 01 only.
//
// What survives past that is the tooltip layer (data/tooltips.js), which is
// asked for rather than pinned, and so never expires.
export const BRIEF_HIDDEN_FROM_ROUND = 2;

/**
 * What each of the seven rounds is for, indexed by round number.
 *
 * Titles are not here — those come from `ROUNDS` in data/gameData.js, which is
 * what the chrome rail already reads. This is only the sentence underneath.
 *
 * One copy, two readers: the Guide prints the whole list (HelpView), and the
 * round tooltip in the chrome rail prints the current line (data/tooltips.js).
 * They were two hardcoded lists before, which is a rewording waiting to make
 * the app contradict its own rulebook mid-game.
 */
export const ROUND_GUIDE = [
  'Read the incident report and get to know the room.',
  'You are dealt your accusation card — what your character witnessed. Read it out.',
  'The riddle lock opens. Solve riddles, and trade codes, for motive files.',
  'Forensic reports and witness statements join the riddle pool.',
  'The major turns. The last clues enter the pool — keep solving and trading.',
  'Final discussion and debate before the reveal. No new clues arrive.',
  'The truth comes out. Final votes and resolution.',
];

/**
 * The Evidence screen's five stacks.
 *
 * Same two fields as a screen, because that is what a stack becomes once you drill
 * into it — App.jsx frames it exactly like one. The `kicker` also serves as the
 * stack's sub-label on the Evidence hub, so a tile and the screen it opens can
 * never describe the same stack differently.
 *
 * None of them repeats the word "Evidence" in the kicker, which matters for the
 * evidence stack in particular: it shares the screen's name, and "Evidence Board /
 * Evidence" is the one frame that would read as a mistake.
 */
export const EVIDENCE_STACKS = {
  accusations: { kicker: 'Who saw what',    title: 'Accusations' },
  motives:     { kicker: 'Reasons to act',  title: 'Motives' },
  evidence:    { kicker: 'Hard findings',   title: 'Evidence' },
  revelations: { kicker: 'The turns',       title: 'Revelations' },
  files:       { kicker: 'Official record', title: 'Case files' },
};

export const SCREEN_GUIDE = {
  // The grid hub has no kicker/title here — GridMenu draws the event's own
  // masthead rather than a screen frame. It carries a brief so a player landing
  // on the board for the first time knows where to start.
  hub: {
    briefLabel: 'Start here',
    brief: 'This is the main app, you can explore the screens in any order. The first thing to do is read the story and your own identity. Dont tell anyone if you are the murderer! Go through all the Guest profiles and try to deduce who did it. Go ahead, find them in the crowd and interogate them!',
  },

  // No brief: the host is running the game, not learning it.
  host: {
    kicker: 'Control',
    title: 'Host Console',
  },

  dashboard: {
    kicker: 'Confidential',
    title: 'Identity',
    brief: 'This is you — role, history, and the one secret nobody else can see. Read it before you talk to anyone.',
    detail: 'Your character: role, profession, backstory and the secret only you can see. Tap the redaction bar to unseal it.',
  },

  // The same beats as the Round 0 briefing slideshow, as a document. Copy for
  // both lives in data/storyIntro.js.
  story: {
    kicker: 'The Night',
    title: 'The Story',
    brief: 'What happened at the party, in order. Come back whenever you lose the thread.',
    detail:
      'The case briefing: the distillery, the birthday ritual, the collapse, and the sealed venue — everything the room knows about the night. It plays as a briefing when the game opens, and lives here afterwards.',
  },

  intel: {
    kicker: 'Evidence Board',
    title: 'Evidence',
    // The brief is the Round 00–01 note, and ASK is not on screen in either of
    // those rounds (ASK_OPENS_AT, data/gameData.js) — so it points at the button
    // that *is* down there. The detail is the Guide, read in every round, so it
    // explains both and says when the second one turns up.
    brief: 'Five stacks of paper. Tap one to read it, or punch a code somebody reads out into CODE, bottom right.',
    detail:
      "Your case, sorted into stacks: accusations, motives, evidence, revelations, and the official case files. Tap a stack to read it. A stack greyed out with a round number on it has not opened yet. CODE sits bottom right: it is where you type in a code somebody else has given you. From Round 02 a second button, ASK, appears beside it — it deals you a riddle, and solving it unseals a new clue plus a code you can give to anyone. Your own accusation card, and the confession if you ever get one, stay pinned on the front page.",
  },

  chat: {
    kicker: 'Encrypted',
    title: 'Comms',
    brief: 'One channel, every guest. Whatever you send is signed with your name, so choose what you give away.',
    detail: 'Talk to all players in real time. Share theories, ask questions, compare alibis. Every message is attributed, so you can track who said what.',
  },

  timeline: {
    kicker: 'Your Movements',
    title: 'Timeline',
    brief: "Where you were, hour by hour, on the night. This is the alibi you'll be defending.",
    detail: 'Your own movements on the night of the incident, and the public account of the incident itself. Learn it — someone will question it.',
  },

  // No `files` entry: Archives was merged into Evidence on 2026-08-05, and the
  // case files are now the lower region of that screen. See
  // components/views/CaseFilesSection.jsx.

  dossier: {
    kicker: 'Profiles',
    title: 'Guests',
    brief: 'Every guest on record. Open a file to read their background — or to vote against them.',
    detail: `All ${CASE_META.playerCount} guests. Tap anyone to open their file and read their background. Use it to work out who had access and who had motive.`,
  },

  votes: {
    kicker: 'Suspect List',
    title: 'Vote',
    brief: 'Name who you think did it. You can change your vote until the host closes the ballot.',
    detail: 'When the ballot opens, name who you think is responsible. Tap a name to select, tap again to confirm. You can change your vote until the host closes it.',
  },

  help: {
    kicker: 'Read Me',
    title: 'Guide',
    brief: 'How the night works: rounds, codes, voting. Come here whenever you lose the thread.',
    detail: 'The full rulebook: what each screen does, how codes work, how voting works, and what happens in each of the seven rounds.',
  },
};
