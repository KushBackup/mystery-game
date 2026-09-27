/**
 * Story pack: Greenr, Assagao.
 *
 * A pack is everything story-shaped in Killers Night, and nothing else. The
 * players are the cast (whoever turns up), and the victims are real guests
 * the Killers choose. So a pack only needs:
 *
 *   - the setting, read aloud once by the host at casting;
 *   - two lines of narration per beat, for the host to read. `{name}` is the
 *     guest the beat is about;
 *   - one flavour line per trait group, for clue cards. The card also prints
 *     the plain meaning ("Drink: gin, vodka, rum, whisky or a cocktail"),
 *     generated from data/traits.js, so flavour can be evocative without
 *     being a riddle;
 *   - the whisper words Ghosts may send. No trait words ("gin", "glasses"),
 *     or a Ghost's one word becomes a clue better than the room's.
 *
 * Every line is short. Players read at most one card at a time, and the
 * host's voice carries the story (Lessons.md: the reading-load feedback).
 */

export default {
  id: 'greenr',
  title: 'Last Seating at Greenr',
  place: 'Greenr, Assagao, Goa',

  setting: [
    'A private sunset dinner at Greenr, deep in Assagao.',
    'At 5:25 the rain came, and someone chained the side gate. Nobody leaves.',
    'Among you are Killers. Each night, one of them kills.',
    'Find them before the last seating.',
  ],

  narration: {
    casting: ['Look at your phone. Tell no one what it says.', 'Killers, you will find each other tonight.'],
    night: ['The generator hums. The lights drop. Phones only.', 'Killers choose. Everyone else: watch, or search.'],
    dawnDeath: ['The lights come back.', '{name} is slumped over the long table. They are gone.'],
    dawnSaved: ['The lights come back. Someone screams.', '{name} was attacked, and survived. A Doctor was close.'],
    dawnQuiet: ['The lights come back.', 'Everyone is still here. That is somehow worse.'],
    dawnRecruited: ['The lights come back.', 'Nobody died. But somebody said yes to something.'],
    investigation: ['Compare what you found. Look at each other.', 'Ten minutes. Then the table.'],
    roundtable: ['To the long table.', 'Accuse, defend, then vote. Whoever the room chooses leaves.'],
    banishKiller: ['{name} is banished.', '{name} was a KILLER.'],
    banishFaithful: ['{name} is banished.', '{name} was FAITHFUL. The room was wrong.'],
    banishNone: ['The table cannot agree.', 'Nobody leaves tonight.'],
    endgame: ['The rain is stopping. This is the last seating.', 'Banish again, or trust who is left.'],
    finaleFaithful: ['The gate opens.', 'Every Killer is gone. The Faithful win.'],
    finaleKillers: ['The gate opens.', 'A Killer walks out with you. The Killers win.'],
  },

  // One line per trait group (see data/traits.js for the groups).
  clueText: {
    top: {
      dark: 'A dark thread, snagged on the gate latch.',
      pale: 'A pale fibre on the victim’s sleeve.',
      vivid: 'A bright fleck of colour caught in the bougainvillea.',
      plain: 'The fibres at the scene are one solid colour. No print.',
    },
    glasses: {
      glasses: 'A lens cloth, dropped beside the body.',
      bare: 'The witness is sure: the figure wore no glasses.',
    },
    shoes: {
      rubber: 'Rubber-sole prints in the wet garden soil.',
      leather: 'A hard heel, heard clicking down the stone stair.',
      open: 'Toe prints in the spilled tonic. Open footwear.',
      flat: 'Flat prints across the wet tiles. No heel.',
    },
    drink: {
      hops: 'The glass they left still smells of beer.',
      grape: 'A wine ring on the table where they stood.',
      spirit: 'Something distilled on the rim. Not beer, not wine.',
      clear: 'A clear, botanical smell on the glass.',
      brewed: 'Beer or wine on the rim. Nothing distilled.',
      sober: 'Their glass held nothing stronger than soda.',
      strong: 'Neat liquor on the glass. No mixer.',
    },
    season: {
      early: 'A torn tarot card: born January to June.',
      late: 'A torn tarot card: born July to December.',
      cool: 'A torn tarot card: born in the cool months.',
      warm: 'A torn tarot card: born in the warm months.',
    },
    siblings: {
      firstborn: 'The victim’s last words: “the first-born…”',
      younger: 'The victim’s last words: “somebody’s little sibling…”',
      sibling: 'The victim’s last words: “they have a brother or sister…”',
      edge: 'The victim’s last words: “the eldest, or the youngest…”',
    },
  },

  whispers: [
    'Liar', 'Trust', 'Watch', 'Wrong', 'Framed', 'Fake', 'Close', 'Near', 'Far',
    'Left', 'Right', 'Table', 'Bar', 'Door', 'Garden', 'Stair', 'Again', 'Twice',
    'Yes', 'No', 'Friend', 'Beware', 'Quiet', 'Hurry',
  ],
};
