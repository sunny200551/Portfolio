const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

const VIEWPORTS = [
  { w: 390, h: 844, name: 'mobile_390' },
  { w: 768, h: 1024, name: 'tablet_768' },
  { w: 1024, h: 768, name: 'tablet_1024' },
  { w: 1280, h: 800, name: 'laptop_1280' },
  { w: 1345, h: 800, name: 'laptop_1345' },
  { w: 1366, h: 768, name: 'laptop_1366' },
  { w: 1440, h: 900, name: 'desktop_1440' },
  { w: 1536, h: 864, name: 'desktop_1536' },
  { w: 1920, h: 1080, name: 'desktop_1920' },
  { w: 2560, h: 1440, name: 'desktop_2560' },
];

(async () => {
  console.log('--- STARTING PART 1 TEST: HERO ILLUSTRATION SCALE & GRID ---');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#hero-platform-slab', { timeout: 10000 });
  await page.waitForTimeout(600);

  let allPass = true;

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(400);

    const metrics = await page.evaluate(() => {
      const svg = document.querySelector('[data-robot-anchor="home:platform"] svg');
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      const leftCol = document.querySelector('#home h1');
      const leftRect = leftCol ? leftCol.getBoundingClientRect() : null;
      const rail = document.querySelector('.nav-rail, [data-testid="nav-rail"]');
      const railRect = rail ? rail.getBoundingClientRect() : null;
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;

      // Clearance from right rail
      let railClearance = 999;
      if (railRect && svgRect && innerWidth >= 1200) {
        railClearance = railRect.left - svgRect.right;
      }

      // Check text overlap
      let textOverlap = false;
      if (leftRect && svgRect && innerWidth >= 1024) {
        textOverlap = !(svgRect.left >= leftRect.right);
      }

      return {
        svgWidth: svgRect ? Math.round(svgRect.width) : 0,
        svgHeight: svgRect ? Math.round(svgRect.height) : 0,
        pctOfViewport: svgRect ? (svgRect.width / innerWidth * 100).toFixed(1) + '%' : '0%',
        noOverflow: scrollWidth <= innerWidth + 1,
        railClearance: Math.round(railClearance),
        textOverlap,
        scrollWidth,
        innerWidth
      };
    });

    console.log(`Viewport ${vp.name} (${vp.w}x${vp.h}):`, metrics);

    if (!metrics.noOverflow) {
      console.error(`  [FAIL] Overflow at ${vp.w}px`);
      allPass = false;
    }
    if (metrics.textOverlap) {
      console.error(`  [FAIL] Text overlap with illustration at ${vp.w}px`);
      allPass = false;
    }
    if (vp.w >= 1200 && metrics.railClearance < 24) {
      console.error(`  [FAIL] Rail clearance < 24px at ${vp.w}px: ${metrics.railClearance}px`);
      allPass = false;
    }

    if (['desktop_1920', 'desktop_1440', 'laptop_1280', 'mobile_390'].includes(vp.name)) {
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `part1_${vp.name}.png`) });
    }
  }

  console.log(`\nPART 1 TEST PASS: ${allPass}`);
  await browser.close();
  process.exit(allPass ? 0 : 1);
})();
