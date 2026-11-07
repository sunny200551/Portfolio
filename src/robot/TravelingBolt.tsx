import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { executeRoutine } from './routines';
import type { RobotAnimation, RobotExpression, RobotAccessories } from './types';
import { CanvasErrorBoundary } from '../components/three/CanvasBoundary';

interface BoltInnerProps {
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

type SideSwitchPhase = 'idle' | 'diving' | 'crossing' | 'surfacing';

const BoltTravelingMesh: React.FC<BoltInnerProps> = ({ isMobile, prefersReducedMotion }) => {
  const { size } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [anim, setAnim] = useState<RobotAnimation>(() => robotStore.getState().boltAnim);
  const [expr, setExpr] = useState<RobotExpression>(() => robotStore.getState().boltExpr);
  const [isFastScrolling, setIsFastScrolling] = useState(() => robotStore.getState().isFastScrolling);

  // Routine states
  const [aboutStage, setAboutStage] = useState(() => robotStore.getState().aboutGradYearStage);
  const [workHover, setWorkHover] = useState(() => robotStore.getState().workCardHover);
  const [hoveredSlab, setHoveredSlab] = useState(() => robotStore.getState().hoveredSlab);

  const [githubStage, setGithubStage] = useState(() => robotStore.getState().githubStage);
  const [statsStage, setStatsStage] = useState(() => robotStore.getState().statsStage);
  const [eventsStage, setEventsStage] = useState(() => robotStore.getState().eventsTicketStage);
  const [journeyYear, setJourneyYear] = useState(() => robotStore.getState().journeyYear);
  const [contactAction, setContactAction] = useState(() => robotStore.getState().contactAction);
  const [contactInputFocus, setContactInputFocus] = useState(() => robotStore.getState().contactInputFocus);
  const [footerSleeping, setFooterSleeping] = useState(() => robotStore.getState().footerSleeping);
  const [backToTopFlying, setBackToTopFlying] = useState(() => robotStore.getState().backToTopFlying);

  // Player Interaction states
  const [isOverheating, setIsOverheating] = useState(() => robotStore.getState().isOverheating);
  const [isIdleSleeping, setIsIdleSleeping] = useState(() => robotStore.getState().isIdleSleeping);
  const [isDanceParty, setIsDanceParty] = useState(() => robotStore.getState().isDanceParty);
  const [isSummonedFriends, setIsSummonedFriends] = useState(() => robotStore.getState().isSummonedFriends);
  const [hoveredReact, setHoveredReact] = useState<string | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1);

  // Position tracking & continuous physical inertia state (in 2D pixels)
  const currentPixelPos = useRef({ x: 70, y: 120 });
  const currentFacingRotY = useRef(0);
  const currentFacingSign = useRef<1 | -1>(1);
  const walkStepAccumulator = useRef(0);

  // Part 5: Obstacle Keep-Out Map
  const obstaclesRef = useRef<{ left: number; top: number; right: number; bottom: number }[]>([]);

  // Side switching via bottom traversal state
  const currentGutterSide = useRef<'left' | 'right' | 'center' | 'header'>('left');
  const targetGutterSide = useRef<'left' | 'right' | 'center' | 'header'>('left');
  const sideSwitchPhase = useRef<SideSwitchPhase>('idle');
  const sideSwitchTimer = useRef(0);

