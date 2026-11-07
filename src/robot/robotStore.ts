import type { RobotAnimation, RobotExpression } from './types';

export type DesignStageId = 'research' | 'wireframe' | 'prototype' | 'build';

export interface WorkCardHoverInfo {
  id: string;
  isTodoScreenshot: boolean;
  screenX: number;
  screenY: number;
}

export interface HoveredSlabInfo {
  index: number;
  name: string;
  screenX?: number;
  screenY?: number;
}

export type AboutGradYearStage = 'idle' | 'glitch' | 'facepalm' | 'settled';

// Task 4 routine stage types
export type GitHubSkylineStage = 'hopping' | 'planting' | 'pushing' | 'satisfied';
export type StatsStage = 'dumbbell' | 'badges' | 'lockedFlex' | 'shrug';
export type EventsTicketStage = 'inspecting' | 'stamping' | 'trophy';
export type JourneyYear = '2023' | '2024' | '2025' | '2026';
export type ContactAction = 'building' | 'watching' | 'rocket' | 'cheer';

export interface RobotState {
  steveAnim: RobotAnimation;
  steveExpr: RobotExpression;
  steveScreenPos: { x: number; y: number; visible: boolean };
  boltAnim: RobotAnimation;
  boltExpr: RobotExpression;
  boltScreenPos: { x: number; y: number; visible: boolean };
  cursor: { x: number; y: number };
  isDebug: boolean;
  activeSection: string;
  scrollVelocity: number;
  isFastScrolling: boolean;
  homePlatformPos: { x: number; y: number };
  homeSeatPos: { x: number; y: number };
  steveHeroState: 'seated' | 'standing_up' | 'flying' | 'lane';
  chairSpinActive: boolean;

  // Task 3 routine states
  aboutGradYearStage: AboutGradYearStage;
  workCardHover: WorkCardHoverInfo | null;
  hoveredSlab: HoveredSlabInfo | null;

  // Task 4 routine states
  githubStage: GitHubSkylineStage;
  statsStage: StatsStage;
  eventsTicketStage: EventsTicketStage;
  journeyYear: JourneyYear;
  contactAction: ContactAction;
  contactInputFocus: string | null;
  footerSleeping: boolean;
  backToTopFlying: boolean;

  // Task 5 Player Interaction states
  robotEnabled: boolean;
  isQuiet: boolean;
  speechBubble: string | null;
  isOverheating: boolean;
  isIdleSleeping: boolean;
  isDanceParty: boolean;
  isSummonedFriends: boolean;
}

const STORAGE_KEY = 'sunny_portfolio_robot_enabled';
const QUIET_STORAGE_KEY = 'sunny_portfolio_steve_quiet';

function getStoredRobotEnabled(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(STORAGE_KEY);
    return val !== null ? val === 'true' : true;
  } catch (e) {
    console.warn('Could not read robot state from localStorage:', e);
    return true;
  }
}

function getStoredSteveQuiet(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(QUIET_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function setStoredRobotEnabled(enabled: boolean): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  } catch (e) {
    console.warn('Could not save robot state to localStorage:', e);
  }
}

const FUNNY_LINES = [
  "Looking for a frontend dev? I know a guy!",
  "It's not a bug, it's an undocumented feature.",
  "Caffeine level: 98%. Ready to compile!",
  "Three.js is cool, but have you seen CSS grid?",
  "My visor is 100% ray-traced neo-brutalist pixels.",
  "Smart contracts? I prefer bug-free contracts!",
  "Compiling assets... Please do not disturb.",
  "Need a responsive UI? You've come to the right place!",
  "Warning: High doses of TypeScript detected.",
  "Commit often, push carefully!"
];

type Listener = () => void;

