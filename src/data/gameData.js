// --- GAME DATA: THE EMBER BIRTHDAY CASE ---

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
// first so the data stays readable, and the per-suspect clue decks follow the
// same sequence. Rendered as-is that put Sneha at the top of the roster, the
// ballot, the accusation stack and the motive stack, which is a tell before a
// single clue is decoded.
//
// `dealt()` re-orders a list by hashing each entry's id. The jumble is *stable*:
// every player, on every device and every reload, gets the same sequence, so
// "the third one" in chat still means the same person, and a guest's file
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
// `acc_sneha` and `mot_sneha` differ by a fixed prefix of the same length, so a
// concatenated salt shifts every hash in a deck by the same constant and leaves
// the relative order identical — the accusation and motive stacks would come
// out in the same sequence. XOR plus an avalanche step decorrelates them.
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
  killer({
    id: 'char_sneha',
    name: 'Sneha Ganesh',
    profession: 'Strategy consultant and fashion-label founder',
    group: 'THIMBLE',
    bio: "One of Armaan Khanna's oldest friends. The person he called whenever the numbers, the mood, or the guest list needed to look calmer than they really were.",
    quirk: 'Can act, tailor a jacket seam, and steal a pen without anybody noticing the moment it went missing.',
    secret: 'You are one of the five people who killed Armaan Khanna, and the plan was yours. Nobody in this room can be allowed to prove it. Your smaller secret: klepto tendencies, which Armaan found charming right up until they threatened him.',
    neverDo: 'Betray someone who trusted me first.',
    motive: "Sneha built the expansion model Armaan used to sell Velvet Ember's buyout story. The model was real; the side letters hiding kickbacks were not. Two days before the party, she learned Armaan planned to hand the Monday audit a binder that painted her as the architect of the fraud while he walked away with a retention bonus and a birthday headline.",
    timeline: '7:05 PM - Arrived early with the seating plan Armaan wanted rearranged.\n9:50 PM - In the upstairs booth arguing with Armaan over a red folder marked MONDAY.\n10:08 PM - Standing near the listening-room doors when the tribute video froze.\n10:12 PM - Raised her own glass but never looked at Armaan when he drank.',
    code: 'THIMBLE',
  }),
  killer({
    id: 'char_kiyaah',
    name: 'Kiyaah Rose Raghuwanshi',
    profession: 'Psychologist and nightlife bartender',
    group: 'ORACLE',
    bio: 'Armaan loved introducing Kiyaah as the only person in the room who could read him. He kept inviting her anyway.',
    quirk: 'Can profile a stranger in two minutes and pour a drink to match the lie they are telling.',
    secret: 'You are one of the five people who killed Armaan Khanna, and yours was the hand that gave him the glass. Play innocent all night. Your older secret: your father disappeared years ago, and you know more about that night than you say.',
    neverDo: 'Take orders from a man just because he is louder.',
    motive: "Kiyaah designed the private tasting ritual Armaan used to seduce investors: smoked glass, a single clear cube, and the orange-mist finish he called theater. He stole the whole program, scrubbed her name from it, and used grief-session confessions about her father to keep her compliant whenever she pushed back.",
    timeline: '7:40 PM - Came in through the service entrance because Armaan asked her to inspect the private bar.\n9:58 PM - Behind the tasting counter walking staff through the Last Light garnish sequence.\n10:06 PM - Collected a wrapped service roll from the prep pass while the room watched the tribute reel.\n10:08 PM - Off camera for less than two minutes during the projector reboot.\n10:12 PM - Handed Armaan the only drink nobody else was allowed to touch.',
    code: 'ORACLE',
  }),
  killer({
    id: 'char_victoria',
    name: 'Victoria Vance',
    profession: 'Forensic and tax mitigation specialist',
    group: 'FORGERY',
    bio: "Came into Armaan's orbit as a fixer and stayed because his messes kept getting more expensive to survive.",
    quirk: 'Can copy a signature so cleanly that people trust the ink more than the person.',
    secret: 'You are one of the five people who killed Armaan Khanna, and you are the one who made the paperwork behind it look ordinary. Admit nothing. Your other secret: you have siphoned money out of clients who never realized their adviser was the thief in the room.',
    neverDo: 'Admit guilt before I know the whole board.',
    motive: "Victoria structured excise cleanups, customs rebates, and reimbursements Armaan preferred not to explain twice. On Tuesday she discovered he had forged her sign-off on three shell-company ledgers and was about to let investigators find them first. He needed a scapegoat with expensive taste and good handwriting. She was the obvious choice.",
    timeline: "8:05 PM - Arrived with a cream envelope and did not let it out of sight.\n9:42 PM - In the venue's back office while Armaan initialed documents and swore at her for demanding every page.\n10:06 PM - Walked past the private bar carrying a supplier folder.\n10:24 PM - Told the first officer to seize the inventory logs before anyone else touched them.",
    code: 'FORGERY',
  }),
  killer({
    id: 'char_roddy',
    name: 'Roddy Faustus',
    profession: 'Apothecarist',
    group: 'HEMLOCK',
    bio: "Supplies botanicals to half the city's self-appointed connoisseurs. Speaks like a man translating from a dead century.",
    quirk: 'Practices toxicology as if it were philosophy and remembers every plant by the damage it can do.',
    secret: 'You are one of the five people who killed Armaan Khanna, and the poison in that glass came out of your case. Let the room chase anyone but you. Your other secret: a private fortune set aside for the day you finally decide who deserves it.',
    neverDo: 'Harm an animal that never volunteered to be in the experiment.',
    motive: "Roddy developed the original bittering base for Velvet Ember's limited botanical line. Armaan copied the notebook, cheapened the formula, and then floated the idea of patenting the entire line under company ownership. Roddy knew exactly what kind of rage a theft like that should produce.",
    timeline: '7:25 PM - Arrived with a gift box of rare botanicals that never reached the gift table.\n9:30 PM - Spoke to Armaan beside the stage rail and did not smile once.\n10:02 PM - Took the case into the prep-room corridor.\n10:05 PM - Back on the floor without it, and without the wrapped service roll that had been inside it.\n10:22 PM - Already kneeling by the body before the room finished screaming.',
    code: 'HEMLOCK',
  }),
  killer({
    id: 'char_oindrilla',
    name: 'Oindrilla Chatterjee',
    profession: 'AI and digitalization lead',
    group: 'AMBER',
    bio: 'Competitive, polished, and better with systems than with fools. Armaan liked that right up until the systems started remembering too much.',
    quirk: 'A fragrance obsessive who also knows exactly how every access log in a room should read.',
    secret: 'You are one of the five people who killed Armaan Khanna, and you are the one who took the room\'s eyes off him. Deny it calmly. Your other secret: four international trips with a coworker you could not stand taught you how convincingly you can perform affection.',
    neverDo: 'Lose because I was slow.',
    motive: "Oindrilla built Velvet Ember's event dashboard, QR access flow, and loyalty-data layer. Armaan reused her tools to watch employees, scrub stock movement, and stage scarcity. When a warehouse discrepancy surfaced, he started drafting a memo that blamed the entire breach on her admin credentials.",
    timeline: '7:15 PM - Arrived early to test the tribute reel and guest check-in scanner.\n9:57 PM - In the sound booth when the birthday montage began.\n10:08 PM - Logged an unexplained reboot from the event-admin terminal.\n10:13 PM - Back in the crowd before anyone finished complaining that the music had glitched.',
    code: 'AMBER',
  }),
  suspect({
    id: 'char_tara',
    name: 'Tara Singhania',
    profession: 'Art dealer and provenance broker',
    group: 'CANVAS',
    bio: 'Knows how to make expensive things sound inevitable. Armaan adored borrowing that skill.',
    quirk: 'Can identify perfume at a distance and tell whether the wearer wants to be noticed.',
    secret: 'I have bid against my own clients to drive prices up when they were too trusting to notice.',
    neverDo: "Reveal a collector's secrets just because someone begs well.",
    motive: "Tara sourced the vintage mirrors, posters, and private-collection bottles that made Velvet Ember feel older and richer than it was. Armaan slipped counterfeit provenance into one of her consignments, pocketed the margin, and hinted that customs would find her name first if anybody got curious.",
    timeline: '7:50 PM - Arrived with a lacquered gift crate no one was allowed to open early.\n9:35 PM - Cornered Armaan about a missing customs seal.\n10:10 PM - Near the record wall when the projector cut out.\n10:21 PM - Said the drink smelled wrong, then said it again louder when nobody moved.',
    code: 'CANVAS',
  }),
  suspect({
    id: 'char_tanvi',
    name: 'Tanvi Vartak',
    profession: 'Educational game designer',
    group: 'PIXEL',
    bio: 'Builds playful systems for a living and notices patterns people wish stayed invisible.',
    quirk: 'Can reconstruct a timeline from one blurry repost, two reflections, and a badly cropped story.',
    secret: 'I have used that pattern-matching skill in the wild once already, and definitely not for noble reasons.',
    neverDo: 'Sign up for discipline just because somebody called it fitness.',
    motive: "Armaan hired Tanvi to design a launch-game for Velvet Ember's buyer weekend, then quietly reused her unpaid prototypes to track competitor behavior online. When she told him to stop, he threatened to leak the screenshots she had pieced together and call her a stalker with a hobby.",
    timeline: "7:30 PM - Arrived with the guest trail cards for Armaan's birthday game.\n9:48 PM - Walking the floor, adjusting who stood where for the cake reveal.\n10:07 PM - Told two guests not to block sightlines to the bar.\n10:23 PM - Started listing time stamps before the police even asked.",
    code: 'PIXEL',
  }),
  suspect({
    id: 'char_rishi',
    name: 'Rishi Raj Rahul',
    profession: 'Recruitment-tech founder and professional storyteller',
    group: 'MYTHOS',
    bio: 'Turns every room into an audience if you leave him unchecked for three minutes.',
    quirk: 'Pushes boundaries for sport and rarely notices the line until he is leaning over it.',
    secret: 'Claims not to have one, which is only convincing if you have never watched him dodge a direct answer.',
    neverDo: 'Kill a cat.',
    motive: "Rishi spent six months helping Armaan staff the growth story around the buyout. Armaan took the shortlist, poached the talent, and let the board believe Rishi's platform inflated its numbers. He did it with enough deniability that Rishi could rage about it all night and still struggle to prove exactly where the knife had gone in.",
    timeline: '8:10 PM - Arrived late and loud, midway through a call with Mumbai.\n9:40 PM - Out in the back lane with Armaan, voices carrying.\n10:11 PM - Back at the bar asking who had touched the investor deck.\n10:26 PM - Told three different people three different versions of what he saw.',
    code: 'MYTHOS',
  }),
  suspect({
    id: 'char_vinod',
    name: 'Vinod Raghuwanshi',
    profession: 'Chief Minister and political operator',
    group: 'REGENT',
    bio: 'Power suits him too well. Even at a birthday party he looks like he expects legislation to move around him.',
    quirk: 'Calls hacking a hobby and says the dangerous part is how easy most doors are.',
    secret: 'My official answer is that I have not done it.',
    neverDo: 'Leave leverage on the table.',
    motive: "Velvet Ember's expansion licenses moved faster than they should have because Vinod made calls Armaan promised would stay private. Lately Armaan had started recording those conversations and hinting that one leaked clip could solve several of his own regulatory problems.",
    timeline: '8:00 PM - Arrived with security already irritated.\n9:28 PM - In the back lane with Armaan and nobody else.\n10:09 PM - On the phone by the courtyard, back turned to the bar.\n10:24 PM - Tried to walk out before the first officer shut the gates.',
    code: 'REGENT',
  }),
  suspect({
    id: 'char_anna',
    name: 'Anna Russo',
    profession: 'Travel writer, collector, and social fraudster',
    group: 'REPLICA',
    bio: 'Moves through rooms like she curated them herself. Armaan treated her taste like a utility.',
    quirk: 'Paints replicas when bored and can make a fake feel more expensive than the original.',
    secret: 'Once painted with blood from a dead animal because the story felt impossible to waste.',
    neverDo: 'Con someone whose losses would actually ruin them.',
    motive: "Anna helped Armaan stage collector dinners and transport high-value bottles for publicity. More than once he used her replicas to pad transport-claim paperwork, then kept every document tying the fraud together. The day before the party he hinted that if the buyout got messy, he knew exactly whose name belonged on the insurance trail.",
    timeline: '7:45 PM - Arrived with an art-roll tube and a smile too composed for a birthday.\n9:44 PM - In the back-hall corridor, arguing that one display bottle was not the one she sent.\n10:09 PM - Seen beside the gift table just after the lights flickered.\n10:22 PM - Stayed still long enough to watch everyone else panic.',
    code: 'REPLICA',
  }),
  witness({
    id: 'char_yukta',
    name: 'Yukta',
    profession: 'Teacher',
    group: 'THIMBLE',
    bio: "A soft-spoken teacher Sneha pulled into Armaan's orbit through one of his charity showcases.",
    quirk: 'Can audit a school database faster than most admins can open it.',
    secret: 'Once hacked a school database and still thinks the institution deserved it.',
    neverDo: 'Hurt a child.',
    motive: 'Armaan lifted her reading-lab pitch for a CSR deck and never funded the program he bragged about.',
    timeline: "7:10 PM - Arrived with Sneha's circle.\n9:54 PM - Fixing a frozen sign-in tablet near the guestbook.\n10:12 PM - Saw Tara's lacquered crate sitting too close to the private bar.",
    code: 'CIPHER',
  }),
  witness({
    id: 'char_shubham',
    name: 'Shubham Goyal',
    profession: 'Software engineer',
    group: 'THIMBLE',
    bio: 'Quiet enough to disappear into the wall until a process breaks and suddenly everybody needs him.',
    quirk: 'Can spend an hour comparing robot vacuum cleaners and make it sound like field research.',
    secret: 'I overshare less than most people because the embarrassing details tend to arrive first.',
    neverDo: 'Let confidential papers leak on purpose.',
    motive: 'Armaan circulated a memo Shubham had marked private, then blamed him for not being tougher in the room.',
    timeline: '7:32 PM - Arrived and headed straight for the cooler wall.\n10:04 PM - Heard someone near the bar say orange, not bottle.\n10:21 PM - Watched Armaan miss the rail on his second reach.',
    code: 'VACUUM',
  }),
  witness({
    id: 'char_lakshmi',
    name: 'Lakshmi Godbole',
    profession: 'Babysitter and hobby coder',
    group: 'THIMBLE',
    bio: 'Warm, energetic, and habitually underestimated by rooms full of founders.',
    quirk: 'Sings while debugging and somehow never loses the thread.',
    secret: 'I moonlight as a coder whenever adults start assuming I only babysit.',
    neverDo: 'Get into drugs for someone else\'s story.',
    motive: 'Armaan laughed off the RSVP bug she fixed for him and then presented the workaround as his event team being brilliant.',
    timeline: '7:22 PM - Arrived carrying a backup charging cable and ended up fixing the playlist iPad.\n10:08 PM - Saw Oindrilla at the admin screen when the reel died.\n10:20 PM - Was close enough to hear Kiyaah tell staff to clear the bar.',
    code: 'ADELE',
  }),
  witness({
    id: 'char_ricardo',
    name: 'Ricardo Gauco',
    profession: 'Chef and pairing consultant',
    group: 'THIMBLE',
    bio: 'Cooks with the patience of a monk and the eyes of a man judging every garnish in the room.',
    quirk: 'Will always stop to pet a dog before he finishes a sentence.',
    secret: 'If conversation fails, I can happily talk paddle ball until everyone leaves.',
    neverDo: 'Miss the chance to greet a dog.',
    motive: 'Armaan stole a tasting-menu sequence Ricardo built for a hotel pitch and handed it to a consultant with a cleaner shirt.',
    timeline: "7:35 PM - Arrived with Sneha's table and drifted to the canape station.\n9:59 PM - Heard Kiyaah ask for a fresh orange-oil mister.\n10:20 PM - Noticed Armaan's glass was already nearly empty and that nobody had been allowed near it to refill it.",
    code: 'HOUND',
  }),
  witness({
    id: 'char_fabiola',
    name: 'Fabiola Dsouza',
    profession: 'Teacher',
    group: 'CANVAS',
    bio: 'Funny, curious, and impossible to intimidate once she decides she has seen enough.',
    quirk: 'Treats murder-mystery questionnaires like warm-up stretches.',
    secret: 'I know more than I let on, mostly because people keep speaking around me.',
    neverDo: 'Listen to nonsense without naming it nonsense.',
    motive: 'Armaan promised to sponsor her classroom fundraiser, posted about it, and then vanished the second the invoices arrived.',
    timeline: "7:28 PM - Entered with Tara's group and spent ten minutes admiring the mirror wall.\n9:36 PM - Heard Tara tell Armaan the customs seal was already broken before she touched the crate.\n10:18 PM - Saw him blink hard like the room had tilted.",
    code: 'ECHO',
  }),
  witness({
    id: 'char_govind',
    name: 'Govind Mukundan',
    profession: 'Climate ecosystem builder',
    group: 'CANVAS',
    bio: 'Talks like a strategist, thinks like a systems nerd, drinks coffee like a theology.',
    quirk: 'Treats espresso as both hobby and personality test.',
    secret: 'Sometimes I eat fridge-cold khichdi straight from the bowl and call it efficiency.',
    neverDo: 'Do two late nights in a row for free.',
    motive: 'Armaan wanted sustainability language for the buyout deck, not an actual sustainability plan, and used Govind\'s notes exactly once before ghosting him.',
    timeline: '7:48 PM - Arrived and got trapped in a conversation about climate-washed branding.\n10:05 PM - Saw Roddy leave the prep-room corridor empty handed.\n10:25 PM - Told police the blackout mattered more than the shouting.',
    code: 'ESPRESSO',
  }),
  witness({
    id: 'char_ajay',
    name: 'Ajay Jain',
    profession: 'Consulting product manager',
    group: 'CANVAS',
    bio: 'Geeky, observant, and already halfway through three theories before most rooms find the body.',
    quirk: 'Consumes enough true crime to sound rehearsed when he talks about chain of custody.',
    secret: 'I am more Dwight Schrute than I should admit in mixed company.',
    neverDo: 'Involve other people in my crimes.',
    motive: 'Ajay built a diligence checklist for Armaan\'s team and watched it get reused without his name or fee anywhere on the document.',
    timeline: '8:02 PM - Landed near the investor table and never left it for long.\n9:43 PM - Saw Victoria slide an envelope back into her bag.\n10:24 PM - Immediately asked who controlled the camera feed.',
    code: 'SHERLOCK',
  }),
  witness({
    id: 'char_mahi',
    name: 'Mahi B',
    profession: 'Kindergarten teacher',
    group: 'CANVAS',
    bio: 'Gentle voice, sharp laugh, better at watching chaos than anyone credits her for.',
    quirk: 'Makes bonsai and speaks about tiny cuts to a shape like they are acts of mercy.',
    secret: 'I speak cloud when I am tired enough to be honest.',
    neverDo: 'Jump out of a plane for someone else\'s enlightenment.',
    motive: 'Armaan mocked the paper-installation concept Mahi designed for a school gala and then used the same idea in a brand deck.',
    timeline: '7:41 PM - Arrived with Tara\'s table and gravitated to the cake station.\n10:08 PM - Watched the projector go dark from five feet away and noticed the side lane to the bar stayed open while the main floor turned.\n10:20 PM - Noticed Armaan holding the glass too carefully, like it had become heavy.',
    code: 'CLOUD',
  }),
  witness({
    id: 'char_john',
    name: 'John V',
    profession: 'Italian language specialist',
    group: 'ORACLE',
    bio: 'Overthinks for sport and still somehow ends up useful when words matter.',
    quirk: 'Falls down rabbit holes so deep he returns with pronunciation guides and three side plots.',
    secret: 'A secret stops being a secret if said out loud, which is my favorite technicality.',
    neverDo: 'Order Starbucks on purpose.',
    motive: 'Armaan stole label translations John delivered for an import proposal and handed them to a larger agency as if they were internal copy.',
    timeline: "7:55 PM - Entered with Kiyaah's group and got stuck translating wine jokes.\n10:06 PM - Heard Kiyaah tell staff that one drink was for Armaan only.\n10:21 PM - Was close enough to hear the glass hit stone before Armaan did.",
    code: 'RABBIT',
  }),
  witness({
    id: 'char_swati',
    name: 'Swati',
    profession: 'Soap maker and wellness aide',
    group: 'ORACLE',
    bio: 'Feeds people first, asks questions second, and notices more than anyone expects while doing both.',
    quirk: 'Makes beautiful soaps and cannot stop evaluating everyone\'s hands.',
    secret: 'When I say I do not know, it usually means I know but do not trust you yet.',
    neverDo: 'Shout if a quieter correction will work.',
    motive: 'Armaan ordered custom welcome hampers from Swati, delayed payment, and told guests a luxury concierge had sourced them instead.',
    timeline: '7:38 PM - Arrived with Kiyaah\'s table carrying hand-wrapped soaps.\n10:10 PM - Noticed a polished silver mister on the bar tray that had not been there earlier.\n10:23 PM - Saw Victoria washing her hands before anyone understood why the room had gone still.',
    code: 'SOAPSTONE',
  }),
  witness({
    id: 'char_chinmay',
    name: 'Chinmay Nema',
    profession: 'NGO operations lead',
    group: 'ORACLE',
    bio: 'Structured, calm, and never more dangerous than when he sounds amused.',
    quirk: 'Can turn a messy room into a checklist in under a minute.',
    secret: 'The laugh usually arrives when I have already decided what I think of you.',
    neverDo: 'Cook if there is any other option.',
    motive: 'Armaan hijacked a donor dinner Chinmay had brokered and turned it into a liquor-brand flirtation with rich people who had not come for that.',
    timeline: '7:26 PM - Arrived with Kiyaah\'s circle and started rearranging the guest-list table for fun.\n10:08 PM - Heard a service QR beep with no staff member standing nearby.\n10:24 PM - Told the first officer to seize the scanner logs.',
    code: 'ORDER',
  }),
  witness({
    id: 'char_natasha',
    name: 'Natasha',
    profession: 'Smile designer',
    group: 'ORACLE',
    bio: 'Careful with details, theatrical with silence, and very good at reading whether pain is cosmetic or real.',
    quirk: 'Reads tarot for fun and expressions for work, which makes parties informative.',
    secret: 'I almost always remember the one mistake louder than the ninety-nine wins.',
    neverDo: 'Stay boring just to keep the room comfortable.',
    motive: 'Armaan flirted with hiring Natasha for a founder-image refresh, took the pitch deck, and never paid for the consult he copied from.',
    timeline: '7:44 PM - Arrived with Kiyaah\'s table and drifted toward the candlelit mirrors.\n10:07 PM - Walked up on Sneha and Kiyaah ending a conversation too quickly.\n10:22 PM - Knew Armaan was dying before anyone said the word.',
    code: 'PSYCHIC',
  }),
  witness({
    id: 'char_savvy',
    name: 'Savvy Grover',
    profession: 'Freelance creative drifter',
    group: 'FORGERY',
    bio: 'Quiet, intense, and more perceptive than the anxious shrug suggests.',
    quirk: 'Claims to summon cats and has the exact stillness of someone who might be telling the truth.',
    secret: 'No way is not an answer; it is just the most efficient refusal I own.',
    neverDo: 'Pretend to be an adventurer for social points.',
    motive: 'Armaan tore apart a deck Savvy built for him, then reused the exact headline three weeks later with another agency\'s logo on it.',
    timeline: '7:58 PM - Arrived with Victoria\'s group and immediately found the quietest corner.\n10:02 PM - Saw Roddy carrying a case toward the prep-room corridor.\n10:20 PM - Watched Armaan rub his fingers together like he could not feel them.',
    code: 'WHISKER',
  }),
  witness({
    id: 'char_dinesh',
    name: 'Dinesh Verma',
    profession: 'Diagnostics entrepreneur',
    group: 'FORGERY',
    bio: 'Arrives sounding half visionary, half cover story, and somehow keeps both alive in the same sentence.',
    quirk: 'Treats impossible ideas like they are undercover operations waiting for a badge.',
    secret: 'I claim MI5 when rooms are too dull to deserve the regular truth.',
    neverDo: 'Hurt anyone on purpose.',
    motive: 'Armaan strung Dinesh along on a diagnostics partnership, lifted a distributor introduction, and then called the entire idea too serious for his brand.',
    timeline: '8:12 PM - Entered with Victoria\'s table already mid-pitch.\n10:08 PM - Saw Oindrilla reboot the projection feed from the side console.\n10:25 PM - Tried to explain chain of events as if giving evidence under oath.',
    code: 'PHANTOM',
  }),
  witness({
    id: 'char_valerie',
    name: 'Valerie Anithra Pereira',
    profession: 'Periodontist',
    group: 'FORGERY',
    bio: 'Whimsical until the subject turns clinical, then all the softness leaves at once.',
    quirk: 'Keeps one eye on the room and the other on whether anyone is clenching their jaw.',
    secret: 'I will remember the one mistake long after everyone else is celebrating the win.',
    neverDo: 'Be cruel just because it earns a laugh.',
    motive: 'Armaan canceled a wellness investor dinner Valerie had already stocked, refused the deposit, and called the loss the cost of exposure.',
    timeline: '7:52 PM - Arrived with Victoria\'s group and went straight for sparkling water.\n10:04 PM - Heard Roddy use the word dose in a tone no dinner should require.\n10:22 PM - First thought was arrhythmia, not drunkenness.',
    code: 'HEX',
  }),
  witness({
    id: 'char_chayne',
    name: 'Chayne Lobo',
    profession: 'Freelance content creator',
    group: 'FORGERY',
    bio: 'Easygoing until credit goes missing. Then the room learns the difference between chill and absent.',
    quirk: 'Can build perfect late-night snack menus and ruin a lie with one casual joke.',
    secret: 'My secrets usually sound too stupid to be worth confessing, which is why people remember them.',
    neverDo: 'Kill somebody for someone else\'s script.',
    motive: 'Armaan reused a Chayne reel almost frame for frame in a launch teaser and called it brand inspiration when caught.',
    timeline: '8:03 PM - Arrived with Victoria\'s group and kept filming snippets all night.\n10:09 PM - Phone footage caught Anna near the gift table when the lights hiccuped.\n10:24 PM - Told police not to erase anything off his camera roll.',
    code: 'POOL',
  }),
  witness({
    id: 'char_flora',
    name: 'Flora Florentine',
    profession: 'Florist and hobby chemist',
    group: 'HEMLOCK',
    bio: 'Grounded, funny, and quietly more scientific than her flower apron implies.',
    quirk: 'Waters plants at impossible hours and thinks of apothecary work as a second language.',
    secret: 'I have a chemistry degree that people stop remembering the second they see the flowers.',
    neverDo: 'Use violence when better growing conditions would solve it.',
    motive: 'Armaan underpaid Flora for a botanical installation and then bragged about the formula for its scent profile as if he had invented it himself.',
    timeline: '7:18 PM - Arrived with Roddy\'s circle to inspect the floral arch.\n10:07 PM - Smelled something medicinal under the orange peel near the bar.\n10:23 PM - Said out loud that the bottle was not the point.',
    code: 'BLOOM',
  }),
  witness({
    id: 'char_keith',
    name: 'Keith Murdoch',
    profession: 'Palaeontologist',
    group: 'HEMLOCK',
    bio: 'Meticulous, charming, and far too comfortable around relics for anyone who likes their dead theoretical.',
    quirk: 'Can identify every human bone and will tell you that is less strange than you think.',
    secret: 'I have kept bones in a closet before and remain unconvinced that was the wrong choice.',
    neverDo: 'Actually murder anyone for the sake of curiosity.',
    motive: 'Armaan borrowed a fossil-display prop Keith had sourced for a collector dinner, cracked it, and called the loss the cost of atmosphere.',
    timeline: '7:39 PM - Arrived with Roddy\'s group and drifted toward the DJ console.\n10:05 PM - Saw Roddy return without the case he brought.\n10:22 PM - Noticed how fast everyone started looking for poison once the body dropped.',
    code: 'ROSS',
  }),
  witness({
    id: 'char_soham',
    name: 'Soham Vaidya',
    profession: 'Climate-finance advocate',
    group: 'HEMLOCK',
    bio: 'Patient until greenwashing shows up in a pressed shirt and calls itself innovation.',
    quirk: 'Bird-watches like other people meditate.',
    secret: 'Crying never comes when it is supposed to, which makes me look colder than I am.',
    neverDo: 'Kill someone, even as a joke.',
    motive: 'Armaan wanted climate-finance language for his pitch deck, not actual accountability, and laughed when Soham suggested the room could tell the difference.',
    timeline: '7:47 PM - Arrived with Roddy\'s table and ended up outside near the courtyard.\n9:29 PM - Heard Vinod threaten Armaan with the cost of forgetting who moved the licenses.\n10:24 PM - Told police the back-lane argument mattered.',
    code: 'ROBIN',
  }),
  witness({
    id: 'char_hima',
    name: 'Hima',
    profession: 'Baker, architect, and reluctant perfectionist',
    group: 'HEMLOCK',
    bio: 'Builds beautiful things and then apologizes for them before anyone else has the chance.',
    quirk: 'Collects unfinished paintings and finished structural opinions in equal measure.',
    secret: 'I dance when nobody from the formal world can see me.',
    neverDo: 'Pretend to love extreme adventure just because the room does.',
    motive: 'Armaan scrapped Hima\'s dessert-display concept at the last minute after weeks of revisions and then called her too delicate for live events.',
    timeline: '7:31 PM - Arrived with Roddy\'s group and checked the cake table first.\n10:07 PM - Saw Tanvi moving people away from the bar for sightlines.\n10:19 PM - Noticed Armaan set his glass down harder than intended.',
    code: 'BLUEPRINT',
  }),
  witness({
    id: 'char_vaidehi',
    name: 'Vaidehi Bharadwaj',
    profession: 'AI product manager',
    group: 'AMBER',
    bio: 'Thoughtful until the room underestimates her, then the chaos gets organized around a better version of itself.',
    quirk: 'Writes poems no one asked for and usually no one deserves.',
    secret: 'Why should I tell the obvious truth for free?',
    neverDo: 'Smoke just because somebody wants an aesthetic.',
    motive: 'Armaan made Vaidehi pitch a product-tracking idea to his team, lifted the core workflow, and told her the room needed a more senior face to carry it.',
    timeline: '7:24 PM - Arrived with Oindrilla\'s circle and headed straight for the dashboard console.\n10:08 PM - Saw an admin override flicker and vanish before the crowd reacted.\n10:23 PM - Quietly started naming the people who had system access.',
    code: 'VERSE',
  }),
  witness({
    id: 'char_ashish',
    name: 'Ashish Khurana',
    profession: 'Startup enthusiast and AI tinkerer',
    group: 'AMBER',
    bio: 'Looks like the youngest person in every room on purpose because people say too much around him when they assume he is decorative.',
    quirk: 'Travels the world and outer space virtually when reality gets too slow.',
    secret: 'I am sixteen years old eternally, mostly because I refuse to age around men like Armaan.',
    neverDo: 'Kill someone willingly.',
    motive: 'Armaan borrowed Ashish\'s simulation demo for a buyer presentation and then introduced him as a mascot instead of a builder.',
    timeline: '8:06 PM - Arrived with Oindrilla\'s group and immediately found the balcony view.\n9:41 PM - Saw Rishi pacing through a phone call he should have taken outside.\n10:22 PM - Thought heart attack before anyone said poison.',
    code: 'COSMOS',
  }),
  witness({
    id: 'char_chryselle',
    name: 'Chryselle Pinto',
    profession: 'Teacher and narrative observer',
    group: 'AMBER',
    bio: 'Patient, sarcastic, and constantly directing small documentaries inside her own head.',
    quirk: 'Can watch a room for two minutes and build a backstory nobody asked for.',
    secret: 'Trust issues make me pay attention longer than people enjoy.',
    neverDo: 'Climb a mountain for personal growth.',
    motive: 'Armaan filmed Chryselle\'s storytelling concept for a school fundraiser, trimmed her name off the credits, and thanked his internal brand team instead.',
    timeline: '7:53 PM - Arrived with Oindrilla\'s table and stayed close enough to watch, not participate.\n9:51 PM - Saw Sneha come out of the upstairs booth empty handed, with the red Monday folder still lying open on the table behind her.\n10:23 PM - Noted how quickly Kiyaah moved staff away from the bar.',
    code: 'OBSERVER',
  }),
  witness({
    id: 'char_akash',
    name: 'Akash Jain',
    profession: 'Startup founder',
    group: 'AMBER',
    bio: 'Private, rebellious, and skilled at saying little without sounding empty.',
    quirk: 'Plays basic tabla and carries the rhythm into every negotiation.',
    secret: 'Privacy is a strategy, not a personality flaw.',
    neverDo: 'Go back to Gurgaon just because nostalgia asked nicely.',
    motive: 'Armaan lifted the structure of Akash\'s investor deck for his own acquisition narrative and then told him the original lacked conviction.',
    timeline: '8:14 PM - Arrived with Oindrilla\'s circle and drifted toward the service doors.\n9:31 PM - Saw Vinod come back from a private meeting with Armaan.\n10:25 PM - Told police the loudest argument tonight was not the one by the bar.',
    code: 'JATT',
  }),
  witness({
    id: 'char_aayushi',
    name: 'Aayushi Gandhi',
    profession: 'Architect',
    group: 'PIXEL',
    bio: 'Curious, nomadic, and incapable of entering a space without redesigning it in her head.',
    quirk: 'Can sleep anywhere and still wake up with a better floor plan than the host.',
    secret: 'Would choose a quiet countryside over a city brag every single time.',
    neverDo: 'Murder someone for attention.',
    motive: 'Armaan killed Aayushi\'s lounge redesign after weeks of unpaid revisions and then told guests his in-house team had made the room feel intimate.',
    timeline: '7:27 PM - Arrived with Tanvi\'s table already criticizing the lighting.\n10:09 PM - Saw Anna checking a display cabinet when the reel failed.\n10:20 PM - Noticed Armaan grip the counter before he tried to keep smiling.',
    code: 'NOMAD',
  }),
  witness({
    id: 'char_esha',
    name: 'Esha Singh',
    profession: 'Brand identity designer',
    group: 'PIXEL',
    bio: 'Stylish, sharp, and capable of turning mockery into a visual system if you give her time.',
    quirk: 'Knows dessert the way some people know scripture.',
    secret: 'Cheats at board games and rarely apologizes if the room needed humbling anyway.',
    neverDo: 'Forgive bad taste disguised as authority.',
    motive: 'Armaan tweaked one piece of Esha\'s branding work, called it co-creation, and used that claim to avoid paying the actual expansion fee.',
    timeline: '7:49 PM - Arrived with Tanvi\'s group and made a face at the back-bar labels.\n9:37 PM - Heard Tara accuse Armaan of passing fakes as provenance.\n10:22 PM - Said out loud that the room was about to start lying in clusters.',
    code: 'ROUGE',
  }),
  witness({
    id: 'char_parinitha',
    name: 'Parinitha Konanur',
    profession: 'Illustrator',
    group: 'PIXEL',
    bio: 'Sees two worlds at once: the one in front of her and the one she wishes it deserved.',
    quirk: 'Writes stories around sketches before the ink is dry.',
    secret: 'The world in my vision is almost always kinder than the one outside it.',
    neverDo: 'Bend the knee to a bad brief.',
    motive: 'Armaan licensed Parinitha\'s illustrations for one campaign, reused them in three more territories, and called the overage exposure.',
    timeline: '7:36 PM - Arrived with Tanvi\'s table carrying a sketchbook.\n10:08 PM - From the sketch banquette beside the bar arch, saw Kiyaah swap one silver spray bottle for another and assumed it was bar theater.\n10:24 PM - Realized the swap was the only thing she kept drawing.',
    code: 'INK',
  }),
  witness({
    id: 'char_sunali',
    name: 'Sunali Panda',
    profession: 'Chief of staff at a nonprofit',
    group: 'PIXEL',
    bio: 'Chatty, silly, and dangerous only if you mistake warmth for inattention.',
    quirk: 'Writes fan fiction with the seriousness other people reserve for strategic memos.',
    secret: 'I used to shoplift and still know exactly how security patterns work in retail rooms.',
    neverDo: 'Dance for a reel if the reel itself is stupid.',
    motive: 'Armaan mined Sunali\'s nonprofit contact list for donors, turned the dinner into a luxury alcohol launch, and acted shocked that she objected.',
    timeline: '8:01 PM - Arrived with Tanvi\'s group and started talking to absolutely everyone.\n9:46 PM - Heard Sneha ask a member of staff which upstairs room the red folder had been left in.\n10:25 PM - Was the first person to say the blackout and the drink belonged in the same sentence.',
    code: 'FICTION',
  }),
  witness({
    id: 'char_meera',
    name: 'Meera Victoria Raghuwanshi',
    profession: 'Professional drifter and gossip archivist',
    group: 'MYTHOS',
    bio: 'Says she waters plastic plants, which is somehow less unserious than the rest of what she says on purpose.',
    quirk: 'Collects overheard nonsense and narrates it back to herself like breaking news.',
    secret: 'I tell ChatGPT more gossip than most people tell their best friends.',
    neverDo: 'Commit murder twice.',
    motive: 'Armaan once introduced Meera as decorative company and seemed stunned she remembered the sentence exactly.',
    timeline: '8:09 PM - Arrived with Rishi\'s table and immediately started eavesdropping.\n10:06 PM - Heard Oindrilla and Victoria whisper the word invoice.\n10:23 PM - Told three people the lights mattered, then forgot who she told first.',
    code: 'GOSSIP',
  }),
  witness({
    id: 'char_dona',
    name: 'Dona G',
    profession: 'Emcee',
    group: 'MYTHOS',
    bio: 'Loud, charming, and fully aware of the fact that most events only work because someone like her keeps them moving.',
    quirk: 'Can binge anything: food, gossip, or the wrong kind of attention.',
    secret: 'My best secrets sound too unserious for people to realize I never corrected them.',
    neverDo: 'Humiliate myself for free.',
    motive: 'Armaan cut Dona\'s mic time after asking her to save the room, then underpaid her because the party was about him, not the host.',
    timeline: '8:18 PM - Arrived with Rishi\'s group and took over the nearest conversation instantly.\n10:08 PM - At the mic stand when the projector glitched.\n10:24 PM - Kept repeating that the room had rehearsed this blackout without meaning to.',
    code: 'BENDER',
  }),
  witness({
    id: 'char_nanu',
    name: 'Nanu',
    profession: 'Student drummer',
    group: 'MYTHOS',
    bio: 'Easy laugh, patient face, and just enough mystery to make the room overread the silence.',
    quirk: 'Finds a rhythm on any flat surface within thirty seconds.',
    secret: 'Neutral answers are mostly just camouflage.',
    neverDo: 'Pretend certainty when I do not have it.',
    motive: 'Armaan dropped Nanu from the entertainment lineup with no warning after promising him a live set in front of buyers.',
    timeline: '7:57 PM - Arrived with Rishi\'s group and wandered toward the speaker stack.\n10:08 PM - Saw Oindrilla with an admin tablet near the booth.\n10:22 PM - Counted the seconds between Armaan grabbing the rail and falling.',
    code: 'RHYTHM',
  }),
  witness({
    id: 'char_aarushi',
    name: 'Aarushi',
    profession: 'Chemistry student and biker',
    group: 'MYTHOS',
    bio: 'Loud when she wants to be, scientific when it matters, and rarely both by accident.',
    quirk: 'Knows enough chemistry to ruin a gimmick drink with one raised eyebrow.',
    secret: 'Somewhere there is hidden gold and I am not discussing the map.',
    neverDo: 'Eat pumpkin soup just because a room insists it is elegant.',
    motive: 'Armaan mined Aarushi\'s chemistry notes for a marketing stunt cocktail and never credited the person who told him the original concept would not poison anyone.',
    timeline: '8:04 PM - Arrived with Rishi\'s group smelling of rain and petrol.\n10:12 PM - Said the bitter-orange note on Armaan\'s drink was not coming from the bottle.\n10:23 PM - Repeated that point until someone finally listened.',
    code: 'ALCHEMY',
  }),
  witness({
    id: 'char_meenal',
    name: 'Meenal Raghuvanshi',
    profession: 'People operations lead',
    group: 'REGENT',
    bio: 'Warm, energetic, and fully capable of turning an adventure plan into a staffing spreadsheet.',
    quirk: 'Researches remote treks at 2 AM as if leaving civilization were a second job.',
    secret: 'Bananas frighten me more than most people realize.',
    neverDo: 'Date someone from work again.',
    motive: 'Armaan poached two hires out of Meenal\'s pipeline after making her reveal the whole retention strategy over drinks.',
    timeline: '7:34 PM - Arrived with Vinod\'s group and immediately checked where the exits were.\n10:23 PM - Tried to leave with Vinod before the gate was shut.\n10:26 PM - Realized too late that leaving is evidence too.',
    code: 'SUMMIT',
  }),
  witness({
    id: 'char_amanda',
    name: 'Amanda T',
    profession: 'Social ghost',
    group: 'REGENT',
    bio: 'Nobody seems entirely sure who invited Amanda, which only makes her look more like she belongs in the room.',
    quirk: 'Can make discomfort feel like an aura instead of a problem.',
    secret: 'Every form is a test if you answer it like the room does not deserve the real you.',
    neverDo: 'Cheat when ambiguity will do more damage.',
    motive: 'Armaan once invited Amanda as a dare, forgot he had done it, and then introduced her to investors as if she were a prop. She remembered.',
    timeline: '8:16 PM - Arrived with Vinod\'s group and drifted like she had always lived there.\n10:08 PM - Said the case started when the lights did because the people nearest the bar barely flinched.\n10:24 PM - Refused to explain whether that was a joke.',
    code: 'ENIGMA',
  }),
  witness({
    id: 'char_nolani',
    name: 'Nolani Noget',
    profession: 'Field journalist and ghostwriter',
    group: 'REGENT',
    bio: 'Lives for a scoop and dresses like the source should feel flattered to ruin itself for her.',
    quirk: 'Treats every private room as an interview waiting to happen.',
    secret: 'I ghostwrite for a celebrity who has never once learned my name.',
    neverDo: 'Tattoo lyrics I might outgrow.',
    motive: 'Armaan killed Nolani\'s last big story by buying off the source and then joked that narrative belongs to whoever pays for distribution.',
    timeline: '7:59 PM - Arrived with Vinod\'s table and started taking notes in the bathroom line.\n10:05 PM - Heard Victoria say shell account to someone she did not expect to be listening.\n10:25 PM - Offered police a quote before they offered her a question.',
    code: 'GHOST',
  }),
  witness({
    id: 'char_vidya',
    name: 'Vidya',
    profession: 'Community host',
    group: 'REGENT',
    bio: 'Funny, dangerous, and playful in ways that make earnest people nervous for reasons they cannot explain.',
    quirk: 'Throws sparkle and superstition around the same way other people throw small talk.',
    secret: 'The rooms that think I have no secret usually become mine very fast.',
    neverDo: 'Vote for someone just because the room wants a villain.',
    motive: 'Armaan laughed at Vidya\'s immersive activation pitch and then used three pieces of it anyway because mocking women costs less than paying them.',
    timeline: '8:07 PM - Arrived with Vinod\'s circle and went straight to the courtyard.\n10:11 PM - Noticed an orange-oil streak on the bar tray.\n10:24 PM - Told people magic had nothing to do with what just happened.',
    code: 'SPARKLE',
  }),
  witness({
    id: 'char_khyati',
    name: 'Khyati Adesara',
    profession: 'Travel guide',
    group: 'REGENT',
    bio: 'Curious, optimistic, and always half-listening to whether the room is lying to itself.',
    quirk: 'Consults tarot mostly to see how uncomfortable facts make other people.',
    secret: 'Questions are often the most honest thing I have to offer.',
    neverDo: 'Intentionally put someone in harm\'s way.',
    motive: 'Armaan stiffed Khyati on a curated old-city investor tour after using her route notes to impress the same buyers himself.',
    timeline: '7:42 PM - Arrived with Vinod\'s group and immediately clocked the exits.\n9:38 PM - Saw Tara\'s crate reopened after Armaan swore it would stay sealed.\n10:23 PM - Thought the room was accusing in the wrong direction almost immediately.',
    code: 'TAROT',
  }),
  witness({
    id: 'char_sanika',
    name: 'Sanika Malvi',
    profession: 'Visual designer',
    group: 'REPLICA',
    bio: 'Stylish, emotional, and too good at spotting what a room is trying to over-design.',
    quirk: 'Solves sudokus while pretending not to care whether anyone notices.',
    secret: 'I mostly refuse the premise that every person needs a dark secret to be interesting.',
    neverDo: 'Smoke just to look cinematic.',
    motive: 'Armaan posted a half-finished visual Sanika had expressly labeled rough and then told her the backlash proved he was building anticipation.',
    timeline: '7:29 PM - Arrived with Anna\'s table and went straight to the photo wall.\n10:08 PM - Saw Tanvi moving marker cards away from the bar line.\n10:23 PM - Decided the room had been staged before anybody used the word staged.',
    code: 'SUDOKU',
  }),
  witness({
    id: 'char_kristen',
    name: 'Kristen Alfonso',
    profession: 'Teacher',
    group: 'REPLICA',
    bio: 'Determined, adventurous, and inclined to stay quieter than her certainty really is.',
    quirk: 'Can be on a call or halfway through a show and still clock who just lied.',
    secret: 'My blanks are usually deliberate, not empty.',
    neverDo: 'Murder, even as a word game.',
    motive: 'Armaan borrowed a teaching analogy Kristen used in a workshop, folded it into a keynote, and never once mentioned where the idea came from.',
    timeline: '7:33 PM - Arrived with Anna\'s table and found the back-hall corridor first.\n9:44 PM - Heard Anna insist one display bottle was not hers.\n10:24 PM - Told police that the drink ceremony had been too rehearsed to be innocent.',
    code: 'VOYAGER',
  }),
  witness({
    id: 'char_anjul',
    name: 'Anjul Mishra',
    profession: 'Operations analyst',
    group: 'REPLICA',
    bio: 'Calm on the outside, quietly measuring how much of today could have been avoided with one honest email.',
    quirk: 'Spends free time estimating the productivity cost of his own procrastination.',
    secret: 'I love Roadies more than the polished version of me would admit.',
    neverDo: 'Volunteer for karaoke in a room like this.',
    motive: 'Armaan trapped Anjul in an unpaid crisis weekend, then bragged on Monday that true operators never count the hours.',
    timeline: '8:11 PM - Arrived with Anna\'s table looking underdressed on purpose.\n10:09 PM - Saw someone in a staff apron use the service stair without being staff.\n10:25 PM - Realized later the apron was the useful part, not the face.',
    code: 'ROADIE',
  }),
  witness({
    id: 'char_aaina',
    name: 'Aaina Singh',
    profession: 'Experience designer',
    group: 'REPLICA',
    bio: 'Empathetic until somebody mistakes that for passivity, then the analysis sharpens fast.',
    quirk: 'Sings only when she forgets the room is there.',
    secret: 'Once left an annoying boyfriend on a trek and made it home with a different group.',
    neverDo: 'Promise never just because somebody wants certainty.',
    motive: 'Armaan stole an experience-mapping framework from Aaina, repackaged it as founder instinct, and laughed when she asked whether attribution existed in his world.',
    timeline: '7:54 PM - Arrived with Anna\'s group and inspected the scent bar immediately.\n10:08 PM - Noticed Kiyaah behind the private bar alone for a beat too long.\n10:22 PM - Clocked the room\'s shift from party noise to fear in one breath.',
    code: 'TREKKER',
  }),
];

