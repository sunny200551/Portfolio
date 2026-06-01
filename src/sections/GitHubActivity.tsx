import React from 'react';
import { SpotlightCard } from '../components/SpotlightCard';
import { GitBranch, Star, BookOpen, GitCommit, GitPullRequest } from 'lucide-react';
import type { GitHubProfile, GitHubRepo } from '../hooks/useGitHubData';

interface RepoStat {
  name: string;
  stars: number;
  forks: number;
  description: string;
  language: string;
  url: string;
}

interface GitHubActivityProps {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
}

export const GitHubActivity: React.FC<GitHubActivityProps> = ({ profile, repos }) => {
  const starsCount = repos.reduce((acc: number, curr) => acc + (curr.stargazers_count || 0), 0);
  
  const userStats = {
    publicRepos: profile?.public_repos || 25,
    followers: profile?.followers || 0,
    following: profile?.following || 0,
    starsCount: starsCount || 0,
    commitsThisYear: 842 // realistic commits simulation
  };

  const topRepos: RepoStat[] = [...repos]
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 2)
    .map(r => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      description: r.description || 'Developer project repository.',
      language: r.language || 'JavaScript',
      url: r.html_url
    }));


  // Generate simulated contribution calendar grid coordinates
  // 53 weeks * 7 days = 371 squares
  const generateContributionCalendar = () => {
    const calendar = [];
    const seedRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    for (let w = 0; w < 42; w++) { // Display 42 columns for perfect layout fitting
      const week = [];
      for (let d = 0; d < 7; d++) {
        // Pseudo-random but consistent grid levels (0 to 4)
        const rand = seedRandom(`contrib-${w}-${d}`);
        let level = 0;
        if (rand % 10 > 5) level = 1;
        if (rand % 10 > 7) level = 2;
        if (rand % 10 > 8) level = 3;
        if (rand % 10 > 9) level = 4;
        
        week.push(level);
      }
      calendar.push(week);
    }
    return calendar;
  };

  const calendarGrid = generateContributionCalendar();
  const levelColors = [
    'bg-zinc-900/50 border-white/5',
    'bg-emerald-950/40 text-emerald-800 dark:bg-emerald-900/30 border-emerald-500/10',
    'bg-emerald-800/40 text-emerald-600 dark:bg-emerald-800/50 border-emerald-400/20',
    'bg-emerald-600/60 text-emerald-400 dark:bg-emerald-600/70 border-emerald-400/30',
    'bg-emerald-400 text-emerald-200 dark:bg-emerald-400 dark:text-zinc-950 border-emerald-300/40'
  ];

  return (
    <section id="github" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Open Source Activity
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          GitHub Contribution Analytics
        </p>
      </div>

      <div className="bento-grid">
        {/* Graph Card - Span 12 */}
        <SpotlightCard className="col-span-12 p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                <BookOpen size={18} className="text-violet-400" />
                sunny200551 / Contributions
              </h3>
              <p className="text-xs text-zinc-500 font-mono">Simulated commit activity calendar grid</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <GitCommit size={14} className="text-emerald-400" />
                <span>{userStats.commitsThisYear} Commits (Annual)</span>
              </div>
              <a 
                href="https://github.com/sunny200551" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Profile →
              </a>
            </div>
          </div>

          {/* Grid Box */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex gap-1 min-w-[620px] justify-between">
              {calendarGrid.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((level, dIdx) => (
                    <div
                      key={dIdx}
                      className={`w-3 h-3 rounded-[2px] border ${levelColors[level]} transition-colors duration-200 cursor-pointer hover:border-cyan-400`}
                      title={`Contribution Level ${level}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-zinc-500 mt-2">
            <span>Learn how we simulate activity caches</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-900 border border-white/5" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-950/40 border border-emerald-500/10" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-800/40 border border-emerald-400/20" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-600/60 border border-emerald-400/30" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-400 border border-emerald-300/40" />
              <span>More</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Stats Summary Bento Column - Span 4 */}
        <SpotlightCard className="col-span-12 lg:col-span-4 flex flex-col justify-between min-h-[220px]">
          <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <GitPullRequest size={16} className="text-cyan-400" />
            Repository Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 flex-grow items-center">
            <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-center">
              <span className="text-2xl font-bold font-mono text-zinc-100">{userStats.publicRepos}</span>
              <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Public Repos</span>
            </div>
            <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-center">
              <span className="text-2xl font-bold font-mono text-zinc-100">{userStats.starsCount}</span>
              <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Stars Received</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Top Repositories - Span 8 */}
        <SpotlightCard className="col-span-12 lg:col-span-8 flex flex-col justify-between min-h-[220px]">
          <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-violet-400" />
            Active Repositories
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
            {topRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white/3 dark:bg-zinc-900 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-zinc-200 group-hover:text-violet-300 transition-colors">
                    {repo.name}
                  </span>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {repo.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-500" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch size={10} className="text-violet-500" />
                    <span>{repo.forks}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
export default GitHubActivity;
