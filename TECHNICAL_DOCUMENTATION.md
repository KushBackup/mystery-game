# Astral Project's Murder Mystery Experience
## Technical Documentation

> Maintenance note: Update this file whenever the architecture, data model, shared state, or screen behavior changes. This is the implementation overview for the current 51-player Goa venue case.

---

## Overview

**Application type:** Interactive multiplayer web-based murder mystery PWA  
**Framework:** React 19 + Vite 7  
**State model:** React local state + Firebase Firestore realtime sync  
**Current case scale:** 51 playable guests, 10 prime suspects, 5 killers, 6 case files, 34 clue codes

The app remains structurally the same as the earlier versions: one host advances the room through seven rounds while players decode clues, chat, vote, and inspect guest profiles. The major implementation change in this version is narrative scale. The data layer now supports a 51-player cast and a multi-killer reveal instead of a single murderer.

As of 2026-08-07, clue codes are no longer distributed on printed cards. They are earned in-app through the **riddle lock** — see [The riddle lock](#the-riddle-lock) below.

---

## Canonical Data Sources

### [src/data/gameData.js](src/data/gameData.js)
Owns the live case definition:

- `CASE_META` — case ID, title, venue, victim, inspector, player count, suspect count, killer count
- `CHARACTERS` — 51 playable guests with `role`, `profession`, `bio`, `quirk`, `secret`, `neverDo`, `motive`, `timeline`, and `code`
- `CASE_TIMELINE` — public incident beats used by the Timeline screen
- `ACCUSATION_CLUES` — 10 accusation narratives with `assignedTo` arrays covering all 51 players exactly once
- `MOTIVE_CLUES` — 10 prime-suspect motive files
- `EVIDENCE_CLUES` — 7 round-3 evidence items
- `REVELATION_CLUES` — 6 round-4/5 twist items
- `CONFESSION_CLUE` — final reveal text, gated by `forCharacters`
- `CASE_FILES` — 6 host-unlocked reports shown under Evidence → Case files

#### Display order (`dealt()`)

Source order in the file is authorial: the five conspirators are written first, and the per-suspect clue decks follow the same sequence. That leaked — Sneha sat at the top of the roster, the ballot, the accusation stack and the motive stack before a single clue was decoded.

`dealt(list, { salt, isHot, safeTop, group })` re-orders a deck at module load and the exported constants (`CHARACTERS`, `ACCUSATION_CLUES`, `MOTIVE_CLUES`, `EVIDENCE_CLUES`, `REVELATION_CLUES`) are the dealt versions — every consumer inherits the jumble, so there is no per-screen shuffling to keep in sync. The raw literals stay in the file as `ROSTER`, `ACCUSATION_DECK`, `MOTIVE_DECK`, `EVIDENCE_DECK`, `REVELATION_DECK`.

- **Stable, not random.** The order comes from a hash of each entry's `id`, so every player on every device and every reload sees the same sequence. "The third one" in chat keeps meaning the same person, and a guest's file number never changes mid-game.
- **`salt` must be mixed, not concatenated.** `acc_sneha` and `mot_sneha` differ by a fixed same-length prefix, so a concatenated salt shifts every hash in a deck by one constant and leaves the relative order untouched — the accusation and motive stacks would deal out identically. `seeded()` XORs the two hashes and avalanches the result.
- **`isHot` + `safeTop`** keep conspirators out of the opening slots (the first screenful of Suspects, the first row of the ballot grid, the top of the round-1 and round-2 stacks). Evicted entries re-enter at a hashed slot below the clean zone, not at a fixed midpoint, so they don't band up. Eviction re-checks after every move: removing an entry slides the rest up, which can push a hot entry above the line.
- **`group`** is a primary sort key that survives the jumble. `REVELATION_CLUES` groups on `roundReq` so the Round 5 twist pair stays behind the Round 4 documents.
- `CASE_FILES` is deliberately **not** dealt — it names no suspect and is already ordered by unlock round.
- `RIDDLE_REWARD_POOL` / `riddleQueueFor()` / `nextRiddleReward()` — the riddle lock's prize side (see [The riddle lock](#the-riddle-lock))
- `HOST_SCRIPT` — host-facing run sheet for live facilitation
- `LOGIN_CODE_MAP` — generated from the character roster

### [src/data/storyIntro.js](src/data/storyIntro.js)
Owns the Round 0 public briefing only. It is spoiler-gated to knowledge available before the investigation starts.

### [src/data/screenGuide.js](src/data/screenGuide.js)
Owns per-screen kicker/title/brief/detail copy, labels for the five Evidence stacks, and `ROUND_GUIDE` — one line per round saying what that round is for.

`ROUND_GUIDE` has two readers and no third copy: [HelpView](src/components/views/HelpView.jsx) prints the whole list (titles come from `ROUNDS` in gameData.js, not retyped), and `roundTip()` prints the live round's line into the chrome rail's tooltip. Both were hardcoded lists before, which is a rewording away from the app contradicting its own rulebook mid-game.

### [src/data/tooltips.js](src/data/tooltips.js)
Owns every tooltip's copy (`TOOLTIPS`) plus the one generated tip (`roundTip(currentRound)`).

The split against `screenGuide.js` is deliberate: that file describes a **screen** and is pushed at the player automatically through rounds 00–01; this one describes a **control or number** and is only ever pulled. Which is why it never expires — see [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §6.13 for the placement table and the copy constraints (labels under ~22 characters, bodies under ~200, and nothing that could leak the case, since these are readable in Round 00).

### [src/data/hostReference.js](src/data/hostReference.js)
Owns the structured host-only reference content rendered in-app from the host console:

- `HOST_REFERENCE_TABS` — top-level navigation for the host guide screen
- `HOST_REFERENCE_SUMMARY` — event shape and host principles
- `HOST_SUSPECT_ROSTER` — prime suspect lanes vs actual status
- `HOST_KILLER_JOBS` — five-job solution map
- `HOST_MATERIALS` — required and helpful physical materials (login cards only; there are no clue cards)
- `HOST_ROUND_GUIDE` — operational prompts keyed to the live round
- `HOST_WITNESS_LANES` — grouped witness nudges for stalled rooms
- `HOST_FAST_ANSWERS` — objection handling before and after Round 5
- `HOST_DECK` — clue manifest and counts; now the host's *override*, read out when a round stalls, rather than a packing list

---

## Cast Model

Each playable guest is a plain object with this shape:

```javascript
{
  id: 'char_sneha',
  name: 'Sneha Ganesh',
  role: 'MURDERER' | 'SUSPECT' | 'WITNESS',
  profession: 'Strategy consultant and fashion-label founder',
  group: 'THIMBLE',
  bio: 'Short public profile',
  quirk: 'Conversation hook',
  secret: 'Private identity note',
  neverDo: 'Public red line',
  motive: 'Narrative motive paragraph',
  timeline: 'Public/private movement log',
  code: 'THIMBLE',
  isSuspect: true | false,
}
```

Important behavioral rules:

- `role === 'MURDERER'` is now plural in practice. There are 5 killers.
- `isSuspect` marks the 10 prime suspects the room is expected to focus on first.
- Witnesses remain voteable in the UI today because the ballot still shows the whole room; the case design relies on clue structure, not hard vote filtering.

---

## Multi-Killer Logic

The old app assumed a single murderer. The current implementation generalizes that assumption without rewriting the app shell.

### Helper functions

- `getKillers()` returns every character whose `role` is `MURDERER`.
- `isMurderer(characterId)` now checks membership in that set, not equality to one fixed ID.

### Reveal flow

In [src/App.jsx](src/App.jsx):

- **every** non-host player sees [src/components/MurdererRevealOverlay.jsx](src/components/MurdererRevealOverlay.jsx) the moment the host reveals — killers included, *since 2026-08-07*. Nothing precedes it, and its branch sits above the `gameEnded` one because `updateMurdererReveal` writes `revealedToMurderer` and `gameEnded` in a single call, so whichever branch comes first is the screen the room gets
- killers used to be excluded from that branch and dropped straight onto [src/components/OutroSplash.jsx](src/components/OutroSplash.jsx) — the five people the room was being told about were the only ones who never saw it named. They now get the reveal too and step past it with a `Continue` control (App owns a local `revealStepped`, deliberately unpersisted so a reload replays the announcement). Everyone else ends on the reveal, which is why only the killers are handed `onContinue`
- only characters included in `CONFESSION_CLUE.forCharacters` receive the confession card in Round 6
- the overlay can render either a single killer or a full killer team, with the first killer treated as the lead reveal block — so **`getKillers()` returns the team mastermind-first**, ordered by `KILLER_IDS` rather than by roster position

### The reconstruction

Naming the killers is only half of the ending; [src/components/RevealDeck.jsx](src/components/RevealDeck.jsx) is the other half — the full explanation of how the murder was carried out, read by the whole room after the reveal. *Since 2026-08-07 it is a 22-slide deck rather than one scrolling document (`CaseSolution.jsx`, deleted): a room that has just been told* who *does not read three screens of prose, and the deck's chapter structure paces the answer for them.*

- Both terminal screens open it, which is what makes it reachable by all 51 players: the reveal overlay carries a `How it happened` control (gated to its final entrance stage), and the outro carries one for the five killers, who never see the overlay.
- It is **swapped in for** the terminal screen rather than layered over it, so a second full-bleed `signal` surface never sits behind the reconstruction. Each host owns a local `showDeck` boolean — there is no App-level route, because these screens draw no `SCREEN_GUIDE` frame to keep in sync.
- **The frame is fixed and the slide scrolls between it.** Header (exit + `NN / 22`) and footer (Back / Next) are `shrink-0` on a `fixed inset-0` flex column; the slide lives in the `flex-1` scroller. So the way out is always on screen, and a slide taller than the phone scrolls rather than shrinking its type. Navigation is Back/Next, horizontal swipe (60px, and only when horizontal travel beats vertical, or a diagonal scroll would page the deck), and arrow / Page / Home / End / Escape keys.
- **Slide data is [src/data/revealDeck.js](src/data/revealDeck.js)**, a typed block list — `paper`, `note`, `card`, `strip`, `stats`, `rail`, `beats`, `key`, `jobs`, `proof`, `circles` — each with one renderer in `BLOCKS` in the component. Emphasis is carried by two inline marks (`*bone*`, `_italic_`) resolved by `<Rich>`, so the data stays plain strings and no HTML is injected.
- **The answer key is still `CASE_SOLUTION` in [src/data/gameData.js](src/data/gameData.js)**: `verdict`, `why`, `jobs` (five, `lead: true` marks the mastermind), `sequence` (beats, `hidden: true` marks what nobody on the floor could see), `misdirection`, and `proof`. Slides 09, 21 and 22 read `jobs`, `proof` and `verdict` from it *directly* rather than restating them, so those three cannot drift. It is unreachable until `revealedToMurderer` and must not contradict [STORY.md](STORY.md).
- **It is the twin of [reveal-deck/index.html](reveal-deck/index.html), not an embed of it.** That deck is a fixed 1920×1080 stage scaled by one transform — right for a projector, unreadable on a phone, where the scale factor is 0.20 and its 26px body copy lands at 5px. The in-app slides reflow instead, in the app's own voice (DESIGN_LANGUAGE.md §3.1). Same 22 slides in the same order: **a story change means editing both.**

### Player-facing labels

- the Identity screen now labels killer roles as `Classified · Killer`
- the Timeline screen says `You are one of the killers` when more than one killer exists
- the host terminal action reads `Reveal killers`

A tag alone was not enough: `Classified · Killer` reads as a redaction stamp, and killers were
reaching Round 1 unsure whether they had actually done it. The five murderers' `secret` strings
in [gameData.js](src/data/gameData.js) now open by telling the player outright that they killed
Armaan and what their part in it was, so the Confidential Note is the briefing rather than one
more piece of flavour. Two presentation consequences in
[DashboardView.jsx](src/components/views/DashboardView.jsx): a killer's note is **not** wrapped
in quotation marks (it addresses the player, it is not a line the character says), and it is
sealed with seven redaction marks instead of four, because the copy runs roughly twice as long
as a guest's.

---

## Clue Model

The clue engine itself is unchanged. The case is still data-driven.

### Categories

- `ACCUSATION` — 10 cards, automatically available in Round 1
- `MOTIVE` — 10 codes, Round 2
- `EVIDENCE` / `FORENSICS` / `CCTV` — 7 round-3 items sharing the same Evidence stack
- `REVELATION` — 6 round-4/5 items
- `CONFESSION` — 1 final gated clue

### Code namespaces

`character.code` (51 login codes) and `clue.code` (34 clue codes) are read by two different
inputs — [CharacterSelect.jsx](src/components/CharacterSelect.jsx) via `validateLoginCode`, and
the decoder via `handleCodeSubmit` in [App.jsx](src/App.jsx) — but they share one keyspace in
practice, because a player can type anything into either field. **The two sets must stay
disjoint.**

They were not, until 2026-08-07: the ten motive codes were literally the ten prime suspects'
login codes. Since Round 2 asks players to shout motive codes across the room, that published
the five killers' credentials, and [DashboardView.jsx](src/components/views/DashboardView.jsx)
prints `Classified · Killer` on a murderer's Identity screen. `handleCodeSubmit` checks
`CLUE_DB` before `CHARACTERS`, so the decoder itself behaved — the leak was entirely at the
login screen.

Clue codes are now meaningless single words: never a login code, never descriptive of the clue,
never derivable from the roster. A dev-only assertion at the bottom of
[gameData.js](src/data/gameData.js) logs an error if either invariant breaks. See
[CLUE_CODES.md](CLUE_CODES.md).

### Evidence organization

`CLUE_STACKS` still groups the board into four clue stacks:

1. accusations
2. motives
3. evidence
4. revelations

Case files remain a fifth surface through [src/components/views/CaseFilesSection.jsx](src/components/views/CaseFilesSection.jsx).

Which stack is open lives in `evidenceStack` on [App.jsx](src/App.jsx) — `null` is the hub — because App owns the screen frame and a stack's name is the screen *title*. Two consequences, both in App:

- `closeScreen()` steps back one level: from an open stack the chrome-rail X clears `evidenceStack`; anywhere else it clears `activeTab`. `Header` takes a `closeLabel` prop so the `aria-label` names the real destination.
- Leaving the Evidence tab clears `evidenceStack`, so reopening Evidence lands on the hub.

The player's own accusation appears **twice** on purpose: pinned on the hub under "Yours alone" (with the confession), and leading the Accusations stack. It comes from the `myAccusation` prop, not from the decoded set, so `cluesIn()` filters the same clue out of the found list — otherwise a host reveal of that accusation would render the card twice. `countIn()` adds the +1 back for the tile count and the hub's "Collected" total, which is summed from the tiles rather than counted off `unlockedClues` so the two can't disagree.

### Assignment integrity

This version intentionally preserves 10 accusation narratives instead of scaling to 51 unique accusation cards. Coverage is achieved by distributing those 10 cards across all 51 players via the `assignedTo` arrays.

---

## The riddle lock

Added 2026-08-07, replacing the three printed clue stacks. Solving a riddle unseals the next
clue in that player's queue and shows its code; the code is what circulates.

### Files

| File | Owns |
|---|---|
| [src/data/riddles.js](src/data/riddles.js) | `RIDDLES` (100), answer matching, the "already seen" ledger |
| [src/data/gameData.js](src/data/gameData.js) | `RIDDLE_REWARD_POOL`, `ASK_OPENS_AT`, `riddleQueueFor()`, `nextRiddleReward()`, `riddleRewardsInPlay()` |
| [src/components/modals/RiddleModal.jsx](src/components/modals/RiddleModal.jsx) | The screen: question, misses, hint, celebration, code sharing |
| [src/App.css](src/App.css) §16 | `.er-solve` / `.er-burst` / `.er-fleck` / `.er-seal` — the celebration |
| [src/App.css](src/App.css) §17 | `.er-summon` / `@keyframes erSummon` — the one-time ASK cue |
| [src/lib/typeSound.js](src/lib/typeSound.js) | `playSolveFanfare()` — three synthesized bells up a major triad |
| [src/App.jsx](src/App.jsx) | `riddleReward`, `handleRiddleSolved`, `pendingUnlocks`, `askVisible`, `askCueOwed`, the ASK button |

### The ASK button is round-gated, and announces itself once

`ASK_OPENS_AT` is `Math.min(...RIDDLE_REWARD_POOL.map(c => c.roundReq))` — Round 2 as the decks
stand. It is derived rather than typed because it is a consequence, not a preference: below that
round `nextRiddleReward()` can only return null, and a button whose only possible answer is "not
yet" teaches the player the wrong thing about the control. Move a reward earlier and the button
follows it. Every surface that names ASK reads the same constant — the Evidence empty-stack hint
([IntelView.jsx](src/components/views/IntelView.jsx) `emptyHint`) and the corner tooltip
(`TOOLTIPS.evidenceCode` vs `evidenceTools`) both swap below it, and the host script, the Guide
and the decoder's footnote all say "from Round 02" in prose.

Because it appears **mid-game**, beside a CODE button players have used for two rounds, in the
corner their thumb already rests on, it knocks once — `.er-summon`, three hops with a blink, then
nothing. The bookkeeping is three pieces:

- `askCueOwed` — initialised from `localStorage['astral.askcue']` in a **pure** state
  initialiser, so StrictMode's double invoke gets the same answer twice. Persisted separately
  from `SESSION_KEY` because it must survive a reload, a service-worker update and the host's
  force-sync broadcast; not cleared on logout, because it is a fact about the screen rather than
  about the player. An unreadable ledger (private-mode Safari) counts as *spent* — the other
  failure mode is a button that knocks on every visit all evening.
- The effect spends the ledger the moment the cue goes live — first sight, meaning the Evidence
  screen with the button on it, not the round advance (most of the room is on Chat when the host
  advances, and a knock nobody is looking at is a knock wasted).
- `animationend` on the wrapper retires it, which is why no duration is duplicated in JS. The
  wrapper exists because the button already spends its own `animation` on `.er-land`; the
  `event.target === event.currentTarget` guard is load-bearing, since that landing animation
  bubbles and would otherwise retire the cue at ~1.05s, before its first hop.

### Riddle selection is random; clue selection is not

The two halves are deliberately opposite to every other deck in the project:

- **Riddles are dealt at random** (`dealRiddle()`), with a `localStorage['astral.riddles.seen']`
  ledger so a player does not meet the same puzzle twice until all 100 are used. Randomness is
  the point — the person beside you is holding a different question, so shouting an answer
  across the room achieves nothing. Only *solved* riddles are marked seen; skipping one puts it
  back in circulation.
- **Rewards are dealt stably** (`riddleQueueFor(characterId)`), grouped by `roundReq` first and
  then **rotated** within each round-block by the player's ordinal in `RIDDLE_ORDINAL` — their
  position, 0 to 50, in a stable shuffle of the roster. Stable so a reload cannot reshuffle the
  queue under a player mid-game; per-player so 51 devices do not all pay out the same clue and
  leave the room with nothing to trade.

  It rotates rather than hash-sorts because only the **first** reward really matters — most
  players solve one or two riddles all evening — and a hash sort does not spread it. The old
  sort gave `PENDULUM` to 7 players and `OBELISK` to 8 while `LATTICE` (a killer's motive) was
  the opening prize for exactly 1 of 51. Rotating by a raw hash is no better: `hash % 10`
  inherits the hash's bias in its low bits and measured worse (12 and 1). An ordinal is what
  makes the modulo uniform. Measured now: **5 or 6 players on each of the 10 motive clues**,
  51 distinct queues across 51 players.

Accusations and the confession are **not** in the pool — the first is dealt automatically at
Round 1, the second belongs to the killers.

### Answer matching

`isCorrectAnswer()` folds to lowercase, strips a leading `a`/`an`/`the`, and discards every
non-alphanumeric character before comparing against `a` plus the riddle's `alt` list. A phone
in a dark room supplies smart apostrophes, trailing spaces and autocapitalization; none of
those is a wrong answer. Being right and being marked wrong is the one failure mode this
screen cannot afford.

### Double-payout guard

`riddleReward` is computed from `unlockedClues` (Firestore) ∪ `revealedClues` (host) ∪
`pendingUnlocks` (local). The third set exists because the Firestore snapshot is a round trip
behind: without it, solving two riddles in quick succession pays out the same clue twice.

### Failure is free

No lockout, no attempt limit, no penalty for a wrong answer; "Another riddle" redeals with the
same prize attached; three misses reveals the shape of the word. The riddle is a toll booth on
the way to the story, not a skill gate — a player who cannot crack one must still be able to
end the evening holding evidence, which they can, by trading for codes.

---

## Main Screens

### CharacterSelect
Uses `validateLoginCode()` and shows player count from `CASE_META.playerCount`.

### GridMenu
Uses `CASE_META` for venue, case title, case ID, player count, and killer count.

### DossierView / GuestProfileModal
The roster surface is now framed as **Guests**, not **Suspects**, because only 10 of the 51 players are prime suspects.

**`isSuspect` must never reach a player-facing surface.** Neither the roster row nor the guest file says whether a guest is a prime suspect or a witness — working that out from the clue deck *is* the game, so labelling it hands players the answer for free. The only standings shown are ones the room already knows: `You`, `Deceased` (roster) and `Guest on record` / `Known victim` (modal). `getSuspects()` / `getWitnesses()` / `CASE_META.primeSuspectCount` are host-only and are read solely by [`hostReference.js`](src/data/hostReference.js) and [`HostReferenceView`](src/components/views/HostReferenceView.jsx). A player's *own* role is different — [`DashboardView`](src/components/views/DashboardView.jsx) may tag `myCharacter` as killer or victim, because that is self-knowledge.

DossierView filters through the shared [`SearchField`](src/components/ui/SearchField.jsx) (name / profession / quirk, case-insensitive substring). The roster is pre-mapped to `{ char, fileNumber }` so the two-digit file number keeps referring to the guest's position in `CHARACTERS` while the list is filtered — renumbering by filtered position would make the number useless as a spoken reference.

### TimelineView
Uses `CASE_TIMELINE` from `gameData.js` rather than hardcoding one case's events in the component.

### StoryView / StoryIntro
Both consume the same `STORY_SLIDES` source. StoryView now reads case metadata directly from `CASE_META`; there is no separate `caseData` module.

### VotingView
Renders `CHARACTERS` in order. The ballot used to hash-sort the roster itself; that moved to `dealt()` in the data layer (above), so the ballot, the Suspects index and every guest's file number now agree on one order instead of drifting apart. `isMurderer()` is still used here, but only to badge the killers once round 6 lands.

It also carries the shared [`SearchField`](src/components/ui/SearchField.jsx) above the ballot grid, matching on name and profession. The filter only removes cards and never reorders them, so the jumbled order every player shares is preserved and the vote already recorded is unaffected by what is currently visible.

#### The unread tally

`voteResultsVisible` arrives from Firestore when the host taps **Show tally**, and it used to do nothing but swap a `Tally withheld` tag for a `View tally` button — on a screen almost nobody is looking at when the host taps it. `tallyUnread` is the state that turns that swap into an announcement: it drives a two-hop knock (`.er-summon-tally`, [App.css](src/App.css) §17), a `signal` border with the 3px state channel, and a "Just released" tag, and all three end on the same tap.

```
tallyUnread = voteResultsVisible && tallySeen !== currentRound
```

`tallySeen` is **the round number of the last tally this device opened**, not a boolean, which is what makes the cue re-arm every round without any explicit reset: reading Round 03's numbers says nothing about Round 04's, and the host hiding and re-showing within a round correctly counts as one release.

The ledger is `localStorage['astral.tallyseen']`, read once in a **pure** state initialiser so StrictMode's double invoke agrees with itself. It has to be persisted rather than held in state because `VotingView` unmounts the moment the player closes the screen — a per-round cue kept in component state would fire again on every visit. It sits outside `SESSION_KEY` for the same reason `astral.askcue` does: it must survive a reload, a service-worker update and the host's force-sync broadcast, none of which is a reason to knock at somebody who read the tally two minutes ago.

Two deliberate differences from the ASK cue (["The ASK button is round-gated, and announces itself once"](#the-ask-button-is-round-gated-and-announces-itself-once), above), both consequences of the tally being a *recurring* release rather than a once-ever arrival:

- **No `animationend` bookkeeping and no wrapper element.** The button has no entrance animation of its own to bubble past, and removing the class when the tally is read is what ends the cue. The knock is a function of the state, so it replays if the player leaves a flagged tally and comes back — which is the intended behaviour, not a leak.
- **An unreadable ledger is not treated as spent.** Private-mode Safari throws on every `localStorage` call; the ASK cue answers "already seen" there, because its alternative is a button knocking all evening. This one falls back to a module-scope `tallySeenMemory`, which still holds "once per round" for the life of the tab. Only a reload can replay it, and a reload loses considerably more than this.

### The in-app help layer

Two components, one surface, deliberately opposite in behaviour:

| | [`ScreenBrief`](src/components/ui/ScreenBrief.jsx) | [`InfoTip`](src/components/ui/InfoTip.jsx) |
|---|---|---|
| Trigger | Pushed — pinned under the screen title | Pulled — an 18px `?` beside a label |
| Describes | a screen | a control or a number |
| Lifetime | rounds 00–01 (`BRIEF_HIDDEN_FROM_ROUND`) | never expires |
| Copy | [`screenGuide.js`](src/data/screenGuide.js) | [`tooltips.js`](src/data/tooltips.js) |

They share the aged-bone surface, the caret and the note voice — the body rule in [App.css](src/App.css) is literally one selector list covering both — so the app has a single idiom for "here is what this is". The pairing is what closes the gap the briefs left: they clear at Round 02 and the game runs to Round 06.

`InfoTip` renders its panel through `createPortal` into `document.body`. That is not cosmetic: paper in this system tilts with the `rotate` property, and `rotate` establishes a containing block for `position: fixed`, so a panel rendered inside a bone card would anchor to the card and inherit its 1.2° tilt. The portal also clears the modals (z-70 against their z-50) and the root's `overflow-x: clip`. Position is written straight to `style.left` / `style.top` in a layout effect rather than held in state — `setState` there re-runs the effect, which measures again and sets a fresh object, looping forever — and `data-placed` hides the pre-measurement frame. Full rules and the placement table are in [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §6.13.

`roundTip(currentRound)` is the one generated tip. It sits in the chrome rail and on the board masthead, so "what should I be doing right now?" is answerable from every screen in the game, and it is built from `ROUNDS` + `ROUND_GUIDE` so it cannot disagree with the Guide.

### HostPanel / HostReferenceView
- [src/components/HostPanel.jsx](src/components/HostPanel.jsx) remains the live console for round control, voting, file release, and reveal actions.
- It now also acts as the entry point for a dedicated in-app host guide screen via [src/components/views/HostReferenceView.jsx](src/components/views/HostReferenceView.jsx).
- The guide stays inside the host route rather than becoming a separate App-level tab: HostPanel owns a local `referenceOpen` state and swaps the screen in place, which avoids building a second host navigation path into [src/App.jsx](src/App.jsx).
- The host guide is a UI mirror of the external host docs: facilitation flow, witness map, clue manifest, materials, and objection handling in one place during the event.

---

## Firebase State

The shared Firestore shape is unchanged from the previous architecture:

- `gameState/current` stores round, voting state, unlocked files, reveal state, and end-state flags
- `gameState/votes` stores votes and aggregated counts
- player clue ownership is still tracked under unlocked clue maps

This rewrite did **not** require a schema migration. It is primarily a content/data-model expansion.

---

## Validation

The current implementation has been validated with:

```powershell
npm run lint
npm run build
```

Additional integrity check run during implementation:

- 51 characters present
- 5 killers present
- 10 prime suspects present
- 10 accusation cards present
- all 51 players assigned exactly one accusation

---

## Known Caveats

- The build still emits a chunk-size warning because the app is not code-split aggressively.
- The Firestore config still dynamically imports `gameData.js` in one path while many UI surfaces statically import it; Vite warns that this prevents chunk movement, but it does not break the build.
- The live Firestore environment should still be treated as production. Story rewrites do not make mutation safer.
