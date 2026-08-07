import {
  ACCUSATION_CLUES,
  CASE_META,
  EVIDENCE_CLUES,
  HOST_SCRIPT,
  MOTIVE_CLUES,
  REVELATION_CLUES,
} from './gameData';

export const HOST_REFERENCE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'witnesses', label: 'Witnesses' },
  { id: 'deck', label: 'Deck' },
  { id: 'questions', label: 'Questions' },
];

export const HOST_REFERENCE_SUMMARY = {
  title: 'Host Guide',
  strap: 'Everything you need to run the room without leaving the console.',
  event: [
    `Venue: ${CASE_META.venue}`,
    `Date in fiction: ${CASE_META.date}`,
    `Cast: ${CASE_META.playerCount} guests`,
    `Prime suspects: ${CASE_META.primeSuspectCount}`,
    `Killers: ${CASE_META.killerCount}`,
    'Format: 7 rounds, in-app riddle lock for clues, live discussion, repeated voting',
  ],
  principles: [
    'Do not rescue the room from uncertainty too early.',
    'Keep players solving the right shape of problem at the right time.',
    'Use witness nudges only when the room is genuinely stalling.',
  ],
};

export const HOST_SUSPECT_ROSTER = [
  {
    name: 'Sneha Ganesh',
    group: 'THIMBLE',
    lane: 'Monday binder, finance motive, upstairs-booth argument',
    status: 'Killer · mastermind',
  },
  {
    name: 'Tara Singhania',
    group: 'CANVAS',
    lane: 'Customs crate, provenance fraud, apparent bar access',
    status: 'Innocent suspect',
  },
  {
    name: 'Kiyaah Rose Raghuwanshi',
    group: 'ORACLE',
    lane: 'Private-bar ritual, victim-only drink',
    status: 'Killer · delivery',
  },
  {
    name: 'Victoria Vance',
    group: 'FORGERY',
    lane: 'Back-office documents, forged paper trail, inventory logs',
    status: 'Killer · false trail',
  },
  {
    name: 'Roddy Faustus',
    group: 'HEMLOCK',
    lane: 'Botanical case, toxin knowledge, prep-room path',
    status: 'Killer · poison',
  },
  {
    name: 'Oindrilla Chatterjee',
    group: 'AMBER',
    lane: 'Sound-booth access, blackout, QR lane',
    status: 'Killer · systems',
  },
  {
    name: 'Tanvi Vartak',
    group: 'PIXEL',
    lane: 'Sightlines, event choreography, floor plan',
    status: 'Innocent suspect',
  },
  {
    name: 'Rishi Raj Rahul',
    group: 'MYTHOS',
    lane: 'Back-lane rage, buyer pressure',
    status: 'Innocent suspect',
  },
  {
    name: 'Vinod Raghuwanshi',
    group: 'REGENT',
    lane: 'Private meeting, attempted exit',
    status: 'Innocent suspect',
  },
  {
    name: 'Anna Russo',
    group: 'REPLICA',
    lane: 'Display swap, bottle confusion, back-hall movement',
    status: 'Innocent suspect',
  },
];

export const HOST_KILLER_JOBS = [
  {
    job: 'Mastermind',
    name: 'Sneha Ganesh',
    group: 'THIMBLE',
    proof: 'Monday binder, burner thread, upstairs-booth argument',
  },
  {
    job: 'Delivery',
    name: 'Kiyaah Rose Raghuwanshi',
    group: 'ORACLE',
    proof: 'Ritual contract, victim-only drink, fresh mister request',
  },
  {
    job: 'False trail',
    name: 'Victoria Vance',
    group: 'FORGERY',
    proof: 'Forged invoice, shell-ledger trail, hand-washing, envelope',
  },
  {
    job: 'Toxin',
    name: 'Roddy Faustus',
    group: 'HEMLOCK',
    proof: 'Notebook fragment, prep-room handoff path, “dose” language',
  },
  {
    job: 'Blind spot',
    name: 'Oindrilla Chatterjee',
    group: 'AMBER',
    proof: 'Admin override, cloned QR, sound-booth reboot',
  },
];

/**
 * Nothing here is a clue card any more. The 23 motive, evidence and revelation
 * clues used to be three printed stacks the host walked around the room; they
 * are now won in the app through the riddle lock (components/modals/RiddleModal.jsx),
 * and the codes circulate player-to-player. The only paper left is the login
 * cards, which are how a person gets into the app in the first place.
 */
