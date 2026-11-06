import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Robot } from './Robot';
import { robotStore } from './robotStore';
import { executeRoutine } from './routines';
import type { RobotAnimation, RobotExpression, RobotAccessories } from './types';

interface BoltInnerProps {
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

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
  const [designStage, setDesignStage] = useState(() => robotStore.getState().designStage);
  const [hoveredSlab, setHoveredSlab] = useState(() => robotStore.getState().hoveredSlab);

  const [githubStage, setGithubStage] = useState(() => robotStore.getState().githubStage);
  const [statsStage, setStatsStage] = useState(() => robotStore.getState().statsStage);
  const [eventsStage, setEventsStage] = useState(() => robotStore.getState().eventsTicketStage);
  const [journeyYear, setJourneyYear] = useState(() => robotStore.getState().journeyYear);
  const [contactAction, setContactAction] = useState(() => robotStore.getState().contactAction);
  const [contactInputFocus, setContactInputFocus] = useState(() => robotStore.getState().contactInputFocus);
  const [footerSleeping, setFooterSleeping] = useState(() => robotStore.getState().footerSleeping);
  const [backToTopFlying, setBackToTopFlying] = useState(() => robotStore.getState().backToTopFlying);

  // Task 5 Player Interaction states
  const [isOverheating, setIsOverheating] = useState(() => robotStore.getState().isOverheating);
  const [isIdleSleeping, setIsIdleSleeping] = useState(() => robotStore.getState().isIdleSleeping);
  const [isDanceParty, setIsDanceParty] = useState(() => robotStore.getState().isDanceParty);
  const [isSummonedFriends, setIsSummonedFriends] = useState(() => robotStore.getState().isSummonedFriends);

  // Position tracking & continuous organic flight arc state
  const prevSectionRef = useRef(activeSection);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const flightStartPos = useRef(new THREE.Vector3(0, 0, 0));
  const flightTargetPos = useRef(new THREE.Vector3(0, 0, 0));
  const flightTime = useRef(1); // 1 = landed, < 1 = in flight
  const flightDuration = 0.75; // Smooth arc travel duration

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
      setDesignStage(state.designStage);
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

  // When active section changes, initiate smooth arc flight across the site
  useEffect(() => {
    if (activeSection !== prevSectionRef.current) {
      prevSectionRef.current = activeSection;
      flightStartPos.current.copy(currentPos.current);
      flightTime.current = 0; // Trigger flight arc

      if (!prefersReducedMotion) {
        robotStore.setBolt('jump', 'excited');
      }
    }
  }, [activeSection, prefersReducedMotion]);

  // Frame loop for world position mapping, organic wandering, and smooth travel
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const tClock = state.clock.getElapsedTime();

