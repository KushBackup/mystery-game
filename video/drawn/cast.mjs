// cast.mjs — the six friends at the table, drawn with a Pen in the brush-ink + watercolour look.
// Grown from the claude-animation bean rig (lib/rigs/bean.mjs): bean torso, stick limbs, washed head,
// plus what this film needs — hair styles, traits you can SEE (top colour, glasses, shoes, a drink),
// brows and more mouths for acting, a phone in the hand, and a ghost form.
//
// LOCAL SPACE: feet on y = 0, head centre at y = -212, 1 unit = 1 px at s = 1. Faces the viewer.
//   friend(pen, x, groundY, s, look, pose, t)
// look: { skin, shirt, hair, hairColor, glasses, shoes, drink }   — who they are (never changes)
// pose: { arms:[l,r], bend:[l,r], face, brows, look, dip, tilt, hold:{l,r}, ghost, glint, still, walk (phase) }
//   arms: degrees from straight down, outward positive; bend: elbow, same sense
//   face: smile | open | flat | sad | O | smirk | grin     brows: none | raised | furrow | worried
//   hold.l / hold.r: "drink" | "phone" | "point" | fn(pen, x, y)   ghost: 0..1   glint: 0..1 (a red spark)
import { lerp, rad, ellPts, rrect, clamp } from "./lib/core.mjs";

export const INK = "#2A2420";
export const PAL = {
  paper: "#F3EBDA", red: "#D0312D", sea: "#2F5D8A", seaDeep: "#1D3557", amber: "#E8A33D", sage: "#7FA886",
  ghost: "#B9C3CF", white: "#FBF7EE", navy: "#2E3F5C", charcoal: "#3A3632", grey: "#8D8F94", lime: "#9CC45A",
};
const SKIN_BLUSH = "#E58B7B";

// The table. Traits are chosen so three clues narrow six people to one:
//   dark top -> Riya, Kabir, Zoe · glasses -> Riya, Zoe · gin -> Riya.
export const CAST = {
  riya:  { name: "Riya",  skin: "#C68A5A", shirt: PAL.navy,     hair: "long",  hairColor: "#2B1E18", glasses: true,  shoes: "sneakers", drink: "gin" },
  kabir: { name: "Kabir", skin: "#A8704A", shirt: PAL.charcoal, hair: "short", hairColor: "#1F1814", glasses: false, shoes: "boots",    drink: "beer" },
  zoe:   { name: "Zoe",   skin: "#F0CDB0", shirt: PAL.grey,     hair: "bun",   hairColor: "#8A4B2A", glasses: true,  shoes: "boots",    drink: "wine" },
  arjun: { name: "Arjun", skin: "#D9A273", shirt: PAL.amber,    hair: "curly", hairColor: "#241A15", glasses: true,  shoes: "sneakers", drink: "beer" },
  mae:   { name: "Mae",   skin: "#E9C29C", shirt: PAL.sage,     hair: "pony",  hairColor: "#3A2A20", glasses: false, shoes: "sandals",  drink: "cocktail" },
  dev:   { name: "Dev",   skin: "#8E5B3A", shirt: PAL.white,    hair: "cap",   hairColor: "#1A1412", glasses: false, shoes: "sneakers", drink: "whisky" },
};
export const ORDER = ["arjun", "zoe", "riya", "kabir", "mae", "dev"];

function mixHex(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, "0")).join(""); }

