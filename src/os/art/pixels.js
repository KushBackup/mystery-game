/**
 * Pixel-art plumbing for the DEEP BLUE phone.
 *
 * Every sprite in src/os is painted into a small colour grid and then turned
 * into SVG paths: one <path> per colour, each path a list of axis-aligned
 * rectangles (runs merged across a row, then stacked down identical rows).
 * A 64x48 photo therefore costs a few dozen DOM nodes, not three thousand.
 *
 * Colours are '#rrggbb', or '#rrggbb@0.25' for a translucent overlay pixel.
 * Nothing here is random at render time: anything that needs noise takes a
 * seed and uses mulberry32, so the same props always draw the same picture.
 *
 * Also here: the 3x5 pixel font used inside photos and icons. It is drawn as
 * pixels on purpose, a web font inside a 64px-wide photo would blur.
 */
import { createElement } from 'react';

/* ------------------------------------------------------------------ seeds */

/** FNV-1a, 32 bit. Stable across platforms. */
export function hashString(str) {
  let h = 0x811c9dc5;
  const s = String(str ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small seeded PRNG: returns a function giving floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 4x4 ordered-dither thresholds in (0, 1). */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
export function bayer(x, y) {
  return (BAYER4[y & 3][x & 3] + 0.5) / 16;
}

/* ----------------------------------------------------------------- colour */

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export function parseHex(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function toHex([r, g, b]) {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}
/** Linear mix of two '#rrggbb' colours, t = 0 gives a. */
export function mix(a, b, t) {
  const A = parseHex(a);
  const B = parseHex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}
/** Darken (amt < 0, towards black) or lighten (amt > 0, towards white). */
export function shade(hex, amt) {
  return amt < 0 ? mix(hex, '#000000', -amt) : mix(hex, '#ffffff', amt);
}

/* ------------------------------------------------------------------- grid */

export function createGrid(w, h, fill = null) {
  return { w, h, px: new Array(w * h).fill(fill) };
}
export function getPx(g, x, y) {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return null;
  return g.px[y * g.w + x];
}
export function setPx(g, x, y, c) {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h || c == null) return;
  g.px[y * g.w + x] = c;
}
export function fillRect(g, x, y, w, h, c) {
  for (let j = y; j < y + h; j += 1) for (let i = x; i < x + w; i += 1) setPx(g, i, j, c);
}
/** Filled disc tested at pixel centres. cx/cy may be fractional. */
export function fillCircle(g, cx, cy, r, c) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y += 1) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r) setPx(g, x, y, c);
    }
  }
}
/** Filled ellipse tested at pixel centres. */
export function fillEllipse(g, cx, cy, rx, ry, c) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPx(g, x, y, c);
    }
  }
}
/** One-pixel ellipse outline (a marker ring), `t` = thickness in pixels. */
export function ringEllipse(g, cx, cy, rx, ry, c, t = 1) {
  for (let y = Math.floor(cy - ry - t); y <= Math.ceil(cy + ry + t); y += 1) {
    for (let x = Math.floor(cx - rx - t); x <= Math.ceil(cx + rx + t); x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(d - 1) * Math.min(rx, ry) < t * 0.62) setPx(g, x, y, c);
    }
  }
}
/** Bresenham line. */
export function line(g, x0, y0, x1, y1, c) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    setPx(g, x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}
/**
 * Paint a string matrix. `legend` maps a character to a colour; '.' and ' '
 * are transparent, as is any character missing from the legend.
 */
export function stamp(g, rows, legend, ox = 0, oy = 0, flip = false) {
  rows.forEach((row, y) => {
    for (let i = 0; i < row.length; i += 1) {
      const ch = row[flip ? row.length - 1 - i : i];
      const c = legend[ch];
      if (c) setPx(g, ox + i, oy + y, c);
    }
  });
}
/** Replace every pixel through fn(colour, x, y). */
export function mapGrid(g, fn) {
  for (let y = 0; y < g.h; y += 1) {
    for (let x = 0; x < g.w; x += 1) {
      const i = y * g.w + x;
      g.px[i] = fn(g.px[i], x, y);
    }
  }
}

/* ------------------------------------------------------------ grid -> svg */

/**
 * Merge a grid into rectangles, grouped by colour. Runs across a row first,
 * then a run identical to the one directly above extends that rectangle.
 * Returns [{ fill, opacity, d }] in first-seen colour order.
 */
export function gridToPaths(g) {
  const open = new Map(); // key x,w,c -> rect
  const done = [];
  for (let y = 0; y < g.h; y += 1) {
    const seen = new Set();
    let x = 0;
    while (x < g.w) {
      const c = g.px[y * g.w + x];
      if (c == null) {
        x += 1;
        continue;
      }
      let w = 1;
      while (x + w < g.w && g.px[y * g.w + x + w] === c) w += 1;
      const key = `${x},${w},${c}`;
      const prev = open.get(key);
      if (prev && prev.y + prev.h === y) {
        prev.h += 1;
      } else {
        if (prev) done.push(prev);
        open.set(key, { x, y, w, h: 1, c });
      }
      seen.add(key);
      x += w;
    }
    for (const [key, r] of open) {
      if (!seen.has(key)) {
        done.push(r);
        open.delete(key);
      }
    }
  }
  for (const r of open.values()) done.push(r);
  return rectsToPaths(done);
}

