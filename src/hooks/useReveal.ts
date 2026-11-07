import { useLayoutEffect, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface RevealOptions {
  type?: 'fade-up' | 'stagger-cards' | 'lines' | 'scale';
  selector?: string;
  stagger?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  start?: string;
  delay?: number;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(options: RevealOptions = {}) {
  const {
    type = 'fade-up',
    selector,
    stagger = 0.12,
    distance = 24,
    duration = 0.7,
    once = true,
    start = 'top 88%',
    delay = 0,
  } = options;

  const ref = useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('is-in');
      const targets = selector ? el.querySelectorAll(selector) : [el];
      targets.forEach((t) => (t as HTMLElement).classList.add('is-in'));
      return;
    }

    // Safety Net 1: 3-second automatic reveal so content NEVER stays hidden
    const safetyTimer = setTimeout(() => {
      if (el) {
        el.classList.add('is-in');
        const targets = selector ? el.querySelectorAll(selector) : [el];
        targets.forEach((t) => (t as HTMLElement).classList.add('is-in'));
      }
    }, 3000);

    // Safety Net 2: IntersectionObserver fallback
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              if (selector) {
                entry.target.querySelectorAll(selector).forEach((child) => {
                  (child as HTMLElement).classList.add('is-in');
                });
              }
              if (once && observer) {
                observer.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    }

    // GSAP Context with clean revert
    const ctx = gsap.context(() => {
      let targets: NodeListOf<Element> | HTMLElement[] = [el];
      if (selector) {
        targets = el.querySelectorAll(selector);
      }

      if (targets.length === 0) return;

      if (type === 'lines') {
        gsap.fromTo(
          targets,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration,
            stagger,
            delay,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start,
              once,
              onEnter: () => {
                el.classList.add('is-in');
                clearTimeout(safetyTimer);
              },
            },
          }
        );
      } else if (type === 'stagger-cards') {
        gsap.fromTo(
          targets,
          { y: distance, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            stagger: Math.min(0.5, stagger),
            delay,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start,
              once,
              onEnter: () => {
                el.classList.add('is-in');
                clearTimeout(safetyTimer);
              },
            },
          }
        );
      } else if (type === 'scale') {
        gsap.fromTo(
          targets,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration,
            delay,
            ease: 'back.out(1.2)',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start,
              once,
              onEnter: () => {
                el.classList.add('is-in');
                clearTimeout(safetyTimer);
              },
            },
          }
        );
      } else {
        // Standard fade-up
        gsap.fromTo(
          targets,
          { y: distance, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start,
              once,
              onEnter: () => {
                el.classList.add('is-in');
                clearTimeout(safetyTimer);
              },
            },
          }
        );
      }
    }, el);

    return () => {
      clearTimeout(safetyTimer);
      if (observer) observer.disconnect();
      ctx.revert();
    };
  }, [type, selector, stagger, distance, duration, once, start, delay]);

  return ref;
}

