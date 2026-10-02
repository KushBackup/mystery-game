import React, { useMemo } from 'react';

/**
 * The Help app's drawings: little ballpoint doodles on a notebook page, the
 * kind a friend draws on a napkin to explain a game.
 *
 * Drawn as inline SVG from a tiny pen (`Pen` below), not as files. Each mark
 * is a smoothed path through slightly jittered points, inked twice (a firm
 * pass and a faint second pass that never quite lands on the first), which is
 * what makes it read as drawn rather than plotted. The jitter is seeded per
 * drawing, so a doodle is identical on every phone and every visit.
 *
 * On first paint the strokes draw themselves in order (os.css, `.os-sk`), then
 * hold still; under reduced motion they are simply there. Colour follows the
 * phone's palette: ink for lines, sea for washes, gold only on scores, red only
 * on death and the Killers.
 *
 * Every drawing is 320 x 160 and must stay role-neutral like the rest of Help.
 */

const INK = '#24324f';
const SEA = '#3D8BF2';
const RED = '#FF3B30';
const GOLD = '#FFCC33';
const GREEN = '#4CD964';

/** mulberry32: a small seeded generator, so a doodle never changes between renders. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/** A Catmull-Rom curve through the points, as cubic Béziers. */
function smooth(pts, closed = false) {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f(p[1][0])} ${f(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/** Points along a straight segment, `n` steps. */
const seg = (x1, y1, x2, y2, n) => Array.from({ length: n + 1 }, (_, i) => [x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);

/**
 * The pen. Each call adds marks; `marks` is what the drawing renders.
 * Sizes are in the 320 x 160 drawing's units.
 */
class Pen {
  constructor(seed) {
    this.r = rng(seed);
    this.marks = [];
  }

  wob(pts, amp) {
    return pts.map(([x, y], i) => (i === 0 || i === pts.length - 1)
      ? [x + (this.r() - 0.5) * amp, y + (this.r() - 0.5) * amp]
      : [x + (this.r() - 0.5) * 2 * amp, y + (this.r() - 0.5) * 2 * amp]);
  }

  /** Ink a line through `pts`: a firm pass and, unless `single`, a faint second one. */
  ink(pts, { w = 2.2, color = INK, amp = 0.7, closed = false, single = false } = {}) {
    this.marks.push({ kind: 'line', d: smooth(this.wob(pts, amp), closed), w, color });
    if (!single) this.marks.push({ kind: 'line', d: smooth(this.wob(pts, amp * 1.4), closed), w: w * 0.5, color, faint: true });
    return this;
  }

  line(x1, y1, x2, y2, o = {}) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    return this.ink(seg(x1, y1, x2, y2, Math.max(2, Math.round(len / 18))), o);
  }

  /** An open polyline with straight-ish sides (corners kept by doubling the vertex). */
  poly(pts, o = {}) {
    const out = [];
    pts.forEach((p, i) => {
      if (i === 0) { out.push(p); return; }
      const q = pts[i - 1];
      const n = Math.max(1, Math.round(Math.hypot(p[0] - q[0], p[1] - q[1]) / 20));
      out.push(...seg(q[0], q[1], p[0], p[1], n).slice(1));
    });
    return this.ink(out, { amp: 0.5, ...o });
  }

  /** A freehand curve through these points. */
  curve(pts, o = {}) {
    return this.ink(pts, o);
  }

  /** An ellipse drawn the way a hand draws one: from a random start, overshooting the join. */
  ellipse(cx, cy, rx, ry, o = {}) {
    const start = this.r() * Math.PI * 2;
    const n = Math.max(10, Math.round((rx + ry) / 3));
    const over = 0.18 + this.r() * 0.18;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const a = start + ((Math.PI * 2 + over) * i) / n;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    });
    return this.ink(pts, { amp: Math.min(0.9, (rx + ry) / 30), ...o });
  }

  circle(cx, cy, r, o = {}) {
    return this.ellipse(cx, cy, r, r, o);
  }

  /** A rounded rectangle, closed. */
  box(x, y, w, h, rad = 4, o = {}) {
    const k = rad;
    const pts = [
      ...seg(x + k, y, x + w - k, y, Math.max(1, Math.round(w / 22))),
      [x + w, y + k],
      ...seg(x + w, y + k, x + w, y + h - k, Math.max(1, Math.round(h / 22))).slice(1),
      [x + w - k, y + h],
      ...seg(x + w - k, y + h, x + k, y + h, Math.max(1, Math.round(w / 22))).slice(1),
      [x, y + h - k],
      ...seg(x, y + h - k, x, y + k, Math.max(1, Math.round(h / 22))).slice(1),
    ];
    return this.ink(pts, { amp: 0.55, closed: true, ...o });
  }

  /** A loose watercolour wash behind something. */
  wash(cx, cy, rx, ry, color = SEA, opacity = 0.22) {
    const n = 14;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n;
      const k = 0.86 + this.r() * 0.22;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
    this.marks.push({ kind: 'wash', d: smooth(pts, true), color, opacity });
    return this;
  }

  dot(x, y, r = 1.8, color = INK) {
    this.marks.push({ kind: 'dot', x, y, r, color });
    return this;
  }

  /** Hand lettering. */
  text(x, y, str, { size = 15, color = INK, rot = 0, anchor = 'middle', weight = 400 } = {}) {
    this.marks.push({ kind: 'text', x, y, str, size, color, rot: rot || (this.r() - 0.5) * 4, anchor, weight });
    return this;
  }

  /** Parallel hatching inside a box, for a dark top or a shadow. */
  hatch(x, y, w, h, { gap = 5, color = INK, w: sw = 1.1 } = {}) {
    for (let i = -h; i < w; i += gap) {
      const x1 = Math.max(x, x + i);
      const y1 = y + Math.max(0, -i);
      const x2 = Math.min(x + w, x + i + h);
      const y2 = y + Math.min(h, w - i);
      if (x2 - x1 > 2) this.ink([[x1, y1], [x2, y2]], { w: sw, color, amp: 0.4, single: true });
    }
    return this;
  }

  // --- Things people draw -------------------------------------------------

  /**
   * A person, head centred on (x, y), about 56 units tall at s = 1.
   * arms: down | up | phone | point | pointL | hips | ear | shh
   * face: smile | flat | wow | sly
   */
  person(x, y, { s = 1, arms = 'down', face = 'smile', top = null, color = INK } = {}) {
    const o = { color };
    this.circle(x, y, 8 * s, { ...o, w: 2.2 });
    // the face
    this.dot(x - 3 * s, y - 1 * s, 1.2 * s, color).dot(x + 3 * s, y - 1 * s, 1.2 * s, color);
    if (face === 'smile') this.curve([[x - 3.2 * s, y + 3 * s], [x, y + 4.8 * s], [x + 3.2 * s, y + 3 * s]], { ...o, w: 1.3, single: true, amp: 0.2 });
    if (face === 'flat') this.line(x - 2.6 * s, y + 3.6 * s, x + 2.6 * s, y + 3.6 * s, { ...o, w: 1.3, single: true, amp: 0.2 });
    if (face === 'wow') this.circle(x, y + 3.8 * s, 1.5 * s, { ...o, w: 1.2, single: true, amp: 0.1 });
    if (face === 'sly') this.curve([[x - 3 * s, y + 3.6 * s], [x + 0.5 * s, y + 4.4 * s], [x + 3.4 * s, y + 2.4 * s]], { ...o, w: 1.3, single: true, amp: 0.2 });
    // body and legs
    const sh = y + 15 * s;
    const hip = y + 32 * s;
    if (top) {
      // a jumper, so a top colour can be pointed at
      this.poly([[x - 7 * s, y + 10 * s], [x + 7 * s, y + 10 * s], [x + 6 * s, hip], [x - 6 * s, hip]], { ...o, closed: true, w: 1.8 });
      if (top === 'dark') this.hatch(x - 6 * s, y + 11 * s, 12 * s, hip - y - 12 * s, { gap: 3.2 * s, color });
    } else {
      this.line(x, y + 8.5 * s, x, hip, o);
    }
    this.poly([[x - 8 * s, y + 50 * s], [x, hip], [x + 8 * s, y + 50 * s]], { ...o, w: 2.2 });
    // arms
    const L = (ex, ey, bx = null, by = null) => (bx == null
      ? this.line(x - (top ? 6 : 0) * s, sh, ex, ey, o)
      : this.curve([[x - (top ? 6 : 0) * s, sh], [bx, by], [ex, ey]], o));
    const R = (ex, ey, bx = null, by = null) => (bx == null
      ? this.line(x + (top ? 6 : 0) * s, sh, ex, ey, o)
      : this.curve([[x + (top ? 6 : 0) * s, sh], [bx, by], [ex, ey]], o));
    if (arms === 'down') { L(x - 11 * s, y + 30 * s); R(x + 11 * s, y + 30 * s); }
    if (arms === 'up') { L(x - 15 * s, y - 4 * s); R(x + 15 * s, y - 4 * s); }
    if (arms === 'point') { L(x - 11 * s, y + 30 * s); R(x + 22 * s, y + 12 * s); }
    if (arms === 'pointL') { L(x - 22 * s, y + 12 * s); R(x + 11 * s, y + 30 * s); }
    if (arms === 'hips') { L(x - 8 * s, y + 31 * s, x - 13 * s, y + 23 * s); R(x + 8 * s, y + 31 * s, x + 13 * s, y + 23 * s); }
    if (arms === 'ear') { L(x - 11 * s, y + 30 * s); R(x + 9 * s, y - 1 * s, x + 14 * s, y + 10 * s); }
    if (arms === 'shh') { L(x - 11 * s, y + 30 * s); R(x + 1 * s, y + 4 * s, x + 11 * s, y + 14 * s); this.line(x + 1 * s, y + 1 * s, x + 1 * s, y + 7 * s, { ...o, w: 2 }); }
    if (arms === 'phone') {
      L(x + 8 * s, y + 21 * s, x - 6 * s, y + 25 * s);
      R(x + 10 * s, y + 21 * s);
      this.box(x + 5 * s, y + 14 * s, 8 * s, 12 * s, 1.5 * s, { ...o, w: 1.6 });
    }
    return this;
  }

  /** A sheet ghost, (x, y) the top of its head. */
  ghost(x, y, { s = 1, color = INK, wash = true } = {}) {
    if (wash) this.wash(x, y + 16 * s, 16 * s, 20 * s, SEA, 0.16);
    const pts = [
      [x - 12 * s, y + 34 * s], [x - 13 * s, y + 14 * s], [x - 9 * s, y + 3 * s], [x, y], [x + 9 * s, y + 3 * s],
      [x + 13 * s, y + 14 * s], [x + 12 * s, y + 34 * s], [x + 8 * s, y + 30 * s], [x + 4 * s, y + 35 * s],
      [x, y + 30 * s], [x - 4 * s, y + 35 * s], [x - 8 * s, y + 30 * s], [x - 12 * s, y + 34 * s],
    ];
    this.ink(pts, { color, amp: 0.5 });
    this.ellipse(x - 4 * s, y + 12 * s, 1.8 * s, 2.6 * s, { color, w: 1.6, single: true, amp: 0.1 });
    this.ellipse(x + 4 * s, y + 12 * s, 1.8 * s, 2.6 * s, { color, w: 1.6, single: true, amp: 0.1 });
    return this;
  }

  /** A phone, the screen washed in sea if `lit`. */
  phone(x, y, w = 34, h = 58, { lit = false } = {}) {
    if (lit) this.wash(x + w / 2, y + h / 2 - 3, w * 0.42, h * 0.38, SEA, 0.24);
    this.box(x, y, w, h, 6);
    this.box(x + 4, y + 8, w - 8, h - 18, 1.5, { w: 1.2, single: true });
    this.circle(x + w / 2, y + h - 5, 2.2, { w: 1.1, single: true, amp: 0.1 });
    return this;
  }

  moon(cx, cy, r) {
    this.wash(cx, cy, r * 1.1, r * 1.1, GOLD, 0.3);
    this.curve([[cx + r * 0.3, cy - r], [cx - r * 0.9, cy - r * 0.4], [cx - r * 0.8, cy + r * 0.6], [cx + r * 0.4, cy + r * 0.95]]);
    this.curve([[cx + r * 0.3, cy - r], [cx - r * 0.25, cy - r * 0.2], [cx - r * 0.1, cy + r * 0.5], [cx + r * 0.4, cy + r * 0.95]], { w: 1.8 });
    return this;
  }

  sparkle(cx, cy, r = 5, color = INK) {
    this.line(cx - r, cy, cx + r, cy, { w: 1.4, single: true, amp: 0.2, color });
    this.line(cx, cy - r, cx, cy + r, { w: 1.4, single: true, amp: 0.2, color });
    return this;
  }

  sun(cx, cy, r) {
    this.wash(cx, cy, r * 1.2, r * 1.2, GOLD, 0.4);
    this.circle(cx, cy, r);
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + 0.2;
      this.line(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4), cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10), { w: 1.6, single: true, amp: 0.3 });
    }
    return this;
  }

  /** A speech bubble; `tail` is the side its tail drops from. */
  bubble(x, y, w, h, { tail = 'left' } = {}) {
    this.box(x, y, w, h, 8);
    const tx = tail === 'left' ? x + 12 : x + w - 12;
    const dx = tail === 'left' ? -6 : 6;
    this.poly([[tx - 4, y + h - 1], [tx + dx, y + h + 9], [tx + 5, y + h - 1]], { w: 1.8 });
    return this;
  }

  /** A curved arrow with a hand-drawn head. */
  arrow(x1, y1, x2, y2, { bend = 0, color = INK } = {}) {
    const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
    const my = (y1 + y2) / 2 + (x2 - x1) * bend;
    this.curve([[x1, y1], [mx, my], [x2, y2]], { color, w: 1.8 });
    const a = Math.atan2(y2 - my, x2 - mx);
    const h = 7;
    this.poly([[x2 - Math.cos(a - 0.5) * h, y2 - Math.sin(a - 0.5) * h], [x2, y2], [x2 - Math.cos(a + 0.5) * h, y2 - Math.sin(a + 0.5) * h]], { color, w: 1.8, single: true });
    return this;
  }

  /** A clue photo: an instant print with a scribbled scene. */
  photo(x, y, w = 46, h = 54, { rot = 0, label = null } = {}) {
    this.marks.push({ kind: 'group-start', rot, cx: x + w / 2, cy: y + h / 2 });
    this.box(x, y, w, h, 2);
    this.box(x + 4, y + 4, w - 8, h - 18, 1, { w: 1.2, single: true });
    this.hatch(x + 5, y + 5, w - 10, h - 20, { gap: 5, w: 0.8 });
    if (label) this.text(x + w / 2, y + h - 3.5, label, { size: 9.5, rot: 0.01 });
    this.marks.push({ kind: 'group-end' });
    return this;
  }

  check(x, y, color = GREEN) {
    return this.poly([[x - 5, y], [x - 1, y + 4.5], [x + 6, y - 5]], { color, w: 2.6, single: true });
  }

  cross(x, y, color = RED, r = 5) {
    this.line(x - r, y - r, x + r, y + r, { color, w: 2.4, single: true });
    return this.line(x + r, y - r, x - r, y + r, { color, w: 2.4, single: true });
  }

  /** Scribbled "writing": a few wavy lines. */
  scribble(x, y, w, rows = 1, gap = 7) {
    for (let i = 0; i < rows; i++) {
      const len = w * (i === rows - 1 && rows > 1 ? 0.6 : 1);
      const count = Math.max(3, Math.round(len / 6));
      const pts = Array.from({ length: count }, (_, k) => [x + (len * k) / (count - 1), y + i * gap + (k % 2 ? -1.2 : 1.2)]);
      this.ink(pts, { w: 1.1, single: true, amp: 0.3 });
    }
    return this;
  }
}

