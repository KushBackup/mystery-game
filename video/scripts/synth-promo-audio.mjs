/**
 * synth-promo-audio.mjs — builds the 15s promo's soundtrack from nothing.
 *
 * No samples, no downloads, no licences: every sound is synthesized here, the
 * same way the app synthesizes its typewriter clicks (src/lib/typeSound.js in
 * the PWA). Deterministic — a seeded PRNG, so the file is identical every run.
 *
 * Every hit is placed from ../src/ad/timeline.ts, the same constants the picture
 * reads, so the kick lands on the cut and the rip lands on the redaction by
 * construction. Node runs that .ts file directly (type stripping, Node >= 22.18).
 *
 *   node scripts/synth-promo-audio.mjs     -> public/ad/promo-raw.wav
 *   npm run promo:audio                    -> also loudness-normalises to
 *                                             public/ad/promo-audio.wav (-14 LUFS)
 *
 * Palette of sound, in the film's register: a D-minor drone, a sub kick on the
 * beat, a ticking clock, typewriter clicks, paper rips for every redaction, a
 * margin bell for every unseal, and one silence — the twist — broken by a
 * heartbeat and the biggest hit in the piece.
 *
 * TRAP: samples are always written at INTEGER offsets — round the event's start
 * once, then add +i. Flooring (start + t) * SR per sample duplicates and skips
 * samples and produces a shrill, screeching artefact.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FPS,
  BEAT,
  TOTAL,
  SCENE,
  HOOK,
  IDENTITY,
  RIDDLE,
  TRADE,
  BOARD,
  VOTE,
  TWIST,
  END,
} from "../src/ad/timeline.ts";

const SR = 48000;
const N = Math.round((TOTAL / FPS) * SR) + SR; // +1s so tails are not truncated mid-write
const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../public/ad/promo-raw.wav");

// ---------------------------------------------------------------- buffers ---

const L = new Float32Array(N);
const R = new Float32Array(N);
// Reverb send bus (mono in).
const SEND = new Float32Array(N);

const at = (frame) => Math.round((frame / FPS) * SR);

/** Seeded PRNG (mulberry32) — never Math.random(). */
const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = rng(2609);
const white = () => noise() * 2 - 1;

/** Write a generator into the mix. `fn(i, t)` returns one mono sample. */
const put = (frame, seconds, fn, { gain = 1, pan = 0, send = 0 } = {}) => {
  const s0 = at(frame);
  const len = Math.round(seconds * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= N) continue;
    const v = fn(i, i / SR);
    L[idx] += v * gl;
    R[idx] += v * gr;
    SEND[idx] += v * gain * send;
  }
};

/** Chamberlin state-variable filter. Returns {low, band, high} per step. */
const svf = () => {
  let low = 0;
  let band = 0;
  return (x, fc, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
};

const onePole = () => {
  let y = 0;
  return (x, fc) => {
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (x - y);
    return y;
  };
};

// ------------------------------------------------------------ instruments ---

/** Sub kick: sine with an exponential pitch drop plus a 3ms click. */
const kick = (frame, { gain = 0.9, f0 = 140, f1 = 44, decay = 0.32, send = 0.05 } = {}) => {
  let ph = 0;
  put(
    frame,
    decay * 4,
    (i, t) => {
      const f = f1 + (f0 - f1) * Math.exp(-t / 0.035);
      ph += (2 * Math.PI * f) / SR;
      const body = Math.sin(ph) * Math.exp(-t / decay);
      const click = t < 0.003 ? white() * (1 - t / 0.003) * 0.35 : 0;
      return Math.tanh((body + click) * 1.6);
    },
    { gain, send },
  );
};

/** The big one: sub boom + low noise swell + long room. */
const boom = (frame, { gain = 1, len = 2.2 } = {}) => {
  let ph = 0;
  const lp = onePole();
  put(
    frame,
    len,
    (i, t) => {
      const f = 30 + 70 * Math.exp(-t / 0.08);
      ph += (2 * Math.PI * f) / SR;
      const sub = Math.sin(ph) * Math.exp(-t / 0.7);
      const rumble = lp(white(), 180) * 2.4 * Math.exp(-t / 0.35);
      const crack = t < 0.012 ? white() * (1 - t / 0.012) * 0.6 : 0;
      return Math.tanh((sub + rumble + crack) * 1.8);
    },
    { gain, send: 0.35 },
  );
};

/** Clock tick — a resonant blip. `tock` drops the pitch for the off-beat. */
const tick = (frame, { gain = 0.12, tock = false, pan = 0 } = {}) => {
  const f = tock ? 1900 : 2600;
  put(
    frame,
    0.03,
    (i, t) => (Math.sin(2 * Math.PI * f * t) * 0.7 + white() * 0.3) * Math.exp(-t / 0.006),
    { gain, pan, send: 0.08 },
  );
};

/** Typewriter key — the app's click: filtered noise burst + a low thunk. */
const typeKey = (frame, { gain = 0.5, pan = 0 } = {}) => {
  const bp = svf();
  put(
    frame,
    0.06,
    (i, t) => {
      const n = bp(white(), 3200, 0.5).band * 1.6 * Math.exp(-t / 0.008);
      const thunk = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / 0.02) * 0.6;
      return n + thunk;
    },
    { gain, pan, send: 0.12 },
  );
};

