import React, { useState, useEffect } from 'react';
import { Palette, Search, PenTool, PlayCircle, Code2 } from 'lucide-react';
import { robotStore } from '../robot/robotStore';

export type DesignStageId = 'research' | 'wireframe' | 'prototype' | 'build';

interface MethodologyStage {
  id: DesignStageId;
  step: string;
  title: string;
  icon: React.ElementType;
  desc: string;
  deliverables: string[];
  boltAction: string;
}

const colorTokens = [
  { name: 'White', hex: '#FFFFFF', role: 'Base Background & Surfaces', border: 'border-[#0A0A0A]' },
  { name: 'Black', hex: '#0A0A0A', role: 'Typography & 2px Borders', text: 'text-white' },
  { name: 'Navy', hex: '#0A1A3F', role: 'Headings & Solid Accent Panels', text: 'text-white' },
  { name: 'Cobalt', hex: '#0047AB', role: 'Interactive Highlights & Focus', text: 'text-white' },
  { name: 'Orange', hex: '#FF5A1F', role: 'Primary CTAs & Badges', text: 'text-black' },
];

const methodologyStages: MethodologyStage[] = [
  {
    id: 'research',
    step: '01',
    title: 'Research',
    icon: Search,
    desc: 'Defining problem constraints, analyzing user journeys, gathering technical requirements, and establishing accessible contrast benchmarks.',
    deliverables: ['Information Architecture', 'User Journey Mapping', 'WCAG AA Benchmark'],
    boltAction: 'BOLT measures typography & checks guidelines with ruler'
  },
  {
    id: 'wireframe',
    step: '02',
    title: 'Wireframe',
    icon: PenTool,
    desc: 'Low-fidelity layout exploration aligned to strict 8px spatial grids, testing container hierarchies before committing to code.',
    deliverables: ['8px Baseline Grid', 'Low-Fidelity Layouts', 'Responsive Breakpoint Plans'],
    boltAction: 'BOLT draws dashed spatial boxes in the air'
  },
  {
    id: 'prototype',
    step: '03',
    title: 'Prototype',
    icon: PlayCircle,
    desc: 'High-fidelity Figma components, interactive state models (hover, active, focus, reduced-motion), and hard offset shadow tokens.',
    deliverables: ['Interactive Component Sets', 'Figma Token Library', 'Micro-Interactions'],
    boltAction: 'BOLT wields big Figma cursor & clicks prototype triggers'
  },
  {
    id: 'build',
    step: '04',
    title: 'Build',
    icon: Code2,
    desc: 'Translating design tokens into production React 19, TypeScript, and Tailwind CSS v4 components with verified performance and zero blur.',
    deliverables: ['React 19 Components', 'Tailwind CSS v4 Tokens', 'Accessible Keyboard Flow'],
    boltAction: 'BOLT types rapidly on miniature mechanical keyboard'
  }
];

export const Design: React.FC = () => {
  const [activeStage, setActiveStage] = useState<DesignStageId>('research');

  // Sync active stage to robotStore
  const handleStageSelect = (stageId: DesignStageId) => {
    setActiveStage(stageId);
    robotStore.setDesignStage(stageId);
  };

  // Automatically cycle through stages when section is active if user isn't hovering
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const unsubscribe = robotStore.subscribe(() => {
      const isDesignActive = robotStore.getState().activeSection === 'design';
      if (isDesignActive && !interval) {
        let idx = 0;
        interval = setInterval(() => {
          idx = (idx + 1) % methodologyStages.length;
          const nextStage = methodologyStages[idx].id;
          setActiveStage(nextStage);
          robotStore.setDesignStage(nextStage);
        }, 3600);
      } else if (!isDesignActive && interval) {
        clearInterval(interval);
      }
    });

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <section 
      id="design" 
      className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]"
    >
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Tag */}
        <div 
          data-robot-anchor="design:header" 
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3 mb-8"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            04 // DESIGN
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#FF5A1F]">
            METHODOLOGY &amp; UI ARCHITECTURE
          </span>
        </div>

        {/* Section Headline */}
        <div className="mb-12">
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none mb-4">
            FOUR-STAGE UI METHODOLOGY.
          </h2>
          <p className="font-mono text-sm sm:text-base text-[#0A0A0A]/80 max-w-2xl leading-relaxed">
            From problem research and 8px-grid wireframes in Figma to tokenized component systems built with React 19 and Tailwind CSS v4.
          </p>
        </div>

        {/* 4 Methodology Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {methodologyStages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;
            return (
              <div 
                key={stage.id}
                id={`stage-${stage.id}`}
                data-robot-anchor={`design:${stage.id}`}
                data-robot-offset-x="-30"
                data-robot-offset-y="-15"
                onMouseEnter={() => handleStageSelect(stage.id)}
                onClick={() => handleStageSelect(stage.id)}
                className={`p-5 border-2 border-[#0A0A0A] cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#EEF2FA] shadow-[6px_6px_0px_#FF5A1F] -translate-y-1'
                    : 'bg-white shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#EEF2FA]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 border border-[#0A0A0A] ${
                      isSelected ? 'bg-[#FF5A1F] text-black font-extrabold' : 'bg-white text-[#0A0A0A]'
                    }`}>
                      STAGE {stage.step}
                    </span>
                    <div className={`w-8 h-8 flex items-center justify-center border-2 border-[#0A0A0A] ${
                      isSelected ? 'bg-[#0047AB] text-white' : 'bg-white text-[#0A0A0A]'
                    }`}>
                      <Icon size={16} />
                    </div>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#0A0A0A] mb-2">
                    {stage.title}
                  </h3>

                  <p className="font-mono text-xs text-[#0A0A0A]/80 leading-relaxed mb-4">
                    {stage.desc}
                  </p>
                </div>

                <div>
                  <div className="pt-3 border-t border-[#0A0A0A]/15 mb-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-[#0047AB] block mb-1">
                      Deliverables:
                    </span>
                    <ul className="font-mono text-[11px] text-[#0A0A0A]/90 space-y-0.5">
                      {stage.deliverables.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] font-mono text-[#0A0A0A]/70 italic bg-white p-1.5 border border-[#0A0A0A]/30">
                    &bull; {stage.boltAction}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5-Color Palette Strip */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] mb-3 flex items-center gap-2">
            <Palette size={14} className="text-[#FF5A1F]" />
            <span>Strict 5-Color Neo-Brutalist Palette</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {colorTokens.map((token) => (
              <div 
                key={token.hex}
                className="p-4 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between h-24"
                style={{ backgroundColor: token.hex }}
              >
                <div className={`font-mono text-xs font-bold uppercase ${token.text || 'text-[#0A0A0A]'}`}>
                  {token.name}
                </div>
                <div>
                  <div className={`font-mono text-xs font-black tracking-wider ${token.text || 'text-[#0A0A0A]'}`}>
                    {token.hex}
                  </div>
                  <div className={`text-[10px] font-mono leading-tight mt-0.5 opacity-80 ${token.text || 'text-[#0A0A0A]'}`}>
                    {token.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Design;
