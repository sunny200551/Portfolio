import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Globe, Code, Shield } from 'lucide-react';
import { SpotlightCard } from '../components/SpotlightCard';

interface TimelineItem {
  year: string;
  title: string;
  icon: React.ElementType;
  description: string;
  skills: string[];
}

const timelineData: TimelineItem[] = [
  {
    year: '2023',
    title: 'Started Programming',
    icon: Terminal,
    description: 'Began the Computer Science journey by learning foundational languages. Mastered programming fundamentals, flow control, arrays, and standard algorithm logic.',
    skills: ['C Programming', 'Python Basics', 'Algorithms Basics']
  },
  {
    year: '2024',
    title: 'Frontend Development',
    icon: Globe,
    description: 'Transitioned into web development, focusing on semantic interfaces, modern layouts, styling utilities, and responsive design systems.',
    skills: ['HTML5 & CSS3', 'JavaScript ES6', 'Responsive Web Design', 'Git & GitHub']
  },
  {
    year: '2025',
    title: 'Web Development Projects',
    icon: Code,
    description: 'Engineered operational web applications. Integrated live data via RESTful web APIs and designed collaborative structures.',
    skills: ['Weather Applications', 'Academic Platform Design']
  },
  {
    year: '2026',
    title: 'Full Stack & Blockchain Exploration',
    icon: Shield,
    description: 'Currently expanding technical stack into backend service layers, server configurations, distributed databases, smart contract languages, and decentralized architectures.',
    skills: ['Node.js', 'Firebase / Firestore', 'Smart Contracts', 'Web3 Concepts']
  }
];

export const Journey: React.FC = () => {
  return (
    <section id="journey" className="py-24 px-4 max-w-4xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Learning Journey
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Academic & Developer Timeline
        </p>
      </div>

      <div className="relative border-l border-zinc-800 dark:border-zinc-800 ml-4 md:ml-32 pl-6 md:pl-8 space-y-12">
        {timelineData.map((item, idx) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative"
            >
              {/* Year indicator for desktop (fixed on left side) */}
              <div className="absolute hidden md:block -left-[180px] w-28 text-right top-1">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-mono">
                  {item.year}
                </span>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                  Milestone
                </div>
              </div>

              {/* Node bubble on the timeline line */}
              <div className="absolute -left-[39px] md:-left-[47px] top-1 w-6 h-6 rounded-full bg-zinc-950 border-2 border-violet-500 flex items-center justify-center shadow-lg">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              </div>

              {/* Card content */}
              <SpotlightCard className="p-6">
                <div className="flex flex-col gap-3">
                  {/* Mobile Year Badge */}
                  <div className="md:hidden flex items-center gap-2 mb-1">
                    <span className="text-lg font-extrabold text-cyan-400 font-mono">
                      {item.year}
                    </span>
                    <span className="text-xs text-zinc-600 font-mono">•</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 dark:text-zinc-100">{item.title}</h3>
                  </div>

                  <p className="text-sm text-zinc-400 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono py-0.5 px-2 rounded bg-violet-500/5 border border-violet-500/10 text-violet-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
export default Journey;
