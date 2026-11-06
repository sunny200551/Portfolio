import { robotStore } from '../robot/robotStore';
import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Award, Code } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GitHubProfile } from '../hooks/useGitHubData';

gsap.registerPlugin(ScrollTrigger);

// Real quantity counter: max 0.8s duration, guaranteed final value, no intermediate jumps
const StatCounter: React.FC<{ value: number; suffix?: string; label: string }> = ({ 
  value, 
  suffix = '', 
  label 
}) => {
  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        setCount(Math.round(progress * value));

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setCount(value); // Guaranteed final value
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
  }, [value]);

  return (
    <div ref={containerRef} className="text-center p-3 sm:p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col items-center justify-between">
      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0047AB] font-mono">
        {count}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs text-[#0A0A0A] font-mono mt-1 font-bold uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
};


const GradYearStatCounter: React.FC = () => {
  const [displayYear, setDisplayYear] = useState<number | string>(2027);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;
    let t5: ReturnType<typeof setTimeout>;

    const runGlitchSequence = () => {
      // Step 1: Initial strange counter value
      setDisplayYear(240);
      
      // Step 2: Glitches through 864 -> BOLT looks confused!
      t1 = setTimeout(() => {
        setDisplayYear(864);
        robotStore.setAboutGradYearStage('glitch');

        // Step 3: Glitches through 1492 -> BOLT facepalms!
        t2 = setTimeout(() => {
          setDisplayYear(1492);
          robotStore.setAboutGradYearStage('facepalm');

          // Step 4: Glitches through 1984
          t3 = setTimeout(() => {
            setDisplayYear(1984);

            // Step 5: Settles on 2027 -> BOLT gives thumbs-up / cheer!
            t4 = setTimeout(() => {
              setDisplayYear(2027);
              robotStore.setAboutGradYearStage('settled');

              t5 = setTimeout(() => {
                robotStore.setAboutGradYearStage('idle');
              }, 2600);
            }, 600);
          }, 450);
        }, 600);
      }, 550);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasTriggered.current) {
        hasTriggered.current = true;
        runGlitchSequence();
      }
    }, { threshold: 0.2 });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div ref={containerRef} className="text-center p-3 sm:p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col items-center justify-between">
      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0047AB] font-mono">
        {displayYear}
      </span>
      <span className="text-[10px] sm:text-xs text-[#0A0A0A] font-mono mt-1 font-bold uppercase tracking-wider text-center">
        Expected graduation 2027
      </span>
    </div>
  );
};

export const About: React.FC<{ profile?: GitHubProfile | null }> = ({ profile }) => {
  const headlineRef = useRef<HTMLDivElement>(null);
  const [publicReposCount, setPublicReposCount] = useState<number>(profile?.public_repos || 25);

  // Fetch GitHub repos from the same public/data/github.json as the GitHub section
  useEffect(() => {
    let isMounted = true;
    const fetchGithubData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/github.json`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.publicReposCount !== undefined) {
            setPublicReposCount(data.publicReposCount);
          }
        }
      } catch {
        // Fallback to profile.public_repos
      }
    };
    fetchGithubData();
    return () => {
      isMounted = false;
    };
  }, [profile]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const lines = headlineRef.current?.querySelectorAll('.reveal-line');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { opacity: 0.15, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.25,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 75%',
              end: 'bottom 40%',
              scrub: 1,
            }
          }
        );
      }
    }, headlineRef);

    return () => ctx.revert();
  }, []);

  const headlineLines = [
    "COMPUTER SCIENCE STUDENT",
    "BUILDING MODERN FRONTEND APPS",
    "& EXPLORING WEB3."
  ];

  return (
    <section id="about" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]">
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Tag */}
        <div data-robot-anchor="about:heading" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            02 // ABOUT
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#0047AB]">
            BACKGROUND & EDUCATION
          </span>
        </div>

        {/* Pinned Scroll Headline Reveal */}
        <div ref={headlineRef} className="mb-12 flex flex-col gap-1 sm:gap-2">
          {headlineLines.map((line, idx) => (
            <div 
              key={idx}
              className="reveal-line font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-[1.08] transition-opacity"
            >
              {line}
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          
          {/* Intro Biography Block */}
          <div className="col-span-12 lg:col-span-8 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                  <Code size={20} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl uppercase tracking-tight text-[#0A0A0A]">
                    Sunny Pasumarthi
                  </h3>
                  <span className="font-mono text-xs text-[#0047AB] font-bold">
                    B.Tech Computer Science (2023 – 2027)
                  </span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#0A0A0A]/90 leading-relaxed font-sans">
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

          {/* Stats Block */}
          <div data-robot-anchor="about:stats" data-robot-offset-x="-40" data-robot-offset-y="-25" className="col-span-12 lg:col-span-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="border-b-2 border-[#0A0A0A] pb-3 mb-6">
              <h3 className="font-display font-extrabold text-base uppercase text-[#0A0A0A] flex items-center gap-2">
                <Award size={18} className="text-[#0047AB]" />
                KEY MILESTONES
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3.5 flex-grow">
              {/* Real quantity: Years in CSE */}
              <StatCounter value={2} suffix="+" label="Years in CSE" />

              {/* Real quantity: Synced GitHub repos count */}
              <StatCounter value={publicReposCount} label="GitHub Repos" />

              {/* Guaranteed Static Text: Expected graduation 2027 (Never counted) */}
              <GradYearStatCounter />

              {/* Real quantity: Projects */}
              <StatCounter value={6} label="Web Projects" />
            </div>

            <div className="mt-4 pt-3 border-t border-[#0A0A0A]/20 font-mono text-[11px] text-[#0A0A0A]/70 text-center">
              NBKRIST Undergraduate • 2023 – 2027
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
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FF5A1F] block">Undergraduate Degree</span>
                  <h4 className="font-display font-extrabold text-lg uppercase text-[#0A0A0A]">
                    B.Tech Computer Science & Engineering
                  </h4>
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
          <div className="col-span-12 md:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A]">
                  <Code size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#0047AB] block">Core Focus</span>
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
