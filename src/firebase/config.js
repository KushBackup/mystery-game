import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, setDoc, getDoc, updateDoc, deleteField, onSnapshot, collection, query, getDocs, writeBatch,
  orderBy, limit
} from 'firebase/firestore';
import { CASE_FILES } from '../data/gameData.js';
import { IDLE_TIMER, writeTimer } from '../lib/roundTimer.js';
import { NOT_STARTED, skipCountdown, writeStartedAt } from '../lib/gameStart.js';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBr2zO-hMOEUZiY6BumIkPwhB9t0vWazmM",
  authDomain: "murder-1bf1c.firebaseapp.com",
  projectId: "murder-1bf1c",
  storageBucket: "murder-1bf1c.firebasestorage.app",
  messagingSenderId: "1066963158553",
  appId: "1:1066963158553:web:50a78fed478e6a4e458c88",
  measurementId: "G-QVFMP42DVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB offline persistence.
//
// 69 phones on shaky office wifi: the persistent cache lets the app keep
// rendering the last-known round, files and clues through a dropped connection
// instead of blanking out, and replays queued writes when the link returns.
// persistentMultipleTabManager is required because players routinely have the
// PWA and a browser tab open at once — the single-tab manager throws
// "Failed to obtain exclusive access to the persistence layer" in that case.
//
// Must be initializeFirestore(), not getFirestore(): settings can only be
// supplied before any other Firestore call touches the instance.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Game state document reference
const GAME_STATE_DOC = 'gameState/current';

// Initialize game state (call this once on first load)
export const initializeGameState = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    const docSnap = await getDoc(gameStateRef);
    if (!docSnap.exists()) {
      await setDoc(gameStateRef, {
        currentRound: 0,
        isVotingOpen: false,
        unlockedFiles: ['f_incident'], // Incident report unlocked by default
        voteResultsVisible: false,
        revealedToMurderer: false,
        revealedClues: [], // Host-revealed clues
        gameEnded: false, // Track if game has ended
        forceRefreshAt: 0, // Timestamp of the host's last force-sync broadcast
        // Not started: every player who logs in waits on the standby screen
        // until the host presses Start. See lib/gameStart.js.
        ...writeStartedAt(NOT_STARTED),
        // The round clock, stopped. Four flat fields rather than a nested map —
        // see lib/roundTimer.js for the shape and why it is stored this way.
        ...writeTimer(IDLE_TIMER),
        lastUpdated: Date.now()
      });
    } else {
      // Ensure new fields exist in existing game state
      const data = docSnap.data();
      if (!data.unlockedFiles || !('voteResultsVisible' in data) || !('revealedToMurderer' in data) || !data.revealedClues || !('gameEnded' in data) || !('forceRefreshAt' in data) || !('roundTimerEndsAt' in data) || !('gameStartedAt' in data)) {
        await updateDoc(gameStateRef, {
          unlockedFiles: data.unlockedFiles || ['f_incident'],
          voteResultsVisible: data.voteResultsVisible ?? false,
          revealedToMurderer: data.revealedToMurderer ?? false,
          revealedClues: data.revealedClues || [],
          gameEnded: data.gameEnded ?? false,
          forceRefreshAt: data.forceRefreshAt ?? 0,
          // The mirror image of the round-clock backfill below. Backfilling a
          // game that is already past Round 0 as "not started" would drop the
          // standby screen onto a room mid-evening, so a game with a round on
          // the board is treated as started — and started long enough ago that
          // nobody is shown a countdown. Only a game still sitting on Round 0
          // gets the gate, which is where it belongs.
          gameStartedAt: data.gameStartedAt ?? ((data.currentRound ?? 0) > 0 ? 1 : NOT_STARTED),
          // Migrating a live game mid-event must not start a clock nobody asked
          // for, so the backfill is the stopped timer and the host starts it.
          roundTimerEndsAt: data.roundTimerEndsAt ?? IDLE_TIMER.endsAt,
          roundTimerRemainingMs: data.roundTimerRemainingMs ?? IDLE_TIMER.remainingMs,
          roundTimerDurationMs: data.roundTimerDurationMs ?? IDLE_TIMER.durationMs,
          roundTimerRound: data.roundTimerRound ?? (data.currentRound ?? 0),
          lastUpdated: Date.now()
        });
      }
    }
  } catch (error) {
    console.error('Error initializing game state:', error);
  }
};

