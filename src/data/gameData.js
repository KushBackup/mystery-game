// --- GAME DATA: THE ONAM IN BLACK CASE (Case 2108-C) ---
//
// Canon lives in STORY.md. Every string here restates that file.
// 69 players (the full TripleSpeed roster minus the host), 34 suspects,
// 12 prime suspects, 5 killers.

export const ROUNDS = [
  { id: 0, title: 'The Incident', desc: 'Read the report & profiles' },
  { id: 1, title: 'Accusations', desc: 'What did you see?' },
  { id: 2, title: 'Motives', desc: 'Who had reason to kill?' },
  { id: 3, title: 'Evidence', desc: 'Forensics & Documents' },
  { id: 4, title: 'Revelations', desc: 'The Twist' },
  { id: 5, title: 'Finale', desc: 'Final Discussion' },
  { id: 6, title: 'The Reveal', desc: 'Case Closed' },
];

const killer = (data) => ({ ...data, role: 'MURDERER', isSuspect: true });
const suspect = (data) => ({ ...data, role: 'SUSPECT', isSuspect: true });
const witness = (data) => ({ ...data, role: 'WITNESS', isSuspect: false });

// ---------------------------------------------------------------------------
// Display order
//
// Source order in this file is authorial — the five conspirators are written
// first, then the seven innocent prime suspects, then the other 22 persons of
// interest, then the 35 witnesses, so the data stays readable. Rendered as-is
// that would put the killers at the top of the roster, the ballot and every
// deck, which is a tell before a single clue is decoded.
//
// `dealt()` re-orders a list by hashing each entry's id. The jumble is *stable*:
// every player, on every device and every reload, gets the same sequence, so
// "the third one" in chat still means the same person, and a colleague's file
// number never changes mid-game. `isHot` marks the entries that must not
// cluster at the top (conspirators and their clues) — any that the hash happens
// to place inside the first `safeTop` slots is pulled out and reinserted around
// the middle of the list.
// ---------------------------------------------------------------------------
const stableHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
};

// The salt has to be *mixed* into the hash, not concatenated onto the string.
// `acc_anurag` and `mot_anurag` differ by a fixed prefix of the same length, so
// a concatenated salt shifts every hash in a deck by the same constant and
// leaves the relative order identical — the accusation and motive stacks would
// come out in the same sequence. XOR plus an avalanche step decorrelates them.
const seeded = (salt, id) => {
  let h = stableHash(id) ^ stableHash(salt);
  h = Math.imul(h ^ (h >>> 15), 0x27d4eb2d);
  return (h ^ (h >>> 15)) | 0;
};

const dealt = (list, { salt = '', isHot = () => false, safeTop = 0, group } = {}) => {
  const out = [...list].sort((a, b) => {
    if (group) {
      const delta = group(a) - group(b);
      if (delta !== 0) return delta;
    }
    return seeded(salt, a.id) - seeded(salt, b.id);
  });

  // One at a time, front to back: pulling an entry out slides the rest up, so a
  // hot entry that was just below the line can end up above it. Re-checking
  // after every move is what makes the guarantee hold. `guard` bounds the loop
  // in case a caller ever asks for more clean slots than the list has cold
  // entries to fill them with.
  for (let guard = 0; guard < out.length; guard += 1) {
    const offender = out.findIndex((item, index) => index < safeTop && isHot(item));
    if (offender === -1) break;
    const [item] = out.splice(offender, 1);
    // Re-enter at a hashed slot below the clean zone rather than always at the
    // midpoint — otherwise every evicted entry lands in the same place and two
    // decks dealt with different salts end up with the conspirators bunched in
    // the same band.
    const room = out.length - safeTop + 1;
    const slot = safeTop + (Math.abs(seeded(`${salt}:bump`, item.id)) % room);
    out.splice(slot, 0, item);
  }

  return out;
};

