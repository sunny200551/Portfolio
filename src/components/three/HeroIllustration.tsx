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

// Scene Controller: Handles WebGL context recovery, scroll-back visibility, and entrance replay
const HeroSceneController: React.FC<{ isHeroInView: boolean }> = ({ isHeroInView }) => {
  const { gl, invalidate } = useThree();
  const entranceProgress = useRef(1);

  useEffect(() => {
    if (isHeroInView) {
      invalidate();
      // Replay entrance bounce
      entranceProgress.current = 0.92;
    }
  }, [isHeroInView, invalidate]);

  useEffect(() => {
    const canvasEl = gl.domElement;
    if (!canvasEl) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('Hero 3D WebGL context lost. Waiting for restore...');
    };

    const handleContextRestored = () => {
      console.log('Hero 3D WebGL context restored.');
      invalidate();
    };

    canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    if (entranceProgress.current < 1) {
      entranceProgress.current = Math.min(1, entranceProgress.current + delta * 2.5);
    }
  });

  return null;
};

interface HeroSceneContentProps {
  isMobile: boolean;
}

const HeroSceneContent: React.FC<HeroSceneContentProps> = ({ isMobile }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const [boltAnim, setBoltAnim] = useState(() => robotStore.getState().boltAnim);
  const [boltExpr, setBoltExpr] = useState(() => robotStore.getState().boltExpr);
  const [robotEnabled, setRobotEnabled] = useState(() => robotStore.getState().robotEnabled);

  useEffect(() => {
    const unsub = robotStore.subscribe(() => {
      const s = robotStore.getState();
      setBoltAnim(s.boltAnim);
      setBoltExpr(s.boltExpr);
      setRobotEnabled(s.robotEnabled);
    });
    return () => unsub();
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle pointer parallax and gentle float
    const targetParallaxX = pointer.x * 0.07;
    const targetParallaxY = pointer.y * 0.05;

    groupRef.current.position.y = Math.sin(t * 1.2) * 0.025;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      -0.18 + Math.sin(t * 0.5) * 0.015 + targetParallaxX,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      0.30 - targetParallaxY * 0.25,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0.32, -0.15, 0]} rotation={[0.30, -0.18, 0]}>
      {/* 1. Base Foundation Desk Slab: Fully contained inside stage, plain grey/ice-blue */}
      <UIBlock
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        size={[3.7, 0.12, 2.4]}
        color="#EEF2FA"
        outlineColor="#0A0A0A"
      />

      {/* 2. Standing Architectural Panes as Backdrop (Smaller, Behind the Robots) */}
      
      {/* Main Cobalt UI Pane (#0047AB) */}
      <group position={[0.60, 0.65, -0.42]} rotation={[0, -0.18, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.65, 1.05, 0.08]}
          color="#0047AB"
        >
          {/* Internal card details */}
          <mesh position={[-0.38, 0.34, 0.05]}>
            <boxGeometry args={[0.55, 0.11, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.0, 0.12, 0.05]}>
            <boxGeometry args={[1.25, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.15, -0.08, 0.05]}>
            <boxGeometry args={[0.90, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.42, -0.30, 0.05]}>
            <boxGeometry args={[0.48, 0.15, 0.03]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
        </UIBlock>
      </group>

      {/* Top Bar Pane (#FFFFFF) */}
      <group position={[0.60, 1.28, -0.42]} rotation={[0, -0.18, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.65, 0.16, 0.08]}
          color="#FFFFFF"
        >
          <mesh position={[-0.56, 0, 0.05]}>
            <boxGeometry args={[0.20, 0.08, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.10, 0, 0.05]}>
            <boxGeometry args={[0.45, 0.05, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.50, 0, 0.05]}>
            <boxGeometry args={[0.26, 0.08, 0.02]} />
            <meshBasicMaterial color="#0047AB" />
          </mesh>
        </UIBlock>
      </group>

      {/* Navy Terminal Pane (#0A1A3F) */}
      <group position={[1.18, 0.46, 0.15]} rotation={[0, -0.38, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.15, 0.76, 0.08]}
          color="#0A1A3F"
        >
          <mesh position={[-0.40, 0.26, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.26, 0.26, 0.05]}>
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

      {/* Orange Accent Pill (#FF5A1F) */}
      <group position={[0.78, 0.16, 0.55]} rotation={[0, -0.15, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[0.68, 0.22, 0.08]}
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

      {/* 3. Focal Robots Standing Upright on Floor: Large, Prominent, Front-Facing */}
      {robotEnabled && (
        <group position={[0, 0.06, 0]}>
          {/* Main Hero BOLT (Center, ~250px tall, Waving, Eyes following pointer) */}
          <group position={[-0.10, 0, 0.35]} rotation={[0, 0.18, 0]}>
            <Robot
              variant="bolt"
              animation={boltAnim === 'jump' ? 'jump' : 'wave'}
              expression={boltExpr}
              position={[0, 0, 0]}
              scale={1.30}
              headTrackCursor={true}
            />
          </group>

          {/* Left BOLT / Companion (Standing left, Facing viewer & Sunny text) */}
          <group position={[-0.92, 0, 0.10]} rotation={[0, 0.32, 0]}>
            <Robot
              variant="bolt"
              animation="salute"
              expression="focused"
              position={[0, 0, 0]}
              scale={1.12}
              headTrackCursor={true}
            />
          </group>

          {/* Right BOLT (Desktop Only: 3rd Robot, cheerful, standing near orange block) */}
          {!isMobile && (
            <group position={[0.72, 0, 0.40]} rotation={[0, -0.15, 0]}>
              <Robot
                variant="bolt"
                animation="cheer"
                expression="excited"
                position={[0, 0, 0]}
                scale={1.05}
                headTrackCursor={true}
              />
            </group>
          )}
        </group>
      )}
    </group>
  );
};

interface HeroIllustrationProps {
  isHeroInView?: boolean;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ isHeroInView = true }) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <CanvasErrorBoundary fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.35, 4.4], fov: 35 }}
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
          
          <HeroSceneController isHeroInView={isHeroInView} />
          <HeroSceneContent isMobile={isMobile} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroIllustration;
