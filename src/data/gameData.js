// --- GAME DATA: THE NIKHIL MURDER MYSTERY (TripleSpeed Edition) ---

export const ROUNDS = [
  { id: 0, title: "The Incident", desc: "Read the report & profiles" },
  { id: 1, title: "Accusations", desc: "What did you see?" },
  { id: 2, title: "Motives", desc: "Who had reason to kill?" },
  { id: 3, title: "Evidence", desc: "Forensics & Documents" },
  { id: 4, title: "Revelations", desc: "The Twist" },
  { id: 5, title: "Finale", desc: "Final Discussion" },
  { id: 6, title: "The Reveal", desc: "Case Closed" }
];

// ============================================
// CHARACTERS (32 total)
// ============================================
// Role types: "MURDERER", "SUSPECT", "WITNESS"
// isSuspect: true for the 10 main suspects (incl. murderer)

export const CHARACTERS = [
  // === THE VICTIM (not playable, for reference) ===
  // Nikhil - deceased. Head of Marketing at TripleSpeed.

  // === THE MURDERER ===
  {
    id: 'char_alam',
    name: "Alam",
    role: "MURDERER",
    profession: "Head of HR — 'A court poet'",
    bio: "A court poet. Steals good people from other companies because he is the HR. Says he just makes sure paperwork doesn't bite.",
    quirk: "Has an unsettling talent for writing numbers especially if they're smaller — particularly when negotiating salaries with new hires. Claims he's also a part-time crane driver. Nobody at TripleSpeed has ever asked a follow-up question about that.",
    secret: "I'm a part-time crane driver. (And: I helped Nikhil cook the metrics. And: I helped Nikhil die. And: I'm walking out of this Penthouse tonight either way.)",
    neverDo: "Eating human flesh.",
    isSuspect: true,
    motive: "On record: 'Nikhil bullied my juniors and undermined HR decisions for two years and the founders kept telling me to manage him. I was sick of cleaning up after him.' Off the record: he and Nikhil cooked the Velocity dashboard's metrics together. SEBI was about to land. Suicide voids the insurance, natural death drags the case through Nikhil's estate, but a clean murder closes the case and pays out. Alam ran the math with Nikhil. Then he ran the play.",
    timeline: "5:30 PM - Arrived alone to 'help with HR-prep.' 5:30-5:55 PM - Alone in the Penthouse. Swapped Nikhil's vape cartridge. 6:00 PM onwards - Played host. 8:30 PM - Phone in airplane mode. 8:45 PM - First to Nikhil. Took charge. Stayed composed.",
    code: "ALAM_HR"
  },

  // === THE 9 OTHER SUSPECTS ===
  {
    id: 'char_elias',
    name: "Elias Bothell",
    role: "SUSPECT",
    profession: "Co-Founder, Marketing",
    bio: "Big American Ginger. Loud. The marketing-side co-founder. Nikhil reported into him. His name is on every campaign Nikhil ever signed.",
    quirk: "Plays the keyboard but can't (claims to be 'non chalant about it'). Also: 'cant have people finding out I am white shhh, i dont think they noticed lol.' Eats fried chicken when nobody's watching.",
    secret: "Sometimes I eat fried chicken.",
    neverDo: "Attack a dog or a cat for no reason.",
    isSuspect: true,
    motive: "If SEBI's investigation breaks and Nikhil's metric fraud surfaces, Elias is the next named individual after Nikhil. Founder culpability. Personal liability. The company, the green card, the entire story he's built about himself — all on a knife's edge. Slack DMs to Nikhil dated 18, 20, and 22 May read 'kill the campaign,' 'kill it,' and 'I swear to god.'",
    timeline: "Co-host all evening. ~7:50 PM - Pulled Nikhil into the spare bedroom for a tense private argument. 8:00 PM - On stage with Sukhans. 8:20-8:40 PM - Hit the bar hard. Was messaging an attorney during the same window.",
    code: "ELIAS_M"
  },
  {
    id: 'char_sukhans',
    name: "Sukhans Asrani",
    role: "SUSPECT",
    profession: "Co-Founder — 'Bandit'",
    bio: "Quiet, narcissistic, delusional. The money-and-deals co-founder. Brought Westland Capital to the Series B table. Owns the financial model that Nikhil's metrics fed.",
    quirk: "Can flip his eyelids inside out (will do it on request, will do it without request). Claims never to eat carbs. Owns a Penthouse that has, at any given time, half the office's wallets and full apartment access logged via Bluetooth.",
    secret: "Biryani is my favorite food. (Yes, despite the carbs thing.)",
    neverDo: "Eat carbs.",
    isSuspect: true,
    motive: "A meaningful seven-figure-USD chunk of his net worth is contingent on the Series B closing on the announced terms. If Nikhil's fraud surfaces before the round closes Friday, the term sheet evaporates, the existing investors mark the company down, and Sukhans is poorer by several houses. He told someone in a Slack DM dated May 19: 'I have a personal incentive that the leak gets handled.'",
    timeline: "On stage with Elias at 8:00 PM. 8:00-8:08 PM - Alone in the kitchen for ~8 unaccounted minutes; catering staff said he was 'supervising' but they didn't need supervising. Owns the Penthouse — unrestricted access to every room.",
    code: "SUKH_F"
  },
  {
    id: 'char_priyanshu',
    name: "Priyanshu",
    role: "SUSPECT",
    profession: "Vibe coding",
    bio: "Quiet, patient, dangerous. The third Penthouse roommate. Has watched Nikhil sleep on the spare-room mattress dozens of times. Watched Nikhil and Alam have whispered conversations in the kitchen at 2 AM. Doesn't speak much. Sees everything.",
    quirk: "Hidden talent: sleep. Will nap through anything. Was reportedly 'napping' during the 5:30-5:55 PM window when Alam was alone in the apartment, which makes him either the only witness to whatever Alam did, or unverifiable. Convenient either way.",
    secret: "I don't have a life. (Read: I have spent two years quietly watching every single thing that happens in this apartment.)",
    neverDo: "Murder someone.",
    isSuspect: true,
    motive: "Two weeks before the party, Priyanshu walked in on Nikhil and Alam arguing in the spare bedroom. Whatever he overheard was enough that Nikhil pulled him aside afterward and said: 'If you ever say a word about anything you've ever seen at this Penthouse, I'll have HR put you on a PIP and make sure no one hires you again. Try me.' Priyanshu didn't react. Priyanshu rarely reacts. Priyanshu went back to coding.",
    timeline: "Was at the Penthouse all day. Allegedly napping during the prep window. Awake the entire night of the party. Signed every catering invoice. Took out the trash twice. Knew which of the seven near-identical vapes on the coffee table belonged to which guest.",
    code: "PRIY_C"
  },
  {
    id: 'char_yash_s',
    name: "Yash Shindey",
    role: "SUSPECT",
    profession: "Crime-scene photographer",
    bio: "Observant, Composed, Unsettling. Photographs crime scenes for private investigators and insurance firms — murders, suicides, disappearances, accidents. Most people look away from death. His job is to make sure nothing gets missed.",
    quirk: "Keeps one object from every investigation he works on. Says it 'helps me remember that every crime scene belonged to a real person before it became evidence.' Has a working knowledge of toxin pharmacokinetics from past insurance-fraud cases involving poisonings. Has a contact saved as 'Pune Lab' in his phone.",
    secret: "A few years ago I photographed a murder scene before the police arrived. While I was documenting the room, I noticed something everyone else had missed — proof that the person arrested couldn't have done it. I kept quiet. The wrong person went to prison… and I still have the photograph.",
    neverDo: "Tamper with a crime scene.",
    isSuspect: true,
    motive: "Six months ago, Nikhil — drunk at an offsite — got Yash talking. Yash, also drunk, told him about the photograph. Nikhil sobered up immediately, made him repeat it, made him describe the photo. Then Nikhil started 'asking favors.' Off-the-books photography work. Discreet personal investigations. Always with the implicit *I know what you didn't tell anyone.* Yash's career, freedom, and self-image all depended on a single photo staying in his bottom drawer. Nikhil knew that, and was using it. Yash stopped sleeping somewhere around February. Nikhil's death erases the only person who can connect him to that photograph.",
    timeline: "7:25 PM - Arrived. Brought a camera to a Series B announcement, which is weird. 8:00-8:45 PM - Watched Nikhil all night with that face he makes. 8:45 PM - Photographed the body before the paramedics arrived. 'Professional habit, sorry.'",
    code: "YASHS_P"
  },
  {
    id: 'char_pranav',
    name: "Pranav Ahlawat",
    role: "SUSPECT",
    profession: "Self-styled 'PI from Los Alamos' (also: TripleSpeed content/strategy)",
    bio: "Ruminator, Visionary, Pathfinder. 'I am a private investigator from Los Alamos, who does drugs for a living and takes cases to get high and solve them to feel happy.' Yes, that's a direct quote.",
    quirk: "Tends to see the punchline before the joke is told. Claims it's 'either a gift from the universe or a side effect of the various substances keeping me upright.' Asks weird forensic questions at parties. Has a folder of surveillance photos of Nikhil dating back to early March.",
    secret: "I was in the desert one night and saw a bright light descending from heaven. The light gliding on the cold desert sand. A few close calls and then it engulfed me. After that I needed drugs to stabilize my mind and go look for answers. One dream after another, one day after another, one drug after another, one light after another — and yet, no answers. Also: SEBI may or may not be paying me to ask questions.",
    neverDo: "Stay sober.",
    isSuspect: true,
    motive: "Two angles. (1) Someone — Pranav won't say who — paid him in early March to 'look into the Velocity numbers.' He's been quietly tailing Nikhil for two months. He has a folder. (2) Nikhil noticed the tail in the second week of May and confronted him: 'I know what you're doing. I have HR friends. You'll never work in tech again.' Either could push a person.",
    timeline: "7:50 PM - Arrived in a suit, which he never wears. Asked a video editor 'what's the half-life of azide in vape juice, hypothetically.' For a podcast, he said. 8:00-8:45 PM - Floated weirdly. Was photographed three days earlier in Nikhil's apartment-complex parking lot.",
    code: "PRAN_PI"
  },
  {
    id: 'char_vadini',
    name: "Vadini",
    role: "SUSPECT",
    profession: "SEO ('vibe chats with openclaw')",
    bio: "Niche, funny, chalant. Runs the team that powers TripleSpeed's organic-traffic numbers. Her numbers were the raw input that Nikhil laundered into the Velocity dashboard.",
    quirk: "Can make good hairstyles but pays 500rs for a hairwash sometimes okay. Posts Kill Bill GIFs in the marketing channel at 9 AM on the morning of major office events. Has been telling her manager since November that the numbers Nikhil was reporting upstairs *were not the numbers she was reporting upstairs.* Nobody listened.",
    secret: "Stole red bulls from the office fridge. (Alam had a written warning in her HR file dated April. It would have been used against her.)",
    neverDo: "Kill myself, ain't giving the mfs satisfaction.",
    isSuspect: true,
    motive: "Three months ago she went to Alam (HR) about the metric discrepancies. Alam — who was in on the fraud — politely brushed her off. Two weeks before the party, Nikhil ran into her at the office coffee machine: 'I know about the Red Bulls. I know about a few other things. If anyone's name lands on the wrong piece of paper, it's gonna be yours. Be smart.' She stopped sleeping that day. Her texts to a friend the night of May 22 read: 'i can't let him do this to me.'",
    timeline: "9:14 AM - Posted a Kill Bill GIF in the marketing channel. 7:05 PM - One of the earliest arrivers. 7:30-8:30 PM - Hovered near the coffee table where the vapes were piled. Phone records show 11 outgoing calls to Nikhil over the four days before the party — none returned.",
    code: "VADI_S"
  },
  {
    id: 'char_ishika',
    name: "Ishika Goel",
    role: "SUSPECT",
    profession: "Email Marketing Specialist",
    bio: "Yapper, Rapper. Talks very fast. Crazy. Direct report under marketing — runs every email campaign that goes out from TripleSpeed.",
    quirk: "Listens and grooves to all possible Bollywood songs. Can guess any Bollywood song in 3 seconds. (What hasn't been demonstrated is what else she can do in three seconds.) Has been quietly collecting drafts and headers as evidence to defend herself with — for the case she figured out is coming.",
    secret: "Have eaten lizard's eggs. Also: there's a draft in my drafts folder I swear I didn't write.",
    neverDo: "Date anyone in the office.",
    isSuspect: true,
    motive: "Some of TripleSpeed's email campaigns to clients contained the inflated metrics SEBI is investigating. The campaigns were sent from her account. Drafted in her drafts folder. Timestamped during her active hours. Nikhil had been preparing — for months — to make her the one whose name was on every fraudulent send. The fall girl. She figured it out about five days before the party. She had four days to decide what to do about it.",
    timeline: "7:20 PM - Arrived. 7:55 PM - Logged into her email from the kitchen, on her phone. 'Just checking a thing.' 8:00-8:45 PM - Visibly twitchy. Talked even faster than usual.",
    code: "ISHI_E"
  },
  {
    id: 'char_neha',
    name: "Neha Mittal",
    role: "SUSPECT",
    profession: "Creative Strategist",
    bio: "Sunshine, talkative, sensitive. Wrote the press copy and external-facing communications that wrapped the Velocity dashboard's fake metrics in a marketing story. Did not know, at the time, that the underlying numbers were doctored.",
    quirk: "Actually writes. Books. Novels. Romantasy. Her unpublished manuscript, recovered from her laptop, contains a poisoning subplot — and the substance she names is 'a rare azide compound.' Coincidence, allegedly, but the kind of coincidence that gets you charged.",
    secret: "I can actually kill someone. (Was, by her own later account to friends, 'not really a joke.')",
    neverDo: "Let anyone feel left out. Or like they don't belong anywhere.",
    isSuspect: true,
    motive: "Two layers. Public: at the December offsite, Nikhil — drunk and showing off in front of the founders — read aloud a passage from her unpublished Romantasy manuscript that someone had emailed him. He did the voices. He made the room laugh. She has not written a word of fiction since. Private: once she realized the metrics were fake, she also realized the press copy *she* wrote was the most public artifact of the fraud. Her name is on the bylines. Her quotes are in the deck. The investigation will read every word she ever wrote for him and ask whether she knew. She had four days, between figuring it out and the party, to decide what to do.",
    timeline: "6:50 PM - One of the early arrivers, into the kitchen. 8:00-9:00 PM - Stayed in the kitchen most of the night, 'helping the catering team.' Catering staff said she didn't help with anything in particular. Was alone with the food and drinks for stretches.",
    code: "NEHA_S"
  },
  {
    id: 'char_mohit',
    name: "Mohit Aasirwal",
    role: "SUSPECT",
    profession: "Software / 'I write shit code which works sometimes'",
    bio: "Curious, Calm and Delusional. Built and maintained the analytics pipeline that fed the Velocity dashboard. Wrote every SQL query whose output got reframed in marketing's deck. Was the technical author of the very system Nikhil used to cook the books. Did not, on his own account, know what the numbers were going to be used for.",
    quirk: "Metal. Hardcore Metal. Deathcore Metal. Metal. Metal. Metal. Megadeth's *Murder One* was on loop in his car the morning of the party. His Slack search history shows him asking ChatGPT about 'poison detection thresholds in modern toxicology' three days before the party. 'Research for a song.'",
    secret: "I'm a narcissist with impostor syndrome. (Will, in a courtroom, become a prosecution exhibit.)",
    neverDo: "Substances.",
    isSuspect: true,
    motive: "His commits show a 'test mode' backdoor in the analytics pipeline — a feature Nikhil had asked for 'for QA reasons' — that was never disabled in production. SEBI's forensic accountants would find it within a week. Mohit would be the named technical co-author of the fraud. Career over. Possible prosecution. He figured this out the second week of May. He stopped showing up to the office gym shortly after.",
    timeline: "7:30 PM - Arrived. 8:10-8:22 PM - Disappeared from the party for 12 minutes. Said he was 'having a panic attack on the balcony.' Was not on the balcony, per multiple witnesses. Was somewhere.",
    code: "MOHIT_C"
  },

  // === THE 22 WITNESSES ===
  {
    id: 'char_ashish',
    name: "Ashish Patel",
    role: "WITNESS",
    profession: "Video Editor",
    bio: "Fueled by Art. Edits videos for TripleSpeed's content + marketing.",
    quirk: "Does nail art on himself between renders. Genuinely good at it.",
    secret: "Bi-sexual. (And mildly territorial about Final Cut shortcuts.)",
    neverDo: "Autopsy.",
    isSuspect: false,
    motive: "Nikhil killed three of his hero-cut concepts in a row, then showed the same ideas in a Series A pitch as his own.",
    timeline: "7:15 PM - Arrived. 8:00-8:45 PM - Drinking slowly. Watching everything with editor's eyes.",
    code: "ASHI_V"
  },
  {
    id: 'char_sonia',
    name: "Sonia",
    role: "WITNESS",
    profession: "TripleSpeed (role unclear)",
    bio: "Loud, funny, emotional. 'Even I don't know, but somehow I always get paid on the 23rd of every month.'",
    quirk: "Writes poems. Sometimes sings. Neither activity is announced in advance.",
    secret: "I was on the Epstein Island once.",
    neverDo: "Cheat on anyone.",
    isSuspect: false,
    motive: "Some kind of payroll dispute that resulted in her being mysteriously paid on the 23rd of every month, against TripleSpeed's standard cycle. She blames Nikhil.",
    timeline: "7:10 PM - Arrived loud. 8:00-8:45 PM - Hugged everyone twice.",
    code: "SONI_O"
  },
  {
    id: 'char_prakarsh',
    name: "Prakarsh Singh",
    role: "WITNESS",
    profession: "Software Dev",
    bio: "Stupid hopeless romantic. Loves raging at a screen.",
    quirk: "Will rage at any screen. Phone, laptop, kitchen TV with a cricket score on it.",
    secret: "Never been not single.",
    neverDo: "Kill someone.",
    isSuspect: false,
    motive: "Nikhil mocked his code reviews in a public Slack channel multiple times.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Raging quietly at a screen, somewhere.",
    code: "PRAK_D"
  },
  {
    id: 'char_mihir',
    name: "Mihir Yadav",
    role: "WITNESS",
    profession: "Coder",
    bio: "I am Mihir. Writes code. Throws a perfect right hand.",
    quirk: "Throwing a perfect right hand.",
    secret: "I'm Batman.",
    neverDo: "Smoke cigs or weed.",
    isSuspect: false,
    motive: "Nikhil once challenged him to a fistfight at a Diwali party, then backed out.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Doing the Batman bit, as always.",
    code: "MIHIR_C"
  },
  {
    id: 'char_og_yash',
    name: "OG Yash",
    role: "WITNESS",
    profession: "Developer",
    bio: "Greedy, Lazy, Boring. Reads a lot of useless things.",
    quirk: "Will tell you about Roman aqueducts unprompted.",
    secret: "I keep secrets, secrets.",
    neverDo: "Cheat on a partner.",
    isSuspect: false,
    motive: "Nikhil once leaked his salary to the wrong person, costing him a negotiation.",
    timeline: "7:25 PM - Arrived. 8:00-8:45 PM - Reading something useless on his phone in the corner.",
    code: "YASH_D"
  },
  {
    id: 'char_amisha',
    name: "Amisha",
    role: "WITNESS",
    profession: "Office Manager",
    bio: "Bro I make sure that this office functions without any issues. Has hand-organized every TripleSpeed offsite. Knows the building's facilities team by first name.",
    quirk: "Can sense which printer is jamming from across the floor.",
    secret: "Ordered the wrong samosas on purpose once. Just once.",
    neverDo: "Approve unfilled expense forms.",
    isSuspect: false,
    motive: "Nikhil habitually ignored her catering preferences and then complained about the catering.",
    timeline: "5:45 PM - In and out of the kitchen all evening. Saw Neha hanging around. Saw Sukhans's 'kitchen visit.' Saw most things. Will deny it.",
    code: "AMI_O"
  },
  {
    id: 'char_arush',
    name: "Arush",
    role: "WITNESS",
    profession: "TripleSpeed",
    bio: "Bruh most of the time I am just in a cab as a passenger stuck in Bangalore traffic.",
    quirk: "Knows every shortcut between Indiranagar and HSR by heart.",
    secret: "Has, on at least three occasions, paid the driver to take a longer route to avoid a meeting.",
    neverDo: "Take an early-morning flight again.",
    isSuspect: false,
    motive: "Nikhil rejected three reimbursement claims from him on technicalities.",
    timeline: "8:10 PM - Arrived, blaming traffic. Missed the speech.",
    code: "ARUSH_T"
  },
  {
    id: 'char_adi',
    name: "Adi",
    role: "WITNESS",
    profession: "TripleSpeed (remote)",
    bio: "I chill in Bali. Nominally TripleSpeed but spends more time in Canggu than Indiranagar.",
    quirk: "Wearing a linen shirt at all times, including this party.",
    secret: "His 'remote setup' is a beach.",
    neverDo: "Move back.",
    isSuspect: false,
    motive: "Nikhil tried to revoke his remote-work arrangement.",
    timeline: "7:35 PM - Arrived. 8:00-8:45 PM - Looking out of place but unbothered.",
    code: "ADI_B"
  },
  {
    id: 'char_anusha_w',
    name: "Anusha",
    role: "WITNESS",
    profession: "Ops",
    bio: "Runs a thousand silent things in the background. The reason every offsite actually works.",
    quirk: "Has every vendor's WhatsApp pinned.",
    secret: "Knows exactly how much each colleague's Diwali bonus was. Will not tell.",
    neverDo: "Use the phrase 'circle back.'",
    isSuspect: false,
    motive: "Nikhil pushed back her promotion twice with vague feedback.",
    timeline: "6:45 PM - Arrived early to help. 8:00-8:45 PM - Helping the caterers, making sure the speech setup actually worked.",
    code: "ANU_O"
  },
  {
    id: 'char_prerna',
    name: "Prerna",
    role: "WITNESS",
    profession: "Designer",
    bio: "I make designs that slap. Will rebrand your dog if you ask nicely.",
    quirk: "Subtly judges every restaurant's menu typography.",
    secret: "Has a folder of pitch decks she made better in her free time. Will not show.",
    neverDo: "Use Comic Sans, ironically or otherwise.",
    isSuspect: false,
    motive: "Nikhil once asked her to 'make it pop' thirty-seven times in a single review.",
    timeline: "7:20 PM - Arrived. 8:00-8:45 PM - Subtly judging the lighting.",
    code: "PRER_D"
  },
  {
    id: 'char_vidi',
    name: "Vidi",
    role: "WITNESS",
    profession: "Designer",
    bio: "Designer. Quiet. Excellent.",
    quirk: "Will spend forty minutes on the spacing of one button.",
    secret: "Has been designing the rebrand of TripleSpeed in her spare time without being asked.",
    neverDo: "Skip the grid.",
    isSuspect: false,
    motive: "Nikhil presented her work as his own at an external panel.",
    timeline: "7:25 PM - Arrived. 8:00-8:45 PM - Drinking calmly, observing.",
    code: "VIDI_D"
  },
  {
    id: 'char_tejas',
    name: "Tejas",
    role: "WITNESS",
    profession: "Engineer",
    bio: "Engineer. Believes most problems are caused by the wrong abstraction.",
    quirk: "Speaks in commit messages.",
    secret: "Refactors his own home calendar weekly.",
    neverDo: "Merge to main on a Friday.",
    isSuspect: false,
    motive: "Nikhil overruled his architecture proposal. The override later caused an outage.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - With the engineering huddle near the bar.",
    code: "TEJ_E"
  },
  {
    id: 'char_tauseef',
    name: "Tauseef",
    role: "WITNESS",
    profession: "Engineer",
    bio: "Engineer. On-call energy at all times.",
    quirk: "Has a Pavlovian response to PagerDuty notification sounds.",
    secret: "Hasn't actually been paged in three weeks but still wakes up every night at 3 AM convinced he has been.",
    neverDo: "Volunteer for primary on-call again.",
    isSuspect: false,
    motive: "On-call burnout that Nikhil's marketing pushes contributed to.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Same engineering huddle as Tejas.",
    code: "TAU_E"
  },
  {
    id: 'char_shashwat',
    name: "Shashwat",
    role: "WITNESS",
    profession: "Engineer",
    bio: "Engineer. Quiet. Reads the metric anomalies most people skip past.",
    quirk: "Maintains a mental list of every TripleSpeed metric and what its real value should be.",
    secret: "Filed an internal anomaly report in October that turned out to be the same anomaly SEBI is now asking about.",
    neverDo: "Sign off on a dashboard he doesn't understand.",
    isSuspect: false,
    motive: "Nikhil dismissed his metric-anomaly report in October — the same anomaly that ended up in SEBI's tip.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Quiet. Thinking too hard about the SEBI thing.",
    code: "SHASH_E"
  },
  {
    id: 'char_tushar',
    name: "Tushar",
    role: "WITNESS",
    profession: "Video Editor",
    bio: "The video editor who is not there half of the time. Has missed three town halls and a fire drill.",
    quirk: "Will text 'omw' from his bed.",
    secret: "Has been simultaneously freelancing for two competitors. Both think he's full-time.",
    neverDo: "Pick up an unknown number.",
    isSuspect: false,
    motive: "Nikhil docked his timesheet for a week he was clearly working from.",
    timeline: "8:20 PM - Arrived. Missed the speech entirely. 8:20-8:45 PM - Trying to figure out what he missed.",
    code: "TUSH_V"
  },
  {
    id: 'char_kush',
    name: "Kush",
    role: "WITNESS",
    profession: "Games Lead",
    bio: "I make games that make money.",
    quirk: "Floats between groups, watching how people interact. Possibly taking notes for something.",
    secret: "Has been quietly designing a TripleSpeed murder-mystery game on the side. Hasn't told anyone yet.",
    neverDo: "Ship a game without playtesting it himself.",
    isSuspect: false,
    motive: "Nikhil tried to fold his games division into marketing once. It didn't take.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Floating. Watching. Mental notes.",
    code: "KUSH_G"
  },
  {
    id: 'char_meenakshi',
    name: "Meenakshi",
    role: "WITNESS",
    profession: "TripleSpeed",
    bio: "I just chill in the office.",
    quirk: "Has perfected the art of looking busy while doing nothing. Or doing a lot. Hard to tell.",
    secret: "Actually finishes her work in the first hour of the day and chills the rest.",
    neverDo: "Pretend to be busy in front of the founders.",
    isSuspect: false,
    motive: "Nikhil once yelled at her for chilling in the office.",
    timeline: "7:20 PM - Arrived. 8:00-8:45 PM - Chilling.",
    code: "MEEN_O"
  },
  {
    id: 'char_navya',
    name: "Navya",
    role: "WITNESS",
    profession: "Video Editor",
    bio: "Mallu video editor. 'Aye macha.' Adds 'macha' to roughly 40% of her sentences.",
    quirk: "Can lip-sync any Malayalam song from memory after the first two seconds.",
    secret: "Slipped a Malayalam phrase into the company tagline edit once. Nobody at TripleSpeed noticed for three months.",
    neverDo: "Eat unflavoured rice.",
    isSuspect: false,
    motive: "Nikhil mispronounced her name on a company-wide email for nine months.",
    timeline: "7:30 PM - Arrived loud. 8:00-8:45 PM - The energy in the room.",
    code: "NAV_V"
  },
  {
    id: 'char_vipin',
    name: "Vipin",
    role: "WITNESS",
    profession: "TripleSpeed",
    bio: "Always up with energy. Caffeine intake unverifiable but suspected to be illegal.",
    quirk: "Hasn't sat down at the office in two weeks.",
    secret: "Drinks at least one of Vadini's stolen Red Bulls per day. Vadini knows. They have an arrangement.",
    neverDo: "Take a nap during work hours.",
    isSuspect: false,
    motive: "Nikhil once told him to 'calm down' in a 1:1, which is the thing Vipin hates the most.",
    timeline: "7:00 PM - First on the balcony. 8:00-8:45 PM - Bouncing. 8:42 PM - First to Nikhil after he slumped over. 'bro you good?'",
    code: "VIP_E"
  },
  {
    id: 'char_riya',
    name: "Riya",
    role: "WITNESS",
    profession: "TripleSpeed",
    bio: "Misses ordering food for the entire office on a memorable cadence.",
    quirk: "Has set seven different recurring reminders to order food. None have worked.",
    secret: "Has been quietly using her food-ordering reminders as cover for a side project nobody knows about.",
    neverDo: "Promise to order food again, on the record.",
    isSuspect: false,
    motive: "Nikhil yelled at her about the food order, in front of the team, the day before the party.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Avoiding eye contact with Nikhil. Successfully, until 8:45.",
    code: "RIYA_F"
  },
  {
    id: 'char_xans',
    name: "Xans",
    role: "WITNESS",
    profession: "TripleSpeed (allegedly)",
    bio: "404 not found. Job description, location, and recent activity all unclear. May or may not still be employed.",
    quirk: "Doesn't appear in the all-hands recordings.",
    secret: "Got hired during a hiring freeze. Nobody is willing to be the one to ask how.",
    neverDo: "Update Slack status to 'available.'",
    isSuspect: false,
    motive: "Nikhil tried to 'loop Xans in' on something Xans had no context on, then complained when Xans was unhelpful.",
    timeline: "Allegedly arrived. Allegedly was at the party. Nobody can confirm visual.",
    code: "XANS_4"
  },
  {
    id: 'char_bharatpreet',
    name: "Bharatpreet",
    role: "WITNESS",
    profession: "TripleSpeed",
    bio: "Youngest Punjabi in the office. Mint collector.",
    quirk: "Always has at least four flavors of mint on his person.",
    secret: "Has been buying mints in bulk from a dealer in Chandigarh. Yes, a mint dealer.",
    neverDo: "Run out of mints.",
    isSuspect: false,
    motive: "Nikhil ate a mint off his desk without asking.",
    timeline: "7:15 PM - Arrived, pockets full. 8:00-8:45 PM - Offering mints to anyone who looked stressed. Was offering one to Nikhil right before he hit his vape the third time.",
    code: "BHARAT_M"
  }
];