export const HOST_MATERIALS = {
  required: [
    '51 login cards',
    '1 host device logged in and synced',
    'Round 3 and Round 4 case-file unlock buttons checked before guests arrive',
  ],
  helpful: [
    'Printed suspect roster',
    'Printed witness relevance map',
    'Pens or markers for live tally notes',
    'One spare phone logged in as a host backup',
  ],
};

export const HOST_ROUND_GUIDE = {
  pregame: {
    objective: 'Get every player into the app and into the fiction before the room starts free-form theorizing.',
    actions: [
      'Check login issues immediately.',
      'Describe the ASK → code → CODE loop out loud. The button itself does not appear until Round 2, so this is telling, not showing.',
      'Point players toward Identity and Story before any social chaos starts.',
    ],
    emphasize: [
      'Phones are case files, not props.',
      'Clues are won by solving riddles, and every solve produces a code worth sharing.',
      'Players can lie, but they still need to stay inside the room’s logic.',
    ],
    prompts: [
      'Who still has not opened the app?',
      'Who has not read the incident story yet?',
    ],
    watchFor: [
      'Late arrivals',
      'People skipping Story or Incident Report',
      'Tables becoming socially closed too early',
    ],
    advanceWhen: 'Everyone is logged in and the room understands that evidence is earned with ASK and spread with CODE.',
  },
  0: {
    objective: 'Orient the room, then force a bad first vote before certainty exists.',
    actions: [
      'Let the Round 0 briefing play.',
      'Point players to Story, then Evidence → Case files.',
      'Open a quick blind vote and close it before over-discussion sets in.',
    ],
    emphasize: [
      'The venue is sealed.',
      'Armaan’s ritual drink matters.',
      'Ten central invitees anchor the room.',
      'Everyone has a reason to hate him.',
    ],
    prompts: [
      'Who here saw the drink happen?',
      'Who thinks this is about one person and their own group?',
    ],
    watchFor: ['Players skipping the public facts', 'Room locking onto one suspect too fast'],
    advanceWhen: 'People know the victim, venue, collapse time, and have cast a first bad vote.',
  },
  1: {
    objective: 'Make each suspect’s own circle look dirty.',
    actions: [
      'Advance to Round 1 and tell everyone to open their accusation card.',
      'Push verbal sharing rather than silent reading.',
    ],
    emphasize: [
      'Accusations are witness claims, not verdicts.',
      'Players can lie about their accusation.',
      'The room should feel like a suspect might be protected by their own people.',
    ],
    prompts: [
      'Who got something about the bar?',
      'Who got something about paperwork?',
      'Who got something about the blackout?',
    ],
    watchFor: ['One suspect dominating too early'],
    advanceWhen: 'The suspect map feels alive and messy.',
  },
  2: {
    objective: 'Make all 10 prime suspects feel individually dangerous.',
    actions: [
      'Announce that the riddle lock is now live.',
      'Tell the room ASK has just appeared beside CODE, bottom right on Evidence.',
      'Show one table how ASK works so the mechanic spreads by imitation.',
      'Call out anyone sitting on a code they have not read out.',
    ],
    emphasize: [
      'This round is about why someone would want Armaan dead.',
      'Motive alone is not enough.',
    ],
    prompts: [
      'Who had the most to lose on Monday?',
      'Who had something to hide before tonight even started?',
    ],
    watchFor: ['Players collapsing motive directly into guilt'],
    advanceWhen: 'The room has moved from gossip to serious theory.',
  },
  3: {
    objective: 'Break the poisoned-bottle theory and move the room toward one altered drink.',
    actions: [
      'Unlock Round 3 case files.',
      'Tell the room 7 forensic files just entered the riddle pool.',
      'Reopen voting.',
    ],
    emphasize: [
      'The alcohol supply is clean.',
      'The cake is clean.',
      'One drink was altered at the finishing stage.',
      'The blackout is suspicious, but may not be the whole story.',
    ],
    prompts: [
      'If the batch is clean, what touched only Armaan?',
      'If the blackout matters, who benefited from it most?',
    ],
    witnessNudges: ['Ricardo', 'Swati', 'Flora', 'Aarushi', 'Lakshmi', 'Vaidehi', 'Chinmay'],
    advanceWhen: 'Players are seriously discussing the private bar, atomizer, QR access, or admin controls.',
  },
  4: {
    objective: 'Flip the case from one suspect to overlapping interests.',
    actions: [
      'Unlock Round 4 case files.',
      'Tell the room the first 4 revelations are now winnable through ASK.',
    ],
    emphasize: [
      'Armaan had a Monday scapegoat plan.',
      'Some people were being lined up to take the fall.',
      'The story is getting bigger, not narrower.',
    ],
    prompts: [
      'Who was Armaan preparing to sacrifice on Monday?',
      'Which clues feel like independent crimes and which feel like they fit together?',
    ],
    witnessNudges: ['Chryselle', 'Sunali', 'Ajay', 'Meera', 'Nolani'],
    advanceWhen: 'At least one table starts linking suspects across groups instead of inside a single group.',
  },
  5: {
    objective: 'Make the room name a team, not just a mastermind.',
    actions: [
      'Tell the room the last 2 revelations are in the riddle pool.',
      'Keep voting open or reopen it for final locking.',
      'Use the objection sheet if the room presses on physical plausibility.',
    ],
    emphasize: [
      'The burner thread proves coordination, not just suspicion.',
      'Initials are functions before they are names.',
      'The solve is about jobs: poison, ritual, paper, blackout, mastermind.',
    ],
    prompts: [
      'Who had the ritual?',
      'Who had the toxin?',
      'Who had the paper trail?',
      'Who had the blackout?',
      'Who had the reason to make five separate circles stay separate?',
    ],
    witnessNudges: ['Parinitha', 'Aaina', 'Amanda', 'Mahi', 'Anjul', 'Vidya', 'Nanu'],
    advanceWhen: 'The room can articulate a five-part mechanism, even if they are still debating one or two names.',
  },
  6: {
    objective: 'End cleanly, give the room the names, then force them into the reconstruction.',
    actions: [
      'Close voting.',
      'Optionally show the tally.',
      'Trigger the reveal.',
      'Point everyone into How it happened before handling questions.',
    ],
    emphasize: [
      'Read the reconstruction before asking the host to fill gaps.',
      'The names are only the verdict; the reconstruction is the answer.',
    ],
    prompts: ['Read the reconstruction before you ask me questions.'],
    watchFor: ['Players jumping straight to objections without reading the answer page'],
    advanceWhen: 'The room has seen the full reconstruction.',
  },
};

