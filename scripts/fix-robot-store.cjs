const fs = require('fs');

let code = fs.readFileSync('src/robot/robotStore.ts', 'utf8');

// 1. Remove designStage
code = code.replace("    designStage: 'research',\r\n", '');
code = code.replace("    designStage: 'research',\n", '');

// 2. Replace 'star-eyed' with 'excited'
code = code.replace(/'star-eyed'/g, "'excited'");

// 3. Replace StatsStage
code = code.replace(
  "export type StatsStage = 'dumbbell' | 'badges' | 'lockedSad' | 'shrug';",
  "export type StatsStage = 'dumbbell' | 'badges' | 'lockedFlex' | 'shrug';"
);

fs.writeFileSync('src/robot/robotStore.ts', code, 'utf8');
console.log('Successfully updated robotStore.ts');

