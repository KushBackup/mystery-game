/**
 * The phone's wallpaper: the venue itself. A photo of Backroom (Anjuna) under
 * its red neon, so the phone in your hand looks out on the room you're
 * standing in.
 *
 * The blur is baked into backroom.webp (ffmpeg gblur, sigma 2.5), not a CSS
 * filter: a live blur over the whole screen is exactly the per-frame repaint
 * that the old animated sea wallpaper cost a mid-range Android (2026-10-03).
 * Only a little, so the room still reads as the room.
 *
 * 'lock' is lighter; 'home' is dimmer so icons and labels read on top.
 */
import React from 'react';
import backroom from './backroom.webp';

const SHADE = { lock: 0.18, home: 0.38 };

export default function Wallpaper({ variant = 'home', className, style }) {
  const shade = SHADE[variant] ?? SHADE.home;
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#140504',
        backgroundImage: [
          'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45))',
          `linear-gradient(rgba(0, 0, 0, ${shade}), rgba(0, 0, 0, ${shade}))`,
          `url(${backroom})`,
        ].join(', '),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    />
  );
}
