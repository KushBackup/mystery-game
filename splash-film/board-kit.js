'use strict';
// The drawing kit the morning-game tutorial films share (word.html, sketch.html):
// the palette, the marks, the page, sticky notes, stars and tags, the cast of
// four guests and their faces, the pointing hand, the pencil, the wake clip and
// the board clip. A classic script: it shares its films' globals, and loads after
// core.js, studio.js, cels.js and word-font.js. Moved here unchanged from
// word.html and word-clips.js on 2026-10-03 (word.html's frames were hash-checked
// before and after).

// ---------------------------------------------------------------- palette
const INK = '#24324f', PAPER = '#fbf8f0', SKIN = '#f6f1e6', HAIR = '#bdb7ae', HAIR_D = '#7d786f';
const SEA = '#3D8BF2', GOLD = '#FFCC33', RED = '#FF3B30', GREEN = '#4CD964';
const NOTE = { butter: '#FFF2A8', mint: '#D9F5E1', sky: '#DCEAFE', lilac: '#EADFFB' };
const CARD = '#fffdf8';
const FONT = '"Patrick Hand", "Segoe Print", cursive';
const STAMP_FONT = '900 1px Impact, "Arial Black", sans-serif';

// ---------------------------------------------------------------- small maths
const rot2 = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const put = (pts, x, y, a = 0, s = 1) => pts.map(p => { const q = rot2([p[0] * s, p[1] * s], a); return [x + q[0], y + q[1]]; });
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const mixv = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const lin = x => x;
const win = (tau, a, b) => clamp((tau - a) / (b - a), 0, 1);           // 0..1 across [a, b]
const bz = i => boil(i, 1);                                              // boil seed: a new drawing every 12 Hz frame

// ---------------------------------------------------------------- marks
// A ballpoint contour: tapered, a slow wander, never shaking per point.
function ln(c, pts, w, seed, close = false, col = INK, o = {}) {
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round';
  wob(c, pts, o.amp ?? 1.6, seed, close, { pressure: o.p ?? .55, corner: o.corner ?? .8 }); c.restore();
}
// A drawn shape: opaque body colour (so the dots never show through skin), a watercolour wash a hair off the line, then the contour.
function shape(c, pts, col, seed, o = {}) {
  const { w = 6, base = SKIN, al = .95, line = INK, amp = 1.6, corner = .8, off = 2.5 } = o, path = curvePath(pts, true, corner);
  if (base) gouache(c, path, base, 1);
  if (col) wash(c, path, col, { al, off, seed, rim: true });
  if (line) ln(c, pts, w, seed + 1, true, line, { amp, corner });
  return path;
}
function dot(c, x, y, rx, ry = rx, col = INK, a = 0) { c.save(); c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, TAU); c.fill(); c.restore(); }
// A limb as one continuous outline along a bent path.
function tube(pts, widths) {
  const q = smoothPts(pts, false, 3, Math.PI), L = [0];
  for (let k = 1; k < q.length; k++) L.push(L[k - 1] + Math.hypot(q[k][0] - q[k - 1][0], q[k][1] - q[k - 1][1]));
  const tot = L[L.length - 1] || 1, wAt = u => { const f = u * (widths.length - 1), k = Math.min(widths.length - 2, Math.floor(f)); return lerp(widths[k], widths[k + 1], f - k); };
  const left = [], right = [];
  q.forEach((p, k) => { const a = q[Math.max(0, k - 1)], b = q[Math.min(q.length - 1, k + 1)], t = norm(sub(b, a)), n = [-t[1], t[0]], w = wAt(L[k] / tot); left.push(add(p, mul(n, w))); right.push(sub(p, mul(n, w))); });
  return [...left, ...right.reverse()];
}
// Text in Patrick Hand. size in units; fit = max width (shrinks to fit).
function txt(c, s, x, y, size, o = {}) {
  const { col = INK, align = 'center', base = 'middle', fit = 0, rot = 0, font = FONT, al = 1 } = o;
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `${size}px ${font}`;
  if (fit) { const m = c.measureText(s).width; if (m > fit) c.font = `${size * fit / m}px ${font}`; }
  c.textAlign = align; c.textBaseline = base; c.fillStyle = col; c.globalAlpha *= al; c.fillText(s, 0, 0); c.restore();
}
// Hand lettering that writes itself: glyph by glyph, each wiped on in the writing direction. Returns the pen tip.
function writeOn(c, s, x, y, size, k, o = {}) {
  const { col = INK, rot = 0, align = 'center', fit = 0 } = o;
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `${size}px ${FONT}`;
  let sz = size; if (fit) { const m = c.measureText(s).width; if (m > fit) { sz = size * fit / m; c.font = `${sz}px ${FONT}`; } }
  const total = c.measureText(s).width, x0 = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
  const n = s.length, f = clamp(k, 0, 1) * n, done = Math.floor(f), part = f - done;
  c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = col;
  let tip = [x0, 0];
  for (let q = 0; q < n && q <= done; q++) {
    const before = c.measureText(s.slice(0, q)).width, gw = c.measureText(s[q]).width;
    if (q < done) { c.fillText(s[q], x0 + before, 0); continue; }
    if (part <= 0) break;
    c.save(); c.beginPath(); c.rect(x0 + before - sz * .1, -sz, gw * part + sz * .1, sz * 2); c.clip(); c.fillText(s[q], x0 + before, 0); c.restore();
    tip = [x0 + before + gw * part, sz * (.18 * Math.sin(part * 9) - .05)];
  }
  if (k >= 1) tip = [x0 + total, 0];
  c.restore();
  const t = rot2(tip, rot); return [x + t[0], y + t[1]];
}

