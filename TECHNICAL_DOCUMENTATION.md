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
- `HOST_SCRIPT` — host-facing run sheet for live facilitation
- `LOGIN_CODE_MAP` — generated from the character roster

### [src/data/storyIntro.js](src/data/storyIntro.js)
Owns the Round 0 public briefing only. It is spoiler-gated to knowledge available before the investigation starts.

### [src/data/screenGuide.js](src/data/screenGuide.js)
Owns per-screen kicker/title/brief/detail copy plus labels for the five Evidence stacks.

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
- killers skip the public overlay
- only characters included in `CONFESSION_CLUE.forCharacters` receive the confession card in Round 6
- the overlay can render either a single killer or a full killer team, with the first killer treated as the lead reveal block

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

### TimelineView
Uses `CASE_TIMELINE` from `gameData.js` rather than hardcoding one case's events in the component.

### StoryView / StoryIntro
Both consume the same `STORY_SLIDES` source. StoryView now reads case metadata directly from `CASE_META`; there is no separate `caseData` module.

### VotingView
Still renders from `CHARACTERS`, but now uses `isMurderer()` to avoid clustering any of the killers near the top of the ballot list.

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
