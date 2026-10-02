import React, { useId } from 'react';

/**
 * A contact photo DEEP BLUE drew from the arrival answers: the grey "no photo"
 * silhouette iOS 6 put on every contact, dressed in the guest's top and, if
 * they said so, their glasses. It is a sketch to find someone across the
 * room, not a likeness: the face stays a silhouette, so it never guesses at
 * anyone's skin, hair or build.
 *
 * The top colours are the clothes themselves, so they are drawn as clothes,
 * not as UI colour. A ghost's photo is the same picture, faded to grey.
 */

const TOPS = {
  black: ['#3a3f4a', '#1c1f26'],
  white: ['#ffffff', '#d9dbe0'],
  grey: ['#a4a9b2', '#757b86'],
  blue: ['#3d63a8', '#1f3a6e'],
  red: ['#ec6478', '#b52c43'],
  green: ['#45b56c', '#21783f'],
  yellow: ['#f7bb48', '#d9831a'],
  print: ['#3d63a8', '#1f3a6e'],
};
const UNKNOWN = ['#b4bac5', '#8c93a0'];

export default function Portrait({ traits, size = 84, ghost = false, rounded = 8, className = '' }) {
  const id = useId().replace(/:/g, '');
  const [hi, lo] = TOPS[traits?.top] ?? UNKNOWN;
  const glasses = traits?.glasses === 'yes';
  const print = traits?.top === 'print';
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: rounded, display: 'block', filter: ghost ? 'grayscale(1) contrast(0.9)' : undefined, opacity: ghost ? 0.7 : 1 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9edf3" />
          <stop offset="1" stopColor="#b9c1ce" />
        </linearGradient>
        <linearGradient id={`${id}sk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a1aab8" />
          <stop offset="1" stopColor="#7a8392" />
        </linearGradient>
        <linearGradient id={`${id}top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        {print && (
          <pattern id={`${id}pt`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
            <circle cx="3" cy="3" r="2.2" fill="#ffd23a" />
            <circle cx="3" cy="3" r="0.9" fill="#fff" />
            <circle cx="9" cy="9" r="1.6" fill="#ffffff" fillOpacity="0.85" />
            <path d="M8 2.5 q1.5 -1.5 3 0" stroke="#2fb35a" strokeWidth="1.1" fill="none" />
          </pattern>
        )}
      </defs>
      <rect width="100" height="100" fill={`url(#${id}bg)`} />
      {/* neck, head */}
      <rect x="42" y="52" width="16" height="20" rx="5" fill={`url(#${id}sk)`} />
      <ellipse cx="50" cy="38" rx="17.5" ry="21" fill={`url(#${id}sk)`} />
      {/* the top */}
      <path d="M8 104 C8 80 24 69 41 67 Q50 75 59 67 C76 69 92 80 92 104 Z" fill={`url(#${id}top)`} stroke={traits?.top === 'white' ? '#b4b9c3' : 'none'} strokeWidth="1" />
      {print && <path d="M8 104 C8 80 24 69 41 67 Q50 75 59 67 C76 69 92 80 92 104 Z" fill={`url(#${id}pt)`} />}
      <path d="M41 67 Q50 75 59 67" stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" fill="none" />
      {glasses && (
        <g stroke="#141a26" strokeWidth="2.6" fill="rgba(225,238,255,0.35)" strokeLinejoin="round">
          <rect x="33.5" y="34" width="13.5" height="10" rx="3.5" />
          <rect x="53" y="34" width="13.5" height="10" rx="3.5" />
          <path d="M47 38 Q50 36 53 38 M33.5 37 L31.5 36 M66.5 37 L68.5 36" fill="none" />
        </g>
      )}
      {!traits && <text x="50" y="45" textAnchor="middle" fontSize="22" fontWeight="700" fill="#eef1f6">?</text>}
    </svg>
  );
}

/**
 * A guest's photo by id, wherever the phone shows a person (the board, the
 * poll, the verdict, the finale), so the room recognises the same face in
 * every app. `traits` is the shell's map of everyone's answers (ctx.traits).
 */
export function Face({ traits, pid, size = 40, ghost = false, round = false, className = '' }) {
  return (
    <Portrait
      traits={traits?.[pid]}
      size={size}
      ghost={ghost}
      rounded={round ? size / 2 : Math.max(4, Math.round(size / 7))}
      className={`os-face ${className}`}
    />
  );
}
