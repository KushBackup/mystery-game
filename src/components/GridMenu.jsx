import React, { useEffect, useState } from 'react';
import { ScreenBrief } from './ui/ScreenBrief';
import { Numeral } from './ui/Numeral';
import { InfoTip } from './ui/InfoTip';
import { CASE_META } from '../data/gameData';
import { roundTip } from '../data/tooltips';

// Sketched line icons — stroke-only so they inherit the surface's text colour.
//
// Stroke is 1.75, not 1.5: these sit directly above bold uppercase typewriter
// labels at 19–23px, and an icon carries the optical weight of the text beside
// it. At 1.5 against a 700-weight label the icon read as a hairline sketch
// pinned above solid type — the pair looked like two different sets.
const ICON_STROKE = 1.75;

const FingerprintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// An open case file with a bookmark — the story as a bound document rather than
// a loose clipping, which is what separates it at a glance from the Guide.
const BookIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A1.5 1.5 0 015.5 4H10a2 2 0 012 2v13a2 2 0 00-2-2H4V5.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 5.5A1.5 1.5 0 0018.5 4H14a2 2 0 00-2 2v13a2 2 0 012-2h6V5.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v5l1.5-1L19 9V4" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const HelpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={ICON_STROKE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Module scope, so it survives this component unmounting and remounting — which
// it does every single time the player closes a screen.
//
// Returning to the board is the app's most frequent navigation by a wide margin.
// The full landing sequence is eight tiles at 60ms apart plus a 700ms overshoot,
// which is ~1.2s of motion; paying that on every close is the definition of an
// entrance animation on a high-frequency interaction. So the sequence plays once
// per session, on the first visit, and every return after that is a single
// 260ms lift with no stagger at all.
let boardIntroPlayed = false;

/**
 * The investigation board (DESIGN_LANGUAGE.md §9, "Grid hub").
 *
 * Bone means "this is a document", so the tiles — pinned paper labels on a
 * corkboard — are bone and bone-aged. EXIT is interface, not paper, so it is
 * ink-hover. VOTE is the one signal focal point, and it only *fills* with
 * signal while voting is genuinely open; the rest of the time it carries the
 * accent as a 3px top border, because red is a scalpel, not a paint (§2.2).
 */
