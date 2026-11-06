const THREE = require('three');

const camera = new THREE.PerspectiveCamera(34, 1440 / 900, 0.1, 1000);
camera.position.set(0, 0, 7.5);
camera.updateMatrixWorld();

const group = new THREE.Group();
group.position.set(2.2, 0, -0.6);
group.rotation.set(0.08, -0.15, 0.02);
group.scale.set(0.58, 0.58, 0.58);

// Pane 1 (Blue)
const pane1 = new THREE.Group();
pane1.position.set(0.2, 0.2, 0.3);
pane1.rotation.set(-0.05, 0.12, -0.04);
group.add(pane1);

// Pane 3 (Navy)
const pane3 = new THREE.Group();
pane3.position.set(0.4, -0.9, 0.7);
pane3.rotation.set(-0.08, 0.15, -0.03);
group.add(pane3);

// Pane 4 (Orange)
const pane4 = new THREE.Group();
pane4.position.set(-0.9, -0.3, 0.9);
pane4.rotation.set(0.06, -0.12, 0.08);
group.add(pane4);

// Pane 5 (Plinth)
const pane5 = new THREE.Group();
pane5.position.set(0.2, -1.5, -0.8);
pane5.rotation.set(-1.2, 0, 0.2);
group.add(pane5);

group.updateMatrixWorld(true);

console.log('Testing points on plinth (X, Y in pane5 coordinates):');
for (let y = -1.2; y <= 1.2; y += 0.3) {
  for (let x = -1.6; x <= 1.6; x += 0.3) {
    const pt = new THREE.Vector3(x, y, 0.05);
    pane5.localToWorld(pt);
    
    // Project to screen
    const screenPt = pt.clone().project(camera);
    const sx = ((screenPt.x + 1) * 1440) / 2;
    const sy = ((-screenPt.y + 1) * 900) / 2;

    // Check if this point lies behind Pane 3
    const ptInPane3 = pt.clone();
    pane3.worldToLocal(ptInPane3);
    const inPane3 = Math.abs(ptInPane3.x) < 1.3 && Math.abs(ptInPane3.y) < 0.8 && ptInPane3.z < 0;

    // Check if this point lies behind Pane 4
    const ptInPane4 = pt.clone();
    pane4.worldToLocal(ptInPane4);
    const inPane4 = Math.abs(ptInPane4.x) < 0.9 && Math.abs(ptInPane4.y) < 0.35 && ptInPane4.z < 0;

    if (!inPane3 && !inPane4 && sx >= 800 && sx <= 1400 && sy >= 400 && sy <= 850) {
      console.log(`CLEAR: local x=${x.toFixed(2)}, y=${y.toFixed(2)} -> screen (${sx.toFixed(0)}, ${sy.toFixed(0)}), World: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})`);
    }
  }
}

