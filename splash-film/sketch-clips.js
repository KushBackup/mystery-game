'use strict';
// The six clips of sketch.html. The drawing kit, the wake clip and the board clip
// live in board-kit.js. A classic script: it shares the film's globals.
// Brief and beat sheet: the top of sketch.html.

// ---------------------------------------------------------------- phone drawings
// What the guests draw is drawn the way the phone draws it (src/os/game/strokes.js):
// flat, round-capped lines in the pen inks, on the cream sketchbook page. No boil.
const PEN = ['#0E1626', '#FF3B30', '#3D8BF2', '#4CD964', '#FF7A59'];
const SKETCHBOOK = '#FFFDF7';
const PI = Math.PI;

// The finger-drawing generators of src/data/sketchTutorial.js, unchanged.
function loopP(cx, cy, rx, ry, a0, a1, step = 0.12, wobA = 1.6, seed = 1) {
  const pts = [], n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let q = 0; q <= n; q++) {
    const a = a0 + ((a1 - a0) * q) / n, w = Math.sin(a * 5 + seed) * wobA + Math.sin(a * 11 + seed * 3) * wobA * 0.5;
    pts.push([cx + Math.cos(a) * (rx + w), cy + Math.sin(a) * (ry + w)]);
  }
  return pts;
}
function lineP(pts, every = 5) {
  const out = [pts[0]];
  for (let q = 1; q < pts.length; q++) {
    const [x0, y0] = pts[q - 1], [x1, y1] = pts[q], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / every));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}
const centred = (strokes, dx, dy) => strokes.map(s => ({ ink: s.ink, pts: s.points.map(([x, y]) => [x + dx, y + dy]) }));

// Ada's teapot: the practice slide's teapot (sketchTutorial.js), in board units, centred.
const TEAPOT = centred([
  { ink: 0, points: loopP(126, 156, 64, 50, -PI * 0.92, PI * 1.06, 0.12, 1.8, 2) },
  { ink: 0, points: loopP(126, 108, 40, 16, PI, PI * 2, 0.16, 1, 4) },
  { ink: 0, points: lineP([[84, 110], [168, 108]]) },
  { ink: 0, points: loopP(126, 86, 8, 7, 0, PI * 2, 0.4, 0.6, 1) },
  { ink: 0, points: lineP([[92, 204], [96, 212], [158, 212], [162, 203]]) },
  { ink: 0, points: lineP([[184, 140], [206, 128], [226, 104], [236, 98], [232, 112], [214, 140], [190, 176]], 4) },
  { ink: 0, points: lineP([[68, 126], [48, 124], [36, 140], [40, 164], [56, 176], [70, 178]], 4) },
  { ink: 2, points: lineP([[70, 150], [100, 160], [126, 162], [152, 160], [184, 150]], 4) },
  { ink: 2, points: loopP(104, 178, 3, 3, 0, PI * 2, 0.8, 0.2, 1) },
  { ink: 2, points: loopP(130, 182, 3, 3, 0, PI * 2, 0.8, 0.2, 2) },
  { ink: 2, points: loopP(156, 178, 3, 3, 0, PI * 2, 0.8, 0.2, 3) },
  { ink: 2, points: lineP([[234, 86], [228, 74], [238, 62], [230, 48]], 3) },
  { ink: 2, points: lineP([[218, 84], [214, 74], [222, 64]], 3) },
], -136, -130);
// Ben's penguin: lopsided, one eye bigger than the other, and still a penguin.
const PENGUIN = centred([
  { ink: 0, points: loopP(0, 8, 60, 86, -PI / 2, PI * 1.5, 0.11, 5, 3) },
  { ink: 0, points: loopP(8, 26, 34, 56, -PI / 2, PI * 1.5, 0.14, 4, 5) },
  { ink: 0, points: loopP(-20, -40, 5, 5, 0, PI * 2, 0.5, 0.3, 1) },
  { ink: 0, points: loopP(20, -44, 10, 9, 0, PI * 2, 0.4, 0.6, 2) },
  { ink: 4, points: lineP([[-8, -24], [30, -18], [-4, -10], [-8, -24]], 3) },
  { ink: 0, points: lineP([[-58, -4], [-80, 22], [-90, 46]], 4) },
  { ink: 0, points: lineP([[60, -8], [84, 14], [96, 36]], 4) },
  { ink: 4, points: lineP([[-34, 94], [-14, 102], [-26, 90]], 3) },
  { ink: 4, points: lineP([[14, 96], [40, 102], [28, 90]], 3) },
], 0, -6);
const CUPCAKE = centred([
  { ink: 2, points: lineP([[-58, 6], [58, 6], [44, 88], [-44, 88], [-58, 6]], 4) },
  { ink: 2, points: lineP([[-28, 10], [-22, 84]], 4) },
  { ink: 2, points: lineP([[0, 10], [0, 86]], 4) },
  { ink: 2, points: lineP([[28, 10], [22, 84]], 4) },
  { ink: 4, points: loopP(0, -20, 70, 34, PI * 0.02, PI * 2.02, 0.1, 8, 2) },
  { ink: 4, points: lineP([[-40, -26], [-10, -36], [26, -30]], 4) },
  { ink: 1, points: loopP(6, -66, 11, 11, 0, PI * 2, 0.35, 0.8, 1) },
  { ink: 0, points: lineP([[10, -76], [18, -96], [30, -100]], 3) },
], 0, -6);
const blade = (a, r0, r1, w) => { const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], h = [0, -40]; const at = (r, s) => [h[0] + d[0] * r + n[0] * s, h[1] + d[1] * r + n[1] * s]; return lineP([at(r0, 0), at(r1, 0), at(r1, w), at(r0 + 10, w), at(r0, 0)], 4); };
const WINDMILL = centred([
  { ink: 0, points: lineP([[-36, 96], [-20, -26], [20, -26], [36, 96], [-36, 96]], 4) },
  { ink: 0, points: lineP([[-12, 96], [-12, 62], [12, 62], [12, 96]], 4) },
  { ink: 0, points: loopP(0, 20, 7, 7, 0, PI * 2, 0.5, 0.3, 1) },
  { ink: 2, points: blade(-0.6, 10, 96, 22) },
  { ink: 2, points: blade(-0.6 + PI / 2, 10, 96, 22) },
  { ink: 2, points: blade(-0.6 + PI, 10, 96, 22) },
  { ink: 2, points: blade(-0.6 + PI * 1.5, 10, 96, 22) },
  { ink: 0, points: loopP(0, -40, 7, 7, 0, PI * 2, 0.5, 0.3, 3) },
  { ink: 3, points: lineP([[-96, 98], [96, 98]], 6) },
], 0, -10);

