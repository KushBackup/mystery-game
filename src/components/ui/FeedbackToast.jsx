import React, { useEffect, useState } from 'react';

// The state channel is the 3px top border, not a hue (DESIGN_LANGUAGE.md §6.2).
// Success does not become green and errors do not become a second red — the
// label carries the meaning and the surface stays ink.
const TONES = {
  error:   { rule: 'er-card--signal', label: 'Rejected', labelClass: 'er-mono--hot' },
  success: { rule: 'er-card--aged',   label: 'Recorded', labelClass: 'er-mono--bone' },
  info:    { rule: '',                label: 'Note',     labelClass: 'er-mono--dim' },
};

const EXIT_MS = 220;

/**
 * The toast enters, then leaves — it used to do only the first half.
 *
 * The caller clears `feedback` to null on a timer, which unmounted the card mid-
 * frame: it appeared with a 600ms rise and then simply ceased to exist, which
 * reads as a glitch rather than as a message being done. So the last message is
 * held locally for one exit animation after the prop clears.
 *
 * The exit is deliberately shorter and smaller than the entrance (220ms and a
 * fixed 8px lift, against 600ms and 16px): nothing is being read on the way out,
 * so it should get out of the way rather than perform.
 */
export const FeedbackToast = ({ feedback }) => {
  const [shown, setShown] = useState(feedback);
  const [leaving, setLeaving] = useState(false);
  const [seenFeedback, setSeenFeedback] = useState(feedback);

  // Render-phase adjustment, not an effect. React's own recommendation for
  // "derive state from a changed prop", and the pattern this codebase already
  // uses for the host panel's script tab — `react-hooks/set-state-in-effect`
  // rejects the obvious `useEffect(() => setShown(feedback), [feedback])`.
  if (seenFeedback !== feedback) {
    setSeenFeedback(feedback);
    if (feedback) {
      setShown(feedback);
      setLeaving(false);
    } else if (shown) {
      setLeaving(true);
    }
  }

  // The one thing that genuinely needs an effect: a timer. Setting state from
  // inside the timeout is fine — it is the synchronous effect body that is not.
  useEffect(() => {
    if (!leaving) return undefined;

    const id = setTimeout(() => {
      setShown(null);
      setLeaving(false);
    }, EXIT_MS);

    return () => clearTimeout(id);
  }, [leaving]);

  if (!shown) return null;

  const tone = TONES[shown.type] || TONES.info;

  return (
    <div
      // Remount on a new message so the entrance replays. Without the key,
      // a second toast arriving while the first is still up just swaps the text.
      key={`${shown.type}:${shown.msg}`}
      role="status"
      aria-live="polite"
      className={`er-card ${tone.rule} ${
        leaving ? 'er-leave' : 'er-enter'
      } fixed top-20 left-4 right-4 z-50 max-w-2xl mx-auto shadow-[0_18px_38px_rgba(0,0,0,0.6)]`}
    >
      <p className={`er-mono er-mono--wide ${tone.labelClass}`}>{tone.label}</p>
      <p className="font-body text-[15px] leading-[1.55] text-bone mt-2">{shown.msg}</p>
    </div>
  );
};
