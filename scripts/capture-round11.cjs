const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const viewports = [
    { width: 1920, height: 1080, name: '1920_desktop' },
    { width: 1280, height: 800, name: '1280_laptop' },
    { width: 390, height: 844, name: '390_mobile' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 1. Journey section
    const journeyEl = await page.$('#journey');
    if (journeyEl) {
      await journeyEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `round11_journey_${vp.name}.png`),
      });
      console.log(`Saved round11_journey_${vp.name}.png`);
    }

    // 2. Internship section (ongoing badge + collapsed accordion)
    const internEl = await page.$('#internship');
    if (internEl) {
      await internEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `round11_internship_collapsed_${vp.name}.png`),
      });
      console.log(`Saved round11_internship_collapsed_${vp.name}.png`);

      // 3. Expand accordion row
      const firstAccordionBtn = await page.$('button[id^="internship-header-"]');
      if (firstAccordionBtn) {
        await firstAccordionBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `round11_internship_expanded_${vp.name}.png`),
        });
        console.log(`Saved round11_internship_expanded_${vp.name}.png`);
      }
    }

    // 4. Steve speech bubble trigger (click Steve or dispatch event)
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('steve:say', {
          detail: {
            text: 'Leading frontend architecture, Web3 product development, UI/UX and marketing for a decentralized freelancing platform built on Polygon with smart contracts and responsive interfaces.',
            duration: 8000,
          },
        })
      );
    });

    // Wait slightly to capture mid-reveal or finished
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `round11_steve_bubble_midreveal_${vp.name}.png`),
    });
    console.log(`Saved round11_steve_bubble_midreveal_${vp.name}.png`);

    // Wait to finish first page reveal
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `round11_steve_bubble_page1_${vp.name}.png`),
    });
    console.log(`Saved round11_steve_bubble_page1_${vp.name}.png`);

    await page.close();
  }

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
