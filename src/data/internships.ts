export type InternshipMode = 'onsite' | 'remote' | 'hybrid';
export type InternshipStatus = 'completed' | 'ongoing';

export interface InternshipItem {
  id: string;
  company: string;
  role: string;
  start: string; // e.g. "June 2025" or "YYYY-MM"
  end: string;   // e.g. "August 2025" or "Present"
  mode: InternshipMode;
  location: string;
  summary: string;
  highlights: string[];
  tech: string[];
  certificateUrl?: string;
  companyUrl?: string;
  status: InternshipStatus;
  isPlaceholder?: boolean;
}

export const internshipsData: InternshipItem[] = [
  {
    id: 'placeholder-internship-1',
    company: '[COMPANY NAME PENDING]',
    role: 'Software Engineering / Web3 Intern',
    start: '2025',
    end: 'Present',
    mode: 'remote',
    location: 'Remote / India',
    summary: 'Building decentralized application frontends and exploring smart contract integration while collaborating with engineering mentors.',
    highlights: [
      'Developed responsive user interfaces with strict accessibility and performance audits',
      'Assisted in designing EVM smart contract test suites and ABI bindings',
      'Participated in code reviews, CI/CD pipeline automation, and sprint standups',
    ],
    tech: ['React', 'TypeScript', 'Solidity Basics', 'Web3.js', 'Tailwind CSS'],
    status: 'ongoing',
    isPlaceholder: true,
  },
];

export default internshipsData;
