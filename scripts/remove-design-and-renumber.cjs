const fs = require('fs');

// 1. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import\s*\{\s*Design\s*\}\s*from\s*['"]\.\/sections\/Design['"];?\r?\n?/, '');
app = app.replace(/\{\/\* 04\. UI Architecture & Design Tokens \(#design\) \*\/\}\r?\n?\s*<Design \/>\r?\n?/, '');
fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx updated');

// 2. NavigationRail.tsx
let rail = fs.readFileSync('src/components/ui/NavigationRail.tsx', 'utf8');
rail = rail.replace(
  /const NAV_SECTIONS: NavSection\[\] = \[[\s\S]*?\];/,
  `const NAV_SECTIONS: NavSection[] = [
  { id: 'home', num: '01', label: 'HOME' },
  { id: 'about', num: '02', label: 'ABOUT' },
  { id: 'work', num: '03', label: 'WORK' },
  { id: 'skills', num: '04', label: 'SKILLS' },
  { id: 'github', num: '05', label: 'GITHUB' },
  { id: 'stats', num: '06', label: 'STATS' },
  { id: 'events', num: '07', label: 'EVENTS' },
  { id: 'journey', num: '08', label: 'JOURNEY' },
  { id: 'contact', num: '09', label: 'CONTACT' },
];`
);
fs.writeFileSync('src/components/ui/NavigationRail.tsx', rail);
console.log('NavigationRail.tsx updated');

// 3. Footer.tsx
let footer = fs.readFileSync('src/sections/Footer.tsx', 'utf8');
footer = footer.replace(
  /const navLinks = \[[\s\S]*?\];/,
  `const navLinks = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'work', label: 'WORK' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'github', label: 'GITHUB' },
  { id: 'stats', label: 'STATS' },
  { id: 'events', label: 'EVENTS' },
  { id: 'journey', label: 'JOURNEY' },
  { id: 'contact', label: 'CONTACT' },
];`
);
fs.writeFileSync('src/sections/Footer.tsx', footer);
console.log('Footer.tsx updated');

// 4. CommandPalette.tsx
let cp = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');
cp = cp.replace(/Palette,?\s*/, '');
cp = cp.replace(
  /\{\s*id:\s*'home',[\s\S]*?\{\s*id:\s*'contact',.*?\},\r?\n?/,
  `{ id: 'home', name: 'Go to 01 // Home', category: 'Navigation', icon: Compass, action: () => scrollToSection('home') },
    { id: 'about', name: 'Go to 02 // About', category: 'Navigation', icon: User, action: () => scrollToSection('about') },
    { id: 'work', name: 'Go to 03 // Work (Featured Projects)', category: 'Navigation', icon: Briefcase, action: () => scrollToSection('work') },
    { id: 'skills', name: 'Go to 04 // Skills', category: 'Navigation', icon: Code, action: () => scrollToSection('skills') },
    { id: 'github', name: 'Go to 05 // GitHub Commit Skyline', category: 'Navigation', icon: Terminal, action: () => scrollToSection('github') },
    { id: 'stats', name: 'Go to 06 // Coding Stats', category: 'Navigation', icon: Award, action: () => scrollToSection('stats') },
    { id: 'events', name: 'Go to 07 // Events & Hackathons', category: 'Navigation', icon: Calendar, action: () => scrollToSection('events') },
    { id: 'journey', name: 'Go to 08 // Learning Journey', category: 'Navigation', icon: Compass, action: () => scrollToSection('journey') },
    { id: 'contact', name: 'Go to 09 // Contact', category: 'Navigation', icon: User, action: () => scrollToSection('contact') },\n`
);
fs.writeFileSync('src/components/CommandPalette.tsx', cp);
console.log('CommandPalette.tsx updated');

// 5. Skills.tsx: 05 // SKILLS -> 04 // SKILLS
let skills = fs.readFileSync('src/sections/Skills.tsx', 'utf8');
skills = skills.replace('05 // SKILLS', '04 // SKILLS');
fs.writeFileSync('src/sections/Skills.tsx', skills);
console.log('Skills.tsx updated');

// 6. GitHubActivity.tsx: 06 // GITHUB -> 05 // GITHUB
let gh = fs.readFileSync('src/sections/GitHubActivity.tsx', 'utf8');
gh = gh.replace('06 // GITHUB', '05 // GITHUB');
fs.writeFileSync('src/sections/GitHubActivity.tsx', gh);
console.log('GitHubActivity.tsx updated');

// 7. CodingDashboard.tsx: 07 // STATS -> 06 // STATS
let stats = fs.readFileSync('src/sections/CodingDashboard.tsx', 'utf8');
stats = stats.replace('07 // STATS', '06 // STATS');
fs.writeFileSync('src/sections/CodingDashboard.tsx', stats);
console.log('CodingDashboard.tsx updated');

// 8. Events.tsx: 07 // EVENTS & WORKSHOPS
let events = fs.readFileSync('src/sections/Events.tsx', 'utf8');
events = events.replace(
  /PARTICIPATION & WORKSHOPS/,
  '07 // EVENTS & WORKSHOPS'
);
fs.writeFileSync('src/sections/Events.tsx', events);
console.log('Events.tsx updated');

// 9. Journey.tsx: 09 // JOURNEY -> 08 // JOURNEY
let journey = fs.readFileSync('src/sections/Journey.tsx', 'utf8');
journey = journey.replace('09 // JOURNEY', '08 // JOURNEY');
fs.writeFileSync('src/sections/Journey.tsx', journey);
console.log('Journey.tsx updated');

// 10. Contact.tsx: 10 // CONTACT -> 09 // CONTACT
let contact = fs.readFileSync('src/sections/Contact.tsx', 'utf8');
contact = contact.replace('10 // CONTACT', '09 // CONTACT');
fs.writeFileSync('src/sections/Contact.tsx', contact);
console.log('Contact.tsx updated');

// 11. routines.ts: remove design routine
let routines = fs.readFileSync('src/robot/routines.ts', 'utf8');
routines = routines.replace(/\/\/\s*04\s*\/\/\s*DESIGN ROUTINE[\s\S]*?\}\);\r?\n?/, '');
fs.writeFileSync('src/robot/routines.ts', routines);
console.log('routines.ts updated');

// 12. robotStore.ts: remove designStage
let store = fs.readFileSync('src/robot/robotStore.ts', 'utf8');
store = store.replace(/export type DesignStage[\s\S]*?;\r?\n?/, '');
store = store.replace(/designStage:\s*DesignStage;\r?\n?/, '');
store = store.replace(/setDesignStage:\s*\(stage:\s*DesignStage\)\s*=>\s*void;\r?\n?/, '');
store = store.replace(/designStage:\s*['"]research['"],?\r?\n?/, '');
store = store.replace(/setDesignStage:\s*\(designStage\)\s*=>\s*set\(\{[^}]*\}\),?\r?\n?/, '');
fs.writeFileSync('src/robot/robotStore.ts', store);
console.log('robotStore.ts updated');

