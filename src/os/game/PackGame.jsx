import React, { useMemo, useState } from 'react';
import { AppFrame } from '../ui';
import { useMyPlay, useServerNow } from '../../hooks/useKillers';
import { saveBag } from '../../firebase/game';
import { PACK_ITEMS } from '../../lib/engine/minigames.js';
import { ITEM_INDEX, itemLabel } from '../../data/packItems.js';
import { sfxDeny, sfxFlip, sfxStick, sfxUnstar } from '../sfx';
import { useDayStep } from './dayStep';
import { WordCard, StepPills } from './wordParts';
import { noteLook } from './wordLook';
import { HowList, StampReveal } from './dayHow';
import { cardsAtOf, clock } from './dayTiming';

/**
 * PACK THE BAG, the third morning game (user's call, 2026-10-16), on the
 * Word board's paper.
 *
 * The Faithful are told where the room is going; the Killers only the hint
 * (data/packItems.js). Everyone gets the same twelve things on the table and
 * packs three. Bags are private while they are packed (firestore.rules
 * `bags`), so nobody can copy; when the game locks the host opens every bag
 * at once in game.dayGame, and everyone sees the trip, what the room packed
 * and every guest's bag (PackReveal). Each thing that belongs on the trip
 * scores (minigames.js scorePackDay).
 *
 * The items are one drawn sheet, public/pack/items.webp, cut with
 * background-position (splash-film/items.html draws it).
 */

const PILLS = [['read', 'Read'], ['pack', 'Pack']];
const DO_NOW = {
  wait: 'Your ticket is on its way.',
  read: 'Peek at your ticket. Keep it to yourself.',
  pack: `Pack ${PACK_ITEMS} things for the trip.`,
  done: 'Bags shut. They all open together in a moment.',
};
const HOW = [
  ['peek', 'Peek', 'Most see the trip. Killers only a hint.'],
  ['bag', 'Pack', `Pick ${PACK_ITEMS} things to take.`],
  ['open', 'Open', 'Every bag opens at once. Spot the fake.'],
];
const SHEET = `${import.meta.env.BASE_URL}pack/items.webp`;

/** One drawn thing from the sheet, as a square sticker. */
export function Item({ id, size = 64, className = '' }) {
  const k = ITEM_INDEX[id] ?? 0;
  const style = {
    width: size,
    height: size,
    backgroundImage: `url(${SHEET})`,
    backgroundSize: '1000% 500%',
    backgroundPosition: `${((k % 10) * 100) / 9}% ${(Math.floor(k / 10) * 100) / 4}%`,
  };
  return <span className={`os-pk-item ${className}`} style={style} role="img" aria-label={itemLabel(id)} />;
}