// Update current round, and the round's clock with it.
//
// One write, not two, and that is the whole reason `timer` is a parameter here
// rather than a second call the console makes afterwards. The clock belongs to a
// round (lib/roundTimer.js), so an advance that arrived on 69 phones one snapshot
// ahead of its timer would show every player the new round still holding the old
// round's countdown — and if the second write failed, permanently.
export const updateCurrentRound = async (round, timer = null) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      currentRound: round,
      ...(timer ? writeTimer(timer) : {}),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating round:', error);
  }
};

// Start, pause, resume, re-arm or stop the round clock.
//
// Host-only by convention rather than by rule — firestore.rules is open, and the
// host is the trust boundary (see the header there). Nothing on a player's phone
// calls this: every device reads the clock and none of them writes one, which is
// what stops 69 countdowns disagreeing about when the round ends.
export const updateRoundTimer = async (timer) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      ...writeTimer(timer),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating round timer:', error);
  }
};

// Fire the starting gun, and start the round's clock with it.
//
// One write, not two, for exactly the reason updateCurrentRound takes its timer
// as a parameter: the standby screen clearing and the clock beginning are one
// event in the room, and if the second write failed the room would be let in
// against a clock that never started. The caller builds both values (see
// HostPanel.jsx) so the console can show them the instant it taps.
//
// Host-only by convention rather than by rule — firestore.rules is open and the
// host is the trust boundary (see the header there). Nothing on a player's
// phone writes a start; every device reads this one.
export const startGame = async (startedAt, timer = null) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      ...writeStartedAt(startedAt),
      ...(timer ? writeTimer(timer) : {}),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error starting game:', error);
  }
};

// Push the start through to every device, countdown and all.
//
// The escape hatch for the one minute of the evening where a wedged phone is
// most visible: the room has been let in and somebody is still looking at
// standby. Two things happen, and both are needed, because the two failure
// modes are different. The start instant is rewritten far enough into the past
// that no device has a countdown left to run (lib/gameStart.js), which fixes a
// phone that took the start late and would otherwise replay it. And
// forceRefreshAt is bumped, which fixes the phone whose snapshot listener died
// and would never have seen the first write either — a reload is the only thing
// that reaches that one.
//
// Deliberately does NOT touch the round clock. By the time a host reaches for
// this the clock is running, and restarting it at full length would hand the
// room ten extra minutes nobody asked for.
export const pushGameStart = async (startedAt = skipCountdown()) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      ...writeStartedAt(startedAt),
      forceRefreshAt: Date.now(),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error pushing game start:', error);
  }
};

// Put the room back on the standby screen.
//
// The undo for a mis-tapped Start. Without it the only way back is Reset Game,
// which also clears the round, the votes, every unlocked clue and the chat
// channel — a wildly disproportionate price for one wrong tap, and one the host
// would be paying in front of 69 people. The round clock is left exactly as it
// is: stopping it is a separate decision with its own control three inches away.
export const holdGameAtStandby = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      ...writeStartedAt(NOT_STARTED),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error holding game at standby:', error);
  }
};

// Toggle voting status
export const updateVotingStatus = async (isOpen) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      isVotingOpen: isOpen,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating voting status:', error);
  }
};

// Toggle vote results visibility
export const updateVoteResultsVisibility = async (isVisible) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      voteResultsVisible: isVisible,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating vote results visibility:', error);
  }
};

// Public murderer reveal — locks the game into its terminal state by also
// setting gameEnded so players can't navigate past the reveal overlay.
// Reset Game clears both flags.
export const updateMurdererReveal = async (isRevealed) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      revealedToMurderer: isRevealed,
      ...(isRevealed ? { gameEnded: true } : {}),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating murderer reveal:', error);
  }
};

// End the game (show outro splash to all players)
export const endGame = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      gameEnded: true,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error ending game:', error);
  }
};

// Force every connected device to reload.
//
// The escape hatch for the live event: if a phone is wedged on a stale round,
// or a service-worker update needs picking up mid-game, the host broadcasts a
// new timestamp and every client reloads itself (see App.jsx). Writing a fresh
// Date.now() — rather than a boolean — is what makes it re-triggerable; each
// press is a strictly larger value, so clients can tell a new broadcast from
// the one they already acted on.
//
// Logins survive because App.jsx mirrors the session to localStorage. Do not
// remove that without also removing this button — a reload without session
// persistence dumps all 69 players back at the login screen mid-game.
export const triggerForceRefresh = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      forceRefreshAt: Date.now(),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error triggering force refresh:', error);
  }
};

