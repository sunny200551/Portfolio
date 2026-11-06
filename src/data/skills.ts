export type SkillTier = 'Daily' | 'Comfortable' | 'Learning';

export interface SkillItem {
  name: string;
  tier: SkillTier;
  color?: string;
}

export interface SkillCategoryGroup {
  id: string;
  category: string;
  description: string;
  accent: string;
  skills: SkillItem[];
}

export const skillsData: SkillCategoryGroup[] = [
  {
    id: 'frontend',
    category: 'Frontend',
    description: 'Frameworks and styling libraries for responsive client-side development.',
    accent: '#0047AB', // Cobalt
    skills: [
      { name: 'React 19', tier: 'Daily', color: '#0047AB' },
      { name: 'Tailwind CSS v4', tier: 'Daily', color: '#0047AB' },
      { name: 'HTML5 & CSS3', tier: 'Daily', color: '#0047AB' },
      { name: 'Framer Motion', tier: 'Comfortable', color: '#FF5A1F' }
    ]
  },
  {
    id: 'backend',
    category: 'Backend',
    description: 'Server environments, RESTful APIs, and cloud services.',
    accent: '#0047AB', // Cobalt
    skills: [
      { name: 'Node.js', tier: 'Comfortable', color: '#0047AB' },
      { name: 'Express', tier: 'Comfortable', color: '#0047AB' },
      { name: 'Firebase', tier: 'Comfortable', color: '#FF5A1F' },
      { name: 'REST APIs', tier: 'Comfortable', color: '#0A1A3F' }
    ]
  },
  {
    id: 'languages',
    category: 'Languages',
    description: 'Core programming and scripting languages.',
    accent: '#0A1A3F', // Navy
    skills: [
      { name: 'TypeScript', tier: 'Daily', color: '#0047AB' },
      { name: 'JavaScript (ES6+)', tier: 'Daily', color: '#0047AB' },
      { name: 'Python', tier: 'Comfortable', color: '#0A1A3F' },
      { name: 'C Programming', tier: 'Comfortable', color: '#0A1A3F' },
      { name: 'Java Basics', tier: 'Learning', color: '#0A1A3F' }
    ]
  },
  {
    id: 'database',
    category: 'Database',
    description: 'NoSQL document stores and relational database fundamentals.',
    accent: '#0A1A3F', // Navy
    skills: [
      { name: 'Firestore', tier: 'Comfortable', color: '#FF5A1F' },
      { name: 'MongoDB', tier: 'Comfortable', color: '#0047AB' },
      { name: 'MySQL', tier: 'Learning', color: '#0A1A3F' }
    ]
  },
  {
    id: 'blockchain',
    category: 'Blockchain',
    description: 'Newly exploring decentralized ledgers, Solidity, and smart contracts.',
    accent: '#FF5A1F', // Orange
    skills: [
      { name: 'Solidity Basics', tier: 'Learning', color: '#FF5A1F' },
      { name: 'Smart Contracts', tier: 'Learning', color: '#0047AB' },
      { name: 'Web3 Fundamentals', tier: 'Learning', color: '#0A1A3F' }
    ]
  },
  {
    id: 'tools',
    category: 'Tools',
    description: 'Developer utilities, version control, and design tooling.',
    accent: '#0A0A0A', // Black
    skills: [
      { name: 'Git & GitHub', tier: 'Daily', color: '#0A0A0A' },
      { name: 'VS Code', tier: 'Daily', color: '#0A0A0A' },
      { name: 'Vite', tier: 'Daily', color: '#0047AB' },
      { name: 'Figma', tier: 'Comfortable', color: '#FF5A1F' }
    ]
  }
];
