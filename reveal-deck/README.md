# Reveal deck — "How It Happened"

A 22-slide reconstruction of the Greenr: Last Seating murder (Case 2609-G), in plain language, for **players after the reveal**. Full spoilers throughout.

Open [index.html](index.html) in any browser. There is no build step, no npm install, and no network dependency except the three Google Fonts.

```powershell
start reveal-deck\index.html
```

---

## What it is

| | |
|---|---|
| Slides | 22 (3 chapter dividers) |
| Density | Reading-first — self-contained slides someone can page through with no host |
| Canvas | Responsive full-screen slides, printable as one slide per page |
| Design system | "Evidence Room" — [DESIGN_LANGUAGE.md](../DESIGN_LANGUAGE.md) |
| Dependencies | None. Single self-contained HTML file |

## Controls

- `→` `←` `space` `PageUp/Dn` `Home` `End` — navigate. Swipe and scroll-wheel also work.
- Print to PDF gives one slide per page (`@media print` in the stylesheet).

---

## Structure

| # | Slide | |
|---|---|---|
| 01-04 | Case, short answer, victim, public record | public frame |
| 05-09 | Plan, motive, method and jobs | why the three acted |
| 10-17 | Preparation, crash, service route, deletion and discovery | how the murder occurred |
| 18-22 | Misdirection, proof and verdict | why the case holds |

## Where the content comes from

Every fact restates canon. **If the story changes, change it in the source first, then here:**

- `CASE_SOLUTION` and `CASE_TIMELINE` in [src/data/gameData.js](../src/data/gameData.js) — the answer key
- [STORY.md](../STORY.md) — the narrative bible
- [src/data/revealDeck.js](../src/data/revealDeck.js) — **the same 22 slides, in the app.** Rendered by [src/components/RevealDeck.jsx](../src/components/RevealDeck.jsx) and opened from both terminal screens. It is a twin, not a port: this deck is a fixed 1920×1080 stage for a projector, that one reflows for a phone and speaks in the app voice ([DESIGN_LANGUAGE.md §3.1](../DESIGN_LANGUAGE.md)). Same slides, same order — **change a slide here and change it there**

## Two components this deck adds

Both are the existing system, not new idioms:

- **`.beats`** — the reconstruction ledger. A brass time gutter, a red thread spine, and the app's two-tier treatment: beats nobody on the floor could have seen carry a **larger red marker, bone-weight body copy, and an `UNSEEN` tag**. Three cues, so the key never depends on telling red apart from grey alone.
- **`.strip`** — one sentence of paper. A bone card carrying the single line a slide is actually about.

## Verified, not eyeballed

Checked headlessly at 1920×1080 across all 22 slides:

- no element out of the 1920×1080 bounds, no clipped scroll box, no overlapping panel
- 16:9 preserved and letterboxed at a 390×844 phone viewport, `scrollWidth − clientWidth === 0`
- under `prefers-reduced-motion`, every element is at its resting value within 450ms — this needed an explicit `transition-delay: 0` override, because `viewport-base.css` clamps durations but not the stagger delays

Re-run those checks after any edit. `getComputedStyle` mid-animation is the measurement; a screenshot is not.
