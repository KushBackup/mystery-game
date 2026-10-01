/**
 * CluePhoto: the CCTV still a player receives about the killer.
 *
 * `fact = { trait, group }` picks one of 25 scenes, one per trait group in
 * src/data/traits.js (the list is CLUE_SCENES in ./clueScenes.js). Each scene
 * is 64x48 pixels, painted once and cached; then the surveillance treatment
 * goes on top: a green or blue tint, seeded grain, scanlines, a dithered
 * vignette, corner brackets, the cam label, the timestamp and a blinking REC.
 *
 * Nothing is random at render time. `seed` (any string, e.g. the clue id)
 * drives the grain, the tint and the default cam/stamp, so a photo looks the
 * same on every phone and on every re-render.
 *
 * The scenes show the GROUP, not a raw answer: "a dark top" is a torso in a
 * dark shirt, "a birthday in the cold months" is a calendar with Oct-Mar
 * marked. Keep new scenes to that rule, or a photo says more than its clue.
 */
import {
  bayer,
  createGrid,
  fillCircle,
  fillEllipse,
  fillRect,
  getPx,
  gridToPaths,
  hashString,
  line,
  mix,
  mulberry32,
  pathEls,
  ringEllipse,
  setPx,
  shade,
  stamp,
  textInto,
  textWidth,
} from './pixels.js';
import { CLUE_SCENES } from './clueScenes.js';

const W = 64;
const H = 48;

/* ----------------------------------------------------------- primitives */

function vgrad(g, x, y, w, h, colors) {
  const n = colors.length;
  for (let j = 0; j < h; j += 1) {
    const t = (j / Math.max(1, h - 1)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(t));
    const f = t - i;
    for (let k = 0; k < w; k += 1) {
      setPx(g, x + k, y + j, f > bayer(x + k, y + j) ? colors[i + 1] : colors[i]);
    }
  }
}

/** Dithered soft glow: lightens toward `c` inside an ellipse. */
function glow(g, cx, cy, rx, ry, c, strength = 0.6) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y += 1) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x += 1) {
      const d = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
      if (d < 1 && (1 - d) * strength > bayer(x, y)) setPx(g, x, y, c);
    }
  }
}

/* ------------------------------------------------------------- the top */

const SKIN = { hi: '#9A6A50', mid: '#7E5440', lo: '#5E3C2E', dk: '#432A20' };

const SHIRTS = {
  dark: { hi: '#4D5875', mid: '#313950', lo: '#1F2537', dk: '#141826', rim: '#8793B3' },
  pale: { hi: '#F7F5EE', mid: '#DCD8CC', lo: '#B1ADA1', dk: '#8C887C', rim: '#FFFFFF' },
  vivid: { hi: '#FF5B44', mid: '#E23A2C', lo: '#AA261D', dk: '#7A1A13', rim: '#FF9A80' },
  plain: { hi: '#7096D8', mid: '#4F74B8', lo: '#37538A', dk: '#243A66', rim: '#A8C2F2' },
};

function flower(g, x, y, petal, core, mask) {
  const pts = [[0, -1], [-1, 0], [1, 0], [0, 1]];
  pts.forEach(([dx, dy]) => {
    if (!mask || getPx(mask, x + dx, y + dy)) setPx(g, x + dx, y + dy, petal);
  });
  if (!mask || getPx(mask, x, y)) setPx(g, x, y, core);
}

