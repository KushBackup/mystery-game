# STORY.md — The Narrative Bible

> **Case:** `2108-C` · **TripleSpeed: Onam in Black**
> **⚠️ FULL SPOILERS.** This file is the canon for the whole case. Every clue, timeline
> line, host answer and reveal slide restates something written here. If the story
> changes, this file changes first — then `gameData.js`, `revealDeck.js`,
> `reveal-deck/index.html`, `storyIntro.js`, `hostReference.js` and the host docs.

---

## 1. The world

**TripleSpeed** is a direct-response marketing and commerce company chasing one number:
**$10 million a month**. It is a little over halfway there. The company operates out of
its registered entity, **Chimp Processing Pvt Ltd**, in the **Midford KTR2** building,
Indiranagar, Bangalore — a fact that confuses every courier and amuses nobody in ops.

The building:

- **Basement** — parking, one boom barrier, a guard, and a paper gate register.
- **Ground floor** — not TripleSpeed. A diagnostics lab, the lobby, and building
  reception (visitor badges V-01 to V-12 live in a tray there).
- **Floor 1** — HR (talent acquisition, people ops) and a video-edit bay, plus the
  store room (party supplies, the terrace gardening kit).
- **Floor 2** — Elias (CMO, co-founder), the marketing team, the ops team, payments,
  customer support, and more video editors. The **War Room** (F2 meeting room) is here,
  as is the one phone booth.
- **Floor 3** — the entire engineering department, the design team, product, Sukhans
  (Director, co-founder) in a glass-walled cabin, and Aarohi (executive assistant)
  outside it. The **Glass Room** (F3 meeting room) is here. So is **the Beast**: a
  coffee machine that works roughly 10% of the time and makes the entire floor smell
  like burnt coffee 100% of the time.
- **Terrace** — a long-table eating area (not a cafeteria), a smoking corner screened
  from the rest of the terrace by a chest-high **oleander hedge** in planter boxes,
  and the spot where the Onam pookalam went down.

Company life, as everyone knows it: a ₹1,500 daily Zomato budget (Alienkind, Cafe 27,
Yuki, Caterspoint, Sandowitch, California Burrito, Third Wave, Starbucks, Fat Smash,
Meghana Biryani, Chaayos), free company Ubers **before 9 AM and after 6 PM** (logged
centrally on the Uber-for-Business dashboard — this matters), and a running weather
system of ordinary disasters: WiFi flaps, payment-provider hiccups, low-ROAS weeks,
high ad-spend months, ticket pileups, design revision spirals, AWS billing shocks, and
one vendor last May that "turned out to be a scammer."

**That weather system is the murder weapon's camouflage.** Every anomaly on 21 August
looked like a Tuesday.

## 2. The victim

**Dev Malhotra**, 46 — an independent revenue-assurance consultant. Not an employee.
Three weeks before the party, Elias and Sukhans quietly engaged him to answer one
question: *why do the margins bleed as revenue scales?* Internally he was introduced
as a "payments-migration consultant" — a cover story most of the office believed.

Dev worked out of the Glass Room on the third floor. Known for exactly three things:

1. A steel tumbler engraved **DM** that nobody else was permitted to touch.
2. A post-lunch ritual: one long pull of the Beast's over-extracted "engine oil"
   americano, two sugar sachets, door shut, headphones on.
3. The line "₹1,500 is for food" — he refused, on principle, to spend the Zomato
   budget on Third Wave when a machine existed on his floor. He filed two of the four
   ignored tickets about it himself.

He was scheduled to present his findings to the founders and team leads at the
**4 PM evening party**, disguised on the calendar as a "Ways of Working" toast.
He died at approximately 3:40 PM.

## 3. The leak (what Dev found)

Four channels, one network, roughly **₹3.4 crore over 14 months**:

