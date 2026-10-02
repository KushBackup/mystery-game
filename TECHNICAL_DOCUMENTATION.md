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

### The game clock (2026-10-02)

[src/lib/engine/clock.js](src/lib/engine/clock.js), pure like the rest of the engine.

- **Planning.** `planEvening({ minutes, cycles, games, base })` runs at Setup. The fixed phases (casting, alarm, the day's game, dawn, banish, all with their reveal hold) are summed; the flexible ones (`night`, `investigation`, `roundtable`, `endgame`) are scaled by one factor, clamped to 0.25–4, so the total is `minutes` from the deal to the finale. Re-votes and recruit calls are not in the sum (about a minute each when they happen). It also picks `clock.speed` (game ms per real ms) so the average day fills 07:00 to 22:00. `minutes: null` keeps `base` as it is (the Quick test).
- **Storage.** `config.durations`, `config.clock = { speed, castAt, nightAt, alarmAt }` and `config.minutes` on the game doc. Every phase write (`timed` in host.js) also writes `clockAt`, the game minute the phase starts at, counted from 00:00 on day 0. `clockAtStart` carries the clock on from the previous phase, except that casting starts at 21:00 on day 0, a night at 01:00 and an alarm at 07:00 of its day (never backwards).
- **Reading.** `clockNow(game, now) = clockAt + (min(now, phaseEndsAt) − phaseStartedAt) × speed`. It stops at `phaseEndsAt`, so a host who advances late does not shift the schedule, and untimed phases hold still. Locked phases keep their parent's timing, so the clock carries on through them. `daySchedule` gives today's parts with their times (actual for parts already started, planned from now for the rest); the Clock app, the NowCard and the morning notification read it.
- **Old games** have no `config.clock`; `clockNow` returns null and the phone falls back to the fixed `WORLD` table in [words.js](src/os/words.js).
- **Autopilot** (`game.autopilot`) is on from `createGame`: the console presses Next 400 ms after `phaseEndsAt`. It lives in the console tab, so that tab must stay open.

### The morning (DEEP BLUE, 2026-09-30)

Killers murder by rigging the morning run's leaderboard, so a day resolves in two halves.

1. **Night locks.** `resolveNight` decides the victim, the hand, the rig value (`zero` or `under`), saves, traces, séances and the night's facts. Since 2026-10-02 the phone sends only the Killers' victim (or recruit) vote. The hand rotates (`rotateHand`: the living Killer with the fewest entries in `secret.hands`, ties by seed), the rig falls back to `zero`, and the frame is off (`DEFAULT_NIGHT_CONFIG.autoFrameFrom: null`; a number turns on an engine-chosen frame for that one night, but the sim puts the Faithful at 27–49% with it). A den doc that still carries `hand`, `rig` or `frame` wins over the automatic choice. Nothing is written for players except a recruit offer; the whole result is stashed in `secret.pendingMorning`.
2. **Alarm** (20 s: a notification and a short ring, never a takeover) then **game** (90 s). Playing is optional; a guest without a score counts as 0 (`resolveMorning`). Every phone plays the same seeded course (`game.courseSeed` + the day, attempt `n` → course `${seed}:${n}`). Each phone writes `scores/{cycle}_{pid}` only on a new best, and always on its first run.
3. **Game locks.** The host reads every score from the server and runs `resolveMorning` ([src/lib/engine/morning.js](src/lib/engine/morning.js)):
   - The rig lands: the target dies (`cause: 'murdered'`) and their row shows the rigged value, last.
   - The Firewall held (Doctor): the lowest living honest score dies instead (`cause: 'deep'`), protected guests excepted, ties by seed; a guest who never played scores 0. It can take a Killer, whose role stays hidden.
   - The top 3 living scorers each receive one of the night's facts (`via: 'top'`).
4. **Dawn** is one commit: deaths, `game.board`, the `news` log entry and every held delivery land together, so no clue arrives before the board.

The run stops `GAME_GRACE_MS` (2 s) before `phaseEndsAt` so the last score write beats the host's lock.

### The morning games: Word, Sketch, Run (2026-10-02)

The game phase plays one of three games, rotated by day. The rules live in [src/lib/engine/minigames.js](src/lib/engine/minigames.js), which is pure and seeded.

- **Which game.** `gameOfDay(config, cycle)` reads `config.games`, which defaults to `['word','draw','run']`. The host console can set it to `['run']`.
- **Choosing the game.** The host picks the game in the commit that rings the alarm (`planDayGame` in host.js). That is the night commit, or the recruit commit on a recruit night, so a guest recruited tonight gets the Killers' hint. The same commit writes `game.minigame` and one inbox card per living guest with a role (`{cycle}-day-{pid}`), and records the answers in `secret.day.{cycle}`. Ghosts get no card.
- **Timing.** The phase lasts `durations.game_word` (125 s) or `game_draw` (140 s); see `gameSpan` in phases.js. Inside it, every phone derives the same step from `revealAt` with `stepAt()`:
  - Word: read 10 s, clue 60 s, pick 50 s.
  - Sketch: draw 45 s, guess 90 s.
  - If the phase is shorter (the Quick pace), the steps shrink in proportion.
  - The last step never runs past the phase.
- **Scoring.** When the game locks, `dayScores` in host.js reads the day's plays and turns them into `{pid: {best}}`:
  - Word: clues and picks, through `scoreWordDay`.
  - Sketch: drawings and guesses, through `scoreDrawDay`. The host checks the typed text against the real word, with plurals and listed alternatives.
  - Run: the score docs, as before.

  `resolveMorning` then runs unchanged, and the dawn commit also publishes `game.dayGame` (the word, or who drew what).
- **On the phone.** [GameApp.jsx](src/os/apps/GameApp.jsx) routes on `game.minigame`:
  - [WordGame.jsx](src/os/game/WordGame.jsx) shows the card, the one-clue form and the live wall. Clues stream in `serverTimestamp` order, numbered. Picks are tap-to-toggle, up to 3.
  - [DrawGame.jsx](src/os/game/DrawGame.jsx) shows the pad, then the guessing. Strokes are encoded by [strokes.js](src/os/game/strokes.js): hex points on a 256-unit board, about 4 characters per point. The pad autosaves every 1.5 s, and once more when the step ends.
  - Guessing follows `assignDrawings`, a wheel over the inked drawings seeded by the public `courseSeed`, so each drawing gets about the same number of guessers. It follows the drawings as they arrive. Do not freeze the list on the first snapshot: that snapshot can come from the phone's own cache and hold nothing but its own drawing.
  - After the lock, the wall or the drawings stay up, with the answers, until the next night.
  - The shared step bar and the drawing renderer are in [dayParts.jsx](src/os/game/dayParts.jsx), and the step hook is in [dayStep.js](src/os/game/dayStep.js).
- **Words.** `dayGames`, `wordPairs` and `drawWords` live in the pack ([deepblue.js](src/data/packs/deepblue.js)). `dayKit(pack)` falls back to DEEP BLUE's words for a pack that has none.
- **Trust.** It is the same as the run's: a phone writes its own plays. Two limits are known:
  - `checks` is a short hash of a word from a bank of about 110, so a devtools user could brute-force a drawing's word.
  - A clue can only be checked for giving the word away on a Faithful phone; the host zeroes it at scoring.

  Neither one reveals a role.

### The finale: how it happened (2026-10-02)

- **What the host keeps.** Each night's resolution also writes `secret.nights.{cycle}`: the Killers' victim (or recruit target), the hand, the rig, the frame (`resolveNight` now returns `frame`) and the firewalled guests. Host-only, like the rest of `secret`.
- **What the host publishes.** `finaleOf(world)` in [host.js](src/firebase/host.js) adds `finaleRoles` and `finaleStory: { nights, hands }` to the game doc in the same write that sets a winner, and never before. `bots.mjs --selftest` fails a run if either appears without a winner.
- **What the phone shows** ([Finale.jsx](src/os/apps/Finale.jsx), three synced beats via [stage.js](src/os/apps/stage.js)): the headline, then the Killers' faces and fates, then *your night* (role, whether your team won, how you went), **How it happened** (night by night: who the Killers chose, who hacked and what the photos described, rig, frame, firewall; then the morning and the vote, from `game.news`), and every guest's role. Ends on the morning-after paper.

### Atmosphere and reading aids (2026-10-02)

Added in one autopilot pass the user asked for ("make it feel detailed and rich"). None of it changes a rule; all of it is per-phone.

| Piece | Where | What |
|---|---|---|
| **Faces everywhere** | `Face` in [Portrait.jsx](src/os/art/Portrait.jsx) | The Contacts photo (its head-and-shoulders crop) now marks a guest on the board podium, the taken row, every board row, the verdict, the vote list and the finale, so the room recognises the same face in every app |
| **The poll shows looks** | `GuestPicker traits` in [ui.jsx](src/os/ui.jsx), `lookLine` in [dossier.js](src/os/dossier.js) | Each row in the vote: face plus "Black top · glasses · Sneakers" (public answers only) |
| **Your place** | `MyPlace` in [NewsApp.jsx](src/os/apps/NewsApp.jsx) | After the board: your score and rank, with a warning tone two places or fewer above the deep |
| **The hand, per night** | `HandProfile` in [GalleryApp.jsx](src/os/apps/GalleryApp.jsx) | Photos lays each night's clue groups over each other (they all describe one hand) and draws a sketch: what is known, and "photos disagree" when a frame makes two clues incompatible. It never names or filters guests (see memory.md: auto-matching was deliberately not built) |
| **DEEP BLUE's voice** | [voice.js](src/os/voice.js), `pack.voice` | The app talks to each guest in its Messages thread. Above everything sits `voice.manifesto`: DEEP BLUE declaring itself justice, dated years before tonight (`Nov 3, 2023 03:33` stamp), static, never stored and never unread (`old: true`, ordered ahead of the role message by threads.js). Then lines at nightfall, when the morning game opens (`play:c`, alarm/game: "we are watching you until you play"), after the board (rank-based), after the verdict, at the finale. Derived on the phone from what has already been revealed, never role-specific, kept in localStorage `deepblue.seen.<gid>.voice` so older lines survive the next board. Counts toward the Messages badge, never a banner |
| **Help** | [HelpApp.jsx](src/os/apps/HelpApp.jsx), [helpCopy.js](src/data/helpCopy.js), [HelpSketch.jsx](src/os/art/HelpSketch.jsx) | The rule book (2026-10-02): a "game in 30 seconds" card, then 22 pages in reading order (basics, each step of the day, the three morning games, every role, clues, the phone, a glossary, quick answers). Each page is short lines plus a ballpoint doodle drawn as seeded inline SVG that inks itself once on open. A small page stack: a row or link pushes, Next swaps to the following page so Back never walks the whole book. Role-neutral: the only live input is the public phase, which tags the current step "Now". Words must stay true to the engine files named in helpCopy.js's header |
| **Weather** | [WeatherApp.jsx](src/os/apps/WeatherApp.jsx), [weather.js](src/os/weather.js), `pack.weather` | Panjim's sky worsens on a fixed curve by edition day (like the paper); only the finale's sky depends on the winner. The alarm shows one line of it |
| **Role emblem, night headcount** | [takeovers.jsx](src/os/takeovers.jsx), [NightApp.jsx](src/os/apps/NightApp.jsx) | A glossy emblem on the private role text; the Night app's top card shows how many are still in the game and how many were taken (same on every phone) |

### Discovery: the phone nudges, never opens (2026-10-02)

The user wanted players to discover the mechanics rather than be told them. Rules for anything on the phone:

- **No auto-open.** A phase change never sets the open app. `SUGGEST` in PhoneOS maps a phase to its app for the NowCard tap only. The alarm is a notification (`PHASE_BANNER.alarm`, a `long` banner that wraps and stays 7 s) plus a 3 s ring; the morning game's deadline, on the game clock, is in that banner, the game banner, the NowCard and a "Needs You" row in Notification Center.
- **Phase banners.** `PHASE_BANNER` adds a banner item at the phase start for the morning game, dawn, banish, finale and each vote. It is shown only if the phone was open before the phase began (the existing `mountAt` rule) and not while that app is open. Banners never carry a name, because a phase starts seconds before its reveal's beat. Each banner id plays once (`shownBanner`), so leaving the app that hid it doesn't replay it.
- **The Killers' group** ([threads.js](src/os/threads.js)). A living Killer gets a `den` thread over `denChat`, titled with the other living Killers' names ("Maya & Arjun"; from the masked roster). Its list also carries synthetic items that count as unread: "DEEP BLUE added you" (at `killers/{pid}.at`, so it fires at the deal and again for a recruit), "DEEP BLUE added {name}" for a recruited partner, and tonight's poll while the phase is `night`. That is what raises the Messages badge and the banner. `subscribeKillers` now returns the docs (`{ id, at, recruited }`) instead of bare ids. No rule changed: Killers could already read `killers/` and read/write `denChat` and `den`.
- **The poll** ([KillPoll.jsx](src/os/apps/KillPoll.jsx)). Living non-Killers through `GuestPicker`, each partner's pick named beside the guest, `submitDen({ victim })` (or `{ recruit }` on a recruit night, `pollQuestion` in threads.js). It is a bubble in the group with a pinned bar that scrolls to it, and the whole Night app for a Killer.
- **The role message** ([RoleMessage.jsx](src/os/RoleMessage.jsx)). The role at casting arrives sealed: blurred, opened by a tap, closed by another. Sealed, it renders the same stand-in text on every phone (the real role isn't in the DOM), so sealed bubbles are pixel-identical; open, every role has the same colours, font and fixed height. The same message stays as the first item of the DEEP BLUE thread after the old manifesto (`kind: 'role'` in threads.js, list row "Your role. Read it alone."). The red Killer bubble and the per-role emblem are gone.
- **Copy.** `ROLE_CARD` is one line per role (no `tip`). `nowLine` takes no role: the home screen must read the same on every phone. The Night app is the exception (2026-10-02): every move explains itself from `NIGHT` in killersCopy.js. [NightApp.jsx](src/os/apps/NightApp.jsx) has three screens per role, chosen by `useNightNav`: the list of moves (`MoveCard`), a move in full (`MoveHead` + `HowTo` + the picker, pushed in), and the saved move (`Done`, with Change my move). The saved move shows from this phone's own copy at once (`local`), and falls back to the list if the write is refused. The Doctor and the Ghost have one move, so they open on it; the Killer sees the explanation above `KillPoll`, which now shows faces. Footnotes that explained a mechanism are gone from Vote, Gallery, Contacts, Clock, the Taken screen, the board and the pack's narration and paper lines. The Finale is untouched.

### The Detective (2026-10-01)

- **Trace** (Detective, every night): two guests' phones against tonight's server log. `hit` means one of them was tonight's hand; "neither" clears them of tonight only. Delivered as `kind: 'trace'`. (The older `check` still resolves if sent, but nothing sends it.)
- **The Medium is removed (2026-10-02).** It held a séance with one Ghost each night: the Ghost's `team`, and a copy of that Ghost's true clue. It was cut as a passive role that added little (PROJECT_CONTEXT.md, Roles). Removed with it: `ROLE.MEDIUM` and the `medium` count in [roles.js](src/lib/engine/roles.js) (the deal and late joiners), the `seance` action in [night.js](src/lib/engine/night.js), the `seance` delivery and the `via: 'seance'` fact, the Night move, its Help page and doodle, and the bot and sim behaviour. A game dealt before the change is still safe: an unknown role falls back to the Faithful card, and a `seance` action left in Firestore resolves as a dig through the logs.
- **Spirits is the ghosts' own chat.** The channel is renamed from `mediumChat` to `spiritsChat`, and only ghosts (and the host) can read it or post in it. `bots.mjs --selftest` checks it once a ghost exists.
- Without the Medium, `npm run sim` puts the Faithful at 47–58% from 20 to 45 guests (3 Killers), 63% at 16.

### The phone ([src/os/](src/os/))

| File | Role |
|---|---|
| [PhoneOS.jsx](src/os/PhoneOS.jsx) | The shell. Owns the open app (only ever the guest's choice: no phase opens an app, see [Discovery](#discovery-the-phone-nudges-never-opens)), the takeovers, badges and banners (including one per phase start, `PHASE_BANNER`), and the phone's only chat listeners (`chat`, `spiritsChat`, `denChat`) plus the Killers' group (`useKillerGroup`, `ctx.mates`); apps get them through `ctx` |
| [chrome.jsx](src/os/chrome.jsx) | Status bar (the battery is the phase timer), home screen and glass dock, home button, lock screen, slide to unlock, notification banner |
| [takeovers.jsx](src/os/takeovers.jsx) | Full-screen moments synced to `revealAt`: the role text at casting, the recruit "incoming call", the signed-out screen. (The alarm was one until 2026-10-02.) |
| [Splash.jsx](src/os/Splash.jsx), [splashFilm.js](src/os/splashFilm.js) | What every phone plays at the deal (2026-10-02), as one 22.25 s muted video, `public/splash/deal.mp4` (2.5 MB): the hand-drawn title film on white ("Astral Project presents", "in collaboration with Greenr", then a crime scene for "The Deep Blue Case": black sea, red moon, crime-scene tape, a CASE stamp, a shadow under the water) and the intro (a creator-style guest walks a night street on her phone, loses the morning game, is taken; "Who did this?"; white). Authored in [splash-film/](splash-film/) as two films, joined at encode. The phone fetches it to a blob URL while the guest is in the lobby (`preloadSplash`; the service worker does not precache mp4). It fills casting's held beat: `revealLead('casting')` is `SPLASH_MS` (22.3 s, phases.js) instead of the usual 4 s, so the role text arrives as the video ends and the reading time after it is unchanged. Passed to `PhoneFrame` as `cover`, so it hides the status bar too. The video is sought to the time gone since the deal and corrected if it drifts more than 0.3 s, so every phone shows the same frame and a reload rejoins it; a phone opened after it never sees it. Reduced motion, or a refused `play()` (iOS Low Power Mode), shows one still per beat instead (`STILLS`, seven of them). The lift is a timer plus a CSS transition, not an animation delay, because App.css's reduced-motion rule zeroes every delay. Its screen-reader label is `SPLASH` in killersCopy.js plus the pack's `caseTitle` |
| [apps/](src/os/apps/) | Messages (The Room, the Killers' group, Spirits, DEEP BLUE with its voice, Unknown), `KillPoll.jsx` (the Killers' night poll, in their group and in Night), DEEP BLUE (the game), News (board reveal, verdict, finale in `Finale.jsx`, and the paper: see [The News app](#the-news-app)), Photos (clue photos and each night's hand), Clock, Contacts (every guest's answers: see [The Contacts app](#the-contacts-app)), Notes, Night (every role's night, same icon for all), Weather, Settings, Vote. `stage.js` holds the synced-beat hooks the reveals share |
| [game/](src/os/game/) | `physics.js` (pure, fixed 60 Hz tick, seeded course) and `DeepBlueGame.jsx` (canvas at 144×256, integer-scaled; the one 8-bit thing left on the phone) |
| [icons/](src/os/icons/), [art/](src/os/art/) | Smooth vector art: `AppIcon` (glossy iOS-style app icons), `Glyph` (UI glyphs, status-bar signal/wifi/battery), the `Wallpaper`, `CluePhoto` (one softened CCTV still per trait group, still drawn on a coarse grid) and `Portrait` (a contact photo drawn from a guest's answers: `portraitArt.js` paints a seeded, full-length hand-drawn canvas picture of the guest at home, 300 × 400; `Portrait.jsx` crops it for lists, caches static frames by guest + answers + pixel size, and in Setup brushes a changed answer on over 640 ms, held on twos, skipped under reduced motion) |
| [sfx.js](src/os/sfx.js) | Every sound, synthesized (Web Audio); vibration patterns; the `astral.sfx` / `astral.vibe` preferences |
| [seen.js](src/os/seen.js) | Read marks behind every badge, in localStorage only (`deepblue.seen.*`), never Firestore; also `booted` (first boot shown) and `taken` (death screen shown). It is also **the phone's saved state** (2026-10-02): everything a reload or a reopened browser should come back to is kept here, per game id (see *What survives a reload*). `peekSeen` reads a value outside React (a state's first value); `useDraft` is a text field that survives a reload |
| [beats.js](src/os/beats.js) | When each reveal's beats land, and `useMaskedPlayers`: a player who dies in the reveal still playing reads as alive until its beat, so no phone (or Contacts, or the group chat) spoils it |
| [nav.js](src/os/nav.js), [hooks.js](src/os/hooks.js) | `useStack` (push/pop inside an app); `useWorldClock`, `useOnline` |
| [Setup.jsx](src/os/Setup.jsx) | Arrival as a phone setup assistant, with the guest's full-length contact photo large above every question (sized to the screen, 120 to 280 px wide) (`ProfileCard`, [Portrait.jsx](src/os/art/Portrait.jsx) with `animate`); the first question is gender (`GENDER` in data/traits.js: photo only, outside `TRAITS` so the engine never clues it; never edited after arrival), then the six. It works like a character creator: options are two-to-a-row chips (`.os-chip`), a tap brushes that answer into the photo at once (a gender change fades the old figure off the new one), and a footer **Next** moves on, so a guest can try options on before choosing; and "Almost done" shows the finished photo large. Tapping an answer there opens that question's options in an `ActionSheet` and stays on the review (it used to jump back to that question and walk forward again). **My phone is ready** writes the answers once; they are never edited after (see Contacts) |

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

### The Contacts app

Contacts is the room's directory and **the file on every guest** ([ContactsApp.jsx](src/os/apps/ContactsApp.jsx), words and record in [dossier.js](src/os/dossier.js)).

- **Deliberately plain (2026-10-02).** A first pass added search, a Tables view, a Marked view, a Suspect/Trusted read, private notes, a vote button and a public record. The user said it was too detailed for players and asked for name, photo, their answers, plus the one thing worth keeping. All of that was cut; see memory.md for why, before adding any of it back.
- **The list.** Grouped by status only: In the room / Ghosts / Went home, alphabetical within each. Each row has the head-and-shoulders crop of the guest's `Portrait` (top colour and glasses read at that size) and their table. The card shows the whole photo.
- **The card** (Info): the photo, name, status or fate, table. Then the six answers as plain iOS contact fields (no visible/hidden split in the UI — `trait.visible` only changes the sheet's wording). Tapping someone else's answer opens an action sheet to mark it: "Matches what I see" / "They said: Beer" / "Something not on the list", shown inline under the answer. At the finale, everyone's role is not shown (cut with the rest; the finale reveal screens already cover it).
- **The photo full screen.** Tapping someone else's photo on their card opens `PhotoViewer` (in ContactsApp.jsx, `.os-viewer` in os.css) as the card's `overlay`: black, like iOS 6 Photos, the whole drawing fitted to the phone, their name and Done in a glass bar. Tap anywhere or Done to close. The canvas is drawn at the fitted width (measured with a ResizeObserver), not scaled up from the card's 116 px print, so every answer reads sharp. Your own photo on My Card is not tappable.
- **The file vs your marks.** The six answers are `traits/{pid}`, **public since 2026-10-02** and written once at arrival, never edited (2026-10-02), read by one listener in PhoneOS (`useAllTraits`, `ctx.traits`). They are what a guest *said*, so each answer can be checked from the card through an action sheet: "Matches what I see", "I see: grey", "Something not on the list" (for an answer the form didn't offer, or a lie). A mismatch shows as a red line on the card and an eye flag on the list. Reads, checks and notes live in localStorage only (`deepblue.seen.<gid>.contacts.{reads,checks,notes}`), never Firestore.
- **My Card** shows your own file as every phone sees it, read-only. Answers (gender included) are locked from arrival (the user's call, 2026-10-02): the rules allow `traits` a `create` and no `update`. There are two ways to change them, both before the deal: the guest taps **Leave the game** in Settings (`leaveBeforeStart`: it deletes their player, traits and binding, and the phone goes back to set-up as a new guest), or the host removes them (`removePlayer` in the lobby, which now deletes the binding too, so the phone isn't stuck on "Finding your seat"). After the deal, leaving and removal mean vanishing at the next dawn, and that phone stays signed out.
- **The record** reads `ctx.news.entries`: the raw `game.news` entries `useNews` has already released past `revealGate()`, so a card cannot show who was taken or banished before the reveal says so. The host's dawn entry carries `places` and the verdict entry `votes` for this.
- **Shared pieces** it added to [ui.jsx](src/os/ui.jsx): `Seg` (segmented control, `plain` for the light in-list style), `ActionSheet` (passed to `AppFrame` as `overlay`).

### What survives a reload (2026-10-02)

The user asked that a refresh, or closing and reopening the browser, never lose a guest's place. Two layers do it:

- **Who you are and the game itself.** The anonymous Firebase session is kept in IndexedDB (`browserLocalPersistence`), and Firestore keeps a persistent local cache (`persistentLocalCache`), both in [app.js](src/firebase/app.js). A reload is the same uid, so the same binding, role, votes, moves and scores, which all live in Firestore. `?tab=1` (testing only) keeps the session per tab instead.
- **What only this phone knows.** These are kept in localStorage through seen.js, every key starting with the game id:

| Key | What it keeps | Where |
|---|---|---|
| `<gid>.setup` | Setup's step, name and answers, cleared on arrival | Setup.jsx |
| `<gid>.knock` | "Waiting for the host to sign me back in", and as whom | Setup.jsx `SignBackIn` |
| `<gid>.unlocked`, `<gid>.roleRead` | The lobby lock screen was slid, and the role card was read, so neither replays | PhoneOS.jsx |
| `<gid>.app` | The open app (and Messages thread); the Night app is dropped outside the night | PhoneOS.jsx |
| `<gid>.page.{contacts,messages,notes}` | The open page inside an app (`useStack(initial, keep)` in nav.js) | the apps |
| `<gid>.draft.<channel>`, `<gid>.draft.clue.<cycle>` | Half-typed messages and the Word clue, until sent | MessagesApp `Compose`, WordGame `ClueForm` |
| `<gid>.draw.<cycle>` | The Sketch drawing so far. Without it a reload started a blank pad that the autosave then wrote over the real drawing | DrawGame `DrawStep` |
| `<gid>.guessSeen.<cycle>`, `<gid>.guessShown.<cycle>` | Which drawings you have been shown, and when the current one appeared, so a reload neither replays one nor restarts its clock | DrawGame `GuessStep` |

Not kept: a Run in progress (each finished run's score is already posted), and a Sketch guess half-typed (each drawing is on screen for seconds).

### Signing a phone back in (2026-10-02)

A guest whose phone lost the game (cleared data, a new phone, a private tab, or the home-screen app, which has its own storage separate from the browser's) is a new anonymous uid with no binding, so they land on Setup.

- **Phone.** The hello screen has *Already playing? Sign back in*. The guest types the name they joined with; the phone writes `knocks/{uid}` (`knock` in game.js) and shows its code (`deviceCode`: the uid's first six characters, upper case) while it waits. The wait is kept in `<gid>.knock`, so a reload asks again.
- **Host.** The console shows a *Sign back in* card when any knock is open (`subscribeKnocks`). Each row preselects the guest whose name matches and offers everyone not vanished; *Sign in* runs `relink`, which writes `bindings/{uid}` → that pid and deletes the knock. The phone's binding listener then opens the game by itself. *Ignore* deletes the knock.
- **Leaving is final** (the user's call): a vanished guest is never offered, and a phone that left stays on *Signed out*.
- **Rules.** Only an unbound phone can knock; only it and the host can read the knock. Before this, `relink` had no UI and would have been refused anyway, because only a phone could create its own binding. The host can now create a binding too.

### Listeners

- Every listener is self-healing (`resilient()` in game.js, `listen()` in host.js): an error schedules a retry with backoff.
- The binding listener ignores pending local writes (see Lessons.md, 2026-09-26).

### Testing (no test framework, by design)

- `npm run emulators`: Auth and Firestore emulators under the `demo-killers` project. Needs JDK 21.
- `npm run sim`: balance simulator. Plays thousands of games through the real engine.
- `node scripts/bots.mjs --selftest --n 30 [--killer-leaves]`: a whole game, bots playing every morning game in the rotation (Word, Sketch, Run, Word, Sketch), plus privacy-rule checks against the emulator: 74 checks in all at --n 30 (15 in the lobby: answers can't be edited, leaving or being removed lets a guest join again, and a signed-out phone can be signed back in).
  - 5 are on `scores`.
  - The `traits` checks assert that answers are readable by everyone, but writable only by their owner and only before the deal.
  - The Word and Sketch checks cover:
    - one clue each, never edited;
    - picks, guesses and other guests' words staying private;
    - ghosts posting no clue;
    - each collection being shut outside its own day.
  - The test fails if `game.dayGame` appears before the lock.
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