/**
 * The day's game. Every morning the whole room plays one of three, in turn.
 * Each is a social-deduction game: the Faithful know something the Killers
 * don't, and what everyone made goes up for the room to read.
 *
 *   word   Faithful see a secret word, Killers only its category. Everyone
 *          posts one word that fits; the clues stream onto a public wall in
 *          the order they land, so a Killer can wait and read, but waiting
 *          shows. Then everyone picks the three clues that fit best.
 *   fake   Fake Artist. The same word and hint, but everyone draws it. The
 *          drawings go up together when the pens go down, for the room to
 *          argue over. No stars (the user's call, 2026-10-16: they confused
 *          people); the clue photos are a draw among everyone who drew.
 *   pack   Pack the Bag. Faithful are told where the room is going, Killers
 *          only the hint (data/packItems.js). Everyone packs three of the
 *          same twelve things. The bags stay shut until the game ends, then
 *          open for everyone at once.
 *
 * Sketch ('draw') and the DEEP BLUE run ('run', os/game/physics.js) had no
 * hidden side, so the user retired them on 2026-10-16 and asked for Fake
 * Artist and Pack the Bag the same day. Their code is still here, but KINDS
 * no longer offers them, so an older game's `config.games` that lists any
 * of them falls back to the default rotation.
 *
 * Whatever the game, it ends in one score per guest, `{ pid: { best } }`,
 * which is exactly what topOfDay (morning.js) reads. So the top-three photos
 * work the same whatever the game. The game kills nobody.
 *
 * Pure and seeded like the rest of the engine. Two things are public on
 * purpose: which game it is (game.minigame) and the step clock, which every
 * phone derives from the shared revealAt so they all flip together. The
 * words themselves only ever travel through each guest's own inbox.
 */

import { hashString, makeRng, pick, shuffle } from './rng.js';

export const KINDS = ['word', 'fake', 'pack'];
export const DEFAULT_GAMES = Object.freeze(['word', 'fake', 'pack']);

/**
 * Whether the morning's game has anything to show right now: live play, or
 * its just-finished recap (`game.dayGame`, same cycle and kind). Word and
 * Sketch also open during the alarm, because the guest's card is already in
 * their inbox (and on the first Word or Sketch morning the tutorial plays there). The
 * run opens only with the game itself. Everywhere else DEEP BLUE has nothing
 * open, so GameApp locks the screen and the dock icon goes transparent and
 * inert (PhoneOS.jsx), rather than offering a practice round that gives the
 * game away (user's call, 2026-10-02).
 */
export function deepBlueOpen(game) {
  const kind = game.minigame ?? 'word';
  if (kind === 'run') return ['game', 'game_locked'].includes(game.phase);
  const today = ['alarm', 'game', 'game_locked'].includes(game.phase);
  const shown = game.dayGame?.cycle === game.cycle && game.dayGame.kind === kind;
  return today || shown;
}

/** Seconds per step, in order. The phase is a little longer (phases.js). */
export const STEPS = Object.freeze({
  word: [['read', 10], ['clue', 60], ['pick', 50]],
  draw: [['draw', 45], ['guess', 90]],
  fake: [['read', 8], ['draw', 45]],
  pack: [['read', 8], ['pack', 40]],
});

export const WORD_PICKS = 3;
export const PACK_ITEMS = 3;
export const PACK_GRID = 12;
export const CLUE_MAX = 20;
export const DRAW_ASSIGN = 6;
export const DRAW_SHOW_MS = 15_000;
export const STROKES_MAX = 30_000;

const CAP = 999;

/** Which game day `cycle` plays. `config.games` is the host's rotation. */
export function gameOfDay(config, cycle) {
  const asked = config?.games ?? DEFAULT_GAMES;
  const list = asked.filter((k) => KINDS.includes(k));
  // A rotation that names a retired game (Sketch, the run) predates 2026-10-16: it gets today's three.
  const games = list.length && list.length === asked.length ? list : DEFAULT_GAMES;
  return games[(Math.max(1, cycle) - 1) % games.length];
}

