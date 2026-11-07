import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore, type VisitorGender } from './robotStore';
import { steveVoice, type VoiceCategory } from './steveVoice';
import { SteveSpeechBubble } from './SteveSpeechBubble';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';
import { steveState, type SteveState } from '../lib/steveState';
import type { RobotAnimation, RobotExpression, RobotAccessories } from './types';

// Section default greetings (under 20 characters for fast intro)
const SECTION_GREETINGS: Record<string, { anim: RobotAnimation; expr: RobotExpression; text: string }> = {
  about: { anim: 'idle', expr: 'curious', text: 'Meet Sunny! 👋' },
  work: { anim: 'salute', expr: 'happy', text: 'Featured work! 🚀' },
  skills: { anim: 'idle', expr: 'thinking', text: 'Tech loadout! ⚡' },
  internship: { anim: 'salute', expr: 'focused', text: 'Pro Steve, ready! 👔' },
  github: { anim: 'idle', expr: 'proud', text: 'Green skyline! 📊' },
  stats: { anim: 'cheer', expr: 'happy', text: 'Code stats! 🏆' },
  events: { anim: 'wave', expr: 'excited', text: 'Hackathons! 🎟️' },
  journey: { anim: 'idle', expr: 'curious', text: 'My journey! 🗺️' },
  content: { anim: 'dance', expr: 'excited', text: 'Action & Cut! 🎬' },
  contact: { anim: 'wave', expr: 'happy', text: 'Say hello! ✉️' },
};