// ============================================
// ACCUSATION CLUES (Round 1)
// 10 accusations, pre-assigned to players
// ============================================

export const ACCUSATION_CLUES = [
  {
    id: 'acc_alam',
    code: "ACCUSE_ALAM",
    targetSuspect: 'char_alam',
    targetName: "Alam",
    title: "Suspicious Behavior: Alam",
    accusation: "Alam was right next to Nikhil within ten seconds of the collapse. He didn't even look surprised. He looked like he was waiting for it. And the way he 'took charge' — it was almost choreographed. Who's that calm when their friend just dropped dead?",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_ashish', 'char_sonia', 'char_prakarsh', 'char_mohit']
  },
  {
    id: 'acc_elias',
    code: "ACCUSE_ELIAS",
    targetSuspect: 'char_elias',
    targetName: "Elias Bothell",
    title: "Suspicious Behavior: Elias",
    accusation: "Elias and Nikhil had a screaming match in the spare bedroom about ten minutes before the speech. I walked past. I heard Elias say 'if this blows up I am cooked, you understand me, I am COOKED.' Nikhil said something I didn't catch and Elias said 'you better make this go away, Nikhil.' That was nine minutes before Nikhil walked on stage.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_mihir', 'char_og_yash', 'char_amisha']
  },
  {
    id: 'acc_sukhans',
    code: "ACCUSE_SUKHANS",
    targetSuspect: 'char_sukhans',
    targetName: "Sukhans Asrani",
    title: "Suspicious Behavior: Sukhans",
    accusation: "Sukhans is the calmest motherfucker in this room and his lead investor is on a plane right now. You think he didn't know about the SEBI thing? You think he didn't know exactly what would happen if Nikhil testified? He owns this fucking apartment. He had keys to every room. Of course he was 'in the kitchen.' Where else was he going to be?",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_arush', 'char_adi', 'char_anusha_w']
  },
  {
    id: 'acc_priyanshu',
    code: "ACCUSE_PRIYANSHU",
    targetSuspect: 'char_priyanshu',
    targetName: "Priyanshu",
    title: "Suspicious Behavior: Priyanshu",
    accusation: "Priyanshu is the only person in this whole fucking apartment who didn't drink, didn't talk, didn't socialize, and didn't move from his spot near the kitchen. He just watched. He saw everything. His three words are literally 'quiet, patient, dangerous.' His never-do is literally 'murder someone.' Either that's the world's most ironic Google form or this guy was *patient*.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_prerna', 'char_vidi', 'char_tejas']
  },
  {
    id: 'acc_yash_s',
    code: "ACCUSE_YASH_S",
    targetSuspect: 'char_yash_s',
    targetName: "Yash Shindey",
    title: "Suspicious Behavior: Yash Shindey",
    accusation: "Yash literally took photographs of Nikhil's body before the ambulance got there. He said 'sorry, professional habit.' That's not a habit, that's a tell. The man works murder scenes for a living. He knows exactly how this stuff plays out. And he was watching Nikhil all night with the most unsettling fucking face I've ever seen on a sober person.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_tauseef', 'char_shashwat', 'char_tushar']
  },
  {
    id: 'acc_pranav',
    code: "ACCUSE_PRANAV",
    targetSuspect: 'char_pranav',
    targetName: "Pranav Ahlawat",
    title: "Suspicious Behavior: Pranav",
    accusation: "Pranav was asking people about poison ALL NIGHT. He kept saying it was 'for a podcast.' What podcast, brother. He's been off his meds for like three days. He's been following Nikhil around the office. He showed up here in a suit when he never wears a suit. He's high, he's furious, and he was in the kitchen when Nikhil walked past with his vape.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_kush', 'char_meenakshi', 'char_navya']
  },
  {
    id: 'acc_vadini',
    code: "ACCUSE_VADINI",
    targetSuspect: 'char_vadini',
    targetName: "Vadini",
    title: "Suspicious Behavior: Vadini",
    accusation: "Vadini posted a fucking *Kill Bill* GIF in the marketing channel the morning of the party. The morning of. She kept hovering near the vape table. She was on her phone constantly. And she was the only person looking happy when Nikhil collapsed — for like one second, before she remembered to look upset. I saw it.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_vipin', 'char_riya', 'char_xans']
  },
  {
    id: 'acc_ishika',
    code: "ACCUSE_ISHIKA",
    targetSuspect: 'char_ishika',
    targetName: "Ishika Goel",
    title: "Suspicious Behavior: Ishika",
    accusation: "Ishika logged into her email at 7:55 PM. From the kitchen. On her phone. *Why.* Why does anybody check their email five minutes before a Series B announcement? She was setting something up or she was covering something up. And she has been *deeply* fucking weird this whole month.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_bharatpreet', 'char_alam', 'char_elias', 'char_sukhans']
  },
  {
    id: 'acc_neha',
    code: "ACCUSE_NEHA",
    targetSuspect: 'char_neha',
    targetName: "Neha Mittal",
    title: "Suspicious Behavior: Neha",
    accusation: "Neha was in the kitchen for like ninety minutes straight. Helping. With *what.* The caterers had it. She was just standing in there. And she kept looking at her phone and laughing in a way that wasn't laughing. The girl writes Romantasy novels. About killing people. Her form literally said 'I can actually kill someone.' How is nobody talking about this.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_priyanshu', 'char_yash_s', 'char_pranav']
  },
  {
    id: 'acc_mohit',
    code: "ACCUSE_MOHIT",
    targetSuspect: 'char_mohit',
    targetName: "Mohit Aasirwal",
    title: "Suspicious Behavior: Mohit",
    accusation: "Mohit straight up disappeared for like twelve minutes during the speech. He says he was 'on the balcony having an attack.' Bro I was on the balcony. He was not on the balcony. He was somewhere. And he's been Googling poison detection limits for like a week — Aman saw it over his shoulder in the office. The man is melting down and he hates Nikhil more than anybody.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_vadini', 'char_ishika', 'char_neha']
  }
];

