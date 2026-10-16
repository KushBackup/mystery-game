import { pen, line, wash, hatch, solid, thing, ellPts, rectPts, pathOf, rng, shade, tint, EVEN, PAPER } from './portraitArt';
import { WALL_H } from './loungeLayout';

/**
 * The Night app's lounge, painted by hand on a canvas in the contact photos'
 * own ink and watercolour (portraitArt.js lends its pen, washes and hatching),
 * so the guests standing in it look as if they were drawn into it.
 *
 *   the back wall   terracotta, two arched windows on the night, the moon
 *   the bar         a shelf of bottles, the counter, three stools
 *   the computer    an old beige monitor on a desk in the corner, its screen
 *                   the one cold light in the room: DEEP BLUE's logs
 *   the floor       boards running away from you, a rug under each table
 *   the DJ          decks and two speakers at the far end
 *
 * It is painted in daylight colours and then put to night: a deep-blue glaze
 * over everything, then candlelight pooled around each table, the screen's
 * cyan, moonlight under the windows. The guests are never glazed: their tops
 * are clue answers and have to read true, so they stand in the light.
 *
 * Pure canvas, no React. The context must be scaled to CSS pixels. Every mark
 * comes from fixed seeds, so the room is the same picture on every phone.
 * The tables are painted on their own (`drawTable`): guests stand behind and
 * in front of them, so NightRoom.jsx stacks each table between its guests.
 */

const WALL = '#d28f69';
const WOOD = '#c08a58';
const DARK_WOOD = '#7a4b2e';
const NIGHT_GLAZE = '#6a78b4';
const CANDLE = 'rgba(255, 176, 92, ';
const SCREEN = '#7ff0ff';
const RUGS = ['#a8453c', '#3f6a8f', '#7d9b6a', '#b8833f', '#8c5a86'];
const S = 11; // the room's seed

const lerp = (a, b, t) => a + (b - a) * t;

/** Paint the whole room for a layout from loungeLayout(). */
export function drawLounge(g, L) {
  const { w, height: h } = L;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);
  floor(g, w, h);
  L.tables.forEach((t, k) => rug(g, t, k));
  wall(g, w);
  bar(g, w);
  computer(g, L.computer);
  dj(g, L.dj);
  edges(g, L);
  night(g, L);
}

// ---------------------------------------------------------------- the floor

function floor(g, w, h) {
  wash(g, rectPts(-8, WALL_H - 4, w + 16, h - WALL_H + 12), WOOD, { seed: S + 1, alpha: 0.9, gran: 0.2, edge: 0, amp: 2 });
  // boards running away from you, toward a point far above the room
  const vx = w / 2, vy = -1400;
  g.save();
  g.beginPath();
  g.rect(0, WALL_H, w, h - WALL_H);
  g.clip();
  const step = 21;
  for (let xb = -w; xb <= w * 2; xb += step) {
    const at = (y) => vx + (xb - vx) * ((y - vy) / (h - vy));
    pen(g, [[at(WALL_H), WALL_H], [at(h), h]], { w: 0.6, alpha: 0.4, seed: S + 20 + xb, pressure: EVEN, rough: 0.4, color: shade(WOOD, 0.6) });
    // the boards' ends, staggered
    for (let y = WALL_H + ((xb * 7) % 90 + 90) % 90; y < h; y += 150) {
      const x0 = at(y), x1 = vx + (xb + step - vx) * ((y - vy) / (h - vy));
      pen(g, [[x0, y], [x1, y + 0.6]], { w: 0.55, alpha: 0.35, seed: S + 90 + y + xb, pressure: EVEN, rough: 0.2, color: shade(WOOD, 0.6) });
    }
  }
  // grain hatching, heavier toward the far end
  hatch(g, pathOf(rectPts(0, WALL_H, w, h - WALL_H)), [0, WALL_H, w, h - WALL_H], {
    seed: S + 5, gap: 6, len: 9, width: 0.4, alpha: 0.22, color: shade(WOOD, 0.5),
    tone: (x, y) => 0.28 + 0.2 * Math.sin(x * 0.05 + y * 0.01), dir: () => -1.52,
  });
  g.restore();
}

