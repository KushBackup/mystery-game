# Astral Project's Murder Mystery Experience
## Technical Documentation

> Maintenance note: Update this file whenever the architecture, data model, shared state, or screen behavior changes. This is the implementation overview for the current 26-player Greenr case (Last Seating, 2609-G).

---

## Overview

**Application type:** Interactive multiplayer web-based murder mystery PWA  
**Framework:** React 19 + Vite 7  
**State model:** React local state + Firebase Firestore realtime sync  
**Current case scale:** 26 playable guests, 10 suspects, 3 killers, 6 case files, 35 clue codes

The app shell is unchanged: one host advances the room through seven rounds while players decode clues, chat, vote and inspect guest profiles. What changed in this case is the story scale and the clue distribution: the current data layer supports a smaller guest list, a narrower suspect pool, and a three-person conspiracy without any runtime refactor.

Late arrivals use a separate real-time walk-in system. They are mechanically full players but never become part of the fixed 26-person case canon.

---

## Canonical Data Sources

### [src/data/gameData.js](src/data/gameData.js)
Owns the live case definition:

- `CASE_META` - case ID, title, venue, victim, inspector, player count, suspect count, killer count
- `CHARACTERS` - 26 playable guests with `role`, `profession`, `bio`, `quirk`, `secret`, `neverDo`, `motive`, `timeline` and `code`
- `CASE_TIMELINE` - public incident beats used by the Timeline screen
- `PODS` - the 10 statement pods; `ACCUSATION_CLUES` - 10 accusation narratives whose `assignedTo` arrays cover all 26 players exactly once
- `MOTIVE_CLUES` - 10 motive files
- `EVIDENCE_CLUES` - 8 round-3 evidence items
- `REVELATION_CLUES` - 6 round-4/5 twist items
- `CONFESSION_CLUE` - final reveal text, gated by `forCharacters`
- `CASE_FILES` - 6 host-unlocked reports shown under Evidence -> Case files
- `RIDDLE_REWARD_POOL` / `riddleQueueFor()` / `nextRiddleReward()` - the prize side of the riddle lock
- `HOST_SCRIPT` - host-facing run sheet for the host console
- `LOGIN_CODE_MAP` - generated from the character roster

### [src/data/storyIntro.js](src/data/storyIntro.js)
Owns the Round 0 public briefing only. It is spoiler-gated to knowledge available before the investigation starts.

### [src/data/screenGuide.js](src/data/screenGuide.js)
Owns per-screen kicker/title/brief/detail copy, the labels for the Evidence stacks, and `ROUND_GUIDE`.

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

## Real-Time Walk-Ins

Walk-ins are dynamic `BYSTANDER` identities, not additions to `CHARACTERS`.

- The host issues a one-time plain-word registration pass from `HostPanel`.
- The late arrival registers on their own phone using the Beautiform-derived fields: name, phone, email, profession, three traits, hidden talent and an optional confession.
- A different plain-word login code is shown once after registration; the session then enters the normal standby, briefing, chat, evidence, riddle and voting flow.
- Public profile data appears in the Guests directory under a `Walk-in` label. Phone and email are stored separately and never rendered in player-facing UI.
- Walk-ins receive a deterministic duplicate accusation and a deterministic riddle queue based on their dynamic id. They can vote for canonical suspects, but never appear as ballot candidates.
- The canonical roster, story counts, `PODS`, fixed clue decks, killer checks and final reveal continue to use `CHARACTERS` only.
- Removal marks the record inactive. It removes the identity from the directory and active tally calculation, returns that device to login on its next render, and emits a departure notice.

`App.jsx` derives three scopes: canonical story players (`CHARACTERS`), active voters (canonical plus active walk-ins), and directory guests (canonical plus active walk-ins). Keep these scopes separate when adding future features.

The project has no Firebase Authentication. Passes prevent accidental registration in the event UI but do not provide hostile-client security; the separate contact collection is private by application convention only until authenticated host access exists.

---

## Clue Model

### Categories

- `ACCUSATION` - 10 cards, automatically available in Round 1
- `MOTIVE` - 10 codes, Round 2
- `EVIDENCE` / `FORENSICS` / `CCTV` - 8 round-3 items sharing the Evidence stack
- `REVELATION` - 6 round-4/5 items
- `CONFESSION` - 1 final gated clue

### Distribution

- **Round 1** uses 10 statement pods. Each player gets exactly one accusation.
- **Round 2+** uses the riddle lock. Solving a riddle unseals the next clue in that player's queue and reveals its shareable code.

### Block sizes in the reward queue

The current case uses four reward blocks:

- Round 2: 10 motives
- Round 3: 8 evidence clues
- Round 4: 4 revelations
- Round 5: 2 revelations

`riddleQueueFor()` rotates each block by the player's ordinal, so the first reward in each block spreads evenly across the 26-player room instead of clustering.

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
- a round clock reaching zero automatically starts a five-minute ballot on every player device
- the ballot and its public result are derived from the clock's absolute end instant, so neither transition creates client writes or drifts on reload
- when the ballot ends, a locked result takeover shows the tally and every voter-to-candidate choice
- the host's **Start Round N** control is the only exit from results; it advances the round and starts its new clock in the existing atomic write

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