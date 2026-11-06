import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import { skillsData, type SkillCategoryGroup } from '../../data/skills';

interface SkillsIsometricStackProps {
  onSelectGroup: (group: SkillCategoryGroup) => void;
  selectedGroup: SkillCategoryGroup | null;
}

interface GridBlockProps {
  group: SkillCategoryGroup;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const GridBlock: React.FC<GridBlockProps> = ({
  group,
  index,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const currentLift = useRef(isSelected ? 0.35 : 0);

  // 3 columns x 2 rows
  const col = index % 3; // 0, 1, 2
  const row = Math.floor(index / 3); // 0, 1

  // Center spacing
  const posX = (col - 1) * 2.15;
  const posZ = (row - 0.5) * 1.85;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetLift = isSelected ? 0.38 : 0;
    currentLift.current = THREE.MathUtils.damp(currentLift.current, targetLift, 10, delta);
    meshRef.current.position.y = currentLift.current;
  });

  // Selected block turns orange #FF5A1F; otherwise uses group accent
  const blockColor = isSelected ? '#FF5A1F' : group.accent;
  const textColor = isSelected ? '#0A0A0A' : '#FFFFFF';

  return (
    <group
      ref={meshRef}
      position={[posX, 0, posZ]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Slab Mesh */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.32, 1.4]} />
        <meshToonMaterial color={blockColor} />
        <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
      </mesh>

      {/* Top Face Always-Visible Label */}
      <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 1.3]} />
        <meshBasicMaterial color={isSelected ? '#FF5A1F' : group.accent} />
      </mesh>

      <Text
        position={[0, 0.17, -0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.17}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ ()0123456789"
      >
        {group.category.toUpperCase()}
      </Text>

      <Text
        position={[0, 0.17, 0.22]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        color={isSelected ? '#0A0A0A' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ ()0123456789"
      >
        {`(${group.skills.length} ITEMS)`}
      </Text>

      {/* Front Edge Label */}
      <mesh position={[0, 0, 0.705]}>
        <planeGeometry args={[1.7, 0.24]} />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      <Text
        position={[0, 0, 0.71]}
        fontSize={0.11}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ ()0123456789"
      >
        {`${group.category.toUpperCase()} • ${group.skills.length}`}
      </Text>
    </group>
  );
};

export const SkillsIsometricStack: React.FC<SkillsIsometricStackProps> = ({
  onSelectGroup,
  selectedGroup,
}) => {
  return (
    <group position={[0, -0.1, 0]} rotation={[0.05, -0.1, 0]}>
      {skillsData.map((group, idx) => (
        <GridBlock
          key={group.id}
          group={group}
          index={idx}
          isSelected={selectedGroup?.id === group.id}
          onSelect={() => onSelectGroup(group)}
        />
      ))}
    </group>
  );
};

export default SkillsIsometricStack;