// ============================================
// MOTIVE CLUES (Round 2)
// 10 motives, distributed via printed codes
// ============================================

export const MOTIVE_CLUES = [
  {
    id: 'mot_alam',
    code: "COURTPOET",
    targetSuspect: 'char_alam',
    targetName: "Alam",
    title: "Motive: Alam (Head of HR)",
    content: "Alam has been Head of HR at TripleSpeed since the seed round. Knew Nikhil personally for over a decade — they worked together at three places before TripleSpeed. On record, Alam will tell anyone who asks that Nikhil 'bullied my juniors and undermined HR decisions and the founders kept telling me to manage him. I was sick of cleaning up after him.' Multiple junior employees confirm this characterization. HR records also show Alam was on signing authority for the TripleSpeed key-person insurance policy on Nikhil. And there is some unaccounted activity in his HR-records access logs from January 2026 that the audit team had recently flagged.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_elias',
    code: "BIGGINGER",
    targetSuspect: 'char_elias',
    targetName: "Elias Bothell",
    title: "Motive: Elias Bothell",
    content: "Elias is the marketing-side co-founder of TripleSpeed. Nikhil reported into him directly. By extension, every campaign Nikhil falsified is signed off by Elias's name in the company's internal records and on three SEC/SEBI-relevant filings related to the Series B due-diligence package. Slack DMs to Nikhil dated 18, 20, and 22 May read 'kill the campaign,' 'kill it,' and 'I swear to god.' Elias's attorney was on retainer the week before the party — billable hours spike. If Nikhil's fraud broke before the round closed, Elias was the next named individual after Nikhil. Founder culpability. Personal liability. Visa status. Everything.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_sukhans',
    code: "BIRYANI",
    targetSuspect: 'char_sukhans',
    targetName: "Sukhans Asrani",
    title: "Motive: Sukhans Asrani",
    content: "Sukhans is the financial co-founder of TripleSpeed. Brought Westland Capital to the Series B table at ₹400 Cr. A meaningful seven-figure-USD chunk of his personal net worth was contingent on the round closing on the announced terms. If Nikhil's fraud surfaced before close on Friday, the term sheet would evaporate and the existing investors would mark the company down. Sukhans messaged a contact in a Slack DM dated May 19: 'I have a personal incentive that the leak gets handled.' Encrypted Telegram thread with a contact saved as 'M' on the night of May 22 — only the message hashes remain, content unrecoverable. Phone records show 17 outgoing calls to Westland Capital's general partner over the four days before the party.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_priyanshu',
    code: "VIBECODE",
    targetSuspect: 'char_priyanshu',
    targetName: "Priyanshu",
    title: "Motive: Priyanshu",
    content: "Priyanshu has lived at the Penthouse with Sukhans and Elias for two years. Two weeks before the party, Priyanshu walked in on Nikhil and Alam arguing in the spare bedroom. Two days later, Nikhil pulled him aside in the apartment kitchen and — per Priyanshu's later, brief, almost shrugged statement — said: 'If you ever say a word about anything you've ever seen at this Penthouse, I'll have HR put you on a PIP and make sure no one hires you again. Try me.' Priyanshu didn't react. Priyanshu rarely reacts. His three words on his form were 'quiet, patient, dangerous.' His never-do was 'murder someone.'",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_yash_s',
    code: "SHUTTERBUG",
    targetSuspect: 'char_yash_s',
    targetName: "Yash Shindey",
    title: "Motive: Yash Shindey",
    content: "Yash photographs crime scenes for private investigators and insurance firms. Years ago he photographed a murder scene before police arrived — and noticed evidence proving the man eventually arrested couldn't have done it. He kept the photo. He kept quiet. The wrong person went to prison. Six months ago, drunk at an offsite, he told Nikhil. Nikhil sobered up immediately and started 'asking favors' — off-the-books photography work, discreet personal investigations — always with the implicit *I know what you didn't tell anyone.* His phone has a contact saved as 'Pune Lab' (legitimate forensic-supply route, also a plausible sodium-azide procurement route). His 'souvenir kit' from past investigations contains, by his own admission, items 'the police didn't log.'",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_pranav',
    code: "LOSALAMOS",
    targetSuspect: 'char_pranav',
    targetName: "Pranav Ahlawat",
    title: "Motive: Pranav Ahlawat",
    content: "Pranav is officially a content/strategy guy at TripleSpeed. Unofficially, he is — by his own marketing — a 'private investigator from Los Alamos who does drugs for a living and takes cases to get high and solve them to feel happy.' Recovered correspondence shows somebody paid him in early March to 'look into the Velocity numbers.' He's been quietly tailing Nikhil for two months. He has a folder. Nikhil noticed the tail in the second week of May and confronted him: 'I know what you're doing. I have HR friends. You'll never work in tech again.' Pranav was photographed (by Yash, ironically) in Nikhil's apartment-complex parking lot three days before the party.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_vadini',
    code: "REDBULL",
    targetSuspect: 'char_vadini',
    targetName: "Vadini",
    title: "Motive: Vadini",
    content: "Vadini runs the team that powers TripleSpeed's organic-traffic numbers. Her actual numbers were the raw input that Nikhil laundered into the Velocity dashboard's reported numbers. Since November, she had been telling her manager that the numbers Nikhil was reporting upstairs were not the numbers she was reporting upstairs. Three months ago she went to Alam (HR). Alam — for reasons that will become clear — politely brushed her off. Two weeks before the party, Nikhil told her at the office coffee machine: 'I know about the Red Bulls. I know about a few other things. If anyone's name lands on the wrong piece of paper, it's gonna be yours. Be smart.' (The Red Bulls thing isn't nothing — Alam had a written warning in her HR file dated April.) Texts to a friend the night of May 22 read: 'i can't let him do this to me.'",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_ishika',
    code: "LIZARDEGG",
    targetSuspect: 'char_ishika',
    targetName: "Ishika Goel",
    title: "Motive: Ishika Goel",
    content: "Ishika runs every email campaign that goes out from TripleSpeed. Some of those campaigns to clients contained the inflated metrics SEBI is investigating. The campaigns were sent from her account. Drafted in her drafts folder. Timestamped during her active hours. Five days before the party, she found a draft in her own drafts folder that she swears she didn't write. That's when she figured out Nikhil had been preparing — for months — to make her the one whose name was on every fraudulent send. The fall girl. She spent the four days before the party quietly collecting headers and metadata to defend herself with.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_neha',
    code: "ROMANTASY",
    targetSuspect: 'char_neha',
    targetName: "Neha Mittal",
    title: "Motive: Neha Mittal",
    content: "Neha wrote the press copy and external-facing communications that wrapped the Velocity dashboard's fake metrics in a marketing story. Her name is on the bylines. Her quotes are in the deck. She did not, at the time, know the underlying numbers were doctored — she figured it out the same week SEBI did. Once she realized, she also realized the press copy she wrote was the most public artifact of the fraud. The investigation will read every word she ever wrote for him and ask whether she knew. Separately: at the December offsite, Nikhil — drunk and showing off in front of the founders — read aloud a passage from her unpublished Romantasy manuscript that someone had emailed him. He did the voices. He made the room laugh. Her unpublished manuscript, recovered from her laptop, contains a poisoning subplot and the substance she names is 'a rare azide compound.'",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_mohit',
    code: "DELULU",
    targetSuspect: 'char_mohit',
    targetName: "Mohit Aasirwal",
    title: "Motive: Mohit Aasirwal",
    content: "Mohit built and maintained the analytics pipeline that fed the Velocity dashboard. Every SQL query that produced a number Nikhil ever reframed in marketing's deck was authored by him. His Git commits show a 'test mode' backdoor in the analytics pipeline — a feature he says Nikhil had asked for 'for QA reasons' — that was never disabled in production. SEBI's forensic accountants would find it within a week of opening the source tree. Mohit would be the named technical co-author of the fraud. Career over. Possible prosecution. He figured this out the second week of May. His Slack search history shows him asking ChatGPT about 'poison detection thresholds in modern toxicology' three days before the party. He says it was 'research for a song.'",
    roundReq: 2,
    type: "MOTIVE"
  }
];

