import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';
import type { RobotAnimation, RobotExpression } from './types';

export const FixedGutterBolt: React.FC = () => {
  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);
  const [speechBubble, setSpeechBubble] = useState(() => robotStore.getState().speechBubble);
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

  // Track gentle scroll drift (max +-15% viewport height)
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
      setSpeechBubble(state.speechBubble);
    });
    return () => unsubscribe();
  }, []);

  // Gutter calculation: (windowWidth - contentWidth) / 2
  const { leftGutter, isTooNarrow, isPeekMode, posX, posY } = useMemo(() => {
    const { w, h } = windowDimensions;
    const isNarrow = w < 900;
    const contentW = Math.min(1280, w - 192);
    const gutter = Math.max(0, (w - contentW) / 2);
    const peek = activeSection === 'work' || gutter < 194;

    // Horizontally centered in left gutter (canvas width is 200px)
    let x: number;
    if (peek) {
      // Only head and one hand stick out (~56px visible)
      x = -144;
    } else {
      x = Math.max(12, (gutter / 2) - 100);
    }

    // Vertical resting position at 50% viewport height + gentle drift (+-10% viewport height)
    // Constrained with 24px viewport margin so Bolt is never cut off
    const canvasHeight = 260;
    const middleY = h * 0.5;
    const driftY = (scrollProgress - 0.5) * (h * 0.20);
    const targetY = middleY + driftY;
    const clampedY = Math.max(24 + (canvasHeight / 2), Math.min(h - 24 - (canvasHeight / 2), targetY));

    return {
      leftGutter: gutter,
      isTooNarrow: isNarrow,
      isPeekMode: peek,
      posX: x,
      posY: clampedY,
    };
  }, [windowDimensions, activeSection, scrollProgress]);

  // State Machine Section Reactions (friendly and cheerful only)
  const { currentAnim, currentExpr } = useMemo<{
    currentAnim: RobotAnimation;
    currentExpr: RobotExpression;
  }>(() => {
    if (prefersReducedMotion) {
      return { currentAnim: 'idle', currentExpr: 'happy' };
    }

    switch (activeSection) {
      case 'home':
        return { currentAnim: 'wave', currentExpr: 'happy' };
      case 'about':
        return { currentAnim: 'salute', currentExpr: 'focused' };
      case 'work':
        return { currentAnim: 'idle', currentExpr: 'curious' };
      case 'skills':
        return { currentAnim: 'wave', currentExpr: 'happy' };
      case 'github':
        return { currentAnim: 'idle', currentExpr: 'curious' };
      case 'stats':
        return { currentAnim: 'salute', currentExpr: 'focused' };
      case 'events':
        return { currentAnim: 'cheer', currentExpr: 'excited' };
      case 'journey':
        return { currentAnim: 'walk', currentExpr: 'happy' };
      case 'contact':
        return { currentAnim: 'wave', currentExpr: 'happy' };
      default:
        return { currentAnim: 'idle', currentExpr: 'happy' };
    }
  }, [activeSection, prefersReducedMotion]);

  // Section Speech: trigger at most one short (< 24 chars) message per section only when gutter is ample
  const lastSectionRef = useRef<string>('');
  useEffect(() => {
    if (activeSection && activeSection !== lastSectionRef.current) {
      lastSectionRef.current = activeSection;
      if (leftGutter >= 300 && activeSection !== 'work' && activeSection !== 'home') {
        const SECTION_LINES: Record<string, string> = {
          about: 'B.Tech CS scholar!',
          skills: 'Inspect stack below!',
          github: 'Code telemetry!',
          stats: 'Problem solver!',
          events: 'Hackathon spirit!',
          journey: 'Evolving journey!',
          contact: "Let's build together!",
        };
        const text = SECTION_LINES[activeSection];
        if (text) {
          robotStore.showSpeechBubble(text.slice(0, 24), 2500);
        }
      } else {
        robotStore.clearSpeechBubble();
      }
    }
  }, [activeSection, leftGutter]);

  // Hide Bolt below 900px wide or when disabled
  if (isTooNarrow || !robotEnabled) {
    return null;
  }

  const canRender3D = isTabVisible;

  return (
    <div
      className="fixed z-35 select-none pointer-events-none"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        transform: 'translateY(-50%)',
        transition: 'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.2s ease-out',
        width: '200px',
        height: '260px',
      }}
      aria-hidden="true"
    >
      {/* Speech bubble: strictly ABOVE Bolt's head with downward tail, never over face or body */}
      {!isPeekMode && leftGutter >= 240 && speechBubble && speechBubble.length <= 24 && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 max-w-[170px] px-3 py-1.5 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[11px] font-bold text-[#0A0A0A] leading-tight z-40 pointer-events-none text-center whitespace-normal"
        >
          <span>{speechBubble}</span>
          {/* Downward tail pointing to Bolt's antenna/head */}
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

      {/* Small, Low-Overhead WebGL Canvas (200x260) */}
      <div className="w-full h-full relative">
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              className="pointer-events-none"
              style={{ pointerEvents: 'none', width: '200px', height: '260px' }}
              dpr={[1, 1.5]}
              frameloop={canRender3D ? 'always' : 'never'}
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

              <group position={[0, -0.2, 0]}>
                <Robot
                  variant="bolt"
                  animation={currentAnim}
                  expression={currentExpr}
                  scale={1.20}
                  facing={1}
                  headTrackCursor={!isPeekMode && !prefersReducedMotion}
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
