import React, { useState, useMemo, useRef } from 'react';
import {
  skillsData,
  SKILL_CATEGORIES,
  type PeriodicSkill,
  type SkillCategory,
  type SkillTier,
} from '../data/skills';
import { projectsData } from '../data/projects';
import { robotStore } from '../robot/robotStore';
import { steveVoice } from '../robot/steveVoice';

const CATEGORY_CODE: Record<SkillCategory, { code: string; color: string; textColor: string }> = {
  Frontend: { code: 'FE', color: '#0047AB', textColor: '#FFFFFF' },
  Backend: { code: 'BE', color: '#0A1A3F', textColor: '#FFFFFF' },
  Languages: { code: 'LANG', color: '#FF5C00', textColor: '#0A0A0A' },
  Database: { code: 'DB', color: '#0047AB', textColor: '#FFFFFF' },
  Blockchain: { code: 'WEB3', color: '#FF5C00', textColor: '#0A0A0A' },
  Tools: { code: 'TOOL', color: '#0A0A0A', textColor: '#FFFFFF' },
  Content: { code: 'EDIT', color: '#FF5C00', textColor: '#0A0A0A' },
};

const SHELF_CONFIG: {
  tier: SkillTier;
  title: string;
  subtitle: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  badgeBg: string;
  badgeText: string;
  plankShadow: string;
  sizeClass: string;
  isFocus?: boolean;
}[] = [
  {
    tier: 'Focus',
    title: 'CURRENT FOCUS',
    subtitle: 'Blockchain, Web3 Protocols & DSA Problem-Solving',
    chipBg: 'bg-[#FF5C00]',
    chipText: 'text-black font-black',
    chipBorder: 'border-3 border-[#0A0A0A]',
    badgeBg: 'bg-[#FF5C00] text-black border border-[#0A0A0A]',
    badgeText: 'text-black font-black',
    plankShadow: 'shadow-[6px_6px_0px_#0A0A0A]',
    sizeClass: 'text-xs sm:text-sm md:text-base py-2.5 px-3.5 sm:px-4.5',
    isFocus: true,
  },
  {
    tier: 'Daily',
    title: 'DAILY DRIVERS',
    subtitle: 'Primary Production Arsenal',
    chipBg: 'bg-[#0047AB]',
    chipText: 'text-white font-bold',
    chipBorder: 'border-2 border-[#0A0A0A]',
    badgeBg: 'bg-[#0047AB] text-white',
    badgeText: 'text-white',
    plankShadow: 'shadow-[4px_4px_0px_#0A0A0A]',
    sizeClass: 'text-xs sm:text-sm py-2 px-3 sm:px-4',
  },
  {
    tier: 'Comfortable',
    title: 'COMFORTABLE',
    subtitle: 'Production Proficient & Deployed',
    chipBg: 'bg-white',
    chipText: 'text-[#0A0A0A] font-bold',
    chipBorder: 'border-2 border-[#0A0A0A]',
    badgeBg: 'bg-[#EEF2FA] text-[#0A0A0A]',
    badgeText: 'text-[#0A0A0A]',
    plankShadow: 'shadow-[4px_4px_0px_#0A0A0A]',
    sizeClass: 'text-xs sm:text-sm py-1.5 px-2.5 sm:px-3.5',
  },
  {
    tier: 'Learning',
    title: 'EXPLORING',
    subtitle: 'Active R&D & Exploring Tech',
    chipBg: 'bg-[#FAFAFA]',
    chipText: 'text-[#0A0A0A] font-bold',
    chipBorder: 'border-2 border-dashed border-[#0A0A0A]',
    badgeBg: 'bg-[#0A0A0A] text-white',
    badgeText: 'text-white',
    plankShadow: 'shadow-[4px_4px_0px_#0A0A0A]',
    sizeClass: 'text-xs py-1.5 px-2.5 sm:px-3',
  },
];

