import { useMemo, useState, useRef, useEffect, useCallback} from 'react';
import * as THREE from 'three';
import { Grid, OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import Model from './Model';
import DraggableModel, { type DragOffsets } from './DraggableModel';
import { RotationGesture, RotationGroup } from './RotationControls';
import data from '../../data/database.json' with { type: 'json' }; 

export interface ModelData {
  nome: string;
  link: string;
  thumb: string;
  descricao?: string;
  customdata?: Array<Record<string, unknown>>;
  dimensions?: {
    altura: string;
    largura?: string;
    profundidade?: string;
  };
}

interface ExperienceProps {
  onObjectSelect: (data: ModelData | null) => void;
  currentObjects?: ModelData[];
  cameraLock?: boolean;
  syncedCameraRef?: React.RefObject<OrbitControlsImpl | null> | null;
  isMaster?: boolean;
  resetToken?: number;
  onViewChange?: (changed: boolean) => void;
  onHoverChange?: (hovered: boolean) => void;
  selectedLink?: string | null;
  dragOffsets?: React.RefObject<DragOffsets>;
}

function useRadialGradientBackground(color1: string, color2: string) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    const bgTexture = new THREE.CanvasTexture(canvas);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    return bgTexture;
  }, [color1, color2]);

  return texture;
}