const ROSTER = [
  // ── THE FIVE ─────────────────────────────────────────────────────────────
  killer({
    id: 'char_anurag',
    name: 'Anurag',
    profession: 'Head of Payments',
    group: 'PAYMENTS',
    bio: 'Runs the settlement pipes that every rupee of TripleSpeed revenue flows through. The calmest person in any incident channel, mostly because he wrote half the incidents.',
    quirk: 'Can quote the rolling-reserve percentage from memory but claims he cannot remember where the War Room HDMI lives.',
    secret: 'You are one of the five people who killed Dev Malhotra, and the plan was yours. He pulled the settlement archive on Tuesday — the one dataset you could not sanitize — and Friday 4 PM he was going to read names, starting with yours. You staged the 2:47 alert and recruited the other four. Nobody in this office can be allowed to prove it.',
    neverDo: 'Panic in an incident channel.',
    motive: 'The payment provider\'s rolling-reserve releases have been landing in a beneficiary account one letter off the company\'s name for fourteen months. Dev pulled the settlement archive directly from the provider portal on Tuesday — and the portal emailed the pull notification to the billing admin: Anurag. The Friday briefing named payments first.',
    timeline: '8:52 AM - Arrived and had settlement dashboards open before anyone else was in.\n1:00 PM - On the terrace for the sadhya, sat with the ops table.\n2:46 PM - Was typing on his phone a moment before the alert tone went off in the ops channel.\n2:49 PM - Convened the War Room and ran the incident bridge.\n2:55 PM - Told the room the alert would "clear by four."\n3:57 PM - Still in the War Room when the shouting started upstairs.',
    code: 'MOSAIC',
  }),
  killer({
    id: 'char_yao',
    name: 'Yao',
    profession: 'Technical Lead',
    group: 'ENGINEERING',
    bio: 'The most senior engineer on the third floor and the only person who understands the office network, the camera NVR and the cloud bill at the same time. Prefers it that way.',
    quirk: 'Answers every infrastructure question with "known issue" and is right just often enough to get away with it.',
    secret: 'You are one of the five people who killed Dev Malhotra, and every camera that failed today failed on your schedule. The cloud-partner markup is yours; his draft named your lane. You staged the 11 AM outage, wiped the morning footage, deleted his upload and booked the afternoon camera gap before lunch. Stay helpful. Stay visible. Deny calmly.',
    neverDo: 'Touch a system without a change window.',
    motive: 'TripleSpeed buys its compute through a third-party "cloud partner" at marked-up committed-use rates, and the difference has been coming back to Yao off the books. Dev\'s infra-cost memo flagged the partner pricing as inexplicable, and the Friday briefing would have made the kickback arithmetic public.',
    timeline: '8:44 AM - Arrived, third floor, headphones on.\n11:04 AM - In the network cupboard for the WiFi outage; waved off Shrey\'s offer to help because "the array is rebuilding."\n11:47 AM - Network back. When Mohit P. asked minutes later, the morning camera footage was "corrupted in the failover."\n1:05 PM - Terrace, sat with the engineering table.\n2:49 PM - Joined the War Room for the payment alert and stayed in front of witnesses until the end.',
    code: 'TUNDRA',
  }),
  killer({
    id: 'char_giles',
    name: 'Giles',
    profession: 'Operations Executive',
    group: 'OPS',
    bio: 'The person who actually makes the office run: vendors, repairs, couriers, party logistics. If something got fixed, Giles called somebody.',
    quirk: 'Maintains that every problem in the building can be solved with one urgent ticket and one polite threat.',
    secret: 'You are one of the five people who killed Dev Malhotra, and yours were the hands. You booked the machine repair at 8:12, took your share of it in the shared Uber, and at 2:52 — inside the camera gap, on a dead visitor badge — you dosed his tumbler and ran a blank shot to be sure the machine would work. You were fetching an HDMI. Stick to the HDMI.',
    neverDo: 'Leave a vendor invoice unfiled.',
    motive: 'Eleven months of ghost-vendor purchase orders were raised under Giles\'s login — ₹68 lakh of shoots and props that never existed, nine months of it as "Zenlyt Productions" and the rest under the name the vendor was quietly rebooted as in May. On Thursday Dev emailed him a checklist request: "all POs under ₹5L, FY 25-26." That request is a list of everything Giles ever signed.',
    timeline: '8:12 AM - Logged an urgent service ticket for the third-floor coffee machine from his phone, marked "before the party."\n8:37 AM - Shared an Uber in with Kalaivani — a first.\n9:41 AM - Signed the technician in at ground-floor reception, drew him a visitor badge from the tray, walked him up, and signed the job sheet.\n1:00 PM - Ran the terrace setup, then sat with the ops table.\n2:50 PM - Left the party to fetch the spare HDMI for the 4 PM toast.\n3:05 PM - Joined the War Room; the HDMI was already on the terrace.',
    code: 'PARSEC',
  }),
  killer({
    id: 'char_kalaivani',
    name: 'Kalaivani',
    profession: 'Operations and Customer Support',
    group: 'SUPPORT',
    bio: 'Half the support queue and all of the terrace garden. Waters the planters every morning before standup and keeps a pruning log nobody else has ever asked to see.',
    quirk: 'Has a chemistry degree that surfaces exactly once a year, at the Diwali quiz.',
    secret: 'You are one of the five people who killed Dev Malhotra, and the poison came out of your flask. You clipped the hedge Wednesday night, brewed the concentrate at home, and decanted Giles\'s share into a bottle in the 8:37 Uber. The rest is still in the flask under the beverage table, which is why nobody gets to open it. Your afternoon is spotless — you served payasam in front of forty people. Keep it that way. The mornings are the only thing that can catch you.',
    neverDo: 'Let a plant die on my floor.',
    motive: 'Every Zenlyt delivery that never arrived carries a second signature confirming it did — hers. Dev requested the goods-received register on Wednesday. The ghost vendor was survivable as a paperwork scandal only if nobody ever cross-checked the signatures, and cross-checking signatures was now literally somebody\'s job.',
    timeline: '8:37 AM - Came in by Uber, shared with Giles for the first time.\n8:45 AM - Skipped the morning watering — told Riya the party prep mattered more.\n12:45 PM - Helped receive the sadhya and ran the serving line.\n1:30 PM - Served payasam in front of the whole terrace.\n2:58 PM - Nine-minute run to the first-floor store for more banana chips.\n3:07 PM - Back on the terrace, serving.',
    code: 'COBALT',
  }),
  killer({
    id: 'char_akshat',
    name: 'Akshat',
    profession: 'Media Buyer',
    group: 'MARKETING',
    bio: 'Owns the ad accounts and the daily spend calls. Talks about ROAS the way other people talk about weather — as something that happens to him.',
    quirk: 'Keeps a spreadsheet ranking every restaurant on the Zomato budget by "value per rupee of regret."',
    secret: 'You are one of the five people who killed Dev Malhotra, and the false trail is your work. The reseller kickback is yours; his draft flagged your 12% delta. Wednesday at 11:58 PM you built the Zenlyt onboarding pack that points at Victor. If anyone asks who brought the vendor in, the answer is in the file. Let them find it.',
    neverDo: 'Let a campaign overspend without a story ready.',
    motive: 'A slice of TripleSpeed\'s ad spend routes through a reseller account that returns 12% to Akshat. It is why some months the spend runs high and the ROAS runs low, and why Dev\'s spend reconciliation kept circling a delta nobody could explain. The Friday briefing would have explained it.',
    timeline: '9:02 AM - Arrived, spend call at 9:30 as usual.\n1:00 PM - Terrace, sat with the marketing table, left early.\n2:40 PM - Back at his desk on the second floor "prepping Monday\'s budgets."\n2:55 PM - Seen at his desk with the vendor drive open; did not look up when the alert hit.\n3:57 PM - Still at his desk when the news came down.',
    code: 'FRESCO',
  }),

  // ── THE SEVEN INNOCENT PRIME SUSPECTS ────────────────────────────────────
  suspect({
    id: 'char_victor',
    name: 'Victor',
    profession: 'Performance Marketing',
    group: 'MARKETING',
    bio: 'Runs paid acquisition and has spent a year answering for spend numbers that never quite added up, no matter how well the campaigns ran.',
    quirk: 'Refreshes the ROAS dashboard the way other people check the door is locked.',
    secret: 'I have spent months quietly terrified that the leak everyone whispers about would somehow land on my desk — and this week it started to feel like someone was steering it there.',
    neverDo: 'Sign off on a number I have not rebuilt myself.',
    motive: 'Dev\'s early notes kept circling performance marketing — high spend, low ROAS, the May vendor mess. Victor knew that if Friday\'s briefing blamed his lane, he was finished, and he had been fighting with Dev about the spend numbers all week. What he did not know: the vendor file "proving" he onboarded Zenlyt had been manufactured two days earlier.',
    timeline: '8:58 AM - Arrived, straight into a spend review.\n1:00 PM - Terrace, marketing table.\n2:50 PM - Took a call in the second-floor phone booth and stayed twenty minutes.\n3:10 PM - Came out, would not say who the call was with.\n3:56 PM - On the stairs when Aarohi\'s shout came down.',
    code: 'GAZEBO',
  }),
  suspect({
    id: 'char_sukhans',
    name: 'Sukhans',
    profession: 'Director · Co-founder',
    group: 'FOUNDERS',
    bio: 'Co-founded the company and sits in the glass cabin on the third floor, twenty feet from where Dev worked. The $10-million-a-month number is his slide.',
    quirk: 'Schedules investor calls during parties on the theory that background laughter reads as traction.',
    secret: 'I co-signed hiring Dev — and then spent Wednesday arguing the audit should be shut down before diligence. If that argument surfaces, I look like the man who wanted the report dead two days before its author was.',
    neverDo: 'Let a number reach an investor before I have seen it.',
    motive: 'Dev\'s findings, surfacing two months before a credit-line diligence, could freeze the $10M-a-month plan for a year. Half the third floor heard Sukhans tell Elias the audit extension was "a witch hunt that will burn the team before diligence." A dead consultant, the theory goes, kills the report.',
    timeline: '8:31 AM - In before nine, cabin, door open.\n1:00 PM - Terrace; gave the Onam toast with Elias.\n3:00 PM - Left the party for a scheduled investor call, alone in his cabin.\n3:22 PM - Call ended; stayed at his desk clearing mail.\n3:56 PM - First founder on the scene after Aarohi\'s shout.',
    code: 'HELIX',
  }),
  suspect({
    id: 'char_aarohi',
    name: 'Aarohi',
    profession: 'Executive Assistant',
    group: 'FOUNDERS OFFICE',
    bio: 'Runs the founders\' calendars, the Glass Room bookings and, for the past three weeks, most of Dev\'s logistics. Knew his schedule better than he did.',
    quirk: 'Can produce a meeting room, a charger and a birthday cake inside four minutes, in any order.',
    secret: 'I read the agenda page I printed for Dev. I know Friday\'s "Ways of Working toast" was nothing of the kind — and I have been carrying that around all day, telling no one.',
    neverDo: 'Let a calendar clash survive the hour.',
    motive: 'Aarohi booked the Glass Room, printed one page for Dev at 12:40 standing guard over the printer tray, was seen feeding the shredder at 3:45 — and found the body ten minutes later. She also administered the founders\'-office float Dev\'s expense review had flagged. Finder, shredder, and flagged: three lanes of suspicion on one person.',
    timeline: '8:26 AM - In early to set up the terrace AV with Yash T.\n12:40 PM - Printed a single page for Dev and took it straight off the tray.\n1:00 PM - Terrace, running the party from the edges.\n3:04 PM - Down to the Glass Room to lay it out for the four o\'clock, then straight back up.\n3:45 PM - At the third-floor shredder with one page.\n3:55 PM - Went to fetch the good speaker for the 4 PM toast and saw him through the glass.',
    code: 'INGOT',
  }),
  suspect({
    id: 'char_nehal',
    name: 'Nehal',
    profession: 'Head of Organic',
    group: 'MARKETING',
    bio: 'Built the organic-growth story TripleSpeed tells on every call. Protective of the team, more protective of the numbers.',
    quirk: 'Says "that\'s a paid problem" the way other people say good morning.',
    secret: 'Some of the organic wins I have been promoted on were quietly inflated by whatever has been wrong in paid — I suspected it, said nothing, and Dev worked it out in three weeks.',
    neverDo: 'Let paid take credit for an organic win.',
    motive: 'Dev\'s attribution work would republish the organic/paid split — and half of Nehal\'s growth story was sitting on the wrong side of it. On Wednesday he followed Dev off the terrace stairs saying "publish that split and my team\'s numbers die with it." On Friday he left the party for a client escalation nobody in support can find a ticket for.',
    timeline: '9:04 AM - Arrived, content standup.\n1:00 PM - Terrace, marketing table.\n2:52 PM - Left the party for a "client escalation."\n3:15 PM - At his second-floor desk on WhatsApp, head down.\n3:57 PM - Back on the terrace as the news broke.',
    code: 'KAYAK',
  }),
  suspect({
    id: 'char_prerna',
    name: 'Prerna',
    profession: 'Founding UI/UX Designer',
    group: 'DESIGN',
    bio: 'Employee number four. Designed everything the company has ever shipped, including the Onam invite everyone is standing under.',
    quirk: 'Cannot watch a montage without re-kerning it in her head.',
    secret: 'The design-tools contract Dev flagged is with a studio my old classmate founded. It is good software at a fair price — but I never disclosed the connection, and now disclosure looks like confession.',
    neverDo: 'Ship a first draft.',
    motive: 'Dev\'s vendor review flagged the design-tooling contract as an undisclosed related-party deal — the studio belongs to Prerna\'s old classmate. For a founding employee with an equity refresh on the table, "undisclosed conflict" is a career-ending phrase, and the review would have landed Friday.',
    timeline: '9:12 AM - Arrived, design crit at 9:30.\n1:00 PM - Terrace; the design team won the pookalam.\n2:55 PM - Went down for the montage source file — the export Vipin had was missing a fix.\n3:06 PM - Came back up by the service stairs because the lift was held at the second floor.\n3:58 PM - With Vidisha when the terrace went quiet.',
    code: 'LAGOON',
  }),
  suspect({
    id: 'char_adithya',
    name: 'Adithya',
    profession: 'Technical Product Manager',
    group: 'PRODUCT',
    bio: 'Owns the payment-provider migration — the project the whole company blames whenever settlement wobbles, which is often.',
    quirk: 'Keeps a countdown to migration cutover on his monitor. It has been "6 weeks away" for five months.',
    secret: 'I read one line of Dev\'s draft over his shoulder in the Glass Room: "the migration owner either missed it or enabled it." I have not slept properly since.',
    neverDo: 'Ship a cutover on a Friday.',
    motive: 'The reserve skim lived under the noise of Adithya\'s delayed migration — every "provider issue" bought it another quarter. Dev\'s draft put it plainly: the migration owner either missed it or enabled it. Adithya knew the sentence existed, knew Friday would read it aloud, and ran to the 2:47 alert like a man who had been waiting for a starting gun.',
    timeline: '8:49 AM - Arrived, provider dashboards open.\n1:00 PM - Terrace, product table.\n2:47 PM - First person moving when the alert hit; reached the War Room by 2:49.\n3:30 PM - Asked the War Room why Dev of all people had not come down for a settlement alert.\n4:05 PM - Still holding the incident bridge nobody needed any more.',
    code: 'NIMBUS',
  }),
  suspect({
    id: 'char_luke',
    name: 'Luke',
    profession: 'VIP Relations + Customer Experience Lead',
    group: 'SUPPORT',
    bio: 'Handles the customers whose lifetime value has a comma in it. Authorizes comps, make-goods and apologies at a scale that made an auditor blink.',
    quirk: 'Orders from two restaurants at once "for range" and defends it as customer research.',
    secret: 'Thursday\'s shouting match with Dev ended with me saying the comps ledger was none of his business. It was absolutely his business, and by Thursday night I knew exactly how bad that sentence would sound if anything ever happened to him.',
    neverDo: 'Let a VIP hear the word "policy."',
    motive: 'Dev flagged the VIP comps-and-refunds channel as a possible leak lane — every make-good Luke authorized after a payment-provider failure was, on paper, untraceable spend. Thursday they argued about it loudly enough for the second floor to hear through glass. Friday, Luke took two gate runs during the window, and the register only shows one.',
    timeline: '9:06 AM - Arrived with two coffees, neither from the machine.\n1:00 PM - Terrace, everywhere at once.\n2:55 PM - Gate run for his own Zomato order.\n3:20 PM - Second gate run for a VIP courier — the register page had just turned, so the entry sat unfound for hours.\n3:59 PM - Called 108 and stayed on the line while Kursheeth did CPR.',
    code: 'OTTER',
  }),
  // ── PERSONS OF INTEREST (22) — off the terrace during the window ─────────
  suspect({
    id: 'char_vipin',
    name: 'Vipin',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Cuts the ad creative that pays for everyone\'s Zomato budget, and the Onam reel nobody asked him to make but everyone expected.',
    quirk: 'Renders everything twice because "the first export is a lie."',
    secret: 'The Onam reel was done at noon. I stayed in the edit bay through the party because I wanted the quiet, and I have been letting everyone believe I was working.',
    neverDo: 'Hand over an unwatermarked master.',
    motive: 'Dev\'s contractor review asked why the edit team\'s outsourced overflow work never seemed to arrive from the vendors billed for it. Vipin had signed off two Zenlyt "delivery" links that were actually his own re-uploaded cuts — lazily, not criminally, but the paper says what it says.',
    timeline: '9:15 AM - Arrived, edit bay, headphones on.\n1:00 PM - Terrace for the sadhya, one plate, back down by 1:40.\n2:30 PM - Second-floor edit bay "rendering the Onam reel" with Aarush.\n2:58 PM - Prerna came into the bay for the montage source file and left with it.\n3:58 PM - Heard the shouting through the stairwell.',
    code: 'PRISM',
  }),
  suspect({
    id: 'char_yash_s',
    name: 'Yash S.',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer on checkout. When the payment provider sneezes, his pager catches the cold.',
    quirk: 'Names his branches after Bangalore traffic junctions, by mood.',
    secret: 'I silenced two settlement-mismatch alerts last quarter because they always self-resolved. If those alerts were the skim breathing, I muted the case for three months.',
    neverDo: 'Deploy after 4 PM on a Friday.',
    motive: 'Two of the settlement-mismatch alerts Dev\'s report reconstructs were acknowledged-and-muted from Yash S.\'s on-call account. Innocent alert fatigue — but on paper he is the engineer who turned off the smoke detector.',
    timeline: '8:40 AM - In before nine, checkout standup.\n1:00 PM - Terrace, engineering table.\n2:47 PM - Back to his third-floor desk for the alert hotfix.\n3:20 PM - Heads-down in logs; noticed nothing.\n3:56 PM - Ran to the Glass Room with the others.',
    code: 'QUARTZ',
  }),
  suspect({
    id: 'char_sharad',
    name: 'Sharad',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Senior-most editor by tenure and by opinion. Smokes on a schedule the way other people take meetings.',
    quirk: 'Grades every office event by how it would look color-corrected.',
    secret: 'From the smoking corner you can hear more than people think. I heard two colleagues rehearse the same sentence about an invoice this week, and I have not decided what to do with that.',
    neverDo: 'Cut to music I did not choose.',
    motive: 'Sharad billed edit-contracting overflow through a freelancer pool Dev\'s review could not fully trace — genuinely sloppy invoicing, not theft, but three of his freelancers appear adjacent to Zenlyt entries in the ledger, and he knew Friday would ask him to explain the neighbourhood.',
    timeline: '9:20 AM - Arrived, edit bay.\n1:00 PM - Terrace for the sadhya.\n2:45 PM - Smoking corner behind the hedge with Tauseef and Sanad.\n3:15 PM - Still behind the hedge — invisible to every camera and every photo.\n3:57 PM - Came around the hedge to find the terrace frozen.',
    code: 'RAVINE',
  }),
  suspect({
    id: 'char_aditi',
    name: 'Aditi',
    profession: 'Influencer Manager',
    group: 'MARKETING',
    bio: 'Manages the creator roster and the barter ledger — the flow of products, fees and favours that keeps TripleSpeed in feeds.',
    quirk: 'Refers to every creator by follower count, then apologizes, then does it again.',
    secret: 'One creator on our roster is paid through an agency that I am fairly sure exists only as a letterhead. I flagged it once, got waved off, and stopped asking.',
    neverDo: 'Promise a creator an exclusive I cannot deliver.',
    motive: 'Dev\'s review asked for the influencer barter ledger — a ledger Aditi keeps in a spreadsheet only she can decode. Nothing in it is criminal, but a portion of Zenlyt\'s ghost invoices were labelled "creator production support," which made her ledger the natural place to hide them and her the natural person to ask about it.',
    timeline: '9:08 AM - Arrived, creator calls till noon.\n1:00 PM - Terrace, marketing table.\n3:00 PM - Down to the gate to hand a creator\'s package to a courier.\n3:12 PM - Signed the courier out and stopped at her desk on the way up.\n3:58 PM - Back on the terrace as the news broke.',
    code: 'SADDLE',
  }),
  suspect({
    id: 'char_aksharaa',
    name: 'Aksharaa',
    profession: 'Operations Executive',
    group: 'OPS',
    bio: 'Runs the facilities inbox, the catering calendar and the gate paperwork. Read the 8:12 AM coffee-machine ticket before anyone else.',
    quirk: 'Files everything in triplicate and can still find none of it when the WiFi is down.',
    secret: 'I noticed the urgent coffee ticket was odd — four ignored tickets, then "before the party"? — and I processed it anyway because questioning Giles\'s tickets is not worth the argument.',
    neverDo: 'Let a vendor in without a gate entry.',
    motive: 'Aksharaa processed the paperwork lane the ghost vendor lived in — gate passes for deliveries that never came, catering reconciliations that never balanced. Dev\'s checklist would surface every entry she rubber-stamped, and "I didn\'t look closely" is a sentence with a career cost.',
    timeline: '8:20 AM - In early for party logistics; the urgent coffee-machine ticket was already at the top of the facilities inbox when she sat down.\n12:45 PM - Received the Caterspoint sadhya with Nikitha.\n1:00 PM - Terrace, running the food line.\n2:50 PM - Down at the gate signing in a catering top-up.\n3:05 PM - Back up with the delivery.\n3:58 PM - On the terrace when the shouting started.',
    code: 'UMBER',
  }),
  suspect({
    id: 'char_rishabh',
    name: 'Rishabh',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Payments-adjacent backend engineer. Sits nearest the coffee nook, which he considers a design flaw in his life.',
    quirk: 'Complains about the machine daily and defends it violently when outsiders do.',
    secret: 'At 2:52 I heard the machine hiss and thought "the Beast lives" — and did not look up. If I had turned my head I might have watched the murder being armed.',
    neverDo: 'Merge my own PR.',
    motive: 'Rishabh built the internal reconciliation dashboard whose numbers never matched the provider\'s — the mismatch Dev\'s report explains. For months everyone assumed the dashboard was buggy. If Friday\'s briefing proved the data was right and the money was leaving, Rishabh\'s "bug" becomes the thing that hid a theft.',
    timeline: '8:47 AM - In before nine, desk by the coffee nook.\n1:00 PM - Terrace, engineering table.\n2:47 PM - Back to his desk for the alert hotfix.\n2:52 PM - Heard the machine hiss; assumed the repair was being celebrated.\n3:56 PM - At the Glass Room seconds after the shout.',
    code: 'WALNUT',
  }),
  suspect({
    id: 'char_akshay',
    name: 'Akshay',
    profession: 'Operations Executive',
    group: 'OPS',
    bio: 'Ops generalist who ended up owning incident logistics: when something breaks, he is the person who makes sure the right people are in the right room.',
    quirk: 'Keeps a laminated "who to call" sheet that has survived three reorgs.',
    secret: 'In the War Room I checked the provider\'s public status page. It was green the whole time. I said nothing because Anurag was running the bridge and you do not contradict the Head of Payments mid-incident.',
    neverDo: 'Escalate without a screenshot.',
    motive: 'Akshay filed the May "scammer vendor" report that officially buried Zenlyt — written from what Giles told him, signed with his own name. Dev\'s draft calls that report "the burial certificate." If the vendor was internal all along, the report makes Akshay either an accomplice or the office\'s most useful fool, and he knew which one Friday would say.',
    timeline: '8:50 AM - Arrived, party-day logistics.\n1:00 PM - Terrace, ops table.\n2:49 PM - In the War Room for the alert.\n3:05 PM - Noticed the provider status page was green; kept it to himself.\n3:57 PM - Sent to find the first-aid kit when the shout came.',
    code: 'XENON',
  }),
  suspect({
    id: 'char_kashish',
    name: 'Kashish',
    profession: 'Talent Acquisition',
    group: 'HR',
    bio: 'Hires half the company and remembers everyone\'s notice period, which is either sweet or terrifying depending on the week.',
    quirk: 'Rates candidates and restaurants on the same five-point rubric.',
    secret: 'Dev asked HR for the full contractor list on Monday. I stalled him — twice — because two "contractors" on it have never once appeared in my hiring records, and I wanted to know why before anyone else did.',
    neverDo: 'Ghost a candidate.',
    motive: 'The contractor list Dev requested contains names Kashish cannot account for — ghost workers invoiced through Zenlyt whom HR never hired. Her stalling reads as obstruction, and her window gap (pulling game prizes from the same first-floor store the gardening kit lives in) reads worse.',
    timeline: '9:10 AM - Arrived, two interviews before noon.\n1:00 PM - Terrace, ran the Onam games registry.\n2:55 PM - Down to the first-floor store for the game prizes.\n3:08 PM - Back up with an armful of vouchers.\n3:58 PM - On the terrace when it went quiet.',
    code: 'YONDER',
  }),
  suspect({
    id: 'char_ishan',
    name: 'Ishan',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'On-call engineer for the week, which on party day is a punishment with a pager.',
    quirk: 'Estimates everything in "deploys" — the party is two deploys long.',
    secret: 'From my desk I could see Sukhans pacing his cabin on that call from three until it ended — the only stretch of the afternoon he was not on the terrace in front of forty people. I can clear the co-founder with one sentence, and I have been enjoying not saying it.',
    neverDo: 'Ack an alert I do not intend to look at.',
    motive: 'Ishan wrote the webhook-replay tool the team uses to test the payment sandbox — the same class of replay that produced the 2:47 alert. The tool lives in a repo half the company can read, but he wrote it, he was on-call, and he was at a keyboard on the third floor for the entire window.',
    timeline: '8:55 AM - Arrived, on-call handover.\n1:00 PM - Terrace, one eye on the pager.\n2:47 PM - Back at his third-floor desk working the alert.\n3:00 PM - Could see Sukhans pacing on his call through the cabin glass, and still pacing at 3:20.\n3:56 PM - Reached the Glass Room with Rishabh.',
    code: 'ZIPPER',
  }),
  suspect({
    id: 'char_sanad',
    name: 'Sanad',
    profession: 'Creative Strategist',
    group: 'MARKETING',
    bio: 'Writes the hooks that make strangers stop scrolling. Thinks in fifteen-second arcs and speaks in them too.',
    quirk: 'Tests ad copy on the office by saying it deadpan and counting who looks up.',
    secret: 'I pitch our rejected concepts to my freelance clients with the serial numbers filed off. Everyone does it. Dev\'s contractor review was the first thing that ever made it feel dangerous.',
    neverDo: 'Use the word "viral" as a strategy.',
    motive: 'Zenlyt\'s ghost invoices are dressed as "concept development" — Sanad\'s exact line of work. Three of the fabricated deliverables reuse language from his real decks, which means either someone borrowed his voice to fake the paperwork, or he wrote them. He knows which. The room does not.',
    timeline: '9:25 AM - Arrived, concept review.\n1:00 PM - Terrace, sadhya, two helpings.\n2:45 PM - Smoking corner behind the hedge.\n3:20 PM - Still there — no camera, no photo, two smokers as witnesses.\n3:57 PM - Came out to a terrace that had stopped moving.',
    code: 'ANVIL',
  }),
  suspect({
    id: 'char_pragati',
    name: 'Pragati',
    profession: 'Creative Strategist',
    group: 'MARKETING',
    bio: 'Half of every brainstorm and the author of the Onam quiz, which she took more seriously than most product launches.',
    quirk: 'Keeps a swipe file of competitor ads annotated like crime-scene photos.',
    secret: 'I saw the Zenlyt folder open on Akshat\'s screen on Wednesday night — we were the last two in the office. He closed it too fast. I told myself it was budget season.',
    neverDo: 'Present someone else\'s concept without their name on the slide.',
    motive: 'Pragati\'s window gap is a printer run for quiz sheets — but she was in the office late Wednesday night, the night the vendor pack was fabricated and the hedge was cut. She cannot prove what she was doing after 11 PM, and "I was polishing a quiz" is the least believable true sentence in the building.',
    timeline: '9:18 AM - Arrived, finalized the Onam quiz.\n1:00 PM - Terrace, ran the quiz at 2:15.\n2:48 PM - Down to the second-floor printer for the tiebreaker sheets.\n2:58 PM - Back on the terrace with the printouts.\n3:58 PM - Mid-conversation when the news arrived.',
    code: 'BOBBIN',
  }),
  suspect({
    id: 'char_raaghav',
    name: 'Raaghav',
    profession: 'Creative Strategist',
    group: 'MARKETING',
    bio: 'The strategist who volunteers for everything physical: props, banners, the mascot cutout that lives on the third floor for reasons nobody remembers.',
    quirk: 'Measures success in "did people take photos with it."',
    secret: 'When I fetched the mascot at 2:53 I heard the coffee machine finish a pull as the lift doors opened — and saw nobody near it. It has been bothering me all evening and I cannot explain why.',
    neverDo: 'Ship a campaign without a physical component.',
    motive: 'Raaghav booked prop and set spends for shoots through ops — the exact budget line Zenlyt invoiced against. His signatures appear on three requisitions that Zenlyt later "fulfilled." He has no idea how his paperwork became a ghost vendor\'s supporting documents, which is precisely what a guilty man would say.',
    timeline: '9:22 AM - Arrived, banner duty.\n1:00 PM - Terrace, sadhya with the marketing table.\n2:53 PM - To the third floor for the mascot cutout; crossed Prerna near the design corner.\n3:02 PM - Back up the main stairs, mascot under one arm.\n3:58 PM - Posing the mascot when the terrace went silent.',
    code: 'CRAYON',
  }),
  suspect({
    id: 'char_bhuvan',
    name: 'Bhuvan',
    profession: 'Product Support Specialist',
    group: 'SUPPORT',
    bio: 'First responder for every angry customer email. Has a macro for everything except party days.',
    quirk: 'Types apologies faster than most people read them.',
    secret: 'I saw the phone booth light on from 2:50 and Victor\'s silhouette inside. I also saw him cover the glass with his palm when I walked past. Twice.',
    neverDo: 'Close a ticket with "working as intended."',
    motive: 'Every payment-provider failure generated a wave of tickets Bhuvan resolved with refunds and comps — the untraceable-spend lane Dev flagged. Bhuvan processed more make-goods than anyone in the company. He was following policy; the ledger just makes policy look like a pipeline.',
    timeline: '9:00 AM - Arrived, queue triage.\n1:00 PM - Terrace, support table.\n2:49 PM - Down to his desk as the ticket wave from the alert began.\n3:10 PM - In and out of the War Room with queue updates.\n3:59 PM - Drafting a status update nobody would ever send.',
    code: 'DYNAMO',
  }),
  suspect({
    id: 'char_aarush',
    name: 'Aarush',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'The newest editor, still at the stage of saying yes to everything, including rendering the Onam reel during the Onam party.',
    quirk: 'Has never once eaten lunch before 3 PM.',
    secret: 'The render finished at 2:20. Vipin said "let it cook" and we sat in the bay doing nothing. I do not know what we were waiting for, and I did not ask.',
    neverDo: 'Deliver a cut without color.',
    motive: 'Aarush\'s edit-bay hours are billed against project codes, and two of his timesheet weeks were retro-labelled to a Zenlyt project he never heard of. Someone laundered real hours into a fake vendor\'s deliverables — and the timesheet system says Aarush signed the relabel.',
    timeline: '9:30 AM - Arrived, straight to the bay.\n1:00 PM - Terrace, one plate, carried it back down.\n2:30 PM - Second-floor edit bay with Vipin, "rendering."\n2:58 PM - Prerna came in for a source file; neither of them offered to help her find it.\n3:58 PM - Followed Vipin up the stairwell into the silence.',
    code: 'FALCON',
  }),
  suspect({
    id: 'char_tauseef',
    name: 'Tauseef',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Infra engineer who works next to Yao and inherits every network mystery Yao is too busy for.',
    quirk: 'Takes smoke breaks at exact ninety-minute intervals, like a cron job.',
    secret: 'The 11 AM outage made no sense to me — routers do not take the NVR down with them on this network, I helped segment it. I said so to Yao. He said "known issue." It is not a known issue.',
    neverDo: 'Restart anything without reading the logs first.',
    motive: 'Tauseef has network-cupboard access and the skills to do everything the blind spot required. His alibi is a hedge: he was in the smoking corner for the entire window, invisible to cameras and photos alike. The two people who can vouch for him are also on the suspect list, which is how the police like their corroboration least.',
    timeline: '8:43 AM - In before nine, infra standup.\n11:10 AM - Offered to help with the outage; told it was handled.\n1:00 PM - Terrace, engineering table.\n2:45 PM - Smoking corner behind the hedge with Sharad and Sanad.\n3:57 PM - Stubbed out and walked into the aftermath.',
    code: 'GARLAND',
  }),
  suspect({
    id: 'char_sonia',
    name: 'Sonia',
    profession: 'Customer Support and Operations Executive',
    group: 'SUPPORT',
    bio: 'Splits her day between the support queue and ops paperwork, which means she has seen every kind of mess this company makes.',
    quirk: 'Alphabetizes the stationery cupboard when stressed. It has been alphabetized a lot lately.',
    secret: 'Nehal\'s "client escalation" — I checked. There is no ticket. I told him I checked. He said it was on WhatsApp and asked me to keep it between us.',
    neverDo: 'Promise a refund I cannot process.',
    motive: 'Sonia countersigned support-side refunds during provider incidents — the same make-good lane Dev flagged through Luke. She also covered Kalaivani\'s queue on Wednesday and Thursday evenings, the two evenings the concentrate was brewed, which makes her either an unwitting enabler of an alibi or a knowing one.',
    timeline: '8:57 AM - Arrived, queue handover.\n1:00 PM - Terrace, support table.\n2:50 PM - Down to her desk for the alert ticket wave.\n3:25 PM - Refreshing a queue that had gone suspiciously quiet.\n3:58 PM - Heard it from Bhuvan first.',
    code: 'HAMMOCK',
  }),
  suspect({
    id: 'char_ishika',
    name: 'Ishika',
    profession: 'Email Marketing Specialist',
    group: 'MARKETING',
    bio: 'Owns the email calendar and the sacred 3 PM send window, which she defends against parties, outages and common sense.',
    quirk: 'Subject-lines her own texts.',
    secret: 'From my desk I watched Akshat not react to the 2:47 alert. Everyone else flinched. He kept scrolling the vendor drive like he already knew the alert was nothing.',
    neverDo: 'Send to the full list without a seed test.',
    motive: 'Ishika\'s window gap is the 3 PM campaign send — legitimate, logged, boring. Her problem is proximity: her desk faces Akshat\'s, her sends ride the spend data Dev was reconstructing, and her name is on the May "vendor scam" customer-comms email that told the outside world Zenlyt was an external fraud. She wrote fiction that day without knowing it.',
    timeline: '9:05 AM - Arrived, QA on the 3 PM send.\n1:00 PM - Terrace, marketing table, left at 2:40.\n2:45 PM - At her second-floor desk for the send window.\n3:00 PM - Send out; stayed to watch the open rates.\n3:58 PM - Still at her desk when the floor emptied upward.',
    code: 'IGLOO',
  }),
  suspect({
    id: 'char_thejas',
    name: 'Thejas',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'The engineer who skipped the Onam party for a deadline, which the whole floor found completely in character.',
    quirk: 'Wears the same hoodie until the feature ships.',
    secret: 'At 3:15 I heard the grinder run and smelled fresh coffee and thought "good for Dev." I was forty feet from the Glass Room for the whole thing. I never looked up once.',
    neverDo: 'Attend a party with a red build.',
    motive: 'Thejas was on the third floor, alone at his desk, for the entire window — the only person in the building with continuous solo access to the coffee nook and no photo, camera or colleague to account for a single minute of it. His deadline is real. The police have only his word for what it required.',
    timeline: '8:35 AM - In early, deadline mode.\n1:00 PM - Skipped the party; someone left a plate on his desk.\n2:45 PM - Third-floor desk, headphones, terminal.\n3:15 PM - Heard the grinder run and did not look up.\n3:55 PM - First to reach Aarohi when she shouted.',
    code: 'JAVELIN',
  }),
  suspect({
    id: 'char_navya',
    name: 'Navya',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'First-floor edit bay. Handles client work, which means her deadlines belong to other people\'s calendars.',
    quirk: 'Labels her timeline markers with emoji only she can read.',
    secret: 'The client cut I "had" to export during the party was actually done Thursday. I re-exported it so I had an excuse to skip the games. I hate the games.',
    neverDo: 'Let a client see version one.',
    motive: 'Navya\'s exports ride the same project codes the ghost vendor billed against, and one of her old drafts appears — watermark cropped — inside a Zenlyt "deliverable." Someone in the building used her actual work to give the fake vendor a real portfolio. On paper, the simplest explanation is that she supplied it.',
    timeline: '9:35 AM - Arrived, first-floor bay.\n1:00 PM - Terrace briefly for the sadhya.\n2:40 PM - Back in the first-floor bay exporting a client cut.\n2:59 PM - Through the bay door, had watched Kashish and then Kalaivani go into the store, minutes apart.\n3:30 PM - Export done; stayed for the quiet.\n4:15 PM - Came up when the sirens got loud.',
    code: 'KIOSK',
  }),
  suspect({
    id: 'char_amisha',
    name: 'Amisha',
    profession: 'Founders Office',
    group: 'FOUNDERS OFFICE',
    bio: 'Runs the founders\' office: the float, the gifts, the confidential printing, the small logistics of large decisions.',
    quirk: 'Guards the good samosas for important meetings with visible menace.',
    secret: 'I ordered the good samosas for the 4 PM meeting on Dev\'s instruction — for nine people. I counted the invite list. Whatever that meeting was, it was not a toast.',
    neverDo: 'Let the float go unreconciled past Friday.',
    motive: 'Dev\'s expense review flagged the founders\'-office float — the petty-cash lane Amisha administers with Aarohi. The entries are sloppy, not criminal, but sloppy was about to be read aloud in front of the founders, and Amisha\'s window gap is a trip to the second-floor safe that nobody watched her make.',
    timeline: '8:48 AM - Arrived, party-day errands.\n1:00 PM - Terrace, orbiting the founders.\n3:00 PM - Down to the second-floor safe for the founders\' Onam gift.\n3:13 PM - Back up with the gift box; crossed Aditi at the second-floor landing.\n3:58 PM - Beside Elias when the shout came.',
    code: 'LEMUR',
  }),
  suspect({
    id: 'char_utkarsh',
    name: 'Utkarsh',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Mid-level engineer with a desk facing the lift lobby, which makes him the floor\'s unofficial doorbell.',
    quirk: 'Counts lift arrivals when he is stuck on a bug. Says the rhythm helps.',
    secret: 'At 2:52 I half-saw someone at the coffee nook holding a steel tumbler and thought "party cleanup." I could not swear to the face. I have been trying to redraw it all evening.',
    neverDo: 'Blame the intern in a postmortem.',
    motive: 'Utkarsh reviewed and approved the pull request that quietly widened retry windows on settlement reconciliation — a change that made the reserve skim harder to notice. The PR came from a throwaway branch nobody can attribute. His approval is the only human name on it.',
    timeline: '8:53 AM - Arrived, desk facing the lifts.\n1:00 PM - Terrace, engineering table.\n2:47 PM - Back at his desk for the hotfix.\n2:52 PM - Glanced up at movement near the coffee nook; went back to the diff.\n3:56 PM - Followed the shout to the Glass Room.',
    code: 'MAGNET',
  }),
  suspect({
    id: 'char_priyanshu',
    name: 'Priyanshu',
    profession: 'Founding Software Engineer',
    group: 'ENGINEERING',
    bio: 'Employee number two. Built the first version of everything, including systems only he remembers the passwords to — a fact that stopped being charming this week.',
    quirk: 'Refers to the current codebase as "the rewrite" seven years later.',
    secret: 'The old superadmin account from the early days still works. I know because I checked on Wednesday — after the outage felt wrong to me too. I should have reported it. I checked quietly instead.',
    neverDo: 'Delete the founder-era backups.',
    motive: 'Every piece of the blind spot — NVR, badge system, Workspace — runs on infrastructure Priyanshu originally set up, under admin lineages that trace back to accounts he created. The admin session that did Friday\'s damage authenticated against one of those lineages. He built the skeleton key. Someone turned it.',
    timeline: '8:38 AM - In before nine, as always.\n11:15 AM - Offered Yao the old admin password during the outage; was told it was handled.\n1:00 PM - Terrace, engineering table.\n2:47 PM - Third-floor desk for the hotfix.\n3:56 PM - Stood at the Glass Room door and would not go in.',
    code: 'NEBULA',
  }),
  // ── WITNESSES (35) — continuously on the terrace through the window ──────
  witness({
    id: 'char_elias',
    name: 'Elias',
    profession: 'CMO · Co-founder',
    group: 'FOUNDERS',
    bio: 'Co-founded the company and ran the Onam party the way he runs the brand: loudly, warmly, and from behind a microphone he never once put down.',
    quirk: 'Turns every announcement into a three-act story with a sponsor slot.',
    secret: 'I know what Dev was really hired to do. "Payments-migration consultant" was my cover story — and at 3:12 I was the last person he ever spoke to. He said, "save me some payasam."',
    neverDo: 'Hand the mic to someone mid-story.',
    motive: 'Elias co-signed hiring Dev and wanted the report published before diligence — he is the one person the findings could only help. He never left the mic, and Aman\'s livestream has him in frame for the entire window.',
    timeline: '9:00 AM - Arrived, walked the terrace setup.\n1:00 PM - Opened the sadhya, gave the toast with Sukhans.\n2:00 PM - Hosted the games on mic with Aman, continuously on camera.\n3:12 PM - Dev told him "save me some payasam" and took the stairs down.\n3:56 PM - Held the terrace calm while Kursheeth ran down.',
    code: 'OBOE',
  }),
  witness({
    id: 'char_caleb',
    name: 'Caleb',
    profession: 'VP of Organic Growth',
    group: 'MARKETING',
    bio: 'Runs the long game: SEO, content, the channels that compound while paid burns. Talks in quarters, not days.',
    quirk: 'Cites his own newsletters in meetings, with issue numbers.',
    secret: 'On Wednesday Akshat asked me, very casually, whether template files keep edit history. I answered honestly. I have replayed that conversation nine times today.',
    neverDo: 'Chase a trend older than a week.',
    motive: 'Dev\'s report largely vindicated organic — the leak lived in paid and ops lanes. Caleb had nothing to fear from Friday and a livestreamed alibi for the window.',
    timeline: '9:14 AM - Arrived, content review.\n1:00 PM - Terrace, marketing table.\n2:15 PM - Team captain for the Onam quiz, on camera throughout.\n3:58 PM - Still holding the quiz scoresheet when the news came.',
    code: 'PLAZA',
  }),
  witness({
    id: 'char_shobhit',
    name: 'Shobhit',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Second-floor editor who treats every office event as b-roll. His camera roll is accidentally the office archive.',
    quirk: 'Films everything in slow motion first and asks questions later.',
    secret: 'My slo-mo of the games catches the War Room window in the background. You can see who is in it, and when. The police have not asked me yet.',
    neverDo: 'Delete footage before a project closes.',
    motive: 'Shobhit spent the window filming the games in slow motion — footage that corroborates half the terrace. He appears in Aman\'s livestream as often as he films it.',
    timeline: '9:26 AM - Arrived, edit bay, then up early to film the setup.\n1:00 PM - Terrace, filming the sadhya line.\n2:30 PM - Filmed the games in slo-mo next to Aman\'s livestream perch.\n3:58 PM - Lowered the camera for the first time all day.',
    code: 'RUNE',
  }),
  witness({
    id: 'char_kshitij',
    name: 'Kshitij',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Frontend engineer with a habit of being nearby when interesting sentences happen.',
    quirk: 'Refactors other people\'s code in his head while they are still typing it.',
    secret: 'On Wednesday I heard Nehal tell Dev, on the terrace stairs, "publish that split and my team\'s numbers die with it." I was six steps below them, invisible, eating a sandwich.',
    neverDo: 'Push straight to main.',
    motive: 'Kshitij\'s name appears nowhere in Dev\'s draft, his lane is frontend, and he spent the window losing at tug-of-war on camera.',
    timeline: '8:59 AM - Arrived, standup.\n1:00 PM - Terrace, engineering table.\n2:50 PM - Anchored the losing tug-of-war team, on the livestream.\n3:58 PM - Still arguing the rope was frayed when the terrace went quiet.',
    code: 'SEQUIN',
  }),
  witness({
    id: 'char_navalika',
    name: 'Navalika',
    profession: 'CRO Engineer',
    group: 'ENGINEERING',
    bio: 'Runs the experiment platform. Lives downstream of every dashboard in the building, which means she notices when they lie.',
    quirk: 'A/B tests her own commute and publishes the results to nobody.',
    secret: 'When the badge system desynced at 11 AM, my access-data pipeline threw errors — so I know exactly when the badge log stopped being trustworthy, to the minute. Nobody has asked me.',
    neverDo: 'Call a result at 80% confidence.',
    motive: 'Navalika\'s experiment dashboards died in the 11 AM outage and she complained about it in the open channel — timestamped, grumpy, and completely alibi-shaped. She was on the livestream judging the pookalam during the window.',
    timeline: '9:07 AM - Arrived, experiment review.\n11:06 AM - Posted "who killed my dashboards" in the general channel.\n1:00 PM - Terrace; judged the pookalam at 1:30.\n2:45 PM - On camera scoring the games.\n3:58 PM - Mid-scoring when the shout came up the stairs.',
    code: 'TOGGLE',
  }),
  witness({
    id: 'char_pranav_d',
    name: 'Pranav D.',
    profession: 'Product Manager',
    group: 'PRODUCT',
    bio: 'PM for checkout and the calmest person in any sprint review, mostly because he has already written the retro.',
    quirk: 'Roadmaps his weekends. Ships about half of them.',
    secret: 'On Monday Dev asked me one question in the lift: "who owns the migration timeline — the PM or the payments head?" I said "both, in theory." He wrote it down. In theory. He wrote that down too.',
    neverDo: 'Commit to a date in someone else\'s meeting.',
    motive: 'Dev\'s draft treats product as a bystander — the checkout numbers were clean; the leak was downstream of them. Pranav D. was on the terrace, on camera, for the whole window, and was one of the two who ran down at 3:55.',
    timeline: '9:03 AM - Arrived, sprint review.\n1:00 PM - Terrace, product table.\n2:45 PM - On the livestream refereeing the quiz tiebreak.\n3:55 PM - Ran down with Yash T. when Aarohi shouted.',
    code: 'VECTOR',
  }),
  witness({
    id: 'char_aman',
    name: 'Aman',
    profession: 'Community Manager',
    group: 'MARKETING',
    bio: 'Runs the community and, on party days, the content. Livestreamed the Onam games from 2:30 to 3:50 without dropping the phone once.',
    quirk: 'Says "let\'s take this to the community" about lunch orders.',
    secret: 'My livestream is the alibi machine everyone keeps citing — and I know its one gap: I flipped to the front camera for ninety seconds at 3:05 to do a bit. Whatever the back camera missed in those seconds is missed forever.',
    neverDo: 'Post without alt text.',
    motive: 'Aman co-hosted the games on mic beside Elias and livestreamed the entire window — he is the single most-photographed person at the party and its primary alibi source.',
    timeline: '9:21 AM - Arrived, community standup.\n1:00 PM - Terrace, emceeing the sadhya line with Elias.\n2:30 PM - Started the livestream and kept it rolling until 3:50.\n3:58 PM - Ended the stream mid-sentence.',
    code: 'WICKET',
  }),
  witness({
    id: 'char_simran',
    name: 'Simran',
    profession: 'Talent Acquisition',
    group: 'HR',
    bio: 'Hiring lead with a calendar full of interviews and a memory full of everyone\'s first-day stories.',
    quirk: 'Asks "where do you see yourself in five years" at birthday parties.',
    secret: 'When Dev asked HR for the contractor list on Monday, I sent him my half the same afternoon. Kashish asked me to wait. I had already pressed send.',
    neverDo: 'Reject someone without feedback.',
    motive: 'Simran answered Dev\'s HR request promptly and honestly — her half of the contractor list is in his files, clean. She spent the window running the kids-table-energy Onam games and comforted Aarohi afterwards.',
    timeline: '9:09 AM - Arrived, two interviews before lunch.\n1:00 PM - Terrace, HR table.\n2:45 PM - Ran the lemon-and-spoon race, extensively photographed.\n3:58 PM - Sat with Aarohi on the terrace stairs and did not leave her.',
    code: 'YURT',
  }),
  witness({
    id: 'char_karthik',
    name: 'Karthik',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Second-floor editor, longest-suffering user of the render farm, unofficial historian of office arguments.',
    quirk: 'Can lip-read across an open-plan floor and considers it a professional skill.',
    secret: 'Back in May I heard Akshat and Victor argue about Zenlyt — Akshat said "let it die, it\'s a scam vendor, stop pulling the thread." At the time I thought he was protecting Victor. Now I am not sure who was protecting whom.',
    neverDo: 'Render over someone else\'s job in the queue.',
    motive: 'Karthik\'s work never touched the flagged lanes, and he spent the window on the livestream losing the quiz on a technicality he is still contesting.',
    timeline: '9:24 AM - Arrived, edit bay.\n1:00 PM - Terrace, video table.\n2:15 PM - Onam quiz, on camera, lost the tiebreak.\n3:58 PM - Mid-appeal when the terrace went silent.',
    code: 'ZEBRA',
  }),
  witness({
    id: 'char_shrey',
    name: 'Shrey',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Platform engineer who volunteers for everything infrastructure-shaped, which is how he ended up at the network cupboard door at 11:05.',
    quirk: 'Keeps a personal uptime dashboard for the office WiFi. It is not flattering.',
    secret: 'I offered to help with the outage and Yao waved me off through a six-inch gap in the cupboard door. In four years he has never once refused help. I noticed. I said nothing.',
    neverDo: 'Leave a runbook unwritten.',
    motive: 'Shrey\'s offer to help at the cupboard was refused, timestamped in his own chat message — "lmk if you need hands @yao, standing right here." He was on the terrace, on camera, for the window.',
    timeline: '8:56 AM - Arrived, platform standup.\n11:05 AM - Stood at the network cupboard and was waved off.\n1:00 PM - Terrace, engineering table.\n2:50 PM - Tug-of-war, winning side, on the livestream.\n3:58 PM - Still holding the rope when the news came.',
    code: 'ABACUS',
  }),
  witness({
    id: 'char_dilip',
    name: 'Dilip',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'First-floor editor, master of client revisions, connoisseur of the phrase "small change."',
    quirk: 'Estimates every task as "two hours" and has never once been right in either direction.',
    secret: 'On Tuesday Dev came down to the first floor and asked me, very casually, how the edit team logs outsourced work. I walked him through the tracker. He said "interesting" twice. I have been hearing that "interesting" all day.',
    neverDo: 'Accept feedback as a voice note.',
    motive: 'Dilip\'s Tuesday walkthrough of the outsource tracker is quietly load-bearing — it is how Dev cross-checked which billed deliveries never existed. His own Friday is fully photographed: up for the sadhya at 1:00 and on the terrace through the window, at three different game stations.',
    timeline: '9:31 AM - Arrived, first-floor bay.\n1:00 PM - Terrace for the sadhya and stayed.\n2:45 PM - Photographed at the quiz, the pookalam and the snacks table in one arc.\n4:10 PM - Heard the first siren from the terrace rail.',
    code: 'BANJO',
  }),
  witness({
    id: 'char_abhinav',
    name: 'Abhinav',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer whose desk faces the Glass Room, giving him an accidental front-row seat to three weeks of Dev.',
    quirk: 'Rates meeting rooms by chair quality in a pinned spreadsheet.',
    secret: 'On Monday I watched Dev tape paper over the inside of the Glass Room\'s side window. Whatever he was working on, he stopped trusting the floor with it that day.',
    neverDo: 'Take the last chair from a meeting room.',
    motive: 'Abhinav\'s lane never appears in the draft and his window is fully photographed — he anchored the winning tug-of-war team next to Shrey.',
    timeline: '9:01 AM - Arrived, standup.\n1:00 PM - Terrace, engineering table.\n2:50 PM - Tug-of-war, winning side, on the livestream.\n3:58 PM - Watched Kursheeth take the stairs three at a time.',
    code: 'CANOE',
  }),
  witness({
    id: 'char_daiwik',
    name: 'Daiwik',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Second-floor editor who cut the May all-hands recap — the video where the company was told the vendor was a scammer and everyone moved on.',
    quirk: 'Quotes timecodes from memory: "you said that at 14:32 in the March town hall."',
    secret: 'The May recap went through three script revisions. The first draft said "we are investigating a vendor discrepancy." The final cut said "we got scammed." I still have all three drafts.',
    neverDo: 'Cut a speaker to make them look worse.',
    motive: 'Daiwik\'s archive of drafts documents how the Zenlyt story was rewritten in real time — evidence, not exposure. He was on the terrace, on the livestream, through the window.',
    timeline: '9:28 AM - Arrived, edit bay.\n1:00 PM - Terrace, video table.\n2:30 PM - On camera at the games, heckling the quiz.\n3:58 PM - Went quiet with everyone else.',
    code: 'DOMINO',
  }),
  witness({
    id: 'char_binil',
    name: 'Binil',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'First-floor editor with a desk by the window that overlooks the gate — the best seat in the building for watching who comes and goes.',
    quirk: 'Narrates gate activity like a cricket commentator during renders.',
    secret: 'The terrace rail looks straight down the gate lane. At 3:20 I watched Luke sign for a courier down there — the run everyone says never happened. When people started quoting the register, I knew a page had turned somewhere.',
    neverDo: 'Export in the wrong aspect ratio twice.',
    motive: 'Binil corroborates the gate twice over: from his desk window in the morning, and from the terrace rail during the party — Luke\'s two runs, Aditi\'s courier, Aksharaa\'s catering top-up. He was photographed at the pookalam through the window.',
    timeline: '9:33 AM - Arrived, first-floor bay by the gate window.\n1:00 PM - Terrace for the sadhya and stayed for the games.\n2:45 PM - Photographed beside the pookalam.\n4:18 PM - Counted two police jeeps from the rail before anyone upstairs heard them arrive.',
    code: 'EASEL',
  }),
  witness({
    id: 'char_raksha',
    name: 'Raksha',
    profession: 'Creative Strategist',
    group: 'MARKETING',
    bio: 'Strategist with a reputation for asking the question everyone was avoiding, usually in the last five minutes of the meeting.',
    quirk: 'Storyboards her arguments before having them.',
    secret: 'At 2:47 I was mid-quiz-answer and watched Adithya start moving before the alert finished buzzing. Either he has superhuman reflexes or he was already waiting to leave.',
    neverDo: 'Pitch a concept I would not defend twice.',
    motive: 'Raksha\'s lane is strategy decks, not budgets — nothing in the draft touches her. She captained a quiz team on camera through the window.',
    timeline: '9:16 AM - Arrived, concept review.\n1:00 PM - Terrace, marketing table.\n2:15 PM - Quiz team captain, on the livestream.\n3:58 PM - Still holding the buzzer when the terrace froze.',
    code: 'FJORD',
  }),
  witness({
    id: 'char_yash_t',
    name: 'Yash T.',
    profession: 'Game Developer',
    group: 'ENGINEERING',
    bio: 'Builds the gamified funnels and, on party days, the AV. Set up the terrace screen at 8:30 with Aarohi and kept the HDMI in his backpack all day.',
    quirk: 'Playtests office games with the seriousness of a console launch.',
    secret: 'The spare HDMI everyone keeps talking about was in my backpack on the terrace since 8:30. When Giles said he went down to fetch it, I checked my bag. It was still there. It was always there.',
    neverDo: 'Ship a game without a tutorial.',
    motive: 'Yash T. ran the AV and the games tech from the terrace, on camera, all afternoon — and his backpack quietly holds the fact that undoes Giles\'s cover story.',
    timeline: '8:26 AM - In early with Aarohi to set up the terrace screen; HDMI in his backpack.\n1:00 PM - Terrace, running game tech.\n2:45 PM - On the livestream operating the quiz screen.\n3:55 PM - Ran down with Pranav D. when the shout came.',
    code: 'GECKO',
  }),
  witness({
    id: 'char_shivam',
    name: 'Shivam',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer and the floor\'s foremost coffee-machine theologian. Has opinions about the Beast the way other people have religions.',
    quirk: 'Maintains a "days since the machine worked" counter on the whiteboard. Reset it, gleefully, at 9:41 AM.',
    secret: 'I watched Giles walk the technician up at 9:41 and thought: two of my tickets and two of Dev\'s died in that inbox, and the party gets same-day service? I said it as a joke. It has stopped being funny.',
    neverDo: 'Drink the machine\'s first pull after a repair.',
    motive: 'Shivam\'s whiteboard counter and the two dead tickets he filed himself document the machine\'s two-week death better than the service log does. He was photographed on the terrace throughout the window.',
    timeline: '8:51 AM - Arrived, reset nothing yet.\n9:41 AM - Watched the technician work and reset the whiteboard counter to zero.\n1:00 PM - Terrace, engineering table.\n2:50 PM - On the livestream at the games.\n3:58 PM - The counter outlived Dev. He has not touched it since.',
    code: 'HAZEL',
  }),
  witness({
    id: 'char_bharatpreet',
    name: 'Bharatpreet',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Second-floor editor and the office\'s most reliable attendance tracker, purely through memes.',
    quirk: 'Sends memes as a wellness check and interprets silence as data.',
    secret: 'I texted Vipin and Aarush memes all through the party. Neither replied for ninety minutes. Editors always reply. I know exactly which ninety minutes.',
    neverDo: 'Leave a group chat on read.',
    motive: 'Bharatpreet spent the window on the terrace, on camera, running the meme commentary for the games — and accidentally timestamping who was not answering their phones.',
    timeline: '9:29 AM - Arrived, edit bay.\n1:00 PM - Terrace, video table.\n2:40 PM - On the livestream doing colour commentary for the quiz.\n3:58 PM - Put the phone down for the first time all afternoon.',
    code: 'IVORY',
  }),
  witness({
    id: 'char_vidisha',
    name: 'Vidisha',
    profession: 'Product Designer',
    group: 'DESIGN',
    bio: 'Product designer whose desk sits between the printer, the shredder and the coffee nook — the three most interesting appliances in the building this week.',
    quirk: 'Redesigns the office signage in her head every time she walks the floor.',
    secret: 'I saw Aarohi print one page at 12:40 and guard the tray, and I saw her shred one page at 3:45. I do not know if it was the same page — and I have realized nobody else can know either.',
    neverDo: 'Use the wrong shade of the brand red, even at gunpoint.',
    motive: 'Vidisha heard the 9:41 grinder test, celebrated the pookalam win with the design team, and stayed photographed on the terrace through the window. Her testimony brackets Aarohi\'s two paper moments — which cuts both ways, and she knows it.',
    timeline: '9:11 AM - Arrived, design crit prep.\n9:41 AM - Heard the grinder test from her desk and smelled the floor turn into a cafe.\n1:00 PM - Terrace; the design team won the pookalam at 1:30.\n2:45 PM - On the livestream through the games window.\n3:45 PM - Back at her desk; saw Aarohi at the shredder.\n3:58 PM - With Prerna when the terrace went quiet.',
    code: 'JIGSAW',
  }),
  witness({
    id: 'char_himanshu',
    name: 'Himanshu',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer who sits within earshot of Sukhans\'s cabin, which this week became the most educational desk on the floor.',
    quirk: 'Puts everything he overhears into estimates: "that argument was two story points."',
    secret: 'On Wednesday I heard Sukhans tell Elias the audit extension was "a witch hunt that will burn the team before diligence." Elias said, "then we burn." I have not told anyone the second half.',
    neverDo: 'Estimate in hours.',
    motive: 'Himanshu\'s overheard Wednesday argument is the room\'s main evidence against Sukhans — and its resolution, if anyone asks him for the whole quote. He was on the terrace, on camera, for the window.',
    timeline: '8:54 AM - Arrived, standup.\n1:00 PM - Terrace, engineering table.\n2:50 PM - On the livestream at the games.\n3:58 PM - Watched Sukhans go grey at the rail.',
    code: 'KOALA',
  }),
  witness({
    id: 'char_mohit_a',
    name: 'Mohit A.',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer, chronic late-stayer, and therefore the closest thing the office has to a night watchman.',
    quirk: 'His commit timestamps are a public health concern.',
    secret: 'Wednesday night I left at 11:45 PM. Two desk lamps were still on on the second floor — Akshat\'s and Pragati\'s. The vendor pack\'s metadata says 11:58 PM. I can put two people in the building at 11:58 PM.',
    neverDo: 'Leave before the pipeline goes green.',
    motive: 'Mohit A.\'s late-night sighting is the pin that fixes the forgery\'s creation inside the building, with exactly two candidates. His own Friday window is fully photographed on the terrace.',
    timeline: '9:40 AM - Arrived late, as the commit log predicted.\n1:00 PM - Terrace, engineering table.\n2:45 PM - On the livestream, third at the lemon-and-spoon race.\n3:58 PM - Still holding the lemon when the news came.',
    code: 'LLAMA',
  }),
  witness({
    id: 'char_tushar',
    name: 'Tushar',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'First-floor editor whose desk faces the store-room corridor, making him the involuntary registrar of everyone\'s errands.',
    quirk: 'Keeps a mental log of who borrows equipment and never returns it. The log has names.',
    secret: 'Thursday evening, waiting on a render, I saw Kalaivani return the gardening kit to the store — washed, still dripping. She gardens in the mornings. In a year I have never once seen her touch that kit after lunch.',
    neverDo: 'Lend out the good tripod.',
    motive: 'Tushar\'s Thursday-evening sighting quietly timestamps the washed secateurs going back into the store, a day before anyone knew they mattered. His Friday is clean: at his desk until 2:40, then photographed on the terrace from 2:45 onward.',
    timeline: '9:34 AM - Arrived, first-floor bay.\n1:00 PM - Terrace for the sadhya, back down at 1:45 to finish a client note.\n2:40 PM - Back up to the terrace; photographed at the games from 2:45.\n3:58 PM - On the terrace when it went quiet.',
    code: 'MAROON',
  }),
  witness({
    id: 'char_riya',
    name: 'Riya',
    profession: 'Customer Support and Operations',
    group: 'SUPPORT',
    bio: 'Support-and-ops all-rounder who joins Kalaivani\'s morning watering round so often the plants respond to two voices now.',
    quirk: 'Names the terrace plants after closed tickets.',
    secret: 'Friday morning Kalaivani skipped the watering for the first time in a year — "party prep." Except the watering cans were already filled from Thursday. I noticed because I tripped over them.',
    neverDo: 'Escalate a customer who just needs to vent.',
    motive: 'Riya\'s testimony owns the garden lane: the skipped watering, the filled cans, and — from months of shared rounds — the fact that the pruning log exists at all. She was serving at the food line beside the livestream perch through the window.',
    timeline: '8:49 AM - Arrived; noticed the filled watering cans going unused.\n12:45 PM - Helped set the food line.\n1:00 PM - Terrace, serving beside Kalaivani.\n2:58 PM - Took over the payasam ladle when Kalaivani went for chips.\n3:58 PM - Still holding the ladle.',
    code: 'NUGGET',
  }),
  witness({
    id: 'char_jason',
    name: 'Jason',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'First-floor editor who rides to work and parks in the basement, arriving through the one door nobody thinks about.',
    quirk: 'Times his commute to the minute and announces personal records.',
    secret: 'At 8:37 I was locking my bike when one Uber dropped two people: Kalaivani and Giles. They did not talk on the way in. Carpools talk. I remember thinking that.',
    neverDo: 'Take the lift for one floor.',
    motive: 'Jason is the basement\'s only human camera on the morning the NVR footage died — his 8:37 sighting is the shared Uber\'s second witness after the dashboard itself. His window is photographed: he ran the music for the games from the terrace.',
    timeline: '8:37 AM - Locking his bike in the basement; saw two colleagues leave one Uber in silence.\n9:36 AM - First-floor bay.\n1:00 PM - Terrace, ran the playlist for the party.\n2:45 PM - At the speaker table on the livestream through the window.\n3:58 PM - Cut the music himself.',
    code: 'ORBIT',
  }),
  witness({
    id: 'char_nikitha',
    name: 'Nikitha',
    profession: 'Operations and Customer Support Executive',
    group: 'SUPPORT',
    bio: 'Ops-and-support executive who co-received the sadhya and ran the beverage table — chai, juice, and one flask that never opened.',
    quirk: 'Counts cups against headcount and is never off by more than one.',
    secret: 'Kalaivani\'s steel chai flask sat under the beverage table all afternoon, unopened, at a party drowning in chai. I offered to pour it out at 2:30. She said it was "for later." It never got a later.',
    neverDo: 'Run out of chai before the speeches.',
    motive: 'Nikitha received the catering with Aksharaa and ran the beverage table in frame of the livestream through the entire window. Her cup-counting habit is why the flask\'s stillness got noticed at all.',
    timeline: '8:58 AM - Arrived, party-day ops.\n12:45 PM - Received the Caterspoint sadhya with Aksharaa.\n1:00 PM - Ran the beverage table, on camera.\n2:30 PM - Offered to open the flask; was told no.\n3:58 PM - Poured nobody anything for a long time.',
    code: 'PICCOLO',
  }),
  witness({
    id: 'char_pranav_a',
    name: 'Pranav A.',
    profession: 'Video Editor',
    group: 'VIDEO',
    bio: 'Second-floor editor who does the team\'s invoice paperwork because he once admitted to being good at it.',
    quirk: 'Formats invoices more carefully than title cards.',
    secret: 'On Wednesday Akshat asked me for "any old vendor invoice PDF, just as a template." I sent him one from last year. On Thursday I could not find the email in my sent folder.',
    neverDo: 'Invoice without a PO number again. Once was enough.',
    motive: 'Pranav A.\'s Wednesday favour is a live fragment of the forgery\'s supply chain — the template the fake pack was built on came from his mailbox. His Friday window is on the livestream: he anchored the quiz\'s losing side with Karthik.',
    timeline: '9:27 AM - Arrived, edit bay.\n1:00 PM - Terrace, video table.\n2:15 PM - Onam quiz, on camera, lost with dignity.\n3:58 PM - Checked his sent folder again. Still nothing.',
    code: 'QUIVER',
  }),
  witness({
    id: 'char_harsha',
    name: 'Harsha',
    profession: 'Creative Strategist',
    group: 'MARKETING',
    bio: 'Strategist who shoots his concept references himself, which put him at the smoking corner with a camera at exactly the wrong moment for somebody.',
    quirk: 'Location-scouts the office like it is a film set.',
    secret: 'Thursday morning I shot b-roll at the smoking corner and the hedge was freshly cut — clean diagonal clips, the cut faces still bright, cuttings gone. I have the footage. The timestamp is 8:52 AM Thursday.',
    neverDo: 'Use a stock clip when the office is right there.',
    motive: 'Harsha\'s Thursday b-roll is the hedge\'s timestamp — proof the cutting predates the party by two days. He spent Friday\'s window on the livestream running the antakshari segment.',
    timeline: '9:19 AM - Arrived, moodboard review.\n1:00 PM - Terrace, marketing table.\n2:45 PM - Hosted antakshari on the livestream.\n3:58 PM - The song stopped mid-line.',
    code: 'RIVET',
  }),
  witness({
    id: 'char_neha',
    name: 'Neha',
    profession: 'Founding Copywriter',
    group: 'MARKETING',
    bio: 'Employee number six. Wrote every word the company has ever shipped, including the May email that called Zenlyt "an external bad actor."',
    quirk: 'Edits people\'s speech back to them: "what you mean is—"',
    secret: 'I wrote the May scam-vendor email from talking points Giles gave ops. I asked one question — "are we sure it\'s external?" — and the answer came back fast and rehearsed. I kept the talking points.',
    neverDo: 'Publish a first draft, including this sentence.',
    motive: 'Neha watched Anurag pocket his phone as the 2:47 ping sounded — the second witness to the pre-ping typing, from the opposite side of the table. Her May talking-points file documents who authored the "external scammer" story.',
    timeline: '9:13 AM - Arrived, copy review.\n1:00 PM - Terrace, marketing table, opposite Anurag.\n2:46 PM - Saw him typing; heard the ping arrive a beat later.\n2:47 PM - Watched the ops table stand up in unison.\n3:58 PM - Was drafting the Onam thank-you post. Deleted it.',
    code: 'SONNET',
  }),
  witness({
    id: 'char_chirag',
    name: 'Chirag',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer with a desk one pod from the coffee nook and a nose that files complaints about the Beast\'s smell in the team channel.',
    quirk: 'Describes coffee the machine makes as "punishment with crema."',
    secret: 'At 9:41 I heard the grinder test and posted "THE BEAST LIVES" with three reactions. I have scrolled past that message four times tonight and felt sick every time.',
    neverDo: 'Drink machine coffee after 4 PM.',
    motive: 'Chirag heard the repair happen and memorialized it in a timestamped channel post — the machine\'s resurrection has a public record because of him. He was photographed on the terrace through the window.',
    timeline: '9:02 AM - Arrived, standup.\n9:41 AM - Posted "THE BEAST LIVES" as the grinder test ran.\n1:00 PM - Terrace, engineering table.\n2:50 PM - On the livestream at the games.\n3:58 PM - Went very quiet.',
    code: 'TROMBONE',
  }),
  witness({
    id: 'char_shashwat',
    name: 'Shashwat',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer, terminally punctual, and — as of 3:31 PM on Friday — the last person to see Dev Malhotra alive. Through glass. Without knowing it.',
    quirk: 'Walks the stairs "for the steps count" and judges lift-takers silently.',
    secret: 'At 3:31 I passed the Glass Room and saw Dev head-down over his notes. I thought: rude to knock. He may have already been dying. I keep re-walking those four seconds.',
    neverDo: 'Interrupt someone reading.',
    motive: 'Shashwat left the terrace at 3:30 — five minutes after the window the police care about closed — to fetch his charger, and his stairwell walk is on the livestream\'s edge as he leaves. His 3:31 sighting fixes the last moment anyone saw Dev.',
    timeline: '8:57 AM - Arrived by the stairs, obviously.\n1:00 PM - Terrace, engineering table.\n2:45 PM - On the livestream through the whole window.\n3:30 PM - Went down for his charger.\n3:31 PM - Passed the Glass Room; Dev was head-down over his notes.\n3:56 PM - Understood what he had seen.',
    code: 'URCHIN',
  }),
  witness({
    id: 'char_anusha',
    name: 'Anusha',
    profession: 'Customer Support',
    group: 'SUPPORT',
    bio: 'Support specialist who sits nearest the second-floor meeting glass, where Thursday\'s loudest argument happened.',
    quirk: 'Mutes her headset to eavesdrop and calls it "ambient context."',
    secret: 'Thursday I heard the whole Luke-and-Dev fight through the glass. Luke said the comps ledger was none of Dev\'s business. Dev said, very quietly, "it will be everyone\'s business on Friday." I heard that part too.',
    neverDo: 'Read a customer\'s tone as calm when it is cold.',
    motive: 'Anusha carries both halves of the Thursday argument — the shout everyone heard and the quiet reply nobody else did. Her Friday window is on camera: she ran the interns\' game station on the livestream.',
    timeline: '9:04 AM - Arrived, queue.\n1:00 PM - Terrace, support table.\n2:45 PM - Ran the intern game station, on the livestream.\n3:58 PM - Took her headset off entirely.',
    code: 'VELCRO',
  }),
  witness({
    id: 'char_kursheeth',
    name: 'Kursheeth',
    profession: 'HR and Customer Support',
    group: 'HR',
    bio: 'HR generalist, first-aid officer, and the calmest person in the building at 3:56 PM, when calm was the only useful thing left.',
    quirk: 'Renews his first-aid certification annually and made it everyone\'s problem, gratefully, on Friday.',
    secret: 'I did CPR for eleven minutes and I knew by minute two. His lips were wrong. The paramedic saw me notice and wrote something down. "Query poisoning" was my sentence before it was theirs.',
    neverDo: 'Let a first-aid kit go unchecked past its date.',
    motive: 'Kursheeth saw Kalaivani and Giles walk in together at 8:41 from the first-floor reception desk, spent the window running the games registry on camera, and gave Dev his last eleven minutes. Nobody in the building is cleaner.',
    timeline: '8:41 AM - Walking in past ground-floor reception; saw two colleagues arrive from one Uber, not talking.\n1:00 PM - Terrace, HR table.\n2:45 PM - Ran the games registry beside Simran, on the livestream.\n3:56 PM - Took the stairs three at a time and started CPR.\n4:14 PM - Stood back for the paramedics and did not sit down for an hour.',
    code: 'WIGWAM',
  }),
  witness({
    id: 'char_mohit_p',
    name: 'Mohit P.',
    profession: 'Software Engineer',
    group: 'ENGINEERING',
    bio: 'Backend engineer and the one who asked Yao the question everyone else forgot to: what exactly did the outage take with it?',
    quirk: 'Ends every debugging session by writing "root cause:" and staring at it.',
    secret: 'At 11:50 I asked Yao if the cameras were back. He said yes. I asked if the morning footage survived. He said "corrupted in the failover" without looking up. Root cause: I believed him.',
    neverDo: 'Close an incident without a root cause.',
    motive: 'Mohit P.\'s two questions and their two answers are the outage\'s only contemporaneous record — the "corrupted in the failover" line is quoted in the device log. His window is fully photographed at the games.',
    timeline: '8:48 AM - Arrived, standup.\n11:50 AM - Asked Yao about the cameras; got the failover line.\n1:00 PM - Terrace, engineering table.\n2:50 PM - On the livestream at the games.\n3:58 PM - Started writing "root cause:" in his head.',
    code: 'ZIRCON',
  }),
  witness({
    id: 'char_sagrika',
    name: 'Sagrika',
    profession: 'CRO Specialist',
    group: 'MARKETING',
    bio: 'Conversion specialist who watches user behaviour for a living, which turns out to be transferable to watching colleagues.',
    quirk: 'Calls suspicious behaviour "an interesting funnel."',
    secret: 'At 2:46 I was across the table from Anurag and watched him type, send, and set the phone face-down — and then the alert ping sounded and he picked it up like it was news. I know a rehearsed reaction. I test them for a living.',
    neverDo: 'Trust a metric that improved overnight.',
    motive: 'Sagrika is the pre-ping typing\'s primary witness, seated directly opposite. Her own window is on the livestream, two seats into frame for the entire games segment.',
    timeline: '9:06 AM - Arrived, funnel review.\n1:00 PM - Terrace, marketing table, opposite the ops side.\n2:46 PM - Watched the typing; heard the ping land second.\n2:50 PM - Stayed at the table as half of it emptied.\n3:58 PM - Rewound the moment in her head and did not like the funnel.',
    code: 'CARAVAN',
  }),
  witness({
    id: 'char_vadini',
    name: 'Vadini',
    profession: 'SEO Manager',
    group: 'MARKETING',
    bio: 'SEO manager whose rank-tracking dashboards died in the 11 AM outage, which she took as a personal insult and documented accordingly.',
    quirk: 'Screenshots everything. Everything.',
    secret: 'I screenshotted the outage banner at 11:04, the "all clear" at 11:47, and — because I screenshot everything — the NVR admin page that flashed open on the shared TV for two seconds when Yao cast his laptop wrong at 11:31. I did not know what I had until tonight.',
    neverDo: 'Let a redirect chain reach three hops.',
    motive: 'Vadini\'s reflexive screenshot habit accidentally captured the 11:31 admin session mid-flight — the moment the afternoon camera gap was booked. She was on the terrace, on the livestream, through the entire window.',
    timeline: '9:17 AM - Arrived, rankings review.\n11:04 AM - Screenshotted the outage banner, filed a complaint.\n11:31 AM - Screenshotted a cast-fail on the shared TV without thinking.\n1:00 PM - Terrace, marketing table.\n2:45 PM - On the livestream at the quiz.\n3:58 PM - Started scrolling her camera roll backwards.',
    code: 'EMBLEM',
  }),
];

