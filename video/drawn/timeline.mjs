// timeline.mjs — when every word of the voiceover is spoken, so the picture can be cut to it.
//
// The script below is the same text as script.md. Until the user's recording exists, word times are
// ESTIMATED from the text (a relaxed ~2.5 words/s with pauses at punctuation). When `words.json`
// exists (written by transcribe.mjs from the real VO: [{ w, s, e }] in seconds), the script's words
// are ALIGNED to the recognised words and take their real times. Every cue in the film is asked for
// as (line, word, nth) — "the start of the word that names the thing" — so the same film code works on
// both, and swapping in the real VO retimes everything.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));

export const SCRIPT = [
  "Hey! This is Three Knives Out — the game we play at bars, with a whole room of friends and strangers.",
  "When you walk in, you answer six quick questions. What you're wearing, your first drink, that kind of thing. Hold on to that.",
  "Then your phone gives you a secret role. Most of you are Faithful. Three of you are Killers. And nobody knows who's who.",
  "At night, every phone goes dark at once. The Killers quietly pick someone to take. Everyone else hunts. The Doctor can save one person. The Detective can check two.",
  "In the morning, the whole room plays a quick game together. A word game, a drawing game, or tap to swim. The lowest score gets taken… and the Killers secretly rig who ends up last.",
  "Taken? You're not done. You come back as a ghost — and ghosts pass true clues to the living.",
  "Now the good part: the clues. Every clue describes a Killer. A dark top. Glasses. A gin. Check who matches. Ask around. Catch the lie.",
  "Every evening, the room votes someone out. And then the night comes back.",
  "Catch all three Killers, and the Faithful win. Let one slip through… and the Killers do.",
  "It's a bit of Mafia, Among Us, Pictionary and Cluedo — all on your phone, in one room. Come play with us sometime.",
];

export const norm = (s) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");
const LEAD = 0.8;                       // silence before the first word (frame 0 is never empty, see scene 1)
export const TAIL = 3.4;                // the end card holds after the last word

// ---------------------------------------------------------------- the script as tokens
const TOK = [];
SCRIPT.forEach((text, line) => {
  const parts = text.split(/\s+/).filter(Boolean);
  for (const raw of parts) { const w = norm(raw); if (w) TOK.push({ line, w, raw }); else if (TOK.length) TOK[TOK.length - 1].raw += " " + raw; }
});

// ---------------------------------------------------------------- estimated times (no VO yet)
function estimate() {
  let t = LEAD;
  TOK.forEach((k, i) => {
    const dur = 0.09 + 0.04 * k.w.length;
    k.s = t; k.e = t + dur; t = k.e + 0.03;
    const next = TOK[i + 1];
    if (next && next.line !== k.line) t += 0.5;                      // between lines
    else if (/[.!?…]$|—$/.test(k.raw)) t += 0.3;                     // end of a sentence
    else if (/[,:;]$/.test(k.raw)) t += 0.12;
  });
}

// ---------------------------------------------------------------- alignment to the real VO
// Needleman-Wunsch over normalised words: a script word takes the time of the recognised word it pairs
// with; unpaired script words are interpolated between their paired neighbours.
function align(words) {
  const A = TOK.map((k) => k.w), B = words.map((x) => norm(x.w)), n = A.length, m = B.length;
  const sim = (a, b) => a === b ? 2 : (a.length > 3 && b.length > 3 && (a.startsWith(b) || b.startsWith(a))) ? 1 : -1;
  const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), P = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { S[i][0] = -i; P[i][0] = 1; } for (let j = 1; j <= m; j++) { S[0][j] = -j; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const d = S[i - 1][j - 1] + sim(A[i - 1], B[j - 1]), u = S[i - 1][j] - 1, l = S[i][j - 1] - 1;
    if (d >= u && d >= l) { S[i][j] = d; P[i][j] = 0; } else if (u >= l) { S[i][j] = u; P[i][j] = 1; } else { S[i][j] = l; P[i][j] = 2; }
  }
  const pair = new Array(n).fill(-1);
  for (let i = n, j = m; i > 0 || j > 0;) { const p = P[i][j]; if (i > 0 && j > 0 && p === 0) { if (sim(A[i - 1], B[j - 1]) > 0) pair[i - 1] = j - 1; i--; j--; } else if (i > 0 && (j === 0 || p === 1)) i--; else j--; }
  TOK.forEach((k, i) => { if (pair[i] >= 0) { k.s = words[pair[i]].s; k.e = words[pair[i]].e; } });
  for (let i = 0; i < n; i++) if (pair[i] < 0) {
    let a = i - 1; while (a >= 0 && pair[a] < 0) a--; let b = i + 1; while (b < n && pair[b] < 0) b++;
    const t0 = a >= 0 ? TOK[a].e : 0, t1 = b < n ? TOK[b].s : t0 + 0.4 * (b - a), k = (i - a) / (b - a);
    TOK[i].s = t0 + (t1 - t0) * k; TOK[i].e = TOK[i].s + 0.2;
  }
  return pair.filter((p) => p >= 0).length;
}

const WJ = path.join(HERE, "words.json");
export const REAL_VO = fs.existsSync(WJ);
export let MATCHED = 0;
if (REAL_VO) MATCHED = align(JSON.parse(fs.readFileSync(WJ, "utf8"))); else estimate();

// ---------------------------------------------------------------- lookups
// cue(line, "word", nth) -> start time of that word in that line (nth occurrence, 1-based)
export function cue(line, word, nth = 1) {
  const w = norm(word); let c = 0;
  for (const k of TOK) if (k.line === line && k.w === w && ++c === nth) return k.s;
  throw new Error(`timeline: no "${word}" #${nth} in line ${line}`);
}
export function cueEnd(line, word, nth = 1) {
  const w = norm(word); let c = 0;
  for (const k of TOK) if (k.line === line && k.w === w && ++c === nth) return k.e;
  throw new Error(`timeline: no "${word}" #${nth} in line ${line}`);
}
export const lineStart = (i) => TOK.find((k) => k.line === i).s;
export const lineEnd = (i) => { const L = TOK.filter((k) => k.line === i); return L[L.length - 1].e; };
export const VO_END = TOK[TOK.length - 1].e;
export const DUR = Math.ceil((VO_END + TAIL) * 24) / 24;
export const TOKENS = TOK;
