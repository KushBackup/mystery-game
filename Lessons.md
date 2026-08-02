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

<!-- Add new lessons above this line, newest first or oldest first — keep one consistent order. Current order: oldest first. -->