function sceneTop(group) {
  const p = SHIRTS[group];
  const g = createGrid(W, H);
  vgrad(g, 0, 0, W, H, ['#56607A', '#444C60', '#343A4A', '#2A2F3C']);
  glow(g, 27, -2, 26, 14, '#6E7890', 0.7);
  // a door on the left
  fillRect(g, 1, 6, 9, 42, '#687088');
  fillRect(g, 2, 7, 7, 41, '#20242E');
  setPx(g, 7, 28, '#8A92A6');

  const cx = 27;
  // jaw and chin, the face is out of frame
  const jaw = [8, 8, 8, 7, 7, 6, 4];
  jaw.forEach((hw, y) => {
    for (let dx = -hw; dx <= hw; dx += 1) {
      setPx(g, cx + dx, y, dx < -3 ? SKIN.hi : dx > 3 ? SKIN.lo : SKIN.mid);
    }
  });
  line(g, cx - 2, 2, cx + 1, 2, '#3E2419');
  for (let y = 6; y <= 12; y += 1) {
    for (let dx = -3; dx <= 3; dx += 1) setPx(g, cx + dx, y, y < 8 ? SKIN.dk : dx < 0 ? SKIN.mid : SKIN.lo);
  }

  const mask = createGrid(W, H);
  for (let y = 10; y < H; y += 1) {
    const half = y < 16 ? [7, 11, 14, 16, 18, 19][y - 10] : 19 + Math.floor((y - 16) / 14);
    for (let dx = -half; dx <= half; dx += 1) {
      const ax = Math.abs(dx);
      const open = 14 - y; // the V of the neck
      if (y <= 14 && ax <= open) {
        setPx(g, cx + dx, y, SKIN.lo);
        continue;
      }
      let c = dx < -5 ? p.hi : dx > 6 ? p.lo : p.mid;
      if (y <= 15 && ax === open + 1) c = p.dk;
      if (y >= 18 && ax === 14) c = p.dk;
      if (y >= 18 && ax >= 15) c = dx < 0 ? p.hi : p.lo;
      setPx(g, cx + dx, y, c);
      setPx(mask, cx + dx, y, 1);
    }
  }
  // folds
  line(g, cx - 12, 22, cx - 8, 31, p.lo);
  line(g, cx + 11, 21, cx + 8, 33, p.dk);
  line(g, cx - 3, 40, cx + 3, 44, p.lo);

  if (group === 'vivid') {
    for (let y = 12; y < H; y += 6) {
      for (let x = cx - 22 + ((y / 6) % 2) * 4; x < cx + 24; x += 8) {
        flower(g, x, y, '#FFD23A', '#FFFFFF', mask);
        if (getPx(mask, x + 2, y + 2)) setPx(g, x + 2, y + 2, '#2FB35A');
        if (getPx(mask, x + 3, y + 2)) setPx(g, x + 3, y + 2, '#2FB35A');
      }
    }
  } else {
    for (let y = 15; y < H; y += 1) setPx(g, cx + 1, y, p.dk);
    [19, 26, 33, 40].forEach((y) => setPx(g, cx + 2, y, p.rim));
    // chest pocket
    for (let x = cx - 11; x <= cx - 5; x += 1) {
      setPx(g, x, 21, p.dk);
      setPx(g, x, 20, p.hi);
    }
    for (let y = 21; y <= 27; y += 1) {
      setPx(g, cx - 11, y, p.dk);
      setPx(g, cx - 5, y, p.dk);
    }
    for (let x = cx - 11; x <= cx - 5; x += 1) setPx(g, x, 27, p.dk);
  }
  // rim light down the lit side
  for (let y = 10; y < H; y += 1) {
    for (let x = 1; x < W; x += 1) if (getPx(mask, x, y) && !getPx(mask, x - 1, y)) setPx(g, x, y, p.rim);
  }

  // ENHANCE box with a magnified swatch of the fabric
  const bx = 45;
  const by = 11;
  const bs = 16;
  for (let y = by; y < by + bs; y += 1) {
    for (let x = bx; x < bx + bs; x += 1) {
      const edge = x === bx || y === by || x === bx + bs - 1 || y === by + bs - 1;
      if (edge) {
        setPx(g, x, y, '#EAF3FF');
        continue;
      }
      const u = x - bx;
      const v = y - by;
      let c;
      if (group === 'vivid') {
        c = p.mid;
      } else if (group === 'plain') {
        c = v % 4 === 0 ? mix(p.mid, p.hi, 0.35) : p.mid;
      } else {
        const weave = (Math.floor(u / 2) + Math.floor(v / 2)) % 2 === 0;
        c = weave ? p.mid : p.lo;
        if ((u + v * 3) % 11 === 0) c = p.hi;
      }
      setPx(g, x, y, c);
    }
  }
  if (group === 'vivid') {
    stamp(
      g,
      ['..YY.', '.YYYY', 'YYWYY', '.YYYY', '..YY.'],
      { Y: '#FFD23A', W: '#FFFFFF' },
      bx + 3,
      by + 3,
    );
    stamp(g, ['.GG', 'GGG', 'GG.'], { G: '#2FB35A' }, bx + 10, by + 9);
    stamp(g, ['.Y.', 'YWY', '.Y.'], { Y: '#FFD23A', W: '#FFFFFF' }, bx + 10, by + 2);
    stamp(g, ['GG', '.G'], { G: '#2FB35A' }, bx + 3, by + 11);
  }
  for (let x = cx + 10; x < bx; x += 2) setPx(g, x, 24 - Math.round((x - cx - 10) * 0.35), '#EAF3FF');
  return g;
}

/* --------------------------------------------------------- the glasses */

function sceneGlasses(group) {
  const g = createGrid(W, H);
  vgrad(g, 0, 0, W, H, ['#3E4556', '#343A4A', '#2A2F3C']);
  // bright window behind: the face is backlit
  vgrad(g, 8, 0, 48, 32, ['#C9D7E6', '#AFC2D6', '#98AEC6']);
  fillRect(g, 31, 0, 2, 32, '#5A6272');
  fillRect(g, 8, 15, 48, 1, '#5A6272');
  fillRect(g, 7, 32, 50, 2, '#4A5060');

  const cx = 32;
  // shoulders
  for (let y = 38; y < H; y += 1) {
    const hw = 10 + (y - 38) * 2;
    for (let dx = -hw; dx <= hw; dx += 1) setPx(g, cx + dx, y, dx < -6 ? '#2E323C' : '#1E2129');
  }
  fillRect(g, cx - 4, 33, 9, 7, SKIN.lo);
  for (let y = 37; y < 42; y += 1) for (let dx = -3; dx <= 3; dx += 1) if (Math.abs(dx) >= 41 - y) setPx(g, cx + dx, y, '#E6E6E6');
  // head
  fillEllipse(g, cx, 23, 10.5, 13.5, SKIN.mid);
  for (let y = 9; y < 38; y += 1) {
    for (let x = cx - 12; x <= cx + 12; x += 1) {
      if (getPx(g, x, y) === SKIN.mid && x > cx + 4) setPx(g, x, y, SKIN.lo);
      if (getPx(g, x, y) === SKIN.mid && x < cx - 6 && y > 14) setPx(g, x, y, SKIN.hi);
    }
  }
  // ears
  fillRect(g, cx - 12, 21, 2, 5, SKIN.mid);
  fillRect(g, cx + 11, 21, 2, 5, SKIN.lo);
  // hair
  fillEllipse(g, cx, 13, 11, 6.5, '#1C1612');
  fillRect(g, cx - 11, 13, 2, 7, '#1C1612');
  fillRect(g, cx + 10, 13, 2, 7, '#1C1612');
  for (let x = cx - 6; x <= cx + 6; x += 1) setPx(g, x, 16 + (x % 3 === 0 ? 1 : 0), '#1C1612');
  for (let x = cx - 8; x <= cx - 2; x += 1) setPx(g, x, 9, '#3A2E26');
  // nose and mouth
  line(g, cx + 1, 23, cx + 1, 28, SKIN.dk);
  setPx(g, cx, 29, SKIN.dk);
  line(g, cx - 3, 32, cx + 3, 32, '#4A2A22');
  setPx(g, cx - 3, 31, SKIN.hi);

  if (group === 'glasses') {
    const F = '#0A0B10';
    // brows above the frames
    line(g, cx - 9, 18, cx - 3, 18, '#1C1612');
    line(g, cx + 3, 18, cx + 9, 18, '#1C1612');
    // lenses
    [cx - 10, cx + 2].forEach((lx) => {
      for (let y = 20; y <= 26; y += 1) {
        for (let x = lx; x <= lx + 8; x += 1) {
          const edge = y === 20 || y === 26 || x === lx || x === lx + 8;
          setPx(g, x, y, edge ? F : '#7F98B0');
        }
      }
      // eye behind the glass
      setPx(g, lx + 4, 23, '#1A1210');
      setPx(g, lx + 3, 23, '#C8D4DE');
      // glints
      line(g, lx + 2, 25, lx + 6, 21, '#FFFFFF');
      setPx(g, lx + 7, 24, '#E6F2FF');
    });
    line(g, cx - 1, 22, cx + 1, 22, F);
    line(g, cx - 12, 22, cx - 10, 22, F);
    line(g, cx + 10, 22, cx + 12, 22, F);
    // sparkle
    stamp(g, ['..W..', '..W..', 'WWWWW', '..W..', '..W..'], { W: '#FFFFFF' }, cx + 9, 15);
    setPx(g, cx + 11, 17, '#FFFFFF');
  } else {
    // bare eyes: clear whites, brows, nothing on the bridge
    line(g, cx - 8, 19, cx - 3, 19, '#1C1612');
    line(g, cx + 3, 19, cx + 8, 19, '#1C1612');
    [cx - 7, cx + 4].forEach((ex) => {
      fillRect(g, ex, 22, 4, 2, '#E8E2D6');
      fillRect(g, ex + 1, 22, 2, 2, '#1A1210');
      setPx(g, ex + 1, 22, '#FFFFFF');
      line(g, ex, 21, ex + 3, 21, SKIN.dk);
    });
    // light across the bare bridge of the nose
    setPx(g, cx, 22, SKIN.hi);
    setPx(g, cx + 1, 21, SKIN.hi);
  }
  return g;
}

