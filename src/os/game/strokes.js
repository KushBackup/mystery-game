/**
 * A drawing as a short string, so it fits in one Firestore doc and every
 * phone redraws it the same way at any size.
 *
 * The board is BOARD × BOARD units. A stroke is one character for its ink,
 * then each point as four hex digits (x, y). Strokes are joined by commas:
 *
 *   "0" + "1a2b" + "1c2d" ... , "2" + ...
 *
 * Pure: no DOM, so the bots and the host can read it too.
 */

export const BOARD = 256;

// The phone's own colours (src/index.css, --color-os-*), as canvas needs literal values.
export const INKS = ['#0E1626', '#FF3B30', '#3D8BF2']; // ink, red, sea
export const PAPER = '#EAF3FF'; // foam

const hex2 = (n) => Math.max(0, Math.min(BOARD - 1, Math.round(n))).toString(16).padStart(2, '0');

/** @param strokes [{ ink, points: [[x, y]] }] in board units */
export function encode(strokes) {
  return strokes
    .filter((s) => s.points.length)
    .map((s) => `${s.ink}${s.points.map(([x, y]) => hex2(x) + hex2(y)).join('')}`)
    .join(',');
}

export function decode(str) {
  if (!str) return [];
  return String(str).split(',').map((part) => {
    const ink = Number(part[0]) || 0;
    const points = [];
    for (let i = 1; i + 4 <= part.length; i += 4) points.push([parseInt(part.slice(i, i + 2), 16), parseInt(part.slice(i + 2, i + 4), 16)]);
    return { ink: ink < INKS.length ? ink : 0, points };
  }).filter((s) => s.points.length);
}

/** Paint strokes onto a 2D context `size` pixels square. */
export function paint(g, strokes, size) {
  const k = size / BOARD;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, size, size);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.lineWidth = Math.max(2, 3.2 * k);
  for (const s of strokes) {
    g.strokeStyle = INKS[s.ink] ?? INKS[0];
    g.fillStyle = g.strokeStyle;
    const [x0, y0] = s.points[0];
    if (s.points.length === 1) {
      g.beginPath();
      g.arc(x0 * k, y0 * k, g.lineWidth / 2, 0, Math.PI * 2);
      g.fill();
      continue;
    }
    g.beginPath();
    g.moveTo(x0 * k, y0 * k);
    for (let i = 1; i < s.points.length; i++) g.lineTo(s.points[i][0] * k, s.points[i][1] * k);
    g.stroke();
  }
}