// ---------------------------------------------------------------- drinks (held or on the table)
// origin = the bottom centre of the glass
export function drink(p, kind, x, y, s = 1, fill = 1) {
  const c = p.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  const glassC = "#DCE8EE";
  if (kind === "beer") {
    const G = [[-15, 0], [-18, -52], [18, -52], [15, 0]], L = [[-15, 0], [-17.4, -44 * fill], [17.4, -44 * fill], [15, 0]];
    p.wash(L, "#E3A43A", { alpha: .9 }); p.wash([[-18, -52], [-17.6, -44], [17.6, -44], [18, -52], [10, -58], [-8, -57]], PAL.white, { alpha: .95, solid: true, over: true });
    p.poly(G, { w: 2.6 }); p.stroke([[-11, -8], [-13, -40]], { w: 2, color: "#FFF6DA", taper: .6 });
  } else if (kind === "gin") {           // highball, clear with a lime wheel and ice
    const G = [[-13, 0], [-13, -58], [13, -58], [13, 0]];
    p.wash([[-13, 0], [-13, -50], [13, -50], [13, 0]], "#CFE6EA", { alpha: .9 });
    p.wash(rrect(-8, -44, 10, 10, 2), PAL.white, { alpha: .9, solid: true, over: true }); p.wash(rrect(0, -30, 9, 9, 2), PAL.white, { alpha: .9, solid: true, over: true });
    p.wash(ellPts(10, -58, 9, 9, 12), PAL.lime, { alpha: .95 }); p.ring(10, -58, 9, 9, { w: 2 }); p.stroke([[10, -66], [10, -50]], { w: 1.2 }); p.stroke([[2, -58], [18, -58]], { w: 1.2 });
    p.poly(G, { w: 2.6 }); p.stroke([[-6, -64], [-2, -86]], { w: 2.4, color: PAL.sea, taper: .2 });
  } else if (kind === "wine") {
    const bowl = [[-14, -44], [-12, -30], [-6, -24], [6, -24], [12, -30], [14, -44]];
    p.wash([[-13, -38], [-11, -30], [-6, -25], [6, -25], [11, -30], [13, -38]], "#9E2B3C", { alpha: .9 });
    p.stroke(bowl, { w: 2.6 }); p.stroke([[0, -24], [0, -3]], { w: 2.4 }); p.stroke([[-11, 0], [11, 0]], { w: 2.6 });
  } else if (kind === "cocktail") {
    const cone = [[-20, -46], [20, -46], [0, -22]];
    p.wash([[-16, -42], [16, -42], [0, -24]], "#E9A0A8", { alpha: .9 }); p.poly(cone, { w: 2.6 });
    p.stroke([[0, -22], [0, -3]], { w: 2.4 }); p.stroke([[-11, 0], [11, 0]], { w: 2.6 });
    p.wash(ellPts(12, -48, 4.5, 4.5, 8), PAL.red, { alpha: .95 }); p.ring(12, -48, 4.5, 4.5, { w: 1.6 });
  } else if (kind === "whisky") {
    const G = [[-15, 0], [-16, -30], [16, -30], [15, 0]];
    p.wash([[-15, 0], [-15.6, -16], [15.6, -16], [15, 0]], "#B86A28", { alpha: .9 });
    p.wash(rrect(-7, -22, 12, 12, 2), PAL.white, { alpha: .85, solid: true, over: true });
    p.poly(G, { w: 2.6 });
  }
  c.restore();
}

// ---------------------------------------------------------------- a phone (held or full screen)
// origin = centre; screen(pen, w, h) draws in screen space (origin top-left of the screen)
export function phone(p, x, y, s, screen, o = {}) {
  const c = p.ctx, w = 64, h = 118; c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const B = rrect(-w / 2, -h / 2, w, h, 11), S = rrect(-w / 2 + 5, -h / 2 + 12, w - 10, h - 24, 4);
  p.wash(B, "#2A2A30", { alpha: .95, solid: true, over: true });
  p.wash(S, o.screenColor || "#DDEAF2", { alpha: 1, solid: true, over: true });
  if (screen) { c.save(); c.beginPath(); S.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip(); c.translate(-w / 2 + 5, -h / 2 + 12); screen(p, w - 10, h - 24); c.restore(); }
  p.blob(B, { w: 3 }); p.stroke([[-7, -h / 2 + 6], [7, -h / 2 + 6]], { w: 2.2, color: "#77777F" });
  c.restore();
}

