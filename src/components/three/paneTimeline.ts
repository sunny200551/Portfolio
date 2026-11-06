import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export interface PaneRefs {
  group: THREE.Group | null;
  pane1: THREE.Group | null; // Cobalt #0047AB
  pane2: THREE.Group | null; // White #FFFFFF
  pane3: THREE.Group | null; // Navy #0A1A3F
  pane4: THREE.Group | null; // Orange #FF5A1F
  pane5: THREE.Group | null; // Plinth #EEF2FA
}

/**
 * Sets up roaming 3D Panes across all sections of the site.
 * Scans each section and synchronizes motion with Lenis smooth scroll.
 */
export function createPaneTimeline(
  refs: PaneRefs,
  isMobile: boolean,
  prefersReducedMotion: boolean
): gsap.Context {
  const ctx = gsap.context(() => {
    const { group, pane1, pane2, pane3, pane4, pane5 } = refs;
    if (!group) return;

    if (prefersReducedMotion) {
      // In reduced motion, keep panes static in hero, and hide outside hero
      group.position.set(isMobile ? 0 : 2.0, isMobile ? -2.0 : 0.15, 0);
      group.scale.setScalar(isMobile ? 0.9 : 1.7);
      
      ScrollTrigger.create({
        trigger: '#home',
        start: 'bottom 80%',
        onEnter: () => gsap.to(group.position, { y: -20, duration: 0.3 }),
        onLeaveBack: () => gsap.to(group.position, { y: isMobile ? -2.0 : 0.15, duration: 0.3 }),
      });
      return;
    }

    // 1. Initial Scale & Base Hero Placement (clean cluster on right half of hero)
    const heroScale = isMobile ? 0.9 : 1.25;
    const heroX = isMobile ? 0 : 1.9;
    const heroY = isMobile ? -2.0 : 0;

    group.scale.set(heroScale, heroScale, heroScale);
    group.position.set(heroX, heroY, 0);

    // Initial load assembly animation (springing into place)
    if (pane1) gsap.from(pane1.position, { y: 2, z: 2, duration: 1.4, ease: 'power3.out' });
    if (pane2) gsap.from(pane2.position, { y: 3, z: 1, duration: 1.5, delay: 0.1, ease: 'power3.out' });
    if (pane3) gsap.from(pane3.position, { x: 2, z: 1, duration: 1.3, delay: 0.05, ease: 'power3.out' });
    if (pane4) gsap.from(pane4.position, { y: -1, z: 2, duration: 1.6, delay: 0.15, ease: 'power3.out' });
    if (pane5) gsap.from(pane5.position, { y: -3, duration: 1.4, delay: 0.08, ease: 'power3.out' });

    // 2. Full-Page Continuous Roaming Master Timeline
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });

    // KEYFRAME 1: Drift from Hero -> #about (drift to right gutter and spread)
    masterTl.to(group.position, {
      x: isMobile ? 0.4 : 3.4,
      y: isMobile ? -1.2 : 0.2,
      z: -0.4,
      ease: 'power1.inOut',
    }, 0.08);

    masterTl.to(group.scale, {
      x: isMobile ? 0.85 : 1.35,
      y: isMobile ? 0.85 : 1.35,
      z: isMobile ? 0.85 : 1.35,
      ease: 'power1.inOut',
    }, 0.08);

    if (pane1 && !isMobile) masterTl.to(pane1.position, { x: 0.6, y: 0.7, z: 0.4 }, 0.08);
    if (pane2 && !isMobile) masterTl.to(pane2.position, { x: -0.7, y: 1.3, z: 0.6 }, 0.08);
    if (pane3 && !isMobile) masterTl.to(pane3.position, { x: 0.8, y: -0.9, z: 0.8 }, 0.08);
    if (pane4 && !isMobile) masterTl.to(pane4.position, { x: -0.6, y: -0.4, z: 1.0 }, 0.08);

    // KEYFRAME 2: #about -> #work (move above and behind card row)
    masterTl.to(group.position, {
      x: 0,
      y: isMobile ? 1.0 : 1.7,
      z: -1.8,
      ease: 'power1.inOut',
    }, 0.22);

    masterTl.to(group.scale, {
      x: isMobile ? 0.9 : 1.55,
      y: isMobile ? 0.9 : 1.55,
      z: isMobile ? 0.9 : 1.55,
      ease: 'power1.inOut',
    }, 0.22);

    if (pane1 && !isMobile) masterTl.to(pane1.position, { x: 1.4, y: 0.2, z: -0.2 }, 0.22);
    if (pane2 && !isMobile) masterTl.to(pane2.position, { x: -1.2, y: 0.3, z: 0 }, 0.22);
    if (pane3 && !isMobile) masterTl.to(pane3.position, { x: 0, y: -0.2, z: -0.4 }, 0.22);

    // KEYFRAME 3: #work -> #skills (left gutter)
    masterTl.to(group.position, {
      x: isMobile ? -0.5 : -3.3,
      y: -0.2,
      z: -0.3,
      ease: 'power1.inOut',
    }, 0.38);

    masterTl.to(group.scale, {
      x: isMobile ? 0.85 : 1.25,
      y: isMobile ? 0.85 : 1.25,
      z: isMobile ? 0.85 : 1.25,
      ease: 'power1.inOut',
    }, 0.38);

    if (pane1 && !isMobile) masterTl.to(pane1.position, { x: 0, y: 0.4, z: 0.2 }, 0.38);
    if (pane2 && !isMobile) masterTl.to(pane2.position, { x: 0.2, y: 1.1, z: 0.4 }, 0.38);
    if (pane3 && !isMobile) masterTl.to(pane3.position, { x: -0.2, y: -0.7, z: 0.5 }, 0.38);

    // KEYFRAME 4: #skills -> #github (corner)
    masterTl.to(group.position, {
      x: isMobile ? 0.6 : 3.0,
      y: isMobile ? 1.2 : 1.8,
      z: -0.8,
      ease: 'power1.inOut',
    }, 0.52);

    masterTl.to(group.scale, {
      x: isMobile ? 0.8 : 1.05,
      y: isMobile ? 0.8 : 1.05,
      z: isMobile ? 0.8 : 1.05,
      ease: 'power1.inOut',
    }, 0.52);

    // KEYFRAME 5: #github -> #stats (right)
    masterTl.to(group.position, {
      x: isMobile ? 0.5 : 3.4,
      y: -0.3,
      z: -0.4,
      ease: 'power1.inOut',
    }, 0.65);

    masterTl.to(group.scale, {
      x: isMobile ? 0.9 : 1.3,
      y: isMobile ? 0.9 : 1.3,
      z: isMobile ? 0.9 : 1.3,
      ease: 'power1.inOut',
    }, 0.65);

    // KEYFRAME 6: #stats -> #events (left)
    masterTl.to(group.position, {
      x: isMobile ? -0.5 : -3.2,
      y: 0.3,
      z: -0.5,
      ease: 'power1.inOut',
    }, 0.76);

    masterTl.to(group.scale, {
      x: isMobile ? 0.85 : 1.2,
      y: isMobile ? 0.85 : 1.2,
      z: isMobile ? 0.85 : 1.2,
      ease: 'power1.inOut',
    }, 0.76);

    // KEYFRAME 7: #events -> #journey (alternate sides along vertical timeline)
    masterTl.to(group.position, {
      x: isMobile ? 0.4 : 2.9,
      y: 0.4,
      z: -0.4,
      ease: 'power1.inOut',
    }, 0.84);

    masterTl.to(group.position, {
      x: isMobile ? -0.4 : -2.8,
      y: -0.2,
      z: -0.4,
      ease: 'power1.inOut',
    }, 0.90);

    // KEYFRAME 8: #journey -> #contact (gather into stack at right edge)
    masterTl.to(group.position, {
      x: isMobile ? 0.3 : 3.1,
      y: 0,
      z: -0.2,
      ease: 'power1.inOut',
    }, 1.0);

    masterTl.to(group.scale, {
      x: isMobile ? 0.9 : 1.4,
      y: isMobile ? 0.9 : 1.4,
      z: isMobile ? 0.9 : 1.4,
      ease: 'power1.inOut',
    }, 1.0);

    // Gather into stacked pile
    if (pane1) masterTl.to(pane1.position, { x: 0, y: 0.2, z: 0 }, 1.0);
    if (pane2) masterTl.to(pane2.position, { x: -0.15, y: 0.6, z: 0.2 }, 1.0);
    if (pane3) masterTl.to(pane3.position, { x: 0.15, y: -0.3, z: 0.35 }, 1.0);
    if (pane4) masterTl.to(pane4.position, { x: -0.2, y: 0.1, z: 0.5 }, 1.0);
  });

  return ctx;
}

