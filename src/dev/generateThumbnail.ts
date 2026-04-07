import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const THUMB_SIZE = 512;

export interface ModelDimensions {
  altura: string;
  largura: string;
  profundidade: string;
}

function applyTransforms(root: THREE.Object3D): void {
  root.updateMatrixWorld(true);
  root.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry = child.geometry.clone();
      child.geometry.applyMatrix4(child.matrixWorld);
    }
  });
  root.traverse(child => {
    child.position.set(0, 0, 0);
    child.rotation.set(0, 0, 0);
    child.scale.set(1, 1, 1);
    child.updateMatrix();
  });
  root.updateMatrixWorld(true);
}

export async function generateThumbnail(glbFile: File): Promise<{ blob: Blob; dimensions: ModelDimensions }> {
  const arrayBuffer = await glbFile.arrayBuffer();

  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
    loader.parse(arrayBuffer, '', resolve, reject);
  });

  applyTransforms(gltf.scene);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);
  scene.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, maxDim * 10);
  const distance = maxDim / (2 * Math.tan((Math.PI * 40) / 360));
  camera.position.set(
    center.x + distance * 0.8,
    center.y + distance * 0.5,
    center.z + distance * 0.8,
  );
  camera.lookAt(center);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(distance, distance * 1.5, distance);
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-distance, distance * 0.5, -distance * 0.5);
  scene.add(fillLight);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(THUMB_SIZE, THUMB_SIZE);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.render(scene, camera);

  const blob = await new Promise<Blob>((resolve, reject) => {
    renderer.domElement.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });

  renderer.dispose();
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material?.dispose();
    }
  });

  // Convert bounding box from model units (meters) to centimeters
  const dimensions: ModelDimensions = {
    altura: String(Math.round(size.y * 100 * 100) / 100),
    largura: String(Math.round(size.x * 100 * 100) / 100),
    profundidade: String(Math.round(size.z * 100 * 100) / 100),
  };

  return { blob, dimensions };
}

export async function extractDimensions(modelSlug: string): Promise<ModelDimensions> {
  const res = await fetch(`/modelos/${modelSlug}.glb`);
  if (!res.ok) throw new Error('Failed to fetch model');
  const arrayBuffer = await res.arrayBuffer();

  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
    loader.parse(arrayBuffer, '', resolve, reject);
  });

  applyTransforms(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());

  gltf.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material?.dispose();
    }
  });

  return {
    altura: String(Math.round(size.y * 100 * 100) / 100),
    largura: String(Math.round(size.x * 100 * 100) / 100),
    profundidade: String(Math.round(size.z * 100 * 100) / 100),
  };
}
