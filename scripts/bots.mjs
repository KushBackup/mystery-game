#!/usr/bin/env node
/**
 * Bots for Killers Night, against the Firebase Local Emulator (or, with
 * --live, the real game).
 *
 *   npm run emulators                         # in another terminal first
 *   node scripts/bots.mjs --selftest --n 20   # play a whole game, check the rules hold
 *   node scripts/bots.mjs --join 12           # add 12 bots to the active game, to fill
 *                                             # a room around real phones in the browser
 *   node scripts/bots.mjs --join 8 --live     # the same, in the LIVE game (murder-1bf1c)
 *
 * --live joins the game the host console created on the real project. It
 * needs no emulator and no host sign-in: bots are anonymous guests under the
 * real security rules, like any phone. Their names end in "(bot)" so the host
 * can tell them apart, and they send a heartbeat so the console shows them
 * present. Ctrl+C while the game is still in the lobby takes them back out;
 * after the deal they stay (as a phone that walked out would), and the host
 * removes them. --selftest is never allowed with --live: it creates games and
 * plays host.
 *
 * Every bot is its own Firebase app with its own anonymous user, so the real
 * security rules judge every write, exactly as they would on 40 phones. The
 * self-test also plays host (signed in to the Auth emulator with a fake Google
 * credential for a host email) through src/firebase/host.js, the same code the
 * host console runs.
 *
 * Without --live it refuses to run unless the emulator answers, and never
 * touches the live project: the bots use the demo-killers project id, which
 * cannot reach the cloud, and src/firebase/app.js is emulated outside a
 * production build.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, signInAnonymously, signInWithCredential, GoogleAuthProvider, inMemoryPersistence, setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, connectFirestoreEmulator, memoryLocalCache, doc, collection, getDoc, getDocs, setDoc, updateDoc,
  query, where, serverTimestamp, addDoc, writeBatch, deleteDoc,
} from 'firebase/firestore';
import { TRAITS } from '../src/data/traits.js';
import { fits } from '../src/lib/engine/clues.js';
import {
  botName, G, arrive, heartbeat, leave, readSelf, act, play, playDay, vote, answerRecruit, driveBots, lastWords, accuseDay, joinHalves,
} from '../src/firebase/bots.js';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] == null ? 'true' : arr[i + 1]]);
    return acc;
  }, []),
);

const HOST = '127.0.0.1';
const LIVE = Boolean(args.live);
const CONFIG = LIVE
  ? (await import('../src/firebase/app.js')).LIVE_CONFIG
  : { apiKey: 'demo-key', authDomain: 'demo-killers.firebaseapp.com', projectId: 'demo-killers' };

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
  if (!LIVE) connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true });
  await setPersistence(auth, inMemoryPersistence);
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  if (!LIVE) connectFirestoreEmulator(db, HOST, 8080);
  const { user } = await signInAnonymously(auth);
  const name = botName(i);
  return { i, app, db, uid: user.uid, pid: user.uid, name: LIVE ? `${name} (bot)` : name };
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

/**
 * Before the deal: answers are written once and never edited. The only ways to
 * change them are leaving (the phone unbinds and sets up again) or the host
 * removing the guest. Every bot ends these checks arrived again.
 */
