# 🔍 Astral Project's Murder Mystery Experience
## Complete Project Context & Instructions

<<<<<<< Updated upstream
=======
> **Maintenance note for Claude:** This is a living document. Update it whenever the game flow, mechanics, scope, or feature set changes. See [Claude.md](Claude.md) for the full doc map and session-start primer.

>>>>>>> Stashed changes
---

## 📖 GAME OVERVIEW

**Game Type:** Interactive Murder Mystery Party Game  
**Platform:** Web Application (React + Vite + Tailwind CSS)  
**Branding:** Ultimate mystery solver gadget
**Theme:** Detective noir with hand-drawn sketch aesthetic  
**Players:** 32 characters (1 murderer, 9 suspects, 22 witnesses, 1 victim)  
**Gameplay Duration:** ~2-3 hours across 7 rounds  

### **Story Premise**
The TripleSpeed office gathers at the founders' Penthouse (4th floor, Indiranagar, Bangalore) on the evening of May 23, 2026 — for a Series B funding-round announcement. During the party, **Nikhil**, the head of marketing, collapses on the balcony and is pronounced dead at 9:02 PM. The twist: Nikhil — terminally ill with Stage 4 pancreatic cancer AND about to be indicted in a SEBI inquiry into TripleSpeed's cooked engagement metrics — staged his own death with **Alam** (Head of HR, longtime fraud co-conspirator) to look like a murder. A homicide pays out the life insurance (suicide voids it) AND collapses the SEBI case (which would otherwise drag through Nikhil's estate and expose Alam).

### **Murder Method**
- **Weapon:** Sodium azide (fast-acting poison)
- **Delivery:** Poisoned vape cartridge — Alam swapped Nikhil's clean cartridge with the toxin-loaded twin during a 25-min window when he was alone in the Penthouse the morning of the party
- **Mastermind:** Alam (Head of HR) — co-planned with Nikhil himself
- **Motive:** ₹2 Cr personal life insurance (Trust beneficiary; Alam is trustee) + ₹5 Cr key-person insurance to TripleSpeed + collapse of the SEBI case
- **The Twist:** Assisted suicide made to look like a murder for the insurance + halts the fraud investigation

---

## 🎮 GAME MECHANICS

### **Core Gameplay Loop**
1. **Character Selection** - Players choose from 32 character identities
2. **Round Progression** - Host advances through 7 rounds with specific unlocks
3. **Accusation Distribution** - Round 1: Players receive pre-assigned accusation cards
4. **Clue Discovery** - Players enter motive/revelation codes from printed cards
5. **Evidence Unlocking** - Host unlocks case files at specific rounds (0, 3, 4)
6. **Voting** - Players vote for suspects when host opens voting
7. **Results Control** - Host controls when vote results are visible
8. **Final Reveal** - Round 6: Host presses "REVEAL MURDERER" → big red full-screen overlay shows on every non-host player's phone naming Alam, **except Alam's own device** (Alam falls through to the regular OutroSplash). The action also flips `gameEnded` so players are locked into the terminal screen. Reset Game is the only way to undo.

### **Code System**
- **Accusation Codes:** Pre-assigned, each player gets 1 unique accusation card
- **Motive Codes:** Distributed in Round 2 via printed cards (10 motives)
- **Evidence Codes:** Distributed in Round 3 (7 forensic/document clues)
- **Revelation Codes:** Distributed in Rounds 4-5 (6 cancer + fraud + insurance + HR-trail clues)
- Codes can only be unlocked if current round >= clue's required round

### **Round Structure**
```
Round 0: The Incident (Incident Report unlocked, explore TripleSpeed profiles)
Round 1: Accusations (Each player receives 1 accusation card, shared verbally)
Round 2: Motives (Enter printed motive codes - why suspects wanted Nikhil dead)
Round 3: Evidence (Toxicology, vape analysis, Penthouse CCTV, funding/SEBI/HR docs)
Round 4: Revelations (Cancer diagnosis, voice notes, fraud reveal, insurance policy)
Round 5: Late-Game Bombshells (HR trail showing Alam's January cleanup, Nikhil's unsent voice memo)
Round 6: The Reveal (Vote results shown; host presses "REVEAL MURDERER" → 31 players see a full-screen red overlay naming Alam; Alam's device skips the overlay and shows OutroSplash; game ends)
```

---

## 👥 CHARACTER ROSTER

### **The Mastermind**
- **Alam** - Head of HR, "court poet" (char_alam)
  - Public Role: MURDERER
  - Private Truth: Helped Nikhil stage his own death; co-conspirator in the underlying TripleSpeed marketing fraud; trustee on Nikhil's life-insurance trust
  - In Round 6, host triggers the public murderer reveal — every other player sees a full-screen red overlay naming Alam, while Alam's own device falls through to OutroSplash. The action ends the game.

### **The Victim**
- **Nikhil** - Head of Marketing, TripleSpeed (deceased at 9:02 PM)
  - Had Stage 4 pancreatic cancer (4-6 month prognosis)
  - Was about to be indicted in SEBI's TripleSpeed metric-fraud investigation
  - Planned his own staged-murder with Alam
  - Not a real TripleSpeed employee — fictional character invented for the game

### **The 9 Suspects** (Each receives accusations from 3-4 players)
1. **Elias Bothell** - Co-Founder, Marketing (char_elias)
2. **Sukhans Asrani** - Co-Founder (char_sukhans)
3. **Priyanshu** - Penthouse roommate, vibe coder (char_priyanshu)
4. **Yash Shindey** - Crime-scene photographer (char_yash_s)
5. **Pranav Ahlawat** - Self-styled PI / TripleSpeed strategy (char_pranav)
6. **Vadini** - SEO (char_vadini)
7. **Ishika Goel** - Email Marketing (char_ishika)
8. **Neha Mittal** - Creative Strategist (char_neha)
9. **Mohit Aasirwal** - Software / analytics pipeline author (char_mohit)

### **The 22 Witnesses** (Non-suspects with mild grievances against Nikhil)
Ashish, Sonia, Prakarsh, Mihir, OG Yash, Amisha, Arush, Adi, Anusha (Ops), Prerna, Vidi, Tejas, Tauseef, Shashwat, Tushar, Kush, Meenakshi, Navya, Vipin, Riya, Xans, Bharatpreet

### **Character Data Structure**
```javascript
{
  id: 'char_alam',
  name: "Alam",
  role: "MURDERER" | "SUSPECT" | "WITNESS",
  profession: "Head of HR — 'A court poet'",
  bio: "Background description",
  quirk: "Personality trait",
  secret: "Hidden truth",
  neverDo: "Personal red line",
  isSuspect: true | false,
  motive: "Why they wanted Nikhil dead",
  timeline: "Time-stamped movements during the party",
  code: "Per-character social code (distinct from login code)"
}
```

**Note:** Character cards no longer display "Innocent Bystander" badges. Timeline display has been removed from the dashboard view to reduce clutter.

---

## 🔎 EVIDENCE & CLUES

### **Clue Categories**
- **ACCUSATION** - What witnesses saw suspects do (10 accusations, pre-assigned to players)
- **MOTIVE** - Why suspects wanted Rohan dead (10 motives, Round 2 codes)
- **EVIDENCE** - Forensic files (host-unlocked in Round 3)
- **CCTV** - Security footage evidence
- **REVELATION** - Major plot reveals
- **BOMBSHELL** - Game-changing discoveries
- **INTERROGATION** - Motive analysis

### **Clue Code Index**
See [CLUE_CODES.md](CLUE_CODES.md) for the full list. Categories:
- 10 Accusation codes (`ACCUSE_*`) — Round 1
- 10 Motive codes (themed to suspects' form quirks) — Round 2
- 7 Evidence codes (`EVIDENCE_*`) — Round 3
- 6 Revelation codes (`REVEAL_*`) — Rounds 4-5
- 1 Confession code (`THE_TRUTH`) — Round 6, Alam-only
- 32 Login codes (`LOGIN_CODE_MAP`)

### **Critical Timeline**
- 5:30-5:55 PM — Alam alone in the Penthouse, swaps Nikhil's vape cartridge for the toxin-loaded twin
- 6:30 PM — Catering arrives
- 7:00-7:45 PM — Guests trickle in. Nikhil drops his vape on the coffee-table tray
- 8:00 PM — Sukhans + Elias on stage. Series B at ₹400 Cr announced
- 8:15 PM — Nikhil takes the mic for his thank-you toast
- 8:18 PM — Nikhil hits his vape on stage. Toxin clock starts
- 8:25 PM — Power flicker, hallway CCTV out for ~3 minutes (red herring; real swap was hours earlier)
- 8:40 PM — Nikhil sits on the balcony bench, looking pale
- 8:45 PM — Nikhil collapses. Alam first to him
- 9:02 PM — Pronounced dead at the scene
- 9:30 PM — Bangalore Police arrive. Inspector Reema Mathur takes lead

---

## 🏗️ TECHNICAL ARCHITECTURE

### **Tech Stack**
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Backend:** Firebase 11.1.0 (Firestore Database)
- **PWA:** vite-plugin-pwa (Progressive Web App support)
- **State Management:** React useState + useMemo + Firebase real-time sync
- **Routing:** Custom tab-based navigation (no React Router)
- **Real-time Features:** Firebase Firestore listeners (chat, voting, game state)
- **Mobile Features:** Vibration API for haptic feedback

### **Design System**
- **Theme:** Detective noir / True crime aesthetic
- **Colors:** Stone/beige backgrounds, red accents, black borders
- **Typography:** "Handwritten" style fonts
- **Effects:** Hand-drawn sketches, coffee stains, rotated elements
- **Responsive:** Mobile-first design with sm: breakpoints

---

## 📁 PROJECT STRUCTURE

```
mystery-game/
├── public/
│   ├── manifest.json                     # PWA manifest
│   └── icon.svg                          # App icon
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   ├── IconComponents.jsx        # All SVG icons
│   │   │   └── ChatIcons.jsx             # Chat-specific icons
│   │   ├── layout/
│   │   │   ├── Header.jsx                # Top bar with round info
│   │   │   └── Navigation.jsx            # Bottom tab navigation (5 tabs)
│   │   ├── modals/
│   │   │   ├── DecoderModal.jsx          # Code input modal
│   │   │   ├── GuestProfileModal.jsx     # Character detail modal
│   │   │   └── VoteResultsModal.jsx      # Animated vote bar graph
│   │   ├── ui/
│   │   │   ├── Doodles.jsx               # SVG decorations
│   │   │   └── FeedbackToast.jsx         # Notification system
│   │   ├── views/
│   │   │   ├── DashboardView.jsx         # ID Card tab
│   │   │   ├── DossierView.jsx           # Guest Profiles tab
│   │   │   ├── FilesView.jsx             # Archives tab
│   │   │   ├── IntelView.jsx             # Evidence Board tab
│   │   │   ├── ChatView.jsx              # Real-time chat tab
│   │   │   ├── VotingView.jsx            # Dedicated voting interface
│   │   │   └── TimelineView.jsx          # Animated timeline view
│   │   ├── CharacterSelect.jsx           # Login screen
│   │   ├── GridMenu.jsx                  # Metro-style home hub
│   │   └── HostPanel.jsx                 # Admin controls
│   ├── data/
│   │   └── gameData.js                   # All game constants
│   ├── firebase/
│   │   └── config.js                     # Firebase initialization
│   ├── App.jsx                           # Main app controller
│   ├── App.css                           # Custom styles
│   ├── index.css                         # Tailwind imports
│   └── main.jsx                          # React entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── PROJECT_CONTEXT.md                    # This file
```

---

## 🎨 UI/UX DESIGN

### **Navigation System - Metro Grid Hub**
Windows 8/Nokia Lumia inspired interface with animated tile grid:

**Metro Grid Tiles:**
1. **ID** (Large 2x2 tile, Red) - Character role, secret, timeline, access code
2. **CLUES** (Amber) - Evidence board with unlocked clues
3. **CHAT** (Blue) - Real-time messaging between all players
4. **TIMELINE** (Indigo) - Animated timeline of character's movements
5. **VOTES** (Pink) - Dedicated voting interface with results
6. **FILES** (Emerald) - Case files, reports, CCTV sketches
7. **GUESTS** (Purple) - Guest profiles and information
8. **LOGOUT** (Stone Gray) - Exit to character selection

### **Key UI Components**
- **Character Select Screen** - Initial login to choose character
- **Metro Grid Menu** - Animated tile-based home hub (Windows 8 style)
- **Full-Screen Views** - Each tile opens a dedicated full-screen view
- **Close Button** - Red circular button (top-right) to return to grid
- **Header** - Shows current round and title (centered)
- **Decoder FAB** - Floating red button (only on Clues screen) for entering codes
- **Host Panel** - Hidden admin controls (tap ghost logo 3x on grid menu)
- **Guest Profile Modal** - Full character details (no voting)
- **Timeline View** - Animated timeline of character's movements with murder context
- **Voting View** - Dedicated screen with suspect cards, vote counts, and results
- **Vote Results Modal** - Animated bar graph accessible from Voting screen
- **Feedback Toast** - Success/error messages

### **Visual Style Guide**
- **Metro Tiles**: Smooth animations, shimmer effects, poppy colors
- **Transitions**: Slide-in animations between views
- **Touch Gestures**: Scale effects on tap, haptic feedback
- Hand-drawn borders and sketchy shadows (maintained on content)
- Coffee stain decorations
- Rotated card elements (rotate-1, rotate-[-2deg])
- Dashed borders for evidence/documents
- CCTV-style sketch illustrations
- Fingerprint icon for ID
- Ghost mascot for branding

---

## 🔐 STATE MANAGEMENT

### **Global State (App.jsx)**
```javascript
// User Identity
currentUser: string | null              // Selected character ID

// Game State (Synced with Firebase)
currentRound: number (0-6)              // Current game round
isVotingOpen: boolean                   // Voting phase active
unlockedClues: string[]                 // Array of unlocked clue IDs (local only)
votes: { [userId]: { [round]: suspectId } }  // All votes (Firebase)
voteCounts: { [suspectId]: count }      // Aggregated vote counts (Firebase)

// UI State
activeTab: string                       // Current view tab
inputCode: string                       // Decoder input
feedback: { type, msg } | null         // Toast notification
modalOpen: boolean                      // Decoder modal
selectedGuest: Character | null         // Profile modal
hostPanelOpen: boolean                  // Admin panel
secretTapCount: number                  // Host panel unlock counter
```

### **Firebase Real-Time Sync**
```javascript
// Game State Document (gameState/current)
{
  currentRound: 0,
  isVotingOpen: false,
  lastUpdated: timestamp
}

// Votes Document (gameState/votes)
{
  votes: { userId: { round: suspectId } },
  voteCounts: { suspectId: count },
  lastUpdated: timestamp
}

// Messages Collection (messages/*)
{
  characterId: string,
  characterName: string,
  message: string,
  timestamp: serverTimestamp,
  createdAt: number
}
```

---

## 🎯 GAME FLOW & USER ACTIONS

### **Player Journey**
1. **Select Character** → `handleLogin(id)` → Opens Metro Grid Menu
2. **Navigate Grid** → Tap tiles to open full-screen views
3. **View ID Card** → See role, secret, access code
4. **Enter Clues** → Tap Decoder FAB (only on Clues screen) → `handleCodeSubmit(e)`
5. **Unlock Evidence** → Clues added to Intel view
6. **Review Guests** → Browse Guest Profiles in Dossier
7. **Vote** → Open Votes tile → Select suspect (tap twice to confirm) → `submitVote(suspectId)`
8. **View Results** → Tap "View Vote Results" button in Voting screen
9. **Return Home** → Tap close button (top-right) to return to grid
10. **Logout** → Tap LOGOUT tile from grid menu
11. **Advance Rounds** → Host controls round progression from Host Panel

### **Host Actions (Admin)**
- Triple-tap ghost logo to open Host Panel
- Adjust current round (+/-)
- Toggle voting open/closed
- Monitor game progress

### **Code Validation Logic**
```javascript
// Check if clue code
if (foundClue) {
  if (foundClue.roundReq > currentRound) → ERROR: "CLUE LOCKED"
  else if (already unlocked) → INFO: "Already in files"
  else → SUCCESS: Add to unlockedClues, navigate to Intel
}
// Check if character code
else if (foundChar) → SUCCESS: "MET: [name]"
// Invalid code
else → ERROR: "INVALID CODE"
```

---

## 🔧 CONFIGURATION & SETUP

### **Installation**
```bash
npm install
```

### **Development**
```bash
npm run dev
# Runs on http://localhost:5173
```

### **Build & Deploy**
```bash
npm run build        # Production build
npm run preview      # Preview build
npm run deploy       # Deploy to GitHub Pages
```

### **Key Dependencies**
- react + react-dom (19.2.0)
- vite (7.2.4)
- tailwindcss (4.1.18)
- firebase (11.1.0)
- vite-plugin-pwa (^0.21.1)
- workbox-window (^7.3.0)
- @vitejs/plugin-react (5.1.1)

---

## 🎭 GAMEPLAY HOSTING GUIDE

### **Pre-Game Setup**
1. Print character cards with codes
2. Prepare clue cards/QR codes for physical distribution
3. Assign roles secretly (only player sees their own)
4. Brief players on basic mechanics

### **During Game**
1. Host opens Round 0 (Pre-Game mingling)
2. Advance through rounds every 15-20 minutes
3. Distribute round-specific clues physically
4. Open voting at strategic points (Rounds 3, 5, 6)
5. Encourage role-playing and socializing

### **Endgame**
1. Round 6 reveal phase
2. Final vote
3. Murderer revelation
4. Debrief and discussion

---

## 🚀 IMPLEMENTED FEATURES

### **Progressive Web App (PWA)** ✅
- Install to home screen on mobile and desktop
- Offline support with service worker caching
- Standalone app mode (no browser UI)
- Custom detective-themed app icon
- Splash screen support
- Portrait-optimized for mobile devices
- Auto-update on new deployments

### **Haptic Feedback (Vibration)** ✅
- Double buzz when receiving new chat messages
- Quick tap confirmation when sending messages
- Triple buzz on errors
- Smart detection (doesn't vibrate for own messages)
- Works on all modern mobile browsers

### **Real-Time Chat System** ✅
- Firebase Firestore integration for real-time messaging
- Character-based message identification
- Auto-scroll to newest messages
- Timestamp display (relative time)
- Persistent message history across sessions
- Real-time synchronization across all players
- Responsive chat UI with send button and input
- Full-screen layout with proper scroll containment
- Fixed scroll behavior (prevents background scrolling)

### **Real-Time Voting System** ✅
- All votes synced via Firebase Firestore
- Players can change votes (overwrites previous)
- Automatic vote counting and aggregation
- Real-time updates across all devices
- Vote history tracking per user and round

### **Animated Timeline View** ✅
- Full-screen animated timeline interface
- Parses character timeline text into structured events
- Staggered slide-in animations (200ms delay per event)
- Visual timeline with gradient line (purple/indigo)
- Numbered event dots (critical events get ⚠️ icon)
- Critical events highlighted in red (kitchen, ice, poison mentions)
- Time stamps displayed prominently for each event
- Murder context section with key timeline moments
- Shows critical times: 6:50 PM (poison placement) to 8:19 PM (death)
- Detective notes section with investigation tips
- Special indicator for murderer role
- Smooth transitions and hover effects
- Helps players compare alibis and find inconsistencies

### **Metro-Style Grid Navigation** ✅
- Windows 8/Nokia Lumia inspired tile interface
- Animated slide-up entrance with stagger effect
- Shimmer and scale effects on hover/tap
- Full-screen views with slide-in transitions
- Close button to return to grid hub
- Responsive grid layout (2 columns, auto-rows)
- Haptic feedback on tile taps
- Smooth Metro-style animations (cubic-bezier easing)

### **Dedicated Voting Interface** ✅
- Full-screen voting view (separate from Guest Profiles)
- Large suspect cards in 2-column grid layout
- Two-tap confirmation system (select then confirm)
- Live vote counts displayed on suspect cards
- Visual status indicators (green ring for your vote)
- Integrated "View Vote Results" button
- Animated bar graph modal
- Real-time updates as votes are cast
- Shows vote counts and percentages
- 🏆 badge for top suspect
- Mobile-friendly with smooth animations

### **Remote Host Controls** ✅
- Triple-tap ghost logo to access Host Panel
- Change game round (syncs to all devices instantly)
- Open/close voting (syncs to all devices instantly)
- Firebase-powered real-time synchronization
- Visual feedback for remote control status
- Enhanced UI with better controls

### **Firebase Integration** ✅
- Firestore Database configured and active
- Real-time listeners with onSnapshot
- Game state synchronization (rounds, voting status)
- Vote management and aggregation
- Message collection with automatic ordering
- Server-side timestamps for message sync
- Firebase config file: `src/firebase/config.js`
- Project ID: murder-1bf1c

---

## 🚀 FUTURE ENHANCEMENTS (TODO)

### **Potential Features**
- [ ] Multiple mystery scenarios (different stories)
- [ ] Achievement/badge system
- [ ] Leaderboard for fastest solves
- [ ] Audio/sound effects
- [ ] Dark mode toggle
- [ ] Print-friendly character sheet generation
- [ ] QR code clue distribution
- [ ] Timer per round
- [ ] Host dashboard with analytics
- [ ] Save/resume game state

### **Technical Improvements**
- [ ] Unit tests (Jest/Vitest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] TypeScript conversion
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance optimization (React.memo, lazy loading)
- [ ] PWA support (offline capability)
- [ ] Animation library integration (Framer Motion)

---

## 📝 GAME DESIGN NOTES

### **Balancing Considerations**
- **Information Flow:** Clues unlock progressively to prevent early solving
- **Social Dynamics:** Character codes encourage player interaction
- **Difficulty:** Multiple red herrings and suspicious characters
- **Pacing:** 7 rounds over ~2-3 hours allows thorough investigation
- **Fairness:** All players have equal access to public evidence

### **Key Mystery Elements**
- **Motive:** All 10 suspects have motives — fraud-adjacent (Elias, Sukhans, Vadini, Ishika, Neha, Mohit) + personal-leverage (Alam, Priyanshu, Yash Shindey, Pranav)
- **Opportunity:** Communal vape station gives many suspects plausible access; the actual swap window was BEFORE the party (5:30-5:55 PM, Alam alone)
- **Method:** Sodium-azide-laced vape cartridge, swapped for an identical-looking clean one
- **Red Herrings:** 8:25 PM CCTV power flicker (unrelated), Mohit's Megadeth-fueled disappearance, Neha's poisoning-subplot manuscript, Vadini's Kill Bill GIF, Pranav's "podcast research" questions
- **Critical Evidence (for the surface answer 'who murdered Nikhil'):** Vape forensics + HR access logs + insurance trust amendment + Nikhil's voice notes
- **The Real Answer:** It wasn't a murder in the way the room thinks. Alam swapped the cartridge, but Nikhil planned it with him. The "murder" is staged-suicide-as-insurance-fraud-as-fraud-case-collapse

### **Winning Condition**
Players collectively identify Alam as the killer through:
1. HR access-log timing (out-of-hours edits in January 2026 timed with the SEBI tip)
2. Trust-deed amendment naming Alam trustee with self-dealing rights
3. Nikhil's voice notes (recovered) explicitly naming Alam as accomplice
4. Vape cartridge forensics (wiped, fresh swap)
5. Alam's behavior at the scene (composed, first to victim, phone in airplane mode)

---

## 🐛 KNOWN ISSUES / LIMITATIONS

### **Current Limitations**
- No persistence for unlocked clues (local storage only, resets on refresh)
- No authentication system (players self-select characters, can impersonate)
- Host panel discoverable by anyone (no password protection)
- No private messaging between players
- No player roster/presence detection
- No print stylesheet for character cards
- No mobile app (web-only)

### **Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive but optimized for larger screens
- Requires JavaScript enabled
- Best experience on tablets/desktops

---

## 📞 SUPPORT & DEVELOPMENT

### **File Modification Guide**

**To add a new character:**
1. Edit `src/data/gameData.js` → CHARACTERS array
2. Add character object with all required fields

**To add new clues:**
1. Edit `src/data/gameData.js` → CLUE_DB array
2. Specify roundReq and code

**To add a new grid tile:**
1. Edit `src/components/GridMenu.jsx` → menuItems array
2. Create corresponding view in `src/components/views/`
3. Add route handler in `App.jsx`

**To modify UI:**
1. Individual components in `src/components/`
2. Styling in Tailwind classes or `App.css`
3. Metro animations in `App.css` (slideInUp, shimmer, etc.)

**To change game flow:**
1. Edit `App.jsx` for logic
2. Edit `gameData.js` for content

### **Debugging Tips**
- Check browser console for errors
- Use React DevTools to inspect state
- Host Panel shows current round/voting status and unlocked files
- Toast feedback shows code validation results
- Check Firebase console for real-time data sync

---

## 📊 GAME DATA STRUCTURE (gameData.js)

### **Key Exports**
- `CHARACTERS` (32 characters) - All player identities with roles, bios, timelines
- `ACCUSATION_CLUES` (10 clues) - Pre-assigned accusations with `assignedTo[]` arrays
- `MOTIVE_CLUES` (10 clues) - Round 2 codes revealing why suspects wanted Nikhil dead
- `EVIDENCE_CLUES` (7 clues) - Round 3 forensic + document codes
- `REVELATION_CLUES` (6 clues) - Rounds 4-5 codes revealing the cancer + fraud + insurance + HR-trail twist
- `CONFESSION_CLUE` (1 clue) - Special clue for Alam only in Round 6
- `CASE_FILES` (6 files) - Host-unlocked documents with `roundReq` field
- `CLUE_DB` - Combined array of all clues for decoder validation

### **Helper Functions**
- `getAssignedAccusation(characterId)` - Returns accusation assigned to player
- `getSuspects()` - Returns all characters with `isSuspect: true`
- `getWitnesses()` - Returns non-suspect characters
- `isMurderer(characterId)` - Checks if character is Alam (`char_alam`)

### **File Round Requirements**
- **Round 0:** Incident Report (f_incident)
- **Round 3:** Toxicology Report, Funding Round Dossier
- **Round 4:** Medical Records, Insurance Policy Summary, SEBI Inquiry Extract

---

## 📄 LICENSE & CREDITS

**Project:** The Nikhil Murder Mystery (TripleSpeed Edition)  
**Framework:** React + Vite + Tailwind CSS  
**Icons:** Custom SVG components (inline)  
**Fonts:** System fonts with handwritten fallbacks  
**Story:** TripleSpeed office activity — fictional staged-murder + corporate-fraud twist; cast = real colleagues

---

**Last Updated:** May 8, 2026  
**Version:** 4.0.0 (TripleSpeed Edition)  
**Status:** Production PWA with 32-player support, host controls, and real-time multiplayer

---

## 🎬 QUICK START CHECKLIST

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Configure Firebase (see FIREBASE_SETUP.md)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Select a character (try login code `COURTPOET` for Alam — murderer experience)
- [ ] Triple-tap ghost logo for Host Panel
- [ ] Advance to Round 1 to see accusation card
- [ ] Try entering code: `COURTPOET` (Round 2+ motive clue for Alam)
- [ ] Unlock files from Host Panel
- [ ] Open voting from Host Panel
- [ ] Vote for a suspect in Voting tab
- [ ] Toggle vote results visibility
- [ ] Advance to Round 6 and trigger murderer reveal (every player's screen flips to a full-screen red overlay naming Alam; game ends)
- [ ] View animated vote results
- [ ] Send chat messages and feel vibration
- [ ] Explore all 5 tabs (ID, Clues, Chat, Files, Guests)
- [ ] Install PWA on mobile device
- [ ] Test offline functionality

**Congratulations! You're ready to host a murder mystery party! 🎉**
