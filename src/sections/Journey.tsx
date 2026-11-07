import React, { useLayoutEffect, useRef } from 'react';
import { Terminal, Globe, Code, Shield, Film, Camera } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { robotStore } from '../robot/robotStore';
import { SOCIAL_LINKS } from '../data/socials';

gsap.registerPlugin(ScrollTrigger);

export type MilestoneType = 'tech' | 'content';

export interface MilestoneItem {
  id: string;
  year: string;
  title: string;
  type: MilestoneType;
  icon: React.ElementType;
  description: string;
  skills: string[];
  status?: string;
  actionUrl?: string;
  actionLabel?: string;
}

const milestonesData: MilestoneItem[] = [
  {
    id: 'm-2023',
    year: '2023',
    title: 'Programming Fundamentals',
    type: 'tech',
    icon: Terminal,
    description: 'Began Computer Science degree at NBKRIST. Built core foundations in C, Python basics, and algorithmic problem-solving.',
    skills: ['C Programming', 'Python Basics', 'Algorithms Basics'],
    status: 'FOUNDATION',
  },
  {
    id: 'm-2024',
    year: '2024',
    title: 'Frontend Web Development',
    type: 'tech',
    icon: Globe,
    description: 'Mastered client-side development, responsive layouts, semantic HTML5, modern CSS, JavaScript ES6+, and Git workflows.',
    skills: ['HTML5 & CSS3', 'JavaScript ES6+', 'Responsive Design', 'Git & GitHub'],
    status: 'FRONTEND',
  },
  {
    id: 'm-2025-tech',
    year: '2025',
    title: 'Full Stack & React Applications',
    type: 'tech',
    icon: Code,
    description: 'Engineered full stack web applications including StevesLabHub. Integrated REST APIs, state management, React 19, and Firebase.',
    skills: ['React 19', 'REST APIs', 'Firebase', 'Full Stack Architecture'],
    status: 'WEB APPS',
  },
  {
    id: 'm-2025-content',
    year: '2025',
    title: 'Started Creating & Editing Content',
    type: 'content',
    icon: Film,
    description: 'Launched YouTube channel (@sunny-pasumarthi-21) and Instagram video editing journey. Directing, filming, and editing tech vlogs and shorts.',
    skills: ['Video Editing', 'Content Creation', 'YouTube Shorts', 'Cinematography'],
    status: 'CREATOR LAUNCH',
    actionUrl: SOCIAL_LINKS.youtube.url,
    actionLabel: 'WATCH ON YOUTUBE ↗',
  },
  {
    id: 'm-2026-tech',
    year: '2026',
    title: 'Web3, Blockchain & DSA Focus',
    type: 'tech',
    icon: Shield,
    description: 'Primary engineering focus on Web3 decentralized protocols, EVM smart contracts, and Solidity fundamentals, paired with daily DSA problem-solving on LeetCode & CodeChef.',
    skills: ['Solidity', 'Blockchain Fundamentals', 'Web3 Architecture', 'Data Structures & Algorithms'],
    status: 'CURRENT FOCUS',
  },
  {
    id: 'm-present-content',
    year: 'PRESENT',
    title: 'Active Multi-Track Production',
    type: 'content',
    icon: Camera,
    description: 'Continuous creator releases across YouTube and Instagram: publishing project breakdowns, campus engineering vlogs, and technical reels.',
    skills: ['Active Creator', '7 Verified Videos', 'Reels Production'],
    status: 'ONGOING CREATOR',
    actionUrl: SOCIAL_LINKS.instagram.url,
    actionLabel: 'SEE REELS ↗',
  },
];

