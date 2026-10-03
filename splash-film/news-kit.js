'use strict';
// The drawing kit for the News app's pictures (news.html): newsprint, night
// washes, lamplight, the DEEP BLUE handset and its whale tile, small editorial
// figures, buildings, palms, water. A classic script that loads after core.js,
// studio.js, cels.js, word-font.js and board-kit.js, and shares their globals
// (ln, shape, dot, tube, txt, INK, SKIN, HAIR ...).
//
// Units: the frame is 1920 x 1080. The app shows each picture at 16:9 and as a
// square thumbnail cut from the middle, so the subject of every picture sits
// inside x 420..1500.

// ---------------------------------------------------------------- palette
// The phone's blues for night and water, one warm lamplight (an illustration
// colour, never gold: gold is for scores), red only for tape, alarms and TAKEN.
const NEWSPRINT = '#f6f1e4';
const NAVY = '#0B1D45', DEEPB = '#12306B', OCEAN = '#1E56B0', FOAM = '#EAF3FF', CHROME = '#8FA3C2', ABYSS = '#050E24';
const LAMP = '#f4c47c', LAMP_HI = '#fff0cf', GLASS = '#cfe3ff', CORAL = '#FF7A59';
const LEAF = '#6f9a74', LEAF_D = '#4b7357', OCHRE = '#e6b866', TERRA = '#d4826a', LIME = '#efe7d2', TEAL = '#7fb2b0';
const TOPS = ['#5b9be8', '#d98fa0', '#f0b043', '#8fb7a0', '#4d6488', '#c9a2d9', '#e88e6a', '#7fb2b0'];
const LEGS = ['#3a4a6b', '#5a6888', '#2b3550', '#7d8aa6', '#4b5570'];

