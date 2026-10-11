/**
 * Builds the guide from shots/manifest.json.
 *   node build.mjs            -> index.html (images linked from shots/)
 *   node build.mjs --inline   -> astral-guide.html (every image embedded, one file to send)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INLINE = process.argv.includes('--inline');
const m = JSON.parse(fs.readFileSync(path.join(HERE, 'shots', 'manifest.json'), 'utf8'));

// An early capture matched "logged out" on the verdict story and tagged living phones as Taken.
// A real death screen is always followed by the ghost tutorial in the same beat; the rest are verdict shots.
for (const s of m.shots) {
  if (s.app !== 'Taken') continue;
  const real = m.shots.some((x) => x.beat === s.beat && x.phone === s.phone && x.app === 'Ghost tutorial');
  if (!real) { s.app = 'News'; s.note = 'The verdict stays on screen: the full tally of who voted for whom.'; }
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const src = (file) => (INLINE ? `data:image/jpeg;base64,${fs.readFileSync(path.join(HERE, 'shots', file)).toString('base64')}` : `shots/${file}`);

const ORDER = ['ava', 'killer1', 'killer2', 'killer3', 'doctor', 'detective', 'faithful1', 'faithful2', 'faithful3'];
const ROLE_CLASS = { Killer: 'killer', Doctor: 'doctor', Detective: 'detective', Faithful: 'faithful' };

const phoneLabel = (key) => {
  if (key === 'ava') return { name: 'Ava', role: 'New guest', cls: 'new' };
  const c = m.cast?.[key];
  return { name: c?.name ?? key, role: c?.role ?? '', cls: ROLE_CLASS[c?.role] ?? 'faithful' };
};

/** What the room itself looks and sounds like at each beat. Keyed by the beat id without its number. */
const ROOM = {
  arrival: 'Guests drift in over ten minutes, scan a QR code and set their phone up at their own pace. Nobody has a role yet, so nobody has a reason to lie: they answer the six questions straight, and those answers become public.',
  casting: 'The host presses Deal and every phone buzzes within the same second. People shield their screens, tap their role open, read one line and close it. A sealed message looks identical on every phone, so a glance at a neighbour shows nothing. A few Killers notice a new group chat appear.',
  night: 'The room goes quiet and phones glow. The Killers quietly vote, a Doctor and a Detective choose, and everyone else hunts. Nobody can tell from across the table who is tapping what, which is the point.',
  recruit: 'A call lands on one phone. The room cannot see it. Somewhere a guest is deciding whether to refuse and die, or accept and switch sides.',
  alarm: 'Every phone rings at once. Heads come up, people laugh, someone says "oh no, it is the app". Some play straight away; others stall to see who plays.',
  word: 'People mutter about words that fit and words that do not. Someone eyes the wall of clues and asks, out loud, who waited to post.',
  draw: 'Phones turn into sketchbooks. Table by table, people hide their drawings and laugh at each other\'s, then race to guess. The loudest noise of the night.',
  run: 'A room full of people tapping at the same tiny whale. Groans when someone dies at the first pipe.',
  dawn: 'A held breath, then the same board lands on every phone in the same second. The podium, then a score that looks too low, then the glitch. Someone is taken, and the whole room reacts together.',
  day: 'This is where the game is played out loud. People hold up phones and compare clues: "mine says glasses", "mine says a clear spirit". Others check each other\'s public answers in Contacts and argue about who is lying.',
  vote: 'Hands go to pockets. "Who are you voting?" Everyone has a reason, and nobody has proof. One tap each, and the choice is private until the verdict.',
  revote: 'A tie. The two names are read aloud around the table and the room has one more minute to change its mind.',
  banish: 'The verdict lands on every phone at the same instant: a name, then Killer or innocent, then who voted for whom. Tomorrow\'s suspicion starts with that last list.',
  endgame: 'Everyone left, ghosts included, votes one last time. Any Killer still standing wins it for the Killers.',
  finale: 'Every phone plays the same special edition together: who won, the Killers\' faces, and then the whole story told back, night by night. This is where all the "how did that happen?" gets answered.',
};
const roomKey = (id) => (id.match(/^[a-z]+/) ?? [''])[0];

