import { computeSteveTracking, TRACKING_CONFIG } from './steveTracking';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RobotAnimation } from './types';
import { robotStore } from './robotStore';
import { RIG } from './rigConstants';

export interface PoseAngles {
  bodyY: number;
  bodyRotX: number;
  bodyRotY: number;
  bodyRotZ: number;
  headRotX: number;
  headRotY: number;
  headRotZ: number;
  leftArmRotX: number;
  leftArmRotY: number;
  leftArmRotZ: number;
  rightArmRotX: number;
  rightArmRotY: number;
  rightArmRotZ: number;
  leftLegRotX: number;
  rightLegRotX: number;
  antennaRotZ: number;
  scaleY: number;
  scaleXZ: number;
}

const DEFAULT_POSE: PoseAngles = {
  bodyY: 0,
  bodyRotX: 0,
  bodyRotY: 0,
  bodyRotZ: 0,
  headRotX: 0,
  headRotY: 0,
  headRotZ: 0,
  leftArmRotX: 0,
  leftArmRotY: 0,
  leftArmRotZ: -RIG.LIMITS.ARM_REST_OUTWARD,
  rightArmRotX: 0,
  rightArmRotY: 0,
  rightArmRotZ: RIG.LIMITS.ARM_REST_OUTWARD,
  leftLegRotX: 0,
  rightLegRotX: 0,
  antennaRotZ: 0,
  scaleY: 1.0,
  scaleXZ: 1.0,
};

