/**
 * Bot guests for Killers Night: what a bot does, given a signed-in bot.
 *
 * A bot is one phone: its own Firebase app, its own anonymous user, so the
 * real security rules judge every write. Making one is the caller's job,
 * because Node and the browser make them differently: scripts/bots.mjs
 * (emulator self-test, and filling a room from a terminal) and hostBots.js
 * (the host console's "Add bot" button). Everything after that is here, so
 * both kinds of bot play the same game.
 *
 * A bot is `{ i, db, uid, pid, name }`. Every choice is random but legal for
 * the bot's role, and every write is one a real phone would make.
 */

import {
  doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { TRAITS, GENDER } from '../data/traits.js';
import { PACKS, DEFAULT_PACK_ID, dayKit } from '../data/packs/index.js';
import { STEPS, checksOf, guessHits, wordForms, assignDrawings, spoils } from '../lib/engine/minigames.js';
import { encode } from '../os/game/strokes.js';

export const NAMES = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ishita', 'Vikram', 'Tara', 'Neel', 'Anaya', 'Dev', 'Zoya',
  'Arjun', 'Kiara', 'Sahil', 'Riya', 'Omar', 'Leela', 'Yash', 'Sana', 'Karan', 'Nisha', 'Aditya', 'Pooja', 'Farhan',
  'Ira', 'Manav', 'Tanvi', 'Reyansh', 'Aisha', 'Veer', 'Myra', 'Kunal', 'Alia', 'Rehan', 'Sara', 'Nikhil', 'Avni', 'Jay', 'Esha'];

export const botName = (i) => NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : '');

const rnd = (xs) => xs[Math.floor(Math.random() * xs.length)];

export const G = (bot, gid, ...p) => doc(bot.db, 'games', gid, ...p);

export async function arrive(bot, gid) {
  const traits = { ...Object.fromEntries(TRAITS.map((t) => [t.id, rnd(t.options).id])), gender: rnd(GENDER.options).id };
  bot.traits = traits;
  await setDoc(G(bot, gid, 'bindings', bot.uid), { pid: bot.uid });
  await setDoc(G(bot, gid, 'players', bot.uid), { name: bot.name, status: 'alive', joinedAt: Date.now() });
  await setDoc(G(bot, gid, 'traits', bot.uid), traits);
}

/** The heartbeat a phone sends (game.js beat), so the host console shows the bot present. */
export const heartbeat = (bot, gid) =>
  setDoc(G(bot, gid, 'presence', bot.pid), { stamp: serverTimestamp(), beatAt: Date.now() }, { merge: true });

/** Before the deal a guest may leave on their own: undo the arrival, as game.js leaveBeforeStart does. */
export async function leave(bot, gid) {
  await deleteDoc(G(bot, gid, 'presence', bot.pid));
  const batch = writeBatch(bot.db);
  for (const c of ['players', 'traits', 'bindings']) batch.delete(G(bot, gid, c, bot.pid));
  await batch.commit();
}

export async function readSelf(bot, gid) {
  const [role, me] = await Promise.all([getDoc(G(bot, gid, 'roles', bot.pid)), getDoc(G(bot, gid, 'players', bot.pid))]);
  bot.role = role.exists() ? role.data().role : null;
  bot.status = me.data()?.status;
}

async function allPlayers(bot, gid) {
  const snap = await getDocs(collection(bot.db, 'games', gid, 'players'));
  return snap.docs.map((d) => ({ pid: d.id, ...d.data() }));
}

/** One night action, chosen at random but always legal for the role. */
export async function act(bot, gid, game) {
  await readSelf(bot, gid);
  const players = await allPlayers(bot, gid);
  const alive = players.filter((p) => p.status === 'alive' && p.pid !== bot.pid);
  if (!alive.length) return;
  const c = game.cycle;
  const action = (a) => setDoc(G(bot, gid, 'actions', `${c}_${bot.pid}`), { ...a, pid: bot.pid, cycle: c, at: serverTimestamp() });

  if (bot.status === 'ghost') {
    // Pass one of its own clue photos on, or whisper a word (engine/night.js).
    const mine = await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid)));
    const held = mine.docs.map((d) => d.data()).filter((d) => d.kind === 'fact' && d.via === 'ghost' && d.fact);
    if (held.length && Math.random() < 0.6) return action({ kind: 'pass', target: rnd(alive).pid, fact: rnd(held).fact });
    return action({ kind: 'whisper', target: rnd(alive).pid, word: rnd(PACKS[DEFAULT_PACK_ID].whispers) });
  }
  if (bot.status !== 'alive') return;
  if (bot.role === 'killer') {
    const mates = (await getDocs(collection(bot.db, 'games', gid, 'killers'))).docs.map((d) => d.id);
    const faithful = alive.filter((p) => !mates.includes(p.pid));
    const meta = await getDoc(G(bot, gid, 'den', 'meta'));
    const choiceKey = meta.data()?.recruitDue ? 'recruit' : 'victim';
    // Only what the phone's poll sends: the engine picks the hand and the rig.
    return setDoc(G(bot, gid, 'den', `${c}_${bot.pid}`), {
      [choiceKey]: rnd(faithful)?.pid ?? null,
      pid: bot.pid,
      cycle: c,
      at: serverTimestamp(),
    });
  }
  if (bot.role === 'doctor') return action({ kind: 'protect', target: rnd(alive).pid });
  if (bot.role === 'detective') {
    const two = [...alive].sort(() => Math.random() - 0.5).slice(0, 2).map((p) => p.pid);
    return two.length === 2 ? action({ kind: 'trace', targets: two, target: null }) : action({ kind: 'scour', target: null });
  }
  return Math.random() < 0.4 ? action({ kind: 'watch', target: rnd(alive).pid }) : action({ kind: 'scour', target: null });
}