// ---------------------------------------------------------------------------
// The drawings. One per topic, plus the hero. Coordinates are 320 x 160.

const DRAW = {
  hero: (k) => {
    k.moon(36, 40, 16).sparkle(64, 22).sparkle(18, 72, 3.5);
    k.sun(284, 40, 13);
    k.wash(196, 96, 24, 34, RED, 0.18);
    k.person(124, 72, { face: 'smile' });
    k.person(160, 72, { face: 'flat', arms: 'hips' });
    k.person(196, 72, { face: 'sly' });
    k.text(124, 50, '?', { size: 18 }).text(160, 50, '?', { size: 18 }).text(196, 50, '?', { size: 18 });
    k.arrow(60, 76, 98, 100, { bend: -0.25 });
    k.arrow(222, 100, 262, 70, { bend: -0.25 });
  },

  teams: (k) => {
    k.wash(92, 100, 74, 44, SEA, 0.2);
    k.person(48, 70).person(80, 66, { arms: 'up' }).person(112, 70).person(144, 68, { face: 'flat' });
    k.text(96, 152, 'Faithful', { size: 17 });
    k.text(186, 104, 'vs', { size: 18 });
    k.wash(254, 100, 46, 44, RED, 0.18);
    k.person(236, 70, { face: 'sly', arms: 'shh' }).person(274, 68, { face: 'sly' });
    k.text(256, 152, 'Killers', { size: 17, color: RED });
  },

  win: (k) => {
    k.wash(160, 74, 32, 34, GOLD, 0.35);
    // a trophy
    k.curve([[140, 48], [142, 78], [160, 90], [178, 78], [180, 48]]);
    k.line(138, 48, 182, 48);
    k.curve([[140, 54], [128, 56], [130, 68], [143, 70]], { w: 1.8 });
    k.curve([[180, 54], [192, 56], [190, 68], [177, 70]], { w: 1.8 });
    k.line(160, 90, 160, 104).box(146, 104, 28, 10, 2);
    k.sparkle(124, 36, 4).sparkle(198, 30, 5).sparkle(206, 84, 3);
    k.person(70, 74, { arms: 'up' }).person(100, 78, { arms: 'up' });
    k.person(222, 78, { arms: 'up' }).person(252, 74, { arms: 'up' });
    k.text(160, 146, 'one team wins', { size: 15 });
  },

  night: (k) => {
    k.moon(60, 44, 20).sparkle(96, 26).sparkle(30, 92, 3.5).sparkle(270, 30, 4).sparkle(296, 64, 3);
    k.person(160, 56, { arms: 'phone', face: 'flat' });
    k.phone(216, 40, 40, 70, { lit: true });
    k.moon(236, 70, 9);
    k.arrow(188, 76, 210, 76, { bend: 0.05 });
    k.text(236, 140, 'pick a move', { size: 15 });
    k.scribble(26, 130, 60, 1);
  },

  morning: (k) => {
    // a ringing alarm clock
    k.wash(56, 70, 34, 34, GOLD, 0.25);
    k.circle(56, 74, 26).circle(56, 74, 3, { w: 1.4, single: true });
    k.line(56, 74, 56, 58, { w: 2 }).line(56, 74, 66, 80, { w: 2 });
    k.ellipse(36, 46, 9, 6).ellipse(76, 46, 9, 6);
    k.line(40, 98, 34, 108).line(72, 98, 78, 108);
    k.curve([[18, 50], [12, 62], [16, 76]], { w: 1.4, single: true });
    k.curve([[94, 50], [100, 62], [96, 76]], { w: 1.4, single: true });
    k.text(56, 140, '07:00', { size: 16 });
    k.arrow(96, 92, 120, 92);
    // the three games
    k.box(130, 50, 52, 66, 6).bubble(140, 64, 32, 20).scribble(146, 74, 20, 1);
    k.text(156, 136, 'Word', { size: 14 });
    k.box(194, 50, 52, 66, 6);
    k.curve([[204, 98], [212, 70], [220, 92], [228, 64], [236, 96]], { w: 1.8 });
    k.text(220, 136, 'Sketch', { size: 14 });
    k.box(258, 50, 52, 66, 6);
    k.wash(284, 84, 14, 9, SEA, 0.3);
    k.curve([[272, 86], [282, 78], [296, 84], [284, 92], [272, 86]], { w: 1.8 });
    k.line(296, 84, 302, 78, { w: 1.6, single: true }).line(296, 84, 302, 90, { w: 1.6, single: true });
    k.text(284, 136, 'Run', { size: 14 });
  },

  board: (k) => {
    const rows = [['1', 'gold'], ['2', 'gold'], ['3', 'gold'], ['…', null], ['0', 'red']];
    rows.forEach(([n, tone], i) => {
      const y = 22 + i * 25;
      k.box(70, y, 160, 20, 4, { w: 1.6 });
      if (tone === 'gold') k.wash(84, y + 10, 9, 8, GOLD, 0.6);
      k.text(84, y + 15, n, { size: 14, color: tone === 'red' ? RED : INK, rot: 0.01 });
      k.circle(106, y + 10, 5, { w: 1.2, single: true });
      k.scribble(118, y + 10, 50, 1);
      if (tone === 'red') k.line(76, y + 10, 224, y + 10, { color: RED, w: 2.4 });
    });
    k.text(272, 138, 'taken', { size: 15, color: RED });
    k.arrow(262, 126, 236, 128, { bend: 0.1, color: RED });
    k.photo(244, 18, 38, 44, { rot: 6 });
    k.arrow(240, 38, 232, 38, { bend: 0 });
    k.ghost(30, 108, { s: 0.8 });
  },

  investigate: (k) => {
    k.person(70, 64, { arms: 'point', face: 'wow' });
    k.person(236, 64, { arms: 'hips', face: 'flat' });
    k.bubble(14, 10, 82, 34, { tail: 'right' });
    k.text(55, 33, 'dark top?', { size: 13 });
    k.bubble(230, 10, 70, 34, { tail: 'left' });
    k.text(265, 33, 'not me!', { size: 13 });
    k.photo(132, 56, 52, 60, { rot: -5, label: 'clue' });
    // a magnifying glass
    k.circle(178, 108, 13).line(187, 118, 200, 132, { w: 3.4 });
  },

  vote: (k) => {
    k.wash(160, 86, 22, 36, RED, 0.16);
    k.person(160, 58, { face: 'wow' });
    k.person(64, 62, { arms: 'point' });
    k.person(104, 76, { arms: 'point', s: 0.85 });
    k.person(256, 62, { arms: 'pointL' });
    k.person(216, 76, { arms: 'pointL', s: 0.85 });
    k.text(160, 30, '!', { size: 22, color: RED });
    k.text(160, 150, 'most votes leaves', { size: 15 });
  },

  ending: (k) => {
    // two ballot boxes
    [70, 150].forEach((x, i) => {
      k.box(x - 26, 70, 52, 44, 3);
      k.line(x - 12, 78, x + 12, 78, { w: 2.6, single: true });
      k.box(x - 9, 46, 18, 24, 1.5, { w: 1.4 });
      k.check(x, 58);
      k.text(x, 132, i ? 'vote 2' : 'vote 1', { size: 14 });
    });
    k.arrow(186, 92, 214, 92);
    k.wash(260, 86, 30, 26, GOLD, 0.35);
    k.poly([[234, 104], [228, 70], [246, 86], [260, 62], [274, 86], [292, 70], [286, 104]], { closed: true });
    k.text(260, 132, 'the end', { size: 14 });
  },

  word: (k) => {
    k.wash(64, 54, 40, 26, SEA, 0.25);
    k.box(24, 30, 80, 48, 6);
    k.text(64, 62, 'MANGO', { size: 17, weight: 700, rot: 0.01 });
    k.text(64, 96, 'most guests', { size: 13 });
    k.box(216, 30, 80, 48, 6);
    k.text(256, 62, 'Fruit', { size: 17, rot: 0.01 });
    k.text(256, 96, 'Killers', { size: 13, color: RED });
    // the wall
    ['sweet', 'yellow', 'summer'].forEach((w, i) => {
      const x = 106 + i * 54;
      k.box(x - 25, 108 + (i % 2) * 4, 50, 26, 2, { w: 1.4 });
      k.text(x, 125 + (i % 2) * 4, w, { size: 11 });
    });
    k.arrow(108, 54, 210, 54, { bend: 0 });
    k.text(158, 44, 'same game', { size: 12 });
  },

  sketch: (k) => {
    k.phone(56, 22, 70, 116, { lit: false });
    // a cat being drawn
    k.circle(91, 72, 15);
    k.poly([[80, 62], [82, 50], [88, 59]], { w: 1.8 });
    k.poly([[95, 59], [101, 50], [102, 62]], { w: 1.8 });
    k.dot(86, 70, 1.4).dot(96, 70, 1.4);
    k.line(70, 76, 82, 75, { w: 1, single: true }).line(100, 75, 112, 76, { w: 1, single: true });
    k.curve([[104, 96], [114, 102], [110, 112]], { w: 1.8 });
    k.person(236, 70, { arms: 'ear', face: 'wow' });
    k.bubble(180, 16, 48, 30, { tail: 'right' });
    k.text(204, 37, 'cat?', { size: 15 });
    k.check(272, 30);
  },

  run: (k) => {
    k.wash(160, 80, 150, 60, SEA, 0.14);
    // kelp pillars
    [[60, 10, 46], [150, 0, 34], [240, 10, 52]].forEach(([x, top, h]) => {
      k.box(x - 10, top, 20, h, 3, { w: 1.8 });
      k.box(x - 10, top + h + 42, 20, 128 - top - h - 42, 3, { w: 1.8 });
    });
    // the whale
    k.curve([[86, 82], [100, 68], [124, 72], [130, 84], [116, 94], [96, 92], [86, 82]], { w: 2.2 });
    k.poly([[86, 82], [74, 74], [78, 84], [72, 94], [86, 84]], { w: 1.8 });
    k.dot(120, 80, 1.6);
    k.curve([[110, 66], [108, 58], [113, 52]], { w: 1.3, single: true });
    // its path
    k.curve([[20, 110], [44, 96], [70, 92]], { w: 1.2, single: true });
    k.curve([[134, 84], [160, 66], [186, 80], [214, 90], [236, 76]], { w: 1.2, single: true });
    k.text(196, 30, 'tap!', { size: 16 });
    k.text(160, 152, 'your best run counts', { size: 14 });
  },

  faithful: (k) => {
    k.wash(120, 90, 50, 44, SEA, 0.18);
    k.person(100, 60, { arms: 'point', face: 'flat' });
    k.circle(136, 72, 13).line(127, 82, 118, 94, { w: 3.4 });
    // footprints
    [[176, 104], [198, 92], [222, 104], [244, 90], [268, 102]].forEach(([x, y]) => {
      k.ellipse(x, y, 4.5, 7, { w: 1.5 });
      k.circle(x, y + 11, 3, { w: 1.4, single: true });
    });
    k.text(222, 146, 'who went out?', { size: 14 });
  },

  killer: (k) => {
    k.wash(120, 86, 44, 48, RED, 0.18);
    k.person(120, 58, { arms: 'shh', face: 'sly' });
    k.text(160, 40, 'shh', { size: 16 });
    k.phone(198, 40, 40, 70, {});
    k.box(204, 56, 28, 10, 3, { w: 1.2, single: true, color: RED });
    k.box(204, 70, 22, 10, 3, { w: 1.2, single: true, color: RED });
    k.text(256, 140, 'a secret group', { size: 13 });
    k.moon(276, 36, 12);
  },

  doctor: (k) => {
    k.wash(176, 82, 36, 46, SEA, 0.25);
    k.person(196, 60, { face: 'smile' });
    k.curve([[150, 40], [166, 48], [166, 96], [150, 116], [134, 96], [134, 48], [150, 40]], { w: 2.4 });
    k.line(150, 64, 150, 84, { w: 2.6, color: SEA, single: true }).line(140, 74, 160, 74, { w: 2.6, color: SEA, single: true });
    k.arrow(56, 70, 120, 74, { bend: 0.15, color: RED });
    k.cross(124, 74, RED, 6);
    k.text(160, 146, 'safe tonight', { size: 15 });
  },

  detective: (k) => {
    k.phone(30, 40, 38, 64);
    k.phone(252, 40, 38, 64);
    k.text(49, 124, 'A', { size: 16 }).text(271, 124, 'B', { size: 16 });
    [0, 1, 2].forEach((i) => {
      k.curve([[78 + i * 10, 56], [84 + i * 10, 72], [78 + i * 10, 88]], { w: 1.4, single: true });
      k.curve([[242 - i * 10, 56], [236 - i * 10, 72], [242 - i * 10, 88]], { w: 1.4, single: true });
    });
    k.wash(160, 72, 34, 30, SEA, 0.2);
    k.circle(160, 66, 20).line(174, 80, 190, 96, { w: 3.6 });
    k.text(160, 74, '?', { size: 20 });
    k.text(160, 140, 'one of them?', { size: 15 });
  },

  ghost: (k) => {
    k.ghost(110, 30, { s: 1.6 });
    k.bubble(160, 26, 92, 36, { tail: 'left' });
    k.text(206, 50, '“shoes”', { size: 15 });
    k.person(266, 80, { arms: 'ear', face: 'wow', s: 0.9 });
    k.sparkle(60, 30, 4).sparkle(170, 104, 3).sparkle(40, 110, 3.5);
    k.text(110, 146, 'still playing', { size: 15 });
  },

  clues: (k) => {
    k.photo(24, 30, 64, 76, { rot: -5, label: 'a dark top' });
    k.arrow(100, 70, 140, 70, { bend: 0 });
    k.person(170, 54, { top: 'dark', s: 0.95 });
    k.person(220, 54, { top: 'pale', s: 0.95 });
    k.person(270, 54, { top: 'dark', s: 0.95 });
    k.check(170, 124).cross(220, 124, RED, 5).check(270, 124);
    k.text(220, 152, 'who matches?', { size: 14 });
  },

  lies: (k) => {
    k.box(28, 24, 112, 108, 8);
    k.circle(50, 46, 11, { w: 1.6 });
    k.scribble(68, 42, 56, 1);
    k.text(36, 78, 'top', { size: 12, anchor: 'start' });
    k.text(76, 78, 'white', { size: 13, anchor: 'start' });
    k.ellipse(92, 74, 26, 11, { color: RED, w: 1.8 });
    k.text(36, 102, 'glasses', { size: 12, anchor: 'start' }).text(92, 102, 'no', { size: 13, anchor: 'start' });
    k.check(124, 98);
    k.text(36, 124, 'shoes', { size: 12, anchor: 'start' }).scribble(80, 120, 30, 1);
    k.arrow(150, 74, 196, 74, { bend: -0.1, color: RED });
    k.person(240, 56, { top: 'dark', face: 'sly' });
    k.text(240, 150, 'really?', { size: 15, color: RED });
  },
};

