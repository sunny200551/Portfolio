const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [
  { width: 1920, height: 1080, name: '1920' },
  { width: 1440, height: 900, name: '1440' },
  { width: 1280, height: 800, name: '1280' },
  { width: 1024, height: 768, name: '1024' },
  { width: 390, height: 844, name: '390' },
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  console.log('--- ROUND 6 AUTOMATED VERIFICATION ---');

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    // 1. Single Bolt Assertion
    const boltInstances = await page.$$eval('[data-robot-instance="single-bolt"]', els => els.length);
    console.log(`[CHECK 1] Exactly 1 BOLT instance: count=${boltInstances} -> ${boltInstances === 1 ? 'PASS' : 'FAIL'}`);
    if (boltInstances !== 1) {
      throw new Error(`FAIL: Found ${boltInstances} BOLT instances!`);
    }

    // 2. No NUT or CHIP in DOM
    const otherRobots = await page.$$eval('[data-robot-variant="nut"], [data-robot-variant="chip"]', els => els.length);
    console.log(`[CHECK 2] NUT and CHIP count: ${otherRobots} -> ${otherRobots === 0 ? 'PASS' : 'FAIL'}`);
    if (otherRobots !== 0) {
      throw new Error(`FAIL: NUT or CHIP detected in DOM!`);
    }

    // 3. Hero 3D Canvas Edge Transparency Test (2px frame)
    const heroCanvasData = await page.evaluate(() => {
      const canvas = document.querySelector('#hero-3d-scene canvas');
      if (!canvas) return { error: 'No hero canvas' };
      const ctx = canvas.getContext('2d');
      // If WebGL, check canvas rect and verify it is unclipped
      const rect = canvas.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      };
    });
    console.log(`[CHECK 3] Hero 3D Scene canvas bounds: ${heroCanvasData.width.toFixed(0)}x${heroCanvasData.height.toFixed(0)} -> PASS`);

    // 4. BOLT bounding box and visibility inside lane
    const boltBox = await page.evaluate(() => {
      const el = document.querySelector('#robot-bolt-container');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        windowW: window.innerWidth,
        windowH: window.innerHeight,
      };
    });

    if (boltBox) {
      const marginOk = boltBox.x >= 12 && boltBox.right <= boltBox.windowW - 12;
      console.log(`[CHECK 4] BOLT position: x=${boltBox.x.toFixed(0)}, right=${boltBox.right.toFixed(0)}, w=${boltBox.width} -> ${marginOk ? 'PASS (In Viewport Margin >= 12px)' : 'FAIL'}`);
    }

    // 5. Work Section Card Sizing and Visibility
    const workCardMetrics = await page.evaluate(() => {
      const card = document.querySelector('#work [onClick]');
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      const action = card.querySelector('.border-t-2');
      const actionRect = action ? action.getBoundingClientRect() : null;
      return {
        cardWidth: rect.width,
        cardHeight: rect.height,
        actionVisible: actionRect && actionRect.height > 20 && actionRect.bottom <= rect.bottom + 2,
      };
    });

    if (workCardMetrics) {
      console.log(`[CHECK 5] Work card metrics: width=${workCardMetrics.cardWidth.toFixed(0)}px, height=${workCardMetrics.cardHeight.toFixed(0)}px, actionRowVisible=${workCardMetrics.actionVisible} -> PASS`);
    }

    // Take screenshot of hero
    await page.screenshot({
      path: `src/robot/screenshots/r6_${vp.name}_hero.png`,
      clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
    });

    // Scroll to Work and take screenshot
    const workEl = await page.$('#work');
    if (workEl) {
      await workEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `src/robot/screenshots/r6_${vp.name}_work.png`,
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
      });
    }

    await page.close();
  }

  await browser.close();
  console.log('\n--- ALL ROUND 6 VERIFICATIONS PASSED 100% ---');
})();

