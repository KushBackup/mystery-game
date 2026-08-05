/**
 * The Round 0 briefing — the night, as the room knows it.
 *
 * One source of truth for two surfaces:
 *   components/StoryIntro.jsx  — the fullscreen typed slideshow that takes over
 *                                the screen while the game is still in Round 0
 *   components/views/StoryView.jsx — the same beats as a readable case document,
 *                                reachable from the board at any point
 *
 * ⚠️ SPOILER DISCIPLINE. This is what a guest standing in the Penthouse at
 * 9:30 PM could tell you, and nothing more. Everything here is drawn from
 * STORY.md's prologue and the Incident Report (`f_incident` in gameData.js),
 * both of which are public at Round 0. It must NOT reach forward into the
 * rounds that pay off later:
 *
 *   Round 3  cause of death — sodium azide, delivered through the vape
 *   Round 4  the cancer, the SEBI inquiry, the insurance policies
 *   Round 5+ the HR trail, the staging, Alam
 *
 * The vape is mentioned because witnesses saw him using it and the police
 * report says so. That it was the murder weapon is Round 3's reveal, not this
 * screen's. If you add a slide, check it against that list first.
 *
 * Each slide is: a mono kicker (never typed — it labels the slide), a typewriter
 * heading, and one to three body lines. Heading and lines are typed as a single
 * stream, so the pacing carries across the whole slide rather than restarting
 * per paragraph. Keep a slide under ~200 characters: past that the typing
 * outstays its welcome and the block stops fitting a 375px phone without
 * scrolling, which the slideshow deliberately cannot do.
 */

// Base milliseconds per character. Punctuation adds its own hold on top (see
// hooks/useTypewriter.js), so the felt rhythm is slower than this number: at 22
// the measured cost of a ~150-character slide is about 4.3 seconds, of which
// roughly a quarter is punctuation. A tap fills the slide instantly, so this is a
// pace, never a wait.
export const STORY_TYPE_MS = 22;

export const STORY_SLIDES = [
  {
    id: 'venue',
    kicker: 'Bangalore · 23 May 2026',
    heading: 'The Penthouse',
    lines: [
      'Fourth floor, Indiranagar. Two founders and their roommate live here.',
      "For two years it has been TripleSpeed's unofficial second office.",
    ],
  },
  {
    id: 'occasion',
    kicker: 'The Occasion',
    heading: 'Series B',
    lines: [
      '₹400 crore. Westland Capital leading. The round closes Friday.',
      'All thirty-two of you are here to watch the founders say the number out loud.',
    ],
  },
  {
    id: 'victim',
    kicker: 'The Victim',
    heading: 'Nikhil',
    lines: [
      'Head of Marketing. He took credit that was not his and left careers in pieces doing it.',
      'He also made the founders look brilliant, so nobody ever asked him a hard question.',
    ],
  },
  {
    id: 'toast',
    kicker: '8:15 PM',
    heading: 'The Toast',
    lines: [
      'Thinner than people remembered, but he had his energy on.',
      '“Some of you have wanted to kill me on at least one Tuesday.”',
      'The room laughed. He hit his vape, twice, and raised his glass.',
    ],
  },
  {
    id: 'collapse',
    kicker: '8:45 PM',
    heading: 'The Collapse',
    lines: [
      'By then he had drifted out to the balcony. Waxy face. Eyes that would not focus.',
      'He slumped off the stone bench onto the floor. At 9:02 the paramedics stopped working.',
    ],
  },
  {
    id: 'sealed',
    kicker: '9:30 PM',
    heading: 'Sealed',
    lines: [
      'Inspector Reema Mathur, Indiranagar division. The doors are shut and nobody has gone home.',
      '“All thirty-two of you are going to give me a statement.”',
    ],
  },
  {
    id: 'room',
    kicker: 'The Room',
    heading: 'Thirty-Two Suspects',
    lines: [
      'Everyone here worked with him. Almost everyone here had a reason.',
      'One of you did it — and that person is holding a phone exactly like this one.',
    ],
  },
  {
    id: 'brief',
    kicker: 'Your Job',
    heading: 'Find The Killer',
    lines: [
      'Seven rounds. Evidence reaches you on printed cards; the codes go in your decoder.',
      'Talk, lie, accuse, vote. The room only wins if it names the right person.',
    ],
    // Handwriting closes the briefing, the way it closes the board (§3.1 —
    // in-fiction margin notes). Shown only once the slide has finished typing.
    note: 'Trust no one.',
  },
];
