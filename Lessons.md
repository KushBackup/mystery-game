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

### 2026-08-06 — A story rewrite is more than one data file

**What happened:** Replacing the main case data with a new 51-player story did not finish the job. Several secondary surfaces were still anchored to the retired case: the Story screen imported a non-existent `caseData` module, the Timeline view still hardcoded the Penthouse/Nikhil beats, the guest modal labeled every non-victim as a suspect, and the repo primers still described the old 32-player office case.

**Why it was wrong:** A data-driven app still grows local constants and copy over time. Rewriting only `gameData.js` fixes the core content but leaves the product incoherent if story labels, onboarding copy, and docs continue to point at the previous canon.

**What to do instead:** After any major narrative rewrite, run three sweeps before calling it done: 1) search the UI for old proper nouns and counts, 2) validate role-driven surfaces like reveal screens and profile labels, and 3) update the session-start docs (`Claude.md`, `memory.md`, `PROJECT_CONTEXT.md`, `STORY.md`, `TECHNICAL_DOCUMENTATION.md`, `CLUE_CODES.md`) in the same turn.

---

### 2026-08-06 — A second copy of an ID list is a rename waiting to break in silence

**What happened:** The host released Round 3 and Round 4 case files and no player saw them. `unlockFilesForRound` in [config.js](src/firebase/config.js) held its own hardcoded round-to-file map — `3: ['f_toxreport','f_funding']`, `4: ['f_medical','f_insurance','f_sebi']` — and the Velvet Ember rewrite (the entry above) had renamed those files to `f_autopsy`/`f_security` and `f_audit`/`f_inventory`/`f_tax`. The host wrote IDs that no longer existed to Firestore; the client filters `CASE_FILES` by those IDs and matched nothing. Round 0 kept working purely because `f_incident` never got renamed, which is what made the failure look round-specific rather than structural.

**Why it was wrong:** It was the *third* copy of the same mapping, and the two live copies disagreed. [HostPanel.jsx](src/components/HostPanel.jsx) derived its unlock list from `CASE_FILES` (correct) but checked "Released" against a hardcoded sentinel ID (stale, `f_toxreport`) — so even after fixing the write, the button would never have latched. The bug was invisible from the host's seat: local `setUnlockedFiles` painted the correct state for one frame before the Firestore snapshot overwrote it with the dead IDs. Nothing threw, nothing logged, lint and build were clean. A hardcoded ID list has no referent that a rename can break loudly.

**What to do instead:** When data lives in `gameData.js`, every consumer derives from it — `CASE_FILES.filter(f => f.roundReq === n)` — and no one keeps a parallel list. Derive the *done* check from the same list too, so the control cannot claim a state the room isn't in. Sentinel-of-one is a bad completeness test regardless: use `ids.every(id => unlocked.includes(id))`. And when a symptom is "works for round 0, not 3 and 4", suspect a stale copy of a mapping before suspecting the sync layer — the working case is usually the one whose name happened not to change. Grep the old IDs repo-wide afterwards to confirm no fourth copy survives.

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

### 2026-08-06 — A centred flex child that grows will be clipped at the top, where the content is

**What happened:** Adding a "How it happened" control to the murderer reveal and the outro made both columns taller. Both were `fixed inset-0 flex flex-col items-center justify-center` with no scroll — and the reveal already carries five killer names. Once a `justify-content: center` child exceeds its container it overflows in *both* directions, and the overflow above the container is unreachable: there is no scroll position that reveals it. On a short phone the reveal would have lost the words "THE KILLERS ARE" and the mastermind's name, which is the entire screen.

**Why it was wrong:** I was thinking about whether the content *fitted*, not about what happens when it doesn't. Adding `overflow-y: auto` is not the fix on its own — a centred flex child still gets clipped at the start edge, which is the well-known flexbox centring trap. And this is invisible at the viewport I test at: the 390×844 capture showed `scrollHeight === clientHeight`, so the screen that proved it fine is the screen that could not show the failure.

