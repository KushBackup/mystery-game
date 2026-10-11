// film.mjs — "Three Knives Out", a hand-drawn explainer for Instagram (Astral Project).
//
//   node film.mjs sheet 1,5,9       look at moments (out/sheet.png)
//   node film.mjs strip 12.4 12     12 consecutive frames (fast actions, contacts)
//   node film.mjs verify            frames must not depend on render order
//   node film.mjs render            out/three-knives-explainer.mp4 (picture only)
//   node film.mjs cues              out/cues.json for lib's sound.mjs (SFX from the same timeline)
//
// ---------------------------------------------------------------- BRIEF (hand-drawn-canvas-animation template)
// Subject: a friendly walk through how the game is played, told through one table of six friends.
// Duration ~80 s (follows the VO); 9:16, 1080x1920, 24 fps; everything that matters inside the 4:5
// centre band (y 285..1635) so the feed crop never cuts it.
// Look: brush ink + watercolour (claude-animation style preset 2). One material throughout; no mixing.
// Cast: six friends (cast.mjs), whole poses picked per beat (POSES), with a 2-frame assisted breakdown
// between keys on the arms only; faces are replacement drawings (they switch, never morph).
// Exposure: acting on twos; camera moves, flights and the knives on ones; holds for every read.
// Closing beat: the table waving, the title, "by Astral Project". No date, price or call to buy.
//
// ---------------------------------------------------------------- STYLE BIBLE (paste verbatim; don't paraphrase)
// Paper: fibrePaper #F3EBDA | Ink #2A2420, brush 4-4.6 px heroes, 2.4-3 px props, 1.6 px background
// Palette (6 + ink): knife red #D0312D (Killers ONLY, plus the knives) · sea #2F5D8A / deep #1D3557
// (night, the deep, DEEP BLUE) · amber #E8A33D (bar light, morning) · sage #7FA886 (Faithful, safe) ·
// ghost grey #B9C3CF · bone #FBF7EE. Wood and skin are neutral earth washes, not palette accents.
// Textures: every hero surface = wash (multiply, pooled edge, grain) -> hatch on its shadow side -> ink edge.
// Line weight by depth: hero 4-4.6 px · props 2.4-3 px · background crowd 45 % opacity, no blink.
// Boil: characters and props boil at 8 fps (the hand is alive); the set is baked and never boils.
// Night: the lit plate darkened with a multiply wash, then phone light added on top (never a grade).
// Lettering: Caveat Brush (titles, tags), Patrick Hand (speech, form answers). OFL fonts in fonts/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GlobalFonts, createCanvas } from "@napi-rs/canvas";
import { clamp, lerp, ss, eOut, eIn, eIO, eBack, popS, hash, ellPts, rrect, burst } from "./lib/core.mjs";
import { Pen } from "./lib/pen.mjs";
import { run, exposure } from "./lib/film.mjs";
import { filmFinish } from "./lib/textures.mjs";
import { INK, PAL, CAST, friend, phone, drink } from "./cast.mjs";
import * as P from "./props.mjs";
import { barSet, barTable, doorSet, limbo } from "./set.mjs";
import { cue, cueEnd, lineStart, DUR, REAL_VO, MATCHED } from "./timeline.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(path.join(HERE, "fonts/CaveatBrush-Regular.ttf"), "Caveat Brush");
GlobalFonts.registerFromPath(path.join(HERE, "fonts/PatrickHand-Regular.ttf"), "Patrick Hand");
GlobalFonts.registerFromPath(path.join(HERE, "fonts/GochiHand-Regular.ttf"), "Gochi Hand");

const W = 1080, H = 1920, FPS = 24;
const FR = 1 / FPS;

// ---------------------------------------------------------------- the timeline, in one place
// Scene k plays line k of the voiceover. Cuts sit a few frames before the line's first word.
const CUT = Array.from({ length: 10 }, (_, k) => k === 0 ? 0 : lineStart(k) - 0.12);
const sceneOf = (t) => { let k = 0; for (let i = 0; i < CUT.length; i++) if (t >= CUT[i]) k = i; return k; };

const E = {
  // 1 · title
  knife: [cue(0, "Three"), cue(0, "Knives"), cue(0, "Out")], title: cue(0, "Out") + .2, room: cue(0, "room"), friendsLine: cue(0, "friends"),
  // 2 · the door
  walk: cue(1, "walk") - .5, six: cue(1, "six"), wearing: cue(1, "wearing"), drinkQ: cue(1, "drink"), hold: cue(1, "Hold"),
  // 3 · roles
  phone3: cue(2, "phone"), secret: cue(2, "secret"), faithful: cue(2, "Faithful"), three3: cue(2, "Three"), killers3: cue(2, "Killers"), nobody: cue(2, "nobody"),
  // 4 · night
  night: cue(3, "night"), dark: cue(3, "dark"), pick: cue(3, "Killers"), take: cue(3, "take"), hunts: cue(3, "Everyone"), doctor: cue(3, "Doctor"), save: cue(3, "save"), detective: cue(3, "Detective"), two: cue(3, "two"),
  // 5 · morning
  morning: cue(4, "morning"), word: cue(4, "word"), drawing: cue(4, "drawing"), tap: cue(4, "tap"), lowest: cue(4, "lowest"), killers5: cue(4, "Killers"), rig: cue(4, "rig"), ends: cue(4, "ends"), last: cue(4, "last"),
  // 6 · ghost
  taken: cue(5, "Taken"), notDone: cue(5, "done"), ghost: cue(5, "ghost"), pass: cue(5, "pass"), living: cue(5, "living"),
  // 7 · clues
  clues: cue(6, "clues"), darkTop: cue(6, "dark"), glasses: cue(6, "Glasses"), gin: cue(6, "gin"), matches: cue(6, "matches"), ask: cue(6, "Ask"), lie: cue(6, "lie"),
  // 8 · vote
  evening: cue(7, "evening"), votes: cue(7, "votes"), out8: cue(7, "out"), night8: cue(7, "night"),
  // 9 · win
  all9: cue(8, "all"), three9: cue(8, "three"), killers9: cue(8, "Killers"), faithful9: cue(8, "Faithful"), slip: cue(8, "Let"), through: cue(8, "through"), killersWin: cue(8, "Killers", 2),
  // 10 · homage + end
  mafia: cue(9, "Mafia"), among: cue(9, "Among"), pictionary: cue(9, "Pictionary"), cluedo: cue(9, "Cluedo"), yourPhone: cue(9, "phone"), oneRoom: cue(9, "room"), come: cue(9, "Come"),
};

