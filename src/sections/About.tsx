import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { GraduationCap, Award, Code } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GitHubProfile } from '../hooks/useGitHubData';
import { useGithubData } from '../lib/github';
import { useCodingStats } from '../hooks/useCodingStats';
import { projectsData } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

// Real quantity counter: max 0.8s duration, guaranteed final value, no fake numbers
const StatCounter: React.FC<{
  value: number | null | undefined;
  suffix?: string;
  label: string;
}> = ({ value, suffix = '', label }) => {
  const isAvailable = value !== null && value !== undefined && !isNaN(value);
  const target = isAvailable ? value : 0;

  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return target;
    }
    return 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAvailable) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let frameId: number;
    let startTime: number | null = null;
    const maxDuration = 800; // 0.8s max duration

    const startCounting = () => {
      const step = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / maxDuration);

        // Progressively step to final target
        setCount(Math.round(progress * target));

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setCount(target); // Snap to final value
        }
      };
      frameId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        startCounting();
      } else {
        observer.observe(containerRef.current);
      }
    }

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, isAvailable]);

  return (
    <div
      ref={containerRef}
      className="text-center p-3.5 sm:p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0A0A0A] transition-all flex flex-col items-center justify-between cursor-default"
    >
      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0047AB] font-mono leading-none">
        {isAvailable ? `${count}${suffix}` : '—'}
      </span>
      <span className="text-[10px] sm:text-xs text-[#0A0A0A] font-mono mt-2 font-bold uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
};

