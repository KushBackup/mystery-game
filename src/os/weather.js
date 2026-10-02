/**
 * The forecast's words, shared by the Weather app and the alarm screen. The
 * forecast itself is the story pack's `weather` (data/packs/deepblue.js).
 */

import { editionDay } from './news';

export const SKY_WORD = { clear: 'Clear', cloud: 'Cloudy', rain: 'Showers', heavy: 'Heavy rain', storm: 'Thunderstorms' };

/** One forecast entry for a day (the pack's last entry repeats). */
export const dayOf = (w, d) => w.days[Math.min(Math.max(d, 0), w.days.length - 1)];

/** "Panjim · 24° · Heavy rain": the one line the alarm shows under the clock, or null. */
export function weatherLine(pack, game) {
  const w = pack?.weather;
  if (!w) return null;
  const d = dayOf(w, editionDay(game));
  return `${w.place} · ${d.lo + 1}° · ${SKY_WORD[d.sky]}`;
}
