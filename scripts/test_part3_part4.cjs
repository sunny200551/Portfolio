const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { name: '1920', width: 1920, height: 1080 },
    { name: '1440', width: 1440, height: 900 },
    { name: '1345', width: 1345, height: 800 },
    { name: '390', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => sessionStorage.setItem('sp_loader_seen', '1'));
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#hero-chair-group', { timeout: 10000 });
    
    // Wait for initial drop-in & greeting bubble
    await page.waitForTimeout(1600);

    // Verify Part 3 elements
    const part3Checks = await page.evaluate(() => {
      const chair = document.querySelector('#hero-chair-group');
      const seatAnchor = document.querySelector('#steve-seat');
      const floorAnchor = document.querySelector('#steve-floor');
      const bubble = document.querySelector('[data-testid="steve-speech-bubble"]');
      const bubbleText = bubble ? bubble.textContent : '';
      const steve = document.querySelector('#robot-steve-container');
      const steveRect = steve ? steve.getBoundingClientRect() : null;

      return {
        hasChair: !!chair,
        hasSeatAnchor: !!seatAnchor,
        hasFloorAnchor: !!floorAnchor,
        hasSpeechBubble: !!bubble,
        bubbleText: bubbleText,
        steveWidth: steveRect ? Math.round(steveRect.width) : 0,
        steveHeight: steveRect ? Math.round(steveRect.height) : 0,
        steveX: steveRect ? Math.round(steveRect.x) : 0,
        steveY: steveRect ? Math.round(steveRect.y) : 0,
      };
    });

    console.log(`Viewport ${vp.name}px Part 3 (Seated):`, JSON.stringify(part3Checks));

    // Capture seated screenshot
    const seatedShot = path.join(ARTIFACTS_DIR, `part3_seated_${vp.name}.png`);
    await page.screenshot({ path: seatedShot });
    console.log(`Saved screenshot: ${seatedShot}`);

    // If 1920px, test chair click spin
    if (vp.name === '1920') {
      await page.click('#hero-chair-group');
      await page.waitForTimeout(400);
      console.log('Tested chair spin click');
    }

    // Now test Part 4: Stand up & Flight by scrolling > 40px
    await page.evaluate(() => window.scrollTo(0, 100));
    // Wait for liftoff sequence to transition into flight and land in lane (~2.2s)
    await page.waitForTimeout(2400);

    const part4Checks = await page.evaluate(() => {
      const emptyMug = document.querySelector('#chair-steaming-mug');
      const brbBadge = document.querySelector('#chair-brb-badge');
      const steve = document.querySelector('#robot-steve-container');
      const steveRect = steve ? steve.getBoundingClientRect() : null;

      return {
        hasEmptyMug: !!emptyMug,
        hasBrbBadge: !!brbBadge,
        laneSteveX: steveRect ? Math.round(steveRect.x) : 0,
        laneSteveY: steveRect ? Math.round(steveRect.y) : 0,
      };
    });

    console.log(`Viewport ${vp.name}px Part 4 (Flight & Lane):`, JSON.stringify(part4Checks));

    // Capture post-flight screenshot showing empty chair + BRB note in hero & Steve in lane
    const flightShot = path.join(ARTIFACTS_DIR, `part4_empty_chair_${vp.name}.png`);
    await page.screenshot({ path: flightShot });
    console.log(`Saved screenshot: ${flightShot}`);

    // Test return-to-top fly back
    if (vp.name === '1920') {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1400);
      const returnedChecks = await page.evaluate(() => {
        const bubble = document.querySelector('[data-testid="steve-speech-bubble"]');
        return {
          bubbleText: bubble ? bubble.textContent : '',
        };
      });
      console.log('Return to top greeting:', returnedChecks);
    }

    await page.close();
  }

  await browser.close();
  console.log('Part 3 & Part 4 verification completed successfully!');
})();