export function Experience({ 
  onObjectSelect, 
  currentObjects = [], 
  cameraLock = false,
  syncedCameraRef,
  isMaster = false,
  resetToken = 0,
  onViewChange,
  onHoverChange,
  selectedLink = null,
  dragOffsets
}: ExperienceProps) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prevObjectCount = useRef(0);
  const rotationTarget = useRef<[number, number, number]>([0, 0, 0]);
  const hasRotated = useRef(false);
  const isViewChanged = useRef(false);

  const handleHover = useCallback((mesh: THREE.Object3D | null) => {
    setHoveredObject(mesh);
    onHoverChange?.(mesh !== null);
  }, [onHoverChange]);

  // Meshes of the model whose metadata is open, so its outline stays visible
  const [selectedMeshes, setSelectedMeshes] = useState<THREE.Object3D[]>([]);

  // Each wrapper renders its own Model instance, so changing mode rebuilds the meshes
  const modelTreeKey = cameraLock ? 'rotation' : syncedCameraRef ? 'synced' : 'drag';

  useEffect(() => {
    if (!selectedLink || !currentObjects.some(obj => obj.link === selectedLink)) {
      setSelectedMeshes(prev => (prev.length === 0 ? prev : []));
      return;
    }

    const meshes: THREE.Object3D[] = [];
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.userData.link === selectedLink) {
        meshes.push(child);
      }
    });
    setSelectedMeshes(meshes);
  }, [selectedLink, scene, currentObjects, modelTreeKey]);

  const outlinedObjects = useMemo(() => {
    if (!hoveredObject) return selectedMeshes;
    if (selectedMeshes.includes(hoveredObject)) return selectedMeshes;
    return [...selectedMeshes, hoveredObject];
  }, [selectedMeshes, hoveredObject]);

  const markViewChanged = useCallback(() => {
    if (isViewChanged.current) return;
    isViewChanged.current = true;
    onViewChange?.(true);
  }, [onViewChange]);

  // Cores para o fundo
  const bgColor = useRadialGradientBackground('#2b2b2b', '#1c1c1c');

  // Compute proportional X positions based on each object's scaled size
  const objectPositions = useMemo(() => {
    const sizes = currentObjects.map(obj => {
      if (obj.dimensions?.largura) {
        const w = parseFloat(obj.dimensions.largura) / 100;
        if (!isNaN(w) && w > 0) return w;
      }
      if (obj.dimensions?.altura) {
        const h = parseFloat(obj.dimensions.altura) / 100;
        if (!isNaN(h) && h > 0) return h;
      }
      return 1; // default for objects without dimensions
    });

    const positions: number[] = [];
    let currentX = 0;

    for (let i = 0; i < sizes.length; i++) {
      if (i === 0) {
        positions.push(0);
      } else {
        const gap = (sizes[i - 1] + sizes[i]) * 0.4;
        currentX += sizes[i - 1] / 2 + gap + sizes[i] / 2;
        positions.push(currentX);
      }
    }

    return positions;
  }, [currentObjects]);

  if (syncedCameraRef && controlsRef.current) {
      if (isMaster) {
        
        syncedCameraRef.current = controlsRef.current;
      }
    }

  useFrame(() => {
    if (syncedCameraRef?.current && !isMaster && controlsRef.current) {
      const masterControls = syncedCameraRef.current;
      
      
      camera.position.copy(masterControls.object.position);
      camera.quaternion.copy(masterControls.object.quaternion);
      controlsRef.current.target.copy(masterControls.target);
      controlsRef.current.update();
    }
  });

  // Função para focar na câmera
  const focusOnObject = (modelData: ModelData, position: THREE.Vector3) => {
    onObjectSelect(modelData);

    // With the camera locked the framing is fixed, so only the metadata is shown
    if (!controlsRef.current || cameraLock) return;

    // Focusing moves the camera, so the view can be reset afterwards
    markViewChanged();

    gsap.killTweensOf([controlsRef.current.target, camera.position]);


    controlsRef.current.enabled = false;

    gsap.to(controlsRef.current.target, {
      duration: 0.4,
      ease: 'power1.in',
      x: position.x,
      y: position.y,
      z: position.z,
      onUpdate: () => controlsRef.current?.update(),
    });
    
    let distance = 1.5;
    if (modelData.dimensions?.altura) {
      const heightM = parseFloat(modelData.dimensions.altura) / 100;
      if (!isNaN(heightM) && heightM > 0) {
        distance = heightM + 0.08;
      }
    }
    gsap.to(camera.position, {
      duration: 0.8,
      ease: 'power2.inOut',
      x: position.x,
      y: position.y + distance * 0.5,
      z: position.z + distance,
      onUpdate: () => controlsRef.current?.update(),
      onComplete: () => {
        // Re-enable controls after animation completes
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    });
  };

  
  const clearSelection = () => {
    onObjectSelect(null);
    
    
    if (controlsRef.current) {
      gsap.killTweensOf([controlsRef.current.target, camera.position]);
      // controlsRef.current.enabled = true;
    }
  };

  
  const handleModelClick = (modelLink: string, targetPosition: THREE.Vector3) => {
    if (isDragging || hasRotated.current) return;
    
    const modelData = data.find(item => item.link === modelLink);
    if (modelData) {
      focusOnObject(modelData, targetPosition);
    }
  };
  

  
  // Auto-focus camera on the first object when it is added
  useEffect(() => {
    if (prevObjectCount.current === 0 && currentObjects.length > 0 && controlsRef.current) {
      const firstObject = currentObjects[0];
      const x = objectPositions[0] ?? 0;
      let distance = 1.5;
      if (firstObject.dimensions?.altura) {
        const h = parseFloat(firstObject.dimensions.altura) / 100;
        if (!isNaN(h) && h > 0) distance = h + 0.08;
      }
      camera.position.set(x, distance * 0.5, distance);
      controlsRef.current.target.set(x, 0, 0);
      controlsRef.current.update();
    }
    prevObjectCount.current = currentObjects.length;
  }, [currentObjects.length]);

  const handleBackgroundClick = () => {
    if (hasRotated.current) return;
    clearSelection();
  };

  const fitCameraToObjects = useCallback(() => {
    if (!controlsRef.current) return;

    const maxHeight = currentObjects.reduce((max, obj) => {
      if (obj.dimensions?.altura) {
        const h = parseFloat(obj.dimensions.altura) / 100;
        if (!isNaN(h) && h > max) return h;
      }
      return max;
    }, 0);

    const perspCam = camera as THREE.PerspectiveCamera;
    const vFov = perspCam.fov * (Math.PI / 180);
    const aspect = perspCam.aspect || 1;

    const totalWidth = objectPositions.length > 1
      ? objectPositions[objectPositions.length - 1] - objectPositions[0]
      : 0;

    const effectiveHeight = maxHeight > 0 ? maxHeight : 1;
    // Distance needed to fit the tallest model vertically (with padding)
    const distForHeight = (effectiveHeight * 2.2) / (2 * Math.tan(vFov / 2));
    // Distance needed to fit all objects horizontally (with padding)
    const distForWidth = totalWidth > 0
      ? (totalWidth * 2.2) / (2 * Math.tan(vFov / 2) * aspect)
      : 0;

    const baseZ = Math.max(distForHeight, distForWidth);
    const yOffset = effectiveHeight * 0.5;
    const centerX = objectPositions.length > 0
      ? (objectPositions[0] + objectPositions[objectPositions.length - 1]) / 2
      : 0;

    camera.position.set(centerX, yOffset, baseZ);
    controlsRef.current.target.set(centerX, 0, 0);
    controlsRef.current.update();
  }, [camera, currentObjects, objectPositions]);

  useEffect(() => {
    if (!cameraLock) return;
    fitCameraToObjects();
  }, [cameraLock, fitCameraToObjects]);

  const handleCameraStart = useCallback(() => {
    markViewChanged();
  }, [markViewChanged]);

  const resetView = useRef<() => void>(undefined);
  resetView.current = () => {
    rotationTarget.current = [0, 0, 0];
    isViewChanged.current = false;
    onViewChange?.(false);

    if (controlsRef.current) {
      gsap.killTweensOf([controlsRef.current.target, camera.position]);
      controlsRef.current.enabled = true;
    }
    fitCameraToObjects();
  };

  useEffect(() => {
    resetView.current?.();
  }, [resetToken]);

  return (
    <>
      <primitive object={bgColor} attach="background" />
      
      {/* Luzes */}
      <ambientLight intensity={5} />
      <directionalLight position={[5, 10, 7.5]} intensity={2} />

      {/* Controles*/}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        enabled={isMaster || !syncedCameraRef}
        enableRotate={!cameraLock}
        zoomToCursor={!syncedCameraRef}
        onStart={handleCameraStart}
        dampingFactor={0.25}
        makeDefault

      />

      {/* Background para capturar cliques */}
      <mesh onClick={handleBackgroundClick} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {(!cameraLock && !syncedCameraRef) && (
        <Grid infiniteGrid cellColor="gray" sectionColor="#2b2b2b" cellSize={1} sectionSize={2} fadeDistance={70} fadeStrength={0.5} />
      )}

      {cameraLock && <RotationGesture target={rotationTarget} onRotate={markViewChanged} movedRef={hasRotated} />}


      {/* Renderiza todos os modelos do arquivo de dados */}
      {currentObjects.map((modelInfo, index) => (
        <group key={modelInfo.link} position={[objectPositions[index] ?? 0, 0, 0]} >
          {cameraLock ? (
            <RotationGroup target={rotationTarget}>
              <Model
                modelLink={modelInfo.link}
                positionMode='center'
                onHover={handleHover}
                onClick={handleModelClick}
                dimensions={modelInfo.dimensions}
              />
            </RotationGroup>
          ) : syncedCameraRef ? (
            <Model
              modelLink={modelInfo.link}
              positionMode='base'
              onHover={handleHover}
              onClick={handleModelClick}
              dimensions={modelInfo.dimensions}
            />
          ) : 
          (
            <DraggableModel
              modelInfo={modelInfo}
              offsets={dragOffsets}
              resetToken={resetToken}
              onHover={handleHover}
              onClick={handleModelClick}
              onDragStart={() => {
                setIsDragging(true);
                markViewChanged();
              }}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 0)}
            />
          )
          }
        </group>
      ))}
      
      {/* Efeitos de Pós-processamento */}
      <EffectComposer autoClear={false}>
        <Outline
          selection={outlinedObjects}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          edgeStrength={2}
        />
      </EffectComposer>
    </>
  );
}