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
    `Cast: ${CASE_META.playerCount} colleagues`,
    `Persons of interest: ${CASE_META.primeSuspectCount} (12 prime suspects carry the clue decks)`,
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
    name: 'Anurag',
    group: 'PAYMENTS',
    lane: 'Archive-pull notification, pre-ping typing, staged alert, War Room bridge',
    status: 'Killer · mastermind',
  },
  {
    name: 'Yao',
    group: 'ENGINEERING',
    lane: 'Outage, dead footage, nameless admin session, scheduled camera gap',
    status: 'Killer · blind spot',
  },
  {
    name: 'Giles',
    group: 'OPS',
    lane: 'Machine ticket, shared Uber, badge V-07, the HDMI story',
    status: 'Killer · hands',
  },
  {
    name: 'Kalaivani',
    group: 'SUPPORT',
    lane: 'Hedge, flask, skipped watering, GRN second signature',
    status: 'Killer · toxin',
  },
  {
    name: 'Akshat',
    group: 'MARKETING',
    lane: 'Reseller kickback, forged vendor pack, the frame on Victor',
    status: 'Killer · false trail',
  },
  {
    name: 'Victor',
    group: 'MARKETING',
    lane: 'Framed via the vendor pack; phone-booth call; year of bad ROAS',
    status: 'Innocent suspect (framed)',
  },
  {
    name: 'Sukhans',
    group: 'FOUNDERS',
    lane: 'Hired the victim, "witch hunt" argument, alone next to the Glass Room',
    status: 'Innocent suspect',
  },
  {
    name: 'Aarohi',
    group: 'FOUNDERS OFFICE',
    lane: 'Found the body, printed and shredded, laid the Glass Room out at 3:04, knew the real agenda',
    status: 'Innocent suspect',
  },
  {
    name: 'Nehal',
    group: 'MARKETING',
    lane: '"Publish that split" argument, ticketless client escalation',
    status: 'Innocent suspect',
  },
  {
    name: 'Prerna',
    group: 'DESIGN',
    lane: 'Related-party vendor flag, service stairs, montage-file errand',
    status: 'Innocent suspect',
  },
  {
    name: 'Adithya',
    group: 'PRODUCT',
    lane: 'Migration the skim hid under, "missed it or enabled it", first to the alert',
    status: 'Innocent suspect',
  },
  {
    name: 'Luke',
    group: 'SUPPORT',
    lane: 'Comps-ledger fight, two gate runs with one register entry',
    status: 'Innocent suspect',
  },
];

export const HOST_KILLER_JOBS = [
  {
    job: 'Mastermind',
    name: 'Anurag',
    group: 'PAYMENTS',
    proof: 'Archive-pull notification, pre-ping typing (two witnesses), sandbox webhook replay, group chat',
  },
  {
    job: 'Toxin',
    name: 'Kalaivani',
    group: 'SUPPORT',
    proof: 'Hedge cuts, flask, skipped watering, shared Uber, torn pruning-log page',
  },
  {
    job: 'Hands',
    name: 'Giles',
    group: 'OPS',
    proof: 'Ticket #4417 from his phone, badge V-07 lift rides, the 2:52 blank shot, the HDMI that was upstairs all along',
  },
  {
    job: 'Blind spot',
    name: 'Yao',
    group: 'ENGINEERING',
    proof: 'NVR reinit, deleted draft, 11:31 scheduled camera gap, re-armed badge — one nameless session, one keyholder',
  },
  {
    job: 'False trail',
    name: 'Akshat',
    group: 'MARKETING',
    proof: 'Vendor pack created Wed 11:58 PM, template requested that afternoon, dead-server message-IDs, desk lamps at 11:45 PM',
  },
];

/**
 * Nothing here is a clue card any more. The 26 motive, evidence and revelation
 * clues are won in the app through the riddle lock (components/modals/RiddleModal.jsx),
 * and the codes circulate player-to-player. The only paper left is the login
 * cards, which are how a person gets into the app in the first place.
 */
