import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, getDocs, writeBatch } from 'firebase/firestore';

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

// Initialize Firestore
export const db = getFirestore(app);

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
        lastUpdated: Date.now()
      });
    } else {
      // Ensure new fields exist in existing game state
      const data = docSnap.data();
      if (!data.unlockedFiles || !('voteResultsVisible' in data) || !('revealedToMurderer' in data) || !data.revealedClues || !('gameEnded' in data)) {
        await updateDoc(gameStateRef, {
          unlockedFiles: data.unlockedFiles || ['f_incident'],
          voteResultsVisible: data.voteResultsVisible ?? false,
          revealedToMurderer: data.revealedToMurderer ?? false,
          revealedClues: data.revealedClues || [],
          gameEnded: data.gameEnded ?? false,
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

// Toggle murderer reveal
export const updateMurdererReveal = async (isRevealed) => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    await updateDoc(gameStateRef, {
      revealedToMurderer: isRevealed,
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

// Unlock files for a specific round
export const unlockFilesForRound = async (roundNumber) => {
  const roundFiles = {
    0: ['f_incident'],
    3: ['f_toxreport', 'f_cctv_bar', 'f_cctv_freezer', 'f_insurance'],
    4: ['f_medical', 'f_journal', 'f_financial']
  };
  
  const filesToUnlock = roundFiles[roundNumber] || [];
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

// Clear all chat messages
export const clearAllMessages = async () => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef);
    const snapshot = await getDocs(q);
    
    // Use batch delete for better performance
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleared ${snapshot.docs.length} messages`);
  } catch (error) {
    console.error('Error clearing messages:', error);
  }
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
      lastUpdated: Date.now()
    });

    // Reset votes
    await setDoc(votesRef, {
      votes: {},
      voteCounts: {},
      lastUpdated: Date.now()
    });

    // Reset player data (unlocked clues)
    await setDoc(playerDataRef, {
      unlockedClues: {},
      lastUpdated: Date.now()
    });

    // Clear all chat messages
    await clearAllMessages();

  } catch (error) {
    console.error('Error resetting game state:', error);
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
        voteCounts: {}, // { suspectId: count }
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error initializing votes:', error);
  }
};

// Submit a vote
export const submitVote = async (userId, suspectId, currentRound) => {
  const votesRef = doc(db, VOTES_DOC);
  try {
    const docSnap = await getDoc(votesRef);
    const data = docSnap.exists() ? docSnap.data() : { votes: {}, voteCounts: {} };
    
    const votes = data.votes || {};
    const voteCounts = data.voteCounts || {};
    
    // Get user's previous vote for this round (if any)
    const userVotes = votes[userId] || {};
    const previousVote = userVotes[currentRound];
    
    // Remove previous vote count
    if (previousVote && voteCounts[previousVote]) {
      voteCounts[previousVote] = Math.max(0, (voteCounts[previousVote] || 0) - 1);
    }
    
    // Add new vote
    userVotes[currentRound] = suspectId;
    votes[userId] = userVotes;
    
    // Update vote counts
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
    
    await setDoc(votesRef, {
      votes,
      voteCounts,
      lastUpdated: Date.now()
    });
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
      callback({ votes: {}, voteCounts: {} });
    }
  });
};