/** Margin bell — inharmonic partials, long decay. */
const bell = (frame, { gain = 0.28, f = 1568 } = {}) => {
  const parts = [
    [1, 1, 1.4],
    [2.76, 0.45, 0.6],
    [5.4, 0.22, 0.3],
    [8.93, 0.1, 0.18],
  ];
  put(
    frame,
    1.8,
    (i, t) => {
      let v = 0;
      for (const [m, a, d] of parts) v += Math.sin(2 * Math.PI * f * m * t) * a * Math.exp(-t / d);
      return v * 0.5 * Math.min(1, t / 0.002);
    },
    { gain, send: 0.4 },
  );
};

/** Paper rip — the sound of every redaction bar wiping open. */
const rip = (frame, { gain = 0.5, len = 0.22, from = 700, to = 5200, pan = 0 } = {}) => {
  const bp = svf();
  put(
    frame,
    len,
    (i, t) => {
      const p = t / len;
      const fc = from * Math.pow(to / from, p);
      // Grainy: amplitude-modulated noise reads as fibres tearing.
      const grain = 0.55 + 0.45 * Math.sin(2 * Math.PI * 90 * t + 6 * white());
      const env = Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 0.6;
      return bp(white(), fc, 0.35).band * 2.2 * grain * env;
    },
    { gain, pan, send: 0.18 },
  );
};

/** Whoosh — noise through a swept band-pass, swelling and falling. */
const whoosh = (frame, { gain = 0.4, len = 0.45, from = 300, to = 3000, pan = 0 } = {}) => {
  const bp = svf();
  put(
    frame,
    len,
    (i, t) => {
      const p = t / len;
      const fc = from * Math.pow(to / from, p);
      const env = Math.sin(Math.PI * p) ** 2;
      return bp(white(), fc, 0.5).band * 2.4 * env;
    },
    { gain, pan, send: 0.2 },
  );
};

/** Paper thud — a pin card hitting cork. */
const thud = (frame, { gain = 0.5, pan = 0 } = {}) => {
  const lp = onePole();
  put(
    frame,
    0.18,
    (i, t) => {
      const body = Math.sin(2 * Math.PI * (95 + 60 * Math.exp(-t / 0.02)) * t) * Math.exp(-t / 0.05);
      const paper = lp(white(), 2400) * Math.exp(-t / 0.018) * 0.8;
      return body + paper;
    },
    { gain, pan, send: 0.1 },
  );
};

