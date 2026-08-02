# Design Language — "Evidence Room"

> The visual system built for [pitch-deck/index.html](pitch-deck/index.html), written up so it can be applied to the player app.
>
> **Read this with [Claude.md](Claude.md).** It is a design spec, not a migration plan — it tells you what the system *is* and how each rule maps onto the React app. Nothing here has been applied to `src/` yet.

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
| Accent | IBM Plex Mono | Caveat (handwriting) |

**Do not replace the app's fonts with the deck's.** Special Elite and Caveat are doing something the deck's fonts can't: they make the phone feel like a prop inside the fiction. That's a genuine asset and it's why the app's screenshots look good.

**The recommendation is a split, by function:**

- **In-fiction content keeps its current voice.** Character dossiers, clue cards, case files, accusations, chat — Special Elite for headings, Courier Prime for body, Caveat for margin notes and annotations.
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
| Annotation | 17 / 1.3 | Caveat | `signal-lift` | In-fiction margin notes only |

**Tracking rule:** mono labels get `0.18em`–`0.24em`. Generous letter-spacing is what makes monospace read as *editorial chrome* rather than as *code*. Display type goes the other way: `-0.01em`.

**Case rule:** uppercase is for chrome and titles. Never uppercase a sentence.

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
- Tap feedback is a **scale to 0.98 plus a background shift to `ink-hover`**, not a colour flash.
- Keep the existing haptics. A 20ms buzz on tile tap is part of the product's texture.

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

### 6.7 Redaction bar

Solid `signal` block covering text, wiping open via `scaleX` from a left transform-origin over ~0.9s.

**This is the app's single biggest untapped opportunity.** Every locked clue, every unrevealed secret, every host-gated file should be a redaction bar that *wipes away* on unlock, rather than content that simply appears. It is on-theme, it is cheap, and it turns a state change into a moment.

### 6.8 Red thread

SVG bezier in `signal`, animated by `strokeDashoffset`. The connective motif — use it to link an accusation to a suspect, or a clue to the timeline. Sparingly: one per screen at most.

### 6.9 Fill-in blank

`rgba(224,49,39,.12)` background with a 2px dashed `signal` underline. Marks something *deliberately unknown*. In the app this is the natural rendering for an un-entered clue code.

---

## 7. Motion

The project uses plain CSS — no Framer Motion, no GSAP ([Claude.md](Claude.md)). Everything here is CSS-only.

- **Entrance easing:** `cubic-bezier(.16, 1, .3, 1)` at `.6s`–`.85s`. Sharp start, long settle.
- **Landing easing:** `cubic-bezier(.34, 1.4, .5, 1)` — the overshoot for pins, cards and tiles. The app's `slideInUp` already uses `(0.34, 1.56, 0.64, 1)`; that's the right family.
- **Stagger:** 40–80ms between siblings. Never reveal a group at once.
- **Never fade on opacity alone.** Always pair with a 12–24px translate or a `0.96→1` scale.
- **Settle before it's read.** Anything a player must read must be static within 400ms.
- **Honour `prefers-reduced-motion`** — the deck reduces every duration to `0.01ms`/`0.2s`. Match that.

Signature moments worth building:

| Moment | Motion |
|---|---|
| Clue unlocked | Redaction bar wipes left→right, card lands with overshoot |
| Round advance | Chrome label crossfades, rail fills to the new round |
| Vote cast | Bar grows, brass numeral counts up |
| Murderer reveal | Full-bleed `signal` — the one time red owns the screen |

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
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Special+Elite&family=Caveat:wght@400;700&family=Courier+Prime&display=swap');
```

That yields `bg-ink`, `text-bone`, `border-signal`, `text-brass`, `font-display`, and `var(--color-signal)` in plain CSS.

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

| Screen | File | What changes |
|---|---|---|
| Login | [CharacterSelect.jsx](src/components/CharacterSelect.jsx) | Already close. Retag `CONFIDENTIAL` as a filled `signal` tag; code input becomes a fill-in blank |
| Grid hub | [GridMenu.jsx](src/components/GridMenu.jsx) | Already the strongest screen. Keep pins and rotation; swap tile colours to `bone`/`bone-aged`, VOTE to `signal`, EXIT to `ink-hover` |
| Identity | [DashboardView.jsx](src/components/views/DashboardView.jsx) | Full bone card. Secret becomes a **redaction bar** the player taps to reveal |
| Evidence | [IntelView.jsx](src/components/views/IntelView.jsx) | Clue cards as pinned bone cards; locked clues as redaction bars; category via 3px top border |
| Decoder | [DecoderModal.jsx](src/components/modals/DecoderModal.jsx) | Fill-in blank input; three outcomes in `signal` / `brass` / `dim-2` |
| Comms | [ChatView.jsx](src/components/views/ChatView.jsx) | **Currently off-palette (orange).** Own messages `signal`, others `ink-raised`, names in mono `signal-lift` |
| Vote | [VotingView.jsx](src/components/views/VotingView.jsx) | **Currently off-palette (green).** Counts in `brass` display; selected suspect gets a `signal` border |
| Archives | [FilesView.jsx](src/components/views/FilesView.jsx) | Locked files as ghost tags with round numbers; opened files as bone documents |
| Timeline | [TimelineView.jsx](src/components/views/TimelineView.jsx) | Red thread as the spine; times in mono `brass` |
| Host | [HostPanel.jsx](src/components/HostPanel.jsx) | **Currently off-palette (purple/indigo gradient) — the worst offender.** Rebuild on ink with hairlines; REVEAL MURDERER is the one full `signal` fill in the app |

### Known inconsistencies

Visible in the screenshots captured for the deck. Worth fixing regardless of whether you adopt this system:

1. **Host panel is purple/indigo** — not in any palette, present or proposed.
2. **Voting uses green** for "VOTING OPEN" — introduces a second accent hue.
3. **Chat bubbles are orange** — a third accent.
4. **`mystery-sepia` is used as a surface fill** (GUIDE tile) where the new system would use a paper tone.

Each of these adds a hue the system doesn't have. Collapsing them into `signal` + surface changes is most of the visual win.

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
- [ ] Every touch target ≥44×44
- [ ] Regions separated by hairlines, not shadows
- [ ] Bone surfaces are diegetic documents only
- [ ] No hue outside the §2.1 table
- [ ] Content readable within 400ms of entry
- [ ] Works under `prefers-reduced-motion`
- [ ] Legible at low brightness in a dim room

---

**Source of truth:** [pitch-deck/index.html](pitch-deck/index.html) — the `:root` block and the component vocabulary section. Values here were read from that file and contrast ratios computed against it.
