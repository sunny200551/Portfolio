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

  const [leftGutter, setLeftGutter] = useState<number>(() => {
    if (typeof window === 'undefined') return 300;
    const w = window.innerWidth;
    const containerW = Math.min(1280, w - 196);
    return Math.max(0, (w - containerW) / 2);
  });

  const [isTooNarrow, setIsTooNarrow] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 900 : false;
  });

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // Window resize handler for gutter calculation
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsTooNarrow(w < 900);
      const containerW = Math.min(1280, w - 196);
      const gutter = Math.max(0, (w - containerW) / 2);
      setLeftGutter(gutter);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
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

  // State Machine Section Reactions (deterministic, cheap, no travel)
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
        // Peek mode: curious expression
        return { currentAnim: 'idle', currentExpr: 'curious' };
      case 'skills':
        return { currentAnim: 'wave', currentExpr: 'happy' };
      case 'github':
        return { currentAnim: 'idle', currentExpr: 'focused' };
      case 'stats':
        return { currentAnim: 'salute', currentExpr: 'focused' };
      case 'events':
        return { currentAnim: 'cheer', currentExpr: 'excited' };
      case 'journey':
        return { currentAnim: 'walk', currentExpr: 'happy' }; // Walk-in-place
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
      if (leftGutter >= 340 && activeSection !== 'work' && activeSection !== 'home') {
        const SECTION_LINES: Record<string, string> = {
          about: 'B.Tech CS scholar!',
          skills: 'Stack inspection!',
          github: 'Code telemetry!',
          stats: 'Problem solving!',
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

  // Peek mode: active when gutter < 194px OR always in the pinned Work gallery
  const isPeekMode = activeSection === 'work' || leftGutter < 194;

  // Hide Bolt below 900px wide or when disabled
  if (isTooNarrow || !robotEnabled) {
    return null;
  }

  // Small Canvas size: 220x280
  const canRender3D = isTabVisible;

  return (
    <div
      className="fixed left-0 top-1/2 z-30 select-none pointer-events-none"
      style={{
        transform: isPeekMode ? 'translate(-124px, -50%)' : 'translate(10px, -50%)',
        transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '220px',
        height: '280px',
      }}
      aria-hidden="true"
    >
      {/* Small, Low-Overhead WebGL Canvas (220x280) */}
      <div className="w-full h-full relative">
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              className="pointer-events-none"
              style={{ pointerEvents: 'none', width: '220px', height: '280px' }}
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
                  scale={1.22}
                  facing={1}
                  headTrackCursor={!isPeekMode && !prefersReducedMotion}
                />
              </group>
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      </div>

      {/* Speech bubble: strictly inside gutter beside Bolt's head when gutter >= 340px, never over content */}
      {!isPeekMode && leftGutter >= 340 && speechBubble && speechBubble.length <= 24 && (
        <div
          className="absolute left-[175px] top-[30px] max-w-[150px] px-3 py-2 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[11px] font-bold text-[#0A0A0A] leading-tight z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            animationDuration: '200ms',
          }}
        >
          <span>{speechBubble}</span>
          {/* Arrow pointing to Bolt's head on the left */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-7px',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '7px solid #0A0A0A',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-4px',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight: '5px solid #FFFFFF',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FixedGutterBolt;
