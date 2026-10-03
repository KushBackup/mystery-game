/**
 * The day's game. Every morning the whole room plays one of three, in turn:
 *
 *   word   Faithful see a secret word, Killers only its category. Everyone
 *          posts one word that fits; the clues stream onto a public wall in
 *          the order they land, so a Killer can wait and read, but waiting
 *          shows. Then everyone picks the three clues that fit best.
 *   draw   Everyone draws their own secret word at once, then guesses a
 *          handful of other people's drawings by typing. Fast right answers
 *          score; so does a drawing other people get.
 *   run    The DEEP BLUE run (os/game/physics.js), unchanged.
 *
 * Whatever the game, it ends in one score per guest, `{ pid: { best } }`,
 * which is exactly what resolveMorning (morning.js) reads. So the rig, the
 * firewall and the top-three photos work the same on every board.
 *
 * Pure and seeded like the rest of the engine. Two things are public on
 * purpose: which game it is (game.minigame) and the step clock, which every
 * phone derives from the shared revealAt so they all flip together. The
 * words themselves only ever travel through each guest's own inbox.
 */

import { hashString, makeRng, pick, shuffle } from './rng.js';

export const KINDS = ['word', 'draw', 'run'];
export const DEFAULT_GAMES = Object.freeze(['word', 'draw', 'run']);

/**
 * Whether the morning's game has anything to show right now: live play, or
 * its just-finished recap (`game.dayGame`, same cycle and kind). Word and
 * Sketch also open during the alarm, because the guest's card is already in
 * their inbox (and on the first Word morning the tutorial plays there). The
 * run opens only with the game itself. Everywhere else DEEP BLUE has nothing
 * open, so GameApp locks the screen and the dock icon goes transparent and
 * inert (PhoneOS.jsx), rather than offering a practice round that gives the
 * game away (user's call, 2026-10-02).
 */
export function deepBlueOpen(game) {
  const kind = game.minigame ?? 'run';
  if (kind === 'run') return ['game', 'game_locked'].includes(game.phase);
  const today = ['alarm', 'game', 'game_locked'].includes(game.phase);
  const shown = game.dayGame?.cycle === game.cycle && game.dayGame.kind === kind;
  return today || shown;
}

/** Seconds per step, in order. The phase is a little longer (phases.js). */
export const STEPS = Object.freeze({
  word: [['read', 10], ['clue', 60], ['pick', 50]],
  draw: [['draw', 45], ['guess', 90]],
});

export const WORD_PICKS = 3;
export const CLUE_MAX = 20;
export const DRAW_ASSIGN = 6;
export const DRAW_SHOW_MS = 15_000;
export const STROKES_MAX = 30_000;

const CAP = 999;

/** Which game day `cycle` plays. `config.games` is the host's rotation. */
export function gameOfDay(config, cycle) {
  const list = (config?.games ?? DEFAULT_GAMES).filter((k) => KINDS.includes(k));
  const games = list.length ? list : DEFAULT_GAMES;
  return games[(Math.max(1, cycle) - 1) % games.length];
}

/**
 * Whether day `cycle` is the first Word morning of the game. That alarm rings
 * longer (phases.js `alarm_intro`) and DEEP BLUE plays the Word tutorial in it
 * (os/game/WordTutorial.jsx), so the room learns the game just before playing
 * it (user's call, 2026-10-03). With "Run every day" it is never true.
 */
export function introDay(config, cycle) {
  if (!cycle || gameOfDay(config, cycle) !== 'word') return false;
  for (let c = 1; c < cycle; c++) if (gameOfDay(config, c) === 'word') return false;
  return true;
}

/**
 * Where the day's game is right now: `{ step, startsAt, endsAt, index }`.
 * Before the reveal it is 'wait'; after the last step, 'done'. Steps keep
 * their lengths unless the phase is shorter than they need (the Quick test
 * pace), in which case they shrink together. The last step never runs past
 * the phase, so a host ending it early ends it on every phone.
 *
 * @param game  the game doc: revealAt, phaseEndsAt, phaseStartedAt
 * @param span  the phase's configured length in ms (durations['game_' + kind])
 * @param grace ms the phase keeps after the last step, for the last write
 */
export function stepAt(kind, game, now, { span, grace = 0 } = {}) {
  const steps = STEPS[kind];
  if (!steps) return { step: 'play', startsAt: 0, endsAt: game?.phaseEndsAt ?? 0, index: 0 };
  const start = game?.revealAt || game?.phaseStartedAt || 0;
  const total = steps.reduce((n, [, s]) => n + s * 1000, 0);
  const usable = span ? span - grace : total;
  const scale = Math.min(1, Math.max(0.1, usable / total));
  const hardEnd = game?.phaseEndsAt ? game.phaseEndsAt - grace : Infinity;
  if (now < start) return { step: 'wait', startsAt: 0, endsAt: start, index: -1 };
  let t = start;
  for (let i = 0; i < steps.length; i++) {
    const [name, s] = steps[i];
    const end = Math.min(t + s * 1000 * scale, hardEnd);
    if (now < end) return { step: name, startsAt: t, endsAt: end, index: i };
    t = end;
  }
  return { step: 'done', startsAt: t, endsAt: t, index: steps.length };
}

// --- Words -----------------------------------------------------------------------

/** Lowercase letters and digits only: "Feni!" and " feni" are the same answer. */
export const normalize = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

/** A draw word may carry alternatives: "scooter/moped". The first is the one shown. */
export const wordForms = (entry) => String(entry ?? '').split('/').map((w) => w.trim()).filter(Boolean);
export const shownWord = (entry) => wordForms(entry)[0] ?? '';

