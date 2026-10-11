// props.mjs — everything the friends touch or the film points at, drawn with a Pen (brush + wash).
// Every prop: origin and size stated in its comment; base wash -> texture -> ink edge where it's a hero.
import { lerp, rad, ellPts, rrect, clamp, hash } from "./lib/core.mjs";
import { INK, PAL, friend, drink } from "./cast.mjs";

export const FONT = { brush: "Caveat Brush", hand: "Patrick Hand", gochi: "Gochi Hand" };
const STEEL = "#C9D3DB", WOOD = "#9C6A44", WOOD_D = "#6E4A30";

// a knife, tip at the origin pointing down (+y), handle up. ~175 long at s = 1
export function knife(p, x, y, s = 1, rot = 0, o = {}) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const blade = [[0, 0], [-13, -40], [-14, -110], [12, -110], [12, -30]];
  p.wash(blade, STEEL, { alpha: .95, sharp: true });
  p.wash([[2, -14], [-6, -44], [-7, -104], [3, -104], [4, -30]], "#EEF3F6", { alpha: .8, sharp: true });
  p.stroke([[0, 0], [-13, -40], [-14, -110]], { w: 2.8, smooth: false }); p.stroke([[0, 0], [12, -30], [12, -110]], { w: 2.8, smooth: false });
  p.stroke([[-16, -112], [15, -112]], { w: 6, taper: .2 });
  const handle = rrect(-11, -178, 22, 64, 8);
  p.wash(handle, o.handle || PAL.red, { alpha: .95 }); p.blob(handle, { w: 2.8 });
  p.dot(0, -132, 3, PAL.white); p.dot(0, -158, 3, PAL.white);
  c.restore();
}

// a sealed envelope, centre origin, 110 x 74 at s = 1. open 0..1 lifts the flap
export function envelope(p, x, y, s = 1, open = 0) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const B = [[-55, -37], [55, -37], [55, 37], [-55, 37]];
  p.wash(B, "#F4E6C8", { alpha: 1, solid: true, over: true }); p.wash(B, "#E9D6AE", { alpha: .5 }); p.poly(B, { w: 3 });
  p.stroke([[-55, 37], [0, 2], [55, 37]], { w: 2.2, smooth: false });
  const fy = lerp(6, -80, open); const flap = [[-55, -37], [0, fy], [55, -37]];
  p.wash(flap, "#EFDDB8", { alpha: 1, solid: true, over: true }); p.poly(flap, { w: 2.8 });
  if (open < .3) { p.wash(ellPts(0, fy - 4, 12, 12, 14), PAL.sea, { alpha: 1, solid: true, over: true, round: true }); p.ring(0, fy - 4, 12, 12, { w: 2.2 }); }
  c.restore();
}

// a role card, centre origin, 190 x 96 at s = 1
export function roleCard(p, x, y, s, role, o = {}) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const R = rrect(-95, -48, 190, 96, 12), col = role === "killer" ? PAL.red : PAL.sage;
  p.wash(R, PAL.white, { alpha: 1, solid: true, over: true }); p.wash(R, col, { alpha: .85 }); p.blob(R, { w: 3 });
  p.text(role === "killer" ? "Killer" : "Faithful", 0, 14, { size: 46, font: FONT.brush, color: role === "killer" ? PAL.white : INK });
  c.restore();
}

