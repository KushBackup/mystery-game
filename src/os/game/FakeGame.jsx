import React, { useEffect, useRef, useState } from 'react';
import { AppFrame } from '../ui';
import { useDayWall, useServerNow } from '../../hooks/useKillers';
import { saveDrawing } from '../../firebase/game';
import { encode, SKETCHBOOK } from './strokes';
import { sfxFlip, sfxStick } from '../sfx';
import { markSeen, peekSeen } from '../seen';
import { useDayStep } from './dayStep';
import { WordCard, StepPills } from './wordParts';
import { Polaroid, PenTray } from './sketchParts';
import { Sketch } from './dayParts';
import { noteLook } from './wordLook';
import { DrawPad } from './DrawGame';
import { HowList, StampReveal } from './dayHow';
import { cardsAtOf, clock } from './dayTiming';

/**
 * FAKE ARTIST, the second morning game (user's call, 2026-10-16), on the
 * Sketch board's paper.
 *
 * Word, drawn: the Faithful get the word, the Killers only its hint, and
 * everyone draws it at once. Nobody sees anyone's drawing while the pens are
 * out; when they go down, every drawing goes up on one board for the room to
 * talk over. There is nothing to rate (the user's call, same day: stars
 * confused people); the clue photos go to three guests who drew, at random
 * (minigames.js scoreFakeDay). A Killer drawing from the hint has to draw
 * something vague enough to fit, and the board shows it.
 *
 * Steps (Read · Draw) run on the room's shared clock (dayStep.js). The board
 * stays up with the word, until the night.
 */

const PILLS = [['read', 'Read'], ['draw', 'Draw']];
const DO_NOW = {
  wait: 'Your card is on its way.',
  read: 'Peek at your card. Keep it to yourself.',
  done: 'Pens down. The card turns over in a moment.',
};
const HOW = [
  ['peek', 'Peek', 'Most see the word. Killers only a hint.'],
  ['draw', 'Draw', 'Draw it. No letters.'],
  ['open', 'Look', 'Every drawing goes up. Spot the fake.'],
];
const SAVE_EVERY_MS = 1500;