/* --------------------------------------------------------------- shoes */

function tiles(g, a = '#7C8496', b = '#707889', grout = '#565D6D') {
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const tx = Math.floor((x + 3) / 11);
      const ty = Math.floor((y + 2) / 11);
      const gl = (x + 3) % 11 === 0 || (y + 2) % 11 === 0;
      setPx(g, x, y, gl ? grout : (tx + ty) % 2 ? a : b);
    }
  }
}

const SOLE_PRINT = [
  '.XXX.',
  'XXXXX',
  'XXXXX',
  'XXXXX',
  'XXXXX',
  '.XXXX',
  '..XXX',
  '..XXX',
  '.XXXX',
  '.XXXX',
  '.XXXX',
  '..XX.',
];

/** A shoe print, 5x12: whole sole unless `gap` (a heel strike), `tread` striped. */
function print(g, x, y, flip, c, { gap = false, tread = false } = {}) {
  SOLE_PRINT.forEach((row, j) => {
    if (gap && (j === 6 || j === 7)) return;
    for (let i = 0; i < 5; i += 1) {
      const ch = row[flip ? 4 - i : i];
      if (ch !== 'X') continue;
      if (tread && j % 2 === 1 && i > 0 && i < 4) continue;
      setPx(g, x + i - 2, y + j - 6, c);
    }
  });
}

function evidenceTent(g, x, y, n) {
  stamp(
    g,
    ['..YYY..', '.YYYYY.', '.YYYYY.', 'YYYYYYY', 'YYYYYYY', 'yyyyyyy', '.kkkkkk'],
    { Y: '#FFCC33', y: '#C79A1A', k: '#3A3F4C' },
    x,
    y,
  );
  textInto(g, String(n), x + 2, y + 1, '#16181D');
}

const SNEAKER = [
  '....KKKKK.....................',
  '...KCCCCK.....................',
  '...KWWWWKKK...................',
  '...KWWWWWLWKK.................',
  '...KWWWWWWLWLKK...............',
  '..KWWWWWSWWWLWLKK.............',
  '..KWWWWSSWWWWWLWLKKK..........',
  '..KWWWSSWWWWWWWWLWWWKKK.......',
  '..KWWSSWWWWWSSWWWWWWWWWKKK....',
  '.KWWSSWWWWSSSWWWWWWWWWWWWWKK..',
  '.KwwwwwwwwwwwwwwwwwwwwwwwtttK.',
  'KRRRRRRRRRRRRRRRRRRRRRRRRRRRRK',
  'KrrrrrrrrrrrrrrrrrrrrrrrrrrrrK',
  '.KTKTKTKTKTKTKTKTKTKTKTKTKTKK.',
];
const SANDAL = [
  '.NNNN.........',
  '.FFFF.NN......',
  '.FFFF.FF.NN...',
  'sFFFFsFFsFFsN.',
  'sFFFFfFFfFFfFs',
  'sFFFFFFFFFFFFs',
  'sFFFFFFFFFFFFs',
  'sRRRRRRRRRRRRs',
  'sRRRRRRRRRRRRs',
  'srrrrrrrrrrrrs',
  'sFFFFFFFFFFFfs',
  'sFFFFFFFFFFffs',
  'sSFFFFFFFFFfSs',
  'sSFFFFFFFFfSSs',
  'sSSFFFFFFFfSSs',
  'sSSFFFFFFfSSSs',
  'sSSFFFFFFfSSSs',
  'sSSFFFFFFfSSSs',
  'sSSRRRRRRRRSSs',
  'sSRRRRRRRRRRSs',
  'sSrrrrrrrrrrSs',
  'sSSFFFFFFfSSSs',
  'sSSFFFFFFfSSSs',
  '.sSFFFFFFfSSs.',
  '.sSSFFFFfSSSs.',
  '..sSSSSSSSSs..',
  '...ssssssss...',
];
const OXFORD = [
  '.....KKKKK.....................',
  '....KBBBBBK....................',
  '....KBbBBBBKKK.................',
  '....KBbBBBBBBLKK...............',
  '...KBbbBBBBBLBLBKK.............',
  '...KBbBBBBBBBBBBBBKKK..........',
  '...KBBBBBBBBBBBBBBBBBKKK.......',
  '...KBBBBBBBBBBBBBBHHHHBBBKK....',
  '...KBBBBBBBBBBBBBBBBBBBHHBBK...',
  '...KBBBBBBBBBBBBBBBBBBBBBBBBK..',
  '...KWWWWWWWWWWWWWWWWWWWWWWWWWK.',
  '...KEEEEEK..........KssssssssK.',
  '...KEEEEEK...........KKKKKKKK..',
  '...KeeeeeK.....................',
  '...KKKKKKK.....................',
];

