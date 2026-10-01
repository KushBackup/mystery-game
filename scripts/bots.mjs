#!/usr/bin/env node
/**
 * Bots for Killers Night, against the Firebase Local Emulator only.
 *
 *   npm run emulators                         # in another terminal first
 *   node scripts/bots.mjs --selftest --n 20   # play a whole game, check the rules hold
 *   node scripts/bots.mjs --join 12           # add 12 bots to the active game, to fill
 *                                             # a room around real phones in the browser
 *
 * Every bot is its own Firebase app with its own anonymous user, so the real
 * security rules judge every write, exactly as they would on 40 phones. The
 * self-test also plays host (signed in to the Auth emulator with a fake Google
 * credential for a host email) through src/firebase/host.js, the same code the
 * host console runs.
 *
 * It refuses to run unless the emulator answers. It never touches the live
 * project: the bots use the demo-killers project id, which cannot reach the
 * cloud, and src/firebase/app.js is emulated outside a production build.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, signInAnonymously, signInWithCredential, GoogleAuthProvider, inMemoryPersistence, setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, connectFirestoreEmulator, memoryLocalCache, doc, collection, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, query, where,
} from 'firebase/firestore';
import { TRAITS } from '../src/data/traits.js';
import { PACKS, DEFAULT_PACK_ID } from '../src/data/packs/index.js';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] == null ? 'true' : arr[i + 1]]);
    return acc;
  }, []),
);

const HOST = '127.0.0.1';
const CONFIG = { apiKey: 'demo-key', authDomain: 'demo-killers.firebaseapp.com', projectId: 'demo-killers' };
const NAMES = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ishita', 'Vikram', 'Tara', 'Neel', 'Anaya', 'Dev', 'Zoya',
  'Arjun', 'Kiara', 'Sahil', 'Riya', 'Omar', 'Leela', 'Yash', 'Sana', 'Karan', 'Nisha', 'Aditya', 'Pooja', 'Farhan',
  'Ira', 'Manav', 'Tanvi', 'Reyansh', 'Aisha', 'Veer', 'Myra', 'Kunal', 'Alia', 'Rehan', 'Sara', 'Nikhil', 'Avni', 'Jay', 'Esha'];

const rnd = (xs) => xs[Math.floor(Math.random() * xs.length)];

async function emulatorUp() {
  try {
    const r = await fetch(`http://${HOST}:8080/`);
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

// --- A bot is one phone ------------------------------------------------------

async function makeBot(i) {
  const app = initializeApp(CONFIG, `bot-${i}-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true });
  await setPersistence(auth, inMemoryPersistence);
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  connectFirestoreEmulator(db, HOST, 8080);
  const { user } = await signInAnonymously(auth);
  return { i, app, db, uid: user.uid, pid: user.uid, name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : '') };
}

const G = (bot, gid, ...p) => doc(bot.db, 'games', gid, ...p);

async function arrive(bot, gid) {
  const traits = Object.fromEntries(TRAITS.map((t) => [t.id, rnd(t.options).id]));
  bot.traits = traits;
  await setDoc(G(bot, gid, 'bindings', bot.uid), { pid: bot.uid });
  await setDoc(G(bot, gid, 'players', bot.uid), { name: bot.name, table: String(1 + (bot.i % 5)), status: 'alive', joinedAt: Date.now() });
  await setDoc(G(bot, gid, 'traits', bot.uid), traits);
}

async function readSelf(bot, gid) {
  const [role, me] = await Promise.all([getDoc(G(bot, gid, 'roles', bot.pid)), getDoc(G(bot, gid, 'players', bot.pid))]);
  bot.role = role.exists() ? role.data().role : null;
  bot.status = me.data()?.status;
}

async function allPlayers(bot, gid) {
  const snap = await getDocs(collection(bot.db, 'games', gid, 'players'));
  return snap.docs.map((d) => ({ pid: d.id, ...d.data() }));
}

/** One night action, chosen at random but always legal for the role. */
async function act(bot, gid, game) {
  await readSelf(bot, gid);
  const players = await allPlayers(bot, gid);
  const alive = players.filter((p) => p.status === 'alive' && p.pid !== bot.pid);
  if (!alive.length) return;
  const c = game.cycle;
  const action = (a) => setDoc(G(bot, gid, 'actions', `${c}_${bot.pid}`), { ...a, pid: bot.pid, cycle: c });

  if (bot.status === 'ghost') {
    return action({ kind: 'whisper', target: rnd(alive).pid, word: rnd(PACKS[DEFAULT_PACK_ID].whispers) });
  }
  if (bot.status !== 'alive') return;
  if (bot.role === 'killer') {
    const mates = (await getDocs(collection(bot.db, 'games', gid, 'killers'))).docs.map((d) => d.id);
    const faithful = alive.filter((p) => !mates.includes(p.pid));
    const choice = { victim: rnd(faithful)?.pid ?? null, hand: rnd(mates), rig: rnd(['zero', 'under']), pid: bot.pid, cycle: c };
    if (c === 2) choice.frame = rnd(faithful)?.pid ?? null;
    if (Math.random() < 0.5) choice.recruit = rnd(faithful)?.pid ?? null;
    return setDoc(G(bot, gid, 'den', `${c}_${bot.pid}`), choice);
  }
  if (bot.role === 'doctor') return action({ kind: 'protect', target: rnd(alive).pid });
  if (bot.role === 'detective') {
    const two = [...alive].sort(() => Math.random() - 0.5).slice(0, 2).map((p) => p.pid);
    return two.length === 2 ? action({ kind: 'trace', targets: two, target: null }) : action({ kind: 'scour' });
  }
  if (bot.role === 'medium') {
    const ghosts = players.filter((p) => p.status === 'ghost');
    return ghosts.length ? action({ kind: 'seance', target: rnd(ghosts).pid }) : action({ kind: 'scour' });
  }
  return Math.random() < 0.4 ? action({ kind: 'watch', target: rnd(alive).pid }) : action({ kind: 'scour' });
}

