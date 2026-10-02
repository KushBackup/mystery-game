import React, { useEffect, useRef, useState } from 'react';
import { useChannel, useMyVote, useMyScore, useMyAction, useDen, useServerNow, useAllTraits, useKillerGroup } from '../hooks/useKillers';
import { serverNow } from '../lib/clockSkew';
import { nowLine, PHASE_LABEL, deliveryLine } from '../data/killersCopy';
import { dayKit } from '../data/packs/index.js';
import { StatusBar, HomeBar, HomeScreen, LockScreen, Banner, NotificationCenter, NCTile } from './chrome';
import { AlarmScreen, RoleText, IncomingCall, GoneScreen, ChapterCard, TakenScreen } from './takeovers';
import { threadsFor, preview as threadPreview } from './threads';
import { useSeen, markSeen } from './seen';
import { useNews } from './news';
import { useVoice } from './voice';
import { useMaskedPlayers, BOARD_BEAT, VERDICT_BEAT } from './beats';
import { prefersLessMotion } from './nav';
import { dayLabel, photoSource, timeOfDay } from './words';
import { primeSfx, sfxPing, sfxLock } from './sfx';
import MessagesApp from './apps/MessagesApp';
import GameApp from './apps/GameApp';
import NewsApp from './apps/NewsApp';
import GalleryApp from './apps/GalleryApp';
import ClockApp from './apps/ClockApp';
import ContactsApp from './apps/ContactsApp';
import NotesApp from './apps/NotesApp';
import NightApp from './apps/NightApp';
import SettingsApp from './apps/SettingsApp';
import VoteApp from './apps/VoteApp';
import WeatherApp from './apps/WeatherApp';

/**
 * The DEEP BLUE phone: a guest's whole game, as an iPhone-era home screen.
 *
 * The phone never opens an app by itself, and never explains a rule
 * (decided 2026-10-02: players discover the game). A phase change nudges
 * instead: a chapter card marks the turn of the day, a banner says something
 * happened ("The board is up."), a badge sits on the app that wants you, and
 * the NowCard at the top of the home screen opens it if tapped. A few
 * moments still take the whole screen, because a real phone does that too:
 * the role text at casting, the alarm every morning, the recruit call, and
 * your own death.
 *
 * What the room hasn't been told yet, this phone doesn't show: a death lands
 * in the data a few seconds before the reveal plays, so the roster (and your
 * own status) is masked until the reveal's beat (beats.js).
 */

/** The app a phase is about. Only ever opened by a tap: the NowCard, a banner, a badge. */
const SUGGEST = {
  lobby: 'deepblue',
  night: 'night',
  recruit: 'night',
  alarm: 'deepblue',
  game: 'deepblue',
  game_locked: 'deepblue',
  dawn: 'news',
  investigation: 'gallery',
  roundtable: 'vote',
  revote: 'vote',
  endgame: 'vote',
  banish: 'news',
  finale: 'news',
};

/**
 * The banner a phase start drops on every phone. No names, ever: a banner
 * lands with the phase, which for the board and the verdict is seconds
 * before the reveal says who (beats.js).
 */
const PHASE_BANNER = {
  game: (g, pack) => ({ icon: 'deepblue', title: 'DEEP BLUE', text: `${dayKit(pack).dayGames[g.minigame ?? 'run']?.title ?? 'The run'} has started.`, app: 'deepblue' }),
  dawn: () => ({ icon: 'news', title: 'News', text: 'The board is up.', app: 'news' }),
  banish: () => ({ icon: 'news', title: 'News', text: 'The verdict is in.', app: 'news' }),
  finale: () => ({ icon: 'news', title: 'News', text: 'It’s over.', app: 'news' }),
  roundtable: () => ({ icon: 'messages', title: 'The Room', text: 'DEEP BLUE created a poll', app: 'vote' }),
  revote: () => ({ icon: 'messages', title: 'The Room', text: 'DEEP BLUE created a new poll', app: 'vote' }),
  endgame: () => ({ icon: 'messages', title: 'The Room', text: 'DEEP BLUE created a poll', app: 'vote' }),
};