async function lobbyChecks(bots, gid, host) {
  const results = [];
  const [a, b, c] = bots;
  await expectDenied('guest edits their own traits before the deal', () => updateDoc(G(a, gid, 'traits', a.pid), { top: a.traits.top === 'red' ? 'blue' : 'red' }), results);
  await expectDenied('guest rewrites their own traits before the deal', () => setDoc(G(a, gid, 'traits', a.pid), a.traits), results);
  await expectDenied('guest deletes another guest before the deal', () => deleteDoc(G(a, gid, 'players', b.pid)), results);
  await expectDenied('guest unbinds another phone', () => deleteDoc(G(a, gid, 'bindings', b.uid)), results);
  // Leave before the deal, then join again with new answers.
  await expectAllowed('guest leaves before the deal (leaveBeforeStart)', async () => {
    const batch = writeBatch(b.db);
    batch.delete(G(b, gid, 'players', b.pid));
    batch.delete(G(b, gid, 'traits', b.pid));
    batch.delete(G(b, gid, 'bindings', b.uid));
    await batch.commit();
  }, results);
  await expectAllowed('the guest who left joins again', () => arrive(b, gid), results);
  // The host removes a guest before the deal: the binding goes too, so their phone can set up again.
  await host.removePlayer(gid, c.pid, 'lobby');
  const gone = await getDoc(G(c, gid, 'bindings', c.uid)).then((d) => !d.exists(), () => false);
  results.push([gone ? 'ok' : 'FAIL', 'host removal before the deal unbinds the phone', gone ? 'unbound' : 'binding left']);
  await expectAllowed('the removed guest joins again', () => arrive(c, gid), results);

  // A phone that lost the game asks to be signed back in; the host binds it to the guest it was.
  const lost = await makeBot(900);
  const knockOf = (bot, name) => setDoc(G(bot, gid, 'knocks', bot.uid), { name, code: bot.uid.slice(0, 6).toUpperCase(), at: Date.now() });
  await expectAllowed('a signed-out phone asks to be signed back in', () => knockOf(lost, a.name), results);
  await expectDenied('a guest still in the game knocks', () => knockOf(a, a.name), results);
  await expectDenied('a guest reads another phone\'s knock', () => getDoc(G(a, gid, 'knocks', lost.uid)), results);
  await expectDenied('a phone binds itself to another guest', () => setDoc(G(lost, gid, 'bindings', lost.uid), { pid: a.pid }), results);
  await expectAllowed('host signs the phone back in (relink)', () => host.relink(gid, lost.uid, a.pid), results);
  const knockGone = await getDoc(G(lost, gid, 'knocks', lost.uid)).then((d) => !d.exists(), () => false);
  results.push([knockGone ? 'ok' : 'FAIL', 'signing in clears the knock', knockGone ? 'cleared' : 'still there']);
  await expectAllowed('the signed-back-in phone acts as its guest', () => updateDoc(G(lost, gid, 'players', a.pid), { table: '3' }), results);
  await expectDenied('signing in revokes the former phone', () => updateDoc(G(a, gid, 'players', a.pid), { table: '4' }), results);
  // Restore the bot that the rest of the suite uses, proving the replacement
  // binding is revoked when the guest returns to their original phone too.
  await expectAllowed('host restores the original phone', () => host.relink(gid, a.uid, a.pid), results);
  await expectDenied('restoring a phone revokes its replacement', () => updateDoc(G(lost, gid, 'players', a.pid), { table: '5' }), results);
  return results;
}

async function securityChecks(bots, gid) {
  const results = [];
  const faithful = bots.find((b) => b.role !== 'killer');
  const killer = bots.find((b) => b.role === 'killer');
  const other = bots.find((b) => b !== faithful);

  await expectDenied('faithful reads another guest\'s role', () => getDoc(G(faithful, gid, 'roles', other.pid)), results);
  await expectAllowed('faithful reads own role', () => getDoc(G(faithful, gid, 'roles', faithful.pid)), results);
  await expectAllowed('faithful reads another guest\'s traits (public: Contacts)', () => getDoc(G(faithful, gid, 'traits', other.pid)), results);
  await expectDenied('faithful edits another guest\'s traits', () => setDoc(G(faithful, gid, 'traits', other.pid), faithful.traits), results);
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
  await expectDenied('faithful posts a clue outside the day game', () => setDoc(G(faithful, gid, 'clues', `0_${faithful.pid}`), { pid: faithful.pid, cycle: 0, clue: 'x', at: 1 }), results);
  await expectDenied('faithful posts a drawing outside the day game', () => setDoc(G(faithful, gid, 'drawings', `0_${faithful.pid}`), { pid: faithful.pid, cycle: 0, strokes: '', checks: [], at: 1 }), results);
  if (killer) {
    await expectAllowed('killer lists the killers', () => getDocs(collection(killer.db, 'games', gid, 'killers')), results);
    await expectDenied('killer reads a guest\'s role', () => getDoc(G(killer, gid, 'roles', faithful.pid)), results);
  }
  return results;
}