/**
 * The morning run. Each bot has a skill it keeps all game, plays a couple of
 * runs, and writes only a new best, as the real app does. One in ten skips
 * the run, to exercise "didn't play counts as 0".
 */
async function play(bot, gid, game) {
  await readSelf(bot, gid);
  if (!['alive', 'ghost'].includes(bot.status)) return;
  bot.skill ??= 2 + Math.floor(Math.random() * 30);
  if (Math.random() < 0.1) return;
  const c = game.cycle;
  const runs = [0, 1].map(() => Math.floor(bot.skill * (0.4 + Math.random() * 0.6)));
  let best = -1;
  for (const [i, score] of runs.entries()) {
    if (score <= best) continue;
    best = score;
    // A refusal here is the rules working: the rule checks already set this bot a higher best.
    await setDoc(G(bot, gid, 'scores', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, best, runs: i + 1, at: Date.now() })
      .catch((e) => { if (e.code !== 'permission-denied') throw e; });
  }
}

async function vote(bot, gid, game) {
  await readSelf(bot, gid);
  const voting = game.phase === 'endgame' ? ['alive', 'ghost'] : ['alive'];
  if (!voting.includes(bot.status)) return;
  const players = await allPlayers(bot, gid);
  let targets = players.filter((p) => p.status === 'alive' && p.pid !== bot.pid).map((p) => p.pid);
  if (game.phase === 'revote') targets = (game.tied ?? []).filter((p) => p !== bot.pid);
  if (!targets.length) return;
  await setDoc(G(bot, gid, 'votes', `${game.ballot}_${bot.pid}`), { target: rnd(targets), pid: bot.pid, ballot: game.ballot });
}

async function answerRecruit(bot, gid, game) {
  const inbox = await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid)));
  const offered = inbox.docs.some((d) => d.data().kind === 'recruitOffer' && d.data().cycle === game.cycle);
  if (!offered) return;
  await setDoc(G(bot, gid, 'actions', `${game.cycle}_${bot.pid}`), { kind: 'recruitAnswer', accept: Math.random() < 0.5, pid: bot.pid, cycle: game.cycle });
}