| Channel | Mechanic | Whose lane | Masked as |
|---|---|---|---|
| **Reserve diversion** | The payment provider's rolling-reserve releases were redirected to a look-alike beneficiary — **"CHIMP PROCESING PVT LTD"**, one S short — for three cycles a quarter | Anurag (Head of Payments) | "payment provider issues again" |
| **Cloud partner** | Compute bought through a third-party reseller at marked-up committed-use rates, kickback returned off the books | Yao (Technical Lead) | "AWS billing is out again" |
| **Ghost vendor** | "Zenlyt Productions LLP" invoiced ₹68L of shoots, props and edit-contracting that never happened. POs raised by Giles, deliveries second-signed by Kalaivani. When one invoice was questioned in May, the vendor was burned as "a scammer" and quietly rebooted as **"Kirola Studios"** — so the eleven months of paper is nine months of Zenlyt and two of Kirola, which is why the GRN ledger and the PO run both read eleven | Giles (Operations Executive) + Kalaivani (Operations & Customer Support) | "the vendor turned out to be a scammer" |
| **Media reseller** | A slice of ad spend routed through a reseller ad account at a 12% kickback | Akshat (Media Buyer) | "high ad spend, low ROAS" |

The week it came apart:

- **Tue 18 Aug** — Dev pulled the payment provider's **settlement archive** directly
  from the provider portal, using founder-granted access. It was the one dataset
  nobody inside could sanitize. The portal emailed a pull notification to the billing
  admin: **Anurag**.
- **Wed 19 Aug** — Dev uploaded **Findings v0.9** to a restricted Drive folder. Yao,
  who holds Workspace admin, saw it. The draft named five *roles* (initials only):
  HoP, TL, OE, CS-O, MB. That evening the five compared notes in a group chat
  disguised as **"Fantasy League ⚽"**. At 11:58 PM Akshat fabricated the Zenlyt
  onboarding pack pointing at Victor. Overnight, the oleander hedge got pruned.
- **Thu 20 Aug** — Dev emailed Giles a checklist request: "all POs under ₹5L,
  FY 25-26." He argued with Luke about VIP comps loudly enough for F2 to hear. Nehal
  cornered him on the terrace stairs about "the split."
- **Fri 21 Aug** — Onam. Execution.

## 4. The conspiracy — five people, five jobs

Held together by one fact: **each of them was already named in the draft.** Nobody
had to be persuaded to hate Dev; they had to be persuaded the others were equally
exposed. Anurag did the persuading.

| Killer | Role | Job | The piece |
|---|---|---|---|
| **Anurag** — Head of Payments (F2) | **The plan** (lead) | Saw the archive-pull notification, read what Friday meant, recruited the other four in a night. Staged the **2:47 PM payment alert** — a replayed sandbox webhook fired from inside the office network — to thin the party and hand half the suspects a reason to move | The staged incident |
| **Kalaivani** — Ops & Customer Support (F2) | **The toxin** | Waters the terrace planters every morning; has a chemistry degree the support queue never asks about. Clipped the oleander hedge behind the smoking corner Wednesday night, brewed a concentrate at home over two evenings, carried it in on Friday morning in her chai flask — decanting Giles's share into a small bottle in the car and keeping the remainder, which is why the flask spent the party unopened | The concentrate |
| **Giles** — Operations Executive (F2) | **The hands** | Logged the **8:12 AM "urgent"** service ticket that resurrected the coffee machine (after two weeks dead and four ignored tickets), took the decanted bottle from Kalaivani in their shared 8:37 AM Uber, and at **2:52 PM** — during the staged alert, inside the camera gap — dosed Dev's rinsed, staged tumbler at the F3 coffee nook. Rode the service lift on **visitor badge V-07** — pocketed from the reception tray at 9:41 when he signed the technician in — ran a blank test shot on the machine, and was back in the War Room by 3:05 claiming HDMI duty | The dose |
| **Yao** — Technical Lead (F3) | **The blind spot** | Staged the **11:04 AM "WiFi outage"** (43 minutes) that also reinitialized the camera NVR — corrupting all recorded footage from the morning, including the basement arrival tape. From the same admin session: deleted Dev's Drive upload at 11:23, scheduled an NVR "maintenance restart" for **2:45–3:21 PM**, and re-armed dead visitor badge V-07 | The gap |
| **Akshat** — Media Buyer (F2) | **The false trail** | Fabricated a Zenlyt onboarding dossier and email thread "proving" Victor sourced and vouched for the ghost vendor — created Wednesday 11:58 PM, backdated thirteen months. Filed a backdated vendor-escalation ticket to match | The frame |