// The roster the whole app reads. Six clean slots at the top keeps the opening
// screenful of the Suspects index and the first row of the ballot grid free of
// conspirators.
export const CHARACTERS = dealt(ROSTER, {
  salt: 'roster',
  isHot: (character) => character.role === 'MURDERER',
  safeTop: 6,
});

export const CASE_META = {
  caseId: '8821-B',
  title: 'Velvet Ember: Birthday in Red',
  brand: 'Velvet Ember Spirits',
  victimName: 'Armaan Khanna',
  victimProfession: 'Founder and CEO, Velvet Ember Spirits',
  date: '8 August 2026',
  venue: 'For the Record, Panjim, Goa',
  policeUnit: 'Goa Police · Panjim Division',
  inspector: 'Inspector Ira Deshpande',
  playerCount: CHARACTERS.length,
  primeSuspectCount: CHARACTERS.filter((character) => character.isSuspect).length,
  killerCount: CHARACTERS.filter((character) => character.role === 'MURDERER').length,
};

export const CASE_TIMELINE = [
  { time: '7:00 PM', event: 'Doors open at For the Record in Panjim' },
  { time: '9:55 PM', event: 'Birthday tribute reel begins beside the private bar' },
  { time: '10:08 PM', event: 'Projector and bar camera drop for 94 seconds' },
  { time: '10:12 PM', event: "Armaan lifts his signature 'Last Light'" },
  { time: '10:19 PM', event: 'His hands start failing him mid-conversation' },
  { time: '10:22 PM', event: 'Armaan collapses beside the stage rail' },
  { time: '10:34 PM', event: 'Paramedics stop resuscitation' },
  { time: '10:48 PM', event: 'Goa Police seal the venue' },
];