const WORDS = [
  { who: 'ada', word: 'TEAPOT', D: TEAPOT },
  { who: 'ben', word: 'PENGUIN', D: PENGUIN },
  { who: 'cleo', word: 'CUPCAKE', D: CUPCAKE },
  { who: 'dev', word: 'WINDMILL', D: WINDMILL },
];

const strokeLens = D => D.map(s => { let L = 0; for (let q = 1; q < s.pts.length; q++) L += Math.hypot(s.pts[q][0] - s.pts[q - 1][0], s.pts[q][1] - s.pts[q - 1][1]); return L; });
// Draw the first `k` (0..1) of a drawing's length, centred at x, y, scaled by s. Returns the pen tip on screen.
function inkDoodle(c, D, x, y, s, k = 1, w = 7) {
  const lens = strokeLens(D), total = lens.reduce((a, b) => a + b, 0);
  let left = clamp(k, 0, 1) * total, tip = null;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w / s;
  for (let n = 0; n < D.length && left > 1e-6; n++) {
    const pts = D[n].pts; c.strokeStyle = PEN[D[n].ink];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    let used = 0, last = pts[0];
    for (let q = 1; q < pts.length; q++) {
      const seg = Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]);
      if (used + seg >= left) { const u = (left - used) / seg; last = [lerp(pts[q - 1][0], pts[q][0], u), lerp(pts[q - 1][1], pts[q][1], u)]; c.lineTo(last[0], last[1]); used = left; break; }
      used += seg; last = pts[q]; c.lineTo(last[0], last[1]);
    }
    if (pts.length === 1 || used < 1) { c.lineTo(last[0] + .01, last[1]); }
    c.stroke(); left -= lens[n]; tip = last;
  }
  c.restore();
  return tip ? [x + tip[0] * s, y + tip[1] * s] : null;
}

