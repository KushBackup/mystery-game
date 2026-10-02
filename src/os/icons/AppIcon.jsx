/**
 * App icons in the older-iOS manner: a rounded square, a vertical gradient, a
 * glossy highlight over the top half, a thin lit rim, and a glyph with a small
 * drop shadow under it. Drawn as vectors on a 60 x 60 grid so they stay crisp
 * at any size.
 *
 * Every icon is built by the same `Tile` so the home screen reads as one set.
 * `night` is on every player's phone whatever their role: keep it a plain moon
 * and stars, nothing that reads as a weapon or a mask.
 */
import React, { useId, useState, useEffect } from 'react';

const R = 13.500;

/** The clock glyph: real hands, ticking the second hand once a second. */
function ClockGlyph() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourAngle = h * 30 + m * 0.500;
  const minuteAngle = m * 6 + s * 0.100;
  const secondAngle = s * 6;
  return (
    <>
      <circle cx="30" cy="30" r="24.500" fill="#fff" />
      <circle cx="30" cy="30" r="24.500" fill="none" stroke="#c9ced6" strokeWidth="1.200" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i % 3 === 0 ? 29 : 29.500} y="7" width={i % 3 === 0 ? 2 : 1} height={i % 3 === 0 ? 5 : 3.200} fill="#1d2026" transform={`rotate(${i * 30} 30 30)`} />
      ))}
      <path d="M30 30V16" stroke="#1d2026" strokeWidth="3" strokeLinecap="round" transform={`rotate(${hourAngle} 30 30)`} />
      <path d="M30 30V11" stroke="#1d2026" strokeWidth="2.200" strokeLinecap="round" transform={`rotate(${minuteAngle} 30 30)`} />
      <path d="M30 34V9" stroke="#e8432d" strokeWidth="1.100" strokeLinecap="round" transform={`rotate(${secondAngle} 30 30)`} />
      <circle cx="30" cy="30" r="2.200" fill="#e8432d" />
    </>
  );
}

/** The shared tile: background, glyph (children), gloss, rim. */
function Tile({ id, stops, children, gloss = 1 }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => <stop key={c} offset={i / (stops.length - 1)} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${id}-gl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.78 * gloss} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.18 * gloss} />
        </linearGradient>
        <clipPath id={`${id}-clip`}><rect width="60" height="60" rx={R} /></clipPath>
        <filter id={`${id}-sh`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1.200" stdDeviation="0.900" floodColor="#000" floodOpacity="0.38" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="60" height="60" fill={`url(#${id}-bg)`} />
        <g filter={`url(#${id}-sh)`}>{children}</g>
        <path d="M0 0H60V25C47 33 13 33 0 25Z" fill={`url(#${id}-gl)`} />
      </g>
      <rect x="0.500" y="0.500" width="59" height="59" rx={R - 0.500} fill="none" stroke="#000" strokeOpacity="0.45" />
      <rect x="1.200" y="1.200" width="57.600" height="57.600" rx={R - 1.200} fill="none" stroke="#fff" strokeOpacity="0.28" />
    </>
  );
}

const gearTeeth = Array.from({ length: 8 }, (_, i) => i * 45);

