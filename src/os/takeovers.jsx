import React, { useEffect, useState } from 'react';
import AppIcon from './icons/AppIcon';
import Glyph from './icons/Glyph';
import Wallpaper from './art/Wallpaper';
import { SlideToUnlock } from './chrome';
import { useWorldClock } from './hooks';
import { hhmm } from './words';
import { Btn } from './ui';
import { useSyncedReveal, useKillerIds, useMyAction } from '../hooks/useKillers';
import { submitAction } from '../firebase/game';
import { ROLE_CARD } from '../data/killersCopy';
import { alarmLine, narrate } from '../data/packs/index.js';
import { startAlarm, stopAlarm, sfxSting, sfxPing, sfxDeny, sfxNightfall, sfxDaybreak, sfxStatic } from './sfx';

/**
 * Moments that take the whole phone, over any app: the morning alarm, the
 * role arriving at casting, and the Killers' recruit offer as a phone call.
 * Each one is synced to the room's shared `revealAt` instant.
 */

/**
 * The alarm. Every phone in the room rings on the same second, and the only
 * way out is to slide it off. It keeps vibrating even where the browser won't
 * let it make a sound yet (a phone nobody has touched since loading).
 */
export function AlarmScreen({ game, pack, onStop }) {
  const phase = useSyncedReveal(game.revealAt);
  const ringing = phase === 'show';
  const clock = useWorldClock(game);
  const [snoozed, setSnoozed] = useState(0);

  useEffect(() => {
    if (!ringing) return undefined;
    startAlarm();
    return stopAlarm;
  }, [ringing]);

  return (
    <div className="os-alarm">
      {ringing && <div className="os-alarm__flash" />}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className={ringing ? 'os-alarm__ring' : ''} style={{ opacity: ringing ? 1 : 0.6 }}>
          <AppIcon name="clock" size={112} />
        </div>
        <p className="text-[84px] leading-none font-extralight tracking-tight tabular-nums mt-6 text-white os-pixel-shadow">{clock}</p>
        <p className="os-label text-[12px] mt-3 text-os-chrome">ALARM · DAY {game.cycle}</p>
        <p className="text-[21px] leading-snug mt-4 text-white max-w-[300px] os-balance">{ringing ? alarmLine(pack, game.cycle) : 'Wake up…'}</p>
      </div>
      <div className="relative px-4 pb-5 pt-3 bg-gradient-to-b from-transparent to-black">
        {ringing && (
          <div className="text-center mb-4">
            {/* The joke teaches the rule: there is no getting out of the run. */}
            <button
              key={snoozed}
              type="button"
              className={`os-btn os-btn--dark os-btn--sm ${snoozed ? 'os-shake' : ''}`}
              onClick={() => { sfxDeny(); setSnoozed((n) => n + 1); }}
            >
              {snoozed ? 'DEEP BLUE does not snooze' : 'Snooze'}
            </button>
          </div>
        )}
        <SlideToUnlock label="slide to stop" tone="red" glyph="cross" onDone={() => { stopAlarm(); onStop(); }} />
        <p className="os-label text-[11px] text-os-chrome text-center mt-3">YOUR RUN STARTS WHEN THE ALARM ENDS</p>
      </div>
    </div>
  );
}

/**
 * Casting: the role arrives as a text from DEEP BLUE. The lock-screen beat
 * before it holds every phone on the same second, so a table flips together.
 */
