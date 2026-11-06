const fs = require('fs');

// 1. Hero.tsx
let hero = fs.readFileSync('src/sections/Hero.tsx', 'utf8');
hero = hero.replace('GET IN TOUCH', 'GET IN TOUCH" data-robot-react="hero:get-in-touch');
hero = hero.replace('DOWNLOAD RESUME', 'DOWNLOAD RESUME" data-robot-react="hero:download-resume');
hero = hero.replace(/'star-eyed'/g, "'excited'");
// Social buttons
hero = hero.replace('title="GitHub"', 'title="GitHub" data-robot-react="hero:social"');
hero = hero.replace('title="LinkedIn"', 'title="LinkedIn" data-robot-react="hero:social"');
hero = hero.replace('title="Instagram"', 'title="Instagram" data-robot-react="hero:social"');
hero = hero.replace('title="Email"', 'title="Email" data-robot-react="hero:social"');
fs.writeFileSync('src/sections/Hero.tsx', hero);
console.log('Hero.tsx updated');

// 2. Projects.tsx: project cards
let proj = fs.readFileSync('src/sections/Projects.tsx', 'utf8');
proj = proj.replace(/className="project-card\s+/g, 'data-robot-react="work:card" className="project-card ');
fs.writeFileSync('src/sections/Projects.tsx', proj);
console.log('Projects.tsx updated');

// 3. Skills.tsx: 3D Canvas box
let skills = fs.readFileSync('src/sections/Skills.tsx', 'utf8');
skills = skills.replace('ref={canvasBoxRef}', 'ref={canvasBoxRef} data-robot-react="skills:slab"');
fs.writeFileSync('src/sections/Skills.tsx', skills);
console.log('Skills.tsx updated');

// 4. GitHubActivity.tsx: Skyline container
let gh = fs.readFileSync('src/sections/GitHubActivity.tsx', 'utf8');
gh = gh.replace('ref={skylineBoxRef}', 'ref={skylineBoxRef} data-robot-react="github:skyline"');
fs.writeFileSync('src/sections/GitHubActivity.tsx', gh);
console.log('GitHubActivity.tsx updated');

// 5. CodingDashboard.tsx: cards and badges
let stats = fs.readFileSync('src/sections/CodingDashboard.tsx', 'utf8');
stats = stats.replace('data-robot-anchor="stats:hard"', 'data-robot-anchor="stats:hard" data-robot-react="stats:card"');
stats = stats.replace('data-robot-anchor="stats:badges"', 'data-robot-anchor="stats:badges" data-robot-react="stats:badge"');
fs.writeFileSync('src/sections/CodingDashboard.tsx', stats);
console.log('CodingDashboard.tsx updated');

// 6. Events.tsx: tickets
let events = fs.readFileSync('src/sections/Events.tsx', 'utf8');
events = events.replace('data-robot-anchor="events:tickets"', 'data-robot-anchor="events:tickets" data-robot-react="events:ticket"');
fs.writeFileSync('src/sections/Events.tsx', events);
console.log('Events.tsx updated');

// 7. Journey.tsx: timeline nodes
let journey = fs.readFileSync('src/sections/Journey.tsx', 'utf8');
journey = journey.replace(/data-robot-anchor=\{`journey:node-\$\{item\.year\}`\}/g, 'data-robot-anchor={`journey:node-${item.year}`} data-robot-react="journey:node"');
fs.writeFileSync('src/sections/Journey.tsx', journey);
console.log('Journey.tsx updated');

// 8. Contact.tsx: inputs, send button, copy email
let contact = fs.readFileSync('src/sections/Contact.tsx', 'utf8');
contact = contact.replace('aria-label="Copy email"', 'aria-label="Copy email" data-robot-react="contact:copy-email"');
contact = contact.replace('type="submit"', 'type="submit" data-robot-react="contact:send"');
contact = contact.replace(/name="name"/g, 'name="name" data-robot-react="contact:input"');
contact = contact.replace(/name="email"/g, 'name="email" data-robot-react="contact:input"');
fs.writeFileSync('src/sections/Contact.tsx', contact);
console.log('Contact.tsx updated');

// 9. Footer.tsx: back to top
let footer = fs.readFileSync('src/sections/Footer.tsx', 'utf8');
footer = footer.replace('data-robot-anchor="footer:top-btn"', 'data-robot-anchor="footer:top-btn" data-robot-react="footer:back-to-top"');
fs.writeFileSync('src/sections/Footer.tsx', footer);
console.log('Footer.tsx updated');

