'use strict';
// Clips 1, 2, 3, 5 and 6 of word.html (clip 4, the wall, and the shared kit live in word.html).
// A classic script: it shares word.html's globals. Brief and beat sheet: the top of word.html.

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

// ---------------------------------------------------------------- clip 6: the board
const BOARD = { x: 720, y: 545, w: 1010, h: 964, r: -.012 };
const ROWS = [
  { who: 'cleo', score: 300, f: { eyes: 'happy', mouth: 'grin' } },
  { who: 'ada', score: 250, f: { eyes: 'dot', mouth: 'smile' } },
  { who: 'ben', score: 200, f: { eyes: 'dot', mouth: 'smile', turn: .2 } },
  { who: 'dev', score: 150, f: { eyes: 'dot', mouth: 'tight', brows: 'worry' } },
  { who: 'zed', score: 0, f: { eyes: 'closed', mouth: 'sleep', brows: 'sleep' } },
];
const ROW_Y = k => -212 + k * 150;
let STAMP = null;
function stampLayer() {
  if (STAMP) return STAMP;
  STAMP = layer(520, 170); const g = STAMP.getContext('2d'); g.setTransform(S, 0, 0, S, 0, 0);
  g.strokeStyle = RED; g.lineWidth = 11; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(14, 14, 492, 142, 16); g.stroke();
  g.fillStyle = RED; g.font = STAMP_FONT.replace('1px', '112px'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LOWEST', 260, 92);
  // rubber: worn specks and a lighter streak
  g.globalCompositeOperation = 'destination-out'; const r = rng(77);
  for (let q = 0; q < 260; q++) { g.globalAlpha = .5 + r() * .5; g.beginPath(); g.arc(r() * 520, r() * 170, .8 + r() * 3.2, 0, TAU); g.fill(); }
  g.globalAlpha = .18; g.fillRect(0, 108, 520, 10);
  return STAMP;
}
function boardClip(c, tau, i) {
  page(c);
  const tI = 1.9 + 6 / 24, kI = tau - tI, fI = Math.floor(kI * 24 + 1e-6), shake = fI >= 0 && fI < 4 ? [7, -4, 2, 0][fI] : 0;
  const t2 = twos(tau);
  c.save(); c.translate(BOARD.x, BOARD.y + shake); c.rotate(BOARD.r);
  // the card
  const hw = BOARD.w / 2, hh = BOARD.h / 2, pts = warp(rectPts(-hw, -hh, BOARD.w, BOARD.h), 91, 2.5, true, 40), path = curvePath(pts, true, .5);
  c.save(); c.shadowColor = 'rgba(36,50,79,.22)'; c.shadowBlur = 16 * S; c.shadowOffsetX = 6 * S; c.shadowOffsetY = 9 * S; c.fillStyle = CARD; c.fill(path); c.restore();
  c.save(); c.clip(path); c.strokeStyle = 'rgba(61,139,242,.22)'; c.lineWidth = 2.5; for (let k = 0; k < 5; k++) { const y = ROW_Y(k) - 75; c.beginPath(); c.moveTo(-hw, y); c.lineTo(hw, y); c.stroke(); } c.restore();
  ln(c, pts, 4.5, 92, true, INK, { amp: 1, corner: .5, p: .4 });
  // title
  writeOn(c, 'THE BOARD', 0, -hh + 82, 114, win(tau, .05, .45));
  brush(c, [[-230, -hh + 146], [0, -hh + 138], [236, -hh + 144]], { w: 12, color: SEA, p: win(tau, .4, .6), seed: 93 });
  // rows
  ROWS.forEach((R, k) => {
    const y = ROW_Y(k), at = .35 + k * .17, pk = easeOutBack(win(tau, at, at + .2)), lk = win(tau, at + .05, at + .35), tk = easeOutBack(win(tau, at + .12, at + .3));
    if (tau < at) return;
    const after = t2 > tI + .12, f = { ...R.f };
    if (after && k < 4) { f.gaze = [0, 1]; if (k !== 3) f.brows = 'up'; if (k === 0) { f.eyes = 'dot'; f.mouth = 'o'; } }
    if (k === 3 && after) f.sweat = ((t2 - tI) * .6) % 1;
    head(c, CAST[R.who], -hw + 116, y + 10, .78 * pk, f, 700 + k * 40 + bz(i), { tilt: k === 4 ? .32 : 0 });
    // the leader dots
    c.save(); c.fillStyle = alpha(INK, .5); const x0 = -hw + 228, x1 = 150; for (let x = x0; x < lerp(x0, x1, lk); x += 26) { c.beginPath(); c.arc(x, y + 14, 4, 0, TAU); c.fill(); } c.restore();
    if (tau >= at + .12) tag(c, String(R.score), hw - 140, y + 10, k % 2 ? .04 : -.04, 760 + k, { w: 210, h: 96, pop: tk });
    if (k === 4) {
      // Zed: asleep, phone face down beside him, z's drifting up
      const ph = [-hw + 226, y + 46];
      c.save(); c.translate(...ph); c.rotate(-.06); c.fillStyle = INK; c.fill(roundRectPath(-48, -14, 96, 28, 9)); dot(c, 30, -1, 5, 5, '#5a6888'); c.restore();
      for (let q = 0; q < 3; q++) { const u = ((t2 * .55 + q / 3) % 1); txt(c, 'z', -hw + 178 + u * 64 + q * 6, y - 44 - u * 84, 38 + u * 28, { al: Math.min(1, u * 4, (1 - u) * 3), rot: -.2 }); }
    }
  });
  // LOWEST: hovers, lifts, thumps (on ones)
  const sp = [16, ROW_Y(4) + 2];
  if (tau >= 1.9) {
    let s, al = 1;
    // raised and held for a beat (anticipation), then slammed down in three frames
    if (fI < 0) { const f = Math.floor((tau - 1.9) * 24 + 1e-6); s = [1.7, 1.78, 1.82, 1.82, 1.6, 1.3][f] ?? 1.3; al = [.3, .4, .45, .45, .6, .8][f] ?? .8; }
    else s = [.94, 1.04, .99][fI] ?? 1;
    c.save(); c.translate(...sp); c.rotate(-.1); c.scale(s * (fI === 0 ? 1.06 : 1), s);
    c.globalAlpha *= al; c.globalCompositeOperation = 'multiply';
    c.drawImage(stampLayer(), -275, -90, 550, 180); c.restore();
    if (fI >= 0 && fI < 5) { const r = rng(88); for (let q = 0; q < 9; q++) { const a = r() * TAU, d = 280 + r() * 60 + fI * 10; dot(c, sp[0] + Math.cos(a) * d * .95, sp[1] + Math.sin(a) * d * .32, 3 + r() * 5, 3 + r() * 5, RED); } }
  }
  c.restore();
}

// ---------------------------------------------------------------- clip 3: write
const BIG = { x: 548, y: 520, w: 640, h: 600, r: -.03 }, SMALL = { x: 1128, y: 556, w: 330, h: 300, r: .06 };
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

// ---------------------------------------------------------------- clip 1: wake
// Four asleep at a cafe table; the phones buzz; they jolt awake and grab them; WORD writes itself on.
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
function wakeClip(c, tau, i) {
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
  writeOn(c, 'WORD', CX, 126, 172, win(tau, 2.6, 3.3));
  brush(c, [[CX - 166, 210], [CX, 203], [CX + 172, 208]], { w: 16, color: SEA, p: win(tau, 3.3, 3.55), seed: 991 });
}