// ---------------------------------------------------------------- the page
// The app's Help paper: cream, and a blue dot grid that belongs to the page (drawn once, never moves).
let PAGE = null;
function page(c) {
  if (!PAGE) {
    PAGE = layer(); const g = PAGE.getContext('2d'); g.setTransform(S, 0, 0, S, 0, 0);
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(61,139,242,0.16)'; const step = 54;
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) { g.beginPath(); g.arc(x, y, 3.4, 0, TAU); g.fill(); }
  }
  blit(c, PAGE);
}

// ---------------------------------------------------------------- props
// A sticky note in local coords, centred. w x h, colour, a soft shadow; lift raises the shadow (0 = flat on the wall).
function sticky(c, w, h, col, seed, o = {}) {
  const { lift = 0, curl = 1 } = o, hw = w / 2, hh = h / 2;
  const pts = warp([[-hw, -hh], [hw, -hh], [hw, hh - 10 * curl], [hw - 14 * curl, hh], [-hw, hh]], seed, 2.2, true, 30);
  const path = curvePath(pts, true, .5);
  c.save();
  c.shadowColor = `rgba(36,50,79,${.22 - lift * .08})`; c.shadowBlur = (10 + lift * 22) * S; c.shadowOffsetX = (3 + lift * 10) * S; c.shadowOffsetY = (7 + lift * 22) * S;
  c.fillStyle = col; c.fill(path); c.restore();
  c.save(); c.clip(path); c.fillStyle = 'rgba(36,50,79,.05)'; c.fillRect(-hw, -hh, w, h * .16);       // the glue strip
  const g = c.createLinearGradient(hw - 60, hh - 60, hw, hh); g.addColorStop(0, 'rgba(36,50,79,0)'); g.addColorStop(1, 'rgba(36,50,79,.10)'); c.fillStyle = g; c.fillRect(hw - 80, hh - 80, 80, 80); c.restore();
  ln(c, pts, 2.2, seed + 3, true, alpha(INK, .45), { amp: .8, p: .3, corner: .5 });
  return path;
}
// The number badge: a navy disc, the number in paper colour.
function badge(c, n, x, y, r = 40, k = 1) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  const pts = blob(0, 0, r, r, 700 + n, { amp: .03, n: 36 }); c.fillStyle = INK; c.fill(curvePath(pts, true));
  txt(c, String(n), 0, 3, r * 1.45, { col: PAPER }); c.restore();
}
// A five-point star, gold, inked.
const starPts = (r, inner = .48) => Array.from({ length: 10 }, (_, k) => { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * inner : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; });
function star(c, x, y, r, seed, k = 1, rot = 0) {
  if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  const pts = starPts(r); c.fillStyle = GOLD; c.fill(curvePath(pts, true, .3)); ln(c, pts, 5, seed, true, INK, { corner: .3, amp: 1 });
  c.restore();
}
// The points tag: a gold luggage tag with the score in ink.
function tag(c, s, x, y, rot, seed, o = {}) {
  const { w = 150, h = 74, pop = 1 } = o;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(pop, pop);
  const pts = [[-w / 2 + 22, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 22, h / 2], [-w / 2, 0]];
  c.save(); c.shadowColor = 'rgba(36,50,79,.18)'; c.shadowBlur = 6 * S; c.shadowOffsetY = 3 * S; c.fillStyle = GOLD; c.fill(curvePath(pts, true, .4)); c.restore();
  ln(c, pts, 4, seed, true, INK, { corner: .4, amp: .8 });
  c.save(); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(-w / 2 + 20, 0, 7, 0, TAU); c.stroke(); c.restore();
  txt(c, s, 12, 3, h * .82, {}); c.restore();
}