**What to do instead:** Centre with `my-auto` on the child rather than `justify-center` on the parent, and add `overflow-y-auto` to the parent. Auto margins absorb the free space when there is any and collapse to zero when there is not, so the child starts at the top and scrolls instead of being cut. Any time a fixed, non-scrolling terminal screen gains content, convert it — and assert on `container.scrollHeight > container.clientHeight` as well as on the document's, since the clipping container is the fixed layer, not the document.

### 2026-08-07 — `Get-Content -Raw` / `Set-Content` is not a safe round-trip for source files, and `open(p,'wb')` truncates before it can fail

**What happened:** Two separate self-inflicted wounds inside five minutes, both while doing bulk copy edits.

First, I used PowerShell string replacement to update several lines in `hostReference.js` and `HelpView.jsx`. Windows PowerShell 5.1's `Get-Content` defaults to **ANSI (cp1252)** for a file with no BOM, so every UTF-8 character came back as mojibake — `·` → `Â·`, `’` → `â€™` — and `Set-Content -Encoding utf8` then wrote that corruption back, with a BOM, as if it were the truth. `npm run lint` and `npm run build` both passed: nothing here is a syntax error, it is just wrong text that would have shipped to the room.

Second, fixing it, I wrote `open(p,'wb').write(s.encode('cp1252'))`. Python opens and **truncates the file before evaluating the argument**, so when `.encode()` raised on an unmappable byte, `hostReference.js` was already zero bytes. I only noticed because `git diff --numstat` reported `0 474` — the verification greps before it printed nothing, and I nearly read that as "the strings just moved".

**Why it was wrong:** Both are the same mistake in different clothes — treating a destructive operation as if it were atomic. A read-modify-write through a lossy decoder loses data silently; a `wb` open followed by a computation that can throw loses the whole file silently. Neither failure surfaces in lint, build, or a spot-check of the lines you were actually editing.

**What to do instead:** Use the **Edit tool** for source-file text changes — it is exact, it fails loudly on a non-unique match, and it never touches the encoding. If a shell is genuinely required, read and write bytes explicitly (`[IO.File]::ReadAllText` / `WriteAllText` with an explicit `UTF8Encoding $false`, or Python with `encoding='utf-8'`), and compute the new content fully *before* opening the target for writing. After any bulk edit, verify with `grep -c 'Â\|â€'` and `git diff --numstat` — a suspiciously large deletion count is the only signal you get.

### 2026-08-07 — Two identifier namespaces that share one keyboard are one namespace

**What happened:** A story-consistency audit turned up that the ten Round 2 motive codes (`THIMBLE`, `ORACLE`, `FORGERY`, `HEMLOCK`, `AMBER`, …) were byte-identical to the ten prime suspects' login codes. Round 2's entire mechanic is *"solve a riddle, then shout your code across the room"* — so within minutes of Round 2 opening, all 51 players would have been handed the five killers' credentials. Log out, type `THIMBLE`, and `DashboardView` prints **Classified · Killer** and `TimelineView` adds "You are one of the killers." The case was solvable in Round 2 with zero deduction, four rounds of content unplayed.

**Why it was wrong:** The codes lived in two different fields (`character.code` and `clue.code`), were consumed by two different handlers (`validateLoginCode` and `handleCodeSubmit`), and were documented in two different tables of `CLUE_CODES.md` — which is exactly why nobody saw it. `handleCodeSubmit` even resolves clue-before-character, so the decoder behaved correctly; the leak was entirely at the *other* input. Reusing the group name for both was the tempting move because it reads as tidy, and the reuse was visible on adjacent lines of the same file for however long it sat there. Two namespaces reachable from the same text box are one namespace, whatever the schema says.

**What to do instead:** Before adding an identifier a *player* can type, enumerate every input in the app that accepts free text and check the new value against all of them — `node` one-liner over `LOGIN_CODE_MAP` and `CLUE_DB` takes ten seconds. Codes that get read aloud must also be non-descriptive (`EVIDENCE_TOX` tells anyone within earshot what you are holding) and non-guessable (`ACCUSE_SNEHA` is derivable from the roster). The invariant is now asserted dev-only at the bottom of [gameData.js](src/data/gameData.js); if you add a deck, extend that check rather than trusting the review.

