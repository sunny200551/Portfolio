const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const viewports = [
    { name: '1440_desktop', width: 1440, height: 900 },
    { name: '1920_widescreen', width: 1920, height: 1080 },
    { name: '1280_compact', width: 1280, height: 800 },
    { name: '1024_tablet', width: 1024, height: 768 },
    { name: '390_mobile', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    
    // Check for errors
    page.on('pageerror', err => console.error(`[${vp.name}] PAGE ERROR:`, err.message));

    await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Hero screenshot
    await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_hero.png` });

    // Scroll to Work section
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_work.png` });

    // In desktop view, test card hover in Work
    if (vp.width >= 1024) {
      const card = await page.locator('#work article, #work [data-card]').first();
      if (await card.isVisible()) {
        await card.hover();
        await page.waitForTimeout(600);
        await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_work_hover.png` });
      }
    }

    // Scroll to Skills section
    await page.evaluate(() => {
      const el = document.getElementById('skills');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_skills.png` });

    // In desktop view, test slab hover in Skills
    if (vp.width >= 1024) {
      const slab = await page.locator('[data-robot-react="skills:tile"]').first();
      if (await slab.isVisible()) {
        await slab.hover();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_skills_hover.png` });
      }
    }

    // Scroll to Journey section
    await page.evaluate(() => {
      const el = document.getElementById('journey');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `src/robot/screenshots_part1/part5_${vp.name}_journey.png` });

    // Check collision self-check status on page
    const collisionStatus = await page.evaluate(() => {
      const violationCount = window.__robotViolations || 0;
      return violationCount;
    });
    console.log(`[${vp.name}] Self-check violations:`, collisionStatus);

    await page.close();
  }

  await browser.close();
  console.log('\nAll Parts 5, 6, 7 verifications completed!');
})();

