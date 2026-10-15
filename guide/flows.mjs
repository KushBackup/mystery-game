import { sleep } from './lib.mjs';

/** Drag a slide-to-unlock thumb all the way across. */
export async function slide(page, label) {
  const thumb = page.locator(label ? `.os-slide__thumb[aria-label="${label}"]` : '.os-slide__thumb').first();
  const track = page.locator('.os-slide').first();
  const tb = await thumb.boundingBox({ timeout: 8000 });
  const kb = await track.boundingBox();
  const y = tb.y + tb.height / 2;
  await page.mouse.move(tb.x + tb.width / 2, y);
  await page.mouse.down();
  const to = kb.x + kb.width - 12;
  for (let x = tb.x + tb.width / 2; x < to; x += 14) {
    await page.mouse.move(x, y);
    await sleep(8);
  }
  await page.mouse.move(to, y);
  await page.mouse.up();
  await sleep(700);
}

const NOTES = [
  'Gender is only used to draw the photo. It is never a clue.',
  'Question 2 of 7. Every tap dresses the photo straight away.',
  'Glasses or no glasses: another public answer the room will compare clues against.',
  'Footwear. Shoes are one of the six traits a clue can describe.',
  'The first drink of the evening. A bar receipt can name this group later.',
  'Birthday season. A leaked admin screenshot can name this later.',
  'Siblings. The last of the six answers.',
];

const visible = (loc) => loc.first().isVisible().catch(() => false);

/**
 * A brand-new guest sets up their phone: boot, hello, terms, name, seven questions, review, ready.
 * Reads the screen on every pass instead of following a fixed script, so a page reload (the dev
 * server restarting) just resumes where Setup saved its progress. Returns on the lock screen.
 */
export async function onboard(phone, { name, pick = [1, 0, 2, 1, 1, 0, 2] }) {
  const { page } = phone;
  const done = new Set();
  const once = async (key, note, wait) => { if (!done.has(key)) { done.add(key); await phone.snap(note, { app: 'Setup', wait }); } };
  const deadline = Date.now() + 120_000;
  await once('boot', 'The phone boots for the first time. The title card holds for a couple of seconds.', 700);
  while (Date.now() < deadline) {
    if (await visible(page.locator('.os-slide__thumb[aria-label="slide to unlock"]'))) return;
    if (await visible(page.getByRole('button', { name: 'My phone is ready' }))) {
      await once('review', 'The review. This is the last chance to change an answer; after this they are locked and public.', 600);
      await page.getByRole('button', { name: 'My phone is ready' }).click();
      await sleep(1500);
    } else if (await visible(page.getByRole('button', { name: 'Got it', exact: true }))) {
      await once('case', 'The case, before anything else: what DEEP BLUE is, who the Killers are, and the goal.');
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
      await sleep(800);
    } else if (await visible(page.getByRole('button', { name: 'Agree', exact: true }))) {
      await once('terms', 'The Terms of Service are the rules, told as a contract with the cursed app. There is no Disagree.');
      if (!done.has('disagree')) {
        done.add('disagree');
        await page.getByRole('button', { name: 'Disagree' }).click();
        await phone.snap('Tapping Disagree only shakes the button. The most important clause.', { app: 'Setup', wait: 250 });
      }
      await page.getByRole('button', { name: 'Agree', exact: true }).click();
      await sleep(800);
    } else if (await visible(page.locator('input.os-input'))) {
      await once('name', 'First the name. A hand-drawn photo of the guest sits above it.');
      await page.locator('input.os-input').fill(name);
      await page.getByRole('button', { name: 'Next' }).click();
      await sleep(800);
    } else if (await visible(page.locator('.os-chip'))) {
      const title = await page.locator('.os-nav__title').first().innerText().catch(() => '');
      const q = Number((title.match(/(\d+) of 7/) ?? [])[1] ?? 1) - 1;
      const chips = page.locator('.os-chip');
      await chips.nth(pick[q] % (await chips.count())).click();
      await once(`q${q}`, NOTES[q] ?? NOTES[0], 500);
      await page.getByRole('button', { name: q === 6 ? 'Done' : 'Next' }).click();
      await sleep(500);
    } else if (await visible(page.getByText('Already playing?'))) {
      await once('hello', '"Hello" cycles through languages. A guest slides to set up.');
      await slide(page);
    } else {
      await sleep(400);
    }
  }
  throw new Error('onboarding did not reach the lock screen');
}

/** Go home, open an app from the home screen, and photograph it. */
export async function view(phone, label, note, { wait = 700 } = {}) {
  await phone.home();
  await phone.openApp(label);
  await phone.snap(note, { app: label, wait });
}

/**
 * Walk a tutorial slide by slide, photographing the first `limit` slides, then finish it
 * (the last slide's own button, or Skip). Returns how many slides were seen.
 */
export async function tutorial(phone, note, { limit = 1, app = 'Tutorial' } = {}) {
  const { page } = phone;
  let n = 0;
  for (let i = 0; i < 16; i += 1) {
    if (!(await visible(page.locator('.os-wt__stage')))) break;
    n += 1;
    if (n <= limit) {
      const words = (await page.locator('.os-wt__stage').first().innerText().catch(() => '')).split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 2).join(' ');
      await phone.snap(`${note} Slide ${n}: "${words}"`, { app, wait: 650 });
    }
    if (n >= limit) break;
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (!(await visible(next))) break;
    await next.click();
    await sleep(500);
  }
  const skip = page.locator('.os-wt__skip');
  if (await visible(skip)) await skip.click();
  else await page.locator('.os-wt button.os-btn').last().click().catch(() => {});
  await sleep(800);
  return n;
}