const KILLER_IDS = ['char_sneha', 'char_kiyaah', 'char_victoria', 'char_roddy', 'char_oindrilla'];

const GROUPS = {
  THIMBLE: ['char_sneha', 'char_yukta', 'char_shubham', 'char_lakshmi', 'char_ricardo'],
  CANVAS: ['char_tara', 'char_fabiola', 'char_govind', 'char_ajay', 'char_mahi'],
  ORACLE: ['char_kiyaah', 'char_john', 'char_swati', 'char_chinmay', 'char_natasha'],
  FORGERY: ['char_victoria', 'char_savvy', 'char_dinesh', 'char_valerie', 'char_chayne'],
  HEMLOCK: ['char_roddy', 'char_flora', 'char_keith', 'char_soham', 'char_hima'],
  AMBER: ['char_oindrilla', 'char_vaidehi', 'char_ashish', 'char_chryselle', 'char_akash'],
  PIXEL: ['char_tanvi', 'char_aayushi', 'char_esha', 'char_parinitha', 'char_sunali'],
  MYTHOS: ['char_rishi', 'char_meera', 'char_dona', 'char_nanu', 'char_aarushi'],
  REGENT: ['char_vinod', 'char_meenal', 'char_amanda', 'char_nolani', 'char_vidya', 'char_khyati'],
  REPLICA: ['char_anna', 'char_sanika', 'char_kristen', 'char_anjul', 'char_aaina'],
};

