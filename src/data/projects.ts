export interface ProjectCaseStudy {
  id: string;
  name: string;
  oneLiner: string;
  role: string;
  timeline: string;
  stack: string[];
  imagePath: string | null;
  isTodoScreenshot?: boolean;
  isTodoDescription?: boolean;
  links: {
    live?: string;
    github?: string;
  };
  caseStudy: {
    problem: string;
    myRole: string;
    decisions: string[];
    stackDetails: string[];
    outcome: string;
  };
}

export const projectsData: ProjectCaseStudy[] = [
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    oneLiner: 'Light-themed interactive portfolio built with React 19, TypeScript, Tailwind CSS v4, and Three.js.',
    role: 'Frontend Developer',
    timeline: '2025 - Present',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Three.js / R3F', 'GSAP', 'Lenis', 'Firebase'],
    imagePath: null,
    isTodoScreenshot: true,
    links: {
      live: 'https://sunnypasumarthi.in',
      github: 'https://github.com/sunny200551/Portfolio'
    },
    caseStudy: {
      problem: 'Wanted a clean, high-contrast personal site that showcases my projects and skills with solid color blocks and 3D interactions.',
      myRole: 'Built the frontend in React 19 and TypeScript, configured the 5-color palette and typography, and set up Three.js scenes and GSAP animations.',
      decisions: [
        'Strict 5-color palette (white, black, navy, cobalt, orange) with flat fills and hard block shadows.',
        'Procedural cel-shaded 3D elements that pause when off-screen to keep performance high.',
        'Accessible fallback content for all 3D components and respect for prefers-reduced-motion.'
      ],
      stackDetails: [
        'React 19 and Vite for fast development and static bundling.',
        'React Three Fiber and Drei for procedural 3D elements.',
        'Tailwind CSS v4 for clean, utility-first styling.'
      ],
      outcome: 'A lightweight personal website with custom 3D animations and responsive layout across devices.'
    }
  },
  {
    id: 'certifiedpass',
    name: 'CertifiedPass',
    oneLiner: 'Cryptographic credential and certificate verification prototype built during hackathon experimentation.',
    role: 'Frontend Developer (Web3)',
    timeline: '2024 - 2025',
    stack: ['Solidity', 'Web3.js', 'React', 'Node.js', 'Tailwind CSS'],
    imagePath: null,
    isTodoScreenshot: true,
    isTodoDescription: false,
    links: {
      github: 'https://github.com/sunny200551/CertifiedPass'
    },
    caseStudy: {
      problem: 'Paper and PDF certificate verification often relies on manual checking and centralized records.',
      myRole: 'Developed the React verification interface and integrated basic smart contract calls to check certificate hashes.',
      decisions: [
        'Clear verification badges displaying on-chain status.',
        'Simple search interface for students and verifiers.'
      ],
      stackDetails: [
        'Solidity smart contract basics for storing certificate hashes.',
        'React and Web3.js for connecting to Ethereum test networks.'
      ],
      outcome: 'Working prototype demonstrating decentralized certificate lookup and hash verification.'
    }
  },
  {
    id: 'steveslabhub',
    name: 'StevesLabHub',
    oneLiner: 'Academic learning hub and lab experimentation portal enabling students to access coursework manuals and materials.',
    role: 'Frontend Developer',
    timeline: '2024',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Dynamic Filtering', 'Responsive Design'],
    imagePath: null,
    isTodoScreenshot: true,
    links: {
      live: 'https://sunny200551.github.io/StevesLabHub/',
      github: 'https://github.com/sunny200551/StevesLabHub'
    },
    caseStudy: {
      problem: 'Students needed a single place to access lab manuals, experiment guides, and subject notes quickly.',
      myRole: 'Built the responsive web interface, document directory structure, and client-side search filters.',
      decisions: [
        'Quick client-side search by subject and experiment name.',
        'Clean layout designed to work well on mobile phones and lab computers.'
      ],
      stackDetails: [
        'Semantic HTML5 structure and custom responsive CSS.',
        'Vanilla JavaScript for lightweight client-side filtering without external libraries.'
      ],
      outcome: 'Used by classmates and peers to find lab manuals and semester notes during coursework.'
    }
  },
  {
    id: 'foundify-datavalley',
    name: 'Foundify-DataValley',
    oneLiner: 'Resource discovery and cataloging application for organizing project files and endpoints.',
    role: 'Frontend Developer',
    timeline: '2024',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    imagePath: null,
    isTodoScreenshot: true,
    isTodoDescription: false,
    links: {
      github: 'https://github.com/sunny200551/Foundify-DataValley'
    },
    caseStudy: {
      problem: 'Locating shared project assets and data endpoints during group projects can cause confusion and wasted time.',
      myRole: 'Implemented the React UI components, client state management, and API data fetching.',
      decisions: [
        'Tag-based filtering for finding project assets quickly.',
        'Responsive cards with clear status indicators.'
      ],
      stackDetails: [
        'TypeScript interfaces for consistent data handling.',
        'Tailwind CSS for structured, fast component layout.'
      ],
      outcome: 'Streamlined resource browsing with instant filtering across project categories.'
    }
  },
  {
    id: 'encline',
    name: 'Encline',
    oneLiner: 'Interactive web UI project exploring smooth animations and component state transitions.',
    role: 'Frontend Developer',
    timeline: '2024',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    imagePath: null,
    isTodoScreenshot: true,
    isTodoDescription: false,
    links: {
      github: 'https://github.com/sunny200551/Encline'
    },
    caseStudy: {
      problem: 'Exploring how subtle transitions and state feedback improve user experience in web dashboards.',
      myRole: 'Built animated component prototypes with Framer Motion and ensured clean keyboard focus states.',
      decisions: [
        'Spring-based animations for responsive component interactions.',
        'Clear focus outlines and accessible color contrasts.'
      ],
      stackDetails: [
        'React and TypeScript for modular component logic.',
        'Framer Motion for smooth layout transitions.'
      ],
      outcome: 'Clean, responsive UI component experiments running smoothly across browsers.'
    }
  },
  {
    id: 'weather',
    name: 'Weather Analytics',
    oneLiner: 'Weather forecast web app showing current conditions, atmospheric metrics, and multi-day forecasts.',
    role: 'Frontend Developer',
    timeline: '2024',
    stack: ['JavaScript', 'OpenWeather API', 'CSS3', 'HTML5'],
    imagePath: null,
    isTodoScreenshot: true,
    links: {
      live: 'https://sunny200551.github.io/Weather/',
      github: 'https://github.com/sunny200551/Weather'
    },
    caseStudy: {
      problem: 'Wanted a fast, clean weather forecast tool without ads or clutter.',
      myRole: 'Built the application end-to-end, fetching data from the OpenWeather API and rendering it cleanly.',
      decisions: [
        'Clear hierarchy for temperature, humidity, and upcoming days.',
        'Weather condition icon mapping based on live API responses.'
      ],
      stackDetails: [
        'JavaScript Fetch API with error handling for city lookups.',
        'Responsive CSS layout that adapts to mobile and desktop screens.'
      ],
      outcome: 'Fast single-page weather forecast app delivering live data in under a second.'
    }
  }
];