const beats = m.sections.map((s, i) => ({ ...s, shots: m.shots.filter((x) => x.beat === s.id), i }));
const eventsOf = (id) => (m.events ?? []).filter((e) => e.beat === id);
const total = m.shots.length;

const COUNTS = ORDER.map((k) => [k, m.shots.filter((s) => s.phone === k).length]).filter(([, n]) => n);

const column = (key, shots) => {
  const l = phoneLabel(key);
  const ghost = shots.some((s) => s.ghost);
  return `
    <div class="col ${l.cls}${ghost ? ' ghost' : ''}" data-phone="${key}">
      <div class="col__head"><b>${esc(l.name)}</b><span>${esc(l.role)}${ghost ? ' · ghost' : ''}</span></div>
      ${shots.map((s) => `
      <figure class="shot${s.ghost ? ' is-ghost' : ''}">
        <img loading="lazy" src="${src(s.file)}" alt="${esc(l.name)}: ${esc(s.app ?? '')}" data-full="1">
        <figcaption><i>${esc(s.app ?? '')}${s.ghost ? ' · ghost' : ''}</i>${esc(s.note)}</figcaption>
      </figure>`).join('')}
    </div>`;
};

const section = (b) => {
  const keys = ORDER.filter((k) => b.shots.some((s) => s.phone === k));
  const room = ROOM[roomKey(b.id)];
  const ev = eventsOf(b.id);
  return `
  <section class="beat" id="${esc(b.id)}">
    <header>
      <p class="kicker">Beat ${b.i + 1} of ${beats.length}</p>
      <h2>${esc(b.title)}</h2>
      <p class="lede">${esc(b.text)}</p>
      ${room ? `<p class="room"><b>In the room.</b> ${esc(room)}</p>` : ''}
      ${ev.length ? `<ul class="events">${ev.map((e) => `<li class="${esc(e.cause)}">${esc(e.text)}</li>`).join('')}</ul>` : ''}
    </header>
    <div class="cols">${keys.map((k) => column(k, b.shots.filter((s) => s.phone === k))).join('')}</div>
  </section>`;
};

const castRows = ORDER.filter((k) => k !== 'ava').filter((k) => m.cast?.[k]).map((k) => {
  const l = phoneLabel(k);
  return `<li class="${l.cls}"><b>${esc(l.name)}</b><span>${esc(l.role)}</span><small>${COUNTS.find(([x]) => x === k)?.[1] ?? 0} screens</small></li>`;
}).join('');