// --- Rule checks ----------------------------------------------------------------

async function expectDenied(label, fn, results) {
  try {
    await fn();
    results.push(['FAIL', label, 'was allowed']);
  } catch (e) {
    results.push([e.code === 'permission-denied' ? 'ok' : 'FAIL', label, e.code ?? e.message]);
  }
}

async function expectAllowed(label, fn, results) {
  try {
    await fn();
    results.push(['ok', label, 'allowed']);
  } catch (e) {
    results.push(['FAIL', label, e.code ?? e.message]);
  }
}

async function securityChecks(bots, gid) {
  const results = [];
  const faithful = bots.find((b) => b.role !== 'killer');
  const killer = bots.find((b) => b.role === 'killer');
  const other = bots.find((b) => b !== faithful);

  await expectDenied('faithful reads another guest\'s role', () => getDoc(G(faithful, gid, 'roles', other.pid)), results);
  await expectAllowed('faithful reads own role', () => getDoc(G(faithful, gid, 'roles', faithful.pid)), results);
  await expectDenied('faithful reads another guest\'s traits', () => getDoc(G(faithful, gid, 'traits', other.pid)), results);
  await expectDenied('faithful lists the killers', () => getDocs(collection(faithful.db, 'games', gid, 'killers')), results);
  await expectDenied('faithful reads the den', () => getDocs(collection(faithful.db, 'games', gid, 'den')), results);
  await expectDenied('faithful reads the whole inbox', () => getDocs(collection(faithful.db, 'games', gid, 'inbox')), results);
  await expectAllowed('faithful reads own inbox', () => getDocs(query(collection(faithful.db, 'games', gid, 'inbox'), where('to', '==', faithful.pid))), results);
  await expectDenied('faithful reads the engine secret', () => getDoc(G(faithful, gid, 'secret', 'engine')), results);
  await expectDenied('faithful edits the game', () => updateDoc(doc(faithful.db, 'games', gid), { phase: 'finale' }), results);
  await expectDenied('faithful revives themself', () => updateDoc(G(faithful, gid, 'players', faithful.pid), { status: 'alive', cause: null }), results);
  await expectDenied('faithful edits another player', () => updateDoc(G(faithful, gid, 'players', other.pid), { name: 'x' }), results);
  await expectDenied('faithful acts outside the night', () => setDoc(G(faithful, gid, 'actions', `99_${faithful.pid}`), { kind: 'scour', pid: faithful.pid, cycle: 99 }), results);
  await expectDenied('faithful casts a vote for someone else', () => setDoc(G(faithful, gid, 'votes', `c1_${other.pid}`), { target: faithful.pid, pid: other.pid, ballot: 'c1' }), results);
  await expectDenied('faithful rewrites their traits after the deal', () => setDoc(G(faithful, gid, 'traits', faithful.pid), faithful.traits), results);
  await expectDenied('faithful posts a score outside the run', () => setDoc(G(faithful, gid, 'scores', `0_${faithful.pid}`), { pid: faithful.pid, cycle: 0, best: 99, runs: 1, at: 1 }), results);
  await expectDenied('faithful reads another guest\'s score', () => getDoc(G(faithful, gid, 'scores', `1_${other.pid}`)), results);
  if (killer) {
    await expectAllowed('killer lists the killers', () => getDocs(collection(killer.db, 'games', gid, 'killers')), results);
    await expectDenied('killer reads a guest\'s role', () => getDoc(G(killer, gid, 'roles', faithful.pid)), results);
  }
  return results;
}

