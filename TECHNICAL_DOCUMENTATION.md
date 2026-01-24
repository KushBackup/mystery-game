# 🔧 Murder Mystery Game - Technical Documentation
## Complete Application Architecture & Features

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Technical Stack](#technical-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Architecture & State Management](#architecture--state-management)
6. [UI/UX Design System](#uiux-design-system)
7. [Navigation System](#navigation-system)
8. [Game Mechanics & Logic](#game-mechanics--logic)
9. [Firebase Integration](#firebase-integration)
10. [Progressive Web App (PWA)](#progressive-web-app-pwa)
11. [Setup & Deployment](#setup--deployment)
12. [Component Reference](#component-reference)
13. [Configuration Guide](#configuration-guide)

---

## 📖 OVERVIEW

**Application Type:** Interactive multiplayer web-based murder mystery party game  
**Platform:** Progressive Web App (PWA)  
**Architecture:** React Single Page Application with real-time Firebase backend  
**Design Theme:** Detective noir with hand-drawn sketch aesthetic  
**Game Scale:** 32 concurrent players (1 murderer, 9 suspects, 22 witnesses, 1 victim)

### **Purpose**
This application provides a digital platform for hosting and playing murder mystery party games with the Rohan Sharma case - a complex insurance fraud scheme involving assisted suicide disguised as murder. Players investigate clues, unlock evidence, and vote to identify the culprit.

### **Key Concepts**
- **Character-based gameplay:** 32 unique character identities
- **Round-based progression:** Game advances through 7 rounds (0-6) with host controls
- **Pre-assigned accusations:** Each player receives 1 of 10 accusation cards
- **Host-controlled evidence:** Files unlock at specific rounds by host action
- **Vote visibility control:** Host decides when results are shown to players
- **Murderer revelation:** Special confession clue appears only for Esha in Round 6
- **Real-time multiplayer:** All players see synchronized game state via Firebase
- **Mobile-first:** Optimized for mobile devices with touch interactions

---

## 🛠 TECHNICAL STACK

### **Frontend Framework**
- **React** 19.2.0 - UI component library
- **Vite** 7.2.4 - Build tool and dev server
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework

### **Backend & Database**
- **Firebase** 11.1.0 - Backend as a Service (BaaS)
  - **Firestore Database** - Real-time NoSQL database
  - **Firebase Hosting** - Static file hosting
  - **Server Timestamps** - Consistent time synchronization

### **Progressive Web App**
- **vite-plugin-pwa** ^0.21.1 - PWA integration for Vite
- **workbox-window** ^7.3.0 - Service worker management
- **Manifest.json** - App manifest for installation

### **Build Tools**
- **@vitejs/plugin-react** 5.1.1 - React Fast Refresh support
- **PostCSS** - CSS processing
- **ESLint** - Code linting

### **Browser APIs**
- **Vibration API** - Haptic feedback on mobile devices
- **Service Worker API** - Offline support and caching
- **Local Storage** - Client-side data persistence

---

## 📁 PROJECT STRUCTURE

```
mystery-game/
├── public/
│   ├── manifest.json                     # PWA manifest configuration
│   └── icon.svg                          # Application icon
│
├── src/
│   ├── components/
│   │   │
│   │   ├── icons/
│   │   │   ├── IconComponents.jsx        # All SVG icon definitions (Target, Skull added)
│   │   │   └── ChatIcons.jsx             # Chat-specific icon set
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx                # Top bar (round display, title)
│   │   │   └── Navigation.jsx            # Bottom tab bar (5-tab navigation)
│   │   │
│   │   ├── modals/
│   │   │   ├── DecoderModal.jsx          # Code entry modal
│   │   │   ├── GuestProfileModal.jsx     # Character detail modal
│   │   │   └── VoteResultsModal.jsx      # Animated voting results graph
│   │   │
│   │   ├── ui/
│   │   │   ├── Doodles.jsx               # Decorative SVG elements
│   │   │   └── FeedbackToast.jsx         # Toast notification system
│   │   │
│   │   ├── views/
│   │   │   ├── DashboardView.jsx         # ID Card view (character info)
│   │   │   ├── DossierView.jsx           # Guest Profiles view (32 characters)
│   │   │   ├── FilesView.jsx             # Archives/Files view (round-gated)
│   │   │   ├── IntelView.jsx             # Evidence Board (accusation cards, clues, confession)
│   │   │   ├── ChatView.jsx              # Real-time chat interface
│   │   │   ├── VotingView.jsx            # Voting interface (10 suspects only)
│   │   │   └── TimelineView.jsx          # Character timeline (murder timeline for suspects only)
│   │   │
│   │   ├── CharacterSelect.jsx           # Login/character selection screen
│   │   ├── GridMenu.jsx                  # Metro-style tile-based home hub
│   │   └── HostPanel.jsx                 # Admin control panel (expanded controls)
│   │
│   ├── data/
│   │   └── gameData.js                   # Game content (32 chars, accusations, motives, files)
│   │
│   ├── firebase/
│   │   └── config.js                     # Firebase initialization & host functions
│   │
│   ├── App.jsx                           # Main application controller
│   ├── App.css                           # Custom styles & animations
│   ├── index.css                         # Tailwind imports & global styles
│   └── main.jsx                          # React entry point
│
├── STORY.md                              # Complete narrative bible (32 characters)
├── dev-dist/                             # Development service worker files
├── index.html                            # HTML entry point
├── package.json                          # Dependencies & scripts
├── vite.config.js                        # Vite configuration (PWA, build)
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
└── eslint.config.js                      # ESLint configuration
```

---

## 🎯 CORE FEATURES

### **1. Progressive Web App (PWA)** ✅
- **Installation:** Add to home screen on mobile and desktop
- **Offline Support:** Service worker caching for offline gameplay
- **Standalone Mode:** Launches without browser UI chrome
- **Custom Icon:** Detective-themed app icon
- **Splash Screen:** Branded loading screen
- **Portrait Lock:** Optimized for portrait orientation on mobile
- **Auto-update:** Automatic updates on new deployments

### **2. Real-Time Multiplayer** ✅
- **Firebase Firestore Integration:** Real-time database synchronization
- **Game State Sync:** Current round, voting status, file unlocks synced across all devices
- **Vote Synchronization:** All votes stored and aggregated in real-time
- **Chat System:** Live messaging between all 32 players
- **Host Controls:** Real-time propagation of file unlocks, vote visibility, murderer reveal
- **Instant Updates:** Changes propagate to all connected clients within milliseconds

### **3. Metro-Style Navigation** ✅
- **Windows 8/Nokia Lumia Inspired:** Animated tile-based interface
- **8 Navigation Tiles:**
  1. ID Card (2x2 large tile)
  2. Clues/Evidence Board (shows accusation cards, unlocked clues, confession)
  3. Real-time Chat
  4. Timeline View (personal timeline + murder context for suspects)
  5. Voting Interface (10 suspects only, controlled visibility)
  6. Files/Archives (round-gated file unlocking)
  7. Guest Profiles (all 32 characters)
  8. Logout
- **Smooth Animations:** Slide-up entrance, shimmer effects, scale on hover
- **Full-Screen Views:** Each tile opens a dedicated full-screen interface
- **Universal Close Button:** Red circular button (top-right) returns to grid

### **4. Pre-Assigned Accusation System** ✅ NEW
- **Accusation Distribution:** Each player automatically receives 1 of 10 accusations
- **Assignment Logic:** 
  - 10 unique accusations distributed across 32 players
  - Each accusation assigned to 3-4 specific players
  - No player accuses themselves
  - Defined in `ACCUSATION_CLUES.assignedTo[]` arrays
- **Round Gating:** Accusations appear in Round 1+
- **Visual Design:** Amber-bordered cards with "YOUR ACCUSATION CARD" badge
- **Sharing Instructions:** Players encouraged to share accusations verbally

### **5. Host-Controlled File Unlocking** ✅ NEW
- **Round-Gated Files:**
  - Round 0: Incident Report (1 file)
  - Round 3: Evidence Files (5 files - toxicology, CCTV, witness statements, etc.)
  - Round 4: Revelation Files (3 files - journal, medical records, suicide evidence)
- **Host Panel Controls:**
  - Unlock Round 0 button
  - Unlock Round 3 button  
  - Unlock Round 4 button
  - Visual indicators show unlock status
- **Firebase Sync:** `unlockedFiles` array synced to all players
- **FilesView Filtering:** Only shows unlocked files, displays locked file counts

### **6. Code Validation System** ✅
- **Two Code Types:**
  - **Motive Codes:** Distributed via printed cards in Round 2 (10 codes)
  - **Revelation Codes:** Distributed via printed cards in Round 4 (5 codes)
- **Round Gating:** Clues only unlock if current round >= required round
- **Duplicate Detection:** Prevents re-unlocking already discovered clues
- **Instant Feedback:** Toast notifications for success/error states
- **No Character Codes:** Removed in favor of pre-assigned accusations

### **7. Real-Time Chat System** ✅
- **Character-Based Messaging:** Messages tagged with character identity
- **Auto-Scroll:** Automatically scrolls to newest messages
- **Timestamp Display:** Relative time formatting (e.g., "2 minutes ago")
- **Persistent History:** Messages stored in Firestore, survive page refresh
- **Haptic Feedback:** Vibration on send/receive (mobile devices)
- **Fixed Layout:** Prevents background scrolling issues

### **8. Advanced Voting System** ✅ ENHANCED
- **Dedicated Voting Interface:** Full-screen voting view with suspect cards
- **Suspect Filtering:** Only shows 10 suspects (MURDERER + SUSPECT roles)
- **Two-Tap Confirmation:** Select suspect, then confirm vote
- **Live Vote Counts:** Real-time display of vote tallies per suspect
- **Vote History:** Tracks all votes per user per round
- **Vote Changes:** Players can change votes (overwrites previous)
- **Host-Controlled Results:** Vote results only visible when host enables
- **Locked Results Message:** Players see "Results locked by host" when hidden
- **Animated Results:** Bar graph modal with percentages and winner badge
- **Firebase Sync:** All votes and visibility state stored in Firestore

### **9. Animated Timeline View** ✅ UPDATED
- **Personal Timeline:** Character-specific movements during the party
- **Murder Context Timeline:** Shows key events (8:00 PM speech → 9:30 PM police)
- **Visibility Control:** Murder timeline only visible to suspects (MURDERER + SUSPECT roles)
- **Witness Protection:** 22 witnesses don't see murder timeline (preserves Round 4 twist)
- **Event Parsing:** Converts text timelines into structured event list
- **Staggered Animations:** Events slide in sequentially (200ms delay)
- **Visual Timeline:** Vertical gradient line with numbered dots
- **Critical Events:** Red highlighting for key moments (mentions of weapons, locations)
- **Time Stamps:** Prominent display of event times
- **Context Section:** Shows critical game timeline moments
- **Detective Notes:** Investigation tips and hints
- **Role-Specific:** Special indicators for different character roles

### **8. Host Control Panel** ✅
- **Secret Access:** Triple-tap ghost logo on grid menu to unlock
- **Round Management:** Increment/decrement current game round
- **Voting Control:** Open/close voting phase
- **Remote Sync:** All changes instantly propagate to all players
- **Visual Feedback:** Displays current game state and control status
- **Firebase-Powered:** Uses Firestore to broadcast changes

### **9. Haptic Feedback** ✅
- **Chat Messages:** Double buzz when receiving new messages
- **Send Confirmation:** Quick tap when sending message
- **Error Feedback:** Triple buzz on validation errors
- **Smart Detection:** Doesn't vibrate for own messages
- **Cross-Platform:** Works on all modern mobile browsers

### **10. Toast Notification System** ✅
- **Four Types:** SUCCESS, ERROR, INFO, WARNING
- **Auto-Dismiss:** Fades out after 3 seconds
- **Color-Coded:** Green (success), red (error), blue (info), amber (warning)
- **Non-Blocking:** Appears at bottom without interrupting gameplay
- **Message Queue:** Handles multiple notifications gracefully

---

## 🏗 ARCHITECTURE & STATE MANAGEMENT

### **State Architecture**

The application uses a **hybrid state management** approach:
- **Local State:** React `useState` for UI-only state
- **Firebase Sync:** Firestore real-time listeners for shared game state
- **Local Storage:** Browser storage for unlocked clues (persists across sessions)

### **Global State (App.jsx)**

```javascript
// User Identity
currentUser: string | null              // Selected character ID (e.g., "char_vikram")

// Game State (Synced with Firebase)
currentRound: number (0-6)              // Current game round
isVotingOpen: boolean                   // Whether voting is currently active
votes: {                                // All player votes
  [userId]: {
    [round]: suspectId
  }
}
voteCounts: {                           // Aggregated vote counts
  [suspectId]: count
}

// Local State (Client-Only)
unlockedClues: string[]                 // Array of unlocked clue IDs
activeTab: string                       // Current view/screen
inputCode: string                       // Current decoder input
feedback: { type, msg } | null          // Toast notification state
modalOpen: boolean                      // Decoder modal visibility
selectedGuest: Character | null         // Profile modal selected character
hostPanelOpen: boolean                  // Admin panel visibility
secretTapCount: number                  // Counter for host panel unlock (3 taps)
```

### **Firebase Firestore Schema**

```javascript
// Document: gameState/current
{
  currentRound: number,           // 0-6
  isVotingOpen: boolean,          // true/false
  lastUpdated: timestamp          // Server timestamp
}

// Document: gameState/votes
{
  votes: {                        // Nested object
    userId: {
      round: suspectId
    }
  },
  voteCounts: {                   // Aggregated counts
    suspectId: count
  },
  lastUpdated: timestamp          // Server timestamp
}

// Collection: messages
// Documents auto-generated with unique IDs
{
  characterId: string,            // e.g., "char_vikram"
  characterName: string,          // e.g., "Vikram"
  message: string,                // Message text
  timestamp: serverTimestamp,     // Firestore server timestamp
  createdAt: number               // Client timestamp (milliseconds)
}
```

### **Data Flow**

```
User Action
    ↓
Component Handler (e.g., handleVote)
    ↓
State Update (setState)
    ↓
Firebase Write (setDoc/updateDoc)
    ↓
Firestore Database
    ↓
Real-time Listener (onSnapshot)
    ↓
State Update (all connected clients)
    ↓
UI Re-render
```

### **Real-Time Synchronization**

```javascript
// Game State Listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'gameState', 'current'),
    (docSnap) => {
      const data = docSnap.data();
      setCurrentRound(data.currentRound);
      setIsVotingOpen(data.isVotingOpen);
    }
  );
  return unsubscribe;
}, []);

// Votes Listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'gameState', 'votes'),
    (docSnap) => {
      const data = docSnap.data();
      setVotes(data.votes || {});
      setVoteCounts(data.voteCounts || {});
    }
  );
  return unsubscribe;
}, []);

// Messages Listener
useEffect(() => {
  const q = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'asc')
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMessages(msgs);
  });
  return unsubscribe;
}, []);
```

---

## 🎨 UI/UX DESIGN SYSTEM

### **Design Philosophy**
- **Mobile-First:** Optimized for portrait mobile screens
- **Touch-Friendly:** Large tap targets, swipe gestures
- **Haptic Feedback:** Vibration for key interactions
- **Smooth Animations:** Metro-style transitions and effects
- **Theme Consistency:** Detective noir aesthetic throughout

### **Color Palette**

```javascript
// Tailwind CSS Color System
Background: stone-100, stone-200, stone-300  // Beige/tan tones
Accents: red-500, red-600                    // Primary action color
Secondary: amber-400, blue-500, emerald-500  // Tile colors
Text: stone-800, stone-900                   // Dark text
Borders: stone-900                           // Hand-drawn style
Success: green-500
Error: red-600
Info: blue-500
Warning: amber-500
```

### **Typography**

```css
/* Primary Font Stack */
font-family: "Permanent Marker", "Caveat Brush", "Comic Sans MS", cursive;

/* Sizes */
Text SM: 0.875rem (14px)
Text Base: 1rem (16px)
Text LG: 1.125rem (18px)
Text XL: 1.25rem (20px)
Text 2XL: 1.5rem (24px)
Text 3XL: 1.875rem (30px)
Text 4XL: 2.25rem (36px)
```

### **Visual Effects**

```css
/* Hand-drawn borders */
border: 2px solid stone-900
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)

/* Rotated elements (playful aesthetic) */
transform: rotate(-1deg) or rotate(-2deg)

/* Dashed borders for documents */
border-style: dashed

/* Sketchy shadows */
filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.3))
```

### **Animation Library**

```css
/* Metro Slide-Up Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shimmer Effect */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Fade-In Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale Pulse */
@keyframes scalePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 🧭 NAVIGATION SYSTEM

### **Metro Grid Hub (GridMenu.jsx)**

**Inspired By:** Windows 8 Metro UI, Nokia Lumia tile interface

**Layout:**
- 2-column responsive grid
- Variable tile sizes (1x1, 2x2)
- Auto-row height
- Centered layout with max-width constraint

**Tile Configuration:**

```javascript
const menuItems = [
  {
    label: "ID",
    icon: <FingerprintIcon />,
    view: "dashboard",
    color: "bg-red-500",      // Large 2x2 tile
    span: "col-span-2 row-span-2"
  },
  {
    label: "CLUES",
    icon: <ClipboardIcon />,
    view: "intel",
    color: "bg-amber-400",
    span: "col-span-1 row-span-1"
  },
  {
    label: "CHAT",
    icon: <ChatIcon />,
    view: "chat",
    color: "bg-blue-500",
    span: "col-span-1 row-span-1"
  },
  // ... additional tiles
];
```

**Animations:**
- **Entrance:** Staggered slide-up (200ms delay per tile)
- **Hover:** Scale + shimmer effect
- **Tap:** Scale down + haptic feedback
- **Transition:** Smooth cubic-bezier easing

### **Full-Screen Views**

Each tile opens a dedicated full-screen view with:
- **Header:** Title + round display
- **Close Button:** Red circular button (top-right)
- **Content Area:** Scrollable content
- **Fixed Elements:** Decoder FAB (clues screen only)

**View Routing:**
```javascript
// In App.jsx
{activeView === 'dashboard' && <DashboardView />}
{activeView === 'intel' && <IntelView />}
{activeView === 'chat' && <ChatView />}
{activeView === 'timeline' && <TimelineView />}
{activeView === 'voting' && <VotingView />}
{activeView === 'files' && <FilesView />}
{activeView === 'dossier' && <DossierView />}
```

### **Close Button Component**

```javascript
<button
  onClick={() => setActiveView('grid')}
  className="fixed top-4 right-4 z-50 bg-red-600 text-white rounded-full w-12 h-12"
>
  ✕
</button>
```

---

## 🎮 GAME MECHANICS & LOGIC

### **1. Character Selection**

**Flow:**
1. User sees character list on login screen
2. Taps character card
3. `handleLogin(characterId)` executes
4. `setCurrentUser(characterId)` updates state
5. Navigation switches to Metro Grid Hub

**Data Structure:**
```javascript
const character = {
  id: "char_unique_id",           // Unique identifier
  name: "Character Name",         // Display name
  role: "MURDERER|SUSPECT|...",   // Game role
  profession: "Job Title",        // Character profession
  bio: "Background text",         // Character description
  quirk: "Fun fact",              // Personality detail
  secret: "Hidden info",          // Secret information
  code: "CHARACTER_CODE",         // Shareable code
  timeline: "Time-stamped alibi"  // Timeline text
}
```

### **2. Round Progression**

**Round System:**
- Rounds: 0 (Pre-Game) through 6 (Reveal)
- Host controls round advancement via Host Panel
- Round determines which clues are accessible

**Round Management:**
```javascript
// Host Panel Controls
const incrementRound = async () => {
  const newRound = Math.min(currentRound + 1, 6);
  await setDoc(doc(db, 'gameState', 'current'), {
    currentRound: newRound,
    isVotingOpen,
    lastUpdated: serverTimestamp()
  });
};

const decrementRound = async () => {
  const newRound = Math.max(currentRound - 1, 0);
  await setDoc(doc(db, 'gameState', 'current'), {
    currentRound: newRound,
    isVotingOpen,
    lastUpdated: serverTimestamp()
  });
};
```

### **3. Code Validation System**

**Code Entry Flow:**
1. Player taps Decoder FAB (floating action button)
2. Modal opens with input field
3. Player enters code (case-insensitive)
4. `handleCodeSubmit(e)` validates code
5. Feedback toast displays result

**Validation Logic:**

```javascript
const handleCodeSubmit = (e) => {
  e.preventDefault();
  const code = inputCode.trim().toUpperCase();
  
  // Check if clue code
  const foundClue = CLUE_DB.find(c => c.code === code);
  if (foundClue) {
    // Round gating
    if (foundClue.roundReq > currentRound) {
      showFeedback('ERROR', 'CLUE LOCKED - Round not reached');
      return;
    }
    // Duplicate check
    if (unlockedClues.includes(foundClue.id)) {
      showFeedback('INFO', 'Already unlocked');
      return;
    }
    // SUCCESS - unlock clue
    const newUnlocked = [...unlockedClues, foundClue.id];
    setUnlockedClues(newUnlocked);
    localStorage.setItem('unlockedClues', JSON.stringify(newUnlocked));
    showFeedback('SUCCESS', `Unlocked: ${foundClue.title}`);
    setActiveView('intel'); // Navigate to evidence board
    return;
  }
  
  // Check if character code
  const foundChar = CHARACTERS.find(c => c.code === code);
  if (foundChar) {
    showFeedback('SUCCESS', `Met: ${foundChar.name}`);
    return;
  }
  
  // Invalid code
  showFeedback('ERROR', 'INVALID CODE');
};
```

**Code Types:**

| Type | Format | Example | Purpose |
|------|--------|---------|---------|
| Character Code | `NAME_INITIAL` | `ASSISTANT_V` | Identify other players |
| Clue Code | `CATEGORY###` | `POISON001` | Unlock evidence |

### **4. Clue Unlocking**

**Clue Data Structure:**
```javascript
const clue = {
  id: "clue_unique_id",           // Unique identifier
  code: "CLUE_CODE",              // Code to unlock
  title: "Clue Title",            // Display name
  category: "FORENSICS",          // Category badge
  content: "Evidence text...",    // Clue description
  roundReq: 3,                    // Minimum round required
  imgUrl: null                    // Optional image URL
}
```

**Categories:**
- BACKSTORY
- TIMELINE
- FORENSICS
- CLUE
- CCTV
- REVELATION
- BOMBSHELL
- INTERROGATION

### **5. Voting System**

**Voting Flow:**
1. Host opens voting via Host Panel
2. `isVotingOpen` syncs to all devices
3. Players open Voting view
4. Tap suspect card to select
5. Confirm button appears
6. Tap confirm to submit vote
7. Vote syncs to Firebase
8. Vote counts update in real-time

**Vote Submission:**
```javascript
const submitVote = async (suspectId) => {
  if (!currentUser || !isVotingOpen) return;
  
  // Update votes structure
  const newVotes = { ...votes };
  if (!newVotes[currentUser]) newVotes[currentUser] = {};
  newVotes[currentUser][currentRound] = suspectId;
  
  // Recalculate vote counts
  const newCounts = {};
  Object.values(newVotes).forEach(userVotes => {
    const vote = userVotes[currentRound];
    if (vote) {
      newCounts[vote] = (newCounts[vote] || 0) + 1;
    }
  });
  
  // Update Firebase
  await setDoc(doc(db, 'gameState', 'votes'), {
    votes: newVotes,
    voteCounts: newCounts,
    lastUpdated: serverTimestamp()
  });
  
  showFeedback('SUCCESS', 'Vote submitted');
};
```

**Vote Results:**
- Animated bar graph modal
- Percentage calculation
- 🏆 badge for highest votes
- Color-coded bars (red for leader)

### **6. Chat System**

**Message Sending:**
```javascript
const sendMessage = async () => {
  if (!messageText.trim() || !currentUser) return;
  
  const char = CHARACTERS.find(c => c.id === currentUser);
  
  await addDoc(collection(db, 'messages'), {
    characterId: currentUser,
    characterName: char.name,
    message: messageText.trim(),
    timestamp: serverTimestamp(),
    createdAt: Date.now()
  });
  
  setMessageText('');
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(50);
};
```

**Message Display:**
```javascript
// Real-time listener
useEffect(() => {
  const q = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMessages(msgs);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Vibrate on new message (not own)
    if (msgs.length > prevLength && msgs[msgs.length-1].characterId !== currentUser) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  });
  
  return unsubscribe;
}, []);
```

### **7. Timeline Parsing**

**Timeline Format:**
```
7:00 PM - Arrived at venue
7:15 PM - Spoke with host
7:30 PM - Went to kitchen
8:00 PM - Joined main hall
```

**Parsing Logic:**
```javascript
const parseTimeline = (timelineText) => {
  if (!timelineText) return [];
  
  const lines = timelineText.split('\n').filter(l => l.trim());
  const events = [];
  
  lines.forEach(line => {
    const match = line.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–—]\s*(.+)$/i);
    if (match) {
      const [, time, description] = match;
      const isCritical = /kitchen|ice|poison|weapon|kill/i.test(description);
      events.push({ time, description, isCritical });
    }
  });
  
  return events;
};
```

---

## 🔥 FIREBASE INTEGRATION

### **Configuration File (src/firebase/config.js)**

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### **Host Control Functions** (NEW)

**Initialize Game State:**
```javascript
export const initializeGameState = async () => {
  await setDoc(doc(db, 'gameState', 'current'), {
    currentRound: 0,
    isVotingOpen: false,
    voteResultsVisible: false,
    revealedToMurderer: false,
    unlockedFiles: [],
    lastUpdated: serverTimestamp()
  });
};
```

**Update Current Round:**
```javascript
export const updateCurrentRound = async (roundNumber) => {
  await updateDoc(doc(db, 'gameState', 'current'), {
    currentRound: roundNumber,
    lastUpdated: serverTimestamp()
  });
};
```

**Update Voting Status:**
```javascript
export const updateVotingStatus = async (isOpen) => {
  await updateDoc(doc(db, 'gameState', 'current'), {
    isVotingOpen: isOpen,
    lastUpdated: serverTimestamp()
  });
};
```

**Update Vote Results Visibility:**
```javascript
export const updateVoteResultsVisibility = async (isVisible) => {
  await updateDoc(doc(db, 'gameState', 'current'), {
    voteResultsVisible: isVisible,
    lastUpdated: serverTimestamp()
  });
};
```

**Unlock Files (Individual):**
```javascript
export const unlockFiles = async (fileIds) => {
  const fileArray = Array.isArray(fileIds) ? fileIds : [fileIds];
  await updateDoc(doc(db, 'gameState', 'current'), {
    unlockedFiles: arrayUnion(...fileArray),
    lastUpdated: serverTimestamp()
  });
};
```

**Unlock Files (By Round):**
```javascript
import { CASE_FILES } from '../data/gameData';

export const unlockFilesForRound = async (roundNumber) => {
  const filesToUnlock = CASE_FILES
    .filter(file => file.roundReq === roundNumber)
    .map(file => file.id);
  
  if (filesToUnlock.length > 0) {
    await unlockFiles(filesToUnlock);
  }
};
```

**Trigger Murderer Reveal:**
```javascript
export const updateMurdererReveal = async (isRevealed) => {
  await updateDoc(doc(db, 'gameState', 'current'), {
    revealedToMurderer: isRevealed,
    lastUpdated: serverTimestamp()
  });
};
```

**Reset Game State:**
```javascript
export const resetGameState = async () => {
  await setDoc(doc(db, 'gameState', 'current'), {
    currentRound: 0,
    isVotingOpen: false,
    voteResultsVisible: false,
    revealedToMurderer: false,
    unlockedFiles: [],
    lastUpdated: serverTimestamp()
  });
  
  // Optionally clear all votes
  const votesSnapshot = await getDocs(collection(db, 'votes'));
  const batch = writeBatch(db);
  votesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};
```

### **Firestore Operations**

**Read (Snapshot Listener):**
```javascript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'gameState', 'current'),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentRound(data.currentRound || 0);
        setIsVotingOpen(data.isVotingOpen || false);
        setVoteResultsVisible(data.voteResultsVisible || false);
        setRevealedToMurderer(data.revealedToMurderer || false);
        setUnlockedFiles(data.unlockedFiles || []);
      }
    }
  );
  
  return () => unsubscribe();
}, []);
```

**Write (Set Document):**
```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';

const updateGameState = async () => {
  await setDoc(doc(db, 'gameState', 'current'), {
    currentRound: 3,
    isVotingOpen: true,
    lastUpdated: serverTimestamp()
  });
};
```

**Add (Collection):**
```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';

const addMessage = async () => {
  await addDoc(collection(db, 'messages'), {
    characterId: 'char_id',
    characterName: 'Name',
    message: 'Message text',
    timestamp: serverTimestamp(),
    createdAt: Date.now()
  });
};
```

**Query (Ordered Collection):**
```javascript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

useEffect(() => {
  const q = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMessages(data);
  });
  
  return () => unsubscribe();
}, []);
```

### **Security Rules (Firestore)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game state - read by all, write by all (no auth)
    match /gameState/{document=**} {
      allow read, write: if true;
    }
    
    // Messages - read by all, write by all (no auth)
    match /messages/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** This app uses no authentication system. All players can read/write all data. This is intentional for party game simplicity, but means any player can act as "host".

---

## 📱 PROGRESSIVE WEB APP (PWA)

### **Manifest Configuration (public/manifest.json)**

```json
{
  "name": "Murder Mystery Game",
  "short_name": "Mystery",
  "description": "Interactive murder mystery party game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5f5f4",
  "theme_color": "#dc2626",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### **Vite PWA Plugin Configuration (vite.config.js)**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Murder Mystery Game',
        short_name: 'Mystery',
        theme_color: '#dc2626',
        background_color: '#f5f5f4',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});
```

### **Service Worker Registration**

Automatically handled by vite-plugin-pwa. The service worker:
- Caches all static assets
- Enables offline functionality
- Auto-updates on new deployments
- Caches Firebase storage assets

### **Installation Prompt**

Modern browsers automatically show install prompt when PWA criteria met:
- Valid manifest.json
- Service worker registered
- Served over HTTPS (or localhost)
- User has engaged with the site

### **Offline Functionality**

- **Static Assets:** Fully cached (HTML, CSS, JS, icons)
- **Firebase Data:** Requires network connection
- **Local Storage:** Unlocked clues persist offline
- **Graceful Degradation:** App shows error if offline features unavailable

---

## 🚀 SETUP & DEPLOYMENT

### **Prerequisites**
- Node.js 18+ and npm
- Firebase project
- Git (for deployment)

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd mystery-game

# Install dependencies
npm install
```

### **Firebase Setup**

1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy config from Project Settings > General > Your apps > Web
4. Paste config into `src/firebase/config.js`
5. Deploy security rules:

```bash
firebase init firestore
firebase deploy --only firestore:rules
```

### **Development Server**

```bash
# Start dev server
npm run dev

# Access at http://localhost:5173
```

**Dev Features:**
- Hot Module Replacement (HMR)
- Fast Refresh for React
- Service worker in dev mode
- Tailwind JIT compilation

### **Production Build**

```bash
# Build for production
npm run build

# Output directory: dist/
```

**Build Process:**
1. Vite bundles React app
2. Tailwind purges unused CSS
3. Assets minified and hashed
4. Service worker generated
5. Manifest.json copied

### **Preview Build**

```bash
# Preview production build locally
npm run preview

# Access at http://localhost:4173
```

### **Deployment Options**

**Option 1: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Option 2: GitHub Pages**
```bash
# Add to vite.config.js
export default defineConfig({
  base: '/repository-name/',
  // ... rest of config
});

# Build and deploy
npm run build
npx gh-pages -d dist
```

**Option 3: Vercel**
```bash
npm install -g vercel
vercel deploy
```

**Option 4: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### **Environment Variables**

For security, use environment variables for Firebase config:

```javascript
// .env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project_id
// ... etc

// src/firebase/config.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... etc
};
```

---

## 📦 COMPONENT REFERENCE

### **App.jsx - Main Controller**

**Responsibilities:**
- Global state management
- Firebase listeners
- View routing
- Modal management
- Code validation
- Host panel logic

**Key Functions:**
- `handleLogin(characterId)` - Character selection
- `handleCodeSubmit(e)` - Code validation
- `submitVote(suspectId)` - Vote submission
- `sendMessage()` - Chat message sending
- `showFeedback(type, msg)` - Toast notifications

### **CharacterSelect.jsx - Login Screen**

**Props:** None (uses global state)

**Features:**
- Displays all characters
- Card-based selection interface
- Mobile-optimized layout
- Calls `handleLogin` on selection

### **GridMenu.jsx - Metro Hub**

**Props:**
- `onNavigate(view)` - Navigation callback
- `onHostPanelOpen()` - Host panel trigger
- `currentUser` - Selected character
- `currentRound` - Current game round

**Features:**
- 8 animated tiles
- Staggered entrance animations
- Shimmer effects
- Triple-tap detection for host panel

### **Header.jsx - Top Bar**

**Props:**
- `currentRound` - Display current round
- `title` - Screen title (optional)

**Features:**
- Centered title
- Round display badge
- Fixed positioning

### **Navigation.jsx - Bottom Tabs**

**Props:**
- `activeTab` - Current selected tab
- `onTabChange(tab)` - Tab change callback

**Features:**
- 5-tab navigation
- Icon + label
- Active state styling
- Mobile-optimized

### **DecoderModal.jsx - Code Entry**

**Props:**
- `isOpen` - Modal visibility
- `onClose()` - Close callback
- `onSubmit(e)` - Submit callback
- `inputCode` - Current input value
- `setInputCode(value)` - Input change handler

**Features:**
- Full-screen overlay
- Auto-focus input
- Enter key submission
- Close on backdrop click

### **GuestProfileModal.jsx - Character Details**

**Props:**
- `isOpen` - Modal visibility
- `onClose()` - Close callback
- `character` - Character data object

**Features:**
- Full character information
- Code display
- Timeline (if unlocked)
- Mobile-optimized layout

### **VoteResultsModal.jsx - Results Graph**

**Props:**
- `isOpen` - Modal visibility
- `onClose()` - Close callback
- `voteCounts` - Vote count object
- `suspects` - Array of suspect characters

**Features:**
- Animated bar graph
- Percentage calculation
- Winner badge (🏆)
- Color-coded bars
- Staggered bar animations

### **FeedbackToast.jsx - Notifications**

**Props:**
- `feedback` - { type, msg }
- `onClose()` - Auto-close callback

**Features:**
- 4 types: SUCCESS, ERROR, INFO, WARNING
- Auto-dismiss (3s)
- Color-coded styling
- Bottom positioning

### **DashboardView.jsx - ID Card**

**Features:**
- Character name & profession
- Role badge
- Bio & quirk
- Secret information
- Character code (shareable)
- Timeline (if unlocked)

### **IntelView.jsx - Evidence Board**

**Features:**
- Grid of unlocked clues
- Category badges
- Clue content display
- Empty state message
- Floating Decoder button

### **ChatView.jsx - Messaging**

**Features:**
- Real-time message list
- Character-based messages
- Timestamp display
- Message input
- Send button
- Auto-scroll to bottom
- Haptic feedback

### **VotingView.jsx - Voting Interface**

**Features:**
- 2-column suspect grid
- Suspect cards (photo, name, profession)
- Two-tap voting (select + confirm)
- Live vote counts
- Visual confirmation (green ring)
- "View Results" button
- Voting closed message

### **TimelineView.jsx - Animated Timeline**

**Features:**
- Event parsing from text
- Vertical timeline with dots
- Staggered slide-in animations
- Critical event highlighting
- Context section
- Detective notes
- Role-specific indicators

### **FilesView.jsx - Archives**

**Features:**
- Category-organized clue display
- CCTV sketches
- Forensic reports
- Timeline documents
- Empty state handling

### **DossierView.jsx - Guest Profiles**

**Features:**
- All character cards
- Tap to view details
- Role hidden until revealed
- Character codes visible
- Opens GuestProfileModal

### **HostPanel.jsx - Admin Controls**

**Features:**
- Round increment/decrement buttons
- Voting toggle
- Current state display
- Firebase sync
- Close button

---

## ⚙️ CONFIGURATION GUIDE

### **Adding New Characters**

Edit `src/data/gameData.js`:

```javascript
export const CHARACTERS = [
  {
    id: "char_unique_id",          // Unique ID
    name: "Character Name",        // Display name
    role: "SUSPECT",               // Role type
    profession: "Profession",      // Job title
    bio: "Background...",          // Description
    quirk: "Fun fact",             // Personality
    secret: "Secret info",         // Hidden detail
    code: "CHARACTER_CODE",        // Shareable code
    timeline: "7:00 PM - Event..." // Alibi timeline
  },
  // ... more characters
];
```

### **Adding New Clues**

Edit `src/data/gameData.js`:

```javascript
export const CLUE_DB = [
  {
    id: "clue_unique_id",         // Unique ID
    code: "CLUE_CODE",            // Unlock code
    title: "Clue Title",          // Display title
    category: "FORENSICS",        // Badge category
    content: "Evidence...",       // Clue text
    roundReq: 3,                  // Minimum round
    imgUrl: null                  // Optional image
  },
  // ... more clues
];
```

### **Adding New Grid Tiles**

Edit `src/components/GridMenu.jsx`:

```javascript
const menuItems = [
  // ... existing tiles
  {
    label: "NEW TILE",
    icon: <YourIcon />,
    view: "newtile",              // View identifier
    color: "bg-purple-500",       // Tile color
    span: "col-span-1 row-span-1" // Size
  }
];
```

Then create `src/components/views/NewTileView.jsx` and add routing in `App.jsx`.

### **Customizing Styles**

**Tailwind Config (tailwind.config.js):**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'custom': '#hexcolor'
      },
      fontFamily: {
        'handwritten': ['Your Font', 'cursive']
      }
    }
  }
};
```

**Custom CSS (App.css):**
```css
/* Add custom animations */
@keyframes yourAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}

.your-class {
  animation: yourAnimation 0.3s ease-in-out;
}
```

### **Modifying Round Count**

Currently hardcoded to 0-6 (7 rounds). To change:

1. Update max/min in Host Panel (`HostPanel.jsx`)
2. Update game logic in `App.jsx`
3. Update clue requirements in `gameData.js`

### **Changing Firebase Project**

Replace config in `src/firebase/config.js` with your Firebase project credentials.

---

## 🎯 USAGE PATTERNS

### **For Game Designers:**

1. Edit `gameData.js` with your story content
2. Define characters with roles
3. Create clues with round requirements
4. Test code validation
5. Deploy to hosting platform

### **For Developers:**

1. Clone and install dependencies
2. Configure Firebase project
3. Customize UI components
4. Add new features (views, mechanics)
5. Build and deploy

### **For Players:**

1. Open app URL on mobile device
2. Select character
3. Navigate grid menu
4. Enter codes to unlock clues
5. Chat with other players
6. Vote when prompted
7. Solve the mystery!

---

## 🎮 HOST PANEL CONTROLS

### **Access Method**
Triple-tap the ghost logo (👻) in the top-left corner to open/close the Host Panel.

### **Control Panel Features**

**1. Round Control**
- Current round display with large number
- **-** button: Decrease round (min: 0)
- **+** button: Increase round (max: 6)
- Real-time sync to all connected devices

**2. Voting Control**
- **🗳️ OPEN VOTING** (green) - Enables voting interface for all players
- **🔒 CLOSE VOTING** (red) - Disables voting, locks in current votes
- Toggle button changes state instantly

**3. Vote Results Visibility**
- **📊 SHOW VOTE RESULTS** - Makes results visible to all players
- **👁️ HIDE VOTE RESULTS** - Hides results from players (host can still see)
- Default: Hidden until host reveals
- Use case: Hide during Round 5 discussion, reveal after

**4. File Unlock Controls**
Three buttons for batch file unlocking:
- **📄 Round 0: Incident Report** - Unlocks 1 file (f_incident)
- **🔬 Round 3: Evidence** - Unlocks 5 files (toxicology, CCTV, etc.)
- **💀 Round 4: Revelations** - Unlocks 3 files (journal, medical records)
- Buttons disabled after unlocking (gray state)
- Display shows count: "Unlocked: X files"

**5. Murderer Reveal (Round 6)**
- **🎭 REVEAL TO MURDERER** - Triggers confession clue for Esha only
- Disabled until Round 6
- Button turns red when activated: **🔓 CONFESSION REVEALED**
- Only Esha's device shows the private confession message

**6. Reset Game**
- **🔄 RESET GAME** button
- Confirmation dialog: "Are you sure? This will clear all progress"
- Resets:
  - Round to 0
  - Voting closed
  - Results hidden
  - Murderer reveal off
  - Unlocked files cleared
  - (Optional) All votes deleted

### **Visual Feedback**
- All controls have hover states
- Active states show different colors
- Real-time indicators show current state
- Firebase sync indicator at bottom: "⚡ Real-time sync via Firebase"

### **Host Panel Layout**
```
┌─────────────────────────────────┐
│ ⚡ HOST PANEL              [X]  │
├─────────────────────────────────┤
│ Current Round                   │
│    [-]      3      [+]         │
│ Updates all devices in real-time│
├─────────────────────────────────┤
│ [🗳️ OPEN VOTING]               │
│ [📊 SHOW VOTE RESULTS]          │
├─────────────────────────────────┤
│ Unlock Case Files               │
│ [📄 Round 0: Incident (1 file)]│
│ [🔬 Round 3: Evidence (5 files)]│
│ [💀 Round 4: Revelations (3)]  │
│ Unlocked: 6 files               │
├─────────────────────────────────┤
│ [🎭 REVEAL TO MURDERER]         │
│ (Disabled - Round 6+ required)  │
├─────────────────────────────────┤
│ [🔄 RESET GAME]                 │
├─────────────────────────────────┤
│ ⚡ Real-time sync via Firebase  │
└─────────────────────────────────┘
```

---

## 🔍 DEBUGGING & TROUBLESHOOTING

### **Common Issues**

**Firebase not syncing:**
- Check Firebase config credentials
- Verify Firestore security rules
- Check browser console for errors
- Ensure network connection

**Codes not unlocking:**
- Verify code in `gameData.js` CLUE_DB
- Check `roundReq` vs `currentRound`
- Clear browser cache/localStorage

**Accusation card not showing:**
- Check if player is in `assignedTo` array for any accusation
- Verify currentRound >= 1
- Check App.jsx passes `currentRound` to IntelView
- Inspect `myAccusation` with React DevTools

**Files not appearing:**
- Check Host Panel - are files unlocked?
- Verify `unlockedFiles` array in Firebase gameState/current
- Check FilesView receives `unlockedFiles` prop
- Match file IDs: f_incident, f_toxreport, f_medical, etc.

**Vote results not visible:**
- Check Host Panel - is "SHOW VOTE RESULTS" enabled?
- Verify `voteResultsVisible` in Firebase
- Check VotingView receives `voteResultsVisible` prop

**Murderer confession not showing:**
- Only works for character ID: char_esha
- Requires Round 6+
- Host must click "REVEAL TO MURDERER" button
- Check `revealedToMurderer` and `currentRound` in Firebase

**PWA not installing:**
- Must be served over HTTPS (or localhost)
- Check manifest.json validity
- Ensure service worker registered
- Use Chrome DevTools > Application tab

**Voting not working:**
- Ensure `isVotingOpen === true`
- Check Firebase connection
- Verify character selection
- Only 10 suspects appear (MURDERER + SUSPECT roles)

**Chat messages not appearing:**
- Check Firebase connection
- Verify Firestore security rules
- Check browser console for errors

**Timeline not showing murder context:**
- Only MURDERER and SUSPECT roles see murder timeline
- 22 WITNESS characters don't see it (preserves Round 4 twist)
- Check character's `role` field in gameData.js

### **Development Tools**

**React DevTools:**
- Install browser extension
- Inspect component state
- Track re-renders
- Check props passed to components

**Firebase Console:**
- Monitor Firestore data in real-time
- Check gameState/current document structure
- View votes collection
- Check security rules

**Chrome DevTools:**
- Application tab: Service workers, manifest
- Network tab: Firebase requests
- Console: Error logs
- React Components tab: Inspect state

---

## 📊 PERFORMANCE CONSIDERATIONS

### **Optimization Strategies**

**React Optimization:**
- Use `useMemo` for expensive calculations
- Use `useCallback` for function memoization
- Avoid unnecessary re-renders with `React.memo`

**Firebase Optimization:**
- Limit query results with `.limit()`
- Use pagination for large datasets
- Unsubscribe from listeners when component unmounts
- Batch writes when possible

**Asset Optimization:**
- Compress images
- Use SVG for icons
- Lazy load heavy components
- Code split with dynamic imports

**Tailwind CSS:**
- Purge unused styles in production
- Use JIT mode for smaller bundles
- Avoid dynamic class names

---

## 🔐 SECURITY NOTES

**Current Security Model:**
- **No authentication:** Any player can access any character
- **No authorization:** Any player can act as host
- **Public data:** All game data visible to all players
- **Client-side validation only:** Codes validated in browser

**For Production Games:**
- Implement Firebase Authentication
- Add Firestore security rules with user checks
- Server-side code validation
- Role-based access control (RBAC)
- Rate limiting for writes

---

## 📝 API REFERENCE

### **gameData.js Exports**

```javascript
export const CHARACTERS = Array<Character>
export const CLUE_DB = Array<Clue>
```

### **Character Type**

```typescript
interface Character {
  id: string;
  name: string;
  role: 'MURDERER' | 'SUSPECT' | 'VICTIM' | 'INNOCENT';
  profession: string;
  bio: string;
  quirk: string;
  secret: string;
  code: string;
  timeline: string;
}
```

### **Clue Type**

```typescript
interface Clue {
  id: string;
  code: string;
  title: string;
  category: 'BACKSTORY' | 'TIMELINE' | 'FORENSICS' | 'CLUE' | 'CCTV' | 'REVELATION' | 'BOMBSHELL' | 'INTERROGATION';
  content: string;
  roundReq: number;
  imgUrl: string | null;
}
```

---

## 🎓 LEARNING RESOURCES

**Technologies Used:**
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)

---

**Last Updated:** January 25, 2026  
**Version:** 2.1.0  
**Document Type:** Technical Architecture Guide

---

This document provides complete technical context for the murder mystery game application. Use this with your custom story content in `gameData.js` to create your own interactive mystery experiences.