### 2026-08-07 — A witness timeline is a claim about the world, so two of them can contradict each other

**What happened:** The same audit found six timing contradictions across the 51 character timelines and the answer key. Chryselle saw Sneha leave the booth *carrying* the Monday folder while the burner thread and `CASE_SOLUTION` both require it to stay upstairs — and Sunali then asked, a minute later, whether it was still up there. Kiyaah collected the poisoned atomizer at 9:58 from a prep pass that three witnesses put Roddy walking towards at 10:02. Swati saw the twin on the bar tray at 10:05, three minutes before the swap that put it there.

**Why it was wrong:** Each line was written while thinking about one character. Read as a character sheet every one of them is fine; read as a single 51-source deposition they describe incompatible worlds — and the room *will* read them that way, because cross-referencing timelines is the game. The Chryselle error had also been copied into `hostReference.js`, `HOST_PRINT_PACK.md` and `HOST_QA_BRIEFING.md`, so the host would have confidently confirmed the contradiction.

**What to do instead:** After touching any `timeline` string, dump all 51 of them into one chronological list and read it top to bottom — a ~15-line Node script over `CHARACTERS`, and the conflicts are obvious in a way they never are in source order. Check the result against `CASE_TIMELINE` and the `sequence` array in `CASE_SOLUTION`, which are the two places the same night is told a second time. And grep the host docs for any witness line you changed: those quote the timelines verbatim rather than importing them.

### 2026-08-07 — The third namespace was the riddle deck, and "we checked" was written down as if it were true

**What happened:** A follow-up consistency pass found that three riddle answers were also codes: `echo` and `cloud` were Fabiola's and Mahi's login codes, and `compass` was Roddy's accusation code. Solve r001, log out, type ECHO, and you are a different guest. The dev-only assertion added after the `THIMBLE` incident only compared clue codes against login codes, so it saw nothing — and [CLUE_CODES.md](CLUE_CODES.md) stated flatly that codes had "no overlap with the 100 riddle answers", which was simply an untested claim sitting in a document.

**Why it was wrong:** The previous lesson said "two namespaces reachable from the same text box are one namespace" and I fixed exactly the two namespaces named in it. The riddle deck is a *third* set of words the app teaches a player and invites them to type, and it arrived after the assertion was written, so it was never in scope. The more useful failure, though, is the documentation: a prose sentence asserting an invariant reads identically whether or not anything enforces it. That sentence was the reason nobody looked again.

**What to do instead:** When an invariant is worth writing in a doc, the same commit adds the check — and when a new deck of player-facing words appears, extend the existing assertion instead of adding a fourth list. Two mechanical notes for this project: put the check behind `import.meta.env?.DEV` with a **dynamic** `import()` so the extra data is provably absent from production (verify with `grep -c` on `dist/assets/*.js`, which returned 0 for all three assertion strings and left the bundle at one chunk), and `.catch()` it — a data assertion must never be able to take a module down at a live event.

### 2026-08-07 — A uniform-looking shuffle is not a uniform distribution, and rotating by a hash is the same bug in a hat

**What happened:** `riddleQueueFor` sorted each player's reward queue by `seeded('riddle:' + id, clueId)`. Stable and per-player, exactly as documented — and badly lopsided in the one dimension that matters. Across the 51-person roster the *first* reward was `OBELISK` for 8 players and `LATTICE` — Oindrilla's motive, a killer's — for exactly 1. Since most players solve one or two riddles all evening, a conspirator's motive could plausibly never enter the room. My first fix, rotating each round-block by `Math.abs(seeded(...)) % length`, measured **worse**: 12 and 1.

**Why it was wrong:** I checked the properties I had named in the comment (stable, distinct) and never measured the property the feature actually depends on. Then I reached for rotation for the right reason and fed it the wrong number: `hash % 10` inherits whatever bias lives in the hash's low bits, so it is still a random draw, just a differently-shaped one. Uniformity comes from rotating by *consecutive integers*, which means the offset has to be an ordinal — the player's index in a stable shuffle of the roster — not a hash value.

