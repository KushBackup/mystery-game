// --- GAME DATA: THE ROHAN SHARMA MURDER MYSTERY ---

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
// isSuspect: true for the 10 main suspects

export const CHARACTERS = [
  // === THE VICTIM (not playable, for reference) ===
  // Rohan Sharma - deceased

  // === THE MURDERER ===
  {
    id: 'char_esha',
    name: "Esha",
    role: "MURDERER",
    profession: "Design Scientist",
    bio: "Brilliant, smart, genius - with a passion for mathematics and patterns others can't see.",
    quirk: "Possesses an extraordinary talent for detecting mathematical patterns in seemingly chaotic systems. She can look at random data sets, crowd movements, or even conversation flows and identify underlying Fibonacci sequences, prime number distributions, or fractal patterns that others miss entirely. This mathematical intuition extends to strategic planning—she can calculate probabilities and optimize outcomes with frightening precision.",
    secret: "You know the organizers of this event... intimately. You are Rohan's wife.",
    neverDo: "Lie - but sometimes the truth is just a matter of perspective.",
    isSuspect: true,
    motive: "Financial control, years of emotional abuse, and the need to secure your future before his cancer took everything.",
    timeline: "5:00 PM - Arrived with supplies. 8:18 PM - Sipped from Rohan's glass. 8:45 PM - First to scream.",
    code: "ESHA_D"
  },

  // === THE 9 OTHER SUSPECTS ===
  {
    id: 'char_rea',
    name: "Re'a",
    role: "SUSPECT",
    profession: "Animator / Artist / Vampire",
    bio: "Cool Class Clown (CCC) - A quirky digital artist who specializes in dark, surreal animations.",
    quirk: "Maintains an unbroken streak of playing LinkedIn's daily puzzle games—Queens, Pinpoint, and Crossword—for over 847 consecutive days. Has created elaborate spreadsheets tracking her scores and patterns. Also claims to be a vampire who can only work at night, insisting she has 'photosensitive creative energy' and can sense the emotional temperature of any room she enters within seconds.",
    secret: "My cat is actually a cow-shark hybrid and not a cat. Also, I hear things others don't.",
    neverDo: "Never judge my cat for eating cockroaches.",
    isSuspect: true,
    motive: "Rohan spread plagiarism rumors that destroyed your animation career. You had to rebuild from nothing in a different city.",
    timeline: "7:15 PM - Arrived. 8:10 PM - Near the bar area. 8:30 PM - Making dark jokes about murder.",
    code: "REA_A"
  },
  {
    id: 'char_govind',
    name: "Govind",
    role: "SUSPECT",
    profession: "House Husband",
    bio: "Caring, loving, providing - A devoted partner who manages the household with precision.",
    quirk: "Has an almost obsessive talent for wedding planning and event coordination. Can mentally organize seating charts for 300+ guests while considering family dynamics, dietary restrictions, and personality conflicts. Keeps detailed spreadsheets of vendor contacts, timeline templates, and decorative themes. Friends joke that he can plan a perfect wedding in 48 hours—and he's proven it twice for last-minute requests.",
    secret: "I really want to have kids. But there's more - Rohan nearly destroyed the woman I love.",
    neverDo: "I really want to have kids - it's actually something I desperately want.",
    isSuspect: true,
    motive: "Rohan dated your girlfriend years ago, treated her terribly, and shared intimate photos of her online. She nearly didn't survive.",
    timeline: "7:00 PM - Arrived with girlfriend. 8:05 PM - Getting napkins near Rohan's booth. 8:20 PM - Standing behind booth.",
    code: "GOVIND_H"
  },
  {
    id: 'char_andrew',
    name: "Andrew Pereira",
    role: "SUSPECT",
    profession: "Journalist",
    bio: "Curious - An investigative journalist who lives for the truth, no matter the cost.",
    quirk: "Despite his serious, investigative demeanor, he's an unexpectedly phenomenal dancer—trained in salsa, bachata, and ballroom since childhood. At social events, people are shocked when he transforms from studious journalist to confident dance floor presence. He often jokes that dancing teaches you to read body language and lead conversations, skills that serve him well in investigations. Also genuinely believes he's the real-life version of Tintin.",
    secret: "I am Tintin. And I have evidence that could have sent Rohan to prison.",
    neverDo: "Jump from a height. Ironic, given how many stories I've broken.",
    isSuspect: true,
    motive: "Your exposé on Rohan's data manipulation was buried by his lawyers. They nearly bankrupted your publication and ended your career.",
    timeline: "7:30 PM - Arrived late. 8:10 PM - Cornered Rohan for an interview. 8:25 PM - Taking notes on phone.",
    code: "ANDREW_P"
  },
  {
    id: 'char_fatema',
    name: "Fatema",
    role: "SUSPECT",
    profession: "Artist",
    bio: "Friendly and also mysterious, sucker for dark humor, eventful - with art that explores hidden violence.",
    quirk: "Experiences auditory phenomena she describes as 'hearing voices in silence'—whispers, music, or conversations that exist only for her. Conversely, in loud, chaotic environments, she has a remarkable ability to become completely unnoticed, like a wallflower that blends into the architecture. People forget she's in the room, allowing her to observe without being observed. She channels these experiences into haunting, emotionally raw artwork.",
    secret: "Underneath my fringe, lies a scarring truth from my time with Rohan.",
    neverDo: "Whack a mole, pet a turkey, tiger, or tribe member. Some things are sacred.",
    isSuspect: true,
    motive: "Rohan was abusive during your brief relationship. When you left, he destroyed your art career by canceling your first gallery show.",
    timeline: "7:00 PM - Arrived early. 8:00-8:45 PM - Standing against wall, sketching, watching everything.",
    code: "FATEMA_A"
  },
  {
    id: 'char_surya',
    name: "Surya Peket",
    role: "SUSPECT",
    profession: "Software Developer",
    bio: "Lazy, Chill and Alcoholic - A developer who appears perpetually drunk but never actually impaired.",
    quirk: "Possesses what friends call an 'anti-hangover superpower'—the ability to consume alarming quantities of alcohol and wake up the next morning completely functional, clear-headed, and ready to code. Can drink most people under the table while maintaining coherent technical conversations. His blood alcohol tolerance is legendary, functioning at levels that would incapacitate others without showing visible signs of intoxication.",
    secret: "The bike trip to Kerala was actually meeting with a lawyer about suing Rohan.",
    neverDo: "Cheat on my girlfriend. Some lines I won't cross.",
    isSuspect: true,
    motive: "Rohan fired you the day before your equity vested - stealing ₹2 crores you'd earned with 80-hour weeks for two years.",
    timeline: "7:00 PM - At bar, drinking heavily. 8:15 PM - Stumbled into bar counter. 8:30 PM - Very drunk (or acting?).",
    code: "SURYA_S"
  },
  {
    id: 'char_anusha',
    name: "Anusha",
    role: "SUSPECT",
    profession: "Audio Description Writer",
    bio: "Friendly, optimistic, lazy - Works in accessibility, with encyclopedic pop culture knowledge.",
    quirk: "Has developed an almost supernatural ability to identify songs within the first second of audio—before lyrics, before chorus, often just from the opening instrumental note or ambient sound. Her trained ear from years of audio description work allows her to detect subtle acoustic details, background music in films, and obscure B-sides from bands. Friends regularly challenge her and she has a 94% accuracy rate across decades of music.",
    secret: "I have a fan Instagram account I use more than my own - dedicated to documenting Rohan's company's harms.",
    neverDo: "Eat a creepy crawlie. Everything else is negotiable.",
    isSuspect: true,
    motive: "You flagged harmful content at Rohan's company. He overruled you. People got hurt. When you went to HR, you were 'made redundant.'",
    timeline: "7:20 PM - Arrived. 8:00-8:40 PM - Positioned with view of bar, speaking into phone.",
    code: "ANUSHA_A"
  },
  {
    id: 'char_chaaya',
    name: "Chaaya",
    role: "SUSPECT",
    profession: "Artist / Illustrator",
    bio: "Quiet, Creative, Nerd - An illustrator known for beautiful, haunting work about memory and loss.",
    quirk: "Masters the notoriously difficult art of sourdough bread baking with methodical precision. Maintains a sourdough starter she's kept alive for three years, naming it 'Douglas.' The patience required for proper fermentation—waiting days for the perfect rise—mirrors her approach to art and life. Each loaf is photographed and documented. The same precision that creates perfect bread creates hauntingly beautiful illustrations.",
    secret: "I like pineapples on pizza. But really, I've been in therapy for a decade because of what Rohan did.",
    neverDo: "Burpees. Physical and emotional limits exist for a reason.",
    isSuspect: true,
    motive: "Rohan bullied you mercilessly in high school - mocking your weight, your art, your silence. He destroyed your art school portfolio.",
    timeline: "7:10 PM - Arrived quietly. 8:00-8:45 PM - Making rounds, sketching, always watching Rohan.",
    code: "CHAAYA_A"
  },
  {
    id: 'char_tanishka',
    name: "Tanishka Sheokand",
    role: "SUSPECT",
    profession: "Fashion Designer",
    bio: "Extrovert, explorer, spontaneous - Creates safe spaces wherever she goes.",
    quirk: "Has an inexplicable quality that makes people feel safe sharing their deepest secrets within minutes of meeting her. Creates judgment-free zones wherever she goes—friends, strangers, even acquaintances find themselves confessing things they've never told therapists. She holds dozens of secrets, maintaining an iron code of confidentiality. It's as if she radiates trustworthiness and acceptance, making vulnerability feel safe.",
    secret: "I'm switching my job and don't know what's next. But I needed the lawsuit against Rohan to succeed first.",
    neverDo: "Reveal secrets of people if they're extremely personal.",
    isSuspect: true,
    motive: "Rohan invested in your fashion line, then pulled funding when a competitor offered more. You lost everything - savings, team, reputation.",
    timeline: "7:00 PM - Arrived energetically. 8:16 PM - Hugged Rohan after speech. 8:20 PM - Private conversations with everyone.",
    code: "TANISHKA_S"
  },
  {
    id: 'char_poshika',
    name: "Dr. Poshika Singh",
    role: "SUSPECT",
    profession: "Lead Veterinarian Surgeon",
    bio: "Observant, Steady, Exact - A surgeon with uncanny ability to distinguish accident from intention.",
    quirk: "Possesses an unsettling, almost instinctual ability to distinguish between accidental injuries and deliberate harm through pattern recognition. Years of veterinary surgery have trained her eye to spot the subtle differences—the angle of a wound, the distribution of trauma, the timing of injuries. This skill extends beyond animals to reading human behavior, detecting deception in body language with surgical precision.",
    secret: "You once treated an animal whose injuries implicated someone powerful. You documented only what was medically necessary. You live in guilt.",
    neverDo: "Never lie about medical facts. That line is sacred.",
    isSuspect: true,
    motive: "Rohan deliberately hurt an animal and brought it to your clinic. When you realized the truth, he threatened your license with fabricated complaints.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Watching Rohan's drink with surgical focus. Strangely calm at his collapse.",
    code: "POSHIKA_V"
  },

  // === THE 22 WITNESSES ===
  {
    id: 'char_anish',
    name: "Anish Shirwant",
    role: "WITNESS",
    profession: "Industrialist",
    bio: "I'm into horror - An analytical industrialist with a dark entertainment taste.",
    quirk: "Has watched so many horror films that he can predict plot twists, jump scares, and killer reveals with uncanny accuracy within the first 15 minutes. Analyzes horror movie logic, trope patterns, and directorial techniques obsessively. At movie nights, friends both love and hate his running commentary as he correctly calls every plot point before it happens. His analytical mind treats horror narratives like business problems to be solved.",
    secret: "I guilt eat junk food during my drive home. My wife doesn't know about the bad stuff she likes that I secretly eat.",
    neverDo: "Cheat on my wife. That's the one line.",
    isSuspect: false,
    motive: "Rohan's company sold fake engagement metrics to your factory's marketing team, costing lakhs.",
    timeline: "7:00 PM - Arrived. 8:00 PM - At bar, drinking. 8:45 PM - Witnessed collapse.",
    code: "ANISH_S"
  },
  {
    id: 'char_ishank',
    name: "Ishank Mahale",
    role: "WITNESS",
    profession: "Digital Marketing Professional",
    bio: "Tech-savvy, Introverted, critical-thinker - Sees everything, says little.",
    quirk: "Despite being soft-spoken, can perfectly mimic the deep, distorted Venom voice, unsettling everyone at parties. His ADHD manifests as serial hobby obsession—currently into sport shooting and gun mechanics, previously radio signal interception, wireless packet sniffing, flight tracking, and cryptography. Each hobby is pursued with intense focus for months before moving to the next. His apartment is a museum of abandoned but thoroughly mastered skills.",
    secret: "Used to intercept radio signals and catch flight data. Once caught Vijay Mallya's flight. Also hijacked wireless data packets for fun.",
    neverDo: "Take undue advantage of others, or consume alcohol.",
    isSuspect: false,
    motive: "Rohan stole your client list when you worked at the same agency.",
    timeline: "7:10 PM - Arrived. 8:00-8:45 PM - Observing from corner, taking mental notes.",
    code: "ISHANK_M"
  },
  {
    id: 'char_shreyash',
    name: "Shreyash Shinde",
    role: "WITNESS",
    profession: "Student",
    bio: "Curious, Precise, humble - A versatile student who adapts to any situation.",
    quirk: "Displays remarkable versatility across sports—can competently play cricket, football, basketball, badminton, table tennis, and volleyball without specializing in any. Not the best at any single sport, but reliably good at all of them. This adaptability extends to life—he can fit into any social group, pick up new skills quickly, and adjust to changing circumstances with impressive ease. The jack-of-all-trades, master of none, but often better than a master of one.",
    secret: "I say 'no worries' while mentally panicking in lowercase.",
    neverDo: "Trust autocorrect completely.",
    isSuspect: false,
    motive: "Rohan was your college senior and hazed you mercilessly during orientation week.",
    timeline: "7:30 PM - Arrived nervously. 8:00-8:45 PM - Staying close to exit.",
    code: "SHREYASH_S"
  },
  {
    id: 'char_rashmi',
    name: "Rashmi Shirwant",
    role: "WITNESS",
    profession: "Eye Doctor",
    bio: "Saucy, Quick thinker, Smile for life - An ophthalmologist who sees through masks.",
    quirk: "Her ophthalmology training has sharpened her observational skills to frightening levels—she can detect micro-expressions, pupil dilation, and subtle eye movements that reveal emotional states and deception. Reading eyes professionally has taught her to read souls. She can tell when someone is lying, scared, or hiding something just by watching their gaze patterns. Friends say she has 'x-ray vision' for emotional states.",
    secret: "Trying truffles and late night munchies. Some vices are harmless.",
    neverDo: "Get on another roller coaster. Once was enough.",
    isSuspect: false,
    motive: "Rohan spread rumors you'd botched a procedure, costing you patients.",
    timeline: "7:00 PM - Arrived with Anish. 8:47 PM - First doctor to Rohan's side.",
    code: "RASHMI_S"
  },
  {
    id: 'char_anubhav',
    name: "Anubhav Raina",
    role: "WITNESS",
    profession: "Self-Employed",
    bio: "Curious, talkative, thinker - A philosophical woodworker who asks hard questions.",
    quirk: "Creates stunning custom furniture from reclaimed wood, transforming discarded materials into functional art. His workshop is filled with hand tools—chisels, planes, saws—and the smell of fresh sawdust. Each piece takes weeks or months, requiring patience and precision. He treats woodworking as meditation, believing that you can't force wood to bend to your will—you must work with its natural grain, a philosophy he applies to all of life.",
    secret: "Murder. (It was my joke answer to 'what would you never do.' Suspicious now, isn't it?)",
    neverDo: "Force things. Patience is everything.",
    isSuspect: false,
    motive: "Rohan sabotaged your woodworking business with fake negative reviews.",
    timeline: "7:00 PM - At main bar. 8:00-8:45 PM - Asking probing questions about Rohan's change.",
    code: "ANUBHAV_R"
  },
  {
    id: 'char_antara',
    name: "Antara Majumdar",
    role: "WITNESS",
    profession: "Self-Employed",
    bio: "Happy, proud, friendly - Running her own operations business with pride.",
    quirk: "Has an almost supernatural ability to optimize operations and logistics. Can look at any business process and immediately identify bottlenecks, inefficiencies, and opportunities for streamlining. Friends joke that she can organize a wedding, a corporate merger, and a cross-country move simultaneously while color-coding spreadsheets and optimizing delivery routes. Her mind works like a logistics algorithm, always calculating the most efficient path.",
    secret: "My teeth aren't real. Everyone has something they're hiding.",
    neverDo: "Needle people. Kindness matters.",
    isSuspect: false,
    motive: "Rohan outed a personal secret at a party years ago, humiliating you publicly.",
    timeline: "7:15 PM - Arrived. 8:00-8:45 PM - Cheerful facade, clearly uncomfortable.",
    code: "ANTARA_M"
  },
  {
    id: 'char_gautam',
    name: "Gautam Borkar",
    role: "WITNESS",
    profession: "Visual Artist / Filmmaker",
    bio: "Observant, calm, spontaneous - A filmmaker who captures what others miss.",
    quirk: "Practices free diving and can descend 20 meters underwater on a single breath, remaining submerged for over two minutes in complete calm. This requires extreme breath control, mental discipline, and comfort with pressure—skills that translate to his filmmaking. Underwater, there's no sound, no distraction, just observation. He brings this meditative focus to his camera work, capturing moments others miss in their rush.",
    secret: "I listen to Taylor Swift songs. Don't tell anyone.",
    neverDo: "Fall for someone who hates dogs. Dealbreaker.",
    isSuspect: false,
    motive: "Rohan plagiarized your short film concept and sold it to a streaming platform.",
    timeline: "7:00 PM - Arrived with camera. 8:00-8:45 PM - Filming 'b-roll' on phone.",
    code: "GAUTAM_B"
  },
  {
    id: 'char_shannon',
    name: "Shannon D'Cruz",
    role: "WITNESS",
    profession: "Private Consultant",
    bio: "Mr Skeptical - A consultant who trusts nothing without verification.",
    quirk: "Embodies professional skepticism to an almost pathological degree. Questions every claim, double-checks every fact, and trusts nothing without empirical verification. Reads the fine print on restaurant menus. Fact-checks casual conversation. Maintains a mental database of logical fallacies and cognitive biases, calling them out in real-time. Exhausting to argue with, invaluable as a consultant. If something seems too good to be true, he'll prove why it is.",
    secret: "Given it was a secret, it wouldn't have been whispered to start with.",
    neverDo: "Having already sworn never to reveal that, it won't be feasible for me to say...",
    isSuspect: false,
    motive: "Rohan hired your firm, then refused to pay the final invoice claiming unsatisfactory work.",
    timeline: "7:20 PM - Arrived. 8:00-8:45 PM - Maintaining professional skepticism throughout.",
    code: "SHANNON_D"
  },
  {
    id: 'char_anika',
    name: "Anika",
    role: "WITNESS",
    profession: "Singer / Vocal Coach / Life Coach",
    bio: "Confident, fun, goofy - Turns weakness into strength through music and coaching.",
    quirk: "Has an extraordinary gift for identifying people's insecurities and transforming them into sources of power. As a vocal and life coach, she teaches clients to embrace vocal 'flaws' as unique signatures, to use nervousness as performance energy. Her own career started from a misunderstanding that she turned into opportunity. She's a natural teacher who sees potential where others see limitation, believing every weakness is just an untrained strength.",
    secret: "I got into my career by someone misunderstanding what I said to them. Fun origin story!",
    neverDo: "Fall for a man who isn't emotionally intelligent.",
    isSuspect: false,
    motive: "Rohan was an ex who ghosted you after you introduced him to industry contacts he exploited.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Coaching others on emotional resilience.",
    code: "ANIKA_L"
  },
  {
    id: 'char_amrit',
    name: "Amrit",
    role: "WITNESS",
    profession: "Data Analyst",
    bio: "Eccentric mellow nerd - Analyzes patterns in everything, including people.",
    quirk: "Possesses an inexplicable tolerance for spicy food that borders on superhuman. Can eat raw ghost peppers, habaneros, and Carolina Reapers without visible distress while others around him weep and gasp. His capsaicin receptors seem immune to pain. At restaurants, he's banned from spice challenges for making them look too easy. This same tolerance for discomfort extends to his data work—he can stare at spreadsheets for hours without mental fatigue.",
    secret: "I'm a huge Hannah Montana fan. The best of both worlds.",
    neverDo: "Bend and touch my toes. Some limits are physical.",
    isSuspect: false,
    motive: "Rohan took credit for your data model that made his company millions.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Analyzing everyone's behavior patterns.",
    code: "AMRIT_D"
  },
  {
    id: 'char_pallavi',
    name: "Pallavi",
    role: "WITNESS",
    profession: "Art Conservator",
    bio: "Meticulous, observant, discreet - Restores masterpieces with surgical precision.",
    quirk: "Can create pixel-perfect replicas of famous paintings that experts struggle to distinguish from originals. Her art conservation training taught her to analyze brush strokes, paint composition, canvas aging, and layering techniques. Given enough time and materials, she can reproduce a Van Gogh or Monet so accurately that even forensic analysis would be challenged. This skill walks an ethical tightrope—restoration or forgery depends on intent.",
    secret: "I have a stolen masterpiece in my bedroom. It's complicated.",
    neverDo: "Never touch an artifact without gloves.",
    isSuspect: false,
    motive: "Rohan 'commissioned' a restoration, refused to pay, and kept the piece.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Meticulous attention to physical evidence around bar.",
    code: "PALLAVI_A"
  },
  {
    id: 'char_sukriti',
    name: "Sukriti",
    role: "WITNESS",
    profession: "Healthcare Strategist",
    bio: "Insightful, composed, resourceful - Runs mental scenarios constantly.",
    quirk: "Notices microscopic details others miss—a changed hairstyle, a new scar, inconsistencies in someone's story told twice. Her mind constantly runs hypothetical 'what-if' scenarios, gaming out possibilities like a chess player seeing fifteen moves ahead. In any situation, she's already calculated the five most likely outcomes and her response to each. This makes her an exceptional strategist but also someone who struggles to turn off the analysis and just live in the moment.",
    secret: "I trust very few people - and that's intentional.",
    neverDo: "Gate crash a party or post selfies on Instagram.",
    isSuspect: false,
    motive: "Rohan used insider information from your healthcare startup to tank it.",
    timeline: "7:15 PM - Arrived. 8:00-8:45 PM - Running mental scenarios, trusting no one.",
    code: "SUKRITI_H"
  },
  {
    id: 'char_arjun',
    name: "Arjun Pathni",
    role: "WITNESS",
    profession: "This and That",
    bio: "Patient, Impulsive and Bashful - A jack of all trades with unpredictable energy.",
    quirk: "Has turned his humor into an art form by 'coaching bathroom singers'—people who only sing in the shower. Claims certification from the 'United Bathrooms Association' and offers tips on acoustics, echo optimization, and tile resonance. It's partly a joke, partly genuine advice. His patient teaching style mixed with impulsive energy makes him surprisingly effective at building confidence. He's the guy you call when you need random expertise delivered with sarcastic charm.",
    secret: "I have brought a gun to a knife fight. It happened.",
    neverDo: "Bring a gun to a knife fight. (Okay, I did it once.)",
    isSuspect: false,
    motive: "Rohan publicly humiliated you at a karaoke event, mocking your singing.",
    timeline: "7:00 PM - Arrived energetically. 8:00-8:45 PM - Making sarcastic comments about crocodile tears.",
    code: "ARJUN_P"
  },
  {
    id: 'char_sneha',
    name: "Sneha",
    role: "WITNESS",
    profession: "Strategy Consultant",
    bio: "Outspoken, observant, witty - A strategist who sees plays before they're made.",
    quirk: "Sews all her own clothing from scratch, refusing to buy mass-produced fashion. Owns a professional-grade sewing machine and maintains a fabric collection organized by weight, texture, and color. Can design, pattern, cut, and construct a complete outfit in a weekend. This need for complete creative control extends to her consulting work—she doesn't just advise, she rebuilds entire systems from the ground up according to her specifications.",
    secret: "I've shoplifted multiple times. We all have our phases.",
    neverDo: "Snort anything. Lines I won't cross.",
    isSuspect: false,
    motive: "Rohan poached your entire team for his company, killing your startup.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Cataloging everyone's reactions.",
    code: "SNEHA_S"
  },
  {
    id: 'char_soham',
    name: "Soham",
    role: "WITNESS",
    profession: "Disaster and Climate Change Management",
    bio: "Thoughtful, patient, observant - Watches people like he watches birds.",
    quirk: "Dedicated birdwatcher who can identify species by silhouette, call, or flight pattern from hundreds of meters away. Wakes at dawn for optimal observation windows, maintains detailed logs of sightings, and can sit motionless for hours waiting for rare species. This same patience and observational discipline extends to people—he watches human behavior with the same quiet, analytical attention he gives birds. Patient, methodical, missing nothing.",
    secret: "My bag was tested for explosives at Frankfurt Airport. Long story.",
    neverDo: "Sky diving. Some risks aren't worth it.",
    isSuspect: false,
    motive: "Rohan's company funded climate disinformation you've spent years fighting.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Patient people-watching from a quiet corner.",
    code: "SOHAM_D"
  },
  {
    id: 'char_nikita',
    name: "Dr. Nikita Vaidya",
    role: "WITNESS",
    profession: "Orthopedic Physiotherapist",
    bio: "Cheerful, funny and smart - A healer with a great sense of humor.",
    quirk: "Possesses a beautiful singing voice that she uses therapeutically with patients. Believes music and laughter are as healing as physical therapy. Often sings during treatment sessions to help patients relax, distract from pain, or maintain rhythm during exercises. Her cheerful demeanor and vocal talent create a treatment environment where healing feels less clinical and more human. Patients leave sessions feeling physically and emotionally better.",
    secret: "My real name is Vaidehi. Nikita is just easier.",
    neverDo: "Lie. Honesty in medicine is everything.",
    isSuspect: false,
    motive: "Rohan injured himself at a gym you managed, then sued you for 'negligence.'",
    timeline: "7:20 PM - Arrived. 8:47 PM - Second doctor to Rohan's side, attempted CPR.",
    code: "NIKITA_V"
  },
  {
    id: 'char_shardul',
    name: "Shardul Kulkarni",
    role: "WITNESS",
    profession: "Project Management Consultant",
    bio: "Kind, Witty and Street Smart - Manages projects and people with equal skill.",
    quirk: "Master of voice mimicry and modulation, able to impersonate celebrities, politicians, and colleagues with uncanny accuracy. Can shift accents mid-sentence, alter pitch and tone dramatically, and create entirely new vocal characters. At parties, he performs entire conversations between multiple people by himself. This skill makes him dangerously effective in negotiations—he can mirror someone's speech patterns to build instant rapport or throw them off-balance.",
    secret: "I am super rich, but my money is blocked in disputed lands.",
    neverDo: "Betray someone. Loyalty is everything.",
    isSuspect: false,
    motive: "Rohan outbid you on multiple projects using insider information.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Networking aggressively, perhaps too aggressively.",
    code: "SHARDUL_K"
  },
  {
    id: 'char_srinjan',
    name: "Srinjan Ghosh",
    role: "WITNESS",
    profession: "Lawyer",
    bio: "Honest, competitive, lazy - A lawyer who fights hard then rests harder.",
    quirk: "Obsessively collects unusual and quirky pens—fountain pens with gold nibs, pens shaped like miniature swords, vintage 1940s writing instruments, pens that write in invisible ink. Has over 200 in his collection, each catalogued with purchase date and history. Believes every legal document deserves the right pen, choosing instruments based on the importance and nature of what he's signing. A contract isn't just words—it's the ritual of the signature.",
    secret: "I crashed the car once. We don't talk about it.",
    neverDo: "Go kayaking at night again. Never again.",
    isSuspect: false,
    motive: "Rohan was a client who fired you after you won the case, refusing to pay.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Mentally preparing cross-examinations for everyone.",
    code: "SRINJAN_G"
  },
  {
    id: 'char_rahul',
    name: "Rahul Srivastava",
    role: "WITNESS",
    profession: "Law Student",
    bio: "Quirky, Charismatic, Layered - A future lawyer with magic in his hands.",
    quirk: "Performs sophisticated card magic and sleight-of-hand tricks that genuinely baffle audiences. Can control card locations, force selections, and execute false shuffles so smoothly that magicians struggle to catch his technique. Learned initially for casino advantage but now performs for entertainment. The misdirection, psychological manipulation, and performance skills translate perfectly to courtroom work—making juries see what he wants them to see.",
    secret: "I'm not the only Rahul here *points at head*. The Dark Side beckons with every trick.",
    neverDo: "Black Magic. The Dark Side is strong but I shall never answer.",
    isSuspect: false,
    motive: "Rohan sabotaged your moot court competition with false evidence.",
    timeline: "7:15 PM - Arrived. 8:00-8:45 PM - Doing card tricks to ease tension.",
    code: "RAHUL_S"
  },
  {
    id: 'char_akash',
    name: "Dr. Akash Halankar",
    role: "WITNESS",
    profession: "Maritime Doctor",
    bio: "Observant, calm, calculated - Catches lies instantly through behavioral tells.",
    quirk: "Has developed an almost supernatural ability to detect deception by observing micro-changes in breathing patterns, eye movements, and subtle behavioral breaks. Years of medical observation trained him to notice when someone's physiological responses don't match their words. Can tell when patients lie about pain levels, when colleagues fabricate excuses, when anyone tries to deceive him. It's made him valuable and deeply lonely—knowing too much truth.",
    secret: "Once falsified a medical record to save someone powerful. Now living in exile in Goa.",
    neverDo: "Refuse treatment to anyone. The oath matters.",
    isSuspect: false,
    motive: "Rohan threatened to expose your past incident if you didn't sign a fraudulent document.",
    timeline: "7:00 PM - Arrived. 8:47 PM - Third doctor to Rohan, assisted with CPR.",
    code: "AKASH_H"
  },
  {
    id: 'char_bharath',
    name: "Bharath Raj",
    role: "WITNESS",
    profession: "Student",
    bio: "Witty, stubborn, antisocial - Makes people comfortable despite preferring solitude.",
    quirk: "Displays exceptional boat handling skills and water navigation despite his antisocial tendencies. Feels most at peace on the water where human interaction is optional. Paradoxically, despite preferring solitude, people feel immediately comfortable around him—his steady, undemanding presence creates safe social spaces. He doesn't force conversation but listens well when others need to talk. Comfortable silence is his specialty.",
    secret: "I'm good at boat handling. Sometimes that's all you need to know.",
    neverDo: "Kill someone. Obviously.",
    isSuspect: false,
    motive: "Rohan's bullying during a summer internship drove you to drop out.",
    timeline: "7:00 PM - Arrived. 8:00-8:45 PM - Staying near the edges, observing.",
    code: "BHARATH_R"
  },
  {
    id: 'char_adish',
    name: "Adish Jha",
    role: "WITNESS",
    profession: "AVP Marketing",
    bio: "I am Awesome - Confidence personified, with a secret identity.",
    quirk: "Skilled guitarist who performs at local venues and open mic nights, but insists his musical career is merely a cover identity. Genuinely, unironically believes he is Batman—has the gadgets, the attitude, the mysterious disappearances. Friends can't tell if it's an elaborate joke or genuine delusion. Either way, his confidence is unshakeable. When asked about his secret identity, he'll tell you the guitar is just for maintaining his cover. He's that committed to the bit.",
    secret: "I am Batman. The guitar is just a cover.",
    neverDo: "Bungee Jumping. Not all heroes leap.",
    isSuspect: false,
    motive: "Rohan took credit for a marketing campaign that won your company a major award.",
    timeline: "7:30 PM - Arrived. 8:00-8:45 PM - Projecting confidence, secretly seething.",
    code: "ADISH_J"
  }
];

