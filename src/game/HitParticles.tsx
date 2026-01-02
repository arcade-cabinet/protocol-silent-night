/**
 * Hit Particles Component
 * Shows particles when enemies are damaged
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  color: number;
}

// Maximum particles to display
const MAX_PARTICLES = 50;

// Reusable objects
const dummy = new THREE.Object3D();

let particleIdCounter = 0;

export function HitParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastKillsRef = useRef(0);

  const { stats, bossHp } = useGameStore();
  const lastBossHpRef = useRef(bossHp);
  const tempVecRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const { state: gameState } = useGameStore.getState();
    if (
      gameState === 'LEVEL_UP' ||
      gameState === 'MENU' ||
      gameState === 'BRIEFING' ||
      gameState === 'GAME_OVER' ||
      gameState === 'WIN'
    )
      return;

    // Check for new kill (enemy death particle burst)
    if (stats.kills > lastKillsRef.current) {
      lastKillsRef.current = stats.kills;
      // Spawn hit particles at a random position (since we don't track exact hit location)
      const playerPos = useGameStore.getState().playerPosition;
      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 5;
      const hitPos = tempVecRef.current.set(
        playerPos.x + Math.cos(angle) * dist,
        1,
        playerPos.z + Math.sin(angle) * dist
      );
      spawnParticles(particlesRef.current, hitPos, 0x00ff00, 6);
    }

    // Check for boss damage
    if (bossHp < lastBossHpRef.current) {
      const bossEnemy = useGameStore.getState().enemies.find((e) => e.type === 'boss');
      if (bossEnemy) {
        const bossPos = tempVecRef.current.copy(bossEnemy.mesh.position);
        bossPos.y = 4;
        spawnParticles(particlesRef.current, bossPos, 0xff0044, 8);
      }
      lastBossHpRef.current = bossHp;
    }

    // Update particles
    const particles = particlesRef.current;
    const activeParticles: Particle[] = [];
    const tempVec = tempVecRef.current;

    for (const p of particles) {
      p.life -= delta;
      if (p.life > 0) {
        // Apply velocity and gravity
        tempVec.copy(p.velocity).multiplyScalar(delta);
        p.position.add(tempVec);
        p.velocity.y -= 15 * delta; // Gravity
        activeParticles.push(p);
      }
    }

    particlesRef.current = activeParticles;

    // Update instanced mesh
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (i < activeParticles.length) {
        const p = activeParticles[i];
        dummy.position.copy(p.position);
        const scale = p.life * 0.5; // Shrink as life decreases
        dummy.scale.set(scale, scale, scale);
      } else {
        dummy.position.set(0, -1000, 0);
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 6, 6]} />
      <meshBasicMaterial color={0x00ff00} transparent opacity={0.8} />
    </instancedMesh>
  );
}

function spawnParticles(
  particles: Particle[],
  position: THREE.Vector3,
  color: number,
  count: number
) {
  // Limit total particles
  while (particles.length + count > MAX_PARTICLES) {
    particles.shift();
  }

  for (let i = 0; i < count; i++) {
    particles.push({
      id: particleIdCounter++,
      position: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 10
      ),
      life: 0.5 + Math.random() * 0.5,
      color,
    });
  }
}
