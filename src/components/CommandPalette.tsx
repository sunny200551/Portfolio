import { CONTACT_INFO } from '../data/contact';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  CornerDownLeft, 
  FileText, 
  Terminal, 
  X, 
  Code, 
  Calendar, 
  User, 
  Briefcase, 
  Award,
  Mail,
  Check,
  Sparkles,
  Moon,
  Sun,
  Power,
  Volume2,
  VolumeX,
  Heart
} from 'lucide-react';
import { robotStore } from '../robot/robotStore';
import { steveVoice } from '../robot/steveVoice';
import { getLenis } from '../lib/lenis';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface CommandItem {
  id: string;
  name: string;
  category: 'Navigation' | 'Actions';
  icon: React.ElementType;
  action: () => void;
  statusBadge?: string;
  isActive?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpen }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [robotState, setRobotState] = useState(() => robotStore.getState());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return robotStore.subscribe(() => {
      setRobotState({ ...robotStore.getState() });
    });
  }, []);
  const dialogRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    onClose();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    steveVoice.speak('copy_email');
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
      onClose();
    }, 1200);
  };

  const commands: CommandItem[] = [
    { id: 'home', name: 'Go to 01 // Home', category: 'Navigation', icon: Compass, action: () => scrollToSection('home') },
    { id: 'about', name: 'Go to 02 // About', category: 'Navigation', icon: User, action: () => scrollToSection('about') },
    { id: 'work', name: 'Go to 03 // Work (Featured Projects)', category: 'Navigation', icon: Briefcase, action: () => scrollToSection('work') },
    { id: 'skills', name: 'Go to 04 // Skills', category: 'Navigation', icon: Code, action: () => scrollToSection('skills') },
    { id: 'github', name: 'Go to 05 // GitHub Commit Skyline', category: 'Navigation', icon: Terminal, action: () => scrollToSection('github') },
    { id: 'stats', name: 'Go to 06 // Coding Stats', category: 'Navigation', icon: Award, action: () => scrollToSection('stats') },
    { id: 'events', name: 'Go to 07 // Events & Hackathons', category: 'Navigation', icon: Calendar, action: () => scrollToSection('events') },
    { id: 'journey', name: 'Go to 08 // Learning Journey', category: 'Navigation', icon: Compass, action: () => scrollToSection('journey') },
    { id: 'contact', name: 'Go to 09 // Contact', category: 'Navigation', icon: User, action: () => scrollToSection('contact') },
    {
      id: 'resume',
      name: 'Open Official Resume (PDF)',
      category: 'Actions',
      icon: FileText,
      action: () => {
        window.open('/Resume.pdf', '_blank');
        onClose();
      }
    },
    {
      id: 'open-github',
      name: 'Open GitHub Profile (sunny200551)',
      category: 'Actions',
      icon: GithubIcon,
      action: () => {
        window.open('https://github.com/sunny200551', '_blank');
        onClose();
      }
    },
        {
      id: 'copy-email',
      name: `Copy Direct Email (${CONTACT_INFO.email})`,
      category: 'Actions',
      icon: Mail,
      action: handleCopyEmail
    },
    {
      id: 'steve-talk',
      name: 'steve: talk (Enable Speech Bubbles)',
      category: 'Actions',
      icon: Volume2,
      statusBadge: !robotState.isQuiet ? 'SELECTED' : 'NOT SELECTED',
      isActive: !robotState.isQuiet,
      action: () => {
        robotStore.setQuiet(false);
        onClose();
      }
    },
    {
      id: 'steve-quiet',
      name: 'steve: quiet (Mute Speech Bubbles)',
      category: 'Actions',
      icon: VolumeX,
      statusBadge: robotState.isQuiet ? 'SELECTED' : 'NOT SELECTED',
      isActive: robotState.isQuiet,
      action: () => {
        robotStore.setQuiet(true);
        onClose();
      }
    },
    {
      id: 'steve-mode-woman',
      name: 'steve: woman visitor persona (She / Her)',
      category: 'Actions',
      icon: Heart,
      statusBadge: robotState.visitorGender === 'woman' ? 'SELECTED' : 'NOT SELECTED',
      isActive: robotState.visitorGender === 'woman',
      action: () => {
        robotStore.setVisitorIdentity(robotState.visitorName, 'woman');
        onClose();
      }
    },
    {
      id: 'steve-mode-man',
      name: 'steve: man visitor persona (He / Him)',
      category: 'Actions',
      icon: Sparkles,
      statusBadge: robotState.visitorGender === 'man' ? 'SELECTED' : 'NOT SELECTED',
      isActive: robotState.visitorGender === 'man',
      action: () => {
        robotStore.setVisitorIdentity(robotState.visitorName, 'man');
        onClose();
      }
    },
    {
      id: 'steve-flirt',
      name: 'steve: flirt (Drop Tech Line)',
      category: 'Actions',
      icon: Heart,
      action: () => {
        robotStore.triggerFlirt();
        onClose();
      }
    },
    {
      id: 'steve-middle',
      name: 'steve: middle (Strut to Center Stage)',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        robotStore.triggerMiddleStrut();
        onClose();
      }
    },
    {
      id: 'steve-showcase',
      name: 'steve: showcase (Open Expressions & Poses Suite)',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        onClose();
        window.open('/?robot-showcase=true', '_self');
      }
    },
    {
      id: 'steve-dance',
      name: 'steve: dance (Dance Party)',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        robotStore.triggerDance();
        onClose();
      }
    },
    {
      id: 'steve-sleep',
      name: 'steve: sleep (Nap Time)',
      category: 'Actions',
      icon: Moon,
      statusBadge: robotState.isIdleSleeping ? 'SELECTED' : 'NOT SELECTED',
      isActive: robotState.isIdleSleeping,
      action: () => {
        robotStore.triggerSleep();
        onClose();
      }
    },
    {
      id: 'steve-wake',
      name: 'steve: wake (Wake Up)',
      category: 'Actions',
      icon: Sun,
      statusBadge: !robotState.isIdleSleeping ? 'SELECTED' : 'NOT SELECTED',
      isActive: !robotState.isIdleSleeping,
      action: () => {
        robotStore.triggerWake();
        onClose();
      }
    },
    {
      id: 'steve-on',
      name: 'steve: on (Enable Mascot)',
      category: 'Actions',
      icon: Check,
      statusBadge: robotState.robotEnabled ? 'SELECTED' : 'NOT SELECTED',
      isActive: robotState.robotEnabled,
      action: () => {
        robotStore.setRobotEnabled(true);
        onClose();
      }
    },
    {
      id: 'steve-off',
      name: 'steve: off (Disable Mascot)',
      category: 'Actions',
      icon: Power,
      statusBadge: !robotState.robotEnabled ? 'SELECTED' : 'NOT SELECTED',
      isActive: !robotState.robotEnabled,
      action: () => {
        robotStore.setRobotEnabled(false);
        onClose();
      }
    }
  ];

  const filtered = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

    // Strict Lenis pause and scroll lock management with guaranteed cleanup
  useEffect(() => {
    if (isOpen) {
      steveVoice.speak('palette_open');
      getLenis()?.stop();
      document.documentElement.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
    } else {
      getLenis()?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
    return () => {
      getLenis()?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Global Ctrl+K trigger and Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose, onOpen]);

  // Focus trap inside the modal dialog while open
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 30);

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      
      const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex="0"]'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 bg-black/60"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] p-0 font-mono relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        {/* Header / Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b-2 border-[#0A0A0A] gap-3 bg-[#EEF2FA]">
          <Terminal size={18} className="text-[#0047AB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to section..."
            className="w-full bg-transparent text-sm text-[#0A0A0A] placeholder-[#0A0A0A]/50 outline-none font-mono"
          />
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 border border-[#0A0A0A]/50 text-[#0A0A0A] hover:bg-[#FF5A1F] hover:border-[#0A0A0A] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Copy Toast Feedback */}
        {copiedEmail && (
          <div className="bg-[#FF5A1F] text-black px-4 py-2 border-b-2 border-[#0A0A0A] font-bold text-xs flex items-center gap-2">
            <Check size={14} />
            {`EMAIL COPIED: ${CONTACT_INFO.email}`}
          </div>
        )}

        {/* Command List */}
        <div data-lenis-prevent="true" style={{ overscrollBehavior: 'contain' }} className="max-h-80 overflow-y-auto p-2 divide-y divide-[#0A0A0A]/10">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#0A0A0A]/60">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#FF5A1F] text-black font-bold'
                      : 'text-[#0A0A0A] hover:bg-[#EEF2FA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isSelected ? 'text-black' : 'text-[#0047AB]'} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold">
                    {item.statusBadge && (
                      <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border-2 border-[#0A0A0A] ${
                        item.isActive
                          ? 'bg-[#00D26A] text-black shadow-[1px_1px_0px_#0A0A0A]'
                          : 'bg-white/80 text-[#0A0A0A]/60'
                      }`}>
                        {item.statusBadge}
                      </span>
                    )}
                    <span className="opacity-75">{item.category}</span>
                    <CornerDownLeft size={11} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Shortcuts Footer */}
        <div className="px-4 py-2.5 border-t-2 border-[#0A0A0A] text-[10px] text-[#0A0A0A]/80 bg-[#EEF2FA] flex items-center justify-between font-bold">
          <div className="flex items-center gap-3">
            <span>↑↓ NAVIGATE</span>
            <span>↵ SELECT</span>
            <span>ESC CLOSE</span>
          </div>
          <span className="text-[#0047AB]">PALETTE ACTIONS</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
