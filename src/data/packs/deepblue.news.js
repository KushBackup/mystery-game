/**
 * The News app's world: what the rest of Panjim is reading while the room plays.
 *
 * Three kinds of thing live here:
 *   - `articles`   authored world stories. Each belongs to a *day* and appears
 *                  with that morning's alarm (day 0 is there from the lobby), so
 *                  the paper escalates as the game does and is never empty.
 *   - `epilogue`   the morning-after piece once the game is over, by winner.
 *   - `live`       the templates the room's own events (the board, the vote) are
 *                  printed with. `{name}`, `{score}`, `{day}` are filled in code.
 *   - `ticker`     the one-line crawl under the masthead, by day.
 *
 * RULES FOR EVERYTHING IN THIS FILE
 *   1. Pure flavour. Killers are dealt live from whoever turned up, so no line
 *      here may name, describe or hint at a real guest, or teach a rule. The
 *      public only knows what the setting already tells everyone: an app that
 *      rings every morning, a leaderboard, and last place found dead.
 *   2. Every story must be true whatever happens in the room. Stories unlock by
 *      day, never by outcome. The toll rises on a fixed curve: 9, 14, 23, 31, 40, 52.
 *   3. DEEP BLUE is fictional. Never the real challenge's name, never a method,
 *      never a victim under 18, never a how-to. Deaths are "found", cause
 *      "undetermined". Nobody here is a real person: no real quotes, no real
 *      officials, no real outlets. Sources are anonymous.
 *   4. Greenr, Panjim is a bystander. It is where the room happens to be, and it
 *      is never the cause, the cover-up or the culprit. Keep it that way.
 *   5. Read on a phone, standing up, in a loud café: short paragraphs.
 *
 * `art` names a scene in src/os/art/NewsArt.jsx.
 */

export const OUTLETS = {
  wire: { name: 'Konkan Wire', tag: 'WIRE' },
  courier: { name: 'Mandovi Courier', tag: 'PANJIM' },
  dispatch: { name: 'Fontainhas Dispatch', tag: 'LOCAL' },
  times: { name: 'The Deep Times', tag: 'THE DEEP TIMES' },
};

/** Section names, as the segmented control and the lists print them. */
export const SECTIONS = { top: 'Top', room: 'The Room', world: 'Panjim' };

