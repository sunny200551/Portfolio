import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Robot } from '../../robot/Robot';
import { robotStore } from '../../robot/robotStore';
import { CanvasErrorBoundary } from './CanvasBoundary';

interface BlockProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  outlineColor?: string;
  children?: React.ReactNode;
}

const UIBlock: React.FC<BlockProps> = ({
  position,
  rotation,
  size,
  color,
  outlineColor = '#0A0A0A',
  children,
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshToonMaterial color={color} />
        <Edges threshold={15} color={outlineColor} lineWidth={2} />
      </mesh>
      {children}
    </group>
  );
};

const HeroSceneContent: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const nutRef = useRef<THREE.Group>(null);
  const chipRef = useRef<THREE.Group>(null);
  const pushPanelRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const [boltAnim, setBoltAnim] = useState(() => robotStore.getState().boltAnim);
  const [boltExpr, setBoltExpr] = useState(() => robotStore.getState().boltExpr);
  const [nutAnim, setNutAnim] = useState(() => robotStore.getState().nutAnim);
  const [chipAnim, setChipAnim] = useState(() => robotStore.getState().chipAnim);
  const [chipExpr, setChipExpr] = useState(() => robotStore.getState().chipExpr);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);

  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const s = robotStore.getState();
      setBoltAnim(s.boltAnim);
      setBoltExpr(s.boltExpr);
      setNutAnim(s.nutAnim);
      setChipAnim(s.chipAnim);
      setChipExpr(s.chipExpr);
      setRobotEnabled(s.robotEnabled);
    });
    return () => unsub();
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle pointer parallax and gentle float
    const targetParallaxX = pointer.x * 0.08;
    const targetParallaxY = pointer.y * 0.06;

    groupRef.current.position.y = Math.sin(t * 0.8) * 0.02;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      -0.28 + Math.sin(t * 0.4) * 0.02 + targetParallaxX,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      0.32 - targetParallaxY * 0.3,
      3,
      delta
    );

    // NUT kicking cube gag
    if (nutRef.current) {
      const nutProgress = (Math.sin(t * 2.2) + 1) * 0.5;
      nutRef.current.position.x = -1.05 + nutProgress * 0.18;
      const nutDir = Math.cos(t * 2.2);
      nutRef.current.rotation.y = nutDir > 0 ? 0.35 : -0.15;
    }

    if (cubeRef.current) {
      const kick = (Math.sin(t * 4.4) + 1) * 0.5;
      cubeRef.current.position.x = -0.78 + kick * 0.14;
      cubeRef.current.position.y = 0.12 + Math.sin(kick * Math.PI) * 0.035;
      cubeRef.current.rotation.y = t * 2.5;
    }

    // CHIP pushing mini panel gag
    if (chipRef.current) {
      const chipProgress = (Math.sin(t * 1.6 + 1) + 1) * 0.5;
      const chipX = -0.22 + chipProgress * 0.18;
      chipRef.current.position.x = chipX;
      const chipDir = Math.cos(t * 1.6 + 1);
      chipRef.current.rotation.y = chipDir > 0 ? -0.25 : 0.25;

      if (pushPanelRef.current) {
        pushPanelRef.current.position.x = chipX + 0.16;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0.15, -0.10, 0]} rotation={[0.32, -0.28, 0]}>
      {/* 1. Base Foundation Desk Slab (XZ Plane: width along X, depth along Z, height along Y) */}
      <UIBlock
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        size={[3.4, 0.10, 2.3]}
        color="#EEF2FA"
        outlineColor="#0A0A0A"
      />

      {/* 2. Standing Architectural Panes (Standing upright along +Y, facing front-left towards Sunny) */}
      
      {/* Main Cobalt UI Pane (#0047AB) */}
      <group position={[0.65, 0.55, -0.35]} rotation={[0, -0.20, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.5, 0.95, 0.08]}
          color="#0047AB"
        >
          {/* Internal card details */}
          <mesh position={[-0.34, 0.30, 0.05]}>
            <boxGeometry args={[0.55, 0.11, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.0, 0.10, 0.05]}>
            <boxGeometry args={[1.15, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.15, -0.08, 0.05]}>
            <boxGeometry args={[0.80, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.36, -0.27, 0.05]}>
            <boxGeometry args={[0.48, 0.15, 0.03]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
        </UIBlock>
      </group>

      {/* Top Bar Pane (#FFFFFF) */}
      <group position={[0.65, 1.12, -0.35]} rotation={[0, -0.20, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.5, 0.16, 0.08]}
          color="#FFFFFF"
        >
          <mesh position={[-0.52, 0, 0.05]}>
            <boxGeometry args={[0.18, 0.08, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.10, 0, 0.05]}>
            <boxGeometry args={[0.38, 0.05, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.45, 0, 0.05]}>
            <boxGeometry args={[0.24, 0.08, 0.02]} />
            <meshBasicMaterial color="#0047AB" />
          </mesh>
        </UIBlock>
      </group>

      {/* Navy Terminal Pane (#0A1A3F) on right */}
      <group position={[0.95, 0.42, 0.25]} rotation={[0, -0.42, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.15, 0.72, 0.08]}
          color="#0A1A3F"
        >
          <mesh position={[-0.40, 0.25, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.26, 0.25, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.0, 0.08, 0.05]}>
            <boxGeometry args={[0.82, 0.06, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.12, -0.06, 0.05]}>
            <boxGeometry args={[0.60, 0.06, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.22, -0.20, 0.05]}>
            <boxGeometry args={[0.40, 0.06, 0.02]} />
            <meshBasicMaterial color="#EEF2FA" />
          </mesh>
        </UIBlock>
      </group>

      {/* Orange Accent Pill Pane (#FF5A1F) in front-right */}
      <group position={[0.35, 0.16, 0.40]} rotation={[0, -0.15, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[0.65, 0.20, 0.08]}
          color="#FF5A1F"
        >
          <mesh position={[-0.20, 0, 0.05]}>
            <boxGeometry args={[0.12, 0.12, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.12, 0, 0.05]}>
            <boxGeometry args={[0.34, 0.07, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
        </UIBlock>
      </group>

      {/* 3. Robots Standing Upright on the Desk Floor (y = 0.05) */}
      {robotEnabled && (
        <group position={[0, 0.05, 0]}>
          {/* BOLT: Standing front-left on clear floor, upright, large scale (0.92), facing Sunny & visitor */}
          <group position={[-0.45, 0, 0.25]} rotation={[0, 0.25, 0]}>
            <Robot
              variant="bolt"
              animation={boltAnim === 'jump' ? 'jump' : 'wave'}
              expression={boltExpr}
              position={[0, 0, 0]}
              scale={0.92}
              headTrackCursor={true}
            />
          </group>

          {/* NUT: Far left, kicking orange cube, upright, scale (0.76) */}
          <group ref={nutRef} position={[-1.05, 0, 0.15]} rotation={[0, 0.35, 0]}>
            <Robot
              variant="nut"
              animation={nutAnim}
              expression="focused"
              position={[0, 0, 0]}
              scale={0.76}
              headTrackCursor={true}
            />
          </group>

          {/* Cel-shaded Orange Cube that NUT kicks */}
          <mesh ref={cubeRef} position={[-0.78, 0.07, 0.15]}>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshToonMaterial color="#FF5A1F" />
            <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
          </mesh>

          {/* CHIP: Front edge, pushing mini panel, upright, scale (0.72) */}
          <group ref={chipRef} position={[-0.20, 0, 0.65]} rotation={[0, 0.15, 0]}>
            <Robot
              variant="chip"
              animation={chipAnim}
              expression={chipExpr}
              position={[0, 0, 0]}
              scale={0.72}
              headTrackCursor={chipAnim !== 'sleep'}
            />
          </group>

          {/* Mini panel that CHIP pushes */}
          <group ref={pushPanelRef} position={[-0.04, 0.08, 0.65]}>
            <mesh>
              <boxGeometry args={[0.20, 0.16, 0.05]} />
              <meshToonMaterial color="#0047AB" />
              <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

interface HeroIllustrationProps {
  isHeroInView?: boolean;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ isHeroInView = true }) => {
  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <CanvasErrorBoundary fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.2, 4.4], fov: 38 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isHeroInView ? 'always' : 'never'}
        >
          <ambientLight intensity={1.1} color="#FFFFFF" />
          <directionalLight position={[5, 8, 6]} intensity={1.6} color="#FFFFFF" />
          <directionalLight position={[-4, -2, -2]} intensity={0.5} color="#EEF2FA" />
          <HeroSceneContent />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroIllustration;