### Why murder, and not something smaller

The briefing was at 4 PM Friday. There was no version of that meeting the five
survived professionally — and probably not legally. Killing Dev killed the meeting;
Yao had already deleted the Drive draft; the laptop was password-locked; and the
prepared story — *the leak was Zenlyt, a scammer long gone, onboarded by a careless
marketer* — was sitting in the vendor file waiting to be found. It nearly worked.
What they did not know: Dev kept a **local copy** of the draft, and the settlement
archive he pulled Tuesday could simply be re-issued by the provider.

### Why poison, and why the coffee machine

- The sadhya was a shared buffet — untargetable. Dev ordered nothing on Zomato.
  The only victim-specific vessel in the building was the DM tumbler.
- Oleander is free, grows ten feet from the smoking corner, and produces no
  procurement trail. Its bitterness disappears under the Beast's infamously
  over-extracted coffee and Dev's two sugars. The whole third floor smells of
  coffee anyway.
- The machine had to work on Friday — hence the 8:12 ticket. The vendor's job sheet
  later notes: **"no fault found — inlet valve had been manually shut."** The Beast's
  two-week death was engineered; the repair was an appointment. The blank shot at
  2:52 (the brew counter logs three pulls that day: 9:41, 2:52, 3:15) was Giles
  confirming the machine would not embarrass the plan.
- Dev's ritual did the rest. Nobody had to lure him anywhere. The dose waited
  twenty-three minutes in the bottom of his own tumbler.

## 5. The day — master timeline (canon)

