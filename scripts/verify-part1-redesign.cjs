const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/sunny/.gemini/antigravity/brain/eba93ef0-c7eb-4605-8f49-1acb986cb054';
const SCREENSHOTS_DIR = path.join(__dirname, '../src/robot/screenshots_part1');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/?robot-showcase=1...');
  await page.goto('http://localhost:5173/?robot-showcase=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. Capture All 12 Expressions
  console.log('Capturing 12 Expressions...');
  const exprs = [
    'happy', 'grin', 'laughing', 'wink', 'curious',
    'excited', 'mind-blown', 'smug', 'silly', 'dizzy',
    'focused', 'sleepy'
  ];

  for (const expr of exprs) {
    const card = page.locator(`[data-testid="expr-card-${expr}"]`);
    if (await card.count() > 0) {
      const shotPath = path.join(SCREENSHOTS_DIR, `expr_${expr}.png`);
      const artifactPath = path.join(ARTIFACT_DIR, `part1_expr_${expr}.png`);
      await card.screenshot({ path: shotPath });
      fs.copyFileSync(shotPath, artifactPath);
      console.log(`Saved expression screenshot: ${expr}`);
    }
  }

  // Full expressions grid
  const fullExprGridPath = path.join(SCREENSHOTS_DIR, '01_all_12_expressions_grid.png');
  const fullExprArtifact = path.join(ARTIFACT_DIR, '01_all_12_expressions_grid.png');
  await page.screenshot({ path: fullExprGridPath, fullPage: false });
  fs.copyFileSync(fullExprGridPath, fullExprArtifact);

  // 2. Click Poses tab & capture 6 Arm Poses
  console.log('Switching to Poses tab...');
  await page.click('[data-testid="tab-poses"]');
  await page.waitForTimeout(1000);

  const poses = [
    { idx: 0, name: 'pose1_rest_idle' },
    { idx: 1, name: 'pose2_high_wave' },
    { idx: 2, name: 'pose3_military_salute' },
    { idx: 3, name: 'pose4_celebration_cheer' },
    { idx: 4, name: 'pose5_bicep_flex' },
    { idx: 5, name: 'pose6_playful_shrug' },
  ];

  for (const p of poses) {
    const card = page.locator(`[data-testid="pose-card-${p.idx}"]`);
    if (await card.count() > 0) {
      const shotPath = path.join(SCREENSHOTS_DIR, `${p.name}.png`);
      const artifactPath = path.join(ARTIFACT_DIR, `part1_${p.name}.png`);
      await card.screenshot({ path: shotPath });
      fs.copyFileSync(shotPath, artifactPath);
      console.log(`Saved arm pose screenshot: ${p.name}`);
    }
  }

  // Full poses grid
  const fullPosesGridPath = path.join(SCREENSHOTS_DIR, '02_all_6_arm_poses_grid.png');
  const fullPosesArtifact = path.join(ARTIFACT_DIR, '02_all_6_arm_poses_grid.png');
  await page.screenshot({ path: fullPosesGridPath, fullPage: false });
  fs.copyFileSync(fullPosesGridPath, fullPosesArtifact);

  // 3. Switch to Variants tab & capture trio
  console.log('Switching to Variants tab...');
  await page.click('[data-testid="tab-variants"]');
  await page.waitForTimeout(1000);

  const fullVariantsGridPath = path.join(SCREENSHOTS_DIR, '03_robot_variants_trio.png');
  const fullVariantsArtifact = path.join(ARTIFACT_DIR, '03_robot_variants_trio.png');
  await page.screenshot({ path: fullVariantsGridPath, fullPage: false });
  fs.copyFileSync(fullVariantsGridPath, fullVariantsArtifact);

  await browser.close();
  console.log('Part 1 verification complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