// --------------------------------------------------------------- the arrival card's six icons, centre origin ~70 px
export function icon(p, kind, x, y, s = 1, L = {}) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  if (kind === "top") { const T = [[-14, -26], [-34, -16], [-28, -2], [-20, -6], [-20, 28], [20, 28], [20, -6], [28, -2], [34, -16], [14, -26], [0, -18]];
    p.wash(T, L.shirt || PAL.navy, { alpha: .95, sharp: true }); p.poly(T, { w: 2.8 }); }
  if (kind === "glasses") { p.ring(-16, 0, 14, 12, { w: 3 }); p.ring(16, 0, 14, 12, { w: 3 }); p.stroke([[-2, -2], [2, -2]], { w: 3 }); p.stroke([[-30, -4], [-38, -10]], { w: 2.6 }); p.stroke([[30, -4], [38, -10]], { w: 2.6 }); }
  if (kind === "shoes") { const S = [[-32, 14], [-30, -4], [-8, -10], [6, -2], [30, 4], [32, 14]];
    p.wash(S, PAL.white, { alpha: 1, solid: true, over: true }); p.poly(S, { w: 2.8 }); p.stroke([[-31, 9], [31, 9]], { w: 2, color: PAL.red }); p.stroke([[-12, -6], [-4, 2]], { w: 1.8 }); p.stroke([[-6, -8], [2, 0]], { w: 1.8 }); }
  if (kind === "drink") drink(p, L.drink || "gin", 0, 30, 1);
  if (kind === "birthday") { const K = [[-26, 26], [-26, -2], [26, -2], [26, 26]];
    p.wash(K, "#F1C9CF", { alpha: .95, sharp: true }); p.poly(K, { w: 2.8 }); p.stroke([[-26, 8], [-13, 13], [0, 8], [13, 13], [26, 8]], { w: 2 });
    p.stroke([[0, -2], [0, -20]], { w: 3 }); p.wash([[0, -34], [5, -24], [0, -20], [-5, -24]], PAL.amber, { alpha: .95 }); }
  if (kind === "siblings") { for (const [hx, sc] of [[-16, 1], [14, .8]]) { p.ring(hx, -18 + (1 - sc) * 20, 9 * sc, 9 * sc, { w: 2.6 }); p.stroke([[hx, -8 + (1 - sc) * 20], [hx, 22]], { w: 3 }); p.stroke([[hx - 10 * sc, 6 + (1 - sc) * 10], [hx + 10 * sc, 6 + (1 - sc) * 10]], { w: 2.6 }); } }
  c.restore();
}

// --------------------------------------------------------------- the arrival card, centre origin, 560 x 700
export const FORM_ROWS = [
  ["top", "Top colour", "Navy"], ["glasses", "Glasses?", "Yes"], ["shoes", "Shoes", "Sneakers"],
  ["drink", "First drink", "Gin & tonic"], ["birthday", "Birthday", "October"], ["siblings", "Siblings", "Eldest"],
];
export function formCard(p, x, y, s, rows, L, hi = -1, o = {}) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const R = [[-280, -350], [280, -350], [280, 350], [-280, 350]];
  c.save(); c.globalAlpha *= .25; c.fillStyle = "#3A2A1A"; c.fillRect(-270, -334, 560, 700); c.restore();
  p.wash(R, "#FBF5E6", { alpha: 1, solid: true, over: true }); p.poly(R, { w: 3.4 });
  for (let k = -260; k < 340; k += 44) p.stroke([[-250, k + 60], [250, k + 60]], { w: 1, color: "#9FB8D0", wt: .05, taper: 0 });
  p.text("At the door", 0, -278, { size: 64, font: FONT.brush });
  rows.forEach((r, k) => { if (r <= 0) return; const ry = -190 + k * 92, [kind, q, a] = FORM_ROWS[k];
    c.save(); c.translate(0, ry); c.globalAlpha *= clamp(r * 3); c.translate(0, (1 - clamp(r * 1.4)) * 16);
    if (hi === k) { const H = rrect(-262, -40, 524, 80, 14); p.wash(H, PAL.amber, { alpha: .45 }); }
    icon(p, kind, -200, 0, .82, L);
    p.text(q, -130, 12, { size: 38, font: FONT.hand, align: "left", color: "#5A5048" });
    p.text(a, 250, 12, { size: 44, font: FONT.brush, align: "right" });
    c.restore(); });
  c.restore();
}

