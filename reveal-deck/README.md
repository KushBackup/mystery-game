# Reveal deck — "How It Happened"

A 22-slide reconstruction of the Velvet Ember murder, in plain language, for **players after the reveal**. Full spoilers throughout.

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
| 01 | How It Happened | cover · 51 guests / 5 killers / 94 seconds / 1 glass |
| 02 | The Short Answer | the whole case in two paragraphs |
| 03 | Armaan Khanna | the victim, and what he actually did to people |
| 04 | What The Room Saw | the public timeline — and why it is a trap |
| **05** | **Part one — The Plan** | *divider* |
| 06 | The Red Folder Marked Monday | the motive |
| 07 | He Forgot Two People | Roddy and Kiyaah were not on his list |
| 08 | Poison In The Garnish | what aconitine is, and why the spray |
| 09 | Who Did What | the five jobs |
| **10** | **Part two — The Night** | *divider · carries the red/grey beat key* |
| 11 | The Poison Was Already In The Building | 5:14 – 7:40 PM |
| 12 | The Room Turns Around | 9:50 – 10:06 PM |
| 13 | Ninety-Four Seconds | 10:08:14 – 10:09:53 PM |
| 14 | She Needed The Log, Not The Key | the cleverest part of the murder |
| 15 | The Camera Was Blind. The Room Wasn't. | Anjul and Parinitha |
| 16 | Two Sprays Of Orange | 10:12 PM — the murder itself |
| 17 | The Last Twenty-Two Minutes | 10:19 – 10:48 PM |
| **18** | **Part three — Why It Held** | *divider* |
| 19 | Ten Real Motives, Five Innocent People | the misdirection |
| 20 | Framed, And Used | Tara vs. Tanvi — two different wrongs |
| 21 | What Proved It | the nine clues and what each settled |
| 22 | Five People. Five Tables. One Glass. | the verdict |

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