**What to do instead:** For anything dealt across the room, assert on the histogram, not on distinctness: `min/max` of the first-reward counts is one line and it is the whole story (5/6 after the fix, with 51 distinct queues preserved). And when a distribution needs to be even, rank first and rotate by the rank; a modulo over a hash is not a shuffle.

### 2026-08-07 — Passive voice in an answer key is where an unanswered question hides

**What happened:** A story audit found that `CASE_SOLUTION` said "the reactivated staff QR opens the private bar and closes it again" and, in the next clause, that Parinitha saw Kiyaah swap the atomizers. It never said Kiyaah was the one holding the pass — and since Kiyaah had run that bar since 7:40 PM, the obvious room question ("why would she need a cloned QR at all?") had no answer anywhere, including in the host's objection sheet. The same pass named Anjul's apron sighting, which the host guide had filed under the frame-job lane, three lanes away from the QR it belongs to.

**Why it was wrong:** Every fact was present and the sentence was true, so nothing read as missing. Passive voice let the beat describe *what happened* without ever committing to *who did it*, and a reconstruction that declines to name an actor is exactly the gap a room full of people cross-referencing timelines will find. The answer existed (the pass is for the log, not for the door) but it existed only in my head.

**What to do instead:** Read the answer key for actors, not for events — every hidden beat should name the person, and any beat that cannot is either underspecified or is a question the host needs a scripted answer for. Same sweep applies to who a piece of evidence *implicates*: the annotated floor plan pointed at an innocent (Tanvi) and `CASE_SOLUTION.misdirection` cleared only Tara, leaving the one clue nobody could resolve. When a witness line moves, move its host-guide lane with it.

### 2026-08-07 — "Published" is a claim about a push, not about the site

**What happened:** Asked to deploy, I ran `npm run deploy`, watched lint and build come back clean, saw `gh-pages` print **Published**, confirmed the remote `gh-pages` head had moved, and reported the deploy done. It wasn't. The live site was still serving the **May 8** build: `index.html` pointed at `index-CbMrNco5.js` and the new `index-DVm1q3WG.js` returned 404 for over five minutes. Two independent things were hiding behind one success message. The commit I "confirmed" (`d8efc57`, 03:03) was an *earlier* deploy of the same working tree — identical source produces identical content hashes, so `gh-pages` had nothing to commit and printed "Published" for a no-op. And GitHub Pages had not built that branch for seven hours. An empty commit pushed to `gh-pages` triggered a build and the new assets were live in under a minute.

**Why it was wrong:** Every check I ran was upstream of the thing I was asserting. Lint, build, "Published", and the branch head all describe *my side of the wire*; none of them observe the served site. The matching content hash is what made the no-op invisible — a moved head looks like proof, and here it was seven hours stale. Worth naming as the general shape: this project's deploy is two hops (working tree → `gh-pages` branch → Pages CDN), and the tooling only reports on the first.

**What to do instead:** Verify a deploy by fetching the live URL and matching the asset hash against the local `dist/` output — `Invoke-WebRequest .../index.html` and compare the `assets/index-*.js` name to what `vite build` just printed. Check `sw.js` too: its precache manifest names the hashes, so a stale service worker is visible there and it is what installed PWAs will actually load. If the hash is stale while the branch is correct, Pages has not published — push an empty commit to `gh-pages` to trigger a build rather than rebuilding `dist`. Two notes for this repo: `gh-pages` printing "Published" is not evidence a commit was created, and because `npm run deploy` publishes the *working tree*, a green deploy can ship code that exists in no commit — check `git status` before deploying, not after.

### 2026-08-07 — Promoting a card out of its stack is still removing it from its stack

**What happened:** The Evidence hub pinned the two cards that are the player's own — the confession and their accusation — so neither sat behind a tap, and `cluesIn()` then explicitly filtered the accusation *out* of the Accusations stack so it couldn't appear twice. The user asked for it back: their accusation belongs in the Accusations screen, alongside where everyone else's will be revealed. A second, related ask in the same breath — the chrome-rail X on an open stack dropped straight to the board instead of stepping back to the Evidence hub, even though a stack is framed as a screen of its own.

