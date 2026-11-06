import { useState, useEffect } from 'react';

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
  weekday: number; // 0 (Sun) - 6 (Sat)
}

export interface CalendarWeek {
  contributionDays: ContributionDay[];
}

export interface GitHubRepository {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
}

export interface GitHubData {
  username: string;
  lastUpdated: string;
  totalContributions: number;
  currentStreak: number;
  bestDay: { date: string; count: number };
  publicReposCount: number;
  totalStars: number;
  calendarWeeks: CalendarWeek[];
  repositories: GitHubRepository[];
  isLoading: boolean;
  error: string | null;
  source: 'api' | 'cache' | 'fallback';
}


export function calculateCurrentStreak(weeks: CalendarWeek[]): number {
  if (!weeks || weeks.length === 0) return 0;

  const allDays = weeks.flatMap((w) => w.contributionDays);
  if (allDays.length === 0) return 0;

  let streak = 0;
  let started = false;

  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    if (day.contributionCount > 0) {
      streak++;
      started = true;
    } else {
      if (!started && i === allDays.length - 1) {
        continue;
      }
      break;
    }
  }

  return streak;
}

export function calculateBestDay(weeks: CalendarWeek[]): { date: string; count: number } {
  let maxCount = 0;
  let bestDate = '';

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > maxCount) {
        maxCount = day.contributionCount;
        bestDate = day.date;
      }
    }
  }

  return { date: bestDate, count: maxCount };
}

export function formatTimeAgo(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  } catch {
    return '';
  }
}

export function useGithubData(): GitHubData {
  const [data, setData] = useState<GitHubData>({
    username: 'sunny200551',
    lastUpdated: new Date().toISOString(),
    totalContributions: 660,
    currentStreak: 14,
    bestDay: { date: '2026-03-01', count: 8 },
    publicReposCount: 25,
    totalStars: 12,
    calendarWeeks: [],
    repositories: [],
    isLoading: true,
    error: null,
    source: 'fallback',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Load verified static telemetry dataset directly
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/github.json`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const weeks: CalendarWeek[] = json.calendarWeeks || [];
          const totalContribs = json.totalContributions || 660;
          const streak = json.currentStreak || 14;
          const bestDay = calculateBestDay(weeks);
          const lastUpdated = json.lastUpdated || new Date().toISOString();
          const publicRepos = json.publicReposCount || 25;
          const totalStars = json.totalStars || 12;

          const repos: GitHubRepository[] = Array.isArray(json.activeRepos)
            ? json.activeRepos.map((r: {
                name?: string;
                description?: string;
                url?: string;
                pushedAt?: string;
                language?: string;
                stars?: number;
                forks?: number;
              }) => ({
                name: r.name || '',
                description: r.description || '',
                html_url: r.url || '',
                stargazers_count: r.stars || 0,
                forks_count: r.forks || 0,
                language: r.language || 'TypeScript',
                pushed_at: r.pushedAt || new Date().toISOString(),
                fork: false,
              }))
            : [];

          if (isMounted) {
            setData({
              username: 'sunny200551',
              lastUpdated,
              totalContributions: totalContribs,
              currentStreak: streak,
              bestDay,
              publicReposCount: publicRepos,
              totalStars,
              calendarWeeks: weeks,
              repositories: repos,
              isLoading: false,
              error: null,
              source: 'api',
            });
          }
          return;
        }
      } catch {
        // Fallback
      }

      if (isMounted) {
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
