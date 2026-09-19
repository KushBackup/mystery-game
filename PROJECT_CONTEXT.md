# Astral Project's Murder Mystery Experience
## Project Context

> Maintenance note: Update this file whenever the live case premise, round flow, cast scale, or host flow changes. See [Claude.md](Claude.md) for the session-start primer.

---

## Overview

**Case title:** Greenr: Last Seating (Case 2609-G)  
**Platform:** React + Vite PWA  
**Format:** Live social-deduction murder mystery at a private closing dinner  
**Cast size:** 26 playable guests, 1 fictional victim  
**Investigation shape:** 10 suspects, 16 witnesses, 3 killers  
**Duration:** ~1.5-2.5 hours across 7 rounds

The active case is set at **Greenr, Assagao, Goa**, on **19 September 2026**. Twenty-six founders, collaborators and advisers have gathered for a sunset signing dinner that is meant to close a Greenr launch vehicle. Instead, the evening collapses when **Rehan Vora**, an independent diligence partner hired to bless the numbers, is found dead in the upstairs library before the welcome line begins.

---

## Story Premise

Rehan spent the day asking the kind of questions rooms like this hate: who got paid twice, who rewrote which paper, why the same work seemed to exist on three invoices, and why so many "temporary" problems seemed to benefit the same small circle of people. By sunset he had separated the room into three criminal lanes and seven merely embarrassing ones.

That split is the case's engine. Ten guests have real reasons to fear what Rehan is about to say. Only three decide that the signing cannot survive him.

At **5:58 PM**, the launch reel stutters, the guest Wi-Fi dies and the card reader goes with it. In a room like this, that looks like inconvenience. In this case, it is cover. Rehan returns upstairs, refills the black bottle he always carries, and collapses minutes later. By **6:40 PM**, rain, the gate chain and the police have sealed Greenr with all 26 players still inside.

---

## Core Gameplay Loop

1. Players log in as one of 26 guest identities.
2. The host starts the room; Round 0 opens with the fullscreen typed briefing.
3. A player tutorial then reveals the app one task at a time: identity, one guest profile, Comms and the voting screen.
4. Each round clock automatically gives every player a five-minute ballot when it reaches zero; then a public tally names every voter and their choice.
5. The host starts the next round only after that announced tally.
6. Round 1 directs every player to their accusation card on the Evidence screen - one suspect-lane witness claim from their statement pod.
7. Round 2 opens the riddle lock and puts the 10 motive files into its prize pool.
8. Round 3 unlocks case files and adds 8 evidence clues to the pool.
9. Rounds 4 and 5 deliver the turn through 6 revelation clues and the late-game case files.
10. Round 6 reveals the killer team, hands the killers the confession and opens the reconstruction deck for the room.

### Arrival Tutorial

The tutorial replaces the old passive screen-note onboarding. It is stored locally per player, so a reload resumes the next task without writing any tutorial state to Firestore. In Round 0, the hub exposes only the destination required for the current lesson; the player must open their identity, a guest profile, Comms and voting in that order. After the vote lesson the core screens remain available, while Evidence remains held until Round 1. At Round 1, unfinished tutorials advance to the Evidence lesson so no player misses their assigned accusation; completing it releases the normal board and the later round gates take over.

### Late Walk-Ins

The host may issue a one-time pass for a late arrival. The player completes a short Beautiform-style registration on their own phone, then joins the same public screens, chat, clue economy, accusations and voting as the original room. They appear in Guests as a **Walk-in**, trigger a live arrival notice and can vote only for the ten canonical suspects.

Walk-ins are deliberately not story characters. They do not change the 26-player cast, suspect count, killer team, statement pods, clue decks or reveal. This preserves the fair-play case while letting a late arrival participate immediately.

---

## How Clues Reach Players

**There are no printed clue cards.** Login cards are the only paper.

On the Evidence screen two buttons sit bottom right:

| Button | What it does |
|---|---|
| **ASK** | Deals a general riddle. Solve it and the next clue in *your* queue unseals, along with its code. Appears in Round 02. |
| **CODE** | The decoder. Type in a code someone else has read out and the same clue lands on your board. Present from Round 00. |

The pool shape for this case is:

- **10 motives** in Round 2
- **8 evidence clues** in Round 3
- **4 revelations** in Round 4
- **2 revelations** in Round 5

Every player has a different queue order. Solving is private; circulation is social.

---

## Round Structure

