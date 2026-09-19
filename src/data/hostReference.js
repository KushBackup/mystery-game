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
    `Persons of interest: ${CASE_META.primeSuspectCount}`,
    `Killers: ${CASE_META.killerCount}`,
    'Format: 7 rounds, in-app riddle lock, live discussion, repeated voting',
  ],
  principles: [
    'Do not rescue the room from uncertainty too early.',
    'Keep players solving the right shape of problem at the right time.',
    'Use witness nudges only when a useful lane has genuinely stalled.',
  ],
};

export const HOST_SUSPECT_ROSTER = [
  {
    name: 'Jack',
    group: 'LEGAL',
    lane: 'Side letters, forged folder pages, Nilisha frame, front-table panic',
    status: 'Killer · mastermind',
  },
  {
    name: 'Arun',
    group: 'MEDIA',
    lane: 'AV sync, deleted corridor clip, looped reel, admin tablet',
    status: 'Killer · blind spot',
  },
  {
    name: 'Manasi',
    group: 'BAR',
    lane: 'Dropper, shell distributor, yellow hedge, upstairs pour route',
    status: 'Killer · dose',
  },
  {
    name: 'Anushka',
    group: 'FOUNDERS',
    lane: 'Cap-table dilution, founder float, argument by the herb wall',
    status: 'Innocent suspect',
  },
  {
    name: 'Anmoll',
    group: 'FOUNDERS',
    lane: 'Bridge note, launch float, cash-flow panic',
    status: 'Innocent suspect',
  },
  {
    name: 'Nilisha',
    group: 'MARKETING',
    lane: 'Inflated metrics, forged sponsor packet, ready-made frame',
    status: 'Innocent suspect (framed)',
  },
  {
    name: 'Amrusha',
    group: 'HOSPITALITY',
    lane: 'Service flow, tonic hold, staircase access, exclusivity pressure',
    status: 'Innocent suspect',
  },
  {
    name: 'Saima',
    group: 'ENGINEERING',
    lane: 'Guest stack, QR crash, logging shortcut, network fallout',
    status: 'Innocent suspect',
  },
  {
    name: 'Umair',
    group: 'ENGINEERING',
    lane: 'Rounding mask, victim phone, maintenance-window question',
    status: 'Innocent suspect',
  },
  {
    name: 'Sampada',
    group: 'WELLNESS',
    lane: 'Certification gaps, waiver panic, upstairs detour, pantry tears',
    status: 'Innocent suspect',
  },
];

export const HOST_KILLER_JOBS = [
  {
    job: 'Mastermind',
    name: 'Jack',
    group: 'LEGAL',
    proof: 'Hidden carry note, forged Nilisha packet, side-room printer, staged paper panic',
  },
  {
    job: 'Blind spot',
    name: 'Arun',
    group: 'MEDIA',
    proof: '4:46 AV sync, looped reel, deleted corridor clip, admin-tablet audit',
  },
  {
    job: 'Dose',
    name: 'Manasi',
    group: 'BAR',
    proof: 'Yellow-oleander dropper, washed bitters bottle, shell distributor, upstairs route',
  },
];

export const HOST_MATERIALS = {
  required: [
    '26 login cards',
    'Host Panel → Walk-ins checked for late registrations',
    '1 host device logged in and synced',
    'Round 3 and Round 4 case-file unlock buttons checked before players arrive',
    'A decision on round length before you press Start game',
  ],
  helpful: [
    'Printed suspect roster',
    'Printed witness relevance map',
    'Pens for vote tallies and late notes',
    'One spare phone logged in as host backup',
  ],
};

