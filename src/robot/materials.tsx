import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';

/**
 * Hard offset shadow component rendered beneath the robot.
 * Neo-brutalist rounded-rectangle shape (NOT a circle), flat black (#0A0A0A),
 * zero blur, crisp offset.
 */
export const RobotHardShadow: React.FC<{
  width?: number;
  depth?: number;
  radius?: number;
  offset?: [number, number];
  opacity?: number;
}> = ({
  width = 0.52,
  depth = 0.32,
  radius = 0.08,
  offset = [0.03, -0.03],
  opacity = 0.85,
}) => {
  const shadowShape = useMemo(() => {
    const shape = new THREE.Shape();
    const w = width / 2;
    const d = depth / 2;
    const r = Math.min(radius, w, d);

    shape.moveTo(-w + r, -d);
    shape.lineTo(w - r, -d);
    shape.quadraticCurveTo(w, -d, w, -d + r);
    shape.lineTo(w, d - r);
    shape.quadraticCurveTo(w, d, w - r, d);
    shape.lineTo(-w + r, d);
    shape.quadraticCurveTo(-w, d, -w, d - r);
    shape.lineTo(-w, -d + r);
    shape.quadraticCurveTo(-w, -d, -w + r, -d);

    return shape;
  }, [width, depth, radius]);

  return (
    <mesh
      position={[offset[0], -0.01, offset[1]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <shapeGeometry args={[shadowShape]} />
      <meshBasicMaterial
        color="#0A0A0A"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Standard cel-shaded primitive box with crisp black outline
 */
export const CelBox: React.FC<{
  args: [number, number, number];
  color: string;
  outlineColor?: string;
  lineWidth?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}> = ({
  args,
  color,
  outlineColor = '#0A0A0A',
  lineWidth = 2,
  castShadow = true,
  receiveShadow = true,
}) => {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={args} />
      <meshToonMaterial color={color} />
      <Edges color={outlineColor} threshold={15} lineWidth={lineWidth} />
    </mesh>
  );
};

/**
 * Standard cel-shaded primitive cylinder with crisp black outline
 */
export const CelCylinder: React.FC<{
  args: [number, number, number, number];
  color: string;
  outlineColor?: string;
  lineWidth?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}> = ({
  args,
  color,
  outlineColor = '#0A0A0A',
  lineWidth = 1.5,
  castShadow = true,
  receiveShadow = true,
}) => {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
      <cylinderGeometry args={args} />
      <meshToonMaterial color={color} />
      <Edges color={outlineColor} threshold={20} lineWidth={lineWidth} />
    </mesh>
  );
};