/** Rule checks that need a word day open: one clue each, picks and words private, ghosts silent. */
async function wordChecks(bots, gid, game) {
  const results = [];
  const a = bots.find((b) => b.status === 'alive');
  const b = bots.find((x) => x !== a && x.status === 'alive');
  const ghost = bots.find((x) => x.status === 'ghost');
  const c = game.cycle;
  const clue = (bot, pid, text) => setDoc(G(bot, gid, 'clues', `${c}_${pid}`), { pid, cycle: c, clue: text, at: serverTimestamp() });
  await expectAllowed('guest posts a clue on a word day', () => clue(a, a.pid, 'sunny'), results);
  await expectDenied('guest edits their clue after posting', () => clue(a, a.pid, 'cloudy'), results);
  await expectDenied('guest posts a clue for someone else', () => clue(a, b.pid, 'rainy'), results);
  await expectDenied('guest posts a 40-letter clue', () => clue(b, b.pid, 'x'.repeat(40)), results);
  await expectAllowed('anyone reads the wall', () => getDocs(query(collection(b.db, 'games', gid, 'clues'), where('cycle', '==', c))), results);
  await expectAllowed('guest saves their picks', () => setDoc(G(a, gid, 'picks', `${c}_${a.pid}`), { pid: a.pid, cycle: c, picks: [], at: 1 }), results);
  await expectDenied('guest reads another guest\'s picks', () => getDoc(G(b, gid, 'picks', `${c}_${a.pid}`)), results);
  await expectDenied('guest reads another guest\'s word', () => getDoc(G(b, gid, 'inbox', `${c}-day-${a.pid}`)), results);
  await expectAllowed('guest reads their own word', () => getDoc(G(b, gid, 'inbox', `${c}-day-${b.pid}`)), results);
  await expectDenied('guest posts a drawing on a word day', () => setDoc(G(b, gid, 'drawings', `${c}_${b.pid}`), { pid: b.pid, cycle: c, strokes: '0', checks: [], at: 1 }), results);
  if (ghost) await expectDenied('ghost posts a clue', () => clue(ghost, ghost.pid, 'boo'), results);
  return results;
}

/** Rule checks that need a drawing day open. */
async function drawChecks(bots, gid, game) {
  const results = [];
  const a = bots.find((b) => b.status === 'alive');
  const b = bots.find((x) => x !== a && x.status === 'alive');
  const c = game.cycle;
  const draw = (bot, pid, strokes) => setDoc(G(bot, gid, 'drawings', `${c}_${pid}`), { pid, cycle: c, strokes, checks: ['abc'], at: serverTimestamp() });
  await expectAllowed('guest saves a drawing', () => draw(a, a.pid, '0000011112222'), results);
  await expectAllowed('guest redraws before the end', () => draw(a, a.pid, '0000011112222'), results);
  await expectDenied('guest draws on someone else\'s drawing', () => draw(a, b.pid, '0'), results);
  await expectDenied('guest saves an oversized drawing', () => draw(b, b.pid, '0'.repeat(31000)), results);
  await expectAllowed('guest saves guesses', () => setDoc(G(a, gid, 'guesses', `${c}_${a.pid}`), { pid: a.pid, cycle: c, answers: {}, at: 1 }), results);
  await expectDenied('guest reads another guest\'s guesses', () => getDoc(G(b, gid, 'guesses', `${c}_${a.pid}`)), results);
  await expectDenied('guest posts a clue on a drawing day', () => setDoc(G(b, gid, 'clues', `${c}_${b.pid}`), { pid: b.pid, cycle: c, clue: 'x', at: serverTimestamp() }), results);
  return results;
}

/** Rule checks that need a ghost: Spirits is the ghosts' own chat, and nobody living reads or posts in it. */
async function spiritsChecks(bots, gid) {
  const results = [];
  const ghost = bots.find((x) => x.status === 'ghost');
  const living = bots.find((x) => x.status === 'alive');
  const spirits = (bot) => collection(bot.db, 'games', gid, 'spiritsChat');
  const post = (bot) => addDoc(spirits(bot), { pid: bot.pid, name: bot.name, text: 'boo', at: Date.now() });
  await expectAllowed('ghost posts in Spirits', () => post(ghost), results);
  await expectAllowed('ghost reads Spirits', () => getDocs(spirits(ghost)), results);
  await expectDenied('living guest reads Spirits', () => getDocs(spirits(living)), results);
  await expectDenied('living guest posts in Spirits', () => post(living), results);
  await expectDenied('ghost posts in Spirits as someone else', () => addDoc(spirits(ghost), { pid: living.pid, name: 'x', text: 'boo', at: Date.now() }), results);
  return results;
}

/**
 * Ghost sight and last words, once a guest has been taken this morning:
 * ghosts read every clue the living got, the living can't; only today's
 * taken guest may post last words, only in investigation, only a clue they
 * hold, only once; and no living guest can dress a chat line up as one.
 */
