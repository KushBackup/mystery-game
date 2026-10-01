import React from 'react';

/**
 * The News app's pictures: small drawn scenes, one per `art` name used in
 * data/packs/deepblue.news.js. Smooth vector shapes in the phone's own blues
 * (never a hue outside the DEEP BLUE palette), a 16:9 frame, no text a reader
 * could mistake for a headline. Scores are the only place gold appears.
 *
 * The frame is `slice`d, so the same scene works as a full-width lead picture
 * and as a square thumbnail: keep the subject near the middle.
 */

const C = {
  abyss: '#050E24', navy: '#0B1D45', deep: '#12306B', ocean: '#1E56B0', sea: '#3D8BF2',
  foam: '#EAF3FF', chrome: '#8FA3C2', red: '#FF3B30', coral: '#FF7A59', gold: '#FFCC33', ink: '#0a0f1c',
};

/** The whale from the app's own icon (icons/Glyph.jsx), centred on its middle. */
const WHALE = 'M54 34C54 42 46 46 35 46C27 46 21.500 43 18 38C15.500 34.500 14.500 30 13 25.500C10.500 26.500 7.500 26 5 23.500C8 20.500 11.500 19.500 14.500 20.500C15.500 17 17.500 14.500 20 13C20.500 17 21.500 21 24 24C27 22.500 31 22 35 22C46 22 54 26 54 34Z';
const Whale = ({ x, y, s = 1, fill = C.foam }) => <path d={WHALE} fill={fill} transform={`translate(${x} ${y}) scale(${s}) translate(-29.5 -29.5)`} />;

function Phone({ x, y, w = 70, h = 132, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.16} fill={C.ink} stroke={C.chrome} strokeWidth="1.5" />
      <rect x={x + 5} y={y + 12} width={w - 10} height={h - 24} rx="3" fill="url(#na-screen)" />
      <circle cx={x + w / 2} cy={y + h - 6} r="3" fill="none" stroke={C.chrome} strokeWidth="1" />
      {children}
    </g>
  );
}

