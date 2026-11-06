import React, { useEffect, useRef } from 'react';
import { Terminal, Globe, Code, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MilestoneItem {
  year: string;
  title: string;
  icon: React.ElementType;
  description: string;
  skills: string[];
  status?: string;
}

const milestonesData: MilestoneItem[] = [
  {
    year: '2023',
    title: 'Programming Fundamentals',
    icon: Terminal,
    description: 'Began Computer Science degree at NBKRIST. Built core foundations in C, Python basics, and algorithmic problem-solving.',
    skills: ['C Programming', 'Python Basics', 'Algorithms Basics'],
    status: 'FOUNDATION'
  },
  {
    year: '2024',
    title: 'Frontend Web Development',
    icon: Globe,
    description: 'Learned client-side development, responsive layouts, semantic HTML5, modern CSS, JavaScript ES6+, and Git workflows.',
    skills: ['HTML5 & CSS3', 'JavaScript ES6+', 'Responsive Design', 'Git & GitHub'],
    status: 'FRONTEND'
  },
  {
    year: '2025',
    title: 'Full Stack & React Applications',
    icon: Code,
    description: 'Built full stack web applications including StevesLabHub and Weather App. Integrated REST APIs and worked with React and Firebase.',
    skills: ['React', 'REST APIs', 'Firebase', 'Full Stack Basics'],
    status: 'WEB APPS'
  },
  {
    year: '2026',
    title: 'LEARNING WEB3',
    icon: Shield,
    description: 'Newly learning blockchain fundamentals, Solidity, and smart contracts while continuing to build responsive frontend web applications.',
    skills: ['Blockchain', 'Smart Contracts', 'Web3'],
    status: 'LEARNING WEB3'
  }
];

export const Journey: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (lineRef.current) lineRef.current.style.transform = 'scaleY(1)';
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
              scrub: 1
            }
          }
        );
      }

      // Nodes pop in as line reaches them
      nodesRef.current.forEach((node) => {
        if (!node) return;
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
              start: 'top 80%'
            }
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
            x: isEven ? -20 : 20
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%'
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]">
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            08 // JOURNEY
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
            LEARNING JOURNEY
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl">
            Learning timeline from 2023 to present.
          </p>
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

          {/* Milestone Entries with tightened spacing */}
          <div className="flex flex-col gap-6 sm:gap-7">
            {milestonesData.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.year}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                >
                  {/* Pop-in Flat Orange Square Milestone Node */}
                  <div
                    ref={(el) => { nodesRef.current[idx] = el; }}
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 w-6 h-6 bg-[#FF5A1F] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] z-20 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-1.5 h-1.5 bg-black" />
                  </div>

                  {/* Alternating Card Wrapper */}
                  <div 
                    ref={(el) => { cardsRef.current[idx] = el; }}
                    className={`w-full pl-14 sm:pl-16 md:pl-0 md:w-[calc(50%-2rem)] ${
                      isEven 
                        ? 'md:mr-auto md:text-left' 
                        : 'md:ml-auto md:text-left'
                    }`}
                  >
                    <div className="p-5 sm:p-6 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0A0A0A] transition-all flex flex-col justify-between">
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between border-b-2 border-[#0A0A0A]/10 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-2xl sm:text-3xl text-[#0047AB] tracking-tight">
                              {item.year}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] uppercase">
                              {item.status}
                            </span>
                          </div>

                          <div className="p-2 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                            <Icon size={16} />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#0A0A0A] leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed mt-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t-2 border-[#0A0A0A]/10">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-mono py-0.5 px-2 bg-[#EEF2FA] border border-[#0A0A0A] text-[#0A0A0A] font-bold"
                          >
                            {skill}
                          </span>
                        ))}
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
