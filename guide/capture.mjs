import { assertEmulator, hostLogin, makeBot, launch, Phone, resetShots, beat, saveManifest, manifest, sleep } from './lib.mjs';
import { arrive, readSelf, act, vote, play, playDay, answerRecruit, lastWords } from '../src/firebase/bots.js';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { onboard, slide, view, tutorial } from './flows.mjs';
import { STEPS } from '../src/lib/engine/minigames.js';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const UNTIL = args.until ?? 'end';
const NBOTS = Number(args.bots ?? 20);

await assertEmulator();
resetShots();
const { host, db } = await hostLogin();
const gid = await host.createGame({
  cycles: 3,
  autopilot: false,
  // Shorter game windows keep a screenshot run short; the steps inside scale with them.
  durations: { game_word: 70_000, game_draw: 80_000, game: 45_000 },
});
manifest.game = gid;
console.log('game', gid);

const G = (...p) => doc(db, 'games', gid, ...p);
const gameDoc = async () => (await getDoc(G())).data();
const players = async () => Object.fromEntries((await getDocs(collection(db, 'games', gid, 'players'))).docs.map((d) => [d.id, d.data()]));

const bots = await Promise.all(Array.from({ length: NBOTS }, (_, i) => makeBot(i)));
await Promise.all(bots.map((b) => arrive(b, gid)));
const browser = await launch();
let phones = [];
const seenDead = new Set();

/** Run `fn` on every phone at once; one phone failing never stops the others. */
const all = (list, fn) => Promise.all(list.map((p) => fn(p).catch((e) => console.log(`  [${p.key}] ${String(e.message).split('\n')[0]}`))));

function stop(name) {
  if (UNTIL !== name) return;
  saveManifest();
  console.log(`\nstopped after "${name}": ${manifest.shots.length} shots`);
  process.exit(0);
}

// --- Arrival: a brand-new guest, through the real UI ------------------------------------------------

beat('arrival', 'Arrival', 'The first time a phone opens the game it sets itself up. Nothing here is a role yet, which is the point: nobody knows whether they will want to lie, so they answer straight.');
const ava = await new Phone(browser, { key: 'ava', name: 'Ava', who: 'Ava (new guest)' }).open();
try {
  await onboard(ava, { name: 'Ava' });
} catch (e) {
  console.log('onboarding failed:', String(e.message).split('\n')[0]);
  console.log((await ava.text()).slice(0, 300));
  await ava.snap('failure', { app: 'debug' });
  throw e;
}
await ava.snap('Phone ready. The lock screen counts who has arrived and tells the premise in three lines.', { app: 'Lock screen' });
await slide(ava.page, 'slide to unlock');
await ava.snap('The home screen before the deal. Most apps are quiet; DEEP BLUE is greyed out until the morning.', { app: 'Home' });
await ava.openApp('Contacts');
await ava.snap('Contacts: every guest, with a photo drawn from their answers. These answers are public.', { app: 'Contacts' });
await ava.close();
{
  const ps = await players();
  const id = Object.keys(ps).find((k) => ps[k].name === 'Ava');
  if (id) await host.removePlayer(gid, id, 'lobby'); // Ava was only a walkthrough: leaving before the deal is allowed
}
stop('arrival');

// --- The deal -------------------------------------------------------------------------------------------

const ROLE_LABEL = { killer: 'Killer', doctor: 'Doctor', detective: 'Detective', faithful: 'Faithful' };

/** A real phone, signed in as one of the bots' guests: "Already playing?" and the host's relink. */
async function joinPhone(bot, key, label) {
  const ph = new Phone(browser, { key, name: bot.name, who: `${bot.name} (${label})`, role: label, pid: bot.pid });
  ph.bot = bot;
  await ph.open();
  const { page } = ph;
  await page.getByText('Already playing?').waitFor({ timeout: 20000 });
  await page.getByText('Already playing?').click();
  await page.locator('input.os-input').fill(bot.name);
  await page.getByRole('button', { name: 'Ask the host' }).click();
  for (let t = 0; t < 60; t += 1) {
    const knocks = (await getDocs(collection(db, 'games', gid, 'knocks'))).docs;
    const mine = knocks.find((k) => k.data().name === bot.name);
    if (mine) {
      await host.relink(gid, mine.id, bot.pid);
      // relink keeps one binding per guest; the bot needs its own back to play for the guest the phone now shows (emulator scaffolding, written as host).
      await setDoc(doc(db, 'games', gid, 'bindings', bot.uid), { pid: bot.pid });
      break;
    }
    await sleep(500);
  }
  await page.locator('button[aria-label^="Home"]').waitFor({ timeout: 25000 });
  return ph;
}

