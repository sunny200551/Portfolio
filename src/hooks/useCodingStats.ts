import { useState, useEffect } from 'react';
import baselineStats from '../data/codingStats.json';
import { codingProfilesConfig } from '../config/codingProfiles';

export interface CodingProfileStats {
  leetcode: {
    username: string;
    ranking: number | null;
    solved: {
      all: number;
      easy: number;
      medium: number;
      hard: number;
    };
    totalQuestions: number;
  };
  codechef: {
    username: string;
    rating: number | null;
    stars: number | null;
    globalRank: string | null;
    countryRank: string | null;
    division: string | null;
  };
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'leetcode' | 'codechef' | 'general';
  icon: string;
  unlocked: boolean;
  progress: {
    current: number;
    target: number;
    unit: string;
  };
}

export const useCodingStats = () => {
  const [stats, setStats] = useState<CodingProfileStats>(baselineStats as CodingProfileStats);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const cacheKey = 'sunny_portfolio_coding_stats';
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          // 2-hour caching for live stats to avoid spamming the APIs
          if (Date.now() - parsed.timestamp < 7200000) {
            setStats(parsed.stats);
            setLoading(false);
            return;
          }
        }

        // Fetch LeetCode stats from Alfa API (CORS enabled)
        const lcUsername = codingProfilesConfig.leetcodeUsername;
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUsername}`);
        
        if (response.ok) {
          const lcData = await response.json();
          if (lcData && !lcData.errors && lcData.ranking) {
            const updatedStats: CodingProfileStats = {
              ...stats,
              leetcode: {
                username: lcUsername,
                ranking: lcData.ranking || stats.leetcode.ranking,
                solved: {
                  all: lcData.totalSolved || stats.leetcode.solved.all,
                  easy: lcData.easySolved || stats.leetcode.solved.easy,
                  medium: lcData.mediumSolved || stats.leetcode.solved.medium,
                  hard: lcData.hardSolved || stats.leetcode.solved.hard
                },
                totalQuestions: lcData.totalQuestions || stats.leetcode.totalQuestions
              },
              lastUpdated: new Date().toISOString()
            };

            // Cache the successful fetch
            sessionStorage.setItem(cacheKey, JSON.stringify({
              stats: updatedStats,
              timestamp: Date.now()
            }));
            
            setStats(updatedStats);
          }
        }
      } catch (err) {
        console.warn('Could not fetch real-time stats, using build-time cache:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
  }, []);

  // Compute Achievements dynamically
  useEffect(() => {
    const milestones = codingProfilesConfig.milestones;
    const lcSolved = stats.leetcode.solved;
    const ccRating = stats.codechef.rating || 0;

    const dynamicAchievements: Achievement[] = [
      {
        id: 'lc_explorer',
        title: 'LeetCode Explorer',
        description: `Solve ${milestones.leetcodeSolved[0]} problems on LeetCode.`,
        category: 'leetcode',
        icon: 'Compass',
        unlocked: lcSolved.all >= milestones.leetcodeSolved[0],
        progress: {
          current: lcSolved.all,
          target: milestones.leetcodeSolved[0],
          unit: 'solved'
        }
      },
      {
        id: 'lc_knight',
        title: 'LeetCode Knight',
        description: `Solve ${milestones.leetcodeSolved[1]} problems on LeetCode.`,
        category: 'leetcode',
        icon: 'Shield',
        unlocked: lcSolved.all >= milestones.leetcodeSolved[1],
        progress: {
          current: lcSolved.all,
          target: milestones.leetcodeSolved[1],
          unit: 'solved'
        }
      },
      {
        id: 'lc_medium_master',
        title: 'Medium Mastery',
        description: 'Solve 5 or more Medium level algorithmic challenges.',
        category: 'leetcode',
        icon: 'BookOpen',
        unlocked: lcSolved.medium >= 5,
        progress: {
          current: lcSolved.medium,
          target: 5,
          unit: 'medium solved'
        }
      },
      {
        id: 'lc_hard_conqueror',
        title: 'Hard Conqueror',
        description: 'Solve 1 or more Hard level complex problem.',
        category: 'leetcode',
        icon: 'Award',
        unlocked: lcSolved.hard >= 1,
        progress: {
          current: lcSolved.hard,
          target: 1,
          unit: 'hard solved'
        }
      },
      {
        id: 'cc_contender',
        title: 'CodeChef Contender',
        description: 'Participate and get rated on CodeChef contests.',
        category: 'codechef',
        icon: 'GitBranch',
        unlocked: ccRating > 0,
        progress: {
          current: ccRating > 0 ? 1 : 0,
          target: 1,
          unit: 'active'
        }
      },
      {
        id: 'cc_2_star',
        title: 'CodeChef 2-Star Star',
        description: `Reach a rating of ${milestones.codechefRating[0]} (2★) on CodeChef.`,
        category: 'codechef',
        icon: 'Star',
        unlocked: ccRating >= milestones.codechefRating[0],
        progress: {
          current: ccRating,
          target: milestones.codechefRating[0],
          unit: 'rating'
        }
      },
      {
        id: 'dsa_champion',
        title: 'Data Structures Specialist',
        description: 'Completed 20+ algorithmic practice challenges.',
        category: 'general',
        icon: 'Code',
        unlocked: (lcSolved.all + (ccRating > 0 ? 10 : 0)) >= 20,
        progress: {
          current: lcSolved.all,
          target: 20,
          unit: 'practices'
        }
      }
    ];

    setAchievements(dynamicAchievements);
  }, [stats]);

  return { stats, loading, achievements };
};
export default useCodingStats;
