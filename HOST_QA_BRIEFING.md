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
Roddy prepared the poisoned twin atomizer inside his botanical case and carried it into the prep-room corridor at 10:02 PM, leaving it on the prep pass as a wrapped service roll. He came back out at 10:05 without it. Kiyaah collected it at 10:06, two minutes before the blackout. The two never hand each other anything — the atomizer's prep-room linen fibres are the only physical trace of the handoff.

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

### 3a. The floor plan is in Tanvi's handwriting. Isn't she part of it?

**Short answer before Round 5:**
The handwriting is real. Ask what the notes were *for* before asking who they served.

**Canonical answer after Round 5:**
No. The plan is genuinely Tanvi's, in her own fineliner, and DO NOT BLOCK BAR DURING REEL and HOLD CAKE UNTIL ORANGE are stage directions for a cake reveal, not instructions to a conspiracy. Nobody planted it. Sneha arrived at 7:05 PM with the seating plan Armaan wanted rearranged, saw that the party planner had already worked out on paper the exact second the room would turn its back on the private bar, and set the reboot to that second.

If a sharp table objects that the invoice was entered at 5:14 PM — before Sneha ever saw the plan — reward the catch: the plan was always "tonight, during the reel." Tanvi's notes did not create the blind spot; they told the killers exactly which ninety-four seconds were safe, in an innocent's handwriting.

**Canon support:**
- Floor plan clue and `CASE_SOLUTION.misdirection` in [src/data/gameData.js](src/data/gameData.js)
- Sneha and Tanvi timelines in [src/data/gameData.js](src/data/gameData.js)

### 3b. Who opened Tara's crate — and who moved it next to the private bar?

**Short answer before Round 5:**
Ask who benefits from a sealed gift being unsealed early. Then ask who was entitled enough to do it without needing a reason.

**Canonical answer after Round 5:**
Armaan. He had staff open the gift crate early and stage the private-reserve bottles beside the bar for the Last Light moment — the display was the point of the gift, and he never intended to honor the seal. That is why the customs seal was broken before Tara touched it (Fabiola), why the crate sat reopened after he swore it would stay sealed (Khyati), and why it ended the night beside the private bar (Yukta). Nobody in the conspiracy touched it. Victoria's forged invoice was built hours earlier; the crate theatrics were a mess Armaan made on his own, which the frame borrowed for free.

**Canon support:**
- Tara, Fabiola, Khyati and Yukta timelines in [src/data/gameData.js](src/data/gameData.js)
- Supplier Invoice Mismatch clue and `CASE_SOLUTION.misdirection` in [src/data/gameData.js](src/data/gameData.js)

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

### 6a. Who actually walked through the cloned QR? Kiyaah already worked that bar.

**Short answer before Round 5:**
Ask what the QR was for. It is not an access problem — it is a log problem.

**Canonical answer after Round 5:**
Kiyaah did, over a borrowed service apron. She never needed the pass to get into the private bar; she had been behind it since 7:40 PM. What she needed was for the access log to name a staffer who had already clocked out rather than naming her. Oindrilla revived a retired staff QR under the same session tree as the projector reboot, good for exactly one pass in at 10:08 and one pass out at 10:09. Anjul saw the apron come back down the service stair and clocked that the face under it was not staff.

**Canon support:**
- Service QR Access Trace and Admin Override Trace clues in [src/data/gameData.js](src/data/gameData.js)
- Kiyaah, Anjul, Aaina, Chinmay and Parinitha timelines in [src/data/gameData.js](src/data/gameData.js)

### 6b. S.G. could be Sneha Ganesh, Shubham Goyal or Savvy Grover. Which one?

**Short answer before Round 5:**
Good catch — say so out loud. Then ask which S.G. could have written those particular lines.

**Canonical answer after Round 5:**
Sneha. The roster really does hold three S.G.s, and two of them sit inside conspirators' circles — Shubham in Thimble, Savvy in Forgery — which is exactly why the initial is worth arguing about. Content settles it. The burner S.G. controls the Monday folder and rules out tables and families; the binder S.G. carries the rebate structure. A software engineer and a freelance creative are nowhere near a rebate model. Initials narrow the field; the job names the person.

### 6c. Are the four Raghuwanshis related?

**Short answer before Round 5:**
No relationship is established anywhere in the case. Treat it as a coincidence of guest lists.

**Canonical answer after Round 5:**
No. Kiyaah Rose Raghuwanshi, Vinod Raghuwanshi, Meera Victoria Raghuwanshi and Meenal Raghuvanshi share a name and nothing else. No family link exists in the case and no clue depends on one. If a table builds a theory on it, let them enjoy it, then point out that the conspiracy aligns people by job, not by blood.

### 6d. Half the room saw Oindrilla at the console. Why bother with a cloned credential?