beat('casting', 'The deal', 'The host presses Deal. Every phone gets a text from DEEP BLUE with a sealed role.');
await host.advance(gid); // lobby -> casting
await Promise.all(bots.map((b) => readSelf(b, gid)));
const roleOf = (b) => b.role ?? 'faithful';
const byRole = (r) => bots.filter((b) => roleOf(b) === r);
console.log('dealt', Object.fromEntries(['killer', 'doctor', 'detective', 'faithful'].map((r) => [r, byRole(r).length])));
const picks = [
  ...byRole('killer').slice(0, 3).map((b, i) => [b, `killer${i + 1}`]),
  ...byRole('doctor').slice(0, 1).map((b) => [b, 'doctor']),
  ...byRole('detective').slice(0, 1).map((b) => [b, 'detective']),
  ...byRole('faithful').slice(0, 3).map((b, i) => [b, `faithful${i + 1}`]),
];
phones = await Promise.all(picks.map(([b, key]) => joinPhone(b, key, ROLE_LABEL[roleOf(b)])));
console.log('phones', phones.map((p) => `${p.key}=${p.name}`).join(' '));
for (const p of phones) manifest.cast[p.key] = { name: p.name, role: p.role };

await all(phones, (p) => p.snap('DEEP BLUE texts every guest. The role is sealed: every sealed message looks the same on every phone.', { app: 'Role text' }));
await all(phones, async (p) => {
  await p.page.locator('.os-role-msg').click();
  await p.snap(`Tapped open. The role reads ${p.role}; the same colours, font and size for every role, so a glance at a neighbour shows nothing.`, { app: 'Role text' });
  await p.page.getByRole('button', { name: /Got it/ }).click();
  await sleep(900);
});
await all(phones, (p) => p.snap('Home. The NowCard at the top says what is happening and reads the same on every phone.', { app: 'Home' }));
await all(phones, async (p) => {
  await view(p, 'Messages', p.role === 'Killer'
    ? 'Messages. A group has appeared, titled with the other Killers\' names. Nobody said these are partners: a Killer works it out.'
    : 'Messages. Only the room and DEEP BLUE. Nothing here names a role.');
});
await all(phones.filter((p) => p.role === 'Killer'), async (p) => {
  await p.page.getByText(/^\w+ & \w+$/).first().click({ timeout: 3000 });
  await p.snap('The Killers\' group. DEEP BLUE added you. This is their only channel all game.', { app: 'Messages' });
});
await all(phones, (p) => p.home());
stop('casting');

// --- The days ------------------------------------------------------------------------------------------

/** What each phone does on a night, through its own screen. Fills `p.acted` when the move really landed. */
async function nightByPhone(p, g) {
  const { page } = p;
  await p.home();
  await p.openApp('Night');
  await sleep(700);
  if (await page.locator('.os-wt__stage').first().isVisible().catch(() => false)) {
    const full = p.key === 'faithful1';
    const n = await tutorial(p, 'The Night tutorial plays the first time a guest opens Night: the same on every phone, so it gives no role away', { limit: full ? 14 : 1, app: 'Night tutorial' });
    console.log(`  [${p.key}] night tutorial ${n} slides`);
  }
  await p.snap(p.ghost ? 'Night for a ghost: two moves, both about helping the living.'
    : p.role === 'Killer'
    ? 'Night for a Killer: the poll DEEP BLUE posted in the Killers\' group.'
    : p.role === 'Doctor' ? 'Night for the Doctor: one move, a firewall on one guest.'
    : p.role === 'Detective' ? 'Night for the Detective: trace two guests\' phones against tonight\'s hacking.'
    : 'Night for the Faithful: pick one move to hunt the Killer who strikes tonight.', { app: 'Night' });
  await uiNightMove(p);
}

/**
 * The real Night screens: open a move, pick guests, Confirm. Returns true if the move was sent from
 * the phone itself (the caller covers the rest with a bot). Each step is photographed.
 */
async function uiNightMove(p) {
  const { page } = p;
  const cells = page.locator('button.os-cell');
  const isKiller = p.role === 'Killer';
  const moves = page.locator('button.os-nt-move');
  if (p.ghost) {
    // A ghost passes a true photo or whispers a word; a bot sends it so the night can resolve.
    if (await moves.first().isVisible().catch(() => false)) {
      await p.snap('A ghost\'s moves: pass one of their own true clue photos to a living guest, or whisper a word.', { app: 'Night' });
      await moves.last().click();
      await sleep(700);
      await p.snap('The whisper opened: a word from a short list, then a living guest.', { app: 'Night' });
    }
    return;
  }
  if (await moves.first().isVisible().catch(() => false)) {
    await p.snap('The list of moves. Each says what it is for and what dawn brings.', { app: 'Night' });
    await moves.first().click();
    await sleep(700);
  }
  await cells.first().waitFor({ timeout: 5000 });
  if (!isKiller) await p.snap('A move opened: tonight, at dawn, and the guests to choose from.', { app: 'Night' });
  const want = p.role === 'Detective' ? [2, 4] : [isKiller ? 3 : 2];
  for (const k of want) await cells.nth(k).click();
  if (!isKiller) await p.snap('Picked. The bar along the bottom shows who, and a Confirm button. Nothing is sent yet.', { app: 'Night' });
  if (isKiller) {
    // The Killers' poll saves on the tap itself.
    await p.snap('One tap votes. The partners see it at once, and the leading name shows at the bottom.', { app: 'Night' });
    p.acted = true;
    return;
  }
  const go = page.locator('button.os-nt-go');
  await go.click({ timeout: 4000 });
  await sleep(900);
  await p.snap('Sealed. The move is locked in until dawn, with a way to change it.', { app: 'Night' });
  p.acted = true;
}

