import type { RobotAnimation, RobotExpression } from './types';
import { robotStore } from './robotStore';

export interface RobotRoutineController {
  setAnim: (anim: RobotAnimation) => void;
  setExpr: (expr: RobotExpression) => void;
}

export type RobotRoutine = (bolt: RobotRoutineController) => (() => void) | void;

const routines: Record<string, RobotRoutine> = {};
let currentCleanup: (() => void) | null = null;

export function registerRoutine(sectionId: string, routine: RobotRoutine) {
  routines[sectionId] = routine;
}

export function executeRoutine(sectionId: string, bolt: RobotRoutineController) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  const routine = routines[sectionId];
  if (routine) {
    const cleanup = routine(bolt);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  } else {
    bolt.setAnim('idle');
    bolt.setExpr('happy');
  }
}

// ---------------------------------------------------------------------------
// 01 // HOME ROUTINE
// ---------------------------------------------------------------------------
registerRoutine('home', (bolt) => {
  bolt.setAnim('wave');
  bolt.setExpr('happy');
  const timer = setTimeout(() => {
    if (robotStore.getState().activeSection === 'home') {
      bolt.setAnim('idle');
      bolt.setExpr('happy');
    }
  }, 2400);

  return () => clearTimeout(timer);
});

// ---------------------------------------------------------------------------
// 02 // ABOUT ROUTINE: Stat count up, glitch reaction, facepalm, thumbs-up
// ---------------------------------------------------------------------------
registerRoutine('about', (bolt) => {
  // Sits on top of stat boxes
  const stage = robotStore.getState().aboutGradYearStage;
  if (stage === 'glitch') {
    bolt.setAnim('idle');
    bolt.setExpr('curious');
  } else if (stage === 'facepalm') {
    bolt.setAnim('facepalm');
    bolt.setExpr('curious');
  } else if (stage === 'settled') {
    bolt.setAnim('cheer');
    bolt.setExpr('excited');
  } else {
    bolt.setAnim('idle');
    bolt.setExpr('focused');
  }
});

// ---------------------------------------------------------------------------
// 03 // WORK ROUTINE: Skateboard, card peeking, screenshot pending shrug
// ---------------------------------------------------------------------------
registerRoutine('work', (bolt) => {
  const hover = robotStore.getState().workCardHover;
  if (hover) {
    if (hover.isTodoScreenshot) {
      bolt.setAnim('shrug');
      bolt.setExpr('curious');
    } else {
      bolt.setAnim('idle');
      bolt.setExpr('focused');
    }
  } else {
    bolt.setAnim('idle');
    bolt.setExpr('excited');
  }
});

// ---------------------------------------------------------------------------
// 04 // DESIGN ROUTINE: Figma cursor & ruler, stage actions
// ---------------------------------------------------------------------------
registerRoutine('design', (bolt) => {
  const stage = robotStore.getState().designStage;
  switch (stage) {
    case 'research':
      bolt.setAnim('idle');
      bolt.setExpr('focused');
      break;
    case 'wireframe':
      bolt.setAnim('walk');
      bolt.setExpr('focused');
      break;
    case 'prototype':
      bolt.setAnim('jump');
      bolt.setExpr('excited');
      break;
    case 'build':
      bolt.setAnim('walk');
      bolt.setExpr('happy');
      break;
  }
});

// ---------------------------------------------------------------------------
// 05 // SKILLS ROUTINE: Stair climbing & slab hover dance
// ---------------------------------------------------------------------------
registerRoutine('skills', (bolt) => {
  const hovered = robotStore.getState().hoveredSlab;
  if (hovered) {
    bolt.setAnim('dance');
    bolt.setExpr('excited');
  } else {
    bolt.setAnim('walk');
    bolt.setExpr('happy');
  }
});

