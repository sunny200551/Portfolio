import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { steveVoice, type VoiceCategory } from './steveVoice';
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
  const [isRailHovered, setIsRailHovered] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ hovered: boolean }>;
      setIsRailHovered(custom.detail?.hovered || false);
    };
    window.addEventListener('rail:hover', handler);
    return () => window.removeEventListener('rail:hover', handler);
  }, []);

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

  const [homePlatformPos, setHomePlatformPos] = useState(() => robotStore.getState().homePlatformPos);
  const [homeSeatPos, setHomeSeatPos] = useState(() => robotStore.getState().homeSeatPos);
  const [steveHeroState, setSteveHeroState] = useState<'seated' | 'standing_up' | 'flying' | 'lane'>(() => robotStore.getState().steveHeroState);
  const [isDropLanding, setIsDropLanding] = useState(true);
  const [dropY, setDropY] = useState(-80);
  const [isSquashing, setIsSquashing] = useState(false);
  const [isCoffeeInHand, setIsCoffeeInHand] = useState(true);
  const [hasSunglasses, setHasSunglasses] = useState(true);
  const [hasJetpack, setHasJetpack] = useState(false);
  const [hasFlames, setHasFlames] = useState(false);
  const [flightProgress, setFlightProgress] = useState(0); // 0 to 1
  const [flightParticles, setFlightParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const [notificationDotActive, setNotificationDotActive] = useState(false);
  const [chairClickSpinning, setChairClickSpinning] = useState(false);

  // Sync positions & states from store
  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const state = robotStore.getState();
      const p = state.homePlatformPos;
      if (p.x > 0 && (p.x !== homePlatformPos.x || p.y !== homePlatformPos.y)) {
        setHomePlatformPos(p);
      }
      const sp = state.homeSeatPos;
      if (sp.x > 0 && (sp.x !== homeSeatPos.x || sp.y !== homeSeatPos.y)) {
        setHomeSeatPos(sp);
      }
      if (state.steveHeroState !== steveHeroState) {
        setSteveHeroState(state.steveHeroState);
      }
      if (state.chairSpinActive && !chairClickSpinning) {
        setChairClickSpinning(true);
        setTimeout(() => setChairClickSpinning(false), 900);
      }
    });
    return () => unsub();
  }, [homePlatformPos, homeSeatPos, steveHeroState, chairClickSpinning]);

  // Part 3: Opening sequence (first 2.5s)
  useEffect(() => {
    if (prefersReducedMotion) {
      setDropY(0);
      setIsDropLanding(false);
      return;
    }

    // 1. Drop-in animation: drops from above into chair with bounce
    const dropTimer = setTimeout(() => {
      setDropY(0);
      setIsSquashing(true);
      setTimeout(() => {
        setIsSquashing(false);
        setIsDropLanding(false);
      }, 350);
    }, 450);

    // 2. Greeting bubble: "Sup. I'm Steve. Sunny built me to guard this portfolio."
    const greetTimer = setTimeout(() => {
      setGreetBubble("Sup. I'm Steve. Sunny built me to guard this portfolio.");
      steveVoice.speak('greeting');

      // 3. Stays 3s then shrinks into notification dot
      const bubbleTimer = setTimeout(() => {
        setGreetBubble(null);
        setNotificationDotActive(true);
      }, 3200);

      return () => clearTimeout(bubbleTimer);
    }, 1300);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(greetTimer);
    };
  }, [prefersReducedMotion]);

  // Part 4: Stand-up, jetpack and flight trigger
  // Triggered on scroll > 40px OR after 8s inactivity on the hero
  useEffect(() => {
    if (prefersReducedMotion) return;

    let heroTimeout: ReturnType<typeof setTimeout> | null = null;

    const executeLiftoffSequence = () => {
      if (steveHeroState !== 'seated') return;
      robotStore.setSteveHeroState('standing_up');
      setSteveHeroState('standing_up');

      // Step 1: Puts mug down, flips sunglasses up
      setIsCoffeeInHand(false);
      setHasSunglasses(false);
      setNotificationDotActive(false);

      // Step 2: Anticipation squat (300ms)
      setTimeout(() => {
        setIsSquashing(true);

        // Step 3: Jetpack pops out + flame sparks (600ms)
        setTimeout(() => {
          setHasJetpack(true);
          setHasFlames(true);
          setIsSquashing(false);

          // Step 4: Liftoff & Bezier flight (900ms)
          setTimeout(() => {
            robotStore.setSteveHeroState('flying');
            setSteveHeroState('flying');

            // Flight animation duration ~1000ms
            const startTime = performance.now();
            const flightDuration = 1000;

            const animateFlight = (now: number) => {
              const elapsed = now - startTime;
              const p = Math.min(1, elapsed / flightDuration);
              setFlightProgress(p);

              // Spawn flight particle trail (capped at 25)
              if (Math.random() > 0.4) {
                setFlightParticles((prev) => {
                  const newParticle = {
                    id: Math.random(),
                    x: (Math.random() - 0.5) * 24,
                    y: 40 + Math.random() * 15,
                    color: Math.random() > 0.5 ? '#FF5A1F' : '#FFD700',
                    size: 6 + Math.random() * 6,
                  };
                  return [...prev.slice(-24), newParticle];
                });
              }

              if (p < 1) {
                requestAnimationFrame(animateFlight);
              } else {
                // Step 5: Touchdown in lane
                robotStore.setSteveHeroState('lane');
                setSteveHeroState('lane');
                setHasFlames(false);
                setHasJetpack(false);
                setFlightParticles([]);
                setIsSquashing(true);
                setTimeout(() => setIsSquashing(false), 300);

                // Steve speaks arrival line
                setGreetBubble("Landed in style! What's next? 🚀");
                setTimeout(() => setGreetBubble(null), 3000);
              }
            };

            requestAnimationFrame(animateFlight);
          }, 350);
        }, 300);
      }, 300);
    };

    // 8s timeout trigger
    heroTimeout = setTimeout(() => {
      if (window.scrollY <= 40 && steveHeroState === 'seated') {
        executeLiftoffSequence();
      }
    }, 8000);

    // Scroll listener trigger (> 40px) and return-to-top watcher (< 40px)
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 40) {
        if (steveHeroState === 'seated') {
          executeLiftoffSequence();
        }
      } else if (scrollY <= 20) {
        // Return to top: flies back with jetpack and lands seated on chair!
        if (steveHeroState === 'lane') {
          robotStore.setSteveHeroState('flying');
          setSteveHeroState('flying');
          setHasJetpack(true);
          setHasFlames(true);

          setTimeout(() => {
            robotStore.setSteveHeroState('seated');
            setSteveHeroState('seated');
            setHasJetpack(false);
            setHasFlames(false);
            setIsCoffeeInHand(true);
            setHasSunglasses(true);
            setIsSquashing(true);
            setTimeout(() => setIsSquashing(false), 300);

            // Return greeting
            setGreetBubble("Missed me? ☕");
            setTimeout(() => setGreetBubble(null), 2500);
          }, 900);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (heroTimeout) clearTimeout(heroTimeout);
    };
  }, [prefersReducedMotion, steveHeroState]);
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
          // Step 4: Deep breath + blush animation (NO "Ahem" text)
          setShyStep(4);
          setShyBubble(null);
          robotStore.setSteve('idle', 'shy');
          shySequenceTimerRef.current = setTimeout(() => {
            // Step 5: Speak playful pickup line
            setShyStep(5);
            steveVoice.speak('shy_pickup');
            shySequenceTimerRef.current = setTimeout(() => {
              setShyStep(6);
              setShyBubble(null);
              shySequenceTimerRef.current = setTimeout(() => {
                setShyStep(7);
                shySequenceTimerRef.current = setTimeout(() => {
                  cancelShyMode();
                }, 2000);
              }, 1800);
            }, 4000);
          }, 1800);
        }, 1500);
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
    window.addEventListener('steve:shy-mode', handleShyNow);
    window.addEventListener('robot:shy-mode-toggle', handleShyToggle as EventListener);
    return () => {
      window.removeEventListener('robot:shy-mode-now', handleShyNow);
      window.removeEventListener('steve:shy-mode', handleShyNow);
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

      // First time in this lane greeting and funny commentary
      if (!visitedSectionsRef.current.has(activeSection)) {
        visitedSectionsRef.current.add(activeSection);
        if (activeSection === 'home') {
          steveVoice.speak('greeting');
        } else {
          steveVoice.speak(('section_' + activeSection) as VoiceCategory);
        }
      }

      return () => clearTimeout(timer);
    }
    prevSideRef.current = targetSide;
  }, [activeSection, currentConfig, isMobileOrTablet]);

  // Compute exact position inside reserved lanes
  const { posX, posY, facing, canvasW, canvasH, robotScale } = useMemo(() => {
    const { w, h } = windowDimensions;

    if (isMobileOrTablet) {
      // 72px for mobile head-and-shoulders companion
      const cW = 150;
      const cH = 200;
      const mY = h - 90;
      const isLeft = currentConfig.side === 'left';
      const mX = isLeft ? 10 : w - cW - 10;

      if (steveHeroState === 'seated' && homeSeatPos.x > 0) {
        return {
          posX: Math.max(10, Math.min(w - cW - 10, homeSeatPos.x - cW / 2)),
          posY: Math.max(cH / 2 + 10, homeSeatPos.y - Math.round(cH * 0.35) + dropY),
          facing: 1 as const,
          canvasW: cW,
          canvasH: cH,
          robotScale: 0.95,
        };
      }

      return {
        posX: mX,
        posY: mY,
        facing: (isLeft ? 1 : -1) as (1 | -1),
        canvasW: cW,
        canvasH: cH,
        robotScale: 1.0,
      };
    }

    // Desktop (>= 1024px):
    // Standard canvas: 200px wide x 360px tall (holds ~132px tall robot with zero clipping and tight lane footprint)
    const cW = 200;
    const cH = 360;
    const rScale = 1.0;

    // Center vertically at 50% viewport with slight subtle scroll drift (+/- 36px)
    const restingMiddleY = h * 0.5;
    const driftY = (scrollProgress - 0.5) * 72;
    const clampedY = Math.max(cH / 2 + 10, Math.min(h - cH / 2 - 10, restingMiddleY + driftY));

    // Shy mode override
    if (shyModeActive) {
      if (shyStep === 2 || shyStep === 6) {
        return {
          posX: currentConfig.side === 'left' ? -150 : w - 30,
          posY: clampedY,
          facing: (currentConfig.side === 'left' ? 1 : -1) as (1 | -1),
          canvasW: cW,
          canvasH: cH,
          robotScale: rScale,
        };
      }
    }

    // Hero seated block chair handoff: Steve's pelvis docks to #steve-seat
    const isHeroActive = activeSection === 'home' || scrollProgress < 0.05;
    if (isHeroActive && (steveHeroState === 'seated' || steveHeroState === 'standing_up')) {
      const targetAnchor = homeSeatPos.x > 0 ? homeSeatPos : homePlatformPos;
      if (targetAnchor.x > 0) {
        // Seated height matches chair: ~300px seated height at 1920px wide
        const heroScaleFactor = Math.min(1.7, Math.max(1.25, (w / 1920) * 1.7));
        const heroCW = Math.round(cW * heroScaleFactor);
        const heroCH = Math.round(cH * heroScaleFactor);
        return {
          posX: Math.max(16, Math.min(w - heroCW - 16, targetAnchor.x - heroCW / 2)),
          posY: Math.max(heroCH / 2 + 10, targetAnchor.y - Math.round(heroCH * 0.28) + dropY),
          facing: 1 as const,
          canvasW: heroCW,
          canvasH: heroCH,
          robotScale: isSquashing ? 0.86 : rScale,
        };
      }
    }

    // Part 4 Bezier flight trajectory
    if (steveHeroState === 'flying') {
      const targetAnchor = homeSeatPos.x > 0 ? homeSeatPos : homePlatformPos;
      const startX = targetAnchor.x > 0 ? targetAnchor.x - cW / 2 : w * 0.65;
      const startY = targetAnchor.y > 0 ? targetAnchor.y - Math.round(cH * 0.28) : h * 0.5;
      const destX = currentConfig.side === 'right' ? (w >= 1200 ? w - 210 : w - 160) : -40;
      const destY = clampedY;

      const p = flightProgress;
      const midX = (startX + destX) / 2;
      const midY = Math.min(startY, destY) - 160;

      // Quadratic bezier curve
      const currX = (1 - p) * (1 - p) * startX + 2 * (1 - p) * p * midX + p * p * destX;
      const currY = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * midY + p * p * destY;

      return {
        posX: currX,
        posY: currY,
        facing: (destX > startX ? 1 : -1) as (1 | -1),
        canvasW: cW,
        canvasH: cH,
        robotScale: rScale,
      };
    }

    // PEEK MODE during pinned Work gallery:
    // Steve sits at the left edge: only head and one hand stick out ~56px
    if (activeSection === 'work') {
      return {
        posX: -90,
        posY: clampedY,
        facing: 1 as const,
        canvasW: cW,
        canvasH: cH,
        robotScale: rScale,
      };
    }

    // Reserved lanes positioning:
    // Left lane: STEVE sits comfortably inside left margin (center at 60px)
    // Right lane: STEVE sits inside right lane, strictly >= 12px to the left of the rail (rail at w-52px)
    const isRight = currentConfig.side === 'right';
    let targetX: number;

    if (isRight) {
      const hasRail = w >= 1200;
      if (hasRail) {
        // If rail tooltip is hovered, step aside further smoothly
        targetX = isRailHovered ? w - 280 : w - 210;
      } else {
        targetX = w - 160;
      }
    } else {
      targetX = -40;
    }

    return {
      posX: targetX,
      posY: clampedY,
      facing: (isRight ? -1 : 1) as (1 | -1),
      canvasW: cW,
      canvasH: cH,
      robotScale: isSquashing ? 0.88 : rScale,
    };
  }, [windowDimensions, isMobileOrTablet, currentConfig, scrollProgress, shyModeActive, shyStep, isRailHovered, activeSection, steveHeroState, homeSeatPos, homePlatformPos, dropY, isSquashing, flightProgress]);

  // Compute live animation and expression
  const { liveAnim, liveExpr, liveAccessories } = useMemo(() => {
    if (prefersReducedMotion) {
      return { liveAnim: 'idle' as RobotAnimation, liveExpr: 'happy' as RobotExpression, liveAccessories: {} };
    }

    if (steveHeroState === 'seated') {
      return {
        liveAnim: 'seated' as RobotAnimation,
        liveExpr: (chairClickSpinning ? 'laughing' : (isDropLanding ? 'curious' : 'happy')) as RobotExpression,
        liveAccessories: {
          sunglasses: hasSunglasses,
          coffeeMug: isCoffeeInHand,
        },
      };
    }

    if (steveHeroState === 'standing_up') {
      return {
        liveAnim: 'idle' as RobotAnimation,
        liveExpr: 'focused' as RobotExpression,
        liveAccessories: {
          jetpack: hasJetpack,
          jetpackFlames: hasFlames,
        },
      };
    }

    if (steveHeroState === 'flying' || isCrossing) {
      return {
        liveAnim: 'flight' as RobotAnimation,
        liveExpr: 'excited' as RobotExpression,
        liveAccessories: {
          jetpack: true,
          jetpackFlames: true,
        },
      };
    }

    if (shyModeActive) {
      switch (shyStep) {
        case 1:
          return { liveAnim: 'walk' as RobotAnimation, liveExpr: 'curious' as RobotExpression, liveAccessories: {} };
        case 2:
          return { liveAnim: 'idle' as RobotAnimation, liveExpr: 'shy' as RobotExpression, liveAccessories: {} };
        case 3:
          return { liveAnim: 'idle' as RobotAnimation, liveExpr: 'shy' as RobotExpression, liveAccessories: {} };
        case 4:
          return { liveAnim: 'wave' as RobotAnimation, liveExpr: 'enjoying' as RobotExpression, liveAccessories: {} };
        case 5:
          return { liveAnim: 'salute' as RobotAnimation, liveExpr: 'flirty' as RobotExpression, liveAccessories: {} };
        case 6:
          return { liveAnim: 'facepalm' as RobotAnimation, liveExpr: 'shy' as RobotExpression, liveAccessories: {} };
        case 7:
          return { liveAnim: 'wave' as RobotAnimation, liveExpr: 'happy' as RobotExpression, liveAccessories: {} };
        default:
          return { liveAnim: 'idle' as RobotAnimation, liveExpr: 'happy' as RobotExpression, liveAccessories: {} };
      }
    }

    // Periodic gentle idle wave
    if (idleWaveActive && currentConfig.anim === 'idle') {
      return { liveAnim: 'wave' as RobotAnimation, liveExpr: 'happy' as RobotExpression, liveAccessories: {} };
    }

    return {
      liveAnim: currentConfig.anim,
      liveExpr: currentConfig.expr,
      liveAccessories: {},
    };
  }, [prefersReducedMotion, steveHeroState, chairClickSpinning, isDropLanding, hasSunglasses, isCoffeeInHand, hasJetpack, hasFlames, isCrossing, shyModeActive, shyStep, idleWaveActive, currentConfig]);

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
          data-testid="steve-speech-bubble"
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 min-w-[140px] max-w-[240px] px-3.5 py-2 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-[11px] font-bold text-[#0A0A0A] leading-snug z-40 pointer-events-none text-center"
          style={{
            top: `${Math.round(canvasH * 0.16)}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {/* Speaker Name with Orange Crown Icon */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-[#FF5A1F] border-b border-[#0A0A0A]/20 pb-0.5 mb-1 tracking-wider">
            <span>STEVE</span>
            <span role="img" aria-label="crown">👑</span>
          </div>
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

      {/* Notification Dot: Small orange pulsing badge on chair arm when bubble shrinks */}
      {notificationDotActive && steveHeroState === 'seated' && (
        <div
          className="absolute top-[32%] right-[14%] w-3 h-3 rounded-full bg-[#FF5A1F] border border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] animate-ping pointer-events-none"
          title="Steve's note"
        />
      )}

      {/* Part 4 Flight Flame & Smoke Particles Trail Overlay */}
      {flightParticles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {flightParticles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none border border-[#0A0A0A]"
              style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(60% + ${p.y}px)`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: 'rotate(45deg)',
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {/* R3F Canvas Container */}
      <div className="w-full h-full relative border-none outline-none bg-transparent">
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
              camera={{ position: [0, 0.28, 3.5], fov: 42 }}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'low-power',
              }}
            >
              <ambientLight intensity={1.1} color="#FFFFFF" />
              <directionalLight position={[4, 7, 5]} intensity={1.5} color="#FFFFFF" />
              <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#EEF2FA" />

              <group position={[0, -0.44, 0]}>
                <Robot
                  variant="steve"
                  animation={liveAnim}
                  expression={liveExpr}
                  scale={robotScale}
                  facing={facing}
                  accessories={liveAccessories}
                  headTrackCursor={!prefersReducedMotion && !shyModeActive}
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