beat('night1', 'Night 1', 'The Killers vote on who goes tonight; the Faithful, Doctor and Detective each pick a move. Nobody else sees any of it.');
await host.advance(gid); // casting -> night
await sleep(900);
await all(phones, (p) => p.snap('A chapter card marks the turn of the day.', { app: 'Chapter card', wait: 0 }));
await sleep(4200);
await all(phones, (p) => p.snap('Home at night. A badge and the NowCard point at Night; nothing opens by itself.', { app: 'Home' }));
await all(phones, (p) => nightByPhone(p));

/** Every guest without a move yet gets one from a bot, so the night can resolve. */
async function botsFinishNight() {
  const g = await gameDoc();
  await Promise.all(bots.map(async (b) => {
    if (phones.find((p) => p.pid === b.pid)?.acted) return;
    await act(b, gid, g).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`));
  }));
  for (const p of phones) p.acted = false;
}
await botsFinishNight();
await sleep(1200);
await all(phones.filter((p) => p.role === 'Killer'), async (p) => {
  await view(p, 'Messages', 'The Killers\' group, after the vote: the poll shows each partner\'s pick.');
  await p.page.getByText(/^\w+ & \w+$/).first().click({ timeout: 3000 });
  await p.snap('Inside the group: the night\'s poll with every partner\'s vote beside the guest.', { app: 'Messages' });
});
await all(phones, (p) => p.home());
stop('night1');

// --- Alarm and the first morning game ----------------------------------------------------------------

beat('alarm1', 'Day 1 · the alarm', 'Every phone rings for a few seconds and shows a notification: today\'s game, the game-clock time to play by, and what skipping costs. Nothing takes over the screen.');
await host.advance(gid); // night -> alarm
await sleep(1200);
await all(phones, (p) => p.snap('The morning alarm is a banner, not a takeover. It names the game and says playing is optional, at a cost.', { app: 'Alarm', wait: 0 }));
await sleep(5000);
await all(phones, (p) => p.snap('Home after the alarm. DEEP BLUE has a badge; the NowCard says what is new today.', { app: 'Home' }));
await all(phones, async (p) => {
  await p.page.locator('button[aria-label^="Home"]').click().catch(() => {});
  await sleep(300);
  await p.openApp('DEEP BLUE');
  await sleep(1200);
  if (await p.page.locator('.os-wt__stage').first().isVisible().catch(() => false)) {
    const n = await tutorial(p, 'The first Word morning teaches the game: six short hand-drawn clips, then a practice round', { limit: p.key === 'faithful1' ? 14 : 1, app: 'Word tutorial' });
    console.log(`  [${p.key}] word tutorial ${n} slides`);
  }
  await p.snap('Today\'s game, waiting for the morning to open.', { app: 'DEEP BLUE' });
});
stop('alarm1');

// --- The morning games ------------------------------------------------------------------------------------

const waitUntil = async (ms) => { const d = ms - Date.now(); if (d > 0) await sleep(d); };

/** The [start, end] of a step of today's game, on the same clock every phone uses. */
function stepWindow(g, kind, name) {
  const span = g.config.durations[`game_${kind}`];
  const steps = STEPS[kind];
  const total = steps.reduce((n, [, s]) => n + s * 1000, 0);
  const scale = Math.min(1, Math.max(0.1, (span - 2000) / total));
  let t = g.revealAt;
  for (const [n, s] of steps) {
    const end = t + s * 1000 * scale;
    if (n === name) return [t, end];
    t = end;
  }
  return [t, t];
}

/** Open DEEP BLUE on every phone (the game never opens by itself). */
const openGame = (list) => all(list, async (p) => { await p.home(); await p.openApp('DEEP BLUE'); });

beat('word1', 'Day 1 · Word', 'The morning game. The Faithful see a secret word, the Killers see only its category. Everyone posts one word that fits, then picks the three clues they like best.');
await host.advance(gid); // alarm -> game
{
  let g = await gameDoc();
  await openGame(phones);
  const [readA, readB] = stepWindow(g, 'word', 'read');
  const [clueA, clueB] = stepWindow(g, 'word', 'clue');
  const [pickA, pickB] = stepWindow(g, 'word', 'pick');
  await waitUntil(readA + 1200);
  await all(phones, (p) => p.snap('Read: the card is dealt. The Faithful see the word; a Killer sees only its category (a "hint").', { app: 'Word' }));
  await waitUntil(clueA + 1500);
  await all(phones, (p) => p.snap('Clue: one word that fits, with live checks for "one word" and "no names". The wall is still empty.', { app: 'Word' }));
  // One Faithful phone posts a clue itself, through the real screen; the bots post for everyone else.
  const poster = phones.find((p) => p.key === 'faithful1');
  try {
    await poster.page.getByPlaceholder('one word').fill('tropical');
    await poster.snap('Typing a clue. The two checks tick as it becomes legal.', { app: 'Word' });
    await poster.page.getByRole('button', { name: /Stick it on the wall/ }).click();
    poster.acted = true;
  } catch (e) { console.log('  clue by hand failed:', String(e.message).split('\n')[0]); }
  g = await gameDoc();
  await Promise.all(bots.map((b) => {
    if (poster?.acted && b.pid === poster.pid) return null;
    return playDay(b, gid, g, 0).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`));
  }));
  await sleep(1500);
  await all(phones, (p) => p.snap('Clues land on a public, numbered wall in the order they arrive. A Killer can wait and read first, but everyone sees who waited.', { app: 'Word' }));
  await waitUntil(pickA + 1500);
  await all(phones, (p) => p.snap('Pick: three gold stars go on the three clues that fit best. A clue that gives the word away scores 0.', { app: 'Word' }));
  await Promise.all(bots.map((b) => playDay(b, gid, g, 1).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`))));
  await sleep(1200);
  await all(phones, (p) => p.snap('Stars placed. Scores are 100 for a fair clue plus 50 per pick.', { app: 'Word' }));
  for (const p of phones) p.acted = false;
}
stop('word1');

// --- Dawn: the board -----------------------------------------------------------------------------------

/** True only while this phone's own death takeover is up; words like "logged out" also appear in the verdict story. */
async function snapTakeover(p, note) {
  const up = (await p.page.getByRole('button', { name: 'Enter the spirit world' }).isVisible().catch(() => false))
    || (await p.page.getByText('SIGNAL LOST', { exact: true }).isVisible().catch(() => false));
  if (!up) return false;
  await p.snap(note, { app: 'Taken' });
  return true;
}

async function dawn(n, nowKind) {
  beat(`dawn${n}`, `Day ${n} · the board`, 'The game locks and the leaderboard is revealed on every phone at the same instant. Last place glitches to TAKEN.');
  await host.advance(gid); // game -> game_locked -> dawn
  const g = await gameDoc();
  await all(phones, async (p) => { await p.home(); await p.openApp('News'); });
  await all(phones, (p) => p.snap('The board is posting. Every phone holds on the same beat so a table gasps together.', { app: 'News' }));
  await waitUntil(g.revealAt + 700);
  await all(phones, (p) => p.snap('The podium. The top three each earn a clue photo.', { app: 'News' }));
  await waitUntil(g.revealAt + 3600);
  await all(phones, (p) => p.snap('Last place. Everyone can see a score that looks too low for the guest.', { app: 'News' }));
  await waitUntil(g.revealAt + 5900);
  await all(phones, (p) => p.snap('The glitch: the lowest score is TAKEN by the deep.', { app: 'News' }));
  await waitUntil(g.revealAt + 8400);
  await all(phones, (p) => p.snap('The full board, and what the morning paper prints about it.', { app: 'News' }));
  await sleep(1500);
  await all(phones, async (p) => {
    if (await snapTakeover(p, 'Taken: this guest was the one the deep took. Their phone goes to static and the signal is lost.')) await ghostTour(p);
  });
  await markGhosts();
  await logDeaths('the board');
  return g;
}

await dawn(1);
stop('dawn1');

// --- Helpers for everything after the first board -------------------------------------------------------

async function markGhosts() {
  const ps = await players();
  for (const p of phones) p.ghost = ps[p.pid]?.status === 'ghost';
  // A takeover left up would block every tap after it, so a ghost that missed its tour gets it now.
  await all(phones.filter((p) => p.ghost && !p.toured), (p) => ghostTour(p));
}

/** Record who died this beat, with the role the host knows, for the guide's "who fell when" strip. */
async function logDeaths(when) {
  const ps = await players();
  const roles = Object.fromEntries((await getDocs(collection(db, 'games', gid, 'roles'))).docs.map((d) => [d.id, d.data().role]));
  for (const [pid, d] of Object.entries(ps)) {
    if (d.status !== 'ghost' || seenDead.has(pid)) continue;
    seenDead.add(pid);
    const how = d.cause === 'banished' ? 'was voted out' : d.cause === 'deep' ? 'was taken as the lowest honest score' : 'was taken by the deep';
    manifest.events.push({ beat: manifest.sections.at(-1)?.id, who: d.name, role: ROLE_LABEL[roles[pid]] ?? 'Faithful', cause: d.cause, text: `${d.name} (${ROLE_LABEL[roles[pid]] ?? 'Faithful'}) ${how} at ${when}.` });
  }
  saveManifest();
}

/** The tour a guest gets right after their phone finds out they are dead. */
async function ghostTour(p) {
  if (p.toured) return;
  const enter = p.page.getByRole('button', { name: 'Enter the spirit world' });
  await enter.waitFor({ timeout: 9000 });
  await p.snap('Then the card: "Your phone is haunted now." From here the guest plays as a ghost.', { app: 'Taken' });
  await enter.click();
  await sleep(900);
  const n = await tutorial(p, 'The ghost tutorial plays once, right after death: what a ghost can still do.', { limit: 6, app: 'Ghost tutorial' });
  console.log(`  [${p.key}] ghost tutorial ${n} slides`);
  p.toured = true;
  await sleep(600);
}

/** The NowCard is how the phone points at a vote; there is no home icon for it. */
async function openFromNow(p) {
  await p.home();
  await p.page.locator('button.os-now--tap').click({ timeout: 4000 });
  await sleep(900);
}

const scrollPage = (p, y) => p.page.evaluate((dy) => {
  const els = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(e).overflowY));
  const el = els.sort((a, b) => b.clientHeight - a.clientHeight)[0];
  el?.scrollBy(0, dy);
  return Boolean(el);
}, y);

// --- The day after the board: investigation, vote, verdict ----------------------------------------------

async function investigation(n, { full = false } = {}) {
  beat(`day${n}`, `Day ${n} · investigation`, 'The room talks. Clues are in the camera roll, and the whole room compares them against what everyone said at arrival.');
  await host.advance(gid); // dawn -> investigation
  await sleep(900);
  await all(phones, (p) => p.snap('Daylight. A chapter card marks the turn of the day.', { app: 'Chapter card', wait: 0 }));
  await sleep(4200);
  const g = await gameDoc();
  await Promise.all(bots.map((b) => lastWords(b, gid, g).catch(() => {})));
  await sleep(800);
  await all(phones, (p) => p.snap('Home in daylight. Badges show where something new is; nothing opened by itself.', { app: 'Home' }));
  await all(phones, (p) => view(p, 'Photos', 'Photos. Everything the phone has been sent, newest first. A clue names a group, never a person.'));
  await all(phones, async (p) => {
    if (p.ghost) {
      await p.page.getByRole('tab', { name: /Room/ }).click({ timeout: 3000 });
      await sleep(600);
      await p.snap('A ghost\'s extra album, The Room: every clue the living got, and who got it.', { app: 'Photos' });
      return;
    }
    const tile = p.page.locator('button[aria-label*=" from day"]').first();
    if (await tile.isVisible().catch(() => false)) {
      await tile.click();
      await sleep(1200);
      await p.snap('A clue opened. It describes the hand that struck, as a group ("a clear spirit", "glasses"), in whatever form it took: still, clip, receipt, screenshot or voice note.', { app: 'Photos' });
    } else {
      await p.snap('No clue in the camera roll yet. Only the top three scorers and the ghosts earn photos.', { app: 'Photos' });
    }
  });
  if (full) {
    const f1 = phones.find((p) => p.key === 'faithful1') ?? phones.find((p) => !p.ghost);
    const other = bots.find((b) => b.pid !== f1.pid && b.pid !== phones[0].pid)?.name;
    await view(f1, 'Contacts', 'Contacts: every guest and their public answers. This is what a clue is compared against.');
    if (other) {
      await f1.page.getByText(other, { exact: true }).first().click({ timeout: 4000 }).catch(() => {});
      await sleep(800);
      await f1.snap('A guest card: the photo is drawn from the six answers. Tap an answer to mark it "doesn\'t match".', { app: 'Contacts' });
    }
    await view(f1, 'Clock', 'Clock: the game clock, today\'s schedule and what comes next.');
    await view(f1, 'Weather', 'Weather: the storm over Panjim builds day by day. Atmosphere only.');
    await view(f1, 'Help', 'Help: the rule book. Pulled, never pushed: nothing opens it.');
    await view(f1, 'Messages', 'Messages: the room, DEEP BLUE\'s own thread, and for a Killer the private group.');
    const room = f1.page.getByText('The Room').first();
    if (await room.isVisible().catch(() => false)) {
      await room.click();
      await sleep(900);
      await f1.snap('The Room: the public chat. A guest the board took can post one last true photo here, framed in black.', { app: 'Messages' });
    }
    for (const key of ['detective', 'doctor']) {
      const p = phones.find((x) => x.key === key);
      if (!p || p.ghost) continue;
      await view(p, 'Messages', key === 'detective'
        ? 'The Detective\'s result from last night: did either traced guest do the hacking?'
        : 'The Doctor\'s thread: DEEP BLUE tells them whether the firewall held.');
      await p.page.getByText('DEEP BLUE').first().click({ timeout: 3000 }).catch(() => {});
      await sleep(900);
      await p.snap('Inside DEEP BLUE\'s thread: the old manifesto, the role text, and a line for each beat of the day.', { app: 'Messages' });
    }
  }
  await all(phones, (p) => p.home());
}

/** One poll on every phone: a real tap from the phones, bots for everyone else. */
async function pollRound({ chapter = true, label = 'vote' } = {}) {
  let g = await gameDoc();
  if (chapter) {
    await sleep(900);
    await all(phones, (p) => p.snap(g.phase === 'endgame' ? 'A chapter card: the final votes. Ghosts vote too.' : 'A chapter card: the vote.', { app: 'Chapter card', wait: 0 }));
    await sleep(4200);
  }
  await all(phones, (p) => p.snap('Home. A banner said "DEEP BLUE created a poll"; the NowCard says the room is voting and opens it.', { app: 'Home' }));
  const choose = { killer1: 1, killer2: 1, killer3: 0, doctor: 2, detective: 3, faithful1: 4, faithful2: 2, faithful3: 4 };
  await all(phones, async (p) => {
    await openFromNow(p);
    await p.snap(p.ghost && g.phase !== 'endgame' ? 'A ghost cannot vote at the Round Table; they watch.' : 'The poll: every living guest, with their face and public answers. One tap votes.', { app: 'Vote' });
    if (p.ghost && g.phase !== 'endgame') return;
    const cells = p.page.locator('button.os-cell');
    const count = await cells.count();
    if (!count) return;
    await cells.nth((choose[p.key] ?? 0) % count).click();
    await sleep(700);
    await p.snap('Voted. The choice is private until the verdict; another tap on someone else changes it.', { app: 'Vote' });
    p.acted = true;
  });
  g = await gameDoc();
  await Promise.all(bots.map((b) => (phones.find((p) => p.pid === b.pid)?.acted ? null : vote(b, gid, g).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`)))));
  for (const p of phones) p.acted = false;
  await all(phones, (p) => p.home());
}