  // Update DOM obstacle keep-out map (header, rail, cards, text with 12px margin)
  useEffect(() => {
    const updateObstacles = () => {
      const obstacles: { left: number; top: number; right: number; bottom: number }[] = [];
      const addRect = (el: Element | null, margin = 12) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          obstacles.push({
            left: r.left - margin,
            top: r.top - margin,
            right: r.right + margin,
            bottom: r.bottom + margin,
          });
        }
      };

      addRect(document.querySelector('header'));
      addRect(document.querySelector('nav.nav-rail'));
      document.querySelectorAll('[data-robot-obstacle], #work [data-card], #journey [data-timeline-card], #about [data-stat-box]').forEach(el => addRect(el, 12));
      obstaclesRef.current = obstacles;
    };

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleDebouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateObstacles, 250);
    };

    window.addEventListener('scroll', handleDebouncedScroll, { passive: true });
    window.addEventListener('resize', updateObstacles, { passive: true });
    updateObstacles();
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleDebouncedScroll);
      window.removeEventListener('resize', updateObstacles);
    };
  }, []);

  // Throttled cursor tracking for elementFromPoint (Part 4) - paused during active scroll
  useEffect(() => {
    let rafId: number;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isScrolling) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const reactTarget = el?.closest('[data-robot-react]')?.getAttribute('data-robot-react') || null;
        setHoveredReact(reactTarget);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafId);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      const state = robotStore.getState();
      setActiveSection(state.activeSection);
      setAnim(state.boltAnim);
      setExpr(state.boltExpr);
      setIsFastScrolling(state.isFastScrolling);
      setAboutStage(state.aboutGradYearStage);
      setWorkHover(state.workCardHover);
      setHoveredSlab(state.hoveredSlab);

      setGithubStage(state.githubStage);
      setStatsStage(state.statsStage);
      setEventsStage(state.eventsTicketStage);
      setJourneyYear(state.journeyYear);
      setContactAction(state.contactAction);
      setContactInputFocus(state.contactInputFocus);
      setFooterSleeping(state.footerSleeping);
      setBackToTopFlying(state.backToTopFlying);

      setIsOverheating(state.isOverheating);
      setIsIdleSleeping(state.isIdleSleeping);
      setIsDanceParty(state.isDanceParty);
      setIsSummonedFriends(state.isSummonedFriends);
    });
    return () => unsubscribe();
  }, []);

  // Trigger section routine when entering a section
  useEffect(() => {
    executeRoutine(activeSection, {
      setAnim: (newAnim) => robotStore.setBolt(newAnim, robotStore.getState().boltExpr),
      setExpr: (newExpr) => robotStore.setBolt(robotStore.getState().boltAnim, newExpr),
    });
  }, [activeSection]);

  // Frame loop for continuous scroll-linked travel, gutter positioning, and walk cycle
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Viewport dimensions in Three.js world units at Z=0
    const vFOV = (34 * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * 7.5;
    const visibleWidth = visibleHeight * (size.width / size.height);

    const windowW = size.width;
    const windowH = size.height;

    // 1. Overall Continuous Scroll Progress (0.0 to 1.0)
    const docScrollH = typeof document !== 'undefined'
      ? Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      : 1;
    const scrollP = typeof window !== 'undefined'
      ? Math.min(1, Math.max(0, window.scrollY / docScrollH))
      : 0;

    // Continuous vertical target: near top at page top, smoothly traveling down to near bottom
    const continuousY = windowH * 0.5;
    void scrollP;

    // 2. Safe Gutters Calculation (outside central content container)
    // Central container is max-w-6xl (1152px) or max-w-7xl (1280px)
    const contentMaxW = 1152;
    const leftMargin = Math.max(0, (windowW - contentMaxW) / 2);
    const rightMargin = leftMargin;

    // Safe Left Gutter X (clear of content, clear of left edge)
    const safeLeftX = windowW >= 1200 ? 50 : Math.max(38, Math.min(leftMargin * 0.45, 120));

    // Safe Right Gutter X (clear of content, safely left of the numbered rail at windowW - 75)
    const safeRightX = windowW - Math.max(88, Math.min(rightMargin * 0.5, 140));

    // Part 5: Obstacle Keep-Out Intersection Helper (12px margin around text/cards/header/rail)
    const intersectsObstacle = (cx: number, cy: number, halfW = 35, halfH = 45) => {
      const boxL = cx - halfW;
      const boxR = cx + halfW;
      const boxT = cy - halfH;
      const boxB = cy + halfH;
      return obstaclesRef.current.some(obs =>
        boxL < obs.right && boxR > obs.left && boxT < obs.bottom && boxB > obs.top
      );
    };

    // Candidate picker: Left gutter -> Right gutter -> Empty strips -> Docked bottom-left
    let nextSide: 'left' | 'right' | 'center' | 'header';

    if (activeSection === 'home') {
      nextSide = 'left';
    } else if (activeSection === 'work') {
      nextSide = 'left';
    } else if (activeSection === 'journey') {
      nextSide = 'center'; // Allowed exception: walks down timeline center gap
    } else {
      const leftClear = safeLeftX > 30 && !intersectsObstacle(safeLeftX, continuousY);
      const rightClear = safeRightX < windowW - 40 && !intersectsObstacle(safeRightX, continuousY);

      if (targetGutterSide.current === 'right' && rightClear) {
        nextSide = 'right';
      } else if (leftClear) {
        nextSide = 'left';
      } else if (rightClear) {
        nextSide = 'right';
      } else {
        nextSide = 'left';
      }
    }

    // Side switching state machine (travels under-screen when changing sides, never across content!)
    if (nextSide !== targetGutterSide.current && nextSide !== 'center' && targetGutterSide.current !== 'center') {
      if ((targetGutterSide.current === 'left' && nextSide === 'right') ||
          (targetGutterSide.current === 'right' && nextSide === 'left')) {
        // Begin under-screen traversal
        sideSwitchPhase.current = 'diving';
        sideSwitchTimer.current = 0;
      }
      targetGutterSide.current = nextSide;
    }

    // Compute target screen coords based on side & section exceptions
    let targetX: number;
    let targetY: number;

    if (backToTopFlying) {
      targetX = windowW * 0.5;
      targetY = -120;
    } else if (windowW < 1024 || leftMargin < 65) {
      // DOCKED IN BOTTOM-RIGHT CORNER ON SCREENS UNDER 1024PX OR NARROW GUTTERS
      targetX = windowW - 55;
      targetY = windowH - 55;
    } else if (activeSection === 'home') {
      // HERO PLATFORM: Allowed exception (Part 5)
      const homePos = robotStore.getState().homePlatformPos;
      if (homePos && homePos.x > 0) {
        targetX = homePos.x;
        targetY = homePos.y;
      } else {
        targetX = safeLeftX;
        targetY = windowH * 0.45;
      }
    } else if (activeSection === 'work') {
      targetX = safeLeftX;
      targetY = continuousY;
    } else if (activeSection === 'journey') {
      // JOURNEY TIMELINE: Allowed exception - walks down vertical timeline line (~70px wide gap)
      const journeyEl = document.getElementById('journey');
      if (journeyEl) {
        const top = journeyEl.offsetTop - (window.scrollY || 0);
        const h = journeyEl.offsetHeight || 800;
        targetX = windowW * 0.5;
        const journeyScrollP = THREE.MathUtils.clamp((windowH * 0.5 - top) / Math.max(1, h), 0, 1);
        targetY = THREE.MathUtils.clamp(top + journeyScrollP * h, 90, windowH - 90);
      } else {
        targetX = safeLeftX;
        targetY = continuousY;
      }
    } else {
      // Standard safe gutter position (Left or Right)
      if (targetGutterSide.current === 'right') {
        targetX = safeRightX;
      } else {
        targetX = safeLeftX;
      }
      targetY = continuousY;
    }

    // Handle under-screen side-switching traversal
    if (sideSwitchPhase.current === 'diving') {
      // Dive below bottom of viewport
      targetY = windowH + 130;
      if (currentPixelPos.current.y > windowH + 80) {
        // Jump horizontally while invisible below screen
        currentPixelPos.current.x = targetX;
        currentGutterSide.current = targetGutterSide.current;
        sideSwitchPhase.current = 'surfacing';
      }
    } else if (sideSwitchPhase.current === 'surfacing') {
      // Surface back to target Y on new side
      if (Math.abs(currentPixelPos.current.y - targetY) < 25) {
        sideSwitchPhase.current = 'idle';
      }
    }

    // Physical Inertia: lag slightly behind scroll, then catch up smoothly
    const posDamp = prefersReducedMotion ? 20 : 5.5;
    const prevX = currentPixelPos.current.x;
    const prevY = currentPixelPos.current.y;

    currentPixelPos.current.x = THREE.MathUtils.damp(currentPixelPos.current.x, targetX, posDamp, delta);
    currentPixelPos.current.y = THREE.MathUtils.damp(currentPixelPos.current.y, targetY, posDamp, delta);

    // True Walk Cycle Physics (step in sync with distance moved, body bobs, direction facing)
    const moveDx = currentPixelPos.current.x - prevX;
    const moveDy = currentPixelPos.current.y - prevY;
    const moveDist = Math.hypot(moveDx, moveDy);

    let bodyBob = 0;
    if (moveDist > 0.4 && !prefersReducedMotion) {
      walkStepAccumulator.current += moveDist * 0.08;
      bodyBob = Math.abs(Math.sin(walkStepAccumulator.current * 2)) * 0.035;
    }

    // PART 7 & FACING FIX: Single source of truth helper
    const contentCenterX = windowW * 0.5;
    const isWalking = moveDist > 0.4;
    const velocityX = moveDx;

    let facingSign: 1 | -1;
    let targetRotY: number;

    if (isWalking && Math.abs(velocityX) > 0.8) {
      if (velocityX > 0) {
        facingSign = 1;
        targetRotY = Math.PI * 0.35; // Turn right to face travel direction
      } else {
        facingSign = -1;
        targetRotY = -Math.PI * 0.35; // Turn left to face travel direction
      }
    } else {
      // Stationary or vertical scroll: face inward toward content (no negative scale.x!)
      if (currentPixelPos.current.x < contentCenterX) {
        facingSign = 1;
        targetRotY = Math.PI * 0.18; // In left gutter: face right toward content (+1)
      } else {
        facingSign = -1;
        targetRotY = -Math.PI * 0.18; // In right gutter: face left toward content (-1)
      }
    }

    if (currentFacingSign.current !== facingSign) {
      currentFacingSign.current = facingSign;
      setFacing(facingSign);
    }
    currentFacingRotY.current = THREE.MathUtils.damp(currentFacingRotY.current, targetRotY, 8, delta);

    // Convert 2D pixel coordinates to 3D world coordinates
    const worldX = ((currentPixelPos.current.x / windowW) - 0.5) * visibleWidth;
    const worldY = (-(currentPixelPos.current.y / windowH) + 0.5) * visibleHeight + bodyBob;

    groupRef.current.position.set(worldX, worldY, 0);
    groupRef.current.rotation.y = currentFacingRotY.current;

    // Report 2D screen coordinates for click button and speech bubble
    robotStore.setBoltScreenPos(currentPixelPos.current.x, currentPixelPos.current.y, true);
  });

  // Scale: small when docked (<1024px: ~48px tall), compact in Journey, full size in side gutters
  const isNarrowGutter = size.width < 1280 && size.width >= 1024;
  const isDockedCorner = size.width < 1024;
  const yearScaleMultiplier = (activeSection === 'journey' && journeyYear === '2023') ? 0.72 : 1.0;

  let baseScale = 0.9;
  if (isDockedCorner) {
    baseScale = 0.52; // ~48px tall
  } else if (isNarrowGutter) {
    baseScale = 0.68;
  } else if (activeSection === 'home') {
    baseScale = 0.62; // Fit plain grey platform floor perfectly
  } else if (activeSection === 'journey') {
    baseScale = 0.58; // Scaled to fit neatly in the 4rem gap between cards without covering text
  }

  const boltScale = baseScale * yearScaleMultiplier;

  // Active expression & animation computation (Part 4 Cursor Reactions + Routines)
  let effectiveAnim: RobotAnimation = anim;
  let effectiveExpr: RobotExpression = expr;

  if (prefersReducedMotion) {
    effectiveAnim = 'idle';
    effectiveExpr = 'happy';
  } else if (isOverheating) {
    effectiveAnim = 'spin';
    effectiveExpr = 'dizzy';
  } else if (isDanceParty) {
    effectiveAnim = 'dance';
    effectiveExpr = 'excited';
  } else if (isIdleSleeping) {
    effectiveAnim = 'sleep';
    effectiveExpr = 'sleepy';
  } else if (backToTopFlying) {
    effectiveAnim = 'jump';
    effectiveExpr = 'excited';
  } else if (isFastScrolling) {
    effectiveAnim = 'dizzy';
    effectiveExpr = 'dizzy';
  }
  // PART 4: Cursor-aware reactions (all happy / funny, zero sad)
  else if (hoveredReact === 'work:card') {
    effectiveAnim = 'idle';
    effectiveExpr = 'curious';
  } else if (hoveredReact === 'skills:slab') {
    effectiveAnim = 'dance';
    effectiveExpr = 'excited';
  } else if (hoveredReact === 'github:skyline') {
    effectiveAnim = 'jump';
    effectiveExpr = 'happy';
  } else if (hoveredReact === 'stats:badge') {
    effectiveAnim = 'cheer';
    effectiveExpr = 'excited';
  } else if (hoveredReact === 'stats:card') {
    effectiveAnim = 'flex';
    effectiveExpr = 'grin';
  } else if (hoveredReact === 'events:ticket') {
    effectiveAnim = 'cheer';
    effectiveExpr = 'excited';
  } else if (hoveredReact === 'journey:node') {
    effectiveAnim = 'jump';
    effectiveExpr = 'happy';
  } else if (hoveredReact === 'contact:send') {
    effectiveAnim = 'cheer';
    effectiveExpr = 'excited';
  } else if (hoveredReact === 'contact:copy-email') {
    effectiveAnim = 'salute';
    effectiveExpr = 'grin';
  } else if (hoveredReact === 'footer:back-to-top') {
    effectiveAnim = 'jump';
    effectiveExpr = 'excited';
  }
  // Section-specific routines
  else if (activeSection === 'about') {
    if (aboutStage === 'glitch') {
      effectiveAnim = 'idle';
      effectiveExpr = 'curious';
    } else if (aboutStage === 'facepalm') {
      effectiveAnim = 'facepalm';
      effectiveExpr = 'curious';
    } else if (aboutStage === 'settled') {
      effectiveAnim = 'cheer';
      effectiveExpr = 'excited';
    }
  } else if (activeSection === 'work') {
    if (workHover) {
      if (workHover.isTodoScreenshot) {
        effectiveAnim = 'shrug';
        effectiveExpr = 'curious';
      } else {
        effectiveAnim = 'idle';
        effectiveExpr = 'curious'; // Curious reaction, looking at hovered card
      }
    } else {
      effectiveAnim = 'walk';
      effectiveExpr = 'happy';
    }
  } else if (activeSection === 'skills') {
    if (hoveredSlab) {
      effectiveAnim = 'dance';
      effectiveExpr = 'excited';
    } else {
      effectiveAnim = 'idle';
      effectiveExpr = 'happy';
    }
  } else if (activeSection === 'github') {
    if (githubStage === 'hopping') {
      effectiveAnim = 'jump';
      effectiveExpr = 'happy';
    } else if (githubStage === 'planting') {
      effectiveAnim = 'salute';
      effectiveExpr = 'focused';
    } else if (githubStage === 'pushing') {
      effectiveAnim = 'walk';
      effectiveExpr = 'focused';
    } else {
      effectiveAnim = 'cheer';
      effectiveExpr = 'excited';
    }
  } else if (activeSection === 'stats') {
    if (statsStage === 'dumbbell') {
      effectiveAnim = 'jump';
      effectiveExpr = 'focused';
    } else if (statsStage === 'badges') {
      effectiveAnim = 'cheer';
      effectiveExpr = 'wink';
    } else if (statsStage === 'lockedFlex') {
      effectiveAnim = 'flex';
      effectiveExpr = 'grin'; // Comic flexing gag followed by grin!
    } else {
      effectiveAnim = 'shrug';
      effectiveExpr = 'curious';
    }
  } else if (activeSection === 'events') {
    if (eventsStage === 'inspecting') {
      effectiveAnim = 'dance';
      effectiveExpr = 'focused';
    } else {
      effectiveAnim = 'cheer';
      effectiveExpr = 'excited';
    }
  } else if (activeSection === 'journey') {
    if (journeyYear === '2023') {
      effectiveAnim = 'walk';
      effectiveExpr = 'curious';
    } else if (journeyYear === '2024') {
      effectiveAnim = 'flex';
      effectiveExpr = 'grin';
    } else if (journeyYear === '2025') {
      effectiveAnim = 'salute';
      effectiveExpr = 'happy';
    } else {
      effectiveAnim = 'jump'; // Victory finish pose at end of journey
      effectiveExpr = 'excited';
    }
  } else if (activeSection === 'contact') {
    if (contactAction === 'rocket') {
      effectiveAnim = 'cheer';
      effectiveExpr = 'excited';
    } else if (contactAction === 'cheer') {
      effectiveAnim = 'cheer';
      effectiveExpr = 'wink';
    } else if (contactInputFocus) {
      effectiveAnim = 'idle';
      effectiveExpr = 'focused';
    } else {
      effectiveAnim = 'dance';
      effectiveExpr = 'focused';
    }
  } else if (activeSection === 'footer') {
    effectiveAnim = 'sleep';
    effectiveExpr = 'sleepy';
  }

  // Active accessories (with magnifying glass in near hand during Work hover)
  const accessories: RobotAccessories = {
    skateboard: activeSection === 'work' && !workHover && !isMobile,
    magnifyingGlass: activeSection === 'work' && Boolean(workHover) && !isMobile,
    flag: activeSection === 'github' && (githubStage === 'planting' || githubStage === 'satisfied') && !isMobile,
    gitPushBox: activeSection === 'github' && githubStage === 'pushing' && !isMobile,
    dumbbell: (activeSection === 'stats' && statsStage === 'dumbbell' || hoveredReact === 'stats:card') && !isMobile,
    chestBadges: (activeSection === 'stats' && (statsStage === 'badges' || statsStage === 'lockedFlex' || statsStage === 'shrug') || hoveredReact === 'stats:badge') && !isMobile,
    stamp: activeSection === 'events' && eventsStage === 'inspecting' && !isMobile,
    trophy: activeSection === 'events' && eventsStage === 'trophy' && !isMobile,
    confetti: ((activeSection === 'events' && eventsStage === 'trophy') || isDanceParty) && !isMobile,
    trainingWheels: activeSection === 'journey' && journeyYear === '2023' && !isMobile,
    backpack: activeSection === 'journey' && journeyYear === '2025' && !isMobile,
    jetpack: ((activeSection === 'journey' && journeyYear === '2026') || backToTopFlying) && !isMobile,
    hardHat: activeSection === 'contact' && !isMobile,
    hammer: activeSection === 'contact' && contactAction === 'building' && !isMobile,
    paperRocket: (activeSection === 'contact' && contactAction === 'rocket' || hoveredReact === 'contact:send') && !isMobile,
    zzzBubble: (activeSection === 'footer' || footerSleeping || isIdleSleeping) && !isMobile && !backToTopFlying,
    steam: isOverheating && !isMobile,
  };

  return (
    <group ref={groupRef}>
      {/* Main Traveling BOLT Robot with single source of truth facing */}
      <Robot
        variant="bolt"
        animation={effectiveAnim}
        expression={effectiveExpr}
        scale={boltScale}
        facing={facing}
        headTrackCursor={!prefersReducedMotion && !isFastScrolling && effectiveAnim !== 'facepalm' && effectiveAnim !== 'sleep' && !isOverheating}
        accessories={accessories}
      />

      {/* Chase Gag & Konami Party: NUT and CHIP join BOLT (Desktop Only) */}
      {(isSummonedFriends || isDanceParty) && !isMobile && !prefersReducedMotion && (
        <>
          <group position={[-0.72, 0, 0]}>
            <Robot
              variant="nut"
              animation={isDanceParty ? 'dance' : 'run'}
              expression={isDanceParty ? 'excited' : 'focused'}
              scale={boltScale * 0.85}
              headTrackCursor={true}
            />
          </group>

          <group position={[0.72, 0, 0]}>
            <Robot
              variant="chip"
              animation={isDanceParty ? 'dance' : 'run'}
              expression={isDanceParty ? 'excited' : 'happy'}
              scale={boltScale * 0.8}
              headTrackCursor={true}
            />
          </group>
        </>
      )}
    </group>
  );
};

