import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

export type RotationTarget = React.RefObject<[number, number, number]>;

const SPEED = 1.5;
const LAMBDA = 8;

interface RotationProps {
  target: RotationTarget;
}

export function RotationGesture({ target, onRotate }: RotationProps & { onRotate?: () => void }) {
  const gl = useThree(state => state.gl);
  const size = useThree(state => state.size);

  const sizeRef = useRef(size);
  sizeRef.current = size;

  const onRotateRef = useRef(onRotate);
  onRotateRef.current = onRotate;

  useEffect(() => {
    const el = gl.domElement;
    const prevTouchAction = el.style.touchAction;
    el.style.touchAction = 'none';

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const handleMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (dx === 0 && dy === 0) return;
      lastX = event.clientX;
      lastY = event.clientY;

      const { width, height } = sizeRef.current;
      target.current = [
        target.current[0] + (dy / height) * Math.PI * SPEED,
        target.current[1] + (dx / width) * Math.PI * SPEED,
        0,
      ];

      onRotateRef.current?.();
    };

    const handleUp = () => {
      dragging = false;
    };

    el.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      el.style.touchAction = prevTouchAction;
      el.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [gl, target]);

  return null;
}

export function RotationGroup({ target, children }: RotationProps & { children?: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    groupRef.current?.rotation.set(...target.current);
  }, [target]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, target.current[0], LAMBDA, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, target.current[1], LAMBDA, delta);
  });

  return <group ref={groupRef}>{children}</group>;
}
