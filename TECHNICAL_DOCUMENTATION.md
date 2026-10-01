# Astral Project's Murder Mystery Experience
## Technical Documentation

> Maintenance note: Update this file whenever the architecture, data model, shared state, or screen behavior changes. This is the implementation overview for the current 26-player Greenr case (Last Seating, 2609-G).

---

## Killers Night (the new format, in progress since 2026-09-26)

The Greenr authored case below is being replaced by **Killers Night**, a Killers/Mafia hybrid:
- Roles are dealt live from whoever turns up.
- Clues describe the killer's real traits, answered at arrival.
- Murdered and banished players become Ghosts.

The rationale and milestones are in the plan file named in [memory.md](memory.md). `/` now opens Killers Night; `?classic` still opens the Greenr game until the cleanup milestone deletes it.

### Layers

| Layer | Files | Rule |
|---|---|---|
| Engine | [src/lib/engine/](src/lib/engine/) — `rng`, `roles`, `clues`, `night`, `morning`, `banish`, `win`, `roster`, `phases` | Pure, no Firebase, runs in Node. Every random draw is `makeRng(seed, cycle, purpose)`, so a resolution is reproducible on any host device |
| Content | [src/data/traits.js](src/data/traits.js), [src/data/packs/](src/data/packs/), [src/data/killersCopy.js](src/data/killersCopy.js) | Six arrival traits (grouped so one clue splits the room about in half); a story pack (setting, two narration lines per beat, one clue line per trait group, whisper words); all other copy is 25 words or fewer |
| Firebase | [src/firebase/app.js](src/firebase/app.js) (init, emulator switch), [game.js](src/firebase/game.js) (player reads/writes), [host.js](src/firebase/host.js) (every outcome) | Players write only their own action, vote and chat. The host device resolves each phase in four steps: lock, read from server, resolve, then one transaction guarded by `resolutions/<id>` |
| Clock | [src/lib/clockSkew.js](src/lib/clockSkew.js) | Every device reads time as `serverNow()`, so a reveal at `revealAt` flips on every phone at once (there is no projector) |
| UI | [src/KillersApp.jsx](src/KillersApp.jsx), [src/os/](src/os/) (the DEEP BLUE phone), [src/components/game/PlayerApp.jsx](src/components/game/PlayerApp.jsx) (loading only), [src/components/host/HostApp.jsx](src/components/host/HostApp.jsx), [src/hooks/useKillers.js](src/hooks/useKillers.js) | Player: a retro phone OS (see below). Host: Google sign-in, Setup, then a console with one Next button, read-aloud lines, autopilot, roster, and a live board during the run |

### Phase machine

`lobby → casting → [night → (recruit) → alarm → game → dawn → investigation → roundtable → (revote) → banish] × cycles → endgame ×2 → finale`

- Every `*_locked` phase is the host's resolution beat. The rules refuse actions, scores and votes during it.
- A host that crashes mid-resolution leaves the game locked. Pressing Next again finishes the job, and the marker keeps it single.

### The morning (DEEP BLUE, 2026-09-30)

Killers murder by rigging the morning run's leaderboard, so a day resolves in two halves.

1. **Night locks.** `resolveNight` decides the victim, the hand, the rig value (`zero` or `under`), saves, traces, séances and the night's facts. Nothing is written for players except a recruit offer; the whole result is stashed in `secret.pendingMorning`.
2. **Alarm** (20 s, synced ring) then **game** (90 s). Every phone plays the same seeded course (`game.courseSeed` + the day, attempt `n` → course `${seed}:${n}`). Each phone writes `scores/{cycle}_{pid}` only on a new best, and always on its first run.
3. **Game locks.** The host reads every score from the server and runs `resolveMorning` ([src/lib/engine/morning.js](src/lib/engine/morning.js)):
   - The rig lands: the target dies (`cause: 'murdered'`) and their row shows the rigged value, last.
   - The Firewall held (Doctor): the lowest living honest score dies instead (`cause: 'deep'`), protected guests excepted, ties by seed; a guest who never played scores 0. It can take a Killer, whose role stays hidden.
   - The top 3 living scorers each receive one of the night's facts (`via: 'top'`).
