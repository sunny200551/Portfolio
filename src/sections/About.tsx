import React, { useEffect, useState, useRef } from 'react';
import { GraduationCap, Award, Compass, Heart, Code } from 'lucide-react';
import { SpotlightCard } from '../components/SpotlightCard';

const StatCounter: React.FC<{ value: number; suffix?: string; label: string; duration?: number }> = ({ 
  value, 
  suffix = '', 
  label, 
  duration = 1.5 
}) => {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return (
    <div ref={containerRef} className="text-center p-4 rounded-xl bg-white/3 dark:bg-zinc-900/30 border border-white/5 flex flex-col items-center">
      <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-mono">
        {count}{suffix}
      </span>
      <span className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
};

import type { GitHubProfile } from '../hooks/useGitHubData';

interface AboutProps {
  profile: GitHubProfile | null;
}

export const About: React.FC<AboutProps> = ({ profile }) => {
  return (
    <section id="about" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          About Me
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Sunny Pasumarthi / Student Profile
        </p>
      </div>

      <div className="bento-grid">
        {/* Main Biography Card */}
        <SpotlightCard className="col-span-12 lg:col-span-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400">
                <Code size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 dark:text-zinc-100">The Journey & Mission</h3>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 dark:text-zinc-400 leading-relaxed">
              I am a Computer Science Engineering student passionate about software development, full stack technologies, and blockchain systems. 
              My primary interests include building modern web applications, solving real-world problems through technology, and exploring decentralized architectures.
            </p>
            <p className="text-sm sm:text-base text-zinc-400 dark:text-zinc-400 leading-relaxed">
              I enjoy working across both frontend and backend development while continuously improving my programming, system designs, and algorithmic problem-solving skills.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-xs font-mono py-1 px-3.5 rounded-full border border-violet-500/15 bg-violet-500/5 text-violet-300">
              #ProblemSolver
            </span>
            <span className="text-xs font-mono py-1 px-3.5 rounded-full border border-cyan-500/15 bg-cyan-500/5 text-cyan-300">
              #FullStackDeveloper
            </span>
            <span className="text-xs font-mono py-1 px-3.5 rounded-full border border-pink-500/15 bg-pink-500/5 text-pink-300">
              #Web3Explorer
            </span>
          </div>
        </SpotlightCard>

        {/* Dynamic Stats Bento Block */}
        <SpotlightCard className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-zinc-200 dark:text-zinc-200 mb-6 flex items-center gap-2">
            <Award size={18} className="text-cyan-400" />
            Key Milestones
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCounter value={3} suffix="+" label="Years Dev" />
            <StatCounter value={profile?.public_repos || 25} suffix="+" label="Git Repos" />
            <StatCounter value={12} suffix="+" label="Skills Acquired" />
            <StatCounter value={100} suffix="%" label="Commitment" />
          </div>
        </SpotlightCard>

        {/* Education Bento Block */}
        <SpotlightCard className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-200 dark:text-zinc-200">Education</h3>
            </div>
            <div>
              <h4 className="text-base font-semibold text-zinc-100">B.Tech in Computer Science Engineering</h4>
              <p className="text-xs text-zinc-500 font-mono mt-1">Undergraduate Studies | 2023 - 2027</p>
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-400 leading-relaxed">
              Acquiring deep foundations in Computer Science principles, Data Structures & Algorithms, Operating Systems, Database Management systems, and Software Engineering methodologies.
            </p>
          </div>
        </SpotlightCard>

        {/* Intersections & Passions Card */}
        <SpotlightCard className="col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-200 dark:text-zinc-200">Core Interests</h3>
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-400 leading-relaxed">
              Driven by the pursuit of technical excellence. I love building intuitive user interfaces that load instantly and mapping out scalable, secure smart contract architectures.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-2.5 text-sm text-zinc-300 font-mono">
                <Heart size={14} className="text-rose-500" />
                Decentralized Web
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-300 font-mono">
                <Heart size={14} className="text-violet-500" />
                Distributed Systems
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-300 font-mono">
                <Heart size={14} className="text-cyan-500" />
                High-Performance Apps
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-300 font-mono">
                <Heart size={14} className="text-emerald-500" />
                Algorithmic Efficiency
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
export default About;
