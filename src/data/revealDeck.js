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
 * so its 26px body copy lands at 5px. Fifty-one players read this on phones, so
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
      'Armaan Khanna was killed at his own birthday party in front of fifty-one people. _Here is exactly how, in plain words._',
    blocks: [
      {
        type: 'stats',
        items: [
          { n: '51', label: 'Guests in the room' },
          { n: '05', label: 'People killed him' },
          { n: '94', label: 'Seconds of darkness' },
          { n: '01', label: 'Poisoned glass' },
        ],
      },
      {
        type: 'note',
        label: 'Exhibit — the Monday folder',
        quote: '“If the room turns, give them the planner. Nobody mourns the planner.”',
        source: 'Armaan Khanna · his own margin note',
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
        label: 'Case 8821-B — closed',
        body: [
          '*Sneha Ganesh planned it.* Roddy Faustus made the poison. Kiyaah Rose Raghuwanshi put it on the drink. Oindrilla Chatterjee switched off the camera. Victoria Vance made sure the paperwork pointed at somebody else.',
          "The poison was hidden in the orange spray used to finish Armaan's own birthday drink. One glass. Nobody else touched it. Then *ten separate circles of friends* did the rest of the work for them — because every table spent the night suspecting itself.",
        ],
        source: 'Signed · Inspector Ira Deshpande, Goa Police',
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Five killers · five different tables',
        items: [
          '*Sneha Ganesh* — Thimble · the plan',
          '*Roddy Faustus* — Hemlock · the poison',
          '*Kiyaah Rose Raghuwanshi* — Oracle · the delivery',
          '*Oindrilla Chatterjee* — Amber · the blind spot',
          '*Victoria Vance* — Forgery · the false trail',
        ],
      },
      {
        type: 'strip',
        label: 'Why it worked',
        text: 'No single table ever looked complete, so *no single theory ever closed.*',
      },
    ],
  },

  // ══ 03 ═══════════════════════════════════════════════════════════════════
  {
    id: 'victim',
    chapter: 'The victim',
    kicker: 'Who was killed',
    title: 'Armaan *Khanna*',
    dek:
      'Founder of Velvet Ember Spirits. The most liked man in the room — and about ten people standing in it had a real reason to want him gone.',
    blocks: [
      {
        type: 'paper',
        label: 'What the room saw',
        tilt: 'L',
        body: [
          'Armaan built Velvet Ember in his own image: expensive, theatrical, and impossible to argue with without looking joyless. He invited ten close friends to his birthday and told each of them to bring their own people.',
          'That is why there were fifty-one guests in a listening bar in Panjim, and why the room arrived already split into ten little worlds that barely knew each other.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What he actually did',
        items: [
          "Took other people's work and put his own name on it.",
          'Held back money until people stopped asking for it.',
          'Kept every humiliation *private*, so no two victims ever compared notes.',
          'Two days from selling the company, he wrote down *who he would blame* if the sale went wrong.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '51', label: 'Guests in the room' },
          { n: '10', label: 'Had a real motive' },
          { n: '05', label: 'Of those were innocent' },
          { n: '05', label: 'Of those killed him' },
        ],
      },
    ],
  },

  // ══ 04 ═══════════════════════════════════════════════════════════════════
  {
    id: 'public-record',
    chapter: 'Public record',
    kicker: '8 August 2026 · For the Record, Panjim',
    title: 'What The Room *Saw*',
    blocks: [
      {
        type: 'rail',
        stops: [
          { time: '7:00 PM', title: 'Doors open', body: 'Guests arrive at a late-night listening bar in Goa.' },
          { time: '9:55 PM', title: 'Tribute reel', body: 'A birthday video starts on the screen beside the private bar.' },
          { time: '10:08 PM', title: 'Lights glitch', body: 'Projector and bar camera go dark for 94 seconds.', now: true },
          { time: '10:12 PM', title: 'The toast', body: 'Armaan raises the Last Light, his signature drink.' },
          { time: '10:19 PM', title: 'Hands fail', body: 'He stops mid-sentence. His hands stop working.' },
          { time: '10:22 PM', title: 'Collapse', body: 'He goes down beside the stage rail.' },
          { time: '10:34 PM', title: 'Death', body: 'Paramedics stop resuscitation.' },
          { time: '10:48 PM', title: 'Sealed', body: 'Police lock all fifty-one guests inside.' },
        ],
      },
      {
        type: 'card',
        label: 'What the room believed by round two',
        items: [
          'One of the ten close friends planned it.',
          'Their own table probably helped cover it up.',
          'The blackout at 10:08 was obviously the moment.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The trap',
        text:
          'Every line on that timeline is *true*. It is also exactly why nobody got there — it points at ninety-four seconds, and the murder was already six hours old.',
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
      { term: 'Why', text: 'a red folder marked Monday' },
      { term: 'Who', text: 'five people at five different tables' },
      { term: 'How', text: 'poison in a garnish nobody else got' },
    ],
  },

  // ══ 06 ═══════════════════════════════════════════════════════════════════
  {
    id: 'motive',
    chapter: 'Motive',
    kicker: 'Why five people decided he had to die',
    title: 'The Red Folder Marked *Monday*',
    dek:
      'Armaan was two days from selling Velvet Ember. The folder was his plan for surviving that sale: a written list of people to hand over if anything went wrong.',
    blocks: [
      {
        type: 'paper',
        label: 'The folder — index page · initials only',
        tilt: 'L',
        items: [
          '*Sneha* — takes the fall for the rebate structure',
          '*Victoria* — takes the fall for the shell-company ledgers',
          '*Oindrilla* — takes the fall for the inventory breach',
          '*Tara* — customs paperwork, held in reserve',
          '*Tanvi* — the prototype, held in reserve',
        ],
      },
      {
        type: 'note',
        label: 'In the margin, in his handwriting',
        quote: '“If the room turns, give them the planner. Nobody mourns the planner.”',
        source: '“The planner” = Tanvi Vartak, who was organising his party',
      },
      {
        type: 'strip',
        label: 'The turn',
        text: 'Sneha read that page. Then she stopped being the person who takes the fall.',
      },
    ],
  },

  // ══ 07 ═══════════════════════════════════════════════════════════════════
  {
    id: 'forgot-two',
    chapter: 'Motive',
    kicker: 'His one mistake',
    title: 'He Forgot *Two People*',
    dek:
      'Neither of them was in the folder at all. They are the two who could build the poison and carry it to his hand.',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        label: 'Not on the list · Hemlock',
        title: 'Roddy Faustus',
        body: [
          'Armaan had written him off as an outsider who did not matter enough to name. Roddy is the one man in that room who knew how to turn a plant into a weapon. Years earlier Armaan had copied a page out of his notebook and written _we own this now_ on the back.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Not on the list · Oracle',
        title: 'Kiyaah Rose Raghuwanshi',
        body: [
          'Armaan assumed the drink ritual and the grief sessions still kept her quiet. Kiyaah wrote the Last Light service herself and was never fully paid for it — and hers were the only hands that could touch his glass without anyone finding it strange.',
        ],
      },
      {
        type: 'strip',
        label: 'The whole case in one line',
        text:
          'He spent years teaching this room to keep its humiliations private, so that no two victims would ever compare notes. *Five of them compared notes.*',
      },
    ],
  },

  // ══ 08 ═══════════════════════════════════════════════════════════════════
  {
    id: 'method',
    chapter: 'Method',
    kicker: 'The method',
    title: 'Poison In The *Garnish*',
    blocks: [
      {
        type: 'paper',
        label: 'What the poison was',
        tilt: 'L',
        body: [
          '*Aconitine.* It comes from aconite — a garden plant also called monkshood. A very small dose shuts down your nerves, then your heart. It works in *minutes, not hours*.',
          'It is also bitter. So it was hidden inside bitter-orange oil, which is something that is _supposed_ to taste bitter and smell strong. Roddy cut one into the other himself.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Why the spray, and not the bottle',
        items: [
          'The bottles, the batch mixers and the cake were all *clean* — they had to be, because everybody else drank and ate from them.',
          "Only Armaan's glass got the orange mist on top. That was written into the ritual he had taken from Kiyaah.",
          'A spray lands on the rim, his lips and the drink at the same instant. One serving, no splash, nothing else in the room touched.',
          'The silver mister behind the bar was swapped for an *identical twin*, same label: EMBER ORANGE.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '02', label: 'Sprays over the glass' },
          { n: '01', label: 'Serving, ever' },
          { n: '07', unit: 'min', label: 'Toast to first symptom' },
          { n: '00', label: 'Other guests harmed' },
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
    title: 'The *Night*',
    lines: [
      { term: '5:14 PM', text: 'the paperwork, before the doors open' },
      { term: '7:25 PM', text: 'the poison walks in as a gift' },
      { term: '10:08 PM', text: 'ninety-four seconds of darkness' },
      { term: '10:12 PM', text: 'two sprays of orange' },
      { term: '10:48 PM', text: 'the room is sealed with all five still in it' },
    ],
    // The key for every beat ledger that follows. It lives on the divider so the
    // four beat slides don't each have to spend a block re-explaining themselves.
    blocks: [{ type: 'key' }],
  },

  // ══ 11 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-1',
    chapter: 'Beat 1 of 4',
    kicker: '5:14 PM — 7:40 PM',
    title: 'The Poison Was Already *In The Building*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '5:14 PM',
            hidden: true,
            body:
              "Doors are still shut. Victoria files a fake supplier invoice into the private bar's stock list from off-site. On paper, the bar now owns a *replacement orange sprayer*, bought through Tara Singhania's customs vendor.",
          },
          {
            time: '7:25 PM',
            hidden: true,
            body:
              'Roddy arrives carrying a gift box of rare botanicals. It never reaches the gift table. The *poisoned sprayer is inside it* — already filled, already labelled EMBER ORANGE, an exact twin of the one behind the bar.',
          },
          {
            time: '7:40 PM',
            body:
              "Kiyaah comes in through the service entrance to inspect the private bar — at Armaan's own request. She confirms where the real sprayer sits, and who will be working that bar during the video.",
          },
        ],
      },
      {
        type: 'paper',
        label: 'Read this twice',
        tilt: 'L',
        body: [
          'None of that needed the blackout.',
          'By the time the first guest walked through the door, the poison was already in the building and the paperwork was already six hours old.',
          'The room would later spend the whole night arguing about ninety-four seconds.',
        ],
      },
    ],
  },

  // ══ 12 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-2',
    chapter: 'Beat 2 of 4',
    kicker: '9:50 PM — 10:06 PM',
    title: 'The Room Turns *Around*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '9:50 PM',
            body:
              'Sneha argues with Armaan in the upstairs booth about the red folder. She comes back down composed. *The folder stays upstairs* — the only part of that conversation that mattered.',
          },
          {
            time: '9:55 PM',
            body:
              'The tribute video starts on the screen beside the private bar, and the whole room turns to watch it.',
          },
          {
            time: '10:02 PM',
            hidden: true,
            body:
              'Roddy carries the botanical case into the prep corridor and leaves a wrapped service roll on the prep counter. The poisoned twin is inside it.',
          },
          {
            time: '10:05 PM',
            body:
              'Roddy walks back out onto the floor without the case he carried in. Several guests notice. Nobody yet knows what was in it.',
          },
          {
            time: '10:06 PM',
            hidden: true,
            body:
              'While walking staff through the garnish sequence, Kiyaah picks the wrapped roll up off the prep counter. *The two of them never hand each other anything.*',
          },
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'Why nobody saw a handover',
        text:
          "Because there wasn't one. Prep-room *linen fibres* on the sprayer's neck are all that survives of the exchange.",
      },
    ],
  },

  // ══ 13 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-3',
    chapter: 'Beat 3 of 4',
    kicker: '10:08:14 PM — 10:09:53 PM',
    title: 'Ninety-Four *Seconds*',
    dek:
      'The camera over the private bar was blind for a minute and a half. That was the whole window, and it was long enough.',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '10:08:14',
            hidden: true,
            body:
              'Oindrilla forces the projector to reboot from the event-admin terminal. To the floor it looks like the birthday video glitched. Five seconds later the *private-bar camera drops too*.',
          },
          {
            time: '10:08–10:09',
            hidden: true,
            body:
              'Kiyaah goes in behind the private bar and *swaps the real silver sprayer for the poisoned twin*. In and out inside ninety-four seconds.',
          },
          {
            time: '10:09:53',
            body:
              'The feed comes back and the video resumes. The room turns around to a bar that looks exactly the way it did ninety-four seconds ago.',
          },
        ],
      },
      {
        type: 'paper',
        label: 'The obvious clue',
        body: [
          'The blackout was *meant* to be found.',
          'It pulled the whole room toward ninety-four seconds, and away from the fifteen minutes before them — where the murder actually was.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '94', unit: 'sec', label: 'Camera blind' },
          { n: '05', unit: 'sec', label: 'Projector, then the bar camera' },
          { n: '01', label: 'Sprayer swapped' },
          { n: '02', label: 'Guests who saw it anyway' },
        ],
      },
    ],
  },

  // ══ 14 ═══════════════════════════════════════════════════════════════════
  {
    id: 'the-log',
    chapter: 'The clever part',
    kicker: 'The one detail most players never worked out',
    title: 'She Needed The *Log*, Not The Key',
    dek:
      'Kiyaah had every right to be behind that bar. She had been there all night. So why the borrowed apron and somebody else’s pass?',
    blocks: [
      {
        type: 'paper',
        label: 'What the door log says',
        tilt: 'L',
        body: [
          'One staff pass in. One staff pass out. Both inside the ninety-four seconds.',
          "The pass belongs to a member of staff who had *clocked out and gone home hours earlier* — a retired credential that Oindrilla's admin session had quietly switched back on.",
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What actually happened',
        body: [
          'Kiyaah pulled a service apron on over her clothes, used the borrowed pass, and swapped the sprayer.',
          'She never needed the access. *She needed the record to name somebody else.* If that log had said her name, this case would have closed the same night.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The mismatch',
        text:
          'A sprayer she was entitled to touch, entered on a pass she had no reason to use. *That is what finally caught her.*',
      },
    ],
  },

  // ══ 15 ═══════════════════════════════════════════════════════════════════
  {
    id: 'witnesses',
    chapter: 'Witnesses',
    kicker: 'Two guests who were in the right seat',
    title: "The Camera Was Blind. The Room *Wasn't*.",
    blocks: [
      {
        type: 'note',
        label: 'Anjul · 10:09 PM, service stair',
        quote:
          'Saw the service apron come back down the stair — and clocked that the face under it did not belong to staff.',
        source: 'Replica circle · was never a suspect',
      },
      {
        type: 'note',
        label: 'Parinitha · side banquette, by the bar arch',
        quote:
          'Had a clear line to the private bar the whole time the camera was down. Saw the swap itself.',
        source: 'Pixel circle · was never a suspect',
      },
      {
        type: 'strip',
        label: 'What they missed',
        text:
          'Killing a camera is not the same as killing every line of sight. The conspiracy planned around the lens. *It did not plan around the seating.*',
      },
    ],
  },

  // ══ 16 ═══════════════════════════════════════════════════════════════════
  {
    id: 'the-murder',
    chapter: '● The murder',
    kicker: '10:12 PM · the actual moment of death',
    title: 'Two Sprays Of *Orange*',
    blocks: [
      {
        type: 'paper',
        label: 'The finding — what killed Armaan Khanna',
        body: [
          'Armaan lifts the Last Light and Kiyaah finishes it tableside, exactly the way she wrote the ritual years ago: *two sprays of orange oil over the top of the glass.*',
          'That garnish is the murder. Nothing was ever dropped into the drink. The aconitine reaches the rim, his lips and the surface all at once — one serving, no splash, and *nothing else in the room touched.*',
        ],
        source: 'Cross-referenced with the toxicology summary and the atomizer analysis',
      },
      {
        type: 'card',
        tone: 'brass',
        label: 'Why the last hands are the only hands',
        body: [
          'Aconitine works in minutes, not hours. There is no slow build, no window in which somebody earlier in the evening could have done it.',
          'Which means the last person to touch that glass is the *only* person who could have.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '02', label: 'Sprays' },
          { n: '01', label: 'Glass' },
          { n: '07', unit: 'min', label: 'To first symptom' },
          { n: '22', unit: 'min', label: 'Toast to death' },
        ],
      },
    ],
  },

  // ══ 17 ═══════════════════════════════════════════════════════════════════
  {
    id: 'beat-4',
    chapter: 'Beat 4 of 4',
    kicker: '10:19 PM — 10:48 PM',
    title: 'The Last Twenty-Two *Minutes*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '10:19 PM',
            body:
              'His hands stop working mid-sentence. Aconitine takes the nerves first and the heart immediately after.',
          },
          {
            time: '10:22 PM',
            body:
              'He collapses at the stage rail. *Roddy is kneeling beside him before the room finishes screaming* — the one person there who already knows exactly what he is looking at.',
          },
          {
            time: '10:24 PM',
            hidden: true,
            body:
              "Victoria tells the first officer to seize the bar's inventory logs. She wants her own fake invoice *found early, by the police*, before anyone can ask how it got in there.",
          },
          {
            time: '10:34 PM',
            body: 'Paramedics stop resuscitation. Twenty-two minutes from the toast.',
          },
          {
            time: '10:48 PM',
            body:
              'Goa Police seal the venue. Nobody has left. *Nobody needed to* — all five of them are still in the room, sitting in five different circles.',
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
      { term: 'Ten', text: 'real, provable motives in one room' },
      { term: 'Five', text: 'innocent people who looked guilty to the end' },
      { term: 'Five', text: 'separate circles, so no table ever looked complete' },
      { term: 'One', text: 'very obvious blackout to stare at' },
    ],
  },

  // ══ 19 ═══════════════════════════════════════════════════════════════════
  {
    id: 'misdirection',
    chapter: 'Misdirection',
    kicker: 'Why a room of fifty-one people could not close it',
    title: 'Ten Real Motives, Five Innocent *People*',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        index: '01',
        label: 'The suspects were genuinely dangerous',
        body: [
          'Ten guests had a real, provable reason to want Armaan dead. Five of them were innocent: *Tara Singhania, Tanvi Vartak, Rishi Raj Rahul, Vinod Raghuwanshi* and *Anna Russo*. You could build a complete single-killer case against any one of them — and most of the room did.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '02',
        label: 'The killers sat at five different tables',
        body: [
          'Thimble, Oracle, Forgery, Hemlock, Amber. No single circle ever looked complete. Every accusation in Round 1 said _a suspect’s own people are covering for them_ — and that theory can never close on a five-way alignment across the room.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '03',
        label: 'The blackout was bait',
        body: [
          'It is the obvious opportunity, so it was left to be found. It pulled everyone toward ninety-four seconds instead of the fifteen minutes before them, when the poison was already in the building and the paperwork was already six hours old.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '04',
        label: "The room inherited Armaan's own habit",
        body: [
          'He had spent years making sure nobody compared notes across tables. So the room kept searching inside its own circle, exactly as he had trained it to — which is the same blind spot that got him killed.',
        ],
      },
      {
        type: 'strip',
        label: 'Worth saying plainly',
        text: 'Ten guilty-looking people was never a flaw in the evidence. *It was the plan.*',
      },
    ],
  },

  // ══ 20 ═══════════════════════════════════════════════════════════════════
  {
    id: 'cleared',
    chapter: 'Cleared',
    kicker: 'Two innocent people, wronged in two different ways',
    title: 'Framed, And *Used*',
    blocks: [
      {
        type: 'paper',
        label: 'Tara Singhania — framed',
        tilt: 'L',
        body: [
          'Tara had nothing to do with it. Victoria built the fake invoice _specifically_ so the replacement sprayer would look like it had arrived through Tara’s customs vendor.',
          'Her real access — crates, customs seals, display cabinets — is what made the lie survive first scrutiny. Somebody chose her, on paper, hours before the party started.',
        ],
      },
      {
        type: 'paper',
        label: 'Tanvi Vartak — used',
        body: [
          'Nobody planted anything on Tanvi. The annotated floor plan really is hers, in her own fineliner, and _DO NOT BLOCK BAR DURING REEL_ and _HOLD CAKE UNTIL ORANGE_ really are stage directions for a cake reveal.',
          'Sneha arrived at 7:05 PM with a seating plan to rearrange, saw that the party planner had already worked out on paper the exact second the whole room would turn its back on the private bar — and built the timing of the murder on top of it.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The worst part',
        text:
          'The conspiracy never had to engineer a blind spot in the crowd. *The party planner had already drawn them one.*',
      },
    ],
  },

  // ══ 21 ═══════════════════════════════════════════════════════════════════
  {
    id: 'evidence',
    chapter: 'Evidence log',
    kicker: 'Nine pieces of paper, and what each one settled',
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
    title: 'Five People. Five Tables. One *Glass*.',
    // The verdict paragraph is CASE_SOLUTION.verdict, injected by RevealDeck.
    lead: null,
    blocks: [
      {
        type: 'note',
        label: 'Closing note',
        quote:
          '“He spent years making sure nobody in this room ever compared notes. Five of them did.”',
        source: 'Inspector Ira Deshpande · closed 8 August 2026',
      },
      {
        type: 'circles',
        text: 'Thimble · Oracle · Forgery · Hemlock · Amber',
        note: 'the five circles that were in it together',
      },
    ],
  },
];

/** Slide 22 takes its paragraph straight from the answer key. */
export const REVEAL_VERDICT = CASE_SOLUTION.verdict;

export const REVEAL_SLIDE_COUNT = REVEAL_DECK.length;
