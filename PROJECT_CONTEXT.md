# Astral Project's Murder Mystery Experience
## Project Context

> Maintenance note: Update this file whenever the live case premise, round flow, cast scale, or host flow changes. See [Claude.md](Claude.md) for the session-start primer.

---

## Overview

**Case title:** TripleSpeed: Onam in Black (Case 2108-C)
**Platform:** React + Vite PWA with Firebase sync
**Format:** Live social deduction murder mystery for an office party
**Cast size:** 69 playable colleagues (the real TripleSpeed roster, first names only; the host is not in the fiction), 1 fictional victim
**Investigation shape:** 34 persons of interest, of which 12 prime suspects carry the clue decks; 35 witnesses; 5 killers
**Duration:** ~1.5–2.5 hours across 7 rounds

The active case is set in the office itself: TripleSpeed's floors at Chimp Processing Pvt Ltd, Midford KTR2, Indiranagar, Bangalore, on Onam day — 21 August 2026. The victim is **Dev Malhotra**, a fictional revenue-assurance consultant the co-founders quietly hired to find why margins leak as revenue scales toward $10M/month. He is poisoned three hours before presenting his findings. The room initially assumes whoever was near him when he drank did it. The real answer is a five-person, five-department conspiracy led by the Head of Payments, executed hours before anyone thought to look.

---

## Story Premise

TripleSpeed runs on ordinary chaos: WiFi flaps, payment-provider hiccups, low-ROAS weeks, AWS billing shocks, a vendor that "turned out to be a scammer." Dev Malhotra discovered that four of those recurring problems were not weather — they were a ₹3.4-crore internal skim wearing the company's chaos as a uniform. On Tuesday he pulled the payment provider's settlement archive, the one dataset nobody inside could sanitize. On Friday at 4 PM — during the office Onam party's evening toast — he was scheduled to read names.

He died at approximately 3:40 PM, alone in the third-floor Glass Room, from oleander concentrate left in his own steel tumbler at the infamous third-floor coffee machine. The machine had been dead for two weeks and was revived that very morning by an "urgent" ticket. The building was sealed at 4:30 PM with all 69 staff inside — the company Ubers don't even run between 9 AM and 6 PM.

The public shape of the case: 34 colleagues cannot be continuously placed on the terrace between 2:45 and 3:25 PM, most for utterly mundane party-day reasons. The private truth: five people, one per department lane — payments, engineering, ops, support, marketing — split the murder into five jobs so cleanly that everyone's afternoon alibi is real and everyone's crime happened earlier, elsewhere, or on a schedule.

---

## Core Gameplay Loop

1. Players log in as one of 69 colleague identities (their own first names).
2. Round 0 opens with the fullscreen typed briefing and the Incident Report.
3. The host opens a blind first vote before the room has enough evidence. From here on the host can put a countdown on each round (30 minutes by default) — every player sees it under the round number.
4. Round 1 automatically gives every player one accusation card on the Evidence screen — the witness claim their statement pod was handed (12 claims across 12 pods).
5. Round 2 opens the **riddle lock** and puts the 12 motive files into its prize pool.
6. Round 3 unlocks forensics case files, adds the 8 evidence clues to the pool, and reopens voting.
7. Rounds 4 and 5 deliver the twist through 6 revelation clues and the late-game case files.
8. Round 6 reveals the full killer team to the room, hands every player the 22-slide reconstruction of how the murder was done, and ends the game.

---

## How clues reach players — the riddle lock

**There are no printed clue cards.** The 26 motive, evidence and revelation clues are earned inside the app; login cards are the only paper.

On the Evidence screen two buttons sit bottom right:

| Button | What it does |
|---|---|
| **ASK** | Deals a riddle — a general riddle, nothing to do with the case. Answer it in one word and the next clue in *your* queue unseals, along with its code. **Appears in Round 02, not before.** |
| **CODE** | The decoder. Type in a code somebody else has given you and the same clue lands on your board. Present from Round 00. |

**ASK is round-gated, and the gate is derived, not chosen.** `ASK_OPENS_AT` in
[src/data/gameData.js](src/data/gameData.js) is the earliest `roundReq` in the reward pool —
Round 2, where the motive deck opens. Before that `nextRiddleReward()` returns null and the lock
has nothing it could unseal, so the button is simply absent rather than present-and-refusing.
Move a reward to an earlier round and ASK follows it without a code change.