const ART = {
  messages: {
    stops: ['#8cf27f', '#46d156', '#1b9e30'],
    draw: () => (
      <>
        <path d="M30 12C16.700 12 7 20 7 30c0 5.200 2.700 9.800 7 13.100-.2 3-1.600 5.700-3.800 7.700 4.800-.2 8.700-2.200 11.300-4.600 2.300.6 4.800.9 7.500.9 13.300 0 23-8 23-17.100S43.300 12 30 12Z" fill="#fff" />
      </>
    ),
  },

  deepblue: {
    stops: ['#6fc2ff', '#2f79de', '#0a2f78'],
    draw: () => (
      <>
        <path d="M14 0h8L36 60h-8Z M30 0h6L50 60h-6Z" fill="#fff" opacity="0.13" />
        <path d="M54 34C54 42 46 46 35 46C27 46 21.500 43 18 38C15.500 34.500 14.500 30 13 25.500C10.500 26.500 7.500 26 5 23.500C8 20.500 11.500 19.500 14.500 20.500C15.500 17 17.500 14.500 20 13C20.500 17 21.500 21 24 24C27 22.500 31 22 35 22C46 22 54 26 54 34Z" fill="#fff" />
        <path d="M20 36C26 43 36 44 46 40C42 45 34 46 28 45C24 44 21 41 20 36Z" fill="#9ccbff" />
        <circle cx="46" cy="31" r="1.700" fill="#0a2f78" />
        <path d="M41 21C41 17 42 14 45 12M41 21C42 17 46 15 49 15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      </>
    ),
  },

  news: {
    stops: ['#7d8794', '#3c4450', '#1c222b'],
    draw: () => (
      <>
        <rect x="11" y="9" width="38" height="43" rx="3" fill="#f4f1e8" />
        <rect x="11" y="9" width="38" height="11" rx="3" fill="#20262f" />
        <rect x="11" y="15" width="38" height="5" fill="#20262f" />
        <rect x="16" y="12" width="20" height="3" rx="1.200" fill="#f4f1e8" />
        <rect x="16" y="25" width="15" height="12" rx="1.500" fill="#6f8db3" />
        <path d="M16 37l5-5 3.500 3.500 3-3 3.500 4.500v1H16Z" fill="#3e5f8c" />
        <g fill="#8d8a80">
          <rect x="34" y="25" width="10" height="2.400" rx="1.200" />
          <rect x="34" y="30" width="10" height="2.400" rx="1.200" />
          <rect x="34" y="35" width="10" height="2.400" rx="1.200" />
          <rect x="16" y="41" width="28" height="2.400" rx="1.200" />
          <rect x="16" y="46" width="28" height="2.400" rx="1.200" />
        </g>
      </>
    ),
  },

  gallery: {
    stops: ['#ffffff', '#e9ecf0', '#bcc3cd'],
    draw: () => (
      <g transform="translate(30 30)">
        {['#f7c72d', '#f59a23', '#ef5a2c', '#d63384', '#8b4dbd', '#3d7de0', '#2fb4d4', '#5fc455'].map((c, i) => (
          <ellipse key={c} cx="0" cy="-10.500" rx="5.200" ry="10.500" fill={c} opacity="0.88" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="4.200" fill="#fff" opacity="0.55" />
      </g>
    ),
    gloss: 0.7,
  },

  clock: {
    stops: ['#4a4f58', '#1d2026', '#0a0b0e'],
    draw: () => <ClockGlyph />,
  },

  contacts: {
    stops: ['#d3a874', '#9a6c3c', '#62411f'],
    draw: () => (
      <>
        <rect x="12" y="8" width="35" height="44" rx="3" fill="#f6efe0" />
        <rect x="44" y="10" width="6" height="40" rx="1.500" fill="#ece3cf" />
        <g fill="#c9b78f">
          <rect x="47" y="14" width="3" height="4" rx="1" />
          <rect x="47" y="21" width="3" height="4" rx="1" />
          <rect x="47" y="28" width="3" height="4" rx="1" />
          <rect x="47" y="35" width="3" height="4" rx="1" />
        </g>
        <circle cx="29" cy="25" r="7" fill="#8a6a46" />
        <path d="M15.500 47c0-8 6-12 13.500-12s13.500 4 13.500 12Z" fill="#8a6a46" />
      </>
    ),
    gloss: 0.85,
  },

  notes: {
    stops: ['#fff6ad', '#f8e271', '#efc93f'],
    draw: () => (
      <>
        <rect x="0" y="0" width="60" height="14" fill="#9b7237" />
        <path d="M0 14h60" stroke="#6b4c1f" strokeWidth="1.500" />
        <path d="M4 7h52" stroke="#d6b36e" strokeWidth="1" strokeDasharray="2.500 2" />
        <g stroke="#6a8fcb" strokeWidth="1.100" opacity="0.8">
          <path d="M0 25h60M0 33h60M0 41h60M0 49h60" />
        </g>
        <path d="M11 14v46" stroke="#d65a4a" strokeWidth="1.100" opacity="0.8" />
        <path d="M17 29c4-2 5 3 9 1s5-3 8-1" fill="none" stroke="#3c3a35" strokeWidth="1.400" strokeLinecap="round" opacity="0.8" />
      </>
    ),
    gloss: 0.6,
  },

  night: {
    stops: ['#6b7de6', '#2c3aa6', '#0f1650'],
    draw: () => (
      <>
        <path d="M37 11A20 20 0 1 0 49 41 16 16 0 0 1 37 11Z" fill="#fff4c2" />
        <path d="m45 13 1.400 3.200 3.400.4-2.500 2.300.7 3.400L45 20.600l-3 1.700.7-3.400-2.500-2.300 3.400-.4Z" fill="#fff" />
        <circle cx="50" cy="29" r="1.500" fill="#fff" />
        <circle cx="42" cy="9" r="1.100" fill="#fff" opacity="0.8" />
      </>
    ),
  },

  weather: {
    stops: ['#7fc2ff', '#3f8be8', '#1d56b8'],
    draw: () => (
      <>
        <circle cx="23" cy="23" r="10" fill="#ffd84a" />
        <circle cx="23" cy="23" r="10" fill="none" stroke="#f5a623" strokeWidth="1.200" />
        <path d="M20 46c-5.500 0-9-3.400-9-7.800 0-4.200 3.300-7.500 7.800-7.700 1.600-5 6.200-8.300 11.600-8.300 6.200 0 11.300 4.500 12.100 10.400 4 .5 6.500 3.400 6.500 6.800 0 3.900-3.100 6.600-7.300 6.600Z" fill="#fff" />
      </>
    ),
  },
  // A pocket rule book with a hand-inked question mark: the Help app.
  help: {
    stops: ['#ffd27a', '#f5a524', '#c06a0c'],
    draw: () => (
      <g transform="rotate(-6 30 30)">
        <rect x="14" y="9" width="33" height="43" rx="3" fill="#fbf6e6" />
        <rect x="14" y="9" width="6" height="43" rx="2" fill="#2c4f8f" />
        <path d="M20 9v43" stroke="#1b3466" strokeWidth="1" />
        <g stroke="#c9d6ea" strokeWidth="1">
          <path d="M23 46h20M23 42h20" />
        </g>
        <path d="M27.500 22.500c0-3.600 2.600-6 6.300-6 3.700 0 6.300 2.300 6.300 5.500 0 2.600-1.600 3.900-3.300 5-1.500 1-2.100 1.700-2.100 3.400v1" fill="none" stroke="#24324f" strokeWidth="3.600" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34.700" cy="37.600" r="2.300" fill="#24324f" />
      </g>
    ),
    gloss: 0.8,
  },

  settings: {
    stops: ['#d7dbe0', '#9aa1ab', '#5f6671'],
    draw: () => (
      <g transform="translate(30 30)">
        {gearTeeth.map((a) => <rect key={a} x="-3.600" y="-22" width="7.200" height="9" rx="1.600" fill="#3b4048" transform={`rotate(${a})`} />)}
        <circle r="16.500" fill="#3b4048" />
        <circle r="13" fill="#59606a" />
        <circle r="6.600" fill="#c3c8cf" />
        <circle r="6.600" fill="none" stroke="#2c3036" strokeWidth="1.200" />
      </g>
    ),
  },
};

export default function AppIcon({ name, size = 60, className, style }) {
  const uid = useId().replace(/:/g, '');
  const art = ART[name];
  if (!art) return null;
  const id = `ai${uid}${name}`;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" className={className} style={{ display: 'block', ...style }}>
      <Tile id={id} stops={art.stops} gloss={art.gloss ?? 1}>{art.draw()}</Tile>
    </svg>
  );
}