/**
 * The morning run. Each bot has a skill it keeps all game, plays a couple of
 * runs, and writes only a new best, as the real app does. One in ten skips
 * the run, to exercise "didn't play counts as 0".
 */
export async function play(bot, gid, game) {
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
 * Refusals are expected (the rule checks already posted this bot's clue) and
 * are swallowed. Ghosts play both stages too.
 */
export async function playDay(bot, gid, game, stage) {
  await readSelf(bot, gid);
  if (!['alive', 'ghost'].includes(bot.status)) return;
  const c = game.cycle;
  const quiet = (p) => p.catch((e) => { if (e.code !== 'permission-denied') throw e; });
  if (Math.random() < 0.08) return; // some guests never play
  if (game.minigame === 'word') {
    if (stage === 0) {
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
    if (stage === 0) {
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

export async function vote(bot, gid, game) {
  await readSelf(bot, gid);
  if (!['alive', 'ghost'].includes(bot.status)) return;
  const players = await allPlayers(bot, gid);
  let targets = players.filter((p) => p.status === 'alive' && p.pid !== bot.pid).map((p) => p.pid);
  // The Round Table and its re-vote are only between those on trial (and maybe 'none').
  if (game.phase !== 'endgame') targets = (game.ballotTargets ?? targets).filter((p) => p !== bot.pid);
  if (!targets.length) return;
  await setDoc(G(bot, gid, 'votes', `${game.ballot}_${bot.pid}`), {
    target: rnd(targets), pid: bot.pid, ballot: game.ballot, at: serverTimestamp(),
  });
}

/**
 * Last words: a bot the board took this morning posts one of today's true
 * clue photos to the room, most of the time (firestore.rules lastWords).
 * Only a Faithful bot: a Killer the deep took has no reason to help.
 */
export async function lastWords(bot, gid, game) {
  const me = (await getDoc(G(bot, gid, 'players', bot.pid))).data();
  if (me?.status !== 'ghost' || !['murdered', 'deep'].includes(me.cause) || me.diedCycle !== game.cycle) return;
  if (bot.role === 'killer' || Math.random() > 0.7) return;
  const mine = await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid)));
  const today = mine.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => d.kind === 'fact' && d.via === 'ghost' && d.fact && d.cycle === game.cycle);
  if (!today.length) return;
  const clue = rnd(today);
  await setDoc(G(bot, gid, 'chat', `last_${bot.pid}`), {
    kind: 'last', pid: bot.pid, name: bot.name, inboxId: clue.id, fact: { trait: clue.fact.trait, group: clue.fact.group }, at: Date.now(),
  });
}

/**
 * Daylight accusations (engine/banish.js): stage 0, some living bots accuse
 * someone at random; stage 1, some second an accusation they're allowed to.
 * A Killer bot never accuses a partner. Refusals (the rules) are swallowed.
 */
export async function accuseDay(bot, gid, game, stage) {
  await readSelf(bot, gid);
  if (bot.status !== 'alive') return;
  const c = game.cycle;
  const quiet = (p) => p.catch((e) => { if (e.code !== 'permission-denied') throw e; });
  if (stage === 0) {
    if (Math.random() > 0.35) return;
    const players = await allPlayers(bot, gid);
    const mates = bot.role === 'killer' ? (await getDocs(collection(bot.db, 'games', gid, 'killers'))).docs.map((d) => d.id) : [];
    const pool = players.filter((p) => p.status === 'alive' && p.pid !== bot.pid && !mates.includes(p.pid));
    if (!pool.length) return;
    await quiet(setDoc(G(bot, gid, 'accusations', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, target: rnd(pool).pid, at: serverTimestamp() }));
    return;
  }
  if (Math.random() > 0.6) return;
  const accusations = (await getDocs(query(collection(bot.db, 'games', gid, 'accusations'), where('cycle', '==', c)))).docs.map((d) => d.data());
  const open = accusations.filter((a) => a.pid !== bot.pid && a.target !== bot.pid);
  if (!open.length) return;
  await quiet(setDoc(G(bot, gid, 'seconds', `${c}_${bot.pid}`), { pid: bot.pid, cycle: c, accuser: rnd(open).pid, at: serverTimestamp() }));
}

/**
 * Torn photos (engine/clues.js splitHalves): bots that hold halves show each
 * other their codes, the way two guests would at a table, and one of each
 * pair types the other's. Only pairs where both holders are bots can join;
 * 15% of pairs never find each other.
 */
export async function joinHalves(bots, gid) {
  const halves = [];
  for (const bot of bots) {
    const inbox = await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid)));
    const rows = inbox.docs.map((d) => d.data());
    for (const h of rows.filter((d) => d.kind === 'half')) {
      if (!rows.some((d) => d.via === 'join' && d.pair === h.pair)) halves.push({ bot, ...h });
    }
  }
  const codeOf = new Map(halves.map((h) => [`${h.pair}:${h.bot.pid}`, h.code]));
  const tried = new Set();
  for (const h of halves) {
    if (tried.has(h.pair) || Math.random() > 0.85) continue;
    const theirs = codeOf.get(`${h.pair}:${h.partner}`);
    if (!theirs) continue;
    tried.add(h.pair);
    await setDoc(G(h.bot, gid, 'joins', `${h.pair}_${h.bot.pid}`), { pid: h.bot.pid, pair: h.pair, code: theirs, at: serverTimestamp() })
      .catch((e) => { if (e.code !== 'permission-denied') throw e; });
  }
  return tried.size;
}

