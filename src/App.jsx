import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calculator, Riddle } from './components/icons/IconComponents';
import { FeedbackToast } from './components/ui/FeedbackToast';
import { Header } from './components/layout/Header';
import GridMenu from './components/GridMenu';
import { DashboardView } from './components/views/DashboardView';
import { IntelView } from './components/views/IntelView';
import { DossierView } from './components/views/DossierView';
import { ChatView } from './components/views/ChatView';
import { VotingView } from './components/views/VotingView';
import { TimelineView } from './components/views/TimelineView';
import { HelpView } from './components/views/HelpView';
import { StoryView } from './components/views/StoryView';
import { GuestProfileModal } from './components/modals/GuestProfileModal';
import { DecoderModal } from './components/modals/DecoderModal';
import { RiddleModal } from './components/modals/RiddleModal';
import { VoteResultsModal } from './components/modals/VoteResultsModal';
import { InfoTip } from './components/ui/InfoTip';
import { CharacterSelect } from './components/CharacterSelect';
import { HostPanel } from './components/HostPanel';
import { SplashScreen } from './components/SplashScreen';
import { StoryIntro } from './components/StoryIntro';
import { OutroSplash } from './components/OutroSplash';
import { MurdererRevealOverlay } from './components/MurdererRevealOverlay';
import { StandbyScreen } from './components/StandbyScreen';
import { ROUNDS, CHARACTERS, CLUE_DB, stackKeyForClue, getAssignedAccusation, getWalkInAccusation, CONFESSION_CLUE, getKillers, isMurderer, nextRiddleReward, nextWalkInRiddleReward, ASK_OPENS_AT } from './data/gameData';
import { SCREEN_GUIDE } from './data/screenGuide';
import { TOOLTIPS } from './data/tooltips';
import { IDLE_TIMER, readTimer } from './lib/roundTimer';
import { NOT_STARTED, readStartedAt, startPhase } from './lib/gameStart';
import { initializeGameState, subscribeToGameState, initializeVotes, subscribeToVotes, submitVote as submitVoteToFirebase, initializePlayerData, subscribeToPlayerData, addUnlockedClue, subscribeToWalkIns, subscribeToWalkInPasses } from './firebase/config';
import { clearUnreadMessages, useUnreadMessages } from './hooks/useUnreadMessages';
import { useVotingPhase } from './hooks/useVotingPhase';
import { TUTORIAL_STAGES, clearTutorialProgress, readTutorialStage, saveTutorialStage, tutorialStageForRound, tutorialStepFor, tutorialTabsFor } from './lib/tutorial';
import { clearSolvedRiddles } from './data/riddles';

// Session is persisted so a reload — whether the host's force-sync broadcast, a
// service-worker update, or a player accidentally swiping the tab away — drops
// them back where they were instead of at the login screen. Mid-event, making
// 69 people re-enter their printed codes is not a recoverable situation.
const SESSION_KEY = 'astral.session';
const HOST_ROUTE = '/host';

// `/host` is the host's separate entry point. It must disregard a player session
// on a shared device, otherwise the persisted player lands straight on standby
// and has no way to reach the console. `route` is how public/404.html restores a
// direct GitHub Pages request for `/mystery-game/host` into this SPA.
const hostRouteRequested = () => {
  const recoveredRoute = new URLSearchParams(window.location.search).get('route');
  const pathname = (recoveredRoute || window.location.pathname).replace(/\/+$/, '');
  const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return pathname === HOST_ROUTE || pathname === `${basePath}${HOST_ROUTE}`;
};

// Every screen wears the same three-part frame (DESIGN_LANGUAGE.md §4.2):
// chrome → hairline → kicker + title → content → hairline → footer. The kicker
// is 11px mono in signal-lift, the title is 32px display in bone. Kickers,
// titles and the screen notes that sit under them all come from SCREEN_GUIDE.

// ChatView owns the full viewport below the chrome rail so its composer can
// stay pinned above the keyboard. Everything else flows in the normal document.
const SELF_FRAMED_VIEWS = new Set(['chat']);

// How long to wait for the first Firestore snapshot before giving up and
// rendering from the local defaults. Every screen below the login gate is chosen
// from game state, so booting from `currentRound = 0` shows the Round 0 briefing
// to a player who reloaded during Round 4. The timeout is the backstop: on a dead
// network a player must still reach the app, late and wrong, rather than sit on a
// holding screen forever.
const STATE_SETTLE_MS = 1500;

const walkInGuest = (walkIn) => ({
  ...walkIn,
  role: 'BYSTANDER',
  isSuspect: false,
  group: 'WALK-INS',
  bio: `A late arrival who joined the Greenr signing dinner while the investigation was already underway.`,
  quirk: walkIn.hiddenTalent || 'No detail filed.',
  secret: walkIn.confession || 'No additional statement filed.',
  timeline: '',
  code: walkIn.loginCode,
});

// A single beat while that first snapshot lands. Same masthead as the splash, so
// a reload reads as the app still booting rather than as a blank screen.
const CaseHold = ({ resetting = false }) => (
  <div className="min-h-screen bg-ink relative er-grain flex items-center justify-center px-6">
    <div className="er-vignette" aria-hidden="true" />
    <div className="relative z-10 text-center er-enter">
      <p className="er-mono er-mono--hot er-mono--wide">{resetting ? 'Case reset' : 'Case 8821-B'}</p>
      <div className="er-rule my-4" />
      <p className="er-mono er-mono--dim">{resetting ? 'Preparing a clean case file' : 'Syncing case file'}</p>
    </div>
  </div>
);

const readSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return { currentUser: null, isHost: false };
    const parsed = JSON.parse(raw);
    return { currentUser: parsed.currentUser ?? null, isHost: parsed.isHost ?? false };
  } catch {
    // Private-mode Safari throws on localStorage access; degrade to a fresh login.
    return { currentUser: null, isHost: false };
  }
};

// The one-time ASK cue (App.css §17). ASK is absent for the first two rounds and
// then appears mid-game beside a CODE button the player already knows, so the
// first time they land on Evidence with it there it knocks to be noticed.
//
// Persisted, and deliberately not part of SESSION_KEY: it must survive a reload,
// a service-worker update and the host's force-sync broadcast, all of which are
// routine mid-event and none of which are a reason to bounce a button at someone
// who has been tapping it for three rounds. Not cleared on logout either — it is
// a fact about this screen, not about this player.
const ASK_CUE_KEY = 'astral.askcue';

const askCueSpent = () => {
  try {
    return window.localStorage.getItem(ASK_CUE_KEY) === 'seen';
  } catch {
    // Private-mode Safari again. Treat an unreadable ledger as already spent:
    // the failure mode of the other answer is a button that knocks on every
    // single visit to Evidence for the whole evening.
    return true;
  }
};

const spendAskCue = () => {
  try {
    window.localStorage.setItem(ASK_CUE_KEY, 'seen');
  } catch {
    // Nothing to do — see above.
  }
};

const clearAskCue = () => {
  try {
    window.localStorage.removeItem(ASK_CUE_KEY);
  } catch {
    // Storage can be unavailable in private browsing; the state reset below still applies.
  }
};

