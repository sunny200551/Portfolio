import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERNAME = 'sunny200551';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const query = `
query ($username: String!) {
  user(login: $username) {
    name
    bio
    avatarUrl
    location
    repositories(first: 15, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        primaryLanguage {
          name
        }
        pushedAt
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
            weekday
          }
        }
      }
    }
  }
}
`;

async function fetchGitHubData() {
  console.log(`[fetch-github] Fetching real contributions for ${USERNAME}...`);

  if (!GITHUB_TOKEN) {
    console.warn('[fetch-github] GITHUB_TOKEN not found in environment. Please provide GITHUB_TOKEN.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Sunny-Portfolio-Bot'
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `bearer ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { username: USERNAME } })
    });

    if (!res.ok) {
      throw new Error(`GitHub GraphQL HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.errors) {
      throw new Error(`GitHub GraphQL API error: ${JSON.stringify(data.errors)}`);
    }

    const user = data.data.user;
    if (!user) {
      throw new Error(`User ${USERNAME} not found.`);
    }

    const calendar = user.contributionsCollection.contributionCalendar;
    const repos = user.repositories.nodes || [];
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazerCount || 0), 0);

    // Calculate current streak
    let currentStreak = 0;
    const allDays = [];
    calendar.weeks.forEach(w => {
      w.contributionDays.forEach(d => {
        allDays.push(d);
      });
    });

    // Traverse backwards from yesterday/today
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].contributionCount > 0) {
        currentStreak++;
      } else if (i === allDays.length - 1) {
        // Today might just have no contributions yet
        continue;
      } else {
        break;
      }
    }

    const output = {
      username: USERNAME,
      lastUpdated: new Date().toISOString(),
      totalContributions: calendar.totalContributions,
      currentStreak,
      publicReposCount: user.repositories.totalCount,
      totalStars,
      calendarWeeks: calendar.weeks,
      activeRepos: repos.slice(0, 4).map(r => ({
        name: r.name,
        description: r.description || 'Public repository',
        url: r.url,
        homepageUrl: r.homepageUrl,
        stars: r.stargazerCount,
        forks: r.forkCount,
        language: r.primaryLanguage ? r.primaryLanguage.name : 'TypeScript',
        pushedAt: r.pushedAt
      }))
    };

    const outDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.join(outDir, 'github.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`[fetch-github] Successfully wrote ${outPath} with ${calendar.totalContributions} total contributions.`);
  } catch (err) {
    console.error(`[fetch-github] Error fetching GitHub data:`, err.message);
  }
}

fetchGitHubData();

