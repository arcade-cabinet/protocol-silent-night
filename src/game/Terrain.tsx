/**
 * Terrain System
 * Procedural Tron-grid terrain using Strata's SDF and noise functions
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise3D, fbm } from '@jbcom/strata';
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

  // Generate instance matrices using Strata's noise functions
  const { matrices, count } = useMemo(() => {
    const size = CONFIG.WORLD_SIZE;
    const instanceCount = size * size;
    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let x = -size / 2; x < size / 2; x++) {
      for (let z = -size / 2; z < size / 2; z++) {
        // Use Strata's noise3D and fbm for procedural height
        const baseNoise = noise3D(x * 0.1, 0, z * 0.1) * 2;
        const detailNoise = fbm(x * 0.05, 0, z * 0.05, 3) * 1.5;
        
        // Combine for final height
        const h = baseNoise + detailNoise - 3;

        dummy.position.set(x * 1.8, h, z * 1.8);

        // Random "glitch" pillars using Strata noise for variation
        const glitchChance = noise3D(x * 0.5, z * 0.5, 0);
        if (glitchChance > 0.95) {
          dummy.position.y += 3 + glitchChance * 3;
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
