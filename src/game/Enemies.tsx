/**
 * Enemy System
 * Handles spawning, AI, and rendering of enemies
 * Performance optimized with instanced rendering
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';

let enemyIdCounter = 0;

// Pre-allocated objects for performance
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

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

        // Set rotation to face the player
        enemy.mesh.rotation.y = Math.atan2(direction.x, direction.z);

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

  // Separate minions for instanced rendering
  const minions = enemies.filter((e) => e.type === 'minion');

  return (
    <group ref={groupRef}>
      {/* Instanced Minions - much better performance */}
      <InstancedMinions minions={minions} />

      {/* Render Boss */}
      {bossActive && <BossRenderer enemies={enemies} bossHp={bossHp} bossMaxHp={bossMaxHp} />}
    </group>
  );
}

// Instanced minion rendering for better performance
const MAX_MINIONS = CONFIG.MAX_MINIONS + 5; // Buffer

function InstancedMinions({ minions }: { minions: { mesh: THREE.Object3D; hp: number; maxHp: number }[] }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const eyeRef = useRef<THREE.InstancedMesh>(null);

  // Geometries
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.6, 0.8, 0.4), []);
  const headGeo = useMemo(() => new THREE.BoxGeometry(0.4, 0.35, 0.35), []);
  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.05, 6, 6), []);

  // Materials
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x112211,
        emissive: CONFIG.COLORS.ENEMY_MINION,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
      }),
    []
  );

  const headMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: CONFIG.COLORS.ENEMY_MINION,
        emissiveIntensity: 0.2,
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  );

  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff3300 }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (!bodyRef.current || !headRef.current || !eyeRef.current) return;

    for (let i = 0; i < MAX_MINIONS; i++) {
      if (i < minions.length) {
        const minion = minions[i];
        const pos = minion.mesh.position;
        const rot = minion.mesh.rotation.y;
        const hpRatio = minion.hp / minion.maxHp;
        const uniqueOffset = i * 0.3;

        // Body - with bobbing
        dummy.position.set(pos.x, pos.y + 0.5 + Math.sin(time * 8 + uniqueOffset) * 0.08, pos.z);
        dummy.rotation.set(0.15, rot, Math.sin(time * 3 + uniqueOffset) * 0.05);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        bodyRef.current.setMatrixAt(i, dummy.matrix);

        // Update body color based on HP
        if (hpRatio < 0.5) {
          tempColor.setHex(hpRatio < 0.25 ? 0x441100 : 0x332200);
        } else {
          tempColor.setHex(0x112211);
        }
        bodyRef.current.setColorAt(i, tempColor);

        // Head
        dummy.position.set(
          pos.x,
          pos.y + 1.1 + Math.sin(time * 8 + uniqueOffset) * 0.08,
          pos.z
        );
        dummy.rotation.set(0, rot, Math.sin(time * 3 + uniqueOffset) * 0.05);
        dummy.updateMatrix();
        headRef.current.setMatrixAt(i, dummy.matrix);

        // Eyes (offset from head position)
        const eyeOffsetX = Math.sin(rot) * 0.17;
        const eyeOffsetZ = Math.cos(rot) * 0.17;
        dummy.position.set(
          pos.x + eyeOffsetX,
          pos.y + 1.1 + Math.sin(time * 8 + uniqueOffset) * 0.08,
          pos.z + eyeOffsetZ
        );
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        eyeRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        // Hide unused instances
        dummy.position.set(0, -1000, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bodyRef.current.setMatrixAt(i, dummy.matrix);
        headRef.current.setMatrixAt(i, dummy.matrix);
        eyeRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    bodyRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    eyeRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) {
      bodyRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, MAX_MINIONS]} castShadow />
      <instancedMesh ref={headRef} args={[headGeo, headMat, MAX_MINIONS]} castShadow />
      <instancedMesh ref={eyeRef} args={[eyeGeo, eyeMat, MAX_MINIONS]} />
      
      {/* Single shared light for all minions - better than per-minion lights */}
      <pointLight color={CONFIG.COLORS.ENEMY_MINION} intensity={1.5} distance={30} position={[0, 2, 0]} />
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
    <BossMesh position={[bossPos?.x ?? 0, 4, bossPos?.z ?? 0]} hp={bossHp} maxHp={bossMaxHp} />
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

// Boss (Krampus-Prime) mesh component - Terrifying Cybernetic Christmas Demon
function BossMesh({
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
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const chainRefs = useRef<THREE.Mesh[]>([]);
  const tongueRef = useRef<THREE.Mesh>(null);

  const hpRatio = hp / maxHp;
  const rage = 1 - hpRatio; // Increases as HP decreases
  const intensity = 1.5 + rage * 3;
  const pulseSpeed = 1 + rage * 2;

  // Phase colors - gets more intense/red as damaged
  const baseColor = hpRatio > 0.5 ? 0x220011 : hpRatio > 0.25 ? 0x330000 : 0x440000;
  const emissiveColor = hpRatio > 0.5 ? 0xff0044 : hpRatio > 0.25 ? 0xff2200 : 0xff0000;
  const eyeColor = hpRatio > 0.5 ? 0xff0044 : hpRatio > 0.25 ? 0xffaa00 : 0xffffff;

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Menacing hover
      groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.3;
      // Slight rotation tracking feel
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
    }

    if (bodyRef.current) {
      // Breathing/pulsing
      const breathe = 1 + Math.sin(time * pulseSpeed * 2) * 0.03;
      bodyRef.current.scale.set(breathe, breathe * 0.98, breathe);
    }

    if (headRef.current) {
      // Sinister head movements
      headRef.current.rotation.x = Math.sin(time * 0.8) * 0.1 - 0.1; // Looking down at prey
      headRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }

    // Arm movements - threatening gestures
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(time * 1.2) * 0.3 - 0.5;
      leftArmRef.current.rotation.z = Math.sin(time * 0.8) * 0.1 + 0.3;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(time * 1.2 + Math.PI) * 0.3 - 0.5;
      rightArmRef.current.rotation.z = Math.sin(time * 0.8 + Math.PI) * 0.1 - 0.3;
    }

    // Leg movements - stalking gait
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(time * 2) * 0.2;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = Math.sin(time * 2 + Math.PI) * 0.2;
    }

    // Animate chains rattling
    for (let i = 0; i < chainRefs.current.length; i++) {
      const chain = chainRefs.current[i];
      if (chain) {
        chain.rotation.x = Math.sin(time * 3 + i * 0.5) * 0.2;
        chain.rotation.z = Math.cos(time * 2.5 + i * 0.7) * 0.15;
      }
    }

    // Tongue lashing when enraged
    if (tongueRef.current && rage > 0.5) {
      tongueRef.current.scale.z = 1 + Math.sin(time * 8) * 0.3;
      tongueRef.current.rotation.x = Math.sin(time * 6) * 0.2 + 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Body Group */}
      <group ref={bodyRef}>
        {/* Torso - Massive demonic chest */}
        <mesh castShadow>
          <boxGeometry args={[2.5, 3, 1.8]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.3}
            metalness={0.4}
            roughness={0.7}
          />
        </mesh>

        {/* Chest armor plates */}
        <mesh position={[0, 0.3, 0.95]} castShadow>
          <boxGeometry args={[2, 2, 0.15]} />
          <meshStandardMaterial
            color={0x111111}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.2}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Glowing power core in chest */}
        <mesh position={[0, 0.2, 1]}>
          <dodecahedronGeometry args={[0.4]} />
          <meshBasicMaterial color={emissiveColor} />
        </mesh>
        <pointLight color={emissiveColor} intensity={intensity * 2} distance={8} position={[0, 0.2, 1.2]} />

        {/* Rib cage armor details */}
        {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
          <mesh key={`rib-${i}`} position={[0, y, 0.9]} castShadow>
            <boxGeometry args={[2.2, 0.15, 0.1]} />
            <meshStandardMaterial
              color={0x222222}
              emissive={emissiveColor}
              emissiveIntensity={0.1 + i * 0.05}
              metalness={0.85}
            />
          </mesh>
        ))}

        {/* Spine/back detail */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
          <mesh key={`spine-${i}`} position={[0, y, -0.95]} castShadow>
            <coneGeometry args={[0.15, 0.4, 4]} />
            <meshStandardMaterial
              color={0x110000}
              emissive={emissiveColor}
              emissiveIntensity={0.3}
              metalness={0.6}
            />
          </mesh>
        ))}

        {/* Fur tufts on shoulders */}
        <mesh position={[1.4, 1.2, 0]}>
          <coneGeometry args={[0.5, 1, 6]} />
          <meshStandardMaterial color={0x111111} roughness={1} />
        </mesh>
        <mesh position={[-1.4, 1.2, 0]}>
          <coneGeometry args={[0.5, 1, 6]} />
          <meshStandardMaterial color={0x111111} roughness={1} />
        </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 2.2, 0]}>
        {/* Skull base */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.4, 1.2]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.2}
            metalness={0.3}
            roughness={0.8}
          />
        </mesh>

        {/* Elongated snout/muzzle */}
        <mesh position={[0, -0.2, 0.7]} castShadow>
          <boxGeometry args={[0.8, 0.7, 0.8]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.15}
            metalness={0.3}
            roughness={0.8}
          />
        </mesh>

        {/* Jaw with teeth */}
        <mesh position={[0, -0.5, 0.7]}>
          <boxGeometry args={[0.75, 0.3, 0.75]} />
          <meshStandardMaterial color={0x110000} metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Sharp teeth - top row */}
        {[-0.25, -0.1, 0.1, 0.25].map((x, i) => (
          <mesh key={`tooth-top-${i}`} position={[x, -0.35, 1.05]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.06, 0.2, 4]} />
            <meshStandardMaterial color={0xffffcc} emissive={0xffffaa} emissiveIntensity={0.2} metalness={0.3} />
          </mesh>
        ))}

        {/* Sharp teeth - bottom row */}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={`tooth-bot-${i}`} position={[x, -0.6, 1]} rotation={[-0.2, 0, Math.PI]}>
            <coneGeometry args={[0.05, 0.18, 4]} />
            <meshStandardMaterial color={0xffffcc} emissive={0xffffaa} emissiveIntensity={0.2} metalness={0.3} />
          </mesh>
        ))}

        {/* Demonic tongue */}
        {rage > 0.5 && (
          <mesh ref={tongueRef} position={[0, -0.45, 0.9]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.6]} />
            <meshStandardMaterial color={0x660033} emissive={0xff0066} emissiveIntensity={0.5} />
          </mesh>
        )}

        {/* Glowing eyes - cybernetic */}
        <mesh position={[0.35, 0.15, 0.55]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <mesh position={[-0.35, 0.15, 0.55]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>

        {/* Eye glow */}
        <pointLight color={eyeColor} intensity={intensity * 1.5} distance={6} position={[0, 0.15, 0.8]} />

        {/* Cyber implants around eyes */}
        <mesh position={[0.45, 0.25, 0.5]}>
          <boxGeometry args={[0.15, 0.4, 0.1]} />
          <meshStandardMaterial color={0x111111} emissive={emissiveColor} emissiveIntensity={0.3} metalness={0.95} />
        </mesh>
        <mesh position={[-0.45, 0.25, 0.5]}>
          <boxGeometry args={[0.15, 0.4, 0.1]} />
          <meshStandardMaterial color={0x111111} emissive={emissiveColor} emissiveIntensity={0.3} metalness={0.95} />
        </mesh>

        {/* Massive curved horns */}
        <group position={[0.5, 0.5, -0.1]} rotation={[0.3, 0.4, 0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.2, 1.5, 6]} />
            <meshStandardMaterial
              color={0x111100}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.15}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Horn rings */}
          {[0.3, 0.6, 0.9].map((y, i) => (
            <mesh key={`horn-ring-r-${i}`} position={[0, -y + 0.5, 0]}>
              <torusGeometry args={[0.12 - i * 0.02, 0.03, 6, 8]} />
              <meshStandardMaterial color={0x222200} emissive={emissiveColor} emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
        <group position={[-0.5, 0.5, -0.1]} rotation={[0.3, -0.4, -0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.2, 1.5, 6]} />
            <meshStandardMaterial
              color={0x111100}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.15}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Horn rings */}
          {[0.3, 0.6, 0.9].map((y, i) => (
            <mesh key={`horn-ring-l-${i}`} position={[0, -y + 0.5, 0]}>
              <torusGeometry args={[0.12 - i * 0.02, 0.03, 6, 8]} />
              <meshStandardMaterial color={0x222200} emissive={emissiveColor} emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>

        {/* Pointed ears */}
        <mesh position={[0.6, 0.2, -0.2]} rotation={[0, 0.5, 0.3]}>
          <coneGeometry args={[0.15, 0.5, 4]} />
          <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[-0.6, 0.2, -0.2]} rotation={[0, -0.5, -0.3]}>
          <coneGeometry args={[0.15, 0.5, 4]} />
          <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Left Arm - with chains */}
      <group ref={leftArmRef} position={[1.6, 1, 0]}>
        {/* Upper arm */}
        <mesh castShadow>
          <capsuleGeometry args={[0.35, 1.2, 6, 12]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.15}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Forearm with cyber augmentation */}
        <group position={[0.2, -1.2, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1, 6, 12]} />
            <meshStandardMaterial
              color={0x111111}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.2}
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>

          {/* Clawed hand */}
          <group position={[0, -0.8, 0.1]}>
            {[-0.15, 0, 0.15].map((x, i) => (
              <mesh key={`claw-l-${i}`} position={[x, -0.15, 0.1]} rotation={[0.5, 0, 0]} castShadow>
                <coneGeometry args={[0.08, 0.5, 4]} />
                <meshStandardMaterial
                  color={0x222211}
                  emissive={emissiveColor}
                  emissiveIntensity={0.3}
                  metalness={0.7}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* Chains wrapped around arm */}
        {[0, -0.4, -0.8].map((y, i) => (
          <mesh
            key={`chain-l-${i}`}
            position={[0.1, y, 0.3]}
            ref={(el) => { if (el) chainRefs.current[i] = el; }}
          >
            <torusGeometry args={[0.4 + i * 0.05, 0.04, 6, 12]} />
            <meshStandardMaterial color={0x444444} metalness={0.95} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Right Arm - holding corrupted candy cane weapon */}
      <group ref={rightArmRef} position={[-1.6, 1, 0]}>
        {/* Upper arm */}
        <mesh castShadow>
          <capsuleGeometry args={[0.35, 1.2, 6, 12]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.15}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Forearm */}
        <group position={[-0.2, -1.2, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1, 6, 12]} />
            <meshStandardMaterial
              color={0x111111}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.2}
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>

          {/* Corrupted Candy Cane Scythe */}
          <group position={[0, -0.6, 0.4]} rotation={[0.3, 0, 0.2]}>
            {/* Handle */}
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
              <meshStandardMaterial
                color={0x330011}
                emissive={0xff0044}
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Curved blade */}
            <mesh position={[0, 1.2, 0.3]} rotation={[0.8, 0, 0]}>
              <boxGeometry args={[0.08, 1, 0.4]} />
              <meshStandardMaterial
                color={0xffffff}
                emissive={emissiveColor}
                emissiveIntensity={0.5}
                metalness={0.9}
              />
            </mesh>
            {/* Candy stripes (corrupted) */}
            {[0.2, 0.5, 0.8].map((y, i) => (
              <mesh key={`stripe-${i}`} position={[0, y - 0.7, 0.04]}>
                <boxGeometry args={[0.1, 0.15, 0.1]} />
                <meshBasicMaterial color={i % 2 === 0 ? 0xff0044 : 0x111111} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[0.6, -2, 0]}>
        {/* Thigh */}
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2, 6, 12]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.1}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Lower leg - digitigrade style */}
        <group position={[0, -1.3, 0.3]} rotation={[-0.4, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1.2, 6, 12]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.1}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>

          {/* Hooved foot */}
          <mesh position={[0, -0.9, 0.2]} castShadow>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
            <meshStandardMaterial color={0x111100} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[-0.6, -2, 0]}>
        {/* Thigh */}
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2, 6, 12]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={intensity * 0.1}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Lower leg - digitigrade style */}
        <group position={[0, -1.3, 0.3]} rotation={[-0.4, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1.2, 6, 12]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={intensity * 0.1}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>

          {/* Hooved foot */}
          <mesh position={[0, -0.9, 0.2]} castShadow>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
            <meshStandardMaterial color={0x111100} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Tail */}
      <mesh position={[0, -1.5, -1]} rotation={[0.8, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 1.5, 6]} />
        <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.2} />
      </mesh>
      {/* Tail tip - arrow shape */}
      <mesh position={[0, -1.5, -1.8]} rotation={[1.2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color={0x220000} emissive={emissiveColor} emissiveIntensity={0.4} />
      </mesh>

      {/* Hellfire aura effect */}
      <pointLight
        color={emissiveColor}
        intensity={intensity * 3}
        distance={15}
        position={[0, 0, 0]}
      />

      {/* Ground shadow/burn mark */}
      <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 16]} />
        <meshBasicMaterial color={emissiveColor} transparent opacity={0.15 + rage * 0.2} />
      </mesh>

      {/* Rage aura when damaged */}
      {rage > 0.3 && (
        <mesh>
          <sphereGeometry args={[4 + rage * 2, 12, 12]} />
          <meshBasicMaterial
            color={emissiveColor}
            transparent
            opacity={0.03 + rage * 0.05}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* HP indicator halo */}
      <mesh position={[0, 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2, 32, 1, 0, Math.PI * 2 * hpRatio]} />
        <meshBasicMaterial
          color={hpRatio > 0.5 ? 0x00ff00 : hpRatio > 0.25 ? 0xffaa00 : 0xff0000}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
