import type Lenis from 'lenis';

let activeLenis: Lenis | null = null;

export function setGlobalLenis(lenis: Lenis | null): void {
  activeLenis = lenis;
  if (typeof window !== 'undefined') {
    if (lenis) {
      (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    } else {
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    }
  }
}

export function getLenis(): Lenis | null {
  return activeLenis;
}

