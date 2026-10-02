/**
 * The Help app's words: every rule of the game, in short plain sentences.
 *
 * This is the second place the phone explains mechanics in full (the first is
 * `NIGHT` in killersCopy.js). The user asked for it on 2026-10-02: a Help app
 * with all the rules and what everything means, in very simple sentences.
 * It is *pulled*: nothing opens it, nothing links a guest to it unasked, so
 * the rest of the phone can keep letting players discover the game.
 *
 * Rules for this file:
 *
 * 1. Role-neutral. Help reads the same on every phone, so a glance at a
 *    neighbour's screen shows nothing. It describes every role and never
 *    "your" role.
 * 2. One idea per line, about 12 words or fewer. A guest reads this standing
 *    up in a loud bar.
 * 3. True to the engine. Every line here restates engine/night.js,
 *    morning.js, minigames.js, banish.js, win.js or roster.js. Change them
 *    together. `NIGHT` in killersCopy.js says the same things at more length.
 * 4. `**word**` sets a word in bold. Nothing else is parsed.
 *
 * A topic is { id, title, sub (its row in the list), glyph, tone, kicker,
 * sketch (a HelpSketch id), lines, tip, links (topic ids), terms, apps, qa }.
 * The list order is the reading order: each page's Next button follows it.
 */

export const HELP_HERO = {
  title: 'The game in 30 seconds',
  lines: [
    'Some guests are secretly **Killers**.',
    'Every night, the Killers take someone.',
    'Every morning, the whole room plays a quick game.',
    'Then you find **clues** and talk.',
    'The room **votes** one suspect out.',
    'Catch every Killer to win.',
  ],
  cta: 'Read the rules',
};

/** Phase → the "Each day" topic it belongs to, for the Now tag. Public, so role-neutral. */
export const HELP_NOW = {
  night: 'night',
  night_locked: 'night',
  recruit: 'night',
  recruit_locked: 'night',
  alarm: 'morning',
  game: 'morning',
  game_locked: 'morning',
  dawn: 'board',
  investigation: 'investigate',
  roundtable: 'vote',
  roundtable_locked: 'vote',
  revote: 'vote',
  revote_locked: 'vote',
  banish: 'vote',
  endgame: 'ending',
  endgame_locked: 'ending',
  finale: 'ending',
};

