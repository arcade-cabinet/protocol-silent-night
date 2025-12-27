/**
 * Enemy System
 * Handles spawning, AI, and rendering of enemies
 * Performance optimized with instanced rendering and smooth rotation
 * Data-driven configuration for enemies and spawning
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG, ENEMIES } from '@/data';
import { useGameStore } from '@/store/gameStore';

const { minion: MINION_CONFIG, boss: BOSS_CONFIG, spawnConfig: ENEMY_SPAWN_CONFIG } = ENEMIES;

let enemyIdCounter = 0;

// Pre-allocated objects for performance
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

export function Enemies() {
  const groupRef = useRef<THREE.Group>(null);
  const spawnTimerRef = useRef(0);
  const lastDamageTimeRef = useRef(0);

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

  const spawnMinion = useCallback(() => {
    const { state: currentState, enemies: currentEnemies, addEnemy } = useGameStore.getState();
    if (
      currentState === 'GAME_OVER' ||
      currentState === 'WIN' ||
      currentState === 'LEVEL_UP' ||
      currentEnemies.length >= CONFIG.MAX_MINIONS
    )
      return;

    const id = `minion-${enemyIdCounter++}`;
    const angle = Math.random() * Math.PI * 2;
    const radius =
      ENEMY_SPAWN_CONFIG.minionSpawnRadiusMin +
      Math.random() *
        (ENEMY_SPAWN_CONFIG.minionSpawnRadiusMax - ENEMY_SPAWN_CONFIG.minionSpawnRadiusMin);

    const mesh = new THREE.Object3D();
    mesh.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);

    addEnemy({
      id,
      mesh,
      velocity: new THREE.Vector3(),
      hp: MINION_CONFIG.hp,
      maxHp: MINION_CONFIG.hp,
      isActive: true,
      type: 'minion',
      speed: MINION_CONFIG.speed + Math.random() * 2,
      damage: MINION_CONFIG.damage,
      pointValue: MINION_CONFIG.pointValue,
    });
  }, []);

  const hasSpawnedInitialRef = useRef(false);

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const intervalIds: ReturnType<typeof setInterval>[] = [];

    if ((state === 'PHASE_1' || state === 'PHASE_BOSS') && !hasSpawnedInitialRef.current) {
      hasSpawnedInitialRef.current = true;

      for (let i = 0; i < ENEMY_SPAWN_CONFIG.initialMinions; i++) {
        const id = setTimeout(() => spawnMinion(), i * 200);
        timeoutIds.push(id);
      }
    }

    // Ensure we keep spawning if the population drops too low
    // This addresses the "enemies not spawning" complaint by forcing population maintenance
    if ((state === 'PHASE_1' || state === 'PHASE_BOSS')) {
      const checkId = setInterval(() => {
          const { enemies } = useGameStore.getState();
          if (enemies.length < CONFIG.MAX_MINIONS / 2) {
              spawnMinion();
          }
      }, 1000);
      intervalIds.push(checkId);
    }

    if (state !== 'PHASE_1' && state !== 'PHASE_BOSS' && state !== 'LEVEL_UP') {
      hasSpawnedInitialRef.current = false;
    }

    return () => {
      for (const id of timeoutIds) {
        clearTimeout(id);
      }
      for (const id of intervalIds) {
        clearInterval(id);
      }
    };
  }, [state, spawnMinion]);

  const toPlayerRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const tempVecRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (state !== 'PHASE_1' && state !== 'PHASE_BOSS') return;

    if (state === 'PHASE_1' || state === 'PHASE_BOSS') {
      spawnTimerRef.current += delta * 1000;
      if (spawnTimerRef.current >= CONFIG.SPAWN_INTERVAL) {
        spawnTimerRef.current = 0;
        spawnMinion();
      }
    }

    const toPlayer = toPlayerRef.current;
    const direction = directionRef.current;
    const tempVec = tempVecRef.current;
    const now = Date.now();

    updateEnemies((currentEnemies) => {
      let shouldDamage = false;
      let damageAmount = 0;

      for (const enemy of currentEnemies) {
        const currentPos = enemy.mesh.position;

        toPlayer.copy(playerPosition).sub(currentPos);
        const distance = toPlayer.length();
        direction.copy(toPlayer).normalize();

        const moveSpeed = enemy.type === 'boss' ? BOSS_CONFIG.speed : enemy.speed;
        tempVec.copy(direction).multiplyScalar(moveSpeed * delta);
        currentPos.add(tempVec);

        const targetRotation = Math.atan2(direction.x, direction.z);
        const angleDiff =
          ((targetRotation - enemy.mesh.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
        enemy.mesh.rotation.y += angleDiff * delta * 8;

        const hitRadius =
          enemy.type === 'boss'
            ? ENEMY_SPAWN_CONFIG.hitRadiusBoss
            : ENEMY_SPAWN_CONFIG.hitRadiusMinion;
        if (distance < hitRadius) {
          if (now - lastDamageTimeRef.current > ENEMY_SPAWN_CONFIG.damageCooldown) {
            // Only damage if enemy is not at origin (0,0,0) - prevents ghost damage
            // from uninitialized enemies. Position length check ensures the enemy
            // has moved from the default spawn position.
            const isInitialized = enemy.mesh.position.lengthSq() > 0.1;

            if (isInitialized) {
                shouldDamage = true;
                damageAmount = Math.max(damageAmount, enemy.damage);
            }
          }
          tempVec.copy(direction).multiplyScalar(ENEMY_SPAWN_CONFIG.knockbackForce);
          currentPos.add(tempVec);
        }
      }

      if (shouldDamage) {
        lastDamageTimeRef.current = now;
        damagePlayer(damageAmount);
      }

      return currentEnemies;
    });
  });

  const minions = enemies.filter((e) => e.type === 'minion');

  return (
    <group ref={groupRef}>
      <InstancedMinions minions={minions} />
      {bossActive && <BossRenderer enemies={enemies} bossHp={bossHp} bossMaxHp={bossMaxHp} />}
    </group>
  );
}

function InstancedMinions({
  minions,
}: {
  minions: { mesh: THREE.Object3D; hp: number; maxHp: number }[];
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const eyeRef = useRef<THREE.InstancedMesh>(null);

  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.6, 0.8, 0.4), []);
  const headGeo = useMemo(() => new THREE.BoxGeometry(0.4, 0.35, 0.35), []);
  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.05, 6, 6), []);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x112211,
        emissive: new THREE.Color(CONFIG.COLORS.ENEMY_MINION),
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
        emissive: new THREE.Color(CONFIG.COLORS.ENEMY_MINION),
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

    for (let i = 0; i < CONFIG.MAX_MINIONS + 5; i++) {
      if (i < minions.length) {
        const minion = minions[i];
        const pos = minion.mesh.position;
        const rot = minion.mesh.rotation.y;
        const hpRatio = minion.hp / minion.maxHp;
        const uniqueOffset = i * 0.3;

        dummy.position.set(pos.x, pos.y + 0.5 + Math.sin(time * 8 + uniqueOffset) * 0.08, pos.z);
        dummy.rotation.set(0.15, rot, Math.sin(time * 3 + uniqueOffset) * 0.05);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        bodyRef.current.setMatrixAt(i, dummy.matrix);

        if (hpRatio < 0.5) {
          tempColor.setHex(hpRatio < 0.25 ? 0x441100 : 0x332200);
        } else {
          tempColor.setHex(0x112211);
        }
        bodyRef.current.setColorAt(i, tempColor);

        dummy.position.set(pos.x, pos.y + 1.1 + Math.sin(time * 8 + uniqueOffset) * 0.08, pos.z);
        dummy.rotation.set(0, rot, Math.sin(time * 3 + uniqueOffset) * 0.05);
        dummy.updateMatrix();
        headRef.current.setMatrixAt(i, dummy.matrix);

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
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, CONFIG.MAX_MINIONS + 5]} castShadow />
      <instancedMesh ref={headRef} args={[headGeo, headMat, CONFIG.MAX_MINIONS + 5]} castShadow />
      <instancedMesh ref={eyeRef} args={[eyeGeo, eyeMat, CONFIG.MAX_MINIONS + 5]} />
      <pointLight
        color={new THREE.Color(CONFIG.COLORS.ENEMY_MINION)}
        intensity={1.5}
        distance={30}
        position={[0, 2, 0]}
      />
    </group>
  );
}

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
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const chainRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tongueRef = useRef<THREE.Mesh>(null);

  const hpRatio = hp / maxHp;
  const rage = 1 - hpRatio;
  const intensity = 1.5 + rage * 3;
  const pulseSpeed = 1 + rage * 2;

  const baseColor = hpRatio > 0.5 ? 0x220011 : hpRatio > 0.25 ? 0x330000 : 0x440000;
  const emissiveColor = hpRatio > 0.5 ? 0xff0044 : hpRatio > 0.25 ? 0xff2200 : 0xff0000;
  const eyeColor = hpRatio > 0.5 ? 0xff0044 : hpRatio > 0.25 ? 0xffaa00 : 0xffffff;

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.3;
    }

    if (bodyRef.current) {
      const breathe = 1 + Math.sin(time * pulseSpeed * 2) * 0.03;
      bodyRef.current.scale.set(breathe, breathe * 0.98, breathe);
    }

    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 0.8) * 0.1 - 0.1;
      headRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(time * 1.2) * 0.3 - 0.5;
      leftArmRef.current.rotation.z = Math.sin(time * 0.8) * 0.1 + 0.3;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(time * 1.2 + Math.PI) * 0.3 - 0.5;
      rightArmRef.current.rotation.z = Math.sin(time * 0.8 + Math.PI) * 0.1 - 0.3;
    }

    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 2) * 0.2;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * 2 + Math.PI) * 0.2;

    for (let i = 0; i < chainRefs.current.length; i++) {
      const chain = chainRefs.current[i];
      if (chain) {
        chain.rotation.x = Math.sin(time * 3 + i * 0.5) * 0.2;
        chain.rotation.z = Math.cos(time * 2.5 + i * 0.7) * 0.15;
      }
    }

    if (tongueRef.current && rage > 0.5) {
      tongueRef.current.scale.z = 1 + Math.sin(time * 8) * 0.3;
      tongueRef.current.rotation.x = Math.sin(time * 6) * 0.2 + 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
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
        <mesh position={[0, 0.2, 1]}>
          <dodecahedronGeometry args={[0.4]} />
          <meshBasicMaterial color={emissiveColor} />
        </mesh>
        <pointLight
          color={emissiveColor}
          intensity={intensity * 2}
          distance={8}
          position={[0, 0.2, 1.2]}
        />
        {[-0.6, -0.2, 0.2, 0.6].map((y) => (
          <mesh key={`rib-${y}`} position={[0, y, 0.9]} castShadow>
            <boxGeometry args={[2.2, 0.15, 0.1]} />
            <meshStandardMaterial
              color={0x222222}
              emissive={emissiveColor}
              emissiveIntensity={0.1 + (y + 0.6) * 0.1}
              metalness={0.85}
            />
          </mesh>
        ))}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y) => (
          <mesh key={`spine-${y}`} position={[0, y, -0.95]} castShadow>
            <coneGeometry args={[0.15, 0.4, 4]} />
            <meshStandardMaterial
              color={0x110000}
              emissive={emissiveColor}
              emissiveIntensity={0.3}
              metalness={0.6}
            />
          </mesh>
        ))}
        <mesh position={[1.4, 1.2, 0]}>
          <coneGeometry args={[0.5, 1, 6]} />
          <meshStandardMaterial color={0x111111} roughness={1} />
        </mesh>
        <mesh position={[-1.4, 1.2, 0]}>
          <coneGeometry args={[0.5, 1, 6]} />
          <meshStandardMaterial color={0x111111} roughness={1} />
        </mesh>
      </group>
      <group ref={headRef} position={[0, 2.2, 0]}>
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
        <mesh position={[0, -0.5, 0.7]}>
          <boxGeometry args={[0.75, 0.3, 0.75]} />
          <meshStandardMaterial color={0x110000} metalness={0.4} roughness={0.6} />
        </mesh>
        {[-0.25, -0.1, 0.1, 0.25].map((x) => (
          <mesh key={`tooth-top-${x}`} position={[x, -0.35, 1.05]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.06, 0.2, 4]} />
            <meshStandardMaterial
              color={0xffffcc}
              emissive={0xffffaa}
              emissiveIntensity={0.2}
              metalness={0.3}
            />
          </mesh>
        ))}
        {[-0.2, 0, 0.2].map((x) => (
          <mesh key={`tooth-bot-${x}`} position={[x, -0.6, 1]} rotation={[-0.2, 0, Math.PI]}>
            <coneGeometry args={[0.05, 0.18, 4]} />
            <meshStandardMaterial
              color={0xffffcc}
              emissive={0xffffaa}
              emissiveIntensity={0.2}
              metalness={0.3}
            />
          </mesh>
        ))}
        {rage > 0.5 && (
          <mesh ref={tongueRef} position={[0, -0.45, 0.9]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.6]} />
            <meshStandardMaterial color={0x660033} emissive={0xff0066} emissiveIntensity={0.5} />
          </mesh>
        )}
        <mesh position={[0.35, 0.15, 0.55]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <mesh position={[-0.35, 0.15, 0.55]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <pointLight
          color={eyeColor}
          intensity={intensity * 1.5}
          distance={6}
          position={[0, 0.15, 0.8]}
        />
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
        </group>
      </group>
      <group ref={leftArmRef} position={[1.6, 1, 0]}>
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
        </group>
        {[0, -0.4, -0.8].map((y) => {
          const idx = y === 0 ? 0 : y === -0.4 ? 1 : 2;
          return (
            <mesh
              key={`chain-l-${y}`}
              position={[0.1, y, 0.3]}
              ref={(el) => {
                if (el) {
                  chainRefs.current[idx] = el;
                }
              }}
            >
              <torusGeometry args={[0.4 + idx * 0.05, 0.04, 6, 12]} />
              <meshStandardMaterial color={0x444444} metalness={0.95} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
      <group ref={rightArmRef} position={[-1.6, 1, 0]}>
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
          <group position={[0, -0.6, 0.4]} rotation={[0.3, 0, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
              <meshStandardMaterial color={0x330011} emissive={0xff0044} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 1.2, 0.3]} rotation={[0.8, 0, 0]}>
              <boxGeometry args={[0.08, 1, 0.4]} />
              <meshStandardMaterial
                color={0xffffff}
                emissive={emissiveColor}
                emissiveIntensity={0.5}
                metalness={0.9}
              />
            </mesh>
          </group>
        </group>
      </group>
      <group ref={leftLegRef} position={[0.6, -2, 0]}>
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
        </group>
      </group>
      <group ref={rightLegRef} position={[-0.6, -2, 0]}>
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
        </group>
      </group>
      <pointLight
        color={new THREE.Color(emissiveColor)}
        intensity={intensity * 3}
        distance={15}
        position={[0, 0, 0]}
      />
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
