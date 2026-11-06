const fs = require('fs');
let file = fs.readFileSync('src/components/ui/NavigationRail.tsx', 'utf8');

const target = file.substring(file.indexOf('{/* (A) Fixed Orange Square'), file.indexOf('{/* (D) Full-Screen Navigation Overlay */}'));

const replacement = `{/* (A & B) Top Bar: Solid white background bar with 2px black border, hard offset shadow, auto-hide on scroll down */}
      <header
        className={\`fixed top-0 left-0 right-0 h-16 sm:h-18 bg-white border-b-2 border-[#0A0A0A] shadow-[0_4px_0_#0A0A0A] z-40 transition-transform duration-300 ease-in-out px-4 sm:px-6 flex items-center justify-between \${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }\`}
      >
        {/* Left: SP Logo & Name Chip */}
        <div className="flex items-center">
          <button
            onClick={() => scrollTo('home')}
            className="group flex items-center gap-2.5 p-1 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FF5A1F]"
            aria-label="SP - Sunny Pasumarthi - Scroll to top"
          >
            <span className="w-10 h-10 flex items-center justify-center font-display font-black text-xl bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] group-hover:bg-[#0047AB] group-hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]">
              SP
            </span>
            <span 
              className={\`hidden md:inline-flex items-center font-mono font-bold text-xs uppercase tracking-wider text-[#0A0A0A] bg-white px-2.5 py-1.5 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all duration-200 overflow-hidden whitespace-nowrap \${
                isScrolledPast80
                  ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none p-0 border-0 shadow-none'
                  : 'opacity-100 max-w-[220px] translate-x-0'
              }\`}
            >
              SUNNY PASUMARTHI
            </span>
          </button>
        </div>

        {/* Right: Controls (Resume + Ctrl/Cmd+K + MENU) */}
        <div className="flex items-center gap-2 sm:gap-3">
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
      </header>

      {/* (C) Fixed Vertical Section Rail on Right Edge (Compact squares <= 40px, hidden below 1200px) */}
      <nav 
        className="hidden min-[1200px]:flex fixed right-3 top-1/2 -translate-y-1/2 z-40 w-10 flex-col items-center select-none"
        aria-label="Section Navigation"
      >
        {/* Background track line */}
        <div className="absolute top-2 bottom-2 w-[2px] bg-[#0A0A0A]/20 -z-10" />

        {/* Scroll fill line */}
        <div 
          className="absolute top-2 w-[2px] bg-[#FF5A1F] -z-10 transition-all duration-100 ease-out"
          style={{ height: \`\${(scrollProgress / 100) * (NAV_SECTIONS.length - 1) * 38}px\` }}
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
                  className={\`absolute right-10 px-2 py-1 font-mono text-[11px] font-bold uppercase whitespace-nowrap transition-all duration-200 pointer-events-none border-2 border-[#0A0A0A] \${
                    showLabel
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-2'
                  } \${
                    isActive
                      ? 'bg-[#0A0A0A] text-white shadow-[2px_2px_0px_#FF5A1F]'
                      : 'bg-white text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]'
                  }\`}
                >
                  <span className="text-[#FF5A1F] mr-1.5">{sec.num}</span>
                  {sec.label}
                </div>

                {/* Node Button: Compact square (28x28 <= 40px) */}
                <button
                  onClick={() => scrollTo(sec.id)}
                  aria-label={\`Jump to section \${sec.num} \${sec.label}\`}
                  className={\`w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold border-2 border-[#0A0A0A] transition-all cursor-pointer \${
                    isActive
                      ? 'bg-[#FF5A1F] text-black shadow-[2px_2px_0px_#0A0A0A] scale-105 ring-2 ring-[#0A0A0A]'
                      : 'bg-white text-[#0A0A0A]/80 hover:bg-[#EEF2FA] hover:text-[#0A0A0A] hover:scale-105 shadow-[1px_1px_0px_#0A0A0A]'
                  }\`}
                >
                  {sec.num}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      `;

file = file.replace(target, replacement);
fs.writeFileSync('src/components/ui/NavigationRail.tsx', file, 'utf8');
console.log('NavigationRail successfully updated!');
