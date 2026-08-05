# 🔧 Astral Project's Murder Mystery Experience - Technical Documentation
## Complete Application Architecture & Features

<<<<<<< Updated upstream
=======
> **Maintenance note for Claude:** This is a living document. Update it whenever architecture, components, state management, or build/deploy details change. See [Claude.md](Claude.md) for the full doc map and session-start primer.

>>>>>>> Stashed changes
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
**Branding:** Astral Project's Murder Mystery Experience - Ultimate mystery solver gadget
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
- **Murderer revelation:** Round 6 host action flips a Firestore flag that pushes a full-screen red overlay to every player naming Alam — *except Alam's own device, which falls through to OutroSplash* — and ends the game
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
│   │   │   ├── FeedbackToast.jsx         # Toast notification system
│   │   │   ├── Numeral.jsx               # Brass numeral that ticks to a new value
│   │   │   ├── RedactedLines.jsx         # Ragged redaction marks over a paragraph
│   │   │   ├── RoundRail.jsx             # Segment rail (rounds; also the briefing's slide rail)
│   │   │   └── ScreenBrief.jsx           # "What this screen is" note, auto-clears at Round 2
│   │   │
│   │   ├── views/
│   │   │   ├── DashboardView.jsx         # ID Card view (no "Innocent Bystander" badge, no timeline display)
│   │   │   ├── DossierView.jsx           # Guest Profiles view (32 characters)
│   │   │   ├── FilesView.jsx             # Archives/Files view (round-gated, whitespace-pre-line formatting)
│   │   │   ├── IntelView.jsx             # Evidence Board (type-based color coding, whitespace-pre-line formatting)
│   │   │   ├── ChatView.jsx              # Real-time chat interface
│   │   │   ├── VotingView.jsx            # Voting interface (10 suspects only)
│   │   │   ├── StoryView.jsx             # The case briefing as a readable bone document
│   │   │   ├── HelpView.jsx              # The Guide (screen list reads from screenGuide.js)
│   │   │   └── TimelineView.jsx          # Character timeline (removed from GridMenu navigation)
│   │   │
│   │   ├── CharacterSelect.jsx           # Login/character selection screen
│   │   ├── GridMenu.jsx                  # Metro-style tile-based home hub (8 paper tiles + full-width EXIT)
│   │   ├── SplashScreen.jsx              # 1.4s cold open
│   │   ├── StoryIntro.jsx                # Fullscreen typed briefing (Round 0 takeover + replay)
│   │   ├── OutroSplash.jsx               # End-of-game screen
│   │   ├── MurdererRevealOverlay.jsx     # The one full-bleed signal screen
│   │   └── HostPanel.jsx                 # Admin control panel (expanded controls)
│   │
│   ├── data/
│   │   ├── gameData.js                   # Game content (32 chars, accusations, motives, files)
│   │   ├── screenGuide.js                # Per-screen kicker/title/brief/detail copy (one source
│   │   │                                 #   for App.jsx frames, screen notes and the Guide)
│   │   └── storyIntro.js                 # Round 0 briefing slides + typing speed (one source for
│   │                                     #   StoryIntro.jsx and StoryView.jsx). SPOILER-GATED.
│   │
│   ├── hooks/
│   │   ├── useCountUp.js                 # Ticks a numeral on change, never on mount
│   │   └── useTypewriter.js              # Character-at-a-time reveal on one rAF loop
│   │
│   ├── lib/
│   │   └── typeSound.js                  # Synthesized typewriter clicks + margin bell (Web Audio)
│   │
│   ├── firebase/
│   │   └── config.js                     # Firebase initialization & host functions
│   │
│   ├── App.jsx                           # Main application controller
│   ├── App.css                           # Evidence Room component vocabulary + motion
│   │                                     #   (imported by index.css INTO @layer components,
│   │                                     #    never from main.jsx — see "Styling architecture")
│   ├── index.css                         # Tailwind entry, @theme design tokens, base styles
│   └── main.jsx                          # React entry point (imports index.css only)
│
├── STORY.md                              # Complete narrative bible (32 characters)
├── dev-dist/                             # Development service worker files
├── index.html                            # HTML entry point
├── package.json                          # Dependencies & scripts
├── vite.config.js                        # Vite configuration (PWA, build)
├── DESIGN_LANGUAGE.md                    # "Evidence Room" design system (authoritative)
├── tailwind.config.js                    # Keyframe registry ONLY — no colours, no fonts
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

