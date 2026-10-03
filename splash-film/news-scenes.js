'use strict';
// The News pictures, one scene each (news.html renders one frame per scene).
// Each name is an `art` value in src/data/packs/deepblue.news.js or in
// src/os/news.js, and ships as public/news/<name>.webp.

// ---------------------------------------------------------------- shared backdrops and props
function nightWash(c, deep = 1) {
  const all = rectPath(-10, -10, W + 20, H + 20);
  gwash(c, all, 0, 0, 0, H, [[0, alpha(DEEPB, .9 * deep)], [.6, alpha(NAVY, .92 * deep)], [1, alpha(ABYSS, .96 * deep)]]);
  shadeIn(c, all, [0, 0, W, H], { al: .12, gap: 12, len: 34, seed: 900, color: '#000814' });
}
function skyWash(c, y1, stops, al = 1) { gwash(c, rectPath(-10, -10, W + 20, y1 + 10), 0, 0, 0, y1, stops, al); }
const dawnSky = (c, y1, o = {}) => skyWash(c, y1, [[0, alpha(o.top ?? '#7fb0ee', o.al ?? .55)], [.75, alpha('#cfe0f2', .35)], [1, alpha('#f7e2bf', .4)]]);
const duskSky = (c, y1) => skyWash(c, y1, [[0, alpha('#2c4f9e', .95)], [.55, alpha('#7b8fd0', .7)], [.85, alpha('#f0b88a', .6)], [1, alpha('#f6cf9a', .55)]]);
const textOn = (c, s, x, y, size, o = {}) => { c.save(); c.font = `${o.weight ?? 700} ${size}px ${o.face ?? '"Helvetica Neue", Helvetica, Arial, sans-serif'}`; c.fillStyle = o.col ?? '#ffffff'; c.textAlign = o.align ?? 'center'; c.textBaseline = 'middle'; c.globalAlpha *= o.al ?? 1; c.fillText(s, x, y); c.restore(); };
// A hand holding a phone from below (side 1: the right hand, from bottom right). Draws the sleeve and palm now,
// and returns the fingers and thumb, which go on after the handset.
function holdingHand(c, px, py, pw, ph, seed, o = {}) {
  const { sleeve = '#4d6488', side = 1 } = o, L = px - pw / 2, R = px + pw / 2, B = py + ph / 2;
  const mirror = fn => { c.save(); if (side < 0) { c.translate(px, 0); c.scale(-1, 1); c.translate(-px, 0); } fn(); c.restore(); };
  mirror(() => {
    solid(c, tube([[R + 470, B + 460], [R + 170, B + 150], [px + pw * .22, B - ph * .02]], [100, 92, 80]), sleeve, seed, { w: 5 });
    solid(c, blob(px + pw * .2, B - ph * .06, pw * .52, ph * .17, seed + 1, { amp: .04 }), SKIN, seed + 2, { w: 5 });
  });
  return () => mirror(() => {
    for (let k = 0; k < 4; k++) {
      const fy = B - ph * (.5 - k * .088), len = [70, 78, 74, 60][k], a = .16 - k * .07;
      solid(c, put(rrPts(-len, -21, len + 30, 42, 21), L + 4, fy, a), SKIN, seed + 20 + k, { w: 4.5 });
      ln(c, put([[-len * .42, -15], [-len * .46, 15]], L + 4, fy, a), 2.5, seed + 25 + k, false, alpha(INK, .5), { amp: .2 });
    }
    const th = [[R + 80, B - ph * .0], [R + 18, B - ph * .15], [R - 30, B - ph * .29]];
    solid(c, tube(th, [36, 31, 26]), SKIN, seed + 30, { w: 4.5 });
    solid(c, blob(th[2][0] - 4, th[2][1] - 6, 26, 30, seed + 31, { amp: .03, rot: .6 }), SKIN, seed + 32, { w: 4.5 });
    ln(c, [[th[2][0] - 16, th[2][1] - 22], [th[2][0] + 8, th[2][1] - 30]], 3, seed + 33, false, alpha(INK, .6), { amp: .2 });
  });
}
const ringArcs = (c, x, y, r0, seed, col = RED, n = 3, spread = .5) => {
  for (const s of [-1, 1]) for (let q = 0; q < n; q++) {
    const r = r0 + q * 52, pts = []; for (let a = -spread; a <= spread + 1e-6; a += .1) pts.push([x + s * Math.cos(a) * r, y + Math.sin(a) * r * .9]);
    ln(c, pts, 7, seed + s * 5 + q, false, col, { amp: 1.5, p: .5 });
  }
};
const steam = (c, x, y, seed, h = 110, col = alpha(INK, .45)) => { for (let q = 0; q < 2; q++) { const pts = []; for (let v = 0; v <= 1.001; v += .1) pts.push([x - 12 + q * 24 + Math.sin(v * 6 + q * 2) * 10, y - v * h]); ln(c, pts, 4, seed + q, false, col, { amp: 2, p: .3 }); } };
// A cup seen from the side, on a saucer, base at (x, y).
function teacup(c, x, y, s, seed, col = '#ffffff') {
  c.save(); c.translate(x, y); c.scale(s, s);
  solid(c, ellPts(0, 0, 90, 18, 0, 36), col, seed, { w: 4 });
  ln(c, [[52, -70], [86, -64], [84, -34], [50, -26]], 6, seed + 1);
  solid(c, [[-60, -96], [60, -96], [48, -12], [-48, -12]], col, seed + 2, { w: 4.5, corner: .5 });
  solid(c, ellPts(0, -96, 60, 13, 0, 30), '#b98a5e', seed + 3, { w: 4 });
  c.restore();
}
// A marble café tabletop filling the frame, lit from the top left.
function marble(c) {
  newsprint(c);
  gwash(c, rectPath(0, 0, W, H), 0, 0, W, H, [[0, alpha('#ffffff', .0)], [1, alpha('#c7d3e6', .7)]]);
  for (let k = 0; k < 9; k++) { const r = rng(400 + k), y = r() * H, pts = []; for (let x = -40; x <= W + 40; x += 120) pts.push([x, y + Math.sin(x / 260 + k) * 60 + (r() - .5) * 40]); ln(c, pts, 1.6 + r() * 2, 410 + k, false, alpha('#8FA3C2', .5), { amp: 6 }); }
}
// The board on a phone screen: rows of blurred names and gold scores.
function boardScreen(g, sx, sy, sw, sh, rows, o = {}) {
  g.save(); g.fillStyle = '#f2f5fa'; g.fillRect(sx, sy, sw, sh); g.restore();
  g.save(); g.fillStyle = o.barCol ?? '#1d3f80'; g.fillRect(sx, sy, sw, sh * .12); g.restore();
  textOn(g, o.title ?? 'THE BOARD', sx + sw / 2, sy + sh * .06, sw * .085, { weight: 800 });
  const rowH = (sh * .84) / rows.length;
  boardRows(g, sx + sw * .05, sy + sh * .145, sw * .9, rowH, rows, o.seed ?? 1, { lineCol: alpha(INK, .5) });
}

