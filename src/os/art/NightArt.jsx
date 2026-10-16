import React from 'react';

/**
 * The Night app's pictures: the sky over the top of every Night screen and
 * one small illustration per move. Plain SVG, no raster, no animation of
 * their own (the app's CSS moves them, and stops under reduced motion).
 *
 * The sky is the same on every phone, whatever the role, so a glance across
 * the table reads nothing from it. Only the moon changes: it waxes night by
 * night, the one thing in the picture that says how far the game has gone.
 * The skyline is Panjim from the river: the white church on its hill with
 * the zigzag stairs, tiled roofs and palms, a few windows still lit.
 *
 * Colours are art in the DESIGN_LANGUAGE §II.2 sense: they belong to this
 * surface. The lit windows' warm yellow is lamplight, not `os-gold`.
 */

// Stars: [x, y, r, alpha], fixed, so the sky never reshuffles between renders.
const STARS = [
  [18, 22, 1.1, 0.8], [44, 54, 0.8, 0.5], [70, 12, 1.2, 0.85], [96, 40, 0.7, 0.45], [122, 74, 0.9, 0.6],
  [148, 24, 0.8, 0.55], [176, 58, 1.2, 0.85], [204, 12, 0.7, 0.5], [226, 86, 0.8, 0.45], [252, 34, 1, 0.7],
  [12, 104, 0.7, 0.4], [60, 120, 0.8, 0.35], [104, 108, 1, 0.55], [160, 116, 0.7, 0.4], [196, 132, 0.9, 0.45],
  [238, 120, 0.7, 0.35], [372, 150, 0.8, 0.4], [366, 14, 0.8, 0.5], [384, 112, 1, 0.6], [342, 160, 0.7, 0.35],
  [86, 152, 0.7, 0.3], [140, 158, 0.8, 0.3], [30, 160, 0.6, 0.3], [276, 104, 0.8, 0.5], [300, 150, 0.7, 0.4],
  [212, 168, 0.7, 0.3], [262, 172, 0.6, 0.3],
];
// The few that twinkle (os.css .os-nt-sky__tw), kept clear of the words on the left.
const TWINKLE = [[226, 36], [272, 78], [380, 132], [246, 150]];

/** Moon light by night: a thin crescent on the first night, full by the fourth. */
const PHASE = [0.5, 0.95, 1.4, 1.95, 2.4];
const shadowOffset = (cycle, r) => PHASE[Math.min(PHASE.length - 1, Math.max(0, (cycle || 1) - 1))] * r;

/**
 * The sky band at the top of every Night screen: 390 × 250 units, sliced to
 * the box from the bottom (the river stays put). The moon hangs top right,
 * over the church, clear of the words on the left; a 320 px phone loses
 * 35 units off each side and keeps both.
 */
