# Design Language — "Evidence Room"

> The visual system built for [pitch-deck/index.html](pitch-deck/index.html), and — as of 2026-08-02 — the system the player app is built on.
>
> **Read this with [Claude.md](Claude.md).** It tells you what the system *is* and how each rule maps onto the React app.
>
> **Status: applied.** The whole of `src/` now runs on this system. The `mystery-*` palette is gone, and so are the green/blue/purple/orange/halloween hues that had accumulated in Chat, Voting, Timeline, Help and the Host panel. Tokens live in the `@theme` block of [src/index.css](src/index.css); the §6 component vocabulary is implemented as `.er-*` classes in [src/App.css](src/App.css). See [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) → *Styling architecture* for the load-order rules.

---

## 1. The thesis

**An investigation board photographed in a dark room.**

Near-black is the world. Paper is where information lives. One hot red marks anything that demands attention, and nothing else is ever red. Numbers are brass, because data should feel measured, not urgent. Depth comes from hairlines and paper, never from decorative shadow or glass.

Three rules carry most of the identity. If you only keep three things, keep these:

1. **Red is a scalpel, not a paint.** It marks; it never fills large areas.
2. **Brass is only ever a number.** The moment brass appears on a sentence, the system is broken.
3. **Paper means "this is a document."** Bone surfaces are reserved for in-fiction artefacts — dossiers, clue cards, case files. Never for UI chrome.

---

## 2. Colour

### 2.1 Tokens

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0C0D0F` | The canvas. Everything sits on this. |
| `ink-raised` | `#141518` | Raised panel / card on ink. |
| `ink-hover` | `#1C1E22` | Pressed / hovered panel, table stripe, device bezel. |
| `bone` | `#EDE7DA` | Paper surface **and** primary text on ink. |
| `bone-aged` | `#D8D0BF` | Secondary paper — older documents, archive tiles. |
| `signal` | `#E03127` | The one hot accent. Tags, rules, markers, emphasis. |
| `signal-deep` | `#8E1811` | The accent when it sits **on bone**. |
| `signal-lift` | `#F2564C` | The accent for **small text on ink** (see §2.4). |
| `brass` | `#D8A33C` | Numerals and data. Nothing else, ever. |

Derived values — use these, don't re-derive them at call sites:

| Token | Resolved | Role |
|---|---|---|
| `dim` | `#98948D` | Secondary text on ink (bone @ 62%). |
| `dim-2` | `#6B6964` | Tertiary text on ink (bone @ 42%). Large text only. |
| `line` | `rgba(237,231,218,.16)` | Hairline on ink. |
| `line-faint` | `rgba(237,231,218,.08)` | Sub-divider on ink. |
| `line-bone` | `rgba(12,13,15,.22)` | Hairline on bone. |
| `body-bone` | `#4A453C` | Body text on bone. |

> **Why `signal` and `brass` rather than `red` and `amber`?** Tailwind already ships `red-*` and `amber-*` scales, so those names collide. The abstract names also encode the rule: *signal* is for signalling, *brass* is for numbers. That's the constraint you want people to feel when they reach for the token.

### 2.2 The discipline

This is what makes it look designed rather than merely dark.

- **One accent.** `signal` and nothing else. If a slide/screen needs more differentiation, change the *surface* (ink → bone), not the hue.
- **Brass is numeric-only.** Vote counts, round numbers, timers, clue counts, stat figures. Never a heading, never a label, never body copy.
- **Never pure white or pure black.** `bone` is the lightest value; `ink` is the darkest. `#FFFFFF` only appears as text *inside* a filled `signal` tag.
- **No gradients.** The single exception is the atmospheric lamp glow (§6.3), which is a radial wash, not a UI fill.
- **Red never fills a large area.** A tag, a 2–3px rule, a marker dot, a border-top. Not a card background, not a header bar, not a full-width banner. The exception is a *deliberate alarm state* — the murderer reveal — where the whole screen going red is the point precisely because it never happens otherwise.

### 2.3 Measured contrast

Computed, not estimated. AA = 4.5:1 for normal text, 3:1 for large (≥18.66px bold or ≥24px).

| Pair | Ratio | Verdict |
|---|---|---|
| `bone` on `ink` | **15.78** | Passes everything |
| `brass` on `ink` | **8.54** | Passes everything |
| `dim` on `ink` | **6.44** | AA |
| `signal-lift` on `ink` | **5.75** | AA |
| `signal` on `ink` | **4.29** | ⚠️ **Large text only** |
| `dim-2` on `ink` | **3.55** | ⚠️ **Large text only** |
| `ink` on `bone` | **15.78** | Passes everything |
| `body-bone` on `bone` | **7.72** | AA |
| `signal-deep` on `bone` | **7.45** | AA |

### 2.4 The phone adjustment ⚠️

**The deck and the app have different physics.** The deck is viewed on a projector or a laptop at arm's length, where a 15px mono kicker is optically large. The app is a phone held in a dimly lit room by someone who has had a drink and is trying to read a clue code.

So:

- **On ink, `signal` at body size fails AA (4.29:1).** In the app, use **`signal-lift` (`#F2564C`, 5.75:1)** for any red text under 18px. Keep `signal` for fills, rules, borders, markers and large display text where the ratio requirement drops to 3:1.
- **`dim-2` is decorative.** Timestamps, slide numbers, inactive chrome. Never a clue code, a character name, or anything a player needs to act on.
- **Raise the floor.** The deck's smallest type is 14px at 1920px wide. The app's smallest type should be **11px**, and only for mono labels — never for content.

---

## 3. Typography

### 3.1 The two-voices problem — read this before changing any font

The deck and the app are speaking to different audiences, and they should not sound the same.

| | Deck | App |
|---|---|---|
| Audience | Investors, venues | Players, mid-game |
| Voice | **Editorial** — a serious magazine | **Diegetic** — an actual case file |
| Display | Big Shoulders Display | Special Elite (typewriter) |
| Body | Newsreader | Courier Prime |
| Accent | IBM Plex Mono | Special Elite (the note voice) |

**Do not replace the app's fonts with the deck's.** Special Elite and Courier Prime are doing something the deck's fonts can't: they make the phone feel like a prop inside the fiction. That's a genuine asset and it's why the app's screenshots look good.

