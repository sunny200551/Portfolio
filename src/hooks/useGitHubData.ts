import { useState, useEffect } from 'react';

export interface GitHubProfile {
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  fork: boolean;
  has_pages: boolean;
}

const DEFAULT_PROFILE: GitHubProfile = {
  name: 'Sunny Pasumarthi',
  bio: 'Computer Science student building responsive web applications with React, TypeScript, and Tailwind CSS.',
  avatar_url: '/profile.webp',
  location: 'India',
  public_repos: 25,
  followers: 0,
  following: 0,
};

export const useGitHubData = () => {
  const [profile, setProfile] = useState<GitHubProfile>(DEFAULT_PROFILE);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const cacheKey = 'sunny_portfolio_github_data';

      // 1. Check local session cache
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.profile && parsed.repos && isMounted) {
            setProfile(parsed.profile);
            setRepos(parsed.repos);
            setLoading(false);
            if (Date.now() - parsed.timestamp < 3600000) return;
          }
        }
      } catch {
        // Continue
      }

      // 2. Load static verified repository and profile telemetry
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/github.json`;
        const staticRes = await fetch(url);
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          const cleanProfile: GitHubProfile = {
            name: 'Sunny Pasumarthi',
            bio: 'Computer Science student building responsive web applications with React, TypeScript, and Tailwind CSS.',
            avatar_url: '/profile.webp',
            location: 'India',
            public_repos: staticData.publicReposCount ?? 25,
            followers: 0,
            following: 0,
          };

          const cleanRepos: GitHubRepo[] = Array.isArray(staticData.activeRepos)
            ? staticData.activeRepos.map((r: {
                name?: string;
                description?: string;
                url?: string;
                homepageUrl?: string;
                stars?: number;
                forks?: number;
                language?: string;
              }) => ({
                name: String(r.name || ''),
                description: String(r.description || ''),
                html_url: String(r.url || ''),
                homepage: String(r.homepageUrl || ''),
                stargazers_count: Number(r.stars || 0),
                forks_count: Number(r.forks || 0),
                language: String(r.language || 'TypeScript'),
                topics: [],
                fork: false,
                has_pages: Boolean(r.homepageUrl),
              }))
            : [];

          if (isMounted) {
            setProfile(cleanProfile);
            setRepos(cleanRepos);
            setLoading(false);
          }

          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                profile: cleanProfile,
                repos: cleanRepos,
                timestamp: Date.now(),
              })
            );
          } catch {
            // Ignore storage quota
          }
        }
      } catch {
        // Fallback to static defaults
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, repos, loading };
};