// --------------------------------------------------------------- Contacts card with a portrait, centre origin, 300 x 380
export function contactCard(p, x, y, s, L, o = {}, t = 0) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const R = rrect(-150, -190, 300, 380, 18);
  p.wash(R, PAL.white, { alpha: 1, solid: true, over: true });
  c.save(); c.beginPath(); R.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip();
  p.wash([[-150, -190], [150, -190], [150, 80], [-150, 80]], o.bg || "#DCE6EC", { alpha: .8, sharp: true });
  friend(p, 0, 240, 1.25, L, { arms: [10, 10], face: o.face || "smile", brows: o.brows, look: o.look || 0, glint: o.glint || 0, still: true }, t);
  c.restore();
  p.wash([[-150, 80], [150, 80], [150, 190], [-150, 190]], PAL.white, { alpha: 1, solid: true, over: true, sharp: true });
  p.text(L.name, 0, 148, { size: 54, font: FONT.brush });
  p.blob(R, { w: 3.2 });
  if (o.dim > 0) { c.save(); c.globalAlpha *= o.dim * .55; c.fillStyle = PAL.paper; c.beginPath(); R.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.fill(); c.restore(); }
  c.restore();
}

// a hand-drawn X over a region; k 0..1 draws the two strokes in turn
export function cross(p, x, y, r, k, col = INK, w = 9) {
  if (k <= 0) return; const a = clamp(k * 2), b = clamp(k * 2 - 1);
  p.stroke([[x - r, y - r], [lerp(x - r, x + r, a), lerp(y - r, y + r * .92, a)]], { w, color: col, taper: .5 });
  if (b > 0) p.stroke([[x + r, y - r * .9], [lerp(x + r, x - r * .95, b), lerp(y - r * .9, y + r, b)]], { w, color: col, taper: .5 });
}
// a hand-drawn ring around something, k 0..1 draws it on
export function circleMark(p, x, y, rx, ry, k, col = PAL.red, w = 7) {
  if (k <= 0) return; const n = 40, pts = [];
  for (let i = 0; i <= n * k * 1.08; i++) { const a = -2.2 + i / n * Math.PI * 2, q = 1 + .03 * Math.sin(a * 3); pts.push([x + Math.cos(a) * rx * q, y + Math.sin(a) * ry * q]); }
  if (pts.length > 1) p.stroke(pts, { w, color: col, taper: .5 });
}

// --------------------------------------------------------------- a polaroid, centre origin, 240 x 280; img(pen) draws in a 200 x 200 box centred at (0,-20)
export function polaroid(p, x, y, s, rot, img, label) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.save(); c.globalAlpha *= .22; c.fillStyle = "#2A1A10"; c.fillRect(-112, -128, 240, 280); c.restore();
  const R = [[-120, -140], [120, -140], [120, 140], [-120, 140]];
  p.wash(R, "#FCFAF4", { alpha: 1, solid: true, over: true }); p.poly(R, { w: 2.6 });
  c.save(); c.beginPath(); c.rect(-100, -120, 200, 200); c.clip(); p.wash([[-100, -120], [100, -120], [100, 80], [-100, 80]], "#3F4B57", { alpha: 1, solid: true, over: true, sharp: true });
  c.translate(0, -20); img(p); c.restore();
  p.stroke([[-100, -120], [100, -120], [100, 80], [-100, 80], [-100, -120]], { w: 2, smooth: false });
  if (label) p.text(label, 0, 120, { size: 40, font: FONT.brush });
  p.wash([[-40, -152], [40, -146], [38, -122], [-42, -128]], "rgba(236,214,150,1)", { alpha: .6, sharp: true });   // tape
  c.restore();
}
export const PHOTO = {
  darkTop: (p) => { const T = [[-60, -40], [60, -40], [90, 100], [-90, 100]]; p.wash([[-120, -100], [120, -100], [120, 100], [-120, 100]], "#E9DCC0", { alpha: 1, solid: true, over: true, sharp: true });
    p.wash(T, PAL.navy, { alpha: 1, solid: true, over: true, sharp: true }); p.poly(T, { w: 3 }); p.stroke([[-20, -40], [0, -10], [20, -40]], { w: 2.6 });
    p.wash(ellPts(0, -70, 34, 34, 18), "#3F4B57", { alpha: 1, solid: true, over: true }); },
  glasses: (p) => { p.wash([[-120, -100], [120, -100], [120, 100], [-120, 100]], "#E3D2B0", { alpha: 1, solid: true, over: true, sharp: true });
    p.ring(-34, 0, 30, 26, { w: 5 }); p.ring(34, 0, 30, 26, { w: 5 }); p.stroke([[-4, -4], [4, -4]], { w: 5 }); p.stroke([[-64, -6], [-86, -22]], { w: 4 }); p.stroke([[64, -6], [86, -22]], { w: 4 });
    p.stroke([[-48, -12], [-38, -18]], { w: 3, color: PAL.white }); p.stroke([[20, -12], [30, -18]], { w: 3, color: PAL.white }); },
  gin: (p) => { p.wash([[-120, -100], [120, -100], [120, 100], [-120, 100]], "#5C3A28", { alpha: 1, solid: true, over: true, sharp: true });
    p.wash([[-120, 40], [120, 40], [120, 100], [-120, 100]], "#7A5236", { alpha: 1, solid: true, over: true, sharp: true }); drink(p, "gin", 0, 60, 1.9); },
};