export const HOST_WITNESS_LANES = [
  {
    id: 'method',
    title: 'Method / Atomizer',
    cue: 'Use when the room is still stuck on poisoned bottles or the cake.',
    witnesses: [
      { name: 'Ricardo', clue: 'Heard Kiyaah ask for a fresh orange-oil mister.' },
      { name: 'Swati', clue: 'Saw the polished silver mister appear on the tray.' },
      { name: 'Parinitha', clue: 'Saw Kiyaah swap the atomizers from the bar-side banquette.' },
      { name: 'Aarushi', clue: 'Said the bitter-orange note was not coming from the bottle.' },
      { name: 'Flora', clue: 'Smelled something medicinal under the orange peel.' },
      { name: 'John', clue: 'Heard Kiyaah tell staff one drink was for Armaan only.' },
      { name: 'Aaina', clue: 'Noticed Kiyaah behind the private bar alone too long.' },
      { name: 'Vidya', clue: 'Spotted the orange-oil streak on the bar tray.' },
    ],
  },
  {
    id: 'systems',
    title: 'Blackout / Systems',
    cue: 'Use when the room sees the blackout but cannot connect it to a person.',
    witnesses: [
      { name: 'Lakshmi', clue: 'Saw Oindrilla at the admin screen.' },
      { name: 'Vaidehi', clue: 'Saw the admin override flicker.' },
      { name: 'Nanu', clue: 'Saw Oindrilla with an admin tablet near the booth.' },
      { name: 'Chinmay', clue: 'Heard the service QR beep with no staff member near it.' },
      { name: 'Anjul', clue: 'Saw a staff apron come down the service stair on someone who was not staff — the other end of that QR pass.' },
      { name: 'Dona', clue: 'Was at the mic when the projector glitched.' },
      { name: 'Dinesh', clue: 'Saw the reboot happen from the side console.' },
      { name: 'Mahi', clue: 'Noticed the side lane to the bar stayed open while the main floor turned.' },
      { name: 'Amanda', clue: 'Clocked that the people nearest the bar barely reacted to the blackout.' },
    ],
  },
  {
    id: 'handoff',
    title: 'Poison Handoff / Prep Room',
    cue: 'Use when players know Roddy matters but cannot see how the toxin moved.',
    witnesses: [
      { name: 'Savvy', clue: 'Saw Roddy carrying the case toward the prep-room corridor.' },
      { name: 'Govind', clue: 'Saw Roddy leave the prep-room empty-handed.' },
      { name: 'Keith', clue: 'Saw Roddy return without the case.' },
      { name: 'Valerie', clue: 'Heard Roddy say “dose” in the wrong setting.' },
    ],
  },
  {
    id: 'paper',
    title: 'Paper Trail / Frame Job',
    cue: 'Use when the room is stuck between Tara, Victoria, and Anna.',
    witnesses: [
      { name: 'Ajay', clue: 'Saw Victoria with the envelope.' },
      { name: 'Meera', clue: 'Heard Victoria and Oindrilla whisper “invoice.”' },
      { name: 'Nolani', clue: 'Heard Victoria say “shell account.”' },
      { name: 'Fabiola', clue: 'Heard Tara say the customs seal was already broken before she touched the crate.' },
      { name: 'Khyati', clue: 'Saw Tara’s crate reopened after Armaan said it would stay sealed.' },
      { name: 'Chayne', clue: 'Has footage placing Anna near the gift table during the glitch.' },
    ],
  },
  {
    id: 'mastermind',
    title: 'Mastermind / Monday Binder',
    cue: 'Use when the room understands the method but not the social architecture.',
    witnesses: [
      { name: 'Chryselle', clue: 'Saw Sneha leave the upstairs booth empty handed, folder still on the table.' },
      { name: 'Sunali', clue: 'Heard Sneha ask which upstairs room the red folder had been left in.' },
      { name: 'Natasha', clue: 'Caught Sneha and Kiyaah ending a conversation too quickly.' },
    ],
  },
  {
    id: 'symptoms',
    title: 'Symptoms / Collapse',
    cue: 'Use when the room needs to understand how the method looked in real time.',
    witnesses: [
      { name: 'Shubham', clue: 'Heard “orange, not bottle” near the bar.' },
      { name: 'Fabiola', clue: 'Saw Armaan blink hard before the collapse.' },
      { name: 'Mahi', clue: 'Saw him hold the glass like it had suddenly become heavy.' },
      { name: 'Hima', clue: 'Saw him set the glass down harder than intended.' },
      { name: 'Keith', clue: 'Noticed how fast people started talking poison.' },
      { name: 'Nanu', clue: 'Counted the seconds between first physical failure and collapse.' },
      { name: 'Ashish', clue: 'Mistook it for heart trouble at first.' },
      { name: 'Kristen', clue: 'Read the ritual as too rehearsed to be innocent.' },
    ],
  },
  {
    id: 'red-herrings',
    title: 'Red-Herring Lanes',
    cue: 'Use when you need to keep innocent suspects viable without derailing the solve.',
    witnesses: [
      { name: 'Aayushi', clue: 'Saw Anna at the display cabinet right after the glitch.' },
      { name: 'Esha', clue: 'Heard Tara accuse Armaan of passing fakes as provenance.' },
      { name: 'Meenal', clue: 'Tried to leave with Vinod.' },
      { name: 'Soham', clue: 'Heard Vinod threaten Armaan earlier in the night.' },
      { name: 'Akash', clue: 'Said the loudest argument was not the one by the bar.' },
      { name: 'Sanika', clue: 'Identified the room as staged before anyone used the word.' },
    ],
  },
];

