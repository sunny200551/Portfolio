import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';
import type { RobotAnimation, RobotExpression } from './types';

const SHY_TECH_PICKUP_LINES = [
  "Are you a CSS grid? You align everything in my life.",
  "Is your name Git? Because I want to commit.",
  "You must be a semicolon; you complete my line.",
  "Are you an API? Because I can't stop calling you.",
  "I'd never 404 on you.",
  "Are you responsive design? You look perfect in every viewport.",
  "Is your name Wi-Fi? Because I'm feeling a strong connection.",
  "You're like high-bandwidth fiber: fast and reliable.",
  "Are you an async function? I will always wait for you.",
  "My heart has zero merge conflicts with yours."
];

// Context expression mapping table & alternating lanes
// Alternate lanes by section:
// Hero: right | About: left | Work: left | Skills: right | GitHub: left | Stats: right | Events: left | Journey: right | Contact: left
const SECTION_CONFIG: Record<string, { anim: RobotAnimation; expr: RobotExpression; side: 'left' | 'right'; greeting: string }> = {
  home: { anim: 'wave', expr: 'happy', side: 'right', greeting: "Hi, I'm Steve. Follow me!" },
  about: { anim: 'idle', expr: 'curious', side: 'left', greeting: "Welcome to About! ✨" },
  work: { anim: 'idle', expr: 'curious', side: 'left', greeting: "Check out these projects! 🚀" },
  skills: { anim: 'idle', expr: 'thinking', side: 'right', greeting: "Sunny's tech loadout! ⚡" },
  github: { anim: 'idle', expr: 'proud', side: 'left', greeting: "Green commit skyline! 📊" },
  stats: { anim: 'cheer', expr: 'happy', side: 'right', greeting: "Problem solving stats! 🏆" },
  events: { anim: 'wave', expr: 'excited', side: 'left', greeting: "Hackathons & events! 🎟️" },
  journey: { anim: 'idle', expr: 'curious', side: 'right', greeting: "The learning journey! 🗺️" },
  contact: { anim: 'wave', expr: 'happy', side: 'left', greeting: "Let's build something! ✉️" },
};