const ACCUSATION_DECK = [
  {
    id: 'acc_sneha',
    code: 'LANTERN',
    targetSuspect: 'char_sneha',
    targetName: 'Sneha Ganesh',
    title: 'Suspicious Behavior: Sneha Ganesh',
    accusation: 'When I passed the upstairs booth, Sneha was in there with Armaan and the red folder marked MONDAY, and I heard her say, if you throw me overboard, I take the ship with me. She came back down without it, composed enough to be dangerous. The lights went out not long after.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.REPLICA,
  },
  {
    id: 'acc_tara',
    code: 'HARBOR',
    targetSuspect: 'char_tara',
    targetName: 'Tara Singhania',
    title: 'Suspicious Behavior: Tara Singhania',
    accusation: 'Tara was furious about a missing crate and kept asking who had opened the customs seals on her gift case. She knew exactly which display cabinet the private reserve lived in, and she had what looked like Armaan\'s back-bar keycard clipped inside her sleeve.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.THIMBLE,
  },
  {
    id: 'acc_kiyaah',
    code: 'CADENCE',
    targetSuspect: 'char_kiyaah',
    targetName: 'Kiyaah Rose Raghuwanshi',
    title: 'Suspicious Behavior: Kiyaah Rose Raghuwanshi',
    accusation: 'Kiyaah disappeared behind the private bar twice and told staff Armaan\'s drink was hands off. Nobody else got the orange mist on top. When he took his glass, she watched like she was waiting to see whether he\'d taste the difference.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.CANVAS,
  },
  {
    id: 'acc_victoria',
    code: 'MARBLE',
    targetSuspect: 'char_victoria',
    targetName: 'Victoria Vance',
    title: 'Suspicious Behavior: Victoria Vance',
    accusation: 'Victoria arrived with documents, made Armaan initial something in the back office, and later washed her hands before the room even knew there was a problem. She kept saying check the logs like she already knew what the logs would say.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.ORACLE,
  },
  {
    id: 'acc_roddy',
    code: 'COMPASS',
    targetSuspect: 'char_roddy',
    targetName: 'Roddy Faustus',
    title: 'Suspicious Behavior: Roddy Faustus',
    accusation: 'Roddy brought a gift box full of botanicals that vanished before the gifts were opened. He was down beside the body before anyone else moved, asking what Armaan had been drinking, whether he had eaten, and how fast the numbness had climbed his hands. Nobody asks it in that order unless they already think they know the answer.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.FORGERY,
  },
  {
    id: 'acc_oindrilla',
    code: 'TANGENT',
    targetSuspect: 'char_oindrilla',
    targetName: 'Oindrilla Chatterjee',
    title: 'Suspicious Behavior: Oindrilla Chatterjee',
    accusation: 'Oindrilla was in the sound booth when the tribute reel stuttered, and the bar-camera monitor died less than a minute later. She was also the only person in the room who knew the event-admin path still worked offline. If the blackout was staged, she is not just adjacent to it. She is inside it.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.HEMLOCK,
  },
  {
    id: 'acc_tanvi',
    code: 'SATCHEL',
    targetSuspect: 'char_tanvi',
    targetName: 'Tanvi Vartak',
    title: 'Suspicious Behavior: Tanvi Vartak',
    accusation: 'Tanvi kept moving people around the room for better sightlines. Right before the blackout she told two of us not to stand near the bar because we would spoil the reveal. If she was only protecting Armaan\'s cake moment, fine. If she was protecting something else, she had the whole room pointed exactly where she wanted.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.AMBER,
  },
  {
    id: 'acc_rishi',
    code: 'PARADE',
    targetSuspect: 'char_rishi',
    targetName: 'Rishi Raj Rahul',
    title: 'Suspicious Behavior: Rishi Raj Rahul',
    accusation: 'Rishi came back from the back lane saying he was done being humiliated. He knew about the buyer call before anyone else did, and I heard him tell someone on the phone that if Armaan kept talking, tonight ends differently. Five minutes later, the room loses the cameras and Armaan is drinking alone like nothing can touch him.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.PIXEL,
  },
  {
    id: 'acc_vinod',
    code: 'BOULDER',
    targetSuspect: 'char_vinod',
    targetName: 'Vinod Raghuwanshi',
    title: 'Suspicious Behavior: Vinod Raghuwanshi',
    accusation: 'Vinod had a private meeting with Armaan in the back lane, no aides, no witnesses, and came back furious enough that even his own people stopped talking. After the collapse, he was the first person who looked toward the exit and the only one trying to leave before anybody had named this a crime scene.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.MYTHOS,
  },
  {
    id: 'acc_anna',
    code: 'CARNIVAL',
    targetSuspect: 'char_anna',
    targetName: 'Anna Russo',
    title: 'Suspicious Behavior: Anna Russo',
    accusation: 'Anna brought a lacquered tube and kept insisting one bottle on display was not the bottle she sent. Right after the blackout, she was at the gift table and then in the back-hall corridor, talking about a switch before anyone else had figured out there had been one. That is either instinct, or prior knowledge.',
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: GROUPS.REGENT,
  },
];

