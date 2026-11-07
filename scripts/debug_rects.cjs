const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Scroll to about
  await page.evaluate(() => {
    const el = document.getElementById('about');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  const rects = await page.evaluate(() => {
    const steve = document.querySelector('#robot-steve-container');
    const sRect = steve ? steve.getBoundingClientRect() : null;
    const about = document.getElementById('about');
    const h = about ? about.querySelector('h1, h2, [class*="mb-12"]') : null;
    const hRect = h ? h.getBoundingClientRect() : null;
    const rail = document.querySelector('.nav-rail, [data-testid="nav-rail"]');
    const rRect = rail ? rail.getBoundingClientRect() : null;

    return {
      steve: sRect,
      heading: hRect,
      rail: rRect,
      overlapWithHeading: sRect && hRect ? !(
        sRect.right < hRect.left ||
        sRect.left > hRect.right ||
        sRect.bottom < hRect.top ||
        sRect.top > hRect.bottom
      ) : false
    };
  });

  console.log('Rects in About at 1440px:', rects);
  await browser.close();
})();

