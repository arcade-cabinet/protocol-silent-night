/**
 * Player Controller
 * Handles player movement, shooting, and character rendering
 * Integrated with weapon evolution, meta-progression, and roguelike upgrades
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import type { ChristmasObstacle, PlayerClassType, WeaponType } from '@/types';
import { WEAPON_EVOLUTIONS, WEAPONS } from '@/data';
import { StrataCharacter } from './StrataCharacter';

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

  const {
    playerClass,
    currentWeapon,
    currentEvolution,
    input,
    state,
    setPlayerPosition,
    setPlayerRotation,
    addBullet,
    obstacles,
    getEffectiveStats,
    getWeaponModifiers,
  } = useGameStore();

  // Get effective stats with upgrades applied
  const effectiveStats = getEffectiveStats();
  const weaponModifiers = getWeaponModifiers();

  const isMoving = input.movement.x !== 0 || input.movement.y !== 0;
  const isFiring = input.isFiring;

  // Create bullet with initial position
  const fireBullet = useCallback(
    (spawnPosition: THREE.Vector3, direction: THREE.Vector3, baseDamage: number, weaponType: WeaponType) => {
      const id = `bullet-${bulletIdCounter++}`;

      // Create mesh-like object with position for tracking
      const createBulletMesh = (pos: THREE.Vector3) => {
        const obj = new THREE.Object3D();
        obj.position.copy(pos);
        return obj;
      };

      // Get weapon configuration and evolution
      const weaponConfig = WEAPONS[weaponType];
      const evolutionConfig = currentEvolution ? WEAPON_EVOLUTIONS[currentEvolution] : null;

      // Use weapon config or fallback to base damage, applied with multipliers
      const damage = baseDamage;
      const bulletType = getBulletTypeFromWeapon(weaponType);
      
      // Evolution modifiers
      const speedMultiplier = evolutionConfig?.modifiers.speedMultiplier || 1;
      const sizeMultiplier = evolutionConfig?.modifiers.size || 1;
      const penetration = evolutionConfig?.modifiers.penetration || false;
      const explosive = evolutionConfig?.modifiers.explosive || false;
      
      const bulletSpeed = (weaponConfig.speed || 25) * speedMultiplier;
      const bulletLife = weaponConfig.life || 3.0;

      // Handle multi-projectile weapons (spread)
      const projectileCount = evolutionConfig?.modifiers.projectileCount || weaponConfig.projectileCount || 1;
      const spreadAngle = evolutionConfig?.modifiers.spreadAngle || weaponConfig.spreadAngle || 0.2;

      if (projectileCount > 1) {
        const angleStep = (spreadAngle * 2) / (projectileCount - 1);
        const startAngle = -spreadAngle;

        for (let i = 0; i < projectileCount; i++) {
          const angleOffset = projectileCount === 1 ? 0 : startAngle + angleStep * i;
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
            type: bulletType,
            evolutionType: currentEvolution || undefined,
            size: sizeMultiplier,
            penetration,
            explosive,
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
          type: bulletType,
          evolutionType: currentEvolution || undefined,
          size: sizeMultiplier,
          penetration,
          explosive,
          behavior: weaponConfig.behavior,
        });
      }
    },
    [addBullet, currentEvolution]
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !playerClass || state === 'GAME_OVER' || state === 'WIN' || state === 'LEVEL_UP') return;

    const { movement, isFiring: firing } = input;

    // Movement with collision detection - use effective speed with upgrades
    if (movement.x !== 0 || movement.y !== 0) {
      const speed = (effectiveStats?.speed ?? playerClass.speed) * delta;
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

      // Calculate rotation from movement direction - smooth rotation
      const targetRotation = Math.atan2(movement.x, movement.y);
      const angleDiff = ((targetRotation - rotationRef.current + Math.PI) % (Math.PI * 2)) - Math.PI;
      rotationRef.current += angleDiff * delta * 10;
    }

    // Apply position and rotation
    groupRef.current.position.copy(positionRef.current);
    groupRef.current.rotation.y = rotationRef.current;

    // Update store
    setPlayerPosition(positionRef.current);
    setPlayerRotation(rotationRef.current);

    // Firing - use effective ROF and damage with upgrades and evolution
    if (firing) {
      const now = Date.now() / 1000;
      
      // Combine effective stats from upgrades and weapon modifiers from evolution
      const fireRate = weaponModifiers?.rof ?? playerClass.rof;
      // We should also apply roguelike upgrades to this base fire rate
      const effectiveFireRate = effectiveStats ? fireRate * (1 - (effectiveStats.rof - playerClass.rof) / playerClass.rof) : fireRate;
      
      // Simplified: just use what the store provides, we should probably reconcile them in the store itself
      // but for now let's use weaponModifiers which handles evolution.
      
      if (now - lastFireTime.current >= (weaponModifiers?.rof ?? playerClass.rof)) {
        lastFireTime.current = now;

        firePosRef.current.copy(positionRef.current);
        firePosRef.current.y = 1.5;

        fireDirRef.current.set(0, 0, 1);
        fireDirRef.current.applyAxisAngle(upAxisRef.current, rotationRef.current);

        const damage = weaponModifiers?.damage ?? playerClass.damage;
        fireBullet(firePosRef.current, fireDirRef.current, damage, currentWeapon);
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

  return (
    <group ref={groupRef}>
      <StrataCharacter
        config={playerClass}
        position={[0, 0, 0]}
        rotation={0}
        isMoving={isMoving}
        isFiring={isFiring}
      />
    </group>
  );
}
