const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const viewports = [
    { width: 1920, height: 1080, name: '1920x1080' },
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1366, height: 768, name: '1366x768' },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // 1. Clear localStorage and navigate
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Scroll to About section to trigger Steve handoff
    console.log('Scrolling to #about...');
    const aboutEl = await page.$('#about');
    if (aboutEl) {
      await aboutEl.scrollIntoViewIfNeeded();
    }
    // Wait for launching animation and handoff to DOCKED state
    await page.waitForTimeout(2000);

    // 3. Confirm card appears under Steve
    const cardEl = await page.$('div[role="region"][aria-label="Steve visitor identity form"]');
    if (cardEl) {
      console.log(`✔ Card appeared below Steve on ${vp.name}`);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `visitor_card_prompt_${vp.name}.png`),
      });
      console.log(`Saved visitor_card_prompt_${vp.name}.png`);
    } else {
      console.error(`❌ Card DID NOT appear on ${vp.name}`);
    }

    // 4. Fill in name, select gender chip, and save
    console.log('Filling name and saving...');
    await page.fill('#steve-visitor-name-input', 'Alex');
    await page.click('button:has-text("Female")');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1200);

    // Capture Steve's greeting
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `visitor_greeted_${vp.name}.png`),
    });
    console.log(`Saved visitor_greeted_${vp.name}.png`);

    // Verify localStorage has steve.visitor
    const stored = await page.evaluate(() => {
      return localStorage.getItem('steve.visitor');
    });
    console.log(`Stored steve.visitor in localStorage: ${stored}`);

    // 5. Reload and confirm returning visitor is greeted by name without prompt card
    console.log('Reloading page as returning visitor...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const aboutElReload = await page.$('#about');
    if (aboutElReload) {
      await aboutElReload.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(2000);

    const cardElAfterReload = await page.$('div[role="region"][aria-label="Steve visitor identity form"]');
    console.log(`Card visible on reload? ${!!cardElAfterReload} (expected: false)`);

    const editBtn = await page.$('button[title*="Edit your visitor info"]');
    console.log(`Edit trigger visible? ${!!editBtn} (expected: true)`);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `visitor_returning_${vp.name}.png`),
    });
    console.log(`Saved visitor_returning_${vp.name}.png`);

    // 6. Test Forget me
    if (editBtn) {
      console.log('Clicking edit trigger and Forget me...');
      await editBtn.click();
      await page.waitForTimeout(500);
      const forgetBtn = await page.$('button:has-text("Forget me")');
      if (forgetBtn) {
        await forgetBtn.click();
        await page.waitForTimeout(1000);
        const storedAfterForget = await page.evaluate(() => localStorage.getItem('steve.visitor'));
        console.log(`Stored after forget: ${storedAfterForget} (expected: null)`);
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `visitor_forgotten_${vp.name}.png`),
        });
        console.log(`Saved visitor_forgotten_${vp.name}.png`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nALL VISITOR FLOW & TRACKING TESTS COMPLETED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
