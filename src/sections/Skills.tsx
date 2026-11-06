import React, { useState, useEffect, useRef, useTransition } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  skillsData,
  SKILL_CATEGORIES,
  type PeriodicSkill,
  type SkillCategory,
  type SkillTier,
} from '../data/skills';
import { robotStore } from '../robot/robotStore';

gsap.registerPlugin(ScrollTrigger);

// Tier badge icon helper
const TierMarker: React.FC<{ tier: SkillTier; className?: string }> = ({ tier, className = '' }) => {
  if (tier === 'Daily') {
    return (
      <span
        title="Daily"
        className={`inline-block w-2.5 h-2.5 bg-current border border-current shrink-0 ${className}`}
      />
    );
  }
  if (tier === 'Comfortable') {
    return (
      <span
        title="Comfortable"
        className={`inline-flex w-2.5 h-2.5 border border-current overflow-hidden shrink-0 ${className}`}
      >
        <span className="w-1/2 h-full bg-current" />
        <span className="w-1/2 h-full bg-transparent" />
      </span>
    );
  }
  return (
    <span
      title="Learning"
      className={`inline-block w-2.5 h-2.5 border-2 border-current bg-transparent shrink-0 ${className}`}
    />
  );
};

// Periodic category style configurations
const getCategoryStyles = (category: SkillCategory, isDimmed: boolean) => {
  if (isDimmed) {
    return 'bg-[#EEF2FA] text-[#0A0A0A]/35 border-2 border-[#0A0A0A]/20 shadow-none pointer-events-none';
  }

  switch (category) {
    case 'Frontend':
      return 'bg-[#0047AB] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
    case 'Backend':
      return 'bg-[#0A1A3F] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
    case 'Languages':
      return 'bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
    case 'Database':
      return 'bg-white text-[#0A0A0A] border-2 border-[#0047AB] shadow-[4px_4px_0px_#0A0A0A]';
    case 'Blockchain':
      return 'bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
    case 'Tools':
      return 'bg-white text-[#0047AB] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
    default:
      return 'bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]';
  }
};

interface TileProps {
  skill: PeriodicSkill;
  isDimmed: boolean;
  isFlipped: boolean;
  onFlip: (id: string) => void;
}

