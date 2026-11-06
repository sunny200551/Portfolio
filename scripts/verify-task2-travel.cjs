const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'src', 'robot', 'screenshots_task2');
const brainDir = 'C:\\Users\\sunny\\.gemini\\antigravity\\brain\\eba93ef0-c7eb-4605-8f49-1acb986cb054';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });

  const sections = [
    { id: 'home', num: '01' },
    { id: 'about', num: '02' },
    { id: 'work', num: '03' },
    { id: 'design', num: '04' },
    { id: 'skills', num: '05' },
    { id: 'github', num: '06' },
    { id: 'stats', num: '07' },
    { id: 'events', num: '08' },
    { id: 'journey', num: '09' },
    { id: 'contact', num: '10' }
  ];

  // 1. Verify 1440x900 Desktop Viewport across all 10 sections
  console.log('Testing 1440px desktop viewport across all 10 sections...');
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page1440.waitForTimeout(2000);

  for (const sec of sections) {
    console.log(`Scrolling to Section ${sec.num} (#${sec.id})...`);
    await page1440.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'auto' });
    }, sec.id);

    // Wait for flight arc to complete and routine to trigger
    await page1440.waitForTimeout(900);

    const shotName = `travel_1440_sec_${sec.num}_${sec.id}.png`;
    const shotPath = path.join(outDir, shotName);
    await page1440.screenshot({ path: shotPath });
    console.log(`Captured: ${shotName}`);
  }

  // Verify fast scroll dizzy reaction
  console.log('Testing fast scroll dizzy reaction...');
  await page1440.evaluate(() => {
    window.scrollBy({ top: -800, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });
  await page1440.waitForTimeout(60);
  const dizzyPath = path.join(outDir, 'travel_1440_fast_scroll_dizzy.png');
  await page1440.screenshot({ path: dizzyPath });
  console.log('Captured: travel_1440_fast_scroll_dizzy.png');

  // Verify scroll back to hero: NUT and CHIP welcome BOLT
  console.log('Testing scroll back to Hero (#home)...');
  await page1440.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
  await page1440.waitForTimeout(1000);
  const homeReturnPath = path.join(outDir, 'travel_1440_return_to_hero.png');
  await page1440.screenshot({ path: homeReturnPath });
  console.log('Captured: travel_1440_return_to_hero.png');
  await page1440.close();

  // 2. Verify 1024x768 Viewport (Compact layout, docked corner)
  console.log('Testing 1024px viewport (docked corner)...');
  const page1024 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page1024.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page1024.waitForTimeout(1500);

  // Scroll to #skills
  await page1024.evaluate(() => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'auto' });
  });
  await page1024.waitForTimeout(900);
  const shot1024 = path.join(outDir, 'travel_1024_docked_corner_skills.png');
  await page1024.screenshot({ path: shot1024 });
  console.log('Captured: travel_1024_docked_corner_skills.png');
  await page1024.close();

  // 3. Verify 390x844 Mobile Viewport (iPhone / mobile docked corner)
  console.log('Testing 390px mobile viewport (docked corner)...');
  const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page390.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page390.waitForTimeout(1500);

  // Home on mobile
  const shot390Home = path.join(outDir, 'travel_390_mobile_home.png');
  await page390.screenshot({ path: shot390Home });
  console.log('Captured: travel_390_mobile_home.png');

  // Scroll to #about
  await page390.evaluate(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'auto' });
  });
  await page390.waitForTimeout(900);
  const shot390About = path.join(outDir, 'travel_390_mobile_docked_about.png');
  await page390.screenshot({ path: shot390About });
  console.log('Captured: travel_390_mobile_docked_about.png');

  // Scroll to #contact
  await page390.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'auto' });
  });
  await page390.waitForTimeout(900);
  const shot390Contact = path.join(outDir, 'travel_390_mobile_docked_contact.png');
  await page390.screenshot({ path: shot390Contact });
  console.log('Captured: travel_390_mobile_docked_contact.png');
  await page390.close();

  await browser.close();

  // Copy all captured screenshots to artifact directory for presentation
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(outDir, f), path.join(brainDir, f));
    }
  }
  console.log('Successfully copied all Task 2 verification screenshots to brain directory!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