| Time | Event | Seen/known by |
|---|---|---|
| 8:12 AM | Giles logs the "urgent — before the party" coffee-machine ticket | Aksharaa (facilities inbox) |
| 8:37 AM | Kalaivani and Giles arrive in one company Uber — a first. The trip receipt (central dashboard) shows a 4-minute stop at Giles's building gate (8:29–8:33). A bottle decanted from her chai flask changes bags in the car; the flask keeps the rest | Uber dashboard; Jason and Kursheeth see them walk in together at 8:41 |
| 8:55 AM | Dev arrives, Glass Room, door shut | Badge log |
| 9:41 AM | External technician revives the Beast; signs out at 10:05 (not a suspect). Job sheet: "no fault found — inlet valve manually shut". Giles signs him in at ground-floor reception and draws him a badge from the visitor tray — the one moment in the day Giles has a reason to stand over that tray, and where **V-07** leaves it | Vidisha, Chirag hear the grinder test; the floor jokes about the smell |
| 11:04–11:47 AM | "WiFi outage." NVR reinitialized — the **whole fourteen-day array** is lost, not just the morning, which is why Wednesday night and Thursday evening rest on witnesses rather than tape; badge sync down. Yao alone in the F3 network cupboard, waves off help | Shrey (waved off, "the array is rebuilding"), Tauseef (told "known issue"), Priyanshu (offered the old admin password, declined), Mohit P. (told "corrupted in the failover") |
| 11:23 AM | Dev's Drive upload deleted from an admin session on a laptop docked at the network-cupboard console (which is what Vadini's 11:31 cast-fail screenshot caught). Same session schedules the 2:45 PM NVR restart and re-arms badge V-07 | Workspace audit (Round 4) |
| 12:40 PM | Aarohi prints one page for Dev, stands at the printer so the tray never holds it | Vidisha |
| 3:04 PM | Aarohi goes down to lay the Glass Room out for the 4 PM and straight back up. Dev is still on the terrace; the room is empty. Nobody sees her either way — **this is why she is on the POI list** | Nobody |
| 12:45 PM | Caterspoint sadhya arrives; Aksharaa and Nikitha receive it | — |
| 1:00 PM | Onam lunch on the terrace. Pookalam judged 1:30 (design team wins). Games from 2:00, hosted by Elias and Aman. Aman livestreams 2:30–3:50 — the footage that later alibis half the room | Everyone |
| 2:47 PM | "Settlement failure" alert in the ops channel — a replayed sandbox webhook, fired from inside the office network. Anurag was typing on his phone *before* the ping sounded | Sagrika, Neha (both saw the typing); Akshay later notes the provider status page stayed green |
| 2:45–3:21 PM | NVR "maintenance restart" — floors and basement cameras blind. Scheduled at 11:31 AM | Device log (Round 3) |
| 2:49 PM | War Room convenes on F2: Anurag, Yao, Akshay, Adithya; Bhuvan in and out | Each other |
| 2:52 PM | Giles on F3 — "fetching the HDMI" (which Yash T. already had on the terrace). Runs a blank shot, doses the tumbler. Service lift logs **badge V-07** in and out | Utkarsh half-sees him at the nook holding a steel tumbler and files it as party cleanup — his own inference, never Giles's story, and nobody clears cups one floor below a party still in progress; Rishabh hears the machine hiss |
| 2:50–3:10 PM | The window scatters people: Victor in the F2 phone booth (client call, 2:50–3:10, verifiable); Sukhans leaves at 3:00 for an investor call in his cabin (Ishan sees him pacing); Nehal handles a WhatsApp client escalation on F2; Prerna fetches a montage source file from the F2 edit bay (access log 2:57) in front of Vipin and Aarush, who never volunteer it because they were idling in there themselves, and returns by the service stairs because the lift is held at F2; Kalaivani makes a 9-minute chips run to the F1 store (2:58–3:07); Luke makes two gate runs (Zomato + a VIP courier — the second entry is on the register's next page, found later); Amisha fetches the founders' gift from the F2 safe; Aditi hands a creator package to a courier; Aksharaa signs in a catering top-up; Kashish pulls game prizes from the F1 store; Pragati prints quiz sheets; Raaghav fetches the mascot cutout from F3 (crosses Prerna); Tauseef, Sanad and Sharad are behind the hedge in the smoking corner; Vipin and Aarush render the Onam reel in the F2 edit bay; Navya exports a client cut on F1; Ishika sits her 3 PM email send; Sonia and Bhuvan work the ticket pile; Thejas never went up at all (deadline); Ishan, Rishabh, Utkarsh, Yash S., Priyanshu are at F3 desks on the hotfix | Various — this scatter **is** the 34-person suspect list |
| 3:12 PM | Dev leaves the terrace — "save me some payasam" to Elias | Elias |
| 3:15 PM | Dev brews. Two sugars. Glass Room, door shut | Thejas hears the grinder, doesn't look up |
| ~3:25–3:40 PM | Oleandrin does what oleandrin does. He tries to stand, knocks the tumbler, goes down behind the frosted half of the glass | Nobody |
| 3:31 PM | Shashwat passes the Glass Room, sees Dev "head down over his notes, reading" | Shashwat |
| 3:45 PM | Aarohi shreds one page at the F3 shredder | Vidisha |
| 3:55 PM | Aarohi comes to fetch the good speaker for 4 PM, sees him through the glass. Yash T. and Pranav D. run down; Kursheeth (first-aid trained) starts CPR; Luke calls 108; Elias holds the terrace | The whole office, within a minute |
| 4:14 PM | Paramedics declare him dead. Presentation inconsistent with simple cardiac arrest — "query poisoning" goes on the sheet | — |
| 4:30 PM | Inspector Arjun Kale (Indiranagar Division) seals floors 1–3 and the terrace. Gate register and badge log confirm: **nobody left the building between 1:00 and 4:30** — company Ubers do not even run until 6 PM | Everyone |

Statements are taken in twelve pods. The game is the evening that follows.

## 6. The suspect pool — why 34

The police cross Aman's livestream, the pookalam photos and the badge log, and draw
one line: **anyone who cannot be continuously placed on the terrace between 2:45 and
3:25 PM is a person of interest.** Thirty-four people fail that test — most of them
for utterly mundane reasons, which is the point. The other thirty-five alibi each
other frame by frame.

- **The five killers**: Anurag, Yao (both in the War Room — off-terrace, alibied for
  the window because their jobs were done remotely or in advance), Giles (the gap),
  Kalaivani (the chips run — her real work was finished by 9 AM), Akshat (at his desk
  with the Zenlyt folder open).
- **Seven prime innocents** the clue decks concentrate on: **Victor** (framed
  outright), **Sukhans** (hired the victim, fought the audit extension, alone twenty
  feet from the Glass Room), **Aarohi** (found the body, printed and shredded for
  Dev, and laid the Glass Room out alone at 3:04 — her one window gap), **Nehal** (the "publish that split" argument), **Prerna** (the related-party
  design vendor, the service stairs), **Adithya** (ran the provider migration the
  skim hid under — "missed it or enabled it"), **Luke** (the comps fight, the
  unlogged gate run).
- **Twenty-two more persons of interest**, each with a boring true story: Vipin,
  Yash S., Sharad, Aditi, Aksharaa, Rishabh, Akshay, Kashish, Ishan, Sanad, Pragati,
  Raaghav, Bhuvan, Aarush, Tauseef, Sonia, Ishika, Thejas, Navya, Amisha, Utkarsh,
  Priyanshu.

## 7. Misdirection — why the room can't close it

1. **The framed man.** The vendor pack says Victor brought Zenlyt in. Metadata says
   the pack was created Wednesday at 11:58 PM. The frame is disprovable — but only if
   someone thinks to check *when the paper was born* rather than what it says.
2. **The obvious boss.** Sukhans hired the victim, called the audit extension "a
   witch hunt," and was alone next door to the Glass Room. Every early theory goes
   through him. His investor call is verifiable — eventually.
3. **The window trap.** The room stares at 3:12–3:40 (*who was on the third floor
   when he drank?*) when the murder was committed at 2:52 — and set up at 8:12 AM.
   The question that breaks the case is not "who was near Dev?" but "**who needed the
   machine to work today?**"
4. **The weather system.** A WiFi flap, a payment alert, a machine repair, a courier
   at the gate — every component of the plan was indistinguishable from a normal day
   at TripleSpeed. The company's chaos was the murder's uniform.
5. **The department wall.** The five killers sit in five lanes — payments,
   engineering, ops, support, marketing — so no single team ever looks complete, and
   every team-shaped theory dies with one exonerating alibi.

## 8. How it resolves (the ladder)

- **Round 3** breaks the "heart attack" and "sadhya" theories: oleandrin in the
  tumbler, machine tank clean, sugar sachets clean; the NVR gap was *scheduled at
  11:31 AM*; badge V-07 walked at 2:52 after being signed back in at 11:20; the
  machine "repair" found no fault; the vendor pack's metadata is two days old; the
  2:47 alert never existed on the provider's side; the hedge has fresh cuts.
- **Round 4** turns it: Dev's recovered local draft (five roles, and an explicit
  note that the Victor pack is fabricated); the Uber dashboard's 8:37 shared ride
  with the 4-minute stop; the Workspace audit tying the deletion, the NVR schedule
  and badge V-07 to one admin session; the GRN ledger's one constant genuine
  signature under eleven months of traced ones.