// ============================================
// ACCUSATION CLUES (Round 1)
// 10 accusations, pre-assigned to players
// ============================================

export const ACCUSATION_CLUES = [
  {
    id: 'acc_esha',
    code: "ACCUSE_ESHA",
    targetSuspect: 'char_esha',
    targetName: "Esha",
    title: "Suspicious Behavior: Esha",
    accusation: "I saw Esha whispering intensely with Rohan near the storage area around 8:10 PM. She looked angry, and he looked... guilty? When they noticed me watching, they immediately separated and pretended nothing happened.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_anish', 'char_ishank', 'char_shreyash']
  },
  {
    id: 'acc_rea',
    code: "ACCUSE_REA",
    targetSuspect: 'char_rea',
    targetName: "Re'a",
    title: "Suspicious Behavior: Re'a",
    accusation: "I noticed Re'a near the bar right after Rohan put down his drink. They were pretending to look at their phone, but they weren't actually typing anything—just hovering near his glass with this strange smile.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_govind', 'char_rashmi', 'char_anubhav']
  },
  {
    id: 'acc_govind',
    code: "ACCUSE_GOVIND",
    targetSuspect: 'char_govind',
    targetName: "Govind",
    title: "Suspicious Behavior: Govind",
    accusation: "Govind was definitely near Rohan's booth when Rohan left to talk to other guests. His girlfriend tried to pull him away, but he lingered there for almost a minute, just staring at the unattended drink.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_antara', 'char_gautam', 'char_shannon']
  },
  {
    id: 'acc_andrew',
    code: "ACCUSE_ANDREW",
    targetSuspect: 'char_andrew',
    targetName: "Andrew Pereira",
    title: "Suspicious Behavior: Andrew",
    accusation: "Andrew literally had his phone out, recording everything. At one point, I saw him ask Rohan to 'step aside for a quick chat.' They went near the storage room, and Rohan looked very uncomfortable when they came back.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_anika', 'char_amrit', 'char_pallavi']
  },
  {
    id: 'acc_fatema',
    code: "ACCUSE_FATEMA",
    targetSuspect: 'char_fatema',
    targetName: "Fatema",
    title: "Suspicious Behavior: Fatema",
    accusation: "Fatema barely said a word all night, just watched everyone like she was cataloging them. When Rohan left his drink on the booth table, she was the only one facing that direction. And she was smiling.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_sukriti', 'char_arjun', 'char_sneha']
  },
  {
    id: 'acc_surya',
    code: "ACCUSE_SURYA",
    targetSuspect: 'char_surya',
    targetName: "Surya Peket",
    title: "Suspicious Behavior: Surya",
    accusation: "Surya was hammered, or at least acting like it. He literally stumbled into the bar right next to where Rohan's drink was sitting. Classic misdirection, if you ask me. His hand definitely brushed the glass.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_soham', 'char_nikita', 'char_shardul']
  },
  {
    id: 'acc_anusha',
    code: "ACCUSE_ANUSHA",
    targetSuspect: 'char_anusha',
    targetName: "Anusha",
    title: "Suspicious Behavior: Anusha",
    accusation: "Anusha was definitely documenting everything. At one point, I heard her whisper 'recording' to herself right before Rohan picked up his drink. Like she knew something was about to happen.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_srinjan', 'char_rahul', 'char_akash']
  },
  {
    id: 'acc_chaaya',
    code: "ACCUSE_CHAAYA",
    targetSuspect: 'char_chaaya',
    targetName: "Chaaya",
    title: "Suspicious Behavior: Chaaya",
    accusation: "Chaaya was sketching something during the party. When I asked to see, she slammed the book shut. I caught a glimpse though—it looked like a detailed floor plan of the bar with 'X' marks on specific spots.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_bharath', 'char_adish', 'char_rea']
  },
  {
    id: 'acc_tanishka',
    code: "ACCUSE_TANISHKA",
    targetSuspect: 'char_tanishka',
    targetName: "Tanishka Sheokand",
    title: "Suspicious Behavior: Tanishka",
    accusation: "Tanishka hugged Rohan after his speech, and I saw her hand brush his jacket pocket. She's a designer—she knows exactly where pockets are. What was she putting in there? Or taking out?",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_andrew', 'char_fatema', 'char_surya']
  },
  {
    id: 'acc_poshika',
    code: "ACCUSE_POSHIKA",
    targetSuspect: 'char_poshika',
    targetName: "Dr. Poshika Singh",
    title: "Suspicious Behavior: Dr. Poshika",
    accusation: "Dr. Poshika spent the whole night watching Rohan like he was a specimen. She's a surgeon—she knows how to kill things. And she didn't even flinch when he collapsed. Almost like she expected it.",
    roundReq: 1,
    type: "ACCUSATION",
    assignedTo: ['char_anusha', 'char_chaaya', 'char_tanishka', 'char_esha']
  }
];

