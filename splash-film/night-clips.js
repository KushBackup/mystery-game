'use strict';
// The Night tutorial's eight clips (night.html). A classic script: it loads after
// core.js, studio.js, cels.js, word-font.js and board-kit.js and shares their globals.
// Every clip draws its scene on the kit's paper, then lays the dusk over it
// (multiplied navy, with pools where a lamp or a screen lights it), then draws
// what glows on top: screens, eyes in the dark, lettering.

const DUSK = '#34467c', CHALK = '#fbf8f0', SCREEN = '#dcebff', SHADOW = '#232c47', SHADOW_D = '#121828', PINK = '#d98fa0';

// ---------------------------------------------------------------- light
let DUSK_L = null;
// Night over the whole frame: k is how dark (0..1); pools [{ x, y, r, k }] are lit holes in it, in frame units.
function dusk(c, k, pools = []) {
  if (k <= 0) return;
  if (!DUSK_L) DUSK_L = layer();
  const g = DUSK_L.getContext('2d');
  g.setTransform(S, 0, 0, S, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  g.globalAlpha = clamp(k, 0, 1); g.fillStyle = DUSK; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  g.globalCompositeOperation = 'destination-out';
  for (const l of pools) {
    if (!(l.r > 0)) continue;
    const lk = l.k ?? 1, gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    gr.addColorStop(0, `rgba(0,0,0,${lk})`); gr.addColorStop(.5, `rgba(0,0,0,${lk * .65})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(l.x, l.y, l.r, 0, TAU); g.fill();
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(DUSK_L, 0, 0); c.restore();
}

// A window on the wall: the night sky (or the dawn), the moon or the sun, the frame. `day` 0..1 turns night to dawn.
function wallWindow(c, x, y, w, h, seed, o = {}) {
  const { day = 0, moon = 1, stars = 1 } = o;
  const pts = warp(rectPts(x - w / 2, y - h / 2, w, h), seed, 2, true, 30), path = curvePath(pts, true, .4);
  c.save(); c.clip(path);
  const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, mix('#16244d', '#7fb2f0', day)); g.addColorStop(1, mix('#2d4685', '#ffd9a3', day));
  c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h);
  if (stars * (1 - day) > 0) { const r = rng(seed + 5); c.fillStyle = alpha(CHALK, .85 * stars * (1 - day)); for (let q = 0; q < 14; q++) { c.beginPath(); c.arc(x - w / 2 + r() * w, y - h / 2 + r() * h * .7, 1.6 + r() * 2.2, 0, TAU); c.fill(); } }
  if (moon > 0 && day < 1) {
    const mx = x + w * .18, my = y - h * .16, mr = Math.min(w, h) * .16;
    c.save(); c.globalAlpha = moon * (1 - day);
    dot(c, mx, my, mr, mr, '#fffbe8'); dot(c, mx - mr * .45, my - mr * .2, mr * .92, mr * .92, mix('#16244d', '#2d4685', .4));
    c.restore();
  }
  if (day > 0) {   // the sun, coming up behind the sill
    const sy = y + h / 2 - h * .42 * easeOutQuint(day);
    dot(c, x - w * .1, sy, Math.min(w, h) * .17, Math.min(w, h) * .17, alpha('#ffcf7a', day));
  }
  c.restore();
  ln(c, pts, 7, seed + 1, true, INK, { amp: 1, corner: .4 });
  ln(c, [[x, y - h / 2], [x, y + h / 2]], 6, seed + 2, false, INK, { amp: .6 });
  ln(c, [[x - w / 2, y], [x + w / 2, y]], 6, seed + 3, false, INK, { amp: .6 });
  shape(c, warp(rectPts(x - w / 2 - 24, y + h / 2 - 4, w + 48, 26), seed + 4, 1.5, true, 30), SEA, seed + 5, { w: 5, base: CARD, al: .3, corner: .4 });
}

// ---------------------------------------------------------------- the shadows (the Killers, never a cast member)
// A hooded figure from the chest up, all shadow. x, y is the face; sc as a head. The eyes are drawn after the dusk (hoodEyes).
function hood(c, x, y, sc, seed, o = {}) {
  const { lean = 0 } = o;
  c.save(); c.translate(x, y); c.rotate(lean); c.scale(sc, sc);
  const cloak = [[-150, 330], [-136, 170], [-104, 92], [-92, -10], [-74, -92], [-36, -130], [0, -140], [36, -130], [74, -92], [92, -10], [104, 92], [136, 170], [150, 330]];
  shape(c, cloak, null, seed, { base: SHADOW, line: INK, w: 7, corner: 1.1 });
  shape(c, blob(0, -6, 50, 60, seed + 3, { amp: .04 }), null, seed + 4, { base: SHADOW_D, line: INK, w: 4.5 });
  ln(c, [[-70, 96], [-30, 130], [0, 120], [30, 130], [70, 96]], 4.5, seed + 5, false, alpha('#5c6a92', .8), { amp: .8 });   // the hood's fold
  c.restore();
}
// Two glints in the hood. look -1..1 slides them; narrow 0..1 squints them; blink closes them.
function hoodEyes(c, x, y, sc, o = {}) {
  const { look = 0, narrow = 0, lean = 0, blink = false } = o;
  c.save(); c.translate(x, y); c.rotate(lean); c.scale(sc, sc);
  for (const s of [-1, 1]) {
    const ex = s * 19 + look * 10, ey = -10;
    if (blink) ln(c, [[ex - 9, ey], [ex + 9, ey]], 4, 7 + s, false, CHALK, { amp: .2 });
    else {
      c.save(); c.translate(ex, ey); c.rotate(s * narrow * -.3);
      dot(c, 0, 0, 8, 8 * (1 - narrow * .65), CHALK);
      c.restore();
    }
  }
  c.restore();
}
// A shadow's arm reaching from the shoulder to `hand`, a mitten at the end; `press` flattens it on a screen.
function shadowArm(c, shoulder, elbow, hand, seed, press = 0) {
  shape(c, tube([shoulder, elbow, hand], [26, 22, 18]), null, seed, { base: SHADOW, line: INK, w: 5.5 });
  const d = norm(sub(hand, elbow)), a = Math.atan2(d[1], d[0]), hp = add(hand, mul(d, 14));
  shape(c, put(blob(0, 0, 22 - press * 3, 18 + press * 2, seed + 2, { amp: .06 }), hp[0], hp[1], a), null, seed + 3, { base: SHADOW, line: INK, w: 5 });
}

// ---------------------------------------------------------------- people and props
// A guest from the waist up (as sketch-clips.js), the waist at x, y, k times a head.
function figure(c, g, x, y, k, f, seed, o = {}) {
  const { hands = [[-38, -70], [38, -74]], elbows = [[-92, -36], [92, -38]], up = 0, tilt = 0, phone = false } = o;
  c.save(); c.translate(x, y); c.scale(k, k);
  const sh = [0, -150], hw = 86;
  torso(c, g, sh, hw, 260, seed);
  neck(c, add(sh, [0, 6]), [0, -192], seed + 20);
  head(c, g, 0, -246, 1, f, seed + 30, { tilt, up });
  if (phone) { c.save(); c.translate(0, -118); c.rotate(-.08); c.fillStyle = INK; c.fill(roundRectPath(-32, -54, 64, 108, 11)); c.restore(); }
  const shL = add(sh, [-hw + 14, 24]), shR = add(sh, [hw - 14, 24]);
  arm(c, g, shL, hands[0], -1, seed + 50, { elbow: elbows ? elbows[0] : null });
  arm(c, g, shR, hands[1], 1, seed + 60, { elbow: elbows ? elbows[1] : null });
  c.restore();
}
// A big exclamation mark that pops, with three shock ticks.
function bang(c, x, y, k, seed) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  shape(c, [[-12, -70], [12, -70], [7, 8], [-7, 8]], RED, seed, { w: 5, base: CHALK, corner: .4, amp: .5 });
  dot(c, 0, 34, 12, 12, INK);
  for (const a of [-2.5, -1.57, -.64]) ln(c, [[Math.cos(a) * 92, Math.sin(a) * 92 - 10], [Math.cos(a) * 122, Math.sin(a) * 122 - 10]], 5, seed + Math.round(a * 10), false, INK, { amp: .3 });
  c.restore();
}
// A dotted line from a to b, drawn on to k.
function dotted(c, a, b, k, col = CHALK, gap = 26, r = 5) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / gap);
  c.save(); c.fillStyle = col;
  for (let q = 0; q <= n * clamp(k, 0, 1); q++) { const u = q / Math.max(1, n); c.beginPath(); c.arc(lerp(a[0], b[0], u), lerp(a[1], b[1], u), r, 0, TAU); c.fill(); }
  c.restore();
}
// A phone screen that is lit: pale, a faint moon in the corner. Local coords, centred.
function litScreen(c, w, h, k = 1) {
  if (k <= 0) return;
  c.save(); c.globalAlpha *= k; c.fillStyle = SCREEN; c.fill(roundRectPath(-w / 2, -h / 2, w, h, Math.min(w, h) * .12));
  c.restore();
}
// The red ring the Killers' pick wears: dashed, with four ticks. Drawn after the dusk so it reads.
function targetRing(c, x, y, r, rot, seed, al = 1) {
  if (al <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha *= al;
  c.strokeStyle = RED; c.lineWidth = 9; c.lineCap = 'round'; c.setLineDash([26, 18]);
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.setLineDash([]);
  for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; c.beginPath(); c.moveTo(Math.cos(a) * (r - 22), Math.sin(a) * (r - 22)); c.lineTo(Math.cos(a) * (r + 22), Math.sin(a) * (r + 22)); c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- clip 1: night falls
// Four guests chat at the café table; the lamp clicks off, the moon is in the window;
// one by one their phones light their faces; they hunch over them. NIGHT writes itself on.
const OFF_AT = 1.05, LIT_AT = k => 1.75 + k * .22;
function talkPose(k, t) {
  const L = { ...P0.look, f: { ...P0.look.f } };
  if (t < OFF_AT + .1) {
    // chatting: heads up, turning to each other
    const turn = [.5, -.4, .45, -.5][k] * (Math.floor(t * 2 + k) % 2 ? 1 : .4);
    L.f = { eyes: 'dot', gaze: [turn, -.2], turn: turn * .6, mouth: (Math.floor(t * 4 + k) % 3) ? 'smile' : 'o', brows: 'calm' };
    L.head = [turn * 6, -252]; L.hands = [[-40, -56], [40, -60]];
  } else if (t < LIT_AT(k)) {
    L.f = { eyes: 'dot', gaze: [0, -.6], mouth: 'flat', brows: 'up' };   // the dark: looking up at the lamp
    L.head = [0, -256];
  } else {
    L.f = { eyes: 'dot', gaze: [0, 1], mouth: k === 1 ? 'tight' : 'smile', brows: 'calm' };
    L.head = [0, -238]; L.tilt = .06 * (k % 2 ? -1 : 1);
    L.hands = [[-34, -82], [36, -86]];   // drawn in close: nobody else sees the screen
  }
  return L;
}
function lamp(c, x, y, on, seed) {
  ln(c, [[x, -20], [x, y - 40]], 4, seed, false, INK, { amp: .4 });
  const shade = [[x - 70, y + 20], [x - 34, y - 40], [x + 34, y - 40], [x + 70, y + 20]];
  shape(c, shade, PINK, seed + 1, { w: 6, base: CARD, al: .7, corner: .5 });
  dot(c, x, y + 26, 18, 14, on ? '#fff3c4' : '#c9c3b6');
  ln(c, ellPts(x, y + 26, 18, 14, 0, 18), 4, seed + 2, true, INK, { amp: .3 });
}
function fallClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), on = tau < OFF_AT, poses = ORDER.map((_, k) => talkPose(k, t2));
  wallWindow(c, 1180, 210, 270, 230, 5100);
  lamp(c, 720, 150, on, 5110);
  c.save(); cam(c, 720, 590, 1.12);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 5200 + k * 200 + bz(i), 'back'));
  table(c); cup(c, 462, 790, 5900, i); cup(c, 980, 798, 5950, i);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 5200 + k * 200 + bz(i), 'front'));
  c.restore();
  // the dark: the lamp's warm pool, then nothing; the phones' cool pools
  const dk = on ? 0 : clamp((tau - OFF_AT) / .12, 0, 1) * .8;
  const lampPool = on ? [] : [];
  const scr = ORDER.map((_, k) => [(SEAT_X[k] - 720) * 1.12 + 720, (SEAT_Y - 150 - 590) * 1.12 + 540]);
  const pools = ORDER.map((_, k) => ({ x: scr[k][0], y: scr[k][1] - 40, r: 190, k: .75 * win(tau, LIT_AT(k), LIT_AT(k) + .2) }));
  if (on) glow(c, 720, 200, 380, '#ffe6a8', .55);
  dusk(c, dk, [...lampPool, ...pools]);
  // the screens, lit
  ORDER.forEach((_, k) => {
    const lk = win(tau, LIT_AT(k), LIT_AT(k) + .08);
    if (lk <= 0) return;
    c.save(); cam(c, 720, 590, 1.12); c.translate(SEAT_X[k], SEAT_Y - 118); c.rotate(-.08);
    litScreen(c, 50, 92, lk); c.restore();
    glow(c, scr[k][0], scr[k][1] - 40, 110, '#9cc6ff', .35 * lk);
  });
  // the word
  const wk = win(tau, 3.05, 3.7);
  if (wk > 0) { writeOn(c, 'NIGHT', 330, 150, 168, wk, { col: CHALK }); brush(c, [[150, 236], [330, 228], [508, 234]], { w: 14, color: SEA, p: win(tau, 3.7, 3.95), seed: 5990 }); }
}

// ---------------------------------------------------------------- clip 2: the Killers' poll
// Two hooded shadows lean over one phone: a poll of three faces. Each taps BEN; a red ring closes round him.
const POLL = { x: 930, y: 560, w: 420, h: 620, r: -.05 };
const ROWS = ['ada', 'ben', 'cleo'], ROW_Y2 = q => -130 + q * 150;
const TAPS2 = [{ at: 1.35, who: 0 }, { at: 2.1, who: 1 }];
const pollPoint = (lx, ly) => add([POLL.x, POLL.y], rot2([lx, ly], POLL.r));
function killersClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 250, 200, 220, 190, 6100);
  // the shadows, leaning in
  const H1 = { x: 330, y: 470, sc: 1.05, lean: .12 }, H2 = { x: 560, y: 520, sc: .95, lean: .2 };
  hood(c, H1.x, H1.y, H1.sc, 6200 + bz(i), { lean: H1.lean });
  hood(c, H2.x, H2.y, H2.sc, 6300 + bz(i), { lean: H2.lean });
  // the phone
  c.save(); c.translate(POLL.x, POLL.y); c.rotate(POLL.r);
  c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 20 * S; c.shadowOffsetY = 12 * S; c.fillStyle = INK; c.fill(roundRectPath(-POLL.w / 2, -POLL.h / 2, POLL.w, POLL.h, 46)); c.restore();
  c.restore();
  // the arms: each reaches to tap Ben's row in turn
  const ben = pollPoint(40, ROW_Y2(1));
  const reach = (T) => { const a = win(tau, T.at - .45, T.at - .05), back = win(tau, T.at + .35, T.at + .7); return clamp(a - back, 0, 1); };
  const arms = [
    { sh: [H1.x + 70, H1.y + 170], rest: [H1.x + 150, H1.y + 330], T: TAPS2[0] },
    { sh: [H2.x + 60, H2.y + 160], rest: [H2.x + 150, H2.y + 320], T: TAPS2[1] },
  ];
  // dusk before the lit screen
  dusk(c, .82, [{ x: POLL.x, y: POLL.y, r: 470, k: .55 }]);
  // the lit screen and the poll on it
  c.save(); c.translate(POLL.x, POLL.y); c.rotate(POLL.r);
  const sk = easeOut(win(tau, .15, .45));
  litScreen(c, POLL.w - 40, POLL.h - 70, sk);
  if (sk > 0) {
    txt(c, 'Who?', 0, -POLL.h / 2 + 80, 64, { al: sk });
    ROWS.forEach((who, q) => {
      const at = .5 + q * .16, pk = easeOutBack(win(tau, at, at + .2));
      if (pk <= 0) return;
      const y = ROW_Y2(q);
      c.save(); c.globalAlpha *= Math.min(1, pk);
      c.fillStyle = 'rgba(36,50,79,.08)'; c.fill(roundRectPath(-170, y - 58, 340, 116, 18));
      const votes = q === 1 ? TAPS2.filter(T => tau >= T.at).length : 0;
      const worry = q === 1 && votes === 2 && t2 > 2.75;
      const f = worry ? { eyes: 'look', gaze: [-.6, -.4], mouth: 'wobble', brows: 'worry', sweat: ((t2 - 2.75) * .7) % 1 } : { eyes: 'dot', mouth: 'smile' };
      head(c, CAST[who], -100, y + 6, .62 * Math.min(1.08, pk), f, 6400 + q * 30 + bz(i));
      for (let v = 0; v < votes; v++) {   // a tally mark per vote, ticked on
        const vk = win(tau, TAPS2[v].at, TAPS2[v].at + .1);
        ln(c, [[30 + v * 34, y - 30], [30 + v * 34 + 6 * vk, y - 30 + 60 * vk]], 9, 6500 + v, false, INK, { amp: .5 });
      }
      c.restore();
    });
  }
  c.restore();
  // the ring round Ben's row
  const rk = win(tau, 2.65, 3.1);
  if (rk > 0) {
    const ring = []; for (let a = 0; a <= TAU * 1.08; a += .12) ring.push(pollPoint(Math.cos(a - 2.6) * 200, ROW_Y2(1) + Math.sin(a - 2.6) * 84));
    brush(c, ring, { w: 12, color: RED, p: rk, seed: 6600, amp: 2.5 });
  }
  // arms over the phone, eyes over everything
  arms.forEach((A, q) => {
    const k = reach(A.T), tip = mixv(A.rest, add(ben, [-30 + q * 50, 30]), easeInOutSine(k)), press = tau > A.T.at - .05 && tau < A.T.at + .15 ? 1 : 0;
    if (k <= 0) return;
    shadowArm(c, A.sh, mixv(A.sh, tip, .5).map((v, j) => v + (j ? 60 : -20)), tip, 6700 + q * 20 + bz(i), press);
  });
  const narrow = win(tau, 3.1, 3.3);
  hoodEyes(c, H1.x, H1.y, H1.sc, { lean: H1.lean, look: .7, narrow, blink: t2 > 1.0 && t2 < 1.09 });
  hoodEyes(c, H2.x, H2.y, H2.sc, { lean: H2.lean, look: .8, narrow, blink: t2 > 3.6 && t2 < 3.69 });
}

// ---------------------------------------------------------------- clip 3: watch
// Ada peeks over a newspaper. A shadow sneaks along behind the counter to the door; her eyes follow it, then pop: "!".
const DOOR = { x: 1250, y: 560, w: 200, h: 470 };
const SNEAK = [[.45, 560], [3.25, 1210]];
const SPOT_AT = 2.15;
function newspaper(c, x, y, rot, seed) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const pts = warp(rectPts(-150, -110, 300, 250), seed, 2, true, 30);
  shape(c, pts, null, seed + 1, { w: 5, base: CARD, corner: .4, amp: .6 });
  ln(c, [[0, -104], [2, 134]], 3, seed + 2, false, alpha(INK, .35), { amp: .4 });
  txt(c, 'NEWS', -74, -66, 46, { font: 'Impact, "Arial Black", sans-serif' });
  for (let q = 0; q < 6; q++) { ln(c, [[-126, -16 + q * 24], [-24, -16 + q * 24]], 3, seed + 10 + q, false, alpha(INK, .4), { amp: .6 }); ln(c, [[24, -76 + q * 30], [126, -76 + q * 30]], 3, seed + 20 + q, false, alpha(INK, .4), { amp: .6 }); }
  c.restore();
}
function watchClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 690, 200, 230, 190, 7100);
  // the door, ajar, light behind it
  c.save(); c.fillStyle = '#ffe9b8'; c.fillRect(DOOR.x - DOOR.w / 2, DOOR.y - DOOR.h / 2, DOOR.w, DOOR.h); c.restore();
  shape(c, [[DOOR.x - DOOR.w / 2, DOOR.y - DOOR.h / 2], [DOOR.x - DOOR.w / 2 + 70, DOOR.y - DOOR.h / 2 + 20], [DOOR.x - DOOR.w / 2 + 70, DOOR.y + DOOR.h / 2 - 10], [DOOR.x - DOOR.w / 2, DOOR.y + DOOR.h / 2]], '#a87b54', 7150, { w: 6, base: CARD, al: .6, corner: .3 });
  ln(c, warp(rectPts(DOOR.x - DOOR.w / 2 - 14, DOOR.y - DOOR.h / 2 - 14, DOOR.w + 28, DOOR.h + 28), 7160, 1.5, true, 30), 7, 7161, true, INK, { amp: .8, corner: .4 });
  // the shadow, sneaking (on twos, a bob per step), clipped by the doorway once it reaches it
  const u = win(t2, SNEAK[0][0], SNEAK[1][0]), sx = lerp(SNEAK[0][1], SNEAK[1][1], easeInOutSine(u)), bobY = Math.abs(Math.sin(u * Math.PI * 7)) * -18;
  const gone = sx > DOOR.x - 40;
  if (u < 1) {
    c.save();
    if (gone) { c.beginPath(); c.rect(0, 0, DOOR.x - DOOR.w / 2 + 70, H); c.clip(); }
    hood(c, sx, 520 + bobY, .8, 7200 + bz(i), { lean: .18 });
    c.restore();
  }
  // the counter, in front of the shadow's legs
  shape(c, warp(rectPts(-40, 700, W + 80, 420), 7300, 2, true, 40), SEA, 7301, { w: 6, base: CARD, al: .4, corner: .4 });
  ln(c, [[-30, 742], [W + 30, 736]], 5, 7302, false, INK, { amp: 1 });
  // Ada behind her paper
  const spotted = t2 >= SPOT_AT, look = clamp((sx - 300) / 700, -.2, 1);
  const f = spotted ? { eyes: 'wide', gaze: [1, 0], mouth: 'O', brows: 'up' } : { eyes: 'look', gaze: [look, 0], turn: look * .3, brows: t2 > 1.4 ? 'low' : 'calm', mouth: 'flat' };
  head(c, CAST.ada, 300, 552 - (spotted ? 14 : 0), 1.05, f, 7400 + bz(i), { up: spotted ? 12 : 0 });
  newspaper(c, 300, 760, -.03, 7450);
  for (const s of [-1, 1]) shape(c, put(blob(0, 0, 22, 18, 7460 + s, { amp: .06 }), 300 + s * 156, 720), null, 7462 + s, { w: 5 });
  // the dark, lit at Ada and the doorway
  dusk(c, .72, [{ x: 300, y: 600, r: 330, k: .65 }, { x: DOOR.x, y: DOOR.y, r: 260, k: .5 }]);
  if (u < 1) {
    c.save(); if (gone) { c.beginPath(); c.rect(0, 0, DOOR.x - DOOR.w / 2 + 70, H); c.clip(); }
    hoodEyes(c, sx, 520 + bobY, .8, { lean: .18, look: spotted ? -1 : .6, narrow: spotted ? 0 : .3 });
    c.restore();
  }
  // her line of sight, and the "!"
  if (spotted) {
    const eye = [330, 530], to = gone ? [DOOR.x - 50, 500] : [sx - 30, 500 + bobY];
    dotted(c, eye, to, win(tau, SPOT_AT, SPOT_AT + .25), alpha(CHALK, .9));
    bang(c, 300, 340, slam(tau - SPOT_AT - .05), 7500);
  }
}
function slam(k) { const f = Math.floor(k * 24 + 1e-6); if (f < 0) return 0; return [1.6, .84, 1.08, .98][f] ?? 1; }

// ---------------------------------------------------------------- clip 4: dig through the logs
// Ben at his desk under a lamp. A long log curls out of his phone; a magnifier runs along it, stops, and a clue photo pops up.
const LOG = { x0: 610, x1: 1330, y: 760 };
const STOP_AT = 2.3, PHOTO_AT = 2.6;
function glassesDoodle(c, x, y, s, seed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sx of [-1, 1]) { c.save(); c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.arc(sx * 62, 0, 46, 0, TAU); c.stroke(); c.restore(); wash(c, circPath(sx * 62, 0, 40), SEA, { al: .25, off: 2, seed: seed + sx }); }
  ln(c, [[-18, -8], [0, -18], [18, -8]], 8, seed + 3, false, INK, { amp: .3 });
  ln(c, [[-108, -6], [-140, -22]], 8, seed + 4, false, INK, { amp: .3 }); ln(c, [[108, -6], [140, -22]], 8, seed + 5, false, INK, { amp: .3 });
  c.restore();
}
function digClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 1180, 190, 230, 190, 8100);
  // Ben behind the desk
  const mx = tau < STOP_AT ? lerp(LOG.x0 + 120, 1080, easeInOutSine(win(tau, .8, STOP_AT))) : 1080;
  const got = t2 >= PHOTO_AT;
  const f = got ? (t2 < PHOTO_AT + .5 ? { eyes: 'wide', gaze: [1, -.4], mouth: 'O', brows: 'up' } : { eyes: 'happy', mouth: 'grin', brows: 'up' }) : { eyes: 'look', gaze: [clamp((mx - 600) / 300, -.5, 1), .7], turn: .3, mouth: 'tight', brows: 'low' };
  figure(c, CAST.ben, 420, 900, 1.25, f, 8200 + bz(i), { hands: [[60, 40], [150, 30]], elbows: [[-70, -10], [130, -50]] });
  // the desk
  shape(c, warp(rectPts(-40, 790, W + 80, 330), 8300, 2, true, 40), '#a87b54', 8301, { w: 6, base: CARD, al: .45, corner: .4 });
  // the desk lamp
  ln(c, [[150, 790], [170, 560], [270, 470]], 9, 8310, false, INK, { amp: .5 });
  shape(c, [[220, 430], [330, 440], [320, 510], [240, 520]], PINK, 8311, { w: 6, base: CARD, al: .7, corner: .5 });
  // the phone, and the log curling out of it across the desk
  c.save(); c.translate(560, 780); c.rotate(-.05); c.fillStyle = INK; c.fill(roundRectPath(-60, -18, 120, 34, 9)); c.restore();
  const lk = easeOut(win(tau, .1, .8)), end = lerp(LOG.x0, LOG.x1, lk);
  if (lk > 0) {
    const strip = [[LOG.x0, LOG.y - 26]]; for (let x = LOG.x0; x <= end; x += 30) strip.push([x, LOG.y - 26 + Math.sin(x * .02) * 6]);
    const bottom = strip.slice().reverse().map(([x, y]) => [x, y + 60]);
    shape(c, [...strip, ...bottom], null, 8320, { w: 4.5, base: '#ffffff', corner: .6, amp: .5 });
    for (let x = LOG.x0 + 20; x < end - 30; x += 64) { ln(c, [[x, LOG.y - 10], [x + 40, LOG.y - 10]], 3, 8330 + x, false, alpha(INK, .45), { amp: .3 }); ln(c, [[x, LOG.y + 12], [x + 26 + (x % 3) * 6, LOG.y + 12]], 3, 8340 + x, false, alpha(INK, .45), { amp: .3 }); }
  }
  // the line it found
  if (tau >= STOP_AT) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = alpha('#ffe08a', .8 * win(tau, STOP_AT, STOP_AT + .15)); c.fillRect(1040, LOG.y - 22, 90, 24); c.restore(); }
  // the magnifier
  if (tau > .7) {
    const my = LOG.y - 10 + (tau < STOP_AT ? Math.sin(tau * 9) * 4 : 0);
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = alpha('#cfe3ff', .5); c.beginPath(); c.arc(mx, my, 70, 0, TAU); c.fill(); c.restore();
    ln(c, ellPts(mx, my, 70, 70, 0, 40), 10, 8350, true, INK, { amp: .5 });
    shape(c, tube([[mx + 50, my + 50], [mx + 130, my + 140]], [14, 16]), '#a87b54', 8351, { w: 5, base: CARD, al: .7 });
  }
  // the photo: one true answer
  const pk = easeOutBack(win(tau, PHOTO_AT, PHOTO_AT + .3));
  if (pk > 0) {
    const px = lerp(1080, 1020, pk), py = lerp(740, 400, pk);
    c.save(); c.translate(px, py); c.rotate(.06 * pk); c.scale(pk, pk);
    const pts = warp(rectPts(-150, -150, 300, 330), 8400, 1.5, true, 30);
    c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 16 * S; c.shadowOffsetY = 10 * S; c.fillStyle = '#ffffff'; c.fill(curvePath(pts, true, .4)); c.restore();
    c.fillStyle = '#e9eef8'; c.fillRect(-128, -128, 256, 220);
    glassesDoodle(c, 0, -18, .78, 8410);
    txt(c, 'clue', 0, 128, 52, { col: '#4c566c' });
    ln(c, pts, 2.6, 8401, true, alpha(INK, .35), { amp: .4 });
    c.restore();
  }
  dusk(c, .7, [{ x: 330, y: 600, r: 520, k: .8 }, { x: 1020, y: 420, r: 260 * pk, k: .6 }]);
  if (pk > 0) glow(c, 1020, 400, 260, '#fff2c4', .25 * pk);
}

// ---------------------------------------------------------------- clip 5: the Doctor
// Ben asleep. A red ring homes in on him; Cleo throws up a shield; it bounces off. Ben sleeps on.
const RING_HIT = 1.85;
function shieldShape(c, x, y, s, rot, seed) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const pts = [[0, -150], [118, -110], [112, 10], [70, 100], [0, 150], [-70, 100], [-112, 10], [-118, -110]];
  shape(c, pts, SEA, seed, { w: 8, base: CARD, al: .75, corner: 1.1 });
  const heart = [[0, 50], [-52, 0], [-56, -34], [-30, -56], [0, -34], [30, -56], [56, -34], [52, 0]];
  shape(c, heart, PINK, seed + 2, { w: 6, base: CARD, al: .9, corner: 1.2 });
  c.restore();
}
function doctorClip(c, tau, i) {
  page(c);
  const t2 = twos(tau);
  wallWindow(c, 250, 200, 220, 190, 9100);
  // Ben asleep in a chair, a blanket
  const B = [1060, 600];
  shape(c, [[B[0] - 150, 1120], [B[0] - 160, B[1] + 40], [B[0] - 110, B[1] - 10], [B[0] + 120, B[1]], [B[0] + 160, B[1] + 50], [B[0] + 150, 1120]], '#a87b54', 9199, { w: 6, base: CARD, al: .5, corner: .7 });
  shape(c, [[B[0] - 170, 1120], [B[0] - 150, B[1] + 110], [B[0] + 150, B[1] + 120], [B[0] + 175, 1120]], '#8fb7a0', 9200, { w: 6, al: .6, corner: .6 });
  head(c, CAST.ben, B[0], B[1], 1.1, { eyes: 'closed', mouth: 'sleep', brows: 'sleep' }, 9210 + bz(i), { tilt: .28 });
  for (let q = 0; q < 2; q++) { const u = (t2 * .6 + q * .5) % 1; txt(c, 'z', B[0] + 70 + u * 40, B[1] - 90 - u * 110, 44 + u * 30, { al: Math.min(1, u * 5, (1 - u) * 3), rot: -.2 }); }
  // Cleo with the shield
  const up = easeOutBack(win(tau, .9, 1.35)), hit = tau >= RING_HIT, wob = hit ? Math.sin((tau - RING_HIT) * 30) * Math.exp(-(tau - RING_HIT) * 5) * .08 : 0;
  const cf = hit && t2 > RING_HIT + .3 ? { eyes: 'happy', mouth: 'grin', brows: 'up' } : tau > .6 ? { eyes: 'wide', gaze: [-1, -.5], mouth: 'o', brows: 'up' } : { eyes: 'dot', gaze: [1, 0], mouth: 'smile' };
  const SX = lerp(640, 800, up), SY = lerp(800, 580, up);
  figure(c, CAST.cleo, 520, 1010, 1.3, cf, 9300 + bz(i), { hands: [[(SX - 520) / 1.3 - 70, (SY - 1010) / 1.3 + 60], [(SX - 520) / 1.3 - 60, (SY - 1010) / 1.3 - 50]], elbows: [[-30, -60], [110, -150]], up: hit ? 8 : 0 });
  shieldShape(c, SX, SY, .95 + (hit && tau < RING_HIT + .1 ? .08 : 0), -.12 + wob, 9400);
  dusk(c, .62, [{ x: 760, y: 600, r: 560, k: .7 }]);
  // the ring: in along an arc, hits, bounces off and fades
  if (tau > .3) {
    let p, al = 1, rot = tau * 2.4;
    if (!hit) p = arc([60, 120], [SX - 40, SY - 30], easeInOutSine(win(tau, .3, RING_HIT)), 160);
    else { const u = win(tau, RING_HIT, RING_HIT + .8); p = arc([SX - 40, SY - 30], [180, 80], easeOut(u), 120); al = 1 - u; }
    if (al > 0) targetRing(c, p[0], p[1], 70, rot, 9500, al);
    if (hit && tau < RING_HIT + .35) {   // the clang
      const k = win(tau, RING_HIT, RING_HIT + .35);
      for (let q = 0; q < 7; q++) { const a = -2.4 + q * .45, r0 = 150 + k * 40, r1 = r0 + 50 * (1 - k); ln(c, [[SX - 60 + Math.cos(a) * r0, SY + Math.sin(a) * r0], [SX - 60 + Math.cos(a) * r1, SY + Math.sin(a) * r1]], 6, 9600 + q, false, CHALK, { amp: .3 }); }
    }
  }
}

// ---------------------------------------------------------------- clip 6: the Detective's trace
// Two phones on the table. A third, held up, sends a dotted line to each; they ping; a loop closes round both: "yes or no?"
const PH = [[470, 770], [970, 770]], HELD = [720, 300];
function flatPhone(c, x, y, seed, lit) {
  c.save(); c.translate(x, y); c.rotate(seed % 2 ? .06 : -.05);
  c.fillStyle = 'rgba(36,50,79,.18)'; c.beginPath(); c.ellipse(8, 16, 130, 34, 0, 0, TAU); c.fill();
  c.fillStyle = INK; c.fill(roundRectPath(-120, -50, 240, 100, 18));
  c.fillStyle = lit > 0 ? mix('#3b4a6b', SCREEN, lit) : '#3b4a6b'; c.fill(roundRectPath(-100, -38, 200, 76, 10));
  c.restore();
}
function traceClip(c, tau, i) {
  page(c);
  table(c);
  const lines = PH.map((_, q) => win(tau, .5 + q * .15, 1.2 + q * .15));
  const ping = PH.map((_, q) => win(tau, 1.25 + q * .15, 1.6 + q * .15));
  PH.forEach((p, q) => flatPhone(c, p[0], p[1], 9700 + q, ping[q]));
  // the held phone and two mitten hands
  const g = { top: '#7d786f' };
  c.save(); c.translate(HELD[0], HELD[1]); c.rotate(.04);
  c.fillStyle = INK; c.fill(roundRectPath(-80, -140, 160, 280, 22));
  c.restore();
  for (const s of [-1, 1]) { shape(c, tube([[HELD[0] + s * 160, HELD[1] + 340], [HELD[0] + s * 96, HELD[1] + 60]], [26, 22]), g.top, 9720 + s, { w: 5.5, al: .5 }); shape(c, put(blob(0, 0, 30, 24, 9730 + s, { amp: .06 }), HELD[0] + s * 82, HELD[1] + 30, s * .5), null, 9740 + s, { w: 5 }); }
  dusk(c, .74, [{ x: 720, y: 560, r: 600, k: .45 }]);
  // the lit screen: a signal meter
  c.save(); c.translate(HELD[0], HELD[1]); c.rotate(.04); litScreen(c, 136, 244, 1);
  for (let q = 0; q < 4; q++) { const on = tau > .35 + q * .1; c.fillStyle = on ? SEA : alpha(INK, .2); c.fillRect(-48 + q * 26, 40 - q * 22, 18, 30 + q * 22); }
  c.restore();
  glow(c, HELD[0], HELD[1], 260, '#9cc6ff', .3);
  // the lines down to each phone, and their pings
  PH.forEach((p, q) => {
    dotted(c, [HELD[0] + (q ? 60 : -60), HELD[1] + 150], [p[0], p[1] - 70], lines[q], CHALK, 28, 6);
    if (ping[q] > 0 && ping[q] < 1) for (let r = 0; r < 2; r++) { const u = (ping[q] + r * .5) % 1; c.save(); c.strokeStyle = alpha(CHALK, 1 - u); c.lineWidth = 6; c.beginPath(); c.ellipse(p[0], p[1], 130 + u * 80, 50 + u * 30, 0, 0, TAU); c.stroke(); c.restore(); }
    if (ping[q] >= 1) glow(c, p[0], p[1], 170, '#9cc6ff', .35);
  });
  // a loop round both, then the question
  const lk = win(tau, 2.1, 2.75);
  if (lk > 0) { const loop = []; for (let a = 0; a <= TAU * 1.06; a += .1) loop.push([720 + Math.cos(a + 2.8) * 410, 775 + Math.sin(a + 2.8) * 150]); brush(c, loop, { w: 12, color: SEA, p: lk, seed: 9800, amp: 2.5 }); }
  const qk = win(tau, 2.85, 3.55);
  if (qk > 0) writeOn(c, 'yes or no?', 720, 1000, 96, qk, { col: CHALK });
}

// ---------------------------------------------------------------- clip 7: the ghost
// Zed, a little ghost now, floats among two word cards and a clue photo (he could pass it instead); picks HURRY;
// it drifts to Ada's ear. She sits up.
const WORDS7 = [{ w: 'Door', x: 640, y: 250, r: -.08, col: NOTE.sky }, { w: 'Hurry', x: 700, y: 520, r: .06, col: NOTE.butter }, { w: 'photo', photo: true, x: 600, y: 800, r: -.04 }];
const PICK_AT = 1.45, FLY = [1.85, 2.85];
function ghost(c, x, y, f, seed, t) {
  c.save(); c.translate(x, y);
  const tail = [[-80, -20], [-84, 120], [-62, 170 + Math.sin(t * 6) * 10], [-30, 150], [0, 182 + Math.sin(t * 6 + 1) * 10], [30, 150], [62, 172 + Math.sin(t * 6 + 2) * 10], [84, 120], [80, -20]];
  c.save(); c.globalAlpha = .9; shape(c, tail, '#cfe3ff', seed, { w: 5.5, base: '#f4f8ff', al: .6, corner: 1 }); c.restore();
  head(c, CAST.zed, 0, -40, 1.05, f, seed + 10);
  c.restore();
}
function ghostClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), bob = Math.sin(t2 * 3.2) * 16;
  wallWindow(c, 1190, 180, 200, 170, 10100);
  const G = [310, 470 + bob];
  const picked = t2 >= PICK_AT;
  const gf = picked ? { eyes: 'happy', mouth: 'grin', brows: 'up' } : { eyes: 'look', gaze: [1, (Math.floor(t2 * 2) % 3) - 1], turn: .3, mouth: 'smile' };
  ghost(c, G[0], G[1], gf, 10200 + bz(i), t2);
  // Ada, on the right
  const A = [1150, 560], heard = tau >= FLY[1], EAR = [A[0] - 80, A[1] + 420 - 246 * 1.15];
  const af = heard ? { eyes: 'wide', gaze: [-1, 0], mouth: 'o', brows: 'up' } : { eyes: 'dot', gaze: [0, .6], mouth: 'smile' };
  figure(c, CAST.ada, A[0], A[1] + 420, 1.15, af, 10300 + bz(i), { up: heard ? 10 : 0, phone: true });
  dusk(c, .75, [{ x: G[0], y: G[1], r: 320, k: .5 }, { x: A[0], y: A[1], r: 300, k: .4 }]);
  glow(c, G[0], G[1], 300, '#cfe3ff', .35);
  // the word cards
  WORDS7.forEach((Wd, q) => {
    const fl = Math.sin(t2 * 2.4 + q * 2) * 10;
    let x = Wd.x, y = Wd.y + fl, s = 1, al = 1, r = Wd.r;
    if (q === 1) {
      if (picked) { s = 1 + .12 * (1 - win(tau, PICK_AT, PICK_AT + .25)); }
      const u = win(tau, FLY[0], FLY[1]);
      if (u > 0) { const p = arc([Wd.x, Wd.y], [EAR[0] - 70, EAR[1] - 40], easeInOutSine(u), 140); x = p[0]; y = p[1]; s = lerp(1, .6, u); r = lerp(Wd.r, -.2, u); }
    } else if (picked) al = 1 - win(tau, PICK_AT, PICK_AT + .3) * .75;
    if (al <= 0) return;
    c.save(); c.globalAlpha = al; c.translate(x, y); c.rotate(r); c.scale(s, s);
    if (Wd.photo) {   // a ghost can pass one of its true clue photos instead of a word
      const pts = warp(rectPts(-80, -80, 160, 176), 10450, 1.5, true, 30);
      c.save(); c.shadowColor = 'rgba(36,50,79,.3)'; c.shadowBlur = 10 * S; c.shadowOffsetY = 6 * S; c.fillStyle = '#ffffff'; c.fill(curvePath(pts, true, .4)); c.restore();
      c.fillStyle = '#e9eef8'; c.fillRect(-68, -68, 136, 116);
      glassesDoodle(c, 0, -10, .42, 10460);
      ln(c, pts, 2.4, 10451, true, alpha(INK, .35), { amp: .4 });
    } else {
      sticky(c, 230, 120, Wd.col, 10400 + q);
      txt(c, Wd.w, 0, 6, 70, { fit: 190 });
    }
    c.restore();
  });
  // Zed's pointing, as a little wisp from the sheet to the card
  if (picked && tau < FLY[0] + .2) brush(c, [[G[0] + 90, G[1] + 40], [500, 520], [WORDS7[1].x - 130, WORDS7[1].y]], { w: 6, color: CHALK, p: win(tau, PICK_AT - .2, PICK_AT), seed: 10500, al: .7 });
  if (heard) {
    const k = win(tau, FLY[1], FLY[1] + .5);
    for (let q = 0; q < 3; q++) ln(c, [[EAR[0] - 10, EAR[1] + 10 + q * 24 - 24], [EAR[0] - 10 - 34 * k, EAR[1] + 4 + q * 34 - 34]], 5, 10600 + q, false, CHALK, { amp: .4 });
  }
}

// ---------------------------------------------------------------- clip 8: dawn
// The sun comes up in the window and the dark lifts; the phones buzz, everyone wakes; each phone throws up a result.
const DAWN_LIFT = [.15, 1.0];
const RESULTS = ['eye', 'photo', 'shield', 'word'];
function resultIcon(c, kind, x, y, k, seed) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  const pts = blob(0, 0, 62, 62, seed, { amp: .03, n: 36 });
  c.save(); c.shadowColor = 'rgba(36,50,79,.22)'; c.shadowBlur = 8 * S; c.shadowOffsetY = 5 * S; c.fillStyle = '#ffffff'; c.fill(curvePath(pts, true)); c.restore();
  ln(c, pts, 4, seed + 1, true, INK, { amp: .5 });
  if (kind === 'eye') { ln(c, [[-40, 0], [-20, -20], [20, -20], [40, 0], [20, 20], [-20, 20]], 5, seed + 2, true, INK, { amp: .3, corner: .9 }); dot(c, 0, 0, 13, 13, SEA); dot(c, 0, 0, 6, 6, INK); }
  else if (kind === 'photo') { shape(c, rectPts(-34, -38, 68, 76), null, seed + 2, { w: 4, base: '#ffffff', corner: .3 }); c.fillStyle = '#e9eef8'; c.fillRect(-26, -30, 52, 46); glassesDoodle(c, 0, -8, .16, seed + 3); }
  else if (kind === 'shield') { shieldShape(c, 0, 4, .3, 0, seed + 2); }
  else { txt(c, '“Hurry”', 0, 4, 34); }
  c.restore();
}
function dawnClip(c, tau, i) {
  page(c);
  const t2 = twos(tau), day = easeInOutSine(win(tau, DAWN_LIFT[0], DAWN_LIFT[1])), poses = ORDER.map((_, k) => wakePose(k, t2));
  wallWindow(c, 1200, 205, 260, 220, 11100, { day });
  c.save(); cam(c, 720, 590, 1.12);
  ORDER.forEach((who, k) => seated(c, CAST[who], poses[k], SEAT_X[k], 11200 + k * 200 + bz(i), 'back'));
  table(c); cup(c, 462, 790, 11900, i); cup(c, 980, 798, 11950, i);
  ORDER.forEach((who, k) => {
    const buzz = tau > .9 + k * .06 && t2 < wakeAt(k) + .42;
    seated(c, CAST[who], poses[k], SEAT_X[k], 11200 + k * 200 + bz(i), 'front', { buzz, t: tau });
  });
  ORDER.forEach((_, k) => {
    const P = poses[k]; if (!P.rest || P.f.eyes !== 'closed') return; const s = k % 2 ? -1 : 1;
    for (let q = 0; q < 2; q++) { const u = (t2 * .7 + q * .5 + k * .23) % 1; txt(c, 'z', SEAT_X[k] - s * 40 + u * 34 * s, SEAT_Y - 120 - u * 110, 40 + u * 30, { al: Math.min(1, u * 5, (1 - u) * 3), rot: -.2 * s }); }
  });
  // the results, popping up off each phone once its guest is awake
  ORDER.forEach((_, k) => { const at = wakeAt(k) + .9; resultIcon(c, RESULTS[k], SEAT_X[k] + (k % 2 ? -110 : 110), SEAT_Y - 330, easeOutBack(win(tau, at, at + .25)), 11600 + k * 10); });
  c.restore();
  dusk(c, .8 * (1 - day));
  if (day > 0) glow(c, 1170, 270, 360, '#ffd9a3', .3 * day);
  writeOn(c, 'DAWN', 330, 140, 160, win(tau, 2.75, 3.35));
  brush(c, [[176, 222], [330, 214], [486, 220]], { w: 14, color: SEA, p: win(tau, 3.35, 3.6), seed: 11990 });
}
