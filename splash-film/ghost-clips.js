'use strict';
// The ghost tutorial's six clips (ghost.html). A classic script: it loads after
// core.js, studio.js, cels.js, word-font.js, board-kit.js and night-clips.js and
// shares their globals (dusk, wallWindow, figure, glassesDoodle, slam, CHALK…).
// Zed is the ghost all the way through: the night film's little ghost, now with
// two nubs for hands so he can wave, shrug, catch and pass.

// ---------------------------------------------------------------- the ghost
// A ghost of any cast member: their head on a sheet. x, y is the head's centre; o.arms [left, right] are
// nub offsets from the sheet's shoulders (null for none); o.al fades the whole ghost; o.sc scales it.
function spook(c, g, x, y, f, seed, t, o = {}) {
  const { arms = null, al = 1, sc = 1 } = o;
  if (al <= 0) return;
  c.save(); c.translate(x, y); c.scale(sc, sc); c.globalAlpha *= al;
  const tail = [[-80, 20], [-84, 160], [-62, 210 + Math.sin(t * 6) * 10], [-30, 190], [0, 222 + Math.sin(t * 6 + 1) * 10], [30, 190], [62, 212 + Math.sin(t * 6 + 2) * 10], [84, 160], [80, 20]];
  c.save(); c.globalAlpha *= .92; shape(c, tail, '#cfe3ff', seed, { w: 5.5, base: '#f4f8ff', al: .6, corner: 1 }); c.restore();
  if (arms) arms.forEach((a, s) => {
    if (!a) return;
    const sx = s ? 74 : -74, p = [sx + a[0], 70 + a[1]];
    shape(c, tube([[sx * .9, 60], p], [24, 20]), '#cfe3ff', seed + 20 + s, { w: 5, base: '#f4f8ff', al: .5 });
  });
  head(c, g, 0, 0, 1.05, f, seed + 10);
  c.restore();
}
// Where a nub's tip is, in frame units, for a ghost drawn at x, y with scale sc.
const nubAt = (x, y, sc, side, a) => [x + ((side ? 74 : -74) + a[0]) * sc, y + (70 + a[1]) * sc];