// ---------------------------------------------------------------- hair
function hairBack(p, kind, hy, col) {
  if (kind === "long") p.wash([[-33, hy - 6], [-36, hy + 30], [-34, hy + 62], [-20, hy + 66], [20, hy + 66], [34, hy + 62], [36, hy + 30], [33, hy - 6], [0, hy - 30]], col, { alpha: .95 });
  if (kind === "pony") p.wash([[22, hy - 22], [44, hy - 18], [54, hy + 6], [50, hy + 34], [40, hy + 10], [28, hy - 4]], col, { alpha: .95 });
  if (kind === "bun") { p.wash(ellPts(0, hy - 40, 15, 13, 14), col, { alpha: .95 }); p.ring(0, hy - 40, 15, 13, { w: 2.8 }); }
}
function hairFront(p, kind, hy, col, look) {
  const cap = [[-32, hy - 2], [-30, hy - 20], [-16, hy - 32], [6, hy - 34], [24, hy - 28], [32, hy - 12], [32, hy - 2], [22, hy - 16], [6, hy - 20], [-10, hy - 16], [-22, hy - 8]];
  if (kind === "long" || kind === "pony" || kind === "bun") { p.wash(cap, col, { alpha: .95 }); p.stroke(cap.slice(0, 7), { w: 3 }); }
  if (kind === "long") { p.stroke([[-33, hy - 4], [-36, hy + 30], [-33, hy + 62]], { w: 2.8 }); p.stroke([[33, hy - 4], [36, hy + 30], [33, hy + 62]], { w: 2.8 }); }
  if (kind === "short") { const S = [[-32, hy - 4], [-31, hy - 22], [-20, hy - 33], [-6, hy - 37], [10, hy - 36], [24, hy - 31], [32, hy - 18], [32, hy - 4], [20, hy - 20], [4, hy - 24], [-12, hy - 22], [-24, hy - 14]];
    p.wash(S, col, { alpha: .95 }); p.stroke(S.slice(0, 8), { w: 3 }); }
  if (kind === "curly") for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i / 8 * .9), x = Math.cos(a) * 30, y = hy + Math.sin(a) * 30 - 4;
    p.wash(ellPts(x, y, 11, 10, 10), col, { alpha: .95 }); p.ring(x, y, 11, 10, { w: 2.4, wt: .3 }); }
  if (kind === "cap") { const C = [[-33, hy - 6], [-28, hy - 30], [0, hy - 40], [28, hy - 30], [33, hy - 6]];
    p.wash(C, PAL.sea, { alpha: .92 }); p.stroke(C, { w: 3 }); p.wash([[-34, hy - 6], [34, hy - 6], [50, hy - 2], [-30, hy - 1]], PAL.seaDeep, { alpha: .95 }); p.stroke([[-34, hy - 5], [50, hy - 2]], { w: 3 }); }
}

// ---------------------------------------------------------------- the friend
export function friend(p, x, y, s, L, o = {}, t = 0) {
  const c = p.ctx, g = clamp(o.ghost || 0);
  let bob = o.still ? 0 : Math.sin(t * 3.4 + x * .021) * 2;
  if (o.walk != null) bob = -Math.abs(Math.cos(o.walk)) * 7;
  if (g > 0) bob += -10 * g + Math.sin(t * 2.2 + x) * 6 * g;
  c.save(); c.translate(x, y + bob * s); c.scale(s, s); if (o.tilt) { c.translate(0, -90); c.rotate(o.tilt); c.translate(0, 90); }
  if (g > 0) c.globalAlpha *= 1 - .42 * g;
  const tone = (col) => g > 0 ? mixHex(col, PAL.ghost, g * .85) : col;
  const sk = tone(L.skin), shirt = tone(L.shirt), hairC = tone(L.hairColor), hy = -212 + (o.dip || 0), ex = o.look || 0;
  // contact shadow
  if (g < 1) { c.save(); c.globalAlpha *= .2 * (1 - g); c.beginPath(); c.ellipse(0, 4, 50, 8, 0, 0, Math.PI * 2); c.fillStyle = "#2A1A10"; c.fill(); c.restore(); }
  // legs and shoes, or the ghost's tail
  if (g < .5) for (const [hx, sg] of [[-13, -1], [13, 1]]) {
    const ang = o.walk != null ? -sg * Math.sin(o.walk) * 24 : 0;                // walking: legs swing in opposite phase
    const fx = hx + sg * 4 + Math.sin(rad(ang)) * 82, fy = -84 + Math.cos(rad(ang)) * 82;
    p.stroke([[hx, -84], [fx, fy]], { w: 5.2, taper: .3 });
    shoe(p, L.shoes, fx, fy, sg);
  } else {
    const n = 7, P = [[-31, -84]];
    for (let i = 0; i <= n; i++) { const u = i / n, xx = lerp(-30, 30, u); P.push([xx, -20 + Math.sin(u * Math.PI * 3 + t * 5) * 9 - (i % 2) * 10]); }
    P.push([31, -84]); p.wash(P, tone("#DDE3EA"), { alpha: .7 }); p.stroke(P.slice(1, -1), { w: 3, color: tone(INK) });
  }
  hairBack(p, L.hair, hy, hairC);                     // behind the body, so long hair never covers the top
  // torso: wash, a hatch on the shadow side, outline, collar
  const torso = [[-22, -176], [22, -176], [30, -120], [31, -82], [-31, -82], [-30, -120]];
  p.wash(torso, shirt, { alpha: .9, round: true });
  c.save(); c.beginPath(); c.moveTo(6, -176); c.lineTo(22, -176); c.lineTo(31, -120); c.lineTo(31, -82); c.lineTo(10, -82); c.closePath(); c.clip();
  c.globalAlpha *= .22; c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); for (let k = -200; k < 60; k += 7) { c.moveTo(0, k); c.lineTo(40, k + 22); } c.stroke(); c.restore();
  p.blob(torso, { w: 4, color: tone(INK) });
  p.stroke([[-10, -176], [0, -162], [10, -176]], { w: 2.6, taper: .4, color: tone(INK) });
  // arms (hands may hold things)
  const [la, ra] = o.arms || [16, 16], [lb, rb] = o.bend || [0, 0], hold = o.hold || {};
  arm(p, -22, -166, la, lb, -1, sk, hold.l, L, tone);
  arm(p, 22, -166, ra, rb, 1, sk, hold.r, L, tone);
  // head
  p.wash(ellPts(0, hy, 31, 30, 18), sk, { alpha: 1, solid: true, over: true });
  p.wash(ellPts(-6, hy - 6, 24, 22, 14), mixHex(sk, "#FFFFFF", .18), { alpha: .5 });
  p.ring(0, hy, 32, 31, { w: 4.2, color: tone(INK) });
  hairFront(p, L.hair, hy, hairC);
  face(p, o, hy, ex, t, x, tone);
  if (L.glasses) { p.ring(-12 + ex, hy - 1, 11, 10, { w: 2.6, color: tone(INK) }); p.ring(12 + ex, hy - 1, 11, 10, { w: 2.6, color: tone(INK) }); p.stroke([[-1 + ex, hy - 2], [1 + ex, hy - 2]], { w: 2.4 }); }
  if (o.glint > 0) { const k = o.glint, gx = 22 + ex, gy = hy - 12; c.save(); c.globalAlpha *= k; c.fillStyle = PAL.red; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 2.4 : 9 * k; i ? c.lineTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r) : c.moveTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }
  c.restore();
}

