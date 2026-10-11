// set.mjs — the places, baked once into offscreen canvases (held drawings hold their marks; no boil).
//   barSet(W, H)   the back wall, shelf of bottles, frames, background crowd, the floor
//   barTable(W, H) the high table the back row stands behind (transparent canvas, drawn between rows)
//   doorSet(W, H)  the entrance: an open door onto the night, a welcome mat, a coat hook
//   limbo(W, H)    plain paper with a soft floor line, for the explainer close-ups
import { createCanvas, ellPts, rrect, hash, lerp, rng } from "./lib/core.mjs";
import { Pen } from "./lib/pen.mjs";
import { fibrePaper } from "./lib/textures.mjs";
import { INK, PAL, friend, CAST } from "./cast.mjs";

const WALL = "#E6CFA6", WOOD = "#9C6A44", WOOD_D = "#6E4A30", FLOOR = "#B98A5E";

function base(W, H) { const c = createCanvas(W, H), x = c.getContext("2d"); x.drawImage(fibrePaper(W, H), 0, 0); return [c, x, new Pen(x)]; }
function planks(x, x0, y0, x1, y1, gap, col, a = .18) { x.save(); x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = 1.6; for (let px = x0; px < x1; px += gap) { x.beginPath(); x.moveTo(px + (hash(px) - .5) * 4, y0); x.lineTo(px + (hash(px + 1) - .5) * 4, y1); x.stroke(); } x.restore(); }

export const FLOOR_Y = 1180;

function bottle(p, x, y, kind, k) {
  const shapes = {
    wine: [[-13, 0], [-13, -70], [-6, -92], [-6, -118], [6, -118], [6, -92], [13, -70], [13, 0]],
    squat: [[-20, 0], [-20, -54], [-8, -64], [-8, -84], [8, -84], [8, -64], [20, -54], [20, 0]],
    tall: [[-11, 0], [-11, -96], [-5, -108], [-5, -132], [5, -132], [5, -108], [11, -96], [11, 0]],
  };
  const cols = ["#6E9A6A", "#C4893A", "#A9C9D6", "#7A4A2E", "#C9B26A", "#8C5A7A"];
  const S = shapes[kind], col = cols[k % cols.length];
  p.wash(S, col, { alpha: .85, sharp: false }); p.stroke([...S, S[0]], { w: 2.2, smooth: false });
  p.wash([[-9, -18], [9, -18], [9, -46], [-9, -46]], "#F4EBD4", { alpha: .9, solid: true, over: true, sharp: true });
  p.stroke([[-7, -60], [-7, -24]], { w: 2, color: "#FFFFFF", taper: .6 });
}