export async function answerRecruit(bot, gid, game) {
  const inbox = await getDocs(query(collection(bot.db, 'games', gid, 'inbox'), where('to', '==', bot.pid)));
  const offered = inbox.docs.some((d) => d.data().kind === 'recruitOffer' && d.data().cycle === game.cycle);
  if (!offered) return;
  await setDoc(G(bot, gid, 'actions', `${game.cycle}_${bot.pid}`), {
    kind: 'recruitAnswer', accept: Math.random() < 0.5, pid: bot.pid, cycle: game.cycle, at: serverTimestamp(),
  });
}

// --- Driving: every bot acts on every phase -------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Listen to the game doc on `db` and have every bot in `bots` act on each new
 * phase. `bots` is read at each phase, so bots pushed onto it later join in.
 * Returns the unsubscribe.
 */
export function driveBots(db, gid, bots, { log = () => {}, onPhase = () => {} } = {}) {
  let last = '';
  return onSnapshot(doc(db, 'games', gid), async (s) => {
    const g = s.data();
    if (!g) return;
    onPhase(g.phase);
    const key = `${g.phase}:${g.cycle}:${g.ballot ?? ''}`;
    if (key === last) return;
    last = key;
    log(`phase ${g.phase} (cycle ${g.cycle})`);
    // A short, human-ish delay so the host console shows actions trickling in.
    await sleep(1500);
    const all = (fn) => Promise.all(bots.map((b) => fn(b).catch((e) => log(`bot ${b.name}: ${e.code ?? e.message}`))));
    if (g.phase === 'night') await all((b) => act(b, gid, g));
    if (g.phase === 'recruit') await all((b) => answerRecruit(b, gid, g));
    if (g.phase === 'investigation') {
      await all((b) => lastWords(b, gid, g));
      await joinHalves(bots, gid).catch((e) => log(`joins: ${e.code ?? e.message}`));
      await all((b) => accuseDay(b, gid, g, 0));
      await sleep(2000);
      await all((b) => accuseDay(b, gid, g, 1));
    }
    if (g.phase === 'game') {
      // Wait out the countdown so bot scores land inside the window, like a phone's would.
      await sleep(Math.max(0, (g.revealAt ?? 0) - Date.now()) + 3000);
      const steps = STEPS[g.minigame];
      if (!steps) await all((b) => play(b, gid, g));
      else {
        // Post during the first step that takes input, react in the last, like a phone.
        const scale = Math.min(1, ((g.phaseEndsAt - (g.revealAt ?? 0)) - 2000) / steps.reduce((n, [, x]) => n + x * 1000, 0));
        const at = (i) => (g.revealAt ?? 0) + steps.slice(0, i).reduce((n, [, x]) => n + x * 1000 * scale, 0);
        const post = steps.length === 3 ? 1 : 0;
        await sleep(Math.max(0, at(post) - Date.now()) + 2000 + Math.random() * 4000);
        await all((b) => playDay(b, gid, g, 0));
        await sleep(Math.max(0, at(steps.length - 1) - Date.now()) + 2000);
        await all((b) => playDay(b, gid, g, 1));
      }
    }
    if (['roundtable', 'revote', 'endgame'].includes(g.phase)) await all((b) => vote(b, gid, g));
  });
}