    // Viewport dimensions in Three.js world units at Z=0
    const vFOV = (34 * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * 7.5;
    const visibleWidth = visibleHeight * (size.width / size.height);

    // Compute target screen coords based on section anchors and organic wandering
    // Organic exploration offset: smoothly wanders left and right across open areas
    const wanderX = prefersReducedMotion ? 0 : Math.sin(tClock * 0.4) * (size.width * 0.16);
    const wanderY = prefersReducedMotion ? 0 : Math.cos(tClock * 0.6) * 14;

    // Default: natural floating position in open safe margins (not stuck in top right)
    let targetScreenX = (size.width * 0.5) + wanderX;
    let targetScreenY = (size.height * 0.72) + wanderY;

    if (backToTopFlying) {
      // Rapid upward rocket flight toward hero
      targetScreenX = size.width * 0.5;
      targetScreenY = -120; // Rocket shoots above top of screen!
    } else if (!isMobile) {
      if (activeSection === 'home') {
        // Platform front lip position on hero
        const homePos = robotStore.getState().homePlatformPos;
        if (homePos && homePos.x > 0) {
          targetScreenX = homePos.x;
          targetScreenY = homePos.y;
        } else {
          targetScreenX = size.width * 0.68;
          targetScreenY = size.height * 0.62;
        }
      } else if (activeSection === 'about') {
        // Sits on top of the stat boxes, gently inspecting left and right
        const statsEl = document.querySelector('[data-robot-anchor="about:stats"]') || document.querySelector('[data-robot-anchor="about:heading"]');
        if (statsEl) {
          const rect = statsEl.getBoundingClientRect();
          const sideShift = Math.sin(tClock * 0.5) * (rect.width * 0.35);
          targetScreenX = rect.left + rect.width * 0.5 + sideShift;
          targetScreenY = rect.top - 24;
        }
      } else if (activeSection === 'work') {
        // Skateboard along top edge of project cards with scroll velocity
        if (workHover && workHover.screenX > 0) {
          targetScreenX = workHover.screenX;
          targetScreenY = workHover.screenY - 20;
        } else {
          const workEl = document.querySelector('[data-robot-anchor="work:header"]') || document.getElementById('work');
          if (workEl) {
            const rect = workEl.getBoundingClientRect();
            const scrollOffset = (robotStore.getState().scrollVelocity || 0) * 2;
            const patrolX = Math.sin(tClock * 0.8) * 120;
            targetScreenX = rect.left + 240 + scrollOffset + patrolX;
            targetScreenY = rect.top + 70;
          }
        }
      } else if (activeSection === 'design') {
        // Moves to active stage card with 8px-grid snap feel
        const stageEl = document.querySelector(`[data-robot-anchor="design:${designStage}"]`) || document.querySelector('[data-robot-anchor="design:header"]');
        if (stageEl) {
          const rect = stageEl.getBoundingClientRect();
          const rawX = rect.left + rect.width * 0.5;
          const rawY = rect.top - 25;
          targetScreenX = Math.round(rawX / 8) * 8;
          targetScreenY = Math.round(rawY / 8) * 8;
        }
      } else if (activeSection === 'skills') {
        // Climbs slabs like stairs or hops onto hovered slab
        const skillsEl = document.querySelector('[data-robot-anchor="skills:tag"]') || document.getElementById('skills');
        if (skillsEl) {
          const rect = skillsEl.getBoundingClientRect();
          if (hoveredSlab) {
            const slabCol = (hoveredSlab.index % 3) - 1;
            const slabRow = Math.floor(hoveredSlab.index / 3);
            targetScreenX = rect.left + 260 + slabCol * 90;
            targetScreenY = rect.top + 210 + slabRow * 50;
          } else {
            const stairStep = Math.sin(tClock * 2.5) * 45;
            const stairY = Math.abs(Math.cos(tClock * 2.5)) * 25;
            targetScreenX = rect.left + 260 + stairStep;
            targetScreenY = rect.top + 180 - stairY;
          }
        }
      } else if (activeSection === 'github') {
        // 06 // GITHUB: City tower hopping, flag planting, pushing box
        const skylineEl = document.querySelector('[data-robot-anchor="github:skyline"]') || document.getElementById('github');
        if (skylineEl) {
          const rect = skylineEl.getBoundingClientRect();
          if (githubStage === 'hopping') {
            const hopProgress = (Math.sin(tClock * 2.5) + 1) * 0.5;
            const hopY = Math.abs(Math.sin(tClock * 5)) * 35;
            targetScreenX = rect.left + 160 + hopProgress * (rect.width - 320);
            targetScreenY = rect.top + 160 - hopY;
          } else if (githubStage === 'planting') {
            targetScreenX = rect.left + rect.width * 0.60;
            targetScreenY = rect.top + 120;
          } else if (githubStage === 'pushing') {
            targetScreenX = rect.left + rect.width * 0.78;
            targetScreenY = rect.top + 150;
          } else {
            targetScreenX = rect.left + rect.width * 0.82;
            targetScreenY = rect.top + 140;
          }
        }
      } else if (activeSection === 'stats') {
        // 07 // STATS: HARD dumbbell, milestone badges collection, locked shrug
        if (statsStage === 'dumbbell') {
          const hardEl = document.querySelector('[data-robot-anchor="stats:hard"]') || document.querySelector('[data-robot-anchor="stats:board"]');
          if (hardEl) {
            const rect = hardEl.getBoundingClientRect();
            targetScreenX = rect.left + rect.width * 0.5;
            targetScreenY = rect.top - 25;
          }
        } else if (statsStage === 'badges') {
          const badgesEl = document.querySelector('[data-robot-anchor="stats:badges"]') || document.getElementById('stats');
          if (badgesEl) {
            const rect = badgesEl.getBoundingClientRect();
            const badgeStep = Math.sin(tClock * 2.5) * 75;
            targetScreenX = rect.left + 240 + badgeStep;
            targetScreenY = rect.top + 60;
          }
        } else {
          const badgesEl = document.querySelector('[data-robot-anchor="stats:badges"]') || document.getElementById('stats');
          if (badgesEl) {
            const rect = badgesEl.getBoundingClientRect();
            targetScreenX = rect.left + rect.width * 0.75;
            targetScreenY = rect.top + 60;
          }
        }
      } else if (activeSection === 'events') {
        // 08 // EVENTS: Ticket inspector stamping tickets, trophy & flat confetti pop
        const ticketsEl = document.querySelector('[data-robot-anchor="events:tickets"]') || document.getElementById('events');
        if (ticketsEl) {
          const rect = ticketsEl.getBoundingClientRect();
          if (eventsStage === 'inspecting') {
            const inspectX = (Math.sin(tClock * 1.8) + 1) * 0.4 * rect.width;
            targetScreenX = rect.left + 120 + inspectX;
            targetScreenY = rect.top + 65;
          } else {
            targetScreenX = rect.left + 180;
            targetScreenY = rect.top + 40;
          }
        }
      } else if (activeSection === 'journey') {
        // 09 // JOURNEY: Sits on active milestone node (2023, 2024, 2025, 2026)
        const nodeEl = document.querySelector(`[data-robot-anchor="journey:node-${journeyYear}"]`) || document.querySelector('[data-robot-anchor="journey:timeline"]');
        if (nodeEl) {
          const rect = nodeEl.getBoundingClientRect();
          targetScreenX = rect.left + rect.width * 0.5;
          targetScreenY = rect.top - 20;
        }
      } else if (activeSection === 'contact') {
        // 10 // CONTACT: Hard hat & hammer build letters, watches active input, rocket launch
        if (contactAction === 'rocket') {
          const btnEl = document.querySelector('[data-robot-anchor="contact:send-btn"]') || document.getElementById('contact');
          if (btnEl) {
            const rect = btnEl.getBoundingClientRect();
            targetScreenX = rect.left + rect.width * 0.5;
            targetScreenY = rect.top - 45;
          }
        } else if (contactInputFocus) {
          const inputEl = document.querySelector(`[name="${contactInputFocus}"]`);
          if (inputEl) {
            const rect = inputEl.getBoundingClientRect();
            targetScreenX = rect.right + 25;
            targetScreenY = rect.top + rect.height * 0.5;
          }
        } else {
          const headEl = document.querySelector('[data-robot-anchor="contact:headline"]') || document.getElementById('contact');
          if (headEl) {
            const rect = headEl.getBoundingClientRect();
            const hammerStep = Math.sin(tClock * 2) * 55;
            targetScreenX = rect.left + 220 + hammerStep;
            targetScreenY = rect.top - 25;
          }
        }
      } else if (activeSection === 'footer') {
        // FOOTER: ZZZ sleep
        const footEl = document.querySelector('[data-robot-anchor="footer:sleep"]') || document.querySelector('footer');
        if (footEl) {
          const rect = footEl.getBoundingClientRect();
          targetScreenX = rect.right - 220;
          targetScreenY = rect.top + 45;
        }
      } else {
        const anchorEl = document.querySelector(`[data-robot-anchor^="${activeSection}:"]`);
        if (anchorEl) {
          const rect = anchorEl.getBoundingClientRect();
          const offsetX = parseFloat(anchorEl.getAttribute('data-robot-offset-x') || '-65');
          const offsetY = parseFloat(anchorEl.getAttribute('data-robot-offset-y') || '-20');
          targetScreenX = rect.left + offsetX;
          targetScreenY = rect.top + offsetY;
        }
      }
    } else {
      // Mobile (< 1280px): Docked in bottom right corner (never covers content)
      targetScreenX = size.width - 55;
      targetScreenY = size.height - 70;
    }

    // Convert target screen coords to Three.js world units at Z=0
    const targetWorldX = ((targetScreenX / size.width) - 0.5) * visibleWidth;
    const targetWorldY = -((targetScreenY / size.height) - 0.5) * visibleHeight;
    flightTargetPos.current.set(targetWorldX, targetWorldY, 0);

    // Arc flight interpolation across sections
    if (flightTime.current < 1 && !prefersReducedMotion) {
      flightTime.current += delta / flightDuration;
      const t = Math.min(1, flightTime.current);
      const easeT = t * t * (3 - 2 * t);

      currentPos.current.x = THREE.MathUtils.lerp(
        flightStartPos.current.x,
        flightTargetPos.current.x,
        easeT
      );

      const arcHeight = Math.max(0.6, Math.min(1.8, Math.abs(flightTargetPos.current.y - flightStartPos.current.y) * 0.35));
      const arcLift = Math.sin(t * Math.PI) * arcHeight;

      currentPos.current.y = THREE.MathUtils.lerp(
        flightStartPos.current.y,
        flightTargetPos.current.y,
        easeT
      ) + arcLift;

      currentPos.current.z = Math.sin(t * Math.PI) * 0.4;
      groupRef.current.rotation.z = Math.sin(t * Math.PI) * (flightTargetPos.current.x > flightStartPos.current.x ? -0.2 : 0.2);

      if (t >= 1) {
        groupRef.current.rotation.z = 0;
        executeRoutine(activeSection, {
          setAnim: (a) => robotStore.setBolt(a, robotStore.getState().boltExpr),
          setExpr: (e) => robotStore.setBolt(robotStore.getState().boltAnim, e),
        });
      }
    } else {
      // Landed state: smoothly damp to target position
      const dampSpeed = backToTopFlying ? 24 : 12;
      currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetWorldX, dampSpeed, delta);
      currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetWorldY, dampSpeed, delta);
      currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, 0, 10, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 10, delta);

      if (activeSection === 'work' && !isMobile && !prefersReducedMotion) {
        const vel = robotStore.getState().scrollVelocity;
        const targetRotY = vel > 1 ? 0.35 : vel < -1 ? -0.35 : 0;
        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 8, delta);
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, 0, 8, delta);
      }
    }

    groupRef.current.position.copy(currentPos.current);

    // Update screen coordinates for 2D button and speech bubble
    const screenX = ((currentPos.current.x / visibleWidth) + 0.5) * size.width;
    const screenY = ((-currentPos.current.y / visibleHeight) + 0.5) * size.height;
    robotStore.setBoltScreenPos(screenX, screenY, true);
  });

  // Scale: large on desktop (0.88 -> ~105px), compact when docked on mobile (0.55 -> ~65px)
  const yearScaleMultiplier = (activeSection === 'journey' && journeyYear === '2023') ? 0.72 : 1.0;
  const boltScale = (isMobile ? 0.55 : 0.88) * yearScaleMultiplier;

  // Active expression & animation computation based on section routine & spontaneous interactions
  let effectiveAnim = anim;
  let effectiveExpr = expr;

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
  } else if (activeSection === 'about') {
    if (aboutStage === 'glitch') {
      effectiveAnim = 'idle';
      effectiveExpr = 'focused';
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
        effectiveExpr = 'focused';
      }
    }
  } else if (activeSection === 'design') {
    switch (designStage) {
      case 'research':
        effectiveAnim = 'idle';
        effectiveExpr = 'focused';
        break;
      case 'wireframe':
        effectiveAnim = 'dance';
        effectiveExpr = 'focused';
        break;
      case 'prototype':
        effectiveAnim = 'jump';
        effectiveExpr = 'excited';
        break;
      case 'build':
        effectiveAnim = 'walk';
        effectiveExpr = 'happy';
        break;
    }
  } else if (activeSection === 'skills') {
    if (hoveredSlab) {
      effectiveAnim = 'dance';
      effectiveExpr = 'excited';
    } else {
      effectiveAnim = 'walk';
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
      effectiveExpr = 'focused'; // Hard problem solving face
    } else if (statsStage === 'badges') {
      effectiveAnim = 'jump';
      effectiveExpr = 'wink'; // Proud/shy receiving badges
    } else if (statsStage === 'lockedFlex') {
      effectiveAnim = 'walk';
      effectiveExpr = 'silly';
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
      effectiveExpr = 'wink';
    } else if (journeyYear === '2024') {
      effectiveAnim = 'idle';
      effectiveExpr = 'focused';
    } else if (journeyYear === '2025') {
      effectiveAnim = 'walk';
      effectiveExpr = 'happy';
    } else {
      effectiveAnim = 'jump';
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

  // Active accessories
  const accessories: RobotAccessories = {
    skateboard: activeSection === 'work' && !isMobile,
    figmaCursor: activeSection === 'design' && !isMobile,
    ruler: activeSection === 'design' && !isMobile,
    keyboard: activeSection === 'design' && designStage === 'build' && !isMobile,
    dashedBox: activeSection === 'design' && designStage === 'wireframe' && !isMobile,

    flag: activeSection === 'github' && (githubStage === 'planting' || githubStage === 'satisfied') && !isMobile,
    gitPushBox: activeSection === 'github' && githubStage === 'pushing' && !isMobile,
    dumbbell: activeSection === 'stats' && statsStage === 'dumbbell' && !isMobile,
    chestBadges: activeSection === 'stats' && (statsStage === 'badges' || statsStage === 'lockedFlex' || statsStage === 'shrug') && !isMobile,
    stamp: activeSection === 'events' && eventsStage === 'inspecting' && !isMobile,
    trophy: activeSection === 'events' && eventsStage === 'trophy' && !isMobile,
    confetti: (activeSection === 'events' && eventsStage === 'trophy' || isDanceParty) && !isMobile,
    trainingWheels: activeSection === 'journey' && journeyYear === '2023' && !isMobile,
    backpack: activeSection === 'journey' && journeyYear === '2025' && !isMobile,
    jetpack: ((activeSection === 'journey' && journeyYear === '2026') || backToTopFlying) && !isMobile,
    hardHat: activeSection === 'contact' && !isMobile,
    hammer: activeSection === 'contact' && contactAction === 'building' && !isMobile,
    paperRocket: activeSection === 'contact' && contactAction === 'rocket' && !isMobile,
    zzzBubble: (activeSection === 'footer' || footerSleeping || isIdleSleeping) && !isMobile && !backToTopFlying,

    steam: isOverheating && !isMobile,
  };

  return (
    <group ref={groupRef}>
      {/* Main Traveling BOLT Robot */}
      <Robot
        variant="bolt"
        animation={effectiveAnim}
        expression={effectiveExpr}
        scale={boltScale}
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
    typeof window !== 'undefined' ? window.innerWidth < 1280 : false
  );
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
      setIsMobile(window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tab visibility: pause WebGL render loop when tab is hidden to save GPU/battery
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
      setRobotEnabled(state.robotEnabled);
      setSpeechBubble(state.speechBubble);
      setBoltPos(state.boltScreenPos);
    });
    return () => unsubscribe();
  }, []);

  // When robot is turned off, render nothing: 0 WebGL draw calls, 0 frames used!
  if (!robotEnabled) {
    return null;
  }

  return (
    <>
      {/* Persistent Fixed Overlay Canvas at z-index 25 (above sections, below navigation rails & modals) */}
      <div 
        className="fixed inset-0 pointer-events-none z-25 overflow-hidden"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Canvas
            className="pointer-events-none"
            style={{ pointerEvents: 'none' }}
            dpr={[1, 1.5]}
            frameloop={isTabVisible ? 'always' : 'never'}
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
      </div>

      {/* Real Interactive Button over BOLT with aria-label, tabIndex={-1} to preserve tab order */}
      {boltPos.visible && boltPos.x > 0 && (
        <button
          onClick={() => {
            robotStore.handleBoltClick();
          }}
          tabIndex={-1}
          aria-label="Interact with Bolt Robot"
          style={{
            position: 'fixed',
            left: `${boltPos.x - (isMobile ? 30 : 45)}px`,
            top: `${boltPos.y - (isMobile ? 45 : 65)}px`,
            width: isMobile ? '60px' : '90px',
            height: isMobile ? '90px' : '130px',
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
      {speechBubble && boltPos.visible && boltPos.x > 0 && (
        <div
          style={{
            position: 'fixed',
            left: `${boltPos.x}px`,
            top: `${boltPos.y - (isMobile ? 70 : 88)}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
          className="max-w-[280px] sm:max-w-[340px] px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs font-bold text-[#0A0A0A] text-center leading-snug"
        >
          <span>{speechBubble}</span>
          {/* Downward triangle pointer pointing at BOLT's head */}
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