const targetsAKiller = (clue) => KILLER_IDS.includes(clue.targetSuspect);

// Round 1's stack used to open on Sneha and then run three more conspirators
// before the first innocent name. Now it opens on three clean names.
export const ACCUSATION_CLUES = dealt(ACCUSATION_DECK, {
  salt: 'accuse',
  isHot: targetsAKiller,
  safeTop: 3,
});

const MOTIVE_DECK = [
  {
    id: 'mot_sneha',
    code: 'PENDULUM',
    targetSuspect: 'char_sneha',
    targetName: 'Sneha Ganesh',
    title: 'Motive: Sneha Ganesh',
    content: "Sneha built the acquisition model Armaan used to sell Velvet Ember to Meridien Beverage Group. That alone made her useful. The problem is that Armaan quietly stapled side letters and off-book rebate promises to the clean model, then routed the operational risk through a Monday audit packet carrying Sneha's name in the margins. If that packet landed, she became the architect of a financial trick she did not invent and could not disown. He got a birthday headline and a retention bonus. She got criminal exposure.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_tara',
    code: 'SAFFRON',
    targetSuspect: 'char_tara',
    targetName: 'Tara Singhania',
    title: 'Motive: Tara Singhania',
    content: "Tara handled provenance and acquisition for the objects that made Velvet Ember look established. Armaan slipped counterfeit paperwork into one of her consignments, booked the markup anyway, and hinted that if customs or insurers came knocking, her name was the cleanest one to sacrifice. An art dealer lives on trust. Armaan converted trust into leverage and called that friendship.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_kiyaah',
    code: 'DRIFTWOOD',
    targetSuspect: 'char_kiyaah',
    targetName: 'Kiyaah Rose Raghuwanshi',
    title: 'Motive: Kiyaah Rose Raghuwanshi',
    content: "Kiyaah designed the private tasting ritual Armaan used on buyers and investors, from the smoked glass to the orange-mist finish. He took the bar program, erased her name, and used the vulnerability she had shown him in confidence to keep her from fighting back. Worse, pieces of the program came from her father's old bar book — the one thing left behind when he disappeared. Armaan stole a language of grief, polished it, and sold it as founder genius.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_victoria',
    code: 'GRANITE',
    targetSuspect: 'char_victoria',
    targetName: 'Victoria Vance',
    title: 'Motive: Victoria Vance',
    content: 'Victoria cleaned up excise paperwork, customs rebates, and reimbursements Armaan preferred to keep blurred. On Tuesday she discovered three shell-company ledgers signed in her name. She had not signed them. Armaan had. If the buyout stumbled and the auditors dug, Victoria was positioned to become the elegant fall girl with the exact skill set needed to make the lie seem plausible.',
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_roddy',
    code: 'THISTLE',
    targetSuspect: 'char_roddy',
    targetName: 'Roddy Faustus',
    title: 'Motive: Roddy Faustus',
    content: "Roddy created the bittering base for Velvet Ember's limited botanical line. Armaan copied the notebook, flattened the formula into something cheaper, and then floated the idea of patenting the entire line under company ownership. To a man like Roddy, that is not merely theft. It is the flattening of craft into asset language. He had knowledge, access to plant toxins, and every reason to believe Armaan would take the last thing still carrying his name.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_oindrilla',
    code: 'LATTICE',
    targetSuspect: 'char_oindrilla',
    targetName: 'Oindrilla Chatterjee',
    title: 'Motive: Oindrilla Chatterjee',
    content: "Oindrilla built the event dashboards, QR access controls, and loyalty analytics Armaan leaned on for every buyer performance. He reused her tools to hide stock movement, surveil employees, and stage scarcity. When warehouse discrepancies surfaced, he started preparing a memo that blamed the breach on her admin credentials. In other words: he weaponized the system she built and prepared to hand her the knife as evidence.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_tanvi',
    code: 'ORIGAMI',
    targetSuspect: 'char_tanvi',
    targetName: 'Tanvi Vartak',
    title: 'Motive: Tanvi Vartak',
    content: "Tanvi built interactive launch mechanics for Velvet Ember. Armaan quietly reused her unpaid prototypes to monitor competitor rollouts and then threatened to leak the screenshots she had pieced together if she ever complained. He was ready to recast pattern recognition as stalking the second he needed a woman to sound unstable in public.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_rishi',
    code: 'STAMPEDE',
    targetSuspect: 'char_rishi',
    targetName: 'Rishi Raj Rahul',
    title: 'Motive: Rishi Raj Rahul',
    content: "Rishi helped Armaan staff the growth story around the buyout. Armaan took the shortlist, poached the talent, and let the board believe Rishi's platform inflated its numbers. He did it with enough deniability that Rishi could rage about it all night and still struggle to prove exactly where the knife had gone in.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_vinod',
    code: 'OBELISK',
    targetSuspect: 'char_vinod',
    targetName: 'Vinod Raghuwanshi',
    title: 'Motive: Vinod Raghuwanshi',
    content: "Velvet Ember's expansion permits moved faster than normal because Vinod made calls Armaan promised would remain private. Lately Armaan had begun recording those conversations. One leaked clip could solve several of Armaan's regulatory problems while detonating Vinod's political life. If Armaan was the kind of man who collected insurance on other people's ruin, Vinod had more to lose than most.",
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_anna',
    code: 'MOSAIC',
    targetSuspect: 'char_anna',
    targetName: 'Anna Russo',
    title: 'Motive: Anna Russo',
    content: 'Anna helped Armaan stage collector dinners and transport high-value bottles for publicity. More than once he used her replicas to pad transport-claim paperwork and then kept every document tying the fraud together. The day before the party he hinted that if the buyout got messy, he knew exactly whose name belonged on the insurance trail. Anna understood the message instantly.',
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
    code: 'BEACON',
    title: 'Toxicology Summary',
    content: 'STATE FORENSIC SCIENCE LABORATORY - GOA\n\nCASE: Armaan Khanna / For the Record, Panjim\nSPECIMENS: Blood, saliva, gastric wash, glass residue, orange-oil atomizer residue.\n\nFINDINGS:\n- Cause of death: acute aconitine toxicity\n- Delivery pattern: concentrated contact + ingestion, not a contaminated bottle batch\n- Highest residue: victim\'s lips, glass rim, and the nozzle of a silver aromatic atomizer recovered from the private bar\n- Birthday cake, shared bottle service, staff batch mixers: NEGATIVE\n\nCONCLUSION: Armaan was not poisoned by the room\'s alcohol supply. The toxin was delivered to one drink at the final finishing stage.',
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_atomizer',
    code: 'FILAMENT',
    title: 'Signature Drink Atomizer Analysis',
    content: 'ITEM: Silver atomizer labeled EMBER ORANGE, recovered from the private bar.\n\nFINDINGS:\n- Exterior recently polished; no usable prints\n- Internal residue: bitter-orange oil cut with concentrated aconite tincture\n- Label adhesive newer than the bottle itself\n- Atomizer body is a twin, not the original piece listed in the bar inventory\n- Linen fibres on the neck match service towels from the prep room\n\nNOTES: Velvet Ember\'s signature birthday drink, the Last Light, is finished with two sprays from a silver atomizer over the top of the glass. Staff confirm that only Armaan received that final garnish that night.',
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_cctv',
    code: 'HALOGEN',
    title: 'Projector and Bar-Camera Log',
    content: 'SECURITY SUMMARY - FOR THE RECORD / PRIVATE BAR\n\n9:55 PM - Birthday tribute reel begins.\n10:08:14 PM - Event-admin terminal forces a projector reboot.\n10:08:19 PM - Bar camera feed drops.\n10:09:53 PM - Camera feed returns.\n\nLength of blind spot: 94 seconds.\n\nNOTES:\n- No master power failure occurred anywhere else in the venue.\n- Reboot command came from a valid admin session, not a random outage.\n- The blind spot aligns with the only moment the private bar was visually occluded from the main room by the crowd turning toward the screen.',
    roundReq: 3,
    type: 'CCTV',
  },
  {
    id: 'ev_floor',
    code: 'GABLE',
    title: 'Floor Plan and Sightline Notes',
    content: 'RECOVERED FROM EVENT PLANNING FOLDER\n\nThe party layout placed each of Armaan\'s ten direct invitees at the center of a five-person cluster, with one cluster expanded to six. Handwritten arrows mark clear sightlines from the sound booth to the private bar, plus notes reading DO NOT BLOCK BAR DURING REEL and HOLD CAKE UNTIL ORANGE. A second scribble in the margin reads: keep lane clean for cake camera. The side banquette by the bar arch remains visible even when the main floor turns toward the screen.\n\nThe handwriting is not Armaan\'s. It matches the same black fineliner used on the birthday game cards distributed around the room. The notes explain why Tanvi was managing sightlines, but they also prove someone with access to the plan could predict exactly when the room would turn toward the screen.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_invoice',
    code: 'PARCHMENT',
    title: 'Supplier Invoice Mismatch',
    content: 'DOCUMENT CHECK - PRIVATE BAR INVENTORY\n\nA supplier invoice entered at 5:14 PM lists a replacement aromatic atomizer, imported bitters glassware, and a customs seal reference tied to Tara Singhania\'s art-logistics vendor. The document uses the correct vendor mark but the wrong paper stock, the signature block carries pressure patterns consistent with traced forgery rather than a natural signature, and upload metadata shows the entry was pushed remotely rather than drafted on the venue terminal.\n\nIn plain English: someone wanted the swapped atomizer to look like it arrived through Tara\'s world.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_access',
    code: 'TURNSTILE',
    title: 'Service QR Access Trace',
    content: 'ACCESS CONTROL TRACE\n\n- 7:20 PM - Event-admin credential activates the sound booth\n- 9:57 PM - Same credential opens the sound booth again\n- 10:08 PM - Service QR enters private bar during blind spot\n- 10:09 PM - Same QR exits private bar\n\nThe service QR used at 10:08 PM belongs to a staff apron that had already been clocked out and returned. Someone cloned or reactivated it for a single pass. The only people with legitimate knowledge of the event-admin layer were operations, event staff, and the person who built the system.',
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_binder',
    code: 'QUARRY',
    title: "Armaan's Monday Binder Index",
    content: 'RECOVERED INDEX PAGE - RED FOLDER MARKED MONDAY\n\nSections in the binder include:\n1. Meridien buyout talking points\n2. Excise exposure if timeline leaks\n3. Draft statement shifting rebate structure to S.G.\n4. Customs provenance fallback - T.S.\n5. Shell-ledger exposure - V.V.\n6. Inventory anomaly responsibility - O.C.\n7. Buyer-experience prototype misuse - T.V.\n\nThe folder is not evidence of murder. It is evidence that Armaan had already written scripts for who would take the fall if the room around him ever stopped being loyal.',
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
    id: 'rev_audit',
    code: 'SOLSTICE',
    title: 'Monday Audit Packet',
    content: 'INTERNAL MEMO - DRAFT\nPrepared for Monday post-birthday review with Meridien Beverage Group legal counsel.\n\nThe packet includes a fallback narrative positioning Sneha Ganesh as the operational architect of the undisclosed rebate structure attached to Velvet Ember\'s buyout model. A handwritten note from Armaan reads: if the room turns, give them the planner. Nobody mourns the planner.\n\nThis is the first hard proof that Armaan intended to survive the buyout by sacrificing someone else in public.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_bar',
    code: 'HOLLOW',
    title: 'Private Bar Program Contract',
    content: 'CONTRACT EXTRACT - LAST LIGHT SERVICE RITUAL\n\nKiyaah Rose Raghuwanshi authored the original Last Light service ritual for Velvet Ember under a short consulting agreement that was never fully paid. The agreement states that the final orange-oil spray is applied tableside only to Armaan\'s glass during investor nights because the founder wanted the ritual to feel personal.\n\nAttached message from Armaan: your name staying off this is the price of access.\n\nMeaning: only a small handful of people even knew the finishing spray was part of the kill path.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_formula',
    code: 'BRAMBLE',
    title: "Roddy's Missing Notebook Page",
    content: 'RECOVERED NOTEBOOK FRAGMENT\n\nThe missing page from Roddy\'s botanical notebook describes a bitter-orange carrier stabilized with aconite tincture in a dose small enough to hide under aromatic oil and large enough to trigger collapse within minutes. The reverse side contains a delivery note in Armaan\'s handwriting: we own this now.\n\nIt is both motive and method in one object: Armaan stole the work, and the work later described exactly how he died.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_tax',
    code: 'COBALT',
    title: "Victoria's Signature Sheet",
    content: 'HANDWRITING COMPARISON - SHELL LEDGERS\n\nThree ledgers tied to Velvet Ember shell companies carry Victoria Vance\'s name but not her natural signature motion. Pressure analysis shows traced starts, hesitation marks, and identical flourish lift-offs across pages allegedly signed days apart.\n\nAttached voicemail from Armaan to Victoria, timestamped the afternoon before the party: Monday gets ugly for somebody. It does not have to be me.\n\nNow the forged supplier invoice from Round 3 has a clearer owner too.',
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_admin',
    code: 'ZEPHYR',
    title: 'Admin Override Trace',
    content: 'EVENT SYSTEM AUDIT\n\nThe 10:08 PM reboot came from an admin credential cloned off Oindrilla\'s build environment and then re-authenticated from the side console she alone had previously configured for offline use. Minutes earlier, a retired staff QR was temporarily re-enabled under the same session tree.\n\nThis is the first point in the case where the room has to stop asking who had motive and start asking who each suspect was quietly helping. One person can poison. One person can forge. One person can stage a blackout. This case has all three at once.',
    roundReq: 5,
    type: 'REVELATION',
  },
  {
    id: 'rev_thread',
    code: 'CATACOMB',
    title: 'Burner Group Transcript',
    content: 'RECOVERED CHAT - UNSAVED BURNER THREAD\n\nDevice metadata places five different guests inside the same unsaved burner group, but the recovered image only resolves initials and fragments, not full names.\n\nExtracts:\nS.G.: monday folder stays upstairs. we finish it tonight.\nK.R.R.: orange is cleaner than bottle.\nV.V.: ledger points at canvas if anyone needs a story.\nR.F.: one serving. no splash. no batch contamination.\nO.C.: reel drops for ninety. qr in and out. after the cheer.\nS.G.: good. no tables. no families. just us.\n\nThis is the twist clue, not the final answer. It proves coordination across five different circles and destroys the theory that one suspect simply used their own group. The room still has to map the initials, the roles, and the method together.',
    roundReq: 5,
    type: 'REVELATION',
  },
];