export function useRobotAnimation(
  animation: RobotAnimation = 'idle',
  headTrackCursor = true,
  reducedMotion = false
) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);

  const [isBlinking, setIsBlinking] = useState(false);

  // Pose blending crossfade state (180ms crossfade between animation clips)
  const prevAnimRef = useRef<RobotAnimation>(animation);
  const prevPoseRef = useRef<PoseAngles>({ ...DEFAULT_POSE });
  const blendWeightRef = useRef(1.0); // 1.0 means fully current pose

  // Stride & walk cycle foot-plant accumulator
  const walkPhaseRef = useRef(0);
  const jumpTimerRef = useRef(0);

  // Antenna secondary motion velocity
  const antennaVelocityRef = useRef(0);
  const prevHeadRotZRef = useRef(0);
  const smoothTrackingRotX = useRef(0);
  const smoothTrackingRotY = useRef(0);
  const smoothPupilOffset = useRef({ x: 0, y: 0 });

  // Natural blink loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const nextDelay = 2200 + Math.random() * 2800;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, nextDelay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Detect animation clip transitions and initiate pose crossfade
  useEffect(() => {
    if (animation !== prevAnimRef.current) {
      prevAnimRef.current = animation;
      blendWeightRef.current = 0.0; // Start crossfade
      jumpTimerRef.current = 0;
    }
  }, [animation]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1); // Clamp delta to avoid huge jumps on tab switch

    // Advance pose crossfade (180ms blend duration)
    if (blendWeightRef.current < 1.0) {
      blendWeightRef.current = Math.min(1.0, blendWeightRef.current + dt / 0.18);
    }

    // Compute raw target pose for current animation clip
    const currentPose: PoseAngles = { ...DEFAULT_POSE };

    switch (animation) {
      case 'idle': {
        const breath = Math.sin(t * 2.4);
        currentPose.bodyY = breath * 0.012;
        currentPose.bodyRotZ = Math.sin(t * 1.2) * 0.01;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - breath * 0.03;
        currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + breath * 0.03;
        currentPose.antennaRotZ = Math.sin(t * 3.6) * 0.14;
        currentPose.scaleY = 1.0 + breath * 0.02;
        currentPose.scaleXZ = 1.0 - breath * 0.01;
        break;
      }

      case 'blink': {
        const breath = Math.sin(t * 2.4);
        currentPose.bodyY = breath * 0.012;
        break;
      }

      case 'wave': {
        currentPose.bodyY = Math.sin(t * 3.2) * 0.015;
        currentPose.headRotZ = -0.08;
        // Right arm raised high & waving outside body
        currentPose.rightArmRotZ = 2.35;
        currentPose.rightArmRotX = Math.sin(t * 8.5) * 0.32;
        currentPose.rightArmRotY = -0.22;
        // Left arm resting outward
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD;
        break;
      }

      case 'walk': {
        walkPhaseRef.current += dt * 6.5;
        const phase = walkPhaseRef.current;
        const legSwing = Math.sin(phase);

        // Foot-plant solver & pelvic dynamics:
        currentPose.bodyY = Math.abs(Math.sin(phase)) * 0.028;
        currentPose.bodyRotZ = Math.sin(phase) * 0.035;
        currentPose.bodyRotX = 0.065; // Lean forward into travel direction

        // Counter-phase limb swings
        currentPose.leftLegRotX = legSwing * 0.52;
        currentPose.rightLegRotX = -legSwing * 0.52;

        currentPose.leftArmRotX = -legSwing * 0.38;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - 0.05;

        currentPose.rightArmRotX = legSwing * 0.38;
        currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + 0.05;
        break;
      }

      case 'run': {
        walkPhaseRef.current += dt * 10.5;
        const phase = walkPhaseRef.current;
        const legSwing = Math.sin(phase);

        currentPose.bodyY = Math.abs(Math.sin(phase)) * 0.045;
        currentPose.bodyRotX = 0.16;
        currentPose.bodyRotZ = Math.sin(phase) * 0.05;

        currentPose.leftLegRotX = legSwing * 0.72;
        currentPose.rightLegRotX = -legSwing * 0.72;

        currentPose.leftArmRotX = -legSwing * 0.58;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - 0.12;

        currentPose.rightArmRotX = legSwing * 0.58;
        currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + 0.12;
        break;
      }

      case 'jump': {
        jumpTimerRef.current += dt;
        const cycle = jumpTimerRef.current % 1.4;

        if (cycle < 0.12) {
          // 1. Anticipation Squat (0 - 120ms)
          const p = cycle / 0.12;
          currentPose.bodyY = -0.045 * p;
          currentPose.scaleY = 1.0 - 0.14 * p;
          currentPose.scaleXZ = 1.0 + 0.08 * p;
          currentPose.leftArmRotX = -0.35 * p;
          currentPose.rightArmRotX = -0.35 * p;
          currentPose.leftLegRotX = 0.2 * p;
          currentPose.rightLegRotX = 0.2 * p;
        } else if (cycle < 0.48) {
          // 2. Launch & Stretch (120ms - 480ms): Whole body leaves ground, legs extend on takeoff
          const p = (cycle - 0.12) / 0.36;
          const arc = Math.sin(p * Math.PI * 0.5);
          currentPose.bodyY = arc * 0.26;
          currentPose.scaleY = 1.0 + 0.14 * (1 - p * 0.5);
          currentPose.scaleXZ = 1.0 - 0.07 * (1 - p * 0.5);
          currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - 0.9 * p;
          currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + 0.9 * p;
          currentPose.leftLegRotX = -0.12 * (1 - p);
          currentPose.rightLegRotX = -0.12 * (1 - p);
        } else if (cycle < 0.65) {
          // 3. Apex Hold & Tuck (480ms - 650ms): Legs tuck slightly at apex
          const p = (cycle - 0.48) / 0.17;
          currentPose.bodyY = 0.26 - 0.02 * p;
          currentPose.scaleY = 1.02;
          currentPose.scaleXZ = 0.99;
          currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - 0.9;
          currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + 0.9;
          currentPose.leftLegRotX = 0.32;
          currentPose.rightLegRotX = 0.32;
        } else if (cycle < 0.95) {
          // 4. Descent & Landing Extension (650ms - 950ms): Legs extend for landing contact
          const p = (cycle - 0.65) / 0.30;
          const arc = Math.cos(p * Math.PI * 0.5);
          currentPose.bodyY = 0.24 * arc;
          currentPose.scaleY = 1.0 + 0.06 * arc;
          currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD - 0.9 * arc;
          currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD + 0.9 * arc;
          currentPose.leftLegRotX = 0.32 * (1 - p);
          currentPose.rightLegRotX = 0.32 * (1 - p);
        } else if (cycle < 1.15) {
          // 5. Landing Impact Squash (950ms - 1150ms)
          const p = (cycle - 0.95) / 0.20;
          const squash = Math.sin(p * Math.PI);
          currentPose.bodyY = -0.04 * squash;
          currentPose.scaleY = 1.0 - 0.16 * squash;
          currentPose.scaleXZ = 1.0 + 0.10 * squash;
          currentPose.leftLegRotX = 0.20 * squash;
          currentPose.rightLegRotX = 0.20 * squash;
        } else {
          // 6. Recovery to Idle (1150ms - 1400ms)
          const p = (cycle - 1.15) / 0.25;
          currentPose.bodyY = 0;
          currentPose.scaleY = THREE.MathUtils.lerp(0.84, 1.0, p);
          currentPose.scaleXZ = THREE.MathUtils.lerp(1.12, 1.0, p);
        }
        break;
      }

      case 'dance': {
        const beatClock = (t * 2.0) % 8.0;
        const beatIndex = Math.floor(beatClock);
        const beatFract = beatClock - beatIndex;
        const bounce = Math.sin(beatFract * Math.PI);

        switch (beatIndex) {
          case 0: // Move 1: Bounce Step
            currentPose.bodyY = bounce * 0.038;
            currentPose.bodyRotZ = Math.sin(beatFract * Math.PI * 2) * 0.08;
            currentPose.leftArmRotZ = -0.65 - bounce * 0.35;
            currentPose.rightArmRotZ = 0.65 + bounce * 0.35;
            currentPose.leftLegRotX = bounce * 0.28;
            currentPose.rightLegRotX = -bounce * 0.28;
            currentPose.headRotZ = -Math.sin(beatFract * Math.PI) * 0.12;
            break;

          case 1: // Move 2: Arm Pumps
            currentPose.bodyY = bounce * 0.032;
            currentPose.rightArmRotZ = 2.25 + Math.sin(beatFract * Math.PI * 2) * 0.25;
            currentPose.rightArmRotX = 0.25;
            currentPose.leftArmRotZ = -0.42;
            currentPose.headRotX = -0.12;
            break;

          case 2: // Move 3: Disco Point Right
            currentPose.bodyRotZ = 0.12;
            currentPose.bodyRotX = -0.06;
            currentPose.rightArmRotZ = 1.95;
            currentPose.rightArmRotX = 0.45;
            currentPose.leftArmRotZ = -0.45;
            currentPose.headRotY = -0.22;
            currentPose.headRotZ = -0.15;
            break;

          case 3: // Move 4: Disco Point Left
            currentPose.bodyRotZ = -0.12;
            currentPose.bodyRotX = -0.06;
            currentPose.leftArmRotZ = -1.95;
            currentPose.leftArmRotX = 0.45;
            currentPose.rightArmRotZ = 0.45;
            currentPose.headRotY = 0.22;
            currentPose.headRotZ = 0.15;
            break;

          case 4: // Move 5: Hip Sway
            currentPose.bodyRotZ = Math.sin(beatFract * Math.PI * 2) * 0.18;
            currentPose.leftArmRotZ = -1.15;
            currentPose.rightArmRotZ = 1.15;
            currentPose.headRotZ = -Math.sin(beatFract * Math.PI * 2) * 0.15;
            break;

          case 5: // Move 6: Robot Mechanical Stiff Arms
            currentPose.bodyRotX = 0.05;
            currentPose.leftArmRotZ = -1.57;
            currentPose.leftArmRotX = beatFract > 0.5 ? 0.75 : -0.35;
            currentPose.rightArmRotZ = 1.57;
            currentPose.rightArmRotX = beatFract > 0.5 ? -0.35 : 0.75;
            currentPose.headRotX = beatFract > 0.5 ? 0.15 : -0.15;
            break;

          case 6: // Move 7: Quick Pirouette Spin
            currentPose.bodyRotY = beatFract * Math.PI * 2;
            currentPose.bodyY = 0.04 + bounce * 0.03;
            currentPose.leftArmRotZ = -1.35;
            currentPose.rightArmRotZ = 1.35;
            break;

          case 7: // Move 8: Victory Finish Pose
            currentPose.bodyRotX = -0.08;
            currentPose.leftArmRotZ = -2.15;
            currentPose.leftArmRotX = 0.45;
            currentPose.rightArmRotZ = 2.15;
            currentPose.rightArmRotX = 0.45;
            currentPose.headRotX = -0.18;
            currentPose.antennaRotZ = Math.sin(t * 12) * 0.22;
            break;
        }
        break;
      }

      case 'spin': {
        currentPose.bodyRotY = t * 7.5;
        currentPose.leftArmRotZ = -1.35;
        currentPose.rightArmRotZ = 1.35;
        currentPose.bodyY = 0.04 + Math.sin(t * 7.5) * 0.02;
        break;
      }

      case 'facepalm': {
        currentPose.headRotX = 0.32;
        currentPose.headRotY = Math.sin(t * 5) * 0.05;
        currentPose.rightArmRotZ = 1.75;
        currentPose.rightArmRotX = 0.85;
        currentPose.rightArmRotY = -0.55;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD;
        break;
      }

      case 'shrug': {
        currentPose.bodyY = 0.02;
        currentPose.headRotZ = 0.16;
        currentPose.leftArmRotZ = -0.88;
        currentPose.leftArmRotX = -0.35;
        currentPose.leftArmRotY = 0.25;
        currentPose.rightArmRotZ = 0.88;
        currentPose.rightArmRotX = -0.35;
        currentPose.rightArmRotY = -0.25;
        break;
      }

      case 'salute': {
        currentPose.bodyRotX = -0.05;
        currentPose.rightArmRotZ = 2.25;
        currentPose.rightArmRotX = 0.82;
        currentPose.rightArmRotY = -0.65;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD;
        break;
      }

      case 'cheer': {
        const cheerBounce = Math.abs(Math.sin(t * 8.5)) * 0.065;
        currentPose.bodyY = cheerBounce;
        currentPose.headRotX = -0.22;
        currentPose.leftArmRotZ = -2.35 - Math.sin(t * 8.5) * 0.18;
        currentPose.rightArmRotZ = 2.35 + Math.sin(t * 8.5) * 0.18;
        break;
      }

      case 'sleep': {
        currentPose.bodyY = -0.04 + Math.sin(t * 1.2) * 0.01;
        currentPose.headRotX = 0.38;
        currentPose.headRotZ = 0.12;
        currentPose.leftArmRotZ = -RIG.LIMITS.ARM_REST_OUTWARD * 0.85;
        currentPose.rightArmRotZ = RIG.LIMITS.ARM_REST_OUTWARD * 0.85;
        break;
      }

      case 'dizzy': {
        currentPose.headRotX = Math.sin(t * 4.5) * 0.25;
        currentPose.headRotZ = Math.cos(t * 4.5) * 0.25;
        currentPose.bodyRotZ = Math.sin(t * 2.5) * 0.12;
        currentPose.leftArmRotZ = -0.5 - Math.sin(t * 3) * 0.18;
        currentPose.rightArmRotZ = 0.5 + Math.sin(t * 3) * 0.18;
        break;
      }

      case 'flex': {
        currentPose.bodyRotX = 0.05;
        currentPose.leftArmRotZ = -1.35;
        currentPose.leftArmRotX = 0.5;
        currentPose.leftArmRotY = 0.35;
        currentPose.rightArmRotZ = 1.35;
        currentPose.rightArmRotX = 0.5;
        currentPose.rightArmRotY = -0.35;
        currentPose.headRotX = -0.1;
        break;
      }

      case 'seated': {
        // Hips on the seat, thighs forward, one leg crossed at ankle/knee
        currentPose.bodyY = -0.14;
        currentPose.bodyRotX = -0.21; // ~12 deg lean back against chair back
        
        // Thighs forward
        currentPose.leftLegRotX = -1.48;
        currentPose.rightLegRotX = -1.35;

        // One leg crossed over the other at ankle or knee
        const subPhase = (t * 0.8) % 6;
        if (subPhase < 2) {
          // Foot tap: crossed foot bounces rhythmically
          const tap = Math.sin(t * 9) * 0.09;
          currentPose.rightLegRotX = -1.35 + tap;
        } else if (subPhase < 4) {
          // Sip coffee: mug tilts up, head tilts back slightly
          const sip = Math.sin((subPhase - 2) * Math.PI);
          currentPose.rightArmRotX = 0.72 + sip * 0.45;
          currentPose.headRotX = -0.05 - sip * 0.14;
        }

        // Left arm resting relaxed behind his head
        currentPose.leftArmRotZ = -2.15;
        currentPose.leftArmRotX = -0.55;
        currentPose.leftArmRotY = 0.45;

        // Right arm holding coffee mug
        if (subPhase >= 4) {
          currentPose.rightArmRotZ = 0.55;
          currentPose.rightArmRotX = 0.72;
          currentPose.rightArmRotY = -0.25;
          currentPose.headRotY = Math.sin(t * 2) * 0.15;
        } else if (subPhase < 2) {
          currentPose.rightArmRotZ = 0.55;
          currentPose.rightArmRotX = 0.72;
          currentPose.rightArmRotY = -0.25;
        }
        break;
      }

      case 'flight': {
        // Superhero flight posture: 20-30 deg forward tilt, legs trailing, looking forward
        currentPose.bodyY = 0.14 + Math.sin(t * 8) * 0.02;
        currentPose.bodyRotX = 0.48; // ~27 deg forward tilt
        currentPose.headRotX = -0.38; // head tilted up looking where he flies
        currentPose.headRotY = Math.sin(t * 3) * 0.08;

        // Arms trailing back smoothly
        currentPose.leftArmRotX = 2.45;
        currentPose.rightArmRotX = 2.45;
        currentPose.leftArmRotZ = -0.22;
        currentPose.rightArmRotZ = 0.22;

        // Legs trailing back
        currentPose.leftLegRotX = 0.38;
        currentPose.rightLegRotX = 0.38;

        // Antenna flutter in high-speed wind
        currentPose.antennaRotZ = Math.sin(t * 18) * 0.28;
        break;
      }
    }

    // Blend between previous pose and current pose (crossfade)
    const blend = blendWeightRef.current;
    const targetPose: PoseAngles = {
      bodyY: THREE.MathUtils.lerp(prevPoseRef.current.bodyY, currentPose.bodyY, blend),
      bodyRotX: THREE.MathUtils.lerp(prevPoseRef.current.bodyRotX, currentPose.bodyRotX, blend),
      bodyRotY: THREE.MathUtils.lerp(prevPoseRef.current.bodyRotY, currentPose.bodyRotY, blend),
      bodyRotZ: THREE.MathUtils.lerp(prevPoseRef.current.bodyRotZ, currentPose.bodyRotZ, blend),
      headRotX: THREE.MathUtils.lerp(prevPoseRef.current.headRotX, currentPose.headRotX, blend),
      headRotY: THREE.MathUtils.lerp(prevPoseRef.current.headRotY, currentPose.headRotY, blend),
      headRotZ: THREE.MathUtils.lerp(prevPoseRef.current.headRotZ, currentPose.headRotZ, blend),
      leftArmRotX: THREE.MathUtils.lerp(prevPoseRef.current.leftArmRotX, currentPose.leftArmRotX, blend),
      leftArmRotY: THREE.MathUtils.lerp(prevPoseRef.current.leftArmRotY, currentPose.leftArmRotY, blend),
      leftArmRotZ: THREE.MathUtils.lerp(prevPoseRef.current.leftArmRotZ, currentPose.leftArmRotZ, blend),
      rightArmRotX: THREE.MathUtils.lerp(prevPoseRef.current.rightArmRotX, currentPose.rightArmRotX, blend),
      rightArmRotY: THREE.MathUtils.lerp(prevPoseRef.current.rightArmRotY, currentPose.rightArmRotY, blend),
      rightArmRotZ: THREE.MathUtils.lerp(prevPoseRef.current.rightArmRotZ, currentPose.rightArmRotZ, blend),
      leftLegRotX: THREE.MathUtils.lerp(prevPoseRef.current.leftLegRotX, currentPose.leftLegRotX, blend),
      rightLegRotX: THREE.MathUtils.lerp(prevPoseRef.current.rightLegRotX, currentPose.rightLegRotX, blend),
      antennaRotZ: THREE.MathUtils.lerp(prevPoseRef.current.antennaRotZ, currentPose.antennaRotZ, blend),
      scaleY: THREE.MathUtils.lerp(prevPoseRef.current.scaleY, currentPose.scaleY, blend),
      scaleXZ: THREE.MathUtils.lerp(prevPoseRef.current.scaleXZ, currentPose.scaleXZ, blend),
    };

    // Save as current blend snapshot for next transition
    if (blend >= 1.0) {
      prevPoseRef.current = { ...currentPose };
    }

    // Additive cursor look-at for head and eyes (screen-space physics)
    if (headTrackCursor && animation !== 'sleep' && animation !== 'dizzy' && animation !== 'spin') {
      const { pointerScreen, dockSteveHeadPos } = robotStore.getState();
      const headX = dockSteveHeadPos.headX || 112;
      const headY = dockSteveHeadPos.headY || (typeof window !== 'undefined' ? window.innerHeight * 0.45 : 350);

      const tracking = computeSteveTracking(
        pointerScreen.clientX,
        pointerScreen.clientY,
        headX,
        headY,
        pointerScreen.active
      );

      // Smooth with lerp (0.12), eyes lead and head follows at 60%
      smoothTrackingRotX.current = THREE.MathUtils.lerp(smoothTrackingRotX.current, tracking.threeRotX, TRACKING_CONFIG.LERP_SPEED);
      smoothTrackingRotY.current = THREE.MathUtils.lerp(smoothTrackingRotY.current, tracking.threeRotY, TRACKING_CONFIG.LERP_SPEED);
      smoothPupilOffset.current.x = THREE.MathUtils.lerp(smoothPupilOffset.current.x, tracking.pupilOffsetX, TRACKING_CONFIG.LERP_SPEED);
      smoothPupilOffset.current.y = THREE.MathUtils.lerp(smoothPupilOffset.current.y, tracking.pupilOffsetY, TRACKING_CONFIG.LERP_SPEED);

      targetPose.headRotX += smoothTrackingRotX.current;
      targetPose.headRotY += smoothTrackingRotY.current;
    } else {
      smoothTrackingRotX.current = THREE.MathUtils.lerp(smoothTrackingRotX.current, 0, 0.12);
      smoothTrackingRotY.current = THREE.MathUtils.lerp(smoothTrackingRotY.current, 0, 0.12);
      smoothPupilOffset.current.x = THREE.MathUtils.lerp(smoothPupilOffset.current.x, 0, 0.12);
      smoothPupilOffset.current.y = THREE.MathUtils.lerp(smoothPupilOffset.current.y, 0, 0.12);
    }

    // Additive antenna secondary motion (damped spring based on head angular acceleration)
    const headRotDeltaZ = targetPose.headRotZ - prevHeadRotZRef.current;
    prevHeadRotZRef.current = targetPose.headRotZ;
    antennaVelocityRef.current += -headRotDeltaZ * 8.0 - targetPose.antennaRotZ * 12.0 * dt;
    antennaVelocityRef.current *= Math.exp(-6.0 * dt); // Spring damping
    targetPose.antennaRotZ += antennaVelocityRef.current * dt;

    // Strict clamping of arm outward roll to prevent any torso penetration
    // Left arm outward is negative Z (<= -0.18 rad); Right arm outward is positive Z (>= +0.18 rad)
    targetPose.leftArmRotZ = Math.min(-RIG.LIMITS.SHOULDER_ROLL_OUT_MIN, targetPose.leftArmRotZ);
    targetPose.rightArmRotZ = Math.max(RIG.LIMITS.SHOULDER_ROLL_OUT_MIN, targetPose.rightArmRotZ);

    // Apply damped springs to Three.js refs (frame-rate independent)
    const dampSpeed = 12.0;

    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.damp(bodyRef.current.position.y, targetPose.bodyY + RIG.TORSO.Y, dampSpeed, dt);
      bodyRef.current.rotation.x = THREE.MathUtils.damp(bodyRef.current.rotation.x, targetPose.bodyRotX, dampSpeed, dt);
      bodyRef.current.rotation.y = THREE.MathUtils.damp(bodyRef.current.rotation.y, targetPose.bodyRotY, dampSpeed, dt);
      bodyRef.current.rotation.z = THREE.MathUtils.damp(bodyRef.current.rotation.z, targetPose.bodyRotZ, dampSpeed, dt);
      bodyRef.current.scale.y = THREE.MathUtils.damp(bodyRef.current.scale.y, targetPose.scaleY, dampSpeed, dt);
      bodyRef.current.scale.x = THREE.MathUtils.damp(bodyRef.current.scale.x, targetPose.scaleXZ, dampSpeed, dt);
      bodyRef.current.scale.z = THREE.MathUtils.damp(bodyRef.current.scale.z, targetPose.scaleXZ, dampSpeed, dt);
    }

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, targetPose.headRotX, dampSpeed, dt);
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetPose.headRotY, dampSpeed, dt);
      headRef.current.rotation.z = THREE.MathUtils.damp(headRef.current.rotation.z, targetPose.headRotZ, dampSpeed, dt);
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, targetPose.leftArmRotX, dampSpeed, dt);
      leftArmRef.current.rotation.y = THREE.MathUtils.damp(leftArmRef.current.rotation.y, targetPose.leftArmRotY, dampSpeed, dt);
      leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, targetPose.leftArmRotZ, dampSpeed, dt);
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, targetPose.rightArmRotX, dampSpeed, dt);
      rightArmRef.current.rotation.y = THREE.MathUtils.damp(rightArmRef.current.rotation.y, targetPose.rightArmRotY, dampSpeed, dt);
      rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, targetPose.rightArmRotZ, dampSpeed, dt);
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, targetPose.leftLegRotX, dampSpeed, dt);
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, targetPose.rightLegRotX, dampSpeed, dt);
    }

    if (antennaRef.current) {
      antennaRef.current.rotation.z = THREE.MathUtils.damp(antennaRef.current.rotation.z, targetPose.antennaRotZ, dampSpeed, dt);
    }
  });

  return {
    rootRef,
    headRef,
    bodyRef,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
    antennaRef,
    isBlinking,
    pupilOffsetRef: smoothPupilOffset,
  };
}
