'use strict';
// Clips 2, 3 and 5 of word.html, and its wake and board (clip 4, the wall, lives in word.html;
// the drawing kit, the wake clip and the board clip in board-kit.js).
// A classic script: it shares word.html's globals. Brief and beat sheet: the top of word.html.

// ---------------------------------------------------------------- clips 1 and 6: wake, board
const wakeClip = wakeClipFor('WORD', [-166, 172]);
const ROWS = [
  { who: 'cleo', score: 300, f: { eyes: 'happy', mouth: 'grin' } },
  { who: 'ada', score: 250, f: { eyes: 'dot', mouth: 'smile' } },
  { who: 'ben', score: 200, f: { eyes: 'dot', mouth: 'smile', turn: .2 } },
  { who: 'dev', score: 150, f: { eyes: 'dot', mouth: 'tight', brows: 'worry' } },
  { who: 'zed', score: 0, f: { eyes: 'closed', mouth: 'sleep', brows: 'sleep' } },
];
const boardClip = boardClipFor(ROWS);

// ---------------------------------------------------------------- clip 5: pick
// A fingertip taps three notes and a gold star stamps where it touched; a second hand taps Butter; Butter's tag counts up.
const notePoint = (q, lx, ly) => add([CLUES[q].x, CLUES[q].y], rot2([lx, ly], CLUES[q].r));
const TAPS = [
  { hand: 0, q: 0, at: .62, star: [96, -92], r: .2 },
  { hand: 0, q: 1, at: 1.32, star: [34, -92], r: -.15 },
  { hand: 0, q: 3, at: 2.02, star: [96, -88], r: .1 },
  { hand: 1, q: 1, at: 2.78, star: [112, -88], r: .25 },
];
const HANDS = [{ g: CAST.ada, off: [470, 1290], anchor: [600, 1500] }, { g: CAST.cleo, off: [1330, 1180], anchor: [1500, 1400] }];
const TAG_AT = [-36, 134];
function tapKeys(h) {
  const taps = TAPS.filter(T => T.hand === h), off = HANDS[h].off, K = [[0, ...off]];
  taps.forEach((T, k) => {
    const p = notePoint(T.q, ...T.star);
    if (k === 0 && T.at > .9) K.push([T.at - .58, ...off]);
    K.push([T.at - .2, p[0] + 40, p[1] + 96, easeIn]);
    K.push([T.at, p[0], p[1]]);
    K.push([T.at + .08, p[0], p[1], easeOut]);
    K.push([T.at + .24, p[0] + 34, p[1] + 92]);
  });
  K.push([taps[taps.length - 1].at + .66, ...off]);
  return K;
}
const TAP_KEYS = [tapKeys(0), tapKeys(1)];
function pickClip(c, tau, i) {
  page(c);
  c.save(); cam(c, 636, 552, 1.1);
  wallSheet(c);
  for (let q = 0; q < 5; q++) clueNote(c, q, 9);
  // stars
  TAPS.forEach((T, n) => {
    const k = tau - T.at, sk = stampK(k); if (sk <= 0) return;
    const p = notePoint(T.q, ...T.star); star(c, p[0], p[1], 40, 500 + n, sk, T.r);
    const f = Math.floor(k * 24); if (f >= 1 && f <= 4) for (let a = 0; a < 6; a++) { const an = a * TAU / 6 + .3, r0 = 56 + f * 6; ln(c, [[p[0] + Math.cos(an) * r0, p[1] + Math.sin(an) * r0], [p[0] + Math.cos(an) * (r0 + 16), p[1] + Math.sin(an) * (r0 + 16)]], 4.5, 520 + a, false, GOLD, { amp: .2 }); }
  });
  // Butter's tag: 100 for a fair clue, +50 a pick
  const ups = [TAPS[1].at, TAPS[3].at], n = ups.filter(a => tau >= a).length, since = n ? tau - ups[n - 1] : 9;
  const pop = since < .2 ? [1.3, 1.18, 1.08, 1.02, 1][Math.floor(since * 24)] ?? 1 : 1;
  const tp = notePoint(1, ...TAG_AT);
  tag(c, String(100 + 50 * n), tp[0], tp[1], -.1, 560, { w: 168, h: 80, pop });
  if (since < .7) txt(c, '+50', tp[0] + 150, tp[1] - 30 - since * 90, 66, { al: 1 - Math.max(0, since - .4) / .3 });
  // the hands, on twos
  const t2 = twos(tau);
  [1, 0].forEach(h => {
    const tip = key(t2, TAP_KEYS[h]), press = TAPS.some(T => T.hand === h && t2 >= T.at && t2 < T.at + .08) ? 1 : 0;
    if (tip[1] < 1150) pointHand(c, HANDS[h].g, tip, add(tip, sub(HANDS[h].anchor, HANDS[h].off)), press, 600 + h * 50 + bz(i));
  });
  c.restore();
}