// ---------------------------------------------------------------- props
// A spiral sketchbook page, centred: cream, a dot grid that belongs to the page, rings along the top.
function sketchPage(c, x, y, w, h, seed) {
  const pts = warp(rectPts(x - w / 2, y - h / 2, w, h), seed, 2, true, 30), path = curvePath(pts, true, .5);
  c.save(); c.shadowColor = 'rgba(36,50,79,.2)'; c.shadowBlur = 12 * S; c.shadowOffsetX = 4 * S; c.shadowOffsetY = 7 * S; c.fillStyle = SKETCHBOOK; c.fill(path); c.restore();
  c.save(); c.clip(path); c.fillStyle = 'rgba(36,50,79,.11)';
  for (let yy = y - h / 2 + 30; yy < y + h / 2; yy += 30) for (let xx = x - w / 2 + 18; xx < x + w / 2; xx += 30) { c.beginPath(); c.arc(xx, yy, 2.4, 0, TAU); c.fill(); }
  c.restore();
  ln(c, pts, 3.5, seed + 1, true, alpha(INK, .5), { amp: .6, p: .3, corner: .5 });
  for (let xx = x - w / 2 + 34; xx <= x + w / 2 - 30; xx += 36) {
    dot(c, xx + 2, y - h / 2 + 3, 9, 9, 'rgba(36,50,79,.15)');
    c.save(); c.strokeStyle = '#8a93a6'; c.lineWidth = 4.5; c.beginPath(); c.arc(xx, y - h / 2, 9, PI * 1.05, PI * 2.6); c.stroke(); c.restore();
  }
}
// A polaroid of a drawing: white frame, the page, a caption in hand lettering.
function polaroid(c, x, y, size, rot, D, seed, o = {}) {
  const { cap = '', k = 1, pop = 1 } = o, fw = size + 40, fh = size + 40 + (cap ? 80 : 0), top = -fh / 2;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(pop, pop);
  const pts = warp(rectPts(-fw / 2, top, fw, fh), seed, 1.5, true, 40), path = curvePath(pts, true, .4);
  c.save(); c.shadowColor = 'rgba(36,50,79,.24)'; c.shadowBlur = 16 * S; c.shadowOffsetX = 5 * S; c.shadowOffsetY = 10 * S; c.fillStyle = '#ffffff'; c.fill(path); c.restore();
  c.fillStyle = SKETCHBOOK; c.fillRect(-size / 2, top + 20, size, size);
  inkDoodle(c, D, 0, top + 20 + size / 2, size / 250, k, 7 * size / 300);
  ln(c, pts, 2.6, seed + 1, true, alpha(INK, .35), { amp: .4, p: .3, corner: .4 });
  if (cap) txt(c, cap, 0, top + 20 + size + 42, 56, { col: '#4c566c' });
  c.restore();
}
// A guest from the waist up, standing at x with the waist at y, k times head size (the seated pose's numbers).
// o.hands/o.elbows: the two hands; o.phone: held in front, its screen lit.
function figure(c, g, x, y, k, f, seed, o = {}) {
  const { hands = [[-38, -70], [38, -74]], elbows = [[-92, -36], [92, -38]], phone = false, up = 0, hop = 0, tilt = 0 } = o;
  c.save(); c.translate(x, y + hop); c.scale(k, k);
  const sh = [0, -150], hw = 86;
  torso(c, g, sh, hw, 260, seed);
  neck(c, add(sh, [0, 6]), [0, -192], seed + 20);
  head(c, g, 0, -246, 1, f, seed + 30, { tilt, up });
  if (phone) { c.save(); c.translate(0, -118); c.rotate(-.08); c.fillStyle = INK; c.fill(roundRectPath(-32, -54, 64, 108, 11)); c.fillStyle = '#9cc6ff'; c.fill(roundRectPath(-25, -46, 50, 92, 7)); c.restore(); }
  const shL = add(sh, [-hw + 14, 24]), shR = add(sh, [hw - 14, 24]);
  arm(c, g, shL, hands[0], -1, seed + 50, { elbow: elbows ? elbows[0] : null });
  arm(c, g, shR, hands[1], 1, seed + 60, { elbow: elbows ? elbows[1] : null });
  c.restore();
}
// A stamp's scale on its contact frames (as word-clips' stamps).
function slam(k) { const f = Math.floor(k * 24 + 1e-6); if (f < 0) return 0; return [1.6, .84, 1.08, .98][f] ?? 1; }