export const Journey: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const walkedTrailRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (lineRef.current) lineRef.current.style.transform = 'scaleY(1)';
      if (walkedTrailRef.current) walkedTrailRef.current.style.transform = 'scaleY(1)';
      return;
    }

    const ctx = gsap.context(() => {
      // Timeline center line draws itself on scroll
      if (lineRef.current && containerRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
              end: 'bottom 80%',
              scrub: 1,
            },
          }
        );
      }

      // Colored walked trail following STEVE's journey down the timeline
      if (walkedTrailRef.current && containerRef.current) {
        gsap.fromTo(
          walkedTrailRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              end: 'bottom 85%',
              scrub: 1,
            },
          }
        );
      }

      // Nodes pop in and trigger STEVE reactions when line reaches them
      nodesRef.current.forEach((node, idx) => {
        if (!node) return;
        const year = milestonesData[idx].year;

        gsap.fromTo(
          node,
          { scale: 0, rotation: 45 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.6,
            ease: 'back.out(2.2)',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              onEnter: () => {
                if (['2023', '2024', '2025', '2026'].includes(year)) {
                  robotStore.setJourneyYear(year as '2023' | '2024' | '2025' | '2026');
                }
              },
              onEnterBack: () => {
                if (['2023', '2024', '2025', '2026'].includes(year)) {
                  robotStore.setJourneyYear(year as '2023' | '2024' | '2025' | '2026');
                }
              },
            },
          }
        );
      });

      // Cards slide in subtly
      cardsRef.current.forEach((card, idx) => {
        if (!card) return;
        const isEven = idx % 2 === 0;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isEven ? -20 : 20,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28">
      <div className="pt-20 pb-16 md:pt-28 md:pb-24 lane-padded w-full max-w-[2200px] mx-auto">
        
        {/* Section Tag */}
        <div data-robot-anchor="journey:timeline" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            09 // JOURNEY
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#FF5C00]">
            TECH & CONTENT CHRONOLOGY
          </span>
        </div>

        {/* Header & Milestone Legend */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
              LEARNING & CREATOR JOURNEY
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl">
              Chronological milestones tracking software engineering, Web3 focus, and content creation from 2023 to present.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 p-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className="w-3 h-3 bg-[#0047AB] border border-[#0A0A0A] inline-block" />
              <span>TECH & WEB3</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className="w-3 h-3 bg-[#FF5C00] border border-[#0A0A0A] inline-block" />
              <span>CONTENT CREATION</span>
            </div>
          </div>
        </div>

        {/* Interactive Vertical Timeline Container */}
        <div ref={containerRef} className="relative py-4">
          
          {/* Background Track Guide */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-0.5 bg-[#0A0A0A]/15 pointer-events-none" />

          {/* The Black Line that Draws Itself On Scroll */}
          <div 
            ref={lineRef}
            className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-1 bg-[#0A0A0A] origin-top pointer-events-none"
          />

          {/* Orange walked trail that fills as STEVE travels down the line */}
          <div 
            ref={walkedTrailRef}
            className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-1.5 bg-[#FF5C00] origin-top pointer-events-none"
          />

          {/* Milestone Entries */}
          <div className="flex flex-col gap-8 sm:gap-10">
            {milestonesData.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;
              const isContent = item.type === 'content';

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                >
                  {/* Pop-in Milestone Node */}
                  <div
                    ref={(el) => { nodesRef.current[idx] = el; }}
                    data-robot-anchor={`journey:node-${item.year}`}
                    data-robot-react="journey:node"
                    className={`absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 w-7 h-7 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] z-20 flex items-center justify-center pointer-events-none ${
                      isContent ? 'bg-[#FF5C00]' : 'bg-[#0047AB]'
                    }`}
                  >
                    <div className="w-2 h-2 bg-white" />
                  </div>

                  {/* Alternating Card Wrapper */}
                  <div 
                    ref={(el) => { cardsRef.current[idx] = el; }}
                    className={`w-full pl-14 sm:pl-16 md:pl-0 md:w-[calc(50%-2.5rem)] ${
                      isEven 
                        ? 'md:mr-auto md:text-left' 
                        : 'md:ml-auto md:text-left'
                    }`}
                  >
                    <div className={`p-5 sm:p-6 bg-white border-3 border-[#0A0A0A] transition-all flex flex-col justify-between ${
                      isContent 
                        ? 'shadow-[5px_5px_0px_#FF5C00] hover:shadow-[7px_7px_0px_#FF5C00]' 
                        : 'shadow-[5px_5px_0px_#0047AB] hover:shadow-[7px_7px_0px_#0047AB]'
                    } hover:-translate-y-1`}>
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between border-b-2 border-[#0A0A0A]/10 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight ${
                              isContent ? 'text-[#FF5C00]' : 'text-[#0047AB]'
                            }`}>
                              {item.year}
                            </span>
                            <span className={`font-mono text-[10px] font-black px-2 py-0.5 border border-[#0A0A0A] uppercase ${
                              isContent ? 'bg-[#FF5C00] text-black' : 'bg-[#EEF2FA] text-[#0A0A0A]'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className={`p-2 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] ${
                            isContent ? 'bg-[#FF5C00] text-black' : 'bg-[#0047AB] text-white'
                          }`}>
                            <Icon size={16} />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#0A0A0A] leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/85 leading-relaxed mt-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Skill Tags & Action */}
                      <div className="mt-4 pt-3 border-t-2 border-[#0A0A0A]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          {item.skills.map((skill) => (
                            <span 
                              key={skill}
                              className="px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] font-bold text-[#0A0A0A]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {item.actionUrl && (
                          <a
                            href={item.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF5C00] text-black font-mono text-[11px] font-black uppercase border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-black hover:text-white transition-all whitespace-nowrap"
                          >
                            <span>{item.actionLabel}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Journey;
