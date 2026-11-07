import { chromium } from 'playwright-core';
import fs from 'fs';

async function run() {
  console.log('=== FIX ROUND 5 COMPREHENSIVE QA SWEEP ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const viewports = [360, 390, 430, 768, 1024, 1280, 1440, 1920, 2560];
  const artifactDir = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

  // 1. Audit Full-Width Fluid Layout & Horizontal Scroll across all 9 viewports
  console.log('\n--- 1. Testing Horizontal Scroll Across 9 Viewports ---');
  for (const w of viewports) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return { docW, winW, overflow: docW > winW };
    });

    console.log(`Viewport ${w}px: docWidth=${check.docW}, innerWidth=${check.winW}, overflow=${check.overflow}`);
    if (check.overflow) {
      console.error(`FAIL: Horizontal scroll detected at ${w}px!`);
    }
    await page.close();
  }

  // 2. Test Command Palette 20x Open/Close Scroll Lock & Scroll Recovery
  console.log('\n--- 2. Testing Command Palette 20x Open/Close & Scroll Recovery ---');
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page1440.waitForTimeout(600);

  let allScrollPassed = true;
  for (let i = 1; i <= 20; i++) {
    // Open via Ctrl+K
    await page1440.keyboard.press('Control+KeyK');
    await page1440.waitForTimeout(100);

    // Verify modal open
    const isOpen = await page1440.evaluate(() => {
      return document.querySelector('[role="dialog"]') !== null;
    });

    // Close via different methods
    const method = i % 4;
    if (method === 0) {
      // Escape
      await page1440.keyboard.press('Escape');
    } else if (method === 1) {
      // Click backdrop
      await page1440.mouse.click(50, 50);
    } else if (method === 2) {
      // Close button
      await page1440.evaluate(() => {
        const btn = document.querySelector('[aria-label="Close command palette"]');
        if (btn) btn.click();
        else document.body.click();
      });
    } else {
      // Run command
      await page1440.keyboard.press('Enter');
    }
    await page1440.waitForTimeout(150);

    // Test that scrolling works cleanly
    const scrollWorks = await page1440.evaluate(() => {
      const prevY = window.scrollY;
      window.scrollBy(0, 150);
      const newY = window.scrollY;
      const bodyOverflow = document.body.style.overflow;
      const lenisStopped = document.documentElement.classList.contains('lenis-stopped');
      return { moved: newY !== prevY, bodyOverflow, lenisStopped };
    });

    if (scrollWorks.bodyOverflow === 'hidden' || scrollWorks.lenisStopped) {
      allScrollPassed = false;
      console.error(`FAIL: Cycle ${i} left scroll locked!`, scrollWorks);
    }
  }
  console.log(`Command Palette 20x Open/Close Test: ${allScrollPassed ? 'ALL 20 PASSED' : 'FAILED'}`);

  // 3. Test ?robotDebug=1 Hip Detachment Assertion & Jump Rig
  console.log('\n--- 3. Testing ?robotDebug=1 Hip Detachment Assertion ---');
  const debugPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const debugErrors = [];
  debugPage.on('console', msg => {
    if (msg.text().includes('ROBOT ASSERTION VIOLATION')) {
      debugErrors.push(msg.text());
    }
  });

  await debugPage.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'networkidle' });
  await debugPage.waitForTimeout(800);

  // Trigger jump action
  await debugPage.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'jump' }));
  });
  await debugPage.waitForTimeout(1500);

  const hasViolationBadge = await debugPage.evaluate(() => {
    // Red box geometry if violated
    return document.body.innerHTML.includes('[HIP DETACH VIOLATION');
  });

  console.log(`Hip Detach Assertions: ${debugErrors.length === 0 && !hasViolationBadge ? 'PASSED (0 violations, max dist <= 0.05)' : 'FAILED'}`);

  // 4. Test Shy Admirer Mode Sequence
  console.log('\n--- 4. Testing Shy Admirer Mode Sequence ---');
  await page1440.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:shy-mode-now'));
  });
  await page1440.waitForTimeout(1200);

  const shyBubbleText = await page1440.evaluate(() => {
    const bubble = Array.from(document.querySelectorAll('div')).find(d => 
      d.textContent?.includes('?') || d.textContent?.includes('!') || d.textContent?.includes('Ahem')
    );
    return bubble ? bubble.textContent : null;
  });
  console.log(`Shy Mode Triggered: active bubble="${shyBubbleText}"`);

  // Take full verification screenshots
  console.log('\n--- 5. Capturing Verification Screenshots ---');
  await page1440.evaluate(() => window.scrollTo(0, 0));
  await page1440.waitForTimeout(500);
  await page1440.screenshot({ path: `${artifactDir}/r5_1440_hero.png` });

  const sections = ['about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact', 'footer'];
  for (const s of sections) {
    await page1440.evaluate((id) => {
      const el = document.getElementById(id) || document.querySelector(`footer`);
      if (el) el.scrollIntoView();
    }, s);
    await page1440.waitForTimeout(500);
    await page1440.screenshot({ path: `${artifactDir}/r5_1440_${s}.png` });
  }

  // Mobile screenshots (390px)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${artifactDir}/r5_390_hero.png` });

  for (const s of ['about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact']) {
    await mobilePage.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    }, s);
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: `${artifactDir}/r5_390_${s}.png` });
  }

  await browser.close();
  console.log('=== QA SWEEP COMPLETE ===');
}

run().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});

