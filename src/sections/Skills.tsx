import React, { useState, useLayoutEffect, useRef } from 'react';
import { Layers, Server, Code2, Database, Cpu, Wrench } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  skillsData,
  SKILL_CATEGORIES,
  type SkillCategory,
  type SkillTier,
} from '../data/skills';
import { robotStore } from '../robot/robotStore';

gsap.registerPlugin(ScrollTrigger);

// Tier marker icon helper
const TierBadge: React.FC<{ tier: SkillTier }> = ({ tier }) => {
  if (tier === 'Daily') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#FF5A1F]">
        <span className="w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A]" />
        <span>DAILY</span>
      </span>
    );
  }
  if (tier === 'Comfortable') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#0047AB]">
        <span className="w-2 h-2 bg-[#0047AB] border border-[#0A0A0A]" />
        <span>COMFORTABLE</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#0A0A0A]/70">
      <span className="w-2 h-2 border-2 border-[#0A0A0A] bg-transparent" />
      <span>LEARNING</span>
    </span>
  );
};

// Category config with neo-brutalist themes
const CATEGORY_META: Record<
  SkillCategory,
  {
    icon: React.ElementType;
    headerBg: string;
    headerText: string;
    badgeBg: string;
    badgeText: string;
    description: string;
  }
> = {
  Frontend: {
    icon: Layers,
    headerBg: 'bg-[#0047AB]',
    headerText: 'text-white',
    badgeBg: 'bg-[#FF5A1F]',
    badgeText: 'text-black',
    description: 'Component architecture, responsive layouts, and performance.',
  },
  Backend: {
    icon: Server,
    headerBg: 'bg-[#0A1A3F]',
    headerText: 'text-white',
    badgeBg: 'bg-[#EEF2FA]',
    badgeText: 'text-[#0A0A0A]',
    description: 'RESTful endpoints, server-side logic, and microservices.',
  },
  Languages: {
    icon: Code2,
    headerBg: 'bg-[#FF5A1F]',
    headerText: 'text-black',
    badgeBg: 'bg-[#0A0A0A]',
    badgeText: 'text-white',
    description: 'Core syntax, type systems, and algorithmic problem-solving.',
  },
  Database: {
    icon: Database,
    headerBg: 'bg-white',
    headerText: 'text-[#0A0A0A]',
    badgeBg: 'bg-[#0047AB]',
    badgeText: 'text-white',
    description: 'Data models, schema design, and query optimization.',
  },
  Blockchain: {
    icon: Cpu,
    headerBg: 'bg-[#0A0A0A]',
    headerText: 'text-white',
    badgeBg: 'bg-[#FF5A1F]',
    badgeText: 'text-black',
    description: 'Smart contracts, web3 providers, and decentralized protocols.',
  },
  Tools: {
    icon: Wrench,
    headerBg: 'bg-[#EEF2FA]',
    headerText: 'text-[#0A0A0A]',
    badgeBg: 'bg-[#0A1A3F]',
    badgeText: 'text-white',
    description: 'Developer tooling, version control, and rapid build pipelines.',
  },
};

export const Skills: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll reveal with useLayoutEffect
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.arsenal-category-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedCategory]);

  const filteredCategories =
    selectedCategory === 'ALL'
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((cat) => cat === selectedCategory);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-transparent text-[#0A0A0A] relative z-10 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10 sm:gap-14">
        {/* Section Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0A0A0A] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0A0A0A] text-white font-mono text-xs font-bold tracking-wider uppercase">
              04 // ARSENAL
            </span>
          </div>
          <span className="font-mono text-xs text-[#0047AB] font-bold uppercase tracking-wider">
            TECHNICAL EXPERTISE & STACK
          </span>
        </div>

        {/* Section Title & Description */}
        <div className="space-y-3 sm:pl-6 lg:pl-8">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-[#0A0A0A] leading-none">
            TECH ARSENAL & SKILLS
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/80 max-w-2xl leading-relaxed">
            A comprehensive breakdown of frameworks, programming languages, databases, and development tools I use to build scalable web experiences.
          </p>
        </div>

        {/* Category Filter Pills & Tier Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
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
                  onClick={() => setSelectedCategory(cat)}
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

          {/* Tier Legend */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-[#0A0A0A]/80 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#0A0A0A]/10">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
              <span>Daily</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A]" />
              <span>Comfortable</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border-2 border-[#0A0A0A]" />
              <span>Learning</span>
            </span>
          </div>
        </div>

        {/* Categorized Bento Grid */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {filteredCategories.map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const categorySkills = skillsData.filter((s) => s.category === category);

            return (
              <div
                key={category}
                className="arsenal-category-card bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#0A0A0A]"
              >
                {/* Card Category Header */}
                <div
                  className={`px-5 py-4 border-b-2 border-[#0A0A0A] flex items-center justify-between ${meta.headerBg} ${meta.headerText}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-lg uppercase tracking-tight leading-none">
                        {category}
                      </h3>
                      <span className="font-mono text-[10px] uppercase font-bold opacity-80">
                        {categorySkills.length} Technologies
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 font-mono text-[11px] font-bold border border-[#0A0A0A] ${meta.badgeBg} ${meta.badgeText}`}
                  >
                    0{SKILL_CATEGORIES.indexOf(category) + 1}
                  </span>
                </div>

                {/* Card Description */}
                <div className="px-5 py-3 bg-[#EEF2FA] border-b border-[#0A0A0A]/10 font-mono text-xs text-[#0A0A0A]/75">
                  {meta.description}
                </div>

                {/* Skill Items List */}
                <div className="p-4 sm:p-5 flex flex-col gap-3 divide-y divide-[#0A0A0A]/10">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="pt-3 first:pt-0 group flex flex-col gap-1.5 cursor-default transition-all"
                      onMouseEnter={() => {
                        // Cheer in place from edge gutter, never jumping to card
                        robotStore.setBolt('cheer', 'happy');
                      }}
                      onMouseLeave={() => {
                        robotStore.setBolt('idle', 'focused');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm uppercase text-[#0A0A0A] group-hover:text-[#0047AB] transition-colors">
                            {skill.name}
                          </span>
                        </div>
                        <TierBadge tier={skill.tier} />
                      </div>

                      <p className="font-mono text-[11px] text-[#0A0A0A]/70 leading-relaxed">
                        {skill.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