### **3. Metro-Style Navigation** ✅ UPDATED
- **Windows 8/Nokia Lumia Inspired:** Animated tile-based interface
- **7 Navigation Tiles:** (Timeline tile removed)
  1. ID Card (2x2 large tile)
  2. Clues/Evidence Board (shows accusation cards, unlocked clues, confession with color-coded types)
  3. Real-time Chat
  4. Voting Interface (10 suspects only, controlled visibility)
  5. Files/Archives (round-gated file unlocking)
  6. Guest Profiles (all 32 characters)
  7. Logout
- **Smooth Animations:** Slide-up entrance, shimmer effects, scale on hover
- **Full-Screen Views:** Each tile opens a dedicated full-screen interface
- **Universal Close Button:** Red circular button (top-right) returns to grid
- **UI Improvements:** Removed "Innocent Bystander" badges, removed timeline tile, improved clue card text formatting

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
- **Host Run Sheet:** Collapsible per-round script (`HOST_SCRIPT` in [src/data/gameData.js](src/data/gameData.js)) with Setup / Announce / During / End blocks. Tabs follow the live round automatically; the host can tab ahead to read on, and the live round keeps a ring marker. Advancing the round clears the override.
- **Force Sync:** Broadcasts `forceRefreshAt: Date.now()`; every connected device reloads ~150 ms later. Re-triggerable because each press writes a strictly larger timestamp. Depends on session persistence — see below. `resetGameState()` bumps the same field so a reset lands everyone on the clean state.

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

