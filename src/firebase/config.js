import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, setDoc, getDoc, updateDoc, deleteField, onSnapshot, collection, query, getDocs, writeBatch,
  orderBy, limit, where, runTransaction
} from 'firebase/firestore';
import { CASE_FILES, CLUE_DB, validateLoginCode } from '../data/gameData.js';
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

// --- WALK-IN PLAYERS --------------------------------------------------------
//
// These collections deliberately sit beside, not inside, the canonical case
// data. A walk-in gets the same public play surfaces as anyone else but never
// becomes one of the 26 story characters, a suspect, a pod member or a clue.
const WALK_IN_PASSES = 'walkInPasses';
const BYSTANDERS = 'bystanders';
const WALK_IN_CONTACTS = 'walkInContacts';
const WALK_IN_PASS_LIFETIME_MS = 30 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Door codes must be sayable across a loud room and writable without handing
// somebody a miniature password. Each word is reserved once at a time: an open
// pass and an active walk-in can never share one. Fifty words supports twenty-
// five concurrent registration/login pairs without touching the case-code pool.
export const WALK_IN_WORDS = [
  'ACORN', 'BAMBOO', 'BERRY', 'BICYCLE', 'BLOSSOM', 'BUTTON', 'CANDLE', 'CANYON',
  'CARROT', 'CASTLE', 'CEDAR', 'CLOUD', 'CORAL', 'CRAYON', 'DAISY', 'DRAGON',
  'FEATHER', 'FERN', 'FIREWORK', 'GARDEN', 'GINGER', 'GLOBE', 'HARBOR', 'HONEY',
  'ISLAND', 'JACKET', 'JASMINE', 'KETTLE', 'LAGOON', 'LEMON', 'MAPLE', 'MEADOW',
  'MIRROR', 'MOUNTAIN', 'MUG', 'ORCHARD', 'PAPER', 'PEBBLE', 'PENGUIN', 'PILLOW',
  'PLANET', 'RAINBOW', 'RIVER', 'ROCKET', 'SHELL', 'SUNFLOWER', 'TEACUP', 'THUNDER',
  'TULIP', 'WINDOW',
];

const cleanText = (value, maxLength) => String(value ?? '').trim().slice(0, maxLength);

const phoneIsValid = (phone) => (phone.match(/\d/g) ?? []).length >= 7;