async function roundtable(n) {
  beat(`vote${n}`, `Day ${n} · the Round Table`, 'Everyone votes who to log out. One tap; the choice is private until the verdict.');
  await host.advance(gid); // investigation -> roundtable
  await pollRound();
  await host.advance(gid); // -> banish, or a re-vote on a tie
  const g = await gameDoc();
  if (g.phase === 'revote') {
    beat(`revote${n}`, `Day ${n} · a tie, so a re-vote`, 'A tie goes to one short re-vote between only the tied guests.');
    await sleep(1500);
    await all(phones, (p) => p.snap('The room tied. DEEP BLUE posts a new poll with only the tied guests.', { app: 'Home' }));
    await pollRound({ chapter: false });
    await host.advance(gid);
  }
}

async function verdict(n) {
  beat(`banish${n}`, `Day ${n} · the verdict`, 'The vote lands on every phone at the same instant: the name, then Killer or innocent, then who voted for whom.');
  const g = await gameDoc();
  await all(phones, async (p) => { await p.home(); await p.openApp('News'); });
  await waitUntil(g.revealAt + 300);
  await all(phones, (p) => p.snap('Breaking: the room\'s choice is named.', { app: 'News', wait: 0 }));
  await waitUntil(g.revealAt + 2400);
  await all(phones, (p) => p.snap('The verdict: Killer, or an innocent. The room reacts.', { app: 'News', wait: 0 }));
  await waitUntil(g.revealAt + 3600);
  await all(phones, (p) => p.snap('Who voted for whom. This is where tomorrow\'s suspicion starts.', { app: 'News' }));
  await sleep(2500);
  await all(phones, async (p) => {
    if (await snapTakeover(p, 'Voted out: this phone goes to static too.')) await ghostTour(p);
  });
  await markGhosts();
  await logDeaths('the vote');
  await all(phones, (p) => p.home());
}

