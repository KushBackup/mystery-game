/**
 * Seeded randomness for the game engine.
 *
 * Every random choice the engine makes (who gets which clue, how a tied vote
 * breaks, whether a watcher spots the hand) is drawn from
 * `makeRng(seed, cycle, purpose)`, never from Math.random. The seed is written
 * once, when roles are dealt.
 *
 * That makes resolution a pure function of what is stored. If the host laptop
 * dies halfway through resolving a night, a second host device reads the same
 * frozen inputs, computes the same outcome, and a repeated tap changes
 * nothing. Callers must sort their inputs by pid before drawing, or two
 * devices iterating an object in a different order would disagree.
 */

// cyrb53: a small, well-distributed 53-bit string hash.
export function hashString(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// mulberry32: a fast 32-bit generator, returning floats in [0, 1).
function mulberry32(a) {
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An independent stream per (seed, ...keys). The same keys always give the same stream. */
export function makeRng(seed, ...keys) {
  return mulberry32(hashString([seed, ...keys].join('|')) >>> 0);
}

/** A new random seed, for dealing a fresh game. The only non-deterministic call. */
export function freshSeed() {
  const buf = new Uint32Array(2);
  globalThis.crypto.getRandomValues(buf);
  return `${buf[0].toString(36)}${buf[1].toString(36)}`;
}

export function shuffle(arr, rng) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pick(arr, rng) {
  return arr.length ? arr[Math.floor(rng() * arr.length)] : undefined;
}

export function chance(rng, p) {
  return rng() < p;
}
