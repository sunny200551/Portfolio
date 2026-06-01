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

export const useGitHubData = () => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = 'sunny_portfolio_github_data';
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cache has both profile and repos and is less than 1 hour old
          if (parsed.profile && parsed.repos && (Date.now() - parsed.timestamp < 3600000)) {
            setProfile(parsed.profile);
            setRepos(parsed.repos);
            setLoading(false);
            return;
          }
        }

        const [profileRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/sunny200551'),
          fetch('https://api.github.com/users/sunny200551/repos?sort=updated&per_page=100')
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          throw new Error('Failed to fetch from GitHub API');
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        const cleanProfile: GitHubProfile = {
          name: profileData.name || 'Sunny Pasumarthi',
          bio: profileData.bio || 'Computer Science Engineering student passionate about full stack development and blockchain.',
          avatar_url: profileData.avatar_url || 'https://github.com/sunny200551.png',
          location: profileData.location || 'India',
          public_repos: profileData.public_repos || 25,
          followers: profileData.followers || 0,
          following: profileData.following || 0
        };

        const cleanRepos: GitHubRepo[] = reposData.map((r: any) => ({
          name: r.name,
          description: r.description || '',
          html_url: r.html_url,
          homepage: r.homepage || '',
          stargazers_count: r.stargazers_count || 0,
          forks_count: r.forks_count || 0,
          language: r.language || 'JavaScript',
          topics: r.topics || [],
          fork: r.fork,
          has_pages: r.has_pages
        }));

        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify({
          profile: cleanProfile,
          repos: cleanRepos,
          timestamp: Date.now()
        }));

        setProfile(cleanProfile);
        setRepos(cleanRepos);
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { profile, repos, loading };
};
