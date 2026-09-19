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
- **Real-world purpose:** Social murder-mystery + networking event. The game's events are *not real*.

### Greenr: Last Seating (2609-G, active case)

- **Cast and setting:** 26 playable, first-name-only guests at Greenr, Assagao, Goa, on 19 September 2026.
- **Victim and team (spoiler):** independent diligence partner Rehan Vora is killed by Jack (plan), Arun (AV blind spot) and Manasi (dose).
- **Method (spoiler):** Manasi paints concentrated yellow-oleander extract into Rehan's empty black bottle at 6:02 PM via the pantry service stair. Rehan refills it himself at 6:08 from a clean self-serve upstairs tonic decanter and is found at 6:18.
- **Fair-play mechanics:** 10 suspects, 3 killers, 10 accusations, 10 motives, 8 evidence clues, 6 revelations and a `KEYSTONE` confession. Login codes, clue codes and riddle answers must remain disjoint.
- **Story integrity rulings (2026-09-19):** the AV sync blanks live feeds but leaves a local corridor buffer which Arun deletes at 6:09; Anjul's wet returned service-stair key and Saanvi's sighting close Manasi's route; the forensic material is preliminary and supports collapse within minutes of first ingestion.
- **Codes, login codes and riddle answers are one namespace (2026-08-07).** `echo`, `cloud` and `compass` were riddle answers *and* codes until this date. When adding any word a player can type, check it against all three lists — the dev-only assertion at the bottom of `gameData.js` now covers all three.
- **Late walk-ins (2026-09-19):** the host can issue a one-time pass for a self-registering `BYSTANDER`. Walk-ins receive normal public gameplay, chat, evidence, riddle rewards, an accusation and voting access, but are never part of the 26-person canon, suspects, pods or ending. Their phone/email are kept out of player-facing UI; without Firebase Auth that separation is convention, not hardened access control.

### Six canon rulings from the 2026-08-21 Onam plot-hole audit

Settled with the user's approval, none derivable from a single clue; all now scripted in [STORY.md](STORY.md) §8 (rulings 9–14), `CASE_SOLUTION`, [HOST_QA_BRIEFING.md](HOST_QA_BRIEFING.md) and `HOST_FAST_ANSWERS`.

1. **The flask never left Kalaivani; the *dose* did.** She brewed more than one dose and decanted Giles's share into a small bottle in the 8:37 Uber. The chai flask kept the remainder and sat under the beverage table all party — so "for later" was literally true and she could not let Nikitha empty it. Before this ruling, canon had the flask itself changing hands *and* sitting at the party, in eleven separate restatements.
2. **The 11:04 NVR wipe took the whole fourteen-day array**, not just 21 August. Load-bearing: if only Friday morning had gone, the police could watch Wednesday night's store-room footage and arrest Kalaivani before Round 1.
3. **Badge V-07 left the reception tray at 9:41 AM**, when Giles signed the coffee-machine technician in and drew him a visitor badge. It is his only legitimate reason all day to stand over that tray, and it removes an impossible four-floors-down-three-up detour between 2:50 and 2:52.
4. **Aarohi's window gap is a 3:04 PM Glass Room setup** — innocent, unwitnessed, on the third floor. She previously had *no* gap inside 2:45–3:25, which meant the incident report's own criterion cleared the room's second-favourite suspect.
5. **"OE" and "CS-O" are deliberately ambiguous by title** — three Operations Executives (Giles, Aksharaa, Akshay) and four possible CS-Os (Kalaivani, Sonia, Riya, Nikitha). Kept as difficulty, not fixed. The chat lines' fingerprints close it, and **Aksharaa is the disambiguator**: she read ticket #4417 first and can name who raised it. Never make the titles unique.
6. **Prerna's alibi was in the room with her.** Vipin and Aarush were both in the F2 edit bay when she fetched the source file at 2:58. Neither volunteers it (their own account of that hour is "rendering" a reel that finished at 2:20) and she never asks, so her clearance runs on the file-access log.

Also settled the same day, smaller: the four ignored coffee tickets are **two Shivam's, two Dev's** (Shivam had been claiming all four); the 2:47 alert produced **eleven** window gaps and the party's own errands supplied the other twenty-three (the reveal decks had credited the alert with all thirty-four); Luke's 2:55 Zomato run is the gate-register entry that *does* exist; and the evidence ladder is **fourteen** documents, not thirteen — the Goods-Received Ledger Analysis had been missing from `CASE_SOLUTION.proof` and both decks.


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
- **⚠️ Chat cannot be cleared from the app — the rules forbid it.** [firestore.rules](firestore.rules) sets `allow update, delete: if false` on `messages/{id}`, so `clearAllMessages()` in [src/firebase/config.js](src/firebase/config.js) always fails with `permission-denied`, and its `catch` swallows the error to the console. That makes **Reset Game a partial reset**: round, votes and unlocked clues reset, the channel does not. To wipe the channel, use the admin path, which bypasses rules: `firebase firestore:delete messages --recursive --force --project murder-1bf1c` (CLI 14.26.0, logged in as astralprojectco@gmail.com). Done once on 2026-08-08 — 17 messages, verified back to 0 with a server-side `getCountFromServer`. Clients handle the wipe cleanly: `useUnreadMessages` reseeds when the watermark id falls out of the window.
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

## Conventions the user has confirmed (continued)

- **The game does not begin at login — it begins when the host presses Start (decided 2026-09-19).** The user asked for a waiting screen because 69 people log in over twenty minutes and an app with no evidence in it yet reads as broken. Four things the brief was explicit about:
  1. The screen is **simple** — "waiting for the host to start the game" and nothing else. No tiles, no progress bar, nothing to poke at.
  2. Start is a **host console button**, and it starts *all* timers — so `startGame` writes `gameStartedAt` and all four `roundTimer*` fields in one update.
  3. The screen fades after a **10-second countdown**, so the room is let in together rather than trickling in.
  4. There must be a way to **force-sync the start state** "in case someone's game glitches and they need to move on" — that is **Push start to everyone**, which rewrites the start into the past *and* bumps `forceRefreshAt`, because the two failure modes (a phone that took the start late, a phone whose listener died) need different fixes.
  Claude added **Back to waiting** unasked, as the undo for a mis-tapped Start — the alternative was Reset Game, which also wipes the round, votes, clues and chat.
- **`gameStartedAt` is an absolute instant, never a boolean.** Same reasoning as `roundTimerEndsAt`: a late joiner, a reload or a phone waking from sleep must be *let in*, not shown a starting gun that fired three rounds ago.

## Update protocol

When the user shares a fact that fits the "What belongs here" criteria above, append a bullet under the most appropriate section (or create a new section). Keep it tight — one line per fact when possible.
