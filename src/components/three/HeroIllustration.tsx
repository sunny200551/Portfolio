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
    const targetParallaxX = pointer.x * 0.12;
    const targetParallaxY = pointer.y * 0.10;

    groupRef.current.position.y = Math.sin(t * 0.8) * 0.025;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      Math.sin(t * 0.4) * 0.03 + targetParallaxX,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      -targetParallaxY * 0.5,
      3,
      delta
    );

    // NUT kicking cube gag
    if (nutRef.current) {
      const nutProgress = (Math.sin(t * 2.2) + 1) * 0.5;
      nutRef.current.position.x = -1.15 + nutProgress * 0.22;
      const nutDir = Math.cos(t * 2.2);
      nutRef.current.rotation.y = nutDir > 0 ? 0.35 : -0.35;
    }

    if (cubeRef.current) {
      const kick = (Math.sin(t * 4.4) + 1) * 0.5;
      cubeRef.current.position.x = -0.84 + kick * 0.16;
      cubeRef.current.position.y = 0.08 + Math.sin(kick * Math.PI) * 0.035;
      cubeRef.current.rotation.y = t * 2.5;
    }

    // CHIP pushing mini panel gag
    if (chipRef.current) {
      const chipProgress = (Math.sin(t * 1.6 + 1) + 1) * 0.5;
      const chipX = -0.30 + chipProgress * 0.22;
      chipRef.current.position.x = chipX;
      const chipDir = Math.cos(t * 1.6 + 1);
      chipRef.current.rotation.y = chipDir > 0 ? -0.35 : 0.35;

      if (pushPanelRef.current) {
        pushPanelRef.current.position.x = chipX + 0.15;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {/* Base Foundation Plinth in #EEF2FA with black edges */}
      <group position={[0.05, -0.15, -0.1]} rotation={[-0.78, 0, 0.16]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[3.2, 2.3, 0.08]}
          color="#EEF2FA"
          outlineColor="#0A0A0A"
        >
          {/* Standing Architectural Panes (Back and Right) */}
          {/* 1. Main Cobalt UI Pane (#0047AB) */}
          <group position={[0.65, 0.35, 0.50]} rotation={[Math.PI / 2, 0, -0.1]}>
            <UIBlock
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              size={[1.35, 0.90, 0.08]}
              color="#0047AB"
            >
              {/* Internal card details */}
              <mesh position={[-0.30, 0.28, 0.05]}>
                <boxGeometry args={[0.5, 0.10, 0.02]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[0.0, 0.08, 0.05]}>
                <boxGeometry args={[1.0, 0.06, 0.02]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[-0.15, -0.08, 0.05]}>
                <boxGeometry args={[0.7, 0.06, 0.02]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0.32, -0.25, 0.05]}>
                <boxGeometry args={[0.42, 0.14, 0.03]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
            </UIBlock>
          </group>

          {/* 2. Top Bar Pane (#FFFFFF) */}
          <group position={[0.65, 0.88, 0.50]} rotation={[Math.PI / 2, 0, -0.1]}>
            <UIBlock
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              size={[1.35, 0.16, 0.08]}
              color="#FFFFFF"
            >
              <mesh position={[-0.48, 0, 0.05]}>
                <boxGeometry args={[0.16, 0.08, 0.02]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[-0.10, 0, 0.05]}>
                <boxGeometry args={[0.35, 0.05, 0.02]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[0.42, 0, 0.05]}>
                <boxGeometry args={[0.22, 0.08, 0.02]} />
                <meshBasicMaterial color="#0047AB" />
              </mesh>
            </UIBlock>
          </group>

          {/* 3. Navy Terminal Pane (#0A1A3F) */}
          <group position={[0.88, 0.20, -0.05]} rotation={[Math.PI / 2, 0, -0.1]}>
            <UIBlock
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              size={[1.05, 0.68, 0.08]}
              color="#0A1A3F"
            >
              <mesh position={[-0.38, 0.24, 0.05]}>
                <boxGeometry args={[0.06, 0.06, 0.02]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[-0.26, 0.24, 0.05]}>
                <boxGeometry args={[0.06, 0.06, 0.02]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0.0, 0.08, 0.05]}>
                <boxGeometry args={[0.75, 0.05, 0.02]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[-0.1, -0.06, 0.05]}>
                <boxGeometry args={[0.55, 0.05, 0.02]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
              <mesh position={[-0.2, -0.20, 0.05]}>
                <boxGeometry args={[0.35, 0.05, 0.02]} />
                <meshBasicMaterial color="#EEF2FA" />
              </mesh>
            </UIBlock>
          </group>

          {/* 4. Orange Accent Pill Pane (#FF5A1F) */}
          <group position={[0.35, -0.06, 0.22]} rotation={[Math.PI / 2, 0, -0.1]}>
            <UIBlock
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              size={[0.60, 0.18, 0.08]}
              color="#FF5A1F"
            >
              <mesh position={[-0.18, 0, 0.05]}>
                <boxGeometry args={[0.10, 0.10, 0.02]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
              <mesh position={[0.10, 0, 0.05]}>
                <boxGeometry args={[0.32, 0.06, 0.02]} />
                <meshBasicMaterial color="#0A0A0A" />
              </mesh>
            </UIBlock>
          </group>
        </UIBlock>

        {/* Robots on the Open Front-Left Floor (strictly clear of panels) */}
        {robotEnabled && (
          <group position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            {/* BOLT: Standing front-left on clear grey floor */}
            <group position={[-0.60, 0.04, 0.50]}>
              <Robot
                variant="bolt"
                animation={boltAnim === 'jump' ? 'jump' : 'wave'}
                expression={boltExpr}
                position={[0, 0, 0]}
                scale={0.58}
                headTrackCursor={true}
              />
            </group>

            {/* NUT: Far left, kicking orange cube */}
            <group ref={nutRef} position={[-1.15, 0.04, 0.40]}>
              <Robot
                variant="nut"
                animation={nutAnim}
                expression="focused"
                position={[0, 0, 0]}
                scale={0.50}
                headTrackCursor={true}
              />
            </group>

            {/* Cel-shaded Orange Cube that NUT kicks */}
            <mesh ref={cubeRef} position={[-0.84, 0.08, 0.40]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshToonMaterial color="#FF5A1F" />
              <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
            </mesh>

            {/* CHIP: Front lip, pushing mini panel */}
            <group ref={chipRef} position={[-0.25, 0.04, 0.80]}>
              <Robot
                variant="chip"
                animation={chipAnim}
                expression={chipExpr}
                position={[0, 0, 0]}
                scale={0.46}
                headTrackCursor={chipAnim !== 'sleep'}
              />
            </group>

            {/* Mini panel that CHIP pushes */}
            <group ref={pushPanelRef} position={[-0.10, 0.08, 0.80]}>
              <mesh>
                <boxGeometry args={[0.16, 0.12, 0.04]} />
                <meshToonMaterial color="#0047AB" />
                <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
              </mesh>
            </group>
          </group>
        )}
      </group>
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
          camera={{ position: [0, 0.1, 4.3], fov: 38 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isHeroInView ? 'always' : 'never'}
        >
          <ambientLight intensity={1.0} color="#FFFFFF" />
          <directionalLight position={[5, 8, 6]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-4, -3, -2]} intensity={0.4} color="#EEF2FA" />
          <HeroSceneContent />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroIllustration;
