import { useEffect } from 'react';
import { steveState } from '../lib/steveState';

/**
 * useSteveHandoff:
 * Observes the #about section scroll position and coordinates Steve's handoff:
 * - When #about reaches ~60% from viewport top -> launchToDock()
 * - When scrolling back up and #about leaves back through top (threshold ~80%) -> returnToHero()
 * - Fast jumps / hash jumps bypass or use fast transition.
 */
export function useSteveHandoff() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if initial load is already below hero or has non-home hash
    const hash = window.location.hash.toLowerCase();
    const hasTargetHash = hash && hash !== '#home' && hash !== '#';
    if (hasTargetHash || window.scrollY > 400) {
      steveState.launchToDock({ instant: true });
    }

    let ticking = false;

    const checkHandoff = () => {
      ticking = false;
      const innerW = window.innerWidth;
      if (innerW < 1200) {
        // Below 1200px: dock Steve is never active
        return;
      }

      const aboutEl = document.getElementById('about');
      if (!aboutEl) return;

      const rect = aboutEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const currentState = steveState.getState();

      // Trigger zone for LAUNCHING: when top of #about reaches ~60% of viewport
      const launchThreshold = vh * 0.60;
      // Trigger zone for RETURNING: when top of #about is pushed back down below ~80% of viewport
      const returnThreshold = vh * 0.80;

      if (rect.top <= launchThreshold && currentState === 'SEATED') {
        steveState.launchToDock();
      } else if (rect.top >= returnThreshold && currentState === 'DOCKED') {
        steveState.returnToHero();
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkHandoff);
        ticking = true;
      }
    };

    // Listen for custom jump events (e.g. from NavigationRail or CommandPalette)
    const handleFastJump = (e: Event) => {
      const custom = e as CustomEvent<{ targetSection?: string }>;
      const target = custom.detail?.targetSection;
      if (target && target !== 'home') {
        steveState.launchToDock({ fast: true });
      } else if (target === 'home') {
        steveState.returnToHero({ fast: true });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('nav:jump', handleFastJump as EventListener);

    // Initial check
    checkHandoff();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('nav:jump', handleFastJump as EventListener);
    };
  }, []);
}
