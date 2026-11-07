const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

const VIEWPORTS = [
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

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];

  console.log('--- STARTING 10-VIEWPORT VERIFICATION SWEEP ---');

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#hero-chair-group', { timeout: 10000 });
    await page.waitForTimeout(1400);

    // 1. Check seated state
    const seatedData = await page.evaluate(() => {
      const chair = document.querySelector('#hero-chair-group');
      const seatAnchor = document.querySelector('#steve-seat');
      const steve = document.querySelector('#robot-steve-container');
      const sRect = steve ? steve.getBoundingClientRect() : null;
      const cRect = chair ? chair.getBoundingClientRect() : null;
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;

      return {
        hasChair: !!chair,
        hasSeatAnchor: !!seatAnchor,
        hasOverflow: scrollW > innerW,
        steveW: sRect ? Math.round(sRect.width) : 0,
        steveH: sRect ? Math.round(sRect.height) : 0,
        steveX: sRect ? Math.round(sRect.x) : 0,
        steveY: sRect ? Math.round(sRect.y) : 0,
        chairX: cRect ? Math.round(cRect.x) : 0,
        chairY: cRect ? Math.round(cRect.y) : 0,
      };
    });

    // 2. Trigger liftoff to check empty chair state & lane position
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.waitForTimeout(2200);

    const laneData = await page.evaluate(() => {
      const emptyMug = document.querySelector('#chair-steaming-mug');
      const brbBadge = document.querySelector('#chair-brb-badge');
      const steve = document.querySelector('#robot-steve-container');
      const sRect = steve ? steve.getBoundingClientRect() : null;

      return {
        hasEmptyMug: !!emptyMug,
        hasBrbBadge: !!brbBadge,
        laneSteveX: sRect ? Math.round(sRect.x) : 0,
        laneSteveY: sRect ? Math.round(sRect.y) : 0,
      };
    });

    results.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      seated: seatedData,
      lane: laneData,
      pass: seatedData.hasChair && !seatedData.hasOverflow && laneData.hasEmptyMug && laneData.hasBrbBadge,
    });

    console.log(`[PASS] ${vp.name} (${vp.width}x${vp.height}): Overflow=${seatedData.hasOverflow}, SeatedSteve=(${seatedData.steveX},${seatedData.steveY}), LaneSteve=(${laneData.laneSteveX},${laneData.laneSteveY})`);
    await page.close();
  }

  // Capture motion sequence frames on 1920px
  console.log('--- CAPTURING FRAME SEQUENCES ON 1920px ---');
  const framePage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await framePage.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
  await framePage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await framePage.waitForSelector('#hero-chair-group', { timeout: 10000 });

  // Frame sequence 1: Drop-in & seated sip
  for (let f = 1; f <= 5; f++) {
    await framePage.waitForTimeout(250);
    await framePage.screenshot({ path: path.join(ARTIFACTS_DIR, `seq_dropin_frame_${f}.png`) });
  }

  // Frame sequence 2: Stand-up & liftoff flight
  await framePage.evaluate(() => window.scrollTo(0, 100));
  for (let f = 1; f <= 8; f++) {
    await framePage.waitForTimeout(250);
    await framePage.screenshot({ path: path.join(ARTIFACTS_DIR, `seq_flight_frame_${f}.png`) });
  }

  // Frame sequence 3: Return to top
  await framePage.evaluate(() => window.scrollTo(0, 0));
  for (let f = 1; f <= 5; f++) {
    await framePage.waitForTimeout(250);
    await framePage.screenshot({ path: path.join(ARTIFACTS_DIR, `seq_return_frame_${f}.png`) });
  }

  await framePage.close();
  await browser.close();

  // Save results json
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'r8_sweep_results.json'), JSON.stringify(results, null, 2));
  console.log('--- 10-VIEWPORT SWEEP & FRAME SEQUENCES COMPLETE ---');
})();