// A puff of smoke, k 0..1 (grows and thins).
function puff(c, x, y, k, seed) {
  if (k <= 0 || k >= 1) return;
  const r = rng(seed);
  for (let q = 0; q < 9; q++) {
    const a = q / 9 * TAU + r() * .4, d = 60 + 150 * easeOut(k), rr = (52 + r() * 30) * (1 - k * .5);
    c.save(); c.globalAlpha = 1 - k;
    shape(c, blob(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, rr, rr * .8, seed + q, { amp: .08 }), null, seed + 30 + q, { w: 4.5, base: '#ffffff' });
    c.restore();
  }
}
// A speech bubble with words, k pops it in; o.ghostly makes it dotted and see-through.
function bubble(c, s, x, y, k, seed, o = {}) {
  const { w = 300, h = 140, tail = [-90, 110], size = 72, al = 1, ghostly = false } = o;
  if (k <= 0 || al <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k); c.globalAlpha *= al;
  const pts = [...blob(0, 0, w / 2, h / 2, seed, { amp: .05, n: 40 })];
  const path = curvePath(pts, true);
  c.fillStyle = ghostly ? 'rgba(255,255,255,.55)' : '#ffffff'; c.fill(path);
  if (ghostly) { c.save(); c.strokeStyle = INK; c.lineWidth = 5; c.setLineDash([14, 14]); c.lineCap = 'round'; c.stroke(path); c.restore(); }
  else ln(c, pts, 5, seed + 1, true, INK, { amp: .6 });
  ln(c, [[tail[0] * .3, h * .36], tail, [tail[0] * .05, h * .42]], 5, seed + 2, false, INK, { amp: .4 });
  txt(c, s, 0, 4, size, { fit: w - 50 });
  c.restore();
}
// A clue photo (a polaroid with the glasses doodle), centred, s its scale; o.tag writes a small line on the strip.
function polaroid(c, x, y, rot, s, seed, o = {}) {
  if (s <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const pts = warp(rectPts(-150, -150, 300, 330), seed, 1.5, true, 30);
  c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 16 * S; c.shadowOffsetY = 10 * S; c.fillStyle = '#ffffff'; c.fill(curvePath(pts, true, .4)); c.restore();
  c.fillStyle = '#e9eef8'; c.fillRect(-128, -128, 256, 220);
  glassesDoodle(c, 0, -18, .78, seed + 10);
  txt(c, o.tag ?? 'clue', 0, 128, 52, { col: '#4c566c' });
  ln(c, pts, 2.6, seed + 1, true, alpha(INK, .35), { amp: .4 });
  c.restore();
}

// ---------------------------------------------------------------- clip 1: rise
// Zed on his phone at the café. The screen goes to static; a puff; Zed floats up out of it as a little ghost,
// looks down at his sheet, and grins. BOO! writes itself on.
const STATIC = [.55, 1.45], POOF = 1.55, UP = [1.7, 2.7];
function riseClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 1190, 200, 250, 210, 12100);
  lamp(c, 300, 150, true, 12110);
  glow(c, 300, 200, 360, '#ffe6a8', .45);
  const Z = [720, 880], HEAD = [Z[0], Z[1] - 246 * 1.2];
  if (tau < POOF) {
    const shocked = t2 >= STATIC[0] + .35;
    const f = shocked ? { eyes: 'wide', gaze: [0, .8], mouth: 'O', brows: 'up' } : { eyes: 'dot', gaze: [0, 1], mouth: 'smile', brows: 'calm' };
    figure(c, CAST.zed, Z[0], Z[1], 1.2, f, 12200 + bz(i), { phone: true, hands: [[-34, -82], [36, -86]], up: shocked ? 6 : 0 });
    if (shocked) shockLines(c, HEAD[0], HEAD[1], 12290);
    // the screen: lit, then static
    const sk = win(tau, STATIC[0], STATIC[0] + .1);
    c.save(); c.translate(Z[0], Z[1] - 118 * 1.2); c.rotate(-.08); c.scale(1.2, 1.2);
    litScreen(c, 50, 92, 1);
    if (sk > 0) { const r = rng(12300 + i); c.fillStyle = INK; for (let q = 0; q < 26; q++) c.fillRect(-25 + r() * 44, -46 + r() * 88, 4 + r() * 12, 3); }
    c.restore();
  }
  c.save(); c.translate(0, 190); table(c);   // the table sits low, so Zed and his phone read above it
  if (tau >= POOF) {   // the phone left on the table, still all static
    phoneFlat(c, 720, 800, false, tau, 12400);
    const r = rng(12410 + i); c.fillStyle = CHALK; for (let q = 0; q < 10; q++) c.fillRect(688 + r() * 60, 791 + r() * 6, 3 + r() * 8, 2);
  }
  c.restore();
  puff(c, HEAD[0], HEAD[1] + 80, win(tau, POOF - .05, POOF + .7), 12500 + Math.floor(tau * 12));
  if (tau >= POOF) {
    const u = easeOutBack(win(tau, UP[0], UP[1])), bob = Math.sin(t2 * 3.4) * 14 * win(tau, UP[1] - .3, UP[1]);
    const gy = lerp(HEAD[1] + 40, 380, u) + bob;
    const look = t2 < UP[1] + .3 ? { eyes: 'wide', gaze: [0, 1], mouth: 'o', brows: 'up' }
      : t2 < UP[1] + .9 ? { eyes: 'look', gaze: [.4, .9], turn: .2, mouth: 'o', brows: 'up' } : { eyes: 'happy', mouth: 'grin', brows: 'up' };
    const wave = t2 > UP[1] + .9 ? Math.sin(t2 * 14) * 12 : 0;
    spook(c, CAST.zed, 720, gy, look, 12600 + bz(i), t2, { arms: [[-20, 10], t2 > UP[1] + .9 ? [44, -90 + wave] : [20, 10]], al: win(tau, POOF, POOF + .2) });
  }
  const wk = win(tau, 3.35, 3.85);
  if (wk > 0) writeOn(c, 'BOO!', 1080, 520, 170, wk, { rot: -.08 });
}

