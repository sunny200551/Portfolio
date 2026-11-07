const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#robot-steve-container', { timeout: 10000 });

  const sections = ['about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact'];

  for (const s of sections) {
    // Scroll and wait for 850ms lane transition to settle
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, s);
    await page.waitForTimeout(1000);

    const check = await page.evaluate((id) => {
      const steveEl = document.querySelector('#robot-steve-container');
      const headingEl = document.querySelector(`#${id} h1, #${id} h2, #${id} [class*="section-title"], #${id} .font-display`);
      const sRect = steveEl.getBoundingClientRect();
      const hRect = headingEl ? headingEl.getBoundingClientRect() : null;

      const steveMeshLeft = sRect.left + (sRect.width / 2) - 45;
      const steveMeshRight = sRect.left + (sRect.width / 2) + 45;

      const xOverlap = hRect ? !(steveMeshRight < hRect.left || steveMeshLeft > hRect.right) : false;
      const yOverlap = hRect ? !(sRect.bottom < hRect.top || sRect.top > hRect.bottom) : false;

      return {
        sec: id,
        sRect,
        hRect,
        xOverlap,
        yOverlap,
        overlap: xOverlap && yOverlap
      };
    }, s);

    console.log(`Section ${s} at 1440px: overlap = ${check.overlap}`, {
      xOverlap: check.xOverlap,
      yOverlap: check.yOverlap,
      steveLeft: check.sRect.left,
      headingLeft: check.hRect?.left,
      headingRight: check.hRect?.right
    });
  }

  await browser.close();
})();

