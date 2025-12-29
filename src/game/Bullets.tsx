/**
 * Bullet System
 * Handles rendering and physics for all projectiles
 * Each weapon type has distinct visual appearance
 */

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '@/data';
import { useGameStore } from '@/store/gameStore';
import type { BulletData, WeaponType } from '@/types';

// Max bullets per type from config
const MAX_CANNON_BULLETS = CONFIG.BULLET_LIMITS.CANNON;
const MAX_SMG_BULLETS = CONFIG.BULLET_LIMITS.SMG;
const MAX_STAR_BULLETS = CONFIG.BULLET_LIMITS.STAR;

// Reusable dummy object for matrix calculations
const dummy = new THREE.Object3D();
const zeroScale = new THREE.Vector3(0, 0, 0);

// Map weapon types to visual categories
function getVisualType(weaponType: WeaponType | undefined): 'cannon' | 'smg' | 'star' {
  switch (weaponType) {
    case 'cannon':
    case 'ornament':
    case 'snowball':
      return 'cannon';
    case 'smg':
    case 'light_string':
      return 'smg';
    default:
      return 'star';
  }
}

export function Bullets() {
  const cannonRef = useRef<THREE.InstancedMesh>(null);
  const smgRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.InstancedMesh>(null);
  const tempVecRef = useRef(new THREE.Vector3());
  const lookAtVecRef = useRef(new THREE.Vector3());

  // Optimization: Select only stable actions
  const updateBullets = useGameStore((state) => state.updateBullets);
  const damageEnemy = useGameStore((state) => state.damageEnemy);
  const damageBoss = useGameStore((state) => state.damageBoss);

  // Coal Cannon geometry - large glowing coal chunk
  const cannonGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.35, 0);
    return geo;
  }, []);

  const cannonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x331100,
        emissive: 0xff4400,
        emissiveIntensity: 2,
        roughness: 0.3,
        metalness: 0.2,
      }),
    []
  );

  // Plasma SMG geometry - small fast energy bolts
  const smgGeometry = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.08, 0.25, 4, 8);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const smgMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  // Star Thrower geometry - spinning star projectiles
  const starGeometry = useMemo(() => {
    const starShape = new THREE.Shape();
    const outerRadius = 0.2;
    const innerRadius = 0.08;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();

    const geo = new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: false });
    geo.center();
    return geo;
  }, []);

  const starMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.9,
      }),
    []
  );

  useFrame((state, delta) => {
    // Optimization: Access transient state directly to avoid re-renders
    const { state: gameState, bullets, enemies, bossActive } = useGameStore.getState();

    if (
      gameState === 'LEVEL_UP' ||
      gameState === 'MENU' ||
      gameState === 'BRIEFING' ||
      gameState === 'GAME_OVER' ||
      gameState === 'WIN'
    )
      return;

    const time = state.clock.elapsedTime;

    if (!cannonRef.current || !smgRef.current || !starRef.current) return;

    // Optimization: Mutate bullets in place and only update store for removals
    const toRemove: string[] = [];
    const activeBullets: BulletData[] = [];

    // Iterate over bullets directly from store state (which is mutable if not freezed)
    // Note: We are mutating the properties of objects inside the array, but not the array itself
    // unless we call set()
    for (const bullet of bullets) {
      const pos = (bullet.mesh as THREE.Object3D).position;
      tempVecRef.current.copy(bullet.direction).multiplyScalar(bullet.speed * delta);
      pos.add(tempVecRef.current);

      bullet.life -= delta;

      if (bullet.life <= 0 || pos.length() > 50) {
        toRemove.push(bullet.id);
        continue; // Skip collision check if dead
      }

      let hit = false;
      // Collision with enemies
      if (!bullet.isEnemy) {
        for (const enemy of enemies) {
          const enemyPos = (enemy.mesh as THREE.Object3D)?.position;
          if (enemyPos) {
            const dist = pos.distanceTo(enemyPos);
            // Collision radius varies by visual type and scale
            const visualType = getVisualType(bullet.type);
            const sizeScale = bullet.size || 1;
            const baseRadius = visualType === 'cannon' ? 1.8 : visualType === 'star' ? 1.6 : 1.4;
            const hitRadius = baseRadius * sizeScale;

            if (dist < hitRadius) {
              if (enemy.type === 'boss' && bossActive) {
                damageBoss(bullet.damage);
              } else {
                damageEnemy(enemy.id, bullet.damage);
              }

              // Penetration check
              if (!bullet.penetration) {
                toRemove.push(bullet.id);
                hit = true;
                break;
              }
            }
          }
        }
      }

      if (!hit) {
        activeBullets.push(bullet);
      }
    }

    // Only update store if bullets were removed
    if (toRemove.length > 0) {
      updateBullets((current) => current.filter((b) => !toRemove.includes(b.id)));
    }

    // Categorize bullets by visual type for rendering
    // We use the local activeBullets list which reflects current positions
    const cannonBullets: BulletData[] = [];
    const smgBullets: BulletData[] = [];
    const starBullets: BulletData[] = [];

    for (const bullet of activeBullets) {
      const visualType = getVisualType(bullet.type);
      if (visualType === 'cannon') {
        cannonBullets.push(bullet);
      } else if (visualType === 'smg') {
        smgBullets.push(bullet);
      } else {
        starBullets.push(bullet);
      }
    }

    // Helper to update instanced mesh
    const updateInstanceMesh = (
      ref: React.RefObject<THREE.InstancedMesh | null>,
      bullets: BulletData[],
      maxCount: number,
      updateLogic: (bullet: BulletData, dummy: THREE.Object3D) => void
    ) => {
      if (!ref.current || typeof ref.current.setMatrixAt !== 'function') return;
      for (let i = 0; i < maxCount; i++) {
        if (i < bullets.length) {
          const bullet = bullets[i];
          const pos = (bullet.mesh as THREE.Object3D).position;
          dummy.position.copy(pos);
          updateLogic(bullet, dummy);
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.scale.copy(zeroScale);
        }
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      }
      ref.current.instanceMatrix.needsUpdate = true;
    };

    // Update Cannon bullets
    updateInstanceMesh(cannonRef, cannonBullets, MAX_CANNON_BULLETS, (bullet, d) => {
      d.rotation.set(time * 3, time * 2, time * 4); // Tumbling coal
      const baseScale = 1 + Math.sin(time * 10) * 0.1;
      const sizeMultiplier = bullet.size || 1;
      d.scale.setScalar(baseScale * sizeMultiplier);
    });

    // Update SMG bullets
    updateInstanceMesh(smgRef, smgBullets, MAX_SMG_BULLETS, (bullet, d) => {
      lookAtVecRef.current.copy((bullet.mesh as THREE.Object3D).position).add(bullet.direction);
      d.lookAt(lookAtVecRef.current);
      const sizeMultiplier = bullet.size || 1;
      d.scale.set(sizeMultiplier, sizeMultiplier, 1.5 * sizeMultiplier);
    });

    // Update Star bullets
    updateInstanceMesh(starRef, starBullets, MAX_STAR_BULLETS, (bullet, d) => {
      d.rotation.set(0, 0, time * 15); // Fast spin
      const sizeMultiplier = bullet.size || 1;
      d.scale.setScalar(sizeMultiplier);
    });
  });

  return (
    <group>
      {/* Coal Cannon projectiles - large glowing coals */}
      <instancedMesh
        ref={cannonRef}
        args={[cannonGeometry, cannonMaterial, MAX_CANNON_BULLETS]}
        frustumCulled={false}
      />

      {/* Plasma SMG projectiles - fast energy bolts */}
      <instancedMesh
        ref={smgRef}
        args={[smgGeometry, smgMaterial, MAX_SMG_BULLETS]}
        frustumCulled={false}
      />

      {/* Star Thrower projectiles - spinning stars */}
      <instancedMesh
        ref={starRef}
        args={[starGeometry, starMaterial, MAX_STAR_BULLETS]}
        frustumCulled={false}
      />

      {/* Global bullet glow light */}
      <pointLight color={0xffaa44} intensity={0.3} distance={10} position={[0, 2, 0]} />
    </group>
  );
}