// ---------------------------------------------------------------- day 0
// Nine dead: a phone glowing in a dark room, the whale on its lock screen.
function sceneNineDead(c) {
  newsprint(c);
  nightWash(c, 1);
  screenLight(c, 960, 520, 760, .7);
  for (let k = 0; k < 18; k++) {   // the light, drawn as ink rays
    const a = k / 18 * TAU + .1, r0 = 380, r1 = 480 + (k % 3) * 60;
    ln(c, [[960 + Math.cos(a) * r0, 520 + Math.sin(a) * r0 * .85], [960 + Math.cos(a) * r1, 520 + Math.sin(a) * r1 * .85]], 5, 300 + k, false, alpha(FOAM, .5), { amp: .6, p: .8 });
  }
  const P = { x: 960, y: 500, w: 330, h: 620 }, fingers = holdingHand(c, P.x, P.y, P.w, P.h, 40);
  handset(c, P.x, P.y, P.w, P.h, 0, 41, (g, sx, sy, sw, sh) => {
    lockTime(g, sx, sy, sw, sh, '07:00', { date: 'Monday' });
    whaleTile(g, sx + sw / 2, sy + sh * .5, sw * .42, 42);
    textOn(g, 'DEEP BLUE', sx + sw / 2, sy + sh * .7, sw * .075, { weight: 600 });
    g.save(); g.fillStyle = 'rgba(5,14,36,.5)'; g.fillRect(sx, sy + sh * .86, sw, sh * .14); g.restore();
    textOn(g, 'slide to unlock', sx + sw / 2, sy + sh * .93, sw * .06, { weight: 400, al: .75 });
  });
  fingers();
  printFinish(c, .25);
}
// Seven a.m.: the bedside, the phone hopping on the table, a hand coming out from under the sheet.
function sceneSevenAm(c) {
  newsprint(c);
  // the window: the first blue of the morning, a palm outside
  const win = rectPts(250, 110, 440, 520), wp = polyPath(win);
  gwash(c, wp, 0, 110, 0, 630, [[0, alpha(DEEPB, .8)], [.7, alpha('#7b8fd0', .55)], [1, alpha('#f0b88a', .5)]]);
  c.save(); c.clip(wp); palm(c, 600, 700, 420, 59, { lean: -.2, dark: true }); for (let k = 0; k < 9; k++) { const r = rng(58 + k); dot(c, 270 + r() * 400, 130 + r() * 200, 2.6, 2.6, '#ffffff'); } c.restore();
  nightWash(c, .8);
  rwash(c, 470, 520, 320, alpha('#c9d8f2', .5), 1, 'screen');
  solid(c, win, null, 60, { w: 6 });
  seg(c, [470, 110], [470, 630], 5, 61); seg(c, [250, 370], [690, 370], 5, 62);
  const cur = [[170, 70], [300, 70], [282, 720], [150, 740]];
  solid(c, cur, '#3a4a6b', 63, { w: 4, al: .85 });
  shadeIn(c, curvePath(cur, true), [150, 70, 160, 680], { al: .35, angle: 1.5, seed: 64 });
  // the bed and the sleeper, turned to the wall, one arm out
  solid(c, [[-40, 760], [880, 760], [900, 1100], [-40, 1100]], '#5a6888', 70, { w: 5, al: .85 });
  solid(c, blob(170, 650, 160, 62, 73, { amp: .05 }), '#ffffff', 74, { w: 5 });   // pillow
  solid(c, blob(196, 606, 58, 54, 76, { amp: .03 }), SKIN, 77, { w: 4.5 });
  solid(c, scallop(170, 600, 58, Math.PI * .5, Math.PI * 1.62, 7, 9), '#2f2c2a', 75, { w: 4, corner: .5 });
  ln(c, [[214, 608], [228, 616], [242, 610]], 3.5, 78, false, INK, { amp: .3 });   // the closed eye
  const sheet = [[-40, 690], [110, 660], [240, 650], [420, 640], [600, 660], [780, 712], [870, 780], [880, 860], [-40, 900]];
  solid(c, sheet, '#9fb9d8', 71, { w: 5, corner: 1 });
  shadeIn(c, curvePath([[-40, 780], [860, 800], [880, 900], [-40, 900]], true), [-40, 760, 920, 160], { al: .3, seed: 72 });
  for (const [a, b] of [[[220, 712], [420, 680]], [[470, 700], [700, 740]], [[300, 790], [620, 772]]]) ln(c, [a, mixv(a, b, .5), b], 3, a[0], false, alpha(INK, .55), { amp: 2 });
  // the bedside table and the phone
  solid(c, [[960, 700], [1500, 700], [1480, 1100], [980, 1100]], '#8a6a50', 80, { w: 5, al: .9 });
  solid(c, [[930, 660], [1530, 660], [1530, 710], [930, 710]], '#a3825f', 81, { w: 5 });
  shadeIn(c, polyPath([[960, 710], [1500, 710], [1480, 1100], [980, 1100]]), [960, 700, 540, 400], { al: .35, seed: 82 });
  ln(c, [[1100, 860], [1340, 860]], 6, 83); dot(c, 1220, 900, 12, 12, '#5c4636');
  screenLight(c, 1220, 560, 440, .9);
  c.save(); c.translate(1220, 520); c.rotate(-.12);
  handset(c, 0, 0, 170, 310, 0, 84, (g, sx, sy, sw, sh) => { lockTime(g, sx, sy, sw, sh, '07:00'); whaleTile(g, sx + sw / 2, sy + sh * .56, sw * .45, 85); });
  c.restore();
  for (let k = 0; k < 3; k++) seg(c, [1150 + k * 60, 690], [1160 + k * 60, 676], 4, 87 + k);   // it hops
  ringArcs(c, 1220, 520, 200, 86);
  // the hand reaching out from the sheet
  solid(c, tube([[720, 740], [830, 690], [930, 650]], [40, 34, 28]), '#9fb9d8', 90, { w: 5 });
  solid(c, tube([[906, 660], [980, 630], [1030, 634]], [22, 19, 16]), SKIN, 91, { w: 4.5 });
  for (let k = 0; k < 3; k++) solid(c, put(rrPts(-6, -9, 52, 18, 9), 1030, 622 + k * 15, .12 + k * .05), SKIN, 95 + k, { w: 3.5 });
  printFinish(c, .25);
}
// Stay together: one empty chair under a street lamp, a phone glowing on its seat, tape across the front.
function sceneStayTogether(c) {
  newsprint(c);
  houses(c, -40, W + 40, 700, 7, { night: 1, h0: 300, lit: .25 });
  nightWash(c, .92);
  const road = rectPath(-10, 700, W + 20, 400);
  gwash(c, road, 0, 700, 0, H, [[0, alpha('#22325a', .7)], [1, alpha(ABYSS, .85)]]);
  for (let k = 0; k < 8; k++) ln(c, [[k * 280 - 60, 740 + (k % 2) * 18], [k * 280 + 120, 742 + (k % 2) * 18]], 3, 100 + k, false, alpha(FOAM, .25));
  // the lamp and its cone
  lampPost(c, 1330, 920, 660, 110, 0);
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 260, 0, 960); g.addColorStop(0, alpha(LAMP, .5)); g.addColorStop(1, alpha(LAMP, .1));
  c.fillStyle = g; c.beginPath(); c.moveTo(1365, 266); c.lineTo(1395, 266); c.lineTo(1420, 960); c.lineTo(640, 960); c.closePath(); c.fill(); c.restore();
  lamp(c, 1380, 270, 260, LAMP, 1);
  rwash(c, 1000, 930, 440, alpha(LAMP, .45), 1, 'screen');
  // the chair, seen from the front, its back behind the seat
  const wood = '#7a5a42', seat = '#a3825f';
  solid(c, tube([[868, 800], [880, 560]], [10, 9]), wood, 126, { w: 3.5 }); solid(c, tube([[1112, 800], [1100, 560]], [10, 9]), wood, 127, { w: 3.5 });
  for (const yy of [575, 630, 685]) solid(c, [[874, yy], [1106, yy], [1104, yy + 30], [876, yy + 30]], seat, 128 + yy, { w: 3.5 });
  for (const [k, [a, b]] of [[[900, 990], [904, 860]], [[1080, 990], [1076, 860]], [[880, 940], [884, 830]], [[1100, 940], [1096, 830]]].entries()) solid(c, tube([a, b], [9, 8]), wood, 120 + k, { w: 3.5 });
  c.save(); c.fillStyle = 'rgba(5,14,36,.35)'; c.beginPath(); c.ellipse(990, 990, 190, 24, 0, 0, TAU); c.fill(); c.restore();
  solid(c, [[850, 800], [1130, 800], [1150, 862], [830, 862]], seat, 125, { w: 4.5 });
  // the phone on the seat, still lit
  c.save(); c.translate(1000, 828); c.scale(1, .34); c.rotate(.5);
  c.fillStyle = INK; c.fill(roundRectPath(-50, -90, 100, 180, 16)); c.fillStyle = '#bcd8ff'; c.fillRect(-41, -68, 82, 136); c.restore();
  screenLight(c, 1000, 820, 230, 1);
  tape(c, [-40, 280], [W + 40, 500], 58, 140, 70);
  tape(c, [-40, 960], [W + 40, 800], 50, 141, -20);
  printFinish(c, .2);
}
// Greenr stays open: a café front at dusk, the awning, string lights, a table being laid.
function bistroChair(c, x, y, s, seed, f = 1) {
  c.save(); c.translate(x, y); c.scale(s * f, s);
  const metal = '#3a4a6b';
  for (const [a, b] of [[[-34, 0], [-30, -110]], [[34, 0], [30, -110]]]) seg(c, a, b, 6, seed + a[0], metal);
  solid(c, ellPts(0, -112, 46, 12, 0, 24), '#a3825f', seed + 3, { w: 3.5 });
  ln(c, [[-34, -112], [-40, -230], [0, -250], [40, -230], [34, -112]], 6, seed + 4, false, metal, { amp: .6 });
  ln(c, [[-38, -190], [38, -190]], 4, seed + 5, false, metal);
  c.restore();
}
function sceneGreenrOpen(c) {
  newsprint(c);
  duskSky(c, 600);
  palm(c, 170, 620, 560, 150, { lean: -.12 }); palm(c, 1770, 620, 600, 151, { lean: .1 });
  // the building: a cream front, big lit windows with guests inside
  solid(c, [[300, 620], [300, 230], [1620, 230], [1620, 620]], LIME, 160, { w: 5 });
  solid(c, [[270, 230], [1650, 230], [1650, 180], [270, 180]], TERRA, 161, { w: 5 });
  for (let x = 330; x < 1600; x += 130) solid(c, blob(x + 40, 168, 74, 36, 180 + x, { amp: .12 }), LEAF, 181 + x, { w: 4 });
  for (const [k, x] of [360, 790, 1220].entries()) {
    solid(c, rectPts(x, 360, 340, 250), LAMP, 162 + k, { w: 5 });
    lamp(c, x + 170, 480, 300, LAMP, .6);
    for (let p = 0; p < 4; p++) { const px = x + 50 + p * 80, py = 470 + (p % 2) * 14; c.save(); c.fillStyle = alpha(INK, .5); c.beginPath(); c.ellipse(px, py, 20, 24, 0, 0, TAU); c.fill(); c.fill(curvePath([[px - 30, py + 28], [px + 30, py + 28], [px + 36, 610], [px - 36, 610]], true)); c.restore(); }
    seg(c, [x + 170, 360], [x + 170, 610], 4, 175 + k);
  }
  for (let k = 0; k < 14; k++) {   // the awning, striped
    const x = 290 + k * 96, pts = [[x, 240], [x + 96, 240], [x + 102, 340], [x - 4, 340]];
    solid(c, pts, k % 2 ? '#fbf7ee' : OCEAN, 190 + k, { w: 3.5, corner: .3, rimW: 8 });
    c.save(); c.fillStyle = k % 2 ? '#fbf7ee' : OCEAN; c.beginPath(); c.arc(x + 49, 340, 51, 0, Math.PI); c.fill(); c.restore();
    ln(c, Array.from({ length: 9 }, (_, q) => [x + 49 + Math.cos(q / 8 * Math.PI) * 51, 340 + Math.sin(q / 8 * Math.PI) * 51]), 3.5, 205 + k, false);
  }
  // the terrace
  solid(c, [[-20, 620], [W + 20, 620], [W + 20, H + 20], [-20, H + 20]], '#e9dcc4', 210, { w: 4, rim: false });
  for (let y = 660; y < H; y += 64) ln(c, [[-20, y], [W + 20, y + 6]], 2, 211 + y, false, alpha(INK, .22));
  rwash(c, 960, 640, 900, alpha(LAMP, .35), 1, 'screen');
  // string lights
  for (const [a, b] of [[[-20, 110], [640, 150]], [[640, 150], [1280, 130]], [[1280, 130], [1940, 90]]]) {
    const pts = Array.from({ length: 21 }, (_, q) => { const u = q / 20; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 70]; });
    ln(c, pts, 3, a[0] + 220, false);
    for (let q = 1; q < 20; q += 2) { dot(c, pts[q][0], pts[q][1] + 12, 9, 12, LAMP_HI); lamp(c, pts[q][0], pts[q][1] + 12, 70, LAMP, .8); }
  }
  // the chalkboard by the door
  solid(c, [[1490, 1000], [1560, 700], [1700, 700], [1770, 1000]], null, 249, { w: 5, line: false });
  solid(c, [[1520, 980], [1570, 720], [1690, 720], [1740, 980]], '#2b3550', 250, { w: 5 });
  txt(c, 'OPEN', 1630, 800, 64, { col: '#ffffff', rot: -.03 }); txt(c, 'tonight', 1630, 870, 46, { col: LAMP_HI, rot: -.03 });
  // tables: two laid, the middle one being laid
  const tbl = (x, y, s, seed, laid = true) => {
    bistroChair(c, x - 190 * s, y + 160 * s, s, seed + 7, 1); bistroChair(c, x + 190 * s, y + 160 * s, s, seed + 8, -1);
    solid(c, tube([[x, y], [x, y + 160 * s]], [8 * s, 8 * s]), '#3a4a6b', seed, { w: 3 });
    if (!laid) { solid(c, ellPts(x, y, 150 * s, 30 * s, 0, 36), '#a3825f', seed + 1, { w: 4 }); return; }
    solid(c, [[x - 150 * s, y - 10 * s], [x + 150 * s, y - 10 * s], [x + 166 * s, y + 70 * s], [x - 166 * s, y + 70 * s]], '#ffffff', seed + 1, { w: 4 });
    solid(c, ellPts(x - 50 * s, y - 14 * s, 30 * s, 8 * s, 0, 20), '#ffffff', seed + 2, { w: 3 });
    solid(c, [[x + 50 * s, y - 64 * s], [x + 68 * s, y - 64 * s], [x + 72 * s, y - 10 * s], [x + 46 * s, y - 10 * s]], GLASS, seed + 3, { w: 2.5 });
    dot(c, x + 4 * s, y - 30 * s, 8 * s, 12 * s, LAMP_HI); lamp(c, x + 4 * s, y - 30 * s, 60 * s, LAMP, .9);
  };
  tbl(470, 790, .95, 220); tbl(1450, 800, 1, 230);
  tbl(960, 850, 1.08, 240, false);
  // the waiter shakes a cloth out over it
  person(c, 960, 1060, 1.12, 3, { pose: 'spread', top: '#ffffff', legs: '#2b3550', hair: 'short', f: 1, head: [4, -372] });
  const cloth = [[850, 740], [1088, 742], [1120, 840], [1060, 870], [960, 856], [870, 880], [820, 836]];
  solid(c, cloth, '#ffffff', 260, { w: 4.5, corner: 1, rim: false });
  for (const xx of [900, 960, 1030]) ln(c, [[xx, 760], [xx + 8, 850]], 2.5, 261 + xx, false, alpha(INK, .35));
  printFinish(c, .15);
}

