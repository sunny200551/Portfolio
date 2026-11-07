import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  console.log('=== Running Precise 20x Return to Top Test ===');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const methods = ['scrollWheel', 'backToTopBtn', 'railItem01', 'homeKey', 'programmaticZero'];
  const results = [];

  for (let i = 1; i <= 20; i++) {
    const method = methods[(i - 1) % methods.length];

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    // Trigger return to top
    if (method === 'scrollWheel') {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    } else if (method === 'backToTopBtn') {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('BACK TO TOP'));
        if (btn) btn.click();
        else window.scrollTo(0, 0);
      });
      // Wait for smooth scroll to finish
      await page.waitForFunction(() => window.scrollY < 100, { timeout: 3000 }).catch(() => {});
    } else if (method === 'railItem01') {
      await page.evaluate(() => {
        const item01 = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('01') || b.textContent?.includes('HOME'));
        if (item01) item01.click();
        else window.scrollTo(0, 0);
      });
      await page.waitForFunction(() => window.scrollY < 100, { timeout: 3000 }).catch(() => {});
    } else if (method === 'homeKey') {
      await page.keyboard.press('Home');
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // Ensure at top
    await page.waitForFunction(() => window.scrollY < 50, { timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(400);

    // Check canvas status
    const status = await page.evaluate(() => {
      const hero = document.getElementById('home');
      const canvas = hero?.querySelector('canvas');
      const rect = canvas?.getBoundingClientRect();
      const inView = rect && rect.width > 300 && rect.height > 300 && rect.top >= -50 && rect.bottom > 200;
      return {
        hasCanvas: !!canvas,
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
        inView: !!inView,
      };
    });

    results.push({ run: i, method, ...status });
    console.log(`Run ${i} (${method}): hasCanvas=${status.hasCanvas}, size=${status.width}x${status.height}, inView=${status.inView}`);
  }

  const passed = results.filter(r => r.inView).length;
  console.log(`\nFinal Return-to-Top Result: ${passed}/20 passed!`);

  await page.close();
  await browser.close();
}

run().catch(console.error);