// --- A day from the next night on --------------------------------------------------------------------------

async function nightPhase(n) {
  beat(`night${n}`, `Night ${n}`, 'The Killers vote on who goes tonight. Everyone else picks a move. A ghost can pass a clue or whisper.');
  await sleep(900);
  await all(phones, (p) => p.snap('A chapter card marks the turn of the day.', { app: 'Chapter card', wait: 0 }));
  await sleep(4200);
  await all(phones, (p) => nightByPhone(p));
  await botsFinishNight();
  await sleep(1200);
  await all(phones, (p) => p.home());
  await host.advance(gid); // night -> alarm, or recruit
  const g = await gameDoc();
  if (g.phase === 'recruit') {
    beat(`recruit${n}`, `Night ${n} · a Killer is missing`, 'The Killers fell short of three, so DEEP BLUE calls a guest and offers the job. A guest who refuses is murdered.');
    await sleep(1500);
    await all(phones, (p) => p.snap('A call may land on one phone: an offer to join the Killers.', { app: 'Recruit' }));
    await Promise.all(bots.map((b) => answerRecruit(b, gid, g).catch(() => {})));
    await sleep(900);
    await host.advance(gid); // recruit -> alarm
  }
}

async function alarmBeat(n) {
  const g = await gameDoc();
  beat(`alarm${n}`, `Day ${n} · the alarm`, 'Every phone rings for a few seconds. A notification names today\'s game and the time to play it by.');
  await sleep(1200);
  await all(phones, (p) => p.snap('The alarm is a banner. It names the game and what skipping costs.', { app: 'Alarm', wait: 0 }));
  await sleep(5000);
  await all(phones, async (p) => {
    await p.home();
    // The icon is greyed out until the morning game opens on a day with no tutorial; the snap still shows that.
    await p.openApp('DEEP BLUE').catch(() => {});
    await sleep(1200);
    if (await p.page.locator('.os-wt__stage').first().isVisible().catch(() => false)) {
      const full = p.key === 'faithful1';
      const nn = await tutorial(p, `The first ${g.minigame === 'draw' ? 'Sketch' : 'Word'} morning teaches the game with hand-drawn clips and a practice round.`, { limit: full ? 14 : 1, app: 'Tutorial' });
      console.log(`  [${p.key}] tutorial ${nn} slides`);
    }
    await p.snap('Today\'s game, waiting for the morning to open.', { app: 'DEEP BLUE' });
  });
  return g.minigame;
}

