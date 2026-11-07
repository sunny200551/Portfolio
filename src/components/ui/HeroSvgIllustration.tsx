import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { robotStore } from '../../robot/robotStore';

export const HeroSvgIllustration: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<SVGGElement>(null);

  // Measure and publish #steve-anchor viewport coordinates
  useEffect(() => {
    const updateAnchor = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 || rect.x > 0) {
        robotStore.setHomePlatformPos(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    };

    updateAnchor();
    const ro = new ResizeObserver(updateAnchor);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateAnchor, { passive: true });
    window.addEventListener('scroll', updateAnchor, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor);
    };
  }, []);

  // GSAP animations for SVG elements
  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // 1. Staggered intro entrance
      gsap.fromTo(
        '#hero-platform-slab',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
      );

      gsap.fromTo(
        ['#hero-browser-panel', '#hero-code-panel'],
        { scale: 0.85, opacity: 0, transformOrigin: '50% 100%' },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.25, ease: 'back.out(1.5)' }
      );

      gsap.fromTo(
        ['#hero-cube-orange', '#hero-cube-navy', '#hero-stickers'],
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.5, ease: 'bounce.out' }
      );

      // 2. Animated looping progress bar on blue browser panel
      gsap.to('#browser-progress-bar', {
        width: 170,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // 3. Typing animation loop on code lines
      const codeLines = ['#code-line-1', '#code-line-2', '#code-line-3', '#code-line-4', '#code-line-5'];
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
      codeLines.forEach((id, i) => {
        tl.fromTo(
          id,
          { scaleX: 0, opacity: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, opacity: 1, duration: 0.35, ease: 'power1.out' },
          i * 0.25
        );
      });
      tl.to({}, { duration: 1.5 }); // hold full code
      tl.to(codeLines, { opacity: 0.2, duration: 0.4, stagger: 0.05 });

      // Blinking cursor
      gsap.to('#code-cursor', {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      });

      // 4. Floating cubes & attached shadows
      gsap.to('#hero-cube-orange', {
        y: -12,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('#cube-orange-shadow', {
        scale: 0.88,
        transformOrigin: '50% 50%',
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('#hero-cube-navy', {
        y: -10,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      });
      gsap.to('#cube-navy-shadow', {
        scale: 0.90,
        transformOrigin: '50% 50%',
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      });

      // 5. Subtle cursor parallax (up to 4 degrees equivalent)
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 2;
        const normY = (e.clientY / innerHeight - 0.5) * 2;

        gsap.to('#hero-parallax-bg', {
          x: normX * 8,
          y: normY * 6,
          duration: 0.8,
          ease: 'power2.out',
        });
        gsap.to('#hero-parallax-fg', {
          x: normX * -10,
          y: normY * -8,
          duration: 0.8,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none pointer-events-auto"
      style={{ overflow: 'visible' }}
    >
      <svg
        viewBox="0 0 800 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-[640px] drop-shadow-sm"
        style={{ overflow: 'visible' }}
        aria-label="Neo-Brutalist Isometric Developer Workspace Illustration"
      >
        <defs>
          <filter id="hard-shadow" x="-5%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="6" dy="6" stdDeviation="0" floodColor="#0A0A0A" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* PARALLAX BACKGROUND LAYER (Panels & Wall)                     */}
        {/* ------------------------------------------------------------- */}
        <g id="hero-parallax-bg">
          {/* Floor ground contact shadow for the entire platform */}
          <polygon
            points="140,500 400,630 660,500 680,515 400,650 120,515"
            fill="#0A0A0A"
            opacity="0.9"
          />

          {/* 1. BACK-LEFT: Blue Browser Window Panel */}
          <g id="hero-browser-panel">
            {/* Hard shadow */}
            <rect x="188" y="168" width="260" height="230" fill="#0A0A0A" />

            {/* Window Container */}
            <rect
              x="180"
              y="160"
              width="260"
              height="230"
              fill="#0047AB"
              stroke="#0A0A0A"
              strokeWidth="3.5"
            />

            {/* Window Top Bar in Crisp Cream/Grey */}
            <rect
              x="180"
              y="160"
              width="260"
              height="34"
              fill="#EEF2FA"
              stroke="#0A0A0A"
              strokeWidth="3.5"
            />

            {/* Window Control Dots */}
            <circle cx="200" cy="177" r="5" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
            <circle cx="216" cy="177" r="5" fill="#FFD700" stroke="#0A0A0A" strokeWidth="1.5" />
            <circle cx="232" cy="177" r="5" fill="#00D26A" stroke="#0A0A0A" strokeWidth="1.5" />

            {/* Window URL pill */}
            <rect x="250" y="169" width="160" height="16" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
            <text x="258" y="181" fill="#0A0A0A" fontFamily="monospace" fontSize="8" fontWeight="bold">
              sunnypasumarthi.dev
            </text>

            {/* Inner Content Area */}
            <rect x="200" y="210" width="220" height="40" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
            <text x="212" y="234" fill="#FFFFFF" fontFamily="monospace" fontSize="12" fontWeight="bold">
              &gt; STATUS: DEPLOYED
            </text>

            {/* Animated Orange Progress Bar */}
            <rect x="200" y="270" width="220" height="18" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <rect
              id="browser-progress-bar"
              x="200"
              y="270"
              width="90"
              height="18"
              fill="#FF5A1F"
              stroke="#0A0A0A"
              strokeWidth="2"
            />

            {/* Content blocks */}
            <rect x="200" y="306" width="100" height="12" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
            <rect x="312" y="306" width="108" height="12" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
            <rect x="200" y="326" width="220" height="48" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <text x="210" y="354" fill="#0A0A0A" fontFamily="monospace" fontSize="11" fontWeight="bold">
              REACT 19 • THREE.JS • WEB3
            </text>
          </g>

          {/* 2. BACK-RIGHT: Navy Code Editor Panel */}
          <g id="hero-code-panel">
            {/* Hard shadow */}
            <rect x="428" y="188" width="240" height="250" fill="#0A0A0A" />

            {/* Panel Container */}
            <rect
              x="420"
              y="180"
              width="240"
              height="250"
              fill="#0A1A3F"
              stroke="#0A0A0A"
              strokeWidth="3.5"
            />

            {/* Tab Bar Header */}
            <rect
              x="420"
              y="180"
              width="240"
              height="32"
              fill="#1E293B"
              stroke="#0A0A0A"
              strokeWidth="3.5"
            />
            {/* Active Tab */}
            <rect x="426" y="186" width="76" height="26" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="1.5" />
            <text x="434" y="202" fill="#FFFFFF" fontFamily="monospace" fontSize="9" fontWeight="bold">
              Steve.tsx
            </text>
            {/* Inactive Tab */}
            <rect x="506" y="188" width="76" height="24" fill="#334155" stroke="#0A0A0A" strokeWidth="1.5" />
            <text x="514" y="202" fill="#94A3B8" fontFamily="monospace" fontSize="9">
              App.tsx
            </text>

            {/* Code Lines with looping typing animation */}
            <g transform="translate(436, 230)">
              {/* Line 1: const steve = createMascot({ */}
              <rect id="code-line-1" x="0" y="0" width="180" height="9" fill="#FF5A1F" />
              {/* Line 2:   name: 'STEVE', */}
              <rect id="code-line-2" x="14" y="18" width="130" height="9" fill="#60A5FA" />
              {/* Line 3:   status: 'ONLINE', */}
              <rect id="code-line-3" x="14" y="36" width="150" height="9" fill="#34D399" />
              {/* Line 4:   skills: ['React', 'TS'], */}
              <rect id="code-line-4" x="14" y="54" width="165" height="9" fill="#F472B6" />
              {/* Line 5: }); */}
              <rect id="code-line-5" x="0" y="72" width="40" height="9" fill="#FBBF24" />

              {/* Blinking block cursor */}
              <rect id="code-cursor" x="48" y="72" width="8" height="11" fill="#FF5A1F" />

              {/* Mini console readout at bottom */}
              <rect x="0" y="106" width="208" height="64" fill="#020617" stroke="#0A0A0A" strokeWidth="2" />
              <text x="8" y="124" fill="#34D399" fontFamily="monospace" fontSize="9" fontWeight="bold">
                ✓ BUILD: SUCCESS (0 errors)
              </text>
              <text x="8" y="142" fill="#60A5FA" fontFamily="monospace" fontSize="8">
                &gt; Mascot rig: STEVE initialized
              </text>
              <text x="8" y="158" fill="#FBBF24" fontFamily="monospace" fontSize="8">
                &gt; FPS: 60 • Zero clipping
              </text>
            </g>
          </g>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* FOREGROUND LAYER (Platform, Cubes, Stickers & Steve Anchor)  */}
        {/* ------------------------------------------------------------- */}
        <g id="hero-parallax-fg">
          {/* 3. ISOMETRIC PLATFORM SLAB */}
          <g id="hero-platform-slab">
            {/* Front-Left Face of Slab */}
            <polygon
              points="120,480 400,600 400,640 120,520"
              fill="#CBD5E1"
              stroke="#0A0A0A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Front-Right Face of Slab */}
            <polygon
              points="400,600 680,480 680,520 400,640"
              fill="#94A3B8"
              stroke="#0A0A0A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* ORANGE ACCENT STRIPE along front top edges */}
            <polygon
              points="120,480 400,600 400,612 120,492"
              fill="#FF5A1F"
              stroke="#0A0A0A"
              strokeWidth="2.5"
            />
            <polygon
              points="400,600 680,480 680,492 400,612"
              fill="#FF5A1F"
              stroke="#0A0A0A"
              strokeWidth="2.5"
            />

            {/* TOP FLOOR RHOMBUS */}
            <polygon
              points="400,360 680,480 400,600 120,480"
              fill="#EEF2FA"
              stroke="#0A0A0A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Subtle isometric grid lines on top floor for neo-brutalist tech aesthetics */}
            <line x1="260" y1="420" x2="540" y2="540" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <line x1="330" y1="390" x2="610" y2="510" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <line x1="540" y1="420" x2="260" y2="540" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <line x1="470" y1="390" x2="190" y2="510" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
          </g>

          {/* 4. FLOATING ORANGE CUBE (Top-Left) */}
          <g id="hero-cube-orange-wrapper">
            {/* Attached floor shadow polygon directly under the orange cube */}
            <polygon
              id="cube-orange-shadow"
              points="180,470 215,485 180,500 145,485"
              fill="#0A0A0A"
              opacity="0.8"
            />
            {/* Floating Orange Cube */}
            <g id="hero-cube-orange">
              {/* Top Face */}
              <polygon points="180,310 215,325 180,340 145,325" fill="#FF7A45" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Left Face */}
              <polygon points="145,325 180,340 180,380 145,365" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Right Face */}
              <polygon points="180,340 215,325 215,365 180,380" fill="#E04812" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          </g>

          {/* 5. FLOATING NAVY CUBE (Front-Right) */}
          <g id="hero-cube-navy-wrapper">
            {/* Attached floor shadow polygon directly under the navy cube */}
            <polygon
              id="cube-navy-shadow"
              points="580,510 615,525 580,540 545,525"
              fill="#0A0A0A"
              opacity="0.8"
            />
            {/* Floating Navy Cube */}
            <g id="hero-cube-navy">
              {/* Top Face */}
              <polygon points="580,430 615,445 580,460 545,445" fill="#0047AB" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Left Face */}
              <polygon points="545,445 580,460 580,495 545,480" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Right Face */}
              <polygon points="580,460 615,445 615,480 580,495" fill="#050C1A" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          </g>

          {/* 6. FLAT STICKER ACCENTS */}
          <g id="hero-stickers">
            {/* Sticker 1: Orange "V2.0" Pill Badge */}
            <g transform="translate(145, 415)">
              <rect x="3" y="3" width="56" height="22" fill="#0A0A0A" />
              <rect x="0" y="0" width="56" height="22" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
              <text x="12" y="15" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold">
                V2.0
              </text>
            </g>

            {/* Sticker 2: White "</>" Code Chip */}
            <g transform="translate(615, 380)">
              <rect x="3" y="3" width="50" height="24" fill="#0A0A0A" />
              <rect x="0" y="0" width="50" height="24" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
              <text x="11" y="16" fill="#0047AB" fontFamily="monospace" fontSize="12" fontWeight="bold">
                &lt;/&gt;
              </text>
            </g>

            {/* Sticker 3: Green Check Badge */}
            <g transform="translate(290, 470)">
              <circle cx="16" cy="16" r="14" fill="#0A0A0A" />
              <circle cx="13" cy="13" r="14" fill="#00D26A" stroke="#0A0A0A" strokeWidth="2" />
              <path d="M8 13 L12 17 L19 9" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>

          {/* 7. STEVE'S ANCHOR POINT */}
          {/* Exact front-center floor coordinates on the isometric slab where Steve stands */}
          <g id="steve-anchor" ref={anchorRef} transform="translate(400, 520)">
            {/* Completely invisible point marker measured by ResizeObserver for Steve overlay placement */}
            <circle cx="0" cy="0" r="2" fill="none" opacity="0" pointerEvents="none" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default HeroSvgIllustration;
