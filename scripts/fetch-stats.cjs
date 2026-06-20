const fs = require('fs');
const path = require('path');

// Helper to log with timestamp
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function run() {
  log('Starting stats update process...');
  
  // 1. Read configuration
  const configPath = path.join(__dirname, '../src/config/codingProfiles.ts');
  let leetcodeUsername = 'SunnyPasumarthi';
  let codechefUsername = 'sunny_p2005';
  
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const leetcodeMatch = configContent.match(/leetcodeUsername:\s*'([^']+)'/) || configContent.match(/leetcodeUsername:\s*"([^"]+)"/);
      const codechefMatch = configContent.match(/codechefUsername:\s*'([^']+)'/) || configContent.match(/codechefUsername:\s*"([^"]+)"/);
      
      if (leetcodeMatch) leetcodeUsername = leetcodeMatch[1];
      if (codechefMatch) codechefUsername = codechefMatch[1];
      
      log(`Read config: LeetCode=${leetcodeUsername}, CodeChef=${codechefUsername}`);
    } else {
      log('Configuration file not found. Using defaults.');
    }
  } catch (err) {
    log(`Error reading configuration: ${err.message}`);
  }

  // 2. Read existing data if available
  const dataPath = path.join(__dirname, '../src/data/codingStats.json');
  let currentStats = {
    leetcode: { username: leetcodeUsername, ranking: null, solved: { all: 0, easy: 0, medium: 0, hard: 0 }, totalQuestions: 3200 },
    codechef: { username: codechefUsername, rating: null, stars: null, globalRank: null, countryRank: null, division: null },
    lastUpdated: new Date().toISOString()
  };

  if (fs.existsSync(dataPath)) {
    try {
      currentStats = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      log('Loaded existing codingStats.json');
    } catch (err) {
      log(`Error parsing existing stats JSON: ${err.message}`);
    }
  }

  // Ensure usernames match latest configuration
  currentStats.leetcode.username = leetcodeUsername;
  currentStats.codechef.username = codechefUsername;

  // 3. Fetch LeetCode Stats
  log(`Fetching LeetCode stats for ${leetcodeUsername}...`);
  try {
    const leetcodeQuery = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            realName
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        allQuestionsCount {
          difficulty
          count
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: leetcodeQuery,
        variables: { username: leetcodeUsername }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.errors) {
        log(`LeetCode GraphQL error: ${data.errors[0].message}`);
      } else if (data.data && data.data.matchedUser) {
        const user = data.data.matchedUser;
        const ranking = user.profile.ranking;
        const acStats = user.submitStats.acSubmissionNum;
        
        let allSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;
        acStats.forEach(stat => {
          if (stat.difficulty === 'All') allSolved = stat.count;
          if (stat.difficulty === 'Easy') easySolved = stat.count;
          if (stat.difficulty === 'Medium') mediumSolved = stat.count;
          if (stat.difficulty === 'Hard') hardSolved = stat.count;
        });

        // Get total questions count
        let totalCount = 3200;
        const questionsCount = data.data.allQuestionsCount;
        if (questionsCount) {
          const allQuestions = questionsCount.find(q => q.difficulty === 'All');
          if (allQuestions) totalCount = allQuestions.count;
        }

        currentStats.leetcode = {
          username: leetcodeUsername,
          ranking,
          solved: {
            all: allSolved,
            easy: easySolved,
            medium: mediumSolved,
            hard: hardSolved
          },
          totalQuestions: totalCount
        };
        log('LeetCode stats successfully updated!');
      } else {
        log('LeetCode user not found or invalid response structure.');
      }
    } else {
      log(`LeetCode API call failed: ${res.status}`);
    }
  } catch (err) {
    log(`Failed to fetch LeetCode stats: ${err.message}`);
  }

  // 4. Fetch CodeChef Stats
  log(`Fetching CodeChef stats for ${codechefUsername}...`);
  try {
    const res = await fetch(`https://www.codechef.com/users/${codechefUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      // Check for redirect to CodeChef homepage (which means user does not exist)
      if (res.redirected && (res.url === 'https://www.codechef.com/' || res.url === 'https://www.codechef.com')) {
        log(`CodeChef username ${codechefUsername} does not exist (redirected to home page). Saving null values.`);
        currentStats.codechef = {
          username: codechefUsername,
          rating: null,
          stars: null,
          globalRank: null,
          countryRank: null,
          division: null
        };
      } else {
        const html = await res.text();
        
        // Parse Rating
        const ratingMatch = html.match(/class="[^"]*rating-number[^"]*"[^>]*>\s*(\d+)/i) || html.match(/<div class="rating-number">([^<]+)<\/div>/i);
        const rating = ratingMatch ? parseInt(ratingMatch[1].trim(), 10) : null;
        
        // Parse Stars
        const ratingStarBlock = html.match(/<div class="rating-star">([\s\S]*?)<\/div>/i);
        const starBlockContent = ratingStarBlock ? ratingStarBlock[1] : '';
        const stars = starBlockContent ? (starBlockContent.match(/&#9733;/g) || starBlockContent.match(/★/g) || []).length : null;
        
        // Parse Division
        const divMatch = html.match(/\((Div \d+)\)/i);
        const division = divMatch ? divMatch[1].trim() : null;

        // Parse Ranks
        const ranksBlockMatch = html.match(/<div class="rating-ranks">([\s\S]*?)<\/div>/i);
        let globalRank = null;
        let countryRank = null;
        
        if (ranksBlockMatch) {
          const ranksContent = ranksBlockMatch[1];
          const globalMatch = ranksContent.match(/Global Rank[\s\S]*?<strong>([^<]+)<\/strong>/i) || ranksContent.match(/<strong>([^<]+)<\/strong>\s*<\/a>\s*Global Rank/i) || html.match(/Global Rank:[\s\S]*?<strong>([^<]+)<\/strong>/i);
          const countryMatch = ranksContent.match(/Country Rank[\s\S]*?<strong>([^<]+)<\/strong>/i) || ranksContent.match(/<strong>([^<]+)<\/strong>\s*<\/a>\s*Country Rank/i) || html.match(/Country Rank:[\s\S]*?<strong>([^<]+)<\/strong>/i);
          
          if (globalMatch) globalRank = globalMatch[1].trim();
          if (countryMatch) countryRank = countryMatch[1].trim();
        }

        currentStats.codechef = {
          username: codechefUsername,
          rating,
          stars,
          globalRank,
          countryRank,
          division
        };
        log(`CodeChef stats updated: Rating=${rating}, Stars=${stars}★, Div=${division}, GlobalRank=${globalRank}`);
      }
    } else {
      log(`CodeChef API call failed: ${res.status}`);
    }
  } catch (err) {
    log(`Failed to fetch CodeChef stats: ${err.message}`);
  }

  // 5. Save output
  currentStats.lastUpdated = new Date().toISOString();
  try {
    const parentDir = path.dirname(dataPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(currentStats, null, 2));
    log(`Successfully wrote coding statistics to ${dataPath}`);
  } catch (err) {
    log(`Error writing stats file: ${err.message}`);
  }
}

run().catch(err => {
  log(`Unhandled script error: ${err.message}`);
  process.exit(1);
});
