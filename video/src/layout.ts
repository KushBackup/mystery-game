/**
 * layout.ts — orientation-aware layout primitives.
 *
 * The film ships in two shapes: 1920x1080 (master) and 1080x1920 (social).
 * The vertical cut is a genuine REFLOW, never a centre-crop, so every scene
 * asks `useLayout()` for the numbers it needs and branches on `pick()`.
 *
 * The deck's grid is a 96px side margin at 1920x1080; content sits on that
 * margin and is deliberately NOT centred. Vertical uses 72px.
 */

import { useVideoConfig } from "remotion";

export type Layout = {
  vertical: boolean;
  width: number;
  height: number;
  /** Side margin — the deck's content grid. */
  margin: number;
  /** Usable content width between the margins. */
  inner: number;
  /** Choose between a horizontal value and a vertical one. */
  pick: <T>(horizontal: T, vertical: T) => T;
};

export const useLayout = (): Layout => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const margin = vertical ? 72 : 96;

  return {
    vertical,
    width,
    height,
    margin,
    inner: width - margin * 2,
    pick: <T,>(horizontal: T, verticalValue: T): T =>
      vertical ? verticalValue : horizontal,
  };
};
