import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PaneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  outlineColor?: string;
  children?: React.ReactNode;
}

const UIBlock: React.FC<PaneProps> = ({
  position,
  rotation,
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

export const HeroPanes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pane1Ref = useRef<THREE.Group>(null);
  const pane2Ref = useRef<THREE.Group>(null);
  const pane3Ref = useRef<THREE.Group>(null);
  const pane4Ref = useRef<THREE.Group>(null);
  const pane5Ref = useRef<THREE.Group>(null);

  const [isVisible, setIsVisible] = useState(true);
  const { pointer, viewport } = useThree();
  const isMobile = viewport.width < 6.5;

  // 3-step toon gradient map
  const gradientMap = useMemo(() => {
    const colors = new Uint8Array([80, 160, 255]);
    const texture = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      gradientMap.dispose();
    };
  }, [gradientMap]);

  // ScrollTrigger animation: separate panes, fade out, and hide when leaving #home
  useEffect(() => {
    const homeEl = document.getElementById('home');
    if (!homeEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onLeave: () => setIsVisible(false),
          onEnterBack: () => setIsVisible(true),
          onLeaveBack: () => setIsVisible(true),
          onEnter: () => setIsVisible(true),
        },
      });

      // Separation animation
      if (pane1Ref.current) {
        tl.to(pane1Ref.current.position, { x: 1.8, y: 1.2, z: 1.2, ease: 'none' }, 0);
        tl.to(pane1Ref.current.rotation, { x: 0.3, y: -0.4, z: 0.15, ease: 'none' }, 0);
      }
      if (pane2Ref.current) {
        tl.to(pane2Ref.current.position, { x: -1.6, y: -1.0, z: 1.0, ease: 'none' }, 0);
        tl.to(pane2Ref.current.rotation, { x: -0.2, y: 0.35, z: -0.1, ease: 'none' }, 0);
      }
      if (pane3Ref.current) {
        tl.to(pane3Ref.current.position, { x: 1.5, y: -1.4, z: 1.4, ease: 'none' }, 0);
        tl.to(pane3Ref.current.rotation, { x: 0.15, y: 0.4, z: -0.15, ease: 'none' }, 0);
      }
      if (pane4Ref.current) {
        tl.to(pane4Ref.current.position, { x: -1.2, y: 1.4, z: 1.0, ease: 'none' }, 0);
        tl.to(pane4Ref.current.rotation, { x: -0.25, y: -0.3, z: 0.1, ease: 'none' }, 0);
      }
      if (pane5Ref.current) {
        tl.to(pane5Ref.current.position, { x: 0, y: -2.0, z: -1.2, ease: 'none' }, 0);
      }

      // Fade out group scale & drop out completely before end of hero
      if (groupRef.current) {
        tl.to(
          groupRef.current.scale,
          {
            x: 0.05,
            y: 0.05,
            z: 0.05,
            ease: 'power2.in',
          },
          0.4
        );
        tl.to(
          groupRef.current.position,
          {
            y: isMobile ? -6 : -4,
            ease: 'power1.in',
          },
          0.3
        );
      }
    });

    return () => ctx.revert();
  }, [isMobile]);

  // Frame loop for idle bobbing and pointer parallax
  useFrame((state, delta) => {
    if (!groupRef.current || !isVisible) return;

    const time = state.clock.getElapsedTime();

    // Subtle pointer parallax
    const targetParallaxX = pointer.x * 0.25;
    const targetParallaxY = pointer.y * 0.25;

    const baseX = isMobile ? 0 : 2.2;
    const baseY = isMobile ? -2.2 : 0;

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      baseX + targetParallaxX,
      4,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      baseY + targetParallaxY + Math.sin(time * 0.8) * 0.05,
      4,
      delta
    );

    // Subtle individual idle breathing
    if (pane1Ref.current) {
      pane1Ref.current.position.y = 0.2 + Math.sin(time * 1.2) * 0.03;
    }
    if (pane2Ref.current) {
      pane2Ref.current.position.y = 1.1 + Math.cos(time * 1.0) * 0.03;
    }
    if (pane3Ref.current) {
      pane3Ref.current.position.y = -0.9 + Math.sin(time * 0.9 + 1) * 0.03;
    }
  });

  if (!isVisible) return null;

  // Reduced scale: ~60% on desktop (0.58), 0.38 on mobile
  const baseScale = isMobile ? 0.38 : 0.58;
  const initialBaseX = isMobile ? 0 : 2.2;
  const initialBaseY = isMobile ? -2.2 : 0;

  return (
    <group 
      ref={groupRef} 
      position={[initialBaseX, initialBaseY, -0.6]} 
      rotation={[0.08, -0.15, 0.02]}
      scale={[baseScale, baseScale, baseScale]}
    >
      {/* 1. Main UI Card Pane (Cobalt #0047AB) */}
      <group ref={pane1Ref} position={[0.2, 0.2, 0.3]} rotation={[-0.05, 0.12, -0.04]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[2.6, 1.7, 0.08]}
          color="#0047AB"
        >
          {/* Header pill inside card */}
          <mesh position={[-0.6, 0.55, 0.05]}>
            <boxGeometry args={[0.9, 0.18, 0.03]} />
            <meshToonMaterial color="#FF5A1F" />
            <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
          </mesh>
          {/* Content lines */}
          <mesh position={[-0.1, 0.15, 0.05]}>
            <boxGeometry args={[1.9, 0.1, 0.02]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.3, -0.1, 0.05]}>
            <boxGeometry args={[1.5, 0.1, 0.02]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.5, -0.35, 0.05]}>
            <boxGeometry args={[1.1, 0.1, 0.02]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          {/* Action button inside card */}
          <mesh position={[0.65, -0.5, 0.05]}>
            <boxGeometry args={[0.8, 0.25, 0.04]} />
            <meshToonMaterial color="#0A0A0A" />
            <Edges color="#FFFFFF" threshold={15} lineWidth={1} />
          </mesh>
        </UIBlock>
      </group>

      {/* 2. Top Nav Bar Pane (White #FFFFFF) */}
      <group ref={pane2Ref} position={[-0.3, 1.1, 0.5]} rotation={[0.04, -0.08, 0.06]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[2.8, 0.45, 0.08]}
          color="#FFFFFF"
        >
          {/* Logo block */}
          <mesh position={[-1.05, 0, 0.05]}>
            <boxGeometry args={[0.3, 0.22, 0.03]} />
            <meshToonMaterial color="#FF5A1F" />
            <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
          </mesh>
          {/* Nav links */}
          <mesh position={[-0.4, 0, 0.05]}>
            <boxGeometry args={[0.6, 0.1, 0.02]} />
            <meshToonMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.3, 0, 0.05]}>
            <boxGeometry args={[0.5, 0.1, 0.02]} />
            <meshToonMaterial color="#0A0A0A" />
          </mesh>
          {/* Action CTA */}
          <mesh position={[0.95, 0, 0.05]}>
            <boxGeometry args={[0.45, 0.2, 0.03]} />
            <meshToonMaterial color="#0047AB" />
            <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
          </mesh>
        </UIBlock>
      </group>

      {/* 3. Terminal / Code Window Pane (Navy #0A1A3F) */}
      <group ref={pane3Ref} position={[0.4, -0.9, 0.7]} rotation={[-0.08, 0.15, -0.03]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[2.4, 1.4, 0.08]}
          color="#0A1A3F"
        >
          {/* Window header buttons */}
          <mesh position={[-0.9, 0.5, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshToonMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.72, 0.5, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.54, 0.5, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshToonMaterial color="#0047AB" />
          </mesh>
          {/* Code lines */}
          <mesh position={[-0.2, 0.2, 0.05]}>
            <boxGeometry args={[1.5, 0.08, 0.02]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, -0.05, 0.05]}>
            <boxGeometry args={[1.8, 0.08, 0.02]} />
            <meshToonMaterial color="#FF5A1F" />
          </mesh>
          <mesh position={[-0.3, -0.3, 0.05]}>
            <boxGeometry args={[1.2, 0.08, 0.02]} />
            <meshToonMaterial color="#EEF2FA" />
          </mesh>
        </UIBlock>
      </group>

      {/* 4. Orange Accent Pill / Badge Pane (#FF5A1F) */}
      <group ref={pane4Ref} position={[-0.9, -0.3, 0.9]} rotation={[0.06, -0.12, 0.08]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[1.6, 0.55, 0.08]}
          color="#FF5A1F"
        >
          <mesh position={[-0.45, 0, 0.05]}>
            <boxGeometry args={[0.25, 0.25, 0.03]} />
            <meshToonMaterial color="#0A0A0A" />
            <Edges color="#FFFFFF" threshold={15} lineWidth={1.5} />
          </mesh>
          <mesh position={[0.2, 0, 0.05]}>
            <boxGeometry args={[0.8, 0.12, 0.02]} />
            <meshToonMaterial color="#0A0A0A" />
          </mesh>
        </UIBlock>
      </group>

      {/* 5. Minimal Shadow Grid Plinth (#EEF2FA) */}
      <group ref={pane5Ref} position={[0.2, -1.5, -0.8]} rotation={[-1.2, 0, 0.2]}>
        <UIBlock
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          size={[3.8, 2.8, 0.05]}
          color="#EEF2FA"
          outlineColor="#0A0A0A"
        />
      </group>

    </group>
  );
};

export default HeroPanes;
