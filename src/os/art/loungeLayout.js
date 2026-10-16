import { seedOf } from './portraitArt';
import { heightOf } from './portraitCache';

/**
 * Where everything stands in the Night app's lounge (NightRoom.jsx draws it,
 * loungeArt.js paints it). Pure numbers in CSS pixels, no React.
 *
 * The room is seen from high up and in front, the way a board game shows a
 * room: the back wall along the top with the bar and the computer desk, then
 * the floor running down the screen, with high round tables that guests stand
 * around in fours, two tables to a row, and the DJ at the far end.
 *
 * Everyone who was dealt in has a spot, the killed too, and the spots come
 * from the guests' ids, never from who is still alive: the same guest stands
 * at the same table on every phone, every night of the game.
 */

export const WALL_H = 74; // the back wall, top of the room
const TOP = 150; // the wall plus the bar and desk in front of it
const ROW = 166; // one row of tables: room for the back pair's names over their heads
const FIRST = 128; // the first row's floor point under the wall band
const END = 96; // from the last row to the DJ
const PER_TABLE = 4;

/** A figure's width for a room this wide; its height follows the drawing. */
export const figureWidth = (w) => (w >= 370 ? 33 : 30);
export const figureHeight = (w) => heightOf(figureWidth(w), false, true);

/**
 * Around one table: two behind it, two in front, a little wider in front so
 * the back pair's heads show between. [dx, dy] from the table's floor point.
 */
const AROUND = [[-30, -15], [30, -15], [-42, 14], [42, 14]];

/** Everyone's place, stable: sorted by a hash of their id. */
export function loungeOrder(pids) {
  return [...pids].sort((a, b) => seedOf(a) - seedOf(b) || String(a).localeCompare(String(b)));
}

/**
 * The room for these guests at this width. Returns the room's height, the
 * tables' floor points, each guest's spot (where their feet are, and whether
 * they stand behind their table), the computer's box and the DJ's.
 */
export function loungeLayout(pids, w) {
  const order = loungeOrder(pids);
  const n = Math.max(1, Math.ceil(order.length / PER_TABLE));
  // Spread the guests evenly, so no table stands nearly empty.
  const sizes = Array.from({ length: n }, (_, k) => Math.floor(order.length / n) + (k < order.length % n ? 1 : 0));
  const tables = [];
  for (let k = 0; k < n; k++) {
    const row = Math.floor(k / 2);
    const alone = k === n - 1 && n % 2 === 1;
    const side = alone ? 0.5 : k % 2 ? 0.73 : 0.27;
    // every other row sits a little off the one above, like a real floor
    const nudge = alone ? 0 : (row % 2 ? 6 : -6) * (k % 2 ? -1 : 1);
    tables.push({ id: k, x: Math.round(w * side + nudge), y: TOP + FIRST - 34 + row * ROW + (k % 2 ? 8 : 0) });
  }
  const spots = {};
  let at = 0;
  tables.forEach((t, k) => {
    // The first guests take the back, so a table of three keeps a face to the room.
    const slots = sizes[k] === 3 ? [0, 1, 2 + (k % 2)] : AROUND.map((_, i) => i).slice(0, sizes[k]);
    for (const i of slots) {
      const pid = order[at++];
      const [dx, dy] = AROUND[i];
      spots[pid] = { x: t.x + dx, y: t.y + dy, back: dy < 0, table: k };
    }
  });
  const rows = Math.ceil(n / 2);
  const lastY = TOP + FIRST - 34 + (rows - 1) * ROW + 8;
  const dj = { x: Math.round(w / 2), y: lastY + END, w: Math.min(170, w * 0.5), h: 58 };
  const height = Math.round(dj.y + dj.h / 2 + 46);
  const computer = { x: w - 114, y: 30, w: 104, h: 112 };
  return { w, height, tables, spots, computer, dj, key: `${w}:${order.join(',')}` };
}