export const HOST_ROUND_GUIDE = {
  pregame: {
    objective: 'Get every player into the app and into the fiction before the room starts inventing answers.',
    actions: [
      'Check login issues immediately. Canonical guests use cards; for a late arrival open the Walk-ins register, issue one registration word and let them register on their own phone.',
      'Explain the ASK -> code -> CODE loop out loud before ASK exists on screen.',
      'Point players toward Identity and Story before any free-form interrogation begins.',
      'Set the round length before you start. Start game arms the round clock at the selected length.',
    ],
    emphasize: [
      'Phones are case files, not props.',
      'Clues are won by solving riddles, then spread by reading codes out loud.',
      'The room wins only if it gets both the team and the method right.',
    ],
    prompts: ['Who still needs a login card?', 'Who has not read the briefing yet?'],
    watchFor: ['Late arrivals', 'Players skipping Story', 'Tables socially sealing too early'],
    advanceWhen: 'Everyone is in, understands ASK and is ready for Start game.',
  },
  0: {
    objective: 'Orient the room, then force a bad first vote before evidence exists.',
    actions: [
      'Let the Round 0 briefing play.',
      'Point players to Story, then Evidence -> Case files.',
      'Let the round clock open the host-configured blind ballot, then read the named tally.',
    ],
    emphasize: [
      'The venue is sealed and nobody left after 5:25.',
      'The black bottle matters as a habit, not yet as a method.',
      'Likely poisoning is public. Delivery path is not.',
      'Ten people cannot be continuously placed in public view when it mattered.',
    ],
    prompts: ['Who last saw Rehan alive?', 'Who thinks the 5:58 crash matters already?'],
    watchFor: ['Room locking too hard onto Anushka or Sampada too early'],
    advanceWhen: 'Players know the venue, the timeline and have cast a first bad vote.',
  },
  1: {
    objective: 'Make all ten suspects feel individually plausible.',
    actions: [
      'Advance to Round 1 and tell everyone to open their accusation card.',
      'Push verbal sharing instead of private reading - the pods are the social engine here.',
    ],
    emphasize: [
      'Accusations are witness claims, not verdicts.',
      'Players can lie about their accusation.',
      'Every suspect should feel dangerous by the end of the round.',
    ],
    prompts: [
      'Who got something about the paper?',
      'Who got something about the crash or the cameras?',
      'Who got something about the bottle, the bar or the upstairs route?',
    ],
    watchFor: ['One suspect absorbing all the oxygen too early'],
    advanceWhen: 'The suspect map feels busy and contradictory.',
  },
  2: {
    objective: 'Turn accusation into motive without letting the room collapse motive into guilt.',
    actions: [
      'Announce that ASK is now live.',
      'Show one table how the solve screen works so the mechanic spreads by imitation.',
      'Call out anyone sitting on a code they have not read out.',
    ],
    emphasize: [
      'Fear is wider than guilt in this case.',
      'Ten people had reasons to dread Rehan. Only some of them solved dread with murder.',
    ],
    prompts: [
      'Whose problem dies if the signing dies?',
      'Who is afraid of paper, and who is afraid of the room hearing paper?',
    ],
    watchFor: ['Players treating motive as a conviction'],
    advanceWhen: 'The room has moved from vibes to real leverage.',
  },
  3: {
    objective: 'Break the shared-drink theory and push the room toward the bottle, the sync and the frame.',
    actions: [
      'Unlock the Round 3 case files.',
      'Tell the room eight evidence clues just entered the riddle pool.',
      'Let the round clock carry the automatic ballot at the end.',
    ],
    emphasize: [
      'The communal tonic was clean. The private bottle was not.',
      'The blind spot was scheduled in advance.',
      'The front-desk crash came from the AV side, not the guest stack.',
      'The Nilisha packet was built before the death, not discovered after it.',
    ],
    prompts: [
      'If the drink batch was clean, what carried the dose?',
      'If the crash was staged, who benefitted from the room scattering?',
      'Who needed the room staring at Nilisha instead?',
    ],
    witnessNudges: ['Kiandra', 'Shivali', 'Pujah', 'Nathan', 'Elton', 'Aashna'],
    advanceWhen: 'At least one table is seriously discussing the bottle, the sync or the frame.',
  },
  4: {
    objective: 'Flip the case from ten names to three roles.',
    actions: [
      'Unlock the Round 4 case files.',
      'Tell the room the first four revelations are now winnable through ASK.',
    ],
    emphasize: [
      'Rehan had already separated criminal lanes from embarrassing ones.',
      'Nilisha is framed, not clean of vanity.',
      'This is now paper, picture and pour - say the roles out loud.',
    ],
    prompts: [
      'Who owns the frame?',
      'Who owns the blind spot?',
      'Who owns the bottle route?',
    ],
    witnessNudges: ['Anshu', 'Balesh', 'Divya', 'Yonella', 'Shivani'],
    advanceWhen: 'The room is linking evidence across roles instead of treating clues as separate scandals.',
  },
  5: {
    objective: 'Make the room name the full team, not just the most visible actor.',
    actions: [
      'Tell the room the last two revelations are in the pool.',
      'Use the final automatic ballot to lock the room into a complete team.',
    ],
    emphasize: [
      'The chat proves coordination, not coincidence.',
      'The beneficiary map closes the money, but the roles close the murder.',
      'If the room only has one or two names, it does not have the case yet.',
    ],
    prompts: [
      'Who had the paper?',
      'Who had the picture?',
      'Who had the pour?',
    ],
    witnessNudges: ['Shivansh', 'Shivangi', 'Saanvi', 'Anjul'],
    advanceWhen: 'The room can say Jack, Arun and Manasi in one breath and defend each lane.',
  },
  6: {
    objective: 'End cleanly, then force the room into the reconstruction before objections.',
    actions: [
      'Let the final automatic tally announce itself.',
      'Trigger the reveal.',
      'Point everyone into How it happened before handling questions.',
    ],
    emphasize: [
      'The names are the verdict. The reconstruction is the answer.',
      'If someone has a logic objection, make them finish the reconstruction first.',
    ],
    prompts: ['Read the reconstruction before you ask me to fill gaps.'],
    watchFor: ['Players jumping straight to objections without reading the answer'],
    advanceWhen: 'The room has read or skimmed the reconstruction.',
  },
};