- **Round 5** closes it: the "Fantasy League ⚽" chat (five members, five jobs, in
  role-fragments), and the settlement archive itself — the beneficiary one letter
  off the company's own name, first named in the draft's first line.
- **Round 6**: the confession.

### Canon rulings (settled, none derivable from a single clue)

1. **Kalaivani's afternoon alibi is genuinely excellent.** Her work ended at 8:37 AM.
   The chips run that puts her on the POI list is innocent — restocking snacks is
   literally her job. She is convicted by mornings: the skipped watering, the shared
   Uber, the hedge, the still-full flask, the pruning log's missing page.
2. **The technician is not a suspect.** External, signed out 10:05, job sheet on
   file. His only role is the sentence "no fault found — inlet valve manually shut."
3. **Yao was visibly helpful all afternoon.** War Room from 2:49, in front of
   witnesses. Every one of his actions was scheduled in the morning under the outage.
   The case against him is a *calendar*, not a sighting — the 2:45 NVR restart was
   booked at 11:31, which no innocent explanation survives.
4. **Anurag never touched anything.** No poison, no floor, no forgery. He is
   convicted by the pull-notification email (he knew Tuesday), the pre-ping typing,
   the sandbox webhook fired from inside the network, and the chat. The plan is the
   crime.
5. **The two Yashes, two Pranavs and two Mohits are not devices.** The duplicate
   first names are real roster facts; no clue turns on confusing them. Files and the
   app disambiguate as Yash S. / Yash T., Pranav D. / Pranav A., Mohit A. / Mohit P.
