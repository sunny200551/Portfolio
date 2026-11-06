import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GitBranch, Star, GitFork, AlertCircle } from 'lucide-react';
import { GitHubSkyline, type ContributionWeek, type DayHoverInfo } from '../components/three/GitHubSkyline';
import type { GitHubProfile, GitHubRepo } from '../hooks/useGitHubData';

interface ActiveRepo {
  name: string;
  description: string;
  url: string;
  homepageUrl?: string | null;
  stars: number;
  forks: number;
  language: string;
  pushedAt: string;
}

interface GitHubStatsData {
  username: string;
  lastUpdated: string;
  totalContributions: number;
  currentStreak: number;
  publicReposCount: number;
  totalStars: number;
  calendarWeeks: ContributionWeek[];
  activeRepos: ActiveRepo[];
}

interface GitHubActivityProps {
  profile?: GitHubProfile | null;
  repos?: GitHubRepo[];
}

interface PositionedTooltip {
  date: string;
  count: number;
  left: number;
  top: number;
}

const StatCounter: React.FC<{ value: number; suffix?: string; label: string; color?: string }> = ({ 
  value, 
  suffix = '', 
  label,
  color = 'text-[#0047AB]'
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
    if (!inView) return;
    const end = Math.max(0, value);
    if (end === 0) return;

    let start = 0;
    const totalMs = 1200;
    const stepTime = Math.max(Math.floor(totalMs / end), 16);
    const stepIncrement = Math.max(1, Math.ceil(end / 60));

    const timer = setInterval(() => {
      start += stepIncrement;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={containerRef} className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col items-center text-center">
      <span className={`text-2xl sm:text-3xl font-black font-mono ${color}`}>
        {count}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs text-[#0A0A0A] font-mono mt-1 font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

export const GitHubActivity: React.FC<GitHubActivityProps> = ({ profile, repos = [] }) => {
  const [statsData, setStatsData] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSkylineInView, setIsSkylineInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<PositionedTooltip | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/github.json`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Data file status: ${res.status}`);
        }
        const data: GitHubStatsData = await res.json();
        if (isMounted) {
          setStatsData(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Could not load github.json, using fallback live props if available', err);
        if (isMounted) {
          setStatsData(null);
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Pause 3D canvas when off-screen to save GPU cycles
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSkylineInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    const currentEl = canvasContainerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
      observer.disconnect();
    };
  }, []);

  const handleHoverDay = useCallback((info: DayHoverInfo | null) => {
    if (!info) {
      setHoveredDay(null);
      return;
    }
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) {
      setHoveredDay(null);
      return;
    }
    setHoveredDay({
      date: info.date,
      count: info.count,
      left: Math.max(12, Math.min(rect.width - 220, info.clientX - rect.left + 16)),
      top: Math.max(12, Math.min(rect.height - 48, info.clientY - rect.top - 42)),
    });
  }, []);

  const totalContributions = statsData?.totalContributions ?? 0;
  const currentStreak = statsData?.currentStreak ?? 0;
  const publicReposCount = statsData?.publicReposCount ?? (profile?.public_repos || repos.length || 25);
  const totalStars = statsData?.totalStars ?? repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // Active repos: either from JSON or from GitHub API hook
  const displayRepos: ActiveRepo[] = statsData?.activeRepos?.length
    ? statsData.activeRepos
    : repos.slice(0, 4).map((r) => ({
        name: r.name,
        description: r.description || 'Open source engineering project.',
        url: r.html_url,
        homepageUrl: r.homepage,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        language: r.language || 'TypeScript',
        pushedAt: new Date().toISOString()
      }));

  const formattedLastUpdated = statsData?.lastUpdated
    ? new Date(statsData.lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <section id="github" className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A]">
      <div className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Tag */}
        <div data-robot-anchor="github:skyline" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            05 // GITHUB
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
        </div>

        {/* Header + Last Updated Status */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none">
              COMMIT SKYLINE
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-2 max-w-2xl">
              Open source contributions and repositories.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold">
            {formattedLastUpdated ? (
              <div className="px-3 py-1.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                <span>SYNCED: {formattedLastUpdated}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A]" />
                <span>GITHUB API</span>
              </div>
            )}
            <a
              href="https://github.com/sunny200551"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
            >
              <span>GITHUB ↗</span>
            </a>
          </div>
        </div>

        {/* Empty State warning if neither file nor profile data exists */}
        {!loading && !statsData && repos.length === 0 && (
          <div className="mb-8 p-6 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-start gap-4 font-mono text-xs">
            <AlertCircle className="text-[#FF5A1F] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold uppercase text-sm block mb-1">GitHub Metrics Data Synchronizing</span>
              <p className="text-[#0A0A0A]/80 leading-relaxed">
                `public/data/github.json` has not yet been populated by the automated GitHub Actions workflow (`github-stats.yml`). Run <code className="bg-white px-1.5 py-0.5 border border-[#0A0A0A]">node scripts/fetch-github.mjs</code> or trigger the GitHub Action to synchronize live GraphQL data.
              </p>
            </div>
          </div>
        )}

        {/* 3D Isometric Skyline Canvas Box */}
        <div 
          ref={canvasContainerRef} 
          className="mb-8 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] p-4 sm:p-6 relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0047AB] text-white border border-[#0A0A0A]">
                3D SKYLINE
              </span>
              <span className="font-mono text-xs font-bold text-[#0A0A0A]">
                u/sunny200551 // FULL 52 WEEKS (DRAG TO ROTATE)
              </span>
            </div>

            {/* Color Key */}
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
              <span className="text-[#0A0A0A]/60">TIERS:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#EEF2FA] border border-[#0A0A0A]" title="0: None" />
                <span className="w-3 h-3 bg-[#7BA4E8] border border-[#0A0A0A]" title="1: 1-2 commits" />
                <span className="w-3 h-3 bg-[#0047AB] border border-[#0A0A0A]" title="2: 3-4 commits" />
                <span className="w-3 h-3 bg-[#0A1A3F] border border-[#0A0A0A]" title="3: 5-7 commits" />
                <span className="w-3 h-3 bg-[#FF5A1F] border border-[#0A0A0A]" title="4: 8+ commits" />
              </div>
              <span className="text-[#0A0A0A] ml-1">MAX</span>
            </div>
          </div>

          {/* Interactive Tooltip on Hover */}
          {hoveredDay && (
            <div
              style={{
                left: hoveredDay.left,
                top: hoveredDay.top,
              }}
              className="absolute pointer-events-none z-30 px-3 py-1.5 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs font-bold text-[#0A0A0A] whitespace-nowrap"
            >
              <span className="text-[#0047AB]">{hoveredDay.date}</span>: {hoveredDay.count} {hoveredDay.count === 1 ? 'contribution' : 'contributions'}
            </div>
          )}

          {/* Canvas with 16:7 on desktop, 4:3 on mobile */}
          <div className="w-full aspect-[4/3] md:aspect-[16/7] bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            <Suspense fallback={
              <div className="font-mono text-xs text-[#0A0A0A] font-bold">
                RENDERING 3D COMMIT SKYLINE...
              </div>
            }>
              <Canvas
                orthographic
                dpr={[1, 1.5]}
                camera={{ position: [-5, 8, 10], zoom: 32 }}
                gl={{ alpha: true, antialias: true }}
                frameloop={isSkylineInView && isTabVisible ? 'always' : 'never'}
              >
                <ambientLight intensity={1.2} />
                <directionalLight position={[6, 12, 8]} intensity={1.6} />
                <directionalLight position={[-8, -2, -6]} intensity={0.5} />

                <GitHubSkyline 
                  weeks={statsData?.calendarWeeks || []} 
                  onHoverDay={handleHoverDay}
                />
              </Canvas>
            </Suspense>
          </div>
        </div>

        {/* Real Totals Grid with Count-up */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <StatCounter 
            value={totalContributions} 
            label="Total Year Contributions" 
            color="text-[#0047AB]" 
          />
          <StatCounter 
            value={currentStreak} 
            suffix=" Days" 
            label="Current Daily Streak" 
            color="text-[#FF5A1F]" 
          />
          <StatCounter 
            value={publicReposCount} 
            label="Public Repositories" 
            color="text-[#0A1A3F]" 
          />
          <StatCounter 
            value={totalStars} 
            label="Stars" 
            color="text-[#FF5A1F]" 
          />
        </div>

        {/* Active Repositories Sub-grid */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-[#0A0A0A] pb-3">
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A]">
              FEATURED REPOSITORIES
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayRepos.map((repo) => (
              <div 
                key={repo.name} 
                className="p-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_#0A0A0A] transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-[#0A0A0A]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch size={18} className="text-[#0047AB] flex-shrink-0" />
                      <h4 className="font-display font-extrabold text-lg uppercase text-[#0A0A0A] truncate">
                        {repo.name}
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] uppercase whitespace-nowrap">
                      {repo.language}
                    </span>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed min-h-[48px]">
                    {repo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-[#0A0A0A]/10 mt-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-[#0A0A0A]">
                      <Star size={13} className="text-[#FF5A1F] fill-[#FF5A1F]" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#0A0A0A]">
                      <GitFork size={13} className="text-[#0047AB]" />
                      {repo.forks}
                    </span>
                  </div>

                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-bold text-[#0047AB] hover:text-[#FF5A1F] transition-colors"
                  >
                    VIEW REPO ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHubActivity;