// ---------------------------------------------------------------- the cast
// Guest units: head radius about 60, y down. A head is drawn at its centre; features follow `turn` (-1 left .. 1 right).
const CAST = {
  ada: { top: '#f0b043', hair: 'bob', glasses: true },
  ben: { top: '#4d6488', hair: 'tufts' },
  cleo: { top: '#5b9be8', hair: 'curls' },
  dev: { top: '#d98fa0', hair: 'bun' },
  zed: { top: '#8fb7a0', hair: 'beanie' },
};
const ORDER = ['ada', 'ben', 'cleo', 'dev'];
const skullPts = (sy = 1) => Array.from({ length: 40 }, (_, k) => { const a = k / 40 * TAU, s = Math.sin(a); return [60 * Math.cos(a) * (1 + .07 * s), 64 * s * sy - (s < 0 ? 0 : 0)]; });
function scallop(cx, cy, r, from, to, n, bump) {   // a curly edge along an arc
  const out = []; for (let k = 0; k <= n * 4; k++) { const u = k / (n * 4), a = lerp(from, to, u), rr = r + bump * Math.abs(Math.sin(u * n * Math.PI)); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return out;
}
function hairBack(c, g, seed, up = 0) {
  if (g.hair === 'bob') shape(c, [[-74, 48], [-78, 4], [-70, -44], [-40, -76], [0, -84 - up], [40, -76], [70, -44], [78, 4], [74, 48], [46, 54], [-46, 54]], HAIR, seed, { corner: 1.2 });
  else if (g.hair === 'curls') shape(c, scallop(0, -6, 74, Math.PI * .78, Math.PI * 2.22, 11, 12 + up * .3), HAIR, seed);
  else if (g.hair === 'bun') { const b = blob(10, -94 - up, 27, 25, seed + 2, { amp: .06 }); shape(c, b, HAIR, seed); hatchIn(c, b, seed + 4, 1.9); }
}
function hatchIn(c, pts, seed, angle = 1.9, gap = 7) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  hatch(c, curvePath(pts, true), box, { angle, gap, len: 16, color: HAIR_D, alpha: .55, width: 1.6, seed });
}
function hairFront(c, g, seed, up = 0) {
  let pts;
  if (g.hair === 'bob') pts = [[-64, -8], [-62, -46], [-36, -72], [0, -80 - up], [36, -72], [62, -46], [64, -8], [50, -20], [36, -26], [18, -24], [0, -28], [-18, -24], [-36, -26], [-52, -20]];
  else if (g.hair === 'tufts') pts = [[-62, -14], [-60, -46], [-40, -66], [-34, -92 - up], [-14, -72], [0, -100 - up * 1.3], [14, -72], [36, -90 - up], [44, -62], [60, -44], [63, -14], [44, -30], [20, -34], [-8, -32], [-36, -34]];
  else if (g.hair === 'curls') pts = [...scallop(0, -4, 62, Math.PI * 1.08, Math.PI * 1.92, 7, 10 + up * .4), [44, -34], [20, -28], [-8, -30], [-36, -26]];
  else if (g.hair === 'bun') pts = [[-63, -6], [-61, -44], [-38, -68], [0, -76 - up], [38, -68], [61, -44], [63, -6], [52, -26], [30, -40], [6, -46], [-14, -38], [-40, -30]];
  else if (g.hair === 'beanie') pts = [[-66, -10], [-64, -50], [-40, -84], [0, -92], [40, -84], [64, -50], [66, -10], [40, -16], [0, -18], [-40, -16]];
  if (!pts) return;
  shape(c, pts, g.hair === 'beanie' ? g.top : HAIR, seed, { corner: 1.1 });
  if (g.hair === 'beanie') { ln(c, [[-62, -20], [0, -26], [62, -20]], 4, seed + 7); dot(c, 0, -100, 15, 15, INK); }
  else hatchIn(c, pts, seed + 5, g.hair === 'tufts' ? 1.3 : 1.9);
}
// The face. f = { eyes, brows, mouth, gaze:[x,y], turn, blush, sweat }
function face(c, g, f, seed) {
  const t = (f.turn || 0) * 12, gz = f.gaze || [0, 0], ex = 22, ey = 6;
  const eyes = f.eyes || 'dot';
  for (const s of [-1, 1]) {
    const x = s * ex + t, y = ey;
    if (eyes === 'dot') dot(c, x + gz[0] * 4, y + gz[1] * 4, 6.5, 8.5);
    else if (eyes === 'closed') ln(c, [[x - 10, y], [x, y + 6], [x + 10, y]], 4.5, seed + s, false, INK, { amp: .6 });
    else if (eyes === 'happy') ln(c, [[x - 10, y + 4], [x, y - 5], [x + 10, y + 4]], 4.5, seed + s, false, INK, { amp: .6 });
    else if (eyes === 'squeeze') ln(c, [[x - 9 * s, y - 7], [x + 6 * s, y], [x - 9 * s, y + 7]], 4.5, seed + s, false, INK, { amp: .5, corner: .3 });
    else if (eyes === 'wide' || eyes === 'look') {
      const r = eyes === 'wide' ? 15 : 12;
      c.save(); c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(x, y - 2, r, r * 1.12, 0, 0, TAU); c.fill(); c.restore();
      ln(c, ellPts(x, y - 2, r, r * 1.12, 0, 24), 3.5, seed + s * 3, true, INK, { amp: .5 });
      dot(c, x + gz[0] * r * .45, y - 2 + gz[1] * r * .45, r * .42, r * .48);
    }
    // brows
    const b = f.brows || 'calm', by = y - (eyes === 'wide' ? 30 : 22);
    const bp = { calm: [[x - 10, by + 1], [x + 10, by - 1]], up: [[x - 11, by - 8], [x, by - 12], [x + 11, by - 8]], worry: [[x - 11 * s, by - 2], [x + 9 * s, by - 10]].map(p => [p[0], p[1]]), low: [[x - 10, by + 5], [x + 10, by + 5]], sleep: [[x - 10, by + 4], [x + 10, by + 3]] }[b];
    if (bp) ln(c, b === 'worry' ? [[x + 10 * s, by + 2], [x - 10 * s, by - 8]] : bp, 4.2, seed + 10 + s, false, INK, { amp: .5 });
  }
  if (g.glasses && eyes !== 'wide') { c.save(); c.strokeStyle = INK; c.lineWidth = 3.4; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * ex + t, ey, 17, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-ex + 17 + t, ey - 2); c.quadraticCurveTo(t, ey - 8, ex - 17 + t, ey - 2); c.stroke(); c.restore(); }
  if (g.glasses && eyes === 'wide') { c.save(); c.strokeStyle = INK; c.lineWidth = 3.4; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * ex + t, ey - 2, 21, 0, TAU); c.stroke(); } c.restore(); }
  // cheeks
  if (f.blush !== false) for (const s of [-1, 1]) { c.save(); c.globalCompositeOperation = 'multiply'; const x = s * 36 + t, y = 26, gr = c.createRadialGradient(x, y, 0, x, y, 15); gr.addColorStop(0, 'rgba(232,128,120,.45)'); gr.addColorStop(1, 'rgba(232,128,120,0)'); c.fillStyle = gr; c.fillRect(x - 16, y - 16, 32, 32); c.restore(); }
  // mouth
  const m = f.mouth || 'smile', mx = t * 1.1, my = 34;
  if (m === 'smile') ln(c, [[mx - 13, my - 2], [mx, my + 6], [mx + 13, my - 2]], 4.5, seed + 20, false, INK, { amp: .5 });
  else if (m === 'grin') { const p = [[mx - 18, my - 4], [mx + 18, my - 4], [mx + 10, my + 10], [mx, my + 13], [mx - 10, my + 10]]; c.save(); c.fillStyle = INK; c.fill(curvePath(p, true, .6)); c.restore(); c.save(); c.clip(curvePath(p, true, .6)); dot(c, mx, my + 14, 10, 6, '#e98b86'); c.restore(); }
  else if (m === 'flat') ln(c, [[mx - 10, my], [mx + 10, my]], 4.5, seed + 20, false, INK, { amp: .5 });
  else if (m === 'wobble') ln(c, [[mx - 16, my + 2], [mx - 8, my - 3], [mx, my + 2], [mx + 8, my - 3], [mx + 16, my + 2]], 4, seed + 20, false, INK, { amp: .4, corner: .4 });
  else if (m === 'o') { dot(c, mx, my + 2, 8, 10); }
  else if (m === 'O') { dot(c, mx, my + 4, 12, 15); }
  else if (m === 'sleep') { c.save(); c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.ellipse(mx, my + 2, 5, 6, 0, 0, TAU); c.stroke(); c.restore(); }
  else if (m === 'tight') ln(c, [[mx - 12, my + 3], [mx - 4, my], [mx + 6, my + 1], [mx + 12, my - 2]], 4.2, seed + 20, false, INK, { amp: .4 });
  if (f.sweat) sweatDrop(c, 60 - t * .3, -30 + f.sweat * 40, 1.3, seed + 30);
}
function sweatDrop(c, x, y, k, seed) {
  const s = 13 * k, d = [[0, -s * 1.6], [s * .8, -s * .1], [s * .7, s * .5], [0, s * .9], [-s * .7, s * .5], [-s * .8, -s * .1]].map(p => [x + p[0], y + p[1]]);
  c.save(); c.fillStyle = '#cfe3ff'; c.fill(curvePath(d, true, .5)); c.restore(); ln(c, d, 3.2, seed, true, SEA, { amp: .4, corner: .5 });
  ln(c, [[x - s * .25, y - s * .1], [x - s * .3, y + s * .35]], 2.5, seed + 1, false, '#ffffff', { amp: .2 });
}
// A whole head: back hair, skull, face, front hair. o = { tilt, sy (stretch), up (hair lift) }
function head(c, g, x, y, sc, f, seed, o = {}) {
  const { tilt = 0, sy = 1, up = 0 } = o;
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(sc, sc * sy);
  hairBack(c, g, seed + 1, up);
  shape(c, skullPts(), null, seed + 3, { w: 6 });
  face(c, g, f, seed + 40);
  hairFront(c, g, seed + 60, up);
  c.restore();
}
// Shoulders and chest, front view, from a neck point down to y = bottom. hw = half width at the shoulder.
function torso(c, g, sh, hw, bottom, seed, o = {}) {
  const { lean = 0 } = o, [x, y] = sh;
  const pts = [[x - 22, y - 4], [x - hw * .7, y + 4], [x - hw, y + 30], [x - hw - 6 + lean, bottom], [x + hw + 6 + lean, bottom], [x + hw, y + 30], [x + hw * .7, y + 4], [x + 22, y - 4]];
  shape(c, pts, g.top, seed, { w: 6.5, corner: 1.2 });
  ln(c, [[x - 22, y - 2], [x, y + 18], [x + 22, y - 2]], 4, seed + 4, false, INK, { amp: .6 });      // neckline
}
function neck(c, a, b, seed) { shape(c, tube([a, b], [15, 14]), null, seed, { w: 5 }); }
// An arm, shoulder to hand, one outline; a sleeve over the top half; a mitten hand.
const ARM = { up: 66, fore: 62 };
function arm(c, g, shoulder, hand, bend, seed, o = {}) {
  const { handRot = null, fist = false, elbow = null } = o;
  const s = elbow ? { joint: elbow, end: hand } : solveLimb(shoulder, hand, ARM.up, ARM.fore, bend);
  shape(c, tube([shoulder, s.joint, s.end], [15, 13, 11.5]), null, seed, { w: 5.5 });
  const mid = mixv(shoulder, s.joint, .62);
  shape(c, tube([add(shoulder, [0, -2]), mid], [19, 17]), g.top, seed + 4, { w: 5.5 });
  const d = norm(sub(s.end, s.joint)), hp = add(s.end, mul(d, 10)), ang = handRot ?? Math.atan2(d[1], d[0]);
  shape(c, put(blob(0, 0, fist ? 16 : 18, fist ? 15 : 14, seed + 7, { amp: .06 }), hp[0], hp[1], ang), null, seed + 8, { w: 5 });
  return s;
}

