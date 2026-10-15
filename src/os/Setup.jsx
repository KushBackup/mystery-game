import React, { useEffect, useState } from 'react';
import { TRAITS, GENDER } from '../data/traits';
import { GAME, CASE } from '../data/killersCopy';
import { arrive, knock, cancelKnock, deviceCode } from '../firebase/game';
import Wallpaper from './art/Wallpaper';
import Portrait from './art/Portrait';
import { warmPortrait } from './art/portraitCache';
import { ART_W, ART_H } from './art/portraitArt';
import { SlideToUnlock } from './chrome';
import { AppFrame, Section, Btn, ActionSheet } from './ui';
import { useSeen, markSeen, peekSeen } from './seen';
import { primeSfx, sfxTap, sfxDeny, sfxBoot } from './sfx';
import { useKeyboard } from './keyboard';
import { avatarFile, canShareFile, shareAvatar, saveAvatar } from './avatarImage';

/**
 * Arrival, as a new phone's setup assistant. The first time a phone opens the
 * game it boots (the logo, a filling bar); then "hello" in a few languages,
 * slide to set up, the Terms of Service (which are the rules, told in the
 * fiction), your name, how to draw you (gender, for the photo only), seven
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

// A first name: capitalised, never "corrected", and the keyboard's return key reads Next.
const NAME_FIELD = { type: 'text', autoComplete: 'given-name', autoCapitalize: 'words', autoCorrect: 'off', spellCheck: false, enterKeyHint: 'next' };
// The name screen's photo while the keyboard is up, so the field and Next stay above the keys.
const NAME_PHOTO_KEYBOARD = 66;

const HELLOS = ['hello', 'namaste', 'hola', 'bonjour', 'ciao', 'olá', 'hallo'];

// Gender first, for the photo only (never a clue: see GENDER in data/traits.js), then the seven.
const QUESTIONS = [GENDER, ...TRAITS];

export default function Setup({ gid, uid, late }) {
  const booted = useSeen('booted', false);
  const saveKey = `${gid}.setup`;
  const [resume] = useState(() => peekSeen(saveKey) ?? {});
  const [step, setStep] = useState(resume.step ?? 'hello'); // (boot) | hello | back | case | terms | name | 0..5 | review
  const [name, setName] = useState(resume.name ?? '');
  const [answers, setAnswers] = useState(resume.answers ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null); // on the review: the question being changed in place
  // With the keyboard up the name screen has a third of the height: the photo
  // drops to a thumbnail so the field and Next stay above the keys.
  const keyboard = useKeyboard();

  useEffect(() => { markSeen(saveKey, { step, name, answers }); }, [saveKey, step, name, answers]);

  // Paint the photos the next tap could show while the phone is idle: every
  // option of this question, and the next screen's photo. A photo costs a
  // mid-range Android phone ~100 ms, so a tap that has to paint one lags.
  // The Terms screen paints the name screen's photo (both its sizes), which
  // is also the first photo the phone ever paints, and the slowest.
  useEffect(() => {
    if (step !== 'terms' && step !== 'name' && typeof step !== 'number') return undefined;
    const jobs = [];
    const warm = (traits, at, size = photoSize(at)) => jobs.push(() => warmPortrait({ traits, seed: uid, full: true, size }));
    if (typeof step === 'number') {
      // the options first: a tap comes before Next
      for (const o of QUESTIONS[step].options) warm({ ...answers, [QUESTIONS[step].id]: o.id }, step);
      warm(answers, step + 1 < QUESTIONS.length ? step + 1 : 'review');
    } else if (step === 'terms') {
      warm(answers, 'name');
      warm(answers, 'name', NAME_PHOTO_KEYBOARD);
    } else {
      warm(answers, 0);
    }
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 150));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    let handle = 0;
    const next = () => { if (jobs.length) handle = idle(() => { jobs.shift()(); next(); }); };
    next();
    return () => cancel(handle);
  }, [step, answers, uid]);

  if (!booted) return <Boot onDone={finishBoot} />;
  if (step === 'back') return <SignBackIn gid={gid} uid={uid} onCancel={() => setStep('hello')} />;
  if (step === 'hello') return <Hello onDone={() => { primeSfx(); setStep('case'); }} onBack={() => { primeSfx(); setStep('back'); }} late={late} />;
  if (step === 'case') return <Case onNext={() => setStep('terms')} />;
  if (step === 'terms') return <Terms onAgree={() => setStep('name')} onBack={() => setStep('case')} />;

  if (step === 'name') {
    return (
      <AppFrame title="Set Up Phone" light enter="push">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(0);
          }}
        >
          <ProfileCard uid={uid} answers={answers} size={keyboard ? NAME_PHOTO_KEYBOARD : photoSize('name')}>
            <p className="text-[22px] leading-tight text-os-ink">{late ? 'You made it.' : `Welcome to ${GAME.title}.`}</p>
            <p className="text-[16px] mt-1 text-os-steel">What should the group call you?</p>
          </ProfileCard>
          <Section head="Your first name">
            <input className="os-input" autoFocus value={name} maxLength={24} {...NAME_FIELD} onChange={(e) => setName(e.target.value)} />
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
        <ProfileCard uid={uid} answers={answers} name={name} size={photoSize(step)}>
          <p className="os-label text-[12px] text-os-steel">{trait.id === GENDER.id ? 'FOR YOUR PHOTO · NEVER A CLUE' : trait.visible ? 'OTHERS CAN SEE THIS' : 'ONLY YOU KNOW THIS'}</p>
          <p className="text-[21px] leading-tight mt-1 text-os-ink">{trait.prompt}</p>
        </ProfileCard>
        {/* a tap dresses the photo straight away; Next moves on, so a guest can try each option on */}
        <div className={`os-chips ${chipCols(trait) === 3 ? 'os-chips--3' : ''} px-4 pt-3`}>
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
          <Portrait traits={answers} seed={uid} full size={photoSize('review')} rounded={3} animate />
        </div>
        <p className="text-[22px] leading-tight mt-3 text-os-ink">{name.trim()}</p>
        <p className="text-[14px] text-os-steel mt-0.5">How the others will see you</p>
        <AvatarActions traits={answers} seed={uid} name={name} />
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
// The screen's height with no keyboard up: a keyboard (and Android resizing the
// page for one) only ever makes it shorter, so keep the tallest seen at this width.
let room = { w: 0, h: 0 };
function roomHeight() {
  if (room.w !== window.innerWidth) room = { w: window.innerWidth, h: 0 };
  room.h = Math.max(room.h, window.innerHeight);
  return room.h;
}

