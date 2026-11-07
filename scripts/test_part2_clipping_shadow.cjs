const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  const container = await page.waitForSelector('#robot-steve-container', { timeout: 10000 });
  if (!container) {
    console.error('ERROR: robot-steve-container not found');
    await browser.close();
    process.exit(1);
  }

  const box = await container.boundingBox();
  console.log('Robot container box:', box);

  const poses = ['wave', 'jump', 'cheer', 'salute', 'dance', 'idle'];
  let allPass = true;

  for (const pose of poses) {
    // Set Steve's anim and expr via window.__ROBOT_STORE__
    await page.evaluate((p) => {
      window.__ROBOT_STORE__.setSteve(p, 'happy');
    }, pose);

    if (pose === 'jump') {
      // Wait for jump apex
      await page.waitForTimeout(500);
    } else {
      await page.waitForTimeout(300);
    }

    const shotPath = `C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/part2_pose_${pose}.png`;
    await container.screenshot({ path: shotPath });
    console.log(`Saved screenshot of pose [${pose}] to ${shotPath}`);

    // Test 2px edge frame transparency on canvas
    const edgeTransparency = await page.evaluate(() => {
      const canvas = document.querySelector('#robot-steve-container canvas');
      if (!canvas) return { ok: false, reason: 'Canvas not found' };
      
      // Create a 2D canvas to inspect rendered pixels
      const testCanvas = document.createElement('canvas');
      testCanvas.width = canvas.width;
      testCanvas.height = canvas.height;
      const ctx = testCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0);

      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Check outermost 2px frame: top 2 rows, bottom 2 rows, left 2 cols, right 2 cols
      let nonTransparentCount = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const isEdge = (x < 2 || x >= w - 2 || y < 2 || y >= h - 2);
          if (isEdge) {
            const idx = (y * w + x) * 4;
            const alpha = data[idx + 3];
            if (alpha > 5) { // Any non-transparent pixel
              nonTransparentCount++;
            }
          }
        }
      }

      return {
        ok: nonTransparentCount === 0,
        nonTransparentCount,
        w,
        h,
      };
    });

    console.log(`Pose [${pose}] 2px edge frame transparency:`, edgeTransparency);
    if (!edgeTransparency.ok && edgeTransparency.nonTransparentCount > 0) {
      allPass = false;
    }
  }

  // Also verify that the external blurred div is GONE
  const hasExternalDivShadow = await page.evaluate(() => {
    const el = document.querySelector('#robot-steve-container .rounded-full');
    return !!el;
  });
  console.log('External DOM div shadow exists:', hasExternalDivShadow, '(Should be false)');

  // Verify right-lane position clearance from rail
  const rightLaneClearance = await page.evaluate(() => {
    window.__ROBOT_STORE__.setActiveSection('skills');
    const container = document.querySelector('#robot-steve-container');
    const rect = container.getBoundingClientRect();
    const rail = document.querySelector('.nav-rail');
    const railRect = rail ? rail.getBoundingClientRect() : null;
    return {
      steveRight: rect.right,
      windowWidth: window.innerWidth,
      railLeft: railRect ? railRect.left : null,
      clearance: railRect ? railRect.left - rect.right : null
    };
  });
  console.log('Right lane clearance from rail:', rightLaneClearance);

  await browser.close();
  console.log('PART 2 TESTS FINISHED. allPass =', allPass && !hasExternalDivShadow);
})();