// ============================================
// MOTIVE CLUES (Round 2)
// 10 motives, distributed via printed codes
// ============================================

export const MOTIVE_CLUES = [
  {
    id: 'mot_esha',
    code: "COWSHARK",
    targetSuspect: 'char_esha',
    targetName: "Esha",
    title: "Motive: Esha (Wife)",
    content: "Esha is Rohan's wife of 5 years. Sources close to the couple describe a controlling relationship—Rohan managed all finances, belittled her career, and friends noticed unexplained bruises. Their marriage was reportedly strained in recent months. A life insurance policy worth ₹1.5 crores exists, though the payout is contested due to ongoing investigations into Rohan's business practices.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_rea',
    code: "BATMAN1",
    targetSuspect: 'char_rea',
    targetName: "Re'a",
    title: "Motive: Re'a",
    content: "In college, Rohan spread rumors that Re'a had plagiarized their animation thesis. An investigation cleared Re'a, but the stigma followed them. Three major animation studios rejected Re'a based on 'concerns about their work's originality.' Re'a had to relocate and rebuild their entire career. Notably, Re'a worked part-time at 'Premium Ice Co.' for two years while rebuilding their animation portfolio.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_govind',
    code: "SOURD8",
    targetSuspect: 'char_govind',
    targetName: "Govind",
    title: "Motive: Govind",
    content: "Rohan dated Govind's current girlfriend years ago. After she broke up with him, Rohan shared intimate photographs of her online. She spiraled into depression and nearly took her own life. Govind has been helping her heal ever since. Seeing Rohan's 'apology' without real consequences was infuriating. Bank records show Govind withdrew ₹30,000 cash one week before the party with a notation: 'consultation fee.'",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_andrew',
    code: "VOICELOCK7",
    targetSuspect: 'char_andrew',
    targetName: "Andrew Pereira",
    title: "Motive: Andrew Pereira",
    content: "Andrew published an exposé on Rohan's company—data manipulation, fake engagement, selling user data to political campaigns. Rohan's lawyers buried the story and nearly bankrupted Andrew's publication. Andrew discovered new evidence that Rohan was planning to flee the country before charges could be filed. As an investigative journalist, Andrew has cultivated contacts in unusual places—including laboratory supply companies for past chemical industry investigations.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_fatema',
    code: "CHILLI999",
    targetSuspect: 'char_fatema',
    targetName: "Fatema",
    title: "Motive: Fatema",
    content: "Fatema and Rohan dated briefly in their twenties. When Fatema ended the relationship, Rohan retaliated by convincing a major gallery to cancel her first solo show, claiming she'd threatened him. She has a physical scar 'from an accident' during their relationship. The art world is small; whispers followed her for years.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_surya',
    code: "RADIO777",
    targetSuspect: 'char_surya',
    targetName: "Surya Peket",
    title: "Motive: Surya Peket",
    content: "Surya was lead developer on Rohan's flagship product. He worked 80-hour weeks for two years, was promised significant equity, then was fired the day before his vesting period. This cost Surya approximately ₹4 crores. His lawyer filed a criminal fraud case with a ₹5 crore penalty clause. However, the case required Rohan's testimony—if Rohan died before trial, the criminal case would collapse and Surya would get nothing.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_anusha',
    code: "MATH314",
    targetSuspect: 'char_anusha',
    targetName: "Anusha",
    title: "Motive: Anusha",
    content: "Anusha worked in content moderation at Rohan's company. She flagged harmful content being promoted algorithmically; Rohan overruled her. When she went to HR, she was quietly 'made redundant.' The content she flagged led to real-world harm—she knows the victims' names and carries that guilt.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_chaaya',
    code: "WOOD666",
    targetSuspect: 'char_chaaya',
    targetName: "Chaaya",
    title: "Motive: Chaaya",
    content: "Rohan bullied Chaaya mercilessly throughout high school—mocking her weight, her art, her quietness. He once destroyed an entire portfolio she'd spent months creating for an art school application. She lost her spot. She's been in therapy for over a decade dealing with trauma that started with his bullying.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_tanishka',
    code: "WEDDING2",
    targetSuspect: 'char_tanishka',
    targetName: "Tanishka Sheokand",
    title: "Motive: Tanishka Sheokand",
    content: "Rohan invested in Tanishka's first fashion line, then pulled funding at the last minute when a competitor offered him a better deal. She lost her entire savings, her team, and her reputation—approximately ₹2.5 crores in total losses. Starting over in her 30s while watching Rohan thrive was excruciating. She had a civil lawsuit pending for ₹3 crores in damages, scheduled for trial in February 2026. The case was strong, but Rohan's sudden wealth issues made recovery uncertain.",
    roundReq: 2,
    type: "MOTIVE"
  },
  {
    id: 'mot_poshika',
    code: "WALLFLOWER",
    targetSuspect: 'char_poshika',
    targetName: "Dr. Poshika Singh",
    title: "Motive: Dr. Poshika Singh",
    content: "Rohan brought an injured animal to Dr. Poshika's clinic. She saved it, then realized the injuries weren't accidental—they were consistent with deliberate harm. Before she could report it, Rohan threatened her veterinary license with fabricated complaints. She's spent years wondering if she should have done more. As a veterinary surgeon, she has legitimate access to controlled substances including sodium azide, which is used for euthanasia and tissue preservation.",
    roundReq: 2,
    type: "MOTIVE"
  }
];

