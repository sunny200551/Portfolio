import { useState, useEffect } from 'react';
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
import { Moon, Sun } from 'lucide-react';
import { useGitHubData } from './hooks/useGitHubData';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { profile, repos, loading } = useGitHubData();

  // Set default theme and load configurations
  useEffect(() => {
    const isLight = localStorage.getItem('theme') === 'light';
    setIsDarkMode(!isLight);
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newVal;
    });
  };

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
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-4xl px-6 py-3.5 glassmorphism rounded-2xl shadow-xl flex items-center justify-between border border-white/8 light:border-black/8">
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
          <a href="#journey" onClick={(e) => { e.preventDefault(); document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">JOURNEY</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">CONTACT</a>
        </nav>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full">
        {/* Sections */}
        <Hero onContactClick={handleContactScroll} profile={profile} />
        
        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <About profile={profile} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>
        
        <Skills />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <Projects repos={repos} loading={loading} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <Journey />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <CurrentFocus />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <GitHubActivity profile={profile} repos={repos} />

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-4"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-black/5" /></div>

        <Contact profile={profile} />

        <Footer profile={profile} />
      </main>

      {/* Interactive Command Palette Trigger (Fixed lower right) */}
      <CommandPalette onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
    </>
  );
}

export default App;
