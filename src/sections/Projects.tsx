import React, { useState } from 'react';
import { ExternalLink, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GitHubRepo } from '../hooks/useGitHubData';

interface Project {
  title: string;
  description: string;
  liveLink: string;
  githubLink?: string;
  tags: string[];
  image: string;
}

const getRepoImage = (name: string, description: string, topics: string[] = []): string => {
  const lowerName = name.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const allKeywords = [...topics, lowerName, lowerDesc].join(' ');

  if (allKeywords.includes('weather')) {
    return 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  if (allKeywords.includes('lab') || allKeywords.includes('education') || allKeywords.includes('study') || allKeywords.includes('school')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  if (allKeywords.includes('portfolio') || allKeywords.includes('profile')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  if (allKeywords.includes('blockchain') || allKeywords.includes('smart contract') || allKeywords.includes('crypto') || allKeywords.includes('web3') || allKeywords.includes('solidity')) {
    return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  if (allKeywords.includes('database') || allKeywords.includes('sql') || allKeywords.includes('mongo')) {
    return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  if (allKeywords.includes('game') || allKeywords.includes('play')) {
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  
  const fallbacks = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbacks.length;
  return fallbacks[index];
};

const ProjectCard: React.FC<{ project: Project; onPreviewClick: (project: Project) => void }> = ({ 
  project, 
  onPreviewClick 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );

  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const listener = () => setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return (
    <motion.div
      onMouseEnter={isMobile ? undefined : () => setIsFocused(true)}
      onMouseLeave={isMobile ? undefined : () => setIsFocused(false)}
      whileHover={isMobile ? undefined : { y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative col-span-12 md:col-span-6 flex flex-col justify-between overflow-hidden glassmorphism rounded-2xl border border-zinc-800 dark:border-zinc-800 p-0 group cursor-pointer"
    >
      {/* Cover Image */}
      <div 
        onClick={isMobile ? () => onPreviewClick(project) : undefined}
        className="relative h-48 w-full overflow-hidden border-b border-white/5"
      >
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Action Trigger Overlay (Desktop only) */}
        {!isMobile && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewClick(project);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-lg font-mono text-xs uppercase tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            >
              <Maximize2 size={14} />
              Live Preview
            </button>
          </div>
        )}

        {/* Floating title badge */}
        <span className="absolute top-4 left-4 text-[10px] font-mono py-1 px-2.5 rounded-full border border-violet-500/30 bg-black/60 text-violet-300 uppercase tracking-widest backdrop-blur-md">
          Featured Project
        </span>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-zinc-100 dark:text-zinc-100">{project.title}</h3>
          <p className="text-sm text-zinc-400 dark:text-zinc-400 leading-relaxed min-h-[72px]">
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 my-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono py-0.5 px-2 rounded-md bg-white/3 dark:bg-zinc-950 border border-white/5 text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-4 items-center border-t border-white/5 pt-4 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreviewClick(project);
            }}
            className="text-xs font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Maximize2 size={13} />
            Interactive Frame
          </button>
          
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <ExternalLink size={13} />
            Open Site
          </a>

          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              title="GitHub"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Inner Card Glow Highlight */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            border: '1px solid transparent',
            backgroundImage: isFocused 
              ? `radial-gradient(circle 180px at 50% 50%, rgba(139, 92, 246, 0.25), transparent 80%)` 
              : 'none',
            backgroundClip: 'border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: isFocused ? 1 : 0,
          }}
        />
      )}
    </motion.div>
  );
};

interface ProjectsProps {
  repos: GitHubRepo[];
  loading: boolean;
}

export const Projects: React.FC<ProjectsProps> = ({ repos, loading }) => {
  const [activePreview, setActivePreview] = useState<Project | null>(null);

  // Filter out forks and map user repositories dynamically
  const nonForkRepos = (repos || []).filter(r => !r.fork);
  const mappedProjects: Project[] = nonForkRepos.map(repo => {
    // Determine dynamic live link (homepage or GitHub pages path or fallback)
    const liveLink = repo.homepage || (repo.has_pages ? `https://sunny200551.github.io/${repo.name}/` : repo.html_url);
    const tags = repo.topics.length > 0 
      ? repo.topics.slice(0, 4) 
      : [repo.language, 'Open Source'].filter(Boolean);

    return {
      title: repo.name,
      description: repo.description || `Developer repository for ${repo.name} projects.`,
      liveLink,
      githubLink: repo.html_url,
      tags,
      image: getRepoImage(repo.name, repo.description, repo.topics)
    };
  });

  // Fallback to default manual projects if loading has failed or repos are empty
  const displayProjects = mappedProjects.length > 0 ? mappedProjects : [
    {
      title: 'Weather Application',
      description: 'A highly responsive weather forecasting application providing real-time weather updates and 5-day forecasts using open weather APIs with detailed meteorological metrics.',
      liveLink: 'https://sunny200551.github.io/Weather/',
      githubLink: 'https://github.com/sunny200551/Weather',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'Weather API', 'Responsive Layout'],
      image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      title: 'StevesLabHub',
      description: 'An academic resource center and materials library enabling students to access study notes, experimental manuals, and educational materials efficiently.',
      liveLink: 'https://sunny200551.github.io/StevesLabHub/',
      githubLink: 'https://github.com/sunny200551/StevesLabHub',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'Education UI', 'Dynamic Filters'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];

  return (
    <section id="projects" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Project Showcases
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Practical Deployments & Labs
        </p>
      </div>

      {loading && displayProjects.length === 2 && (
        <div className="text-center text-xs font-mono text-zinc-500 mb-6 animate-pulse">
          ⚡ LOADING REPOSITORIES FROM GITHUB...
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {displayProjects.map((proj) => (
          <ProjectCard
            key={proj.title}
            project={proj}
            onPreviewClick={(p) => setActivePreview(p)}
          />
        ))}
      </div>

      {/* Live Preview Iframe Modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePreview(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl h-[85vh] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{activePreview.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{activePreview.liveLink}</span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={activePreview.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={13} />
                    Open Tab
                  </a>
                  <button
                    onClick={() => setActivePreview(null)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Iframe content */}
              <div className="flex-grow bg-white relative">
                <iframe
                  src={activePreview.liveLink}
                  title={activePreview.title}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  loading="lazy"
                />
                
                {/* Fallback Warning Box if page refuses to frame */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-950/95 border border-amber-500/20 text-zinc-300 text-xs sm:text-sm font-mono flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
                  <span>
                    💡 Loading. If the interactive frame appears blank or blocked, open the application in a new tab.
                  </span>
                  <a
                    href={activePreview.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto px-3.5 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-sans text-xs font-bold transition-all text-center whitespace-nowrap"
                  >
                    Open Live Site
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
export default Projects;
