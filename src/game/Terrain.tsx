/**
 * Terrain System
 * Procedural Tron-grid terrain using instanced meshes
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '@/types';
import { terrainVertexShader, terrainFragmentShader } from '@/shaders/terrain';

export function Terrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create geometry and material
  const geometry = useMemo(() => new THREE.BoxGeometry(1.8, 4, 1.8), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        uniforms: {
          time: { value: 0 },
        },
      }),
    []
  );

  // Generate instance matrices
  const { matrices, count } = useMemo(() => {
    const size = CONFIG.WORLD_SIZE;
    const instanceCount = size * size;
    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let x = -size / 2; x < size / 2; x++) {
      for (let z = -size / 2; z < size / 2; z++) {
        // Procedural height using noise-like function
        const h =
          Math.sin(x * 0.15) * Math.cos(z * 0.15) * 2 +
          Math.cos(x * 0.3 + z * 0.1) +
          Math.sin(x * 0.05) * Math.cos(z * 0.08) * 3;

        dummy.position.set(x * 1.8, h - 3, z * 1.8);

        // Random "glitch" pillars
        if (Math.random() > 0.995) {
          dummy.position.y += 3 + Math.random() * 2;
        }

        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }

    return { matrices, count: instanceCount };
  }, []);

  // Apply matrices to instanced mesh
  useMemo(() => {
    if (meshRef.current) {
      matrices.forEach((matrix, i) => {
        meshRef.current!.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [matrices]);

  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        receiveShadow
        frustumCulled={false}
      />

      {/* Grid Floor Helper */}
      <gridHelper args={[200, 100, 0x111111, 0x050505]} position={[0, -2, 0]} />
    </>
  );
}