Because the button arrives mid-game, next to a CODE button players have been using for two
rounds, it **knocks once** — three hops with a blink — the first time each player sees the
Evidence screen with it there. Once per device, ever, then it behaves like any other button
([DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) §7.1).

Three properties make this a social mechanic rather than a chore:

- **Every player has a different queue order.** `riddleQueueFor()` groups the pool by round,
  then rotates each round-block by the player's ordinal in the roster. All 69 queues are
  distinct, and the rotation spreads the *opening* prize evenly — 5 or 6 players on each of
  the 12 motive clues — so no clue can end up sitting with a single player who never taps ASK.
- **The reward comes with a shareable code.** A solve that only feeds one phone does nothing
  for the room. The solve screen puts the code in 30px mono with a Copy button and tells the
  player to read it out.
- **Nothing is gated on being good at riddles.** Wrong answers cost nothing, "Another riddle"
  redeals the same prize, and after three misses the shape of the word is shown. Anyone who
  cannot crack one can still receive every clue by trading.

The host keeps an override: the clue manifest on the Host Guide's **Deck** tab lists every
code, so a stalled round can be unblocked by simply reading one out.

---

## Round Structure

| Round | Name | What players learn |
|---|---|---|
| 0 | The Incident | Public story of the day, the victim, the sealed building, the 34-person POI list, first blind vote |
| 1 | Accusations | Twelve witness claims pointing at the prime suspects |
| 2 | Motives | Why each of the 12 primes needed Friday's briefing cancelled |
| 3 | Evidence | Tumbler-not-machine poisoning, the unclaimed 2:52 brew, the scheduled camera gap, badge V-07, the manually-shut valve, the two-day-old vendor pack, the fake alert, the harvested hedge |
| 4 | Revelations | Dev's surviving draft (five roles, Victor cleared), the Uber dashboard's shared ride, the one nameless admin session, the one genuine GRN signature |
| 5 | Finale | The "Fantasy League ⚽" group chat and the settlement archive — cross-department coordination made explicit |
| 6 | The Reveal | Public screen names the killer team; killers themselves get the confession. Both screens open **How it happened** — the 22-slide reconstruction |

---

## The round clock

Rounds are advanced by the host, not by the app — that has not changed, and no
countdown ever moves the case on by itself. What the clock adds is that the other
69 people can see how long the round has left.

| Control | Where | What it does |
|---|---|---|
| Start / Pause / Resume | Host console → **Round clock** | One button; starts a stopped clock for the current round, holds a running one, releases a held one |
| Reset | Host console → **Round clock** | Back to stopped, armed at the chosen length |
| 30 min · 15 min · 1 min · 10 sec | Host console → **Round clock** | Arms that length. On a *running* clock it restarts there and then — which is how the host squeezes a round that has run long, and how the bottom two get used at all |
| Round − / + | Host console → **Round** | Still skips freely. A running clock restarts at full length for the new round; a stopped one stays stopped |

Players see the countdown under the round number — on the chrome rail of every
screen, and on the board between screens. **30 minutes is the default.** Through
the last minute the digits turn red and tick once a second; through the last ten
seconds the tick becomes a push; at zero they read **Time up** and stop. Nothing
locks, nothing submits, nothing advances: the room is being told to hurry, and
the host is still the one who moves the case on.

A round the host never starts a clock for shows no clock at all.

---

## Cast Architecture

The player network is deliberately social first and investigative second.

- 69 playable colleagues — the real office roster, first names only. Duplicate first names are kept and disambiguated: Yash S. / Yash T., Pranav D. / Pranav A., Mohit A. / Mohit P.
- 34 are persons of interest (anyone not continuously placeable on the terrace 2:45–3:25 PM).
- 12 of those are prime suspects and carry the accusation + motive decks: the five killers (Anurag, Yao, Giles, Kalaivani, Akshat) plus seven innocents (Victor, Sukhans, Aarohi, Nehal, Prerna, Adithya, Luke).
- The remaining 35 players are witnesses with terrace-photographed alibis and load-bearing testimony.
- For Round 1, the roster is split into **12 statement pods** (9 of six, 3 of five). Each pod is dealt the accusation about one prime suspect, never its own member (`PODS` + dev assertion in gameData.js).

