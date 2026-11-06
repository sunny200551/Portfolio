export type SkillTier = 'Daily' | 'Comfortable' | 'Learning';

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Languages'
  | 'Database'
  | 'Blockchain'
  | 'Tools';

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
];

export const skillsData: PeriodicSkill[] = [
  // --- FRONTEND (Cobalt) ---
  {
    id: 'react',
    index: 1,
    name: 'React 19',
    symbol: 'Re',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Primary library for component architecture, hooks & interactive states.',
  },
  {
    id: 'tailwindcss',
    index: 2,
    name: 'Tailwind CSS v4',
    symbol: 'Tw',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Utility-first CSS tokens, responsive grids & bespoke animations.',
  },
  {
    id: 'html-css',
    index: 3,
    name: 'HTML5 & CSS3',
    symbol: 'Ht',
    category: 'Frontend',
    tier: 'Daily',
    note: 'Semantic document markup, CSS variables & accessible UI patterns.',
  },
  {
    id: 'nextjs',
    index: 4,
    name: 'Next.js',
    symbol: 'Nx',
    category: 'Frontend',
    tier: 'Comfortable',
    note: 'Hybrid rendering, app router architecture & performance optimization.',
  },
  {
    id: 'framer-motion',
    index: 5,
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
    index: 6,
    name: 'Node.js',
    symbol: 'Nd',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Event-driven server runtime for REST microservices & build scripts.',
  },
  {
    id: 'express',
    index: 7,
    name: 'Express.js',
    symbol: 'Ex',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Minimalist web framework for routing, middleware pipelines & JSON APIs.',
  },
  {
    id: 'rest-apis',
    index: 8,
    name: 'REST APIs',
    symbol: 'Rs',
    category: 'Backend',
    tier: 'Comfortable',
    note: 'Client-server contracts, endpoint design & HTTP response codes.',
  },

  // --- LANGUAGES (Orange) ---
  {
    id: 'typescript',
    index: 9,
    name: 'TypeScript',
    symbol: 'Ts',
    category: 'Languages',
    tier: 'Daily',
    note: 'Strict compile-time static types, generics & interface modeling.',
    verifyRequired: true,
  },
  {
    id: 'javascript',
    index: 10,
    name: 'JavaScript',
    symbol: 'Js',
    category: 'Languages',
    tier: 'Daily',
    note: 'Modern ES6+ syntax, asynchronous promises & browser DOM manipulation.',
  },
  {
    id: 'python',
    index: 11,
    name: 'Python',
    symbol: 'Py',
    category: 'Languages',
    tier: 'Comfortable',
    note: 'Algorithmic problem solving, automation scripting & data structures.',
  },
  {
    id: 'c-lang',
    index: 12,
    name: 'C Programming',
    symbol: 'C',
    category: 'Languages',
    tier: 'Comfortable',
    note: 'Low-level memory pointers, CPU execution & memory management.',
  },
  {
    id: 'java',
    index: 13,
    name: 'Java',
    symbol: 'Jv',
    category: 'Languages',
    tier: 'Learning',
    note: 'Object-oriented programming, class hierarchies & JVM patterns.',
  },

  // --- DATABASE (White with Cobalt border) ---
  {
    id: 'mongodb',
    index: 14,
    name: 'MongoDB',
    symbol: 'Mo',
    category: 'Database',
    tier: 'Comfortable',
    note: 'NoSQL document schemas, BSON queries & database indexing.',
  },
  {
    id: 'firestore',
    index: 15,
    name: 'Firestore',
    symbol: 'Fs',
    category: 'Database',
    tier: 'Comfortable',
    note: 'Real-time document collections & client-side snapshot listeners.',
  },
  {
    id: 'mysql',
    index: 16,
    name: 'MySQL',
    symbol: 'My',
    category: 'Database',
    tier: 'Learning',
    note: 'Relational table normalization, foreign keys & structured queries.',
  },

  // --- BLOCKCHAIN (Black with White text) ---
  {
    id: 'blockchain-fund',
    index: 17,
    name: 'Blockchain Fundamentals',
    symbol: 'Bc',
    category: 'Blockchain',
    tier: 'Learning',
    note: 'Decentralized ledgers, consensus algorithms & cryptographic hashing.',
  },
  {
    id: 'smart-contracts',
    index: 18,
    name: 'Smart Contracts',
    symbol: 'Sc',
    category: 'Blockchain',
    tier: 'Learning',
    note: 'Autonomous on-chain deterministic execution & state mutation.',
  },
  {
    id: 'web3-concepts',
    index: 19,
    name: 'Web3 Concepts',
    symbol: 'W3',
    category: 'Blockchain',
    tier: 'Learning',
    note: 'Browser wallet integration, RPC providers & distributed applications.',
  },
  {
    id: 'solidity',
    index: 20,
    name: 'Solidity',
    symbol: 'So',
    category: 'Blockchain',
    tier: 'Learning',
    note: 'EVM smart contract programming & event emitters.',
    verifyRequired: true,
  },

  // --- TOOLS (White with Cobalt text) ---
  {
    id: 'git-github',
    index: 21,
    name: 'Git & GitHub',
    symbol: 'Gt',
    category: 'Tools',
    tier: 'Daily',
    note: 'Branching strategies, semantic commits, PR workflows & code review.',
  },
  {
    id: 'vscode',
    index: 22,
    name: 'VS Code',
    symbol: 'Vs',
    category: 'Tools',
    tier: 'Daily',
    note: 'Primary code editor, extension ecosystem, linting & debugger setups.',
  },
  {
    id: 'vite',
    index: 23,
    name: 'Vite',
    symbol: 'Vi',
    category: 'Tools',
    tier: 'Daily',
    note: 'Fast native ESM dev server, bundling & asset pipelines.',
    verifyRequired: true,
  },
  {
    id: 'postman',
    index: 24,
    name: 'Postman',
    symbol: 'Pm',
    category: 'Tools',
    tier: 'Comfortable',
    note: 'API request testing, header inspection & collection documentation.',
  },
  {
    id: 'figma',
    index: 25,
    name: 'Figma',
    symbol: 'Fg',
    category: 'Tools',
    tier: 'Comfortable',
    note: 'Interface layout prototyping, component variants & handoff specs.',
    verifyRequired: true,
  },
];

export default skillsData;