// ============================================
// EVIDENCE CLUES (Round 3)
// Forensic and documentary evidence
// ============================================

export const EVIDENCE_CLUES = [
  {
    id: 'ev_tox',
    code: "EVIDENCE_TOX",
    title: "Toxicology Report",
    content: "FORENSIC LABORATORY - BANGALORE\n\nCASE: Nikhil — TripleSpeed/Indiranagar\nSPECIMENS: Blood, gastric contents, oral swab, vape device residue.\n\nFINDINGS:\n- Cause of death: acute sodium azide toxicity\n- Estimated total absorbed dose: 250-300 mg (lethal range)\n- Time from first significant exposure to death: ~25 minutes\n- Vape cartridge interior coating: positive for sodium azide residue\n- Liquid nicotine carrier in cartridge: positive for sodium azide\n- Vape mouthpiece: trace azide consistent with use\n- Bottle, glass, food, and ambient surfaces: NEGATIVE for azide\n\nCONCLUSION: Toxin was delivered through the vape device. Azide is unusually soluble in propylene glycol / vegetable glycerin (the standard vape carrier base). Inhaled rather than ingested — explains the rapid onset relative to the modest dose.",
    roundReq: 3,
    type: "FORENSICS"
  },
  {
    id: 'ev_vape',
    code: "EVIDENCE_VAPE",
    title: "Vape Cartridge Analysis",
    content: "ITEM: Personal pod-style vape pen and 1 attached cartridge.\nOWNER: Nikhil (per multiple witnesses; device was on a coffee-table tray with several near-identical devices belonging to other guests).\n\nFINDINGS:\n- Cartridge identifier (printed on base): batch run dated April 2026\n- Manufacturer-tracked batch confirms cartridge was produced legitimately\n- Cartridge contents: standard salt-nicotine vape juice base, with sodium azide dissolved at ~12% w/v\n- Threading on cartridge shows minor mismatch wear pattern relative to Nikhil's pen — consistent with the cartridge having been threaded only once or twice before final use\n- No fingerprints on cartridge surface — wiped\n- Pen body fingerprints: Nikhil (primary), one partial unidentified print on the underside\n\nCONCLUSION: Cartridge was almost certainly NOT purchased by Nikhil and used in his normal rotation. It was a fresh swap-in. Wiped clean before installation.",
    roundReq: 3,
    type: "FORENSICS"
  },
  {
    id: 'ev_penthouse_cctv',
    code: "EVIDENCE_PENTHOUSE_CCTV",
    title: "Penthouse / Hallway CCTV Summary",
    content: "BUILDING SECURITY (Indiranagar, 4th floor — Penthouse hallway and lift lobby).\n\nDAYTIME ACCESS LOG (2026-05-23):\n- 5:30 PM: ALAM enters Penthouse alone. Roommates (Sukhans, Elias) had departed at 5:18 PM with Priyanshu reportedly inside.\n- 5:30 - 5:55 PM: NO additional persons enter Penthouse hallway.\n- 5:55 PM: Sukhans + Elias return.\n\nEVENING:\n- 7:00 - 7:45 PM: Guest arrivals.\n- 8:25 PM: BUILDING POWER FLICKER - hallway camera offline 8:25:14 - 8:28:02 (~3 min). Building maintenance previously notified residents of scheduled load test that day.\n- 9:30 PM: Bangalore Police arrival, scene sealed.\n\nNOTE: Internal Penthouse CCTV does not exist — residents have no internal cameras.\nNOTE: The 8:25 power flicker is unrelated to any single guest's movements; multiple suspects were physically inside the apartment during the blind-spot window. The flicker is a *narrative* red herring; the actual cartridge swap was earlier.",
    roundReq: 3,
    type: "CCTV"
  },
  {
    id: 'ev_funding',
    code: "EVIDENCE_FUNDING",
    title: "Series B Funding-Round Documentation",
    content: "TRIPLESPEED — SERIES B PROVISIONAL DOCUMENTS\n\nLEAD: Westland Capital\nVALUATION: ₹400 Cr post-money\nCLOSE TARGET: 2026-05-29 (Friday)\nDUE-DILIGENCE PACKAGE: includes 18 months of Velocity dashboard reporting, signed off by 'Head of Marketing' (Nikhil) and 'Co-Founder, Marketing' (Elias)\n\nKEY CLAUSES:\n- Material adverse change clause: any pre-close discovery of material misstatement permits Westland to walk\n- Key-person insurance: TripleSpeed maintains a ₹5 Cr policy on Nikhil. Beneficiary: TripleSpeed Inc. Administrator: Head of HR (Alam)\n- Founder share lockup: Sukhans's primary share class is contingent on round closing on announced terms — meaningful seven-figure-USD personal exposure\n\nNOTE: A SEBI preliminary inquiry was opened on or around 2026-01-14 into the engagement metrics within the Velocity dashboard. Three TripleSpeed employees had received informal contact requests from SEBI's investigation team in the four weeks before the party.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_phone',
    code: "EVIDENCE_PHONE",
    title: "Phone Records Summary",
    content: "DEVICES PROCESSED: 32 (full guest list).\n\nNIKHIL'S DEVICE (recovered from on-person):\n- Last 48 hours: extensive activity. Calls to insurance company (Duration: 78 min total over two days). Multiple to a personal contact saved as 'A.' Voice notes app contains ~14 hours of recordings dated Feb-May 2026.\n- Text to 'A' at 4:51 PM 23 May: 'It's almost time. I love you, brother. Don't fuck this up.'\n- Last text sent: 8:14 PM 23 May, to 'team marketing' Slack: '🔥'\n\nALAM'S DEVICE:\n- Phone in airplane mode 8:30 PM - 9:15 PM.\n- Encrypted-messenger thread with contact 'N' — content unrecoverable, 47 message hashes remain.\n- HR application access logs show authentication at 11:42 PM 22 May from his personal device (out-of-hours, unusual pattern).\n\nSUKHANS'S DEVICE:\n- Encrypted Telegram thread with contact 'M.' Content unrecoverable. 23 message hashes between 22-23 May.\n- 17 outgoing calls to Westland Capital general partner over previous four days.\n\nELIAS'S DEVICE:\n- Slack DMs to Nikhil dated 18/20/22 May: 'kill the campaign,' 'kill it,' 'I swear to god.'\n- Outgoing call to retainer attorney 7:48 PM 23 May, duration 6 min, immediately before pulling Nikhil into the spare bedroom.\n\nMULTIPLE OTHER DEVICES show search/research history relevant to toxicology, vape pharmacokinetics, or sodium-azide procurement — see individual suspect motive files.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_hrdocs',
    code: "EVIDENCE_HRDOCS",
    title: "HR Records Access Log",
    content: "TRIPLESPEED HR SYSTEM — ACCESS AUDIT (auto-generated)\n\nADMIN ACCOUNT: Alam (Head of HR)\nELEVATED PERMISSIONS: All employee records, equity grants, insurance policies, separation documents.\n\nFLAGGED ACCESS WINDOWS:\n- 2026-01-08 02:14 - 03:47 (out of hours): edits to Nikhil's equity-vesting paperwork. Specifically: backdated milestone-based vesting schedule modifications.\n- 2026-01-12 23:22 - 00:51 (out of hours): edits to insurance-administration paperwork. Beneficiary clarifications on personal life-insurance policy.\n- 2026-04-08: written warning added to Vadini's HR file (Red Bulls / fridge inventory).\n- 2026-05-22 23:42 (out of hours): records access — purpose unspecified.\n\nNOTE: All accesses are within Alam's normal permission set. Out-of-hours timestamps are the only anomaly; HR ToS allows out-of-hours work.\n\nSECONDARY NOTE: SEBI's preliminary inquiry list of documents requested includes 9 of the 14 records that show out-of-hours edits in the last 6 months.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_sebi',
    code: "EVIDENCE_SEBI",
    title: "SEBI Investigation File Extract",
    content: "SECURITIES AND EXCHANGE BOARD OF INDIA — PRELIMINARY INQUIRY\n\nMATTER: TripleSpeed Pvt. Ltd. — engagement-metric reporting in due-diligence material\nFILE OPENED: 2026-01-14\nORIGIN: anonymous tip with structured documentation. Tipster identity protected.\n\nNAMED INDIVIDUALS IN PROVISIONAL DOCUMENTS:\n1. Nikhil — Head of Marketing (primary author of metric reports)\n2. Elias Bothell — Co-Founder, Marketing (sign-off authority)\n3. Mohit Aasirwal — Senior Engineer (technical author of analytics pipeline)\n\nUNNAMED BUT IMPLICATED:\n- Whoever processed the equity grants and HR-side incentive structure that supported the fraud (HR access logs requested but not yet reviewed)\n- Whoever sent the outbound communications referencing the inflated metrics (email account: ishika.goel@triplespeed.ai — owner not yet contacted)\n\nNOTE: The criminal case against an individual prime suspect collapses upon their death, regardless of cause. Civil and corporate-level proceedings against the company can continue.",
    roundReq: 3,
    type: "EVIDENCE"
  }
];