export function barSet(W, H) {
  const [c, x, p] = base(W, H);
  // wall: warm wash, vertical planks, a darker wainscot
  p.begin("set/wall"); p.wash([[0, 0], [W, 0], [W, FLOOR_Y], [0, FLOOR_Y]], WALL, { alpha: .75, sharp: true, solid: true });
  planks(x, 0, 0, W, 900, 68, WOOD_D, .14);
  p.wash([[0, 900], [W, 900], [W, FLOOR_Y], [0, FLOOR_Y]], WOOD, { alpha: .55, sharp: true });
  planks(x, 0, 900, W, FLOOR_Y, 46, WOOD_D, .25);
  p.stroke([[0, 900], [W, 900]], { w: 3.4, taper: .1 }); p.stroke([[0, 912], [W, 912]], { w: 1.6, taper: .1, color: WOOD_D });
  // the shelf of bottles
  p.begin("set/shelf"); const SY = 830;
  const kinds = ["wine", "squat", "tall", "wine", "tall", "squat", "wine", "tall", "squat", "wine", "tall", "squat", "wine"];
  kinds.forEach((k, i) => bottle(p, 70 + i * 79 + (hash(i) - .5) * 14, SY, k, i));
  p.wash([[30, SY], [W - 30, SY], [W - 30, SY + 16], [30, SY + 16]], WOOD_D, { alpha: .95, sharp: true }); p.stroke([[30, SY], [W - 30, SY]], { w: 3 }); p.stroke([[30, SY + 16], [W - 30, SY + 16]], { w: 2.4 });
  // two little frames at the edges
  p.begin("set/frames");
  for (const [fx, fy, fw, fh, col] of [[40, 420, 120, 150, "#9CB8C9"], [W - 170, 470, 130, 110, "#C9A26A"]]) {
    p.wash([[fx, fy], [fx + fw, fy], [fx + fw, fy + fh], [fx, fy + fh]], col, { alpha: .6, sharp: true }); p.stroke([[fx, fy], [fx + fw, fy], [fx + fw, fy + fh], [fx, fy + fh], [fx, fy]], { w: 4, smooth: false, color: WOOD_D });
    p.stroke([[fx + 14, fy + fh - 24], [fx + fw * .4, fy + fh * .45], [fx + fw * .6, fy + fh * .7], [fx + fw - 14, fy + fh * .3]], { w: 2.4, color: INK });
  }
  // the background crowd: a few guests at the far tables, faint (depth: background = no detail, 45 %)
  x.save(); x.globalAlpha = .38;
  const crowd = [[60, 1080, .78, "kabir", PAL.sage], [150, 1110, .7, "mae", PAL.amber], [W - 70, 1075, .8, "arjun", PAL.sea], [W - 160, 1105, .72, "zoe", "#C98A8A"]];
  crowd.forEach(([cx, cy, s, who, shirt], i) => { p.begin("set/crowd" + i); friend(p, cx, cy, s, { ...CAST[who], shirt, glasses: i % 2 === 0, hair: ["short", "long", "curly", "bun"][i] }, { arms: [14, 40], bend: [0, 60], still: true, look: i < 2 ? 4 : -4, noBlink: true }, 0); });
  x.restore();
  // floor: boards in perspective, hatch, a skirting line
  p.begin("set/floor"); p.wash([[0, FLOOR_Y], [W, FLOOR_Y], [W, H], [0, H]], FLOOR, { alpha: .8, sharp: true, solid: true });
  x.save(); x.globalAlpha = .28; x.strokeStyle = WOOD_D; x.lineWidth = 2;
  for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(W / 2 + i * 60, FLOOR_Y); x.lineTo(W / 2 + i * 260, H); x.stroke(); }
  for (const y of [1260, 1370, 1520, 1720]) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  x.restore();
  p.stroke([[0, FLOOR_Y], [W, FLOOR_Y]], { w: 3.6, taper: .1 });
  return c;
}

export function barTable(W, H) {
  const c = createCanvas(W, H), x = c.getContext("2d"), p = new Pen(x);
  p.begin("set/table");
  const top = [[90, 1110], [990, 1110], [1010, 1146], [70, 1146]], face = [[90, 1146], [990, 1146], [970, 1250], [110, 1250]];
  p.wash(face, WOOD_D, { alpha: 1, solid: true, over: true, sharp: true }); p.wash(face, WOOD, { alpha: .6, sharp: true });
  x.save(); x.globalAlpha = .3; x.strokeStyle = "#4A3020"; x.lineWidth = 1.6; for (let y = 1160; y < 1250; y += 14) { x.beginPath(); x.moveTo(110, y); for (let px = 110; px <= 970; px += 40) x.lineTo(px, y + Math.sin(px * .03 + y) * 2.4); x.stroke(); } x.restore();
  p.wash(top, "#B98552", { alpha: 1, solid: true, over: true, sharp: true }); p.wash(top, "#D7A46C", { alpha: .5, sharp: true });
  p.stroke([[90, 1110], [990, 1110], [1010, 1146], [70, 1146], [90, 1110]], { w: 3.6, smooth: false });
  p.stroke([[90, 1146], [110, 1250], [970, 1250], [990, 1146]], { w: 3.2, smooth: false });
  p.stroke([[140, 1120], [420, 1120]], { w: 2.4, color: "#F2D2A4", taper: .7 });
  return c;
}