**The recommendation is a split, by function:**

- **In-fiction content keeps its current voice.** Character dossiers, clue cards, case files, accusations, chat — Special Elite for headings, Courier Prime for body, Special Elite for margin notes and annotations.
- **UI chrome adopts the deck's discipline.** Screen titles, tab labels, buttons, counters, round indicators, host controls — mono, uppercase, wide-tracked, in `dim`/`bone`.
- **Numerals become display type.** Add **Big Shoulders Display** for one job only: numbers. Round number, vote counts, timers, clue counters. In `brass`. This is the single highest-impact typographic change you can make, and it's cheap — one extra font, used in maybe six places.

The result: the *interface* feels like the deck; the *content* still feels like evidence.

### 3.2 Mobile type scale

The deck's scale is authored at 1920×1080 and does not transfer. This is a native mobile scale.

| Role | Size / LH | Family | Colour | Notes |
|---|---|---|---|---|
| Screen title | 32 / 0.92 | Big Shoulders 800 | `bone` | Uppercase, `-0.01em` |
| Section head | 24 / 1.0 | Special Elite | `bone` | Uppercase |
| Card title | 19 / 1.1 | Special Elite | `bone` | |
| Body | 15 / 1.55 | Courier Prime | `dim` | Never below 15 for content |
| Body emphasis | 15 / 1.55 | Courier Prime | `bone` | Use colour, not bold |
| Numeral | 34 / 1.0 | Big Shoulders 700 | `brass` | Tabular where it changes |
| Numeral (large) | 56 / 0.9 | Big Shoulders 700 | `brass` | Round number, final tally |
| Label / kicker | 11 / 1.3 | IBM Plex Mono 500 | `dim-2` | Uppercase, `0.18em` |
| Label (active) | 11 / 1.3 | IBM Plex Mono 500 | `signal-lift` | Uppercase, `0.18em` |
| Annotation | 17 / 1.35 | Special Elite | `signal-lift` | In-fiction margin notes only — see §3.3 |

**Tracking rule:** mono labels get `0.18em`–`0.24em`. Generous letter-spacing is what makes monospace read as *editorial chrome* rather than as *code*. Display type goes the other way: `-0.01em`.

**Case rule:** uppercase is for chrome and titles. Never uppercase a sentence.

### 3.3 The note voice (annotations)

The annotation role is **Special Elite** — the same face as in-fiction headings, on purpose. It replaced Caveat in 2026-08-05 because a handwriting script is the hardest thing on the page to read on a phone, and the app's notes carry real information (a character's one secret, a clue's statement, what a screen is for), not decoration.

Notes are told apart from headings by **everything except the face**: headings are uppercase and untilted, notes are sentence case, tilted `-1deg` from `origin-left`, and usually carry the accent colour. Notes are told apart from Courier Prime body copy by weight — Special Elite is a visibly darker, inked impression next to Courier's thin monospace.

**The scale. Do not swap these sizes 1:1 from any other face.**

| Use | px (sm) | Where |
|---|---|---|
| Note — default | 17 (19) | Clue bodies, quirks, captions, story notes, taglines, hints |
| Note — hero | 18 (20) | The one note a card is *about* — the Identity secret |
| Note — display moment | 22–24 (26–28) | Short strings only: the murderer reveal, the outro |
| Screen brief | 16 (18) | `.er-brief__body`, the §6.10 onboarding note |

**Why the sizes dropped ~4px from the Caveat originals:** Special Elite runs **24% wider per character** (advance 60.0 vs 48.5 per 100px em), even though its x-height is *smaller* (43 vs 54). Width, not x-height, is what governs a face swap in a 390px column — a same-size substitution added a line to every long note and took the screen brief from 3 lines to 5. Measure both faces before changing this table; see [Lessons.md](Lessons.md) 2026-08-05.

**Copy constraint that falls out of it:** a screen brief runs past 3 lines at ~95 characters. Keep briefs under that.

---

## 4. Space and layout

### 4.1 Scale

`4 · 8 · 12 · 16 · 24 · 32 · 48`

The deck uses a 96px margin at 1920px wide — 5% of the viewport. On a 390px phone that's ~20px, so:

- **Screen gutter: 16px** (20px on screens ≥414px)
- **Card padding: 16px**
- **Gap between cards: 12px**
- **Section separation: 24px**

### 4.2 Structure

Every screen is the same three-part frame the deck uses:

```
┌─ chrome ─────────────────────────┐   mono label left · state right
│  ── hairline ──────────────────  │   line
│                                  │
│  KICKER            (signal-lift) │   11px mono
│  Screen Title      (bone)        │   32px display
│                                  │
│  content                         │
│                                  │
│  ── hairline ──────────────────  │
└─ footer ─────────────────────────┘   round indicator · page/count
```

The hairline under the chrome is **not optional** — it is what makes chrome read as chrome instead of as floating text.

### 4.3 Touch

- Minimum target **44×44px**. The deck has no such constraint; the app does.
- Tap feedback is a **scale to 0.96 plus a background shift to `ink-hover`**, not a colour flash.
- Keep the existing haptics. A 20ms buzz on tile tap is part of the product's texture.

> **Why 0.96 and not 0.98** *(revised 2026-08-04)*. 0.98 on a 44px control — the floor
> for everything here — moves the edge by less than a pixel, which is below the
> threshold where a press registers as tactile at all. 0.96 is the smallest value that
> reads; below 0.95 it starts to look exaggerated. Wide blocks and controls sitting
> *inside* paper use `.er-press` instead (0.98, no surface shift), because the same
> ratio travels much further at the edges of a full-width bar, and because shifting to
> `ink-hover` inside a bone document punches a hole in the page.

---

## 5. Surfaces and depth

There are exactly **two surfaces**. Everything else is a variation.

**Ink** — the world. Chrome, navigation, backgrounds, controls.
**Bone** — a document. Anything that is diegetically a piece of paper.

The distinction should be strict and meaningful. A player should learn, without being told, that *bone means evidence*.

### Depth rules