// Funny scroll quotes when scrolling fast (never repeating the same one)
const SCROLL_QUOTES = [
  'Warp speed! Hold onto your pixels! 🏎️💨',
  'Surfing through the codebase! 🏄‍♂️✨',
  'Rocket boost engaged! 🚀🔥',
  'Whoosh! Nice scroll velocity! ⚡',
  'Smooth navigation! Keep rolling! 🛹',
  'Aerodynamic Steve in action! 🕶️💨',
];

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
  const [isInFooter, setIsInFooter] = useState(false);

  // Visitor identity state
  const [visitorGender, setVisitorGender] = useState<VisitorGender>(() => robotStore.getState().visitorGender);

  // Dynamic scrolling states for stylish stunts
  const [scrollDirection, setScrollDirection] = useState<'idle' | 'down' | 'up'>('idle');
  const [scrollSpeedFast, setScrollSpeedFast] = useState(false);

  const centerStageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHoverTimeRef = useRef(0);
  const lastScrollQuoteTimeRef = useRef(0);
  const visitedSectionsRef = useRef<Set<string>>(new Set());
  const usedSpeechLinesRef = useRef<Set<string>>(new Set());

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

  // 2. Hide dock Steve when reaching the Footer (Image 3 fix)
  useEffect(() => {
    const footerEl = document.querySelector('footer');
    if (!footerEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsInFooter(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    obs.observe(footerEl);
    return () => obs.disconnect();
  }, []);

  // 3. Subscribe to robotStore updates
  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const state = robotStore.getState();
      setRobotEnabled(state.robotEnabled);
      setIsQuiet(state.isQuiet);
      setStoreAnim(state.steveAnim);
      setStoreExpr(state.steveExpr);
      setStoreBubble(state.speechBubble);
            setVisitorGender(state.visitorGender);

      if (state.activeSection !== activeSection) {
        setActiveSection(state.activeSection);

        // Section greeting
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

  // 4. Center stage movements
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

  // 5. Ambient Lively Pose & Expression Cycle for First-Time Users
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || isQuiet) return;

    const ambientPoses: { anim: RobotAnimation; expr: RobotExpression }[] = [
      { anim: 'wave', expr: 'happy' },
      { anim: 'idle', expr: 'curious' },
      { anim: 'salute', expr: 'proud' },
      { anim: 'flex', expr: 'grin' },
      { anim: 'cheer', expr: 'excited' },
      { anim: 'idle', expr: 'wink' },
      { anim: 'dance', expr: 'enjoying' },
    ];

    let poseIdx = 0;
    const interval = setInterval(() => {
      // Only cycle ambient poses if no speech bubble or center stage active
      if (robotStore.getState().speechBubble || isCenterStage || scrollDirection !== 'idle') return;

      poseIdx = (poseIdx + 1) % ambientPoses.length;
      const next = ambientPoses[poseIdx];
      robotStore.setSteve(next.anim, next.expr);
    }, 6500);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, robotEnabled, isQuiet, isCenterStage, scrollDirection]);

  // 6. Cursor-Aware Interactive Commentary with Personalized Gender Intelligence
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || isQuiet) return;

    const handleMouseOver = (e: MouseEvent) => {
      const now = Date.now();
      // Minimum 4 seconds between contextual comments
      if (now - lastHoverTimeRef.current < 4000) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Identify element by closest semantic markers
      const el = target.closest('a, button, [data-robot-react], img, input, textarea, .shadow-\\[6px_6px_0px_\\#0A0A0A\\], [data-robot-anchor]');
      if (!el) return;

      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

      const { visitorName: name, visitorGender: gender } = robotStore.getState();
      const isWoman = gender === 'woman';
      const isMan = gender === 'man';
      const effectiveName = name || (isWoman ? 'gorgeous' : isMan ? 'king' : 'friend');

      let reaction: { anim: RobotAnimation; expr: RobotExpression; text: string } | null = null;

      if (href.includes('youtube') || ariaLabel.includes('youtube')) {
        reaction = isWoman
          ? { anim: 'dance', expr: 'flirty', text: `Watching Sunny's videos with me, ${effectiveName}? Grab the popcorn! 🎬🍿` }
          : { anim: 'cheer', expr: 'excited', text: `Sunny's YouTube channel, ${effectiveName}! Real edits and campus vlogs! 🎥⚡` };
      } else if (href.includes('instagram') || ariaLabel.includes('instagram')) {
        reaction = isWoman
          ? { anim: 'wave', expr: 'flirty', text: `${effectiveName}, Sunny's Insta DMs are open... but my DMs are open too! 😉💬` }
          : { anim: 'salute', expr: 'happy', text: `Insta is Sunny's fastest channel, ${effectiveName}! Best place to connect! ⚡📱` };
      } else if (href.includes('linkedin') || ariaLabel.includes('linkedin')) {
        reaction = isWoman
          ? { anim: 'salute', expr: 'flirty', text: `Connecting on LinkedIn, ${effectiveName}? Professional and charming! 💼✨` }
          : { anim: 'flex', expr: 'proud', text: `LinkedIn checked daily, ${effectiveName}! Great spot to network! 🤝💼` };
      } else if (text.includes('resume') || href.includes('resume')) {
        reaction = isWoman
          ? { anim: 'salute', expr: 'flirty', text: `Checking Sunny's specs, ${effectiveName}? Wait till you see mine! 📄😏` }
          : { anim: 'salute', expr: 'focused', text: `Solid resume in hand, ${effectiveName}! Full-stack verified! 📄⚡` };
      } else if (text.includes('get in touch') || text.includes('contact') || href.includes('mailto:')) {
        reaction = isWoman
          ? { anim: 'cheer', expr: 'flirty', text: `Slide into the inbox, ${effectiveName}! Or we can just keep talking right here. 💖` }
          : { anim: 'cheer', expr: 'excited', text: `Hit that contact line, ${effectiveName}! Sunny replies fast! ✉️🚀` };
      } else if (el.closest('#skills') || text.includes('react') || text.includes('typescript')) {
        reaction = isWoman
          ? { anim: 'dance', expr: 'flirty', text: `React & TypeScript... high performance! Just like you, ${effectiveName}. ⚡💅` }
          : { anim: 'flex', expr: 'proud', text: `Battle-tested stack, ${effectiveName}! Clean types and high speed! ⚡🛠️` };
      } else if (el.closest('#github') || href.includes('github')) {
        reaction = isWoman
          ? { anim: 'jump', expr: 'flirty', text: `All those green commits, ${effectiveName}... commitment is so attractive! 📊💚` }
          : { anim: 'flex', expr: 'proud', text: `Look at that daily commit streak, ${effectiveName}! Pure discipline! 📊💪` };
      } else if (el.closest('#work')) {
        reaction = isWoman
          ? { anim: 'dance', expr: 'excited', text: `These projects are hot, ${effectiveName}, but your taste is hotter! 🔥✨` }
          : { anim: 'salute', expr: 'focused', text: `Handcrafted architecture, ${effectiveName}! Check out the live links! 🚀💻` };
      } else if (el.closest('#internship')) {
        reaction = isWoman
          ? { anim: 'salute', expr: 'flirty', text: `Industry experience, ${effectiveName}! Building real Web3 protocols. 💼✨` }
          : { anim: 'salute', expr: 'focused', text: `Verified internship & engineering contributions, ${effectiveName}! 💼🚀` };
      } else if (el.closest('#events')) {
        reaction = isWoman
          ? { anim: 'jump', expr: 'flirty', text: `Hackathon trophies! I love a winner, don't you, ${effectiveName}? 🏆😉` }
          : { anim: 'cheer', expr: 'excited', text: `Hackathons and competitive sprints, ${effectiveName}! Built under pressure! 🏆⚡` };
      }

      if (reaction && !usedSpeechLinesRef.current.has(reaction.text)) {
        lastHoverTimeRef.current = now;
        usedSpeechLinesRef.current.add(reaction.text);
        if (usedSpeechLinesRef.current.size > 20) usedSpeechLinesRef.current.clear();
        robotStore.setSteve(reaction.anim, reaction.expr);
        robotStore.showSpeechBubble(reaction.text, 3600);
      }
    };

    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, [prefersReducedMotion, robotEnabled, isQuiet]);

  // 7. Idle Reading Commentary
  useEffect(() => {
    if (prefersReducedMotion || !robotEnabled || isQuiet) return;

    const interval = setInterval(() => {
      if (robotStore.getState().speechBubble) return;

      const lineData = robotStore.getPersonalizedLine();
      if (!usedSpeechLinesRef.current.has(lineData.text)) {
        usedSpeechLinesRef.current.add(lineData.text);
        if (usedSpeechLinesRef.current.size > 25) usedSpeechLinesRef.current.clear();
        robotStore.setSteve(lineData.anim, lineData.expr);
        robotStore.showSpeechBubble(lineData.text, 3800);
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, robotEnabled, isQuiet]);

  // 8. Dynamic Scroll Stunts (Normal upright posture, no sideways tilt)
  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();

    const handleScroll = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = currentY - lastY;
      const velocity = Math.abs(dy) / dt;

      if (dy > 2) {
        setScrollDirection('down');
      } else if (dy < -2) {
        setScrollDirection('up');
      }

      const isFast = velocity > 1.8;
      setScrollSpeedFast(isFast);

      // Trigger occasional funny scroll quote if moving super fast
      if (isFast && now - lastScrollQuoteTimeRef.current > 10000 && !isQuiet) {
        lastScrollQuoteTimeRef.current = now;
        const quote = SCROLL_QUOTES[Math.floor(Math.random() * SCROLL_QUOTES.length)];
        robotStore.setSteve(dy > 0 ? 'flex' : 'jump', 'grin');
        robotStore.showSpeechBubble(quote, 2200);
      }

      lastY = currentY;
      lastTime = now;

      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
      scrollStopTimerRef.current = setTimeout(() => {
        setScrollDirection('idle');
        setScrollSpeedFast(false);
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
    };
  }, [isQuiet]);

  // 9. Window resize and tab visibility
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



  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    robotStore.handleSteveClick();
  };

  // Below 1200px: dock Steve is completely hidden (menu is used)
  if (windowWidth < 1200) return null;

  // In SEATED state (Hero section): Dock Steve is completely unmounted (lives in Hero illustration)
  if (currentSteveState === 'SEATED') return null;

  // In Footer section: Dock Steve is unmounted (SittingSteve lives in Footer dispatch hub)
  if (isInFooter) return null;

  if (!robotEnabled) return null;

  // Dynamic Accessories during scroll stunts
  const activeAccessories: RobotAccessories = {
    sunglasses: scrollDirection !== 'idle' || isCenterStage,
    skateboard: scrollDirection === 'down' && scrollSpeedFast,
    jetpackFlames: scrollDirection === 'up' && scrollSpeedFast,
    magnifyingGlass: activeSection === 'internship' && (storeExpr === 'thinking' || storeExpr === 'curious'),
  };

  // Compute live animation and expression
  const sectionConfig = SECTION_GREETINGS[activeSection] || SECTION_GREETINGS.about;
  let anim: RobotAnimation = storeAnim || (currentSteveState === 'LAUNCHING' ? 'wave' : sectionConfig.anim);
  let expr: RobotExpression = storeExpr || (currentSteveState === 'LAUNCHING' ? 'excited' : sectionConfig.expr);

  if (scrollDirection === 'down') {
    anim = scrollSpeedFast ? 'flex' : 'idle';
    expr = 'grin';
  } else if (scrollDirection === 'up') {
    anim = 'jump';
    expr = 'excited';
  }

  // Compute X Position:
  // Dock Steve is comfortably inset at 32px from left screen edge, so speech bubbles & badges never touch the edge
  let posX = 32;
  if (isCenterStage) {
    posX = Math.round(windowWidth / 2 - 80);
  } else if (activeSection === 'skills') {
    posX = 48;
  } else if (activeSection === 'stats') {
    posX = 56;
  } else if (activeSection === 'journey') {
    posX = Math.min(Math.round(windowWidth * 0.22), 300);
  } else if (activeSection === 'contact') {
    posX = 52;
  }

  // Normal upright posture at all times (zero rotation)
  const stuntTransform = 'translateY(-50%)';

  // Canvas dimensions
  const canvasW = 160;
  const canvasH = 220;

  return (
    <div
      id="robot-steve-dock"
      data-testid="dock-steve"
      className="fixed z-40 select-none pointer-events-auto"
      style={{
        left: `${posX}px`,
        top: '50%',
        transform: stuntTransform,
        width: `${canvasW}px`,
        height: `${canvasH + 45}px`,
        opacity: currentSteveState === 'RETURNING' ? 0.3 : 1,
        transition: isCenterStage
          ? 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s ease-out'
          : 'left 0.6s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s ease-out',
      }}
      aria-label="Steve mascot dock"
    >
      {/* Speech bubble: full sentences, word reveal, reading dwell timer & pause controls */}
      {storeBubble && !isQuiet && (
        <SteveSpeechBubble
          text={storeBubble}
          onDismiss={() => robotStore.clearSpeechBubble()}
          isCenterStage={isCenterStage}
          windowWidth={windowWidth}
          prefersReducedMotion={prefersReducedMotion}
          visitorGender={visitorGender}
          steveX={posX}
        />
      )}

      {/* Wind Lines / Speed Streak when surfing */}
      {scrollDirection === 'down' && (
        <div className="absolute top-1/2 -left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="w-8 h-1 bg-[#FF5A1F] border border-[#0A0A0A] animate-pulse" />
          <div className="w-6 h-1 bg-[#0A0A0A]" />
          <div className="w-9 h-1 bg-[#0047AB] border border-[#0A0A0A] animate-pulse" />
        </div>
      )}

      {/* Upward Rocket Flames when ascending */}
      {scrollDirection === 'up' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
          <div className="w-3 h-5 bg-[#FF5A1F] border border-[#0A0A0A] animate-ping" />
          <div className="w-4 h-6 bg-[#FFD700] border border-[#0A0A0A] animate-bounce" />
          <div className="w-3 h-5 bg-[#0047AB] border border-[#0A0A0A]" />
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
      <div 
        onClick={handleMascotClick}
        className="w-full relative border-none outline-none bg-transparent cursor-pointer"
        style={{ height: `${canvasH}px` }}
        title="Click Steve to chat or trigger stunts! ✨"
      >
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
                  accessories={activeAccessories}
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