// ---------------------------------------------------------------- clip 2: mute
// The four chat at the table. Zed floats over them and calls out; his bubble is dotted and drifts
// through them. He tries louder. Nobody looks up. He shrugs.
const SAY = [{ at: .45, s: 'Hey!', x: 1000, y: 200 }, { at: 1.75, s: 'HELLO?', x: 470, y: 190 }];
const SHRUG_AT = 3.0;
function chatPose(k, t) {
  const L = { ...P0.look, f: { ...P0.look.f } };
  const turn = [.5, -.4, .45, -.5][k] * (Math.floor(t * 2 + k) % 2 ? 1 : .4);
  L.f = { eyes: 'dot', gaze: [turn, -.2], turn: turn * .6, mouth: (Math.floor(t * 4 + k) % 3) ? 'smile' : 'o', brows: 'calm' };
  L.head = [turn * 6, -252]; L.hands = [[-40, -56], [40, -60]];
  return L;
}
function muteClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), poses = ORDER.map((_, k) => chatPose(k, t2));
  c.save(); cam(c, 720, 520, 1);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 13200 + k * 200 + bz(i), 'back'));
  table(c); cup(c, 462, 790, 13900, i); cup(c, 980, 798, 13950, i);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 13200 + k * 200 + bz(i), 'front'));
  c.restore();
  // Zed, above: calls, calls louder, shrugs
  const shrug = t2 >= SHRUG_AT, gx = lerp(760, 720, easeInOutSine(win(tau, 0, 1.6))), gy = 250 + Math.sin(t2 * 3.2) * 12;
  const calling = SAY.some((s) => t2 >= s.at && t2 < s.at + .55);
  const f = shrug ? { eyes: 'dot', gaze: [0, .5], mouth: 'wobble', brows: 'worry', sweat: .4 } : calling ? { eyes: 'happy', mouth: 'O', brows: 'up' } : { eyes: 'look', gaze: [0, 1], turn: 0, mouth: 'smile', brows: 'up' };
  const arms = shrug ? [[-40, -70], [40, -70]] : calling ? [[-30, -60], [44, -120 + Math.sin(t2 * 16) * 12]] : [[-20, 10], [20, 10]];
  spook(c, CAST.zed, gx, gy, f, 13600 + bz(i), t2, { arms, sc: .82 });
  SAY.forEach((s, q) => {
    const pop = easeOutBack(win(tau, s.at, s.at + .2)), fall = win(tau, s.at + .7, s.at + 1.7);
    bubble(c, s.s, s.x, s.y + fall * 330, pop, 13700 + q * 10, { ghostly: true, al: 1 - fall, w: q ? 380 : 300, size: q ? 84 : 72, tail: q ? [130, 100] : [-120, 100] });
  });
  if (shrug) for (const s of [-1, 1]) ln(c, [[gx + s * 120, gy - 40], [gx + s * 150, gy - 70]], 5, 13800 + s, false, INK, { amp: .3 });
}

// ---------------------------------------------------------------- clip 3: a true photo
// Night. Zed floats by the moonlit window. A clue photo zigzags down out of the dark into his nubs;
// TRUE thumps onto it.
const CATCH = 2.0, STAMP_AT = 2.5;
function truthClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 1180, 210, 260, 220, 14100);
  const G = [470, 470 + Math.sin(t2 * 3) * 14];
  const got = tau >= CATCH;
  // the photo falls like a leaf, then sits in front of him
  const fu = win(tau, .25, CATCH), sway = Math.sin(fu * 9) * 120 * (1 - fu);
  const P = got ? [G[0] + 270, G[1] + 120] : [lerp(900, G[0] + 270, easeInOutSine(fu)) + sway, lerp(-220, G[1] + 120, easeIn(fu) * .4 + fu * .6)];
  const rot = got ? -.06 : Math.sin(fu * 9) * .35 * (1 - fu);
  const f = got ? (t2 < STAMP_AT + .2 ? { eyes: 'wide', gaze: [1, .4], mouth: 'O', brows: 'up' } : { eyes: 'happy', mouth: 'grin', brows: 'up' })
    : { eyes: 'look', gaze: [clamp((P[0] - G[0]) / 400, -1, 1), clamp((P[1] - G[1]) / 300, -1, 1)], turn: .2, mouth: 'o', brows: 'up' };
  const reach = got ? [[150, 30], [190, 60]] : fu > .6 ? [[60, -20], [110, -40]] : [[-20, 10], [20, 10]];
  spook(c, CAST.zed, G[0], G[1], f, 14200 + bz(i), t2, { arms: reach });
  polaroid(c, P[0], P[1], rot, .82, 14300);
  dusk(c, .72, [{ x: G[0], y: G[1] + 60, r: 360, k: .55 }, { x: P[0], y: P[1], r: 300, k: .6 }]);
  glow(c, G[0], G[1] + 60, 300, '#cfe3ff', .35);
  glow(c, P[0], P[1], 240, '#fff2c4', .22);
  // TRUE, stamped in blue ink across the photo
  const sk = slam(tau - STAMP_AT);
  if (sk > 0) {
    c.save(); c.translate(P[0] + 10, P[1] + 10); c.rotate(-.22); c.scale(sk, sk);
    c.globalAlpha = .9; c.strokeStyle = SEA; c.lineWidth = 10;
    const box = warp(rectPts(-140, -58, 280, 116), 14400, 2, true, 30); ln(c, box, 10, 14401, true, SEA, { amp: .8, corner: .4 });
    txt(c, 'TRUE', 0, 6, 96, { col: SEA, font: 'Impact, "Arial Black", sans-serif' });
    c.restore();
  }
}

