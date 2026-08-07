# Claude.md — Session Start Primer

> **READ THIS FIRST.** This file is the single entry point for any Claude session on this project. It tells you what the project is, where deeper context lives, how to work on it, and how to keep documentation current. After reading this, also read [Lessons.md](Lessons.md) and [memory.md](memory.md) before starting work.

---

## ⚠️ Project type — IMPORTANT

**This is a React PWA, NOT a Unity project.**

The folder lives at `d:\Unity Projects\mystery-game` for historical reasons, but it has zero Unity content. Always check [package.json](package.json) before assuming tooling. Do not look for `.unity` scenes, C# scripts, or `Assets/` folders — they don't exist.

---

## TL;DR

**Astral Project's Murder Mystery Experience** — a 51-player real-time web murder mystery party game. Players log in as one of 51 guests, earn clue codes by solving riddles and trade them around the room across 7 rounds, chat in real time, vote across the room, and ultimately uncover that the victim — Armaan Khanna, the fictional founder of Velvet Ember Spirits — was killed by a five-person conspiracy led by Sneha Ganesh. The shipped story is now the **Velvet Ember distillery case**, not the old TripleSpeed office case. Built as an installable PWA with offline support, deployed to GitHub Pages at base path `/mystery-game/`.

---

## Documentation map

Always start at this file. Read the others on demand based on what you're working on.

| File | What it contains | Read it when |
|---|---|---|
| **Claude.md** *(this file)* | Operating manual + doc index | Always, at session start |
| **[memory.md](memory.md)** | Project facts/context not visible in code | Always, at session start |
| **[Lessons.md](Lessons.md)** | Mistakes Claude has made + lessons learned | Always, at session start |
| **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** | Full project & game design overview | Working on game flow, mechanics, scope |
| **[STORY.md](STORY.md)** | Narrative bible, character backstories, full timeline | Editing characters, clues, story content |
| **[HOST_QA_BRIEFING.md](HOST_QA_BRIEFING.md)** | Host-only answers to likely story objections and logic questions | Tightening story logic, facilitating the live room |
| **[HOST_LIVE_FACILITATION.md](HOST_LIVE_FACILITATION.md)** | Fast round-by-round run-of-show for the live host | Running the room in real time |
| **[HOST_PRINT_PACK.md](HOST_PRINT_PACK.md)** | Printable host packet: clue manifest, witness relevance map, answer key | Preparing materials before the event |
| **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)** | Architecture, components, state management | Refactoring, adding components, debugging state |
| **[DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md)** | "Evidence Room" design system — palette, type scale, components, motion, per-screen application | Any visual/theming work on the app or the deck |
| **[CLUE_CODES.md](CLUE_CODES.md)** | All clue codes (accusation/motive/revelation) | Adding/changing clue codes |
| **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** | Firebase configuration & setup steps | First-time setup, env config issues |
| **[FIREBASE_VISUAL_GUIDE.md](FIREBASE_VISUAL_GUIDE.md)** | Diagrams of Firestore data structure | Debugging real-time sync, schema questions |
| **[CHAT_SETUP_QUICKSTART.md](CHAT_SETUP_QUICKSTART.md)** | Chat system setup (snapshot) | Re-enabling chat from scratch |
| **[CHAT_IMPLEMENTATION_COMPLETE.md](CHAT_IMPLEMENTATION_COMPLETE.md)** | Chat system deep dive | Modifying chat behavior |
| **[PWA_IMPLEMENTATION_COMPLETE.md](PWA_IMPLEMENTATION_COMPLETE.md)** | PWA / offline / service worker details | Touching PWA, vibration, offline behavior |
| **[MYSTERY_IMPROVEMENTS_SUMMARY.md](MYSTERY_IMPROVEMENTS_SUMMARY.md)** | Snapshot of recent enhancements | Historical reference only |
| **[reveal-deck/README.md](reveal-deck/README.md)** | The 22-slide post-game "How It Happened" reconstruction deck — structure, controls, the two components it adds. The **projected** copy; [src/data/revealDeck.js](src/data/revealDeck.js) is the same 22 slides in the app | Touching either reveal deck |
| **[video/README.md](video/README.md)** | The Remotion explainer film — tokens, motion language, timeline, how to re-render | Touching the explainer video |
| **[video/script.md](video/script.md)** | Voiceover script for the explainer (optional track) | Recording or editing the VO |
| **[README.md](README.md)** | Vite/React boilerplate | Low-value, skip |

