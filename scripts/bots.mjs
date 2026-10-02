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
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore';
import { TRAITS } from '../src/data/traits.js';
import { PACKS, DEFAULT_PACK_ID, dayKit } from '../src/data/packs/index.js';
import { STEPS, checksOf, guessHits, wordForms, assignDrawings, spoils } from '../src/lib/engine/minigames.js';
import { encode } from '../src/os/game/strokes.js';

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

// --- The word and drawing days --------------------------------------------------------

const CLUE_WORDS = ['sunny', 'local', 'tasty', 'loud', 'night', 'summer', 'party', 'cheap', 'classic', 'goan', 'salty', 'sweet', 'quick', 'old'];

async function myDayWord(bot, gid, game) {
  const d = await getDoc(G(bot, gid, 'inbox', `${game.cycle}-day-${bot.pid}`)).catch(() => null);
  return d?.exists() ? d.data() : null;
}

/**
 * The day's game for one bot, in two stages, like the steps on a phone:
 * stage 0 posts (a clue, or a drawing), stage 1 reacts (picks, or guesses).
 * Refusals are expected (a ghost can't post, the rule checks already posted
 * this bot's clue) and are swallowed.
 */
async function playDay(bot, gid, game, stage) {
  await readSelf(bot, gid);
  if (!['alive', 'ghost'].includes(bot.status)) return;
  const c = game.cycle;
  const quiet = (p) => p.catch((e) => { if (e.code !== 'permission-denied') throw e; });
  if (Math.random() < 0.08) return; // some guests never play
  if (game.minigame === 'word') {
    if (stage === 0 && bot.status === 'alive') {
      const mine = await myDayWord(bot, gid, game);
      const clue = CLUE_WORDS.filter((w) => !spoils(w, mine?.word ?? ''))[Math.floor(Math.random() * 10)] ?? 'hmm';
      await quiet(setDoc(G(bot, gid, 'clues', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, clue, at: serverTimestamp() }));
    }
    if (stage === 1) {
      const wall = (await getDocs(query(collection(bot.db, 'games', gid, 'clues'), where('cycle', '==', c)))).docs.map((d) => d.data().pid).filter((p) => p !== bot.pid);
      const picks = wall.sort(() => Math.random() - 0.5).slice(0, 3);
      await quiet(setDoc(G(bot, gid, 'picks', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, picks, at: Date.now() }));
    }
    return;
  }
  if (game.minigame === 'draw') {
    if (stage === 0 && bot.status === 'alive') {
      const mine = await myDayWord(bot, gid, game);
      if (!mine?.word) return;
      const pts = Array.from({ length: 8 }, (_, i) => [20 + i * 25, 60 + Math.floor(Math.random() * 120)]);
      await quiet(setDoc(G(bot, gid, 'drawings', `${c}_${bot.pid}`), {
        pid: bot.pid, cycle: c, strokes: encode([{ ink: 0, points: pts }]), checks: checksOf(mine.word, `${c}:${bot.pid}`), at: serverTimestamp(),
      }));
    }
    if (stage === 1) {
      const drawings = (await getDocs(query(collection(bot.db, 'games', gid, 'drawings'), where('cycle', '==', c)))).docs.map((d) => d.data());
      const byPid = Object.fromEntries(drawings.map((d) => [d.pid, d]));
      const mine = assignDrawings(Object.keys(byPid), bot.pid, `${game.courseSeed}:${c}`);
      const bank = dayKit(PACKS[game.packId] ?? PACKS[DEFAULT_PACK_ID]).drawWords.flatMap(wordForms);
      const answers = {};
      for (const drawer of mine) {
        // A bot "recognises" half the drawings, by trying the bank against the fingerprint.
        const hit = Math.random() < 0.5 ? bank.find((w) => guessHits(w, byPid[drawer].checks, `${c}:${drawer}`)) : null;
        answers[drawer] = { text: hit ?? 'potato', ms: 1000 + Math.floor(Math.random() * 13000) };
      }
      await quiet(setDoc(G(bot, gid, 'guesses', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, answers, at: Date.now() }));
    }
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
  const ranChecks = new Set();
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
    // The finale's account of every night must never reach a phone before there is a winner.
    if ((after.finaleStory || after.finaleRoles) && !after.winner) log.push(`  FAIL: finale story published mid-game (${after.phase})`);
    // Nor may the day's word (or who drew what) reach a phone before the game locks.
    if (['alarm', 'game'].includes(after.phase) && after.dayGame?.cycle === after.cycle) log.push(`  FAIL: day ${after.cycle}'s game revealed during ${after.phase}`);
    if (after.phase === 'dawn') {
      const d = after.dawn;
      const names = (pids) => pids.map((p) => bots.find((b) => b.pid === p)?.name ?? p).join(', ') || 'none';
      const rows = after.board?.rows ?? [];
      const dg = after.dayGame ?? {};
      log.push(`day ${after.cycle} [${after.board?.kind ?? '?'}${dg.word ? `: ${dg.word} / ${dg.hint}` : dg.words ? `: ${Object.keys(dg.words).length} words dealt` : ''}]: ${d.cause === 'rig' ? `rig took ${names(d.victims)} (board shows ${d.rigged})` : d.cause === 'deep' ? `firewall on ${names([d.attempted])}; the deep took ${names(d.victims)}` : 'nobody taken'}${d.vanished.length ? `; vanished ${names(d.vanished)}` : ''}${d.recruited ? '; a recruit said yes' : ''}`);
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
  console.log(`finale story: ${Object.keys(end.finaleStory?.nights ?? {}).length} nights recorded, ${Object.keys(end.finaleRoles ?? {}).length} roles ${end.finaleStory ? 'ok' : 'FAIL (missing)'}`);

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
        const steps = STEPS[g.minigame];
        if (!steps) await Promise.all(bots.map((b) => play(b, gid, g)));
        else {
          // Post during the first step that takes input, react in the last, like a phone.
          const scale = Math.min(1, ((g.phaseEndsAt - (g.revealAt ?? 0)) - 2000) / steps.reduce((n, [, x]) => n + x * 1000, 0));
          const at = (i) => (g.revealAt ?? 0) + steps.slice(0, i).reduce((n, [, x]) => n + x * 1000 * scale, 0);
          const post = steps.length === 3 ? 1 : 0;
          await new Promise((r) => setTimeout(r, Math.max(0, at(post) - Date.now()) + 2000 + Math.random() * 4000));
          await Promise.all(bots.map((b) => playDay(b, gid, g, 0)));
          await new Promise((r) => setTimeout(r, Math.max(0, at(steps.length - 1) - Date.now()) + 2000));
          await Promise.all(bots.map((b) => playDay(b, gid, g, 1)));
        }
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