export default function App() {
  // Global State
  const [splashComplete, setSplashComplete] = useState(false);
  const [hostPortal] = useState(() => hostRouteRequested());
  const [currentUser, setCurrentUser] = useState(() =>
    hostPortal ? null : readSession().currentUser
  );
  // null = show grid menu. A restored host session lands straight on the host
  // interface, mirroring what handleLogin does at login time.
  const [activeTab, setActiveTab] = useState(() =>
    hostPortal ? null : readSession().isHost ? 'host' : null
  );
  
  // Game State (Synced with Firebase)
  const [currentRound, setCurrentRound] = useState(0);
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [votes, setVotes] = useState({}); // { userId: { round: suspectId } }
  const [unlockedFiles, setUnlockedFiles] = useState(['f_incident']); // Files unlocked by host
  const [revealedToMurderer, setRevealedToMurderer] = useState(false); // Round 6 reveal
  const [revealedClues, setRevealedClues] = useState([]); // Host-revealed clues
  const [gameEnded, setGameEnded] = useState(false); // Game ended flag
  const [resetInProgress, setResetInProgress] = useState(false);
  // The round clock (lib/roundTimer.js). Game state like everything else above —
  // the host starts it, Firestore broadcasts it, and every device reads the same
  // end instant off the same document rather than running a countdown of its own.
  const [roundTimer, setRoundTimer] = useState(IDLE_TIMER);
  // When the host fired the starting gun, on the host's clock — 0 until they do
  // (lib/gameStart.js). Every player who logs in before that is held on the
  // standby screen, and the ten seconds after it are the countdown the whole
  // room watches together.
  const [gameStartedAt, setGameStartedAt] = useState(NOT_STARTED);
  const [walkIns, setWalkIns] = useState([]);
  const [walkInPasses, setWalkInPasses] = useState([]);
  // Killers only: whether this device has stepped past the public reveal. The
  // host's reveal sets `gameEnded` in the same write, so without this the five
  // of them would drop straight onto the outro and never see the screen naming
  // them — see the routing note above OutroSplash below. Deliberately local and
  // not persisted: a killer who reloads should get the announcement again.
  const [revealStepped, setRevealStepped] = useState(false);

  // Local UI State
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  // The clue this device decoded most recently. IntelView uses it to unseal that
  // one card with a redaction wipe (§6.7) instead of having it simply appear —
  // the player almost always arrives on the board *after* the clue is already in
  // the list, so without knowing which one is new there is no moment to play.
  const [justUnlockedClue, setJustUnlockedClue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [riddleOpen, setRiddleOpen] = useState(false);
  // Clues this device has just won but whose Firestore write has not come back
  // round yet. Without it, solving two riddles quickly pays out the same clue
  // twice: the reward queue is computed from `unlockedClues`, and that only
  // updates when the snapshot lands. Local, and deliberately never cleaned up —
  // once the snapshot arrives the ids are simply duplicates in a Set.
  const [pendingUnlocks, setPendingUnlocks] = useState([]);
  // The selected Evidence tab. Null means IntelView chooses the newest category
  // that is live for this round; it is reset whenever the player leaves Evidence.
  const [evidenceStack, setEvidenceStack] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isHost, setIsHost] = useState(() => hostPortal ? false : readSession().isHost);
  const [tutorialStage, setTutorialStage] = useState(() => readTutorialStage(readSession().currentUser));
  const [tutorialGuestProfileSeen, setTutorialGuestProfileSeen] = useState(false);

  // True once the real game state is known — the first Firestore snapshot, or the
  // STATE_SETTLE_MS backstop, whichever comes first.
  const [stateSettled, setStateSettled] = useState(false);

  // The Round 0 briefing (components/StoryIntro.jsx).
  //   'pending' → the round isn't known yet, so it isn't decided
  //   'open'    → the briefing owns the screen
  //   'done'    → dismissed, or the game had already moved past Round 0
  //
  // Deliberately NOT persisted. The briefing plays on every login and every
  // reload for as long as the game is still in Round 0, which is what a room of
  // 69 people arriving at different times needs; once the host advances, it never
  // interrupts anyone again. A logout resets it to 'pending' so the next player on
  // a shared device gets it too.
  const [briefingState, setBriefingState] = useState('pending');

  // Re-opened from the Story screen. Separate from the state above so replaying it
  // in Round 5 can't be confused with the Round 0 takeover.
  const [briefingReplay, setBriefingReplay] = useState(false);

  // The standby gate (components/StandbyScreen.jsx).
  //   'pending'  → the start isn't known yet, so it isn't decided
  //   'held'     → the standby screen owns the device
  //   'released' → this player is in the game
  //
  // Deliberately NOT persisted, and deliberately three states rather than a
  // boolean. A player who logs in after the room has already been let in must
  // never see a starting gun fire — resolving 'pending' straight to 'released'
  // for them is what avoids a frame of it. A logout resets it so the next player
  // on a shared device is gated the same way this one was.
  const [startGate, setStartGate] = useState('pending');

  // Last force-refresh timestamp this device has already acted on. A ref, not
  // state: it must survive re-renders without causing one, and comparing
  // against it is what stops the very first snapshot from triggering a reload
  // loop on every page load.
  const lastForceRefreshRef = useRef(null);
  // Reset Game is also the start of a new player onboarding cycle. Kept apart
  // from forceRefreshAt so an ordinary recovery reload never restarts tutorials.
  const lastTutorialResetRef = useRef(null);

  const activeWalkIns = useMemo(
    () => walkIns.filter((walkIn) => walkIn.active),
    [walkIns]
  );

  const allGuests = useMemo(
    () => [...CHARACTERS, ...activeWalkIns.map(walkInGuest)],
    [activeWalkIns]
  );

  const myCharacter = useMemo(
    () => allGuests.find((guest) => guest.id === currentUser),
    [allGuests, currentUser]
  );

  const isWalkIn = myCharacter?.role === 'BYSTANDER';

  // What the Comms tile on the board is carrying. Lives here rather than in
  // GridMenu because the hub unmounts on every navigation, and an unread count
  // that resets whenever the player opens a screen is not an unread count.
  //
  // Being on the Comms screen is what marks it read, so the second argument is
  // the screen itself — no separate "mark read" call to keep in sync with the
  // routing.
  const unread = useUnreadMessages(currentUser, activeTab === 'chat');

  const currentRoundData = ROUNDS[currentRound] || ROUNDS[ROUNDS.length - 1];
  const voting = useVotingPhase(roundTimer, currentRound);
  const isVotingOpen = voting.phase === 'open';
  const effectiveTutorialStage = isHost ? TUTORIAL_STAGES.COMPLETE : tutorialStageForRound(tutorialStage, currentRound);
  const tutorialStep = isHost ? null : tutorialStepFor(effectiveTutorialStage, currentRound);
  const tutorialTabs = tutorialTabsFor(effectiveTutorialStage, currentRound);

  // The ballot tally for the round the room is actually in — { suspectId: count }.
  //
  // Derived from `votes` rather than read from the database, because a tally is a
  // per-round fact and the stored one wasn't: it was a single flat counter that
  // every round added to and none ever cleared, so a fresh game inheriting an old
  // database, or simply a game that had reached the later rounds, would announce
  // a total nobody in the room had cast. `votes` is keyed { userId: { round: … } },
  // so counting one round out of it is both correct and self-clearing when the
  // host advances.
  const voteCounts = useMemo(() => {
    const counts = {};
    const activeVoterIds = new Set(allGuests.map((guest) => guest.id));
    Object.entries(votes).forEach(([voterId, byRound]) => {
      if (!activeVoterIds.has(voterId)) return;
      const pick = byRound?.[currentRound];
      if (pick) counts[pick] = (counts[pick] || 0) + 1;
    });
    return counts;
  }, [votes, currentRound, allGuests]);

  // The final ballot is public. Keep the voter identity beside the candidate
  // rather than reconstructing it in the tally component, which only knows the
  // canonical roster and not late walk-ins.
  const voteDetails = useMemo(() => {
    const guestsById = new Map(allGuests.map((guest) => [guest.id, guest]));
    return Object.entries(votes).flatMap(([voterId, byRound]) => {
      const suspectId = byRound?.[currentRound];
      const voter = guestsById.get(voterId);
      return suspectId && voter
        ? [{ voterId, voterName: voter.name, suspectId }]
        : [];
    });
  }, [votes, currentRound, allGuests]);

  // Get the accusation card assigned to this player (for Round 1+)
  const myAccusation = useMemo(() => {
    if (!currentUser || currentRound < 1) return null;
    return isWalkIn ? getWalkInAccusation(currentUser) : getAssignedAccusation(currentUser);
  }, [currentUser, currentRound, isWalkIn]);

  // Check if player should see the confession (murderer in Round 6)
  const shouldShowConfession = useMemo(() => {
    return (
      isMurderer(currentUser) &&
      revealedToMurderer &&
      currentRound >= 6 &&
      CONFESSION_CLUE.forCharacters?.includes(currentUser)
    );
  }, [currentUser, revealedToMurderer, currentRound]);

  // --- FIREBASE SYNC ---
  
  // Initialize game state on first load
  useEffect(() => {
    initializeGameState();
    initializeVotes();
    initializePlayerData();
  }, []);

  // One live stream for the dynamic directory. The initial snapshot hydrates
  // silently; later changes are room events and get one local toast per device.
  const walkInSnapshotSeen = useRef(false);
  const walkInStateById = useRef(new Map());
  useEffect(() => {
    const unsubscribe = subscribeToWalkIns((incoming, changes) => {
      const previous = walkInStateById.current;
      const next = new Map(incoming.map((walkIn) => [walkIn.id, walkIn]));

      if (walkInSnapshotSeen.current) {
        const event = changes.reduce((latest, change) => {
          const before = previous.get(change.doc.id);
          const after = change.doc.data();
          if (change.type === 'added' && after.active) return { type: 'success', msg: `WALK-IN ADDED: ${after.name}` };
          if (change.type === 'modified' && before?.active && !after.active) return { type: 'info', msg: `WALK-IN DEPARTED: ${after.name}` };
          if (change.type === 'modified' && !before?.active && after.active) return { type: 'success', msg: `WALK-IN ADDED: ${after.name}` };
          return latest;
        }, null);
        if (event) {
          setFeedback(event);
          setTimeout(() => setFeedback(null), 3000);
        }
      }

      walkInSnapshotSeen.current = true;
      walkInStateById.current = next;
      setWalkIns(incoming);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToWalkInPasses(setWalkInPasses);
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time game state changes
  useEffect(() => {
    const unsubscribe = subscribeToGameState((gameState) => {
      setStateSettled(true);
      setCurrentRound(gameState.currentRound || 0);
      setUnlockedFiles(gameState.unlockedFiles || ['f_incident']);
      setRevealedToMurderer(gameState.revealedToMurderer || false);
      setRevealedClues(gameState.revealedClues || []);
      setGameEnded(gameState.gameEnded || false);
      setResetInProgress(gameState.resetInProgress || false);
      setRoundTimer(readTimer(gameState));
      setGameStartedAt(readStartedAt(gameState));

      // Every reset broadcasts a fresh timestamp. The first snapshot is only a
      // baseline; a newer one means this device should forget every locally
      // stored player's walkthrough before the reset's force-refresh reload.
      const tutorialResetAt = gameState.tutorialResetAt || 0;
      if (lastTutorialResetRef.current === null) {
        lastTutorialResetRef.current = tutorialResetAt;
      } else if (tutorialResetAt > lastTutorialResetRef.current) {
        lastTutorialResetRef.current = tutorialResetAt;
        clearTutorialProgress();
        clearSolvedRiddles();
        clearUnreadMessages();
        clearAskCue();
        setTutorialStage(TUTORIAL_STAGES.IDENTITY);
        setTutorialGuestProfileSeen(false);
      }

      // Host force-sync. The first snapshot only records the current value —
      // reloading on it would put every device in a boot loop. Only a value
      // strictly newer than the one we booted with is a genuine broadcast.
      const forceRefreshAt = gameState.forceRefreshAt || 0;
      if (lastForceRefreshRef.current === null) {
        lastForceRefreshRef.current = forceRefreshAt;
      } else if (forceRefreshAt > lastForceRefreshRef.current) {
        lastForceRefreshRef.current = forceRefreshAt;
        // Brief delay so the pending localStorage write lands before teardown.
        setTimeout(() => window.location.reload(), 150);
      }
    });

    return () => unsubscribe();
  }, []);

  // Backstop for the snapshot above. Set in a timer callback, never in the effect
  // body — the effect form is what `react-hooks/set-state-in-effect` rejects.
  useEffect(() => {
    const timer = setTimeout(() => setStateSettled(true), STATE_SETTLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hostPortal && new URLSearchParams(window.location.search).get('route') === HOST_ROUTE) {
      window.history.replaceState(null, '', `${import.meta.env.BASE_URL}host`);
    }
  }, [hostPortal]);

  // Mirror the session to localStorage so a reload restores it.
  useEffect(() => {
    try {
      if (currentUser) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify({ currentUser, isHost }));
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Storage unavailable — the app still works, it just won't survive reloads.
    }
  }, [currentUser, isHost]);

  // Opening a screen starts it at the top. The document scroll position survives a
  // tab change — it is the same document with a new subtree — so a player who had
  // scrolled the board down to reach a tile landed part-way into whatever they
  // opened. Most visible on the Story briefing, which is the tallest surface here.
  //
  // `evidenceStack` is in the deps because switching a long Evidence tab should
  // start at its top, just like opening another screen.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, evidenceStack]);

  // Subscribe to real-time vote changes
  useEffect(() => {
    const unsubscribe = subscribeToVotes((voteData) => {
      setVotes(voteData.votes || {});
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to player data changes (unlocked clues)
  useEffect(() => {
    const unsubscribe = subscribeToPlayerData((playerData) => {
      if (currentUser) {
        const userClues = playerData.unlockedClues?.[currentUser] || [];
        setUnlockedClues(userClues);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- ACTIONS ---

  const handleLogin = (id, isHostLogin = false, walkIn = null) => {
    if (walkIn) {
      setWalkIns((current) =>
        current.some((entry) => entry.id === walkIn.id)
          ? current
          : [...current, { ...walkIn, active: true }]
      );
    }
    setCurrentUser(id);
    setIsHost(isHostLogin);
    setTutorialStage(isHostLogin ? TUTORIAL_STAGES.COMPLETE : readTutorialStage(id));
    setTutorialGuestProfileSeen(false);
    if (isHostLogin) {
      setActiveTab('host'); // Go directly to host interface
    } else {
      setActiveTab(null); // Show grid menu after login
    }
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
        // Add to Firebase
        addUnlockedClue(currentUser, foundClue.id)
          .then(() => {
            setFeedback({ type: 'success', msg: `EVIDENCE ADDED: ${foundClue.title}` });
            setJustUnlockedClue(foundClue.id);
            setModalOpen(false);
            setActiveTab('intel');
            // Open the stack the clue belongs to, so the §7.2 unseal moment plays
            // where the player is looking instead of on a hub one tap away. The
            // confession belongs to no stack, and stays pinned on the hub.
            setEvidenceStack(stackKeyForClue(foundClue.id));
          })
          .catch((error) => {
            console.error('Error adding clue:', error);
            setFeedback({ type: 'error', msg: "Failed to add clue" });
          });
      }
    } else if (foundChar) {
       setFeedback({ type: 'success', msg: `MET: ${foundChar.name}.` });
    } else {
      setFeedback({ type: 'error', msg: "INVALID CODE" });
    }
    
    setInputCode("");
    setTimeout(() => setFeedback(null), 3000);
  };

  // The clue the next solved riddle pays out. Null once this player holds
  // everything the round can give, which is what the modal checks before it
  // deals a puzzle it cannot pay for. Host-revealed clues count as held: the
  // riddle lock must not spend a solve on something the room already has.
  const riddleReward = useMemo(
    () =>
      currentUser
        ? (isWalkIn ? nextWalkInRiddleReward : nextRiddleReward)(currentUser, currentRound, [
            ...unlockedClues,
            ...revealedClues,
            ...pendingUnlocks,
          ])
        : null,
    [currentUser, currentRound, unlockedClues, revealedClues, pendingUnlocks, isWalkIn]
  );

  // ASK stays off the screen until the lock has something to pay out — Round 02
  // as the decks stand (ASK_OPENS_AT, data/gameData.js).
  const askVisible = currentRound >= ASK_OPENS_AT;

  // Whether this device still owes the player the one-time cue that points at
  // ASK the round it turns up. Read from the ledger once, in a *pure*
  // initialiser, so StrictMode's double invoke gets the same answer both times;
  // the effect spends it, and the wrapper's `animationend` retires it.
  const [askCueOwed, setAskCueOwed] = useState(() => !askCueSpent());

  // It fires on first *sight* rather than at the round advance: most of the room
  // is on Chat or Guests when the host moves the case on, and a knock nobody is
  // looking at is a knock spent.
  const askCueLive = askCueOwed && askVisible && activeTab === 'intel';
  const askCueStarted = useRef(false);

  useEffect(() => {
    if (askCueLive) {
      // Spent on sight, not on completion. The ledger is written the moment the
      // cue starts, so a reload two seconds in does not replay it — and leaving
      // the screen mid-knock has to retire it too, or the in-session behaviour
      // and the reloaded behaviour disagree about what "once" means.
      spendAskCue();
      askCueStarted.current = true;
      return;
    }
    if (askCueStarted.current) setAskCueOwed(false);
  }, [askCueLive]);

  // A riddle cracked. The modal has already played the celebration — this is
  // only the bookkeeping, so it must not block or undo anything on screen.
  const handleRiddleSolved = (clue) => {
    setPendingUnlocks((ids) => [...ids, clue.id]);
    setJustUnlockedClue(clue.id);

    addUnlockedClue(currentUser, clue.id).catch((error) => {
      console.error('Error adding clue:', error);
      setFeedback({ type: 'error', msg: 'Saved locally — sync failed' });
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  // "Read it", from the solve screen: close the lock and land on the stack the
  // clue belongs to, so the §7.2 unseal moment plays where the player is looking.
  const handleReadReward = () => {
    setRiddleOpen(false);
    setActiveTab('intel');
    setEvidenceStack(stackKeyForClue(justUnlockedClue));
  };

  const submitVote = async (suspectId) => {
    try {
      await submitVoteToFirebase(currentUser, suspectId, currentRound);
      setFeedback({ type: 'success', msg: "VOTE RECORDED" });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', msg: "Failed to submit vote" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };



  // --- RENDER ---

  // Host identity is derived, not just stored: `isHost` is set at login, but
  // `currentUser === 'host'` is the durable signal, so a stale or lost flag can
  // never drop the admin into a player-facing terminal screen. Computed up here
  // because the briefing decision below needs it before any early return.
  const isHostUser = isHost || currentUser === 'host';

  // Decide the briefing in the same render the round becomes known, rather than in
  // an effect: an effect would paint the board for a frame first (spending the grid
  // hub's once-per-session landing animation on a screen nobody sees), and setting
  // state in one is what `react-hooks/set-state-in-effect` rejects. Adjusting state
  // during render is React's documented pattern for exactly this.
  if (briefingState === 'pending' && currentUser && !isHostUser && stateSettled) {
    setBriefingState(currentRound === 0 ? 'open' : 'done');
  }

  // The standby gate, decided the same way and for the same reasons. A device
  // that joins once the room is already open resolves straight to 'released', so
  // the countdown never plays to somebody it isn't counting for.
  //
  // The second branch is the host pulling the room back to the waiting screen
  // mid-event — the undo for a mis-tapped Start. It has to re-arm a gate that is
  // already open, which is why this is not simply a one-way latch.
  if (currentUser && !isHostUser && stateSettled) {
    if (startGate === 'pending') {
      setStartGate(startPhase(gameStartedAt) === 'live' ? 'released' : 'held');
    } else if (startGate === 'released' && gameStartedAt === NOT_STARTED) {
      setStartGate('held');
    }
  }

  // Leaving the Evidence screen closes whichever stack was open, so reopening it
  // lands on the hub rather than wherever the player happened to be three screens
  // ago. Adjusted during render for the same reason as the briefing above — an
  // effect here is what `react-hooks/set-state-in-effect` rejects.
  const [seenTab, setSeenTab] = useState(activeTab);
  if (activeTab !== seenTab) {
    setSeenTab(activeTab);
    if (activeTab !== 'intel' && evidenceStack !== null) setEvidenceStack(null);
  }

  // Show splash screen on first load
  if (!splashComplete) {
    return <SplashScreen onComplete={() => setSplashComplete(true)} />;
  }

  // Login gate comes FIRST. The terminal screens below never return, so if they
  // are checked ahead of this the host can't reach CharacterSelect to enter the
  // host code once the game is in its end state — the device is stuck.
  if (!currentUser || (!isHostUser && !myCharacter)) {
    return <CharacterSelect onSelectCharacter={handleLogin} hostOnly={hostPortal} />;
  }

  // Every screen from here down is chosen from game state, so a player must not
  // reach any of them until that state is known — otherwise a reload mid-game
  // shows the wrong one (the Round 0 briefing, or the board a beat before the
  // murderer reveal replaces it) for as long as the snapshot takes to arrive.
  // The host is exempt: the console is safe from the first frame and the run sheet
  // is the thing they are most likely to be reloading to get back to.
  if (!isHostUser && (!stateSettled || resetInProgress)) {
    return <CaseHold resetting={resetInProgress} />;
  }

  // Public killer reveal — the first thing EVERY player sees the moment the host
  // reveals, killers included. It must come before the gameEnded check: the host's
  // reveal writes `revealedToMurderer` and `gameEnded` in one go, so whichever of
  // these two branches is first is the screen the room actually gets.
  //
  // The killers used to be excluded here and dropped straight onto the outro,
  // which meant the five people the room is being told about were the only ones
  // who never saw it named. Now they see it too and step past it to their own
  // curtain; everyone else ends on this screen, which is why only the killers are
  // given a way forward.
  if (revealedToMurderer && !isHostUser && !(isMurderer(currentUser) && revealStepped)) {
    return (
      <MurdererRevealOverlay
        killers={getKillers()}
        onContinue={isMurderer(currentUser) ? () => setRevealStepped(true) : null}
      />
    );
  }

  // Show outro splash when game ends (but not for host). In practice this is the
  // killers' terminal screen — everyone else is held on the reveal above.
  if (gameEnded && !isHostUser) {
    return <OutroSplash playerName={myCharacter?.name || 'Player'} />;
  }

  // Standby — the host hasn't started the room yet, so there is nothing to let a
  // player into. Below the terminal screens for the same reason the briefing is:
  // a finished game must not be able to send anybody back to a waiting screen.
  // Above the briefing, because the run of show is arrive → wait → start → story,
  // and the whole point of the gate is that the room gets the briefing together.
  //
  // Keyed on the start instant: going from "not started" to "started" is a scene
  // change, and the key is what makes the screen re-read the clock at that moment
  // rather than measuring the countdown against whenever this player logged in.
  if (!isHostUser && startGate === 'held') {
    return (
      <StandbyScreen
        key={gameStartedAt}
        startedAt={gameStartedAt}
        onRelease={() => setStartGate('released')}
      />
    );
  }

  // The briefing. Below the terminal screens, so no game state can route a device
  // around them, and above the board, because at Round 0 the story is the first
  // thing a player should be given — before they have any idea what the tiles are
  // for. Both exits land back here with the state flipped, never dead-ended.
  if (briefingReplay) {
    return (
      <StoryIntro
        onExit={() => setBriefingReplay(false)}
        exitLabel="Close"
        finalLabel="Close"
      />
    );
  }

  if (briefingState === 'open') {
    return (
      <StoryIntro
        onExit={() => setBriefingState('done')}
        exitLabel="Skip"
        finalLabel="Begin"
      />
    );
  }

  // The ballot and its result are takeovers, not a tile a player has to notice
  // in time. Both phases are derived from the shared round-clock end instant,
  // so a reload or a late wake-up arrives at the same screen as the room.
  if (!isHostUser && voting.phase === 'open') {
    return (
      <div className="min-h-screen bg-ink text-bone relative er-grain overflow-x-clip">
        <div className="er-lamp" aria-hidden="true" />
        <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-14">
          <p className="er-mono er-mono--hot er-mono--wide">Round {String(currentRound).padStart(2, '0')} ballot</p>
          <h1 className="er-title mt-2">Cast Your Vote</h1>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4 mb-6">
            The round is complete. Choose the person you think is responsible before the ballot closes.
          </p>
          <VotingView
            currentUser={currentUser}
            isVotingOpen={true}
            currentRound={currentRound}
            votes={votes[currentUser] || {}}
            votingMsLeft={voting.msLeft}
            onVote={submitVote}
          />
        </main>
        <FeedbackToast feedback={feedback} />
      </div>
    );
  }

  if (!isHostUser && voting.phase === 'results') {
    return (
      <VoteResultsModal
        isOpen
        onClose={() => {}}
        voteCounts={voteCounts}
        voterDetails={voteDetails}
        currentRound={currentRound}
        locked
      />
    );
  }

  // Show Grid Menu when no tab is active
  if (!activeTab) {
    const handleNavigate = (tabId) => {
      if (tabId === 'logout') {
        setCurrentUser(null);
        setIsHost(false); // otherwise the persisted host flag outlives the logout
        setTutorialStage(TUTORIAL_STAGES.IDENTITY);
        setTutorialGuestProfileSeen(false);
        // Undecide the briefing: the next player to log in on this device is a
        // different person, and if the game is still in Round 0 they need it.
        setBriefingState('pending');
        // Same for the standby gate — a device handed to somebody new before the
        // host has started must hold them, not inherit this player's release.
        setStartGate('pending');
      } else {
        setActiveTab(tabId);
      }
    };

    return (
      <div className="min-h-screen bg-ink">
        <GridMenu
          onNavigate={handleNavigate}
          currentRound={currentRound}
          roundTimer={roundTimer}
          isVotingOpen={isVotingOpen}
          unreadCount={unread.count}
          unreadKey={unread.newestId}
          allowedTabs={tutorialTabs}
          tutorialStep={tutorialStep}
          onStartTutorialStep={setActiveTab}
        />

        {/* Decoder Modal */}
        <DecoderModal
          isOpen={modalOpen}
          inputCode={inputCode}
          onInputChange={(e) => setInputCode(e.target.value)}
          onSubmit={handleCodeSubmit}
          onClose={() => setModalOpen(false)}
        />

        {/* Feedback Toast */}
        <FeedbackToast feedback={feedback} />
      </div>
    );
  }

  const screen = SCREEN_GUIDE[activeTab] || { kicker: 'File', title: activeTab };

  const isSelfFramed = SELF_FRAMED_VIEWS.has(activeTab);

  const closeScreen = () => {
    const completedTarget = tutorialStep?.target === activeTab;
    const needsGuestProfile = tutorialStep?.target === 'dossier';
    if (completedTarget && (!needsGuestProfile || tutorialGuestProfileSeen)) {
      const nextStage = Math.min(effectiveTutorialStage + 1, TUTORIAL_STAGES.COMPLETE);
      setTutorialStage(nextStage);
      saveTutorialStage(currentUser, nextStage);
      setTutorialGuestProfileSeen(false);
    }
    setActiveTab(null);
  };

  // Ink is the world; only diegetic documents get a bone surface (§5).
  //
  // `overflow-x-clip` on the root: the atmospheric lamp is a 640px radial wash
  // anchored at left:-220px, so on a 390px phone it pushed the document 30px
  // wider than the viewport and every screen could be dragged sideways into
  // dead space. GridMenu and CharacterSelect already clipped it; this root never
  // did. `clip` rather than `hidden` because `hidden` would make this a scroll
  // container and take the sticky chrome rail with it.
  return (
    <div className="min-h-screen bg-ink text-bone relative view-container er-grain overflow-x-clip">
      <div className="er-lamp" aria-hidden="true" />

      {/* Chrome rail */}
      <Header
        currentRound={currentRound}
        currentRoundData={currentRoundData}
        roundTimer={roundTimer}
        isVotingOpen={isVotingOpen}
        onClose={closeScreen}
      />

      {/* Main Content */}
      <main className={`relative z-10 px-4 pt-6 pb-28 mx-auto ${activeTab === 'host' ? 'max-w-4xl' : 'max-w-2xl'}`}>
        {/* Feedback Toast */}
        <FeedbackToast feedback={feedback} />

        {/* Kicker + screen title, then the screen note (§6.10) — which explains
            what the screen is for and clears itself at Round 02. Self-framed
            views draw both themselves. */}
        {!isSelfFramed && (
          <div className="mb-6 er-enter">
            <p className="er-mono er-mono--hot er-mono--wide">{screen.kicker}</p>
            <h1 className="er-title mt-2">{screen.title}</h1>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'host' && (
          <HostPanel
            isOpen={true}
            currentRound={currentRound}
            votingPhase={voting.phase}
            revealedToMurderer={revealedToMurderer}
            resetInProgress={resetInProgress}
            unlockedFiles={unlockedFiles}
            revealedClues={revealedClues}
            roundTimer={roundTimer}
            gameStartedAt={gameStartedAt}
            setGameStartedAt={setGameStartedAt}
            setRoundTimer={setRoundTimer}
            setCurrentRound={setCurrentRound}
            setRevealedToMurderer={setRevealedToMurderer}
            setUnlockedFiles={setUnlockedFiles}
            setRevealedClues={setRevealedClues}
            setGameEnded={setGameEnded}
            walkIns={walkIns}
            walkInPasses={walkInPasses}
            onFeedback={setFeedback}
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            myCharacter={myCharacter}
            currentRound={currentRound}
            tutorialActive={tutorialStep?.target === 'dashboard'}
          />
        )}

        {activeTab === 'story' && (
          <StoryView onReplay={() => setBriefingReplay(true)} />
        )}

        {activeTab === 'intel' && (
          <IntelView
            unlockedClues={unlockedClues}
            myAccusation={myAccusation}
            confession={shouldShowConfession ? CONFESSION_CLUE : null}
            currentRound={currentRound}
            revealedClues={revealedClues}
            justUnlockedClue={justUnlockedClue}
            unlockedFiles={unlockedFiles}
            stack={evidenceStack}
            onOpenStack={setEvidenceStack}
            tutorialActive={tutorialStep?.target === 'intel'}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView myCharacter={myCharacter} tutorialActive={tutorialStep?.target === 'chat'} />
        )}

        {activeTab === 'timeline' && (
          <TimelineView myCharacter={myCharacter} />
        )}

        {activeTab === 'dossier' && (
          <DossierView
            currentUser={currentUser}
            guests={allGuests}
            onSelectGuest={setSelectedGuest}
            onTutorialProfileOpened={() => setTutorialGuestProfileSeen(true)}
            tutorialActive={tutorialStep?.target === 'dossier'}
          />
        )}

        {activeTab === 'votes' && (
          <VotingView
            currentUser={currentUser}
            isVotingOpen={isVotingOpen}
            currentRound={currentRound}
            votes={votes[currentUser] || {}}
            votingMsLeft={voting.msLeft}
            onVote={submitVote}
            tutorialActive={tutorialStep?.target === 'votes'}
          />
        )}

        {activeTab === 'help' && (
          <HelpView />
        )}

        {/* Footer rail — closes the frame (§4.2). */}
        {!isSelfFramed && (
          <div className="mt-10">
            <div className="er-rule" />
            <div className="flex items-center justify-between pt-3">
              <span className="er-mono">Case 8821-B</span>
              <span className="er-mono er-mono--dim">
                {myCharacter?.name ? `Agent · ${myCharacter.name}` : 'Astral Project'}
              </span>
            </div>
          </div>
        )}

        {/* The two ways evidence reaches a phone, side by side — square, because
            both are chrome, not paper. They land in a beat after the screen so
            they read as arriving *for* this screen rather than as part of the
            frame, and ASK lands second because CODE is the one a player with a
            code in their ear is already reaching for.
            ASK is the riddle lock, which replaced the printed clue cards: solve
            a riddle, win a clue, and get a code to hand to everybody else. CODE
            is where those handed-around codes get typed in.
            ASK only exists from Round 02 (`askVisible`) — before that the lock
            has no reward it could unseal, so the corner is CODE alone. */}
        {activeTab === 'intel' && (
          <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2.5">
            {/* ASK and CODE are the whole economy of the evening and the two
                labels under them are four letters each, so this is the one
                tooltip that stands alone as a control of its own rather than
                trailing a label (§6.13). It lands last, after both buttons.
                The copy follows the corner: while ASK is absent it explains
                CODE only, rather than describing a button that isn't there. */}
            <InfoTip
              tip={askVisible ? TOOLTIPS.evidenceTools : TOOLTIPS.evidenceCode}
              variant="chip"
              className="er-land"
              style={{ animationDelay: '380ms' }}
            />

            <div className="flex items-end gap-3">
              {askVisible && (
                /* The wrapper carries the one-time cue (App.css §17) because the
                   button is already spending its own `animation` on the landing.
                   `animationend` bubbles, so the guard is what stops that landing
                   from retiring the cue before it has knocked once. */
                <span
                  className={`inline-flex ${askCueLive ? 'er-summon' : ''}`}
                  onAnimationEnd={(event) => {
                    if (event.target === event.currentTarget) setAskCueOwed(false);
                  }}
                >
                  <button
                    onClick={() => setRiddleOpen(true)}
                    aria-label="Solve a riddle to unseal a clue"
                    className="er-touch er-land flex flex-col items-center justify-center gap-1 w-16 h-16 bg-ink-raised border border-line text-bone shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                    style={{ animationDelay: '320ms' }}
                  >
                    <Riddle size={22} strokeWidth={1.75} />
                    <span className="er-mono text-[9px]">Ask</span>
                  </button>
                </span>
              )}

              <span className={`inline-flex ${currentRound === 1 && (evidenceStack === null || evidenceStack === 'accusations') ? 'er-summon' : ''}`}>
                <button
                  onClick={() => setModalOpen(true)}
                  aria-label="Enter a clue code"
                  className="er-touch er-land flex flex-col items-center justify-center gap-1 w-16 h-16 bg-ink-raised border border-signal text-signal-lift shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                  style={{ animationDelay: '260ms' }}
                >
                  <Calculator size={22} strokeWidth={1.75} />
                  <span className="er-mono er-mono--hot text-[9px]">Code</span>
                </button>
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Guest Profile Modal */}
      <GuestProfileModal
        guest={selectedGuest}
        currentUser={currentUser}
        isVotingOpen={isVotingOpen}
        onClose={() => setSelectedGuest(null)}
        onVote={submitVote}
      />

      {/* Decoder Modal */}
      <DecoderModal
        isOpen={modalOpen}
        inputCode={inputCode}
        onInputChange={(e) => setInputCode(e.target.value)}
        onSubmit={handleCodeSubmit}
        onClose={() => setModalOpen(false)}
      />

      {/* Riddle lock — the replacement for the printed clue cards. */}
      <RiddleModal
        isOpen={riddleOpen}
        reward={riddleReward}
        currentRound={currentRound}
        onSolved={handleRiddleSolved}
        onRead={handleReadReward}
        onClose={() => setRiddleOpen(false)}
      />
    </div>
  );
}