export const Skills: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [pinnedSkill, setPinnedSkill] = useState<PeriodicSkill | null>(() => skillsData[0]);
  const [hoveredSkill, setHoveredSkill] = useState<PeriodicSkill | null>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active skill in inspector: hovered skill overrides pinned skill
  const activeSkill = hoveredSkill || pinnedSkill || skillsData[0];

  // Derive which projects use this skill from real project stack data
  const projectsUsingSkill = useMemo(() => {
    if (!activeSkill) return [];
    const skillNorm = activeSkill.name.toLowerCase();
    return projectsData.filter((p) =>
      p.stack.some(
        (tag) =>
          tag.toLowerCase().includes(skillNorm) ||
          skillNorm.includes(tag.toLowerCase()) ||
          tag.toLowerCase().replace(/[^a-z0-9]/g, '') === skillNorm.replace(/[^a-z0-9]/g, '')
      )
    );
  }, [activeSkill]);

  // Hysteresis hover resolution for STEVE reaction (120ms commit, 600ms leave)
  const handleChipMouseEnter = (skill: PeriodicSkill) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSkill(skill);
      robotStore.react(skill.category);
    }, 120);
  };

  const handleChipMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredSkill(null);
    }, 600);
  };

  const handleChipClick = (skill: PeriodicSkill) => {
    setPinnedSkill(skill);
    setHoveredSkill(skill);
    steveVoice.speak('skills_chip_click');
    robotStore.react(skill.category);
  };

  return (
    <section
      id="skills"
      className="w-full bg-[#EEF2FA] text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="pt-20 pb-16 md:pt-28 md:pb-24 lane-padded w-full max-w-[2200px] mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Tag */}
        <div
          data-robot-anchor="skills:shelf"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            04 // SKILLS
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#FF5C00]">
            CURRENT FOCUS & CORE ARSENAL
          </span>
        </div>

        {/* Section Header */}
        <div className="space-y-3 sm:pl-6 lg:pl-8">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-[#0A0A0A] leading-none">
            SKILL LOADOUT
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/80 max-w-2xl leading-relaxed">
            Core engineering focus in Blockchain, Web3 & DSA, with established production frontend proficiencies.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              steveVoice.speak('skills_filter');
              robotStore.react('all');
            }}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#FF5C00] text-black shadow-[2px_2px_0px_#0A0A0A]'
                : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
            }`}
          >
            ALL ({skillsData.length})
          </button>
          {SKILL_CATEGORIES.map((cat) => {
            const count = skillsData.filter((s) => s.category === cat).length;
            if (count === 0) return null; // Only show categories with entries as required
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  steveVoice.speak('skills_filter');
                  robotStore.react(cat);
                }}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5C00] text-black shadow-[2px_2px_0px_#0A0A0A]'
                    : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Shelves Stacked Vertically */}
        <div className="flex flex-col gap-10 sm:gap-14">
          {SHELF_CONFIG.map((shelf) => {
            const tierSkills = skillsData.filter((s) => s.tier === shelf.tier);
            if (tierSkills.length === 0) return null;

            return (
              <div key={shelf.tier} className="flex flex-col gap-3">
                {/* Shelf Row: Left Label Block + Chip Array sitting on Plank */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 lg:gap-6">
                  {/* Left Label Block */}
                  <div className={`lg:w-64 shrink-0 flex flex-col justify-end p-4 bg-white border-2 border-[#0A0A0A] ${
                    shelf.isFocus ? 'shadow-[5px_5px_0px_#FF5C00] border-3' : 'shadow-[4px_4px_0px_#0A0A0A]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-display font-black text-sm sm:text-base tracking-tight uppercase ${
                        shelf.isFocus ? 'text-[#FF5C00]' : 'text-[#0A0A0A]'
                      }`}>
                        {shelf.title}
                      </span>
                      <span className={`px-2 py-0.5 font-mono text-[11px] font-bold ${
                        shelf.isFocus ? 'bg-[#FF5C00] text-black' : 'bg-[#0A0A0A] text-white'
                      }`}>
                        {tierSkills.length}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#0A0A0A]/70 uppercase tracking-wider mt-1">
                      {shelf.subtitle}
                    </span>
                  </div>

                  {/* Chips Container sitting right on top of plank */}
                  <div className="flex-1 flex flex-wrap items-end gap-2.5 sm:gap-3 pb-1">
                    {tierSkills.map((skill) => {
                      const isCategoryMatch =
                        selectedCategory === 'ALL' || skill.category === selectedCategory;
                      const isSelected = activeSkill.id === skill.id;
                      const catInfo = CATEGORY_CODE[skill.category] || { code: 'DEV', color: '#0047AB', textColor: '#FFF' };

                      return (
                        <button
                          key={skill.id}
                          onClick={() => handleChipClick(skill)}
                          onMouseEnter={() => handleChipMouseEnter(skill)}
                          onMouseLeave={handleChipMouseLeave}
                          className={`group relative flex items-center gap-2 font-mono uppercase tracking-tight transition-all duration-200 cursor-pointer select-none ${
                            shelf.chipBg
                          } ${shelf.chipText} ${shelf.chipBorder} ${shelf.sizeClass} ${
                            isCategoryMatch
                              ? 'opacity-100 hover:-translate-y-1.5 hover:rotate-1 hover:shadow-[6px_6px_0px_#0A0A0A]'
                              : 'opacity-25 hover:opacity-80'
                          } ${
                            isSelected
                              ? 'ring-2 ring-black shadow-[6px_6px_0px_#0A0A0A] -translate-y-1'
                              : 'shadow-[3px_3px_0px_#0A0A0A]'
                          }`}
                        >
                          <span>{skill.name}</span>

                          {/* Category Code Pill */}
                          <span
                            className="px-1.5 py-0.2 font-mono text-[9px] font-black border border-[#0A0A0A]"
                            style={{
                              backgroundColor: catInfo.color,
                              color: catInfo.textColor,
                            }}
                          >
                            {catInfo.code}
                          </span>

                          {/* Orange FOCUS badge for Focus shelf */}
                          {shelf.isFocus && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 bg-black text-[#FF5C00] border border-black uppercase tracking-wider">
                              FOCUS
                            </span>
                          )}

                          {/* Small WIP badge for learning shelf */}
                          {shelf.tier === 'Learning' && (
                            <span className="text-[9px] font-black px-1 bg-[#FF5C00] text-black border border-[#0A0A0A]">
                              WIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Neo-brutalist Plank base line */}
                <div
                  className={`w-full h-2.5 bg-[#0A0A0A] ${shelf.plankShadow} border-t border-black/30`}
                />
              </div>
            );
          })}
        </div>

        {/* Dynamic Skill Detail Inspector */}
        {activeSkill && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0A0A0A]/10 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-xs font-black px-2.5 py-1 border-2 border-[#0A0A0A]"
                  style={{
                    backgroundColor: CATEGORY_CODE[activeSkill.category]?.color || '#0047AB',
                    color: CATEGORY_CODE[activeSkill.category]?.textColor || '#FFF',
                  }}
                >
                  {CATEGORY_CODE[activeSkill.category]?.code} // {activeSkill.category.toUpperCase()}
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A]">
                  {activeSkill.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0A0A0A]/70 uppercase">
                  CLASSIFICATION:
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] uppercase">
                  {activeSkill.tier === 'Focus' ? 'CURRENT FOCUS' : activeSkill.tier}
                </span>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed">
              {activeSkill.note}
            </p>

            {/* Cross-Referenced Projects */}
            {projectsUsingSkill.length > 0 && (
              <div className="pt-3 border-t border-[#0A0A0A]/10 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0A0A0A]/70 uppercase">
                  ACTIVE IN PROJECTS:
                </span>
                {projectsUsingSkill.map((proj) => (
                  <span
                    key={proj.id}
                    className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FF5C00] text-black border border-[#0A0A0A]"
                  >
                    {proj.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default Skills;
