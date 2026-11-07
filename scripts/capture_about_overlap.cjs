const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'debug_about_overlap.png') });
  console.log('Saved debug_about_overlap.png');
  await browser.close();
})();

