// --- GAME DATA: GREENR: LAST SEATING (Case 2609-G) ---
//
// Canon lives in STORY.md. Every string here restates that file.
// 26 players, 10 suspects, 3 killers.

export const ROUNDS = [
  { id: 0, title: 'The Incident', desc: 'Read the report and the room' },
  { id: 1, title: 'Accusations', desc: 'What did you see?' },
  { id: 2, title: 'Motives', desc: 'Who needed him stopped?' },
  { id: 3, title: 'Evidence', desc: 'Forensics and venue records' },
  { id: 4, title: 'Revelations', desc: 'The shape of the fraud' },
  { id: 5, title: 'Finale', desc: 'Make your case' },
  { id: 6, title: 'The Reveal', desc: 'Case closed' },
];

const killer = (data) => ({ ...data, role: 'MURDERER', isSuspect: true });
const suspect = (data) => ({ ...data, role: 'SUSPECT', isSuspect: true });
const witness = (data) => ({ ...data, role: 'WITNESS', isSuspect: false });

const stableHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
};

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

  for (let guard = 0; guard < out.length; guard += 1) {
    const offender = out.findIndex((item, index) => index < safeTop && isHot(item));
    if (offender === -1) break;
    const [item] = out.splice(offender, 1);
    const room = out.length - safeTop + 1;
    const slot = safeTop + (Math.abs(seeded(`${salt}:slot`, item.id)) % room);
    out.splice(slot, 0, item);
  }

  return out;
};