async function lastWordsChecks(bots, gid, game, players) {
  const results = [];
  const c = game.cycle;
  const takenToday = bots.find((b) => ['murdered', 'deep'].includes(players[b.pid]?.cause) && players[b.pid]?.diedCycle === c);
  const older = bots.find((b) => players[b.pid]?.status === 'ghost' && players[b.pid]?.diedCycle < c);
  const living = bots.find((b) => players[b.pid]?.status === 'alive');
  const sight = (bot) => getDocs(collection(bot.db, 'games', gid, 'ghostSight'));
  if (takenToday) await expectAllowed('ghost reads ghost sight', () => sight(takenToday), results);
  await expectDenied('living guest reads ghost sight', () => sight(living), results);

  const held = async (bot) => (await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid))))
    .docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => d.kind === 'fact' && d.via === 'ghost' && d.fact);
  const post = (bot, clue, fact = clue.fact, id = `last_${bot.pid}`) => setDoc(G(bot, gid, 'chat', id), {
    kind: 'last', pid: bot.pid, name: bot.name, inboxId: clue.id, fact: { trait: fact.trait, group: fact.group }, at: Date.now(),
  });
  await expectDenied('living guest posts a fake last message', () => setDoc(G(living, gid, 'chat', `last_${living.pid}`), {
    kind: 'last', pid: living.pid, name: living.name, text: 'trust me', inboxId: 'x', fact: { trait: 'top', group: 'dark' }, at: Date.now(),
  }), results);
  await expectDenied('living guest sends a chat line carrying a fact', () => addDoc(collection(living.db, 'games', gid, 'chat'), {
    pid: living.pid, name: living.name, text: 'look', fact: { trait: 'top', group: 'dark' }, at: Date.now(),
  }), results);
  if (older) {
    const theirs = await held(older);
    if (theirs.length) await expectDenied('a ghost from an earlier day posts last words', () => post(older, theirs[0]), results);
  }
  if (!takenToday) return results;
  const mine = (await held(takenToday)).filter((d) => d.cycle === c);
  if (!mine.length) return results;
  const f = mine[0].fact;
  const wrong = f.trait === 'top' ? { trait: 'top', group: f.group === 'dark' ? 'pale' : 'dark' } : { trait: 'top', group: 'dark' };
  await expectDenied('taken guest posts a clue they do not hold', () => post(takenToday, mine[0], wrong), results);
  await expectDenied('taken guest posts under another id', () => post(takenToday, mine[0], f, `last_x${takenToday.pid}`), results);
  await expectAllowed('taken guest posts their last words', () => post(takenToday, mine[0]), results);
  await expectDenied('taken guest posts last words twice', () => post(takenToday, mine[0]), results);
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

/** Rule checks for the two client-controlled poll documents. */
async function pollPayloadChecks(bots, gid, game) {
  const results = [];
  const killer = bots.find((b) => b.status === 'alive' && b.role === 'killer');
  const faithful = bots.find((b) => b.status === 'alive' && b.role !== 'killer');
  if (!killer || !faithful) return results;
  await expectDenied('killer cannot inject hand or rig fields into the den', () => setDoc(
    G(killer, gid, 'den', `${game.cycle}_${killer.pid}`),
    { victim: faithful.pid, hand: killer.pid, rig: 'zero', pid: killer.pid, cycle: game.cycle, at: serverTimestamp() },
  ), results);
  return results;
}

async function ballotPayloadChecks(bots, gid, game) {
  const results = [];
  const voter = bots.find((b) => b.status === 'alive');
  if (!voter) return results;
  await expectDenied('guest cannot vote for themself', () => setDoc(
    G(voter, gid, 'votes', `${game.ballot}_${voter.pid}`),
    { target: voter.pid, pid: voter.pid, ballot: game.ballot, at: serverTimestamp() },
  ), results);
  return results;
}

/** Accusations: once, in daylight (2026-10-15). */
async function accuseChecks(bots, gid, game) {
  const results = [];
  const [a, b, c] = bots.filter((x) => x.status === 'alive');
  if (!c) return results;
  const cy = game.cycle;
  const accuse = (bot, target, extra = {}) => setDoc(G(bot, gid, 'accusations', `${cy}_${bot.pid}`), { pid: bot.pid, cycle: cy, target, at: serverTimestamp(), ...extra });
  const second = (bot, accuser) => setDoc(G(bot, gid, 'seconds', `${cy}_${bot.pid}`), { pid: bot.pid, cycle: cy, accuser, at: serverTimestamp() });
  await expectDenied('guest accuses themself', () => accuse(a, a.pid), results);
  await expectDenied('guest attaches a clue that is not theirs', () => accuse(a, b.pid, { inboxId: 'nope', fact: { trait: 'top', group: 'dark' } }), results);
  await expectAllowed('guest accuses another living guest', () => accuse(a, b.pid), results);
  await expectDenied('guest changes their accusation', () => accuse(a, c.pid), results);
  await expectDenied('guest seconds their own accusation', () => second(a, a.pid), results);
  await expectDenied('accused guest seconds the accusation against them', () => second(b, a.pid), results);
  await expectDenied('guest seconds an accusation that does not exist', () => second(c, c.pid), results);
  return results;
}

