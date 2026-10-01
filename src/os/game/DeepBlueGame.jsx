/**
 * DEEP BLUE: the cursed app's game. A tiny pixel whale swims between fishing
 * hooks and coral; the whole room plays the same course at the same time.
 *
 * Everything that decides a score lives in physics.js and runs on a fixed
 * 1/60 s tick, so a 120 Hz phone and a 60 Hz phone play the same game. This
 * file only feeds it taps, keeps the window (startsAt/endsAt, on the server
 * clock passed in as `now`), and draws.
 *
 * Game state lives in one mutable object inside the mount effect, never in
 * React state: the component renders once and the canvas does the rest. The
 * latest props reach the loop through a ref.
 *
 * All art is drawn here in code: original pixel art, no image files.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  W,
  H,
  FLOOR_Y,
  TICK_MS,
  WHALE_X,
  START_Y,
  GATE_W,
  GATE_SPACING,
  FIRST_GATE_X,
  makeCourse,
  initialState,
  step,
} from './physics.js';
import { sfxFlap, sfxPoint, sfxCrash, sfxCountdown, sfxTimeUp } from '../sfx.js';

const C = {
  abyss: '#050E24',
  navy: '#0B1D45',
  deep: '#12306B',
  ocean: '#1E56B0',
  sea: '#3D8BF2',
  foam: '#EAF3FF',
  chrome: '#8FA3C2',
  steel: '#4A5B7A',
  red: '#FF3B30',
  gold: '#FFCC33',
  coral: '#FF7A59',
  // in-between shades, for the art only
  coralLight: '#FFA98C',
  coralDark: '#D9573B',
  coralDeep: '#9A3222',
  sand: '#C9A66B',
  sandLight: '#E6CD95',
  sandDark: '#A5824C',
  sandDeep: '#7E6238',
  kelpFar: '#0E2759',
  kelpNear: '#07173A',
  lowest: '#081636',
  whaleLine: '#06122E',
  whaleLit: '#7DB8FF',
  bubble: '#9CC6FF',
  bait: '#FF6F91',
};

// The board is pixel art; the words on it are not. The HUD is drawn at device
// resolution, so it uses the phone's own type (bold, with a soft outline).
const FONT = "'Helvetica Neue', Helvetica, Inter, Arial, sans-serif";
const RETRY_DELAY_MS = 600;

/* ------------------------------------------------------------------ art -- */

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return { c, g };
}