const SCENES = {
  phone: () => (
    <>
      {[84, 62, 40].map((r, i) => <circle key={r} cx="160" cy="92" r={r} fill="none" stroke={C.sea} strokeOpacity={0.5 - i * 0.12} strokeWidth="1.5" />)}
      <Phone x={125} y={24}>
        <Whale x={160} y={84} s={0.78} />
        <text x="160" y="126" textAnchor="middle" fontSize="7" fontWeight="700" letterSpacing="1" fill={C.foam}>DEEP BLUE</text>
      </Phone>
    </>
  ),

  bell: () => (
    <>
      <circle cx="116" cy="54" r="17" fill={C.chrome} />
      <circle cx="204" cy="54" r="17" fill={C.chrome} />
      <path d="M122 150l-10 18M198 150l10 18" stroke={C.chrome} strokeWidth="5" strokeLinecap="round" />
      <circle cx="160" cy="98" r="58" fill={C.foam} />
      <circle cx="160" cy="98" r="50" fill={C.navy} />
      <text x="160" y="110" textAnchor="middle" fontSize="32" fontWeight="200" fill={C.foam}>07:00</text>
      <path d="M54 72Q44 98 54 124M266 72Q276 98 266 124M40 62Q26 98 40 134M280 62Q294 98 280 134" fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
    </>
  ),

  tape: () => (
    <>
      <g transform="rotate(-9 160 90)"><rect x="-40" y="62" width="400" height="26" fill="url(#na-tape)" /></g>
      <g transform="rotate(7 160 90)"><rect x="-40" y="98" width="400" height="26" fill="url(#na-tape)" /></g>
      <circle cx="160" cy="92" r="9" fill={C.abyss} stroke={C.chrome} strokeWidth="2" />
    </>
  ),

  cafe: () => (
    <>
      <path d="M0 12Q80 30 160 12T320 12" fill="none" stroke={C.chrome} strokeOpacity="0.6" />
      {[20, 70, 120, 170, 220, 270].map((x) => <circle key={x} cx={x} cy={x % 100 ? 21 : 17} r="3" fill={C.foam} />)}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} fill={i % 2 ? C.foam : C.ocean}>
          <rect x={i * 40} y="34" width="40" height="22" />
          <path d={`M${i * 40} 56a20 20 0 0 0 40 0Z`} />
        </g>
      ))}
      <rect x="22" y="86" width="276" height="80" rx="4" fill="url(#na-warm)" />
      {[70, 160, 250].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="140" rx="22" ry="5" fill={C.navy} />
          <rect x={x - 2} y="140" width="4" height="22" fill={C.navy} />
          <circle cx={x - 15} cy="116" r="7" fill={C.navy} />
          <circle cx={x + 15} cy="116" r="7" fill={C.navy} />
          <path d={`M${x - 24} 138q9-20 18-4M${x + 6} 134q9-16 18 4`} fill={C.navy} />
        </g>
      ))}
    </>
  ),

  run: () => (
    <>
      <path d="M40 120C80 60 120 120 160 76S240 80 300 96" fill="none" stroke={C.chrome} strokeOpacity="0.35" strokeDasharray="3 6" strokeWidth="2" />
      {[[168, 56, 112], [250, 84, 140]].map(([x, top, gap], i) => (
        <g key={i} fill={C.coral}>
          <rect x={x} y="0" width="30" height={top} /><rect x={x - 4} y={top - 8} width="38" height="8" rx="2" />
          <rect x={x} y={gap} width="30" height={180 - gap} /><rect x={x - 4} y={gap} width="38" height="8" rx="2" />
        </g>
      ))}
      <Whale x={84} y={92} s={1.5} />
      {[[40, 70, 4], [52, 54, 3], [30, 46, 2.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={C.foam} strokeOpacity="0.6" />)}
    </>
  ),

  street: () => (
    <>
      {[[0, 70, 52], [48, 48, 60], [104, 82, 44], [146, 38, 66], [208, 66, 50], [254, 54, 70]].map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={150 - top} fill={i % 2 ? C.ocean : C.deep} />
          {Array.from({ length: Math.floor((150 - top - 10) / 16) * 3 }, (_, k) => (
            <rect key={k} x={x + 6 + (k % 3) * Math.floor((w - 8) / 3)} y={top + 8 + Math.floor(k / 3) * 16} width="8" height="9" fill={(k * 7 + i * 3) % 5 === 0 ? C.foam : C.navy} fillOpacity={(k * 7 + i * 3) % 5 === 0 ? 0.8 : 0.9} />
          ))}
        </g>
      ))}
      <rect y="146" width="320" height="34" fill={C.abyss} />
      {[30, 78, 130, 176, 220, 268, 304].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={136 - (i % 2)} r="5" fill={C.chrome} />
          <rect x={x - 5} y="141" width="10" height="26" rx="4" fill={C.chrome} />
          <circle cx={x + 6} cy="154" r="9" fill="url(#na-glow)" />
          <rect x={x + 4} y="151" width="4" height="6" rx="1" fill={C.foam} />
        </g>
      ))}
    </>
  ),

  ferry: () => (
    <>
      <circle cx="250" cy="52" r="34" fill="url(#na-glow)" /><circle cx="250" cy="52" r="18" fill={C.foam} />
      <rect y="112" width="320" height="68" fill={C.navy} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-20 + i * 90} ${126 + (i % 2) * 14}q22-8 45 0t45 0`} fill="none" stroke={C.foam} strokeOpacity="0.2" strokeWidth="2" />)}
      <path d="M62 118h196l-20 26H82Z" fill={C.abyss} stroke={C.chrome} strokeWidth="1.5" />
      <rect x="112" y="92" width="100" height="26" rx="3" fill={C.deep} stroke={C.chrome} strokeWidth="1" />
      <rect x="150" y="76" width="14" height="16" fill={C.deep} />
      {[120, 140, 160, 180, 196].map((x) => <rect key={x} x={x} y="100" width="9" height="9" rx="1" fill={C.foam} fillOpacity="0.85" />)}
      <path d="M62 118v-10M82 118v-10M238 118v-10M258 118v-10M62 108h20M238 108h20" stroke={C.chrome} strokeWidth="1.5" />
      <path d="M90 150h140M110 158h100" stroke={C.foam} strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  board: () => (
    <>
      {[[41, 0], [38, 1], [33, 2], [27, 3], [19, 4], [6, 5]].map(([score, i]) => {
        const last = i === 5;
        const y = 16 + i * 26;
        return (
          <g key={i}>
            <rect x="36" y={y} width="248" height="22" rx="5" fill={last ? C.red : C.deep} fillOpacity={last ? 0.9 : 1} />
            <text x="46" y={y + 15} fontSize="11" fontWeight="700" fill={C.chrome}>{i + 1}</text>
            <rect x="66" y={y + 8} width={52 + ((i * 17) % 30)} height="6" rx="3" fill={last ? C.foam : C.chrome} fillOpacity="0.5" />
            {last && <rect x="190" y={y + 4} width="44" height="14" rx="3" fill="none" stroke={C.foam} strokeWidth="1.5" />}
            {last && <text x="212" y={y + 15} textAnchor="middle" fontSize="9" fontWeight="800" fill={C.foam}>TAKEN</text>}
            <text x="274" y={y + 16} textAnchor="end" fontSize="14" fontWeight="800" fill={last ? C.foam : C.gold}>{score}</text>
          </g>
        );
      })}
    </>
  ),

  eyes: () => (
    <>
      {[-4, 116].map((dx) => (
        <g key={dx} transform={`translate(160 92) scale(0.78) translate(-160 -92) translate(${dx} 0)`}>
          <path d="M58 92Q103 48 148 92Q103 136 58 92Z" fill={C.foam} />
          <circle cx="126" cy="92" r="21" fill={C.ocean} /><circle cx="130" cy="92" r="10" fill={C.abyss} /><circle cx="124" cy="85" r="4" fill={C.foam} />
          <path d="M50 70Q103 24 156 66" fill="none" stroke={C.chrome} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),

  vigil: () => (
    <>
      <circle cx="248" cy="46" r="26" fill="url(#na-glow)" /><circle cx="248" cy="46" r="11" fill={C.foam} />
      <rect y="102" width="320" height="30" fill={C.navy} />
      <path d="M0 114q20-6 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke={C.foam} strokeOpacity="0.16" strokeWidth="2" />
      <rect y="132" width="320" height="48" fill={C.abyss} /><rect y="130" width="320" height="4" fill={C.deep} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 96 + i * 16;
        const lit = i < 4;
        return (
          <g key={i}>
            {lit && <circle cx={x} cy="101" r="22" fill="url(#na-glow)" />}
            <rect x={x - 4} y="108" width="8" height="22" rx="1.5" fill={C.chrome} fillOpacity={lit ? 1 : 0.5} />
            {lit && <ellipse cx={x} cy="101" rx="3.6" ry="7.5" fill={C.foam} />}
          </g>
        );
      })}
    </>
  ),

  servers: () => (
    <>
      {[34, 222].map((x) => <rect key={x} x={x} y="26" width="64" height="140" rx="3" fill="none" stroke={C.chrome} strokeOpacity="0.25" />)}
      <rect x="122" y="12" width="76" height="154" rx="4" fill={C.ink} stroke={C.chrome} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x="128" y={18 + i * 16} width="64" height="12" rx="2" fill={C.deep} />
          <circle cx="136" cy={24 + i * 16} r="2" fill={i === 4 ? C.red : C.sea} />
          <circle cx="143" cy={24 + i * 16} r="2" fill={C.foam} fillOpacity={i % 3 ? 0.9 : 0.25} />
          <path d={`M154 ${24 + i * 16}h30`} stroke={C.chrome} strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <path d="M160 166v8" stroke={C.chrome} strokeWidth="3" />
    </>
  ),

  deleted: () => (
    <>
      <Phone x={125} y={24}>
        <rect x="147" y="70" width="26" height="26" rx="6" fill="none" stroke={C.chrome} strokeOpacity="0.8" strokeDasharray="3 3" strokeWidth="1.5" />
        <text x="160" y="124" textAnchor="middle" fontSize="12" fontWeight="200" fill={C.foam} fillOpacity="0.8">07:00</text>
      </Phone>
    </>
  ),

  ring: () => (
    <>
      {[84, 62].map((r, i) => <circle key={r} cx="160" cy="92" r={r} fill="none" stroke={C.red} strokeOpacity={0.55 - i * 0.2} strokeWidth="2" />)}
      <Phone x={125} y={24}>
        <text x="160" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.foam}>SEE YOU</text>
        <text x="160" y="101" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.red}>AT SEVEN</text>
      </Phone>
    </>
  ),
};

export const NEWS_SCENES = Object.keys(SCENES);

/** A scene, filling its box. `label` is read out; with none the picture is decorative. */
export default function NewsArt({ scene, className = '', label }) {
  const draw = SCENES[scene] ?? SCENES.phone;
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={`block w-full h-full ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id="na-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#173a80" /><stop offset="1" stopColor={C.abyss} /></linearGradient>
        <linearGradient id="na-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sea} /><stop offset="0.55" stopColor={C.ocean} /><stop offset="1" stopColor={C.navy} /></linearGradient>
        <linearGradient id="na-warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.foam} stopOpacity="0.95" /><stop offset="1" stopColor={C.sea} stopOpacity="0.55" /></linearGradient>
        <radialGradient id="na-glow"><stop offset="0" stopColor={C.foam} stopOpacity="0.85" /><stop offset="1" stopColor={C.foam} stopOpacity="0" /></radialGradient>
        <pattern id="na-tape" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="11" height="22" fill={C.red} /><rect x="11" width="11" height="22" fill={C.foam} /></pattern>
      </defs>
      <rect width="320" height="180" fill="url(#na-bg)" />
      {draw()}
    </svg>
  );
}