export function RoleText({ game, gid, role, nameOf, onDone }) {
  const phase = useSyncedReveal(game.revealAt);
  const shown = phase === 'show' && Boolean(role);
  const isKiller = role?.role === 'killer';
  const mates = useKillerIds(gid, isKiller);

  useEffect(() => {
    if (shown) sfxSting();
  }, [shown]);

  if (!shown) {
    return (
      <div className="os-alarm">
        <Wallpaper variant="lock" />
        <div className="relative flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <AppIcon name="messages" size={72} />
          <p className="os-label text-[12px]">DEEP BLUE</p>
          <p className="text-[20px]">{role ? 'Dealing…' : 'A message is on its way…'}</p>
          <div className="os-spinner" />
        </div>
      </div>
    );
  }

  const card = ROLE_CARD[role.role] ?? ROLE_CARD.faithful;
  const partners = (mates ?? []).filter((p) => p !== role.id);
  return (
    <div className="os-alarm os-alarm--light os-pinstripe">
      <header className="os-nav"><span /><h1 className="os-nav__title">DEEP BLUE</h1><span /></header>
      <div className="os-scroll flex-1 os-thread">
        <p className="os-stamp-time">Today {hhmm(new Date())}</p>
        <div className="os-bubble-row os-rise"><div className="os-bubble">Welcome to DEEP BLUE. Read this alone.</div></div>
        <div className="os-bubble-row os-rise" style={{ animationDelay: '500ms' }}>
          <div className={`os-bubble ${isKiller ? 'os-bubble--alert' : ''}`} style={{ maxWidth: '88%' }}>
            <p className="os-label text-[12px] opacity-80">YOU ARE</p>
            <p className="os-arcade text-[29px] leading-tight my-2">{card.title.toUpperCase()}</p>
            <p className="text-[17px] leading-snug">{card.line}</p>
          </div>
        </div>
        <div className="os-bubble-row os-rise" style={{ animationDelay: '1000ms' }}><div className="os-bubble">{card.tip}</div></div>
        {isKiller && partners.length > 0 && (
          <div className="os-bubble-row os-rise" style={{ animationDelay: '1400ms' }}>
            <div className="os-bubble os-bubble--alert">Your partners: <b>{partners.map(nameOf).join(', ')}</b>. Find them in the Night app.</div>
          </div>
        )}
        <div className="px-2 pt-6 pb-4 os-rise" style={{ animationDelay: '1700ms' }}>
          <Btn onClick={onDone}>Got it. Tell no one.</Btn>
          <p className="text-center text-[13px] text-os-steel mt-2">You can reread it any time in Notes.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Recruit night, for the guest the Killers chose: an incoming call. Accept and
 * you play for them. Decline, or let it ring out, and you are their next score.
 */
export function IncomingCall({ gid, game, me }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const answer = (accept) => submitAction(gid, game.cycle, me.pid, { kind: 'recruitAnswer', accept }).then(sfxPing).catch((e) => console.warn('[recruit]', e.code ?? e.message));
  const said = action?.kind === 'recruitAnswer' ? action.accept : null;
  return (
    <div className="os-alarm">
      <Wallpaper variant="lock" />
      <div className="relative text-center pt-10 pb-6 bg-gradient-to-b from-black/80 to-transparent">
        <p className="os-label text-[11px] text-os-chrome">INCOMING CALL</p>
        <p className="os-arcade text-[34px] mt-3 text-white os-pixel-shadow">UNKNOWN</p>
        <p className="text-[16px] mt-2 text-os-foam">DEEP BLUE · admin</p>
      </div>
      <div className="relative flex-1 flex items-center justify-center px-6">
        <div className="os-notif max-w-[320px]">
          <div>
            <p className="os-notif__title">“WE WANT YOU.”</p>
            <p className="os-notif__text">Join the Killers and play for them from now on. Say no, or say nothing, and your score sinks tonight.</p>
          </div>
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-3 px-4 pb-6 pt-4 bg-gradient-to-t from-black to-transparent">
        <Btn tone="red" onClick={() => answer(false)}>{said === false ? '✓ Declined' : 'Decline'}</Btn>
        <Btn tone="green" onClick={() => answer(true)}>{said === true ? '✓ Joined' : 'Accept'}</Btn>
        <p className="col-span-2 text-center os-label text-[11px] text-os-chrome mt-1">YOU CAN CHANGE YOUR MIND UNTIL THE NIGHT ENDS</p>
      </div>
    </div>
  );
}

/** A guest who left: nothing to do, one kind line. */
export const GoneScreen = () => (
  <div className="os-alarm">
    <Wallpaper variant="lock" />
    <div className="relative flex-1 grid place-items-center px-8 text-center">
      <div>
        <p className="os-arcade text-[23px] text-white">SIGNED OUT</p>
        <p className="text-[18px] mt-4 text-os-foam">You left the game. Your secret left with you. Thanks for playing.</p>
      </div>
    </div>
  </div>
);

/**
 * A chapter card between phases: NIGHT 2, THE VOTE. It plays once, over
 * whatever is open, and fades itself out (os.css); the shell only mounts it
 * for a phase that started moments ago, so a phone opened late never sees a
 * stale one.
 */
const CHAPTERS = {
  night: (g, pack) => ({ title: `NIGHT ${g.cycle}`, sub: narrate(pack, 'night')[0], glyph: 'moon', sound: sfxNightfall }),
  investigation: () => ({ title: 'INVESTIGATE', sub: 'Check your photos. Ask about shoes, tops, glasses, drinks.', glyph: 'eye', sound: sfxDaybreak }),
  roundtable: () => ({ title: 'THE VOTE', sub: 'Who gets logged out?', glyph: 'vote', sound: sfxDaybreak }),
  endgame: (g) => ({ title: 'ENDGAME', sub: `Final vote ${g.endgameRound ?? 1}. The dead vote too.`, glyph: 'skull', sound: sfxNightfall }),
};

export function ChapterCard({ game, pack }) {
  const c = CHAPTERS[game.phase]?.(game, pack);
  useEffect(() => {
    c?.sound();
    // Plays once per mount; the shell keys this by phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!c) return null;
  return (
    <div className="os-chapter" aria-live="polite">
      <div className="text-os-foam">
        <div className="flex justify-center"><Glyph name={c.glyph} size={40} /></div>
        <p className="os-chapter__title mt-4">{c.title}</p>
        <div className="os-chapter__rule" />
        <p className="os-chapter__sub os-balance">{c.sub}</p>
      </div>
    </div>
  );
}

/**
 * Taken. The moment your own phone finds out you're dead: the signal dies in
 * static, then it tells you what a ghost can still do. Shown once per death,
 * only after the room has seen it on the board (beats.js), never before.
 */
export function TakenScreen({ me, onDone }) {
  const [lost, setLost] = useState(true);
  useEffect(() => {
    sfxStatic();
    const id = setTimeout(() => setLost(false), 1600);
    return () => clearTimeout(id);
  }, []);
  const banished = me.cause === 'banished';
  return (
    <div className="os-alarm overflow-hidden">
      <div className="os-static" style={{ opacity: lost ? 0.45 : 0.12 }} />
      <div className="relative flex-1 grid place-items-center px-7 text-center">
        {lost ? (
          <p className="os-arcade text-[26px] text-white os-rgb">SIGNAL LOST</p>
        ) : (
          <div className="os-rise">
            <div className="inline-grid place-items-center w-20 h-20 rounded-2xl bg-os-steel/40 text-os-foam"><Glyph name="ghost" size={44} /></div>
            <p className="os-arcade text-[23px] leading-snug mt-6 text-white">{banished ? 'LOGGED OUT' : 'TAKEN BY THE DEEP'}</p>
            <p className="text-[18px] leading-snug mt-4 text-os-foam os-balance">
              {banished ? 'The group voted you out.' : me.cause === 'deep' ? 'Yours was the lowest honest score.' : 'Someone rigged your score to the bottom.'} Your phone is haunted now.
            </p>
            <ul className="mt-5 space-y-2 text-left text-[16px] text-os-chrome">
              <li className="flex gap-3"><Glyph name="moon" size={16} /> Each night, whisper one word to one living guest.</li>
              <li className="flex gap-3"><Glyph name="chat" size={16} /> Talk to the Medium in Spirits. Read The Room.</li>
              <li className="flex gap-3"><Glyph name="vote" size={16} /> Vote in the Endgame. Your team still wins with you.</li>
            </ul>
            <div className="mt-7"><Btn tone="dark" onClick={onDone}>Continue as a ghost</Btn></div>
          </div>
        )}
      </div>
    </div>
  );
}