function sceneShoes(group) {
  const g = createGrid(W, H);
  tiles(g);
  const wet = '#3A404E';
  if (group === 'rubber') {
    fillEllipse(g, 42, 26, 16, 2.2, '#525A6A');
    print(g, 9, 30, false, '#2E333F', { tread: true });
    print(g, 17, 36, true, '#2E333F', { tread: true });
    stamp(
      g,
      SNEAKER,
      {
        K: '#15181E',
        C: '#FF7A59',
        W: '#EEF0F4',
        w: '#C3C8D2',
        S: '#3D8BF2',
        L: '#7D8696',
        R: '#FAFAFA',
        r: '#B6BCC6',
        T: '#3A3F4C',
        t: '#DADDE4',
      },
      26,
      12,
    );
    evidenceTent(g, 4, 20, 1);
  } else if (group === 'leather') {
    // a trail of heel strikes: the heel lands apart from the sole
    [[9, 36, false], [18, 29, true], [27, 38, false]].forEach(([x, y, f]) => print(g, x, y, f, wet, { gap: true }));
    fillEllipse(g, 45, 25, 15, 2, '#525A6A');
    stamp(
      g,
      OXFORD,
      {
        K: '#08090C',
        B: '#23252E',
        b: '#3A3E4C',
        H: '#9AA3B8',
        L: '#5A6070',
        W: '#6E5C48',
        s: '#2A1E16',
        E: '#5A3C26',
        e: '#3E2818',
      },
      29,
      11,
    );
    // click: the heel on tile
    [[31, 24], [30, 25], [29, 26], [39, 24], [40, 25], [41, 26]].forEach(([x, y]) => setPx(g, x, y, '#EAF3FF'));
  } else if (group === 'open') {
    // two feet in sandals, from above: toes, nails, straps
    const legend = {
      N: '#FF8A6A',
      F: '#D29470',
      f: '#A86C4E',
      s: '#4A2C16',
      S: '#9A6838',
      R: '#E2553A',
      r: '#A83A24',
    };
    const shadowInk = Object.fromEntries(Object.keys(legend).map((k) => [k, '#525A6A']));
    stamp(g, SANDAL, shadowInk, 18, 10, false);
    stamp(g, SANDAL, shadowInk, 34, 11, true);
    stamp(g, SANDAL, legend, 17, 9, false);
    stamp(g, SANDAL, legend, 33, 10, true);
  } else {
    // flat: a clean walking trail, whole soles, no heel gap, and a scale
    [[12, 34, false], [21, 26, true], [30, 33, false], [39, 24, true], [48, 31, false]].forEach(([x, y, f]) =>
      print(g, x, y, f, wet),
    );
    // forensic ruler
    fillRect(g, 6, 5, 40, 5, '#FFCC33');
    for (let x = 6; x < 46; x += 1) {
      setPx(g, x, 9, '#C79A1A');
      if ((x - 6) % 2 === 0) setPx(g, x, 5, '#16181D');
      if ((x - 6) % 10 === 0) {
        setPx(g, x, 6, '#16181D');
        setPx(g, x, 7, '#16181D');
      }
    }
    evidenceTent(g, 52, 38, 2);
  }
  return g;
}

/* -------------------------------------------------------------- drinks */

const GLASS = '#C6D6E2';
const GLINT = '#FFFFFF';

function bar(g) {
  vgrad(g, 0, 0, W, 34, ['#3A2F42', '#2E2536', '#241D2B']);
  // back shelf of bottles, out of focus
  const bottles = [
    [3, '#3A6A48'], [8, '#7A5424'], [13, '#6E8088'], [19, '#5A2E3A'], [46, '#7A5424'],
    [51, '#3A6A48'], [56, '#6E8088'], [60, '#8A6A2A'],
  ];
  bottles.forEach(([x, c], i) => {
    const top = 4 + (i % 3);
    fillRect(g, x + 1, top, 2, 3, c);
    fillRect(g, x, top + 3, 4, 17 - top, c);
    setPx(g, x, top + 5, shade(c, 0.35));
    setPx(g, x, top + 6, shade(c, 0.35));
  });
  fillRect(g, 0, 20, W, 2, '#5A4030');
  fillRect(g, 0, 22, W, 1, '#2A1E16');
  // lamp bokeh
  [[10, 27], [24, 26], [55, 28]].forEach(([x, y]) => fillCircle(g, x, y, 1.6, '#6A5470'));
  // counter surface, front edge and panel
  vgrad(g, 0, 33, W, 8, ['#6A4222', '#7E5230', '#8A5C36']);
  for (let x = 0; x < W; x += 1) {
    if ((x * 7) % 13 === 0) setPx(g, x, 35 + (x % 3), '#5E3A1E');
  }
  fillRect(g, 0, 41, W, 1, '#A87444');
  fillRect(g, 0, 42, W, 6, '#3E2818');
  for (let x = 5; x < W; x += 12) fillRect(g, x, 43, 1, 5, '#2A1A10');
}