// ============================================
// EVIDENCE CLUES (Round 3)
// Forensic and documentary evidence
// ============================================

export const EVIDENCE_CLUES = [
  // {
  //   id: 'ev_tox',
  //   code: "EVIDENCE_TOX",
  //   title: "Toxicology Report",
  //   content: "SUBSTANCE IDENTIFIED: Sodium Azide. A fast-acting toxin affecting cellular respiration. Time to death: 20-45 minutes from ingestion. CRITICAL: No residue found on glass rim or bottle exterior. Trace amounts detected in stomach contents mixed with melted ice water. Conclusion: Poison introduced via something that dissolved IN the drink over time.",
  //   roundReq: 3,
  //   type: "FORENSICS"
  // },
  {
    id: 'ev_search',
    code: "BIRDWATCH3",
    title: "Search History Analysis",
    content: "DEVICES ANALYZED: 12 laptops, 18 phones belonging to guests.\n\nFLAGGED SEARCHES (from public WiFi at Café Sunrise, Panjim):\n- 'Sodium azide purchase' (Jan 18, 2:47 PM)\n- 'Undetectable poisons' (Jan 18, 3:12 PM)\n- 'How long does poison take to work' (Jan 19, 11:23 AM)\n-\nCAFÉ SECURITY FOOTAGE: Multiple persons of interest visited this café during the relevant timeframe: Esha Sharma (Jan 18), Dr. Poshika Singh (Jan 18), Anusha (Jan 19), Re'a (Jan 20).\n\nNote: Searches made from public WiFi. Device attribution inconclusive.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_items',
    code: "REPLICA404",
    title: "Bar Request List",
    content: "EMAIL FROM: Esha <esha.sharma@email.com>\nTO: For the Record Bar Management\nSUBJECT: Special items for Rohan's party\n\nHi Marcus,\n\nFor Rohan's party, we'll be bringing some personal items:\n- 50-year-old Macallan scotch (sealed, Rohan's prized bottle)\n- Premium artisanal ice spheres (specialty ice company, for the scotch)\n- Three-tier celebration cake\n- Our cat Whiskers in a carrier (Rohan's emotional support)\nAll items are reserved for this party only. Please ensure they are handled with care.\n\nThanks,\nEsha Sharma\n\nBAR MANAGEMENT RESPONSE:\nConfirmed receipt of special items. All items logged and secured as per request.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_witness',
    code: "SKEPTICO1",
    title: "Witness Statement Summary",
    content: "COMPILED STATEMENTS:\n\n1. 'The scotch bottle was definitely sealed. Rohan broke the seal himself.' (Multiple witnesses)\n\n2. 'Esha sipped from his glass right after he added ice. If it was poisoned then, she'd be dead too.' (6 witnesses)\n\n3. 'Rohan's glass was unattended multiple times while he circulated.' (Bartender)\n\n4. 'I saw at least 4 different people near his booth area.' (Server)",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_bottle',
    code: "HORROR404",
    title: "Scotch Bottle Analysis",
    content: "ITEM: 50-Year-Old Macallan Scotch Bottle\n\nFINDINGS:\n- Seal was intact until opened at 8:15 PM (video confirmed)\n- No tampering with cork or bottle\n- Remaining liquid tested NEGATIVE for toxins\n- Fingerprints: Rohan (primary), Esha (secondary), Re'a (minor)\n\nCONCLUSION: Poison was NOT in the bottle. Delivery method was something added AFTER pouring.",
    roundReq: 3,
    type: "FORENSICS"
  },
  // {
  //   id: 'ev_ice',
  //   code: "EVIDENCE_ICE",
  //   title: "Ice Container Evidence",
  //   content: "ITEM: Insulated container labeled 'ROHAN'S ICE - DO NOT USE FOR OTHER DRINKS'\n\nFINDINGS:\n- Container brought by Esha at 5:00 PM\n- Stored in bar freezer (adjacent to bar's own artisanal ice supply)\n- Ice was spherical, 'artisanal' style—visually identical to bar's regular stock\n- Only Rohan used ice from this specific container (per witnesses)\n- Trace amounts of sodium azide detected in meltwater residue\n\nIMPORTANT: Both 'Rohan's Ice' and bar's regular artisanal ice showed similar trace contamination. Lab cannot determine if poison was in the ice originally, or if residue transferred after poisoning occurred through different means.\n\nNote: Container accessible during 4-minute CCTV blind spot (see CCTV evidence).",
  //   roundReq: 3,
  //   type: "FORENSICS"
  // },
  {
    id: 'ev_cat',
    code: "VOICE101",
    title: "The Cat Note",
    content: "OBSERVATION: A cat named 'Whiskers' was present at the venue in a carrier.\n\nSTATEMENT FROM BAR STAFF: 'Esha said Rohan needed the cat for anxiety. Weird for a party, but rich people do weird things.'\n\nSTATEMENT FROM DR. POSHIKA: 'The cat seemed agitated all night. Animals can sense things. It was meowing loudly right before Rohan collapsed.'\n\nNOTE: Cat tested negative for any substances.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_phone',
    code: "SAFEKEY09",
    title: "Phone Records Summary",
    content: "ROHAN'S PHONE - Last 24 hours:\n- Multiple calls to insurance company (Duration: 45 mins total)\n- Text to Esha: 'It's almost time. I love you.'\n- Text to unknown number: 'Delete everything after tonight.'\n- Deleted folder recovered: Photos of medical documents\n\nESHA'S PHONE:\n- Text to Rohan: 'I'll handle everything. Trust me.'\n- Call to unknown number (Jan 18, duration: 12 minutes)\n- Encrypted messaging app with deleted conversation history\n\nSURYA'S PHONE:\n- Encrypted chat application installed Jan 17\n- Multiple messages to user 'A_Pereira' (suspected to be Andrew)\n- Deleted voice note (recovery in progress)\n\nANDREW'S PHONE:\n- Encrypted messages to user 'Dev_SP' (suspected to be Surya)\n- Text fragment recovered: '...bar has blind spot near freezer...'\n- Contact labeled 'Lab Supply - Pune'\n\nNote: Multiple suspects used encryption and deleted message histories.",
    roundReq: 3,
    type: "EVIDENCE"
  },
  {
    id: 'ev_cctv',
    code: "NEEDLE88",
    title: "CCTV Summary",
    content: "Storage Room (Adjacent to Freezer):\n- 7:44 PM: Motion detected, person entering frame at edge\n- 7:45 PM: Partial view of someone's back near freezer door (clothing: dark jacket, unable to identify)\n- 7:46 PM: Same person exits frame\n\nNote: 10+ people passed near Rohan's booth while drink was unattended at various points. Multiple guests wore dark jackets that evening.",
    roundReq: 3,
    type: "CCTV"
  }
];