| Round | Name | What players learn |
|---|---|---|
| 0 | The Incident | Public story of the dinner, the victim, the seal, the first blind vote |
| 1 | Accusations | Ten witness claims pointing at the suspect list |
| 2 | Motives | Why ten different people feared Rehan's corrections |
| 3 | Evidence | The bottle, the staged crash, the AV blind spot, the frame on Nilisha, the yellow hedge |
| 4 | Revelations | Rehan's memo, the run-sheet audit, the side-letter analysis and the delivery manifest |
| 5 | Finale | The group chat and beneficiary map make the three-person conspiracy explicit |
| 6 | The Reveal | Public screen names the killer team; the reconstruction explains the mechanism |

---

## Cast Architecture

- 26 playable guests, all drawn from the user's submitted roster and rendered by first name only.
- 10 are suspects. Every suspect is prime - there is no second suspect tier in this case.
- 3 of those 10 are actual killers: **Jack**, **Arun** and **Manasi**.
- The other 7 suspects are innocent red herrings with real reasons to fear Rehan's diligence: **Anushka**, **Anmoll**, **Nilisha**, **Amrusha**, **Saima**, **Umair** and **Sampada**.
- The remaining 16 players are witnesses with load-bearing observations, alibis or contradiction points.
- For Round 1, the roster is split into **10 statement pods**. Each pod receives the accusation about one suspect and no pod receives the accusation naming one of its own members.

---

## Murder Method

Rehan is poisoned with **concentrated yellow-oleander extract** painted inside his own matte-black steel bottle while it sits empty on the upstairs tea shelf. His 6:08 PM refill dissolves the film.

This matters for playability:

- the bottle is a visible public habit from Round 0,
- the communal drink stays clean, so the case is about a private vessel not a shared batch,
- the 5:58 crash moves attention away from the upstairs route,
- and the entire mechanism depends on timing, paper and venue knowledge rather than on a random stab at opportunity.

### Killer Roles

- **Jack** (Legal - lead): sees the first close-review queries on 18 September, recruits the other two, drafts then refreshes the Nilisha frame, and stages the paper panic that keeps the founders occupied.
- **Arun** (Media): schedules the AV sync at 4:46 PM, blanks the live feeds from 5:58 to 6:11, loops the sunset reel and deletes the buffered corridor clip.
- **Manasi** (Bar): carries in the concentrate in a brown bitters dropper, paints the inside of Rehan's bottle at 6:02 PM and keeps the room's bar program clean.

---

## Fair-Play Design

- Round 1 gives all ten suspects plausible heat.
- Round 2 proves ten people had reasons to dread the signing - motive alone closes nothing.
- Round 3 settles that the poison traveled through a private bottle, not the communal tonic or the bar.
- Round 4 separates the room's messy truth from its murderous truth: three criminal lanes, seven embarrassing ones.
- Round 5 closes the three-person conspiracy through the recovered chat and the beneficiary map.
- By Round 6 the room should be able to name all three killers and explain what each one did.

---

## Canon Timeline

- 4:10 PM - Final setup begins at Greenr.
- 4:46 PM - Arun schedules the AV sync that will later create the blind spot.
- 5:15 PM - Guest check-in opens and the courtyard fills.
- 5:47 PM - Rehan rinses and leaves his bottle on the upstairs tea shelf.
- 5:58 PM - The sync hits: live feeds blank, local corridor capture buffers, and guest Wi-Fi and card reader fail.
- 6:02 PM - Manasi doses the bottle while Jack occupies the founders and Arun loops the reel.
- 6:08 PM - Rehan refills the bottle and returns to the upstairs library.
- 6:18 PM - Nathan finds him; Sharon reaches him seconds later.
- 6:31 PM - Likely poisoning is spoken out loud.
- 6:40 PM - Police seal Greenr. No guest has left since 5:25 PM.

---

## Source Files

- [src/data/gameData.js](src/data/gameData.js) - canonical cast, clues, pods, case files, answer key and host script
- [src/data/storyIntro.js](src/data/storyIntro.js) - Round 0 public briefing only
- [src/data/screenGuide.js](src/data/screenGuide.js) - screen framing, onboarding notes and round guide
- [src/data/hostReference.js](src/data/hostReference.js) - host suspect map, witness nudges and question handling
- [src/components/StoryIntro.jsx](src/components/StoryIntro.jsx) - typed briefing
- [src/components/views/IntelView.jsx](src/components/views/IntelView.jsx) - round-aware Evidence tabs
- [src/components/HostPanel.jsx](src/components/HostPanel.jsx) - live host controls and reveal trigger