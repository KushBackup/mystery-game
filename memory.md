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
- **Real-world purpose:** Social murder-mystery + networking event for 51 attendees who mostly do not know each other beforehand. The game's events are *not real*.
- **Player count:** 51 playable guests.
- **Live game date in fiction:** 2026-08-08, set at For the Record in Panjim, Goa.
- **Victim (spoiler):** Armaan Khanna — fictional founder and CEO of Velvet Ember Spirits.
- **Killer reveal (spoiler):** Five killers, led by Sneha Ganesh. The full team is Sneha Ganesh, Kiyaah Rose Raghuwanshi, Victoria Vance, Roddy Faustus, and Oindrilla Chatterjee.
- **Murder method:** aconitine hidden in the orange-oil finishing spray for Armaan's private signature drink, the Last Light.
- **Round structure:** 7 rounds (0–6) with codes unlocked progressively (accusation → motive → evidence → revelation → confession).
- **Special clue `KEYSTONE`:** the confession, written for the five killer characters — gates the final confession reveal. (Was `THE_TRUTH` until 2026-08-07.)
- **Clue codes are deliberately meaningless single words (2026-08-07):** never a login code, never descriptive of the clue, never guessable from the roster. The motive codes used to *be* the ten prime suspects' login codes, which let anyone who heard a Round 2 code log in as a killer and read "Classified · Killer" off the Identity screen. `gameData.js` now asserts the two namespaces stay disjoint in dev.
- **User decision (2026-08-06):** treat all 51 questionnaire rows as intentional cast members, even the noisy ones; do not drop joke entries unless the user explicitly removes them.
- **Three canon rulings settled by the 2026-08-07 story audit**, none of them derivable from a single clue:
  1. **Kiyaah carried the cloned staff QR herself**, over a borrowed service apron. She never needed it to reach the private bar — she had run it since 7:40 PM. The pass exists so the *access log* names a staffer who had already clocked out. Anjul's 10:09 apron sighting is her coming back out.
  2. **Tara is framed; Tanvi is used.** Different things. Victoria manufactured the invoice to run the twin atomizer through Tara's vendor. Nobody planted the floor plan — it is genuinely Tanvi's, written for a cake reveal, and Sneha simply built the murder's timing on top of a blind spot the party planner had already drawn.
  3. **The four Raghuwanshi/Raghuvanshi guests are not related.** Coincidence of the real guest list; no clue depends on a family link. Same for the three S.G.s (Sneha Ganesh, Shubham Goyal, Savvy Grover) — the ambiguity is real and is resolved by *job*, not by initials.
- **Five more canon rulings from the 2026-08-07 plot-hole pass** (all now scripted in STORY.md, `CASE_SOLUTION`, HOST_QA_BRIEFING.md and `HOST_FAST_ANSWERS`; none derivable from a single clue):
  1. **Armaan opened Tara's crate himself** — he had staff unseal the gift early to stage the private-reserve bottles beside the bar for the Last Light. Explains the broken customs seal, the reopened crate, and the crate sitting by the bar at 10:12. The conspiracy never touched it; the frame borrowed his mess.
  2. **The Monday folder stayed upstairs for two reasons**: it proved the scapegoat script hadn't gone to Meridien's lawyers yet (kill him tonight, kill the handoff), and found by police it scatters motive across five initials, only three of them killers'. Destroying it would have *narrowed* the field.
  3. **Oindrilla's cloned credential is log-laundering, not access** — the same session revived the staff QR, so it could never carry her login; her being *seen* at the console is survivable because a systems lead rebooting a frozen reel reads as response, not cause. The mirror of Kiyaah's QR trick.
  4. **How the conspiracy formed in two days**: Sneha priced every wound in the room as Armaan's fixer; the binder named Victoria and Oindrilla as fellow scapegoats; Roddy and Kiyaah were recruited *because* they were outside it. Nobody warned Armaan because each recruit held fresh proof he was about to destroy them, and nothing needed inventing (only the invoice and the twin's label were fabricated).
  5. **Micro-canon**: Roddy's "dose" (10:04, Valerie) was muttered to himself; "orange, not bottle" (10:04, Shubham) was Kiyaah's garnish instruction to staff; the display cabinets stand over the gift table, so Aayushi's and Chayne's 10:09 Anna sightings are one sighting from two angles. Oindrilla's timeline line was also corrected to "back into the sound booth two minutes into the montage" (the reel starts 9:55; her QR entry is 9:57 per the access trace).