export default function GridMenu({ onNavigate, currentRound = 0, isVotingOpen = false, note }) {
  // State, not a ref: this is read during render to pick the animation, and refs
  // must not be read during render. The initialiser only *reads* the module flag
  // (so it stays pure, and StrictMode's double-invoke gets the same answer both
  // times); the effect is what commits it.
  const [playIntro] = useState(() => !boardIntroPlayed);
  useEffect(() => {
    boardIntroPlayed = true;
  }, []);

  const tileMotion = playIntro ? 'er-land' : 'er-enter-quick';

  // Six destinations in a clean 3×2 board, then two full-width strips.
  //
  // Archives used to be the seventh tile; it is now the lower region of Evidence,
  // since both screens were the same act — reading a document you were handed.
  // That left an odd number of tiles, so GUIDE joins EXIT as a strip rather than
  // sitting beside a hole in the board. It earns that: both are utilities, not
  // places in the fiction — one explains the app, the other leaves it. The
  // differentiation stays surface, not hue (§2.2) — GUIDE is still paper, EXIT
  // is ink.
  const menuItems = [
    { id: 'dashboard', label: 'Identity',  sub: 'Confidential', icon: FingerprintIcon, tone: 'bone',  rot: 'er-rotL' },
    { id: 'story',     label: 'Story',     sub: 'The Night',    icon: BookIcon,        tone: 'aged',  rot: 'er-rotR' },
    { id: 'intel',     label: 'Evidence',  sub: 'Clues & Files', icon: ClipboardIcon,  tone: 'bone',  rot: 'er-rotR' },
    { id: 'chat',      label: 'Comms',     sub: 'Encrypted',    icon: ChatIcon,        tone: 'aged',  rot: 'er-rotL' },
    { id: 'votes',     label: 'Vote',      sub: isVotingOpen ? 'Open Now' : 'Standby', icon: ChartIcon, tone: 'vote', rot: 'er-rotL' },
    { id: 'dossier',   label: 'Guests',    sub: 'Profiles',     icon: UsersIcon,       tone: 'bone',  rot: 'er-rotR' },
    { id: 'help',      label: 'Guide',     sub: 'Read Me',      icon: HelpIcon,        tone: 'aged',  rot: '', wide: true },
    { id: 'logout',    label: 'Exit',      sub: 'End Session',  icon: LogoutIcon,      tone: 'ink',   rot: '', wide: true },
  ];

  const handleTileClick = (itemId) => {
    // A 20ms buzz on tile tap is part of the product's texture (§4.3).
    if (navigator.vibrate) navigator.vibrate(20);
    onNavigate(itemId);
  };

  // Surfaces, not hues (§2.2). Every branch below changes the *paper*, and
  // only the vote tile is ever allowed to reach for the accent.
  const toneClasses = (tone) => {
    if (tone === 'vote') {
      return isVotingOpen
        ? 'er-touch--hot bg-signal text-white border border-signal er-pin'
        : 'bg-ink-raised text-bone border border-line border-t-[3px] border-t-signal';
    }
    if (tone === 'ink') return 'bg-ink-hover text-bone border border-line';
    if (tone === 'aged') return 'er-bone er-bone--aged er-pin';
    return 'er-bone er-pin';
  };

  const subToneClass = (tone) => {
    if (tone === 'vote') return isVotingOpen ? 'text-white/75' : 'er-mono--hot';
    if (tone === 'ink') return 'er-mono--dim';
    return 'text-signal-deep';
  };

  return (
    <div className="min-h-screen bg-ink relative er-grain overflow-x-hidden">
      <div className="er-lamp" aria-hidden="true" />
      <div className="er-lamp er-lamp--signal" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-14">
        {/* Chrome rail — mono label left, state right, hairline underneath. */}
        <div className="pt-5">
          <div className="flex items-end justify-between gap-3">
            <span className="er-mono er-mono--wide er-mono--bone">Astral Project</span>
            {/* The board is where a player lands after every screen, so the
                round tooltip is repeated here rather than living only in the
                chrome rail — this is the one surface that has no rail. */}
            <div className="flex items-baseline gap-2">
              <span className="er-mono">Round</span>
              <Numeral value={currentRound} pad={2} className="er-num text-xl" />
              <InfoTip tip={roundTip(currentRound)} className="self-center" />
            </div>
          </div>
          <div className="er-rule mt-3" />
        </div>

        {/* Kicker + screen title */}
        <div className={`pt-7 ${playIntro ? 'er-enter' : 'er-enter-quick'}`}>
          <p className="er-mono er-mono--hot er-mono--wide">{CASE_META.venue}</p>
          <h1 className="er-title mt-2.5 text-[34px] sm:text-[46px]">
            {CASE_META.title}
          </h1>
          <p className="font-note text-signal-lift text-[17px] mt-3 -rotate-1 origin-left">
            Trust no one.
          </p>

          <ScreenBrief note={note} currentRound={currentRound} className="mt-5" />
        </div>

        {/* Investigation board */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isPaper = item.tone === 'bone' || item.tone === 'aged';

            return (
              <button
                key={item.id}
                onClick={() => handleTileClick(item.id)}
                className={`er-touch er-lift ${tileMotion} relative w-full flex flex-col items-center justify-center gap-2 px-2 ${
                  item.wide ? 'col-span-2 py-3.5' : 'aspect-[4/3]'
                } ${item.rot} ${toneClasses(item.tone)}`}
                style={playIntro ? { animationDelay: `${index * 60}ms` } : undefined}
              >
                <Icon
                  className={`${item.wide ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'} ${
                    isPaper ? 'text-ink/70' : ''
                  }`}
                />

                <span
                  className={`font-typewriter font-bold uppercase leading-none text-[19px] sm:text-[23px] ${
                    isPaper ? 'text-ink' : ''
                  }`}
                >
                  {item.label}
                </span>

                {/* Keyed on the copy so the ballot opening animates the label
                    rather than silently swapping it under the player. */}
                <span key={item.sub} className={`er-mono er-swap ${subToneClass(item.tone)}`}>
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer rail */}
        <div className="mt-10">
          <div className="er-rule" />
          <div className="flex items-center justify-between pt-3">
            <span className="er-mono">Case {CASE_META.caseId}</span>
            {/* Guest count only. The killer count used to sit here and it is a
                spoiler on the most-visited screen in the game: knowing the
                conspiracy is five-handed is the deduction Round 5 is built to
                deliver. It stays host-side (HostPanel, HostReferenceView) and on
                the killers' own Timeline. */}
            <span className="er-mono">{CASE_META.playerCount} Guests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