// ---------------------------------------------------------------- clip 1: wake
const wakeClip = wakeClipFor('SKETCH', [-262, 268]);

// ---------------------------------------------------------------- clip 2: cards
// Four tent cards spin over: four different words. Everyone grins; Ada says shh.
const CARD_X = [219, 553, 887, 1221], CARD_W = 316, CARD_H = 290, CARD_B = 875;
const FLIP_AT = [.75, 1.25, 1.75, 2.25], FLIP_D = .29;
function cardBack(c, seed) {
  c.save(); c.strokeStyle = alpha(SEA, .55); c.lineWidth = 3.5; c.setLineDash([10, 9]); c.strokeRect(-CARD_W / 2 + 18, -CARD_H + 26, CARD_W - 36, CARD_H - 44); c.restore();
  const cy = -CARD_H / 2 - 18;
  const eye = [[-62, cy], [-30, cy - 30], [30, cy - 30], [62, cy], [30, cy + 30], [-30, cy + 30]];
  shape(c, eye, null, seed, { w: 4.5, base: '#ffffff', corner: 1.5, amp: .5 });
  dot(c, 0, cy, 21, 21, SEA); dot(c, 0, cy, 9, 9, INK); dot(c, -6, cy - 7, 4, 4, '#ffffff');
  for (const [dy, a] of [[48, 1], [70, .7]]) { const pts = []; for (let x = -74; x <= 74; x += 6) pts.push([x, cy + dy + Math.sin(x / 13) * 6]); ln(c, pts, 4, seed + dy, false, alpha(SEA, a), { amp: .3, p: .3 }); }
}
function tentCard(c, k, tau) {
  const x = CARD_X[k], u = clamp((tau - FLIP_AT[k]) / FLIP_D, 0, 1), started = tau >= FLIP_AT[k];
  const ang = Math.PI * u, sx = Math.max(.02, Math.abs(Math.cos(ang))), hop = Math.sin(ang) * 30, faceUp = u >= .5;
  const land = tau - (FLIP_AT[k] + FLIP_D), lf = Math.floor(land * 24), [qx, qy] = land >= 0 && lf < 3 ? [[1.04, .95], [.99, 1.02], [1, 1]][lf] : [1, 1];
  c.save(); c.fillStyle = 'rgba(36,50,79,.14)'; c.beginPath(); c.ellipse(x + 8, CARD_B + 4, CARD_W * .5 * sx + 6, 12, 0, 0, TAU); c.fill(); c.restore();
  c.save(); c.translate(x, CARD_B - hop); c.scale(sx * qx, qy);
  const pts = warp(rectPts(-CARD_W / 2, -CARD_H, CARD_W, CARD_H), 400 + (faceUp ? k : 0), 2, true, 30), path = curvePath(pts, true, .5);
  const ridge = [[-CARD_W / 2 + 4, -CARD_H], [-CARD_W / 2 + 16, -CARD_H - 16], [CARD_W / 2 - 16, -CARD_H - 16], [CARD_W / 2 - 4, -CARD_H]];
  c.fillStyle = faceUp ? '#ece6d8' : '#c3d6f2'; c.fill(polyPath(ridge)); ln(c, ridge, 4, 435 + k, false, INK, { amp: .3, corner: .3 });
  c.fillStyle = faceUp ? CARD : NOTE.sky; c.fill(path);
  c.save(); c.clip(path); c.fillStyle = 'rgba(36,50,79,.07)'; c.fillRect(-CARD_W / 2, -CARD_H, CARD_W, 16); c.restore();
  if (!faceUp) cardBack(c, 410);
  else { txt(c, WORDS[k].word, 0, -CARD_H + 74, 76, { fit: CARD_W - 40 }); inkDoodle(c, WORDS[k].D, 0, -100, .74, 1, 5.5); }
  if (started && u < 1) { c.save(); c.globalAlpha = (1 - sx) * .25; c.fillStyle = INK; c.fill(path); c.restore(); }
  if (sx > .12) ln(c, pts, 4.5, 430 + k, true, INK, { amp: .6, corner: .5, p: .3 });
  c.restore();
}
function cardFace(k, t) {
  const flipped = t >= FLIP_AT[k] + FLIP_D, since = t - (FLIP_AT[k] + FLIP_D);
  if (!flipped) return { eyes: 'dot', gaze: [0, .9], mouth: 'flat', brows: 'calm' };
  if (since < .5) return { eyes: 'happy', mouth: 'grin', brows: 'up' };
  // then each their own: Ada's shh, Ben eyeing the penguin he has to draw, Cleo and Dev pleased
  return [
    { eyes: 'dot', gaze: [.6, .3], turn: .3, mouth: 'tight', brows: 'up' },
    { eyes: 'look', gaze: [0, 1], mouth: 'o', brows: 'worry' },
    { eyes: 'happy', mouth: 'grin' },
    { eyes: 'dot', gaze: [-.4, .6], mouth: 'smile', brows: 'up' },
  ][k];
}
// A finger to the lips: shh.
function shh(c, g, x, y, sc, k, seed) {
  if (k <= 0) return;
  const lift = (1 - easeOutBack(k)) * 120;
  c.save(); c.translate(x, y + lift); c.scale(sc, sc);
  shape(c, tube([[18, 150], [16, 96]], [22, 21]), g.top, seed, { w: 5 });
  shape(c, blob(10, 76, 25, 22, seed + 2, { amp: .05 }), null, seed + 3, { w: 5 });
  shape(c, tube([[2, 66], [2, 30], [2, 6]], [9.5, 9, 8.5]), null, seed + 5, { w: 4.5 });
  c.restore();
}
function cardsClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  ORDER.forEach((who, k) => {
    const g = CAST[who], x = CARD_X[k], f = cardFace(k, t2), seed = 1000 + k * 100 + bz(i);
    const bob = f.eyes === 'happy' ? -7 : 0, hy = 318 + bob;
    torso(c, g, [x, 440 + bob * .5], 114, 860, seed);
    neck(c, [x, 446], [x, hy + 80], seed + 50);
    head(c, g, x + (f.turn || 0) * 8, hy, 1.4, f, seed + 60, { tilt: (f.turn || 0) * .06 });
    if (k === 0) shh(c, g, x + 2, hy + 6, 1.4, win(t2, FLIP_AT[0] + FLIP_D + .5, FLIP_AT[0] + FLIP_D + .85), seed + 90);
    if (k === 1 && t2 > FLIP_AT[1] + FLIP_D + .5) { c.save(); c.translate(x, hy); c.scale(1.4, 1.4); sweatDrop(c, 60, -30 + (((t2 - 2.0) * .7) % 1) * 40, 1.3, seed + 95); c.restore(); }
  });
  c.save(); c.beginPath(); c.rect(0, 790, W, H - 790); c.clip(); blit(c, PAGE); c.restore();
  wash(c, curvePath([[-20, 792], [W + 20, 792], [W + 20, 900], [-20, 900]], true, .3), SEA, { al: .16, off: 1, seed: 450 });
  ln(c, [[-20, 792], [W + 20, 794]], 5, 451, false, INK, { amp: 1.2, p: .3 });
  ln(c, [[-20, 900], [W + 20, 898]], 5, 452, false, INK, { amp: 1.2, p: .3 });
  hatch(c, curvePath([[-20, 902], [W + 20, 900], [W + 20, 934], [-20, 936]], true, .3), [-20, 898, W + 40, 42], { angle: .8, gap: 9, len: 22, color: INK, alpha: .35, width: 2, seed: 453 });
  for (let k = 0; k < 4; k++) tentCard(c, k, tau);
}