// Grouped by round first: the Round 5 pair (the admin trace and the burner
// thread) are the twist, and they have to stay behind the Round 4 documents no
// matter where the hash would otherwise put them.
export const REVELATION_CLUES = dealt(REVELATION_DECK, {
  salt: 'reveal',
  group: (clue) => clue.roundReq,
});

export const CONFESSION_CLUE = {
  id: 'confession',
  code: 'KEYSTONE',
  title: 'The Truth',
  content: 'We did it. Sneha designed it. The rest of us made sure the design lived long enough to kill him.\n\nArmaan thought the room existed to absorb his damage. He had already written the Monday script: Sneha for the numbers, Victoria for the ledgers, Oindrilla for the system breach, Tara for the provenance trail if needed, anyone useful turned into collateral if the buyout needed a villain. He wanted five different people frightened enough to stay helpful and isolated enough to stay quiet.\n\nInstead, five of us compared notes. Roddy knew how to hide aconite in the orange carrier. Kiyaah knew Armaan would never let anyone else finish the Last Light. Victoria built the paper trail that shoved suspicion sideways. Oindrilla gave us a blind spot and a cloned pass. Sneha made the room believe each table would only protect its own.\n\nThat was the whole trick. Not poison. Alignment. Armaan had spent years teaching people to think in private humiliations. We answered with public coordination.\n\nHe raised the glass because he always believed the ritual belonged to him. Then the room turned, exactly on time.',
  roundReq: 6,
  type: 'CONFESSION',
  forCharacters: KILLER_IDS,
};

