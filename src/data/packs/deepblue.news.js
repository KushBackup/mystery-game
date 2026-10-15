/**
 * The News app's world: what the rest of Anjuna is reading while the room plays.
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
 *      one exception is `live.witness`: the engine's true clue about the
 *      night's hand, said as a group, like a clue photo (2026-10-03). The
 *      public only knows what the setting already tells everyone: an app that
 *      rings every morning, a leaderboard, and last place found dead.
 *   2. Every story must be true whatever happens in the room. Stories unlock by
 *      day, never by outcome. The toll rises on a fixed curve: 9, 14, 23, 31, 40, 52.
 *   3. DEEP BLUE is fictional. Never the real challenge's name, never a method,
 *      never a victim under 18, never a how-to. Deaths are "found", cause
 *      "undetermined". Nobody here is a real person: no real quotes, no real
 *      officials, no real outlets. Sources are anonymous.
 *   4. The real venue is never named (16 Oct 2026: Backroom, Anjuna, with
 *      SideQuest Club; before that Greenr, Panjim). The paper speaks of
 *      "Anjuna's bars" in general, and no venue is ever the cause, the
 *      cover-up or the culprit. Keep it that way.
 *   6. One word for a death in the room: "killed" (2026-10-15). The wider
 *      world's dead are "found dead", as before.
 *   5. Read on a phone, standing up, in a loud café: short paragraphs.
 *
 * `art` names a picture: public/news/<art>.webp, drawn in splash-film/news.html
 * and listed in src/os/art/NewsArt.jsx. Each article has its own, named after
 * its id.
 */

export const OUTLETS = {
  wire: { name: 'Konkan Wire', tag: 'WIRE' },
  courier: { name: 'Chapora Courier', tag: 'ANJUNA' },
  dispatch: { name: 'Vagator Dispatch', tag: 'LOCAL' },
  times: { name: 'The Goa Times', tag: 'THE GOA TIMES' },
};

