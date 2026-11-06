import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RobotAnimation } from './types';
import { robotStore } from './robotStore';

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
        }, 160);
      }, nextDelay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const t = state.clock.getElapsedTime();
    const dampSpeed = 9;

    // Reset default targets
    let targetBodyY = 0;
    let targetBodyRotX = 0;
    let targetBodyRotY = 0;
    let targetBodyRotZ = 0;

    let targetHeadRotX = 0;
    let targetHeadRotY = 0;
    let targetHeadRotZ = 0;

    // Rest pose: arms angled 15-25 degrees (~0.32 rad) outward from body
    let targetLeftArmRotX = 0;
    let targetLeftArmRotY = 0;
    let targetLeftArmRotZ = 0.32; // Angled outward away from torso

    let targetRightArmRotX = 0;
    let targetRightArmRotY = 0;
    let targetRightArmRotZ = -0.32; // Angled outward away from torso

    let targetLeftLegRotX = 0;
    let targetRightLegRotX = 0;

    let targetAntennaRotZ = 0;

    let targetScaleY = 1.0;
    let targetScaleXZ = 1.0;

    // Cursor tracking for head (within safe bounds)
    if (headTrackCursor && animation !== 'sleep' && animation !== 'dizzy' && animation !== 'spin') {
      const { x: cursorX, y: cursorY } = robotStore.getState().cursor;
      const clampedX = Math.max(-0.35, Math.min(0.35, cursorX * 0.4));
      const clampedY = Math.max(-0.25, Math.min(0.25, cursorY * 0.3));
      targetHeadRotY += clampedX;
      targetHeadRotX -= clampedY;
    }

    switch (animation) {
      case 'idle': {
        // Subtle breathing idle
        const breath = Math.sin(t * 2.4);
        targetBodyY = breath * 0.012;
        targetBodyRotZ = Math.sin(t * 1.2) * 0.01;
        targetLeftArmRotZ = 0.32 + breath * 0.03;
        targetRightArmRotZ = -0.32 - breath * 0.03;
        targetScaleY = 1.0 + breath * 0.02;
        targetScaleXZ = 1.0 - breath * 0.01;
        break;
      }

      case 'blink': {
        const breath = Math.sin(t * 2.4);
        targetBodyY = breath * 0.012;
        break;
      }

      case 'wave': {
        targetBodyY = Math.sin(t * 3) * 0.015;
        targetHeadRotZ = -0.08;
        // Right arm raised high & waving outside body
        targetRightArmRotZ = -2.35;
        targetRightArmRotX = Math.sin(t * 8) * 0.3;
        targetRightArmRotY = -0.2;
        // Left arm resting outward
        targetLeftArmRotZ = 0.32;
        break;
      }

      case 'walk': {
        const walkCycle = Math.sin(t * 6);
        targetBodyY = Math.abs(Math.sin(t * 6)) * 0.03;
        targetBodyRotX = 0.06;
        targetLeftLegRotX = walkCycle * 0.55;
        targetRightLegRotX = -walkCycle * 0.55;
        targetLeftArmRotX = -walkCycle * 0.4;
        targetRightArmRotX = walkCycle * 0.4;
        break;
      }

      case 'run': {
        const runCycle = Math.sin(t * 10);
        targetBodyY = Math.abs(Math.sin(t * 10)) * 0.05;
        targetBodyRotX = 0.18;
        targetLeftLegRotX = runCycle * 0.8;
        targetRightLegRotX = -runCycle * 0.8;
        targetLeftArmRotX = -runCycle * 0.65;
        targetRightArmRotX = runCycle * 0.65;
        break;
      }

      case 'jump': {
        // 1.4s jump cycle with squash and stretch
        const jumpTime = (t * 2.8) % Math.PI;
        const jumpHeight = Math.sin(jumpTime);
        if (jumpHeight > 0.08) {
          // In air: stretched upwards
          targetBodyY = jumpHeight * 0.22;
          targetLeftLegRotX = -0.25 * jumpHeight;
          targetRightLegRotX = -0.25 * jumpHeight;
          targetLeftArmRotZ = 0.45 + jumpHeight * 1.1;
          targetRightArmRotZ = -0.45 - jumpHeight * 1.1;
          targetScaleY = 1.0 + jumpHeight * 0.16;
          targetScaleXZ = 1.0 - jumpHeight * 0.08;
        } else {
          // Landing squash
          targetBodyY = 0;
          targetScaleY = 0.88;
          targetScaleXZ = 1.08;
        }
        targetHeadRotX = -0.12;
        break;
      }

      case 'spin': {
        targetBodyRotY = t * 7;
        targetLeftArmRotZ = 1.35;
        targetRightArmRotZ = -1.35;
        targetBodyY = 0.04 + Math.sin(t * 7) * 0.02;
        break;
      }

      case 'facepalm': {
        targetHeadRotX = 0.32;
        targetHeadRotY = Math.sin(t * 5) * 0.05;
        targetRightArmRotZ = -1.75;
        targetRightArmRotX = 0.85;
        targetRightArmRotY = -0.55;
        targetLeftArmRotZ = 0.32;
        break;
      }

      case 'shrug': {
        targetBodyY = 0.02;
        targetHeadRotZ = 0.16;
        // Both arms bent up, palms out to the sides
        targetLeftArmRotZ = 0.88;
        targetLeftArmRotX = -0.35;
        targetLeftArmRotY = 0.25;
        targetRightArmRotZ = -0.88;
        targetRightArmRotX = -0.35;
        targetRightArmRotY = -0.25;
        break;
      }

      case 'salute': {
        targetBodyRotX = -0.05;
        targetRightArmRotZ = -2.25;
        targetRightArmRotX = 0.82;
        targetRightArmRotY = -0.65;
        targetLeftArmRotZ = 0.28;
        break;
      }

      case 'cheer': {
        const cheerBounce = Math.abs(Math.sin(t * 8)) * 0.07;
        targetBodyY = cheerBounce;
        targetHeadRotX = -0.22;
        targetLeftArmRotZ = 2.35 + Math.sin(t * 8) * 0.18;
        targetRightArmRotZ = -2.35 - Math.sin(t * 8) * 0.18;
        break;
      }

      case 'sleep': {
        targetBodyY = -0.04 + Math.sin(t * 1.2) * 0.01;
        targetHeadRotX = 0.38;
        targetHeadRotZ = 0.12;
        targetLeftArmRotZ = 0.25;
        targetRightArmRotZ = -0.25;
        break;
      }

      case 'dizzy': {
        targetHeadRotX = Math.sin(t * 4.5) * 0.25;
        targetHeadRotZ = Math.cos(t * 4.5) * 0.25;
        targetBodyRotZ = Math.sin(t * 2.5) * 0.12;
        targetLeftArmRotZ = 0.5 + Math.sin(t * 3) * 0.18;
        targetRightArmRotZ = -0.5 - Math.sin(t * 3) * 0.18;
        break;
      }

      case 'dance': {
        const danceBeat = Math.sin(t * 6);
        targetBodyRotZ = danceBeat * 0.15;
        targetBodyY = Math.abs(danceBeat) * 0.04;
        targetLeftArmRotZ = 0.9 + danceBeat * 0.55;
        targetRightArmRotZ = -0.9 + danceBeat * 0.55;
        targetLeftLegRotX = danceBeat * 0.25;
        targetRightLegRotX = -danceBeat * 0.25;
        targetHeadRotZ = -danceBeat * 0.12;
        break;
      }

      case 'flex': {
        // Strongman bicep flex pose
        targetBodyRotX = 0.05;
        targetLeftArmRotZ = 1.35;
        targetLeftArmRotX = 0.5;
        targetLeftArmRotY = 0.35;
        targetRightArmRotZ = -1.35;
        targetRightArmRotX = 0.5;
        targetRightArmRotY = -0.35;
        targetHeadRotX = -0.1;
        break;
      }
    }

    // CLAMP ALL ARM ROTATIONS: Arms & hands NEVER intersect torso or head
    targetLeftArmRotZ = Math.max(0.18, Math.min(2.8, targetLeftArmRotZ));
    targetRightArmRotZ = Math.min(-0.18, Math.max(-2.8, targetRightArmRotZ));
    targetLeftArmRotX = Math.max(-2.0, Math.min(2.0, targetLeftArmRotX));
    targetRightArmRotX = Math.max(-2.0, Math.min(2.0, targetRightArmRotX));
    targetLeftArmRotY = Math.max(-1.0, Math.min(1.0, targetLeftArmRotY));
    targetRightArmRotY = Math.max(-1.0, Math.min(1.0, targetRightArmRotY));

    // Antenna secondary motion (wobble lagging behind head & body tilt)
    const antennaWobble = Math.sin(t * 4.8) * 0.08 - (targetBodyRotZ + targetHeadRotZ) * 0.5;
    targetAntennaRotZ = targetAntennaRotZ + antennaWobble;

    // Apply smooth dampening to bone groups
    if (rootRef.current) {
      rootRef.current.scale.y = THREE.MathUtils.damp(
        rootRef.current.scale.y,
        targetScaleY,
        dampSpeed,
        delta
      );
      rootRef.current.scale.x = THREE.MathUtils.damp(
        rootRef.current.scale.x,
        targetScaleXZ,
        dampSpeed,
        delta
      );
      rootRef.current.scale.z = THREE.MathUtils.damp(
        rootRef.current.scale.z,
        targetScaleXZ,
        dampSpeed,
        delta
      );
    }

    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.damp(
        bodyRef.current.position.y,
        targetBodyY,
        dampSpeed,
        delta
      );
      bodyRef.current.rotation.x = THREE.MathUtils.damp(
        bodyRef.current.rotation.x,
        targetBodyRotX,
        dampSpeed,
        delta
      );
      bodyRef.current.rotation.y = THREE.MathUtils.damp(
        bodyRef.current.rotation.y,
        targetBodyRotY,
        dampSpeed,
        delta
      );
      bodyRef.current.rotation.z = THREE.MathUtils.damp(
        bodyRef.current.rotation.z,
        targetBodyRotZ,
        dampSpeed,
        delta
      );
    }

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.damp(
        headRef.current.rotation.x,
        targetHeadRotX,
        dampSpeed,
        delta
      );
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        targetHeadRotY,
        dampSpeed,
        delta
      );
      headRef.current.rotation.z = THREE.MathUtils.damp(
        headRef.current.rotation.z,
        targetHeadRotZ,
        dampSpeed,
        delta
      );
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.damp(
        leftArmRef.current.rotation.x,
        targetLeftArmRotX,
        dampSpeed,
        delta
      );
      leftArmRef.current.rotation.y = THREE.MathUtils.damp(
        leftArmRef.current.rotation.y,
        targetLeftArmRotY,
        dampSpeed,
        delta
      );
      leftArmRef.current.rotation.z = THREE.MathUtils.damp(
        leftArmRef.current.rotation.z,
        targetLeftArmRotZ,
        dampSpeed,
        delta
      );
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.damp(
        rightArmRef.current.rotation.x,
        targetRightArmRotX,
        dampSpeed,
        delta
      );
      rightArmRef.current.rotation.y = THREE.MathUtils.damp(
        rightArmRef.current.rotation.y,
        targetRightArmRotY,
        dampSpeed,
        delta
      );
      rightArmRef.current.rotation.z = THREE.MathUtils.damp(
        rightArmRef.current.rotation.z,
        targetRightArmRotZ,
        dampSpeed,
        delta
      );
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.damp(
        leftLegRef.current.rotation.x,
        targetLeftLegRotX,
        dampSpeed,
        delta
      );
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.damp(
        rightLegRef.current.rotation.x,
        targetRightLegRotX,
        dampSpeed,
        delta
      );
    }

    if (antennaRef.current) {
      antennaRef.current.rotation.z = THREE.MathUtils.damp(
        antennaRef.current.rotation.z,
        targetAntennaRotZ,
        dampSpeed,
        delta
      );
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
  };
}
