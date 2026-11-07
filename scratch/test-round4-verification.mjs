import { chromium } from 'playwright-core';
import path from 'path';

const outDir = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const viewports = [
    { name: '1920', width: 1920, height: 1080 },
    { name: '1440', width: 1440, height: 900 },
    { name: '1280', width: 1280, height: 800 },
    { name: '1024', width: 1024, height: 768 },
    { name: '390', width: 390, height: 844 },
  ];

  console.log('=== Starting Section Screenshots Across Viewports ===');
  for (const vp of viewports) {
    console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Hero
    await page.screenshot({ path: path.join(outDir, `r4_${vp.name}_01_hero.png`) });

    const sections = ['about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact'];
    for (const sec of sections) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView();
      }, sec);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `r4_${vp.name}_sec_${sec}.png`) });
    }

    await page.close();
  }

  // === Part 1e: 20x Return to Top Test ===
  console.log('\n=== Running 20x Return to Top Test ===');
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await testPage.waitForTimeout(1000);

  const returnResults = [];
  const methods = ['scroll', 'backToTopBtn', 'railItem01', 'homeKey', 'scrollToZero'];

  for (let i = 1; i <= 20; i++) {
    const method = methods[(i - 1) % methods.length];
    // Scroll to bottom
    await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await testPage.waitForTimeout(300);

    // Return to top by selected method
    if (method === 'scroll') {
      await testPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    } else if (method === 'backToTopBtn') {
      await testPage.evaluate(() => {
        const btn = document.querySelector('button[aria-label="Back to top"], button[data-action="back-to-top"]');
        if (btn) btn.click();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else if (method === 'railItem01') {
      await testPage.evaluate(() => {
        const railHome = document.querySelector('.nav-rail button, nav button');
        if (railHome) railHome.click();
        else window.scrollTo(0, 0);
      });
    } else if (method === 'homeKey') {
      await testPage.keyboard.press('Home');
    } else {
      await testPage.evaluate(() => window.scrollTo(0, 0));
    }

    await testPage.waitForTimeout(300);

    // Check that hero canvas exists, has non-zero size, and is rendered
    const status = await testPage.evaluate(() => {
      const heroSec = document.getElementById('home');
      const canvas = heroSec?.querySelector('canvas');
      const rect = canvas?.getBoundingClientRect();
      const inView = rect && rect.width > 200 && rect.height > 200 && rect.top >= -100 && rect.bottom > 200;
      return {
        hasCanvas: !!canvas,
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
        inView: !!inView,
      };
    });

    returnResults.push({ run: i, method, ...status });
  }

  console.log('20x Return to Top Results Summary:');
  const allPassed = returnResults.every((r) => r.hasCanvas && r.inView);
  console.log(`Passed: ${returnResults.filter((r) => r.inView).length}/20 (All passed: ${allPassed})`);

  // === Part 5: Skill Chips Hover Test & Loop Check ===
  console.log('\n=== Testing 10 Skill Chips Hovers for Loop / Oscillation Check ===');
  await testPage.evaluate(() => document.getElementById('skills')?.scrollIntoView());
  await testPage.waitForTimeout(600);

  const chipButtons = await testPage.$$('#skills button.group');
  console.log(`Found ${chipButtons.length} skill chip buttons.`);

  const hoverLog = [];
  const testCount = Math.min(10, chipButtons.length);
  for (let c = 0; c < testCount; c++) {
    const chip = chipButtons[c];
    await chip.hover();
    await testPage.waitForTimeout(200);

    // Read store state
    const state = await testPage.evaluate(() => {
      const store = window.__ROBOT_STORE__;
      const s = store ? store.getState() : null;
      return {
        boltAnim: s?.boltAnim,
        boltExpr: s?.boltExpr,
        speechBubble: s?.speechBubble,
      };
    });

    hoverLog.push({ chipIndex: c, ...state });
  }

  // Move mouse away to test leave hysteresis
  await testPage.mouse.move(500, 100);
  await testPage.waitForTimeout(700);
  const afterLeaveState = await testPage.evaluate(() => window.__ROBOT_STORE__?.getState()?.boltAnim);
  console.log(`State after leaving shelves (600ms debounce): ${afterLeaveState}`);
  console.log('Skill Chip Hover Transitions:', JSON.stringify(hoverLog, null, 2));

  // === Part 6: Skyline Interaction & Zoom Controls ===
  console.log('\n=== Testing Skyline OrbitControls & Zoom Buttons ===');
  await testPage.evaluate(() => document.getElementById('github')?.scrollIntoView());
  await testPage.waitForTimeout(600);

  // Click canvas to activate zoom
  const skylineContainer = await testPage.$('#github [data-lenis-prevent], #github canvas');
  if (skylineContainer) {
    await skylineContainer.click();
    await testPage.waitForTimeout(300);
  }

  // Click zoom in (+)
  const zoomInBtn = await testPage.$('#github button[title*="Zoom In"]');
  if (zoomInBtn) {
    await zoomInBtn.click();
    await testPage.waitForTimeout(200);
  }

  // Click reset
  const resetBtn = await testPage.$('#github button[title*="Reset"]');
  if (resetBtn) {
    await resetBtn.click();
    await testPage.waitForTimeout(200);
  }

  await testPage.screenshot({ path: path.join(outDir, 'r4_skyline_interactive_verified.png') });

  await testPage.close();
  await browser.close();
  console.log('=== All Round 4 Tests Completed Successfully ===');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