function pint(g, x, top, bottom, w) {
  for (let y = top; y <= bottom; y += 1) {
    const inset = Math.floor(((y - top) / (bottom - top)) * 1.5);
    const l = x + inset;
    const r = x + w - 1 - inset;
    for (let i = l; i <= r; i += 1) {
      let c;
      if (i === l || i === r) c = GLASS;
      else if (y <= top + 3) c = y === top ? '#FFFFFF' : i > r - 3 ? '#E4D8BC' : '#FFF4DC';
      else if (y >= bottom - 1) c = '#B8CAD6';
      else c = i > r - 3 ? '#B87A22' : '#E3A032';
      setPx(g, i, y, c);
    }
  }
  // bubbles and glint
  [[2, 7], [4, 12], [3, 16], [6, 10], [5, 19]].forEach(([dx, dy]) => {
    if (top + dy < bottom - 2) setPx(g, x + dx + 1, top + dy, '#FFD27A');
  });
  for (let y = top + 5; y < bottom - 3; y += 1) if (y % 3) setPx(g, x + 2, y, '#F6D08A');
  setPx(g, x + w - 3, top + 4, '#FFF4DC');
}

function wineGlass(g, cx, top, base, { wine = true } = {}) {
  const bowlH = 13;
  for (let y = top; y < top + bowlH; y += 1) {
    const v = (y - top) / bowlH;
    const hw = Math.round(6 * Math.sqrt(Math.max(0, 1 - Math.pow(v * 0.95, 2.4))) + (v < 0.3 ? 0 : 0));
    for (let dx = -hw; dx <= hw; dx += 1) {
      const edge = Math.abs(dx) === hw || y === top + bowlH - 1;
      let c = edge ? GLASS : '#4A4058';
      if (!edge && wine && y >= top + 6) c = y === top + 6 ? '#C23A55' : dx > 2 ? '#6E1422' : '#8E1B2E';
      setPx(g, cx + dx, y, c);
    }
  }
  setPx(g, cx - 4, top + 2, GLINT);
  setPx(g, cx - 4, top + 3, GLINT);
  setPx(g, cx - 5, top + 5, GLINT);
  for (let y = top + bowlH; y < base - 1; y += 1) setPx(g, cx, y, GLASS);
  fillRect(g, cx - 4, base - 1, 9, 1, GLASS);
  fillRect(g, cx - 3, base - 2, 7, 1, '#9FB4C4');
}

function sceneDrink(group) {
  const g = createGrid(W, H);
  bar(g);
  if (group === 'hops') {
    pint(g, 25, 12, 38, 14);
    fillEllipse(g, 45, 39, 4, 1.2, '#5E3A1E');
  } else if (group === 'grape') {
    wineGlass(g, 29, 12, 38);
    ringEllipse(g, 46, 38, 5, 1.6, '#6E1422');
    setPx(g, 34, 19, '#8E1B2E');
    setPx(g, 34, 20, '#8E1B2E');
  } else if (group === 'brewed') {
    pint(g, 14, 14, 38, 12);
    wineGlass(g, 44, 15, 38);
  } else if (group === 'spirit') {
    // a clear bottle and a shot
    fillRect(g, 40, 4, 4, 2, '#C0A060');
    fillRect(g, 40, 6, 4, 7, '#9FC4B8');
    for (let y = 13; y <= 38; y += 1) {
      const hw = y < 16 ? 2 + (y - 13) : 5;
      for (let dx = -hw; dx < hw; dx += 1) {
        const edge = dx === -hw || dx === hw - 1;
        setPx(g, 42 + dx, y, edge ? '#7FA89A' : y > 18 ? '#CFE6DA' : '#9FC4B8');
      }
    }
    fillRect(g, 38, 24, 9, 7, '#EDE2C8');
    fillRect(g, 38, 26, 9, 2, '#1E56B0');
    setPx(g, 38, 20, GLINT);
    setPx(g, 38, 21, GLINT);
    for (let y = 29; y <= 38; y += 1) {
      const inset = Math.floor((y - 29) / 4);
      for (let x = 22 + inset; x <= 29 - inset; x += 1) {
        const edge = x === 22 + inset || x === 29 - inset || y >= 37;
        setPx(g, x, y, edge ? GLASS : y <= 30 ? '#FFFFFF' : '#D8EEF0');
      }
    }
    setPx(g, 24, 32, GLINT);
  } else if (group === 'strong') {
    // squat brown bottle
    fillRect(g, 45, 5, 4, 3, '#C8A070');
    fillRect(g, 45, 8, 4, 5, '#5A2E10');
    fillRect(g, 40, 13, 14, 26, '#5A2E10');
    fillRect(g, 41, 13, 1, 26, '#8A4A1E');
    fillRect(g, 41, 22, 12, 9, '#E8DCC0');
    fillRect(g, 41, 24, 12, 1, '#B8322A');
    fillRect(g, 44, 27, 6, 1, '#6A5A48');
    // a heavy rocks glass, neat, no ice, no mixer
    for (let y = 25; y <= 38; y += 1) {
      for (let x = 20; x <= 35; x += 1) {
        const edge = x === 20 || x === 35;
        let c = '#4A4058';
        if (edge) c = GLASS;
        else if (y >= 35) c = '#A8BCCC';
        else if (y === 30) c = '#E8A050';
        else if (y > 30) c = x > 31 ? '#8A4A14' : '#B8661E';
        setPx(g, x, y, c);
      }
    }
    fillRect(g, 20, 25, 16, 1, GLASS);
    for (let y = 26; y < 34; y += 1) if (y % 3) setPx(g, 22, y, GLINT);
  } else if (group === 'clear') {
    // coupe with a clear drink, lime and botanicals
    for (let y = 13; y <= 23; y += 1) {
      const hw = Math.round(11 - (y - 13) * 1.0);
      for (let dx = -hw; dx <= hw; dx += 1) {
        const edge = Math.abs(dx) === hw || y === 13;
        let c = edge ? GLASS : '#DDF3EC';
        if (!edge && y === 14) c = '#FFFFFF';
        setPx(g, 31 + dx, y, c);
      }
    }
    setPx(g, 26, 16, '#2A3A6A');
    setPx(g, 33, 18, '#2A3A6A');
    line(g, 28, 20, 36, 15, '#2E9E47');
    [[30, 18], [32, 17], [34, 16], [31, 20], [33, 19]].forEach(([x, y]) => setPx(g, x, y, '#4CD964'));
    for (let y = 24; y <= 37; y += 1) setPx(g, 31, y, GLASS);
    fillRect(g, 26, 38, 11, 1, GLASS);
    // lime wedge on the rim
    stamp(
      g,
      ['..GGGG.', '.GLLLLG', 'GLlLlLG', 'GLLlLLG', '.GGGGG.'],
      { G: '#3E9E2E', L: '#C8F08A', l: '#E8FFC0' },
      38,
      9,
    );
    setPx(g, 23, 15, GLINT);
    setPx(g, 24, 16, GLINT);
  } else if (group === 'sober') {
    // a soda can with a straw
    const x0 = 27;
    for (let y = 15; y <= 38; y += 1) {
      for (let x = x0; x <= x0 + 10; x += 1) {
        let c = x < x0 + 3 ? '#F05A48' : x > x0 + 7 ? '#A8261E' : '#D9362B';
        if (y <= 16 || y >= 37) c = x < x0 + 4 ? '#DDE2EA' : '#9AA2B0';
        const wave = 24 + Math.round(Math.sin((x - x0) * 0.7) * 1.2);
        if (y >= wave && y <= wave + 2 && y > 16 && y < 37) c = x > x0 + 7 ? '#C8CCD4' : '#F4F4F4';
        setPx(g, x, y, c);
      }
    }
    fillRect(g, x0 + 1, 14, 9, 1, '#C8CED8');
    // straw
    for (let y = 5; y <= 14; y += 1) setPx(g, x0 + 6, y, y % 3 === 0 ? '#3D8BF2' : '#F4F4F4');
    setPx(g, x0 + 7, 4, '#F4F4F4');
    setPx(g, x0 + 8, 3, '#3D8BF2');
    setPx(g, x0 + 9, 3, '#F4F4F4');
    // condensation
    [[1, 20], [2, 29], [9, 31], [4, 33], [8, 19]].forEach(([dx, y]) => setPx(g, x0 + dx, y, '#FFC0B8'));
    fillEllipse(g, 42, 39, 3, 1, '#9A6A42');
  }
  return g;
}