// ============================================
// REVELATION CLUES (Round 4)
// The suicide twist
// ============================================

export const REVELATION_CLUES = [
  {
    id: 'rev_journal',
    code: "REVEAL_JOURNAL",
    title: "Rohan's Journal Excerpts",
    content: "PERSONAL JOURNAL OF ROHAN SHARMA (Selected Entries)\n\nOctober 15: The doctors confirmed it today. Stage 4 pancreatic cancer. Metastasized. Six months, maybe less. How do I tell Esha?\n\nOctober 28: I've been thinking about how I want to go. Not slowly, not in a hospital bed, wasting away. I want to choose my moment.\n\nNovember 10: The apology party idea feels right. Everyone I've wronged, gathered together. My last act will be asking for forgiveness.\n\nNovember 20: 'I've decided not to wait for the cancer to take me. I want to choose my moment, on my terms. The party will be my farewell, my apology, and my exit. I've already obtained what I need—sodium azide, fast-acting, relatively painless. Esha doesn't know. She can't know. I won't burden her with this.",
    roundReq: 4,
    type: "REVELATION"
  },
  // {
  //   id: 'rev_cancer',
  //   code: "REVEAL_CANCER",
  //   title: "Medical Diagnosis",
  //   content: "CONFIDENTIAL MEDICAL RECORD\n\nPATIENT: Rohan Sharma\nDIAGNOSIS: Pancreatic Adenocarcinoma, Stage IV\nMETASTASIS: Liver, Lymph Nodes\n\nPROGNOSIS: 4-6 months with palliative care. Patient has declined aggressive treatment.\n\nDOCTOR'S NOTES: Patient showed signs of depression following diagnosis. Recommended psychiatric evaluation and support. Patient declined, stating he 'had his own plans for dealing with this.'\n\nLAST APPOINTMENT: January 10, 2026\nNOTE: Patient appeared at peace. Mentioned 'putting affairs in order.'",
  //   roundReq: 4,
  //   type: "REVELATION"
  // },
  // {
  //   id: 'rev_debt',
  //   code: "REVEAL_DEBT",
  //   title: "Financial Records",
  //   content: "FINANCIAL SUMMARY - ROHAN SHARMA\n\nASSETS:\n- Company shares: ₹3.2 Cr (frozen pending investigation)\n- Property: ₹1.8 Cr (mortgaged)\n- Savings: ₹12 Lakhs\n\nLIABILITIES:\n- Medical bills: ₹45 Lakhs\n- Legal settlements: ₹1.2 Cr (ongoing)\n- Mortgage: ₹95 Lakhs\n- Business debts: ₹2.1 Cr\n\nNET WORTH: Approximately -₹1 Crore\n\nNOTE: Multiple creditors have initiated recovery proceedings. Esha would inherit significant debt if Rohan died naturally or by suicide. However, life insurance payout would clear all debts with surplus.",
  //   roundReq: 4,
  //   type: "REVELATION"
  // },
  {
    id: 'rev_search2',
    code: "REVEAL_SEARCH2",
    title: "Rohan's Personal Searches",
    content: "ROHAN'S BROWSER HISTORY (Personal Laptop)\n\nSeptember:\n- 'Stage 4 pancreatic cancer survival rate' \n- 'How long does pancreatic cancer patient live'\n- 'Hospice care Goa'\n\nOctober:\n- 'Painless ways to die'\n- 'Dignified death options India'\n- 'Sodium azide where to buy'\n- 'How to make death look natural'\n\nNovember:\n- 'Life insurance suicide clause'\n- 'How to make suicide look like murder'\n- 'Murder vs suicide insurance payout'",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_letter',
    code: "REVEAL_LETTER",
    title: "Unsent Letter to Esha",
    content: "DRAFT EMAIL (Never Sent) - Found on Rohan's laptop\n\nTo: esha.sharma@email.com\nSubject: When you read this, I'll be gone\n\n---\n\nMy dearest Esha,\n\nIf you're reading this, the party happened, and I'm no longer there. I want you to know that everything that happened tonight was my choice. You didn't know—I made sure of that. I couldn't burden you with this decision.\n\nThe cancer was going to take me anyway. This way, I got to apologize to everyone, and you'll be taken care of. The insurance will pay out. Don't feel guilty. You did nothing wrong.\n\nI love you. I'm sorry I wasn't a better man sooner.\n\nForever yours,\nRohan\n\n---\n\nNOTE: This draft was never sent.",
    roundReq: 4,
    type: "REVELATION"
  },
  // NEW Round 5 - Late Game Bombshells
  {
    id: 'rev_icecompany',
    code: "REVEAL_ICECOMPANY",
    title: "Ice Company Investigation",
    content: "PREMIUM ICE CO. - CORPORATE RECORDS\n\nEMPLOYMENT HISTORY:\n- Re'a worked as Quality Control Technician (2022-2024)\n- Access to ice production facility and storage protocols\n- Familiar with spherical ice molds and manufacturing process\n\nCUSTOMER ORDER VERIFICATION:\nOrder #AI-2847 placed Jan 10, 2026 by 'E. Sharma' for 50 artisanal ice spheres.\n**CANCELLATION: Order cancelled Jan 17, 2026 via email. Reason: 'Will make at home instead.'**\n\nCOMPANY STATEMENT: 'We never delivered ice to the Sharma residence. The order was cancelled before production.'\n\nCRITICAL QUESTION: If Premium Ice Co. didn't deliver the ice, where did the 'premium artisanal ice' actually come from?",
    roundReq: 5,
    type: "REVELATION"
  },
  {
    id: 'rev_financial',
    code: "REVEAL_FINANCIAL",
    title: "Suspicious Financial Transfer",
    content: "FORENSIC ACCOUNTING REPORT\n\nACCOUNT: Esha Sharma (Personal Savings)\n\nTRANSACTION FLAGGED:\nDate: January 18, 2026\nAmount: ₹45,000 transferred OUT\nRecipient: [ENCRYPTED DIGITAL WALLET]\nNotation: 'Special consultation as discussed'\n\nBANKING INVESTIGATION:\nRecipient wallet traced to cryptocurrency exchange. Final destination: Unknown.\n\nTRANSACTION #2:\nDate: January 19, 2026\nAmount: ₹30,000 transferred IN (from Govind H.)\nSender notation: 'Consultation fee'\n\nQUESTION: Was Esha paying someone, or collecting payment for something? Were Esha and Govind working together?",
    roundReq: 4,
    type: "REVELATION"
  },
  {
    id: 'rev_clinic',
    code: "REVEAL_CLINIC",
    title: "Veterinary Clinic Inventory Audit",
    content: "DR. POSHIKA'S VETERINARY CLINIC - CONTROLLED SUBSTANCES LOG\n\nSODIUM AZIDE INVENTORY:\nPurpose: Tissue preservation, euthanasia agent\nRequired documentation: Strict logging per Veterinary Council regulations\n\nDISCREPANCY IDENTIFIED:\nDecember 2025: 200g sodium azide received from supplier\nLogged usage (Dec-Jan): 142g\nCurrent inventory (Jan 26): 8g\n**MISSING: 50g (unaccounted for)**\n\nDr. Poshika's statement: 'I noticed the shortage last week. I thought a staff member misrecorded usage. I was planning to investigate after the holidays.'\n\nNote: 250-300mg is lethal dose. 50g missing = enough for 166-200 lethal doses.",
    roundReq: 4,
    type: "REVELATION"
  },
  // {
  //   id: 'rev_messages',
  //   code: "REVEAL_MESSAGES",
  //   title: "Decrypted Messages: Surya & Andrew",
  //   content: "ENCRYPTED CHAT RECOVERY (Partial)\n\nUSER: Dev_SP (Surya Peket)\nUSER: A_Pereira (Andrew Pereira)\n\nJan 15, 11:47 PM\nDev_SP: He's going to get away with everything\nA_Pereira: Not if we make sure he doesn't\n\nJan 17, 3:22 PM\nDev_SP: Did you find out about the bar setup?\nA_Pereira: Yes. Bar has blind spot near freezer. 4-min window.\nA_Pereira: Also confirmed - bar stocks same ice type. Easy to swap.\n\nJan 19, 10:15 PM\nA_Pereira: Are you sure about this?\nDev_SP: He destroyed my life. ₹4 crores. Two years of my soul.\nDev_SP: I'm sure.\n\nJan 20, 8:03 AM\nA_Pereira: Got what we need. Lab contact came through.\nDev_SP: [MESSAGE DELETED]\nA_Pereira: [MESSAGE DELETED]\n\nJan 23, 6:41 PM\nDev_SP: Cold feet?\nA_Pereira: No. Just want to be sure we can live with this.\nDev_SP: I already can't live with what he did. This changes nothing.\n\nNote: Final 8 messages between Jan 23-25 were permanently deleted and unrecoverable.",
  //   roundReq: 4,
  //   type: "REVELATION"
  // },
  // {
  //   id: 'rev_witness2',
  //   code: "REVEAL_WITNESS2",
  //   title: "Late Witness Statement: Bar Staff",
  //   content: "SUPPLEMENTARY STATEMENT - Buland (Bar Owner)\n\n'I remembered something after the initial interviews. Around 7:45 PM, when I was in the back office checking on the power issue—we had a brief outage that knocked out one of the cameras—I heard the freezer door open and close.\n\nI thought it was one of my staff grabbing ice for the bar, but when I checked later, all my staff were accounted for at their stations. Someone else accessed that freezer during those 4 minutes.\n\nI also want to clarify something about the ice. Esha's email said she ordered from a 'premium ice company,' but honestly? Our bar ice looks identical. Same size, same spherical shape, same company supplies us. If someone wanted to swap ice between containers, it would be visually impossible to tell the difference.'\n\nFOLLOW-UP QUESTION TO MARCUS: 'Could someone have brought poisoned ice, and swapped it with Esha's clean ice?'\n\nMARCUS: 'Absolutely. Or poisoned our bar ice, then swapped that into Esha's container. Both containers were side-by-side. A label is just a label—you could switch it, or switch the contents. In 4 minutes? Easy.'",
  //   roundReq: 4,
  //   type: "REVELATION"
  // }
];

