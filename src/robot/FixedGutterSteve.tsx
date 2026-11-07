import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { steveVoice, type VoiceCategory } from './steveVoice';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';
import { steveState, type SteveState } from '../lib/steveState';
import type { RobotAnimation, RobotExpression } from './types';

// Section greeting lines - strictly <= 20 characters each
const SECTION_GREETINGS: Record<string, { anim: RobotAnimation; expr: RobotExpression; text: string }> = {
  about: { anim: 'idle', expr: 'curious', text: 'Meet Sunny! 👋' },
  work: { anim: 'salute', expr: 'happy', text: 'Featured work! 🚀' },
  skills: { anim: 'idle', expr: 'thinking', text: 'Tech loadout! ⚡' },
  github: { anim: 'idle', expr: 'proud', text: 'Green skyline! 📊' },
  stats: { anim: 'cheer', expr: 'happy', text: 'Code stats! 🏆' },
  events: { anim: 'wave', expr: 'excited', text: 'Hackathons! 🎟️' },
  journey: { anim: 'idle', expr: 'curious', text: 'My journey! 🗺️' },
  contact: { anim: 'wave', expr: 'happy', text: 'Say hello! ✉️' },
};

export const FixedGutterSteve: React.FC = () => {
  const [currentSteveState, setCurrentSteveState] = useState<SteveState>(() => steveState.getState());
  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true));
  const [isSquashing, setIsSquashing] = useState(false);
  const [isLandingPuff, setIsLandingPuff] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));

  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitedSectionsRef = useRef<Set<string>>(new Set());

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // Subscribe to Steve handoff state machine
  useEffect(() => {
    const unsub = steveState.subscribe((state) => {
      setCurrentSteveState(state);
      if (state === 'LAUNCHING') {
        setIsLandingPuff(true);
        setIsSquashing(true);
        setTimeout(() => setIsLandingPuff(false), 800);
        setTimeout(() => setIsSquashing(false), 450);
      }
    });
    return unsub;
  }, []);

  // Track window width for 1200px breakpoint
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track tab visibility to pause Three.js loop
  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Track store activeSection changes & trigger max 1 short speech bubble per section
  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const state = robotStore.getState();
      setRobotEnabled(state.robotEnabled);

      if (state.activeSection !== activeSection) {
        setActiveSection(state.activeSection);

        // If not visited this section yet and not home, trigger one 2.5s bubble
        if (state.activeSection !== 'home' && !visitedSectionsRef.current.has(state.activeSection)) {
          visitedSectionsRef.current.add(state.activeSection);
          const cfg = SECTION_GREETINGS[state.activeSection];
          if (cfg) {
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
            setActiveBubble(cfg.text);
            steveVoice.speak(('section_' + state.activeSection) as VoiceCategory);

            bubbleTimerRef.current = setTimeout(() => {
              setActiveBubble(null);
            }, 2500);
          }
        }
      }
    });

    return () => {
      unsub();
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [activeSection]);

  // Below 1200px: dock Steve is completely hidden (menu is used)
  if (windowWidth < 1200) return null;

  // In SEATED state (Hero section): Dock Steve is completely unmounted (lives in Hero illustration)
  if (currentSteveState === 'SEATED') return null;

  if (!robotEnabled) return null;

  // Current animation and expression
  const sectionConfig = SECTION_GREETINGS[activeSection] || SECTION_GREETINGS.about;
  const anim: RobotAnimation = currentSteveState === 'LAUNCHING' ? 'wave' : sectionConfig.anim;
  const expr: RobotExpression = currentSteveState === 'LAUNCHING' ? 'excited' : sectionConfig.expr;

  // Dimensions: Steve is ~130px wide, fits cleanly in the 168px left lane
  const canvasW = 160;
  const canvasH = 220;

  return (
    <div
      id="robot-steve-dock"
      data-testid="dock-steve"
      className="fixed z-40 select-none pointer-events-none transition-all duration-300"
      style={{
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${canvasW}px`,
        height: `${canvasH}px`,
        opacity: currentSteveState === 'RETURNING' ? 0.3 : 1,
      }}
      aria-label="Steve mascot dock"
    >
      {/* Speech bubble: strictly ABOVE Steve's head inside the 168px lane, clamped >= 8px from viewport edge */}
      {activeBubble && (
        <div
          data-testid="steve-speech-bubble"
          className="absolute z-50 pointer-events-none bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] px-2.5 py-1.5 text-center font-mono text-[11px] font-bold text-[#0A0A0A] leading-tight"
          style={{
            left: '0px',
            bottom: 'calc(100% - 10px)',
            width: '146px',
            maxWidth: '146px',
            wordBreak: 'break-word',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase text-[#FF5A1F] border-b border-[#0A0A0A]/20 pb-0.5 mb-1">
            <span>STEVE</span>
            <span>⚡</span>
          </div>

          <span>{activeBubble}</span>

          {/* Downward tail pointing down toward Steve's head */}
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

      {/* Landing Smoke/Flame Puff Effect */}
      {isLandingPuff && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
          <div className="w-3 h-3 bg-[#FF5A1F] border border-[#0A0A0A] rotate-45 animate-ping" />
          <div className="w-4 h-4 bg-[#FFD700] border border-[#0A0A0A] rotate-12 animate-bounce" />
          <div className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A] -rotate-45" />
        </div>
      )}

      {/* R3F Canvas Container */}
      <div className="w-full h-full relative border-none outline-none bg-transparent pointer-events-none">
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              className="pointer-events-none"
              style={{
                pointerEvents: 'none',
                width: `${canvasW}px`,
                height: `${canvasH}px`,
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
              dpr={[1, 1.5]}
              frameloop={isTabVisible ? 'always' : 'never'}
              camera={{ position: [0, 0.15, 3.2], fov: 38 }}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'low-power',
              }}
            >
              <ambientLight intensity={1.1} color="#FFFFFF" />
              <directionalLight position={[4, 6, 5]} intensity={1.4} color="#FFFFFF" />
              <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#EEF2FA" />

              <group position={[0, -0.42, 0]}>
                <Robot
                  variant="steve"
                  animation={anim}
                  expression={expr}
                  scale={isSquashing ? 0.92 : 1.0}
                  facing={1}
                  accessories={{}}
                  headTrackCursor={!prefersReducedMotion}
                />
              </group>
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      </div>
    </div>
  );
};

export default FixedGutterSteve;
