import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { steveState, type SteveState } from '../../lib/steveState';

/**
 * =========================================================================
 * HERO NEO-BRUTALIST DEVELOPER WORKSPACE SCENE
 * Objects:
 *  1. The Chair: Squarely aligned (0-5 deg), snapped to floor grid, contact shadow.
 *  2. The Desk & Screens: Browser window & code editor with live typing animation.
 *  3. Seated Steve: Pelvis on seat, hands on keyboard, animated idle loop (typing/relaxing).
 *  4. The Rocket & Launch Pad: Model rocket on pad, cel flame (idle pilot vs ignite).
 *  5. The "BRB" Sign: Flips up when Steve launches to dock, flips down on return.
 * =========================================================================
 */

export const HeroSvgIllustration: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSteveState, setCurrentSteveState] = useState<SteveState>(() => steveState.getState());
  const [returnBubbleVisible, setReturnBubbleVisible] = useState(false);

  // Subscribe to steveState
  useEffect(() => {
    const unsub = steveState.subscribe((state) => {
      setCurrentSteveState(state);
      if (state === 'RETURNING') {
        setTimeout(() => {
          setReturnBubbleVisible(true);
          setTimeout(() => setReturnBubbleVisible(false), 2000);
        }, 1200);
      }
    });
    return unsub;
  }, []);

  // GSAP animations for screens, chair swivel, and seated Steve typing loop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation (platform and screens)
      gsap.fromTo(
        '#hero-platform-slab',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo(
        ['#hero-browser-panel', '#hero-code-panel'],
        { scale: 0.9, opacity: 0, transformOrigin: '50% 100%' },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.12, delay: 0.2, ease: 'back.out(1.4)' }
      );

      // 2. Browser Progress Bar Looping animation
      gsap.to('#browser-progress-bar', {
        width: 180,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // 3. Code Editor typing animation loop
      const codeLines = ['#code-line-1', '#code-line-2', '#code-line-3', '#code-line-4', '#code-line-5'];
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
      codeLines.forEach((id, i) => {
        tl.fromTo(
          id,
          { scaleX: 0, opacity: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, opacity: 1, duration: 0.3, ease: 'power1.out' },
          i * 0.22
        );
      });
      tl.to({}, { duration: 1.5 });
      tl.to(codeLines, { opacity: 0.25, duration: 0.35, stagger: 0.04 });

      // Code cursor blinking
      gsap.to('#code-cursor', {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      });

      // 4. Seated Steve Typing / Lean-back Idle Loop
      // Alternate typing hands (2s) -> lean back relaxing (3.5s) -> glance & blink -> small chair swivel (+-4 deg)
      const steveTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      
      // Typing phase (hands alternating up and down)
      steveTl.to('#steve-hand-left', { y: -3, duration: 0.18, repeat: 7, yoyo: true, ease: 'power1.inOut' }, 0);
      steveTl.to('#steve-hand-right', { y: 3, duration: 0.18, repeat: 7, yoyo: true, ease: 'power1.inOut' }, 0.09);
      
      // Slight chair swivel while typing
      steveTl.to('#seated-chair-group', { rotation: 3, transformOrigin: '400px 480px', duration: 1.4, ease: 'sine.inOut' }, 0);
      steveTl.to('#seated-chair-group', { rotation: -2, transformOrigin: '400px 480px', duration: 1.2, ease: 'sine.inOut' }, 1.4);

      // Lean-back relaxed phase (hands move to back of head / armrests)
      steveTl.to('#steve-upper-body', { y: -2, rotation: -4, transformOrigin: '400px 440px', duration: 0.6, ease: 'power2.out' }, 2.8);
      steveTl.to('#steve-hand-left', { y: -12, x: -4, duration: 0.5, ease: 'power2.out' }, 2.8);
      steveTl.to('#steve-hand-right', { y: -12, x: 4, duration: 0.5, ease: 'power2.out' }, 2.8);
      steveTl.to('#seated-chair-group', { rotation: 0, transformOrigin: '400px 480px', duration: 0.6, ease: 'power2.out' }, 2.8);

      // Relax hold
      steveTl.to({}, { duration: 2.2 });

      // Return to typing posture
      steveTl.to('#steve-upper-body', { y: 0, rotation: 0, transformOrigin: '400px 440px', duration: 0.5, ease: 'power2.inOut' });
      steveTl.to('#steve-hand-left', { y: 0, x: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.4');
      steveTl.to('#steve-hand-right', { y: 0, x: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.4');

      // 5. Rocket Pilot Flame Cel 12fps Flicker
      gsap.to('#rocket-pilot-flame', {
        scaleY: 0.82,
        scaleX: 1.15,
        transformOrigin: '50% 0%',
        duration: 0.12,
        repeat: -1,
        yoyo: true,
        ease: 'steps(2)',
      });

      // 6. Floating geometric stickers
      gsap.to('#hero-sticker-code', { y: -8, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('#hero-sticker-brackets', { y: -10, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4 });

      // 7. Cursor parallax (up to 3 degrees max)
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 2;
        const normY = (e.clientY / innerHeight - 0.5) * 2;

        gsap.to('#hero-parallax-bg', {
          x: normX * 6,
          y: normY * 4,
          duration: 0.8,
          ease: 'power2.out',
        });
        gsap.to('#hero-parallax-fg', {
          x: normX * -8,
          y: normY * -6,
          duration: 0.8,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const isSteveSeated = currentSteveState === 'SEATED';
  const isLaunching = currentSteveState === 'LAUNCHING';

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none pointer-events-auto"
      style={{ overflow: 'visible' }}
    >
      <svg
        viewBox="0 0 800 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
        aria-label="Neo-Brutalist Isometric Developer Workspace"
      >
        {/* ============================================================= */}
        {/* PARALLAX BACKGROUND LAYER (Panels & Desk)                     */}
        {/* ============================================================= */}
        <g id="hero-parallax-bg">
          {/* Ground Floor Shadow underneath Platform Slab */}
          <polygon
            points="140,510 400,640 660,510 680,525 400,660 120,525"
            fill="#0A0A0A"
            opacity="0.88"
          />

          {/* 1. Main Blue Browser Window */}
          <g id="hero-browser-panel">
            {/* Hard Block Shadow */}
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

            {/* Window Top Header Bar */}
            <rect
              x="180"
              y="160"
              width="260"
              height="34"
              fill="#EEF2FA"
              stroke="#0A0A0A"
              strokeWidth="3.5"
            />

            {/* Window Control Buttons */}
            <circle cx="200" cy="177" r="5" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
            <circle cx="216" cy="177" r="5" fill="#FFD700" stroke="#0A0A0A" strokeWidth="1.5" />
            <circle cx="232" cy="177" r="5" fill="#00D26A" stroke="#0A0A0A" strokeWidth="1.5" />

            {/* URL Pill */}
            <rect x="250" y="169" width="160" height="16" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
            <text x="258" y="181" fill="#0A0A0A" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
              sunnypasumarthi.in
            </text>

            {/* Inner Content Status Banner */}
            <rect x="200" y="210" width="220" height="40" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
            <text x="212" y="234" fill="#FFFFFF" fontFamily="monospace" fontSize="12" fontWeight="bold">
              &gt; STATUS: DEPLOYED
            </text>

            {/* Animated Orange Progress Bar */}
            <rect x="200" y="268" width="220" height="18" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <rect
              id="browser-progress-bar"
              x="200"
              y="268"
              width="90"
              height="18"
              fill="#FF5A1F"
              stroke="#0A0A0A"
              strokeWidth="2"
            />

            {/* Content Preview blocks */}
            <rect x="200" y="304" width="100" height="12" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
            <rect x="312" y="304" width="108" height="12" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
            <rect x="200" y="324" width="220" height="48" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <text x="210" y="352" fill="#0A0A0A" fontFamily="monospace" fontSize="11" fontWeight="bold">
              REACT 19 • THREE.JS • WEB3
            </text>
          </g>

          {/* 2. Navy Code Editor Window */}
          <g id="hero-code-panel">
            {/* Hard Block Shadow */}
            <rect x="428" y="188" width="240" height="250" fill="#0A0A0A" />

            {/* Window Container */}
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

            {/* Code Lines typing */}
            <g transform="translate(436, 230)">
              <rect id="code-line-1" x="0" y="0" width="180" height="9" fill="#FF5A1F" />
              <rect id="code-line-2" x="14" y="18" width="130" height="9" fill="#60A5FA" />
              <rect id="code-line-3" x="14" y="36" width="150" height="9" fill="#34D399" />
              <rect id="code-line-4" x="14" y="54" width="165" height="9" fill="#F472B6" />
              <rect id="code-line-5" x="0" y="72" width="40" height="9" fill="#FBBF24" />
              <rect id="code-cursor" x="48" y="72" width="8" height="11" fill="#FF5A1F" />

              {/* Terminal Readout */}
              <rect x="0" y="106" width="208" height="64" fill="#020617" stroke="#0A0A0A" strokeWidth="2" />
              <text x="8" y="124" fill="#34D399" fontFamily="monospace" fontSize="9" fontWeight="bold">
                ✓ BUILD: SUCCESS (0 errors)
              </text>
              <text x="8" y="142" fill="#60A5FA" fontFamily="monospace" fontSize="8">
                &gt; Mascot rig: STEVE online
              </text>
              <text x="8" y="158" fill="#FBBF24" fontFamily="monospace" fontSize="8">
                &gt; FPS: 60 • Zero clipping
              </text>
            </g>
          </g>

          {/* 3. The Desk: Squarely aligned in front of screens */}
          <g id="hero-developer-desk">
            {/* Desk shadow */}
            <polygon points="310,440 490,440 510,470 330,470" fill="#0A0A0A" opacity="0.6" />
            {/* Desk Legs */}
            <rect x="320" y="440" width="10" height="50" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
            <rect x="470" y="440" width="10" height="50" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
            {/* Desk Top Surface */}
            <polygon points="300,425 490,425 510,450 320,450" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
            {/* Keyboard on Desk */}
            <polygon points="360,432 440,432 446,444 366,444" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="1.5" />
            {/* Keycap grid lines */}
            <line x1="375" y1="432" x2="379" y2="444" stroke="#EEF2FA" strokeWidth="1" />
            <line x1="395" y1="432" x2="399" y2="444" stroke="#EEF2FA" strokeWidth="1" />
            <line x1="415" y1="432" x2="419" y2="444" stroke="#EEF2FA" strokeWidth="1" />
            <line x1="430" y1="432" x2="434" y2="444" stroke="#EEF2FA" strokeWidth="1" />
            {/* Mouse */}
            <ellipse cx="462" cy="438" rx="6" ry="4" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
          </g>
        </g>

        {/* ============================================================= */}
        {/* FOREGROUND LAYER (Platform Slab, Chair, Seated Steve, Rocket) */}
        {/* ============================================================= */}
        <g id="hero-parallax-fg">
          {/* Isometric Platform Slab */}
          <g id="hero-platform-slab">
            {/* Left Face */}
            <polygon points="120,490 400,610 400,650 120,530" fill="#CBD5E1" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
            {/* Right Face */}
            <polygon points="400,610 680,490 680,530 400,650" fill="#94A3B8" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
            {/* Front Orange Accent Line */}
            <polygon points="120,490 400,610 400,622 120,502" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2.5" />
            <polygon points="400,610 680,490 680,502 400,622" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2.5" />
            {/* Floor Rhombus */}
            <polygon points="400,370 680,490 400,610 120,490" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
            {/* Floor Grid Lines */}
            <line x1="260" y1="430" x2="540" y2="550" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="330" y1="400" x2="610" y2="520" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="540" y1="430" x2="260" y2="550" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="470" y1="400" x2="190" y2="520" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          </g>

          {/* 4. The Chair & Seated Steve Group */}
          <g id="seated-chair-group" style={{ transformOrigin: '400px 480px' }}>
            {/* Contact Shadow directly under chair base on floor */}
            <polygon
              id="chair-contact-shadow"
              points="340,490 440,490 460,512 360,512"
              fill="#0A0A0A"
              opacity="0.75"
            />

            {/* Pedestal Base with 4 Spokes/Wheels resting on floor */}
            <g id="chair-pedestal-base">
              {/* Central shaft */}
              <rect x="395" y="468" width="10" height="24" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
              {/* 4 Spokes */}
              <line x1="400" y1="488" x2="360" y2="498" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
              <line x1="400" y1="488" x2="440" y2="498" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
              <line x1="400" y1="488" x2="385" y2="506" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
              <line x1="400" y1="488" x2="415" y2="506" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
              {/* Wheel Casters */}
              <circle cx="360" cy="498" r="3.5" fill="#0A0A0A" />
              <circle cx="440" cy="498" r="3.5" fill="#0A0A0A" />
              <circle cx="385" cy="506" r="3.5" fill="#0A0A0A" />
              <circle cx="415" cy="506" r="3.5" fill="#0A0A0A" />
            </g>

            {/* Chair Seat & Backrest (Orange & Navy Cel Block) */}
            <g id="chair-body">
              {/* Tall Backrest Block */}
              <polygon points="350,330 380,345 380,450 350,435" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
              <polygon points="380,345 425,320 425,425 380,450" fill="#050C1A" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
              <polygon points="350,330 395,305 425,320 380,345" fill="#1E293B" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
              {/* Vertical Orange Accent stripe on chair back */}
              <polygon points="375,348 385,342 385,448 375,454" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />

              {/* Seat Cushion Block */}
              <polygon points="355,442 395,464 395,484 355,462" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
              <polygon points="395,464 445,436 445,456 395,484" fill="#E04812" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
              <polygon points="355,442 405,414 445,436 395,464" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
            </g>

            {/* SEATED STEVE (Visible when isSteveSeated) */}
            {isSteveSeated && (
              <g id="seated-steve-mascot">
                {/* Robot Legs dangling squarely to floor */}
                <rect x="382" y="460" width="12" height="24" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" rx="3" />
                <rect x="406" y="460" width="12" height="24" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" rx="3" />
                {/* Robot Feet (Orange boots) */}
                <rect x="378" y="480" width="18" height="10" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" rx="2" />
                <rect x="404" y="480" width="18" height="10" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" rx="2" />

                {/* Upper Body Group (tilts during relaxed phase) */}
                <g id="steve-upper-body">
                  {/* Torso Box (Orange) */}
                  <rect x="375" y="396" width="50" height="42" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="3" rx="4" />
                  {/* Torso Navy Panel / Dial */}
                  <rect x="385" y="408" width="30" height="18" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" rx="2" />
                  <rect x="390" y="413" width="8" height="8" fill="#FF5A1F" />
                  <rect x="402" y="413" width="8" height="8" fill="#FFFFFF" />

                  {/* Robot Arms */}
                  <line x1="375" y1="410" x2="355" y2="430" stroke="#0A1A3F" strokeWidth="6" strokeLinecap="round" />
                  <line x1="425" y1="410" x2="445" y2="430" stroke="#0A1A3F" strokeWidth="6" strokeLinecap="round" />

                  {/* Robot Hands on desk / keyboard */}
                  <circle id="steve-hand-left" cx="355" cy="432" r="7" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
                  <circle id="steve-hand-right" cx="445" cy="432" r="7" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />

                  {/* Neck Joint */}
                  <rect x="394" y="386" width="12" height="12" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />

                  {/* Monitor Head Box (Orange) */}
                  <rect x="365" y="336" width="70" height="52" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="3.5" rx="5" />

                  {/* Blue Screen Face */}
                  <rect x="373" y="344" width="54" height="36" fill="#0047AB" stroke="#0A0A0A" strokeWidth="2" rx="3" />

                  {/* Pixel Smiling Eyes (^^) & Cheeks */}
                  <path d="M382 360 L386 354 L390 360" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M410 360 L414 354 L418 360" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Smile */}
                  <path d="M396 368 Q400 372 404 368" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Blushing Orange Cheeks */}
                  <circle cx="380" cy="366" r="3" fill="#FF5A1F" />
                  <circle cx="420" cy="366" r="3" fill="#FF5A1F" />

                  {/* Antenna */}
                  <line x1="400" y1="336" x2="400" y2="318" stroke="#0A1A3F" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="400" cy="316" r="5" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
                </g>
              </g>
            )}

            {/* Return Greeting Bubble: "Back online!" when Steve returns */}
            {returnBubbleVisible && (
              <g id="return-bubble" transform="translate(365, 290)">
                <rect x="2" y="2" width="72" height="24" fill="#0A0A0A" />
                <rect x="0" y="0" width="72" height="24" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
                <text x="7" y="16" fill="#0A0A0A" fontFamily="monospace" fontSize="9" fontWeight="bold">
                  Back online!
                </text>
                <polygon points="32,24 40,24 36,29" fill="#0A0A0A" />
              </g>
            )}

            {/* "BRB!" Desk Card: Flips up when Steve is away, hidden while seated */}
            {!isSteveSeated && (
              <g id="brb-card" transform="translate(382, 426) rotate(-4)">
                <rect x="2" y="2" width="48" height="26" fill="#0A0A0A" />
                <rect x="0" y="0" width="48" height="26" fill="#FFD700" stroke="#0A0A0A" strokeWidth="2" />
                <text x="6" y="15" fill="#0A0A0A" fontFamily="monospace" fontSize="11" fontWeight="900">
                  BRB!
                </text>
                {/* Steve Mini Doodle on note */}
                <rect x="30" y="6" width="12" height="10" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1" />
                <circle cx="33" cy="11" r="1" fill="#FFFFFF" />
                <circle cx="39" cy="11" r="1" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* 5. The Rocket & Launch Pad: Model rocket beside the desk */}
          <g id="rocket-launch-pad-group" transform="translate(530, 430)">
            {/* Launch Pad Base on floor */}
            <polygon points="-30,30 30,30 45,45 -15,45" fill="#0A0A0A" opacity="0.75" />
            <polygon points="-28,26 28,26 40,40 -16,40" fill="#CBD5E1" stroke="#0A0A0A" strokeWidth="2.5" />
            {/* Hazard stripe line */}
            <line x1="-15" y1="33" x2="25" y2="33" stroke="#FF5A1F" strokeWidth="2" strokeDasharray="4 4" />

            {/* Model Rocket (Visible on pad or during launch) */}
            <g
              id="model-rocket"
              style={{
                transform: isLaunching ? 'translate(-80px, -180px) rotate(-15deg)' : 'none',
                transition: 'transform 1.1s cubic-bezier(0.2, 0.8, 0.3, 1)',
                opacity: currentSteveState === 'DOCKED' ? 0 : 1,
              }}
            >
              {/* Rocket Body (White cylinder with black outline) */}
              <rect x="-10" y="-30" width="20" height="42" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2.5" rx="3" />
              {/* Navy Nosecone */}
              <polygon points="0,-48 -10,-30 10,-30" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Orange Center Stripe */}
              <rect x="-10" y="-14" width="20" height="8" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
              {/* Port Window */}
              <circle cx="0" cy="-20" r="4" fill="#0047AB" stroke="#0A0A0A" strokeWidth="1.5" />
              {/* Orange Fins */}
              <polygon points="-10,-5 -18,14 -10,12" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="10,-5 18,14 10,12" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" strokeLinejoin="round" />
              {/* Thruster Nozzle */}
              <polygon points="-6,12 6,12 8,17 -8,17" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="1.5" />

              {/* Layered Cel Flame: Pilot Flicker (idle) vs Full Ignite */}
              {isLaunching ? (
                /* Full Ignite Flame & Smoke Puffs */
                <g id="rocket-ignite-flame" transform="translate(0, 17)">
                  {/* Outer Orange Flame */}
                  <polygon points="0,32 -12,2 12,2" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
                  {/* Inner White Core */}
                  <polygon points="0,20 -6,2 6,2" fill="#FFFFFF" />
                  {/* Navy Tip */}
                  <polygon points="0,36 -3,28 3,28" fill="#0A1A3F" />
                  {/* Smoke Puffs */}
                  <circle cx="-14" cy="18" r="6" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
                  <circle cx="14" cy="18" r="6" fill="#EEF2FA" stroke="#0A0A0A" strokeWidth="1.5" />
                </g>
              ) : isSteveSeated ? (
                /* Pilot Flame Flicker */
                <g id="rocket-pilot-flame" transform="translate(0, 17)">
                  <polygon points="0,10 -4,1 4,1" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1" />
                  <polygon points="0,6 -2,1 2,1" fill="#FFFFFF" />
                </g>
              ) : null}
            </g>
          </g>

          {/* 6. Geometric Clean Stickers (No micro-text) */}
          <g id="hero-clean-stickers">
            {/* White "</>" Code Chip */}
            <g id="hero-sticker-code" transform="translate(620, 375)">
              <rect x="2" y="2" width="46" height="22" fill="#0A0A0A" />
              <rect x="0" y="0" width="46" height="22" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
              <text x="10" y="15" fill="#0047AB" fontFamily="monospace" fontSize="11" fontWeight="bold">
                &lt;/&gt;
              </text>
            </g>

            {/* Blue "{ }" Brackets Chip */}
            <g id="hero-sticker-brackets" transform="translate(150, 420)">
              <rect x="2" y="2" width="42" height="22" fill="#0A0A0A" />
              <rect x="0" y="0" width="42" height="22" fill="#0047AB" stroke="#0A0A0A" strokeWidth="2" />
              <text x="11" y="15" fill="#FFFFFF" fontFamily="monospace" fontSize="11" fontWeight="bold">
                {'{ }'}
              </text>
            </g>

            {/* Green Check Circle */}
            <g transform="translate(290, 480)">
              <circle cx="15" cy="15" r="13" fill="#0A0A0A" />
              <circle cx="12" cy="12" r="13" fill="#00D26A" stroke="#0A0A0A" strokeWidth="2" />
              <path d="M7 12 L11 16 L18 8" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default HeroSvgIllustration;