/**
 * THE ANSWER KEY. Read by [CaseSolution.jsx](../components/CaseSolution.jsx) only,
 * and that screen is unreachable until the host sets `revealedToMurderer` — so this
 * is the one block in this file allowed to say plainly what the clue ladder spends
 * seven rounds proving. Nothing here may leak into a round-gated surface.
 *
 * It is a restatement of [STORY.md](../../STORY.md), not a second canon: every beat
 * below is already established by a clue, a case file or a character timeline. If the
 * story changes, change both, and check the beat times still agree with CASE_TIMELINE.
 */
export const CASE_SOLUTION = {
  verdict:
    'Sneha Ganesh led Kiyaah Rose Raghuwanshi, Victoria Vance, Roddy Faustus and Oindrilla Chatterjee in killing Armaan Khanna with aconitine hidden in the orange-oil spray that finished his own birthday drink — while a forged invoice, a 94-second blackout and ten separate circles of friends kept the room looking anywhere but at the five of them.',

  why: [
    'Armaan was two days from closing the Meridien buyout, and the red folder marked MONDAY was his plan for surviving it. It was a written script naming who would take the fall if the room ever stopped being loyal: Sneha for the rebate structure, Victoria for the shell ledgers, Oindrilla for the inventory breach, with Tara\'s customs paperwork and Tanvi\'s prototype held in reserve. His own note in the margin read: if the room turns, give them the planner. Nobody mourns the planner.',
    'Roddy and Kiyaah were not in that binder at all. He had written Roddy off as an outsider and assumed the ritual and the grief sessions still kept Kiyaah quiet. That blind spot is where the conspiracy grew: he never counted the two people who could build the poison and carry it to his hand.',
    'He spent years teaching this room to think in private humiliations, so that no two victims would ever compare notes. Five of them compared notes.',
  ],

  jobs: [
    {
      name: 'Sneha Ganesh',
      group: 'Thimble',
      job: 'The plan',
      lead: true,
      detail:
        'She built the seating chart, the ten circles, and the belief that every table would only ever protect its own. Ten people with real motives, five of them innocent, and no reason for anyone to test whether the killer might be sitting at five different tables at once.',
    },
    {
      name: 'Roddy Faustus',
      group: 'Hemlock',
      job: 'The toxin',
      detail:
        'Aconite tincture cut into a bitter-orange carrier — small enough to vanish under aromatic oil, large enough to stop a heart in minutes. The formula was his own. Armaan had copied the notebook page years earlier and written we own this now on the back of it.',
    },
    {
      name: 'Kiyaah Rose Raghuwanshi',
      group: 'Oracle',
      job: 'The delivery',
      detail:
        'She wrote the Last Light service ritual, so hers were the only hands on that glass that looked ordinary. The consulting contract she was never fully paid for is the same document stating that the final orange-oil spray goes on Armaan\'s glass alone.',
    },
    {
      name: 'Oindrilla Chatterjee',
      group: 'Amber',
      job: 'The blind spot',
      detail:
        'The 10:08 PM projector reboot came from an admin credential cloned off her own build environment and re-authenticated from an offline side console only she had configured. The same session tree briefly re-enabled a retired staff QR — one pass in, one pass out.',
    },
    {
      name: 'Victoria Vance',
      group: 'Forgery',
      job: 'The false trail',
      detail:
        'A supplier invoice pushed into the bar inventory remotely at 5:14 PM, before a single guest arrived, giving the replacement atomizer a paper history running through Tara Singhania\'s customs vendor. Her job was never poison. Her job was where the room would look afterwards.',
    },
  ],

  // `hidden: true` marks a beat nobody on the floor could have seen. Those carry the
  // signal marker and the bone weight; the public record stays dim, the same two-tier
  // treatment the Timeline screen uses for critical beats.
  sequence: [
    {
      time: '5:14 PM',
      hidden: true,
      body: 'Doors are still shut. Victoria pushes a forged supplier invoice into the private-bar inventory from off-site, logging a replacement aromatic atomizer against Tara\'s customs vendor. The twin now has a paper history.',
    },
    {
      time: '7:25 PM',
      hidden: true,
      body: 'Roddy arrives with a gift box of rare botanicals that never reaches the gift table. The poisoned atomizer is inside it — already filled, already labelled EMBER ORANGE, an exact twin of the one behind the bar.',
    },
    {
      time: '7:40 PM',
      body: 'Kiyaah comes in through the service entrance to inspect the private bar, at Armaan\'s own request. She confirms where the original atomizer sits and how the bar will be staffed during the reel.',
    },
    {
      time: '9:50 PM',
      body: 'Sneha argues with Armaan in the upstairs booth over the red folder marked MONDAY. She leaves composed. The folder stays upstairs, which is the only part of that conversation that mattered.',
    },
    {
      time: '9:55 PM',
      body: 'The tribute reel starts beside the private bar and the room turns toward the screen — exactly as the annotated floor plan predicted. Its margin notes read DO NOT BLOCK BAR DURING REEL and HOLD CAKE UNTIL ORANGE.',
    },
    {
      time: '10:02 PM',
      hidden: true,
      body: 'Roddy carries the botanical case into the prep-room corridor and leaves a wrapped service roll on the prep pass. The poisoned twin is inside it.',
    },
    {
      time: '10:05 PM',
      body: 'Roddy comes back out onto the floor without the case he carried in. Several guests notice. Nobody yet knows what was in it.',
    },
    {
      time: '10:06 PM',
      hidden: true,
      body: 'While walking staff through the Last Light garnish sequence, Kiyaah collects the wrapped roll from the prep pass. The two never hand each other anything — prep-room linen fibres on the atomizer\'s neck are all that survives of the exchange.',
    },
    {
      time: '10:08:14 PM',
      hidden: true,
      body: 'Oindrilla forces a projector reboot from the event-admin terminal. To the floor it is a glitch in the birthday video. Five seconds later the private-bar camera drops.',
    },
    {
      time: '10:08–10:09',
      hidden: true,
      body: 'Ninety-four seconds of blind spot. Kiyaah goes in over a service apron and the reactivated staff QR — not her own credential — so the access log records a member of staff who had already gone home, and swaps the original silver atomizer for the twin. She had every right to be behind that bar; what she needed was for the log not to say so. Anjul sees the apron come back down the service stair at 10:09 and clocks that the face under it is not staff. The blackout killed the camera, not every sightline: Parinitha, on the side banquette by the bar arch, sees the swap itself.',
    },
    {
      time: '10:09:53 PM',
      body: 'The camera feed returns and the reel resumes. The room turns back to a bar that looks exactly as it did ninety-four seconds ago.',
    },
    {
      time: '10:12 PM',
      hidden: true,
      body: 'Armaan raises the Last Light and Kiyaah finishes it tableside with two sprays over the top of the glass. That garnish is the murder. Aconitine reaches the rim, his lips and the drink at once — one serving, no splash, nothing else in the room touched.',
    },
    {
      time: '10:19 PM',
      body: 'His hands stop working mid-sentence. Aconitine takes the nerves first and the heart immediately after. Minutes, not hours — which is why the last person to touch the glass is the only one who could have done it.',
    },
    {
      time: '10:22 PM',
      body: 'He collapses at the stage rail. Roddy is kneeling beside him before the room finishes screaming — the one person there who already knows exactly what he is looking at.',
    },
    {
      time: '10:24 PM',
      hidden: true,
      body: 'Victoria tells the first officer to seize the inventory logs. She wants her forged invoice found early, by the police, before anyone can ask how it got there.',
    },
    {
      time: '10:48 PM',
      body: 'Goa Police seal the venue. Nobody has left. Nobody needed to — all five of them are still in the room, sitting in five different circles.',
    },
  ],

  misdirection: [
    'Ten people here had a real, provable reason to want Armaan dead. Five of them were innocent: Tara Singhania, Tanvi Vartak, Rishi Raj Rahul, Vinod Raghuwanshi and Anna Russo. A coherent single-killer case could be built against any of them, and most of the room built one.',
    'The killers sat in five separate circles — Thimble, Oracle, Forgery, Hemlock and Amber — so no single table ever looked complete. Every Round 1 accusation pointed at a suspect\'s own people covering for them, and that theory can never close on a five-way alignment.',
    'Tara was framed, not involved. The forged invoice was built to piggyback on access to the display and customs world that was entirely legitimate, so that the swapped atomizer would look like it arrived through her.',
    'Tanvi was not framed and not involved — she was used. The annotated floor plan really is hers, in her own fineliner, written for a cake reveal: DO NOT BLOCK BAR DURING REEL and HOLD CAKE UNTIL ORANGE are stage directions, not instructions. Sneha arrived at 7:05 with the seating plan Armaan wanted rearranged, which is where she learned that Tanvi had already worked out, on paper, the exact second the whole room would turn its back on the private bar. The conspiracy did not have to engineer a blind spot in the crowd. The party planner had drawn them one.',
    'The blackout was meant to be found. It is the obvious opportunity window, and it pulled the room toward the ninety-four seconds instead of the fifteen minutes before them, when the poison was already in the building and the paperwork was already six hours old.',
  ],

  proof: [
    { clue: 'Toxicology Summary', proves: 'The bottles, the batch mixers and the cake were clean. The poison lived in one finished drink.' },
    { clue: 'Signature Drink Atomizer Analysis', proves: 'The silver mister was a twin, not the bar\'s own listed piece — and its neck carried prep-room linen fibres.' },
    { clue: 'Projector and Bar-Camera Log', proves: 'Ninety-four seconds of blind spot, ordered from a valid admin session. An interruption, not an outage.' },
    { clue: 'Floor Plan and Sightline Notes', proves: 'The moment the room would turn away from the bar was predictable in advance — and the side banquette stayed in view throughout, which is why there is still a witness to the swap.' },
    { clue: 'Service QR Access Trace', proves: 'One pass in and one pass out of the private bar during the blind spot, on a staff credential whose owner had already clocked out.' },
    { clue: 'Supplier Invoice Mismatch', proves: 'Someone built the twin a paper history through Tara\'s vendor: traced signature, wrong stock, entered remotely.' },
    { clue: "Armaan's Monday Binder Index", proves: 'He had already written down who would take the fall for him, by initials.' },
    { clue: 'Admin Override Trace', proves: 'The reboot and the revived staff QR came from one session tree built on Oindrilla\'s environment.' },
    { clue: 'Burner Group Transcript', proves: 'Five guests, five sets of initials, five jobs, one unsaved thread. Coordination, across circles.' },
  ],
};