// ---------------------------------------------------------------- day 1
// The ninety seconds: two hands round a phone held sideways, the whale between the coral walls.
function sceneNinetySeconds(c) {
  newsprint(c);
  nightWash(c, .95);
  screenLight(c, 960, 520, 820, .75);
  const pw = 450, ph = 860;
  // the hands behind the phone
  for (const s of [-1, 1]) {
    c.save(); c.translate(960, 0); c.scale(s, 1); c.translate(-960, 0);
    solid(c, tube([[1700, 1240], [1520, 900], [1390, 700]], [110, 100, 84]), s < 0 ? '#5b9be8' : '#5b9be8', 600, { w: 5 });
    solid(c, blob(1380, 640, 92, 120, 601, { amp: .04, rot: .2 }), SKIN, 602, { w: 5 });
    c.restore();
  }
  handset(c, 960, 520, pw, ph, -Math.PI / 2 + .03, 610, (g, sx, sy, sw, sh) => {
    g.save(); g.translate(sx + sw / 2, sy + sh / 2); g.rotate(Math.PI / 2);
    const gw = sh, gh = sw, x0 = -gw / 2, y0 = -gh / 2;   // the game, landscape
    const bg = g.createLinearGradient(0, y0, 0, -y0); bg.addColorStop(0, '#2a66c4'); bg.addColorStop(1, NAVY); g.fillStyle = bg; g.fillRect(x0, y0, gw, gh);
    for (let k = 0; k < 14; k++) { const r = rng(620 + k); dot(g, x0 + r() * gw, y0 + r() * gh, 2 + r() * 3, 2 + r() * 3, alpha(FOAM, .35)); }
    for (const [px, gap, gy] of [[.38, .36, .18], [.68, .34, -.12], [.95, .36, .1]]) {
      const X = x0 + px * gw, hw = gw * .055, top = gy * gh - gap * gh / 2, bot = gy * gh + gap * gh / 2;
      g.fillStyle = CORAL; g.fillRect(X - hw, y0 - 4, hw * 2, top - y0 + 4); g.fillRect(X - hw, bot, hw * 2, -y0 - bot + 4);
      g.fillRect(X - hw * 1.25, top - 18, hw * 2.5, 18); g.fillRect(X - hw * 1.25, bot, hw * 2.5, 18);
    }
    const trail = []; for (let k = 0; k <= 10; k++) trail.push([x0 + gw * (.02 + k * .018), gh * (.1 - .16 * Math.sin(k / 10 * Math.PI) + k * .006)]);
    for (const [k, p] of trail.entries()) if (k % 2 === 0) dot(g, p[0], p[1], 4, 4, alpha(FOAM, .55));
    whale(g, x0 + gw * .24, gh * .05, gw * .1, '#ffffff', -.25);
    textOn(g, '23', 0, y0 + gh * .11, gh * .13, { weight: 800, col: GOLD });
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x0 + gw * .06, y0 + gh * .05, gw * .2, 10); g.fillStyle = '#ffffff'; g.fillRect(x0 + gw * .06, y0 + gh * .05, gw * .2 * .45, 10);
    textOn(g, '0:41', x0 + gw * .16, y0 + gh * .13, gh * .07, { weight: 600 });
    g.restore();
  });
  // the thumbs on the glass
  for (const s of [-1, 1]) {
    c.save(); c.translate(960, 0); c.scale(s, 1); c.translate(-960, 0);
    const th = [[1450, 700], [1410, 640], [1380, 600]];
    solid(c, tube(th, [46, 42, 38]), SKIN, 630, { w: 4.5 });
    solid(c, blob(1374, 588, 38, 42, 631, { amp: .03, rot: -.6 }), SKIN, 632, { w: 4.5 });
    ln(c, [[1352, 566], [1382, 556]], 3, 633, false, alpha(INK, .5), { amp: .2 });
    ln(c, [[1420, 650], [1446, 640]], 2.5, 634, false, alpha(INK, .4), { amp: .2 });
    c.restore();
  }
  ln(c, [[600, 545], [570, 520]], 4, 640, false, FOAM); ln(c, [[604, 520], [590, 488]], 4, 641, false, FOAM); ln(c, [[624, 560], [600, 570]], 4, 642, false, FOAM);   // a tap
  printFinish(c, .25);
}
// Panjim stops: a queue at the bus stop at seven, every head down; the white church on its hill behind.
function church(c, x, y, s, seed) {
  // the Church of the Immaculate Conception, from below: twin towers, the gable, the zigzag stairs
  c.save(); c.translate(x, y); c.scale(s, s);
  const white = '#fbfaf5';
  solid(c, [[-170, 0], [-170, -230], [170, -230], [170, 0]], white, seed, { w: 4 });
  for (const sx of [-1, 1]) {
    solid(c, [[sx * 170, 0], [sx * 170, -330], [sx * 100, -330], [sx * 100, 0]], white, seed + 1 + sx, { w: 4 });
    solid(c, [[sx * 175, -330], [sx * 95, -330], [sx * 135, -380]], white, seed + 4 + sx, { w: 4 });
    seg(c, [sx * 135, -380], [sx * 135, -420], 4, seed + 6 + sx); seg(c, [sx * 135 - 12, -406], [sx * 135 + 12, -406], 4, seed + 8 + sx);
    for (const yy of [-290, -200, -110]) solid(c, [[sx * 148, yy], [sx * 122, yy], [sx * 122, yy + 48], [sx * 148, yy + 48]], DEEPB, seed + 10 + yy + sx, { w: 2.5, al: .6 });
  }
  solid(c, [[-100, -230], [0, -330], [100, -230]], white, seed + 20, { w: 4 });
  solid(c, [[-26, -290], [26, -290], [26, -250], [-26, -250]], DEEPB, seed + 21, { w: 2.5, al: .5 });
  dot(c, 0, -262, 14, 14, '#c9a86a');
  solid(c, [[-38, 0], [-38, -110], [0, -150], [38, -110], [38, 0]], DEEPB, seed + 22, { w: 3, al: .55 });
  shadeIn(c, rectPath(100, -330, 70, 330), [100, -330, 70, 330], { al: .25, seed: seed + 23 });
  c.restore();
}
function churchStairs(c, x, y, s, seed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const white = '#fbfaf5', flights = [[[-250, 0], [250, 0], [250, 40], [-250, 40]], [[250, 40], [-200, 120], [-200, 150], [250, 70]], [[-200, 120], [260, 200], [260, 230], [-200, 150]]];
  for (const [k, f] of flights.entries()) solid(c, f, white, seed + k, { w: 4, corner: .2 });
  c.restore();
}
function scenePanjimStops(c) {
  newsprint(c);
  dawnSky(c, 760, { top: '#7aa6e6', al: .6 });
  rwash(c, 1620, 140, 520, alpha(LAMP_HI, .9), 1, 'screen'); dot(c, 1620, 140, 64, 64, '#fff7e6');
  ln(c, ellPts(1620, 140, 66, 66, 0, 40), 4, 250, true, alpha(INK, .5));
  solid(c, [[-20, 700], [300, 560], [700, 470], [1220, 470], [1620, 560], [W + 20, 640], [W + 20, 900], [-20, 900]], '#a9c28f', 251, { w: 5, al: .7, corner: 1.2 });
  palm(c, 520, 520, 300, 252, { lean: -.1 }); palm(c, 1420, 520, 340, 253);
  church(c, 960, 500, 1.0, 260); churchStairs(c, 960, 500, 1.0, 265);
  houses(c, -40, 640, 760, 21, { h0: 200, lit: 0 }); houses(c, 1290, W + 40, 760, 22, { h0: 200, lit: 0 });
  solid(c, [[-20, 760], [W + 20, 760], [W + 20, H + 20], [-20, H + 20]], '#d9d0bd', 270, { w: 4, rim: false });
  ln(c, [[-20, 840], [W + 20, 850]], 3, 271, false, alpha(INK, .35));
  solid(c, tube([[300, 1060], [300, 640]], [8, 7]), CHROME, 272, { w: 3.5 });
  solid(c, rrPts(240, 560, 120, 90, 14), OCEAN, 273, { w: 4 });
  textOn(c, 'BUS', 300, 606, 40, { weight: 800, col: FOAM });
  const Q = [[420, 1.18, 'long', 0], [600, 1.25, 'short', 1], [780, 1.12, 'cap', 2], [950, 1.28, 'bun', 3], [1130, 1.2, 'curly', 4], [1310, 1.24, 'short', 5], [1490, 1.15, 'long', 6]];
  for (const [x, s, hair, k] of Q) person(c, x, 1060, s, 280 + k * 3, { pose: 'phone', hair, top: TOPS[(k * 3) % TOPS.length], skirt: k === 3, bag: k === 1 || k === 5 });
  solid(c, [[1680, 1040], [1660, 560], [1720, 520], [W + 40, 520], [W + 40, 1040]], OCHRE, 300, { w: 5 });
  solid(c, [[1690, 600], [1740, 570], [W + 40, 570], [W + 40, 760], [1700, 760]], GLASS, 301, { w: 4, al: .85 });
  dot(c, 1760, 1040, 50, 50, INK); dot(c, 1760, 1040, 20, 20, CHROME);
  printFinish(c, .12);
}
// Ferry crews: the Mandovi crossing, passengers at the rail with their heads down, a deckhand waving.
function sceneFerryCrews(c) {
  newsprint(c);
  dawnSky(c, 470, { top: '#6f9fe4', al: .6 });
  rwash(c, 400, 300, 380, alpha(LAMP_HI, .9), 1, 'screen'); dot(c, 400, 300, 50, 50, '#fff7e6');
  solid(c, [[-20, 470], [200, 400], [520, 420], [820, 380], [1200, 410], [1560, 370], [W + 20, 420], [W + 20, 480], [-20, 480]], '#8fa98a', 700, { w: 4, al: .8, corner: 1.1 });
  for (let x = 40; x < W; x += 150) palm(c, x + (x % 3) * 20, 470, 140 + (x % 5) * 16, 701 + x, { lean: (x % 7 - 3) * .05 });
  water(c, 470, H + 10, 702, { lights: [[400, LAMP_HI]] });
  // the ferry, side on
  const hull = [[300, 780], [1640, 780], [1580, 900], [380, 900]];
  solid(c, hull, '#f4f2ea', 710, { w: 5 });
  solid(c, [[300, 780], [1640, 780], [1630, 806], [312, 806]], OCEAN, 711, { w: 3.5 });
  solid(c, [[380, 900], [1580, 900], [1572, 916], [388, 916]], NAVY, 712, { w: 3 });
  // the wheelhouse and the roof
  solid(c, [[1150, 560], [1450, 560], [1450, 780], [1150, 780]], '#f4f2ea', 713, { w: 4.5 });
  for (let k = 0; k < 3; k++) solid(c, rectPts(1176 + k * 90, 590, 70, 70), GLASS, 714 + k, { w: 3 });
  solid(c, [[1130, 540], [1470, 540], [1470, 560], [1130, 560]], OCEAN, 718, { w: 3.5 });
  // passengers at the rail, heads down; the deckhand by the ramp waves
  const P = [[430, .78, 'short', 1], [540, .74, 'long', 1], [650, .8, 'cap', -1], [770, .76, 'bun', 1], [880, .79, 'curly', 1], [1000, .75, 'short', -1]];
  for (const [k, [x, s, hair, f]] of P.entries()) person(c, x, 790, s, 720 + k * 5, { pose: 'phone', hair, f, top: TOPS[(k * 5 + 1) % TOPS.length] });
  person(c, 1540, 790, .82, 760, { pose: 'wave', hair: 'cap', top: '#ff7a59', f: -1 });
  // the rail in front of their legs
  ln(c, [[310, 690], [1640, 690]], 6, 770); ln(c, [[310, 735], [1640, 735]], 4, 771);
  for (let x = 320; x <= 1640; x += 60) seg(c, [x, 690], [x, 782], 4, 772 + x);
  // the wake
  for (let k = 0; k < 6; k++) ln(c, [[1640 + k * 24, 860 + k * 14], [1760 + k * 40, 870 + k * 16]], 4, 790 + k, false, alpha(FOAM, .7));
  printFinish(c, .12);
}

