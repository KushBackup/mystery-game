/**
 * Bot guests the host adds from the console ("Add bot"), for testing a room
 * without a room. What a bot does is firebase/bots.js; this file only makes
 * them in the browser and keeps them playing.
 *
 * Each bot is its own named Firebase app with its own anonymous user, so it
 * is a phone as far as the rules know: no host powers. Their auth persists
 * per app name, and the names are kept in localStorage per game, so a reload
 * of the console picks the same bots back up. They play only while the host
 * console is open: close it and they sit idle, like phones in a pocket.
 */

import { useCallback, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, memoryLocalCache, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db, EMULATED, EMULATOR_CONFIG, LIVE_CONFIG } from './app';
import { NAMES, arrive, heartbeat, driveBots } from './bots';

/**
 * Run `fn` with the bot connected, then disconnect it once nothing else of
 * its is running. Every bot is its own Firestore, and an idle one still holds
 * a stream open to the server for a minute, which the 60 s heartbeat keeps
 * renewing. The emulator speaks HTTP/1.1, where Chrome allows six connections
 * per host across every tab, so a few idle bots used to take them all and
 * the console's own writes sat on "Sending…" for good (2026-10-16).
 */
function online(bot, fn) {
  bot.users = (bot.users ?? 0) + 1;
  // Toggles queue on one chain, so a disconnect never lands after a later connect.
  if (bot.users === 1) bot.toggle = (bot.toggle ?? Promise.resolve()).then(() => enableNetwork(bot.db)).catch(() => {});
  return bot.toggle.then(fn).finally(() => {
    bot.users -= 1;
    if (bot.users === 0) bot.toggle = bot.toggle.then(() => disableNetwork(bot.db)).catch(() => {});
  });
}

const KEY = 'astral.hostbots'; // { [gid]: [{ app, name }] }

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

function save(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage blocked: the bots still play, they just won't survive a reload.
  }
}

// The running set for the mounted console, so add() can hand a new bot to the driver.
const hostBots = { current: null };

// One open bot per app name, so React's double effects never initialise an app twice.
const opened = new Map();

function openBot(appName, name) {
  if (!opened.has(appName)) {
    opened.set(appName, (async () => {
      const app = getApps().find((a) => a.name === appName) ?? initializeApp(EMULATED ? EMULATOR_CONFIG : LIVE_CONFIG, appName);
      const auth = getAuth(app);
      const bdb = initializeFirestore(app, { localCache: memoryLocalCache() });
      if (EMULATED) {
        const host = location.hostname;
        connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
        connectFirestoreEmulator(bdb, host, 8080);
      }
      await auth.authStateReady();
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      return { db: bdb, uid: user.uid, pid: user.uid, name };
    })());
  }
  return opened.get(appName);
}

/**
 * The bots for this game: who they are, and `add()` for one more. While the
 * console is mounted they act on every phase and send a heartbeat.
 */
export function useHostBots(gid, players) {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    if (!gid) return undefined;
    const all = load();
    // Bots from older games are done with: forget them.
    save({ [gid]: all[gid] ?? [] });
    const live = [];
    let stopped = false;
    Promise.all((all[gid] ?? []).map((b) => openBot(b.app, b.name).catch(() => null))).then((restored) => {
      if (stopped) return;
      live.push(...restored.filter(Boolean));
      setBots([...live]);
    });
    const stop = driveBots(db, gid, live, { log: (m) => m.startsWith('bot ') && console.warn(m), around: online });
    const beat = () => live.forEach((b) => online(b, () => heartbeat(b, gid)).catch(() => {}));
    const timer = setInterval(beat, 60_000);
    hostBots.current = { gid, live, setBots };
    return () => {
      stopped = true;
      stop();
      clearInterval(timer);
      if (hostBots.current?.live === live) hostBots.current = null;
    };
  }, [gid]);

  const add = useCallback(async () => {
    const run = hostBots.current;
    if (!run || run.gid !== gid) throw new Error('The console is still loading.');
    const taken = new Set(players.map((p) => p.name));
    const first = NAMES.find((n) => !taken.has(`${n} (bot)`));
    const name = `${first ?? `Bot ${taken.size + 1}`} (bot)`;
    const appName = `hostbot-${gid}-${Date.now()}`;
    const bot = await openBot(appName, name);
    await online(bot, async () => {
      await arrive(bot, gid);
      await heartbeat(bot, gid);
    });
    const all = load();
    save({ [gid]: [...(all[gid] ?? []), { app: appName, name }] });
    run.live.push(bot);
    run.setBots([...run.live]);
  }, [gid, players]);

  return { bots, add };
}