/** Section names, as the segmented control and the lists print them. */
export const SECTIONS = { top: 'Top', room: 'The Room', world: 'Anjuna' };

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
    art: 'nine-dead',
    cap: 'The icon residents describe: a small white whale on a dark blue tile.',
    body: [
      'Nine people have died across Goa in the past three weeks. Investigators now say the cases share one detail: each had an app called DEEP BLUE on their phone, and each came last on its leaderboard the morning before.',
      'The app is in no app store. People who have it say they never installed it. It arrived, with a whale for an icon, and began ringing at 7:00 every morning.',
      'Everyone who has it is told to play a short run. A leaderboard posts when the timer ends. Last place is “killed”. By the next day, that person has been found dead.',
      'There was no sign of a struggle in any of the nine cases. The cause of death is undetermined. A cyber-crime officer, who asked not to be named, said the team has “no way yet to trace where it comes from, or who reads the scores”.',
    ],
  },
  {
    id: 'seven-am',
    day: 0,
    outlet: 'courier',
    kicker: 'ANJUNA',
    head: 'Phones in Anjuna are ringing at 7 a.m. Nobody set the alarm.',
    dek: 'From the flea market to Starco junction, the same blue icon and the same bell.',
    by: 'Chapora Courier desk',
    time: '06:40',
    art: 'seven-am',
    cap: 'It rings at exactly 7:00. Residents say the tone is not one they chose.',
    body: [
      'Ask for a show of hands at any shack near the Anjuna flea market and a few will go up. The same whale. The same bell, at exactly 7:00.',
      '“I turned the phone off,” said a shopkeeper on the Mapusa road, who asked not to be named. “It rang anyway. Then the screen said I had ninety seconds.”',
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
    art: 'stay-together',
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
    head: 'Anjuna stays out tonight. “It’s a night out, not a crime scene.”',
    dek: 'Full houses are expected at Anjuna’s bars despite a day of warnings to stay home.',
    by: 'Chapora Courier desk',
    time: '17:48',
    art: 'greenr-open',
    cap: 'Tables at an Anjuna bar were being laid at half past five.',
    body: [
      'Bars across Anjuna expect full rooms tonight, despite a day of messages urging people to stay indoors.',
      'A manager at one said staff had checked the Wi-Fi, the till system and every device on the premises. “Nothing of ours is putting that app on anyone’s phone,” she said. “People are scared. We would rather they were scared together, with something to eat.”',
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
    art: 'ninety-seconds',
    cap: 'Those who have played describe a small whale and a wall with a gap in it.',
    body: [
      'Those who have played describe a small whale on a dark screen, a wall of obstacles with a gap in it, and a clock. Everyone gets about ninety seconds and as many tries as they can stand. The best run counts.',
      '“It’s the waiting that does it,” said a woman in Siolim who has played eleven mornings and finished last on none. “You watch the board load, and you add up everyone else’s number.”',
      'Then the leaderboard posts, with names the player recognises. The toll across the coast now stands at fourteen.',
      'Nobody who has spoken says they enjoy it. Nobody who has spoken says they have stopped.',
    ],
  },
  {
    id: 'panjim-stops',
    day: 1,
    outlet: 'courier',
    kicker: 'CITY',
    head: 'At 7 a.m. Anjuna stops. Then it looks at the leaderboard.',
    dek: 'Commuters, vendors and a traffic constable, all heads down for ninety seconds.',
    by: 'Chapora Courier desk',
    time: '07:50',
    art: 'panjim-stops',
    cap: 'Near the Anjuna bus stop, a queue stood still.',
    body: [
      'At 7:00 a.m., a queue near the Anjuna bus stop stopped moving. Nobody was boarding. Nobody was talking. Every head was bent over a phone.',
      'A vendor who sells chai from a cart said he has stopped pouring at the hour. “Nobody drinks till the board is up. Then they drink very slowly.”',
      'The village’s other rhythm is unchanged: the sea, the heat, the church bells at the hour. Only the faces are different.',
    ],
  },
  {
    id: 'ferry-crews',
    day: 1,
    outlet: 'dispatch',
    kicker: 'THE RIVER',
    head: 'Chapora ferry crews ask passengers to put phones away.',
    dek: '“The bell goes off mid-river and half the deck stops being a deck.”',
    by: 'Vagator Dispatch',
    time: '09:10',
    art: 'ferry-crews',
    cap: 'The Siolim crossing still runs to time.',
    body: [
      'Deckhands on the Siolim ferry across the Chapora have started asking passengers to put their phones in their bags before the boat leaves the bank.',
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
    art: 'twenty-three',
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
    by: 'Chapora Courier desk',
    time: '13:15',
    art: 'bars-split',
    cap: 'Lights on at dusk in an Anjuna bar.',
    body: [
      'Several Anjuna venues have closed their doors for the week. Others are turning people away.',
      'One bar that has stayed open throughout says its tables are full each evening. “Nobody wants to wait for the morning alone,” a manager said.',
      'Taxi drivers report a rise in late-night fares from the bars to Vagator, and then home before 7:00.',
    ],
  },
  {
    id: 'nobody-wins',
    day: 2,
    outlet: 'times',
    kicker: 'OPINION',
    head: 'Nobody wins DEEP BLUE. That is the point.',
    dek: 'The leaderboard is not a game. It is a way of making you watch each other.',
    by: 'The Goa Times editorial board',
    time: '16:30',
    art: 'nobody-wins',
    cap: 'Look at the person next to you.',
    body: [
      'A leaderboard has one purpose: it makes you look sideways. Who is above you? Who is below you? Who has gone very quiet?',
      'DEEP BLUE asks nothing else of us. It does not need a clever trick. It needs forty people in a room, and a number beside each name.',
      'The sensible response is not to scroll faster. It is to ask why the person at the table beside you is so calm.',
      'We do not know who is reading these scores. We know who is reading each other.',
    ],
  },

  {
    id: 'still-sending',
    day: 2,
    outlet: 'dispatch',
    kicker: 'NIGHT',
    head: 'The phones of the dead are still sending photos.',
    dek: 'Families say messages keep arriving after midnight, from numbers that should be silent.',
    by: 'Vagator Dispatch',
    time: '21:40',
    art: 'still-sending',
    cap: 'A photo from a sister’s number, delivered at 03:12.',
    body: [
      'Her sister’s phone was switched off and put in a drawer. At 03:12, it sent her a photo.',
      'At least six families in Anjuna describe the same thing. The pictures are blurred and taken in the dark: a glass on a table, a pair of shoes by a door, the back of someone’s jacket.',
      '“It’s not a message. It’s a photo of somewhere,” said one, who asked not to be named. “Like she’s showing me what she saw.”',
      'Investigators say the photos were taken the same night they arrived. They cannot say by whom. Some families have started showing them to each other.',
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
    art: 'scores-dispute',
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
    head: 'Vigil on Anjuna beach: “Two hundred on Monday. Tonight, forty.”',
    dek: 'Candles are still lit each evening at the sea wall. The crowd gets smaller.',
    by: 'Vagator Dispatch',
    time: '19:05',
    art: 'vigil',
    cap: 'Candles along the sea wall at dusk.',
    body: [
      'Each evening, residents gather at the sea wall above Anjuna beach to light a candle for the dead. On Monday there were two hundred. Tonight there were forty.',
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
    by: 'Chapora Courier desk',
    time: '08:10',
    art: 'cannot-delete',
    cap: 'A factory reset. The icon was back by seven.',
    body: [
      'Phone shops in Mapusa market say customers are arriving with a request: wipe it, replace it, whatever it takes.',
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
    art: 'empty-servers',
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
    art: 'final-board',
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
    head: 'Anjuna holds its breath for the last board.',
    dek: 'Bars are staying open late. Nobody is sure what for.',
    by: 'Chapora Courier desk',
    time: '12:00',
    art: 'last-call',
    cap: 'Shutters half-down on an Anjuna street.',
    body: [
      'By noon the streets around the church square were almost empty. Shops that normally stay open until ten pulled their shutters at four.',
      'Bars that stayed open say they expect their busiest night yet.',
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
      'At 7:00 this morning, no phone in Anjuna rang.',
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
    art: 'rings-again',
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
  by: 'The Goa Times, from the room',
  dawn: {
    rig: {
      kicker: 'THE BOARD',
      head: '{name} finishes last. Score: {score}.',
      dek: 'DEEP BLUE kills a name on day {day}.',
      tail: ['Someone in this room may know why that number is so low.'],
    },
    deep: {
      kicker: 'THE BOARD',
      head: '{name} is killed.',
      dek: 'Somebody was after a different name on day {day}.',
      tail: ['Whatever was meant for them missed.'],
    },
    saved: {
      kicker: 'THE BOARD',
      head: 'Nobody killed.',
      dek: 'Someone was after {name} on day {day}.',
      tail: ['Somebody wanted that score gone. It stayed.'],
    },
    recruit: {
      kicker: 'THE BOARD',
      head: 'Nobody killed this morning.',
      dek: 'The board is clean on day {day}. The room is not.',
      tail: ['Nobody was killed. Someone said yes to something.'],
    },
    quiet: {
      kicker: 'THE BOARD',
      head: 'Nobody killed this morning.',
      dek: 'The board posted and nobody was killed on day {day}.',
      tail: ['The deep went hungry.'],
    },
  },
  banish: {
    killer: {
      kicker: 'THE VOTE',
      head: 'The room kills {name}: a KILLER.',
      dek: 'The room got it right on day {day}.',
      tail: ['One fewer of them in the room.'],
    },
    innocent: {
      kicker: 'THE VOTE',
      head: 'The room kills {name}: innocent.',
      dek: 'The room got it wrong on day {day}.',
      tail: ['The Killers are still in the room.'],
    },
    none: {
      kicker: 'THE VOTE',
      head: 'Nobody killed in the vote.',
      dek: 'No verdict on day {day}.',
      tail: [],
    },
  },
  endgameTail: 'This was an endgame vote.',
  // The witness box in a morning's story (news.js): one true fact about the
  // night's hand, from the engine (night.js `witness`). The ONE place in this
  // file allowed to describe a guest, and only ever as a group, the way a clue
  // photo does. Unnamed witness, no method, nothing about the victim's body.
  witness: {
    head: 'A witness came forward overnight',
    by: 'Asked not to be named',
    top: {
      dark: '“They were in something dark. Black, navy, maroon, that kind of colour.”',
      pale: '“A pale top. White, cream, something light. It caught the light.”',
      vivid: '“Loud colour, or a print. You couldn’t miss it.”',
      plain: '“One solid colour. No print, no pattern.”',
    },
    glasses: {
      glasses: '“Glasses. The screen flashed in them.”',
      bare: '“No glasses. I saw their eyes in the screen light.”',
    },
    shoes: {
      rubber: '“Rubber soles. I heard them squeak.”',
      leather: '“Hard leather soles. Formal shoes, boots, that kind.”',
      open: '“Their toes were out. Sandals, slides, or heels.”',
      flat: '“Flat shoes. No heel at all.”',
    },
    drink: {
      hops: '“They’d been drinking beer.”',
      grape: '“A glass of wine in their hand.”',
      spirit: '“Something distilled in the glass. Not beer, not wine.”',
      clear: '“A clear drink, or a cocktail.”',
      brewed: '“Beer or wine. Nothing harder.”',
      sober: '“Not drinking. A soft drink, or water.”',
      strong: '“Liquor, neat. No mixer.”',
    },
    season: {
      early: '“They said their birthday is in the first half of the year.”',
      late: '“They said their birthday is in the second half of the year.”',
      cool: '“Birthday in the cool months, they said. October to March.”',
      warm: '“Birthday in the warm months, they said. April to September.”',
    },
    siblings: {
      firstborn: '“They talked about being the first-born.”',
      younger: '“They said they were one of the younger ones at home.”',
      sibling: '“They mentioned a brother or sister.”',
      edge: '“The eldest or the youngest. Never the middle, they said.”',
    },
  },
};

/** The crawl under the masthead: each line appears from its `day` on. */
export const TICKER = [
  { day: 0, text: '07:00 · 31° AND HUMID IN ANJUNA' },
  { day: 0, text: 'NINE DEAD IN THREE WEEKS · DEEP BLUE' },
  { day: 0, text: 'SIOLIM FERRY RUNNING TO TIME' },
  { day: 0, text: 'CYBER CELL ASKS RESIDENTS TO STAY IN COMPANY' },
  { day: 1, text: 'TOLL STANDS AT 14' },
  { day: 1, text: 'FERRY CREWS ASK PASSENGERS TO BAG PHONES' },
  { day: 2, text: 'TOLL STANDS AT 23 · KARWAR TO MANGALURU' },
  { day: 2, text: 'BARS SPLIT: SOME SHUT, SOME FULL' },
  { day: 2, text: 'PHONES OF THE DEAD STILL SENDING PHOTOS' },
  { day: 3, text: 'TOLL STANDS AT 31 · FAMILIES DISPUTE SCORES' },
  { day: 3, text: 'BEACH VIGIL DOWN TO FORTY' },
  { day: 4, text: 'TOLL STANDS AT 40 · THE APP CANNOT BE DELETED' },
  { day: 4, text: 'SERVER RACK FOUND EMPTY OF OWNERS' },
  { day: 5, text: 'FINAL BOARD · TOLL STANDS AT 52' },
  { day: 5, text: 'SHUTTERS DOWN EARLY ACROSS ANJUNA' },
];

export default { outlets: OUTLETS, sections: SECTIONS, articles: ARTICLES, epilogue: EPILOGUE, live: LIVE, ticker: TICKER };