**Why it was wrong:** "Don't show it twice" was the wrong invariant. The real one is "don't render the *same card* twice in the same list" — and I applied it across two different surfaces, where the duplication is the point. A player who opens Accusations and sees ten witness statements that are not theirs reads a hole, not a promotion, because a stack is where you go to find a thing of that kind. The close bug is the same mistake in navigation: I gave a stack the full screen frame (title, kicker, back link) but left it sharing the board's close handler, so it looked like a screen and exited like a section.

**What to do instead:** When a surface is promoted somewhere prominent, ask whether it should *also* stay where its kind lives, and dedupe at the list level (drop the found copy, add the owned one back at the head) rather than at the item level. And when something is framed as a screen, every affordance the frame implies has to follow — close steps back one level, and the `aria-label` names the real destination. Counts too: if a card is added outside the decoded set, the hub total has to be summed from the tiles or it will quietly disagree with the four numbers under it.

### 2026-08-07 — A role label is not a role briefing

**What happened:** The five killers learned they were killers from a tag reading `Classified · Killer` on their Identity screen, and from a Confidential Note that was written in exactly the same register as the other 46 guests' — a first-person quirk in quotation marks. The user's report was that killers did not clearly know they were killers. Nothing was broken: the tag rendered, the role was correct, the data was right.

**Why it was wrong:** I had made the information *present* and assumed that was the same as *received*. "Classified" is a word this design system uses everywhere to mean redacted, so the tag reads as a stamp on a file rather than an assignment to the person holding the phone — and the one place on the screen that looks like it was written *to* the player, the Confidential Note, was flavour text about kleptomania. A player with no other instruction has to infer their role from a two-word chip. That is a lot of weight on the smallest element on the card.

**What to do instead:** For anything the player must act on, put it in the surface that addresses them, in a sentence, in the first line — and check the voice matches: a killer's note now opens "You are one of the five people who killed Armaan Khanna" and says what their part in it was, which also means it must **not** be wrapped in the quotation marks a guest's secret gets, because it is a briefing and not a line of dialogue. Copy that grows carries presentation with it: the note roughly doubled in length, so `RedactedLines` needed seven marks instead of four, or the seal would have been four bars stranded above blank paper.

### 2026-08-07 — An element that clamps to the viewport edge stops pointing at its anchor, and a `justify-between` row pays for a new sibling out of the *other* column

**What happened:** Building the tooltip layer, two defects survived a clean lint and build and were only found by measuring the running app at 390px.

First, the caret. The panel is clamped to stay 12px inside the viewport, and the caret's x is clamped to stay 18px inside the *panel* — so the round tooltip on the board's masthead, whose mark sits at the far right of the content column, wanted its caret 287px into a 300px panel and got 282. Five pixels off the thing it points at. The two clamps fight by construction: the panel only shifts off-centre when the trigger is near a viewport edge, which is exactly when the trigger is near the panel's own edge, so the caret clamp has to be looser than the worst real anchor (12px, not 18).

Second, wrapping. Adding an 18px mark plus an 8px gap to `Guests on record` wrapped that label onto two lines — not because the row ran out of room in the abstract, but because the row is `flex justify-between` and flex shrank *both* columns. Every other stat row in the app has a numeral opposite it and had slack; this one has a sentence with `max-w-[16rem]`, so the 26px came out of the label. `shrink-0` on the label column fixed it.

**Why it was wrong:** Both are emergent facts about a specific viewport and a specific pair of neighbours. Nothing in the JSX or the CSS looks wrong, and both would read as "slightly off" to a player rather than as a bug worth reporting. The first is also the classic shape of two independently-correct constraints producing a wrong result together.