/** An oval rug under a table, a border inside it. */
function rug(g, t, k) {
  const c = RUGS[k % RUGS.length];
  const r = rng(S + 300 + k);
  const rx = 74 + r() * 8, ry = 30 + r() * 4;
  const cy = t.y + 2;
  wash(g, ellPts(t.x, cy, rx, ry, 40), c, { seed: S + 310 + k, alpha: 0.7, gran: 0.3, edge: 0.4 });
  wash(g, ellPts(t.x, cy, rx * 0.8, ry * 0.74, 36), tint(c, 0.4), { seed: S + 320 + k, alpha: 0.55, gran: 0.2 });
  line(g, ellPts(t.x, cy, rx, ry, 40), { close: true, w: 0.8, seed: S + 330 + k, alpha: 0.7, sketch: 0.15 });
  line(g, ellPts(t.x, cy, rx * 0.8, ry * 0.74, 36), { close: true, w: 0.5, seed: S + 340 + k, alpha: 0.5, sketch: 0 });
}

// ---------------------------------------------------------------- the back wall

function wall(g, w) {
  const top = rectPts(-8, -8, w + 16, WALL_H + 8);
  wash(g, top, WALL, { seed: S + 40, alpha: 0.95, gran: 0.14, edge: 0, amp: 2 });
  wash(g, [[-8, -8], [w + 8, -8], [w + 8, 30], [w * 0.4, 46], [-8, 26]], WALL, { seed: S + 41, alpha: 0.3, gran: 0.08, edge: 0.3, amp: 5 });
  hatch(g, pathOf(top), [0, 0, w, WALL_H], {
    seed: S + 42, gap: 5, len: 5, width: 0.35, alpha: 0.2, color: shade(WALL, 0.6), tone: (x, y) => 0.2 + y / WALL_H * 0.4, dir: () => 2.1,
  });
  // skirting along the foot of the wall
  solid(g, rectPts(-8, WALL_H - 5, w + 16, 6), tint(WALL, 0.5));
  line(g, [[-8, WALL_H - 5], [w + 8, WALL_H - 5]], { w: 0.7, seed: S + 43, pressure: EVEN, sketch: 0.2 });
  line(g, [[-8, WALL_H + 1], [w + 8, WALL_H + 1]], { w: 0.9, seed: S + 44, pressure: EVEN, sketch: 0.2 });
  // two arched windows on the night, between the bar and the desk
  const bx = w * 0.52, ex = w - 124;
  const span = ex - bx;
  const n = span > 70 ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const cx = bx + span * ((i + 0.5) / n), ww = Math.min(30, span / n - 12);
    window_(g, cx, 10, ww, 46, i === n - 1);
  }
  // a string of lights along the top
  const wire = [];
  for (let i = 0; i <= 16; i++) { const x = -6 + (i / 16) * (w + 12); wire.push([x, 6 + Math.sin(i * 0.9) * 2.5 + (i % 2) * 1.5]); }
  line(g, wire, { w: 0.5, seed: S + 45, pressure: EVEN, sketch: 0 });
  wire.forEach(([x, y], i) => { if (i % 2) thing(g, ellPts(x, y + 3, 1.4, 2, 10), { fill: '#fff4cf', color: '#ffd98a', seed: S + 46 + i, w: 0.4, sketch: 0, edge: 0 }); });
}

