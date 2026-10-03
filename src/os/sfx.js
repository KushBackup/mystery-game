/**
 * Every sound and buzz the DEEP BLUE phone makes.
 *
 * Synthesized with Web Audio on the spot, like lib/typeSound.js: there are no
 * audio files in this repo, so nothing to cache, fetch or license. Square and
 * triangle waves, short envelopes: an 8-bit phone, not a real one.
 *
 * Two preferences, both in localStorage and both default on:
 *   astral.sfx   sound (shared with typeSound.js, so one toggle rules both)
 *   astral.vibe  vibration
 *
 * Browsers keep an AudioContext suspended until a user gesture, so the shell
 * calls primeSfx() on the first tap anywhere. The synced alarm can therefore
 * only ring out loud on a phone that has been touched once since loading;
 * it always vibrates and flashes regardless.
 */

const SOUND_KEY = 'astral.sfx';
const VIBE_KEY = 'astral.vibe';

const readPref = (key) => {
  try {
    return window.localStorage.getItem(key) !== 'off';
  } catch {
    return true;
  }
};
const writePref = (key, on) => {
  try {
    window.localStorage.setItem(key, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice lasts this session only */
  }
};

let soundOn = typeof window !== 'undefined' ? readPref(SOUND_KEY) : true;
let vibeOn = typeof window !== 'undefined' ? readPref(VIBE_KEY) : true;
let ctx = null;

export const isSoundOn = () => soundOn;
export const isVibeOn = () => vibeOn;
export const setSoundOn = (on) => {
  soundOn = on;
  writePref(SOUND_KEY, on);
};
export const setVibeOn = (on) => {
  vibeOn = on;
  writePref(VIBE_KEY, on);
};

function audio() {
  if (ctx) return ctx;
  const Ctor = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Call from a user gesture. Safe to call repeatedly. */
export function primeSfx() {
  const a = audio();
  if (a && a.state === 'suspended') a.resume().catch(() => {});
}

/** One note: a waveform, a pitch glide, and a short attack/decay envelope. */
function tone({ type = 'square', from, to = from, at = 0, dur = 0.1, vol = 0.08 }) {
  const a = audio();
  if (!a || !soundOn || a.state !== 'running') return;
  const t0 = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A burst of noise, for crashes and glitches. */
function noise({ at = 0, dur = 0.2, vol = 0.06, lowpass = 2400 }) {
  const a = audio();
  if (!a || !soundOn || a.state !== 'running') return;
  const t0 = a.currentTime + at;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const gain = a.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t0);
}

export function vibrate(pattern) {
  if (!vibeOn) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported (iOS Safari): the flash has to carry it */
  }
}

// --- The game --------------------------------------------------------------------

export const sfxFlap = () => tone({ type: 'square', from: 420, to: 720, dur: 0.07, vol: 0.05 });
export const sfxPoint = () => {
  tone({ type: 'square', from: 988, dur: 0.06, vol: 0.05 });
  tone({ type: 'square', from: 1319, at: 0.06, dur: 0.09, vol: 0.05 });
};
export const sfxCrash = () => {
  noise({ dur: 0.28, vol: 0.09, lowpass: 1400 });
  tone({ type: 'triangle', from: 300, to: 60, dur: 0.35, vol: 0.12 });
  vibrate(60);
};
export const sfxCountdown = (last = false) => tone({ type: 'square', from: last ? 1047 : 523, dur: last ? 0.3 : 0.12, vol: 0.06 });
export const sfxTimeUp = () => {
  [784, 659, 523].forEach((f, i) => tone({ type: 'square', from: f, at: i * 0.12, dur: 0.14, vol: 0.06 }));
  vibrate([80, 60, 80]);
};

// --- The phone ---------------------------------------------------------------------

export const sfxTap = () => tone({ type: 'square', from: 1800, dur: 0.02, vol: 0.02 });
export const sfxUnlock = () => {
  tone({ type: 'square', from: 660, dur: 0.05, vol: 0.05 });
  tone({ type: 'square', from: 990, at: 0.05, dur: 0.08, vol: 0.05 });
};
export const sfxLock = () => tone({ type: 'square', from: 520, to: 260, dur: 0.08, vol: 0.05 });
export const sfxPing = () => {
  tone({ type: 'triangle', from: 1568, dur: 0.12, vol: 0.09 });
  tone({ type: 'triangle', from: 2093, at: 0.09, dur: 0.18, vol: 0.07 });
  vibrate(35);
};
export const sfxSent = () => tone({ type: 'triangle', from: 880, to: 1320, dur: 0.1, vol: 0.05 });

// --- The Word board (paper) ----------------------------------------------------------

/** A card turned over: a short paper swish. */
export const sfxFlip = () => noise({ dur: 0.09, vol: 0.05, lowpass: 3800 });
/** A note slapped onto the wall: a soft paper thump and a little rise. */
export const sfxStick = () => {
  noise({ dur: 0.06, vol: 0.08, lowpass: 900 });
  tone({ type: 'triangle', from: 660, to: 990, at: 0.03, dur: 0.09, vol: 0.05 });
  vibrate(12);
};
/** A gold star stamped onto a clue. */
export const sfxStar = () => {
  tone({ type: 'triangle', from: 1319, dur: 0.06, vol: 0.06 });
  tone({ type: 'triangle', from: 1760, at: 0.05, dur: 0.1, vol: 0.05 });
  vibrate(8);
};
/** A star taken back off a clue. */
export const sfxUnstar = () => tone({ type: 'triangle', from: 1100, to: 700, dur: 0.07, vol: 0.04 });

/** A reveal lands: the board, a banishment, a role. */
export const sfxSting = () => {
  tone({ type: 'square', from: 392, dur: 0.14, vol: 0.07 });
  tone({ type: 'square', from: 523, at: 0.12, dur: 0.14, vol: 0.07 });
  tone({ type: 'square', from: 784, at: 0.24, dur: 0.4, vol: 0.07 });
  vibrate([40, 40, 120]);
};

/** The top of the board. */
export const sfxFanfare = () => {
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ type: 'square', from: f, at: i * 0.09, dur: 0.12, vol: 0.06 }));
};

