/**
 * Shared pieces for the guide capture: bots, the host, and a phone in a headless browser.
 * Emulator only. Nothing here can reach the live project (src/firebase/app.js emulates outside a production build).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously, signInWithCredential, GoogleAuthProvider, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, memoryLocalCache, doc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { botName } from '../src/firebase/bots.js';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SHOTS = path.join(HERE, 'shots');
export const BASE = 'http://127.0.0.1:5173/';
export const HOST = '127.0.0.1';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function assertEmulator() {
  const up = await fetch(`http://${HOST}:8080/`).then((r) => r.status < 500, () => false);
  if (!up) throw new Error('The Firestore emulator is not on 127.0.0.1:8080. Run `npm run emulators` in the repo root.');
  const dev = await fetch(BASE).then((r) => r.ok, () => false);
  if (!dev) throw new Error(`The dev server is not answering at ${BASE}. Run \`npm run dev\` in the repo root.`);
}

// --- Bots and the host (Node side) --------------------------------------------------------------

export async function makeBot(i) {
  const app = initializeApp({ apiKey: 'demo-key', authDomain: 'demo-killers.firebaseapp.com', projectId: 'demo-killers' }, `guide-bot-${i}-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true });
  await setPersistence(auth, inMemoryPersistence);
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  connectFirestoreEmulator(db, HOST, 8080);
  const { user } = await signInAnonymously(auth);
  return { i, app, db, uid: user.uid, pid: user.uid, name: botName(i) };
}

/** The host, signed in to the Auth emulator with a fake Google credential for a host email. */
export async function hostLogin() {
  const host = await import('../src/firebase/host.js');
  const { auth, db } = await import('../src/firebase/app.js');
  const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: 'guide-host', email: 'astralprojectco@gmail.com', email_verified: true }));
  await signInWithCredential(auth, cred);
  return { host, db };
}

// --- The browser ---------------------------------------------------------------------------------

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const root = path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  const dirs = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse() : [];
  for (const d of dirs) {
    for (const sub of ['chrome-win64', 'chrome-win']) {
      const exe = path.join(root, d, sub, 'chrome.exe');
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error('No Chromium found. Set CHROME=<path to chrome.exe>.');
}

export const launch = () => chromium.launch({ executablePath: findChrome(), headless: true });

// --- The manifest: every screenshot, in the order it was taken ------------------------------------

const manifestFile = path.join(SHOTS, 'manifest.json');
export const manifest = { game: null, sections: [], shots: [], cast: {}, events: [] };

export function resetShots() {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  fs.mkdirSync(SHOTS, { recursive: true });
}

export const saveManifest = () => fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));

/** Start a beat: a row in the guide ("Night 1 · the Killers vote"). */
export function beat(id, title, text = '') {
  manifest.sections.push({ id, title, text, at: manifest.shots.length });
  saveManifest();
  console.log(`\n== ${title}`);
}

export function currentBeat() {
  return manifest.sections.at(-1)?.id ?? 'start';
}

// --- A phone ---------------------------------------------------------------------------------------

export class Phone {
  constructor(browser, { key, name, who, role = null, pid = null }) {
    Object.assign(this, { browser, key, name, who, role, pid });
    this.n = 0;
  }

  async open({ introSeen = true } = {}) {
    this.ctx = await this.browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
    if (introSeen) await this.ctx.addInitScript(() => { try { localStorage.setItem('astral.intro', '1'); } catch { /* none */ } });
    this.page = await this.ctx.newPage();
    this.page.on('pageerror', (e) => console.log(`  [${this.key}] pageerror: ${e.message.slice(0, 160)}`));
    if (process.env.GUIDE_DEBUG) this.page.on('console', (m) => { if (m.type() === 'error') console.log(`  [${this.key}] console: ${m.text().slice(0, 200)}`); });
    await this.page.goto(BASE, { waitUntil: 'domcontentloaded' });
    return this;
  }

  async close() { await this.ctx?.close(); }

  text() { return this.page.evaluate(() => document.body.innerText); }

  /** Screenshot this phone as it is now, filed under the current beat. */
  async snap(note, { app = null, wait = 350 } = {}) {
    if (wait) await sleep(wait);
    const file = `${currentBeat()}__${this.key}__${++this.n}.jpg`;
    await this.page.screenshot({ path: path.join(SHOTS, file), type: 'jpeg', quality: 74 });
    manifest.shots.push({ beat: currentBeat(), phone: this.key, who: this.who, role: this.role, ghost: Boolean(this.ghost), app, note, file });
    return file;
  }

  async tap(locator, opts = {}) {
    await locator.click({ timeout: 4000, ...opts });
  }

  /** Home button, one press. */
  async home() {
    await this.page.locator('button[aria-label^="Home"]').click({ timeout: 4000 }).catch(() => {});
    await sleep(500);
  }

  async openApp(label) {
    const btn = this.page.getByRole('button', { name: new RegExp(`^${label}(,|$)`) }).first();
    await btn.click({ timeout: 5000 });
    await sleep(900);
  }
}