export const CASE_FILES = [
  {
    id: 'f_incident',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: '8 August 2026',
    content: 'GOA POLICE - PANJIM DIVISION\n\nINCIDENT TYPE: Suspicious death\nVICTIM: Armaan Khanna - Founder and CEO, Velvet Ember Spirits\nLOCATION: For the Record, Panjim, Goa\nTIME OF COLLAPSE: 10:22 PM\nTIME OF DEATH: 10:34 PM\n\nSUMMARY:\nArmaan Khanna collapsed during his birthday event after consuming a signature drink prepared at the private bar. The party involved 51 guests: ten direct invitees personally chosen by the victim, each bringing their own smaller circle.\n\nThe venue was sealed at 10:48 PM. No guest left before police arrival.\n\nLEAD INVESTIGATOR: Inspector Ira Deshpande\nSTATUS: Active investigation',
    stamped: true,
    roundReq: 0,
  },
  {
    id: 'f_autopsy',
    type: 'REPORT',
    title: 'TOXICOLOGY REPORT',
    date: '8 August 2026',
    content: 'STATE FORENSIC SCIENCE LABORATORY - GOA\nFIELD SCREEN - PRELIMINARY. Full panel to follow.\n\nCAUSE OF DEATH: Acute aconitine toxicity\nSOURCE: Victim-specific finishing stage of one drink\n\nFINDINGS:\n- Blood and saliva positive for aconitine\n- Shared bottles, mixers, and cake negative\n- Highest environmental residue on private-bar atomizer nozzle and victim glass rim\n\nCONCLUSION:\nThe poison was not in the batch. It was applied to Armaan\'s drink alone.',
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_security',
    type: 'REPORT',
    title: 'SECURITY AND DEVICE LOG',
    date: '8 August 2026',
    content: 'VENUE DEVICE SUMMARY\n\n10:08 PM - Projector reboot issued from event-admin console\n10:08 PM - Private-bar camera feed lost for 94 seconds\n10:08 PM - Retired staff QR reactivated for one bar-entry event\n\nNo venue-wide power failure occurred. This was an intentional interruption, not a random outage.',
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_audit',
    type: 'REPORT',
    title: 'MERIDIEN BUYOUT MEMO',
    date: '7 August 2026',
    content: 'MERIDIEN BEVERAGE GROUP - DRAFT CLOSING NOTES\nRecovered from the victim\'s own files, dated the day before the party.\n\nThe buyout was scheduled to move into legal diligence on Monday. Attached fallback notes identify possible internal scapegoats should rebate disclosures, shell payments, customs provenance, or inventory anomalies surface during review. Several of those fallback notes point to guests in this room by initials.',
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_inventory',
    type: 'REPORT',
    title: 'PRIVATE BAR INVENTORY',
    date: '8 August 2026',
    content: 'PRIVATE BAR CHECKLIST\n\n- One original silver atomizer assigned to Last Light service\n- One twin recovered after the death, never checked in against any bar record\n- A replacement atomizer does appear on a supplier invoice entered at 5:14 PM, on mismatched paper stock with a traced signature\n- No member of bar staff remembers taking delivery of it\n\nThe paperwork for the second atomizer was created before the party. The atomizer itself never came through the door that paperwork claims it came through.',
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_tax',
    type: 'REPORT',
    title: 'EXCISE AND SHELL-COMPANY FILE',
    date: 'June-August 2026',
    content: 'FINANCIAL REVIEW EXTRACT\n\nThree shell-company ledgers tied to Velvet Ember carry forged authorizations, rebate structures hidden from the buyout model, and the beginnings of a blame map designed for Monday morning. Whoever killed Armaan did so on the eve of a larger collapse already in motion.',
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
// Clue codes used to arrive on printed cards the host handed out. They now
// arrive by solving a riddle: solve one, and the next clue in *your* queue
// unseals, code and all, which you are then free to shout across the room.
//
// Accusations are not in the pool. Every player is already dealt exactly one
// automatically the moment Round 1 opens, and the confession belongs to the
// killers alone — neither is something to be won. What is left is the three
// decks that used to be paper: motives, evidence, revelations.
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
 * because if all 51 devices paid out in the same order the room would hold 51
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
 * or two riddles all evening. Measured across the 51-person roster the hash sort
 * paid out PENDULUM to 7 players and OBELISK to 8 while LATTICE — Oindrilla's
 * motive, a killer's — was the opening prize for exactly one. If that one player
 * never tapped ASK, a conspirator's motive could sit in the room unspoken all
 * night.
 *
 * Rotating by a raw hash does not fix it either, and that is the trap: `hash %
 * 10` inherits the hash's bias in its low bits, which measured *worse* (one code
 * to 12 players, another to 1). The offset has to be an **ordinal** — the
 * player's position in a stable shuffle of the roster, 0 to 50 — because
 * consecutive integers are what make `% blockLength` uniform. 51 players over a
 * 10-card block is then five or six openers each by construction, with no hash
 * luck left in it.
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
  // The blocks are 10, 7, 4 and 2 cards; 10 and 7 are coprime, so two players
  // who share a motive opener almost never share an evidence opener too.
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

export const getKillers = () => {
  return CHARACTERS.filter((character) => character.role === 'MURDERER');
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

// Login codes and clue codes are two namespaces that must never intersect.
//
// They did once. The ten motive clues were coded THIMBLE, ORACLE, FORGERY,
// HEMLOCK, AMBER … — the same strings as the ten prime suspects' login codes.
// Round 2 works by players shouting motive codes across the room, so within
// minutes the whole party held the five killers' credentials: log out, type
// THIMBLE, and the Identity screen prints "Classified · Killer". The case was
// over in Round 2.
//
// Nothing in the app would have complained, so this does. Dev-only and
// non-fatal: a live game must never be taken down by a data assertion, but a
// build that reintroduces the overlap should be impossible to miss locally.
if (import.meta.env?.DEV) {
  const loginCodes = new Set(Object.keys(LOGIN_CODE_MAP));
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

  // Riddle answers are the third namespace reachable from a keyboard, and they
  // leaked into the other two: `echo` and `cloud` were Fabiola's and Mahi's
  // login codes, `compass` was Roddy's accusation code. Solve r001, log out,
  // type ECHO, and you are somebody else.
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
    setup: `Before you start: confirm all ${CASE_META.playerCount} players have arrived and have their printed login cards. There are no clue cards to hand out any more - clues are won in the app by solving riddles, and the codes spread from player to player. Your only job on distribution is to keep telling the room to share.`,
    announce: `"Welcome to For the Record in Panjim, Goa. The night is ${CASE_META.date}. Armaan Khanna invited ten close friends to his birthday and told each of them to bring people interesting enough not to bore him. Hours later, he is dead.\n\nYour phone is your case file. Log in with the code on your card. Nobody is going to hand you evidence tonight - you earn it. From Round 2 a button marked ASK appears on your Evidence screen. Tap it and you get a riddle, nothing to do with this case. Solve it and a new clue unseals on your phone, along with a code. Read that code out and everybody who types it into CODE gets the same clue. The first two rounds are the room getting its bearings - the earning starts when that button arrives. Stay in character. Share carefully. Lie if you have to. The room wins only if it names the right team, not just the loudest suspect."`,
    during: 'Help late arrivals log in and point everyone toward their Identity and Story screens before the first vote. ASK is not on their screens yet - it appears when you advance to Round 2 - so tell them the loop now and let the button arrive to a room that already knows what it is for. If anyone goes hunting for it early, that is the answer.',
    end: 'When the room is settled, advance to Round 0 and let the briefing play.',
  },
  {
    id: 0,
    title: 'Round 0 · The Incident',
    duration: '10-15 min',
    setup: 'The Incident Report is unlocked by default. Once the room has read the story, open voting for the blind first ballot.',
    announce: `"Round 0. The Incident. Armaan Khanna collapsed at 10:22 PM after taking the first drink of his birthday ritual. He was pronounced dead at 10:34. All ${CASE_META.playerCount} of us are still inside For the Record.\n\nOpen Story first. Then open Evidence and read the Incident Report in Case Files. Then open Guests and look around the room. When I open the ballot, cast your first blind vote before anyone has earned certainty."`,
    during: 'Let the room meet each other in character. Once they have read the briefing, open voting for a quick blind first vote and then close it before Round 1.',
    end: 'Advance to Round 1 when the first vote is in and the room has started accusing out loud.',
  },
  {
    id: 1,
    title: 'Round 1 · Accusations',
    duration: '~15 min',
    setup: 'No physical cards here. Every player automatically receives one accusation on the Evidence screen the moment Round 1 starts.',
    announce: '"Round 1. Accusations. Open Evidence and read the accusation waiting for you. These are witness claims about the ten prime suspects. Use them loudly, quietly, honestly, or not at all. The room should feel like each suspect might have worked with their own people. Let that theory breathe."',
    during: 'Push conversation across tables. If the room goes quiet, ask any player to read their accusation aloud.',
    end: 'Advance to Round 2 when the suspect map feels alive and messy.',
  },
  {
    id: 2,
    title: 'Round 2 · Motives',
    duration: '~15 min',
    setup: 'Nothing to hand out. The riddle lock opens itself the moment Round 2 starts - the ASK button appears on every Evidence screen, and knocks once the first time each player looks at it - and the ten motive files are now the prize pool. Every player is working down a different order, so the room cross-pollinates on its own - as long as they share.',
    announce: '"Round 2. Motives. The riddle lock is live - open Evidence and you will see a second button, ASK, that was not there a minute ago. Tap it, solve the riddle, and you get one of ten motive files - plus a code. Read the code out. Everyone else types it into CODE and gets the same file. Nobody is holding the same clue as the person next to them, so the only way this room sees all ten is if you keep talking. Share them. Distort them. Protect yourself with them if you need to."',
    during: 'If anyone cannot find ASK or CODE, remind them both live bottom right on the Evidence screen. Watch for players hoarding codes - call it out warmly and often.',
    end: 'Advance to Round 3 when the room has moved from gossip to real theory.',
  },
  {
    id: 3,
    title: 'Round 3 · Evidence',
    duration: '~15-20 min',
    setup: 'Unlock the Round 3 case files and reopen voting for the first evidence-backed ballot. The 7 evidence clues join the riddle pool automatically - no cards, no distribution.',
    announce: '"Round 3. Evidence. Open Case Files inside Evidence. The toxicology and security logs are live. Armaan was not poisoned by the whole room\'s alcohol. One drink was altered at the finishing stage. Seven forensic files have just entered the riddle pool - go and earn them, and pass the codes on. Voting is open again."',
    during: 'This is where bottle theory should start collapsing. Let the room work.',
    end: 'Advance to Round 4 when they begin asking who controlled the bar, the paperwork, and the blackout.',
  },
  {
    id: 4,
    title: 'Round 4 · Revelations',
    duration: '~15-20 min',
    setup: 'Unlock the Round 4 case files. The first four Revelation clues enter the riddle pool on their own the moment the round advances.',
    announce: '"Round 4. Revelations. The story flips here. Armaan did not just have enemies - he had a Monday plan for whose life he would wreck next. Four revelations are in the riddle pool. Solve, share the codes, and read what everyone else has unsealed. You are no longer solving one motive. You are solving overlap."',
    during: 'Listen for the room to move from one-table theories toward linked suspects.',
    end: 'Advance to Round 5 once at least one group starts suspecting coordination across circles.',
  },
  {
    id: 5,
    title: 'Round 5 · Finale',
    duration: '~10-15 min',
    setup: 'The final two Revelation clues unlock in the riddle pool automatically. Keep voting open or reopen it if you want a last locked-in ballot before the reveal.',
    announce: '"Round 5. Finale. The last two revelations are in the pool - somebody solve them and get those codes into the room. If you only name one person, you may still be wrong. Work out who planned it, who enabled it, and who made the room look the wrong way while it happened."',
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
