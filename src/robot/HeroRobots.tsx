import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { Robot } from './Robot';
import { robotStore } from './robotStore';

export const HeroRobots: React.FC = () => {
  const [storeState, setStoreState] = useState(() => robotStore.getState());
  const { camera, size } = useThree();

  const platformAnchorRef = useRef<THREE.Group>(null);
  const nutGroupRef = useRef<THREE.Group>(null);
  const chipGroupRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);

  const prevSectionRef = useRef(storeState.activeSection);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      setStoreState({ ...robotStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  // Section-aware reactions for NUT and CHIP:
  // When BOLT leaves (activeSection !== 'home'), wave goodbye!
  // When BOLT returns (activeSection === 'home'), look up and welcome back!
  useEffect(() => {
    const currentSection = storeState.activeSection;
    const prevSection = prevSectionRef.current;
    prevSectionRef.current = currentSection;

    if (currentSection !== 'home') {
      // BOLT is away: NUT and CHIP wave goodbye
      robotStore.setNut('wave');
      robotStore.setChip('wave', 'happy');
    } else if (prevSection !== 'home') {
      // BOLT just returned to home: NUT and CHIP look up and salute
      robotStore.setNut('salute');
      robotStore.setChip('cheer', 'excited');

      const timer = setTimeout(() => {
        robotStore.setNut('walk');
        robotStore.setChip('walk', 'focused');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [storeState.activeSection]);

  // Frame loop: update cube kick and project platform anchor coordinates
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Cube slides back and forth between NUT's foot and rebound
    if (cubeRef.current) {
      const kick = (Math.sin(t * 3.5) + 1) / 2; // 0 to 1
      cubeRef.current.position.x = -0.9 + kick * 0.35;
      cubeRef.current.position.y = 0.08 + Math.sin(kick * Math.PI) * 0.05;
      cubeRef.current.rotation.y = t * 2.5;
      cubeRef.current.rotation.z = Math.sin(t * 6) * 0.2;
    }

    // Project platform anchor position to 2D pixel coordinates for TravelingBolt
    if (platformAnchorRef.current) {
      const worldPos = new THREE.Vector3();
      platformAnchorRef.current.getWorldPosition(worldPos);
      worldPos.y += 0.35; // Center of robot height

      worldPos.project(camera);

      // Convert normalized device coords (-1 to +1) to pixel coords
      const screenX = ((worldPos.x + 1) * size.width) / 2;
      const screenY = ((-worldPos.y + 1) * size.height) / 2;

      robotStore.setHomePlatformPos(screenX, screenY);
    }
  });

  if (!storeState.robotEnabled) return null;

  return (
    <group position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Platform Anchor for BOLT: positioned at [0.15, 0.04, -0.75] */}
      <group
        ref={platformAnchorRef}
        position={[0.15, 0.04, -0.75]}
        renderOrder={20}
      >
        {/* Debug helper when ?robotDebug=1 */}
        {storeState.isDebug && (
          <>
            <axesHelper args={[0.4]} />
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.6, 0.9, 0.4]} />
              <meshBasicMaterial wireframe color="#FF5A1F" />
            </mesh>
          </>
        )}
      </group>

      {/* 2. NUT - Left side kicking the orange cube (scale=0.72 -> ~74px tall) */}
      <group
        ref={nutGroupRef}
        position={[-1.15, 0.04, -0.65]}
        renderOrder={20}
      >
        <Robot
          variant="nut"
          expression="focused"
          animation={storeState.nutAnim}
          position={[0, 0, 0]}
          rotation={[0, 0.35, 0]}
          scale={0.72}
          headTrackCursor={true}
        />
        {/* Cel-shaded Orange Cube that NUT kicks */}
        <mesh ref={cubeRef} position={[0.26, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshToonMaterial color="#FF5A1F" />
          <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
        </mesh>
        {/* Debug Visualizer (?robotDebug=1) */}
        {storeState.isDebug && (
          <>
            <axesHelper args={[0.3]} />
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.45, 0.7, 0.35]} />
              <meshBasicMaterial wireframe color="#0047AB" />
            </mesh>
          </>
        )}
      </group>

      {/* 3. CHIP - Right side pushing blue window panel (scale=0.68 -> ~70px tall) */}
      <group
        ref={chipGroupRef}
        position={[1.2, 0.04, -0.6]}
        renderOrder={20}
      >
        <Robot
          variant="chip"
          expression={storeState.chipExpr}
          animation={storeState.chipAnim}
          position={[0, 0, 0]}
          rotation={[0, -0.55, 0]}
          scale={0.68}
          headTrackCursor={storeState.chipAnim !== 'sleep'}
        />
        {/* Debug Visualizer (?robotDebug=1) */}
        {storeState.isDebug && (
          <>
            <axesHelper args={[0.3]} />
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.42, 0.65, 0.32]} />
              <meshBasicMaterial wireframe color="#0A1A3F" />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
};

export default HeroRobots;
