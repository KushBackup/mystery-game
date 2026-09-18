import { CASE_SOLUTION } from './gameData';

/**
 * THE REVEAL DECK — "How it happened", as 22 slides.
 *
 * FULL SPOILERS. This is the answer, in plain words, and it is reached from the
 * two terminal screens only ([MurdererRevealOverlay](../components/MurdererRevealOverlay.jsx)
 * and [OutroSplash](../components/OutroSplash.jsx)), both of which are unreachable
 * until the host sets `revealedToMurderer` / ends the game. Nothing in this file
 * may leak into a round-gated surface.
 *
 * ── Where the copy comes from ────────────────────────────────────────────────
 * This is the in-app twin of [reveal-deck/index.html](../../reveal-deck/index.html),
 * the projected 1920×1080 deck. Same 22 slides, same order, same words. **A story
 * change means editing both**, plus [STORY.md](../../STORY.md) and `CASE_SOLUTION`
 * in [gameData.js](./gameData.js).
 *
 * Three slides do not restate the answer key — they *are* it. Slides 09, 21 and 22
 * read `CASE_SOLUTION.jobs`, `.proof` and `.verdict` directly, so the jobs table,
 * the evidence ladder and the verdict can never drift from the canon.
 *
 * ── Why this is not the projected deck in an iframe ──────────────────────────
 * That deck is a fixed 1920×1080 stage scaled by one transform, which is correct
 * for a projector and unreadable on a phone: at 390px the scale factor is 0.20,
 * so its 26px body copy lands at 5px. Sixty-nine players read this on phones, so
 * the slides here reflow instead of scaling, and they take the *app* voice —
 * Special Elite / Courier Prime / IBM Plex Mono at the §3.2 mobile scale — per
 * the standing rule in DESIGN_LANGUAGE.md §3.1: never put the deck's fonts in
 * the app.
 *
 * ── Inline markup ────────────────────────────────────────────────────────────
 * Two marks only, resolved by `<Rich>` in
 * [RevealDeck.jsx](../components/RevealDeck.jsx):
 *
 *   In `title`      `*word*`  → the one accent word, in signal.
 *   Everywhere else `*text*`  → emphasis: bone on ink, ink on paper.
 *                   `_text_`  → the same, in italic.
 *
 * Never bold. The system carries emphasis with colour, not weight (§3.2).
 */

/** Beats nobody on the floor could have seen carry `hidden` — see §6.8 and the
 *  `key` block on slide 10. Three cues mark them (marker size, body colour, the
 *  UNSEEN tag) so the distinction never rests on telling red from grey alone. */
