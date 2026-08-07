# Mystery Game - All Clue Codes

> Maintenance note: Update this file whenever a clue code or login code changes in [src/data/gameData.js](src/data/gameData.js).

## How these reach players

**Nothing on this page is printed on a card any more.** Since 2026-08-07 the 23 motive,
evidence and revelation codes are won inside the app through the **riddle lock**: a player
taps ASK on the Evidence screen, answers a one-word general riddle, and is handed the next
clue in their own queue *plus its code*, which they are told to share with the room. Everyone
else types that code into CODE (the decoder). See
[The riddle lock](TECHNICAL_DOCUMENTATION.md#the-riddle-lock).

Two consequences for this file:

- **It is now the host's override, not a packing list.** The same table renders in-app on the
  Host Guide's **Deck** tab. If a round stalls because nobody has solved anything, read a code
  out loud and the clue enters the room instantly.
- **Accusation codes still are not distributed at all.** Every player is dealt one accusation
  automatically when Round 1 opens, and they are excluded from the riddle pool.

The riddles themselves live in [src/data/riddles.js](src/data/riddles.js) — 100 of them, none
touching the case. They are not listed here: they are not clues, and a host reading answers off
a sheet is not the point.

---

## ⚠️ Why every code is a meaningless word

Clue codes are **single neutral words with no relationship to the clue they open, to each
other, or to any login code.** Three rules, each of which was broken once and cost something:

1. **A clue code must never equal a login code.** Until 2026-08-07 the ten motive codes *were*
   the ten prime suspects' login codes — `THIMBLE`, `ORACLE`, `FORGERY` and so on. Since Round 2
   works by players shouting motive codes across the room, that handed everyone the killers'
   credentials: log out, type `THIMBLE`, and the Identity screen reads **Classified · Killer**.
   The case was solvable in Round 2 without a single deduction.
2. **A clue code must not describe its clue.** `EVIDENCE_TOX` and `REVEAL_THREAD` tell a player
   what they are about to receive, and worse, tell a player who *hears* the code shouted what
   somebody else is holding. Codes are currency; currency should not be self-labelling.
3. **A clue code must not be guessable.** `ACCUSE_SNEHA` is derivable from a roster. Nobody
   guesses `CADENCE`.

Words are also picked to be shoutable across a loud room: no homophones with other codes, no
overlap with the 100 riddle answers in [src/data/riddles.js](src/data/riddles.js).

---

## Accusation Clues (Round 1)

Not distributed — every player is dealt one automatically when Round 1 opens. Codes exist only
so the host can push one into the room manually.

| Code | Target |
|---|---|
| LANTERN | Sneha Ganesh |
| HARBOR | Tara Singhania |
| CADENCE | Kiyaah Rose Raghuwanshi |
| MARBLE | Victoria Vance |
| COMPASS | Roddy Faustus |
| TANGENT | Oindrilla Chatterjee |
| SATCHEL | Tanvi Vartak |
| PARADE | Rishi Raj Rahul |
| BOULDER | Vinod Raghuwanshi |
| CARNIVAL | Anna Russo |

## Motive Clues (Round 2)

| Code | Target |
|---|---|
| PENDULUM | Sneha Ganesh |
| SAFFRON | Tara Singhania |
| DRIFTWOOD | Kiyaah Rose Raghuwanshi |
| GRANITE | Victoria Vance |
| THISTLE | Roddy Faustus |
| LATTICE | Oindrilla Chatterjee |
| ORIGAMI | Tanvi Vartak |
| STAMPEDE | Rishi Raj Rahul |
| OBELISK | Vinod Raghuwanshi |
| MOSAIC | Anna Russo |

## Evidence Clues (Round 3)

| Code | Title |
|---|---|
| BEACON | Toxicology Summary |
| FILAMENT | Signature Drink Atomizer Analysis |
| HALOGEN | Projector and Bar-Camera Log |
| GABLE | Floor Plan and Sightline Notes |
| PARCHMENT | Supplier Invoice Mismatch |
| TURNSTILE | Service QR Access Trace |
| QUARRY | Armaan's Monday Binder Index |

## Revelation Clues (Rounds 4-5)

| Code | Title | Round |
|---|---|---|
| SOLSTICE | Monday Audit Packet | 4 |
| HOLLOW | Private Bar Program Contract | 4 |
| BRAMBLE | Roddy's Missing Notebook Page | 4 |
| COBALT | Victoria's Signature Sheet | 4 |
| ZEPHYR | Admin Override Trace | 5 |
| CATACOMB | Burner Group Transcript | 5 |

## Confession (Round 6)
- KEYSTONE

`KEYSTONE` opens the confession, which is written for the killer team defined in
[src/data/gameData.js](src/data/gameData.js). It is not in the riddle pool and is never handed
out — treat it as host-only.

---

## Login Codes (51 guests)

### Prime suspects and killers
| Code | Character | Role |
|---|---|---|
| THIMBLE | Sneha Ganesh | Killer |
| ORACLE | Kiyaah Rose Raghuwanshi | Killer |
| FORGERY | Victoria Vance | Killer |
| HEMLOCK | Roddy Faustus | Killer |
| AMBER | Oindrilla Chatterjee | Killer |
| CANVAS | Tara Singhania | Prime suspect |
| PIXEL | Tanvi Vartak | Prime suspect |
| MYTHOS | Rishi Raj Rahul | Prime suspect |
| REGENT | Vinod Raghuwanshi | Prime suspect |
| REPLICA | Anna Russo | Prime suspect |

### Witnesses
| Code | Character |
|---|---|
| CIPHER | Yukta |
| VACUUM | Shubham Goyal |
| ADELE | Lakshmi Godbole |
| HOUND | Ricardo Gauco |
| ECHO | Fabiola Dsouza |
| ESPRESSO | Govind Mukundan |
| SHERLOCK | Ajay Jain |
| CLOUD | Mahi B |
| RABBIT | John V |
| SOAPSTONE | Swati |
| ORDER | Chinmay Nema |
| PSYCHIC | Natasha |
| WHISKER | Savvy Grover |
| PHANTOM | Dinesh Verma |
| HEX | Valerie Anithra Pereira |
| POOL | Chayne Lobo |
| BLOOM | Flora Florentine |
| ROSS | Keith Murdoch |
| ROBIN | Soham Vaidya |
| BLUEPRINT | Hima |
| VERSE | Vaidehi Bharadwaj |
| COSMOS | Ashish Khurana |
| OBSERVER | Chryselle Pinto |
| JATT | Akash Jain |
| NOMAD | Aayushi Gandhi |
| ROUGE | Esha Singh |
| INK | Parinitha Konanur |
| FICTION | Sunali Panda |
| GOSSIP | Meera Victoria Raghuwanshi |
| BENDER | Dona G |
| RHYTHM | Nanu |
| ALCHEMY | Aarushi |
| SUMMIT | Meenal Raghuvanshi |
| ENIGMA | Amanda T |
| GHOST | Nolani Noget |
| SPARKLE | Vidya |
| TAROT | Khyati Adesara |
| SUDOKU | Sanika Malvi |
| VOYAGER | Kristen Alfonso |
| ROADIE | Anjul Mishra |
| TREKKER | Aaina Singh |