// ---------------------------------------------------------------- paper, washes, light
let NEWS_PAGE = null;
function newsprint(c) {
  if (!NEWS_PAGE) {
    NEWS_PAGE = layer(); const g = NEWS_PAGE.getContext('2d'); g.setTransform(S, 0, 0, S, 0, 0);
    g.fillStyle = NEWSPRINT; g.fillRect(0, 0, W, H);
    grain(g, rectPath(0, 0, W, H), [0, 0, W, H], 9000, '#6d6455', .07, 11, 2.2);
    grain(g, rectPath(0, 0, W, H), [0, 0, W, H], 2500, '#ffffff', .25, 12, 3);
  }
  resetT(c); blit(c, NEWS_PAGE);
}
// A linear gradient laid on with multiply: the night, the water, a sky. stops: [[t, colour], ...]
function gwash(c, path, x0, y0, x1, y1, stops, al = 1, blend = 'multiply') {
  c.save(); c.globalCompositeOperation = blend; c.globalAlpha = al;
  const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, col]) => g.addColorStop(t, col));
  c.fillStyle = g; c.fill(path); c.restore();
}
// A radial pool of colour (multiply darkens, screen lightens).
function rwash(c, x, y, r, col, al = 1, blend = 'multiply', inner = 0) {
  c.save(); c.globalCompositeOperation = blend; c.globalAlpha = al;
  const g = c.createRadialGradient(x, y, r * inner, x, y, r); g.addColorStop(0, col); g.addColorStop(1, alpha(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
// Light: lamps, screens, windows. Screen-blended so it lifts a night wash.
const lamp = (c, x, y, r, col = LAMP, k = 1) => { rwash(c, x, y, r, alpha(col, .85 * k), 1, 'screen'); rwash(c, x, y, r * .35, alpha(LAMP_HI, .7 * k), 1, 'screen'); };
const screenLight = (c, x, y, r, k = 1) => { rwash(c, x, y, r, alpha('#9cc6ff', .75 * k), 1, 'screen'); rwash(c, x, y, r * .3, alpha('#ffffff', .6 * k), 1, 'screen'); };
// Ink hatching over a region, for shadow and night.
function shadeIn(c, path, box, o = {}) {
  hatch(c, path, box, { angle: o.angle ?? 1.15, gap: o.gap ?? 9, len: o.len ?? 26, jitter: 5, color: o.color ?? INK, alpha: o.al ?? .28, width: o.w ?? 1.6, seed: o.seed ?? 1, flow: .2, curve: .15 });
}
const boxOf = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]; };
// Points round a rounded rectangle, for an inked outline.
function rrPts(x, y, w, h, r) {
  const out = [], arc = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + k / 6 * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return out;
}
// An inked shape with a flat fill (no paper base), for things that are not skin.
function solid(c, pts, col, seed, o = {}) {
  const path = curvePath(pts, true, o.corner ?? .6);
  if (col) {
    c.save(); c.globalAlpha = o.al ?? 1; c.fillStyle = col; c.fill(path); c.restore();
    if (o.rim !== false) {   // watercolour pools at its edge: a darker rim just inside the shape
      c.save(); c.clip(path); c.globalCompositeOperation = 'multiply'; c.globalAlpha = (o.al ?? 1) * .3; c.strokeStyle = shade(col, .28); c.lineWidth = o.rimW ?? 12; c.stroke(path); c.restore();
    }
  }
  if (o.wash) wash(c, path, o.wash, { al: o.washAl ?? .5, seed, off: 3 });
  if (o.line !== false) ln(c, pts, o.w ?? 4, seed + 1, true, o.lineCol ?? INK, { amp: o.amp ?? 1.1, corner: o.corner ?? .6, p: .5 });
  return path;
}
// A wobbly straight-ish line between two points.
const seg = (c, a, b, w, seed, col = INK, amp = 1) => ln(c, [a, mixv(a, b, .5), b], w, seed, false, col, { amp });

// ---------------------------------------------------------------- the handset and the whale
// The app's whale (icons/Glyph.jsx), in a 59-unit box centred on (29.5, 29.5).
const WHALE_PATH = new Path2D('M54 34C54 42 46 46 35 46C27 46 21.500 43 18 38C15.500 34.500 14.500 30 13 25.500C10.500 26.500 7.500 26 5 23.500C8 20.500 11.500 19.500 14.500 20.500C15.500 17 17.500 14.500 20 13C20.500 17 21.500 21 24 24C27 22.500 31 22 35 22C46 22 54 26 54 34Z');
function whale(c, x, y, s, col = FOAM, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s / 59, s / 59); c.translate(-29.5, -29.5); c.fillStyle = col; c.fill(WHALE_PATH); c.restore();
}
// The DEEP BLUE app tile: a dark blue rounded square, the white whale, a gloss.
function whaleTile(c, x, y, s, seed = 1) {
  c.save(); c.translate(x, y);
  const g = c.createLinearGradient(0, -s / 2, 0, s / 2); g.addColorStop(0, '#2a66c4'); g.addColorStop(.5, DEEPB); g.addColorStop(1, NAVY);
  c.fillStyle = g; c.fill(roundRectPath(-s / 2, -s / 2, s, s, s * .22));
  c.save(); c.clip(roundRectPath(-s / 2, -s / 2, s, s, s * .22)); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(0, -s * .52, s * .8, s * .45, 0, 0, TAU); c.fill(); c.restore();
  whale(c, 0, s * .02, s * .82);
  ln(c, rrPts(-s / 2, -s / 2, s, s, s * .22), Math.max(2, s * .03), seed, true, INK, { amp: .4, corner: .3 });
  c.restore();
}
// An iPhone-era handset, centred at (x, y), portrait w x h, turned rot. screen(c, sx, sy, sw, sh) paints the
// display inside a clip, in the handset's own coordinates. o.lit (0..1) lights the glass; o.back shows the back.
function handset(c, x, y, w, h, rot, seed, screen, o = {}) {
  const { lit = 1, body = '#1b2338', rim = '#9aa8c0' } = o;
  c.save(); c.translate(x, y); c.rotate(rot);
  const r = w * .16, outline = rrPts(-w / 2, -h / 2, w, h, r);
  c.save(); c.shadowColor = 'rgba(11,29,69,.35)'; c.shadowBlur = w * .12 * S; c.shadowOffsetY = w * .05 * S; c.fillStyle = body; c.fill(roundRectPath(-w / 2, -h / 2, w, h, r)); c.restore();
  c.save(); c.strokeStyle = rim; c.lineWidth = w * .022; c.stroke(roundRectPath(-w / 2 + w * .02, -h / 2 + w * .02, w * .96, h - w * .04, r * .9)); c.restore();
  if (o.back) { whale(c, 0, -h * .08, w * .34, alpha(CHROME, .55)); }
  else {
    const sx = -w * .43, sy = -h / 2 + h * .13, sw = w * .86, sh = h * .74;
    c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
    const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, lit ? '#3d7fe0' : '#202a40'); g.addColorStop(1, lit ? NAVY : '#141a2a');
    c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
    if (screen) screen(c, sx, sy, sw, sh);
    c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + sw, sy); c.lineTo(sx, sy + sh * .55); c.closePath(); c.fill();   // glass glare
    c.restore();
    c.save(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.strokeRect(sx, sy, sw, sh); c.restore();
    c.save(); c.strokeStyle = rim; c.lineWidth = w * .018; c.beginPath(); c.arc(0, h / 2 - h * .065, w * .075, 0, TAU); c.stroke(); c.restore();   // home button
    c.save(); c.fillStyle = '#3a4560'; c.fill(roundRectPath(-w * .11, -h / 2 + h * .055, w * .22, w * .035, w * .02)); c.restore();   // speaker
  }
  ln(c, outline, Math.max(3, w * .025), seed, true, INK, { amp: .6, corner: .3 });
  c.restore();
}
// A lock screen: the time and the date line, in the phone's thin type.
function lockTime(c, sx, sy, sw, sh, time = '07:00', o = {}) {
  c.save(); c.fillStyle = 'rgba(5,14,36,.45)'; c.fillRect(sx, sy, sw, sh * .2); c.restore();
  c.save(); c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `200 ${sw * .3}px "Helvetica Neue", Helvetica, Arial, sans-serif`; c.fillText(time, sx + sw / 2, sy + sh * .1);
  if (o.date) { c.font = `400 ${sw * .065}px "Helvetica Neue", Helvetica, Arial, sans-serif`; c.globalAlpha = .85; c.fillText(o.date, sx + sw / 2, sy + sh * .175); }
  c.restore();
}

