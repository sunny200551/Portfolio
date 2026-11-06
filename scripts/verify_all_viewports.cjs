const { chromium } = require('playwright-core');
const path = require('path');

const VIEWPORTS = [
  { width: 1920, height: 1080, name: '1920_widescreen' },
  { width: 1440, height: 900, name: '1440_desktop' },
  { width: 1280, height: 800, name: '1280_laptop' },
  { width: 390, height: 844, name: '390_mobile' },
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 1. Hero screenshot
    await page.screenshot({
      path: path.join('src/robot/screenshots', `verify_${vp.name}_hero.png`),
      clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
    });
    console.log(`Saved Hero screenshot for ${vp.name}`);

    // 2. Scroll to Skills (#skills)
    const skillsEl = await page.$('#skills');
    if (skillsEl) {
      await skillsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join('src/robot/screenshots', `verify_${vp.name}_skills.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
      });
      console.log(`Saved Skills screenshot for ${vp.name}`);
    }

    // 3. Scroll to GitHub Commit Skyline (#github)
    const githubEl = await page.$('#github');
    if (githubEl) {
      await githubEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join('src/robot/screenshots', `verify_${vp.name}_github.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
      });
      console.log(`Saved GitHub screenshot for ${vp.name}`);
    }

    // 4. Scroll to Contact (#contact)
    const contactEl = await page.$('#contact');
    if (contactEl) {
      await contactEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join('src/robot/screenshots', `verify_${vp.name}_contact.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) },
      });
      console.log(`Saved Contact screenshot for ${vp.name}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('All viewport verifications completed successfully!');
})();
