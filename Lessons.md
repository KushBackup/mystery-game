# Lessons.md — Self-Improvement Log

> **Read this at the start of every session** alongside [Claude.md](Claude.md) and [memory.md](memory.md).
>
> Purpose: a running log of mistakes, corrections, and non-obvious lessons. Whenever the user corrects me, or I do something I shouldn't have, I append a new entry here. The point is to **not make the same mistake twice**.

---

## How to add an entry

Use the template below. Keep it short and concrete — one paragraph max per section.

```
## YYYY-MM-DD — Short title

**What happened:** (1-2 sentences describing the action and outcome)

**Why it was wrong:** (the root cause — assumption, missed context, wrong tool)

**What to do instead:** (the corrected behavior, applicable to future situations)
```

When the same lesson recurs, **edit the existing entry** rather than adding a duplicate — strengthen the wording so future-me cannot miss it.

---

## Entries

### 2026-05-07 — Don't assume Unity from the folder name

**What happened:** On first encountering the project at `d:\Unity Projects\mystery-game`, the folder name and recent commit "theme change" suggested a Unity game project. I almost started exploring as if Unity tooling, Assets/, and C# scripts would exist.

**Why it was wrong:** The folder name was a historical artifact, not an indicator of the tech stack. The actual project is a **React 19 + Vite + Firebase PWA** — completely unrelated to Unity. Acting on the wrong premise would have wasted an entire exploration cycle.

**What to do instead:** Always check `package.json` (or equivalent manifest) before assuming a tech stack. Folder names lie; manifests don't. For this project specifically: it is a React PWA — see [Claude.md](Claude.md) for the full primer.

---

### 2026-08-01 — The deployed bundle is the source of truth for "what players see", not `src/`

**What happened:** Host reported being stuck on the murderer-reveal screen. I read [src/App.jsx](src/App.jsx), saw the `!isHost` guard was already correct, and nearly concluded there was no bug and the user must be mis-logging-in.

**Why it was wrong:** `src/` was not what was running. Inspecting the `gh-pages` bundle showed it contained `localStorage` session restore (`mg.currentUser`) that exists in no commit — that seeds `currentUser` on boot, so the reveal overlay (checked *before* the login gate) rendered immediately and permanently blocked access to CharacterSelect. The guard was fine; the render *order* plus a feature missing from `src/` was the bug.

**What to do instead:** When a live-site symptom contradicts the source, inspect the deployed artifact before doubting the report: `git show gh-pages:assets/<bundle>.js` and search it. Also: early-return terminal screens must always sit **after** the login gate, so no game state can trap a device with no route back to login.

---

### 2026-08-01 — In Remotion, a style spread can silently cancel the animation next to it

**What happened:** Building the explainer film in [video/](video/), I twice wrote an element that both set a resting `opacity` (or an entrance) *and* spread an animation helper into the same `style` object. Because `enter()` / `exitUp()` return `{opacity, translate}`, the later spread won and the earlier value vanished. In `S10Reveal` a resting `opacity: 0.72` was discarded; in `S14Close` spreading an exit alongside an entrance cancelled the entrance outright, so elements that should have animated in just sat there from frame 0.

**Why it was wrong:** These are silent. Nothing throws, no frame is blank, the render succeeds — the motion is just quietly absent, which is exactly the kind of defect that survives a casual scrub. I assumed "spread last so it wins" without noticing the two objects overlapped on the keys that carry the animation.

**What to do instead:** Run `npm run lint` (which is `eslint && tsc`) in `video/` before every render — TypeScript flags this as `TS2783: 'opacity' is specified more than once`, and it caught both. When a resting value must survive, multiply rather than overwrite (`opacity: e.opacity * 0.72`). When a whole group needs to exit, wrap it in **one** stripping layer so the transforms compose instead of overwriting. Also: don't verify motion from a single still — render the frames on both sides of the animation and compare.

---

### 2026-08-01 — Verify a rendered frame by sampling pixels, not by eyeballing a thumbnail