// --------------------------------------------------------------- a speech bubble, centre origin; tail -1 left, 1 right, 0 none
export function bubble(p, x, y, str, o = {}) {
  const c = p.ctx, size = o.size || 44; c.save(); c.font = `${size}px "${FONT.hand}"`; const w = c.measureText(str).width + 52, h = size * 1.6; c.restore();
  c.save(); c.translate(x, y); c.scale(o.s ?? 1, o.s ?? 1);
  const B = rrect(-w / 2, -h / 2, w, h, h / 2), tail = o.tail ?? -1;
  const tl = [[tail * w * .16 - 14, h / 2 - 3], [tail * w * .34, h / 2 + 26], [tail * w * .16 + 14, h / 2 - 3]];
  p.wash(B, o.fill || PAL.white, { alpha: 1, solid: true, over: true, wt: .2 }); if (tail) p.wash(tl, o.fill || PAL.white, { alpha: 1, solid: true, over: true, wt: .1 });
  p.blob(B, { w: 3.4, wt: .6 }); if (tail) p.stroke(tl, { w: 3, smooth: false, wt: .3 });
  p.text(str, 0, size * .34, { size, font: FONT.hand, color: o.color || INK, wt: .8 });
  if (o.crack > 0) { const k = o.crack, P = [[-w * .3, -h / 2], [-w * .1, -h * .1], [-w * .2, h * .1], [w * .05, h * .3], [0, h / 2]];
    p.stroke(P.slice(0, Math.max(2, Math.ceil(P.length * k))), { w: 4, smooth: false, color: PAL.red }); }
  c.restore();
}

// --------------------------------------------------------------- icons for the night
export function shield(p, x, y, s, k = 1) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s * k, s * k);
  const S = [[0, -50], [40, -36], [36, 10], [0, 52], [-36, 10], [-40, -36]];
  p.wash(S, PAL.sage, { alpha: .95, round: true }); p.blob(S, { w: 3.6 }); p.stroke([[-16, 0], [-4, 14], [18, -14]], { w: 5, color: PAL.white, smooth: false });
  c.restore();
}
export function magnifier(p, x, y, s, rot = 0) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  p.wash(ellPts(0, 0, 40, 40, 20), "#DCEBF2", { alpha: .55 }); p.ring(0, 0, 42, 42, { w: 6 });
  p.stroke([[-18, -22], [-26, -6]], { w: 4, color: PAL.white });
  const H = [[28, 28], [40, 24], [82, 66], [70, 78], [24, 40]]; p.wash(H, WOOD, { alpha: .95, sharp: true }); p.poly(H, { w: 3 });
  c.restore();
}
export function eyeIcon(p, x, y, s) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const E = [[-34, 0], [-16, -16], [16, -16], [34, 0], [16, 16], [-16, 16]]; p.wash(E, PAL.white, { alpha: 1, solid: true, over: true, round: true }); p.blob(E, { w: 3 });
  p.wash(ellPts(0, 0, 12, 12, 14), PAL.sea, { alpha: 1, solid: true, over: true }); p.dot(0, 0, 5, INK); p.dot(-4, -4, 2, "#FFFFFF", .1);
  c.restore();
}
export function label(p, x, y, str, o = {}) {        // a small tag: a washed strip with lettering
  const c = p.ctx, size = o.size || 40; c.save(); c.font = `${size}px "${FONT.brush}"`; const w = c.measureText(str).width + 40; c.restore();
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1);
  const R = rrect(-w / 2, -size * .7, w, size * 1.3, 8);
  p.wash(R, o.fill || PAL.white, { alpha: 1, solid: true, over: true }); if (o.tint) p.wash(R, o.tint, { alpha: .8 }); p.blob(R, { w: 2.8 });
  p.text(str, 0, size * .33, { size, font: FONT.brush, color: o.color || INK });
  c.restore();
}