// ============================================
// REVELATION CLUES (Round 4)
// The cancer + fraud-staged-death twist
// ============================================

export const REVELATION_CLUES = [
  {
    id: 'rev_cancer',
    code: "REVEAL_CANCER",
    title: "Nikhil's Medical Records",
    content: "CONFIDENTIAL MEDICAL RECORD\n\nPATIENT: Nikhil\nDIAGNOSIS: Pancreatic Adenocarcinoma, Stage IV\nMETASTASIS: Liver, Lymph Nodes\n\nDATE OF DIAGNOSIS: 2026-02-12\nPROGNOSIS AT DIAGNOSIS: 4-6 months with palliative care. Patient declined aggressive treatment.\n\nDOCTOR'S NOTES:\n- Patient appeared composed at diagnosis. Asked the kind of methodical questions the team rarely gets in this room.\n- Patient declined psychiatric referral. Stated he 'had his own plans for dealing with this.'\n- Patient confirmed he had told 'one person who needs to know' and would handle telling family in his own time.\n- Last appointment: 2026-05-15. Patient appeared at peace. Mentioned 'putting affairs in order.'\n\nNOTE: No record in TripleSpeed's HR file. Diagnosis was not disclosed at work.",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_notes',
    code: "REVEAL_NOTES",
    title: "Nikhil's Voice Notes (Recovered)",
    content: "VOICE NOTES APP — NIKHIL'S PERSONAL DEVICE\n14 hours of recordings, dated Feb-May 2026. Selected transcribed excerpts.\n\n2026-02-13 (one day after diagnosis):\n*'Six months. Probably less. I'm going to write this down because if I don't say it to something I'm going to say it to a person and I'm not ready. Alam knows. Alam's the only one. Alam's going to be the only one until I figure this out.'*\n\n2026-03-04:\n*'The SEBI thing is real. Someone leaked. We always knew this was the risk. The funny thing is — I think it might be a gift. If I'm going anyway, this stops being a problem and starts being a tool.'*\n\n2026-03-22:\n*'Suicide voids the policy. I checked twice. Three times. So suicide's off the table. Natural death drags everything through the estate — my family will be reading deposition transcripts at the funeral. So that's off the table too. There's only one option that works for everyone, and once you let yourself think about it for a week it stops sounding crazy.'*\n\n2026-04-30:\n*'Alam said yes. Of course Alam said yes. He's been waiting for me to ask since the day I told him.'*\n\n2026-05-22 (the night before the party):\n*'Tomorrow. Alam knows the timing. He'll be the calmest person in the room because he always is. When you find these notes — and somebody will — please understand that I made the decision and I made him help. He didn't talk me into anything. The math worked. That's all this was.'*",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_fraud',
    code: "REVEAL_FRAUD",
    title: "The Velocity Dashboard Fraud",
    content: "INTERNAL TECHNICAL REPORT (compiled by SEBI's forensic accounting team, partial copy seized)\n\nSYSTEM: TripleSpeed 'Velocity' growth-marketing analytics dashboard.\n\nFRAUD MECHANISM:\n- 'Test mode' boolean flag in the analytics ingestion pipeline (added 2024-Q3)\n- When set, certain raw-event streams are passed through a multiplier function before aggregation\n- The flag was authored by Mohit Aasirwal (commit message: 'as discussed') on Nikhil's request\n- The flag was never disabled in production\n- Reported engagement and retention numbers exceeded actual numbers by 1.7x to 3.4x depending on segment\n\nDOWNSTREAM USE:\n- Inflated numbers drove client-facing email campaigns (sent from ishika.goel@triplespeed.ai)\n- Inflated numbers were laundered into the press copy for the Series B announcement (drafts authored by Neha Mittal)\n- Inflated numbers appeared in 18 months of investor reporting and the Series B due-diligence package signed by Elias Bothell\n- Vadini's actual SEO numbers were the upstream raw data that the multiplier was applied to — she was reporting truthfully throughout\n\nFINANCIAL IMPLICATIONS:\n- Series B at announced terms: contingent on the Velocity numbers being real. If misstatement is established before close, term sheet voids.\n- Civil exposure: TripleSpeed and named individuals.\n- Criminal exposure: primary architect (Nikhil), sign-off authority (Elias), technical author (Mohit). HR-side cleanup involvement under separate review.",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_insurance',
    code: "REVEAL_INSURANCE",
    title: "Insurance Policy Summary",
    content: "LIFE INSURANCE — POLICY SUMMARY\n\nPOLICY 1 (Personal):\nInsured: Nikhil\nSum Assured: ₹2,00,00,000\nBeneficiary: 'The Mercy Trust' (a charitable trust with Nikhil's family as named beneficiaries; settlor is Nikhil; trustee is Alam)\nPolicy commenced: 2018-04-09\nKEY EXCLUSIONS:\n- Suicide: NO PAYOUT (lifetime exclusion clause, atypical and aggressive)\n- Death during commission of crime: NO PAYOUT\n- Death by homicide: FULL PAYOUT (subject to fraud investigation by insurer)\n- Death by accident: FULL PAYOUT\n\nPOLICY 2 (Corporate Key-Person):\nInsured: Nikhil\nSum Assured: ₹5,00,00,000\nBeneficiary: TripleSpeed Pvt. Ltd.\nPolicy administrator: Alam (Head of HR)\nSame exclusion structure as Policy 1.\n\nNOTE: The trustee (Alam) has discretion over Trust disbursements. Trust deed amended on 2026-01-12 (out-of-hours edit, from Alam's HR system access — see HR records audit) to expand permitted distributions to include 'administrative expenses to the trustee.' The amendment was countersigned by Nikhil.\n\nIN PLAIN ENGLISH: A natural death pays out. A suicide pays nothing. A homicide pays the full ₹2 Cr to the Trust (controllable by Alam) and ₹5 Cr to TripleSpeed.",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_hrtrail',
    code: "REVEAL_HRTRAIL",
    title: "HR Trail — Alam's January Cleanup",
    content: "TRIPLESPEED HR SYSTEM — DETAILED EDIT HISTORY (Jan 2026)\n\nThe HR records audit team has reconstructed the actual content of the out-of-hours edits Alam made in early January 2026.\n\n2026-01-08 02:14-03:47:\n- Adjusted equity-vesting schedule on Nikhil's grant from 'cliff + linear' to 'milestone-based.'\n- 'Milestones' inserted post-hoc to align Nikhil's vesting events with reported Velocity dashboard numbers.\n- Effect: makes it look, on paper, as if Nikhil's compensation was tied to the reported numbers in a way that's consistent with industry norms — masking the unusual incentive structure SEBI's tip identified.\n\n2026-01-12 23:22-00:51:\n- Modified the trustee deed for 'The Mercy Trust' (the beneficiary on Nikhil's personal life-insurance policy) to expand permitted distributions to include 'administrative expenses to the trustee.'\n- Trustee is Alam.\n- Effect: gives Alam legitimate, documentable access to a percentage of the personal-policy payout in the event of homicide.\n\n2026-05-22 23:42:\n- Records-access pull on insurance administration paperwork. Policy on Nikhil. Standard pre-claim review by HR.\n- Timing is the night before the party.\n\nINFERENCE: These three actions, taken together, are the operational footprint of a person who knew that (a) the metric fraud was about to be investigated and (b) the named individual was about to die under specific circumstances.",
    roundReq: 5,
    type: "REVELATION"
  },
  {
    id: 'rev_letter',
    code: "REVEAL_LETTER",
    title: "Unsent Voice Memo from Nikhil to Alam",
    content: "VOICE MEMO (recovered, never sent)\nNIKHIL'S PERSONAL DEVICE — file timestamped 2026-05-22 23:51\nIntended recipient: 'Alam' (per memo's first line)\n\n*'Hey brother. If you're hearing this, then I went off plan and you're cleaning up. So first: I'm sorry. Second: do exactly what we said. Don't get sentimental. Don't try to fix anything that doesn't need fixing.*\n\n*The Trust is set up. The amendment is filed. Take the percentage. Don't take more than the percentage — that's how this falls apart, when you start taking more than you're supposed to. Take the cut, give the rest to my mom and sister, walk away.*\n\n*I want you to do something for me. I want you to keep an eye on Mohit. He's going to take this hard. He doesn't know what he was actually working on. He thinks he does, but he doesn't. Tell him whatever you have to tell him to keep him standing.*\n\n*Vadini's gonna lose her job for the Red Bulls. You know that, I know that. Maybe rip up the warning. Maybe don't. Up to you.*\n\n*I love you, brother. We did this together for ten years. Ending this together is just the last project on the list. Don't make it weird.'*\n\nNOTE: Memo was never sent. Was saved as a draft. Nikhil intended Alam to find it post-mortem only if something went wrong.",
    roundReq: 5,
    type: "REVELATION"
  }
];