// ---------------------------------------------------------------- the table: who stands where
const BACK = { zoe: [270, 1240], riya: [540, 1240], kabir: [810, 1240] }, SB = 1.3;
const FRONT = { arjun: [200, 1572], mae: [540, 1572], dev: [880, 1572] }, SF = 1.5;
const SPOT = { ...Object.fromEntries(Object.entries(BACK).map(([k, v]) => [k, [...v, SB]])), ...Object.fromEntries(Object.entries(FRONT).map(([k, v]) => [k, [...v, SF]])) };
// the table scenes are framed tighter than the baked set: one camera, applied to the set and the people
const SC = 1.3, PY = 1300, toScreen = ([x, y]) => [540 + (x - 540) * SC, PY + (y - PY) * SC];
const headOf = (k) => { const [x, y, s] = SPOT[k]; return toScreen([x, y - 212 * s]); };

// whole poses. arms/bend in degrees (see cast.mjs). Faces switch; arms get one breakdown drawing.
const POSE = {
  idle: { arms: [14, 40], bend: [0, 64], hold: { r: "drink" } },
  sip: { arms: [14, 26], bend: [0, 128], hold: { r: "drink" }, face: "flat" },
  laugh: { arms: [14, 46], bend: [0, 60], hold: { r: "drink" }, face: "open", dip: 3 },
  talk: { arms: [36, 40], bend: [40, 64], hold: { r: "drink" }, face: "open", eyesOpen: true },
  phone: { arms: [14, 22], bend: [0, 128], hold: { r: "phone" } },
  sideL: { arms: [14, 22], bend: [0, 128], hold: { r: "phone" }, look: -5, brows: "furrow", face: "flat" },
  sideR: { arms: [14, 22], bend: [0, 128], hold: { r: "phone" }, look: 5, brows: "furrow", face: "flat" },
  cheer: { arms: [150, 150], bend: [20, 20], face: "open", eyesOpen: false },
  wave: { arms: [14, 140], bend: [0, 30], face: "smile" },
  shock: { arms: [40, 40], bend: [70, 70], face: "O", brows: "raised" },
};
// keys: [[time, poseName or pose object], ...]; returns the pose at tt with a 2-frame breakdown on the arms
function poseAt(keys, tt, extra = {}) {
  let i = 0; for (let k = 0; k < keys.length; k++) if (tt >= keys[k][0]) i = k;
  const get = (q) => typeof q === "string" ? POSE[q] : q, cur = get(keys[i][1]);
  let out = { ...cur };
  if (i > 0 && tt - keys[i][0] < 2 * FR) { const prev = get(keys[i - 1][1]), m = (a, b) => a && b ? [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)] : b;
    out = { ...cur, arms: m(prev.arms || [14, 40], cur.arms || [14, 40]), bend: m(prev.bend || [0, 0], cur.bend || [0, 0]) }; }
  return { ...out, ...extra };
}
// a slow chatting loop, different per person, so the table is never frozen
function chatKeys(k, t0, t1) {
  const seq = { arjun: ["laugh", "idle", "talk", "idle"], zoe: ["idle", "sip", "idle", "laugh"], riya: ["talk", "idle", "sip", "idle"], kabir: ["idle", "laugh", "idle", "sip"], mae: ["sip", "talk", "laugh", "idle"], dev: ["idle", "talk", "idle", "laugh"] }[k];
  const keys = []; let t = t0 - hash(k.length * 7.1) * 1.2, j = 0; while (t < t1) { keys.push([t, seq[j % 4]]); t += 1.05 + hash(j * 3.3 + k.length) * .7; j++; } return keys;
}

// ---------------------------------------------------------------- helpers shared by scenes
let S, pen, dT;                                     // set up once; dT = the drawings' clock (on twos)
function D(name, fn, o = {}) {                       // draw a named drawing, revealing r 0..1, boiling at 8 fps
  const r = o.r ?? 1; if (r <= 0) return;
  if (r < 1 && !pen.weights.has(name)) { const keep = pen.ctx; pen.ctx = S.scratch; pen.begin(name, 1); fn(); pen.end(); pen.ctx = keep; }
  pen.begin(name, r, { boil: o.boil ?? 8, t: o.t ?? dT }); fn(); pen.end();
}
const win = (t, a, d) => clamp((t - a) / d);          // 0..1 over [a, a+d]
function withCam(ctx, s, px, py, dx, dy, fn) { ctx.save(); ctx.translate(px + dx, py + dy); ctx.scale(s, s); ctx.translate(-px, -py); fn(); ctx.restore(); }