// ---------------------------------------------------------------- clip 3: draw
// Four pages, everyone drawing at once, a stopwatch running down, PENS DOWN.
const PANELS = [
  { x: 440, y: 300, head: [138, 330], side: -1, from: .32, to: 3.25 },
  { x: 1000, y: 300, head: [1302, 330], side: 1, from: .28, to: 3.45 },
  { x: 440, y: 790, head: [138, 820], side: -1, from: .42, to: 3.15 },
  { x: 1000, y: 790, head: [1302, 820], side: 1, from: .38, to: 3.35 },
];
const PAGE_W = 430, PAGE_H = 390, DOWN_AT = 3.72;
function stopwatch(c, x, y, secs, tau) {
  const r = 92, hot = secs <= 10;
  c.save(); c.translate(x, y);
  c.save(); c.shadowColor = 'rgba(36,50,79,.22)'; c.shadowBlur = 12 * S; c.shadowOffsetY = 6 * S; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore();
  shape(c, rectPts(-16, -r - 30, 32, 24), null, 9101, { w: 4.5, base: '#ffffff', corner: .4, amp: .3 });
  // the time left, as an arc that empties
  c.save(); c.strokeStyle = alpha(hot ? RED : SEA, .9); c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, r - 16, -PI / 2, -PI / 2 + TAU * secs / 45); c.stroke(); c.restore();
  ln(c, ellPts(0, 0, r, r, 0, 48), 6, 9102, true, INK, { amp: .6, p: .4 });
  txt(c, `0:${String(secs).padStart(2, '0')}`, 0, 6, 70, { col: hot ? RED : INK });
  c.restore();
}
function pensDown(c, k) {
  const s = slam(k); if (s <= 0) return;
  c.save(); c.translate(CX, 545); c.rotate(-.06); c.scale(s, s);
  const w = 880, h = 190;
  c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 18 * S; c.shadowOffsetY = 10 * S; c.fillStyle = '#ffffff'; c.fill(roundRectPath(-w / 2, -h / 2, w, h, 26)); c.restore();
  c.save(); c.strokeStyle = INK; c.lineWidth = 12; c.stroke(roundRectPath(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 18)); c.restore();
  txt(c, 'PENS DOWN!', 0, 8, 128, { fit: w - 90 });
  c.restore();
}
function drawClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), down = tau >= DOWN_AT;
  PANELS.forEach((P, k) => {
    const { who, word, D } = WORDS[k], g = CAST[who], seed = 3000 + k * 100;
    const pk = win(tau, P.from, P.to), done = pk >= 1;
    // the guest, leaning in from the side
    const toward = -P.side;
    const f = down
      ? (k === 1 ? { eyes: 'look', gaze: [toward, .2], turn: toward * .4, mouth: 'O', brows: 'up', sweat: .4 } : { eyes: 'happy', mouth: 'grin', turn: toward * .3 })
      : k === 1
        ? { eyes: 'look', gaze: [toward, .4], turn: toward * .5, mouth: 'wobble', brows: 'worry', sweat: ((t2 * .9) % 1) }
        : { eyes: 'dot', gaze: [toward, .4], turn: toward * .5, mouth: done ? 'smile' : 'tight', brows: done ? 'up' : 'low' };
    const [hx, hy] = P.head, bob = down ? 0 : Math.sin(t2 * 9 + k) * 3;
    torso(c, g, [hx, hy + 92], 92, hy + 260, seed + bz(i));
    neck(c, [hx, hy + 96], [hx, hy + 52], seed + 20 + bz(i));
    head(c, g, hx, hy + bob, .98, f, seed + 40 + bz(i), { tilt: toward * .1 });
    // the page and the drawing on it
    sketchPage(c, P.x, P.y, PAGE_W, PAGE_H, seed + 70);
    txt(c, word, P.x - PAGE_W / 2 + 26, P.y - PAGE_H / 2 + 44, 36, { col: alpha(INK, .5), align: 'left' });
    const tip = inkDoodle(c, D, P.x, P.y + 18, 1.32, pk, 7.5);
    // the fingertip comes in to the first point, follows the line, then lifts away (on twos)
    const off = [P.side * -130, 190], first = [P.x + D[0].pts[0][0] * 1.32, P.y + 18 + D[0].pts[0][1] * 1.32];
    let at = null;
    if (!tip && t2 >= P.from - .3) at = mixv(add(first, off), first, easeOutQuint(win(t2, P.from - .3, P.from)));
    else if (tip && tau < P.to + .32) at = mixv(tip, add(tip, off), easeInOutSine(win(t2, P.to, P.to + .3)));
    if (at) pointHand(c, g, at, add(at, [P.side * -300, 330]), 0, seed + 80 + bz(i), .62);
  });
  const secs = 45 - Math.round(45 * win(tau, .3, 3.62));
  stopwatch(c, CX, 545, secs, tau);
  pensDown(c, tau - DOWN_AT);
}

