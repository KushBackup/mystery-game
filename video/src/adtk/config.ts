/**
 * config.ts — this reel's identity. Pure data: the scripts in scripts/reel/
 * import it with Node, so keep it free of imports.
 *
 * THREE KNIVES OUT — a horizontal 16:9 ad, delivered in 4K. The composition is
 * authored on a 1920×1080 canvas (every px in timeline/scenes/probe is in
 * these units) and rendered at `renderScale` 2, so the file is 3840×2160 and
 * the 4K footage keeps its full detail.
 */

export const REEL = {
  /**
   * Composition id. The studio also gets `${id}-SafeZone` (precheck: safe zone
   * + keep-clear bands drawn, no audio) and `${id}-Probe` (a clip on a grid).
   * Letters, digits and hyphens only.
   */
  id: "Promo-ThreeKnives",
  /** Folder under public/ holding this reel's clips, photos, logos, vo.mp3 and audio mixes. */
  assets: "adtk",
  /** Render target in out/ (no extension). */
  out: "adtk-16x9-4k",
  fps: 30,
  /** The canvas, in px. */
  width: 1920,
  height: 1080,
  /** Output = canvas × renderScale (3840×2160). */
  renderScale: 2,
  /**
   * Where words may live. In-feed 16:9 has no platform UI over the picture,
   * but the mute toggle and progress bar sit in the bottom corners: keep a
   * title-safe margin all round.
   */
  safe: { left: 96, right: 1824, top: 60, bottom: 1012 },
  /**
   * Sizes clips are cut to, in OUTPUT px: full-frame shots, and the panes of a
   * split screen (three vertical clips side by side, each a third of the frame).
   */
  cut: { full: [3840, 2160], pane: [1280, 2160] },
} as const;
