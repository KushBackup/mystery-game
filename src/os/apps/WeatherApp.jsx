import React from 'react';
import { AppFrame } from '../ui';
import { editionDay } from '../news';
import { SKY_WORD, dayOf } from '../weather';
import { timeOfDay } from '../words';
import { useWorldClock } from '../hooks';

/**
 * Weather: the sky over the town the story is set in. It gets worse every
 * day on a fixed curve (the pack's `weather.days`), so every phone shows the
 * same forecast whatever the room does, and only the finale's sky depends on
 * who won. Pure atmosphere, in the iOS 6 card style: the place, a big thin
 * temperature, an hourly strip and the days ahead.
 */

export default function WeatherApp({ ctx, onClose }) {
  const { game, pack } = ctx;
  const w = pack.weather;
  const clock = useWorldClock(game);
  if (!w) return <AppFrame title="Weather" onBack={onClose} tone="dark" dark><p className="p-6 text-center opacity-70">No forecast here.</p></AppFrame>;

  const day = editionDay(game);
  const today = game.phase === 'finale' && w.after ? w.after[game.winner === 'faithful' ? 'faithful' : 'killers'] : dayOf(w, day);
  const night = timeOfDay(game.phase) === 'night';
  const hour = Number(clock.slice(0, 2));
  const temp = Math.round(today.lo + (today.hi - today.lo) * Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2)));
  const hours = [
    ['01:00', 'night', today.lo],
    ['07:00', today.sky, today.lo + 1],
    ['12:00', today.sky, today.hi],
    ['17:00', today.sky, today.hi - 1],
    ['21:00', 'night', today.lo + 1],
  ];
  const ahead = [1, 2, 3, 4].map((n) => ({ n: day + n, ...dayOf(w, day + n) }));

  return (
    <AppFrame title="Weather" onBack={onClose} tone="dark" dark bodyClass={`os-weather ${night ? 'os-weather--night' : ''} os-weather--${today.sky}`}>
      <div className="text-center pt-6 px-4">
        <p className="text-[30px] font-light leading-none text-white os-pixel-shadow">{w.place}</p>
        <p className="text-[15px] mt-1 text-white/85">{SKY_WORD[today.sky]}</p>
        <div className="flex justify-center mt-3"><Sky kind={night && today.sky === 'clear' ? 'night' : today.sky} size={96} /></div>
        <p className="text-[84px] leading-none font-extralight tracking-tight text-white tabular-nums os-pixel-shadow">{temp}°</p>
        <p className="text-[15px] text-white/85 mt-1">H {today.hi}°  L {today.lo}°</p>
        <p className="text-[16px] text-white mt-3 os-balance">{today.line}</p>
      </div>

      {today.alert && (
        <div className="os-weather__alert mx-3 mt-4">
          <span className="os-weather__alert-tag">ALERT</span>
          <span>{today.alert}</span>
        </div>
      )}

      <div className="os-weather__card mx-3 mt-4">
        <div className="grid grid-cols-5 text-center py-3">
          {hours.map(([t, sky, deg]) => (
            <div key={t}>
              <p className="text-[12px] font-bold text-white/80">{t}</p>
              <div className="flex justify-center my-1"><Sky kind={sky === 'night' ? (today.sky === 'clear' ? 'night' : 'nightcloud') : sky} size={36} /></div>
              <p className="text-[15px] font-bold text-white tabular-nums">{deg}°</p>
            </div>
          ))}
        </div>
      </div>

      <div className="os-weather__card mx-3 mt-3 mb-8">
        {ahead.map((d) => (
          <div key={d.n} className="os-weather__row">
            <span className="flex-1 text-[16px] font-bold text-white">Day {d.n}</span>
            <Sky kind={d.sky} size={34} />
            <span className="w-[86px] text-right text-[16px] text-white tabular-nums">{d.hi}° <span className="text-white/60">{d.lo}°</span></span>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}

/** The weather glyphs: sun, moon, cloud, rain, a bolt. Smooth, glossy, iOS 6 style. */
function Sky({ kind, size = 40 }) {
  const cloud = (dark = false) => (
    <path d="M18 46c-6 0-10-3.800-10-8.600 0-4.600 3.600-8.200 8.400-8.500 1.800-5.600 7-9.300 13-9.300 7 0 12.700 5 13.600 11.700 4.400.5 7.200 3.800 7.200 7.600 0 4.300-3.400 7.100-8 7.100Z" fill={dark ? '#c3cad6' : '#fff'} stroke={dark ? '#8b95a5' : '#d5dde8'} strokeWidth="1" />
  );
  const rain = (n) => Array.from({ length: n }, (_, i) => <path key={i} d={`M${18 + i * 9} 50l-3 7`} stroke="#9fd0ff" strokeWidth="2.400" strokeLinecap="round" />);
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))' }}>
      {kind === 'clear' && <><circle cx="30" cy="30" r="13" fill="#ffd84a" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="29" y="6" width="2.400" height="7" rx="1.200" fill="#ffd84a" transform={`rotate(${i * 45} 30 30)`} />)}</>}
      {kind === 'night' && <path d="M34 12A18 18 0 1 0 47 40 14 14 0 0 1 34 12Z" fill="#fff4c2" />}
      {kind === 'nightcloud' && <><path d="M36 8A13 13 0 1 0 46 28 10 10 0 0 1 36 8Z" fill="#fff4c2" />{cloud(true)}</>}
      {kind === 'cloud' && <><circle cx="22" cy="22" r="9" fill="#ffd84a" />{cloud()}</>}
      {kind === 'rain' && <>{cloud()}{rain(3)}</>}
      {kind === 'heavy' && <>{cloud(true)}{rain(4)}</>}
      {kind === 'storm' && <>{cloud(true)}<path d="M31 44l-6 9h5l-3 7 9-11h-5l3-5Z" fill="#ffd84a" stroke="#d99a14" strokeWidth="0.800" />{rain(2)}</>}
    </svg>
  );
}