export const HOST_MATERIALS = {
  required: [
    '69 login cards',
    '1 host device logged in and synced',
    'Round 3 and Round 4 case-file unlock buttons checked before players arrive',
    'A decision on whether rounds are timed — the round clock is off until you start it',
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
      'If you are running to the clock, say so once — then start it as you announce each round. The default is 30 minutes and the room sees it under the round number.',
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
      'People skipping Story or the Incident Report',
      'Teams becoming socially closed too early',
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
      'The building is sealed — nobody left after 1 PM.',
      'The coffee machine getting fixed that morning matters.',
      '“Query poisoning” is the paramedic’s phrase, not yet a finding.',
      'Thirty-four people cannot be placed on the terrace during the window.',
    ],
    prompts: [
      'Who actually saw Dev leave the party?',
      'Who thinks this is about the person nearest the Glass Room?',
    ],
    watchFor: ['Players skipping the public facts', 'Room locking onto Sukhans or Aarohi too fast'],
    advanceWhen: 'People know the victim, the building, the times, and have cast a first bad vote.',
  },
  1: {
    objective: 'Make each prime suspect look individually plausible.',
    actions: [
      'Advance to Round 1 and tell everyone to open their accusation card.',
      'Push verbal sharing rather than silent reading — most pods share their card with five other people.',
    ],
    emphasize: [
      'Accusations are witness claims, not verdicts.',
      'Players can lie about their accusation.',
      'Twelve prime suspects, and every one of them has a defensible reading.',
    ],
    prompts: [
      'Who got something about the coffee machine?',
      'Who got something about paperwork?',
      'Who got something about the cameras or the alert?',
    ],
    watchFor: ['One suspect dominating too early'],
    advanceWhen: 'The suspect map feels alive and messy.',
  },
  2: {
    objective: 'Make all 12 prime suspects feel individually dangerous.',
    actions: [
      'Announce that the riddle lock is now live.',
      'Tell the room ASK has just appeared beside CODE, bottom right on Evidence.',
      'Show one table how ASK works so the mechanic spreads by imitation.',
      'Call out anyone sitting on a code they have not read out.',
    ],
    emphasize: [
      'This round is about why someone would want Dev dead — or his report dead.',
      'Motive alone is not enough. Twelve people wanted that briefing cancelled.',
    ],
    prompts: [
      'Whose career did Friday’s meeting end?',
      'Who knew what the 4 PM “toast” really was?',
    ],
    watchFor: ['Players collapsing motive directly into guilt'],
    advanceWhen: 'The room has moved from gossip to serious theory.',
  },
  3: {
    objective: 'Break the heart-attack and catering theories, and quietly move the room off the 3:12–3:55 window.',
    actions: [
      'Unlock Round 3 case files.',
      'Tell the room 8 forensic files just entered the riddle pool.',
      'Reopen voting.',
    ],
    emphasize: [
      'The food was clean. The machine was clean. The tumbler was not.',
      'The tumbler was dosed while empty — before 3:15.',
      'The camera gap was scheduled at 11:31 AM. The alert never existed on the provider’s side.',
      'The machine was never broken — its valve was shut by hand.',
    ],
    prompts: [
      'If the dose was waiting in the cup, when did it actually get there?',
      'Who needed the machine to work today, of all days?',
      'Who benefits from a camera gap that was booked in the morning?',
    ],
    witnessNudges: ['Shivam', 'Chirag', 'Rishabh', 'Utkarsh', 'Raaghav', 'Riya', 'Harsha', 'Nikitha'],
    advanceWhen: 'Players are seriously discussing the 2:52 brew, the badge, the ticket, or the hedge.',
  },
  4: {
    objective: 'Flip the case from one suspect to overlapping roles.',
    actions: [
      'Unlock Round 4 case files.',
      'Tell the room the first 4 revelations are now winnable through ASK.',
    ],
    emphasize: [
      'Dev was not auditing a process — he was three days from reading names.',
      'His draft survived him, and it names roles: HoP, TL, OE, CS-O, MB.',
      'The draft explicitly clears the man the vendor file points at.',
      'The story is getting bigger, not narrower.',
    ],
    prompts: [
      'Map the initials: which jobs in this office are HoP, TL, OE, CS-O, MB?',
      'Which clues feel like separate crimes, and which feel like one machine?',
    ],
    witnessNudges: ['Jason', 'Kursheeth', 'Tushar', 'Mohit A.', 'Pranav A.', 'Vadini', 'Mohit P.'],
    advanceWhen: 'At least one table starts linking suspects across departments instead of inside one team.',
  },
  5: {
    objective: 'Make the room name a team, not just a mastermind.',
    actions: [
      'Tell the room the last 2 revelations are in the riddle pool.',
      'Keep voting open or reopen it for final locking.',
      'Use the objection sheet if the room presses on physical plausibility.',
    ],
    emphasize: [
      'The group chat proves coordination, not just suspicion.',
      'Roles before names: the plan, the toxin, the hands, the blind spot, the false trail.',
      'The archive was always going to survive. The killers only ever bought silence, not safety.',
    ],
    prompts: [
      'Who had the toxin?',
      'Who had the machine?',
      'Who had the cameras and the badge?',
      'Who had the paperwork?',
      'Who knew on Tuesday what Friday meant?',
    ],
    witnessNudges: ['Sagrika', 'Neha', 'Akshay', 'Ishika', 'Karthik', 'Caleb', 'Pragati'],
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
    id: 'machine',
    title: 'Machine / Tumbler',
    cue: 'Use when the room is still stuck on the catering, the sugar, or a heart attack.',
    witnesses: [
      { name: 'Shivam', clue: 'Kept the "days since the machine worked" counter; two of his tickets and two of Dev\'s died unanswered before the urgent one.' },
      { name: 'Chirag', clue: 'Posted "THE BEAST LIVES" at 9:41 — the repair has a public timestamp.' },
      { name: 'Vidisha', clue: 'Heard the grinder test and smelled the floor turn into a cafe.' },
      { name: 'Rishabh', clue: 'Heard the machine hiss at 2:52 — the unclaimed brew.' },
      { name: 'Utkarsh', clue: 'Half-saw a man at the nook at 2:52 holding a steel tumbler.' },
      { name: 'Aksharaa', clue: 'Read ticket #4417 before anyone else and can name who raised it — the answer to "which Operations Executive?"' },
      { name: 'Raaghav', clue: 'Heard the pull finish as the lift doors opened at 2:53, and saw nobody near the machine.' },
      { name: 'Thejas', clue: 'Heard the 3:15 grinder from forty feet and never looked up.' },
      { name: 'Shashwat', clue: 'Saw Dev "reading" through the glass at 3:31 — the last sighting.' },
    ],
  },
  {
    id: 'systems',
    title: 'Cameras / Systems',
    cue: 'Use when the room sees the camera gap but cannot connect it to a person.',
    witnesses: [
      { name: 'Shrey', clue: 'Offered to help at the network cupboard and was refused through a six-inch gap — timestamped in his own chat message.' },
      { name: 'Priyanshu', clue: 'Offered the old founder-era admin password; was told it was handled. The nameless session used that lineage.' },
      { name: 'Mohit P.', clue: 'Asked whether the morning footage survived; got "corrupted in the failover" without eye contact.' },
      { name: 'Tauseef', clue: 'Helped segment the network — routers do not take the NVR down on this network. Said so. Was told "known issue."' },
      { name: 'Navalika', clue: 'Her pipelines log exactly when the badge system stopped being trustworthy.' },
      { name: 'Vadini', clue: 'Accidentally screenshotted the 11:31 admin page mid-cast-fail — the moment the camera gap was booked.' },
    ],
  },
  {
    id: 'garden',
    title: 'Hedge / Flask / Mornings',
    cue: 'Use when players know the poison is oleander but cannot see who harvested it.',
    witnesses: [
      { name: 'Riya', clue: 'The watering was skipped Friday — and the cans were already filled from Thursday.' },
      { name: 'Harsha', clue: 'Thursday 8:52 AM b-roll shows the hedge freshly cut, the cut faces still bright.' },
      { name: 'Tushar', clue: 'Saw the gardening kit returned to the store on Thursday evening — washed, dripping, at the wrong time of day.' },
      { name: 'Jason', clue: 'Saw two colleagues leave one Uber at 8:37, not talking.' },
      { name: 'Kursheeth', clue: 'Saw the same two walk in together at 8:41 — the second witness to the shared ride.' },
      { name: 'Nikitha', clue: 'The chai flask under the beverage table never opened all afternoon; "for later." It still held the rest of the concentrate.' },
      { name: 'Navya', clue: 'Saw Kashish and Kalaivani enter the first-floor store minutes apart during the window.' },
    ],
  },
  {
    id: 'paper',
    title: 'Vendor / Forgery',
    cue: 'Use when the room is stuck between Victor and the "scam vendor" story.',
    witnesses: [
      { name: 'Karthik', clue: 'Heard the May argument: "let it die, it\'s a scam vendor, stop pulling the thread."' },
      { name: 'Pranav A.', clue: 'Was asked on Wednesday for "any old vendor invoice PDF, just as a template" — and the email vanished from his sent folder.' },
      { name: 'Caleb', clue: 'Was asked, casually, whether template files keep edit history.' },
      { name: 'Mohit A.', clue: 'Left at 11:45 PM Wednesday; two desk lamps still on — the forgery is timestamped 11:58 PM.' },
      { name: 'Pragati', clue: 'Saw the Zenlyt folder open on Akshat\'s screen on Wednesday night.' },
      { name: 'Ishika', clue: 'Watched Akshat not flinch at the 2:47 alert while scrolling the vendor drive.' },
      { name: 'Daiwik', clue: 'Kept all three drafts of the May recap — the "scam vendor" story was rewritten in real time.' },
      { name: 'Neha', clue: 'Wrote the May email from talking points supplied by ops, and kept the talking points.' },
    ],
  },
  {
    id: 'alert',
    title: 'The 2:47 Alert / The Plan',
    cue: 'Use when the room understands the method but not who orchestrated the afternoon.',
    witnesses: [
      { name: 'Sagrika', clue: 'Watched Anurag type, send, set the phone face-down — and then react to the ping like news.' },
      { name: 'Neha', clue: 'Saw the same moment from the other side of the table.' },
      { name: 'Akshay', clue: 'Checked the provider status page in the War Room: green the whole time. Said nothing.' },
      { name: 'Raksha', clue: 'Watched Adithya start moving before the alert finished buzzing — useful either way.' },
    ],
  },
  {
    id: 'clearances',
    title: 'Clearing The Innocent',
    cue: 'Use late, when the room needs to eliminate prime suspects and cannot.',
    witnesses: [
      { name: 'Ishan', clue: 'Could see Sukhans pacing his cabin from 3:00 to 3:22 — the only stretch he was off the terrace at all.' },
      { name: 'Himanshu', clue: 'Heard the full Wednesday quote — it ends with Elias saying "then we burn."' },
      { name: 'Bhuvan', clue: 'Saw Victor\'s silhouette in the phone booth from 2:50 — occupied, lit, covered glass.' },
      { name: 'Anusha', clue: 'Heard both halves of the Luke–Dev fight, including Dev\'s quiet reply.' },
      { name: 'Sonia', clue: 'Checked: no ticket for Nehal\'s escalation — he told her it was on WhatsApp and asked her to keep it between them.' },
      { name: 'Binil', clue: 'Watched Luke\'s second gate run from the terrace rail; the register page had turned.' },
      { name: 'Vidisha', clue: 'Brackets Aarohi\'s print and shred — and points out nobody can prove it was the same page.' },
      { name: 'Amisha', clue: 'Ordered the good samosas for nine on Dev\'s instruction — the meeting was real, and so was Aarohi\'s errand.' },
      { name: 'Vipin', clue: 'Prerna came into the second-floor bay at 2:58 for the source file — the corroboration she never thought to ask for.' },
      { name: 'Simran', clue: 'Sent Dev her half of the contractor list the same day he asked — the honest half of HR.' },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery / Aftermath',
    cue: 'Use to re-anchor the room in the physical facts of the finding.',
    witnesses: [
      { name: 'Elias', clue: 'The last words: "save me some payasam," 3:12, on the livestream\'s audio.' },
      { name: 'Yash T.', clue: 'The HDMI was in his backpack on the terrace since 8:30 — Giles\'s errand never existed.' },
      { name: 'Kursheeth', clue: 'Eleven minutes of CPR; "query poisoning" was his phrase first.' },
      { name: 'Aman', clue: 'The livestream, 2:30–3:50 — the alibi machine for half the room.' },
      { name: 'Shobhit', clue: 'Slo-mo of the games catches the War Room window in the background.' },
    ],
  },
];