const chooseWalkInWords = async (count = 1) => {
  const [passSnapshot, bystanderSnapshot] = await Promise.all([
    getDocs(collection(db, WALK_IN_PASSES)),
    getDocs(collection(db, BYSTANDERS)),
  ]);
  const reserved = new Set([
    ...passSnapshot.docs
      .map((docSnap) => docSnap.data())
      .flatMap((pass) => [pass.code, pass.loginCode]),
    ...bystanderSnapshot.docs
      .map((docSnap) => docSnap.data())
      .map((bystander) => bystander.loginCode),
    ...CLUE_DB.map((clue) => clue.code),
  ]);
  const available = WALK_IN_WORDS.filter(
    (word) => !reserved.has(word) && !validateLoginCode(word)
  );
  if (available.length < count) throw new Error('Not enough walk-in words are free. Reset the game to clear the register.');
  return [...available]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

export const validateWalkInRegistration = (input = {}) => {
  const name = cleanText(input.name, 60);
  const profession = cleanText(input.profession, 60);
  const hiddenTalent = cleanText(input.hiddenTalent, 140);
  const phone = cleanText(input.phone, 30);
  const email = cleanText(input.email, 120).toLowerCase();
  const confession = cleanText(input.confession, 140);
  const traits = [...new Set((input.traits ?? []).map((trait) => cleanText(trait, 30)).filter(Boolean))];

  if (!name) return { ok: false, message: 'Name is required.' };
  if (!profession) return { ok: false, message: 'Choose a profession.' };
  if (traits.length !== 3) return { ok: false, message: 'Choose exactly three traits.' };
  if (!hiddenTalent) return { ok: false, message: 'Add a hidden talent.' };
  if (!phoneIsValid(phone)) return { ok: false, message: 'Enter a valid phone number.' };
  if (!EMAIL_RE.test(email)) return { ok: false, message: 'Enter a valid email address.' };

  return {
    ok: true,
    value: { name, profession, traits, hiddenTalent, phone, email, confession },
  };
};

const passByCode = async (code) => {
  const normalized = cleanText(code, 20).toUpperCase();
  const snapshot = await getDocs(
    query(collection(db, WALK_IN_PASSES), where('code', '==', normalized), limit(1))
  );
  return snapshot.docs[0] ?? null;
};

export const issueWalkInPass = async () => {
  const now = Date.now();
  const id = `pass_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const [code, loginCode] = await chooseWalkInWords(2);
  const pass = {
    id,
    code,
    status: 'OPEN',
    loginCode,
    createdAt: now,
    expiresAt: now + WALK_IN_PASS_LIFETIME_MS,
    claimedBy: null,
  };

  await setDoc(doc(db, WALK_IN_PASSES, id), pass);
  return pass;
};

export const revokeWalkInPass = async (passId) => {
  const passRef = doc(db, WALK_IN_PASSES, passId);
  await runTransaction(db, async (transaction) => {
    const passSnap = await transaction.get(passRef);
    if (!passSnap.exists()) throw new Error('That registration word is no longer available.');
    if (passSnap.data().status !== 'OPEN') throw new Error('A claimed registration word cannot be revoked.');
    // Keep the record so both pre-reserved words remain unavailable for this
    // game. Deleting it would make the allocator hand the same words back out.
    transaction.update(passRef, {
      status: 'REVOKED',
      revokedAt: Date.now(),
    });
  });
};

export const claimWalkInPass = async (passCode, registration) => {
  const validated = validateWalkInRegistration(registration);
  if (!validated.ok) throw new Error(validated.message);

  const passSnap = await passByCode(passCode);
  if (!passSnap) throw new Error('That walk-in pass is not recognised.');

  const passRef = passSnap.ref;
  const bystanderId = `bystander_${passSnap.id}`;
  const bystanderRef = doc(db, BYSTANDERS, bystanderId);
  const now = Date.now();
  let loginCode = passSnap.data().loginCode || null;
  if (!loginCode) [loginCode] = await chooseWalkInWords(1);
  const { phone, email, ...publicProfile } = validated.value;

  await runTransaction(db, async (transaction) => {
    const currentPass = await transaction.get(passRef);
    if (!currentPass.exists()) throw new Error('That walk-in pass is no longer available.');

    const pass = currentPass.data();
    if (pass.status !== 'OPEN') throw new Error('That walk-in pass has already been used.');
    if ((pass.expiresAt ?? 0) < now) throw new Error('That walk-in pass has expired.');

    transaction.set(bystanderRef, {
      id: bystanderId,
      kind: 'BYSTANDER',
      active: true,
      name: publicProfile.name,
      profession: publicProfile.profession,
      traits: publicProfile.traits,
      hiddenTalent: publicProfile.hiddenTalent,
      confession: publicProfile.confession,
      loginCode,
      passId: passSnap.id,
      addedAt: now,
      removedAt: null,
    });
    transaction.set(doc(db, WALK_IN_CONTACTS, bystanderId), {
      id: bystanderId,
      phone,
      email,
      addedAt: now,
    });
    transaction.update(passRef, {
      status: 'CLAIMED',
      claimedBy: bystanderId,
      claimedAt: now,
    });
  });

  return { id: bystanderId, loginCode, ...publicProfile };
};

export const resolveWalkInLoginCode = async (code) => {
  const normalized = cleanText(code, 20).toUpperCase();
  const snapshot = await getDocs(
    query(collection(db, BYSTANDERS), where('loginCode', '==', normalized), limit(1))
  );
  const found = snapshot.docs[0];
  if (!found) return null;

  const bystander = found.data();
  return bystander.active ? bystander : null;
};

export const removeWalkIn = async (bystanderId) => {
  await updateDoc(doc(db, BYSTANDERS, bystanderId), {
    active: false,
    removedAt: Date.now(),
  });
};

export const subscribeToWalkIns = (callback) =>
  onSnapshot(collection(db, BYSTANDERS), (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
      snapshot.docChanges()
    );
  });

export const subscribeToWalkInPasses = (callback) =>
  onSnapshot(collection(db, WALK_IN_PASSES), (snapshot) => {
    callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
  });

const clearCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  for (let index = 0; index < snapshot.docs.length; index += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(index, index + BATCH_LIMIT).forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }
};

// Initialize game state (call this once on first load)
export const initializeGameState = async () => {
  const gameStateRef = doc(db, GAME_STATE_DOC);
  try {
    const docSnap = await getDoc(gameStateRef);
    if (!docSnap.exists()) {
      await setDoc(gameStateRef, {
        currentRound: 0,
        unlockedFiles: ['f_incident'], // Incident report unlocked by default
        revealedToMurderer: false,
        revealedClues: [], // Host-revealed clues
        gameEnded: false, // Track if game has ended
        resetInProgress: false, // Hold clients while the host wipes the previous room
        forceRefreshAt: 0, // Timestamp of the host's last force-sync broadcast
        tutorialResetAt: 0, // Timestamp of the last host reset for local tutorial ledgers
        // Not started: every player who logs in waits on the standby screen
        // until the host presses Start. See lib/gameStart.js.
        ...writeStartedAt(NOT_STARTED),
        // The round clock and ballot duration, stopped. Five flat fields rather than a nested map —
        // see lib/roundTimer.js for the shape and why it is stored this way.
        ...writeTimer(IDLE_TIMER),
        lastUpdated: Date.now()
      });
    } else {
      // Ensure new fields exist in existing game state
      const data = docSnap.data();
      if (!data.unlockedFiles || !('revealedToMurderer' in data) || !data.revealedClues || !('gameEnded' in data) || !('resetInProgress' in data) || !('forceRefreshAt' in data) || !('tutorialResetAt' in data) || !('roundTimerEndsAt' in data) || !('roundTimerVotingDurationMs' in data) || !('gameStartedAt' in data)) {
        await updateDoc(gameStateRef, {
          unlockedFiles: data.unlockedFiles || ['f_incident'],
          revealedToMurderer: data.revealedToMurderer ?? false,
          revealedClues: data.revealedClues || [],
          gameEnded: data.gameEnded ?? false,
          resetInProgress: data.resetInProgress ?? false,
          forceRefreshAt: data.forceRefreshAt ?? 0,
          tutorialResetAt: data.tutorialResetAt ?? 0,
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
          roundTimerVotingDurationMs: data.roundTimerVotingDurationMs ?? IDLE_TIMER.votingDurationMs,
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
  let resetStarted = false;

  try {
    // Phase one: every player who receives this snapshot is held before any
    // destructive work begins. The force-refresh must not happen here: reloading
    // halfway through a chat wipe is how a "reset" can still show old messages.
    await updateDoc(gameStateRef, {
      resetInProgress: true,
      lastUpdated: Date.now(),
    });
    resetStarted = true;

    // Clear every shared record that belongs to one room.
    await setDoc(votesRef, {
      votes: {},
      lastUpdated: Date.now()
    });

    await setDoc(playerDataRef, {
      unlockedClues: {},
      lastUpdated: Date.now()
    });

    // Walk-ins belong to this room, not the next one. Their historical profile
    // records remain in the current game only; the fixed story roster lives in
    // gameData.js and is never touched by reset.
    await clearCollection(BYSTANDERS);
    await clearCollection(WALK_IN_CONTACTS);
    await clearCollection(WALK_IN_PASSES);

    await clearAllMessages();

    // Phase two: only after every collection has been wiped do we publish the
    // fresh room and its reload signal. New players return to standby, with no
    // votes, clues, messages, walk-ins, timer, reveal, or host-released files.
    const resetAt = Date.now();
    await setDoc(gameStateRef, {
      currentRound: 0,
      unlockedFiles: ['f_incident'],
      revealedToMurderer: false,
      revealedClues: [],
      gameEnded: false,
      resetInProgress: false,
      ...writeStartedAt(NOT_STARTED),
      ...writeTimer(IDLE_TIMER),
      forceRefreshAt: resetAt,
      tutorialResetAt: resetAt,
      lastUpdated: resetAt,
    });

  } catch (error) {
    // A failed cleanup must not leave players indefinitely behind the reset
    // curtain. The host still receives the failure and can retry the reset.
    if (resetStarted) {
      try {
        await updateDoc(gameStateRef, { resetInProgress: false, lastUpdated: Date.now() });
      } catch (releaseError) {
        console.error('Error releasing reset hold:', releaseError);
      }
    }
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