// ---------------------------------------------------------------- clip 4: guess
// Ada guesses Ben's penguin: "bird" is wrong and drops away; "penguin" is right, while the speed tag runs down.
const POL = { x: 880, y: 430, size: 400, r: -.03 };
const IN = { x: 880, y: 842, w: 560, h: 150 };
const WRONG_AT = 1.5, RIGHT_AT = 2.8;
const typed = (s, a, b, tau) => s.slice(0, Math.floor(win(tau, a, b) * s.length + 1e-6));
function guessClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  // Ada, watching her phone
  const f = tau >= RIGHT_AT + .08 ? { eyes: 'happy', mouth: 'grin', brows: 'up', turn: .4 }
    : t2 >= WRONG_AT && t2 < 2.05 ? { eyes: 'look', gaze: [1, -.2], turn: .5, mouth: 'wobble', brows: 'worry' }
    : { eyes: 'dot', gaze: [1, -.25], turn: .55, mouth: 'tight', brows: 'calm' };
  const seed = 5000 + bz(i);
  figure(c, CAST.ada, 250, 960, 1.72, f, seed, { phone: true, tilt: .05, hop: f.eyes === 'happy' ? -10 : 0 });
  // the polaroid, dealt in
  const pop = easeOutBack(win(tau, .1, .4));
  if (pop > 0) polaroid(c, POL.x, POL.y, POL.size, POL.r, PENGUIN, 5100, { cap: 'by Ben', pop });
  // the speed bar: the pencil line runs down, the gold tag with it, and stops on the right answer
  const left = 1 - .54 * win(tau, .5, RIGHT_AT), pts = 50 + Math.round(50 * left);
  if (tau > .3) {
    c.save(); c.fillStyle = 'rgba(36,50,79,.1)'; c.fill(roundRectPath(610, 98, 520, 24, 12)); c.fillStyle = INK; c.fill(roundRectPath(610, 98, 520 * left, 24, 12)); c.restore();
    tag(c, `+${pts}`, 1262, 110, -.04, 5200, { w: 190, h: 88, pop: tau >= RIGHT_AT ? (slam(tau - RIGHT_AT) || 1) : 1 });
  }
  // the guess box
  const shake = t2 >= WRONG_AT && t2 < WRONG_AT + .25 ? Math.sin((t2 - WRONG_AT) * 60) * 12 : 0;
  c.save(); c.translate(IN.x + shake, IN.y); c.rotate(.012);
  sticky(c, IN.w, IN.h, NOTE.mint, 5300);
  const word = tau < 1.82 ? typed('bird', .85, 1.3, tau) : typed('penguin', 2.0, 2.6, tau);
  if (word) txt(c, word, -IN.w / 2 + 40, 6, 92, { align: 'left' });
  else if (tau < .85 || (tau > 1.82 && tau < 2.0)) txt(c, 'What is it?', -IN.w / 2 + 40, 6, 80, { align: 'left', col: alpha(INK, .3) });
  if (tau >= WRONG_AT && tau < 1.82) brush(c, [[-IN.w / 2 + 30, 10], [-IN.w / 2 + 210, 2]], { w: 12, color: RED, p: win(tau, WRONG_AT, WRONG_AT + .12), seed: 5310 });
  c.restore();
  // the wrong guess, dropped below, crossed out
  if (tau >= 1.82) {
    const dk = easeOutBack(win(tau, 1.82, 2.05)), y = lerp(IN.y + 40, 990, dk);
    txt(c, 'bird', 700, y, 66, { col: alpha(INK, .6), al: clamp(dk * 2, 0, 1) });
    brush(c, [[650, y + 4], [752, y - 2]], { w: 7, color: RED, p: 1, seed: 5320 });
    txt(c, '✕', 790, y + 2, 50, { col: RED, al: clamp(dk * 2, 0, 1), font: 'sans-serif' });
  }
  // Correct!
  const sk = slam(tau - RIGHT_AT);
  if (sk > 0) {
    c.save(); c.translate(POL.x, POL.y - 30); c.rotate(-.12); c.scale(sk, sk);
    c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 14 * S; c.shadowOffsetY = 8 * S; c.fillStyle = '#ffffff'; c.fill(roundRectPath(-210, -70, 420, 140, 22)); c.restore();
    c.save(); c.strokeStyle = GREEN; c.lineWidth = 10; c.stroke(roundRectPath(-198, -58, 396, 116, 14)); c.restore();
    txt(c, 'Correct!', -62, 6, 84, { fit: 250 });
    c.save(); c.fillStyle = GOLD; c.fill(roundRectPath(88, -32, 104, 64, 32)); c.restore();
    txt(c, `+${pts}`, 140, 4, 52);
    c.restore();
    star(c, POL.x - 200, POL.y - 110, 46, 5400, sk, -.2);
  }
}