/* ------------------------------------------------------------ calendar */

const MONTHS = 'JFMAMJJASOND';
// 3-wide M and N so an initial fits its month box (the font's are wider)
const NARROW = {
  M: ['X.X', 'XXX', 'XXX', 'X.X', 'X.X'],
  N: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'],
};
const SEASONS = {
  early: { label: 'JAN-JUN', on: [0, 1, 2, 3, 4, 5] },
  late: { label: 'JUL-DEC', on: [6, 7, 8, 9, 10, 11] },
  cool: { label: 'OCT-MAR', on: [9, 10, 11, 0, 1, 2] },
  warm: { label: 'APR-SEP', on: [3, 4, 5, 6, 7, 8] },
};
const SEASON_ICON = {
  cool: {
    rows: [
      '....W....',
      '..W.W.W..',
      '...WWW...',
      'W..WsW..W',
      'WWWsSsWWW',
      'W..WsW..W',
      '...WWW...',
      '..W.W.W..',
      '....W....',
    ],
    legend: { W: '#3D8BF2', s: '#1E56B0', S: '#12306B' },
  },
  warm: {
    rows: [
      '....Y....',
      '.Y..Y..Y.',
      '..OOOOO..',
      '..OYYYO..',
      'YYOYYYOYY',
      '..OYYYO..',
      '..OOOOO..',
      '.Y..Y..Y.',
      '....Y....',
    ],
    legend: { Y: '#FFCC33', O: '#FF9A1F' },
  },
  early: {
    rows: [
      '.GG...GG.',
      'GLLG.GLLG',
      '.GLLGLLG.',
      '..GGSGG..',
      '....S....',
      '....S....',
      '.BBBBBBB.',
      'BbbbbbbbB',
      '.BBBBBBB.',
    ],
    legend: { G: '#2E9E47', L: '#6FE07A', S: '#3E9E2E', B: '#6A4222', b: '#8A5C36' },
  },
  late: {
    rows: [
      '....O....',
      '.O..O..O.',
      '.OOOOOOO.',
      '..OOrOO..',
      'OOOOrOOOO',
      '.OOrOrOO.',
      '..OOrOO..',
      '....r....',
      '....r....',
    ],
    legend: { O: '#E8701E', r: '#8A3A12' },
  },
};

function sceneSeason(group) {
  const s = SEASONS[group];
  const g = createGrid(W, H);
  vgrad(g, 0, 0, W, H, ['#57504A', '#4A443E', '#3A3530']);
  for (let y = 2; y < H; y += 5) for (let x = (y * 3) % 7; x < W; x += 9) setPx(g, x, y, '#433D37');
  const px = 13;
  const py = 5;
  const pw = 38;
  // drop shadow on the wall
  fillRect(g, px + 2, py + 2, pw, 40, '#2E2822');
  // page with a torn foot
  for (let y = py; y < py + 40; y += 1) {
    for (let x = px; x < px + pw; x += 1) {
      const tear = y >= py + 38 - ((x * 5) % 3);
      if (!tear) setPx(g, x, y, x > px + pw - 4 ? '#DCD4C2' : '#EFE8D8');
    }
  }
  // binding and header
  fillRect(g, px, py, pw, 9, '#C8392B');
  fillRect(g, px, py + 8, pw, 1, '#9A2A20');
  [px + 5, px + 13, px + pw - 14, px + pw - 6].forEach((x) => fillRect(g, x, py, 2, 1, '#2A1A18'));
  fillRect(g, 32, 2, 1, 3, '#2A2A2A');
  const tw = textWidth(s.label);
  textInto(g, s.label, px + Math.floor((pw - tw) / 2), py + 2, '#FFF4E4');
  // twelve months, the group's six marked
  for (let i = 0; i < 12; i += 1) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const bx = px + 2 + col * 6;
    const by = py + 11 + row * 9;
    const on = s.on.includes(i);
    for (let y = by; y < by + 7; y += 1) {
      for (let x = bx; x < bx + 5; x += 1) {
        const edge = x === bx || x === bx + 4 || y === by || y === by + 6;
        if (on) setPx(g, x, y, '#D9362B');
        else if (edge) setPx(g, x, y, '#B8B0A0');
      }
    }
    const ink = on ? '#FFF4E4' : '#8A8272';
    const narrow = NARROW[MONTHS[i]];
    if (narrow) stamp(g, narrow, { X: ink }, bx + 1, by + 1);
    else textInto(g, MONTHS[i], bx + 1, by + 1, ink);
  }
  const icon = SEASON_ICON[group];
  stamp(g, icon.rows, icon.legend, px + Math.floor((pw - 9) / 2), py + 29);
  return g;
}