async function drawGame(n) {
  beat(`draw${n}`, `Day ${n} · Sketch`, 'Everyone draws their own secret word with a finger, then guesses other people\'s drawings. A right guess scores more the faster it lands.');
  await host.advance(gid); // alarm -> game
  let g = await gameDoc();
  await openGame(phones);
  const [drawA] = stepWindow(g, 'draw', 'draw');
  const [guessA] = stepWindow(g, 'draw', 'guess');
  await waitUntil(drawA + 1500);
  await all(phones, (p) => p.snap(p.ghost ? 'Ghosts do not draw, but they can guess.' : 'Draw: a secret word on a sketchbook page. Killers draw too.', { app: 'Sketch' }));
  const artist = phones.find((p) => p.key === 'faithful1' && !p.ghost) ?? phones.find((p) => !p.ghost);
  try {
    const pad = artist.page.locator('canvas.os-sb-book__pad');
    const bb = await pad.boundingBox({ timeout: 4000 });
    const at = (u, v) => [bb.x + bb.width * u, bb.y + bb.height * v];
    const stroke = async (pts) => {
      await artist.page.mouse.move(...at(...pts[0]));
      await artist.page.mouse.down();
      for (const q of pts.slice(1)) await artist.page.mouse.move(...at(...q), { steps: 4 });
      await artist.page.mouse.up();
    };
    const ring = (cx, cy, rx, ry, n = 20) => Array.from({ length: n + 1 }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)]);
    await stroke(ring(0.5, 0.58, 0.28, 0.2));
    await stroke([[0.78, 0.5], [0.9, 0.38], [0.92, 0.3]]);
    await stroke([[0.22, 0.52], [0.1, 0.48], [0.1, 0.62], [0.24, 0.66]]);
    await stroke([[0.4, 0.36], [0.5, 0.3], [0.6, 0.36]]);
    artist.acted = true;
    await artist.snap('Drawing with a finger. Pen colours and an undo sit under the page.', { app: 'Sketch' });
  } catch (e) { console.log('  drawing by hand failed:', String(e.message).split('\n')[0]); }
  g = await gameDoc();
  await Promise.all(bots.map((b) => (artist?.acted && b.pid === artist.pid ? null : playDay(b, gid, g, 0).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`)))));
  await waitUntil(guessA + 1800);
  await all(phones, (p) => p.snap('Guess: each phone gets about six other guests\' drawings, one at a time, with a speed bar.', { app: 'Sketch' }));
  try {
    const input = artist.page.locator('input.os-sb-guess__input');
    await input.fill('potato');
    await artist.page.getByRole('button', { name: 'Guess', exact: true }).click();
    await sleep(900);
    await artist.snap('A wrong guess is crossed out, and the speed bar keeps falling.', { app: 'Sketch' });
  } catch (e) { console.log('  guess by hand failed:', String(e.message).split('\n')[0]); }
  await Promise.all(bots.map((b) => (artist?.acted && b.pid === artist.pid ? null : playDay(b, gid, g, 1).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`)))));
  await sleep(1200);
  await all(phones, (p) => p.snap('Pens down. The board posts when time is up.', { app: 'Sketch' }));
  for (const p of phones) p.acted = false;
}

