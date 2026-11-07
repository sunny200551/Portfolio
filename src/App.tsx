import { useState, useEffect, lazy, Suspense } from 'react';
import { NavigationRail } from './components/ui/NavigationRail';
import { CustomCursor } from './components/ui/CustomCursor';
import { SmoothScroll } from './components/ui/SmoothScroll';
import { SkillsMarquee } from './components/ui/SkillsMarquee';
import { CommandPalette } from './components/CommandPalette';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { Internship } from './sections/Internship';
import { GitHubActivity } from './sections/GitHubActivity';
import { CodingDashboard } from './sections/CodingDashboard';
import { Events } from './sections/Events';
import { Journey } from './sections/Journey';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { useGitHubData } from './hooks/useGitHubData';

import { SessionLoader } from './components/ui/SessionLoader';
import { useSteveHandoff } from './hooks/useSteveHandoff';

// Lazy-load fixed gutter mascot & content edit bay for optimal initial load
const FixedGutterSteve = lazy(() => import('./robot/FixedGutterSteve'));
const RobotShowcase = lazy(() => import('./robot/RobotShowcase'));
const ContentSection = lazy(() => import('./sections/Content'));

function App() {
  useSteveHandoff();
  const { profile, repos } = useGitHubData();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const isRobotShowcase = typeof window !== 'undefined' && window.location.search.includes('robot-showcase');
  const [mountedAfterPaint, setMountedAfterPaint] = useState(false);

  useEffect(() => {
    // Mount mascot module after initial DOM paint to prioritize critical content
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setMountedAfterPaint(true), 60);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleContactScroll = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SmoothScroll>
      {/* Session Brutalist Loader */}
      <SessionLoader />

      {/* Flat Custom Cursor */}
      <CustomCursor />
      
      {/* Fixed Gutter STEVE Mascot (deferred after first paint) */}
      {mountedAfterPaint && (
        <Suspense fallback={null}>
          <FixedGutterSteve />
        </Suspense>
      )}
      {isRobotShowcase && (
        <Suspense fallback={null}>
          <RobotShowcase />
        </Suspense>
      )}

      {/* Modern Navigation: SP Logo + Controls + Vertical Section Rail + Fullscreen Menu */}
      <NavigationRail onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Main Page Layout Shell: Full-width fluid container */}
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

        {/* 05. Internship & Apprenticeship (#internship) */}
        <Internship />

        {/* 06. GitHub Activity (#github) */}
        <GitHubActivity profile={profile} repos={repos} />

        {/* 07. Coding Dashboard (#stats) */}
        <CodingDashboard />

        {/* 08. Participated Events & Hackathons (#events) */}
        <Events />

        {/* 09. Learning Journey (#journey) */}
        <Journey />

        {/* 10. Content & Edit Bay (#content) */}
        <Suspense fallback={<div className="min-h-[400px] bg-[#0A1128] text-white flex items-center justify-center font-mono text-xs">LOADING EDIT BAY...</div>}>
          <ContentSection />
        </Suspense>

        {/* 11. Contact Form (#contact) */}
        <Contact />

        {/* Footer (#footer) */}
        <Footer />
      </main>

      {/* Keyboard Shortcut Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onOpen={() => setCommandPaletteOpen(true)}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </SmoothScroll>
  );
}

export default App;