function window_(g, cx, y, w, h, moon) {
  const pts = [];
  for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI; pts.push([cx + Math.cos(a) * w / 2, y + w / 2 + Math.sin(a) * w / 2]); }
  pts.push([cx + w / 2, y + h], [cx - w / 2, y + h]);
  solid(g, pts, '#1d3a7a');
  wash(g, pts, '#16306b', { seed: S + 50 + cx, alpha: 0.6, gran: 0.15, edge: 0.3 });
  // stars, and the moon in one
  const r = rng(S + 60 + Math.round(cx));
  g.save();
  g.fillStyle = '#eaf3ff';
  for (let k = 0; k < 6; k++) { g.globalAlpha = 0.5 + r() * 0.5; g.beginPath(); g.arc(cx - w / 2 + 4 + r() * (w - 8), y + 6 + r() * (h - 14), 0.5 + r() * 0.5, 0, Math.PI * 2); g.fill(); }
  g.restore();
  if (moon) thing(g, ellPts(cx + w * 0.16, y + w * 0.42, 4.2, 4.2, 14), { fill: '#fffdf3', seed: S + 70, w: 0.4, sketch: 0 });
  line(g, pts, { close: true, w: 1, seed: S + 71 + cx, sketch: 0.2 });
  line(g, [[cx, y + 1], [cx, y + h]], { w: 0.6, seed: S + 72 + cx, pressure: EVEN, sketch: 0 });
  line(g, [[cx - w / 2, y + h * 0.55], [cx + w / 2, y + h * 0.55]], { w: 0.6, seed: S + 73 + cx, pressure: EVEN, sketch: 0 });
  thing(g, rectPts(cx - w / 2 - 3, y + h, w + 6, 3), { fill: tint(WALL, 0.6), seed: S + 74 + cx, w: 0.6, sketch: 0 });
}

// ---------------------------------------------------------------- the bar

function bar(g, w) {
  const x0 = 8, x1 = Math.round(w * 0.5);
  // the shelf of bottles on the wall
  thing(g, rectPts(x0 + 4, 40, x1 - x0 - 8, 4), { fill: PAPER, color: DARK_WOOD, seed: S + 100, w: 0.7, sketch: 0 });
  thing(g, rectPts(x0 + 4, 18, x1 - x0 - 8, 3), { fill: PAPER, color: DARK_WOOD, seed: S + 101, w: 0.6, sketch: 0 });
  const colours = ['#3d7a4a', '#c9862d', '#e8eef0', '#7a2a2a', '#3f6a8f', '#d9b43f'];
  const r = rng(S + 102);
  for (let x = x0 + 9; x < x1 - 8; x += 7 + r() * 3) {
    const c = colours[Math.floor(r() * colours.length)], tall = 11 + r() * 6;
    bottle(g, x, 40, tall, c, S + 110 + x);
    if (r() < 0.6) bottle(g, x + 2, 18, 8 + r() * 4, colours[Math.floor(r() * colours.length)], S + 160 + x);
  }
  // the counter: its top, seen from above, then its front
  const top = [[x0 - 2, 66], [x1 + 2, 66], [x1 + 8, 84], [x0 - 8, 84]];
  thing(g, top, { fill: PAPER, color: '#5a3a26', seed: S + 120, w: 0.9, corner: 0.6 });
  hatch(g, pathOf(top), [x0 - 8, 66, x1 - x0 + 16, 18], { seed: S + 121, gap: 3, len: 10, width: 0.35, alpha: 0.3, tone: () => 0.5, dir: () => 0.02, color: '#2a1a10' });
  const front = [[x0 - 8, 84], [x1 + 8, 84], [x1 + 8, 116], [x0 - 8, 116]];
  thing(g, front, { fill: PAPER, color: DARK_WOOD, seed: S + 122, w: 0.9, corner: 0.6 });
  for (let x = x0 + 6; x < x1; x += 22) line(g, [[x, 88], [x, 113]], { w: 0.45, alpha: 0.5, seed: S + 123 + x, pressure: EVEN, sketch: 0 });
  hatch(g, pathOf(front), [x0 - 8, 84, x1 - x0 + 16, 32], { seed: S + 124, gap: 3.4, len: 6, width: 0.35, alpha: 0.4, tone: (x, y) => (y - 84) / 32, dir: () => 1.9 });
  // glasses on the counter
  [0.25, 0.6, 0.8].forEach((f, i) => {
    const x = lerp(x0 + 6, x1 - 6, f);
    thing(g, [[x - 2.2, 69], [x + 2.2, 69], [x + 1.6, 77], [x - 1.6, 77]], { fill: '#eef6f8', color: i === 1 ? '#c9862d' : null, seed: S + 130 + i, w: 0.5, sketch: 0, alpha: 0.5 });
  });
  // stools in front
  for (let k = 0; k < 3; k++) {
    const x = lerp(x0 + 20, x1 - 16, (k + 0.5) / 3);
    line(g, [[x, 124], [x, 140]], { w: 0.9, seed: S + 140 + k, pressure: EVEN, sketch: 0 });
    thing(g, ellPts(x, 141, 6, 2, 12), { fill: PAPER, color: '#5b5650', seed: S + 141 + k, w: 0.5, sketch: 0, edge: 0 });
    thing(g, ellPts(x, 122, 9, 3.6, 16), { fill: PAPER, color: '#a8453c', seed: S + 142 + k, w: 0.8, sketch: 0.2 });
  }
}