export const ARTICLES = [
  // ------------------------------------------------------------------ DAY 0
  {
    id: 'nine-dead',
    day: 0,
    lead: true,
    outlet: 'wire',
    kicker: 'ALERT',
    head: 'Nine dead in three weeks. Every one finished last on DEEP BLUE.',
    dek: 'Investigators link deaths across Goa and the coast to an app nobody remembers installing.',
    by: 'Konkan Wire, Panaji',
    time: '06:12',
    art: 'phone',
    cap: 'The icon residents describe: a small white whale on a dark blue tile.',
    body: [
      'Nine people have died across Goa in the past three weeks. Investigators now say the cases share one detail: each had an app called DEEP BLUE on their phone, and each came last on its leaderboard the morning before.',
      'The app is in no app store. People who have it say they never installed it. It arrived, with a whale for an icon, and began ringing at 7:00 every morning.',
      'Everyone who has it is told to play a short run. A leaderboard posts when the timer ends. Last place is “taken”. By the next day, that person has been found dead.',
      'There was no sign of a struggle in any of the nine cases. The cause of death is undetermined. A cyber-crime officer, who asked not to be named, said the team has “no way yet to trace where it comes from, or who reads the scores”.',
    ],
  },
  {
    id: 'seven-am',
    day: 0,
    outlet: 'courier',
    kicker: 'PANJIM',
    head: 'Phones in Panjim are ringing at 7 a.m. Nobody set the alarm.',
    dek: 'From Fontainhas to Campal, the same blue icon and the same bell.',
    by: 'Mandovi Courier desk',
    time: '06:40',
    art: 'bell',
    cap: 'It rings at exactly 7:00. Residents say the tone is not one they chose.',
    body: [
      'Ask for a show of hands at any tea stall near the Panjim market and a few will go up. The same whale. The same bell, at exactly 7:00.',
      '“I turned the phone off,” said a shopkeeper on 18th June Road, who asked not to be named. “It rang anyway. Then the screen said I had ninety seconds.”',
      'Telecom engineers say no network event matches the pattern. Phones on Wi-Fi, on mobile data and in flight mode have all reported it.',
      'Several residents say they now sleep with the phone in another room. They say it makes no difference.',
    ],
  },
  {
    id: 'stay-together',
    day: 0,
    outlet: 'wire',
    kicker: 'ADVISORY',
    head: 'If DEEP BLUE appears on your phone, stay with other people.',
    dek: 'Investigators ask residents to report the icon and not to sit through the timer alone.',
    by: 'Konkan Wire, Panaji',
    time: '07:05',
    art: 'tape',
    cap: 'Of the nine, seven were last seen alone.',
    body: [
      'Investigators have asked anyone who finds the DEEP BLUE icon on their phone to tell someone nearby, and to stay in company while the morning timer runs.',
      'Of the nine people who have died, seven were last seen alone. Two were at home with family.',
      'Officers also ask residents not to share their phone’s unlock code with anyone, and to photograph the leaderboard each morning. “If it changes after you look at it, we want to know,” the officer said.',
      'Experts caution that ignoring the app does not appear to stop it.',
    ],
  },
  {
    id: 'greenr-open',
    day: 0,
    outlet: 'courier',
    kicker: 'VENUE',
    head: 'Greenr stays open tonight. “It’s a café, not a crime scene.”',
    dek: 'A full house is expected in Panjim despite a day of warnings to stay home.',
    by: 'Mandovi Courier desk',
    time: '17:48',
    art: 'cafe',
    cap: 'Tables at Greenr were being laid at half past five.',
    body: [
      'Greenr, the café-bar in Panjim, expects a full room tonight, despite a day of messages urging people to stay indoors.',
      'A manager said staff had checked the Wi-Fi, the till system and every device on the premises. “Nothing of ours is putting that app on anyone’s phone,” she said. “People are scared. We would rather they were scared together, with something to eat.”',
      'Early arrivals say every phone at the tables already carries the whale. Nobody remembers installing it.',
      '“Nine people are dead,” said one guest. “And we’re all here anyway.”',
      'The first morning run is at 7:00.',
    ],
  },

  // ------------------------------------------------------------------ DAY 1
  {
    id: 'ninety-seconds',
    day: 1,
    lead: true,
    outlet: 'wire',
    kicker: 'INSIDE THE RUN',
    head: 'The ninety seconds: survivors describe the morning run.',
    dek: 'The toll is now fourteen. A few of those still playing have agreed to talk.',
    by: 'Konkan Wire, Panaji',
    time: '08:20',
    art: 'run',
    cap: 'Those who have played describe a small whale and a wall with a gap in it.',
    body: [
      'Those who have played describe a small whale on a dark screen, a wall of obstacles with a gap in it, and a clock. Everyone gets about ninety seconds and as many tries as they can stand. The best run counts.',
      '“It’s the waiting that does it,” said a woman in Altinho who has played eleven mornings and finished last on none. “You watch the board load, and you add up everyone else’s number.”',
      'Then the leaderboard posts, with names the player recognises. The toll across the coast now stands at fourteen.',
      'Nobody who has spoken says they enjoy it. Nobody who has spoken says they have stopped.',
    ],
  },
  {
    id: 'panjim-stops',
    day: 1,
    outlet: 'courier',
    kicker: 'CITY',
    head: 'At 7 a.m. Panjim stops. Then it looks at the leaderboard.',
    dek: 'Commuters, vendors and a traffic constable, all heads down for ninety seconds.',
    by: 'Mandovi Courier desk',
    time: '07:50',
    art: 'street',
    cap: 'Near the Kadamba bus stand, a queue stood still.',
    body: [
      'At 7:00 a.m., a queue near the Kadamba bus stand stopped moving. Nobody was boarding. Nobody was talking. Every head was bent over a phone.',
      'A vendor who sells chai from a cart said he has stopped pouring at the hour. “Nobody drinks till the board is up. Then they drink very slowly.”',
      'The city’s other rhythm is unchanged: the river, the heat, the church bells at the hour. Only the faces are different.',
    ],
  },
  {
    id: 'ferry-crews',
    day: 1,
    outlet: 'dispatch',
    kicker: 'THE RIVER',
    head: 'Mandovi ferry crews ask passengers to put phones away.',
    dek: '“The bell goes off mid-river and half the deck stops being a deck.”',
    by: 'Fontainhas Dispatch',
    time: '09:10',
    art: 'ferry',
    cap: 'The Mandovi crossings still run to time.',
    body: [
      'Deckhands on the Mandovi crossings have started asking passengers to put their phones in their bags before the boat leaves the bank.',
      '“The bell goes off in the middle of the river, and half the deck stops being a deck,” one said. “People are standing at the rail, scared of falling in, and playing a whale game.”',
      'The crossings are running to time. The crews say they would rather nobody is holding a phone when the ramp comes down.',
    ],
  },

  // ------------------------------------------------------------------ DAY 2
  {
    id: 'twenty-three',
    day: 2,
    lead: true,
    outlet: 'wire',
    kicker: 'SPREADING',
    head: 'Twenty-three dead as DEEP BLUE moves up the coast.',
    dek: 'Reports from Karwar to Ratnagiri. Pathologists say the bodies “say nothing”.',
    by: 'Konkan Wire, Panaji',
    time: '06:55',
    art: 'board',
    cap: 'Every morning, the same layout. One name at the bottom.',
    body: [
      'The toll has risen to twenty-three. New cases have been reported in Karwar, Ratnagiri and Mangaluru.',
      'The pattern holds: the morning run, the board, one name at the bottom. Hospitals report no common illness. Post-mortems have found no cause.',
      '“We are used to bodies that tell us something,” said a pathologist who asked not to be named. “These say nothing at all.”',
      'Officers say the app’s data cannot be copied, backed up or opened on any machine they have tried.',
    ],
  },
  {
    id: 'bars-split',
    day: 2,
    outlet: 'courier',
    kicker: 'BUSINESS',
    head: 'Bars and cafés split: some shut, some are full.',
    dek: 'Venues that stayed open say people want company more than they want safety.',
    by: 'Mandovi Courier desk',
    time: '13:15',
    art: 'cafe',
    cap: 'Lights on at dusk in a Panjim café.',
    body: [
      'Several Panjim venues have closed their doors for the week. Others are turning people away.',
      'Greenr, which has stayed open throughout, says its tables are full each evening. “Nobody wants to wait for the morning alone,” a manager said.',
      'Taxi drivers report a rise in late-night fares from the cafés to the river, and then home before 7:00.',
    ],
  },
  {
    id: 'nobody-wins',
    day: 2,
    outlet: 'times',
    kicker: 'OPINION',
    head: 'Nobody wins DEEP BLUE. That is the point.',
    dek: 'The leaderboard is not a game. It is a way of making you watch each other.',
    by: 'The Deep Times editorial board',
    time: '16:30',
    art: 'eyes',
    cap: 'Look at the person next to you.',
    body: [
      'A leaderboard has one purpose: it makes you look sideways. Who is above you? Who is below you? Who has gone very quiet?',
      'DEEP BLUE asks nothing else of us. It does not need a clever trick. It needs forty people in a room, and a number beside each name.',
      'The sensible response is not to scroll faster. It is to ask why the person at the table beside you is so calm.',
      'We do not know who is reading these scores. We know who is reading each other.',
    ],
  },

  // ------------------------------------------------------------------ DAY 3
  {
    id: 'scores-dispute',
    day: 3,
    lead: true,
    outlet: 'wire',
    kicker: 'DISPUTED',
    head: '“He was better than that.” Families dispute the final scores.',
    dek: 'In four cases, relatives say the posted number was far lower than the run they watched.',
    by: 'Konkan Wire, Panaji',
    time: '07:40',
    art: 'board',
    cap: 'The last line on the board, in the app’s own colours.',
    body: [
      'Relatives of at least four of the dead say the score posted beside their name was far lower than the run they watched the evening before.',
      '“I stood behind her. She had never played that well,” said one. “The board said she was last.”',
      'Investigators say they cannot yet check any score. The app’s records cannot be copied, and its leaderboard cannot be opened after it closes.',
      'The toll stands at thirty-one.',
    ],
  },
  {
    id: 'vigil',
    day: 3,
    outlet: 'dispatch',
    kicker: 'LOCAL',
    head: 'Vigil on the Mandovi promenade: “Two hundred on Monday. Tonight, forty.”',
    dek: 'Candles are still lit each evening at the river wall. The crowd gets smaller.',
    by: 'Fontainhas Dispatch',
    time: '19:05',
    art: 'vigil',
    cap: 'Candles along the river wall at dusk.',
    body: [
      'Each evening, residents gather on the promenade by the Mandovi to light a candle for the dead. On Monday there were two hundred. Tonight there were forty.',
      '“People are afraid to be out when the sun goes down,” said an organiser. “They want to be in a room with the doors shut and somebody beside them.”',
      'The candles burn down by the time the lamps come on.',
    ],
  },

  // ------------------------------------------------------------------ DAY 4
  {
    id: 'cannot-delete',
    day: 4,
    lead: true,
    outlet: 'courier',
    kicker: 'LATEST',
    head: 'Forty dead. The app cannot be deleted.',
    dek: 'Phone shops report people swapping handsets. The new phone rings too.',
    by: 'Mandovi Courier desk',
    time: '08:10',
    art: 'deleted',
    cap: 'A factory reset. The icon was back by seven.',
    body: [
      'Phone shops near the Panjim market say customers are arriving with a request: wipe it, replace it, whatever it takes.',
      'Technicians have tried factory resets, new SIM cards and new handsets. The whale icon is back by 7:00.',
      '“A man bought a new phone yesterday afternoon,” said a shop owner. “It was in the box. It rang at seven.”',
      'The toll stands at forty.',
    ],
  },
  {
    id: 'empty-servers',
    day: 4,
    outlet: 'wire',
    kicker: 'WATCH',
    head: 'The search for the servers leads to an empty rack.',
    dek: 'Investigators traced the app to a coastal data centre. Nobody rents the space.',
    by: 'Konkan Wire, Panaji',
    time: '14:30',
    art: 'servers',
    cap: 'One rack, lit, with no tenant on record.',
    body: [
      'Investigators say they have traced the app’s traffic to a data centre on the coast. On arrival, officers found one rack of running machines with no tenant on record.',
      'Staff said the cabinet had been paid for in advance, in cash, and that nobody had been seen near it.',
      'Cameras at the site recorded only the blinking lights.',
    ],
  },

  // ------------------------------------------------------------------ DAY 5
  {
    id: 'final-board',
    day: 5,
    lead: true,
    outlet: 'wire',
    kicker: 'FINAL BOARD',
    head: 'DEEP BLUE says it is closing. Nobody believes it.',
    dek: 'At 7:00 a message on every phone: the last board is today.',
    by: 'Konkan Wire, Panaji',
    time: '07:02',
    art: 'bell',
    cap: 'The screen at 7:00: FINAL BOARD.',
    body: [
      'At 7:00 this morning, the app put up a new message on every phone that carries it: FINAL BOARD.',
      'Nobody knows whether this means the end of the app, the end of the people who play it, or a different kind of beginning.',
      'Residents are asked to stay in company. The toll stands at fifty-two.',
    ],
  },
  {
    id: 'last-call',
    day: 5,
    outlet: 'courier',
    kicker: 'CITY',
    head: 'Panjim holds its breath for the last board.',
    dek: 'Cafés are staying open late. Nobody is sure what for.',
    by: 'Mandovi Courier desk',
    time: '12:00',
    art: 'street',
    cap: 'Shutters half-down on a Panjim street.',
    body: [
      'By noon the streets around the church square were almost empty. Shops that normally stay open until ten pulled their shutters at four.',
      'Cafés that stayed open say they expect their busiest night yet.',
      '“People don’t want to be alone for the last one,” said a manager.',
    ],
  },
];

