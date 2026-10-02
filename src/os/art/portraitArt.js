/**
 * The contact photo, drawn by hand on a canvas: a full-length picture of the
 * guest at home, built from their six arrival answers (data/traits.js).
 *
 *   top       the shirt they wear, in its colour (or a print)
 *   glasses   on their face, or not
 *   shoes     on their feet, drawn side-on so a heel reads as a heel
 *   drink     in their hand
 *   season    the wall calendar behind them, open at their quarter, a day ringed
 *   siblings  the family photo on the wall; they are the one in their own colour
 *
 * The rest of the picture (the room, its colours, the plant or lamp, the
 * hair, the trousers, the pose) comes from a seed, the guest's id, so two
 * guests who answered alike still get two different photos. Hair and
 * trousers are not answers, so they are drawn in pencil and neutral washes:
 * the picture never claims a hair colour, and skin is always the paper.
 *
 * The look is an ink-and-watercolour fashion sketch, after the
 * hand-drawn-canvas-animation skill: tapered pen lines with a lighter pencil
 * gesture under them, washes that granulate and dry darker at the edge and
 * sit a hair off the line, and form hatching on the shadow side. Every mark
 * is seeded, so the same guest is the same drawing on every phone.
 *
 * Pure canvas, no React: `drawPortrait(ctx, traits, seed, opts)` paints one
 * frame in a 300 x 400 drawing. `opts.reveal` maps a trait to a 0..1 brush
 * progress and `opts.prev` holds the answers before a change, which is how
 * Setup draws an answer on as it lands (Portrait.jsx runs the clock).
 */

export const ART_W = 300;
export const ART_H = 400;

/** The square a thumbnail shows: head and shoulders, so the top and glasses read at 24 px. */
export const FACE_CROP = { x: 103, y: 70, w: 94, h: 94 };

const TAU = Math.PI * 2;
const INK = '#2a2622';
const PAPER = '#f6f1e6';
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ---------------------------------------------------------------- random

function rng(seed) {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(k, seed = 0) {
  let a = (Math.imul(k | 0, 0x9e3779b1) + Math.imul((seed * 4096) | 0, 0x85ebca77)) | 0;
  a ^= a >>> 15; a = Math.imul(a, 0x2c1b3c6d); a ^= a >>> 12; a = Math.imul(a, 0x297a2d39); a ^= a >>> 15;
  return (a >>> 0) / 4294967296;
}
function noise1(x, seed = 1) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
}
/** A stable number from any string: a guest id becomes a room. */
export function seedOf(s) {
  let n = 2166136261;
  for (const ch of String(s ?? '')) n = Math.imul(n ^ ch.charCodeAt(0), 16777619);
  return n >>> 0;
}
const pick = (list, r) => list[Math.floor(r * list.length) % list.length];

// ---------------------------------------------------------------- geometry

/** Catmull-Rom through the points; turns sharper than `corner` stay corners (a heel keeps its edge). */
function smoothPts(pts, close = false, step = 1.6, corner = 1.1) {
  const n = pts.length;
  if (n < 3) return pts.map((p) => p.slice());
  const P = (i) => (close ? pts[((i % n) + n) % n] : pts[clamp(i, 0, n - 1)]);
  const sharp = pts.map((_, i) => {
    if (!close && (i === 0 || i === n - 1)) return true;
    const a = P(i - 1), b = P(i), d = P(i + 1);
    let t = Math.abs(Math.atan2(d[1] - b[1], d[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]));
    if (t > Math.PI) t = TAU - t;
    return t > corner;
  });
  const out = [];
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p1 = P(i), p2 = P(i + 1);
    const p0 = sharp[i % n] ? [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]] : P(i - 1);
    const p3 = sharp[(i + 1) % n] ? [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]] : P(i + 2);
    const m = Math.max(1, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!close) out.push(pts[n - 1].slice());
  return out;
}
function pathOf(pts, close = true) {
  const p = new Path2D();
  pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])));
  if (close) p.closePath();
  return p;
}
const curve = (pts, close = true, corner) => pathOf(smoothPts(pts, close, 1.6, corner), close);
function ellPts(cx, cy, rx, ry, n = 28, rot = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, x = rx * Math.cos(a), y = ry * Math.sin(a);
    out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return out;
}
/** An outline bent by slow noise: a rectangle that is not quite one. */
function warp(pts, seed, amp = 1.2, close = true, step = 10) {
  const n = pts.length, out = [], segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const m = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < m; k++) out.push([lerp(a[0], b[0], k / m), lerp(a[1], b[1], k / m)]);
  }
  if (!close) out.push(pts[n - 1].slice());
  let s = 0;
  return out.map((p, i) => {
    if (i) s += Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1]);
    return [p[0] + amp * noise1(s / 40 + 3, seed), p[1] + amp * noise1(s / 40 + 40, seed + 1)];
  });
}
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);

// ---------------------------------------------------------------- colour

