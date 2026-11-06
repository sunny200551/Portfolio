import React, { useState, useEffect, useRef, useCallback } from 'react';
import { lazy, Suspense } from 'react';
import { GitBranch, Star, GitFork } from 'lucide-react';
import type { DayHoverInfo } from '../components/three/GitHubSkyline';
const SkylineCanvas = lazy(() => import('../components/three/SkylineCanvas'));
import { useGithubData, formatTimeAgo } from '../lib/github';
import { CanvasErrorBoundary, TimeoutSuspense } from '../components/three/CanvasBoundary';
import { Flat2DContributionGrid } from '../components/ui/Flat2DContributionGrid';

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

export interface GitHubActivityProps {
  profile?: unknown;
  repos?: unknown[];
}

export const GitHubActivity: React.FC<GitHubActivityProps> = () => {
  const githubData = useGithubData();
  const [isSkylineInView, setIsSkylineInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<PositionedTooltip | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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

  // Handle bar hover tooltip with bounds clamping inside canvas container
  const handleHoverDay = useCallback((info: DayHoverInfo | null) => {
    if (!info || !canvasContainerRef.current) {
      setHoveredDay(null);
      return;
    }
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const relX = info.clientX - rect.left;
    const relY = info.clientY - rect.top;

    setHoveredDay({
      date: info.date,
      count: info.count,
      left: Math.max(12, Math.min(rect.width - 200, relX - 70)),
      top: Math.max(10, relY - 45),
    });
  }, []);

  const {
    totalContributions,
    currentStreak,
    publicReposCount,
    totalStars,
    calendarWeeks,
    repositories,
    lastUpdated,
  } = githubData;

  const formattedLastUpdated = lastUpdated ? formatTimeAgo(lastUpdated) : null;

  // Active Repos: up to 4 non-fork repos sorted by pushed_at
  const displayRepos = repositories
    .filter((r) => !r.fork)
    .slice(0, 4);

  return (
    <section 
      id="github" 
      className="w-full bg-white text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div data-robot-anchor="github:skyline" data-robot-offset-x="-60" data-robot-offset-y="-15" className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            05 // GITHUB
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0A] leading-none mb-4">
              COMMIT SKYLINE
            </h2>
            <p className="font-mono text-sm text-[#0A0A0A]/80 max-w-xl">
              Real-time commit telemetry from GitHub GraphQL & REST API. Visualized as an isometric 3D cityscape over the last 52 weeks.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold">
            {formattedLastUpdated ? (
              <div className="px-3 py-1.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                <span>UPDATED {formattedLastUpdated.toUpperCase()}</span>
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

        {/* 3D Isometric Skyline Canvas Box */}
        <div 
          ref={canvasContainerRef} 
          data-robot-react="happy"
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

          {/* Canvas with 16:7 on desktop, 4:3 on mobile with ErrorBoundary & 4s Timeout */}
          <div className="w-full aspect-[4/3] md:aspect-[16/7] bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            {/* DOM Overlay Weekday Labels (Left edge) */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col justify-between h-24 font-mono text-[10px] font-bold text-[#0A0A0A]/70 pointer-events-none select-none z-20">
              <span>MON</span>
              <span>WED</span>
              <span>FRI</span>
            </div>

            {/* DOM Overlay Month Labels (Bottom edge) */}
            <div className="absolute bottom-2.5 left-12 right-6 flex justify-between font-mono text-[9px] font-bold text-[#0A0A0A]/70 pointer-events-none select-none z-20">
              {['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'].map((m, idx) => (
                <span key={`${m}-${idx}`}>{m}</span>
              ))}
            </div>

            <CanvasErrorBoundary fallback={<Flat2DContributionGrid weeks={calendarWeeks} />}>
              <TimeoutSuspense 
                timeoutMs={4000}
                active={isSkylineInView}
                fallback={
                  <div className="font-mono text-xs text-[#0A0A0A] font-bold flex flex-col items-center gap-2">
                    <span className="w-3 h-3 border-2 border-[#FF5A1F] border-t-transparent animate-spin inline-block" />
                    <span>RENDERING 3D COMMIT SKYLINE...</span>
                  </div>
                }
                timeoutFallback={<Flat2DContributionGrid weeks={calendarWeeks} />}
              >
                <Suspense fallback={null}>
                  <SkylineCanvas 
                    calendarWeeks={calendarWeeks as unknown as import('../components/three/GitHubSkyline').ContributionWeek[]} 
                    isSkylineInView={isSkylineInView}
                    isTabVisible={isTabVisible}
                    onHoverDay={handleHoverDay}
                  />
                </Suspense>
              </TimeoutSuspense>
            </CanvasErrorBoundary>
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
        {displayRepos.length > 0 && (
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
                      {repo.language && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] uppercase whitespace-nowrap">
                          {repo.language}
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed min-h-[48px]">
                      {repo.description || 'Public GitHub project repository by Sunny Pasumarthi.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-[#0A0A0A]/10 mt-4 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-[#0A0A0A]">
                        <Star size={13} className="text-[#FF5A1F] fill-[#FF5A1F]" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#0A0A0A]">
                        <GitFork size={13} className="text-[#0047AB]" />
                        {repo.forks_count}
                      </span>
                    </div>

                    <a 
                      href={repo.html_url} 
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
        )}
      </div>
    </section>
  );
};

export default GitHubActivity;
