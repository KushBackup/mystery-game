import React, { useEffect, useRef, useState } from 'react';
import { AppFrame, Btn } from '../ui';
import { useDayWall, useMyPlay, useServerNow } from '../../hooks/useKillers';
import { postClue, savePicks } from '../../firebase/game';
import { normalize, spoils, introDay, WORD_PICKS, CLUE_MAX } from '../../lib/engine/minigames.js';
import { REVEAL_LEAD_MS } from '../../lib/engine/phases.js';
import { sfxDeny, sfxFlip, sfxStick, sfxStar, sfxUnstar } from '../sfx';
import { useDraft, useSeen, markSeen, peekSeen } from '../seen';
import { useDayStep } from './dayStep';
import { WordCard, WallNote, PickTray, StepPills } from './wordParts';
import { noteLook } from './wordLook';
import WordTutorial from './WordTutorial';

/**
 * WORD, the first morning game, on a paper board (user's call, 2026-10-03).
 *
 * The Faithful get the word; the Killers only its hint. Everyone posts one
 * word that fits it, and the clues stick to one wall for the whole room in the
 * order they landed, so a Killer can wait and read the others first, but
 * everyone can see who waited. Then each guest places three gold stars on the
 * clues that fit best; stars are the score (minigames.js scoreWordDay).
 *
 * The steps (Read · Clue · Pick) run on the room's shared clock (dayStep.js).
 * On the first Word morning the alarm is longer and this screen is the
 * tutorial until the guest finishes or skips it (WordTutorial.jsx); the deal
 * closes it either way. The "?" in the bar replays it any time.
 *
 * After the game locks the wall stays, with the word shown, for the room to
 * argue over until the vote.
 */

const DO_NOW = {
  wait: 'Your card is on its way.',
  read: 'Peek at your card. Keep it to yourself.',
  clue: 'Post one word that fits. Never the word itself.',
  pick: `Tap the ${WORD_PICKS} clues that fit best.`,
  done: 'Time’s up. The board posts in a moment.',
};

/** When the cards are dealt: the end of the alarm plus the game's reveal hold, or the game's own reveal. */
function cardsAtOf(game) {
  if (game.phase === 'alarm') return game.phaseEndsAt ? game.phaseEndsAt + REVEAL_LEAD_MS : 0;
  if (game.phase === 'game') return game.revealAt || 0;
  return 0;
}

const FLY_MS = 900;

