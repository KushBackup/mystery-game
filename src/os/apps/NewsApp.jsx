import React, { useEffect, useRef, useState } from 'react';
import { AppFrame, Section, Group, Cell, Hold, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import { Avatar } from './ContactsApp';
import { useServerNow } from '../../hooks/useKillers';
import { narrate } from '../../data/packs/index.js';
import { ROLE_INFO } from '../../lib/engine/roles.js';
import { sfxFanfare, sfxGlitch, sfxSting, sfxPing, sfxTick } from '../sfx';
import { BOARD_BEAT, VERDICT_BEAT } from '../beats';
import NewsPaper from './NewsPaper';

/**
 * News: where the room finds out.
 *
 *   dawn     the leaderboard reveal. Every phone holds on "posting the
 *            board" until the same instant, then plays the same beats: the
 *            podium, a pause on "…and last place", and the bottom row
 *            corrupting into TAKEN. Then the whole board, to argue over.
 *   banish   the verdict: the name, then a beat later KILLER or innocent,
 *            then who voted for whom.
 *   finale   the special edition.
 *   else     the paper (NewsPaper.jsx): world stories by day, plus every
 *            morning and every vote so far, printed as articles (news.js).
 *
 * Sounds only play for a beat reached while the app is open, so opening
 * News five minutes later doesn't replay the fanfare.
 */

/** Seconds after `revealAt` at which each beat of the board lands. */
const BEAT = BOARD_BEAT;

function useStage(revealAt, beats) {
  const now = useServerNow(revealAt ? revealAt + (Math.max(...Object.values(beats)) + 1) * 1000 : 0, 100);
  if (!revealAt) return 'full';
  const t = (now - revealAt) / 1000;
  if (t < 0) return 'hold';
  let stage = 'hold';
  for (const [name, at] of Object.entries(beats).sort((a, b) => a[1] - b[1])) if (t >= at) stage = name;
  return stage;
}

/** Run `fx[stage]` when a stage is *reached* while mounted, never for the stage we mounted into. */
function useStageSounds(stage, fx) {
  const prev = useRef(undefined);
  useEffect(() => {
    if (prev.current === undefined) {
      prev.current = stage;
      return;
    }
    if (prev.current !== stage) {
      prev.current = stage;
      fx[stage]?.();
    }
  });
}

export default function NewsApp({ ctx, onClose }) {
  const { game } = ctx;
  // 'auto' plays the phase's reveal if it has one and the paper otherwise; the
  // guest can step from the reveal into the paper, and from there to the board.
  const [view, setView] = useState('auto');
  const live = view === 'auto' && ['dawn', 'banish', 'finale'].includes(game.phase);

  if (view === 'board' && game.board) {
    return (
      <AppFrame title="Latest board" onBack={() => setView('paper')} backLabel="Paper" tone="dark" dark>
        <BoardList ctx={ctx} />
      </AppFrame>
    );
  }
  if (!live) {
    return <NewsPaper ctx={ctx} onBack={view === 'paper' ? () => setView('auto') : onClose} backLabel={view === 'paper' ? 'Live' : 'Home'} onBoard={game.board && !ctx.news.held ? () => setView('board') : null} />;
  }

  const title = game.phase === 'banish' ? 'Breaking' : game.phase === 'finale' ? 'Special edition' : 'News';
  return (
    <AppFrame title={title} onBack={onClose} tone={game.phase === 'banish' ? 'red' : 'dark'} dark right={<button type="button" className="os-barbtn" onClick={() => setView('paper')}>Paper</button>}>
      {game.phase === 'dawn' && <BoardReveal ctx={ctx} />}
      {game.phase === 'banish' && <BanishReveal key={game.ballot} ctx={ctx} />}
      {game.phase === 'finale' && <Finale ctx={ctx} />}
    </AppFrame>
  );
}

// --- The board ------------------------------------------------------------------------

function dawnLines(pack, d, nameOf) {
  if (!d) return [];
  const name = nameOf(d.taken ?? d.victims?.[0]);
  if (d.cause === 'rig') return narrate(pack, 'dawnRig', name, { score: d.rigged ?? 0 }, 'dawnDeath');
  if (d.cause === 'deep') return narrate(pack, 'dawnDeep', name, { saved: nameOf(d.attempted) }, 'dawnDeath');
  if (d.recruited) return narrate(pack, 'dawnRecruited');
  if (d.attempted) return narrate(pack, 'dawnSaved', nameOf(d.attempted));
  return narrate(pack, 'dawnQuiet');
}

function BoardReveal({ ctx }) {
  const { game, me, nameOf, pack, myScore, inbox } = ctx;
  const stage = useStage(game.revealAt, BEAT);
  useStageSounds(stage, { podium: sfxFanfare, last: sfxPing, taken: game.dawn?.taken ? sfxGlitch : sfxSting });
  useTicking(stage === 'last');

  if (stage === 'hold' || !game.board || !game.dawn) return <Hold label="POSTING THE BOARD…" />;
  const d = game.dawn;
  const rows = game.board.rows ?? [];
  const takenPid = d.taken ?? d.victims?.[0] ?? null;
  const takenRow = rows.find((r) => r.pid === takenPid);
  const lastRow = takenRow ?? rows.at(-1);
  const at = (s) => Object.keys(BEAT).indexOf(stage) >= Object.keys(BEAT).indexOf(s);
  const photos = inbox.filter((x) => x.kind === 'fact' && x.cycle === game.cycle).length;
  const iWasTaken = takenPid === me.pid;

  return (
    <div className="pb-8">
      <div className="text-center pt-5">
        <p className="os-label text-[12px] text-os-chrome">DEEP BLUE · DAY {game.board.cycle} · FINAL BOARD</p>
      </div>

      {/* The podium */}
      <div className="grid grid-cols-3 items-end gap-2 px-3 pt-4">
        {[1, 0, 2].map((i) => {
          const r = rows.filter((x) => x.pid !== takenPid)[i];
          if (!r) return <div key={i} />;
          return (
            <div key={r.pid} className="os-pop text-center" style={{ animationDelay: `${i * 350}ms` }}>
              <Avatar name={nameOf(r.pid)} size={i === 0 ? 52 : 40} />
              <p className="text-[14px] mt-1 truncate">{nameOf(r.pid)}</p>
              <div className="mt-1 mx-auto rounded-t-md bg-os-deep border border-os-chrome/30 grid place-items-center" style={{ height: [72, 52, 40][i] }}>
                <div>
                  <p className="os-arcade text-os-gold text-[18px]">{r.score}</p>
                  <p className="os-label text-[11px] text-os-chrome mt-1">#{i + 1}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last place */}
      {at('last') && (
        <div className="mx-3 mt-5 rounded-lg border border-os-red/50 bg-black/40 p-4 text-center os-rise">
          {!at('taken') ? (
            <p className="os-arcade text-[18px] text-white">…and last place</p>
          ) : takenPid ? (
            <div className="os-glitch">
              {d.cause === 'deep' && <p className="text-[14px] text-os-chrome mb-2">A firewall blocked the rig on {nameOf(d.attempted)}. So the deep took the lowest honest score.</p>}
              <div className="flex items-center justify-center gap-3">
                <Avatar name={nameOf(takenPid)} dead size={44} />
                <div className="text-left">
                  <p className="text-[22px] leading-tight os-rgb">{nameOf(takenPid)}</p>
                  <p className="os-arcade text-os-red text-[21px] mt-1"><Scramble to={lastRow?.score ?? 0} /></p>
                </div>
                <span className="os-taken">TAKEN</span>
              </div>
            </div>
          ) : (
            <p className="text-[18px]">{d.recruited ? 'Nobody was taken. But someone said yes to something.' : 'Nobody was taken this morning.'}</p>
          )}
        </div>
      )}

      {at('full') && (
        <div className="os-rise">
          <div className="px-4 pt-5 space-y-1">
            {dawnLines(pack, d, nameOf).map((l, i) => <p key={i} className={i ? 'text-[18px] leading-snug' : 'text-[15px] text-os-chrome'}>{l}</p>)}
            {d.vanished?.length > 0 && <p className="text-[15px] text-os-chrome pt-2">{d.vanished.map(nameOf).join(', ')} went home. Their secret went with them.</p>}
          </div>

          {iWasTaken && (
            <div className="mx-3 mt-4 rounded-lg bg-os-red/90 p-4 text-white">
              <p className="os-label text-[12px]">YOU WERE TAKEN</p>
              {d.cause === 'rig' ? (
                <p className="text-[22px] mt-2">Your real best was <b className="os-arcade text-[17px]">{myScore?.best ?? 0}</b>. The board says <b className="os-arcade text-[17px]">{lastRow?.score ?? 0}</b>. Someone rigged it. You're a ghost now: you still whisper, and you vote at the end.</p>
              ) : (
                <p className="text-[17px] mt-2">Yours was the lowest honest score. You're a ghost now: you still whisper, and you vote at the end.</p>
              )}
            </div>
          )}

          {photos > 0 && (
            <div className="px-3 mt-4">
              <Btn tone="green" onClick={() => ctx.open('gallery')}><Glyph name="photo" size={14} /> {photos} new {photos === 1 ? 'photo' : 'photos'} in Gallery</Btn>
            </div>
          )}

          <BoardList ctx={ctx} />
        </div>
      )}
    </div>
  );
}

/** The whole board, you highlighted, the taken row marked. Also used by the paper. */
function BoardList({ ctx }) {
  const { game, me, nameOf } = ctx;
  const [ghostsOpen, setGhostsOpen] = useState(false);
  const rows = game.board?.rows ?? [];
  const ghosts = game.board?.ghosts ?? [];
  const taken = game.dawn?.cycle === game.board?.cycle ? (game.dawn?.taken ?? game.dawn?.victims?.[0]) : null;
  return (
    <>
      <Section head={`Day ${game.board?.cycle ?? ''} board · ${rows.length} players`}>
        <div className="os-group os-group--dark !p-0">
          {rows.map((r) => (
            <div key={r.pid} className={`os-board-row ${r.pid === me.pid ? 'os-board-row--me' : ''} ${r.rank <= 3 && r.pid !== taken ? 'os-board-row--top' : ''} ${r.pid === taken ? 'os-board-row--dead' : ''}`}>
              <span className="os-board-rank">{r.rank <= 3 && r.pid !== taken ? <Glyph name={r.rank === 1 ? 'crown' : 'star'} size={14} /> : `#${r.rank}`}</span>
              <span className="truncate text-[16px]">{nameOf(r.pid)}{r.pid === me.pid ? ' (you)' : ''}{!r.played && r.pid !== taken ? <span className="text-os-chrome text-[13px]"> · didn’t play</span> : null}</span>
              <span className="flex items-center gap-2">{r.pid === taken && <span className="os-taken !text-[12px]">TAKEN</span>}<span className="os-board-score">{r.score}</span></span>
            </div>
          ))}
        </div>
      </Section>
      {ghosts.length > 0 && (
        <Section>
          <button type="button" className="os-btn os-btn--dark os-btn--sm" onClick={() => setGhostsOpen((v) => !v)}>{ghostsOpen ? 'Hide' : 'Show'} the ghost board ({ghosts.length})</button>
          {ghostsOpen && (
            <Group dark className="mt-2">
              {ghosts.map((r, i) => <Cell key={r.pid} title={`${i + 1}. ${nameOf(r.pid)}`} value={<span className="os-arcade text-[14px] text-os-chrome">{r.score}</span>} />)}
            </Group>
          )}
        </Section>
      )}
    </>
  );
}

// --- The verdict ------------------------------------------------------------------------

function BanishReveal({ ctx }) {
  const { game, pack, nameOf, me } = ctx;
  const stage = useStage(game.revealAt, VERDICT_BEAT);
  useStageSounds(stage, { name: sfxPing, verdict: game.banish?.team === 'killers' ? sfxGlitch : sfxSting });
  if (stage === 'hold' || !game.banish) return <Hold label="COUNTING THE VOTES…" />;
  const b = game.banish;
  if (!b.pid) {
    return <div className="px-5 pt-10 space-y-2">{narrate(pack, 'banishNone').map((l, i) => <p key={i} className="text-[20px]">{l}</p>)}</div>;
  }
  const killer = b.team === 'killers';
  const tally = Object.entries(b.tally ?? {}).sort((x, y) => y[1] - x[1]);
  const byTarget = Object.entries(b.votes ?? {}).reduce((acc, [voter, target]) => {
    (acc[target] ??= []).push(voter);
    return acc;
  }, {});
  const reached = (s) => ['name', 'verdict', 'votes'].indexOf(stage) >= ['name', 'verdict', 'votes'].indexOf(s);
  return (
    <div className="pb-8">
      <div className="text-center px-5 pt-8">
        <p className="os-label text-[12px] text-os-chrome">{b.pid === me.pid ? 'THE GROUP CHOSE YOU' : 'LOGGED OUT BY THE GROUP'}</p>
        <div className="mt-4 inline-block os-pop"><Avatar name={nameOf(b.pid)} size={72} /></div>
        <p className="text-[30px] mt-3 leading-tight os-pop">{nameOf(b.pid)}</p>
        {b.fromTie && <p className="text-[14px] text-os-chrome mt-1">Still tied after the re-vote. Fate chose.</p>}
        {reached('verdict') && (
          <div className="mt-6">
            <span className="os-verdict" style={{ color: killer ? 'var(--color-os-red)' : 'var(--color-os-green)' }}>{killer ? 'WAS A KILLER' : 'WAS INNOCENT'}</span>
            {!killer && b.role && b.role !== 'Faithful' && <p className="text-[16px] mt-3">The {b.role}.</p>}
          </div>
        )}
      </div>
      {reached('votes') && tally.length > 0 && (
        <Section head="Who voted for whom" className="os-rise">
          <Group dark>
            {tally.map(([pid, n]) => (
              <Cell key={pid} title={nameOf(pid)} sub={(byTarget[pid] ?? []).map(nameOf).join(', ')} value={<span className="os-arcade text-os-gold text-[16px]">{n}</span>} />
            ))}
          </Group>
        </Section>
      )}
    </div>
  );
}

// --- The finale ---------------------------------------------------------------------------

function Finale({ ctx }) {
  const { game, pack, players, nameOf } = ctx;
  const stage = useStage(game.revealAt, { show: 0 });
  useStageSounds(stage, { show: game.winner === 'faithful' ? sfxFanfare : sfxGlitch });
  if (stage === 'hold') return <Hold label="STOP THE PRESSES…" />;
  const faithfulWin = game.winner === 'faithful';
  const roles = game.finaleRoles ?? {};
  const killers = Object.keys(roles).filter((p) => roles[p] === 'killer');
  const specials = Object.keys(roles).filter((p) => ['doctor', 'detective', 'medium'].includes(roles[p]));
  const statusOf = (pid) => players.find((p) => p.id === pid)?.status;
  return (
    <div className="pb-10">
      <div className="os-paper mx-3 mt-4 p-4 text-center">
        <p className="os-label text-[12px] text-os-steel">THE DEEP TIMES · SPECIAL EDITION</p>
        <p className="os-arcade text-[26px] leading-snug mt-3" style={{ color: faithfulWin ? '#186a26' : 'var(--color-os-red)' }}>{faithfulWin ? 'FAITHFUL WIN' : 'KILLERS WIN'}</p>
        {narrate(pack, faithfulWin ? 'finaleFaithful' : 'finaleKillers').map((l, i) => <p key={i} className="text-[17px] mt-2">{l}</p>)}
      </div>
      <Section head="The Killers">
        <Group dark>
          {killers.map((p) => (
            <Cell key={p} icon={<Avatar name={nameOf(p)} size={32} />} title={nameOf(p)} sub={statusOf(p) === 'alive' ? 'Walked free' : statusOf(p) === 'vanished' ? 'Went home' : 'Caught'} />
          ))}
        </Group>
      </Section>
      {specials.length > 0 && (
        <Section head="Secret roles">
          <Group dark>{specials.map((p) => <Cell key={p} title={nameOf(p)} value={ROLE_INFO[roles[p]]?.label} />)}</Group>
        </Section>
      )}
    </div>
  );
}

/** A clock ticking under "…and last place", for as long as the pause lasts. */
function useTicking(on) {
  useEffect(() => {
    if (!on) return undefined;
    sfxTick();
    const id = setInterval(sfxTick, 380);
    return () => clearInterval(id);
  }, [on]);
}

/**
 * A number that spins through junk before it lands, the way the board
 * "recalculates" last place. Lands on `to` after ~0.8 s; reduced motion lands at once.
 */
function Scramble({ to }) {
  const [shown, setShown] = useState(() => (prefersLess() ? to : Math.floor(Math.random() * 90) + 10));
  useEffect(() => {
    if (prefersLess()) return undefined;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      if (n >= 10) {
        setShown(to);
        clearInterval(id);
      } else {
        setShown(Math.floor(Math.random() * 90) + 10);
      }
    }, 80);
    return () => clearInterval(id);
  }, [to]);
  return <span className="tabular-nums">{shown}</span>;
}

const prefersLess = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
