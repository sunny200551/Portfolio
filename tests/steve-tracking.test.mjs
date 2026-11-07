import assert from 'node:assert/strict';
import { computeSteveTracking, TRACKING_CONFIG } from '../src/robot/steveTracking.ts';

console.log('--- RUNNING STEVE HEAD & EYE TRACKING UNIT TESTS ---');

const HEAD_X = 200;
const HEAD_Y = 300;

// Test 1: Pointer ABOVE Steve (dy < 0) -> Looks UP
{
  const res = computeSteveTracking(HEAD_X, HEAD_Y - 200, HEAD_X, HEAD_Y);
  assert.equal(res.dx, 0);
  assert.equal(res.dy, -200);
  assert.ok(res.clampedRatioY < 0, 'Ratio Y must be negative when pointer is above');
  assert.ok(res.eyePitchDeg < 0, 'Eye pitch must be negative (tilted up)');
  assert.ok(res.headPitchDeg < 0, 'Head pitch must be negative (tilted up)');
  assert.ok(res.threeRotX < 0, 'Three.js rotation.x must be negative to tilt head UP');
  assert.ok(res.pupilOffsetY < 0, '2D pupil offset Y must be negative to shift UP');
  console.log('✔ Test 1: Pointer above Steve -> tilts UP (threeRotX < 0, pupilOffsetY < 0)');
}

// Test 2: Pointer BELOW Steve (dy > 0) -> Looks DOWN
{
  const res = computeSteveTracking(HEAD_X, HEAD_Y + 200, HEAD_X, HEAD_Y);
  assert.equal(res.dx, 0);
  assert.equal(res.dy, 200);
  assert.ok(res.clampedRatioY > 0, 'Ratio Y must be positive when pointer is below');
  assert.ok(res.eyePitchDeg > 0, 'Eye pitch must be positive (tilted down)');
  assert.ok(res.headPitchDeg > 0, 'Head pitch must be positive (tilted down)');
  assert.ok(res.threeRotX > 0, 'Three.js rotation.x must be positive to tilt head DOWN');
  assert.ok(res.pupilOffsetY > 0, '2D pupil offset Y must be positive to shift DOWN');
  console.log('✔ Test 2: Pointer below Steve -> tilts DOWN (threeRotX > 0, pupilOffsetY > 0)');
}

// Test 3: Pointer LEFT of Steve (dx < 0) -> Looks LEFT
{
  const res = computeSteveTracking(HEAD_X - 200, HEAD_Y, HEAD_X, HEAD_Y);
  assert.equal(res.dx, -200);
  assert.equal(res.dy, 0);
  assert.ok(res.clampedRatioX < 0, 'Ratio X must be negative when pointer is left');
  assert.ok(res.eyeYawDeg < 0, 'Eye yaw must be negative (turned left)');
  assert.ok(res.headYawDeg < 0, 'Head yaw must be negative (turned left)');
  assert.ok(res.threeRotY < 0, 'Three.js rotation.y must be negative to turn head LEFT');
  assert.ok(res.pupilOffsetX < 0, '2D pupil offset X must be negative to shift LEFT');
  console.log('✔ Test 3: Pointer left of Steve -> turns LEFT (threeRotY < 0, pupilOffsetX < 0)');
}

// Test 4: Pointer RIGHT of Steve (dx > 0) -> Looks RIGHT
{
  const res = computeSteveTracking(HEAD_X + 200, HEAD_Y, HEAD_X, HEAD_Y);
  assert.equal(res.dx, 200);
  assert.equal(res.dy, 0);
  assert.ok(res.clampedRatioX > 0, 'Ratio X must be positive when pointer is right');
  assert.ok(res.eyeYawDeg > 0, 'Eye yaw must be positive (turned right)');
  assert.ok(res.headYawDeg > 0, 'Head yaw must be positive (turned right)');
  assert.ok(res.threeRotY > 0, 'Three.js rotation.y must be positive to turn head RIGHT');
  assert.ok(res.pupilOffsetX > 0, '2D pupil offset X must be positive to shift RIGHT');
  console.log('✔ Test 4: Pointer right of Steve -> turns RIGHT (threeRotY > 0, pupilOffsetX > 0)');
}

// Test 5: Ratio of head follow factor: Head follows eyes at ~60%
{
  const res = computeSteveTracking(HEAD_X + 400, HEAD_Y + 400, HEAD_X, HEAD_Y);
  assert.equal(res.eyeYawDeg, 25);
  assert.equal(res.headYawDeg, 15);
  assert.equal(res.eyePitchDeg, 15);
  assert.equal(res.headPitchDeg, 9);
  assert.ok(Math.abs(res.headYawDeg / res.eyeYawDeg - 0.6) < 1e-6);
  assert.ok(Math.abs(res.headPitchDeg / res.eyePitchDeg - 0.6) < 1e-6);
  console.log('✔ Test 5: Eyes lead and head follows at exactly 60% of eye angle (25°/15° eyes -> 15°/9° head)');
}

// Test 6: Strict clamping on extreme distances
{
  const res = computeSteveTracking(HEAD_X + 2000, HEAD_Y - 2000, HEAD_X, HEAD_Y);
  assert.equal(res.clampedRatioX, 1);
  assert.equal(res.clampedRatioY, -1);
  assert.equal(res.eyeYawDeg, 25);
  assert.equal(res.eyePitchDeg, -15);
  assert.equal(res.headYawDeg, 15);
  assert.equal(res.headPitchDeg, -9);
  console.log('✔ Test 6: Extreme pointer coordinates strictly clamped to max angular bounds');
}

// Test 7: Inactive / Pointer Left Window -> Returns to Neutral
{
  const res = computeSteveTracking(HEAD_X + 300, HEAD_Y + 300, HEAD_X, HEAD_Y, false);
  assert.equal(res.eyeYawDeg, 0);
  assert.equal(res.eyePitchDeg, 0);
  assert.equal(res.headYawDeg, 0);
  assert.equal(res.headPitchDeg, 0);
  assert.equal(res.threeRotX, 0);
  assert.equal(res.threeRotY, 0);
  assert.equal(res.pupilOffsetX, 0);
  assert.equal(res.pupilOffsetY, 0);
  console.log('✔ Test 7: Inactive pointer cleanly returns to neutral (0, 0)');
}

console.log('\nALL 7 STEVE TRACKING TESTS PASSED! 🎉');
