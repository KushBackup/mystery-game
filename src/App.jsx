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
import { GuestProfileModal } from './components/modals/GuestProfileModal';
import { DecoderModal } from './components/modals/DecoderModal';
import { VoteResultsModal } from './components/modals/VoteResultsModal';
import { CharacterSelect } from './components/CharacterSelect';
import { HostPanel } from './components/HostPanel';
import { ROUNDS, CHARACTERS, CLUE_DB, getAssignedAccusation, CONFESSION_CLUE } from './data/gameData';
import { initializeGameState, subscribeToGameState, initializeVotes, subscribeToVotes, submitVote as submitVoteToFirebase, initializePlayerData, subscribeToPlayerData, addUnlockedClue } from './firebase/config';

export default function App() {
  // Global State
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
  
  // Local UI State
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [hostPanelOpen, setHostPanelOpen] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [showVoteResults, setShowVoteResults] = useState(false);

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
    return currentUser === 'char_esha' && revealedToMurderer && currentRound >= 6;
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

  const handleLogin = (id) => {
    setCurrentUser(id);
    setActiveTab(null); // Show grid menu after login
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

  // --- HOST CONTROLS (Hidden) ---
  const toggleHostPanel = () => {
     setSecretTapCount(prev => {
         const newCount = prev + 1;
         if (newCount >= 3) {
             setHostPanelOpen(true);
             return 0;
         }
         return newCount;
     });
  };

  // --- RENDER ---

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
      <div className="min-h-screen bg-[#f4f1ea]">
        <GridMenu onNavigate={handleNavigate} voteCounts={voteCounts} />
        
        {/* Host Panel Access */}
        <div 
          className="fixed top-4 left-4 text-stone-900 opacity-10 hover:opacity-100 cursor-pointer z-50" 
          onClick={toggleHostPanel}
        >
          👻
        </div>

        {/* Host Controls Panel */}
        <HostPanel
          isOpen={hostPanelOpen}
          currentRound={currentRound}
          isVotingOpen={isVotingOpen}
          voteResultsVisible={voteResultsVisible}
          revealedToMurderer={revealedToMurderer}
          unlockedFiles={unlockedFiles}
          revealedClues={revealedClues}
          onClose={() => setHostPanelOpen(false)}
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

  // Full Screen View with Close Button
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten relative overflow-hidden bg-texture view-container">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-2 bg-red-700 z-50"></div>
      
      {/* Close Button */}
      <button
        onClick={() => setActiveTab(null)}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-red-600 border-3 border-stone-900 text-white rounded-full shadow-[3px_3px_0px_#1c1917] flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <Header 
        currentRound={currentRound}
        currentRoundData={currentRoundData}
        onSecretTap={toggleHostPanel}
      />

      {/* Main Content */}
      <main className="p-3 sm:p-4 max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-6">
        {/* Feedback Toast */}
        <FeedbackToast feedback={feedback} />

        {/* View Routing */}
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

        {/* Host Controls Panel */}
        <HostPanel
          isOpen={hostPanelOpen}
          currentRound={currentRound}
          isVotingOpen={isVotingOpen}
          voteResultsVisible={voteResultsVisible}
          revealedToMurderer={revealedToMurderer}
          unlockedFiles={unlockedFiles}
          revealedClues={revealedClues}
          onClose={() => setHostPanelOpen(false)}
        />

        {/* Decoder FAB - Only show on Intel/Clues screen */}
        {activeTab === 'intel' && (
          <button
            onClick={() => setModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-red-600 border-4 border-stone-900 text-white rounded-full shadow-[4px_4px_0px_#1c1917] flex items-center justify-center hover:scale-110 transition-transform z-40 active:translate-y-1 active:shadow-none"
          >
            <Calculator size={28} className="sm:w-8 sm:h-8" />
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
      <style jsx>{`
        .view-container {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}