/** Torn photos: a join for someone else's pair, or a wrong code, gets no photo. */
async function joinChecks(bots, gid) {
  const results = [];
  const { db } = await import('../src/firebase/app.js');
  const pairs = (await getDoc(doc(db, 'games', gid, 'secret', 'engine'))).data()?.pairs ?? {};
  const [id, pair] = Object.entries(pairs).find(([, p]) => !p.joined && bots.some((x) => x.pid === p.a) && bots.some((x) => x.pid === p.b)) ?? [];
  const outsider = bots.find((x) => pair && x.pid !== pair.a && x.pid !== pair.b && ['alive', 'ghost'].includes(x.status));
  if (!pair || !outsider) return results;
  const a = bots.find((x) => x.pid === pair.a);
  const write = (bot, code) => setDoc(G(bot, gid, 'joins', `${id}_${bot.pid}`), { pid: bot.pid, pair: id, code, at: serverTimestamp() });
  await expectAllowed('outsider writes a join for a pair they are not in', () => write(outsider, pair.codeA), results);
  await expectAllowed('pair member types a wrong code', () => write(a, pair.codeA === 'ZZZ' ? 'YYY' : 'ZZZ'), results);
  await new Promise((r) => setTimeout(r, 2500));
  const okOf = async (bot) => (await getDoc(doc(db, 'games', gid, 'joins', `${id}_${bot.pid}`))).data()?.ok;
  const [o, w] = [await okOf(outsider), await okOf(a)];
  results.push([o === false ? 'ok' : 'FAIL', 'the host refuses a join from outside the pair', `ok=${o}`]);
  results.push([w === false ? 'ok' : 'FAIL', 'the host refuses a wrong code', `ok=${w}`]);
  await expectAllowed('pair member retries after a wrong code', () => write(a, pair.codeB), results);
  return results;
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
  // The console checks torn-photo joins; the self-test is the console here.
  host.watchJoins(gid);
  const bots = await Promise.all(Array.from({ length: n }, (_, i) => makeBot(i)));
  await Promise.all(bots.map((b) => arrive(b, gid)));
  console.log(`${bots.length} bots arrived`);

  const { db } = await import('../src/firebase/app.js');
  const game = async () => (await getDoc(doc(db, 'games', gid))).data();

  const lobby = await lobbyChecks(bots, gid, host);

  await host.advance(gid); // deal
  await Promise.all(bots.map((b) => readSelf(b, gid)));
  const counts = bots.reduce((acc, b) => ({ ...acc, [b.role]: (acc[b.role] ?? 0) + 1 }), {});
  console.log('dealt:', counts);

  const security = [...lobby, ...await securityChecks(bots, gid)];

  const log = [];
  let guard = 0;
  let late = null;
  const ranChecks = new Set();
  let forged = null;
  for (;;) {
    if (guard++ > 140) throw new Error('game did not finish in 140 steps');
    const g = await game();
    if (g.phase === 'finale') break;

    if (g.phase === 'night') {
      if (!ranChecks.has('poll-payload')) {
        ranChecks.add('poll-payload');
        security.push(...await pollPayloadChecks(bots, gid, g));
      }
      if (!ranChecks.has('accuse-night') && bots.some((b) => b.status === 'alive')) {
        ranChecks.add('accuse-night');
        const [x, y] = bots.filter((b) => b.status === 'alive');
        await expectDenied('guest accuses at night', () => setDoc(G(x, gid, 'accusations', `${g.cycle}_${x.pid}`), { pid: x.pid, cycle: g.cycle, target: y.pid, at: serverTimestamp() }), security);
      }
      await Promise.all(bots.map((b) => act(b, gid, g)));
      // Once there is a ghost: one of them tries to pass a clue it doesn't hold. The host must drop it.
      const forger = bots.find((b) => b.status === 'ghost');
      const mark = bots.find((b) => b.status === 'alive');
      if (!forged && forger && mark) {
        forged = { pid: forger.pid, cycle: g.cycle };
        await setDoc(G(forger, gid, 'actions', `${g.cycle}_${forger.pid}`), {
          kind: 'pass', target: mark.pid, fact: { trait: 'forged', group: 'forged' }, pid: forger.pid, cycle: g.cycle, at: serverTimestamp(),
        });
      }
    } else if (g.phase === 'recruit') {
      await Promise.all(bots.map((b) => answerRecruit(b, gid, g)));
    } else if (g.phase === 'game') {
      await Promise.all(bots.map((b) => readSelf(b, gid)));
      if (!ranChecks.has('spirits') && bots.some((b) => b.status === 'ghost') && bots.some((b) => b.status === 'alive')) {
        ranChecks.add('spirits');
        security.push(...await spiritsChecks(bots, gid));
      }
      const kind = g.minigame ?? 'run';
      // Each game's checks once; the word checks again once there is a ghost to test.
      const checkKey = kind === 'word' && bots.some((b) => b.status === 'ghost') ? 'word+ghost' : kind;
      if (!ranChecks.has(checkKey)) {
        ranChecks.add(checkKey);
        if (kind === 'word') security.push(...await wordChecks(bots, gid, g));
        else if (kind === 'draw') security.push(...await drawChecks(bots, gid, g));
        else security.push(...(await runChecks(bots, gid, g)).results);
      }
      if (kind === 'run') await Promise.all(bots.map((b) => play(b, gid, g)));
      else for (const stage of [0, 1]) await Promise.all(bots.map((b) => playDay(b, gid, g, stage)));
    } else if (['roundtable', 'revote', 'endgame'].includes(g.phase)) {
      if (!ranChecks.has('ballot-payload')) {
        ranChecks.add('ballot-payload');
        security.push(...await ballotPayloadChecks(bots, gid, g));
      }
      await Promise.all(bots.map((b) => vote(b, gid, g)));
    } else if (g.phase === 'dawn' && !ranChecks.has('last-early')) {
      // Last words are refused before the investigation opens, even for today's taken guest.
      const players = Object.fromEntries((await getDocs(collection(db, 'games', gid, 'players'))).docs.map((d) => [d.id, d.data()]));
      const taken = bots.find((x) => ['murdered', 'deep'].includes(players[x.pid]?.cause) && players[x.pid]?.diedCycle === g.cycle);
      const clue = taken && (await getDocs(query(collection(taken.db, 'games', gid, 'inbox'), where('to', '==', taken.pid)))).docs
        .map((d) => ({ id: d.id, ...d.data() })).find((d) => d.kind === 'fact' && d.via === 'ghost' && d.cycle === g.cycle);
      if (clue) {
        ranChecks.add('last-early');
        await expectDenied('taken guest posts last words during the board', () => setDoc(G(taken, gid, 'chat', `last_${taken.pid}`), {
          kind: 'last', pid: taken.pid, name: taken.name, inboxId: clue.id, fact: clue.fact, at: Date.now(),
        }), security);
      }
    }
    if (g.phase === 'investigation') {
      await Promise.all(bots.map((x) => readSelf(x, gid)));
      const players = Object.fromEntries((await getDocs(collection(db, 'games', gid, 'players'))).docs.map((d) => [d.id, d.data()]));
      const fresh = bots.some((x) => ['murdered', 'deep'].includes(players[x.pid]?.cause) && players[x.pid]?.diedCycle === g.cycle);
      const needOlder = !ranChecks.has('last-older') && bots.some((x) => players[x.pid]?.status === 'ghost' && players[x.pid]?.diedCycle < g.cycle);
      if (fresh && (!ranChecks.has('last') || needOlder)) {
        if (needOlder) ranChecks.add('last-older');
        ranChecks.add('last');
        security.push(...await lastWordsChecks(bots, gid, g, players));
      }
      await Promise.all(bots.map((x) => lastWords(x, gid, g).catch(() => {})));
      if (!ranChecks.has('joins')) {
        const checks = await joinChecks(bots, gid);
        if (checks.length) { ranChecks.add('joins'); security.push(...checks); }
      }
      const joined = await joinHalves(bots, gid);
      if (!ranChecks.has('accuse')) {
        ranChecks.add('accuse');
        security.push(...await accuseChecks(bots, gid, g));
      }
      await Promise.all(bots.map((x) => accuseDay(x, gid, g, 0)));
      await Promise.all(bots.map((x) => accuseDay(x, gid, g, 1)));
      log.push(`  daylight ${g.cycle}: ${joined} torn photos joined`);
      // Give the host's join listener a moment to deliver before the day closes.
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (g.phase === 'investigation' && g.cycle === 2 && !late) {
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
    // The finale's account of every night must never reach a phone before there is a winner.
    if ((after.finaleStory || after.finaleRoles) && !after.winner) log.push(`  FAIL: finale story published mid-game (${after.phase})`);
    // Nor may the day's word (or who drew what) reach a phone before the game locks.
    if (['alarm', 'game'].includes(after.phase) && after.dayGame?.cycle === after.cycle) log.push(`  FAIL: day ${after.cycle}'s game revealed during ${after.phase}`);
    // Nor the paper's witness: it is written with the board, never before.
    if (['alarm', 'game'].includes(after.phase) && after.dawn?.cycle === after.cycle) log.push(`  FAIL: day ${after.cycle}'s witness written during ${after.phase}`);
    if (after.phase === 'dawn') {
      const d = after.dawn;
      const names = (pids) => pids.map((p) => bots.find((b) => b.pid === p)?.name ?? p).join(', ') || 'none';
      const rows = after.board?.rows ?? [];
      const dg = after.dayGame ?? {};
      log.push(`day ${after.cycle} [${after.board?.kind ?? '?'}${dg.word ? `: ${dg.word} / ${dg.hint}` : dg.words ? `: ${Object.keys(dg.words).length} words dealt` : ''}]: ${d.cause === 'rig' ? `rig took ${names(d.victims)} (board shows ${d.rigged})` : d.cause === 'deep' ? `firewall on ${names([d.attempted])}; the deep took ${names(d.victims)}` : d.cause === 'shield' ? `shield held for ${names([d.attempted])}; the bottom score took ${names(d.victims)}` : 'nobody taken'}${d.vanished.length ? `; vanished ${names(d.vanished)}` : ''}${d.recruited ? '; a recruit said yes' : ''}`);
      log.push(`  board: ${rows.slice(0, 3).map((r) => `${names([r.pid])} ${r.score}`).join(', ')} … last ${rows.length ? `${names([rows.at(-1).pid])} ${rows.at(-1).score}` : '-'}; top-3 photos to ${names(after.board?.top ?? [])}`);
    }
    if (after.phase === 'roundtable') log.push(`  on trial: ${(after.trial ?? []).map((p) => bots.find((b) => b.pid === p)?.name ?? p).join(', ')}${after.ballotTargets?.includes('none') ? ' (or no one)' : ''}`);
    if (after.phase === 'revote') log.push(`  tie between ${after.tied.length}; re-vote`);
    if (after.phase === 'banish') {
      const b = after.banish;
      const name = bots.find((x) => x.pid === b.pid)?.name ?? 'nobody';
      log.push(`${after.endgameRound ? `endgame ${after.endgameRound}` : `round table ${after.cycle}`}: ${b.unaccused ? 'nobody accused, no vote' : b.spared ? 'the room spared the accused' : `banished ${name} (${b.role ?? '-'}), ${b.cast} votes`}`);
    }
  }

  const end = await game();
  console.log(log.join('\n'));
  console.log(`\nWINNER: ${end.winner}`);
  console.log(`finale story: ${Object.keys(end.finaleStory?.nights ?? {}).length} nights recorded, ${Object.keys(end.finaleRoles ?? {}).length} roles ${end.finaleStory ? 'ok' : 'FAIL (missing)'}`);

  const inbox = await getDocs(collection(db, 'games', gid, 'inbox'));
  const kinds = inbox.docs.reduce((acc, d) => ({ ...acc, [d.data().kind]: (acc[d.data().kind] ?? 0) + 1 }), {});
  console.log('inbox deliveries by kind:', kinds);

  // Passed photos: real ones arrive as true clues, signed; the forged one never arrives.
  const passed = inbox.docs.map((d) => d.data()).filter((d) => d.via === 'pass');
  const ghostHeld = inbox.docs.map((d) => d.data()).filter((d) => d.via === 'ghost');
  const real = passed.every((p) => ghostHeld.some((h) => h.to === p.from && h.fact.trait === p.fact.trait && h.fact.group === p.fact.group));
  security.push([real ? 'ok' : 'FAIL', `ghosts pass only clues they hold (${passed.length} passed)`, real ? 'all held' : 'a pass was not held']);
  if (forged) security.push([passed.some((p) => p.fact.trait === 'forged') ? 'FAIL' : 'ok', 'a forged pass is dropped', `night ${forged.cycle}`]);

  // The paper's witness: printed on murder mornings, always true of that night's hand.
  const hands = end.finaleStory?.hands ?? {};
  const traitsSnap = Object.fromEntries((await getDocs(collection(db, 'games', gid, 'traits'))).docs.map((d) => [d.id, d.data()]));
  const witnesses = (end.news ?? []).filter((e) => e.kind === 'dawn' && e.witness);
  const lying = witnesses.filter((e) => !fits(TRAITS, traitsSnap[hands[e.cycle]], e.witness));
  security.push([lying.length ? 'FAIL' : 'ok', `the paper's witness is true (${witnesses.length} printed)`, lying.length ? `day ${lying[0].cycle}` : 'all fit the hand']);
  // Ghost sight holds every clue the living got, under the inbox ids they arrived with.
  const sightDocs = (await getDocs(collection(db, 'games', gid, 'ghostSight'))).docs.map((d) => d.data());
  const byId = Object.fromEntries(inbox.docs.map((d) => [d.id, d.data()]));
  const badSight = sightDocs.flatMap((d) => d.items ?? []).filter((it) => byId[it.id]?.to !== it.to || byId[it.id]?.fact?.group !== it.fact.group);
  security.push([badSight.length ? 'FAIL' : 'ok', `ghost sight matches the inbox (${sightDocs.length} nights)`, badSight.length ? `${badSight.length} mismatched` : 'all match']);
  const lastPosts = (await getDocs(collection(db, 'games', gid, 'chat'))).docs.map((d) => d.data()).filter((m) => m.kind === 'last');
  const realLast = lastPosts.every((m) => ghostHeld.some((h) => h.to === m.pid && h.fact.trait === m.fact.trait && h.fact.group === m.fact.group));
  security.push([realLast ? 'ok' : 'FAIL', `last words are clues the guest held (${lastPosts.length} posted)`, realLast ? 'all held' : 'one was not held']);

  // Torn photos: every whole photo a join delivered is that pair's true fact, to both of its holders.
  const secretPairs = (await getDoc(doc(db, 'games', gid, 'secret', 'engine'))).data()?.pairs ?? {};
  const joinedDocs = inbox.docs.map((d) => d.data()).filter((d) => d.via === 'join');
  const badJoin = joinedDocs.filter((d) => {
    const p = secretPairs[d.pair];
    return !p || ![p.a, p.b].includes(d.to) || p.fact.trait !== d.fact.trait || p.fact.group !== d.fact.group;
  });
  const pairCount = Object.keys(secretPairs).length;
  security.push([badJoin.length ? 'FAIL' : 'ok', `joined photos match their pairs (${joinedDocs.length / 2} of ${pairCount} pairs joined)`, badJoin.length ? `${badJoin.length} wrong` : 'all match']);

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
  if (LIVE) {
    console.log(`LIVE game ${gid}: ${n} bots join in 5 s. Ctrl+C now to cancel.`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  await Promise.all(bots.map((b) => arrive(b, gid)));
  console.log(`${n} bots arrived in ${gid}. They act on every phase; Ctrl+C to stop.`);

  const beat = () => Promise.all(bots.map((b) => heartbeat(b, gid))).catch((e) => console.warn('heartbeat:', e.code ?? e.message));
  beat();
  setInterval(beat, 60_000);

  let phase = 'lobby';
  process.on('SIGINT', async () => {
    if (phase === 'lobby') {
      await Promise.all(bots.map((b) => leave(b, gid))).catch((e) => console.warn('leave:', e.code ?? e.message));
      console.log(`${n} bots left ${gid}.`);
    } else {
      console.log(`Bots stopped. They stay in ${gid}; remove them from the host console.`);
    }
    process.exit(0);
  });

  driveBots(bots[0].db, gid, bots, { log: (m) => console.log(m), onPhase: (p) => { phase = p; } });
}

// --- Main ------------------------------------------------------------------------------

if (LIVE && (args.selftest || !args.join)) {
  console.error('--live only goes with --join. The self-test creates games and plays host; it never runs live.');
  process.exit(2);
}
if (!LIVE && !(await emulatorUp())) {
  console.error('The Firestore emulator is not running on 127.0.0.1:8080. Start it with `npm run emulators`.');
  process.exit(2);
}
if (args.selftest) await selftest(Number(args.n ?? 20));
else if (args.join) await join(Number(args.join));
else console.log('Usage: node scripts/bots.mjs --selftest [--n 20] | --join <count> [--live]');
