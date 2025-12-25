/**
 * Player Controller
 * Handles player movement, shooting, and character rendering
 */

import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { SantaCharacter } from './SantaCharacter';
import { ElfCharacter } from './ElfCharacter';
import { BumbleCharacter } from './BumbleCharacter';
import type { PlayerClassType } from '@/types';

let bulletIdCounter = 0;

export function PlayerController() {
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTime = useRef(0);
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);

  const {
    playerClass,
    input,
    state,
    setPlayerPosition,
    setPlayerRotation,
    addBullet,
  } = useGameStore();

  const isMoving = input.movement.x !== 0 || input.movement.y !== 0;
  const isFiring = input.isFiring;

  // Create bullet
  const fireBullet = useCallback(
    (_position: THREE.Vector3, direction: THREE.Vector3, damage: number) => {
      const id = `bullet-${bulletIdCounter++}`;

      // For star weapon, create spread pattern
      if (playerClass?.weaponType === 'star') {
        const angles = [-0.2, 0, 0.2];
        for (const angleOffset of angles) {
          const spreadDir = direction.clone();
          spreadDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);

          addBullet({
            id: `${id}-${angleOffset}`,
            mesh: null as unknown as THREE.Object3D,
            velocity: spreadDir.clone().multiplyScalar(30),
            hp: 1,
            maxHp: 1,
            isActive: true,
            direction: spreadDir,
            isEnemy: false,
            damage,
            life: 2.0,
            speed: 30,
          });
        }
      } else {
        addBullet({
          id,
          mesh: null as unknown as THREE.Object3D,
          velocity: direction.clone().multiplyScalar(30),
          hp: 1,
          maxHp: 1,
          isActive: true,
          direction,
          isEnemy: false,
          damage,
          life: 2.0,
          speed: 30,
        });
      }
    },
    [playerClass, addBullet]
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !playerClass || state === 'GAME_OVER' || state === 'WIN') return;

    const { movement, isFiring: firing } = input;

    // Movement
    if (movement.x !== 0 || movement.y !== 0) {
      const speed = playerClass.speed * delta;
      const moveDir = new THREE.Vector3(movement.x, 0, movement.y).normalize();

      positionRef.current.add(moveDir.multiplyScalar(speed));

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

    // Update store (throttled)
    setPlayerPosition(positionRef.current);
    setPlayerRotation(rotationRef.current);

    // Firing
    if (firing) {
      const now = Date.now() / 1000;
      if (now - lastFireTime.current >= playerClass.rof) {
        lastFireTime.current = now;

        const firePos = positionRef.current.clone();
        firePos.y = 1.5;

        const fireDir = new THREE.Vector3(0, 0, 1);
        fireDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationRef.current);

        fireBullet(firePos, fireDir, playerClass.damage);
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
