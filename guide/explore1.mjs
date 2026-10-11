import { assertEmulator, hostLogin, makeBot, launch, Phone, resetShots, beat, saveManifest, manifest, sleep } from './lib.mjs';
import { arrive } from '../src/firebase/bots.js';
import { onboard, slide } from './flows.mjs';

await assertEmulator();
resetShots();
const { host } = await hostLogin();
const gid = await host.createGame({ cycles: 3, autopilot: false });
console.log('game', gid);
const bots = await Promise.all(Array.from({ length: 20 }, (_, i) => makeBot(i)));
await Promise.all(bots.map((b) => arrive(b, gid)));
const browser = await launch();
const ava = await new Phone(browser, { key: 'ava', name: 'Ava', who: 'Ava (new guest)' }).open();
beat('arrival', 'Arrival');
try {
  await onboard(ava, { name: 'Ava' });
  await ava.snap('Phone ready: the lock screen counts who has arrived.', { app: 'Lock screen' });
  await slide(ava.page, 'slide to unlock');
  await ava.snap('Home screen before the deal.', { app: 'Home' });
} catch (e) { console.log('ERR', e.message); await ava.snap('error'); }
saveManifest();
console.log(JSON.stringify(manifest.shots.map((s) => s.file)));
await browser.close();
process.exit(0);
