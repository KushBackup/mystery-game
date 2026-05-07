# Lessons.md — Self-Improvement Log

> **Read this at the start of every session** alongside [Claude.md](Claude.md) and [memory.md](memory.md).
>
> Purpose: a running log of mistakes, corrections, and non-obvious lessons. Whenever the user corrects me, or I do something I shouldn't have, I append a new entry here. The point is to **not make the same mistake twice**.

---

## How to add an entry

Use the template below. Keep it short and concrete — one paragraph max per section.

```
## YYYY-MM-DD — Short title

**What happened:** (1-2 sentences describing the action and outcome)

**Why it was wrong:** (the root cause — assumption, missed context, wrong tool)

**What to do instead:** (the corrected behavior, applicable to future situations)
```

When the same lesson recurs, **edit the existing entry** rather than adding a duplicate — strengthen the wording so future-me cannot miss it.

---

## Entries

### 2026-05-07 — Don't assume Unity from the folder name

**What happened:** On first encountering the project at `d:\Unity Projects\mystery-game`, the folder name and recent commit "theme change" suggested a Unity game project. I almost started exploring as if Unity tooling, Assets/, and C# scripts would exist.

**Why it was wrong:** The folder name was a historical artifact, not an indicator of the tech stack. The actual project is a **React 19 + Vite + Firebase PWA** — completely unrelated to Unity. Acting on the wrong premise would have wasted an entire exploration cycle.

**What to do instead:** Always check `package.json` (or equivalent manifest) before assuming a tech stack. Folder names lie; manifests don't. For this project specifically: it is a React PWA — see [Claude.md](Claude.md) for the full primer.

---

<!-- Add new lessons above this line, newest first or oldest first — keep one consistent order. Current order: oldest first. -->
