/**
 * Kicker — the deck's `.kick`: a mono uppercase label in red, wide tracked,
 * that sits above every headline. Also does duty as the deck's `.tag` (a solid
 * red block) and `.tag.ghost` / `.tag.amber` variants.
 */

import React from "react";
import { C, F, monoStyle } from "../theme";

export const Kicker: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
  color?: string;
}> = ({ children, size = 17, style, color = C.red }) => (
  <div
    style={{
      ...monoStyle(size, 0.28),
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * The deck also defines a `.tag.amber` variant. It is deliberately NOT ported:
 * amber is reserved for numerals in this film, and a tag is always a word.
 */
export type TagVariant = "solid" | "ghost" | "bone";

/** The deck's `.tag` — its smallest atomic accent. Never gradient, never round. */
export const Tag: React.FC<{
  children: React.ReactNode;
  variant?: TagVariant;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, variant = "solid", size = 15, style }) => {
  const skin: Record<TagVariant, React.CSSProperties> = {
    // The deck sets #fff here; bone is used instead so the film's palette stays
    // closed. Bone is the film's paper and primary text — never pure white.
    solid: {
      background: C.red,
      color: C.bone,
      border: "1px solid transparent",
    },
    ghost: {
      background: "transparent",
      color: C.red,
      border: `1px solid ${C.red}`,
    },
    bone: { background: C.bone, color: C.ink, border: "1px solid transparent" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: `${size * 0.53}px ${size * 1.07}px ${size * 0.4}px`,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        lineHeight: 1,
        ...skin[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * An em-dash bullet in red mono — the deck's `.list li::before`.
 * The film never uses a round dot for a bullet.
 */
export const EmDash: React.FC<{ size?: number; color?: string }> = ({
  size = 17,
  color = C.red,
}) => (
  <span
    style={{
      fontFamily: F.mono,
      fontSize: size,
      color,
      lineHeight: 1,
      flexShrink: 0,
    }}
  >
    —
  </span>
);