// ---------------------------------------------------------------- people
// A small editorial figure, feet at (x, y), about 400 units tall at sc = 1, facing f (1 right, -1 left).
// o: { top, legs, hair: 'short'|'long'|'bun'|'cap'|'curly'|'bald', pose: 'phone'|'stand'|'raise'|'point'|'walk'|'hold',
//      back (seen from behind), skirt, lit (the phone's light on the face, 0..1), bag, head: [dx, dy] }
function person(c, x, y, sc, seed, o = {}) {
  const f = o.f ?? 1, top = o.top ?? TOPS[seed % TOPS.length], leg = o.legs ?? LEGS[seed % LEGS.length], pose = o.pose ?? 'phone';
  const r = rng(seed), hairCol = o.hairCol ?? (r() < .5 ? '#5d5a57' : r() < .5 ? HAIR_D : '#2f2c2a'), hair = o.hair ?? ['short', 'long', 'bun', 'curly', 'short', 'cap'][seed % 6];
  c.save(); c.translate(x, y); c.scale(sc * f, sc);
  const walk = pose === 'walk', st = walk ? 30 : 0;
  // legs
  if (o.skirt) {
    solid(c, tube([[-12, -150], [-14, -8]], [11, 9]), SKIN, seed + 1, { w: 3.5 });
    solid(c, tube([[12, -150], [14, -8]], [11, 9]), SKIN, seed + 2, { w: 3.5 });
    solid(c, [[-34, -212], [34, -212], [48, -110], [-48, -110]], leg, seed + 3, { w: 4 });
  } else {
    solid(c, tube([[-14, -200], [-16 - st * .4, -100], [-18 - st, -8]], [17, 14, 11]), leg, seed + 1, { w: 4 });
    solid(c, tube([[14, -200], [16 + st * .4, -100], [20 + st, -8]], [17, 14, 11]), leg, seed + 2, { w: 4 });
  }
  dot(c, -14 - st + 4, -5, 17, 8, INK); dot(c, 22 + st + 4, -5, 17, 8, INK);
  // torso
  const tor = [[-40, -330], [-14, -338], [14, -338], [40, -330], [48, -292], [42, -196], [-42, -196], [-48, -292]];
  solid(c, tor, top, seed + 4, { w: 4.5, corner: .9 });
  if (o.bag) { ln(c, [[-30, -332], [10, -260], [40, -205]], 4, seed + 5); solid(c, rrPts(28, -230, 40, 34, 6), '#8a6a50', seed + 6, { w: 3.5 }); }
  // arms
  const shL = [-38, -322], shR = [38, -322];
  const arms = {
    phone: [[[-4, -262], [-46, -262]], [[10, -268], [48, -262]]],
    hold: [[[-6, -290], [-40, -258]], [[14, -296], [42, -262]]],
    stand: [[[-50, -200], [-50, -262]], [[50, -200], [50, -262]]],
    walk: [[[-62, -214], [-54, -266]], [[56, -210], [52, -264]]],
    raise: [[[-50, -200], [-50, -262]], [[64, -470], [62, -400]]],
    point: [[[-50, -200], [-50, -262]], [[140, -330], [90, -318]]],
    wave: [[[-50, -200], [-50, -262]], [[96, -430], [86, -360]]],
    spread: [[[-96, -268], [-62, -240]], [[110, -272], [72, -244]]],
    pocket: [[[-34, -214], [-52, -262]], [[34, -214], [52, -262]]],
  }[pose] ?? [[[-50, -200], [-50, -262]], [[50, -200], [50, -262]]];
  const drawArm = (sh, [hand, elbow], k) => {
    solid(c, tube([sh, elbow, hand], [12, 10.5, 9]), top, seed + 10 + k, { w: 4 });
    solid(c, blob(hand[0], hand[1], 10, 10, seed + 12 + k, { amp: .05 }), SKIN, seed + 14 + k, { w: 3.5 });
  };
  if (!o.back) drawArm(shL, arms[0], 0);
  // head
  const down = pose === 'phone' || pose === 'hold', hd = o.head ?? (down ? [7, -360] : [0, -372]);
  solid(c, tube([[0, -334], [hd[0] * .6, hd[1] + 22]], [11, 11]), SKIN, seed + 20, { w: 3.5 });
  const skull = blob(hd[0], hd[1], 29, 33, seed + 21, { amp: .03 });
  solid(c, skull, SKIN, seed + 22, { w: 4.5 });
  personHair(c, hair, hd, hairCol, seed + 30, o.back, down);
  if (!o.back) {
    // the features of a small figure: a nose and, looking down, a lowered lid
    ln(c, [[hd[0] + 27, hd[1] - 4], [hd[0] + 35, hd[1] + 8], [hd[0] + 27, hd[1] + 11]], 3, seed + 40, false, INK, { amp: .3, corner: .4 });
    if (down) ln(c, [[hd[0] + 8, hd[1] + 2], [hd[0] + 18, hd[1] + 5]], 3, seed + 41, false, INK, { amp: .2 });
    else dot(c, hd[0] + 14, hd[1] - 1, 3.4, 4.2);
  }
  if (o.back) { drawArm(shL, arms[0], 0); }
  drawArm(shR, arms[1], 1);
  if (pose === 'phone' || pose === 'hold') {
    const p = pose === 'phone' ? [16, -276] : [24, -306];
    c.save(); c.translate(p[0], p[1]); c.rotate(pose === 'phone' ? -.9 : -.5); c.fillStyle = INK; c.fill(roundRectPath(-11, -19, 22, 38, 4)); if ((o.lit ?? 1) > 0) { c.fillStyle = '#bcd8ff'; c.fillRect(-8, -14, 16, 26); } c.restore();
  }
  c.restore();
  if (!o.back && (pose === 'phone' || pose === 'hold') && (o.lit ?? 1) > 0) screenLight(c, x + f * sc * 22, y - sc * 300, sc * 90, (o.lit ?? 1) * .55);
}
function personHair(c, hair, [hx, hy], col, seed, back, down) {
  const pts = {
    short: [[hx - 31, hy + 4], [hx - 30, hy - 24], [hx - 10, hy - 38], [hx + 14, hy - 37], [hx + 30, hy - 22], [hx + 26, hy - 12], [hx + 4, hy - 16], [hx - 14, hy - 8], [hx - 20, hy + 8]],
    long: [[hx - 33, hy + 52], [hx - 34, hy - 18], [hx - 14, hy - 38], [hx + 14, hy - 37], [hx + 31, hy - 20], [hx + 26, hy - 10], [hx + 4, hy - 20], [hx - 12, hy - 4], [hx - 14, hy + 44]],
    bun: [[hx - 31, hy + 6], [hx - 30, hy - 24], [hx - 10, hy - 38], [hx + 14, hy - 37], [hx + 30, hy - 22], [hx + 24, hy - 14], [hx, hy - 18], [hx - 16, hy - 6], [hx - 20, hy + 10]],
    curly: scallop(hx - 4, hy - 6, 34, Math.PI * .7, Math.PI * 2.05, 7, 7),
    cap: [[hx - 32, hy - 6], [hx - 28, hy - 28], [hx - 6, hy - 40], [hx + 18, hy - 36], [hx + 30, hy - 18], [hx + 56, hy - 14], [hx + 52, hy - 8], [hx + 28, hy - 8], [hx - 28, hy - 4]],
    bald: null,
  }[hair];
  if (back && pts) {
    // seen from behind the hair covers the head
    const b = blob(hx, hy - 4, 31, 34, seed + 3, { amp: .03 }); solid(c, hair === 'long' ? [...b.filter(p => p[1] < hy + 10), [hx + 30, hy + 50], [hx - 30, hy + 50]] : b, hair === 'cap' ? '#3a4a6b' : col, seed, { w: 4.5 });
    return;
  }
  if (!pts) return;
  solid(c, pts, hair === 'cap' ? '#3a4a6b' : col, seed, { w: 4, corner: hair === 'curly' ? .5 : .9 });
  if (hair === 'bun') solid(c, blob(hx - 22, hy - 34, 14, 13, seed + 5), col, seed + 6, { w: 4 });
}

