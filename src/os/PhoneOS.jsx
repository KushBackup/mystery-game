import React, { useEffect, useRef, useState } from 'react';
import { useChannel, useMyVote, useMyScore, useMyAction, useDen, useServerNow } from '../hooks/useKillers';
import { serverNow } from '../lib/clockSkew';
import { nowLine, PHASE_LABEL, deliveryLine } from '../data/killersCopy';
import { StatusBar, HomeBar, HomeScreen, LockScreen, Banner } from './chrome';
import { AlarmScreen, RoleText, IncomingCall, GoneScreen, ChapterCard, TakenScreen } from './takeovers';
import { threadsFor } from './threads';
import { useSeen, markSeen } from './seen';
import { useNews } from './news';
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

/**
 * The DEEP BLUE phone: a guest's whole game, as an iPhone-era home screen.
 *
 * The phase drives the phone the way the host drives the room. Each phase
 * opens the app it belongs to (the Night app at night, the game for the run,
 * News for the board, the poll for the vote), a chapter card marks the turn
 * of the day, and a few moments take the whole screen: the role text at
 * casting, the alarm every morning, the recruit call, and your own death.
 * The Home button always goes home; the next phase change always brings the
 * right app back. A guest who never touches the home screen still plays the
 * whole game.
 *
 * What the room hasn't been told yet, this phone doesn't show: a death lands
 * in the data a few seconds before the reveal plays, so the roster (and your
 * own status) is masked until the reveal's beat (beats.js).
 */

const AUTO = {
  night: 'night',
  recruit: 'night',
  game: 'deepblue',
  game_locked: 'deepblue',
  dawn: 'news',
  roundtable: 'vote',
  revote: 'vote',
  endgame: 'vote',
  banish: 'news',
  finale: 'news',
};

/** Phases that open with a chapter card (takeovers.jsx). */
const CHAPTERS = new Set(['night', 'investigation', 'roundtable', 'endgame']);

const GRID = [['clock', 'Clock'], ['contacts', 'Contacts'], ['notes', 'Notes'], ['night', 'Night'], ['settings', 'Settings']];
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
};

/**
 * The phone's frame: status bar, the stage, the home button. Also used before
 * a guest exists. On a phone it tracks the visual viewport, so when the
 * keyboard opens the compose bar rides up above it instead of hiding under it.
 */