export const HOST_WITNESS_LANES = [
  {
    id: 'bottle',
    title: 'Bottle / Tea Shelf',
    cue: 'Use when the room understands poison but not the delivery path.',
    witnesses: [
      { name: 'Shivali', clue: 'Saw Rehan rinse and leave the bottle empty at 5:47.' },
      { name: 'Kiandra', clue: 'Sketched the tea shelf and can prove the bottle moved.' },
      { name: 'Pujah', clue: 'Clears the communal tonic batch completely.' },
      { name: 'Saanvi', clue: 'Places Manasi near the upstairs route with the dropper.' },
    ],
  },
  {
    id: 'av',
    title: 'AV / Crash',
    cue: 'Use when the room sees the crash but cannot connect it to a person.',
    witnesses: [
      { name: 'Nathan', clue: 'Saw Arun take the admin tablet back out after setup was complete.' },
      { name: 'Elton', clue: 'Heard the reel loop, twice, instead of glitching.' },
      { name: 'Yonella', clue: 'Owns the run sheet and knows the sync was never planned.' },
      { name: 'Shivani', clue: 'Can explain why the courtyard camera could not recover the service-stair route.' },
    ],
  },
  {
    id: 'paper',
    title: 'Paper / Frame',
    cue: 'Use when the room is stuck between Nilisha and the people pointing at Nilisha.',
    witnesses: [
      { name: 'Anshu', clue: 'Has the 5:17 photo proving the signing folder changed later.' },
      { name: 'Balesh', clue: 'Can identify his own line inside the forged approval email.' },
      { name: 'Divya', clue: 'Heard Rehan say it was three people, not one.' },
    ],
  },
  {
    id: 'garden',
    title: 'Hedge / Dropper / Route',
    cue: 'Use when the room knows the poison is plant-based but cannot see who carried it.',
    witnesses: [
      { name: 'Aashna', clue: 'Saw the fresh snips on the yellow-oleander hedge.' },
      { name: 'Anjul', clue: 'Noticed the service-stair key missing, then wet beside the pantry sink later.' },
      { name: 'Saanvi', clue: 'Saw the dropper in Manasi\'s hand near the upstairs route.' },
    ],
  },
  {
    id: 'clearances',
    title: 'Clearing The Innocent',
    cue: 'Use late, when the room needs help eliminating red herrings.',
    witnesses: [
      { name: 'Shivangi', clue: 'Can partly clear Sampada by explaining the pantry tears.' },
      { name: 'Shivansh', clue: 'Kills the excise-permit story entirely.' },
      { name: 'Pujah', clue: 'Clears any theory built on a poisoned shared batch.' },
      { name: 'Kiandra', clue: 'Makes random bottle-swap theories much harder to sustain.' },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery / First Response',
    cue: 'Use when the room needs the discovery timing or the medical conclusion made concrete.',
    witnesses: [
      { name: 'Nathan', clue: 'Found Rehan at 6:18 without touching the bottle and called for help.' },
      { name: 'Sharon', clue: 'Reached him seconds later and broke the easy heatstroke story.' },
      { name: 'Yonella', clue: 'Sent Nathan upstairs because the welcome line had stalled.' },
    ],
  },
];

export const HOST_FAST_ANSWERS = [
  {
    question: 'How do you poison one person in a room full of drinks?',
    before: 'Ask the room what in Greenr that night belonged only to Rehan.',
    after:
      'The communal tonic and the bar both tested clean. Rehan\'s black bottle did not. He rinsed it himself, left it empty on the upstairs tea shelf at 5:47 and refilled it himself from the pre-filled self-serve decanter at 6:08. The killers never needed the room\'s drink. They needed his habit.',
  },
  {
    question: 'Why did nobody else get sick?',
    before: 'Because the room was not the target. Say that plainly.',
    after:
      'Only the bottle was dosed. Pujah clears the communal batch. The bar logs clear the service route. The washed dropper and the bottle residue do the rest.',
  },
  {
    question: 'Wouldn\'t he taste it?',
    before: 'Ask what hid the bitterness: the room or the bottle?',
    after:
      'Yellow oleander is bitter, which is why the killers used a dropper and a private bottle that Rehan topped up with a strong, salted tonic. "Bitter under bitter" is one of the recovered chat lines for a reason.',
  },
  {
    question: 'Was the 5:58 crash real or staged?',
    before: 'Real as an interruption, staged as a cause.',
    after:
      'The interruption happened. It just came from the AV side, not the guest system. The sync was scheduled at 4:46, blanked the live feeds at 5:58, kept the corridor capture buffering, pulled the guest stack down with it and gave Arun twelve clean minutes. He deleted the buffered clip at 6:09.',
  },
  {
    question: 'Why is Nilisha framed so hard?',
    before: 'Because the best frame is built on a true weakness.',
    after:
      'Nilisha genuinely inflated sponsor and RSVP numbers. Jack drafted the packet the night before, refreshed it with Balesh\'s welcome-board language at 5:22 and fed the room a story it already half-believed.',
  },
  {
    question: 'What did Jack actually do if he never touched the bottle?',
    before: 'Correct the premise: the plan is an action.',
    after:
      'Jack read the corrected diligence pack first, recruited the other two, built the Nilisha frame, staged the paper panic at 5:58 and kept the founders staring at signatures while the murder happened upstairs. Without him there is no room-shape for the other two to hide inside.',
  },
  {
    question: 'Why is Saima innocent if the network crash points at her stack?',
    before: 'Distinguish fallout from trigger.',
    after:
      'Saima\'s system suffered the fallout. The trigger came from the AV tablet. The crash trace is explicit: the reboot started on the AV subnet and dragged the guest stack down second.',
  },
  {
    question: 'How do we know Manasi had the poison, and not just access to the bar?',
    before: 'Tie the hedge, the dropper and the invoice lane together.',
    after:
      'The yellow-oleander hedge was clipped the previous evening, the shears were washed, the rinsed dropper carried the same residue, Saanvi saw Manasi at the pantry service stair and Anjul saw its key disappear and return wet beside the sink. The delivery manifest closes the shell-distributor fraud lane Rehan was about to expose. The bottle route matches the money route.',
  },
  {
    question: 'Why didn\'t the killers just delay the signing?',
    before: 'Because Rehan was already in the corrections, not in a negotiation.',
    after:
      'He was not haggling. He was about to pause the closing and read three criminal lines into the room. Once that happened, the raise froze and the fraud stopped being private. Delay was already over.',
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