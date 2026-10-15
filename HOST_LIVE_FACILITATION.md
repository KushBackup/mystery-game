# HOST_LIVE_FACILITATION.md - Run of Show

> **Host-only.** The current game is **Three Knives Out** (Killers Night, the DEEP BLUE phone), first run with these rules on Fri 16 Oct 2026 at Backroom, Anjuna, with SideQuest Club. Its run of show comes first. The old authored-case script (Greenr: Last Seating) is kept below for reference.

## Three Knives Out: you narrate, the phones instruct (2026-10-15)

After the 3 Oct game the room waited for the host to say what to do next. Now every instruction is on the phones: the Case screen at setup, the hijack at the deal, the Night app, banners, the NowCard. **Your job is to narrate and stir, never to explain a step.** The console shows a cue for every phase under the Read aloud lines.

### The one-breath premise (if anyone asks)

DEEP BLUE is a cursed app on every phone here. Every morning, everyone plays its game and the lowest score is killed. Three of you have its admin password: the Killers. Each night they push one score to the bottom. The top of the board is locked, so play well. Find clues, accuse, vote. Kill all three Killers and DEEP BLUE deletes itself.

### Phase by phase

| Phase | What the phones do | What you do |
|---|---|---|
| Arrivals | Opening film, Case screen, Terms, six questions | Greet people. Help stuck phones finish setup. Don't explain the game. |
| Deal | Every phone glitches together: the hijack (3 beats), then the sealed role | Stay quiet and watch faces. |
| Night | Night app explains every move | Lights down. Hurry anyone still staring. |
| Alarm + morning game | Banner, then the day's game | React like the alarm is real. Remind them: top quarter is locked, bottom is killed. |
| Board | Synced reveal; gold "locked" line; KILLED | Ask the killed guest whether that was really their score. |
| Daylight | Torn photos, suspect count on the home screen, Accuse / Second in the Room | Point at torn photos still waiting for their other half. If nobody has accused anyone, say it out loud: no trial means no vote. |
| Vote | Only those on trial are on the ballot | One sentence of defence from each accused, then let the phones vote. |
| Verdict | Synced reveal | Let it land. Cheer a Killer; ask who pushed hardest for an innocent. |
| Endgame | Two final votes; ghosts vote too | Ask who they trust least. |
| Finale | Winner, then "how it happened", night by night | Tell them to open News for the full story. |

### Words to use

Only **killed** for anyone leaving the game, whether by the board or by the vote. Never banish, logged out, voted out or taken.

---

# Archive: Run of Show (Case 2609-G · Greenr: Last Seating)

> **Host-only. Full spoilers.** The fast, round-by-round script for running the
> room live. The in-app twin is Host Guide -> Rounds
> ([src/data/hostReference.js](src/data/hostReference.js)); the spoken lines live
> in `HOST_SCRIPT` ([src/data/gameData.js](src/data/gameData.js)) and render on the
> host console. This file is the paper backup and the pacing notes.

## The shape of the night

| Phase | Time | What happens |
|---|---|---|
| Pre-game | ~5 min | 26 canonical logins onto the waiting screen; host-issued passes handle any walk-ins; the ASK->code->CODE loop is explained out loud |
| **Start game** | 10 sec | You press it. The room counts down together and lands on Round 0 |
| Round 0 | 10-15 min + ballot | Briefing plays, Incident Report, automatic blind vote |
| Round 1 | ~15 min | 10 accusations auto-dealt via statement pods |
| Round 2 | 15-20 min | Riddle lock opens; 10 motive files in the pool |
| Round 3 | 15-20 min | Case files unlock; 8 evidence clues join the pool |
| Round 4 | 15-20 min | Case files unlock; 4 revelations join the pool |
| Round 5 | 10-15 min | Final 2 revelations; team-naming push |
| Round 6 | ~5 min + ballot | Final automatic ballot, reveal, then How it happened |

Total: 1.5-2.5 hours depending on how much the room talks. Err long on rounds 3-5.

## The answer, one breath

**Jack** (plan) · **Arun** (blind spot) · **Manasi** (dose). Yellow-oleander
concentrate painted inside Rehan's own black bottle while the 5:58 AV sync blanked
the live feeds, took the guest network down and sent the room's attention sideways. He
refilled the bottle himself at 6:08 and was found at 6:18.

## Per-round pacing notes

### Pre-game
- Distribute the 26 canonical login cards. For a late arrival, open **Host Panel → Open walk-in register → Issue registration word**, then give them that one word to enter on their own phone. Their login word appears in the same host screen after they register; never reuse a story code.
- Everyone who logs in sits on a waiting screen until you start the game.
- Explain ASK before ASK exists on screen.
- Set the round length before you start if you do not want the default.

### Start game
- Host console -> **Game start** -> **Start game**.
- Latecomers need nothing from you; they enter directly once the room has started.
- One phone still waiting? Use **Push start to everyone**.
- Mis-tapped Start? Use **Back to waiting**, then fix the clock separately if needed.

### Round 0 - The Incident
- Let the typed briefing play. Do not talk over it.
- When the round clock ends, the host-configured blind ballot takes over every player phone.
- Read the public, named tally, then press **Start Round 01** when the room is ready.
- Seed lightly if needed: the bottle, the crash and the seal are the public anchors.
- Expected early heat: Anushka, Nilisha, Sampada.

### Round 1 - Accusations
- Every player has one card. Make them read the accusation **and its code** out loud.
- Everyone listening opens **Evidence → CODE**, enters that word and unseals the accusation on their own phone. Then they trade theirs back.
- All 10 suspects should have heat by the end.
- If one suspect has none, read their accusation aloud yourself.

### Round 2 - Motives
- Demo ASK at one table; the mechanic spreads by imitation.
- Theme to reinforce: ten people feared the signing, only three killed for it.
- Watch for hoarders. "Who is sitting on a code?" still works every time.

### Round 3 - Evidence (the pivot round)
- Unlock the case files. The round clock handles the automatic ballot after discussion.
- The room must leave this round knowing: communal tonic clean, bottle dirty,
  crash staged from AV, blind spot scheduled early, Nilisha packet forged, hedge clipped.
- The question to plant if they stall: **If the batch was clean, what carried the dose?**
- Good witness nudges here: Kiandra, Shivali, Pujah, Nathan, Elton, Aashna.

### Round 4 - Revelations
- The flip: three criminal lanes, seven embarrassing ones.
- Make a table say the roles out loud: paper, picture, pour.
- The recovered memo is the emotional beat. The room finally sees why the suspect pool was wide.
- Good witness nudges here: Anshu, Balesh, Divya, Yonella, Shivani.

### Round 5 - Finale
- The chat and the beneficiary map land. Push from names to a team.
- If the room has two of three, the usual miss is Jack because he never touched the bottle.
- Counter-question: **Who built the frame and kept the founders staring at paper?**

### Round 6 - The Reveal
- Let the final automatic tally announce itself; it shows every voter and their choice.
- Trigger the reveal. Read the three names aloud, mastermind first.
- Point everyone into **How it happened** before handling questions.

## Emergency levers

- **Room stuck on founders past Round 3:** push the bottle timeline. Shivali and Kiandra are the break.
- **Nobody sees the crash as intentional:** ask Elton what he heard, or Nathan what he saw Arun take back out.
- **Nilisha frame holding too hard:** feed Balesh or Anshu to a quiet table.
- **Too fast:** sit on Round 4 files for ten minutes before the clock reaches the automatic ballot.
- **Round overrunning:** drop the clock to **1 min** while it is running.
- **Killer outed early:** remind the room the win condition is the full team plus the method, not one name.