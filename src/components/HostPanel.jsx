import React, { useState } from 'react';
import {
  updateCurrentRound,
  updateRoundTimer,
  updateMurdererReveal,
  unlockFilesForRound,
  revealClues,
  revealCluesForRound,
  resetGameState,
  triggerForceRefresh,
  startGame,
  pushGameStart,
  holdGameAtStandby,
  endGame,
} from '../firebase/config';
import { CASE_FILES, CASE_META, CLUE_DB, HOST_SCRIPT } from '../data/gameData';
import {
  IDLE_TIMER,
  TIMER_PRESETS,
  VOTING_PRESETS,
  clearTimer,
  clockPhase,
  formatClock,
  isPaused,
  isRunning,
  pauseTimer,
  resumeTimer,
  setTimerDuration,
  setVotingDuration,
  startTimer,
  timerForRound,
} from '../lib/roundTimer';
import {
  COUNTDOWN_SECONDS,
  NOT_STARTED,
  roundClockStartsAt,
  skipCountdown,
} from '../lib/gameStart';
import { HostReferenceView } from './views/HostReferenceView';
import { WalkInManagementView } from './views/WalkInManagementView';
import { Numeral } from './ui/Numeral';
import { RoundClock } from './ui/RoundClock';
import { ChevronRight } from './icons/IconComponents';

/**
 * The host console (DESIGN_LANGUAGE.md §9, "Host").
 *
 * This was the app's worst offender: violet/indigo gradients, rounded-2xl
 * cards, blue and green and amber buttons — none of them in any palette the
 * project has ever had. It is now ink, hairlines and mono chrome like every
 * other screen, and REVEAL KILLERS is the single full signal fill in the
 * entire app, which is exactly why it reads as irreversible.
 */

// Tabs across the top of the run sheet. Kept separate from HOST_SCRIPT so the
// script entries stay pure content.
const SCRIPT_TABS = [
  { id: 'pregame', label: 'Pre' },
  { id: 0, label: 'R0' },
  { id: 1, label: 'R1' },
  { id: 2, label: 'R2' },
  { id: 3, label: 'R3' },
  { id: 4, label: 'R4' },
  { id: 5, label: 'R5' },
  { id: 6, label: 'R6' },
];

const ScriptBlock = ({ label, body, highlight }) => (
  <div>
    <p className="er-mono er-mono--dim">{label}</p>
    <p
      className={`font-body text-[15px] leading-[1.55] whitespace-pre-line mt-1.5 ${
        highlight
          ? 'bg-ink-hover border-l-2 border-signal pl-3 py-2 text-bone'
          : 'text-dim'
      }`}
    >
      {body}
    </p>
  </div>
);