// ---------------------------------------------------------------------------
// 06 // GITHUB ROUTINE: City tower hopping, flag planting, git push box drop
// ---------------------------------------------------------------------------
registerRoutine('github', (bolt) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Hopping across skyline towers like a city
  robotStore.setGithubStage('hopping');
  bolt.setAnim('jump');
  bolt.setExpr('happy');

  // Stage 2: Lands on tallest tower and plants flag
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('planting');
      bolt.setAnim('salute');
      bolt.setExpr('focused');
    }
  }, 2200));

  // Stage 3: Pushes "git push" box off the edge
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('pushing');
      bolt.setAnim('walk');
      bolt.setExpr('focused');
    }
  }, 4400));

  // Stage 4: Box drops, satisfied expression & cheer
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'github') {
      robotStore.setGithubStage('satisfied');
      bolt.setAnim('cheer');
      bolt.setExpr('excited');
    }
  }, 6400));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 07 // STATS ROUTINE: HARD dumbbell bicep curls, badge collection, locked shrug
// ---------------------------------------------------------------------------
registerRoutine('stats', (bolt) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Lifts dumbbell labelled HARD
  robotStore.setStatsStage('dumbbell');
  bolt.setAnim('jump');
  bolt.setExpr('focused');

  // Stage 2: Collects earned badges one by one onto chest
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('badges');
      bolt.setAnim('jump');
      bolt.setExpr('happy');
    }
  }, 2800));

  // Stage 3: Locked badges sad push attempt
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('lockedFlex');
      bolt.setAnim('walk');
      bolt.setExpr('silly');
    }
  }, 5600));

  // Stage 4: Gives up with a shrug
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'stats') {
      robotStore.setStatsStage('shrug');
      bolt.setAnim('shrug');
      bolt.setExpr('curious');
    }
  }, 8200));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 08 // EVENTS ROUTINE: Ticket inspector with rubber stamp & winner trophy
// ---------------------------------------------------------------------------
registerRoutine('events', (bolt) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Stage 1: Inspects and stamps tickets
  robotStore.setEventsTicketStage('inspecting');
  bolt.setAnim('dance');
  bolt.setExpr('focused');

  // Stage 2: Winner or Finalist ticket cheer with trophy & flat confetti pop!
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'events') {
      robotStore.setEventsTicketStage('trophy');
      bolt.setAnim('cheer');
      bolt.setExpr('excited');
    }
  }, 3600));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 09 // JOURNEY ROUTINE: Walks down timeline, evolves with each year
// ---------------------------------------------------------------------------
registerRoutine('journey', (bolt) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // 2023: Training wheels
  robotStore.setJourneyYear('2023');
  bolt.setAnim('walk');
  bolt.setExpr('happy');

  // 2024: Normal robot
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2024');
      bolt.setAnim('idle');
      bolt.setExpr('focused');
    }
  }, 2500));

  // 2025: Tech Backpack
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2025');
      bolt.setAnim('walk');
      bolt.setExpr('happy');
    }
  }, 5000));

  // 2026: Jetpack
  timers.push(setTimeout(() => {
    if (robotStore.getState().activeSection === 'journey') {
      robotStore.setJourneyYear('2026');
      bolt.setAnim('jump');
      bolt.setExpr('excited');
    }
  }, 7500));

  return () => {
    timers.forEach(clearTimeout);
  };
});

// ---------------------------------------------------------------------------
// 10 // CONTACT ROUTINE: Hard hat & hammer build letters, input watcher, rocket
// ---------------------------------------------------------------------------
registerRoutine('contact', (bolt) => {
  robotStore.setContactAction('building');
  bolt.setAnim('dance');
  bolt.setExpr('focused');

  return () => {
    robotStore.setContactInputFocus(null);
  };
});

// ---------------------------------------------------------------------------
// FOOTER ROUTINE: ZZZ sleep & Back to top flight
// ---------------------------------------------------------------------------
registerRoutine('footer', (bolt) => {
  robotStore.setFooterSleeping(true);
  bolt.setAnim('sleep');
  bolt.setExpr('sleepy');

  return () => {
    robotStore.setFooterSleeping(false);
  };
});
