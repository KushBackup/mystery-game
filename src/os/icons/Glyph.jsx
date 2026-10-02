/**
 * The phone's small one-colour glyphs: nav bars, buttons, list rows, the
 * status bar. Smooth vector shapes on a 24 x 24 grid, filled (or stroked) in
 * `color`, which defaults to currentColor so a glyph takes the text colour
 * around it. `size` is the rendered height in CSS px.
 *
 * Drawn to sit with the older-iOS look: solid, rounded, slightly heavy.
 */
import React from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
const hole = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

const G = {
  back: <path d="M15.5 4 7.5 12l8 8" {...S} />,
  forward: <path d="m8.5 4 8 8-8 8" {...S} />,
  check: <path d="m4.5 12.8 5 5L19.8 6.5" {...S} strokeWidth={3.4} />,
  cross: <path d="M5.5 5.5l13 13m0-13-13 13" {...S} strokeWidth={3.2} />,
  plus: <path d="M12 4.5v15M4.5 12h15" {...S} strokeWidth={3.4} />,
  dots: (
    <>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" strokeWidth="2.8" />
      <path d="m14.8 14.8 6 6" {...S} strokeWidth={3.2} />
    </>
  ),
  send: (
    <>
      <path d="M21.800 2.700 2.800 10.300l6.800 2.700Z" />
      <path d="M21.800 2.700 14.200 21.200 11 14.300Z" />
    </>
  ),
  lock: (
    <>
      <path d="M7 10.5V8a5 5 0 0 1 10 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="4.5" y="10" width="15" height="11" rx="2.4" />
    </>
  ),
  unlock: (
    <>
      <path d="M7 10.5V8a5 5 0 0 1 9.6-2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="4.5" y="10" width="15" height="11" rx="2.4" />
    </>
  ),
  camera: (
    <path
      fillRule="evenodd"
      d={`M8.4 4.5h7.2l1.5 2.5H20a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2.9ZM12 9.2a4.2 4.2 0 1 0 .01 0Z`}
    />
  ),
  photo: (
    <>
      <rect x="2.8" y="4.5" width="18.4" height="15" rx="2.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="8.4" cy="10" r="1.9" />
      <path d="M4.4 18.2 9.6 12.6l3.4 3.6 2.8-2.9 4.2 4.9Z" />
    </>
  ),
  chat: <path d="M5 3.5h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7.5L6 21.6V17.5H5a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z" />,
  skull: (
    <path
      fillRule="evenodd"
      d={`M12 2C6.8 2 3.4 5.6 3.4 10.2c0 2.8 1.3 4.8 3.2 5.9V20c0 .6.4 1 1 1H9v-2h1.5v2h3v-2H15v2h1.4c.6 0 1-.4 1-1v-3.9c1.9-1.1 3.2-3.1 3.2-5.9C20.6 5.6 17.2 2 12 2Z${hole(8.5, 10.8, 2.4)}${hole(15.5, 10.8, 2.4)}M12 12.6l-1.5 2.4h3Z`}
    />
  ),
  crown: <path d="M2.8 18.6 1.8 7.4l5.6 4.6L12 4l4.6 8 5.6-4.6-1 11.2c0 .4-.4.8-.8.8H3.6c-.4 0-.8-.4-.8-.8Z" />,
  star: <path d="m12 2.4 2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.4l-6 3.3 1.4-6.7-5-4.6 6.7-.8Z" />,
  moon: <path d="M20.4 14.8A9 9 0 1 1 9.2 3.6a7.4 7.4 0 0 0 11.2 11.2Z" />,
  heart: <path d="M12 21.2C4.4 15 2 11.6 2 8c0-2.9 2.2-5 4.9-5 2 0 3.9 1.1 5.1 3.1C13.2 4.1 15.1 3 17.1 3 19.8 3 22 5.100 22 8c0 3.600-2.400 7-10 13.200Z" />,
  eye: (
    <path
      fillRule="evenodd"
      d={`M1.6 12C4.600 6.800 8 4.600 12 4.600S19.400 6.800 22.400 12c-3 5.200-6.400 7.400-10.400 7.400S4.600 17.200 1.600 12Z${hole(12, 12, 4.4)}${hole(12, 12, 2)}`}
    />
  ),
  shield: <path d="M12 2.2 20 5.200v6c0 5-3.400 8.800-8 10.800-4.600-2-8-5.800-8-10.800v-6Z" />,
  whale: <path transform="scale(0.44) translate(0 -1)" d="M54 34C54 42 46 46 35 46C27 46 21.500 43 18 38C15.500 34.500 14.500 30 13 25.500C10.500 26.500 7.500 26 5 23.500C8 20.500 11.500 19.500 14.500 20.500C15.500 17 17.500 14.500 20 13C20.500 17 21.500 21 24 24C27 22.500 31 22 35 22C46 22 54 26 54 34Z" />,
  bell: <path d="M12 2.400c-3.800 0-6 2.800-6 6.200v3.700L4 17.200h16l-2-4.900V8.600c0-3.400-2.200-6.200-6-6.200ZM9.400 19h5.200a2.600 2.600 0 0 1-5.200 0Z" />,
  alarm: (
    <>
      <circle cx="12" cy="13" r="7.600" fill="none" stroke="currentColor" strokeWidth="2.600" />
      <path d="M12 8.800V13l3 2" {...S} strokeWidth={2.400} />
      <path d="M3 6.600A5 5 0 0 1 7 3M21 6.600A5 5 0 0 0 17 3" {...S} strokeWidth={2.400} />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3h10v6.200c0 3.200-2.200 5.200-5 5.200s-5-2-5-5.200Z" />
      <path d="M7 5H3.600c0 3.400 1.400 5.200 3.800 5.600M17 5h3.400c0 3.400-1.400 5.200-3.800 5.600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.600 14h2.800l.6 3.600H10Z" />
      <rect x="7.600" y="17.600" width="8.800" height="3.200" rx="1" />
    </>
  ),
  ghost: (
    <path
      fillRule="evenodd"
      d={`M12 2.400c-4.400 0-7 3.400-7 7.600v10.600c0 .6.700.9 1.100.5l1.700-1.700 2 2c.4.400 1 .4 1.400 0l.8-.8.800.8c.4.400 1 .4 1.400 0l2-2 1.700 1.700c.4.400 1.100.1 1.100-.5V10c0-4.200-2.600-7.600-7-7.600Z${hole(9.200, 10.200, 1.800)}${hole(14.800, 10.200, 1.800)}`}
    />
  ),
  pencil: (
    <>
      <path d="M15.6 3.6a2.300 2.300 0 0 1 3.300 0l1.500 1.500a2.300 2.300 0 0 1 0 3.300L9 19.800 3.400 21a.4.4 0 0 1-.5-.5L4.200 15Z" />
      <path d="m13.600 5.600 4.800 4.800" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.400" />
    </>
  ),
  question: (
    <path
      fillRule="evenodd"
      d="M12 1.800a10.200 10.200 0 1 1 0 20.400 10.200 10.200 0 0 1 0-20.400Zm-.2 4.300c-2.400 0-4 1.400-4.200 3.500h2.600c.1-.8.700-1.300 1.500-1.300.9 0 1.500.5 1.500 1.300 0 .7-.3 1.100-1.300 1.700-1.200.7-1.700 1.500-1.600 2.800v.5h2.500v-.4c0-.8.300-1.100 1.300-1.700 1.200-.7 1.900-1.600 1.900-2.900 0-2.100-1.700-3.500-4.200-3.500Zm-.1 9.100a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3Z"
    />
  ),
  vote: (
    <>
      <path d="M8 2.600h8a1 1 0 0 1 1 1V11H7V3.600a1 1 0 0 1 1-1Z" opacity=".55" />
      <path d="m9.400 6.600 1.800 1.800 3.400-3.600" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'normal' }} />
      <path fillRule="evenodd" d="M3 10.400h18a1 1 0 0 1 1 1V20a1.600 1.600 0 0 1-1.600 1.600H3.600A1.600 1.600 0 0 1 2 20v-8.600a1 1 0 0 1 1-1ZM8 13.400v1.800h8v-1.800Z" />
    </>
  ),
};

