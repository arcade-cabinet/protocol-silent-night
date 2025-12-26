/**
 * Player Controller
 * Handles player movement, shooting, and character rendering
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import type { ChristmasObstacle, PlayerClassType } from '@/types';
import { getBulletTypeFromWeapon } from '@/types';
import { BumbleCharacter } from './BumbleCharacter';
import { ElfCharacter } from './ElfCharacter';
import { SantaCharacter } from './SantaCharacter';

let bulletIdCounter = 0;

const PLAYER_COLLISION_RADIUS = 0.7;

// Collision detection helper using simple circle-to-circle check
export function checkCollision(
  position: THREE.Vector3,
  obstacles: ChristmasObstacle[],
  radius: number = PLAYER_COLLISION_RADIUS
): boolean {
  for (const obstacle of obstacles) {
    const dx = position.x - obstacle.position.x;
    const dz = position.z - obstacle.position.z;
    const distanceSq = dx * dx + dz * dz;
    const combinedRadius = radius + obstacle.radius;

    // Check if player would collide with obstacle (using squared distances for performance)
    if (distanceSq < combinedRadius * combinedRadius) {
      return true; // Collision detected
    }
  }
  return false; // No collision
}

export function PlayerController() {
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTime = useRef(0);
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);
  const moveDirRef = useRef(new THREE.Vector3());
  const fireDirRef = useRef(new THREE.Vector3());
  const upAxisRef = useRef(new THREE.Vector3(0, 1, 0));
  const firePosRef = useRef(new THREE.Vector3());

  // Reuse vectors for performance in game loop
  const newPositionRef = useRef(new THREE.Vector3());
  const slideXRef = useRef(new THREE.Vector3());
  const slideZRef = useRef(new THREE.Vector3());
  const moveVectorRef = useRef(new THREE.Vector3());

  const { playerClass, input, state, setPlayerPosition, setPlayerRotation, addBullet, obstacles } =
    useGameStore();

  const isMoving = input.movement.x !== 0 || input.movement.y !== 0;
  const isFiring = input.isFiring;

  // Create bullet with initial position
  const fireBullet = useCallback(
    (spawnPosition: THREE.Vector3, direction: THREE.Vector3, damage: number) => {
      const id = `bullet-${bulletIdCounter++}`;

      // Create mesh-like object with position for tracking
      const createBulletMesh = (pos: THREE.Vector3) => {
        const obj = new THREE.Object3D();
        obj.position.copy(pos);
        return obj;
      };

      // Determine bullet type and parameters from weapon
      const weaponType = playerClass?.weaponType || 'star';
      const bulletType = getBulletTypeFromWeapon(weaponType);

      const bulletSpeed = bulletType === 'smg' ? 45 : bulletType === 'stars' ? 35 : 25;
      const bulletLife = bulletType === 'smg' ? 1.5 : bulletType === 'stars' ? 2.5 : 3.0;

      // For star weapon, create spread pattern
      if (weaponType === 'star') {
        const angles = [-0.2, 0, 0.2];
        for (const angleOffset of angles) {
          const spreadDir = direction.clone();
          spreadDir.applyAxisAngle(upAxisRef.current, angleOffset);

          addBullet({
            id: `${id}-${angleOffset}`,
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
            type: 'stars',
          });
        }
      } else {
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
          type: bulletType,
        });
      }
    },
    [playerClass, addBullet]
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !playerClass || state === 'GAME_OVER' || state === 'WIN') return;

    const { movement, isFiring: firing } = input;

    // Movement with collision detection
    if (movement.x !== 0 || movement.y !== 0) {
      const speed = playerClass.speed * delta;
      moveDirRef.current.set(movement.x, 0, movement.y).normalize();

      // Calculate potential new position
      moveVectorRef.current.copy(moveDirRef.current).multiplyScalar(speed);
      newPositionRef.current.copy(positionRef.current).add(moveVectorRef.current);

      // Clamp to world bounds
      const worldBound = 35;
      newPositionRef.current.x = THREE.MathUtils.clamp(
        newPositionRef.current.x,
        -worldBound,
        worldBound
      );
      newPositionRef.current.z = THREE.MathUtils.clamp(
        newPositionRef.current.z,
        -worldBound,
        worldBound
      );

      // Check collision before moving
      if (!checkCollision(newPositionRef.current, obstacles)) {
        // No collision - apply movement
        positionRef.current.copy(newPositionRef.current);
      } else {
        // Collision detected - try sliding along obstacles
        // Try X-axis only movement
        slideXRef.current.copy(positionRef.current);
        slideXRef.current.x = newPositionRef.current.x;
        if (!checkCollision(slideXRef.current, obstacles)) {
          positionRef.current.copy(slideXRef.current);
        } else {
          // Try Z-axis only movement
          slideZRef.current.copy(positionRef.current);
          slideZRef.current.z = newPositionRef.current.z;
          if (!checkCollision(slideZRef.current, obstacles)) {
            positionRef.current.copy(slideZRef.current);
          }
          // If both fail, don't move (stuck against obstacle)
        }
      }

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
      if (now - lastFireTime.current >= playerClass.rof) {
        lastFireTime.current = now;

        firePosRef.current.copy(positionRef.current);
        firePosRef.current.y = 1.5;

        fireDirRef.current.set(0, 0, 1);
        fireDirRef.current.applyAxisAngle(upAxisRef.current, rotationRef.current);

        fireBullet(firePosRef.current, fireDirRef.current, playerClass.damage);
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