// night: darken the lit plate, then add the light that's still on (phones)
function nightWash(ctx, k, glows = [], tint = "rgba(28,48,92,1)") {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = .66 * k; ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const [x, y, r, a = 1] of glows) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(160,215,245,${.5 * k * a})`); g.addColorStop(1, "rgba(150,205,240,0)"); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  ctx.restore();
}
function lampGlow(ctx, k) {                           // warm light pooling under the three pendants
  if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const x of [200, 540, 880]) { const g = ctx.createRadialGradient(x, 330, 10, x, 460, 520); g.addColorStop(0, `rgba(255,214,150,${.42 * k})`); g.addColorStop(1, "rgba(255,214,150,0)"); ctx.fillStyle = g; ctx.fillRect(x - 520, 0, 1040, 1100); }
  ctx.restore();
}
function lamps(ctx, on) {
  D("lamps", () => { for (const [i, x] of [200, 540, 880].entries()) { const y = 250 + (i === 1 ? 30 : 0);
    pen.stroke([[x, 0], [x, y - 40]], { w: 2.6, taper: 0 });
    const shade = [[x - 18, y - 44], [x + 18, y - 44], [x + 62, y + 18], [x - 62, y + 18]]; pen.wash(shade, "#3A4A44", { alpha: .95, sharp: true }); pen.poly(shade, { w: 3 });
    pen.wash(ellPts(x, y + 22, 22, 12, 14), on > .5 ? "#FFE6A8" : "#8C8676", { alpha: 1, solid: true, over: true }); pen.ring(x, y + 22, 22, 12, { w: 2.4 }); } }, { boil: 0 });
}
function friendAt(k, pose, extra = {}) { const [x, y, s] = SPOT[k]; friend(pen, x, y, s, CAST[k], { ...pose, ...extra }, dT); }

// the table scene: set, lamps, back row, table, drinks, front row. poses: { name: pose }
function stage(ctx, t, poses, o = {}) { withCam(ctx, SC, 540, PY, 0, 0, () => stageInner(ctx, t, poses, o)); }
function stageInner(ctx, t, poses, o) {
  ctx.drawImage(S.bar, 0, 0); lamps(ctx, o.lamps ?? 1); lampGlow(ctx, o.lamps ?? 1);
  for (const k of ["zoe", "riya", "kabir"]) if (!o.hide?.includes(k)) D("f/" + k, () => friendAt(k, poses[k] || POSE.idle));
  ctx.drawImage(S.table, 0, 0);
  D("tableDrinks", () => { drink(pen, "beer", 380, 1128, .9, .6); drink(pen, "whisky", 700, 1128, .9); drink(pen, "cocktail", 940, 1128, .9); }, { boil: 0 });
  for (const k of ["arjun", "mae", "dev"]) if (!o.hide?.includes(k)) D("f/" + k, () => friendAt(k, poses[k] || POSE.idle));
}

// ================================================================ scenes
// 1 · Hey! This is Three Knives Out — the game we play at bars, with a whole room of friends and strangers.
function scene1(ctx, t) {
  const cam = lerp(1.07, 1, eIO(win(t, E.friendsLine - .6, 1.6)));
  withCam(ctx, cam, 540, 1250, 0, 0, () => {
    const poses = Object.fromEntries(Object.keys(CAST).map((k) => [k, poseAt(chatKeys(k, 0, E.room + 4), dT)]));
    stage(ctx, t, poses);
  });
  title(ctx, t, E.knife, E.title);
}
// the three knives thunk into the wall, then the title writes itself
function title(ctx, t, kt, tt, o = {}) {
  const spots = [[330, 470, -.32], [540, 445, 0], [750, 470, .32]];
  spots.forEach(([x, y, r], i) => { const a = kt[i]; if (t < a - .14) return;
    const fly = eIn(win(t, a - .14, .14)), wob = t > a ? Math.sin((t - a) * 38) * Math.exp(-(t - a) * 7) * .09 : 0;
    const ky = lerp(-260, y, fly), kx = lerp(x + Math.sin(r) * 260, x, fly);
    if (t > a && t < a + .3) D("kb" + i, () => burst(ctx, x, y + 4, 20, 54, 9, 3.4, INK, Math.PI * 1.15, Math.PI * .7), { boil: 0 });
    D("knife" + i, () => P.knife(pen, kx, ky, .95, r + wob), { t: o.still ? 0 : undefined }); });
  const r = win(t, tt, .9); if (r <= 0) return;
  D("titleTag", () => { const B = o.by != null ? [[170, 500], [910, 490], [918, 700], [162, 708]] : [[170, 500], [910, 490], [918, 630], [162, 638]]; pen.wash(B, "#FBF5E6", { alpha: 1, solid: true, over: true }); pen.poly(B, { w: 3.4 }); }, { r: clamp(r * 3), boil: 0 });
  D("titleText", () => { pen.text("Three Knives Out", 540, 598, { size: 112, font: P.FONT.brush, wt: 3 }); pen.stroke([[250, 616], [520, 624], [830, 610]], { w: 6, color: PAL.red, taper: .7 }); }, { r, boil: 0 });
  if (o.by) D("by", () => pen.text("by Astral Project", 540, 674, { size: 52, font: P.FONT.hand, color: "#4A4038" }), { r: win(t, o.by, .7), boil: 0 });
}

// 2 · When you walk in, you answer six quick questions. ... Hold on to that.
function scene2(ctx, t) {
  ctx.drawImage(S.door, 0, 0);
  const wk = win(t, E.walk, 1.5), stop = wk >= 1, x = lerp(150, 250, eOut(wk)), walkPh = stop ? undefined : (t - E.walk) * 9;
  const writing = t > E.six && t < E.hold;
  const pose = stop ? (writing ? { arms: [14, 70], bend: [0, 50], hold: { r: (pp, hx, hy) => P.pencil(pp, hx + 10, hy - 30, .55, .5), l: undefined }, look: 4, face: t > E.drinkQ ? "smile" : "flat" } : { arms: [14, 20], bend: [0, 10] })
    : { arms: [14 + Math.sin(walkPh) * 18, 14 - Math.sin(walkPh) * 18], bend: [10, 10], walk: walkPh };
  const alpha = clamp((t - E.walk) * 4);
  if (alpha > 0) { ctx.save(); ctx.globalAlpha = alpha; D("f/riya-door", () => friend(pen, x, 1650, 2.2, CAST.riya, pose, dT)); ctx.restore(); }
  // the card: rows arrive one per beat across "six quick questions ... that kind of thing"
  const c0 = E.six - .1, hold = E.hold, shrink = eIO(win(t, hold + .1, .55));
  if (t >= c0) {
    const rows = Array.from({ length: 6 }, (_, k) => win(t, c0 + .15 + k * .28, .3));
    const hi = t > E.drinkQ - .05 ? 3 : t > E.wearing - .05 ? 0 : -1;
    const s = popS(t, c0, .4) * lerp(.9, .2, shrink), cx = lerp(690, 790, shrink), cy = lerp(720, 1230, shrink);
    if (shrink < 1) D("form", () => P.formCard(pen, cx, cy, s, rows, CAST.riya, shrink > 0 ? -1 : hi, { rot: lerp(.02, 0, shrink) }));
  }
  // "Hold on to that": the card files itself into a phone's Contacts
  if (t > hold - .05) {
    const k = popS(t, hold - .05, .35);
    D("contactsPhone", () => phone(pen, 790, 1240, 3.2 * k, (pp, w, h) => {
      pp.wash([[0, 0], [w, 0], [w, 16], [0, 16]], PAL.seaDeep, { alpha: 1, solid: true, over: true, sharp: true });
      pp.text("Contacts", w / 2, 12, { size: 9, font: P.FONT.brush, color: PAL.white });
      const got = shrink >= 1 ? 1 : 0;
      ["Riya", "Arjun", "Kabir", "Mae", "Zoe", "Dev"].forEach((n, i) => { const yy = 24 + i * 12; if (i === 0 && !got) return;
        pp.wash(ellPts(8, yy + 2, 4, 4, 8), i === 0 ? PAL.navy : "#B8C4CC", { alpha: 1, solid: true, over: true }); pp.text(n, 15, yy + 5, { size: 8, font: P.FONT.hand, align: "left" });
        pp.stroke([[4, yy + 9], [w - 4, yy + 9]], { w: .5, color: "#B8C4CC", taper: 0 }); });
    }));
  }
}

// 3 · Then your phone gives you a secret role. Most of you are Faithful. Three of you are Killers. And nobody knows who's who.
function scene3(ctx, t) {
  const side = t > E.nobody;
  const poses = {};
  for (const k of Object.keys(CAST)) {
    const keys = [[0, "phone"]]; if (side) { const L = hash(k.length * 2.7) > .5; keys.push([E.nobody, L ? "sideL" : "sideR"], [E.nobody + .7, L ? "sideR" : "sideL"], [E.nobody + 1.4, L ? "sideL" : "sideR"]); }
    poses[k] = poseAt(keys, dT, k === "riya" && t > E.killers3 ? { glint: clamp((t - E.killers3) * 5) * (side ? .6 : 1), face: side ? "smirk" : "smile" } : {});
  }
  stage(ctx, t, poses);
  // envelopes over every head, then the cards
  const order = ["zoe", "riya", "kabir", "arjun", "mae", "dev"];
  order.forEach((k, i) => {
    const [hx, hy] = headOf(k), ey = hy - 120, a = E.phone3 + i * .07, isK = k === "riya";
    const openAt = isK ? E.killers3 : E.faithful + i * .05, gone = eIn(win(t, E.nobody + .1 + i * .04, .3));
    if (t < a || gone >= 1) return;
    const pop = popS(t, a, .36) * (1 - gone), op = win(t, openAt, .25);
    D("env" + k, () => P.envelope(pen, hx, ey + (1 - pop) * 30, .9 * pop, op));
    if (op > 0) { const rise = eBack(op); D("card" + k, () => P.roleCard(pen, hx, ey - 20 - rise * 46, .78 * pop * clamp(op * 2), isK ? "killer" : "faithful", { rot: (hash(i) - .5) * .12 })); }
    if (side && gone < 1) {}
  });
  if (t > E.three3) { const k = popS(t, E.three3, .4) * (1 - eIn(win(t, E.nobody + .2, .3)));
    if (k > 0) D("threeTag", () => P.label(pen, 540, 360, "3 Killers in the room", { size: 58, s: k, tint: PAL.red, color: PAL.white, rot: -.02 })); }
  if (side) { const k = popS(t, E.nobody + .35, .4);
    D("whoTag", () => P.label(pen, 540, 360, "Who's who?", { size: 64, s: k, rot: .02 }));
    for (const [i, kk] of ["zoe", "kabir", "arjun", "mae", "dev"].entries()) { const [hx, hy] = headOf(kk), q = popS(t, E.nobody + .5 + i * .08, .3);
      if (q > 0) D("q" + kk, () => pen.text("?", hx + 46, hy - 50, { size: 64 * q, font: P.FONT.brush, color: INK })); } }
}

// 4 · At night, every phone goes dark at once. The Killers quietly pick someone to take. Everyone else hunts. ...
function scene4(ctx, t) {
  const nk = eIO(win(t, E.night - .1, .6));
  const poses = Object.fromEntries(Object.keys(CAST).map((k) => [k, poseAt([[0, "phone"]], dT, { face: "flat", look: k === "riya" ? 4 : 0, glint: k === "riya" ? nk * .8 : 0 })]));
  stage(ctx, t, poses, { lamps: 1 - nk });
  const glows = Object.keys(CAST).map((k) => { const [x, y, s] = SPOT[k], [gx, gy] = toScreen([x + 30 * s, y - 175 * s]); return [gx, gy, 62 * s * SC, .9]; });
  nightWash(ctx, nk, glows);
  if (nk > .5) D("moon4", () => P.moonWash(pen, 900, 380, 52), { boil: 0 });
  // the Killers' group chat: one poll, Dev gets the votes
  const inK = popS(t, E.pick - .1, .4), outK = eIn(win(t, E.hunts - .15, .3));
  if (inK > 0 && outK < 1) {
    const vote = eOut(win(t, E.pick + .5, (E.take - E.pick) + .3));
    D("killerChat", () => phone(pen, 540, 640 - outK * 900, 5.8 * inK, (pp, w, h) => {
      pp.wash([[0, 0], [w, 0], [w, 15], [0, 15]], PAL.red, { alpha: 1, solid: true, over: true, sharp: true });
      pp.text("Killers", w / 2, 11, { size: 8.5, font: P.FONT.brush, color: PAL.white });
      P.bubble(pp, w / 2 - 4, 26, "who tonight?", { size: 6.6, tail: -1 });
      [["Dev", 3], ["Mae", 0], ["Kabir", 0]].forEach(([n, v], i) => { const yy = 44 + i * 13, fillW = n === "Dev" ? (w - 12) * .9 * vote : 3;
        pp.wash(rrect(5, yy - 5, w - 10, 11, 3), PAL.white, { alpha: 1, solid: true, over: true }); pp.wash(rrect(5, yy - 5, Math.max(3, fillW), 11, 3), n === "Dev" ? "#F2B6B3" : "#E6E6E6", { alpha: 1, solid: true, over: true });
        pp.text(n, 9, yy + 3, { size: 7, font: P.FONT.hand, align: "left" }); if (n === "Dev" && vote > .95) pp.text("✓", w - 9, yy + 3, { size: 8, font: P.FONT.hand, color: PAL.red }); });
    }, { screenColor: "#F4F1EA" }));
  }
  // everyone else hunts: eyes open over the Faithful
  for (const [i, k] of ["zoe", "kabir", "arjun", "mae", "dev"].entries()) { const [hx, hy] = headOf(k), e = popS(t, E.hunts + i * .07, .3) * (1 - eIn(win(t, E.doctor - .1, .25)));
    if (e > 0) D("eye" + k, () => P.eyeIcon(pen, hx, hy - 96, e)); }
  // the Doctor saves one, the Detective checks two
  if (t > E.doctor - .05) { const k = popS(t, E.doctor - .05, .35), [mx, my] = headOf("mae"), [kx, ky] = headOf("kabir");
    D("docTag", () => P.label(pen, mx, my - 100, "Doctor", { size: 46, s: k, tint: PAL.sage }));
    const sk = popS(t, E.save - .05, .4); if (sk > 0) { D("shield", () => P.shield(pen, kx, ky - 4, 1.25, sk));
      D("docLine", () => pen.stroke([[mx + 40, my - 120], [lerp(mx, kx, .5), lerp(my, ky, .5) - 220], [kx - 10, ky - 70]], { w: 3.4, color: PAL.sage, taper: .4 }), { r: win(t, E.save - .05, .4), boil: 0 }); } }
  if (t > E.detective - .05) { const k = popS(t, E.detective - .05, .35), [ax, ay] = headOf("arjun");
    D("detTag", () => P.label(pen, ax + 20, ay - 100, "Detective", { size: 46, s: k, tint: "#BFD6E6" }));
    const sw = win(t, E.detective + .25, (E.two - E.detective) + .5), [zx, zy] = headOf("zoe"), [rx, ry] = headOf("riya");
    if (sw > 0) { const u = eIO(sw), mx2 = u < .5 ? lerp(zx, rx, 0) : rx, mx = lerp(zx, rx, eIO(clamp(u * 1.6 - .3)));
      D("mag", () => P.magnifier(pen, mx + 10, lerp(zy, ry, u) + 6, 1.2, -.3));
      for (const k2 of ["zoe", "riya"]) { const [hx, hy] = headOf(k2), m = popS(t, E.detective + (k2 === "zoe" ? .4 : .9), .3); if (m > 0) D("chk" + k2, () => P.circleMark(pen, hx, hy, 70, 70, clamp(m), "#BFD6E6", 5)); } } }
}

// 5 · In the morning, the whole room plays a quick game together. A word game, a drawing game, or tap to swim.
//     The lowest score gets taken… and the Killers secretly rig who ends up last.
function scene5(ctx, t) {
  const day = eIO(win(t, CUT[4], .7));
  const poses = Object.fromEntries(Object.keys(CAST).map((k) => [k, poseAt([[0, "phone"], [E.word, k === "riya" ? "phone" : "phone"]], dT, { face: t > E.lowest ? "flat" : "smile" })]));
  stage(ctx, t, poses, { lamps: day });
  nightWash(ctx, 1 - day, []);
  // three mini-games
  const off = eIn(win(t, E.lowest - .2, .35));
  [[E.word, 210, 600, -.05, "word game", P.wordGame], [E.drawing, 540, 560, .03, "drawing game", P.sketchGame], [E.tap, 870, 600, -.03, "tap to swim", P.runGame]].forEach(([a, x, y, r, ttl, fn], i) => {
    const k = popS(t, a - .05, .38); if (k <= 0 || off >= 1) return;
    D("panel" + i, () => P.panel(pen, x, y - off * 1000, .95, r, ttl, (pp) => fn(pp, t - a), k)); });
  // the board, then the rig
  if (t > E.lowest - .1) {
    const k = popS(t, E.lowest - .1, .42);
    const grab = win(t, E.rig - .05, .2), drag = eIO(win(t, E.rig + .15, Math.max(.5, E.ends - E.rig))), sink = win(t, E.last - .05, .4);
    const base = [["Mae", 910], ["Dev", 840], ["Arjun", 770], ["Riya", 700], ["Zoe", 650], ["Kabir", 590]];
    const rows = base.map(([name, score], i) => {
      let y = i; if (name === "Dev") y = lerp(1, 5, drag); else if (i > 1) y = i - drag;
      return { name, score, y, rank: name === "Dev" ? (drag > .5 ? 6 : 2) : (i > 1 && drag > .5 ? i : i + 1), hi: name === "Dev" && grab > 0, lift: name === "Dev" ? clamp(grab - eIn(win(t, E.ends, .2))) : 0, sink: name === "Dev" ? sink : 0, bar: name === "Dev" ? PAL.sea : PAL.sea };
    });
    rows.sort((a, b) => (a.name === "Dev") - (b.name === "Dev"));
    D("board", () => P.board(pen, 540, 640, .84 * k, rows, { wave: win(t, E.last - .2, .35), t }));
    if (t > E.lowest + .4 && t < E.killers5) { const pk = popS(t, E.lowest + .4, .3); D("lowTag", () => P.label(pen, 860, 1030, "lowest", { size: 40, s: pk, rot: .06 })); }
    // the red hand comes in from the right, grabs Dev's row, drags it to the bottom
    const hin = eOut(win(t, E.killers5 - .1, .45)), hout = eIn(win(t, E.last + .1, .4));
    if (hin > 0 && hout < 1) { const rowY = 640 + (-230 + lerp(1, 5, drag) * 104) * .84;
      const hx = lerp(1250, 830, hin) + hout * 500, hy = rowY - 10 + (grab > 0 ? -clamp(grab - eIn(win(t, E.ends, .2))) * 8 : 0);
      D("hand", () => P.redHand(pen, hx, hy, .8, -1.45, grab)); }
  }
}

// 6 · Taken? You're not done. You come back as a ghost — and ghosts pass true clues to the living.
function scene6(ctx, t) {
  ctx.drawImage(S.limbo, 0, 0);
  const g = eIO(win(t, E.ghost - .1, .6)), drift = eIO(win(t, E.pass - .2, (E.living - E.pass) + .3));
  const devX = lerp(360, 500, drift), devY = 1560 - g * 110;
  const devPose = t < E.notDone ? { arms: [40, 40], bend: [70, 70], face: "O", brows: "raised" }
    : t < E.ghost ? { arms: [16, 16], bend: [0, 0], face: "smirk", brows: "raised" }
    : { arms: [30, 60 + drift * 30], bend: [20, 10], face: "smile", ghost: g, hold: { r: drift < .98 ? (pp, hx, hy) => P.polaroid(pp, hx + 30, hy - 40, .45, .1, P.PHOTO.darkTop) : undefined } };
  D("dev6", () => friend(pen, devX, devY, 2.5, CAST.dev, devPose, dT));
  const kIn = eOut(win(t, E.pass - .4, .5));
  if (kIn > 0) {
    const got = t > E.living + .05;
    D("kabir6", () => friend(pen, lerp(1300, 820, kIn), 1560, 2.5, CAST.kabir, { arms: [16, got ? 70 : 30], bend: [0, got ? 40 : 30], face: got ? "O" : "smile", brows: got ? "raised" : "none", look: -4,
      hold: { l: got ? (pp, hx, hy) => P.polaroid(pp, hx - 40, hy - 50, .5, -.08, P.PHOTO.darkTop) : undefined } }, dT));
    if (got) { const sk = popS(t, E.living + .25, .3); D("trueTag", () => P.label(pen, 760, 760, "true clue ✓", { size: 50, s: sk, tint: PAL.sage, rot: -.04 })); }
  }
  if (t > E.taken) { const k = popS(t, E.taken, .35) * (1 - eIn(win(t, E.ghost - .2, .2)));
    if (k > 0) D("takenTag", () => P.label(pen, 540, 470, "Taken!", { size: 80, s: k, rot: -.03 })); }
  if (t > E.ghost - .05) { const k = popS(t, E.ghost - .05, .4); D("ghostTag", () => P.label(pen, 540, 470, "Now a ghost", { size: 80, s: k, tint: PAL.ghost, rot: .02 })); }
}

// 7 · Now the good part: the clues. Every clue describes a Killer. A dark top. Glasses. A gin. Check who matches. Ask around. Catch the lie.
const GRID = [["arjun", 200, 580], ["riya", 540, 580], ["mae", 880, 580], ["kabir", 200, 975], ["dev", 540, 975], ["zoe", 880, 975]];
function scene7(ctx, t) {
  ctx.drawImage(S.limbo, 0, 0);
  const outAt = { arjun: E.darkTop + .35, mae: E.darkTop + .5, dev: E.darkTop + .65, kabir: E.glasses + .35, zoe: E.gin + .4 };
  GRID.forEach(([k, x, y], i) => {
    const a = CUT[6] + .1 + i * .08, pop = popS(t, a, .38); if (pop <= 0) return;
    const xo = outAt[k] ? win(t, outAt[k], .3) : 0, isR = k === "riya";
    D("card7" + k, () => P.contactCard(pen, x, y, .98 * pop, CAST[k], { rot: (hash(i * 3) - .5) * .06, dim: xo, face: isR && t > E.lie ? "O" : "smile", brows: isR && t > E.lie ? "raised" : undefined, look: isR && t > E.ask && t < E.lie ? -3 : 0 }, dT));
    if (xo > 0) D("x7" + k, () => P.cross(pen, x, y - 25, 112, xo, INK, 11), { boil: 0 });
  });
  const [rx, ry] = [540, 580];
  const ring = win(t, E.matches - .05, .5); if (ring > 0) D("ring7", () => P.circleMark(pen, rx, ry, 178, 218, ring, PAL.red, 9), { boil: 0 });
  // the three clue photos land along the bottom
  [[E.darkTop, 200, 1380, -.08, "dark top", P.PHOTO.darkTop], [E.glasses, 540, 1365, .05, "glasses", P.PHOTO.glasses], [E.gin, 880, 1380, -.04, "a gin", P.PHOTO.gin]].forEach(([a, x, y, r, lb, img], i) => {
    const drop = eOut(win(t, a - .12, .22)); if (drop <= 0) return;
    D("pol" + i, () => P.polaroid(pen, x, lerp(y - 500, y, drop), .95, r * drop + (1 - drop) * .4, img, lb)); });
  if (t > CUT[6] + .05) { const k = popS(t, CUT[6] + .05, .35); D("cluesTag", () => P.label(pen, 200, 330, "Clues", { size: 76, s: k, rot: -.03 })); }
  // ask around; catch the lie
  if (t > E.ask) { const k = popS(t, E.ask, .3); D("lieBubble", () => P.bubble(pen, 760, 340, "Me? I had a beer!", { size: 42, s: k, tail: -1, crack: win(t, E.lie, .25) })); }
  if (t > E.lie + .2) { const k = popS(t, E.lie + .2, .35); D("lieTag", () => P.label(pen, 540, 1170, "Caught!", { size: 66, s: k, tint: PAL.red, color: PAL.white, rot: .03 })); }
}

// 8 · Every evening, the room votes someone out. And then the night comes back.
function scene8(ctx, t) {
  const point = t > E.votes - .1, out = win(t, E.out8 + .2, .6);
  const AIM = { zoe: { arms: [14, 92], bend: [0, -6] }, kabir: { arms: [92, 14], bend: [-6, 0] }, arjun: { arms: [14, 132], bend: [0, -4] }, mae: { arms: [14, 168], bend: [0, -2] }, dev: { arms: [132, 14], bend: [-4, 0] } };
  const poses = {};
  for (const k of Object.keys(CAST)) {
    if (k === "riya") poses[k] = poseAt([[0, "idle"], [E.votes + .2, "shock"]], dT, { ghost: out, glint: out > 0 ? 0 : 0 });
    else poses[k] = poseAt([[0, "idle"], [E.votes - .1 + hash(k.length) * .25, { ...AIM[k], hold: { [AIM[k].arms[0] > 50 ? "l" : "r"]: "point" }, face: "flat", brows: "furrow", look: k === "zoe" || k === "arjun" ? 4 : -4 }]], dT);
  }
  stage(ctx, t, poses);
  // dusk, then night sweeps back down
  ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = .28 * win(t, CUT[7], .6); ctx.fillStyle = "#E8A06A"; ctx.fillRect(0, 0, W, H); ctx.restore();
  const nk = eIO(win(t, E.night8 - .1, .8));
  if (nk > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H * nk * 1.05); ctx.clip(); nightWash(ctx, 1, []); ctx.restore(); if (nk > .6) D("moon8", () => P.moonWash(pen, 900, 380, 52), { boil: 0 }); }
  const [rx, ry] = headOf("riya");
  if (point) D("tally", () => P.tally(pen, rx + 80, ry - 140, Math.min(5, 1 + Math.floor((t - E.votes) * 7))), { boil: 0 });
  if (t > E.votes) { const k = popS(t, E.votes, .35); D("voteTag", () => P.label(pen, 540, 360, "The vote", { size: 72, s: k, rot: -.02 })); }
  if (out > 0) D("riyaCard8", () => P.roleCard(pen, rx - 150, ry - 110, .9 * popS(t, E.out8 + .2, .4), "killer", { rot: -.1 }));
}

// 9 · Catch all three Killers, and the Faithful win. Let one slip through… and the Killers do.
function scene9(ctx, t) {
  ctx.drawImage(S.limbo, 0, 0);
  const dark = eIO(win(t, E.slip - .1, .6));
  const kx = [300, 540, 780], xs = [E.all9, E.three9, E.killers9];
  kx.forEach((x, i) => {
    const pop = popS(t, CUT[8] + i * .1, .35), slipping = i === 2 ? eIn(win(t, E.through - .2, .6)) : 0;
    D("k9" + i, () => P.knife(pen, x + slipping * 90, 760 + slipping * 1400, 1.5 * pop, slipping * 1.6));
    const xk = win(t, xs[i], .28) * (i === 2 ? 1 - win(t, E.slip, .3) : 1);
    if (xk > 0 && slipping < .2) D("kx9" + i, () => P.cross(pen, x, 620, 90, xk, PAL.sage, 12), { boil: 0 });
  });
  // the Faithful cheer
  const cheer = t > E.faithful9 - .05, fade = 1 - dark;
  if (cheer && fade > 0) { ctx.save(); ctx.globalAlpha = fade;
    ["arjun", "zoe", "kabir", "mae", "dev", "riya"].forEach((k, i) => { const x = 120 + i * 168, jump = Math.abs(Math.sin((t - E.faithful9) * 7 + i)) * 34;
      D("c9" + k, () => friend(pen, x, 1600 - jump - (i % 2) * 40, 1.4, CAST[k], k === "riya" ? { ...POSE.shock, ghost: 1 } : POSE.cheer, dT)); });
    D("conf9", () => P.confetti(pen, 540, 980, 60, win(t, E.faithful9, 1.8), t, 7), { boil: 0 });
    const k = popS(t, E.faithful9, .4); D("fwTag", () => P.label(pen, 540, 380, "Faithful win!", { size: 80, s: k, tint: PAL.sage, rot: -.02 })); ctx.restore(); }
  // ...or one slips through
  if (dark > 0) {
    ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = .72 * dark; ctx.fillStyle = "#2A2F40"; ctx.fillRect(0, 0, W, H); ctx.restore();
    const rise = eOut(win(t, E.killersWin - .3, .6));
    if (rise > 0) { D("shadow9", () => friend(pen, 540, 1640 + (1 - rise) * 300, 2.3, { ...CAST.riya, skin: "#4A4048", shirt: "#2A2A30", hairColor: "#141014" }, { arms: [14, 60], bend: [0, 90], face: "grin", brows: "furrow", glint: 1, noBlink: true, hold: { r: (pp, hx, hy) => P.knife(pp, hx + 4, hy - 40, .55, Math.PI) } }, dT));
      const k = popS(t, E.killersWin + .1, .4); D("kwTag", () => P.label(pen, 540, 380, "Killers win", { size: 80, s: k, tint: PAL.red, color: PAL.white, rot: .02 })); }
  }
}

// 10 · It's a bit of Mafia, Among Us, Pictionary and Cluedo — all on your phone, in one room. Come play with us sometime.
function scene10(ctx, t) {
  const back = eIO(win(t, E.oneRoom - .12, .3));
  if (back < 1) {
    ctx.save(); ctx.globalAlpha = 1;
    withCam(ctx, lerp(1, .6, back), 540, 760, 0, 0, () => {
      ctx.drawImage(S.limbo, 0, 0);
      const lit = win(t, E.yourPhone - .1, .3);
      D("phone10", () => phone(pen, 540, 780, 4.3 * popS(t, CUT[9], .4), (pp, w, h) => {
        pp.wash([[0, 0], [w, 0], [w, h], [0, h]], lit > 0 ? "#1D3557" : "#2A2A30", { alpha: 1, solid: true, over: true, sharp: true });
        if (lit > 0) { for (const [i, r] of [-.3, 0, .3].entries()) P.knife(pp, 14 + i * 13, 60, .14, r); pp.text("Three Knives Out", w / 2, 76, { size: 6.4, font: P.FONT.brush, color: PAL.white }); }
      }));
      [[E.mafia, 210, 470, "Mafia", (x, y) => P.fedora(pen, x, y, 1.6)], [E.among, 870, 470, "Among Us", (x, y) => P.crewmate(pen, x, y + 10, 1.5)],
       [E.pictionary, 210, 1090, "Pictionary", (x, y) => P.easel(pen, x, y, 1.6)], [E.cluedo, 870, 1090, "Cluedo", (x, y) => P.magnifier(pen, x - 30, y - 30, 1.7, 0)]]
        .forEach(([a, x, y, name, fn], i) => { const r = win(t, a - .1, .5); if (r <= 0) return;
          D("hom" + i, () => fn(x, y), { r }); D("homT" + i, () => pen.text(name, x, y + 175, { size: 60, font: P.FONT.brush }), { r: win(t, a + .1, .4), boil: 0 }); });
    });
    ctx.restore();
  }
  if (back > 0) {
    ctx.save(); ctx.globalAlpha = back;
    const poses = Object.fromEntries(Object.keys(CAST).map((k, i) => [k, t > E.come - .1 ? poseAt([[E.come - .1 + i * .06, "wave"]], dT, { arms: [14, 120 + Math.sin(t * 9 + i) * 22] }) : poseAt(chatKeys(k, E.oneRoom, E.oneRoom + 6), dT)]));
    withCam(ctx, lerp(1.2, 1, back), 540, 1250, 0, 0, () => stage(ctx, t, poses));
    title(ctx, t, [0, 0, 0], E.oneRoom + .3, { by: E.come + .4, still: true });
    ctx.restore();
  }
}

const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10];

// ---------------------------------------------------------------- sound cues, from the same times as the picture
function cues() {
  const duck = REAL_VO ? .5 : 1;                      // under the voice, the effects sit back
  const C = [], add = (sfx, t, o = {}) => C.push({ sfx, t: +(t - .03).toFixed(3), ...o, vol: +((o.vol ?? .5) * duck).toFixed(3) });
  E.knife.forEach((a, i) => { add("whip", a - .14, { vol: .25, dur: .18 }); add("thump", a, { vol: .55 }); add("crack", a, { vol: .25, pitch: 1.1 + i * .1 }); });
  add("scratch", E.title, { vol: .2, dur: .6 });
  for (let k = 0; k < 6; k++) add("tick", E.six - .1 + .15 + k * .28, { vol: .35, pitch: 1 + k * .05 });
  add("pop", E.hold - .05, { vol: .4 }); add("whoosh", E.hold + .1, { vol: .3, dur: .5 }); add("chime", E.hold + .65, { vol: .25, dur: .6 });
  for (let i = 0; i < 6; i++) add("pop", E.phone3 + i * .07, { vol: .3, pitch: .9 + i * .06 });
  add("sparkle", E.faithful, { vol: .3 }); add("thump", E.killers3, { vol: .45 }); add("crack", E.killers3, { vol: .2 });
  add("riser", E.night - .9, { vol: .25, dur: .9 }); add("thump", E.night, { vol: .35, pitch: .7 });
  add("pop", E.pick - .1, { vol: .35 }); for (let i = 0; i < 3; i++) add("click", E.pick + .5 + i * .22, { vol: .4 }); add("tick", E.take, { vol: .4 });
  for (let i = 0; i < 5; i++) add("pop", E.hunts + i * .07, { vol: .25, pitch: 1.1 + i * .05 });
  add("pop", E.doctor - .05, { vol: .3 }); add("chime", E.save, { vol: .3, dur: .7 }); add("pop", E.detective - .05, { vol: .3 }); add("whoosh", E.detective + .3, { vol: .25, dur: .6 });
  add("sparkle", E.morning - .3, { vol: .25 }); [E.word, E.drawing, E.tap].forEach((a) => add("pop", a - .05, { vol: .4 }));
  add("boing", E.tap + .4, { vol: .2 }); add("whoosh", E.lowest - .2, { vol: .3 }); add("thump", E.lowest - .1, { vol: .35 });
  add("whoosh", E.killers5 - .1, { vol: .3 }); add("scratch", E.rig + .15, { vol: .35, dur: .5 }); add("splash", E.last, { vol: .5 });
  add("thump", E.taken, { vol: .35 }); add("sparkle", E.ghost - .1, { vol: .35 }); add("whoosh", E.pass - .2, { vol: .25, dur: .6 }); add("chime", E.living + .25, { vol: .3 });
  for (let i = 0; i < 6; i++) add("pop", CUT[6] + .1 + i * .08, { vol: .25, pitch: .9 + i * .05 });
  [E.darkTop, E.glasses, E.gin].forEach((a) => { add("whoosh", a - .12, { vol: .2, dur: .25 }); add("thump", a + .1, { vol: .3, pitch: 1.4 }); });
  ["darkTop", "darkTop", "darkTop", "glasses", "gin"].forEach((k, i) => add("scratch", E[k] + [.35, .5, .65, .35, .4][i], { vol: .25, dur: .2 }));
  add("scratch", E.matches, { vol: .3, dur: .4 }); add("pop", E.ask, { vol: .3 }); add("crack", E.lie, { vol: .45 });
  for (let i = 0; i < 5; i++) add("tick", E.votes + i / 7, { vol: .35 }); add("thump", E.out8 + .2, { vol: .45 }); add("riser", E.night8 - .6, { vol: .2, dur: .8 });
  [E.all9, E.three9, E.killers9].forEach((a) => add("scratch", a, { vol: .35, dur: .25 })); add("chime", E.faithful9, { vol: .35 }); add("sparkle", E.faithful9 + .1, { vol: .3 });
  add("fall", E.through - .2, { vol: .35 }); add("thump", E.killersWin + .1, { vol: .5, pitch: .7 });
  [E.mafia, E.among, E.pictionary, E.cluedo].forEach((a) => add("pop", a - .05, { vol: .35 })); add("sparkle", E.yourPhone, { vol: .3 }); add("whoosh", E.oneRoom - .15, { vol: .3, dur: .7 });
  add("chime", E.oneRoom + .3, { vol: .3 });
  return C.filter((c) => c.t >= 0 && c.t < DUR).sort((a, b) => a.t - b.t);
}

if (process.argv[2] === "cues") {
  fs.mkdirSync(path.join(HERE, "out"), { recursive: true });
  fs.writeFileSync(path.join(HERE, "out/cues.json"), JSON.stringify(cues(), null, 1));
  console.log(`wrote out/cues.json (${cues().length} cues) · ${REAL_VO ? `real VO, ${MATCHED} words matched` : "estimated timing (no words.json yet)"} · ${DUR.toFixed(2)} s`);
} else {
  run({
    name: "three-knives-explainer", W, H, fps: FPS, dur: DUR, out: path.join(HERE, "out"), sheetScale: Number(process.env.SC || .22),
    setup(ctx) {
      const scratch = createCanvas(8, 8).getContext("2d");
      return { pen: new Pen(ctx), scratch, bar: barSet(W, H), table: barTable(W, H), door: doorSet(W, H), limbo: limbo(W, H), finish: filmFinish(W, H, { grain: .08, vignette: .14, flicker: .015 }) };
    },
    frame(ctx, t, i, st) {
      S = st; pen = st.pen; pen.ctx = ctx; dT = exposure(t, [{ at: 0, on: 2 }], FPS);
      SCENES[sceneOf(t)](ctx, t);
      if (process.env.SAFE) { ctx.save(); ctx.strokeStyle = "rgba(255,0,0,.8)"; ctx.lineWidth = 4; ctx.strokeRect(0, 285, W, 1350); ctx.restore(); }
      st.finish(ctx, i);
    },
  });
}
