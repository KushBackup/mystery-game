/**
 * The Round 0 briefing — the night, as the room knows it.
 *
 * One source of truth for two surfaces:
 *   components/StoryIntro.jsx  — the fullscreen typed slideshow that takes over
 *                                the screen while the game is still in Round 0
 *   components/views/StoryView.jsx — the same beats as a readable case document,
 *                                reachable from the board at any point
 *
 * ⚠️ SPOILER DISCIPLINE. This is what a guest standing inside For the Record at
 * 10:48 PM could tell you, and nothing more. Everything here is drawn from
 * STORY.md's prologue and the Incident Report (`f_incident` in gameData.js),
 * both of which are public at Round 0. It must NOT reach forward into the
 * rounds that pay off later:
 *
 *   Round 3  cause of death — aconitine, delivered through the finishing spray
 *   Round 4  the buyout packet, the stolen bar program, the forged paper trail
 *   Round 5+ the admin trace, the burner thread, the five-person conspiracy
 *
 * The signature drink is mentioned because the whole room watched him raise it.
 * That the finishing spray was the delivery path is Round 3's reveal, not this
 * screen's. If you add a slide, check it against that list first.
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
    kicker: 'Panjim, Goa · 8 August 2026',
    heading: 'For the Record',
    lines: [
      'A late-night listening bar in Panjim, hired out for one expensive birthday and one room full of grudges.',
      'Ten of Armaan Khanna\'s oldest friends were told to bring four people each. One circle brought five.',
    ],
  },
  {
    id: 'occasion',
    kicker: 'The Occasion',
    heading: 'Birthday Night',
    lines: [
      'Velvet Ember is on the edge of a buyout, and Armaan wanted to toast himself before the lawyers arrived.',
      `All ${CASE_META.playerCount} of you are here because he liked the way you made the room look.`,
    ],
  },
  {
    id: 'victim',
    kicker: 'The Victim',
    heading: 'Armaan Khanna',
    lines: [
      'Founder and CEO of Velvet Ember Spirits. Charming in public, predatory in private.',
      'He borrowed talent, buried credit, and made enemies faster than the liquor aged.',
    ],
  },
  {
    id: 'ritual',
    kicker: '10:12 PM',
    heading: 'The Last Light',
    lines: [
      'Armaan insisted on his signature ritual: one glass, one clear cube, one orange mist over the top.',
      'He lifted it toward the room and thanked everyone for making him impossible to ignore.',
    ],
  },
  {
    id: 'collapse',
    kicker: '10:22 PM',
    heading: 'The Collapse',
    lines: [
      'Ten minutes later his grip failed first. Then his knees. Then the room understood this was not drunkenness.',
      'He hit the copper rail on the way down. At 10:34 the paramedics stopped trying.',
    ],
  },
  {
    id: 'sealed',
    kicker: '10:48 PM',
    heading: 'Sealed',
    lines: [
      'Inspector Ira Deshpande locked the gates and the excise officers froze the bar inventory where it stood.',
      `“All ${CASE_META.playerCount} of you are giving statements before anyone touches the street.”`,
    ],
  },
  {
    id: 'room',
    kicker: 'The Room',
    heading: 'Ten Circles',
    lines: [
      'Armaan built the room in clusters: ten direct invitees at the center, everyone else orbiting them.',
      'Most of you had a reason to hate him. One of those reasons became a plan.',
    ],
  },
  {
    id: 'brief',
    kicker: 'Your Job',
    heading: 'Break The Story',
    lines: [
      'Seven rounds. Evidence reaches you on printed cards; the codes go in your decoder.',
      'Talk, lie, accuse, vote. The room only wins if it names what really happened.',
    ],
    // Handwriting closes the briefing, the way it closes the board (§3.1 —
    // in-fiction margin notes). Shown only once the slide has finished typing.
    note: 'Trust no one.',
  },
];