const ROSTER = [
  killer({
    id: 'char_jack',
    name: 'Jack',
    profession: 'Deal Counsel',
    group: 'LEGAL',
    bio: `External deal counsel for the Greenr launch dinner: calculating, diplomatic, ruthless, and never far from a clean copy of a dirty document.`,
    quirk: `Calls gossip discovery and smiles at bad news if he thinks nobody is watching.`,
    secret: `You are one of the three people who killed Rehan Vora, and the plan was yours. His corrected diligence pack named the hidden carry note, the sham advisory retainers and the two other people whose fraud only survived while yours did. You built the frame on Nilisha, pulled the founders to the long table during the crash, and made the room read paper before it read the body.`,
    neverDo: 'Miss a clause that moves control.',
    motive: `Rehan's sunset corrections did not just embarrass Jack. They exposed the private 6% success-fee note he buried in side letters, plus the advisory retainers he used to mirror it off-book. If he spoke at 6:30, the raise froze, the closing died and Jack stopped being counsel and started being evidence.`,
    timeline: `5:02 PM - Arrived with the signing folder and two fountain pens.\n5:32 PM - In a side room with Rehan, came out tight-jawed.\n5:58 PM - Pulled Anushka and Anmoll to the long table over a "signature mismatch."\n6:05 PM - Still at the folder, swapping in pages nobody remembered handing him.\n6:18 PM - First to say Nilisha's sponsor deck had "finally blown up."`,
    code: 'OBELISK',
  }),
  killer({
    id: 'char_arun',
    name: 'Arun',
    profession: 'Launch Film Director',
    group: 'MEDIA',
    bio: `Media and film director for the launch reel, witty and restless, more comfortable behind a monitor than inside a promise.`,
    quirk: `Says "one more take" even after wrap.`,
    secret: `You are one of the three people who killed Rehan Vora. At 4:46 you scheduled the AV sync that blanked the live courtyard and mezzanine feeds from 5:58 to 6:11, dragged the guest network and card reader down with it, then looped the sunset reel and deleted the buffered corridor capture that mattered. Nobody is accusing the film guy of murder yet. Keep it that way.`,
    neverDo: 'Roll on a battery under twenty percent.',
    motive: `Rehan traced a stack of ghost production retainers and sponsor-deliverable invoices to Arun's shell studio. Old reels had been rebilled as fresh work, recycled B-roll had been sold as bespoke sponsor cuts, and the launch numbers built on top of them would not survive the first real question.`,
    timeline: `4:46 PM - Ran the final AV check with the admin tablet.\n5:40 PM - Told Elton the reel would "carry itself" through sunset.\n5:58 PM - The sync hit; cameras and Wi-Fi dropped together.\n6:03 PM - Claimed he was rebooting the booth alone.\n6:19 PM - Said there was "no usable upstairs footage" before anyone asked him to check.`,
    code: 'HALCYON',
  }),
  killer({
    id: 'char_manasi',
    name: 'Manasi',
    profession: 'Beverage Partner',
    group: 'BAR',
    bio: `Menace, sneaky, smart - the drinks partner who knows every bottle in the house and most of the room's gossip.`,
    quirk: `Can identify a pour by the sound of the cap coming off.`,
    secret: `You are one of the three people who killed Rehan Vora. The yellow-oleander concentrate was yours, reduced into a brown bitters dropper the night before and walked in inside a tasting case. At 6:02, during Arun's blind spot, you used the pantry service key to paint it inside Rehan's black bottle, then put the dropper back washed, wet and upside down.`,
    neverDo: 'Waste a clean pour.',
    motive: `Rehan found duplicate beverage invoices, returnable stock billed as consumed, and a shell distributor sitting between Greenr and Manasi's real supplier. The skim was elegant only while nobody reconciled the crates against the buyback ledger. Rehan reconciled it.`,
    timeline: `4:28 PM - Arrived with tonic crates and a brown bitters case.\n5:21 PM - In the ice room checking bottle count with Amrusha.\n5:57 PM - Took the bitters case toward the upstairs service stair for the welcome pour.\n6:02 PM - Used the pantry route during the sync window.\n6:16 PM - Back at the bar, furious that nobody should touch the rinsed dropper.`,
    code: 'TRESTLE',
  }),
  suspect({
    id: 'char_anushka',
    name: 'Anushka',
    profession: 'Founder and Creative Director',
    group: 'FOUNDERS',
    bio: `Warm, cold, paranoid - the founder-face of the project, all polish until a control point moves.`,
    quirk: `Fiddles with rings instead of answering directly.`,
    secret: `Jack told you, too early and too vaguely, that Rehan wanted to pause the signing. You hid the corrected cap-table printout for six minutes because it would have diluted you and exposed sloppy founder-float reimbursements. Then you put it back. You are guilty of panic, not murder.`,
    neverDo: 'Give up control of something I built.',
    motive: `Rehan's revisions cut Anushka's founder carry, exposed a few ugly founder-float reimbursements and turned tonight from a launch into a correction. That is enough motive for the room, even though it is not enough truth for the case.`,
    timeline: `4:50 PM - Walked the courtyard lighting with Aashna.\n5:32 PM - Argued with Rehan by the herb wall.\n5:58 PM - At Jack's table over a "signature mismatch."\n6:10 PM - Still with the founders, visibly furious.\n6:18 PM - In the courtyard when Sharon shouted.`,
    code: 'LANTERN',
  }),
  suspect({
    id: 'char_anmoll',
    name: 'Anmoll',
    profession: 'Founder and Capital Partner',
    group: 'FOUNDERS',
    bio: `Loyal, impulsive, manipulative founder-backer with a talent for talking cashflow until it sounds moral.`,
    quirk: `Can shake his ears vigorously when he is cornered and hates that people know it.`,
    secret: `You used launch-float money to cover a payroll gap elsewhere and paid it back three days later. Rehan found the transfer and named it what it was: a private bridge you never disclosed. It looks horrible. It still does not make you a killer.`,
    neverDo: 'Break a repayment promise I have already made.',
    motive: `The undocumented float transfer tied straight to Anmoll's personal guarantees. If Rehan read it aloud, the room would hear "founder used event money to plug a hole" and stop listening before the rest of the sentence arrived.`,
    timeline: `4:42 PM - Arrived late, already on two calls.\n5:18 PM - Asked Pujah for coffee strong enough to sign with.\n5:58 PM - Dragged to Jack's table about the bridge note.\n6:09 PM - Called someone from the side gate and got no signal.\n6:18 PM - With Anushka and Jack when the body was found.`,
    code: 'BELLWETHER',
  }),
  suspect({
    id: 'char_nilisha',
    name: 'Nilisha',
    profession: 'Growth Lead',
    group: 'MARKETING',
    bio: `Confident, competitive, optimistic marketer with a deck for every mood and numbers for every argument.`,
    quirk: `Marks stress by tapping dance counts under the table.`,
    secret: `You inflated RSVP and influencer-commit numbers to calm investors. That is embarrassing and career-risking, and somebody used that habit to frame you with sponsor approvals you never sent. The room is about to learn the numbers were soft. It must also learn the emails were born last night.`,
    neverDo: 'Walk into a room without a number I can defend.',
    motive: `Nilisha's vanity metrics and sponsor optimism were real enough to make the forged packet against her believable. If the launch collapsed onto her desk, a dozen people would accept the answer because they were already halfway there.`,
    timeline: `4:38 PM - Oversaw the welcome board and sponsor cards.\n5:41 PM - Printed a revised partner slide.\n5:58 PM - At the front desk arguing that the sponsor QR should still scan offline.\n6:07 PM - Called Jack a liar about the approval email.\n6:18 PM - On the lawn in tears when the scream came.`,
    code: 'VESSEL',
  }),
  suspect({
    id: 'char_amrusha',
    name: 'Amrusha',
    profession: 'Venue Partnerships Lead',
    group: 'HOSPITALITY',
    bio: `Charming, chaotic, honest hospitality lead who knows every service door and every person who needs one.`,
    quirk: `Can dance full-out in heels while solving a seating problem.`,
    secret: `You rerouted one server and one seating card to protect a VIP ego. That makes the service record uglier than the truth and gives the room a way to imagine you hiding the murder route in plain sight. You did hide a route. Just not that one.`,
    neverDo: 'Tell the same lie twice.',
    motive: `Amrusha promised Greenr exclusivity before the contract cleared and used one event deposit to hold the date. Rehan had the paper trail. A room that wants a venue-access suspect will like her too much.`,
    timeline: `4:25 PM - First on site with the Greenr manager.\n5:23 PM - Reset the service flow with Manasi.\n5:58 PM - At the bar-pass when the network and card machine died.\n6:04 PM - Sent one server downstairs and held tonic refills for two minutes.\n6:18 PM - In the courtyard service lane when Yonella shouted.`,
    code: 'CITADEL',
  }),
  suspect({
    id: 'char_saima',
    name: 'Saima',
    profession: 'Guest Systems Engineer',
    group: 'ENGINEERING',
    bio: `Playful, dramatic, fearless engineer who built the guest check-in flow and loves when a system behaves.`,
    quirk: `Cooks for people she plans to argue with.`,
    secret: `You left a logging shortcut in the guest stack because launch week was chaos. It is the kind of competent shortcut that turns into a moral failure after a death. The 5:58 crash points straight at your work even though the real trigger came from elsewhere.`,
    neverDo: 'Ship a live fix without knowing how to roll it back.',
    motive: `The front-desk crash made Saima look like the easiest answer in the building: the engineer whose own launch stack failed at the exact minute the victim lost his clean corridor. Rehan had already warned her the shortcut would read badly in diligence.`,
    timeline: `4:36 PM - Ran the QR check-in test with Umair.\n5:30 PM - In the courtyard fixing one guest badge.\n5:58 PM - Moved before anyone finished saying "it's down."\n6:01 PM - On the network cabinet under the staircase, cursing.\n6:18 PM - Still downstairs with Umair and Shivansh when the scream landed.`,
    code: 'UPLINK',
  }),
  suspect({
    id: 'char_umair',
    name: 'Umair',
    profession: 'Finance Automation Engineer',
    group: 'ENGINEERING',
    bio: `Observant, blunt, competitive builder of the dashboards nobody notices until they are wrong.`,
    quirk: `Functions on less sleep than the room trusts.`,
    secret: `You picked up Rehan's unattended phone at 5:35 and read one line naming your reimbursement dashboard beside the phrase "rounding mask." You put it back and told nobody. The panic made you look worse, because honest people do not usually have to explain why their fingerprints are on the victim's screen.`,
    neverDo: 'Guess when the numbers can be checked.',
    motive: `Umair's reimbursement logic hid duplicate payouts so neatly it looked designed. Rehan had enough of the back end by sunset to make a blunt engineer sound like a subtle fraudster.`,
    timeline: `4:36 PM - Tested the check-in stack with Saima.\n5:35 PM - Alone near Rehan's phone for thirty seconds.\n5:58 PM - Under the stairs with Saima when the crash hit.\n6:06 PM - Asked who schedules a maintenance window inside a reel sync.\n6:18 PM - With Saima and Shivansh when the body was found.`,
    code: 'RADIAN',
  }),
  suspect({
    id: 'char_sampada',
    name: 'Sampada',
    profession: 'Movement Ambassador',
    group: 'WELLNESS',
    bio: `Chaotic, curious, ambitious coach who can sell a class by walking into it.`,
    quirk: `Can do a sober handstand to prove a point.`,
    secret: `You overstated certification hours and begged Rehan to keep the waiver issue out of the investor deck. He would not. You cried in the pantry during the suspect window, which is exactly the kind of truth that sounds like a lie once murder is in the room.`,
    neverDo: 'Coach a room I am not ready for.',
    motive: `A padded resume and sloppy liability waivers were enough to end Sampada's contract in one public paragraph. The room will not care that she cried because she was frightened, not because she had just killed a man.`,
    timeline: `4:55 PM - Rehearsed the mobility demo with Shivangi and Shivali.\n5:54 PM - Went upstairs to fetch resistance bands.\n6:03 PM - In the pantry, crying hard enough to smear liner.\n6:11 PM - Back in the courtyard, claiming the bands were missing.\n6:18 PM - Near the stage when Sharon called for space.`,
    code: 'PINNACE',
  }),
  witness({
    id: 'char_saanvi',
    name: 'Saanvi',
    profession: 'Dental Wellness Partner',
    group: 'HEALTH',
    bio: `Quiet, loyal, observant dentist brought in for the members-clinic collaboration.`,
    quirk: `Cooks when she is hiding from people.`,
    secret: `You slipped upstairs to answer a message from someone you had ghosted and saw Manasi at the herb-walk end of the pantry service stair with a brown dropper. You kept walking because you were also reading a text that was not yours to read. Now you have to decide whether to admit both.`,
    neverDo: 'Break patient confidence.',
    motive: `Saanvi is not a suspect. She matters because she places Manasi and the dropper at the upstairs service route during the blind spot.`,
    timeline: `4:48 PM - Arrived with Anshu for the clinic walkthrough.\n5:40 PM - In the courtyard discussing the dental nook.\n5:56 PM - Slipped upstairs to answer a message.\n6:00 PM - Passed Manasi at the herb-walk end of the pantry service stair with a dropper bottle.\n6:18 PM - Back downstairs when the library shout went up.`,
    code: 'SORREL',
  }),
  witness({
    id: 'char_anshu',
    name: 'Anshu',
    profession: 'Dental Wellness Partner',
    group: 'HEALTH',
    bio: `Blunt, secretive, observant dentist who treats pitch language like plaque.`,
    quirk: `Insists there is no hidden talent while noticing everything.`,
    secret: `You accidentally sent Kiandra a photo of Jack's signing folder at 5:17 while trying to send it to yourself. When the folder resurfaced after the death, two pages were not in your photo. The mistake you are embarrassed by is now evidence.`,
    neverDo: 'Call a record clean when it is not.',
    motive: `Anshu is not a suspect. The mistaken photo proves the signing packet changed after 5:17.`,
    timeline: `4:48 PM - Walkthrough with Saanvi.\n5:17 PM - Snapped the signing table for layout reference.\n5:58 PM - At the long table when the crash hit.\n6:05 PM - Noticed Jack feeding in pages.\n6:18 PM - In the courtyard, far from the library.`,
    code: 'INKWELL',
  }),
  witness({
    id: 'char_kiandra',
    name: 'Kiandra',
    profession: 'Dental Illustrator',
    group: 'HEALTH',
    bio: `Curious, patient, analytical dentist who doodles everything within reach.`,
    quirk: `Can draw your pet badly and still remember where every object in the room was.`,
    secret: `You sketched the upstairs tea shelf out of boredom at 5:50. Rehan's bottle sat upright against the left bookend then. When you went back after the scream, it was two feet away on the right side with tonic spray on the wood.`,
    neverDo: 'Pretend I did not notice a detail once I have noticed it.',
    motive: `Kiandra is not a suspect. Her sketch is the cleanest proof that the bottle moved during the blind spot.`,
    timeline: `4:58 PM - Sketched table details while waiting for sunset.\n5:50 PM - Drew the upstairs tea shelf.\n6:03 PM - Downstairs at the mocktail bar.\n6:18 PM - Followed Yonella upstairs after the scream.\n6:25 PM - Realized the bottle had moved.`,
    code: 'FABLE',
  }),
  witness({
    id: 'char_shivansh',
    name: 'Shivansh',
    profession: 'Policy Liaison',
    group: 'POLICY',
    bio: `Charming, chaotic, optimistic fixer who knows which permits matter and which only scare people.`,
    quirk: `Can doze off anywhere for ten seconds and wake up with a plan.`,
    secret: `The excise-permit panic was nonsense. You personally uploaded the stamped copy at 5:12 and watched Greenr receive it. Whoever used that story to move people invented a problem that was already solved.`,
    neverDo: 'Lie to a regulator who can check.',
    motive: `Shivansh is not a suspect. He kills the permit story that helped scatter the room.`,
    timeline: `4:40 PM - Checked the paper file with Greenr management.\n5:12 PM - Uploaded the stamped excise copy.\n5:58 PM - Under the stairs with Saima and Umair when the crash hit.\n6:04 PM - Told Amrusha the permit story was fake.\n6:18 PM - Still downstairs when the body was found.`,
    code: 'TRUANT',
  }),
  witness({
    id: 'char_shivani',
    name: 'Shivani',
    profession: 'Spatial Designer',
    group: 'DESIGN',
    bio: `Secretive, manipulative, quiet architect who notices every line a room forces people to walk.`,
    quirk: `Thinks dal-rice is a personality trait.`,
    secret: `You know the screen wall was rolled thirty centimetres left at 5:40 for cleaner framing. That blocked the courtyard camera's view of the service-stair mouth after the feeds returned. During the sync, only the separate mezzanine recorder still buffered that corridor - the clip Arun later deleted.`,
    neverDo: 'Sign off a layout I have not stress-tested.',
    motive: `Shivani is not a suspect. She explains why the courtyard camera could not recover the service route after the feeds returned.`,
    timeline: `4:20 PM - On site measuring the stage and corridor.\n5:40 PM - Saw the screen wall rolled left for cleaner framing.\n5:58 PM - In the courtyard checking candles.\n6:02 PM - Noted the courtyard camera had lost the service-stair mouth.\n6:18 PM - With Aashna on the lawn when the scream came.`,
    code: 'LATTICE',
  }),
  witness({
    id: 'char_yonella',
    name: 'Yonella',
    profession: 'Campaign Face and Project Manager',
    group: 'OPERATIONS',
    bio: `Creative, ambitious, honest producer-model hybrid running the evening with a clipboard and perfect posture.`,
    quirk: `Can open a beer bottle with her teeth and would prefer not to discuss it.`,
    secret: `The 5:58 AV sync was not on your master run sheet. When the welcome line stalled, you sent Nathan upstairs to fetch Rehan and stayed at the mic to keep the room from spilling into the service lane. His shout brought Sharon running.`,
    neverDo: 'Walk a show without a run sheet.',
    motive: `Yonella is not a suspect. She proves the AV interruption was unscheduled and controls the room when discovery breaks it open.`,
    timeline: `4:10 PM - First on site with the printed run sheet.\n5:58 PM - At the courtyard mic when the reel and network died.\n6:12 PM - Sent Nathan upstairs to fetch Rehan for the welcome line.\n6:18 PM - Heard Nathan shout from the library and called for Sharon.\n6:21 PM - Moved the room back while Sharon checked for a pulse.`,
    code: 'MARQUIS',
  }),
  witness({
    id: 'char_balesh',
    name: 'Balesh',
    profession: 'Brand Writer',
    group: 'MARKETING',
    bio: `Observant, creative, generous writer who turns bad meetings into better copy.`,
    quirk: `Moulds broken words into poems under his breath.`,
    secret: `One line in the forged approval email against Nilisha - "sunset sells what certainty cannot" - is yours. You wrote it that morning on the welcome board. Whoever framed her stole language from the room, not from an old archive.`,
    neverDo: 'Put a line in public that I cannot own.',
    motive: `Balesh is not a suspect. He proves the frame on Nilisha was written that day.`,
    timeline: `4:30 PM - Lettered the welcome board and menu cards.\n5:25 PM - Reworded one sponsor line at Nilisha's request.\n5:58 PM - In the courtyard beside Elton when the reel looped.\n6:08 PM - Heard Jack quote his own line back as evidence.\n6:18 PM - Stayed downstairs, writing nothing.`,
    code: 'CANTO',
  }),
  witness({
    id: 'char_sharon',
    name: 'Sharon',
    profession: 'Medical Adviser',
    group: 'HEALTH',
    bio: `Observant, analytical, creative doctor invited to bless the wellness claims and quietly judge them.`,
    quirk: `Bakes when other people panic.`,
    secret: `The room wanted heatstroke because it was easy. You saw the pulse pattern, the sweat, the mouth, the timing, and knew almost immediately that this was poisoning or something very close to it.`,
    neverDo: 'Call a collapse simple when it is not.',
    motive: `Sharon is not a suspect. She is the first credible voice that breaks the fainting story.`,
    timeline: `4:44 PM - Arrived from a clinic consult and went upstairs once to check the library light.\n5:58 PM - In the courtyard near the tonic station.\n6:18 PM - Reached Rehan after Nathan called out and checked him first.\n6:20 PM - Said "this is not simple fainting" out loud.\n6:31 PM - Repeated the same line to police.`,
    code: 'MURMUR',
  }),
  witness({
    id: 'char_aashna',
    name: 'Aashna',
    profession: 'Experience Designer',
    group: 'DESIGN',
    bio: `Ambitious, anxious, optimistic designer who hides stress under relentless helpfulness.`,
    quirk: `Plays dumb when someone tries to hand her more work.`,
    secret: `You saw fresh snips on the yellow-oleander hedge near the parking curve while setting candle jars and thought only that the gardener was oddly late. After the toxicology came back, the hedge stopped being decorative.`,
    neverDo: 'Pretend a material flaw is aesthetic.',
    motive: `Aashna is not a suspect. She places the plant harvesting at the venue this week.`,
    timeline: `4:18 PM - Set candle jars along the parking curve.\n5:05 PM - Noticed fresh snips on the yellow hedge.\n5:58 PM - On the lawn with Shivani when the crash hit.\n6:18 PM - Still in clear view downstairs.\n6:34 PM - Pointed police to the hedge without being asked.`,
    code: 'WISP',
  }),
  witness({
    id: 'char_divya',
    name: 'Divya',
    profession: 'Research Adviser',
    group: 'RESEARCH',
    bio: `Observant, curious, blunt academic who turns every dinner into fieldwork.`,
    quirk: `Claims to have no secrets and then remembers all of yours.`,
    secret: `Behind the linen screen near the long table you overheard Rehan tell someone, "it's three of you, not one, and the paper trail agrees." You could not see who answered, only that the voice that replied did not sound frightened enough.`,
    neverDo: 'Ignore a pattern because it makes dinner awkward.',
    motive: `Divya is not a suspect. She confirms Rehan had moved beyond a one-person theory before he died.`,
    timeline: `4:52 PM - Took notes on the founder talk for fun.\n5:33 PM - Near the linen screen when Rehan's voice rose.\n5:58 PM - At the dessert end of the courtyard during the crash.\n6:18 PM - Heard the scream and started collecting timelines immediately.\n6:45 PM - Repeated the exact line to three different people.`,
    code: 'ORIEL',
  }),
  witness({
    id: 'char_nathan',
    name: 'Nathan',
    profession: 'Fixer',
    group: 'OPERATIONS',
    bio: `Loyal, curious, unpredictable freelancer who can source almost anything except calm.`,
    quirk: `Calls himself an assassin as a joke and regrets it every time.`,
    secret: `You carried the last AV case in at 4:41 and saw Arun take the admin tablet back out at 5:46, after setup was already complete. Yonella later sent you upstairs to pull Rehan into the stalled welcome line; at 6:18 you found him on the library floor, saw the black bottle beside him and shouted for Sharon before touching anything.`,
    neverDo: 'Leave rented gear behind.',
    motive: `Nathan is not a suspect. He both places the admin tablet with Arun and anchors the discovery without contaminating the bottle scene.`,
    timeline: `4:41 PM - Moved the final AV case into the booth.\n5:46 PM - Saw Arun take the admin tablet back out.\n5:58 PM - In the parking lane with crates when the crash hit.\n6:06 PM - Asked Elton if the reel had looped on purpose.\n6:12 PM - Sent upstairs by Yonella to fetch Rehan for the welcome line.\n6:18 PM - Found Rehan on the library floor and shouted for Sharon.`,
    code: 'TALON',
  }),
  witness({
    id: 'char_shivangi',
    name: 'Shivangi',
    profession: 'Workshop Curator',
    group: 'WELLNESS',
    bio: `Secretive, optimistic teacher who can command a room without raising her voice.`,
    quirk: `Overthinks every exercise until the room starts.`,
    secret: `You were with Sampada longer than she admits. She left the rehearsal corner shaken, not murderous, and if you say why she was crying you also tell the room about the certification problem she begged you to keep quiet.`,
    neverDo: 'Humiliate a student in public.',
    motive: `Shivangi is not a suspect. She can partly clear Sampada, but only by revealing an ugly secret.`,
    timeline: `4:55 PM - Rehearsed the mobility demo with Sampada and Shivali.\n5:59 PM - Walked Sampada to the pantry after Rehan spoke to her.\n6:07 PM - Returned alone when Sampada stayed to cry.\n6:18 PM - Near the stage, not the library.\n6:39 PM - Still deciding whether to tell the whole truth.`,
    code: 'VELLUM',
  }),
  witness({
    id: 'char_shivali',
    name: 'Shivali',
    profession: 'Movement Coach',
    group: 'WELLNESS',
    bio: `Loyal, honest, optimistic coach who paints cleaner lines than most designers.`,
    quirk: `Paints props and signage better than she admits.`,
    secret: `You hand-painted the table numbers upstairs and saw Rehan rinse the black bottle at 5:47 before leaving it empty beside the tea shelf. That matters: whatever killed him was added after that moment.`,
    neverDo: 'Teach a pose I cannot demonstrate.',
    motive: `Shivali is not a suspect. She anchors the empty-bottle timeline.`,
    timeline: `4:32 PM - Painted the mezzanine table numbers.\n5:47 PM - Saw Rehan rinse and leave the black bottle empty.\n5:58 PM - Downstairs by the stage props when the crash hit.\n6:18 PM - Stayed in the courtyard until people ran upstairs.\n6:26 PM - Told Sharon the bottle had been clean earlier.`,
    code: 'GOUACHE',
  }),
  witness({
    id: 'char_pujah',
    name: 'Pujah',
    profession: 'Wellness Coach',
    group: 'WELLNESS',
    bio: `A health coach with startup brain, bad maths and excellent coffee.`,
    quirk: `Shudders at the sound of words like tasks and masks.`,
    secret: `You mixed the communal kokum tonic yourself and filled both the courtyard carafes and the upstairs self-serve decanter at 5:50. The batch was clean. If poison came through a drink, it came through something private, not the room's shared pour.`,
    neverDo: 'Eat meat.',
    motive: `Pujah is not a suspect. She clears the communal tonic.`,
    timeline: `4:27 PM - In the bar prep area, tasting the tonic.\n5:50 PM - Filled the communal carafes and upstairs self-serve decanter herself.\n5:58 PM - At the tonic station during the crash.\n6:18 PM - Clear sightline to the courtyard the whole time.\n6:29 PM - Swore to police the communal batch was clean.`,
    code: 'YARROW',
  }),
  witness({
    id: 'char_elton',
    name: 'Elton',
    profession: 'Brand Strategist',
    group: 'MARKETING',
    bio: `Reckless, detached, cynical marketer who trusts a playlist more than a promise.`,
    quirk: `Archives eighties tracks by mood and remembers cue points exactly.`,
    secret: `The reel did not glitch. It looped. You know because the same synth bar restarted at exactly 5:58:12 and again at 6:09 when Arun killed the capture clip. Machines stutter. Loops return like rehearsed lies.`,
    neverDo: 'Blame the algorithm for a human decision.',
    motive: `Elton is not a suspect. He proves the AV failure was curated, not accidental.`,
    timeline: `4:35 PM - Synced the sunset playlist to the reel.\n5:58:12 PM - Heard the exact same synth bar restart.\n6:09 PM - Heard it restart again.\n6:18 PM - With Balesh at the sound desk, nowhere near the library.\n6:32 PM - Told Nathan the reel had looped on purpose.`,
    code: 'SABLE',
  }),
  witness({
    id: 'char_anjul',
    name: 'Anjul',
    profession: 'Movement Designer',
    group: 'WELLNESS',
    bio: `Competitive, secretive, quiet coach who treats every room like it has a puzzle in it.`,
    quirk: `Builds little brain-teasers into warmups.`,
    secret: `You hid the scavenger cards near the mezzanine pantry and noticed the service-stair key missing from its hook just after 5:50. By 6:20 it was back, wet and upside down beside the sink where the dropper had been rinsed. You did not touch it because you were too busy wondering who had.`,
    neverDo: 'Leave a puzzle half-solved.',
    motive: `Anjul is not a suspect. He ties the service-stair key to the blind spot and the upstairs route.`,
    timeline: `4:45 PM - Hid the warmup puzzle cards by the mezzanine pantry.\n5:51 PM - Noticed the service-stair key missing from its hook.\n5:58 PM - In the courtyard demo corner when the crash hit.\n6:20 PM - Saw the same key back beside the side sink, wet and upside down.\n6:32 PM - Still had not told anyone.`,
    code: 'ZEUGMA',
  }),
];