// The roster the whole app reads. Six clean slots at the top keeps the opening
// screenful of the roster and the first row of the ballot grid free of
// conspirators.
export const CHARACTERS = dealt(ROSTER, {
  salt: 'roster',
  isHot: (character) => character.role === 'MURDERER',
  safeTop: 6,
});

export const CASE_META = {
  caseId: '2108-C',
  title: 'TripleSpeed: Onam in Black',
  brand: 'TripleSpeed',
  victimName: 'Dev Malhotra',
  victimProfession: 'Independent revenue-assurance consultant',
  date: '21 August 2026',
  venue: 'Chimp Processing · Midford KTR2, Indiranagar',
  policeUnit: 'Bengaluru City Police · Indiranagar Division',
  inspector: 'Inspector Arjun Kale',
  playerCount: CHARACTERS.length,
  primeSuspectCount: CHARACTERS.filter((character) => character.isSuspect).length,
  killerCount: CHARACTERS.filter((character) => character.role === 'MURDERER').length,
};

export const CASE_TIMELINE = [
  { time: '8:12 AM', event: 'An urgent service ticket revives the dead third-floor coffee machine' },
  { time: '9:41 AM', event: 'The technician signs the machine off as working' },
  { time: '11:04 AM', event: 'Office WiFi and cameras drop for 43 minutes' },
  { time: '1:00 PM', event: 'Onam lunch begins on the terrace' },
  { time: '2:47 PM', event: 'A payment-failure alert pulls part of the room off the terrace' },
  { time: '3:12 PM', event: 'Dev leaves the party for the third floor — "save me some payasam"' },
  { time: '3:55 PM', event: 'Aarohi finds him in the Glass Room' },
  { time: '4:14 PM', event: 'Paramedics declare him dead' },
  { time: '4:30 PM', event: 'Police seal floors one to three and the terrace. Nobody has left since 1 PM' },
];

