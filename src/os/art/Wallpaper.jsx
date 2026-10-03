/**
 * The phone's wallpaper: the deep, drawn as soft vector light. Sunlit water at
 * the top falling to the abyss, slow shafts of light, a great whale far below
 * and a few bubbles rising. Built the way a phone wallpaper of the era was: a
 * big smooth gradient with a little glow, nothing busy behind the icons.
 *
 * 'lock' is brighter with the whale lit along its back; 'home' is dimmer so
 * icons and labels read on top.
 *
 * It holds still (2026-10-03). The bubbles, the whale's drift and the swaying
 * shafts were CSS animations inside the SVG, which Chrome cannot hand to the
 * GPU: a mid-range Android phone repainted the whole screen every frame, and
 * with it the time-of-day filter and the dock's blur, all night long.
 */
import React, { useId } from 'react';

const VARIANTS = {
  lock: {
    sky: ['#58b0ff', '#2f78dc', '#173f8f', '#0a1f5c', '#050e24'],
    glow: 0.55,
    shaft: 0.16,
    whale: '#06143a',
    rim: '#6fb4ff',
  },
  home: {
    sky: ['#3d86e6', '#1f5aba', '#123a85', '#0a2058', '#050e24'],
    glow: 0.35,
    shaft: 0.09,
    whale: '#050f2e',
    rim: '#3d86e6',
  },
};

const BUBBLES = [
  [14, 118, 2.2, 9], [26, 140, 1.4, 12], [38, 128, 3, 8], [52, 150, 1.6, 14], [66, 122, 2.4, 10], [78, 144, 1.8, 11],
  [86, 112, 2.8, 13], [20, 96, 1.5, 15], [60, 104, 2, 9.5], [44, 154, 1.2, 12.5], // x, y, r, (seconds a rise took)
];

export default function Wallpaper({ variant = 'home', className, style }) {
  const v = VARIANTS[variant] ?? VARIANTS.home;
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 90 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', ...style }}
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          {v.sky.map((c, i) => <stop key={c} offset={[0, 0.22, 0.5, 0.76, 1][i]} stopColor={c} />)}
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#d6ecff" stopOpacity={v.glow} />
          <stop offset="1" stopColor="#d6ecff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f2ff" stopOpacity={v.shaft} />
          <stop offset="1" stopColor="#e4f2ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v.rim} stopOpacity="0.28" />
          <stop offset="0.35" stopColor={v.whale} />
        </linearGradient>
        <radialGradient id={`${id}v`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <rect width="90" height="160" fill={`url(#${id}s)`} />
      <rect width="90" height="100" fill={`url(#${id}g)`} />
      <g>
        <path d="M6 0h14L48 110H12Z" fill={`url(#${id}r)`} />
        <path d="M34 0h10L74 100H48Z" fill={`url(#${id}r)`} />
        <path d="M62 0h12L90 70v40H70Z" fill={`url(#${id}r)`} />
      </g>
      <g>
        <path
          transform="translate(8 80) scale(0.85)"
          fill={`url(#${id}w)`}
          d="M54 34C54 42 46 46 35 46C27 46 21.500 43 18 38C15.500 34.500 14.500 30 13 25.500C10.500 26.500 7.500 26 5 23.500C8 20.500 11.500 19.500 14.500 20.500C15.500 17 17.500 14.500 20 13C20.500 17 21.500 21 24 24C27 22.500 31 22 35 22C46 22 54 26 54 34Z"
        />
        <path transform="translate(8 80) scale(0.85)" d="M20 36C26 43 36 44 46 40C42 45 34 46 28 45C24 44 21 41 20 36Z" fill={v.rim} opacity="0.18" />
      </g>
      {BUBBLES.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r * 0.6}
          fill="none"
          stroke="#d6ecff"
          strokeWidth="0.35"
          opacity="0.6"
        />
      ))}
      <rect width="90" height="160" fill={`url(#${id}v)`} />
    </svg>
  );
}