export const About: React.FC<{ profile?: GitHubProfile | null }> = ({ profile }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const githubData = useGithubData();
  const { stats: codingStats } = useCodingStats();

  const publicReposCount = githubData.publicReposCount ?? profile?.public_repos ?? null;
  const totalContributions = githubData.totalContributions ?? null;
  const currentStreak = githubData.currentStreak ?? null;
  const leetcodeSolved = codingStats?.leetcode?.solved?.all ?? null;
  const computedProjectsCount = projectsData.length;

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Headline lines slide up
      const lines = headlineRef.current?.querySelectorAll('.reveal-line');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Cards staggered rise
      const cards = cardsRef.current?.querySelectorAll('.about-card');
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
              trigger: cardsRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headlineLines = [
    'COMPUTER SCIENCE STUDENT',
    'BUILDING MODERN FRONTEND APPS',
    '& EXPLORING WEB3.',
  ];

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-transparent text-[#0A0A0A] relative z-10 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12 sm:gap-16">
        
        {/* Section Heading Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0A0A0A] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0A0A0A] text-white font-mono text-xs font-bold tracking-wider uppercase">
              02 // ABOUT
            </span>
          </div>
          <span className="font-mono text-xs text-[#0047AB] font-bold uppercase tracking-wider">
            BACKGROUND & EDUCATION
          </span>
        </div>

        {/* Big Editorial Headline */}
        <div ref={headlineRef} className="space-y-1 sm:space-y-2 overflow-hidden sm:pl-6 lg:pl-8">
          {headlineLines.map((line, idx) => (
            <div key={idx} className="overflow-hidden">
              <h2 className="reveal-line font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-[#0A0A0A] leading-[1.02]">
                {line}
              </h2>
            </div>
          ))}
        </div>

        {/* Content Bento Grid */}
        <div ref={cardsRef} className="grid grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Main Bio Card */}
          <div
            data-robot-anchor="about:bio"
            data-robot-offset-x="-50"
            data-robot-offset-y="-10"
            className="about-card col-span-12 lg:col-span-7 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF5A1F] border-2 border-[#0A0A0A] flex items-center justify-center font-mono font-bold text-black text-sm">
                  &lt;&gt;
                </div>
                <div>
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#0A0A0A]">
                    SUNNY PASUMARTHI
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#0047AB] uppercase">
                    B.Tech Computer Science (2023 – 2027)
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed font-sans pt-2">
                I am a Computer Science Engineering student at NBKR Institute of Science & Technology, Andhra Pradesh, India. I enjoy building responsive, fast frontend web applications with React, TypeScript, and Tailwind CSS.
              </p>

              <p className="text-sm sm:text-base text-[#0A0A0A]/80 leading-relaxed font-sans">
                Alongside core coursework in algorithms, data structures, and computer science foundations, I am actively exploring Web3, smart contracts, and decentralized architectures.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-4 border-t-2 border-[#0A0A0A]/10 font-mono text-xs font-bold">
              <span className="py-1 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                #ComputerScience
              </span>
              <span className="py-1 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                #FrontendDevelopment
              </span>
              <span className="py-1 px-3 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A]">
                #React
              </span>
              <span className="py-1 px-3 bg-[#0047AB] text-white border-2 border-[#0A0A0A]">
                #Web3
              </span>
            </div>
          </div>

          {/* Real Numeric Milestones Block (2x2 Grid + Wide Orange Tile) */}
          <div
            data-robot-anchor="about:stats"
            data-robot-offset-x="-40"
            data-robot-offset-y="-25"
            className="about-card col-span-12 lg:col-span-5 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="border-b-2 border-[#0A0A0A] pb-3">
              <h3 className="font-display font-extrabold text-base uppercase text-[#0A0A0A] flex items-center gap-2">
                <Award size={18} className="text-[#0047AB]" />
                KEY MILESTONES
              </h3>
            </div>

            {/* 2x2 Numeric Grid from Real Data */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* 1. GitHub Contributions (Last 12 Months) */}
              <StatCounter
                value={totalContributions}
                label="Contributions"
              />

              {/* 2. Current Daily Streak (clean numeral without inside text) */}
              <StatCounter
                value={currentStreak}
                label="Day streak"
              />

              {/* 3. LeetCode Problems Solved */}
              <StatCounter
                value={leetcodeSolved}
                label="LeetCode Solved"
              />

              {/* 4. Public Repositories */}
              <StatCounter
                value={publicReposCount}
                label="Public Repos"
              />
            </div>

            {/* One Wide Orange Tile with Static Text & Computed Projects */}
            <div className="p-4 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] transition-all text-center flex flex-col items-center justify-center gap-1.5 select-none">
              <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider">
                B.Tech CSE | NBKRIST | Expected 2027
              </span>
              <span className="font-mono text-[11px] font-bold text-black/80 uppercase">
                {computedProjectsCount} Web Projects Built • Full-Time Scholar
              </span>
            </div>
          </div>

          {/* Education Block */}
          <div className="about-card col-span-12 md:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0047AB] text-white border-2 border-[#0A0A0A]">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="inline-block px-1.5 py-0.5 bg-[#FF5A1F] text-[#0A0A0A] font-mono font-bold text-[10px] uppercase border border-[#0A0A0A] mb-1">
                    Undergraduate Degree
                  </span>
                  <h3 className="font-display font-extrabold text-lg uppercase text-[#0A0A0A]">
                    B.Tech Computer Science & Engineering
                  </h3>
                </div>
              </div>

              <div className="font-mono text-xs space-y-1.5 text-[#0A0A0A]/80">
                <p className="font-bold text-[#0A0A0A]">NBKR Institute of Science & Technology</p>
                <p>Affiliated to JNTUA • Vidyanagar, Andhra Pradesh</p>
                <p className="text-[#0047AB] font-bold">2023 – 2027 • Full-time Scholar</p>
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed pt-2 border-t border-[#0A0A0A]/10">
                Foundational and applied coursework including Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Computer Networks, and Web Application Development.
              </p>
            </div>
          </div>

          {/* Core Focus Block */}
          <div className="about-card col-span-12 md:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A]">
                  <Code size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#0047AB] block">
                    Core Focus
                  </span>
                  <h4 className="font-display font-extrabold text-lg uppercase text-[#0A0A0A]">
                    Frontend Engineering & Web3
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Frontend Web Apps</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">React 19, TypeScript, Tailwind</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">DSA Practice</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">LeetCode, CodeChef</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Responsive Layouts</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">Clean UI, Semantic HTML5</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Web3 & Blockchain</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">Solidity Basics, Smart Contracts</span>
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed pt-2 border-t border-[#0A0A0A]/10">
                Focusing on solid software engineering habits, clean codebases, performance, and continuous algorithmic problem-solving.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
