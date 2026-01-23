// --- GAME DATA (Based on 1-Story-Script.md) ---

export const ROUNDS = [
  { id: 0, title: "Pre-Game", desc: "Arrivals & Mingling" },
  { id: 1, title: "The Apology", desc: "Backstories & Grudges" },
  { id: 2, title: "The Incident", desc: "Timelines & Alibis" },
  { id: 3, title: "Forensics", desc: "Toxicology & Physical Evidence" },
  { id: 4, title: "Interrogations", desc: "Motives & Confessions" },
  { id: 5, title: "The Bombshell", desc: "Deep Secrets Revealed" },
  { id: 6, title: "The Reveal", desc: "Case Closed" }
];

export const CHARACTERS = [
  {
    id: 'char_vikram',
    name: "Vikram Singh",
    role: "MURDERER",
    profession: "Personal Assistant",
    bio: "Taher's shadow for 8 years. You organized this entire party. You know every detail, every drink preference.",
    quirk: "Obsessively organized.",
    secret: "You have a gambling debt Taher exploited. You prepared the poison ice weeks ago.",
    code: "ASSISTANT_V",
    timeline: "6:00 PM - Setup. 6:50 PM - Kitchen (Ice). 8:05 PM - Bar (Serving)."
  },
  {
    id: 'char_anish',
    name: "Anish Shirwant",
    role: "SUSPECT",
    profession: "Industrialist",
    bio: "Childhood friend of Taher. Successful, analytical, and driven.",
    quirk: "Can predict horror movie plots accurately.",
    secret: "Guilt-eats junk food. Taher stole your school science project idea that made him famous.",
    code: "ANISH_S",
    timeline: "6:50 PM - Arrival. 7:15 PM - Parking Lot shots. 8:05 PM - Witnessed fall."
  },
  {
    id: 'char_anubhav',
    name: "Anubhav Raina",
    role: "SUSPECT",
    profession: "Self-Employed",
    bio: "Former business partner. Curious, talkative, a deep thinker.",
    quirk: "Talented woodworker.",
    secret: "Murder (It's a joke answer to 'Never Do', but looks suspicious).",
    code: "ANUBHAV_R",
    timeline: "7:00 PM - Main Bar. 8:00 PM - Helping fallen guest. 8:20 PM - Near body."
  },
  {
    id: 'char_ishank',
    name: "Ishank Mahale",
    role: "SUSPECT",
    profession: "Digital Marketing",
    bio: "Tech-savvy and introverted. Keeps to himself but sees everything.",
    quirk: "Can mimic Venom's voice perfectly.",
    secret: "Intercepted flight signals. Taher spread rumors about your mental health.",
    code: "ISHANK_M",
    timeline: "7:10 PM - Setup hidden cam. 7:45 PM - Bathroom break. 8:15 PM - Texting."
  },
  {
    id: 'char_esha',
    name: "Esha",
    role: "SUSPECT",
    profession: "Design Scientist",
    bio: "Brilliant and mathematical. Sees patterns others miss.",
    quirk: "Forensic pattern analysis hobby.",
    secret: "Knows the organizers. Taher stole credit for your $500k design project.",
    code: "ESHA_D",
    timeline: "7:30 PM - Talking to Anish. 8:00 PM - Observing the bar."
  },
  {
    id: 'char_ajay',
    name: "Ajay Jain",
    role: "SUSPECT",
    profession: "Product Manager",
    bio: "True crime enthusiast. Strategist. Plans before he panics.",
    quirk: "Collects swords.",
    secret: "Taher plagiarized your MBA essay to get an internship.",
    code: "AJAY_J",
    timeline: "7:00 PM - Bar. 7:45 PM - Patio. 8:10 PM - Taking notes."
  },
  {
    id: 'char_tanishka',
    name: "Tanishka Sheokand",
    role: "SUSPECT",
    profession: "Fashion Designer",
    bio: "Extrovert and spontaneous. People feel safe telling you secrets.",
    quirk: "Natural secret-keeper.",
    secret: "Planning to leave Goa. Taher gaslit you during a past relationship.",
    code: "TANISHKA_S",
    timeline: "7:20 PM - Greeting Priya. 8:00 PM - Crying in bathroom."
  },
  {
    id: 'char_andrew',
    name: "Andrew Pereira",
    role: "SUSPECT",
    profession: "Journalist",
    bio: "Principled and investigative. Still seeking the truth.",
    quirk: "Surprisingly good dancer.",
    secret: "Identifies as Tintin. Taher's lawyers bankrupted your publication.",
    code: "ANDREW_P",
    timeline: "6:55 PM - Interviewing staff. 8:20 PM - First to call 911."
  },
  {
    id: 'char_bharath',
    name: "Bharath Raj",
    role: "SUSPECT",
    profession: "Student",
    bio: "Witty but private. Stubborn when it counts.",
    quirk: "Excellent boat handling.",
    secret: "Taher's real estate deal ruined your father's fishing business.",
    code: "BHARATH_R",
    timeline: "7:00 PM - Balcony. 8:00 PM - Bar."
  },
  {
    id: 'char_anika',
    name: "Anika",
    role: "SUSPECT",
    profession: "Life Coach / Singer",
    bio: "Confident, fun, and goofy. Turned weakness into strength.",
    quirk: "Great singer (Taher mocked it).",
    secret: "Became a coach by accident. Taher mocked your voice for years.",
    code: "ANIKA_L",
    timeline: "7:15 PM - Karaoke machine. 8:05 PM - Applauding speech."
  },
  {
    id: 'char_priya',
    name: "Priya (Wife)",
    role: "INNOCENT",
    profession: "Socialite",
    bio: "Taher's supportive wife. Unaware of his dark past.",
    quirk: "Always perfectly dressed.",
    secret: "You drank from the same glass as Taher but survived.",
    code: "PRIYA_W",
    timeline: "8:00 PM - Beside Taher. 8:10 PM - Sipped drink. 8:19 PM - Screaming."
  }
];