// ---------------------------------------------------------------- clip 3: write
const BIG = { x: 548, y: 520, w: 640, h: 600, r: -.03 }, SMALL = { x: 1128, y: 556, w: 330, h: 300, r: .06 };
function writeClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  // the big note and its word
  c.save(); c.translate(BIG.x, BIG.y); c.rotate(BIG.r);
  sticky(c, BIG.w, BIG.h, NOTE.butter, 201);
  const wk = win(tau, .32, 1.5), tipL = writeOn(c, 'Butter', -54, -40, 170, wk);
  // the tick
  if (tau > 1.66) brush(c, [[178, -52], [208, -14], [228, 4], [300, -110]], { w: 26, color: GREEN, p: win(tau, 1.66, 1.9), seed: 211, taper: .5 });
  c.restore();
  const tip = add([BIG.x, BIG.y], rot2(tipL, BIG.r));
  // the 100 tag
  const tk = easeOutBack(win(tau, 2.0, 2.2)); if (tk > 0) tag(c, '100', BIG.x + 200, BIG.y + 238, -.06, 220, { w: 176, h: 84, pop: tk });
  // the small note: slides in, gets scribbled out, droops
  const sk = win(t2, 2.28, 2.62), slide = easeOutBack(sk, 1.2), droop = easeOutBack(win(t2, 3.2, 3.5), 2);
  if (sk > 0) {
    c.save(); c.translate(lerp(1640, SMALL.x, slide), SMALL.y + droop * 30); c.rotate(SMALL.r + (1 - sk) * .25 + droop * .16);
    sticky(c, SMALL.w, SMALL.h, NOTE.sky, 231, { lift: (1 - sk) * .6 });
    txt(c, 'Popcorn', 0, 14, 92, { fit: SMALL.w - 50 });
    const x1 = win(tau, 2.86, 2.98), x2 = win(tau, 3.0, 3.12);
    if (x1 > 0) brush(c, [[-128, -104], [-20, -10], [130, 112]], { w: 18, color: RED, p: x1, seed: 241, taper: .4 });
    if (x2 > 0) brush(c, [[122, -108], [10, -6], [-122, 118]], { w: 18, color: RED, p: x2, seed: 242, taper: .4 });
    c.restore();
  }
  const zk = easeOutBack(win(tau, 3.42, 3.62)); if (zk > 0) tag(c, '0', SMALL.x + 36, SMALL.y + 236, .1, 250, { w: 120, h: 80, pop: zk });
  // the pencil: arrives, writes, lifts away
  const ang = -.95, start = add([BIG.x, BIG.y], rot2([-54 - 210, -40], BIG.r));
  let pt, lift = 0;
  if (t2 < .32) { const u = easeOutQuint(win(t2, 0, .32)); pt = mixv([1500, -200], start, u); lift = 1 - u; }
  else if (t2 < 1.5) pt = tip;
  else { const u = easeInOutSine(win(t2, 1.5, 1.9)); const end = add([BIG.x, BIG.y], rot2([-54 + 214, -40], BIG.r)); pt = mixv(end, [1640, -260], u); lift = u; }
  if (t2 < 1.92) pencil(c, pt, ang, 260 + bz(i), lift);
}

