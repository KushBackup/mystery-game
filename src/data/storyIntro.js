/**
 * The Round 0 briefing — the day, as the office knows it at 4:30 PM.
 *
 * One source of truth for two surfaces:
 *   components/StoryIntro.jsx  — the fullscreen typed slideshow that takes over
 *                                the screen while the game is still in Round 0
 *   components/views/StoryView.jsx — the same beats as a readable case document,
 *                                reachable from the board at any point
 *
 * ⚠️ SPOILER DISCIPLINE. This is what a staff member standing in the sealed
 * office at 4:30 PM could tell you, and nothing more. Everything here is drawn
 * from STORY.md's public record and the Incident Report (`f_incident` in
 * gameData.js), both of which are public at Round 0. It must NOT reach forward
 * into the rounds that pay off later:
 *
 *   Round 3  cause of death — oleandrin, the dosed tumbler, the scheduled
 *            camera gap, badge V-07, the forged vendor pack, the staged alert
 *   Round 4  what Dev was really hired to do, the ₹3.4 crore skim, his draft,
 *            the shared Uber
 *   Round 5+ the group chat, the settlement archive, the five-person conspiracy
 *
 * The coffee machine and Dev's ritual are mentioned because the whole floor
 * lived with both — the repair was a running joke by 10 AM. That the tumbler
 * was the delivery path is Round 3's reveal, not this screen's. "Query
 * poisoning" is public: the paramedic said it in front of the room. If you add
 * a slide, check it against that list first.
 *
 * Each slide is: a mono kicker (never typed — it labels the slide), a typewriter
 * heading, and one to three body lines. Heading and lines are typed as a single
 * stream, so the pacing carries across the whole slide rather than restarting
 * per paragraph. Keep a slide under ~200 characters: past that the typing
 * outstays its welcome and the block stops fitting a 375px phone without
 * scrolling, which the slideshow deliberately cannot do.
 */

import { CASE_META } from './gameData';

// Base milliseconds per character. Punctuation adds its own hold on top (see
// hooks/useTypewriter.js), so the felt rhythm is slower than this number: at 22
// the measured cost of a ~150-character slide is about 4.3 seconds, of which
// roughly a quarter is punctuation. A tap fills the slide instantly, so this is a
// pace, never a wait.
export const STORY_TYPE_MS = 22;

export const STORY_SLIDES = [
  {
    id: 'venue',
    kicker: 'Indiranagar, Bangalore · 21 August 2026',
    heading: 'Midford KTR2',
    lines: [
      'Three floors of TripleSpeed, a terrace with a hedge, and a nameplate that still says Chimp Processing Pvt Ltd.',
      'Today was supposed to be Onam. It got as far as the payasam.',
    ],
  },
  {
    id: 'company',
    kicker: 'The Company',
    heading: 'TripleSpeed',
    lines: [
      'Chasing ten million dollars a month, and past the halfway mark.',
      'A place where the WiFi flaps, the ads overspend, the vendors scam, and nobody looks up. Remember that part.',
    ],
  },
  {
    id: 'victim',
    kicker: 'The Victim',
    heading: 'Dev Malhotra',
    lines: [
      'A consultant, three weeks in — "something payments," people said.',
      'What he actually did was ask questions about money. Half this office had been on the wrong end of one.',
    ],
  },
  {
    id: 'ritual',
    kicker: 'The Machine',
    heading: 'The Beast',
    lines: [
      'The third-floor coffee machine: dead for two weeks, four ignored tickets — fixed this morning, by urgent request.',
      'Dev was the only person who drank from it daily. Everyone knew his ritual.',
    ],
  },
  {
    id: 'party',
    kicker: '1:00 PM',
    heading: 'Onam',
    lines: [
      'Sadhya on the terrace, pookalam, games, a livestream.',
      'At 2:47 a payment alert pulled a dozen people off the terrace and back to their desks. At this company, that is just weather.',
    ],
  },
  {
    id: 'collapse',
    kicker: '3:55 PM',
    heading: 'The Glass Room',
    lines: [
      'Dev left the party at 3:12 — "save me some payasam" — for his coffee and his slides.',
      'At 3:55 he was found behind the glass. The paramedic wrote two words: query poisoning.',
    ],
  },
  {
    id: 'sealed',
    kicker: '4:30 PM',
    heading: 'Sealed',
    lines: [
      'Inspector Arjun Kale locked floors one to three and the terrace. Nobody has left this building since 1 PM.',
      `Thirty-four of the ${CASE_META.playerCount} of you cannot be placed on the terrace when it mattered.`,
    ],
  },
  {
    id: 'brief',
    kicker: 'Your Job',
    heading: 'Break The Story',
    lines: [
      'Seven rounds. Solve a riddle to unseal evidence, then trade its code around the room.',
      'Talk, lie, accuse, vote. The office only wins if it names what really happened.',
    ],
    // Handwriting closes the briefing, the way it closes the board (§3.1 —
    // in-fiction margin notes). Shown only once the slide has finished typing.
    note: 'Trust no one.',
  },
];