---

## Murder Method

Dev is poisoned with concentrated oleandrin — brewed from the terrace smoking-corner hedge — left as a film in his own steel tumbler, which he had rinsed and staged beside the coffee machine himself at 1:05 PM. His 3:15 PM coffee dissolved it. That matters for playability:

- the coffee ritual is a visible public fact players remember from Round 0,
- "dosed while empty at 2:52" breaks the who-was-near-him-at-3:15 instinct — the case's central trap,
- the machine's morning repair (valve manually shut for two weeks, revived by appointment) gives the room a solvable "who needed the machine to work *today*?" question,
- and every component was already inside the building — plant, vessel, chaos — which is the story's thesis.

### Killer Roles

- **Anurag** (Payments — lead): read the Tuesday archive-pull notification, assembled the five, staged the 2:47 PM fake payment alert that scattered the party.
- **Kalaivani** (Support): clipped the hedge, brewed the concentrate, decanted Giles's share into a bottle in the 8:37 AM shared Uber and kept the rest in the flask that never got opened. Spotless afternoon by design.
- **Giles** (Ops): booked the machine repair, dosed the tumbler at 2:52 inside the camera gap, rode the service lift on dead visitor badge V-07.
- **Yao** (Engineering): staged the 11:04 AM outage that killed the morning footage; one nameless admin session deleted Dev's draft, scheduled the 2:45–3:21 camera gap, and re-armed badge V-07.
- **Akshat** (Marketing): the reseller ad-spend skim; forged the Zenlyt vendor pack (Wed 11:58 PM) framing Victor.

---

## Fair-Play Design

- Round 1 gives all twelve primes individually plausible heat.
- Round 2 proves twelve people needed the briefing cancelled — motive closes nothing.
- Round 3 breaks the food/heart-attack theories and quietly moves the murder window from 3:15 back to 2:52 — and to 8:12 AM.
- Round 4 replaces suspects with roles (HoP, TL, OE, CS-O, MB) and clears the framed man in Dev's own margin note.
- Round 5 makes the cross-department conspiracy explicit through the chat and the archive.
- By Round 6 the room should be able to name the full team of five, not just the mastermind.

---

## Canon Timeline

- 8:12 AM — Urgent ticket revives the dead coffee machine ("before the party").
- 8:37 AM — Kalaivani and Giles arrive in one Uber; a bottle decanted from her flask changes bags.
- 9:41 AM — Technician signs the machine off: "no fault found — inlet valve manually shut."
- 11:04–11:47 AM — Staged outage; the NVR's whole fourteen-day array destroyed; draft deleted; camera gap and badge scheduled.
- 1:00 PM — Onam sadhya on the terrace; Aman's livestream becomes the room's alibi source.
- 2:47 PM — Fake settlement alert scatters part of the party.
- 2:52 PM — Giles doses the tumbler inside the camera gap (badge V-07, blank test shot).
- 3:12 PM — Dev leaves the terrace: "save me some payasam."
- 3:15 PM — Dev brews; the dose dissolves.
- 3:55 PM — Aarohi finds him; Kursheeth's CPR; "query poisoning."
- 4:14 PM — Declared dead.
- 4:30 PM — Inspector Arjun Kale seals floors 1–3 and the terrace. Zero exits since 1 PM.

---

## Source Files

- [src/data/gameData.js](src/data/gameData.js) — canonical cast, clue deck, pods, round data, host script, login codes
- [src/data/storyIntro.js](src/data/storyIntro.js) — Round 0 public briefing only
- [src/data/screenGuide.js](src/data/screenGuide.js) — screen framing, onboarding notes, Guide copy
- [src/components/StoryIntro.jsx](src/components/StoryIntro.jsx) — typed briefing
- [src/components/views/IntelView.jsx](src/components/views/IntelView.jsx) — evidence stacks
- [src/components/HostPanel.jsx](src/components/HostPanel.jsx) — live host controls and reveal trigger