// Unlock files by adding file IDs to unlockedFiles array
export const unlockFiles = async (fileIds) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    const docSnap = await getDoc(gameStateRef);
    const data = docSnap.data();
    const currentUnlocked = data.unlockedFiles || [];
    const newUnlocked = [...new Set([...currentUnlocked, ...fileIds])];
    
    await updateDoc(gameStateRef, {
      unlockedFiles: newUnlocked,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error unlocking files:', error);
  }
};

// Unlock every case file gated behind a given round.
//
// Derived from CASE_FILES at call time, never a hardcoded ID list. This
// function used to keep its own copy of the round-to-file mapping, and the
// Velvet Ember rewrite renamed the files out from under it (f_toxreport ->
// f_autopsy, f_medical -> f_audit, and so on). The copy went on writing IDs
// that no longer existed, so the host saw the round go out and every player
// saw an empty archive — the client filters CASE_FILES by these IDs, and
// nothing matched. Round 0 was the only one that appeared to work, because
// f_incident happened to keep its name.
export const unlockFilesForRound = async (roundNumber) => {
  const filesToUnlock = CASE_FILES
    .filter((f) => f.roundReq === roundNumber)
    .map((f) => f.id);

  if (filesToUnlock.length > 0) {
    await unlockFiles(filesToUnlock);
  }
};

// Reveal clues by adding clue IDs to revealedClues array
export const revealClues = async (clueIds) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    const docSnap = await getDoc(gameStateRef);
    const data = docSnap.data();
    const currentRevealed = data.revealedClues || [];
    const newRevealed = [...new Set([...currentRevealed, ...clueIds])];
    
    await updateDoc(gameStateRef, {
      revealedClues: newRevealed,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error revealing clues:', error);
  }
};

// Reveal all clues for a specific round
export const revealCluesForRound = async (roundNumber) => {
  // Import will be done at runtime
  const { CLUE_DB } = await import('../data/gameData.js');
  
  const roundClues = CLUE_DB.filter(c => c.roundReq === roundNumber).map(c => c.id);
  if (roundClues.length > 0) {
    await revealClues(roundClues);
  }
};

// --- COMMS CHANNEL ---

// How many messages a client keeps in view. The channel is a party chat, not an
// archive: 69 people over an evening will run well past this, and nobody scrolls
// back two hours. It also bounds the unread badge — one of the hundred is the
// read watermark, so the count can never exceed 99.
const MESSAGE_WINDOW = 100;

// The one subscription to the channel, shared by every consumer.
//
// Two consumers exist — ChatView (which renders the thread) and
// useUnreadMessages (which drives the Comms badge on the hub). They MUST build
// the query here rather than each rolling their own: Firestore shares a single
// listen stream between identical queries, so one query definition is one watch
// on the wire instead of two, and the thread and the badge cannot end up
// disagreeing about which hundred messages are the channel.
//
// Ordered DESC and reversed, not ASC. `orderBy('createdAt','asc').limit(100)`
// returns the *oldest* hundred — so the moment the room passed a hundred
// messages the thread would freeze on the backlog and every message after it
// would be invisible, badge included. DESC + limit takes the newest hundred;
// the reverse below puts them back in reading order.
export const subscribeToMessages = (callback, onError) => {
  const q = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(MESSAGE_WINDOW)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      docs.reverse(); // oldest → newest, the order the channel reads in
      callback(docs);
    },
    onError
  );
};

// A Firestore write batch commits at most 500 operations. The channel is not
// windowed on the server — only the read in subscribeToMessages is — so the
// collection holds every message the event ever sent. The last 69-player
// evening left 265; a longer one runs past 500, and a single over-size batch is
// rejected whole, clearing nothing.
const BATCH_LIMIT = 450;

// Clear the whole channel. Host-only, called by Reset Game.
//
// This throws on failure instead of logging and returning, because it has
// already failed silently once: firestore.rules carried
// `allow update, delete: if false` on messages, so every delete here was
// rejected, the error was swallowed, and the host saw a clean reset while all
// 69 players still had the previous game's thread in front of them. A reset
// that cannot clear the chat must say so.
export const clearAllMessages = async () => {
  const snapshot = await getDocs(query(collection(db, 'messages')));

  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + BATCH_LIMIT).forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }

  console.log(`Cleared ${snapshot.docs.length} messages`);
  return snapshot.docs.length;
};

// --- PLAYER DATA (Unlocked Clues) ---

const PLAYER_DATA_DOC = 'gameState/playerData';