---

## Key files index

The files you will most often need to open:

- [src/App.jsx](src/App.jsx) — main state machine, routing, Firebase wiring
- [src/data/gameData.js](src/data/gameData.js) — 51 characters, 34 clue codes, round definitions, case metadata, the riddle-lock reward queue, and host script (the largest data file)
- [src/data/riddles.js](src/data/riddles.js) — the 100 riddles behind the **riddle lock**, plus answer matching and the seen-ledger. **Nothing in it may touch the case** — read the header before adding one
- [src/components/modals/RiddleModal.jsx](src/components/modals/RiddleModal.jsx) — the riddle lock: ASK on the Evidence screen. Solving a riddle unseals the next clue in that player's queue and hands them a shareable code. **This replaced the printed clue cards** — there are none left in the game
- [src/data/hostReference.js](src/data/hostReference.js) — structured host-only reference data for the in-app host guide screen
- [src/data/screenGuide.js](src/data/screenGuide.js) — per-screen kicker/title/brief/detail copy plus `ROUND_GUIDE`; feeds the screen frames, the onboarding notes, the Guide and the round tooltip
- [src/data/tooltips.js](src/data/tooltips.js) — all tooltip copy, and `roundTip()`. The **pulled** half of the help layer: the screen notes expire at Round 02, these never do
- [src/data/storyIntro.js](src/data/storyIntro.js) — the Round 0 case briefing: eight slides + the typing speed. **Spoiler-gated to Round 0 knowledge** — read the header before editing. Feeds both the fullscreen briefing and the Story screen
- [src/components/StoryIntro.jsx](src/components/StoryIntro.jsx) — the fullscreen typed briefing (Round 0 takeover, and the replay from the Story screen)
- [src/components/RevealDeck.jsx](src/components/RevealDeck.jsx) — "How it happened": the **22-slide reconstruction**, opened from *both* terminal screens (the killer reveal and the outro) so all 51 players can reach it. Paged and swipeable, phone-first. It replaced the single scrolling `CaseSolution.jsx` document on 2026-08-07
- [src/data/revealDeck.js](src/data/revealDeck.js) — the 22 slides. The in-app twin of [reveal-deck/index.html](reveal-deck/index.html); slides 09, 21 and 22 read `CASE_SOLUTION` in [src/data/gameData.js](src/data/gameData.js) directly — **the answer key**, so nothing in either file may leak into a round-gated surface
- [src/firebase/config.js](src/firebase/config.js) — Firestore real-time sync (votes, chat, game state)
- [src/components/HostPanel.jsx](src/components/HostPanel.jsx) — admin controls (round advance, voting toggle, file unlocks)
- [src/components/views/HostReferenceView.jsx](src/components/views/HostReferenceView.jsx) — the in-app host guide: rounds, witness map, deck, materials, and objection handling
- [src/components/CharacterSelect.jsx](src/components/CharacterSelect.jsx) — login screen
- [src/components/GridMenu.jsx](src/components/GridMenu.jsx) — Metro-tile home hub
- [src/components/views/](src/components/views/) — full-screen views (Dashboard, Intel, Chat, Voting, Timeline, Dossier, Help, Story). `IntelView` is the **Evidence** screen: a hub over five grouped stacks — accusations, motives, evidence, revelations, and `CaseFilesSection` (the old standalone "Archives" screen, merged in 2026-08-05)
- [src/components/modals/DecoderModal.jsx](src/components/modals/DecoderModal.jsx) — clue code entry
- [src/components/modals/](src/components/modals/) — Decoder, GuestProfile, VoteResults
- [src/components/icons/](src/components/icons/) — all SVG icons (no PNG/SVG asset files used)
- [src/components/ui/](src/components/ui/) — the shared motion/vocabulary pieces: `Numeral` (counting brass figure), `RoundRail`, `RedactedLines`, `ScreenBrief`, `InfoTip` (the `?` tooltip), `FeedbackToast`, `SearchField` (the shared list filter — Vote and Guests), `Doodles`
- [src/hooks/](src/hooks/) — `useCountUp` (ticks a numeral on change, never on mount) and `useTypewriter` (character-at-a-time reveal on one rAF loop)
- [src/lib/typeSound.js](src/lib/typeSound.js) — synthesized typewriter clicks + margin bell (Web Audio; **no audio files in this repo**), mute state in `localStorage['astral.sfx']`
- [package.json](package.json) — dependencies & npm scripts
- [vite.config.js](vite.config.js) — build config + PWA plugin
- [tailwind.config.js](tailwind.config.js) — custom mystery theme palette

