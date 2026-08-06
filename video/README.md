# Astral Project — Murder Mystery · Explainer film

A ~2 minute cinematic explainer built in [Remotion](https://remotion.dev), from
the story in [`../pitch-deck/index.html`](../pitch-deck/index.html).

It is **not** a slideshow of the deck. The beats are rebuilt as animated React
components that reuse the deck's exact design tokens, so the film is
unmistakably the same product — but timed rather than read.

| | |
|---|---|
| **Master** | `out/astral-explainer.mp4` — 1920×1080, H.264, CRF 18 |
| **Social cut** | `out/astral-explainer-vertical.mp4` — 1080×1920, reflowed (never a centre-crop) |
| **Length** | 3900 frames · 130.0s · 30fps |
| **VO script** | [`script.md`](script.md) — optional; the film is built to work silent |
| **Stack** | Remotion + React + inline styles. No Tailwind, no CSS files, no animation library, no state library. |

---

## Preview

```bash
npm install
npx remotion studio          # http://localhost:3000
```

The studio lists:

- **`Explainer`** — the master
- **`Explainer-Vertical`** — the social cut
- **`Scenes/`** — all fourteen scenes as standalone 1920×1080 compositions
- **`Scenes-Vertical/`** — the same fourteen at 1080×1920 (`-V` suffix)

Per-scene compositions make it possible to scrub one beat without waiting on the
other thirteen. Double-clicking a sequence in the master timeline jumps to the
matching scene composition.

## Re-render

```bash
# The master
npx remotion render Explainer out/astral-explainer.mp4 --codec=h264 --crf=18

# The social cut
npx remotion render Explainer-Vertical out/astral-explainer-vertical.mp4 --codec=h264 --crf=18

# One scene, for a quick look
npx remotion render S08Rounds out/s08.mp4 --codec=h264

# One frame, for layout checks (fast)
npx remotion still S08Rounds out/check.png --frame=290 --scale=0.5
```

Before rendering, always:

```bash
npm run lint     # eslint + tsc
```

`tsc` earns its keep here. It catches the specific class of bug this codebase is
prone to — an animation helper spread over a literal `opacity`, which silently
discards one of them (`TS2783`). Two real bugs were caught this way during the
build.

## Where the tokens live

**[`src/theme.ts`](src/theme.ts)** is the single source of truth, lifted verbatim
from the `:root` block of the pitch deck. Import `C` for colour and `F` for type;
never write a hex value in a scene.

```
ink #0C0D0F   ink2 #141518   ink3 #1C1E22
bone #EDE7DA  bone2 #D8D0BF
red #E03127   redDeep #8E1811
amber #D8A33C
```

**Three families, three strict roles:**

| Family | Role |
|---|---|
| **Big Shoulders** 700/800 | Every headline, every numeral. Uppercase, `-0.01em`, line-height 0.80–0.94. |
| **Newsreader** 300/400 + italic | Narrative body and pull quotes. Italic is the only emphasis vehicle. |
| **IBM Plex Mono** 400/500 | Every label, kicker, tag, timestamp and chrome element. Uppercase, 0.20–0.28em. |

> **Font trap:** the `@remotion/google-fonts` export is **`BigShoulders`**, not
> `BigShouldersDisplay`. Google renamed the family "Big Shoulders Display" to
> "Big Shoulders" and the package tracks the new name. The deck's CSS lists both,
> which is why they render identically.

`loadFont()` calls `delayRender()` internally and only `continueRender()`s once
the `FontFace` has actually loaded, so no frame — including frame 0 — can render
in a fallback font. Weights and subsets are always specified explicitly (required
in Remotion v5, and it avoids fetching nine weights per family).

### Palette discipline

- **Red is the only hot accent.** Tags, rules, threads, emphasis. Never a gradient.
- **Amber is numerals and data only.** It appears in exactly four places in the
  whole codebase, all of them numerals — `grep -rn "C.amber" src/` to verify. The
  deck's `t-amber` card and `.tag.amber` variants were deliberately **not**
  ported, and the deck's amber "now" rail dot was made red, so this rule holds by
  construction rather than by convention.
- **Bone is paper and primary text.** Never pure white — the deck's
  `.tag{color:#fff}` is rendered in bone here.
- No purple, no teal, no second accent, no glassmorphism. Shadows only under bone
  paper cards and phone frames.

Two deliberate exceptions, both documented at their call sites:

1. **`#000`** appears three times — the phone notch (matching the deck's
   `.phone .notch`) and the two hard cuts to black. A cut to black cannot be
   `#0C0D0F`; the deck defines `--stage-bg:#000` for the same reason.
2. **The app screenshots contain colours outside the palette.**
   `screen-09-host.png` is ~12% violet (≈`#43295D`) because the shipped host
   console genuinely uses violet panels; the other eight are ≥99.5% in-palette.
   These are real product captures that the deck already publishes. Recolouring
   them would misrepresent the product, so they are used as-is. Everything the
   *film itself draws* is in palette.

## Signature devices

All in [`src/components/`](src/components/), all reused from the deck:

| Component | Device |
|---|---|
| `Atmosphere` | Halftone dots + interrogation-lamp pool + vignette. Every scene renders exactly one, first. |
| `Chrome` | The deck's hairline rails and four corner mono labels. |
| `RedThread` | SVG bezier drawn by `strokeDashoffset`. Also `ThreadPulse` (a lit segment cycling a loop forever) and `ThreadWipe`. |
| `PinCard` | Bone paper, rotated ±1.5–2.5°, heavy shadow, red pushpin. Also `Card`. |
| `Redaction` | Solid red block that wipes open via `scaleX` from a left origin. |
| `StatNumber` | Amber counting numeral + mono label + hairline rule. |
| `Phone` | CSS bezel frame around a real screenshot. |
| `Headline` | Display headline with red `.hot` spans and the cover's red underscore. |
| `Kicker` / `Tag` / `EmDash` | Mono label, red block tag, red em-dash bullet (never a dot). |
| `DotField` | The 50 players as dots, for scenes 2 and 3. |

### RedThread: match `len` to the path

Each thread path takes a `len` roughly equal to its own length. The stroke is
revealed by walking a **single dash** of that length across the path, so a dash
much longer than the path finishes the reveal in the first few frames and the
draw is lost entirely. Use the endpoint distance plus ~15% for the bow.

## Motion language

Encoded in [`src/anim.ts`](src/anim.ts) so it can't drift scene to scene:

- **`enter()`** — the house entrance. `Easing.bezier(0.16, 1, 0.3, 1)` (the deck's
  `--ease`), opacity paired with a 16–40px translate. **Nothing ever fades in on
  opacity alone.**
- **`land()`** — `spring({ config: { damping: 200 } })`. Critically damped, for
  anything that arrives and stays: pins, cards, dealt genre cards.
- **`slam()`** — the one helper that overshoots. Used only on the cold-open and
  closing wordmarks.
- **`stagger()`** — 4–10 frames between children. A group is never revealed at once.
- Transforms are returned as **strings** using the individual `translate` / `scale`
  / `rotate` CSS properties, so React never guesses a unit and parent/child
  transforms compose instead of overwriting each other.

Every scene holds on a still, readable frame for **≥30 frames** before it exits.

### Composing an entrance with an exit

Spreading two animation helpers onto the same element silently cancels the first —
both write `opacity` and `translate`, and the later spread wins. Wrap the group
that leaves in **one** stripping layer instead, and let the transforms compose.
`S14Close` does this; the header comment there explains it.

## Timeline

[`src/scenes/manifest.ts`](src/scenes/manifest.ts) is the single source of truth.
`durationInFrames` on every composition is **derived** from `TOTAL_FRAMES`, so the
timeline can never drift out of sync with the scenes. Change a duration there and
the composition, the `<Series>` and the studio timeline all follow.

| # | Frames | Beat |
|---|---|---|
| 01 | 0–240 | Cold open — the wordmark slams in, thread draws |
| 02 | 240–600 | The problem — 50 dots pull into five closed cliques, then nothing |
| 03 | 600–870 | The mechanism — the same dots light up, threads shoot, the cliques break |
| 04 | 870–1170 | What it is — 50 · 7 · 3 · 1, amber counters |
| 05 | 1170–1470 | You become someone — screens 01→02→03, the SECRET unredacts |
| 06 | 1470–1830 | The loop — three phones, thread cycling beneath them |
| 07 | 1830–2070 | Codes are social objects — the pinned exhibit |
| 08 | 2070–2400 | Seven rounds — the rail fills, padlocks flip open |
| 09 | 2400–2670 | The verdict — tallies move, the lead changes hands |
| 10 | 2670–2880 | The reveal — wave sweeps, all 50 turn at once, cut to black |
| 11 | 2880–3120 | Host control — the console rises out of the blackout |
| 12 | 3120–3420 | Why it works — six mechanisms |
| 13 | 3420–3720 | The platform — six worlds deal in, one marked shipped |
| 14 | 3720–3900 | Close — everything strips away, the thread retracts |

Scenes are joined with **`<Series>`** and **hard cuts**.
`@remotion/transitions` is intentionally not used between scenes: a
`TransitionSeries` overlaps its neighbours, which would shorten the film below
the sum of `SCENES` and break the derived-duration invariant. The film's red
wipes live *inside* scenes as diegetic devices.

## Swapping a screenshot

1. Re-capture at **390×844 @2x** → 780×1688 (aspect 0.4621).
2. Overwrite the matching PNG in [`public/`](public/). Keep the filename.
3. Nothing else changes. `Phone` derives its screen cavity from `PHONE_ASPECT`
   (`780 / 1688`) so the image is never stretched, squashed or cropped.

If a future capture has a **different** aspect, update `PHONE_ASPECT` in
[`src/components/Phone.tsx`](src/components/Phone.tsx) — do not force the old
ratio onto a new image, and never set an explicit width *and* height on an `<Img>`.

Use `<Img>` from `remotion`, not a plain `<img>`: the plain tag can render before
the image decodes and produce blank frames. Screenshots live in `public/` and are
loaded with `staticFile()` — never `import`ed from `src/`.

## Adding the voiceover

1. Record [`script.md`](script.md) to `public/vo.mp3`.
2. Either flip `hasVO` to `true` in `defaultProps` in
   [`src/Root.tsx`](src/Root.tsx), or render with `--props='{"hasVO":true}'`.

With `hasVO: false` (the default) the film renders identically, minus the audio
track — so a clean checkout never fails on a missing asset.

## Determinism

Every scene is a pure function of `useCurrentFrame()`. No `useState`, no
`useEffect` timers, no `Date.now()`, no `Math.random()` at render time — all of
which break Remotion's frame-independent rendering and cause flicker across
parallel render threads. Randomness comes from `random(seed)` from `remotion`
(see [`src/dots.ts`](src/dots.ts)).

Scenes 2 and 3 share their cluster geometry from `dots.ts` because the dots must
not jump across that cut — the spatial continuity is the whole point of the beat.

## Fact discipline

Everything stated in the film appears in the pitch deck and is true: 32
simultaneous players, 7 host-gated rounds, a 2–3 hour runtime, 1 host, 0
professional actors, 0 app-store installs, no built set, 34 clue codes (10
accusation / 10 motive / 7 evidence / 6 revelation / 1 confession), 6 unlockable
case files, 10 characters under suspicion, 1 murderer.

**The film contains no revenue, pricing, ticket, attendance, customer,
testimonial, quote, rating, funding or growth claim, and none may be added.**

Specific choices made to keep it honest:

- The deck's cover line *"I spoke to more people in two hours…"* is an
  illustrative line, not an attributed testimonial. It is **omitted entirely**
  rather than rendered with or without a name.
- Scene 13 marks exactly one genre `SHIPPED` (filled red tag) and five `ROADMAP`
  (outlined tags, dimmed titles), captioned *"One story shipped. Five mapped,
  none built."* No frame can be screenshotted to imply five shipped genres.
- Scene 9's suspects are **redacted bars**, not names — the cast is fictional and
  unpublished. The tallies sum to exactly 32, the number of players who exist, and
  no intermediate total exceeds it.
- The deck's two `slide-archived` case-study slides are ignored, as intended.

## Verification performed

- Both cuts render start to finish: **3900/3900 frames, no drops.**
- Per-frame luminance analysis of both outputs found **exactly two near-black
  runs** — frames 2872–2879 and 3892–3899 — both intentional hard cuts, and
  **zero** unexpectedly dim frames. Every scene cut lands on a lit frame.
- All fourteen scenes reviewed as stills in **both** orientations.
- The `SECRET` redaction was pixel-verified: fully opaque at frame 220 (363 red
  pixels, 0 ink pixels) and fully open at frame 270.
- All nine screenshots confirmed 780×1688 before use.