// A pointing hand: fingertip at `tip`, the arm running back towards `anchor` off frame. press flattens the fingertip.
function pointHand(c, g, tip, anchor, press, seed, sc = 1.4) {
  const d = norm(sub(anchor, tip)), ang = Math.atan2(-d[0], d[1]);
  c.save(); c.translate(tip[0], tip[1]); c.rotate(ang); c.scale(sc, sc);
  const p = press * 6;
  shape(c, tube([[6, 112], [10, 168]], [27, 29]), g.top, seed, { w: 5 });          // a cuff in their top's colour; the hand floats in like a cursor
  ln(c, [[-20, 150], [38, 154]], 3, seed + 1, false, alpha(INK, .6), { amp: .3 });
  shape(c, blob(4, 92, 37, 32, seed + 2, { amp: .05 }), null, seed + 3, { w: 5 });
  ln(c, [[-16, 100], [6, 108], [22, 102]], 3.2, seed + 4, false, INK, { amp: .4 });
  shape(c, put(blob(0, 0, 11, 19, seed + 6, { amp: .05 }), -31, 86, -.45), null, seed + 7, { w: 4.5 });
  shape(c, tube([[-4, 74], [-3, 34], [-2, 4 + p]], [12, 11.5, 10.5]), null, seed + 5, { w: 4.5 });
  ln(c, [[-9, 16 + p], [5, 16 + p]], 2.6, seed + 8, false, INK, { amp: .2 });     // the nail
  if (press > .5) for (const a of [-2.4, -1.57, -.74]) ln(c, [[Math.cos(a) * 26, Math.sin(a) * 26], [Math.cos(a) * 42, Math.sin(a) * 42]], 4, seed + 9, false, INK, { amp: .3 });
  c.restore();
}
function stampK(k) { const f = Math.floor(k * 24 + 1e-6); if (f < 0) return 0; return [1.55, .82, 1.1, .97][f] ?? 1; }

