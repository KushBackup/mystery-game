/**
 * theme.ts — the reel's tokens. The ONLY place a colour or font is defined.
 *
 * Defaults are the Astral Project "Evidence Room" palette the reference ad
 * shipped with: ink ground, bone text, ONE hot accent (red) for highlight boxes,
 * chips, buttons and hits. For another brand, change these values and nothing
 * else — keep the ROLES (ground / text / one accent), never add a second accent.
 *
 *   ink    ground, cards, the phone bezel
 *   bone   all text on footage (never pure white: #EDE7DA reads warmer on video)
 *   red    the ONE accent: highlight boxes, step chip, CTA button, flashes
 *   amber  reserved for numerals if a brand needs a second tone (unused here)
 */

import { loadFont as loadDisplay } from "@remotion/google-fonts/BigShoulders";
import { REEL } from "./config";

/** Folder under public/ that holds this reel's clips, photos, logos, VO and mix. */
export const ASSET_DIR = REEL.assets;

export const C = {
  ink: "#0C0D0F",
  ink2: "#141518",
  ink3: "#1C1E22",
  bone: "#EDE7DA",
  bone2: "#D8D0BF",
  red: "#E03127",
  redDeep: "#8E1811",
  amber: "#D8A33C",
  dim: "rgba(237,231,218,.62)",
  dim2: "rgba(237,231,218,.42)",
  line: "rgba(237,231,218,.16)",
  line2: "rgba(237,231,218,.08)",
} as const;

/** The wordmark face (brand lockup only). Captions use Inter Tight — see kit.tsx. */
const display = loadDisplay("normal", { weights: ["700", "800"], subsets: ["latin"] });

export const F = {
  disp: display.fontFamily,
} as const;