- **Codes, login codes and riddle answers are one namespace (2026-08-07).** `echo`, `cloud` and `compass` were riddle answers *and* codes until this date. When adding any word a player can type, check it against all three lists — the dev-only assertion at the bottom of `gameData.js` now covers all three.

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
- **Hard rule for all Astral Project marketing output: no invented numbers.** No revenue, pricing, ticket sales, attendance, customer names, testimonials, ratings, funding, headcount or growth figures. The deck deliberately renders every unknown as a visible `.fill` blank rather than guessing. Safe/true figures for the current case: 51 players, 7 rounds, 2–3 hrs, 1 host, 0 actors, 0 app-store installs, 34 clue codes (10/10/7/6/1), 6 case files, 10 prime suspects, 5 killers.
- **`video/` is a separate npm project** with its own `package.json`, `node_modules` and React version (React 19.2.3 + Remotion 4.0.503). Run `npm install` **inside `video/`** — never from the repo root, and don't merge its deps into the PWA's `package.json`.
- **`screen-09-host.png` is ~12% violet (≈`#43295D`)** because the shipped host console genuinely uses violet panels — that colour is outside the deck's palette. It is left as-is on purpose: doctoring a product screenshot would misrepresent the app. If the host panel is ever restyled, re-capture at 390×844 @2x and the deck and film both pick it up with no code change.

## Conventions the user has confirmed

- **The Round 0 case briefing (decided 2026-08-05).** Four choices the user made explicitly when it was built:
  1. It plays **on every login and every reload while the game is in Round 0**, not once per device — 51 people arrive at different times and everyone should get it. It never interrupts anyone after the host advances.
  2. Claude drafts the slide copy; the user edits it. It lives in [src/data/storyIntro.js](src/data/storyIntro.js).
  3. Typing sound is **synthesized (Web Audio), on by default**, with a mute toggle. No audio files in the repo.
  4. The **Story** tile opens a normal in-app screen like every other tile — *not* the slideshow. (The slideshow is re-openable from a control on that screen.)
- **Evidence is a hub over five stacks (decided 2026-08-05).** The user asked first to merge Archives into Evidence, then to group the evidence into its categories behind a grid menu. Three choices they made explicitly when asked:
  1. **One grid for everything** — the grid replaced the earlier Clue board / Case files tabs, so accusations, motives, evidence, revelations and case files are all tiles on one hub.
  2. **Drill down**, not a filter row that stays pinned — tap a stack and it fills the screen with a back control.
  3. **Group by category**, not by suspect. (Grouping by suspect was offered and declined; 7 of the 34 clues name no suspect, so it would have needed a leftover group.)
  Anything that tells a player where a file is must say "Evidence → Case files".
- **Caveat is out; annotations are Special Elite (decided 2026-08-05).** The user asked to remove Caveat because it was hard to read, and named the typewriter face as the replacement they wanted. So the app is now **four families, five roles** — `--font-note` and `--font-typewriter` both hold Special Elite, kept as separate tokens because they're separate roles. Notes are distinguished by tilt, sentence case and accent colour, not by face. Sizes came *down* ~4px from the Caveat originals ([DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §3.3) — do not read that as a general "notes got smaller" preference, it is a metric fact about Special Elite being 24% wider per character.
- **Dead branch worth knowing about:** `CaseFilesSection`'s handwritten photo caption only renders for `file.type === 'IMAGE'`, and all six case files are `type: 'REPORT'` with no `caption` field. The branch has never rendered. Left in place — it's presumably for image exhibits the user may still add.
- **Clue codes are earned in-app, not printed (decided 2026-08-07).** The user replaced the three printed clue stacks with a **riddle lock**: an ASK button beside the decoder on Evidence deals a general riddle (100 of them in [src/data/riddles.js](src/data/riddles.js), *nothing to do with the case*), and a correct one-word answer unseals the next clue in that player's queue **plus its code, shown for sharing**. Four things the brief was explicit about, and which the design turns on:
  1. **The reward must be a code you can give away**, not just a clue — one solve should be able to unseal that clue on fifty other phones.
  2. **A "high dopamine" payoff.** Hence the §7.2 signature moment: expanding rings, paper flecks, a `SOLVED` stamp, a three-bell fanfare and a haptic triplet. This is the loudest thing in the app after the murderer reveal, and that is intentional.
  3. Answers are **one word, typed** — never multi-word, because the typing happens standing up in a loud room.
  4. **It replaces printing everywhere**, not just in the app: host script, host guide, run sheet and print pack all had their "hand out the cards" steps removed. The only paper left is the 51 login cards.
  The per-player queue order (`riddleQueueFor`) is stable-but-different on purpose — if every phone paid out the same clue, codes would be worth nothing and the room would have no reason to talk. [CLUE_CODES.md](CLUE_CODES.md) is now the **host's stall-breaker**, not a packing list.
- **Slides must stay inside Round 0 knowledge.** The user's brief was "the introductory information they need to understand the murder" — so the vape is fair game (it is in the public incident report) but the toxin, the cancer, the SEBI inquiry and the staging are the paid-off reveals of rounds 3–5 and must not appear.

## Update protocol

When the user shares a fact that fits the "What belongs here" criteria above, append a bullet under the most appropriate section (or create a new section). Keep it tight — one line per fact when possible.