// ============================================
// THE CONFESSION (Round 6 - Murderer Only)
// ============================================

export const CONFESSION_CLUE = {
  id: 'confession',
  code: "THE_TRUTH",
  title: "The Truth",
  content: "I did it. God help me, I did it. Together with Rohan, I planned his death to look like murder. I can't believe what I've become.\n\nThe poisoned ice... that was my idea. I thought I was being so clever—frozen in my kitchen with sodium azide dissolved throughout. I cancelled the real ice order and made my own. My hands were shaking the whole time.\n\nRohan was dying. He wanted to go on his terms, he begged me. But I made sure his death would provide for my future. The insurance policy... if he killed himself, I'd get nothing and inherit all his debts. I told myself I was helping him. I told myself it was mercy.\n\nBut was it? Or was I just thinking about the money? I hate myself for not knowing the answer.\n\nI took that tiny sip from his glass to prove it was 'safe'—my heart was racing, knowing the ice hadn't melted enough yet. Everyone saw me drink. I played my part perfectly.\n\nAnd now... God, now I see what I've done. Surya and Andrew with their messages. Dr. Poshika's missing poison. Re'a's connection to the ice company. All of them under suspicion because of me. I watched them suffer, watched them suspect each other, while I played the grieving widow. What kind of monster does that?\n\nI'm so scared. I'm so sorry. Did I help my husband die with dignity... or did I murder him for money while letting innocent people take the blame?\n\nI don't know anymore. I don't know who I am.\n\nI'm terrified of what happens next. But I can't carry this alone anymore.",
  roundReq: 6,
  type: "CONFESSION",
  forCharacter: 'char_esha'
};

