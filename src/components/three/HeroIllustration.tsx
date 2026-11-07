import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { robotStore } from '../../robot/robotStore';
import { CanvasErrorBoundary } from './CanvasBoundary';

interface BlockProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color: string;
  outlineColor?: string;
  children?: React.ReactNode;
}

const UIBlock: React.FC<BlockProps> = ({
  position,
  rotation = [0, 0, 0],
  size,
  color,
  outlineColor = '#0A0A0A',
  children,
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshToonMaterial color={color} />
        <Edges threshold={15} color={outlineColor} lineWidth={2} />
      </mesh>
      {children}
    </group>
  );
};

// Scene Controller: Guarantees active frames and recovery
const HeroSceneController: React.FC<{ isHeroInView: boolean }> = ({ isHeroInView }) => {
  const { gl, invalidate } = useThree();
  const lastInView = useRef(isHeroInView);

  useEffect(() => {
    invalidate();
    if (isHeroInView && !lastInView.current) {
      robotStore.setBolt('wave', 'happy');
    }
    lastInView.current = isHeroInView;
  }, [isHeroInView, invalidate]);

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

// Animated Looping Code Lines on Navy Panel
const LoopingCodeLines: React.FC = () => {
  const line1Ref = useRef<THREE.Mesh>(null);
  const line2Ref = useRef<THREE.Mesh>(null);
  const line3Ref = useRef<THREE.Mesh>(null);
  const line4Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = (t * 1.6) % 4; // 4s cycle

    if (line1Ref.current) {
      const s = Math.min(1, Math.max(0, cycle * 2.5));
      line1Ref.current.scale.x = s;
      line1Ref.current.position.x = -0.38 + (s * 0.35) / 2;
    }
    if (line2Ref.current) {
      const s = Math.min(1, Math.max(0, (cycle - 0.7) * 2.5));
      line2Ref.current.scale.x = s;
      line2Ref.current.position.x = -0.38 + (s * 0.55) / 2;
    }
    if (line3Ref.current) {
      const s = Math.min(1, Math.max(0, (cycle - 1.4) * 2.5));
      line3Ref.current.scale.x = s;
      line3Ref.current.position.x = -0.38 + (s * 0.42) / 2;
    }
    if (line4Ref.current) {
      const s = Math.min(1, Math.max(0, (cycle - 2.1) * 2.5));
      line4Ref.current.scale.x = s;
      line4Ref.current.position.x = -0.38 + (s * 0.28) / 2;
    }
  });

  return (
    <group position={[0, 0, 0.05]}>
      {/* Line 1: Orange keyword */}
      <mesh ref={line1Ref} position={[-0.20, 0.12, 0]}>
        <boxGeometry args={[0.35, 0.045, 0.015]} />
        <meshBasicMaterial color="#FF5A1F" />
      </mesh>
      {/* Line 2: White function declaration */}
      <mesh ref={line2Ref} position={[-0.10, 0.03, 0]}>
        <boxGeometry args={[0.55, 0.045, 0.015]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Line 3: Cyan/light blue return body */}
      <mesh ref={line3Ref} position={[-0.17, -0.06, 0]}>
        <boxGeometry args={[0.42, 0.045, 0.015]} />
        <meshBasicMaterial color="#EEF2FA" />
      </mesh>
      {/* Line 4: Orange closing */}
      <mesh ref={line4Ref} position={[-0.24, -0.15, 0]}>
        <boxGeometry args={[0.28, 0.045, 0.015]} />
        <meshBasicMaterial color="#FF5A1F" />
      </mesh>
    </group>
  );
};

// Animated Progress Bar on Navy Panel
const AnimatedProgressBar: React.FC = () => {
  const barRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = (t * 0.8) % 3; // 3s loop
    const progress = Math.min(1, cycle / 2.2);

    if (barRef.current) {
      barRef.current.scale.x = progress;
      barRef.current.position.x = -0.45 + (progress * 0.9) / 2;
    }
  });

  return (
    <group position={[0, -0.27, 0.05]}>
      {/* Progress track */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.92, 0.035, 0.01]} />
        <meshBasicMaterial color="#051226" />
      </mesh>
      {/* Active orange fill */}
      <mesh ref={barRef} position={[-0.45, 0, 0.005]}>
        <boxGeometry args={[0.9, 0.035, 0.012]} />
        <meshBasicMaterial color="#FF5A1F" />
      </mesh>
    </group>
  );
};