function face(p, o, hy, ex, t, x, tone) {
  const ink = tone(INK), F = o.face || "smile", bl = !o.noBlink && ((t + x * .0137) % 3.3) < .12;
  // eyes
  if (bl || F === "closed") { p.stroke([[-16 + ex, hy - 1], [-8 + ex, hy - 1]], { w: 3, color: ink }); p.stroke([[8 + ex, hy - 1], [16 + ex, hy - 1]], { w: 3, color: ink }); }
  else if (F === "open" && !o.eyesOpen) { p.stroke([[-17 + ex, hy + 1], [-12 + ex, hy - 4], [-7 + ex, hy + 1]], { w: 3, color: ink }); p.stroke([[7 + ex, hy + 1], [12 + ex, hy - 4], [17 + ex, hy + 1]], { w: 3, color: ink }); }
  else { const r = F === "O" ? 4.6 : 3.8; p.dot(-12 + ex * 1.3, hy - 1, r, ink); p.dot(12 + ex * 1.3, hy - 1, r, ink);
    p.dot(-13.3 + ex * 1.3, hy - 2.4, 1.3, "#FFFFFF", .1); p.dot(10.7 + ex * 1.3, hy - 2.4, 1.3, "#FFFFFF", .1); }
  // brows
  const B = o.brows || "none";
  if (B === "raised") { p.stroke([[-19, hy - 16], [-12, hy - 20], [-5, hy - 17]], { w: 2.6, color: ink }); p.stroke([[5, hy - 17], [12, hy - 20], [19, hy - 16]], { w: 2.6, color: ink }); }
  if (B === "furrow") { p.stroke([[-19, hy - 17], [-6, hy - 12]], { w: 3, color: ink }); p.stroke([[6, hy - 12], [19, hy - 17]], { w: 3, color: ink }); }
  if (B === "worried") { p.stroke([[-19, hy - 12], [-6, hy - 17]], { w: 2.6, color: ink }); p.stroke([[6, hy - 17], [19, hy - 12]], { w: 2.6, color: ink }); }
  // mouth
  if (F === "open") { p.wash([[-11, hy + 9], [11, hy + 9], [7, hy + 20], [0, hy + 22], [-7, hy + 20]], "#7A2A22", { alpha: .9 }); p.stroke([[-11, hy + 9], [11, hy + 9], [6, hy + 20], [-6, hy + 20], [-11, hy + 9]], { w: 2.6, smooth: false, color: ink }); }
  else if (F === "O") { p.wash(ellPts(0, hy + 15, 5, 6, 10), "#7A2A22", { alpha: .9 }); p.ring(0, hy + 15, 5, 6, { w: 2.4, color: ink }); }
  else if (F === "flat") p.stroke([[-8, hy + 15], [8, hy + 15]], { w: 3, color: ink });
  else if (F === "sad") p.stroke([[-9, hy + 18], [0, hy + 13], [9, hy + 18]], { w: 3, color: ink });
  else if (F === "smirk") p.stroke([[-8, hy + 15], [4, hy + 14], [11, hy + 9]], { w: 3, color: ink });
  else if (F === "grin") { p.wash([[-14, hy + 9], [14, hy + 9], [8, hy + 18], [-8, hy + 18]], PAL.white, { alpha: 1, solid: true, over: true }); p.stroke([[-14, hy + 9], [14, hy + 9], [8, hy + 18], [-8, hy + 18], [-14, hy + 9]], { w: 2.6, smooth: false, color: ink }); p.stroke([[-15, hy + 7], [-17, hy + 4]], { w: 2, color: ink }); p.stroke([[15, hy + 7], [17, hy + 4]], { w: 2, color: ink }); }
  else p.stroke([[-10, hy + 11], [0, hy + 17], [10, hy + 11]], { w: 3.2, color: ink });
  if (F !== "sad" && F !== "flat") { p.wash(ellPts(-21, hy + 9, 6, 4, 8), SKIN_BLUSH, { alpha: .45 }); p.wash(ellPts(21, hy + 9, 6, 4, 8), SKIN_BLUSH, { alpha: .45 }); }
}