export const CLUE_DB = [
  // Round 1
  {
    id: 'c1',
    code: "BULLY001",
    title: "Taher's History",
    content: "Taher was a serial bully for 25 years. He targeted anyone different. Every person here has a story of being hurt by him.",
    roundReq: 1,
    type: "BACKSTORY"
  },
  {
    id: 'c2',
    code: "APOLOGY002",
    title: "The Sudden Change",
    content: "Three months ago, Taher changed. He invited everyone he'd wronged. Was it genuine? Or a final power play?",
    roundReq: 1,
    type: "BACKSTORY"
  },
  // Round 2
  {
    id: 'c3',
    code: "TIMELINE001",
    title: "Official Timelines",
    content: "Timelines unlocked for all guests. Check the Dossier tab to see where everyone was at 8:00 PM.",
    roundReq: 2,
    type: "TIMELINE"
  },
  {
    id: 'c4',
    code: "PHONECALL004",
    title: "The Angry Call",
    content: "7:45 PM: Taher was heard shouting on the phone. 'The deal is off if he doesn't sign!' Who was he talking to?",
    roundReq: 2,
    type: "CLUE"
  },
  {
    id: 'c4b',
    code: "ASSISTANT005",
    title: "The Assistant's Role",
    content: "Taher's assistant coordinated every detail. He was in and out of the kitchen all night.",
    roundReq: 2,
    type: "CLUE"
  },
  // Round 3
  {
    id: 'c5',
    code: "POISON001",
    title: "Toxicology Report",
    content: "Slow-acting synthetic toxin. NO residue on glass rim. NO residue on bottle. Conclusion: Introduced via something melting in the drink.",
    roundReq: 3,
    type: "FORENSICS"
  },
  {
    id: 'c6',
    code: "ICECUBES006",
    title: "Ice Preference",
    content: "Taher insisted on small ice cubes. They melt faster. He specifically requested them for his drink.",
    roundReq: 3,
    type: "CLUE"
  },
  {
    id: 'c7',
    code: "WIFE007",
    title: "The Survivor",
    content: "Priya took a sip from Taher's glass immediately after pouring. She survived. Why? Because the ice hadn't melted yet.",
    roundReq: 3,
    type: "REVELATION"
  },
  {
    id: 'c7b',
    code: "CCTVKITCHEN008",
    title: "Kitchen CCTV",
    content: "Footage shows the assistant placing a bag labeled 'Premium Ice' in the freezer at 6:50 PM.",
    roundReq: 3,
    type: "CCTV"
  },
  // Round 4
  {
    id: 'c8',
    code: "MOTIVE001",
    title: "Motive Analysis",
    content: "Everyone had a motive. But Opportunity matters more. Who had access to the kitchen before 8:00 PM?",
    roundReq: 4,
    type: "INTERROGATION"
  },
  {
    id: 'c8b',
    code: "OPPORTUNITY002",
    title: "Who Had Access?",
    content: "The poison ice was in the kitchen since 6:50 PM. Only bar staff and the assistant had authorized access.",
    roundReq: 4,
    type: "CLUE"
  },
  // Round 5
  {
    id: 'c9',
    code: "BOMBSHELL001",
    title: "The Assistant's Debt",
    content: "Vikram had a massive gambling debt. Taher bought it and used it to control him. Vikram was trapped.",
    roundReq: 5,
    type: "BOMBSHELL"
  },
  {
    id: 'c10',
    code: "COOLER001",
    title: "The Cooler",
    content: "Traces of poison found in Vikram's personal cooler. He brought the poisoned ice from home.",
    roundReq: 5,
    type: "EVIDENCE"
  }
];

export const CASE_FILES = [
  {
    id: 'f1',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: 'Jan 2026',
    content: "Victim: Taher Merchant (38). Cause of death: Poisoning. Incident occurred at 'For the Record' bar during a private event. All guests detainded.",
    stamped: true
  },
  {
    id: 'f2',
    type: 'IMAGE',
    title: 'CCTV: BAR',
    caption: "8:05 PM: Taher pours drinks. No one touches his glass. He adds ice from a specific bucket.",
    sketchType: 'CCTV_BAR'
  },
  {
    id: 'f3',
    type: 'IMAGE',
    title: 'CCTV: KITCHEN',
    caption: "6:50 PM: Assistant places a bag labeled 'Premium Ice' in the freezer.",
    sketchType: 'CCTV_KITCHEN'
  }
];