function bottle(g, x, base, h, c, seed) {
  const b = [[x - 2.4, base], [x - 2.4, base - h * 0.6], [x - 0.9, base - h * 0.78], [x - 0.9, base - h], [x + 0.9, base - h], [x + 0.9, base - h * 0.78], [x + 2.4, base - h * 0.6], [x + 2.4, base]];
  thing(g, b, { fill: tint(c, 0.5), color: c, seed, w: 0.45, sketch: 0, corner: 0.6, alpha: 0.85 });
}

// ---------------------------------------------------------------- the computer

/** An old beige monitor on a desk in the corner, a keyboard, a chair pulled out. */
function computer(g, C) {
  const x = C.x, cx = C.x + C.w / 2;
  // the desk: top from above, then its front and legs
  const top = [[x + 4, 92], [x + C.w - 4, 92], [x + C.w, 104], [x, 104]];
  line(g, [[x + 4, 104], [x + 5, 132]], { w: 0.9, seed: S + 200, pressure: EVEN, sketch: 0 });
  line(g, [[x + C.w - 4, 104], [x + C.w - 5, 132]], { w: 0.9, seed: S + 201, pressure: EVEN, sketch: 0 });
  thing(g, top, { fill: PAPER, color: '#8b6a4a', seed: S + 202, w: 0.9, corner: 0.6 });
  thing(g, rectPts(x, 104, C.w, 8), { fill: PAPER, color: '#5a3e28', seed: S + 203, w: 0.8, sketch: 0 });
  // the monitor
  const m = [[cx - 26, 42], [cx + 26, 42], [cx + 27, 82], [cx - 27, 82]];
  thing(g, [[cx - 12, 82], [cx + 12, 82], [cx + 16, 95], [cx - 16, 95]], { fill: PAPER, color: '#cfc6b0', seed: S + 204, w: 0.8, corner: 0.6 });
  thing(g, m, { fill: PAPER, color: '#d9d0b9', seed: S + 205, w: 1, corner: 0.6 });
  hatch(g, pathOf(m), [cx - 27, 42, 54, 40], { seed: S + 206, gap: 3, len: 5, width: 0.35, alpha: 0.35, tone: (px) => (px > cx + 14 ? 0.8 : 0.05), dir: () => 1.8 });
  // the screen: DEEP BLUE's logs, the one cold light in the room
  const scr = rectPts(cx - 21, 47, 42, 29);
  solid(g, scr, '#0b3a5a');
  wash(g, scr, '#0e5a7a', { seed: S + 207, alpha: 0.6, gran: 0.2, edge: 0.4 });
  const r = rng(S + 208);
  for (let k = 0; k < 6; k++) {
    const y = 51 + k * 4, len = 10 + r() * 24;
    pen(g, [[cx - 18, y], [cx - 18 + len, y]], { w: 0.9, color: SCREEN, alpha: 0.85, seed: S + 210 + k, pressure: EVEN, rough: 0.15 });
  }
  line(g, scr, { close: true, w: 0.7, seed: S + 220, sketch: 0, corner: 0.6 });
  // the keyboard and a mug
  thing(g, [[cx - 18, 96], [cx + 18, 96], [cx + 20, 101], [cx - 20, 101]], { fill: PAPER, color: '#cfc6b0', seed: S + 221, w: 0.6, corner: 0.6, sketch: 0 });
  thing(g, [[x + C.w - 18, 90], [x + C.w - 11, 90], [x + C.w - 11.5, 97], [x + C.w - 17.5, 97]], { fill: PAPER, color: '#e8e2d6', seed: S + 222, w: 0.5, sketch: 0 });
  // the chair, pulled out, in front
  line(g, [[cx + 2, 130], [cx + 2, 142]], { w: 0.9, seed: S + 223, pressure: EVEN, sketch: 0 });
  [[-8, 145], [12, 145], [2, 147]].forEach(([dx, y], i) => line(g, [[cx + 2, 142], [cx + 2 + dx, y]], { w: 0.7, seed: S + 224 + i, pressure: EVEN, sketch: 0 }));
  thing(g, [[cx - 9, 112], [cx + 13, 112], [cx + 12, 126], [cx - 8, 126]], { fill: PAPER, color: '#2f3a4a', seed: S + 228, w: 0.8, corner: 0.6 });
  thing(g, ellPts(cx + 2, 129, 13, 4.4, 16), { fill: PAPER, color: '#3a4658', seed: S + 229, w: 0.8, sketch: 0 });
  // cables
  pen(g, [[cx + 22, 82], [cx + 34, 90], [cx + 40, 112], [cx + 46, 132]], { w: 0.5, alpha: 0.6, seed: S + 230, pressure: EVEN });
}

