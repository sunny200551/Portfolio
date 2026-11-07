const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#robot-steve-container', { timeout: 10000 });

  await page.evaluate(() => {
    const el = document.getElementById('skills');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  const data = await page.evaluate(() => {
    const steveEl = document.querySelector('#robot-steve-container');
    const headingEl = document.querySelector('#skills h1, #skills h2, #skills [class*="section-title"], #skills .font-display');
    const sRect = steveEl.getBoundingClientRect();
    const hRect = headingEl.getBoundingClientRect();

    const steveMeshLeft = sRect.left + (sRect.width / 2) - 45;
    const steveMeshRight = sRect.left + (sRect.width / 2) + 45;

    const xOverlap = !(steveMeshRight < hRect.left || steveMeshLeft > hRect.right);
    const yOverlap = !(sRect.bottom < hRect.top || sRect.top > hRect.bottom);

    return {
      steveElTag: steveEl.tagName,
      headingElTag: headingEl.tagName,
      headingElClass: headingEl.className,
      headingText: headingEl.textContent,
      sRect,
      hRect,
      steveMeshLeft,
      steveMeshRight,
      xOverlap,
      yOverlap
    };
  });

  console.log('Skills overlap check:', data);
  await browser.close();
})();

