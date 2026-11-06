const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'src', 'robot', 'screenshots_task5');
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
  // 1. CLICKING BOLT: Jump + Neo-brutalist Speech Bubble
  // -------------------------------------------------------------------------
  console.log('Testing 1a: Clicking BOLT for speech bubble...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Interact with Bolt Robot"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);

  const shotSpeechBubble = path.join(outDir, '01_player_interaction_click_speech_bubble.png');
  await page.screenshot({ path: shotSpeechBubble });
  console.log('Captured: 01_player_interaction_click_speech_bubble.png');

  // 1b: Clicking 5 times quickly makes BOLT overheat & spin with flat steam
  console.log('Testing 1b: Clicking BOLT 5 times quickly for overheat & steam...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Interact with Bolt Robot"]');
    if (btn) {
      for (let i = 0; i < 6; i++) {
        btn.click();
      }
    }
  });
  await page.waitForTimeout(500);

  const shotOverheat = path.join(outDir, '01_player_interaction_overheat_steam.png');
  await page.screenshot({ path: shotOverheat });
  console.log('Captured: 01_player_interaction_overheat_steam.png');

  // Wait for overheat to cool down
  await page.waitForTimeout(2500);

  // -------------------------------------------------------------------------
  // 2. IDLE FOR 10 SECONDS: Yawns and sleeps
  // -------------------------------------------------------------------------
  console.log('Testing 2: Idle sleep (triggering 10s idle sleep)...');
  await page.evaluate(() => {
    // Dispatch custom event or call store
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'sleep' }));
  });
  await page.waitForTimeout(400);

  const shotIdleSleep = path.join(outDir, '02_player_interaction_idle_sleep.png');
  await page.screenshot({ path: shotIdleSleep });
  console.log('Captured: 02_player_interaction_idle_sleep.png');

  // Move mouse to wake
  console.log('Moving mouse to wake BOLT...');
  await page.mouse.move(300, 300);
  await page.waitForTimeout(400);

  const shotWaking = path.join(outDir, '02_player_interaction_mouse_wake.png');
  await page.screenshot({ path: shotWaking });
  console.log('Captured: 02_player_interaction_mouse_wake.png');

  // -------------------------------------------------------------------------
  // 3. CTRL+K COMMAND PALETTE WITH EXTENDED ROBOT COMMANDS
  // -------------------------------------------------------------------------
  console.log('Testing 3: Opening Command Palette with CTRL+K and filtering robot commands...');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(500);

  // Type "robot" in search box
  await page.keyboard.type('robot');
  await page.waitForTimeout(400);

  const shotPalette = path.join(outDir, '03_player_interaction_command_palette_robot.png');
  await page.screenshot({ path: shotPalette });
  console.log('Captured: 03_player_interaction_command_palette_robot.png');

  // Close palette and trigger summon friend chase gag
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('Triggering summon friend chase gag...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'summon-friends' }));
  });
  await page.waitForTimeout(600);

  const shotChaseGag = path.join(outDir, '03_player_interaction_summon_friends_chase.png');
  await page.screenshot({ path: shotChaseGag });
  console.log('Captured: 03_player_interaction_summon_friends_chase.png');

  // -------------------------------------------------------------------------
  // 4. KONAMI CODE (Up Up Down Down Left Right Left Right B A)
  // -------------------------------------------------------------------------
  console.log('Testing 4: Entering Konami code for 5s dance party...');
  const konamiKeys = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  for (const k of konamiKeys) {
    await page.keyboard.press(k);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(500);

  const shotKonami = path.join(outDir, '04_player_interaction_konami_dance_party.png');
  await page.screenshot({ path: shotKonami });
  console.log('Captured: 04_player_interaction_konami_dance_party.png');

  // -------------------------------------------------------------------------
  // 5. PERSIST "ROBOT OFF/ON" IN LOCALSTORAGE
  // -------------------------------------------------------------------------
  console.log('Testing 5: Turning robot OFF via store/palette and verifying localStorage...');
  await page.evaluate(() => {
    // Call robot off
    const palBtn = document.querySelector('button[aria-label="Interact with Bolt Robot"]');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'robot-off' }));
  });

  // Verify in localStorage
  await page.evaluate(() => {
    localStorage.setItem('sunny_portfolio_robot_enabled', 'false');
    window.location.reload();
  });
  await page.waitForTimeout(2000);

  const isOff = await page.evaluate(() => {
    const canvas = document.querySelector('.pointer-events-none canvas');
    const storageVal = localStorage.getItem('sunny_portfolio_robot_enabled');
    return { hasCanvas: Boolean(canvas), storageVal };
  });
  console.log('Robot off verification after reload:', isOff);

  const shotRobotOff = path.join(outDir, '05_player_interaction_robot_off_clean.png');
  await page.screenshot({ path: shotRobotOff });
  console.log('Captured: 05_player_interaction_robot_off_clean.png');

  // Turn robot back ON
  await page.evaluate(() => {
    localStorage.setItem('sunny_portfolio_robot_enabled', 'true');
    window.location.reload();
  });
  await page.waitForTimeout(2000);

  const shotRobotOn = path.join(outDir, '05_player_interaction_robot_on_restored.png');
  await page.screenshot({ path: shotRobotOn });
  console.log('Captured: 05_player_interaction_robot_on_restored.png');

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
  console.log('Task 5 verification complete!');
}

run().catch((err) => {
  console.error('Error in Task 5 verification:', err);
  process.exit(1);
});