/* ------------------------------------------------------------ siblings */

function person(g, cx, foot, h, shirt, hair, skin = '#C98A66') {
  const hw = h >= 18 ? 5 : 4;
  const top = foot - h;
  const x0 = cx - Math.floor(hw / 2);
  fillRect(g, x0, top, hw, hw, skin);
  fillRect(g, x0, top, hw, 1, hair);
  setPx(g, x0, top + 1, hair);
  setPx(g, x0 + hw - 1, top + 1, hair);
  setPx(g, x0 + 1, top + 2, '#2A1A14');
  setPx(g, x0 + hw - 2, top + 2, '#2A1A14');
  const bodyH = Math.round((h - hw) * 0.5);
  const bw = hw + 2;
  const bx = cx - Math.floor(bw / 2);
  fillRect(g, bx, top + hw, bw, bodyH, shirt);
  fillRect(g, bx + bw - 1, top + hw, 1, bodyH, shade(shirt, -0.25));
  setPx(g, bx - 1 + 0, top + hw + bodyH, skin);
  setPx(g, bx + bw - 1, top + hw + bodyH, skin);
  const legH = h - hw - bodyH;
  const legW = hw >= 5 ? 2 : 1;
  fillRect(g, cx - legW - (hw >= 5 ? 0 : 0), top + hw + bodyH, legW, legH, '#2E3548');
  fillRect(g, cx + 1, top + hw + bodyH, legW, legH, '#2E3548');
  fillRect(g, cx - legW - 1, foot - 1, legW + 1, 1, '#16181D');
  fillRect(g, cx + 1, foot - 1, legW + 1, 1, '#16181D');
  return { cx, cy: foot - h / 2, h };
}

function sceneSiblings(group) {
  const g = createGrid(W, H);
  vgrad(g, 0, 0, W, H, ['#4A4652', '#3E3A44', '#322F38']);
  // frame
  fillRect(g, 5, 4, 54, 38, '#4A2E18');
  fillRect(g, 6, 5, 52, 36, '#8A5C35');
  fillRect(g, 7, 6, 50, 34, '#6B4526');
  // the photo
  vgrad(g, 9, 8, 46, 22, ['#D8C8A8', '#C8B696', '#B8A585']);
  vgrad(g, 9, 30, 46, 8, ['#9A8A6E', '#8A7A60']);
  glow(g, 32, 16, 18, 10, '#E6D8BA', 0.5);
  const foot = 36;
  const red = '#FF3B30';
  let ring = [];
  if (group === 'firstborn' || group === 'younger') {
    const who = [
      person(g, 17, foot, 24, '#3E6AA8', '#2A1A12'),
      person(g, 27, foot, 20, '#6E8A3A', '#3A2414'),
      person(g, 36, foot, 16, '#B8472E', '#2A1A12'),
      person(g, 44, foot, 12, '#D8A030', '#5A3A1A'),
    ];
    ring = group === 'firstborn' ? [who[0]] : [who[2]];
  } else if (group === 'sibling') {
    person(g, 26, foot, 20, '#3E6AA8', '#2A1A12');
    person(g, 38, foot, 16, '#B8472E', '#3A2414');
    for (let x = 29; x <= 34; x += 1) setPx(g, x, foot - 9 + (x > 31 ? 1 : 0), '#C98A66');
    stamp(g, ['RR.RR', 'RRRRR', '.RRR.', '..R..'], { R: red }, 30, 10);
    ringEllipse(g, 32, foot - 10, 13, 13, red, 1);
  } else {
    const who = [
      person(g, 15, foot, 18, '#3E6AA8', '#2A1A12'),
      person(g, 25, foot, 22, '#6E8A3A', '#3A2414'),
      person(g, 35, foot, 14, '#B8472E', '#2A1A12'),
      person(g, 45, foot, 19, '#D8A030', '#5A3A1A'),
    ];
    ring = [who[0], who[3]];
  }
  ring.forEach((r) => ringEllipse(g, r.cx, r.cy, 5.2, r.h / 2 + 2.2, red, 1));
  if (ring.length) {
    // marker tail where the pen lifted
    const r = ring[0];
    setPx(g, r.cx + 5, Math.round(r.cy - r.h / 2 - 2), red);
    setPx(g, r.cx + 6, Math.round(r.cy - r.h / 2 - 3), red);
  }
  // glass glare across the frame
  line(g, 44, 8, 54, 18, '#EFE4CC');
  line(g, 46, 8, 54, 16, '#E4D6B8');
  return g;
}

/* ------------------------------------------------------------- lookup */

function sceneFallback() {
  const g = createGrid(W, H);
  const r = mulberry32(7);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) setPx(g, x, y, r() > 0.5 ? '#4A5060' : '#2A2F3C');
  fillRect(g, 12, 19, 40, 9, '#0E1626');
  const t = 'NO SIGNAL';
  textInto(g, t, 32 - Math.floor(textWidth(t) / 2), 21, '#EAF3FF');
  return g;
}

const PAINTERS = {
  top: sceneTop,
  glasses: sceneGlasses,
  shoes: sceneShoes,
  drink: sceneDrink,
  season: sceneSeason,
  siblings: sceneSiblings,
};