// ---------------------------------------------------------------- the DJ

function dj(g, D) {
  const { x, y, w } = D;
  const r0 = rng(S + 400);
  wash(g, ellPts(x, y + 6, w * 0.7, 30, 36), '#2f3a5a', { seed: S + 401, alpha: 0.55, gran: 0.3, edge: 0.3 });
  // speakers either side
  for (const side of [-1, 1]) {
    const sx = x + side * (w / 2 + 14);
    const box = rectPts(sx - 11, y - 26, 22, 38);
    thing(g, box, { fill: PAPER, color: '#2b2b30', seed: S + 410 + side, w: 0.8, corner: 0.6 });
    thing(g, ellPts(sx, y - 14, 6.5, 6.5, 16), { fill: '#3a3a42', color: '#55555f', seed: S + 412 + side, w: 0.6, sketch: 0 });
    thing(g, ellPts(sx, y + 3, 4.2, 4.2, 14), { fill: '#3a3a42', color: '#55555f', seed: S + 414 + side, w: 0.5, sketch: 0 });
  }
  // the booth: its top with two decks and the mixer, then its front
  const top = [[x - w / 2 + 6, y - 22], [x + w / 2 - 6, y - 22], [x + w / 2, y - 6], [x - w / 2, y - 6]];
  thing(g, top, { fill: PAPER, color: '#3b3640', seed: S + 420, w: 0.9, corner: 0.6 });
  for (const side of [-1, 1]) {
    const dx = x + side * w * 0.26;
    thing(g, ellPts(dx, y - 14, 15, 5.4, 22), { fill: '#1c1c22', color: '#26262e', seed: S + 422 + side, w: 0.6, sketch: 0 });
    for (let k = 1; k <= 2; k++) pen(g, ellPts(dx, y - 14, 15 - k * 4, 5.4 - k * 1.4, 18), { w: 0.3, close: true, color: '#6a6a78', alpha: 0.7, seed: S + 424 + side * k, rough: 0 });
    thing(g, ellPts(dx, y - 14, 2.4, 1, 8), { fill: '#d9b43f', seed: S + 428 + side, w: 0.3, sketch: 0 });
  }
  thing(g, rectPts(x - 7, y - 20, 14, 11), { fill: '#2b2b30', seed: S + 430, w: 0.5, sketch: 0 });
  for (let k = 0; k < 4; k++) { const c = r0() < 0.5 ? '#ff7a9a' : '#7ff0ff'; thing(g, ellPts(x - 4 + (k % 2) * 8, y - 17 + Math.floor(k / 2) * 5, 1, 1, 6), { fill: c, seed: S + 431 + k, w: 0.2, sketch: 0 }); }
  const front = rectPts(x - w / 2, y - 6, w, 24);
  thing(g, front, { fill: PAPER, color: '#26232a', seed: S + 440, w: 0.9, corner: 0.6 });
  hatch(g, pathOf(front), [x - w / 2, y - 6, w, 24], { seed: S + 441, gap: 3, len: 5, width: 0.35, alpha: 0.45, tone: () => 0.6, dir: () => 1.9, color: '#000' });
}

