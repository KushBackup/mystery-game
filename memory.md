# memory.md — Project Facts to Remember

> **Read this at the start of every session** alongside [Claude.md](Claude.md) and [Lessons.md](Lessons.md).
>
> Purpose: facts, IDs, decisions, and context that **don't live in code** — so reading the codebase will never surface them. Add a bullet here whenever the user shares context that future-me will need but won't be able to derive.

---

## What belongs here

- ✅ Owner identity, brand, contact details
- ✅ Live game / event details (dates, venues, player counts)
- ✅ Decisions the user has made that aren't documented in code
- ✅ Spoilers / story facts that matter for working on game logic
- ✅ Deployment targets, account info (without secrets), URLs
- ✅ Known pitfalls or constraints not visible from reading source

## What does NOT belong here

- ❌ Anything already in code (read the code instead)
- ❌ Anything documented in another `.md` (link to it instead)
- ❌ Ephemeral session state — that goes in todos or the conversation
- ❌ Secrets, API keys, passwords

---

## Project facts

- **Project nature:** React PWA in a folder named `Unity Projects` — disregard the folder hint, it has nothing to do with Unity.
- **Owner:** Kushagra (kushagra@triplespeed.ai)
- **Brand:** Astral Project
- **Game name:** Astral Project's Murder Mystery Experience
- **Real-world purpose:** Office activity for TripleSpeed (Kushagra's company). Cast = real colleagues. The game's events are *not real* — it's a fictional murder mystery using the office as the setting.
- **Player count:** 32 (the data model is built around exactly 32 character slots)
- **Live game date in fiction:** 2026-05-23, set at the founders' Penthouse, 4th floor, Indiranagar, Bangalore.
- **Victim (spoiler):** Nikhil — fictional Head of Marketing at TripleSpeed. NOT a real person on the team.
- **Murderer reveal (spoiler):** Alam (Head of HR). Nikhil and Alam staged his death together. Nikhil had Stage 4 pancreatic cancer AND was about to be indicted in a SEBI inquiry into TripleSpeed's cooked engagement metrics. Suicide voids the insurance and the SEBI case continues posthumously through Nikhil's estate; a clean homicide pays out (Trust + key-person policy) AND collapses the SEBI case. Alam was Nikhil's HR-side fraud co-conspirator and is the named trustee on the personal life-insurance policy.
- **Murder method:** sodium azide–laced vape cartridge, swapped during a 25-min window when Alam was alone in the Penthouse the morning of the party.
- **Round structure:** 7 rounds (0–6) with codes unlocked progressively (accusation → motive → evidence → revelation → confession).
- **Special clue `THE_TRUTH`:** only valid for the Alam character (`char_alam`) — gates the final confession reveal.

## Infrastructure

- **Main git branch:** `main`
- **Deploy target:** GitHub Pages, base path `/mystery-game/`
- **Deploy command:** `npm run deploy` (runs `predeploy` → `vite build`, then `gh-pages -d dist`)
- **Backend:** Firebase Firestore — config lives in [src/firebase/config.js](src/firebase/config.js). Treat it as live production.
- **Local dev port:** 5173 (Vite default)
- **Default shell on this machine:** PowerShell on Windows 11.
- **`gh-pages` is an orphan branch** — no common ancestor with `main` (`git merge-base` fails), because `gh-pages -d dist` publishes an unrelated history of pure build output (11 minified files, no source). Never `git merge` it; to compare, build `main` and diff the two bundles' string tables.
- **✅ RESOLVED 2026-08-02 — `gh-pages` was ahead of `main`.** Four deploys on 2026-05-08 were built from uncommitted edits, stranding three features as compiled-only code. All three have now been ported into `src/` and rebuilt: `forceRefreshAt` host force-sync, the `HOST_SCRIPT` run sheet, and Firestore IndexedDB offline persistence. *(Correction to the earlier note here: the deployed bundle did **not** contain `localStorage` login persistence under `mg.currentUser`/`mg.isHost` — no build ever had any `localStorage` at all. Session persistence was written fresh on 2026-08-02 under the key `astral.session`, because force-sync is unsafe without it.)*
- **⚠️ The live Firestore game is currently sitting in its terminal state** (as of 2026-08-02): `revealedToMurderer: true` and `gameEnded: true`, left over from a previous session. Any device that logs in as a player right now goes straight to the murderer-reveal overlay and cannot reach the rest of the app. Before the next event the host must press **Reset Game** in the host console. (Discovered while screenshotting the app against production — read-only, nothing was written.)
- **The live site at `/mystery-game/` has been rendering with no custom colours** since at least 2026-05-08: Tailwind v4 does not auto-load `tailwind.config.js`, and the deployed CSS contains zero `mystery-*` palette values. Fixed in `src/index.css` via `@config "../tailwind.config.js"` — **but not yet deployed as of 2026-08-02.**

## Pitch deck & explainer video (added 2026-08-01)

- **`pitch-deck/index.html`** is a self-contained 35-slide HTML deck. Its `:root` block is the **canonical design system** ("Evidence Room") for all Astral Project marketing material — ink/bone/red/amber, plus Big Shoulders / Newsreader / IBM Plex Mono. Copy tokens from there; don't invent new ones.
- **Two slides are `class="slide-archived"`** (the case studies). They are hidden *on purpose* because the real event data isn't ready. Do not restore or fill them without the user's data.
- **The deck's cover line — "I spoke to more people in two hours than I did in six months at this office" — is an ILLUSTRATIVE line, not an attributed testimonial.** Never attach a name, role or company to it, and never present it as a quote from a real guest. It is omitted from the explainer film entirely for this reason.
- **Hard rule for all Astral Project marketing output: no invented numbers.** No revenue, pricing, ticket sales, attendance, customer names, testimonials, ratings, funding, headcount or growth figures. The deck deliberately renders every unknown as a visible `.fill` blank rather than guessing. Safe/true figures: 32 players, 7 rounds, 2–3 hrs, 1 host, 0 actors, 0 app-store installs, 34 clue codes (10/10/7/6/1), 6 case files, 10 suspects, 1 murderer, 1 genre shipped + 5 mapped.
- **`video/` is a separate npm project** with its own `package.json`, `node_modules` and React version (React 19.2.3 + Remotion 4.0.503). Run `npm install` **inside `video/`** — never from the repo root, and don't merge its deps into the PWA's `package.json`.
- **`screen-09-host.png` is ~12% violet (≈`#43295D`)** because the shipped host console genuinely uses violet panels — that colour is outside the deck's palette. It is left as-is on purpose: doctoring a product screenshot would misrepresent the app. If the host panel is ever restyled, re-capture at 390×844 @2x and the deck and film both pick it up with no code change.

## Conventions the user has confirmed

- **The Round 0 case briefing (decided 2026-08-05).** Four choices the user made explicitly when it was built:
  1. It plays **on every login and every reload while the game is in Round 0**, not once per device — 32 people arrive at different times and everyone should get it. It never interrupts anyone after the host advances.
  2. Claude drafts the slide copy; the user edits it. It lives in [src/data/storyIntro.js](src/data/storyIntro.js).
  3. Typing sound is **synthesized (Web Audio), on by default**, with a mute toggle. No audio files in the repo.
  4. The **Story** tile opens a normal in-app screen like every other tile — *not* the slideshow. (The slideshow is re-openable from a control on that screen.)
- **Evidence is a hub over five stacks (decided 2026-08-05).** The user asked first to merge Archives into Evidence, then to group the evidence into its categories behind a grid menu. Three choices they made explicitly when asked:
  1. **One grid for everything** — the grid replaced the earlier Clue board / Case files tabs, so accusations, motives, evidence, revelations and case files are all tiles on one hub.
  2. **Drill down**, not a filter row that stays pinned — tap a stack and it fills the screen with a back control.
  3. **Group by category**, not by suspect. (Grouping by suspect was offered and declined; 7 of the 34 clues name no suspect, so it would have needed a leftover group.)
  Anything that tells a player where a file is must say "Evidence → Case files".
- **Slides must stay inside Round 0 knowledge.** The user's brief was "the introductory information they need to understand the murder" — so the vape is fair game (it is in the public incident report) but the toxin, the cancer, the SEBI inquiry and the staging are the paid-off reveals of rounds 3–5 and must not appear.

## Update protocol

When the user shares a fact that fits the "What belongs here" criteria above, append a bullet under the most appropriate section (or create a new section). Keep it tight — one line per fact when possible.