// ---------------------------------------------------------------- clip 4: pass it on
// Night. Zed holds his photo, looks it over, and sends it; it glides along a dotted line into Ada's phone.
// Her screen lights, she sits up and stares at it. (A word card he could whisper instead was cut on 2026-10-16.)
const PICK4 = .9, SEND = [1.3, 2.4], LAND = 2.4;
function passClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), bob = Math.sin(t2 * 3.2) * 14;
  wallWindow(c, 720, 170, 220, 170, 15100);
  const G = [330, 470 + bob], A = [1130, 600];
  const PHONE = [A[0] - 40, A[1] + 420 - 118 * 1.15];
  const heard = tau >= LAND + .25;
  const af = heard ? (t2 < LAND + 1.1 ? { eyes: 'wide', gaze: [-.3, .9], mouth: 'O', brows: 'up' } : { eyes: 'look', gaze: [-.2, 1], turn: -.2, mouth: 'tight', brows: 'low' }) : { eyes: 'closed', mouth: 'sleep', brows: 'sleep' };
  figure(c, CAST.ada, A[0], A[1] + 420, 1.15, af, 15300 + bz(i), { up: heard ? 10 : 0, phone: true, tilt: heard ? 0 : .12 });
  if (heard && t2 < LAND + .7) shockLines(c, A[0], A[1] + 420 - 246 * 1.15, 15390);
  const picked = t2 >= PICK4;
  const zf = tau >= SEND[1] ? { eyes: 'happy', mouth: 'grin', brows: 'up' } : picked ? { eyes: 'look', gaze: [1, .2], turn: .4, mouth: 'smile', brows: 'up' } : { eyes: 'look', gaze: [(Math.floor(t2 * 2) % 2) ? 1 : -.2, .5], turn: .2, mouth: 'smile' };
  spook(c, CAST.zed, G[0], G[1], zf, 15200 + bz(i), t2, { arms: [[40, -30], [70, 20]] });
  dusk(c, .74, [{ x: G[0], y: G[1] + 60, r: 330, k: .5 }, { x: A[0], y: A[1] + 120, r: 320, k: heard ? .6 : .25 }]);
  glow(c, G[0], G[1] + 60, 300, '#cfe3ff', .3);
  // the photo: held, then flown to her phone along a dotted line, shrinking
  const u = easeInOutSine(win(tau, SEND[0], SEND[1]));
  const start = [G[0] + 250, G[1] + 120];
  const p = u > 0 ? arc(start, PHONE, u, 260) : start;
  if (tau >= SEND[0]) dotted(c, start, PHONE, u, CHALK, 30, 5);
  if (tau < LAND) polaroid(c, p[0], p[1], lerp(-.05, .3, u), lerp(.7, .18, u) * (picked && t2 < PICK4 + .2 ? 1.08 : 1), 15500);
  // her screen, lit, with the photo on it and his name
  if (tau >= LAND) {
    const lk = win(tau, LAND, LAND + .1);
    c.save(); c.translate(PHONE[0] + 40, PHONE[1]); c.rotate(-.08); c.scale(1.15, 1.15); litScreen(c, 50, 92, lk); c.restore();
    glow(c, PHONE[0] + 40, PHONE[1], 160, '#9cc6ff', .4 * lk);
    const pk = easeOutBack(win(tau, LAND + .1, LAND + .4));
    polaroid(c, A[0] - 330, A[1] - 210, -.08, .62 * pk, 15600, { tag: 'from Zed' });
  }
}

