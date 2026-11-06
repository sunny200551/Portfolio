const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const els = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('[data-robot-anchor], button[aria-label*="BOLT"], button[aria-label*="robot"]').forEach(el => {
      const r = el.getBoundingClientRect();
      list.push({
        tag: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        anchor: el.getAttribute('data-robot-anchor'),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      });
    });
    return list;
  });

  console.log(JSON.stringify(els, null, 2));
  await browser.close();
})();