**What to do instead:** For anything anchored, assert on the *relationship* — `caretCentre - triggerCentre` within a pixel or two — at every real placement, not just that the thing is on screen. For wrapping, **count the client rects of the label's text node** (`Range.selectNodeContents(textNode).getClientRects().length`) rather than measuring row height: my first check used height and produced three false positives, because several of these rows also carry a 20px numeral and are legitimately taller than one line of 11px mono. Two more notes from the same session. A `position: fixed` panel must be **portalled to `document.body`** if it can ever render inside paper — `.er-rotL`/`.er-rotR` use the `rotate` property, which establishes a containing block for fixed descendants, so the panel would anchor to the card *and* inherit its tilt. And writing position into `style.left`/`style.top` from a layout effect is not a shortcut: calling `setState` there re-runs the effect, which measures again and sets a fresh object, forever.

### 2026-08-07 — A probe's fixture has to exist, and the app it drives may not guard against a fixture that doesn't

**What happened:** I seeded the harness session with `currentUser: 'char_alam'`, copied from an earlier Lessons entry. No such id is in the 51-guest roster, so `myCharacter` resolved to `undefined`. Four screens probed fine and then Comms threw `Cannot read properties of undefined (reading 'id')` and React unmounted the whole tree. From the outside that looked exactly like my new component crashing the app: `#root` was present with zero children, `document.body.innerText` was empty, and the next navigation failed with a blank screen.

**Why it was wrong:** I trusted an identifier from a document instead of the data. Worse, my first diagnostic instinct was to suspect the code I had just written, and the failure mode — a blank document that appears several screens after the real cause — actively supports that misreading. What actually separated the two was enabling `Runtime.exceptionThrown` on the CDP session: one line of output named the real error immediately, after two runs of guessing had named nothing.

**What to do instead:** Derive harness fixtures from the source (`grep -o "id: 'char_[a-z]*'"` over gameData.js), never from prose. And **turn on exception and console reporting before the first probe run**, not after the third — for this project that is `Runtime.enable` plus a listener for `Runtime.exceptionThrown` and `Runtime.consoleAPICalled`. Worth knowing separately: [`ChatView`](src/components/views/ChatView.jsx) is the one view with no `if (!myCharacter) return null` guard, so a bad or stale session id takes the app down there rather than rendering an empty screen.

### 2026-08-07 — `animationend` bubbles, so a second animation on a wrapper is retired by the child it wraps

**What happened:** Gating ASK to Round 2 meant the button now appears mid-game, so it needed a one-time attention cue. The button already spends its `animation` shorthand on `.er-land`, so the cue went on a wrapper `<span>` and the wrapper's `animationend` retires it — no duration duplicated in JS, which is what keeps the CSS the single source of the timing. Measured in Chromium, the wrapper receives **two** `animationend` events: `erLand` at 1054ms, from the button inside it, and `erSummon` at 4523ms, its own. Without an `event.target === event.currentTarget` guard the cue is retired at 1054ms — before its first hop, because the cue is delayed 1.05s precisely to let that landing finish.

**Why it was easy to miss:** The bug is invisible in the JSX and in the CSS. Both animations are correct, the handler is on the right element, and the only symptom is a cue that never plays — which reads as "the class isn't being applied" and sends you looking in the wrong file. It is also the exact case where a nested animation is *guaranteed*: the wrapper exists **because** the child is already animating.

**What to do instead:** Any `onAnimationEnd` on an element that has animated descendants needs the target guard (or an `animationName` check). More generally, when a component's timing is owned by CSS and read back through an event, verify the event, not the stylesheet: a headless page with the built CSS, the real class names and a `getComputedStyle` sample every few hundred ms proved the three knocks land at −14.7px/0.32 opacity, that it settles to `transform: none` and stops, and that under `prefers-reduced-motion` it fires once at 13ms having moved nothing.

### 2026-08-07 — A percentage height resolved against a `min-height` parent is indefinite, so `min-h-full` inside `min-h-full` silently does nothing

