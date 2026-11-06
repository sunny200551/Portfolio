const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'src', 'robot', 'screenshots_task4');
const brainDir = 'C:\\Users\\sunny\\.gemini\\antigravity\\brain\\eba93ef0-c7eb-4605-8f49-1acb986cb054';

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

  // -------------------------------------------------------------------------
  // 06 // GITHUB ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing 06 // GITHUB Routine...');
  await page.evaluate(() => {
    document.getElementById('github')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // 06a: Hopping across city skyline towers
  const shotGitHop = path.join(outDir, '06_github_routine_01_hopping_towers.png');
  await page.screenshot({ path: shotGitHop });
  console.log('Captured: 06_github_routine_01_hopping_towers.png');

  // 06b: Planting flag on tallest tower
  await page.waitForTimeout(1400);
  const shotGitFlag = path.join(outDir, '06_github_routine_02_planting_flag.png');
  await page.screenshot({ path: shotGitFlag });
  console.log('Captured: 06_github_routine_02_planting_flag.png');

  // 06c: Pushing "git push" box off the edge
  await page.waitForTimeout(2200);
  const shotGitPush = path.join(outDir, '06_github_routine_03_pushing_box.png');
  await page.screenshot({ path: shotGitPush });
  console.log('Captured: 06_github_routine_03_pushing_box.png');

  // 06d: Satisfied cheer expression
  await page.waitForTimeout(2000);
  const shotGitSatisfied = path.join(outDir, '06_github_routine_04_satisfied_cheer.png');
  await page.screenshot({ path: shotGitSatisfied });
  console.log('Captured: 06_github_routine_04_satisfied_cheer.png');

  // -------------------------------------------------------------------------
  // 07 // STATS ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing 07 // STATS Routine...');
  await page.evaluate(() => {
    document.getElementById('stats')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // 07a: Lifts HARD dumbbell near difficulty bars
  const shotStatsDumbbell = path.join(outDir, '07_stats_routine_01_dumbbell_hard.png');
  await page.screenshot({ path: shotStatsDumbbell });
  console.log('Captured: 07_stats_routine_01_dumbbell_hard.png');

  // 07b: Collects earned badges onto chest
  await page.waitForTimeout(2000);
  const shotStatsBadges = path.join(outDir, '07_stats_routine_02_collecting_badges.png');
  await page.screenshot({ path: shotStatsBadges });
  console.log('Captured: 07_stats_routine_02_collecting_badges.png');

  // 07c: Locked badge sad attempt
  await page.waitForTimeout(2800);
  const shotStatsLocked = path.join(outDir, '07_stats_routine_03_locked_badge_sad.png');
  await page.screenshot({ path: shotStatsLocked });
  console.log('Captured: 07_stats_routine_03_locked_badge_sad.png');

  // 07d: Shrugs and gives up
  await page.waitForTimeout(2600);
  const shotStatsShrug = path.join(outDir, '07_stats_routine_04_shrug_giveup.png');
  await page.screenshot({ path: shotStatsShrug });
  console.log('Captured: 07_stats_routine_04_shrug_giveup.png');

  // -------------------------------------------------------------------------
  // 08 // EVENTS ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing 08 // EVENTS Routine...');
  await page.evaluate(() => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // 08a: Ticket inspector stamping tickets
  const shotEventsStamp = path.join(outDir, '08_events_routine_01_ticket_stamping.png');
  await page.screenshot({ path: shotEventsStamp });
  console.log('Captured: 08_events_routine_01_ticket_stamping.png');

  // 08b: Winner trophy celebration & flat confetti pop
  await page.waitForTimeout(2800);
  const shotEventsTrophy = path.join(outDir, '08_events_routine_02_winner_trophy_confetti.png');
  await page.screenshot({ path: shotEventsTrophy });
  console.log('Captured: 08_events_routine_02_winner_trophy_confetti.png');

  // -------------------------------------------------------------------------
  // 09 // JOURNEY ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing 09 // JOURNEY Routine...');
  await page.evaluate(() => {
    document.getElementById('journey')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // 09a: 2023 - Smaller robot with training wheels
  const shotJourney2023 = path.join(outDir, '09_journey_routine_01_year_2023_training_wheels.png');
  await page.screenshot({ path: shotJourney2023 });
  console.log('Captured: 09_journey_routine_01_year_2023_training_wheels.png');

  // 09b: 2024 - Normal robot
  await page.waitForTimeout(2600);
  const shotJourney2024 = path.join(outDir, '09_journey_routine_02_year_2024_normal.png');
  await page.screenshot({ path: shotJourney2024 });
  console.log('Captured: 09_journey_routine_02_year_2024_normal.png');

  // 09c: 2025 - Tech Backpack
  await page.waitForTimeout(2600);
  const shotJourney2025 = path.join(outDir, '09_journey_routine_03_year_2025_backpack.png');
  await page.screenshot({ path: shotJourney2025 });
  console.log('Captured: 09_journey_routine_03_year_2025_backpack.png');

  // 09d: 2026 - Jetpack
  await page.waitForTimeout(2600);
  const shotJourney2026 = path.join(outDir, '09_journey_routine_04_year_2026_jetpack.png');
  await page.screenshot({ path: shotJourney2026 });
  console.log('Captured: 09_journey_routine_04_year_2026_jetpack.png');

  // -------------------------------------------------------------------------
  // 10 // CONTACT ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing 10 // CONTACT Routine...');
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // 10a: Hard hat and hammer building letters
  const shotContactBuilding = path.join(outDir, '10_contact_routine_01_hardhat_hammer_building.png');
  await page.screenshot({ path: shotContactBuilding });
  console.log('Captured: 10_contact_routine_01_hardhat_hammer_building.png');

  // 10b: Watches active input on focus
  console.log('Focusing input in contact form...');
  await page.focus('#name');
  await page.waitForTimeout(600);
  const shotContactWatch = path.join(outDir, '10_contact_routine_02_watching_active_input.png');
  await page.screenshot({ path: shotContactWatch });
  console.log('Captured: 10_contact_routine_02_watching_active_input.png');

  // 10c: Form send launches paper-plane rocket
  console.log('Triggering message send rocket launch...');
  await page.evaluate(() => {
    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(600);
  const shotContactRocket = path.join(outDir, '10_contact_routine_03_paper_plane_rocket.png');
  await page.screenshot({ path: shotContactRocket });
  console.log('Captured: 10_contact_routine_03_paper_plane_rocket.png');

  // 10d: Email copy cheer
  console.log('Triggering email copy cheer...');
  await page.evaluate(() => {
    const copyBtn = document.querySelector('[title="Copy email to clipboard"]');
    if (copyBtn) copyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(600);
  const shotContactCheer = path.join(outDir, '10_contact_routine_04_email_copied_cheer.png');
  await page.screenshot({ path: shotContactCheer });
  console.log('Captured: 10_contact_routine_04_email_copied_cheer.png');

  // -------------------------------------------------------------------------
  // FOOTER ROUTINE
  // -------------------------------------------------------------------------
  console.log('Testing FOOTER Routine (Sleep & Back to top flight)...');
  await page.evaluate(() => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'auto' });
  });
  await page.waitForTimeout(1000);

  // Footer sleep with ZZZ bubble
  const shotFooterSleep = path.join(outDir, '11_footer_routine_01_asleep_zzz_bubble.png');
  await page.screenshot({ path: shotFooterSleep });
  console.log('Captured: 11_footer_routine_01_asleep_zzz_bubble.png');

  // Back to top button triggers flight upward with page scroll
  console.log('Clicking Back to Top button...');
  await page.evaluate(() => {
    const topBtn = document.querySelector('[data-robot-anchor="footer:top-btn"]') || document.querySelector('footer button');
    if (topBtn) topBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(500);
  const shotFooterFlight = path.join(outDir, '11_footer_routine_02_back_to_top_flight.png');
  await page.screenshot({ path: shotFooterFlight });
  console.log('Captured: 11_footer_routine_02_back_to_top_flight.png');

  // Copy screenshots to brain directory
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      const src = path.join(outDir, f);
      const dest = path.join(brainDir, f);
      fs.copyFileSync(src, dest);
      console.log(`Copied ${f} to brain directory`);
    }
  }

  await browser.close();
  console.log('Task 4 verification complete!');
}

run().catch((err) => {
  console.error('Error in Task 4 verification:', err);
  process.exit(1);
});