class RobotStore {
  private state: RobotState = {
    steveAnim: 'wave',
    steveExpr: 'happy',
    steveScreenPos: { x: 0, y: 0, visible: false },
    boltAnim: 'wave',
    boltExpr: 'happy',
    boltScreenPos: { x: 0, y: 0, visible: false },
    cursor: { x: 0, y: 0 },
    isDebug: typeof window !== 'undefined' && window.location.search.includes('robotDebug=1'),
    activeSection: 'home',
    scrollVelocity: 0,
    isFastScrolling: false,
    homePlatformPos: { x: 0, y: 0 },
    homeSeatPos: { x: 0, y: 0 },
    steveHeroState: 'seated',
    chairSpinActive: false,

    // Task 3 initial states
    aboutGradYearStage: 'idle',
    workCardHover: null,
    hoveredSlab: null,

    // Task 4 initial states
    githubStage: 'hopping',
    statsStage: 'dumbbell',
    eventsTicketStage: 'inspecting',
    journeyYear: '2023',
    contactAction: 'building',
    contactInputFocus: null,
    footerSleeping: false,
    backToTopFlying: false,

    // Task 5 Player Interaction initial states
    robotEnabled: getStoredRobotEnabled(),
    isQuiet: getStoredSteveQuiet(),
    speechBubble: null,
    isOverheating: false,
    isIdleSleeping: false,
    isDanceParty: false,
    isSummonedFriends: false,
  };

  private listeners: Set<Listener> = new Set();
  private cursorInitialized = false;
  private scrollResetTimer: ReturnType<typeof setTimeout> | null = null;
  private lastScrollY = 0;
  private lastScrollTime = 0;

  // Task 5 timers & trackers
  private clickTimestamps: number[] = [];
  private speechLineIndex = 0;
  private overheatTimer: ReturnType<typeof setTimeout> | null = null;
  private speechTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private dancePartyTimer: ReturnType<typeof setTimeout> | null = null;

