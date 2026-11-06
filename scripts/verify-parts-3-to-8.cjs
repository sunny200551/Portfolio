const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });

  // -------------------------------------------------------------------------
  // 1. DESKTOP 1440px VIEWPORT: Test Continuous Travel & Section Placement
  // -------------------------------------------------------------------------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Testing 1440px viewport...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Section 01: Hero - Check Part 5 Hero placement on plain grey floor
  const shotHero = path.join(ARTIFACT_DIR, '01_sec_hero_plain_grey_floor.png');
  await page.screenshot({ path: shotHero });
  console.log('Saved:', shotHero);

  // Section 02: About - BOLT in left safe gutter
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotAbout = path.join(ARTIFACT_DIR, '02_sec_about_left_gutter.png');
  await page.screenshot({ path: shotAbout });
  console.log('Saved:', shotAbout);

  // Section 03: Work - BOLT parked in empty header strip above cards
  await page.evaluate(() => document.getElementById('work')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotWork = path.join(ARTIFACT_DIR, '03_sec_work_header_strip.png');
  await page.screenshot({ path: shotWork });
  console.log('Saved:', shotWork);

  // Section 04: Skills - BOLT in right safe gutter & hover slab reaction
  await page.evaluate(() => document.getElementById('skills')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotSkills = path.join(ARTIFACT_DIR, '04_sec_skills_right_gutter.png');
  await page.screenshot({ path: shotSkills });
  console.log('Saved:', shotSkills);

  // Hover a slab button to trigger BOLT walking into 3D viewport
  const slabBtn = page.locator('#skills button').first();
  if (await slabBtn.count() > 0) {
    await slabBtn.hover();
    await page.waitForTimeout(800);
    const shotSkillsHover = path.join(ARTIFACT_DIR, '04_sec_skills_slab_hover.png');
    await page.screenshot({ path: shotSkillsHover });
    console.log('Saved:', shotSkillsHover);
  }

  // Section 05: GitHub - BOLT in left safe gutter
  await page.evaluate(() => document.getElementById('github')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotGithub = path.join(ARTIFACT_DIR, '05_sec_github_left_gutter.png');
  await page.screenshot({ path: shotGithub });
  console.log('Saved:', shotGithub);

  // Section 06: Stats - BOLT in right safe gutter
  await page.evaluate(() => document.getElementById('stats')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotStats = path.join(ARTIFACT_DIR, '06_sec_stats_right_gutter.png');
  await page.screenshot({ path: shotStats });
  console.log('Saved:', shotStats);

  // Section 07: Events - BOLT in left safe gutter
  await page.evaluate(() => document.getElementById('events')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotEvents = path.join(ARTIFACT_DIR, '07_sec_events_left_gutter.png');
  await page.screenshot({ path: shotEvents });
  console.log('Saved:', shotEvents);

  // Section 08: Journey - BOLT walking along center timeline line
  await page.evaluate(() => document.getElementById('journey')?.scrollIntoView());
  await page.waitForTimeout(1400);
  const shotJourney = path.join(ARTIFACT_DIR, '08_sec_journey_timeline_line.png');
  await page.screenshot({ path: shotJourney });
  console.log('Saved:', shotJourney);

  // Section 09: Contact - BOLT in left safe gutter
  await page.evaluate(() => document.getElementById('contact')?.scrollIntoView());
  await page.waitForTimeout(1200);
  const shotContact = path.join(ARTIFACT_DIR, '09_sec_contact_left_gutter.png');
  await page.screenshot({ path: shotContact });
  console.log('Saved:', shotContact);

  await page.close();

  // -------------------------------------------------------------------------
  // 2. MULTI-VIEWPORT TESTS: 1920, 1280, 1024, 390
  // -------------------------------------------------------------------------
  const viewports = [
    { width: 1920, height: 1080, name: '1920_widescreen' },
    { width: 1280, height: 800, name: '1280_laptop' },
    { width: 1024, height: 768, name: '1024_tablet_landscape' },
    { width: 390, height: 844, name: '390_mobile' }
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport ${vp.width}x${vp.height}...`);
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1500);

    const shotVpHero = path.join(ARTIFACT_DIR, `vp_${vp.name}_hero.png`);
    await p.screenshot({ path: shotVpHero });
    console.log('Saved:', shotVpHero);

    // Scroll down to check docked or gutter placement
    await p.evaluate(() => window.scrollTo(0, 1400));
    await p.waitForTimeout(1000);
    const shotVpScroll = path.join(ARTIFACT_DIR, `vp_${vp.name}_scrolled.png`);
    await p.screenshot({ path: shotVpScroll });
    console.log('Saved:', shotVpScroll);

    await p.close();
  }

  await browser.close();
  console.log('All verification checks complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

