export type RobotVariant = 'bolt';

export type RobotExpression = 
  | 'happy' 
  | 'enjoying'
  | 'thinking'
  | 'proud'
  | 'shy'
  | 'flirty'
  | 'grin' 
  | 'laughing' 
  | 'wink' 
  | 'curious' 
  | 'excited' 
  | 'mind-blown' 
  | 'smug' 
  | 'silly' 
  | 'dizzy' 
  | 'focused' 
  | 'sleepy';

export type RobotAnimation = 
  | 'idle' 
  | 'blink' 
  | 'wave' 
  | 'walk' 
  | 'run' 
  | 'jump' 
  | 'spin' 
  | 'facepalm' 
  | 'shrug' 
  | 'salute' 
  | 'cheer' 
  | 'sleep' 
  | 'dizzy' 
  | 'dance'
  | 'flex';

export interface RobotAccessories {
  skateboard?: boolean;
  figmaCursor?: boolean;
  ruler?: boolean;
  keyboard?: boolean;
  dashedBox?: boolean;
  flag?: boolean;
  gitPushBox?: boolean;
  dumbbell?: boolean;
  chestBadges?: boolean;
  stamp?: boolean;
  trophy?: boolean;
  confetti?: boolean;
  trainingWheels?: boolean;
  backpack?: boolean;
  jetpack?: boolean;
  hardHat?: boolean;
  hammer?: boolean;
  magnifyingGlass?: boolean;
  zzzBubble?: boolean;
  paperRocket?: boolean;
  steam?: boolean;
}

export interface RobotProps {
  variant?: RobotVariant;
  expression?: RobotExpression;
  animation?: RobotAnimation;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  headTrackCursor?: boolean;
  onClick?: () => void;
  isBlinking?: boolean;
  accessories?: RobotAccessories;
  facing?: 1 | -1;
}

export interface RobotVariantConfig {
  name: string;
  bodyColor: string;
  visorBgColor: string;
  limbColor: string;
  accentColor: string;
  pixelColor: string;
  scale: number;
}

export const VARIANT_CONFIGS: Record<RobotVariant, RobotVariantConfig> = {
  bolt: {
    name: 'BOLT',
    bodyColor: '#FF5A1F', // Orange
    visorBgColor: '#0047AB', // Royal Blue screen
    limbColor: '#0A1A3F', // Navy joints
    accentColor: '#FF5A1F', // Orange accents
    pixelColor: '#FFFFFF', // White face features
    scale: 1.0,
  },
};