// ---------------------------------------------------------------- the top three (the last clip of both morning tutorials)
// `rows`: { who, score, f } top to bottom. The first three each get a clue photo
// that flies in and lands beside them; the rest fade back. Redrawn 2026-10-16:
// the old clip stamped LOWEST on the last row, a rule the game no longer has
// (the morning game kills nobody; its top three win a clue photo).
const BOARD = { x: 720, y: 545, w: 1010, h: 964, r: -.012 };
const ROW_Y = k => -212 + k * 150;
// A small clue photo: white frame, a pale picture with a question mark, inked.
function cluePhoto(c, x, y, rot, s, seed) {
  if (s <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const pts = warp(rectPts(-60, -66, 120, 132), seed, 1.2, true, 24);
  c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 10 * S; c.shadowOffsetY = 6 * S; c.fillStyle = '#ffffff'; c.fill(curvePath(pts, true, .4)); c.restore();
  c.fillStyle = '#e9eef8'; c.fillRect(-50, -56, 100, 90);
  txt(c, '?', 0, -6, 76, { col: SEA });
  txt(c, 'clue', 0, 52, 30, { col: '#4c566c' });
  ln(c, pts, 2.4, seed + 1, true, alpha(INK, .4), { amp: .4 });
  c.restore();
}
const boardClipFor = rows => function boardClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  // the photos land one after another from 1.9 s, each with a little bump of the card
  const LAND = [1.9, 2.25, 2.6], landF = LAND.map((t) => Math.floor((tau - t) * 24 + 1e-6));
  const bumpF = landF.find((f) => f >= 0 && f < 4), shake = bumpF != null ? [6, -3, 2, 0][bumpF] : 0;
  c.save(); c.translate(BOARD.x, BOARD.y + shake); c.rotate(BOARD.r);
  // the card
  const hw = BOARD.w / 2, hh = BOARD.h / 2, pts = warp(rectPts(-hw, -hh, BOARD.w, BOARD.h), 91, 2.5, true, 40), path = curvePath(pts, true, .5);
  c.save(); c.shadowColor = 'rgba(36,50,79,.22)'; c.shadowBlur = 16 * S; c.shadowOffsetX = 6 * S; c.shadowOffsetY = 9 * S; c.fillStyle = CARD; c.fill(path); c.restore();
  c.save(); c.clip(path); c.strokeStyle = 'rgba(61,139,242,.22)'; c.lineWidth = 2.5; for (let k = 0; k < 5; k++) { const y = ROW_Y(k) - 75; c.beginPath(); c.moveTo(-hw, y); c.lineTo(hw, y); c.stroke(); } c.restore();
  ln(c, pts, 4.5, 92, true, INK, { amp: 1, corner: .5, p: .4 });
  // title
  writeOn(c, 'TOP 3', 0, -hh + 82, 114, win(tau, .05, .45));
  brush(c, [[-150, -hh + 146], [0, -hh + 138], [156, -hh + 144]], { w: 12, color: SEA, p: win(tau, .4, .6), seed: 93 });
  // rows
  rows.forEach((R, k) => {
    const y = ROW_Y(k), at = .35 + k * .17, pk = easeOutBack(win(tau, at, at + .2)), lk = win(tau, at + .05, at + .35), tk = easeOutBack(win(tau, at + .12, at + .3));
    if (tau < at) return;
    const top = k < 3, landed = top && tau >= LAND[k], f = { ...R.f };
    if (landed && k !== 2) { f.eyes = 'happy'; f.mouth = 'grin'; }
    // the rest fade back once the photos start landing
    const fade = top ? 1 : lerp(1, .4, win(tau, 1.8, 2.2));
    c.save(); c.globalAlpha *= fade;
    head(c, CAST[R.who], -hw + 116, y + 10, .78 * pk, f, 700 + k * 40 + bz(i), { tilt: k === 4 ? .32 : 0 });
    // the leader dots, shorter on a top row to leave room for its photo
    c.save(); c.fillStyle = alpha(INK, .5); const x0 = -hw + 228, x1 = top ? -20 : 150; for (let x = x0; x < lerp(x0, x1, lk); x += 26) { c.beginPath(); c.arc(x, y + 14, 4, 0, TAU); c.fill(); } c.restore();
    if (tau >= at + .12) tag(c, String(R.score), hw - 140, y + 10, k % 2 ? .04 : -.04, 760 + k, { w: 210, h: 96, pop: tk });
    if (k === 4) {
      // Zed: asleep, phone face down beside him, z's drifting up. He slept through it, so no photo.
      const ph = [-hw + 226, y + 46];
      c.save(); c.translate(...ph); c.rotate(-.06); c.fillStyle = INK; c.fill(roundRectPath(-48, -14, 96, 28, 9)); dot(c, 30, -1, 5, 5, '#5a6888'); c.restore();
      for (let q = 0; q < 3; q++) { const u = ((t2 * .55 + q / 3) % 1); txt(c, 'z', -hw + 178 + u * 64 + q * 6, y - 44 - u * 84, 38 + u * 28, { al: Math.min(1, u * 4, (1 - u) * 3), rot: -.2 }); }
    }
    c.restore();
    // the photo: flies in from the top right, lands with an overshoot, a gold star beside it
    if (top && tau >= LAND[k] - .3) {
      const u = clamp((tau - (LAND[k] - .3)) / .3, 0, 1), e = easeOutBack(u);
      const from = [hw + 80, -hh - 140], to = [90, y + 4];
      cluePhoto(c, lerp(from[0], to[0], e), lerp(from[1], to[1], e), lerp(.5, k % 2 ? .08 : -.08, e), lerp(.6, .9, e), 800 + k * 7);
      if (landed) star(c, 170, y - 34, 26, 820 + k, easeOutBack(win(tau, LAND[k], LAND[k] + .2)), .2);
    }
  });
  c.restore();
};