// --------------------------------------------------------------- the morning board, centre origin, 700 x 820
// rows: [{ name, score, y (row slot, may be fractional), sink 0..1, hi }]
export function board(p, x, y, s, rows, o = {}) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const R = [[-350, -410], [350, -410], [350, 410], [-350, 410]];
  c.save(); c.globalAlpha *= .25; c.fillStyle = "#2A1A10"; c.fillRect(-340, -396, 700, 820); c.restore();
  p.wash(R, "#FBF5E6", { alpha: 1, solid: true, over: true }); p.poly(R, { w: 3.6 });
  p.text("This morning's board", 0, -330, { size: 58, font: FONT.brush });
  p.stroke([[-280, -300], [280, -300]], { w: 3, taper: .6 });
  for (const r of rows) {
    const ry = -230 + r.y * 104;
    c.save(); c.translate(0, ry); if (r.lift) { c.translate(r.lift * 18, -r.lift * 10); c.rotate(-r.lift * .05); }
    if (r.sink > 0) { c.globalAlpha *= 1 - clamp(r.sink * 1.4); c.translate(0, r.sink * 70); }
    const RR = rrect(-310, -42, 620, 84, 14);
    p.wash(RR, r.hi ? "#F6E3C2" : PAL.white, { alpha: 1, solid: true, over: true, wt: .2 }); p.blob(RR, { w: 2.4, wt: .3 });
    p.text(String(r.rank ?? Math.round(r.y) + 1), -268, 16, { size: 46, font: FONT.brush, color: "#8A7A6A" });
    p.text(r.name, -220, 16, { size: 48, font: FONT.brush, align: "left" });
    const bw = 220 * (r.score / 1000); p.wash(rrect(40, -12, Math.max(10, bw), 24, 10), r.bar || PAL.sea, { alpha: .9, wt: .2 });
    p.text(String(r.score), 300, 16, { size: 44, font: FONT.hand, align: "right" });
    c.restore();
  }
  if (o.wave > 0) wave(p, 0, 410, 700, o.wave, o.t || 0);
  c.restore();
}
// a red glove hand, palm facing down, fingertips at the origin pointing -y; grab 0..1 curls the fingers
export function redHand(p, x, y, s, rot = 0, grab = 0) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const arm = [[-26, 70], [26, 70], [30, 240], [-30, 240]]; p.wash(arm, "#A8262A", { alpha: .95, sharp: true }); p.poly(arm, { w: 3.2 });
  const palm = [[-38, 10], [38, 10], [36, 70], [-36, 70]]; p.wash(palm, PAL.red, { alpha: .95, round: true }); p.blob(palm, { w: 3.4 });
  for (let i = 0; i < 4; i++) { const fx = -27 + i * 18, len = (i === 0 || i === 3 ? 30 : 38) * (1 - grab * .55); const F = rrect(fx - 8, 14 - len, 16, len + 4, 8);
    p.wash(F, PAL.red, { alpha: .95 }); p.blob(F, { w: 2.8, wt: .3 }); }
  const T = rrect(34, 20, 34, 16, 8); p.wash(T, PAL.red, { alpha: .95 }); p.blob(T, { w: 2.8, wt: .3 });
  c.restore();
}
// a curling wave rising from y (its base) across width w; k 0..1 rises
export function wave(p, x, y, w, k, t) {
  const c = p.ctx, h = 230 * clamp(k); if (h < 2) return; c.save(); c.translate(x, y);
  const top = []; for (let i = 0; i <= 24; i++) { const u = i / 24, xx = -w / 2 - 40 + u * (w + 80); top.push([xx, -h + Math.sin(u * 9 + t * 4) * 16 + Math.sin(u * 23 - t * 6) * 6 - (u > .62 && u < .9 ? Math.sin((u - .62) / .28 * Math.PI) * 60 * k : 0)]); }
  const body = [...top, [w / 2 + 40, 60], [-w / 2 - 40, 60]];
  p.wash(body, "#4F86B5", { alpha: 1, solid: true, over: true, round: true });
  p.wash(top.map(([a, b]) => [a, b + 46]).concat([[w / 2 + 40, 60], [-w / 2 - 40, 60]]), PAL.seaDeep, { alpha: .45, round: true });
  p.stroke(top.map(([a, b]) => [a, b + 7]), { w: 9, color: "#CFE6F2", taper: .2 });                     // the pale lip under the crest
  p.stroke(top, { w: 3.6, taper: .3 });
  for (let i = 1; i < 23; i += 2) { const [a, b] = top[i]; p.stroke([[a - 14, b + 8], [a - 2, b - 8], [a + 14, b - 2]], { w: 5, color: PAL.white, taper: .5, wt: .2 }); }
  for (let i = 0; i < 9; i++) { const a = -w / 2 + 40 + i * (w - 80) / 8, b = -h * .35 + Math.sin(i * 2.1 + t * 3) * 14; p.stroke([[a - 18, b], [a, b - 6], [a + 18, b]], { w: 3, color: "#DCEEF7", taper: .5, wt: .1 }); }
  c.restore();
}

