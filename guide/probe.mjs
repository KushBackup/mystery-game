import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: process.env.LOCALAPPDATA + '\\\\ms-playwright\\\\chromium-1228\\\\chrome-win64\\\\chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console', m.type(), m.text().slice(0, 200)); });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'probe-1.png' });
console.log(await page.evaluate(() => document.body.innerText.slice(0, 300)));
await page.waitForTimeout(3000);
await page.screenshot({ path: 'probe-2.png' });
console.log(await page.evaluate(() => document.body.innerText.slice(0, 300)));
await browser.close();
