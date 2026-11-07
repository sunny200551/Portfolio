/**
 * Single source of truth state machine for STEVE mascot handoff.
 * States:
 *  - SEATED: Hero scene only. Dock Steve is NOT mounted or visible.
 *  - LAUNCHING: ~1.4s handoff sequence. BRB sign flips up, rocket ignites, dock Steve arrives at left edge.
 *  - DOCKED: Left edge dock (screens >= 1200px). Small section reactions, fixed in left 168px lane.
 *  - RETURNING: Dock Steve takes off, rocket lands back on pad, Steve seated in chair, "Back online!" bubble.
 */

export type SteveState = 'SEATED' | 'LAUNCHING' | 'DOCKED' | 'RETURNING';

type StateListener = (state: SteveState) => void;

class SteveStateMachine {
  private currentState: SteveState = 'SEATED';
  private listeners: Set<StateListener> = new Set();
  private transitionLock = false;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Detect initial load with hash or scroll position below hero
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const hasDirectHash = hash && hash !== '#home' && hash !== '#';
      const initialScrollY = window.scrollY;

      if (hasDirectHash || initialScrollY > 400) {
        this.currentState = 'DOCKED';
      }
    }
  }

  public getState(): SteveState {
    return this.currentState;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentState));
  }

  /**
   * Launch from Hero chair to Left Dock
   */
  public launchToDock(options: { instant?: boolean; fast?: boolean } = {}) {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      // Below 1200px: dock Steve is never active; hero Steve stays seated
      return;
    }

    if (this.currentState === 'DOCKED' || this.currentState === 'LAUNCHING') {
      return;
    }

    if (options.instant) {
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
      this.transitionLock = false;
      this.currentState = 'DOCKED';
      this.notify();
      return;
    }

    if (this.transitionLock) {
      // Sequence lock: resolve current sequence immediately to prevent loops
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
    }

    this.transitionLock = true;
    this.currentState = 'LAUNCHING';
    this.notify();

    const duration = options.fast ? 400 : 1400;

    this.transitionTimer = setTimeout(() => {
      this.currentState = 'DOCKED';
      this.transitionLock = false;
      this.transitionTimer = null;
      this.notify();
    }, duration);
  }

  /**
   * Return from Left Dock back to Hero chair
   */
  public returnToHero(options: { instant?: boolean; fast?: boolean } = {}) {
    if (this.currentState === 'SEATED' || this.currentState === 'RETURNING') {
      return;
    }

    if (options.instant) {
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
      this.transitionLock = false;
      this.currentState = 'SEATED';
      this.notify();
      return;
    }

    if (this.transitionLock) {
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
    }

    this.transitionLock = true;
    this.currentState = 'RETURNING';
    this.notify();

    const duration = options.fast ? 400 : 1400;

    this.transitionTimer = setTimeout(() => {
      this.currentState = 'SEATED';
      this.transitionLock = false;
      this.transitionTimer = null;
      this.notify();
    }, duration);
  }

  /**
   * Force set state directly (used for direct hash loads or tests)
   */
  public setStateDirect(state: SteveState) {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionLock = false;
    this.currentState = state;
    this.notify();
  }
}

export const steveState = new SteveStateMachine();