/** The morning after, by winner. Shown only once the game is over. */
export const EPILOGUE = {
  faithful: {
    id: 'deleted',
    day: 99,
    lead: true,
    outlet: 'wire',
    kicker: 'EXTRA',
    head: 'DEEP BLUE has been deleted from every phone in Goa.',
    dek: 'At 7:00 nothing rang. Investigators are calling it the first quiet morning in six weeks.',
    by: 'Konkan Wire, Panaji',
    time: '07:00',
    art: 'deleted',
    cap: 'The tile is gone. The phones are just phones.',
    body: [
      'At 7:00 this morning, no phone in Panjim rang.',
      'Residents report that the whale icon is gone from every handset where it appeared. Nobody pressed anything. Nobody remembers it leaving.',
      'Officers say they will keep the case open. For today, the city is allowed to sleep late.',
    ],
  },
  killers: {
    id: 'rings-again',
    day: 99,
    lead: true,
    outlet: 'wire',
    kicker: 'EXTRA',
    head: 'DEEP BLUE will ring again tomorrow.',
    dek: 'The app has told every phone: “See you at seven.”',
    by: 'Konkan Wire, Panaji',
    time: '23:59',
    art: 'ring',
    cap: 'A new message, on every phone, just before midnight.',
    body: [
      'Just before midnight, the app put up one more line on every phone that carries it: SEE YOU AT SEVEN.',
      'Officers have no way to stop it. Residents are asked to stay in company, and not to sleep alone.',
      'It will ring again tomorrow.',
    ],
  },
};

