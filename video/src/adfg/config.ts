/**
 * config.ts — this reel's identity. Pure data: the scripts in scripts/reel/
 * import it with Node, so keep it free of imports.
 *
 * For a new ad: copy this whole folder to src/<name>/, then change these three
 * strings. Everything else (compositions, asset paths, output file) follows.
 */

export const REEL = {
  /**
   * Composition id. The studio also gets `${id}-SafeZone` (precheck: safe zone
   * + keep-clear bands drawn, no audio) and `${id}-Probe` (a clip on a y-grid).
   * Letters, digits and hyphens only.
   */
  id: "Promo-FeelGood",
  /** Folder under public/ holding this reel's clips, photos, logos, vo.mp3 and audio mixes. */
  assets: "adfg",
  /** Render target in out/ (no extension). */
  out: "adfg-9x16",
  fps: 30,
  width: 1080,
  height: 1920,
} as const;
