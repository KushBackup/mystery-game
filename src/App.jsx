import React, { useState, useEffect, useMemo } from 'react';

// --- CUSTOM ICON COMPONENTS (Inline to prevent import errors) ---

const IconBase = ({ size = 24, className = "", children, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    {children}
  </svg>
);

const Ghost = (props) => (
  <IconBase {...props}>
    <path d="M9 10h.01" /><path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </IconBase>
);

const Fingerprint = (props) => (
  <IconBase {...props}>
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .5-2.5" />
    <path d="M12 10a2 2 0 0 1 2 2c0 5 2 7 2 7" />
    <path d="M16 14c0-4.5 1.5-6.5 3-7.5" />
    <path d="M9 10a4 4 0 0 1 8 0c0 4-1 6-2 8" />
    <path d="M12 19.5c-2.5-1-4-4-4-7.5a8 8 0 0 1 12-4" />
  </IconBase>
);

const User = (props) => (
  <IconBase {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
);

const Users = (props) => (
  <IconBase {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconBase>
);

const Search = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconBase>
);

const Lock = (props) => (
  <IconBase {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconBase>
);

const Unlock = (props) => (
  <IconBase {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </IconBase>
);

const ShieldCheck = (props) => (
  <IconBase {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </IconBase>
);

const Calculator = (props) => (
  <IconBase {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="14" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="8" y2="14" />
    <line x1="12" y1="14" x2="12" y2="14" />
    <line x1="8" y1="18" x2="8" y2="18" />
    <line x1="12" y1="18" x2="12" y2="18" />
    <line x1="16" y1="18" x2="16" y2="18" />
  </IconBase>
);

const ChevronRight = (props) => (
  <IconBase {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconBase>
);

const AlertTriangle = (props) => (
  <IconBase {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconBase>
);

const X = (props) => (
  <IconBase {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconBase>
);

const FileText = (props) => (
  <IconBase {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </IconBase>
);

const Paperclip = (props) => (
  <IconBase {...props}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </IconBase>
);

const Zap = (props) => (
  <IconBase {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconBase>
);

const Vote = (props) => (
  <IconBase {...props}>
    <path d="m9 12 2 2 4-4"/>
    <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/>
    <path d="M22 19H2"/>
  </IconBase>
);

// --- GAME DATA (Based on 1-Story-Script.md) ---

const ROUNDS = [
  { id: 0, title: "Pre-Game", desc: "Arrivals & Mingling" },
  { id: 1, title: "The Apology", desc: "Backstories & Grudges" },
  { id: 2, title: "The Incident", desc: "Timelines & Alibis" },
  { id: 3, title: "Forensics", desc: "Toxicology & Physical Evidence" },
  { id: 4, title: "Interrogations", desc: "Motives & Confessions" },
  { id: 5, title: "The Bombshell", desc: "Deep Secrets Revealed" },
  { id: 6, title: "The Reveal", desc: "Case Closed" }
];

const CHARACTERS = [
  {
    id: 'char_vikram',
    name: "Vikram",
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

const CLUE_DB = [
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

const CASE_FILES = [
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

// --- DOODLE COMPONENTS ---

const DoodleCoffeeStain = () => (
  <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none mix-blend-multiply text-amber-800" fill="currentColor">
    <path d="M50 10 C 70 10 90 30 90 50 C 90 70 70 90 50 90 C 30 90 10 70 10 50 C 10 30 30 10 50 10 M 50 15 C 35 15 20 30 18 50 C 16 70 35 85 50 85 C 70 85 85 70 85 50 C 85 30 70 15 50 15" />
  </svg>
);

const DoodleCCTV = ({ type }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full stroke-stone-800 stroke-2 fill-none" strokeLinecap="round">
    <rect x="5" y="5" width="90" height="90" strokeDasharray="5,5" />
    <text x="10" y="20" className="text-[8px] fill-red-600 font-mono font-bold">REC ●</text>
    {type === 'CCTV_BAR' ? (
       <>
         <rect x="30" y="50" width="40" height="10" />
         <circle cx="50" cy="40" r="5" />
         <line x1="50" y1="45" x2="50" y2="50" />
         <path d="M40 50 L 40 40 L 45 45" />
       </>
    ) : (
       <>
         <rect x="20" y="30" width="30" height="50" />
         <text x="25" y="50" className="text-[6px] fill-stone-600">ICE</text>
         <circle cx="70" cy="60" r="5" />
         <line x1="70" y1="65" x2="70" y2="80" />
         <line x1="70" y1="70" x2="50" y2="60" />
       </>
    )}
  </svg>
);

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  // Game State (Mocking Firebase)
  const [currentRound, setCurrentRound] = useState(0);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [votes, setVotes] = useState({}); // { round: suspectId }
  
  // Local UI State
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [hostPanelOpen, setHostPanelOpen] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);

  const myCharacter = useMemo(() => 
    CHARACTERS.find(c => c.id === currentUser), 
  [currentUser]);

  const currentRoundData = ROUNDS[currentRound] || ROUNDS[ROUNDS.length - 1];

  // --- ACTIONS ---

  const handleLogin = (id) => {
    setCurrentUser(id);
    setActiveTab('DASHBOARD');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const normalizedCode = inputCode.trim().toUpperCase();
    
    // Check if it's a character code (social connection)
    const foundChar = CHARACTERS.find(c => c.code === normalizedCode);
    // Check if it's a clue code
    const foundClue = CLUE_DB.find(c => c.code === normalizedCode);

    if (foundClue) {
      if (foundClue.roundReq > currentRound) {
         setFeedback({ type: 'error', msg: "CLUE LOCKED: Wait for later rounds." });
      } else if (unlockedClues.includes(foundClue.id)) {
        setFeedback({ type: 'info', msg: "Already in your files." });
      } else {
        setUnlockedClues([...unlockedClues, foundClue.id]);
        setFeedback({ type: 'success', msg: `EVIDENCE ADDED: ${foundClue.title}` });
        setModalOpen(false);
        setActiveTab('INTEL');
      }
    } else if (foundChar) {
       setFeedback({ type: 'success', msg: `MET: ${foundChar.name}.` });
    } else {
      setFeedback({ type: 'error', msg: "INVALID CODE" });
    }
    
    setInputCode("");
    setTimeout(() => setFeedback(null), 3000);
  };

  const submitVote = (suspectId) => {
    setVotes({ ...votes, [currentRound]: suspectId });
    setFeedback({ type: 'success', msg: "VOTE RECORDED" });
  };

  // --- HOST CONTROLS (Hidden) ---
  const toggleHostPanel = () => {
     setSecretTapCount(prev => {
         const newCount = prev + 1;
         if (newCount >= 3) {
             setHostPanelOpen(true);
             return 0;
         }
         return newCount;
     });
  };

  // --- RENDER ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten relative overflow-hidden flex flex-col items-center justify-center p-4 bg-texture">
        {/* Blood Splatters */}
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-red-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-orange-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none mix-blend-multiply"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white border-4 border-stone-900 rounded-full flex items-center justify-center shadow-sketch-lg rotate-3 mb-4">
              <Ghost size={40} className="text-orange-600 sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tighter drop-shadow-sm rotate-[-2deg]">
              THE TAHER <span className="text-red-700">PARTY</span>
            </h1>
            <p className="mt-2 text-stone-600 text-base sm:text-lg font-bold">Murder Mystery Night</p>
          </div>

          <div className="bg-white p-2 border-2 border-stone-900 shadow-sketch rounded-sm rotate-1">
            <div className="border border-stone-300 p-3 sm:p-4 border-dashed rounded-sm bg-[#fafafa]">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-orange-600 text-center uppercase tracking-widest decoration-wavy underline decoration-stone-400">Who Are You?</h3>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {CHARACTERS.map(char => (
                  <button
                    key={char.id}
                    onClick={() => handleLogin(char.id)}
                    className="w-full text-left p-3 border-b-2 border-stone-200 hover:bg-orange-50 active:bg-orange-100 hover:border-orange-300 transition-all flex justify-between items-center group font-bold text-stone-700 active:scale-[0.98]"
                  >
                    <span className="truncate mr-2">{char.name}</span>
                    <span className="text-xs bg-stone-200 px-2 py-1 rounded-sm text-stone-500 whitespace-nowrap group-hover:bg-orange-200 group-hover:text-orange-800">
                      {char.profession}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten pb-20 sm:pb-24 relative overflow-hidden bg-texture">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-2 bg-red-700 z-50"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f4f1ea]/95 border-b-4 border-stone-900 p-3 sm:p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex items-center gap-3" onClick={toggleHostPanel}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 border-2 border-stone-900 rounded-lg flex items-center justify-center rotate-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Ghost size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black leading-none text-stone-900 uppercase">ROUND {currentRound}</h2>
              <span className="text-[10px] sm:text-xs text-red-600 font-bold tracking-widest bg-red-100 px-1">{currentRoundData.title}</span>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="text-xs sm:text-sm font-bold text-stone-500 hover:text-red-600 underline decoration-2 decoration-wavy p-2"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-4 max-w-2xl mx-auto space-y-6 sm:space-y-8">

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div className={`fixed top-20 left-4 right-4 z-50 p-4 border-4 shadow-sketch-lg flex items-center gap-3 animate-bounce-short rotate-1 ${
            feedback.type === 'error' ? 'bg-red-100 border-red-700 text-red-900' : 
            feedback.type === 'success' ? 'bg-green-100 border-green-700 text-green-900' :
            'bg-blue-100 border-blue-700 text-blue-900'
          }`}>
            {feedback.type === 'error' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
            <span className="font-black text-sm sm:text-lg">{feedback.msg}</span>
          </div>
        )}

        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-1 border-2 border-stone-900 shadow-sketch-lg rotate-[-1deg]">
              <div className="border border-stone-300 p-4 sm:p-6 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                <DoodleCoffeeStain />
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-6">
                     <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-2">
                        <Fingerprint size={40} className="text-stone-300 sm:w-12 sm:h-12" />
                     </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase">{myCharacter.name}</h1>
                    <span className="bg-stone-900 text-white px-3 py-1 text-xs sm:text-sm font-bold rotate-1 shadow-sm mt-1 transform">
                      {myCharacter.profession}
                    </span>
                  </div>

                  {myCharacter.role === 'MURDERER' ? (
                     <div className="bg-red-100 border-l-4 border-red-600 p-3 mb-4 rotate-1">
                        <p className="text-red-800 font-bold uppercase text-center text-lg sm:text-xl">⚠️ You are the Murderer</p>
                     </div>
                  ) : myCharacter.role === 'VICTIM' ? (
                    <div className="bg-purple-100 border-l-4 border-purple-600 p-3 mb-4 rotate-1">
                        <p className="text-purple-800 font-bold uppercase text-center text-lg sm:text-xl">🤕 You are the Victim</p>
                    </div>
                  ) : (
                    <div className="bg-green-100 border-l-4 border-green-600 p-3 mb-4 rotate-1">
                        <p className="text-green-800 font-bold uppercase text-center text-lg sm:text-xl">✅ Innocent Bystander</p>
                    </div>
                  )}

                  <div className="space-y-4 font-bold text-stone-700 text-sm sm:text-base">
                    <div className="bg-orange-50 p-4 border-2 border-orange-200 rounded-sm relative">
                        <div className="absolute -top-3 -left-2 bg-orange-500 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[-3deg] border border-stone-900 shadow-sm">SECRET</div>
                        <p className="italic">"{myCharacter.secret}"</p>
                    </div>

                    {currentRound >= 2 && (
                        <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-sm relative">
                            <div className="absolute -top-3 -right-2 bg-blue-500 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[2deg] border border-stone-900 shadow-sm">TIMELINE</div>
                            <p className="italic">{myCharacter.timeline}</p>
                        </div>
                    )}
                    
                    <div className="mt-6 border-t-2 border-dashed border-stone-300 pt-4 text-center">
                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Your Access Code</p>
                        <span className="text-2xl sm:text-3xl font-black text-red-700 tracking-widest font-mono bg-red-50 px-4 py-2 border border-red-200 rotate-1 inline-block select-all">
                            {myCharacter.code}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: INTEL --- */}
        {activeTab === 'INTEL' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase decoration-wavy underline decoration-orange-500">Evidence Board</h2>
            
            <div className="grid gap-4 sm:gap-6">
              {CLUE_DB.filter(c => unlockedClues.includes(c.id)).length === 0 && (
                  <p className="text-center text-stone-500 italic">No evidence collected yet. Enter codes to unlock clues.</p>
              )}
              {CLUE_DB.filter(c => unlockedClues.includes(c.id)).map((clue, idx) => {
                const rotation = idx % 2 === 0 ? 'rotate-1' : 'rotate-[-1deg]';
                return (
                  <div key={clue.id} className={`relative p-4 border-2 border-stone-900 bg-white shadow-sketch transition-all ${rotation}`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-6 bg-yellow-200/50 rotate-1 border-l border-r border-white/50 backdrop-blur-sm shadow-sm"></div>
                    <div className="flex justify-between items-start mb-3 pt-2">
                      <h3 className="text-lg sm:text-xl font-black uppercase text-red-700">{clue.title}</h3>
                      <Unlock size={18} className="text-green-600"/>
                    </div>
                    <div>
                        <span className="text-[10px] bg-stone-200 px-2 py-1 rounded font-bold uppercase mb-2 inline-block">{clue.type}</span>
                        <p className="text-base sm:text-lg font-bold text-stone-800 leading-snug font-serif italic mb-2">"{clue.content}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW: FILES --- */}
        {activeTab === 'FILES' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase decoration-wavy underline decoration-stone-500">Archives</h2>
            {CASE_FILES.map((file, idx) => {
              const rotate = idx % 2 === 0 ? 'rotate-[1deg]' : 'rotate-[-1deg]';
              return (
                <div key={file.id} className={`bg-white border-2 border-stone-900 shadow-sketch-lg p-4 relative ${rotate}`}>
                  <div className="absolute -top-4 right-8 text-stone-400 transform -rotate-45">
                    <Paperclip size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  {file.type === 'REPORT' && (
                    <div className="relative overflow-hidden">
                      <DoodleCoffeeStain />
                      <div className="border-b-4 border-stone-900 pb-2 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1">
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-stone-800 leading-none">{file.title}</h3>
                        <span className="font-mono text-[10px] sm:text-xs bg-stone-200 px-2 py-1 w-fit">{file.date}</span>
                      </div>
                      <p className="font-serif text-base sm:text-lg leading-relaxed text-stone-800">{file.content}</p>
                    </div>
                  )}
                  {file.type === 'IMAGE' && (
                    <div className="flex flex-col items-center">
                      <div className="bg-stone-900 p-2 pb-8 shadow-sm transform rotate-1 w-full max-w-[200px] sm:max-w-[250px] relative">
                        <div className="bg-white aspect-square w-full flex items-center justify-center overflow-hidden border border-stone-200">
                          <DoodleCCTV type={file.sketchType} />
                        </div>
                        <p className="text-white font-handwritten text-center mt-2 text-xs sm:text-sm">{file.title}</p>
                      </div>
                      <p className="mt-4 text-center font-bold text-stone-600 italic bg-stone-100 px-4 py-2 transform -rotate-1 shadow-sm border border-stone-200 text-xs sm:text-base">"{file.caption}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* --- VIEW: DOSSIER --- */}
        {activeTab === 'DOSSIER' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 text-center uppercase mb-6 decoration-wavy underline decoration-red-500">Suspects</h2>
            
             {/* Voting Section */}
             <div className="bg-stone-800 p-4 mb-6 rounded border-2 border-stone-900 shadow-sketch text-white relative overflow-hidden">
                 {isVotingOpen ? (
                     <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2"><Vote size={20}/> VOTING OPEN</h3>
                            <span className="text-xs bg-stone-700 px-2 py-1 rounded">Round {currentRound}</span>
                        </div>
                        <p className="text-sm text-stone-300 mb-2">Select your prime suspect. You can change your vote until voting closes.</p>
                        {votes[currentRound] ? (
                             <div className="bg-green-900/30 border border-green-500 p-2 rounded text-center">
                                 <p className="text-green-400 font-bold">VOTE RECORDED</p>
                                 <p className="text-xs text-stone-400">Suspect: {CHARACTERS.find(c => c.id === votes[currentRound])?.name}</p>
                             </div>
                        ) : (
                            <p className="text-xs text-stone-500 italic">Select a guest below to cast vote.</p>
                        )}
                     </>
                 ) : (
                    <div className="text-center py-2 opacity-50">
                        <Lock size={24} className="mx-auto mb-2 text-stone-500"/>
                        <h3 className="text-lg font-bold text-stone-400">VOTING LOCKED</h3>
                        <p className="text-xs">Wait for the Host to open voting.</p>
                    </div>
                 )}
             </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {CHARACTERS.map((char, i) => (
                <button 
                  key={char.id} 
                  onClick={() => setSelectedGuest(char)}
                  className="w-full text-left bg-white p-3 sm:p-4 border-2 border-stone-900 shadow-[4px_4px_0px_#e5e5e5] flex items-center gap-3 sm:gap-4 hover:translate-x-1 transition-transform active:translate-y-1 active:shadow-none"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-stone-900 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm flex-shrink-0
                    ${char.id === currentUser ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-400'}
                  `}>
                    {char.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                        <h4 className="font-black text-base sm:text-lg text-stone-900 truncate">{char.name}</h4>
                        {char.id === currentUser && <span className="text-[10px] bg-stone-900 text-white px-1 font-bold whitespace-nowrap">(YOU)</span>}
                    </div>
                    <p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wide truncate">{char.profession}</p>
                    <p className="text-xs sm:text-sm text-stone-500 italic mt-1 font-serif leading-tight truncate">"{char.quirk}"</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- HOST CONTROLS PANEL --- */}
        {hostPanelOpen && (
             <div className="fixed bottom-24 left-4 bg-stone-800 text-white p-4 rounded-lg shadow-2xl border-2 border-stone-600 z-50 w-64">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-orange-400 flex items-center gap-2"><Zap size={16}/> HOST PANEL</h3>
                     <button onClick={() => setHostPanelOpen(false)}><X size={16}/></button>
                 </div>
                 <div className="space-y-3">
                     <div className="bg-stone-700 p-2 rounded">
                         <p className="text-xs text-stone-400 uppercase">Current Round</p>
                         <div className="flex items-center justify-between mt-1">
                             <button onClick={() => setCurrentRound(Math.max(0, currentRound - 1))} className="bg-stone-600 px-2 rounded hover:bg-stone-500">-</button>
                             <span className="font-bold text-xl">{currentRound}</span>
                             <button onClick={() => setCurrentRound(Math.min(6, currentRound + 1))} className="bg-stone-600 px-2 rounded hover:bg-stone-500">+</button>
                         </div>
                     </div>
                     <button 
                        onClick={() => setIsVotingOpen(!isVotingOpen)}
                        className={`w-full py-2 rounded font-bold text-sm ${isVotingOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                     >
                         {isVotingOpen ? 'CLOSE VOTING' : 'OPEN VOTING'}
                     </button>
                     <div className="text-xs text-stone-500 pt-2 border-t border-stone-700">
                         Simulates admin actions for demo.
                     </div>
                 </div>
             </div>
        )}

        {/* --- DECODER FAB --- */}
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-red-600 border-4 border-stone-900 text-white rounded-full shadow-[4px_4px_0px_#1c1917] flex items-center justify-center hover:scale-110 transition-transform z-40 active:translate-y-1 active:shadow-none"
        >
          <Calculator size={28} className="sm:w-8 sm:h-8" />
        </button>
        {/* Helper for finding Host Panel */}
        <div className="fixed bottom-20 right-20 text-stone-300 opacity-20 hover:opacity-100 cursor-pointer" onClick={toggleHostPanel}>⚡</div>

      </main>

      {/* --- NAV --- */}
      <nav className="fixed bottom-0 w-full bg-stone-900 border-t-4 border-red-700 pb-safe z-30 shadow-2xl">
        <div className="flex justify-around items-center h-16 sm:h-20 max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'DASHBOARD' ? 'text-orange-500' : 'text-stone-500'}`}
          >
            <User size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            <span className="text-[10px] sm:text-xs font-black uppercase">ID Card</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('INTEL')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'INTEL' ? 'text-orange-500' : 'text-stone-500'}`}
          >
            <div className="relative">
                <Search size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase">Clues</span>
          </button>

          <button 
            onClick={() => setActiveTab('FILES')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'FILES' ? 'text-orange-500' : 'text-stone-500'}`}
          >
            <FileText size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            <span className="text-[10px] sm:text-xs font-black uppercase">Files</span>
          </button>

          <button 
            onClick={() => setActiveTab('DOSSIER')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors active:bg-stone-800 ${activeTab === 'DOSSIER' ? 'text-orange-500' : 'text-stone-500'}`}
          >
            <Users size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            <span className="text-[10px] sm:text-xs font-black uppercase">Guests</span>
          </button>
        </div>
      </nav>

      {/* --- GUEST PROFILE MODAL --- */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
          <div className="bg-[#f4f1ea] w-full max-w-md p-6 border-t-4 sm:border-4 border-stone-900 shadow-[0px_-4px_10px_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0px_#ef4444] relative rotate-0 sm:rotate-1 overflow-y-auto max-h-[85vh] sm:rounded-none rounded-t-2xl">
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden"></div>
            <button 
                onClick={() => setSelectedGuest(null)}
                className="absolute top-4 right-4 bg-stone-900 text-white p-2 border-2 border-white hover:bg-red-600 transition-colors shadow-lg z-10 sm:-top-4 sm:-right-4"
            >
                <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex flex-col items-center mb-6 mt-4 sm:mt-0">
                 <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-stone-900 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-sm mb-4
                    ${selectedGuest.id === currentUser ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-500'}
                  `}>
                    {selectedGuest.name.charAt(0)}
                  </div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase text-center leading-none mb-2">{selectedGuest.name}</h3>
                <span className="bg-stone-900 text-white px-3 py-1 text-xs sm:text-sm font-bold shadow-sm transform -rotate-1">
                    {selectedGuest.profession}
                </span>
            </div>

            <div className="space-y-4 pb-8 sm:pb-0">
                 <div className="text-center">
                    {selectedGuest.role === 'VICTIM' ? (
                         <span className="inline-block border-2 border-purple-900 text-purple-900 bg-purple-100 px-3 py-1 font-black uppercase text-xs sm:text-sm rotate-2">KNOWN VICTIM</span>
                    ) : (
                        <span className="inline-block border-2 border-stone-400 text-stone-400 bg-stone-100 px-3 py-1 font-black uppercase text-xs sm:text-sm -rotate-1">SUSPECT</span>
                    )}
                 </div>

                <div className="bg-white p-4 border-2 border-stone-200 rounded-sm relative mt-6">
                    <div className="absolute -top-3 -left-2 bg-stone-800 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[2deg] border border-stone-900 shadow-sm">BIO</div>
                    <p className="text-stone-700 leading-relaxed font-bold text-sm sm:text-base">{selectedGuest.bio}</p>
                </div>

                <div className="bg-orange-50 p-4 border-2 border-orange-200 rounded-sm relative">
                    <div className="absolute -top-3 -right-2 bg-orange-500 text-white px-2 py-0.5 text-[10px] sm:text-xs rotate-[-3deg] border border-stone-900 shadow-sm">KNOWN TRAIT</div>
                    <p className="text-stone-800 italic font-serif text-sm sm:text-base">"{selectedGuest.quirk}"</p>
                </div>

                {isVotingOpen && selectedGuest.role !== 'VICTIM' && (
                     <button 
                        onClick={() => { submitVote(selectedGuest.id); setSelectedGuest(null); }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 border-b-4 border-red-900 active:border-b-0 active:translate-y-1 mt-4"
                     >
                         VOTE AS SUSPECT
                     </button>
                )}

                {selectedGuest.id === currentUser && (
                     <div className="mt-6 border-t-2 border-dashed border-stone-300 pt-4 text-center">
                        <p className="text-xs text-red-600 font-bold uppercase mb-1">THIS IS YOU</p>
                        <p className="text-[10px] sm:text-xs text-stone-400">Check your ID Card tab for secret info.</p>
                     </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- DECODER MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
          <div className="bg-[#f4f1ea] w-full max-w-md p-6 border-t-4 sm:border-4 border-stone-900 shadow-[0px_-4px_10px_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0px_#ef4444] relative rotate-0 sm:rotate-1 rounded-t-2xl sm:rounded-none">
            <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 bg-stone-900 text-white p-2 border-2 border-white hover:bg-red-600 transition-colors shadow-lg sm:-top-4 sm:-right-4"
            >
                <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="flex flex-col items-center mb-6 mt-2 sm:mt-0">
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase underline decoration-4 decoration-red-600">Enter Code</h3>
                <p className="text-stone-600 font-bold mt-2 text-center text-sm sm:text-base">Found a clue? Type it below.</p>
            </div>
            <form onSubmit={handleCodeSubmit} className="space-y-4 pb-6 sm:pb-0">
                <input 
                    type="text" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="SECRET CODE..."
                    className="w-full bg-white border-4 border-stone-900 text-red-700 text-center text-2xl sm:text-3xl font-black py-3 sm:py-4 focus:outline-none focus:border-orange-500 uppercase tracking-widest placeholder:text-stone-300 shadow-inner"
                    autoFocus
                />
                <button 
                    type="submit"
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white text-lg sm:text-xl font-black py-3 sm:py-4 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase"
                >
                    UNLOCK <ChevronRight size={24} />
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}