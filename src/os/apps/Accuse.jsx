import React, { useState } from 'react';
import { SECONDS_NEEDED } from '../../lib/engine/banish.js';
import { useAccusations, canSecond } from '../accusations';
import { accuse, second } from '../../firebase/game';
import { clueWords } from '../../data/packs/index.js';
import { ACCUSE } from '../../data/killersCopy';
import { GuestPicker, Btn, Section } from '../ui';
import { Face } from '../art/Portrait';
import Evidence from '../art/Evidence';
import { sfxSent } from '../sfx';

/**
 * Accusations (2026-10-15): the room calls its own vote. After the 3 Oct game
 * the room waited for the host to say "vote now"; now nobody is voted on
 * unless a guest accuses them and two others back it (engine/banish.js
 * accusationBoard). The tools are explained in full here (ACCUSE): the
 * players' goal and what each move does are always told; tactics are theirs.
 *
 * Two places use these pieces: the Vote app in daylight (accuse, second, see
 * who's close to trial) and the Room, where each accusation lands as a card
 * with its own Second button.
 */

/** The Second button and its states. */
export function SecondButton({ ctx, accusation, mySecond }) {
  const [state, setState] = useState('');
  if (mySecond?.accuser === accusation.pid) return <p className="os-accuse__done">{ACCUSE.seconded}</p>;
  if (!canSecond(ctx, accusation, mySecond)) return null;
  const go = async () => {
    setState('sending');
    try {
      await second(ctx.gid, ctx.game.cycle, ctx.me.pid, accusation.pid);
      sfxSent();
      setState('');
    } catch (err) {
      setState(err.code === 'permission-denied' ? 'closed' : 'error');
    }
  };
  return (
    <>
      <Btn small tone="red" className="mt-2 w-full" busy={state === 'sending'} onClick={go}>{ACCUSE.second(ctx.nameOf(accusation.target))}</Btn>
      {state && state !== 'sending' && <p className="os-compose__error mt-1" role="alert">{state === 'closed' ? ACCUSE.closed : ACCUSE.error}</p>}
    </>
  );
}

/** One accused guest: who, who accused them, the photo given as a reason, support so far. */
export function AccusedCard({ ctx, row, byAccuser, mySecond }) {
  const { nameOf } = ctx;
  const first = byAccuser[row.accusers[0]];
  return (
    <div className={`os-accuse ${row.onTrial ? 'os-accuse--trial' : ''}`}>
      <div className="flex items-center gap-3">
        <Face traits={ctx.traits} pid={row.pid} size={40} round />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold leading-tight truncate">{nameOf(row.pid)}{row.pid === ctx.me.pid ? ' (you)' : ''}</p>
          <p className="text-[13px] text-os-steel leading-snug">{ACCUSE.by(row.accusers.map(nameOf))}</p>
        </div>
        <span className={`os-accuse__count ${row.onTrial ? 'is-on' : ''}`}>{row.onTrial ? ACCUSE.onTrial : `${row.support} of ${SECONDS_NEEDED}`}</span>
      </div>
      {row.accusers.map((a) => byAccuser[a]).filter((x) => x?.fact).map((x) => (
        <div key={x.pid} className="os-accuse__clue">
          <div className="os-accuse__thumb"><Evidence fact={x.fact} seed={x.inboxId} pack={ctx.pack} thumb /></div>
          <p className="text-[13px] leading-snug"><span className="text-os-steel">{ACCUSE.reason(nameOf(x.pid))}</span> {clueWords(ctx.pack, x.fact).plain}</p>
        </div>
      ))}
      {row.seconds.length > 0 && <p className="text-[12px] text-os-steel mt-1">{ACCUSE.backed(row.seconds.map(nameOf))}</p>}
      {/* On trial already: another Second changes nothing, so there's no button. */}
      {first && !row.onTrial && <SecondButton ctx={ctx} accusation={first} mySecond={mySecond} />}
    </div>
  );
}

