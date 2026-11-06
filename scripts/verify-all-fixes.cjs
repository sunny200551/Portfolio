const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleLogs = [];
  const pageErrors = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. Hero verification screenshot
  await page.screenshot({ path: 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/fix_01_hero_robots.png' });
  console.log('Captured fix_01_hero_robots.png');

  // 2. Scroll to GitHub section
  const githubSection = await page.$('#github');
  if (githubSection) {
    await githubSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/fix_02_github_skyline.png' });
    console.log('Captured fix_02_github_skyline.png');
  }

  // 3. Scroll to Events section and open a ticket modal
  const eventsSection = await page.$('#events');
  if (eventsSection) {
    await eventsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Click on a ticket or event button to open modal
    const eventCard = await page.$('#events [role="button"], #events button');
    if (eventCard) {
      await eventCard.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054/fix_03_events_modal.png' });
      console.log('Captured fix_03_events_modal.png');

      // Test Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  // 4. Report logs
  console.log('PAGE ERRORS:', pageErrors);
  const criticalLogs = consoleLogs.filter(l => l.type === 'error' || l.text.includes('RangeError') || l.text.includes('monospace'));
  console.log('CRITICAL LOGS (should be empty):', criticalLogs);

  const deprecationLogs = consoleLogs.filter(l => l.text.includes('deprecated'));
  console.log('DEPRECATION LOGS (THREE.Clock from dependencies):', deprecationLogs.map(l => l.text));

  await browser.close();
})();