/** Riser — noise + rising tone, into the twist. */
const riser = (from, to, { gain = 0.35 } = {}) => {
  const len = (to - from) / FPS;
  const bp = svf();
  let ph = 0;
  put(
    from,
    len,
    (i, t) => {
      const p = t / len;
      const fc = 400 * Math.pow(12, p);
      const f = 180 * Math.pow(5, p * p);
      ph += (2 * Math.PI * f) / SR;
      const env = p ** 2.2;
      return (bp(white(), fc, 0.6).band * 1.8 + Math.sin(ph) * 0.25) * env;
    },
    { gain, send: 0.3 },
  );
};

/** Heartbeat — lub-dub. */
const heartbeat = (frame, { gain = 0.8 } = {}) => {
  kick(frame, { gain, f0: 90, f1: 38, decay: 0.12, send: 0.1 });
  kick(frame + 6, { gain: gain * 0.65, f0: 80, f1: 36, decay: 0.1, send: 0.1 });
};

/** Marker scratch — the red circle being drawn round a suspect. */
const scratch = (frame, len = 0.35, { gain = 0.22 } = {}) => {
  const bp = svf();
  put(
    frame,
    len,
    (i, t) => {
      const p = t / len;
      const wobble = 1600 + 700 * Math.sin(2 * Math.PI * 7 * t);
      const env = Math.sin(Math.PI * p) ** 0.8;
      return bp(white(), wobble, 0.3).band * 2 * env;
    },
    { gain, send: 0.1 },
  );
};

/**
 * Drone pad — D minor, detuned saws through a moving low-pass. `level(frame)`
 * is the pad's gain curve over the film, so the arrangement lives in one place.
 */
const pad = (level) => {
  const notes = [73.42, 110.0, 146.83, 174.61, 220.0];
  const detune = [-0.07, 0.06];
  const phases = notes.map(() => detune.map(() => noise()));
  const lpL = onePole();
  const lpR = onePole();
  for (let idx = 0; idx < N; idx++) {
    const t = idx / SR;
    const frame = (idx / SR) * FPS;
    const g = level(frame);
    if (g <= 0.0001) {
      lpL(0, 500);
      lpR(0, 500);
      continue;
    }
    let l = 0;
    let r = 0;
    notes.forEach((f, n) => {
      detune.forEach((d, k) => {
        phases[n][k] += (f * (1 + d / 100)) / SR;
        phases[n][k] -= Math.floor(phases[n][k]);
        const saw = 2 * phases[n][k] - 1;
        if (k === 0) l += saw;
        else r += saw;
      });
    });
    const fc = 420 + 900 * g + 180 * Math.sin(2 * Math.PI * 0.25 * t);
    const vl = lpL(l / notes.length, fc) * g * 0.55;
    const vr = lpR(r / notes.length, fc) * g * 0.55;
    L[idx] += vl;
    R[idx] += vr;
    SEND[idx] += (vl + vr) * 0.15;
  }
};

/** Staccato bass — D1 saw pulses on a grid, low-passed. */
const bassPulse = (from, to, step, { gain = 0.34 } = {}) => {
  for (let f = from; f < to; f += step) {
    const lp = onePole();
    let ph = 0;
    const accent = Math.round((f - from) / step) % 4 === 0 ? 1 : 0.7;
    put(
      f,
      0.16,
      (i, t) => {
        ph += 36.71 / SR;
        ph -= Math.floor(ph);
        const saw = 2 * ph - 1;
        return lp(saw, 260 + 900 * Math.exp(-t / 0.04)) * Math.exp(-t / 0.07) * 1.6;
      },
      { gain: gain * accent },
    );
  }
};

// ------------------------------------------------------------ arrangement ---

// Pad level across the film. Silent under the hook's first word so the type
// hits land on air, swelling through the montage, CUT for the twist, resolving
// under the end card.
pad((fr) => {
  if (fr < 6) return 0;
  if (fr < SCENE.identity[0]) return 0.25 * Math.min(1, (fr - 6) / 30);
  if (fr < SCENE.riddle[0]) return 0.35;
  if (fr < SCENE.vote[0]) return 0.45;
  if (fr < SCENE.twist[0]) return 0.45 + 0.4 * ((fr - SCENE.vote[0]) / (SCENE.twist[0] - SCENE.vote[0]));
  if (fr < TWIST.youOpen) return 0.08; // the silence
  if (fr < SCENE.end[0]) return 0.55;
  return 0.6 * Math.max(0, 1 - (fr - (TOTAL - 20)) / 30);
});

