import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Terminal, CornerDownLeft, FileText, Sparkles } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands
  const commands = [
    { id: 'hero', name: 'Go to Home / Hero', category: 'Navigation', icon: Compass, action: () => scrollToSection('hero') },
    { id: 'about', name: 'Go to About Me', category: 'Navigation', icon: Compass, action: () => scrollToSection('about') },
    { id: 'skills', name: 'Go to Skills System', category: 'Navigation', icon: Compass, action: () => scrollToSection('skills') },
    { id: 'projects', name: 'Go to Projects Showcase', category: 'Navigation', icon: Compass, action: () => scrollToSection('projects') },
    { id: 'journey', name: 'Go to Learning Journey', category: 'Navigation', icon: Compass, action: () => scrollToSection('journey') },
    { id: 'focus', name: 'Go to Current Focus', category: 'Navigation', icon: Compass, action: () => scrollToSection('focus') },
    { id: 'github', name: 'Go to GitHub Activity', category: 'Navigation', icon: Compass, action: () => scrollToSection('github') },
    { id: 'contact', name: 'Go to Contact Form', category: 'Navigation', icon: Compass, action: () => scrollToSection('contact') },
    { 
      id: 'resume', 
      name: 'Download Resume (PDF)', 
      category: 'Actions', 
      icon: FileText, 
      action: () => {
        window.open('Resume.pdf', '_blank');
        setIsOpen(false);
      } 
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      setSearch('');
    }
  }, [isOpen]);

  // Handle arrows and Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <>
      {/* Floating button to trigger Command Palette visually */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-violet-600/90 text-white rounded-full shadow-lg cursor-pointer hover:bg-violet-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium border border-violet-400/20 backdrop-blur-md"
        title="Open Command Palette (Ctrl+K)"
      >
        <Terminal size={16} />
        <span className="hidden sm:inline">Ctrl + K</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl glassmorphism rounded-2xl shadow-2xl border border-white/12 overflow-hidden flex flex-col"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                <Search size={18} className="text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 text-base"
                />
                <div className="flex items-center gap-1 text-[10px] bg-white/10 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5">
                  ESC
                </div>
              </div>

              {/* Command List */}
              <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-violet-600/20 text-violet-300 border-l-2 border-violet-500 pl-4.5' 
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isSelected ? 'text-violet-400' : 'text-zinc-500'} />
                          <div>
                            <span className="text-sm font-medium">{cmd.name}</span>
                            <span className="text-[10px] ml-2 text-zinc-500 font-mono">[{cmd.category}]</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] opacity-75 font-mono">
                            <span>Select</span>
                            <CornerDownLeft size={10} />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-500 flex flex-col items-center gap-2">
                    <Sparkles size={20} className="text-violet-400/50 animate-pulse" />
                    <span>No results found for "{search}"</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>↑↓ Navigate</span>
                  <span className="mx-1">•</span>
                  <span>Enter to Select</span>
                </div>
                <span>Quick Actions Palette</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default CommandPalette;