/** Render one drawing. `id` is a key of DRAW; unknown ids render nothing. */
export default function HelpSketch({ id, seed = 7, className = '', label }) {
  const marks = useMemo(() => {
    const draw = DRAW[id];
    if (!draw) return null;
    const pen = new Pen([...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, seed));
    draw(pen);
    return pen.marks;
  }, [id, seed]);
  if (!marks) return null;

  // Nest photo groups (rotated prints); everything else is flat, in drawing order.
  let n = 0;
  const lines = marks.filter((m) => m.kind === 'line' && !m.faint).length;
  const step = Math.min(55, 1500 / Math.max(1, lines));
  const render = (list) => {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (m.kind === 'group-start') {
        let depth = 1;
        let j = i + 1;
        for (; j < list.length && depth; j++) {
          if (list[j].kind === 'group-start') depth++;
          if (list[j].kind === 'group-end') depth--;
        }
        out.push(<g key={`g${i}`} transform={`rotate(${m.rot} ${m.cx} ${m.cy})`}>{render(list.slice(i + 1, j - 1))}</g>);
        i = j - 1;
        continue;
      }
      if (m.kind === 'group-end') continue;
      if (m.kind === 'wash') {
        out.push(<path key={i} className="os-sk__wash" d={m.d} fill={m.color} fillOpacity={m.opacity} />);
      } else if (m.kind === 'dot') {
        out.push(<circle key={i} className="os-sk__dot" cx={m.x} cy={m.y} r={m.r} fill={m.color} style={{ '--d': `${Math.round(n * step)}ms` }} />);
      } else if (m.kind === 'text') {
        out.push(
          <text
            key={i}
            className="os-sk__text"
            x={m.x}
            y={m.y}
            fontSize={m.size}
            fontWeight={m.weight}
            fill={m.color}
            textAnchor={m.anchor}
            transform={`rotate(${f(m.rot)} ${m.x} ${m.y})`}
            style={{ '--d': `${Math.round(n * step)}ms` }}
          >
            {m.str}
          </text>,
        );
      } else {
        if (!m.faint) n++;
        out.push(
          <path
            key={i}
            className={`os-sk__line ${m.faint ? 'os-sk__line--faint' : ''}`}
            d={m.d}
            pathLength="1"
            fill="none"
            stroke={m.color}
            strokeWidth={m.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ '--d': `${Math.round(n * step)}ms` }}
          />,
        );
      }
    }
    return out;
  };

  return (
    <svg className={`os-sk ${className}`} viewBox="0 0 320 160" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {render(marks)}
    </svg>
  );
}