/** Daylight in the Vote app: the rule, today's accused, and your one accusation. */
export function AccusePanel({ ctx }) {
  const { gid, game, me, players, nameOf, inbox } = ctx;
  const { board, mine, mySecond, byAccuser } = useAccusations(ctx);
  const [target, setTarget] = useState(null);
  const [clueId, setClueId] = useState(null);
  const [state, setState] = useState('');
  const living = players.filter((p) => p.status === 'alive' && p.id !== me.pid).map((p) => ({ ...p, pid: p.id }));
  const photos = (inbox ?? []).filter((d) => d.kind === 'fact' && d.fact).sort((a, b) => b.cycle - a.cycle);
  const daylight = game.phase === 'investigation';

  const send = async () => {
    if (!target || state === 'sending') return;
    setState('sending');
    try {
      await accuse(gid, game.cycle, me.pid, target, photos.find((d) => d.id === clueId) ?? null);
      sfxSent();
      setState('');
    } catch (err) {
      setState(err.code === 'permission-denied' ? 'closed' : 'error');
    }
  };

  return (
    <>
      <div className="px-4 pt-4">
        <p className="os-label text-[12px] text-os-steel">{ACCUSE.kicker}</p>
        <p className="text-[22px] leading-tight mt-1 text-os-ink">{ACCUSE.title}</p>
        <ul className="mt-2 space-y-1">
          {ACCUSE.rules.map((r) => <li key={r} className="text-[14px] leading-snug text-os-ink">{r}</li>)}
        </ul>
      </div>

      <Section head={board.length ? ACCUSE.today(board.filter((r) => r.onTrial).length) : undefined}>
        {board.length === 0
          ? <p className="text-[15px] text-os-steel px-1">{ACCUSE.none}</p>
          : <div className="space-y-2">{board.map((row) => <AccusedCard key={row.pid} ctx={ctx} row={row} byAccuser={byAccuser} mySecond={mySecond} />)}</div>}
      </Section>

      {me.status === 'alive' && daylight && (mine ? (
        <Section><p className="os-accuse__done !text-[15px]">{ACCUSE.yours(nameOf(mine.target))}</p></Section>
      ) : (
        <>
          <Section head={ACCUSE.pick}>
            <GuestPicker guests={living} value={target} onPick={setTarget} dark={false} traits={ctx.traits} />
          </Section>
          {target && photos.length > 0 && (
            <Section head={ACCUSE.attach} foot={ACCUSE.attachFoot}>
              <div className="os-lastpick__photos">
                {photos.map((d) => (
                  <button key={d.id} type="button" aria-pressed={clueId === d.id} className={`os-lastpick__photo ${clueId === d.id ? 'is-on' : ''}`} onClick={() => setClueId(clueId === d.id ? null : d.id)}>
                    <Evidence fact={d.fact} seed={d.id} pack={ctx.pack} stamp={`D${d.cycle}`} thumb />
                    <span>{clueWords(ctx.pack, d.fact).plain}</span>
                  </button>
                ))}
              </div>
            </Section>
          )}
          <Section>
            {state === 'closed' && <p className="os-compose__error" role="alert">{ACCUSE.closed}</p>}
            {state === 'error' && <p className="os-compose__error" role="alert">{ACCUSE.error}</p>}
            <Btn tone="red" disabled={!target} busy={state === 'sending'} onClick={send}>{target ? ACCUSE.send(nameOf(target)) : ACCUSE.pickFirst}</Btn>
          </Section>
        </>
      ))}
      <div className="h-8" />
    </>
  );
}

/** An accusation as it lands in the Room. */
export function AccuseBubble({ ctx, a }) {
  const { mySecond, board } = useAccusations(ctx);
  const row = board.find((r) => r.pid === a.target);
  return (
    <div className="os-bubble-row os-rise">
      <span className="os-bubble-name">{ACCUSE.roomKicker}</span>
      <div className="os-accuse os-accuse--room">
        <p className="text-[15px] leading-snug"><b>{a.pid === ctx.me.pid ? 'You' : ctx.nameOf(a.pid)}</b> {ACCUSE.accuses} <b>{a.target === ctx.me.pid ? 'you' : ctx.nameOf(a.target)}</b>.</p>
        {a.fact && (
          <div className="os-accuse__clue">
            <div className="os-accuse__thumb"><Evidence fact={a.fact} seed={a.inboxId} pack={ctx.pack} thumb /></div>
            <p className="text-[13px] leading-snug">{clueWords(ctx.pack, a.fact).plain}</p>
          </div>
        )}
        {row && <p className="text-[12px] text-os-steel mt-1">{row.onTrial ? ACCUSE.onTrialLine(ctx.nameOf(a.target)) : ACCUSE.support(row.support)}</p>}
        {!row?.onTrial && <SecondButton ctx={ctx} accusation={a} mySecond={mySecond} />}
      </div>
    </div>
  );
}
