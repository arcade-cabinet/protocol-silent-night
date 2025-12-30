/**
 * Terrain System
 * Christmas-themed procedural terrain with collision-enabled obstacles
 * Data-driven configuration for terrain and obstacles
 */

import { fbm, noise3D } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OBSTACLE_TYPES, TERRAIN_CONFIG } from '@/data';
import { terrainFragmentShader, terrainVertexShader } from '@/shaders/terrain';
import { useGameStore } from '@/store/gameStore';
import type { ChristmasObstacle } from '@/types';

export function Terrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const setObstacles = useGameStore((state) => state.setObstacles);
  const playerPosition = useGameStore((state) => state.playerPosition);

  // Create geometry and material
  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        TERRAIN_CONFIG.cubeSize,
        TERRAIN_CONFIG.cubeHeight,
        TERRAIN_CONFIG.cubeSize
      ),
    []
  );

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
    const size = TERRAIN_CONFIG.gridSize;
    const instanceCount = size * size;
    const matrices: THREE.Matrix4[] = [];
    const obstacleList: ChristmasObstacle[] = [];
    const dummy = new THREE.Object3D();

    for (let x = -size / 2; x < size / 2; x++) {
      for (let z = -size / 2; z < size / 2; z++) {
        // Reset scale and position for each instance
        dummy.scale.set(1, 1, 1);

        // Use Strata's noise3D and fbm for procedural height
        const baseNoise =
          noise3D(x * TERRAIN_CONFIG.noiseScale, 0, z * TERRAIN_CONFIG.noiseScale) *
          TERRAIN_CONFIG.heightMultiplier;
        const detailNoise =
          fbm(x * TERRAIN_CONFIG.detailNoiseScale, 0, z * TERRAIN_CONFIG.detailNoiseScale, 3) *
          TERRAIN_CONFIG.detailHeightMultiplier;

        // Combine for final height
        const h = baseNoise + detailNoise + TERRAIN_CONFIG.baseElevation;

        dummy.position.set(x * TERRAIN_CONFIG.cubeSize, h, z * TERRAIN_CONFIG.cubeSize);

        // Determine Christmas object type using Strata noise
        const objectTypeNoise = noise3D(x * 0.3, z * 0.3, 42);
        const isObstacle = noise3D(x * 0.5, z * 0.5, 0);

        if (isObstacle > TERRAIN_CONFIG.obstacleThreshold) {
          let config = OBSTACLE_TYPES.pillar; // Default

          if (objectTypeNoise > 0.7) {
            config =
              objectTypeNoise > 0.85 ? OBSTACLE_TYPES.present_red : OBSTACLE_TYPES.present_green;
          } else if (objectTypeNoise > 0.4) {
            config = OBSTACLE_TYPES.tree;
          } else if (objectTypeNoise > 0) {
            config = OBSTACLE_TYPES.candy_cane;
          }

          const hRange = config.heightRange;
          const obstacleHeight = hRange[0] + Math.random() * (hRange[1] - hRange[0]);

          dummy.position.y = h + (config.yOffset || obstacleHeight / 2);

          // Store obstacle for collision detection
          obstacleList.push({
            position: dummy.position.clone(),
            type: config.type,
            radius: config.radius,
            height: obstacleHeight,
            color: new THREE.Color(config.color),
          });

          // Apply scale
          dummy.scale.set(config.scale[0], obstacleHeight / 4, config.scale[2]);
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
    if (meshRef.current && typeof meshRef.current.setMatrixAt === 'function') {
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
      {/* Limit rendering to nearby obstacles for performance optimization */}
      {obstacles
        .filter((obstacle) => {
          // Only render obstacles within visible range (~150 units from player)
          const dx = obstacle.position.x - playerPosition.x;
          const dz = obstacle.position.z - playerPosition.z;
          const distSq = dx * dx + dz * dz;
          return distSq < 150 * 150; // Use squared distance for performance
        })
        .map((obstacle) => (
          <ChristmasObstacleMesh
            key={`${obstacle.position.x}-${obstacle.position.z}`}
            obstacle={obstacle}
          />
        ))}

      {/* Grid Floor Helper - darker for cyberpunk vibe */}
      <gridHelper args={[200, 100, 0x001111, 0x000505]} position={[0, -2, 0]} />
    </>
  );
}

// Individual Christmas obstacle component for visual variety
function ChristmasObstacleMesh({ obstacle }: { obstacle: ChristmasObstacle }) {
  const posArray: [number, number, number] = useMemo(
    () => [obstacle.position.x, obstacle.position.y, obstacle.position.z],
    [obstacle.position]
  );

  // Different renderers for each type
  if (obstacle.type === 'tree') {
    return <CyberpunkTree position={posArray} height={obstacle.height} />;
  }

  if (obstacle.type === 'present') {
    return <CyberpunkPresent position={posArray} height={obstacle.height} color={obstacle.color} />;
  }

  if (obstacle.type === 'candy_cane') {
    return <CyberpunkCandyCane position={posArray} height={obstacle.height} />;
  }

  if (obstacle.type === 'pillar') {
    return <CyberpunkPillar position={posArray} height={obstacle.height} />;
  }

  // Default fallback with its own animation
  return <FallbackObstacle position={posArray} height={obstacle.height} color={obstacle.color} />;
}

function FallbackObstacle({
  position,
  height,
  color,
}: {
  position: [number, number, number];
  height: number;
  color: THREE.Color;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const uniquePhase = position[0] * 0.1 + position[2] * 0.1;

    if (meshRef.current) {
      const pulse = Math.sin(time * 2 + uniquePhase) * 0.15 + 0.85;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}

// Cyberpunk Christmas Tree - Holographic with neon decorations
function CyberpunkTree({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle sway
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main tree cone - dark with neon edges */}
      <mesh castShadow>
        <coneGeometry args={[1.2, height, 8]} />
        <meshStandardMaterial
          color={0x001100}
          emissive={0x00ff44}
          emissiveIntensity={0.15}
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* Holographic rings */}
      {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
        <mesh
          key={`ring-${y}`}
          position={[0, height * y - height / 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1.1 - y * 0.8, 0.02, 8, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? 0x00ffcc : 0xff0066} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Star on top */}
      <mesh position={[0, height / 2 + 0.3, 0]}>
        <octahedronGeometry args={[0.2]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>

      {/* Ornament lights */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const y = 0.3 + i * 0.25;
        const r = 0.8 - i * 0.2;
        return (
          <mesh
            key={`ornament-${i}`}
            position={[Math.cos(angle) * r, y * height - height / 2, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={[0xff0044, 0x00ffcc, 0xffd700][i]} />
          </mesh>
        );
      })}
    </group>
  );
}

// Cyberpunk Present - Glowing gift box with circuit patterns
function CyberpunkPresent({
  position,
  height,
  color,
}: {
  position: [number, number, number];
  height: number;
  color: THREE.Color;
}) {
  const boxRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (boxRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + position[0] + position[2]) * 0.1 + 0.9;
      boxRef.current.scale.setScalar(pulse);
    }
  });

  const colorHex = color.getHex();

  return (
    <group position={position}>
      {/* Main box */}
      <mesh ref={boxRef} castShadow>
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial
          color={colorHex}
          emissive={colorHex}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Ribbon cross - vertical */}
      <mesh position={[0, 0, 0.76]}>
        <boxGeometry args={[0.2, height + 0.1, 0.02]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>
      <mesh position={[0, 0, -0.76]}>
        <boxGeometry args={[0.2, height + 0.1, 0.02]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>

      {/* Ribbon cross - horizontal */}
      <mesh position={[0.76, 0, 0]}>
        <boxGeometry args={[0.02, height + 0.1, 0.2]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>
      <mesh position={[-0.76, 0, 0]}>
        <boxGeometry args={[0.02, height + 0.1, 0.2]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>

      {/* Bow on top */}
      <mesh position={[0, height / 2 + 0.2, 0]}>
        <torusGeometry args={[0.15, 0.05, 8, 16]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>
    </group>
  );
}

// Cyberpunk Candy Cane - Neon striped pole
function CyberpunkCandyCane({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  return (
    <group position={position}>
      {/* Main pole */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, height, 8]} />
        <meshStandardMaterial
          color={0x110011}
          emissive={0xff0066}
          emissiveIntensity={0.2}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Neon stripes */}
      {Array.from({ length: Math.floor(height / 0.5) }, (_, i) => {
        const yPos = -height / 2 + 0.25 + i * 0.5;
        return (
          <mesh key={`stripe-${yPos}`} position={[0, yPos, 0]}>
            <torusGeometry args={[0.16, 0.03, 8, 16]} />
            <meshBasicMaterial color={i % 2 === 0 ? 0xff0066 : 0xffffff} />
          </mesh>
        );
      })}

      {/* Top hook (simplified) */}
      <mesh position={[0.15, height / 2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.15, 0.05, 8, 8, Math.PI]} />
        <meshBasicMaterial color={0xff0066} />
      </mesh>
    </group>
  );
}

// Cyberpunk Pillar - Tech monolith with scanlines
function CyberpunkPillar({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position}>
      {/* Main pillar */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.8, height, 6]} />
        <meshStandardMaterial
          color={0x001111}
          emissive={0x00ffcc}
          emissiveIntensity={0.15}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Data rings */}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <mesh
          key={`data-${y}`}
          position={[0, height * y - height / 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.7 + i * 0.05, 0.02, 8, 16]} />
          <meshBasicMaterial color={0x00ffcc} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Top cap with light */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 6]} />
        <meshStandardMaterial color={0x002222} emissive={0x00ffcc} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