export const TravelingBolt: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [activeSection, setActiveSection] = useState(() => robotStore.getState().activeSection);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);
  const [speechBubble, setSpeechBubble] = useState(() => robotStore.getState().speechBubble);
  const [boltPos, setBoltPos] = useState(() => robotStore.getState().boltScreenPos);
  const [isTabVisible, setIsTabVisible] = useState(() => 
    typeof document !== 'undefined' ? !document.hidden : true
  );

  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
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
      setBoltPos(state.boltScreenPos);
    });
    return () => unsubscribe();
  }, []);

  if (!robotEnabled) {
    return null;
  }

  const isHome = activeSection === 'home';

  return (
    <>
      {/* Persistent Fixed Overlay Canvas at z-index 25 (above sections, below navigation rails & modals) */}
      <div 
        className={`fixed inset-0 pointer-events-none z-25 overflow-hidden transition-opacity duration-300 ${
          isHome ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              className="pointer-events-none"
              style={{ pointerEvents: 'none' }}
              dpr={[1, 1.5]}
              frameloop={isTabVisible && !isHome ? 'always' : 'never'}
              camera={{ position: [0, 0, 7.5], fov: 34 }}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance',
              }}
            >
              <ambientLight intensity={0.9} color="#FFFFFF" />
              <directionalLight position={[6, 9, 7]} intensity={1.4} color="#FFFFFF" />
              <directionalLight position={[-5, -4, -3]} intensity={0.4} color="#EEF2FA" />

              <BoltTravelingMesh isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      </div>

      {/* Real Interactive Button over BOLT */}
      {!isHome && boltPos.visible && boltPos.x > 0 && (
        <button
          onClick={() => {
            robotStore.handleBoltClick();
          }}
          tabIndex={-1}
          aria-label="Interact with Bolt Robot"
          style={{
            position: 'fixed',
            left: `${boltPos.x - (isMobile ? 25 : 35)}px`,
            top: `${boltPos.y - (isMobile ? 35 : 55)}px`,
            width: isMobile ? '50px' : '70px',
            height: isMobile ? '70px' : '110px',
            cursor: 'pointer',
            zIndex: 30,
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
          className="focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        />
      )}

      {/* Neo-brutalist Speech Bubble */}
      {!isHome && speechBubble && boltPos.visible && boltPos.x > 0 && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.max(180, Math.min(boltPos.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 180))}px`,
            top: `${boltPos.y - (isMobile ? 95 : 135)}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
          className="max-w-[280px] sm:max-w-[340px] px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs font-bold text-[#0A0A0A] text-center leading-snug"
        >
          <span>{speechBubble}</span>
          <div 
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #0A0A0A',
            }}
          />
          <div 
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #FFFFFF',
            }}
          />
        </div>
      )}
    </>
  );
};

export default TravelingBolt;
