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

// Context expression mapping table (Part 5c)
const SECTION_EXPRESSIONS: Record<string, { anim: RobotAnimation; expr: RobotExpression; side: 'left' | 'right' }> = {
  home: { anim: 'wave', expr: 'happy', side: 'right' },
  about: { anim: 'idle', expr: 'curious', side: 'left' },
  work: { anim: 'idle', expr: 'proud', side: 'right' },
  skills: { anim: 'idle', expr: 'thinking', side: 'left' },
  github: { anim: 'idle', expr: 'proud', side: 'right' },
  stats: { anim: 'cheer', expr: 'happy', side: 'left' },
  events: { anim: 'wave', expr: 'excited', side: 'right' },
  journey: { anim: 'idle', expr: 'curious', side: 'left' },
  contact: { anim: 'wave', expr: 'happy', side: 'right' },
};

export const FixedGutterBolt: React.FC = () => {
  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);
  const [speechBubble, setSpeechBubble] = useState<string | null>(() => robotStore.getState().speechBubble);
  const [isTabVisible, setIsTabVisible] = useState(() => typeof document !== 'undefined' ? !document.hidden : true);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Track scroll progress for gentle vertical drift
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Shy mode state machine (Part 7)
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

    // Sequence timer chain
    // Step 1: sneak (0 - 2s)
    shySequenceTimerRef.current = setTimeout(() => {
      setShyStep(2); // Hide behind screen edge
      // Step 2: hide (2s - 3.5s)
      shySequenceTimerRef.current = setTimeout(() => {
        setShyStep(3); // Peek with blush
        // Step 3: peek (3.5s - 5.5s)
        shySequenceTimerRef.current = setTimeout(() => {
          setShyStep(4); // "Ahem!" clears throat
          setShyBubble("Ahem... ✨");
          // Step 4: clears throat (5.5s - 7.5s)
          shySequenceTimerRef.current = setTimeout(() => {
            setShyStep(5); // Flirt with cheesy line + wink
            setShyBubble(SHY_TECH_PICKUP_LINES[shyLineIndex]);
            // Step 5: flirt (7.5s - 12s)
            shySequenceTimerRef.current = setTimeout(() => {
              setShyStep(6); // Embarrassed, covers face, hides
              setShyBubble(null);
              // Step 6: hide embarrassed (12s - 14s)
              shySequenceTimerRef.current = setTimeout(() => {
                setShyStep(7); // Little bow and wave
                setShyBubble("Enjoy the site! 😊");
                // Step 7: bow (14s - 16.5s)
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

  // Idle watcher (7.5s idle reading detection)
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || !shyEnabled || shyModeActive) return;

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (shyModeActive) {
        cancelShyMode();
      }
      idleTimerRef.current = setTimeout(() => {
        // Check if tab visible and not in an input
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

  // Section configuration & alternating side (Part 6b)
  const currentConfig = SECTION_EXPRESSIONS[activeSection] || SECTION_EXPRESSIONS.home;
  const isMobile = windowDimensions.w < 768;
  const isTablet = windowDimensions.w >= 768 && windowDimensions.w < 1200;

  // Compute position
  const { posX, posY, facing, isPeeking, canvasW, canvasH, robotScale } = useMemo(() => {
    const { w, h } = windowDimensions;

    if (isMobile) {
      // Mobile companion: 64x80px compact size resting in bottom corner
      const mScale = 0.62;
      const mX = w - 88;
      const mY = h - 110;
      return {
        posX: mX,
        posY: mY,
        facing: -1 as const,
        isPeeking: false,
        canvasW: 80,
        canvasH: 104,
        robotScale: mScale,
      };
    }

    const preferredSide = currentConfig.side;
    const isWorkSection = activeSection === 'work';
    const restingMiddleY = h * 0.5;
    const driftY = (scrollProgress - 0.5) * (h * 0.22);
    const canvasHeight = 260;
    const clampedY = Math.max(32 + canvasHeight / 2, Math.min(h - 32 - canvasHeight / 2, restingMiddleY + driftY));

    // Shy mode position overrides
    if (shyModeActive) {
      if (shyStep === 2 || shyStep === 6) {
        // Hidden behind edge
        const hideX = preferredSide === 'left' ? -150 : w - 24;
        return {
          posX: hideX,
          posY: clampedY,
          facing: (preferredSide === 'left' ? 1 : -1) as (1 | -1),
          isPeeking: true,
          canvasW: 200,
          canvasH: 260,
          robotScale: 1.15,
        };
      }
      if (shyStep === 3) {
        // Peeking from edge
        const peekX = preferredSide === 'left' ? -110 : w - 75;
        return {
          posX: peekX,
          posY: clampedY,
          facing: (preferredSide === 'left' ? 1 : -1) as (1 | -1),
          isPeeking: true,
          canvasW: 200,
          canvasH: 260,
          robotScale: 1.15,
        };
      }
    }

    // Normal resting position:
    // Left side or right side edge peek mode (64px visible) so full-width cards and headings are NEVER covered!
    const isRight = preferredSide === 'right';
    let targetX: number;

    if (isRight) {
      targetX = w - 64;
    } else {
      targetX = -136;
    }

    return {
      posX: targetX,
      posY: clampedY,
      facing: (isRight ? -1 : 1) as 1 | -1,
      isPeeking: true,
      canvasW: 200,
      canvasH: 260,
      robotScale: 1.18,
    };
  }, [windowDimensions, isMobile, currentConfig, scrollProgress, shyModeActive, shyStep]);

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

    // Default section context mapping (zero serious/angry faces)
    return {
      liveAnim: currentConfig.anim,
      liveExpr: currentConfig.expr,
    };
  }, [prefersReducedMotion, shyModeActive, shyStep, currentConfig]);

  if (!robotEnabled || (activeSection === 'home' && !shyModeActive)) return null;

  const displayBubble = shyBubble || speechBubble;

  return (
    <div
      className="fixed z-35 select-none pointer-events-none"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        transform: 'translateY(-50%)',
        transition: shyStep === 1 
          ? 'left 1.8s cubic-bezier(0.25, 1, 0.5, 1), top 0.4s ease-out' 
          : 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s ease-out',
        width: `${canvasW}px`,
        height: `${canvasH}px`,
      }}
      aria-hidden="true"
    >
      {/* Speech bubble: strictly ABOVE Bolt's head, never over face or body */}
      {displayBubble && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 min-w-[140px] max-w-[240px] px-3.5 py-2 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[11px] font-bold text-[#0A0A0A] leading-snug z-40 pointer-events-none text-center"
        >
          <span>{displayBubble}</span>
          {/* Downward triangle pointer */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #0A0A0A',
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
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #FFFFFF',
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
              camera={{ position: [0, 0, 3.4], fov: 32 }}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'low-power',
              }}
            >
              <ambientLight intensity={1.1} color="#FFFFFF" />
              <directionalLight position={[4, 7, 5]} intensity={1.5} color="#FFFFFF" />
              <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#EEF2FA" />

              <group position={[0, -0.22, 0]}>
                <Robot
                  variant="bolt"
                  animation={liveAnim}
                  expression={liveExpr}
                  scale={robotScale}
                  facing={facing}
                  headTrackCursor={!isPeeking && !prefersReducedMotion && !shyModeActive}
                />
              </group>
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      </div>
    </div>
  );
};

export default FixedGutterBolt;