// --------------------------------------------------------------- morning-game vignettes (each in a 300 x 300 panel, centre origin)
export function panel(p, x, y, s, rot, title, draw, k = 1) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  c.save(); c.globalAlpha *= .22; c.fillStyle = "#2A1A10"; c.fillRect(-142, -150, 300, 340); c.restore();
  const R = [[-150, -160], [150, -160], [150, 180], [-150, 180]];
  p.wash(R, "#FBF5E6", { alpha: 1, solid: true, over: true }); p.poly(R, { w: 3.2 });
  c.save(); c.beginPath(); c.rect(-136, -146, 272, 260); c.clip(); draw(p); c.restore();
  p.stroke([[-136, -146], [136, -146], [136, 114], [-136, 114], [-136, -146]], { w: 2, smooth: false, wt: .2 });
  p.text(title, 0, 160, { size: 42, font: FONT.brush });
  c.restore();
}
export function wordGame(p, t) {
  p.wash([[-140, -150], [140, -150], [140, 120], [-140, 120]], "#E4EEF2", { alpha: 1, solid: true, over: true, sharp: true });
  label(p, 0, -80, "Popcorn", { size: 44, tint: PAL.amber });
  const W = [["salty", -70, 0], ["movies", 62, 34], ["butter", -44, 80]];
  W.forEach(([w, bx, by], i) => { const k = clamp((t - .25 - i * .35) * 4); if (k > 0) bubble(p, bx, by, w, { size: 32, s: k, tail: i % 2 ? 1 : -1 }); });
}
export function sketchGame(p, t) {
  p.wash([[-140, -150], [140, -150], [140, 120], [-140, 120]], "#FFFFFF", { alpha: 1, solid: true, over: true, sharp: true });
  const k = clamp(t / 1.6);                                   // a cat drawing itself
  const cat = [[-50, 60], [-56, 0], [-40, -40], [-46, -78], [-20, -54], [20, -54], [46, -78], [40, -40], [56, 0], [50, 60], [-50, 60]];
  p.stroke(cat.slice(0, Math.max(2, Math.ceil(cat.length * k))), { w: 5, smooth: false });
  if (k > .7) { p.dot(-18, -14, 5); p.dot(18, -14, 5); p.stroke([[-8, 4], [0, 10], [8, 4]], { w: 3 }); }
  if (k > .85) { for (const sg of [-1, 1]) { p.stroke([[sg * 22, 8], [sg * 60, 0]], { w: 2 }); p.stroke([[sg * 22, 14], [sg * 60, 18]], { w: 2 }); } }
  const pen = pathPt(cat, k); pencil(p, pen[0] + 30, pen[1] - 20, .7, -.6);
}
function pathPt(P, k) { const i = Math.min(P.length - 2, Math.floor(k * (P.length - 1))), f = k * (P.length - 1) - i; return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f)]; }
export function pencil(p, x, y, s, rot) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const B = [[-12, -110], [12, -110], [12, 0], [-12, 0]]; p.wash(B, PAL.amber, { alpha: .95, sharp: true }); p.poly(B, { w: 2.8 });
  const T = [[-12, 0], [12, 0], [0, 34]]; p.wash(T, "#EBCB9C", { alpha: .95, sharp: true }); p.poly(T, { w: 2.6 }); p.wash([[-4, 22], [4, 22], [0, 34]], INK, { alpha: 1, solid: true, sharp: true });
  p.wash([[-12, -128], [12, -128], [12, -110], [-12, -110]], "#E9A0A8", { alpha: .95, sharp: true }); p.poly([[-12, -128], [12, -128], [12, -110], [-12, -110]], { w: 2.4 });
  c.restore();
}
export function runGame(p, t) {
  p.wash([[-140, -150], [140, -150], [140, 120], [-140, 120]], "#BFDDEB", { alpha: 1, solid: true, over: true, sharp: true });
  const scroll = (t * 90) % 150;
  for (let i = -1; i < 3; i++) { const px = 120 - scroll + i * 150, gap = [-20, 30, -40, 10][(i + 4) % 4];
    for (const [y0, y1] of [[-150, gap - 55], [gap + 55, 130]]) { const R = [[px - 22, y0], [px + 22, y0], [px + 22, y1], [px - 22, y1]]; p.wash(R, PAL.sage, { alpha: .95, sharp: true }); p.poly(R, { w: 2.6, wt: .2 }); } }
  const wy = Math.sin(t * 5) * 30 - Math.abs(Math.sin(t * 2.5)) * 10;
  whale(p, -50, wy, .55, Math.cos(t * 5) * .25);
  if (((t * 2.5) % 1) < .18) p.text("tap!", -10, wy - 50, { size: 30, font: FONT.brush, color: PAL.seaDeep });
}
export function whale(p, x, y, s, rot = 0) {
  const c = p.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const B = [[-70, 10], [-40, -36], [20, -40], [66, -10], [70, 20], [30, 40], [-30, 38]];
  const tail = [[-66, 6], [-104, -26], [-96, 4], [-108, 30], [-64, 20]];
  p.wash(tail, PAL.sea, { alpha: .95 }); p.blob(tail, { w: 3 });
  p.wash(B, PAL.sea, { alpha: .95, round: true }); p.wash([[-40, 24], [30, 26], [62, 14], [30, 40], [-30, 38]], "#D9EAF2", { alpha: .9, round: true });
  p.blob(B, { w: 3.4 }); p.dot(38, -8, 5); p.dot(36, -10, 1.6, "#FFFFFF", .1);
  p.stroke([[18, -42], [14, -60]], { w: 2.6, color: "#7FB8D8" }); p.stroke([[18, -42], [26, -58]], { w: 2.6, color: "#7FB8D8" });
  c.restore();
}