// ---------------------------------------------------------------- day 2
// Twenty-three: the coast on a map, Ratnagiri to Mangaluru, a red pin for each town.
function sceneTwentyThree(c) {
  newsprint(c);
  const coast = []; for (let k = 0; k <= 30; k++) { const u = k / 30, y = -30 + u * (H + 60); coast.push([700 + u * 520 + Math.sin(u * 23) * 26 + Math.sin(u * 61) * 10, y]); }
  const land = polyPath([...coast, [W + 30, H + 30], [W + 30, -30]]), sea = polyPath([...coast, [-30, H + 30], [-30, -30]]);
  gwash(c, sea, 0, 0, 900, 0, [[0, alpha(OCEAN, .5)], [1, alpha('#9fc0ec', .45)]]);
  for (let y = 40; y < H; y += 70) for (let x = 40 + (y % 140 ? 60 : 0); x < 640; x += 150) ln(c, [[x, y], [x + 22, y - 8], [x + 44, y]], 3, x + y, false, alpha(INK, .35), { amp: .5 });
  gwash(c, land, 900, 0, W, 0, [[0, alpha('#efe2bd', .9)], [1, alpha('#c9d6a8', .8)]]);
  shadeIn(c, land, [700, 0, 1300, H], { al: .1, angle: .7, seed: 800 });
  for (const [hx, hy] of [[1500, 200], [1620, 420], [1480, 640], [1700, 820], [1580, 980]]) { ln(c, [[hx - 70, hy + 20], [hx, hy - 40], [hx + 70, hy + 20]], 4, hx, false, alpha(INK, .5), { amp: .8 }); shadeIn(c, curvePath([[hx, hy - 40], [hx + 70, hy + 20], [hx, hy + 20]], true), [hx, hy - 40, 70, 60], { al: .3, seed: hx + 1 }); }
  ln(c, [[1700, 520], [1400, 500], [1180, 470], coast[13]], 4, 801, false, alpha(OCEAN, .7), { amp: 3 });   // the Mandovi
  ln(c, coast, 6, 802, false, INK, { amp: 1.5 });
  solid(c, rrPts(60, 60, 380, 90, 10), '#fbf7ee', 803, { w: 3.5, rim: false });
  txt(c, 'KONKAN COAST', 250, 108, 54, { col: INK });
  // the compass
  c.save(); c.translate(260, 880); for (const [a, l] of [[0, 90], [Math.PI / 2, 60], [Math.PI, 60], [-Math.PI / 2, 60]]) { const p = [[0, -l], [12, 0], [0, 12], [-12, 0]]; solid(c, put(p, 0, 0, a), a === 0 ? INK : '#fbf7ee', 810 + l + a, { w: 3, rim: false }); } c.restore();
  txt(c, 'N', 260, 760, 44, { col: INK });
  // the cases: small red marks down the coast, and a pin for each town
  const r = rng(820);
  for (let k = 0; k < 23; k++) { const u = r(), p = coast[Math.min(30, Math.round(u * 30))]; const x = p[0] + 30 + r() * 140, y = p[1] + (r() - .5) * 30; ln(c, [[x - 9, y - 9], [x + 9, y + 9]], 4, 830 + k, false, RED, { amp: .3 }); ln(c, [[x + 9, y - 9], [x - 9, y + 9]], 4, 860 + k, false, RED, { amp: .3 }); }
  const towns = [['Ratnagiri', .14], ['Panjim', .44], ['Karwar', .62], ['Mangaluru', .9]];
  const pins = towns.map(([, u]) => { const p = coast[Math.round(u * 30)]; return [p[0] + 40, p[1]]; });
  ln(c, pins, 3.5, 840, false, RED, { amp: 2, p: .3 });
  for (const [k, [name]] of towns.entries()) {
    const [x, y] = pins[k];
    c.save(); c.fillStyle = 'rgba(36,50,79,.25)'; c.beginPath(); c.ellipse(x + 16, y + 4, 16, 6, 0, 0, TAU); c.fill(); c.restore();
    seg(c, [x, y], [x - 6, y - 50], 4, 845 + k, '#5a6888');
    solid(c, ellPts(x - 8, y - 66, 22, 22, 0, 24), RED, 850 + k, { w: 4 }); dot(c, x - 15, y - 73, 6, 6, '#ffb3ad');
    txt(c, name, x + 40, y - 36, k === 1 ? 60 : 50, { col: INK, align: 'left' });
  }
  printFinish(c, .12);
}
// Bars split: two shopfronts at night, one shuttered, one full and spilling light onto the pavement.
function sceneBarsSplit(c) {
  newsprint(c);
  // upper floors
  solid(c, [[-20, 0], [960, 0], [960, 300], [-20, 300]], OCHRE, 900, { w: 4 });
  solid(c, [[960, 0], [W + 20, 0], [W + 20, 300], [960, 300]], TEAL, 901, { w: 4 });
  for (let x = 120; x < W; x += 260) solid(c, rectPts(x, 70, 80, 140), DEEPB, 902 + x, { w: 3, al: .6 });
  // left: the shutter down, a padlock
  solid(c, [[100, 300], [900, 300], [900, 880], [100, 880]], '#9aa6ba', 910, { w: 5 });
  for (let y = 324; y < 880; y += 24) ln(c, [[104, y], [896, y]], 2.4, 911 + y, false, alpha(INK, .5), { amp: .4 });
  solid(c, rrPts(474, 840, 52, 46, 8), '#c9a86a', 913, { w: 3.5 }); ln(c, [[484, 840], [484, 818], [516, 818], [516, 840]], 4, 914, false, INK, { corner: .3 });
  solid(c, [[80, 250], [920, 250], [920, 300], [80, 300]], '#2b3550', 915, { w: 4 });
  // the CLOSED card on a string
  ln(c, [[420, 360], [500, 320], [580, 360]], 3, 916); solid(c, rectPts(400, 360, 200, 90), '#fbf7ee', 917, { w: 4, rim: false }); txt(c, 'CLOSED', 500, 408, 50, { col: RED });
  // right: the lit room
  solid(c, [[1020, 250], [1860, 250], [1860, 300], [1020, 300]], '#2b3550', 920, { w: 4 });
  solid(c, [[1040, 300], [1840, 300], [1840, 880], [1040, 880]], LAMP, 921, { w: 5 });
  solid(c, [[1580, 360], [1780, 360], [1780, 880], [1580, 880]], '#ffe2a8', 922, { w: 4 });   // the open door
  for (let k = 0; k < 7; k++) {
    const x = 1080 + k * 70 + (k > 3 ? 30 : 0), y = 610 + (k % 2) * 30;
    c.save(); c.fillStyle = alpha(INK, .62); c.beginPath(); c.ellipse(x, y, 24, 28, 0, 0, TAU); c.fill(); c.fill(curvePath([[x - 36, y + 34], [x + 36, y + 34], [x + 42, 880], [x - 42, 880]], true)); c.restore();
  }
  ln(c, [[1060, 700], [1560, 700]], 5, 925); for (const x of [1120, 1300, 1480]) seg(c, [x, 700], [x, 880], 4, 926 + x);
  person(c, 1680, 880, .95, 930, { pose: 'stand', hair: 'long', back: true, top: '#d98fa0' });
  seg(c, [1040, 560], [1580, 560], 4, 931);
  // pavement, then the night over everything
  solid(c, [[-20, 880], [W + 20, 880], [W + 20, H + 20], [-20, H + 20]], '#c8c0b0', 940, { w: 4, rim: false });
  nightWash(c, .85);
  // the light comes back on: the room, the door, the spill
  solid(c, [[1040, 300], [1840, 300], [1840, 880], [1040, 880]], LAMP, 960, { w: 5 });
  solid(c, [[1580, 360], [1780, 360], [1780, 880], [1580, 880]], '#ffe8b8', 961, { w: 4 });
  lamp(c, 1300, 450, 300, LAMP_HI, .5);
  for (let k = 0; k < 6; k++) {
    const x = 1090 + k * 82, y = 600 + (k % 2) * 26;
    c.save(); c.fillStyle = alpha(INK, .72); c.beginPath(); c.ellipse(x, y, 25, 29, 0, 0, TAU); c.fill(); c.fill(curvePath([[x - 38, y + 36], [x + 38, y + 36], [x + 44, 880], [x - 44, 880]], true)); c.restore();
    c.save(); c.fillStyle = alpha('#9cc6ff', .9); c.fillRect(x - 8 + (k % 2 ? 10 : -12), y + 60, 12, 18); c.restore();
  }
  ln(c, [[1060, 700], [1560, 700]], 5, 962); for (const x of [1120, 1300, 1480]) seg(c, [x, 700], [x, 880], 4, 963 + x);
  seg(c, [1040, 540], [1580, 540], 4, 964);
  person(c, 1680, 880, .95, 930, { pose: 'stand', hair: 'long', back: true, top: '#d98fa0' });
  lamp(c, 1440, 600, 520, LAMP, .45);
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 880, 0, H); g.addColorStop(0, alpha(LAMP, .7)); g.addColorStop(1, alpha(LAMP, .1)); c.fillStyle = g; c.beginPath(); c.moveTo(1580, 880); c.lineTo(1780, 880); c.lineTo(1980, H); c.lineTo(1380, H); c.closePath(); c.fill(); c.restore();
  lampPost(c, 960, 1060, 700, 950, .8);
  printFinish(c, .2);
}
// Nobody wins: the table, everyone side-eyeing the person beside them.
function sceneNobodyWins(c) {
  newsprint(c);
  skyWash(c, H, [[0, alpha('#9fb9d8', .55)], [1, alpha('#5a6888', .55)]]);
  // a lamp over the table
  seg(c, [960, -20], [960, 120], 4, 1000);
  solid(c, [[880, 180], [1040, 180], [1000, 120], [920, 120]], OCEAN, 1001, { w: 4 });
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 180, 0, 800); g.addColorStop(0, alpha(LAMP, .55)); g.addColorStop(1, alpha(LAMP, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(890, 180); c.lineTo(1030, 180); c.lineTo(1500, 800); c.lineTo(420, 800); c.closePath(); c.fill(); c.restore();
  const seats = [['ada', 450, [1, 0], 'low'], ['ben', 705, [-1, .1], 'worry'], ['cleo', 960, [0, .3], 'calm'], ['dev', 1215, [-1, 0], 'low'], ['zed', 1470, [-1, .1], 'worry']];
  for (const [k, [who, x, gaze, brows]] of seats.entries()) {
    const gst = CAST[who], calm = who === 'cleo';
    neck(c, [x, 540], [x, 470], 1011 + k * 20);
    torso(c, gst, [x, 530], 100, 820, 1010 + k * 20);
    head(c, gst, x, 395, 1.18, { eyes: calm ? 'happy' : 'look', gaze, mouth: calm ? 'smile' : 'flat', brows, turn: gaze[0] * .3, blush: calm }, 1012 + k * 20);
    for (const s of [-1, 1]) solid(c, tube([[x + s * 88, 580], [x + s * 76, 730], [x + s * 28, 716]], [21, 19, 17]), gst.top, 1015 + k * 20 + s, { w: 4.5 });
    c.save(); c.translate(x, 690); c.rotate(-.06 + k * .03); c.fillStyle = INK; c.fill(roundRectPath(-32, -54, 64, 108, 10)); c.fillStyle = '#bcd8ff'; c.fillRect(-26, -44, 52, 86); c.restore();
    for (const s of [-1, 1]) solid(c, blob(x + s * 32, 714, 19, 17, 1018 + k * 20 + s), SKIN, 1019 + k * 20 + s, { w: 4 });
    screenLight(c, x, 560, 160, .45);
  }
  solid(c, [[200, 780], [1720, 780], [1760, 860], [160, 860]], '#a3825f', 1100, { w: 5 });
  solid(c, [[160, 860], [1760, 860], [1760, H + 20], [160, H + 20]], '#7a5a42', 1101, { w: 5 });
  shadeIn(c, polyPath([[160, 860], [1760, 860], [1760, H], [160, H]]), [160, 860, 1600, 220], { al: .3, seed: 1102 });
  printFinish(c, .15);
}

// ---------------------------------------------------------------- day 3
// Scores disputed: a phone on a desk, the board's last line ringed in red marker, a question on a sticky note.
function sceneScoresDispute(c) {
  newsprint(c);
  gwash(c, rectPath(0, 0, W, H), 0, 0, W, H, [[0, alpha('#d9b98a', .6)], [1, alpha('#b88a5a', .7)]]);
  for (let k = 0; k < 26; k++) { const y = k * 44 + 10, pts = []; for (let x = -40; x <= W + 40; x += 160) pts.push([x, y + Math.sin(x / 300 + k) * 8]); ln(c, pts, 1.6, 1200 + k, false, alpha('#6d4c30', .35), { amp: 3 }); }
  // the coffee ring and the cup
  ln(c, ellPts(1560, 260, 120, 120, 0, 40), 6, 1210, true, alpha('#6d4c30', .35), { amp: 3 });
  solid(c, ellPts(1490, 860, 130, 130, 0, 40), '#ffffff', 1211, { w: 5 }); solid(c, ellPts(1490, 860, 100, 100, 0, 40), '#7a4f2e', 1212, { w: 4 });
  rwash(c, 1460, 830, 60, alpha('#ffffff', .4), 1, 'screen');
  // the sticky note
  c.save(); c.translate(330, 280); c.rotate(-.08); sticky(c, 300, 280, NOTE.butter, 1220); txt(c, '?', 0, 0, 200, { col: INK }); c.restore();
  // the phone, its board, the ring round the last row
  const PX = 930, PY = 560, PW = 400, PH = 760, rot = -.1;
  handset(c, PX, PY, PW, PH, rot, 1230, (g, sx, sy, sw, sh) => boardScreen(g, sx, sy, sw, sh, [{ score: 41 }, { score: 38 }, { score: 33 }, { score: 27 }, { score: 19 }, { score: 4, taken: true }], { seed: 1231 }));
  c.save(); c.translate(PX, PY); c.rotate(rot);
  const sy = -PH / 2 + PH * .13, sh = PH * .74, rowH = (sh * .84) / 6, ly = sy + sh * .145 + 5 * rowH + rowH / 2 - 6;
  const ring = []; for (let k = 0; k <= 46; k++) { const a = -2.4 + k / 46 * (TAU + .5); ring.push([Math.cos(a) * (PW * .58 + k * .6), ly + Math.sin(a) * (rowH * .95)]); }
  ln(c, ring, 9, 1240, false, RED, { amp: 4, p: .4 });
  txt(c, '?!', PW * .62, ly - rowH * 1.2, 110, { col: RED, rot: .15 });
  c.restore();
  // the marker, held
  solid(c, tube([[1700, 1200], [1500, 1000], [1360, 880]], [70, 64, 56]), '#4d6488', 1250, { w: 5 });
  solid(c, put(rrPts(-20, -110, 40, 220, 14), 1300, 830, -.7), '#ffffff', 1251, { w: 4 });
  solid(c, put(rrPts(-20, -110, 40, 70, 12), 1300, 830, -.7), RED, 1252, { w: 4 });
  solid(c, blob(1372, 892, 66, 52, 1253, { amp: .05, rot: -.6 }), SKIN, 1254, { w: 5 });
  for (let k = 0; k < 3; k++) solid(c, put(rrPts(-34, -14, 68, 28, 14), 1330 - k * 10, 858 + k * 30, -.5), SKIN, 1255 + k, { w: 4 });
  printFinish(c, .15);
}
// Vigil: candles along the river wall at dusk, a few people standing with their backs to us.
function sceneVigil(c) {
  newsprint(c);
  duskSky(c, 520);
  // the far bank and the bridge
  solid(c, [[-20, 520], [300, 470], [640, 490], [1000, 455], [1400, 480], [W + 20, 460], [W + 20, 540], [-20, 540]], '#3a4a6b', 1300, { w: 4, al: .85, corner: 1.1 });
  ln(c, [[-20, 500], [W + 20, 490]], 6, 1301, false, '#2b3550');
  for (let x = 40; x < W; x += 130) ln(c, [[x, 500], [x + 65, 470], [x + 130, 495]], 3, 1302 + x, false, '#2b3550', { amp: .5 });
  for (let k = 0; k < 22; k++) { const r = rng(1310 + k); dot(c, r() * W, 505 + r() * 26, 4, 4, LAMP_HI); }
  water(c, 540, 780, 1320, { col: '#5a6888', al: .7 });
  nightWash(c, .45);
  // the wall
  solid(c, [[-20, 760], [W + 20, 760], [W + 20, 800], [-20, 800]], '#d9d0bd', 1330, { w: 4.5 });
  solid(c, [[-20, 800], [W + 20, 800], [W + 20, H + 20], [-20, H + 20]], '#c8bfa9', 1331, { w: 4.5 });
  for (let y = 860; y < H; y += 60) { ln(c, [[-20, y], [W + 20, y]], 2.4, 1332 + y, false, alpha(INK, .35)); for (let x = ((y / 60) % 2) * 90; x < W; x += 180) seg(c, [x, y - 60], [x, y], 2.4, x + y, alpha(INK, .35)); }
  gwash(c, rectPath(-20, 800, W + 40, 300), 0, 800, 0, H, [[0, alpha(NAVY, .2)], [1, alpha(NAVY, .55)]]);
  // candles: the first ones lit, the rest burnt down
  for (let k = 0; k < 15; k++) {
    const x = 380 + k * 82, h = 40 + ((k * 37) % 50), lit = k < 9;
    solid(c, rrPts(x - 13, 762 - h, 26, h, 4), '#fbf7ee', 1340 + k, { w: 3.5 });
    seg(c, [x, 762 - h], [x, 752 - h], 2.5, 1360 + k);
    if (lit) { solid(c, [[x, 718 - h], [x + 10, 742 - h], [x, 756 - h], [x - 10, 742 - h]], LAMP_HI, 1380 + k, { w: 2.5, rim: false }); lamp(c, x, 740 - h, 120, LAMP, .9); }
  }
  // three people at the wall
  person(c, 300, 1120, 1.5, 1400, { pose: 'stand', back: true, hair: 'long', top: '#4d6488' });
  person(c, 470, 1140, 1.55, 1401, { pose: 'pocket', back: true, hair: 'short', top: '#8fb7a0' });
  person(c, 1660, 1130, 1.5, 1402, { pose: 'stand', back: true, hair: 'bun', top: '#c9a2d9' });
  lampPost(c, 1100, 760, 520, 1410, .9);
  printFinish(c, .2);
}

// Still sending: in the dark, a hand holds a phone. A thread from "Didi" (an older sister): a photo, sent at 03:12.
function sceneStillSending(c) {
  newsprint(c);
  nightWash(c, 1);
  screenLight(c, 960, 520, 760, .7);
  // the window behind: the moon, the curtain
  solid(c, rrPts(1300, 90, 300, 360, 10), '#1b2c57', 2300, { w: 5, al: .9 });
  ln(c, [[1450, 90], [1450, 450]], 5, 2301); ln(c, [[1300, 270], [1600, 270]], 5, 2302);
  dot(c, 1530, 170, 34, 34, LAMP_HI); dot(c, 1514, 160, 32, 32, '#1b2c57');
  solid(c, [[1270, 70], [1340, 70], [1320, 480], [1250, 500]], '#5a6888', 2303, { w: 4, al: .8 });
  const P = { x: 960, y: 500, w: 330, h: 620 }, fingers = holdingHand(c, P.x, P.y, P.w, P.h, 2310, { sleeve: '#7d8aa6' });
  handset(c, P.x, P.y, P.w, P.h, -.04, 2311, (g, sx, sy, sw, sh) => {
    g.save(); g.fillStyle = '#eef2f8'; g.fillRect(sx, sy, sw, sh); g.restore();
    g.save(); g.fillStyle = '#c9d3e3'; g.fillRect(sx, sy, sw, sh * .12); g.restore();
    textOn(g, 'Didi', sx + sw / 2, sy + sh * .065, sw * .08, { col: NAVY, weight: 700 });
    textOn(g, 'TODAY 03:12', sx + sw / 2, sy + sh * .17, sw * .05, { col: CHROME, weight: 600 });
    // the photo she sent: a dark room, a glass on a table, out of focus
    const bx = sx + sw * .1, by = sy + sh * .22, bw = sw * .62, bh = sh * .42;
    g.save(); g.fillStyle = '#ffffff'; g.fill(roundRectPath(bx - 8, by - 8, bw + 16, bh + 16, 14)); g.restore();
    g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
    const gr = g.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, '#2b3550'); gr.addColorStop(1, '#141a2a'); g.fillStyle = gr; g.fillRect(bx, by, bw, bh);
    g.filter = 'blur(3px)';
    g.fillStyle = '#7d6a52'; g.fillRect(bx, by + bh * .72, bw, bh * .28);
    g.fillStyle = 'rgba(207,227,255,.75)'; g.fillRect(bx + bw * .42, by + bh * .38, bw * .16, bh * .36);
    g.fillStyle = 'rgba(244,196,124,.6)'; g.beginPath(); g.arc(bx + bw * .8, by + bh * .2, bw * .12, 0, TAU); g.fill();
    g.filter = 'none'; g.restore();
    textOn(g, 'Delivered', sx + sw * .9, sy + sh * .7, sw * .05, { col: CHROME, weight: 500, align: 'right' });
    // the reply box, empty
    g.save(); g.fillStyle = '#ffffff'; g.fill(roundRectPath(sx + sw * .06, sy + sh * .86, sw * .88, sh * .08, sh * .04)); g.restore();
  });
  fingers();
  printFinish(c, .25);
}

