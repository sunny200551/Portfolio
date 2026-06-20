import { useEffect } from 'react';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { Projects } from './sections/Projects';
import { Journey } from './sections/Journey';
import { CurrentFocus } from './sections/CurrentFocus';
import { GitHubActivity } from './sections/GitHubActivity';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { CommandPalette } from './components/CommandPalette';
import { ParticleBackground } from './components/ParticleBackground';
import { CursorSpotlight } from './components/CursorSpotlight';
import { useGitHubData } from './hooks/useGitHubData';
import { CodingDashboard } from './sections/CodingDashboard';

function App() {
  const { profile, repos, loading } = useGitHubData();

  // Set default theme and load configurations
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const handleContactScroll = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Dynamic Cursor Spotlight Effect */}
      <CursorSpotlight />

      {/* Dynamic connecting particles background */}
      <ParticleBackground />

      {/* Futuristic Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-4xl px-6 py-3.5 glassmorphism rounded-2xl shadow-xl flex items-center justify-between border border-white/8">
        {/* Logo Branding */}
        <a 
          href="#hero" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-sm font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-mono flex items-center gap-1.5 hover:scale-102 transition-transform cursor-pointer"
        >
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">[</span>
          sunny.dev
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">]</span>
        </a>

        {/* Navigation Items (Desktop only) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-semibold tracking-wide">
          <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">ABOUT</a>
          <a href="#skills" onClick={(e) => { e.preventDefault(); document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">SKILLS</a>
          <a href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">PROJECTS</a>
          <a href="#coding" onClick={(e) => { e.preventDefault(); document.getElementById('coding')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">CODING</a>
          <a href="#journey" onClick={(e) => { e.preventDefault(); document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">JOURNEY</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">CONTACT</a>
        </nav>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full">
        {/* Sections */}
        <Hero onContactClick={handleContactScroll} profile={profile} />
        
        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <About profile={profile} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>
        
        <Skills />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <Projects repos={repos} loading={loading} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <CodingDashboard />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <Journey />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <CurrentFocus />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <GitHubActivity profile={profile} repos={repos} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/15 dark:via-white/5 to-transparent" /></div>

        <Contact profile={profile} />

        <Footer profile={profile} />
      </main>

      {/* Interactive Command Palette Trigger (Fixed lower right) */}
      <CommandPalette />
    </>
  );
}

export default App;
