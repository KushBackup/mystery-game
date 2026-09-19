import React, { useState } from 'react';
import { claimWalkInPass } from '../firebase/config';

const PROFESSIONS = [
  'Software', 'Data / AI', 'Product', 'Design', 'Engineering', 'Architecture',
  'Marketing', 'Sales', 'Finance', 'Consulting', 'Accounting', 'Law', 'Medicine',
  'Dentistry', 'Psychology', 'Teaching', 'Academia', 'Media / Film', 'Journalism',
  'Music', 'Photography', 'Fashion', 'Hospitality', 'Real estate', 'Fitness',
  'Government', 'Nonprofit', 'HR / Ops', 'Founder', 'Freelance', 'Student',
];

const TRAITS = [
  'Observant', 'Analytical', 'Charming', 'Chaotic', 'Patient', 'Sarcastic', 'Loyal',
  'Reckless', 'Calculating', 'Quiet', 'Dangerous', 'Curious', 'Impulsive', 'Secretive',
  'Ambitious', 'Creative', 'Unpredictable', 'Ruthless', 'Witty', 'Sly', 'Intense',
  'Stubborn', 'Generous', 'Jealous', 'Fearless', 'Anxious', 'Confident', 'Blunt',
  'Diplomatic', 'Vain', 'Paranoid', 'Warm', 'Cold', 'Restless', 'Meticulous',
  'Gullible', 'Manipulative', 'Honest', 'Dramatic', 'Detached', 'Playful', 'Protective',
  'Competitive', 'Cynical', 'Optimistic', 'Bold',
];

const CONFESSIONS = [
  'Lied on a resume', 'Ghosted someone close', 'Took undeserved credit',
  'Read someone’s texts', 'Snooped through a phone', 'Screenshotted a chat',
  'Broke it, said nothing', 'Stole something small', 'Kept the change',
  'Never gave it back', 'Faked being sick', 'Cried at work', 'Cheated at a game',
  'Ate someone’s lunch', 'Blamed the dog', 'Pretended to read it',
  'Sent it to the wrong chat', 'Told the same lie twice', 'Forgot a birthday',
  'Laughed at bad news', 'Left without paying', 'Lied about my age',
  'Unfollowed, then refollowed', 'Hiding something right now',
];

const STEPS = ['Pass', 'Profession', 'Traits', 'Talent', 'Check-in', 'Confession'];

const FieldLabel = ({ children }) => (
  <label className="er-mono er-mono--dim block mb-2">{children}</label>
);

