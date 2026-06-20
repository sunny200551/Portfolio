import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SpotlightCard } from '../components/SpotlightCard';
import { useCodingStats } from '../hooks/useCodingStats';

const AchievementIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Award;
  return <IconComponent className={className} size={20} />;
};

export const CodingDashboard: React.FC = () => {
  const { stats, loading, achievements } = useCodingStats();

  const totalLeetcodeSolved = stats.leetcode.solved.all;
  const leetcodeTotal = stats.leetcode.totalQuestions || 3200;
  const leetcodePercent = Math.min(Math.round((totalLeetcodeSolved / leetcodeTotal) * 100), 100);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // CodeChef Star Styling
  const getCodeChefStarsColor = (stars: number | null) => {
    if (!stars) return 'text-zinc-500 bg-zinc-950/40 border-zinc-800';
    if (stars >= 5) return 'text-red-400 bg-red-950/20 border-red-500/25';
    if (stars >= 3) return 'text-amber-400 bg-amber-950/20 border-amber-500/25';
    if (stars >= 2) return 'text-blue-400 bg-blue-950/20 border-blue-500/25';
    return 'text-green-400 bg-green-950/20 border-green-500/25'; // 1★
  };

  return (
    <section id="coding" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Competitive Programming & Achievements
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Real-time Algorithmic Milestones
        </p>
      </div>

      <div className="bento-grid">
        {/* Statistics Overview Row - Span 12 */}
        <SpotlightCard className="col-span-12 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Icons.Trophy size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Coding Achievements Summary</h3>
              <p className="text-xs text-zinc-500 font-mono">Dynamic milestone tracking across platforms</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-end w-full sm:w-auto">
            <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/5 flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-violet-400">
                {totalLeetcodeSolved + (stats.codechef.rating ? 1 : 0)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Total Practices</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/5 flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-cyan-400">
                {unlockedCount} / {achievements.length}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Badges Earned</span>
            </div>
            {stats.codechef.rating && (
              <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/5 flex flex-col items-center">
                <span className="text-xl font-bold font-mono text-amber-400">
                  {stats.codechef.rating}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">CodeChef Rating</span>
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* LeetCode Bento Column - Span 6 */}
        <SpotlightCard className="col-span-12 md:col-span-6 p-4 sm:p-6 flex flex-col justify-between gap-6 min-h-[380px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FFA116]/10 border border-[#FFA116]/20 text-[#FFA116]">
                <Icons.Cpu size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-200">LeetCode Profile</h4>
                <p className="text-[10px] text-zinc-500 font-mono">u/{stats.leetcode.username}</p>
              </div>
            </div>
            {stats.leetcode.ranking && (
              <div className="px-2.5 py-1 rounded bg-[#FFA116]/10 text-[#FFA116] border border-[#FFA116]/20 text-[10px] font-mono">
                Rank: #{stats.leetcode.ranking.toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center flex-grow">
            {/* Visual Circular Progress */}
            <div className="flex justify-center relative">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-[#FFA116] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - leetcodePercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-zinc-200">{totalLeetcodeSolved}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Solved</span>
              </div>
            </div>

            {/* Difficulties Breakdown */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-bold">Easy</span>
                  <span className="text-zinc-400">{stats.leetcode.solved.easy}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(stats.leetcode.solved.easy / totalLeetcodeSolved) * 100 || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-400 font-bold">Medium</span>
                  <span className="text-zinc-400">{stats.leetcode.solved.medium}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(stats.leetcode.solved.medium / totalLeetcodeSolved) * 100 || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-500 font-bold">Hard</span>
                  <span className="text-zinc-400">{stats.leetcode.solved.hard}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(stats.leetcode.solved.hard / totalLeetcodeSolved) * 100 || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-500">Solved of {leetcodeTotal} total</span>
            <a
              href={`https://leetcode.com/u/${stats.leetcode.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFA116] hover:text-[#ffb23f] hover:underline flex items-center gap-1.5"
            >
              Solve Challenges →
            </a>
          </div>
        </SpotlightCard>

        {/* CodeChef Bento Column - Span 6 */}
        <SpotlightCard className="col-span-12 md:col-span-6 p-4 sm:p-6 flex flex-col justify-between gap-6 min-h-[380px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#5B4636]/20 border border-[#5B4636]/30 text-[#A08060]">
                <Icons.CircleDot size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-200">CodeChef Profile</h4>
                <p className="text-[10px] text-zinc-500 font-mono">users/{stats.codechef.username}</p>
              </div>
            </div>
            {stats.codechef.division && (
              <div className="px-2.5 py-1 rounded bg-[#5B4636]/20 text-[#D8B490] border border-[#5B4636]/30 text-[10px] font-mono">
                {stats.codechef.division}
              </div>
            )}
          </div>

          {stats.codechef.rating ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-grow items-center">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100">{stats.codechef.rating}</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mt-1 sm:mt-1.5 font-mono">Rating</span>
              </div>
              <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${getCodeChefStarsColor(stats.codechef.stars)}`}>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono">
                  {stats.codechef.stars ? `${stats.codechef.stars}★` : '1★'}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider mt-1 sm:mt-1.5 font-mono">Star Status</span>
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="px-3 sm:px-4 py-2 bg-white/2 border border-white/5 rounded-xl text-center">
                  <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-mono block">
                    #{stats.codechef.globalRank || 'NA'}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase text-zinc-600 tracking-wider font-mono">Global Rank</span>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-white/2 border border-white/5 rounded-xl text-center">
                  <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-mono block">
                    #{stats.codechef.countryRank || 'NA'}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase text-zinc-600 tracking-wider font-mono">Country Rank</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow text-center p-4">
              <Icons.ShieldAlert size={36} className="text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-400">Profile rating is currently processing.</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-1">Make sure you participate in contests to get rated!</p>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-500">Global contest stats</span>
            <a
              href={`https://www.codechef.com/users/${stats.codechef.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D8B490] hover:text-[#ebd1b9] hover:underline flex items-center gap-1.5"
            >
              View Profile →
            </a>
          </div>
        </SpotlightCard>

        {/* Achievements Badge Grid Bento Card - Span 12 */}
        <SpotlightCard className="col-span-12 p-6 flex flex-col gap-6">
          <div className="border-b border-white/5 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Icons.Award size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-200">Achievement Badges</h4>
              <p className="text-[10px] text-zinc-500 font-mono">Milestones unlocked automatically via profile data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-violet-950/15 to-cyan-950/10 border-cyan-500/25 shadow-md shadow-cyan-950/10 hover:border-cyan-400/40'
                    : 'bg-zinc-900/40 border-white/5 filter opacity-60 hover:opacity-80'
                }`}
              >
                {/* Glowing light effect on unlocked achievements */}
                {ach.unlocked && (
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-cyan-400/5 blur-xl group-hover:bg-cyan-400/10 transition-colors pointer-events-none" />
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      ach.unlocked
                        ? 'bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-cyan-400/30 text-cyan-300'
                        : 'bg-zinc-800 text-zinc-500 border border-white/5'
                    }`}>
                      <AchievementIcon name={ach.icon} />
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      ach.unlocked
                        ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30'
                        : 'text-zinc-500 bg-zinc-950/50 border-white/5'
                    }`}>
                      {ach.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold mt-1 ${ach.unlocked ? 'text-zinc-200' : 'text-zinc-400'}`}>
                      {ach.title}
                    </h5>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {ach.progress.current} / {ach.progress.target} {ach.progress.unit}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        ach.unlocked ? 'bg-gradient-to-r from-violet-500 to-cyan-400' : 'bg-zinc-600'
                      }`}
                      style={{ width: `${Math.min((ach.progress.current / ach.progress.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 border-t border-white/5 pt-4 mt-2">
            <span className="flex items-center gap-1.5">
              <Icons.RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              Cached locally for efficiency. Sync occurs daily.
            </span>
            <span>
              Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
export default CodingDashboard;