**What happened:** Reviewing a 0.5-scale still of scene 5, the bone paper card looked dark olive with pale text, and I concluded the `background: C.bone` was not applying. I was about to go hunting for a z-index or opacity bug. Sampling the actual pixel showed `(237, 231, 218)` — exactly `#EDE7DA`. Nothing was wrong; the downscaled thumbnail was misleading me.

**Why it was wrong:** Downscaled dark-palette stills compress tonal differences badly, and this deck's palette is almost entirely near-black. Trusting the thumbnail would have cost a debugging cycle on working code.

**What to do instead:** For anything colour- or threshold-critical, render at `--scale=1` and sample the pixel. A tiny pure-Python PNG reader (parse IHDR, `zlib.decompress` the IDAT, undo the per-row filters) is enough and needs no dependencies. The same technique verified the redaction bar was fully closed at frame 220 (363 red pixels, 0 ink) and fully open at frame 270 — a claim no thumbnail could support. Note that Remotion's bundled ffmpeg is a **minimal build with no `signalstats` or `blackdetect` filter**, so per-frame analysis means dumping frames via the `image2` muxer and measuring them yourself.

---

### 2026-08-02 — `gh-pages` had shipped features that were never committed to `main`

**What happened:** Asked to compare `main` against `gh-pages`, I found the branches share no common ancestor at all — `git merge-base main gh-pages` fails, because `gh-pages -d dist` creates an orphan branch of pure build output (11 minified files, no source). More importantly, four deploys on 2026-05-08 (13:34, 14:06, 15:26, 15:32) had **no corresponding commit on `main`**, whose last source commit that day was 14:35. Diffing the deployed bundle's string table against a fresh build of `main` surfaced three features that existed only as compiled code: a `forceRefreshAt` host force-sync, a `HOST_SCRIPT` run sheet, and Firestore IndexedDB offline persistence. `git grep` across all 29 commits of `main` confirmed `forceRefreshAt` and `HOST_SCRIPT` had *never* been committed.

**Why it was wrong:** The instinct on "merge these two branches" is to reach for `git merge`. Here that would have dumped `assets/index-*.js` and `sw.js` into the repo root and recovered nothing usable. Worse, without the string-level diff the three features would have been silently lost — the source looked complete and built cleanly.

**What to do instead:** Treat a deploy branch as an artifact, never a merge source. To find divergence, build the current source and diff *string tables*, not bytes: extract quoted literals from both bundles with `grep -oE '"[^"\\]{N,}"'`, `sort -u`, and `comm`. Check dependency versions in both bundles first (both were React 19.2.6 / Firebase 11.10.0 here) — otherwise a size delta is unattributable. Two traps worth remembering: a sentence-level filter produced **false positives** (three empty-state strings flagged as "missing" were present in both — always confirm a specific hit with `grep -c` on both bundles before reporting it), and the *timestamps* of deploys versus commits are the cheapest signal that uncommitted work exists at all.

---

### 2026-08-02 — A recovered feature can carry a bug that its own UI text denies

**What happened:** Porting the force-sync button back from the deployed bundle, its confirm dialog read *"Players stay logged in"* and its caption *"Logins persist — no one gets kicked out."* Both were false. `grep -rn "localStorage" src/` returned nothing, and neither bundle contained a single `localStorage.setItem` — `currentUser` was plain React state. Pressing that button at the live event would have dumped all 32 players onto the login screen to re-enter printed codes mid-game.

**Why it was wrong:** I nearly copied the caption across verbatim on the assumption that shipped code matching shipped copy was self-consistent. I even wrote a source comment asserting "currentUser lives in localStorage" before checking. Recovered code carries no guarantee it ever worked — it only proves it once *built*.