/** Phases that open with a chapter card (takeovers.jsx). */
const CHAPTERS = new Set(['night', 'investigation', 'roundtable', 'endgame']);

const GRID = [['clock', 'Clock'], ['contacts', 'Contacts'], ['night', 'Night'], ['weather', 'Weather'], ['settings', 'Settings']];
const DOCK = [['messages', 'Messages'], ['deepblue', 'DEEP BLUE'], ['news', 'News'], ['gallery', 'Photos']];

const APPS = {
  messages: MessagesApp,
  deepblue: GameApp,
  news: NewsApp,
  gallery: GalleryApp,
  clock: ClockApp,
  contacts: ContactsApp,
  notes: NotesApp,
  night: NightApp,
  settings: SettingsApp,
  vote: VoteApp,
  weather: WeatherApp,
};

/** How far (px) a pull must travel before release decides it should finish opening. */
const NC_PULL_DIST = 110;

/**
 * The phone's frame: status bar, the stage, the home button, and the
 * Notification Center dragged down from the status bar. Also used before a
 * guest exists. On a phone it tracks the visual viewport, so when the
 * keyboard opens the compose bar rides up above it instead of hiding under it.
 */
export function PhoneFrame({ game, ghost, clear, onHome = () => {}, onOpenApp = () => {}, children, stageRef, time = 'day', sections = [], locked = false }) {
  const root = useRef(null);
  const [kbd, setKbd] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const fit = () => {
      const el = root.current;
      if (!el) return;
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
      el.style.bottom = 'auto';
      setKbd(vv.height < window.innerHeight * 0.78);
    };
    fit();
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
    return () => {
      vv.removeEventListener('resize', fit);
      vv.removeEventListener('scroll', fit);
    };
  }, []);

  // Pin the page itself. iOS Safari ignores `overscroll-behavior` on the
  // document and rubber-bands the whole fixed phone, so the CSS lock
  // (`html.os-locked`) is paired with a touchmove veto: a drag is allowed only
  // inside an element that can really scroll that way (an `.os-scroll` list,
  // a textarea); anywhere else it is cancelled.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('os-locked');
    const canScroll = (el, dy) => {
      for (let n = el; n && n !== html; n = n.parentElement) {
        const oy = getComputedStyle(n).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight) {
          if (dy > 0 && n.scrollTop > 0) return true; // finger down: content moves down, needs room above
          if (dy < 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        }
      }
      return false;
    };
    let startY = 0;
    const onStart = (e) => { startY = e.touches[0]?.clientY ?? 0; };
    const onMove = (e) => {
      if (e.touches.length > 1) { e.preventDefault(); return; } // pinch
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (!canScroll(e.target, dy)) e.preventDefault();
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      html.classList.remove('os-locked');
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
    };
  }, []);

  // --- Notification Center: dragged down from the status bar. `ncPull` is the
  // live 0..1 position while a finger is down; `ncOpen` is where it lands.
  // Locked (a takeover is showing) closes it and ignores the gesture, so a
  // player can't pull into Messages mid-reveal.
  const [ncOpen, setNcOpen] = useState(false);
  const [ncPull, setNcPull] = useState(null);
  const ncDrag = useRef(null);
  // A takeover arriving (e.g. a death reveal) closes the panel — adjusted
  // during render, the documented way to react to a changed input without an
  // effect: https://react.dev/learn/you-might-not-need-an-effect
  const [wasLocked, setWasLocked] = useState(locked);
  if (locked !== wasLocked) {
    setWasLocked(locked);
    if (locked) setNcOpen(false);
  }
  const ncClose = () => setNcOpen(false);
  const ncDown = (e) => {
    if (locked || ncOpen) return;
    ncDrag.current = { y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const ncMove = (e) => {
    if (!ncDrag.current) return;
    const dy = Math.max(0, e.clientY - ncDrag.current.y);
    setNcPull(Math.min(1, dy / NC_PULL_DIST));
  };
  const ncUp = (e) => {
    if (!ncDrag.current) return;
    const dy = Math.max(0, e.clientY - ncDrag.current.y);
    ncDrag.current = null;
    setNcOpen(dy > 6 ? dy > NC_PULL_DIST * 0.35 : true);
    setNcPull(null);
  };

  return (
    <div ref={root} className={`os-root ${kbd ? 'os-root--kbd' : ''}`} data-time={time}>
      <StatusBar game={game} ghost={ghost} clear={clear} drag={{ onPointerDown: ncDown, onPointerMove: ncMove, onPointerUp: ncUp, onPointerCancel: ncUp }} />
      <div ref={stageRef} className="os-stage">
        {children}
        <NotificationCenter sections={sections} open={ncOpen} pull={ncPull} onOpen={onOpenApp} onClose={ncClose} />
      </div>
      <HomeBar onHome={onHome} />
    </div>
  );
}

export default function PhoneOS({ gid, uid, game, me: realMe, role, players: realPlayers, inbox, pack, nameOf }) {
  const phase = game.phase;
  const { players } = useMaskedPlayers(realPlayers, game);
  const me = { ...(players.find((p) => p.id === realMe.pid) ?? realMe), pid: realMe.pid };
  const isKiller = role?.role === 'killer' && me.status === 'alive';
  const spiritsOk = me.status === 'ghost' || (role?.role === 'medium' && me.status === 'alive');

  // One listener per channel for the whole phone; apps get the lists from ctx.
  const chat = useChannel(gid, 'chat');
  const spirits = useChannel(gid, 'mediumChat', spiritsOk);
  const den = useChannel(gid, 'denChat', isKiller);
  // The Killers' group: who is in it, and when DEEP BLUE added them (threads.js).
  const mates = useKillerGroup(gid, isKiller);
  const myVote = useMyVote(gid, game.ballot, me.pid);
  const myScore = useMyScore(gid, game.cycle, me.pid);
  const action = useMyAction(gid, game.cycle, me.pid);
  const denPicks = useDen(gid, game.cycle, isKiller && phase === 'night');
  // Everyone's arrival answers (Contacts, Notes). Frozen at the deal, so this listener is nearly silent.
  const traits = useAllTraits(gid);

  // --- Which app is open: only ever the guest's choice. A phase change leaves
  // it alone and decides whether a chapter card plays: only for a phase that
  // began moments ago.
  const phaseKey = `${phase}:${game.cycle}:${game.ballot ?? ''}`;
  const phaseAt = Math.max(game.revealAt || 0, game.phaseStartedAt || 0);
  const freshPhase = () => serverNow() - phaseAt < 3500;
  const [nav, setNav] = useState({ app: null, key: phaseKey, origin: '50% 50%', chapter: null, thread: null });
  if (nav.key !== phaseKey) {
    setNav({ ...nav, key: phaseKey, chapter: CHAPTERS.has(phase) && freshPhase() ? phaseKey : null });
  }
  const current = nav.key === phaseKey ? nav : { ...nav, chapter: null };
  const app = current.app;

  // Closing an app zooms it back into its icon; the element stays mounted until the zoom ends.
  const [closing, setClosing] = useState(null);
  const stageRef = useRef(null);
  // `thread` opens Messages straight into one conversation (a banner from it).
  const open = (name, point, thread = null) => {
    let origin = '50% 50%';
    const r = stageRef.current?.getBoundingClientRect();
    if (point && r) origin = `${((point.x - r.left) / r.width) * 100}% ${((point.y - r.top) / r.height) * 100}%`;
    setClosing(null);
    setNav({ ...current, app: name, key: phaseKey, origin, thread });
  };
  const home = () => {
    if (!app) return;
    sfxLock();
    if (!prefersLessMotion()) setClosing(app);
    setNav({ ...current, app: null, key: phaseKey });
  };

  // --- Takeovers, each dismissed per day (or per casting).
  const [unlocked, setUnlocked] = useState(false);
  const [alarmOff, setAlarmOff] = useState(null);
  const [roleRead, setRoleRead] = useState(false);
  const [homeIn, setHomeIn] = useState(0); // bump to replay the home screen's entrance
  const offered = inbox.some((d) => d.kind === 'recruitOffer' && d.cycle === game.cycle);

  // Your own death: once, and only after the room has watched it happen.
  const takenSeen = useSeen(`${gid}.taken`, 0);
  const died = realMe.status === 'ghost' && ['murdered', 'deep', 'banished'].includes(realMe.cause) && takenSeen !== realMe.diedCycle;
  const takenAt = died && realMe.diedCycle === game.cycle
    ? (phase === 'dawn' ? game.revealAt + (BOARD_BEAT.full + 2) * 1000 : phase === 'banish' ? game.revealAt + (VERDICT_BEAT.votes + 1.5) * 1000 : 0)
    : 0;
  const nowTaken = useServerNow(takenAt, 250);
  const showTaken = died && (!takenAt || nowTaken >= takenAt);

  // --- Read marks and badges.
  const seen = {
    room: useSeen(`${gid}.read.room`, 0),
    spirits: useSeen(`${gid}.read.spirits`, 0),
    den: useSeen(`${gid}.read.den`, 0),
    deepblue: useSeen(`${gid}.read.deepblue`, 0),
    unknown: useSeen(`${gid}.read.unknown`, 0),
  };
  const gallerySeen = useSeen(`${gid}.gallery`, []);
  // The paper is one shared view for the badge and the app (news.js). Opening
  // News marks everything on the page as seen; the app keeps its own per-story dots.
  const news = useNews(game, pack, nameOf);
  const newsSeen = useSeen(`${gid}.news`, []);
  const newsKey = news.ids.join('|');
  useEffect(() => {
    if (app === 'news') markSeen(`${gid}.news`, newsKey ? newsKey.split('|') : []);
  }, [app, gid, newsKey]);

  // DEEP BLUE's own lines to this guest (voice.js), shown in its Messages thread.
  const voice = useVoice(gid, game, me, pack, nameOf);

  const ctxBase = { gid, uid, game, me, role, players, inbox, pack, nameOf, chat, spirits, den, mates: isKiller ? mates : null, myVote, myScore, news, traits, voice };
  const threads = threadsFor(ctxBase, seen);
  const acted = isKiller ? (denPicks ?? []).some((d) => d.pid === me.pid && (d.victim || d.recruit)) : Boolean(action);
  const needsNight = phase === 'night' && ['alive', 'ghost'].includes(me.status) && !acted;
  const needsVote = ['roundtable', 'revote'].includes(phase) ? me.status === 'alive' && !myVote : phase === 'endgame' && ['alive', 'ghost'].includes(me.status) && !myVote;
  const newsSeenArr = Array.isArray(newsSeen) ? newsSeen : [];
  const badges = {
    messages: threads.reduce((n, t) => n + t.unread, 0) || null,
    gallery: inbox.filter((d) => d.kind === 'fact' && !gallerySeen.includes(d.id)).length || null,
    news: news.ids.filter((id) => !newsSeenArr.includes(id)).length || null,
    night: needsNight ? '!' : null,
    deepblue: phase === 'game' && !myScore ? '!' : null,
  };

  // --- Notification Center: unread only, grouped by app (chrome.jsx). Every
  // row reopens the same app its badge would, then the panel puts itself
  // away — nothing here tracks "seen" a second time; threads.js, news.js and
  // the gallery's own ledger already own that.
  const NC_LIMIT = 6;
  const ncMessages = threads
    .flatMap((t) => t.unreadList.map((m) => ({
      id: `msg:${t.id}:${m.id}`,
      at: m.at ?? 0,
      icon: t.icon,
      tile: t.icon ? undefined : <NCTile glyph="eye" bg="linear-gradient(#5f6671, #232730)" />,
      title: t.title,
      text: threadPreview(t.id, m, ctxBase),
      app: 'messages',
    })))
    .sort((a, b) => b.at - a.at)
    .slice(0, NC_LIMIT);
  const ncPhotos = inbox
    .filter((d) => d.kind === 'fact' && !gallerySeen.includes(d.id))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .slice(0, NC_LIMIT)
    .map((d) => ({ id: d.id, icon: 'gallery', title: 'Photos', text: `New photo · ${photoSource(d)}`, app: 'gallery' }));
  const ncNews = news.all
    .filter((s) => !newsSeenArr.includes(s.id))
    .slice(0, NC_LIMIT)
    .map((s) => ({ id: s.id, icon: 'news', title: s.kicker || 'News', text: s.head, app: 'news' }));
  const ncAction = [
    needsNight && { id: 'need-night', icon: 'night', title: 'Night', text: 'Choose your move before it ends.', app: 'night' },
    needsVote && { id: 'need-vote', tile: <NCTile glyph="vote" bg="linear-gradient(#4a9bf5, #0b6fe3)" />, title: 'Vote', text: 'Cast your ballot before it closes.', app: 'vote' },
  ].filter(Boolean);
  const sections = [
    { key: 'action', title: 'Needs You', rows: ncAction },
    { key: 'messages', title: 'Messages', rows: ncMessages },
    { key: 'photos', title: 'Photos', rows: ncPhotos },
    { key: 'news', title: 'News', rows: ncNews },
  ];

  // --- Banner: the newest arrival since this phone opened, unless you're
  // looking at it. A burst (the morning's photos) reads as one line. A phase
  // start is an arrival too (PHASE_BANNER): it is how the board, the vote and
  // the morning game find a guest, now that nothing opens by itself.
  const [mountAt] = useState(() => serverNow());
  const myPid = me.pid;
  const banner = (() => {
    const fresh = [];
    const phaseNote = PHASE_BANNER[phase]?.(game, pack);
    if (phaseNote && phaseAt > mountAt && app !== phaseNote.app) {
      fresh.push({ id: `phase:${phaseKey}`, at: phaseAt, kind: 'phase', ...phaseNote });
    }
    for (const d of inbox) {
      // The day's word arrives with the alarm and is shown in the game itself, never on a banner.
      if ((d.at ?? 0) <= mountAt || ['recruitOffer', 'word', 'draw'].includes(d.kind)) continue;
      const photo = d.kind === 'fact';
      if (photo && app === 'gallery') continue;
      fresh.push({ id: d.id, at: d.at, icon: photo ? 'gallery' : 'messages', title: photo ? 'Photos' : 'DEEP BLUE', text: photo ? `New photo · ${photoSource(d)}` : deliveryLine(d, nameOf), app: photo ? 'gallery' : 'messages', kind: photo ? 'photo' : 'system' });
    }
    if (app !== 'messages') {
      for (const t of threads) {
        if (!['room', 'spirits', 'den'].includes(t.id)) continue;
        for (const m of t.list) {
          if ((m.at ?? 0) <= mountAt || (m.pid && m.pid === myPid)) continue;
          fresh.push({ id: m.id, at: m.at, icon: 'messages', title: t.title, text: threadPreview(t.id, m, ctxBase), app: 'messages', thread: t.id === 'room' ? null : t.id, kind: t.id });
        }
      }
    }
    fresh.sort((a, b) => b.at - a.at);
    const top = fresh[0];
    if (!top) return null;
    const burst = fresh.filter((x) => x.kind === top.kind && top.at - x.at < 3000).length;
    if (burst < 2) return top;
    const what = top.kind === 'photo' ? 'new photos' : top.kind === 'system' ? 'messages from DEEP BLUE' : 'new messages';
    return { ...top, text: `${burst} ${what}` };
  })();

  // Each banner plays once. Leaving the app that hid it (Messages, say) must
  // not replay an old one, so the shown ids are remembered and only a new
  // one takes the slot. Adjusted during render, like `wasLocked` above.
  const [shownBanner, setShownBanner] = useState({ ids: [], current: null });
  if (banner && !shownBanner.ids.includes(banner.id)) {
    setShownBanner({ ids: [...shownBanner.ids.slice(-60), banner.id], current: banner });
  }
  const bannerNow = shownBanner.current;
  useEffect(() => {
    if (bannerNow) sfxPing();
  }, [bannerNow]);

  // Browsers only let audio start from a gesture: the first tap anywhere unlocks it.
  useEffect(() => {
    window.addEventListener('pointerdown', primeSfx, { once: true });
    return () => window.removeEventListener('pointerdown', primeSfx);
  }, []);

  const ctx = { ...ctxBase, open: (name) => open(name), close: home };
  const ghost = me.status === 'ghost';
  const label = (PHASE_LABEL[phase] ?? '').toUpperCase();
  // Role-neutral on purpose: the home screen is what the guest beside you sees.
  const line = nowLine({ phase, status: me.status, hasActed: acted && phase === 'night', cycle: game.cycle, minigame: game.minigame ?? 'run', pack });
  const suggested = SUGGEST[phase] ?? null;

  // --- What takes the whole screen right now.
  let takeover = null;
  if (me.status === 'vanished') takeover = <GoneScreen />;
  else if (showTaken) takeover = <TakenScreen me={realMe} onDone={() => { markSeen(`${gid}.taken`, realMe.diedCycle); setHomeIn((n) => n + 1); }} />;
  else if (phase === 'casting' && !roleRead) takeover = <RoleText game={game} role={role} onDone={() => { setRoleRead(true); setHomeIn((n) => n + 1); }} />;
  else if (phase === 'alarm' && alarmOff !== game.cycle) takeover = <AlarmScreen game={game} pack={pack} onStop={() => { setAlarmOff(game.cycle); setHomeIn((n) => n + 1); }} />;
  else if (phase === 'recruit' && offered && me.status === 'alive') takeover = <IncomingCall gid={gid} game={game} me={me} />;
  else if (phase === 'lobby' && !unlocked) {
    const here = players.filter((p) => p.status === 'alive').length;
    takeover = (
      <LockScreen
        game={game}
        title={pack.title.toUpperCase()}
        subtitle={`Hi ${me.name}.`}
        notes={[
          { key: 'in', icon: 'deepblue', title: 'DEEP BLUE', text: 'You’re in. The host will deal the roles soon.' },
          { key: 'room', icon: 'contacts', title: 'THE ROOM', text: `${here} ${here === 1 ? 'guest has' : 'guests have'} arrived.` },
          ...pack.setting.slice(0, 2).map((t, i) => ({ key: `s${i}`, icon: 'news', title: 'THE STORY', text: t })),
        ]}
        sliderLabel="slide to unlock"
        onUnlock={() => { setUnlocked(true); setHomeIn((n) => n + 1); }}
      />
    );
  }

  const shown = app ?? closing;
  const App = shown ? APPS[shown] : null;
  return (
    <PhoneFrame game={game} ghost={ghost} clear={!app || Boolean(takeover)} onHome={home} onOpenApp={open} stageRef={stageRef} time={timeOfDay(phase)} sections={sections} locked={Boolean(takeover)}>
      <HomeScreen
        key={homeIn}
        entering={homeIn > 0}
        grid={GRID}
        dock={DOCK}
        badges={badges}
        ghost={ghost}
        onOpen={open}
        now={{ label: dayLabel(game, label), line, urgent: needsNight || needsVote, onTap: () => suggested && open(suggested) }}
      />
      {App && (
        <div
          key={shown}
          className={`os-fill ${app ? 'os-app-enter' : 'os-app-exit'}`}
          style={{ '--os-origin': current.origin }}
          onAnimationEnd={(e) => { if (!app && e.target === e.currentTarget) setClosing(null); }}
        >
          <App ctx={ctx} onClose={home} thread={current.thread} />
        </div>
      )}
      {!takeover && current.chapter && <ChapterCard key={current.chapter} game={game} pack={pack} />}
      {takeover}
      {!takeover && bannerNow && (
        <Banner key={bannerNow.id} icon={bannerNow.icon} title={bannerNow.title} text={bannerNow.text} onOpen={() => open(bannerNow.app, null, bannerNow.thread ?? null)} />
      )}
    </PhoneFrame>
  );
}
