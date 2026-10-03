import React from 'react';

/**
 * The News app's pictures: hand-drawn ink-and-watercolour stills, one per
 * story, drawn in splash-film/news.html and shipped as public/news/<name>.webp
 * (1280 x 720). `scene` is the story's `art` name: an authored article's own
 * picture (data/packs/deepblue.news.js), or one of the four the room's events
 * use (src/os/news.js).
 *
 * The box crops with `object-fit: cover`, so the same picture is the
 * full-width lead and the square thumbnail: every drawing keeps its subject in
 * the middle. A new picture means a new scene in news.html, then a re-export
 * (splash-film/README.md), then its name here.
 */

const NEWS_SCENES = [
  'nine-dead', 'seven-am', 'stay-together', 'greenr-open',
  'ninety-seconds', 'panjim-stops', 'ferry-crews',
  'twenty-three', 'bars-split', 'nobody-wins',
  'scores-dispute', 'vigil',
  'cannot-delete', 'empty-servers',
  'final-board', 'last-call',
  'deleted', 'rings-again',
  'dawn-taken', 'dawn-clear', 'vote-out', 'vote-none',
  'still-sending',
];
const KNOWN = new Set(NEWS_SCENES);

/** A scene, filling its box. `label` is read out; with none the picture is decorative. */
export default function NewsArt({ scene, className = '', label }) {
  const name = KNOWN.has(scene) ? scene : 'nine-dead';
  return (
    <img
      src={`${import.meta.env.BASE_URL}news/${name}.webp`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`block w-full h-full object-cover ${className}`}
    />
  );
}
