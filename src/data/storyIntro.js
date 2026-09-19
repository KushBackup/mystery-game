import { CASE_META } from './gameData';

/**
 * The Round 0 briefing - public facts only.
 *
 * This is what the room can know before the investigation starts. It must not
 * reveal the delivery path, the AV schedule, the frame on Nilisha or how many
 * people acted together.
 */

export const STORY_TYPE_MS = 22;

export const STORY_SLIDES = [
  {
    id: 'venue',
    kicker: 'Assagao, Goa · 19 September 2026',
    heading: 'Greenr',
    lines: [
      'A sunset signing dinner, a room full of people with too much invested, and rain starting to pin the exits shut.',
      'Tonight was supposed to end with a closing. It got as far as the welcome line.',
    ],
  },
  {
    id: 'deal',
    kicker: 'The Night',
    heading: 'Tonight Was The Closing',
    lines: [
      'Twenty-six founders, collaborators and advisers gathered to sign off on a Greenr launch vehicle before dinner.',
      'Instead, the room got diligence, panic and police tape.',
    ],
  },
  {
    id: 'victim',
    kicker: 'The Victim',
    heading: 'Rehan Vora',
    lines: [
      'An independent diligence partner brought in to bless the numbers before sunset.',
      'He spent the day asking pointed questions about money, paper and who exactly was getting paid twice.',
    ],
  },
  {
    id: 'ritual',
    kicker: 'The Habit',
    heading: 'The Black Bottle',
    lines: [
      'Rehan carried one black steel bottle everywhere and kept refilling it from the self-serve decanter at the upstairs tea shelf.',
      'Everybody noticed the bottle. Nobody thought it mattered until after he fell.',
    ],
  },
  {
    id: 'crash',
    kicker: '5:58 PM',
    heading: 'The Glitch',
    lines: [
      'The launch reel stuttered, the guest Wi-Fi died and the card reader went with it.',
      'In a room like this, that looks like inconvenience. Tonight, it may be the whole murder.',
    ],
  },
  {
    id: 'collapse',
    kicker: '6:18 PM',
    heading: 'The Library',
    lines: [
      'He was found upstairs before the welcome line ever began.',
      'By 6:31, the room had heard the two words nobody wanted: likely poisoning.',
    ],
  },
  {
    id: 'sealed',
    kicker: '6:40 PM',
    heading: 'No One Left',
    lines: [
      'Rain locked the side gate, valet held the lane, and police sealed Greenr with all twenty-six of you still inside.',
      `Several of the ${CASE_META.playerCount} of you cannot be continuously placed in public view when it mattered.`,
    ],
  },
  {
    id: 'brief',
    kicker: 'Your Job',
    heading: 'Break The Closing',
    lines: [
      'Seven rounds. Solve riddles to unseal evidence, then trade the codes across the room.',
      'Talk, accuse, lie if you must. This only closes if the room finds the right answer and the right method.',
    ],
    note: 'Trust the neatest story last.',
  },
];