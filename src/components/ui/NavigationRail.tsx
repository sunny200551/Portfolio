import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, FileText, Terminal } from 'lucide-react';
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
  const [activeLabelVisible, setActiveLabelVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const fillLineRef = useRef<HTMLDivElement>(null);
  const [isMac] = useState(() => typeof window !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));

  // Trigger 1.5s label visibility on activeSection change
  useEffect(() => {
    const showTimer = setTimeout(() => setActiveLabelVisible(true), 0);
    const hideTimer = setTimeout(() => setActiveLabelVisible(false), 1500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [activeSection]);

  // High-performance scroll spy
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;

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

  // Sync with robotStore active section
  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      const storeSection = robotStore.getState().activeSection;
      if (storeSection) {
        setActiveSection(storeSection);
      }
    });
    return () => unsubscribe();
  }, []);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
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
      {/* Floating Top-Left: SP Logo Button Only (no full navbar bar, no name chip) */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => scrollTo('home')}
          className="w-11 h-11 flex items-center justify-center font-display font-black text-xl bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#0047AB] hover:text-white transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FF5A1F]"
          aria-label="SP - Sunny Pasumarthi - Scroll to top"
        >
          SP
        </button>
      </div>

      {/* Floating Top-Right: Square MENU Button Only */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
          className="w-11 h-11 flex items-center justify-center bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EEF2FA] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FF5A1F]"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Fixed Vertical Section Rail on Right Edge (Compact squares <= 40px, visible on >= 1200px) */}
      <nav 
        className="nav-rail fixed right-3 top-1/2 -translate-y-1/2 z-40 w-10 hidden xl:flex flex-col items-center select-none"
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
            const showLabel = (isActive && activeLabelVisible) || isHovered;

            return (
              <div 
                key={sec.id} 
                className="relative flex items-center justify-end"
                onMouseEnter={() => setHoveredSection(sec.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Section Name Pill: visible only for 1.5s on active change OR while hovered */}
                <div
                  className={`absolute right-10 px-2 py-1 font-mono text-[11px] font-bold uppercase whitespace-nowrap transition-all duration-200 pointer-events-none border-2 border-[#0A0A0A] ${
                    showLabel
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-2'
                  } ${
                    isActive
                      ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0px_#FF5A1F]'
                      : 'bg-white text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]'
                  }`}
                >
                  <span className="text-[#FF5A1F] mr-1.5">{sec.num}</span>
                  {sec.label}
                </div>

                {/* Node Button: Compact square */}
                <button
                  onClick={() => scrollTo(sec.id)}
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

      {/* Full-Screen Navigation Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-grayscale-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div className="bg-white border-4 border-[#0A0A0A] shadow-[12px_12px_0px_#FF5A1F] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4 mb-4">
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

            {/* Quick Actions Row: Command Palette + Resume */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCommandPalette();
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold hover:bg-white cursor-pointer transition-all"
              >
                <Terminal size={14} className="text-[#0047AB]" />
                <span>{isMac ? 'COMMAND (⌘K)' : 'PALETTE (CTRL K)'}</span>
              </button>

              <a
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold hover:bg-black hover:text-white cursor-pointer transition-all uppercase"
              >
                <FileText size={14} />
                <span>RESUME PDF</span>
              </a>
            </div>

            {/* Section Link Rows */}
            <div className="flex flex-col divide-y-2 divide-[#0A0A0A]/10 my-auto">
              {NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className="py-2.5 px-2 flex items-center justify-between group hover:bg-[#EEF2FA] transition-colors text-left cursor-pointer"
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
            <div className="mt-6 pt-4 border-t-2 border-[#0A0A0A] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <span className="text-[#0A0A0A]/70">
                SUNNY PASUMARTHI // 2025
              </span>
              <span className="text-[#0047AB] font-bold">
                LIGHT THEME NEO-BRUTALISM
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationRail;