export const REVEAL_DECK = [
  // ══ 01 ═══════════════════════════════════════════════════════════════════
  {
    id: 'cover',
    kind: 'cover',
    chapter: '● Case closed',
    tag: 'The answer',
    title: 'How It *Happened*',
    lead:
      'Dev Malhotra was killed at an office Onam party with sixty-nine colleagues in the building. _Here is exactly how, in plain words._',
    blocks: [
      {
        type: 'stats',
        items: [
          { n: '69', label: 'Colleagues inside' },
          { n: '05', label: 'People killed him' },
          { n: '34', label: 'Persons of interest' },
          { n: '01', label: 'Poisoned tumbler' },
        ],
      },
      {
        type: 'note',
        label: 'Exhibit — the group chat',
        quote:
          '“nobody moves during the window except who has a reason to. everyone has a reason. that is the point.”',
        source: '“Fantasy League ⚽” · created Wednesday, 9:12 PM',
      },
    ],
  },

  // ══ 02 ═══════════════════════════════════════════════════════════════════
  {
    id: 'short-answer',
    chapter: 'Finding of fact',
    kicker: 'If you only read one slide',
    title: 'The Short *Answer*',
    blocks: [
      {
        type: 'paper',
        label: 'Case 2108-C — closed',
        body: [
          '*Anurag planned it.* Kalaivani brewed the poison from the terrace hedge. Giles placed it in Dev\'s own tumbler at the coffee machine. Yao blinded the cameras and killed the paper trail. Akshat wrote the lie that pointed at somebody else.',
          'The poison waited in the one cup nobody else in the building was allowed to touch, and Dev\'s own daily ritual carried it to him. Then *the company\'s ordinary chaos* — a repair, an outage, an alert, a courier — did the rest, because at TripleSpeed nobody looks up for any of it.',
        ],
        source: 'Signed · Inspector Arjun Kale, Bengaluru City Police',
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Five killers · five departments',
        items: [
          '*Anurag* — Payments · the plan',
          '*Kalaivani* — Support · the toxin',
          '*Giles* — Ops · the hands',
          '*Yao* — Engineering · the blind spot',
          '*Akshat* — Marketing · the false trail',
        ],
      },
      {
        type: 'strip',
        label: 'Why it worked',
        text: 'No single team ever looked complete, so *no team-shaped theory ever closed.*',
      },
    ],
  },

  // ══ 03 ═══════════════════════════════════════════════════════════════════
  {
    id: 'victim',
    chapter: 'The victim',
    kicker: 'Who was killed',
    title: 'Dev *Malhotra*',
    dek:
      'Introduced to the office as “something payments.” Actually the man the founders hired to find out where the money was going.',
    blocks: [
      {
        type: 'paper',
        label: 'What the office saw',
        tilt: 'L',
        body: [
          'A consultant, three weeks in. A steel tumbler engraved DM that nobody else touched. A post-lunch ritual at the third-floor machine, and a standing refusal to spend the Zomato budget on Third Wave — _“₹1,500 is for food.”_',
          'He asked a lot of questions about money. By the second week, half the office had been on the wrong end of one.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What he actually did',
        items: [
          'Engaged quietly by *both founders* for revenue assurance — the "payments consultant" line was a cover story.',
          'Found a single leak network of *₹3.4 crore* across four channels, each disguised as one of the company\'s normal problems.',
          'Pulled the payment provider\'s *settlement archive* on Tuesday — the one dataset nobody inside could sanitize.',
          'Was scheduled to read *names* at Friday\'s 4 PM "toast." He died at 3:40.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '21', label: 'Days on the audit' },
          { n: '04', label: 'Leak channels found' },
          { n: '09', label: 'Chairs at the 4 PM meeting' },
          { n: '20', unit: 'min', label: 'Short of reading names' },
        ],
      },
    ],
  },

  // ══ 04 ═══════════════════════════════════════════════════════════════════
  {
    id: 'public-record',
    chapter: 'Public record',
    kicker: '21 August 2026 · Midford KTR2, Indiranagar',
    title: 'What The Office *Saw*',
    blocks: [
      {
        type: 'rail',
        stops: [
          { time: '8:12 AM', title: 'The ticket', body: 'An urgent request revives the coffee machine, dead for two weeks.' },
          { time: '9:41 AM', title: 'The Beast lives', body: 'The technician signs it off. The floor celebrates.' },
          { time: '11:04 AM', title: 'Outage', body: 'WiFi and cameras drop for 43 minutes. Nobody blinks.' },
          { time: '1:00 PM', title: 'Onam', body: 'Sadhya, pookalam, games, a livestream.' },
          { time: '2:47 PM', title: 'The alert', body: 'A payment failure pulls eleven people off the terrace and back to their desks.', now: true },
          { time: '3:12 PM', title: 'Payasam', body: 'Dev leaves the terrace for his coffee and his slides.' },
          { time: '3:55 PM', title: 'Found', body: 'Aarohi sees him through the Glass Room wall.' },
          { time: '4:14 PM', title: 'Death', body: 'Paramedics stop. “Query poisoning” goes on the sheet.' },
          { time: '4:30 PM', title: 'Sealed', body: 'Police lock all sixty-nine colleagues inside.' },
        ],
      },
      {
        type: 'card',
        label: 'What the office believed by round two',
        items: [
          'Someone followed him down after 3:12.',
          'The co-founder alone in the cabin next door looked worst.',
          'The person who found him — and fed a shredder ten minutes earlier — looked second worst.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The trap',
        text:
          'Every line on that timeline is *true*. It is also why nobody got there — the room stared at 3:12 to 3:55, and the murder was finished at 2:52. It had been armed since 8:12 in the morning.',
      },
    ],
  },

  // ══ 05 ═══════════════════════════════════════════════════════════════════
  {
    id: 'part-one',
    kind: 'divider',
    chapter: 'Part one',
    number: '01',
    kicker: 'Part one',
    title: 'The *Plan*',
    lines: [
      { term: 'Why', text: 'a settlement archive, pulled on Tuesday' },
      { term: 'Who', text: 'five people in five departments' },
      { term: 'How', text: 'poison in a cup nobody else was allowed to touch' },
    ],
  },

  // ══ 06 ═══════════════════════════════════════════════════════════════════
  {
    id: 'motive',
    chapter: 'Motive',
    kicker: 'Why five people decided he had to die',
    title: 'Findings *v0.9*',
    dek:
      'Dev\'s Wednesday draft named five roles, not people. It was meant for the founders. The one person who could read everything on the Drive read it first.',
    blocks: [
      {
        type: 'paper',
        label: 'The draft — five roles, initials only',
        tilt: 'L',
        items: [
          '*HoP* — settlement reserve releases, diverted to a look-alike account',
          '*TL* — compute bought through a marked-up “cloud partner”',
          '*OE* — a ghost vendor, ₹68 lakh, every invoice under the approval line',
          '*CS-O* — the second signature on deliveries that never arrived',
          '*MB* — 12% of media spend, routed through a reseller kickback',
        ],
      },
      {
        type: 'note',
        label: 'In the margin, in his handwriting',
        quote: '“The Zenlyt ‘Victor onboarding’ pack is fabricated — see metadata. Whoever built it was aiming the story before I ever wrote it.”',
        source: 'Dev Malhotra · Findings v0.9 — the note that cleared the framed man',
      },
      {
        type: 'strip',
        label: 'The turn',
        text: 'Anurag read the archive-pull notification on Tuesday evening. By Wednesday at 9:12 PM there was a group chat.',
      },
    ],
  },

  // ══ 07 ═══════════════════════════════════════════════════════════════════
  {
    id: 'recruiter',
    chapter: 'Motive',
    kicker: 'How a conspiracy formed in one evening',
    title: 'The Draft Was The *Recruiter*',
    dek:
      'Nobody had to be persuaded to fear Dev. They had to be persuaded the other four were equally exposed — and the document did that by itself.',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        label: 'Why nobody warned him',
        body: [
          'Everyone innocent thought Dev was a payments consultant. Everyone guilty was named in his draft. There was no third kind of person — the five could each read their own lane in it and verify the other four had exactly as much to lose. The recruitment pitch was the evidence itself.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Why murder, and not a cover-up',
        body: [
          'The briefing was Friday at 4 PM and the archive was already outside the building. So: kill the meeting, delete the Drive copy, and let the prepared story stand — _an external scam vendor, onboarded by a careless marketer._ It nearly worked. They did not know about the local copy, and the archive could simply be re-issued.',
        ],
      },
      {
        type: 'strip',
        label: 'The whole case in one line',
        text:
          'Every anomaly that day looked like a normal Tuesday at TripleSpeed. *The company\'s chaos was the murder\'s uniform.*',
      },
    ],
  },

  // ══ 08 ═══════════════════════════════════════════════════════════════════
  {
    id: 'method',
    chapter: 'Method',
    kicker: 'The method',
    title: 'Poison In The *Tumbler*',
    blocks: [
      {
        type: 'paper',
        label: 'What the poison was',
        tilt: 'L',
        body: [
          '*Oleandrin.* It comes from oleander — the decorative hedge screening the terrace smoking corner, ten feet from where everyone ate lunch. Concentrated, a small dose stops the heart in under an hour.',
          'It is bitter. So it went under the most over-extracted, complained-about coffee in Indiranagar, on a floor that _permanently smells of coffee_, into a cup owned by a man who added two sugars. Bitter goes under bitter.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Why the tumbler, and not the food',
        items: [
          'The sadhya was a shared buffet — *untargetable*. Dev ordered nothing on Zomato. The catering tested clean.',
          'The only victim-specific vessel in the building was the *DM tumbler* — and nobody on earth touched Dev\'s tumbler.',
          'The machine had to work on Friday. So its inlet valve — *shut by hand two weeks earlier* — was reopened by an urgent morning ticket. The famous 10% machine had been switched off, and then switched back on, by appointment.',
          'Dev rinsed and staged the tumbler himself at 1:05, like every day the Beast worked. *The ritual was the weapon.*',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '02', unit: 'wks', label: 'Valve held shut' },
          { n: '03', label: 'Pulls on the brew counter' },
          { n: '23', unit: 'min', label: 'Dose waited in the cup' },
          { n: '00', label: 'Other colleagues harmed' },
        ],
      },
    ],
  },

  // ══ 09 ═══════════════════════════════════════════════════════════════════
  {
    id: 'jobs',
    chapter: 'The team',
    kicker: 'Five people, five jobs, nobody holding the whole thing',
    title: 'Who Did *What*',
    // Reads CASE_SOLUTION.jobs — the answer key, not a restatement of it.
    blocks: [{ type: 'jobs' }],
  },

  // ══ 10 ═══════════════════════════════════════════════════════════════════
  {
    id: 'part-two',
    kind: 'divider',
    chapter: 'Part two',
    number: '02',
    kicker: 'Part two',
    title: 'The *Day*',
    lines: [
      { term: '8:12 AM', text: 'the ticket that fixes the machine' },
      { term: '8:37 AM', text: 'one Uber, two passengers, one decanted bottle' },
      { term: '11:04 AM', text: 'the outage that booked the afternoon' },
      { term: '2:47 PM', text: 'a fake alert scatters the party' },
      { term: '2:52 PM', text: 'the dose, inside the camera gap' },
      { term: '3:15 PM', text: 'two sugars' },
    ],
    // The key for every beat ledger that follows. It lives on the divider so the
    // beat slides don't each have to spend a block re-explaining themselves.
    blocks: [{ type: 'key' }],
  },

  // ══ 11 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-1',
    chapter: 'Beat 1 of 4',
    kicker: 'Tuesday evening — Wednesday midnight',
    title: 'Planned Before The *Marigolds*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: 'Tue 6:40 PM',
            hidden: true,
            body:
              'Dev pulls the settlement archive from the provider portal. The portal emails the pull notification to its billing admin. *Anurag reads it the same evening* and understands exactly what Friday\'s “toast” will be.',
          },
          {
            time: 'Wed 9:12 PM',
            hidden: true,
            body:
              'A group chat named “Fantasy League ⚽” is created. Five members. *No fantasy league exists at this company.* Five roles from the draft, five people, one evening.',
          },
          {
            time: 'Wed 11:58 PM',
            hidden: true,
            body:
              'Akshat builds the fake Zenlyt onboarding pack pointing at Victor — from a year-old invoice template he requested that afternoon, _“just as a template.”_ The same night, the oleander hedge is clipped with the office\'s own secateurs.',
          },
        ],
      },
      {
        type: 'paper',
        label: 'Read this twice',
        tilt: 'L',
        body: [
          'The murder was fully designed before a single marigold went down for the pookalam.',
          'And nothing was ever smuggled past the gate. The poison grew on the terrace. The vessel belonged to the victim. The chaos was house style.',
        ],
      },
    ],
  },
  // ══ 12 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-2',
    chapter: 'Beat 2 of 4',
    kicker: '8:12 AM — 1:05 PM',
    title: 'Friday *Morning*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '8:12 AM',
            body:
              'Giles logs ticket #4417 from his phone — urgent, _“before the party”_ — for a machine that has been dead for two weeks over four ignored tickets. The job sheet will read: *no fault found, inlet valve manually shut.*',
          },
          {
            time: '8:37 AM',
            hidden: true,
            body:
              'One Uber, two passengers who have never shared a ride in 214 logged trips, one four-minute stop at Giles\'s gate. *A bottle decanted from her chai flask changes bags in the car* — before the building\'s cameras are even relevant, and the flask keeps the rest.',
          },
          {
            time: '9:41 AM',
            body:
              'The technician reopens the valve and the Beast lives. The floor celebrates in the team channel — *“THE BEAST LIVES”*, timestamped. The one man who drinks from it daily now has an appointment he doesn\'t know about.',
          },
          {
            time: '11:04 AM',
            hidden: true,
            body:
              'The “WiFi outage.” The NVR reinitializes and *the whole fourteen-day array dies* — the basement arrival, and the fortnight behind it. Behind the cupboard door, one nameless admin session deletes Dev\'s draft (11:23), books a 2:45 PM camera “maintenance restart” (11:31), and re-arms dead visitor badge V-07 (11:36).',
          },
          {
            time: '1:05 PM',
            body:
              'Dev rinses his tumbler and stages it beside the machine, exactly as he does every day the Beast works. Then he goes up and eats with everyone else. *The killers never touch him or his routine.*',
          },
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'Why nobody saw a handoff',
        text:
          'Because it happened in a moving car at 8:37 — and the one camera that filmed the arrival lost its memory before noon.',
      },
    ],
  },

  // ══ 13 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-3',
    chapter: 'Beat 3 of 4',
    kicker: '2:45 PM — 3:21 PM',
    title: 'Thirty-Six *Minutes*',
    dek:
      'The cameras were blind for thirty-six minutes — on a schedule booked at 11:31 that morning. The alert made sure the blindness had company.',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '2:45 PM',
            hidden: true,
            body:
              'The NVR enters its “maintenance restart,” exactly as scheduled. Every floor camera and the basement go dark. *A blackout booked three hours ahead is an appointment, not an outage.*',
          },
          {
            time: '2:47 PM',
            hidden: true,
            body:
              'Anurag fires a replayed sandbox webhook from inside the office network — a fake settlement failure. Within four minutes, *eleven people leave the terrace* with unimpeachable reasons, and the suspect list writes itself.',
          },
          {
            time: '2:52 PM',
            hidden: true,
            body:
              'Giles rides the service lift on dead badge V-07, doses the staged tumbler, and runs one blank shot to confirm the machine will not fail the plan. *Utkarsh half-sees a man with a steel tumbler. Rishabh hears the hiss.*',
          },
          {
            time: '3:05 PM',
            body:
              'Giles joins the War Room holding an HDMI story. The HDMI has been in a backpack on the terrace since 8:30 — a fact that is, for now, sitting quietly in Yash T.\'s bag.',
          },
        ],
      },
      {
        type: 'paper',
        label: 'The obvious clue',
        body: [
          'The 2:47 alert was *meant* to be found — eventually.',
          'Its real job was to hand *eleven people* a guilty-looking reason to move — and the party\'s own errands, the couriers and prizes and printers and smokers, supplied twenty-three more. Thirty-four gaps, so that no single absence would ever stand out. The suspect pool was a design feature.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '36', unit: 'min', label: 'Cameras blind' },
          { n: '04', unit: 'min', label: 'Alert to scattered party' },
          { n: '02', label: 'Lift rides on badge V-07' },
          { n: '03', label: 'Witnesses anyway' },
        ],
      },
    ],
  },

  // ══ 14 ═══════════════════════════════════════════════════════════════════
  {
    id: 'the-log',
    chapter: 'The clever part',
    kicker: 'The one detail most players never worked out',
    title: 'He Needed The *Log*, Not The Lift',
    dek:
      'Giles had every right to walk to the third floor. Ops fetches things all day. So why ride the service lift on a dead visitor\'s badge?',
    blocks: [
      {
        type: 'paper',
        label: 'What the lift log says',
        tilt: 'L',
        body: [
          'One ride up at 2:52. One ride down at 2:54. Both on *visitor badge V-07* — a badge whose visitor left the building on Tuesday, signed back into the reception tray at 11:20 that morning.',
          'A dead badge that Yao\'s nameless admin session had quietly *switched back on* at 11:36.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What actually happened',
        body: [
          'Giles took the service lift so the main stairwell would not carry him, and badged it with V-07 so the log would name a visitor who was not in the building. He had lifted that badge out of the reception tray himself at 9:41 that morning, signing the coffee-machine technician in.',
          'He never needed the access. *He needed the record to name somebody else.* If that log had read his own badge, this case would have closed the same evening.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The mismatch',
        text:
          'A floor he was entitled to walk to, ridden on a badge he had no reason to hold. *That is what finally caught him.*',
      },
    ],
  },

  // ══ 15 ═══════════════════════════════════════════════════════════════════
  {
    id: 'witnesses',
    chapter: 'Witnesses',
    kicker: 'Three colleagues who were in the right seat',
    title: "The Cameras Were Blind. The Floor *Wasn't*.",
    blocks: [
      {
        type: 'note',
        label: 'Utkarsh · 2:52 PM, desk facing the lifts',
        quote:
          'Half-saw a man at the coffee nook holding a steel tumbler — and filed it as “party cleanup.” He could not swear to the face. He has been redrawing it all evening.',
        source: 'Engineering · was on the hotfix, four desks away',
      },
      {
        type: 'note',
        label: 'Rishabh · 2:52 PM, desk by the nook',
        quote:
          'Heard the machine hiss out a pull and thought “the Beast lives.” Nobody claims that brew. The counter logged it anyway.',
        source: 'Engineering · never looked up',
      },
      {
        type: 'note',
        label: 'Raaghav · 2:53 PM, third-floor lift lobby',
        quote:
          'Heard the machine finish as the lift doors opened, and saw nobody near it. One minute earlier and he walks into the murder being armed.',
        source: 'Marketing · fetching the mascot cutout',
      },
      {
        type: 'strip',
        label: 'What they missed',
        text:
          'Killing the cameras is not the same as killing every ear and eyeline on a floor of headphones. The conspiracy planned around the lens. *It did not plan around the desks.*',
      },
    ],
  },

  // ══ 16 ═══════════════════════════════════════════════════════════════════
  {
    id: 'the-murder',
    chapter: '● The murder',
    kicker: '3:15 PM · the actual moment',
    title: 'Two *Sugars*',
    blocks: [
      {
        type: 'paper',
        label: 'The finding — what killed Dev Malhotra',
        body: [
          'At 3:15 the machine works — third pull of the day. The coffee dissolves the film of concentrate waiting below the rim of his own tumbler. He adds two sugars, carries it into the Glass Room, and shuts the door.',
          'Nothing was ever dropped into a drink in front of anyone. Nobody followed him downstairs. *The dose had been waiting for twenty-three minutes*, and the only hands on the cup, all day, were his.',
        ],
        source: 'Cross-referenced with the toxicology summary and the tumbler analysis',
      },
      {
        type: 'card',
        tone: 'brass',
        label: 'Why “who was near him?” was the wrong question',
        body: [
          'Being near Dev at 3:15 means nothing — the murder was already sitting in the cup.',
          'Being at the coffee nook at 2:52 means *everything*. The room spent the night interrogating the wrong timestamp.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '03', label: 'Pulls on the counter' },
          { n: '23', unit: 'min', label: 'Dose to sip' },
          { n: '25', unit: 'min', label: 'Sip to collapse' },
          { n: '00', label: 'Hands laid on him' },
        ],
      },
    ],
  },

  // ══ 17 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-4',
    chapter: 'Beat 4 of 4',
    kicker: '3:12 PM — 4:30 PM',
    title: 'The Last *Hour*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '3:12 PM',
            body:
              'Dev tells Elias _“save me some payasam”_ and takes the stairs down. Nobody sends him. Nobody needs to.',
          },
          {
            time: '3:15 PM',
            hidden: true,
            body:
              'The grinder runs. Thejas, forty feet away in headphones, hears it and thinks *“good for Dev.”* The Beast\'s legendary bitterness and the floor\'s permanent coffee smell hide everything.',
          },
          {
            time: '3:31 PM',
            body:
              'Shashwat passes the Glass Room and sees Dev *“head down over his notes.”* He decides it would be rude to knock. He has been re-walking those four seconds ever since.',
          },
          {
            time: '3:45 PM',
            body:
              'Aarohi shreds one page at the third-floor shredder — a typo\'d agenda, at Dev\'s own request from lunchtime. It will cost her the worst evening of anyone innocent in this building.',
          },
          {
            time: '3:55 PM',
            body:
              'Aarohi comes down for the speaker and sees him through the glass. Kursheeth does CPR for eleven minutes and knows by minute two. *“Query poisoning”* is his sentence before it is the paramedic\'s.',
          },
          {
            time: '4:30 PM',
            body:
              'Inspector Kale seals floors one to three and the terrace. Zero exits since 1 PM — the company Ubers don\'t even run until six. *All five of them are still in the building*, in five different departments.',
          },
        ],
      },
    ],
  },

  // ══ 18 ═══════════════════════════════════════════════════════════════════
  {
    id: 'part-three',
    kind: 'divider',
    chapter: 'Part three',
    number: '03',
    kicker: 'Part three',
    title: 'Why It *Held*',
    lines: [
      { term: 'Twelve', text: 'real, provable motives in one office' },
      { term: 'Seven', text: 'innocent people who looked guilty to the end' },
      { term: 'Five', text: 'departments, so no team ever looked complete' },
      { term: 'One', text: 'window everyone stared at — the wrong one' },
    ],
  },

  // ══ 19 ═══════════════════════════════════════════════════════════════════
  {
    id: 'misdirection',
    chapter: 'Misdirection',
    kicker: 'Why sixty-nine colleagues could not close it',
    title: 'Twelve Real Motives, Seven Innocent *People*',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        index: '01',
        label: 'The suspects were genuinely dangerous',
        body: [
          'Twelve people had real, provable reasons to want the report dead. Seven were innocent: *Victor, Sukhans, Aarohi, Nehal, Prerna, Adithya* and *Luke*. You could build a complete single-killer case against any one of them — and most of the room did.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '02',
        label: 'The window was a trap',
        body: [
          'The room asked _“who was near Dev between 3:12 and 3:55?”_ all night. The murder was committed at 2:52, armed at 8:12 AM, and designed on Wednesday. The question that breaks the case is *“who needed the machine to work today?”*',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '03',
        label: 'The chaos was the uniform',
        body: [
          'A repair ticket, a WiFi flap, a payment alert, a courier at the gate — every component of the plan was indistinguishable from a normal day at this company. Nobody looks up for weather. *They made sure it all looked like weather.*',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '04',
        label: 'The killers sat in five departments',
        body: [
          'Payments, engineering, ops, support, marketing. Every team-shaped theory died on one exonerating alibi — and between the 2:47 alert and the party\'s own errands, *thirty-four people* had window gaps, so no single absence ever stood out.',
        ],
      },
      {
        type: 'strip',
        label: 'Worth saying plainly',
        text: 'Thirty-four guilty-looking people was never a flaw in the evidence. *It was the plan.*',
      },
    ],
  },

  // ══ 20 ═══════════════════════════════════════════════════════════════════
  {
    id: 'cleared',
    chapter: 'Cleared',
    kicker: 'Two innocent people, wronged in two different ways',
    title: 'Framed, And *Suspected*',
    blocks: [
      {
        type: 'paper',
        label: 'Victor — framed',
        tilt: 'L',
        body: [
          'Victor had nothing to do with any of it. Akshat manufactured the Zenlyt onboarding pack _specifically_ so the ghost vendor would trace to him — chosen because a year of bad ROAS (Akshat\'s own skim) had already made him look careless.',
          'The frame died on one fact a backdated document cannot fake: *the file was created Wednesday at 11:58 PM.* His secretive phone-booth call? A client tearing into his numbers. He was too proud to say so.',
        ],
      },
      {
        type: 'paper',
        label: 'Sukhans — suspected',
        body: [
          'He hired the victim, argued against extending the audit in front of witnesses, and spent the back half of the window alone twenty feet from the Glass Room. Every early theory went through him.',
          'The investor call checks out — calendar, the investor, and Ishan\'s sightline through the cabin glass. And the Wednesday quote everyone repeated had a second half only Himanshu heard: _“then we burn.”_ That was Elias, agreeing to publish.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The worst of it',
        text:
          'Aarohi shredded a *typo\'d agenda*, at Dev\'s own request — and spent the evening as the room\'s second-favourite suspect for doing her job.',
      },
    ],
  },

  // ══ 21 ═══════════════════════════════════════════════════════════════════
  {
    id: 'evidence',
    chapter: 'Evidence log',
    kicker: 'Fourteen pieces of paper, and what each one settled',
    title: 'What Proved *It*',
    // Reads CASE_SOLUTION.proof — the answer key, not a restatement of it.
    blocks: [{ type: 'proof' }],
  },

  // ══ 22 ═══════════════════════════════════════════════════════════════════
  {
    id: 'verdict',
    kind: 'cover',
    chapter: '● Case closed',
    tag: 'Verdict',
    title: 'Five People. Five Departments. One *Tumbler*.',
    // The verdict paragraph is CASE_SOLUTION.verdict, injected by RevealDeck.
    lead: null,
    blocks: [
      {
        type: 'note',
        label: 'Closing note',
        quote:
          '“Nothing entered this building for the murder. It was all already here — the plant, the machine, the badge, the chaos.”',
        source: 'Inspector Arjun Kale · closed 21 August 2026',
      },
      {
        type: 'circles',
        text: 'Payments · Engineering · Ops · Support · Marketing',
        note: 'the five departments that were in it together',
      },
    ],
  },
];

/** Slide 22 takes its paragraph straight from the answer key. */
export const REVEAL_VERDICT = CASE_SOLUTION.verdict;

export const REVEAL_SLIDE_COUNT = REVEAL_DECK.length;