// --------------------------------------------------------------- the homage doodles (~120 px)
export function fedora(p, x, y, s) { const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const crown = [[-40, 0], [-34, -50], [-12, -58], [0, -46], [12, -58], [34, -50], [40, 0]]; p.wash(crown, "#3A3632", { alpha: .95 }); p.stroke(crown, { w: 3.4 });
  p.wash([[-40, -14], [40, -14], [40, 0], [-40, 0]], PAL.red, { alpha: .9, sharp: true });
  const brim = [[-78, 6], [-40, -4], [40, -4], [78, 6], [40, 16], [-40, 16]]; p.wash(brim, "#3A3632", { alpha: .95, round: true }); p.blob(brim, { w: 3.4 }); c.restore(); }
export function crewmate(p, x, y, s) { const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const B = [[-38, 50], [-42, -20], [-30, -60], [0, -70], [30, -60], [42, -20], [38, 50], [16, 50], [12, 30], [-12, 30], [-16, 50]];
  p.wash([[-54, -30], [-40, -30], [-40, 30], [-54, 30]], "#B8452E", { alpha: .95, sharp: true }); p.poly([[-54, -30], [-40, -30], [-40, 30], [-54, 30]], { w: 3 });
  p.wash(B, "#D9573C", { alpha: .95, round: true }); p.blob(B, { w: 3.6 });
  const V = rrect(-10, -48, 50, 30, 15); p.wash(V, "#9ED3E6", { alpha: 1, solid: true, over: true }); p.blob(V, { w: 3 }); p.stroke([[4, -40], [22, -40]], { w: 3, color: PAL.white }); c.restore(); }
