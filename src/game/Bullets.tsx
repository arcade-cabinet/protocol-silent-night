/**
 * Bullet System
 * Handles rendering and physics for all projectiles
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';

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
    const dummy = new THREE.Object3D();

    // Update bullet positions and check collisions
    updateBullets((currentBullets) => {
      return currentBullets
        .map((bullet, index) => {
          // Get bullet position (initialized when bullet was created)
          const pos = (bullet.mesh as unknown as { position: THREE.Vector3 }).position;
          pos.add(bullet.direction.clone().multiplyScalar(bullet.speed * delta));

          // Update instance matrix
          dummy.position.copy(pos);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(index, dummy.matrix);

          // Decrease life
          const newLife = bullet.life - delta;

          // Check if out of bounds or expired
          if (newLife <= 0 || pos.length() > 50) {
            toRemove.push(bullet.id);
            return bullet;
          }

          // Collision with enemies (for player bullets)
          if (!bullet.isEnemy) {
            for (const enemy of enemies) {
              const enemyPos = (enemy.mesh as unknown as { position?: THREE.Vector3 })?.position;
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
        })
        .filter((b) => !toRemove.includes(b.id));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Max bullets to render
  const maxBullets = 100;

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, maxBullets]} frustumCulled={false}>
      {/* Emissive glow */}
      <pointLight color={CONFIG.COLORS.BULLET_PLAYER} intensity={0.5} distance={3} />
    </instancedMesh>
  );
}
