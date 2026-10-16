# Astral Project's Murder Mystery Experience
## Project Context

> Maintenance note: Update this file whenever the live case premise, round flow, cast scale, or host flow changes. See [Claude.md](Claude.md) for the session-start primer.

---

## Killers Night: the new format (replacing the authored case below)

**Why:**
- Players said there was too much to read, it got long and boring, and most of them had nothing to do.
- The host had to write a new story for every event, and the case broke whenever a killer or key witness didn't show.

**Shape:** about 2 hours, 25–45 guests, tables of 4–8 plus mingling, no projector.

**The skin: DEEP BLUE (2026-09-30).** Every guest's phone becomes a retro iPhone-era (iOS 6) home screen in Helvetica-style type, with apps for each part of the game: Messages (the group chat), DEEP BLUE (the game), News, Photos, Clock, Contacts, Notes, Night, Settings and Help. The story: everyone in the room has a viral app called DEEP BLUE. Its admins, the Killers, vote each night on one guest to kill, and the morning news says who. Every morning it rings and everyone plays its game; the top three each win a clue photo.

**Playtest changes (2026-10-15, before the 16 Oct event).** Players couldn't find the vote inside Messages, so **Vote** has its own home-screen icon (in the Board app's old slot). Player-called accusations are gone: the Round Table is an **open vote**, anyone can vote for any living guest, and the most votes is killed. The "rigged / lowest morning score dies" kill is gone: **the only night death is the Killers' vote**, applied when the night locks; a Doctor's save means nobody dies. The **Board app and News's board reveal are gone**; the morning game kills nobody, and its top three living scorers each get one of the night's clues, privately. The day now runs night → morning news (dawn) → alarm → game → daylight → vote → verdict. Cinematics, Help, Terms, the Case screen, the pack, the paper and the tutorials were all rewritten to match. Older paragraphs below describe what was built before; where they mention the board, the rig, the shield or accusations, those parts no longer exist. DEEP BLUE is fictional on purpose; see [memory.md](memory.md).

