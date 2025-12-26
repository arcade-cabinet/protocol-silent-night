/**
 * Player Controller
 * Handles player movement, shooting, and character rendering
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import type { PlayerClassType, WeaponType } from '@/types';
import { WEAPONS } from '@/types';
import { BumbleCharacter } from './BumbleCharacter';
import { ElfCharacter } from './ElfCharacter';
import { SantaCharacter } from './SantaCharacter';

let bulletIdCounter = 0;

export function PlayerController() {
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTime = useRef(0);
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);
  const moveDirRef = useRef(new THREE.Vector3());
  const fireDirRef = useRef(new THREE.Vector3());
  const upAxisRef = useRef(new THREE.Vector3(0, 1, 0));
  const firePosRef = useRef(new THREE.Vector3());

  const {
    playerClass,
    currentWeapon,
    input,
    state,
    setPlayerPosition,
    setPlayerRotation,
    addBullet,
  } = useGameStore();

  const isMoving = input.movement.x !== 0 || input.movement.y !== 0;
  const isFiring = input.isFiring;

  // Create bullet with initial position
  const fireBullet = useCallback(
    (
      spawnPosition: THREE.Vector3,
      direction: THREE.Vector3,
      baseDamage: number,
      weaponType: WeaponType
    ) => {
      const id = `bullet-${bulletIdCounter++}`;

      // Create mesh-like object with position for tracking
      const createBulletMesh = (pos: THREE.Vector3) => {
        const obj = new THREE.Object3D();
        obj.position.copy(pos);
        return obj;
      };

      // Get weapon configuration
      const weaponConfig = WEAPONS[weaponType];

      // Use weapon config or fallback to base damage
      const damage = weaponConfig.damage || baseDamage;
      const bulletSpeed = weaponConfig.speed;
      const bulletLife = weaponConfig.life;

      // Handle spread weapons (star, jingle_bell)
      if (weaponConfig.projectileCount && weaponConfig.projectileCount > 1) {
        const count = weaponConfig.projectileCount;
        const spreadAngle = weaponConfig.spreadAngle || 0.2;
        const angleStep = (spreadAngle * 2) / (count - 1);
        const startAngle = -spreadAngle;

        for (let i = 0; i < count; i++) {
          const angleOffset = startAngle + angleStep * i;
          const spreadDir = direction.clone();
          spreadDir.applyAxisAngle(upAxisRef.current, angleOffset);

          addBullet({
            id: `${id}-${i}`,
            mesh: createBulletMesh(spawnPosition),
            velocity: spreadDir.clone().multiplyScalar(bulletSpeed),
            hp: 1,
            maxHp: 1,
            isActive: true,
            direction: spreadDir,
            isEnemy: false,
            damage,
            life: bulletLife,
            speed: bulletSpeed,
            type: weaponType,
            behavior: weaponConfig.behavior,
          });
        }
      } else {
        // Single projectile
        addBullet({
          id,
          mesh: createBulletMesh(spawnPosition),
          velocity: direction.clone().multiplyScalar(bulletSpeed),
          hp: 1,
          maxHp: 1,
          isActive: true,
          direction: direction.clone(),
          isEnemy: false,
          damage,
          life: bulletLife,
          speed: bulletSpeed,
          type: weaponType,
          behavior: weaponConfig.behavior,
        });
      }
    },
    [addBullet]
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !playerClass || state === 'GAME_OVER' || state === 'WIN') return;

    const { movement, isFiring: firing } = input;

    // Movement
    if (movement.x !== 0 || movement.y !== 0) {
      const speed = playerClass.speed * delta;
      moveDirRef.current.set(movement.x, 0, movement.y).normalize();

      positionRef.current.add(moveDirRef.current.multiplyScalar(speed));

      // Clamp to world bounds
      const worldBound = 35;
      positionRef.current.x = THREE.MathUtils.clamp(positionRef.current.x, -worldBound, worldBound);
      positionRef.current.z = THREE.MathUtils.clamp(positionRef.current.z, -worldBound, worldBound);

      // Calculate rotation from movement direction
      rotationRef.current = Math.atan2(movement.x, movement.y);
    }

    // Apply position and rotation
    groupRef.current.position.copy(positionRef.current);
    groupRef.current.rotation.y = rotationRef.current;

    // Update store
    setPlayerPosition(positionRef.current);
    setPlayerRotation(rotationRef.current);

    // Firing
    if (firing) {
      const now = Date.now() / 1000;
      const weaponConfig = WEAPONS[currentWeapon];
      const fireRate = weaponConfig.rof;

      if (now - lastFireTime.current >= fireRate) {
        lastFireTime.current = now;

        firePosRef.current.copy(positionRef.current);
        firePosRef.current.y = 1.5;

        fireDirRef.current.set(0, 0, 1);
        fireDirRef.current.applyAxisAngle(upAxisRef.current, rotationRef.current);

        fireBullet(firePosRef.current, fireDirRef.current, playerClass.damage, currentWeapon);
      }
    }
  });

  // Reset position when class is selected
  useEffect(() => {
    if (playerClass) {
      positionRef.current.set(0, 0, 0);
      rotationRef.current = 0;
    }
  }, [playerClass]);

  if (!playerClass) return null;

  const CharacterComponent = getCharacterComponent(playerClass.type);

  return (
    <group ref={groupRef}>
      <CharacterComponent
        position={[0, 0, 0]}
        rotation={0}
        isMoving={isMoving}
        isFiring={isFiring}
      />
    </group>
  );
}

function getCharacterComponent(type: PlayerClassType) {
  switch (type) {
    case 'santa':
      return SantaCharacter;
    case 'elf':
      return ElfCharacter;
    case 'bumble':
      return BumbleCharacter;
    default:
      return SantaCharacter;
  }
}
