# 🎯 Firebase Chat Setup - Visual Guide

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FIREBASE CLOUD                          │
│  ┌───────────────────────────────────────────────────┐     │
│  │         FIRESTORE DATABASE                         │     │
│  │                                                    │     │
│  │  Collection: "messages"                           │     │
│  │  ┌─────────────────────────────────────────┐    │     │
│  │  │ {                                       │    │     │
│  │  │   id: "abc123",                        │    │     │
│  │  │   characterId: "char_vikram",          │    │     │
│  │  │   characterName: "Vikram",             │    │     │
│  │  │   message: "I saw something...",       │    │     │
│  │  │   timestamp: Timestamp(...)            │    │     │
│  │  │ }                                       │    │     │
│  │  └─────────────────────────────────────────┘    │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↕ ↕ ↕
                    Real-time Sync
                          ↕ ↕ ↕
┌─────────────────────────────────────────────────────────────┐
│              YOUR REACT APP (Browser)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Player 1    │  │  Player 2    │  │  Player 3    │    │
│  │  (Vikram)    │  │  (Anish)     │  │  (Esha)      │    │
│  │              │  │              │  │              │    │
│  │  ChatView    │  │  ChatView    │  │  ChatView    │    │
│  │  Component   │  │  Component   │  │  Component   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Setup Steps Visualized

### Step 1: Firebase Console Setup

```
Firebase Console
    │
    ├── Create Project
    │   └── Name: "mystery-game-chat"
    │
    ├── Enable Firestore
    │   ├── Create Database
    │   ├── Start in Test Mode
    │   └── Choose Location
    │
    └── Get Web Config
        └── Copy firebaseConfig {}
```

### Step 2: Local Project Setup

```
Your Project
    │
    ├── Install Firebase
    │   └── npm install
    │
    ├── Update Config
    │   └── src/firebase/config.js
    │       └── Paste your firebaseConfig
    │
    └── Run Dev Server
        └── npm run dev
```

### Step 3: Testing Flow

```
Browser Window 1          Firebase          Browser Window 2
(Vikram)                                    (Anish)
    │                                           │
    │ Send: "Hello!"                            │
    ├────────────────────►│                     │
    │                     │ Store message       │
    │                     ├────────────────────►│
    │                     │ Real-time push      │
    │                     │◄───────────────────┤│
    │◄────────────────────┤                     │
    │ Receive confirmation│                     │ Receives: "Hello!"
    │                     │                     │ from Vikram
```

---

## 🎨 Chat UI Layout

```
┌─────────────────────────────────────────────────────┐
│  🔍 Investigator Chat                              │ ← Header
│  Discuss clues and theories with fellow detectives │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │ 👤 Vikram                                │     │ ← Other's Message
│  │ "I was in the kitchen at 6:50 PM"       │     │   (Left aligned)
│  │ 8:05 PM                                  │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
│           ┌──────────────────────────────────────┐ │
│           │ "That's suspicious!" 8:06 PM    👤 │ │ ← Your Message
│           │                            (You)   │ │   (Right aligned,
│           └──────────────────────────────────────┘ │    orange)
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │ 👤 Anish                                 │     │
│  │ "Anyone notice the ice bucket?"          │     │
│  │ 8:07 PM                                  │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
│                    [Auto-scroll area]               │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Type your message here...      ] [Send →]        │ ← Input Form
│ Chatting as Vikram                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow Diagram

```
Player Action                Firebase                 All Players
─────────────────────────────────────────────────────────────────

1. User types message
   in input field
        │
        ↓
2. Clicks "Send"
        │
        ↓
3. handleSendMessage()
        │
        ↓
4. addDoc(collection)  ──────►  Firestore writes
                                message document
                                        │
                                        ↓
                                   onSnapshot
                                   triggers
                                        │
                      ┌─────────────────┼─────────────────┐
                      ↓                 ↓                 ↓
                 Player 1          Player 2          Player 3
                 receives          receives          receives
                 update            update            update
                      │                 │                 │
                      ↓                 ↓                 ↓
                 setMessages()    setMessages()     setMessages()
                      │                 │                 │
                      ↓                 ↓                 ↓
                 UI updates        UI updates        UI updates
                 auto-scrolls      auto-scrolls      auto-scrolls
```

---

## 📁 File Structure & Connections

```
mystery-game/
│
├── src/
│   ├── firebase/
│   │   └── config.js ──────────┐
│   │       └── Exports: db     │ (Firestore instance)
│   │                            │
│   ├── components/              │
│   │   ├── views/               │
│   │   │   └── ChatView.jsx ◄──┘ Imports db
│   │   │       ├── Uses: collection()
│   │   │       ├── Uses: addDoc()
│   │   │       ├── Uses: onSnapshot()
│   │   │       └── Uses: serverTimestamp()
│   │   │
│   │   ├── icons/
│   │   │   └── ChatIcons.jsx
│   │   │       ├── MessageBubble (nav icon)
│   │   │       └── Send (button icon)
│   │   │
│   │   └── layout/
│   │       └── Navigation.jsx
│   │           └── Imports: MessageBubble
│   │
│   └── App.jsx
│       ├── Imports: ChatView
│       └── Routes: activeTab === 'CHAT'
│
├── FIREBASE_SETUP.md
├── CHAT_SETUP_QUICKSTART.md
└── package.json
    └── dependencies: { firebase: "^11.1.0" }
