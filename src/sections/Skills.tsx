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

const CATEGORY_CODE: Record<SkillCategory, { code: string; color: string; textColor: string }> = {
  Frontend: { code: 'FE', color: '#0047AB', textColor: '#FFFFFF' },
  Backend: { code: 'BE', color: '#0A1A3F', textColor: '#FFFFFF' },
  Languages: { code: 'LANG', color: '#FF5A1F', textColor: '#0A0A0A' },
  Database: { code: 'DB', color: '#0047AB', textColor: '#FFFFFF' },
  Blockchain: { code: 'WEB3', color: '#FF5A1F', textColor: '#0A0A0A' },
  Tools: { code: 'TOOL', color: '#0A0A0A', textColor: '#FFFFFF' },
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
}[] = [
  {
    tier: 'Daily',
    title: 'DAILY DRIVERS',
    subtitle: 'Primary Production Arsenal',
    chipBg: 'bg-[#FF5A1F]',
    chipText: 'text-black font-black',
    chipBorder: 'border-2 border-[#0A0A0A]',
    badgeBg: 'bg-black text-white',
    badgeText: 'text-white',
    plankShadow: 'shadow-[4px_4px_0px_#0047AB]',
    sizeClass: 'text-xs sm:text-sm py-2 px-3 sm:px-4',
  },
  {
    tier: 'Comfortable',
    title: 'COMFORTABLE',
    subtitle: 'Production Proficient & Deployed',
    chipBg: 'bg-[#0047AB]',
    chipText: 'text-white font-bold',
    chipBorder: 'border-2 border-[#0A0A0A]',
    badgeBg: 'bg-[#FF5A1F] text-black',
    badgeText: 'text-black',
    plankShadow: 'shadow-[4px_4px_0px_#FF5A1F]',
    sizeClass: 'text-xs sm:text-sm py-1.5 px-2.5 sm:px-3.5',
  },
  {
    tier: 'Learning',
    title: 'LEARNING',
    subtitle: 'Active R&D & Exploring Tech',
    chipBg: 'bg-white',
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

  // Hysteresis hover resolution for BOLT reaction (120ms commit, 600ms leave)
  const handleChipMouseEnter = (skill: PeriodicSkill) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSkill(skill);

      // Funny level-based reaction without walking onto the chips
      if (skill.tier === 'Daily') {
        robotStore.setBolt('cheer', 'happy');
      } else if (skill.tier === 'Comfortable') {
        robotStore.setBolt('salute', 'focused');
      } else {
        robotStore.setBolt('idle', 'curious');
      }
    }, 120);
  };

  const handleChipMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredSkill(null);
      robotStore.setBolt('idle', 'happy');
    }, 600);
  };

  const handleChipClick = (skill: PeriodicSkill) => {
    setPinnedSkill(skill);
    robotStore.setBolt('salute', 'focused'); // Points at inspector
  };

  return (
    <section
      id="skills"
      className="py-20 sm:py-28 lane-padded bg-transparent text-[#0A0A0A] relative z-10 scroll-mt-24 w-full"
    >
      <div className="w-full max-w-[2200px] mx-auto flex flex-col gap-10 sm:gap-14">
        {/* Section Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0A0A0A] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0A0A0A] text-white font-mono text-xs font-bold tracking-wider uppercase">
              04 // LOADOUT
            </span>
          </div>
          <span className="font-mono text-xs text-[#0047AB] font-bold uppercase tracking-wider">
            TECHNICAL EXPERTISE & STACK
          </span>
        </div>

        {/* Section Title & Description */}
        <div className="space-y-3 sm:pl-6 lg:pl-8">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-[#0A0A0A] leading-none">
            SKILL LOADOUT
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/80 max-w-2xl leading-relaxed">
            Technologies and tools I work with daily, comfortably, and actively exploring. Chips are organized on tiered loadout shelves.
          </p>
        </div>

        {/* Category Filter Tabs (Dims non-matching chips instead of removing them, so layout never jumps) */}
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              robotStore.react('all');
            }}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#FF5A1F] text-black shadow-[2px_2px_0px_#0A0A0A]'
                : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
            }`}
          >
            ALL ({skillsData.length})
          </button>
          {SKILL_CATEGORIES.map((cat) => {
            const count = skillsData.filter((s) => s.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  robotStore.react(cat);
                }}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A1F] text-black shadow-[2px_2px_0px_#0A0A0A]'
                    : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* 3 Horizontal Shelves Stacked Vertically */}
        <div className="flex flex-col gap-10 sm:gap-14">
          {SHELF_CONFIG.map((shelf) => {
            const tierSkills = skillsData.filter((s) => s.tier === shelf.tier);

            return (
              <div key={shelf.tier} className="flex flex-col gap-3">
                {/* Shelf Row: Left Label Block + Chip Array sitting on Plank */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 lg:gap-6">
                  {/* Left Label Block */}
                  <div className="lg:w-64 shrink-0 flex flex-col justify-end p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm sm:text-base tracking-tight text-[#0A0A0A] uppercase">
                        {shelf.title}
                      </span>
                      <span className="px-2 py-0.5 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold">
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
                      const catInfo = CATEGORY_CODE[skill.category];

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
                              ? 'ring-2 ring-black shadow-[5px_5px_0px_#0A0A0A] -translate-y-1'
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

                          {/* Small WIP badge for learning shelf */}
                          {shelf.tier === 'Learning' && (
                            <span className="text-[9px] font-black px-1 bg-[#FF5A1F] text-black border border-[#0A0A0A]">
                              WIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Thick Black Plank Under the Chips */}
                <div
                  className={`w-full h-3.5 bg-[#0A0A0A] border-2 border-[#0A0A0A] ${shelf.plankShadow}`}
                />
              </div>
            );
          })}
        </div>

        {/* Inspector Strip Under the Shelves */}
        <div className="bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[5px_5px_0px_#0A0A0A] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-xl sm:text-2xl text-[#0A0A0A] uppercase tracking-tight">
                {activeSkill.name}
              </span>
              <span className="px-2.5 py-0.5 bg-[#0047AB] text-white text-xs font-bold uppercase border border-[#0A0A0A]">
                {activeSkill.category}
              </span>
              <span className="px-2.5 py-0.5 bg-[#FF5A1F] text-black text-xs font-bold uppercase border border-[#0A0A0A]">
                {activeSkill.tier}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#0A0A0A]/85 leading-relaxed font-sans">
              {activeSkill.note}
            </p>
          </div>

          {/* Real Project Associations Derived from Project Stack Data */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-[#0A0A0A]/60 uppercase tracking-wider">
              Used in Projects ({projectsUsingSkill.length})
            </span>
            {projectsUsingSkill.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-w-md">
                {projectsUsingSkill.map((p) => (
                  <span
                    key={p.id}
                    className="px-2.5 py-1 bg-white border border-[#0A0A0A] text-[#0A0A0A] font-mono text-xs font-bold shadow-[2px_2px_0px_#0A0A0A]"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#0A0A0A]/60 italic font-mono">
                Foundational & lab experiments
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
