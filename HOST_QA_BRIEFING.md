# Host QA Briefing
## Velvet Ember: Birthday in Red

Use this sheet only if the room presses on logic, timing, or physical plausibility. Do not volunteer these answers early unless the game is genuinely stalling.

---

## How to Use This

- Before Round 5: redirect players back toward the relevant clue category rather than confirming the answer.
- After Round 5: you can answer more directly, because the case has already shifted from suspicion to proof.
- After Round 6: use the full canonical answer.

A good host answer should make the room feel rewarded for noticing something, not punished for poking at the story.

---

## Fast Answers

### 1. How did Roddy get the poison to Kiyaah?

**Short answer before Round 5:**
The prep-room path matters. Track Roddy's case, Kiyaah's bar setup, and the mister itself.

**Canonical answer after Round 5:**
Roddy prepared the poisoned twin atomizer inside his botanical case and moved it through the prep-room as a wrapped service roll. Kiyaah collected that wrapped mister during bar setup before the blackout. The atomizer later carries prep-room linen fibres, which is the physical trace tying the handoff together.

**Canon support:**
- Roddy timeline in [src/data/gameData.js](src/data/gameData.js)
- Kiyaah timeline in [src/data/gameData.js](src/data/gameData.js)
- Atomizer clue in [src/data/gameData.js](src/data/gameData.js)
- Ricardo, Savvy, and Govind witness timelines in [src/data/gameData.js](src/data/gameData.js)

### 2. How could Parinitha see the swap if the blackout happened at the same time?

**Short answer before Round 5:**
The blackout killed the camera, not every sightline in the room. Check where people were physically placed.

**Canonical answer after Round 5:**
Parinitha was on the side banquette by the bar arch. The floor-plan note now makes clear that this lane stayed visually open even while the main crowd turned toward the frozen screen. She saw the swap from the side, not from the center of the room.

**Canon support:**
- Parinitha timeline in [src/data/gameData.js](src/data/gameData.js)
- Floor plan clue in [src/data/gameData.js](src/data/gameData.js)
- Bar-camera blackout clue in [src/data/gameData.js](src/data/gameData.js)

### 3. Was Tara actually involved because of the back-bar keycard?

**Short answer before Round 5:**
Tara is meant to look dangerously close to the bar story. That does not make her part of the conspiracy.

**Canonical answer after Round 5:**
The accusation only says witnesses saw what looked like Armaan's back-bar keycard on Tara. The important point is that Victoria's forged invoice was designed to piggyback on Tara's legitimate display-world access and make her feel service-adjacent. Tara is a frame target, not a killer.

**Canon support:**
- Tara accusation in [src/data/gameData.js](src/data/gameData.js)
- Forged invoice clue in [src/data/gameData.js](src/data/gameData.js)
- Victoria motive/revelation trail in [src/data/gameData.js](src/data/gameData.js)

### 4. How was the forged invoice entered at 5:14 PM if Victoria arrived later?

**Short answer before Round 5:**
The interesting part is not where Victoria was standing later. It is whether the document had to be made on-site at all.

**Canonical answer after Round 5:**
It did not. The invoice clue establishes that the entry was pushed remotely rather than drafted on the venue terminal. Victoria prepared the forgery off-site and had it entered into the inventory trail before guest arrival.

**Canon support:**
- Invoice clue in [src/data/gameData.js](src/data/gameData.js)

### 5. Are the back lane, service doors, and rear access all the same place?

**Short answer before Round 5:**
Yes. Treat them as the same rear-service spine of the venue unless a clue explicitly distinguishes them.

**Canonical answer after Round 5:**
The story uses a few witness-level labels for the same rear service area: the back lane outside, the service doors feeding into it, and the private meeting zone Armaan used when he wanted conversations off the main floor.

### 6. Why were Sneha, Victoria, and Oindrilla in the Monday binder, but Roddy and Kiyaah were not?

**Short answer before Round 5:**
Because Armaan only planned scapegoats for the threats he thought mattered to Monday.

**Canonical answer after Round 5:**
Armaan saw Sneha, Victoria, and Oindrilla as business-risk liabilities tied to the buyout, paper trail, and system controls. He used Tara and Tanvi as convenient innocent fall girls. He underestimated Roddy as an outsider and assumed he still controlled Kiyaah through the ritual and personal leverage. That blind spot is part of why the conspiracy works.

### 7. Why doesn't the burner thread simply list all five names?

**Short answer before Round 5:**
Because that clue is supposed to prove coordination, not end the game by itself.

**Canonical answer after Round 5:**
The burner thread is intentionally evidentiary rather than theatrical. It gives initials, roles, and intent. The room still has to map those initials onto the method and the suspect web. It is the legal-proof clue, not the first clue.

### 8. Why can players vote for the full room if only 10 people are prime suspects?

**Short answer before Round 5:**
Because the room does not begin with certainty about who matters. The game wants social paranoia before it narrows.

**Canonical answer after Round 5:**
The 10 prime suspects are where the clue deck concentrates suspicion, but the ballot remains open to the whole room so players can make bad theories before the evidence teaches them to focus.

---

## Best Witnesses To Nudge If The Room Stalls

Use these only as conversational nudges, not as forced reveals.

### Method / atomizer lane
- Ricardo: heard Kiyaah ask for a fresh orange-oil mister
- Swati: saw the polished silver mister on the tray
- Parinitha: saw the swap from the side banquette
- Aarushi: said the bitter-orange note was not coming from the bottle
- Flora: smelled something medicinal under the orange peel

### Blackout / systems lane
- Lakshmi: saw Oindrilla at the admin screen
- Vaidehi: saw the admin override flicker
- Nanu: saw Oindrilla near the booth with an admin tablet
- Chinmay: heard the service QR beep
- Dona: was physically at the mic when the projector glitched

### Paper trail / frame-job lane
- Ajay: saw Victoria with the envelope
- Meera: heard Oindrilla and Victoria whisper “invoice”
- Nolani: heard Victoria say “shell account”
- Chayne: phone footage places Anna near the gift table during the glitch

### Mastermind lane
- Chryselle: saw Sneha leave the upstairs booth with the Monday binder
- Sunali: heard Sneha ask whether the Monday binder was still upstairs

---

## If You Need To Recenter The Room

### Round 3 prompt
Ask: who has evidence that this was one altered drink instead of a poisoned batch?

### Round 4 prompt
Ask: who was Armaan preparing to sacrifice on Monday, and why those people?

### Round 5 prompt
Ask: map the initials to functions first. Who had the ritual? Who had the paper? Who had the blackout? Who had the toxin? Who had the reason to coordinate them?

---

## Host Rule

If a player has found a real edge in the story, reward the observation. Confirm that they are looking in the right direction, but do not solve the case for the room before the clue ladder has earned it.