// The print: the paper's fibre laid over everything, so fills read as ink on newsprint, and a soft edge.
let NEWS_FINISH = null;
function printFinish(c, vignette = .18) {
  if (!NEWS_FINISH) {
    NEWS_FINISH = layer(); const g = NEWS_FINISH.getContext('2d'); g.setTransform(S, 0, 0, S, 0, 0);
    grain(g, rectPath(0, 0, W, H), [0, 0, W, H], 14000, '#5d5446', .09, 21, 2);
    const r = rng(22); g.strokeStyle = 'rgba(93,84,70,.07)'; g.lineWidth = 1.2; g.beginPath();
    for (let k = 0; k < 900; k++) { const x = r() * W, y = r() * H, a = r() * TAU, L = 6 + r() * 16; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
    g.stroke();
  }
  resetT(c); c.save(); c.globalCompositeOperation = 'multiply'; blit(c, NEWS_FINISH); c.restore();
  if (vignette) { c.save(); c.globalCompositeOperation = 'multiply'; const g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .62); g.addColorStop(0, 'rgba(36,50,79,0)'); g.addColorStop(1, `rgba(36,50,79,${vignette})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
}

// ---------------------------------------------------------------- places
// A palm, rooted at (x, y), height h, leaning `lean`.
function palm(c, x, y, h, seed, o = {}) {
  const { lean = .15, col = LEAF_D, dark = false } = o, top = [x + h * lean, y - h];
  const trunk = tube([[x, y], [x + h * lean * .3, y - h * .5], top], [h * .03, h * .025, h * .018]);
  solid(c, trunk, dark ? NAVY : '#a08a6e', seed, { w: 3.5, al: dark ? .9 : 1 });
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * .52 + (rng(seed + k)() - .5) * .2, L = h * (.38 + rng(seed + k * 3)() * .12), droop = h * .16;
    const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * .55 + droop * Math.abs(Math.cos(a))];
    const mid = [top[0] + Math.cos(a) * L * .5, top[1] + Math.sin(a) * L * .5 - h * .04];
    const n = norm(sub(tip, top)), pn = [-n[1], n[0]], wd = h * .06;
    const frond = [top, add(mid, mul(pn, wd)), tip, add(mid, mul(pn, -wd * .4))];
    solid(c, frond, dark ? NAVY : col, seed + 10 + k, { w: 3, al: dark ? .92 : .9, corner: .7 });
  }
}
// Water: horizontal broken strokes and a gradient, between y0 and y1.
function water(c, y0, y1, seed, o = {}) {
  const { col = OCEAN, al = .75, lights = [] } = o, path = rectPath(-20, y0, W + 40, y1 - y0);
  gwash(c, path, 0, y0, 0, y1, [[0, alpha(col, al * .55)], [1, alpha(NAVY, al)]]);
  const r = rng(seed);
  for (let k = 0; k < 70; k++) {
    const yy = y0 + 12 + Math.pow(r(), 1.3) * (y1 - y0 - 12), xx = r() * W, L = 30 + r() * 90 * (1 + (yy - y0) / (y1 - y0));
    ln(c, [[xx, yy], [xx + L * .5, yy - 2], [xx + L, yy]], 2.2 + (yy - y0) / (y1 - y0) * 2, seed + k, false, alpha(FOAM, .35 + r() * .3), { amp: .5, p: .8 });
  }
  for (const [lx, lc] of lights) for (let k = 0; k < 9; k++) { const yy = y0 + 10 + k * (y1 - y0) / 10, ww = 18 + k * 7; ln(c, [[lx - ww, yy], [lx + ww, yy]], 4, seed + 200 + k, false, alpha(lc, .6 - k * .05), { amp: 1 }); }
}
// A strip of Fontainhas houses: ochre, blue, green fronts, tiled roofs, balconies. Ground at y.
function houses(c, x0, x1, y, seed, o = {}) {
  const { night = 0, h0 = 260, lit = .35 } = o, r = rng(seed), cols = [OCHRE, TEAL, '#e9d7a8', TERRA, '#9fb9d8', LIME];
  let x = x0, k = 0;
  while (x < x1) {
    const w = 170 + r() * 120, h = h0 + r() * 140, col = cols[(seed + k) % cols.length];
    const front = [[x, y], [x, y - h], [x + w, y - h], [x + w, y]];
    solid(c, front, col, seed + k * 7, { w: 4, al: .9 });
    solid(c, [[x - 14, y - h], [x + w * .5, y - h - 58], [x + w + 14, y - h]], TERRA, seed + k * 7 + 1, { w: 4, al: .85 });
    for (let j = 0; j < 3; j++) {   // windows with shutters
      const wx = x + 26 + j * (w - 52) / 2.6, wy = y - h + 46, ww = 34, wh = 62;
      if (wx + ww > x + w - 16) continue;
      const on = r() < lit;
      solid(c, rectPts(wx, wy, ww, wh), on ? LAMP : DEEPB, seed + k * 7 + 2 + j, { w: 3, al: on ? .95 : .55 });
      if (h > 300) solid(c, rectPts(wx, wy + 110, ww, wh), r() < lit ? LAMP : DEEPB, seed + k * 7 + 5 + j, { w: 3, al: .55 });
      if (on && night) lamp(c, wx + ww / 2, wy + wh / 2, 70, LAMP, night * .6);
    }
    ln(c, [[x + 10, y - h + 128], [x + w - 10, y - h + 128]], 4, seed + k * 7 + 9);   // balcony rail
    for (let b = x + 18; b < x + w - 12; b += 16) seg(c, [b, y - h + 128], [b, y - h + 150], 2, seed + b);
    x += w + 6; k++;
  }
}
// A lamp post at (x, y) ground, h tall, the lamp lit.
function lampPost(c, x, y, h, seed, k = 1) {
  solid(c, tube([[x, y], [x, y - h]], [7, 5]), NAVY, seed, { w: 3 });
  ln(c, [[x, y - h], [x + 26, y - h - 18], [x + 50, y - h - 6]], 6, seed + 1, false, NAVY);
  solid(c, [[x + 36, y - h - 8], [x + 64, y - h - 8], [x + 58, y - h + 16], [x + 42, y - h + 16]], LAMP_HI, seed + 2, { w: 3 });
  if (k > 0) lamp(c, x + 50, y - h + 4, 220, LAMP, k);
}
// Red-and-white tape from a to b, sagging, w wide.
function tape(c, a, b, w, seed, sag = 30) {
  const n = 40, pts = []; for (let k = 0; k <= n; k++) { const u = k / n; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); }
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nrm = [-Math.sin(ang), Math.cos(ang)];
  const top = pts.map(p => add(p, mul(nrm, -w / 2))), bot = pts.map(p => add(p, mul(nrm, w / 2)));
  const path = polyPath([...top, ...bot.reverse()]);
  c.save(); c.fillStyle = '#fbf7ee'; c.fill(path); c.clip(path);
  c.fillStyle = RED; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); c.translate(a[0], a[1]); c.rotate(ang);
  for (let s = -40; s < L + 40; s += 64) { c.beginPath(); c.moveTo(s, -w); c.lineTo(s + 32, -w); c.lineTo(s + 32 + w * 1.2, w + sag); c.lineTo(s + w * 1.2, w + sag); c.closePath(); c.fill(); }
  c.restore();
  ln(c, top, 3, seed, false, INK, { amp: .5 }); ln(c, bot.reverse(), 3, seed + 1, false, INK, { amp: .5 });
}
// A leaderboard card: rows with blurred names (scribbles) and gold scores. rows: [{ score, taken, mark }]
function boardRows(c, x, y, w, rowH, rows, seed, o = {}) {
  rows.forEach((row, k) => {
    const ry = y + k * rowH, last = row.taken;
    solid(c, rrPts(x, ry, w, rowH - 12, 10), last ? RED : o.rowCol ?? '#1d3f80', seed + k * 5, { w: 3, al: last ? .92 : 1, lineCol: o.lineCol ?? INK });
    c.save(); c.font = `700 ${rowH * .46}px Helvetica, Arial, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = alpha(FOAM, .7); c.fillText(String(k + 1), x + 22, ry + rowH / 2 - 5); c.restore();
    squiggleText(c, x + 70, ry + rowH / 2 - 2, w * (row.stamp ? .14 : .3 + ((k * 37) % 20) / 100), 1, { color: alpha(FOAM, .8), seed: seed + k, amp: rowH * .14, width: 3, lineH: 0 });
    c.save(); c.font = `800 ${rowH * .5}px Helvetica, Arial, sans-serif`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = last ? '#ffffff' : GOLD; c.fillText(String(row.score), x + w - 22, ry + rowH / 2 - 5); c.restore();
    if (last && row.stamp) {
      c.save(); c.translate(x + w * .56, ry + rowH / 2 - 6); c.rotate(-.06); c.strokeStyle = "#ffffff"; c.lineWidth = 4; c.strokeRect(-rowH * .95, -rowH * .3, rowH * 1.9, rowH * .6);
      c.font = `900 ${rowH * .42}px Impact, "Arial Black", sans-serif`; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(row.stamp, 0, 2); c.restore();
    }
  });
}