```

---

## 🔥 Firebase Config Mapping

```javascript
// What you get from Firebase Console:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXX",  ← From Project Settings
  authDomain: "project.firebaseapp.com", ← Auto-generated
  projectId: "mystery-game-chat",       ← Your project name
  storageBucket: "project.appspot.com", ← Auto-generated
  messagingSenderId: "123456789",       ← Auto-generated
  appId: "1:123456789:web:abc123"      ← Auto-generated
};

// Where it goes in your code:
src/firebase/config.js
└── const firebaseConfig = { ... } ← Paste here!
```

---

## 🎮 Navigation Update

### Before (4 tabs):
```
┌─────────┬─────────┬─────────┬─────────┐
│  👤     │  🔍     │  📄     │  👥     │
│ ID Card │  Clues  │  Files  │ Guests  │
└─────────┴─────────┴─────────┴─────────┘
```

### After (5 tabs):
```
┌──────┬──────┬──────┬──────┬──────┐
│  👤  │  🔍  │  💬  │  📄  │  👥  │
│  ID  │Clues │ Chat │Files │Guests│
└──────┴──────┴──────┴──────┴──────┘
```

**Changes made:**
- ✅ Added Chat tab with MessageBubble icon
- ✅ Reduced icon size from 20px → 18px
- ✅ Shortened labels to fit 5 tabs
- ✅ Maintained visual balance

---

## 🔐 Security Rules Flow

```
Client Request          Firestore Rules         Action
─────────────────────────────────────────────────────────

READ messages
    │
    ├──────────────►  allow read: if true;  ──► ✅ ALLOW
    │
WRITE new message
    │
    ├──────────────►  allow create: if true; ──► ✅ ALLOW
    │
UPDATE message
    │
    ├──────────────►  allow update: if false; ─► ❌ DENY
    │
DELETE message
    │
    └──────────────►  allow delete: if true;  ──► ✅ ALLOW
```

`delete` is open on purpose: the host clears the channel between games via
`clearAllMessages()` (Reset Game), and with no Firebase Auth there is no way to
scope that permission to the host. With `delete: if false` the batch was
rejected and the error swallowed, so a reset looked clean to the host while
every player still had the old thread.

---

## 💾 Data Model

### Firestore Collection Structure:
```
/messages (collection)
    │
    ├── abc123 (document)
    │   ├── characterId: "char_vikram"
    │   ├── characterName: "Vikram"
    │   ├── message: "I saw the kitchen!"
    │   ├── timestamp: Timestamp(2026-01-23 20:05)
    │   └── createdAt: 1705968000000
    │
    ├── def456 (document)
    │   ├── characterId: "char_anish"
    │   ├── characterName: "Anish"
    │   ├── message: "Tell me more!"
    │   ├── timestamp: Timestamp(2026-01-23 20:06)
    │   └── createdAt: 1705968060000
    │
    └── ... (up to 100 messages loaded)
```

### Game State Document (`gameState/current`):
```
/gameState (collection)
    │
    └── current (document)
        ├── currentRound: 0..6
        ├── isVotingOpen: false
        ├── unlockedFiles: ["f_incident"]     ← host releases case files
        ├── voteResultsVisible: false         ← host shows the live tally
        ├── revealedToMurderer: false         ← Round 6 public reveal
        ├── revealedClues: []                 ← clues pushed to everyone
        ├── gameEnded: false
        ├── forceRefreshAt: 0                 ← host force-sync broadcast
        ├── gameStartedAt: 0                  ← the starting gun: epoch ms the host pressed Start
        ├── roundTimerEndsAt: 0               ← round clock: epoch ms it runs out
        ├── roundTimerRemainingMs: 0          ← round clock: what is left, while held
        ├── roundTimerDurationMs: 1800000     ← round clock: the length it is armed with
        ├── roundTimerRound: 0                ← the round this clock belongs to
        └── lastUpdated: 1705968000000
