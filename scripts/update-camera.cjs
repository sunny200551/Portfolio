const fs = require('fs');

let code = fs.readFileSync('src/components/three/GitHubSkyline.tsx', 'utf8');

const oldAutoFit = `/**
 * Declarative component to auto-fit orthographic camera zoom based on container width.
 */
function AutoFitCamera() {
  const size = useThree((state) => state.size);
  const zoom = Math.min(50, Math.max(16, size.width / 24));
  return <OrthographicCamera makeDefault position={[-5, 8, 10]} zoom={zoom} />;
}`.replace(/\n/g, '\r\n');

const newAutoFit = `/**
 * Declarative component to auto-fit orthographic camera zoom based on container width.
 * True isometric (front-left, elevated) looking at the center of the skyline.
 */
function AutoFitCamera() {
  const { size, camera } = useThree();
  const zoom = Math.min(38, Math.max(16, size.width / 28));

  useEffect(() => {
    camera.position.set(-10, 11, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return <OrthographicCamera makeDefault position={[-10, 11, 10]} zoom={zoom} />;
}`.replace(/\n/g, '\r\n');

if (!code.includes(oldAutoFit)) {
  console.error('oldAutoFit not found!');
  process.exit(1);
}

code = code.replace(oldAutoFit, newAutoFit);
fs.writeFileSync('src/components/three/GitHubSkyline.tsx', code, 'utf8');
console.log('Successfully updated AutoFitCamera in GitHubSkyline.tsx');

