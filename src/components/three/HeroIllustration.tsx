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

// Scene Controller: Ensures scene renders immediately within 1 frame upon return to top
const HeroSceneController: React.FC<{ isHeroInView: boolean }> = ({ isHeroInView }) => {
  const { gl, invalidate } = useThree();
  const lastInView = useRef(isHeroInView);

  // Immediate frame trigger
  useEffect(() => {
    invalidate();
    if (isHeroInView && !lastInView.current) {
      // Welcome back gag
      robotStore.setBolt('wave', 'happy');
    }
    lastInView.current = isHeroInView;
  }, [isHeroInView, invalidate]);

  // Window scroll and navigation listener to guarantee frame on return-to-top
  useEffect(() => {
    const handleScrollOrNav = () => {
      if (window.scrollY < 200) {
        invalidate();
      }
    };
    window.addEventListener('scroll', handleScrollOrNav, { passive: true });
    window.addEventListener('scroll-to-top', handleScrollOrNav);
    window.addEventListener('focus', handleScrollOrNav);

    return () => {
      window.removeEventListener('scroll', handleScrollOrNav);
      window.removeEventListener('scroll-to-top', handleScrollOrNav);
      window.removeEventListener('focus', handleScrollOrNav);
    };
  }, [invalidate]);

  // WebGL context loss recovery
  useEffect(() => {
    const canvasEl = gl.domElement;
    if (!canvasEl) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('Hero 3D WebGL context lost. Recovering...');
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

    // Gentle pointer parallax
    const targetParallaxX = pointer.x * 0.06;
    const targetParallaxY = pointer.y * 0.04;

    groupRef.current.position.y = Math.sin(t * 1.2) * 0.02;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      -0.16 + Math.sin(t * 0.4) * 0.015 + targetParallaxX,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      0.28 - targetParallaxY * 0.2,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0, -0.22, 0]} rotation={[0.26, -0.14, 0]}>
      {/* 1. Base Foundation Desk Slab: Plain grey/ice-blue with clear floor in front */}
      <UIBlock
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        size={[3.6, 0.14, 2.4]}
        color="#EEF2FA"
        outlineColor="#0A0A0A"
      />

      {/* 2. Standing Architectural Panes toward the BACK and RIGHT */}
      
      {/* Blue Window Panel (#0047AB) in background */}
      <group position={[0.40, 0.65, -0.55]} rotation={[0, -0.15, 0]}>
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

      {/* Grey Top Bar Pane (#FFFFFF) */}
      <group position={[0.40, 1.28, -0.55]} rotation={[0, -0.15, 0]}>
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

      {/* Navy Panel (#0A1A3F) on right */}
      <group position={[1.08, 0.45, -0.28]} rotation={[0, -0.32, 0]}>
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

      {/* Orange Bar Accent (#FF5A1F) */}
      <group position={[0.78, 0.14, 0.08]} rotation={[0, -0.12, 0]}>
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

      {/* 3. Three Robots Standing on Clear Grey Floor Area in Front - SPREAD with >= 1 robot width gap */}
      {robotEnabled && (
        <group position={[0, 0.07, 0]}>
          {/* Main Hero BOLT (Center-Front, ~170-200px tall at 1920px, facing visitor & Sunny) */}
          <group position={[0.0, 0, 0.48]} rotation={[0, 0.08, 0]}>
            <Robot
              variant="bolt"
              animation={boltAnim === 'jump' ? 'jump' : 'wave'}
              expression={boltExpr === 'focused' ? 'happy' : boltExpr}
              position={[0, 0, 0]}
              scale={1.12}
              headTrackCursor={true}
            />
          </group>

          {/* NUT: Front-Left on clear floor (~110-130px tall, lively, >= 1 robot-width gap from BOLT) */}
          <group position={[-0.85, 0, 0.38]} rotation={[0, 0.28, 0]}>
            <Robot
              variant="nut"
              animation={nutAnim}
              expression="happy"
              position={[0, 0, 0]}
              scale={0.76}
              headTrackCursor={true}
            />
          </group>

          {/* CHIP: Front-Right on clear floor (~110-130px tall, upright, >= 1 robot-width gap from BOLT) */}
          {(!isMobile || window.innerWidth > 480) && (
            <group position={[0.85, 0, 0.38]} rotation={[0, -0.22, 0]}>
              <Robot
                variant="chip"
                animation={chipAnim}
                expression={chipExpr === 'focused' ? 'happy' : chipExpr}
                position={[0, 0, 0]}
                scale={0.72}
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
          camera={{ position: [0, 1.35, 5.6], fov: 36 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          frameloop="always"
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