function photoWidth(below) {
  if (typeof window === 'undefined') return 220;
  const byHeight = ((roomHeight() - 44 - 56 - 40 - below) * ART_W) / ART_H;
  return Math.round(Math.max(120, Math.min(280, window.innerWidth * 0.62, byHeight)));
}

// A long question's options go three across, so its rows don't push the photo down to a thumbnail.
const chipCols = (trait) => (trait.options.length > 8 ? 3 : 2);

/** The photo's width on each screen of Setup: the name, a question (by its rows of options), the review. */
function photoSize(step) {
  if (step === 'name') return photoWidth(230);
  if (typeof step === 'number') {
    const q = QUESTIONS[step];
    return photoWidth(150 + Math.ceil(q.options.length / chipCols(q)) * 52);
  }
  return photoWidth(120);
}

/**
 * The guest's contact photo as it is being made, large and centred, with the
 * screen's words under it. Every tap changes the picture at once: Portrait
 * brushes the new answer on (and fades the figure across for a gender change).
 */
function ProfileCard({ uid, answers, name, size, children }) {
  return (
    <div className="flex flex-col items-center px-5 pt-4 text-center">
      <div className="os-photo">
        <Portrait traits={answers} seed={uid} full size={size} rounded={3} animate />
      </div>
      <div className="w-full pt-3">
        {name && <p className="os-label text-[12px] text-os-steel truncate mb-1">{name.trim().toUpperCase()}</p>}
        {children}
      </div>
    </div>
  );
}

