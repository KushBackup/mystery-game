import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calculator } from './components/icons/IconComponents';
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
import { VoteResultsModal } from './components/modals/VoteResultsModal';
import { ScreenBrief } from './components/ui/ScreenBrief';
import { CharacterSelect } from './components/CharacterSelect';
import { HostPanel } from './components/HostPanel';
import { SplashScreen } from './components/SplashScreen';
import { StoryIntro } from './components/StoryIntro';
import { OutroSplash } from './components/OutroSplash';
import { MurdererRevealOverlay } from './components/MurdererRevealOverlay';
import { ROUNDS, CHARACTERS, CLUE_DB, stackKeyForClue, getAssignedAccusation, CONFESSION_CLUE, getKillers, isMurderer } from './data/gameData';
import { SCREEN_GUIDE, EVIDENCE_STACKS } from './data/screenGuide';
import { initializeGameState, subscribeToGameState, initializeVotes, subscribeToVotes, submitVote as submitVoteToFirebase, initializePlayerData, subscribeToPlayerData, addUnlockedClue } from './firebase/config';

// Session is persisted so a reload — whether the host's force-sync broadcast, a
// service-worker update, or a player accidentally swiping the tab away — drops
// them back where they were instead of at the login screen. Mid-event, making
// 51 people re-enter their printed codes is not a recoverable situation.
const SESSION_KEY = 'astral.session';

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

