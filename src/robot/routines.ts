import type { RobotAnimation, RobotExpression } from './types';
import { robotStore } from './robotStore';

export interface RobotRoutineController {
  setAnim: (anim: RobotAnimation) => void;
  setExpr: (expr: RobotExpression) => void;
}

export type RobotRoutine = (steve: RobotRoutineController) => (() => void) | void;

const routines: Record<string, RobotRoutine> = {};
let currentCleanup: (() => void) | null = null;

export function registerRoutine(sectionId: string, routine: RobotRoutine) {
  routines[sectionId] = routine;
}

export function executeRoutine(sectionId: string, steve: RobotRoutineController) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  const routine = routines[sectionId];
  if (routine) {
    const cleanup = routine(steve);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  } else {
    steve.setAnim('idle');
    steve.setExpr('happy');
  }
}

// ---------------------------------------------------------------------------
// 01 // HOME ROUTINE
// ---------------------------------------------------------------------------
registerRoutine('home', (steve) => {
  steve.setAnim('wave');
  steve.setExpr('happy');
  const timer = setTimeout(() => {
    if (robotStore.getState().activeSection === 'home') {
      steve.setAnim('idle');
      steve.setExpr('happy');
    }
  }, 2400);

  return () => clearTimeout(timer);
});

// ---------------------------------------------------------------------------
// 02 // ABOUT ROUTINE: Stat count up, glitch reaction, facepalm, thumbs-up
// ---------------------------------------------------------------------------
registerRoutine('about', (steve) => {
  // Sits on top of stat boxes
  const stage = robotStore.getState().aboutGradYearStage;
  if (stage === 'glitch') {
    steve.setAnim('idle');
    steve.setExpr('curious');
  } else if (stage === 'facepalm') {
    steve.setAnim('facepalm');
    steve.setExpr('curious');
  } else if (stage === 'settled') {
    steve.setAnim('cheer');
    steve.setExpr('excited');
  } else {
    steve.setAnim('idle');
    steve.setExpr('focused');
  }
});

// ---------------------------------------------------------------------------
// 03 // WORK ROUTINE: Skateboard, card peeking, screenshot pending shrug
// ---------------------------------------------------------------------------
registerRoutine('work', (steve) => {
  const hover = robotStore.getState().workCardHover;
  if (hover) {
    if (hover.isTodoScreenshot) {
      steve.setAnim('shrug');
      steve.setExpr('curious');
    } else {
      steve.setAnim('idle');
      steve.setExpr('focused');
    }
  } else {
    steve.setAnim('idle');
    steve.setExpr('excited');
  }
});

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 05 // SKILLS ROUTINE: Stair climbing & slab hover dance
// ---------------------------------------------------------------------------
registerRoutine('skills', (steve) => {
  const hovered = robotStore.getState().hoveredSlab;
  if (hovered) {
    steve.setAnim('dance');
    steve.setExpr('excited');
  } else {
    steve.setAnim('walk');
    steve.setExpr('happy');
  }
});

// ---------------------------------------------------------------------------
// 06 // GITHUB ROUTINE: City tower hopping, flag planting, git push box drop
// ---------------------------------------------------------------------------
registerRoutine('github', (steve) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Hopping across skyline towers like a city
  robotStore.setGithubStage('hopping');
  steve.setAnim('jump');
  steve.setExpr('happy');

  // Stage 2: Lands on tallest tower and plants flag
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('planting');
      steve.setAnim('salute');
      steve.setExpr('focused');
    }
  }, 2200));

  // Stage 3: Pushes "git push" box off the edge
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('pushing');
      steve.setAnim('walk');
      steve.setExpr('focused');
    }
  }, 4400));

  // Stage 4: Box drops, satisfied expression & cheer
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('satisfied');
      steve.setAnim('cheer');
      steve.setExpr('excited');
    }
  }, 6400));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 07 // STATS ROUTINE: HARD dumbbell bicep curls, badge collection, locked shrug
// ---------------------------------------------------------------------------
registerRoutine('stats', (steve) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Lifts dumbbell labelled HARD
  robotStore.setStatsStage('dumbbell');
  steve.setAnim('jump');
  steve.setExpr('focused');

  // Stage 2: Collects earned badges one by one onto chest
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('badges');
      steve.setAnim('jump');
      steve.setExpr('happy');
    }
  }, 2800));

  // Stage 3: Locked badges sad push attempt
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('lockedFlex');
      steve.setAnim('walk');
      steve.setExpr('silly');
    }
  }, 5600));

  // Stage 4: Gives up with a shrug
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('shrug');
      steve.setAnim('shrug');
      steve.setExpr('curious');
    }
  }, 8200));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 08 // EVENTS ROUTINE: Ticket inspector with rubber stamp & winner trophy
// ---------------------------------------------------------------------------
registerRoutine('events', (steve) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Inspects and stamps tickets
  robotStore.setEventsTicketStage('inspecting');
  steve.setAnim('dance');
  steve.setExpr('focused');

  // Stage 2: Winner or Finalist ticket cheer with trophy & flat confetti pop!
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'events') {
      robotStore.setEventsTicketStage('trophy');
      steve.setAnim('cheer');
      steve.setExpr('excited');
    }
  }, 3600));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 09 // JOURNEY ROUTINE: Walks down timeline, evolves with each year
// ---------------------------------------------------------------------------
registerRoutine('journey', (steve) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // 2023: Training wheels
  robotStore.setJourneyYear('2023');
  steve.setAnim('walk');
  steve.setExpr('happy');

  // 2024: Normal robot
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2024');
      steve.setAnim('idle');
      steve.setExpr('focused');
    }
  }, 2500));

  // 2025: Tech Backpack
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2025');
      steve.setAnim('walk');
      steve.setExpr('happy');
    }
  }, 5000));

  // 2026: Jetpack
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2026');
      steve.setAnim('jump');
      steve.setExpr('excited');
    }
  }, 7500));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 10 // CONTACT ROUTINE: Hard hat & hammer build letters, input watcher, rocket
// ---------------------------------------------------------------------------
registerRoutine('contact', (steve) => {
  robotStore.setContactAction('building');
  steve.setAnim('dance');
  steve.setExpr('focused');

  return () => {
    robotStore.setContactInputFocus(null);
  };
});

// ---------------------------------------------------------------------------
// FOOTER ROUTINE: ZZZ sleep & Back to top flight
// ---------------------------------------------------------------------------
registerRoutine('footer', (steve) => {
  robotStore.setFooterSleeping(true);
  steve.setAnim('sleep');
  steve.setExpr('sleepy');

  return () => {
    robotStore.setFooterSleeping(false);
  };
});