// ---------------------------------------------------------------- day 4
// Cannot delete: a phone shop counter, a brand-new phone in its box, already ringing.
function sceneCannotDelete(c) {
  newsprint(c);
  skyWash(c, 600, [[0, alpha('#c7d3e6', .7)], [1, alpha('#9fb9d8', .6)]]);
  // shelves of boxed phones
  for (const y of [40, 230, 420]) {
    ln(c, [[-20, y + 160], [W + 20, y + 160]], 6, 1500 + y);
    for (let x = 30 + (y % 3) * 20; x < W; x += 112) solid(c, rrPts(x, y + 30, 92, 130, 8), [ '#ffffff', '#dceafe', '#eef2f8'][((x / 112) | 0) % 3], 1501 + x + y, { w: 3, rim: false });
  }
  solid(c, rrPts(1340, 40, 520, 120, 14), RED, 1510, { w: 4 }); txt(c, 'MOBILE REPAIRS', 1600, 102, 66, { col: '#ffffff' });
  // the technician behind the counter, turning an old phone over
  person(c, 1440, 1010, 1.72, 1530, { pose: 'hold', hair: 'short', top: '#ffffff', f: -1, lit: 0 });
  // the counter
  solid(c, [[-20, 600], [W + 20, 600], [W + 20, 720], [-20, 720]], '#e9e4d6', 1520, { w: 5 });
  solid(c, [[-20, 720], [W + 20, 720], [W + 20, H + 20], [-20, H + 20]], OCEAN, 1521, { w: 5 });
  shadeIn(c, rectPath(-20, 720, W + 40, 400), [-20, 720, W + 40, 400], { al: .3, seed: 1522 });
  // the box: lid up behind, the tray, the new phone
  solid(c, [[700, 280], [1120, 300], [1110, 640], [690, 620]], '#ffffff', 1540, { w: 5 });
  whale(c, 905, 450, 120, alpha(CHROME, .5));
  solid(c, [[640, 600], [1180, 600], [1220, 700], [600, 700]], '#ffffff', 1541, { w: 5 });
  solid(c, [[700, 610], [1120, 610], [1140, 680], [680, 680]], '#dfe6f0', 1542, { w: 3, rim: false });
  screenLight(c, 910, 500, 420, .8);
  handset(c, 910, 500, 200, 370, .06, 1543, (g, sx, sy, sw, sh) => { lockTime(g, sx, sy, sw, sh, '07:00'); whaleTile(g, sx + sw / 2, sy + sh * .55, sw * .44, 1544); });
  ringArcs(c, 910, 500, 160, 1545);
  // SIM cards and the ejector pin on the counter
  for (let k = 0; k < 4; k++) solid(c, put([[-30, -20], [24, -20], [30, -14], [30, 20], [-30, 20]], 360 + k * 26, 650 - k * 8, -.2 + k * .15), '#f0b043', 1550 + k, { w: 3 });
  ln(c, [[1300, 660], [1420, 640]], 4, 1560); ln(c, ellPts(1290, 662, 14, 14, 0, 16), 4, 1561, true);
  printFinish(c, .15);
}
// Empty servers: one rack lit at the end of a dark aisle, a torch beam on it.
function sceneEmptyServers(c) {
  newsprint(c);
  const VX = 960, VY = 470, P = (x, y, t) => [lerp(x, VX, t), lerp(y, VY, t)];
  // floor and ceiling
  solid(c, [[-20, H + 20], [W + 20, H + 20], [1140, 640], [780, 640]], '#5a6888', 1600, { w: 4, rim: false });
  for (let k = 0; k <= 12; k++) { const x = -400 + k * 226; ln(c, [[x, H + 20], P(x, H + 20, .78)], 2, 1601 + k, false, alpha(INK, .4)); }
  for (const t of [.2, .4, .55, .66, .73]) ln(c, [P(-20, H, t), P(W + 20, H, t)], 2, 1620 + t * 100, false, alpha(INK, .4));
  for (const s of [-1, 1]) {   // the rows of racks either side
    const near = s < 0 ? 0 : W, top = 0, bot = H;
    const face = [[near, top], P(near, top, .72), P(near, bot, .72), [near, bot]];
    solid(c, face, '#1b2338', 1630 + s, { w: 4 });
    for (let k = 1; k < 9; k++) { const t = .72 * (1 - Math.pow(1 - k / 9, 1.6)); ln(c, [P(near, top, t), P(near, bot, t)], 3, 1640 + k * 2 + s, false, alpha(CHROME, .45)); }
    const r = rng(1650 + s); for (let k = 0; k < 70; k++) { const t = r() * .66, yy = .1 + r() * .75; const p = P(near, lerp(top, bot, yy), t); dot(c, p[0], p[1], 5 * (1 - t), 5 * (1 - t), r() < .2 ? SEA : alpha(CHROME, .3)); }
  }
  // ceiling trays
  for (let k = 0; k < 3; k++) ln(c, [[200 + k * 760, -20], P(200 + k * 760, -20, .74)], 8, 1660 + k, false, '#2b3550');
  nightWash(c, .9);
  // the lit rack at the end
  const RX = 960, RY = 470;
  rwash(c, RX, RY, 520, alpha('#6fa8ff', .55), 1, 'screen');
  solid(c, rectPts(RX - 110, RY - 190, 220, 380), '#1b2338', 1670, { w: 4 });
  for (let k = 0; k < 12; k++) {
    const y = RY - 172 + k * 30; solid(c, rectPts(RX - 96, y, 192, 22), '#12306B', 1671 + k, { w: 2, rim: false, line: false });
    dot(c, RX - 80, y + 11, 5, 5, k === 6 ? RED : '#9cc6ff'); dot(c, RX - 64, y + 11, 5, 5, k % 3 ? '#9cc6ff' : alpha('#9cc6ff', .3));
    ln(c, [[RX - 40, y + 11], [RX + 80, y + 11]], 3, 1690 + k, false, alpha(CHROME, .5));
  }
  rwash(c, RX - 72, RY + 8, 40, alpha(RED, .7), 1, 'screen');
  // the torch beam
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(260, H, RX, RY); g.addColorStop(0, alpha('#dbe8ff', .45)); g.addColorStop(1, alpha('#dbe8ff', .12)); c.fillStyle = g;
  c.beginPath(); c.moveTo(250, H + 20); c.lineTo(390, H + 20); c.lineTo(RX + 170, RY + 140); c.lineTo(RX - 40, RY - 220); c.closePath(); c.fill(); c.restore();
  rwash(c, RX + 30, RY - 20, 220, alpha('#ffffff', .4), 1, 'screen');
  // an empty chair in the aisle
  c.save(); c.translate(1180, 760); c.scale(.8, .8);
  seg(c, [0, 0], [0, 80], 6, 1700, CHROME); for (const a of [-1, 0, 1]) seg(c, [0, 80], [a * 60, 110], 5, 1701 + a, CHROME);
  solid(c, ellPts(0, 0, 70, 18, 0, 24), '#2b3550', 1704, { w: 4 }); solid(c, rrPts(-50, -150, 100, 130, 24), '#2b3550', 1705, { w: 4 }); c.restore();
  printFinish(c, .25);
}

