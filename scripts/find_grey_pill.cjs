const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
  await page.setViewportSize({ width: 1345, height: 800 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#robot-steve-container');

  await page.evaluate(() => {
    document.getElementById('skills').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  // Find all elements near x = 1230-1300, y = 550-600
  const elements = await page.evaluate(() => {
    const list = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        if (r.left >= 1150 && r.right <= 1340 && r.top >= 530 && r.bottom <= 600) {
          list.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            rect: r,
            style: el.getAttribute('style')
          });
        }
      }
    }
    return list;
  });

  console.log('Elements near grey pill:', elements);
  await browser.close();
})();