### Sibling sub-projects (not part of the PWA build)

- [pitch-deck/index.html](pitch-deck/index.html) — self-contained 1920×1080 HTML pitch deck (its own CSS/JS, no build step). The `:root` block is the canonical "Evidence Room" design system.
- [reveal-deck/index.html](reveal-deck/index.html) — **the projected post-game reconstruction deck.** 22 fixed-stage slides explaining how the murder happened, in plain language, for players *after* the reveal. Same self-contained pattern as the pitch deck — no build step, no npm. The app ships **the same 22 slides** as [src/data/revealDeck.js](src/data/revealDeck.js) (reflowed for a phone, in the app voice), and both restate `CASE_SOLUTION` in [src/data/gameData.js](src/data/gameData.js) and [STORY.md](STORY.md) — so **a story change means editing all four**. See [reveal-deck/README.md](reveal-deck/README.md).
- [video/](video/) — **separate npm project.** A Remotion explainer film built from the deck. Has its own `package.json`, `node_modules` and React version; run `npm install` inside `video/`, never from the repo root. See [video/README.md](video/README.md).

---

## Tech stack

| Area | Tool | Version |
|---|---|---|
| UI framework | React | ^19.2.0 |
| Build tool | Vite | ^7.2.4 |
| Styling | Tailwind CSS | ^4.1.18 |
| Backend | Firebase (Firestore) | ^11.1.0 |
| PWA | vite-plugin-pwa | ^1.2.0 |
| Service worker client | workbox-window | ^7.4.0 |
| Linting | ESLint | ^9.39.1 |
| Deploy | gh-pages | ^6.3.0 |
| Tests | **None** — no test framework configured |

### `video/` sub-project (independent dependency tree)

| Area | Tool | Version |
|---|---|---|
| Video framework | Remotion (`remotion`, `@remotion/cli`) | 4.0.503 |
| Also installed | `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/shapes` | 4.0.503 |
| UI framework | React | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Styling | **Inline styles only** — no Tailwind, no CSS files, no animation library |

---

## Tools & shell

- **Default shell on this machine: PowerShell** (Windows 11). Use PS syntax — `$env:VAR` not `$VAR`, `;` for sequencing not `&&`, backtick for line continuation.
- Bash is available too via the Bash tool if needed.
- For file work prefer the dedicated tools: Read, Edit, Write, Glob, Grep — not shell `cat`/`grep`/`find`.

## Dev workflow

```powershell
npm install              # first-time setup
npm run dev              # localhost:5173
npm run lint             # before committing
npm run build            # verify production build is healthy
npm run preview          # serve the production build locally
```

### The explainer video (run these from `video/`, not the repo root)