**Short answer before Round 5:**
Separate what she was *seen* doing from what the log says was *done*. They are not the same question.

**Canonical answer after Round 5:**
Because the log, not the sighting, was the danger. Being seen at the console is survivable: she built the venue's systems, the reel had just frozen, and a systems lead rebooting a frozen reel is the most natural picture in the room — cause reads as response. But the session that forced the reboot also revived the retired staff QR that put Kiyaah's bar entry into the log under a departed staffer's name, and that session could never carry Oindrilla's own login. The clone kept her name off the QR, and the QR kept Kiyaah's name off the bar. Same trick, both women: legitimately present, logged as somebody else.

**Canon support:**
- Admin Override Trace and Service QR Access Trace clues in [src/data/gameData.js](src/data/gameData.js)
- Lakshmi, Dinesh, Nanu and Vaidehi timelines in [src/data/gameData.js](src/data/gameData.js)

### 6e. Why did the killers care that the Monday folder stayed upstairs?

**Short answer before Round 5:**
Ask what was scheduled to happen to that folder on Monday — and what happens to that schedule if Armaan dies on Saturday.

**Canonical answer after Round 5:**
Two reasons, both cold. First, confirmation: the folder still sitting in the upstairs booth meant the scapegoat script had not yet gone to Meridien's lawyers — kill Armaan that night and the handoff died with him. That is why the burner thread's first line is "monday folder stays upstairs. we finish it tonight." Second, misdirection: left where the police would find it, the binder scatters motive across five sets of initials — S.G., T.S., V.V., O.C., T.V. — only three of them belonging to killers. Destroying it would have protected two innocents and narrowed the field. Leaving it widened it.

**Canon support:**
- Burner Group Transcript and Monday Binder Index in [src/data/gameData.js](src/data/gameData.js)
- `CASE_SOLUTION` sequence (the 9:50 PM beat) in [src/data/gameData.js](src/data/gameData.js)

### 6f. How did five people from five different circles find each other in two days — and why did nobody warn Armaan?

**Short answer before Round 5:**
Ask what Sneha's actual job was for the last decade. Then ask what each of the five was holding the week of the party.

**Canonical answer after Round 5:**
Sneha's job was making Armaan's thefts look clean in the numbers, so she knew every wound in the room — she had priced each one. The binder told her who else was already written into the fall: Victoria's initials on the shell ledgers, Oindrilla's on the inventory breach. She recruited them with proof that Armaan had already chosen them. Roddy and Kiyaah were not in the binder, which is exactly why she wanted them — she had packaged both of their stolen programs into the buyout story herself, so she knew what he had taken and what each could still do.

Nobody warned Armaan because every recruit was holding fresh, provable evidence that he was about to destroy them; warning him meant handing back the knife he was already sharpening. And two days was enough because nothing needed inventing — the formula was Roddy's, the ritual Kiyaah's, the admin path Oindrilla's, forging is Victoria's trade. The only fabrications were one invoice and one label.

**Canon support:**
- "How the Five Found Each Other" in [STORY.md](STORY.md)
- Killer motives and `CASE_SOLUTION.why` in [src/data/gameData.js](src/data/gameData.js)

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

### 9. Who was Roddy talking to when Valerie heard him say "dose"?

**Short answer before Round 5:**
Nobody — and that is worth noticing.

**Canonical answer after Round 5:**
Nobody. Valerie caught him muttering to himself on his way to the prep corridor, running the arithmetic one last time — small enough to hide under the oil, large enough to stop a heart. Roddy talks to himself the way other people check their pockets. It is the one unguarded slip he makes all night.

### 10. Who said "orange, not bottle" near the bar at 10:04?

**Short answer before Round 5:**
Ask who was giving instructions at that bar in that minute.

**Canonical answer after Round 5:**
Kiyaah, walking staff through the Last Light garnish sequence: the finish comes from the orange mister, not from the bottle. To the staff it was a service instruction. Set beside the burner thread's "orange is cleaner than bottle," it reads as what it was — the method, said out loud, dressed as bar craft.

### 11. Anna was seen at a display cabinet and at the gift table in the same minute. Which is it?

**Short answer before Round 5:**
Check the geography before calling it a contradiction.

**Canonical answer after Round 5:**
Both — they are the same corner. The display cabinets stand along the record wall directly above the gift table, which is where the collector bottles Anna handled were shown. Aayushi and Chayne describe one sighting from two angles. Anna stays exactly where her own account puts her; what keeps her suspicious is that she was checking a replica while everyone else watched a dead screen.

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
- Chryselle: saw Sneha leave the upstairs booth empty handed, the red folder still open on the table
- Sunali: heard Sneha ask which upstairs room the red folder had been left in

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