// ---------------------------------------------------------------- the edges

/** Plants in the corners and along the sides, where no table stands. */
function edges(g, L) {
  const { w, height: h } = L;
  potPlant(g, 14, 160, 1);
  potPlant(g, w - 14, 176, 2);
  const rows = Math.ceil(L.tables.length / 2);
  for (let k = 1; k < rows; k += 2) potPlant(g, k % 4 === 1 ? w - 12 : 12, L.tables[k * 2]?.y ?? 0, 10 + k);
  potPlant(g, 18, h - 24, 30);
  potPlant(g, w - 18, h - 30, 31);
}

function potPlant(g, x, base, seed) {
  const s = S + 500 + seed * 17;
  const pot = [[x - 7, base - 12], [x + 7, base - 12], [x + 5.5, base], [x - 5.5, base]];
  const r = rng(s);
  for (let i = 0; i < 6; i++) {
    const a = -1.3 + (i / 5) * 2.6 + (r() - 0.5) * 0.3, len = 14 + r() * 8;
    const tx = x + Math.sin(a) * len, ty = base - 12 - Math.cos(a) * len;
    line(g, [[x, base - 12], [lerp(x, tx, 0.5), lerp(base - 12, ty, 0.6) - 2], [tx, ty]], { w: 0.5, seed: s + i, pressure: EVEN, sketch: 0 });
    thing(g, ellPts(tx, ty, 4.6, 2.6, 12, a - Math.PI / 2), { fill: PAPER, color: i % 2 ? '#5f9a63' : '#4b8656', seed: s + 10 + i, w: 0.5, sketch: 0 });
  }
  thing(g, pot, { fill: PAPER, color: '#c8754e', seed: s + 20, w: 0.7 });
}

// ---------------------------------------------------------------- night

/**
 * The room put to night: a deep-blue glaze over everything, then the light
 * that is left (candles at the tables, the screen, the moon in the windows,
 * the DJ's glow), and the edges falling into the dark.
 */
function night(g, L) {
  const { w, height: h } = L;
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = NIGHT_GLAZE;
  g.fillRect(0, 0, w, h);
  g.restore();
  g.save();
  g.globalCompositeOperation = 'screen';
  const pool = (x, y, r, rgba) => {
    const p = g.createRadialGradient(x, y, 0, x, y, r);
    p.addColorStop(0, `${rgba}0.55)`);
    p.addColorStop(0.45, `${rgba}0.2)`);
    p.addColorStop(1, `${rgba}0)`);
    g.fillStyle = p;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  for (const t of L.tables) pool(t.x, t.y - 16, 92, CANDLE);
  const C = L.computer;
  pool(C.x + C.w / 2, 70, 84, 'rgba(110, 230, 255, ');
  pool(L.dj.x, L.dj.y, 110, 'rgba(190, 110, 255, ');
  pool(w * 0.3, 92, 110, 'rgba(255, 186, 110, ');
  g.restore();
  // the far corners and the sides fall off into the dark
  g.save();
  g.globalCompositeOperation = 'multiply';
  const side = g.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, '#4a5688');
  side.addColorStop(0.14, '#ffffff');
  side.addColorStop(0.86, '#ffffff');
  side.addColorStop(1, '#4a5688');
  g.fillStyle = side;
  g.fillRect(0, 0, w, h);
  g.restore();
}

// ---------------------------------------------------------------- a table

