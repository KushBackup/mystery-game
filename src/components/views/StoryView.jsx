import React from 'react';
import { STORY_SLIDES } from '../../data/storyIntro';

/**
 * The case briefing, as a document you can go back to (DESIGN_LANGUAGE.md §9).
 *
 * The same beats as the Round 0 slideshow (data/storyIntro.js is the one source,
 * so the two can never drift), but re-set as paper rather than as a performance.
 * That split is the point: the slideshow exists to land the story once, and this
 * screen exists to answer "wait, what time did he collapse?" three rounds later,
 * which a fullscreen typed slideshow is a genuinely bad tool for.
 *
 * One bone card, not eight, because this is one document — the beats are its
 * sections, separated by `line-bone` hairlines (§5: hairlines, not shadows) and
 * arriving in sequence (§7.1 allows a staged entrance here: it is a screen the
 * player opens rarely and reads slowly, exactly like the Guide).
 *
 * No rotation on the card: paper rotates (§5), but a 900px-tall document rotated
 * 1.2° has visibly non-parallel edges against the viewport and reads as broken
 * rather than as pinned.
 */
export const StoryView = ({ onReplay }) => (
  <div className="space-y-4">
    <article className="er-bone p-5 sm:p-7 er-land">
      <p className="er-bone-label">Case Briefing · 8821-B</p>
      <div className="er-bone-rule mt-2" />

      <p className="er-bone-body mt-4">
        The night of 23 May 2026, as the room knows it. Compiled from the statements
        given at the scene.
      </p>

      {STORY_SLIDES.map((beat, index) => (
        <section
          key={beat.id}
          className="mt-6 pt-6 er-enter er-stagger"
          style={{ '--i': index, borderTop: '1px solid var(--color-line-bone)' }}
        >
          <p className="er-bone-label">{beat.kicker}</p>

          <h2 className="font-typewriter uppercase text-ink leading-[1.1] text-[21px] sm:text-[25px] mt-2">
            {beat.heading}
          </h2>

          {beat.lines.map((line) => (
            <p key={line} className="er-bone-body mt-2.5">
              {line}
            </p>
          ))}

          {beat.note && (
            <p className="font-handwriting text-signal-deep text-[21px] mt-4 -rotate-1 origin-left">
              {beat.note}
            </p>
          )}
        </section>
      ))}

      {/* Footer stamps, the same as every other document in the app. */}
      <div
        className="mt-8 pt-4 flex items-end justify-between gap-3"
        style={{ borderTop: '1px solid var(--color-line-bone)' }}
      >
        <span className="er-tag er-tag--onbone">On record</span>
        <div className="text-right">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70">
            Indiranagar Division
          </p>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 mt-1">
            Insp. R. Mathur
          </p>
        </div>
      </div>
    </article>

    {/* Chrome, not paper — so it is ink, square, and mono. The screen's one
        signal focal point (§10). */}
    <button
      type="button"
      onClick={onReplay}
      className="er-touch er-mono er-mono--hot w-full h-12 flex items-center justify-center gap-2 bg-ink-raised border border-signal hover:bg-signal hover:text-white"
    >
      Play the briefing
    </button>
  </div>
);
