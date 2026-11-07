import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, FileText, Terminal } from 'lucide-react';
import { robotStore } from '../../robot/robotStore';
import { steveVoice } from '../../robot/steveVoice';

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
  const [isScrolledPast80, setIsScrolledPast80] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const fillLineRef = useRef<HTMLDivElement>(null);
  const [isMac] = useState(() => typeof window !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));

  // Reliable, high-performance scroll spy
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const past80 = scrollY > 80;
        setIsScrolledPast80((prev) => (prev !== past80 ? past80 : prev));

        // Auto-hide navbar on scroll down, show on scroll up, always show at hero (< 120px)
        if (scrollY <= 120) {
          setHeaderVisible(true);
        } else if (scrollY > lastScrollY.current + 8) {
          setHeaderVisible(false); // scrolling down
        } else if (scrollY < lastScrollY.current - 8) {
          setHeaderVisible(true); // scrolling up
        }
        lastScrollY.current = scrollY;

        // Direct DOM update for scroll line height to avoid component re-renders
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100)) : 0;
        if (fillLineRef.current) {
          fillLineRef.current.style.height = `${(progress / 100) * (NAV_SECTIONS.length - 1) * 38}px`;
        }

        // Force HOME active when near the top of the viewport
        if (scrollY < 180) {
          setActiveSection((prev) => {
            if (prev !== 'home') {
              robotStore.setActiveSection('home');
              return 'home';
            }
            return prev;
          });
          return;
        }

        // Check sections from bottom to top
        const triggerY = window.innerHeight * 0.35;
        for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
          const item = NAV_SECTIONS[i];
          const el = document.getElementById(item.id);
          if (el) {
            const top = el.offsetTop - scrollY;
            const bottom = top + el.offsetHeight;
            if (top <= triggerY && bottom > 0) {
              setActiveSection((prev) => {
                if (prev !== item.id) {
                  robotStore.setActiveSection(item.id);
                  return item.id;
                }
                return prev;
              });
              return;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
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
      {/* Floating Header Controls: NO solid bar, NO background strip, NO bottom border. Floating pieces only. */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none p-4 sm:p-6 flex items-center justify-between transition-opacity duration-300 ease-in-out ${
          headerVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left: SP Logo & Name Chip */}
        <div className="flex items-center pointer-events-auto">
          <button
            onClick={() => scrollTo('home')}
            className="group flex items-center gap-2.5 p-1 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FF5A1F]"
            aria-label="SP - Sunny Pasumarthi - Scroll to top"
          >
            <span className="w-10 h-10 flex items-center justify-center font-display font-black text-xl bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] group-hover:bg-[#0047AB] group-hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]">
              SP
            </span>
            <span 
              className={`hidden md:inline-flex items-center font-mono font-bold text-xs uppercase tracking-wider text-[#0A0A0A] bg-white px-2.5 py-1.5 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all duration-200 overflow-hidden whitespace-nowrap ${
                isScrolledPast80
                  ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none p-0 border-0 shadow-none'
                  : 'opacity-100 max-w-[220px] translate-x-0'
              }`}
            >
              SUNNY PASUMARTHI
            </span>
          </button>
        </div>

        {/* Right: Controls (Resume + Ctrl/Cmd+K + MENU) */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono font-bold text-xs hover:bg-[#EEF2FA] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
            aria-label={isMac ? "Open Command Palette (⌘K)" : "Open Command Palette (Ctrl+K)"}
            title={isMac ? "Command Palette (⌘K)" : "Command Palette (Ctrl+K)"}
          >
            <Terminal size={14} className="text-[#0047AB]" />
            {isMac ? (
              <span className="flex items-center gap-1 font-bold">
                <span>CMD</span>
                <kbd className="px-1.5 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] text-[10px] flex items-center gap-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                  </svg>
                  <span>K</span>
                </kbd>
              </span>
            ) : (
              <span className="flex items-center gap-1 font-bold">
                <span>CTRL K</span>
              </span>
            )}
          </button>

          {/* Small Orange Resume Button */}
          <a
            href="/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono font-bold text-xs uppercase hover:bg-black hover:text-white transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
            title="Download Resume PDF"
          >
            <FileText size={14} />
            <span className="hidden xs:inline">RESUME</span>
          </a>

          {/* Square MENU Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
            className="w-10 h-10 flex items-center justify-center bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EEF2FA] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* (C) Fixed Vertical Section Rail on Right Edge (Compact squares <= 40px, hidden below 1200px, fades in Work section) */}
      <nav 
        className={`nav-rail fixed right-3 top-1/2 -translate-y-1/2 z-40 w-10 flex-col items-center select-none transition-opacity duration-300 ${
          menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Section Navigation"
      >
        {/* Background track line */}
        <div className="absolute top-2 bottom-2 w-[2px] bg-[#0A0A0A]/20 -z-10" />

        {/* Scroll fill line */}
        <div 
          ref={fillLineRef}
          className="absolute top-2 w-[2px] bg-[#FF5A1F] -z-10 transition-all duration-75 ease-out"
          style={{ height: '0px' }}
        />

        {/* 9 Compact Numbered Node Squares */}
        <div className="flex flex-col gap-2.5 items-center">
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const isHovered = hoveredSection === sec.id;

            return (
              <div 
                key={sec.id} 
                className="relative flex items-center justify-end"
                onMouseEnter={() => {
                  setHoveredSection(sec.id);
                  steveVoice.speak('rail_hover');
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('rail:hover', { detail: { hovered: true, section: sec.id } }));
                  }
                }}
                onMouseLeave={() => {
                  setHoveredSection(null);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('rail:hover', { detail: { hovered: false, section: null } }));
                  }
                }}
              >
                {/* Section Name Tooltip: visible ONLY while directly hovered or focused */}
                <div
                  className={`absolute right-9 px-2 py-0.5 font-mono text-[10px] font-bold uppercase whitespace-nowrap transition-all duration-150 pointer-events-none border border-[#0A0A0A] ${
                    isHovered
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-2'
                  } ${
                    isActive
                      ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0px_#FF5A1F]'
                      : 'bg-white text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]'
                  }`}
                >
                  <span className="text-[#FF5A1F] mr-1">{sec.num}</span>
                  {sec.label}
                </div>

                {/* Node Button: Compact square (28x28 <= 40px) */}
                <button
                  onClick={() => scrollTo(sec.id)}
                  onFocus={() => setHoveredSection(sec.id)}
                  onBlur={() => setHoveredSection(null)}
                  aria-label={`Jump to section ${sec.num} ${sec.label}`}
                  className={`w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5A1F] text-black shadow-[2px_2px_0px_#0A0A0A] scale-105 ring-2 ring-[#0A0A0A]'
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

      {/* (D) Full-Screen Navigation Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-grayscale-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div className="bg-white border-4 border-[#0A0A0A] shadow-[12px_12px_0px_#FF5A1F] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FF5A1F] text-black font-display font-black text-sm border border-[#0A0A0A]">
                  MENU
                </span>
                <span className="font-mono text-xs font-bold text-[#0A0A0A]/70 uppercase">
                  9 SECTIONS
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] hover:bg-[#FF5A1F] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Section Link Rows */}
            <div className="flex flex-col divide-y-2 divide-[#0A0A0A]/10 my-auto">
              {NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className="py-3 px-2 flex items-center justify-between group hover:bg-[#EEF2FA] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-[#FF5A1F] group-hover:text-[#0047AB]">
                      {sec.num}
                    </span>
                    <span className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A] group-hover:translate-x-1 transition-transform">
                      {sec.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[#0047AB]">
                    GO →
                  </span>
                </button>
              ))}
            </div>

            {/* Overlay Footer */}
            <div className="mt-8 pt-6 border-t-2 border-[#0A0A0A] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <span className="text-[#0A0A0A]/70">
                SUNNY PASUMARTHI // 2025
              </span>
              <a
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#0047AB] text-white font-bold border-2 border-[#0A0A0A] hover:bg-[#0A1A3F] transition-colors flex items-center gap-1.5"
              >
                <span>OFFICIAL RESUME</span>
                <FileText size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