// Every control in the console is the same object: ink-raised, hairline,
// mono uppercase. State is a border, never a hue.
const Control = ({ active, danger, disabled, className = '', children, ...props }) => (
  <button
    disabled={disabled}
    className={`er-touch w-full px-4 py-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] bg-ink-raised border ${
      disabled
        ? 'border-line text-dim-2 cursor-not-allowed'
        : active
          ? 'border-signal text-signal-lift'
          : danger
            ? 'border-line text-signal-lift hover:border-signal'
            : 'border-line text-bone hover:border-signal'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ label, meta, children }) => (
  <section className="er-card">
    <div className="flex items-baseline justify-between gap-3">
      <p className="er-mono er-mono--wide er-mono--bone">{label}</p>
      {meta && <span className="er-mono er-mono--dim">{meta}</span>}
    </div>
    <div className="er-rule mt-3 mb-4" />
    {children}
  </section>
);

export const HostPanel = ({
  isOpen,
  currentRound,
  votingPhase = 'idle',
  revealedToMurderer = false,
  resetInProgress = false,
  unlockedFiles = [],
  revealedClues = [],
  roundTimer = IDLE_TIMER,
  gameStartedAt = NOT_STARTED,
  setGameStartedAt,
  setRoundTimer,
  setCurrentRound,
  setRevealedToMurderer,
  setUnlockedFiles,
  setRevealedClues,
  setGameEnded,
  walkIns = [],
  walkInPasses = [],
  onFeedback,
}) => {
  const [expandedRound, setExpandedRound] = useState(null);
  const [scriptOpen, setScriptOpen] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);

  // The run sheet follows the live round, but the host can tab away to read
  // ahead. Only an explicit tap sets an override, and advancing the round
  // clears it — done as a render-phase adjustment rather than an effect so the
  // panel never paints one frame of the stale tab.
  const [scriptTabOverride, setScriptTabOverride] = useState(null);
  const [seenRound, setSeenRound] = useState(currentRound);
  if (seenRound !== currentRound) {
    setSeenRound(currentRound);
    setScriptTabOverride(null);
  }
  const scriptTab = scriptTabOverride ?? currentRound;

  const activeScript = HOST_SCRIPT.find(s => s.id === scriptTab) || HOST_SCRIPT[0];

  if (!isOpen) return null;

  if (resetInProgress) {
    return (
      <div className="er-card er-card--signal er-enter text-center py-10">
        <p className="er-mono er-mono--hot er-mono--wide">Resetting game</p>
        <p className="er-title text-[28px] mt-3">Clearing the room</p>
        <p className="font-body text-[15px] leading-[1.55] text-dim max-w-md mx-auto mt-4">
          Votes, evidence, messages and walk-in records are being removed. Players are held until the fresh case is ready.
        </p>
      </div>
    );
  }

  if (referenceOpen) {
    return <HostReferenceView currentRound={currentRound} onBack={() => setReferenceOpen(false)} />;
  }

  if (walkInOpen) {
    return (
      <WalkInManagementView
        walkIns={walkIns}
        walkInPasses={walkInPasses}
        onFeedback={onFeedback}
        onBack={() => setWalkInOpen(false)}
      />
    );
  }

  // The host can move the room at any time. During the normal path this is the
  // post-results advance; outside it, a confirmation makes the recovery action
  // deliberate without trapping the host behind an expired timer or ballot.
  const handleRoundChange = (newRound) => {
    if (newRound < 0 || newRound > 6 || newRound === currentRound) return;
    const needsConfirmation = votingPhase !== 'results' || newRound < currentRound;
    if (needsConfirmation && !window.confirm(
      `Move the room from Round ${String(currentRound).padStart(2, '0')} to Round ${String(newRound).padStart(2, '0')}? ` +
      'This ends any active ballot. A live clock restarts for the new round; an expired clock stays armed and stopped.'
    )) return;

    const nextTimer = timerForRound(roundTimer, newRound);
    setCurrentRound(newRound);
    setRoundTimer?.(nextTimer);
    updateCurrentRound(newRound, nextTimer);
  };

  // Every clock control is the same two lines: show it here, send it everywhere.
  const commitTimer = (nextTimer) => {
    setRoundTimer?.(nextTimer);
    updateRoundTimer(nextTimer);
  };

  // One button, three jobs — start a stopped clock, hold a running one, let a
  // held one go. Three separate controls would put two dead buttons on the
  // screen at all times, and this is a console read at arm's length in a dark
  // room while somebody is talking to you.
  const handleTimerToggle = () => {
    if (isRunning(roundTimer) && clockPhase(roundTimer) !== 'done') {
      return commitTimer(pauseTimer(roundTimer));
    }
    if (isPaused(roundTimer)) return commitTimer(resumeTimer(roundTimer));
    return commitTimer(startTimer(roundTimer, currentRound));
  };

  const handleTimerReset = () => commitTimer(clearTimer(roundTimer, currentRound));

  // Tapping a length on a running clock restarts it there and then, which is
  // what makes the 1 min and 10 sec presets useful: they are how the host tests
  // the countdown, and how they can put a real squeeze on a round that has run
  // long without waiting for the next advance.
  const handleTimerPreset = (ms) =>
    commitTimer(setTimerDuration(roundTimer, ms, currentRound));

  const handleVotingPreset = (ms) => commitTimer(setVotingDuration(roundTimer, ms));

  // --- The starting gun (lib/gameStart.js) ---------------------------------

  const gameStarted = gameStartedAt > 0;

  // Start is the one control that does two things at once, and it has to: the
  // room's standby screen clearing and the round's clock beginning are one event
  // as far as anybody in the room is concerned.
  //
  // The clock is armed to begin at the *end* of the countdown rather than at the
  // press, so the first round does not spend its first ten seconds behind a
  // curtain nobody can play through. remainingMs in lib/roundTimer.js clamps to
  // the round's own duration, so for those ten seconds every phone simply reads
  // a full round and then starts moving.
  const handleStartGame = () => {
    if (gameStarted) return;
    if (!window.confirm(
      `Start the game? Every player's screen counts down from ${COUNTDOWN_SECONDS} and then opens, ` +
      `and the Round ${currentRound} clock starts when it does.`
    )) return;

    const now = Date.now();
    const nextTimer = startTimer(roundTimer, currentRound, roundClockStartsAt(now));
    setGameStartedAt?.(now);
    setRoundTimer?.(nextTimer);
    startGame(now, nextTimer);
  };

  // The escape hatch the run sheet points at when one phone is still sitting on
  // standby after the room has been let in. See pushGameStart in
  // firebase/config.js for why it reloads as well as rewrites.
  const handlePushStart = () => {
    if (!window.confirm(
      'Push the start through to every device? Anyone still waiting drops straight into the game ' +
      'with no countdown, and every phone reloads. Logins persist and the round clock is untouched.'
    )) return;

    const at = skipCountdown();
    setGameStartedAt?.(at);
    pushGameStart(at);
  };

  const handleHoldAtStandby = () => {
    if (!window.confirm(
      'Send the room back to the waiting screen? Every player stops where they are until you press ' +
      'Start again. The round clock is not touched — stop it separately if you meant to.'
    )) return;

    setGameStartedAt?.(NOT_STARTED);
    holdGameAtStandby();
  };

  const handleRevealMurderer = () => {
    if (revealedToMurderer) return;
    if (window.confirm(`Reveal the killers to the full room? ${CASE_META.playerCount - CASE_META.killerCount} players will see the public reveal. This ends the game and cannot be undone except by Reset Game.`)) {
      setRevealedToMurderer(true);
      setGameEnded(true);
      updateMurdererReveal(true);
    }
  };

  const handleUnlockRoundFiles = (round) => {
    const idsForRound = CASE_FILES.filter(f => f.roundReq === round).map(f => f.id);
    setUnlockedFiles([...new Set([...unlockedFiles, ...idsForRound])]);
    unlockFilesForRound(round);
  };

  const handleResetGame = async () => {
    if (window.confirm(
      'Reset this game for everyone? This clears cast votes, unlocked clues and files, the killer reveal, chat messages, walk-ins and their passes. ' +
      'Every player returns to standby and starts a fresh tutorial. Player logins remain on their devices.'
    )) {
      try {
        await resetGameState();
      } catch (error) {
        // A reset that half-lands is worse than one that fails loudly: the
        // chat wipe is the part that has historically been rejected while the
        // host was told everything was clean.
        console.error('Reset failed:', error);
        window.alert(`Reset did not complete: ${error?.message || error}\n\nCheck the console — the round, votes and clues may be cleared while the chat channel is not.`);
      }
    }
  };

  const handleForceRefresh = () => {
    if (window.confirm("Force every player's device to reload? Players stay logged in — they'll see a brief blip then snap back to the current round.")) {
      triggerForceRefresh();
    }
  };

  const handleEndGame = () => {
    if (window.confirm('Are you sure you want to end the game? All players will see the outro screen.')) {
      setGameEnded(true);
      endGame();
    }
  };

  const handleRevealClue = (clueId) => {
    if (revealedClues.includes(clueId)) return;
    setRevealedClues([...revealedClues, clueId]);
    revealClues([clueId]);
  };

  const handleRevealAllForRound = (round) => {
    const idsForRound = CLUE_DB.filter(c => c.roundReq === round && c.type !== 'CONFESSION').map(c => c.id);
    setRevealedClues([...new Set([...revealedClues, ...idsForRound])]);
    revealCluesForRound(round);
  };

  // "Released" is read off the same list the unlock writes, so the button can't
  // disagree with what the room can actually see. It used to watch one
  // hardcoded sentinel ID per round, and those sentinels died in the Velvet
  // Ember rename along with the ones in unlockFilesForRound — the round would
  // stay tappable forever because the ID it was looking for no longer existed.
  const fileRounds = [
    { round: 0, label: 'Incident report' },
    { round: 3, label: 'Evidence' },
    { round: 4, label: 'Revelations' },
  ].map((r) => {
    const ids = CASE_FILES.filter(f => f.roundReq === r.round).map(f => f.id);
    return {
      ...r,
      count: ids.length,
      done: ids.length > 0 && ids.every(id => unlockedFiles.includes(id)),
    };
  });

  // The clock's state in one word, for the section's meta line. Derived rather
  // than stored for the same reason the reading of "done" is (lib/roundTimer.js):
  // nothing writes when a countdown runs out.
  const timerIdle = !isRunning(roundTimer) && !isPaused(roundTimer);
  const timerDone = clockPhase(roundTimer) === 'done';
  const timerState = votingPhase === 'open'
    ? 'Ballot open'
    : votingPhase === 'results'
      ? 'Results'
      : isRunning(roundTimer) ? 'Running' : isPaused(roundTimer) ? 'Held' : 'Stopped';
  const canMovePreviousRound = currentRound > 0;
  const canMoveNextRound = currentRound < 6;
  const activeWalkIns = walkIns.filter((walkIn) => walkIn.active);

  // Group clues by round (the confession is handled separately).
  const cluesByRound = {
    1: CLUE_DB.filter(c => c.roundReq === 1 && c.type !== 'CONFESSION'),
    2: CLUE_DB.filter(c => c.roundReq === 2 && c.type !== 'CONFESSION'),
    3: CLUE_DB.filter(c => c.roundReq === 3 && c.type !== 'CONFESSION'),
    4: CLUE_DB.filter(c => c.roundReq === 4 && c.type !== 'CONFESSION'),
  };

  return (
    <div className="space-y-4">
      {/* Live state at a glance. Every figure here ticks when the host changes
          it, which on this screen is doing real work: it is the confirmation
          that a tap reached Firestore and came back. */}
      <div className="er-stat grid grid-cols-3 gap-4">
        <div>
          <Numeral as="p" value={currentRound} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Round</p>
        </div>
        <div>
          <Numeral as="p" value={unlockedFiles.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Files out</p>
        </div>
        <div>
          <Numeral as="p" value={revealedClues.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Clues out</p>
        </div>
      </div>

      <section className="er-card er-card--signal">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="er-mono er-mono--hot er-mono--wide">Host guide</p>
            <p className="font-body text-[15px] leading-[1.55] text-dim mt-2">
              Open the full facilitation screen: live round playbook, witness map, clue deck,
              objections, and answer structure.
            </p>
          </div>

          <Control className="sm:w-auto sm:min-w-[14rem]" onClick={() => setReferenceOpen(true)}>
            Open host guide
          </Control>
        </div>
      </section>

      <Section label="Walk-ins" meta={`${activeWalkIns.length} active`}>
        <Control onClick={() => setWalkInOpen(true)}>
          Open walk-in register
        </Control>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Issue a simple registration word, see every person who registers, and keep each walk-in's simple login word on one host-only screen.
        </p>
      </Section>

      {/* Run sheet */}
      <section className="er-card p-0">
        <button
          onClick={() => setScriptOpen(!scriptOpen)}
          className="er-touch w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="er-mono er-mono--wide er-mono--bone truncate">
            Run sheet · {activeScript.title}
          </span>
          <span className="er-mono er-mono--dim shrink-0 flex items-center gap-2">
            {scriptOpen ? 'Collapse' : 'Expand'}
            {/* One icon, rotated — not two icons swapped. The chevron turning is
                what makes the collapse read as a direction rather than a
                relabelled button. */}
            <ChevronRight
              size={14}
              strokeWidth={1.75}
              aria-hidden="true"
              className={`transition-[rotate] duration-200 ease-out ${
                scriptOpen ? 'rotate-90' : 'rotate-0'
              }`}
            />
          </span>
        </button>

        {scriptOpen && (
          <div className="er-swap px-4 pb-4 space-y-4">
            <div className="er-rule" />

            <div className="flex flex-wrap gap-1.5">
              {SCRIPT_TABS.map(tab => {
                const isActive = scriptTab === tab.id;
                // The outline marks where the game actually is, so a host who
                // has tabbed ahead can always find their way back.
                const isLive = currentRound === tab.id;
                return (
                  <button
                    key={String(tab.id)}
                    onClick={() => setScriptTabOverride(tab.id)}
                    className={`er-touch px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] border ${
                      isActive
                        ? 'bg-signal border-signal text-white er-touch--hot'
                        : isLive
                          ? 'bg-ink-hover border-brass text-brass'
                          : 'bg-ink-hover border-line text-dim'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Keyed on the tab so paging through the run sheet mid-event reads
                as the page turning. The host is tabbing between eight
                near-identical layouts, which is exactly the case where a static
                swap leaves you unsure whether the tap registered. */}
            <div key={String(scriptTab)} className="er-swap space-y-4">
              <div className="flex items-baseline justify-between gap-3 pb-2 border-b border-line">
                <h3 className="font-typewriter font-bold text-bone text-[19px]">{activeScript.title}</h3>
                <span className="er-mono er-mono--dim shrink-0">{activeScript.duration}</span>
              </div>

              <ScriptBlock label="Setup — do this first" body={activeScript.setup} />
              <ScriptBlock label="Announce — say this aloud" body={activeScript.announce} highlight />
              <ScriptBlock label="During the round" body={activeScript.during} />
              <ScriptBlock label="End / transition" body={activeScript.end} />
            </div>
          </div>
        )}
      </section>

      {/* The opening move, and the first control a host reaches for — so it sits
          above the round and the ballot rather than down with the recovery
          tools, even though two of its three buttons are recovery. Until Start
          is pressed every player who has logged in is held on the standby
          screen (components/StandbyScreen.jsx). */}
      <Section label="Game start" meta={gameStarted ? 'Room open' : 'Standby'}>
        {/* Spent rather than unavailable, the same way the case-file releases
            read — `disabled` is what says it has already happened, and the
            label says which. */}
        <Control disabled={gameStarted} onClick={handleStartGame}>
          {gameStarted ? 'Game started' : 'Start game'}
        </Control>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Control disabled={!gameStarted} onClick={handlePushStart}>
            Push start to everyone
          </Control>
          <Control danger disabled={!gameStarted} onClick={handleHoldAtStandby}>
            Back to waiting
          </Control>
        </div>

        {/* Body voice, not mono — the same call the round clock's note makes.
            This is a paragraph the host reads once while setting up, not a
            label they scan mid-round. */}
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Everyone who has logged in is waiting on one screen until you press Start.
          Starting counts the room down from {COUNTDOWN_SECONDS}, opens every phone at
          once, and starts the Round {currentRound} clock as the countdown clears.
          If a phone is still stuck on the waiting screen after that, push the start to
          everyone — it drops them straight in and reloads every device.
        </p>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Round control */}
        <Section label="Round" meta="Manual override available">
          <div className="flex flex-col items-center gap-4">
            <Numeral value={currentRound} pad={2} className="er-num text-[56px] leading-none" />
            <div className="grid grid-cols-2 gap-3 w-full">
              <Control
                danger
                disabled={!canMovePreviousRound}
                onClick={() => handleRoundChange(currentRound - 1)}
              >
                Previous round
              </Control>
              <Control
                disabled={!canMoveNextRound}
                onClick={() => handleRoundChange(currentRound + 1)}
              >
                {currentRound >= 6 ? 'Final round' : `Start round ${String(currentRound + 1).padStart(2, '0')}`}
              </Control>
            </div>
          </div>
        </Section>

        {/* Voting */}
        <Section
          label="Ballot"
          meta={`${votingPhase === 'open' ? 'Open' : votingPhase === 'results' ? 'Results out' : 'Automatic'} · ${formatClock(roundTimer.votingDurationMs)}`}
        >
          <p className="font-body text-[15px] leading-[1.55] text-dim">
            When the round clock reaches zero, every player receives a ballot.
            The final tally and every vote are announced automatically when that window ends.
          </p>

          <div className="er-rule my-4" />
          <p className="er-mono er-mono--dim">Ballot length</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {VOTING_PRESETS.map((preset) => (
              <Control
                key={preset.id}
                active={roundTimer.votingDurationMs === preset.ms}
                onClick={() => handleVotingPreset(preset.ms)}
              >
                {preset.label}
              </Control>
            ))}
          </div>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            Set this before the round ends to configure its ballot. Changing it while voting is open updates every player&apos;s ballot clock immediately.
          </p>
        </Section>
      </div>

      {/* Round clock — the only control in here that writes to all 69 screens
          continuously rather than once. Sits directly under the round control
          because the two are one action in practice: advance, then start. */}
      <Section label="Round clock" meta={timerState}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <RoundClock timer={roundTimer} variant="console" showIdle />

          <div className="flex gap-3 sm:shrink-0 sm:w-[19rem]">
            <Control active={isRunning(roundTimer) && !timerDone} onClick={handleTimerToggle}>
              {isRunning(roundTimer) && !timerDone ? 'Pause' : isPaused(roundTimer) ? 'Resume' : 'Start'}
            </Control>
            <Control disabled={timerIdle} onClick={handleTimerReset}>
              Reset
            </Control>
          </div>
        </div>

        <div className="er-rule my-4" />

        <p className="er-mono er-mono--dim">Round length</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {TIMER_PRESETS.map((preset) => (
            <Control
              key={preset.id}
              active={roundTimer.durationMs === preset.ms}
              onClick={() => handleTimerPreset(preset.ms)}
            >
              {preset.label}
            </Control>
          ))}
        </div>

        {/* Body voice, not mono. Three sentences of 11px uppercase at 0.18em
            tracking is a wall on a phone, and this is the one paragraph in the
            console a host reads rather than scans. */}
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          These controls remain live during ballot and results. Advancing with a live
          clock restarts it for the new round; after expiry, choose a length to arm
          the next round, then press Start when the room is ready.
        </p>
      </Section>

      {/* Case files */}
      <Section label="Release case files" meta={`${unlockedFiles.length} out`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fileRounds.map(({ round, label, count, done }) => (
            <Control key={round} disabled={done} onClick={() => handleUnlockRoundFiles(round)}>
              {done ? 'Released · ' : ''}R{round} {label} ({count})
            </Control>
          ))}
        </div>
      </Section>

      {/* Clue reveals */}
      <Section label="Reveal clues to the room" meta={`${revealedClues.length} out`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(round => {
            const roundClues = cluesByRound[round] || [];
            const revealedCount = roundClues.filter(c => revealedClues.includes(c.id)).length;
            const isExpanded = expandedRound === round;
            const allRevealed = revealedCount === roundClues.length;

            return (
              <div key={round} className="bg-ink-hover border border-line">
                <div className="flex items-stretch">
                  <button
                    onClick={() => setExpandedRound(isExpanded ? null : round)}
                    className="er-touch flex-1 px-3 py-3 text-left"
                  >
                    <span className="er-mono er-mono--bone block">Round {round}</span>
                    <span className="er-mono er-mono--dim block mt-1">
                      {revealedCount} of {roundClues.length} revealed
                    </span>
                  </button>
                  <button
                    onClick={() => handleRevealAllForRound(round)}
                    disabled={allRevealed}
                    className={`er-touch px-4 border-l border-line font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
                      allRevealed ? 'text-dim-2 cursor-not-allowed' : 'text-signal-lift'
                    }`}
                  >
                    All
                  </button>
                </div>

                {isExpanded && (
                  <div className="er-swap border-t border-line max-h-52 overflow-y-auto custom-scrollbar">
                    {roundClues.map(clue => {
                      const isRevealed = revealedClues.includes(clue.id);
                      return (
                        <button
                          key={clue.id}
                          onClick={() => handleRevealClue(clue.id)}
                          disabled={isRevealed}
                          className={`er-touch w-full text-left px-3 py-2.5 border-b border-line-faint last:border-b-0 font-body text-[13px] leading-[1.4] ${
                            isRevealed ? 'text-dim-2 cursor-not-allowed' : 'text-bone'
                          }`}
                        >
                          {isRevealed ? '— ' : ''}{clue.title || clue.code}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Terminal actions */}
      <Section label="End of game">
        <div className="space-y-3">
          {/* The one full signal fill in the app. It is unmistakable because
              nothing else is ever allowed to look like this (§2.2). */}
          <button
            onClick={handleRevealMurderer}
            disabled={currentRound < 6 || revealedToMurderer}
            className={`er-touch w-full px-4 py-5 font-mono text-[12px] font-medium uppercase tracking-[0.24em] border ${
              currentRound < 6 || revealedToMurderer
                ? 'bg-ink-raised border-line text-dim-2 cursor-not-allowed'
                : 'er-touch--hot bg-signal border-signal text-white'
            }`}
          >
            {revealedToMurderer
              ? 'Killers revealed'
              : currentRound < 6
                ? 'Reveal killers · unlocks at round 6'
                : 'Reveal killers'}
          </button>

          <Control danger onClick={handleEndGame}>End game</Control>
        </div>
      </Section>

      {/* Recovery */}
      <Section label="Recovery">
        <div className="space-y-3">
          <Control onClick={handleForceRefresh}>Force sync all players</Control>
          <p className="er-mono er-mono--dim text-center">
            Reloads every connected device. Logins persist — no one gets kicked out.
          </p>
          <Control danger onClick={handleResetGame}>Reset game</Control>
        </div>
      </Section>

      <p className="er-mono text-center">
        Real-time sync via Firebase · every change broadcasts instantly
      </p>
    </div>
  );
};
