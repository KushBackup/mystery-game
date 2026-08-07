import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CASE_META, CASE_SOLUTION } from '../data/gameData';
import { REVEAL_DECK, REVEAL_VERDICT } from '../data/revealDeck';

/**
 * "How it happened" — the reveal deck, in the app.
 *
 * This is the page the whole room reads once the killers have been named, and
 * it replaced the single scrolling document in 2026-08-07. Twenty-two paged
 * slides, the same twenty-two as [reveal-deck/index.html](../../reveal-deck/index.html):
 * a room that has just been told *who* will read three screens of prose and stop.
 * Paged, it reads one idea at a time, and the deck's chapter structure does the
 * pacing the document was asking the reader to do.
 *
 * ── Why the slides are rebuilt rather than embedded ─────────────────────────
 * The projected deck is a fixed 1920×1080 stage scaled by a single transform.
 * That is exactly right for a projector and unusable on a phone: at 390px the
 * scale factor is 0.20, which puts its 26px body copy on screen at 5px. Fifty-one
 * players read this on phones. So the slides reflow here instead of scaling, and
 * they speak in the app's voice — Special Elite / Courier Prime / IBM Plex Mono
 * at the §3.2 mobile scale — because DESIGN_LANGUAGE.md §3.1 is explicit that the
 * deck's fonts never come into the app.
 *
 * ── The frame ───────────────────────────────────────────────────────────────
 * Chrome is fixed and the slide scrolls between it: the header (exit + position)
 * and the footer (Back / Next) never move, so the way out is always on screen
 * and never depends on having scrolled to the end of a slide. A slide taller
 * than the phone scrolls; the deck never shrinks type to make one fit.
 *
 * It is `fixed inset-0` and swapped in for the terminal screen that opened it —
 * the same trade [OutroSplash](OutroSplash.jsx) and
 * [MurdererRevealOverlay](MurdererRevealOverlay.jsx) already make — rather than
 * layered over it, so a second full-bleed red surface never sits behind the
 * reconstruction.
 *
 * All copy is [revealDeck.js](../data/revealDeck.js); slides 09, 21 and 22 read
 * `CASE_SOLUTION` directly so the jobs, the evidence ladder and the verdict
 * cannot drift from the answer key.
 */

/* ════════════════════════════════════════════════════════════════════════════
   INLINE MARKUP

   `*text*` and `_text_`, resolved to spans. Emphasis is a colour shift, never a
   weight one (§3.2) — bone on ink, ink on paper — which is why every branch here
   sets `not-italic` on the starred form and only the underscored form tilts.
   ════════════════════════════════════════════════════════════════════════════ */

const RICH = /(\*[^*]+\*|_[^_]+_)/;

