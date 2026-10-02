import React, { useState } from 'react';
import { AppFrame, Section, Btn, Empty } from '../ui';
import { useDayWall, useMyPlay } from '../../hooks/useKillers';
import { postClue, savePicks } from '../../firebase/game';
import { normalize, spoils, WORD_PICKS, CLUE_MAX } from '../../lib/engine/minigames.js';
import { sfxSent, sfxDeny, sfxTap } from '../sfx';
import { useDraft } from '../seen';
import { StepBar } from './dayParts';
import { useDayStep } from './dayStep';

/**
 * WORD, the first morning game. The Faithful see the word; the Killers see
 * only its hint. Everyone posts one word that fits it, and the clues stream
 * onto one wall for the whole room, in the order they landed, so a Killer can
 * wait and read the others first, but everyone can see who waited. Then each
 * guest picks the three clues that fit best; picks are the score.
 *
 * After the game locks the wall stays, with the word shown, for the room to
 * argue over until the vote.
 */

const STEP_LABEL = { wait: 'GET READY', read: 'READ YOUR CARD', clue: 'POST ONE WORD', pick: `PICK THE ${WORD_PICKS} BEST CLUES`, done: 'TIME' };

export default function WordGame({ ctx, onClose, dayGame }) {
  const { gid, game, me, inbox, nameOf, players, pack } = ctx;
  const c = game.cycle;
  const { step, left } = useDayStep(game, 'word');
  const after = !['alarm', 'game'].includes(game.phase);
  const card = inbox.find((d) => d.cycle === c && d.step === 'day' && d.kind === 'word') ?? null;
  const alive = me.status === 'alive';
  const wall = useDayWall(gid, 'clues', c) ?? [];
  const mine = wall.find((w) => w.pid === me.pid) ?? null;
  const picksDoc = useMyPlay(gid, 'picks', c, me.pid, ['alive', 'ghost'].includes(me.status));
  const [picked, setPicked] = useState(null);
  const picks = picked ?? picksDoc?.picks ?? [];
  const rule = pack.dayGames?.word?.rule;

  const togglePick = (pid) => {
    if (step !== 'pick' || pid === me.pid) return;
    const next = picks.includes(pid) ? picks.filter((p) => p !== pid) : picks.length < WORD_PICKS ? [...picks, pid] : null;
    if (!next) { sfxDeny(); return; }
    sfxTap();
    setPicked(next);
    savePicks(gid, c, me.pid, next).catch((e) => console.warn('[picks] not saved:', e.code ?? e.message));
  };

  const word = after ? dayGame?.word : card?.word;
  const hint = after ? dayGame?.hint : card?.hint;
  return (
    <AppFrame title={`Day ${c} · WORD`} onBack={onClose} tone="dark" dark>
      {!after && <StepBar label={STEP_LABEL[step] ?? ''} left={left} hot={step === 'clue' || step === 'pick'} />}
      <div className="px-4 pt-4">
        <WordCard word={word} hint={hint} after={after} watching={!card} ghost={me.status === 'ghost'} compact={step === 'clue' || step === 'pick'} />
        {step === 'wait' && rule && <p className="text-[15px] text-os-chrome mt-3 text-center os-balance">{rule}</p>}
      </div>

      {step === 'clue' && alive && card && !mine && <ClueForm gid={gid} c={c} me={me} card={card} players={players} />}

      {(step === 'clue' || step === 'pick' || step === 'done' || after) && (
        <Section head={after ? `The wall · ${wall.length} clues` : step === 'pick' ? `Tap ${WORD_PICKS} · ${picks.length} picked` : `The wall · ${wall.length} so far`}>
          {wall.length ? (
            <ol className="os-cluewall">
              {wall.map((w, i) => {
                const on = picks.includes(w.pid);
                const own = w.pid === me.pid;
                const canPick = step === 'pick' && !own;
                const spoiled = after && word && spoils(w.clue, word);
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      className={`os-cluewall__row ${on ? 'os-cluewall__row--on' : ''} ${own ? 'os-cluewall__row--own' : ''}`}
                      disabled={!canPick}
                      aria-pressed={on}
                      onClick={() => togglePick(w.pid)}
                    >
                      <span className="os-cluewall__n">{i + 1}</span>
                      <span className="os-cluewall__clue">{w.clue}{spoiled && <span className="os-cluewall__flag"> gave it away</span>}</span>
                      <span className="os-cluewall__who">{own ? 'you' : nameOf(w.pid)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <Empty glyph="dots" title="NOTHING YET" />
          )}
        </Section>
      )}
    </AppFrame>
  );
}

/** Your card. Big while you read it; small once the wall needs the room. */
function WordCard({ word, hint, after, watching, ghost, compact }) {
  const big = `os-daycard__word ${compact ? 'os-daycard__word--inline' : ''}`;
  if (after) {
    return word ? (
      <div className="os-daycard">
        <p className="os-label text-[11px] text-os-chrome">THE WORD WAS</p>
        <p className={big}>{word}</p>
        <p className="text-[14px] text-os-chrome mt-1">The Killers only saw: {hint}</p>
      </div>
    ) : null;
  }
  if (watching) {
    return (
      <div className="os-daycard">
        <p className="os-label text-[11px] text-os-chrome">{ghost ? 'GHOSTS WATCH THIS ONE' : 'YOU’RE WATCHING TODAY'}</p>
      </div>
    );
  }
  if (!word) {
    return (
      // Same colours and type as the word card below: only the words differ.
      <div className="os-daycard">
        <p className="os-label text-[11px] text-os-chrome">YOUR HINT</p>
        <p className={big}>{hint}</p>
        {!compact && <p className="text-[14px] text-os-chrome mt-1 os-balance">You don’t have the word.</p>}
      </div>
    );
  }
  return (
    <div className="os-daycard">
      <p className="os-label text-[11px] text-os-chrome">THE WORD</p>
      <p className={big}>{word}</p>
      {!compact && <p className="text-[14px] text-os-chrome mt-1">The Killers only see: {hint}</p>}
    </div>
  );
}

function ClueForm({ gid, c, me, card, players }) {
  const [text, setText, clearText] = useDraft(`${gid}.draft.clue.${c}`); // survives a reload until posted
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const names = players.map((p) => normalize(p.name)).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    const clue = text.trim();
    const why = !/^[\p{L}\p{N}'-]+$/u.test(clue) ? 'One word. No spaces.'
      : card.word && spoils(clue, card.word) ? 'That gives the word away.'
      : names.includes(normalize(clue)) ? 'No guest names.'
      : '';
    if (why) { sfxDeny(); setError(why); return; }
    setBusy(true);
    try {
      await postClue(gid, c, me.pid, clue);
      clearText();
      sfxSent();
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'Too late, or already posted.' : 'Not sent. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="px-4 mt-4" onSubmit={submit}>
      <input
        className="os-input"
        value={text}
        maxLength={CLUE_MAX}
        onChange={(e) => { setText(e.target.value.replace(/\s/g, '')); setError(''); }}
        placeholder="One word"
        aria-label="Your clue: one word"
        autoCapitalize="none"
        autoComplete="off"
        enterKeyHint="send"
      />
      {error && <p className="text-[14px] text-os-red mt-2">{error}</p>}
      <Btn type="submit" className="mt-3" busy={busy} disabled={!text.trim()}>Post to the wall</Btn>
    </form>
  );
}