// ============================================
// CASE FILES (Round-Gated)
// ============================================

export const CASE_FILES = [
  // Round 1 - Incident Report
  {
    id: 'f_toxreport',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: 'January 25, 2026',
    content: "GOA POLICE - CRIMINAL INVESTIGATION DIVISION\n\nINCIDENT TYPE: Suspicious Death\nVICTIM: Rohan Sharma, Male, 34\nLOCATION: 'For the Record' Bar, Panjim, Goa\nDATE/TIME: January 25, 2026, 8:45 PM\n\nSUMMARY:\nVictim collapsed during a private party. Victim was hosting an 'apology party' for approximately 32 guests, all of whom had grievances against him.\n\nThe victim opened a sealed bottle of expensive scotch, poured drinks for guests, added ice, and made a toast. His wife, Esha Sharma, took a sip from his glass before the toast. Victim collapsed approximately 25 minutes later.\n\nAll 32 guests have been detained for questioning.\n\nSTATUS: Active Investigation\nLEAD INVESTIGATOR: Inspector Maria Fernandes",
    stamped: true,
    roundReq: 3
  },
  // Round 3 - Evidence Files
  {
    id: 'f_toxreport',
    type: 'REPORT',
    title: 'TOXICOLOGY REPORT',
    date: 'January 25, 2026',
    content: "FORENSIC LABORATORY - GOA\n\nCASE: Rohan Sharma\nSPECIMEN: Blood, Stomach Contents, Glass Residue\n\nFINDINGS:\n- Cause of death: Sodium azide poisoning\n- Estimated dose: 250-300mg (lethal)\n- Time between ingestion and death: ~25 minutes\n- Glass residue: Sodium azide traces in liquid, NOT on rim\n- Bottle residue: NEGATIVE for toxins\n",
    stamped: true,
    roundReq: 3
  },
    {
    id: 'f_financial',
    type: 'REPORT',
    title: 'FINANCIAL STATEMENT',
    date: 'January 2026',
    content: "ESTATE OF ROHAN SHARMA - FINANCIAL OVERVIEW\n\nASSETS:\n- Company shares: ₹3.2 Cr (FROZEN)\n- Residential property: ₹1.8 Cr (MORTGAGED)\n- Savings accounts: ₹12 Lakhs\n- Vehicles: ₹35 Lakhs\n\nLIABILITIES:\n- Outstanding medical bills: ₹45 Lakhs\n- Ongoing legal settlements: ₹1.2 Cr\n- Property mortgage: ₹95 Lakhs\n- Business creditors: ₹2.1 Cr\n\nNET POSITION: -₹1.03 Crores (NEGATIVE)\n\nNOTE: Without insurance payout, spouse inherits debt. With contested insurance payout of ₹1.5 Cr (if approved), spouse would clear debts and retain ~₹50 lakhs.",
    stamped: true,
    roundReq: 3
  },
  // Round 4 - Revelation Files
  {
    id: 'f_medical',
    type: 'REPORT',
    title: 'MEDICAL RECORDS',
    date: 'October 2025',
    content: "CONFIDENTIAL MEDICAL FILE\n\nPatient: Rohan Sharma\nDiagnosis: Pancreatic Adenocarcinoma, Stage IV\n\nHISTORY:\n- Initial symptoms: August 2025\n- Diagnosis confirmed: October 15, 2025\n- Metastasis identified: Liver, lymph nodes\n\nPROGNOSIS:\n- Expected survival: 4-6 months\n- Treatment options: Palliative only\n- Patient declined chemotherapy\n\nPSYCHOLOGICAL NOTES:\n- Patient exhibited signs of depression\n- Declined psychiatric referral\n- Stated he wanted to 'handle things his own way'\n- Last visit January 10, 2026: Patient appeared 'at peace'",
    stamped: true,
    roundReq: 4
  },
  // {
  //   id: 'f_journal',
  //   type: 'REPORT',
  //   title: 'JOURNAL ENTRIES',
  //   date: '2025-2026',
  //   content: "EXTRACTS FROM ROHAN SHARMA'S PERSONAL JOURNAL\n(Recovered from home office)\n\nOct 15: The diagnosis is in. Terminal. 6 months.\n\nOct 28: I keep thinking about all the people I've hurt. I want to make it right before I go.\n\nNov 10: The party idea - invite everyone I've wronged. One big apology.\n\nNov 20: I've found a way out. Quick, painless. Better than wasting away.\n\nNov 25: The poison is obtained. I'll put it in my drink myself. No one else will know.\n\nJan 25: Today is the day. I'm not afraid. I'm ready.",
  //   stamped: true,
  //   roundReq: 4
  // },
    {
    id: 'f_insurance',
    type: 'REPORT',
    title: 'INSURANCE POLICY SUMMARY',
    date: 'March 2024',
    content: "LIFE INSURANCE CORPORATION OF INDIA\n\nPOLICY SUMMARY\n\nInsured: Rohan Sharma\nBeneficiary: Esha Sharma (100%)\nSum Assured: ₹1,50,00,000\n\nIMPORTANT EXCLUSIONS:\n- Suicide within 3 years of policy start: NO PAYOUT\n- Death during commission of crime: NO PAYOUT\n- Death by homicide: FULL PAYOUT (subject to fraud investigation)\n- Death by accident: FULL PAYOUT\n\nPolicy commenced: March 15, 2024\nSuicide exclusion period ends: March 15, 2027",
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
  'KFC': 'char_anish',
  'HACKERMAN': 'char_ishank',
  'NOWORRIES': 'char_shreyash',
  'INDORI': 'char_esha',
  'WEDDING': 'char_govind',
  'TRUFFLES': 'char_rashmi',
  'BATMAN': 'char_adish',
  'WOODWORK': 'char_anubhav',
  'BLUETOOTH': 'char_antara',
  'SWIFTY': 'char_gautam',
  'YALLA': 'char_shannon',
  'ILOVEGOA': 'char_tanishka',
  'TINTIN': 'char_andrew',
  'IMPOSTER': 'char_anika',
  'ALIENCAT': 'char_rea',
  'SAILOR': 'char_bharath',
  'DOUGH': 'char_chaaya',
  'MILEY': 'char_amrit',
  'ARTSY': 'char_pallavi',
  'SHAZAM': 'char_anusha',
  'TRUSTNOT': 'char_sukriti',
  'MEOW': 'char_poshika',
  'COWBOY': 'char_arjun',
  'MARIE': 'char_sneha',
  'BOOM': 'char_soham',
  'VV': 'char_nikita',
  'ZAMEENDAR': 'char_shardul',
  'SAFEDRIVER': 'char_srinjan',
  'MINDFREAK': 'char_rahul',
  'WHOSPOKE': 'char_fatema',
  'PARTYSMART': 'char_surya',
  'CREATE': 'char_akash'
};

// Validate login code and return character ID
export const validateLoginCode = (code) => {
  const upperCode = code.trim().toUpperCase();
  return LOGIN_CODE_MAP[upperCode] || null;
};