const Rich = ({ text, tone = 'ink' }) => {
  if (!text) return null;
  const hot = tone === 'title';
  const strong = hot ? 'text-signal' : tone === 'bone' ? 'text-ink' : 'text-bone';

  return (
    <>
      {String(text)
        .split(RICH)
        .map((part, i) => {
          if (part.length > 1 && part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={i} className={`not-italic ${strong}`}>
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.length > 1 && part.startsWith('_') && part.endsWith('_')) {
            return (
              <em key={i} className={`italic ${strong}`}>
                {part.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   SHARED PIECES
   ════════════════════════════════════════════════════════════════════════════ */

const Body = ({ children, className = '' }) => (
  <p className={`font-body text-[15px] leading-[1.55] text-dim ${className}`}>{children}</p>
);

/** Attribution under a document — the dashed tear-off the deck's paper carries. */
const Source = ({ children }) => (
  <p className="mt-4 pt-3 border-t border-dashed border-line-bone font-mono text-[11px] leading-[1.4] tracking-[0.16em] uppercase text-body-bone">
    {children}
  </p>
);

/** The one red thread a screen is allowed (§6.8), with its markers. */
const Ledger = ({ children, i }) => (
  <div className="relative pl-6 er-enter er-stagger" style={{ '--i': i }}>
    <div className="er-thread" style={{ left: '3px', top: '6px', bottom: '6px' }} aria-hidden="true" />
    <ul className="space-y-5">{children}</ul>
  </div>
);

/** Size *and* colour carry the distinction, so the key never rests on hue alone. */
const Marker = ({ major }) => (
  <span
    aria-hidden="true"
    className={`absolute top-1.5 ${
      major ? 'bg-signal w-[9px] h-[9px] -left-[25px]' : 'bg-dim-2 w-[7px] h-[7px] -left-6'
    }`}
  />
);

const Stamp = ({ children }) => (
  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brass tabular-nums">
    {children}
  </p>
);

/* ════════════════════════════════════════════════════════════════════════════
   BLOCKS — one renderer per `type` in revealDeck.js
   ════════════════════════════════════════════════════════════════════════════ */

/** §6.3 bone card. Paper is the document surface; it is never UI chrome.
 *
 *  Every block owns its own entrance rather than inheriting one from a wrapper:
 *  paper lands with the §7 overshoot and chrome rises, and a wrapper animating
 *  opacity would play the land invisibly behind its own stagger delay. */
const PaperBlock = ({ block, i }) => (
  <article
    style={{ '--i': i }}
    className={`er-bone er-land er-stagger p-5 sm:p-6 ${
      block.tilt === 'L' ? 'er-rotL' : block.tilt === 'R' ? 'er-rotR' : ''
    } ${block.aged ? 'er-bone--aged' : ''}`}
  >
    <p className="er-bone-label">{block.label}</p>
    <div className="er-bone-rule mt-2 mb-4" />

    {block.body?.map((paragraph, i) => (
      <p key={i} className={`er-bone-body ${i ? 'mt-3' : ''}`}>
        <Rich text={paragraph} tone="bone" />
      </p>
    ))}

    {block.items && (
      <ul className="er-list er-list--onbone">
        {block.items.map((item, i) => (
          <li key={i}>
            <Rich text={item} tone="bone" />
          </li>
        ))}
      </ul>
    )}

    {block.source && <Source>{block.source}</Source>}
  </article>
);

/** §6.4 pinned paper — a quote, an exhibit, a witness. Carries the note voice. */
const NoteBlock = ({ block, i }) => (
  <article
    style={{ '--i': i }}
    className="er-bone er-pin er-rotR er-land er-stagger p-5 pt-7 sm:p-6 sm:pt-8"
  >
    <p className="er-bone-label">{block.label}</p>
    <div className="er-bone-rule mt-2 mb-4" />
    <p className="font-note text-[18px] sm:text-[20px] leading-[1.4] text-ink">{block.quote}</p>
    {block.source && <Source>{block.source}</Source>}
  </article>
);

/** §6.2 card on ink. The 3px top border is the state channel, not a second hue. */
const CardBlock = ({ block, i }) => (
  <article
    style={{ '--i': i }}
    className={`er-card er-enter er-stagger ${
      block.tone === 'signal' ? 'er-card--signal' : block.tone === 'brass' ? 'er-card--brass' : ''
    }`}
  >
    <div className="flex items-baseline gap-2">
      {block.index && <span className="er-num text-[15px] shrink-0">{block.index}</span>}
      <p className="er-mono er-mono--wide">{block.label}</p>
    </div>

    {block.title && (
      <h3 className="font-typewriter font-bold uppercase text-bone text-[19px] sm:text-[21px] leading-[1.15] mt-3">
        {block.title}
      </h3>
    )}

    {block.body?.map((paragraph, i) => (
      <Body key={i} className={i || block.title ? 'mt-3' : 'mt-3'}>
        <Rich text={paragraph} />
      </Body>
    ))}

    {block.items && (
      <ul className="er-list mt-3">
        {block.items.map((item, i) => (
          <li key={i}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    )}
  </article>
);

/** One sentence of paper — the line a slide is actually about. */
const StripBlock = ({ block, i }) => (
  <article
    style={{ '--i': i }}
    className={`er-bone er-rotL er-land er-stagger p-4 sm:p-5 ${block.aged ? 'er-bone--aged' : ''}`}
  >
    <p className="er-bone-label">{block.label}</p>
    <div className="er-bone-rule mt-2 mb-3" />
    <p className="er-bone-body">
      <Rich text={block.text} tone="bone" />
    </p>
  </article>
);

/** §6.6 stat — brass numeral over a mono label, hairline above. */
const StatsBlock = ({ block, i }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 er-enter er-stagger" style={{ '--i': i }}>
    {block.items.map((stat) => (
      <div key={stat.label} className="er-stat">
        <p className="er-stat__num">
          {stat.n}
          {stat.unit && <span className="font-mono text-[13px] text-dim ml-1">{stat.unit}</span>}
        </p>
        <p className="er-stat__label">{stat.label}</p>
      </div>
    ))}
  </div>
);

/** The public record. Read top to bottom on a phone, not left to right. */
const RailBlock = ({ block, i }) => (
  <Ledger i={i}>
    {block.stops.map((stop) => (
      <li key={stop.time} className="relative">
        <Marker major={stop.now} />
        <Stamp>{stop.time}</Stamp>
        <h3
          className={`font-typewriter font-bold uppercase text-[17px] leading-[1.15] mt-1 ${
            stop.now ? 'text-bone' : 'text-dim'
          }`}
        >
          {stop.title}
        </h3>
        <Body className="mt-1">{stop.body}</Body>
      </li>
    ))}
  </Ledger>
);

/** The reconstruction ledger. Unseen beats carry three cues, never colour alone. */
const BeatsBlock = ({ block, i }) => (
  <Ledger i={i}>
    {block.items.map((beat) => (
      <li key={beat.time} className="relative">
        <Marker major={beat.hidden} />
        <Stamp>{beat.time}</Stamp>
        {beat.hidden && (
          <p className="mt-2">
            <span className="er-tag">Unseen</span>
          </p>
        )}
        <p className={`font-body text-[15px] leading-[1.55] mt-2 ${beat.hidden ? 'text-bone' : 'text-dim'}`}>
          <Rich text={beat.body} />
        </p>
      </li>
    ))}
  </Ledger>
);

/** The legend for every ledger that follows it. */
const KeyBlock = ({ i }) => (
  <article className="er-card er-enter er-stagger" style={{ '--i': i }}>
    <p className="er-mono er-mono--wide">How to read the next four slides</p>
    <ul className="mt-4 space-y-3">
      <li className="flex items-start gap-3">
        <span aria-hidden="true" className="bg-signal w-[9px] h-[9px] mt-[7px] shrink-0" />
        <span className="font-body text-[15px] leading-[1.55] text-bone">
          Red beat — nobody in the room could see this
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span aria-hidden="true" className="bg-dim-2 w-[7px] h-[7px] mt-[8px] ml-[1px] shrink-0" />
        <span className="font-body text-[15px] leading-[1.55] text-dim">
          Grey beat — guests saw this happen
        </span>
      </li>
    </ul>
  </article>
);

/** Slide 09, straight off the answer key. The five cards keep their own stagger
 *  — this is the one block whose children are the content. */
const JobsBlock = ({ i: offset = 0 }) => (
  <div className="space-y-4">
    {CASE_SOLUTION.jobs.map((job, i) => (
      <article
        key={job.name}
        className={`er-card er-enter er-stagger ${job.lead ? 'er-card--signal' : ''}`}
        style={{ '--i': offset + i }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="er-mono er-mono--hot er-mono--wide">{job.job}</p>
          <span className="er-mono shrink-0">{job.group}</span>
        </div>

        <h3 className="font-typewriter font-bold uppercase text-bone text-[19px] sm:text-[22px] leading-[1.15] mt-3">
          {job.name}
        </h3>

        {job.lead && (
          <p className="mt-3">
            <span className="er-tag">Mastermind</span>
          </p>
        )}

        <Body className="mt-3">{job.detail}</Body>
      </article>
    ))}
  </div>
);

/** Slide 21, straight off the answer key. */
const ProofBlock = ({ i }) => (
  <ul className="er-enter er-stagger" style={{ '--i': i }}>
    {CASE_SOLUTION.proof.map((item, i) => (
      <li key={item.clue} className={i ? 'mt-4 pt-4 border-t border-line-faint' : ''}>
        <div className="flex items-baseline gap-3">
          <span className="er-num text-[15px] shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="font-typewriter font-bold uppercase text-bone text-[17px] sm:text-[19px] leading-[1.15]">
            {item.clue}
          </h3>
        </div>
        <Body className="mt-2 pl-[30px]">{item.proves}</Body>
      </li>
    ))}
  </ul>
);

/** The five circles, under the verdict. */
const CirclesBlock = ({ block, i }) => (
  <div className="er-enter er-stagger" style={{ '--i': i }}>
    <div className="er-rule mb-4" />
    <p className="er-mono er-mono--bone er-mono--wide">{block.text}</p>
    <p className="er-mono mt-2">{block.note}</p>
  </div>
);

const BLOCKS = {
  paper: PaperBlock,
  note: NoteBlock,
  card: CardBlock,
  strip: StripBlock,
  stats: StatsBlock,
  rail: RailBlock,
  beats: BeatsBlock,
  key: KeyBlock,
  jobs: JobsBlock,
  proof: ProofBlock,
  circles: CirclesBlock,
};

/** `offset` continues the slide header's stagger instead of restarting it, so a
 *  slide lands as one sequence rather than as a header and then a second wave. */
const Blocks = ({ blocks, offset = 3 }) => (
  <div className="space-y-6">
    {blocks?.map((block, i) => {
      const Component = BLOCKS[block.type];
      if (!Component) return null;
      return <Component key={i} block={block} i={i + offset} />;
    })}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   SLIDES
   ════════════════════════════════════════════════════════════════════════════ */

/** Cover and verdict. Centred while there is room, scrolls when there is not. */
const CoverSlide = ({ slide }) => (
  <div className="flex-1 flex flex-col justify-center py-4">
    <p className="er-enter">
      <span className="er-tag">{slide.tag}</span>
    </p>

    <h1
      className="font-display font-extrabold uppercase text-bone text-[44px] sm:text-[68px] leading-[0.88] tracking-[-0.02em] mt-6 er-enter er-stagger"
      style={{ '--i': 1 }}
    >
      <Rich text={slide.title} tone="title" />
    </h1>

    <p
      className="font-body text-[16px] leading-[1.55] text-dim mt-6 er-enter er-stagger"
      style={{ '--i': 2 }}
    >
      <Rich text={slide.lead ?? REVEAL_VERDICT} />
    </p>

    <div className="mt-8">
      <Blocks blocks={slide.blocks} />
    </div>
  </div>
);

/** Chapter divider. The one place a ghost numeral is allowed to be decorative. */
const DividerSlide = ({ slide }) => (
  <div className="flex-1 flex flex-col justify-center py-4">
    <div className="relative">
      {/* The chapter numeral rides with the centred block, not with the slide
          box: anchored to the box it stranded itself at the top of a half-empty
          screen. Outlined, so it reads as a watermark behind the chapter rather
          than as a second numeral competing with the counter in the chrome. */}
      <span
        aria-hidden="true"
        className="absolute right-0 -top-[70px] sm:-top-[96px] font-display font-extrabold text-[120px] sm:text-[168px] leading-[0.8] select-none pointer-events-none"
        style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(237,231,218,.14)' }}
      >
        {slide.number}
      </span>

      <p className="er-mono er-mono--hot er-mono--wide er-enter">{slide.kicker}</p>

      <h2
        className="font-display font-extrabold uppercase text-bone text-[52px] sm:text-[76px] leading-[0.88] tracking-[-0.02em] mt-3 er-enter er-stagger"
        style={{ '--i': 1 }}
      >
        <Rich text={slide.title} tone="title" />
      </h2>

      <div className="h-[3px] w-[120px] bg-signal mt-6 mb-6 er-enter er-stagger" style={{ '--i': 2 }} />

      {/* A grid, not a row of flex pairs with a fixed lead column: the terms run
          from "Why" to "10:08 PM", so a hand-picked width either clips the long
          ones or leaves a gutter under the short ones. `auto` sizes the column
          once, for all rows, from the widest term. */}
      <dl
        className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 er-enter er-stagger"
        style={{ '--i': 3 }}
      >
        {slide.lines.map((line) => (
          <React.Fragment key={line.term}>
            <dt className="er-mono er-mono--bone pt-[3px] whitespace-nowrap">{line.term}</dt>
            <dd className="font-body text-[15px] leading-[1.5] text-dim">{line.text}</dd>
          </React.Fragment>
        ))}
      </dl>

      {slide.blocks && (
        <div className="mt-8">
          <Blocks blocks={slide.blocks} />
        </div>
      )}
    </div>
  </div>
);

const ContentSlide = ({ slide }) => (
  <div className="py-1">
    <header>
      <p className="er-mono er-mono--hot er-mono--wide er-enter">{slide.kicker}</p>

      <h2 className="er-title mt-2 er-enter er-stagger" style={{ '--i': 1 }}>
        <Rich text={slide.title} tone="title" />
      </h2>

      {slide.dek && (
        <p
          className="font-body text-[15px] leading-[1.55] text-dim mt-4 er-enter er-stagger"
          style={{ '--i': 2 }}
        >
          <Rich text={slide.dek} />
        </p>
      )}

      <div className="er-rule mt-5" />
    </header>

    <div className="mt-6">
      <Blocks blocks={slide.blocks} />
    </div>
  </div>
);

const Slide = ({ slide }) => {
  if (slide.kind === 'cover') return <CoverSlide slide={slide} />;
  if (slide.kind === 'divider') return <DividerSlide slide={slide} />;
  return <ContentSlide slide={slide} />;
};

/* ════════════════════════════════════════════════════════════════════════════
   THE DECK
   ════════════════════════════════════════════════════════════════════════════ */

const COUNT = REVEAL_DECK.length;
/** Enough travel that a diagonal thumb-scroll can't page the deck by accident. */
const SWIPE = 60;

export const RevealDeck = ({ onClose, closeLabel = 'The verdict' }) => {
  const [index, setIndex] = useState(0);
  const scroller = useRef(null);
  const touch = useRef(null);

  const slide = REVEAL_DECK[index];
  const last = index === COUNT - 1;

  const go = useCallback((next) => {
    setIndex((current) => {
      const clamped = Math.max(0, Math.min(next, COUNT - 1));
      // Reset here rather than in an effect on `index`: a slide that lands
      // already scrolled halfway down is the one thing that makes a paged deck
      // feel broken, and doing it in the same commit avoids a visible jump.
      if (clamped !== current) scroller.current?.scrollTo(0, 0);
      return clamped;
    });
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          go(index + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          go(index - 1);
          break;
        case 'Home':
          event.preventDefault();
          go(0);
          break;
        case 'End':
          event.preventDefault();
          go(COUNT - 1);
          break;
        case 'Escape':
          onClose?.();
          break;
        default:
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, onClose]);

  const onTouchStart = (event) => {
    const point = event.changedTouches[0];
    touch.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event) => {
    if (!touch.current) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    touch.current = null;
    // Horizontal dominance, not just distance — the slide scrolls vertically,
    // and a swipe that is mostly a scroll must never also turn the page.
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <div className="fixed inset-0 z-[210] bg-ink text-bone flex flex-col er-grain overflow-hidden">
      <div className="er-lamp" aria-hidden="true" />

      {/* Progress before chrome: it is the first thing that answers "how much of
          this is left", which is the question a 22-slide deck has to answer. */}
      <div className="er-bar h-[3px] shrink-0 relative z-20" aria-hidden="true">
        <div className="er-bar__fill" style={{ '--fill': (index + 1) / COUNT }} />
      </div>

      <header className="shrink-0 relative z-20 bg-ink border-b border-line">
        <div className="mx-auto max-w-2xl px-4 h-[52px] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="er-touch inline-flex items-center gap-2 px-1 -ml-1 er-mono er-mono--hot er-mono--wide"
          >
            <span aria-hidden="true">←</span> {closeLabel}
          </button>

          <p className="er-mono truncate hidden sm:block">{slide.chapter ?? `Case ${CASE_META.caseId}`}</p>

          <p className="shrink-0 flex items-baseline gap-1">
            <span className="er-num text-[17px]">{String(index + 1).padStart(2, '0')}</span>
            <span className="er-mono">/ {COUNT}</span>
          </p>
        </div>
      </header>

      <div
        ref={scroller}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overflow-x-clip relative z-10 custom-scrollbar"
      >
        {/* Keyed on the slide so the entrance stagger replays on every page turn
            — without it React reuses the nodes and only the text changes, which
            reads as a jump cut rather than a slide landing. */}
        {/* `flex flex-col` on a `min-h-full` box, so the cover and divider
            slides can claim the leftover height with `flex-1` and centre in it.
            A bare `min-h-full` on the child would not: a percentage height
            resolved against a parent that only has a *min* height is
            indefinite, so those slides silently fell back to content height and
            sat at the top of a screen-tall hole. */}
        <div key={slide.id} className="mx-auto max-w-2xl px-4 py-6 min-h-full flex flex-col">
          <Slide slide={slide} />
        </div>
      </div>

      <footer className="shrink-0 relative z-20 bg-ink border-t border-line pb-safe">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="er-touch flex-1 h-11 flex items-center justify-center gap-2 border border-line er-mono er-mono--dim disabled:opacity-30"
          >
            <span aria-hidden="true">←</span> Back
          </button>

          {last ? (
            <button
              type="button"
              onClick={onClose}
              className="er-touch er-touch--hot flex-1 h-11 flex items-center justify-center gap-2 bg-signal border border-signal er-mono text-white"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="er-touch flex-1 h-11 flex items-center justify-center gap-2 bg-ink-raised border border-line er-mono er-mono--bone"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