// ---------------------------------------------------------------- day 5
// Final board: a phone held up at first light, FINAL BOARD across its screen.
function sceneFinalBoard(c) {
  newsprint(c);
  skyWash(c, H, [[0, alpha('#5a6888', .75)], [1, alpha('#2b3550', .8)]]);
  // the window behind: sunrise over the river
  const win = rectPts(1160, 120, 600, 640), wp = polyPath(win);
  gwash(c, wp, 0, 120, 0, 760, [[0, alpha('#7b8fd0', .8)], [.6, alpha('#f0b88a', .8)], [1, alpha('#f6cf9a', .7)]], 1, 'source-over');
  c.save(); c.clip(wp); dot(c, 1460, 560, 70, 70, '#fff3dc'); lamp(c, 1460, 560, 260, LAMP_HI, .9); water(c, 600, 780, 1800, { col: '#7b8fd0', al: .6, lights: [[1460, LAMP_HI]] }); palm(c, 1300, 610, 230, 1801, { dark: true }); c.restore();
  solid(c, win, null, 1802, { w: 6 }); seg(c, [1460, 120], [1460, 760], 5, 1803); seg(c, [1160, 440], [1760, 440], 5, 1804);
  rwash(c, 1400, 500, 700, alpha(LAMP, .3), 1, 'screen');
  const P = { x: 820, y: 500, w: 360, h: 680 }, fingers = holdingHand(c, P.x, P.y, P.w, P.h, 1810, { side: -1, sleeve: '#8fb7a0' });
  handset(c, P.x, P.y, P.w, P.h, 0, 1811, (g, sx, sy, sw, sh) => boardScreen(g, sx, sy, sw, sh, [{ score: 52 }, { score: 47 }, { score: 40 }, { score: 31 }, { score: 22 }, { score: 9 }], { title: 'FINAL BOARD', barCol: RED, seed: 1812 }));
  fingers();
  screenLight(c, 820, 480, 500, .35);
  printFinish(c, .2);
}
// Last call: shutters half down along the street at dusk, the church towers over the roofs, one café still lit.
function sceneLastCall(c) {
  newsprint(c);
  duskSky(c, 640);
  church(c, 960, 420, .7, 1900);
  houses(c, -40, W + 40, 640, 31, { h0: 280, lit: .15 });
  // the shop floor: openings with their shutters half down
  solid(c, [[-20, 640], [W + 20, 640], [W + 20, 900], [-20, 900]], '#e9dcc4', 1910, { w: 4 });
  for (let k = 0; k < 6; k++) {
    const x = 60 + k * 310, cafe = k === 4;
    solid(c, rectPts(x, 680, 250, 220), cafe ? LAMP : '#2b3550', 1911 + k, { w: 4 });
    if (cafe) continue;
    const down = 120 + ((k * 53) % 70);
    solid(c, rectPts(x, 680, 250, down), '#9aa6ba', 1920 + k, { w: 4 });
    for (let y = 698; y < 680 + down; y += 18) ln(c, [[x + 4, y], [x + 246, y]], 2, 1930 + k * 20 + y, false, alpha(INK, .45), { amp: .3 });
  }
  solid(c, [[-20, 900], [W + 20, 900], [W + 20, H + 20], [-20, H + 20]], '#c8c0b0', 1950, { w: 4, rim: false });
  for (let x = -40; x < W; x += 240) ln(c, [[x, 990], [x + 120, 990]], 6, 1951 + x, false, alpha('#ffffff', .7));
  nightWash(c, .45);
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .7; c.fillStyle = LAMP; c.fillRect(1300, 680, 250, 220); c.restore();
  lamp(c, 1425, 790, 380, LAMP, .9);
  for (let p = 0; p < 3; p++) { const px = 1350 + p * 70; c.save(); c.fillStyle = alpha(INK, .55); c.beginPath(); c.ellipse(px, 790, 18, 22, 0, 0, TAU); c.fill(); c.fill(curvePath([[px - 26, 816], [px + 26, 816], [px + 30, 900], [px - 30, 900]], true)); c.restore(); }
  // a street dog trots across the empty road
  c.save(); c.translate(760, 1010); c.scale(1.1, 1.1);
  solid(c, blob(0, -60, 80, 34, 1960, { amp: .04 }), '#c9a06a', 1961, { w: 4 });
  for (const [a, b] of [[[-56, -40], [-62, 10]], [[-34, -40], [-24, 10]], [[40, -40], [30, 10]], [[60, -42], [74, 8]]]) solid(c, tube([a, b], [9, 8]), '#c9a06a', 1962 + a[0], { w: 3.5 });
  solid(c, blob(92, -104, 34, 28, 1966, { amp: .04 }), '#c9a06a', 1967, { w: 4 });
  solid(c, [[78, -128], [92, -160], [100, -126]], '#a07850', 1968, { w: 3.5 }); dot(c, 104, -108, 4, 4); dot(c, 124, -98, 6, 5);
  ln(c, [[-78, -70], [-110, -100], [-120, -130]], 7, 1969, false, '#a07850');
  c.restore();
  lampPost(c, 260, 900, 560, 1970, .6); lampPost(c, 1700, 900, 560, 1971, .6);
  printFinish(c, .15);
}