function paintRows(g, rows, pal, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

// A deterministic little generator for the scenery (not the course).
function artRng(n) {
  let a = n >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Whale, facing right. 16x10. Tail frames overlay columns 0-2.
const WHALE_BODY = [
  '......oooooo....',
  '....oohhdddddoo.',
  '...odddddddddddo',
  '...dddbbbbbbbebo',
  '...dbbbbbbbbbbbo',
  '...obbwwwwwwwwbo',
  '....owwwwwwwwwo.',
  '.....oowwwwwoo..',
  '.......ooooo....',
  '................',
];
const TAILS = [
  // up
  ['o..', 'do.', 'odo', '.dd', '..d', '...', '...', '...', '...', '...'],
  // level
  ['...', '...', 'o..', 'odd', 'odd', 'o..', '...', '...', '...', '...'],
  // down
  ['...', '...', '...', '..d', '.dd', 'odo', 'do.', 'o..', '...', '...'],
];
const WHALE_PAL = {
  o: C.whaleLine,
  h: C.whaleLit,
  d: C.ocean,
  b: C.sea,
  w: C.foam,
  e: C.abyss,
};

function whaleRows(tail) {
  return WHALE_BODY.map((row, y) => {
    let out = '';
    for (let x = 0; x < row.length; x++) {
      const t = x < 3 ? tail[y][x] : '.';
      out += t !== '.' ? t : row[x];
    }
    return out;
  });
}

function buildWhales() {
  const frames = TAILS.map((tail) => {
    const { c, g } = makeCanvas(16, 10);
    paintRows(g, whaleRows(tail), WHALE_PAL);
    return c;
  });
  // Belly up, for the sink.
  const { c: dead, g } = makeCanvas(16, 10);
  paintRows(g, whaleRows(TAILS[1]).slice().reverse(), { ...WHALE_PAL, e: C.whaleLine });
  g.fillStyle = C.whaleLine;
  // an X for an eye
  g.fillRect(12, 4, 1, 1);
  g.fillRect(14, 4, 1, 1);
  g.fillRect(13, 5, 1, 1);
  g.fillRect(12, 6, 1, 1);
  g.fillRect(14, 6, 1, 1);
  return { frames, dead };
}

function buildBackground() {
  const { c, g } = makeCanvas(W, FLOOR_Y);
  const bands = [C.ocean, C.deep, C.navy, C.lowest];
  const edges = [26, 92, 168]; // band boundaries; each dithers over 16 rows
  for (let y = 0; y < FLOOR_Y; y++) {
    for (let x = 0; x < W; x++) {
      let band = 0;
      for (let k = 0; k < edges.length; k++) {
        const e = edges[k];
        if (y >= e + 8) band = k + 1;
        else if (y >= e - 8) {
          const t = (y - (e - 8)) / 16;
          if (BAYER[y & 3][x & 3] / 16 < t) band = k + 1;
        }
      }
      g.fillStyle = bands[band];
      g.fillRect(x, y, 1, 1);
    }
  }
  // Light shafts from the surface, dithered thinner as they go down.
  g.fillStyle = C.sea;
  g.globalAlpha = 0.28;
  for (let y = 0; y < 130; y++) {
    const density = 1 - y / 130;
    for (let x = 0; x < W; x++) {
      const band = (x + Math.floor(y * 0.45)) % 64;
      if (band < 9 && BAYER[y & 3][x & 3] / 16 < density * 0.6) g.fillRect(x, y, 1, 1);
    }
  }
  g.globalAlpha = 1;
  return c;
}

// Kelp silhouettes: a 288-wide strip that tiles, in four sway phases.
function buildKelp(seed, color, count, minH, maxH, rocks) {
  const phases = [];
  const rnd = artRng(seed);
  const strands = Array.from({ length: count }, (_, i) => ({
    x: Math.floor((i + rnd() * 0.7) * (288 / count)),
    h: Math.floor(minH + rnd() * (maxH - minH)),
    ph: rnd() * 6.28,
    w: rnd() < 0.5 ? 2 : 3,
  }));
  const mounds = Array.from({ length: rocks }, () => ({
    x: Math.floor(rnd() * 288),
    r: 6 + Math.floor(rnd() * 12),
  }));
  for (let p = 0; p < 4; p++) {
    const { c, g } = makeCanvas(288, FLOOR_Y);
    g.fillStyle = color;
    for (const m of mounds) {
      for (let dx = -m.r; dx <= m.r; dx++) {
        const hgt = Math.round(Math.sqrt(m.r * m.r - dx * dx) * 0.55);
        const x = (((m.x + dx) % 288) + 288) % 288;
        g.fillRect(x, FLOOR_Y - hgt, 1, hgt);
      }
    }
    for (const s of strands) {
      for (let yy = 0; yy < s.h; yy++) {
        const sway = Math.sin(yy * 0.11 + s.ph + p * 1.57) * (1 + yy / 60);
        const x = Math.round(s.x + sway);
        const y = FLOOR_Y - 1 - yy;
        const wx = ((x % 288) + 288) % 288;
        g.fillRect(wx, y, s.w, 1);
        if (wx + s.w > 288) g.fillRect(wx - 288, y, s.w, 1);
        if (yy % 9 === 4 && yy < s.h - 4) {
          const side = (yy / 9) & 1 ? -3 : s.w;
          g.fillRect(wx + side, y, 3, 1);
          g.fillRect(wx + side + (side < 0 ? 0 : 1), y - 1, 2, 1);
        }
      }
    }
    phases.push(c);
  }
  return phases;
}

// The sand: a 48 px pattern, drawn 192 wide so it can scroll by offset.
function buildSand() {
  const { c, g } = makeCanvas(192, H - FLOOR_Y);
  const rnd = artRng(4242);
  const specks = Array.from({ length: 22 }, () => [Math.floor(rnd() * 48), 3 + Math.floor(rnd() * 20), rnd()]);
  for (let rep = 0; rep < 4; rep++) {
    const ox = rep * 48;
    g.fillStyle = C.sand;
    g.fillRect(ox, 0, 48, H - FLOOR_Y);
    g.fillStyle = C.sandLight;
    g.fillRect(ox, 0, 48, 1);
    for (let x = 0; x < 48; x++) if ((x & 3) === 0) g.fillRect(ox + x, 1, 2, 1);
    g.fillStyle = C.sandDark;
    for (let x = 0; x < 48; x++) {
      const y = 7 + Math.round(Math.sin((x / 48) * Math.PI * 4) * 1.5);
      if (x % 3 !== 0) g.fillRect(ox + x, y, 1, 1);
      const y2 = 15 + Math.round(Math.sin((x / 48) * Math.PI * 2 + 1) * 1.5);
      if (x % 4 !== 1) g.fillRect(ox + x, y2, 1, 1);
    }
    for (const [x, y, r] of specks) {
      g.fillStyle = r < 0.6 ? C.sandDark : r < 0.85 ? C.sandLight : C.sandDeep;
      g.fillRect(ox + x, y, 1, 1);
    }
    // a small shell
    g.fillStyle = C.coralLight;
    g.fillRect(ox + 30, 11, 3, 1);
    g.fillRect(ox + 31, 10, 1, 1);
    g.fillStyle = C.foam;
    g.fillRect(ox + 31, 11, 1, 1);
  }
  return c;
}

// A coral pillar, 22 wide plus 3 px each side for its knobbly cap and nubs.
// Row 0 is the top of the cap. Also returns a flipped copy for hanging reefs.
function buildCoral() {
  const { c, g } = makeCanvas(GATE_W + 6, H);
  const x0 = 3;
  const w = GATE_W;
  for (let y = 7; y < H; y++) {
    g.fillStyle = C.coral;
    g.fillRect(x0, y, w, 1);
    g.fillStyle = C.coralLight;
    g.fillRect(x0 + 1, y, 3, 1);
    g.fillStyle = C.coralDark;
    g.fillRect(x0 + w - 6, y, 5, 1);
    g.fillStyle = C.coralDeep;
    g.fillRect(x0, y, 1, 1);
    g.fillRect(x0 + w - 1, y, 1, 1);
  }
  // polyps: little pits with a lit rim
  for (let y = 11; y < H; y += 5) {
    const shift = ((y / 5) & 1) * 3;
    for (let x = x0 + 5 + shift; x < x0 + w - 4; x += 6) {
      g.fillStyle = C.coralDeep;
      g.fillRect(x, y, 2, 1);
      g.fillStyle = C.coralLight;
      g.fillRect(x, y - 1, 2, 1);
    }
  }
  // side nubs, alternating
  for (let k = 0; k < 9; k++) {
    const y = 26 + k * 27;
    const left = (k & 1) === 0;
    const nx = left ? 0 : x0 + w;
    g.fillStyle = C.coralDeep;
    g.fillRect(nx, y, 3, 4);
    g.fillStyle = left ? C.coralLight : C.coralDark;
    g.fillRect(nx + (left ? 1 : 0), y + 1, 2, 2);
  }
  // cap: rounded lip with knobs on top
  g.fillStyle = C.coralDeep;
  g.fillRect(2, 2, w + 2, 6);
  g.fillRect(1, 3, w + 4, 4);
  g.fillStyle = C.coral;
  g.fillRect(2, 3, w + 2, 3);
  g.fillStyle = C.coralLight;
  g.fillRect(3, 3, w, 1);
  g.fillRect(2, 4, 2, 1);
  g.fillStyle = C.coralDark;
  g.fillRect(3, 6, w, 1);
  for (const kx of [5, 11, 17, 22]) {
    g.fillStyle = C.coralDeep;
    g.fillRect(kx - 1, 0, 4, 3);
    g.fillStyle = C.coralLight;
    g.fillRect(kx, 1, 2, 2);
    g.fillStyle = C.foam;
    g.fillRect(kx, 1, 1, 1);
  }
  const { c: flipped, g: fg } = makeCanvas(GATE_W + 6, H);
  fg.translate(0, H);
  fg.scale(1, -1);
  fg.drawImage(c, 0, 0);
  return { up: c, down: flipped };
}

// A J hook, 5x9: eye at the top (the line ties on at column 3), barbed point on the left.
const HOOK_ROWS = ['..clc', '..c.c', '..ccc', '...c.', '...c.', 'l..c.', 'cc.c.', 'c..c.', '.sss.'];
const HOOK_H = HOOK_ROWS.length;
const HOOK_PAL = { l: C.foam, c: C.chrome, s: C.steel };
const HOOK_LINES = [
  [1, 0],
  [7, 2],
  [13, 1],
  [19, 3],
]; // [x offset of the line, how far the hook sits above the gap]

function buildHook() {
  const { c, g } = makeCanvas(5, HOOK_H);
  paintRows(g, HOOK_ROWS, HOOK_PAL);
  return c;
}

/* --------------------------------------------------------------- drawing -- */

function drawBubble(g, x, y, size) {
  x = Math.round(x);
  y = Math.round(y);
  if (size <= 1) {
    g.fillStyle = C.bubble;
    g.fillRect(x, y, 1, 1);
  } else if (size === 2) {
    g.fillStyle = C.bubble;
    g.fillRect(x, y, 2, 2);
    g.fillStyle = C.foam;
    g.fillRect(x, y, 1, 1);
  } else {
    g.fillStyle = C.bubble;
    g.fillRect(x + 1, y, 2, 1);
    g.fillRect(x + 1, y + 3, 2, 1);
    g.fillRect(x, y + 1, 1, 2);
    g.fillRect(x + 3, y + 1, 1, 2);
    g.fillStyle = C.foam;
    g.fillRect(x + 1, y + 1, 1, 1);
  }
}

function drawGate(g, art, gate, sx, frameNo) {
  const gapTop = Math.round(gate.gapY - gate.gap / 2);
  const gapBottom = Math.round(gate.gapY + gate.gap / 2);
  // coral from below
  const hBottom = FLOOR_Y - gapBottom;
  if (hBottom > 0) g.drawImage(art.coral.up, 0, 0, GATE_W + 6, hBottom, sx - 3, gapBottom, GATE_W + 6, hBottom);
  if (gate.kind === 'coral') {
    // a reef hanging from above
    if (gapTop > 0) g.drawImage(art.coral.down, 0, H - gapTop, GATE_W + 6, gapTop, sx - 3, 0, GATE_W + 6, gapTop);
    return;
  }
  // a curtain of fishing lines, each ending in a hook
  HOOK_LINES.forEach(([dx, lift], n) => {
    const hookTop = gapTop - HOOK_H - lift;
    const lx = sx + dx + 3;
    g.fillStyle = C.steel;
    g.fillRect(lx, 0, 1, hookTop);
    if (n === 0 || n === 2) {
      const sy = hookTop - 11;
      g.fillStyle = C.steel;
      g.fillRect(lx - 1, sy, 3, 4);
      g.fillStyle = C.chrome;
      g.fillRect(lx - 1, sy, 1, 2);
    }
    g.drawImage(art.hook, sx + dx, hookTop);
    if (n === 1 && gate.i % 2 === 1) {
      // bait: a wriggling worm on the bend
      const wig = frameNo & 1;
      g.fillStyle = C.bait;
      g.fillRect(sx + dx, hookTop + 7 + wig, 1, 2 - wig);
      g.fillRect(sx + dx + 1, hookTop + 8, 2, 1);
      g.fillRect(sx + dx - 1, hookTop + 6 - wig, 1, 1);
    }
  });
}

function text(g, str, x, y, size, color, align = 'center', outline = C.abyss) {
  g.font = `800 ${size * 1.3}px ${FONT}`;
  g.textAlign = align;
  g.textBaseline = 'top';
  g.lineJoin = 'round';
  g.lineWidth = Math.max(1, size * 0.18);
  g.strokeStyle = outline;
  g.strokeText(str, x, y);
  g.fillStyle = color;
  g.fillText(str, x, y);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------- component -- */

export default function DeepBlueGame(props) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef(props);

  useLayoutEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const view = canvas.getContext('2d');
    const { c: buf, g } = makeCanvas(W, H);

    const art = {
      bg: buildBackground(),
      kelpFar: buildKelp(11, C.kelpFar, 9, 40, 120, 7),
      kelpNear: buildKelp(29, C.kelpNear, 5, 26, 70, 5),
      sand: buildSand(),
      coral: buildCoral(),
      hook: buildHook(),
      whale: buildWhales(),
    };
    const ambient = Array.from({ length: 10 }, (_, i) => {
      const r = artRng(900 + i);
      return { x0: r() * 150, speed: 0.008 + r() * 0.018, phase: r() * 400, size: 1 + Math.floor(r() * 3) };
    });

    const P = () => {
      const p = propsRef.current;
      return {
        seed: p.seed ?? 'deep',
        mode: p.mode === 'live' ? 'live' : 'practice',
        startsAt: p.startsAt ?? null,
        endsAt: p.endsAt ?? null,
        now: typeof p.now === 'function' ? p.now : Date.now,
        best: p.best ?? 0,
        onRunEnd: p.onRunEnd,
        disabled: !!p.disabled,
        startAttempt: p.startAttempt ?? 1,
      };
    };

    const first = P();
    const G = {
      mode: 'init', // init | countdown | ready | playing | dead | over
      seedBase: first.seed,
      attempt: first.startAttempt,
      course: makeCourse(`${first.seed}:${first.startAttempt}`),
      s: initialState(),
      pendingFlap: false,
      reported: true,
      acc: 0,
      last: null,
      scene: 0, // scenery scroll while idle
      sceneBase: 0, // scenery offset at the start of the current run
      deadAt: 0,
      goAt: -1e9,
      popAt: -1e9,
      shakeAt: -1e9,
      flashAt: -1e9,
      lastCount: null,
      sessionBest: 0,
      particles: [],
      scale: 1,
    };

    const resetRun = () => {
      G.s = initialState();
      G.course = makeCourse(`${G.seedBase}:${G.attempt}`);
      G.acc = 0;
      G.sceneBase = G.scene;
    };

    const startRun = () => {
      resetRun();
      G.mode = 'playing';
      G.reported = false;
      G.pendingFlap = true;
    };

    const report = (score) => {
      if (G.reported) return;
      G.reported = true;
      G.sessionBest = Math.max(G.sessionBest, score);
      const cb = P().onRunEnd;
      if (typeof cb === 'function') cb({ score, attempt: G.attempt });
    };

    const puff = (n, spread) => {
      for (let k = 0; k < n; k++) {
        G.particles.push({
          x: WHALE_X - 7 + Math.random() * 2,
          y: G.s.y + (Math.random() * 2 - 1) * spread,
          vx: -0.4 - Math.random() * 0.6,
          vy: -0.2 - Math.random() * 0.5,
          life: 26 + Math.random() * 16,
          size: Math.random() < 0.35 ? 2 : 1,
        });
      }
    };

    const press = () => {
      const p = P();
      if (p.disabled) return;
      if (G.mode === 'ready') startRun();
      else if (G.mode === 'playing') G.pendingFlap = true;
      else if (G.mode === 'dead' && performance.now() - G.deadAt >= RETRY_DELAY_MS) {
        G.attempt += 1;
        startRun();
      }
    };

    /* -- the window: countdown before startsAt, TIME after endsAt -- */
    const checkWindow = (p, ts) => {
      if (p.seed !== G.seedBase) {
        G.seedBase = p.seed;
        G.attempt = p.startAttempt;
        G.mode = 'init';
        resetRun();
      }
      if (p.mode !== 'live') {
        if (G.mode === 'init' || G.mode === 'countdown' || G.mode === 'over') {
          G.mode = 'ready';
          resetRun();
        }
        return;
      }
      const t = p.now();
      if (p.endsAt != null && t >= p.endsAt) {
        if (G.mode === 'playing') report(G.s.score);
        if (G.mode !== 'over') {
          if (G.mode !== 'init') sfxTimeUp();
          G.mode = 'over';
        }
        return;
      }
      if (p.startsAt != null && t < p.startsAt) {
        if (G.mode !== 'playing') {
          G.mode = 'countdown';
          const secs = Math.ceil((p.startsAt - t) / 1000);
          if (secs !== G.lastCount) {
            if (secs >= 1 && secs <= 3) sfxCountdown(false);
            G.lastCount = secs;
          }
        }
        return;
      }
      if (G.mode === 'countdown') {
        sfxCountdown(true);
        G.goAt = ts;
        G.lastCount = null;
        G.mode = 'ready';
        resetRun();
      } else if (G.mode === 'init' || G.mode === 'over') {
        G.mode = 'ready';
        resetRun();
      }
    };

    const tick = (ts) => {
      const prev = G.s;
      const flap = G.pendingFlap && prev.alive;
      G.pendingFlap = false;
      const s = step(prev, flap, G.course);
      G.s = s;
      if (flap) {
        sfxFlap();
        puff(3, 2);
      }
      if (s.score > prev.score) {
        sfxPoint();
        G.popAt = ts;
      }
      if (prev.alive && !s.alive) {
        sfxCrash();
        G.shakeAt = ts;
        G.flashAt = ts;
        G.deadAt = ts;
        G.mode = 'dead';
        puff(8, 4);
        report(s.score);
      }
    };

    /* -- drawing -- */
    const render = (ts, p) => {
      const playingLike = G.mode === 'playing' || G.mode === 'dead' || (G.mode === 'over' && G.s.tick > 0);
      const sceneDist = playingLike ? G.sceneBase + G.s.dist : G.scene;
      const frameNo = Math.floor(ts / 160);

      // shake
      let ox = 0;
      let oy = 0;
      const since = ts - G.shakeAt;
      if (since < 260) {
        const amp = 2 * (1 - since / 260);
        ox = Math.round((Math.random() * 2 - 1) * amp);
        oy = Math.round((Math.random() * 2 - 1) * amp);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = C.abyss;
      g.fillRect(0, 0, W, H);
      g.setTransform(1, 0, 0, 1, ox, oy);

      g.drawImage(art.bg, 0, 0);
      // surface shimmer
      g.fillStyle = C.sea;
      const sh = Math.floor(ts / 140);
      for (let x = 0; x < W; x++) if ((x + sh) % 7 < 3) g.fillRect(x, 0, 1, 1);
      g.fillStyle = C.whaleLit;
      for (let x = 0; x < W; x++) if ((x * 3 + sh) % 23 === 0) g.fillRect(x, 1, 2, 1);

      const phase = Math.floor(ts / 420) % 4;
      const kfx = -Math.floor((sceneDist * 0.2) % 288);
      g.drawImage(art.kelpFar[phase], kfx, 0);
      g.drawImage(art.kelpFar[phase], kfx + 288, 0);

      for (let i = 0; i < ambient.length; i++) {
        const b = ambient[i];
        const y = FLOOR_Y - ((ts * b.speed + b.phase) % (FLOOR_Y + 8));
        const x = ((((b.x0 - sceneDist * 0.35 + Math.sin(ts / 600 + i) * 1.5) % 150) + 150) % 150) - 3;
        drawBubble(g, x, y, b.size);
      }

      const knx = -Math.floor((sceneDist * 0.5) % 288);
      g.drawImage(art.kelpNear[(phase + 2) % 4], knx, 0);
      g.drawImage(art.kelpNear[(phase + 2) % 4], knx + 288, 0);

      if (playingLike) {
        const dist = G.s.dist;
        let i = Math.max(0, Math.floor((dist - FIRST_GATE_X - GATE_W - 4) / GATE_SPACING));
        for (;; i++) {
          const gate = G.course(i);
          const sx = gate.x - dist;
          if (sx > W + 4) break;
          if (sx + GATE_W + 3 >= 0) drawGate(g, art, gate, Math.round(sx), frameNo);
        }
      }

      const sfx0 = -Math.floor(sceneDist % 48);
      g.drawImage(art.sand, sfx0, FLOOR_Y);

      for (const q of G.particles) drawBubble(g, q.x, q.y, q.size);

      // the whale
      let wy;
      let angle = 0;
      let sprite;
      if (playingLike) {
        wy = G.s.y;
        if (G.s.alive) {
          angle = clamp(G.s.vy * 0.2, -0.45, 1.1);
          const sinceFlap = G.s.tick - G.s.lastFlap;
          const f = sinceFlap < 12 ? [0, 1, 2][Math.floor(sinceFlap / 4)] : [0, 1, 2, 1][Math.floor(G.s.tick / 9) % 4];
          sprite = art.whale.frames[f];
        } else {
          sprite = art.whale.dead;
          angle = Math.sin(ts / 200) * 0.08;
        }
      } else {
        wy = START_Y + Math.sin(ts / 280) * 3;
        sprite = art.whale.frames[[0, 1, 2, 1][Math.floor(ts / 170) % 4]];
      }
      g.save();
      g.translate(WHALE_X, Math.round(wy));
      g.rotate(angle);
      g.drawImage(sprite, -8, -5);
      g.restore();

      const fl = ts - G.flashAt;
      if (fl < 140) {
        g.globalAlpha = 0.75 * (1 - fl / 140);
        g.fillStyle = C.foam;
        g.fillRect(-4, -4, W + 8, H + 8);
        g.globalAlpha = 1;
      }
      if (G.mode === 'countdown' || G.mode === 'over') {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 0.5;
        g.fillStyle = C.abyss;
        g.fillRect(0, 0, W, H);
        g.globalAlpha = 1;
      }

      // Blit the board at the integer scale, then draw the HUD at full
      // resolution so the pixel font stays sharp.
      const S = G.scale;
      view.setTransform(1, 0, 0, 1, 0, 0);
      view.imageSmoothingEnabled = false;
      view.drawImage(buf, 0, 0, W * S, H * S);
      view.setTransform(S, 0, 0, S, 0, 0);
      drawHud(view, ts, p);
    };

    const drawHud = (v, ts, p) => {
      const blink = Math.floor(ts / 450) % 2 === 0;
      const best = Math.max(p.best || 0, G.sessionBest);
      text(v, `BEST ${best}`, 4, 5, 8, C.foam, 'left');
      if (p.mode === 'practice') {
        text(v, 'PRACTICE', W - 4, 5, 8, C.gold, 'right');
      } else if (p.endsAt != null && G.mode !== 'countdown') {
        const left = Math.max(0, Math.ceil((p.endsAt - p.now()) / 1000));
        text(v, `${left}s`, W - 4, 5, 8, left < 10 ? C.red : C.foam, 'right');
      }

      if (G.mode === 'playing' || G.mode === 'dead' || (G.mode === 'over' && G.s.tick > 0)) {
        const pop = ts - G.popAt < 180;
        text(v, String(G.s.score), W / 2, pop ? 18 : 20, 16, pop ? C.gold : C.foam);
      }

      if (G.mode === 'ready' && !p.disabled) {
        if (blink) text(v, 'TAP TO SWIM', W / 2, 150, 8, C.foam);
        if (p.mode === 'live' && G.attempt > 1) text(v, `RUN ${G.attempt}`, W / 2, 164, 8, C.chrome);
      }
      if (ts - G.goAt < 800) text(v, 'GO!', W / 2, 72, 32, C.gold);

      if (G.mode === 'dead') {
        const word = G.s.cause === 'hook' ? 'HOOKED' : G.s.cause === 'floor' ? 'SUNK' : 'SMASHED';
        text(v, word, W / 2, 100, 16, C.red);
        if (!p.disabled && ts - G.deadAt >= RETRY_DELAY_MS && blink) text(v, 'TAP TO RETRY', W / 2, 150, 8, C.foam);
      }

      if (G.mode === 'countdown') {
        const ms = Math.max(0, p.startsAt - p.now());
        const secs = Math.ceil(ms / 1000);
        if (secs > 3) {
          text(v, 'OPENS IN', W / 2, 88, 8, C.chrome);
          const m = Math.floor(secs / 60);
          const ss = String(secs % 60).padStart(2, '0');
          text(v, `${m}:${ss}`, W / 2, 102, 16, C.foam);
        } else {
          text(v, 'GET READY', W / 2, 70, 8, C.chrome);
          text(v, String(secs), W / 2, 86, 32, C.gold);
        }
      }

      if (G.mode === 'over') {
        text(v, 'TIME', W / 2, 90, 32, C.red);
      }
    };

    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      const p = P();
      const dt = G.last == null ? 0 : clamp(ts - G.last, 0, 250);
      G.last = ts;
      checkWindow(p, ts);

      if (G.mode === 'playing' || G.mode === 'dead') {
        G.acc += dt;
        while (G.acc >= TICK_MS) {
          G.acc -= TICK_MS;
          tick(ts);
        }
      } else if (G.mode === 'ready' || G.mode === 'countdown') {
        G.scene += dt * 0.06; // the sand keeps drifting while you wait
      }

      const k = dt / TICK_MS;
      if (G.mode !== 'over') {
        for (const q of G.particles) {
          q.x += q.vx * k;
          q.y += q.vy * k;
          q.vx *= Math.pow(0.95, k);
          q.life -= k;
        }
        G.particles = G.particles.filter((q) => q.life > 0 && q.y > -4);
      }

      render(ts, p);
    };

    /* -- sizing: the largest whole device-pixel scale that fits -- */
    const fit = () => {
      // Layout size, not getBoundingClientRect: the app zooms open from its icon
      // (a CSS scale), and a transformed rect would size the board for a 0.2x phone.
      const dpr = window.devicePixelRatio || 1;
      const S = Math.max(1, Math.floor(Math.min((wrap.offsetWidth * dpr) / W, (wrap.offsetHeight * dpr) / H)));
      G.scale = S;
      if (canvas.width !== W * S) canvas.width = W * S;
      if (canvas.height !== H * S) canvas.height = H * S;
      canvas.style.width = `${(W * S) / dpr}px`;
      canvas.style.height = `${(H * S) / dpr}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    /* -- input -- */
    const onPointer = (e) => {
      if (e.button != null && e.button > 0) return;
      e.preventDefault();
      press();
    };
    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      const el = e.target;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const onMenu = (e) => e.preventDefault();
    wrap.addEventListener('pointerdown', onPointer);
    wrap.addEventListener('contextmenu', onMenu);
    window.addEventListener('keydown', onKey);

    if (document.fonts && document.fonts.load) {
      document.fonts.load(`800 16px ${FONT}`).catch(() => {});
    }

    let raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointerdown', onPointer);
      wrap.removeEventListener('contextmenu', onMenu);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: C.abyss,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      <canvas ref={canvasRef} role="img" aria-label="DEEP BLUE" style={{ display: 'block', imageRendering: 'pixelated' }} />
    </div>
  );
}
