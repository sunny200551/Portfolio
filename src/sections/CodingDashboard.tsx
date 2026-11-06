import React, { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { useCodingStats } from '../hooks/useCodingStats';

const AchievementIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name] || Icons.Award;
  return <IconComponent className={className} size={18} />;
};

export const CodingDashboard: React.FC = () => {
  const { stats, achievements } = useCodingStats();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  const totalLeetcodeSolved = stats.leetcode.solved.all;
  const leetcodeEasy = stats.leetcode.solved.easy;
  const leetcodeMedium = stats.leetcode.solved.medium;
  const leetcodeHard = stats.leetcode.solved.hard;

  // Percentage calculations relative to total solved for visual balance
  const easyPct = totalLeetcodeSolved > 0 ? (leetcodeEasy / totalLeetcodeSolved) * 100 : 0;
  const medPct = totalLeetcodeSolved > 0 ? (leetcodeMedium / totalLeetcodeSolved) * 100 : 0;
  const hardPct = totalLeetcodeSolved > 0 ? (leetcodeHard / totalLeetcodeSolved) * 100 : 0;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Deduplicate CodeChef rank
  const codechefGlobal = stats.codechef.globalRank;
  const codechefCountry = stats.codechef.countryRank;
  const showCountryRank = codechefCountry && codechefCountry !== codechefGlobal;

  return (
    <section 
      id="stats" 
      ref={sectionRef} 
      className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]"
    >
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Section Tag */}
        <div data-robot-anchor="stats:board" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            07 // STATS
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
        </div>

      {/* Header */}
      <div className="mb-12">
        <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
          CODING STATS
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl">
          Algorithmic problem solving and benchmarks on LeetCode and CodeChef.
        </p>
      </div>

      {/* Top Level Summary Bar */}
      <div className="mb-8 p-6 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
            <Icons.Trophy size={28} />
          </div>
          <div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#0A0A0A]">
              Competitive Benchmarks
            </h3>
            <p className="font-mono text-xs text-[#0A0A0A]/70">
              Verified problem solutions & contest milestones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
          <div className="px-4 py-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex flex-col items-center">
            <span className="text-2xl font-black text-[#0047AB]">
              {totalLeetcodeSolved}
            </span>
            <span className="text-[10px] uppercase font-bold text-[#0A0A0A] mt-0.5">LeetCode Solved</span>
          </div>

          <div className="px-4 py-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex flex-col items-center">
            <span className="text-2xl font-black text-[#FF5A1F]">
              {unlockedCount}/{achievements.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-[#0A0A0A] mt-0.5">Badges Earned</span>
          </div>

          {stats.codechef.rating && (
            <div className="col-span-2 sm:col-span-1 px-4 py-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex flex-col items-center">
              <span className="text-2xl font-black text-[#0A1A3F]">
                {stats.codechef.rating}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#0A0A0A] mt-0.5">CodeChef Rating</span>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* LeetCode Profile Card */}
        <div className="p-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF2FA] border-2 border-[#0A0A0A]">
                  <Icons.Code size={20} className="text-[#0047AB]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-lg uppercase text-[#0A0A0A]">
                    LeetCode
                  </h4>
                  <p className="text-xs text-[#0A0A0A]/60 font-mono">
                    u/{stats.leetcode.username}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] text-xs font-mono font-bold">
                {totalLeetcodeSolved} PROBLEMS
              </span>
            </div>

            {/* Flat Bar Charts Filling On Scroll */}
            <div className="flex flex-col gap-4 font-mono mb-6">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#0047AB]">EASY</span>
                  <span className="text-[#0A0A0A]">{leetcodeEasy} solved</span>
                </div>
                <div className="w-full h-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A]">
                  <div 
                    className="h-full bg-[#0047AB] transition-all duration-1000 ease-out"
                    style={{ width: inView ? `${easyPct}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#FF5A1F]">MEDIUM</span>
                  <span className="text-[#0A0A0A]">{leetcodeMedium} solved</span>
                </div>
                <div className="w-full h-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A]">
                  <div 
                    className="h-full bg-[#FF5A1F] transition-all duration-1000 ease-out delay-150"
                    style={{ width: inView ? `${medPct}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div data-robot-anchor="stats:hard">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#0A1A3F]">HARD</span>
                  <span className="text-[#0A0A0A]">{leetcodeHard} solved</span>
                </div>
                <div className="w-full h-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A]">
                  <div 
                    className="h-full bg-[#0A1A3F] transition-all duration-1000 ease-out delay-300"
                    style={{ width: inView ? `${hardPct}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#0A0A0A]/10 flex items-center justify-between font-mono text-xs">
            <span className="text-[#0A0A0A]/70">Algorithmic Practice</span>
            <a 
              href={`https://leetcode.com/${stats.leetcode.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0047AB] hover:text-[#FF5A1F] transition-colors"
            >
              LEETCODE PROFILE ↗
            </a>
          </div>
        </div>

        {/* CodeChef Profile Card */}
        <div className="p-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5A1F] border-2 border-[#0A0A0A] text-black">
                  <Icons.Award size={20} />
                </div>
                <div>
                  <h4 className="font-display font-black text-lg uppercase text-[#0A0A0A]">
                    CodeChef
                  </h4>
                  <p className="text-xs text-[#0A0A0A]/60 font-mono">
                    u/{stats.codechef.username}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] text-xs font-mono font-bold">
                {stats.codechef.stars}★ {stats.codechef.division || 'Div 4'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono mb-6">
              <div className="p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                <span className="text-[10px] uppercase font-bold text-[#0A0A0A]/70 block">Current Rating</span>
                <p className="text-3xl font-black text-[#0047AB] mt-1">
                  {stats.codechef.rating || 'Unrated'}
                </p>
              </div>

              <div className="p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                <span className="text-[10px] uppercase font-bold text-[#0A0A0A]/70 block">Global Rank</span>
                <p className="text-2xl font-black text-[#0A1A3F] mt-1">
                  {codechefGlobal ? `#${Number(codechefGlobal).toLocaleString()}` : 'N/A'}
                </p>
              </div>

              {showCountryRank && (
                <div className="col-span-2 p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                  <span className="text-[10px] uppercase font-bold text-[#0A0A0A]/70 block">Country Rank</span>
                  <p className="text-xl font-black text-[#0047AB] mt-1">
                    #{Number(codechefCountry).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#0A0A0A]/10 flex items-center justify-between font-mono text-xs">
            <span className="text-[#0A0A0A]/70">{stats.codechef.division || 'Div 4'} Competitive Tier</span>
            <a 
              href={`https://www.codechef.com/users/${stats.codechef.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0047AB] hover:text-[#FF5A1F] transition-colors"
            >
              CODECHEF PROFILE ↗
            </a>
          </div>
        </div>

      </div>

      {/* Flat Milestone Badges */}
      <div>
        <div data-robot-anchor="stats:badges" className="flex items-center justify-between mb-6 border-b-2 border-[#0A0A0A] pb-3">
          <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A]">
            MILESTONE BADGES
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {achievements.map((ach) => {
            const isEarned = ach.unlocked || ach.progress.current >= ach.progress.target;
            const cappedCurrent = Math.min(ach.progress.current, ach.progress.target);

            return (
              <div
                key={ach.id}
                className={`p-3.5 border-2 border-[#0A0A0A] flex flex-col items-center text-center justify-between gap-2.5 transition-all ${
                  isEarned
                    ? 'bg-[#FF5A1F] text-black shadow-[4px_4px_0px_#0A0A0A] -translate-y-0.5'
                    : 'bg-white text-[#0A0A0A]/70 shadow-[2px_2px_0px_#0A0A0A]'
                }`}
              >
                <div className={`p-2 border-2 border-[#0A0A0A] ${isEarned ? 'bg-white text-black shadow-[2px_2px_0px_#0A0A0A]' : 'bg-[#EEF2FA] text-[#0A0A0A]/60'}`}>
                  <AchievementIcon name={ach.icon} />
                </div>

                <div className="w-full">
                  <span className="font-display font-black text-xs uppercase leading-tight block">
                    {ach.title}
                  </span>
                  
                  <div className="mt-2 font-mono text-[10px] font-bold">
                    {isEarned ? (
                      <span className="inline-block px-1.5 py-0.5 bg-black text-white border border-black uppercase text-[9px]">
                        EARNED
                      </span>
                    ) : (
                      <span className="text-[#0A0A0A]/60">
                        {cappedCurrent}/{ach.progress.target}
                      </span>
                    )}
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

export default CodingDashboard;
