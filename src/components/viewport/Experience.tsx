import { useMemo, useState, useRef} from 'react';
import * as THREE from 'three';
import { OrbitControls, PresentationControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import Model from './Model';
import data from '../../data/database.json' with { type: 'json' }; 

export interface ModelData {
  nome: string;
  link: string;
  thumb: string;
  descricao?: string;
  customdata?: Array<Record<string, unknown>>;
}

interface ExperienceProps {
  onObjectSelect: (data: ModelData | null) => void;
  currentObjects?: ModelData[];
  cameraLock?: boolean;
  syncedCameraRef?: React.RefObject<OrbitControlsImpl | null> | null;
  isMaster?: boolean;
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
  isMaster = false 
}: ExperienceProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(null);

  // Cores para o fundo
  const bgColor = useRadialGradientBackground('#2b2b2b', '#1c1c1c');

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
    if (!controlsRef.current) return;
    if (cameraLock) return;

    
    gsap.killTweensOf([controlsRef.current.target, camera.position]);

    
    onObjectSelect(modelData);
    console.log('Focando no objeto:', modelData.nome);

   
    controlsRef.current.enabled = false;

    gsap.to(controlsRef.current.target, {
      duration: 0.4,
      ease: 'power1.in',
      x: position.x,
      y: position.y,
      z: position.z,
      onUpdate: () => controlsRef.current?.update(),
    });
    
    const distance = 1.5; // Ajuste a distância do foco
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
    const modelData = data.find(item => item.link === modelLink);
    if (modelData) {
      focusOnObject(modelData, targetPosition);
    }
  };

  
  const handleBackgroundClick = () => {
    clearSelection();
  };

  

  if (cameraLock) {
    if (controlsRef.current) {
      camera.position.set(((currentObjects.length - 1) * 1.5) / 2, 0.5, 0.75 * currentObjects.length);
      camera.lookAt(((currentObjects.length - 1) * 1.5) / 2, 0, 0);
    }
  }

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
        enabled={!cameraLock && (isMaster || !syncedCameraRef)} 
        dampingFactor={0.25} 
        makeDefault 
      />

      {/* Background para capturar cliques */}
      <mesh onClick={handleBackgroundClick} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Renderiza todos os modelos do arquivo de dados */}
      {currentObjects.map((modelInfo, index) => (
        <group key={modelInfo.link} position={[index * 1.5, 0, 0]}>
          <PresentationControls 
            cursor={false}
            enabled={cameraLock}
            polar={[-Infinity, Infinity]}
            snap={true}
            speed={1.5}
            global={true}
          >
            <Model
              modelLink={modelInfo.link}
              position={[0, 0, 0]} // Reset to origin since group handles positioning
              onHover={setHoveredObject}
              onClick={handleModelClick}
            />
          </PresentationControls>
        </group>
      ))}
      
      {/* Efeitos de Pós-processamento */}
      <EffectComposer autoClear={false}>
        <Outline
          selection={hoveredObject ? [hoveredObject] : []}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          edgeStrength={2}
        />
      </EffectComposer>
    </>
  );
}