- **Hairlines, not shadows.** Regions on ink separate with 1px `line`. No elevation system, no blur, no glass.
- **Paper is the one thing that casts a shadow**, because paper is physically on top of the board: `0 20px 44px rgba(0,0,0,.55)` on a phone (the deck's `0 34px 76px` is too heavy at this scale).
- **Rotation belongs to paper only.** ±1–2.5°. Chrome never rotates. The app already does this on the grid tiles and it's correct.
- **Corners are square** — except the pushpin and the phone bezel. Rounded cards fight the case-file metaphor.

---

## 6. Component vocabulary

These are the reusable parts. Build them once as React components and the system enforces itself.

### 6.1 Tag

The smallest atomic accent. A filled `signal` block with white mono uppercase.

```
[ ROUND 03 ]     filled — current state
( LOCKED )       ghost: 1px signal border, transparent fill, signal-lift text
[ 32 PLAYERS ]   brass ghost: 1px brass border — numeric state only
```
Padding `8px 16px 6px` at deck scale → **`5px 10px 4px`** on mobile. 11px mono, `0.24em`.

### 6.2 Card (on ink)

`ink-raised` background, 1px `line` border, 16px padding. The **3px top border** is the state channel:

| Top border | Meaning |
|---|---|
| `signal` | Active / urgent / unlocked this round |
| `brass` | Data / statistics / counts |
| `bone-aged` | Archived / historical |
| none | Neutral |

### 6.3 Bone card (the document)

`bone` background, `ink` text, `body-bone` for paragraphs, `signal-deep` for labels. This is the app's dossier, clue card and case file.

Header pattern: mono uppercase label in `signal-deep`, then a **2px solid ink rule**, then content. That rule is the signature of the form.

### 6.4 Pinned card

A bone card plus a `signal` pushpin: a 24px circle (**16px on mobile**), centred on the top edge, offset `-12px`, with `0 6px 10px rgba(0,0,0,.6)` outside and `inset 0 -4px 6px rgba(0,0,0,.32)` for the dome.

**The app already has this on the grid tiles.** Keep it. Extend it to unlocked clues so evidence literally pins to the board.

### 6.5 Em-dash list

Bullets are `—` in `signal`, mono, in a 30px hanging indent (**20px** mobile). Never a disc, never a chevron.

### 6.6 Stat

Brass numeral over a mono `dim-2` label, with a hairline **above**. Used for vote counts, rounds, timers.

Numerals **tick to a new value** rather than jumping ([`Numeral`](src/components/ui/Numeral.jsx)), and are always tabular. Two constraints on that, both load-bearing:

- **It only animates on a *change*, never on mount.** Every stat in the app sits on a screen the player opens and closes constantly; a numeral that re-counts itself on each visit spends attention on a value they have already read. Motion here means "this just moved".
- **The whole tick fits in 380ms**, inside §7's 400ms legibility budget.

### 6.6b Round rail

The round indicator, as a rail beside the numeral: one segment per round, 2px tall, across the chrome gutter. Past rounds fill `bone-aged`, the live round fills `signal` — the §6.2 state channel, so it adds a shape without adding an idiom or a hue.

Built on `transition`, not a keyframe, and that is the point: transitions don't run on first paint, so opening a screen shows the rail already filled and **only a genuine round advance animates it**.

### 6.7 Redaction bar

Solid `signal` block covering text, wiping open via `scaleX` from a left transform-origin over ~0.9s.

Every locked clue, every unrevealed secret, every host-gated file should be a redaction bar that *wipes away* on unlock, rather than content that simply appears. It is on-theme, it is cheap, and it turns a state change into a moment.

**One bar covers one line. A paragraph needs a different form.** ⚠️ Stretched over three or four full-width lines of copy the bar stops reading as a redaction and becomes a field of red, which §2.2 forbids — and that is exactly how the Identity card's four-line confidential note rendered. Multi-line copy gets **ragged marks** instead: four bars at uneven widths (never 100%), laid over the copy as an absolute overlay so the text underneath still sets the height and nothing shifts when they clear. On unseal they wipe in sequence, 90ms apart, and the note rises in behind them. Implemented as `.er-redact-lines` / [`RedactedLines`](src/components/ui/RedactedLines.jsx).

The rule generalises: **the accent may move as a mark or a rule; it may not move as a fill.**

### 6.8 Red thread

SVG bezier in `signal`, animated by `strokeDashoffset`. The connective motif — use it to link an accusation to a suspect, or a clue to the timeline. Sparingly: one per screen at most.

### 6.9 Fill-in blank

`rgba(224,49,39,.12)` background with a 2px dashed `signal` underline. Marks something *deliberately unknown*. In the app this is the natural rendering for an un-entered clue code.

### 6.10b Typed line

Text that arrives a character at a time, for the Round 0 briefing ([StoryIntro.jsx](src/components/StoryIntro.jsx)) and nothing else so far.

It is the one surface in the app that is **neither chrome nor paper**: ink, vignette and grain, with no bone anywhere. That is deliberate — it is the room going dark before the game starts, so it also drops the brass lamp every other screen wears, which is what makes it read as *black* rather than as *lit*.

| Part | Treatment |
|---|---|
| Kicker | 11px mono in `signal-lift`. Never typed — it labels the slide rather than performing |
| Heading | Special Elite, 27px (34px ≥640px), uppercase, `bone` |
| Body | Courier Prime, 16px/1.68 (18px ≥640px), `dim` |
| Caret | 0.55em × 1em `signal` block, blinking on `steps(1, end)` |
| Progress | The §6.6b round rail, one segment per slide |

Two rules make it work:

- **The line must not reflow as it types.** Render the full string in flow but `visibility: hidden` to reserve the height, and lay the revealed slice over it absolutely (`.er-type__ghost` / `.er-type__ink`). Otherwise every word that wraps adds a line box mid-sentence and shoves the rest of the slide down while the player is reading it. Same trick as §6.7's ragged marks: the real copy sets the box, the animated layer rides on top.
- **The caret exists only while typing.** Its absence is what says the page is finished, which is how an infinite blink stays inside §7.1's ban on motion that repeats forever. When the slide completes, the caret is replaced by a static "swipe or tap" cue.

The display face is deliberately absent here — it belongs to numerals and screen titles, and this screen has neither. The slide counter is the exception, because a counter is a number, so it is brass.

### 6.11 Stack hub

A screen whose content is several long document stacks, which opens on a **grid of the stacks** and drills into one. Used once so far, on Evidence ([IntelView.jsx](src/components/views/IntelView.jsx)): accusations, motives, evidence, revelations, and the host-released case files.

It is the grid hub (§9) recursed one level, and it borrows that screen's vocabulary deliberately — pinned paper, slight rotation, a label and a mono sub-label — because each tile *is* a stack of case paper. Bone is the honest surface for it.

| Part | Treatment |
|---|---|
| Open tile | `er-bone` / `er-bone--aged`, `er-pin`, `er-rotL` / `er-rotR`, `py-4` |
| Count | Display face, 30px, tabular, in **`ink`** — *not* brass. Brass on bone is not a sanctioned pair (§2.3); `ink` on `bone` is the system's highest contrast at 15.78:1 |
| Label | Typewriter, bold, uppercase, 17px (19px ≥640px) |
| Sub | 11px mono in `signal-deep` — and it is the same string as the stack's screen kicker (below) |
| Sealed tile | Not paper at all: `ink-raised` + `line` border, carrying a `er-tag--ghost` reading `Opens R0X`, and `disabled` |
| Wide tile | The one stack that is a different *kind* of thing spans the row, as EXIT does on the main board |

Seven rules, each of which was a defect first:

- **Reach for this only when the stacks are genuinely long.** Measurement is what forced it: with everything released the clue stacks are 31 cards / ~23,000px and the archive is 6 documents / ~4,800px, so any flat arrangement buried something 6–28 screens down. Two *short* regions should just be separated by a hairline (§10).
- **A sealed tile is inert.** A tap that only tells you it was sealed is a dead end. The ghost tag already says when it opens.
- **Which stack is open belongs to the router, not the view.** On a stack the screen's *title* is the stack's name, and [App.jsx](src/App.jsx) owns the frame for every screen (§4.2). Holding it locally means either three stacked headings — Evidence / Evidence / Motives — or duplicating the whole frame into the view.
- **A stack's kicker must not repeat the screen's name.** The stacks are framed as screens, so the evidence stack would otherwise read `Evidence Board / Evidence`. Give each stack a descriptor for its kicker (`Hard findings`, `Who saw what`, `Official record`) and let the back control name the parent. Storing that kicker in [screenGuide.js](src/data/screenGuide.js) and reusing it as the tile's sub-label is what stops a tile and the screen it opens describing the same stack differently.
- **An action that produces content in a stack must open that stack.** A decoded code opens its own stack so the §7.2 unseal moment plays where the player is looking — set in the decode handler, which is an event, not an effect.
- **Close undoes one level, not the whole trip.** A stack is framed as a screen, so the chrome-rail X on it has to behave like the X on a screen: it returns to the hub, and the next one returns to the board. Dropping straight to the board skips a screen the player never left — and because the label is read aloud by a screen reader, the `aria-label` has to change with the destination, not stay `Close and return to the board`.
- **A card that is the player's own still belongs in its stack.** The Evidence hub pins the two cards you *perform* — the confession and your own accusation — so they are never behind a tap. That is not a reason to withhold the accusation from the Accusations stack: everybody else's is there, and a stack missing only yours reads as a hole rather than as a promotion. Show it in both, lead the stack with it under the hub's own `Yours alone` label, and drop the found copy so a host reveal can't put the same card on screen twice.

### 6.10 Screen note

A `bone-aged` note pinned under a screen's title, saying in one line what that screen is for. It behaves like a tooltip — anchored to the title by a caret, and **temporary**: it clears itself from Round 02 (`BRIEF_HIDDEN_FROM_ROUND` in [src/data/screenGuide.js](src/data/screenGuide.js)), because by then the room knows the app and a permanent explainer is just furniture.

It is one half of a pair. This half is *pushed* and expires; the §6.13 tooltip is *pulled* and never does. Same surface on purpose, so the app has one idiom for "here is what this is" rather than two.

It is deliberately **paper, not a chrome callout**. Aged bone on ink is the highest-contrast thing on the screen, so it reads as highlighted with no accent at all — which leaves the screen's one `signal` focal point (§10) on the decoder, the ballot or the reveal instead of spending it on onboarding.

| Part | Treatment |
|---|---|
| Surface | `.er-bone .er-bone--aged`, `er-rotL`, `er-land` — it's paper, so it rotates and casts the one shadow |
| Caret | 11px square rotated 45° on the top edge, same fill as the note. Square-cut like every other corner (§5) |
| Label | 11px mono in `signal-deep` left, `Clears at Round 02` stamp right — **both must fit one line at 390px** |
| Body | Handwriting face, 20px (23px ≥640px), `ink`. It is a margin note (§3.1), which is also why briefs are written to 1–2 short sentences |

Round numbers here stay in the stamp colour, **not brass** — brass on bone fails contrast (§2.3).

Copy lives in [src/data/screenGuide.js](src/data/screenGuide.js), which is also where the Guide reads its screen descriptions from, so the two can't drift apart.

### 6.12 Filter field

A one-line search field for any screen whose list is long enough that finding a known name by eye is the slow path. Used on the ballot and the suspect index — both of which are 51 rows. Implemented as [`SearchField`](src/components/ui/SearchField.jsx).

| Part | Treatment |
|---|---|
| Surface | `ink` inside a `line` hairline, square corners — it is a control, so it never becomes paper |
| Focus | Border goes `signal` via `focus-within`, 150ms, colour only. Same treatment as the chat composer, so the app has one input idiom |
| Icon | §6-neutral magnifier at 16px in `dim-2`, left. No accent — it labels the field, it isn't the focal point |
| Input | Body face, 15px, `bone`, placeholder `dim-2` |
| Clear | The `X` icon at 16px in `dim`, appearing only once there is a query, inside `er-touch` |
| Result count | 11px mono in `dim`, below the field, present only while filtering |

Three rules:

- **The count is mono, not brass.** Brass is game data — votes cast, guests on record (§2.2). "How many rows survived my typing" is chrome, and putting it in the display face makes a UI affordance compete with the evidence on the same screen.
- **Filtering hides rows; it must never reorder them.** The ballot's order is a stable hash shared by all 51 players precisely so "the third one" translates across the room. A filter that re-sorted, or that renumbered the suspect index by filtered position, would break the references the room speaks in — file numbers stay tied to the roster position.
- **The empty result is a sentence, not a blank panel.** An empty list under a field the player just typed into is indistinguishable from a screen that broke.

### 6.13 Tooltip

An 18px `?` mark that opens a scrap of paper explaining the control or number it sits beside. Implemented as [`InfoTip`](src/components/ui/InfoTip.jsx); copy lives in [src/data/tooltips.js](src/data/tooltips.js), for the same reason the screen briefs live in [screenGuide.js](src/data/screenGuide.js) — the Guide states the same facts, and two copies of an explanation drift.

It is the **pulled** half of the explanation layer and the counterpart to §6.10. The screen note is pushed and expires at Round 02; this one is asked for and never expires, because the game runs to Round 06 and by Round 04 the player is looking at four stacks, two floating buttons, a withheld tally and a number called "in play this round" with nothing on screen to explain any of it.

| Part | Treatment |
|---|---|
| Mark | 18×18, 1px `line` border, square (§5), 11px mono `?` in `dim`. Open/hover goes `signal-lift` + `signal` border |
| Mark on bone | `signal-deep` text, `line-bone` border; open fills at `rgba(142,24,17,.09)` — `signal-lift` on bone fails contrast (§2.3), and there is no darker paper to shift to |
| Chip variant | 36×36 on `ink-raised` with the FAB shadow, for the one mark that stands alone rather than trailing a label. Stays `dim`, never `signal`: the CODE button is that screen's one focal point (§10) |
| Panel | `.er-bone .er-bone--aged`, `min(300px, 100vw − 24px)`, `12px 14px 14px` |
| Caret | The §6.10 caret, but its x is driven by `--caret-x` from the trigger's centre |
| Label | `er-bone-label`. Under ~22 characters or it wraps in a 300px panel |
| Body | The §6.10 note voice, 16px (18px ≥640px) — the rule is literally shared with `.er-brief__body` |
| Motion | 180ms opacity + 6px translate, direction following the flip. Never opacity alone (§7) |

Six rules, five of which were a defect first:

- **The panel is portalled to `document.body`.** Paper tilts with the `rotate` property, and `rotate` establishes a containing block for `position: fixed` — so a tooltip rendered inside a bone card anchors to the card *and inherits its 1.2° tilt*, pointing the caret at nothing. The portal also clears the modals (z-70 vs z-50) and the root's `overflow-x: clip`.
- **The panel does not rotate**, alone among paper in this system. It is anchored to a specific word by a caret, and 1.2° walks the point off the thing it points at. §5's rotation rule is a permission, not a requirement.
- **Position is written to the DOM, not held in state.** Measuring in a layout effect and calling `setState` re-runs the effect, which measures again and sets a fresh object — an infinite loop. `data-placed` keeps the unmeasured first frame invisible.
- **The caret clamp must be looser than the worst real anchor.** It only bites when a viewport edge has pushed the panel off-centre — which is exactly when the trigger sits nearest the panel's own edge. At an 18px inset the app's right-most mark (the round tip on the board masthead, centre landing 287px into a 300px panel) had its caret pulled 5px off target. 12px, measured.
- **The mark is 18px and the target is 44px** (§4.3), expanded with a pseudo-element rather than padding: a 44px-tall control inline in an 11px label row sets that row's height to 44px everywhere it appears.
- **Adding a mark to a `justify-between` row can wrap the label opposite it.** Flex shrinks *both* sides, so the 26px the mark adds comes out of whichever column has slack. On the Suspects stat — a label opposite a sentence rather than a second numeral — it wrapped "Guests on record" onto two lines at 390px. Pin the label column with `shrink-0` and let the prose absorb it. Verify by counting the client rects of the label's text node, not by eyeballing row height: several of these rows also carry a 20px numeral and are legitimately tall.

Where they are placed, and why each earns it:

| Surface | Anchor | Answers |
|---|---|---|
| Chrome rail + board masthead | `Round` | *What should I be doing right now?* Generated from `ROUNDS` + `ROUND_GUIDE`, so it cannot contradict the Guide |
| Evidence hub & every stack | `Collected`, `In play this round` | Whether a stack is empty because you are behind or because the round has not opened it |
| Evidence | the ASK / CODE pair | The whole economy of the evening, behind two four-letter labels. The copy follows the corner: Rounds 00–01 have no ASK, so the tooltip explains CODE alone rather than a button that isn't there |
| Evidence → Case files | `Released` | That these need no code, unlike everything else the player has been trading |
| Identity | `Subject File` | That the secret is yours alone and sharing it is a choice |
| Timeline | your name, `Key events` | What the red marks mean; public record vs. your own account |
| Comms | `Comms` | That every message is signed and nothing can be unsaid |
| Suspects | `Guests on record` | That the file number is a reference the room speaks in, and that the list never says who is a suspect |
| Vote | `Ballot open/closed`, `Votes cast` | Who opens the ballot; that a withheld tally is hidden from everyone, not just you |

---

## 7. Motion

The project uses plain CSS — no Framer Motion, no GSAP ([Claude.md](Claude.md)). Everything here is CSS-only.

- **Entrance easing:** `cubic-bezier(.16, 1, .3, 1)` at `.6s`–`.85s`. Sharp start, long settle.
- **Landing easing:** `cubic-bezier(.34, 1.4, .5, 1)` — the overshoot for pins, cards and tiles. The app's `slideInUp` already uses `(0.34, 1.56, 0.64, 1)`; that's the right family.
- **Stagger:** 40–80ms between siblings. Never reveal a group at once.
- **Never fade on opacity alone.** Always pair with a 12–24px translate or a `0.96→1` scale. The one exception is a modal scrim (`.er-fade`) — it has no content to move, and translating it would show the screen edge underneath.
- **Settle before it's read.** Anything a player must read must be static within 400ms. The Round 0 briefing (§6.10b) is the one sanctioned exception — a typed line *is* the screen — and it pays for it the way the murderer reveal pays for owning the screen in red: a tap fills the slide instantly, Skip leaves entirely, and reduced motion delivers every slide already complete.
- **Honour `prefers-reduced-motion`** — the deck reduces every duration to `0.01ms`/`0.2s`. Match that.
- **Name the properties you transition.** Never a blanket property transition: it will eventually pick up a layout property and animate a reflow. Specify `translate`, `scale`, `opacity`.
- **Prefer what the compositor can take.** A tally bar grows by `scaleX`, not `width` — with a row per suspect, animating a layout property is the one place in this app that can genuinely drop frames.

### 7.1 Motion restraint — the counterweight ⚠️

Every rule above says *add motion*. This one says where not to, and it matters more, because the cost of an animation is paid on every trigger while the benefit is paid once.

**No staged entrance on a high-frequency interaction.** The clearest case in this app: returning to the grid hub. It happens after every single screen, and the full board landing is eight tiles × 60ms plus a 700ms overshoot — about 1.2s of motion, repeated dozens of times a game. The sequence now plays **once per session**, on the first visit; every return after that is a single 260ms lift with no stagger (`.er-enter-quick`). Same reasoning drives the numerals not animating on mount (§6.6) and the rail not animating on first paint (§6.6b).

**Motion is never the only feedback channel.** Every animated state change also carries a static cue — a label, a border, a tag. The freshly unsealed clue animates *and* wears a "Just unsealed" tag; a committed vote stamps *and* takes the signal border and the "Your vote" label.

**A confirmation is one shot; only a genuine sustained alarm repeats.** The vote screen used to hold `.er-alarm` — an infinite 2.4s pulse — for two seconds after a vote landed. An endless pulse reads as *something is wrong with this card*, not *recorded*. Confirmations are `.er-stamp`: 420ms, once, done. `.er-alarm` is reserved and currently unused, which is the correct number of uses.

**A control that arrives mid-game may knock, three times, once per device, ever** (`.er-summon`, App.css §17). ASK is the only case, and it is unlike anything else in the app: it is absent for the first two rounds because the riddle lock has nothing to pay out yet, and then it appears at a round advance beside a CODE button the player has been tapping all evening, in the corner their thumb already rests on. Left alone it reads as furniture. So it hops and blinks three times — about 3.5s, after its own landing has finished — and then stops dead at its resting position. The budget is deliberately small and deliberately spent: it does not repeat next round, it does not repeat on the next visit, and it does not survive a reload, because the ledger is in `localStorage` rather than in session state. The temptation this rule exists to refuse is the obvious one — leaving it pulsing until the player taps it. That is the reserved `.er-alarm`, and a button that pulses all evening reads as broken rather than new. Motion is not the only channel here either: the button is labelled, and the corner tooltip swaps to explain it the moment it appears.

**A cue for a recurring release is tied to the unread state, and costs less each time** (`.er-summon-tally`, App.css §17). The second knock in the app is VIEW TALLY on the Vote screen, and the shape of its trigger is the opposite of ASK's: the host releases the numbers up to six times an evening, always while most of the room is on Chat, and the release is only worth announcing until the player has looked. So the rules invert in three places. **Two hops, not three** — a cue that recurs has to be cheaper per firing, or six firings accumulate into the pulse the rule above forbids. **It is bounded by a state, not by a ledger of one** — it knocks whenever the button mounts still unopened, so a player who wanders off from a flagged tally is nudged again when they come back, and it stops for good the moment they open it, because what it was announcing is gone. **What never repeats is the knock for a tally already read** — the ledger is the round number of the last tally this device opened, so Round 04's release re-arms it and Round 03's cannot. The static half is the part that persists: a `signal` border with the 3px state channel and a "Just released" tag, both of which clear on the same tap.

*Both knocks share one keyframe.* `erSummon` is the app's only "notice this" motion — differing budgets and delays, never a second vocabulary for the same idea.

### 7.2 Signature moments

*All five are implemented.*

| Moment | Motion |
|---|---|
| Clue unlocked | Card lands with overshoot, the 3px state rule sweeps across its top edge and dissolves, the statement rises in behind it. The card also floats to the top of the board, because a new clue buried in DB order is a clue the player has to hunt for |
| Round advance | Round title crossfades, brass numeral ticks, rail fills the new segment 120ms behind it |
| Vote cast | Bar grows by `scaleX`, brass numeral counts up, the card takes a single stamp |
| Murderer reveal | Full-bleed `signal` — the one time red owns the screen |
| Riddle cracked | Two square `signal` rings expand and rotate out of the centre, fourteen 8×2px paper flecks (bone / aged bone / brass / signal) tumble outward behind them, and a `SOLVED` seal drops in over-scaled and off-angle and settles at −9°. Three synthesized bells up a major triad, three haptic pulses. The clue card and the shareable code rise in behind it |

**On the riddle-cracked moment and §7.1.** It is the loudest motion in the app after the reveal, and it earns that the same way: the trigger is a player choosing to solve a puzzle — a handful of times an evening, never incidentally — on a surface that exists only to deliver the payoff. It is still one shot, nothing loops, and the static half carries the meaning on its own: the seal reads `SOLVED`, the code is set in 30px mono, the clue names itself. Under `prefers-reduced-motion` the rings and flecks are `display: none` and the seal is simply stamped from the first frame; nothing is lost.

**Verify motion by measuring it, not by looking at a still.** `getComputedStyle` returns the *animated* value mid-animation, so the `scaleX` component of a matrix is an exact reading of a wipe's progress — which is how the staggered redaction was confirmed to start covered, stagger, and finish fully open, including under `prefers-reduced-motion`.

---

## 8. Implementation

The app is Tailwind v4 with `@config "../tailwind.config.js"` wired in [src/index.css](src/index.css). Add these tokens to the existing `@theme` block — `@theme` emits real CSS custom properties, so they're usable from [src/App.css](src/App.css) too, which `tailwind.config.js` colours are not.

```css
/* src/index.css — inside the existing @theme block */
@theme {
  /* --- existing font tokens stay --- */

  /* Evidence Room — surfaces */
  --color-ink:        #0C0D0F;
  --color-ink-raised: #141518;
  --color-ink-hover:  #1C1E22;
  --color-bone:       #EDE7DA;
  --color-bone-aged:  #D8D0BF;

  /* Evidence Room — the one accent */
  --color-signal:      #E03127;
  --color-signal-deep: #8E1811;  /* on bone */
  --color-signal-lift: #F2564C;  /* small text on ink — AA safe */

  /* Evidence Room — data only */
  --color-brass: #D8A33C;

  /* Text */
  --color-dim:       #98948D;
  --color-dim-2:     #6B6964;
  --color-body-bone: #4A453C;

  /* Display face — numerals and screen titles only */
  --font-display: 'Big Shoulders Display', 'Big Shoulders', Impact, sans-serif;
}
```

Add the font in the same `@import` as the others:

```css
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Special+Elite&family=Courier+Prime&display=swap');
```

That yields `bg-ink`, `text-bone`, `border-signal`, `text-brass`, `font-display`, and `var(--color-signal)` in plain CSS.

**What shipped also includes**, beyond the snippet above:

- `--color-line`, `--color-line-faint`, `--color-line-bone` as real tokens, so hairlines are `border-line` rather than a hand-written `rgba()` at each call site.
- `--font-mono` overridden to IBM Plex Mono, which makes the stock `font-mono` utility correct by default.
- `--ease-enter` / `--ease-land` for the two §7 curves.
- The §6 component vocabulary as `.er-*` classes in [src/App.css](src/App.css).

⚠️ **The one non-obvious trap.** `App.css` must be pulled in from `index.css` as:

```css
@import "./App.css" layer(components);
```

**not** with `import './App.css'` in `main.jsx`. Unlayered CSS beats every layered rule regardless of specificity, so a plain JS import makes `.er-card`'s padding and `.er-title`'s font-size unoverridable — `er-title text-[28px]` silently renders at 32px, and `er-card p-0` silently keeps its 16px. Inside `@layer components` the utilities win, which is what every call site assumes.

### Migrating the existing palette

The current `mystery-*` colours are close but muddier. Map, don't keep both:

| Current | → | New | Note |
|---|---|---|---|
| `mystery-dark` `#0f0f0f` | → | `ink` `#0C0D0F` | Slightly deeper, cooler |
| `mystery-paper` `#e3dac9` | → | `bone` `#EDE7DA` | Brighter, less yellow |
| `mystery-ink` `#1a1a1a` | → | `ink` on bone / `ink-raised` as surface | Currently overloaded — split it |
| `mystery-blood` `#8a0303` | → | `signal` `#E03127` | **Biggest change.** Old red is dark and muddy; it reads brown on a phone |
| `mystery-aged` `#c0b298` | → | `bone-aged` `#D8D0BF` | |
| `mystery-charcoal` `#2c2c2c` | → | `ink-hover` `#1C1E22` | |
| `mystery-sepia` `#704214` | → | `brass` `#D8A33C` | Sepia is a brown fill; brass is a data colour. **Different job** — audit each use |

Migrate one view at a time; both palettes can coexist while you do.

---

## 9. Screen-by-screen application

*All rows below are implemented. The "What changes" column is kept as the record of what each screen was and what it became.*

| Screen | File | What changes |
|---|---|---|
| Login | [CharacterSelect.jsx](src/components/CharacterSelect.jsx) | Already close. Retag `CONFIDENTIAL` as a filled `signal` tag; code input becomes a fill-in blank |
| Briefing | [StoryIntro.jsx](src/components/StoryIntro.jsx) | *Added 2026-08-05.* Ink only, no paper, no lamp. In-fiction voices, typed (§6.10b). Slide rail = the round rail; slide counter is the only brass |
| Story | [StoryView.jsx](src/components/views/StoryView.jsx) | *Added 2026-08-05.* The same beats as one long bone document — sections split by `line-bone` hairlines, `On record` stamp, no rotation (a 900px page rotated 1.2° reads as broken, not as pinned) |
| Grid hub | [GridMenu.jsx](src/components/GridMenu.jsx) | Already the strongest screen. Keep pins and rotation; swap tile colours to `bone`/`bone-aged`, VOTE to `signal`, EXIT to `ink-hover`. *Updated 2026-08-05:* six destinations in a 3×2 board, then GUIDE and EXIT as full-width strips — both are utilities rather than places in the fiction, and an odd tile count would otherwise leave a hole in the board |
| Identity | [DashboardView.jsx](src/components/views/DashboardView.jsx) | Full bone card. Secret becomes a **redaction bar** the player taps to reveal |
| Evidence | [IntelView.jsx](src/components/views/IntelView.jsx) | Clue cards as pinned bone cards; locked clues as redaction bars; category via 3px top border. *Updated 2026-08-05:* a §6.11 stack hub over five stacks — accusations, motives, evidence, revelations, case files — with your own accusation and the confession pinned on the hub itself. *Updated 2026-08-07:* your accusation also leads the Accusations stack, and the chrome-rail X on an open stack steps back to the hub rather than out to the board |
| Decoder | [DecoderModal.jsx](src/components/modals/DecoderModal.jsx) | Fill-in blank input; three outcomes in `signal` / `brass` / `dim-2` |
| Riddle lock | [RiddleModal.jsx](src/components/modals/RiddleModal.jsx) | *Added 2026-08-07,* replacing the printed clue cards. Sits beside the decoder as the second Evidence FAB — **ASK in `line`/`bone`, CODE in `signal`**, because the pair must not read as two equal buttons and CODE is the one a player with a code in their ear is reaching for. The riddle is a pinned bone card (a question handed to you is paper); the answer field is the same fill-in blank as the decoder. The solve is §7.2's fifth signature moment, and the shared code sits under a `brass` 3px rule — the only card in the app whose *content* is a value to be copied. *Updated 2026-08-07:* ASK is **not on screen until Round 02** — the pool's earliest reward is a Round 2 motive, so before then the lock could only refuse — and it knocks three times the first time each player sees it (§7.1, `.er-summon`) |
| Comms | [ChatView.jsx](src/components/views/ChatView.jsx) | **Currently off-palette (orange).** Own messages `signal`, others `ink-raised`, names in mono `signal-lift` |
| Vote | [VotingView.jsx](src/components/views/VotingView.jsx) | **Currently off-palette (green).** Counts in `brass` display; selected suspect gets a `signal` border. *Updated 2026-08-07:* a released tally is announced rather than left to be noticed — VIEW TALLY knocks twice (§7.1, `.er-summon-tally`) and holds a `signal` border, the 3px state channel and a "Just released" tag until this device opens it. `Tally withheld` is unchanged, because a withheld tally is a state, not news |
| Case files | [CaseFilesSection.jsx](src/components/views/CaseFilesSection.jsx) | Locked files as ghost tags with round numbers; opened files as bone documents. *Was the standalone "Archives" screen until 2026-08-05; now one of the five Evidence stacks* |
| Timeline | [TimelineView.jsx](src/components/views/TimelineView.jsx) | Red thread as the spine; times in mono `brass` |
| Reconstruction | [RevealDeck.jsx](src/components/RevealDeck.jsx) | *Added 2026-08-06 as one scrolling document; became the 22-slide deck 2026-08-07.* "How it happened", opened from the reveal overlay and the outro. Deliberately the **opposite surface to the screen it comes from**: the reveal is full-bleed `signal`, so this is ink and paper, and red appears only as marks — the thread, the beat markers, the mastermind's 3px state rule. The beats nobody could see are told apart by marker *size*, body colour and an `UNSEEN` tag, so the key never depends on separating `signal` from `dim-2`. **It is the projected deck's twin, not its port**: [reveal-deck/index.html](reveal-deck/index.html) is a fixed 1920×1080 stage in the deck voice, this reflows in the app voice at the §3.2 mobile scale — see §3.1, the deck's fonts never come into the app. Chapter dividers are the one place a display numeral is allowed to be decorative (outlined, `line`-weight, never `brass`) |
| Host | [HostPanel.jsx](src/components/HostPanel.jsx) | **Currently off-palette (purple/indigo gradient) — the worst offender.** Rebuild on ink with hairlines; REVEAL MURDERER is the one full `signal` fill in the app |

### Known inconsistencies — ✅ all resolved 2026-08-02

Visible in the screenshots captured for the deck. Every one of these is now fixed:

1. ~~**Host panel is purple/indigo**~~ — rebuilt on ink with hairlines; REVEAL MURDERER is the app's only full `signal` fill.
2. ~~**Voting uses green** for "VOTING OPEN"~~ — open/closed is now a mono label plus the 3px state channel; counts are brass numerals.
3. ~~**Chat bubbles are orange**~~ — own messages are `signal`, everyone else's are `ink-raised` with a hairline, names are mono `signal-lift`.
4. ~~**`mystery-sepia` used as a surface fill** (GUIDE tile)~~ — the whole `mystery-*` palette is deleted; tiles are `bone`/`bone-aged`, EXIT is `ink-hover`.

Also removed in the same pass: the Timeline's indigo→purple→pink gradients, the Help screen's five content-block hues and `halloween-*` classes, the Dossier's 16-colour avatar rainbow, and the Vote screen's amber selection state. Verified by grep — no Tailwind palette class (`green-`, `blue-`, `purple-`, `orange-`, `amber-`, `stone-`, …) remains in `src/`, and the built CSS contains none of the old hex values.

### Things the implementation added that this spec didn't call out

- **`signal-lift` is load-bearing.** Almost every red label in the app is under 18px, so `.er-mono--hot` uses `signal-lift`, not `signal`. Reach for `signal` only on fills, rules, borders and display type.
- **`dim-2` is the default mono colour**, per §3.2 — but §2.4 forbids it for anything a player must act on. In practice that means professions, instructions, states and counts all take `.er-mono--dim`; only genuinely decorative chrome (case IDs, footer stamps, timestamps) is left at `dim-2`.
- **Rotation uses the CSS `rotate` property, not `transform`.** `.er-touch:active` sets `transform: scale(.98)`, which would otherwise wipe the paper's rotation out on every tap.
- **The redaction bar needs single-line, ragged-width content.** Wrapped over two or three full-width lines it stops reading as a redaction and becomes a slab of red, which §2.2 forbids.
- **Mono labels are expensive at phone width.** `0.18–0.24em` tracking on 11px means a 19-character label ("WHAT THIS SCREEN IS") wraps to two lines once anything shares its row. Budget roughly 9px per character and keep any label that sits opposite another to ~12 characters.

---

## 10. Do / Don't

**Do**
- Use `signal` for exactly one thing per screen — the thing that matters most right now.
- Put brass on numbers and nothing else.
- Separate regions with hairlines.
- Let bone mean "document" and ink mean "interface", consistently.
- Track mono labels wide and uppercase.
- Pair every fade with a transform.
- Let paper rotate slightly and cast a shadow.

**Don't**
- Introduce a second accent hue. Change surface instead.
- Put `signal` on body text on ink — use `signal-lift`.
- Fill large areas with red, except the reveal.
- Round card corners, or add glass/blur/glow.
- Uppercase a sentence.
- Use `dim-2` for anything a player must read.
- Copy the deck's px values — it's authored at 1920 wide.

---

## 11. Checklist

Before shipping a screen:

- [ ] Exactly one `signal` focal point
- [ ] Brass appears only on numerals
- [ ] Body text ≥15px; red text under 18px uses `signal-lift`
- [ ] Every touch target ≥44×44, and every one of them has press feedback
- [ ] Regions separated by hairlines, not shadows
- [ ] Bone surfaces are diegetic documents only
- [ ] No hue outside the §2.1 table
- [ ] No redaction bar spanning more than one line (§6.7)
- [ ] Content readable within 400ms of entry
- [ ] No staged entrance on anything the player triggers repeatedly (§7.1)
- [ ] Every animated state change also has a static cue (§7.1)
- [ ] Every transition names its properties — never a blanket one (§7)
- [ ] Works under `prefers-reduced-motion`
- [ ] **The page does not scroll sideways.** Measure it: `scrollWidth - clientWidth` at 390px must be 0. The atmospheric lamp is 640px wide at `left: -220px`, so any root that renders it needs `overflow-x: clip`
- [ ] **A horizontal swipe cannot leave the app.** Any screen that reads horizontal gestures needs `touch-action: none` — near the left edge Chrome's history-back gesture wins over your handler and replaces the document
- [ ] Legible at low brightness in a dim room

---

**Source of truth:** [pitch-deck/index.html](pitch-deck/index.html) — the `:root` block and the component vocabulary section. Values here were read from that file and contrast ratios computed against it.
