/**
 * Strict Rig Dimensions & Joint Limits for BOLT, NUT, and CHIP.
 * Complies with FIX ROUND 3 Part 2.
 */
export const RIG = {
  // Total target height: ~0.95 units
  PELVIS_Y: 0.18,

  TORSO: {
    W: 0.36,
    H: 0.26,
    D: 0.24,
    Y: 0.31, // bottom at 0.18, top at 0.44
  },

  NECK: {
    RADIUS: 0.045,
    H: 0.045,
    Y: 0.465, // visible gap between torso top (0.44) and head bottom (0.49)
  },

  HEAD: {
    W: 0.44,
    H: 0.32,
    D: 0.30,
    Y: 0.65, // bottom at 0.49, top at 0.81
  },

  ANTENNA: {
    ROD_R: 0.012,
    ROD_H: 0.11,
    TIP_R: 0.038,
    Y: 0.81,
  },

  // Flush, outlined navy discs (no thick black disc artifact)
  EAR: {
    RADIUS: 0.048,
    THICKNESS: 0.012,
    X: 0.224, // flush against head half-width 0.22
  },

  // Shoulders sit OUTSIDE torso sides with visible connector
  SHOULDER: {
    X: 0.245, // torso half-width (0.18) + gap (0.065) > arm radius (0.030)
    Y: 0.38,
    CONNECTOR_R: 0.020,
    CONNECTOR_L: 0.055,
    BALL_R: 0.038,
  },

  UPPER_ARM: {
    R: 0.026,
    L: 0.10,
  },

  ELBOW: {
    BALL_R: 0.024,
  },

  FOREARM: {
    R: 0.023,
    L: 0.09,
  },

  HAND: {
    PALM_W: 0.072,
    PALM_H: 0.062,
    PALM_D: 0.052,
    THUMB_W: 0.026,
    THUMB_H: 0.030,
    THUMB_D: 0.028,
  },

  // Hips sit at bottom of torso; legs clearly visible
  HIP: {
    X: 0.105,
    Y: 0.18,
    BALL_R: 0.028,
  },

  LEG: {
    R: 0.032,
    L: 0.13, // clearly visible sturdy legs
  },

  FOOT: {
    W: 0.105,
    H: 0.042,
    D: 0.155,
    Y: 0.021, // ground level
  },

  // Joint angle limits (strictly prevents torso intersection)
  LIMITS: {
    ARM_REST_OUTWARD: 0.28, // ~16 degrees outward
    SHOULDER_PITCH_MIN: -1.3,
    SHOULDER_PITCH_MAX: 1.3,
    SHOULDER_ROLL_OUT_MIN: 0.18, // always at least 10 deg outward from torso
    SHOULDER_ROLL_OUT_MAX: 1.6,
    ELBOW_FLEX_MIN: 0.0,
    ELBOW_FLEX_MAX: 1.5,
    HIP_PITCH_MIN: -0.75,
    HIP_PITCH_MAX: 0.75,
    HEAD_YAW_MAX: 0.65, // ~37 degrees
    HEAD_PITCH_MAX: 0.35,
  },
} as const;

