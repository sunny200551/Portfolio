const fs = require('fs');

const files = [
  'src/robot/routines.ts',
  'src/robot/TravelingBolt.tsx',
  'src/robot/robotStore.ts',
  'src/robot/HeroRobots.tsx',
  'src/sections/About.tsx',
  'src/sections/CodingDashboard.tsx',
  'src/sections/Projects.tsx',
  'src/sections/Skills.tsx'
];

const map = {
  "'confused'": "'curious'",
  "'sad'": "'silly'",
  "'star-eyed'": "'excited'",
  "'thinking'": "'focused'",
  "'shy'": "'wink'",
  '"confused"': '"curious"',
  '"sad"': '"silly"',
  '"star-eyed"': '"excited"',
  '"thinking"': '"focused"',
  '"shy"': '"wink"',
  'lockedSad': 'lockedFlex'
};

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;
    for (const [oldE, newE] of Object.entries(map)) {
      if (c.includes(oldE)) {
        console.log(`Replacing ${oldE} -> ${newE} in ${f}`);
        c = c.replaceAll(oldE, newE);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(f, c);
    }
  }
});
console.log('Done expression migration.');

