/**
 * Terrain System - Simple Procedural Geometry
 * No external assets - everything renders immediately
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OBSTACLE_TYPES } from '@/data';
import { useGameStore } from '@/store/gameStore';
import type { ChristmasObjectType, ChristmasObstacle } from '@/types';

const PLAY_AREA = { width: 80, depth: 80 };

// ============================================================================
// MAIN TERRAIN
// ============================================================================

export function Terrain() {
  const setObstacles = useGameStore((state) => state.setObstacles);
  const obstacleData = useMemo(() => generateObstacles(), []);

  useEffect(() => {
    const obstacles: ChristmasObstacle[] = obstacleData.map((d) => ({
      position: new THREE.Vector3(d.x, 0, d.z),
      type: d.type as ChristmasObjectType,
      radius: d.radius,
      height: d.height,
      color: new THREE.Color(d.color),
    }));
    setObstacles(obstacles);
  }, [obstacleData, setObstacles]);

  return (
    <>
      <Background />
      <Ground />
      {obstacleData.map((obs, i) => (
        <Obstacle key={i} {...obs} />
      ))}
      <Boundaries />
    </>
  );
}

// ============================================================================
// BACKGROUND
// ============================================================================

function Background() {
  const groupRef = useRef<THREE.Group>(null);
  const playerX = useGameStore((s) => s.playerPosition.x);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.x = -playerX * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Moon */}
      <mesh position={[25, 30, -70]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#ffffdd" />
      </mesh>

      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <mesh key={i} position={[(i - 20) * 4, 15 + (i % 5) * 4, -65]}>
          <circleGeometry args={[0.15, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Mountains */}
      {[-50, -20, 10, 40].map((x, i) => (
        <mesh key={i} position={[x, 0, -55]} rotation={[0, 0, 0]}>
          <coneGeometry args={[12 + i * 2, 18 + i * 3, 4]} />
          <meshBasicMaterial color={`hsl(200, 30%, ${8 + i * 2}%)`} />
        </mesh>
      ))}

      {/* Far trees */}
      {[-45, -25, -5, 15, 35, 55].map((x, i) => (
        <group key={i} position={[x, 0, -45]}>
          <mesh position={[0, 5, 0]}>
            <coneGeometry args={[2.5, 10, 8]} />
            <meshBasicMaterial color="#0a2030" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 1]} />
            <meshBasicMaterial color="#1a1008" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// GROUND
// ============================================================================

function Ground() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0a1520" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[100, 50, 0x002233, 0x001122]} position={[0, -0.45, 0]} />

      {/* Boundary ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[38, 40, 64]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ============================================================================
// OBSTACLES
// ============================================================================

interface ObstacleProps {
  x: number;
  z: number;
  type: string;
  color: string;
  height: number;
  radius: number;
  rotation: number;
}

function Obstacle({ x, z, type, color, height, rotation }: ObstacleProps) {
  switch (type) {
    case 'tree':
      return (
        <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, height / 2, 0]} castShadow>
            <coneGeometry args={[1.5, height, 8]} />
            <meshStandardMaterial color="#0f4f2f" emissive="#001f0f" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 1]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
        </group>
      );

    case 'present':
      return (
        <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.2, 1.5, 1.2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[0.3, 0.1, 1.4]} />
            <meshStandardMaterial color="#ffdd00" />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[1.4, 0.1, 0.3]} />
            <meshStandardMaterial color="#ffdd00" />
          </mesh>
        </group>
      );

    case 'candy_cane':
      return (
        <group position={[x, 0, z]} rotation={[0, rotation, 0.15]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 4]} />
            <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.3, 3.8, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );

    case 'snowman':
      return (
        <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[0, 1.9, 0]} castShadow>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[0, 2.7, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 0.4]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      );

    case 'rock':
      return (
        <mesh position={[x, 0.6, z]} rotation={[0.1, rotation, 0.1]} castShadow>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#3a3a3a" roughness={1} />
        </mesh>
      );

    default:
      return (
        <mesh position={[x, 1, z]} castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
}

// ============================================================================
// BOUNDARIES
// ============================================================================

function Boundaries() {
  const half = PLAY_AREA.width / 2 - 2;
  const corners = [
    [-half, half],
    [half, half],
    [-half, -half],
    [half, -half],
  ];

  return (
    <>
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.4, 6, 6]} />
            <meshStandardMaterial
              color="#001111"
              emissive="#00ffcc"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.05, 8, 16]} />
            <meshBasicMaterial color="#00ffcc" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ============================================================================
// OBSTACLE GENERATION
// ============================================================================

interface GeneratedObstacle {
  x: number;
  z: number;
  type: string;
  color: string;
  height: number;
  radius: number;
  rotation: number;
}

function generateObstacles(): GeneratedObstacle[] {
  const obstacles: GeneratedObstacle[] = [];
  const occupied: [number, number][] = [];

  const isValid = (x: number, z: number) => {
    if (Math.abs(x) < 12 && Math.abs(z) < 12) return false;
    for (const [ox, oz] of occupied) {
      if (Math.sqrt((x - ox) ** 2 + (z - oz) ** 2) < 8) return false;
    }
    return true;
  };

  const getPos = (): [number, number] | null => {
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      if (isValid(x, z)) return [x, z];
    }
    return null;
  };

  // Trees
  for (let i = 0; i < 12; i++) {
    const pos = getPos();
    if (!pos) continue;
    occupied.push(pos);
    obstacles.push({
      x: pos[0],
      z: pos[1],
      type: 'tree',
      color: String(OBSTACLE_TYPES.tree.color),
      height: 5 + Math.random() * 3,
      radius: OBSTACLE_TYPES.tree.radius,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  // Presents
  for (let i = 0; i < 10; i++) {
    const pos = getPos();
    if (!pos) continue;
    occupied.push(pos);
    const isGreen = Math.random() > 0.5;
    obstacles.push({
      x: pos[0],
      z: pos[1],
      type: 'present',
      color: isGreen ? '#22cc44' : '#cc2244',
      height: 1.5,
      radius: OBSTACLE_TYPES.present_red.radius,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  // Candy canes
  for (let i = 0; i < 8; i++) {
    const pos = getPos();
    if (!pos) continue;
    occupied.push(pos);
    obstacles.push({
      x: pos[0],
      z: pos[1],
      type: 'candy_cane',
      color: String(OBSTACLE_TYPES.candy_cane.color),
      height: 4,
      radius: OBSTACLE_TYPES.candy_cane.radius,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  // Snowmen
  for (let i = 0; i < 3; i++) {
    const pos = getPos();
    if (!pos) continue;
    occupied.push(pos);
    obstacles.push({
      x: pos[0],
      z: pos[1],
      type: 'snowman',
      color: '#ffffff',
      height: 3,
      radius: 1.2,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  // Rocks
  for (let i = 0; i < 6; i++) {
    const pos = getPos();
    if (!pos) continue;
    occupied.push(pos);
    obstacles.push({
      x: pos[0],
      z: pos[1],
      type: 'rock',
      color: '#555555',
      height: 2,
      radius: 1.5,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  return obstacles;
}