const KILLER_IDS = ['char_anurag', 'char_yao', 'char_giles', 'char_kalaivani', 'char_akshat'];

// ---------------------------------------------------------------------------
// Statement pods
//
// After the seal, Inspector Kale split the 69 staff into twelve pods to take
// statements. Each pod was handed one witness claim about one prime suspect —
// that claim is the accusation card a player is dealt at Round 1. A pod never
// receives the claim about its own member (a dev assertion below enforces it),
// and every player appears in exactly one pod.
// ---------------------------------------------------------------------------
const PODS = {
  A: ['char_elias', 'char_kshitij', 'char_sonia', 'char_daiwik', 'char_prerna', 'char_tushar'],
  B: ['char_sukhans', 'char_sagrika', 'char_shrey', 'char_binil', 'char_kashish', 'char_mohit_a'],
  C: ['char_anurag', 'char_vidisha', 'char_aman', 'char_navya', 'char_harsha', 'char_ishan'],
  D: ['char_yao', 'char_neha', 'char_simran', 'char_aarush', 'char_utkarsh', 'char_luke'],
  E: ['char_giles', 'char_navalika', 'char_riya', 'char_jason', 'char_victor', 'char_shashwat'],
  F: ['char_kalaivani', 'char_caleb', 'char_rishabh', 'char_dilip', 'char_pragati', 'char_anusha'],
  G: ['char_akshat', 'char_nikitha', 'char_shobhit', 'char_thejas', 'char_aditi', 'char_mohit_p'],
  H: ['char_nehal', 'char_kursheeth', 'char_shivam', 'char_bharatpreet', 'char_sanad', 'char_chirag'],
  I: ['char_aarohi', 'char_yash_t', 'char_vipin', 'char_abhinav', 'char_vadini', 'char_akshay'],
  J: ['char_adithya', 'char_karthik', 'char_aksharaa', 'char_sharad', 'char_himanshu'],
  K: ['char_pranav_d', 'char_raksha', 'char_tauseef', 'char_ishika', 'char_amisha'],
  L: ['char_pranav_a', 'char_yash_s', 'char_bhuvan', 'char_raaghav', 'char_priyanshu'],
};

