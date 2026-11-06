import React, { useMemo, useEffect } from 'react';
import { Edges } from '@react-three/drei';
import type { RobotVariant, RobotExpression, RobotAnimation, RobotAccessories } from './types';
import { VARIANT_CONFIGS } from './types';
import { RobotFaceTexture } from './FaceCanvas';
import { RobotHardShadow } from './materials';
import { useRobotAnimation } from './useRobotAnimation';

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
}

export const RobotModel: React.FC<RobotModelProps> = ({
  variant = 'bolt',
  expression = 'happy',
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  headTrackCursor = true,
  onClick,
  accessories,
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

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={rotation}
      scale={[finalScale, finalScale, finalScale]}
    >
      {/* Flat hard offset shadow on ground plate (neo-brutalist rounded rectangle, zero blur) */}
      <RobotHardShadow width={0.54} depth={0.34} radius={0.08} offset={[0.04, -0.04]} opacity={0.88} />

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
        <mesh position={[0, 0.42, 0]} visible={false}>
          <boxGeometry args={[0.7, 0.95, 0.5]} />
        </mesh>

        {/* 1. LOWER BODY & SHORT STURDY LEGS */}
        {/* Left Leg Hip Pivot */}
        <group ref={leftLegRef} position={[-0.12, 0.14, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.12, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={2} />
          </mesh>
          {/* Chunky Flat Foot */}
          <mesh position={[0, -0.13, 0.03]} castShadow receiveShadow>
            <boxGeometry args={[0.11, 0.045, 0.16]} />
            <meshToonMaterial color={config.accentColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Training Wheel Accessory (Journey: 2023) */}
          {accessories?.trainingWheels && (
            <group position={[-0.07, -0.13, 0.03]}>
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
        <group ref={rightLegRef} position={[0.12, 0.14, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.12, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={2} />
          </mesh>
          {/* Chunky Flat Foot */}
          <mesh position={[0, -0.13, 0.03]} castShadow receiveShadow>
            <boxGeometry args={[0.11, 0.045, 0.16]} />
            <meshToonMaterial color={config.accentColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Training Wheel Accessory (Journey: 2023) */}
          {accessories?.trainingWheels && (
            <group position={[0.07, -0.13, 0.03]}>
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

        {/* 2. COMPACT ROUNDED-BOX TORSO */}
        <group ref={bodyRef} position={[0, 0.28, 0]}>
          {/* Torso Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.38, 0.26, 0.26]} />
            <meshToonMaterial color={config.bodyColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* Chest Plate Detail */}
          <mesh position={[0, 0.01, 0.132]} receiveShadow>
            <boxGeometry args={[0.24, 0.13, 0.01]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* Chest Meter Bars */}
          <mesh position={[-0.05, 0.01, 0.14]}>
            <boxGeometry args={[0.05, 0.07, 0.01]} />
            <meshToonMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.05, 0.01, 0.14]}>
            <boxGeometry args={[0.05, 0.07, 0.01]} />
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
            <group position={[0, 0.01, -0.16]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.26, 0.22, 0.10]} />
                <meshToonMaterial color="#0047AB" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
              </mesh>
              <mesh position={[0, 0.08, 0.01]}>
                <boxGeometry args={[0.27, 0.06, 0.11]} />
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
            <group position={[0, 0.01, -0.16]}>
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

          {/* 3. PROPER ARMS & CLEARLY VISIBLE MITTEN HANDS (OUTSIDE BODY) */}
          {/* Left Arm Shoulder Pivot (Offset strictly outside torso: 0.265 > 0.19 + 0.035) */}
          <group ref={leftArmRef} position={[-0.265, 0.08, 0]}>
            {/* Shoulder ball joint in navy */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.046, 12, 12]} />
              <meshToonMaterial color={config.limbColor} />
            </mesh>
            {/* Upper Arm in navy */}
            <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.032, 0.032, 0.09, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            {/* Elbow joint in navy */}
            <mesh position={[0, -0.10, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshToonMaterial color={config.limbColor} />
            </mesh>
            {/* Forearm in navy */}
            <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.08, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            {/* Clearly visible Hand Mitten in orange with black outline */}
            <group position={[0, -0.21, 0]}>
              {/* Palm */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.075, 0.065, 0.06]} />
                <meshToonMaterial color={config.accentColor} />
                <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
              </mesh>
              {/* Angled thumb */}
              <mesh position={[-0.045, 0.01, 0.01]} castShadow receiveShadow>
                <boxGeometry args={[0.028, 0.035, 0.035]} />
                <meshToonMaterial color={config.accentColor} />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
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
          </group>

          {/* Right Arm Shoulder Pivot (Offset strictly outside torso: 0.265 > 0.19 + 0.035) */}
          <group ref={rightArmRef} position={[0.265, 0.08, 0]}>
            {/* Shoulder ball joint in navy */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.046, 12, 12]} />
              <meshToonMaterial color={config.limbColor} />
            </mesh>
            {/* Upper Arm in navy */}
            <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.032, 0.032, 0.09, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            {/* Elbow joint in navy */}
            <mesh position={[0, -0.10, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshToonMaterial color={config.limbColor} />
            </mesh>
            {/* Forearm in navy */}
            <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.08, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            {/* Clearly visible Hand Mitten in orange with black outline */}
            <group position={[0, -0.21, 0]}>
              {/* Palm */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.075, 0.065, 0.06]} />
                <meshToonMaterial color={config.accentColor} />
                <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
              </mesh>
              {/* Angled thumb */}
              <mesh position={[0.045, 0.01, 0.01]} castShadow receiveShadow>
                <boxGeometry args={[0.028, 0.035, 0.035]} />
                <meshToonMaterial color={config.accentColor} />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
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
          </group>

          {/* Neck Joint */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
            <meshToonMaterial color={config.limbColor} />
            <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
          </mesh>

          {/* 4. LARGER ROUNDED HEAD-SCREEN (ABOUT 40% OF TOTAL HEIGHT) */}
          <group ref={headRef} position={[0, 0.32, 0]}>
            {/* Head Box */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.44, 0.34, 0.32]} />
              <meshToonMaterial color={config.bodyColor} />
              <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
            </mesh>

            {/* Side Ear Bolt Cylinders in navy */}
            <mesh position={[-0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
            <mesh position={[0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
              <meshToonMaterial color={config.limbColor} />
              <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
            </mesh>

            {/* Front Visor Screen with 2D Canvas Face Texture */}
            <mesh position={[0, 0, 0.162]}>
              <planeGeometry args={[0.36, 0.24]} />
              <meshBasicMaterial map={face.texture} toneMapped={false} />
              <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
            </mesh>

            {/* Antenna Pivot */}
            <group ref={antennaRef} position={[0, 0.17, 0]}>
              {/* Antenna Rod in navy */}
              <mesh position={[0, 0.06, 0]} castShadow>
                <cylinderGeometry args={[0.014, 0.014, 0.12, 8]} />
                <meshToonMaterial color={config.limbColor} />
                <Edges threshold={20} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
              {/* Antenna Tip Sphere in orange with clean cel shading (no halo/circle) */}
              <mesh position={[0, 0.13, 0]} castShadow>
                <sphereGeometry args={[0.042, 16, 16]} />
                <meshToonMaterial color={config.accentColor} />
              </mesh>
            </group>

            {/* Hard Hat Safety Helmet Accessory */}
            {accessories?.hardHat && (
              <group position={[0, 0.16, 0]}>
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
