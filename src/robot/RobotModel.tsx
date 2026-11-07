import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import type { RobotVariant, RobotExpression, RobotAnimation, RobotAccessories } from './types';
import { VARIANT_CONFIGS } from './types';
import { RobotFaceTexture } from './FaceCanvas';
import { RobotHardShadow } from './materials';
import { useRobotAnimation } from './useRobotAnimation';
import { robotStore } from './robotStore';
import { RIG } from './rigConstants';

interface RobotModelProps {
  variant?: RobotVariant;
  expression?: RobotExpression;
  animation?: RobotAnimation;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  headTrackCursor?: boolean;
  onClick?: () => void;
  accessories?: RobotAccessories;
  facing?: 1 | -1;
}

export const RobotModel: React.FC<RobotModelProps> = ({
  variant = 'steve',
  expression = 'happy',
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  headTrackCursor = true,
  onClick,
  accessories,
  facing = 1,
}) => {
  const config = VARIANT_CONFIGS[variant];
  const finalScale = scale ?? config.scale;

  // Face texture instance
  const face = useMemo(() => {
    return new RobotFaceTexture(config.visorBgColor, config.pixelColor);
  }, [config.visorBgColor, config.pixelColor]);

  useEffect(() => {
    face.setColors(config.visorBgColor, config.pixelColor);
    face.setExpression(expression);
  }, [face, config.visorBgColor, config.pixelColor, expression]);

  useEffect(() => {
    return () => face.dispose();
  }, [face]);

  // Check reduced motion
  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  const {
    rootRef,
    headRef,
    bodyRef,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
    antennaRef,
    isBlinking,
  } = useRobotAnimation(animation, headTrackCursor, prefersReducedMotion);

  // Sync blink state to face texture
  useEffect(() => {
    face.setBlink(isBlinking);
  }, [face, isBlinking]);

  // Self-check: Box3 intersection tests in ?robotDebug=1 mode
  const torsoMeshRef = useRef<THREE.Mesh>(null);
  const leftArmGroupRef = useRef<THREE.Group>(null);
  const rightArmGroupRef = useRef<THREE.Group>(null);
  const [hasCollision, setHasCollision] = useState(false);
  const [hipDetachViolation, setHipDetachViolation] = useState<number | null>(null);
  const [shadowJumpProps, setShadowJumpProps] = useState({ scale: 1.0, opacity: 0.88, z: 0.02 });

  useFrame((state) => {
    // Skip uninitialized first few frames
    if (state.clock.getElapsedTime() < 0.15) return;

    const isDebug = typeof window !== 'undefined' &&
      (window.location.search.includes('robotDebug=1') || robotStore.getState().isDebug);

    // Compute dynamic ground shadow scaling, fading, and foot following
    if (bodyRef.current) {
      const jumpElevation = Math.max(0, bodyRef.current.position.y - RIG.TORSO.Y);
      const s = Math.max(0.35, 1.0 - jumpElevation * 1.6);
      const op = Math.max(0.15, 0.88 - jumpElevation * 1.8);
      let feetZ = 0.02;
      if (leftLegRef.current && rightLegRef.current) {
        const swing = (Math.sin(leftLegRef.current.rotation.x) + Math.sin(rightLegRef.current.rotation.x)) * 0.5;
        feetZ = swing * RIG.LEG.L * 0.35 + 0.02;
      }
      setShadowJumpProps(prev => (
        Math.abs(prev.scale - s) > 0.02 || Math.abs(prev.opacity - op) > 0.02 || Math.abs(prev.z - feetZ) > 0.01
          ? { scale: s, opacity: op, z: feetZ }
          : prev
      ));
    }

    // Part 4 Assertion: Check hip socket to leg joint distance <= 0.05 in ?robotDebug=1
    if (isDebug && bodyRef.current && leftLegRef.current && rightLegRef.current) {
      bodyRef.current.updateWorldMatrix(true, true);
      leftLegRef.current.updateWorldMatrix(true, true);
      rightLegRef.current.updateWorldMatrix(true, true);

      const leftHipSocketWorld = new THREE.Vector3(-RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0).applyMatrix4(bodyRef.current.matrixWorld);
      const leftLegPivotWorld = new THREE.Vector3(0, 0, 0).applyMatrix4(leftLegRef.current.matrixWorld);
      const leftDist = leftHipSocketWorld.distanceTo(leftLegPivotWorld);

      const rightHipSocketWorld = new THREE.Vector3(RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0).applyMatrix4(bodyRef.current.matrixWorld);
      const rightLegPivotWorld = new THREE.Vector3(0, 0, 0).applyMatrix4(rightLegRef.current.matrixWorld);
      const rightDist = rightHipSocketWorld.distanceTo(rightLegPivotWorld);

      const maxDist = Math.max(leftDist, rightDist);
      if (maxDist > 0.05) {
        console.error('[ROBOT ASSERTION VIOLATION] Hip detachment exceeded 0.05! dist=' + maxDist.toFixed(4));
        setHipDetachViolation(maxDist);
      }
    }

    if (isDebug && bodyRef.current && torsoMeshRef.current && leftArmGroupRef.current && rightArmGroupRef.current) {
      // Force hierarchical world matrix update for accurate transform sampling
      bodyRef.current.updateWorldMatrix(true, true);

      // Compute collision in body/torso local coordinate space to prevent false-positive
      // AABB diagonal expansion from world-space robot rotation
      const bodyInv = bodyRef.current.matrixWorld.clone().invert();

      // Torso box in body local space (with 5mm inset tolerance margin)
      const torsoBoxLocal = new THREE.Box3(
        new THREE.Vector3(-RIG.TORSO.W / 2 + 0.005, -RIG.TORSO.H / 2 + 0.005, -RIG.TORSO.D / 2 + 0.005),
        new THREE.Vector3(RIG.TORSO.W / 2 - 0.005, RIG.TORSO.H / 2 - 0.005, RIG.TORSO.D / 2 - 0.005)
      );

      const getArmBoxInBodySpace = (armGroup: THREE.Group) => {
        const box = new THREE.Box3();
        armGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
            const mesh = child as THREE.Mesh;
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            const geomBox = mesh.geometry.boundingBox!;
            const m = new THREE.Matrix4().multiplyMatrices(bodyInv, mesh.matrixWorld);
            const transformedBox = geomBox.clone().applyMatrix4(m);
            box.union(transformedBox);
          }
        });
        return box;
      };

      const leftBox = getArmBoxInBodySpace(leftArmGroupRef.current);
      const rightBox = getArmBoxInBodySpace(rightArmGroupRef.current);

      const collision = (!leftBox.isEmpty() && leftBox.intersectsBox(torsoBoxLocal)) ||
                        (!rightBox.isEmpty() && rightBox.intersectsBox(torsoBoxLocal));

      if (collision !== hasCollision) {
        setHasCollision(collision);
        if (collision) {
          console.warn('[ROBOT SELF-CHECK VIOLATION] Arm mesh intersected torso!', {
            left: leftBox.intersectsBox(torsoBoxLocal),
            right: rightBox.intersectsBox(torsoBoxLocal),
            torsoMin: torsoBoxLocal.min.toArray(),
            torsoMax: torsoBoxLocal.max.toArray(),
            leftMin: leftBox.min.toArray(),
            leftMax: leftBox.max.toArray(),
            rightMin: rightBox.min.toArray(),
            rightMax: rightBox.max.toArray(),
          });
        }
      }
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={rotation}
      scale={[finalScale, finalScale, finalScale]}
    >
      {/* Attached ground contact shadow (directly flush under feet soles, zero detached pill) */}
      <RobotHardShadow width={0.34 * shadowJumpProps.scale} depth={0.16 * shadowJumpProps.scale} radius={0.03 * shadowJumpProps.scale} offset={[0, shadowJumpProps.z + 0.02]} opacity={shadowJumpProps.opacity} />

      {/* Skateboard Accessory (attached at ground level under feet) */}
      {accessories?.skateboard && (
        <group position={[0, 0.02, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.035, 0.22]} />
            <meshToonMaterial color="#0A0A0A" />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>
          <mesh position={[0, 0.019, 0]}>
            <boxGeometry args={[0.54, 0.005, 0.19]} />
            <meshToonMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.2, -0.025, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>
          <mesh position={[-0.2, -0.025, -0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>
          <mesh position={[0.2, -0.025, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>
          <mesh position={[0.2, -0.025, -0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>
        </group>
      )}

      {/* Main interactive hit area wrapper */}
      <group
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        {/* Invisible hit box for clicks */}
        <mesh position={[0, 0.44, 0]} visible={false}>
          <boxGeometry args={[0.7, 0.95, 0.5]} />
        </mesh>

        {/* Facing and Gaze Debug Visualizers (?robotDebug=1) */}
        {hipDetachViolation !== null && (
          <group position={[0, 0.95, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.16, 0.05]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          </group>
        )}
        {typeof window !== 'undefined' && (window.location.search.includes('robotDebug=1') || robotStore.getState().isDebug) && (
          <group position={[0, 0.44, 0]}>
            <primitive object={new THREE.ArrowHelper(new THREE.Vector3(facing, 0, 0.4).normalize(), new THREE.Vector3(0, 0, 0), 0.45, 0x00FFFF, 0.1, 0.06)} />
            <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.22, 0.15), 0.4, 0xFF00FF, 0.08, 0.05)} />
          </group>
        )}

        {/* 2. COMPACT ROUNDED-BOX TORSO */}
        <group ref={bodyRef} position={[0, RIG.TORSO.Y, 0]}>
{/* 1. LOWER BODY: HIPS & CLEARLY VISIBLE LEGS */}
        {/* Left Leg Hip Pivot */}
        <group ref={leftLegRef} position={[-RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0]}>
          {/* Hip Ball Joint in Navy */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[RIG.HIP.BALL_R, 12, 12]} />
            <meshToonMaterial color={config.limbColor} />
          </mesh>
          {/* Sturdy Leg in Navy */}
          <mesh position={[0, -RIG.LEG.L / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[RIG.LEG.R, RIG.LEG.R, RIG.LEG.L, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={2} />
          </mesh>
          {/* Chunky Flat Foot in Accent Orange */}
          <mesh position={[0, -RIG.LEG.L - RIG.FOOT.H / 2 + 0.005, 0.025]} castShadow receiveShadow>
            <boxGeometry args={[RIG.FOOT.W, RIG.FOOT.H, RIG.FOOT.D]} />
            <meshToonMaterial color={config.accentColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Training Wheel Accessory (Journey: 2023) */}
          {accessories?.trainingWheels && (
            <group position={[-0.07, -RIG.LEG.L - RIG.FOOT.H / 2, 0.02]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[-0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.025, 12]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[-0.038, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.005, 12]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            </group>
          )}
        </group>

        {/* Right Leg Hip Pivot */}
        <group ref={rightLegRef} position={[RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0]}>
          {/* Hip Ball Joint in Navy */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[RIG.HIP.BALL_R, 12, 12]} />
            <meshToonMaterial color={config.limbColor} />
          </mesh>
          {/* Sturdy Leg in Navy */}
          <mesh position={[0, -RIG.LEG.L / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[RIG.LEG.R, RIG.LEG.R, RIG.LEG.L, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={2} />
          </mesh>
          {/* Chunky Flat Foot in Accent Orange */}
          <mesh position={[0, -RIG.LEG.L - RIG.FOOT.H / 2 + 0.005, 0.025]} castShadow receiveShadow>
            <boxGeometry args={[RIG.FOOT.W, RIG.FOOT.H, RIG.FOOT.D]} />
            <meshToonMaterial color={config.accentColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Training Wheel Accessory (Journey: 2023) */}
          {accessories?.trainingWheels && (
            <group position={[0.07, -RIG.LEG.L - RIG.FOOT.H / 2, 0.02]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.025, 12]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[0.038, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.005, 12]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            </group>
          )}
        </group>

        
          {/* Torso Box */}
          <mesh ref={torsoMeshRef} castShadow receiveShadow>
            <boxGeometry args={[RIG.TORSO.W, RIG.TORSO.H, RIG.TORSO.D]} />
            <meshToonMaterial color={config.bodyColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Self-check collision violation red highlight wireframe */}
          {hasCollision && (
            <mesh>
              <boxGeometry args={[RIG.TORSO.W + 0.04, RIG.TORSO.H + 0.04, RIG.TORSO.D + 0.04]} />
              <meshBasicMaterial wireframe color="#FF0000" />
            </mesh>
          )}

          {/* Chest Plate Detail */}
          <mesh position={[0, 0.01, RIG.TORSO.D / 2 + 0.005]} receiveShadow>
            <boxGeometry args={[0.22, 0.13, 0.01]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* Chest Meter Bars */}
          <mesh position={[-0.045, 0.01, RIG.TORSO.D / 2 + 0.012]}>
            <boxGeometry args={[0.045, 0.065, 0.01]} />
            <meshToonMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.045, 0.01, RIG.TORSO.D / 2 + 0.012]}>
            <boxGeometry args={[0.045, 0.065, 0.01]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>

          {/* Miniature Mechanical Keyboard Accessory */}
          {accessories?.keyboard && (
            <group position={[0, -0.05, 0.20]} rotation={[0.45, 0, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.26, 0.04, 0.12]} />
                <meshToonMaterial color="#0A1A3F" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0, 0.022, 0]}>
                <boxGeometry args={[0.22, 0.012, 0.09]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            </group>
          )}

          {/* Dashed Wireframe Box Accessory */}
          {accessories?.dashedBox && (
            <group position={[0, 0.08, 0.26]}>
              <mesh>
                <boxGeometry args={[0.32, 0.22, 0.16]} />
                <meshBasicMaterial wireframe color="#FF5A1F" />
              </mesh>
            </group>
          )}

          {/* Chest Badges Accessory */}
          {accessories?.chestBadges && (
            <group position={[0, -0.05, 0.145]}>
              <mesh position={[-0.07, 0, 0]}>
                <boxGeometry args={[0.045, 0.045, 0.01]} />
                <meshBasicMaterial color="#FF5A1F" />
                <Edges color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.045, 0.045, 0.01]} />
                <meshBasicMaterial color="#FFD700" />
                <Edges color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0.07, 0, 0]}>
                <boxGeometry args={[0.045, 0.045, 0.01]} />
                <meshBasicMaterial color="#0047AB" />
                <Edges color="#0A0A0A" lineWidth={1.5} />
              </mesh>
            </group>
          )}

          {/* Tech Backpack Accessory (Journey: 2025) */}
          {accessories?.backpack && (
            <group position={[0, 0.01, -RIG.TORSO.D / 2 - 0.05]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.24, 0.22, 0.10]} />
                <meshToonMaterial color="#0047AB" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
              </mesh>
              <mesh position={[0, 0.08, 0.01]}>
                <boxGeometry args={[0.25, 0.06, 0.11]} />
                <meshToonMaterial color="#0A1A3F" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0, 0.01, -0.055]}>
                <boxGeometry args={[0.05, 0.05, 0.02]} />
                <meshBasicMaterial color="#FF5A1F" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1} />
              </mesh>
            </group>
          )}

          {/* Jetpack Accessory (Journey: 2026) */}
          {accessories?.jetpack && (
            <group position={[0, 0.01, -RIG.TORSO.D / 2 - 0.05]}>
              <mesh position={[-0.09, 0, 0]} castShadow>
                <cylinderGeometry args={[0.042, 0.042, 0.26, 12]} />
                <meshToonMaterial color="#EEF2FA" />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0.09, 0, 0]} castShadow>
                <cylinderGeometry args={[0.042, 0.042, 0.26, 12]} />
                <meshToonMaterial color="#EEF2FA" />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              <mesh position={[0, 0.04, 0.02]}>
                <boxGeometry args={[0.22, 0.06, 0.04]} />
                <meshToonMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[-0.09, -0.13, 0]}>
                <cylinderGeometry args={[0.045, 0.038, 0.04, 12]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[0.09, -0.13, 0]}>
                <cylinderGeometry args={[0.045, 0.038, 0.04, 12]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              {/* Jet flames */}
              <mesh position={[-0.09, -0.20, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.036, 0.11, 6]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[0.09, -0.20, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.036, 0.11, 6]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            </group>
          )}

          {/* Git Push Box Accessory (GitHub Activity) */}
          {accessories?.gitPushBox && (
            <group position={[0.34, -0.10, 0.14]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshToonMaterial color="#FFFFFF" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
              </mesh>
              <mesh position={[0, 0, 0.102]}>
                <planeGeometry args={[0.16, 0.09]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[0, 0, 0.104]}>
                <planeGeometry args={[0.12, 0.04]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            </group>
          )}

          {/* Dumbbell HARD Accessory */}
          {accessories?.dumbbell && (
            <group position={[0, -0.05, 0.22]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.016, 0.016, 0.44, 8]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.075, 0.075, 0.06, 6]} />
                <meshToonMaterial color="#0A0A0A" />
                <Edges threshold={20} color="#FF5A1F" lineWidth={2} />
              </mesh>
              <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.075, 0.075, 0.06, 6]} />
                <meshToonMaterial color="#0A0A0A" />
                <Edges threshold={20} color="#FF5A1F" lineWidth={2} />
              </mesh>
            </group>
          )}

          {/* Confetti Burst Accessory */}
          {accessories?.confetti && (
            <group position={[0, 0.2, 0.1]}>
              {[
                [-0.22, 0.18, 0.05, '#FF5A1F'],
                [-0.14, 0.32, -0.08, '#0047AB'],
                [0.24, 0.22, 0.06, '#FFD700'],
                [0.18, 0.34, -0.05, '#0A1A3F'],
                [-0.08, 0.42, 0.12, '#FFFFFF'],
                [0.08, 0.44, -0.1, '#FF5A1F'],
              ].map(([px, py, pz, col], i) => (
                <mesh key={i} position={[Number(px), Number(py), Number(pz)]} rotation={[i * 0.4, i * 0.7, i * 0.2]}>
                  <planeGeometry args={[0.04, 0.04]} />
                  <meshBasicMaterial color={String(col)} side={2} />
                </mesh>
              ))}
            </group>
          )}

          {/* 3. PROPER ARMS: SHOULDERS SIT OUTSIDE TORSO WITH VISIBLE CONNECTOR */}
          {/* Visible Left Horizontal Joint Connector Axle (Navy Cylinder) */}
          <mesh
            position={[-RIG.TORSO.W / 2 - (RIG.SHOULDER.X - RIG.TORSO.W / 2) / 2, RIG.SHOULDER.Y - RIG.TORSO.Y, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[RIG.SHOULDER.CONNECTOR_R, RIG.SHOULDER.CONNECTOR_R, RIG.SHOULDER.CONNECTOR_L, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* Left Arm Shoulder Pivot (Strictly outside torso: gap > arm radius) */}
          <group
            ref={leftArmRef}
            position={[-RIG.SHOULDER.X, RIG.SHOULDER.Y - RIG.TORSO.Y, 0]}
          >
            <group ref={leftArmGroupRef}>
              {/* Shoulder Ball Joint in Navy */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[RIG.SHOULDER.BALL_R, 12, 12]} />
                <meshToonMaterial color={config.limbColor} />
              </mesh>
              {/* Upper Arm in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[RIG.UPPER_ARM.R, RIG.UPPER_ARM.R, RIG.UPPER_ARM.L, 12]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Sleek Flush Elbow Joint in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L, 0]} castShadow receiveShadow>
                <sphereGeometry args={[RIG.ELBOW.BALL_R, 10, 10]} />
                <meshToonMaterial color={config.limbColor} />
              </mesh>
              {/* Forearm in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L - RIG.FOREARM.L / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[RIG.FOREARM.R, RIG.FOREARM.R, RIG.FOREARM.L, 12]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Clearly Visible Hand Mitten in Orange with Black Outline */}
              <group position={[0, -RIG.UPPER_ARM.L - RIG.FOREARM.L - RIG.HAND.PALM_H / 2, 0]}>
                {/* Palm */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[RIG.HAND.PALM_W, RIG.HAND.PALM_H, RIG.HAND.PALM_D]} />
                  <meshToonMaterial color={config.accentColor} />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
                </mesh>
                {/* Angled Thumb */}
                <mesh position={[-0.042, 0.01, 0.01]} castShadow receiveShadow>
                  <boxGeometry args={[RIG.HAND.THUMB_W, RIG.HAND.THUMB_H, RIG.HAND.THUMB_D]} />
                  <meshToonMaterial color={config.accentColor} />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
              </group>
            </group>

            {/* Technical Ruler Accessory */}
            {accessories?.ruler && (
              <group position={[-0.05, -0.22, 0.06]} rotation={[0, 0, Math.PI / 8]}>
                <mesh castShadow>
                  <boxGeometry args={[0.06, 0.32, 0.015]} />
                  <meshToonMaterial color="#EEF2FA" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0.018, 0, 0.01]}>
                  <boxGeometry args={[0.015, 0.26, 0.002]} />
                  <meshBasicMaterial color="#0A0A0A" />
                </mesh>
              </group>
            )}

            {/* Magnifying Glass Accessory (Near hand when facing left) */}
            {accessories?.magnifyingGlass && facing === -1 && (
              <group position={[-0.05, -0.22, 0.08]} rotation={[0, 0, Math.PI / 6]}>
                <mesh position={[0, -0.06, 0]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.14, 8]} />
                  <meshToonMaterial color="#0A1A3F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.06, 0.014, 8, 24]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0, 0.06, 0]}>
                  <circleGeometry args={[0.056, 24]} />
                  <meshBasicMaterial color="#EEF2FA" opacity={0.7} transparent />
                </mesh>
              </group>
            )}
          </group>

          {/* Visible Right Horizontal Joint Connector Axle (Navy Cylinder) */}
          <mesh
            position={[RIG.TORSO.W / 2 + (RIG.SHOULDER.X - RIG.TORSO.W / 2) / 2, RIG.SHOULDER.Y - RIG.TORSO.Y, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[RIG.SHOULDER.CONNECTOR_R, RIG.SHOULDER.CONNECTOR_R, RIG.SHOULDER.CONNECTOR_L, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* Right Arm Shoulder Pivot (Strictly outside torso: gap > arm radius) */}
          <group
            ref={rightArmRef}
            position={[RIG.SHOULDER.X, RIG.SHOULDER.Y - RIG.TORSO.Y, 0]}
          >
            <group ref={rightArmGroupRef}>
              {/* Shoulder Ball Joint in Navy */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[RIG.SHOULDER.BALL_R, 12, 12]} />
                <meshToonMaterial color={config.limbColor} />
              </mesh>
              {/* Upper Arm in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[RIG.UPPER_ARM.R, RIG.UPPER_ARM.R, RIG.UPPER_ARM.L, 12]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Sleek Flush Elbow Joint in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L, 0]} castShadow receiveShadow>
                <sphereGeometry args={[RIG.ELBOW.BALL_R, 10, 10]} />
                <meshToonMaterial color={config.limbColor} />
              </mesh>
              {/* Forearm in Navy */}
              <mesh position={[0, -RIG.UPPER_ARM.L - RIG.FOREARM.L / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[RIG.FOREARM.R, RIG.FOREARM.R, RIG.FOREARM.L, 12]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Clearly Visible Hand Mitten in Orange with Black Outline */}
              <group position={[0, -RIG.UPPER_ARM.L - RIG.FOREARM.L - RIG.HAND.PALM_H / 2, 0]}>
                {/* Palm */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[RIG.HAND.PALM_W, RIG.HAND.PALM_H, RIG.HAND.PALM_D]} />
                  <meshToonMaterial color={config.accentColor} />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
                </mesh>
                {/* Angled Thumb */}
                <mesh position={[0.042, 0.01, 0.01]} castShadow receiveShadow>
                  <boxGeometry args={[RIG.HAND.THUMB_W, RIG.HAND.THUMB_H, RIG.HAND.THUMB_D]} />
                  <meshToonMaterial color={config.accentColor} />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
              </group>
            </group>

            {/* Big Figma Cursor Arrow Accessory */}
            {accessories?.figmaCursor && (
              <group position={[0.06, -0.22, 0.08]} rotation={[0, 0, -Math.PI / 6]} scale={1.3}>
                <mesh>
                  <coneGeometry args={[0.09, 0.22, 3]} />
                  <meshBasicMaterial color="#0A0A0A" />
                </mesh>
                <mesh position={[0, 0, 0.006]} scale={0.82}>
                  <coneGeometry args={[0.09, 0.22, 3]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
              </group>
            )}

            {/* Pennant Flag Accessory */}
            {accessories?.flag && (
              <group position={[0.06, -0.18, 0.08]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
                  <meshBasicMaterial color="#0A0A0A" />
                </mesh>
                <mesh position={[0, 0.29, 0]}>
                  <sphereGeometry args={[0.024, 8, 8]} />
                  <meshBasicMaterial color="#FFD700" />
                </mesh>
                <mesh position={[0.11, 0.22, 0]}>
                  <boxGeometry args={[0.2, 0.1, 0.01]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
              </group>
            )}

            {/* Rubber Stamp Accessory */}
            {accessories?.stamp && (
              <group position={[0.04, -0.22, 0.06]} rotation={[0, 0, -Math.PI / 8]}>
                <mesh position={[0, 0.06, 0]}>
                  <cylinderGeometry args={[0.022, 0.025, 0.12, 8]} />
                  <meshToonMaterial color="#0A1A3F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0, -0.01, 0]}>
                  <boxGeometry args={[0.09, 0.035, 0.06]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
              </group>
            )}

            {/* Trophy Accessory */}
            {accessories?.trophy && (
              <group position={[0.06, -0.15, 0.08]} scale={1.2}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.07, 0.03, 0.07]} />
                  <meshBasicMaterial color="#0A0A0A" />
                </mesh>
                <mesh position={[0, 0.035, 0]}>
                  <cylinderGeometry args={[0.018, 0.022, 0.04, 8]} />
                  <meshBasicMaterial color="#FFD700" />
                </mesh>
                <mesh position={[0, 0.09, 0]}>
                  <cylinderGeometry args={[0.055, 0.03, 0.08, 12]} />
                  <meshToonMaterial color="#FFD700" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[-0.055, 0.09, 0]}>
                  <boxGeometry args={[0.015, 0.06, 0.015]} />
                  <meshBasicMaterial color="#FF5A1F" />
                </mesh>
                <mesh position={[0.055, 0.09, 0]}>
                  <boxGeometry args={[0.015, 0.06, 0.015]} />
                  <meshBasicMaterial color="#FF5A1F" />
                </mesh>
              </group>
            )}

            {/* Construction Hammer Accessory */}
            {accessories?.hammer && (
              <group position={[0.05, -0.22, 0.06]} rotation={[0, 0, -Math.PI / 6]}>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
                  <meshToonMaterial color="#0A1A3F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0.03, 0.15, 0]}>
                  <boxGeometry args={[0.12, 0.055, 0.055]} />
                  <meshToonMaterial color="#EEF2FA" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
                </mesh>
              </group>
            )}

            {/* Paper Plane Rocket Accessory */}
            {accessories?.paperRocket && (
              <group position={[0.06, -0.15, 0.08]} rotation={[0.4, 0, -0.6]} scale={1.3}>
                <mesh>
                  <coneGeometry args={[0.08, 0.26, 3]} />
                  <meshBasicMaterial color="#FFFFFF" />
                  <Edges color="#0A0A0A" lineWidth={2} />
                </mesh>
                <mesh position={[0, -0.06, 0]} scale={[1.4, 0.5, 0.3]}>
                  <boxGeometry args={[0.14, 0.08, 0.02]} />
                  <meshBasicMaterial color="#FF5A1F" />
                </mesh>
              </group>
            )}

            {/* Magnifying Glass Accessory (Near hand when facing right) */}
            {accessories?.magnifyingGlass && facing !== -1 && (
              <group position={[0.05, -0.22, 0.08]} rotation={[0, 0, -Math.PI / 6]}>
                <mesh position={[0, -0.06, 0]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.14, 8]} />
                  <meshToonMaterial color="#0A1A3F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.06, 0.014, 8, 24]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
                </mesh>
                <mesh position={[0, 0.06, 0]}>
                  <circleGeometry args={[0.056, 24]} />
                  <meshBasicMaterial color="#EEF2FA" opacity={0.7} transparent />
                </mesh>
              </group>
            )}
          </group>

          {/* 4. NECK JOINT WITH VISIBLE VERTICAL GAP */}
          <mesh position={[0, RIG.NECK.Y - RIG.TORSO.Y, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[RIG.NECK.RADIUS, RIG.NECK.RADIUS, RIG.NECK.H, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* 5. ROUNDED HEAD-SCREEN & FLUSH OUTLINED EAR DISCS */}
          <group ref={headRef} position={[0, RIG.HEAD.Y - RIG.TORSO.Y, 0]}>
            {/* Head Box */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[RIG.HEAD.W, RIG.HEAD.H, RIG.HEAD.D]} />
              <meshToonMaterial color={config.bodyColor} />
              <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
            </mesh>

            {/* Flush, Outlined Navy Ear Discs (Clean, No Thick Black Disc Artifact) */}
            <mesh position={[-RIG.EAR.X, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[RIG.EAR.RADIUS, RIG.EAR.RADIUS, RIG.EAR.THICKNESS, 16]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            <mesh position={[RIG.EAR.X, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[RIG.EAR.RADIUS, RIG.EAR.RADIUS, RIG.EAR.THICKNESS, 16]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>

            {/* Front Visor Screen with 2D Canvas Face Texture */}
            <mesh position={[0, 0, RIG.HEAD.D / 2 + 0.002]}>
              <planeGeometry args={[0.36, 0.24]} />
              <meshBasicMaterial map={face.texture} toneMapped={false} />
              <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
            </mesh>

            {/* Antenna Pivot */}
            <group ref={antennaRef} position={[0, RIG.HEAD.H / 2, 0]}>
              {/* Antenna Rod in Navy */}
              <mesh position={[0, RIG.ANTENNA.ROD_H / 2, 0]} castShadow>
                <cylinderGeometry args={[RIG.ANTENNA.ROD_R, RIG.ANTENNA.ROD_R, RIG.ANTENNA.ROD_H, 8]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Antenna Tip Sphere in Accent Orange */}
              <mesh position={[0, RIG.ANTENNA.ROD_H + RIG.ANTENNA.TIP_R * 0.7, 0]} castShadow>
                <sphereGeometry args={[RIG.ANTENNA.TIP_R, 16, 16]} />
                <meshToonMaterial color={config.accentColor} />
              </mesh>
            </group>

            {/* Hard Hat Safety Helmet Accessory */}
            {accessories?.hardHat && (
              <group position={[0, RIG.HEAD.H / 2, 0]}>
                <mesh position={[0, 0.05, 0]} castShadow>
                  <boxGeometry args={[0.48, 0.12, 0.36]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
                </mesh>
                <mesh position={[0, 0.01, 0.02]} castShadow>
                  <boxGeometry args={[0.52, 0.02, 0.40]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
