/**
 * The typewriter's voice — synthesized, never sampled.
 *
 * Why the Web Audio API instead of an mp3: this repo has no binary assets at all
 * (every icon is inline SVG, the paper grain is an inlined data URI), and the app
 * is an offline-first PWA. A sample would be the first file the service worker
 * has to precache and the first thing that can fail to arrive at a live event.
 * A noise burst through a bandpass is ~40 lines, weighs nothing, and can be
 * detuned per keystroke so a hundred characters don't sound like a hundred copies
 * of one click.
 *
 * Four sounds, all deliberately quiet — this plays in a room full of people:
 *   playKeyClick()     a key striking paper — every visible character
 *   playReturnClick()  the carriage moving  — the break between lines
 *   playTypeBell()     the margin bell      — a slide finishing
 *   playSolveFanfare() three bells rising   — a riddle cracked
 *
 * The player's choice lives in localStorage under `astral.sfx`, separately from
 * the session key, so muting the app is not something a logout can undo.
 */

const PREF_KEY = 'astral.sfx';

// Peak gain, not a volume slider: these are the values the sounds were tuned at.
// A key click is barely above the room; the bell is the loudest thing here and is
// still under a tenth of full scale.
const KEY_GAIN = 0.055;
const RETURN_GAIN = 0.07;
const BELL_GAIN = 0.03;

// Floor between two clicks. The typewriter runs at ~26ms/char, so almost every
// character gets its own strike; this only bites when a dropped frame makes the
// reveal catch up, where two clicks in the same millisecond would read as a
// glitch rather than as typing.
const MIN_GAP_MS = 22;

let ctx = null;
let noise = null;
let lastClickAt = 0;
let lastPrimeAt = 0;

const readPref = () => {
  try {
    // Default on — the sound is part of the intro, not an opt-in extra.
    return window.localStorage.getItem(PREF_KEY) !== 'off';
  } catch {
    // Private-mode Safari throws on storage access; fall back to the default.
    return true;
  }
};

let enabled = readPref();

export const isTypeSoundOn = () => enabled;

/**
 * Build the context on demand, never at import time: constructing an
 * AudioContext before a user gesture leaves it suspended and, in some browsers,
 * logs a warning on every load.
 */
const ensureContext = () => {
  if (ctx) return ctx;

  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;

  ctx = new Ctor();

  // One shared 80ms buffer of white noise, generated once. Each strike plays a
  // random slice of it, which is what stops repeated clicks from being bit-identical.
  const frames = Math.round(ctx.sampleRate * 0.08);
  noise = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return ctx;
};

/**
 * Called on mount and again on the first touch of the briefing. Autoplay policy
 * only lets a context start running off the back of a user gesture — the login
 * tap usually counts, but a host force-refresh reloads the page with no gesture
 * at all, and then the first tap on the slideshow is what unlocks it.
 */
export const primeTypeSound = () => {
  const audio = ensureContext();
  if (!audio) return;
  if (audio.state !== 'suspended') return;

  // Throttled: a still-suspended context is asked to resume on every keystroke
  // that finds it closed, and forty rejected promises a second is noise in the
  // console for no benefit.
  const now = performance.now();
  if (now - lastPrimeAt < 400) return;
  lastPrimeAt = now;

  // Rejects when there has been no gesture on the page yet. That is the expected
  // path, not an error — the next tap tries again.
  audio.resume().catch(() => {});
};

export const setTypeSoundOn = (on) => {
  enabled = on;
  try {
    window.localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
  } catch {
    // Storage unavailable — the choice holds for this session and no longer.
  }
  if (on) primeTypeSound();
};

/**
 * A filtered noise burst with a near-instant attack and an exponential tail.
 * `strike` is the whole instrument; the three exported sounds are presets.
 */
const strike = ({ freq, q, gain, decay }) => {
  if (!enabled) return;

  const audio = ensureContext();
  if (!audio) return;
  if (audio.state !== 'running') {
    primeTypeSound();
    return;
  }

  const now = audio.currentTime;

  const source = audio.createBufferSource();
  source.buffer = noise;

  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = freq;
  band.Q.value = q;

  const amp = audio.createGain();
  // exponentialRamp cannot start from or reach exactly zero.
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + decay);

  source.connect(band).connect(amp).connect(audio.destination);
  // Third argument is the duration, so the node ends itself and is collected —
  // no stop() bookkeeping for a sound that fires forty times a second.
  source.start(now, Math.random() * 0.04, decay + 0.01);
};

export const playKeyClick = () => {
  const now = performance.now();
  if (now - lastClickAt < MIN_GAP_MS) return;
  lastClickAt = now;

  strike({
    // ±450Hz of drift per keystroke. Without it the line reads as a machine gun
    // rather than as somebody typing.
    freq: 2150 + (Math.random() * 2 - 1) * 450,
    q: 0.9,
    gain: KEY_GAIN,
    decay: 0.028,
  });
};

export const playReturnClick = () => {
  lastClickAt = performance.now();
  strike({ freq: 780, q: 0.7, gain: RETURN_GAIN, decay: 0.075 });
};

/**
 * The margin bell. Two sine partials rather than one, because a single sine
 * reads as a notification tone and two read as struck metal.
 */
export const playTypeBell = () => {
  if (!enabled) return;

  const audio = ensureContext();
  if (!audio || audio.state !== 'running') return;

  const now = audio.currentTime;

  [
    [1980, BELL_GAIN],
    [2960, BELL_GAIN * 0.4],
  ].forEach(([freq, peak]) => {
    const osc = audio.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const amp = audio.createGain();
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(peak, now + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(amp).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  });
};

/**
 * A riddle cracked (components/modals/RiddleModal.jsx).
 *
 * The margin bell, struck three times up a major triad, 90ms apart, with the
 * last one held longest. It is the same instrument as `playTypeBell` on purpose
 * — a synth arpeggio from a different voice would sound like a mobile game
 * dropped into a 1970s case room. This is the machine being *pleased*, which
 * is the loudest thing this app is allowed to be.
 *
 * Louder than the margin bell (1.6×) and still under a twentieth of full scale.
 * It fires once, on a deliberate act, and it is the payoff for the whole screen;
 * a reward the room cannot hear is not a reward.
 */
export const playSolveFanfare = () => {
  if (!enabled) return;

  const audio = ensureContext();
  if (!audio || audio.state !== 'running') return;

  const start = audio.currentTime;

  // A major triad up: the interval says "resolved", which is exactly what the
  // player just did. Held longer at each step so the top note is the one left
  // ringing in the room.
  [
    [1568, 0, 0.5],
    [1976, 0.09, 0.6],
    [2349, 0.18, 1.0],
  ].forEach(([root, offset, tail]) => {
    const at = start + offset;

    // Two partials per strike, same as the margin bell — one sine reads as a
    // notification tone, two read as struck metal.
    [
      [root, BELL_GAIN * 1.6],
      [root * 1.5, BELL_GAIN * 0.55],
    ].forEach(([freq, peak]) => {
      const osc = audio.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const amp = audio.createGain();
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(peak, at + 0.005);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + tail);

      osc.connect(amp).connect(audio.destination);
      osc.start(at);
      osc.stop(at + tail + 0.05);
    });
  });
};
