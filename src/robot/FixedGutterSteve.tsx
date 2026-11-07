import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { steveVoice, type VoiceCategory } from './steveVoice';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';
import { steveState, type SteveState } from '../lib/steveState';
import type { RobotAnimation, RobotExpression } from './types';

// Section default greetings (under 20 characters for fast intro)
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
  const [isQuiet, setIsQuiet] = useState(() => robotStore.getState().isQuiet);
  const [storeBubble, setStoreBubble] = useState<string | null>(() => robotStore.getState().speechBubble);
  const [storeAnim, setStoreAnim] = useState<RobotAnimation>(() => robotStore.getState().steveAnim);
  const [storeExpr, setStoreExpr] = useState<RobotExpression>(() => robotStore.getState().steveExpr);
  const [isCenterStage, setIsCenterStage] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true));
  const [isSquashing, setIsSquashing] = useState(false);
  const [isLandingPuff, setIsLandingPuff] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));

  const centerStageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHoverTimeRef = useRef(0);
  const lastScrollVelocityRef = useRef(0);
  const visitedSectionsRef = useRef<Set<string>>(new Set());

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // 1. Subscribe to Steve handoff state machine
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

  // 2. Subscribe to robotStore updates (commands, expressions, speech bubbles, animations)
  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const state = robotStore.getState();
      setRobotEnabled(state.robotEnabled);
      setIsQuiet(state.isQuiet);
      setStoreAnim(state.steveAnim);
      setStoreExpr(state.steveExpr);
      setStoreBubble(state.speechBubble);

      if (state.activeSection !== activeSection) {
        setActiveSection(state.activeSection);

        // First-time visit greeting per section
        if (state.activeSection !== 'home' && !visitedSectionsRef.current.has(state.activeSection)) {
          visitedSectionsRef.current.add(state.activeSection);
          const cfg = SECTION_GREETINGS[state.activeSection];
          if (cfg && !state.isQuiet && !state.speechBubble) {
            robotStore.showSpeechBubble(cfg.text, 2500);
            steveVoice.speak(('section_' + state.activeSection) as VoiceCategory);
          }
        }
      }
    });
    return unsub;
  }, [activeSection]);

  // 3. Listen for Center Stage / Flirt Events
  const triggerCenterMovement = useCallback((durationMs = 4000) => {
    if (centerStageTimerRef.current) clearTimeout(centerStageTimerRef.current);
    setIsCenterStage(true);
    centerStageTimerRef.current = setTimeout(() => {
      setIsCenterStage(false);
    }, durationMs);
  }, []);

  useEffect(() => {
    const handleMiddle = () => triggerCenterMovement(4500);
    const handleFlirt = () => triggerCenterMovement(4000);
    const handleShy = () => triggerCenterMovement(3500);

    window.addEventListener('steve:middle', handleMiddle);
    window.addEventListener('steve:flirt', handleFlirt);
    window.addEventListener('steve:shy-mode', handleShy);

    return () => {
      window.removeEventListener('steve:middle', handleMiddle);
      window.removeEventListener('steve:flirt', handleFlirt);
      window.removeEventListener('steve:shy-mode', handleShy);
      if (centerStageTimerRef.current) clearTimeout(centerStageTimerRef.current);
    };
  }, [triggerCenterMovement]);

  // 4. Cursor-Aware Interactive Commentary (Throttled flirty element awareness)
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || isQuiet) return;

    const handleMouseOver = (e: MouseEvent) => {
      const now = Date.now();
      // At least 7 seconds between automatic cursor commentary
      if (now - lastHoverTimeRef.current < 7000) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Identify element by closest semantic markers
      const el = target.closest('a, button, [data-robot-react], img, input, textarea, .shadow-\\[6px_6px_0px_\\#0A0A0A\\]');
      if (!el) return;

      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

      let reaction: { anim: RobotAnimation; expr: RobotExpression; text: string } | null = null;

      if (href.includes('instagram') || ariaLabel.includes('instagram')) {
        reaction = { anim: 'wave', expr: 'flirty', text: 'Insta DMs are Sunny’s fastest reply channel! 💬😉' };
      } else if (href.includes('linkedin') || ariaLabel.includes('linkedin')) {
        reaction = { anim: 'salute', expr: 'happy', text: 'Active on LinkedIn daily! Drop him a message! 💼✨' };
      } else if (text.includes('resume') || href.includes('resume')) {
        reaction = { anim: 'salute', expr: 'flirty', text: 'Checking his specs? Wait till you see mine! 📄😏' };
      } else if (text.includes('get in touch') || text.includes('contact') || href.includes('mailto:')) {
        reaction = { anim: 'cheer', expr: 'excited', text: 'Slide into his inbox! He replies super fast! 💌🔥' };
      } else if (el.closest('#skills') || text.includes('react') || text.includes('typescript')) {
        reaction = { anim: 'flex', expr: 'grin', text: 'React & TypeScript... high performance! My type. ⚡💅' };
      } else if (el.closest('#github') || href.includes('github')) {
        reaction = { anim: 'flex', expr: 'proud', text: 'Look at that green skyline! That’s commitment. 📊💚' };
      } else if (el.closest('#work')) {
        reaction = { anim: 'dance', expr: 'excited', text: 'These projects are hot, but your taste is hotter! 🚀🔥' };
      }

      if (reaction) {
        lastHoverTimeRef.current = now;
        robotStore.setSteve(reaction.anim, reaction.expr);
        robotStore.showSpeechBubble(reaction.text, 3400);
      }
    };

    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, [prefersReducedMotion, robotEnabled, isQuiet]);

  // 5. Scroll velocity monitoring for funny speed reaction
  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();

    const checkVelocity = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = Math.abs(window.scrollY - lastY);
      const velocity = dy / dt;

      if (velocity > 2.2 && now - lastScrollVelocityRef.current > 12000 && !isQuiet) {
        lastScrollVelocityRef.current = now;
        robotStore.setSteve('spin', 'dizzy');
        robotStore.showSpeechBubble('Whoa, speed demon! Hold on tight! 🏎️💨', 2800);
      }

      lastY = window.scrollY;
      lastTime = now;
    };

    window.addEventListener('scroll', checkVelocity, { passive: true });
    return () => window.removeEventListener('scroll', checkVelocity);
  }, [isQuiet]);

  // 6. Window resize and tab visibility
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleVisibility = () => setIsTabVisible(!document.hidden);

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Steve click handler
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    robotStore.handleSteveClick();
  };

  // Below 1200px: dock Steve is completely hidden (menu is used)
  if (windowWidth < 1200) return null;

  // In SEATED state (Hero section): Dock Steve is completely unmounted (lives in Hero illustration)
  if (currentSteveState === 'SEATED') return null;

  if (!robotEnabled) return null;

  // Compute live animation and expression
  const sectionConfig = SECTION_GREETINGS[activeSection] || SECTION_GREETINGS.about;
  const anim: RobotAnimation = storeAnim || (currentSteveState === 'LAUNCHING' ? 'wave' : sectionConfig.anim);
  const expr: RobotExpression = storeExpr || (currentSteveState === 'LAUNCHING' ? 'excited' : sectionConfig.expr);

  // Compute X Position:
  // - Default left edge dock: 16px (inside 168px lane)
  // - Skills: steps out to 44px
  // - Stats: 56px
  // - Journey: stylish center-left strut (clamp(24px, 20vw, 300px))
  // - Contact: 50px
  // - Center Stage moment: middle of viewport (windowWidth / 2 - 80px)
  let posX = 16;
  if (isCenterStage) {
    posX = Math.round(windowWidth / 2 - 80);
  } else if (activeSection === 'skills') {
    posX = 44;
  } else if (activeSection === 'stats') {
    posX = 56;
  } else if (activeSection === 'journey') {
    posX = Math.min(Math.round(windowWidth * 0.22), 300);
  } else if (activeSection === 'contact') {
    posX = 50;
  }

  // Canvas dimensions
  const canvasW = 160;
  const canvasH = 220;

  return (
    <div
      id="robot-steve-dock"
      data-testid="dock-steve"
      onClick={handleMascotClick}
      className="fixed z-40 select-none pointer-events-auto cursor-pointer"
      style={{
        left: `${posX}px`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${canvasW}px`,
        height: `${canvasH}px`,
        opacity: currentSteveState === 'RETURNING' ? 0.3 : 1,
        transition: isCenterStage
          ? 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s ease-out, transform 0.4s ease-out'
          : 'left 0.6s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s ease-out, transform 0.4s ease-out',
      }}
      title="Click me to chat with Steve! ✨"
      aria-label="Steve mascot dock"
    >
      {/* Speech bubble: positioned strictly ABOVE Steve's head with downward tail */}
      {storeBubble && !isQuiet && (
        <div
          data-testid="steve-speech-bubble"
          className="absolute z-50 pointer-events-none bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] px-3 py-2 text-center font-mono text-[11px] font-bold text-[#0A0A0A] leading-tight"
          style={{
            left: isCenterStage ? '50%' : '0px',
            transform: isCenterStage ? 'translateX(-50%)' : 'none',
            bottom: 'calc(100% - 10px)',
            width: '170px',
            maxWidth: '170px',
            wordBreak: 'break-word',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-[#FF5A1F] border-b border-[#0A0A0A]/20 pb-0.5 mb-1 tracking-wider">
            <span>STEVE</span>
            <span>⚡😉</span>
          </div>

          <span>{storeBubble}</span>

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