/** Rule checks that need the run open: scores can only go up, and only your own. */
async function runChecks(bots, gid, game) {
  const results = [];
  const a = bots.find((b) => b.status === 'alive');
  const b = bots.find((x) => x !== a && x.status === 'alive');
  const c = game.cycle;
  const score = (bot, pid, best) => setDoc(G(bot, gid, 'scores', `${c}_${pid}`), { pid, cycle: c, best, runs: 9, at: Date.now() });
  await expectAllowed('guest posts a best during the run', () => score(a, a.pid, 500), results);
  await expectDenied('guest lowers their best', () => score(a, a.pid, 3), results);
  await expectDenied('guest posts a score for someone else', () => score(a, b.pid, 999), results);
  await expectDenied('guest posts an impossible score', () => score(b, b.pid, 5000), results);
  await expectDenied('guest adds a field to their score', () => setDoc(G(b, gid, 'scores', `${c}_${b.pid}`), { pid: b.pid, cycle: c, best: 4, runs: 1, at: 1, rigged: true }), results);
  // Put a's score back to something ordinary, via the host, so the check doesn't skew the board.
  return { results, fix: a.pid };
}

// --- Self-test: a whole game ---------------------------------------------------------

async function selftest(n) {
  const host = await import('../src/firebase/host.js');
  const { auth } = await import('../src/firebase/app.js');
  const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: 'host-selftest', email: 'astralprojectco@gmail.com', email_verified: true }));
  await signInWithCredential(auth, cred);
  console.log('host signed in (emulator Google credential)');

  const gid = await host.createGame();
  console.log(`game ${gid}`);
  const bots = await Promise.all(Array.from({ length: n }, (_, i) => makeBot(i)));
  await Promise.all(bots.map((b) => arrive(b, gid)));
  console.log(`${bots.length} bots arrived`);

  const { db } = await import('../src/firebase/app.js');
  const game = async () => (await getDoc(doc(db, 'games', gid))).data();

  await host.advance(gid); // deal
  await Promise.all(bots.map((b) => readSelf(b, gid)));
  const counts = bots.reduce((acc, b) => ({ ...acc, [b.role]: (acc[b.role] ?? 0) + 1 }), {});
  console.log('dealt:', counts);

  const security = await securityChecks(bots, gid);

  const log = [];
  let guard = 0;
  let late = null;
  let ranChecks = false;
  for (;;) {
    if (guard++ > 140) throw new Error('game did not finish in 140 steps');
    const g = await game();
    if (g.phase === 'finale') break;

    if (g.phase === 'night') {
      await Promise.all(bots.map((b) => act(b, gid, g)));
    } else if (g.phase === 'recruit') {
      await Promise.all(bots.map((b) => answerRecruit(b, gid, g)));
    } else if (g.phase === 'game') {
      await Promise.all(bots.map((b) => readSelf(b, gid)));
      if (!ranChecks) {
        ranChecks = true;
        const { results } = await runChecks(bots, gid, g);
        security.push(...results);
      }
      await Promise.all(bots.map((b) => play(b, gid, g)));
    } else if (['roundtable', 'revote', 'endgame'].includes(g.phase)) {
      await Promise.all(bots.map((b) => vote(b, gid, g)));
    } else if (g.phase === 'investigation' && g.cycle === 2 && !late) {
      // Live join and leave, mid-game.
      late = await makeBot(n);
      await arrive(late, gid);
      await host.dealLateJoiners(gid, [late.pid]);
      await readSelf(late, gid);
      bots.push(late);
      // --killer-leaves sends a Killer home, to exercise recruitment.
      const leaver = bots.find((b) => b.status === 'alive' && b !== late && (!args['killer-leaves'] || b.role === 'killer'));
      await updateDoc(G(leaver, gid, 'players', leaver.pid), { leaveRequestedAt: Date.now() });
      log.push(`  late joiner ${late.name} dealt ${late.role}; ${leaver.name} (${leaver.role}) asked to leave`);
    }

    await host.advance(gid);
    const after = await game();
    if (after.phase === 'dawn') {
      const d = after.dawn;
      const names = (pids) => pids.map((p) => bots.find((b) => b.pid === p)?.name ?? p).join(', ') || 'none';
      const rows = after.board?.rows ?? [];
      log.push(`day ${after.cycle}: ${d.cause === 'rig' ? `rig took ${names(d.victims)} (board shows ${d.rigged})` : d.cause === 'deep' ? `firewall on ${names([d.attempted])}; the deep took ${names(d.victims)}` : 'nobody taken'}${d.vanished.length ? `; vanished ${names(d.vanished)}` : ''}${d.recruited ? '; a recruit said yes' : ''}`);
      log.push(`  board: ${rows.slice(0, 3).map((r) => `${names([r.pid])} ${r.score}`).join(', ')} … last ${rows.length ? `${names([rows.at(-1).pid])} ${rows.at(-1).score}` : '-'}; top-3 photos to ${names(after.board?.top ?? [])}`);
    }
    if (after.phase === 'revote') log.push(`  tie between ${after.tied.length}; re-vote`);
    if (after.phase === 'banish') {
      const b = after.banish;
      const name = bots.find((x) => x.pid === b.pid)?.name ?? 'nobody';
      log.push(`${after.endgameRound ? `endgame ${after.endgameRound}` : `round table ${after.cycle}`}: banished ${name} (${b.role ?? '-'}), ${b.cast} votes`);
    }
  }

  const end = await game();
  console.log(log.join('\n'));
  console.log(`\nWINNER: ${end.winner}`);

  const inbox = await getDocs(collection(db, 'games', gid, 'inbox'));
  const kinds = inbox.docs.reduce((acc, d) => ({ ...acc, [d.data().kind]: (acc[d.data().kind] ?? 0) + 1 }), {});
  console.log('inbox deliveries by kind:', kinds);

  // Idempotency: advancing a finished game, or re-running, must change nothing.
  const before = JSON.stringify(await game());
  await host.advance(gid);
  console.log(`advance after finale is a no-op: ${JSON.stringify(await game()) === before ? 'ok' : 'FAIL'}`);

  console.log('\nsecurity:');
  for (const [s, label, detail] of security) console.log(`  ${s.padEnd(4)} ${label} (${detail})`);
  const failed = security.filter(([s]) => s === 'FAIL').length;
  console.log(failed ? `\n${failed} security check(s) FAILED` : '\nall security checks passed');
  process.exit(failed ? 1 : 0);
}

