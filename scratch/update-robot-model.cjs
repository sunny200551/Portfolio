const fs = require('fs');

let code = fs.readFileSync('src/robot/RobotModel.tsx', 'utf8');

// 1. Add hipDetachViolation state near hasCollision
code = code.replace(
  'const [hasCollision, setHasCollision] = useState(false);',
  `const [hasCollision, setHasCollision] = useState(false);
  const [hipDetachViolation, setHipDetachViolation] = useState<number | null>(null);
  const [shadowJumpProps, setShadowJumpProps] = useState({ scale: 1.0, opacity: 0.88 });`
);

// 2. Add hip distance assertion and dynamic shadow calculation inside useFrame
const frameInsertionPoint = 'if (isDebug && bodyRef.current && torsoMeshRef.current && leftArmGroupRef.current && rightArmGroupRef.current) {';
const assertionAndShadowLogic = `// Compute dynamic ground shadow scaling and fading with jump elevation
    if (bodyRef.current) {
      const jumpElevation = Math.max(0, bodyRef.current.position.y - RIG.TORSO.Y);
      const s = Math.max(0.42, 1.0 - jumpElevation * 1.5);
      const op = Math.max(0.20, 0.88 - jumpElevation * 1.7);
      setShadowJumpProps(prev => (Math.abs(prev.scale - s) > 0.02 ? { scale: s, opacity: op } : prev));
    }

    // Part 4 Assertion: Check hip socket to leg joint distance <= 0.05 in ?robotDebug=1
    if (isDebug && bodyRef.current && leftLegRef.current && rightLegRef.current) {
      bodyRef.current.updateWorldMatrix(true, true);
      leftLegRef.current.updateWorldMatrix(true, true);
      rightLegRef.current.updateWorldMatrix(true, true);

      const leftHipSocketWorld = new THREE.Vector3(-RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0).applyMatrix4(bodyRef.current.matrixWorld);
      const leftLegPivotWorld = new THREE.Vector3(0, 0, 0).applyMatrix4(leftLegRef.current.matrixWorld);
      const leftDist = leftHipSocketWorld.distanceTo(leftLegPivotWorld);

      const rightHipSocketWorld = new THREE.Vector3(RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0).applyMatrix4(bodyRef.current.matrixWorld);
      const rightLegPivotWorld = new THREE.Vector3(0, 0, 0).applyMatrix4(rightLegRef.current.matrixWorld);
      const rightDist = rightHipSocketWorld.distanceTo(rightLegPivotWorld);

      const maxDist = Math.max(leftDist, rightDist);
      if (maxDist > 0.05) {
        console.error('[ROBOT ASSERTION VIOLATION] Hip detachment exceeded 0.05! dist=' + maxDist.toFixed(4));
        setHipDetachViolation(maxDist);
      }
    }

    if (isDebug && bodyRef.current && torsoMeshRef.current && leftArmGroupRef.current && rightArmGroupRef.current) {`;

code = code.replace(frameInsertionPoint, assertionAndShadowLogic);

// 3. Update RobotHardShadow to use shadowJumpProps
code = code.replace(
  '<RobotHardShadow width={0.52} depth={0.32} radius={0.06} offset={[0.04, -0.04]} opacity={0.88} />',
  '<RobotHardShadow width={0.52 * shadowJumpProps.scale} depth={0.32 * shadowJumpProps.scale} radius={0.06 * shadowJumpProps.scale} offset={[0.04, -0.04]} opacity={shadowJumpProps.opacity} />'
);

// 4. Move legs INSIDE bodyRef so legs and torso are in the exact same pelvis hierarchy!
// First extract the legs JSX
const legsStart = '{/* 1. LOWER BODY: HIPS & CLEARLY VISIBLE LEGS */}';
const legsEnd = '{/* 2. COMPACT ROUNDED-BOX TORSO */}';
const legsIdx = code.indexOf(legsStart);
const torsoIdx = code.indexOf(legsEnd);

if (legsIdx !== -1 && torsoIdx !== -1) {
  let legsJSX = code.substring(legsIdx, torsoIdx);
  // Update local Y positions of leftLegRef and rightLegRef from RIG.HIP.Y to RIG.HIP.Y - RIG.TORSO.Y (-0.14)
  legsJSX = legsJSX.replace('position={[-RIG.HIP.X, RIG.HIP.Y, 0]}', 'position={[-RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0]}');
  legsJSX = legsJSX.replace('position={[RIG.HIP.X, RIG.HIP.Y, 0]}', 'position={[RIG.HIP.X, RIG.HIP.Y - RIG.TORSO.Y, 0]}');

  // Remove legs from old location
  code = code.substring(0, legsIdx) + code.substring(torsoIdx);

  // Insert legs inside bodyRef right after <group ref={bodyRef} position={[0, RIG.TORSO.Y, 0]}>
  const bodyRefMarker = '<group ref={bodyRef} position={[0, RIG.TORSO.Y, 0]}>';
  const newBodyRef = bodyRefMarker + '\n' + legsJSX;
  code = code.replace(bodyRefMarker, newBodyRef);
}

// 5. Add red badge visualizer for hip detachment violation if triggered in debug mode
const debugVisualizerMarker = '{typeof window !== \'undefined\' && (window.location.search.includes(\'robotDebug=1\') || robotStore.getState().isDebug) && (';
const debugVisualizerReplacement = `{hipDetachViolation !== null && (
          <group position={[0, 0.95, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.16, 0.05]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          </group>
        )}
        ` + debugVisualizerMarker;

code = code.replace(debugVisualizerMarker, debugVisualizerReplacement);

fs.writeFileSync('src/robot/RobotModel.tsx', code, 'utf8');
console.log('Updated RobotModel.tsx with unified pelvis/leg hierarchy, assertion, and dynamic shadow!');

