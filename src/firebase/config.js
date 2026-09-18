import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, setDoc, getDoc, updateDoc, deleteField, onSnapshot, collection, query, getDocs, writeBatch,
  orderBy, limit
} from 'firebase/firestore';
import { CASE_FILES } from '../data/gameData.js';

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
        lastUpdated: Date.now()
      });
    } else {
      // Ensure new fields exist in existing game state
      const data = docSnap.data();
      if (!data.unlockedFiles || !('voteResultsVisible' in data) || !('revealedToMurderer' in data) || !data.revealedClues || !('gameEnded' in data) || !('forceRefreshAt' in data)) {
        await updateDoc(gameStateRef, {
          unlockedFiles: data.unlockedFiles || ['f_incident'],
          voteResultsVisible: data.voteResultsVisible ?? false,
          revealedToMurderer: data.revealedToMurderer ?? false,
          revealedClues: data.revealedClues || [],
          gameEnded: data.gameEnded ?? false,
          forceRefreshAt: data.forceRefreshAt ?? 0,
          lastUpdated: Date.now()
        });
      }
    }
  } catch (error) {
    console.error('Error initializing game state:', error);
  }
};

// Update current round
export const updateCurrentRound = async (round) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      currentRound: round,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating round:', error);
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