function arm(p, sx, sy, a, b, sg, sk, hold, L, tone) {
  const d = (ang) => [sg * Math.sin(rad(ang)), Math.cos(rad(ang))];
  const [ux, uy] = d(a), ex = sx + ux * 42, ey = sy + uy * 42, [fx, fy] = d(a + b), hx = ex + fx * 40, hy = ey + fy * 40;
  p.stroke([[sx, sy], [ex, ey], [hx, hy]], { w: 4.6, taper: .3, smooth: false, color: tone(INK) });
  if (hold === "drink") drink(p, L.drink, hx, hy + 14, .8);
  else if (hold === "phone") phone(p, hx, hy - 18, .5, null, { screenColor: "#BFE0F0" });
  else if (typeof hold === "function") hold(p, hx, hy);
  p.wash(ellPts(hx, hy, 7.5, 7, 14), sk, { alpha: 1, solid: true, over: true, round: true, wt: .2 }); p.ring(hx, hy, 7, 7, { w: 2.4, wt: .2, color: tone(INK) });
  if (hold === "point") p.stroke([[hx, hy], [hx + fx * 16, hy + fy * 16]], { w: 3.4, taper: .4, color: tone(INK) });
}

function shoe(p, kind, fx, fy, sg) {
  const S = sg < 0 ? [[fx - 16, fy], [fx - 14, fy - 9], [fx + 4, fy - 10], [fx + 6, fy]] : [[fx - 6, fy], [fx - 4, fy - 10], [fx + 14, fy - 9], [fx + 16, fy]];
  const col = { sneakers: PAL.white, boots: "#6B4A32", sandals: "#C9A27A", formal: "#2A2420" }[kind] || INK;
  if (kind === "boots") { const Bt = sg < 0 ? [[fx - 16, fy], [fx - 14, fy - 10], [fx - 6, fy - 12], [fx - 6, fy - 26], [fx + 6, fy - 26], [fx + 6, fy]] : [[fx - 6, fy], [fx - 6, fy - 26], [fx + 6, fy - 26], [fx + 6, fy - 12], [fx + 14, fy - 10], [fx + 16, fy]];
    p.wash(Bt, col, { alpha: .95 }); p.poly(Bt, { w: 2.6, wt: .3 }); return; }
  p.wash(S, col, { alpha: .95, solid: kind === "sneakers", over: kind === "sneakers" }); p.poly(S, { w: 2.6, wt: .3 });
  if (kind === "sneakers") p.stroke([[S[0][0] + 1, fy - 3], [S[3][0] - 1, fy - 3]], { w: 1.6, color: PAL.red, wt: .2 });
}