export function easel(p, x, y, s) { const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  p.stroke([[-40, 70], [0, -70]], { w: 4 }); p.stroke([[40, 70], [0, -70]], { w: 4 });
  const R = [[-46, -56], [46, -56], [46, 24], [-46, 24]]; p.wash(R, PAL.white, { alpha: 1, solid: true, over: true, sharp: true }); p.poly(R, { w: 3 });
  p.stroke([[-30, 6], [-14, -30], [0, -6], [14, -36], [30, 6]], { w: 3, color: PAL.sea }); pencil(p, 44, 0, .45, .5); c.restore(); }

// --------------------------------------------------------------- confetti, tally marks, the moon
export function confetti(p, x, y, n, k, t, seed = 1) {
  const c = p.ctx, cols = [PAL.amber, PAL.sage, PAL.sea, "#E9A0A8", PAL.white];
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * Math.PI * 2, sp = 260 + hash(seed + i * 3) * 420, u = clamp(k);
    const px = x + Math.cos(a) * sp * u * 1.2, py = y + Math.sin(a) * sp * u - 260 * u + 520 * u * u; c.save(); c.translate(px, py); c.rotate(t * 6 + i);
    c.globalAlpha *= 1 - clamp((u - .75) / .25); c.fillStyle = cols[i % cols.length]; c.fillRect(-14, -7, 28, 14); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-14, -7, 28, 14); c.restore(); }
}
export function tally(p, x, y, n, s = 1) {
  for (let i = 0; i < Math.floor(n); i++) { if (i % 5 === 4) p.stroke([[x - 8 + Math.floor(i / 5) * 90, y + 50], [x + 62 + Math.floor(i / 5) * 90, y - 6]], { w: 6, color: INK });
    else p.stroke([[x + (i % 5) * 16 + Math.floor(i / 5) * 90, y], [x + (i % 5) * 16 + 4 + Math.floor(i / 5) * 90, y + 52]], { w: 6, color: INK }); }
}
export function moonWash(p, x, y, r) {
  p.wash(ellPts(x, y, r, r, 28), "#F1E9C9", { alpha: 1, solid: true, over: true });
  p.wash(ellPts(x + r * .45, y - r * .2, r * .9, r * .95, 24), "rgba(0,0,0,0)", { alpha: 0 });
  p.ring(x, y, r, r, { w: 3, color: "#F6F0DA" });
  for (const [dx, dy, rr] of [[-.3, -.2, .18], [.25, .3, .12], [-.05, .4, .09]]) p.wash(ellPts(x + dx * r, y + dy * r, rr * r, rr * r, 10), "#D9CFA8", { alpha: .8 });
}
