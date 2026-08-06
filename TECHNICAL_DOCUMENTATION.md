# Astral Project's Murder Mystery Experience
## Technical Documentation

> Maintenance note: Update this file whenever the architecture, data model, shared state, or screen behavior changes. This is the implementation overview for the current 51-player Goa venue case.

---

## Overview

**Application type:** Interactive multiplayer web-based murder mystery PWA  
**Framework:** React 19 + Vite 7  
**State model:** React local state + Firebase Firestore realtime sync  
**Current case scale:** 51 playable guests, 10 prime suspects, 5 killers, 6 case files, 34 clue codes

The app remains structurally the same as the earlier versions: one host advances the room through seven rounds while players decode clue cards, chat, vote, and inspect guest profiles. The major implementation change in this version is narrative scale. The data layer now supports a 51-player cast and a multi-killer reveal instead of a single murderer.

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
- `HOST_SCRIPT` — host-facing run sheet for live facilitation
- `LOGIN_CODE_MAP` — generated from the character roster

### [src/data/storyIntro.js](src/data/storyIntro.js)
Owns the Round 0 public briefing only. It is spoiler-gated to knowledge available before the investigation starts.

### [src/data/screenGuide.js](src/data/screenGuide.js)
Owns per-screen kicker/title/brief/detail copy plus labels for the five Evidence stacks.

### [src/data/hostReference.js](src/data/hostReference.js)
Owns the structured host-only reference content rendered in-app from the host console:

- `HOST_REFERENCE_TABS` — top-level navigation for the host guide screen
- `HOST_REFERENCE_SUMMARY` — event shape and host principles
- `HOST_SUSPECT_ROSTER` — prime suspect lanes vs actual status
- `HOST_KILLER_JOBS` — five-job solution map
- `HOST_MATERIALS` — required and helpful physical materials
- `HOST_ROUND_GUIDE` — operational prompts keyed to the live round
- `HOST_WITNESS_LANES` — grouped witness nudges for stalled rooms
- `HOST_FAST_ANSWERS` — objection handling before and after Round 5
- `HOST_DECK` — clue manifest and counts for printed card prep

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

- non-host, non-killer players see [src/components/MurdererRevealOverlay.jsx](src/components/MurdererRevealOverlay.jsx)
- killers skip the public overlay and land on [src/components/OutroSplash.jsx](src/components/OutroSplash.jsx), because `updateMurdererReveal` sets `gameEnded` at the same time
- only characters included in `CONFESSION_CLUE.forCharacters` receive the confession card in Round 6
- the overlay can render either a single killer or a full killer team, with the first killer treated as the lead reveal block

### The reconstruction

Naming the killers is only half of the ending; [src/components/CaseSolution.jsx](src/components/CaseSolution.jsx) is the other half — the full explanation of how the murder was carried out, read by the whole room after the reveal.

- Both terminal screens open it, which is what makes it reachable by all 51 players: the reveal overlay carries a `How it happened` control (gated to its final entrance stage), and the outro carries one for the five killers, who never see the overlay.
- It is **swapped in for** the terminal screen rather than layered over it. Every terminal screen is `fixed inset-0` and non-scrolling; swapping lets the reconstruction scroll as a normal document and keeps its back control honest. Each host owns a local `showSolution` boolean — there is no App-level route, because these screens draw no `SCREEN_GUIDE` frame to keep in sync.
- All copy lives in `CASE_SOLUTION` in [src/data/gameData.js](src/data/gameData.js): `verdict`, `why`, `jobs` (five, `lead: true` marks the mastermind), `sequence` (beats, `hidden: true` marks what nobody on the floor could see), `misdirection`, and `proof`. It is the answer key — unreachable until `revealedToMurderer` — and must not contradict [STORY.md](STORY.md).

### Player-facing labels

- the Identity screen now labels killer roles as `Classified · Killer`
- the Timeline screen says `You are one of the killers` when more than one killer exists
- the host terminal action reads `Reveal killers`

---

## Clue Model

The clue engine itself is unchanged. The case is still data-driven.

### Categories

- `ACCUSATION` — 10 cards, automatically available in Round 1
- `MOTIVE` — 10 printed codes, Round 2
- `EVIDENCE` / `FORENSICS` / `CCTV` — 7 round-3 items sharing the same Evidence stack
- `REVELATION` — 6 round-4/5 items
- `CONFESSION` — 1 final gated clue

### Evidence organization

`CLUE_STACKS` still groups the board into four clue stacks:

1. accusations
2. motives
3. evidence
4. revelations

Case files remain a fifth surface through [src/components/views/CaseFilesSection.jsx](src/components/views/CaseFilesSection.jsx).

### Assignment integrity

This version intentionally preserves 10 accusation narratives instead of scaling to 51 unique accusation cards. Coverage is achieved by distributing those 10 cards across all 51 players via the `assignedTo` arrays.

---

## Main Screens

### CharacterSelect
Uses `validateLoginCode()` and shows player count from `CASE_META.playerCount`.

### GridMenu
Uses `CASE_META` for venue, case title, case ID, player count, and killer count.

### DossierView / GuestProfileModal
The roster surface is now framed as **Guests**, not **Suspects**, because only 10 of the 51 players are prime suspects. The modal distinguishes `Prime suspect`, `Witness`, and `Known victim` labels.

DossierView filters through the shared [`SearchField`](src/components/ui/SearchField.jsx) (name / profession / quirk, case-insensitive substring). The roster is pre-mapped to `{ char, fileNumber }` so the two-digit file number keeps referring to the guest's position in `CHARACTERS` while the list is filtered — renumbering by filtered position would make the number useless as a spoken reference.

### TimelineView
Uses `CASE_TIMELINE` from `gameData.js` rather than hardcoding one case's events in the component.

### StoryView / StoryIntro
Both consume the same `STORY_SLIDES` source. StoryView now reads case metadata directly from `CASE_META`; there is no separate `caseData` module.

### VotingView
Renders `CHARACTERS` in order. The ballot used to hash-sort the roster itself; that moved to `dealt()` in the data layer (above), so the ballot, the Suspects index and every guest's file number now agree on one order instead of drifting apart. `isMurderer()` is still used here, but only to badge the killers once round 6 lands.

It also carries the shared [`SearchField`](src/components/ui/SearchField.jsx) above the ballot grid, matching on name and profession. The filter only removes cards and never reorders them, so the jumbled order every player shares is preserved and the vote already recorded is unaffected by what is currently visible.

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