export const WalkInRegistration = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [passCode, setPassCode] = useState('');
  const [profession, setProfession] = useState('');
  const [otherProfession, setOtherProfession] = useState('');
  const [traits, setTraits] = useState([]);
  const [hiddenTalent, setHiddenTalent] = useState('');
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [confession, setConfession] = useState('');
  const [otherConfession, setOtherConfession] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(null);

  const toggleTrait = (trait) => {
    setTraits((current) =>
      current.includes(trait)
        ? current.filter((item) => item !== trait)
        : current.length < 3
          ? [...current, trait]
          : current
    );
  };

  const next = () => {
    setError('');
    if (step === 0 && !passCode.trim()) return setError('Enter the pass issued by the host.');
    if (step === 1 && !(profession === 'Other' ? otherProfession.trim() : profession)) return setError('Choose your profession.');
    if (step === 2 && traits.length !== 3) return setError('Choose exactly three traits.');
    if (step === 3 && !hiddenTalent.trim()) return setError('Add your hidden talent.');
    if (step === 4 && (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim())) return setError('Complete all three check-in fields.');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await claimWalkInPass(passCode, {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        profession: profession === 'Other' ? otherProfession : profession,
        traits,
        hiddenTalent,
        confession: confession === 'Other' ? otherConfession : confession,
      });
      setClaimed(result);
    } catch (claimError) {
      setError(claimError?.message || 'Registration failed. Ask the host for a new pass.');
    } finally {
      setBusy(false);
    }
  };

  if (claimed) {
    return (
      <div className="min-h-screen bg-ink text-bone flex items-center justify-center px-4 py-10 relative er-grain">
        <div className="er-lamp" aria-hidden="true" />
        <section className="relative z-10 er-card er-card--signal er-land w-full max-w-md p-6 text-center">
          <p className="er-mono er-mono--hot er-mono--wide">Walk-in recorded</p>
          <h1 className="er-title mt-3">You Are In The Room</h1>
          <div className="er-rule my-5" />
          <p className="font-body text-[16px] leading-[1.55] text-dim">
            Your access code is below. Keep it if this phone reloads during the game.
          </p>
          <p className="font-mono text-[28px] tracking-[0.14em] text-bone mt-5 break-all">{claimed.loginCode}</p>
          <button
            type="button"
            onClick={() => onComplete(claimed)}
            className="er-touch er-touch--hot w-full mt-7 bg-signal border border-signal py-4 font-mono text-[12px] font-medium uppercase tracking-[0.24em] text-white"
          >
            Enter the case
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex items-center justify-center px-4 py-8 relative er-grain overflow-hidden">
      <div className="er-lamp" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <span className="er-mono er-mono--wide er-mono--bone">Walk-in file</span>
          <span className="er-mono er-mono--dim">{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
        </div>
        <div className="er-rule mt-3" />

        <form onSubmit={step === STEPS.length - 1 ? submit : (event) => { event.preventDefault(); next(); }} className="er-bone er-pin er-rotL mt-7 p-5 sm:p-7">
          <p className="er-bone-label">{STEPS[step]}</p>
          <h1 className="font-typewriter font-bold uppercase text-ink text-[25px] sm:text-[31px] leading-[1.1] mt-3">
            {[
              'Enter your host pass',
              'Your official cover story',
              'Choose your three traits',
              'What can you do in secret?',
              'Whose statement is this?',
              'One harmless confession',
            ][step]}
          </h1>
          <div className="er-bone-rule mt-4 mb-6" />

          {step === 0 && (
            <div>
              <FieldLabel>Host-issued pass</FieldLabel>
              <input value={passCode} onChange={(event) => setPassCode(event.target.value.toUpperCase())} className="er-blank er-blank--onbone w-full text-center text-[26px] py-3" placeholder="CANDLE" autoFocus autoComplete="off" maxLength={20} />
              <p className="er-bone-body text-[13px] mt-4">Ask the host for one registration word before filing a walk-in statement.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Profession</FieldLabel>
                <select value={profession} onChange={(event) => setProfession(event.target.value)} className="w-full bg-bone border border-line-bone px-3 py-3 font-body text-[16px] text-ink">
                  <option value="">Choose one…</option>
                  {PROFESSIONS.map((option) => <option key={option}>{option}</option>)}
                  <option>Other</option>
                </select>
              </div>
              {profession === 'Other' && <input value={otherProfession} onChange={(event) => setOtherProfession(event.target.value)} className="er-blank er-blank--onbone w-full py-3" placeholder="Your official cover story…" maxLength={60} />}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="er-bone-body text-[14px] mb-4">{traits.length} of 3 selected</p>
              <div className="flex flex-wrap gap-2 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                {TRAITS.map((trait) => {
                  const selected = traits.includes(trait);
                  return <button key={trait} type="button" onClick={() => toggleTrait(trait)} className={`er-touch px-3 py-2 border font-mono text-[11px] uppercase tracking-[0.12em] ${selected ? 'bg-ink border-ink text-bone' : 'border-line-bone text-ink'}`}>{trait}</button>;
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <FieldLabel>Hidden talent</FieldLabel>
              <input value={hiddenTalent} onChange={(event) => setHiddenTalent(event.target.value)} className="er-blank er-blank--onbone w-full py-3" placeholder="The thing you do at 2 AM…" autoFocus maxLength={140} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {[
                ['name', 'Full name', 'The name on your ID badge…', 'text'],
                ['phone', 'Phone', 'Where your character reaches you', 'tel'],
                ['email', 'Email', 'you@wherever-they-pay-you.com', 'email'],
              ].map(([key, label, placeholder, type]) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input type={type} value={contact[key]} onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))} className="er-blank er-blank--onbone w-full py-3" placeholder={placeholder} autoComplete="off" maxLength={key === 'email' ? 120 : 60} />
                </div>
              ))}
              <p className="er-bone-body text-[12px]">Phone and email stay in the host file. They are never shown to other players.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <FieldLabel>Optional</FieldLabel>
              <select value={confession} onChange={(event) => setConfession(event.target.value)} className="w-full bg-bone border border-line-bone px-3 py-3 font-body text-[16px] text-ink">
                <option value="">Prefer not to say</option>
                {CONFESSIONS.map((option) => <option key={option}>{option}</option>)}
                <option>Other</option>
              </select>
              {confession === 'Other' && <input value={otherConfession} onChange={(event) => setOtherConfession(event.target.value)} className="er-blank er-blank--onbone w-full py-3" placeholder="Go on. The room is sealed. Probably." maxLength={140} />}
            </div>
          )}

          {error && <p className="er-tag er-tag--onbone mt-5">{error}</p>}

          <div className="flex gap-3 mt-7">
            {step > 0 && <button type="button" onClick={() => { setError(''); setStep((current) => current - 1); }} className="er-touch flex-1 border border-line-bone py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-ink">Back</button>}
            <button type="submit" disabled={busy} className="er-touch er-touch--hot flex-1 bg-ink border border-ink py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-bone disabled:opacity-40">{busy ? 'Filing…' : step === STEPS.length - 1 ? 'File statement' : 'Continue'}</button>
          </div>
        </form>

        <button type="button" onClick={onCancel} className="er-touch block mx-auto mt-6 er-mono er-mono--dim">Back to access code</button>
      </div>
    </div>
  );
};