4. **Dawn** is one commit: deaths, `game.board`, the `news` log entry and every held delivery land together, so no clue arrives before the board.

The run stops `GAME_GRACE_MS` (2 s) before `phaseEndsAt` so the last score write beats the host's lock.

### The Detective and the Medium (2026-10-01)

- **Trace** (Detective, every night): two guests' phones against tonight's server log. `hit` means one of them was tonight's hand; "neither" clears them of tonight only. Delivered as `kind: 'trace'`. (The older `check` still resolves if sent, but nothing sends it.)
- **Séance** (Medium, every night once ghosts exist): one Ghost. The Medium receives `kind: 'seance'` with the Ghost's `team`, plus a copy of the Ghost's clue tonight as `kind: 'fact', via: 'seance'`. Ghost clues are always true, so a séance cannot be framed.
- With both, `npm run sim` puts the Faithful at 47–54% from 20 to 45 guests (3 Killers).

### The phone ([src/os/](src/os/))

| File | Role |
|---|---|
| [PhoneOS.jsx](src/os/PhoneOS.jsx) | The shell. Owns the open app (each phase auto-opens its app via `AUTO`; the Home button always goes home), the takeovers, badges and banners, and the phone's only chat listeners (`chat`, `mediumChat`, `denChat`); apps get them through `ctx` |
| [chrome.jsx](src/os/chrome.jsx) | Status bar (the battery is the phase timer), home screen and glass dock, home button, lock screen, slide to unlock, notification banner |
| [takeovers.jsx](src/os/takeovers.jsx) | Full-screen moments synced to `revealAt`: the role text at casting, the alarm, the recruit "incoming call", the signed-out screen |
| [apps/](src/os/apps/) | Messages (The Room, Spirits, DEEP BLUE, Unknown), DEEP BLUE (the game), News (board reveal, verdict, finale, and the paper: see [The News app](#the-news-app)), Photos (clue photos), Clock, Contacts, Notes, Night (every role's night, same icon for all), Settings, Vote |
| [game/](src/os/game/) | `physics.js` (pure, fixed 60 Hz tick, seeded course) and `DeepBlueGame.jsx` (canvas at 144×256, integer-scaled; the one 8-bit thing left on the phone) |
| [icons/](src/os/icons/), [art/](src/os/art/) | Smooth vector art: `AppIcon` (glossy iOS-style app icons), `Glyph` (UI glyphs, status-bar signal/wifi/battery), the `Wallpaper`, and `CluePhoto` (one softened CCTV still per trait group, still drawn on a coarse grid) |
| [sfx.js](src/os/sfx.js) | Every sound, synthesized (Web Audio); vibration patterns; the `astral.sfx` / `astral.vibe` preferences |
| [seen.js](src/os/seen.js) | Read marks behind every badge, in localStorage only (`deepblue.seen.*`), never Firestore; also `booted` (first boot shown) and `taken` (death screen shown) |
| [beats.js](src/os/beats.js) | When each reveal's beats land, and `useMaskedPlayers`: a player who dies in the reveal still playing reads as alive until its beat, so no phone (or Contacts, or the group chat) spoils it |
| [nav.js](src/os/nav.js), [hooks.js](src/os/hooks.js) | `useStack` (push/pop inside an app); `useWorldClock`, `useOnline` |
| [Setup.jsx](src/os/Setup.jsx) | Arrival as a phone setup assistant |

The styling is its own system: `--color-os-*` and `--font-pixel/screen/arcade` in `@theme` (all Helvetica Neue / Inter), `.os-*` classes in [src/os/os.css](src/os/os.css), imported into the components layer like App.css. See [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) Part II.

### The News app

News plays the reveal for the phase it is in (`BoardReveal`, `BanishReveal`, `Finale` in [NewsApp.jsx](src/os/apps/NewsApp.jsx), unchanged) and is **the paper** the rest of the time ([NewsPaper.jsx](src/os/apps/NewsPaper.jsx)). From a live reveal, **Paper** steps into the paper and the paper's **Latest board** button steps into the board.

- **Three sections** in an iOS 6 segmented control: *Top* (masthead, a ticker, a "from the room" strip, the lead, the next four stories), *The Room* (the live events), *Panjim* (the authored world stories, grouped by day). A story opens as an article (outlet, byline, time, a drawn picture with a caption, the body) and offers three more from its section.
- **Two feeds, one story shape** ([news.js](src/os/news.js)). *World* stories are authored in [deepblue.news.js](src/data/packs/deepblue.news.js) and unlock by **day, never by outcome**: day 0 is there from the lobby, day N lands with day N's alarm (the night before it still holds day N-1's paper), and a morning-after piece appears at the finale by winner. So every phone holds the same paper and it is true whatever happened. *Room* stories are `game.news` (the board, the vote) written up from the pack's `live` templates. No Firestore change: `game.news` is untouched.
- **A live story is held until its reveal.** The host writes a death ~5 s before the phones flip, so `useNews` drops the story being announced (and `held` hides the Latest board button) until `revealGate()`. Before this, Paper → the story headline or Latest board leaked who was taken during the hold.
- **Badges.** `useNews` is called once in PhoneOS and passed down as `ctx.news`. The home badge counts story ids not in `deepblue.seen.<gid>.news` (opening News marks the page seen); the paper's own blue dots use `<gid>.newsread` (an id is added when its article opens). Both are localStorage lists.
- **The art** is `NewsArt` ([NewsArt.jsx](src/os/art/NewsArt.jsx)): 13 drawn 16:9 scenes in the phone's blues, named by each story's `art`. The frame is `slice`d so one scene serves as a lead picture and a square thumbnail; keep the subject central.
- **Pack contract.** `pack.news = { outlets, sections, articles, epilogue, live, ticker }`. A pack with no `news` prints only the live stories; the rules for writing it (pure flavour, no real people or outlets, Greenr is only ever a bystander, no victims under 18, no method) are in the header of `deepblue.news.js` and must be read before adding an article.
- **Type.** The paper is the one place the phone uses a serif (`Georgia`, as iOS 6's reading surfaces did): `.os-news`, `.os-article`, section 17 of [os.css](src/os/os.css).

### Listeners

- Every listener is self-healing (`resilient()` in game.js, `listen()` in host.js): an error schedules a retry with backoff.
- The binding listener ignores pending local writes (see Lessons.md, 2026-09-26).

### Testing (no test framework, by design)

- `npm run emulators`: Auth and Firestore emulators under the `demo-killers` project. Needs JDK 21.
- `npm run sim`: balance simulator. Plays thousands of games through the real engine.
- `node scripts/bots.mjs --selftest --n 30 [--killer-leaves]`: a whole game, bots playing the morning run, plus 23 privacy-rule checks (7 of them on `scores`), against the emulator.
- `node scripts/bots.mjs --join 12`: 12 bots join the active game, to fill a room around real phones.

---

## Overview (Greenr, retiring)

**Application type:** Interactive multiplayer web-based murder mystery PWA  
**Framework:** React 19 + Vite 7  
**State model:** React local state + Firebase Firestore realtime sync  
**Current case scale:** 26 canonical guests, 10 pre-registered non-case guests, 10 suspects, 3 killers, 6 case files, 35 clue codes

The app shell is unchanged: one host advances the room through seven rounds while players decode clues, chat, vote and inspect guest profiles. What changed in this case is the story scale and the clue distribution: the current data layer supports a smaller guest list, a narrower suspect pool, and a three-person conspiracy without any runtime refactor.

Late arrivals use a separate real-time walk-in system. They are mechanically full players but never become part of the fixed 26-person case canon.

---

## Canonical Data Sources

### [src/data/gameData.js](src/data/gameData.js)
Owns the live case definition:

- `CASE_META` - case ID, title, venue, victim, inspector, player count, suspect count, killer count
- `CHARACTERS` - 26 canonical guests with `role`, `profession`, `bio`, `quirk`, `secret`, `neverDo`, `motive`, `timeline` and `code`
- `REGISTERED_GUESTS` - static `BYSTANDER` identities with normal player access and no story role
- `CASE_TIMELINE` - public incident beats used by the Timeline screen
- `PODS` - the 10 statement pods; `ACCUSATION_CLUES` - 10 accusation narratives whose `assignedTo` arrays cover all 26 players exactly once
- `MOTIVE_CLUES` - 10 motive files
- `EVIDENCE_CLUES` - 8 round-3 evidence items
- `REVELATION_CLUES` - 6 round-4/5 twist items
- `CONFESSION_CLUE` - final reveal text, gated by `forCharacters`
- `CASE_FILES` - 6 host-unlocked reports shown under Evidence -> Case files
- `RIDDLE_REWARD_POOL` / `riddleQueueFor()` / `nextRiddleReward()` - the prize side of the riddle lock
- `HOST_SCRIPT` - host-facing run sheet for the host console
- `LOGIN_CODE_MAP` - generated from the canonical and static registered guest rosters

### [src/data/storyIntro.js](src/data/storyIntro.js)
Owns the Round 0 public briefing only. It is spoiler-gated to knowledge available before the investigation starts.

### [src/data/screenGuide.js](src/data/screenGuide.js)
Owns per-screen kicker/title/brief/detail copy, the labels for the round-aware Evidence tabs, and `ROUND_GUIDE`.

### [src/lib/tutorial.js](src/lib/tutorial.js)
Owns the player arrival tutorial's stages, copy, permitted hub tabs and local persistence. It is deliberately browser-local rather than Firestore-backed: tutorial completion is a device-level orientation aid, not shared game state.

### [src/data/hostReference.js](src/data/hostReference.js)
Owns the structured host-only content rendered in the console:

- suspect roster
- killer jobs
- materials checklist
- round-by-round facilitation notes
- witness nudges
- objection handling
- clue-deck manifest and counts

---

## Cast Model

Each playable guest is a plain object with this shape:

```javascript
{
  id: 'char_jack',
  name: 'Jack',
  role: 'MURDERER' | 'SUSPECT' | 'WITNESS',
  profession: 'Deal Counsel',
  group: 'LEGAL',
  bio: 'Short public profile',
  quirk: 'Conversation hook',
  secret: 'Private note',
  neverDo: 'Public red line',
  motive: 'Narrative pressure',
  timeline: 'Movement log',
  code: 'OBELISK',
  isSuspect: true | false,
}
```

Important case rules:

- `role === 'MURDERER'` now resolves to a three-person team.
- Every suspect is prime in this case; there is no second suspect tier.
- The other 16 players are witnesses with load-bearing testimony or contradiction points.

---

## Multi-Killer Logic

The app no longer assumes one murderer, but the current case makes especially lean use of that support.

- `getKillers()` returns every `role === 'MURDERER'` guest, sorted mastermind-first by `KILLER_IDS`.
- `isMurderer(characterId)` checks set membership, not one fixed ID.
- `CONFESSION_CLUE.forCharacters` contains exactly the three killer ids.
- The reveal overlay and reconstruction deck work unchanged for a smaller team.

The only case-level requirement is that `KILLER_IDS` and the `role === 'MURDERER'` entries in the roster agree.

---

## Registered And Real-Time Walk-Ins

`REGISTERED_GUESTS` holds pre-event registrations in static source data. Each has a unique login code, is appended to `App.jsx`'s guest directory and is handled as a `BYSTANDER`, so it receives the deterministic bystander accusation and riddle queue without entering `PODS` or the case count.

Walk-ins are dynamic `BYSTANDER` identities, not additions to `CHARACTERS`.

- The host issues a one-time plain-word registration pass from `HostPanel`.
- The late arrival registers on their own phone using the Beautiform-derived fields: name, phone, email, profession, three traits, hidden talent and an optional confession.
- A different plain-word login code is shown once after registration; the session then enters the normal standby, briefing, chat, evidence, riddle and voting flow.
- Public profile data appears in the Guests directory under a `Walk-in` label. Phone and email are stored separately and never rendered in player-facing UI.
- Walk-ins receive a deterministic duplicate accusation and a deterministic riddle queue based on their dynamic id. They can vote for canonical suspects, but never appear as ballot candidates.
- The canonical roster, story counts, `PODS`, fixed clue decks, killer checks and final reveal continue to use `CHARACTERS` only.
- Removal marks the record inactive. It removes the identity from the directory and active tally calculation, returns that device to login on its next render, and emits a departure notice.

`App.jsx` derives three scopes: canonical story players (`CHARACTERS`), active voters (canonical plus pre-registered and active walk-ins), and directory guests (canonical plus pre-registered and active walk-ins). Keep these scopes separate when adding future features.

The project has no Firebase Authentication. Passes prevent accidental registration in the event UI but do not provide hostile-client security; the separate contact collection is private by application convention only until authenticated host access exists.

---

## Clue Model

### Categories

- `ACCUSATION` - 10 cards, automatically available in Round 1
- `MOTIVE` - 10 codes, Round 2
- `EVIDENCE` / `FORENSICS` / `CCTV` - 8 round-3 items sharing the Evidence tab
- `REVELATION` - 6 round-4/5 items
- `CONFESSION` - 1 final gated clue

### Distribution

- **Round 1** uses 10 statement pods. Each player gets exactly one accusation and its shareable code; saying both aloud and entering the code through Evidence → CODE is the first code-exchange mechanic players learn.
- **Round 2+** uses the riddle lock. Solving a riddle unseals the next clue in that player's queue and reveals its shareable code.

### Block sizes in the reward queue

The current case uses four reward blocks:

- Round 2: 10 motives
- Round 3: 8 evidence clues
- Round 4: 4 revelations
- Round 5: 2 revelations

`riddleQueueFor()` rotates each block by the player's ordinal, so the first reward in each block spreads evenly across the 26-player room instead of clustering.

### Evidence Navigation

`IntelView` is one tabbed Evidence surface, not a grid of locked stack buttons. Case files are always present. Accusations appears from Round 1, Motives from Round 2, Evidence from Round 3 and Revelations from Round 4; categories absent from the current round are not rendered. `App.jsx` keeps the selected tab in `evidenceStack`, so decoding a clue can land a player directly on its category, while the Evidence title and close behavior remain stable.

---

## Code Namespaces

`character.code`, `clue.code`, and the riddle answers in [src/data/riddles.js](src/data/riddles.js) all reach the same keyboards in practice. They must remain disjoint.

`gameData.js` keeps a dev-only assertion for:

- duplicate login codes
- clue-code collisions with login codes
- duplicate clue codes
- code collisions against riddle answers
- invalid pod partitioning
- self-targeting accusation pods

Because these checks are dev-only, a clean local build is necessary but not sufficient; they are most valuable during development and review.

---

## Waiting Screen, Round Clock and Voting

The game-start model and round clock are unchanged from the prior case:

- players log in onto a waiting screen
- the host starts the room with a shared 10-second countdown
- the start is stored as an absolute instant, not a boolean
- the round clock is host-written and player-read only
- a round clock reaching zero automatically starts a host-configured ballot on every player device (five minutes by default)
- the ballot and its public result are derived from the clock's absolute end instant, so neither transition creates client writes or drifts on reload
- when the ballot ends, a locked result takeover shows the cumulative tally through that round and every voter-to-candidate choice
- the host's round and timer controls remain available during ballot and results as a recovery override; normal post-results advances remain confirmation-free, while off-script moves require confirmation
- changing a round with a live clock restarts it for that round; an expired clock stays armed and stopped so the host can set the next duration before starting it
- ballot presets use the same shared timer record and can be set before a round ends or while its ballot is open; changing one immediately recalculates every ballot countdown

## Player Tutorial

After the Round 0 typed briefing, `App.jsx` reads `astral.tutorial.v1` through `lib/tutorial.js` and restricts `GridMenu` to the current lesson's tabs. The sequence is identity, guest profile, Comms, voting and, in Round 1, Evidence. Each task pairs its copy with a small semantic sketch from `DoodleTutorial` in `components/ui/Doodles.jsx`, showing the destination's core interaction before the player opens it. The Dossier lesson only completes after a player opens a guest profile; every other lesson completes when its assigned screen is closed through the standard header route. The state is keyed by player id in `localStorage`, survives reloads and never mutates Firestore during ordinary play.

The active hub tile and the exact in-screen tutorial target use the finite `er-tutorial-target` spotlight: three outline blinks, followed by a persistent focus ring. Ink controls also carry a compact label; paper targets retain their existing grain and pushpin pseudo-elements, so the ring is intentionally the universal cue there. This makes the teaching action explicit without introducing a permanent pulse; reduced-motion mode collapses the animation but retains the focus ring.

`resetGameState()` writes the shared `tutorialResetAt` timestamp alongside its existing force-refresh broadcast. A client that sees a newer marker clears the local tutorial ledger before reloading, so every player receives a fresh walkthrough for each host-reset game. Ordinary **Force Sync All Players** broadcasts do not change tutorial state.

`tutorialStageForRound()` lifts any unfinished player to the Evidence lesson at Round 1. That prevents a late joiner or someone who did not finish the Round 0 walkthrough from being blocked from their accusation. Once the Evidence lesson is completed, the standard complete board is restored; clue availability remains governed by the existing round gates.

## Full Game Reset

**Reset game** is a two-phase Firestore operation. First `gameState/current.resetInProgress` holds all player screens; then it clears the current room's cast votes, unlocked clues, released files, host-revealed clues, reveal/end state, timer, messages, walk-ins, walk-in passes and stored walk-in contacts. Only after those writes and deletions succeed does it publish fresh Round 0 standby state and force every device to reload.

That final reset broadcast clears per-game browser ledgers too: tutorial progress, solved riddle history, Comms read watermark and the one-time ASK cue. Sessions remain persisted so players do not need to re-enter their character code; the SFX preference also remains a device preference. The canonical character roster and static case data are never stored in Firestore and are therefore unchanged.

## Host Portal

Players use the main app URL and remain behind the standby gate until the host
starts the room. The host uses `/mystery-game/host`; that route intentionally
ignores any persisted player session and shows a host-only credential form before
opening the console. [public/404.html](public/404.html) restores direct GitHub
Pages requests for that route into the Vite SPA.

This matters because the current 26-player case still relies on staggered arrivals, late joiners and a host-controlled pace.

---

## Validation Targets For This Case

When editing the current case, validate these first:

1. 26 characters present, unique ids, names and login codes
2. 3 killers present and ordered mastermind-first in `KILLER_IDS`
3. 10 suspects present, matching the accusation and motive decks
4. 10 accusation pods partition the roster exactly and no pod receives its own member's accusation
5. clue counts stay aligned with the host docs and clue manifest
6. login codes, clue codes and riddle answers remain disjoint

The cheapest high-signal checks remain:

- diagnostics on the touched data files
- `npm run build`
- `npm run lint`

---

## Current Story-Sensitive Surfaces

Any story change must be synchronized across at least these files:

- [src/data/gameData.js](src/data/gameData.js)
- [src/data/storyIntro.js](src/data/storyIntro.js)
- [src/data/hostReference.js](src/data/hostReference.js)
- [STORY.md](STORY.md)
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
- [CLUE_CODES.md](CLUE_CODES.md)

If the reveal deck or projector deck is used, they must be updated in the same pass as well.