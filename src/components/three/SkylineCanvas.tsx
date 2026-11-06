import React from 'react';
import { Canvas } from '@react-three/fiber';
import { GitHubSkyline, type DayHoverInfo, type ContributionWeek } from './GitHubSkyline';

interface SkylineCanvasProps {
  calendarWeeks: ContributionWeek[];
  isSkylineInView: boolean;
  isTabVisible: boolean;
  onHoverDay: (info: DayHoverInfo | null) => void;
}

export const SkylineCanvas: React.FC<SkylineCanvasProps> = ({
  calendarWeeks,
  isSkylineInView,
  isTabVisible,
  onHoverDay,
}) => {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ position: [-5, 8, 10], zoom: 32 }}
      gl={{ alpha: true, antialias: true }}
      frameloop={isSkylineInView && isTabVisible ? 'always' : 'never'}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />
      <directionalLight position={[-8, -2, -6]} intensity={0.5} />

      <GitHubSkyline weeks={calendarWeeks} onHoverDay={onHoverDay} />
    </Canvas>
  );
};

export default SkylineCanvas;
