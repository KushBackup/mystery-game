import React, { useState, useMemo, useEffect } from 'react';
import { Calculator } from './components/icons/IconComponents';
import { FeedbackToast } from './components/ui/FeedbackToast';
import { Header } from './components/layout/Header';
import GridMenu from './components/GridMenu';
import { DashboardView } from './components/views/DashboardView';
import { IntelView } from './components/views/IntelView';
import { FilesView } from './components/views/FilesView';
import { DossierView } from './components/views/DossierView';
import { ChatView } from './components/views/ChatView';
import { VotingView } from './components/views/VotingView';
import { TimelineView } from './components/views/TimelineView';
import { HelpView } from './components/views/HelpView';
import { GuestProfileModal } from './components/modals/GuestProfileModal';
import { DecoderModal } from './components/modals/DecoderModal';
import { VoteResultsModal } from './components/modals/VoteResultsModal';
import { CharacterSelect } from './components/CharacterSelect';
import { HostPanel } from './components/HostPanel';
import { SplashScreen } from './components/SplashScreen';
import { OutroSplash } from './components/OutroSplash';
import { MurdererRevealOverlay } from './components/MurdererRevealOverlay';
import { ROUNDS, CHARACTERS, CLUE_DB, getAssignedAccusation, CONFESSION_CLUE, isMurderer } from './data/gameData';
import { initializeGameState, subscribeToGameState, initializeVotes, subscribeToVotes, submitVote as submitVoteToFirebase, initializePlayerData, subscribeToPlayerData, addUnlockedClue } from './firebase/config';

export default function App() {
  // Global State
  const [splashComplete, setSplashComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // null = show grid menu
  
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [hostPanelOpen, setHostPanelOpen] = useState(false);
  const [showVoteResults, setShowVoteResults] = useState(false);
  const [isHost, setIsHost] = useState(false);

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
    return isMurderer(currentUser) && revealedToMurderer && currentRound >= 6;
  }, [currentUser, revealedToMurderer, currentRound]);

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
      setCurrentRound(gameState.currentRound || 0);
      setIsVotingOpen(gameState.isVotingOpen || false);
      setUnlockedFiles(gameState.unlockedFiles || ['f_incident']);
      setVoteResultsVisible(gameState.voteResultsVisible || false);
      setRevealedToMurderer(gameState.revealedToMurderer || false);
      setRevealedClues(gameState.revealedClues || []);
      setGameEnded(gameState.gameEnded || false);
    });

    return () => unsubscribe();
  }, []);

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
            setModalOpen(false);
            setActiveTab('intel');
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
    } catch (error) {
      setFeedback({ type: 'error', msg: "Failed to submit vote" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };



  // --- RENDER ---

  // Show splash screen on first load
  if (!splashComplete) {
    return <SplashScreen onComplete={() => setSplashComplete(true)} />;
  }

  // Public murderer reveal — terminal screen for all non-host players except
  // the murderer themselves (Alam falls through to the OutroSplash branch).
  // Must come before the gameEnded check so it wins over OutroSplash for everyone else.
  if (revealedToMurderer && currentUser && !isHost && !isMurderer(currentUser)) {
    const murdererCharacter = CHARACTERS.find(c => c.role === 'MURDERER');
    return <MurdererRevealOverlay murderer={murdererCharacter} />;
  }

  // Show outro splash when game ends (but not for host)
  if (gameEnded && currentUser && !isHost) {
    return <OutroSplash playerName={myCharacter?.name || 'Player'} />;
  }

  if (!currentUser) {
    return <CharacterSelect onSelectCharacter={handleLogin} />;
  }

  // Show Grid Menu when no tab is active
  if (!activeTab) {
    const handleNavigate = (tabId) => {
      if (tabId === 'logout') {
        setCurrentUser(null);
      } else {
        setActiveTab(tabId);
      }
    };

    return (
      <div className="min-h-screen bg-mystery-dark">
        <GridMenu onNavigate={handleNavigate} voteCounts={voteCounts} />

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

  // Full Screen View with Close Button
  return (
    <div className="min-h-screen bg-mystery-paper text-mystery-ink relative overflow-hidden view-container">
       {/* Background Texture */}
       <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')"
        }}
      />
      
      {/* Decorative top bar (Tape) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-mystery-blood/50 z-50"></div>
      
      {/* Close Button - Red Stamp Style */}
      <button
        onClick={() => setActiveTab(null)}
        className="fixed top-3 right-3 z-50 w-12 h-12 bg-mystery-blood text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all active:scale-95 shadow-lg border-2 border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <Header 
        currentRound={currentRound}
        currentRoundData={currentRoundData}
      />

      {/* Main Content */}
      <main className="relative z-10 p-3 sm:p-4 max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-24">
        {/* Feedback Toast */}
        <FeedbackToast feedback={feedback} />

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
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView myCharacter={myCharacter} currentRound={currentRound} />
        )}

        {activeTab === 'intel' && (
          <IntelView 
            unlockedClues={unlockedClues} 
            myAccusation={myAccusation}
            confession={shouldShowConfession ? CONFESSION_CLUE : null}
            currentRound={currentRound}
            revealedClues={revealedClues}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView myCharacter={myCharacter} voteCounts={voteCounts} currentRound={currentRound} />
        )}

        {activeTab === 'timeline' && (
          <TimelineView myCharacter={myCharacter} />
        )}

        {activeTab === 'files' && (
          <FilesView unlockedFiles={unlockedFiles} currentRound={currentRound} />
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

        {/* Decoder FAB - Only show on Intel/Clues screen */}
        {activeTab === 'intel' && (
          <button
            onClick={() => setModalOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-mystery-ink text-mystery-paper border-2 border-mystery-paper rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all z-40 active:scale-95"
          >
            <Calculator size={32} className="opacity-80" />
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
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

      {/* View Transition Animation */}
      <style>{`
        .view-container {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
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
      `}</style>
    </div>
  );
}