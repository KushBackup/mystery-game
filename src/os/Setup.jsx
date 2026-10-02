import React, { useEffect, useState } from 'react';
import { TRAITS } from '../data/traits';
import { arrive } from '../firebase/game';
import Wallpaper from './art/Wallpaper';
import { SlideToUnlock } from './chrome';
import { AppFrame, Section, Btn } from './ui';
import AppIcon from './icons/AppIcon';
import { useSeen, markSeen } from './seen';
import { primeSfx, sfxTap, sfxDeny, sfxBoot } from './sfx';

/**
 * Arrival, as a new phone's setup assistant. The first time a phone opens the
 * game it boots (the logo, a filling bar); then "hello" in a few languages,
 * slide to set up, the Terms of Service (which are the rules, told in the
 * fiction), your name, six one-tap questions, "your phone is ready".
 *
 * The questions come before anyone has a role, which is the point
 * (data/traits.js): nobody knows yet whether they'll want to lie, so they
 * answer straight. Nothing is written until the last tap; one batch registers
 * the guest, so a guest never exists without answers.
 */

// Module-level so it is the same function every render: Boot's timer depends on it.
const finishBoot = () => markSeen('booted', true);

const HELLOS = ['hello', 'namaste', 'hola', 'bonjour', 'ciao', 'olá', 'hallo'];

export default function Setup({ gid, uid, pack, late }) {
  const booted = useSeen('booted', false);
  const [step, setStep] = useState('hello'); // (boot) | hello | terms | name | 0..5 | review
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!booted) return <Boot onDone={finishBoot} />;
  if (step === 'hello') return <Hello onDone={() => { primeSfx(); setStep('terms'); }} late={late} />;
  if (step === 'terms') return <Terms onAgree={() => setStep('name')} />;

  if (step === 'name') {
    return (
      <AppFrame title="Set Up Phone" light enter="push">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(0);
          }}
        >
          <div className="px-5 pt-6">
            <p className="text-[24px] leading-tight text-os-ink">{late ? 'You made it.' : 'Welcome to DEEP BLUE.'}</p>
            <p className="text-[16px] mt-2 text-os-steel">What should the group call you?</p>
          </div>
          <Section head="Your first name">
            <input className="os-input" autoFocus value={name} maxLength={24} autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
          </Section>
          <Section>
            <Btn type="submit" disabled={!name.trim()}>Next</Btn>
          </Section>
        </form>
      </AppFrame>
    );
  }

  if (typeof step === 'number') {
    const trait = TRAITS[step];
    return (
      <AppFrame key={trait.id} title={`${step + 1} of ${TRAITS.length}`} onBack={() => setStep(step === 0 ? 'name' : step - 1)} backLabel="Back" light enter="push">
        <div className="px-5 pt-6">
          <p className="os-label text-[12px] text-os-steel">{trait.visible ? 'OTHERS CAN SEE THIS' : 'ONLY YOU KNOW THIS'}</p>
          <p className="text-[24px] leading-tight mt-2 text-os-ink">{trait.prompt}</p>
        </div>
        <Section>
          <div className="os-group">
            {trait.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className="os-choice"
                aria-pressed={answers[trait.id] === o.id}
                onClick={() => {
                  sfxTap();
                  setAnswers((a) => ({ ...a, [trait.id]: o.id }));
                  setStep(step + 1 < TRAITS.length ? step + 1 : 'review');
                }}
              >
                <span className="flex-1">{o.label}</span>
              </button>
            ))}
          </div>
        </Section>
        <Dots n={TRAITS.length} at={step} />
      </AppFrame>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await arrive(gid, uid, { name, traits: answers });
    } catch (e) {
      setError(e.code === 'permission-denied' ? 'That didn’t go through. Ask the host.' : 'No connection. Try again.');
      setBusy(false);
    }
  };

  return (
    <AppFrame title="Almost done" onBack={() => setStep(TRAITS.length - 1)} light>
      <div className="px-5 pt-6">
        <p className="text-[26px] leading-tight text-os-ink">{name.trim()}</p>
        <p className="text-[15px] text-os-steel mt-1">{pack.title}</p>
      </div>
      <Section head="Your answers" foot="These lock when the roles are dealt. Tap one to change it.">
        <div className="os-group">
          {TRAITS.map((t, i) => (
            <button key={t.id} type="button" className="os-choice" onClick={() => setStep(i)}>
              <span className="flex-1 text-[14px] text-os-steel">{t.prompt.replace('?', '')}</span>
              <span className="shrink-0">{t.options.find((o) => o.id === answers[t.id])?.label}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section>
        {error && <p className="text-os-red text-[15px] mb-2">{error}</p>}
        <Btn tone="green" busy={busy} onClick={submit}>My phone is ready</Btn>
      </Section>
      <div className="h-8" />
    </AppFrame>
  );
}

const Dots = ({ n, at }) => (
  <div className="os-dots pt-6" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? 'on !bg-os-sea' : '!bg-os-steel/40'} />)}
  </div>
);

