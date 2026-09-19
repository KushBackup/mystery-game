const TUTORIAL_KEY = 'astral.tutorial.v1';

export const TUTORIAL_STAGES = {
  IDENTITY: 0,
  GUESTS: 1,
  COMMS: 2,
  VOTING: 3,
  EVIDENCE: 4,
  COMPLETE: 5,
};

const STEPS = {
  [TUTORIAL_STAGES.IDENTITY]: {
    step: 1,
    total: 5,
    target: 'dashboard',
    kicker: 'Your first task',
    title: 'Read your file',
    body: 'You have the case briefing. Now learn who you are, what you know, and the private detail only you can bring into the room.',
    action: 'Open my identity',
    visual: 'identity',
  },
  [TUTORIAL_STAGES.GUESTS]: {
    step: 2,
    total: 5,
    target: 'dossier',
    kicker: 'Build the room',
    title: 'Open one guest file',
    body: 'Every person here has a reason to talk carefully. Read a guest profile, then keep that person in mind when the accusations begin.',
    action: 'Open guest files',
    visual: 'guests',
  },
  [TUTORIAL_STAGES.COMMS]: {
    step: 3,
    total: 5,
    target: 'chat',
    kicker: 'Use the room',
    title: 'Enter Comms',
    body: 'This is the shared channel. Messages carry your name, so ask useful questions and share only what helps your theory.',
    action: 'Open Comms',
    visual: 'comms',
  },
  [TUTORIAL_STAGES.VOTING]: {
    step: 4,
    total: 5,
    target: 'votes',
    kicker: 'Know the pressure',
    title: 'See how voting works',
    body: 'A ballot takes over every phone after a round ends. You choose a guest, tap again to confirm, and the room sees the result together.',
    action: 'Open voting',
    visual: 'votes',
  },
  [TUTORIAL_STAGES.EVIDENCE]: {
    step: 5,
    total: 5,
    target: 'intel',
    kicker: 'Round one',
    title: 'Read your first lead',
    body: 'Your accusation is waiting in Evidence. Read it, decide what it means, then bring it into the conversation. New clue mechanics arrive in later rounds.',
    action: 'Open evidence',
    visual: 'evidence',
  },
};

export const readTutorialStage = (playerId) => {
  if (!playerId) return TUTORIAL_STAGES.IDENTITY;

  try {
    const saved = JSON.parse(window.localStorage.getItem(TUTORIAL_KEY) || '{}');
    const stage = saved[playerId];
    return Number.isInteger(stage) && stage >= 0 && stage <= TUTORIAL_STAGES.COMPLETE
      ? stage
      : TUTORIAL_STAGES.IDENTITY;
  } catch {
    return TUTORIAL_STAGES.IDENTITY;
  }
};

export const saveTutorialStage = (playerId, stage) => {
  if (!playerId) return;

  try {
    const saved = JSON.parse(window.localStorage.getItem(TUTORIAL_KEY) || '{}');
    window.localStorage.setItem(TUTORIAL_KEY, JSON.stringify({ ...saved, [playerId]: stage }));
  } catch {
    // Storage can be unavailable in private browsing; the in-memory flow still works.
  }
};

// A host reset begins a new room, so every identity previously used on this
// device must see the arrival walkthrough again. The marker that tells clients
// when to do this lives in shared game state; this ledger stays local.
export const clearTutorialProgress = () => {
  try {
    window.localStorage.removeItem(TUTORIAL_KEY);
  } catch {
    // Storage can be unavailable in private browsing; nothing else is required.
  }
};

export const tutorialStageForRound = (stage, currentRound) => (
  currentRound >= 1 ? Math.max(stage, TUTORIAL_STAGES.EVIDENCE) : stage
);

export const tutorialStepFor = (stage, currentRound) => (
  stage === TUTORIAL_STAGES.EVIDENCE && currentRound === 0 ? null : STEPS[stage] || null
);

export const tutorialTabsFor = (stage, currentRound) => {
  const coreTabs = ['dashboard', 'story', 'dossier', 'chat', 'votes'];

  if (stage === TUTORIAL_STAGES.IDENTITY) return ['dashboard'];
  if (stage === TUTORIAL_STAGES.GUESTS) return ['dashboard', 'story', 'dossier'];
  if (stage === TUTORIAL_STAGES.COMMS) return ['dashboard', 'story', 'dossier', 'chat'];
  if (stage === TUTORIAL_STAGES.VOTING) return coreTabs;
  if (stage === TUTORIAL_STAGES.EVIDENCE && currentRound === 0) return coreTabs;
  if (stage === TUTORIAL_STAGES.EVIDENCE) return [...coreTabs, 'intel'];

  return ['dashboard', 'story', 'intel', 'chat', 'votes', 'dossier', 'help'];
};