6. **Why nobody warned Dev:** nobody innocent knew, and everyone guilty was named.
   The draft's role-initials meant each of the five could verify the other four were
   equally exposed — the recruitment pitch was the document itself.
7. **The second gate run of Luke's** is on the register — the guard turned the page
   at 3 PM and the entry lives at the top of the next one. Found during Round 4;
   until then it reads as a lie.
8. **Dev's tumbler was staged by Dev.** He rinsed it and left it by the machine at
   1:05 PM himself, as he did every day the Beast worked. The killers planned around
   the ritual; they never had to touch him or his routine.
9. **The flask never left Kalaivani; the *dose* did.** She brewed more than one dose
   and decanted Giles's share into a small bottle in the 8:37 Uber. The chai flask
   under the beverage table still held the remainder all afternoon — which is why
   "for later" was literally true, and why she could not let Nikitha empty it. Two
   separate tells, not one contradiction: the bottle is the handoff, the flask is
   the leftover.
10. **The 11:04 wipe took the fortnight, not the morning.** The NVR held fourteen
    days and the reinitialization destroyed all of it. This is load-bearing: if only
    21 August had gone, the police could simply watch Wednesday night's store-room
    footage and Kalaivani would be arrested before Round 1. The array's death is
    what forces the hedge, the secateurs and the desk lamps onto witnesses.
11. **Badge V-07 left the reception tray at 9:41 AM**, when Giles signed the
    coffee-machine technician in and drew him a visitor badge. That is the only
    moment in the day Giles has a legitimate reason to stand over that tray, and it
    is why he is not sprinting four floors down and three up between 2:50 and 2:52.
12. **Aarohi's POI status is the 3:04 room setup**, nothing else. Every other one of
    the 34 has a timestamped errand inside 2:45–3:25; hers had to exist too or the
    incident report's own criterion would clear the room's second-favourite suspect.
    It is innocent, unwitnessed, and on the third floor — which is exactly why it
    reads badly.
13. **"OE" and "CS-O" are deliberately ambiguous by title.** Three people hold the
    title *Operations Executive* (Giles, Aksharaa, Akshay) and four could answer to
    Customer Support & Ops (Kalaivani, Sonia, Riya, Nikitha). The initials narrow to
    a shortlist and no further; the chat lines' fingerprints close it — the OE line
    is about the machine ticket, so the OE is whoever raised #4417, and Aksharaa can
    say who that was. Do not "fix" this by making the titles unique; it is the last
    real puzzle in the endgame.
14. **Prerna's alibi was in the room with her.** Vipin and Aarush were both in the
    F2 edit bay when she came for the source file at 2:58. Neither offers it and she
    never asks, because their own account of that hour is "rendering" something that
    finished at 2:20. Her clearance runs on the file-access log instead.

## 9. Tone rules

This game is played by the real TripleSpeed office. Therefore:

- Every motive is **professional** — money, credit, exposure, embarrassment. No
  romances, no families, no health, no personal-life digs.
- Every character's quirk/secret is office-flavored and affectionate, never cruel.
- The victim and the inspector are fictional; the fraud is fictional; the "vendors"
  are fictional. First names only for the cast; the host (Kushagra) does not appear
  in the fiction.