export const CHARACTERS = dealt(ROSTER, {
  salt: 'roster',
  isHot: (character) => character.role === 'MURDERER',
  safeTop: 4,
});

export const CASE_META = {
  caseId: '2609-G',
  title: 'Greenr: Last Seating',
  brand: 'Greenr',
  victimName: 'Rehan Vora',
  victimProfession: 'Independent diligence partner',
  date: '19 September 2026',
  venue: 'Greenr · Assagao, Goa',
  policeUnit: 'Goa Police · Anjuna Circle',
  inspector: 'Inspector Tara Naik',
  playerCount: CHARACTERS.length,
  primeSuspectCount: CHARACTERS.filter((character) => character.isSuspect).length,
  killerCount: CHARACTERS.filter((character) => character.role === 'MURDERER').length,
};

export const CASE_TIMELINE = [
  { time: '4:10 PM', event: 'Final setup begins at Greenr for the sunset signing dinner' },
  { time: '5:15 PM', event: 'Guest check-in opens and the founders’ courtyard fills' },
  { time: '5:47 PM', event: 'Rehan leaves his black bottle on the upstairs tea shelf' },
  { time: '5:58 PM', event: 'The launch reel, guest Wi-Fi and card reader fail together' },
  { time: '6:08 PM', event: 'Rehan goes upstairs with the closing folder' },
  { time: '6:18 PM', event: 'Nathan finds him in the library; Sharon reaches him seconds later' },
  { time: '6:31 PM', event: 'An onsite doctor flags likely poisoning' },
  { time: '6:40 PM', event: 'Police seal Greenr. The rain, the chain and the register say nobody left' },
];