export default function WordGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf, players } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'word');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'word') ?? null;
  const alive = me.status === 'alive';
  const ghost = me.status === 'ghost';
  const wallList = useDayWall(gid, 'clues', c);
  const wall = wallList ?? [];
  const mine = wall.find((w) => w.pid === me.pid) ?? null;
  const picksDoc = useMyPlay(gid, 'picks', c, me.pid, alive || ghost);
  const [picked, setPicked] = useState(null);
  const picks = picked ?? picksDoc?.picks ?? [];
  const [shake, setShake] = useState(0);
  const [up, setUp] = useState(false);
  const [fly, setFly] = useState(null);
  const [replay, setReplay] = useState(false);
  const tutSeen = useSeen(`${gid}.tut.word`, false);

  // The notes already up when this screen opened don't pop in; the ones that land while you watch do.
  const [base, setBase] = useState(null);
  if (base === null && wallList !== undefined) setBase(new Set(wallList.map((w) => w.id)));

  const cardsAt = cardsAtOf(game);
  const now = useServerNow(step === 'wait' && cardsAt ? cardsAt + 1000 : 0, 500);
  const cardsIn = Math.max(0, Math.ceil((cardsAt - now) / 1000));
  const waitLabel = cardsAt ? (cardsIn > 0 ? `Cards in ${Math.floor(cardsIn / 60)}:${String(cardsIn % 60).padStart(2, '0')}` : 'Any second') : '';

  useEffect(() => {
    if (!fly) return undefined;
    const id = setTimeout(() => setFly(null), FLY_MS);
    return () => clearTimeout(id);
  }, [fly]);

  const intro = !after && step === 'wait' && !tutSeen && introDay(game.config, c);
  const canPick = step === 'pick' && (alive || ghost);

  const togglePick = (pid) => {
    if (!canPick || pid === me.pid) return;
    let next;
    if (picks.includes(pid)) {
      next = picks.filter((p) => p !== pid);
      sfxUnstar();
    } else if (picks.length < WORD_PICKS) {
      next = [...picks, pid];
      sfxStar();
    } else {
      sfxDeny();
      setShake((n) => n + 1);
      return;
    }
    setPicked(next);
    savePicks(gid, c, me.pid, next).catch((e) => console.warn('[picks] not saved:', e.code ?? e.message));
  };

  const flip = () => {
    sfxFlip();
    setUp((u) => !u);
  };

  const help = !intro && !replay
    ? <button type="button" className="os-barbtn os-wb-help" onClick={() => setReplay(true)} aria-label="How to play">?</button>
    : null;

  let body;
  if (intro) {
    body = <WordTutorial mode="intro" cardsAt={cardsAt} onDone={() => markSeen(`${gid}.tut.word`, true)} />;
  } else if (replay) {
    body = <WordTutorial mode="replay" onDone={() => setReplay(false)} />;
  } else {
    const word = after ? dayGame?.word : card?.word;
    const hint = after ? dayGame?.hint : card?.hint;
    const myAt = mine ? wall.indexOf(mine) + 1 : 0;
    const left3 = WORD_PICKS - picks.length;
    body = (
      <div className="os-wb-board">
        {after ? (
          <Reveal gid={gid} c={c} word={word} hint={hint} />
        ) : (
          <>
            <p className="os-wb-now">{DO_NOW[step] ?? ''}</p>
            {card ? (
              <WordCard
                up={up && step !== 'wait'}
                onFlip={flip}
                locked={step === 'wait'}
                backText={step === 'wait' ? 'Dealt in a moment' : null}
                chip={step === 'clue' || step === 'pick' || step === 'done'}
                label={card.word ? 'The word' : 'Your hint'}
                word={card.word ? word : hint}
                sub={card.word ? `The Killers only see: ${hint}` : 'You don’t have the word.'}
              />
            ) : (
              <div className="os-wb-watch">
                {ghost ? 'Ghosts can’t post a clue. You can still pick the best three.' : 'You’re watching today. The wall fills up below.'}
              </div>
            )}
            {step === 'wait' && (
              <button type="button" className="os-wb-link" onClick={() => setReplay(true)}>Watch how to play</button>
            )}
          </>
        )}

        {step === 'clue' && alive && card && !mine && (
          <Composer gid={gid} c={c} me={me} card={card} players={players} onPosted={setFly} />
        )}
        {!after && mine && step !== 'wait' && (
          <p className="os-wb-stuck">Stuck! You’re <b>#{myAt}</b> on the wall.</p>
        )}
        {canPick && (
          <PickTray
            used={picks.length}
            shake={shake}
            line={left3 > 0 ? `${left3} ${left3 === 1 ? 'star' : 'stars'} left · tap a clue` : `All ${WORD_PICKS} placed. Tap one to take it back.`}
          />
        )}

        {(after || ['clue', 'pick', 'done'].includes(step)) && (
          <section className="os-wb-wall" aria-label="The wall">
            <p className="os-wb-head">
              {after ? `The wall · ${wall.length} ${wall.length === 1 ? 'clue' : 'clues'}` : `The wall · ${wall.length} so far`}
            </p>
            {wall.length ? (
              <ol className="os-wb-notes">
                {wall.map((w, i) => {
                  const own = w.pid === me.pid;
                  return (
                    <li key={w.id}>
                      <WallNote
                        n={i + 1}
                        clue={w.clue}
                        who={own ? 'you' : nameOf(w.pid)}
                        look={noteLook(w.pid)}
                        own={own}
                        picked={picks.includes(w.pid)}
                        canPick={canPick && !own}
                        onPick={() => togglePick(w.pid)}
                        spoiled={after && Boolean(word) && spoils(w.clue, word)}
                        fresh={!own && Boolean(base) && !base.has(w.id)}
                        fly={own ? fly : null}
                      />
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="os-wb-empty">No clues yet. The first one lands here.</p>
            )}
          </section>
        )}
      </div>
    );
  }

  return (
    <AppFrame title={`Day ${c} · WORD`} onBack={onClose} right={help} bodyClass="os-wb">
      {!after && !intro && <StepPills step={step} left={left} hot={step === 'clue' || step === 'pick'} waitLabel={waitLabel} />}
      {body}
    </AppFrame>
  );
}

/** After the game: the card turns over for everyone. The stamp plays once per phone. */
function Reveal({ gid, c, word, hint }) {
  const key = `${gid}.wordreveal.${c}`;
  const [stamp] = useState(() => !peekSeen(key));
  useEffect(() => {
    if (word) markSeen(key, true);
  }, [key, word]);
  if (!word) {
    return (
      <div className="os-wb-reveal">
        <p className="os-wb-reveal__label">Time’s up</p>
        <p className="os-wb-reveal__wait">Posting the board…</p>
      </div>
    );
  }
  return (
    <div className="os-wb-reveal">
      <p className="os-wb-reveal__label">The word was</p>
      <p className={`os-wb-reveal__word ${stamp ? 'os-wb-reveal__word--stamp' : ''}`}>{word}</p>
      <p className="os-wb-reveal__sub">The Killers only saw: <b>{hint}</b></p>
    </div>
  );
}

/** The sticky note you write your clue on. It flies to the wall when posted. */
function Composer({ gid, c, me, card, players, onPosted }) {
  const [text, setText, clearText] = useDraft(`${gid}.draft.clue.${c}`); // survives a reload until posted
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pad = useRef(null);
  const names = players.map((p) => normalize(p.name)).filter(Boolean);
  const look = noteLook(me.pid);
  const t = text.trim();
  const oneWord = /^[\p{L}\p{N}'-]+$/u.test(t);
  const noName = Boolean(t) && !names.includes(normalize(t));

  const submit = async (e) => {
    e.preventDefault();
    const why = !oneWord ? 'One word. No spaces.'
      : card.word && spoils(t, card.word) ? 'That gives the word away.'
      : !noName ? 'No guest names.'
      : '';
    if (why) { sfxDeny(); setError(why); return; }
    setBusy(true);
    // Take off before the write: the wall shows the note from the local copy
    // at once, and it should land from this pad, not appear and then jump.
    onPosted(pad.current?.getBoundingClientRect() ?? null);
    sfxStick();
    try {
      await postClue(gid, c, me.pid, t);
      clearText();
    } catch (err) {
      onPosted(null);
      setError(err.code === 'permission-denied' ? 'Too late, or already posted.' : 'Not sent. Try again.');
      setBusy(false);
    }
  };

  const mark = (ok) => (t ? (ok ? 'is-ok' : 'is-bad') : '');
  return (
    <form className="os-wb-compose" onSubmit={submit}>
      <label ref={pad} className={`os-wb-pad os-wb-note--${look.shade}`} style={{ '--tilt': `${look.tilt}deg` }}>
        <span className="os-wb-pad__hint">Your clue</span>
        <input
          className="os-wb-pad__input"
          value={text}
          maxLength={CLUE_MAX}
          onChange={(e) => { setText(e.target.value.replace(/\s/g, '')); setError(''); }}
          placeholder="one word"
          aria-label="Your clue: one word"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
        />
      </label>
      <ul className="os-wb-checks" aria-label="Rules for your clue">
        <li className={mark(oneWord)}>One word</li>
        <li className={mark(noName)}>No guest names</li>
      </ul>
      {error && <p className="os-wb-error" role="alert">{error}</p>}
      <Btn type="submit" busy={busy} disabled={!t}>Stick it on the wall</Btn>
    </form>
  );
}
