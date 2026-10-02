import React, { useEffect, useState } from 'react';
import { TRAITS, GENDER } from '../data/traits';
import { GAME } from '../data/killersCopy';
import { arrive, knock, cancelKnock, deviceCode } from '../firebase/game';
import Wallpaper from './art/Wallpaper';
import Portrait from './art/Portrait';
import { ART_W, ART_H } from './art/portraitArt';
import { SlideToUnlock } from './chrome';
import { AppFrame, Section, Btn, ActionSheet } from './ui';
import { useSeen, markSeen, peekSeen } from './seen';
import { primeSfx, sfxTap, sfxDeny, sfxBoot } from './sfx';

/**
 * Arrival, as a new phone's setup assistant. The first time a phone opens the
 * game it boots (the logo, a filling bar); then "hello" in a few languages,
 * slide to set up, the Terms of Service (which are the rules, told in the
 * fiction), your name, how to draw you (gender, for the photo only), six
 * one-tap questions, "your phone is ready".
 *
 * From the name onward the guest's contact photo sits large at the top: a
 * full-length drawing of them at home (art/Portrait.jsx). It works like a
 * character creator: every tap on an option is brushed into the photo at
 * once (the shirt takes its colour, glasses go on, shoes, a drink in the
 * hand, the birthday calendar, the family photo), and the guest can try
 * each option before Next moves on.
 *
 * The questions come before anyone has a role, which is the point
 * (data/traits.js): nobody knows yet whether they'll want to lie, so they
 * answer straight. Nothing is written until the last tap; one batch registers
 * the guest, so a guest never exists without answers.
 *
 * The review ("Almost done") is the last chance to change an answer: a tap
 * opens that question's options in a sheet and stays on the review. Once the
 * phone is ready the answers are never edited (firestore.rules); leaving
 * before the deal, or the host removing them, sends a guest back here.
 *
 * Progress is kept on the phone (seen.js, `<gid>.setup`), so a reload or a
 * closed browser picks up at the same question with the same answers.
 *
 * A guest who is already playing but got signed out (cleared data, a new
 * phone, the home-screen app) taps "Already playing?" on the hello screen
 * instead: `SignBackIn` asks the host, who signs this phone in as them.
 */

// Module-level so it is the same function every render: Boot's timer depends on it.
const finishBoot = () => markSeen('booted', true);

const HELLOS = ['hello', 'namaste', 'hola', 'bonjour', 'ciao', 'olá', 'hallo'];

// Gender first, for the photo only (never a clue: see GENDER in data/traits.js), then the six.
const QUESTIONS = [GENDER, ...TRAITS];

