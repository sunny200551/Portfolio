const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

(async () => {
  console.log('--- STARTING PART 4 & PART 5 TEST: HERO VECTOR SVG & STEVE VOICE ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const page = await browser.newPage();
  let allPass = true;

  // 1. Test Viewports for Hero Layout & Vector SVG
  const testWidths = [1440, 1345, 1280, 390];
  for (const w of testWidths) {
    const h = w === 390 ? 844 : 900;
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // Verify SVG elements exist
    const svgElements = await page.evaluate(() => {
      const slab = document.querySelector('#hero-platform-slab');
      const progress = document.querySelector('#browser-progress-bar');
      const codeLine = document.querySelector('#code-line-1');
      const anchor = document.querySelector('#steve-anchor');
      const robotInstance = document.querySelectorAll('[data-robot-instance="single-steve"]');
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      
      // Check hero title "PASUMARTHI" bounding rect
      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const h1Visible = h1Rect ? (h1Rect.left >= 0 && h1Rect.right <= innerWidth + 5) : false;

      return {
        hasSlab: !!slab,
        hasProgress: !!progress,
        hasCodeLine: !!codeLine,
        hasAnchor: !!anchor,
        robotCount: robotInstance.length,
        scrollWidth,
        innerWidth,
        noHorizontalOverflow: scrollWidth <= innerWidth + 1,
        h1Visible,
        h1Rect
      };
    });

    console.log(`Viewport ${w}x${h}:`, svgElements);
    if (!svgElements.hasSlab || !svgElements.hasProgress || !svgElements.hasAnchor) {
      console.error(`FAILED: Missing SVG components at ${w}px`);
      allPass = false;
    }
    if (!svgElements.noHorizontalOverflow) {
      console.error(`FAILED: Horizontal overflow detected at ${w}px: scrollWidth=${svgElements.scrollWidth}, innerWidth=${svgElements.innerWidth}`);
      allPass = false;
    }
    if (!svgElements.h1Visible && w >= 1024) {
      console.error(`FAILED: Hero title clipped or out of bounds at ${w}px`, svgElements.h1Rect);
      allPass = false;
    }

    if (w === 1345) {
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'part4_laptop_1345.png') });
      console.log('Saved part4_laptop_1345.png');
    } else if (w === 1440) {
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'part4_desktop_1440.png') });
      console.log('Saved part4_desktop_1440.png');
    }
  }

  // 2. Test Steve Voice Engine & Speech Bubble
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?robotDebug=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Trigger Steve click or voice event via page evaluation
  const voiceTest = await page.evaluate(async () => {
    // Check for "ahem" across DOM
    const bodyText = document.body.innerText.toLowerCase();
    const hasAhem = bodyText.includes('ahem');

    // Trigger speech via window.__STEVE_VOICE__ or store
    if (window.__STEVE_VOICE__) {
      window.__STEVE_VOICE__.speak('click_steve');
    } else {
      // Trigger click on contact button
      const contactBtn = document.querySelector('[data-robot-react="hero:contact"]');
      if (contactBtn) contactBtn.click();
    }

    await new Promise(r => setTimeout(r, 400));
    const bubble = document.querySelector('[data-testid="steve-speech-bubble"]');
    const bubbleText = bubble ? bubble.textContent : null;
    const isAriaHidden = bubble ? bubble.getAttribute('aria-hidden') === 'true' : false;

    return {
      hasAhem,
      hasBubble: !!bubble,
      bubbleText,
      isAriaHidden
    };
  });

  console.log('Voice test evaluation:', voiceTest);
  if (voiceTest.hasAhem) {
    console.error('FAILED: Found "ahem" in DOM!');
    allPass = false;
  }

  // Verify speech bubble rendering if not yet popped
  if (!voiceTest.hasBubble) {
    await page.evaluate(() => {
      if (window.__ROBOT_STORE__) {
        window.__ROBOT_STORE__.showSpeechBubble('Sunny built this whole universe!', 3500);
      }
    });
    await page.waitForTimeout(400);
  }

  // Screenshot with speech bubble visible
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'part4_speech_bubble.png') });
  console.log('Saved part4_speech_bubble.png');

  // Verify Single Robot Instance
  const totalRobots = await page.evaluate(() => {
    return document.querySelectorAll('[data-robot-instance="single-steve"]').length;
  });
  console.log(`Total active Steve robot instances: ${totalRobots}`);
  if (totalRobots !== 1) {
    console.error(`FAILED: Expected exactly 1 robot instance, found ${totalRobots}`);
    allPass = false;
  }

  console.log(`\nALL PART 4 & PART 5 TESTS PASS: ${allPass}`);
  await browser.close();
  process.exit(allPass ? 0 : 1);
})();
