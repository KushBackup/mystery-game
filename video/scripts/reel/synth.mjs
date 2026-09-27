/**
 * synth.mjs — synthesize a reel's sound effects from nothing.
 *
 *   node --no-warnings scripts/reel/synth.mjs <instance>   -> public/<assets>/sfx-raw.wav
 *
 * No samples, no downloads, no licences, a seeded PRNG: the file is identical
 * every run. The instruments live here; WHICH sound lands WHERE lives in the
 * instance's sfx.ts (`arrange(x)`), cued from its timeline.
 *
 * TRAP: samples are written at INTEGER offsets — round the event's start once,
 * then add +i. Flooring (start + t) * SR per sample duplicates and skips
 * samples and produces a shrill, screeching artefact.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, importTs, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const { TOTAL, FPS } = await inst.timeline();
const { arrange } = await importTs(inst.file("sfx.ts"));

const SR = 48000;
const N = Math.round((TOTAL / FPS) * SR) + SR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND = new Float32Array(N);
const at = (frame) => Math.round((frame / FPS) * SR);

const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = rng(2609);
const white = () => noise() * 2 - 1;

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
    y += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (x - y);
    return y;
  };
};

// ------------------------------------------------------------ instruments ---

/** Sub kick: sine with an exponential pitch drop plus a 3ms click. The hit under a punch word. */
const kick = (frame, { gain = 0.9, f0 = 140, f1 = 44, decay = 0.32 } = {}) => {
  let ph = 0;
  put(frame, decay * 4, (i, t) => {
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.035);
    ph += (2 * Math.PI * f) / SR;
    const click = t < 0.003 ? white() * (1 - t / 0.003) * 0.35 : 0;
    return Math.tanh((Math.sin(ph) * Math.exp(-t / decay) + click) * 1.6);
  }, { gain, send: 0.05 });
};

/** The big one: sub boom + low noise swell + long room. The brand, the twist, the reveal. */
const boom = (frame, { gain = 1, len = 2.2 } = {}) => {
  let ph = 0;
  const lp = onePole();
  put(frame, len, (i, t) => {
    const f = 30 + 70 * Math.exp(-t / 0.08);
    ph += (2 * Math.PI * f) / SR;
    const sub = Math.sin(ph) * Math.exp(-t / 0.7);
    const rumble = lp(white(), 180) * 2.4 * Math.exp(-t / 0.35);
    const crack = t < 0.012 ? white() * (1 - t / 0.012) * 0.6 : 0;
    return Math.tanh((sub + rumble + crack) * 1.8);
  }, { gain, send: 0.35 });
};

/** Clock tick — for counters and tallies. `tock` drops the pitch. */
const tick = (frame, { gain = 0.12, tock = false, pan = 0 } = {}) => {
  const f = tock ? 1900 : 2600;
  put(frame, 0.03, (i, t) => (Math.sin(2 * Math.PI * f * t) * 0.7 + white() * 0.3) * Math.exp(-t / 0.006), { gain, pan, send: 0.08 });
};

/** Typewriter key — a caption landing, typed text, a glitch. */
const typeKey = (frame, { gain = 0.5, pan = 0 } = {}) => {
  const bp = svf();
  put(frame, 0.06, (i, t) => bp(white(), 3200, 0.5).band * 1.6 * Math.exp(-t / 0.008) + Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / 0.02) * 0.6, {
    gain,
    pan,
    send: 0.12,
  });
};

/** Bell — inharmonic partials, long decay. A notification, the CTA. */
const bell = (frame, { gain = 0.28, f = 1568 } = {}) => {
  const parts = [
    [1, 1, 1.4],
    [2.76, 0.45, 0.6],
    [5.4, 0.22, 0.3],
    [8.93, 0.1, 0.18],
  ];
  put(frame, 1.8, (i, t) => {
    let v = 0;
    for (const [m, a, d] of parts) v += Math.sin(2 * Math.PI * f * m * t) * a * Math.exp(-t / d);
    return v * 0.5 * Math.min(1, t / 0.002);
  }, { gain, send: 0.4 });
};

