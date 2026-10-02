/**
 * The title film at the deal (Splash.jsx): where it lives, and fetching it
 * once while the guest waits in the lobby, so it starts on the deal without
 * buffering. The blob URL lives as long as the page.
 */

export const FILM = `${import.meta.env.BASE_URL}splash/deal.mp4`;

let blobUrl = null;
let loading = null;

export const filmSrc = () => blobUrl ?? FILM;

export function preloadSplash() {
  if (blobUrl || loading) return;
  loading = fetch(FILM)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`splash ${r.status}`))))
    .then((b) => { blobUrl = URL.createObjectURL(b); })
    .catch((e) => console.warn('[splash]', e.message))
    .finally(() => { loading = null; });
}
