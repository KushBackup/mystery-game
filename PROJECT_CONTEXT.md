# Astral Project's Murder Mystery Experience
## Project Context

> Maintenance note: Update this file whenever the live case premise, round flow, cast scale, or host flow changes. See [Claude.md](Claude.md) for the session-start primer.

---

## Overview

**Case title:** Velvet Ember: Birthday in Red  
**Platform:** React + Vite PWA with Firebase sync  
**Format:** Live social deduction / networking murder mystery  
**Cast size:** 51 playable guests, 1 fictional victim  
**Investigation shape:** 10 prime suspects, 41 witnesses, 5 killers  
**Duration:** ~2–3 hours across 7 rounds

This version of the game is no longer the 32-player TripleSpeed office mystery. The active case is a birthday party at For the Record in Panjim, Goa, hosted by the fictional liquor CEO Armaan Khanna, who invites ten close friends and tells each of them to bring their own circle. The room initially assumes one suspect and their own group did it. The real answer is a five-person conspiracy spread across different groups, led by Sneha Ganesh.

---

## Story Premise

Armaan Khanna, founder and CEO of Velvet Ember Spirits, is hosting a private birthday party at For the Record in Panjim, Goa on 8 August 2026. Velvet Ember is on the verge of a buyout by Meridien Beverage Group, and Armaan intends to spend the night celebrating himself before legal diligence begins on Monday.

He never reaches Monday.

At 10:12 PM Armaan performs his signature birthday ritual: a one-glass serve called the Last Light, finished with a final orange-oil spray at the private bar. At 10:22 PM he collapses beside the stage rail. At 10:34 PM paramedics stop resuscitation. At 10:48 PM Inspector Ira Deshpande seals the venue and keeps all 51 guests inside.

The public shape of the case is simple: ten prime suspects, each with their own cluster of invitees, all with reasons to hate Armaan. The private truth is more satisfying: Sneha built a five-person team that split the work across money, paperwork, poison, access control, and drink ritual, so the room would waste its first rounds thinking table-by-table instead of across the whole venue.

---

## Core Gameplay Loop

1. Players log in as one of 51 character identities.
2. Round 0 opens with the fullscreen typed briefing and the Incident Report.
3. The host opens a blind first vote before the room has enough evidence.
4. Round 1 automatically gives every player one accusation card on the Evidence screen.
5. Round 2 distributes 10 printed motive cards.
6. Round 3 unlocks forensics and evidence files, distributes 7 evidence cards, and reopens voting.
7. Rounds 4 and 5 deliver the twist through 6 revelation cards and the late-game case files.
8. Round 6 reveals the full killer team to the room and ends the game.

---

## Round Structure

| Round | Name | What players learn |
|---|---|---|
| 0 | The Incident | Public story of the night, victim, venue, first blind vote |
| 1 | Accusations | Ten witness claims pointing at the prime suspects |
| 2 | Motives | Why each prime suspect could plausibly want Armaan dead |
| 3 | Evidence | Single-drink poisoning, atomizer swap, blind spot, forged invoice, access trace |
| 4 | Revelations | Monday scapegoat plan, stolen drink ritual, missing formula page, forged ledgers |
| 5 | Finale | Admin override proof and burner-thread reveal showing cross-group collusion |
| 6 | The Reveal | Public screen names the killer team; killers themselves get the confession |

---

## Cast Architecture

The player network is deliberately social first and investigative second.

- 10 prime suspects anchor the room: Sneha, Kiyaah, Victoria, Roddy, Oindrilla, Tara, Tanvi, Rishi, Vinod, and Anna.
- 5 of those 10 are actual killers: Sneha, Kiyaah, Victoria, Roddy, and Oindrilla.
- The remaining 41 players are witnesses with real grievances, useful alibis, and strong conversation hooks.
- The room is split into 10 circles: nine five-person groups and one six-person group.
- The six-person group is not narratively special; it simply absorbs the 51st player.

### Group Anchors

| Group | Anchor | Supporting guests |
|---|---|---|
| THIMBLE | Sneha Ganesh | Yukta, Shubham, Lakshmi, Ricardo |
| CANVAS | Tara Singhania | Fabiola, Govind, Ajay, Mahi |
| ORACLE | Kiyaah Rose Raghuwanshi | John, Swati, Chinmay, Natasha |
| FORGERY | Victoria Vance | Savvy, Dinesh, Valerie, Chayne |
| HEMLOCK | Roddy Faustus | Flora, Keith, Soham, Hima |
| AMBER | Oindrilla Chatterjee | Vaidehi, Ashish, Chryselle, Akash |
| PIXEL | Tanvi Vartak | Aayushi, Esha, Parinitha, Sunali |
| MYTHOS | Rishi Raj Rahul | Meera, Dona, Nanu, Aarushi |
| REGENT | Vinod Raghuwanshi | Meenal, Amanda, Nolani, Vidya, Khyati |
| REPLICA | Anna Russo | Sanika, Kristen, Anjul, Aaina |

---

## Murder Method

Armaan is poisoned with aconitine, hidden inside the orange-oil finishing spray for his signature drink rather than in the shared alcohol supply. That matters for playability:

- it creates a visible public ritual players remember from Round 0,
- it makes the poisoning feel smart but solvable,
- it keeps the room from getting stuck on "which bottle was bad?",
- and it lets Round 4 pivot from a single-bar theory to a multi-role conspiracy.

### Killer Roles

- **Sneha**: mastermind, motive architecture, Monday binder, social misdirection.
- **Kiyaah**: sole-serve drink ritual access.
- **Victoria**: forged paper trail designed to frame Tara and others.
- **Roddy**: toxin expertise and carrier formula.
- **Oindrilla**: projector reboot, bar-camera blind spot, cloned QR access.

---

## Fair-Play Design

This case is designed to feel big without becoming impossible.

- Round 1 points suspicion inward at each suspect's own group.
- Round 2 makes all ten prime suspects look individually dangerous.
- Round 3 proves it was one altered drink, not a batch poisoning.
- Round 4 reveals Armaan's Monday scapegoat plan and starts linking suspects together.
- Round 5 makes the cross-group conspiracy explicit through the admin trace and burner thread.
- By Round 6 the room should be able to name the full team, not just the mastermind.

---

## Canon Timeline

- 7:00 PM — Doors open at For the Record.
- 9:55 PM — Birthday tribute reel begins.
- 10:08 PM — Projector reboot and bar-camera blind spot begin.
- 10:12 PM — Armaan raises the Last Light.
- 10:19 PM — Symptoms begin.
- 10:22 PM — Armaan collapses.
- 10:34 PM — Paramedics stop resuscitation.
- 10:48 PM — Goa Police seal the venue.

---

## Source Files

- [src/data/gameData.js](src/data/gameData.js) — canonical cast, clue deck, round data, host script, login codes
- [src/data/storyIntro.js](src/data/storyIntro.js) — Round 0 public briefing only
- [src/data/screenGuide.js](src/data/screenGuide.js) — screen framing, onboarding notes, Guide copy
- [src/components/StoryIntro.jsx](src/components/StoryIntro.jsx) — typed briefing
- [src/components/views/IntelView.jsx](src/components/views/IntelView.jsx) — evidence stacks
- [src/components/HostPanel.jsx](src/components/HostPanel.jsx) — live host controls and reveal trigger