async function runGame(n) {
  beat(`run${n}`, `Day ${n} · the Run`, 'One shared course for the whole room. Your best run counts. Ghosts play on their own board.');
  await host.advance(gid); // alarm -> game
  const g = await gameDoc();
  await openGame(phones);
  await waitUntil(g.revealAt + 800);
  await all(phones, (p) => p.snap('The same course on every phone. Tap to swim.', { app: 'Run' }));
  const swimmers = phones.filter((p) => !p.ghost).slice(0, 2);
  await all(swimmers, async (p) => {
    for (let i = 0; i < 10; i += 1) { await p.page.keyboard.press('Space'); await sleep(420); }
    await p.snap('Mid-run: a pixel whale between the pipes. The score counts up.', { app: 'Run' });
    for (let i = 0; i < 6; i += 1) { await sleep(900); await p.page.keyboard.press('Space'); }
    await sleep(2000);
    await p.snap('A run ends the moment you hit something. Retry as often as you like inside the window.', { app: 'Run' });
  });
  await Promise.all(bots.map((b) => play(b, gid, g).catch((e) => console.log(`  bot ${b.name}: ${e.code ?? e.message}`))));
}

async function playDayGame(n, kind) {
  if (kind === 'draw') await drawGame(n);
  else if (kind === 'run') await runGame(n);
  else {
    // A Word day after the first has no tutorial; the screen is the same one captured on day 1.
    beat(`word${n}`, `Day ${n} · Word`, 'The Word game again, without the tutorial.');
    await host.advance(gid);
    const g = await gameDoc();
    await openGame(phones);
    await waitUntil(g.revealAt + 1500);
    await all(phones, (p) => p.snap('Word, second time round.', { app: 'Word' }));
    await Promise.all(bots.map((b) => playDay(b, gid, g, 0).catch(() => {})));
  }
}

