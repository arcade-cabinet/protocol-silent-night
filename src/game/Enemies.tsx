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
  // Track if initial spawn has occurred for current phase
  const hasSpawnedInitialRef = useRef(false);
  
  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    
    // Only spawn initial enemies once when entering PHASE_1
    if (state === 'PHASE_1' && !hasSpawnedInitialRef.current) {
      hasSpawnedInitialRef.current = true;
      
      for (let i = 0; i < 5; i++) {
        const id = setTimeout(() => spawnMinion(), i * 200);
        timeoutIds.push(id);
      }
    }
    
    // Reset flag when leaving PHASE_1
    if (state !== 'PHASE_1') {
      hasSpawnedInitialRef.current = false;
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

    // Update enemy positions (immutable updates)
    updateEnemies((currentEnemies) => {
      return currentEnemies.map((enemy) => {
        const currentPos = enemy.mesh.position;

        // Calculate direction to player
        const toPlayer = playerPosition.clone().sub(currentPos);
        const distance = toPlayer.length();
        const direction = toPlayer.clone().normalize();

        // Calculate new position (immutable - clone first)
        const newPos = currentPos.clone();
        const moveSpeed = enemy.type === 'boss' ? 3 : enemy.speed;
        newPos.add(direction.clone().multiplyScalar(moveSpeed * delta));

        // Collision with player - apply knockback
        if (distance < 1.5) {
          damagePlayer(enemy.damage);
          const knockback = direction.clone().multiplyScalar(-3);
          newPos.add(knockback);
        }

        // Create new mesh with updated position (immutable update)
        const newMesh = new THREE.Object3D();
        newMesh.position.copy(newPos);

        return { ...enemy, mesh: newMesh };
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
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Flash effect when damaged
  const hpRatio = hp / maxHp;
  const intensity = hp < maxHp ? 2 : 1;
  const isHurt = hp < maxHp * 0.5;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Rotate to face movement direction
      groupRef.current.rotation.y = time * 2;
    }

    if (bodyRef.current) {
      // Bobbing movement
      bodyRef.current.position.y = Math.sin(time * 6) * 0.1;
      // Lean forward when moving
      bodyRef.current.rotation.x = 0.2;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Body */}
      <group ref={bodyRef}>
        {/* Main body - wedge/pyramid shape */}
        <mesh castShadow>
          <coneGeometry args={[0.5, 1.2, 6]} />
          <meshStandardMaterial
            color={0x112211}
            emissive={CONFIG.COLORS.ENEMY_MINION}
            emissiveIntensity={intensity}
            flatShading
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial
            color={0x224422}
            emissive={CONFIG.COLORS.ENEMY_MINION}
            emissiveIntensity={intensity * 0.7}
            flatShading
          />
        </mesh>
        
        {/* Evil eyes */}
        <mesh position={[0.12, 0.95, 0.25]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={isHurt ? 0xffff00 : 0xff0000} />
        </mesh>
        <mesh position={[-0.12, 0.95, 0.25]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={isHurt ? 0xffff00 : 0xff0000} />
        </mesh>
        
        {/* Antenna/spike */}
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.08, 0.4, 4]} />
          <meshStandardMaterial
            color={0x003300}
            emissive={CONFIG.COLORS.ENEMY_MINION}
            emissiveIntensity={intensity * 0.5}
          />
        </mesh>
      </group>
      
      {/* Glow */}
      <pointLight
        color={CONFIG.COLORS.ENEMY_MINION}
        intensity={0.5 + (1 - hpRatio) * 0.5}
        distance={3}
      />
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
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const hpRatio = hp / maxHp;
  const intensity = 2 + (1 - hpRatio) * 3; // Gets more intense as damaged
  const pulseSpeed = 1 + (1 - hpRatio) * 2; // Faster pulse when low HP

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.5;
      coreRef.current.rotation.y = time * 0.3;
      // Pulsing scale
      const pulse = 1 + Math.sin(time * pulseSpeed * 2) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 1.2;
      ring1Ref.current.rotation.y = time * 0.8;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.9;
      ring2Ref.current.rotation.z = time * 1.1;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = time * 1.5;
      ring3Ref.current.rotation.z = -time * 0.7;
    }

    if (auraRef.current) {
      // Pulsing aura
      const auraPulse = 0.08 + Math.sin(time * pulseSpeed) * 0.04;
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = auraPulse;
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
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Primary Rotating Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3, 0.2, 8, 32]} />
        <meshStandardMaterial
          color={CONFIG.COLORS.ENEMY_BOSS}
          emissive={CONFIG.COLORS.ENEMY_BOSS}
          emissiveIntensity={intensity * 0.5}
        />
      </mesh>

      {/* Secondary Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 8, 32]} />
        <meshStandardMaterial
          color={CONFIG.COLORS.ENEMY_BOSS}
          emissive={CONFIG.COLORS.ENEMY_BOSS}
          emissiveIntensity={intensity * 0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Tertiary Ring */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.5, 0.1, 8, 32]} />
        <meshStandardMaterial
          color={0xffffff}
          emissive={CONFIG.COLORS.ENEMY_BOSS}
          emissiveIntensity={intensity * 0.2}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Inner Core Glow */}
      <pointLight color={CONFIG.COLORS.ENEMY_BOSS} intensity={intensity * 1.5} distance={20} />

      {/* Particle effect aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial
          color={CONFIG.COLORS.ENEMY_BOSS}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Danger indicator particles */}
      {hpRatio < 0.5 && (
        <mesh>
          <sphereGeometry args={[4.5, 8, 8]} />
          <meshBasicMaterial
            color={0xffaa00}
            transparent
            opacity={0.05}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}