// ---------------------------------------------------------------- the pencil


function pencil(c, tip, ang, seed, lift = 0) {
  c.save(); c.translate(tip[0], tip[1]); c.rotate(ang);
  c.save(); c.globalAlpha = .13; c.fillStyle = INK; c.translate(16 + lift * 40, 30 + lift * 40); c.fill(curvePath([[0, 0], [70, -22], [440, -22], [440, 22], [70, 22]], true, .3)); c.restore();
  const body = [[70, -22], [362, -22], [362, 22], [70, 22]];
  shape(c, body, '#f0b043', seed, { w: 5, corner: .3, amp: .6 });
  ln(c, [[74, -7], [358, -7]], 2.5, seed + 2, false, alpha(INK, .45), { amp: .3, p: .2 }); ln(c, [[74, 8], [358, 8]], 2.5, seed + 3, false, alpha(INK, .45), { amp: .3, p: .2 });
  shape(c, [[0, 0], [70, -22], [70, 22]], '#f1d8ad', seed + 4, { w: 5, corner: .3, amp: .5, al: .7 });
  c.save(); c.fillStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(22, -7); c.lineTo(22, 7); c.closePath(); c.fill(); c.restore();
  shape(c, [[362, -24], [396, -24], [396, 24], [362, 24]], '#bdb7ae', seed + 5, { w: 5, corner: .3, amp: .4 });
  for (const x of [372, 386]) ln(c, [[x, -22], [x, 22]], 2.5, seed + x, false, INK, { amp: .2 });
  shape(c, [[396, -22], [428, -22], [440, -12], [440, 12], [428, 22], [396, 22]], '#d98fa0', seed + 6, { w: 5, corner: .5, amp: .4 });
  c.restore();
}

