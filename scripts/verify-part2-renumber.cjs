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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Verify Design section is completely gone
  const designEl = await page.$('#design');
  console.log('Design section in DOM?', designEl !== null ? 'ERROR: FOUND' : 'PASS: NONE');

  // 2. Verify all 9 sections exist
  const expectedSections = ['home', 'about', 'work', 'skills', 'github', 'stats', 'events', 'journey', 'contact'];
  for (const s of expectedSections) {
    const el = await page.$(`#${s}`);
    console.log(`Section #${s} exists?`, el !== null ? 'PASS' : 'FAIL');
  }

  // 3. Check section tags (04 // SKILLS, 05 // GITHUB, 06 // STATS, etc.)
  const tagsText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('span, div'))
      .map(el => el.textContent?.trim() || '')
      .filter(t => /^\d\d\s*\/\/\s*[A-Z]+/.test(t))
      .filter((v, i, a) => a.indexOf(v) === i);
  });
  console.log('Detected section tags:', tagsText);

  // 4. Capture screenshot of Home + Rail
  const shotRail = path.join(ARTIFACT_DIR, 'part2_01_home_rail_renumbered.png');
  await page.screenshot({ path: shotRail });
  console.log('Captured:', shotRail);

  // 5. Scroll to Skills (now section 04)
  await page.evaluate(() => {
    document.getElementById('skills')?.scrollIntoView();
  });
  await page.waitForTimeout(1000);
  const shotSkills = path.join(ARTIFACT_DIR, 'part2_02_skills_04.png');
  await page.screenshot({ path: shotSkills });
  console.log('Captured:', shotSkills);

  // 6. Scroll to Footer
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  const shotFooter = path.join(ARTIFACT_DIR, 'part2_03_footer_9_sections.png');
  await page.screenshot({ path: shotFooter });
  console.log('Captured:', shotFooter);

  await browser.close();
  console.log('Part 2 verification complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
