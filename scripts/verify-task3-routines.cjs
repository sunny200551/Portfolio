const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'src', 'robot', 'screenshots_task3');
const brainDir = 'C:\\Users\\sunny\\.gemini\antigravity\\brain\\eba93ef0-c7eb-4605-8f49-1acb986cb054';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. HOME ROUTINE
  console.log('Testing 01 // HOME Routine (Waving & mini robots playing)...');
  const shotHome = path.join(outDir, '01_home_routine_idle_mini_robots.png');
  await page.screenshot({ path: shotHome });
  console.log('Captured: 01_home_routine_idle_mini_robots.png');

  // 2. ABOUT ROUTINE
  console.log('Testing 02 // ABOUT Routine (Stat boxes & grad year glitch)...');
  await page.evaluate(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // BOLT sits on top of stat boxes
  const shotAboutLand = path.join(outDir, '02_about_routine_bolt_on_stats.png');
  await page.screenshot({ path: shotAboutLand });
  console.log('Captured: 02_about_routine_bolt_on_stats.png');

  // Glitch stage: 864 -> confused
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'confused' }));
  });
  await page.waitForTimeout(400);
  const shotAboutGlitch = path.join(outDir, '02_about_routine_grad_year_864_confused.png');
  await page.screenshot({ path: shotAboutGlitch });
  console.log('Captured: 02_about_routine_grad_year_864_confused.png');

  // Facepalm stage
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'facepalm' }));
  });
  await page.waitForTimeout(400);
  const shotAboutFacepalm = path.join(outDir, '02_about_routine_facepalm.png');
  await page.screenshot({ path: shotAboutFacepalm });
  console.log('Captured: 02_about_routine_facepalm.png');

  // Settle on 2027 -> thumbs-up / cheer
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'cheer' }));
  });
  await page.waitForTimeout(400);
  const shotAboutCheer = path.join(outDir, '02_about_routine_settled_2027_cheer.png');
  await page.screenshot({ path: shotAboutCheer });
  console.log('Captured: 02_about_routine_settled_2027_cheer.png');

  // 3. WORK ROUTINE
  console.log('Testing 03 // WORK Routine (Skateboard & card peeking/shrug)...');
  await page.evaluate(() => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // BOLT with skateboard
  const shotWorkSkate = path.join(outDir, '03_work_routine_skateboard.png');
  await page.screenshot({ path: shotWorkSkate });
  console.log('Captured: 03_work_routine_skateboard.png');

  // Hover first project card (has "screenshot pending") -> BOLT shrugs
  console.log('Hovering project card with pending screenshot (BOLT shrugs)...');
  await page.evaluate(() => {
    const card = document.querySelector('#work .flex-shrink-0');
    if (card) {
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await page.waitForTimeout(600);
  const shotWorkShrug = path.join(outDir, '03_work_routine_card_hover_shrug.png');
  await page.screenshot({ path: shotWorkShrug });
  console.log('Captured: 03_work_routine_card_hover_shrug.png');

  // 4. DESIGN ROUTINE
  console.log('Testing 04 // DESIGN Routine (Four-stage methodology & Figma accessories)...');
  await page.evaluate(() => {
    document.getElementById('design')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // Stage 01: Research (Figma cursor + ruler)
  const shotDesignResearch = path.join(outDir, '04_design_routine_01_research_ruler.png');
  await page.screenshot({ path: shotDesignResearch });
  console.log('Captured: 04_design_routine_01_research_ruler.png');

  // Stage 02: Wireframe (Dashed box in air)
  console.log('Activating Wireframe stage (dashed box)...');
  await page.evaluate(() => {
    const card = document.getElementById('stage-wireframe');
    if (card) {
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      card.click();
    }
  });
  await page.waitForTimeout(700);
  const shotDesignWireframe = path.join(outDir, '04_design_routine_02_wireframe_dashed_box.png');
  await page.screenshot({ path: shotDesignWireframe });
  console.log('Captured: 04_design_routine_02_wireframe_dashed_box.png');

  // Stage 03: Prototype (Figma cursor click)
  console.log('Activating Prototype stage (Figma cursor click)...');
  await page.evaluate(() => {
    const card = document.getElementById('stage-prototype');
    if (card) {
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      card.click();
    }
  });
  await page.waitForTimeout(700);
  const shotDesignPrototype = path.join(outDir, '04_design_routine_03_prototype_cursor_click.png');
  await page.screenshot({ path: shotDesignPrototype });
  console.log('Captured: 04_design_routine_03_prototype_cursor_click.png');

  // Stage 04: Build (Mini mechanical keyboard)
  console.log('Activating Build stage (Mini keyboard typing)...');
  await page.evaluate(() => {
    const card = document.getElementById('stage-build');
    if (card) {
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      card.click();
    }
  });
  await page.waitForTimeout(700);
  const shotDesignBuild = path.join(outDir, '04_design_routine_04_build_keyboard_typing.png');
  await page.screenshot({ path: shotDesignBuild });
  console.log('Captured: 04_design_routine_04_build_keyboard_typing.png');

  // 5. SKILLS ROUTINE
  console.log('Testing 05 // SKILLS Routine (Stair climbing & slab hover dance)...');
  await page.evaluate(() => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // Climbing stairs
  const shotSkillsClimb = path.join(outDir, '05_skills_routine_climbing_stairs.png');
  await page.screenshot({ path: shotSkillsClimb });
  console.log('Captured: 05_skills_routine_climbing_stairs.png');

  // Hover a slab button -> BOLT hops on slab and dances
  console.log('Hovering a slab block (BOLT jumps on slab and dances)...');
  await page.evaluate(() => {
    const slabBtn = document.querySelector('#skills button');
    if (slabBtn) {
      slabBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await page.waitForTimeout(800);
  const shotSkillsDance = path.join(outDir, '05_skills_routine_slab_dance.png');
  await page.screenshot({ path: shotSkillsDance });
  console.log('Captured: 05_skills_routine_slab_dance.png');

  // 6. INTERRUPTIBILITY TEST: Scroll away immediately to #contact
  console.log('Testing Interruptibility: scrolling rapidly away to #contact...');
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(800);
  const shotInterrupt = path.join(outDir, '06_routine_clean_interruption_contact.png');
  await page.screenshot({ path: shotInterrupt });
  console.log('Captured: 06_routine_clean_interruption_contact.png');

  await page.close();
  await browser.close();

  // Copy screenshots to brain directory for presentation
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(outDir, f), path.join(brainDir, f));
    }
  }
  console.log('All Task 3 routine verification screenshots captured and copied to brain directory!');
}

run().catch((err) => {
  console.error('Task 3 verification failed:', err);
  process.exit(1);
});