const fell = (m.events ?? []).map((e) => `<li class="${esc(e.cause)}">${esc(e.text)}</li>`).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>A night of the Murder Mystery Experience, phone by phone</title>
<style>
:root{--ink:#0f1115;--raised:#171a21;--line:#2b303b;--bone:#ece6d8;--dim:#9aa0ac;--signal:#d23b3b;--brass:#c9a24a;--teal:#4aa8a0;--blue:#5b8fd6}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--ink);color:var(--bone);font:16px/1.55 Georgia,'Times New Roman',serif}
.wrap{max-width:1400px;margin:0 auto;padding:0 28px}
h1,h2,h3,.kicker,.col__head,figcaption i,nav,.chips label{font-family:'Helvetica Neue',Arial,sans-serif}
.hero{padding:72px 28px 36px;border-bottom:1px solid var(--line)}
.hero .kicker{color:var(--signal);letter-spacing:.14em;text-transform:uppercase;font-size:12px;font-weight:700;margin:0}
.hero h1{font-size:clamp(34px,5vw,64px);line-height:1.04;margin:10px 0 18px;letter-spacing:-.02em;max-width:18ch}
.hero p{max-width:68ch;color:#cfc9bb;font-size:18px}
.grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;margin:36px 0}
@media(max-width:900px){.grid2{grid-template-columns:1fr}}
.card{background:var(--raised);border:1px solid var(--line);border-radius:10px;padding:22px 24px}
.card h3{margin:0 0 10px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.card p{margin:.4em 0}
.card ol,.card ul{margin:.3em 0;padding-left:1.2em}
.cast{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.cast li{display:flex;gap:10px;align-items:baseline;border-left:4px solid var(--bone);background:#10131a;padding:8px 12px;border-radius:4px}
.cast li b{font-family:Helvetica,Arial,sans-serif}
.cast li span{color:var(--dim);font-size:14px}
.cast li small{margin-left:auto;color:var(--dim);font:12px Helvetica,Arial,sans-serif}
.killer{--c:var(--signal)}.doctor{--c:var(--teal)}.detective{--c:var(--blue)}.faithful{--c:var(--bone)}.new{--c:var(--brass)}
.cast li{border-left-color:var(--c)}
nav.toc{position:sticky;top:0;z-index:20;background:rgba(15,17,21,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:10px 0}
nav.toc .wrap{display:flex;gap:6px;overflow-x:auto;white-space:nowrap;align-items:center}
nav.toc a{color:var(--dim);text-decoration:none;font-size:12px;padding:5px 10px;border:1px solid var(--line);border-radius:999px}
nav.toc a:hover{color:var(--bone);border-color:var(--bone)}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 0}
.chips label{font-size:12px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;cursor:pointer;user-select:none;color:var(--dim)}
.chips input{display:none}
.chips input:checked+span{color:var(--bone)}
.chips label:has(input:checked){border-color:var(--c,var(--bone));color:var(--bone);background:#1b1f28}
.beat{padding:56px 0 24px;border-bottom:1px solid var(--line)}
.beat header{max-width:80ch;margin-bottom:26px}
.kicker{color:var(--dim);letter-spacing:.14em;text-transform:uppercase;font-size:11px;margin:0}
.beat h2{font-size:clamp(26px,3.4vw,40px);margin:6px 0 10px;letter-spacing:-.01em}
.lede{color:#d9d3c4;font-size:18px;margin:.2em 0 .9em}
.room{border-left:3px solid var(--brass);padding:4px 0 4px 16px;color:#cfc9bb;margin:0 0 .9em}
.room b{color:var(--brass);font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-right:.4em}
.events{list-style:none;padding:0;margin:0;display:flex;gap:8px;flex-wrap:wrap}
.events li{font:13px Helvetica,Arial,sans-serif;background:#2a1517;border:1px solid #5b2528;color:#f1b8b8;padding:5px 12px;border-radius:999px}
.events li.banished{background:#1b1f2c;border-color:#3b4767;color:#b9c6ea}
.cols{display:flex;gap:18px;overflow-x:auto;padding:4px 2px 22px;scroll-snap-type:x proximity}
.col{flex:0 0 218px;scroll-snap-align:start}
.col__head{position:sticky;left:0;display:flex;flex-direction:column;border-top:4px solid var(--c);background:var(--raised);padding:8px 10px;border-radius:0 0 6px 6px;margin-bottom:12px}
.col__head b{font-size:15px}.col__head span{font-size:12px;color:var(--dim)}
.col.ghost .col__head{filter:grayscale(.7)}
.shot{margin:0 0 18px}
.shot img{display:block;width:100%;height:auto;border-radius:20px;border:3px solid #000;box-shadow:0 0 0 1px var(--line),0 12px 28px rgba(0,0,0,.45);cursor:zoom-in;background:#000}
.shot.is-ghost img{filter:grayscale(.85) contrast(1.05)}
figcaption{font-size:13px;line-height:1.4;color:#c9c3b5;margin-top:8px;padding:0 4px}
figcaption i{display:block;font-style:normal;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin-bottom:2px}
.lb{position:fixed;inset:0;background:rgba(5,6,8,.92);display:none;align-items:center;justify-content:center;z-index:50;padding:20px;cursor:zoom-out}
.lb.on{display:flex}
.lb img{max-height:94vh;max-width:min(92vw,440px);border-radius:26px;border:4px solid #000}
.hide{display:none!important}
footer{padding:56px 0 90px;color:var(--dim);font:13px Helvetica,Arial,sans-serif}
</style></head>
<body>
<div class="wrap hero">
  <p class="kicker">Astral Project · The Murder Mystery Experience · Killers Night</p>
  <h1>A whole night, one phone at a time.</h1>
  <p>This guide follows one complete game, played on real phones against a test server, and shows what every player saw at every beat. Each column is one guest. Their role is shown on the header and the border colour: red for a Killer, teal for the Doctor, blue for the Detective, pale for the Faithful. A grey screen is a ghost.</p>
  <div class="grid2">
    <div class="card">
      <h3>The game in one minute</h3>
      <p>It is Mafia on phones. Everyone's phone becomes a retro iPhone with a cursed app called <b>DEEP BLUE</b>. Each morning it rings and the whole room plays a short game. <b>The lowest score is taken by the deep</b>.</p>
      <p>Three Killers secretly rig a score so their chosen victim is last. The Faithful, a Doctor and a Detective work out who they are from clues that describe the Killer's real looks (top colour, glasses, shoes, drink, birthday, siblings), then vote one person out each day. Taken and voted-out guests become ghosts and keep playing.</p>
      <ol>
        <li><b>Night.</b> The Killers vote on a victim; the others pick a move.</li>
        <li><b>Alarm and morning game.</b> Word, Sketch or the Run.</li>
        <li><b>The board.</b> A synced reveal: the lowest score is taken.</li>
        <li><b>Investigation.</b> Clues, Contacts, and real conversation.</li>
        <li><b>The Round Table.</b> A vote to log someone out.</li>
      </ol>
      <p>After the last day: two final votes, then the finale tells the whole story back.</p>
    </div>
    <div class="card">
      <h3>The phones in this run</h3>
      <ul class="cast">${castRows}</ul>
      <p style="color:var(--dim);font-size:14px;margin-top:14px">${total} screenshots across ${beats.length} beats. The other guests in the room were simulated players (bots) sending their moves, votes and clues through the same rules the real phones use.${m.winner ? ` <b>This run ended with a ${m.winner === 'faithful' ? 'Faithful' : 'Killers'} win.</b>` : ''}</p>
      ${fell ? `<h3 style="margin-top:18px">Who fell, and when</h3><ul class="events" style="flex-direction:column;align-items:flex-start">${fell}</ul>` : ''}
    </div>
  </div>
  <div class="chips" id="chips">
    ${ORDER.filter((k) => COUNTS.some(([x]) => x === k)).map((k) => { const l = phoneLabel(k); return `<label class="${l.cls}"><input type="checkbox" checked data-phone="${k}"><span>${esc(l.name)} · ${esc(l.role)}</span></label>`; }).join('')}
  </div>
</div>
<nav class="toc"><div class="wrap">${beats.map((b) => `<a href="#${esc(b.id)}">${esc(b.title)}</a>`).join('')}</div></nav>
<main class="wrap">${beats.map(section).join('')}</main>
<footer class="wrap">Captured from the live build against the Firebase emulator. No live game was touched.</footer>
<div class="lb" id="lb"><img alt=""></div>
<script>
  const lb = document.getElementById('lb');
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('img[data-full]')) { lb.querySelector('img').src = t.src; lb.classList.add('on'); }
    else if (lb.classList.contains('on')) lb.classList.remove('on');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('on'); });
  document.querySelectorAll('#chips input').forEach((box) => box.addEventListener('change', () => {
    document.querySelectorAll('.col[data-phone="' + box.dataset.phone + '"]').forEach((c) => c.classList.toggle('hide', !box.checked));
  }));
</script>
</body></html>`;

const out = path.join(HERE, INLINE ? 'astral-guide.html' : 'index.html');
fs.writeFileSync(out, html);
console.log(`${path.basename(out)}: ${(html.length / 1048576).toFixed(1)} MB, ${total} shots, ${beats.length} beats`);