**What happened:** The reveal deck's cover and chapter-divider slides are meant to centre in the space left between the fixed header and footer. Each was `min-h-full flex flex-col justify-center` inside a scroller child that was itself `min-h-full`. The measurement pass reported the *wrapper* at 719px — the full available height — so the numbers looked right, and only the screenshot showed the truth: `THE PLAN` sat at the top of a screen-tall hole with the chapter numeral stranded 400px above it.

**Why it was wrong:** `min-height: 100%` on the child resolves against the parent's *height*, and the parent had `min-height` with `height: auto`. That is an indefinite containing height, so the child's percentage falls back to `auto` — the box collapses to its content and `justify-center` centres 450px of content inside 450px of box, which is a no-op. The parent still measures 719px, so any check that reads the wrapper's `scrollHeight` reports success. The fix is a definite relationship instead of a percentage: `flex flex-col` on the wrapper and `flex-1` on the slide, which makes the flex algorithm hand over the leftover space with no percentage involved.

**What to do instead:** When something must fill or centre in "whatever is left", reach for `flex-1` on a flex child, never a percentage min-height — and treat `min-h-full` inside `min-h-full` as a dead giveaway. Also worth the note on *how* it was caught: 22 slides passed a headless pass measuring overflow, settle-state, chrome position and control size, and none of those assertions could see a vertically mis-parked slide. A geometry check tells you nothing is broken; it cannot tell you the composition is wrong. Look at a few frames as well.

### 2026-08-07 — "The first one in the array" is a design decision, and a filter over a roster is not making it

**What happened:** Told the red murderer-reveal screen was important and had to come before the slideshow, I opened it to confirm it still worked. It did — and it was announcing **Oindrilla Chatterjee** as the mastermind. Canon says Sneha Ganesh, `CASE_SOLUTION.jobs` flags her `lead: true`, and the deck says so on slide 09 a few taps later. The overlay renders `killers[0]` under a MASTERMIND tag, and `getKillers()` was `CHARACTERS.filter(c => c.role === 'MURDERER')` — so the mastermind was whoever the roster happened to list first. `KILLER_IDS` had Sneha first all along; nothing read it for ordering.

**Why it survived:** Nothing about it looks like a bug. The filter is correct, the tag is correct, the data is correct, and the screen renders five real killers with five real professions. It only reads as wrong if you know which of the five is supposed to be the lead — so a screenshot review by someone without the canon in their head passes it, and so does any check that asserts "the reveal names the killers".

**What to do instead:** When a component gives positional meaning to a collection — first is the lead, last is the summary, index 0 is the default — the ordering has to be *stated* at the source, not inherited from whatever produced the list. And assert the semantics, not the shape: the check for this screen now matches `/MASTERMIND\s+SNEHA GANESH/`, not "contains MASTERMIND". Separately: the user's report ("you removed the red screen") was not literally accurate — the screen was untouched — but it was pointing at something real, because killers were routed past it entirely. Read a bug report as a description of what someone saw, then go find the thing that would make them see it.

### 2026-08-07 — A derived count is still a spoiler, and the home screen is the worst place to put one

**What happened:** The hub's footer rail read `51 Guests · 5 Killers`. The user caught it: it tells every player from Round 0 that the conspiracy is five-handed — which is the deduction Rounds 4–5 exist to deliver. Fixed by dropping the killer half; the number stays host-side ([HostPanel.jsx](src/components/HostPanel.jsx), [HostReferenceView.jsx](src/components/views/HostReferenceView.jsx)) and on the killers' own Timeline card, which is gated behind `isMurderer` and prints a phrase, not a count.

**Why it was easy to miss:** `CASE_META.killerCount` is *derived* — `CHARACTERS.filter(c => c.role === 'MURDERER').length` — so it reads as metadata, not content, and never passed under the spoiler review that [storyIntro.js](src/data/storyIntro.js) and [tooltips.js](src/data/tooltips.js) get by having it written into their headers. It also sat in chrome rather than in a clue surface, and chrome is what you stop seeing.

**What to do instead:** Treat any number that comes off the answer key as answer-key material regardless of how it's computed, and audit **[GridMenu.jsx](src/components/GridMenu.jsx) and every always-visible frame** the same way tooltips are audited — those render in Round 00. Cheap check before shipping copy: grep the player-facing components for `killerCount`, `CASE_SOLUTION` and `MURDERER` and confirm each hit is behind a round gate or an `isMurderer` gate.

