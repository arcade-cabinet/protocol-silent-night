/**
 * Bullet System
 * Handles rendering and physics for all projectiles
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';

// Max bullets to render
const MAX_BULLETS = 100;

// Reusable dummy object for matrix calculations
const dummy = new THREE.Object3D();
// Scale to zero for hiding unused instances
const zeroScale = new THREE.Vector3(0, 0, 0);
const normalScale = new THREE.Vector3(1, 1, 1);

export function Bullets() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { updateBullets, enemies, damageEnemy, bossActive, damageBoss } =
    useGameStore();

  // Geometry and material for player bullets
  const geometry = useMemo(() => new THREE.SphereGeometry(0.25, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.BULLET_PLAYER,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const toRemove: string[] = [];

    // First pass: update positions, check collisions, mark for removal
    updateBullets((currentBullets) => {
      const updatedBullets = currentBullets.map((bullet) => {
        // Get bullet position and update it
        const pos = (bullet.mesh as THREE.Object3D).position;
        pos.add(bullet.direction.clone().multiplyScalar(bullet.speed * delta));

        // Decrease life
        const newLife = bullet.life - delta;

        // Check if out of bounds or expired
        if (newLife <= 0 || pos.length() > 50) {
          toRemove.push(bullet.id);
          return { ...bullet, life: newLife };
        }

        // Collision with enemies (for player bullets)
        if (!bullet.isEnemy) {
          for (const enemy of enemies) {
            const enemyPos = (enemy.mesh as THREE.Object3D)?.position;
            if (enemyPos) {
              const dist = pos.distanceTo(enemyPos);
              if (dist < 1.5) {
                if (enemy.type === 'boss' && bossActive) {
                  damageBoss(bullet.damage);
                } else {
                  damageEnemy(enemy.id, bullet.damage);
                }
                toRemove.push(bullet.id);
                break;
              }
            }
          }
        }

        return { ...bullet, life: newLife };
      });

      // Filter out removed bullets
      const activeBullets = updatedBullets.filter((b) => !toRemove.includes(b.id));

      // Update instance matrices for active bullets only
      for (let i = 0; i < MAX_BULLETS; i++) {
        if (i < activeBullets.length) {
          const bullet = activeBullets[i];
          const pos = (bullet.mesh as THREE.Object3D).position;
          dummy.position.copy(pos);
          dummy.scale.copy(normalScale);
        } else {
          // Hide unused instances by scaling to zero
          dummy.position.set(0, -1000, 0);
          dummy.scale.copy(zeroScale);
        }
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }

      return activeBullets;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, MAX_BULLETS]} frustumCulled={false}>
      {/* Emissive glow */}
      <pointLight color={CONFIG.COLORS.BULLET_PLAYER} intensity={0.5} distance={3} />
    </instancedMesh>
  );
}