// --- Day 1 continues ------------------------------------------------------------------------------------------

await investigation(1, { full: true });
stop('investigation1');
await roundtable(1);
await verdict(1);
stop('day1');

// --- The days that follow, then the endgame -------------------------------------------------------------

let ended = Boolean((await gameDoc()).winner);
for (let guard = 0; !ended && guard < 12; guard += 1) {
  await host.advance(gid); // banish -> night | endgame | finale
  const g = await gameDoc();
  if (g.phase === 'finale') break;
  if (g.phase === 'endgame') {
    beat(`endgame${g.endgameRound}`, `Endgame · final vote ${g.endgameRound}`, 'The survivors and the ghosts all vote. Any Killer still standing afterwards wins it for the Killers.');
    await pollRound();
    await host.advance(gid);
    await verdict(`E${g.endgameRound}`);
    ended = Boolean((await gameDoc()).winner);
    continue;
  }
  const n = g.cycle;
  await nightPhase(n);
  const kind = await alarmBeat(n);
  await playDayGame(n, kind);
  await dawn(n);
  stop(`dawn${n}`);
  if ((await gameDoc()).winner) { ended = true; break; }
  await investigation(n);
  await roundtable(n);
  await verdict(n);
  stop(`day${n}`);
  ended = Boolean((await gameDoc()).winner);
}

// --- The finale ----------------------------------------------------------------------------------------------------

{
  let g = await gameDoc();
  if (g.phase !== 'finale') { await host.advance(gid); g = await gameDoc(); }
  beat('finale', 'The finale', 'Every phone plays the special edition together: who won, the Killers\' faces, then how it happened, night by night, and every guest\'s role.');
  await all(phones, async (p) => { await p.home(); await p.openApp('News'); });
  await waitUntil(g.revealAt + 900);
  await all(phones, (p) => p.snap(`The headline: ${g.winner === 'faithful' ? 'the Faithful won' : 'the Killers won'}.`, { app: 'Finale', wait: 0 }));
  await waitUntil(g.revealAt + 3500);
  await all(phones, (p) => p.snap('The Killers\' faces, and what became of each.', { app: 'Finale', wait: 0 }));
  await waitUntil(g.revealAt + 6000);
  await all(phones, (p) => p.snap('Your night: your role, whether your team won, and how you did.', { app: 'Finale', wait: 0 }));
  await all(phones, async (p) => {
    const steps = p.key === 'faithful1' ? 5 : 2;
    for (let i = 0; i < steps; i += 1) {
      await scrollPage(p, 620);
      await p.snap(i === 0 ? 'How it happened, night by night: who the Killers chose, who hacked, what the photos described.' : 'Further down: the rig, each firewall, each morning and each vote, then every guest\'s secret role.', { app: 'Finale', wait: 500 });
    }
  });
  manifest.winner = g.winner;
  manifest.finishedAt = new Date().toISOString();
  console.log(`\nfinished: winner ${g.winner}`);
}

saveManifest();
console.log(`\ndone: ${manifest.shots.length} shots`);
await browser.close();
process.exit(0);
