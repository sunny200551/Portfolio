import * as THREE from 'three';

/**
 * Shared 3-step toon gradient map for cel-shaded lighting.
 */
export function createToonGradientMap(): THREE.DataTexture {
  const colors = new Uint8Array([80, 160, 255]);
  const texture = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

