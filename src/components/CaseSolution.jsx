import React, { useEffect } from 'react';
import { CASE_META, CASE_SOLUTION } from '../data/gameData';

/**
 * The answer, in full — the page the whole room reads once the killers have been
 * named (DESIGN_LANGUAGE.md §9).
 *
 * It is the counterweight to the reveal overlay, and it is deliberately the
 * opposite surface. The overlay is full-bleed `signal` because that is the one
 * sanctioned alarm (§2.2); a second red screen behind it would spend the moment
 * twice. So this is ink and paper: the case file the room is handed after the
 * verdict, not the verdict itself. Red appears here only as marks — the thread,
 * the beat markers, the one state rule on the mastermind's card.
 *
 * It scrolls the document rather than living in a fixed layer: every terminal
 * screen in the app is `fixed inset-0` and non-scrolling, so this one is reached
 * by *swapping* for that screen instead of stacking on top of it, which lets the
 * page scroll normally and keeps the back control honest.
 *
 * All copy is `CASE_SOLUTION` in [gameData.js](../data/gameData.js) — nothing is
 * written here, so a change to the canon is a change to one data block.
 */

/** Section head — Special Elite, uppercase, over the hairline that separates regions (§3.2). */
const Section = ({ title, kicker, children }) => (
  <section>
    {kicker && <p className="er-mono er-mono--wide">{kicker}</p>}
    <h2 className="font-typewriter font-bold uppercase text-bone text-[22px] sm:text-[24px] leading-[1.05] mt-1">
      {title}
    </h2>
    <div className="er-rule mt-3 mb-5" />
    {children}
  </section>
);

const BackControl = ({ label, onBack }) => (
  <button
    type="button"
    onClick={onBack}
    className="er-touch inline-flex items-center gap-2 min-h-[44px] er-mono er-mono--hot er-mono--wide"
  >
    <span aria-hidden="true">←</span> {label}
  </button>
);

export const CaseSolution = ({ onBack, backLabel = 'The verdict' }) => {
  // The screen it replaced did not scroll, so the document may be sitting
  // anywhere the previous reader left it. Start everyone at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    window.scrollTo(0, 0);
    onBack?.();
  };

  return (
    // `overflow-x-clip`, not `hidden`: the lamp is a 640px wash anchored at
    // left:-220px, so on a 390px phone it would otherwise drag the page 30px
    // sideways into dead space — and `hidden` would make this a scroll container.
    <div className="min-h-screen bg-ink text-bone relative er-grain overflow-x-clip">
      <div className="er-lamp" aria-hidden="true" />

      <main className="relative z-10 px-4 pt-6 pb-16 mx-auto max-w-2xl space-y-10">
        <BackControl label={backLabel} onBack={handleBack} />

        <header className="er-enter">
          <p className="er-mono er-mono--hot er-mono--wide">
            Case {CASE_META.caseId} · Closed
          </p>
          <h1 className="er-title mt-2">How it happened</h1>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            Everything below is the truth of the night, in the order it happened.
          </p>
        </header>

        {/* The finding, on paper. The one bone surface on the page — it is the
            document the room is being handed, and paper is what the system
            reserves for that (§5). */}
        <article className="er-bone er-pin er-rotL er-land p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="er-bone-label">Finding of fact</p>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70">
              {CASE_META.date}
            </span>
          </div>
          <div className="er-bone-rule mt-2 mb-5" />
          <p className="font-note text-[17px] sm:text-[19px] leading-[1.4] text-ink">
            {CASE_SOLUTION.verdict}
          </p>
        </article>

        <Section kicker="Motive" title="Why he died">
          <div className="space-y-4">
            {CASE_SOLUTION.why.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body text-[15px] leading-[1.55] text-dim">
                {paragraph}
              </p>
            ))}
          </div>
        </Section>

        <Section kicker="The conspiracy" title="Five people, five jobs">
          <div className="space-y-4">
            {CASE_SOLUTION.jobs.map((job, index) => (
              // The 3px state rule marks the one who designed it — the state
              // channel (§6.2) rather than a second colour or a bigger heading.
              <article
                key={job.name}
                className={`er-card ${job.lead ? 'er-card--signal' : ''} er-enter`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="er-mono er-mono--hot er-mono--wide">{job.job}</p>
                  <span className="er-mono">{job.group}</span>
                </div>

                <h3 className="font-typewriter font-bold uppercase text-bone text-[19px] sm:text-[22px] leading-[1.15] mt-3">
                  {job.name}
                </h3>

                {job.lead && (
                  <p className="mt-3">
                    <span className="er-tag">Mastermind</span>
                  </p>
                )}

                <p className="font-body text-[15px] leading-[1.55] text-dim mt-3">{job.detail}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section kicker="Reconstruction" title="The night, beat by beat">
          {/* Size as well as colour carries the distinction, so the key does not
              depend on being able to separate signal from dim-2. */}
          <p className="font-body text-[15px] leading-[1.55] text-dim mb-6">
            The larger marks are the beats nobody on the floor could see.
          </p>

          {/* The one red thread the screen is allowed (§6.8). */}
          <div className="relative pl-6">
            <div
              className="er-thread"
              style={{ left: '3px', top: '6px', bottom: '6px' }}
              aria-hidden="true"
            />

            <ul className="space-y-5">
              {CASE_SOLUTION.sequence.map((beat, index) => (
                <li
                  key={beat.time}
                  className="relative er-enter"
                  style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 ${
                      beat.hidden
                        ? 'bg-signal w-[9px] h-[9px] -left-[25px]'
                        : 'bg-dim-2 w-[7px] h-[7px] -left-6'
                    }`}
                  />
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brass tabular-nums">
                    {beat.time}
                  </p>
                  <p
                    className={`font-body text-[15px] leading-[1.55] mt-1 ${
                      beat.hidden ? 'text-bone' : 'text-dim'
                    }`}
                  >
                    {beat.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section kicker="Misdirection" title="Why the room could not see it">
          <ul className="er-list">
            {CASE_SOLUTION.misdirection.map((line) => (
              <li key={line.slice(0, 24)}>{line}</li>
            ))}
          </ul>
        </Section>

        <Section kicker="The evidence ladder" title="What proved it">
          <ul>
            {CASE_SOLUTION.proof.map((item, index) => (
              <li
                key={item.clue}
                className={index === 0 ? '' : 'mt-4 pt-4 border-t border-line-faint'}
              >
                <h3 className="font-typewriter font-bold uppercase text-bone text-[17px] sm:text-[19px] leading-[1.15]">
                  {item.clue}
                </h3>
                <p className="font-body text-[15px] leading-[1.55] text-dim mt-2">{item.proves}</p>
              </li>
            ))}
          </ul>
        </Section>

        <div className="pt-2">
          <div className="er-rule mb-5" />
          <BackControl label={backLabel} onBack={handleBack} />
        </div>
      </main>
    </div>
  );
};