export default function FakeGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf, players } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'fake');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'fake') ?? null;
  const playing = ['alive', 'ghost'].includes(me.status);
  // Nobody sees a drawing while the pens are out: the board only loads once they go down.
  const drawings = useDayWall(gid, 'drawings', c, step === 'done' || after);
  const inked = (drawings ?? []).filter((d) => (d.strokes ?? '').length > 4);
  const ghostIds = new Set(players.filter((p) => p.status === 'ghost').map((p) => p.id));
  const [up, setUp] = useState(false);
  const [open, setOpen] = useState(null);
  const opened = open ? inked.find((d) => d.id === open) : null;

  const cardsAt = cardsAtOf(game);
  const now = useServerNow(step === 'wait' && cardsAt ? cardsAt + 1000 : 0, 500);
  const cardsIn = Math.max(0, Math.ceil((cardsAt - now) / 1000));
  const waitLabel = cardsAt ? (cardsIn > 0 ? `Cards in ${clock(cardsIn)}` : 'Any second') : '';

  useEffect(() => {
    if (!opened) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened]);

  const word = after ? dayGame?.word : card?.word;
  const hint = after ? dayGame?.hint : card?.hint;
  const cardProps = {
    label: card?.word ? 'The word' : 'Your hint',
    word: card?.word ? word : hint,
    sub: card?.word ? `The Killers only see: ${hint}` : 'You don’t have the word. Draw like you do.',
  };
  const who = (pid) => `${pid === me.pid ? 'you' : nameOf(pid)}${ghostIds.has(pid) ? ' · ghost' : ''}`;

  let body;
  if (step === 'draw' && !after) {
    body = card && playing
      ? <FakeDraw gid={gid} c={c} me={me} cardProps={cardProps} />
      : <div className="os-wb-board"><div className="os-wb-watch">You’re watching today. The drawings go up when the pens go down.</div></div>;
  } else {
    body = (
      <div className="os-wb-board">
        {after ? (
          <StampReveal seenKey={`${gid}.fakereveal.${c}`} label="The word was" value={word} sub={word ? <>The Killers only saw: <b>{hint}</b></> : null} waiting="Turning the card over…" />
        ) : (
          <>
            <p className="os-wb-now">{DO_NOW[step] ?? ''}</p>
            {step === 'wait' && <HowList title="Fake Artist" steps={HOW} />}
            {card ? (
              <WordCard
                up={up && step !== 'wait'}
                onFlip={() => { sfxFlip(); setUp((u) => !u); }}
                locked={step === 'wait'}
                backText={step === 'wait' ? 'Dealt in a moment' : null}
                chip={step === 'done'}
                {...cardProps}
              />
            ) : (
              <div className="os-wb-watch">You’re watching today.</div>
            )}
          </>
        )}
        {(after || step === 'done') && (
          <section aria-label="The drawings">
            <p className="os-wb-head">{`The board · ${inked.length} ${inked.length === 1 ? 'drawing' : 'drawings'}`}</p>
            {inked.length ? (
              <ul className="os-sb-wall">
                {inked.map((d) => (
                  <li key={d.id}>
                    <Polaroid
                      strokes={d.strokes}
                      size={132}
                      sub={who(d.pid)}
                      tilt={noteLook(d.pid).tilt}
                      mine={d.pid === me.pid}
                      onOpen={() => setOpen(d.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="os-wb-empty">No drawings yet.</p>
            )}
          </section>
        )}
        {opened && (
          <div className="os-sb-big" role="dialog" aria-modal="true" aria-label="A drawing">
            <button type="button" className="os-sb-big__scrim" aria-label="Close" onClick={() => setOpen(null)} />
            <figure className="os-sb-big__card" onClick={() => setOpen(null)}>
              <Sketch strokes={opened.strokes} size={280} paper={SKETCHBOOK} />
              <figcaption>
                <b>{who(opened.pid)}</b>
              </figcaption>
            </figure>
          </div>
        )}
      </div>
    );
  }

  return (
    <AppFrame title={`Day ${c} · FAKE ARTIST`} onBack={onClose} bodyClass="os-wb">
      {!after && <StepPills step={step} left={left} hot={step === 'draw'} waitLabel={waitLabel} pills={PILLS} />}
      {body}
    </AppFrame>
  );
}

/** The pens are out: your card pinned up top, the pad, the pens. Saved as it grows. */
function FakeDraw({ gid, c, me, cardProps }) {
  const keepKey = `${gid}.fake.${c}`;
  const [strokes, setStrokes] = useState(() => peekSeen(keepKey) ?? []);
  const [ink, setInk] = useState(0);
  const [up, setUp] = useState(true);
  useEffect(() => { markSeen(keepKey, strokes.length ? strokes : null); }, [keepKey, strokes]);

  const latest = useRef({ strokes, dirty: strokes.length > 0 });
  useEffect(() => {
    if (latest.current.strokes !== strokes) latest.current = { strokes, dirty: true };
  }, [strokes]);
  useEffect(() => {
    const save = () => {
      if (!latest.current.dirty) return;
      latest.current.dirty = false;
      saveDrawing(gid, c, me.pid, encode(latest.current.strokes), []).catch((e) => console.warn('[drawing] not saved:', e.code ?? e.message));
    };
    const id = setInterval(save, SAVE_EVERY_MS);
    return () => { clearInterval(id); save(); sfxStick(); };
  }, [gid, c, me.pid]);

  return (
    <div className="os-sb-draw">
      <WordCard up={up} onFlip={() => { sfxFlip(); setUp((u) => !u); }} chip {...cardProps} />
      <DrawPad strokes={strokes} ink={ink} onStroke={(s) => setStrokes((all) => [...all, s])} />
      <PenTray
        ink={ink}
        onInk={setInk}
        canUndo={strokes.length > 0}
        onUndo={() => setStrokes((all) => all.slice(0, -1))}
        onClear={() => setStrokes([])}
      />
    </div>
  );
}