const KILLER_IDS = ['char_jack', 'char_arun', 'char_manasi'];

const PODS = {
  A: ['char_arun', 'char_saanvi', 'char_anjul'],
  B: ['char_manasi', 'char_kiandra', 'char_elton'],
  C: ['char_anushka', 'char_sharon', 'char_balesh'],
  D: ['char_anmoll', 'char_divya', 'char_shivangi'],
  E: ['char_nilisha', 'char_shivani'],
  F: ['char_amrusha', 'char_aashna', 'char_nathan'],
  G: ['char_saima', 'char_anshu'],
  H: ['char_umair', 'char_yonella', 'char_pujah'],
  I: ['char_sampada', 'char_shivansh'],
  J: ['char_jack', 'char_shivali'],
};

const ACCUSATION_DECK = [
  {
    id: 'acc_jack',
    code: 'ALIDADE',
    targetSuspect: 'char_jack',
    targetName: 'Jack',
    title: 'Suspicious Behavior: Jack',
    accusation: `Jack kept pulling pages out of the signing bundle and replacing them with "clean copies" after people had already initialled it. When Rehan went down, Jack was the first to say the problem had to be Nilisha's sponsor deck, and he said it with the calm of a man introducing a fact, not guessing one.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.A,
  },
  {
    id: 'acc_arun',
    code: 'BRIAR',
    targetSuspect: 'char_arun',
    targetName: 'Arun',
    title: 'Suspicious Behavior: Arun',
    accusation: `Minutes before the 5:58 crash, Arun had the AV admin tablet under one arm and told Elton not to touch the playlist because "the reel will carry itself." Twelve minutes of camera loss later, he announced there was no usable upstairs footage before anyone had asked him to check.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.B,
  },
  {
    id: 'acc_manasi',
    code: 'COPPER',
    targetSuspect: 'char_manasi',
    targetName: 'Manasi',
    title: 'Suspicious Behavior: Manasi',
    accusation: `Manasi carried a brown bitters dropper like it was jewellery and told two bartenders the black bottle upstairs was reserved. She also took a crate out of the ice room unopened and brought it back lighter, then snapped when anyone reached for the rinsed dropper after the death.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.C,
  },
  {
    id: 'acc_anushka',
    code: 'DERRICK',
    targetSuspect: 'char_anushka',
    targetName: 'Anushka',
    title: 'Suspicious Behavior: Anushka',
    accusation: `Anushka snapped at Rehan by the herb wall about trying to take control of something he did not build. When the crash hit, she vanished into the signing-table argument with the corrected folder in her hand and came back looking like somebody had just rewritten her future.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.D,
  },
  {
    id: 'acc_anmoll',
    code: 'ELECTRUM',
    targetSuspect: 'char_anmoll',
    targetName: 'Anmoll',
    title: 'Suspicious Behavior: Anmoll',
    accusation: `Anmoll left the sunset table twice to answer one quick call and came back white-faced. He was the only person asking Jack whether the bridge note was in the diligence pack before anyone admitted there was a diligence problem at all.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.E,
  },
  {
    id: 'acc_nilisha',
    code: 'FLAGSTONE',
    targetSuspect: 'char_nilisha',
    targetName: 'Nilisha',
    title: 'Suspicious Behavior: Nilisha',
    accusation: `Nilisha printed a revised sponsor deck at 5:41 with numbers nobody else had seen, and the approval email that later surfaced against her carried her name in the sign-off. When Jack named her first, the paperwork already seemed ready for it.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.F,
  },
  {
    id: 'acc_amrusha',
    code: 'GALLEON',
    targetSuspect: 'char_amrusha',
    targetName: 'Amrusha',
    title: 'Suspicious Behavior: Amrusha',
    accusation: `Amrusha rerouted one server away from the mezzanine, told staff to hold tonic refills until after the welcome line and knew exactly which staircase Rehan used when he wanted to avoid the crowd. Nobody else had that much authority over both service flow and guest comfort at once.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.G,
  },
  {
    id: 'acc_saima',
    code: 'HALO',
    targetSuspect: 'char_saima',
    targetName: 'Saima',
    title: 'Suspicious Behavior: Saima',
    accusation: `Saima built the guest network and had admin access to the QR check-in system that died at 5:58. When the crash hit, she was moving before anyone had even shown her a broken screen, like she knew exactly where the body of the problem was buried.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.H,
  },
  {
    id: 'acc_umair',
    code: 'INDIGO',
    targetSuspect: 'char_umair',
    targetName: 'Umair',
    title: 'Suspicious Behavior: Umair',
    accusation: `Umair was seen with Rehan's unattended phone in his hand around 5:35 and later claimed he was only checking the time. An hour later he was asking whether maintenance windows show who scheduled them, which is a very specific question for a man who says he was nowhere near the AV stack.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.I,
  },
  {
    id: 'acc_sampada',
    code: 'JETTY',
    targetSuspect: 'char_sampada',
    targetName: 'Sampada',
    title: 'Suspicious Behavior: Sampada',
    accusation: `Sampada disappeared upstairs to fetch resistance bands during the only window the library corridor went dark and came back with no bands, smeared eyeliner and a story that changed twice. If you wanted a room to mistake panic for guilt, you could hardly stage it better.`,
    roundReq: 1,
    type: 'ACCUSATION',
    assignedTo: PODS.J,
  },
];

const targetsAKiller = (clue) => KILLER_IDS.includes(clue.targetSuspect);

export const ACCUSATION_CLUES = dealt(ACCUSATION_DECK, {
  salt: 'accuse',
  isHot: targetsAKiller,
  safeTop: 3,
});

const MOTIVE_DECK = [
  {
    id: 'mot_jack',
    code: 'KILN',
    targetSuspect: 'char_jack',
    targetName: 'Jack',
    title: 'Motive: Jack',
    content: `Rehan's corrections named the hidden 6% success-fee note, the mirrored advisory retainers and the private veto rights that Jack had buried across side letters. Once that package was read aloud, Jack was no longer the man papering over the deal. He was the man the paper was about.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_arun',
    code: 'LODESTAR',
    targetSuspect: 'char_arun',
    targetName: 'Arun',
    title: 'Motive: Arun',
    content: `Rehan found ghost production retainers, recycled reels sold as fresh deliverables and sponsor-performance cuts billed twice through Arun's shell studio. The launch film was meant to sell the future. Instead it had started auditing the past.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_manasi',
    code: 'MANDRAKE',
    targetSuspect: 'char_manasi',
    targetName: 'Manasi',
    title: 'Motive: Manasi',
    content: `The beverage books held two realities: one on the crate count, one on the invoice run. Returnable stock was billed as consumed, premium bottles were cycled through a shell distributor and buyback credits vanished before they hit the launch ledger. Rehan had the buyback sheet by sunset.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_anushka',
    code: 'NARWHAL',
    targetSuspect: 'char_anushka',
    targetName: 'Anushka',
    title: 'Motive: Anushka',
    content: `Rehan's cap-table corrections diluted Anushka, exposed founder-float reimbursements and turned tonight from a launch into a negotiated apology. Plenty of people would believe she killed to keep control. They would also be simplifying her.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_anmoll',
    code: 'ORBITAL',
    targetSuspect: 'char_anmoll',
    targetName: 'Anmoll',
    title: 'Motive: Anmoll',
    content: `Anmoll's private bridge out of launch-float money was paid back, undocumented and devastating if spoken aloud. The room can easily imagine a founder killing to keep the money story off the deck. The room would be right about the fear and wrong about the body.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_nilisha',
    code: 'PALISADE',
    targetSuspect: 'char_nilisha',
    targetName: 'Nilisha',
    title: 'Motive: Nilisha',
    content: `Nilisha had genuinely inflated RSVP and sponsor-commit numbers to steady investors. That habit made her the perfect frame: a real weakness, weaponized. If you already half-believed her metrics were theatre, forged approvals start feeling possible.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_amrusha',
    code: 'QUILL',
    targetSuspect: 'char_amrusha',
    targetName: 'Amrusha',
    title: 'Motive: Amrusha',
    content: `Amrusha had promised Greenr exclusivity before the contract cleared and used an event deposit to hold the date. If diligence pushed the launch, the venue deal cracked and every person in the room learned she had papered over it with charm.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_saima',
    code: 'ROOKERY',
    targetSuspect: 'char_saima',
    targetName: 'Saima',
    title: 'Motive: Saima',
    content: `Saima's logging shortcut was not criminal, but it made the guest stack look flimsy at exactly the moment the whole event needed to look robust. Rehan had warned her that one ugly engineering shortcut can read like intent when money disappears nearby.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_umair',
    code: 'SUMMIT',
    targetSuspect: 'char_umair',
    targetName: 'Umair',
    title: 'Motive: Umair',
    content: `Rehan's note beside Umair's dashboard used the phrase rounding mask, which is the kind of phrase that turns a sleepy engineer into a deliberate accomplice in one investor call. Umair had reason to fear what Rehan's exact vocabulary could do to him.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
  {
    id: 'mot_sampada',
    code: 'THISTLE',
    targetSuspect: 'char_sampada',
    targetName: 'Sampada',
    title: 'Motive: Sampada',
    content: `Sampada's certification hours and liability waivers were softer than the room had been led to believe. Rehan planned to raise it. One paragraph from him could turn an ambitious fitness ambassador into a public lesson in due diligence.`,
    roundReq: 2,
    type: 'MOTIVE',
  },
];

export const MOTIVE_CLUES = dealt(MOTIVE_DECK, {
  salt: 'motive',
  isHot: targetsAKiller,
  safeTop: 3,
});

const EVIDENCE_DECK = [
  {
    id: 'ev_tox',
    code: 'UMBRA',
    title: 'Toxicology Summary',
    content: `GOA FORENSIC SCIENCE LABORATORY\nPRELIMINARY SCREEN\n\nFINDINGS:\n- Acute cardiac glycoside poisoning, consistent with a highly concentrated yellow-oleander extract\n- Field signs and blood level support an arrhythmic collapse within minutes of first ingestion\n- Highest residue: interior of the victim's black steel bottle, below the liquid line\n- Communal kokum-tonic carafes: NEGATIVE\n- Bar ice, garnishes and batch syrups: NEGATIVE\n\nCONCLUSION: The room's shared drink was clean. The poison was in one vessel only, and only that vessel.`,
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_bottle',
    code: 'VELDT',
    title: 'Bottle and Tea-Shelf Analysis',
    content: `ITEM: Matte-black steel bottle recovered from the upstairs library.\n\nFINDINGS:\n- Resin-rich poison film painted inside the bottle and left to dry before refill\n- Tonic spray and smear pattern show the bottle was empty when dosed and filled later\n- Shelf wood carries a matching residue two feet from the bottle's usual resting place\n- Witness statements fix the bottle clean and empty at 5:47 PM\n\nNOTE: Whoever killed Rehan did not poison a batch. They prepared his bottle between 5:47 and 6:08, then relied on his own refill habit to do the rest.`,
    roundReq: 3,
    type: 'FORENSICS',
  },
  {
    id: 'ev_av',
    code: 'WYVERN',
    title: 'AV and Camera Log',
    content: `GREENR EVENT SYSTEMS SUMMARY\n\n4:46 PM - Firmware sync scheduled from the AV admin tablet\n5:58 PM - Courtyard and mezzanine live feeds enter maintenance mode; local capture continues buffering\n5:58 PM - Guest Wi-Fi and card-reader network drop with the same reboot\n6:09 PM - One mezzanine-corridor buffer clip manually deleted from the live-capture queue\n6:11 PM - Live feeds return\n\nA sync booked seventy-two minutes before the death is not a glitch. It is an appointment.`,
    roundReq: 3,
    type: 'CCTV',
  },
  {
    id: 'ev_crash',
    code: 'XYST',
    title: 'Guest-Network Crash Trace',
    content: `SYSTEM TRACE - CHECK-IN STACK\n\n- No external outage hit Greenr at 5:58 PM\n- The crash began with a local reboot command from the AV subnet, not the guest stack\n- QR check-in, sponsor scan and card reader all failed because the same private network segment was deliberately bounced\n- Saima's application logs show error fallout, not trigger origin\n\nCONCLUSION: The front-desk chaos that scattered the room came downstream from the AV sync. The crash was staged from the media side, not caused by the guest system.`,
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_bar',
    code: 'YEW',
    title: 'Bar and POS Reconciliation',
    content: `BAR RUNDOWN - 19 SEPTEMBER\n\n- Communal kokum-tonic batch opened 5:50 PM; its upstairs self-serve decanter was filled before the crash\n- No off-menu tonic or staff service was sent upstairs after 5:50 PM\n- One brown bitters dropper was rinsed at 6:16 PM in the pantry side sink; residue in sink trap matches yellow-oleander extract\n- The victim's bottle was never processed through the bar POS because it was self-fill, not service\n\nThe poison traveled through a private object and a hand-held dropper, not through the room's bar program.`,
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_frame',
    code: 'ZITHER',
    title: 'Sponsor Packet Metadata',
    content: `DOCUMENT EXAMINATION - "SPONSOR APPROVAL / NILISHA"\n\n- Base file created 18 September, 11:52 PM; last edited 19 September, 5:22 PM\n- Uses the current sponsor-footer template, not the archived one it claims to precede\n- The 5:22 edit repeats copy from the welcome board drafted that afternoon\n- Email header chain is synthetic; message IDs do not exist on the mail server\n\nThe packet that points at Nilisha was drafted the night before, then refreshed with language stolen from the room that day. It is a frame, not a history.`,
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_garden',
    code: 'APERTURE',
    title: 'Garden Survey',
    content: `HORTICULTURAL EXAMINATION - PARKING CURVE AND HERB WALK\n\n- Fresh snips on the yellow-oleander hedge, consistent with the previous evening\n- Small pruning shears found washed, unusually clean, in the herb-walk caddy\n- Trace of the same cardiac glycoside on the lip of a rinsed bitters dropper\n- No poison source found in communal food, tonic or garnish prep\n\nThe venue already contained the poison. Someone harvested it, reduced it and carried it in the most ordinary container available: a bar bitters bottle.`,
    roundReq: 3,
    type: 'EVIDENCE',
  },
  {
    id: 'ev_folder',
    code: 'BOLERO',
    title: 'Signing-Folder Print Analysis',
    content: `PRINT AND PAPER ANALYSIS - CLOSING BUNDLE\n\n- Two pages in the live signing folder were printed after 5:17 PM from a side-room printer\n- Those pages contain the forged sponsor approvals later used against Nilisha\n- Ink pressure on the late initials differs from the original bundle and the paper stack was re-ordered after collation\n\nThe folder was edited during the dinner. Someone was preparing an answer before the room knew the question.`,
    roundReq: 3,
    type: 'EVIDENCE',
  },
];

export const EVIDENCE_CLUES = dealt(EVIDENCE_DECK, { salt: 'evidence' });

const REVELATION_DECK = [
  {
    id: 'rev_memo',
    code: 'CIRRUS',
    title: `Rehan's Recovered Memo`,
    content: `RECOVERED FILE - PRE-CLOSE CORRECTIONS\n\nRehan's local memo survives even though the shared draft was removed from the side-room laptop. It names three criminal lanes and seven ugly-but-civil problems:\n- COUNSEL - hidden carry, sham retainers, hidden veto paper\n- FILM - ghost production retainers and reused sponsor deliverables\n- BEVERAGE - duplicate stock invoices and shell-distributor buybacks\n\nMargin note, in Rehan's hand: "Nilisha inflated numbers, yes. The packet making her the whole fraud is fake. Somebody is aiming the story before the signing."\n\nThe memo separates embarrassment from the kind of wrongdoing that could make somebody kill.`,
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_runsheet',
    code: 'DELPHIC',
    title: 'Run Sheet and Admin-Tablet Audit',
    content: `EVENT OPERATIONS AUDIT\n\n- Yonella's printed master run sheet contains no AV sync at 5:58 PM\n- The sync was scheduled from the admin tablet after setup was already complete\n- The tablet authenticated under Arun's device profile\n- The deleted buffered-corridor clip left the same device signature\n\nThe interruption that created the blind spot was not part of the evening. It was inserted into it by the person already trusted to control what the evening looked like.`,
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_sideletter',
    code: 'EUREKA',
    title: 'Side-Letter and Handwriting Analysis',
    content: `DEAL PAPER REVIEW\n\n- The hidden success-fee note and mirrored advisory retainers use Jack's revision cadence and fountain-pen pressure\n- The forged Nilisha packet and the late folder pages came from the same side-room printer Jack used at 5:22 PM\n- One handwritten note in the binder reads: "if nilisha story holds, rest becomes noise"\n\nThe frame, the folder and the hidden money are not parallel problems. They are one person's paper trail.`,
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_delivery',
    code: 'FULCRUM',
    title: 'Beverage Delivery and Buyback Manifest',
    content: `SUPPLIER RECONCILIATION\n\n- One tonic-and-bitters crate was checked in twice: once on the loading sheet, once in the invoice packet\n- A four-bottle premium allocation shows as consumed on paper and returned on the buyback ledger\n- The shell distributor billing that spread sits between Greenr and Manasi's real supplier\n- The only hand-written correction in the buyback ledger is Manasi's\n\nThe bar fraud is not a bookkeeping error. It is a private siphon dressed up as stock movement.`,
    roundReq: 4,
    type: 'REVELATION',
  },
  {
    id: 'rev_chat',
    code: 'GOSSAMER',
    title: 'Recovered Group Chat',
    content: `DEVICE FORENSICS - GROUP CHAT "afterparty logistics"\n\nCreated 1:05 PM on 18 September. Three members. Fragments recovered:\n\nCounsel: if he gets to sunset, all three lanes freeze.\nFilm: sync at 558 gives twelve clean minutes and kills the guest stack with it.\nBar: bottle only. room stays clean. bitter goes under bitter.\nCounsel: nilisha packet goes in the folder after the crash. let the room solve vanity first.\n\nThis is not a vibe. It is a plan.`,
    roundReq: 5,
    type: 'REVELATION',
  },
  {
    id: 'rev_money',
    code: 'HARBINGER',
    title: 'Beneficiary Map',
    content: `PRE-CLOSE BENEFICIARY TRACE\n\nThe hidden carry note, the shell beverage distributor and the ghost production retainers all converge on three real beneficiaries through different wrappers. Rehan's map ties them together:\n- Jack - private success fee and mirrored retainer chain\n- Manasi - distributor spread and buyback credit skims\n- Arun - shell production retainers and sponsor-deliverable wash\n\nThe fraud channels looked separate because that is how they were sold. The money says otherwise.`,
    roundReq: 5,
    type: 'REVELATION',
  },
];

export const REVELATION_CLUES = dealt(REVELATION_DECK, {
  salt: 'reveal',
  group: (clue) => clue.roundReq,
});

export const CONFESSION_CLUE = {
  id: 'confession',
  code: 'KEYSTONE',
  title: 'The Truth',
  content: `We did it. Jack built it. Arun gave it twelve clean minutes. Manasi put the poison where only Rehan would ever carry it.\n\nRehan was about to pause the signing and read the corrections. Jack's side letters. Arun's production wash. Manasi's shell-distributor skim. He also had seven smaller humiliations for seven other people, which is why the room looked so wide. Fear was everywhere. Guilt was not.\n\nThe trick was never the poison. The trick was the room. Arun turned a firmware sync into a blind spot and dragged the guest network down so Saima and Umair had to sprint. Jack staged the paper panic and fed the room a Nilisha story it already wanted to believe. Manasi carried a dropper that looked like bar gear, painted the inside of Rehan's bottle and left the whole courtyard clean.\n\nHe filled that bottle himself. That was the point of him, and the plan.`,
  roundReq: 6,
  type: 'CONFESSION',
  forCharacters: KILLER_IDS,
};

export const CASE_SOLUTION = {
  verdict:
    'Jack led Arun and Manasi in killing Rehan Vora with concentrated yellow-oleander extract painted inside his own black bottle at Greenr, while a scheduled AV sync, a staged front-desk crash and a forged sponsor packet pushed the room toward Nilisha and away from the three people whose fraud Rehan was about to expose.',

  why: [
    `Rehan was minutes from pausing the sunset signing. His corrections did not describe one bad actor. They exposed three criminal lanes - Jack's hidden carry note and sham retainers, Arun's ghost production wash, and Manasi's duplicate beverage skims - plus seven other ugly but non-lethal problems. That breadth is why ten people looked dangerous while only three were guilty.`,
    `After Jack saw the first close-review queries on 18 September, he recruited the other two because their fates were tied. Arun could create the blind spot and delete the buffered corridor record. Manasi could deliver a plant poison through the one private object the victim would definitely use. Jack could occupy the founders, refresh the Nilisha frame and make the room solve vanity before it solved intent.`,
    `The plan worked because Greenr at launch-time was already chaotic: a reel restart, a network bounce, a bar line, a signing table, a room full of people with something embarrassing to hide. The killers did not import chaos. They only timed it.`,
  ],

  jobs: [
    {
      name: 'Jack',
      group: 'LEGAL',
      job: 'The plan',
      lead: true,
      detail:
        'He saw the first close-review queries, understood that sunset would freeze all three criminal lanes, drafted the Nilisha frame the night before, refreshed it at 5:22, staged the paper panic at 5:58 and kept the founders staring at signatures while the murder happened upstairs. The frame was his fingerprint before the body ever fell.',
    },
    {
      name: 'Arun',
      group: 'MEDIA',
      job: 'The blind spot',
      detail:
        'At 4:46 he scheduled the AV sync that blanked the live courtyard and mezzanine feeds from 5:58 to 6:11, bounced the guest network and card reader, then looped the sunset reel and deleted the one buffered corridor capture that mattered. His crime was mostly done before the poison was ever poured.',
    },
    {
      name: 'Manasi',
      group: 'BAR',
      job: 'The dose',
      detail:
        `She clipped yellow oleander from the parking hedge the day before, reduced it into a concentrate in a brown bitters dropper, carried it in with ordinary bar gear and at 6:02 painted it inside Rehan's bottle while the cameras were down. The bar stayed clean because the room was never the target. One bottle was.`,
    },
  ],

  sequence: [
    {
      time: '1:05 PM, 18 Sep',
      hidden: true,
      body: 'After Jack sees the first close-review queries, he creates a group chat called "afterparty logistics." Three exposed lanes start building one contingency.',
    },
    {
      time: 'Night before',
      hidden: true,
      body: 'Jack drafts the Nilisha frame; Manasi clips yellow oleander from the parking hedge and reduces it into a brown dropper bottle.',
    },
    {
      time: '12:14 PM',
      hidden: true,
      body: 'Rehan sends Jack the corrected diligence packet with one message: pause the signing, there are three criminal lines I will not let through.',
    },
    {
      time: '4:46 PM',
      body: 'Arun schedules the AV sync from the admin tablet: 5:58 to 6:11, enough to blind the mezzanine and drag the guest network down with it.',
    },
    {
      time: '5:22 PM',
      hidden: true,
      body: 'Jack refreshes the forged Nilisha packet with Balesh\'s welcome-board line, then prints the late folder pages that will point the room at Nilisha once the body appears.',
    },
    {
      time: '5:47 PM',
      body: 'Rehan rinses and leaves his black bottle empty on the upstairs tea shelf, exactly where he always leaves it before the welcome line.',
    },
    {
      time: '5:58 PM',
      body: 'The sync hits. Live feeds go blank while the corridor system continues buffering. Guest Wi-Fi and card reader fail. Saima and Umair sprint. The room breaks in exactly the directions the killers needed.',
    },
    {
      time: '6:02 PM',
      hidden: true,
      body: 'Manasi doses the bottle through the pantry service stair. Arun loops the reel and later kills the buffered capture clip. Jack pins the founders to the long table over a false signature panic.',
    },
    {
      time: '6:08 PM',
      body: 'Rehan returns upstairs, tops the bottle up from the self-serve communal tonic decanter and carries the closing file into the library.',
    },
    {
      time: '6:18 PM',
      body: 'Nathan finds him on the library floor; Sharon reaches him seconds later. The bottle is down, the room is still solving the crash, and Jack already has an answer ready.',
    },
    {
      time: '6:40 PM',
      body: 'Police seal Greenr. The rain, the chain and the register say the killer never left because the killer never needed to.',
    },
  ],

  misdirection: [
    {
      name: 'Anushka',
      why: 'The control-rights argument was real, the dilution fear was real and the missing cap-table printout was real. None of that puts poison in a bottle.',
    },
    {
      name: 'Nilisha',
      why: 'She really did inflate numbers. That is exactly why the forged packet works as a frame.',
    },
    {
      name: 'Amrusha',
      why: 'She controlled service flow and access, but the poison route bypassed service and the bottle was self-fill.',
    },
    {
      name: 'Saima',
      why: 'Her system suffered the fallout, but the trigger came from the AV tablet and the schedule lived on the media side.',
    },
    {
      name: 'Sampada',
      why: 'Tears, waivers and a bad timeline made her look theatrical and guilty. The panic was genuine. The murder was not hers.',
    },
  ],

  proof: [
    `Incident Report - ten people of interest inside Greenr during the 5:55-6:15 window`,
    `Toxicology Summary - poison in the victim's bottle only; communal tonic and bar clean`,
    `Bottle and Tea-Shelf Analysis - bottle dosed while empty after 5:47 and before 6:08`,
    `AV and Camera Log - the blind spot was scheduled at 4:46, then a clip was deleted at 6:09`,
    `Guest-Network Crash Trace - the front-desk panic was collateral from the AV reboot, not a guest-stack failure`,
    `Bar and POS Reconciliation - washed dropper, private route, no communal contamination`,
    `Garden Survey - yellow oleander harvested on site and carried in bar gear`,
    `Signing-Folder Print Analysis - forged Nilisha pages inserted after 5:17`,
    `Recovered Memo - three criminal lanes named; Nilisha frame explicitly called false`,
    `Run Sheet and Admin-Tablet Audit - the sync and deleted clip belong to Arun's device profile`,
    `Side-Letter Analysis - Jack's paper trail joins the hidden money to the forged frame`,
    `Delivery Manifest, Group Chat and Beneficiary Map - Manasi's stock skim, the 1:05 chat and the shared beneficiaries close the three-person conspiracy`,
  ],
};

export const CASE_FILES = [
  {
    id: 'f_incident',
    type: 'REPORT',
    title: 'INCIDENT REPORT',
    date: '19 September 2026',
    content: `GOA POLICE - ANJUNA CIRCLE\n\nINCIDENT TYPE: Suspected unnatural death\nDECEASED: Rehan Vora - independent diligence partner\nLOCATION: Upstairs library, Greenr, Assagao, Goa\nFOUND: 6:18 PM | POISONING FLAGGED: 6:31 PM\n\nSUMMARY:\nThe deceased collapsed in the upstairs library during a private sunset signing dinner at Greenr. Witnesses report he had been moving between the courtyard signing table and the upstairs tea shelf in the minutes before collapse.\n\nThe gate chain, valet register and police hold confirm no guest left Greenr after 5:25 PM. All 26 invited participants remained on site when the venue was sealed at 6:40 PM.\n\nPERSONS OF INTEREST: Cross-referencing the courtyard cameras, the run sheet and staff statements, several guests cannot be continuously placed in public view between 5:55 PM and 6:15 PM. Each remains a person of interest until eliminated.\n\nLEAD INVESTIGATOR: Inspector Tara Naik\nSTATUS: Active investigation`,
    stamped: true,
    roundReq: 0,
  },
  {
    id: 'f_tox',
    type: 'REPORT',
    title: 'PRELIMINARY TOXICOLOGY',
    date: '19 September 2026',
    content: `GOA FORENSIC SCIENCE LABORATORY\nFIELD SCREEN - PRELIMINARY\n\nCAUSE OF DEATH: Acute cardiac glycoside poisoning, consistent with yellow-oleander extract\nSOURCE: The victim's black steel bottle, dosed while empty before the 6:08 PM refill\n\nFINDINGS:\n- Blood and residue positive for yellow-oleander markers\n- Communal kokum-tonic carafes: NEGATIVE\n- Bar ice, garnish and batch syrup: NEGATIVE\n- Bottle interior below fill line: HEAVY POSITIVE\n\nCONCLUSION: The poison was not in the room's shared drink. It was in one man's bottle and only his.`,
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_av',
    type: 'REPORT',
    title: 'AV AND CAMERA SUMMARY',
    date: '19 September 2026',
    content: `GREENR EVENT SYSTEMS - 19 SEPTEMBER\n\n4:46 PM - Firmware sync scheduled from AV admin tablet\n5:58 PM - Courtyard and mezzanine cameras enter maintenance mode\n5:58 PM - Guest Wi-Fi and payment reader drop with the same reboot\n6:09 PM - One mezzanine capture clip deleted from the live queue\n6:11 PM - Systems return\n\nNo outside outage affected Greenr. The 5:58 interruption was created locally and in advance.`,
    stamped: true,
    roundReq: 3,
  },
  {
    id: 'f_engagement',
    type: 'REPORT',
    title: 'DILIGENCE ENGAGEMENT NOTE',
    date: '02 September 2026',
    content: `ENGAGEMENT NOTE - EXTRACT\n\nRehan Vora was retained by the lead backers to complete pre-close diligence for the Greenr launch vehicle, including vendor reconciliation, sponsor deliverables, event-operations spend and closing-paper review.\n\nHandwritten note, attached to the signing schedule: "Sunset table is not ceremonial if the numbers are wrong. Pause if needed. Correct in room."\n\nThe dinner at Greenr was never just a dinner. It was the closing.`,
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_funds',
    type: 'REPORT',
    title: 'PRE-CLOSE FUNDS SUMMARY',
    date: 'September 2026',
    content: `RECONCILIATION SUMMARY\n\nEstimated irregular exposure: Rs 1.86 crore across three criminal lanes and seven secondary diligence issues. Primary lanes:\n\n1. Hidden carry note and sham advisory retainers in side letters\n2. Duplicate beverage invoicing and buyback-credit skims through a shell distributor\n3. Ghost production retainers and recycled sponsor deliverables\n\nSecondary issues include inflated sponsor metrics, founder-float reimbursements, waiver gaps and guest-stack shortcuts.\n\nThis file explains why the room has so many believable reasons to be afraid of Rehan.`,
    stamped: true,
    roundReq: 4,
  },
  {
    id: 'f_gate',
    type: 'REPORT',
    title: 'GATE, VALET AND WEATHER LOG',
    date: '19 September 2026',
    content: `GREENR ACCESS SUMMARY\n\n- Sudden monsoon burst at 5:25 PM; side gate chained and valet lane pinned to one controlled exit\n- No guest exits recorded after 5:25 PM\n- All 26 invitees and core staff accounted for on site when police arrived\n- No outside delivery entered the venue between 5:30 PM and the seal\n\nCONCLUSION: Whoever killed Rehan Vora was still inside Greenr when the venue locked down.`,
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

export const RIDDLE_REWARD_POOL = [...MOTIVE_CLUES, ...EVIDENCE_CLUES, ...REVELATION_CLUES];

export const ASK_OPENS_AT = Math.min(...RIDDLE_REWARD_POOL.map((clue) => clue.roundReq));

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

  const offset = RIDDLE_ORDINAL.get(characterId) ?? 0;

  return [...blocks.keys()]
    .sort((a, b) => a - b)
    .flatMap((round) => {
      const block = blocks.get(round);
      const start = offset % block.length;
      return [...block.slice(start), ...block.slice(0, start)];
    });
};

export const nextRiddleReward = (characterId, currentRound, ownedClueIds = []) => {
  const owned = new Set(ownedClueIds);
  return (
    riddleQueueFor(characterId).find(
      (clue) => clue.roundReq <= currentRound && !owned.has(clue.id)
    ) ?? null
  );
};

export const riddleRewardsInPlay = (currentRound) =>
  RIDDLE_REWARD_POOL.filter((clue) => clue.roundReq <= currentRound).length;

export const getAssignedAccusation = (characterId) => {
  return ACCUSATION_CLUES.find((accusation) => accusation.assignedTo.includes(characterId));
};

// Walk-ins play the evidence economy without entering the fixed statement pods.
// Their card is a deterministic duplicate: every device agrees on it, while the
// 26 canonical characters and their one-card pod assignment remain unchanged.
export const getWalkInAccusation = (characterId) => {
  if (!ACCUSATION_CLUES.length) return null;
  const index = Math.abs(seeded('walk-in-accusation', characterId)) % ACCUSATION_CLUES.length;
  return ACCUSATION_CLUES[index];
};

export const riddleQueueForWalkIn = (characterId) => {
  const blocks = new Map();
  for (const clue of RIDDLE_REWARD_POOL) {
    if (!blocks.has(clue.roundReq)) blocks.set(clue.roundReq, []);
    blocks.get(clue.roundReq).push(clue);
  }

  const offset = Math.abs(seeded('walk-in-riddle', characterId));
  return [...blocks.keys()]
    .sort((a, b) => a - b)
    .flatMap((round) => {
      const block = blocks.get(round);
      const start = offset % block.length;
      return [...block.slice(start), ...block.slice(0, start)];
    });
};

export const nextWalkInRiddleReward = (characterId, currentRound, ownedClueIds = []) => {
  const owned = new Set(ownedClueIds);
  return (
    riddleQueueForWalkIn(characterId).find(
      (clue) => clue.roundReq <= currentRound && !owned.has(clue.id)
    ) ?? null
  );
};

export const getSuspects = () => {
  return CHARACTERS.filter((character) => character.isSuspect);
};

export const getWitnesses = () => {
  return CHARACTERS.filter((character) => !character.isSuspect && character.role !== 'MURDERER');
};

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
      // Convenience check only.
    });
}