/**
 * How the room's own events are printed. `{name}` `{score}` `{day}` are filled
 * in code (src/os/news.js). A pack without `live` falls back to plain wording.
 */
export const LIVE = {
  by: 'The Deep Times, from the room',
  dawn: {
    rig: {
      kicker: 'THE BOARD',
      head: '{name} finishes last. Score: {score}. Rigged?',
      dek: 'The deep takes a name on day {day}.',
      tail: ['Someone in this room may know why that number is so low.'],
    },
    deep: {
      kicker: 'THE BOARD',
      head: 'A firewall blocks a rig. The deep takes {name}.',
      dek: 'Somebody tried to sink a different name on day {day}.',
      tail: ['Someone tried to push another score to the bottom. It did not hold.'],
    },
    saved: {
      kicker: 'THE BOARD',
      head: 'A firewall holds. Nobody taken.',
      dek: 'Someone tried to sink {name} on day {day}.',
      tail: ['Somebody wanted that score gone. Somebody else stopped them.'],
    },
    recruit: {
      kicker: 'THE BOARD',
      head: 'Nobody taken. Someone joined the Killers.',
      dek: 'The board is clean on day {day}. The room is not.',
      tail: ['The deep did not take anyone. Someone said yes to something.'],
    },
    quiet: {
      kicker: 'THE BOARD',
      head: 'Nobody taken this morning.',
      dek: 'The board posted and nobody went under on day {day}.',
      tail: ['Nobody was taken. Check the photos, and look at each other.'],
    },
  },
  banish: {
    killer: {
      kicker: 'THE VOTE',
      head: '{name} logged out: a KILLER.',
      dek: 'The group got it right on day {day}.',
      tail: ['One fewer hand on the admin password.'],
    },
    innocent: {
      kicker: 'THE VOTE',
      head: '{name} logged out: innocent.',
      dek: 'The group got it wrong on day {day}.',
      tail: ['The Killers are still in the room.'],
    },
    none: {
      kicker: 'THE VOTE',
      head: 'The group could not agree. Nobody logged out.',
      dek: 'A split room on day {day}.',
      tail: [],
    },
  },
  endgameTail: 'This was an endgame vote.',
};

