import React, { useState, useMemo } from 'react';
import { Calculator } from './components/icons/IconComponents';
import { FeedbackToast } from './components/ui/FeedbackToast';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { IntelView } from './components/views/IntelView';
import { FilesView } from './components/views/FilesView';
import { DossierView } from './components/views/DossierView';
import { ChatView } from './components/views/ChatView';
import { GuestProfileModal } from './components/modals/GuestProfileModal';
import { DecoderModal } from './components/modals/DecoderModal';
import { CharacterSelect } from './components/CharacterSelect';
import { HostPanel } from './components/HostPanel';
import { ROUNDS, CHARACTERS, CLUE_DB } from './data/gameData';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  // Game State (Mocking Firebase)
  const [currentRound, setCurrentRound] = useState(0);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [votes, setVotes] = useState({}); // { round: suspectId }
  
  // Local UI State
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [hostPanelOpen, setHostPanelOpen] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);

  const myCharacter = useMemo(() => 
    CHARACTERS.find(c => c.id === currentUser), 
  [currentUser]);

  const currentRoundData = ROUNDS[currentRound] || ROUNDS[ROUNDS.length - 1];

  // --- ACTIONS ---

  const handleLogin = (id) => {
    setCurrentUser(id);
    setActiveTab('DASHBOARD');
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
        setUnlockedClues([...unlockedClues, foundClue.id]);
        setFeedback({ type: 'success', msg: `EVIDENCE ADDED: ${foundClue.title}` });
        setModalOpen(false);
        setActiveTab('INTEL');
      }
    } else if (foundChar) {
       setFeedback({ type: 'success', msg: `MET: ${foundChar.name}.` });
    } else {
      setFeedback({ type: 'error', msg: "INVALID CODE" });
    }
    
    setInputCode("");
    setTimeout(() => setFeedback(null), 3000);
  };

  const submitVote = (suspectId) => {
    setVotes({ ...votes, [currentRound]: suspectId });
    setFeedback({ type: 'success', msg: "VOTE RECORDED" });
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

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-900 font-handwritten pb-20 sm:pb-24 relative overflow-hidden bg-texture">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-2 bg-red-700 z-50"></div>
      
      {/* Header */}
      <Header 
        currentRound={currentRound}
        currentRoundData={currentRoundData}
        onLogout={() => setCurrentUser(null)}
        onSecretTap={toggleHostPanel}
      />

      {/* Main Content */}
      <main className="p-3 sm:p-4 max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Feedback Toast */}
        <FeedbackToast feedback={feedback} />

        {/* View Routing */}
        {activeTab === 'DASHBOARD' && (
          <DashboardView myCharacter={myCharacter} currentRound={currentRound} />
        )}

        {activeTab === 'INTEL' && (
          <IntelView unlockedClues={unlockedClues} />
        )}

        {activeTab === 'CHAT' && (
          <ChatView myCharacter={myCharacter} />
        )}

        {activeTab === 'FILES' && (
          <FilesView />
        )}

        {activeTab === 'DOSSIER' && (
          <DossierView
            currentUser={currentUser}
            isVotingOpen={isVotingOpen}
            currentRound={currentRound}
            votes={votes}
            onSelectGuest={setSelectedGuest}
          />
        )}

        {/* Host Controls Panel */}
        <HostPanel
          isOpen={hostPanelOpen}
          currentRound={currentRound}
          isVotingOpen={isVotingOpen}
          onClose={() => setHostPanelOpen(false)}
          onRoundChange={setCurrentRound}
          onToggleVoting={() => setIsVotingOpen(!isVotingOpen)}
        />

        {/* Decoder FAB */}
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-red-600 border-4 border-stone-900 text-white rounded-full shadow-[4px_4px_0px_#1c1917] flex items-center justify-center hover:scale-110 transition-transform z-40 active:translate-y-1 active:shadow-none"
        >
          <Calculator size={28} className="sm:w-8 sm:h-8" />
        </button>

        {/* Helper for finding Host Panel */}
        <div className="fixed bottom-20 right-20 text-stone-300 opacity-20 hover:opacity-100 cursor-pointer" onClick={toggleHostPanel}>⚡</div>
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

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