const sceneCache = new Map();
function sceneFor(trait, group) {
  const key = `${trait}.${group}`;
  if (!sceneCache.has(key)) {
    const paint = PAINTERS[trait];
    let g = null;
    try {
      g = paint ? paint(group) : null;
    } catch {
      g = null;
    }
    // a scene function handed an unknown group falls through to the last
    // branch, so only trust groups listed in CLUE_SCENES
    sceneCache.set(key, g && KNOWN.has(key) ? g : sceneFallback());
  }
  return sceneCache.get(key);
}

const KNOWN = new Set(CLUE_SCENES);

/* ----------------------------------------------------------- the CCTV */

const TINTS = ['#46F29A', '#4AA8FF'];
const tintCache = new Map();
function tinted(c, tint) {
  const key = `${c}${tint}`;
  let out = tintCache.get(key);
  if (!out) {
    const [r, gg, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
    const des = `#${[r, gg, b].map((v) => Math.round(v + (lum - v) * 0.22).toString(16).padStart(2, '0')).join('')}`;
    out = shade(mix(des, tint, 0.13), -0.06);
    tintCache.set(key, out);
  }
  return out;
}

const pad2 = (n) => String(n).padStart(2, '0');

function buildPhoto(trait, group, seed, cam, when) {
  const h = hashString(seed);
  const tint = TINTS[h & 1];
  const base = sceneFor(trait, group);
  const img = createGrid(W, H);
  for (let i = 0; i < base.px.length; i += 1) img.px[i] = base.px[i] ? tinted(base.px[i], tint) : '#101820';

  const fx = createGrid(W, H);
  const rand = mulberry32(h ^ 0x9e3779b9);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const d = Math.hypot((x + 0.5 - W / 2) / (W / 2), (y + 0.5 - H / 2) / (H / 2));
      if (d > 1.02) setPx(fx, x, y, '#000000@0.45');
      else if ((d - 0.72) / 0.3 > bayer(x, y)) setPx(fx, x, y, '#000000@0.28');
      else if (y % 2 === 1) setPx(fx, x, y, '#000000@0.13');
      const n = rand();
      if (n < 0.035) setPx(fx, x, y, '#ffffff@0.16');
      else if (n < 0.07) setPx(fx, x, y, '#000000@0.22');
    }
  }
  // a rolling interference bar
  const barY = 8 + (h % 30);
  for (let x = 0; x < W; x += 1) if ((x + barY) % 5) setPx(fx, x, barY, '#ffffff@0.07');

  // The HUD is drawn on a grid twice as fine as the photo, so its text is
  // half the size of a scene pixel and covers less of the evidence.
  const HW = W * 2;
  const HH = H * 2;
  const hud = createGrid(HW, HH);
  const shadow = createGrid(HW, HH);
  const FG = '#EAF3FF';
  const text = (s, x, y) => {
    textInto(shadow, s, x + 1, y + 1, '#000000@0.6');
    textInto(hud, s, x, y, FG);
  };
  const camLabel = cam ?? `CAM ${pad2(1 + (h % 9))}`;
  const stampLabel = when ?? `D${1 + ((h >>> 4) % 3)} ${pad2((h >>> 8) % 5)}:${pad2((h >>> 12) % 60)}`;
  text(String(camLabel).toUpperCase(), 6, 5);
  text(String(stampLabel).toUpperCase(), 6, HH - 10);
  text('REC', HW - 6 - textWidth('REC'), 5);
  // corner brackets
  const C = '#EAF3FF@0.6';
  [[2, 2, 1, 1], [HW - 3, 2, -1, 1], [2, HH - 3, 1, -1], [HW - 3, HH - 3, -1, -1]].forEach(([x, y, sx, sy]) => {
    for (let k = 0; k < 6; k += 1) {
      setPx(hud, x + k * sx, y, C);
      setPx(hud, x, y + k * sy, C);
    }
  });
  const rec = createGrid(HW, HH);
  const rx = HW - 6 - textWidth('REC') - 5;
  stamp(rec, ['.RR.', 'RRRR', 'RRRR', '.RR.'], { R: '#FF3B30' }, rx - 1, 5);

  return {
    img: gridToPaths(img),
    fx: gridToPaths(fx),
    hud: [...gridToPaths(shadow), ...gridToPaths(hud)],
    rec: gridToPaths(rec),
    label: `CCTV still, ${camLabel}, ${stampLabel}`,
  };
}

const photoCache = new Map();
function photoFor(trait, group, seed, cam, when) {
  const key = `${trait}|${group}|${seed}|${cam ?? ''}|${when ?? ''}`;
  let out = photoCache.get(key);
  if (!out) {
    out = buildPhoto(trait, group, seed, cam, when);
    if (photoCache.size > 80) photoCache.delete(photoCache.keys().next().value);
    photoCache.set(key, out);
  }
  return out;
}

const CSS = `
.cp-rec{animation:cp-blink 1.2s steps(1) infinite}
@keyframes cp-blink{0%{opacity:1}55%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.cp-rec{animation:none}}
`;

export default function CluePhoto({ fact, seed = '', cam, stamp: when, className, style }) {
  const trait = fact?.trait ?? '';
  const group = fact?.group ?? '';
  const photo = photoFor(trait, group, String(seed), cam, when);
  // A security-camera still: soft, a little grainy, with scan lines and a dark rim.
  // The scene is drawn on a coarse grid; the blur is what keeps it from reading as pixel art.
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', background: '#050E24', ...style }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={photo.label}
        style={{ display: 'block', aspectRatio: '4 / 3', height: 'auto', filter: 'blur(0.8px) saturate(0.85) contrast(1.06)' }}
      >
        <style>{CSS}</style>
        {pathEls(photo.img, 'i')}
        {pathEls(photo.fx, 'f')}
        <g transform="scale(0.5)">
          {pathEls(photo.hud, 'h')}
          <g className="cp-rec">{pathEls(photo.rec, 'r')}</g>
        </g>
      </svg>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px), radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  );
}