function parse(c) {
  const h = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const hex = (rgb) => `#${rgb.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => { const A = parse(a), B = parse(b); return hex(A.map((v, i) => lerp(v, B[i], t))); };
const shade = (c, t) => mix(c, '#1a1612', t);
const tint = (c, t) => mix(c, '#ffffff', t);

// ---------------------------------------------------------------- marks

const profile = (u, keys) => {
  if (u <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    if (u <= keys[k][0]) { const a = keys[k - 1], b = keys[k]; return lerp(a[1], b[1], (u - a[0]) / (b[0] - a[0])); }
  }
  return keys[keys.length - 1][1];
};
const TAPER = [[0, 0.2], [0.14, 0.9], [0.5, 1], [0.84, 0.8], [1, 0.12]];
const EVEN = [[0, 0.75], [0.5, 1], [1, 0.75]];

/**
 * The pen: a filled ribbon whose width follows an authored pressure profile,
 * wandering a little off the drawn path. One gesture, no outline drawn twice.
 */
function pen(g, pts, { w = 1.6, color = INK, alpha = 1, close = false, seed = 1, rough = 0.5, pressure = TAPER, corner } = {}) {
  const q = smoothPts(pts, close, 1.2, corner);
  const n = q.length;
  if (n < 2) return;
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
  const L = s[n - 1] || 1;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)];
    let nx = a[1] - b[1], ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const u = s[i] / L;
    const off = rough * noise1(s[i] / 26 + 7, seed) * (close ? 1 : Math.sin(Math.PI * u));
    const ww = (w * (close ? 1 : profile(u, pressure)) * (1 + 0.18 * noise1(s[i] / 14, seed + 3))) / 2;
    const cx = q[i][0] + nx * off, cy = q[i][1] + ny * off;
    left.push([cx + nx * ww, cy + ny * ww]);
    right.push([cx - nx * ww, cy - ny * ww]);
  }
  g.save();
  g.globalAlpha *= alpha;
  g.fillStyle = color;
  g.fill(pathOf([...left, ...right.reverse()]));
  g.restore();
}

/** Ink with a pencil gesture under it: the construction line a hand draws first, never quite on the ink. */
function line(g, pts, o = {}) {
  const { seed = 1, sketch = 0.28 } = o;
  if (sketch > 0) pen(g, shift(pts, (hash(seed, 5) - 0.5) * 1.4, (hash(seed, 6) - 0.5) * 1.4), { ...o, w: (o.w ?? 1.6) * 0.45, alpha: sketch, seed: seed + 11, rough: 1.1, pressure: EVEN });
  pen(g, pts, o);
}

/**
 * A watercolour wash: a slightly wandering shape off the line, pigment
 * granulating inside it and drying darker at its edge. Multiply, so washes
 * glaze over each other the way paint does.
 */
function wash(g, pts, color, { seed = 1, alpha = 0.85, dx = 0.8, dy = 0.6, amp = 0.9, gran = 0.22, edge = 0.5, close = true, corner } = {}) {
  const shape = smoothPts(warp(shift(pts, dx, dy), seed, amp, close, 8), close, 1.6, corner);
  const path = pathOf(shape, true);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of shape) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.globalAlpha *= alpha;
  g.fillStyle = color;
  g.fill(path);
  g.clip(path);
  if (gran > 0) {
    const r = rng(seed + 77);
    g.globalAlpha = alpha * gran;
    g.fillStyle = shade(color, 0.25);
    const count = Math.min(900, Math.ceil(((x1 - x0) * (y1 - y0)) / 14));
    for (let i = 0; i < count; i++) {
      const rad = 0.25 + r() * 0.8;
      g.beginPath();
      g.ellipse(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), rad * 1.4, rad, r() * TAU, 0, TAU);
      g.fill();
    }
  }
  if (edge > 0) {
    g.globalAlpha = alpha * edge;
    g.strokeStyle = shade(color, 0.2);
    g.lineWidth = 1.4;
    g.stroke(path);
  }
  g.restore();
  return path;
}

/**
 * Hatching that follows the form: short strokes on a stable grid, kept where
 * `tone(x, y)` is dark enough, leaning along `dir(x, y)`. Grid ids decide
 * each stroke, so a held drawing keeps its marks.
 */
function hatch(g, path, [x, y, w, h], { seed = 1, color = INK, gap = 3.2, len = 7, width = 0.5, alpha = 0.5, tone = () => 0.5, dir = () => 0.9 } = {}) {
  g.save();
  g.clip(path);
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.globalAlpha *= alpha;
  g.beginPath();
  for (let iy = Math.floor(y / gap); iy <= Math.ceil((y + h) / gap); iy++) {
    for (let ix = Math.floor(x / gap); ix <= Math.ceil((x + w) / gap); ix++) {
      const id = Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663);
      const px = (ix + hash(id, seed) * 0.7) * gap, py = (iy + hash(id, seed + 1) * 0.7) * gap;
      if (hash(id, seed + 2) > clamp(tone(px, py), 0, 1)) continue;
      const a = dir(px, py), l = len * (0.6 + hash(id, seed + 3) * 0.6);
      g.moveTo(px, py);
      g.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + 0.6, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l);
    }
  }
  g.stroke();
  g.restore();
}

/** Paper-coloured fill under a drawn shape, so it hides what is behind it (skin is paper). */
function solid(g, pts, color = PAPER, close = true, corner) {
  g.save();
  g.fillStyle = color;
  g.fill(curve(pts, close, corner));
  g.restore();
}

/** A drawn thing: paper (or colour) under it, a wash, and its ink line. */
function thing(g, pts, { fill, color, seed = 1, w = 1.5, alpha = 0.9, corner, sketch, edge } = {}) {
  if (fill) solid(g, pts, fill, true, corner);
  if (color) wash(g, pts, color, { seed: seed + 1, alpha, corner, edge });
  line(g, pts, { close: true, w, seed, corner, sketch });
}

// ---------------------------------------------------------------- the seed

const WALLS = ['#dfe7d8', '#f0dccf', '#f2e6c4', '#d8e3ec', '#e5dcea', '#ecd5c2', '#d6e6e1'];
const FLOORS = [
  { kind: 'boards', color: '#d9b98c' },
  { kind: 'boards', color: '#c9a27a' },
  { kind: 'tiles', color: '#e7ddd0' },
  { kind: 'tiles', color: '#d7b9a3' },
];
const RUGS = ['#c9705b', '#5f86a8', '#d6a64b', '#7d9b6a', '#a86f8d'];
const TROUSERS = [
  { color: '#4d6488', name: 'denim' },
  { color: '#3c3a3f', name: 'black' },
  { color: '#bba27d', name: 'chino' },
  { color: '#6f7458', name: 'olive' },
  { color: '#8a8f99', name: 'grey' },
];
const HAIR = ['crop', 'curls', 'bun', 'long', 'bob', 'wavy', 'quiff'];
/** How the figure is drawn for each gender answer (data/traits.js GENDER). Identity is never drawn, only a silhouette. */
const LOOK = { woman: 'fem', transwoman: 'fem', man: 'masc', transman: 'masc' };
export const lookOf = (gender) => LOOK[gender] ?? 'open';
const HAIR_BY = {
  fem: ['long', 'bob', 'bun', 'wavy', 'curls', 'long'],
  masc: ['crop', 'quiff', 'curls', 'crop', 'quiff', 'crop'],
  open: HAIR,
};
const LEFT_PROPS = ['plant', 'stool', 'guitar', 'shelf', 'cat'];
const RIGHT_PROPS = ['lamp', 'table', 'plant', 'cat', 'shelf'];

/**
 * Everything the seed decides, once per guest. `look` picks the hair and the
 * cut of the clothes from its own lists, using the same draws, so changing
 * the gender answer redraws the figure but keeps the guest's room.
 */
export function sceneFor(seed, look = 'open') {
  const r = rng((seed % 2147483647) + 1);
  const scene = {
    wall: pick(WALLS, r()),
    floor: pick(FLOORS, r()),
    rug: r() < 0.6 ? pick(RUGS, r()) : null,
    trousers: pick(TROUSERS, r()),
    hair: pick(HAIR_BY[look] ?? HAIR, r()),
    pose: r() < 0.5 ? 'hip' : 'easy',
    calendarLeft: r() < 0.5,
    leftProp: pick(LEFT_PROPS, r()),
    rightProp: pick(RIGHT_PROPS, r()),
    lights: r() < 0.45,
    frameRound: r() < 0.5,
    birthday: 3 + Math.floor(r() * 26),
    smile: r() < 0.6,
    tilt: (r() - 0.5) * 0.08,
    seed,
    look,
  };
  // drawn last so they never shift the choices above
  const skirtRoll = r(), beardRoll = r();
  scene.skirt = look === 'fem' && skirtRoll < 0.45;
  scene.beard = look === 'masc' && beardRoll < 0.35;
  // never two cats
  if (scene.rightProp === scene.leftProp) scene.rightProp = RIGHT_PROPS[(RIGHT_PROPS.indexOf(scene.rightProp) + 1) % RIGHT_PROPS.length];
  return scene;
}

// ---------------------------------------------------------------- the room

const FLOOR_Y = 300;

function room(g, S, face = false) {
  const s = S.seed;
  // paper
  g.fillStyle = PAPER;
  g.fillRect(0, 0, ART_W, ART_H);
  // the wall, laid in two uneven passes like a big brush
  wash(g, rectPts(-6, -6, ART_W + 12, FLOOR_Y + 8), S.wall, { seed: s + 1, alpha: 0.95, gran: 0.12, edge: 0, amp: 2 });
  wash(g, [[-6, -6], [ART_W + 6, -6], [ART_W + 6, 120], [180, 160], [-6, 90]], S.wall, { seed: s + 2, alpha: 0.35, gran: 0.08, edge: 0.3, amp: 6 });
  // light falls from the left: the wall deepens toward the right and the ceiling
  g.save();
  g.globalCompositeOperation = 'multiply';
  const dusk = g.createLinearGradient(40, 0, ART_W + 40, 40);
  dusk.addColorStop(0, 'rgba(255,255,255,0)');
  dusk.addColorStop(1, `${shade(S.wall, 0.35)}66`);
  g.fillStyle = dusk;
  g.fillRect(0, 0, ART_W, FLOOR_Y);
  g.restore();
  hatch(g, pathOf(rectPts(0, 0, ART_W, FLOOR_Y)), [0, 0, ART_W, FLOOR_Y], {
    seed: s + 3, gap: 7, len: 6, width: 0.4, alpha: 0.18, color: shade(S.wall, 0.6),
    tone: (x, y) => (x > 236 ? (x - 236) / 90 : 0) * (y > 40 ? 1 : 0.4), dir: () => 2.1,
  });

  if (face) return;

  // the floor
  const floor = rectPts(-6, FLOOR_Y, ART_W + 12, ART_H - FLOOR_Y + 6);
  wash(g, floor, S.floor.color, { seed: s + 4, alpha: 0.85, gran: 0.18, edge: 0, amp: 1 });
  g.save();
  g.clip(pathOf(floor));
  if (S.floor.kind === 'boards') {
    for (let i = -8; i <= 8; i++) {
      const xt = 163 + i * 26, xb = 163 + i * 62;
      pen(g, [[xt, FLOOR_Y + 2], [xb, ART_H + 4]], { w: 0.7, alpha: 0.35, seed: s + 40 + i, pressure: EVEN, rough: 0.5 });
    }
    for (let k = 0; k < 9; k++) {
      const y = FLOOR_Y + 14 + ((k * 37) % 90), x = ((k * 71 + s) % 260) + 10;
      pen(g, [[x, y], [x + 6, y + 0.4]], { w: 0.6, alpha: 0.3, seed: s + 60 + k, pressure: EVEN, rough: 0.2 });
    }
  } else {
    for (let k = 1; k < 6; k++) {
      const y = FLOOR_Y + (k * k) * 3.6;
      pen(g, [[-4, y], [ART_W + 4, y]], { w: 0.6, alpha: 0.35, seed: s + 40 + k, pressure: EVEN, rough: 0.6 });
    }
    for (let i = -8; i <= 8; i++) pen(g, [[150 + i * 34, FLOOR_Y + 2], [150 + i * 78, ART_H + 4]], { w: 0.6, alpha: 0.3, seed: s + 50 + i, pressure: EVEN, rough: 0.5 });
  }
  g.restore();
  // skirting board
  const skirt = [[-6, FLOOR_Y - 9], [ART_W + 6, FLOOR_Y - 9], [ART_W + 6, FLOOR_Y + 1], [-6, FLOOR_Y + 1]];
  solid(g, skirt, tint(S.wall, 0.55));
  line(g, [[-6, FLOOR_Y - 9], [ART_W + 6, FLOOR_Y - 9]], { w: 1, seed: s + 8, pressure: EVEN, sketch: 0.2 });
  line(g, [[-6, FLOOR_Y + 1], [ART_W + 6, FLOOR_Y + 1]], { w: 1.3, seed: s + 9, pressure: EVEN, sketch: 0.2 });

  // a rug under their feet
  if (S.rug) {
    const rug = ellPts(150, 366, 104, 20, 36);
    wash(g, rug, S.rug, { seed: s + 10, alpha: 0.75, gran: 0.3, edge: 0.4 });
    wash(g, ellPts(150, 366, 86, 14, 32), tint(S.rug, 0.45), { seed: s + 11, alpha: 0.6, gran: 0.2 });
    line(g, rug, { close: true, w: 1, seed: s + 12, sketch: 0.25 });
    line(g, ellPts(150, 366, 86, 14, 32), { close: true, w: 0.6, seed: s + 13, alpha: 0.6, sketch: 0 });
  }

  // party lights strung across the top of the wall
  if (S.lights) {
    const wire = [];
    for (let i = 0; i <= 12; i++) { const x = -6 + (i / 12) * 312; wire.push([x, 16 + Math.sin((i / 12) * Math.PI * 2) * 7 + (i % 2) * 2]); }
    line(g, wire, { w: 0.8, seed: s + 14, pressure: EVEN, sketch: 0 });
    const bulbs = ['#f3c34b', '#e9776b', '#7fb0d8', '#9ccf8a'];
    wire.forEach(([x, y], i) => {
      if (i === 0 || i === wire.length - 1) return;
      const c = bulbs[i % bulbs.length];
      g.save();
      g.globalCompositeOperation = 'multiply';
      const glow = g.createRadialGradient(x, y + 5, 0, x, y + 5, 11);
      glow.addColorStop(0, `${c}66`);
      glow.addColorStop(1, `${c}00`);
      g.fillStyle = glow;
      g.fillRect(x - 12, y - 7, 24, 24);
      g.restore();
      thing(g, ellPts(x, y + 5, 2.4, 3.4, 12), { fill: tint(c, 0.4), color: c, seed: s + 20 + i, w: 0.8, sketch: 0, edge: 0.2 });
    });
  }
}

// a pot with a monstera
function plant(g, x, S) {
  const s = S.seed + 300;
  const base = 322;
  const pot = [[x - 17, base - 30], [x + 17, base - 30], [x + 13, base], [x - 13, base]];
  thing(g, pot, { fill: PAPER, color: '#c8754e', seed: s, w: 1.3 });
  hatch(g, pathOf(pot), [x - 18, base - 31, 36, 32], { seed: s + 1, tone: (px) => (px > x + 2 ? 0.7 : 0.05), dir: () => 1.3, alpha: 0.45 });
  line(g, [[x - 18, base - 30], [x + 18, base - 30]], { w: 1.4, seed: s + 2, sketch: 0 });
  const leaves = [
    [-0.9, 46, 15], [-0.35, 62, 17], [0.15, 58, 16], [0.7, 48, 15], [-1.35, 34, 12], [1.2, 36, 12],
  ];
  leaves.forEach(([a, len, wid], i) => {
    const sx = x + (i % 2 ? 2 : -2), sy = base - 32;
    const tx = sx + Math.sin(a) * len, ty = sy - Math.cos(a) * len;
    line(g, [[sx, sy], [lerp(sx, tx, 0.5) - a * 3, lerp(sy, ty, 0.55)], [tx, ty]], { w: 1, seed: s + 10 + i, pressure: EVEN, sketch: 0 });
    const lx = tx, ly = ty;
    const shape = ellPts(lx, ly - 2, wid, wid * 0.72, 18, a);
    thing(g, shape, { fill: PAPER, color: i % 2 ? '#5f9a63' : '#4b8656', seed: s + 30 + i, w: 1.1, sketch: 0.2 });
    // the splits in a monstera leaf
    for (let k = -1; k <= 1; k += 2) {
      for (let j = 0; j < 2; j++) {
        const t = -0.5 + j * 0.9;
        const ox = lx + Math.cos(a + t) * wid * 0.9 * k, oy = ly - 2 + Math.sin(a + t) * wid * 0.6 * k;
        pen(g, [[ox, oy], [lerp(ox, lx, 0.45), lerp(oy, ly - 2, 0.45)]], { w: 0.9, seed: s + 50 + i * 4 + j + k, color: PAPER, rough: 0.2, pressure: EVEN });
      }
    }
    pen(g, [[lx - Math.cos(a) * wid * 0.8, ly - 2 - Math.sin(a) * wid * 0.55], [lx + Math.cos(a) * wid * 0.8, ly - 2 + Math.sin(a) * wid * 0.55]], { w: 0.5, alpha: 0.6, seed: s + 70 + i, pressure: EVEN });
  });
}

function lamp(g, x, S) {
  const s = S.seed + 400;
  const top = 196;
  g.save();
  g.globalCompositeOperation = 'multiply';
  const glow = g.createRadialGradient(x, top + 22, 2, x, top + 22, 60);
  glow.addColorStop(0, '#f7d58a88');
  glow.addColorStop(1, '#f7d58a00');
  g.fillStyle = glow;
  g.fillRect(x - 70, top - 40, 140, 140);
  g.restore();
  line(g, [[x, top + 20], [x + 1, 326]], { w: 1.6, seed: s, pressure: EVEN, sketch: 0.2 });
  thing(g, ellPts(x, 326, 14, 3.4, 18), { fill: PAPER, color: '#5b5650', seed: s + 1, w: 1.1, sketch: 0 });
  const shade_ = [[x - 12, top], [x + 12, top], [x + 21, top + 24], [x - 21, top + 24]];
  thing(g, shade_, { fill: PAPER, color: '#f0d08a', seed: s + 2, w: 1.3, corner: 0.6 });
  hatch(g, pathOf(shade_), [x - 22, top, 44, 25], { seed: s + 3, tone: (px) => (px > x + 6 ? 0.6 : 0), dir: () => 1.7, alpha: 0.35 });
}

function table(g, x, S) {
  const s = S.seed + 500;
  const top = 270;
  line(g, [[x - 16, top + 4], [x - 14, 326]], { w: 1.4, seed: s, pressure: EVEN });
  line(g, [[x + 16, top + 4], [x + 14, 326]], { w: 1.4, seed: s + 1, pressure: EVEN });
  line(g, [[x - 3, top + 6], [x - 2, 320]], { w: 0.9, alpha: 0.6, seed: s + 2, pressure: EVEN, sketch: 0 });
  thing(g, [[x - 24, top], [x + 24, top], [x + 22, top + 6], [x - 22, top + 6]], { fill: PAPER, color: '#a5774f', seed: s + 3, w: 1.3, corner: 0.6 });
  // books
  const books = ['#a8453c', '#3f6a8f', '#d9a441'];
  books.forEach((c, i) => {
    const y = top - 6 - i * 6;
    thing(g, rectPts(x - 16 + i * 2, y, 28 - i * 3, 6), { fill: PAPER, color: c, seed: s + 10 + i, w: 1, corner: 0.6, sketch: 0 });
  });
  // a mug
  thing(g, [[x + 13, top - 13], [x + 21, top - 13], [x + 20, top], [x + 14, top]], { fill: PAPER, color: '#f2efe8', seed: s + 20, w: 1, sketch: 0 });
  line(g, [[x + 21, top - 10], [x + 25, top - 8], [x + 21, top - 4]], { w: 0.9, seed: s + 21, pressure: EVEN, sketch: 0 });
}

function stool(g, x, S) {
  const s = S.seed + 600;
  const top = 284;
  line(g, [[x - 13, top + 4], [x - 17, 328]], { w: 1.4, seed: s, pressure: EVEN });
  line(g, [[x + 13, top + 4], [x + 17, 328]], { w: 1.4, seed: s + 1, pressure: EVEN });
  line(g, [[x - 15, 312], [x + 15, 312]], { w: 1, seed: s + 2, pressure: EVEN, sketch: 0 });
  thing(g, ellPts(x, top, 20, 5, 22), { fill: PAPER, color: '#b98a5e', seed: s + 3, w: 1.3 });
  // a speaker on it, the party is here
  const box = rectPts(x - 11, top - 30, 22, 28);
  thing(g, box, { fill: PAPER, color: '#4a4a52', seed: s + 4, w: 1.2, corner: 0.6 });
  thing(g, ellPts(x, top - 12, 6.5, 6.5, 18), { fill: '#d8d6d2', color: '#6e6e76', seed: s + 5, w: 0.9, sketch: 0 });
  thing(g, ellPts(x, top - 24, 2.6, 2.6, 12), { fill: '#d8d6d2', seed: s + 6, w: 0.8, sketch: 0 });
}

function guitar(g, x, S) {
  const s = S.seed + 700;
  const lean = 0.18;
  const cx = x + 4, cy = 300;
  g.save();
  g.translate(cx, cy);
  g.rotate(lean);
  g.translate(-cx, -cy);
  line(g, [[cx, cy - 16], [cx, cy - 92]], { w: 4.6, color: '#6b4a32', seed: s, pressure: EVEN, sketch: 0, rough: 0.2 });
  line(g, [[cx - 2.2, cy - 16], [cx - 2.2, cy - 92]], { w: 0.8, seed: s + 1, pressure: EVEN, sketch: 0 });
  line(g, [[cx + 2.2, cy - 16], [cx + 2.2, cy - 92]], { w: 0.8, seed: s + 2, pressure: EVEN, sketch: 0 });
  thing(g, rectPts(cx - 4.5, cy - 103, 9, 13), { fill: PAPER, color: '#5a3d29', seed: s + 3, w: 1, corner: 0.6, sketch: 0 });
  const outline = [];
  for (let k = 0; k < 40; k++) {
    const t = (k / 40) * TAU, yy = Math.sin(t);
    const rx = yy < -0.2 ? 11 : 15;
    outline.push([cx + Math.cos(t) * rx * (1 - 0.15 * Math.abs(Math.sin(t * 2))), cy + yy * 24 - (yy < 0 ? 4 : 0)]);
  }
  thing(g, outline, { fill: PAPER, color: '#d39a55', seed: s + 4, w: 1.4 });
  thing(g, ellPts(cx, cy - 4, 4.6, 4.6, 14), { fill: '#3a2a20', seed: s + 5, w: 0.8, sketch: 0 });
  line(g, [[cx - 6, cy + 10], [cx + 6, cy + 10]], { w: 1.6, seed: s + 6, pressure: EVEN, sketch: 0 });
  g.restore();
}

function cat(g, x, S) {
  const s = S.seed + 750;
  g.save();
  g.translate(x, 330);
  g.scale(1.45, 1.45);
  g.translate(-x, -330);
  const col = pick(['#3a3a3e', '#d9a066', '#f4efe6', '#8a8580'], hash(3, s));
  const base = 330;
  // sitting, seen from the side, tail curled round its feet
  const body = [[x - 12, base], [x - 14, base - 12], [x - 9, base - 26], [x - 2, base - 30], [x + 4, base - 26], [x + 7, base - 14], [x + 9, base]];
  thing(g, body, { fill: PAPER, color: col, seed: s, w: 1.3 });
  const headP = [[x - 7, base - 30], [x - 8, base - 40], [x - 5, base - 37], [x + 1, base - 37.5], [x + 4, base - 41], [x + 4, base - 30], [x + 1, base - 26], [x - 5, base - 26]];
  thing(g, headP, { fill: PAPER, color: col, seed: s + 1, w: 1.2, corner: 0.8 });
  const eye = col === '#3a3a3e' ? '#e8c75a' : INK;
  g.fillStyle = eye;
  g.fillRect(x - 5, base - 33, 1.6, 1.4);
  g.fillRect(x, base - 33, 1.6, 1.4);
  line(g, [[x + 9, base - 1], [x + 17, base - 3], [x + 19, base - 10], [x + 15, base - 14]], { w: 2.2, color: col === '#f4efe6' ? '#bdb5a8' : col, seed: s + 2, pressure: TAPER, sketch: 0 });
  line(g, [[x + 9, base - 1], [x + 17, base - 3], [x + 19, base - 10], [x + 15, base - 14]], { w: 0.8, seed: s + 3, pressure: TAPER, sketch: 0 });
  g.restore();
}

function shelf(g, x, S) {
  const s = S.seed + 850;
  const top = 250, bottom = 328, w = 44;
  const box = rectPts(x - w / 2, top, w, bottom - top);
  thing(g, box, { fill: PAPER, color: '#b48a62', seed: s, w: 1.4, corner: 0.6 });
  for (let k = 1; k < 3; k++) line(g, [[x - w / 2, top + k * 26], [x + w / 2, top + k * 26]], { w: 1.1, seed: s + k, pressure: EVEN, sketch: 0 });
  const r = rng(s + 9);
  for (let row = 0; row < 3; row++) {
    let bx = x - w / 2 + 3;
    while (bx < x + w / 2 - 6) {
      const bw = 3 + r() * 3, bh = 13 + r() * 9;
      if (r() < 0.15) { bx += bw + 2; continue; }
      const y0 = top + row * 26 + 25;
      thing(g, rectPts(bx, y0 - bh, bw, bh), { fill: PAPER, color: pick(['#a8453c', '#3f6a8f', '#d9a441', '#5f8a5a', '#7a5a8a', '#e0d6c4'], r()), seed: s + 20 + row * 10 + Math.round(bx), w: 0.7, corner: 0.6, sketch: 0 });
      bx += bw + 0.6;
    }
  }
  plantSmall(g, x + 10, top, s + 60);
}

function plantSmall(g, x, y, s) {
  const pot = [[x - 6, y - 10], [x + 6, y - 10], [x + 4.6, y], [x - 4.6, y]];
  thing(g, pot, { fill: PAPER, color: '#c8754e', seed: s, w: 0.9, sketch: 0 });
  for (let k = 0; k < 5; k++) {
    const a = -1.2 + k * 0.6;
    line(g, [[x, y - 10], [x + Math.sin(a) * 10, y - 10 - Math.cos(a) * 12]], { w: 0.8, seed: s + 2 + k, pressure: EVEN, sketch: 0 });
    thing(g, ellPts(x + Math.sin(a) * 11, y - 10 - Math.cos(a) * 13, 3.6, 2.2, 10, a + Math.PI / 2), { fill: PAPER, color: '#5f9a63', seed: s + 10 + k, w: 0.7, sketch: 0 });
  }
}

const PROPS = { plant, lamp, table, stool, guitar, cat, shelf };

// ---------------------------------------------------------------- the wall: calendar and family photo

const QUARTER = { q1: ['JAN', 'FEB', 'MAR'], q2: ['APR', 'MAY', 'JUN'], q3: ['JUL', 'AUG', 'SEP'], q4: ['OCT', 'NOV', 'DEC'] };

function calendar(g, value, S) {
  const s = S.seed + 800;
  const x = S.calendarLeft ? 22 : 214, y = 92, w = 64, h = 86;
  g.save();
  g.translate(x + w / 2, y);
  g.rotate(S.calendarLeft ? -0.035 : 0.03);
  g.translate(-(x + w / 2), -y);
  // nail and string
  line(g, [[x + 10, y + 4], [x + w / 2, y - 13], [x + w - 10, y + 4]], { w: 0.7, seed: s, pressure: EVEN, sketch: 0, corner: 0.5 });
  thing(g, ellPts(x + w / 2, y - 13, 1.8, 1.8, 10), { fill: '#6b655e', seed: s + 1, w: 0.6, sketch: 0 });
  // shadow, page
  g.save();
  g.globalAlpha = 0.18;
  g.fillStyle = shade(S.wall, 0.6);
  g.fill(curve(shift(rectPts(x, y, w, h), 2.4, 2.8)));
  g.restore();
  const page = rectPts(x, y, w, h);
  thing(g, page, { fill: '#fbf8f1', seed: s + 2, w: 1.2, corner: 0.6 });
  const months = QUARTER[value];
  const head = rectPts(x + 2, y + 6, w - 4, 15);
  wash(g, head, months ? '#c9463d' : '#c5c0b8', { seed: s + 3, alpha: 0.9, corner: 0.6, gran: 0.25 });
  // spiral rings
  for (let i = 0; i < 7; i++) {
    const rx = x + 6 + i * ((w - 12) / 6);
    line(g, [[rx, y - 2.5], [rx + 1.5, y + 2], [rx, y + 4.5]], { w: 0.8, seed: s + 10 + i, pressure: EVEN, sketch: 0 });
  }
  g.fillStyle = '#fff7ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const label = months ? `${months[0]}–${months[2]}` : '· · ·';
  let size = 10.5;
  g.font = `800 ${size}px "Helvetica Neue", Inter, Helvetica, Arial, sans-serif`;
  const fit = (w - 12) / Math.max(1, g.measureText(label).width);
  if (fit < 1) { size *= fit; g.font = `800 ${size}px "Helvetica Neue", Inter, Helvetica, Arial, sans-serif`; }
  g.fillText(label, x + w / 2, y + 14);
  // the grid of days, a day ringed
  const gx = x + 6, gy = y + 27, cw = (w - 12) / 7, ch = 9.4;
  g.fillStyle = INK;
  const ring = months ? (S.birthday + 4) % 35 : -1;
  for (let k = 0; k < 35; k++) {
    const cx = gx + (k % 7) * cw + cw / 2, cy = gy + Math.floor(k / 7) * ch + ch / 2;
    g.globalAlpha = k % 7 === 6 ? 0.75 : 0.42;
    g.fillStyle = k % 7 === 6 ? '#b8433b' : INK;
    g.fillRect(cx - 1.6, cy - 0.7, 3.2, 1.6);
  }
  g.globalAlpha = 1;
  if (ring >= 0) {
    const cx = gx + (ring % 7) * cw + cw / 2, cy = gy + Math.floor(ring / 7) * ch + ch / 2;
    pen(g, ellPts(cx + 0.3, cy, 5.6, 4.6, 16).concat([[cx + 6.4, cy - 2.6]]), { w: 1.3, color: '#d0352b', seed: s + 20, rough: 0.4, pressure: [[0, 0.5], [0.3, 1], [1, 0.3]] });
    // a little cake doodle in the margin
    const kx = x + w - 13, ky = y + h - 3;
    thing(g, rectPts(kx - 6, ky - 7, 12, 6), { fill: '#fbf8f1', color: '#f2a7b5', seed: s + 21, w: 0.7, sketch: 0, corner: 0.6 });
    line(g, [[kx, ky - 7], [kx, ky - 11]], { w: 0.8, seed: s + 22, pressure: EVEN, sketch: 0 });
    pen(g, ellPts(kx, ky - 12.4, 0.9, 1.5, 8), { w: 1.2, color: '#e8952f', close: true, seed: s + 23, rough: 0 });
  }
  g.restore();
}

/** Who stands in the family photo, left to right, and which one is the guest. */
const FAMILY = {
  only: { heights: [1], me: 0, pet: true },
  eldest: { heights: [1, 0.78, 0.62], me: 0 },
  middle: { heights: [1, 0.8, 0.62], me: 1 },
  youngest: { heights: [1, 0.82, 0.62], me: 2 },
};

function family(g, value, S, topColour) {
  const s = S.seed + 900;
  const x = S.calendarLeft ? 214 : 18, y = 98, w = 70, h = 62, F = 1.3;
  const fam = FAMILY[value];
  g.save();
  g.globalAlpha = 0.18;
  g.fillStyle = shade(S.wall, 0.6);
  g.fill(curve(shift(rectPts(x, y, w, h), 2.4, 2.8)));
  g.restore();
  const outer = rectPts(x, y, w, h);
  thing(g, outer, { fill: PAPER, color: S.frameRound ? '#a57a52' : '#3d3a39', seed: s, w: 1.3, corner: 0.6 });
  const inner = rectPts(x + 5, y + 5, w - 10, h - 10);
  thing(g, inner, { fill: '#f3ede0', color: '#cfdde6', seed: s + 1, w: 0.8, corner: 0.6, sketch: 0, edge: 0.2 });
  if (!fam) {
    g.restore?.();
    return;
  }
  const n = fam.heights.length + (fam.pet ? 1 : 0);
  const span = w - 18;
  const groundY = y + h - 8;
  fam.heights.forEach((k, i) => {
    const cx = x + 9 + (n === 1 ? span / 2 : (fam.pet ? span * 0.35 : (i / (n - 1)) * span));
    const tall = 26 * k * F;
    const headR = (3.3 + k * 0.6) * F;
    const me = i === fam.me;
    const bodyCol = me ? (topColour ?? '#d0352b') : pick(['#9aa5b4', '#b4a69a', '#a9b49a'], hash(i, s));
    const bw = (4.6 * k + 1) * F, bw2 = (5.2 * k + 1) * F;
    const body = [[cx - bw, groundY - tall + headR * 2 + 1.5], [cx + bw, groundY - tall + headR * 2 + 1.5], [cx + bw2, groundY - tall * 0.42], [cx - bw2, groundY - tall * 0.42]];
    thing(g, body, { fill: PAPER, color: bodyCol, seed: s + 10 + i, w: 0.8, sketch: 0, alpha: 0.95 });
    line(g, [[cx - 2.4, groundY - tall * 0.42], [cx - 2.6, groundY]], { w: 1.1, seed: s + 20 + i, pressure: EVEN, sketch: 0 });
    line(g, [[cx + 2.4, groundY - tall * 0.42], [cx + 2.6, groundY]], { w: 1.1, seed: s + 30 + i, pressure: EVEN, sketch: 0 });
    thing(g, ellPts(cx, groundY - tall + headR, headR, headR * 1.1, 12), { fill: PAPER, seed: s + 40 + i, w: 0.8, sketch: 0 });
    if (me) {
      // a heart above the guest, drawn in red pen
      const hx = cx, hy = groundY - tall - 3.6;
      pen(g, [[hx, hy + 2.6], [hx - 3, hy - 0.2], [hx - 1.5, hy - 2.4], [hx, hy - 1], [hx + 1.5, hy - 2.4], [hx + 3, hy - 0.2], [hx, hy + 2.6]], { w: 1, color: '#d0352b', seed: s + 50, rough: 0, pressure: EVEN, close: false, corner: 2 });
    }
  });
  if (fam.pet) {
    // an only child, and the dog
    const dx = x + 9 + span * 0.78, dy = groundY;
    const dog = ([[dx - 8, dy - 6], [dx + 4, dy - 7], [dx + 6, dy - 11], [dx + 9.5, dy - 10.5], [dx + 9, dy - 6], [dx + 5, dy - 3], [dx + 5, dy], [dx - 6, dy], [dx - 7, dy - 3], [dx - 10, dy - 9]]).map(([px, py]) => [dx + (px - dx) * F, dy + (py - dy) * F]);
    thing(g, dog, { fill: PAPER, color: '#c7a074', seed: s + 60, w: 0.8, sketch: 0 });
  }
}

// ---------------------------------------------------------------- the guest

/** The guest's figure lives on this skeleton; the pose moves the free arm. */
const FIG = { x: 150, headY: 104, shoulderY: 140, waistY: 212, hemY: 349, footY: 371 };

/** The head is drawn a little larger than life, the way a sketch flatters a face; this scales about the chin. */
function headSpace(g) {
  g.translate(150, 124);
  g.scale(1.16, 1.16);
  g.translate(-150, -124);
}

function hairBack(g, style, S) {
  const s = S.seed + 1000;
  const col = '#4a443e';
  if (style === 'long') {
    const p = [[132, 96], [127, 120], [126, 150], [131, 168], [150, 162], [169, 168], [174, 150], [173, 120], [168, 96]];
    wash(g, p, col, { seed: s, alpha: 0.36, gran: 0.15, edge: 0.3 });
    line(g, p.slice(0, 5), { w: 1.2, seed: s + 1, sketch: 0.2 });
    line(g, p.slice(4), { w: 1.2, seed: s + 2, sketch: 0.2 });
  }
  if (style === 'wavy') {
    const p = [[133, 98], [128, 114], [132, 126], [127, 140], [135, 150], [150, 146], [165, 150], [173, 140], [168, 126], [172, 114], [167, 98]];
    wash(g, p, col, { seed: s, alpha: 0.5, gran: 0.15, edge: 0.3 });
    line(g, p, { w: 1.1, seed: s + 3, sketch: 0.2 });
  }
  if (style === 'bob') {
    const p = [[133, 96], [130, 112], [131, 126], [140, 128], [160, 128], [169, 126], [170, 112], [167, 96]];
    wash(g, p, col, { seed: s, alpha: 0.55, gran: 0.15, edge: 0.3 });
    line(g, p, { w: 1.2, seed: s + 4, sketch: 0.2 });
  }
}

function hairFront(g, style, S) {
  const s = S.seed + 1100;
  const col = '#4a443e';
  const strands = (from, to, n, curl = 0) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const a = [lerp(from[0][0], from[1][0], t), lerp(from[0][1], from[1][1], t)];
      const b = [lerp(to[0][0], to[1][0], t), lerp(to[0][1], to[1][1], t)];
      pen(g, [a, [lerp(a[0], b[0], 0.5) + curl, lerp(a[1], b[1], 0.5)], b], { w: 0.55, alpha: 0.7, seed: s + 30 + i, pressure: TAPER, rough: 0.4 });
    }
  };
  let cap;
  if (style === 'crop' || style === 'quiff') {
    cap = style === 'quiff'
      ? [[134, 101], [134, 90], [140, 82], [151, 79], [162, 80], [167, 86], [167, 100], [164, 94], [161, 96], [158, 91], [154, 94], [150, 90], [146, 94], [142, 92], [139, 97], [136, 95]]
      : [[134, 101], [135, 90], [142, 84], [151, 83], [160, 85], [166, 91], [166, 101], [164, 95], [161, 97], [158, 93], [154, 96], [150, 92], [146, 96], [142, 94], [139, 98], [136, 96]];
  } else if (style === 'curls') {
    cap = [];
    for (let k = 0; k <= 14; k++) {
      const t = Math.PI + (k / 14) * Math.PI;
      const r = 19 + (k % 2 ? 3.2 : 0);
      cap.push([150 + Math.cos(t) * r * 0.95, 101 + Math.sin(t) * r]);
    }
    cap.push([162, 96], [150, 94], [138, 96]);
  } else {
    // long, bob, wavy, bun: a parted cap
    cap = [[134, 104], [134, 92], [140, 85], [150, 83], [160, 85], [166, 92], [166, 104], [163, 96], [155, 91], [149, 92], [141, 97]];
  }
  wash(g, cap, col, { seed: s, alpha: 0.42, gran: 0.2, edge: 0.45, corner: 0.9 });
  line(g, cap, { close: true, w: 1.2, seed: s + 1, sketch: 0.25, corner: 0.9 });
  if (style === 'curls') {
    for (let k = 0; k < 9; k++) {
      const cx = 136 + (k % 5) * 7 + (k > 4 ? 3.5 : 0), cy = k > 4 ? 90 : 84;
      pen(g, ellPts(cx, cy + (k % 2), 2.6, 2.2, 10), { w: 0.6, close: true, alpha: 0.7, seed: s + 40 + k, rough: 0.3 });
    }
  } else if (style === 'crop' || style === 'quiff') {
    strands([[138, 95], [164, 95]], [[143, 85], [161, 85]], 9, 1.5);
  } else {
    strands([[136, 98], [148, 92]], [[144, 86], [150, 84]], 4, -1);
    strands([[152, 92], [165, 98]], [[151, 84], [158, 86]], 4, 1);
  }
  if (style === 'bun') {
    const bun = ellPts(150, 78, 8, 6.5, 16);
    wash(g, bun, col, { seed: s + 5, alpha: 0.6, gran: 0.15 });
    line(g, bun, { close: true, w: 1.1, seed: s + 6, sketch: 0.2 });
    pen(g, [[144, 78], [150, 81], [156, 78]], { w: 0.6, alpha: 0.7, seed: s + 7 });
  }
}

function head(g, S, mood) {
  const s = S.seed + 1200;
  const { x, headY } = FIG;
  // neck, ears, head: skin is the paper
  const neck = [[144, 118], [156, 118], [157, 136], [143, 136]];
  solid(g, neck);
  line(g, [[144.5, 119], [143.5, 136]], { w: 1.1, seed: s, pressure: EVEN });
  line(g, [[155.5, 119], [156.5, 136]], { w: 1.1, seed: s + 1, pressure: EVEN });
  hatch(g, pathOf(neck), [140, 118, 20, 18], { seed: s + 2, tone: (_, py) => (py < 126 ? 0.75 : 0.1), dir: () => 0.5, alpha: 0.55, gap: 2.6 });
  for (const side of [-1, 1]) {
    const ex = x + side * 16.2;
    const ear = [[ex, headY - 4], [ex + side * 3.4, headY - 3], [ex + side * 3.2, headY + 3.5], [ex, headY + 5]];
    solid(g, ear);
    line(g, ear, { w: 1, seed: s + 3 + side, close: false, sketch: 0 });
  }
  const face = [];
  for (let k = 0; k < 34; k++) {
    const t = (k / 34) * TAU;
    const c = Math.cos(t), si = Math.sin(t);
    const rx = 16.4 * (si > 0 ? 1 - 0.22 * si * si : 1);
    face.push([x + c * rx, headY + si * (si > 0 ? 19.5 : 20)]);
  }
  solid(g, face);
  line(g, face, { close: true, w: 1.5, seed: s + 6, sketch: 0.3 });
  // a soft shadow on the far cheek and a little colour in both
  hatch(g, pathOf(face), [x - 17, headY - 20, 34, 40], { seed: s + 7, tone: (px, py) => (px > x + 9 && py > headY - 6 ? 0.55 : 0), dir: () => 1.25, alpha: 0.45, gap: 2.6, len: 5 });
  for (const side of [-1, 1]) {
    g.save();
    g.globalCompositeOperation = 'multiply';
    const gr = g.createRadialGradient(x + side * 9, headY + 7, 0, x + side * 9, headY + 7, 5.5);
    gr.addColorStop(0, 'rgba(232,128,120,0.32)');
    gr.addColorStop(1, 'rgba(232,128,120,0)');
    g.fillStyle = gr;
    g.fillRect(x + side * 9 - 6, headY + 1, 12, 12);
    g.restore();
  }
  if (mood.mystery) {
    // nobody yet: the face is shaded out, graphite over and over
    hatch(g, pathOf(face), [x - 17, headY - 20, 34, 40], { seed: s + 30, tone: () => 0.95, dir: () => 0.9, alpha: 0.75, gap: 1.8, len: 6 });
    hatch(g, pathOf(face), [x - 17, headY - 20, 34, 40], { seed: s + 31, tone: () => 0.8, dir: () => 2.3, alpha: 0.6, gap: 2, len: 6 });
    return;
  }
  // features
  const eyeY = headY + 1.5;
  for (const side of [-1, 1]) {
    const ex = x + side * 6.3;
    if (mood.smile && !mood.glasses) {
      pen(g, [[ex - 2.6, eyeY + 0.6], [ex, eyeY - 1.4], [ex + 2.6, eyeY + 0.6]], { w: 1.2, seed: s + 10 + side, pressure: TAPER, rough: 0.1 });
    } else {
      g.fillStyle = INK;
      g.beginPath();
      g.ellipse(ex, eyeY, 1.35, 1.75, 0, 0, TAU);
      g.fill();
      g.fillStyle = PAPER;
      g.beginPath();
      g.arc(ex + 0.45, eyeY - 0.6, 0.45, 0, TAU);
      g.fill();
    }
    pen(g, [[ex - 3.2, eyeY - 5.2 + side * 0.2], [ex, eyeY - 6.4], [ex + 3.2, eyeY - 5.6 - side * 0.2]], { w: 1.1, seed: s + 14 + side, pressure: TAPER, rough: 0.1 });
    if (mood.look === 'fem') pen(g, [[ex + side * 2.2, eyeY - 0.6], [ex + side * 3.8, eyeY - 2]], { w: 0.8, seed: s + 24 + side, pressure: TAPER, rough: 0 });
  }
  if (mood.beard) {
    // a short beard, hatched along the jaw
    const jaw = [];
    for (let k = 0; k <= 16; k++) {
      const t = Math.PI * (0.06 + (k / 16) * 0.88);
      jaw.push([x + Math.cos(t) * 16 * (1 - 0.22 * Math.sin(t) ** 2), headY + Math.sin(t) * 19.5]);
    }
    const inner = jaw.map(([px, py]) => [x + (px - x) * 0.72, headY + 9 + (py - headY - 9) * 0.55]).reverse();
    const shape = pathOf(smoothPts([...jaw, ...inner], true), true);
    hatch(g, shape, [x - 17, headY, 34, 22], { seed: s + 26, tone: () => 0.9, dir: () => 1.4, alpha: 0.6, gap: 1.8, len: 3.5, width: 0.6, color: '#4a443e' });
  }
  pen(g, [[x + 0.6, headY + 1], [x - 1.2, headY + 8.2], [x + 1.6, headY + 8.8]], { w: 0.9, seed: s + 18, pressure: TAPER, rough: 0.1, corner: 0.8 });
  if (mood.smile) pen(g, [[x - 5, headY + 12.4], [x - 1, headY + 14.8], [x + 5, headY + 12]], { w: 1.2, seed: s + 19, pressure: TAPER, rough: 0.1 });
  else pen(g, [[x - 3.5, headY + 13.4], [x + 3.5, headY + 13.2]], { w: 1.1, seed: s + 19, pressure: TAPER, rough: 0.1 });
}

function glasses(g, value, S) {
  if (value !== 'yes') return;
  const s = S.seed + 1300;
  const { x, headY } = FIG;
  const y = headY + 1.2;
  const lens = S.frameRound
    ? (cx) => ellPts(cx, y, 5.4, 4.8, 18)
    : (cx) => [[cx - 5.6, y - 4], [cx + 5.6, y - 4], [cx + 5.4, y + 3], [cx + 3, y + 4.6], [cx - 3, y + 4.6], [cx - 5.4, y + 3]];
  for (const side of [-1, 1]) {
    const l = lens(x + side * 6.8);
    wash(g, l, '#cfe3f2', { seed: s + side, alpha: 0.55, gran: 0, edge: 0 });
    pen(g, l, { w: 1.5, close: true, seed: s + 2 + side, rough: 0.15, corner: 0.7 });
    pen(g, [[x + side * 1.6 + side * 4.2, y - 2.6], [x + side * 1.6 + side * 6.2, y - 3.4]], { w: 0.7, color: '#ffffff', seed: s + 4 + side, alpha: 0.9, rough: 0 });
    pen(g, [[x + side * 12.3, y - 2], [x + side * 16.4, y - 3]], { w: 1.3, seed: s + 6 + side, pressure: EVEN, rough: 0 });
  }
  pen(g, [[x - 1.4, y - 1.6], [x, y - 2.6], [x + 1.4, y - 1.6]], { w: 1.3, seed: s + 9, pressure: EVEN, rough: 0 });
}

// the shirt, in its colour

const TOPS = {
  black: '#3d3f47',
  white: '#fbfaf6',
  grey: '#a3a7ae',
  blue: '#3f62a3',
  red: '#df5a70',
  green: '#4f9c64',
  yellow: '#f0b043',
  print: '#b9d3e6',
};
export const topColour = (value) => (value && value !== 'print' ? TOPS[value] : value === 'print' ? '#e0784f' : null);

/** The cut: a softer shoulder and a waist for 'fem', a squarer shoulder for 'masc'. */
const CUT = {
  fem: (y) => (y < 150 ? 0.93 : y < 205 ? 0.93 + (Math.abs(y - 190) / 40) * 0.02 : 1),
  masc: (y) => (y < 150 ? 1.03 : 1),
  open: () => 1,
};

function shirtShape(S) {
  const hip = S.pose === 'hip';
  const k = CUT[S.look] ?? CUT.open;
  const cut = (pts) => pts.map(([x, y]) => [150 + (x - 150) * k(y), y]);
  return {
    body: cut([
      [139, 133], [150, 141], [161, 133], [178, 137], [187, 141],
      [197, 167], [184, 174], [180, 162], [181, 188], [184, 216],
      [150, 219], [116, 216], [119, 188], [120, 162], [116, 174],
      hip ? [101, 165] : [103, 167], [113, 141], [122, 137],
    ]),
    // where each sleeve ends, for the arms
    sleeveL: cut(hip ? [[101, 165], [116, 174]] : [[103, 167], [116, 174]]),
    sleeveR: cut([[197, 167], [184, 174]]),
  };
}

function shirt(g, value, S) {
  const s = S.seed + 1400;
  const { body } = shirtShape(S);
  const col = TOPS[value];
  if (!col) {
    // not answered yet: the shirt is only a dashed pencil guide, so nobody reads it as white
    g.save();
    g.setLineDash([3.2, 2.6]);
    g.strokeStyle = INK;
    g.globalAlpha = 0.5;
    g.lineWidth = 0.9;
    g.lineJoin = 'round';
    g.stroke(curve(body, true, 0.6));
    g.restore();
    return;
  }
  solid(g, body, PAPER, true, 0.6);
  // a white shirt is the paper itself; its folds and shadow do the work
  if (value !== 'white') wash(g, body, col, { seed: s, alpha: 0.92, gran: 0.2, edge: 0.45, corner: 0.6 });
  if (value === 'print') {
    // a loose floral print, clipped to the shirt
    g.save();
    g.clip(curve(body, true, 0.6));
    const r = rng(s + 5);
    for (let k = 0; k < 30; k++) {
      const px = 100 + r() * 100, py = 132 + r() * 90, rr = 3 + r() * 2.4;
      const c = pick(['#e0784f', '#d8445c', '#f0b043', '#e0784f'], r());
      wash(g, ellPts(px, py, rr, rr * 0.8, 10, r() * 3), c, { seed: s + 10 + k, alpha: 0.85, gran: 0.1, edge: 0.25, dx: 0, dy: 0, amp: 0.4 });
      if (k % 2) pen(g, [[px + rr, py], [px + rr + 3, py - 2.5]], { w: 0.8, color: '#3d7a4c', seed: s + 50 + k, pressure: TAPER, rough: 0.2 });
    }
    g.restore();
  }
  // form: shadow down the right side and under the chest, folds at the waist
  const dark = value === 'black' ? '#15161a' : INK;
  hatch(g, curve(body, true, 0.6), [100, 130, 100, 92], {
    seed: s + 2, color: dark, gap: 2.8, len: 7, width: 0.55,
    alpha: value === 'black' ? 0.55 : 0.45,
    tone: (px, py) => (px > 168 ? 0.65 : 0) + (py > 200 ? 0.25 : 0) + (px > 186 && py < 175 ? 0.3 : 0),
    dir: (px) => 1.2 + (px - 150) * 0.004,
  });
  line(g, body, { close: true, w: 1.6, seed: s + 3, corner: 0.6, sketch: 0.3 });
  // collar and folds
  pen(g, [[140, 134], [150, 142.5], [160, 134]], { w: 1.1, seed: s + 4, pressure: TAPER, rough: 0.2 });
  pen(g, [[121, 165], [123, 186]], { w: 0.7, alpha: 0.7, seed: s + 5 });
  pen(g, [[179, 165], [177, 184]], { w: 0.7, alpha: 0.7, seed: s + 6 });
  pen(g, [[138, 208], [150, 212], [164, 207]], { w: 0.6, alpha: 0.55, seed: s + 7 });
}

function skirt(g, S) {
  const s = S.seed + 1550;
  const { color } = S.trousers;
  // bare legs below the hem, then the skirt over them
  for (const [ax, i] of [[132, 0], [168, 1]]) {
    const leg = [[ax - 6.4, 286], [ax + 6.4, 286], [ax + 5, 350], [ax - 5, 350]];
    solid(g, leg);
    line(g, [[ax - 6.4, 288], [ax - 5.6, 322], [ax - 5, 350]], { w: 1.1, seed: s + i, pressure: EVEN, sketch: 0.2 });
    line(g, [[ax + 6.4, 288], [ax + 5.6, 322], [ax + 5, 350]], { w: 1.1, seed: s + 2 + i, pressure: EVEN, sketch: 0.2 });
    pen(g, [[ax - 2, 318], [ax + 1.6, 319.5]], { w: 0.6, alpha: 0.5, seed: s + 4 + i });
  }
  const L = [[122, 210], [178, 210], [181, 236], [190, 296], [170, 300], [150, 302], [130, 300], [110, 296], [119, 236]];
  solid(g, L, PAPER, true, 0.9);
  wash(g, L, color, { seed: s + 6, alpha: 0.88, gran: 0.25, edge: 0.4 });
  hatch(g, curve(L, true, 0.9), [108, 208, 84, 96], {
    seed: s + 7, gap: 3, len: 8, width: 0.55, alpha: 0.42,
    tone: (px) => (px > 170 ? 0.6 : 0.03), dir: () => 1.5,
  });
  line(g, L, { close: true, w: 1.5, seed: s + 8, corner: 0.9, sketch: 0.3 });
  // a waistband and the folds of an A-line
  pen(g, [[120, 218], [150, 220], [180, 218]], { w: 0.8, alpha: 0.7, seed: s + 9 });
  for (const [x0, x1] of [[136, 128], [150, 150], [164, 172]]) pen(g, [[x0, 238], [x1, 298]], { w: 0.7, alpha: 0.55, seed: s + 10 + x0 });
}

function trousers(g, S) {
  if (S.skirt) { skirt(g, S); return; }
  const s = S.seed + 1500;
  const { color } = S.trousers;
  const L = [[119, 212], [181, 212], [182, 248], [180, 300], [178, 349], [158, 350], [151, 252], [149, 252], [142, 350], [122, 349], [120, 300], [118, 248]];
  solid(g, L, PAPER, true, 0.7);
  wash(g, L, color, { seed: s, alpha: 0.88, gran: 0.25, edge: 0.4, corner: 0.7 });
  hatch(g, curve(L, true, 0.7), [116, 210, 70, 142], {
    seed: s + 1, gap: 3, len: 8, width: 0.55, alpha: 0.42,
    tone: (px, py) => (px > 166 || (px > 140 && px < 150 && py > 260) ? 0.6 : 0.03),
    dir: () => 1.45,
  });
  line(g, L, { close: true, w: 1.5, seed: s + 2, corner: 0.7, sketch: 0.3 });
  // inseam, pocket, a crease at the knee, rolled cuffs
  pen(g, [[150, 216], [150, 250]], { w: 0.8, alpha: 0.8, seed: s + 3 });
  pen(g, [[122, 222], [131, 228]], { w: 0.7, alpha: 0.7, seed: s + 4 });
  pen(g, [[178, 222], [169, 228]], { w: 0.7, alpha: 0.7, seed: s + 5 });
  pen(g, [[128, 290], [135, 294], [133, 300]], { w: 0.6, alpha: 0.5, seed: s + 6 });
  pen(g, [[171, 288], [165, 293], [167, 299]], { w: 0.6, alpha: 0.5, seed: s + 7 });
  pen(g, [[122, 342], [142, 343]], { w: 0.8, alpha: 0.7, seed: s + 8, pressure: EVEN });
  pen(g, [[158, 343], [178, 342]], { w: 0.8, alpha: 0.7, seed: s + 9, pressure: EVEN });
}

/** Ankles and bare feet, under any shoe. */
function legs(g, S, bare) {
  const s = S.seed + 1600;
  for (const [ax, i] of [[132, 0], [168, 1]]) {
    const ankle = [[ax - 5, 348], [ax + 5, 348], [ax + 4.6, 362], [ax - 4.6, 362]];
    solid(g, ankle);
    line(g, [[ax - 5, 349], [ax - 4.6, 362]], { w: 1, seed: s + i, pressure: EVEN, sketch: 0 });
    line(g, [[ax + 5, 349], [ax + 4.6, 362]], { w: 1, seed: s + 2 + i, pressure: EVEN, sketch: 0 });
    if (bare) {
      // bare feet before the shoes are answered: pencil only
      const d = i ? 1 : -1;
      const foot = [[ax - d * 5, 360], [ax - d * 6, 370], [ax + d * 18, 371], [ax + d * 20, 367], [ax + d * 6, 362]];
      solid(g, foot);
      pen(g, foot, { w: 0.8, close: true, alpha: 0.55, seed: s + 4 + i, pressure: EVEN });
    }
  }
}

// shoes, side-on: drawn pointing right in local units, ankle at (0,0), sole at y=21

const SHOES = {
  sneakers: {
    upper: [[-6, 0], [5, 0], [7, 7], [16, 10], [24, 13], [27, 17], [26, 19], [-9, 19], [-9, 9]],
    sole: [[-9.5, 17], [27.5, 17], [27, 21.5], [-9.5, 21.5]],
    color: '#f7f6f2', soleColor: '#ffffff', accent: '#5b8fc7',
    details(g, s) {
      for (let k = 0; k < 3; k++) pen(g, [[6 + k * 3.2, 4 + k * 1.6], [10 + k * 3.2, 6.6 + k * 1.6]], { w: 0.8, seed: s + 10 + k, pressure: EVEN, rough: 0 });
      wash(g, [[-3, 13], [8, 9], [18, 12], [8, 13.5]], '#5b8fc7', { seed: s + 20, alpha: 0.9, gran: 0.1, edge: 0.2, dx: 0, dy: 0, amp: 0.3 });
      pen(g, [[-8, 19.2], [26.5, 19.2]], { w: 0.6, alpha: 0.6, seed: s + 21, pressure: EVEN, rough: 0 });
    },
  },
  shoes: {
    upper: [[-6, 3], [5, 3], [8, 10], [18, 13], [26, 16], [27, 19], [-8, 19], [-8, 10]],
    sole: [[-8.5, 18.5], [27.5, 18.5], [27, 21], [-1, 21], [-1, 22], [-8.5, 22]],
    color: '#4a2f22', soleColor: '#2a1d16',
    details(g, s) {
      pen(g, [[2, 9.6], [10, 11.4]], { w: 0.6, color: '#f3e2cf', alpha: 0.8, seed: s + 10, pressure: EVEN, rough: 0 });
      pen(g, [[14, 13.6], [22, 15.6]], { w: 1.1, color: '#ffffff', alpha: 0.75, seed: s + 11, pressure: TAPER, rough: 0 });
      pen(g, [[7, 10.5], [10, 19]], { w: 0.6, alpha: 0.7, seed: s + 12, pressure: EVEN, rough: 0 });
    },
  },
  boots: {
    upper: [[-7, -14], [6, -14], [6.5, 4], [9, 10], [19, 13], [26, 16], [27, 19], [-8, 19], [-8, 0]],
    sole: [[-8.5, 18.5], [27.5, 18.5], [27, 21.5], [0, 21.5], [-1, 23.5], [-8.5, 23.5]],
    color: '#a86a3b', soleColor: '#3a2618',
    details(g, s) {
      pen(g, [[-7, -10.5], [6.2, -10.5]], { w: 0.7, alpha: 0.7, seed: s + 10, pressure: EVEN, rough: 0 });
      pen(g, [[6.2, -6], [7.2, 8]], { w: 0.6, alpha: 0.6, seed: s + 11, pressure: EVEN, rough: 0 });
      pen(g, [[15, 13], [23, 16]], { w: 1, color: '#ffffff', alpha: 0.6, seed: s + 12, pressure: TAPER, rough: 0 });
    },
  },
  sandals: {
    foot: [[-5, 0], [5, 0], [6, 8], [15, 13], [24, 15], [27, 18], [26, 19.5], [-7, 19.5], [-7, 10]],
    upper: [[4, 9], [15, 12.5], [16, 19], [3, 19]],
    sole: [[-8.5, 19], [28, 19], [27.5, 21.5], [-8.5, 21.5]],
    color: '#d9774e', soleColor: '#8c6a4f',
    details(g, s) {
      for (let k = 0; k < 4; k++) pen(g, [[21 + k * 1.6, 15.5 + k * 0.35], [21.6 + k * 1.6, 18.6]], { w: 0.5, alpha: 0.6, seed: s + 10 + k, pressure: EVEN, rough: 0 });
    },
  },
  heels: {
    foot: [[-5, -1], [5, -1], [6, 4], [12, 10], [21, 15], [27, 18.5], [24, 20], [12, 16], [2, 12], [-5, 9]],
    upper: [[-6, 2], [-2, 3], [3, 7], [10, 12], [20, 15.5], [27, 18.5], [25, 20.2], [13, 17.2], [2, 13.5], [-6, 12]],
    sole: [[-6, 11.5], [-2.4, 12.4], [-3.4, 22], [-5.4, 22]],
    color: '#c3283b', soleColor: '#3a1418',
    details(g, s) {
      pen(g, [[10, 13.6], [19, 16.6]], { w: 0.9, color: '#ffffff', alpha: 0.7, seed: s + 10, pressure: TAPER, rough: 0 });
    },
  },
};

function shoes(g, value, S) {
  const kind = SHOES[value];
  if (!kind) return;
  const s = S.seed + 1700;
  for (const [ax, d, i] of [[132, -1, 0], [168, 1, 1]]) {
    g.save();
    g.translate(ax, 350);
    g.scale(d * 0.95, 0.95);
    if (kind.foot) {
      solid(g, kind.foot);
      line(g, kind.foot, { close: true, w: 1, seed: s + i, sketch: 0, corner: 0.9 });
    }
    thing(g, kind.sole, { fill: PAPER, color: kind.soleColor, seed: s + 4 + i, w: 1.1, corner: 0.6, sketch: 0, alpha: 0.95 });
    thing(g, kind.upper, { fill: PAPER, color: value === 'sneakers' ? null : kind.color, seed: s + 8 + i, w: 1.35, corner: 0.9, sketch: 0.2, alpha: 0.95 });
    if (value === 'sneakers') wash(g, kind.upper, '#e9e6de', { seed: s + 12 + i, alpha: 0.5, gran: 0.1, edge: 0.4 });
    hatch(g, curve(kind.upper, true, 0.9), [-10, -16, 40, 38], { seed: s + 14 + i, gap: 2.4, len: 4, width: 0.45, alpha: 0.4, tone: (_, py) => (py > 12 ? 0.55 : 0.05), dir: () => 0.2 });
    kind.details(g, s + 20 + i * 40);
    g.restore();
  }
}

// arms and the drink

function arm(g, pts, s) {
  // an arm is a soft tube of paper with a tapered line down each side
  const L = pts.map(([x, y, w]) => [x, y, w]);
  const left = [], right = [];
  for (let i = 0; i < L.length; i++) {
    const a = L[Math.max(0, i - 1)], b = L[Math.min(L.length - 1, i + 1)];
    let nx = a[1] - b[1], ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    left.push([L[i][0] + nx * L[i][2], L[i][1] + ny * L[i][2]]);
    right.push([L[i][0] - nx * L[i][2], L[i][1] - ny * L[i][2]]);
  }
  solid(g, [...left, ...right.slice().reverse()], PAPER, true, 1.4);
  line(g, left, { w: 1.3, seed: s, sketch: 0.2 });
  line(g, right, { w: 1.3, seed: s + 1, sketch: 0.2 });
  return { left, right };
}

function hand(g, x, y, s, { open = false, rot = 0 } = {}) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(1.3, 1.3);
  const p = open
    ? [[-4.2, -3], [4.2, -3], [4.6, 3], [3.4, 7], [0, 8], [-3.4, 7], [-4.6, 2]]
    : [[-4.4, -3.4], [4.4, -3.4], [5, 2.6], [2.8, 5.4], [-2.8, 5.4], [-5, 2.6]];
  solid(g, p);
  line(g, p, { close: true, w: 1.1, seed: s, sketch: 0 });
  if (!open) for (let k = 0; k < 3; k++) pen(g, [[-2.4 + k * 2.4, 1.4], [-2.2 + k * 2.4, 4.6]], { w: 0.5, alpha: 0.7, seed: s + 3 + k, pressure: EVEN, rough: 0 });
  g.restore();
}

function freeArm(g, S) {
  const s = S.seed + 1800;
  const { sleeveL } = shirtShape(S);
  const sx = (sleeveL[0][0] + sleeveL[1][0]) / 2, sy = (sleeveL[0][1] + sleeveL[1][1]) / 2;
  if (S.pose === 'hip') {
    arm(g, [[sx, sy - 1, 6.6], [99, 186, 5.6], [103, 196, 5.2], [114, 205, 4.4]], s);
    hand(g, 119, 207, s + 4, { rot: -0.9 });
  } else {
    arm(g, [[sx, sy - 1, 6.6], [107, 196, 5.6], [108, 220, 4.6], [109.5, 230, 4.2]], s);
    hand(g, 110, 236, s + 4, { open: true, rot: 0.05 });
  }
}

/** The drinks, drawn at the hand: (0,0) is where the fingers close around the glass. */
const DRINKS = {
  beer(g, s) {
    const glass = [[-6.4, -26], [6.4, -26], [5, 2], [-5, 2]];
    solid(g, glass, '#fbf7ec');
    wash(g, [[-6, -20], [6, -20], [4.8, 1.6], [-4.8, 1.6]], '#e9a93a', { seed: s, alpha: 0.95, gran: 0.25, edge: 0.4, dx: 0, dy: 0, amp: 0.3 });
    thing(g, [[-6.8, -28.5], [-3, -30], [1, -29], [5, -30.2], [6.8, -28.2], [6.4, -20], [-6.2, -20]], { fill: '#fffdf6', seed: s + 1, w: 0.8, sketch: 0 });
    for (let k = 0; k < 6; k++) pen(g, ellPts(-2.5 + (k % 3) * 2.4, -14 + Math.floor(k / 3) * 7, 0.6, 0.6, 6), { w: 0.5, close: true, color: '#fff3d6', seed: s + 5 + k, rough: 0 });
    line(g, glass, { close: true, w: 1.1, seed: s + 2, sketch: 0, corner: 0.6 });
    pen(g, [[-4.2, -18], [-3.4, -2]], { w: 0.9, color: '#ffffff', alpha: 0.8, seed: s + 3, pressure: TAPER, rough: 0 });
  },
  wine(g, s) {
    const bowl = [[-7, -30], [7, -30], [7.5, -22], [4.5, -15.5], [0, -14], [-4.5, -15.5], [-7.5, -22]];
    solid(g, bowl, '#fbf7ec');
    wash(g, [[-7.2, -23.5], [7.2, -23.5], [4.4, -16], [0, -14.6], [-4.4, -16]], '#9c2238', { seed: s, alpha: 0.95, gran: 0.25, edge: 0.4, dx: 0, dy: 0, amp: 0.3 });
    line(g, bowl, { close: true, w: 1.1, seed: s + 1, sketch: 0 });
    line(g, [[0, -14], [0, 6]], { w: 1, seed: s + 2, pressure: EVEN, sketch: 0 });
    pen(g, ellPts(0, 6.5, 5.5, 1.3, 12), { w: 0.9, close: true, seed: s + 3, rough: 0 });
    pen(g, [[-5, -28], [-5.4, -21]], { w: 0.9, color: '#ffffff', alpha: 0.85, seed: s + 4, pressure: TAPER, rough: 0 });
  },
  clear(g, s) {
    const glass = [[-5.6, -30], [5.6, -30], [5.4, 3], [-5.4, 3]];
    solid(g, glass, '#fbfcfa');
    wash(g, [[-5.2, -24], [5.2, -24], [5, 2.6], [-5, 2.6]], '#cfe6ea', { seed: s, alpha: 0.9, gran: 0.15, edge: 0.4, dx: 0, dy: 0, amp: 0.3 });
    for (let k = 0; k < 3; k++) pen(g, rectPts(-3.4 + (k % 2) * 2.4, -22 + k * 6, 4, 4).map(([x, y]) => [x, y]), { w: 0.6, close: true, alpha: 0.7, seed: s + 5 + k, rough: 0.2, corner: 0.5 });
    // a lime on the rim
    thing(g, [[2, -30], [8.5, -36], [10.5, -30.5]], { fill: '#d7ec9b', color: '#8cc14a', seed: s + 9, w: 0.8, sketch: 0 });
    line(g, glass, { close: true, w: 1.1, seed: s + 1, sketch: 0, corner: 0.6 });
    pen(g, [[-3.6, -27], [-3.4, -4]], { w: 0.9, color: '#ffffff', alpha: 0.9, seed: s + 3, pressure: TAPER, rough: 0 });
  },
  brown(g, s) {
    const glass = [[-7.4, -14], [7.4, -14], [6.8, 3], [-6.8, 3]];
    solid(g, glass, '#fbf7ec');
    wash(g, [[-7, -7.5], [7, -7.5], [6.6, 2.6], [-6.6, 2.6]], '#b8692a', { seed: s, alpha: 0.95, gran: 0.3, edge: 0.45, dx: 0, dy: 0, amp: 0.3 });
    thing(g, rectPts(-3.5, -10.5, 6.6, 6.6), { fill: '#f4f6f2', seed: s + 2, w: 0.7, sketch: 0, corner: 0.5, color: '#d9e9ee', alpha: 0.6 });
    line(g, glass, { close: true, w: 1.25, seed: s + 1, sketch: 0, corner: 0.6 });
    pen(g, [[-7, 1.2], [7, 1.2]], { w: 1.4, alpha: 0.35, seed: s + 4, pressure: EVEN, rough: 0 });
    pen(g, [[-5.4, -12], [-5, -1]], { w: 0.9, color: '#ffffff', alpha: 0.85, seed: s + 3, pressure: TAPER, rough: 0 });
  },
  cocktail(g, s) {
    const bowl = [[-11, -28], [11, -28], [0, -14]];
    solid(g, bowl, '#fbf7ec');
    wash(g, [[-9, -26], [9, -26], [0, -15.2]], '#ef6f8e', { seed: s, alpha: 0.95, gran: 0.25, edge: 0.4, dx: 0, dy: 0, amp: 0.3 });
    line(g, bowl, { close: true, w: 1.1, seed: s + 1, sketch: 0, corner: 0.6 });
    line(g, [[0, -14], [0, 6]], { w: 1, seed: s + 2, pressure: EVEN, sketch: 0 });
    pen(g, ellPts(0, 6.5, 5.5, 1.3, 12), { w: 0.9, close: true, seed: s + 3, rough: 0 });
    // a cherry on a pick, and a tiny umbrella
    line(g, [[-2, -22], [5, -35]], { w: 0.7, seed: s + 4, pressure: EVEN, sketch: 0 });
    thing(g, ellPts(-1.4, -21.4, 2.6, 2.6, 10), { fill: '#d8263c', seed: s + 5, w: 0.7, sketch: 0 });
    thing(g, [[0, -36], [6.5, -40], [12, -35.5], [6, -35]], { fill: '#f5c64e', color: '#f0a43a', seed: s + 6, w: 0.7, sketch: 0 });
  },
  zero(g, s) {
    const glass = [[-5.6, -30], [5.6, -30], [5.2, 3], [-5.2, 3]];
    solid(g, glass, '#fbf7ec');
    wash(g, [[-5.2, -25], [5.2, -25], [5, 2.6], [-5, 2.6]], '#f39a3b', { seed: s, alpha: 0.9, gran: 0.2, edge: 0.4, dx: 0, dy: 0, amp: 0.3 });
    for (let k = 0; k < 7; k++) pen(g, ellPts(-2.6 + (k % 3) * 2.5, -20 + Math.floor(k / 3) * 7 + (k % 2), 0.6, 0.6, 6), { w: 0.5, close: true, color: '#fff3d6', seed: s + 5 + k, rough: 0 });
    // a striped straw and a slice of orange
    line(g, [[1.6, -22], [6, -40]], { w: 1.6, color: '#ffffff', seed: s + 12, pressure: EVEN, sketch: 0, rough: 0 });
    pen(g, [[1.6, -22], [6, -40]], { w: 0.5, seed: s + 13, pressure: EVEN, rough: 0 });
    pen(g, [[3.4, -29], [4.2, -32.4]], { w: 1.4, color: '#d0352b', seed: s + 14, pressure: EVEN, rough: 0 });
    thing(g, ellPts(-5.6, -30.6, 4.4, 4.4, 12), { fill: '#fde3b0', color: '#f3a13b', seed: s + 15, w: 0.7, sketch: 0 });
    line(g, glass, { close: true, w: 1.1, seed: s + 1, sketch: 0, corner: 0.6 });
    pen(g, [[-3.6, -27], [-3.4, -4]], { w: 0.9, color: '#ffffff', alpha: 0.85, seed: s + 3, pressure: TAPER, rough: 0 });
  },
};

function drinkArm(g, value, S) {
  const s = S.seed + 1900;
  const { sleeveR } = shirtShape(S);
  const sx = (sleeveR[0][0] + sleeveR[1][0]) / 2, sy = (sleeveR[0][1] + sleeveR[1][1]) / 2;
  const draw = DRINKS[value];
  if (!draw) {
    arm(g, [[sx, sy - 1, 6.6], [193, 196, 5.6], [192, 220, 4.6], [190.5, 230, 4.2]], s);
    hand(g, 190, 236, s + 4, { open: true, rot: -0.05 });
    return;
  }
  // elbow bent, the glass held up by the chest
  arm(g, [[sx, sy - 1, 6.6], [195, 184, 5.8], [196, 194, 5.4], [185, 196.5, 4.8], [176, 194, 4.4]], s);
  g.save();
  g.translate(172, 192);
  draw(g, s + 10);
  g.restore();
  // the fingers wrap the front of the glass
  const fingers = [[166.4, 188.6], [173, 187.4], [177.6, 189.6], [177, 196], [170, 197.4], [166, 195]];
  solid(g, fingers);
  line(g, fingers, { close: true, w: 1.1, seed: s + 20, sketch: 0 });
  for (let k = 0; k < 2; k++) pen(g, [[167.5, 191 + k * 2.6], [175.5, 190.4 + k * 2.6]], { w: 0.5, alpha: 0.7, seed: s + 21 + k, pressure: EVEN, rough: 0 });
}

function floorShadow(g, S) {
  const s = S.seed + 2000;
  const p = ellPts(152, 371, 44, 6.5, 28);
  hatch(g, pathOf(p), [106, 362, 92, 16], { seed: s, gap: 2.2, len: 6, width: 0.6, alpha: 0.55, tone: (px, py) => 0.95 - Math.hypot((px - 152) / 44, (py - 371) / 6.5) * 0.8, dir: () => 0.1 });
}

/** A soft second self on the wall behind them: light comes from the left. */
function wallShadow(g, S) {
  g.save();
  g.beginPath();
  g.rect(0, 0, ART_W, FLOOR_Y - 9);
  g.clip();
  g.translate(13, -3);
  g.globalCompositeOperation = 'multiply';
  g.globalAlpha = 0.13;
  g.fillStyle = shade(S.wall, 0.55);
  g.fill(curve(ellPts(150, 102, 21, 25, 20)));
  g.fill(curve(shirtShape(S).body, true, 0.6));
  g.fill(curve([[119, 212], [181, 212], [180, 300], [120, 300]], true, 0.6));
  g.restore();
}

// ---------------------------------------------------------------- layers and the reveal

/** Each answer owns one layer, so Setup can draw just that answer on as it lands. */
export const LAYERS = ['season', 'siblings', 'top', 'shoes', 'drink', 'glasses'];
const BOX = {
  season: (S) => (S.calendarLeft ? [10, 70, 90, 120] : [200, 70, 96, 120]),
  siblings: (S) => (S.calendarLeft ? [206, 86, 90, 84] : [8, 86, 90, 84]),
  top: () => [96, 126, 108, 98],
  shoes: () => [96, 330, 108, 50],
  drink: () => [150, 140, 60, 104],
  glasses: () => [122, 86, 56, 26],
};

function drawLayer(g, id, traits, S) {
  if (id === 'season') { if (traits.season) calendar(g, traits.season, S); return; }
  if (id === 'siblings') { family(g, traits.siblings, S, topColour(traits.top)); return; }
  if (id === 'top') { shirt(g, traits.top, S); return; }
  if (id === 'shoes') { shoes(g, traits.shoes, S); return; }
  if (id === 'drink') { drinkArm(g, traits.drink, S); return; }
  if (id === 'glasses') { g.save(); headSpace(g); glasses(g, traits.glasses, S); g.restore(); }
}

let scratch = null;
function layerCanvas(target) {
  const w = target.canvas.width, h = target.canvas.height;
  if (!scratch || typeof document === 'undefined') {
    scratch = [0, 1].map(() => document.createElement('canvas'));
  }
  for (const c of scratch) {
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  }
  return scratch;
}

/**
 * A layer brushed on: the new drawing shows through a zigzag of broad brush
 * strokes laid top to bottom, the way you'd colour a shape in, while the old
 * one fades under it.
 */
function brushIn(g, id, traits, prevTraits, S, t) {
  const [a, m] = layerCanvas(g);
  const ga = a.getContext('2d'), gm = m.getContext('2d');
  const T = g.getTransform();
  if (prevTraits && t < 1) {
    g.save();
    ga.setTransform(1, 0, 0, 1, 0, 0);
    ga.clearRect(0, 0, a.width, a.height);
    ga.setTransform(T);
    drawLayer(ga, id, prevTraits, S);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1 - t;
    g.drawImage(a, 0, 0);
    g.restore();
  }
  if (t <= 0) return;
  ga.setTransform(1, 0, 0, 1, 0, 0);
  ga.clearRect(0, 0, a.width, a.height);
  ga.setTransform(T);
  drawLayer(ga, id, traits, S);
  gm.setTransform(1, 0, 0, 1, 0, 0);
  gm.clearRect(0, 0, m.width, m.height);
  gm.setTransform(T);
  const [bx, by, bw, bh] = BOX[id](S);
  const rows = Math.max(3, Math.round(bh / 9));
  const zig = [];
  for (let k = 0; k <= rows; k++) {
    const y = by - 4 + (k / rows) * (bh + 8);
    zig.push(k % 2 ? [bx + bw + 6, y] : [bx - 6, y]);
    zig.push(k % 2 ? [bx - 6, y + (bh + 8) / rows / 2] : [bx + bw + 6, y + (bh + 8) / rows / 2]);
  }
  let total = 0;
  for (let i = 1; i < zig.length; i++) total += Math.hypot(zig[i][0] - zig[i - 1][0], zig[i][1] - zig[i - 1][1]);
  gm.lineCap = 'round';
  gm.lineJoin = 'round';
  gm.strokeStyle = '#000';
  gm.lineWidth = ((bh + 8) / rows) * 1.25;
  gm.setLineDash([total * t, total * 2]);
  gm.beginPath();
  zig.forEach(([x, y], i) => (i ? gm.lineTo(x, y) : gm.moveTo(x, y)));
  gm.stroke();
  gm.setLineDash([]);
  gm.setTransform(1, 0, 0, 1, 0, 0);
  gm.globalCompositeOperation = 'source-in';
  gm.drawImage(a, 0, 0);
  gm.globalCompositeOperation = 'source-over';
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(m, 0, 0);
  g.restore();
}

/**
 * Paint the whole photo. The context must already be scaled so that the
 * drawing's 300 x 400 units fill the target (Portrait.jsx does this).
 */
export function drawPortrait(g, traits = {}, seed = 0, { reveal = {}, prev = null, face = false, mystery = false } = {}) {
  const t = traits ?? {};
  const S = sceneFor(seed, mystery ? 'open' : lookOf(t.gender));
  const layer = (id) => {
    const p = reveal[id];
    if (p === undefined || p >= 1) drawLayer(g, id, t, S);
    else brushIn(g, id, t, prev, S, p);
  };
  const theHead = () => {
    g.save();
    headSpace(g);
    head(g, S, { smile: S.smile, glasses: t.glasses === 'yes', mystery, look: S.look, beard: S.beard });
    if (!mystery) hairFront(g, S.hair, S);
    g.restore();
  };
  room(g, S, face);
  if (!face) {
    PROPS[S.leftProp](g, 42, S);
    PROPS[S.rightProp](g, 258, S);
    layer('season');
    layer('siblings');
  }
  wallShadow(g, S);
  if (!mystery) { g.save(); headSpace(g); hairBack(g, S.hair, S); g.restore(); }
  if (!face) {
    // the thumbnail crop shows head and shoulders only, so it skips everything below the waist
    floorShadow(g, S);
    legs(g, S, !t.shoes);
    trousers(g, S);
    layer('shoes');
  }
  freeArm(g, S);
  theHead();
  layer('top');
  layer('glasses');
  layer('drink');
}