// ---------------------------------------------------------------- clip 2: cards
const CARD_X = [219, 553, 887, 1221], CARD_W = 316, CARD_H = 290, CARD_B = 875;
const FLIP_AT = [.75, 1.25, 1.75, 2.25], FLIP_D = .29;
function popcornDoodle(c, x, y, s, seed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [kx, ky, r] of [[-22, -16, 15], [0, -26, 17], [22, -15, 15], [-10, -2, 13], [12, -4, 13]]) shape(c, blob(kx, ky, r, r * .9, seed + kx, { amp: .12 }), '#fff3c9', seed + kx + 3, { w: 3.6, amp: .5, al: .9 });
  const box = [[-30, -6], [30, -6], [22, 52], [-22, 52]];
  shape(c, box, null, seed + 9, { w: 4, corner: .3, amp: .4, base: CARD });
  c.save(); c.clip(curvePath(box, true, .3)); for (const sx of [-15, 0, 15]) { c.fillStyle = alpha(SEA, .55); c.fillRect(sx - 4, -10, 8, 70); } c.restore();
  ln(c, box, 4, seed + 10, true, INK, { corner: .3, amp: .4 });
  c.restore();
}
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
  // shadow on the table
  c.save(); c.fillStyle = 'rgba(36,50,79,.14)'; c.beginPath(); c.ellipse(x + 8, CARD_B + 4, CARD_W * .5 * sx + 6, 12, 0, 0, TAU); c.fill(); c.restore();
  c.save(); c.translate(x, CARD_B - hop); c.scale(sx * qx, qy);
  const pts = warp(rectPts(-CARD_W / 2, -CARD_H, CARD_W, CARD_H), 400 + (faceUp ? k : 0), 2, true, 30), path = curvePath(pts, true, .5);
  const ridge = [[-CARD_W / 2 + 4, -CARD_H], [-CARD_W / 2 + 16, -CARD_H - 16], [CARD_W / 2 - 16, -CARD_H - 16], [CARD_W / 2 - 4, -CARD_H]];   // the tent's far side, over the fold
  c.fillStyle = faceUp ? '#ece6d8' : '#c3d6f2'; c.fill(polyPath(ridge)); ln(c, ridge, 4, 435 + k, false, INK, { amp: .3, corner: .3 });
  c.fillStyle = faceUp ? CARD : NOTE.sky; c.fill(path);
  c.save(); c.clip(path); c.fillStyle = 'rgba(36,50,79,.07)'; c.fillRect(-CARD_W / 2, -CARD_H, CARD_W, 16); c.restore();   // the fold of the tent
  if (!faceUp) cardBack(c, 410);
  else if (k < 3) { txt(c, 'POPCORN', 0, -CARD_H + 92, 86, { fit: CARD_W - 38 }); popcornDoodle(c, 0, -88, 1.3, 420 + k); }
  else { txt(c, 'A snack', 0, -CARD_H + 92, 88, { fit: CARD_W - 38 }); txt(c, '?', 0, -78, 140); }
  if (started && u < 1) { c.save(); c.globalAlpha = (1 - sx) * .25; c.fillStyle = INK; c.fill(path); c.restore(); }
  if (sx > .12) ln(c, pts, 4.5, 430 + k, true, INK, { amp: .6, corner: .5, p: .3 });
  c.restore();
}
function cardFace(k, t) {
  const flipped = t >= FLIP_AT[k] + FLIP_D, since = t - (FLIP_AT[k] + FLIP_D);
  if (!flipped) return { eyes: 'dot', gaze: [0, .9], mouth: 'flat', brows: 'calm' };
  if (k < 3) {
    if (since < .5) return { eyes: 'happy', mouth: k === 2 ? 'grin' : 'smile', brows: 'up' };
    return [{ eyes: 'happy', mouth: 'smile' }, { eyes: 'dot', gaze: [0, .6], mouth: 'smile' }, { eyes: 'happy', mouth: 'grin' }][k];
  }
  // Dev: a beat, then sweat and eyes darting at the neighbours
  if (since < .2) return { eyes: 'look', gaze: [0, 1], mouth: 'flat', brows: 'up' };
  const darts = [[.2, -1], [.44, 1], [.66, -1], [.86, 1], [1.08, -1], [1.3, 1], [1.5, -1], [1.96, 1], [2.2, -1]];
  let g = -1; for (const [at, d] of darts) if (since >= at) g = d;
  return { eyes: 'look', gaze: [g, .2], turn: g * .45, mouth: 'wobble', brows: 'worry', sweat: ((since - .2) * .7) % 1 };
}
function cardsClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  // the four, behind the table
  ORDER.forEach((who, k) => {
    const g = CAST[who], x = CARD_X[k], f = cardFace(k, t2), seed = 1000 + k * 100 + bz(i);
    const bob = f.eyes === 'happy' ? -7 : 0, hy = 318 + bob;
    torso(c, g, [x, 440 + bob * .5], 114, 860, seed);
    neck(c, [x, 446], [x, hy + 80], seed + 50);
    head(c, g, x + (f.turn || 0) * 8, hy, 1.4, f, seed + 60, { tilt: (f.turn || 0) * .06 });
  });
  // the table
  c.save(); c.beginPath(); c.rect(0, 790, W, H - 790); c.clip(); blit(c, PAGE); c.restore();
  wash(c, curvePath([[-20, 792], [W + 20, 792], [W + 20, 900], [-20, 900]], true, .3), SEA, { al: .16, off: 1, seed: 450 });
  ln(c, [[-20, 792], [W + 20, 794]], 5, 451, false, INK, { amp: 1.2, p: .3 });
  ln(c, [[-20, 900], [W + 20, 898]], 5, 452, false, INK, { amp: 1.2, p: .3 });
  hatch(c, curvePath([[-20, 902], [W + 20, 900], [W + 20, 934], [-20, 936]], true, .3), [-20, 898, W + 40, 42], { angle: .8, gap: 9, len: 22, color: INK, alpha: .35, width: 2, seed: 453 });
  for (let k = 0; k < 4; k++) tentCard(c, k, tau);
}