**What to do instead:** When restoring code from an artifact, verify every claim its UI makes against the source, and treat user-facing copy as an assertion to test rather than documentation to trust. Here the fix was to make the claim true: persist `{currentUser, isHost}` to `localStorage` under `astral.session`, seed both `useState` calls from it, clear it on logout, and wrap all access in `try/catch` for private-mode Safari. Also note `react-hooks/set-state-in-effect` rejects the obvious `useEffect(() => setTab(round), [round])` sync — use React's render-phase adjustment pattern (compare a `seenRound` state, reset the override during render) instead.

---

### 2026-08-02 — Unlayered CSS silently outranks every Tailwind utility

**What happened:** Applying the Evidence Room system, I built the `.er-*` component vocabulary in [src/App.css](src/App.css) and imported it from [src/main.jsx](src/main.jsx) after `index.css`, reasoning that "later import wins". It does — far too well. Unlayered CSS beats *every* rule inside a cascade layer regardless of specificity, and all Tailwind v4 utilities live in `@layer utilities`. So `.er-title { font-size: 32px }` silently overrode `text-[28px]` at six call sites, and `er-card p-0` on the host run sheet kept its 16px padding. Nothing errored; the build was clean; the pages just quietly ignored half my sizing.

**Why it was wrong:** I reasoned about source order and forgot that cascade layers sit *above* specificity and source order in the cascade. Two related traps in the same file: `.er-bone > * { position: relative }` would have killed every absolutely-positioned child (coffee stains, badges, tape), and `.er-rotL { transform: rotate(...) }` was being wiped out by `.er-touch:active { transform: scale(.98) }` on every tap, since `transform` is one property, not a list.

**What to do instead:** Import a component-class file into the layer it belongs to — `@import "./App.css" layer(components);` from `index.css`, never a bare JS import — and verify by reading the built CSS, not by assuming: `grep '@layer' dist/assets/*.css` shows the declared order, and the block a class lands in tells you who wins. For composable transforms use the independent `rotate`/`scale`/`translate` properties. For a background layer inside a card use `isolation: isolate` on the parent plus `z-index: -1` on the pseudo-element, rather than forcing `position: relative` onto all children.

---

### 2026-08-02 — Verify a UI restyle by driving the real app, not by reading the diff