export const HOST_SCRIPT = [
  {
    id: 'pregame',
    title: 'Pre-Game · Welcome',
    duration: '~5 min',
    setup: `Before you start: confirm the ${CASE_META.playerCount} canonical players have their printed login cards. For a late arrival, open Host Panel → Open walk-in register, issue one simple registration word and let them register on their own phone; their simple login word stays visible in that host screen. They can play normally but are not part of the case canon. There are no clue cards to hand out - clues are won in the app by solving riddles, and the codes spread from player to player. Everyone who logs in lands on the waiting screen until you press Start game.`,
    announce: `"Welcome to Greenr, Assagao. The date is ${CASE_META.date}. What was supposed to be a sunset signing dinner has become a sealed scene. Rehan Vora - the independent diligence partner hired to bless tonight's closing - is dead upstairs, and police say nobody left after 5:25.\n\nYour phone is your case file. From Round 2 a button marked ASK appears on the Evidence screen. Solve a riddle, win a clue, read the code out, and anybody who types it into CODE gets the same clue. Share carefully. Accuse loudly. The room wins only if it reaches the right answer and the right method."`,
    during: 'Help canonical guests use their cards. For a new walk-in, issue a host pass instead of reusing a story code. Point everyone to Identity and Story before the first vote. ASK is not visible yet; tell the room how it works now and let the button arrive in Round 2 to a room that already understands it.',
    end: 'Press Start game when the room is settled. If one phone is still waiting afterward, use Push start to everyone.',
  },
  {
    id: 0,
    title: 'Round 0 · The Incident',
    duration: '10-15 min',
    setup: 'The Incident Report is unlocked by default. When the round clock ends, a five-minute blind ballot opens on every phone automatically.',
    announce: `"Round 0. The Incident. Rehan Vora was found in the upstairs library at 6:18 PM. An onsite doctor flagged likely poisoning by 6:31. Police sealed Greenr at 6:40, and nobody left after 5:25.\n\nOpen Story first. Then open Evidence and read the Incident Report in Case Files. Several of you cannot be continuously placed in public view when it mattered. When the round ends, cast your first bad vote before certainty exists."`,
    during: 'Let the room read and mingle in character. The round clock starts the blind ballot; its five-minute window closes by itself.',
    end: 'Read the named tally, then press Start Round 01 when the room is ready.',
  },
  {
    id: 1,
    title: 'Round 1 · Accusations',
    duration: '~15 min',
    setup: 'Every player automatically receives one accusation card the moment Round 1 opens - the witness claim their statement pod was handed.',
    announce: '"Round 1. Accusations. Open Evidence and read the accusation waiting for you. These are witness claims about people police need the room to examine closely. Use them honestly, strategically or not at all - but use them."',
    during: 'Push people to read cards out loud and compare versions across the room.',
    end: 'Advance when all ten suspects feel dangerous in at least one conversation.',
  },
  {
    id: 2,
    title: 'Round 2 · Motives',
    duration: '~15-20 min',
    setup: 'ASK opens automatically. The ten motive files are now the prize pool, and every player is walking a different order.',
    announce: '"Round 2. Motives. ASK is live. Solve a riddle, win a motive file and read the code out so the room can copy it. The room only gets smart if the clues circulate."',
    during: 'Watch for code hoarders. Call them out early and often.',
    end: 'Advance when the room understands that fear is wider than guilt.',
  },
  {
    id: 3,
    title: 'Round 3 · Evidence',
    duration: '~15-20 min',
    setup: 'Unlock the Round 3 case files. Eight evidence clues join the riddle pool automatically; the round clock handles the ballot.',
    announce: '"Round 3. Evidence. The bar was clean. The room was clean. His bottle was not. Eight evidence files are now in the pool: toxicology, the bottle, the AV log, the crash trace, the bar log, the forged packet, the garden survey and the folder analysis. Go earn them."',
    during: 'This is the pivot. Plant the right question if they stall: who needed the blind spot, and who needed the room looking at Nilisha instead?',
    end: 'Advance when the room is talking about the bottle, the sync, the frame or the hedge.',
  },
  {
    id: 4,
    title: 'Round 4 · Revelations',
    duration: '~15-20 min',
    setup: 'Unlock the Round 4 case files. Four revelations enter the riddle pool on round advance.',
    announce: `"Round 4. Revelations. Rehan's memo survived him. Four revelations are now in the pool: the recovered memo, the run-sheet audit, the side-letter analysis and the delivery manifest. This is where loose suspicion starts becoming a shape."`,
    during: 'Push the room from names to roles. Ask who owned paper, who owned picture and who owned the pour.',
    end: 'Advance when the room can describe the fraud as a system instead of an argument.',
  },
  {
    id: 5,
    title: 'Round 5 · Finale',
    duration: '~10-15 min',
    setup: 'The last two revelations - the chat and the beneficiary map - enter the pool automatically.',
    announce: '"Round 5. Finale. The last two revelations are live: the recovered group chat and the beneficiary map. Stop settling for the first neat answer. Tell me what happened, and who made it happen."',
    during: 'If the room stalls on the person nearest the bottle, remind them that paper and the frame are actions too.',
    end: 'Advance when the room can explain the method, the frame and every action that made it possible.',
  },
  {
    id: 6,
    title: 'Round 6 · The Reveal',
    duration: '~5 min',
    setup: 'Let the final automatic tally finish, then trigger the reveal. Read the three names out loud, mastermind first.',
    announce: '"Round 6. The Reveal. Read the final tally. Then read the reconstruction before you argue with it. This case only closes if the method and the team both make sense."',
    during: 'Point everyone into How it happened before taking objections.',
    end: 'Let the reconstruction carry the answer before you start adjudicating edge cases.',
  },
];