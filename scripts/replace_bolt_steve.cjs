const fs = require('fs');

function replaceInFile(filePath, replaces) {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of replaces) {
    text = text.split(from).join(to);
  }
  fs.writeFileSync(filePath, text);
  console.log('Replaced in ' + filePath);
}

replaceInFile('src/components/three/GitHubSkyline.tsx', [
  ['robotStore.setBolt', 'robotStore.setSteve'],
  ['Funny BOLT reaction', 'Funny STEVE reaction']
]);

replaceInFile('src/components/three/HeroIllustration.tsx', [
  ['robotStore.setBolt', 'robotStore.setSteve']
]);

replaceInFile('src/sections/Projects.tsx', [
  ['robotStore.setBolt', 'robotStore.setSteve']
]);

replaceInFile('src/sections/Skills.tsx', [
  ['robotStore.setBolt', 'robotStore.setSteve'],
  ['BOLT reaction', 'STEVE reaction']
]);

replaceInFile('src/sections/Journey.tsx', [
  ["BOLT's journey", "STEVE's journey"],
  ['trigger BOLT reactions', 'trigger STEVE reactions'],
  ['fills as BOLT travels', 'fills as STEVE travels']
]);

replaceInFile('src/robot/rigConstants.ts', [
  ['for BOLT, NUT, and CHIP', 'for STEVE']
]);

replaceInFile('src/robot/RobotShowcase.tsx', [
  ['BOLT, NUT & CHIP SHOWCASE', 'STEVE MASCOT SHOWCASE'],
  ['variant="bolt"', 'variant="steve"'],
  ['OFFICIAL MASCOT: BOLT (ORANGE, BLUE VISOR)', 'OFFICIAL MASCOT: STEVE (ORANGE, BLUE VISOR)'],
  ["['bolt']", "['steve']"],
  ['BOLT DESIGN SHEET', 'STEVE DESIGN SHEET']
]);
