import { robotStore } from '../robot/robotStore';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Layers, Box } from 'lucide-react';
import { SkillsIsometricStack } from '../components/three/SkillsIsometricStack';
import { skillsData, type SkillCategoryGroup, type SkillTier } from '../data/skills';

const tierBadgeStyles: Record<SkillTier, { bg: string; text: string; label: string }> = {
  Daily: {
    bg: 'bg-[#FF5A1F]',
    text: 'text-black',
    label: 'Daily'
  },
  Comfortable: {
    bg: 'bg-[#0047AB]',
    text: 'text-white',
    label: 'Comfortable'
  },
  Learning: {
    bg: 'bg-[#EEF2FA]',
    text: 'text-[#0A0A0A]',
    label: 'Learning'
  }
};

export const Skills: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<SkillCategoryGroup>(skillsData[0]); // Preselected Frontend
  const [viewMode, setViewMode] = useState<'3D' | 'LIST'>('3D');
  const [isInView, setIsInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const canvasBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    const el = canvasBoxRef.current;
    if (el) observer.observe(el);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="skills" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]">
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Tag & Segmented Toggle (3D | LIST) */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div data-robot-anchor="skills:tag" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 flex-grow">
            <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
              05 // SKILLS
            </span>
            <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          </div>

          {/* Segmented Toggle */}
          <div className="flex items-center border-2 border-[#0A0A0A] bg-white shadow-[3px_3px_0px_#0A0A0A] font-mono text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode('3D')}
              aria-label="3D View"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors cursor-pointer ${
                viewMode === '3D'
                  ? 'bg-[#FF5A1F] text-black font-extrabold'
                  : 'text-[#0A0A0A] hover:bg-[#EEF2FA]'
              }`}
            >
              <Box size={14} />
              <span>3D</span>
            </button>
            <div className="w-[2px] h-6 bg-[#0A0A0A]" />
            <button
              onClick={() => setViewMode('LIST')}
              aria-label="List View"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-[#FF5A1F] text-black font-extrabold'
                  : 'text-[#0A0A0A] hover:bg-[#EEF2FA]'
              }`}
            >
              <Layers size={14} />
              <span>LIST</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
            TECHNICAL SKILLS
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl">
            Technologies and tools I work with across frontend, programming, and development.
          </p>
        </div>

        {/* Main Component Shell */}
        <div className="bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] p-6 sm:p-8">
          
          {viewMode === '3D' ? (
            <div className="grid grid-cols-12 gap-8">
              
              {/* 3D Canvas Column (Left) */}
              <div 
                ref={canvasBoxRef} 
                className="col-span-12 lg:col-span-7 h-[360px] sm:h-[420px] bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] relative overflow-hidden flex flex-col justify-between"
              >
                {/* Helper text badge */}
                <div className="absolute top-3 left-3 z-10 font-mono text-[11px] font-bold px-2.5 py-1 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                  Click a block
                </div>

                <Suspense fallback={
                  <div className="flex items-center justify-center h-full font-mono text-xs text-[#0A0A0A] font-bold">
                    LOADING 3D VIEW...
                  </div>
                }>
                  <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [4.6, 5.2, 5.4], fov: 38 }}
                    gl={{ alpha: true, antialias: true }}
                    frameloop={isInView && isTabVisible ? 'always' : 'never'}
                  >
                    <ambientLight intensity={1.1} />
                    <directionalLight position={[6, 9, 5]} intensity={1.5} />
                    <directionalLight position={[-5, -2, -4]} intensity={0.5} />
                    
                    <SkillsIsometricStack
                      onSelectGroup={(group) => setActiveGroup(group)}
                      selectedGroup={activeGroup}
                    />
                  </Canvas>
                </Suspense>

                {/* Keyboard accessible selector buttons */}
                <div className="p-2 border-t-2 border-[#0A0A0A] bg-white flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {skillsData.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroup(g)}
                      onMouseEnter={() => robotStore.setHoveredSlab({ index: skillsData.indexOf(g), name: g.category })}
                      onMouseLeave={() => robotStore.setHoveredSlab(null)}
                      className={`px-2 py-0.5 border border-[#0A0A0A] font-bold cursor-pointer transition-colors ${
                        activeGroup.id === g.id
                          ? 'bg-[#FF5A1F] text-black'
                          : 'bg-[#EEF2FA] text-[#0A0A0A] hover:bg-white'
                      }`}
                    >
                      {g.category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Card (Right) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col justify-between bg-white border-2 border-[#0A0A0A] p-6 sm:p-7 shadow-[4px_4px_0px_#0A0A0A]">
                <div className="flex flex-col gap-4">
                  <div className="border-b-2 border-[#0A0A0A] pb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FF5A1F] text-black border border-[#0A0A0A] uppercase">
                      SELECTED CATEGORY
                    </span>
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#0A0A0A] mt-2">
                      {activeGroup.category}
                    </h3>
                    <p className="font-sans text-xs text-[#0A0A0A]/80 mt-1">
                      {activeGroup.description}
                    </p>
                  </div>

                  {/* Skills list inside active group */}
                  <div className="flex flex-col gap-2 font-mono text-xs">
                    {activeGroup.skills.map((skill) => {
                      const badge = tierBadgeStyles[skill.tier];
                      return (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between p-2.5 bg-[#EEF2FA] border border-[#0A0A0A]"
                        >
                          <span className="font-bold text-[#0A0A0A]">{skill.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 border border-[#0A0A0A] ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#0A0A0A]/20 flex items-center justify-between font-mono text-[11px] text-[#0A0A0A]/70 mt-4">
                  <span>{activeGroup.skills.length} skills listed</span>
                  <span className="text-[#0047AB] font-bold">{activeGroup.category}</span>
                </div>
              </div>

            </div>
          ) : (
            /* Full Categorized List View inside the SAME container */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillsData.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-[#0A0A0A]/10 pb-2.5 mb-3">
                        <h4 className="font-display font-black text-base uppercase text-[#0A0A0A]">
                          {group.category}
                        </h4>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A]">
                          {group.skills.length} ITEMS
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono text-xs">
                        {group.skills.map((skill) => {
                          const badge = tierBadgeStyles[skill.tier];
                          return (
                            <div
                              key={skill.name}
                              className="flex items-center justify-between p-2 bg-[#EEF2FA] border border-[#0A0A0A]"
                            >
                              <span className="font-bold text-[#0A0A0A]">{skill.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 border border-[#0A0A0A] ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default Skills;