// Floating Cube Component with hard shadow and outline
const FloatingCube: React.FC<{
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
  rotSpeed: number;
  phase?: number;
}> = ({ position, size, color, speed, rotSpeed, phase = 0 }) => {
  const meshRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + phase;
    meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.08;
    meshRef.current.rotation.x = t * rotSpeed * 0.7;
    meshRef.current.rotation.y = t * rotSpeed;

    if (shadowRef.current) {
      const s = Math.max(0.4, 1.0 - Math.sin(t * speed) * 0.2);
      shadowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <group ref={meshRef} position={position}>
        <mesh castShadow>
          <boxGeometry args={[size, size, size]} />
          <meshToonMaterial color={color} />
          <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
        </mesh>
      </group>
      {/* Hard floor shadow */}
      <mesh ref={shadowRef} position={[position[0], 0.09, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * 1.3, size * 1.3]} />
        <meshBasicMaterial color="#0A0A0A" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

interface HeroSceneContentProps {
  isMobile: boolean;
}

const HeroSceneContent: React.FC<HeroSceneContentProps> = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, camera, gl } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle pointer parallax tilt (capped <= 5 deg = 0.087 rad)
    const targetTiltX = THREE.MathUtils.clamp(-pointer.y * 0.06, -0.085, 0.085);
    const targetTiltY = THREE.MathUtils.clamp(pointer.x * 0.08, -0.085, 0.085);

    groupRef.current.position.y = Math.sin(t * 1.2) * 0.015;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      -0.14 + Math.sin(t * 0.35) * 0.01 + targetTiltY,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      0.24 + targetTiltX,
      3,
      delta
    );

    // Platform anchor projection: emits the 2D screen coordinate of the clear floor anchor
    if (gl.domElement) {
      const anchorVec = new THREE.Vector3(0, 0.12, 0.38);
      anchorVec.applyMatrix4(groupRef.current.matrixWorld);
      anchorVec.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      const screenX = ((anchorVec.x + 1) * rect.width) / 2 + rect.left;
      const screenY = ((-anchorVec.y + 1) * rect.height) / 2 + rect.top;
      robotStore.setHomePlatformPos(screenX, screenY);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.22, 0]} rotation={[0.24, -0.14, 0]}>
      {/* 1. Base Foundation Desk Slab: Thick slab with orange edge accent and clear floor */}
      <UIBlock
        position={[0, 0, 0]}
        size={[3.4, 0.16, 2.2]}
        color="#EEF2FA"
        outlineColor="#0A0A0A"
      >
        {/* Front orange accent strip rim (#FF5A1F) */}
        <mesh position={[0, -0.02, 1.105]}>
          <boxGeometry args={[3.41, 0.045, 0.02]} />
          <meshBasicMaterial color="#FF5A1F" />
        </mesh>
        {/* Side orange accent strips */}
        <mesh position={[-1.705, -0.02, 0]}>
          <boxGeometry args={[0.02, 0.045, 2.21]} />
          <meshBasicMaterial color="#FF5A1F" />
        </mesh>
        <mesh position={[1.705, -0.02, 0]}>
          <boxGeometry args={[0.02, 0.045, 2.21]} />
          <meshBasicMaterial color="#FF5A1F" />
        </mesh>
      </UIBlock>

      {/* 2. Blue Browser Window Panel (#0047AB) at back */}
      <group position={[0.35, 0.68, -0.50]} rotation={[0, -0.14, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          size={[1.65, 1.08, 0.08]}
          color="#0047AB"
        >
          {/* Top window controls pill */}
          <mesh position={[-0.60, 0.44, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.48, 0.44, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.36, 0.44, 0.05]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
          {/* Window address bar */}
          <mesh position={[0.15, 0.44, 0.05]}>
            <boxGeometry args={[0.82, 0.065, 0.02]} />
            <meshBasicMaterial color="#051226" />
          </mesh>

          {/* Window card contents */}
          <mesh position={[-0.38, 0.22, 0.05]}>
            <boxGeometry args={[0.55, 0.12, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.08, 0.04, 0.05]}>
            <boxGeometry args={[1.25, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.12, -0.14, 0.05]}>
            <boxGeometry args={[0.85, 0.07, 0.02]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.42, -0.32, 0.05]}>
            <boxGeometry args={[0.50, 0.15, 0.03]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
        </UIBlock>
      </group>

      {/* Top Header White Bar Pane */}
      <group position={[0.35, 1.34, -0.50]} rotation={[0, -0.14, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          size={[1.65, 0.16, 0.08]}
          color="#FFFFFF"
        >
          <mesh position={[-0.56, 0, 0.05]}>
            <boxGeometry args={[0.22, 0.08, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.08, 0, 0.05]}>
            <boxGeometry args={[0.45, 0.05, 0.02]} />
            <meshBasicMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.50, 0, 0.05]}>
            <boxGeometry args={[0.28, 0.08, 0.02]} />
            <meshBasicMaterial color="#0047AB" />
          </mesh>
        </UIBlock>
      </group>

      {/* 3. Navy Code Panel (#0A1A3F) Standing on Right with Tab Bar & Typing Animation */}
      <group position={[1.05, 0.48, -0.22]} rotation={[0, -0.30, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          size={[1.15, 0.84, 0.08]}
          color="#0A1A3F"
        >
          {/* File Tab Bar Header */}
          <mesh position={[-0.32, 0.34, 0.05]}>
            <boxGeometry args={[0.36, 0.08, 0.02]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[0.08, 0.34, 0.05]}>
            <boxGeometry args={[0.30, 0.06, 0.02]} />
            <meshBasicMaterial color="#051226" />
          </mesh>

          {/* Looping Code Typing Animation */}
          <LoopingCodeLines />

          {/* Animated Orange Progress Bar */}
          <AnimatedProgressBar />
        </UIBlock>
      </group>

      {/* 4. Orange Accent Bar Pane (#FF5A1F) */}
      <group position={[0.72, 0.16, 0.16]} rotation={[0, -0.10, 0]}>
        <UIBlock
          position={[0, 0, 0]}
          size={[0.70, 0.22, 0.08]}
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

      {/* 5. Floating Orange & Blue Cubes with Hard Shadows */}
      <FloatingCube
        position={[-1.10, 0.55, 0.20]}
        size={0.24}
        color="#FF5A1F"
        speed={1.8}
        rotSpeed={0.8}
        phase={0}
      />
      <FloatingCube
        position={[1.25, 0.82, -0.05]}
        size={0.20}
        color="#0047AB"
        speed={1.5}
        rotSpeed={0.6}
        phase={1.8}
      />
      <FloatingCube
        position={[-0.65, 0.32, 0.65]}
        size={0.16}
        color="#0A1A3F"
        speed={2.2}
        rotSpeed={1.0}
        phase={3.2}
      />

      {/* 6. Flat Sticker Accent Badges */}
      <group position={[-1.25, 0.14, -0.40]} rotation={[0, 0.22, 0]}>
        <UIBlock position={[0, 0, 0]} size={[0.42, 0.26, 0.04]} color="#FFFFFF">
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.24, 0.06, 0.01]} />
            <meshBasicMaterial color="#FF5A1F" />
          </mesh>
        </UIBlock>
      </group>
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
    <div id="hero-3d-scene" className="w-full h-full relative" aria-hidden="true">
      <CanvasErrorBoundary fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.25, 5.0], fov: 34 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          frameloop="always"
        >
          <ambientLight intensity={1.15} color="#FFFFFF" />
          <directionalLight position={[5, 8, 6]} intensity={1.6} color="#FFFFFF" />
          <directionalLight position={[-4, -2, -2]} intensity={0.45} color="#EEF2FA" />

          <HeroSceneController isHeroInView={isHeroInView} />
          <HeroSceneContent isMobile={isMobile} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
export default HeroIllustration;