**The evening:**
1. **Arrival.** The first time a guest opens the page, their phone plays a hand-drawn opening (about 21 s, once per device): a fun title film on white ("Astral Project presents", "in collaboration with Greenr", both logos) that turns dark for "The Deep Blue Case" (crime-scene tape, a CASE stamp, a red moon over a black sea), then a cold open: a guest, drawn the way the contact photos are, walks a rainy street on her phone, watches the Killers' poll land on her ("The Killers chose YOU", KILLED; redrawn 2026-10-16) and collapses; the camera goes into her phone and its light goes white, onto the set-up screen. The death is never graphic: no method, no blood on her. Then they scan in, give a first name and table, and answer seven one-tap trait questions: top colour, glasses, footwear, first drink, birthday, siblings, pet (added 2026-10-15; the pet is drawn at their feet and is a clue like the rest). **The answers are public** (since 2026-10-02): every guest's Contacts card shows them, with a photo drawn from them. A guest can fix their own until the roles are dealt; after that the file is locked. The file is only what someone *said*, so on every card a player can mark an answer as "doesn't match" (an option the form lacked, a jacket taken off, a lie) — kept deliberately simple: no suspect ratings, no notes, no separate views, nothing else to manage.
2. **Casting.** The host deals roles to whoever is present: 3 Killers from 12 to 50 guests, plus a Doctor, a Detective and the Faithful. (The Medium was removed on 2026-10-02: see Roles below.)
3. **Three to five days**, each about 21 minutes at the default two hours. **The game clock (2026-10-02)** runs them: see below.
   - **Night (3 min).** The Killers vote in a poll that DEEP BLUE posts into their group chat: "Who goes tonight?". The majority decides. That is their whole night: the majority's pick is killed at dawn unless a Doctor protected them. The rest is automatic: the engine picks *the hand* (whose traits the clues describe) by rotating through the living Killers, and there is no frame (see Balance). The Faithful watch a guest or dig through the logs. The Doctor puts a firewall on one guest. The Detective traces two guests' phones: did either one do tonight's hacking? Ghosts pass one of their true clue photos to a living guest (the whisper was cut on 2026-10-16).
   - **Morning news (dawn, 60 s, at 07:00 on the game clock; since 2026-10-15).** A synced reveal in News: "NIGHT n", then who the Killers killed (KILLED), or that nobody died. The night's clues arrive with it, and the killed guest's phone shows the killed screen after the beat.
   - **Alarm (20 s; 75 s on the first Word morning).** Every phone shows an iPhone-style ringing alarm over the whole screen (the user's call, 2026-10-16; a notification from 2026-10-02 until then): the game clock, the day's label, today's game, the game-clock time to play it by, and "The top 3 win a clue photo." It rings until the guest drags "slide to snooze", and that slide opens DEEP BLUE on the day's game (on a run day, a countdown until the run opens). A guest who ignores it finds it still ringing while the game runs. It rings once per day per phone; nobody is made to play.
   - **The morning game: three social-deduction games (2026-10-16).** **Word** (days 1 and 4), **Fake Artist** (days 2 and 5), **Pack the Bag** (day 3). In each one the Faithful know something the Killers don't (the word, or the trip; Killers get a hint), and what everyone made goes up for the room. Each gives every guest a score; the top three living scorers each get a clue photo. Nobody dies of a score. The host console offers no choice of games.
     - **Why:** on the event day the user retired Sketch and the Run (no hidden side, so they said nothing about who is a Killer) and picked Fake Artist and Pack the Bag from a shortlist of five.
     - **Fake Artist** (1 min): Read · Draw (45 s). Same word pairs as Word, never one Word used. Nobody sees a drawing until the pens go down; then every drawing goes up on one board for the room to talk over (tap one to see it large). No stars (the user's call, same day: they confused people), so the three clue photos are a seeded draw among everyone who drew.
     - **Pack the Bag** (under 1 min): Read · Pack (40 s). The Faithful see the trip, the Killers its hint. Ten trips in five pairs that share a hint (`data/packItems.js`); the table of twelve holds the trip's five things, four of its twin's and three others, so the hint alone leaves two trips. Bags are private until the game locks, then all open at once: the trip, a tally of what the room packed (a tick on what belongs), and every guest's bag. Score: 100 + 100 for each thing that belongs. The 50 items are one hand-drawn sheet, `public/pack/items.webp` (`splash-film/items.html`).
     - Neither new game has a tutorial film: the screen shows a three-step how-to while the cards are on their way. Help has a page for each.
     - The Sketch and Run notes below describe the retired games.
     - **The Word tutorial (2026-10-03).** Players found Word badly explained, so the first Word morning (day 1 in the default rotation; never with "Run every day") rings a longer alarm, and the banner says DEEP BLUE will show how the game works. In DEEP BLUE, six short hand-drawn clips explain it (the secret word and the Killers' hint, one word that fits, the wall in order, three picks and the points, the lowest score). Then the guest practises on a fake wall and meets the clue written by someone who only saw the hint. The cards are dealt when the alarm ends, and that closes the tutorial for anyone still in it. The "How to play" button in the game replays it any day. The example is POPCORN / "A snack", which must never be a live word pair.
     - **The Sketch tutorial and board (2026-10-03).** The same for the second game: the first Sketch morning (day 2 in the default rotation) also rings the longer alarm, and DEEP BLUE plays six hand-drawn clips (everyone gets a different word, Killers too; draw it in 45 seconds; guess the others, faster scores more; your drawing scores +30 each time it is guessed; the lowest score dies). Then the guest practises guessing a teapot against the real 15-second bar. The pens coming out close it. Sketch itself became a paper sketchbook: a spiral page and felt-tip pens to draw with, "PENS DOWN!", each drawing to guess on a polaroid with a live "+N" that falls as the seconds pass, wrong guesses crossed out, and a wall of polaroids with their words after the board.
     - **Word (about 2 min).** The Faithful see a secret word (e.g. *Prawn*). The Killers see only its category (*Seafood*). Each living guest posts one word that fits the word without saying it. The clues stream onto a public, numbered wall in the order they land, so a Killer can wait and read the others before posting, but everyone can see who waited. Then everyone picks the three clues that fit best. A guest scores 100 for a fair clue plus 50 for each pick it gets; a clue that gives the word away scores 0. After the board, the wall stays up with the word revealed until the vote. Ghosts post and pick too (since 2026-10-15); their scores go on the ghost board.
     - **Sketch (about 2½ min).** Each living guest gets their own secret word and draws it with a finger (45 s). Then each phone shows about six other guests' drawings, one at a time with 15 s each, and the guest types a guess. A right guess scores 50 plus up to 50 for speed; a drawer scores 30 each time their drawing is guessed. After the board, everyone's drawings stay up with their words. Ghosts draw and guess too (since 2026-10-15).
     - **The Run (90 s).** Everyone plays the same course. Your best run counts. Ghosts can play too, on their own board.
   - **The game locks (no reveal).** The host reads the scores and sends the top 3 living a clue photo each, told privately ("You made the top 3…"). The word or the drawings go up in the game and in the paper. Daylight opens. (The leaderboard reveal, the rig and the shield were removed after the 15 Oct playtest.)
   - **Investigation (8 min).** Photos, Messages, Contacts, and real conversation about shoes, tops, glasses and drinks. A clue photo names a group ("a clear spirit"), Contacts shows who answered into it, and the talk is about whether the file is true.
   - **Round Table.** An open vote in the **Vote** app (home screen): anyone votes for any living guest; the most votes is killed, with one re-vote if it ties. Ghosts vote too (since 2026-10-15), but only the living can be voted for. A synced reveal shows Killer or Faithful and who voted for whom.
4. **Endgame.** Two votes; Ghosts vote too. Any Killer left alive wins it for the Killers.
5. **The finale (2026-10-02).** Every phone plays the special edition together: who won, the Killers' faces, then *how it happened*, night by night (who the Killers chose, who hacked and what the photos described, any frame, each firewall, each morning and each vote), and every guest's secret role. This is the murder-mystery payoff the old reveal deck used to give.

**The game clock (decided 2026-10-02).** The phone shows the time *inside the game*, not real time, and the evening runs itself on it. The host picks how long the evening should last from the deal to the finale (1½, 2, 2½ or 3 hours, or a quick test) and how many days; the open parts of each day (the night, the investigation, the vote, the final votes) stretch or shrink to fit, while the morning news, the alarm, the morning game and the verdict keep their real lengths. The clock then runs at one speed, about 50× real time at two hours over five days, so that each day runs from the 07:00 morning news to a verdict around 22:00. It jumps forward twice a day: the night starts at 01:00, and the morning news lands at 07:00 (the room sleeps through the gap). The Clock app shows the game time, today's schedule, and what comes next ("Vote at 16:25"). Autopilot is on from the start, so after dealing the host only watches; the console still has Next, +1 min and Time up. The rules are in [src/lib/engine/clock.js](src/lib/engine/clock.js).

**Discovery, not instruction (decided 2026-10-02).** The user felt the game was "too forced": it explained every mechanic and opened screens at people, which reads as if the game thinks players are dumb. Now:
- **Nothing opens by itself.** No app opens on a phase change, not even the morning news, the verdict or the finale. A phase arrives as a chapter card, a banner ("Night 2 is over. The morning news is in.", "The vote is open."), a badge on the app that wants you, and the home screen's NowCard, which opens that app if tapped. The one exception is the morning alarm: since 2026-10-16 it takes the screen again and rings until slid, and the guest's slide opens DEEP BLUE.
- **Copy keeps the premise and cuts the mechanism.** "Some of you are Killers, find them, vote to kill them" stays. The hand and the firewall are never explained; the morning news, the photos and the room teach them. Each role text is one line ("Don't get caught."). Input rules stay ("One word. No spaces."). The finale still explains everything, because after the game is where explanation belongs.
- **Except the Night app (2026-10-02, after playtesting).** Nobody could tell what "Watch a guest" or "Dig through the logs" was for, so the Night app now explains every move in full: a card at the top says what the night is for ("Each night, one Killer goes out to strike. Pick one move to hunt them."), each move is a card with a one-line purpose, and tapping it opens the move with labelled rows (Tonight, At dawn, Why, Careful) above the choice. A saved move shows as a done screen with Change my move. The Killer's Night explains the kill (your pick is killed at dawn, unless a Doctor protected them; the turns). The Doctor, Detective and Ghost get the same treatment. Messages, News and the role texts still explain nothing. The Night icon is always on the home screen, but opens only at night (the night and the recruit, with their locks). By day the icon is transparent and locked, the way DEEP BLUE is before play: a tap shakes it and a toast says "This app can only be opened at night." A Night app left open closes at daybreak (user's call, 2026-10-16).
- **The Night app's UX pass and tutorial (2026-10-03, the user's ask: "it's not clear what the person has to do").** Every role's Night now reads the same way: a moonlit sky over Panjim with "Night N" and the time left, the move, and a bar along the bottom that always says the next thing to do. A tap selects; Confirm sends ("Watch Priya · Confirm"); the move then shows sealed until the night locks, with Change my move. The first time a guest opens Night in a game, a hand-drawn tutorial of eight short clips plays before their move (night falls; the Killers' poll; watch; dig; the Doctor; the Detective's trace; ghosts; dawn), the same on every phone so it reveals no role, and the "?" in the bar replays it.
- **The lounge (2026-10-16, the user's ask: "a big UI/UX overhaul in the Night app").** Night is now a drawing of the party from high up: everyone's figure (their contact photo's person, without the room) standing at the lounge's high tables, the bar along the back wall and a DEEP BLUE computer in the corner. A move is two taps: tap a guest (or the computer) to see the moves you can make there, then tap one. Faithful watch a guest or dig at the computer; the Detective also traces two guests; the Doctor protects a guest; the Killers vote on a guest; ghosts pass a photo or whisper to a living guest. The move then shows in the room (an eye over the guest, a shield, a dotted line between two traced guests, the screen lit) and changes with a tap on someone else. The killed stay where they stood, faded. The user chose the setting (a party lounge), the two taps, and keeping the killed in the room.
- **And the Help app (2026-10-02, the user's ask).** A rule book on the home screen with every rule and term in short plain sentences, a doodle per page. It is pulled, never pushed: nothing opens it or links to it, so the rest of the phone still lets players discover the game. It reads the same on every phone. It does state the kill plainly (the Killers vote on one guest each night; a Doctor's save means nobody dies), the same facts the Night app already gives the Killers and the Doctor.
- **The Killers find each other through a group chat.** At the deal, a group titled with the other Killers' names appears in Messages ("DEEP BLUE added you"). Nobody says these are your partners. The group is their channel all game, and the night's poll lives in it. The Night app shows a Killer the same poll, under a short explanation of how the kill works.
- **The home screen is role-neutral.** The NowCard says what is happening ("Night 2.", "The room is voting."), identical on every phone.

**The world around the game (2026-10-02).** Between the beats the phone keeps the story going without asking anyone to read much: DEEP BLUE talks to each guest in its Messages thread (an old manifesto already there when the phone first opens, dated years back, in which DEEP BLUE declares itself the justice the courts never were; then one line at nightfall, one when the morning game opens warning that it is watching until you play, after each board, after each verdict); a Weather app shows the storm over Panjim building day by day; every guest has the same drawn face on the board, the poll and the finale; the board tells you your own place; and Photos sums each night's clues into a sketch of that night's hand.

**Live roster:**
- A late arrival is dealt in straight away, always on the Faithful team.
- A guest who leaves vanishes at the next dawn, and their role stays secret. Before the deal, leaving is immediate and they can join again as a new guest.
- Arrival answers (and the photo) can't be changed once the phone is ready. To redo them, a guest leaves before the deal, or the host removes them, and they set up again.
- If a vanished Killer leaves the team short, the Killers recruit. A guest who refuses is murdered.

**Roles (2026-10-02): the Medium is gone.** It was one guest per room, it learned nothing the Ghosts couldn't already whisper, and the one thing only it learned (a ghost's team) it couldn't prove to anyone. It was a passive role that was dull to be dealt. The roles are now Killer, Faithful, Doctor and Detective. The guest who would have been the Medium is plain Faithful. Spirits is now the ghosts' own chat, and nobody living can read it. Ghosts keep everything else: a true clue each night, the whisper, and the Endgame votes. Nobody learns a ghost's team until the finale. The sim barely moved: 47–63% Faithful wins from 16 to 45 guests, against 44–62% with the Medium. A "chorus whisper" (two or more ghosts whispering to the same guest are joined into one message) was offered as a way to give the ghosts more to do, and is not built.

**Ghosts (2026-10-03): pass the clue, and a tutorial at death.** The user asked what the whisper was for and wanted ghosts to have more to do. Ghosts hold the only clues that are always true, but a word from a list of 24 could barely carry them. Now a ghost's night move is either **pass a photo** (a signed copy of one of their own true clue photos lands in a living guest's Photos; the host checks the ghost really holds it) or the whisper. The sim did not move (Faithful 48–64% with or without it): a passed photo mostly repeats a clue the room already heard, and it matters on a night the Killers bend the clues. Offered and not chosen: ghosts point at a suspect during the Roundtable, and the chorus whisper. The ghost's own phone now plays a hand-drawn **ghost tutorial** right after SIGNAL LOST: six clips (welcome, the living can't hear you, a true photo each night, pass it on, Spirits, the ghost board and the final votes), replayable from Help → Ghost. The same day the change was carried through the rest of the phone: Help (Night, clues, glossary, quick answers, the Ghost sketch now shows a photo handed on), the Night tutorial's ghost clip (a clue photo floats beside the words), DEEP BLUE's morning line to a ghost, the ghost's NowCard during the morning game (it said "No signal." though ghosts play), the host console's clue labels, and a Day 2 News story, *The phones of the dead are still sending photos* (pure flavour, `still-sending`).