export function PhoneFrame({ game, ghost, clear, onHome = () => {}, children, stageRef, time = 'day' }) {
  const root = useRef(null);
  const [kbd, setKbd] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const fit = () => {
      const el = root.current;
      if (!el || window.matchMedia('(min-width: 640px) and (min-height: 700px)').matches) return;
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
  return (
    <div ref={root} className={`os-root ${kbd ? 'os-root--kbd' : ''}`} data-time={time}>
      <StatusBar game={game} ghost={ghost} clear={clear} />
      <div ref={stageRef} className="os-stage">{children}</div>
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
  const myVote = useMyVote(gid, game.ballot, me.pid);
  const myScore = useMyScore(gid, game.cycle, me.pid);
  const action = useMyAction(gid, game.cycle, me.pid);
  const denPicks = useDen(gid, game.cycle, isKiller && phase === 'night');

  // --- Which app is open: the phase's app on every phase change, the guest's
  // choice in between. A phase change also decides whether a chapter card
  // plays: only for a phase that began moments ago.
  const phaseKey = `${phase}:${game.cycle}:${game.ballot ?? ''}`;
  const freshPhase = () => serverNow() - Math.max(game.revealAt || 0, game.phaseStartedAt || 0) < 3500;
  const [nav, setNav] = useState({ app: AUTO[phase] ?? null, key: phaseKey, origin: '50% 50%', chapter: null });
  if (nav.key !== phaseKey) {
    setNav({ app: phase in AUTO ? AUTO[phase] : nav.app, key: phaseKey, origin: '50% 50%', chapter: CHAPTERS.has(phase) && freshPhase() ? phaseKey : null });
  }
  const current = nav.key === phaseKey ? nav : { ...nav, app: phase in AUTO ? AUTO[phase] : nav.app, chapter: null };
  const app = current.app;

  // Closing an app zooms it back into its icon; the element stays mounted until the zoom ends.
  const [closing, setClosing] = useState(null);
  const stageRef = useRef(null);
  const open = (name, point) => {
    let origin = '50% 50%';
    const r = stageRef.current?.getBoundingClientRect();
    if (point && r) origin = `${((point.x - r.left) / r.width) * 100}% ${((point.y - r.top) / r.height) * 100}%`;
    setClosing(null);
    setNav({ ...current, app: name, key: phaseKey, origin });
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

  const ctxBase = { gid, uid, game, me, role, players, inbox, pack, nameOf, chat, spirits, den, myVote, myScore, news };
  const threads = threadsFor(ctxBase, seen);
  const acted = isKiller ? (denPicks ?? []).some((d) => d.pid === me.pid && (d.victim || d.recruit)) : Boolean(action);
  const needsNight = phase === 'night' && ['alive', 'ghost'].includes(me.status) && !acted;
  const needsVote = ['roundtable', 'revote'].includes(phase) ? me.status === 'alive' && !myVote : phase === 'endgame' && ['alive', 'ghost'].includes(me.status) && !myVote;
  const badges = {
    messages: threads.reduce((n, t) => n + t.unread, 0) || null,
    gallery: inbox.filter((d) => d.kind === 'fact' && !gallerySeen.includes(d.id)).length || null,
    news: news.ids.filter((id) => !(Array.isArray(newsSeen) ? newsSeen : []).includes(id)).length || null,
    night: needsNight ? '!' : null,
    deepblue: phase === 'game' && !myScore ? '!' : null,
  };

  // --- Banner: the newest arrival since this phone opened, unless you're
  // looking at it. A burst (the morning's photos) reads as one line.
  const [mountAt] = useState(() => serverNow());
  const myPid = me.pid;
  const banner = (() => {
    const fresh = [];
    for (const d of inbox) {
      if ((d.at ?? 0) <= mountAt || d.kind === 'recruitOffer') continue;
      const photo = d.kind === 'fact';
      if (photo && app === 'gallery') continue;
      fresh.push({ id: d.id, at: d.at, icon: photo ? 'gallery' : 'messages', title: photo ? 'Photos' : 'DEEP BLUE', text: photo ? `New photo · ${photoSource(d)}` : deliveryLine(d, nameOf), app: photo ? 'gallery' : 'messages', kind: photo ? 'photo' : 'system' });
    }
    if (app !== 'messages') {
      for (const [list, title] of [[chat, 'The Room'], [spirits, 'Spirits']]) {
        for (const m of list ?? []) {
          if ((m.at ?? 0) <= mountAt || m.pid === myPid) continue;
          fresh.push({ id: m.id, at: m.at, icon: 'messages', title, text: `${m.name}: ${m.text}`, app: 'messages', kind: title });
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

  const lastBanner = useRef(null);
  useEffect(() => {
    if (banner && banner.id !== lastBanner.current) sfxPing();
    lastBanner.current = banner?.id ?? null;
  }, [banner]);

  // Browsers only let audio start from a gesture: the first tap anywhere unlocks it.
  useEffect(() => {
    window.addEventListener('pointerdown', primeSfx, { once: true });
    return () => window.removeEventListener('pointerdown', primeSfx);
  }, []);

  const ctx = { ...ctxBase, open: (name) => open(name), close: home };
  const ghost = me.status === 'ghost';
  const label = (PHASE_LABEL[phase] ?? '').toUpperCase();
  const line = phase === 'lobby'
    ? 'You’re in. While you wait for the host, practise DEEP BLUE.'
    : nowLine({ phase, role: role?.role, status: me.status, isRecruitTarget: offered, hasActed: acted && phase === 'night' });
  const suggested = AUTO[phase] ?? (phase === 'lobby' ? 'deepblue' : phase === 'investigation' ? 'gallery' : null);

  // --- What takes the whole screen right now.
  let takeover = null;
  if (me.status === 'vanished') takeover = <GoneScreen />;
  else if (showTaken) takeover = <TakenScreen me={realMe} onDone={() => { markSeen(`${gid}.taken`, realMe.diedCycle); setHomeIn((n) => n + 1); }} />;
  else if (phase === 'casting' && !roleRead) takeover = <RoleText game={game} gid={gid} role={role} nameOf={nameOf} onDone={() => { setRoleRead(true); setHomeIn((n) => n + 1); }} />;
  else if (phase === 'alarm' && alarmOff !== game.cycle) takeover = <AlarmScreen game={game} pack={pack} onStop={() => { setAlarmOff(game.cycle); open('deepblue'); }} />;
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
    <PhoneFrame game={game} ghost={ghost} clear={!app || Boolean(takeover)} onHome={home} stageRef={stageRef} time={timeOfDay(phase)}>
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
          <App ctx={ctx} onClose={home} />
        </div>
      )}
      {!takeover && current.chapter && <ChapterCard key={current.chapter} game={game} pack={pack} />}
      {takeover}
      {!takeover && banner && (
        <Banner key={banner.id} icon={banner.icon} title={banner.title} text={banner.text} onOpen={() => open(banner.app)} />
      )}
    </PhoneFrame>
  );
}