// ---------------------------------------------------------------- the wake (the first clip of every tutorial)
// Four asleep at a cafe table; the phones buzz; they jolt awake and grab them; the game's name writes itself on.
// `line`: the underline's left and right ends, from the centre.
const SEAT_X = [330, 590, 850, 1110], SEAT_Y = 720;
const P0 = {
  sleepA: { sh: [0, -60], hw: 88, rest: true, head: [10, -34], tilt: 1.12, f: { eyes: 'closed', mouth: 'sleep', brows: 'sleep' }, fold: true },
  sleepB: { sh: [0, -64], hw: 88, rest: true, head: [10, -38], tilt: 1.12, f: { eyes: 'closed', mouth: 'sleep', brows: 'sleep' }, fold: true },
  scrunch: { sh: [0, -56], hw: 90, rest: true, head: [8, -30], tilt: .98, f: { eyes: 'squeeze', mouth: 'wobble', brows: 'worry' }, fold: true },
  pop: { sh: [0, -178], hw: 82, head: [0, -306], sy: 1.1, up: 16, f: { eyes: 'wide', mouth: 'O', brows: 'up' }, hands: [[-92, -196], [94, -206]], shock: true },
  jolt: { sh: [0, -166], hw: 88, head: [0, -288], up: 10, f: { eyes: 'wide', mouth: 'O', brows: 'up' }, hands: [[-116, -232], [118, -244]], shock: true },
  jolt2: { sh: [0, -160], hw: 88, head: [0, -280], up: 6, f: { eyes: 'wide', mouth: 'o', brows: 'up' }, hands: [[-112, -222], [114, -232]], shock: false },
  joltB: { sh: [0, -168], hw: 86, head: [0, -290], up: 12, f: { eyes: 'wide', mouth: 'O', brows: 'up' }, hands: [[-88, -310], [92, -300]], shock: true },
  joltB2: { sh: [0, -162], hw: 86, head: [0, -282], up: 7, f: { eyes: 'wide', mouth: 'o', brows: 'up' }, hands: [[-86, -296], [90, -288]], shock: false },
  reach: { sh: [0, -114], hw: 92, head: [0, -212], f: { eyes: 'dot', gaze: [0, 1], mouth: 'o', brows: 'up' }, hands: [[-34, 66], [34, 66]], elbows: [[-96, -20], [96, -20]] },
  look: { sh: [0, -150], hw: 86, head: [0, -246], tilt: .05, f: { eyes: 'dot', gaze: [0, 1], mouth: 'smile', brows: 'calm' }, hands: [[-38, -70], [38, -74]], elbows: [[-92, -36], [92, -38]], held: true },
};
function mixPose(a, b, u) {
  const o = { ...(u < .5 ? a : b) };
  for (const k of ['sh', 'head']) o[k] = mixv(a[k], b[k], u);
  for (const k of ['hw', 'tilt', 'sy', 'up']) o[k] = lerp(a[k] ?? (k === 'sy' ? 1 : 0), b[k] ?? (k === 'sy' ? 1 : 0), u);
  if (a.hands && b.hands) o.hands = [mixv(a.hands[0], b.hands[0], u), mixv(a.hands[1], b.hands[1], u)];
  return o;
}
const mirror = (P, s) => s > 0 ? P : { ...P, head: [-P.head[0], P.head[1]], tilt: -P.tilt };
const WAKE_D = [0, .083, -.042, .167];
const wakeAt = k => 1.46 + WAKE_D[k];
function wakePose(k, t) {
  const d = WAKE_D[k], s = k % 2 ? -1 : 1, w = 1.46 + d;
  if (t < w - .4) return mirror((Math.floor(t / .58 + k * .37) % 2) ? P0.sleepB : P0.sleepA, s);
  if (t < w - .08) return mirror(P0.scrunch, s);
  if (t < w) return P0.pop;
  const alt = k % 2 === 0;   // Ada and Cleo throw their hands up by their heads, Ben and Dev fling them wide
  if (t < w + .17) return alt ? P0.joltB : P0.jolt;
  if (t < w + .34) return alt ? P0.joltB2 : P0.jolt2;
  if (t < w + .42) return mixPose(alt ? P0.joltB2 : P0.jolt2, P0.reach, .5);
  if (t < w + .66) return P0.reach;
  if (t < w + .75) return mixPose(P0.reach, P0.look, .5);
  const L = { ...P0.look, f: { ...P0.look.f } };
  if (k === 3 && t > 3.62 && t < 4.06) { L.f = { eyes: 'dot', gaze: [-1, .3], turn: -.5, mouth: 'flat', brows: 'calm' }; L.head = [-6, -246]; }
  if (k === 1 && t > 3.96 && t < 4.06) L.f = { ...L.f, eyes: 'closed' };
  if (k === 0 || k === 2) L.f.mouth = t > 3.2 ? 'smile' : 'flat';
  return L;
}
function shockLines(c, x, y, seed) {
  for (const a of [-2.6, -2.1, -1.57, -1.04, -.54]) ln(c, [[x + Math.cos(a) * 96, y + Math.sin(a) * 104], [x + Math.cos(a) * 128, y + Math.sin(a) * 136]], 5, seed + Math.round(a * 10), false, INK, { amp: .4 });
}
function phoneFlat(c, x, y, buzz, t, seed) {
  const hop = buzz ? Math.abs(Math.sin(t * 48)) * 9 : 0, rr = buzz ? Math.sin(t * 61) * .1 : 0;
  c.save(); c.fillStyle = 'rgba(36,50,79,.16)'; c.beginPath(); c.ellipse(x + 4, y + 13, 46, 8, 0, 0, TAU); c.fill(); c.restore();
  c.save(); c.translate(x, y - hop); c.rotate(rr);
  c.fillStyle = INK; c.fill(roundRectPath(-44, -13, 88, 24, 8));
  c.fillStyle = buzz ? '#9cc6ff' : '#3b4a6b'; c.fill(roundRectPath(-36, -10, 72, 12, 4));
  c.restore();
  if (buzz) for (const s of [-1, 1]) for (let q = 0; q < 2; q++) {
    const r = 62 + q * 22, pts = []; for (let a = -.55; a <= .56; a += .11) pts.push([x + s * Math.cos(a) * r, y - 6 - hop + Math.sin(a) * r * .8]);
    ln(c, pts, 4.5, seed + s * 7 + q, false, INK, { amp: 1.6, p: .3 });
  }
}
function seated(c, g, P, x0, seed, pass, phone) {
  c.save(); c.translate(x0, SEAT_Y);
  const sy = P.sy ?? 1;
  if (pass === 'back') {
    torso(c, g, P.sh, P.hw, 92, seed);
    if (!P.rest) { neck(c, add(P.sh, [0, 6]), add(P.head, [0, 54 * sy]), seed + 20); head(c, g, P.head[0], P.head[1], 1, P.f, seed + 30, { tilt: P.tilt || 0, sy, up: P.up || 0 }); }
    if (P.held) { const [x, y] = add(P.head, [0, 40]); c.save(); c.globalCompositeOperation = 'multiply'; const gr = c.createRadialGradient(x, y, 0, x, y, 70); gr.addColorStop(0, alpha(SEA, .2)); gr.addColorStop(1, alpha(SEA, 0)); c.fillStyle = gr; c.fillRect(x - 70, y - 70, 140, 140); c.restore(); }   // the screen's light on the face
    if (P.shock) shockLines(c, P.head[0], P.head[1], seed + 90);
  } else {
    const shL = add(P.sh, [-P.hw + 14, 24]), shR = add(P.sh, [P.hw - 14, 24]);
    if (phone && !P.held) phoneFlat(c, 0, 76, phone.buzz, phone.t, seed + 70);
    if (P.fold) {
      // forearms folded on the table, the head resting on them
      shape(c, tube([shR, [104, 30], [-30, 40]], [17, 16, 14]), null, seed + 40, { w: 5.5 });
      shape(c, tube([add(shR, [0, -2]), [92, 24]], [20, 19]), g.top, seed + 41, { w: 5.5 });
      shape(c, put(blob(0, 0, 17, 14, seed + 44, { amp: .06 }), -34, 40), null, seed + 45, { w: 5 });
      shape(c, tube([shL, [-104, 26], [30, 34]], [17, 16, 14]), null, seed + 42, { w: 5.5 });
      shape(c, tube([add(shL, [0, -2]), [-92, 20]], [20, 19]), g.top, seed + 43, { w: 5.5 });
      shape(c, put(blob(0, 0, 17, 14, seed + 46, { amp: .06 }), 36, 34), null, seed + 47, { w: 5 });
      head(c, g, P.head[0], P.head[1], 1, P.f, seed + 30, { tilt: P.tilt });
    } else {
      if (P.held) { c.save(); c.translate(0, -118); c.rotate(-.08); c.fillStyle = INK; c.fill(roundRectPath(-32, -54, 64, 108, 11)); c.strokeStyle = '#5a6888'; c.lineWidth = 3; c.stroke(roundRectPath(-26, -48, 52, 96, 8)); dot(c, -15, -38, 5, 5, '#5a6888'); c.restore(); }
      arm(c, g, shL, P.hands[0], P.hands[0][1] < shL[1] - 40 ? 1 : -1, seed + 50, { elbow: P.elbows ? P.elbows[0] : null });
      arm(c, g, shR, P.hands[1], P.hands[1][1] < shR[1] - 40 ? -1 : 1, seed + 60, { elbow: P.elbows ? P.elbows[1] : null });
    }
  }
  c.restore();
}
function table(c) {
  const cx = CX, cy = 792, rx = 590, ry = 112;
  shape(c, [[cx - 34, cy + 120], [cx + 34, cy + 120], [cx + 42, H + 30], [cx - 42, H + 30]], SEA, 801, { w: 5.5, al: .35, corner: .4 });
  shape(c, [[cx - rx, cy], ...ellPts(cx, cy + 24, rx, ry, 0, 96).filter(p => p[1] > cy + 24).sort((a, b) => a[0] - b[0]), [cx + rx, cy]], SEA, 802, { w: 5.5, al: .5, corner: 1.4 });
  shape(c, ellPts(cx, cy, rx, ry, 0, 96), SEA, 803, { w: 5.5, al: .14, corner: 1.4 });
}
function cup(c, x, y, seed, i) {
  shape(c, ellPts(x, y + 26, 46, 11, 0, 30), null, seed, { w: 4.5, amp: .4 });
  const body = [[x - 30, y - 30], [x + 30, y - 30], [x + 24, y + 18], [x - 24, y + 18]];
  ln(c, [[x + 28, y - 18], [x + 46, y - 14], [x + 44, y + 2], [x + 26, y + 4]], 4.5, seed + 2, false, INK, { amp: .3 });
  shape(c, body, null, seed + 1, { w: 4.5, corner: .5, amp: .4 });
  shape(c, ellPts(x, y - 30, 30, 8, 0, 24), '#a87b54', seed + 3, { w: 4, amp: .3, al: .7 });
  for (let q = 0; q < 2; q++) { const pts = []; for (let v = 0; v <= 1.001; v += .1) pts.push([x - 8 + q * 16 + Math.sin(v * 6 + q) * 7, y - 44 - v * 70]); ln(c, pts, 3.5, seed + 9 + q + bz(i), false, alpha(INK, .5), { amp: 2, p: .2 }); }
}
const wakeClipFor = (title, line) => function wakeClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), poses = ORDER.map((_, k) => wakePose(k, t2));
  c.save(); cam(c, 720, 630, 1.25);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 2000 + k * 200 + bz(i), 'back'));
  table(c);
  cup(c, 462, 790, 2900, i); cup(c, 980, 798, 2950, i);
  ORDER.forEach((who, k) => {
    const buzz = tau > .9 + k * .06 && t2 < wakeAt(k) + .42;
    seated(c, CAST[who], poses[k], SEAT_X[k], 2000 + k * 200 + bz(i), 'front', { buzz, t: tau });
  });
  // z's from the sleepers
  ORDER.forEach((_, k) => {
    const P = poses[k]; if (!P.rest || P.f.eyes !== 'closed') return; const s = k % 2 ? -1 : 1;
    for (let q = 0; q < 2; q++) { const u = (t2 * .7 + q * .5 + k * .23) % 1; txt(c, 'z', SEAT_X[k] - s * 40 + u * 34 * s, SEAT_Y - 120 - u * 110, 40 + u * 30, { al: Math.min(1, u * 5, (1 - u) * 3), rot: -.2 * s }); }
  });
  c.restore();
  // the title
  writeOn(c, title, CX, 126, 172, win(tau, 2.6, 3.3));
  brush(c, [[CX + line[0], 210], [CX, 203], [CX + line[1], 208]], { w: 16, color: SEA, p: win(tau, 3.3, 3.55), seed: 991 });
};
