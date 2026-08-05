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
 * Briefs are written short on purpose: they are set in the handwriting face
 * (§3.1, "in-fiction margin notes"), which reads fast at a glance and badly in
 * paragraphs. One or two short sentences, sentence case, never uppercase.
 */

// The note is onboarding, not chrome. By Round 02 the room has been through two
// rounds of the app and a permanent explainer would just be furniture, so the
// notes clear themselves — rounds 00 and 01 only.
export const BRIEF_HIDDEN_FROM_ROUND = 2;

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
    brief: 'Every tile is a screen. Start with your Identity, then read the Guide.',
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
      "The case briefing: the venue, the victim, the toast, the collapse and the sealed penthouse — everything the room knows about the night. It plays as a briefing when the game opens, and lives here afterwards.",
  },

  intel: {
    kicker: 'Evidence Board',
    title: 'Evidence',
    brief: 'Five stacks of paper. Tap one to read it, or punch a code from a printed card into the decoder.',
    detail:
      "Your case, sorted into stacks: accusations, motives, evidence, revelations, and the official case files. Tap a stack to read it. A stack greyed out with a round number on it has not opened yet. Use the CODE button to enter codes from printed cards — the clue lands in its own stack. Your own accusation card, and the confession if you ever get one, stay pinned on the front page.",
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
    title: 'Suspects',
    brief: 'Every guest on record. Open a file to read their background — or to vote against them.',
    detail: 'All 32 guests. Tap anyone to open their file and read their background. Use it to work out who had access and who had motive.',
  },

  votes: {
    kicker: 'Suspect List',
    title: 'Vote',
    brief: 'Name who you think did it. You can change your vote until the host closes the ballot.',
    detail: 'When the ballot opens, name who you think is responsible. Tap a suspect to select, tap again to confirm. You can change your vote until the host closes it.',
  },

  help: {
    kicker: 'Read Me',
    title: 'Guide',
    brief: 'How the night works: rounds, codes, voting. Come here whenever you lose the thread.',
    detail: 'The full rulebook: what each screen does, how codes work, how voting works, and what happens in each of the seven rounds.',
  },
};
