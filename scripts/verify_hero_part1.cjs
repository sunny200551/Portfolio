const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const data = await page.evaluate(() => {
    const boltBtn = document.querySelector('button[aria-label*="BOLT"]') || document.querySelector('[data-robot-anchor]');
    const boltRect = boltBtn ? boltBtn.getBoundingClientRect() : null;
    return {
      boltRect: boltRect ? { x: boltRect.x, y: boltRect.y, w: boltRect.width, h: boltRect.height } : null,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  });
  
  console.log('Live inspection data:', data);
  await page.screenshot({ path: 'src/robot/screenshots_part1/hero_relayout_verified.png' });
  await browser.close();
})();