/** The games DEEP BLUE teaches with a tutorial the first morning they are played. */
export const TAUGHT = Object.freeze(['word']);

/**
 * Whether day `cycle` is the first morning of a taught game (Word or Sketch).
 * That alarm rings longer (phases.js `alarm_intro`) and DEEP BLUE plays the
 * game's tutorial in it (os/game/WordTutorial.jsx, SketchTutorial.jsx), so the
 * room learns the game just before playing it (user's calls, 2026-10-03). The
 * run is never taught; with "Run every day" it is never true.
 */
export function introDay(config, cycle) {
  if (!cycle) return false;
  const kind = gameOfDay(config, cycle);
  if (!TAUGHT.includes(kind)) return false;
  for (let c = 1; c < cycle; c++) if (gameOfDay(config, c) === kind) return false;
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

/** Today's trip for Pack the Bag, never one this game has used. */
export function pickPlace(seed, cycle, places, usedIds = []) {
  const fresh = places.filter((p) => !usedIds.includes(p.id));
  return pick(fresh.length ? fresh : places, makeRng(seed, cycle, 'place'));
}

/**
 * The twelve things on today's table, the same for every guest: the trip's
 * own five, four from the other trip that shares its hint (so the hint alone
 * leaves a Killer two trips to choose between), and three from anywhere else.
 */
export function dealPack(seed, cycle, place, places) {
  const rng = makeRng(seed, cycle, 'pack');
  const twin = places.find((p) => p.id !== place.id && p.hint === place.hint);
  const twinItems = twin ? shuffle(twin.items, rng).slice(0, 4) : [];
  const rest = shuffle(places.filter((p) => p !== place && p !== twin).flatMap((p) => p.items), rng);
  const items = [...place.items, ...twinItems, ...rest].slice(0, PACK_GRID);
  return shuffle(items, rng);
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
 * Fake Artist's board. Nobody rates a drawing, so every guest who drew
 * scores 100 plus a seeded 0..99: the top three are a fair draw among
 * everyone who drew, different each day (a flat 100 would hand the photos to
 * the same three every time, since topOfDay breaks ties by pid). A blank
 * page scores 0.
 *
 * @param drawings { pid: { strokes } }
 */
export function scoreFakeDay({ drawings = {}, seed = '', cycle = 0 }) {
  return Object.fromEntries(Object.keys(drawings).sort().map((pid) => {
    const inked = (drawings[pid]?.strokes ?? '').length > 4;
    return [pid, { best: inked ? 100 + Math.floor(makeRng(seed, cycle, 'fake', pid)() * 100) : 0 }];
  }));
}

/**
 * Pack the Bag's board: 100 for a packed bag, plus 100 for each thing in it
 * that belongs on the trip. Only things from today's table count, three at most.
 *
 * @param bags  { pid: { items: [id] } }
 * @param fits  the trip's own item ids
 * @param table today's twelve
 */
export function scorePackDay({ bags = {}, fits = [], table = [] }) {
  return Object.fromEntries(Object.entries(bags).map(([pid, doc]) => {
    const items = [...new Set((doc?.items ?? []).filter((id) => table.includes(id)))].slice(0, PACK_ITEMS);
    return [pid, { best: items.length ? 100 + 100 * items.filter((id) => fits.includes(id)).length : 0 }];
  }));
}

/**
 * What one right guess scores after `ms` on screen: 50, plus up to 50 for
 * speed. The phone shows it live (os/game/sketchParts.jsx); scoreDrawDay below
 * is the same sum, and the one the board uses.
 */
export const guessPoints = (ms) => {
  const t = Math.max(0, Math.min(DRAW_SHOW_MS, Number.isFinite(ms) ? ms : DRAW_SHOW_MS));
  return 50 + Math.round(50 * (1 - t / DRAW_SHOW_MS));
};

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