// ---------------------------------------------------------------- clip 5: score
// Three guests name Ben's penguin; each +30 flies to Ben, who grins.
const GUESSERS = [{ who: 'cleo', y: 236 }, { who: 'dev', y: 536 }, { who: 'ada', y: 836 }];
const SAY_AT = k => .45 + k * .62, FLY_D = .5, BEN = [1112, 470], BEN_TAG = [1112, 905];
function bubble(c, x, y, s, seed, k) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  const w = 290, h = 108, pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 70, h / 2], [-w / 2 - 34, h / 2 + 36], [-w / 2 + 34, h / 2], [-w / 2, h / 2]];
  shape(c, pts, null, seed, { w: 5, base: '#ffffff', corner: .5, amp: .5 });
  txt(c, s, 0, 6, 66, { fit: w - 40 });
  c.restore();
}
function scoreClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), lands = GUESSERS.map((_, k) => SAY_AT(k) + .25 + FLY_D), n = lands.filter(a => tau >= a).length;
  // Ben
  const g = CAST.ben, seed = 6000 + bz(i);
  const f = n === 0 ? { eyes: 'look', gaze: [-1, 0], turn: -.4, mouth: 'flat', brows: 'worry' }
    : n < 3 ? { eyes: 'dot', gaze: [-1, .1], turn: -.3, mouth: 'smile', brows: 'up' }
    : { eyes: 'happy', mouth: 'grin', brows: 'up' };
  const hop = n === 3 ? -Math.max(0, Math.sin(win(t2, lands[2], lands[2] + .4) * PI)) * 26 : 0;
  const cheer = n === 3 && t2 >= lands[2] + .08;
  figure(c, g, BEN[0], BEN[1] + 430, 1.66, f, seed, cheer
    ? { hands: [[-118, -312], [122, -300]], elbows: null, up: 10, hop }
    : { hands: [[-96, 30], [96, 30]], elbows: [[-104, -60], [104, -60]] });
  // his drawing
  polaroid(c, 690, 430, 320, .05, PENGUIN, 6100, { cap: 'by Ben' });
  // Ben's tag: what his drawing has earned so far
  const since = n ? tau - lands[n - 1] : 9, pop = since < .2 ? [1.3, 1.18, 1.08, 1.02, 1][Math.floor(since * 24)] ?? 1 : 1;
  tag(c, String(30 * n), BEN_TAG[0], BEN_TAG[1], -.05, 6200, { w: 220, h: 104, pop });
  // the guessers, each calling it out
  GUESSERS.forEach((G, k) => {
    const at = SAY_AT(k), said = t2 >= at, sd = 6300 + k * 60 + bz(i);
    const gf = !said ? { eyes: 'dot', gaze: [1, 0], turn: .4, mouth: 'flat' } : t2 < at + .4 ? { eyes: 'wide', gaze: [1, 0], mouth: 'O', brows: 'up' } : { eyes: 'happy', mouth: 'grin' };
    head(c, CAST[G.who], 158, G.y, .9, gf, sd, { tilt: .05 });
    bubble(c, 386, G.y - 38, 'penguin!', 6400 + k, easeOutBack(win(tau, at, at + .18)));
    // the +30, flying to Ben's tag
    const fk = win(tau, at + .25, at + .25 + FLY_D);
    if (fk > 0 && fk < 1) {
      const p = arc([440, G.y - 40], [BEN_TAG[0] - 40, BEN_TAG[1] - 10], easeInOutSine(fk), 160);
      tag(c, '+30', p[0], p[1], -.1 + fk * .2, 6500 + k, { w: 130, h: 70, pop: 1 - fk * .25 });
    }
  });
}

// ---------------------------------------------------------------- clip 6: the board
const SKETCH_ROWS = [
  { who: 'ben', score: 290, f: { eyes: 'happy', mouth: 'grin' } },
  { who: 'cleo', score: 260, f: { eyes: 'dot', mouth: 'smile' } },
  { who: 'ada', score: 225, f: { eyes: 'dot', mouth: 'smile', turn: .2 } },
  { who: 'dev', score: 170, f: { eyes: 'dot', mouth: 'tight', brows: 'worry' } },
  { who: 'zed', score: 0, f: { eyes: 'closed', mouth: 'sleep', brows: 'sleep' } },
];
const boardClip = boardClipFor(SKETCH_ROWS);