export const FixedGutterSteve: React.FC = () => {
  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);
  const [speechBubble, setSpeechBubble] = useState<string | null>(() => robotStore.getState().speechBubble);
  const [isTabVisible, setIsTabVisible] = useState(() => typeof document !== 'undefined' ? !document.hidden : true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFastScrolling, setIsFastScrolling] = useState(false);
  const [isCrossing, setIsCrossing] = useState(false);
  const [idleWaveActive, setIdleWaveActive] = useState(false);
  const [greetBubble, setGreetBubble] = useState<string | null>(null);

  const prevSideRef = useRef<'left' | 'right'>('right');
  const lastScrollTime = useRef(0);
  const scrollStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitedSectionsRef = useRef<Set<string>>(new Set());

  const [windowDimensions, setWindowDimensions] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track scroll progress and velocity for fast-scroll companion fade
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const now = performance.now();
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);

      const deltaY = Math.abs(window.scrollY - lastY);
      const deltaTime = Math.max(1, now - lastScrollTime.current);
      const velocity = deltaY / deltaTime; // px/ms

      if (velocity > 1.8) {
        setIsFastScrolling(true);
      }

      if (scrollStopTimer.current) clearTimeout(scrollStopTimer.current);
      scrollStopTimer.current = setTimeout(() => {
        setIsFastScrolling(false);
      }, 150);

      lastY = window.scrollY;
      lastScrollTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollStopTimer.current) clearTimeout(scrollStopTimer.current);
    };
  }, []);

  // Periodic gentle idle wave every 13s
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled) return;

    const interval = setInterval(() => {
      setIdleWaveActive(true);
      idleWaveTimerRef.current = setTimeout(() => {
        setIdleWaveActive(false);
      }, 2200);
    }, 13000);

    return () => {
      clearInterval(interval);
      if (idleWaveTimerRef.current) clearTimeout(idleWaveTimerRef.current);
    };
  }, [prefersReducedMotion, robotEnabled]);

  // Tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Store subscription
  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      const state = robotStore.getState();
      setActiveSection(state.activeSection);
      setRobotEnabled(state.robotEnabled);
      if (state.speechBubble !== speechBubble) {
        setSpeechBubble(state.speechBubble);
      }
    });
    return () => unsubscribe();
  }, [speechBubble]);

  const [heroPlinthMode, setHeroPlinthMode] = useState(true);
  const [isJumpingOffPlinth, setIsJumpingOffPlinth] = useState(false);
  const [homePlatformPos, setHomePlatformPos] = useState(() => robotStore.getState().homePlatformPos);

  // Home hero plinth mode scroll & idle watcher
  useEffect(() => {
    let heroIdleTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 60) {
        setHeroPlinthMode(true);
        if (heroIdleTimer) clearTimeout(heroIdleTimer);
        heroIdleTimer = setTimeout(() => {
          if (window.scrollY < 60) {
            // After 6s idle on top, jump off platform into lane
            setIsJumpingOffPlinth(true);
            setHeroPlinthMode(false);
            setTimeout(() => setIsJumpingOffPlinth(false), 900);
          }
        }, 6000);
      } else {
        if (heroPlinthMode) {
          setIsJumpingOffPlinth(true);
          setTimeout(() => setIsJumpingOffPlinth(false), 900);
        }
        setHeroPlinthMode(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (heroIdleTimer) clearTimeout(heroIdleTimer);
    };
  }, [heroPlinthMode]);

  // Sync homePlatformPos from store
  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const p = robotStore.getState().homePlatformPos;
      if (p.x > 0 && (p.x !== homePlatformPos.x || p.y !== homePlatformPos.y)) {
        setHomePlatformPos(p);
      }
    });
    return () => unsub();
  }, [homePlatformPos]);
  const [shyModeActive, setShyModeActive] = useState(false);
  const [shyStep, setShyStep] = useState(0);
  const [shyLineIndex, setShyLineIndex] = useState(0);
  const [shyBubble, setShyBubble] = useState<string | null>(null);
  const shySessionCount = useRef(0);
  const lastShyEndTime = useRef(0);
  const [shyEnabled, setShyEnabled] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shySequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelShyMode = useCallback(() => {
    if (shySequenceTimerRef.current) clearTimeout(shySequenceTimerRef.current);
    setShyModeActive(false);
    setShyStep(0);
    setShyBubble(null);
    lastShyEndTime.current = Date.now();
  }, []);

  const triggerShySequence = useCallback(() => {
    if (prefersReducedMotion || !robotEnabled || !shyEnabled) return;
    if (shySessionCount.current >= 3) return;
    if (Date.now() - lastShyEndTime.current < 60000 && lastShyEndTime.current !== 0) return;

    shySessionCount.current += 1;
    setShyModeActive(true);
    setShyStep(1); // 1. Tiptoe sneak
    setShyLineIndex((prev) => (prev + 1) % SHY_TECH_PICKUP_LINES.length);

    shySequenceTimerRef.current = setTimeout(() => {
      setShyStep(2);
      shySequenceTimerRef.current = setTimeout(() => {
        setShyStep(3);
        shySequenceTimerRef.current = setTimeout(() => {
          setShyStep(4);
          setShyBubble("Ahem... ✨");
          shySequenceTimerRef.current = setTimeout(() => {
            setShyStep(5);
            setShyBubble(SHY_TECH_PICKUP_LINES[shyLineIndex]);
            shySequenceTimerRef.current = setTimeout(() => {
              setShyStep(6);
              setShyBubble(null);
              shySequenceTimerRef.current = setTimeout(() => {
                setShyStep(7);
                setShyBubble("Enjoy the site! 😊");
                shySequenceTimerRef.current = setTimeout(() => {
                  cancelShyMode();
                }, 2500);
              }, 2000);
            }, 4500);
          }, 2000);
        }, 2000);
      }, 1500);
    }, 2000);
  }, [prefersReducedMotion, robotEnabled, shyEnabled, shyLineIndex, cancelShyMode]);

  // Idle watcher (7.5s idle reading detection for shy mode)
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || !shyEnabled || shyModeActive) return;

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (shyModeActive) {
        cancelShyMode();
      }
      idleTimerRef.current = setTimeout(() => {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        const isInInput = activeTag === 'input' || activeTag === 'textarea';
        const hasOpenModal = document.documentElement.classList.contains('lenis-stopped');
        if (!isInInput && !hasOpenModal && !document.hidden) {
          triggerShySequence();
        }
      }, 7500);
    };

    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('scroll', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    window.addEventListener('click', resetIdle, { passive: true });

    resetIdle();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
  }, [prefersReducedMotion, robotEnabled, shyEnabled, shyModeActive, triggerShySequence, cancelShyMode]);

  // External command palette listeners
  useEffect(() => {
    const handleShyNow = () => {
      cancelShyMode();
      setTimeout(() => triggerShySequence(), 100);
    };
    const handleShyToggle = (e: CustomEvent<boolean>) => {
      setShyEnabled(e.detail);
      if (!e.detail) cancelShyMode();
    };

    window.addEventListener('robot:shy-mode-now', handleShyNow);
    window.addEventListener('robot:shy-mode-toggle', handleShyToggle as EventListener);
    return () => {
      window.removeEventListener('robot:shy-mode-now', handleShyNow);
      window.removeEventListener('robot:shy-mode-toggle', handleShyToggle as EventListener);
    };
  }, [cancelShyMode, triggerShySequence]);

  // Current section configuration
  const currentConfig = SECTION_CONFIG[activeSection] || SECTION_CONFIG.home;
  const isMobileOrTablet = windowDimensions.w < 1024;

  // Lane switch detection: trigger crossing walk animation and first-time greeting bubble
  useEffect(() => {
    const targetSide = currentConfig.side;
    if (prevSideRef.current !== targetSide && !isMobileOrTablet) {
      setIsCrossing(true);
      const timer = setTimeout(() => setIsCrossing(false), 850);
      prevSideRef.current = targetSide;

      // First time in this lane greeting
      if (!visitedSectionsRef.current.has(activeSection) && currentConfig.greeting) {
        visitedSectionsRef.current.add(activeSection);
        setGreetBubble(currentConfig.greeting);
        if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = setTimeout(() => setGreetBubble(null), 2500);
      }

      return () => clearTimeout(timer);
    }
    prevSideRef.current = targetSide;
  }, [activeSection, currentConfig, isMobileOrTablet]);

  // Compute exact position inside reserved lanes
  const { posX, posY, facing, canvasW, canvasH, robotScale } = useMemo(() => {
    const { w, h } = windowDimensions;

    if (isMobileOrTablet) {
      // Mobile & tablet companion: 76x96px docked in bottom corner, alternating per section
      const mScale = 0.62;
      const cW = 76;
      const cH = 96;
      const mY = h - 110;
      const isLeft = currentConfig.side === 'left';
      const mX = isLeft ? 16 : w - cW - 16;

      return {
        posX: mX,
        posY: mY,
        facing: (isLeft ? 1 : -1) as (1 | -1),
        canvasW: cW,
        canvasH: cH,
        robotScale: mScale,
      };
    }

    // Desktop (>= 1024px):
    // Standard canvas: 110px wide x 150px tall (holds ~102px tall robot without any clipping)
    const cW = 110;
    const cH = 150;
    const rScale = 0.95;

    // Center vertically at 50% viewport with slight subtle scroll drift (+/- 36px)
    const restingMiddleY = h * 0.5;
    const driftY = (scrollProgress - 0.5) * 72;
    const clampedY = Math.max(cH / 2 + 24, Math.min(h - cH / 2 - 24, restingMiddleY + driftY));

    // Shy mode override
    if (shyModeActive) {
      if (shyStep === 2 || shyStep === 6) {
        return {
          posX: currentConfig.side === 'left' ? -80 : w - 30,
          posY: clampedY,
          facing: (currentConfig.side === 'left' ? 1 : -1) as (1 | -1),
          canvasW: cW,
          canvasH: cH,
          robotScale: rScale,
        };
      }
    }

    // Hero plinth handoff: STEVE starts on the hero platform floor anchor!
    if (activeSection === 'home' && heroPlinthMode && homePlatformPos.x > 0) {
      return {
        posX: Math.max(16, Math.min(w - cW - 16, homePlatformPos.x - cW / 2)),
        posY: Math.max(cH / 2 + 10, homePlatformPos.y - cH / 2),
        facing: -1 as const,
        canvasW: cW,
        canvasH: cH,
        robotScale: rScale * 1.05,
      };
    }

    // Reserved lanes positioning:
    // Left lane: STEVE sits comfortably inside left margin [16px, laneWidth]
    // Right lane: STEVE sits inside right lane [w - 56px - cW, w - 56px] (safely away from rail at w-52px)
    const isRight = currentConfig.side === 'right';
    let targetX: number;

    if (isRight) {
      const hasRail = w >= 1200;
      targetX = hasRail ? w - 58 - cW : w - 20 - cW;
    } else {
      targetX = 16;
    }

    return {
      posX: targetX,
      posY: clampedY,
      facing: (isRight ? -1 : 1) as (1 | -1),
      canvasW: cW,
      canvasH: cH,
      robotScale: rScale,
    };
  }, [windowDimensions, isMobileOrTablet, currentConfig, scrollProgress, shyModeActive, shyStep]);

  // Compute live animation and expression
  const { liveAnim, liveExpr } = useMemo<{ liveAnim: RobotAnimation; liveExpr: RobotExpression }>(() => {
    if (prefersReducedMotion) {
      return { liveAnim: 'idle', liveExpr: 'happy' };
    }

    if (shyModeActive) {
      switch (shyStep) {
        case 1:
          return { liveAnim: 'walk', liveExpr: 'curious' };
        case 2:
          return { liveAnim: 'idle', liveExpr: 'shy' };
        case 3:
          return { liveAnim: 'idle', liveExpr: 'shy' };
        case 4:
          return { liveAnim: 'wave', liveExpr: 'enjoying' };
        case 5:
          return { liveAnim: 'salute', liveExpr: 'flirty' };
        case 6:
          return { liveAnim: 'facepalm', liveExpr: 'shy' };
        case 7:
          return { liveAnim: 'wave', liveExpr: 'happy' };
        default:
          return { liveAnim: 'idle', liveExpr: 'happy' };
      }
    }

    // Hero plinth jump handoff
    if (isJumpingOffPlinth) {
      return { liveAnim: 'jump', liveExpr: 'excited' };
    }

    // Lane crossing active: play walk animation during continuous lane change
    if (isCrossing) {
      return { liveAnim: 'walk', liveExpr: 'happy' };
    }

    // Periodic gentle idle wave
    if (idleWaveActive && currentConfig.anim === 'idle') {
      return { liveAnim: 'wave', liveExpr: 'happy' };
    }

    return {
      liveAnim: currentConfig.anim,
      liveExpr: currentConfig.expr,
    };
  }, [prefersReducedMotion, shyModeActive, shyStep, isCrossing, idleWaveActive, currentConfig]);

  // Handle tap on mobile companion
  const handleMobileCompanionTap = () => {
    if (isMobileOrTablet) {
      robotStore.setSteve('cheer', 'happy');
      setGreetBubble("BEEP BOOP! ✨");
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = setTimeout(() => {
        setGreetBubble(null);
        robotStore.setSteve('idle', 'happy');
      }, 2000);
    }
  };

  if (!robotEnabled) return null;

  const displayBubble = shyBubble || speechBubble || greetBubble;

  return (
    <div
      id="robot-steve-container"
      data-robot-instance="single-steve"
      className={`fixed z-35 select-none ${
        isMobileOrTablet ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
      } ${isFastScrolling && isMobileOrTablet ? 'opacity-40' : 'opacity-100'} transition-opacity duration-200`}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        transform: 'translateY(-50%)',
        transition: isCrossing
          ? 'left 0.85s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.3s ease-out, opacity 0.2s ease-out'
          : 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s ease-out, opacity 0.2s ease-out',
        width: `${canvasW}px`,
        height: `${canvasH}px`,
      }}
      onClick={handleMobileCompanionTap}
      aria-label="STEVE - Interactive Portfolio Robot Mascot"
    >
      {/* Speech bubble: strictly ABOVE Steve's head/antenna, never over face or body */}
      {displayBubble && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[130px] max-w-[220px] px-3.5 py-1.5 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[11px] font-bold text-[#0A0A0A] leading-snug z-40 pointer-events-none text-center"
        >
          <span>{displayBubble}</span>
          {/* Downward triangle pointer pointing toward head */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #0A0A0A',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% - 2px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '3.5px solid transparent',
              borderRight: '3.5px solid transparent',
              borderTop: '3.5px solid #FFFFFF',
            }}
          />
        </div>
      )}

      {/* R3F Canvas Container */}
      <div className="w-full h-full relative">
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              className="pointer-events-none"
              style={{ pointerEvents: 'none', width: `${canvasW}px`, height: `${canvasH}px` }}
              dpr={[1, 1.5]}
              frameloop={isTabVisible ? 'always' : 'never'}
              camera={{ position: [0, 0, 3.2], fov: 32 }}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'low-power',
              }}
            >
              <ambientLight intensity={1.1} color="#FFFFFF" />
              <directionalLight position={[4, 7, 5]} intensity={1.5} color="#FFFFFF" />
              <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#EEF2FA" />

              <group position={[0, -0.16, 0]}>
                <Robot
                  variant="steve"
                  animation={liveAnim}
                  expression={liveExpr}
                  scale={robotScale}
                  facing={facing}
                  headTrackCursor={!prefersReducedMotion && !shyModeActive}
                />
              </group>
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>

        {/* Soft neo-brutalist floor shadow pill under STEVE's feet */}
        <div className="w-14 h-2.5 bg-[#0A0A0A]/20 rounded-full mx-auto -mt-2.5 blur-[1px] pointer-events-none" />
      </div>
    </div>
  );
};

export default FixedGutterSteve;
