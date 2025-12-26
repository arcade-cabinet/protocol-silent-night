/**
 * Bullet System
 * Handles rendering and physics for all projectiles
 * Each weapon type has distinct visual appearance
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import type { BulletData } from '@/types';

// Max bullets per type
const MAX_CANNON_BULLETS = 30;
const MAX_SMG_BULLETS = 60;
const MAX_STAR_BULLETS = 45;

// Reusable dummy object for matrix calculations
const dummy = new THREE.Object3D();
const zeroScale = new THREE.Vector3(0, 0, 0);

export function Bullets() {
  const cannonRef = useRef<THREE.InstancedMesh>(null);
  const smgRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.InstancedMesh>(null);
  
  const { updateBullets, enemies, damageEnemy, bossActive, damageBoss } =
    useGameStore();

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
    const time = state.clock.elapsedTime;
    
    if (!cannonRef.current || !smgRef.current || !starRef.current) return;

    const toRemove: string[] = [];

    // Update bullets and categorize by type
    updateBullets((currentBullets) => {
      const updatedBullets = currentBullets.map((bullet) => {
        const pos = (bullet.mesh as THREE.Object3D).position;
        pos.add(bullet.direction.clone().multiplyScalar(bullet.speed * delta));

        const newLife = bullet.life - delta;

        if (newLife <= 0 || pos.length() > 50) {
          toRemove.push(bullet.id);
          return { ...bullet, life: newLife };
        }

        // Collision with enemies
        if (!bullet.isEnemy) {
          for (const enemy of enemies) {
            const enemyPos = (enemy.mesh as THREE.Object3D)?.position;
            if (enemyPos) {
              const dist = pos.distanceTo(enemyPos);
              // Collision radius varies by bullet type
              const hitRadius = bullet.type === 'cannon' ? 1.8 : bullet.type === 'stars' ? 1.6 : 1.4;
              if (dist < hitRadius) {
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

      const activeBullets = updatedBullets.filter((b) => !toRemove.includes(b.id));

      // Categorize bullets by type
      const cannonBullets: BulletData[] = [];
      const smgBullets: BulletData[] = [];
      const starBullets: BulletData[] = [];

      for (const bullet of activeBullets) {
        if (bullet.type === 'cannon' || (!bullet.type && bullet.damage >= 30)) {
          cannonBullets.push(bullet);
        } else if (bullet.type === 'smg' || (!bullet.type && bullet.damage < 15)) {
          smgBullets.push(bullet);
        } else {
          starBullets.push(bullet);
        }
      }

      // Update Cannon bullets
      for (let i = 0; i < MAX_CANNON_BULLETS; i++) {
        if (i < cannonBullets.length) {
          const bullet = cannonBullets[i];
          const pos = (bullet.mesh as THREE.Object3D).position;
          dummy.position.copy(pos);
          dummy.rotation.set(time * 3, time * 2, time * 4); // Tumbling coal
          dummy.scale.setScalar(1 + Math.sin(time * 10) * 0.1); // Pulsing
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.scale.copy(zeroScale);
        }
        dummy.updateMatrix();
        cannonRef.current!.setMatrixAt(i, dummy.matrix);
      }
      cannonRef.current!.instanceMatrix.needsUpdate = true;

      // Update SMG bullets
      for (let i = 0; i < MAX_SMG_BULLETS; i++) {
        if (i < smgBullets.length) {
          const bullet = smgBullets[i];
          const pos = (bullet.mesh as THREE.Object3D).position;
          dummy.position.copy(pos);
          // Align with direction of travel
          dummy.lookAt(pos.clone().add(bullet.direction));
          dummy.scale.set(1, 1, 1.5); // Elongated for motion blur effect
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.scale.copy(zeroScale);
        }
        dummy.updateMatrix();
        smgRef.current!.setMatrixAt(i, dummy.matrix);
      }
      smgRef.current!.instanceMatrix.needsUpdate = true;

      // Update Star bullets
      for (let i = 0; i < MAX_STAR_BULLETS; i++) {
        if (i < starBullets.length) {
          const bullet = starBullets[i];
          const pos = (bullet.mesh as THREE.Object3D).position;
          dummy.position.copy(pos);
          dummy.rotation.set(0, 0, time * 15); // Fast spin
          dummy.scale.setScalar(1);
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.scale.copy(zeroScale);
        }
        dummy.updateMatrix();
        starRef.current!.setMatrixAt(i, dummy.matrix);
      }
      starRef.current!.instanceMatrix.needsUpdate = true;

      return activeBullets;
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
