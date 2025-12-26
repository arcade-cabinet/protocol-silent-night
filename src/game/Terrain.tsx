/**
 * Terrain System
 * Christmas-themed procedural terrain with collision-enabled obstacles
 */

import { fbm, noise3D } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { terrainFragmentShader, terrainVertexShader } from '@/shaders/terrain';
import { useGameStore } from '@/store/gameStore';
import { CONFIG, type ChristmasObstacle, type ChristmasObjectType } from '@/types';

export function Terrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const setObstacles = useGameStore((state) => state.setObstacles);

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

  // Generate Christmas-themed obstacles using Strata's noise functions
  const { matrices, count, obstacles } = useMemo(() => {
    const size = CONFIG.WORLD_SIZE;
    const instanceCount = size * size;
    const matrices: THREE.Matrix4[] = [];
    const obstacleList: ChristmasObstacle[] = [];
    const dummy = new THREE.Object3D();

    for (let x = -size / 2; x < size / 2; x++) {
      for (let z = -size / 2; z < size / 2; z++) {
        // Reset scale and position for each instance
        dummy.scale.set(1, 1, 1);
        
        // Use Strata's noise3D and fbm for procedural height
        const baseNoise = noise3D(x * 0.1, 0, z * 0.1) * 2;
        const detailNoise = fbm(x * 0.05, 0, z * 0.05, 3) * 1.5;

        // Combine for final height
        const h = baseNoise + detailNoise - 3;

        dummy.position.set(x * 1.8, h, z * 1.8);

        // Determine Christmas object type using Strata noise
        const objectTypeNoise = noise3D(x * 0.3, z * 0.3, 42);
        const isObstacle = noise3D(x * 0.5, z * 0.5, 0);

        if (isObstacle > 0.92) {
          let obstacleType: ChristmasObjectType;
          let obstacleColor: THREE.Color;
          let obstacleHeight: number;
          let obstacleRadius = 0.9; // collision radius

          // Create festive obstacles
          if (objectTypeNoise > 0.7) {
            obstacleType = 'present';
            obstacleColor = objectTypeNoise > 0.85
              ? new THREE.Color(0xff0044) // Red present
              : new THREE.Color(0x00ff88); // Green present
            obstacleHeight = 2 + objectTypeNoise * 2;
            dummy.position.y = h + 1;
          } else if (objectTypeNoise > 0.4) {
            obstacleType = 'tree';
            obstacleColor = new THREE.Color(0x00aa44); // Green Christmas tree
            obstacleHeight = 4 + objectTypeNoise * 4;
            obstacleRadius = 1.2;
            dummy.position.y = h + 2;
          } else if (objectTypeNoise > 0) {
            obstacleType = 'candy_cane';
            obstacleColor = new THREE.Color(0xff4477); // Pink/Red candy cane
            obstacleHeight = 3 + objectTypeNoise * 2;
            dummy.position.y = h + 1.5;
          } else {
            obstacleType = 'pillar';
            obstacleColor = new THREE.Color(0x00ffcc); // Cyan cyberpunk pillar
            obstacleHeight = 5 + isObstacle * 5;
            dummy.position.y = h + obstacleHeight / 2;
          }

          // Store obstacle for collision detection
          obstacleList.push({
            position: dummy.position.clone(),
            type: obstacleType,
            radius: obstacleRadius,
            height: obstacleHeight,
            color: obstacleColor,
          });

          // Scale based on object type
          if (obstacleType === 'tree') {
            dummy.scale.set(1, obstacleHeight / 4, 1);
          } else if (obstacleType === 'candy_cane') {
            dummy.scale.set(0.5, obstacleHeight / 4, 0.5);
          } else if (obstacleType === 'present') {
            dummy.scale.set(1.2, obstacleHeight / 4, 1.2);
          } else {
            dummy.scale.set(1, obstacleHeight / 4, 1);
          }
        }

        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }

    return { matrices, count: instanceCount, obstacles: obstacleList };
  }, []);

  // Sync obstacles to store and apply matrices to instanced mesh
  useEffect(() => {
    setObstacles(obstacles);
  }, [obstacles, setObstacles]);

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < matrices.length; i++) {
        meshRef.current.setMatrixAt(i, matrices[i]);
      }
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
      {/* Main terrain - instanced boxes with Christmas shader */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        receiveShadow
        castShadow
        frustumCulled={false}
      />

      {/* Christmas-themed obstacles (rendered as individual meshes for better visual variety) */}
      {obstacles.map((obstacle) => (
        <ChristmasObstacleMesh key={`${obstacle.position.x}-${obstacle.position.z}`} obstacle={obstacle} />
      ))}

      {/* Grid Floor Helper - darker for cyberpunk vibe */}
      <gridHelper args={[200, 100, 0x001111, 0x000505]} position={[0, -2, 0]} />
    </>
  );
}

// Individual Christmas obstacle component for visual variety
function ChristmasObstacleMesh({ obstacle }: { obstacle: ChristmasObstacle }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animated glow effect
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 0.3;
    }
  });

  const geometry = useMemo(() => {
    switch (obstacle.type) {
      case 'tree':
        // Cone shape for Christmas tree
        return new THREE.ConeGeometry(obstacle.radius, obstacle.height, 8);
      case 'candy_cane':
        // Cylinder for candy cane
        return new THREE.CylinderGeometry(0.2, 0.2, obstacle.height, 8);
      case 'present':
        // Cube for present
        return new THREE.BoxGeometry(1.5, obstacle.height, 1.5);
      case 'pillar':
        // Tall pillar
        return new THREE.CylinderGeometry(0.8, 0.8, obstacle.height, 6);
      default:
        return new THREE.BoxGeometry(1, obstacle.height, 1);
    }
  }, [obstacle.type, obstacle.height, obstacle.radius]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: obstacle.color,
      emissive: obstacle.color,
      emissiveIntensity: 0.2,
      metalness: obstacle.type === 'pillar' ? 0.8 : 0.3,
      roughness: obstacle.type === 'present' ? 0.4 : 0.6,
    });
  }, [obstacle.color, obstacle.type]);

  return (
    <mesh
      ref={meshRef}
      position={obstacle.position}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}