export default function PackGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf, players } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'pack');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'pack') ?? null;
  const playing = ['alive', 'ghost'].includes(me.status);
  const bagDoc = useMyPlay(gid, 'bags', c, me.pid, playing);
  const [packed, setPacked] = useState(null);
  const bag = packed ?? bagDoc?.items ?? [];
  const [shake, setShake] = useState(0);
  const [up, setUp] = useState(false);

  const cardsAt = cardsAtOf(game);
  const now = useServerNow(step === 'wait' && cardsAt ? cardsAt + 1000 : 0, 500);
  const cardsIn = Math.max(0, Math.ceil((cardsAt - now) / 1000));
  const waitLabel = cardsAt ? (cardsIn > 0 ? `Tickets in ${clock(cardsIn)}` : 'Any second') : '';

  const canPack = step === 'pack' && playing && Boolean(card);
  const toggle = (id) => {
    if (!canPack) return;
    let next;
    if (bag.includes(id)) { next = bag.filter((x) => x !== id); sfxUnstar(); }
    else if (bag.length < PACK_ITEMS) { next = [...bag, id]; sfxStick(); }
    else { sfxDeny(); setShake((n) => n + 1); return; }
    setPacked(next);
    saveBag(gid, c, me.pid, next).catch((e) => console.warn('[bag] not saved:', e.code ?? e.message));
  };

  const ticket = {
    label: card?.place ? 'You’re going to' : 'Your hint',
    word: card?.place ?? card?.hint,
    sub: card?.place ? `The Killers only know: ${card.hint}` : 'You don’t know where. Pack like you do.',
  };

  let body;
  if (after) {
    body = <PackReveal gid={gid} c={c} reveal={dayGame} me={me} nameOf={nameOf} players={players} />;
  } else {
    body = (
      <div className="os-wb-board">
        <p className="os-wb-now">{DO_NOW[step] ?? ''}</p>
        {step === 'wait' && <HowList title="Pack the Bag" steps={HOW} />}
        {card ? (
          <WordCard
            up={up && step !== 'wait'}
            onFlip={() => { sfxFlip(); setUp((u) => !u); }}
            locked={step === 'wait'}
            backText={step === 'wait' ? 'Your ticket · dealt in a moment' : step === 'read' ? 'Your ticket · tap to peek' : null}
            chip={step === 'pack' || step === 'done'}
            {...ticket}
          />
        ) : (
          <div className="os-wb-watch">You’re watching today. The bags open at the end.</div>
        )}
        {step === 'pack' && card && (
          <ul className="os-pk-table" aria-label="Things to pack">
            {card.items.map((id) => {
              const on = bag.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`os-pk-tile ${on ? 'is-packed' : ''}`}
                    style={{ '--tilt': `${noteLook(`${c}:${id}`).tilt}deg` }}
                    onClick={() => toggle(id)}
                    aria-pressed={on}
                    disabled={!canPack}
                  >
                    <Item id={id} size={58} />
                    <span className="os-pk-tile__label">{itemLabel(id)}</span>
                    {on && <span className="os-pk-tile__tick" aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {(step === 'pack' || step === 'done') && card && playing && (
          <Suitcase items={bag} shake={shake} onTake={canPack ? toggle : null} shut={step === 'done'} />
        )}
      </div>
    );
  }

  return (
    // "Day 2 · PACK THE BAG" wraps in the bar on a 390 px phone; the game's name alone fits.
    <AppFrame title="PACK THE BAG" onBack={onClose} bodyClass="os-wb os-pk">
      {!after && <StepPills step={step} left={left} hot={step === 'pack'} waitLabel={waitLabel} pills={PILLS} />}
      {body}
    </AppFrame>
  );
}

/** Your suitcase, docked at the bottom: three slots, tap one to take it back out. */
function Suitcase({ items, shake, onTake, shut }) {
  const free = PACK_ITEMS - items.length;
  return (
    <div className={`os-pk-case ${shut ? 'is-shut' : ''} ${shake ? 'os-shake' : ''}`} key={shake} role="status">
      <span className="os-pk-case__handle" aria-hidden="true" />
      <div className="os-pk-case__slots">
        {Array.from({ length: PACK_ITEMS }, (_, i) => {
          const id = items[i];
          return id ? (
            <button key={id} type="button" className="os-pk-slot is-full" onClick={onTake ? () => onTake(id) : undefined} disabled={!onTake} aria-label={`Take out ${itemLabel(id)}`}>
              <Item id={id} size={50} />
            </button>
          ) : (
            <span key={`empty-${i}`} className="os-pk-slot" aria-hidden="true" />
          );
        })}
      </div>
      <p className="os-pk-case__line">
        {shut ? 'Shut and tagged.' : free ? `${free} ${free === 1 ? 'space' : 'spaces'} left` : 'Full. Tap one to swap it.'}
      </p>
    </div>
  );
}

/**
 * The bags open. The trip, stamped; what the whole room packed, most first,
 * with a tick on what belongs; then every guest's open bag with their name on
 * a luggage tag. Whose bag doesn't fit the trip is for the room to say.
 */
function PackReveal({ gid, c, reveal, me, nameOf, players }) {
  const ghostIds = useMemo(() => new Set(players.filter((p) => p.status === 'ghost').map((p) => p.id)), [players]);
  const bags = Object.entries(reveal?.bags ?? {});
  const fits = new Set(reveal?.fits ?? []);
  const counts = {};
  for (const [, items] of bags) for (const id of items) counts[id] = (counts[id] ?? 0) + 1;
  const tally = (reveal?.items ?? []).map((id) => [id, counts[id] ?? 0]).sort((a, b) => b[1] - a[1] || ITEM_INDEX[a[0]] - ITEM_INDEX[b[0]]);
  const mineFirst = [...bags].sort(([a], [b]) => (a === me.pid ? -1 : b === me.pid ? 1 : nameOf(a).localeCompare(nameOf(b))));

  return (
    <div className="os-wb-board">
      <StampReveal
        seenKey={`${gid}.packreveal.${c}`}
        label="The trip was"
        value={reveal?.place}
        sub={reveal?.place ? <>The Killers only knew: <b>{reveal.hint}</b></> : null}
        waiting="Opening the bags…"
      />
      {reveal?.place && (
        <>
          <section aria-label="What the room packed">
            <p className="os-wb-head">What the room packed</p>
            <ul className="os-pk-tally">
              {tally.map(([id, n]) => (
                <li key={id} className={`${n ? '' : 'is-none'} ${fits.has(id) ? 'is-fit' : ''}`}>
                  <Item id={id} size={46} />
                  <b>{n}</b>
                  {fits.has(id) && <span className="os-pk-fit" aria-label="belongs on the trip">✓</span>}
                </li>
              ))}
            </ul>
            <p className="os-pk-note">✓ belongs on the trip</p>
          </section>
          <section aria-label="Everyone’s bags">
            <p className="os-wb-head">{`Everyone’s bags · ${bags.length}`}</p>
            {bags.length ? (
              <ul className="os-pk-bags">
                {mineFirst.map(([pid, items], i) => (
                  <li key={pid} className="os-pk-bag" style={{ '--tilt': `${noteLook(pid).tilt}deg`, '--i': i }}>
                    <span className="os-pk-bag__tag">{pid === me.pid ? 'you' : nameOf(pid)}{ghostIds.has(pid) ? ' · ghost' : ''}</span>
                    <span className="os-pk-bag__in">
                      {items.map((id) => (
                        <span key={id} className={`os-pk-bag__thing ${fits.has(id) ? 'is-fit' : ''}`}>
                          <Item id={id} size={44} />
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="os-wb-empty">Nobody packed today.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// The sheet is one image; ask for it as soon as this module loads, so the table never pops in item by item.
if (typeof Image !== 'undefined') { const img = new Image(); img.src = SHEET; }