export function NightSky({ cycle = 1, compact = false, className = '' }) {
  // A compact sky (the pick screens) shows only the bottom 150 units, so the moon hangs lower.
  const mx = 312, my = compact ? 136 : 56, r = 23, off = shadowOffset(cycle, r);
  return (
    <svg className={`os-nt-sky__art ${className}`} viewBox="0 0 390 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="nt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050b1e" />
          <stop offset="0.55" stopColor="#0b1b44" />
          <stop offset="1" stopColor="#18397a" />
        </linearGradient>
        <radialGradient id="nt-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dfe9ff" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#9fbbf0" stopOpacity="0.09" />
          <stop offset="1" stopColor="#9fbbf0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nt-moon" cx="0.38" cy="0.34" r="0.75">
          <stop offset="0" stopColor="#fffdf3" />
          <stop offset="1" stopColor="#e3e6ee" />
        </radialGradient>
        <mask id={`nt-phase-${cycle}-${my}`}>
          <rect x={mx - r - 2} y={my - r - 2} width={r * 2 + 4} height={r * 2 + 4} fill="#fff" />
          <circle cx={mx - off} cy={my - off * 0.18} r={r + 1} fill="#000" />
        </mask>
      </defs>
      <rect width="390" height="250" fill="url(#nt-sky)" />
      {STARS.map(([x, y, rr, a]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={rr} fill="#eaf3ff" opacity={a} />)}
      {TWINKLE.map(([x, y], k) => (
        <path key={`t${k}`} className="os-nt-sky__tw" style={{ animationDelay: `${-k * 1.1}s` }} d={`M${x} ${y - 4}L${x + 0.9} ${y - 0.9}L${x + 4} ${y}L${x + 0.9} ${y + 0.9}L${x} ${y + 4}L${x - 0.9} ${y + 0.9}L${x - 4} ${y}L${x - 0.9} ${y - 0.9}Z`} fill="#fff" />
      ))}
      <circle cx={mx} cy={my} r={r * 3.4} fill="url(#nt-halo)" />
      {/* the dark side, faintly there, then the lit part */}
      <circle cx={mx} cy={my} r={r} fill="#25365e" opacity="0.55" />
      <g mask={`url(#nt-phase-${cycle}-${my})`}>
        <circle cx={mx} cy={my} r={r} fill="url(#nt-moon)" />
        <circle cx={mx + 7} cy={my - 6} r="4" fill="#d6dae6" opacity="0.7" />
        <circle cx={mx + 10} cy={my + 8} r="2.6" fill="#d6dae6" opacity="0.6" />
        <circle cx={mx - 3} cy={my + 10} r="2" fill="#d6dae6" opacity="0.5" />
      </g>
      <Skyline />
    </svg>
  );
}

/**
 * Panjim at night, from the river: low roofs and palms on the left, under the
 * words, and the white church on its hill on the right, under the moon.
 * Silhouettes in two depths, a few lit windows. Drawn on the bottom 70 units.
 */
function Skyline() {
  return (
    <g>
      {/* the far bank */}
      <path d="M0 222 C50 212 96 214 140 218 C170 210 196 206 230 208 C270 204 330 206 390 214 L390 250 L0 250 Z" fill="#0c1f46" />
      {/* near roofs, the stairs, the church, more roofs */}
      <path
        d={[
          'M0 250 L0 230 L12 223 L26 230 L26 227 L40 220 L54 227 L54 224 L66 218 L78 224 L78 230 L94 230 L94 226 L108 220 L122 226 L122 232',
          'L196 232 L196 228 L204 228 L204 224 L212 224 L212 220 L220 220 L220 216 L228 216 L228 212 L234 212',
          // the church: tower, the gable with its cross, tower
          'L234 188 L238 183 L242 188 L242 196 L254 196 L254 180 L263 172 L263 166 L265 166 L265 160 L267 160 L267 166 L269 166 L269 172',
          'L278 180 L278 196 L290 196 L290 188 L294 183 L298 188 L298 212 L304 212',
          'L304 216 L312 216 L312 220 L320 220 L320 224 L328 224 L328 228 L336 228 L336 232',
          'L352 232 L352 224 L366 216 L380 224 L380 228 L390 226 L390 250 Z',
        ].join(' ')}
        fill="#060e24"
      />
      {/* palms */}
      <path d="M150 250 C151 238 153 228 157 218" stroke="#060e24" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M157 218 C148 214 142 216 138 220 M157 218 C152 210 146 208 140 209 M157 218 C162 210 169 209 174 212 M157 218 C166 216 171 219 174 223 M157 218 C157 212 160 207 164 205" stroke="#060e24" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M184 250 C184 240 182 232 178 226" stroke="#060e24" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M178 226 C171 222 166 224 162 228 M178 226 C175 219 170 217 165 218 M178 226 C184 219 190 218 195 221 M178 226 C185 225 190 228 192 232" stroke="#060e24" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      {/* lit windows: the church door and a few houses */}
      <g fill="#ffd98a">
        <rect x="264" y="204" width="4" height="7" rx="2" opacity="0.85" />
        <rect x="237" y="200" width="2" height="4" opacity="0.6" />
        <rect x="293" y="200" width="2" height="4" opacity="0.6" />
        <rect x="18" y="236" width="3" height="3" opacity="0.7" />
        <rect x="62" y="230" width="3" height="3" opacity="0.5" />
        <rect x="112" y="234" width="3" height="3" opacity="0.6" />
        <rect x="364" y="228" width="3" height="3" opacity="0.6" />
      </g>
    </g>
  );
}

// --- Move pictures ------------------------------------------------------------------------
// 48 × 48 units, foam lines on the tile's deep blue (os.css .os-nt-art). One per move.

const L = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
// The holes in a picture (the eye's pupil, the magnifier's glass) take the colour behind them.
const HOLE = { fill: 'var(--nt-hole, #0e1f47)' };

const ART = {
  // An eye wide open in the dark, the moon caught in it.
  watch: (
    <>
      <path d="M6 25c5-9 11-13 18-13s13 4 18 13c-5 9-11 13-18 13S11 34 6 25Z" {...L} />
      <circle cx="24" cy="25" r="7" fill="currentColor" />
      <circle cx="24" cy="25" r="3" style={HOLE} />
      <circle cx="26.6" cy="22.4" r="1.6" fill="#fff" />
      <path d="M12 14l-2-4M24 10V6M36 14l2-4" {...L} strokeWidth={2.2} />
    </>
  ),
  // A long paper log spilling out, a magnifier on one line.
  scour: (
    <>
      <path d="M10 6h20v30l-3-2-3 2-3-2-3 2-3-2-3 2-2-1Z" {...L} strokeWidth={2.3} />
      <path d="M14 12h12M14 17h9M14 22h12M14 27h7" {...L} strokeWidth={2} opacity="0.7" />
      <circle cx="31" cy="30" r="7.5" {...L} style={HOLE} />
      <path d="M36.5 35.5 42 41" {...L} strokeWidth={3.2} />
      <path d="M28 30h6" {...L} strokeWidth={2} />
    </>
  ),
  // Two phones, a dotted line looping between them.
  trace: (
    <>
      <rect x="5" y="16" width="12" height="21" rx="2.6" {...L} />
      <rect x="31" y="16" width="12" height="21" rx="2.6" {...L} />
      <path d="M11 13c2-7 8-10 13-10s11 3 13 10" {...L} strokeDasharray="1 4.6" />
      <circle cx="24" cy="3.4" r="0" />
      <path d="M9 32h4M35 32h4" {...L} strokeWidth={2} />
      <path d="M21 28h6M24 25v6" {...L} strokeWidth={2.2} />
    </>
  ),
  // A shield with a heart.
  protect: (
    <>
      <path d="M24 5 39 10v11c0 10-6.4 17-15 21-8.6-4-15-11-15-21V10Z" {...L} />
      <path d="M24 31c-6-4-8.6-7-8.6-10.2 0-2.6 2-4.4 4.4-4.4 1.8 0 3.2 1 4.2 2.6 1-1.6 2.4-2.6 4.2-2.6 2.4 0 4.4 1.8 4.4 4.4 0 3.2-2.6 6.2-8.6 10.2Z" fill="currentColor" />
    </>
  ),
  // A photo handed on: a polaroid tilted out of a ghost's sheet.
  pass: (
    <>
      <path d="M4 42V26a9 9 0 0 1 18 0v16l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4Z" {...L} strokeWidth={2.3} />
      <circle cx="10" cy="27" r="1.6" fill="currentColor" />
      <circle cx="16" cy="27" r="1.6" fill="currentColor" />
      <g transform="rotate(12 34 18)">
        <rect x="24" y="6" width="20" height="23" rx="1.6" {...L} />
        <rect x="27.5" y="9.5" width="13" height="11" fill="currentColor" opacity="0.55" />
      </g>
      <path d="M19 18c2-2 4-3 6-3" {...L} strokeWidth={2} strokeDasharray="1 3.4" />
    </>
  ),
  // A ballot with one name ringed: the Killers' poll.
  hunt: (
    <>
      <rect x="9" y="5" width="30" height="38" rx="3" {...L} />
      <path d="M15 14h4M23 14h10M15 24h4M23 24h10M15 34h4M23 34h10" {...L} strokeWidth={2} opacity="0.65" />
      <ellipse cx="27" cy="24" rx="11" ry="5.6" {...L} strokeWidth={2.4} transform="rotate(-6 27 24)" />
    </>
  ),
  // An envelope with a wax seal: the offer.
  recruit: (
    <>
      <rect x="5" y="12" width="38" height="26" rx="3" {...L} />
      <path d="M6 14l18 14 18-14" {...L} />
      <circle cx="24" cy="29" r="5.4" fill="currentColor" />
    </>
  ),
  // The moon, for the pages that aren't a move.
  moon: <path d="M33 33A14 14 0 1 1 18 10a11.4 11.4 0 0 0 15 23Z" fill="currentColor" />,
};

/** One move's picture on its tile. `size` is the tile's side in CSS px. */
export function MoveArt({ kind, size = 52, done = false, className = '' }) {
  return (
    <span className={`os-nt-art ${done ? 'os-nt-art--done' : ''} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size * 0.66} height={size * 0.66}>{ART[kind] ?? ART.moon}</svg>
      {done && (
        <span className="os-nt-art__tick">
          <svg viewBox="0 0 24 24" width="12" height="12"><path d="m4.5 12.8 5 5L19.8 6.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      )}
    </span>
  );
}

/**
 * The same picture without its tile: a line icon in `currentColor`, for the
 * Night app's light surfaces (the sheet, the dock, the room's markers).
 * `size` is the icon's side in CSS px.
 */
export function MoveGlyph({ kind, size = 22, className = '' }) {
  return (
    <svg className={`os-nt-glyph ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      {ART[kind] ?? ART.moon}
    </svg>
  );
}
