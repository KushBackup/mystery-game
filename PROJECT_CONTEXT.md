# 🔍 THE TAHER PARTY - Murder Mystery Game
## Complete Project Context & Instructions

---

## 📖 GAME OVERVIEW

**Game Type:** Interactive Murder Mystery Party Game  
**Platform:** Web Application (React + Vite + Tailwind CSS)  
**Theme:** Detective noir with hand-drawn sketch aesthetic  
**Players:** 11 characters (1 murderer, 1 victim, 9 suspects/innocents)  
**Gameplay Duration:** ~2-3 hours across 7 rounds  

### **Story Premise**
Taher Merchant, a reformed serial bully, invites all his past victims to an apology party at "For the Record" bar. During his apology speech, he collapses and dies from poisoning. Players must investigate, gather clues, and vote to identify the murderer.

### **Murder Method**
- **Weapon:** Slow-acting synthetic toxin
- **Delivery:** Poisoned ice cubes in Taher's drink
- **Murderer:** Vikram (Personal Assistant)
- **Motive:** Gambling debt exploitation by Taher

---

## 🎮 GAME MECHANICS

### **Core Gameplay Loop**
1. **Character Selection** - Players choose their character identity
2. **Round Progression** - Host advances through 7 rounds
3. **Clue Discovery** - Players enter codes to unlock evidence
4. **Social Interaction** - Players share character codes to "meet" each other
5. **Voting** - Players vote for suspects when host opens voting
6. **Investigation** - Review timelines, forensics, and interrogations
7. **Reveal** - Final round reveals the murderer

### **Code System**
- Each character has a unique code (e.g., "ASSISTANT_V")
- Clues have codes that unlock evidence (e.g., "POISON001")
- Codes can only be unlocked if current round >= clue's required round
- Players physically exchange codes in-person or via print materials

### **Round Structure**
```
Round 0: Pre-Game (Arrivals & Mingling)
Round 1: The Apology (Backstories & Grudges)
Round 2: The Incident (Timelines & Alibis) - Timelines unlock
Round 3: Forensics (Toxicology & Physical Evidence)
Round 4: Interrogations (Motives & Confessions)
Round 5: The Bombshell (Deep Secrets Revealed)
Round 6: The Reveal (Case Closed)
```

---

## 👥 CHARACTER ROSTER

### **The Murderer**
- **Vikram** - Personal Assistant (ASSISTANT_V)
  - Motive: Gambling debt controlled by Taher
  - Method: Pre-prepared poisoned ice placed in kitchen

### **The Victim**
- **Taher Merchant** - The Host (deceased at 8:19 PM)

### **The Suspects** (10 characters)
1. **Anish Shirwant** - Industrialist (ANISH_S)
2. **Anubhav Raina** - Self-Employed (ANUBHAV_R)
3. **Ishank Mahale** - Digital Marketing (ISHANK_M)
4. **Esha** - Design Scientist (ESHA_D)
5. **Ajay Jain** - Product Manager (AJAY_J)
6. **Tanishka Sheokand** - Fashion Designer (TANISHKA_S)
7. **Andrew Pereira** - Journalist (ANDREW_P)
8. **Bharath Raj** - Student (BHARATH_R)
9. **Anika** - Life Coach/Singer (ANIKA_L)
10. **Priya** - Taher's Wife (PRIYA_W) - INNOCENT survivor

### **Character Data Structure**
```javascript
{
  id: 'char_vikram',
  name: "Vikram",
  role: "MURDERER" | "SUSPECT" | "VICTIM" | "INNOCENT",
  profession: "Personal Assistant",
  bio: "Background description",
  quirk: "Personality trait/fun fact",
  secret: "Hidden information/motive",
  code: "ASSISTANT_V",
  timeline: "Time-stamped alibi"
}
```

---

## 🔎 EVIDENCE & CLUES

### **Clue Categories**
- **BACKSTORY** - Character history and relationships
- **TIMELINE** - Where characters were during key moments
- **FORENSICS** - Physical evidence and toxicology
- **CLUE** - Investigative findings
- **CCTV** - Security footage evidence
- **REVELATION** - Major plot reveals
- **BOMBSHELL** - Game-changing discoveries
- **INTERROGATION** - Motive analysis

### **Key Evidence Codes**
```
BULLY001        - Taher's History
APOLOGY002      - The Sudden Change
TIMELINE001     - Official Timelines
PHONECALL004    - The Angry Call
ASSISTANT005    - The Assistant's Role
POISON001       - Toxicology Report
ICECUBES006     - Ice Preference
WIFE007         - The Survivor
CCTVKITCHEN008  - Kitchen CCTV
MOTIVE001       - Motive Analysis
OPPORTUNITY002  - Who Had Access?
BOMBSHELL001    - The Assistant's Debt
COOLER001       - The Cooler (smoking gun)
```

### **Critical Timeline**
- 6:00 PM - Vikram begins setup
- 6:50 PM - Vikram places poisoned ice in kitchen freezer
- 7:00-8:00 PM - Various guests arrive and mingle
- 8:00 PM - Taher begins speech
- 8:05 PM - Taher pours drinks and adds ice
- 8:10 PM - Priya sips from glass (survives - ice not melted yet)
- 8:19 PM - Taher collapses and dies

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
- **Motive:** All suspects have motives (Taher wronged everyone)
- **Opportunity:** Only Vikram had kitchen access for poisoned ice
- **Method:** Ice cube poisoning is clever and untraceable initially
- **Red Herrings:** Anubhav's "Murder" secret, Ishank's hidden cam
- **Critical Evidence:** Timeline + CCTV + Survivor testimony = solution

### **Winning Condition**
Players collectively identify Vikram as the murderer through:
1. Analyzing timelines (who had kitchen access)
2. Forensic evidence (poison in ice, not glass)
3. Priya's survival (ice hadn't melted when she sipped)
4. Motive discovery (gambling debt control)
5. Physical evidence (poison traces in Vikram's cooler)

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
- Host Panel shows current round/voting status
- Toast feedback shows code validation results

---

## 📄 LICENSE & CREDITS

**Project:** The Taher Party - Murder Mystery Game  
**Framework:** React + Vite + Tailwind CSS  
**Icons:** Custom SVG components (inline)  
**Fonts:** System fonts with handwritten fallbacks  

---

**Last Updated:** January 24, 2026  
**Version:** 2.1.0  
**Status:** Production PWA with Metro UI and real-time multiplayer features

---

## 🎬 QUICK START CHECKLIST

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Select a character
- [ ] Try entering code: "ASSISTANT_V"
- [ ] Try entering clue: "BULLY001"
- [ ] Triple-tap ghost logo for Host Panel
- [ ] Change round and watch all devices update
- [ ] Open voting from Host Panel
- [ ] Vote for a suspect in Dossier tab
- [ ] Switch to Chat tab and see 📊 vote button
- [ ] View animated vote results
- [ ] Send chat messages and feel vibration
- [ ] Explore all 5 tabs (ID, Clues, Chat, Files, Guests)
- [ ] Install PWA on mobile device
- [ ] Test offline functionality

**Congratulations! You're ready to host a murder mystery party! 🎉**
