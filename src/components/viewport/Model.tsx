
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';


interface ModelProps{
    modelLink: string
    positionMode: 'center' | 'base'
    onHover: (mesh: THREE.Object3D | null) => void
    onClick: (modelLink: string, targetPosition: THREE.Vector3) => void
    dimensions?: {
        altura: string
        largura?: string
        profundidade?: string
    }
}


export default function Model({modelLink, positionMode, onHover, onClick, dimensions} : ModelProps){
    const { scene } = useGLTF(`/modelos/${modelLink}.glb`)

    const { clonedScene, modelHeight } = useMemo(() => {
        const clone = scene.clone()
        clone.traverse(child => {
            if(child instanceof THREE.Mesh) {
                child.userData = {link: modelLink}
            }
        })

        const box = new THREE.Box3().setFromObject(clone)
        const height = box.max.y - box.min.y

        // Wrap in a group with origin at the bottom of the mesh
        const group = new THREE.Group()
        clone.position.y -= box.min.y  // shift clone so its bottom is at Y=0 in group space
        group.add(clone)

        return { clonedScene: group, modelHeight: height }
    }, [scene, modelLink])

    const resolvedDimensions = useMemo(() => {
        if (!dimensions?.altura) return null

        const altura = parseFloat(dimensions.altura)
        if (isNaN(altura) || altura <= 0) return null

        const largura = dimensions.largura ? parseFloat(dimensions.largura) : altura
        const profundidade = dimensions.profundidade ? parseFloat(dimensions.profundidade) : altura

        return {
            altura: isNaN(largura) || largura <= 0 ? altura : altura,
            largura: isNaN(largura) || largura <= 0 ? altura : largura,
            profundidade: isNaN(profundidade) || profundidade <= 0 ? altura : profundidade,
        }
    }, [dimensions])

    const scaleFactor = useMemo(() => {
        if (!resolvedDimensions) return 1

        const desiredHeight = resolvedDimensions.altura / 100 // cm to meters (1 unit = 1m)
        if (modelHeight <= 0) return 1

        return desiredHeight / modelHeight
    }, [modelHeight, resolvedDimensions])



    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation()
        const targetPosition = new THREE.Vector3()
        event.object.getWorldPosition(targetPosition)
        onClick(modelLink, targetPosition)
    }
    function handlePointerOver(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
        onHover(event.object)
    }

    function handlePointerOut(event: ThreeEvent<PointerEvent>){
        event.stopPropagation();
        document.body.style.cursor = 'default'
        onHover(null)
    }

     return (
        <primitive
            object={clonedScene}
            scale={[scaleFactor, scaleFactor, scaleFactor]}
            position={positionMode === 'base' ? [0, 0, 0] : [0, -(modelHeight / 2) * scaleFactor, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        />
    )

}