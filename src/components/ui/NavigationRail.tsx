import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, Terminal, ArrowUpRight } from 'lucide-react';
import { robotStore } from '../../robot/robotStore';

interface NavigationRailProps {
  onOpenCommandPalette: () => void;
}

export interface NavSection {
  id: string;
  num: string;
  label: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'home', num: '01', label: 'HOME' },
  { id: 'about', num: '02', label: 'ABOUT' },
  { id: 'work', num: '03', label: 'WORK' },
  { id: 'skills', num: '04', label: 'SKILLS' },
  { id: 'github', num: '05', label: 'GITHUB' },
  { id: 'stats', num: '06', label: 'STATS' },
  { id: 'events', num: '07', label: 'EVENTS' },
  { id: 'journey', num: '08', label: 'JOURNEY' },
  { id: 'contact', num: '09', label: 'CONTACT' },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({ onOpenCommandPalette }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Reliable scroll spy using getBoundingClientRect()
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100)) : 0;
      setScrollProgress(progress);

      // Force HOME active when near the top of the viewport
      if (scrollY < 180) {
        setActiveSection('home');
        robotStore.setActiveSection('home');
        return;
      }

      // Check sections from bottom to top
      const triggerY = window.innerHeight * 0.35;
      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const item = NAV_SECTIONS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom > 0) {
            setActiveSection(item.id);
            robotStore.setActiveSection(item.id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Handle ESC key to close full-screen menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* (A) Fixed Orange Square "SP" Logo Top-Left */}
      <div className="fixed top-5 left-5 sm:top-6 sm:left-6 z-40">
        <button
          onClick={() => scrollTo('home')}
          className="group flex items-center gap-2.5 p-1 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FF5A1F]"
          aria-label="Sunny Pasumarthi - Scroll to top"
        >
          <span className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center font-display font-black text-xl sm:text-2xl bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] group-hover:bg-[#0047AB] group-hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0A0A0A]">
            SP
          </span>
          <span className="hidden md:inline font-mono font-bold text-xs uppercase tracking-wider text-[#0A0A0A] bg-white px-2 py-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
            SUNNY PASUMARTHI
          </span>
        </button>
      </div>

      {/* (B) Fixed Top-Right Controls: Resume + Ctrl+K + MENU */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono font-bold text-xs hover:bg-[#EEF2FA] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
          aria-label="Open Command Palette"
          title="Command Palette (Ctrl+K)"
        >
          <Terminal size={14} className="text-[#0047AB]" />
          <span>CMD</span>
          <kbd className="px-1.5 py-0.2 bg-[#EEF2FA] border border-[#0A0A0A] text-[10px]">⌘K</kbd>
        </button>

        {/* Small Orange Resume Button */}
        <a
          href="Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono font-bold text-xs uppercase hover:bg-black hover:text-white transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
          title="Download Resume (PDF)"
        >
          <FileText size={14} />
          <span className="hidden xs:inline">RESUME</span>
        </a>

        {/* Square MENU Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EEF2FA] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* (C) Fixed Vertical Section Rail on Right Edge (Desktop only) */}
      <nav 
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none"
        aria-label="Section Navigation"
      >
        {/* Background track line */}
        <div className="absolute top-3 bottom-3 w-[2px] bg-[#0A0A0A]/20 -z-10" />

        {/* Scroll fill line */}
        <div 
          className="absolute top-3 w-[2px] bg-[#FF5A1F] -z-10 transition-all duration-100 ease-out"
          style={{ height: `${(scrollProgress / 100) * (NAV_SECTIONS.length - 1) * 44}px` }}
        />

        {/* 10 Numbered Nodes */}
        <div className="flex flex-col gap-4">
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <div key={sec.id} className="relative flex items-center justify-end group">
                {/* Active or Hovered Section Name Pill (always visible when active, on hover when inactive) */}
                <div
                  className={`absolute right-9 px-2.5 py-1 font-mono text-xs font-bold uppercase whitespace-nowrap transition-all duration-150 pointer-events-none border-2 border-[#0A0A0A] ${
                    isActive
                      ? 'opacity-100 translate-x-0 bg-[#0A0A0A] text-white shadow-[2px_2px_0px_#FF5A1F]'
                      : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]'
                  }`}
                >
                  <span className="text-[#FF5A1F] mr-1.5">{sec.num}</span>
                  {sec.label}
                </div>

                {/* Node Button */}
                <button
                  onClick={() => scrollTo(sec.id)}
                  aria-label={`Jump to section ${sec.num} ${sec.label}`}
                  className={`w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5A1F] text-black shadow-[3px_3px_0px_#0A0A0A] scale-110 ring-2 ring-[#0A0A0A]'
                      : 'bg-white text-[#0A0A0A]/80 hover:bg-[#EEF2FA] hover:text-[#0A0A0A] hover:scale-105 shadow-[1px_1px_0px_#0A0A0A]'
                  }`}
                >
                  {sec.num}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* (D) Full-Screen Modal Menu with Giant Staggered Section Names */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-white text-[#0A0A0A] flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Menu"
        >
          {/* Menu Top Bar */}
          <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center font-display font-black text-xl bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                SP
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                SUNNY PASUMARTHI // DIRECTORY
              </span>
            </div>

            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Giant Section Links (01 to 10) */}
          <div className="py-8 my-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
              {NAV_SECTIONS.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className="group flex items-center gap-4 py-2 sm:py-3 text-left transition-all cursor-pointer border-b border-[#0A0A0A]/10 hover:border-[#0A0A0A]"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="font-mono text-sm sm:text-base font-bold text-[#FF5A1F] group-hover:text-[#0047AB] transition-colors">
                    {sec.num}
                  </span>
                  <span className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#0A0A0A] group-hover:translate-x-2 group-hover:text-[#0047AB] transition-transform">
                    {sec.label}
                  </span>
                  <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 text-[#0047AB] transition-opacity ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Menu Bottom Bar: Resume, Command Palette, Socials */}
          <div className="pt-6 border-t-2 border-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs font-bold">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-black hover:text-white transition-colors"
              >
                <FileText size={14} />
                <span>OFFICIAL RESUME (PDF)</span>
              </a>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCommandPalette();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-white transition-colors cursor-pointer"
              >
                <Terminal size={14} className="text-[#0047AB]" />
                <span>COMMAND PALETTE (CTRL+K)</span>
              </button>
            </div>

            <div className="text-[#0A0A0A]/70 text-[11px]">
              Computer Science Student | Frontend Developer | Blockchain Enthusiast
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationRail;