function frame(w, h, size, className, style, title, children) {
  return (
    <svg
      width={(size * w) / h}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

export default function Glyph({ name, size = 16, color = 'currentColor', className, style, title }) {
  if (name === 'signal') return <Signal size={size} color={color} className={className} style={style} title={title} />;
  if (name === 'wifi') return <Wifi size={size} color={color} className={className} style={style} title={title} />;
  if (name === 'battery') return <Battery level={1} size={size} color={color} className={className} style={style} title={title} />;
  const shape = G[name];
  if (!shape) return null;
  return frame(24, 24, size, className, { color, fill: color, ...style }, title, shape);
}

/** Five bars, the old iOS signal meter. `size` is the height. */
function Signal({ size = 10, color = 'currentColor', className, style, title }) {
  return frame(17, 11, size, className, { color, ...style }, title, (
    <g fill={color}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 3.5} y={10.200 - (i * 2 + 2.600)} width="2.600" height={i * 2 + 2.600 - 0.200} rx="0.600" />
      ))}
    </g>
  ));
}

/** Three arcs and a dot. */
function Wifi({ size = 10, color = 'currentColor', className, style, title }) {
  return frame(16, 12, size, className, { color, ...style }, title, (
    <g fill="none" stroke={color} strokeLinecap="round">
      <path d="M1.400 4.400a9.400 9.400 0 0 1 13.200 0" strokeWidth="1.800" />
      <path d="M3.800 6.900a6 6 0 0 1 8.400 0" strokeWidth="1.800" />
      <path d="M6.200 9.300a2.600 2.600 0 0 1 3.600 0" strokeWidth="1.800" />
      <circle cx="8" cy="11" r="0.700" fill={color} stroke="none" />
    </g>
  ));
}

/**
 * The battery: an outline with a nub, and a charge that drains from the right.
 * `size` is the width (the body is about half as tall). `low` paints it red.
 */
export function Battery({ level = 1, size = 24, color = 'currentColor', low = false, className, style, title }) {
  const clamped = Math.max(0, Math.min(1, Number(level) || 0));
  const w = 19 * clamped;
  const h = Math.round(size * 0.46);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 26 12"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="0.600" y="0.600" width="22" height="10.800" rx="2.600" fill="none" stroke={color} strokeWidth="1.100" opacity="0.85" />
      <path d="M24 4h.8c.7 0 1.200.5 1.200 1.200v1.600c0 .7-.5 1.200-1.200 1.200H24Z" fill={color} opacity="0.85" />
      {w > 0 && <rect x="2.200" y="2.200" width={w} height="7.600" rx="1.300" fill={low ? '#FF3B30' : color} />}
    </svg>
  );
}