export function rectsToPaths(rects) {
  const by = new Map();
  for (const r of rects) {
    const list = by.get(r.c) ?? [];
    list.push(`M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`);
    by.set(r.c, list);
  }
  return [...by.entries()].map(([c, parts]) => {
    const [fill, op] = c.split('@');
    return { fill, opacity: op == null ? undefined : Number(op), d: parts.join('') };
  });
}

/** Render path records as React elements (not a component: returns an array). */
export function pathEls(paths, keyPrefix = 'p') {
  return paths.map((p, i) =>
    createElement('path', {
      key: `${keyPrefix}${i}`,
      d: p.d,
      fill: p.fill,
      fillOpacity: p.opacity,
    }),
  );
}

/** d-string for a single-colour matrix ('.' and ' ' off, anything else on). */
export function matrixD(rows, ox = 0, oy = 0) {
  let d = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === '.' || row[x] === ' ') {
        x += 1;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] !== '.' && row[x + w] !== ' ') w += 1;
      d += `M${ox + x} ${oy + y}h${w}v1h-${w}z`;
      x += w;
    }
  });
  return d;
}

/* ------------------------------------------------------------- 3x5 font */

const FONT = {
  A: ['XXX', 'X.X', 'XXX', 'X.X', 'X.X'],
  B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  C: ['.XX', 'X..', 'X..', 'X..', '.XX'],
  D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  F: ['XXX', 'X..', 'XX.', 'X..', 'X..'],
  G: ['.XX', 'X..', 'X.X', 'X.X', '.XX'],
  H: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
  I: ['XXX', '.X.', '.X.', '.X.', 'XXX'],
  J: ['..X', '..X', '..X', 'X.X', '.X.'],
  K: ['X.X', 'X.X', 'XX.', 'X.X', 'X.X'],
  L: ['X..', 'X..', 'X..', 'X..', 'XXX'],
  M: ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'],
  N: ['X..X', 'XX.X', 'X.XX', 'X..X', 'X..X'],
  O: ['.X.', 'X.X', 'X.X', 'X.X', '.X.'],
  P: ['XX.', 'X.X', 'XX.', 'X..', 'X..'],
  Q: ['.X.', 'X.X', 'X.X', 'XX.', '.XX'],
  R: ['XX.', 'X.X', 'XX.', 'X.X', 'X.X'],
  S: ['.XX', 'X..', '.X.', '..X', 'XX.'],
  T: ['XXX', '.X.', '.X.', '.X.', '.X.'],
  U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
  V: ['X.X', 'X.X', 'X.X', 'X.X', '.X.'],
  W: ['X...X', 'X...X', 'X.X.X', 'XX.XX', 'X...X'],
  X: ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
  Y: ['X.X', 'X.X', '.X.', '.X.', '.X.'],
  Z: ['XXX', '..X', '.X.', 'X..', 'XXX'],
  0: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  1: ['.X.', 'XX.', '.X.', '.X.', 'XXX'],
  2: ['XX.', '..X', '.X.', 'X..', 'XXX'],
  3: ['XX.', '..X', '.X.', '..X', 'XX.'],
  4: ['X.X', 'X.X', 'XXX', '..X', '..X'],
  5: ['XXX', 'X..', 'XX.', '..X', 'XX.'],
  6: ['.XX', 'X..', 'XXX', 'X.X', 'XXX'],
  7: ['XXX', '..X', '.X.', '.X.', '.X.'],
  8: ['XXX', 'X.X', 'XXX', 'X.X', 'XXX'],
  9: ['XXX', 'X.X', 'XXX', '..X', 'XX.'],
  ':': ['.', 'X', '.', 'X', '.'],
  '.': ['.', '.', '.', '.', 'X'],
  '·': ['.', '.', 'X', '.', '.'],
  '-': ['...', '...', 'XXX', '...', '...'],
  '/': ['..X', '..X', '.X.', 'X..', 'X..'],
  ' ': ['..', '..', '..', '..', '..'],
};
const FALLBACK = ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'];
const glyphFor = (ch) => FONT[ch] ?? FONT[String(ch).toUpperCase()] ?? FALLBACK;

/** Width in pixels of a string in the 3x5 font (1px tracking). */
export function textWidth(str) {
  const s = String(str);
  let w = 0;
  for (let i = 0; i < s.length; i += 1) w += glyphFor(s[i])[0].length + (i < s.length - 1 ? 1 : 0);
  return w;
}
/** Paint a string into a grid; returns the width drawn. */
export function textInto(g, str, x, y, c) {
  const s = String(str);
  let cx = x;
  for (let i = 0; i < s.length; i += 1) {
    const gl = glyphFor(s[i]);
    stamp(g, gl, { X: c }, cx, y);
    cx += gl[0].length + 1;
  }
  return cx - x - 1;
}
/** d-string for a string in the 3x5 font. */
export function textD(str, x, y) {
  const s = String(str);
  let cx = x;
  let d = '';
  for (let i = 0; i < s.length; i += 1) {
    const gl = glyphFor(s[i]);
    d += matrixD(gl, cx, y);
    cx += gl[0].length + 1;
  }
  return d;
}