/**
 * Share and Save under the finished photo on the review. The image file is
 * painted ahead (os/avatarImage.js) and again after any answer changes, so a
 * tap opens the share sheet at once, as iOS requires. Share only shows when
 * the phone can share an image file.
 */
function AvatarActions({ traits, seed, name }) {
  const [painted, setPainted] = useState({ key: '', file: null });
  const [note, setNote] = useState('');
  const [shareable] = useState(() => canShareFile());
  const key = `${JSON.stringify(traits)}|${seed}|${name}`;
  // a photo painted for answers that have since changed is not this photo
  const file = painted.key === key ? painted.file : null;

  useEffect(() => {
    let live = true;
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 300));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => { avatarFile({ traits, seed, name }).then((f) => { if (live) setPainted({ key, file: f }); }); });
    return () => { live = false; cancel(handle); };
    // `key` stands in for `traits`, which is a new object on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!note) return undefined;
    const id = setTimeout(() => setNote(''), 2400);
    return () => clearTimeout(id);
  }, [note]);

  const share = async () => {
    if (!(await shareAvatar(file))) setNote('Couldn’t share. Try Save.');
  };
  const save = async () => {
    const how = await saveAvatar(file);
    if (how === 'downloaded') setNote('Saved to your downloads');
    else if (how === 'failed') setNote('Couldn’t save. Try again.');
  };

  return (
    <div className="w-full flex flex-col items-center mt-3">
      <div className="flex gap-2">
        {shareable && <Btn small tone="grey" busy={!file} onClick={share}>Share image</Btn>}
        <Btn small tone="grey" busy={!file} onClick={save}>Save image</Btn>
      </div>
      <p className="text-[13px] text-os-steel h-5 mt-1" role="status">{note}</p>
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
          <input className="os-input" autoFocus value={name} maxLength={24} {...NAME_FIELD} onChange={(e) => setName(e.target.value)} />
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
 * The case, before anything else (2026-10-15). After the 3 Oct game, guests
 * reached the questions without knowing what DEEP BLUE was, who the Killers
 * were or what they were playing for. Three short panels say it plainly:
 * the app, the Killers, the goal (CASE in data/killersCopy.js). The same for
 * every guest; no role exists yet.
 */
function Case({ onNext }) {
  return (
    <AppFrame
      title={GAME.title}
      light
      enter="push"
      footer={(
        <div className="os-compose !items-center !px-3 !py-2">
          <Btn small className="flex-1" onClick={() => { sfxTap(); onNext(); }}>Got it</Btn>
        </div>
      )}
    >
      <div className="px-4 pt-5 pb-6 space-y-3">
        <p className="os-label text-[12px] text-os-steel">THE CASE · READ THIS FIRST</p>
        {CASE.map((panel, i) => (
          <div key={panel.kicker} className="os-paper rounded-md px-4 py-3">
            <p className="flex items-baseline gap-2">
              <span className="os-arcade text-[13px] text-os-steel">{i + 1}.</span>
              <span className="text-[18px] font-bold leading-tight">{panel.kicker}</span>
            </p>
            <div className="mt-2 space-y-1.5">
              {panel.lines.map((l) => <p key={l} className="text-[16px] leading-snug">{l}</p>)}
            </div>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}

/**
 * The Terms of Service. Every guest reads the rules as a contract with a
 * cursed app. "Disagree" doesn't work, which is the most important clause.
 * They restate the case (above) as rules, and end on why the questions that
 * follow matter: the Killers' answers are in there too.
 */
const CLAUSES = [
  'DEEP BLUE is on your phone now. You cannot delete it.',
  'Every morning, everyone plays a quick game. The lowest score is killed.',
  'Three of you are Killers. Each night they push one score to the bottom.',
  'The top of the board is locked. Play well and the Killers can’t touch you.',
  'Find clues, accuse a suspect, and vote. The room’s choice is killed.',
  'If you are killed, keep your phone. You still play, as a ghost.',
  'Answer the next questions truthfully. The Killers answer them too, and every clue is about their answers.',
];

function Terms({ onAgree, onBack }) {
  const [refused, setRefused] = useState(0);
  return (
    <AppFrame
      title="Terms"
      onBack={onBack}
      backLabel="Case"
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