/** The first screen: "hello" cycling through languages, and slide to set up. */
function Hello({ onDone, late }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % HELLOS.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="os-lock">
      <Wallpaper variant="lock" />
      <div className="relative flex-1 grid place-items-center text-center px-6">
        <div className="rounded-xl bg-os-abyss/75 border border-os-chrome/25 px-6 py-7 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
          <p key={i} className="os-hello os-pop">{HELLOS[i]}</p>
          <p className="text-[17px] mt-5 text-os-foam">{late ? 'The game has started. You can still join.' : 'You’ve been invited to DEEP BLUE.'}</p>
        </div>
      </div>
      <div className="relative os-lock__slider">
        <SlideToUnlock label="slide to set up" onDone={onDone} />
      </div>
    </div>
  );
}

/**
 * First power-on: black, the logo, a bar that fills in steps, a chime. Once
 * per phone (seen.js), so a reload mid-game never replays it.
 */
function Boot({ onDone }) {
  useEffect(() => {
    sfxBoot();
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div className="os-alarm grid place-items-center" onClick={onDone} role="presentation">
      <div className="text-center os-rise">
        <div className="flex justify-center"><AppIcon name="deepblue" size={88} /></div>
        <p className="os-arcade text-[21px] mt-6 text-white tracking-[0.1em]">DEEP BLUE</p>
        <div className="os-boot-bar"><i /></div>
        <p className="os-label text-[11px] mt-4 text-os-steel">INSTALLING… DO NOT TURN OFF</p>
      </div>
    </div>
  );
}

/**
 * The Terms of Service. Every guest reads the rules without being handed
 * rules: they're a contract with a cursed app. "Disagree" doesn't work, which
 * is the most important clause.
 */
const CLAUSES = [
  'DEEP BLUE rings every morning. You will wake up.',
  'Every morning, everyone plays a game: a word, a sketch, or the run. Everyone gets a score.',
  'The lowest score on the board is taken by the deep.',
  'Some of you have the admin password. They choose whose score sinks. Find them, and vote them out.',
  'The taken keep their phones. They can still whisper.',
  'The next six questions are about you. Answer truthfully: the clues about the killer will describe these answers.',
];

function Terms({ onAgree }) {
  const [refused, setRefused] = useState(0);
  return (
    <AppFrame
      title="Terms"
      light
      enter="push"
      footer={(
        <div className="os-compose !items-center !px-3 !py-2 gap-2">
          <button key={refused} type="button" className={`os-btn os-btn--grey os-btn--sm flex-1 ${refused ? 'os-shake' : ''}`} onClick={() => { sfxDeny(); setRefused((n) => n + 1); }}>
            {refused ? 'There is no disagree' : 'Disagree'}
          </button>
          <button type="button" className="os-btn os-btn--sm flex-1" onClick={() => { sfxTap(); onAgree(); }}>Agree</button>
        </div>
      )}
    >
      <div className="px-4 pt-5 pb-6">
        <div className="os-paper rounded-md px-4 py-4">
          <p className="os-label text-[12px] text-os-steel">DEEP BLUE · END USER AGREEMENT</p>
          <ol className="mt-3 space-y-3">
            {CLAUSES.map((c, i) => (
              <li key={i} className="flex gap-3 text-[16px] leading-snug">
                <span className="os-arcade text-[13px] pt-1 text-os-steel">{i + 1}.</span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] mt-4 text-os-steel">By tapping Agree you accept that the board is final.</p>
        </div>
      </div>
    </AppFrame>
  );
}