export const HELP_SECTIONS = [
  {
    head: 'The basics',
    topics: [
      {
        id: 'teams',
        title: 'Killers and Faithful',
        sub: 'The two teams',
        glyph: 'star',
        tone: 'sea',
        sketch: 'teams',
        lines: [
          'There are two teams: the **Killers** and the **Faithful**.',
          'Usually three guests are Killers.',
          'Everyone else is Faithful.',
          'A few Faithful get a power: **Doctor** or **Detective**.',
          'Your role arrives as a sealed message. Tap it to read it.',
          'Keep your role to yourself.',
          'Anyone can say anything. Anyone can lie.',
        ],
        tip: 'Lost your role? It’s in Messages, in the DEEP BLUE thread.',
        links: ['faithful', 'killer'],
      },
      {
        id: 'win',
        title: 'How to win',
        sub: 'You win as a team',
        glyph: 'crown',
        tone: 'sea',
        sketch: 'win',
        lines: [
          'You win or lose with your team. No personal scores.',
          'The **Faithful** win when every Killer is out.',
          'The **Killers** win when they equal the Faithful left in the game.',
          'The Killers also win if one of them survives the final votes.',
        ],
      },
    ],
  },
  {
    head: 'Each day',
    foot: 'The game has its own clock, faster than real time. Open Clock to see when each part starts.',
    topics: [
      {
        id: 'night',
        title: 'Night',
        sub: 'Everyone makes a secret move',
        kicker: 'Step 1 · from 01:00',
        glyph: 'moon',
        tone: 'ocean',
        sketch: 'night',
        lines: [
          'Night falls on every phone at once.',
          'Open the **Night** app and pick your move.',
          'The Killers choose who to take.',
          'Everyone else picks a way to hunt them.',
          'Ghosts make a move too.',
          'Your result arrives in the morning.',
        ],
        tip: 'You can change your move until night ends. The Night app explains every move.',
      },
      {
        id: 'morning',
        title: 'Morning game',
        sub: 'The whole room plays',
        kicker: 'Step 2 · from 07:00',
        glyph: 'alarm',
        tone: 'ocean',
        sketch: 'morning',
        lines: [
          'At 07:00 on the game clock, your alarm goes off.',
          'Open **DEEP BLUE** and play before the board goes up.',
          'The game changes each day: Word, Sketch or The Run.',
          'Everyone ends with a score.',
          'Nobody makes you play. If you don’t, you score 0.',
          'A 0 can be the lowest score, and the lowest can be taken.',
        ],
        links: ['word', 'sketch', 'run'],
      },
      {
        id: 'board',
        title: 'The board',
        sub: 'The deep takes the lowest score',
        kicker: 'Step 3 · about 1 minute',
        glyph: 'trophy',
        tone: 'ocean',
        sketch: 'board',
        lines: [
          'The scores go up in **News**.',
          'The **lowest score** is taken by the deep.',
          'The Killers’ target drops to last place, however well they played.',
          'If the Doctor protected them, the real lowest score is taken instead.',
          'That could even be a Killer.',
          'The **top 3** each win a clue photo.',
          'Anyone taken becomes a **ghost**.',
        ],
      },
      {
        id: 'investigate',
        title: 'Investigate',
        sub: 'Clues and talking',
        kicker: 'Step 4 · most of the day',
        glyph: 'search',
        tone: 'ocean',
        sketch: 'investigate',
        lines: [
          'This is the heart of the game. Talk to people!',
          'Open **Photos** to see your clue photos.',
          'Each clue describes the Killer who struck last night.',
          'Open **Contacts** to see who matches.',
          'Share what you found. Ask people questions.',
          'Watch for answers that don’t add up.',
        ],
        links: ['clues', 'lies'],
      },
      {
        id: 'vote',
        title: 'The vote',
        sub: 'Banish a suspect',
        kicker: 'Step 5 · in the evening',
        glyph: 'vote',
        tone: 'ocean',
        sketch: 'vote',
        lines: [
          'DEEP BLUE posts a poll in **Messages**.',
          'Vote for the guest you think is a Killer.',
          'You can change your vote until the poll closes.',
          'Most votes is **banished**.',
          'A tie means one quick re-vote between the tied guests.',
          'Then everyone sees if they were a Killer, and who voted for whom.',
          'Ghosts don’t vote here.',
        ],
      },
      {
        id: 'ending',
        title: 'The final votes',
        sub: 'How the game ends',
        kicker: 'After the last day',
        glyph: 'bell',
        tone: 'ocean',
        sketch: 'ending',
        lines: [
          'After the last day come **two final votes**.',
          'Ghosts vote in these too.',
          'If any Killer is still in after them, the Killers win.',
          'The game ends sooner if a team has already won.',
          'At the end, every phone shows every role.',
          'You also see what really happened each night.',
        ],
      },
    ],
  },
  {
    head: 'Morning games',
    topics: [
      {
        id: 'word',
        title: 'Word',
        sub: 'Post one word that fits',
        kicker: 'Morning game',
        glyph: 'chat',
        tone: 'green',
        sketch: 'word',
        lines: [
          'Most guests see a secret word, like **Mango**.',
          'Killers only see a hint, like **Fruit**.',
          'Post one word that fits. Never the word itself.',
          'Clues go up on a wall in the order they’re sent.',
          'Then pick the three clues that fit best.',
          'A fair clue scores 100, plus 50 for each pick.',
          'A clue that gives the word away scores 0.',
          'Ghosts can’t post, but they can pick.',
        ],
        tip: 'Everyone can see who posted late, and whose clue missed.',
      },
      {
        id: 'sketch',
        title: 'Sketch',
        sub: 'Draw, then guess',
        kicker: 'Morning game',
        glyph: 'pencil',
        tone: 'green',
        sketch: 'sketch',
        lines: [
          'Everyone gets a secret word to draw.',
          'Draw it with your finger. You have 45 seconds.',
          'Then guess other guests’ drawings, one at a time.',
          'Type your guess. A faster right guess scores more.',
          'Your drawing scores each time someone guesses it.',
          'Ghosts guess, but don’t draw.',
        ],
      },
      {
        id: 'run',
        title: 'The Run',
        sub: 'Tap to swim',
        kicker: 'Morning game',
        glyph: 'whale',
        tone: 'green',
        sketch: 'run',
        lines: [
          'Tap to swim. Don’t hit anything.',
          'You have 90 seconds. Play as many times as you like.',
          'Only your **best** run counts.',
          'Ghosts play too, on their own board.',
        ],
      },
    ],
  },
  {
    head: 'Roles',
    foot: 'Everyone except the Killers is on the Faithful team.',
    topics: [
      {
        id: 'faithful',
        title: 'Faithful',
        sub: 'Find the Killers',
        glyph: 'heart',
        tone: 'steel',
        sketch: 'faithful',
        lines: [
          'You hunt the Killers with the rest of the room.',
          'Each night, **watch** a guest or **dig through the logs**.',
          'Watching may catch a Killer slipping out.',
          'Digging gets you one sure clue photo.',
          'By day, share clues and vote well.',
        ],
      },
      {
        id: 'killer',
        title: 'Killer',
        sub: 'Don’t get caught',
        glyph: 'skull',
        tone: 'red',
        sketch: 'killer',
        lines: [
          'Each night, the Killers pick one guest to take.',
          'They choose together, in secret, in Messages.',
          'Most votes wins.',
          'One Killer strikes each night, taking turns.',
          'That night’s clues describe the one who struck.',
          'By day, blend in. Lie if you need to.',
          'If a Killer goes home early, the Killers can invite a guest to join.',
          'A guest who says no is taken that night.',
        ],
      },
      {
        id: 'doctor',
        title: 'Doctor',
        sub: 'Keep someone safe',
        glyph: 'shield',
        tone: 'steel',
        sketch: 'doctor',
        lines: [
          'Each night, protect one guest. It can be you.',
          'If the Killers chose them, they live.',
          'You can’t protect the same guest two nights in a row.',
          'You’ll be told if you saved someone.',
          'A big room may have two Doctors.',
        ],
      },
      {
        id: 'detective',
        title: 'Detective',
        sub: 'Trace two phones',
        glyph: 'signal',
        tone: 'steel',
        sketch: 'detective',
        lines: [
          'Each night, trace two guests.',
          'At dawn, you learn if either of them struck that night.',
          'You don’t learn which one.',
          '“Neither” only clears them for that night.',
        ],
      },
      {
        id: 'ghost',
        title: 'Ghost',
        sub: 'Out, but still playing',
        glyph: 'ghost',
        tone: 'steel',
        sketch: 'ghost',
        lines: [
          'You become a ghost when you’re taken or banished.',
          'You still play, and your team can still win.',
          'Each night, **whisper** one word to a living guest.',
          'Each night, you get a clue photo. Ghost clues are always true.',
          'You can read the room’s chat, but not post in it.',
          'Talk with other ghosts in **Spirits**.',
          'You vote in the final votes.',
        ],
      },
    ],
  },
  {
    head: 'Clues',
    topics: [
      {
        id: 'clues',
        title: 'How clues work',
        sub: 'Photos that point at a Killer',
        glyph: 'photo',
        tone: 'deep',
        sketch: 'clues',
        lines: [
          'At the door, everyone answered six questions.',
          'Top colour, glasses, shoes, first drink, birthday and siblings.',
          'Everyone’s answers are in **Contacts**.',
          'A clue photo shows one answer of the Killer who struck.',
          'It names a group, like “a dark top”. Never one person.',
          'Put two or three clues together to narrow it down.',
          'Killers take turns, so each night may point at a different Killer.',
        ],
        tip: 'You get clues by digging at night, finishing top 3, or as a ghost.',
      },
      {
        id: 'lies',
        title: 'Spot a lie',
        sub: 'Check the file against the person',
        glyph: 'check',
        tone: 'deep',
        sketch: 'lies',
        lines: [
          'Contacts only shows what people **said** at the door.',
          'Someone may have lied, or taken off a jacket.',
          'On someone’s card, tap an answer to mark it.',
          'Mark it as a match, or as what you really see.',
          'Only your phone sees your marks.',
        ],
      },
    ],
  },
  {
    head: 'More',
    topics: [
      {
        id: 'phone',
        title: 'Your phone',
        sub: 'What each app is for',
        glyph: 'lock',
        tone: 'chrome',
        apps: [
          ['messages', 'Messages', 'Chat with the room. Polls appear here.'],
          ['deepblue', 'DEEP BLUE', 'The morning game.'],
          ['news', 'News', 'The board, the verdicts and the local news.'],
          ['gallery', 'Photos', 'Your clue photos.'],
          ['contacts', 'Contacts', 'Everyone, with their six answers.'],
          ['night', 'Night', 'Your secret move each night.'],
          ['clock', 'Clock', 'The time in the game, and when each part starts.'],
          ['weather', 'Weather', 'The storm over Panjim.'],
          ['settings', 'Settings', 'Sound, your device code, leaving early.'],
        ],
        lines: [
          'The card at the top of your home screen says what’s happening. Tap it.',
          'A red badge means something new.',
          'Pull down from the top for your notifications.',
          'The round button at the bottom takes you home.',
        ],
      },
      {
        id: 'words',
        title: 'What words mean',
        sub: 'Taken, banished, the deep…',
        glyph: 'dots',
        tone: 'chrome',
        terms: [
          ['The deep', 'What takes the lowest score each morning.'],
          ['Taken', 'Out of the game in the morning. Now a ghost.'],
          ['Banished', 'Voted out by the room. Now a ghost.'],
          ['Ghost', 'A guest who is out, but still plays.'],
          ['The board', 'The morning scoreboard, in News.'],
          ['Clue photo', 'A photo that shows one answer of a Killer.'],
          ['Faithful', 'Everyone who isn’t a Killer.'],
          ['Spirits', 'The ghosts’ own chat. Only ghosts see it.'],
          ['Went home', 'Left the party early. Their role stays secret.'],
        ],
      },
      {
        id: 'faq',
        title: 'Quick answers',
        sub: 'Lost role, dead phone, leaving',
        glyph: 'question',
        tone: 'chrome',
        qa: [
          ['Where is my role?', 'Messages, in the DEEP BLUE thread.'],
          ['I was taken. Now what?', 'You’re a ghost. Keep playing. Open Night each night.'],
          ['I missed the morning game.', 'You scored 0 that day. Play the next one.'],
          ['Can I lie?', 'Yes. Anyone can say anything.'],
          ['My phone died.', 'Find the host. Bring your device code from Settings.'],
          ['I have to leave.', 'Settings, then Leave the game. Your role stays secret.'],
          ['Something looks wrong.', 'Find the host.'],
        ],
      },
    ],
  },
];

/** Every topic in reading order. */
export const HELP_TOPICS = HELP_SECTIONS.flatMap((s) => s.topics);