/** The crawl under the masthead: each line appears from its `day` on. */
export const TICKER = [
  { day: 0, text: '07:00 · 31° AND HUMID IN PANJIM' },
  { day: 0, text: 'NINE DEAD IN THREE WEEKS · DEEP BLUE' },
  { day: 0, text: 'MANDOVI FERRIES RUNNING TO TIME' },
  { day: 0, text: 'CYBER CELL ASKS RESIDENTS TO STAY IN COMPANY' },
  { day: 1, text: 'TOLL STANDS AT 14' },
  { day: 1, text: 'FERRY CREWS ASK PASSENGERS TO BAG PHONES' },
  { day: 2, text: 'TOLL STANDS AT 23 · KARWAR TO MANGALURU' },
  { day: 2, text: 'BARS SPLIT: SOME SHUT, SOME FULL' },
  { day: 3, text: 'TOLL STANDS AT 31 · FAMILIES DISPUTE SCORES' },
  { day: 3, text: 'PROMENADE VIGIL DOWN TO FORTY' },
  { day: 4, text: 'TOLL STANDS AT 40 · THE APP CANNOT BE DELETED' },
  { day: 4, text: 'SERVER RACK FOUND EMPTY OF OWNERS' },
  { day: 5, text: 'FINAL BOARD · TOLL STANDS AT 52' },
  { day: 5, text: 'SHUTTERS DOWN EARLY ACROSS PANJIM' },
];

export default { outlets: OUTLETS, sections: SECTIONS, articles: ARTICLES, epilogue: EPILOGUE, live: LIVE, ticker: TICKER };