### 2026-08-07 — A timer whose effect depends on a callback prop is re-armable by any parent re-render

**What happened:** Adding the hub's Comms unread badge put a Firestore message subscription at the top of [App.jsx](src/App.jsx), so App now re-renders when a message lands. Driving the app with the stub pushing a message every 140ms, the harness never reached the board: it sat on the splash screen forever, showing nothing but the masthead. My first instinct was that my new hook had crashed the tree — it hadn't, `#root` had a child and no exception was thrown. [SplashScreen.jsx](src/components/SplashScreen.jsx) ran its 1000ms fade and 1400ms `onComplete` timers from `useEffect(..., [onComplete])`, and App passes `onComplete` as an inline arrow — a fresh function identity on every render. So **every re-render of App cleared both timers and armed them again from zero**, and the whole screen only lasts 1.4s.

**Why it was wrong:** The dependency array was *correct* by the exhaustive-deps rule, which is what makes this invisible: lint is clean, the component is three lines long, and it had worked for months purely because nothing used to re-render App at that rate. The bug is a latent property of the component that a change somewhere else made reachable — and the failure mode at a live event is the worst kind, because the burst of messages that triggers it is exactly what happens when the host says "start chatting", and a player opening the app right then just sits on a near-black screen with no error to report. Note also that the codebase already had the right idiom in [useTypewriter](src/hooks/useTypewriter.js), which holds its `onChar` in a ref with the comment *"so a caller that rebuilds its callback every render doesn't restart the typing loop"* — the lesson was written down one file away and not applied.

**What to do instead:** A component that owns a timer or a frame loop keeps its callback prop in a ref and arms the timer with `[]` — it must not be re-armable by a parent it knows nothing about. Fix it there rather than with a `useCallback` at the call site, which only patches the one caller. Two related habits from the same change: before adding a subscription that re-renders the root, grep for effects whose deps include a *function* (`grep -A6 "setTimeout\|setInterval\|requestAnimationFrame" | grep "}, \["` names them all in one pass — only one of the five here was unsafe), and make the new state setter bail out when nothing changed (`setX(prev => same ? prev : next)`) so snapshots carrying no news cost no render at all.

### 2026-08-07 — A cap that protects a layout is dead code if the data can't reach it

**What happened:** The unread badge rendered `unreadCount > 99 ? '99+' : unreadCount`, defensively, so a big number could not blow out a 173px tile. Measuring it at 1, 2 and 3 digits showed the cap was unreachable: the channel is a `limit(100)` window and one of those hundred is always the read watermark, so the count is bounded at 99 by construction. Worse, the branch was actively harmful — my stub ignored the limit and produced the real thing it would ship as, a badge reading `99+` sitting 3px from a sub-label reading `196 UNREAD`. Two elements on one tile contradicting each other.

**Why it was wrong:** I reached for the cap because *a count can be arbitrarily large* is true in general and false here, and I never asked which. It is the same shape as the 2026-08-05 dead-branch entry, arrived at from the other direction: not a condition whose halves are mutually exclusive, but a threshold the data cannot cross. The measurement I actually needed was already in hand — 30.2px for three digits inside a 175.7px tile — which says the layout never needed protecting in the first place.

**What to do instead:** Before adding a defensive bound, state what bounds the input already, and if something upstream does, cite it in a comment instead of re-imposing it. Then verify the abbreviation against its *neighbours*, not just against the container: a truncated value beside an untruncated one is a visible contradiction, not a graceful degradation. Also worth noting how the numbers were got, because it generalises to any centred glyph: comparing `glyphLeft - boxLeft` against `boxRight - glyphRight` (4.9/4.9 at two digits) is what proved the badge's `0.06em` tracking centres it, where a screenshot could only have shown that it looked about right.

<!-- Add new lessons above this line, newest first or oldest first — keep one consistent order. Current order: oldest first. -->
