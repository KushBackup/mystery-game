/**
 * The opening video (Splash.jsx): where it lives, and whether this device has
 * already seen it. It plays once, the first time a guest opens the page.
 */

export const FILM = `${import.meta.env.BASE_URL}splash/deal.mp4`;

// Bump the version to show a changed video to devices that saw the old one.
const KEY = 'astral.intro';
const VERSION = '1';

export function introSeen() {
  try { return localStorage.getItem(KEY) === VERSION; } catch { return false; }
}

export function markIntroSeen() {
  try { localStorage.setItem(KEY, VERSION); } catch { /* private mode: it plays again next time */ }
}