// ---------------------------------------------------------------- the morning after
// Deleted: an open window on a calm morning, the river, tea on the sill, a phone with an empty space.
function sceneDeleted(c) {
  newsprint(c);
  // the view
  const win = rectPts(380, 80, 1160, 700), wp = polyPath(win);
  gwash(c, wp, 0, 80, 0, 780, [[0, alpha('#9fc0ec', .7)], [.6, alpha('#f6dcb6', .7)], [1, alpha('#fbe6c4', .7)]], 1, 'source-over');
  c.save(); c.clip(wp);
  dot(c, 1240, 480, 80, 80, '#fff6e2'); lamp(c, 1240, 480, 420, LAMP_HI, 1);
  solid(c, [[300, 560], [600, 500], [900, 520], [1200, 490], [1600, 530], [1600, 600], [300, 600]], '#9fb79a', 2000, { w: 3.5, al: .8 });
  for (let x = 420; x < 1560; x += 120) palm(c, x, 580, 110 + (x % 4) * 10, 2001 + x, { lean: (x % 5 - 2) * .05 });
  water(c, 590, 800, 2002, { col: '#9fc0ec', al: .55, lights: [[1240, LAMP_HI]] });
  for (const [bx, by, s] of [[700, 260, 1], [780, 220, .8], [860, 290, .7]]) ln(c, [[bx - 28 * s, by], [bx - 12 * s, by - 12 * s], [bx, by], [bx + 12 * s, by - 12 * s], [bx + 28 * s, by]], 4, bx, false, INK, { amp: .3, corner: .4 });
  c.restore();
  rwash(c, 960, 430, 900, alpha(LAMP_HI, .35), 1, 'screen');
  // the wall, the frame, the shutters open
  solid(c, [[-20, -20], [W + 20, -20], [W + 20, 80], [-20, 80]], LIME, 2010, { w: 0, line: false, rim: false });
  solid(c, [[-20, 80], [380, 80], [380, 800], [-20, 800]], LIME, 2011, { w: 0, line: false, rim: false });
  solid(c, [[1540, 80], [W + 20, 80], [W + 20, 800], [1540, 800]], LIME, 2012, { w: 0, line: false, rim: false });
  solid(c, win, null, 2013, { w: 7 });
  for (const s of [-1, 1]) {
    const x = s < 0 ? 380 : 1540, sh = [[x, 100], [x + s * 300, 140], [x + s * 300, 760], [x, 780]];
    solid(c, sh, TEAL, 2014 + s, { w: 4.5 });
    for (let y = 170; y < 740; y += 36) ln(c, [[x + s * 24, y + (y - 100) * .05], [x + s * 276, y + 24 + (y - 100) * .03]], 3, 2016 + y + s, false, alpha(INK, .5));
  }
  // the sill
  solid(c, [[300, 780], [1620, 780], [1660, 840], [260, 840]], '#fbf7ee', 2030, { w: 5 });
  solid(c, [[-20, 840], [W + 20, 840], [W + 20, H + 20], [-20, H + 20]], '#e9dcc4', 2031, { w: 4, rim: false });
  teacup(c, 600, 810, 1, 2040); steam(c, 600, 690, 2041, 130);
  solid(c, [[1290, 800], [1410, 800], [1394, 700], [1306, 700]], TERRA, 2042, { w: 4 });
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .38; solid(c, put([[0, 0], [16, -60], [0, -130], [-16, -60]], 1350, 700, a + Math.PI / 2), LEAF, 2043 + k, { w: 3 }); }
  // the phone on the sill: a home screen with one space empty
  c.save(); c.translate(960, 720); c.rotate(-.04);
  handset(c, 0, 0, 230, 430, 0, 2060, (g, sx, sy, sw, sh) => {
    const bg = g.createLinearGradient(0, sy, 0, sy + sh); bg.addColorStop(0, '#9fc0ec'); bg.addColorStop(1, '#f6dcb6'); g.fillStyle = bg; g.fillRect(sx, sy, sw, sh);
    const cols = ['#4CD964', '#5b9be8', '#f0b043', '#d98fa0', '#ff7a59', '#8fb7a0', '#c9a2d9', '#7fb2b0'], s = sw * .17;
    for (let k = 0; k < 12; k++) {
      const x = sx + sw * (.16 + (k % 4) * .225), y = sy + sh * (.12 + Math.floor(k / 4) * .17);
      if (k === 5) { g.save(); g.setLineDash([5, 5]); g.strokeStyle = 'rgba(14,22,38,.55)'; g.lineWidth = 2.5; g.stroke(roundRectPath(x - s / 2, y - s / 2, s, s, s * .22)); g.restore(); continue; }
      g.fillStyle = cols[k % cols.length]; g.fill(roundRectPath(x - s / 2, y - s / 2, s, s, s * .22));
      g.fillStyle = 'rgba(255,255,255,.3)'; g.fill(roundRectPath(x - s / 2, y - s / 2, s, s * .45, s * .22));
    }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(sx, sy + sh * .84, sw, sh * .16);
  });
  c.restore();
  printFinish(c, .1);
}
// Rings again: midnight, a phone glowing on the table, SEE YOU AT SEVEN on its screen, the clock at 11:59.
function sceneRingsAgain(c) {
  newsprint(c);
  // the wall clock
  const CXk = 1530, CYk = 250, R = 130;
  solid(c, ellPts(CXk, CYk, R, R, 0, 48), '#fbf7ee', 2100, { w: 6 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; seg(c, [CXk + Math.cos(a) * R * .8, CYk + Math.sin(a) * R * .8], [CXk + Math.cos(a) * R * .92, CYk + Math.sin(a) * R * .92], k % 3 ? 3 : 6, 2101 + k); }
  const hand = (a, l, w) => seg(c, [CXk, CYk], [CXk + Math.cos(a - Math.PI / 2) * l, CYk + Math.sin(a - Math.PI / 2) * l], w, 2120 + l);
  hand(-.008 * TAU - .02, R * .55, 9); hand(-1 / 60 * TAU, R * .8, 5); dot(c, CXk, CYk, 9, 9);
  // the table
  solid(c, [[-20, 640], [W + 20, 640], [W + 20, H + 20], [-20, H + 20]], '#7a5a42', 2130, { w: 5 });
  for (let k = 0; k < 8; k++) ln(c, [[-20, 680 + k * 54], [W + 20, 690 + k * 56]], 2, 2131 + k, false, alpha('#3a2a1e', .45), { amp: 4 });
  teacup(c, 600, 700, .9, 2140);
  nightWash(c, 1);
  screenLight(c, 960, 430, 640, .85);
  rwash(c, 960, 700, 520, alpha('#9cc6ff', .35), 1, 'screen');
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .35; c.fillStyle = '#9cc6ff'; c.beginPath(); c.ellipse(960, 720, 340, 60, 0, 0, TAU); c.fill(); c.restore();
  handset(c, 960, 420, 300, 560, -.04, 2150, (g, sx, sy, sw, sh) => {
    g.fillStyle = '#081430'; g.fillRect(sx, sy, sw, sh);
    whaleTile(g, sx + sw / 2, sy + sh * .3, sw * .38, 2151);
    textOn(g, 'SEE YOU', sx + sw / 2, sy + sh * .6, sw * .15, { weight: 800 });
    textOn(g, 'AT SEVEN', sx + sw / 2, sy + sh * .74, sw * .15, { weight: 800, col: RED });
  });
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .25; c.fillStyle = '#9cc6ff'; c.fill(roundRectPath(830, 700, 260, 60, 20)); c.restore();   // its reflection on the wood
  printFinish(c, .3);
}

// ---------------------------------------------------------------- the room's own stories
function cafeMorning(c, rows, o = {}) {
  marble(c);
  rwash(c, 300, 100, 900, alpha(LAMP_HI, .55), 1, 'screen');
  teacup(c, 360, 900, 1.2, 2200, '#ffffff'); steam(c, 360, 770, 2201, 140);
  solid(c, ellPts(1580, 300, 170, 60, 0, 40), '#ffffff', 2202, { w: 4.5 });
  solid(c, [[1480, 300], [1530, 250], [1620, 240], [1690, 280], [1660, 320], [1520, 330]], '#e0a85e', 2203, { w: 4 });
  for (let k = 0; k < 3; k++) ln(c, [[1540 + k * 40, 262], [1530 + k * 46, 318]], 3, 2204 + k, false, alpha('#7a4f2e', .7));
  handset(c, 1560, 820, 180, 330, .5, 2210, null, { back: true });
  handset(c, 360, 300, 170, 310, -.6, 2211, null, { back: true });
  const PX = 960, PY = 540;
  c.save(); c.fillStyle = 'rgba(36,50,79,.25)'; c.fill(roundRectPath(PX - 200 + 24, PY - 380 + 30, 400, 760, 64)); c.restore();
  handset(c, PX, PY, 400, 760, .04, 2220, (g, sx, sy, sw, sh) => boardScreen(g, sx, sy, sw, sh, rows, { seed: 2221, title: o.title }));
  printFinish(c, .1);
}
function sceneDawnTaken(c) { cafeMorning(c, [{ score: 44 }, { score: 39 }, { score: 31 }, { score: 26 }, { score: 18 }, { score: 3, taken: true, stamp: 'TAKEN' }]); }
function sceneDawnClear(c) {
  cafeMorning(c, [{ score: 44 }, { score: 39 }, { score: 31 }, { score: 26 }, { score: 18 }, { score: 12 }]);
  rwash(c, 960, 540, 760, alpha(LAMP_HI, .35), 1, 'screen');
}
// The vote: the room's raised hands, and one guest walking out through the lit door.
function crowdBacks(c, seed, arms) {
  // the room from behind: shoulders and heads, some arms up. arms[k] = tilt of the raised arm (radians, + leans right) or null
  const ppl = [[150, 1000, 1.25], [370, 1040, 1.35], [600, 1010, 1.2], [790, 1070, 1.3], [1130, 1070, 1.3], [1330, 1010, 1.2], [1560, 1040, 1.35], [1780, 1000, 1.25]];
  const fill = '#1b2338', rim = '#2b3550';
  for (const [k, [x, y, s]] of ppl.entries()) {
    const t = arms[k];
    if (t !== null && t !== undefined) {
      const sh = [x + Math.sign(t || 1) * 58 * s, y - 170 * s], el = add(sh, [Math.sin(t * .6) * 120 * s, -120 * s]), hand = add(el, [Math.sin(t) * 120 * s, -Math.cos(t) * 110 * s]);
      solid(c, tube([sh, el, hand], [20 * s, 17 * s, 14 * s]), fill, seed + k * 3, { w: 4, rim: false });
      solid(c, blob(hand[0], hand[1], 17 * s, 20 * s, seed + k * 3 + 1), rim, seed + k * 3 + 2, { w: 4, rim: false });
      const d = norm(sub(hand, el)); solid(c, tube([hand, add(hand, mul(d, 42 * s))], [6.5 * s, 5.5 * s]), rim, seed + k * 3 + 9, { w: 3.5, rim: false });
    }
    solid(c, [[x - 100 * s, y + 140], [x - 92 * s, y - 150 * s], [x - 40 * s, y - 182 * s], [x + 40 * s, y - 182 * s], [x + 92 * s, y - 150 * s], [x + 100 * s, y + 140]], fill, seed + 40 + k, { w: 4, corner: 1, rim: false });
    solid(c, blob(x, y - 240 * s, 44 * s, 50 * s, seed + 50 + k, { amp: .04 }), rim, seed + 60 + k, { w: 4, rim: false });
  }
}
function sceneVoteOut(c) {
  newsprint(c);
  solid(c, [[-20, -20], [W + 20, -20], [W + 20, 760], [-20, 760]], '#c9a2d9', 2300, { w: 0, line: false, rim: false, al: .35 });
  solid(c, [[-20, 760], [W + 20, 760], [W + 20, H + 20], [-20, H + 20]], '#a3825f', 2301, { w: 4, rim: false });
  for (let x = -100; x < W + 200; x += 160) ln(c, [[x, 760], [x + (x - 960) * .6, H + 20]], 2, 2302 + x, false, alpha(INK, .3));
  // the door, open, light pouring out
  solid(c, [[820, 760], [820, 260], [1100, 260], [1100, 760]], '#fff3d6', 2310, { w: 6 });
  solid(c, [[1100, 260], [1240, 300], [1240, 800], [1100, 760]], '#7a5a42', 2311, { w: 5 });
  dot(c, 1218, 540, 9, 9, '#c9a86a');
  nightWash(c, .7);
  c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = alpha(LAMP_HI, .9); c.fillRect(820, 260, 280, 500); c.restore();
  lamp(c, 960, 520, 520, LAMP, .9);
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .45; c.fillStyle = LAMP; c.beginPath(); c.moveTo(820, 760); c.lineTo(1100, 760); c.lineTo(1500, H + 20); c.lineTo(420, H + 20); c.closePath(); c.fill(); c.restore();
  person(c, 960, 752, .95, 2320, { pose: 'stand', back: true, hair: 'short', top: '#1b2338', legs: '#1b2338', hairCol: '#1b2338' });
  c.save(); c.globalAlpha = .45; c.fillStyle = '#1b2338'; c.beginPath(); c.moveTo(930, 760); c.lineTo(990, 760); c.lineTo(1040, H + 20); c.lineTo(880, H + 20); c.closePath(); c.fill(); c.restore();   // the long shadow
  crowdBacks(c, 2330, [.55, null, .45, .25, -.25, -.45, null, -.55]);
  printFinish(c, .25);
}
function sceneVoteNone(c) {
  newsprint(c);
  solid(c, [[-20, -20], [W + 20, -20], [W + 20, 760], [-20, 760]], '#9fb9d8', 2400, { w: 0, line: false, rim: false, al: .45 });
  // the tally on the wall: two columns, level
  solid(c, rrPts(560, 120, 800, 520, 16), '#2b3550', 2401, { w: 6 });
  solid(c, rrPts(540, 100, 840, 560, 20), null, 2402, { w: 8 });
  seg(c, [960, 160], [960, 600], 4, 2403, alpha('#ffffff', .6));
  const tally = (x, y, n, seed) => { for (let k = 0; k < n; k++) { const gx = x + Math.floor(k / 5) * 130, i5 = k % 5; if (i5 < 4) seg(c, [gx + i5 * 22, y], [gx + i5 * 22 + 4, y + 100], 7, seed + k, '#ffffff'); else seg(c, [gx - 16, y + 78], [gx + 84, y + 18], 7, seed + k, '#ffffff'); } };
  tally(640, 300, 8, 2410); tally(1040, 300, 8, 2430);
  nightWash(c, .45);
  crowdBacks(c, 2500, [.6, -.5, null, .55, -.6, .45, -.55, null]);
  printFinish(c, .2);
}