```powershell
cd video
npm install                                  # first-time setup — separate dependency tree
npm run lint                                 # eslint + tsc; catches style-spread bugs tsc can see
npx remotion studio                          # live preview at localhost:3000
npx remotion still S08Rounds out/check.png --frame=290 --scale=0.5   # fast layout check
npx remotion render Explainer out/astral-explainer.mp4 --codec=h264 --crf=18
npx remotion render Explainer-Vertical out/astral-explainer-vertical.mp4 --codec=h264 --crf=18
```

A full render is ~4 minutes per cut for 3900 frames. Prefer `remotion still` while iterating on layout.

## Deploy workflow

```powershell
npm run deploy           # builds + pushes /dist to gh-pages branch (GitHub Pages)
```

- Base path: `/mystery-game/` (set in [vite.config.js](vite.config.js))
- **Always confirm with the user before deploying.** Deployment is visible to live players.

## Firebase cautions

[src/firebase/config.js](src/firebase/config.js) connects to a **live Firestore database** that may have an active game in progress. Treat it like production:

- ✅ Reading documents/collections is fine.
- ❌ **Never** mutate game state (round, votes, chat messages, unlocked clues) without explicit user approval.
- ❌ Never wipe collections or run migration scripts unprompted.
- If unsure whether an action mutates the live DB, ask first.

---

## Code conventions

- Functional React components + hooks only — no class components.
- **The app runs on the "Evidence Room" design system** — see [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md). Palette names are `ink`, `ink-raised`, `ink-hover`, `bone`, `bone-aged`, `signal`, `signal-deep`, `signal-lift`, `brass`, `dim`, `dim-2`, `body-bone`, `line`, defined in the `@theme` block of [src/index.css](src/index.css). The old `mystery-*` palette is **deleted**.
- **Never introduce a hue outside that list.** No `green-500`, no `blue-600`, no gradients. Differentiate by changing the *surface* (ink → bone) or the *label*, not the colour. Brass is for numerals only; red never fills a large area except the murderer reveal.
- Reusable pieces are the `.er-*` classes in [src/App.css](src/App.css) (`er-card`, `er-bone`, `er-tag`, `er-mono`, `er-num`, `er-redact`, `er-stat`, `er-list`, `er-touch`, …). Prefer composing those over hand-rolling a new card.
- All icons are inline SVG components in [src/components/icons/](src/components/icons/) — there are no PNG/raster assets in the repo.
- No animation libraries (no Framer Motion, no GSAP). Custom CSS animations live in [src/App.css](src/App.css).
- Game data is **hardcoded** in [src/data/gameData.js](src/data/gameData.js) — no CMS, no remote content fetch.

---

## Common tasks playbook