const ACCUSATION_DECK = [
  {
    id: 'acc_anurag',
    code: 'TRIDENT',
    targetSuspect: 'char_anurag',
    targetName: 'Anurag',
    title: 'Suspicious Behavior: Anurag',
    accusation: 'Anurag was typing on his phone before the alert tone went off — I watched him send something, set the phone face-down, and then pick it up like it was news. Twenty minutes into the incident he told the War Room it would "clear by four." It did not clear. It just stopped mattering at four.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.A,
  },
  {
    id: 'acc_yao',
    code: 'BALLAST',
    targetSuspect: 'char_yao',
    targetName: 'Yao',
    title: 'Suspicious Behavior: Yao',
    accusation: 'Yao spent the outage alone in the network cupboard and refused help through a six-inch gap in the door — from a man who has never once refused help. The WiFi came back. The morning camera footage did not. When someone asked why, he said "corrupted in the failover" without looking up from his screen.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.B,
  },
  {
    id: 'acc_giles',
    code: 'GIRDER',
    targetSuspect: 'char_giles',
    targetName: 'Giles',
    title: 'Suspicious Behavior: Giles',
    accusation: 'Giles left the party at 2:50 to fetch the spare HDMI for the four o\'clock toast. The HDMI had been on the terrace since 8:30, in the AV backpack, where it always is. Someone saw a man at the third-floor coffee nook around then, holding a steel tumbler, and assumed he was clearing party cups. Nobody was clearing cups a floor below a party that was still going — and Giles has never once mentioned a tumbler.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.C,
  },
  {
    id: 'acc_kalaivani',
    code: 'SUNDIAL',
    targetSuspect: 'char_kalaivani',
    targetName: 'Kalaivani',
    title: 'Suspicious Behavior: Kalaivani',
    accusation: 'Kalaivani skipped the morning watering for the first time in a year, arrived in a shared Uber with a colleague she has never carpooled with, and kept a steel chai flask under the beverage table that never once got opened — at an Onam party drowning in chai. When someone offered to pour it out, she said it was "for later."',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.D,
  },
  {
    id: 'acc_akshat',
    code: 'PULLEY',
    targetSuspect: 'char_akshat',
    targetName: 'Akshat',
    title: 'Suspicious Behavior: Akshat',
    accusation: 'When the 2:47 alert hit, every person on the second floor flinched except Akshat. He kept scrolling the vendor drive — the Zenlyt folder, the "scam vendor" everyone was told to forget — like the alert was old news to him. In May he told people to stop pulling that thread. This week he was the one holding it.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.E,
  },
  {
    id: 'acc_victor',
    code: 'AWNING',
    targetSuspect: 'char_victor',
    targetName: 'Victor',
    title: 'Suspicious Behavior: Victor',
    accusation: 'Victor disappeared into the second-floor phone booth from 2:50 to 3:10 and will not say who the call was with — he covered the glass with his palm when people walked past. He spent all week fighting with Dev about spend numbers, and his name is all over the paperwork for the vendor everyone was told was a scam.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.F,
  },
  {
    id: 'acc_sukhans',
    code: 'BUGLE',
    targetSuspect: 'char_sukhans',
    targetName: 'Sukhans',
    title: 'Suspicious Behavior: Sukhans',
    accusation: 'Sukhans left the party at three for an "investor call" and spent the rest of the window alone in his cabin — twenty feet from the Glass Room. On Wednesday, half the third floor heard him call Dev\'s audit "a witch hunt that will burn the team before diligence." Two days later the man running the witch hunt was dead next door to him.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.G,
  },
  {
    id: 'acc_aarohi',
    code: 'CORNICE',
    targetSuspect: 'char_aarohi',
    targetName: 'Aarohi',
    title: 'Suspicious Behavior: Aarohi',
    accusation: 'Aarohi printed one page for Dev at 12:40 and stood over the tray so nobody could see it. At 3:45 she was at the third-floor shredder with one page. At 3:55 she "found" the body. She managed his calendar, she knew the four o\'clock meeting was not really a toast, and she is the only person who touched his paperwork today. She was also alone at the Glass Room at 3:04, laying the room out for it.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.H,
  },
  {
    id: 'acc_nehal',
    code: 'DORY',
    targetSuspect: 'char_nehal',
    targetName: 'Nehal',
    title: 'Suspicious Behavior: Nehal',
    accusation: 'On Wednesday, Nehal followed Dev off the terrace stairs saying "publish that split and my team\'s numbers die with it." On Friday he left the party at 2:52 for a client escalation — except support has no ticket for it, and when someone checked, he said it was "on WhatsApp" and asked them to keep it between themselves.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.I,
  },
  {
    id: 'acc_prerna',
    code: 'FLINT',
    targetSuspect: 'char_prerna',
    targetName: 'Prerna',
    title: 'Suspicious Behavior: Prerna',
    accusation: 'Prerna went down at 2:55 for montage files the editors already had, and came back up eleven minutes later by the service stairs — which nobody uses, in sandals, on a party day. The vendor contract Dev flagged as an undisclosed conflict is hers, and her equity refresh was on the table this quarter.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.J,
  },
  {
    id: 'acc_adithya',
    code: 'GROTTO',
    targetSuspect: 'char_adithya',
    targetName: 'Adithya',
    title: 'Suspicious Behavior: Adithya',
    accusation: 'Adithya started moving before the 2:47 alert finished buzzing — like a man waiting for a starting gun. He owns the provider migration the whole leak hid under. And at 3:30 he asked the War Room why Dev hadn\'t come down for a settlement alert. Nobody else had noticed Dev was missing. Why was he counting?',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.K,
  },
  {
    id: 'acc_luke',
    code: 'PYLON',
    targetSuspect: 'char_luke',
    targetName: 'Luke',
    title: 'Suspicious Behavior: Luke',
    accusation: 'Luke took two gate runs during the window and the register only shows one. On Thursday he had a shouting match with Dev loud enough to hear through glass — the comps ledger was "none of Dev\'s business." Friday afternoon, the man who disagreed was dead, and Luke\'s second trip to the gate has no paper.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.L,
  },
];

const targetsAKiller = (clue) => KILLER_IDS.includes(clue.targetSuspect);

// Round 1's stack must not open on a run of conspirators — the first three
// names a player scrolls past are clean by construction.
export const ACCUSATION_CLUES = dealt(ACCUSATION_DECK, {
  salt: 'accuse',
  isHot: targetsAKiller,
  safeTop: 3,
});