/** TAKEN: the bottom row corrupts. */
export const sfxGlitch = () => {
  noise({ dur: 0.5, vol: 0.1, lowpass: 5000 });
  for (let i = 0; i < 6; i++) tone({ type: 'square', from: 80 + Math.random() * 900, at: i * 0.06, dur: 0.05, vol: 0.06 });
  tone({ type: 'sawtooth', from: 180, to: 40, at: 0.3, dur: 0.8, vol: 0.1 });
  vibrate([200, 80, 400]);
};

// --- The alarm -----------------------------------------------------------------------

let alarmTimer = null;

/** The morning alarm: a two-tone 8-bit ring, repeating until stopped. */
export function startAlarm() {
  stopAlarm();
  const ring = () => {
    for (let i = 0; i < 4; i++) {
      tone({ type: 'square', from: 1319, at: i * 0.16, dur: 0.07, vol: 0.09 });
      tone({ type: 'square', from: 1047, at: i * 0.16 + 0.08, dur: 0.07, vol: 0.09 });
    }
    vibrate([400, 200, 400]);
  };
  ring();
  alarmTimer = setInterval(ring, 1400);
}

export function stopAlarm() {
  if (alarmTimer) clearInterval(alarmTimer);
  alarmTimer = null;
  try {
    navigator.vibrate?.(0);
  } catch {
    /* ignore */
  }
}

// --- Moments added in the polish pass ----------------------------------------------

/** One clock tick, for the pause on "…and last place". */
export const sfxTick = () => tone({ type: 'square', from: 1800, dur: 0.018, vol: 0.05 });

/** Night falls: a slow falling pair, low and quiet. */
export const sfxNightfall = () => {
  tone({ type: 'triangle', from: 392, to: 262, dur: 0.6, vol: 0.08 });
  tone({ type: 'triangle', from: 196, to: 131, at: 0.35, dur: 0.9, vol: 0.07 });
};

/** A new part of the day: a bright rising pair. */
export const sfxDaybreak = () => {
  tone({ type: 'square', from: 523, dur: 0.09, vol: 0.05 });
  tone({ type: 'square', from: 784, at: 0.09, dur: 0.16, vol: 0.05 });
};

/** Refusal: the phone says no (Disagree, Snooze). */
export const sfxDeny = () => {
  tone({ type: 'square', from: 196, dur: 0.08, vol: 0.07 });
  tone({ type: 'square', from: 165, at: 0.1, dur: 0.14, vol: 0.07 });
  vibrate([30, 40, 30]);
};

/** The signal dies: a long burst of static that falls away. */
export const sfxStatic = () => {
  noise({ dur: 1.4, vol: 0.08, lowpass: 6000 });
  tone({ type: 'sawtooth', from: 120, to: 30, at: 0.2, dur: 1.2, vol: 0.06 });
  vibrate([500, 120, 200]);
};

/** Boot chime, once per phone. */
export const sfxBoot = () => {
  [262, 330, 392, 523].forEach((f, i) => tone({ type: 'triangle', from: f, at: i * 0.11, dur: 0.5, vol: 0.06 }));
};