**Ghosts only pass; anyone alive can share a photo to the Room (2026-10-16, the day of the Anjuna event).** The user said the whisper made no sense for ghosts and kept the part they liked: a ghost gives a clue to a living guest. Now:
- **Passing a photo is a ghost's one night move.** Tap a living guest in Night, then the photo they get. It lands at dawn as a whole clue photo in their Photos, signed with the ghost's name, with no code to type (unlike a dig's torn half). The whisper (one word from a list of 24), its words in the packs, its glyph and its delivery line are gone. A ghost with no photo yet sees "No photo yet. Your first arrives at dawn."
- **Share in chat.** Any living guest can open a photo in Photos, tap **Share in chat**, confirm, and the photo posts to The Room as a picture bubble with its plain line. Everyone sees it. Once per photo. The bubble never says where the photo came from (a dig, the top 3, a ghost's pass): the guest can say, and the room has only their word. Ghosts can't share (they stay muted in the Room; a ghost's photo is always true, so letting every ghost broadcast every night would hand the Faithful the game); their only way into the Room is last words.
- The Night and Ghost tutorial clips that showed the whisper (Night clip 7, its dawn result, Ghost clip 4's word card) were redrawn and re-rendered.

**Evidence and ghosts (2026-10-03): more clues, more kinds of evidence, ghosts who matter.** The user wanted the evening to feel more like a murder mystery, where people discover evidence and work out the Killers. Asked, they chose genuinely more clues (not just nicer ones), a public last message from the guest who is taken, ghost sight, and video drawn in code. Four things changed:
- **Evidence comes in forms.** A clue no longer always arrives as a CCTV still. It may be four seconds of CCTV footage (the camera sweeps, then zooms in on the detail), a bar tab found by the admin terminal, a leaked screenshot of the admin account with one field readable, or a witness's voice note with its transcript. Each says exactly what the photo would: a group, never a raw answer. Two guests holding the same clue may hold it in different forms, which gives the room something to compare. Presentation only; it changes no rule.
- **The morning paper prints a witness.** Every murder night gives one extra true clue about that night's hand, printed in the morning's News story as a boxed quote ("Loud colour, or a print. You couldn't miss it.") with the plain line under it. Everyone reads it and nobody can lie about it, so it is vaguer than a photo (it fits 55–85% of the room the private clues left).
- **Last words.** The guest the Killers kill may post one of their true clue photos to the Room, once, any time that day before the verdict. It is a photo, not text (ghosts stay muted), framed in black: "Ghost photos are always true."
- **Ghost sight.** A ghost's Photos has a second album, The Room: every clue the living got, night by night, with who got it. A ghost can catch someone lying about their clue, or catch a frame against their own true photos, and pass a true photo to someone who will act on it.
Not built, offered instead: a figure walking through the clip (the clip moves the still, which keeps it cheap on Android); a separate drawn crime-scene picture (the dawn story keeps its existing drawing).

**Balance:** tuned with `npm run sim`. **With the witness (2026-10-03)** the private clues per night went from 2, 2, 3, 3, 3 to 1, 2, 2, 2, 3 (plus the witness: 2, 3, 3, 3, 4 in all), and a room's clue budget now moves one clue per 15 guests either side of 35 (was 20), because the extra public clue helped small rooms most. A first try (a sharper witness on the old budget) put the Faithful at 85% at 35 guests. Now the Faithful win 62/54/48/48/47/50/57% at 16/20/25/30/35/40/45 guests (1500 games each), the same band as before. In the sim, last words and ghost sight barely move the numbers, because the simulated room already pools every clue it hears; in a real room their value is that they are true and public. Before 2026-10-03: With the Killers sending only a victim and the engine rotating the hand (2026-10-02), the Faithful win 45–57% of simulated games from 20 to 45 guests (61% at 16). The engine can frame someone automatically (`autoFrameFrom`, try `npm run sim -- --frame 2`), but on any night it drops the Faithful to 27–49%, so it is off. The sim does not model the Word game. Word gives the Faithful a new signal: who doesn't know the word. Watch the first events, and if the Faithful run away with it, the lever is the hints (make them broader).

**Clarity and agency (2026-10-15), for the 16 Oct Backroom Anjuna event.** After the 3 Oct Greenr Panjim game, players said they didn't know what the game was, what DEEP BLUE was, or what they were playing for, and they followed the host's instructions instead of playing on their own. Three causes: the premise was never stated, the same thing had many names, and nothing a player did changed what happened next. The principle changed: **always tell the goal, the stakes and what each tool is for; let players discover the tactics.** This relaxes "Discovery, not instruction" above. What changed:
- **One story, told everywhere.** DEEP BLUE is a cursed app on every phone; it gave three guests the admin password (the Killers), who choose one guest to kill each night; every morning everyone plays its game and the top 3 win a clue; find clues, then vote; kill all three Killers and DEEP BLUE deletes itself (rewritten 2026-10-15 after the playtest). Setup now opens with a **Case** screen (three panels: what DEEP BLUE is, who the Killers are, your goal) before the rewritten Terms. At the deal every phone plays **the hijack**: three glitching beats with the premise, then the sealed role message (an exception to "nothing opens by itself", the user's choice). The role cards give each role its reason ("DEEP BLUE gave you the admin password…").
- **One word: "killed".** Every way of leaving the game is "killed", whether by the Killers at night or by the vote. Banish, logged out, voted out, taken and SIGNAL LOST are gone from every screen (the user's call).
- **Score is a shield** (removed after the 15 Oct playtest, with the board). If the Killers' target scores in the top quarter of that morning's board, the rig bounces and the lowest honest score is killed instead, exactly like a Doctor's save. The board shows a gold "LOCKED ABOVE THIS LINE" rule. The morning game now matters for everyone: play well to be locked; play badly and you're the honest bottom.
- **Torn photos (split clues).** A dig gives half a clue photo and names the guest with the other half. Either one types the other's 3-letter code; the host checks it and the whole photo appears on both phones. A Killer can hold a half, and stalling is evidence.
- **Visible progress.** The home screen shows, role-neutral, how many living guests fit the newest night's public clues and how many Killers have been caught ("Night 2's Killer: 7 guests fit the clues · Killers caught: 1 of 3"). Each night's sketch in Photos shows how many fit your own clues. Only counts, never names.
- **Ghosts play and vote (2026-10-15, after the 3 Oct game: ghosts felt left out).** A ghost now gets a Word card (word or hint, by team) and a Sketch word like everyone else, posts a clue or draws, and their score lands on the ghost board, never the rig's board. Ghosts vote at every Round Table and re-vote, not only the Endgame. Accusing and seconding stay with the living. The sim (`--ghostvote off` for the old rule) put the Faithful at 58/47/53% without ghost votes and 56/50/53% with them for 20/30/40 guests: inside the noise. The sim's ghosts vote on what the room knows; real ghosts also hold true clues and ghost sight, so the true effect leans a little more Faithful.
- **The room calls its own vote** (removed after the 15 Oct playtest: the vote is open again, in its own Vote app). In daylight any living guest accuses one guest (optionally showing one clue photo); others Second it. A guest with 2 Seconds (or a second accuser) goes **on trial**, and the Round Table votes only between those on trial, plus "No one" when there is just one. Nobody on trial means no vote and nobody killed. The clock still ends the day. Accusations land in the Room as cards with a Second button; the Accuse screen opens from the NowCard, a banner and a bar pinned in the Room.
- **The host narrates.** The console shows a cue per phase (what to watch for, how to stir the room) under the read-aloud lines. The phones carry every instruction.
- **Venue.** The game is called Three Knives Out, in collaboration with SideQuest Club; News, Weather and the opening film moved from Panjim/Greenr to Anjuna/SideQuest.
- Not chosen, offered: a lobby warm-up, an "admins online" bar, a penalty for a false accusation, greying out ruled-out guests.

**Balance after the playtest (2026-10-16).** With the open vote every day and the Killers' vote as the only night death, the sim (2000 games each) put the Faithful at 61/49/44/46/42/50/57% for 16/20/25/30/35/40/45 guests on the old witness band, so `publicBand` stays at 0.5–0.8: **76/56/55/54/51/59/68%**. 20–40 guests sit in the target band; very small and very big rooms lean Faithful.

**Balance (2026-10-15, superseded).** The sim then modelled the shield, torn photos (85% of Faithful pairs join) and trials (85% of days put someone on trial; a lone accused is spared if they look below 0.35 suspicion). Each skipped vote costs the Faithful 4–5 points, so the witness got sharper (`publicBand` 0.55–0.85 → 0.5–0.8). Result, 2000 games each: **72/55/50/48/45/50/57%** Faithful at 16/20/25/30/35/40/45 guests. Small rooms favour the Faithful. A real room that accuses less often than the sim assumes will tilt it toward the Killers.

The technical design is in [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md).

---

## Overview (Greenr, retiring)

**Case title:** Greenr: Last Seating (Case 2609-G)  
**Platform:** React + Vite PWA  
**Format:** Live social-deduction murder mystery at a private closing dinner  
**Cast size:** 26 canonical guests, 10 pre-registered non-case guests, 1 fictional victim  
**Investigation shape:** 10 suspects, 16 witnesses, 3 killers  
**Duration:** ~1.5-2.5 hours across 7 rounds

The active case is set at **Greenr, Assagao, Goa**, on **19 September 2026**. Twenty-six founders, collaborators and advisers have gathered for a sunset signing dinner that is meant to close a Greenr launch vehicle. Instead, the evening collapses when **Rehan Vora**, an independent diligence partner hired to bless the numbers, is found dead in the upstairs library before the welcome line begins.

---

## Story Premise

Rehan spent the day asking the kind of questions rooms like this hate: who got paid twice, who rewrote which paper, why the same work seemed to exist on three invoices, and why so many "temporary" problems seemed to benefit the same small circle of people. By sunset he had separated the room into three criminal lanes and seven merely embarrassing ones.

That split is the case's engine. Ten guests have real reasons to fear what Rehan is about to say. Only three decide that the signing cannot survive him.

At **5:58 PM**, the launch reel stutters, the guest Wi-Fi dies and the card reader goes with it. In a room like this, that looks like inconvenience. In this case, it is cover. Rehan returns upstairs, refills the black bottle he always carries, and collapses minutes later. By **6:40 PM**, rain, the gate chain and the police have sealed Greenr with all 26 canonical guests still inside.

---

## Core Gameplay Loop

1. Players log in as one of 26 canonical identities or one of the registered non-case guest identities.
2. The host starts the room; Round 0 opens with the fullscreen typed briefing.
3. A player tutorial then reveals the app one task at a time: identity, one guest profile, Comms and the voting screen.
4. Each round clock automatically gives every player a host-configured ballot when it reaches zero; then a public running tally adds every completed round together and names every voter and their choice.
5. Normally the host starts the next round after that announced tally; the host console also provides confirmed manual previous/next round recovery controls.
6. Round 1 directs every player to their accusation card on the Evidence screen - one suspect-lane witness claim from their statement pod. Players read the accusation and its code aloud; listeners enter the code through Evidence → CODE to unseal that accusation on their own phones.
7. Round 2 opens the riddle lock and puts the 10 motive files into its prize pool.
8. Round 3 unlocks case files and adds 8 evidence clues to the pool.
9. Rounds 4 and 5 deliver the turn through 6 revelation clues and the late-game case files.
10. Round 6 reveals the killer team, hands the killers the confession and opens the reconstruction deck for the room.

### Arrival Tutorial

The tutorial replaces the old passive screen-note onboarding. It is stored locally per player, so a reload resumes the next task without writing any tutorial state to Firestore. In Round 0, the hub exposes only the destination required for the current lesson; the player must open their identity, a guest profile, Comms and voting in that order. After the vote lesson the core screens remain available, while Evidence remains held until Round 1. At Round 1, unfinished tutorials advance to the Evidence lesson so no player misses their assigned accusation; completing it releases the normal board and the later round gates take over.

### Pre-Registered Non-Case Guests

Ten registrations are shipped in the static guest list with their own secret login codes. They play the same public screens, chat, riddle economy, accusations and voting as the canonical room, but appear as **Walk-in** guests and receive the standard deterministic bystander accusation and reward queue.

They are not story characters. They do not change the 26-player cast, suspect count, killer team, statement pods, clue decks or reveal.

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