// ---------------------------------------------------------------- clip 5: Spirits
// Three ghosts in the dark (Zed, Cleo, Dev). Bubbles pass between them: a photo, "Ada?", "yes!".
// SPIRITS writes itself on.
const GH = [{ who: 'cleo', x: 330, y: 560, ph: 0 }, { who: 'dev', x: 1110, y: 520, ph: 1.7 }, { who: 'zed', x: 720, y: 780, ph: 3.1 }];
const TALK = [{ from: 0, at: .4, kind: 'photo', x: 470, y: 290 }, { from: 1, at: 1.25, kind: 'Ada?', x: 990, y: 260 }, { from: 2, at: 2.1, kind: 'yes!', x: 900, y: 560 }];
function spiritsClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  const now = TALK.filter((s) => t2 >= s.at).length - 1;
  GH.forEach((g, k) => {
    const y = g.y + Math.sin(t2 * 3 + g.ph) * 14, talking = now >= 0 && TALK[now].from === k && t2 < TALK[now].at + .6;
    const target = now >= 0 ? GH[TALK[now].from] : GH[2];
    const f = talking ? { eyes: 'happy', mouth: 'O', brows: 'up' } : { eyes: 'look', gaze: [clamp((target.x - g.x) / 300, -1, 1), clamp((target.y - g.y) / 300, -1, 1)], turn: clamp((target.x - g.x) / 600, -.5, .5), mouth: 'smile', brows: 'up' };
    spook(c, CAST[g.who], g.x, y, f, 16200 + k * 100 + bz(i), t2 + g.ph, { sc: .78, arms: talking ? [[-30, -50], [30, -50]] : [[-20, 10], [20, 10]] });
  });
  dusk(c, .78, GH.map((g) => ({ x: g.x, y: g.y + 50, r: 280, k: .55 })));
  GH.forEach((g) => glow(c, g.x, g.y + 50, 230, '#cfe3ff', .28));
  TALK.forEach((s, q) => {
    const k = easeOutBack(win(tau, s.at, s.at + .22));
    if (s.kind === 'photo') {
      bubble(c, '', s.x, s.y, k, 16500 + q, { w: 250, h: 190, tail: [-70, 130] });
      if (k > 0) polaroid(c, s.x, s.y - 4, -.06, .42 * k, 16550);
    } else bubble(c, s.kind, s.x, s.y, k, 16500 + q * 7, { w: 260, h: 130, size: 70, tail: q === 1 ? [90, 110] : [-110, 90] });
  });
  const wk = win(tau, 3.0, 3.6);
  if (wk > 0) { writeOn(c, 'SPIRITS', 720, 120, 140, wk, { col: CHALK }); brush(c, [[480, 196], [720, 188], [960, 194]], { w: 14, color: SEA, p: win(tau, 3.6, 3.85), seed: 16990 }); }
}

