const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { width: 1440, height: 900, name: 'desktop_1440' },
    { width: 1345, height: 800, name: 'laptop_1345' },
    { width: 390, height: 844, name: 'mobile_390' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify mascot presence
    const steveElement = await page.$('[data-robot-instance="single-steve"]');
    const boltElement = await page.$('[data-robot-instance="single-bolt"]');
    console.log(`[${vp.name}] single-steve found:`, !!steveElement, 'single-bolt found:', !!boltElement);

    // Take screenshot of hero
    const shotPath = `C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/part1_${vp.name}_hero.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // If desktop, test CTRL+K palette commands
    if (vp.name === 'desktop_1440') {
      await page.keyboard.press('Control+KeyK');
      await page.waitForTimeout(500);
      const paletteShot = `C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/part1_palette.png`;
      await page.screenshot({ path: paletteShot });
      console.log(`Saved palette screenshot to ${paletteShot}`);
      await page.keyboard.press('Escape');
    }

    await page.close();
  }

  await browser.close();
  console.log('PART 1 VERIFICATION COMPLETED');
})();