/** Paper rip — a strike-through, a redaction opening. */
const rip = (frame, { gain = 0.5, len = 0.22, from = 700, to = 5200, pan = 0 } = {}) => {
  const bp = svf();
  put(frame, len, (i, t) => {
    const p = t / len;
    const grain = 0.55 + 0.45 * Math.sin(2 * Math.PI * 90 * t + 6 * white());
    const env = Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 0.6;
    return bp(white(), from * Math.pow(to / from, p), 0.35).band * 2.2 * grain * env;
  }, { gain, pan, send: 0.18 });
};

/** Whoosh — noise through a swept band-pass. Into every cut. */
const whoosh = (frame, { gain = 0.4, len = 0.45, from = 300, to = 3000, pan = 0 } = {}) => {
  const bp = svf();
  put(frame, len, (i, t) => {
    const p = t / len;
    return bp(white(), from * Math.pow(to / from, p), 0.5).band * 2.4 * Math.sin(Math.PI * p) ** 2;
  }, { gain, pan, send: 0.2 });
};

/** Thud — something landing (a phone, a card, a logo). */
const thud = (frame, { gain = 0.5, pan = 0 } = {}) => {
  const lp = onePole();
  put(frame, 0.18, (i, t) => Math.sin(2 * Math.PI * (95 + 60 * Math.exp(-t / 0.02)) * t) * Math.exp(-t / 0.05) + lp(white(), 2400) * Math.exp(-t / 0.018) * 0.8, {
    gain,
    pan,
    send: 0.1,
  });
};

/** Riser — noise + a rising tone, from one frame to another. Into a twist. */
const riser = (from, to, { gain = 0.35 } = {}) => {
  const len = (to - from) / FPS;
  const bp = svf();
  let ph = 0;
  put(from, len, (i, t) => {
    const p = t / len;
    ph += (2 * Math.PI * 180 * Math.pow(5, p * p)) / SR;
    return (bp(white(), 400 * Math.pow(12, p), 0.6).band * 1.8 + Math.sin(ph) * 0.25) * p ** 2.2;
  }, { gain, send: 0.3 });
};

/** Heartbeat — lub-dub. Tension before a twist. */
const heartbeat = (frame, { gain = 0.8 } = {}) => {
  kick(frame, { gain, f0: 90, f1: 38, decay: 0.12 });
  kick(frame + 6, { gain: gain * 0.65, f0: 80, f1: 36, decay: 0.1 });
};

/** Marker scratch — a circle being drawn. */
const scratch = (frame, len = 0.35, { gain = 0.22 } = {}) => {
  const bp = svf();
  put(frame, len, (i, t) => {
    const p = t / len;
    return bp(white(), 1600 + 700 * Math.sin(2 * Math.PI * 7 * t), 0.3).band * 2 * Math.sin(Math.PI * p) ** 0.8;
  }, { gain, send: 0.1 });
};

arrange({ kick, boom, tick, typeKey, bell, rip, whoosh, thud, riser, heartbeat, scratch });

// ----------------------------------------------------------------- reverb ---
{
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((n) => ({ buf: new Float32Array(Math.round((n * SR) / 44100)), i: 0, store: 0 }));
  const allp = [556, 441, 341].map((n) => ({ buf: new Float32Array(Math.round((n * SR) / 44100)), i: 0 }));
  const spread = Math.round((23 * SR) / 44100);
  const tail = new Float32Array(N + spread);
  for (let idx = 0; idx < N; idx++) {
    const x = SEND[idx] * 0.3;
    let y = 0;
    for (const c of combs) {
      const out = c.buf[c.i];
      c.store = out * 0.75 + c.store * 0.25;
      c.buf[c.i] = x + c.store * 0.84;
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
}

// ----------------------------------------------------------- master + wav ---
const OUT_N = Math.round((TOTAL / FPS) * SR);
const fadeN = Math.round(0.6 * SR);
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
const norm = 0.89 / (peak || 1);
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
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);
const out = join(ensureDir(inst.pub), "sfx-raw.wav");
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} — ${(OUT_N / SR).toFixed(2)}s, peak ${peak.toFixed(3)} pre-norm`);
