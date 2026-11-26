// End-to-end check: page loads, counts down, reaches zero, renders at 1280 and 390 px.
import { chromium } from "playwright-core";
import { mkdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

const root = join(import.meta.dir, "..");
const url = pathToFileURL(join(root, "index.html")).href;
const shots = join(root, "test", "shots");
mkdirSync(shots, { recursive: true });
const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const fails: string[] = [];
const ok = (cond: boolean, msg: string) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) fails.push(msg); };
const secs = (t: string[]) => +t[0] * 86400 + +t[1] * 3600 + +t[2] * 60 + +t[3];

const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const to = new Date(Date.now() + 2 * 86400e3 + 3 * 3600e3 + 600e3);
  const iso = to.toISOString();
  await page.goto(`${url}?to=${encodeURIComponent(iso)}`);
  const read = async () => secs(await page.$$eval(".n", els => els.map(e => e.textContent || "0")));
  const a = await read();
  ok(Math.abs(a - (to.getTime() - Date.now()) / 1000) < 5, `remaining matches target (${a}s)`);
  await page.waitForTimeout(2200);
  const b = await read();
  ok(a - b >= 1 && a - b <= 4, `counts down (${a} -> ${b})`);
  await page.screenshot({ path: join(shots, "1280.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  ok(!overflow, "no horizontal scroll at 390 px");
  await page.screenshot({ path: join(shots, "390.png") });

  await page.goto(`${url}?to=${encodeURIComponent(new Date(Date.now() - 1000).toISOString())}`);
  ok((await read()) === 0 && (await page.evaluate(() => document.body.classList.contains("done"))), "past target shows zero");

  await page.goto(url);
  ok((await read()) > 0, "no target falls back to next new year");
} finally {
  await browser.close();
}
if (fails.length) { console.log(`${fails.length} failed`); process.exit(1); }
console.log("all checks passed");
