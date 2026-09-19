import React, { useState } from 'react';
import { issueWalkInPass, removeWalkIn, revokeWalkInPass, WALK_IN_WORDS } from '../../firebase/config';
import { ChevronRight } from '../icons/IconComponents';
import { Numeral } from '../ui/Numeral';

const Control = ({ disabled, danger, children, className = '', ...props }) => (
  <button
    disabled={disabled}
    className={`er-touch w-full px-4 py-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] bg-ink-raised border ${
      disabled
        ? 'border-line text-dim-2 cursor-not-allowed'
        : danger
          ? 'border-line text-signal-lift hover:border-signal'
          : 'border-line text-bone hover:border-signal'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ label, meta, children }) => (
  <section className="er-card">
    <div className="flex items-baseline justify-between gap-3">
      <p className="er-mono er-mono--wide er-mono--bone">{label}</p>
      {meta && <span className="er-mono er-mono--dim">{meta}</span>}
    </div>
    <div className="er-rule mt-3 mb-4" />
    {children}
  </section>
);

export const WalkInManagementView = ({ walkIns = [], walkInPasses = [], onBack, onFeedback }) => {
  const [busy, setBusy] = useState(false);
  const activeWalkIns = walkIns.filter((walkIn) => walkIn.active);
  const pendingPasses = walkInPasses.filter((pass) => pass.status === 'OPEN');
  const activeWords = new Set([
    ...walkInPasses.flatMap((pass) => [pass.code, pass.loginCode]),
    ...walkIns.map((walkIn) => walkIn.loginCode),
  ]);

  const notify = (feedback) => {
    onFeedback?.(feedback);
    setTimeout(() => onFeedback?.(null), 3000);
  };

  const issuePass = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const pass = await issueWalkInPass();
      notify({ type: 'success', msg: `REGISTRATION WORD ISSUED: ${pass.code}` });
    } catch (error) {
      console.error('Could not issue walk-in pass:', error);
      notify({ type: 'error', msg: `Could not issue a registration word: ${error?.code || error?.message || 'unknown error'}` });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (walkIn) => {
    if (!window.confirm(`Remove ${walkIn.name} from the live game? Their guest file and active vote influence disappear from every device.`)) return;
    setBusy(true);
    try {
      await removeWalkIn(walkIn.id);
      notify({ type: 'info', msg: `WALK-IN REMOVED: ${walkIn.name}` });
    } catch (error) {
      console.error('Could not remove walk-in:', error);
      notify({ type: 'error', msg: `Could not remove ${walkIn.name}.` });
    } finally {
      setBusy(false);
    }
  };

  const revokePass = async (pass) => {
    if (!window.confirm(`Revoke ${pass.code}? The registration word will stop working and both reserved words stay retired until the game is reset.`)) return;
    setBusy(true);
    try {
      await revokeWalkInPass(pass.id);
      notify({ type: 'info', msg: `REGISTRATION WORD REVOKED: ${pass.code}` });
    } catch (error) {
      console.error('Could not revoke registration word:', error);
      notify({ type: 'error', msg: `Could not revoke ${pass.code}.` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="er-touch inline-flex items-center gap-2 er-mono er-mono--dim">
        <ChevronRight size={14} strokeWidth={1.75} className="rotate-180" aria-hidden="true" />
        Host panel
      </button>

      <section className="er-card er-card--signal">
        <p className="er-mono er-mono--hot er-mono--wide">Door register</p>
        <h1 className="er-title mt-2">Walk-ins</h1>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Issue one plain-word registration code. A late arrival enters it on their phone,
          completes the short statement, and receives a different plain-word login code.
        </p>
      </section>

      <div className="er-stat grid grid-cols-3 gap-4">
        <div>
          <Numeral as="p" value={activeWalkIns.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">In the room</p>
        </div>
        <div>
          <Numeral as="p" value={pendingPasses.length} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Open words</p>
        </div>
        <div>
          <Numeral as="p" value={WALK_IN_WORDS.length - activeWords.size} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Words free</p>
        </div>
      </div>

      <Section label="Registration words" meta={`${pendingPasses.length} waiting`}>
        <Control disabled={busy} onClick={issuePass}>
          {busy ? 'Working…' : 'Issue registration word'}
        </Control>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Give one word to each late arrival. A word is valid for 30 minutes and is claimed once.
        </p>
        {pendingPasses.length > 0 ? (
          <div className="mt-4 border border-line bg-ink-hover">
            {pendingPasses.map((pass) => (
              <div key={pass.id} className="flex items-center justify-between gap-3 px-3 py-3 border-b border-line-faint last:border-b-0">
                <div>
                  <p className="font-mono text-[20px] tracking-[0.12em] text-bone">{pass.code}</p>
                  <p className="er-mono er-mono--dim mt-1">Registration word</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="er-tag er-tag--mute">Open</span>
                  <button
                    onClick={() => revokePass(pass)}
                    disabled={busy}
                    className="er-touch px-3 py-2 border border-line text-signal-lift font-mono text-[10px] uppercase tracking-[0.16em] hover:border-signal disabled:opacity-40"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="er-mono er-mono--dim text-center mt-4">No registration words issued.</p>
        )}
      </Section>

      <Section label="Registered walk-ins" meta={`${activeWalkIns.length} active`}>
        {activeWalkIns.length > 0 ? (
          <div className="border border-line bg-ink-hover">
            {activeWalkIns.map((walkIn) => (
              <div key={walkIn.id} className="px-3 py-3 border-b border-line-faint last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-typewriter font-bold text-bone text-[18px] truncate">{walkIn.name}</p>
                    <p className="er-mono er-mono--dim mt-1 truncate">{walkIn.profession}</p>
                  </div>
                  <button
                    onClick={() => remove(walkIn)}
                    disabled={busy}
                    className="er-touch shrink-0 px-3 py-2 border border-line text-signal-lift font-mono text-[10px] uppercase tracking-[0.16em] hover:border-signal disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
                <div className="er-rule my-3" />
                <p className="er-mono er-mono--dim">Their login word</p>
                <p className="font-mono text-[18px] tracking-[0.12em] text-bone mt-1">{walkIn.loginCode}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body text-[15px] leading-[1.55] text-dim">
            Nobody has registered at the door yet.
          </p>
        )}
      </Section>
    </div>
  );
};
