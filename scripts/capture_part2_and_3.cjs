const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });

  // 1. Capture complete design sheet
  await page.goto('http://localhost:5173/?robot-showcase=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Take design sheet screenshot
  await page.screenshot({ path: 'src/robot/screenshots_part1/bolt_design_sheet_views.png', fullPage: true });
  console.log('Saved bolt_design_sheet_views.png');

  // 2. Capture Walk Cycle Frame Sequence (8-10 frames)
  const animPage = await browser.newPage({ viewport: { width: 400, height: 400 } });
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(120);
    const card = await page.$('[data-testid="sheet-2-0"]');
    if (card) {
      await card.screenshot({ path: `src/robot/screenshots_part1/seq_walk_frame_${i + 1}.png` });
    }
  }
  console.log('Saved 8 walk cycle frames');

  // 3. Capture Dance Loop Frame Sequence (8 frames)
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(250);
    const card = await page.$('[data-testid="sheet-3-0"]');
    if (card) {
      await card.screenshot({ path: `src/robot/screenshots_part1/seq_dance_frame_${i + 1}.png` });
    }
  }
  console.log('Saved 8 dance loop frames');

  await animPage.close();
  await browser.close();
})();