// Initialize player data
export const initializePlayerData = async () => {
  const playerDataRef = doc(db, PLAYER_DATA_DOC);
  try {
    const docSnap = await getDoc(playerDataRef);
    if (!docSnap.exists()) {
      await setDoc(playerDataRef, {
        unlockedClues: {}, // { userId: [clueId1, clueId2, ...] }
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error initializing player data:', error);
  }
};

// Add unlocked clue for a player
export const addUnlockedClue = async (userId, clueId) => {
  const playerDataRef = doc(db, PLAYER_DATA_DOC);
  try {
    const docSnap = await getDoc(playerDataRef);
    const data = docSnap.exists() ? docSnap.data() : { unlockedClues: {} };
    
    const unlockedClues = data.unlockedClues || {};
    const userClues = unlockedClues[userId] || [];
    
    if (!userClues.includes(clueId)) {
      userClues.push(clueId);
      unlockedClues[userId] = userClues;
      
      await setDoc(playerDataRef, {
        unlockedClues,
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error adding unlocked clue:', error);
    throw error;
  }
};

// Subscribe to player data changes
export const subscribeToPlayerData = (callback) => {
  const playerDataRef = doc(db, PLAYER_DATA_DOC);
  return onSnapshot(playerDataRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ unlockedClues: {} });
    }
  });
};

// Reset game state (for new game)
export const resetGameState = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  const votesRef = doc(db, VOTES_DOC);
  const playerDataRef = doc(db, 'gameState/playerData');
  
  try {
    // Reset main game state
    await setDoc(gameStateRef, {
      currentRound: 0,
      isVotingOpen: false,
      unlockedFiles: ['f_incident'],
      voteResultsVisible: false,
      revealedToMurderer: false,
      revealedClues: [],
      gameEnded: false,
      // Back to standby. A reset is the host setting up for the next room, and
      // the next room should be held at the door exactly like this one was.
      ...writeStartedAt(NOT_STARTED),
      // Stopped, and armed at the default length — a new game's Round 0 is the
      // briefing, which nobody should walk into against a running clock.
      ...writeTimer(IDLE_TIMER),
      // A reset bumps this too: every device reloads onto the clean state
      // rather than sitting on stale round/clue data from the previous game.
      forceRefreshAt: Date.now(),
      lastUpdated: Date.now()
    });

    // Reset votes
    await setDoc(votesRef, {
      votes: {},
      lastUpdated: Date.now()
    });

    // Reset player data (unlocked clues)
    await setDoc(playerDataRef, {
      unlockedClues: {},
      lastUpdated: Date.now()
    });

    // Clear all chat messages. Deliberately last: if the channel refuses to
    // clear, the round, votes and clues are already back to zero, and the
    // rethrow below tells the host which half didn't land.
    await clearAllMessages();

  } catch (error) {
    console.error('Error resetting game state:', error);
    throw error;
  }
};

// Subscribe to game state changes
export const subscribeToGameState = (callback) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  return onSnapshot(gameStateRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// --- VOTING SYSTEM ---

// Votes document reference
const VOTES_DOC = 'gameState/votes';

// Initialize votes document
export const initializeVotes = async () => {
  const votesRef = doc(db, VOTES_DOC);
  try {
    const docSnap = await getDoc(votesRef);
    if (!docSnap.exists()) {
      await setDoc(votesRef, {
        votes: {}, // { userId: { round: suspectId } }
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error initializing votes:', error);
  }
};

// Submit a vote
//
// `votes` is the only record of who voted for whom: { userId: { round: suspectId } }.
// There is deliberately no stored tally alongside it. A flat { suspectId: count }
// cache cannot express "this round" — it summed every round of the game into one
// number, so by Round 7 the ballot screen was reporting seven rounds of votes as
// though the room had just cast them. The counts are derived per round from this
// map instead (see App.jsx).
//
// The write is a deep merge of one field rather than a read-then-replace of the
// whole document: 69 phones tap the same ballot within a few seconds of the host
// opening it, and a getDoc/setDoc pair would have each voter overwrite whatever
// landed between their read and their write. A merge touches only this player's
// entry, so nobody's vote is lost — and it creates the document if the host has
// not initialised it yet. Changing a vote just overwrites this round's key.
export const submitVote = async (userId, suspectId, currentRound) => {
  const votesRef = doc(db, VOTES_DOC);
  try {
    await setDoc(
      votesRef,
      {
        votes: { [userId]: { [currentRound]: suspectId } },
        // Clears the retired cross-round cache the moment anyone votes, so a
        // database carried over from an earlier game stops holding a stale total.
        voteCounts: deleteField(),
        lastUpdated: Date.now()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

// Subscribe to vote changes
export const subscribeToVotes = (callback) => {
  const votesRef = doc(db, VOTES_DOC);
  return onSnapshot(votesRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ votes: {} });
    }
  });
};
