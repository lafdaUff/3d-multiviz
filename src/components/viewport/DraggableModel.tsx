import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DragControls } from '@react-three/drei';
import Model from './Model';
import type { ModelData } from './Experience';

// Position each model was dragged to, keyed by model link
export type DragOffsets = Record<string, [number, number, number]>;

interface DraggableModelProps {
    modelInfo: ModelData;
    offsets?: React.RefObject<DragOffsets>;
    onHover: (mesh: THREE.Object3D | null) => void;
    onClick: (modelLink: string, targetPosition: THREE.Vector3) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    resetToken?: number;
}

export default function DraggableModel({
    modelInfo,
    offsets,
    onHover,
    onClick,
    onDragStart,
    onDragEnd,
    resetToken = 0
}: DraggableModelProps) {

    // Offset this instance was mounted with. DragControls restarts from identity on every
    // mount, so its matrix is always relative to this value and never to the stored one.
    const [mountOffset, setMountOffset] = useState<[number, number, number]>(
        () => offsets?.current[modelInfo.link] ?? [0, 0, 0]
    );
    // Owned by DragControls, which mutates it while dragging; a new instance moves the model back
    const [dragMatrix, setDragMatrix] = useState(() => new THREE.Matrix4());
    const dragPosition = useRef(new THREE.Vector3());

    const lastResetToken = useRef(resetToken);

    useEffect(() => {
        if (lastResetToken.current === resetToken) return;
        lastResetToken.current = resetToken;

        if (offsets) delete offsets.current[modelInfo.link];
        setMountOffset([0, 0, 0]);
        setDragMatrix(new THREE.Matrix4());
    }, [resetToken, offsets, modelInfo.link]);

    function handleDrag(localMatrix: THREE.Matrix4) {
        if (!offsets) return;

        dragPosition.current.setFromMatrixPosition(localMatrix);
        const [x, y, z] = mountOffset;
        offsets.current[modelInfo.link] = [
            x + dragPosition.current.x,
            y + dragPosition.current.y,
            z + dragPosition.current.z,
        ];
    }

    return (
        <group position={mountOffset}>
            <DragControls
                axisLock='y'
                autoTransform={true}
                matrix={dragMatrix}
                onDragStart={onDragStart}
                onDrag={handleDrag}
                onDragEnd={onDragEnd}
            >
                <Model
                    modelLink={modelInfo.link}
                    positionMode='base'
                    onHover={onHover}
                    onClick={onClick}
                    dimensions={modelInfo.dimensions}
                />
            </DragControls>
        </group>
    );
}
