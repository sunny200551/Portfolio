const THREE = require('three');

const RIG = {
  TORSO: { W: 0.36, H: 0.26, D: 0.24, Y: 0.31 },
  NECK: { RADIUS: 0.045, H: 0.045, Y: 0.465 },
  HEAD: { W: 0.44, H: 0.32, D: 0.30, Y: 0.65 },
  SHOULDER: { X: 0.245, Y: 0.38, BALL_R: 0.038 },
  UPPER_ARM: { R: 0.026, L: 0.10 },
  ELBOW: { BALL_R: 0.024 },
  FOREARM: { R: 0.023, L: 0.09 },
  HAND: { PALM_W: 0.072, PALM_H: 0.062, PALM_D: 0.052, THUMB_W: 0.026, THUMB_H: 0.030, THUMB_D: 0.028 },
  HIP: { X: 0.105, Y: 0.18, BALL_R: 0.028 },
  LEG: { R: 0.032, L: 0.13 },
  FOOT: { W: 0.105, H: 0.042, D: 0.155, Y: 0.021 }
};

// Build hierarchy in three
const root = new THREE.Group();
const body = new THREE.Group();
body.position.set(0, RIG.TORSO.Y, 0);
root.add(body);

const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(RIG.TORSO.W, RIG.TORSO.H, RIG.TORSO.D));
body.add(torsoMesh);

const head = new THREE.Group();
head.position.set(0, RIG.HEAD.Y - RIG.TORSO.Y, 0);
body.add(head);
const headMesh = new THREE.Mesh(new THREE.BoxGeometry(RIG.HEAD.W, RIG.HEAD.H, RIG.HEAD.D));
head.add(headMesh);

function createArm(isLeft) {
  const arm = new THREE.Group();
  const side = isLeft ? -1 : 1;
  arm.position.set(side * RIG.SHOULDER.X, RIG.SHOULDER.Y - RIG.TORSO.Y, 0);

  const upper = new THREE.Mesh(new THREE.CylinderGeometry(RIG.UPPER_ARM.R, RIG.UPPER_ARM.R, RIG.UPPER_ARM.L));
  upper.position.set(0, -RIG.UPPER_ARM.L / 2, 0);
  arm.add(upper);

  const forearm = new THREE.Mesh(new THREE.CylinderGeometry(RIG.FOREARM.R, RIG.FOREARM.R, RIG.FOREARM.L));
  forearm.position.set(0, -RIG.UPPER_ARM.L - RIG.FOREARM.L / 2, 0);
  arm.add(forearm);

  const palm = new THREE.Mesh(new THREE.BoxGeometry(RIG.HAND.PALM_W, RIG.HAND.PALM_H, RIG.HAND.PALM_D));
  palm.position.set(0, -RIG.UPPER_ARM.L - RIG.FOREARM.L - RIG.HAND.PALM_H / 2, 0);
  arm.add(palm);

  return arm;
}

const leftArm = createArm(true);
body.add(leftArm);

const rightArm = createArm(false);
body.add(rightArm);

// Test poses
const animations = [
  'idle', 'wave', 'walk', 'run', 'jump', 'dance', 'spin', 'facepalm', 'shrug', 'salute', 'cheer', 'sleep', 'dizzy', 'flex'
];

console.log('Testing all animations for collision...');
animations.forEach(anim => {
  // Let us check what rotations occur in useRobotAnimation for this anim
  // For each anim, let's test across 20 time samples in its loop
  for (let step = 0; step < 20; step++) {
    const t = step * 0.2;
    // We can simulate rotations
    root.updateMatrixWorld(true);

    const torsoBox = new THREE.Box3().setFromObject(torsoMesh);
    torsoBox.min.x += 0.025;
    torsoBox.max.x -= 0.025;
    torsoBox.min.y += 0.025;
    torsoBox.max.y -= 0.025;

    const leftBox = new THREE.Box3().setFromObject(leftArm);
    const rightBox = new THREE.Box3().setFromObject(rightArm);

    if (leftBox.intersectsBox(torsoBox)) {
      console.log(`COLLISION left arm in ${anim} at t=${t.toFixed(1)}`);
    }
    if (rightBox.intersectsBox(torsoBox)) {
      console.log(`COLLISION right arm in ${anim} at t=${t.toFixed(1)}`);
    }
  }
});
console.log('Done test.');

