/**
 * Enemy System
 * Handles spawning, AI, and rendering of enemies
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';

let enemyIdCounter = 0;

export function Enemies() {
  const groupRef = useRef<THREE.Group>(null);
  const spawnTimerRef = useRef(0);
  const lastDamageTimeRef = useRef(0); // Damage cooldown

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
    if (
      currentState === 'GAME_OVER' ||
      currentState === 'WIN' ||
      currentEnemies.length >= CONFIG.MAX_MINIONS
    )
      return;

    const id = `minion-${enemyIdCounter++}`;
    const angle = Math.random() * Math.PI * 2;
    const radius = 25 + Math.random() * 10;

    // Create a proper THREE.Object3D for position tracking
    const mesh = new THREE.Object3D();
    mesh.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);

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

  const toPlayerRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const tempVecRef = useRef(new THREE.Vector3());

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

    // Update enemy positions - mutate positions directly for performance
    // We use a shared vector to avoid allocations
    const toPlayer = toPlayerRef.current;
    const direction = directionRef.current;
    const tempVec = tempVecRef.current;
    const now = Date.now();
    const damageCooldown = 500; // 500ms between damage ticks

    updateEnemies((currentEnemies) => {
      let shouldDamage = false;
      let damageAmount = 0;

      for (const enemy of currentEnemies) {
        const currentPos = enemy.mesh.position;

        // Calculate direction to player
        toPlayer.copy(playerPosition).sub(currentPos);
        const distance = toPlayer.length();
        direction.copy(toPlayer).normalize();

        // Move towards player
        const moveSpeed = enemy.type === 'boss' ? 3 : enemy.speed;
        tempVec.copy(direction).multiplyScalar(moveSpeed * delta);
        currentPos.add(tempVec);

        // Set rotation to face the player - smooth rotation
        const targetRotation = Math.atan2(direction.x, direction.z);
        const angleDiff =
          ((targetRotation - enemy.mesh.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
        enemy.mesh.rotation.y += angleDiff * delta * 8;

        // Collision with player - apply knockback and queue damage
        const hitRadius = enemy.type === 'boss' ? 3 : 1.5;
        if (distance < hitRadius) {
          // Only damage if cooldown has passed
          if (now - lastDamageTimeRef.current > damageCooldown) {
            shouldDamage = true;
            damageAmount = Math.max(damageAmount, enemy.damage);
          }
          // Knockback regardless
          tempVec.copy(direction).multiplyScalar(-2);
          currentPos.add(tempVec);
        }
      }

      // Apply damage after the loop to avoid issues
      if (shouldDamage) {
        lastDamageTimeRef.current = now;
        damagePlayer(damageAmount);
      }

      // Return same array - positions were mutated in place
      return currentEnemies;
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
              rotation={enemy.mesh.rotation.y}
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
  const bossRotation = bossEnemy?.mesh.rotation.y ?? 0;

  return (
    <BossMesh
      position={[bossPos?.x ?? 0, 4, bossPos?.z ?? 0]}
      rotation={bossRotation}
      hp={bossHp}
      maxHp={bossMaxHp}
    />
  );
}

// Minion (Grinch-Bot) mesh component - Detailed robotic enemy
function MinionMesh({
  position,
  rotation,
  hp,
  maxHp,
}: {
  position: [number, number, number];
  rotation: number;
  hp: number;
  maxHp: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const legsRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);

  // Flash effect when damaged
  const hpRatio = hp / maxHp;
  const damageIntensity = hp < maxHp ? 2.5 : 1;
  const isHurt = hp < maxHp * 0.5;
  const isCritical = hp < maxHp * 0.25;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const uniqueOffset = position[0] * 0.1 + position[2] * 0.1; // Unique per enemy

    if (groupRef.current) {
      // Apply the rotation from the parent
      groupRef.current.rotation.y = rotation;
      // Slight sway
      groupRef.current.rotation.z = Math.sin(time * 3 + uniqueOffset) * 0.05;
    }

    if (bodyRef.current) {
      // Bobbing movement - more mechanical
      bodyRef.current.position.y = Math.sin(time * 8 + uniqueOffset) * 0.08;
      // Lean forward when moving
      bodyRef.current.rotation.x = 0.15;
    }

    // Animate legs in walking motion
    if (legsRef.current) {
      legsRef.current.children.forEach((leg, i) => {
        const offset = i === 0 ? 0 : Math.PI;
        leg.rotation.x = Math.sin(time * 10 + offset + uniqueOffset) * 0.4;
      });
    }

    // Animate arms
    if (armsRef.current) {
      armsRef.current.children.forEach((arm, i) => {
        const offset = i === 0 ? Math.PI : 0;
        arm.rotation.x = Math.sin(time * 10 + offset + uniqueOffset) * 0.3;
      });
    }
  });

  // Dynamic colors based on health
  const bodyColor = isCritical ? 0x441100 : isHurt ? 0x332200 : 0x112211;
  const emissiveColor = isCritical ? 0xff4400 : isHurt ? 0xffaa00 : CONFIG.COLORS.ENEMY_MINION;

  return (
    <group position={position} ref={groupRef}>
      <group ref={bodyRef}>
        {/* Torso - main body with armor plating */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial
            color={bodyColor}
            emissive={emissiveColor}
            emissiveIntensity={damageIntensity * 0.3}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Chest plate detail */}
        <mesh position={[0, 0.55, 0.21]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial
            color={0x001100}
            emissive={emissiveColor}
            emissiveIntensity={damageIntensity * 0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Central power core */}
        <mesh position={[0, 0.5, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
          <meshBasicMaterial color={emissiveColor} />
        </mesh>

        {/* Head - angular robot head */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.4, 0.35, 0.35]} />
          <meshStandardMaterial
            color={0x222222}
            emissive={emissiveColor}
            emissiveIntensity={damageIntensity * 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Visor/face plate */}
        <mesh position={[0, 1.08, 0.18]}>
          <boxGeometry args={[0.35, 0.15, 0.02]} />
          <meshStandardMaterial
            color={0x000000}
            emissive={emissiveColor}
            emissiveIntensity={damageIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Evil eyes behind visor */}
        <mesh position={[0.1, 1.1, 0.17]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={isCritical ? 0xff0000 : isHurt ? 0xffff00 : 0xff3300} />
        </mesh>
        <mesh position={[-0.1, 1.1, 0.17]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={isCritical ? 0xff0000 : isHurt ? 0xffff00 : 0xff3300} />
        </mesh>

        {/* Antenna array */}
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.03, 0.25, 4]} />
          <meshStandardMaterial
            color={0x111111}
            emissive={emissiveColor}
            emissiveIntensity={damageIntensity * 0.8}
          />
        </mesh>
        <mesh position={[0.12, 1.32, 0]}>
          <coneGeometry args={[0.02, 0.15, 4]} />
          <meshStandardMaterial color={0x111111} emissive={emissiveColor} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.12, 1.32, 0]}>
          <coneGeometry args={[0.02, 0.15, 4]} />
          <meshStandardMaterial color={0x111111} emissive={emissiveColor} emissiveIntensity={0.5} />
        </mesh>

        {/* Arms group */}
        <group ref={armsRef}>
          {/* Left arm */}
          <group position={[0.4, 0.6, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
              <meshStandardMaterial
                color={bodyColor}
                emissive={emissiveColor}
                emissiveIntensity={damageIntensity * 0.2}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            {/* Claw hand */}
            <mesh position={[0, -0.35, 0]}>
              <coneGeometry args={[0.1, 0.15, 3]} />
              <meshStandardMaterial color={0x222222} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          {/* Right arm */}
          <group position={[-0.4, 0.6, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
              <meshStandardMaterial
                color={bodyColor}
                emissive={emissiveColor}
                emissiveIntensity={damageIntensity * 0.2}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            {/* Claw hand */}
            <mesh position={[0, -0.35, 0]}>
              <coneGeometry args={[0.1, 0.15, 3]} />
              <meshStandardMaterial color={0x222222} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* Legs group */}
        <group ref={legsRef}>
          {/* Left leg */}
          <group position={[0.15, -0.1, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
              <meshStandardMaterial
                color={bodyColor}
                emissive={emissiveColor}
                emissiveIntensity={damageIntensity * 0.15}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.4, 0.05]}>
              <boxGeometry args={[0.15, 0.1, 0.25]} />
              <meshStandardMaterial color={0x111111} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
          {/* Right leg */}
          <group position={[-0.15, -0.1, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
              <meshStandardMaterial
                color={bodyColor}
                emissive={emissiveColor}
                emissiveIntensity={damageIntensity * 0.15}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.4, 0.05]}>
              <boxGeometry args={[0.15, 0.1, 0.25]} />
              <meshStandardMaterial color={0x111111} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Shoulder pads */}
        <mesh position={[0.35, 0.85, 0]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.25]} />
          <meshStandardMaterial
            color={0x001100}
            emissive={emissiveColor}
            emissiveIntensity={0.3}
            metalness={0.7}
          />
        </mesh>
        <mesh position={[-0.35, 0.85, 0]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.25]} />
          <meshStandardMaterial
            color={0x001100}
            emissive={emissiveColor}
            emissiveIntensity={0.3}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* Glow - intensity based on health */}
      <pointLight color={emissiveColor} intensity={0.8 + (1 - hpRatio) * 1.2} distance={4} />

      {/* HP indicator ring when damaged */}
      {hp < maxHp && (
        <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 16, 1, 0, Math.PI * 2 * hpRatio]} />
          <meshBasicMaterial
            color={isCritical ? 0xff0000 : isHurt ? 0xffaa00 : 0x00ff00}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Boss (Krampus-Prime) mesh component
function BossMesh({
  position,
  rotation = 0,
  hp,
  maxHp,
}: {
  position: [number, number, number];
  rotation?: number;
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
    <group position={position} rotation={[0, rotation, 0]}>
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
          <meshBasicMaterial color={0xffaa00} transparent opacity={0.05} wireframe />
        </mesh>
      )}
    </group>
  );
}
