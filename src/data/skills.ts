export type SkillTier = 'Focus' | 'Daily' | 'Comfortable' | 'Learning';

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Languages'
  | 'Database'
  | 'Blockchain'
  | 'Tools'
  | 'Content';

export interface PeriodicSkill {
  id: string;
  index: number;
  name: string;
  symbol: string;
  category: SkillCategory;
  tier: SkillTier;
  note: string;
  verifyRequired?: boolean;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Frontend',
  'Backend',
  'Languages',
  'Database',
  'Blockchain',
  'Tools',
  'Content',
];

export const skillsData: PeriodicSkill[] = [
  // --- CURRENT FOCUS: BLOCKCHAIN, WEB3 & DSA (Top Shelf) ---
  {
    id: 'solidity',
    index: 1,
    name: 'Solidity',
    symbol: 'So',
    category: 'Blockchain',
    tier: 'Focus',
    note: 'EVM smart contract programming, ABI bindings & event emitters.',
    verifyRequired: true,
  },
  {
    id: 'web3-concepts',
    index: 2,
    name: 'Web3 Concepts',
    symbol: 'W3',
    category: 'Blockchain',
    tier: 'Focus',
    note: 'Browser wallet integration, RPC providers & distributed applications.',
  },
  {
    id: 'smart-contracts',
    index: 3,
    name: 'Smart Contracts',
    symbol: 'Sc',
    category: 'Blockchain',
    tier: 'Focus',
    note: 'Autonomous on-chain deterministic execution & state mutation.',
  },
  {
    id: 'blockchain-fund',
    index: 4,
    name: 'Blockchain Fundamentals',
    symbol: 'Bc',
    category: 'Blockchain',
    tier: 'Focus',
    note: 'Decentralized ledgers, consensus algorithms & cryptographic hashing.',
  },
  {
    id: 'dsa-practice',
    index: 5,
    name: 'Data Structures & Algorithms',
    symbol: 'Ds',
    category: 'Languages',
    tier: 'Focus',
    note: 'Daily algorithmic problem-solving on LeetCode & CodeChef.',
  },

  // --- FRONTEND (Established Production Skills) ---
  {
    id: 'react',
    index: 6,
    name: 'React 19',
    symbol: 'Re',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Primary library for component architecture, hooks & interactive states.',
  },
  {
    id: 'tailwindcss',
    index: 7,
    name: 'Tailwind CSS v4',
    symbol: 'Tw',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Utility-first CSS tokens, responsive grids & bespoke animations.',
  },
  {
    id: 'html-css',
    index: 8,
    name: 'HTML5 & CSS3',
    symbol: 'Ht',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Semantic document markup, CSS variables & accessible UI patterns.',
  },
  {
    id: 'nextjs',
    index: 9,
    name: 'Next.js',
    symbol: 'Nx',
    category: 'Frontend',
    tier: 'Comfortable',
    note: 'Hybrid rendering, app router architecture & performance optimization.',
  },
  {
    id: 'framer-motion',
    index: 10,
    name: 'Framer Motion',
    symbol: 'Fm',
    category: 'Frontend',
    tier: 'Comfortable',
    note: 'Declarative layout animations, spring physics & gesture recognition.',
    verifyRequired: true,
  },

  // --- BACKEND (Navy) ---
  {
    id: 'nodejs',
    index: 11,
    name: 'Node.js',
    symbol: 'Nd',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Event-driven server runtime for REST microservices & build scripts.',
  },
  {
    id: 'express',
    index: 12,
    name: 'Express.js',
    symbol: 'Ex',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Minimalist web framework for routing, middleware pipelines & JSON APIs.',
  },
  {
    id: 'rest-apis',
    index: 13,
    name: 'REST APIs',
    symbol: 'Rs',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Client-server contracts, endpoint design & HTTP response codes.',
  },

  // --- LANGUAGES (Orange / Cobalt) ---
  {
    id: 'typescript',
    index: 14,
    name: 'TypeScript',
    symbol: 'Ts',
    category: 'Languages',
    tier: 'Daily',
    note: 'Strict compile-time static types, generics & interface modeling.',
    verifyRequired: true,
  },
  {
    id: 'javascript',
    index: 15,
    name: 'JavaScript',
    symbol: 'Js',
    category: 'Languages',
    tier: 'Daily',
    note: 'Modern ES6+ syntax, asynchronous promises & browser DOM manipulation.',
  },
  {
    id: 'python',
    index: 16,
    name: 'Python',
    symbol: 'Py',
    category: 'Languages',
    tier: 'Comfortable',
    note: 'Algorithmic problem solving, automation scripting & data structures.',
  },
  {
    id: 'c-lang',
    index: 17,
    name: 'C Programming',
    symbol: 'C',
    category: 'Languages',
    tier: 'Comfortable',
    note: 'Low-level memory pointers, CPU execution & memory management.',
  },
  {
    id: 'java',
    index: 18,
    name: 'Java',
    symbol: 'Jv',
    category: 'Languages',
    tier: 'Learning',
    note: 'Object-oriented programming, class hierarchies & JVM patterns.',
  },

  // --- DATABASE ---
  {
    id: 'mongodb',
    index: 19,
    name: 'MongoDB',
    symbol: 'Mo',
    category: 'Database',
    tier: 'Comfortable',
    note: 'NoSQL document schemas, BSON queries & database indexing.',
  },
  {
    id: 'firestore',
    index: 20,
    name: 'Firestore',
    symbol: 'Fs',
    category: 'Database',
    tier: 'Comfortable',
    note: 'Real-time document collections & client-side snapshot listeners.',
  },
  {
    id: 'mysql',
    index: 21,
    name: 'MySQL',
    symbol: 'My',
    category: 'Database',
    tier: 'Learning',
    note: 'Relational table normalization, foreign keys & structured queries.',
  },

  // --- TOOLS ---
  {
    id: 'git-github',
    index: 22,
    name: 'Git & GitHub',
    symbol: 'Gt',
    category: 'Tools',
    tier: 'Daily',
    note: 'Branching strategies, semantic commits, PR workflows & code review.',
  },
  {
    id: 'vscode',
    index: 23,
    name: 'VS Code',
    symbol: 'Vs',
    category: 'Tools',
    tier: 'Daily',
    note: 'Primary code editor, extension ecosystem, linting & debugger setups.',
  },
  {
    id: 'vite',
    index: 24,
    name: 'Vite',
    symbol: 'Vi',
    category: 'Tools',
    tier: 'Daily',
    note: 'Fast native ESM dev server, bundling & asset pipelines.',
    verifyRequired: true,
  },
  {
    id: 'postman',
    index: 25,
    name: 'Postman',
    symbol: 'Pm',
    category: 'Tools',
    tier: 'Comfortable',
    note: 'API request testing, header inspection & collection documentation.',
  },
  {
    id: 'figma',
    index: 26,
    name: 'Figma',
    symbol: 'Fg',
    category: 'Tools',
    tier: 'Comfortable',
    note: 'Interface layout prototyping, component variants & handoff specs.',
    verifyRequired: true,
  },

  // --- CONTENT (Video Editing & Creator Tools) ---
  {
    id: 'video-editing',
    index: 27,
    name: 'Video Editing & Storyboarding',
    symbol: 'Ed',
    category: 'Content',
    tier: 'Comfortable',
    note: 'Timeline pacing, video cuts, sequencing & storytelling.',
  },
  {
    id: 'content-production',
    index: 28,
    name: 'YouTube & Short-form Production',
    symbol: 'Yt',
    category: 'Content',
    tier: 'Comfortable',
    note: 'Creator workflow, thumbnail design, YouTube Shorts & Instagram Reels.',
  },
];

export default skillsData;