export function doorSet(W, H) {
  const [c, x, p] = base(W, H);
  p.begin("door/wall"); p.wash([[0, 0], [W, 0], [W, FLOOR_Y + 220], [0, FLOOR_Y + 220]], WALL, { alpha: .75, sharp: true, solid: true });
  planks(x, 0, 0, W, FLOOR_Y + 220, 68, WOOD_D, .12);
  // the open door: night outside, warm frame
  const DX = 40, DY = 520, DW = 330, DH = FLOOR_Y + 220 - DY;
  p.begin("door/night"); p.wash([[DX, DY], [DX + DW, DY], [DX + DW, DY + DH], [DX, DY + DH]], PAL.seaDeep, { alpha: 1, sharp: true, solid: true });
  const r = rng(5); x.fillStyle = "#F4EBD4"; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(DX + 20 + r() * (DW - 40), DY + 20 + r() * 420, 1 + r() * 2, 0, 7); x.fill(); }
  p.wash(ellPts(DX + 230, DY + 120, 34, 34, 20), "#F1E9C9", { alpha: 1, solid: true, over: true }); p.ring(DX + 230, DY + 120, 34, 34, { w: 2.4, color: "#F6F0DA" });
  p.wash([[DX, DY + DH - 260], [DX + DW, DY + DH - 320], [DX + DW, DY + DH], [DX, DY + DH]], "#162843", { alpha: 1, sharp: true, solid: true });
  p.begin("door/frame"); p.stroke([[DX - 14, DY + DH], [DX - 14, DY - 14], [DX + DW + 14, DY - 14], [DX + DW + 14, DY + DH]], { w: 14, color: WOOD_D, smooth: false, taper: 0 });
  p.stroke([[DX - 22, DY + DH], [DX - 22, DY - 22], [DX + DW + 22, DY - 22], [DX + DW + 22, DY + DH]], { w: 3, smooth: false });
  const leaf = [[DX + DW + 14, DY - 4], [DX + DW + 120, DY + 40], [DX + DW + 120, DY + DH - 30], [DX + DW + 14, DY + DH]];
  p.wash(leaf, WOOD, { alpha: .95, sharp: true }); p.stroke([...leaf, leaf[0]], { w: 3.2, smooth: false }); p.dot(DX + DW + 100, DY + DH / 2, 6, "#E3B64B");
  // a sign over the door
  p.begin("door/sign"); const sg = rrect(DX + 10, DY - 190, DW - 20, 120, 16);
  p.wash(sg, "#2E3632", { alpha: 1, solid: true, over: true }); p.blob(sg, { w: 3.4 });
  p.text("Welcome in", DX + DW / 2, DY - 112, { size: 56, font: "Caveat Brush", color: "#F4EBD4" });
  // floor + mat
  p.begin("door/floor"); p.wash([[0, FLOOR_Y + 220], [W, FLOOR_Y + 220], [W, H], [0, H]], FLOOR, { alpha: .8, sharp: true, solid: true });
  x.save(); x.globalAlpha = .28; x.strokeStyle = WOOD_D; x.lineWidth = 2; for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(W / 2 + i * 60, FLOOR_Y + 220); x.lineTo(W / 2 + i * 260, H); x.stroke(); } x.restore();
  p.stroke([[0, FLOOR_Y + 220], [W, FLOOR_Y + 220]], { w: 3.6, taper: .1 });
  const mat = [[DX + 10, FLOOR_Y + 300], [DX + DW + 60, FLOOR_Y + 300], [DX + DW + 90, FLOOR_Y + 380], [DX - 20, FLOOR_Y + 380]];
  p.wash(mat, "#A8463A", { alpha: .8, sharp: true }); p.stroke([...mat, mat[0]], { w: 3, smooth: false });
  return c;
}

export function limbo(W, H, tint = null) {
  const [c, x, p] = base(W, H);
  if (tint) { p.begin("limbo/tint"); p.wash([[0, 0], [W, 0], [W, H], [0, H]], tint, { alpha: .25, sharp: true, solid: true }); }
  p.begin("limbo/floor"); p.wash([[0, 1500], [W, 1500], [W, H], [0, H]], "#E2D3B6", { alpha: .7, sharp: true, solid: true });
  p.stroke([[60, 1500], [W - 60, 1500]], { w: 3, taper: .6 });
  return c;
}