// A single beat while that first snapshot lands. Same masthead as the splash, so
// a reload reads as the app still booting rather than as a blank screen.
const CaseHold = () => (
  <div className="min-h-screen bg-ink relative er-grain flex items-center justify-center px-6">
    <div className="er-vignette" aria-hidden="true" />
    <div className="relative z-10 text-center er-enter">
      <p className="er-mono er-mono--hot er-mono--wide">Case 8821-B</p>
      <div className="er-rule my-4" />
      <p className="er-mono er-mono--dim">Syncing case file</p>
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

export default function App() {
  // Global State
  const [splashComplete, setSplashComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => readSession().currentUser);
  // null = show grid menu. A restored host session lands straight on the host
  // interface, mirroring what handleLogin does at login time.
  const [activeTab, setActiveTab] = useState(() => (readSession().isHost ? 'host' : null));
  
  // Game State (Synced with Firebase)
  const [currentRound, setCurrentRound] = useState(0);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [votes, setVotes] = useState({}); // { userId: { round: suspectId } }
  const [voteCounts, setVoteCounts] = useState({}); // { suspectId: count }
  const [unlockedFiles, setUnlockedFiles] = useState(['f_incident']); // Files unlocked by host
  const [voteResultsVisible, setVoteResultsVisible] = useState(false); // Host controls this
  const [revealedToMurderer, setRevealedToMurderer] = useState(false); // Round 6 reveal
  const [revealedClues, setRevealedClues] = useState([]); // Host-revealed clues
  const [gameEnded, setGameEnded] = useState(false); // Game ended flag
  
  // Local UI State
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  // The clue this device decoded most recently. IntelView uses it to unseal that
  // one card with a redaction wipe (§6.7) instead of having it simply appear —
  // the player almost always arrives on the board *after* the clue is already in
  // the list, so without knowing which one is new there is no moment to play.
  const [justUnlockedClue, setJustUnlockedClue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Which stack the Evidence screen has open — null is its hub. It lives here
  // rather than inside IntelView because on a stack the screen *title* is the
  // stack's name, and this component owns the screen frame for every view (§4.2).
  const [evidenceStack, setEvidenceStack] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isHost, setIsHost] = useState(() => readSession().isHost);

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
  // 51 people arriving at different times needs; once the host advances, it never
  // interrupts anyone again. A logout resets it to 'pending' so the next player on
  // a shared device gets it too.
  const [briefingState, setBriefingState] = useState('pending');

  // Re-opened from the Story screen. Separate from the state above so replaying it
  // in Round 5 can't be confused with the Round 0 takeover.
  const [briefingReplay, setBriefingReplay] = useState(false);

  // Last force-refresh timestamp this device has already acted on. A ref, not
  // state: it must survive re-renders without causing one, and comparing
  // against it is what stops the very first snapshot from triggering a reload
  // loop on every page load.
  const lastForceRefreshRef = useRef(null);

  const myCharacter = useMemo(() => 
    CHARACTERS.find(c => c.id === currentUser), 
  [currentUser]);

  const currentRoundData = ROUNDS[currentRound] || ROUNDS[ROUNDS.length - 1];

  // Get the accusation card assigned to this player (for Round 1+)
  const myAccusation = useMemo(() => {
    if (!currentUser || currentRound < 1) return null;
    return getAssignedAccusation(currentUser);
  }, [currentUser, currentRound]);

  // Check if player should see the confession (murderer in Round 6)
  const shouldShowConfession = useMemo(() => {
    return (
      isMurderer(currentUser) &&
      revealedToMurderer &&
      currentRound >= 6 &&
      CONFESSION_CLUE.forCharacters?.includes(currentUser)
    );
  }, [currentUser, revealedToMurderer, currentRound]);
  // 51 people arriving at different times needs; once the host advances, it never

  // --- FIREBASE SYNC ---
  
  // Initialize game state on first load
  useEffect(() => {
    initializeGameState();
    initializeVotes();
    initializePlayerData();
  }, []);

  // Subscribe to real-time game state changes
  useEffect(() => {
    const unsubscribe = subscribeToGameState((gameState) => {
      setStateSettled(true);
      setCurrentRound(gameState.currentRound || 0);
      setIsVotingOpen(gameState.isVotingOpen || false);
      setUnlockedFiles(gameState.unlockedFiles || ['f_incident']);
      setVoteResultsVisible(gameState.voteResultsVisible || false);
      setRevealedToMurderer(gameState.revealedToMurderer || false);
      setRevealedClues(gameState.revealedClues || []);
      setGameEnded(gameState.gameEnded || false);

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
  // `evidenceStack` is in the deps for the same reason: drilling into a stack, or
  // backing out of a long one, is a screen change even though the tab has not moved.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, evidenceStack]);

  // Subscribe to real-time vote changes
  useEffect(() => {
    const unsubscribe = subscribeToVotes((voteData) => {
      setVotes(voteData.votes || {});
      setVoteCounts(voteData.voteCounts || {});
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

  const handleLogin = (id, isHostLogin = false) => {
    setCurrentUser(id);
    setIsHost(isHostLogin);
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
  if (!currentUser) {
    return <CharacterSelect onSelectCharacter={handleLogin} />;
  }

  // Every screen from here down is chosen from game state, so a player must not
  // reach any of them until that state is known — otherwise a reload mid-game
  // shows the wrong one (the Round 0 briefing, or the board a beat before the
  // murderer reveal replaces it) for as long as the snapshot takes to arrive.
  // The host is exempt: the console is safe from the first frame and the run sheet
  // is the thing they are most likely to be reloading to get back to.
  if (!isHostUser && !stateSettled) {
    return <CaseHold />;
  }

  // Public killer reveal — terminal screen for all non-host players except
  // the killers themselves (they fall through to the confession/outro path).
  // Must come before the gameEnded check so it wins over OutroSplash for everyone else.
  if (revealedToMurderer && !isHostUser && !isMurderer(currentUser)) {
    return <MurdererRevealOverlay killers={getKillers()} />;
  }

  // Show outro splash when game ends (but not for host)
  if (gameEnded && !isHostUser) {
    return <OutroSplash playerName={myCharacter?.name || 'Player'} />;
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

  // Show Grid Menu when no tab is active
  if (!activeTab) {
    const handleNavigate = (tabId) => {
      if (tabId === 'logout') {
        setCurrentUser(null);
        setIsHost(false); // otherwise the persisted host flag outlives the logout
        // Undecide the briefing: the next player to log in on this device is a
        // different person, and if the game is still in Round 0 they need it.
        setBriefingState('pending');
      } else {
        setActiveTab(tabId);
      }
    };

    return (
      <div className="min-h-screen bg-ink">
        <GridMenu
          onNavigate={handleNavigate}
          currentRound={currentRound}
          isVotingOpen={isVotingOpen}
          note={SCREEN_GUIDE.hub}
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

  // An open Evidence stack frames itself like any other screen — its own kicker and
  // title from EVIDENCE_STACKS. It carries no `brief`, because the screen note
  // describes the hub, and ScreenBrief renders nothing without one.
  const screen =
    (activeTab === 'intel' && EVIDENCE_STACKS[evidenceStack]) ||
    SCREEN_GUIDE[activeTab] || { kicker: 'File', title: activeTab };

  const isSelfFramed = SELF_FRAMED_VIEWS.has(activeTab);

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
        isVotingOpen={isVotingOpen}
        onClose={() => setActiveTab(null)}
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
            <ScreenBrief note={screen} currentRound={currentRound} className="mt-5" />
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'host' && (
          <HostPanel
            isOpen={true}
            currentRound={currentRound}
            isVotingOpen={isVotingOpen}
            voteResultsVisible={voteResultsVisible}
            revealedToMurderer={revealedToMurderer}
            unlockedFiles={unlockedFiles}
            revealedClues={revealedClues}
            setCurrentRound={setCurrentRound}
            setIsVotingOpen={setIsVotingOpen}
            setVoteResultsVisible={setVoteResultsVisible}
            setRevealedToMurderer={setRevealedToMurderer}
            setUnlockedFiles={setUnlockedFiles}
            setRevealedClues={setRevealedClues}
            setGameEnded={setGameEnded}
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView myCharacter={myCharacter} currentRound={currentRound} />
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
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            myCharacter={myCharacter}
            voteCounts={voteCounts}
            currentRound={currentRound}
            note={screen}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView myCharacter={myCharacter} />
        )}

        {activeTab === 'dossier' && (
          <DossierView
            currentUser={currentUser}
            onSelectGuest={setSelectedGuest}
          />
        )}

        {activeTab === 'votes' && (
          <VotingView
            currentUser={currentUser}
            isVotingOpen={isVotingOpen}
            currentRound={currentRound}
            votes={votes[currentUser] || {}}
            voteCounts={voteCounts}
            onVote={submitVote}
            voteResultsVisible={voteResultsVisible}
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

        {/* Decoder — square, because the decoder is chrome, not paper. It lands
            in a beat after the screen so it reads as arriving *for* this screen
            rather than as part of the frame. */}
        {activeTab === 'intel' && (
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Enter a clue code"
            className="er-touch er-land fixed bottom-6 right-4 z-40 flex flex-col items-center justify-center gap-1 w-16 h-16 bg-ink-raised border border-signal text-signal-lift shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
            style={{ animationDelay: '260ms' }}
          >
            <Calculator size={22} strokeWidth={1.75} />
            <span className="er-mono er-mono--hot text-[9px]">Code</span>
          </button>
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
    </div>
  );
}