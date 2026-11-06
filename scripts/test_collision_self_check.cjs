const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const violations = [];
  page.on('console', async msg => {
    if (msg.text().includes('[ROBOT SELF-CHECK VIOLATION]')) {
      const args = await Promise.all(msg.args().map(a => a.jsonValue().catch(() => '')));
      violations.push(JSON.stringify(args));
    }
  });

  // Navigate with ?robotDebug=1
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll through sections to test walk, jump, idle, and routines
  await page.evaluate(async () => {
    window.scrollTo({ top: 1200, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo({ top: 2500, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo({ top: 6000, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo({ top: 9000, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));
  });

  await page.screenshot({ path: 'src/robot/screenshots_part1/robot_debug_self_check.png' });
  console.log('Self-check test completed.');
  console.log('Total collision violations detected:', violations.length);
  if (violations.length > 0) {
    console.error('Violations:', violations);
  } else {
    console.log('PASSED: Zero limb-torso collisions detected across all poses!');
  }

  await browser.close();
})();
