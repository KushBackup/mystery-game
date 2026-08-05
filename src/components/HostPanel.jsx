import React, { useState } from 'react';
import {
  updateCurrentRound,
  updateVotingStatus,
  updateVoteResultsVisibility,
  updateMurdererReveal,
  unlockFilesForRound,
  revealClues,
  revealCluesForRound,
  resetGameState,
  triggerForceRefresh,
  endGame
} from '../firebase/config';
import { CASE_FILES, CLUE_DB, HOST_SCRIPT } from '../data/gameData';
import { Numeral } from './ui/Numeral';
import { ChevronRight } from './icons/IconComponents';

/**
 * The host console (DESIGN_LANGUAGE.md §9, "Host").
 *
 * This was the app's worst offender: violet/indigo gradients, rounded-2xl
 * cards, blue and green and amber buttons — none of them in any palette the
 * project has ever had. It is now ink, hairlines and mono chrome like every
 * other screen, and REVEAL MURDERER is the single full signal fill in the
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
  isVotingOpen,
  voteResultsVisible = false,
  revealedToMurderer = false,
  unlockedFiles = [],
  revealedClues = [],
  setCurrentRound,
  setIsVotingOpen,
  setVoteResultsVisible,
  setRevealedToMurderer,
  setUnlockedFiles,
  setRevealedClues,
  setGameEnded,
}) => {
  const [expandedRound, setExpandedRound] = useState(null);
  const [scriptOpen, setScriptOpen] = useState(true);

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

  // Optimistic UI: update local state instantly so the host sees feedback the
  // moment they tap, then fire-and-forget the Firestore write. The onSnapshot
  // subscription in App.jsx confirms the same value a moment later (no flicker).
  const handleRoundChange = (newRound) => {
    setCurrentRound(newRound);
    updateCurrentRound(newRound);
  };

  const handleToggleVoting = () => {
    const next = !isVotingOpen;
    setIsVotingOpen(next);
    updateVotingStatus(next);
  };

  const handleToggleVoteResults = () => {
    const next = !voteResultsVisible;
    setVoteResultsVisible(next);
    updateVoteResultsVisibility(next);
  };

  const handleRevealMurderer = () => {
    if (revealedToMurderer) return;
    if (window.confirm('Reveal the murderer to ALL 32 players? This ends the game and cannot be undone except by Reset Game.')) {
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
    if (window.confirm('Are you sure you want to reset the game? This will clear all progress.')) {
      await resetGameState();
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

  const fileRounds = [
    { round: 0, label: 'Incident report', sentinel: 'f_incident' },
    { round: 3, label: 'Evidence', sentinel: 'f_toxreport' },
    { round: 4, label: 'Revelations', sentinel: 'f_medical' },
  ].map(r => ({ ...r, count: CASE_FILES.filter(f => f.roundReq === r.round).length }));

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Round control */}
        <Section label="Round" meta="Live on every device">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => handleRoundChange(Math.max(0, currentRound - 1))}
              aria-label="Previous round"
              className="er-touch w-14 h-14 flex items-center justify-center bg-ink-raised border border-line text-bone text-2xl hover:border-signal"
            >
              −
            </button>

            <Numeral value={currentRound} pad={2} className="er-num text-[56px] leading-none" />

            <button
              onClick={() => handleRoundChange(Math.min(6, currentRound + 1))}
              aria-label="Next round"
              className="er-touch w-14 h-14 flex items-center justify-center bg-ink-raised border border-line text-bone text-2xl hover:border-signal"
            >
              +
            </button>
          </div>
        </Section>

        {/* Voting */}
        <Section label="Ballot" meta={isVotingOpen ? 'Open' : 'Closed'}>
          <div className="space-y-3">
            <Control active={isVotingOpen} onClick={handleToggleVoting}>
              {isVotingOpen ? 'Close ballot' : 'Open ballot'}
            </Control>
            <Control active={voteResultsVisible} onClick={handleToggleVoteResults}>
              {voteResultsVisible ? 'Hide tally' : 'Show tally'}
            </Control>
          </div>
        </Section>
      </div>

      {/* Case files */}
      <Section label="Release case files" meta={`${unlockedFiles.length} out`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fileRounds.map(({ round, label, sentinel, count }) => {
            const done = unlockedFiles.includes(sentinel);
            return (
              <Control key={round} disabled={done} onClick={() => handleUnlockRoundFiles(round)}>
                {done ? 'Released · ' : ''}R{round} {label} ({count})
              </Control>
            );
          })}
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
              ? 'Murderer revealed'
              : currentRound < 6
                ? 'Reveal murderer · unlocks at round 6'
                : 'Reveal murderer'}
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
