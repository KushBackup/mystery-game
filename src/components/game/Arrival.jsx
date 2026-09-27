import React, { useState } from 'react';
import { TRAITS } from '../../data/traits';
import { arrive } from '../../firebase/game';
import { Screen, Action } from './parts';

/**
 * Arrival: the door. Name, table, then six one-tap questions, one per card.
 *
 * The questions come before any role exists, which is the point (data/
 * traits.js): nobody knows yet whether they'll want to lie, so they answer
 * straight. That is said once, on the name card, because a guest who
 * understands why the questions matter answers them carefully.
 *
 * Nothing is written until the last answer. One batch registers the guest,
 * so a guest never exists without traits.
 */
export default function Arrival({ gid, uid, pack, late }) {
  const [step, setStep] = useState(-1); // -1 = name card, 0..5 = traits, 6 = confirm
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const trait = TRAITS[step];

  const pick = (optionId) => {
    setAnswers((a) => ({ ...a, [trait.id]: optionId }));
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await arrive(gid, uid, { name, table, traits: answers });
    } catch (e) {
      setError(e.code === 'permission-denied' ? 'That didn’t go through. Ask the host.' : 'No connection. Try again.');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div className="pt-10">
        <p className="er-mono er-mono--hot er-mono--wide">{pack.title}</p>
        <div className="er-rule my-4" />

        {step === -1 && (
          <form
            className="er-enter"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep(0);
            }}
          >
            <h1 className="er-title">{late ? 'You made it.' : 'Welcome.'}</h1>
            <p className="font-body text-[15px] text-dim mt-3">
              Six quick questions about you. Answer honestly: the killer&rsquo;s clues will describe these.
            </p>
            <label className="block mt-6">
              <span className="er-mono">Your first name</span>
              <input
                autoFocus
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full bg-ink-raised border border-line focus:border-signal outline-none px-3 py-3 font-typewriter text-[20px] text-bone"
                autoComplete="given-name"
              />
            </label>
            <label className="block mt-4">
              <span className="er-mono">Table number (if you have one)</span>
              <input
                value={table}
                maxLength={3}
                inputMode="numeric"
                onChange={(e) => setTable(e.target.value.replace(/\D/g, ''))}
                className="mt-2 w-28 bg-ink-raised border border-line focus:border-signal outline-none px-3 py-3 font-typewriter text-[20px] text-bone"
              />
            </label>
            <Action className="mt-8" disabled={!name.trim()} onClick={() => name.trim() && setStep(0)}>
              Next
            </Action>
          </form>
        )}

        {trait && (
          <div key={trait.id} className="er-enter-right">
            <p className="er-mono">
              <span className="er-num text-[16px]">{step + 1}</span> / {TRAITS.length}
              {trait.visible ? ' · others can see this' : ''}
            </p>
            <h2 className="font-typewriter text-[24px] leading-tight mt-3 text-bone">{trait.prompt}</h2>
            <div className="grid grid-cols-2 gap-2 mt-6">
              {trait.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => pick(o.id)}
                  className={`er-touch er-press px-3 py-4 border text-left font-typewriter text-[17px] ${
                    answers[trait.id] === o.id ? 'border-signal bg-ink-hover' : 'border-line bg-ink-raised'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep((s) => s - 1)} className="er-touch er-mono mt-6">
              &larr; Back
            </button>
          </div>
        )}

        {step === TRAITS.length && (
          <div className="er-enter">
            <h2 className="er-title">{name.trim()}</h2>
            <ul className="mt-5 space-y-2">
              {TRAITS.map((t, i) => (
                <li key={t.id} className="flex justify-between gap-3 border-b border-line-faint pb-2">
                  <button type="button" className="er-mono text-left" onClick={() => setStep(i)}>{t.prompt.replace('?', '')}</button>
                  <span className="font-typewriter text-bone shrink-0">{t.options.find((o) => o.id === answers[t.id])?.label}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-[14px] text-dim mt-4">These lock when the roles are dealt. Tap one to change it.</p>
            {error && <p className="er-mono er-mono--hot mt-3">{error}</p>}
            <Action className="mt-6" busy={busy} onClick={submit}>
              I&rsquo;m in
            </Action>
          </div>
        )}
      </div>
    </Screen>
  );
}