| Task | Files to touch | Don't forget |
|---|---|---|
| Add/change a clue code | [src/data/gameData.js](src/data/gameData.js) | Update [CLUE_CODES.md](CLUE_CODES.md). A motive/evidence/revelation clue is automatically in the riddle-lock prize pool — check `RIDDLE_REWARD_POOL` still means what you want |
| Add/change a riddle | [src/data/riddles.js](src/data/riddles.js) only | Answers must be **one word** with a generous `alt` list, and the riddle must not touch the case in any way — a riddle that brushes the fiction gets theorised about as a clue. Rerun the deck checks: 100 entries, unique ids, unique answers |
| Change how clues are earned or shared | [RiddleModal.jsx](src/components/modals/RiddleModal.jsx) + `riddleQueueFor`/`nextRiddleReward` in [gameData.js](src/data/gameData.js) | The reward queue is **stable per player and different between players** on purpose — that is what stops 51 phones holding the same clue and gives codes something to be worth. Also update the host copy: `HOST_SCRIPT` in gameData.js, [hostReference.js](src/data/hostReference.js), [HOST_LIVE_FACILITATION.md](HOST_LIVE_FACILITATION.md), [HOST_PRINT_PACK.md](HOST_PRINT_PACK.md) |
| Add/edit a character | [src/data/gameData.js](src/data/gameData.js) — characters array | Keep the roster at 51 unless the user explicitly changes event scale; update [STORY.md](STORY.md) if backstory changes |
| Theme/visual tweak | `@theme` in [src/index.css](src/index.css) for tokens; [src/App.css](src/App.css) for `.er-*` components | Follow [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md). Colours go in `@theme`, **never** in `tailwind.config.js` (config colours don't emit CSS custom properties). `App.css` is imported by `index.css` as `layer(components)` — importing it from `main.jsx` instead would make every `.er-*` rule un-overridable by Tailwind utilities |
| Motion / microinteraction | [src/App.css](src/App.css) §1 primitives; `.er-*` motion classes | Read [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) **§7.1 (motion restraint)** before adding, not just §7 — the hard part is knowing where *not* to animate. Name the transitioned properties; never a blanket one. Then verify by measuring `getComputedStyle` over time, not by looking at a screenshot |
| New modal | [src/components/modals/](src/components/modals/) + wire from [src/App.jsx](src/App.jsx) | — |
| New view/tab | [src/components/views/](src/components/views/) + wire in [src/App.jsx](src/App.jsx) and [src/components/GridMenu.jsx](src/components/GridMenu.jsx) | Add a `SCREEN_GUIDE` entry in [src/data/screenGuide.js](src/data/screenGuide.js) — that's where the kicker, title, onboarding note and Guide entry all come from. Also check the tile count: the board is 6 tiles + 2 full-width strips, so adding one destination means rebalancing, not appending |
| Case files (forensics, exhibits, reports) | [src/components/views/CaseFilesSection.jsx](src/components/views/CaseFilesSection.jsx) | It is the **Case files** stack of the Evidence screen, not a screen of its own. Anything that tells a player where to find a file must say "Evidence → Case files" — including the `HOST_SCRIPT` copy in [src/data/gameData.js](src/data/gameData.js) |
| Add/rename/regroup an Evidence stack | `CLUE_STACKS` in [src/data/gameData.js](src/data/gameData.js) (what it contains), `EVIDENCE_STACKS` in [src/data/screenGuide.js](src/data/screenGuide.js) (what it's called), `STACK_STYLE` in [IntelView.jsx](src/components/views/IntelView.jsx) (surface, tilt, empty state) | Three files on purpose — data, copy, presentation. A stack's `kicker` must not contain the word "Evidence": it is used as the screen kicker when the stack is open, so `Evidence Board / Evidence` is the frame you'd get |
| Screen title / kicker / "what this screen is" copy | [src/data/screenGuide.js](src/data/screenGuide.js) only | Don't hardcode it in the view — the Guide reads the same entries, which is what stops the two drifting apart |
| Add/edit a tooltip | `TOOLTIPS` in [src/data/tooltips.js](src/data/tooltips.js) for copy; drop an `<InfoTip>` beside the label in the view | Read [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) **§6.13** first. A mark added to a `justify-between` row can wrap the label opposite it — pin the label column with `shrink-0` and verify by counting the client rects of the label's text node, not by looking. Never place one where the copy could leak the case: tooltips are read in every round, including Round 00 |
| Round descriptions ("what happens in Round 3") | `ROUND_GUIDE` in [src/data/screenGuide.js](src/data/screenGuide.js) only | Titles come from `ROUNDS` in gameData.js. Both the Guide and the round tooltip render this list — don't retype it in either |
| Story briefing copy or pacing | [src/data/storyIntro.js](src/data/storyIntro.js) only | It feeds both the fullscreen briefing and the Story screen. **Check any new line against the spoiler list in that file's header** — the toxin is Round 3, the cancer/SEBI/insurance are Round 4, the staging is Round 5+ |
| The end-of-game explanation ("How it happened") | [src/data/revealDeck.js](src/data/revealDeck.js) for the slides; `CASE_SOLUTION` in [src/data/gameData.js](src/data/gameData.js) for the answer key; [src/components/RevealDeck.jsx](src/components/RevealDeck.jsx) for presentation | It restates [STORY.md](STORY.md), so change both together and re-check the beats against `CASE_TIMELINE`. It is reached from *two* screens — the reveal overlay and the outro — because killers never see the overlay; a change to one entry point needs the other. **[reveal-deck/index.html](reveal-deck/index.html) is the same 22 slides for a projector** — update it too, or the projected version and the in-app version will disagree |
| Add/remove/reorder a reveal slide | [src/data/revealDeck.js](src/data/revealDeck.js), then the matching `<section class="slide">` in [reveal-deck/index.html](reveal-deck/index.html) | Both decks are 22 slides in the same order on purpose. A new **block type** also needs a renderer in `BLOCKS` in [RevealDeck.jsx](src/components/RevealDeck.jsx) — data, copy and presentation stay separate the same way the Evidence stacks do |
| Firestore schema change | [src/firebase/config.js](src/firebase/config.js) | Update [FIREBASE_VISUAL_GUIDE.md](FIREBASE_VISUAL_GUIDE.md); coordinate with user before deploying — breaks live games |
| Host control | [src/components/HostPanel.jsx](src/components/HostPanel.jsx) | — |
| PWA / service worker | [vite.config.js](vite.config.js) | Update [PWA_IMPLEMENTATION_COMPLETE.md](PWA_IMPLEMENTATION_COMPLETE.md) |

---

## What NOT to do

- ❌ Don't create new top-level `.md` files unless the user asks.
- ❌ Don't refactor unrelated code while fixing a bug.
- ❌ Don't run `git commit` unless the user explicitly asks.
- ❌ Don't pass `--no-verify` to git commands.
- ❌ Don't push or deploy without explicit approval.
- ❌ Don't assume Unity tooling, Unity project structure, or C# scripts.
- ❌ Don't add a test framework or CI config without asking — this project has chosen not to use one.
- ❌ Don't introduce animation/UI libraries — the project deliberately uses plain CSS + Tailwind.
- ❌ Don't add a colour outside the [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §2.1 table, and don't put `brass` on anything that isn't a numeral.
- ❌ Don't import [src/App.css](src/App.css) from [src/main.jsx](src/main.jsx) — it must stay a `layer(components)` import inside [src/index.css](src/index.css).

---

## Documentation update protocol

The user expects these docs to stay current. **Whenever you finish a meaningful change, update the relevant doc(s) before declaring the task done.**

| When you change… | Update… |
|---|---|
| Game flow, rounds, mechanics | [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) |
| Architecture, components, state | [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) |
| Story, characters, backstory | [STORY.md](STORY.md) |
| Clue codes (any add/remove/rename) | [CLUE_CODES.md](CLUE_CODES.md) |
| Firestore schema | [FIREBASE_VISUAL_GUIDE.md](FIREBASE_VISUAL_GUIDE.md) |
| Chat behavior | [CHAT_IMPLEMENTATION_COMPLETE.md](CHAT_IMPLEMENTATION_COMPLETE.md) |
| PWA / offline / vibration | [PWA_IMPLEMENTATION_COMPLETE.md](PWA_IMPLEMENTATION_COMPLETE.md) |
| Tech stack / dependencies / scripts | **This file** (Claude.md) — Tech stack and Dev/Deploy sections |
| The doc map itself (file added/removed) | **This file** (Claude.md) — Documentation map table |

After **every** correction from the user or non-obvious mistake → append a dated entry to [Lessons.md](Lessons.md).
After learning a project fact that won't surface from reading code → add it to [memory.md](memory.md).

---

## Quick orientation checklist for a new session

1. Read this file (you're doing it now).
2. Read [memory.md](memory.md) and [Lessons.md](Lessons.md).
3. Glance at recent `git log` to see what changed last.
4. Read the user's request and pick the relevant doc from the **Documentation map** above to load deeper context only if needed.
5. Use [src/App.jsx](src/App.jsx) and [src/data/gameData.js](src/data/gameData.js) as your default jump-off points for code work.
