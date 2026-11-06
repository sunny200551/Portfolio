import React from 'react';
import type { RobotProps } from './types';
import { RobotModel } from './RobotModel';

export const Robot: React.FC<RobotProps> = ({
  variant = 'bolt',
  expression = 'happy',
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  headTrackCursor = true,
  onClick,
  accessories,
}) => {
  return (
    <RobotModel
      variant={variant}
      expression={expression}
      animation={animation}
      position={position}
      rotation={rotation}
      scale={scale}
      headTrackCursor={headTrackCursor}
      onClick={onClick}
      accessories={accessories}
    />
  );
};

export default Robot;
