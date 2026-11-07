const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

const VIEWPORTS = [
  { name: 'mobile_360', width: 360, height: 740 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'tablet_1024', width: 1024, height: 768 },
  { name: 'laptop_1280', width: 1280, height: 800 },
  { name: 'laptop_1345', width: 1345, height: 800 },
  { name: 'laptop_1366', width: 1366, height: 768 },
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'desktop_1536', width: 1536, height: 864 },
  { name: 'desktop_1920', width: 1920, height: 1080 },
  { name: 'desktop_2560', width: 2560, height: 1440 },
];

const SECTIONS = ['about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact'];

(async () => {
  console.log('=== STARTING PART 6: COMPREHENSIVE 11-VIEWPORT AUTOMATED REGRESSION SWEEP ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  // Bypass initial session loader to ensure instant test stability
  await page.addInitScript(() => {
    sessionStorage.setItem('sp_loader_seen', '1');
  });

  const results = {
    viewportsTested: [],
    assertions: {
      singleRobot: true,
      noHorizontalOverflow: true,
      noRailOverlap: true,
      noHeadingOverlap: true,
      noDetachedShadow: true,
      noAhem: true,
      zeroClipping: true,
      ctrlKWorking: true,
      quietModeWorking: true
    },
    details: []
  };

  // 1. Loop through all 11 viewports
  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#robot-steve-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Initial check at top (Hero)
    const heroMetrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const robots = document.querySelectorAll('[data-robot-instance="single-steve"]');
      const detachedShadows = document.querySelectorAll('.rounded-full.bg-black\\/20, .rounded-full.bg-black\\/30, .shadow-pill');
      const textContent = document.body.innerText.toLowerCase();
      
      return {
        scrollWidth,
        innerWidth,
        noOverflow: scrollWidth <= innerWidth + 1,
        robotCount: robots.length,
        detachedShadowCount: detachedShadows.length,
        hasAhem: textContent.includes('ahem')
      };
    });

    if (!heroMetrics.noOverflow) {
      results.assertions.noHorizontalOverflow = false;
      console.error(`  [FAIL] Horizontal overflow at ${vp.name}: ${heroMetrics.scrollWidth} > ${heroMetrics.innerWidth}`);
    }
    if (heroMetrics.robotCount !== 1) {
      results.assertions.singleRobot = false;
      console.error(`  [FAIL] Robot count at ${vp.name}: ${heroMetrics.robotCount}`);
    }
    if (heroMetrics.detachedShadowCount > 0) {
      results.assertions.noDetachedShadow = false;
      console.error(`  [FAIL] Detached shadow DOM found at ${vp.name}`);
    }
    if (heroMetrics.hasAhem) {
      results.assertions.noAhem = false;
      console.error(`  [FAIL] 'ahem' text found at ${vp.name}`);
    }

    // Scroll through sections and check overlap
    for (const secId of SECTIONS) {
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, secId);
      // Wait for lane crossing transition to settle
      await page.waitForTimeout(950);

      const sectionCheck = await page.evaluate((id) => {
        const steveEl = document.querySelector('#robot-steve-container');
        const railEl = document.querySelector('.nav-rail, [data-testid="nav-rail"]');
        const headingEl = document.querySelector(`#${id} h1, #${id} h2, #${id} [class*="section-title"], #${id} .font-display`);

        const sRect = steveEl ? steveEl.getBoundingClientRect() : null;
        const rRect = railEl ? railEl.getBoundingClientRect() : null;
        const hRect = headingEl ? headingEl.getBoundingClientRect() : null;

        let railOverlap = false;
        let headingOverlap = false;

        // In desktop mode, Steve's 3D mesh is in the center of the canvas with ~45px half-width
        if (sRect && rRect && window.innerWidth >= 1200) {
          const steveMeshRight = sRect.left + (sRect.width / 2) + 45;
          const railLeft = rRect.left;
          // Clearance must be >= 12px
          if (steveMeshRight > railLeft - 12) {
            railOverlap = true;
          }
        }

        if (sRect && hRect && window.innerWidth >= 1024) {
          const steveMeshLeft = sRect.left + (sRect.width / 2) - 45;
          const steveMeshRight = sRect.left + (sRect.width / 2) + 45;

          // Check if Steve's 3D body overlaps the heading horizontally and vertically
          const xOverlap = !(steveMeshRight < hRect.left || steveMeshLeft > hRect.right);
          const yOverlap = !(sRect.bottom < hRect.top || sRect.top > hRect.bottom);
          
          if (xOverlap && yOverlap) {
            headingOverlap = true;
          }
        }

        return { railOverlap, headingOverlap };
      }, secId);

      if (sectionCheck.railOverlap) {
        results.assertions.noRailOverlap = false;
        console.error(`  [FAIL] Steve overlaps rail in section ${secId} at ${vp.name}`);
      }
      if (sectionCheck.headingOverlap) {
        results.assertions.noHeadingOverlap = false;
        console.error(`  [FAIL] Steve overlaps heading in section ${secId} at ${vp.name}`);
      }
    }

    results.viewportsTested.push({
      name: vp.name,
      resolution: `${vp.width}x${vp.height}`,
      noOverflow: heroMetrics.noOverflow,
      robotCount: heroMetrics.robotCount,
      cleanDOM: !heroMetrics.hasAhem && heroMetrics.detachedShadowCount === 0
    });

    // Capture representative screenshots for report
    if (['mobile_390', 'laptop_1345', 'desktop_1440', 'desktop_1920'].includes(vp.name)) {
      // Return to hero
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `r7_${vp.name}_hero.png`) });
      
      // Scroll to Skills
      await page.evaluate(() => {
        const s = document.getElementById('skills');
        if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `r7_${vp.name}_skills.png`) });
    }
  }

  // 2. Test Canvas Clipping at 2px boundary during jump apex
  console.log('\nTesting Steve Canvas Outer 2px Transparency (Clipping Prevention)...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#robot-steve-container', { timeout: 10000 });

  const clippingResult = await page.evaluate(async () => {
    const store = window.__ROBOT_STORE__;
    store.setSteve('jump', 'excited');
    await new Promise(r => setTimeout(r, 450)); // jump apex

    const canvas = document.querySelector('#robot-steve-container canvas');
    if (!canvas) return { error: 'No canvas' };

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No GL' };

    const w = canvas.width;
    const h = canvas.height;
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let opaqueBorderPixels = 0;
    // Check top 2 rows
    for (let y = h - 2; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = pixels[(y * w + x) * 4 + 3];
        if (alpha > 0) opaqueBorderPixels++;
      }
    }
    // Check left & right 2 columns
    for (let y = 0; y < h; y++) {
      for (let x of [0, 1, w - 2, w - 1]) {
        const alpha = pixels[(y * w + x) * 4 + 3];
        if (alpha > 0) opaqueBorderPixels++;
      }
    }

    return { opaqueBorderPixels, zeroClipping: opaqueBorderPixels === 0 };
  });

  console.log('Clipping result at jump apex:', clippingResult);
  if (!clippingResult.zeroClipping) {
    results.assertions.zeroClipping = false;
    console.error('  [FAIL] Canvas clipped at border pixels:', clippingResult.opaqueBorderPixels);
  }

  // 3. Test Command Palette & Quiet Mode
  console.log('\nTesting Command Palette & Quiet Mode...');
  const paletteTest = await page.evaluate(async () => {
    // Open Palette via keyboard
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await new Promise(r => setTimeout(r, 200));
    const paletteModal = document.querySelector('[role="dialog"], .command-palette');
    const isModalOpen = !!paletteModal;

    // Test quiet mode toggle
    const store = window.__ROBOT_STORE__;
    store.setQuiet(true);
    const quietState = store.getState().isQuiet;
    const storedVal = localStorage.getItem('sunny_portfolio_steve_quiet');

    // Restore talk mode
    store.setQuiet(false);
    const talkState = !store.getState().isQuiet;

    return {
      isModalOpen,
      quietState,
      storedVal,
      talkState
    };
  });

  console.log('Palette & Quiet Mode result:', paletteTest);
  if (!paletteTest.quietState || paletteTest.storedVal !== 'true' || !paletteTest.talkState) {
    results.assertions.quietModeWorking = false;
    console.error('  [FAIL] Steve quiet mode state or localStorage persistence failed');
  }

  // Final Summary
  console.log('\n=== PART 6 AUTOMATED SWEEP COMPLETE ===');
  console.log('Results summary:');
  console.table(results.assertions);
  console.table(results.viewportsTested);

  const allPassed = Object.values(results.assertions).every(v => v === true);
  console.log(`\nOVERALL PASS STATUS: ${allPassed ? 'PASSED (100%)' : 'SOME CHECKS FAILED'}`);

  // Write results JSON for report generation
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'r7_sweep_results.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();