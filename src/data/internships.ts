export type InternshipMode = 'remote' | 'online' | 'onsite' | 'hybrid';
export type InternshipStatus = 'ongoing' | 'completed';

export interface InternshipCertificate {
  label: string;
  fileUrl: string;
  thumbnailUrl: string;
  alt: string;
  status: 'completed' | 'missing';
}

export interface InternshipItem {
  id: string;
  status: InternshipStatus;
  statusLabel: string;
  role: string;
  company: string;
  companyUrl?: string;
  start: string;
  end: string;
  periodLabel: string;
  mode: InternshipMode;
  location: string;
  modeAndLocation: string;
  summary: string;
  highlightsTitle: string;
  highlights: string[];
  tech: string[];
  certificate?: InternshipCertificate;
  barcodeCode?: string;
}

export const internshipsData: InternshipItem[] = [
  {
    id: 'polylance-zenith',
    status: 'ongoing',
    statusLabel: 'CURRENTLY CONTRIBUTING',
    role: 'Frontend Developer',
    company: 'Polylance Zenith',
    companyUrl: 'https://polylancezenith.com',
    start: '2026-04',
    end: 'present',
    periodLabel: 'APRIL 2026 – PRESENT',
    mode: 'remote',
    location: 'INDIA',
    modeAndLocation: 'REMOTE / INDIA',
    summary: 'Leading frontend architecture, Web3 product development, UI/UX and marketing for a decentralized freelancing platform built on Polygon.',
    highlightsTitle: 'KEY CONTRIBUTIONS',
    highlights: [
      'Leading responsive frontend development and UI/UX.',
      'Integrating Web3 wallets and blockchain features.',
      'Developing freelancer and client dashboard experiences.',
      'Managing product branding, marketing and growth.',
    ],
    tech: [
      'React',
      'JavaScript',
      'Web3.js',
      'Polygon',
      'GitHub',
      'TypeScript',
      'HTML',
      'CSS',
    ],
    barcodeCode: 'PZ-2026-04',
  },
  {
    id: 'datavalley-internship',
    status: 'completed',
    statusLabel: 'COMPLETED',
    role: 'Flutter Developer Intern',
    company: 'Datavalley India Pvt. Ltd.',
    start: '2026-05-01',
    end: '2026-06-30',
    periodLabel: '01 MAY 2026 – 30 JUNE 2026',
    mode: 'online',
    location: 'INDIA',
    modeAndLocation: 'ONLINE / INDIA',
    summary: 'Completed a two-month summer internship in Mobile Application Development (iOS & Android), in collaboration with APSCHE.',
    highlightsTitle: 'KEY APPRENTICESHIP HIGHLIGHTS',
    highlights: [
      'Developed LostLink (listed in my portfolio projects as "foundify-datavally"), a lost and found mobile application.',
      'Built cross-platform interfaces using Flutter and Dart.',
      'Integrated Firebase for backend and data management.',
      'Implemented lost-item reporting and searching features.',
    ],
    tech: [
      'Flutter',
      'Dart',
      'Firebase',
      'Android',
      'iOS',
      'TypeScript',
      'HTML',
      'CSS',
    ],
    certificate: {
      label: 'CERTIFICATE COMPLETED',
      fileUrl: '/certificates/datavalley-flutter-internship.pdf',
      thumbnailUrl: '/certificates/datavalley-flutter-internship.webp',
      alt: 'Datavalley Flutter internship certificate',
      status: 'completed',
    },
    barcodeCode: 'DV-2026-05',
  },
];

export default internshipsData;