// Boot / briefing gate
stateSettled: boolean                   // First Firestore snapshot has landed (or 1.5s backstop)
briefingState: 'pending'|'open'|'done'  // The Round 0 story takeover
briefingReplay: boolean                 // Briefing re-opened from the Story screen
```

### **Boot gate (`stateSettled`) and the Round 0 briefing**

Every screen below the login gate is chosen from game state, but `currentRound`
defaults to `0` until Firestore answers. Without a gate, a player reloading during
Round 4 gets the Round 0 briefing for as long as the snapshot takes — and the grid
hub's once-per-session landing animation is spent on a frame nobody sees.

So `App.jsx` renders a one-beat `CaseHold` screen (same masthead as the splash)
until either the first snapshot arrives or `STATE_SETTLE_MS` (1500) elapses. The
timeout is the backstop: on a dead network a player must still reach the app, late
and wrong, rather than sit on a holding screen forever. **The host is exempt** —
the console is safe from the first frame.

`briefingState` is then decided **during render**, not in an effect:

```javascript
if (briefingState === 'pending' && currentUser && !isHostUser && stateSettled) {
  setBriefingState(currentRound === 0 ? 'open' : 'done');
}
```

That is React's "adjust state when a prop changes" pattern. The effect form would
paint the board for a frame first, and `react-hooks/set-state-in-effect` rejects it.

The briefing is deliberately **not persisted**: it plays on every login and every
reload for as long as the game is still in Round 0 (32 people arrive at different
times), and never interrupts anyone once the host advances. Logging out resets it
to `'pending'` so the next player on a shared device also gets it. Render order is
splash → login gate → `CaseHold` → terminal screens (reveal / game over) →
briefing → board, so no game state can route a device around a terminal screen and
no screen is ever a dead end.

### **Session Persistence**

`currentUser` and `isHost` are mirrored to `localStorage` under the key
`astral.session`, and both `useState` calls seed themselves from it. A reload —
host force-sync, a service-worker update, or a player swiping the tab away —
therefore restores the player where they were instead of at the login screen.
A restored host session also re-enters `activeTab: 'host'` directly.

Logging out clears both the state and the stored key. All access is wrapped in
`try/catch` because private-mode Safari throws on `localStorage`; if storage is
unavailable the app still works, it just stops surviving reloads.

> ⚠️ Session persistence is a hard dependency of **Force Sync**. Remove it and
> the host's refresh button dumps all 32 players back at the login screen
> mid-game.

### **Firestore Offline Persistence**

`db` is created with `initializeFirestore(app, { localCache: persistentLocalCache(...) })`
— not `getFirestore(app)` — so Firestore keeps an IndexedDB cache. On party wifi
the app keeps rendering the last-known round, files and clues through a dropped
connection and replays queued writes on reconnect.

`persistentMultipleTabManager()` is required, not optional: players routinely
have the installed PWA and a browser tab open at once, and the single-tab
manager throws *"Failed to obtain exclusive access to the persistence layer"*
in that situation. Settings can only be supplied before any other call touches
the instance, which is why this must be `initializeFirestore`.

Cost: roughly **+84 KB** of minified JS.

### **Firebase Firestore Schema**

```javascript
// Document: gameState/current
{
  currentRound: number,           // 0-6
  isVotingOpen: boolean,          // true/false
  unlockedFiles: string[],        // Case-file IDs the host has released
  voteResultsVisible: boolean,    // Host reveals the live tally to the room
  revealedToMurderer: boolean,    // Round 6 public murderer reveal
  revealedClues: string[],        // Clue IDs the host pushed to everyone
  gameEnded: boolean,             // Players are on the outro splash
  forceRefreshAt: number,         // Host force-sync broadcast (epoch ms; 0 = never)
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

### **Styling architecture**

Three files, three jobs. Getting the boundaries wrong silently breaks styling, so
they are worth stating precisely.

| File | Owns | Never contains |
|---|---|---|
| `src/index.css` | `@import "tailwindcss"`, the `@theme` token block, `--chrome-h`, base/body styles, atmosphere helpers (`.er-grain`, `.er-lamp`, `.er-vignette`) | Component classes |
| `src/App.css` | The `.er-*` component vocabulary and motion primitives | Colour literals — everything reads a token |
| `tailwind.config.js` | The keyframe/animation registry (`@theme` can't express keyframes) | Colours, fonts — those moved to `@theme` |

Two load-order rules that are easy to get wrong:

1. **`tailwind.config.js` is only seen because of the `@config "../tailwind.config.js"`
   line in `index.css`.** Tailwind v4 does not auto-discover it. Delete that line and
   every `animate-*` utility silently resolves to nothing.
2. **`App.css` is imported by `index.css` as `@import "./App.css" layer(components);`,
   not by `main.jsx`.** Unlayered CSS outranks *every* layered rule regardless of
   specificity, so importing it from `main.jsx` would make `.er-card`'s padding and
   `.er-title`'s font-size impossible to override with a Tailwind utility — `er-title
   text-[28px]` would silently render at 32px. Inside `@layer components` the
   utilities win, which is what call sites assume.

One thing worth knowing about transforms, because it decides how classes compose:
**Tailwind v4 emits `translate`, `scale` and `rotate` as the independent CSS
properties**, not as a composed `transform`. So `-translate-y-2` and `scale-100` stack
instead of overwriting each other, `transition-[translate,scale]` targets exactly what
moves, and `.er-rotL`'s `rotate` survives `.er-touch:active`'s `transform: scale()`.
Verify with `grep -oE '\.scale-100\{[^}]*\}' dist/assets/*.css` rather than assuming —
the behaviour changed in v4, and a `transition-[transform]` written against v3 habits
silently animates nothing.

### **Color Palette**

Authoritative spec: **[DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §2**. Defined once as
CSS custom properties in the `@theme` block of `src/index.css`, which makes them
available both as Tailwind utilities (`bg-ink`, `text-brass`) and as
`var(--color-signal)` inside `App.css`.

```
Surfaces   ink #0C0D0F · ink-raised #141518 · ink-hover #1C1E22
           bone #EDE7DA · bone-aged #D8D0BF
Accent     signal #E03127 (fills/rules/borders/≥18px text)
           signal-deep #8E1811 (on bone) · signal-lift #F2564C (small text on ink)
Data       brass #D8A33C — numerals ONLY, never a heading or a label
Text       dim #98948D · dim-2 #6B6964 (decorative only) · body-bone #4A453C
Hairlines  line / line-faint (on ink) · line-bone (on bone)
```

Three rules the code enforces: red never fills a large area (the murderer reveal is
the single exception), brass only ever sits on a numeral, and a bone surface always
means "this is a document". There is no green/blue/purple/orange anywhere — states
change the *surface* or the *label*, never the hue.

### **Typography**

Five families, strict roles. UI chrome speaks in the deck's editorial voice; in-fiction
content keeps the typewriter voice that makes the phone feel like a prop.

| Token | Family | Used for |
|---|---|---|
| `font-display` | Big Shoulders Display | Numerals and screen titles, nothing else |
| `font-mono` | IBM Plex Mono | Every label, tag, kicker, chrome element |
| `font-typewriter` | Special Elite | In-fiction headings (names, clue titles) |
| `font-body` | Courier Prime | In-fiction body copy |
| `font-handwriting` | Caveat | Margin notes and annotations |

Mono labels are tracked `0.18em`–`0.24em` and uppercase; display type goes the other
way at `-0.01em`. Body copy never drops below 15px, and red text under 18px must use
`signal-lift` (5.75:1) rather than `signal` (4.29:1, large-text only).

### **Component vocabulary (`App.css`)**

| Class | What it is |
|---|---|
| `.er-mono` / `--dim` / `--bone` / `--hot` / `--wide` | Mono label, with its colour variants |
| `.er-num`, `.er-title` | Brass tabular numeral; 32px display screen title (`text-wrap: balance`) |
| `.er-tag` / `--ghost` / `--brass` / `--mute` / `--onbone` | The atomic accent chip |
| `.er-card` / `--signal` / `--brass` / `--aged` | Card on ink; the 3px top border is the state channel |
| `.er-bone`, `.er-bone-label`, `.er-bone-rule`, `.er-bone-body` | The paper document and its header pattern |
| `.er-pin`, `.er-rotL` / `.er-rotR` | Pushpin and paper rotation (uses the `rotate` property so tap-scale composes) |
| `.er-redact` / `--sealed` / `--open` / `--late` | Redaction bar over **one line**, wiping open left→right |
| `.er-redact-lines` / `--open` | Redaction over a **paragraph** — ragged marks that wipe in sequence (see below) |
| `.er-unseal` | The 3px rule that sweeps across a freshly decoded clue |
| `.er-blank` / `--onbone` | Fill-in blank — a deliberately unknown value |
| `.er-list`, `.er-stat`, `.er-thread`, `.er-rule` | Em-dash list, brass stat, red thread, hairline |
| `.er-rail`, `.er-rail__seg` / `--past` / `--now` | The round rail: one segment per round, past in bone-aged, live in signal |
| `.er-bar`, `.er-bar__fill` | Tally bar; grows by `scaleX(var(--fill))`, never by `width` |
| `.er-touch` / `--hot` | 44×44 minimum target, scale-to-0.96 tap feedback |
| `.er-press` | Press feedback with no surface shift — for wide blocks and controls inside paper |
| `.er-lift` | Cursor lift, `@media (hover: hover)` only, via the independent `translate` property |
| `.er-enter`, `.er-land`, `.er-stagger` | Entrance motion; all fades are paired with a transform |
| `.er-enter-quick` | A 260ms un-staggered entrance, for surfaces the player returns to constantly |
| `.er-enter-left` / `-right`, `.er-swap`, `.er-fade`, `.er-leave` | Directional arrivals, chrome value swap, modal scrim, exit |
| `.er-stamp` | One-shot "recorded" stamp. **Not** `.er-alarm`, which is a reserved infinite pulse |

**A redaction bar cannot span a paragraph.** `.er-redact` is for a single ragged
line. Stretched over three or four full-width lines of copy it stops reading as a
redaction and becomes a field of red, which [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)
§2.2 forbids — the Identity card's four-line confidential note rendered exactly that
way. Multi-line copy uses
[`RedactedLines`](src/components/ui/RedactedLines.jsx) instead: an absolutely
positioned overlay of ragged marks that wipe away in sequence, with the real copy
underneath still setting the height so nothing shifts when they clear.

### **Motion components and hooks**

| Module | Job |
|---|---|
| [`hooks/useCountUp.js`](src/hooks/useCountUp.js) | Ticks a numeral to a new value in 380ms. Deliberately does **not** animate on mount — motion marks a *change*, and every stat sits on a screen the player reopens constantly. Reduced motion short-circuits to the target. |
| [`ui/Numeral.jsx`](src/components/ui/Numeral.jsx) | `useCountUp` plus a guaranteed `tabular-nums`. The one component whose digits change on screen, so proportional digits would shove neighbouring labels sideways. |
| [`ui/RoundRail.jsx`](src/components/ui/RoundRail.jsx) | The seven-segment round rail in the chrome. Built on `transition`, not a keyframe: transitions don't run on first paint, so opening a screen shows the rail already filled and only a real round advance animates it. |
| [`ui/RedactedLines.jsx`](src/components/ui/RedactedLines.jsx) | Redaction over a paragraph (above). |
| [`hooks/useTypewriter.js`](src/hooks/useTypewriter.js) | Reveals a string a character at a time on one rAF loop against a precomputed schedule, so a dropped frame catches up instead of drifting. Punctuation adds a hold (comma 120ms, full stop 240ms, line break 280ms) — that, not the base rate, is what stops it sounding mechanical. Reports **one character per frame** to its `onChar` callback even when it advances two, because three clicks in the same millisecond is a glitch. Reduced motion returns the finished string. |
| [`lib/typeSound.js`](src/lib/typeSound.js) | The typing sounds, synthesized — a bandpassed noise burst per key (±450Hz of drift so a line isn't a machine gun), a lower thunk per line break, two sine partials for the margin bell. No audio file: this repo has no binary assets and the PWA is offline-first, so a sample would be the first thing that can fail to arrive at a live event. Mute state is `localStorage['astral.sfx']`, separate from the session key so a logout can't undo it. |

**Typed text must not reflow the page.** `.er-type` renders the line twice: the full
string in flow but `visibility: hidden` to reserve the height, and the revealed slice
absolutely positioned over it. Without that, every word that wraps adds a line box
mid-sentence and shoves the rest of the slide down while the player is reading it.
Measured: the last line's box sits at the same y (450px) at 20% typed and at 100%.
Same reasoning as `RedactedLines` — the real copy sets the box, the animated layer
rides on top.

`--chrome-h` (in `index.css`) is the chrome rail's total height — 64px of content +
the 2px rail + 10px + the 1px hairline. `ChatView` is the one fixed-position view and
pins itself to that variable; as two literals the pair drifted the moment the header
gained a row.

### **Visual Effects**

```css
/* Depth is hairlines, never elevation */
border: 1px solid var(--color-line);

/* Paper is the ONE thing that casts a shadow, because paper sits on the board */
box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55);

/* Rotation belongs to paper only; chrome never rotates */
rotate: -1.2deg;

/* Corners are square everywhere except the pushpin and avatar discs */
border-radius: 0;
```

`prefers-reduced-motion: reduce` collapses every duration to `0.01ms`/`0.2s`, and the
redaction bar still resolves to its open state so no content is lost.

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

**Layout:** a 2-column grid of nine tiles — eight `aspect-[4/3]` paper tiles, then
EXIT spanning the row (`col-span-2`, `py-3.5`). Nine in a 2-column grid would
otherwise leave EXIT alone in a half-empty row; as a full-width ink bar it reads as
a footer control rather than a ninth destination, and the eight paper tiles stay a
clean 4×2 board.

**Tiles**, in board order — the same order the Guide lists them in:

| Tile | Sub | Tab | Surface |
|---|---|---|---|
| Identity | Confidential | `dashboard` | bone |
| Story | The Night | `story` | bone-aged |
| Evidence | Board | `intel` | bone |
| Comms | Encrypted | `chat` | bone-aged |
| Vote | Open Now / Standby | `votes` | ink + 3px signal top border; **fills** signal only while the ballot is open |
| Archives | Case Files | `files` | bone-aged |
| Suspects | Profiles | `dossier` | bone |
| Guide | Read Me | `help` | bone-aged |
| Exit | End Session | `logout` | ink, full width |

Differentiation is **surface, not hue** ([DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §2.2):
every tile is paper except Vote and Exit, which are interface.

**Animations:**
- **Entrance:** staggered landing, 60ms apart — **once per session only.** Returning
  to the board is the app's most frequent navigation, and the full sequence is ~1.2s
  of motion; every return after the first is a single 260ms `.er-enter-quick` with no
  stagger. The flag lives at module scope so it survives the unmount.
- **Hover:** 3px lift on `translate` (gated on `hover: hover`)
- **Tap:** `scale(0.96)` + 20ms haptic buzz

### **Full-Screen Views**

Each tile opens a dedicated full-screen view with:
- **Header:** Title + round display
- **Close Button:** Red circular button (top-right)
- **Kicker + title:** from `SCREEN_GUIDE` ([src/data/screenGuide.js](src/data/screenGuide.js))
- **Screen note:** one-line explanation of the screen, rounds 0–1 only (below)
- **Content Area:** Scrollable content
- **Fixed Elements:** Decoder FAB (clues screen only)

**View Routing:**
```javascript
// In App.jsx
{activeTab === 'dashboard' && <DashboardView />}
{activeTab === 'story'     && <StoryView onReplay={...} />}
{activeTab === 'intel'     && <IntelView />}
{activeTab === 'chat'      && <ChatView />}   // self-framed
{activeTab === 'timeline'  && <TimelineView />}   // no tile; view exists
{activeTab === 'votes'     && <VotingView />}
{activeTab === 'files'     && <FilesView />}
{activeTab === 'dossier'   && <DossierView />}
{activeTab === 'help'      && <HelpView />}
{activeTab === 'host'      && <HostPanel />}
```

Opening a screen resets the document scroll to the top (`useEffect` on `activeTab`).
The scroll position survives a tab change — it is the same document with a new
subtree — so a player who had scrolled the board down to reach a tile used to land
part-way into whatever they opened. Most visible on the Story briefing, at ~2800px
the tallest surface in the app.

### **The Round 0 briefing (StoryIntro.jsx)**

A fullscreen typed slideshow of the case: eight slides, swipe or tap to advance, a
tap fills the current slide instantly, Skip leaves at any point. It takes over the
screen for any player who logs in while the game is in Round 0 (see *Boot gate*
above) and is re-openable from the Story screen's **Play the briefing** control.

| Concern | How |
|---|---|
| Copy + pacing | [src/data/storyIntro.js](src/data/storyIntro.js) — also feeds `StoryView`, so the two can't drift. **Spoiler-gated**: Round 0 knowledge only (the vape is public; the toxin, cancer, SEBI and staging are not) |
| Typing | [`useTypewriter`](src/hooks/useTypewriter.js) — heading and body lines are one stream, so the rhythm carries across the slide |
| Sound | [`typeSound`](src/lib/typeSound.js) — on by default, mute toggle top-left, remembered |
| Progress | `RoundRail` with `currentRound={index}` — the same component the chrome uses |
| Gestures | Swipe ≥48px horizontal-dominant; a tap that moved >12px is a drag; clicks within 500ms of a `touchend` are ignored (touch devices synthesise one) |
| Keyboard | → / Space / Enter advance, ← goes back, Esc exits. Skipped when a control has focus, or the footer button would fire twice |

⚠️ **The screen sets `touch-action: none`.** A rightward swipe starting near the left
edge is Chrome's history-back gesture and it beats any handler: measured, it replaced
the whole document (`#root` and all), so a player swiping back one slide was thrown
out of the game. `body { overscroll-behavior: contain }` is a related safety net for
the rest of the app but does not save a fixed, non-scrolling layer.

### **Close Button Component**

```javascript
<button
  onClick={() => setActiveView('grid')}
  className="fixed top-4 right-4 z-50 bg-red-600 text-white rounded-full w-12 h-12"
>
  ✕
</button>
```

### **Screen Notes (onboarding)**

Every screen — plus the grid hub — carries a one-line note saying what it is for, so a
first-time player never has to guess what "Intel" or "Dossier" means. It renders as a
pinned aged-paper tooltip under the screen title (design spec: [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §6.10).

**Copy** — [src/data/screenGuide.js](src/data/screenGuide.js). One entry per screen, four fields:

| Field | Used by |
|---|---|
| `kicker`, `title` | the screen frame in [App.jsx](src/App.jsx) (`SCREEN_GUIDE[activeTab]`) |
| `brief` | the screen note (`ScreenBrief`) — 1–2 short sentences |
| `detail` | the "What each screen does" list on the Guide ([HelpView.jsx](src/components/views/HelpView.jsx)) |
| `briefLabel` | optional label override (the hub uses "Start here") |

**Component** — [src/components/ui/ScreenBrief.jsx](src/components/ui/ScreenBrief.jsx). Takes the whole
guide entry, so new fields never change the signature:

```javascript
<ScreenBrief note={screen} currentRound={currentRound} className="mt-5" />
```

It renders nothing when `note.brief` is absent (the Host Console has no brief) or when
`currentRound >= BRIEF_HIDDEN_FROM_ROUND` (2). Three call sites: [App.jsx](src/App.jsx) for the
seven framed views, plus [GridMenu.jsx](src/components/GridMenu.jsx) and
[ChatView.jsx](src/components/views/ChatView.jsx), which draw their own mastheads and so receive
`note` as a prop rather than getting the frame from `App`.

Because `currentRound` comes from Firestore, the notes clear on all 32 devices the moment the
host advances to Round 2 — no per-device dismissal state exists, and none is wanted.

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
Sets `revealedToMurderer` and, when revealing, also sets `gameEnded: true` so players are locked into the terminal state. Reset Game clears both.
```javascript
export const updateMurdererReveal = async (isRevealed) => {
  await updateDoc(doc(db, 'gameState', 'current'), {
    revealedToMurderer: isRevealed,
    ...(isRevealed ? { gameEnded: true } : {}),
    lastUpdated: serverTimestamp()
  });
};
```
On the client, `App.jsx` checks `revealedToMurderer && !isHostUser && !isMurderer(currentUser)` *before* the `gameEnded` outro branch so the public reveal overlay (`MurdererRevealOverlay`) wins over `OutroSplash` — except for the murderer themselves (Alam), who falls through to `OutroSplash`.

**Render-order invariant (do not reorder):**

```
SplashScreen  →  CharacterSelect (login gate)  →  MurdererRevealOverlay  →  OutroSplash  →  GridMenu / views
```

Both terminal screens are unconditional early returns, so they **must** sit *after* the `!currentUser` login gate. If they run before it, any device holding a restored session is pinned to the end-game screen with no route back to login — which locks the host out of [src/components/HostPanel.jsx](src/components/HostPanel.jsx) exactly when the reveal is live.

Host exclusion uses `isHostUser = isHost || currentUser === 'host'` rather than the `isHost` flag alone. `currentUser === 'host'` is the durable signal (`'host'` is not a real character id), so a lost or stale flag can never drop the admin onto a player-facing terminal screen.

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

Read [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) before changing anything visual — the
system is deliberately narrow, and most "I need a new colour" moments are answered by
changing the *surface* instead.

**A new token — `src/index.css`, inside `@theme`:**
```css
@theme {
  --color-signal: #E03127;   /* becomes bg-signal, text-signal, border-signal
                                AND var(--color-signal) inside App.css */
}
```
Do **not** add colours to `tailwind.config.js`. Config colours become utilities but
never emit custom properties, so `App.css` cannot read them.

**A new component class — `src/App.css`:**
```css
/* Reads tokens, never literals. Lands in @layer components via the import
   in index.css, so Tailwind utilities can still override it at call sites. */
.er-thing {
  border: 1px solid var(--color-line);
  background: var(--color-ink-raised);
}
```

**A new keyframe — `tailwind.config.js`** (the one thing `@theme` cannot express), or
directly in `App.css` if it is only used by an `.er-*` class.

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

**5. Murderer Reveal (Round 6) — public, terminal**
- **🎭 REVEAL MURDERER** - Pushes a full-screen red overlay naming Alam to every connected non-host player and ends the game
- Disabled until Round 6
- Confirmation prompt before firing (this is one-way; only Reset Game can undo)
- Button locks into red disabled state after firing: **🔓 MURDERER REVEALED**
- Renders [src/components/MurdererRevealOverlay.jsx](src/components/MurdererRevealOverlay.jsx) on every player's screen, taking precedence over `OutroSplash`

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
│ [🎭 REVEAL MURDERER]            │
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

**Murderer reveal overlay not showing:**
- Requires Round 6+ (host button is disabled until then)
- Host must click "REVEAL MURDERER" and confirm the prompt
- Check `revealedToMurderer` and `gameEnded` in Firebase — both should flip to `true` when revealed
- The overlay is rendered for non-host players from `App.jsx` and looks up the murderer via `CHARACTERS.find(c => c.role === 'MURDERER')`

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