export const TABLE_W = 64;
export const TABLE_H = 62;
/** The table's floor point inside its own canvas. */
export const TABLE_FOOT = [32, 56];

/**
 * One high round table with a candle in a jar and a couple of glasses, on its
 * own canvas (TABLE_W × TABLE_H CSS px, the floor point at TABLE_FOOT), put to
 * night like the room but lit from its own candle. `seed` varies the glasses.
 */
export function drawTable(g, seed = 0) {
  const [fx, fy] = TABLE_FOOT;
  const ty = fy - 38;
  const r = rng(S + 600 + seed);
  // pedestal and foot
  thing(g, ellPts(fx, fy - 1, 11, 3.6, 16), { fill: PAPER, color: '#2b2b30', seed: S + 601 + seed, w: 0.7, sketch: 0 });
  line(g, [[fx - 1.4, fy - 2], [fx - 1.2, ty + 4]], { w: 1.1, seed: S + 602 + seed, pressure: EVEN, sketch: 0 });
  line(g, [[fx + 1.4, fy - 2], [fx + 1.2, ty + 4]], { w: 0.6, seed: S + 603 + seed, pressure: EVEN, sketch: 0 });
  // the top, with its edge
  thing(g, ellPts(fx, ty + 2.4, 25, 8.6, 30), { fill: PAPER, color: '#4a2e1c', seed: S + 604 + seed, w: 0.7, sketch: 0, edge: 0 });
  thing(g, ellPts(fx, ty, 25, 8.6, 30), { fill: PAPER, color: '#a46f45', seed: S + 605 + seed, w: 0.8, sketch: 0.15 });
  hatch(g, pathOf(ellPts(fx, ty, 25, 8.6, 30)), [fx - 26, ty - 9, 52, 18], { seed: S + 606 + seed, gap: 2.6, len: 8, width: 0.3, alpha: 0.3, tone: () => 0.45, dir: () => 0.05, color: '#3a2212' });
  // the candle in its jar, and two glasses
  thing(g, [[fx - 3, ty - 6], [fx + 3, ty - 6], [fx + 3, ty + 1], [fx - 3, ty + 1]], { fill: '#fff3d6', color: '#ffd98a', seed: S + 607 + seed, w: 0.5, sketch: 0 });
  thing(g, ellPts(fx, ty - 8.4, 1.1, 2.2, 10), { fill: '#fff7d0', color: '#ffb35c', seed: S + 608 + seed, w: 0.2, sketch: 0, edge: 0 });
  const gx = [fx - 13 + r() * 4, fx + 9 + r() * 4];
  const drink = ['#c9862d', '#7a2a2a', '#e8eef0', '#d9b43f'];
  gx.forEach((x, i) => {
    const c = drink[Math.floor(r() * drink.length)];
    thing(g, [[x - 2, ty - 7], [x + 2, ty - 7], [x + 1.5, ty], [x - 1.5, ty]], { fill: '#eef6f8', color: c, seed: S + 610 + seed + i, w: 0.45, sketch: 0, alpha: 0.6 });
  });
  // to night, lit from the candle
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(40, 52, 110, 0.38)';
  g.fillRect(0, 0, TABLE_W, TABLE_H);
  const p = g.createRadialGradient(fx, ty - 4, 0, fx, ty - 4, 30);
  p.addColorStop(0, 'rgba(255, 190, 110, 0.5)');
  p.addColorStop(1, 'rgba(255, 190, 110, 0)');
  g.fillStyle = p;
  g.globalCompositeOperation = 'source-atop';
  g.fillRect(0, 0, TABLE_W, TABLE_H);
  g.restore();
  // the flame's halo, over everything
  g.save();
  g.globalCompositeOperation = 'lighter';
  const halo = g.createRadialGradient(fx, ty - 8, 0, fx, ty - 8, 9);
  halo.addColorStop(0, 'rgba(255, 210, 140, 0.8)');
  halo.addColorStop(1, 'rgba(255, 210, 140, 0)');
  g.fillStyle = halo;
  g.fillRect(fx - 10, ty - 18, 20, 20);
  g.restore();
}