// --- HOOK: a hit per word on the eighths, ticking clock underneath.
HOOK.words.forEach((w, i) => {
  const f = Math.max(0, w + 1);
  kick(f, { gain: 0.75, f0: 170, f1: 48, decay: 0.16 });
  typeKey(f, { gain: 0.45, pan: i % 2 ? 0.25 : -0.25 });
});
for (let f = 4; f < HOOK.killerIn; f += BEAT / 2) tick(Math.round(f), { tock: (f / 7.5) % 2 > 1 });
boom(HOOK.killerIn, { gain: 0.95, len: 1.6 });
rip(HOOK.killerOpen, { gain: 0.55, len: 0.3 });

// --- IDENTITY: half-time kick, clock, the phone arrives, name + secret rip open.
for (let f = SCENE.identity[0]; f < SCENE.identity[1]; f += BEAT * 2) kick(f, { gain: 0.85 });
for (let f = SCENE.identity[0]; f < SCENE.identity[1]; f += BEAT / 2)
  tick(Math.round(f), { gain: 0.08, tock: Math.round((f - SCENE.identity[0]) / 7.5) % 2 === 1 });
whoosh(IDENTITY.phoneIn - 4, { gain: 0.32, len: 0.4, from: 200, to: 1800 });
rip(IDENTITY.nameOpen, { gain: 0.32, len: 0.2, pan: -0.15 });
rip(IDENTITY.secretOpen, { gain: 0.55, len: 0.3, pan: 0.15 });
bell(IDENTITY.secretOpen + 6, { gain: 0.14, f: 1318.5 });

// --- MONTAGE: kick on every beat, 8th-note bass, 16th ticks.
for (let f = SCENE.riddle[0]; f < SCENE.vote[0]; f += BEAT) kick(f, { gain: 0.8 });
bassPulse(SCENE.riddle[0], SCENE.vote[0], BEAT / 2);
for (let f = SCENE.riddle[0]; f < SCENE.vote[0]; f += BEAT / 4)
  tick(Math.round(f), { gain: 0.05, tock: Math.round(f / 3.75) % 2 === 1, pan: 0.3 });

// Riddle: the answer types itself, the lock unseals.
whoosh(SCENE.riddle[0] - 2, { gain: 0.25, len: 0.3 });
RIDDLE.typeAt.forEach((f, i) => typeKey(f, { gain: 0.5, pan: -0.2 + i * 0.08 }));
typeKey(RIDDLE.unlock, { gain: 0.6 });
typeKey(RIDDLE.unlock + 2, { gain: 0.45 });
bell(RIDDLE.unlock + 2, { gain: 0.3 });

// Trade: scramble clatter, a whoosh along the thread, the landing chime.
whoosh(SCENE.trade[0] - 2, { gain: 0.25, len: 0.3 });
for (let f = TRADE.scrambleFrom; f <= TRADE.scrambleTo; f += 2) typeKey(f, { gain: 0.28, pan: -0.35 });
whoosh(TRADE.flyFrom, { gain: 0.45, len: (TRADE.flyTo - TRADE.flyFrom) / FPS, from: 500, to: 4000, pan: 0 });
typeKey(TRADE.land, { gain: 0.55, pan: 0.35 });
bell(TRADE.land + 1, { gain: 0.26, f: 1760 });

// Board: pins thud onto cork, the marker circles a suspect.
whoosh(SCENE.board[0] - 2, { gain: 0.25, len: 0.3 });
BOARD.pins.forEach((f, i) => thud(f + 7, { gain: 0.5, pan: [-0.3, 0.3, -0.15, 0.2][i] }));
scratch(BOARD.circle, 0.36);

