/**
 * Enemy System
 * Handles spawning, AI, and rendering of enemies
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';

let enemyIdCounter = 0;

export function Enemies() {
  const groupRef = useRef<THREE.Group>(null);
  const spawnTimerRef = useRef(0);

  const {
    state,
    enemies,
    updateEnemies,
    playerPosition,
    damagePlayer,
    bossActive,
    bossHp,
    bossMaxHp,
  } = useGameStore();

  // Spawn minion - using getState() to avoid recreating callback on enemies.length change
  const spawnMinion = useCallback(() => {
    const { state: currentState, enemies: currentEnemies, addEnemy } = useGameStore.getState();
    if (currentState === 'GAME_OVER' || currentState === 'WIN' || currentEnemies.length >= CONFIG.MAX_MINIONS) return;

    const id = `minion-${enemyIdCounter++}`;
    const angle = Math.random() * Math.PI * 2;
    const radius = 25 + Math.random() * 10;

    // Create a proper THREE.Object3D for position tracking
    const mesh = new THREE.Object3D();
    mesh.position.set(
      Math.cos(angle) * radius,
      1,
      Math.sin(angle) * radius
    );

    addEnemy({
      id,
      mesh,
      velocity: new THREE.Vector3(),
      hp: 30,
      maxHp: 30,
      isActive: true,
      type: 'minion',
      speed: 4 + Math.random() * 2,
      damage: 1,
      pointValue: 10,
    });
  }, []);

  // Spawn initial enemies with cleanup
  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    
    if (state === 'PHASE_1') {
      for (let i = 0; i < 5; i++) {
        const id = setTimeout(() => spawnMinion(), i * 200);
        timeoutIds.push(id);
      }
    }
    
    return () => {
      // Clear pending timeouts on cleanup
      for (const id of timeoutIds) {
        clearTimeout(id);
      }
    };
  }, [state, spawnMinion]);

  // Boss spawning is handled by the store

  useFrame((_, delta) => {
    if (state !== 'PHASE_1' && state !== 'PHASE_BOSS') return;

    // Spawn timer (only in PHASE_1)
    if (state === 'PHASE_1') {
      spawnTimerRef.current += delta * 1000;
      if (spawnTimerRef.current >= CONFIG.SPAWN_INTERVAL) {
        spawnTimerRef.current = 0;
        spawnMinion();
      }
    }

    // Update enemy positions
    updateEnemies((currentEnemies) => {
      return currentEnemies.map((enemy) => {
        const pos = enemy.mesh.position;

        // Calculate direction to player
        const toPlayer = playerPosition.clone().sub(pos);
        const distance = toPlayer.length();
        const direction = toPlayer.clone().normalize();

        // Move toward player (use cloned direction to avoid mutation issues)
        const moveSpeed = enemy.type === 'boss' ? 3 : enemy.speed;
        pos.add(direction.clone().multiplyScalar(moveSpeed * delta));

        // Collision with player
        if (distance < 1.5) {
          damagePlayer(enemy.damage);

          // Knockback enemy (use original normalized direction)
          const knockback = direction.clone().multiplyScalar(-3);
          pos.add(knockback);
        }

        return enemy;
      });
    });
  });

  return (
    <group ref={groupRef}>
      {/* Render Minions */}
      {enemies
        .filter((e) => e.type === 'minion')
        .map((enemy) => {
          const pos = enemy.mesh.position;
          return (
            <MinionMesh
              key={enemy.id}
              position={[pos.x, pos.y, pos.z]}
              hp={enemy.hp}
              maxHp={enemy.maxHp}
            />
          );
        })}

      {/* Render Boss */}
      {bossActive && <BossRenderer enemies={enemies} bossHp={bossHp} bossMaxHp={bossMaxHp} />}
    </group>
  );
}

// Boss renderer component - extracted from IIFE for clarity
function BossRenderer({
  enemies,
  bossHp,
  bossMaxHp,
}: {
  enemies: { type: string; mesh: THREE.Object3D }[];
  bossHp: number;
  bossMaxHp: number;
}) {
  const bossEnemy = enemies.find((e) => e.type === 'boss');
  const bossPos = bossEnemy?.mesh.position ?? null;

  return (
    <BossMesh
      position={[bossPos?.x ?? 0, 4, bossPos?.z ?? 0]}
      hp={bossHp}
      maxHp={bossMaxHp}
    />
  );
}

// Minion (Grinch-Bot) mesh component
function MinionMesh({
  position,
  hp,
  maxHp,
}: {
  position: [number, number, number];
  hp: number;
  maxHp: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Flash effect when damaged
  const intensity = hp < maxHp ? 1.5 : 0.8;

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate to face movement direction
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <coneGeometry args={[0.6, 1.5, 4]} />
        <meshStandardMaterial
          color={0x222222}
          emissive={CONFIG.COLORS.ENEMY_MINION}
          emissiveIntensity={intensity}
          flatShading
        />
      </mesh>
      {/* Evil eyes */}
      <mesh position={[0.15, 0.3, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh position={[-0.15, 0.3, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <pointLight color={CONFIG.COLORS.ENEMY_MINION} intensity={0.5} distance={3} />
    </group>
  );
}

// Boss (Krampus-Prime) mesh component
function BossMesh({
  position,
  hp,
  maxHp,
}: {
  position: [number, number, number];
  hp: number;
  maxHp: number;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const intensity = 2 + (1 - hp / maxHp) * 2; // Gets more intense as damaged

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.5;
      coreRef.current.rotation.y = time * 0.3;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = time * 1.2;
      ringRef.current.rotation.y = time * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Core */}
      <mesh ref={coreRef} castShadow>
        <dodecahedronGeometry args={[2]} />
        <meshStandardMaterial
          color={0x220000}
          emissive={CONFIG.COLORS.ENEMY_BOSS}
          emissiveIntensity={intensity}
        />
      </mesh>

      {/* Rotating Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[3, 0.2, 8, 32]} />
        <meshBasicMaterial color={CONFIG.COLORS.ENEMY_BOSS} />
      </mesh>

      {/* Second Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 8, 32]} />
        <meshBasicMaterial color={CONFIG.COLORS.ENEMY_BOSS} transparent opacity={0.5} />
      </mesh>

      {/* Inner Glow */}
      <pointLight color={CONFIG.COLORS.ENEMY_BOSS} intensity={3} distance={15} />

      {/* Particle effect aura */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshBasicMaterial
          color={CONFIG.COLORS.ENEMY_BOSS}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