export default function Setup({ gid, uid, late }) {
  const booted = useSeen('booted', false);
  const saveKey = `${gid}.setup`;
  const [resume] = useState(() => peekSeen(saveKey) ?? {});
  const [step, setStep] = useState(resume.step ?? 'hello'); // (boot) | hello | back | terms | name | 0..5 | review
  const [name, setName] = useState(resume.name ?? '');
  const [answers, setAnswers] = useState(resume.answers ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null); // on the review: the question being changed in place

  useEffect(() => { markSeen(saveKey, { step, name, answers }); }, [saveKey, step, name, answers]);

  if (!booted) return <Boot onDone={finishBoot} />;
  if (step === 'back') return <SignBackIn gid={gid} uid={uid} onCancel={() => setStep('hello')} />;
  if (step === 'hello') return <Hello onDone={() => { primeSfx(); setStep('terms'); }} onBack={() => { primeSfx(); setStep('back'); }} late={late} />;
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
          <ProfileCard uid={uid} answers={answers} below={230}>
            <p className="text-[22px] leading-tight text-os-ink">{late ? 'You made it.' : `Welcome to ${GAME.title}.`}</p>
            <p className="text-[16px] mt-1 text-os-steel">What should the group call you?</p>
          </ProfileCard>
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
    const trait = QUESTIONS[step];
    const picked = answers[trait.id];
    const last = step + 1 === QUESTIONS.length;
    const rows = Math.ceil(trait.options.length / 2);
    return (
      <AppFrame
        key={trait.id}
        title={`${step + 1} of ${QUESTIONS.length}`}
        onBack={() => setStep(step === 0 ? 'name' : step - 1)}
        backLabel="Back"
        light
        enter="push"
        footer={(
          <div className="os-compose !items-center !px-3 !py-2">
            <Btn small className="flex-1" disabled={!picked} onClick={() => setStep(last ? 'review' : step + 1)}>{last ? 'Done' : 'Next'}</Btn>
          </div>
        )}
      >
        <ProfileCard uid={uid} answers={answers} name={name} below={150 + rows * 52}>
          <p className="os-label text-[12px] text-os-steel">{trait.id === GENDER.id ? 'FOR YOUR PHOTO · NEVER A CLUE' : trait.visible ? 'OTHERS CAN SEE THIS' : 'ONLY YOU KNOW THIS'}</p>
          <p className="text-[21px] leading-tight mt-1 text-os-ink">{trait.prompt}</p>
        </ProfileCard>
        {/* a tap dresses the photo straight away; Next moves on, so a guest can try each option on */}
        <div className="os-chips px-4 pt-3">
          {trait.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="os-chip"
              aria-pressed={picked === o.id}
              onClick={() => {
                sfxTap();
                setAnswers((a) => ({ ...a, [trait.id]: o.id }));
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <Dots n={QUESTIONS.length} at={step} />
        <div className="h-4" />
      </AppFrame>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await arrive(gid, uid, { name, traits: answers });
      markSeen(saveKey, null);
    } catch (e) {
      setError(e.code === 'permission-denied' ? 'That didn’t go through. Ask the host.' : 'No connection. Try again.');
      setBusy(false);
    }
  };

  // Changing an answer on the review stays on the review: a sheet of that
  // question's options, and the photo brushes the new one on.
  const asked = sheet ? QUESTIONS.find((t) => t.id === sheet) : null;
  const overlay = asked ? (
    <ActionSheet
      title={asked.prompt}
      options={asked.options.map((o) => ({ id: o.id, label: o.label, on: answers[asked.id] === o.id }))}
      onPick={(v) => { setAnswers((a) => ({ ...a, [asked.id]: v })); setSheet(null); }}
      onCancel={() => setSheet(null)}
    />
  ) : null;

  return (
    <AppFrame title="Almost done" onBack={() => setStep(QUESTIONS.length - 1)} backLabel="Back" light overlay={overlay}>
      <div className="flex flex-col items-center px-5 pt-5">
        <div className="os-photo os-rise">
          <Portrait traits={answers} seed={uid} full size={photoWidth(120)} rounded={3} animate />
        </div>
        <p className="text-[22px] leading-tight mt-3 text-os-ink">{name.trim()}</p>
        <p className="text-[14px] text-os-steel mt-0.5">How the others will see you</p>
      </div>
      <Section head="Your answers" foot="Tap one to change it. Once your phone is ready, they can’t be changed.">
        <div className="os-group">
          {QUESTIONS.map((t) => (
            <button key={t.id} type="button" className="os-choice" onClick={() => { sfxTap(); setSheet(t.id); }}>
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

/**
 * How wide the photo can be: as big as the phone allows once `below` pixels
 * of question and answers fit under it (plus the bars), never wider than 62%
 * of the screen, never under 120 (a short phone scrolls a little instead).
 */
function photoWidth(below) {
  if (typeof window === 'undefined') return 220;
  const byHeight = ((window.innerHeight - 44 - 56 - 40 - below) * ART_W) / ART_H;
  return Math.round(Math.max(120, Math.min(280, window.innerWidth * 0.62, byHeight)));
}

/**
 * The guest's contact photo as it is being made, large and centred, with the
 * screen's words under it. Every tap changes the picture at once: Portrait
 * brushes the new answer on (and fades the figure across for a gender change).
 */
function ProfileCard({ uid, answers, name, below, children }) {
  return (
    <div className="flex flex-col items-center px-5 pt-4 text-center">
      <div className="os-photo">
        <Portrait traits={answers} seed={uid} full size={photoWidth(below)} rounded={3} animate />
      </div>
      <div className="w-full pt-3">
        {name && <p className="os-label text-[12px] text-os-steel truncate mb-1">{name.trim().toUpperCase()}</p>}
        {children}
      </div>
    </div>
  );
}

const Dots = ({ n, at }) => (
  <div className="os-dots pt-6" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? 'on !bg-os-sea' : '!bg-os-steel/40'} />)}
  </div>
);

/** The first screen: "hello" cycling through languages, and slide to set up. */
function Hello({ onDone, onBack, late }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % HELLOS.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="os-lock">
      <Wallpaper variant="lock" />
      <div className="relative flex-1 grid place-items-center text-center px-6">
        <div>
          <div className="rounded-xl bg-os-abyss/75 border border-os-chrome/25 px-6 py-7 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
            <p key={i} className="os-hello os-pop">{HELLOS[i]}</p>
            <p className="text-[17px] mt-5 text-os-foam">{late ? 'The game has started. You can still join.' : `You’ve been invited to ${GAME.title}.`}</p>
          </div>
          <button type="button" className="os-signback" onClick={() => { sfxTap(); onBack(); }}>Already playing? Sign back in</button>
        </div>
      </div>
      <div className="relative os-lock__slider">
        <SlideToUnlock label="slide to set up" onDone={onDone} />
      </div>
    </div>
  );
}

/**
 * Signed out mid-game: ask the host to sign this phone back in. The guest
 * gives the name they joined with; the host sees it with this phone's code
 * and picks who they are. Waiting is kept on the phone, so a reload keeps
 * asking; once the host signs them in, PlayerApp's binding listener opens
 * the game by itself.
 */
function SignBackIn({ gid, uid, onCancel }) {
  const waitKey = `${gid}.knock`;
  const asked = useSeen(waitKey, '');
  const [name, setName] = useState(asked);
  const [error, setError] = useState('');

  // Asking again on every mount is harmless (one doc per phone), and it
  // restores the request after a reload.
  useEffect(() => {
    if (!asked) return;
    knock(gid, uid, asked).catch((e) => setError(e.code === 'permission-denied' ? 'This phone is already in the game.' : 'No connection. Try again.'));
  }, [gid, uid, asked]);

  const cancel = () => {
    markSeen(waitKey, null);
    cancelKnock(gid, uid).catch(() => {});
    onCancel();
  };

  if (asked) {
    return (
      <AppFrame title="Sign Back In" onBack={cancel} backLabel="Cancel" light enter="push">
        <div className="px-6 pt-8 text-center">
          <p className="text-[17px] text-os-steel">Show the host this code</p>
          <p className="os-arcade text-[34px] mt-3 text-os-ink tracking-[0.12em]">{deviceCode(uid)}</p>
          <p className="text-[16px] mt-3 text-os-ink">Signing back in as <b>{asked}</b></p>
        </div>
        <div className="pt-8 text-center">
          <div className="os-spinner mx-auto" />
          <p className="os-label mt-4 text-[12px] text-os-steel">WAITING FOR THE HOST…</p>
        </div>
        {error && <p className="text-os-red text-[15px] px-6 text-center">{error}</p>}
        <Section><Btn tone="grey" onClick={cancel}>Cancel</Btn></Section>
      </AppFrame>
    );
  }

  return (
    <AppFrame title="Sign Back In" onBack={onCancel} backLabel="Back" light enter="push">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          sfxTap();
          setError('');
          markSeen(waitKey, name.trim());
        }}
      >
        <div className="px-6 pt-6 text-center">
          <p className="text-[22px] leading-tight text-os-ink">Already playing?</p>
          <p className="text-[16px] mt-1 text-os-steel">If this phone lost the game, the host can sign you back in.</p>
        </div>
        <Section head="The name you joined with">
          <input className="os-input" autoFocus value={name} maxLength={24} autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
        </Section>
        <Section>
          <Btn type="submit" disabled={!name.trim()}>Ask the host</Btn>
        </Section>
      </form>
    </AppFrame>
  );
}

/**
 * First power-on: black, the game's title card (the game, not the DEEP BLUE
 * app: that is one app on this phone), a bar that fills in steps, a chime.
 * Once per phone (seen.js), so a reload mid-game never replays it.
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
        <p className="os-label text-[12px] text-os-steel">{GAME.by.toUpperCase()} PRESENTS</p>
        <p className="os-arcade text-[26px] leading-tight mt-3 px-8 text-white">{GAME.title}</p>
        <p className="os-label text-[12px] mt-3 text-os-steel">IN COLLABORATION WITH {GAME.with.toUpperCase()}</p>
        <div className="os-boot-bar"><i /></div>
        <p className="os-label text-[11px] mt-4 text-os-steel">SETTING UP… DO NOT TURN OFF</p>
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
  'Every morning, DEEP BLUE wakes you up.',
  'Every morning, everyone plays a short game.',
  'Whoever gets the lowest score dies.',
  'Some of you are Killers. Find them and vote them out.',
  'If you die or get voted out, keep your phone. You still play.',
  'The next questions are about you. Answer truthfully.',
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
          <p className="text-[12px] mt-4 text-os-steel">By tapping Agree you accept that the scores are final.</p>
        </div>
      </div>
    </AppFrame>
  );
}
