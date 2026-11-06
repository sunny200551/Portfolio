import { useState, lazy, Suspense } from 'react';
import { NavigationRail } from './components/ui/NavigationRail';
import { CustomCursor } from './components/ui/CustomCursor';
import { SmoothScroll } from './components/ui/SmoothScroll';
import { SkillsMarquee } from './components/ui/SkillsMarquee';
import { CommandPalette } from './components/CommandPalette';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { CodingDashboard } from './sections/CodingDashboard';
import { GitHubActivity } from './sections/GitHubActivity';
import { Events } from './sections/Events';
import { Journey } from './sections/Journey';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { useGitHubData } from './hooks/useGitHubData';

// Lazy-load persistent 3D canvas so text is instantly readable
const Scene = lazy(() => import('./components/three/Scene'));

function App() {
  const { profile, repos } = useGitHubData();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleContactScroll = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SmoothScroll>
      {/* Flat Custom Cursor */}
      <CustomCursor />

      {/* Persistent Fixed 3D Canvas behind HTML */}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      {/* Non-Navbar Modern Navigation: SP Logo + Controls + Vertical Section Rail + Fullscreen Menu */}
      <NavigationRail onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Main Page Layout Shell (Light Base) */}
      <main className="w-full bg-transparent text-[#0A0A0A] relative z-10">
        {/* 01. Hero Section (#home) */}
        <Hero onContactClick={handleContactScroll} profile={profile} />

        {/* Two-row infinite Skills Marquee directly under Hero */}
        <SkillsMarquee />

        {/* 02. About Section (#about) */}
        <About profile={profile} />

        {/* 03. Featured Work / Projects Gallery (#work) */}
        <Projects />

        {/* 04. Technical Stack & Skills (#skills) */}
        <Skills />

        {/* 05. GitHub Activity (#github) */}
        <GitHubActivity profile={profile} repos={repos} />

        {/* 06. Coding Dashboard (#stats) */}
        <CodingDashboard />

        {/* 07. Participated Events & Hackathons (#events) */}
        <Events />

        {/* 08. Learning Journey (#journey) */}
        <Journey />

        {/* 09. Contact Form (#contact) */}
        <Contact profile={profile} />

        {/* Minimal Solid Navy Footer */}
        <Footer profile={profile} />
      </main>

      {/* Accessible Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onOpen={() => setCommandPaletteOpen(true)}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </SmoothScroll>
  );
}

export default App;
