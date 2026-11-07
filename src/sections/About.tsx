import React, { useEffect, useRef, useState } from 'react';
import { Award, GraduationCap, Code, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GitHubProfile } from '../hooks/useGitHubData';
import { useGithubData } from '../lib/github';
import { useCodingStats } from '../hooks/useCodingStats';
import { projectsData } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

// Custom Rolling Number Counter component
const RollingCounter: React.FC<{ target: number; suffix?: string; label: string }> = ({
  target,
  suffix = '',
  label,
}) => {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAvailable = target !== undefined && target !== null && !isNaN(target);

  useEffect(() => {
    if (!isAvailable) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

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
  const headlineRef = useRef<HTMLDivElement>(null);
  const githubData = useGithubData();
  const { stats: codingStats } = useCodingStats();

  const publicReposCount = githubData.publicReposCount ?? profile?.public_repos ?? null;
  const totalContributions = githubData.totalContributions ?? null;
  const currentStreak = githubData.currentStreak ?? null;
  const leetcodeSolved = codingStats?.leetcode?.solved?.all ?? null;
  const computedProjectsCount = projectsData.length;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const lines = headlineRef.current?.querySelectorAll('.reveal-line');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { color: '#B5B5B5', opacity: 0.3, y: 16 },
          {
            color: '#0A0A0A',
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.35,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 82%',
              end: 'bottom 45%',
              scrub: 0.75,
            },
          }
        );
      }
    }, headlineRef);

    return () => ctx.revert();
  }, []);

  const headlineLines = [
    'COMPUTER SCIENCE STUDENT',
    'BUILDING WEB3 & PRACTICING DSA',
    '& CREATING CONTENT SINCE 2025.',
  ];

  return (
    <section id="about" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]">
      <div className="py-16 md:py-24 lane-padded w-full max-w-[2200px] mx-auto">
        
        {/* Section Tag */}
        <div
          data-robot-anchor="about:heading"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3 mb-8"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            02 // ABOUT
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#0047AB]">
            BACKGROUND & IDENTITY
          </span>
        </div>

        {/* Pinned Scroll Headline Reveal */}
        <div ref={headlineRef} className="mb-12 flex flex-col gap-1 sm:gap-2">
          {headlineLines.map((line, idx) => (
            <div
              key={idx}
              className="reveal-line font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#B5B5B5] leading-[1.08]"
            >
              {line}
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          
          {/* Intro Biography Block */}
          <div className="col-span-12 lg:col-span-7 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                  <Code size={20} />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-[#0A0A0A]">
                    Sunny Pasumarthi
                  </h2>
                  <span className="font-mono text-xs text-[#0047AB] font-bold">
                    B.Tech Computer Science (2023 – 2027)
                  </span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#0A0A0A]/90 leading-relaxed font-sans">
                I am a Computer Science Engineering student at NBKR Institute of Science & Technology, Andhra Pradesh, India. My core engineering focus is on blockchain architectures, Web3 decentralized protocols, and continuous DSA problem-solving. Frontend development with React, TypeScript, and Tailwind CSS is the established craft I build with daily.
              </p>

              <p className="text-sm sm:text-base text-[#0A0A0A]/80 leading-relaxed font-sans">
                Alongside algorithmic practice across LeetCode and CodeChef, I have also been actively creating and editing tech-focused video content across YouTube and Instagram since 2025.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-4 border-t-2 border-[#0A0A0A]/10 font-mono text-xs font-bold">
              <span className="py-1 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                #ComputerScience
              </span>
              <span className="py-1 px-3 bg-[#FF5C00] text-black border-2 border-[#0A0A0A]">
                #Web3 & Blockchain
              </span>
              <span className="py-1 px-3 bg-[#0047AB] text-white border-2 border-[#0A0A0A]">
                #DSA
              </span>
              <span className="py-1 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                #ContentCreator
              </span>
              <span className="py-1 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A]">
                #Frontend
              </span>
            </div>
          </div>

          {/* Real Numeric Milestones Block (2x2 Grid + Wide Orange Tile) */}
          <div
            data-robot-anchor="about:stats"
            data-robot-offset-x="-40"
            data-robot-offset-y="-25"
            className="col-span-12 lg:col-span-5 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="border-b-2 border-[#0A0A0A] pb-3">
              <h2 className="font-display font-extrabold text-base uppercase text-[#0A0A0A] flex items-center gap-2">
                <Award size={18} className="text-[#0047AB]" />
                KEY MILESTONES
              </h2>
            </div>

            {/* 2x2 Numeric Grid from Real Data */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* 1. GitHub Contributions */}
              <RollingCounter
                target={totalContributions ?? 0}
                suffix="+"
                label="Contributions"
              />

              {/* 2. Public Repositories */}
              <RollingCounter
                target={publicReposCount ?? computedProjectsCount}
                label="Repositories"
              />

              {/* 3. LeetCode Problems Solved */}
              <RollingCounter
                target={leetcodeSolved ?? 27}
                label="LeetCode Solved"
              />

              {/* 4. Active Contribution Streak */}
              <RollingCounter
                target={currentStreak ?? 0}
                suffix="d"
                label="Current Streak"
              />
            </div>

            {/* Wide Orange Tile: Academic Scholar Focus */}
            <div className="p-3.5 sm:p-4 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex flex-col justify-center">
              <span className="font-display font-black text-sm uppercase tracking-tight">
                UNDERGRADUATE SCHOLAR • 2023–2027
              </span>
              <span className="font-mono text-[11px] font-bold text-black/80 uppercase">
                {computedProjectsCount} Web Projects Built • Full-Time Scholar
              </span>
            </div>
          </div>

          {/* Education Block */}
          <div className="col-span-12 md:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0047AB] text-white border-2 border-[#0A0A0A]">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="inline-block px-1.5 py-0.5 bg-[#FF5C00] text-[#0A0A0A] font-mono font-bold text-[10px] uppercase border border-[#0A0A0A] mb-1">
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

          {/* BLOCKCHAIN & WEB3 + DSA Block (Renamed and restructured as requested) */}
          <div className="col-span-12 md:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5C00] text-black border-2 border-[#0A0A0A]">
                  <Shield size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#0047AB] block">
                    Core Focus
                  </span>
                  <h4 className="font-display font-extrabold text-lg uppercase text-[#0A0A0A]">
                    BLOCKCHAIN & WEB3 + DSA
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Smart Contracts & Solidity</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">Solidity basics, EVM execution</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Web3 & Blockchain</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">Decentralized ledgers & contracts</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">DSA Practice</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">LeetCode & CodeChef problem-solving</span>
                </div>
                <div className="p-3 bg-[#EEF2FA] border border-[#0A0A0A]">
                  <span className="font-bold block text-[#0A0A0A]">Content Creation & Editing</span>
                  <span className="text-[#0A0A0A]/70 text-[11px]">YouTube & Instagram creator since 2025</span>
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed pt-2 border-t border-[#0A0A0A]/10">
                Frontend development is the established craft I already build with daily; my active engineering depth is expanding in decentralized architectures and algorithmic mastery.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
