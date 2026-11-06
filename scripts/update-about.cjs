const fs = require('fs');

let code = fs.readFileSync('src/sections/About.tsx', 'utf8');

// Add import
code = code.replace(
  "import type { GitHubProfile } from '../hooks/useGitHubData';",
  "import type { GitHubProfile } from '../hooks/useGitHubData';\r\nimport { useGithubData } from '../lib/github';"
);

// Replace state and fetch effect
const targetBlock = `  const [publicReposCount, setPublicReposCount] = useState<number>(profile?.public_repos || 25);

  // Fetch GitHub repos from the same public/data/github.json as the GitHub section
  useEffect(() => {
    let isMounted = true;
    const fetchGithubData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = \`\${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/github.json\`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.publicReposCount !== undefined) {
            setPublicReposCount(data.publicReposCount);
          }
        }
      } catch {
        // Fallback to profile.public_repos
      }
    };
    fetchGithubData();
    return () => {
      isMounted = false;
    };
  }, [profile]);`.replace(/\n/g, '\r\n');

const replBlock = `  const githubData = useGithubData();
  const publicReposCount = githubData.publicReposCount || profile?.public_repos || 7;`.replace(/\n/g, '\r\n');

if (!code.includes(targetBlock)) {
  console.error('Target block in About.tsx not found!');
  process.exit(1);
}

code = code.replace(targetBlock, replBlock);
fs.writeFileSync('src/sections/About.tsx', code, 'utf8');
console.log('Successfully updated About.tsx with useGithubData');