// ============================================
// THE CONFESSION (Round 6 - Murderer Only)
// ============================================

export const CONFESSION_CLUE = {
  id: 'confession',
  code: "THE_TRUTH",
  title: "The Truth",
  content: "I did it. I helped him do it. There. It's said.\n\nNikhil was dying. The cancer was real. The diagnosis was real. The four-to-six months were real. He told me first because he tells me everything first — that's how it's been since our first job together, ten years ago, before any of you knew either of us.\n\nAnd I told him about the SEBI thing because I knew before he did. HR sees the leaks. I knew somebody had talked. I knew it would be him first and me second. I'd been cleaning up his mess for two years and I knew exactly which of those cleanups would be on the front page.\n\nSo we ran the numbers. He ran them. I ran them with him. Suicide voids the policy. Natural death drags the whole investigation through his estate. But murder — murder closes the case. Murder makes him a victim. Murder pays out. Murder lets me walk.\n\nI swapped the cartridge. I don't even remember doing it now, I've replayed it so many times. Twenty-five minutes alone in the apartment. He'd left the vape on the spare-room nightstand the night before. I had the replacement in my jacket pocket. I had the clean one in my pocket on the way out. Catering arrived at half past six and I went and I made tea like nothing happened.\n\nAnd tonight, watching all of you — Mohit losing his mind, Ishika checking her email like it would save her, Vadini white-knuckling the bar, Yash photographing the body because he doesn't know how else to be in a room with a dead person — I keep thinking I should feel something other than relieved. Nikhil told me the night before that whichever one of you went down for it, it didn't matter, because none of you were innocent enough to really go down. I believed him. I still believe him. But I keep watching Mohit shake.\n\nI am going to walk out of this Penthouse tonight. The case will close. The round will fund. My friend's family will be taken care of. I'll wire myself the offshore tranche on Friday. I'll still come to work on Monday. And I'll sit through every grief Slack channel and every memorial post and every awkward conversation about how Nikhil 'really wasn't that bad.'\n\nAnd the photograph in Yash's drawer will stay in Yash's drawer. And Mohit will sit through SEBI alone. And Vadini will lose her job for the Red Bulls.\n\nI'm sorry. I'm not going to confess to anyone but myself, and I'm not going to stop. But I am sorry. That has to count somewhere.",
  roundReq: 6,
  type: "CONFESSION",
  forCharacter: 'char_alam'
};