export const HOST_FAST_ANSWERS = [
  {
    question: 'How did Roddy get the poison to Kiyaah?',
    before: 'The prep-room path matters. Track Roddy’s case, Kiyaah’s bar setup, and the mister itself.',
    after:
      'Roddy prepared the poisoned twin atomizer inside his botanical case and moved it through the prep-room as a wrapped service roll. Kiyaah collected that wrapped mister during bar setup before the blackout.',
  },
  {
    question: 'How could Parinitha see the swap if the blackout happened at the same time?',
    before: 'The blackout killed the camera, not every sightline in the room. Check where people were physically placed.',
    after:
      'Parinitha was on the side banquette by the bar arch. That lane stays visible even while the main floor turns toward the frozen screen, so she could see the swap from the side.',
  },
  {
    question: 'Was Tara actually involved because of the back-bar keycard?',
    before: 'Tara is meant to look dangerously close to the bar story. That does not make her part of the conspiracy.',
    after:
      'Witnesses only saw what looked like Armaan’s back-bar keycard on Tara. Victoria’s forged invoice was designed to piggyback on Tara’s legitimate display-world access and frame her as service-adjacent.',
  },
  {
    question: 'The floor plan is in Tanvi’s handwriting. Isn’t she part of it?',
    before: 'The handwriting is real. Ask what the notes were for before asking who they served.',
    after:
      'No. The plan is genuinely Tanvi’s, written for a cake reveal — nobody planted it. Sneha saw it at 7:05 PM while handling the seating rearrangement and set the reboot to the second it predicted. If a table catches that the invoice predates 7:05, reward it: the plan was always “tonight, during the reel.” Tanvi’s notes only told the killers which ninety-four seconds were safe, in an innocent’s handwriting.',
  },
  {
    question: 'Who opened Tara’s crate — and who moved it next to the private bar?',
    before: 'Ask who was entitled enough to unseal a gift early without needing a reason.',
    after:
      'Armaan. He had staff open the gift crate early and stage the private-reserve bottles beside the bar for the Last Light moment — he never intended to honor the seal. That is the broken customs seal, the reopened crate, and the crate ending the night beside the bar, all in one move. Nobody in the conspiracy touched it; the frame borrowed a mess he made himself.',
  },
  {
    question: 'How was the forged invoice entered at 5:14 PM if Victoria arrived later?',
    before: 'The important question is whether the document had to be made on-site at all.',
    after:
      'It did not. The invoice was pushed remotely rather than drafted on the venue terminal. Victoria prepared the forgery off-site and had it inserted into the inventory trail before guest arrival.',
  },
  {
    question: 'Why were Sneha, Victoria, and Oindrilla in the Monday binder, but Roddy and Kiyaah were not?',
    before: 'Armaan only planned scapegoats for the threats he thought mattered to Monday.',
    after:
      'He saw Sneha, Victoria, and Oindrilla as buyout-risk liabilities. He underestimated Roddy as an outsider and assumed he still controlled Kiyaah through the ritual and personal leverage.',
  },
  {
    question: 'Who actually walked through the cloned QR? Kiyaah already worked that bar.',
    before: 'Ask what the QR was for. It is not an access problem — it is a log problem.',
    after:
      'Kiyaah did, over a borrowed service apron. She never needed the pass to get in; she needed the entry log to name a staffer who had already clocked out instead of naming her. Oindrilla revived a retired QR for exactly one pass in and one pass out. Anjul saw the apron come back down the service stair at 10:09 and clocked that the face under it was not staff.',
  },
  {
    question: 'Half the room saw Oindrilla at the console. Why bother with a cloned credential?',
    before: 'Separate what she was seen doing from what the log says was done. Not the same question.',
    after:
      'The log, not the sighting, was the danger. A systems lead rebooting a frozen reel is the most natural picture in the room — cause reads as response. But the same session revived the retired staff QR that logged Kiyaah’s bar entry under a departed staffer’s name, and that session could never carry Oindrilla’s own login. The clone kept her name off the QR; the QR kept Kiyaah’s name off the bar. Same trick, both women: legitimately present, logged as somebody else.',
  },
  {
    question: 'Why did the killers care that the Monday folder stayed upstairs?',
    before: 'Ask what was scheduled to happen to that folder on Monday if Armaan lived.',
    after:
      'Two reasons. Confirmation: the folder still upstairs meant the scapegoat script had not gone to Meridien’s lawyers yet — kill him tonight and the handoff dies with him, which is the burner thread’s first line. Misdirection: found by police, the binder scatters motive across five sets of initials, only three of them killers’. Destroying it would have narrowed the field; leaving it widened it.',
  },
  {
    question: 'How did five circles find each other in two days — and why did nobody warn Armaan?',
    before: 'Ask what Sneha’s actual job was, and what each of the five was holding that week.',
    after:
      'Sneha spent years making Armaan’s thefts look clean in the numbers, so she knew every wound in the room — she had priced each one. The binder named Victoria and Oindrilla as fellow scapegoats; she recruited them with proof. Roddy and Kiyaah were outside the binder, which is why she wanted them — she had packaged their stolen programs into the buyout story herself. Nobody warned him because each recruit held fresh proof he was about to destroy them. Two days sufficed because nothing needed inventing: the formula, ritual, admin path and forging skill already existed. Only an invoice and a label were fabricated.',
  },
  {
    question: 'S.G. could be Sneha Ganesh, Shubham Goyal or Savvy Grover. Which one?',
    before: 'Good catch — say so. Then ask them which S.G. could have written those particular lines.',
    after:
      'Sneha. The roster genuinely holds three S.G.s, and two of them sit inside conspirators\' circles, which is why the initial is worth arguing about. But content settles it: the burner S.G. controls the Monday folder and tells four people there will be no tables and no families, and the binder S.G. is the one carrying the rebate structure. Shubham is a software engineer in Thimble and Savvy is a freelance creative in Forgery — neither is anywhere near a rebate model. Initials narrow the field; the job names the person.',
  },
  {
    question: 'Are the four Raghuwanshis related?',
    before: 'No relationship is established. Treat it as a coincidence of guest lists.',
    after:
      'No. Kiyaah Rose Raghuwanshi, Vinod Raghuwanshi, Meera Victoria Raghuwanshi and Meenal Raghuvanshi share a name and nothing else — no family link exists in the case, and none of the clue deck depends on one. If a table builds a theory on it, let them enjoy it, then point out that the burner thread aligns people by job, not by blood.',
  },
  {
    question: 'Why does the burner thread use initials instead of full names?',
    before: 'That clue is supposed to prove coordination, not end the game by itself.',
    after:
      'The burner thread is evidentiary rather than theatrical. It gives the room roles, intent, and alignment, but still forces players to map initials onto the method and suspect web.',
  },
  {
    question: 'Why can players vote for the full room if only 10 people are prime suspects?',
    before: 'Because the room does not begin with certainty about who matters.',
    after:
      'The 10 prime suspects are where the clue deck concentrates suspicion, but the ballot stays open to the whole room so players can make bad theories before the evidence teaches them to focus.',
  },
  {
    question: 'Who was Roddy talking to when Valerie heard him say “dose”?',
    before: 'Nobody — and that is worth noticing.',
    after:
      'Nobody. Valerie caught him muttering to himself on his way to the prep corridor, running the arithmetic one last time — small enough to hide under the oil, large enough to stop a heart. It is the one unguarded slip he makes all night.',
  },
  {
    question: 'Who said “orange, not bottle” near the bar at 10:04?',
    before: 'Ask who was giving instructions at that bar in that minute.',
    after:
      'Kiyaah, walking staff through the Last Light garnish sequence: the finish comes from the orange mister, not the bottle. To staff it was a service instruction. Set beside the burner thread’s “orange is cleaner than bottle,” it is the method said out loud, dressed as bar craft.',
  },
  {
    question: 'Anna was seen at a display cabinet and at the gift table in the same minute. Which is it?',
    before: 'Check the geography before calling it a contradiction.',
    after:
      'Both — same corner. The display cabinets stand along the record wall directly above the gift table, where the collector bottles Anna handled were shown. Aayushi and Chayne describe one sighting from two angles. What keeps her suspicious is that she was checking a replica while everyone else watched a dead screen.',
  },
];

export const HOST_DECK = {
  accusations: ACCUSATION_CLUES.map((clue) => ({
    code: clue.code,
    target: clue.targetName,
    count: clue.assignedTo.length,
  })),
  motives: MOTIVE_CLUES.map((clue) => ({
    code: clue.code,
    target: clue.targetName,
  })),
  evidence: EVIDENCE_CLUES.map((clue) => ({
    code: clue.code,
    title: clue.title,
  })),
  revelations: REVELATION_CLUES.map((clue) => ({
    code: clue.code,
    title: clue.title,
  })),
  counts: [
    { label: 'Accusations', value: ACCUSATION_CLUES.length },
    { label: 'Motives', value: MOTIVE_CLUES.length },
    { label: 'Evidence', value: EVIDENCE_CLUES.length },
    { label: 'Revelations', value: REVELATION_CLUES.length },
  ],
};

export { HOST_SCRIPT };
