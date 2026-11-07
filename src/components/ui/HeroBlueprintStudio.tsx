import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';

interface HeroBlueprintStudioProps {
  illustrationWidth?: number;
  illustrationHeight?: number;
}

export const HeroBlueprintStudio: React.FC<HeroBlueprintStudioProps> = ({
  illustrationWidth = 840,
  illustrationHeight = 700,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // Detect touch device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Scroll listener for parallax & scroll hint dismissal
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 40 && !hasScrolled) {
        setHasScrolled(true);
      }
      if (containerRef.current && !prefersReducedMotion) {
        // Shift L1 grid with 0.3 speed scroll parallax
        const grid = containerRef.current.querySelector<HTMLElement>('.blueprint-grid');
        if (grid) {
          grid.style.transform = `translateY(${scrollY * 0.28}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled, prefersReducedMotion]);

  // Mouse move inside hero for cursor crosshair and localized tint
  useEffect(() => {
    if (isTouch || prefersReducedMotion) return;

    const hero = document.getElementById('home');
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setCursorPos({ x, y, visible: true });
      } else {
        setCursorPos(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    const handleMouseLeave = () => {
      setCursorPos(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isTouch, prefersReducedMotion]);

  // GSAP animation for floating stickers and blueprint stroke-dashoffset draw-in
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Draw in blueprint lines
      gsap.fromTo(
        '.blueprint-draw-line',
        { strokeDashoffset: 120, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      );

      // Animate floating stickers
      const stickers = gsap.utils.toArray<HTMLElement>('.blueprint-sticker');
      stickers.forEach((el, i) => {
        const depth = 8 + (i % 4) * 5;
        const dur = 2.4 + (i % 3) * 0.6;
        gsap.to(el, {
          y: -depth,
          rotation: (i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 2),
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      data-testid="hero-blueprint-studio"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      {/* ----------------------------------------------------------------- */}
      {/* L1: GRAPH-PAPER GRID (40px cells, 200px major line, radial text mask) */}
      {/* ----------------------------------------------------------------- */}
      <div
        data-testid="blueprint-l1-grid"
        className="blueprint-grid absolute inset-0 w-full h-[140%] -top-[10%]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(10, 26, 63, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 26, 63, 0.06) 1px, transparent 1px),
            linear-gradient(to right, rgba(10, 26, 63, 0.10) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(10, 26, 63, 0.10) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 200px 200px, 200px 200px',
          WebkitMaskImage: 'radial-gradient(circle at 65% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 100%)',
          maskImage: 'radial-gradient(circle at 65% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 100%)',
          willChange: 'transform',
        }}
      />

      {/* ----------------------------------------------------------------- */}
      {/* L2: TILTED STAGE (-2 deg) behind the illustration                  */}
      {/* ----------------------------------------------------------------- */}
      <div 
        data-testid="blueprint-l2-stage"
        className="absolute right-[4%] top-[14%] w-[92%] sm:w-[75%] lg:w-[48%] h-[68%] min-h-[460px] max-h-[720px] rounded-none border-2 border-[#0A0A0A] bg-[#EEF2FA] shadow-[6px_6px_0px_#0A0A0A]"
        style={{
          transform: 'rotate(-2deg)',
          transformOrigin: '50% 50%',
        }}
      >
        {/* Halftone dot pattern in top-right corner */}
        <div 
          className="absolute top-0 right-0 w-44 h-44 overflow-hidden pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#FF5A1F 2px, transparent 2px)',
            backgroundSize: '14px 14px',
            WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, transparent 80%)',
            maskImage: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, transparent 80%)',
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* L3: BLUEPRINT ANNOTATIONS SVG (Corner crops, crosshairs, title block) */}
        {/* --------------------------------------------------------------- */}
        <svg className="absolute inset-0 w-full h-full" fill="none">
          {/* Corner Registration Crosshairs */}
          <g stroke="#0A1A3F" strokeWidth="1.5">
            {/* Top-Left Crop */}
            <path d="M 12 24 L 12 12 L 24 12" className="blueprint-draw-line" strokeDasharray="30" />
            <circle cx="28" cy="28" r="4" fill="none" stroke="#0047AB" strokeWidth="1" />
            
            {/* Top-Right Crop */}
            <path d="M calc(100% - 24px) 12 L calc(100% - 12px) 12 L calc(100% - 12px) 24" className="blueprint-draw-line" strokeDasharray="30" />
            
            {/* Bottom-Left Crop */}
            <path d="M 12 calc(100% - 24px) L 12 calc(100% - 12px) L 24 calc(100% - 12px)" className="blueprint-draw-line" strokeDasharray="30" />
            
            {/* Bottom-Right Crop */}
            <path d="M calc(100% - 24px) calc(100% - 12px) L calc(100% - 12px) calc(100% - 12px) L calc(100% - 12px) calc(100% - 24px)" className="blueprint-draw-line" strokeDasharray="30" />
          </g>

          {/* Dimension Line along Left Edge */}
          <g stroke="#0047AB" strokeWidth="1.2">
            <line x1="22" y1="50" x2="22" y2="calc(100% - 70px)" strokeDasharray="4 3" />
            <line x1="16" y1="50" x2="28" y2="50" />
            <line x1="16" y1="calc(100% - 70px)" x2="28" y2="calc(100% - 70px)" />
            <text
              x="-240"
              y="16"
              transform="rotate(-90)"
              fill="#0047AB"
              fontFamily="monospace"
              fontSize="9"
              fontWeight="bold"
              letterSpacing="0.08em"
            >
              DIM: {illustrationHeight}PX // 8PX GRID
            </text>
          </g>

          {/* Dimension Line along Bottom Edge */}
          <g stroke="#0047AB" strokeWidth="1.2">
            <line x1="50" y1="calc(100% - 48px)" x2="calc(100% - 180px)" y2="calc(100% - 48px)" strokeDasharray="4 3" />
            <line x1="50" y1="calc(100% - 54px)" x2="50" y2="calc(100% - 42px)" />
            <line x1="calc(100% - 180px)" y1="calc(100% - 54px)" x2="calc(100% - 180px)" y2="calc(100% - 42px)" />
            <text
              x="60"
              y="calc(100% - 34px)"
              fill="#0047AB"
              fontFamily="monospace"
              fontSize="9"
              fontWeight="bold"
              letterSpacing="0.08em"
            >
              SPAN: {illustrationWidth}PX
            </text>
          </g>
        </svg>

        {/* Small Drawing Title Block in bottom-right corner of the stage */}
        <div className="hidden sm:flex absolute bottom-3 right-3 border border-[#0A0A0A] bg-white px-2.5 py-1.5 flex-col gap-0.5 shadow-[2px_2px_0px_#0A0A0A] font-mono text-[9px] text-[#0A0A0A]">
          <div className="flex items-center justify-between gap-3 font-bold border-b border-[#0A0A0A]/20 pb-0.5">
            <span className="text-[#0047AB]">SHEET 01 // HERO</span>
            <span>REV 2026</span>
          </div>
          {/* Palette Swatches Strip */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
              <span className="text-[8px] text-[#0A0A0A]/70">#FF5A1F</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A]" />
              <span className="text-[8px] text-[#0A0A0A]/70">#0047AB</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#0A1A3F] border border-[#0A0A0A]" />
              <span className="text-[8px] text-[#0A0A0A]/70">#0A1A3F</span>
            </div>
          </div>
        </div>

        {/* Blueprint Callout Badges on the stage */}
        <div className="hidden lg:flex absolute top-4 left-6 items-center gap-1.5 px-2 py-0.5 bg-white border border-[#0A0A0A] font-mono text-[9px] font-bold text-[#0047AB] shadow-[2px_2px_0px_#0A0A0A]">
          <span className="w-1.5 h-1.5 bg-[#FF5A1F]" />
          <span>STEVE: CHIEF OF VIBES</span>
        </div>

        <div className="hidden lg:flex absolute top-14 right-8 items-center gap-1 px-2 py-0.5 bg-[#0A1A3F] text-white border border-[#0A0A0A] font-mono text-[9px] font-bold shadow-[2px_2px_0px_#FF5A1F]">
          <span>DEPLOYED</span>
          <span className="text-[#00D26A]">✓</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* L4: FLOATING STICKERS (symbols scattered away from text/buttons)    */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Symbol 1: Orange Cube Tag */}
        <div className="blueprint-sticker absolute top-[12%] right-[44%] font-mono text-xs font-bold px-1.5 py-0.5 bg-white text-[#FF5A1F] border border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
          &lt;/&gt;
        </div>
        {/* Symbol 2: Blue Triangle / Brackets */}
        <div className="blueprint-sticker absolute top-[28%] right-[8%] font-mono text-xs font-bold px-1.5 py-0.5 bg-[#0047AB] text-white border border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
          {'{ }'}
        </div>
        {/* Symbol 3: Monospace Hash */}
        <div className="blueprint-sticker absolute top-[76%] right-[38%] font-mono text-xs font-bold w-6 h-6 flex items-center justify-center bg-white text-[#0A1A3F] border border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
          #
        </div>
        {/* Symbol 4: 0x Hex Badge */}
        <div className="blueprint-sticker hidden sm:flex absolute top-[18%] right-[18%] font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FF5A1F] text-black border border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
          0x
        </div>
        {/* Symbol 5: Plus Marker */}
        <div className="blueprint-sticker hidden sm:flex absolute bottom-[22%] right-[14%] font-mono text-xs font-bold w-5 h-5 items-center justify-center bg-[#EEF2FA] text-[#0047AB] border border-[#0A0A0A]">
          +
        </div>
        {/* Symbol 6: Small Solid Orange Square */}
        <div className="blueprint-sticker absolute top-[45%] right-[48%] w-3 h-3 bg-[#FF5A1F] border border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A]" />
        {/* Symbol 7: Small Navy Square */}
        <div className="blueprint-sticker hidden sm:block absolute top-[68%] right-[12%] w-3 h-3 bg-[#0A1A3F] border border-[#0A0A0A]" />
        {/* Symbol 8: Small Blue Triangle */}
        <div className="blueprint-sticker hidden lg:block absolute bottom-[14%] right-[44%] font-mono text-[10px] font-black text-[#0047AB]">
          ▲
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* L5: CURSOR BLUEPRINT CROSSHAIR & LOCALIZED ORANGE TINT             */}
      {/* ----------------------------------------------------------------- */}
      {cursorPos.visible && (
        <div
          data-testid="hero-cursor-crosshair"
          className="absolute pointer-events-none transition-opacity duration-150"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Subtle localized orange tint */}
          <div
            className="w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 90, 31, 0.12) 0%, transparent 70%)',
            }}
          />
          {/* Crosshair Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#0047AB]/40 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#0047AB]/40 -translate-x-1/2" />
          {/* Coordinate Readout */}
          <div className="absolute top-3 left-3 px-1.5 py-0.5 bg-white/95 border border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] font-mono text-[9px] font-bold text-[#0047AB] whitespace-nowrap">
            X {cursorPos.x} / Y {cursorPos.y}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* L6: SCROLL HINT: "SCROLL. STEVE IS ABOUT TO FLY" (disappears on scroll) */}
      {/* ----------------------------------------------------------------- */}
      {!hasScrolled && (
        <div
          data-testid="hero-scroll-hint"
          className="hidden sm:flex absolute bottom-5 right-[16%] lg:right-[22%] items-center gap-2 px-3 py-1.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[10px] font-black uppercase tracking-wider animate-bounce"
        >
          <span>SCROLL. STEVE IS ABOUT TO FLY</span>
          <span className="text-black font-black">↓</span>
        </div>
      )}
    </div>
  );
};