// ---------------------------------------------------------------- clip 6: still playing
// Day. Zed taps away at the morning game, and EVERY DAY's first line (play) ticks. Then he drops a
// ballot into the VOTE box and the second line (vote) ticks. Redrawn 2026-10-16: there is no ghost
// board any more, and ghosts vote at every Round Table, not only the final votes.
const BOARD6 = { x: 1020, y: 330 }, BALLOT = [2.45, 3.35], BOX = [1020, 850];
const GROWS = [{ n: 'play', at: 1.2 }, { n: 'vote', at: 3.45 }];
function playClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), G = [380, 470 + Math.sin(t2 * 3.2) * 12];
  const tapping = tau < 2.1, dropping = tau >= BALLOT[0];
  const f = tapping ? { eyes: 'look', gaze: [.2, 1], turn: .1, mouth: Math.floor(t2 * 6) % 2 ? 'tight' : 'smile', brows: 'low' } : dropping && t2 > BALLOT[1] ? { eyes: 'happy', mouth: 'grin', brows: 'up' } : { eyes: 'look', gaze: [1, .2], turn: .4, mouth: 'smile', brows: 'up' };
  const tap = tapping ? (Math.floor(t2 * 8) % 2 ? -14 : 0) : 0;
  spook(c, CAST.zed, G[0], G[1], f, 17200 + bz(i), t2, { arms: [[50, -10], [10, -20 + tap]] });
  if (tau < 2.3) {   // his phone, held in the nubs
    c.save(); c.translate(G[0] + 10, G[1] + 120); c.rotate(-.1); c.fillStyle = INK; c.fill(roundRectPath(-46, -70, 92, 140, 14)); litScreen(c, 76, 118, 1);
    dot(c, -14, (t2 * 140) % 90 - 40, 9, 9, SEA); c.fillStyle = alpha(INK, .35); c.fillRect(10, -50, 12, 40); c.fillRect(10, 20, 12, 36); c.restore();
  }
  // every day: play, then vote, each ticked as Zed does it
  const bk = easeOutBack(win(tau, .5, .8));
  if (bk > 0) {
    c.save(); c.translate(BOARD6.x, BOARD6.y); c.rotate(.03); c.scale(bk, bk);
    sticky(c, 520, 420, NOTE.sky, 17300);
    txt(c, 'EVERY DAY', 0, -130, 70, { fit: 440 });
    GROWS.forEach((r, q) => {
      const ry = -20 + q * 110, rk = win(tau, .9 + q * .2, 1.1 + q * .2);
      if (rk <= 0) return;
      c.save(); c.globalAlpha *= rk;
      ln(c, warp(rectPts(-170, ry - 32, 64, 64), 17350 + q, 1.2, true, 20), 4, 17360 + q, true, INK, { amp: .4, corner: .4 });
      txt(c, r.n, 60, ry, 64);
      const tk = win(tau, r.at, r.at + .2);
      if (tk > 0) brush(c, [[-160, ry - 2], [-140, ry + 20], [-100, ry - 30]], { w: 10, color: SEA, p: tk, seed: 17370 + q, smooth: false });
      c.restore();
    });
    c.restore();
  }
  // the ballot box, and the slip
  const xk = easeOutBack(win(tau, 2.2, 2.5));
  if (xk > 0) {
    c.save(); c.translate(BOX[0], BOX[1]); c.scale(xk, xk);
    shape(c, warp(rectPts(-170, -110, 340, 220), 17400, 2, true, 30), SEA, 17401, { w: 6, base: CARD, al: .35, corner: .4 });
    shape(c, warp(rectPts(-110, -130, 220, 26), 17410, 1.5, true, 30), null, 17411, { w: 5, base: INK, corner: .4 });
    txt(c, 'VOTE', 0, 20, 70, { fit: 300 });
    c.restore();
    const u = win(tau, BALLOT[0], BALLOT[1]);
    if (tau < BALLOT[0] - .15) { /* the slip appears with the box */ } else if (u < 1) {
      const p = u > 0 ? arc([G[0] + 140, G[1] + 40], [BOX[0], BOX[1] - 150], easeInOutSine(u), 220) : [G[0] + 140, G[1] + 40];
      c.save(); c.translate(p[0], p[1]); c.rotate(lerp(-.2, 0, u)); c.scale(lerp(1, .7, u), lerp(1, .7, u));
      shape(c, warp(rectPts(-70, -50, 140, 100), 17420, 1.5, true, 30), null, 17421, { w: 4.5, base: '#ffffff', corner: .4 });
      ln(c, [[-30, 0], [-8, 22], [34, -24]], 9, 17422, false, SEA, { amp: .4 });
      c.restore();
    } else {
      const k = win(tau, BALLOT[1], BALLOT[1] + .3);
      for (let q = 0; q < 3; q++) ln(c, [[BOX[0] - 60 + q * 60, BOX[1] - 160 - k * 20], [BOX[0] - 70 + q * 70, BOX[1] - 190 - k * 40]], 5, 17430 + q, false, INK, { amp: .3 });
    }
  }
}
