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
  await page.waitForTimeout(1000);

  const debug = await page.evaluate(() => {
    // Traverse three scene from canvas
    const canvas = document.querySelector('#robot-steve-container canvas');
    return {
      bodyY: window.__DEBUG_ROBOT_BODY_Y__,
    };
  });

  console.log('Debug Three world:', debug);
  await browser.close();
})();
