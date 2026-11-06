const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'src', 'robot', 'screenshots_task6');
const brainDir = 'C:\\Users\\sunny\\.gemini\\antigravity\\brain\\eba93ef0-c7eb-4605-8f49-1acb986cb054';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });

  const widths = [390, 768, 1024, 1440, 1920];
  const heights = { 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };

  for (const w of widths) {
    const h = heights[w];
    console.log(`Testing viewport ${w}x${h}...`);
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Hero shot
    const shotHero = path.join(outDir, `viewport_${w}_hero.png`);
    await page.screenshot({ path: shotHero });

    // Work gallery shot
    await page.evaluate(() => {
      document.getElementById('work')?.scrollIntoView({ behavior: 'auto' });
    });
    await page.waitForTimeout(600);
    const shotWork = path.join(outDir, `viewport_${w}_work.png`);
    await page.screenshot({ path: shotWork });

    // Contact form shot
    await page.evaluate(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'auto' });
    });
    await page.waitForTimeout(600);
    const shotContact = path.join(outDir, `viewport_${w}_contact.png`);
    await page.screenshot({ path: shotContact });

    // Performance paint metrics at 1440
    if (w === 1440) {
      const paintMetrics = await page.evaluate(() => {
        const paints = performance.getEntriesByType('paint');
        const timing = performance.timing;
        return {
          fcp: paints.find(p => p.name === 'first-contentful-paint')?.startTime,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadTime: timing.loadEventEnd - timing.navigationStart
        };
      });
      console.log('Performance Paint Metrics (1440px):', paintMetrics);
    }

    await page.close();
  }

  // Copy screenshots to brain directory
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      const src = path.join(outDir, f);
      const dest = path.join(brainDir, f);
      fs.copyFileSync(src, dest);
    }
  }

  await browser.close();
  console.log('Task 6 multi-viewport verification complete!');
}

run().catch((err) => {
  console.error('Error in Task 6 verification:', err);
  process.exit(1);
});

