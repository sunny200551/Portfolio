import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { HeroRobots } from '../../robot/HeroRobots';
import { createPaneTimeline } from './paneTimeline';
import { setProjectedPaneRects, type ProjectedPaneRect } from '../../hooks/useAdaptiveContrast';

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

  const { pointer, viewport, camera } = useThree();
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
      setProjectedPaneRects([]);
    };
  }, [gradientMap]);

  // Master GSAP Roaming Timeline across all sections
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = createPaneTimeline(
      {
        group: groupRef.current,
        pane1: pane1Ref.current,
        pane2: pane2Ref.current,
        pane3: pane3Ref.current,
        pane4: pane4Ref.current,
        pane5: pane5Ref.current,
      },
      isMobile,
      prefersReducedMotion
    );

    return () => ctx.revert();
  }, [isMobile]);

  // Reusable vectors for bounding box projection to avoid allocations
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const lastProjTime = useRef(0);

  // Frame loop for floating bob, slow orbit rocking, pointer parallax & screen projection
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Subtle pointer parallax
    const targetParallaxX = pointer.x * 0.25;
    const targetParallaxY = pointer.y * 0.25;

    // Continuous floating bob & slow orbital rocking
    groupRef.current.position.y += Math.sin(time * 0.9) * 0.0015;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      Math.sin(time * 0.4) * 0.05 + targetParallaxX * 0.2,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      Math.cos(time * 0.5) * 0.03 - targetParallaxY * 0.15,
      3,
      delta
    );

    // Throttled screen projection for adaptive contrast (~30fps)
    const now = performance.now();
    if (now - lastProjTime.current > 33) {
      lastProjTime.current = now;

      const paneDefs = [
        { id: 'pane1', ref: pane1Ref, size: [2.6, 1.8, 0.08], color: '#0047AB', luminance: 0.14 },
        { id: 'pane2', ref: pane2Ref, size: [2.8, 0.45, 0.08], color: '#FFFFFF', luminance: 0.95 },
        { id: 'pane3', ref: pane3Ref, size: [2.4, 1.4, 0.08], color: '#0A1A3F', luminance: 0.08 },
        ...(!isMobile
          ? [
              { id: 'pane4', ref: pane4Ref, size: [1.6, 0.55, 0.08], color: '#FF5A1F', luminance: 0.45 },
              { id: 'pane5', ref: pane5Ref, size: [3.8, 2.8, 0.05], color: '#EEF2FA', luminance: 0.88 },
            ]
          : []),
      ];

      const projected: ProjectedPaneRect[] = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (const def of paneDefs) {
        const grp = def.ref.current;
        if (!grp || !grp.visible) continue;

        const hw = def.size[0] / 2;
        const hh = def.size[1] / 2;
        const hd = def.size[2] / 2;

        const corners = [
          [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
          [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd],
        ];

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (const [cx, cy, cz] of corners) {
          tempVec.set(cx, cy, cz);
          grp.localToWorld(tempVec);
          tempVec.project(camera);

          const sx = ((tempVec.x + 1) / 2) * width;
          const sy = ((-tempVec.y + 1) / 2) * height;

          if (sx < minX) minX = sx;
          if (sx > maxX) maxX = sx;
          if (sy < minY) minY = sy;
          if (sy > maxY) maxY = sy;
        }

        // Only record if on-screen
        if (maxX > 0 && minX < width && maxY > 0 && minY < height) {
          projected.push({
            id: def.id,
            color: def.color,
            luminance: def.luminance,
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY,
          });
        }
      }

      setProjectedPaneRects(projected);
    }
  });

  return (
    <group ref={groupRef} position={[1.9, 0, 0]} scale={[1.25, 1.25, 1.25]}>
      {/* 5. Minimal Shadow Grid Plinth (#EEF2FA) + Standing Architectural Panes + Hero Robots */}
      {!isMobile && (
        <group ref={pane5Ref} position={[0.1, -0.15, -0.1]} rotation={[-0.82, 0, 0.18]}>
          {/* Main Floor Plinth (#EEF2FA) */}
          <UIBlock
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            size={[3.8, 2.6, 0.08]}
            color="#EEF2FA"
            outlineColor="#0A0A0A"
          >
            {/* 1. Main Cobalt UI Pane (#0047AB) - Standing at Back-Right */}
            <group ref={pane1Ref} position={[0.75, 0.35, 0.55]} rotation={[Math.PI / 2, 0, -0.1]}>
              <UIBlock
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                size={[1.8, 1.2, 0.06]}
                color="#0047AB"
              >
                {/* Header pill */}
                <mesh position={[-0.55, 0.45, 0.04]}>
                  <boxGeometry args={[0.42, 0.11, 0.02]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
                </mesh>
                {/* Content lines */}
                <mesh position={[-0.05, 0.1, 0.04]}>
                  <boxGeometry args={[1.3, 0.07, 0.02]} />
                  <meshToonMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[-0.2, -0.08, 0.04]}>
                  <boxGeometry args={[1.0, 0.07, 0.02]} />
                  <meshToonMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[-0.35, -0.25, 0.04]}>
                  <boxGeometry args={[0.7, 0.07, 0.02]} />
                  <meshToonMaterial color="#FFFFFF" />
                </mesh>
                {/* Action button inside card */}
                <mesh position={[0.45, -0.35, 0.04]}>
                  <boxGeometry args={[0.55, 0.18, 0.03]} />
                  <meshToonMaterial color="#0A0A0A" />
                  <Edges color="#FFFFFF" threshold={15} lineWidth={1} />
                </mesh>
              </UIBlock>
            </group>

            {/* 2. Top Nav Bar Pane (White #FFFFFF) - Along Back Edge */}
            <group ref={pane2Ref} position={[0.20, 0.85, 0.70]} rotation={[Math.PI / 2, 0, 0]}>
              <UIBlock
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                size={[2.2, 0.35, 0.06]}
                color="#FFFFFF"
              >
                {/* Logo block */}
                <mesh position={[-0.8, 0, 0.04]}>
                  <boxGeometry args={[0.24, 0.18, 0.02]} />
                  <meshToonMaterial color="#FF5A1F" />
                  <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
                </mesh>
                {/* Nav links */}
                <mesh position={[-0.3, 0, 0.04]}>
                  <boxGeometry args={[0.48, 0.08, 0.02]} />
                  <meshToonMaterial color="#0A0A0A" />
                </mesh>
                <mesh position={[0.25, 0, 0.04]}>
                  <boxGeometry args={[0.4, 0.08, 0.02]} />
                  <meshToonMaterial color="#0A0A0A" />
                </mesh>
                {/* Action CTA */}
                <mesh position={[0.75, 0, 0.04]}>
                  <boxGeometry args={[0.35, 0.16, 0.02]} />
                  <meshToonMaterial color="#0047AB" />
                  <Edges color="#0A0A0A" threshold={15} lineWidth={1.5} />
                </mesh>
              </UIBlock>
            </group>

            {/* 3. Terminal / Code Window Pane (Navy #0A1A3F) - Right Wing */}
            <group ref={pane3Ref} position={[1.15, -0.15, 0.45]} rotation={[Math.PI / 2, 0, 0.2]}>
              <UIBlock
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                size={[1.5, 0.9, 0.06]}
                color="#0A1A3F"
              >
                {/* Window header dots */}
                <mesh position={[-0.55, 0.32, 0.04]}>
                  <boxGeometry args={[0.07, 0.07, 0.02]} />
                  <meshToonMaterial color="#FF5A1F" />
                </mesh>
                <mesh position={[-0.42, 0.32, 0.04]}>
                  <boxGeometry args={[0.07, 0.07, 0.02]} />
                  <meshToonMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[-0.29, 0.32, 0.04]}>
                  <boxGeometry args={[0.07, 0.07, 0.02]} />
                  <meshToonMaterial color="#0047AB" />
                </mesh>
                {/* Code lines */}
                <mesh position={[-0.1, 0.12, 0.04]}>
                  <boxGeometry args={[0.95, 0.06, 0.02]} />
                  <meshToonMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[0.05, -0.05, 0.04]}>
                  <boxGeometry args={[1.15, 0.06, 0.02]} />
                  <meshToonMaterial color="#FF5A1F" />
                </mesh>
                <mesh position={[-0.18, -0.22, 0.04]}>
                  <boxGeometry args={[0.75, 0.06, 0.02]} />
                  <meshToonMaterial color="#EEF2FA" />
                </mesh>
              </UIBlock>
            </group>

            {/* 4. Orange Accent Pill / Badge Pane (#FF5A1F) - Junction Bar */}
            <group ref={pane4Ref} position={[0.25, -0.05, 0.22]} rotation={[Math.PI / 2, 0, -0.2]}>
              <UIBlock
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                size={[0.9, 0.32, 0.05]}
                color="#FF5A1F"
              >
                <mesh position={[-0.25, 0, 0.035]}>
                  <boxGeometry args={[0.15, 0.15, 0.02]} />
                  <meshToonMaterial color="#0A0A0A" />
                  <Edges color="#FFFFFF" threshold={15} lineWidth={1.5} />
                </mesh>
                <mesh position={[0.12, 0, 0.035]}>
                  <boxGeometry args={[0.45, 0.08, 0.02]} />
                  <meshToonMaterial color="#0A0A0A" />
                </mesh>
              </UIBlock>
            </group>

            {/* Robots on the clear front-left 45-50% floor */}
            <HeroRobots />
          </UIBlock>
        </group>
      )}
    </group>
  );
};

export default HeroPanes;