const PeriodicTile: React.FC<TileProps> = ({ skill, isDimmed, isFlipped, onFlip }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const hoverDwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth DOM transform on mousemove without React re-renders
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDimmed || isFlipped || !innerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Max 8 degrees tilt following pointer
    const rotateX = Math.max(-8, Math.min(8, ((y - centerY) / centerY) * -8));
    const rotateY = Math.max(-8, Math.min(8, ((x - centerX) / centerX) * 8));
    innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  // 120ms hover dwell before committing target
  const handleMouseEnter = () => {
    if (isDimmed) return;
    if (hoverDwellTimer.current) clearTimeout(hoverDwellTimer.current);
    hoverDwellTimer.current = setTimeout(() => {
      robotStore.setHoveredSlab({ index: skill.index, name: skill.name });
    }, 120);
  };

  // 400ms leave delay before returning to gutter
  const handleMouseLeave = () => {
    if (hoverDwellTimer.current) {
      clearTimeout(hoverDwellTimer.current);
      hoverDwellTimer.current = null;
    }
    if (innerRef.current && !isFlipped) {
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
    setTimeout(() => {
      if (robotStore.getState().hoveredSlab?.index === skill.index) {
        robotStore.setHoveredSlab(null);
      }
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip(skill.id);
    }
  };

  const categoryStyle = getCategoryStyles(skill.category, isDimmed);
  const formattedIndex = String(skill.index).padStart(2, '0');

  return (
    <div
      ref={cardRef}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      onClick={() => !isDimmed && onFlip(skill.id)}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-robot-react="skills:tile"
      className="periodic-tile relative aspect-square select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
      style={{
        perspective: '800px',
      }}
    >
      <div
        ref={innerRef}
        className="w-full h-full relative transition-transform duration-200"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
        }}
      >
        {/* FRONT FACE */}
        <div
          className={`absolute inset-0 w-full h-full p-2.5 sm:p-3 flex flex-col justify-between transition-colors ${categoryStyle}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top Row: Index + Tier Marker */}
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[10px] sm:text-xs font-bold opacity-80">
              {formattedIndex}
            </span>
            <TierMarker tier={skill.tier} />
          </div>

          {/* Center: Big 2-3 letter symbol */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none">
              {skill.symbol}
            </span>
          </div>

          {/* Bottom: Full Name */}
          <div className="w-full text-center">
            <span className="font-mono font-bold text-[10px] sm:text-[11px] truncate block w-full leading-tight">
              {skill.name}
            </span>
          </div>
        </div>

        {/* BACK FACE (Revealed on Flip) */}
        <div
          className="absolute inset-0 w-full h-full p-3 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between text-left"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="flex items-center justify-between border-b border-[#0A0A0A]/20 pb-1">
            <span className="font-mono text-[9px] font-black uppercase text-[#0047AB]">
              {skill.category}
            </span>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-[#FF5A1F] text-black border border-[#0A0A0A]">
              {skill.tier}
            </span>
          </div>

          <p className="font-mono text-[10px] sm:text-[11px] leading-tight text-[#0A0A0A] line-clamp-4 my-auto">
            {skill.note}
          </p>

          <div className="text-[9px] font-mono text-[#0A0A0A]/60 flex items-center justify-between">
            <span>#{formattedIndex}</span>
            <span className="font-bold underline text-[#0047AB]">FLIP ↩</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'LIST'>('TABLE');
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();
  const sectionRef = useRef<HTMLElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Staggered pop-in wave on scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tiles = sectionRef.current?.querySelectorAll('.periodic-tile');
      if (tiles && tiles.length > 0) {
        gsap.fromTo(
          tiles,
          { scale: 0.9, y: 16 },
          {
            scale: 1,
            y: 0,
            duration: 0.4,
            stagger: {
              each: 0.02,
              from: 'start',
            },
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [viewMode]);

  const handleFilterClick = (cat: string) => {
    startTransition(() => {
      setActiveCategory(cat);
    });
  };

  const handleTileFlip = (id: string) => {
    setFlippedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Header 04 // SKILLS */}
        <div className="flex items-center gap-3 mb-4">
          <span
            data-robot-anchor="skills:tag"
            data-robot-offset-x="-50"
            data-robot-offset-y="-20"
            className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]"
          >
            04 // SKILLS
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="hidden sm:inline-block font-mono text-xs font-bold text-[#0047AB]">
            PERIODIC SKILL TABLE
          </span>
        </div>

        <div className="mb-8">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
            SKILL TABLE
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl font-bold">
            Technologies and tools I work with.
          </p>
        </div>

        {/* Controls Row (Filters, Table/List Toggle, Tier Legend) */}
        <div className="mb-8 p-3 sm:p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Left: Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterClick('ALL')}
              className={`px-3 py-1.5 font-mono text-xs font-bold border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-[#FF5A1F] text-black translate-x-0.5 translate-y-0.5 shadow-none'
                  : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
              }`}
            >
              ALL ({skillsData.length})
            </button>

            {SKILL_CATEGORIES.map((cat) => {
              const count = skillsData.filter((s) => s.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleFilterClick(cat)}
                  className={`px-2.5 py-1.5 font-mono text-xs font-bold border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#0047AB] text-white translate-x-0.5 translate-y-0.5 shadow-none'
                      : 'bg-white text-[#0A0A0A] hover:bg-[#EEF2FA]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Right: Legend & TABLE | LIST Toggle */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-[#0A0A0A]/10">
            {/* Tier Markers Legend */}
            <div className="flex items-center gap-3 font-mono text-[11px] font-bold text-[#0A0A0A]/80">
              <span className="flex items-center gap-1.5">
                <TierMarker tier="Daily" className="text-[#0A0A0A]" />
                <span>Daily</span>
              </span>
              <span className="flex items-center gap-1.5">
                <TierMarker tier="Comfortable" className="text-[#0A0A0A]" />
                <span>Comfortable</span>
              </span>
              <span className="flex items-center gap-1.5">
                <TierMarker tier="Learning" className="text-[#0A0A0A]" />
                <span>Learning</span>
              </span>
            </div>

            {/* TABLE | LIST Segmented Toggle */}
            <div className="flex items-center border-2 border-[#0A0A0A] bg-white shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold shrink-0">
              <button
                onClick={() => setViewMode('TABLE')}
                aria-label="Table View"
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  viewMode === 'TABLE'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#0A0A0A] hover:bg-[#EEF2FA]'
                }`}
              >
                TABLE
              </button>
              <div className="w-0.5 h-4 bg-[#0A0A0A]" />
              <button
                onClick={() => setViewMode('LIST')}
                aria-label="List View"
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  viewMode === 'LIST'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#0A0A0A] hover:bg-[#EEF2FA]'
                }`}
              >
                LIST
              </button>
            </div>
          </div>

        </div>

        {/* Content Views */}
        {viewMode === 'TABLE' ? (
          /* TABLE VIEW: Responsive Square Periodic Tiles Grid */
          <div
            ref={gridContainerRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          >
            {skillsData.map((skill) => {
              const isDimmed = activeCategory !== 'ALL' && skill.category !== activeCategory;
              const isFlipped = Boolean(flippedMap[skill.id]);

              return (
                <PeriodicTile
                  key={skill.id}
                  skill={skill}
                  isDimmed={isDimmed}
                  isFlipped={isFlipped}
                  onFlip={handleTileFlip}
                />
              );
            })}
          </div>
        ) : (
          /* LIST VIEW: Compact Two-Column List Grouped by Category */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.filter(
              (cat) => activeCategory === 'ALL' || cat === activeCategory
            ).map((cat) => {
              const catSkills = skillsData.filter((s) => s.category === cat);
              return (
                <div
                  key={cat}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-2">
                    <h3 className="font-display font-black text-lg uppercase text-[#0A0A0A]">
                      {cat}
                    </h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A]">
                      {catSkills.length} SKILLS
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 font-mono text-xs">
                    {catSkills.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 bg-[#EEF2FA] border border-[#0A0A0A] flex items-center justify-between gap-3 hover:bg-[#FF5A1F] hover:text-black transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-black text-[#0047AB] w-6 shrink-0">
                            {s.symbol}
                          </span>
                          <span className="font-bold truncate">{s.name}</span>
                          
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <TierMarker tier={s.tier} />
                          <span className="text-[11px] font-bold">{s.tier}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default Skills;