// ============================================
// CASE FILES (Round-Gated)
// ============================================

export const CASE_FILES = [
  // Round 0/3 - Incident Report
  {
    id: 'f_incident',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: 'May 23, 2026',
    content: "BANGALORE POLICE - INDIRANAGAR DIVISION\n\nINCIDENT TYPE: Suspicious Death\nVICTIM: Nikhil — Head of Marketing, TripleSpeed Pvt. Ltd.\nLOCATION: Penthouse, 4th floor, Indiranagar\nDATE/TIME: 2026-05-23, 8:45 PM\n\nSUMMARY:\nVictim collapsed during a private company event — TripleSpeed's Series B funding-round announcement, held at the residence shared by the two co-founders (Sukhans Asrani, Elias Bothell) and their roommate (Priyanshu).\n\n32 employees were present at the time of death. Victim had given a brief toast on stage approximately 30 minutes prior to collapse and had been mingling with guests since. Witnesses confirm he was using a personal vape pen throughout the evening.\n\nAll 32 guests have been detained on-site for questioning.\n\nSTATUS: Active Investigation\nLEAD INVESTIGATOR: Inspector Reema Mathur",
    stamped: true,
    roundReq: 0
  },
  // Round 3 - Evidence Files
  {
    id: 'f_toxreport',
    type: 'REPORT',
    title: 'TOXICOLOGY REPORT',
    date: 'May 24, 2026',
    content: "FORENSIC LABORATORY - BANGALORE\n\nCASE: Nikhil — TripleSpeed/Indiranagar\nSPECIMENS: Blood, gastric contents, oral swab, vape device residue.\n\nFINDINGS:\n- Cause of death: acute sodium azide toxicity\n- Estimated total absorbed dose: 250-300 mg (lethal range)\n- Time from first significant exposure to death: ~25 minutes\n- Vape cartridge contents: positive for sodium azide\n- Vape mouthpiece: trace azide consistent with use\n- Bottle, glass, food, ambient surfaces: NEGATIVE for azide\n\nCONCLUSION: Toxin was delivered through the personal vape device. Inhaled exposure rather than ingested explains the rapid onset relative to the modest dose.",
    stamped: true,
    roundReq: 3
  },
  {
    id: 'f_funding',
    type: 'REPORT',
    title: 'FUNDING ROUND DOSSIER',
    date: 'May 2026',
    content: "TRIPLESPEED — SERIES B\n\nLEAD: Westland Capital\nVALUATION: ₹400 Cr post-money\nCLOSE TARGET: 2026-05-29 (Friday)\n\nKey clauses include a material adverse change provision permitting Westland to walk if any material misstatement in due-diligence material is identified before close.\n\nKey-person insurance: TripleSpeed maintains a ₹5 Cr policy on Nikhil. Beneficiary: TripleSpeed. Administrator: Alam (Head of HR).\n\nFounder share lockup: Sukhans's primary share class is contingent on round closing on announced terms. Personal exposure: meaningful seven-figure USD if the round repriced or collapsed.",
    stamped: true,
    roundReq: 3
  },
  // Round 4 - Revelation Files
  {
    id: 'f_medical',
    type: 'REPORT',
    title: 'MEDICAL RECORDS',
    date: 'February - May 2026',
    content: "CONFIDENTIAL MEDICAL FILE\n\nPatient: Nikhil\nDiagnosis: Pancreatic Adenocarcinoma, Stage IV\n\nHISTORY:\n- Diagnosis confirmed: 2026-02-12\n- Metastasis: liver, lymph nodes\n- Patient declined aggressive treatment\n\nPROGNOSIS:\n- Expected survival: 4-6 months from diagnosis\n- Treatment: palliative only\n\nNOTES:\n- Patient appeared composed at diagnosis\n- Declined psychiatric referral\n- Stated he 'had his own plans for dealing with this'\n- Last visit 2026-05-15: Patient 'appeared at peace.' Mentioned 'putting affairs in order.'\n- Diagnosis not disclosed in TripleSpeed HR records",
    stamped: true,
    roundReq: 4
  },
  {
    id: 'f_insurance',
    type: 'REPORT',
    title: 'INSURANCE POLICY SUMMARY',
    date: 'April 2018 / January 2026',
    content: "POLICY 1 (Personal):\nInsured: Nikhil\nBeneficiary: 'The Mercy Trust' (charitable trust; family named; trustee: Alam)\nSum Assured: ₹2,00,00,000\n\nKEY EXCLUSIONS (atypical, aggressive):\n- Suicide: NO PAYOUT (lifetime exclusion)\n- Death during commission of crime: NO PAYOUT\n- Death by homicide: FULL PAYOUT\n- Death by accident: FULL PAYOUT\n\nPOLICY 2 (Corporate Key-Person):\nInsured: Nikhil\nBeneficiary: TripleSpeed Pvt. Ltd.\nSum Assured: ₹5,00,00,000\nAdministrator: Alam (Head of HR)\n\nNOTE: Trust deed amended 2026-01-12 (during an out-of-hours HR system access by Alam) to expand permitted distributions to 'administrative expenses to the trustee.'",
    stamped: true,
    roundReq: 4
  },
  {
    id: 'f_sebi',
    type: 'REPORT',
    title: 'SEBI INQUIRY EXTRACT',
    date: 'January - May 2026',
    content: "SECURITIES AND EXCHANGE BOARD OF INDIA — PRELIMINARY INQUIRY\n\nMATTER: TripleSpeed Pvt. Ltd. — engagement-metric reporting in due-diligence material\nFILE OPENED: 2026-01-14\nORIGIN: anonymous tip with structured documentation\n\nNAMED IN PROVISIONAL DOCUMENTS:\n1. Nikhil — Head of Marketing\n2. Elias Bothell — Co-Founder, Marketing\n3. Mohit Aasirwal — Senior Engineer\n\nUNNAMED BUT IMPLICATED:\n- HR-side personnel involved in equity-grant cleanup\n- Account holders sending outbound communications referencing inflated metrics\n\nNOTE: A criminal case against an individual prime suspect collapses upon their death, regardless of cause.",
    stamped: true,
    roundReq: 4
  }
];

// ============================================
// ALL CLUES COMBINED (for code validation)
// ============================================

