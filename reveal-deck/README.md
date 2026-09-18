# Reveal deck — "How It Happened"

A 22-slide reconstruction of the Onam in Black murder (Case 2108-C), in plain language, for **players after the reveal**. Full spoilers throughout.

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
| Canvas | Fixed 1920×1080, scaled by one transform. Never reflows, including on a phone |
| Design system | "Evidence Room" — [DESIGN_LANGUAGE.md](../DESIGN_LANGUAGE.md) |
| Fonts | Big Shoulders Display · Newsreader · IBM Plex Mono (the **deck** voice, §3.1) |
| Dependencies | None. Single self-contained HTML file |

## Controls

- `→` `←` `space` `PageUp/Dn` `Home` `End` — navigate. Swipe and scroll-wheel also work.
- `E`, or hover the top-left corner — **inline text editing**. Click any line, edit it, `Ctrl+S` to save to this browser. *Download HTML* exports an edited copy; *Reset* clears it.
- Print to PDF gives one 1920×1080 page per slide (`@media print` in the stylesheet).

---

## Structure

| # | Slide | |
|---|---|---|
| 01 | How It Happened | cover · 69 colleagues / 5 killers / 34 POIs / 1 tumbler |
| 02 | The Short Answer | the whole case in two paragraphs |
| 03 | Dev Malhotra | the victim, and what he was actually hired to do |
| 04 | What The Office Saw | the public timeline — and why it is a trap |
| **05** | **Part one — The Plan** | *divider* |
| 06 | Findings v0.9 | the draft with five roles — the motive |
| 07 | The Draft Was The Recruiter | how five people aligned in one evening |
| 08 | Poison In The Tumbler | what oleandrin is, and why the coffee machine |
| 09 | Who Did What | the five jobs |
| **10** | **Part two — The Day** | *divider · carries the red/grey beat key* |
| 11 | Planned Before The Marigolds | Tuesday evening – Wednesday midnight |
| 12 | Friday Morning | 8:12 AM – 1:05 PM |
| 13 | Thirty-Six Minutes | 2:45 – 3:21 PM — the camera gap and the dose |
| 14 | He Needed The Log, Not The Lift | badge V-07 — the cleverest part |
| 15 | The Cameras Were Blind. The Floor Wasn't. | Utkarsh, Rishabh and Raaghav |
| 16 | Two Sugars | 3:15 PM — the murder itself |
| 17 | The Last Hour | 3:12 – 4:30 PM |
| **18** | **Part three — Why It Held** | *divider* |
| 19 | Twelve Real Motives, Seven Innocent People | the misdirection |
| 20 | Framed, And Suspected | Victor vs. Sukhans — two different wrongs |
| 21 | What Proved It | the thirteen clues, in two compact tables |
| 22 | Five People. Five Departments. One Tumbler. | the verdict |

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
