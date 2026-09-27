/**
 * Firebase for Killers Night: app, auth and Firestore, in one place.
 *
 * --- Which database -------------------------------------------------------
 *
 * A dev build (`npm run dev`) talks to the Firebase Local Emulator by default,
 * under the project id `demo-killers`. A `demo-` id is Firebase's guarantee
 * that nothing can reach a real cloud project, so a dev session can never
 * write to the live game by accident (CLAUDE.md: the live database is
 * production). `?live=1` opts a dev build into the real project, deliberately.
 * A production build always uses the real project.
 *
 * The emulator host is the page's own hostname, so a phone on the same wifi
 * that opens http://<laptop-ip>:5173 reaches the emulator on the laptop too.
 * Start it with `npm run emulators`.
 *
 * --- Who is who -------------------------------------------------------------
 *
 * Players sign in anonymously: no accounts, no passwords, one tap at the door.
 * The host signs in with Google, and the security rules trust only the emails
 * in HOST_EMAILS (firestore.rules keeps its own copy, which is what actually
 * enforces it; this one only decides what the UI offers).
 *
 * `?tab=1` keeps the anonymous session per tab instead of per browser, so one
 * laptop can play several guests at once while testing.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence, browserLocalPersistence, inMemoryPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache,
} from 'firebase/firestore';

export const HOST_EMAILS = ['kushagranagar25@gmail.com', 'astralprojectco@gmail.com'];

const params = new URLSearchParams(globalThis.location?.search ?? '');
// Live only in a real production build (or a dev build with ?live=1). Anything
// else, including Node scripts where import.meta.env doesn't exist, is emulated.
// The safe answer has to be the default.
const PRODUCTION_BUILD = import.meta.env?.PROD === true;
export const EMULATED = !PRODUCTION_BUILD && !params.has('live');
export const PER_TAB = params.has('tab') || typeof indexedDB === 'undefined';

const LIVE_CONFIG = {
  apiKey: 'AIzaSyBr2zO-hMOEUZiY6BumIkPwhB9t0vWazmM',
  authDomain: 'murder-1bf1c.firebaseapp.com',
  projectId: 'murder-1bf1c',
  storageBucket: 'murder-1bf1c.firebasestorage.app',
  messagingSenderId: '1066963158553',
  appId: '1:1066963158553:web:50a78fed478e6a4e458c88',
};

const EMULATOR_CONFIG = { apiKey: 'demo-key', authDomain: 'demo-killers.firebaseapp.com', projectId: 'demo-killers' };

// A named app, so this never collides with the legacy game's default app in
// src/firebase/config.js while both still exist in the repo.
export const app = initializeApp(EMULATED ? EMULATOR_CONFIG : LIVE_CONFIG, 'killers');

export const auth = getAuth(app);

// Per-tab testing uses an in-memory cache: several anonymous players sharing
// one IndexedDB cache across tabs is a recipe for confusing test sessions.
export const db = initializeFirestore(app, {
  localCache: PER_TAB ? memoryLocalCache() : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if (EMULATED) {
  const host = globalThis.location?.hostname || '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}

// Resolves once persistence is set; sign-in waits on it.
const persistence = typeof window === 'undefined'
  ? inMemoryPersistence
  : PER_TAB ? browserSessionPersistence : browserLocalPersistence;
export const authReady = setPersistence(auth, persistence);
