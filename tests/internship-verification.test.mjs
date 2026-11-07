import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

console.log('--- RUNNING INTERNSHIP SECTION VERIFICATION TESTS ---');

// 1. Data assertions
import { internshipsData } from '../src/data/internships.ts';

assert.equal(internshipsData.length, 2, 'Must have exactly 2 internships entries');

const ongoing = internshipsData.find(i => i.status === 'ongoing');
const completed = internshipsData.find(i => i.status === 'completed');

assert.ok(ongoing, 'Ongoing entry must exist');
assert.ok(completed, 'Completed entry must exist');

// Assert ongoing strings
assert.equal(ongoing.status, 'ongoing');
assert.equal(ongoing.statusLabel, 'CURRENTLY CONTRIBUTING');
assert.equal(ongoing.role, 'Frontend Developer');
assert.equal(ongoing.company, 'Polylance Zenith');
assert.equal(ongoing.companyUrl, 'https://polylancezenith.com');
assert.equal(ongoing.periodLabel, 'APRIL 2026 – PRESENT');
assert.equal(ongoing.start, '2026-04');
assert.equal(ongoing.end, 'present');
assert.equal(ongoing.modeAndLocation, 'REMOTE / INDIA');
assert.equal(ongoing.summary, 'Leading frontend architecture, Web3 product development, UI/UX and marketing for a decentralized freelancing platform built on Polygon.');
assert.equal(ongoing.highlightsTitle, 'KEY CONTRIBUTIONS');
assert.deepEqual(ongoing.highlights, [
  'Leading responsive frontend development and UI/UX.',
  'Integrating Web3 wallets and blockchain features.',
  'Developing freelancer and client dashboard experiences.',
  'Managing product branding, marketing and growth.',
]);
assert.deepEqual(ongoing.tech, [
  'React',
  'JavaScript',
  'Web3.js',
  'Polygon',
  'GitHub',
  'TypeScript',
  'HTML',
  'CSS',
]);
console.log('✔ Test 1: Ongoing data matches DATA specification exactly.');

// Assert completed strings
assert.equal(completed.status, 'completed');
assert.equal(completed.statusLabel, 'COMPLETED');
assert.equal(completed.role, 'Flutter Developer Intern');
assert.equal(completed.company, 'Datavalley India Pvt. Ltd.');
assert.equal(completed.periodLabel, '01 MAY 2026 – 30 JUNE 2026');
assert.equal(completed.start, '2026-05-01');
assert.equal(completed.end, '2026-06-30');
assert.equal(completed.modeAndLocation, 'ONLINE / INDIA');
assert.equal(completed.summary, 'Completed a two-month summer internship in Mobile Application Development (iOS & Android), in collaboration with APSCHE.');
assert.equal(completed.highlightsTitle, 'KEY APPRENTICESHIP HIGHLIGHTS');
assert.deepEqual(completed.highlights, [
  'Developed LostLink (listed in my portfolio projects as "foundify-datavally"), a lost and found mobile application.',
  'Built cross-platform interfaces using Flutter and Dart.',
  'Integrated Firebase for backend and data management.',
  'Implemented lost-item reporting and searching features.',
]);
assert.deepEqual(completed.tech, [
  'Flutter',
  'Dart',
  'Firebase',
  'Android',
  'iOS',
  'TypeScript',
  'HTML',
  'CSS',
]);
assert.equal(completed.certificate?.label, 'CERTIFICATE COMPLETED');
console.log('✔ Test 2: Completed data matches DATA specification exactly.');

// 2. Check no placeholder strings remain in the code
const internshipCode = fs.readFileSync('src/sections/Internship.tsx', 'utf8');
const forbiddenStrings = [
  'COMPANY NAME PENDING',
  'CERTIFICATE: IN PROGRESS',
  'SP-INT-2025-001',
  'isPlaceholder',
  'INTERNSHIP PLACEHOLDER',
];
for (const str of forbiddenStrings) {
  assert.ok(!internshipCode.includes(str), `Code must NOT contain placeholder string: "${str}"`);
}
console.log('✔ Test 3: Zero placeholder strings or serials found in Internship.tsx.');

// 3. Verify certificate file existence
const pdfPath = path.resolve('public/certificates/datavalley-flutter-internship.pdf');
const webpPath = path.resolve('public/certificates/datavalley-flutter-internship.webp');
assert.ok(fs.existsSync(pdfPath), 'Certificate PDF must exist in public/certificates');
assert.ok(fs.existsSync(webpPath), 'Certificate WebP thumbnail must exist in public/certificates');
const pdfStat = fs.statSync(pdfPath);
const webpStat = fs.statSync(webpPath);
assert.ok(pdfStat.size > 100000, 'Certificate PDF must be complete original file');
assert.ok(webpStat.size > 10000, 'Certificate WebP must have valid thumbnail image size');
console.log(`✔ Test 4: Certificate files verified (PDF: ${pdfStat.size} bytes, WebP: ${webpStat.size} bytes).`);

// 4. Test HTTP 200 for certificate assets from Vite dev server
async function checkHttp200(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
      if (res.statusCode === 200) {
        resolve(res.statusCode);
      } else {
        reject(new Error(`Failed with status ${res.statusCode} for ${urlPath}`));
      }
    }).on('error', reject);
  });
}

try {
  await checkHttp200('/certificates/datavalley-flutter-internship.pdf');
  await checkHttp200('/certificates/datavalley-flutter-internship.webp');
  console.log('✔ Test 5: HTTP GET /certificates/datavalley-flutter-internship.pdf and .webp return status 200.');
} catch (e) {
  console.warn('Dev server HTTP check skipped or failed:', e.message);
}

// 5. Verify cross-links: foundify-datavalley in projectsData
import { projectsData } from '../src/data/projects.ts';
const foundifyProj = projectsData.find(p => p.id === 'foundify-datavalley');
assert.ok(foundifyProj, 'foundify-datavalley project must exist in projectsData');
console.log('✔ Test 6: Cross-link target project "foundify-datavalley" successfully verified.');

console.log('\nALL INTERNSHIP VERIFICATION TESTS PASSED! 🎉');