```

**`forceRefreshAt`** is an epoch-millisecond timestamp, not a boolean. Each
press of *Force Sync All Players* writes a strictly larger value; every client
compares it against the value it booted with and reloads only when it sees a
newer one. That is what makes the button re-triggerable and what stops the
first snapshot after page load from causing a reload loop. `0` means never
fired. `resetGameState()` also bumps it, so a reset lands every device on the
clean state.

**`gameStartedAt`** is the starting gun ([src/lib/gameStart.js](src/lib/gameStart.js)),
and like `roundTimerEndsAt` below it is an absolute instant on the *host's*
clock rather than a flag. `0` means the host has not started the room, and every
player who has logged in is held on the standby screen
([src/components/StandbyScreen.jsx](src/components/StandbyScreen.jsx)). A
non-zero value opens the room ten seconds after that instant — so a device that
joins, reloads or wakes up after those ten seconds reads the start as already
past and is simply let in, with no countdown. Three phases, all derived and none
of them stored:

| Phase | `gameStartedAt` | What the device shows |
|---|---|---|
| Standby | `0` | "Waiting for the host to start the game" |
| Counting | set, within 10s | The countdown |
| Live | set, more than 10s ago | The game |

Only the host writes it, through three calls in
[src/firebase/config.js](src/firebase/config.js): `startGame(startedAt, timer)`
(which also writes all four `roundTimer*` fields in the same update, armed to
begin as the countdown clears), `pushGameStart()` (rewrites it into the past
*and* bumps `forceRefreshAt` — the two failure modes it fixes are different),
and `holdGameAtStandby()` (back to `0`, the undo for a mis-tapped Start).
`resetGameState()` clears it to `0`, so the next room is held at the door too.

**Migrating a live game:** `initializeGameState` backfills a doc that predates
the field as `1` — "started, long ago" — whenever `currentRound > 0`, so
deploying this mid-event cannot drop a waiting screen onto a room that is already
playing. Only a game still sitting on Round 0 backfills to `0`.

**The four `roundTimer*` fields** are the round clock ([src/lib/roundTimer.js](src/lib/roundTimer.js)).
Only the host writes them; every player's device reads them and runs the
countdown locally. They encode four states between them:

| State | `roundTimerEndsAt` | `roundTimerRemainingMs` |
|---|---|---|
| Stopped (armed, not started) | `0` | `0` |
| Running | epoch ms it ends | `0` |
| Held (paused) | `0` | what is left |
| Expired | epoch ms, now past | `0` |

`roundTimerEndsAt` is an absolute instant on the *host's* clock, not a duration,
so a phone that joins late, reloads or wakes from sleep lands on the correct
remaining time instead of restarting the countdown from the top. Expiry is never
written: it is a reading every device takes for itself, because 69 devices
noticing the same instant must not become 69 writes.

Four flat fields rather than one nested `roundTimer` map, because `updateDoc`
merges fields but replaces maps — a nested object would have to be written whole
by every call that touches the round, and one stale copy would silently undo a
start. `updateCurrentRound(round, timer)` writes the round and its clock in a
single update for the same reason: an advance that arrived one snapshot ahead of
its timer would show the new round holding the old round's countdown.

`initializeGameState()` back-fills any of these fields that are missing from an
existing document, so an in-progress game picks up new fields without a manual
migration.

### Offline Persistence

`db` is built with `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`.
Reads are served from an IndexedDB cache when the network drops and writes are
queued and replayed on reconnect. The multi-tab manager is required because
players commonly have the installed PWA and a browser tab open simultaneously.

---

## ⚡ Real-Time Sync Explained

```
Firebase uses WebSocket connections:

Browser 1                    Firebase Server                Browser 2
    │                               │                           │
    │──── Open connection ─────────►│◄──── Open connection ─────│
    │                               │                           │
    │                               │                           │
    │──── Send message ─────────────►│                           │
    │                               │                           │
    │                               │──── Push update ─────────►│
    │◄──── Confirmation ────────────│                           │
    │                               │                           │
    │                               │                           │
    │                               │◄──── Send message ────────│
    │◄──── Push update ─────────────│                           │
    │                               │──── Confirmation ────────►│
    │                               │                           │
    
All connected clients receive updates within milliseconds!
```

---

## 🧪 Testing Scenarios

### Scenario 1: Single Player
```
Open Browser
    ↓
Select Character (Vikram)
    ↓
Click Chat Tab
    ↓
Send Message
    ↓
✅ Message appears
✅ Timestamp shows
✅ "Chatting as Vikram" displays
```

### Scenario 2: Multiple Players
```
Browser 1 (Vikram)          Browser 2 (Anish)
       │                           │
  Send "Hello"                     │
       │                           │
       │                      Sees "Hello"
       │                      from Vikram
       │                           │
       │                      Send "Hi back!"
       │                           │
  Sees "Hi back!"                  │
  from Anish                       │
```

### Scenario 3: Persistence
```
Send messages → Close browser → Reopen → Chat tab
                                           ↓
                                  ✅ All messages loaded
                                  ✅ History preserved
```

---

## 📊 Performance Metrics

```
Metric                  Value               Impact
─────────────────────────────────────────────────────
Initial Load Time       < 1 second          Fast
Message Send Latency    50-200ms            Real-time
Auto-scroll Delay       Smooth (0ms)        Instant
Message Limit           100 messages        Manageable
Database Reads/Message  11 (all players)    Low cost
Network Usage           ~1KB/message        Minimal
```

---

This visual guide should help you understand exactly how everything connects! 🎨📊

See `CHAT_SETUP_QUICKSTART.md` for step-by-step instructions!