export const CLUE_DB = [
  ...ACCUSATION_CLUES,
  ...MOTIVE_CLUES,
  ...EVIDENCE_CLUES,
  ...REVELATION_CLUES,
  CONFESSION_CLUE
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get accusation assigned to a specific character
export const getAssignedAccusation = (characterId) => {
  return ACCUSATION_CLUES.find(acc => acc.assignedTo.includes(characterId));
};

// Get all suspects
export const getSuspects = () => {
  return CHARACTERS.filter(c => c.isSuspect);
};

// Get all witnesses (non-suspects)
export const getWitnesses = () => {
  return CHARACTERS.filter(c => !c.isSuspect && c.role !== 'MURDERER');
};

// Check if character is the murderer
export const isMurderer = (characterId) => {
  const char = CHARACTERS.find(c => c.id === characterId);
  return char?.role === 'MURDERER';
};

// ============================================
// LOGIN CODE MAPPING
// ============================================

export const LOGIN_CODE_MAP = {
  // Suspects + murderer
  'COURTPOET': 'char_alam',
  'BIGGINGER': 'char_elias',
  'BIRYANI': 'char_sukhans',
  'VIBECODE': 'char_priyanshu',
  'SHUTTERBUG': 'char_yash_s',
  'LOSALAMOS': 'char_pranav',
  'REDBULL': 'char_vadini',
  'LIZARDEGG': 'char_ishika',
  'ROMANTASY': 'char_neha',
  'DELULU': 'char_mohit',

  // Witnesses
  'NAILART': 'char_ashish',
  'POEMS23': 'char_sonia',
  'ROMANTIC': 'char_prakarsh',
  'BATMAN': 'char_mihir',
  'SECRETS': 'char_og_yash',
  'OFFICEMOM': 'char_amisha',
  'TRAFFIC': 'char_arush',
  'BALI': 'char_adi',
  'OPSTEAM': 'char_anusha_w',
  'SLAP': 'char_prerna',
  'GRIDS': 'char_vidi',
  'COMMITMSG': 'char_tejas',
  'PAGERDUTY': 'char_tauseef',
  'ANOMALY': 'char_shashwat',
  'OMW': 'char_tushar',
  'GAMES': 'char_kush',
  'CHILL': 'char_meenakshi',
  'MACHA': 'char_navya',
  'ENERGY': 'char_vipin',
  'FOODORDER': 'char_riya',
  '404': 'char_xans',
  'MINTS': 'char_bharatpreet'
};

// Validate login code and return character ID
export const validateLoginCode = (code) => {
  const upperCode = code.trim().toUpperCase();
  return LOGIN_CODE_MAP[upperCode] || null;
};

// ============================================
// HOST RUN SHEET
// ============================================
// The round-by-round script the host reads from during the live event. Rendered
// by HostPanel. `id` matches the round number so the panel can auto-highlight
// the entry for the current round; 'pregame' sits before Round 0.
// Each entry: setup (do before announcing) → announce (read aloud) → during →
// end (the transition cue).

export const HOST_SCRIPT = [
  {
    id: 'pregame',
    title: 'Pre-Game · Welcome',
    duration: '~5 min',
    setup: 'Before you start: confirm all 32 players have arrived and have their printed login-code cards. Have the three stacks of printed cards ready by round — Motives (Round 2), Evidence (Round 3), Revelations (Rounds 4 & 5).',
    announce: `"Welcome to the TripleSpeed Penthouse — 4th floor, Indiranagar. The night is May 23rd, 2026, and we're here for the Series B announcement party. By the end of the night, one of us is dead.

Ground rules. Your phone is your evidence kit — log in with the code on your card. When you receive a printed card later tonight, type the CODE, not the title, into the decoder. Codes only work in their assigned round. Don't show your phone to anyone. Your secrets stay yours. Stay in character. Lie. Mingle. Accuse. The host moves the rounds when the room is ready."`,
    during: 'Help anyone struggling with their login code. Make sure everyone has reached the grid hub before you advance to Round 0.',
    end: 'When all 32 are in, press the "+" button to begin Round 0.'
  },
  {
    id: 0,
    title: 'Round 0 · The Incident',
    duration: '10–15 min',
    setup: 'The Incident Report is unlocked by default. Nothing to distribute yet — players are getting their bearings.',
    announce: `"Round 0. The Incident. At 8:45 PM tonight, Nikhil — our Head of Marketing — collapsed on the balcony. He was pronounced dead at 9:02. All 32 of us are detained on-site for questioning by Inspector Reema Mathur.

Open the FILES tab. Read the Incident Report. Then open GUESTS — see who else is in this room with you tonight. Don't accuse anyone yet. Get the lay of the land. Mingle in character. We move to Round 1 in about 10 minutes."`,
    during: 'Walk the room. Make sure people have actually opened the Incident Report — first-time players sometimes miss the FILES tab. Encourage in-character introductions.',
    end: 'When the room feels warmed up, press "+" to advance to Round 1.'
  },
  {
    id: 1,
    title: 'Round 1 · Accusations',
    duration: '~15 min',
    setup: "No physical cards in this round — each player's accusation card is automatically revealed in their INTEL tab the moment Round 1 starts. 32 players, 10 accusations: every suspect is accused by 3–4 people.",
    announce: `"Round 1. Accusations. Each of you has been handed an accusation by another guest tonight — someone swears they saw a specific person do something suspicious. Open INTEL. Read your accusation.

What you do with it is your choice. Shout it across the room. Whisper it to one person. Use it as leverage. Pretend you never got one. Lie about who's accused. The CHAT tab is your investigation room — start working it. We move to Round 2 in 15 minutes."`,
    during: "Watch the chat. If it's quiet, single-out a player and ask 'who did you get?' to break the ice.",
    end: 'Press "+" to advance to Round 2.'
  },
  {
    id: 2,
    title: 'Round 2 · Motives',
    duration: '~15 min',
    setup: 'Hand out the 10 printed MOTIVE cards now. Each card has a unique code. Suggested distribution: hand each suspect their own motive card so they can decide whether to spin or hide it; sprinkle the rest among witnesses for cross-pollination.',
    announce: `"Round 2. Motives. Some of you just received a printed card. Open the decoder — the floating red button on the CLUES screen — and type the CODE, not the title. The motive will appear in your INTEL tab.

These ten motives are the reasons each of our nine suspects might have wanted Nikhil dead. If you got someone's motive card, you decide whether to share it, twist it, or sit on it. If you didn't get one, your job is to pry. We move to Round 3 in 15 minutes."`,
    during: "If anyone can't find the decoder: it's the floating red button on the CLUES screen.",
    end: 'Press "+" to advance to Round 3. Forensics next.'
  },
  {
    id: 3,
    title: 'Round 3 · Evidence',
    duration: '~15–20 min',
    setup: `1) In this panel, press "🔬 Round 3: Evidence" to unlock the Toxicology Report and Funding Round Dossier.
2) Hand out the 7 printed EVIDENCE cards.
3) Press "🗳️ OPEN VOTING" — first vote is now live.`,
    announce: `"Round 3. Evidence. Forensics is in. Open FILES — Toxicology and the Funding Dossier are now unlocked. Cause of death: acute sodium azide poisoning. Delivered through Nikhil's personal vape. Some of you also just received Evidence codes — enter them in the decoder.

Voting is now OPEN. Cast your suspicion. You can change your vote at any point before voting closes."`,
    during: 'This is when the room starts theorizing in earnest. Stay quiet, let them work. Glance at the vote tally if you have it visible.',
    end: 'Press "+" to advance to Round 4. The story is about to flip.'
  },
  {
    id: 4,
    title: 'Round 4 · Revelations',
    duration: '~15–20 min',
    setup: `1) Press "💀 Round 4: Revelations" to unlock Medical Records, Insurance Policy Summary, and SEBI Inquiry Extract.
2) Hand out the first 4 REVELATION cards (the ones marked Round 4).`,
    announce: `"Round 4. Revelations. Three new files are open: Nikhil's medical records, his insurance policies, and an extract from a SEBI inquiry. New revelation codes are in some of your hands.

The story you thought you knew is changing. Nikhil was dying. Nikhil was about to be indicted for fraud. Talk amongst yourselves. We move to Round 5 in 15 minutes."`,
    during: 'Players will start connecting cancer + fraud + insurance. Watch the chat — let the dominoes fall.',
    end: 'Press "+" to advance to Round 5. Last chance to change minds.'
  },
  {
    id: 5,
    title: 'Round 5 · Finale',
    duration: '~10 min',
    setup: `1) Hand out the final 2 REVELATION cards (the ones marked Round 5) — the HR access trail and Nikhil's unsent voice memo.
2) Optionally press "📊 SHOW VOTE RESULTS" so the room sees the standings before final lock-in.`,
    announce: '"Round 5. The last bombshells. Two final cards have been handed out. Out-of-hours HR access logs from January. An unsent voice memo from Nikhil. Take 10 minutes — talk it through in CHAT. When voting closes, you cannot change your vote."',
    during: 'Build dramatic tension. About a minute before time, call out "voting closes in 60 seconds."',
    end: 'Press "🔒 CLOSE VOTING". Then press "+" to advance to Round 6.'
  },
  {
    id: 6,
    title: 'Round 6 · The Reveal',
    duration: '~5 min',
    setup: 'Make sure "📊 SHOW VOTE RESULTS" is on. Pause for effect.',
    announce: `"Round 6. The Reveal. The votes are in." — read the top 3 vote-getters aloud, slowly.

"But before we name a killer, there is one thing you do not know. Nikhil planned this. He had four months to live and a fraud case waiting to bury his name. He chose a different ending — and he found someone willing to help him.

The murderer is in this room. The murderer was holding the cartridge. The murderer is — " pause — "Alam."`,
    during: `Press "🎭 REVEAL MURDERER" in this panel. Every phone except Alam's flashes red and names him. Alam's screen flips to the OutroSplash with one final code unlocked.`,
    end: 'Turn to Alam. "Your phone has one last code on it. Read it aloud." After Alam reads the confession, press "🎬 END GAME" to send everyone to the outro. Debrief in person.'
  }
];