  // Konami code tracker
  private konamiSequence = [
    'arrowup', 'arrowup',
    'arrowdown', 'arrowdown',
    'arrowleft', 'arrowright',
    'arrowleft', 'arrowright',
    'b', 'a'
  ];
  private konamiIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWindowListeners();
    }
  }

  private initWindowListeners() {
    if (this.cursorInitialized) return;
    this.cursorInitialized = true;

    // Track global window cursor position for head tracking
    window.addEventListener('pointermove', (e: PointerEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.state.cursor = { x: normX, y: normY };
      this.resetIdleTimer();
    }, { passive: true });

    // Handle custom robot actions
    window.addEventListener('robot:action', (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const action = customEvent.detail;
      this.handleAction(action);
      this.resetIdleTimer();
    });

    // Keyboard listener for Konami code and idle reset
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.handleKonamiKey(e.key);
      this.resetIdleTimer();
    }, { passive: true });

    // Track scroll velocity for dizzy reaction
    this.lastScrollY = window.scrollY;
    this.lastScrollTime = performance.now();

    window.addEventListener('scroll', () => {
      this.resetIdleTimer();
      const now = performance.now();
      const dt = Math.max(1, now - this.lastScrollTime);
      const dy = window.scrollY - this.lastScrollY;
      const velocity = (dy / dt) * 16.67;

      this.setScrollVelocity(velocity);
      this.lastScrollY = window.scrollY;
      this.lastScrollTime = now;

      // Reset scroll velocity when scrolling ceases
      if (this.scrollResetTimer) clearTimeout(this.scrollResetTimer);
      this.scrollResetTimer = setTimeout(() => {
        this.setScrollVelocity(0);
      }, 140);
    }, { passive: true });

    // Start initial 10s idle timer
    this.resetIdleTimer();
  }

  // -------------------------------------------------------------------------
  // TASK 5: Player Interaction Methods
  // -------------------------------------------------------------------------

  /**
   * 1. Clicking STEVE:
   * Jump plus speech bubble with rotating funny lines.
   * Clicking 5 times quickly (within 2s) makes STEVE overheat and spin with flat steam.
   */
  public handleSteveClick() {
    if (!this.state.robotEnabled) return;

    // If asleep, wake up
    if (this.state.isIdleSleeping) {
      this.triggerWake();
      return;
    }

    const now = performance.now();
    this.clickTimestamps.push(now);
    // Keep clicks from the last 2000ms
    this.clickTimestamps = this.clickTimestamps.filter(t => now - t <= 2000);

    if (this.clickTimestamps.length >= 5) {
      this.clickTimestamps = [];
      this.triggerOverheat();
      return;
    }

    // Normal click: jump + speech bubble
    this.setSteve('jump', 'excited');
    const line = FUNNY_LINES[this.speechLineIndex % FUNNY_LINES.length];
    this.speechLineIndex++;
    this.showSpeechBubble(line, 3200);
  }

  public handleBoltClick() {
    this.handleSteveClick();
  }

  public triggerOverheat() {
    this.state.isOverheating = true;
    this.setSteve('spin', 'dizzy');
    this.showSpeechBubble("Okay okay, I'm overheating! 🔥", 3000);
    this.notify();

    if (this.overheatTimer) clearTimeout(this.overheatTimer);
    this.overheatTimer = setTimeout(() => {
      this.state.isOverheating = false;
      this.setSteve('idle', 'happy');
      this.showSpeechBubble("Ah, much better! ❄️", 2200);
      this.notify();
    }, 2600);
  }

  public setQuiet(quiet: boolean) {
    this.state.isQuiet = quiet;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUIET_STORAGE_KEY, String(quiet));
      }
    } catch (e) {}
    if (quiet) {
      this.clearSpeechBubble();
    } else {
      this.showSpeechBubble("Voice back online! Steve at your service. ✨", 3000);
    }
    this.notify();
  }

  public triggerShyMode() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('steve:shy-mode'));
    }
  }

  public showSpeechBubble(text: string, durationMs = 3000) {
    if (this.state.isQuiet) return;
    this.state.speechBubble = text.slice(0, 60);
    this.notify();

    if (this.speechTimer) clearTimeout(this.speechTimer);
    this.speechTimer = setTimeout(() => {
      this.clearSpeechBubble();
    }, Math.min(4500, Math.max(2000, durationMs)));
  }

  public clearSpeechBubble() {
    if (this.state.speechBubble !== null) {
      this.state.speechBubble = null;
      this.notify();
    }
  }

  /**
   * 2. Idle for 10 seconds:
   * STEVE yawns and sleeps. Any mouse move wakes it.
   */
  public resetIdleTimer() {
    // If sleeping from idle, wake up immediately on user activity
    if (this.state.isIdleSleeping) {
      this.triggerWake();
    }

    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (!this.state.robotEnabled) return;

    this.idleTimer = setTimeout(() => {
      if (
        this.state.robotEnabled && 
        !this.state.footerSleeping && 
        !this.state.isOverheating && 
        !this.state.isDanceParty &&
        this.state.activeSection !== 'footer'
      ) {
        this.triggerIdleSleep();
      }
    }, 10000);
  }

  public triggerIdleSleep() {
    this.state.isIdleSleeping = true;
    this.setSteve('sleep', 'sleepy');
    this.notify();
  }

  public triggerWake() {
    if (this.state.isIdleSleeping || this.state.steveAnim === 'sleep') {
      this.state.isIdleSleeping = false;
      this.setSteve('idle', 'happy');
      this.notify();
    }
  }

  public react(category: string) {
    if (!this.state.robotEnabled) return;
    const cat = category.toLowerCase();
    switch (cat) {
      case 'frontend':
        this.setSteve('cheer', 'happy');
        break;
      case 'backend':
      case 'languages':
        this.setSteve('salute', 'focused');
        break;
      case 'database':
        this.setSteve('idle', 'curious');
        break;
      case 'blockchain':
      case 'web3':
        this.setSteve('cheer', 'excited');
        break;
      case 'tools':
        this.setSteve('wave', 'happy');
        break;
      default:
        this.setSteve('wave', 'happy');
    }
  }

  /**
   * 3. Command palette & manual triggers:
   * dance, sleep, wake, summon friend, robot off, robot on.
   */
  public triggerDance() {
    if (!this.state.robotEnabled) return;
    this.setSteve('dance', 'excited');
    this.showSpeechBubble("Let's dance! 🕺", 3000);
    this.notify();
  }

  public triggerSleep() {
    if (!this.state.robotEnabled) return;
    this.state.isIdleSleeping = true;
    this.setSteve('sleep', 'sleepy');
    this.showSpeechBubble("Powering down... ZZZ", 3000);
    this.notify();
  }

  private handleKonamiKey(key: string) {
    const normalized = key.toLowerCase();
    if (normalized === this.konamiSequence[this.konamiIndex]) {
      this.konamiIndex++;
      if (this.konamiIndex === this.konamiSequence.length) {
        this.konamiIndex = 0;
        this.triggerKonamiParty();
      }
    } else {
      this.konamiIndex = normalized === this.konamiSequence[0] ? 1 : 0;
    }
  }

  public triggerKonamiParty(durationMs = 5000) {
    if (!this.state.robotEnabled) return;
    this.state.isDanceParty = true;
    this.setSteve('dance', 'excited');
    this.showSpeechBubble("🎉 KONAMI CODE ACTIVATED! DANCE PARTY! 🎉", 4500);
    this.notify();

    if (this.dancePartyTimer) clearTimeout(this.dancePartyTimer);
    this.dancePartyTimer = setTimeout(() => {
      this.state.isDanceParty = false;
      this.setSteve('idle', 'happy');
      this.notify();
    }, durationMs);
  }

  /**
   * 5. Persist "robot off/on" in localStorage, guarded with try/catch.
   * When off, nothing renders and no frames are used.
   */
  public setRobotEnabled(enabled: boolean) {
    if (this.state.robotEnabled !== enabled) {
      this.state.robotEnabled = enabled;
      setStoredRobotEnabled(enabled);
      if (!enabled) {
        this.clearSpeechBubble();
        this.state.isOverheating = false;
        this.state.isDanceParty = false;
        this.state.isSummonedFriends = false;
      } else {
        this.resetIdleTimer();
        this.showSpeechBubble("Robots online!", 2200);
      }
      this.notify();
    }
  }

  // -------------------------------------------------------------------------
  // Existing Handlers & Setters
  // -------------------------------------------------------------------------

  public handleAction(action: string) {
    if (action === 'jump') {
      this.setSteve('jump', 'excited');
    } else if (action === 'salute') {
      this.setSteve('salute', 'focused');
    } else if (action === 'cheer') {
      this.setSteve('cheer', 'happy');
    } else if (action === 'idle') {
      this.setSteve('idle', 'happy');
    } else if (action === 'dance') {
      this.triggerDance();
    } else if (action === 'sleep') {
      this.triggerSleep();
    } else if (action === 'wake') {
      this.triggerWake();
    } else if (action === 'summon-friends') {
      this.triggerDance();
    } else if (action === 'robot-off') {
      this.setRobotEnabled(false);
    } else if (action === 'robot-on') {
      this.setRobotEnabled(true);
    }
  }

  public getState(): RobotState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public setSteve(anim: RobotAnimation, expr: RobotExpression) {
    if (this.state.steveAnim !== anim || this.state.steveExpr !== expr) {
      this.state.steveAnim = anim;
      this.state.steveExpr = expr;
      this.state.steveAnim = anim;
      this.state.steveExpr = expr;
      this.notify();
    }
  }

  public setBolt(anim: RobotAnimation, expr: RobotExpression) {
    this.setSteve(anim, expr);
  }

  public setSteveScreenPos(x: number, y: number, visible: boolean) {
    const prev = this.state.steveScreenPos;
    const moved = Math.hypot(prev.x - x, prev.y - y) > 3;
    const visChanged = prev.visible !== visible;
    if (moved || visChanged) {
      this.state.steveScreenPos = { x, y, visible };
      this.state.boltScreenPos = { x, y, visible };
      this.notify();
    }
  }

  public setBoltScreenPos(x: number, y: number, visible: boolean) {
    this.setSteveScreenPos(x, y, visible);
  }

  public setHomePlatformPos(x: number, y: number) {
    const prev = this.state.homePlatformPos;
    if (Math.hypot(prev.x - x, prev.y - y) > 3) {
      this.state.homePlatformPos = { x, y };
      this.notify();
    }
  }

  public setHomeSeatPos(x: number, y: number) {
    const prev = this.state.homeSeatPos;
    if (Math.hypot(prev.x - x, prev.y - y) > 3) {
      this.state.homeSeatPos = { x, y };
      this.notify();
    }
  }

  public setSteveHeroState(state: 'seated' | 'standing_up' | 'flying' | 'lane') {
    if (this.state.steveHeroState !== state) {
      this.state.steveHeroState = state;
      this.notify();
    }
  }

  public triggerChairSpin() {
    this.state.chairSpinActive = true;
    this.notify();
    setTimeout(() => {
      this.state.chairSpinActive = false;
      this.notify();
    }, 900);
  }

  public setActiveSection(sectionId: string) {
    if (this.state.activeSection !== sectionId) {
      this.state.activeSection = sectionId;
      this.notify();
    }
  }

  public setScrollVelocity(velocity: number) {
    const isFast = Math.abs(velocity) > 16;
    this.state.scrollVelocity = velocity;
    if (this.state.isFastScrolling !== isFast) {
      this.state.isFastScrolling = isFast;
      this.notify();
    }
  }

  public setAboutGradYearStage(stage: AboutGradYearStage) {
    if (this.state.aboutGradYearStage !== stage) {
      this.state.aboutGradYearStage = stage;
      this.notify();
    }
  }

  public setWorkCardHover(hover: WorkCardHoverInfo | null) {
    this.state.workCardHover = hover;
    this.notify();
  }

  public setHoveredSlab(slab: HoveredSlabInfo | null) {
    this.state.hoveredSlab = slab;
    this.notify();
  }

  // Task 4 setters
  public setGithubStage(stage: GitHubSkylineStage) {
    if (this.state.githubStage !== stage) {
      this.state.githubStage = stage;
      this.notify();
    }
  }

  public setStatsStage(stage: StatsStage) {
    if (this.state.statsStage !== stage) {
      this.state.statsStage = stage;
      this.notify();
    }
  }

  public setEventsTicketStage(stage: EventsTicketStage) {
    if (this.state.eventsTicketStage !== stage) {
      this.state.eventsTicketStage = stage;
      this.notify();
    }
  }

  public setJourneyYear(year: JourneyYear) {
    if (this.state.journeyYear !== year) {
      this.state.journeyYear = year;
      this.notify();
    }
  }

  public setContactAction(action: ContactAction) {
    if (this.state.contactAction !== action) {
      this.state.contactAction = action;
      this.notify();
    }
  }

  public setContactInputFocus(inputName: string | null) {
    if (this.state.contactInputFocus !== inputName) {
      this.state.contactInputFocus = inputName;
      this.notify();
    }
  }

  public setFooterSleeping(sleeping: boolean) {
    if (this.state.footerSleeping !== sleeping) {
      this.state.footerSleeping = sleeping;
      this.notify();
    }
  }

  public setBackToTopFlying(flying: boolean) {
    if (this.state.backToTopFlying !== flying) {
      this.state.backToTopFlying = flying;
      this.notify();
    }
  }
}

export const robotStore = new RobotStore();
export const steve = {
  react: (category: string) => robotStore.react(category),
};
export const bolt = steve;

if (typeof window !== 'undefined') {
  (window as unknown as { __ROBOT_STORE__: RobotStore }).__ROBOT_STORE__ = robotStore;
  (window as unknown as { steve: typeof steve }).steve = steve;
  (window as unknown as { bolt: typeof bolt }).bolt = bolt;
}