const MOTIVE_DECK = [
  {
    id: 'mot_anurag',
    code: 'MERIDIAN',
    targetSuspect: 'char_anurag',
    targetName: 'Anurag',
    title: 'Motive: Anurag',
    content: 'On Tuesday, Dev pulled the payment provider\'s settlement archive directly from the provider portal — the one dataset nobody inside the company could edit first. The portal emails a notification for every archive pull to the billing admin. The billing admin is Anurag. Whatever Friday\'s briefing contained, Anurag had known since Tuesday evening that it was coming, that it was built on unsanitized data, and that settlement — his lane — was page one.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_yao',
    code: 'OBSIDIAN',
    targetSuspect: 'char_yao',
    targetName: 'Yao',
    title: 'Motive: Yao',
    content: 'Dev\'s infra-cost memo asked one question nobody could answer: why does TripleSpeed buy its compute through a third-party "cloud partner" at rates worse than the public price sheet? The partner arrangement is Yao\'s — he negotiated it, he renews it, and he is the only person who understands the bill. Every month that arrangement survives is worth money to somebody, and the memo was scheduled to become a briefing on Friday at 4 PM.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_giles',
    code: 'PLINTH',
    targetSuspect: 'char_giles',
    targetName: 'Giles',
    title: 'Motive: Giles',
    content: 'Eleven months of ghost-vendor purchase orders — ₹68 lakh of shoots, props and contractor work nobody remembers happening — were raised under Giles\'s ops login: nine months as "Zenlyt Productions LLP", and, after May buried that name, two more under its successor. On Thursday, Dev emailed him a checklist request: "all POs under ₹5L, FY 25-26." That threshold is not random. It is the auto-approval line, and every Zenlyt invoice sat just beneath it. The checklist was a list of everything Giles had ever signed, requested politely, by a man with one day to live.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_kalaivani',
    code: 'QUASAR',
    targetSuspect: 'char_kalaivani',
    targetName: 'Kalaivani',
    title: 'Motive: Kalaivani',
    content: 'Every goods-received note confirming a Zenlyt delivery carries two signatures: a first that varies, and a second that never does. The constant second signature is Kalaivani\'s. On Wednesday, Dev requested the goods-received register from ops. A ghost vendor survives as long as nobody cross-checks who kept confirming that nothing, in fact, arrived — and cross-checking had just become a paid consultant\'s full-time job, with a deadline of Friday.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_akshat',
    code: 'RIPCORD',
    targetSuspect: 'char_akshat',
    targetName: 'Akshat',
    title: 'Motive: Akshat',
    content: 'Dev\'s spend reconciliation kept circling a 12% delta between what TripleSpeed paid for media and what the platforms recorded receiving. The difference routes through a reseller ad account that only the media buyer touches. It is why some months the ad spend runs inexplicably high while the ROAS runs inexplicably low — the two mysteries the company has spent a year blaming on the algorithm. The algorithm was innocent, and by Friday afternoon Dev could prove it.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_victor',
    code: 'SEXTANT',
    targetSuspect: 'char_victor',
    targetName: 'Victor',
    title: 'Motive: Victor',
    content: 'Victor has spent a year answering for spend numbers that never added up, and Dev\'s early notes kept circling performance marketing. The vendor file says Victor onboarded Zenlyt — the "scam vendor" — and personally vouched for it. If Friday\'s briefing blamed his lane, he was finished in this industry, and he knew it. He had motive to want the report dead. What he did not have, and did not know he needed, was proof of when that vendor file was actually written.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_sukhans',
    code: 'TANGRAM',
    targetSuspect: 'char_sukhans',
    targetName: 'Sukhans',
    title: 'Motive: Sukhans',
    content: 'The $10-million-a-month plan runs through a credit-line diligence this winter, and a fraud finding two months before diligence does not read as "we caught it" — it reads as "what else haven\'t they caught." Sukhans co-signed hiring Dev, then spent Wednesday arguing the audit should be shut down before it torched morale and the raise with it. A dead consultant kills a report. Every founder knows what a report costs. Only one of them said so out loud, two days early.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_aarohi',
    code: 'UKULELE',
    targetSuspect: 'char_aarohi',
    targetName: 'Aarohi',
    title: 'Motive: Aarohi',
    content: 'Aarohi ran Dev\'s calendar, booked his room, and printed his paper — which means she is the one person who knew Friday\'s "Ways of Working toast" was a findings briefing with an invite list of nine. Dev\'s expense review had also flagged the founders\'-office float she administers: sloppy entries, small amounts, her initials. Knowing the meeting\'s real agenda and appearing in its appendix is a bad combination for the person who also found the body.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_nehal',
    code: 'VERTEX',
    targetSuspect: 'char_nehal',
    targetName: 'Nehal',
    title: 'Motive: Nehal',
    content: 'Dev\'s attribution work would republish the organic/paid split — and a meaningful slice of the organic wins Nehal was promoted on sat on the wrong side of it, quietly inflated by whatever was broken in paid. "Publish that split and my team\'s numbers die with it" is what he told Dev on the stairs on Wednesday, in front of a witness he did not see. On Friday the split died instead, along with its author — which is exactly how the room will phrase it if he cannot produce that client escalation.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_prerna',
    code: 'WHARF',
    targetSuspect: 'char_prerna',
    targetName: 'Prerna',
    title: 'Motive: Prerna',
    content: 'Dev\'s vendor review flagged the design-tooling contract as an undisclosed related-party transaction — the studio behind it was founded by Prerna\'s old classmate. The software is good and the price is fair, which is exactly why nobody ever looked. But "undisclosed conflict of interest" is a phrase with no good ending for a founding employee whose equity refresh was on this quarter\'s agenda, and the review was due to be read aloud on Friday at 4 PM.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_adithya',
    code: 'YODEL',
    targetSuspect: 'char_adithya',
    targetName: 'Adithya',
    title: 'Motive: Adithya',
    content: 'The payment-provider migration has been "six weeks away" for five months, and every month of delay gave the settlement noise another month to hide in. Dev\'s draft contained one sentence about it, and Adithya read that sentence over his shoulder in the Glass Room: "the migration owner either missed it or enabled it." A man who knows exactly which sentence will end his career, and exactly when it will be read, has a very precise reason to want the reading cancelled.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_luke',
    code: 'ZENITH',
    targetSuspect: 'char_luke',
    targetName: 'Luke',
    title: 'Motive: Luke',
    content: 'Every time the payment provider failed, VIP customers got comps and make-goods — authorized by Luke, logged loosely, and on paper indistinguishable from money walking out the door. Dev flagged the comps-and-refunds ledger as a possible leak channel, and Thursday\'s shouting match ended with Luke saying it was none of Dev\'s business and Dev replying, quietly, that it would be everyone\'s business on Friday. It is Friday.',
    roundReq: 2,
    type: 'MOTIVE',
  },
];

