import { CASE_SOLUTION } from './gameData';

export const REVEAL_DECK = [
  {
    id: 'cover',
    kind: 'cover',
    chapter: '● Case closed',
    tag: 'The answer',
    title: 'How It *Happened*',
    lead:
      'Rehan Vora was killed at a sunset signing dinner with twenty-six guests still inside Greenr. _Here is exactly how, in plain words._',
    blocks: [
      {
        type: 'stats',
        items: [
          { n: '26', label: 'Guests inside' },
          { n: '03', label: 'People killed him' },
          { n: '10', label: 'Persons of interest' },
          { n: '01', label: 'Poisoned bottle' },
        ],
      },
      {
        type: 'note',
        label: 'Exhibit - the group chat',
        quote:
          '"nilisha packet goes in the folder after the crash. let the room solve vanity first."',
        source: '"afterparty logistics" · created 18 September, 1:05 PM',
      },
    ],
  },
  {
    id: 'short-answer',
    chapter: 'Finding of fact',
    kicker: 'If you only read one slide',
    title: 'The Short *Answer*',
    blocks: [
      {
        type: 'paper',
        label: 'Case 2609-G - closed',
        body: [
          '*Jack planned it.* Arun booked the blind spot. Manasi placed the poison inside Rehan\'s own black bottle at the upstairs tea shelf.',
          'The killers never needed the room\'s shared drink, the bar batch or a dramatic confrontation. They relied on one private habit, one staged crash and one forged paper trail that pointed the room at somebody else.',
        ],
        source: 'Signed · Inspector Tara Naik, Goa Police',
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Three killers · three lanes',
        items: [
          '*Jack* - Legal · the plan',
          '*Arun* - Media · the blind spot',
          '*Manasi* - Bar · the dose',
        ],
      },
      {
        type: 'strip',
        label: 'Why it worked',
        text: 'The room was already full of real fear, fake order and public inconvenience. *The killers only timed it better than everyone else.*',
      },
    ],
  },
  {
    id: 'victim',
    chapter: 'The victim',
    kicker: 'Who was killed',
    title: 'Rehan *Vora*',
    dek:
      'Introduced as the man cleaning the packet up before sunset. Actually the last person in the room who could still stop the signing cleanly.',
    blocks: [
      {
        type: 'paper',
        label: 'What the room saw',
        tilt: 'L',
        body: [
          'A diligence partner with a black steel bottle, a habit of refilling it himself, and the social grace to ask ruinous questions in a normal voice.',
          'By dinner, everybody knew he was dangerous. Almost nobody knew exactly why.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What he was actually doing',
        items: [
          'Separating criminal lanes from embarrassing ones before the signing closed.',
          'Preparing to pause the sunset table if three lines in the packet stayed alive.',
          'Carrying enough paper to end careers without raising his voice.',
          'Trusting the one habit nobody in the room bothered to fear: his own bottle.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '03', label: 'Criminal lanes found' },
          { n: '07', label: 'Ugly but civil problems' },
          { n: '01', label: 'Private bottle habit' },
          { n: '00', unit: 'sec', label: 'Warning given' },
        ],
      },
    ],
  },
  {
    id: 'public-record',
    chapter: 'Public record',
    kicker: '19 September 2026 · Greenr, Assagao',
    title: 'What The Room *Saw*',
    blocks: [
      {
        type: 'rail',
        stops: [
          { time: '4:10 PM', title: 'Setup', body: 'The dinner setup begins and the signing table goes live.' },
          { time: '5:15 PM', title: 'Check-in', body: 'Guests arrive, the courtyard fills, and the event becomes public.' },
          { time: '5:47 PM', title: 'Bottle', body: 'Rehan leaves his black bottle on the upstairs tea shelf.' },
          { time: '5:58 PM', title: 'The crash', body: 'The launch reel, Wi-Fi and card reader fail together.', now: true },
          { time: '6:08 PM', title: 'Upstairs', body: 'Rehan returns to the library with the closing file.' },
          { time: '6:18 PM', title: 'Found', body: 'Nathan finds him; Sharon reaches him seconds later.' },
          { time: '6:31 PM', title: 'Poisoning', body: 'Likely poisoning is spoken out loud.' },
          { time: '6:40 PM', title: 'Sealed', body: 'Police lock Greenr with all twenty-six still inside.' },
        ],
      },
      {
        type: 'card',
        label: 'What the room believed by round two',
        items: [
          'The founders were panicking and therefore dangerous.',
          'Nilisha\'s numbers scandal was probably the whole story.',
          'Something in the shared drink, or at the bar, had to be wrong.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The trap',
        text:
          'Every line on that timeline is true. The room still stared at the wrong shape of question: *who was near him*, not *who owned the bottle, the crash and the paper trail together?*',
      },
    ],
  },
  {
    id: 'part-one',
    kind: 'divider',
    chapter: 'Part one',
    number: '01',
    kicker: 'Part one',
    title: 'The *Plan*',
    lines: [
      { term: 'Why', text: 'three criminal lanes about to be read into one room' },
      { term: 'Who', text: 'legal, media and bar' },
      { term: 'How', text: 'a private bottle, a staged crash and a forged frame' },
    ],
  },
  {
    id: 'motive',
    chapter: 'Motive',
    kicker: 'Why three people decided he had to die',
    title: 'The Corrected *Packet*',
    dek:
      'Rehan\'s corrections did not describe one bad actor. They separated the room into criminal lanes and merely humiliating ones.',
    blocks: [
      {
        type: 'paper',
        label: 'What the packet actually held',
        tilt: 'L',
        items: [
          '*COUNSEL* - hidden carry note and sham retainers',
          '*FILM* - ghost production retainers and recycled sponsor deliverables',
          '*BEVERAGE* - duplicate stock invoices and buyback-credit skims',
          'Seven other issues ugly enough to create suspects but not killers',
        ],
      },
      {
        type: 'note',
        label: 'In Rehan\'s own hand',
        quote:
          '"Nilisha inflated numbers, yes. The packet making her the whole fraud is fake. Somebody is aiming the story before the signing."',
        source: 'Recovered memo - the line that kills the frame',
      },
      {
        type: 'strip',
        label: 'The turn',
        text: 'Jack read the corrected packet first. From that moment, the problem was no longer exposure. *It was whether sunset arrived before the room understood what it was signing.*',
      },
    ],
  },
  {
    id: 'recruiter',
    chapter: 'Motive',
    kicker: 'How a three-person conspiracy became inevitable',
    title: 'The Packet Was The *Recruiter*',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        label: 'Why nobody warned him',
        body: [
          'Everyone innocent knew dinner was tense. Everyone guilty knew dinner was terminal. The corrected packet did the recruiting by itself: each of the three could see their own lane in it and trust that the other two were trapped the same way.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Why there was no smaller fix',
        body: [
          'This was not a document you negotiate down in the courtyard. It was a closing stopper. Once Rehan spoke, the signing froze, the money froze and the fraud stopped being private. Delay had already run out.',
        ],
      },
      {
        type: 'strip',
        label: 'The whole case in one line',
        text: 'Greenr already contained the poison, the route, the blind spot and the panic. *The killers only aligned them.*',
      },
    ],
  },
  {
    id: 'method',
    chapter: 'Method',
    kicker: 'The method',
    title: 'Poison In The *Bottle*',
    blocks: [
      {
        type: 'paper',
        label: 'What the poison was',
        tilt: 'L',
        body: [
          '*Yellow-oleander concentrate.* Harvested from the parking hedge, reduced into a liquid and hidden in a brown bitters dropper that looked like ordinary bar gear.',
          'The room\'s shared tonic stayed clean. The killers did not poison the crowd. They prepared one private object and let Rehan do the rest himself.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'Why the bottle, and not the batch',
        items: [
          'The communal carafes were too public and too risky.',
          'Rehan always refilled the bottle himself from the upstairs shelf.',
          'Nobody else in the room had any reason to drink from it.',
          'The dropper route leaves the room clean and the victim uniquely exposed.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '01', label: 'Bottle dosed' },
          { n: '06', unit: 'min', label: 'Dose to refill' },
          { n: '10', unit: 'min', label: 'Refill to discovery' },
          { n: '00', label: 'Other guests harmed' },
        ],
      },
    ],
  },
  {
    id: 'jobs',
    chapter: 'The team',
    kicker: 'Three people, three jobs, no wasted motion',
    title: 'Who Did *What*',
    blocks: [{ type: 'jobs' }],
  },
  {
    id: 'part-two',
    kind: 'divider',
    chapter: 'Part two',
    number: '02',
    kicker: 'Part two',
    title: 'The *Day*',
    lines: [
      { term: '4:46 PM', text: 'the AV sync is scheduled' },
      { term: '5:47 PM', text: 'the bottle is left empty upstairs' },
      { term: '5:58 PM', text: 'the crash scatters the room' },
      { term: '6:02 PM', text: 'the dose goes in' },
      { term: '6:08 PM', text: 'Rehan refills the bottle himself' },
      { term: '6:18 PM', text: 'the body is found' },
    ],
    blocks: [{ type: 'key' }],
  },
  {
    id: 'beat-1',
    chapter: 'Beat 1 of 4',
    kicker: '18 September - 4:46 PM',
    title: 'Prepared Before The *Sunset*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '1:05 PM · 18 Sep',
            hidden: true,
            body:
              'Jack sees the first close-review queries and creates the group chat. Three exposed lanes begin building one contingency.',
          },
          {
            time: 'Night before',
            hidden: true,
            body:
              'Jack drafts the Nilisha frame. Manasi clips yellow oleander from the parking hedge and reduces it into a liquid concentrate inside a brown dropper bottle.',
          },
          {
            time: '12:14 PM',
            hidden: true,
            body:
              'Rehan sends Jack the corrected packet with a simple consequence: the signing may have to pause. Jack understands the room is no longer closing a deal. It is approaching an exposure event.',
          },
          {
            time: '4:46 PM',
            body:
              'Arun schedules the AV sync on the admin tablet. The twelve-minute blind spot is now on the clock hours before the room thinks anything is wrong.',
          },
        ],
      },
      {
        type: 'paper',
        label: 'Read this twice',
        tilt: 'L',
        body: [
          'The murder was mostly designed before the welcome line ever had a chance to start.',
          'Nothing needed to be smuggled into Greenr after check-in. The poison, the panic, the paper and the route all already belonged to the venue or the event.',
        ],
      },
    ],
  },
  {
    id: 'beat-2',
    chapter: 'Beat 2 of 4',
    kicker: '5:15 PM - 5:47 PM',
    title: 'Before The *Crash*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '5:15 PM',
            body:
              'Check-in opens. The courtyard fills with people, and every small private problem in the room starts trying to look like the only one that matters.',
          },
          {
            time: '5:25 PM',
            body:
              'Rain closes the side gate and pins the valet lane. From this point on, nobody leaves without being seen.',
          },
          {
            time: '5:47 PM',
            body:
              'Rehan rinses the bottle and leaves it empty on the upstairs tea shelf, exactly where witnesses later remember seeing it. The murder route now exists. It just does not know it yet.',
          },
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The important innocence',
        text:
          'The bottle is not dangerous when he leaves it. That matters. It is why the room can stop looking at the tonic, the bar and the whole shared batch.',
      },
    ],
  },
  {
    id: 'beat-3',
    chapter: 'Beat 3 of 4',
    kicker: '5:58 PM - 6:11 PM',
    title: 'Twelve Clean *Minutes*',
    dek:
      'The cameras were blind for twelve minutes - on a schedule booked at 4:46. The crash made sure the blindness had company.',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '5:58 PM',
            hidden: true,
            body:
              'The AV sync hits. The live courtyard and mezzanine feeds go blank while the corridor system keeps buffering locally. The guest Wi-Fi and card reader fail with them. The room breaks into exactly the directions the killers needed.',
          },
          {
            time: '6:02 PM',
            hidden: true,
            body:
              'Manasi takes the pantry service stair and doses the bottle. Jack keeps the founders pinned to a false signature panic. Arun loops the reel so the room hears culture instead of logistics.',
          },
          {
            time: '6:09 PM',
            hidden: true,
            body:
              'One buffered corridor clip is manually deleted from the live queue. Not all evidence died with the live feeds. Only the one piece that might have died helpfully.',
          },
          {
            time: '6:11 PM',
            body:
              'The cameras return. The room assumes the trouble ended. In truth, the murder route has already closed behind them.',
          },
        ],
      },
      {
        type: 'paper',
        label: 'The suspect pool was the point',
        body: [
          'The crash is not only cover for the dose. It manufactures movement, panic and a dozen guilty-looking micro-decisions all at once.',
          'That is why ten people make the list. The room is supposed to feel crowded with fear before it becomes precise about guilt.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '12', unit: 'min', label: 'Cameras blind' },
          { n: '03', label: 'People in the plan' },
          { n: '01', label: 'Deleted corridor clip' },
          { n: '10', label: 'Suspects born from the noise' },
        ],
      },
    ],
  },
  {
    id: 'the-log',
    chapter: 'The clever part',
    kicker: 'The detail the room keeps wanting to call a glitch',
    title: 'It Was Never A *Tech* Problem',
    dek:
      'The guest stack visibly failed under Saima and Umair. That is why it worked so well as cover.',
    blocks: [
      {
        type: 'paper',
        label: 'What the trace actually says',
        tilt: 'L',
        body: [
          'The reboot command starts on the AV subnet. The guest network and card reader fail second. Saima\'s logs show fallout, not origin. The room sees systems pain and assumes systems guilt.',
          'That mistake is one of the conspiracy\'s best pieces of design. Nobody has to lie about the crash. They only have to let the room misunderstand what it means.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        label: 'What actually happened',
        body: [
          'Arun turned an AV maintenance window into a murder corridor. The sync blinded the mezzanine, dragged the guest stack down, sent engineers sprinting and made a human hand look like a software problem.',
          'The trick is not that the tech is fake. The trick is that the *cause* of the tech failure belongs to the killer, while the *suffering* belongs to innocent people in the room.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'The mismatch',
        text:
          'A real crash with a false source. *That is what finally clears Saima and Umair without making the crash disappear.*',
      },
    ],
  },
  {
    id: 'witnesses',
    chapter: 'Witnesses',
    kicker: 'Four people who were in the right seat',
    title: "The Cameras Were Blind. The Room *Wasn't*.",
    blocks: [
      {
        type: 'note',
        label: 'Kiandra · 5:50 PM, upstairs tea shelf',
        quote:
          'Sketched the shelf out of boredom and gave the bottle a position in graphite. That drawing is why the room can prove the bottle moved during the blind spot.',
        source: 'Dental illustrator · accidental floor witness',
      },
      {
        type: 'note',
        label: 'Elton · 5:58:12 PM, sound desk',
        quote:
          'Heard the same synth bar restart like a fingerprint. A glitch stutters. A loop comes back on purpose.',
        source: 'Brand strategist · knows cue points better than alibis',
      },
      {
        type: 'note',
        label: 'Anshu · 5:17 PM, signing table',
        quote:
          'Accidentally photographed the folder before the late pages went in. An error message in the social life. A gift in the case file.',
        source: 'Dental partner · unwilling paper witness',
      },
      {
        type: 'note',
        label: 'Saanvi · 6:00 PM, upstairs route',
        quote:
          'Saw Manasi near the herb walk with the brown dropper and kept walking because she had her own embarrassing secret to protect. Witnesses often arrive dirty. The clue still arrives.',
        source: 'Dental partner · places the dropper near the route',
      },
      {
        type: 'strip',
        label: 'What they missed',
        text:
          'The conspiracy planned around cameras, queues and paper. It never fully planned around bored, observant people with inconvenient habits. *That is why the room could still solve it.*',
      },
    ],
  },
  {
    id: 'the-murder',
    chapter: '● The murder',
    kicker: '6:08 PM · the actual moment',
    title: 'The Refill *Kills* Him',
    blocks: [
      {
        type: 'paper',
        label: 'The finding - what killed Rehan Vora',
        body: [
          'At 6:08 Rehan tops the bottle up from the pre-filled self-serve communal tonic decanter, carries the closing file into the library and drinks from a vessel that has already been prepared for him.',
          'Nobody follows him upstairs to drop something in. Nobody needs to. *The dose was already waiting*, and the only hands on the bottle from that moment onward were his.',
        ],
        source: 'Cross-referenced with toxicology, shelf analysis and witness timing',
      },
      {
        type: 'card',
        tone: 'brass',
        label: 'Why "who was near him?" was still the wrong question',
        body: [
          'Being near Rehan at 6:12 proves very little. The murder is already in motion.',
          'Being in control of the bottle, the blind spot and the forged answer to the room proves almost everything.',
        ],
      },
      {
        type: 'stats',
        items: [
          { n: '01', label: 'Bottle dosed' },
          { n: '06', unit: 'min', label: 'Dose to refill' },
          { n: '10', unit: 'min', label: 'Refill to discovery' },
          { n: '00', label: 'Shared guests harmed' },
        ],
      },
    ],
  },
  {
    id: 'beat-4',
    chapter: 'Beat 4 of 4',
    kicker: '6:08 PM - 6:40 PM',
    title: 'The Last *Thirty-Two Minutes*',
    blocks: [
      {
        type: 'beats',
        items: [
          {
            time: '6:08 PM',
            body:
              'Rehan refills the bottle and disappears into the upstairs library with the closing file. Nobody sends him. Nobody has to.',
          },
          {
            time: '6:18 PM',
            body:
              'Nathan finds him on the floor; Sharon reaches him seconds later. The black bottle is down. The welcome line never happens.',
          },
          {
            time: '6:20 PM',
            body:
              'The room starts doing what rooms always do: confusing the loudest story with the truest one. Jack already has Nilisha ready.',
          },
          {
            time: '6:31 PM',
            body:
              'Likely poisoning is spoken aloud, killing the heatstroke exit and forcing the room back toward mechanism.',
          },
          {
            time: '6:40 PM',
            body:
              'Police seal Greenr. Rain, chain and register remove the last fantasy that somebody else slipped away with the answer.',
          },
        ],
      },
    ],
  },
  {
    id: 'part-three',
    kind: 'divider',
    chapter: 'Part three',
    number: '03',
    kicker: 'Part three',
    title: 'Why It *Held*',
    lines: [
      { term: '10', text: 'real reasons to fear the signing' },
      { term: '07', text: 'innocent problems muddying the room' },
      { term: '03', text: 'actual criminal lanes' },
      { term: '01', text: 'forged answer planted before the scream' },
    ],
  },
  {
    id: 'misdirection',
    chapter: 'Misdirection',
    kicker: 'Why twenty-six guests could not close it cleanly',
    title: 'Ten Real Motives, Seven Innocent *Problems*',
    blocks: [
      {
        type: 'card',
        tone: 'signal',
        index: '01',
        label: 'The founders really were panicking',
        body: [
          'Anushka and Anmoll both had genuine reasons to fear what Rehan was about to say. That truth is why they are such durable bad answers.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '02',
        label: 'Nilisha was easy to frame',
        body: [
          'The metrics inflation was real. The packet making her the whole story was false. The frame only works because vanity had already done half the labour for it.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '03',
        label: 'The crash pointed at the wrong people',
        body: [
          'Saima and Umair look guilty because they are the visible faces of the failure. Arun stays invisible because he caused it from the side that never expects blame.',
        ],
      },
      {
        type: 'card',
        tone: 'signal',
        index: '04',
        label: 'The room over-read access',
        body: [
          'Amrusha had the service map. Sampada had an upstairs detour. Both facts feel like murder until the bottle timeline and the dropper route close them out.',
        ],
      },
      {
        type: 'strip',
        label: 'Worth saying plainly',
        text: 'The wide suspect pool is not evidence failing. *It is the killers successfully loading the room with believable wrong turns.*',
      },
    ],
  },
  {
    id: 'cleared',
    chapter: 'Cleared',
    kicker: 'Two innocent answers the room badly wanted to believe',
    title: 'Framed, And *Misread*',
    blocks: [
      {
        type: 'paper',
        label: 'Nilisha - framed',
        tilt: 'L',
        body: [
          'Nilisha had nothing to do with the murder. Jack forged the sponsor approvals specifically so the room would collapse an existing vanity problem into a criminal answer.',
          'The frame dies on timing, language and printer origin: it is born too late, says the wrong things and comes from the wrong machine.',
        ],
      },
      {
        type: 'paper',
        label: 'Saima - misread',
        body: [
          'Saima\'s stack visibly failed, which made her feel like the easiest technical answer in the venue. The trace closes the opposite way: her logs show damage, not intent. The reboot began upstream on the AV subnet and only reached her second.',
        ],
      },
      {
        type: 'strip',
        aged: true,
        label: 'And Sampada',
        text:
          'Tears, a pantry and a bad timeline are not murder. They are what fear looks like when somebody knows their private humiliation is about to go public.',
      },
    ],
  },
  {
    id: 'evidence',
    chapter: 'Evidence log',
    kicker: 'What actually closed it',
    title: 'What Proved *It*',
    blocks: [{ type: 'proof' }],
  },
  {
    id: 'verdict',
    kind: 'cover',
    chapter: '● Case closed',
    tag: 'Verdict',
    title: 'Three People. Three Lanes. One *Bottle*.',
    lead: null,
    blocks: [
      {
        type: 'note',
        label: 'Closing note',
        quote:
          '"Nothing entered Greenr for the murder. The poison, the panic, the paper and the route were all already here."',
        source: 'Inspector Tara Naik · closed 19 September 2026',
      },
      {
        type: 'circles',
        text: 'Legal · Media · Bar',
        note: 'the three lanes that were in it together',
      },
    ],
  },
];

export const REVEAL_VERDICT = CASE_SOLUTION.verdict;

export const REVEAL_SLIDE_COUNT = REVEAL_DECK.length;