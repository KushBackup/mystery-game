// swatch.mjs — the cast and props on one page, at delivery size, before any film. `node swatch.mjs sheet 0,1`
import { run } from "./lib/film.mjs";
import { Pen } from "./lib/pen.mjs";
import { fibrePaper } from "./lib/textures.mjs";
import { friend, drink, phone, CAST, ORDER } from "./cast.mjs";

const W = 1080, H = 1920;
run({
  name: "swatch", W, H, sheetScale: Number(process.env.SC || .3), fps: 24, dur: 2, out: "out/swatch",
  setup(ctx) { return { paper: fibrePaper(W, H), pen: new Pen(ctx) }; },
  frame(ctx, t, i, S) {
    ctx.drawImage(S.paper, 0, 0); const p = S.pen; p.ctx = ctx;
    const faces = ["smile", "open", "smirk", "O", "grin", "sad"];
    const brows = ["none", "none", "furrow", "raised", "furrow", "worried"];
    ORDER.forEach((k, j) => { p.begin("sw/" + k, 1, { boil: 8, t });
      friend(p, 180 + (j % 3) * 360, 560 + Math.floor(j / 3) * 520, 1.45, CAST[k], { face: t < 1 ? "smile" : faces[j], brows: t < 1 ? "none" : brows[j], arms: [16, 40], bend: [0, 70], hold: { r: "drink", l: j === 2 ? "phone" : undefined }, look: t < 1 ? 0 : 4, glint: k === "riya" && t >= 1 ? 1 : 0 }, t); p.end(); });
    p.begin("sw/ghost", 1, { boil: 8, t }); friend(p, 180, 1700, 1.2, CAST.dev, { ghost: 1, face: "smile", arms: [40, 40] }, t); p.end();
    ["gin", "beer", "wine", "cocktail", "whisky"].forEach((d, j) => { p.begin("sw/d" + j, 1); drink(p, d, 420 + j * 120, 1560, 1.6); p.end(); });
    p.begin("sw/phone", 1); phone(p, 600, 1760, 1.2, null); p.end();
  },
});
