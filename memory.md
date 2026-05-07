# memory.md — Project Facts to Remember

> **Read this at the start of every session** alongside [Claude.md](Claude.md) and [Lessons.md](Lessons.md).
>
> Purpose: facts, IDs, decisions, and context that **don't live in code** — so reading the codebase will never surface them. Add a bullet here whenever the user shares context that future-me will need but won't be able to derive.

---

## What belongs here

- ✅ Owner identity, brand, contact details
- ✅ Live game / event details (dates, venues, player counts)
- ✅ Decisions the user has made that aren't documented in code
- ✅ Spoilers / story facts that matter for working on game logic
- ✅ Deployment targets, account info (without secrets), URLs
- ✅ Known pitfalls or constraints not visible from reading source

## What does NOT belong here

- ❌ Anything already in code (read the code instead)
- ❌ Anything documented in another `.md` (link to it instead)
- ❌ Ephemeral session state — that goes in todos or the conversation
- ❌ Secrets, API keys, passwords

---

## Project facts

- **Project nature:** React PWA in a folder named `Unity Projects` — disregard the folder hint, it has nothing to do with Unity.
- **Owner:** Kushagra (kushagra@triplespeed.ai)
- **Brand:** Astral Project
- **Game name:** Astral Project's Murder Mystery Experience
- **Real-world purpose:** Office activity for TripleSpeed (Kushagra's company). Cast = real colleagues. The game's events are *not real* — it's a fictional murder mystery using the office as the setting.
- **Player count:** 32 (the data model is built around exactly 32 character slots)
- **Live game date in fiction:** 2026-05-23, set at the founders' Penthouse, 4th floor, Indiranagar, Bangalore.
- **Victim (spoiler):** Nikhil — fictional Head of Marketing at TripleSpeed. NOT a real person on the team.
- **Murderer reveal (spoiler):** Alam (Head of HR). Nikhil and Alam staged his death together. Nikhil had Stage 4 pancreatic cancer AND was about to be indicted in a SEBI inquiry into TripleSpeed's cooked engagement metrics. Suicide voids the insurance and the SEBI case continues posthumously through Nikhil's estate; a clean homicide pays out (Trust + key-person policy) AND collapses the SEBI case. Alam was Nikhil's HR-side fraud co-conspirator and is the named trustee on the personal life-insurance policy.
- **Murder method:** sodium azide–laced vape cartridge, swapped during a 25-min window when Alam was alone in the Penthouse the morning of the party.
- **Round structure:** 7 rounds (0–6) with codes unlocked progressively (accusation → motive → evidence → revelation → confession).
- **Special clue `THE_TRUTH`:** only valid for the Alam character (`char_alam`) — gates the final confession reveal.

## Infrastructure

- **Main git branch:** `main`
- **Deploy target:** GitHub Pages, base path `/mystery-game/`
- **Deploy command:** `npm run deploy` (runs `predeploy` → `vite build`, then `gh-pages -d dist`)
- **Backend:** Firebase Firestore — config lives in [src/firebase/config.js](src/firebase/config.js). Treat it as live production.
- **Local dev port:** 5173 (Vite default)
- **Default shell on this machine:** PowerShell on Windows 11.

## Conventions the user has confirmed

- *(none yet — add here when the user explicitly approves a non-obvious choice)*

## Update protocol

When the user shares a fact that fits the "What belongs here" criteria above, append a bullet under the most appropriate section (or create a new section). Keep it tight — one line per fact when possible.