// Dealt with its own salt so the motive stack doesn't mirror the accusation
// stack — matching positions across two screens would rebuild the same tell.
export const MOTIVE_CLUES = dealt(MOTIVE_DECK, {
  salt: 'motive',
  isHot: targetsAKiller,
  safeTop: 3,
});
const EVIDENCE_DECK = [
  {
    id: 'ev_tox',
    code: 'BISON',
    title: 'Toxicology Summary',
    content: 'FORENSIC SCIENCE LABORATORY - BENGALURU\nFIELD SCREEN - PRELIMINARY\n\nCASE: Dev Malhotra / Chimp Processing Pvt Ltd, Indiranagar\nSPECIMENS: Blood, gastric contents, tumbler residue, machine tank, sugar sachets, catering samples.\n\nFINDINGS:\n- Cause of death: acute cardiac glycoside poisoning, consistent with concentrated oleandrin (oleander extract)\n- Highest residue: interior of the victim\'s personal steel tumbler, below the coffee line\n- Coffee machine tank, grounds hopper and drip tray: NEGATIVE\n- Sugar sachets at the coffee nook: NEGATIVE\n- Onam catering (all dishes sampled): NEGATIVE\n\nCONCLUSION: The building\'s food and the machine itself were clean. The poison was in one vessel only - the victim\'s own tumbler - before the coffee was poured into it.',
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_tumbler',
    code: 'CALIPER',
    title: 'Tumbler and Coffee-Nook Analysis',
    content: 'ITEM: Steel tumbler engraved DM, recovered from the Glass Room floor.\n\nFINDINGS:\n- A dried film of plant-resin concentrate below the coffee line, applied to the empty tumbler and left to sit — the victim\'s 3:15 pour dissolved it\n- The victim rinsed and staged the tumbler beside the machine at 1:05 PM, as he did every day the machine worked (two staff confirm the ritual)\n- The machine\'s brew counter logged exactly three pulls on 21 August: 9:41 AM (technician test), 2:52 PM, and 3:15 PM (the victim)\n- Nobody claims the 2:52 pull. The drip tray was still wet at examination\n- A faint smear of the same plant resin on the counter edge beside the machine\n\nNOTE: Someone stood at that nook at 2:52 PM, ran a test shot to confirm the machine worked, and left a dose in a tumbler the whole floor knew only one man would touch.',
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_cctv',
    code: 'DUNE',
    title: 'Camera and Network Log',
    content: 'BUILDING SYSTEMS SUMMARY - MIDFORD KTR2\n\n11:04 AM - Office network drops. Camera NVR reinitializes during the failover; the recording array is wiped. The NVR held fourteen days - every frame of it, from every floor camera and the basement, is unrecoverable.\n11:47 AM - Network restored.\n2:45 PM - NVR enters a scheduled "maintenance restart." All floor and basement cameras blind.\n3:21 PM - Cameras return.\n\nNOTES:\n- The 2:45 PM maintenance window was SCHEDULED AT 11:31 AM, from an administrative session, during the outage.\n- A camera gap that is booked three hours in advance is not an outage. It is an appointment.\n- The only camera-blind period after lunch is 2:45-3:21 PM - which brackets the unclaimed 2:52 PM brew exactly.\n- The morning wipe took the fortnight behind it as well. Wednesday night and Thursday evening are gone, which is why the hedge, the store room and the second-floor desk lamps rest on colleagues\' memories instead of tape.',
    roundReq: 3,
    type: 'CCTV',
  },
  {
    id: 'ev_badge',
    code: 'EPOCH',
    title: 'Badge and Lift Trace',
    content: 'ACCESS CONTROL TRACE - 21 AUGUST\n\n- 11:20 AM - Visitor badge V-07 signed back in at ground-floor reception (its visitor left Tuesday; the return was a paperwork catch-up)\n- 2:52 PM - Badge V-07 rides the service lift to Floor 3\n- 2:54 PM - Badge V-07 rides the service lift down\n- 3:12 PM - Dev Malhotra badges onto Floor 3 (stairs)\n- 1:00 PM - 4:30 PM - Gate register and boom barrier: zero exits\n\nNOTES: A dead visitor badge does not ride lifts by itself. Someone re-armed V-07 in the system after it was signed back in, used it for one round trip during the camera gap, and returned it to the tray. Whoever it was wanted the lift log to name a visitor who was not in the building - instead of naming them. The badge tray sits unwatched at ground-floor reception; the last person on record standing over it that day was whoever signed the 9:41 AM technician in.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_ticket',
    code: 'FURLONG',
    title: 'Coffee Machine Service Ticket',
    content: 'FACILITIES TICKET #4417 - logged 8:12 AM, 21 August, priority URGENT, note: "before the party."\n\nHISTORY: The machine had been fully dead for two weeks. Four earlier tickets (two filed by the victim himself) sat unanswered in the same inbox.\n\nVENDOR JOB SHEET, 9:41 AM: "No fault found - inlet valve had been manually shut. Reopened, tested, working."\n\nIN PLAIN ENGLISH: The machine was never broken. Someone shut its water line two weeks ago and reopened it - by appointment - on the one morning it mattered. The victim\'s coffee ritual did not survive by luck. It was switched off, and then switched back on, by someone who needed it to run on exactly this Friday.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_vendor',
    code: 'GIMLET',
    title: 'Vendor Dossier Mismatch',
    content: 'DOCUMENT EXAMINATION - "ZENLYT PRODUCTIONS LLP - ONBOARDING PACK"\n\nThe pack that names Victor as the vendor\'s sponsor - onboarding form, three vouching emails, a signed risk checklist - fails examination:\n\n- File metadata: created Wednesday 19 August, 11:58 PM. The content is dated thirteen months earlier.\n- The "vouching" emails cite message-IDs that do not exist on the company mail server.\n- The onboarding form was exported from a marketing-team template whose current footer appears in the "old" document.\n- The invoice formatting matches a genuine year-old invoice template circulated internally on Wednesday afternoon.\n\nCONCLUSION: The paperwork tying Victor to the ghost vendor is two days old. Somebody manufactured a history - and chose whose name to put on it.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_alert',
    code: 'HOIST',
    title: 'Payment Alert Trace',
    content: 'INCIDENT AUDIT - THE 2:47 PM "SETTLEMENT FAILURE"\n\n- The payment provider\'s status page showed green throughout. The provider has no record of any failure on 21 August.\n- The alert payload is byte-identical to a sandbox test webhook from the integration environment - a replay, not an event.\n- Origin: inside the office network. The replay was fired from the building.\n- Effect: within four minutes, eleven people had left the terrace with unimpeachable reasons.\n\nCONCLUSION: The one incident that thinned the party was staged by someone who knew exactly what an incident does to this office - and who would move where when it hit.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_planters',
    code: 'IBEX',
    title: 'Terrace Planter Survey',
    content: 'HORTICULTURAL EXAMINATION - TERRACE, SMOKING-CORNER HEDGE\n\n- The screening hedge is Nerium oleander - common, decorative, and seriously toxic in concentrate.\n- Fresh diagonal secateur cuts on the inner face, 36-48 hours old at examination. Cuttings removed from site.\n- The terrace gardening kit (first-floor store) is complete except the small secateurs, found washed - unusually clean for a working tool.\n- The volunteer pruning log kept with the kit runs continuously for eleven months. The most recent page has been torn out.\n\nNOTE: The poison did not have to be bought, ordered or carried past the gate. It has been growing ten feet from the eating area all along - and somebody harvested it, this week, with the office\'s own tools.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
];

// The forensics deck names no suspect on its face, so there is nothing to keep
// out of the top slots — it is dealt only so the stack stops reading in the
// order it was written.
export const EVIDENCE_CLUES = dealt(EVIDENCE_DECK, { salt: 'evidence' });

const REVELATION_DECK = [
  {
    id: 'rev_draft',
    code: 'JUBILEE',
    title: "Dev's Recovered Draft",
    content: 'RECOVERED FILE - "FINDINGS v0.9" (local copy, victim\'s laptop)\n\nThe Drive copy was deleted at 11:23 AM on the day he died. He kept one locally.\n\nThe draft maps a single leak network of roughly ₹3.4 crore across four channels, naming five ROLES, not people:\n- HoP - settlement reserve releases diverted to a look-alike beneficiary\n- TL - compute bought through a marked-up "cloud partner," difference returned off-book\n- OE - ghost-vendor purchase orders, all under the ₹5L auto-approval line\n- CS-O - second signature on goods-received notes confirming deliveries that never came\n- MB - 12% of media spend routed through a reseller kickback\n\nAnd one margin note in the victim\'s hand: "The Zenlyt \'Victor onboarding\' pack is fabricated - see metadata. Whoever built it was aiming the story before I ever wrote it."\n\nThe report the killers died to stop* names their jobs, clears the framed man, and survived them. (*figure of speech - so far, one direction only.)',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_uber',
    code: 'KESTREL',
    title: 'Company Uber Dashboard',
    content: 'UBER-FOR-BUSINESS TRIP LOG - 21 AUGUST, MORNING WINDOW\n\nCompany rides are free before 9 AM and logged centrally. One entry stands out:\n\n- 8:19 AM - Trip booked on Kalaivani\'s account\n- 8:29 AM - Four-minute stop added mid-route: the gate of Giles\'s building\n- 8:37 AM - Both passengers dropped at Midford KTR2\n\nThey have never shared a ride before - 214 prior trips between them, zero overlaps. The basement camera that would have shown the arrival lost its footage in the 11 AM "failover."\n\nTwo witnesses put them walking in together, not talking. A carpool that talks about nothing, on the one morning something needed to change hands before the building\'s cameras woke up.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_admin',
    code: 'LOCKET',
    title: 'Workspace and Systems Audit',
    content: 'ADMINISTRATIVE SESSION AUDIT - 21 AUGUST\n\nOne admin session, opened 11:09 AM from a laptop docked at the third-floor network-cupboard console, performed three actions before closing:\n\n1. 11:23 AM - Permanently deleted "FINDINGS v0.9" from the restricted Drive folder\n2. 11:31 AM - Scheduled the NVR "maintenance restart" for 2:45-3:21 PM\n3. 11:36 AM - Re-armed retired visitor badge V-07 in the access system\n\nThe session authenticated against a founder-era admin lineage rather than any named account - it carries no username.\n\nOne session. Three jobs: kill the report, book the blind spot, arm the badge. Whoever sat at that console between 11:09 and 11:47 owns all three - and the console sits behind a door with exactly one regular keyholder.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_grn',
    code: 'MINARET',
    title: 'Goods-Received Ledger Analysis',
    content: 'HANDWRITING EXAMINATION - ZENLYT (AND SUCCESSOR) DELIVERY CONFIRMATIONS\n\nEleven months of goods-received notes - nine under "Zenlyt Productions LLP", two more under the name it reopened as in May - confirm deliveries nobody remembers. Each carries two signatures:\n\n- The FIRST signature varies - eight different staff names across the ledger. Pressure analysis shows traced starts, hesitation marks and identical lift-offs: they are copies, forged from genuine signatures on real, unrelated paperwork.\n- The SECOND signature never varies, and it is genuine - natural pressure, natural speed, the same confident hand for eleven months.\n\nCONCLUSION: Eight colleagues\' names were borrowed to dress the ledger. One person actually signed it, every time, in their own hand - the person whose job put them at the delivery desk, confirming arrivals, month after month, for a vendor that never delivered anything.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_chat',
    code: 'NOCTURNE',
    title: 'Recovered Group Chat',
    content: 'DEVICE FORENSICS - GROUP CHAT "FANTASY LEAGUE ⚽"\n\nCreated Wednesday 9:12 PM. Five members. No fantasy league exists at this company. Recovered fragments resolve roles, not names:\n\nHoP: he pulled the settlement archive himself tuesday. friday he reads names. mine is first.\nTL: drive copy handled. cameras will be busy 245 to 320. badge is live again.\nOE: machine gets fixed in the morning. after that his own routine does the work.\nCS-O: hedge was enough. it needs to sit in the flask till morning. bitter goes under bitter.\nMB: if anyone ever asks who brought zenlyt in, the answer is already in the vendor file.\nHoP: nobody moves during the window except who has a reason to. everyone has a reason. that is the point.\n\nThis is the twist clue, not the final answer: it proves five people - five roles - coordinated across departments. The room still has to put names to the roles.',
    roundReq: 5,
    type: 'REVELATION',
  },
  {
    id: 'rev_provider',
    code: 'OMNIBUS',
    title: 'The Settlement Archive',
    content: 'PAYMENT PROVIDER - SETTLEMENT ARCHIVE (re-issued to police on request)\n\nThe dataset Dev pulled on Tuesday - the pull that started the countdown - shows:\n\n- Rolling-reserve releases, three cycles per quarter, paid to beneficiary "CHIMP PROCESING PVT LTD" - one S short of the company\'s legal name\n- The look-alike account was opened fourteen months ago; its mandate paperwork reuses the company\'s own board-resolution template\n- Every diverted release coincides with a logged "payment provider issue" in the ops channel - the outages were the cover story, invented in-house, each time\n- The provider confirms: no genuine settlement failure occurred on any of those dates, including 21 August\n\nThe archive could always be re-issued. Killing the man who read it never killed the data. It only proved how much one reader was worth.',
    roundReq: 5,
    type: 'REVELATION',
  },
];

// Grouped by round first: the Round 5 pair (the chat and the archive) are the
// twist, and they have to stay behind the Round 4 documents no matter where
// the hash would otherwise put them.
export const REVELATION_CLUES = dealt(REVELATION_DECK, {
  salt: 'reveal',
  group: (clue) => clue.roundReq,
});

export const CONFESSION_CLUE = {
  id: 'confession',
  code: 'KEYSTONE',
  title: 'The Truth',
  content: 'We did it. Anurag built it. The rest of us made sure it worked.\n\nDev was three days from reading a list with all five of us on it. Not the company\'s normal chaos - the real ledger. The reserve account. The cloud partner. Zenlyt. The signatures. The twelve percent. He pulled the settlement archive on Tuesday and the portal told Anurag the same evening. By Wednesday night there was a group chat with a stupid name and a plan with none.\n\nEveryone contributed what their job already gave them. Kalaivani\'s hedge and her chemistry degree. Giles\'s ticket queue and a visitor badge. Yao\'s admin console and a camera schedule. Akshat\'s paperwork and somebody else\'s name on it. Anurag\'s alert, timed to hand half the office a guilty-looking reason to move. We did not smuggle anything past the gate. The building supplied everything - the plant, the machine, the badge, the chaos. This company\'s ordinary problems were the whole disguise.\n\nWe were not going to hurt anyone else. The dose was in his tumbler, and nobody on this earth touched Dev\'s tumbler. That was the point of him, and the plan.\n\nHe told Elias to save him some payasam. Then he went downstairs to the one appointment we fixed for him, and kept it.',
  roundReq: 6,
  type: 'CONFESSION',
  forCharacters: KILLER_IDS,
};
/**
 * THE ANSWER KEY. Read by [RevealDeck.jsx](../components/RevealDeck.jsx) only — the
 * 22-slide reconstruction, whose slides 09, 21 and 22 render `jobs`, `proof` and
 * `verdict` from here directly rather than restating them, so those three can never
 * drift from this block. That screen is unreachable until the host sets
 * `revealedToMurderer`, so this is the one block in this file allowed to say plainly
 * what the clue ladder spends seven rounds proving. Nothing here may leak into a
 * round-gated surface.
 *
 * It is a restatement of [STORY.md](../../STORY.md), not a second canon: every beat
 * below is already established by a clue, a case file or a character timeline. If the
 * story changes, change both, and check the beat times still agree with CASE_TIMELINE.
 */
export const CASE_SOLUTION = {
  verdict:
    'Anurag led Yao, Giles, Kalaivani and Akshat in killing Dev Malhotra with oleander concentrate left in his own steel tumbler at the third-floor coffee machine — while a staged payment alert, a pre-booked camera gap, a dead visitor badge and a forged vendor file kept sixty-nine colleagues looking at everything except the ordinary office day the murder was dressed as.',

  why: [
    'Dev was three days from naming names. On Tuesday he pulled the payment provider\'s settlement archive — the one dataset nobody inside could sanitize — and the portal emailed the pull notification to its billing admin, Anurag. On Wednesday his draft went up to the restricted Drive folder, where the one Workspace admin, Yao, read it. The draft named five roles: HoP, TL, OE, CS-O, MB. Friday at 4 PM, the roles were scheduled to become people.',
    'Nobody had to be persuaded to fear Dev — the draft itself was the recruitment pitch. Each of the five could read their own lane in it and verify the other four were equally exposed. That is how a conspiracy formed in one evening: the document did the vetting.',
    'The plan\'s insight was that this company\'s normal weather — a machine repair, a WiFi flap, a payment alert, a courier at the gate — is indistinguishable from sabotage. They did not smuggle a single thing past the boom barrier. The building already contained the poison, the vessel, the ritual, and the chaos.',
  ],

  jobs: [
    {
      name: 'Anurag',
      group: 'Payments',
      job: 'The plan',
      lead: true,
      detail:
        'He read the archive-pull notification on Tuesday evening and understood Friday before anyone else did. He assembled the five, and at 2:47 PM he fired a replayed sandbox webhook from inside the office network — a fake settlement failure that pulled eleven people off the terrace in four minutes and handed half the suspect list a guilty-looking reason to move. He never touched the poison, the floor, or the paper. The plan was his fingerprint.',
    },
    {
      name: 'Kalaivani',
      group: 'Support',
      job: 'The toxin',
      detail:
        'The office plant-parent with a chemistry degree. She clipped the smoking-corner oleander on Wednesday night with the office\'s own secateurs, brewed the concentrate at home over two evenings, tore the page from her own pruning log, and carried it in on Friday morning in her chai flask — decanting Giles\'s share into a bottle in the car and keeping the remainder, which is why the flask spent the party unopened. Her afternoon alibi is genuinely excellent — she served payasam in front of forty people. She is convicted entirely by mornings.',
    },
    {
      name: 'Giles',
      group: 'Ops',
      job: 'The hands',
      detail:
        'He shut the machine\'s inlet valve two weeks early so its "repair" could be booked for the right morning — ticket #4417, 8:12 AM, "before the party." He took his share of it, decanted into a bottle, in their shared 8:37 Uber, and at 2:52 PM — inside the pre-booked camera gap, riding the service lift on dead visitor badge V-07, lifted from the reception tray that morning when he signed the technician in — he dosed the tumbler Dev had staged for himself and ran a blank shot to confirm the machine would not fail the plan. His cover story was an HDMI that had been on the terrace since 8:30.',
    },
    {
      name: 'Yao',
      group: 'Engineering',
      job: 'The blind spot',
      detail:
        'The 11:04 "WiFi outage" was his: it reinitialized the NVR, destroying the morning footage — including the basement arrival — and covered an admin session that did three jobs in twenty-seven minutes: deleted Dev\'s Drive draft, scheduled the 2:45–3:21 camera restart, and re-armed badge V-07. The session used a founder-era admin lineage, so it carries no name. Yao spent the actual window visibly helping in the War Room; his crime was already scheduled.',
    },
    {
      name: 'Akshat',
      group: 'Marketing',
      job: 'The false trail',
      detail:
        'On Wednesday at 11:58 PM he manufactured the Zenlyt onboarding pack that names Victor as the ghost vendor\'s sponsor — built on an invoice template he had requested from an editor that afternoon, "just as a template." If the leak ever surfaced without Dev alive to explain it, the prepared story was: an external scammer, onboarded by a careless marketer. His job was never the murder. His job was where the room would look afterwards.',
    },
  ],

  // `hidden: true` marks a beat nobody on the floor could have seen. Those carry the
  // signal marker and the bone weight; the public record stays dim, the same two-tier
  // treatment the Timeline screen uses for critical beats.
  sequence: [
    {
      time: 'Tue 6:40 PM',
      hidden: true,
      body: 'Dev pulls the settlement archive from the provider portal. The portal emails the pull notification to the billing admin. Anurag reads it and understands exactly what Friday\'s "toast" will be.',
    },
    {
      time: 'Wed 9:12 PM',
      hidden: true,
      body: 'A group chat named "Fantasy League ⚽" is created. Five members, five roles, one evening. The draft itself is the recruitment pitch — every member can verify the other four are named too.',
    },
    {
      time: 'Wed 11:58 PM',
      hidden: true,
      body: 'Akshat builds the Zenlyt onboarding pack pointing at Victor, from a year-old invoice template he requested that afternoon. That same night the oleander hedge is clipped; two desk lamps are still on on the second floor at 11:45.',
    },
    {
      time: '8:12 AM',
      body: 'Giles logs ticket #4417 — urgent, "before the party" — for a machine that has been dead for two weeks over four ignored tickets. The job sheet will read: no fault found, inlet valve manually shut.',
    },
    {
      time: '8:37 AM',
      hidden: true,
      body: 'One Uber, two passengers who have never shared a ride in 214 trips, one four-minute stop at Giles\'s gate. A bottle decanted from her chai flask changes bags in the car; the flask keeps the rest. The basement camera that filmed the arrival will lose its footage before noon.',
    },
    {
      time: '9:41 AM',
      body: 'The technician reopens the valve and the Beast lives. The whole floor celebrates. The one man who drinks from it daily now has an appointment he doesn\'t know about.',
    },
    {
      time: '11:04 AM',
      hidden: true,
      body: 'The "WiFi outage." The NVR reinitializes and the entire fourteen-day array dies with it - the morning, and the fortnight behind it. Behind the cupboard door, one nameless admin session deletes Dev\'s draft (11:23), books the afternoon camera gap (11:31), and re-arms dead visitor badge V-07 (11:36).',
    },
    {
      time: '1:05 PM',
      body: 'Dev rinses his tumbler and stages it beside the machine, as he does every day the Beast works. Then he goes up to the terrace and eats with everyone else. The killers never touch him or his routine — the routine is the weapon.',
    },
    {
      time: '2:47 PM',
      hidden: true,
      body: 'Anurag fires a replayed sandbox webhook from inside the office network. A fake settlement failure. Within four minutes, eleven people leave the terrace with unimpeachable reasons — and the suspect list writes itself.',
    },
    {
      time: '2:52 PM',
      hidden: true,
      body: 'Inside the camera gap, Giles rides the service lift on badge V-07, doses the staged tumbler with the concentrate, runs one blank shot to confirm the machine works, and is in the War Room by 3:05 holding an HDMI story. Utkarsh half-sees a man with a steel tumbler. Rishabh hears the hiss.',
    },
    {
      time: '3:12 PM',
      body: 'Dev tells Elias "save me some payasam" and takes the stairs down. Nobody sends him. Nobody needs to.',
    },
    {
      time: '3:15 PM',
      hidden: true,
      body: 'The machine works — third pull of the day. The coffee dissolves the film in the tumbler. Two sugars. The Beast\'s legendary bitterness, and the floor\'s permanent coffee smell, hide everything.',
    },
    {
      time: '3:25–3:40 PM',
      body: 'Oleandrin takes the heart. He tries to stand and goes down behind the frosted half of the Glass Room. At 3:31, Shashwat passes and sees him "head down over his notes." The floor is six desks of headphones.',
    },
    {
      time: '3:55 PM',
      body: 'Aarohi comes for the speaker and sees him through the glass. Kursheeth does CPR for eleven minutes and knows by minute two. "Query poisoning" is his sentence before it is the paramedic\'s.',
    },
    {
      time: '4:30 PM',
      body: 'Inspector Kale seals floors one to three and the terrace. The gate register shows zero exits since 1 PM — the company Ubers don\'t even start until six. All five of them are still in the building, in five different departments.',
    },
  ],

  misdirection: [
    'Twelve people had real, provable motives. Seven of them were innocent: Victor, Sukhans, Aarohi, Nehal, Prerna, Adithya and Luke. A complete single-killer case could be built against any one of them, and most of the room built one.',
    'Victor was framed outright. The Zenlyt onboarding pack naming him was manufactured on Wednesday at 11:58 PM — a fact that lives in file metadata, which is the one place a forged history cannot be backdated. His real, mundane crime was pride: he would not say the phone-booth call was a client tearing into his ROAS.',
    'Sukhans looked guiltiest and was cleanest. He hired the victim, argued against the audit\'s extension in front of witnesses, and spent the window alone twenty feet from the Glass Room — on an investor call that his calendar, the investor, and Ishan\'s line of sight through the cabin glass all confirm. The full Wednesday quote, which only Himanshu heard, ends with Elias saying "then we burn."',
    'The window trap: the room spent the night asking who was near Dev between 3:12 and 3:40 — but the murder was committed at 2:52, armed at 8:12 AM, and planned on Wednesday. The question that breaks the case is not "who was on the third floor when he drank?" It is "who needed the machine to work today?"',
    'The killers sat in five departments — payments, engineering, ops, support, marketing — so no team-shaped theory ever closed. And every anomaly of the day was engineered to look like the company\'s normal weather: a repair, an outage, an alert, a courier. At TripleSpeed, chaos is the uniform. They wore it.',
  ],

  proof: [
    { clue: 'Toxicology Summary', proves: 'The food, the machine and the sachets were clean. The poison was in one vessel — his own tumbler — before the coffee hit it.' },
    { clue: 'Tumbler and Coffee-Nook Analysis', proves: 'A resin film below the coffee line, and a brew counter with an unclaimed 2:52 PM pull: someone armed the tumbler and tested the machine during the incident.' },
    { clue: 'Camera and Network Log', proves: 'The afternoon camera gap was scheduled at 11:31 AM. A blackout booked three hours ahead is an appointment, not an outage.' },
    { clue: 'Badge and Lift Trace', proves: 'Dead visitor badge V-07 rode the service lift to Floor 3 at 2:52 and back at 2:54 — a log built to name a visitor who was not in the building.' },
    { clue: 'Coffee Machine Service Ticket', proves: 'The machine was never broken — its valve was shut two weeks early and reopened by appointment. The victim\'s ritual was managed, not lucky.' },
    { clue: 'Vendor Dossier Mismatch', proves: 'The pack naming Victor was created Wednesday 11:58 PM. The frame predates the murder by two days — someone chose the fall guy in advance.' },
    { clue: 'Payment Alert Trace', proves: 'The 2:47 alert was a sandbox replay fired from inside the building. The incident that scattered the party was staged.' },
    { clue: 'Terrace Planter Survey', proves: 'The poison grew on the terrace. Fresh cuts, washed secateurs, and a pruning log missing its last page — harvested in-house, this week.' },
    { clue: "Dev's Recovered Draft", proves: 'Five roles — HoP, TL, OE, CS-O, MB — and a margin note clearing Victor. The report survived its author.' },
    { clue: 'Company Uber Dashboard', proves: 'The 8:37 shared ride with a four-minute stop at Giles\'s gate — the handoff, logged by the company\'s own perk.' },
    { clue: 'Goods-Received Ledger Analysis', proves: 'Eight colleagues’ signatures traced onto delivery notes, and one genuine second signature in the same confident hand for eleven months — the person who kept confirming that nothing arrived.' },
    { clue: 'Workspace and Systems Audit', proves: 'One nameless admin session deleted the draft, booked the camera gap and armed the badge — three jobs, one chair, one keyholder.' },
    { clue: 'Recovered Group Chat', proves: 'Five members, five roles, one Wednesday evening. Coordination across departments, in their own words.' },
    { clue: 'The Settlement Archive', proves: 'The beneficiary one letter off the company\'s name, and provider confirmation that every "payment issue" was invented in-house — including the 2:47 alert.' },
  ],
};
export const CASE_FILES = [
  {
    id: 'f_incident',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: '21 August 2026',
    content: 'BENGALURU CITY POLICE - INDIRANAGAR DIVISION\n\nINCIDENT TYPE: Suspected unnatural death\nDECEASED: Dev Malhotra - independent consultant engaged by TripleSpeed (Chimp Processing Pvt Ltd)\nLOCATION: Third-floor meeting room ("Glass Room"), Midford KTR2, Indiranagar\nFOUND: 3:55 PM | DECLARED DEAD: 4:14 PM\n\nSUMMARY:\nThe deceased collapsed in a closed meeting room during the company\'s Onam celebration, shortly after drinking coffee from the third-floor machine. Paramedics noted a presentation inconsistent with simple cardiac arrest ("query poisoning"). Floors one to three and the terrace were sealed at 4:30 PM.\n\nThe building\'s gate register and badge system confirm no person left between 1:00 PM and the seal. All 69 staff present remain on site.\n\nPERSONS OF INTEREST: Cross-referencing the terrace livestream, party photographs and the badge log, 34 staff members cannot be continuously placed on the terrace between 2:45 and 3:25 PM. All 34 are treated as persons of interest until eliminated.\n\nLEAD INVESTIGATOR: Inspector Arjun Kale\nSTATUS: Active investigation',
    stamped: true,
    roundReq: 0,
  },
  {
    id: 'f_postmortem',
    type: 'REPORT',
    title: 'PRELIMINARY TOXICOLOGY',
    date: '21 August 2026',
    content: 'FORENSIC SCIENCE LABORATORY - BENGALURU\nFIELD SCREEN - PRELIMINARY. Full panel to follow.\n\nCAUSE OF DEATH: Acute cardiac glycoside poisoning, consistent with concentrated oleandrin\nSOURCE: The deceased\'s personal steel tumbler - dosed while empty, before the 3:15 PM pour\n\nFINDINGS:\n- Blood and gastric contents positive for oleandrin\n- Coffee machine tank, hopper, drip tray: NEGATIVE\n- Sugar sachets: NEGATIVE\n- All catering dishes: NEGATIVE\n\nCONCLUSION:\nThe poison was not in the food, the machine or the supplies. It was in one man\'s cup, and only his.',
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_devicelog',
    type: 'REPORT',
    title: 'BUILDING SYSTEMS LOG',
    date: '21 August 2026',
    content: 'MIDFORD KTR2 - DEVICE SUMMARY\n\n11:04 AM - Network outage; camera NVR reinitialized, the whole fourteen-day array lost\n11:31 AM - NVR "maintenance restart" scheduled for 2:45 PM, from an administrative session\n2:45-3:21 PM - All cameras blind, per that schedule\n2:52 PM - Retired visitor badge V-07 rides the service lift to Floor 3 and back\n\nNo building-wide power event occurred. The afternoon camera gap was created deliberately, in the morning, by someone with administrative access.',
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_engagement',
    type: 'REPORT',
    title: 'CONSULTING ENGAGEMENT LETTER',
    date: '31 July 2026',
    content: 'ENGAGEMENT LETTER - EXTRACT\nRecovered from the deceased\'s files.\n\nDev Malhotra was engaged by the founders on 31 July for "revenue assurance and margin-leak analysis," reporting to Elias and Sukhans only. The internal description of his role - "payments-migration consultant" - was a cover story agreed with the founders.\n\nAttached scheduling note, in the deceased\'s hand: "Friday 4 PM. Findings, not process. Names, not numbers. Nine chairs."\n\nThe Onam-evening "Ways of Working toast" was a findings briefing. Somebody\'s name was on Friday\'s agenda.',
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_ledger',
    type: 'REPORT',
    title: 'MARGIN-LEAK SUMMARY',
    date: 'June-August 2026',
    content: 'FINANCIAL REVIEW EXTRACT - COMPILED FROM THE DECEASED\'S WORKING PAPERS\n\nEstimated diversion: ₹3.4 crore across 14 months, via four channels:\n\n1. Payment-provider rolling-reserve releases to a look-alike beneficiary account\n2. Compute purchased through a marked-up third-party "cloud partner"\n3. A ghost vendor ("Zenlyt Productions LLP") invoicing work that never occurred - written off in May as an external scam, then rebooted under a new name ("Kirola Studios")\n4. A reseller ad account skimming approximately 12% of media spend\n\nEvery channel was masked as one of the company\'s routine problems: provider issues, AWS billing shocks, a scammer vendor, weak ROAS. Whoever killed Dev Malhotra did so three days before this summary was scheduled to be read aloud.',
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_gatelog',
    type: 'REPORT',
    title: 'GATE AND MOVEMENT REGISTER',
    date: '21 August 2026',
    content: 'BASEMENT GATE REGISTER + BADGE RECONCILIATION\n\n- All 69 staff badged in between 8:20 and 9:40 AM; the deceased arrived at 8:55 AM\n- Zero exits between 1:00 PM and the 4:30 PM seal\n- Deliveries during the window: one catering top-up (signed 2:50 PM), one food delivery collected at the gate (2:55 PM), one courier pickup (3:00 PM), one courier delivery (3:20 PM - entry found at the top of the register\'s next page)\n- Company Ubers do not operate between 9 AM and 6 PM; no staff cab was booked or taken\n\nCONCLUSION: Whoever killed Dev Malhotra was inside the building when he died - and is still inside it now.',
    stamped: true,
    roundReq: 4,
  },
];

export const CLUE_DB = [
  ...ACCUSATION_CLUES,
  ...MOTIVE_CLUES,
  ...EVIDENCE_CLUES,
  ...REVELATION_CLUES,
  CONFESSION_CLUE,
];

export const CLUE_STACKS = [
  { key: 'accusations', opensAt: 1, clues: ACCUSATION_CLUES },
  { key: 'motives', opensAt: 2, clues: MOTIVE_CLUES },
  { key: 'evidence', opensAt: 3, clues: EVIDENCE_CLUES },
  { key: 'revelations', opensAt: 4, clues: REVELATION_CLUES },
];

export const CLUE_STACK_BY_KEY = Object.fromEntries(CLUE_STACKS.map((stack) => [stack.key, stack]));

export const stackKeyForClue = (clueId) =>
  CLUE_STACKS.find((stack) => stack.clues.some((clue) => clue.id === clueId))?.key ?? null;

// ---------------------------------------------------------------------------
// The riddle lock (components/modals/RiddleModal.jsx, data/riddles.js)
//
// Clue codes arrive by solving a riddle: solve one, and the next clue in *your*
// queue unseals, code and all, which you are then free to shout across the room.
//
// Accusations are not in the pool. Every player is already dealt exactly one
// automatically the moment Round 1 opens, and the confession belongs to the
// killers alone — neither is something to be won. What is left is the three
// decks that carry the case: motives, evidence, revelations.
// ---------------------------------------------------------------------------
export const RIDDLE_REWARD_POOL = [...MOTIVE_CLUES, ...EVIDENCE_CLUES, ...REVELATION_CLUES];

/**
 * The round ASK appears on the Evidence screen — Round 2 as the decks stand.
 *
 * Derived rather than typed, because it is not a design preference: the lock can
 * only pay out a clue whose round has already opened, so until the earliest
 * reward in the pool is reachable `nextRiddleReward` returns null and the modal
 * has nothing to deal. A button whose only possible answer is "not yet" costs
 * the player a tap and teaches them the wrong thing about the control, so it
 * stays off screen until it can pay. Move a reward earlier and ASK follows it.
 *
 * Rounds 00–01 are the briefing and the accusation each player is dealt
 * automatically — neither is won, so nothing is lost by the button being absent.
 */
export const ASK_OPENS_AT = Math.min(...RIDDLE_REWARD_POOL.map((clue) => clue.roundReq));

/**
 * The order this player earns clues in — stable for them, different from
 * everybody else's.
 *
 * Stable, because a player who solves three riddles and then reloads must not
 * find the fourth reward reshuffled underneath them. Different per player,
 * because if all 69 devices paid out in the same order the room would hold 69
 * copies of the same clue and nobody would have a reason to trade a code. The
 * per-player offset is what turns solving into circulation.
 *
 * Round order comes first regardless: a clue is unreachable until its round
 * anyway, so grouping by round means the queue never stalls behind a Round 5
 * revelation while Round 2 motives sit further down it.
 *
 * Within a round the queue is the deck **rotated** by the player's ordinal, not
 * sorted by a per-player hash. Both are stable and both differ between players,
 * but a hash sort only randomises the order — it does not spread the *first*
 * reward, and that is the one that matters, because most players will solve one
 * or two riddles all evening. (Measured on the previous 51-player case: a hash
 * sort paid one killer-relevant motive out first to exactly 1 player while
 * another code opened for 8.) The offset has to be an **ordinal** — the
 * player's position in a stable shuffle of the roster, 0 to 68 — because
 * consecutive integers are what make `% blockLength` uniform. 69 players over a
 * 12-card motive block is then five or six openers per code by construction,
 * with no hash luck left in it.
 */
const RIDDLE_ORDINAL = new Map(
  ROSTER.map((character) => character.id)
    .sort((a, b) => seeded('riddle', a) - seeded('riddle', b))
    .map((id, index) => [id, index])
);

export const riddleQueueFor = (characterId) => {
  const blocks = new Map();
  for (const clue of RIDDLE_REWARD_POOL) {
    if (!blocks.has(clue.roundReq)) blocks.set(clue.roundReq, []);
    blocks.get(clue.roundReq).push(clue);
  }

  // One ordinal for the whole player, applied modulo each block's own length.
  // The blocks are 12, 8, 4 and 2 cards.
  const offset = RIDDLE_ORDINAL.get(characterId) ?? 0;

  return [...blocks.keys()]
    .sort((a, b) => a - b)
    .flatMap((round) => {
      const block = blocks.get(round);
      const start = offset % block.length;
      return [...block.slice(start), ...block.slice(0, start)];
    });
};

/**
 * The clue the next solved riddle will pay out, or null when this player has
 * everything the round has to give. The modal checks this *before* dealing a
 * riddle — asking someone to think for two minutes and then telling them there
 * was no prize is the one outcome this feature cannot produce.
 */
export const nextRiddleReward = (characterId, currentRound, ownedClueIds = []) => {
  const owned = new Set(ownedClueIds);
  return (
    riddleQueueFor(characterId).find(
      (clue) => clue.roundReq <= currentRound && !owned.has(clue.id)
    ) ?? null
  );
};

/** How many of the pool are reachable this round — the denominator on the modal. */
export const riddleRewardsInPlay = (currentRound) =>
  RIDDLE_REWARD_POOL.filter((clue) => clue.roundReq <= currentRound).length;

export const getAssignedAccusation = (characterId) => {
  return ACCUSATION_CLUES.find((accusation) => accusation.assignedTo.includes(characterId));
};

export const getSuspects = () => {
  return CHARACTERS.filter((character) => character.isSuspect);
};

export const getWitnesses = () => {
  return CHARACTERS.filter((character) => !character.isSuspect && character.role !== 'MURDERER');
};

/**
 * The killer team, **mastermind first**.
 *
 * Membership is still `role === 'MURDERER'` — that stays the single source of
 * truth — but the order comes from KILLER_IDS, which is written mastermind-first.
 * Roster order is not: the reveal overlay labels `killers[0]` MASTERMIND, so the
 * one screen that names the conspiracy must credit the right person for it, in
 * agreement with slide 09 of the deck a few taps later. Anyone flagged MURDERER
 * but absent from KILLER_IDS still appears, after the named five, rather than
 * dropping out of the reveal entirely.
 */
export const getKillers = () => {
  const rank = (id) => {
    const index = KILLER_IDS.indexOf(id);
    return index < 0 ? KILLER_IDS.length : index;
  };
  return CHARACTERS.filter((character) => character.role === 'MURDERER').sort(
    (a, b) => rank(a.id) - rank(b.id)
  );
};

export const isMurderer = (characterId) => {
  return getKillers().some((character) => character.id === characterId);
};

export const LOGIN_CODE_MAP = Object.fromEntries(
  CHARACTERS.map((character) => [character.code.trim().toUpperCase(), character.id])
);

export const validateLoginCode = (code) => {
  const upperCode = code.trim().toUpperCase();
  return LOGIN_CODE_MAP[upperCode] || null;
};
// Login codes, clue codes and riddle answers are three namespaces reachable
// from the same keyboards, so they are one namespace. The previous case shipped
// (briefly) with motive codes that were also login codes, and riddle answers
// that were both — either would hand a player somebody else's identity or a
// free clue. Nothing in the app complains at runtime, so this does.
//
// Dev-only and non-fatal: a live game must never be taken down by a data
// assertion, but a build that reintroduces an overlap should be impossible to
// miss locally.
if (import.meta.env?.DEV) {
  const loginCodes = new Set(Object.keys(LOGIN_CODE_MAP));
  if (loginCodes.size !== ROSTER.length) {
    console.error(
      `[gameData] duplicate login codes: ${ROSTER.length} characters share ${loginCodes.size} codes. ` +
        'Two players would resolve to one identity.'
    );
  }

  const collisions = CLUE_DB.map((clue) => clue.code).filter((code) => loginCodes.has(code));
  if (collisions.length > 0) {
    console.error(
      `[gameData] ${collisions.length} clue code(s) are also login codes: ${collisions.join(', ')}. ` +
        'Anyone who hears one of these can log in as that character. Rename the clue code.'
    );
  }

  const clueCodes = CLUE_DB.map((clue) => clue.code);
  const duplicates = clueCodes.filter((code, index) => clueCodes.indexOf(code) !== index);
  if (duplicates.length > 0) {
    console.error(`[gameData] duplicate clue codes: ${[...new Set(duplicates)].join(', ')}`);
  }

  // The statement pods must partition the roster exactly — every player in
  // exactly one pod, so getAssignedAccusation never returns undefined — and a
  // pod must never be dealt the accusation naming its own member.
  const podded = Object.values(PODS).flat();
  const rosterIds = new Set(ROSTER.map((c) => c.id));
  const missing = [...rosterIds].filter((id) => !podded.includes(id));
  const strays = podded.filter((id, i) => !rosterIds.has(id) || podded.indexOf(id) !== i);
  if (missing.length > 0 || strays.length > 0) {
    console.error(
      `[gameData] pods do not partition the roster. Missing: ${missing.join(', ') || 'none'}. ` +
        `Duplicated/unknown: ${strays.join(', ') || 'none'}.`
    );
  }
  const selfAccused = ACCUSATION_DECK.filter((acc) => acc.assignedTo.includes(acc.targetSuspect));
  if (selfAccused.length > 0) {
    console.error(
      `[gameData] accusation dealt to its own target's pod: ${selfAccused.map((a) => a.id).join(', ')}.`
    );
  }

  // Riddle answers are the third namespace reachable from a keyboard.
  //
  // Imported dynamically so the 100-riddle deck is never pulled into gameData's
  // module graph in a production build — `import.meta.env.DEV` is compiled to
  // `false`, so this whole block is dropped rather than tree-shaken on faith.
  import('./riddles')
    .then(({ RIDDLES }) => {
      const spoken = new Set();
      for (const riddle of RIDDLES) {
        spoken.add(riddle.a.toUpperCase());
        for (const alt of riddle.alt ?? []) spoken.add(alt.toUpperCase());
      }
      const leaked = [...loginCodes, ...clueCodes].filter((code) => spoken.has(code));
      if (leaked.length > 0) {
        console.error(
          `[gameData] ${leaked.length} code(s) are also riddle answers: ${leaked.join(', ')}. ` +
            'Anyone who solves that riddle can type the word into the decoder or the login screen. ' +
            'Rename the riddle answer (riddles.js), not the code.'
        );
      }
    })
    .catch(() => {
      // The check is a convenience, never a dependency. A resolution failure
      // must not take the module down.
    });
}

export const HOST_SCRIPT = [
  {
    id: 'pregame',
    title: 'Pre-Game · Welcome',
    duration: '~5 min',
    setup: `Before you start: confirm all ${CASE_META.playerCount} players have arrived and have their printed login cards. There are no clue cards to hand out - clues are won in the app by solving riddles, and the codes spread from player to player. Your only job on distribution is to keep telling the room to share.`,
    announce: `"Welcome to the office - or, as the police report calls it, the scene. The date is ${CASE_META.date}: Onam. This afternoon, between the sadhya and the evening toast, a consultant named Dev Malhotra died on the third floor, and the building was sealed with all ${CASE_META.playerCount} of us inside it.\n\nYour phone is your case file. Log in with the code on your card. Nobody is going to hand you evidence tonight - you earn it. From Round 2 a button marked ASK appears on your Evidence screen. Tap it and you get a riddle, nothing to do with this case. Solve it and a new clue unseals on your phone, along with a code. Read that code out and everybody who types it into CODE gets the same clue. Stay in character. Share carefully. Lie if you have to. The room wins only if it names the right team, not just the loudest suspect."`,
    during: 'Help late arrivals log in and point everyone toward their Identity and Story screens before the first vote. ASK is not on their screens yet - it appears when you advance to Round 2 - so tell them the loop now and let the button arrive to a room that already knows what it is for. If anyone goes hunting for it early, that is the answer.',
    end: 'When the room is settled, advance to Round 0 and let the briefing play.',
  },
  {
    id: 0,
    title: 'Round 0 · The Incident',
    duration: '10-15 min',
    setup: 'The Incident Report is unlocked by default. Once the room has read the story, open voting for the blind first ballot.',
    announce: `"Round 0. The Incident. Dev Malhotra was found in the third-floor Glass Room at 3:55 PM and declared dead at 4:14. The paramedic wrote two words on the sheet: query poisoning. Nobody has left the building since 1 PM, and nobody is leaving now.\n\nOpen Story first. Then open Evidence and read the Incident Report in Case Files. Thirty-four of us cannot be placed on the terrace when it mattered. Open Guests and look around the room. When I open the ballot, cast your first blind vote before anyone has earned certainty."`,
    during: 'Let the room meet each other in character. Once they have read the briefing, open voting for a quick blind first vote and then close it before Round 1.',
    end: 'Advance to Round 1 when the first vote is in and the room has started accusing out loud.',
  },
  {
    id: 1,
    title: 'Round 1 · Accusations',
    duration: '~15 min',
    setup: 'No physical cards here. Every player automatically receives one accusation on the Evidence screen the moment Round 1 starts - the witness claim their statement pod was handed.',
    announce: '"Round 1. Accusations. Open Evidence and read the accusation waiting for you. These are witness claims about the twelve people the police consider prime suspects. Your pod was given one of them. Use it loudly, quietly, honestly, or not at all - and remember most pods share their card with five other people, so the same claim is out there more than once. Compare versions. Let the map get messy."',
    during: 'Push conversation across teams and floors. If the room goes quiet, ask any player to read their accusation aloud.',
    end: 'Advance to Round 2 when the suspect map feels alive and messy.',
  },
  {
    id: 2,
    title: 'Round 2 · Motives',
    duration: '~15-20 min',
    setup: 'Nothing to hand out. The riddle lock opens itself the moment Round 2 starts - the ASK button appears on every Evidence screen, and knocks once the first time each player looks at it - and the twelve motive files are now the prize pool. Every player is working down a different order, so the room cross-pollinates on its own - as long as they share.',
    announce: '"Round 2. Motives. The riddle lock is live - open Evidence and you will see a second button, ASK, that was not there a minute ago. Tap it, solve the riddle, and you get one of twelve motive files - plus a code. Read the code out. Everyone else types it into CODE and gets the same file. Nobody is holding the same clue as the person next to them, so the only way this room sees all twelve is if you keep talking. Share them. Distort them. Protect yourself with them if you need to."',
    during: 'If anyone cannot find ASK or CODE, remind them both live bottom right on the Evidence screen. Watch for players hoarding codes - call it out warmly and often.',
    end: 'Advance to Round 3 when the room has moved from gossip to real theory.',
  },
  {
    id: 3,
    title: 'Round 3 · Evidence',
    duration: '~15-20 min',
    setup: 'Unlock the Round 3 case files and reopen voting for the first evidence-backed ballot. The 8 evidence clues join the riddle pool automatically - no cards, no distribution.',
    announce: '"Round 3. Evidence. Open Case Files inside Evidence. The toxicology is in: it was the coffee - his cup, and only his cup. The machine was clean. The food was clean. Eight forensic files have just entered the riddle pool - the toxicology, the tumbler, the cameras, the badge log, the service ticket, the vendor file, the alert, the hedge. Go and earn them, and pass the codes on. Voting is open again."',
    during: 'This is where the heart-attack and catering theories should collapse. Let the room work out that the window everyone is arguing about may not be the window that matters.',
    end: 'Advance to Round 4 when they begin asking who controlled the machine, the cameras, and the paperwork.',
  },
  {
    id: 4,
    title: 'Round 4 · Revelations',
    duration: '~15-20 min',
    setup: 'Unlock the Round 4 case files. The first four Revelation clues enter the riddle pool on their own the moment the round advances.',
    announce: '"Round 4. Revelations. The story flips here. Dev was not auditing a process - he was three days from reading names, and his draft survived him. Four revelations are in the riddle pool: the draft, the Uber dashboard, the admin audit, the signatures. You are no longer solving one grudge. You are solving overlap."',
    during: 'Listen for the room to move from one-suspect theories toward linked roles across departments.',
    end: 'Advance to Round 5 once at least one group starts suspecting coordination across teams.',
  },
  {
    id: 5,
    title: 'Round 5 · Finale',
    duration: '~10-15 min',
    setup: 'The final two Revelation clues unlock in the riddle pool automatically. Keep voting open or reopen it if you want a last locked-in ballot before the reveal.',
    announce: '"Round 5. Finale. The last two revelations are in the pool - somebody solve them and get those codes into the room. If you only name one person, you are still wrong. Work out who planned it, who grew it, who carried it, who blinded the cameras, and who wrote the lie for afterwards. Five jobs. Name the team."',
    during: 'Push the room to name a full team, not just the mastermind.',
    end: 'Advance to Round 6 when the theories converge on a complete answer.',
  },
  {
    id: 6,
    title: 'Round 6 · The Reveal',
    duration: '~5 min',
    setup: 'Close voting, optionally show the tally, then trigger the reveal.',
    announce: '"Round 6. The Reveal. Last calls. Lock your answer in. When I trigger the reveal, the room gets the truth all at once."',
    during: 'Read the killers aloud after the screen lands if you want the answer held longer in the room.',
    end: 'Trigger the reveal when you are ready to end the case.',
  },
];
