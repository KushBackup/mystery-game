import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, Hold, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import { Face } from '../art/Portrait';
import { narrate } from '../../data/packs/index.js';
import { sfxGlitch, sfxSting, sfxPing } from '../sfx';
import { DAWN_BEAT, VERDICT_BEAT } from '../beats';
import NewsPaper from './NewsPaper';
import Finale from './Finale';
import { useStage, useStageSounds } from './stage';

/**
 * News: where the room finds out.
 *
 *   dawn     the morning news. Every phone holds until the same instant,
 *            then plays the same beats: "NIGHT n", who the Killers killed
 *            (or that nobody died), then the rest of the page. The morning
 *            game kills nobody and has no public board (2026-10-15).
 *   banish   the verdict: the name, then a beat later KILLER or innocent,
 *            then who voted for whom.
 *   finale   the special edition.
 *   else     the paper (NewsPaper.jsx): world stories by day, plus every
 *            morning and every vote so far, printed as articles (news.js).
 *
 * Sounds only play for a beat reached while the app is open, so opening
 * News five minutes later doesn't replay the fanfare.
 */

/** Seconds after `revealAt` at which each beat of the morning news lands. */
const BEAT = DAWN_BEAT;

export default function NewsApp({ ctx, onClose }) {
  const { game } = ctx;
  // 'auto' plays the phase's reveal if it has one and the paper otherwise; the
  // guest can step from the reveal into the paper.
  const [view, setView] = useState('auto');
  const live = view === 'auto' && ['dawn', 'banish', 'finale'].includes(game.phase);

  if (!live) {
    return <NewsPaper ctx={ctx} onBack={view === 'paper' ? () => setView('auto') : onClose} backLabel={view === 'paper' ? 'Live' : 'Home'} />;
  }

  const title = game.phase === 'banish' ? 'Breaking' : game.phase === 'finale' ? 'Special edition' : 'News';
  return (
    <AppFrame title={title} onBack={onClose} tone={game.phase === 'banish' ? 'red' : 'dark'} dark right={<button type="button" className="os-barbtn" onClick={() => setView('paper')}>Paper</button>}>
      {game.phase === 'dawn' && <DawnReveal ctx={ctx} />}
      {game.phase === 'banish' && <BanishReveal key={game.ballot} ctx={ctx} />}
      {game.phase === 'finale' && <Finale ctx={ctx} onPaper={() => setView('paper')} />}
    </AppFrame>
  );
}

// --- The morning news -------------------------------------------------------------------

function dawnLines(pack, d, nameOf) {
  if (!d) return [];
  const taken = d.taken ?? d.victims?.[0];
  if (taken) return narrate(pack, 'dawnDeath', nameOf(taken));
  if (d.recruited) return narrate(pack, 'dawnRecruited');
  if (d.attempted) return narrate(pack, 'dawnSaved', nameOf(d.attempted));
  return narrate(pack, 'dawnQuiet');
}

function DawnReveal({ ctx }) {
  const { game, me, nameOf, pack, inbox } = ctx;
  const stage = useStage(game.revealAt, BEAT);
  useStageSounds(stage, { head: sfxPing, taken: game.dawn?.taken ? sfxGlitch : sfxSting });

  if (stage === 'hold' || !game.dawn) return <Hold label="THE MORNING NEWS…" />;
  const d = game.dawn;
  const takenPid = d.taken ?? d.victims?.[0] ?? null;
  const at = (s) => Object.keys(BEAT).indexOf(stage) >= Object.keys(BEAT).indexOf(s);
  const photos = inbox.filter((x) => x.kind === 'fact' && x.cycle === game.cycle).length;
  const iWasTaken = takenPid === me.pid;

  return (
    <div className="pb-8">
      <div className="text-center pt-8 os-rise">
        <p className="os-label text-[12px] text-os-chrome">DEEP BLUE · MORNING NEWS</p>
        <p className="os-arcade text-[22px] text-white mt-2">NIGHT {d.cycle ?? game.cycle}</p>
      </div>

      {at('taken') && (
        <div className="mx-3 mt-6 rounded-lg border border-os-red/50 bg-black/40 p-4 text-center os-rise">
          {takenPid ? (
            <div className="os-glitch">
              <div className="flex items-center justify-center gap-3">
                <Face traits={ctx.traits} pid={takenPid} ghost size={56} round />
                <div className="text-left">
                  <p className="text-[22px] leading-tight os-rgb">{nameOf(takenPid)}</p>
                  <p className="text-[14px] text-os-chrome mt-1">was killed in the night.</p>
                </div>
                <span className="os-taken">KILLED</span>
              </div>
            </div>
          ) : d.attempted ? (
            <p className="text-[18px]">Someone was after {nameOf(d.attempted)}. They missed.</p>
          ) : (
            <p className="text-[18px]">{d.recruited ? 'Nobody was killed. But someone said yes to something.' : 'Nobody was killed last night.'}</p>
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
              <p className="os-label text-[12px]">YOU WERE KILLED</p>
              <p className="text-[17px] mt-2">The Killers chose you last night.</p>
            </div>
          )}

          {photos > 0 && (
            <div className="px-3 mt-4">
              <Btn tone="green" onClick={() => ctx.open('gallery')}><Glyph name="photo" size={14} /> {photos} new {photos === 1 ? 'photo' : 'photos'} in Gallery</Btn>
            </div>
          )}
        </div>
      )}
    </div>
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
        <p className="os-label text-[12px] text-os-chrome">{b.pid === me.pid ? 'THE ROOM CHOSE YOU' : 'KILLED BY THE ROOM’S VOTE'}</p>
        <div className="mt-4 inline-block os-pop"><Face traits={ctx.traits} pid={b.pid} size={88} round ghost={reached('verdict')} /></div>
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
              <Cell key={pid} icon={<Face traits={ctx.traits} pid={pid} size={32} round />} title={nameOf(pid)} sub={(byTarget[pid] ?? []).map(nameOf).join(', ')} value={<span className="os-arcade text-os-gold text-[16px]">{n}</span>} />
            ))}
          </Group>
        </Section>
      )}
    </div>
  );
}
