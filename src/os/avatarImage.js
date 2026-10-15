import { drawPortrait, ART_W, ART_H } from './art/portraitArt';
import { frame, seedNum } from './art/portraitCache';

/**
 * The guest's finished contact photo as an image file, for Share and Save on
 * the arrival review ("Almost done").
 *
 * The file is painted when the review opens, not on the tap: iOS Safari only
 * lets `navigator.share` open from inside the tap itself, and painting a
 * 1080-wide photo takes long enough that the tap would have ended.
 *
 * Saving: a phone that can share files (every iPhone, most Androids) gets the
 * share sheet on iOS, whose "Save Image" puts it in Photos; a download there
 * would land in Files instead. Everywhere else it downloads, which Android
 * shows in the gallery.
 */

const WIDTH = 1080;

const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'me';

/** Paint the photo at full size and resolve to a PNG File (null if the browser can't). */
export function avatarFile({ traits, seed, name }) {
  const c = document.createElement('canvas');
  c.width = WIDTH;
  c.height = Math.round((WIDTH * ART_H) / ART_W);
  const g = c.getContext('2d');
  frame(g, WIDTH, true);
  drawPortrait(g, traits ?? {}, seedNum(seed));
  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(blob ? new File([blob], `${slug(name ?? '')}.png`, { type: 'image/png' }) : null), 'image/png');
  });
}

/** Whether this browser can hand an image file to the share sheet (asked with an empty PNG when there's no file yet). */
export function canShareFile(file = new File([], 'probe.png', { type: 'image/png' })) {
  try {
    return Boolean(navigator.canShare?.({ files: [file] }));
  } catch {
    return false;
  }
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Open the share sheet. Resolves false only if it failed (closing the sheet is not a failure). */
export async function shareAvatar(file) {
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (e) {
    return e?.name === 'AbortError';
  }
}

function download(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Save the photo: to Photos through the share sheet on iOS, a download everywhere else. Returns how it went. */
export async function saveAvatar(file) {
  if (isIOS() && canShareFile(file)) return (await shareAvatar(file)) ? 'sheet' : 'failed';
  download(file);
  return 'downloaded';
}
