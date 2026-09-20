import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

export async function loadGLB(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, gltf => resolve(gltf.scene), undefined, reject);
  });
}

export async function loadJSON(url, fallback = null) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn(`JSON load failed: ${url}`, error);
    return fallback;
  }
}
