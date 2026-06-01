import React, { useState } from 'react';
import { SpotlightCard } from '../components/SpotlightCard';
import { RadarChart } from '../components/RadarChart';
import { OrbitSystem } from '../components/OrbitSystem';
import { Cpu, Layout, Server, Database, Shield, Wrench } from 'lucide-react';

interface SkillCategory {
  title: string;
  icon: React.ElementType;
  skills: string[];
  color: string;
  glow: string;
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Languages',
    icon: Cpu,
    skills: ['C', 'Python', 'Java', 'JavaScript'],
    color: 'text-violet-400 border-violet-500/20',
    glow: 'rgba(139, 92, 246, 0.15)'
  },
  {
    title: 'Frontend',
    icon: Layout,
    skills: ['HTML', 'CSS', 'React', 'Next.js', 'TailwindCSS'],
    color: 'text-cyan-400 border-cyan-500/20',
    glow: 'rgba(59, 130, 246, 0.15)'
  },
  {
    title: 'Backend',
    icon: Server,
    skills: ['Node.js', 'Express.js', 'Firebase'],
    color: 'text-emerald-400 border-emerald-500/20',
    glow: 'rgba(52, 211, 153, 0.15)'
  },
  {
    title: 'Database',
    icon: Database,
    skills: ['MongoDB', 'Firestore', 'MySQL'],
    color: 'text-amber-400 border-amber-500/20',
    glow: 'rgba(251, 191, 36, 0.15)'
  },
  {
    title: 'Blockchain',
    icon: Shield,
    skills: ['Blockchain Fundamentals', 'Smart Contracts', 'Web3 Concepts'],
    color: 'text-purple-400 border-purple-500/20',
    glow: 'rgba(168, 85, 247, 0.15)'
  },
  {
    title: 'Tools',
    icon: Wrench,
    skills: ['Git', 'GitHub', 'VS Code', 'Postman', 'Figma'],
    color: 'text-rose-400 border-rose-500/20',
    glow: 'rgba(244, 63, 94, 0.15)'
  }
];

export const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section id="skills" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Technical Expertise
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Skills Ecosystem & Proficiency
        </p>
      </div>

      <div className="bento-grid">
        {/* Radar Chart (Col Span 6 on Large Screens) */}
        <SpotlightCard className="col-span-12 md:col-span-6 flex flex-col items-center justify-between min-h-[380px] p-6">
          <div className="text-center md:text-left w-full mb-4">
            <h3 className="text-lg font-bold text-zinc-200">Skill Proficiencies</h3>
            <p className="text-xs text-zinc-500 font-mono">Radar Distribution Plot</p>
          </div>
          <RadarChart />
          <div className="w-full text-center text-xs text-zinc-500 font-mono mt-4">
            Custom metric evaluating core areas of engineering expertise
          </div>
        </SpotlightCard>

        {/* Orbit System (Col Span 6 on Large Screens) */}
        <SpotlightCard className="col-span-12 md:col-span-6 flex flex-col items-center justify-between min-h-[380px] p-6">
          <div className="text-center md:text-left w-full mb-4">
            <h3 className="text-lg font-bold text-zinc-200">Interactive Tech Orbit</h3>
            <p className="text-xs text-zinc-500 font-mono">System Core Elements</p>
          </div>
          <OrbitSystem />
          <div className="w-full text-center text-xs text-zinc-500 font-mono mt-4">
            Hover over tech icons to see detail categorizations
          </div>
        </SpotlightCard>

        {/* Dynamic Detailed Grid Lists */}
        {skillCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.title;
          
          return (
            <SpotlightCard
              key={category.title}
              onClick={() => setActiveCategory(isActive ? null : category.title)}
              glowColor={category.glow}
              className="col-span-12 sm:col-span-6 lg:col-span-4 cursor-pointer hover:border-violet-500/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-zinc-900 border ${category.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <h4 className="text-base font-bold text-zinc-200">{category.title}</h4>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">[{category.skills.length} Items]</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono py-1 px-2.5 rounded-md bg-white/3 dark:bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
};
export default Skills;
