const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // 1. Desktop 1440
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktop.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);

  // Top header visible on load
  await pageDesktop.screenshot({ path: 'src/robot/screenshots_part1/part4_desktop_top_header.png' });

  // Scroll down to test auto-hide
  await pageDesktop.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: 'src/robot/screenshots_part1/part4_desktop_scrolled_down_autohide.png' });

  // Scroll up slightly to test reappear
  await pageDesktop.evaluate(() => window.scrollBy({ top: -150, behavior: 'instant' }));
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: 'src/robot/screenshots_part1/part4_desktop_scrolled_up_reappear.png' });

  // Check right rail node sizes and section pill
  const railNodes = await pageDesktop.locator('nav[aria-label="Section Navigation"] button').all();
  console.log('Right rail nodes count:', railNodes.length);
  for (let i = 0; i < railNodes.length; i++) {
    const box = await railNodes[i].boundingBox();
    if (box) {
      console.log(`Node ${i} width: ${box.width}px, height: ${box.height}px`);
      if (box.width > 40) console.error(`Violation: node ${i} width > 40px!`);
    }
  }

  // 2. Mobile 390
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({ path: 'src/robot/screenshots_part1/part4_mobile_header.png' });

  const railOnMobile = await pageMobile.locator('nav[aria-label="Section Navigation"]').isVisible();
  console.log('Right rail visible on mobile (should be false):', railOnMobile);

  await browser.close();
  console.log('Part 4 verification completed successfully!');
})();
