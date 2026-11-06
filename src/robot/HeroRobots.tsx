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
  const pushPanelRef = useRef<THREE.Group>(null);

  const prevSectionRef = useRef(storeState.activeSection);

  // Walk physics accumulators for NUT & CHIP
  const nutWalkStep = useRef(0);
  const chipWalkStep = useRef(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      setStoreState({ ...robotStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  // Section-aware reactions for NUT and CHIP:
  useEffect(() => {
    const currentSection = storeState.activeSection;
    const prevSection = prevSectionRef.current;
    prevSectionRef.current = currentSection;

    if (currentSection !== 'home') {
      robotStore.setNut('wave');
      robotStore.setChip('wave', 'happy');
    } else if (prevSection !== 'home') {
      robotStore.setNut('salute');
      robotStore.setChip('cheer', 'excited');

      const timer = setTimeout(() => {
        robotStore.setNut('walk');
        robotStore.setChip('walk', 'focused');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [storeState.activeSection]);

  // Frame loop: patrol strictly within walkable bounds with real walk cycle
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. NUT Patrol on plain grey floor (front-left side)
    // Bounds: X in [-1.35, -1.05], Z = 0.50
    if (nutGroupRef.current) {
      const nutPatrolProgress = (Math.sin(t * 1.8) + 1) * 0.5; // 0 to 1
      const nutX = -1.35 + nutPatrolProgress * 0.30;
      const nutZ = 0.50;
      nutGroupRef.current.position.set(nutX, 0.04, nutZ);

      // Facing travel direction
      const nutDir = Math.cos(t * 1.8);
      nutGroupRef.current.rotation.y = nutDir > 0 ? 0.35 : -0.35;

      // Walk stepping
      nutWalkStep.current += Math.abs(nutDir) * 0.05;
      nutGroupRef.current.position.y = 0.04 + Math.abs(Math.sin(nutWalkStep.current * 2)) * 0.012;
    }

    // Cel-shaded Orange Cube that NUT kicks back and forth at the edge of the walkable area
    if (cubeRef.current) {
      const kick = (Math.sin(t * 3.6) + 1) * 0.5;
      cubeRef.current.position.x = -0.92 + kick * 0.16;
      cubeRef.current.position.y = 0.08 + Math.sin(kick * Math.PI) * 0.035;
      cubeRef.current.rotation.y = t * 2.2;
    }

    // 2. CHIP Patrol on plain grey floor (front lip, clear of all panels)
    // Bounds: X in [-0.40, -0.10], Z = 0.85
    if (chipGroupRef.current) {
      const chipPatrolProgress = (Math.sin(t * 1.5 + 1) + 1) * 0.5;
      const chipX = -0.40 + chipPatrolProgress * 0.30;
      const chipZ = 0.85;
      chipGroupRef.current.position.set(chipX, 0.04, chipZ);

      const chipDir = Math.cos(t * 1.5 + 1);
      chipGroupRef.current.rotation.y = chipDir > 0 ? -0.35 : 0.35;

      chipWalkStep.current += Math.abs(chipDir) * 0.05;
      chipGroupRef.current.position.y = 0.04 + Math.abs(Math.sin(chipWalkStep.current * 2)) * 0.012;

      // CHIP pushes the small panel at the edge of the walkable area
      if (pushPanelRef.current) {
        pushPanelRef.current.position.set(chipX + 0.16, 0.08, chipZ);
      }
    }

    // 3. Project BOLT's plain grey platform anchor position to 2D pixel coordinates
    // Position: strictly in open grey floor at [-0.70, 0.04, 0.55]
    if (platformAnchorRef.current) {
      const worldPos = new THREE.Vector3();
      platformAnchorRef.current.getWorldPosition(worldPos);
      worldPos.y += 0.32; // Center of robot height

      worldPos.project(camera);

      // Convert normalized device coords (-1 to +1) to pixel coords
      const screenX = ((worldPos.x + 1) * size.width) / 2;
      const screenY = ((-worldPos.y + 1) * size.height) / 2;

      robotStore.setHomePlatformPos(screenX, screenY);
    }
  });

  if (!storeState.robotEnabled) return null;

  return (
    <group position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Platform Anchor for BOLT: strictly in open grey floor at [-0.70, 0.04, 0.55] */}
      <group
        ref={platformAnchorRef}
        position={[-0.70, 0.04, 0.55]}
        renderOrder={20}
      >
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

      {/* 2. NUT - Far left on plain grey floor, kicking orange cube */}
      <group
        ref={nutGroupRef}
        position={[-1.25, 0.04, 0.50]}
        renderOrder={20}
      >
        <Robot
          variant="nut"
          expression="focused"
          animation={storeState.nutAnim}
          position={[0, 0, 0]}
          scale={0.88}
          headTrackCursor={true}
        />
      </group>

      {/* Cel-shaded Orange Cube that NUT kicks at the edge of the walkable area */}
      <mesh ref={cubeRef} position={[-0.92, 0.08, 0.50]} castShadow receiveShadow renderOrder={20}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshToonMaterial color="#FF5A1F" />
        <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
      </mesh>

      {/* 3. CHIP - Front lip on plain grey floor */}
      <group
        ref={chipGroupRef}
        position={[-0.35, 0.04, 0.85]}
        renderOrder={20}
      >
        <Robot
          variant="chip"
          expression={storeState.chipExpr}
          animation={storeState.chipAnim}
          position={[0, 0, 0]}
          scale={0.78}
          headTrackCursor={storeState.chipAnim !== 'sleep'}
        />
      </group>

      {/* Small panel that CHIP pushes at the edge of the walkable area */}
      <group ref={pushPanelRef} position={[-0.18, 0.08, 0.85]} renderOrder={20}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.16, 0.04]} />
          <meshToonMaterial color="#FFFFFF" />
          <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <boxGeometry args={[0.12, 0.08, 0.01]} />
          <meshToonMaterial color="#FF5A1F" />
        </mesh>
      </group>
    </group>
  );
};

export default HeroRobots;