/** Does `guess` name `entry`? Any listed form, singular or plural. */
export function matchesWord(guess, entry) {
  const g = normalize(guess);
  if (!g) return false;
  return wordForms(entry).some((w) => {
    const n = normalize(w);
    return n && (g === n || g === `${n}s` || `${g}s` === n || g === `${n}es`);
  });
}

/**
 * The short fingerprints a drawing carries so a guesser's phone can say
 * "Correct!" at once without being told the word. The host re-checks the
 * typed text against the real word (scoreDrawDay); this is only for the moment.
 */
export const checksOf = (entry, salt) => wordForms(entry).map((w) => hashString(`${normalize(w)}|${salt}`).toString(36).slice(0, 8));

export function guessHits(guess, checks, salt) {
  const g = normalize(guess);
  if (!g || !checks?.length) return false;
  const tries = [g, g.endsWith('s') ? g.slice(0, -1) : null, g.endsWith('es') ? g.slice(0, -2) : null, `${g}s`].filter(Boolean);
  return tries.some((t) => checks.includes(hashString(`${t}|${salt}`).toString(36).slice(0, 8)));
}

/** Today's word pair for the word game, never one this game has used. */
export function pickWord(seed, cycle, pairs, usedIds = []) {
  const fresh = pairs.filter((p) => !usedIds.includes(p.id));
  return pick(fresh.length ? fresh : pairs, makeRng(seed, cycle, 'word'));
}

/** A different draw word for each guest, avoiding words already drawn this game. */
export function dealDrawWords(seed, cycle, pids, bank, usedWords = []) {
  const fresh = bank.filter((w) => !usedWords.includes(w));
  const pool = shuffle(fresh.length >= pids.length ? fresh : bank, makeRng(seed, cycle, 'draw'));
  return Object.fromEntries([...pids].sort().map((pid, i) => [pid, pool[i % pool.length]]));
}

/**
 * Which drawings `me` guesses: the next `k` on a shuffled wheel of drawers,
 * so every drawing gets about the same number of guessers. A guest who
 * didn't draw (a ghost, a late joiner) joins the wheel at a fixed point.
 * Public inputs only, so every phone agrees.
 */
export function assignDrawings(drawers, me, seedStr, k = DRAW_ASSIGN) {
  const order = shuffle([...drawers].sort(), makeRng(seedStr, 'wheel'));
  const n = order.length;
  if (!n) return [];
  const at = order.indexOf(me);
  const start = at >= 0 ? at + 1 : hashString(`${seedStr}|${me}`) % n;
  const out = [];
  for (let i = 0; i < n && out.length < k; i++) {
    const pid = order[(start + i) % n];
    if (pid !== me) out.push(pid);
  }
  return out;
}

// --- Scoring ---------------------------------------------------------------------

/** Does a clue give the word away? Then it scores nothing and can't be picked. */
export const spoils = (clue, word) => {
  const c = normalize(clue);
  const w = normalize(word);
  return !c || (w && (c.includes(w) || (c.length >= 4 && w.includes(c))));
};

/**
 * The word game's board. 100 for posting a fair clue, 50 for every guest who
 * picked it as one of their best three. Picks of your own clue, of a spoiled
 * clue, or past the third, are ignored.
 *
 * @param clues  { pid: { clue } }
 * @param picks  { pid: { picks: [pid] } }
 */
export function scoreWordDay({ clues = {}, picks = {}, word = '' }) {
  const fair = new Set(Object.keys(clues).filter((pid) => !spoils(clues[pid]?.clue, word)));
  const got = {};
  for (const [picker, doc] of Object.entries(picks)) {
    const chosen = [...new Set((doc?.picks ?? []).filter((p) => p !== picker && fair.has(p)))].slice(0, WORD_PICKS);
    for (const p of chosen) got[p] = (got[p] ?? 0) + 1;
  }
  return Object.fromEntries(Object.keys(clues).map((pid) => [pid, { best: fair.has(pid) ? Math.min(CAP, 100 + 50 * (got[pid] ?? 0)) : 0 }]));
}

/**
 * The drawing game's board. A guesser earns 50 plus up to 50 for speed for
 * each drawing they named; a drawer earns 30 every time theirs is named. The
 * host checks the typed text against the real word, so a phone's "Correct!"
 * is never the final say. Only the first DRAW_ASSIGN right answers count.
 *
 * @param drawings { pid: { strokes } }  only drawings with ink count
 * @param guesses  { pid: { answers: { drawerPid: { text, ms } } } }
 * @param words    { pid: word }          what each drawer was given
 */
export function scoreDrawDay({ drawings = {}, guesses = {}, words = {} }) {
  const inked = new Set(Object.keys(drawings).filter((pid) => (drawings[pid]?.strokes ?? '').length > 4));
  const score = {};
  const add = (pid, n) => { score[pid] = (score[pid] ?? 0) + n; };
  for (const pid of inked) add(pid, 0);
  for (const [guesser, doc] of Object.entries(guesses)) {
    add(guesser, 0);
    const right = Object.entries(doc?.answers ?? {})
      .filter(([drawer, a]) => drawer !== guesser && inked.has(drawer) && matchesWord(a?.text, words[drawer]))
      .sort(([, a], [, b]) => (a.ms ?? DRAW_SHOW_MS) - (b.ms ?? DRAW_SHOW_MS))
      .slice(0, DRAW_ASSIGN);
    for (const [drawer, a] of right) {
      const raw = Number(a.ms);
      const ms = Math.max(0, Math.min(DRAW_SHOW_MS, Number.isFinite(raw) ? raw : DRAW_SHOW_MS));
      add(guesser, 50 + Math.round(50 * (1 - ms / DRAW_SHOW_MS)));
      add(drawer, 30);
    }
  }
  return Object.fromEntries(Object.entries(score).map(([pid, n]) => [pid, { best: Math.min(CAP, n) }]));
}
