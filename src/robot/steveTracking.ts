/**
 * Steve Pointer Tracking Math
 *
 * Screen coordinates:
 * pointerX, pointerY: client coordinates where screen Y grows downwards.
 * headX, headY: screen center of Steve's head.
 *
 * dx = pointerX - headX
 * dy = pointerY - headY (screen Y grows downward)
 *
 * Requirements:
 * - Pointer above him means he looks up.
 * - Pointer below him means he looks down.
 * - Pointer left means he looks left.
 * - Pointer right means he looks right.
 *
 * Angle limits:
 * - Yaw: clamp(dx / 400) * 25 degrees (eyes lead)
 * - Pitch: clamp(dy / 400) * 15 degrees (eyes lead)
 * - Head follows at ~60% of eye angle (15° max yaw, 9° max pitch)
 *
 * Three.js rotation:
 * - rotation.x: positive tilts DOWN, negative tilts UP.
 *   When pointer is above (dy < 0), Steve looks UP => threeRotX < 0.
 *   When pointer is below (dy > 0), Steve looks DOWN => threeRotX > 0.
 * - rotation.y: positive turns RIGHT, negative turns LEFT.
 *   When pointer is right (dx > 0), Steve looks RIGHT => threeRotY > 0.
 *   When pointer is left (dx < 0), Steve looks LEFT => threeRotY < 0.
 *
 * 2D Canvas / SVG Pupil offset:
 * - When pointer is above (dy < 0), pupils shift UP => pupilOffsetY < 0.
 * - When pointer is below (dy > 0), pupils shift DOWN => pupilOffsetY > 0.
 * - When pointer is left (dx < 0), pupils shift LEFT => pupilOffsetX < 0.
 * - When pointer is right (dx > 0), pupils shift RIGHT => pupilOffsetX > 0.
 */

export const TRACKING_CONFIG = {
  MAX_RANGE_PX: 400,
  EYE_YAW_MAX_DEG: 25,
  EYE_PITCH_MAX_DEG: 15,
  HEAD_FOLLOW_FACTOR: 0.6, // 60%
  MAX_PUPIL_OFFSET_X: 5,   // Pixels
  MAX_PUPIL_OFFSET_Y: 4,   // Pixels
  LERP_SPEED: 0.12,
};

export interface SteveTrackingResult {
  dx: number;
  dy: number;
  clampedRatioX: number;
  clampedRatioY: number;
  // Eye angles (lead)
  eyeYawDeg: number;
  eyePitchDeg: number;
  eyeYawRad: number;
  eyePitchRad: number;
  // Head angles (follow at 60%)
  headYawDeg: number;
  headPitchDeg: number;
  headYawRad: number;
  headPitchRad: number;
  // Three.js rotation targets
  threeRotX: number;
  threeRotY: number;
  // 2D Canvas / SVG pupil shifts
  pupilOffsetX: number;
  pupilOffsetY: number;
}

export function computeSteveTracking(
  pointerX: number,
  pointerY: number,
  headX: number,
  headY: number,
  active = true
): SteveTrackingResult {
  if (!active) {
    return {
      dx: 0,
      dy: 0,
      clampedRatioX: 0,
      clampedRatioY: 0,
      eyeYawDeg: 0,
      eyePitchDeg: 0,
      eyeYawRad: 0,
      eyePitchRad: 0,
      headYawDeg: 0,
      headPitchDeg: 0,
      headYawRad: 0,
      headPitchRad: 0,
      threeRotX: 0,
      threeRotY: 0,
      pupilOffsetX: 0,
      pupilOffsetY: 0,
    };
  }

  const dx = pointerX - headX;
  const dy = pointerY - headY;

  // Normalized clamped ratios in range [-1, 1]
  const clampedRatioX = Math.max(-1, Math.min(1, dx / TRACKING_CONFIG.MAX_RANGE_PX));
  const clampedRatioY = Math.max(-1, Math.min(1, dy / TRACKING_CONFIG.MAX_RANGE_PX));

  const degToRad = Math.PI / 180;

  // Eyes lead
  const eyeYawDeg = clampedRatioX * TRACKING_CONFIG.EYE_YAW_MAX_DEG;
  const eyePitchDeg = clampedRatioY * TRACKING_CONFIG.EYE_PITCH_MAX_DEG;
  const eyeYawRad = eyeYawDeg * degToRad;
  const eyePitchRad = eyePitchDeg * degToRad;

  // Head follows at 60%
  const headYawDeg = eyeYawDeg * TRACKING_CONFIG.HEAD_FOLLOW_FACTOR;
  const headPitchDeg = eyePitchDeg * TRACKING_CONFIG.HEAD_FOLLOW_FACTOR;
  const headYawRad = headYawDeg * degToRad;
  const headPitchRad = headPitchDeg * degToRad;

  // In Three.js:
  // - rotation.x: positive tilts down, negative tilts up.
  //   dy < 0 (above) -> headPitchRad < 0 -> threeRotX < 0 (tilts UP)
  //   dy > 0 (below) -> headPitchRad > 0 -> threeRotX > 0 (tilts DOWN)
  const threeRotX = headPitchRad;

  // - rotation.y: positive turns right, negative turns left.
  //   dx > 0 (right) -> headYawRad > 0 -> threeRotY > 0 (turns RIGHT)
  //   dx < 0 (left)  -> headYawRad < 0 -> threeRotY < 0 (turns LEFT)
  const threeRotY = headYawRad;

  // In 2D screen/canvas coordinates: Y increases downwards.
  //   dy < 0 (above) -> pupilOffsetY < 0 (shifts UP)
  //   dy > 0 (below) -> pupilOffsetY > 0 (shifts DOWN)
  //   dx > 0 (right) -> pupilOffsetX > 0 (shifts RIGHT)
  //   dx < 0 (left)  -> pupilOffsetX < 0 (shifts LEFT)
  const pupilOffsetX = clampedRatioX * TRACKING_CONFIG.MAX_PUPIL_OFFSET_X;
  const pupilOffsetY = clampedRatioY * TRACKING_CONFIG.MAX_PUPIL_OFFSET_Y;

  return {
    dx,
    dy,
    clampedRatioX,
    clampedRatioY,
    eyeYawDeg,
    eyePitchDeg,
    eyeYawRad,
    eyePitchRad,
    headYawDeg,
    headPitchDeg,
    headYawRad,
    headPitchRad,
    threeRotX,
    threeRotY,
    pupilOffsetX,
    pupilOffsetY,
  };
}
