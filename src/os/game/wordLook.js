import { hashString } from '../../lib/engine/rng.js';

/**
 * How a sticky note on the Word board looks (wordParts.jsx WallNote): one of
 * four shades and a tilt of up to 2°, seeded by `key`, the poster's pid.
 * Never by role: a note must say nothing about who wrote it beyond their name.
 */
export const NOTE_SHADES = ['butter', 'mint', 'sky', 'lilac'];

export function noteLook(key) {
  const h = hashString(String(key ?? ''), 7);
  return { shade: NOTE_SHADES[h % NOTE_SHADES.length], tilt: ((h >>> 3) % 9) / 2 - 2 };
}
