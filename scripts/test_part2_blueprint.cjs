const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { name: '1920', width: 1920, height: 1080 },
    { name: '1440', width: 1440, height: 900 },
    { name: '1345', width: 1345, height: 800 },
    { name: '390', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="hero-blueprint-studio"]', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Hover near center of hero to trigger cursor crosshair
    if (vp.width >= 1024) {
      await page.mouse.move(vp.width / 2, 400);
      await page.waitForTimeout(300);
    }

    // Verify L1 grid, L2 stage, L3 blueprint annotations, L4 floating stickers exist
    const checks = await page.evaluate(() => {
      const studio = document.querySelector('[data-testid="hero-blueprint-studio"]');
      const grid = document.querySelector('[data-testid="blueprint-l1-grid"]');
      const stage = document.querySelector('[data-testid="blueprint-l2-stage"]');
      const stickers = document.querySelectorAll('.blueprint-sticker');
      const scrollHint = document.querySelector('[data-testid="hero-scroll-hint"]');
      const crosshair = document.querySelector('[data-testid="hero-cursor-crosshair"]');
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;

      return {
        hasStudio: !!studio,
        hasGrid: !!grid,
        hasStage: !!stage,
        stickerCount: stickers.length,
        hasScrollHint: !!scrollHint,
        hasCrosshair: !!crosshair,
        hasHorizontalOverflow: scrollWidth > innerWidth
      };
    });

    console.log(`Viewport ${vp.name}px:`, JSON.stringify(checks));

    // Take screenshot of hero
    const screenshotPath = path.join(ARTIFACTS_DIR, `part2_blueprint_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);

    // Test scroll hint disappearance on scroll > 40px
    if (vp.name === '1920') {
      await page.evaluate(() => window.scrollTo(0, 80));
      await page.waitForTimeout(500);
      const hintDismissed = await page.evaluate(() => {
        const hint = document.querySelector('[data-testid="hero-scroll-hint"]');
        return !hint || window.getComputedStyle(hint).display === 'none' || window.getComputedStyle(hint).opacity === '0';
      });
      console.log('Scroll hint dismissed on scroll > 40px:', hintDismissed);
    }

    await page.close();
  }

  await browser.close();
  console.log('Part 2 verification finished successfully!');
})();