// --- VOTE: 16th bass, counters ticking, a riser into the silence.
for (let f = SCENE.vote[0]; f < SCENE.vote[1]; f += BEAT) kick(f, { gain: 0.85 });
bassPulse(SCENE.vote[0], SCENE.vote[1] - BEAT, BEAT / 4, { gain: 0.3 });
for (let f = VOTE.barsFrom; f < VOTE.overtake + 10; f += 2) tick(f, { gain: 0.06, tock: f % 4 === 0, pan: 0.4 });
whoosh(VOTE.overtake - 3, { gain: 0.35, len: 0.3, from: 800, to: 5000 });
riser(VOTE.overtake, SCENE.twist[0] - 1, { gain: 0.4 });

// --- TWIST: everything stops. A heartbeat per line. Then the biggest hit.
heartbeat(TWIST.line1, { gain: 0.85 });
typeKey(TWIST.line2, { gain: 0.4 });
heartbeat(TWIST.youIn - 2, { gain: 0.95 });
boom(TWIST.youOpen, { gain: 1, len: 2.4 });
rip(TWIST.youOpen, { gain: 0.6, len: 0.26 });

// --- END: the brand lands on a boom, the bell rings the CTA, the room rings out.
whoosh(SCENE.end[0] - 5, { gain: 0.35, len: 0.35, from: 300, to: 2400 });
boom(END.wordmark, { gain: 0.8, len: 2.6 });
for (let f = END.wordmark + BEAT; f < TOTAL - 20; f += BEAT * 2) kick(f, { gain: 0.4, decay: 0.4 });
bell(END.cta, { gain: 0.3, f: 1174.66 });
bell(END.cta + 10, { gain: 0.16, f: 1760 });

// ----------------------------------------------------------------- reverb ---
// Freeverb-style: parallel combs into series allpasses, a hair of stereo spread.

const reverb = () => {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((n) => ({
    buf: new Float32Array(Math.round((n * SR) / 44100)),
    i: 0,
    store: 0,
  }));
  const allp = [556, 441, 341].map((n) => ({ buf: new Float32Array(Math.round((n * SR) / 44100)), i: 0 }));
  const spread = Math.round((23 * SR) / 44100);
  const tail = new Float32Array(N + spread);
  for (let idx = 0; idx < N; idx++) {
    const x = SEND[idx] * 0.3;
    let y = 0;
    for (const c of combs) {
      const out = c.buf[c.i];
      c.store = out * 0.75 + c.store * 0.25; // damping
      c.buf[c.i] = x + c.store * 0.84; // room size
      c.i = (c.i + 1) % c.buf.length;
      y += out;
    }
    for (const a of allp) {
      const b = a.buf[a.i];
      const out = -y + b;
      a.buf[a.i] = y + b * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      y = out;
    }
    tail[idx] = y;
  }
  for (let idx = 0; idx < N; idx++) {
    L[idx] += tail[idx] * 0.9;
    R[idx] += tail[Math.max(0, idx - spread)] * 0.9;
  }
};
reverb();

// ----------------------------------------------------------- master + wav ---

// Trim to the film exactly, with a 40ms fade so the last frame is not a click.
const OUT_N = Math.round((TOTAL / FPS) * SR);
const fadeN = Math.round(0.04 * SR);
let peak = 0;
for (let i = 0; i < OUT_N; i++) {
  L[i] = Math.tanh(L[i] * 0.5);
  R[i] = Math.tanh(R[i] * 0.5);
  if (i > OUT_N - fadeN) {
    const g = (OUT_N - i) / fadeN;
    L[i] *= g;
    R[i] *= g;
  }
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak; // ~-1 dBFS; loudnorm does the real levelling

const data = Buffer.alloc(OUT_N * 4);
for (let i = 0; i < OUT_N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(2, 22); // stereo
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, data]));
console.log(`wrote ${OUT} — ${(OUT_N / SR).toFixed(2)}s, peak ${peak.toFixed(3)} pre-norm`);