**What happened:** After restyling all 20 components, lint and build were clean and every token compiled into the CSS. Two defects were still invisible from the source: the Evidence empty state rendered its three "sealed" placeholders as full-width wrapped blocks, producing three solid slabs of red — the exact thing [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §2.2 forbids — and the coffee-stain doodle sat across the character's name on the Identity card.

**Why it was wrong:** Both are emergent layout facts. The redaction component was correct, the strings were just long enough to wrap; nothing in the JSX looks wrong. A green build proves the CSS exists, not that it looks right.

**Recurrence — 2026-08-03, building the per-screen onboarding notes.** Same class of defect, caught the same way: the note's mono label `WHAT THIS SCREEN IS` wrapped to two lines at 390px, costing a line of height on all nine surfaces. Nothing in the JSX hints at it — 11px mono at `0.24em` tracking is just wider than it looks (budget ~9px per character for any label sharing a row). Driving the app also cheaply proved the *absence* case: temporarily setting `BRIEF_HIDDEN_FROM_ROUND` to 0 and re-running the capture confirmed all nine surfaces returned to their exact prior layout, which reading the gate could not.

**What to do instead:** Drive the actual app and look at it. Chrome is already on this machine; `--headless=new --remote-debugging-port` plus a ~120-line Node script (Node 24 has a global `WebSocket`, so CDP needs no dependencies) can set `Emulation.setDeviceMetricsOverride` to 390×844, seed `localStorage['astral.session']` to skip the login gate, click through every screen and capture each one. Two things that matter when doing this against this project: **block `*firestore.googleapis.com*` via `Network.setBlockedURLs`** so a screenshot run can never write to the live game, and **call `Storage.clearDataForOrigin` first** — Firestore's IndexedDB cache persists between runs and will replay real game state (it did: the app booted straight into the murderer-reveal overlay). Also note `--window-size` on plain headless Chrome does not give you a matching layout viewport; use device metrics override instead of trusting a `--screenshot` at phone dimensions.

---

### 2026-08-04 — A decorative overflow is invisible in a screenshot and obvious on a phone

**What happened:** Polishing every screen, I captured all fourteen at 390×844 and they looked correct. They were not. Measuring `documentElement.scrollWidth - clientWidth` showed **30px of horizontal overflow on every in-view screen** — the app's atmospheric lamp (`.er-lamp`) is a 640px radial wash anchored at `left: -220px`, so it extended to 420px in a 390px viewport. `GridMenu` and `CharacterSelect` happened to clip it; `App.jsx`'s root never did. On a phone that means every screen can be dragged sideways into 30px of dead space.

**Why it was wrong:** A screenshot is taken at the viewport width, so overflow is exactly the thing it cannot show — the offending pixels are outside the frame. And the element is a `pointer-events: none` gradient at 8–10% opacity, so even scrolled into view there is almost nothing to see. Only the number reveals it. I would have shipped it.

**What to do instead:** Assert on the measurement, not the image: `scrollWidth - clientWidth === 0` on every screen, as a line in the capture run. To locate the culprit, walk every element and report any whose `getBoundingClientRect()` breaches the viewport — one probe named it in a single pass, which beats bisecting CSS. Fix with **`overflow-x: clip`, not `hidden`**: `hidden` makes the element a scroll container and takes `position: sticky` descendants with it, which would have broken the chrome rail. Same trap applies to any full-bleed decorative layer.

---

### 2026-08-04 — Verify an animation with `getComputedStyle`, not with a still or a pixel count

**What happened:** I needed to prove a staggered redaction wipe actually ran — started covered, staggered across four bars, and finished fully open, including under `prefers-reduced-motion`. The established technique here was to render at scale 1 and sample pixels (2026-08-01), which meant decoding PNGs.

**Why the better tool existed all along:** `getComputedStyle` returns the *resolved animated value* mid-animation. Reading `transform` on an animating element gives `matrix(a, …)` whose `a` **is** the current `scaleX` — an exact, unitless reading of a wipe's progress, with no image decoding and no thresholding. Sampling it at t = 0/120/260/420/700/1200ms produced `[1,1,1,1] → [0.23,0.74,1,1] → [0.03,0.10,0.31,0.97] → … → [0,0,0,0]`, which proves coverage, stagger, and completion in one trace. It reads pseudo-elements too — `getComputedStyle(el, '::after')` — which is the only way to check the round rail's fill, since that lives entirely in `::after`.

**What to do instead:** For anything that *moves*, sample computed styles over time; save pixel sampling for things that are a *colour* (which is what the 2026-08-01 lesson was actually about). Two more things this made cheap: driving the host panel's `+` button advances the round through **local optimistic state**, so round-advance motion is testable with Firestore still blocked; and clicking it six times in 70ms proved the count-up resumes from the value on screen rather than the stale previous target — it went `00→01→02→03→04→05→06` with no backwards step and no overshoot, which is the bug a `from`-ref that isn't updated per frame would have produced.

---

### 2026-08-05 — A swipe handler can be silently outranked by the browser's back gesture

**What happened:** Building the swipe-navigated Round 0 briefing, forward swipes worked and backward swipes appeared to *crash the app* — the screen went to bare ink and every subsequent probe returned nothing. I started looking for an exception in my touch handler. There was none: `document.getElementById('root')` was **null**, and no error had been logged. A rightward swipe starting near the left edge is Chrome's history-back gesture, so the whole document had been replaced. My handler never ran.

**Why it was wrong:** I assumed a gesture that reaches a DOM element is mine to interpret. It isn't — the browser's own navigation gestures are resolved before any handler, and the failure looks exactly like a React crash from the outside. `body { overscroll-behavior: contain }` was *not* enough, because the briefing is a fixed, non-scrolling layer, so there is no scroll container to contain.

**What to do instead:** Any screen that reads horizontal gestures sets `touch-action: none` on the surface itself. Verify the way this was diagnosed, too — `#root` presence and `document.body.innerText` in the probe are what separated "the app crashed" from "the app is gone", and only the second one points at the browser. A related trap in the same harness: a **cold** Chrome profile boots this app ~2s slower than a warm one, so a fixed `sleep` before a click silently clicks nothing. Poll for the control instead of sleeping.

---

### 2026-08-05 — Typed text reflows the page underneath it

**What happened:** The briefing's slides type character by character. Rendering just the revealed slice means every word that wraps adds a line box, so the block grows line by line and pushes everything below it down — mid-sentence, while the player is reading. Nothing about the code looks wrong, and a still frame cannot show it.

**Why it was wrong:** I was thinking about the text as a string, not as a box. The fix is the same one [`RedactedLines`](src/components/ui/RedactedLines.jsx) already uses for a different reason: render the **full** string in flow but `visibility: hidden` so it reserves the final height, then lay the revealed slice over it absolutely. The real copy sets the box; the animated layer rides on top.

**What to do instead:** For anything that reveals text progressively, reserve the finished height first. And prove it by measuring, not looking: `getBoundingClientRect().top` of the *last* line at 20% typed and at 100% must be the same number (it was 450px both times). Sample after the container's entrance animation has finished, or the 1px of remaining `translateY` reads as a false positive — which it did on the first run.

---

### 2026-08-05 — "Merge two screens" is a layout problem, and only measurement tells you how bad

**What happened:** Asked to merge Archives into Evidence, I did the obvious thing — appended the case-file region below the clue board, separated by a hairline and a mono label. It looked right in the browser at Round 0, where the board is empty. Then I drove the host panel to Round 4 with every clue revealed and every file released and measured it: the case files began at **24,054px — 28.5 screens down**. Per-card heights explained it (31 clue cards, 23,392px total; the six documents another 4,800px). Neither region can sit under the other.

**Why it was wrong:** I verified against the state I happened to be in. Round 0 is the *emptiest* state the app ever has, and it is the default a blocked-Firestore harness boots into — so the one screen I was changing was the one screen I could not see the problem on. A hairline divider is the right answer for two short regions and the wrong answer for two long ones, and nothing about the JSX distinguishes those cases.

**What to do instead:** Before merging or stacking two lists, measure the **fully populated** height of each, not the current one. `document.querySelectorAll('article')` + `getBoundingClientRect().height` per card, and the absolute offset of the second region, is a 10-line probe. Here it forced a better design — two paper tabs ([DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §6.11) — plus two things the tabs then made necessary: scroll to top on switch, and force the board back when a code is decoded from the archive. Also worth knowing: `Numeral`/host-panel handlers read a **stale prop**, so clicking "release all three file batches" in one tick makes only the last win — drive host controls one at a time with a wait between, or the populated state you *think* you built is wrong (my first run reported 4 files and 4 clues instead of 6 and 31).

---

### 2026-08-05 — To exercise an offline-blocked code path, stub the sync layer and rebuild — don't reach for the live DB

**What happened:** I needed to prove that entering a clue code while the Case files tab is open snaps back to the clue board. That path is unreachable with Firestore blocked: `addUnlockedClue`'s promise never resolves offline, `unlockedClues` only ever arrives from `subscribeToPlayerData`, and `currentRound` stays 0 so every code is refused as locked. The tempting shortcut was to unblock the network — against a live database that [memory.md](memory.md) records as sitting in its terminal state.

**Why the shortcut was wrong:** Reads are safe; the decoder *writes*. One code entry would have added a clue to a real player document in a live game.

**What to do instead:** Shadow the three sync entry points (`subscribeToGameState`, `subscribeToPlayerData`, `addUnlockedClue`) with local in-memory versions in [src/firebase/config.js](src/firebase/config.js), build, verify, then `git checkout --` the file and rebuild. Rename the real implementations to `_realX` rather than deleting them so the diff is trivially reversible, and keep a `_unusedRealRefs` export so lint stays quiet. Emitting a synthetic `{ currentRound: 3, unlockedFiles: [...] }` also hands you the populated state for free, with the network still blocked. Two harness details that cost time: `innerText` **applies `text-transform`**, so a case-sensitive `includes('The Murder Mystery Experience')` never matches an uppercased `.er-title` — always match case-insensitively; and poll for the control rather than sleeping, because a cold Chrome profile boots this app ~2s slower.

---

### 2026-08-05 — When a view needs its own sub-navigation, the state belongs to the router, not the view

**What happened:** Turning Evidence into a grid of five stacks, I put the "which stack is open" state inside [IntelView.jsx](src/components/views/IntelView.jsx) and rendered the stack's name as an `<h2>` under the content. Driving it showed the frame reading **`EVIDENCE BOARD` / `EVIDENCE` / `MOTIVES`** — three headings, two of them saying the same word. [App.jsx](src/App.jsx) draws the kicker and title for every screen from `SCREEN_GUIDE`, so a view that adds its own heading is always adding a *third* one.

**Why it was wrong:** I treated the drill-down as content when it is navigation. Once you can be "inside" part of a screen, that location has to reach whatever owns the screen frame, or the frame describes the wrong place. Lifting `evidenceStack` into App.jsx fixed the heading, and three other things fell out for free: the existing scroll-to-top effect just needed `evidenceStack` in its deps, the decode handler could open the right stack directly (an event, not a render-phase adjustment), and leaving the screen resets it.

**What to do instead:** If a sub-view changes what the screen *is*, put its state next to the routing and give it kicker/title entries alongside the real screens ([screenGuide.js](src/data/screenGuide.js) `EVIDENCE_STACKS`). One trap follows immediately: **a sub-view's kicker must not repeat the parent screen's name.** "Evidence" is both the screen and one of its stacks, so the kicker had to become the stack's descriptor (`Hard findings`) rather than the screen's (`Evidence Board`). Reusing that same string as the hub tile's sub-label is a bonus — the tile and the screen it opens then cannot drift apart.

---

### 2026-08-05 — Splitting one list into four multiplies its empty state

**What happened:** The Evidence empty state — "Nothing decoded yet" over three ragged redaction bars — was signed off when there was one of it. Grouping clues into four stacks meant four copies, each on a screen with nothing else on it, and at 66–84% width they read as a panel of red rather than a redacted page. That is what [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §2.2 forbids, and it is the same defect as the 2026-08-02 entry above, arrived at from a new direction: not by making a bar wider, but by removing everything that used to balance it.

**Why it was wrong:** I carried the component across unchanged because it was already correct. Correct at one instance on a full screen is not correct at four instances on empty ones — the accent's share of the page is what §2.2 actually constrains, and duplication changes that share without touching a line of the component.

**What to do instead:** When a shared visual moves from one context to several, re-check the constraints that are about *proportion* rather than about the component: red coverage, motion frequency, how often an entrance replays. Two ragged marks at ≤71% was enough here. The motion one bit in the same change — a hub the player backs out to constantly replays its staggered landing on every return, so it needs GridMenu's module-scope once-per-session flag, not a fresh `er-land` each mount.

---

### 2026-08-05 — A rewrite is the moment dead branches become visible

**What happened:** Rewriting IntelView I carried over a "your accusation is sealed, opens Round 01" placeholder gated on `myAccusation && currentRound < 1`. Probing the Round 0 hub, it never appeared. It cannot: App.jsx computes `myAccusation` as `if (!currentUser || currentRound < 1) return null`, so the two halves of that condition are mutually exclusive. It had never rendered, in any round, since it was written.

**Why it was wrong:** I moved code without evaluating its guard against the value the parent actually passes. A condition that reads plausibly inside one file can be impossible once you look one level up — and a rewrite is exactly when it is cheap to check, because you are reading every line anyway.

**What to do instead:** When a branch depends on a prop, resolve the prop's domain at the call site before keeping the branch. Here the honest fix was deletion: the new `Opens R01` stamp on the Accusations tile says the same thing, for the whole stack rather than one card. Probing an empty state by asserting on `document.body.innerText` at each round is what surfaced it — and note that a probe can lie in the other direction too: I briefly "found" a missing screen note that was rendering perfectly well, because my summary script read a field I had stripped out of the JSON I piped to it. Check the artifact on disk before believing an absence.

---

### 2026-08-05 — Swapping a font is governed by advance width, not x-height

**What happened:** Asked to replace Caveat with the typewriter face, I assumed Caveat had the small x-height (its own source comment in [App.css](src/App.css) said so: *"Caveat's x-height is small, so 15px would read as fine print"*) and that Special Elite would therefore need to come *down* in size. Measuring both faces on a canvas at 100px said the opposite on that axis — Caveat's x-height is **54** to Special Elite's **43** — so matching x-heights would have pushed 21px up to 26px. That would have been much worse: the real constraint is that Special Elite's **advance width is 24% greater** (60.0 vs 48.5 per character). At equal size it added a line to every long note; at x-height parity the longest quirk went from 8 lines to 13.

**Why it was wrong:** I reached for the metric that describes how big a face *looks* when the thing that actually breaks a layout is how much horizontal room it *takes*. In a fixed 390px column, wrapping is the whole game. Both numbers were also cheap to get and I nearly skipped getting either.

**What to do instead:** Before swapping a face, measure both on a canvas (`ctx.measureText(s).width / s.length` for advance, `actualBoundingBoxAscent` of `'x'` for x-height) and then **sweep candidate sizes against the real strings at the real container widths**, picking the largest size that doesn't add a line. That sweep is what set the whole scale ([DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §3.3) and it found the non-obvious case: the screen brief needed 16px where everything else took 17px, because three of the nine briefs gain a fourth line at 17. Two traps worth remembering. **Judge by total height, not line count** — the Identity secret gains a line at 18px yet is 51px *shorter*, because the line-height came down with the size; a strict no-new-lines rule would have forced it to 16px for nothing. And **my probe's line-height was wrong**: Tailwind preflight sets `line-height: 1.5` on `html`, so notes with no explicit leading class inherit 1.5, not the 1.2 I assumed — line *counts* were unaffected, but never trust a probe's assumed inherited value over `getComputedStyle` on the real element.

---

### 2026-08-05 — A capture loop that `break`s on "no button yet" silently captures nothing

**What happened:** Driving the app to check the new note sizes, my "get past the intro" loop was `for (…) { const b = findButton(/skip|begin|…/); if (!b) break; b.click(); }`. The splash screen is a 1.4s timer with **no buttons at all**, so on iteration 0 `b` was undefined and the loop broke immediately. Every subsequent step then failed against a screen I was never on: eight of ten screens reported `MISSING`, and the two that "worked" were the splash. An earlier run had passed only because it happened to `waitFor` the first control instead of testing for it.

**Why it was wrong:** `if (!absent) break` conflates *not there yet* with *not there* — the two states that a boot sequence spends all its time moving between. It fails in the worst direction, too: the run completes, writes a report, and exits 0, so the output looks like evidence.

**What to do instead:** Poll for the control you need (`waitFor`, 20s), then assert you arrived somewhere identifiable before continuing — mine now returns the literal string `AT_HUB` after finding a known tile, so a boot failure is visible in the report rather than inferred from downstream damage. Related traps from the same session: the tile labels are **`Comms` and `Suspects`**, not Chat and Dossier, so text-matching on the screen name silently misses (and Timeline is not a tile at all); the Evidence hub tile and one of its five stacks are **both called "Evidence"**, so target the tile by its sub-label `Clues & Files` instead; the murderer-reveal overlay renders only for players who are **not** the murderer, so seeding the session as `char_alam` falls straight through to the outro; and a PowerShell `>` redirect opens its target *before* node runs, so redirecting into a directory the script is about to create fails — `New-Item -Force` the directory first.

---

<!-- Add new lessons above this line, newest first or oldest first — keep one consistent order. Current order: oldest first. -->