export const HOST_FAST_ANSWERS = [
  {
    question: 'How did poison get into a tumbler Dev rinsed himself?',
    before: 'The rinse is the point. Ask when the tumbler was last unattended.',
    after:
      'Dev rinsed and staged it at 1:05 PM and went up to the party. It sat empty and unattended by the machine for nearly two hours. Giles dosed it at 2:52, inside the camera gap. The 3:15 coffee dissolved the film. Dev\'s own hands did everything else.',
  },
  {
    question: 'Could someone else have drunk it? The killers risked another victim.',
    before: 'Ask the room whose tumbler it was, and what happened to people who touched it.',
    after:
      'No. The dose was in Dev\'s personal engraved tumbler, not the machine — the tank and sachets tested clean. Nobody in the building touched the DM tumbler; that was office law. The machine\'s other users drink from their own cups. The plan\'s safety margin was Dev\'s own territoriality.',
  },
  {
    question: 'Why didn\'t he taste it?',
    before: 'Ask what the Beast\'s coffee is famous for, and what Dev added to it.',
    after:
      'Oleandrin is bitter — hidden under the most over-extracted coffee in Indiranagar, plus two sugars, on a floor that permanently smells of burnt coffee. The office joke about the machine is the murder\'s cover: "punishment with crema" was already the expected taste.',
  },
  {
    question: 'Kalaivani served payasam in front of forty people all afternoon. How is she guilty?',
    before: 'Separate the afternoon from the mornings. Her work was finished by 8:37 AM.',
    after:
      'Her whole contribution predates the party: hedge clipped Wednesday night, concentrate brewed at home Wednesday and Thursday evenings, Giles\'s share decanted into a bottle in the 8:37 shared Uber — the flask kept the remainder, which is why it spent the party unopened. Her spotless afternoon is by design. She is convicted by the skipped watering, the filled cans, the fresh cuts on Harsha\'s Thursday footage, the washed secateurs Tushar saw returned, the torn pruning-log page, and a ride the Uber dashboard cannot forget.',
  },
  {
    question: 'If Kalaivani\'s flask sat under the beverage table all afternoon, how did Giles have the poison?',
    before: 'Two different objects. Ask what she poured off, and what she kept.',
    after:
      'She brewed more than one dose. In the 8:37 Uber she decanted Giles\'s share into a small bottle; the flask kept the remainder and came to the party with her. That is why "for later" was true when she told Nikitha, and why she could not let anyone empty it — at 2:30 PM that flask was still evidence. The bottle is the handoff, the flask is the leftover, and a table that spots the difference has found the sharpest fact in her file.',
  },
  {
    question: 'Yao was visibly in the War Room the entire window. How did he do anything?',
    before: 'Ask when his actions happened, not where he was at 3 PM.',
    after:
      'Everything Yao did was done — and scheduled — in the morning, under the 11 AM outage: the NVR reinit that killed the footage, the draft deletion at 11:23, the camera gap booked at 11:31 for 2:45, the badge re-armed at 11:36. The case against him is a calendar, not a sighting. Being helpful in the War Room was the plan working.',
  },
  {
    question: 'What did Anurag actually do? He never touched anything.',
    before: 'Correct — and that is the finding, not a hole. The plan is the fingerprint.',
    after:
      'He read the Tuesday pull notification, assembled the five, and fired the 2:47 sandbox replay from inside the network — the fake incident that scattered the party and manufactured thirty-four window gaps. Sagrika and Neha both watched him type before the ping. Akshay saw the provider page stay green. The chat\'s first line — "he pulled the settlement archive himself. friday he reads names. mine is first" — is HoP.',
  },
  {
    question: 'Why did Giles bother with badge V-07? Ops walks to floor three all day.',
    before: 'It is not an access problem. It is a log problem.',
    after:
      'Exactly — he had every right to be there, which is why he needed the record not to say so. The service lift log during a camera gap is the only movement evidence that survives; V-07 makes it name a visitor who left on Tuesday. Same trick as the cameras: legitimately present, logged as somebody else.',
  },
  {
    question: 'When did Giles even get hold of badge V-07?',
    before: 'Ask who had a reason to stand over the visitor tray that morning.',
    after:
      '9:41 AM, at ground-floor reception, signing the coffee-machine technician in and drawing him a badge from the same tray. It is the one moment all day that Giles at the visitor tray looks like his job — and it is why he is not sprinting four floors down and three back up between leaving the party at 2:50 and dosing the tumbler at 2:52.',
  },
  {
    question: 'Why did Giles claim the HDMI when it was on the terrace all along?',
    before: 'Reward whoever catches this — it is the conspiracy\'s one genuine mistake.',
    after:
      'Improvisation. He needed a floor-3-shaped errand when the alert hit and grabbed the most ops-natural one. He did not know Yash T. had packed the spare HDMI into the AV bag at 8:30. Every plan has one bad ad-lib; this is theirs, and it is what first breaks his story.',
  },
  {
    question: 'Only Friday morning burned. Why not just watch Wednesday night\'s footage?',
    before: 'Read the camera log again — how much did the NVR actually lose?',
    after:
      'All of it. The NVR held fourteen days and the 11:04 reinitialization took the whole array, not a date range. That is why the hedge cutting, the secateurs going back into the store and the two desk lamps at 11:58 PM all rest on colleagues\' memories rather than video. Had it lost only Friday, the case closes before Round 1.',
  },
  {
    question: 'Why not steal or wipe Dev\'s laptop too?',
    before: 'Ask what they could reach. The Drive was reachable. The laptop was not.',
    after:
      'The laptop was password-locked and physically with Dev or in the locked Glass Room all day — and after 3:55 the room was a sealed crime scene. Yao deleted what admin rights could reach: the Drive copy. They also believed the archive pull was a one-time read. The provider simply re-issued it to the police.',
  },
  {
    question: 'How could Anurag fake a payment alert? Engineers checked it.',
    before: 'Ask what the alert actually was, not what it looked like.',
    after:
      'It was a byte-identical replay of a sandbox test webhook — a tool-assisted echo of a fake incident the integration environment already contained, fired from inside the office network. It looked exactly like the real alerts because the real alerts were the template. The tell: the provider\'s status page stayed green, and the provider has no record of any failure.',
  },
  {
    question: 'Was Sukhans\'s investor call real?',
    before: 'Yes. Let the room try to break it first.',
    after:
      'Real and verifiable three ways: the calendar entry predates the murder week, the investor confirms the call, and Ishan could see him pacing through the cabin glass for the whole call — 3:00 to 3:22, which is the only part of the window he was not on the terrace in front of forty people. The "witch hunt" quote also has a second half only Himanshu heard: Elias answered "then we burn" — and Sukhans stayed on board. He wanted the report survivable, not dead.',
  },
  {
    question: 'What did Aarohi shred?',
    before: 'Ask what she printed, and on whose instruction.',
    after:
      'A typo\'d draft of the 4 PM agenda — "AGNEDA" — printed at 12:40 and shredded at 3:45 on Dev\'s own lunchtime instruction after he corrected the file. The corrected version is on his laptop; the shredded page was partially reconstructed. She also knew the meeting\'s real nature and told nobody — discretion, doing its worst possible job for her.',
  },
  {
    question: 'Why is Aarohi a suspect at all? She never left the terrace.',
    before: 'She did, once. Ask what the Glass Room looked like at four o\'clock.',
    after:
      'At 3:04 she went down alone to lay the Glass Room out for the four o\'clock and came straight back up. Dev was still on the terrace, the room was empty, and nobody saw her either way — which is exactly why the incident report cannot place her on the terrace for the whole window. Innocent diligence, and the only reason she is on the list.',
  },
  {
    question: 'Aarohi was at the third-floor shredder at 3:45. How did she not see a body?',
    before: 'Ask which half of that glass wall is frosted, and how high a desk is.',
    after:
      'Shashwat\'s 3:31 sighting was through the clear upper half at seated height — Dev was still at the table. By 3:40 he had tried to stand, knocked the tumbler and gone down on the floor behind the frosted lower half, the one part of that wall nobody can see through. From the shredder, and from Vidisha\'s desk, a quiet room with the door shut on a party afternoon is not worth a second look. Aarohi sees him at 3:55 because she opens the door.',
  },
  {
    question: 'Why was Prerna on the service stairs?',
    before: 'Ask where the lift was during the incident.',
    after:
      'Held at the second floor by the War Room traffic. She fetched the montage source file — the access log shows the 2:57 file open — and took the only route that did not mean waiting. In sandals. It looked furtive and was merely impatient. Vipin and Aarush were both in that bay and both saw her — neither volunteers it, because their own account of the hour is "rendering" a reel that finished at 2:20, and she never thinks to ask.',
  },
  {
    question: 'Nehal\'s escalation has no ticket. Is he lying?',
    before: 'Not about that. Ask what channel the client used.',
    after:
      'The escalation was real but arrived on WhatsApp, client to Nehal directly — screenshots verify it. His actual secret is worse for his pride and irrelevant to the murder: his organic numbers were partly inflated by the paid-side skim, which is what "the split" would have exposed.',
  },
  {
    question: 'Why is Luke\'s second gate run missing from the register?',
    before: 'It is not missing. Ask who turned the page.',
    after:
      'The guard turned to a fresh register page at 3 PM; the 3:20 courier entry is at the top of the next page and was found during Round 4. Binil also watched the run from the terrace rail. Both of Luke\'s trips are real, logged, and innocent — one Zomato order, one VIP courier.',
  },
  {
    question: 'Which Operations Executive? Three people hold that title.',
    before: 'Correct, and well spotted. The initials give a shortlist, not a name.',
    after:
      'Giles, Aksharaa and Akshay are all Operations Executives, and Kalaivani, Sonia, Riya and Nikitha could all answer to Customer Support & Ops. The initials are meant to stop there. Each chat line\'s fingerprint closes it: the OE line is about the coffee-machine ticket, so the OE is whoever raised #4417 — and Aksharaa read that ticket before anyone else and can name him. Hand the room Aksharaa, never the name.',
  },
  {
    question: 'How is toxicology, handwriting and phone forensics all back the same evening?',
    before: 'Read the letterheads — half of it says PRELIMINARY.',
    after:
      'It is a field screen on a fast first night, and the game is the evening of the murder. The compression is the format, not the fiction. Say so cheerfully: a room arguing about lab turnaround has stopped arguing about the murder, which is the only real cost.',
  },
  {
    question: 'The two Yashes, two Pranavs and two Mohits — is that a trick?',
    before: 'No. Say so plainly if a table is building a theory on it.',
    after:
      'The duplicate first names are a real fact of the roster, and no clue depends on confusing them. Files disambiguate as Yash S. / Yash T., Pranav D. / Pranav A., Mohit A. / Mohit P. The draft\'s initials are role initials — HoP, TL, OE, CS-O, MB — not name initials, which is the distinction that matters.',
  },
  {
    question: 'Why did nobody warn Dev?',
    before: 'Ask who knew enough to warn him, and what they all had in common.',
    after:
      'Everyone innocent believed he was a payments consultant — the founders\' own cover story. Everyone who knew what he really was appears in his draft. The document that made him dangerous also vetted his killers: each of the five could verify the other four were named. There was nobody in the middle.',
  },
  {
    question: 'Whose initials are in the chat, and how should the room map them?',
    before: 'Roles before names. Make them say the jobs out loud first.',
    after:
      'HoP = Head of Payments (Anurag), TL = Technical Lead (Yao), OE = Operations Executive (Giles), CS-O = Customer Support & Ops (Kalaivani), MB = Media Buyer (Akshat). The chat proves coordination; the draft defines the roles; the timelines attach the people. That three-step mapping is the intended endgame.',
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