// --- Join: fill a room around real phones -------------------------------------------

async function join(n) {
  const bots = await Promise.all(Array.from({ length: n }, (_, i) => makeBot(i + 100)));
  const metaSnap = await getDoc(doc(bots[0].db, 'meta', 'active'));
  const gid = metaSnap.data()?.gameId;
  if (!gid) throw new Error('No active game. Create one from the host console first.');
  await Promise.all(bots.map((b) => arrive(b, gid)));
  console.log(`${n} bots arrived in ${gid}. They act on every phase; Ctrl+C to stop.`);

  let last = '';
  onSnapshot(doc(bots[0].db, 'games', gid), async (s) => {
    const g = s.data();
    const key = `${g.phase}:${g.cycle}:${g.ballot ?? ''}`;
    if (key === last) return;
    last = key;
    console.log(`phase ${g.phase} (cycle ${g.cycle})`);
    // A short, human-ish delay so the host console shows actions trickling in.
    await new Promise((r) => setTimeout(r, 1500));
    try {
      if (g.phase === 'night') await Promise.all(bots.map((b) => act(b, gid, g)));
      if (g.phase === 'recruit') await Promise.all(bots.map((b) => answerRecruit(b, gid, g)));
      if (g.phase === 'game') {
        // Wait out the countdown so bot scores land inside the window, like a phone's would.
        await new Promise((r) => setTimeout(r, Math.max(0, (g.revealAt ?? 0) - Date.now()) + 3000));
        await Promise.all(bots.map((b) => play(b, gid, g)));
      }
      if (['roundtable', 'revote', 'endgame'].includes(g.phase)) await Promise.all(bots.map((b) => vote(b, gid, g)));
    } catch (e) {
      console.warn('bot error:', e.code ?? e.message);
    }
  });
}

// --- Main ------------------------------------------------------------------------------

if (!(await emulatorUp())) {
  console.error('The Firestore emulator is not running on 127.0.0.1:8080. Start it with `npm run emulators`.');
  process.exit(2);
}
if (args.selftest) await selftest(Number(args.n ?? 20));
else if (args.join) await join(Number(args.join));
else console.log('Usage: node scripts/bots.mjs --selftest [--n 20] | --join <count>');
