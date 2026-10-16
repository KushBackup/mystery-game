import { drawLounge, drawTable, TABLE_W, TABLE_H } from './loungeArt';
import { loungeLayout, figureWidth } from './loungeLayout';
import { dprOf, later, warmPortrait } from './portraitCache';

/**
 * The Night lounge's paintings, kept: the room (one, the latest size) and the
 * few table drawings, painted once per size and pixel ratio. `warmLounge`
 * paints everyone's standing figure and the room ahead of time, a few per
 * frame, so Night opens already drawn; the phone shell calls it during the day.
 */

// The painted room and the tables are painted once per size and kept.
let roomCache = { key: null, canvas: null };
const tableCache = new Map();
export const TABLE_KINDS = 4;

export function roomBitmap(L, dpr) {
  const key = `${L.key}@${dpr}`;
  if (roomCache.key === key) return roomCache.canvas;
  const c = document.createElement('canvas');
  c.width = Math.round(L.w * dpr);
  c.height = Math.round(L.height * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  drawLounge(g, L);
  roomCache = { key, canvas: c };
  return c;
}

export function tableBitmap(kind, dpr) {
  const key = `${kind}@${dpr}`;
  let c = tableCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = Math.round(TABLE_W * dpr);
  c.height = Math.round(TABLE_H * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  drawTable(g, kind);
  tableCache.set(key, c);
  return c;
}

/** The phone's room width, before the room has been laid out (for warming figures). */
const guessWidth = () => (typeof window === 'undefined' ? 390 : Math.min(window.innerWidth || 390, 430));

/**
 * Paint everyone's standing figure ahead of time, a few per frame, so the
 * room opens drawn. The shell calls it during the day.
 */
export function warmLounge(players, traits) {
  if (typeof document === 'undefined' || !players?.length) return;
  const w = guessWidth();
  const fw = figureWidth(w);
  for (const p of players) {
    if (p.status === 'vanished') continue;
    later(() => warmPortrait({ traits: traits?.[p.id], seed: p.id, size: fw, figure: true }));
  }
  later(() => roomBitmap(loungeLayout(players.map((p) => p.id), w), dprOf()));
}
